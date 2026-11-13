"""레슨 Markdown에서 Google Colab 노트북을 만든다.

    python tools/make_colab.py          # colab/ 아래 노트북을 다시 만든다 (같은 입력이면 같은 결과)

원천 Markdown은 읽기만 한다. lessons/week-2/day-10.md -> colab/lessons/week-2/day-10.ipynb
"""
import re
import shutil
from pathlib import Path

import nbformat
from nbformat.v4 import new_code_cell, new_markdown_cell, new_notebook

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "colab"
REPO_URL = "https://github.com/evansuhohyun-927/neurodegeneration-bioinformatics/blob/main/"
SOURCES = (
    [f"lessons/week-{i}/*.md" for i in range(7)]
    + ["lessons/supplement/*.md"]
    + [f"lessons/advanced/{p}-*/*.md" for p in "ACDEGH"]  # B(MATLAB)는 Colab에서 실행 불가라 제외
    + ["crash-course/*.md"]
)
SKIP_SECTIONS = ("퀴즈", "체크리스트")

# import 이름 -> Colab 기본 런타임에 없어 설치해야 하는 pip 패키지
PIP = {"rdkit": "rdkit", "nilearn": "nilearn", "nibabel": "nibabel", "wfdb": "wfdb",
       "pywt": "PyWavelets", "lifelines": "lifelines", "esm": "fair-esm"}
BIOC = ("DESeq2", "limma", "SummarizedExperiment")

# 내 컴퓨터(터미널·conda·git·외부 도구)에서만 의미 있는 bash 블록, R의 renv 프로젝트 명령
LOCAL_ONLY = re.compile(r"\b(conda|git|jupyter|fmriprep|randomise|Miniforge)\b|~/|^\s*cd\b|open -e|wget -r", re.M)
LOCAL_ONLY_R = re.compile(r"\brenv::(init|snapshot|restore)\b")

# 다른 날 레슨의 산출물이 필요한 블록: (레슨 경로, 코드에 들어 있는 문자열) -> 안내할 날
# (로컬 실행 검증에서 FileNotFoundError가 난 블록을 보고 채움)
W3 = "lessons/week-3/"
NEEDS_OUTPUT_OF = {
    (W3 + "day-16.md", "Day 15를 먼저"): "Day 15",
    (W3 + "day-17.md", '"counts_raw.csv"'): "Day 15–16",
    (W3 + "day-18.md", '"log2_norm.csv"'): "Day 15–17",
    (W3 + "day-19.md", '"log2_norm.csv"'): "Day 15–18",
    (W3 + "day-20.md", '"de_table.csv"'): "Day 15–18",
    (W3 + "day-21.md", '"pathway_table.csv"'): "Day 15–20",
    ("lessons/week-4/day-25.md", "file_list.csv"): "Day 24(PADS 데이터 내려받기)",
}
# 첫 줄이 "# a5_data.R"처럼 파일 이름이고 뒤 블록이 source()로 부르는 R 블록은 그 파일로 저장한다
R_DATA_FILE = re.compile(r"^#\s*([\w.-]+\.R)\b")

SETUP_PY = ('# 레슨 코드가 쓰는 폴더를 미리 만든다 (Colab에서는 /content 아래에 생긴다)\n'
            'import os\n'
            'for d in ["data", "figures", "reports", "results", "../data", "../figures", "../reports"]:\n'
            '    os.makedirs(d, exist_ok=True)')

FENCE = re.compile(r"^([ \t]*)(`{3,})([A-Za-z0-9_+-]*)\s*$")
HEADING = re.compile(r"^(#{1,6})\s+(.*)$")


def parse(text):
    """Markdown을 ('h', level, title) / ('p', text) / ('code', lang, body) 조각으로 나눈다."""
    lines = text.splitlines()
    items, para, i = [], [], 0

    def flush():
        if para:
            items.append(("p", "\n".join(para).strip()))
            para.clear()

    while i < len(lines):
        line = lines[i]
        m = FENCE.match(line)
        if m:
            flush()
            indent, ticks, lang = m.groups()
            body, i = [], i + 1
            while i < len(lines) and not re.match(rf"^[ \t]*{ticks}\s*$", lines[i]):
                body.append(lines[i][len(indent):] if lines[i].startswith(indent) else lines[i].lstrip())
                i += 1
            items.append(("code", lang.lower(), "\n".join(body).strip("\n")))
        elif HEADING.match(line):
            flush()
            h = HEADING.match(line)
            items.append(("h", len(h.group(1)), h.group(2).strip()))
        elif line.strip():
            para.append(line.strip() if not para else line.rstrip())
        else:
            flush()
        i += 1
    flush()
    return items


def commented(body):
    return "# 내 컴퓨터용 명령입니다. Colab에서는 의미가 없어 실행하지 않도록 주석 처리했습니다.\n" + \
        "\n".join("# " + l if l.strip() else "#" for l in body.splitlines())


def code_source(lang, body, all_code):
    if lang == "bash":  # 여러 줄·heredoc·cd가 한 셸에서 이어지도록 줄마다 ! 대신 %%bash
        return commented(body) if LOCAL_ONLY.search(body) else "%%bash\n" + body
    if lang == "r":
        if LOCAL_ONLY_R.search(body):
            return commented(body)
        m = R_DATA_FILE.match(body)
        if m and f'source("{m.group(1)}")' in all_code:
            return (f"# 레슨처럼 아래 코드를 {m.group(1)} 파일로 저장한 뒤 불러온다 (뒤 셀들이 source()로 다시 부른다)\n"
                    f'writeLines(r"---(\n{body}\n)---", "{m.group(1)}")\nsource("{m.group(1)}")')
    return body


def build(md_path):
    rel = md_path.relative_to(ROOT).as_posix()
    items = parse(md_path.read_text(encoding="utf-8"))
    langs = {it[1] for it in items if it[0] == "code"}
    kind = "python" if "python" in langs else "r" if "r" in langs else None
    if kind is None:
        return None, "Python/R 코드 블록 없음"

    title = next((it[2] for it in items if it[0] == "h" and it[1] == 1), md_path.stem)
    cells = [new_markdown_cell(
        f"# {title}\n\n"
        "설명은 학습 사이트(또는 원본 레슨)에서 읽고, 코드는 이 노트북에서 위에서 아래로 차례대로 실행하세요. "
        "앞 셀이 만든 변수와 파일을 뒤 셀이 씁니다.\n\n"
        f"원본 레슨: [{rel}]({REPO_URL}{rel})")]

    code_text = "\n".join(it[2] for it in items if it[0] == "code" and it[1] == kind)
    if kind == "python":
        pkgs = sorted({PIP[m] for m in PIP if re.search(rf"^\s*(from|import(\s+[\w.]+\s*,)*)\s+{m}\b", code_text, re.M)})
        if pkgs:
            cells.append(new_code_cell("# Colab 기본 런타임에 없는 패키지 설치\n%pip install -q " + " ".join(pkgs)))
        cells.append(new_code_cell(SETUP_PY))
    else:
        bioc = [p for p in BIOC if re.search(rf"\b{p}\b", code_text)]
        if bioc:
            cells.append(new_code_cell(
                "# Colab 기본 R 런타임에 없는 Bioconductor 패키지 설치 (몇 분 걸립니다)\n"
                'if (!requireNamespace("BiocManager", quietly = TRUE)) install.packages("BiocManager")\n'
                f"BiocManager::install(c({', '.join(repr(p).replace(chr(39), chr(34)) for p in bioc)}), update = FALSE, ask = FALSE)"))

    headings, prev, skipping = [], None, False
    for it in items:
        if it[0] == "h":
            if it[1] <= 2:
                skipping = any(s in it[2] for s in SKIP_SECTIONS)
                headings = [it] if it[1] == 2 else []
            else:
                headings = [h for h in headings if h[1] < it[1]] + [it]
            prev = None
            continue
        if skipping:
            continue
        if it[0] == "p":
            prev = it[1]
            continue
        lang, body = it[1], it[2]
        if lang == kind or (lang == "bash" and kind == "python"):
            md = "\n\n".join("#" * h[1] + " " + h[2] for h in headings)
            headings = []  # 소제목은 처음 나올 때 한 번만
            if prev and not prev.startswith("<"):
                md = (md + "\n\n" + prev).strip()
            if md:
                cells.append(new_markdown_cell(md))
            src = code_source(lang, body, code_text)
            for (lesson, needle), day in NEEDS_OUTPUT_OF.items():
                if lesson == rel and needle in body:
                    src = (f"# 이 셀은 {day}의 산출물 파일이 필요합니다. Colab은 노트북마다 런타임이 따로라서,\n"
                           "# 그 파일을 이 런타임에 업로드하거나 Google Drive에 두고 경로를 맞추세요.\n" + src)
            cells.append(new_code_cell(src))
        prev = None

    nb = new_notebook(cells=cells)
    for n, c in enumerate(nb.cells):
        c.id = f"cell-{n:03d}"  # 재실행해도 같은 파일이 나오도록 고정 id
    nb.metadata = {
        "colab": {"provenance": []},
        "kernelspec": ({"name": "python3", "display_name": "Python 3", "language": "python"} if kind == "python"
                       else {"name": "ir", "display_name": "R", "language": "R"}),
        "language_info": {"name": kind if kind == "python" else "R"},
    }
    return nb, kind


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    made, skipped = [], []
    for pattern in SOURCES:
        for md in sorted(ROOT.glob(pattern)):
            if md.name.startswith("_") or md.name == "README.md":
                continue
            nb, info = build(md)
            rel = md.relative_to(ROOT)
            if nb is None:
                skipped.append((rel.as_posix(), info))
                continue
            dest = OUT / rel.with_suffix(".ipynb")
            dest.parent.mkdir(parents=True, exist_ok=True)
            nbformat.validate(nb)
            nbformat.write(nb, dest)
            made.append((rel.as_posix(), info))
    print(f"노트북 {len(made)}개 생성 (python {sum(k == 'python' for _, k in made)}, r {sum(k == 'r' for _, k in made)})")
    for rel, why in skipped:
        print(f"  건너뜀: {rel} — {why}")


if __name__ == "__main__":
    main()
