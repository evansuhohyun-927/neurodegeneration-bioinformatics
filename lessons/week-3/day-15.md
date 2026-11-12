# Day 15 — 데이터를 받아 오고 출처(provenance)를 기록하기

> **주차:** 3주차 · **예상 시간:** 75–90분 · **산출물:** `data/README.md`

## 오늘의 목표
- OSD-536에서 어떤 파일이 제공되는지 직접 확인하고 내려받을 수 있다.
- 파일 이름, 버전, 다운로드 날짜, 체크섬, 인용 정보를 `data/README.md`에 기록할 수 있다.
- 실제 데이터와 같은 모양의 연습용 가상 데이터를 만들어 둘 수 있다.

## 🎬 영상으로 먼저 보기
- [Python Tutorial: File Objects - Reading and Writing to Files — Corey Schafer](https://www.youtube.com/watch?v=Uh2ebFW8OYM) (24:33)
- **무엇에 주목할까:** 오늘은 파일을 "내려받고, 열고, 기록을 남기는" 날입니다. `with open(...)`으로 파일을 열면 왜 안전하게 닫히는지, 읽기 모드(`"r"`)와 쓰기 모드(`"w"`)가 어떻게 다른지만 잡으면 충분합니다. 앞 12분 정도만 봐도 됩니다.
- [NASA OSDR(GeneLab) 데이터 저장소 사용법 — YouTube 검색 링크](https://www.youtube.com/results?search_query=NASA+GeneLab+Open+Science+Data+Repository+tutorial) (검색 링크)
- **무엇에 주목할까:** 확인된 특정 영상이 아니라 검색 결과입니다. study 페이지에서 Description, Samples, Assays, Files 탭이 어디에 있는지 보여 주는 영상을 하나 골라 훑어보세요.

## 개념 설명

### provenance는 실험 노트의 "시약 lot 번호"다

실험실에서 항체를 쓰면 제조사, 카탈로그 번호, lot 번호를 실험 노트에 적습니다. 석 달 뒤 결과가 재현되지 않을 때 "그때 쓴 항체가 뭐였지?"에 답하기 위해서입니다. 데이터 분석에서 같은 역할을 하는 것이 **provenance(출처 기록)** 입니다. 어디서(URL), 언제(다운로드 날짜), 무엇을(파일 이름과 크기), 어떤 판본으로(버전) 받았는지를 적어 둡니다. 공개 저장소의 데이터는 고정된 것처럼 보이지만 메타데이터가 수정되거나 파일이 추가되기도 합니다. 그래서 "OSD-536을 썼다"만으로는 부족하고, "2026년 11월 12일에 받은 이 13개 파일"처럼 구체적으로 적어야 합니다. 오늘 만드는 `data/README.md`는 이번 주 내내, 그리고 Day 21 보고서의 "데이터" 절에서 그대로 다시 쓰입니다.

### 체크섬은 파일의 지문이다

파일이 온전히 내려받아졌는지, 나중에 누가 실수로 고치지 않았는지는 눈으로 확인할 수 없습니다. **체크섬(checksum)** 은 파일 내용 전체를 넣으면 짧은 문자열이 나오는 계산입니다. 내용이 한 글자만 달라져도 전혀 다른 문자열이 나오므로 지문처럼 쓸 수 있습니다. 이 코스에서는 SHA-256이라는 방식을 씁니다. 원리를 알 필요는 없고, "같은 파일이면 같은 값, 다른 파일이면 다른 값"만 기억하면 됩니다. 원본(raw) 파일은 받은 뒤 절대 손으로 고치지 않고, 가공한 결과는 항상 다른 폴더(`processed/`)에 저장합니다. 원본 조직 블록은 냉동고에 그대로 두고 절편만 꺼내 쓰는 것과 같습니다.

### OSD-536에는 실제로 무엇이 있는가

아래는 2026-11-12에 OSDR 공개 API(`https://osdr.nasa.gov/osdr/data/osd/files/536`, `.../meta/536`)와 내려받은 파일을 직접 열어 확인한 내용입니다. 여러분이 받는 날에는 달라졌을 수 있으니 예시 2의 코드로 다시 확인하세요.

- **제목:** Gene expression profiling for spaceflight induced-neuroinflammation in the mouse brain
- **assay:** RNA-seq이 아니라 **패널 기반** 측정입니다. NanoString nCounter Neuroinflammation 패널(파일 안 표기 `NS_Mm_NeuroInflam_v1.0`)로, 정해진 유전자 목록만 셉니다. 파일 하나에 Endogenous(측정 대상) 757개, Housekeeping 13개, Positive 대조 6개, Negative 대조 8개 행이 있습니다.
- **군과 표본 수:** Space Flight 6마리, Ground Control 6마리(총 12). 10주령 수컷 C57BL/6J, SpaceX-12(RR-9) 35일 임무, 뇌 조직.
- **파일 13개:** 샘플별 원시 파일 `*.RCC.gz` 12개와 메타데이터 묶음 `OSD-536_metadata_OSD-536-ISA.zip` 1개. 정규화된 발현 행렬이나 차등발현 결과 표는 **제공되지 않습니다.** 그래서 이번 주에는 RCC 파일에서 직접 행렬을 만듭니다.
- **연결 정보:** study DOI `10.26030/bg5q-t229`, GEO `GSE186278`, 논문 Holley JM 외, "Characterization of gene expression profiles in the mouse brain after 35 days of spaceflight mission" (DOI `10.1038/s41526-022-00217-4`, PMID 35948598).
- **확인하지 못한 것:** 데이터 라이선스 문구는 API 응답과 ISA 파일에서 찾지 못했습니다. study 페이지와 NASA OSDR의 데이터 이용 정책 페이지에서 직접 확인해 README에 옮겨 적으세요.

한 가지 더. 메타데이터의 "Study Design Type"에는 "transcription profiling by high throughput sequencing"이라고 적혀 있지만 실제 파일과 프로토콜 설명은 nCounter입니다. 메타데이터도 사람이 입력한 것이라 서로 어긋날 수 있습니다. 이런 불일치를 발견하면 고치지 말고 README에 "발견한 점"으로 적습니다.

## 예시로 이해하기

### 예시 1 — 연습용 가상 데이터 만들기

실제 데이터를 건드리기 전에 같은 모양의 작은 가상 데이터로 연습합니다. 아래 코드는 12개 샘플 × 60개 가상 유전자(`Prac01`–`Prac60`)를 실제 RCC 파일과 같은 형식으로 저장합니다. 숫자는 모두 지어낸 것이므로 생물학적 의미가 없습니다. 노트북은 `notebooks/` 폴더 안에서 실행한다고 가정합니다(그래서 경로가 `../data/...`입니다).

```python
import gzip
from pathlib import Path
import numpy as np
import pandas as pd

rng = np.random.default_rng(536)
out = Path("../data/osdr_536_practice")
out.mkdir(parents=True, exist_ok=True)

sources = [f"F{i}" for i in range(1, 7)] + [f"GC{i}" for i in range(1, 7)]
conditions = ["Space Flight"] * 6 + ["Ground Control"] * 6
genes = [f"Prac{i:02d}" for i in range(1, 61)]

base = rng.uniform(4, 11, size=60)      # 유전자별 기본 발현량(log2)
effect = np.zeros(60)                   # 비행군에서의 가상 변화량(log2)
effect[0:6] = -0.9      # Prac01–06 감소
effect[20:25] = -0.7    # Prac21–25 감소
effect[30:34] = -0.8    # Prac31–34 감소
effect[40:42] = 0.8     # Prac41–42 증가

s_rows, a_rows = [], []
for n, (src, cond) in enumerate(zip(sources, conditions), start=1):
    scale = rng.uniform(0.6, 1.5)       # 샘플마다 다른 RNA 투입량 흉내
    log2 = base + effect * (cond == "Space Flight") + rng.normal(0, 0.35, 60)
    endo = rng.poisson(scale * 2 ** log2)
    hk = rng.poisson(scale * np.array([800, 300, 150, 3]))
    pos = rng.poisson([30000, 8000, 2000, 500, 120, 30])
    neg = rng.poisson(6, size=8)

    lines = ["<Header>", "FileVersion,1.7", "</Header>", "",
             "<Sample_Attributes>", f"ID,{src}-PRACTICE", "GeneRLF,PRACTICE_PANEL",
             "</Sample_Attributes>", "", "<Code_Summary>", "CodeClass,Name,Accession,Count"]
    lines += [f"Endogenous,{g},PRAC_{i:04d}.1,{c}" for i, (g, c) in enumerate(zip(genes, endo), 1)]
    lines += [f"Housekeeping,HK{i},PRAC_HK{i}.1,{c}" for i, c in enumerate(hk, 1)]
    lines += [f"Positive,POS_{'ABCDEF'[i]},ERCC_P{i}.1,{c}" for i, c in enumerate(pos)]
    lines += [f"Negative,NEG_{'ABCDEFGH'[i]},ERCC_N{i}.1,{c}" for i, c in enumerate(neg)]
    lines += ["</Code_Summary>", ""]

    fname = f"PRACTICE_microarray_P{n:02d}_{src}.RCC.gz"
    with gzip.open(out / fname, "wt") as f:
        f.write("\n".join(lines))
    s_rows.append({"Source Name": src, "Sample Name": f"P{n:02d}",
                   "Factor Value[Spaceflight]": cond})
    a_rows.append({"Sample Name": f"P{n:02d}", "Array Data File": fname})

pd.DataFrame(s_rows).to_csv(out / "s_PRACTICE.txt", sep="\t", index=False)
pd.DataFrame(a_rows).to_csv(out / "a_PRACTICE_ncounter.txt", sep="\t", index=False)

print("만든 파일 수:", len(list(out.glob("*"))))
with gzip.open(out / "PRACTICE_microarray_P01_F1.RCC.gz", "rt") as f:
    print("".join(f.readlines()[9:14]))
```

```text
만든 파일 수: 14
<Code_Summary>
CodeClass,Name,Accession,Count
Endogenous,Prac01,PRAC_0001.1,49
Endogenous,Prac02,PRAC_0002.1,21
Endogenous,Prac03,PRAC_0003.1,40
```

`<Code_Summary>` 아래가 우리가 쓸 표입니다. `CodeClass`는 그 행이 측정 대상 유전자인지 대조용인지, `Name`은 유전자 기호, `Accession`은 RefSeq 전사체 번호, `Count`는 세어진 분자 수입니다. 실제 OSD-536 파일도 이 네 열을 가지고 있습니다.

### 예시 2 — OSDR에 실제로 어떤 파일이 있는지 물어보기

웹 페이지를 눈으로 훑는 대신, OSDR이 제공하는 API에 "536번 study의 파일 목록을 달라"고 요청합니다. 인터넷 연결이 필요합니다.

```python
import json
import urllib.request

API = "https://osdr.nasa.gov/osdr/data/osd/files/536"
with urllib.request.urlopen(API) as r:
    info = json.load(r)

files = info["studies"]["OSD-536"]["study_files"]
print("파일 수:", len(files))
for f in files[:4]:
    print(f["category"], "|", f["file_name"], "|", f["file_size"], "bytes")
```

```text
파일 수: 13
Study Metadata Files | OSD-536_metadata_OSD-536-ISA.zip | 32495 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643024_G14_RR9_B_06.RCC.gz | 9116 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643023_G13_RR9_B_05.RCC.gz | 9175 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643022_G12_RR9_B_04.RCC.gz | 9056 bytes
```

위 출력은 2026-11-12에 실행한 결과입니다. 숫자가 다르게 나오면 저장소가 갱신된 것이니, 달라진 내용을 README에 적으세요.

### 예시 3 — 체크섬 계산하기

```python
import hashlib

a = hashlib.sha256(b"Tnf,NM_013693.1,12").hexdigest()
b = hashlib.sha256(b"Tnf,NM_013693.1,13").hexdigest()
print(a[:16])
print(b[:16])
print("같은가?", a == b)
```

```text
d44e81abaa467dd4
e8d4aa737ca8f3f5
같은가? False
```

숫자 하나(12 → 13)만 바뀌었는데 지문이 완전히 달라집니다. 이 예시의 `Tnf` 줄은 설명용으로 지어낸 것입니다.

## 직접 해보기

1. `notebooks/` 폴더에 `02_osdr_qc_and_pca.ipynb`를 새로 만들고(이번 주 Day 15–19에 계속 씁니다), 예시 1의 코드를 실행해 `data/osdr_536_practice/`에 연습 파일이 14개 생겼는지 확인합니다.
2. 예시 2를 실행해 파일 수와 종류를 확인합니다. 브라우저에서 <https://osdr.nasa.gov/bio/repo/data/studies/OSD-536> 의 Files 탭도 열어 같은 목록이 보이는지 비교합니다.
3. 아래 코드로 실제 파일을 `data/osdr_536/`에 내려받고, 체크섬이 담긴 목록(`download_manifest.csv`)을 만들고, ISA 묶음을 풉니다. 전체 용량은 약 140KB입니다.

```python
import hashlib
import zipfile
from datetime import date
from pathlib import Path
import pandas as pd

raw = Path("../data/osdr_536")
raw.mkdir(parents=True, exist_ok=True)

rows = []
for f in files:                                   # 예시 2에서 만든 files
    target = raw / f["file_name"]
    if not target.exists():                       # 이미 받았으면 다시 받지 않음
        urllib.request.urlretrieve("https://osdr.nasa.gov" + f["remote_url"], target)
    rows.append({
        "file_name": f["file_name"],
        "category": f["category"],
        "bytes": target.stat().st_size,
        "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
        "downloaded": date.today().isoformat(),
    })

manifest = pd.DataFrame(rows)
manifest.to_csv(raw / "download_manifest.csv", index=False)

for z in raw.glob("*.zip"):                       # ISA 메타데이터 묶음 풀기
    with zipfile.ZipFile(z) as zf:
        zf.extractall(raw)
        print("압축 안의 파일:", zf.namelist())

print(manifest["category"].value_counts().to_string())
print("크기 일치:", (manifest["bytes"] == [f["file_size"] for f in files]).all())
```

```text
압축 안의 파일: ['a_OSD-536_transcription-profiling_dna-microarray_ncounter max.txt', 's_OSD-536.txt', 'i_Investigation.txt']
category
Microarray Data Files    12
Study Metadata Files      1
크기 일치: True
```

4. 압축에서 나온 `s_...txt`(샘플 표)와 `a_...txt`(assay 표)를 열어 열 이름을 먼저 확인합니다. 파일 이름을 외워서 치지 말고 `glob`으로 찾습니다.

```python
s_path = next(raw.glob("s_*.txt"))
a_path = next(raw.glob("a_*.txt"))
s_table = pd.read_csv(s_path, sep="\t")
a_table = pd.read_csv(a_path, sep="\t")
print(s_path.name, s_table.shape)
print(a_table.columns.tolist())
print(s_table["Factor Value[Spaceflight]"].value_counts().to_string())
```

```text
s_OSD-536.txt (12, 71)
['Sample Name', 'Protocol REF', 'Parameter Value[QA Instrument]', 'Extract Name', 'Protocol REF.1', 'Hybridization Assay Name', 'Array Design REF', 'Protocol REF.2', 'Array Data File']
Factor Value[Spaceflight]
Space Flight      6
Ground Control    6
```

5. API의 메타데이터에서 버전과 인용 정보를 꺼냅니다. 어떤 키가 있는지 모를 때는 `.keys()`로 먼저 들여다봅니다.

```python
with urllib.request.urlopen("https://osdr.nasa.gov/osdr/data/osd/meta/536") as r:
    meta = json.load(r)["study"]["OSD-536"]

study = meta["studies"][0]
print("version:", meta["version"])
print("공개일:", study["publicReleaseDate"])
for c in study["comments"]:
    if c["name"] in ("DOI", "Data Source Accession", "Mission Name", "Project Identifier"):
        print(c["name"], "=", c["value"])
pub = study["publications"][0]
print(pub["authorList"], pub["title"], "doi:", pub["doi"])
```

```text
version: 3
공개일: 10-Aug-2022
DOI = 10.26030/bg5q-t229
Data Source Accession = GSE186278
Mission Name = SpaceX-12
Project Identifier = RR-9
Holley JM, Stanbouly S, Pecaut MJ, Willey JS, Delp M, Mao XW. Characterization of gene expression profiles in the mouse brain after 35 days of spaceflight mission. doi: 10.1038/s41526-022-00217-4
```

6. `data/README.md`를 만들고 아래 틀을 채웁니다. 대괄호 부분은 여러분이 직접 확인한 값으로 바꿉니다.

```markdown
# data/ 폴더 안내

## osdr_536/ — NASA OSDR OSD-536 (원본, 수정 금지)
- 출처: https://osdr.nasa.gov/bio/repo/data/studies/OSD-536
- study DOI: [5번에서 확인한 값]  ·  GEO: [확인한 값]
- 메타데이터 version: [확인한 값]  ·  다운로드 날짜: [YYYY-MM-DD]
- 받은 방법: OSDR API (`/osdr/data/osd/files/536`) → `notebooks/02_osdr_qc_and_pca.ipynb`
- 파일: RCC 원시 파일 [n]개, ISA 메타데이터 zip 1개. 체크섬은 `download_manifest.csv` 참고
- assay: [패널 이름], Endogenous [n]개 / Housekeeping [n]개 / Positive [n]개 / Negative [n]개
- 군: [군 이름과 n]
- 라이선스·이용 조건: [study 페이지와 OSDR 정책 페이지에서 확인한 문구와 그 URL. 못 찾았으면 "확인 못 함"]
- 인용: [데이터셋 인용 + 논문 인용]
- 발견한 점: [메타데이터 불일치 등]

## osdr_536/processed/ — 내가 만든 가공 파일 (Day 16부터 생김)

## osdr_536_practice/ — 연습용 가상 데이터 (생물학적 의미 없음, 보고서에 사용 금지)
```

7. Git에 커밋합니다. 원본 데이터 파일을 저장소에 올릴지는 라이선스를 확인한 뒤 결정하고, 확실하지 않으면 `data/README.md`와 `download_manifest.csv`만 커밋합니다.

⚠️ **흔한 오류 1 — `FileNotFoundError: ../data/...`.** 노트북이 `notebooks/` 폴더가 아닌 곳에서 실행되고 있습니다. `import os; print(os.getcwd())`로 현재 위치를 확인하세요.

⚠️ **흔한 오류 2 — `urllib.error.URLError` 또는 `HTTPError`.** 네트워크가 끊겼거나 OSDR 서버가 일시적으로 응답하지 않는 경우입니다. 몇 분 뒤 다시 실행하세요. 계속 실패하면 study 페이지의 Files 탭에서 손으로 내려받아 `data/osdr_536/`에 넣고, README의 "받은 방법"에 그렇게 적습니다.

## 퀴즈

**1.** OSD-536의 측정 방식은 무엇인가요? (가) 전장 RNA-seq (나) 정해진 유전자 패널을 세는 nCounter (다) 단일세포 RNA-seq

<details><summary>정답 보기</summary>

(나). RCC 파일 안에 패널 이름과 757개의 Endogenous 행이 들어 있습니다. 패널에 없는 유전자는 "변화 없음"이 아니라 "측정하지 않음"이라는 점이 이번 주 해석 전체에 영향을 줍니다.

</details>

**2.** "OSD-536을 사용했다"는 문장만으로 provenance가 충분하지 않은 이유를 한 문장으로 쓰세요.

<details><summary>정답 보기</summary>

저장소의 파일과 메타데이터는 갱신될 수 있어서, 언제 어떤 파일을 받았는지 모르면 같은 분석을 다시 할 수 없기 때문입니다. 날짜, 파일 목록, 체크섬, 버전이 함께 있어야 "같은 재료"임을 확인할 수 있습니다.

</details>

**3.** 내려받은 RCC 파일을 엑셀로 열어 보다가 실수로 저장했습니다. 이를 알아챌 수 있는 방법은?

<details><summary>정답 보기</summary>

파일의 SHA-256을 다시 계산해 `download_manifest.csv`의 값과 비교합니다. 내용이 조금이라도 바뀌었다면 값이 달라집니다. 달라졌다면 파일을 지우고 다시 내려받습니다.

</details>

**4.** OSD-536에서 제공되지 **않는** 것은? (가) 샘플별 원시 count 파일 (나) 샘플 메타데이터 (다) 차등발현 결과 표

<details><summary>정답 보기</summary>

(다). 2026-11-12 기준 파일 목록에는 RCC 원시 파일 12개와 ISA 메타데이터 zip뿐입니다. 그래서 정규화와 군 비교를 직접 해야 하고, 그 방법 선택도 보고서에 적어야 합니다.

</details>

**5.** 연습용 가상 데이터로 그린 그림을 Day 21 보고서에 넣어도 될까요?

<details><summary>정답 보기</summary>

안 됩니다. 가상 데이터는 코드가 돌아가는지 확인하는 용도이고 숫자는 지어낸 것입니다. 그래서 폴더를 따로 두고 README에도 "보고서에 사용 금지"라고 적습니다.

</details>

## 더 알아보기

> **📚 합성 데이터를 받았거나 만들 때의 provenance**
> 데이터셋에 합성(또는 증강) 레코드가 섞여 있으면 provenance 기록에 그 사실, 사용한 생성기와 설정, 몇 배를 섞었는지, 어떤 점검을 통과했는지까지 남겨야 합니다. 받는 쪽에서는 "실제인가 합성인가"를 가르는 열이 없으면 결과를 신뢰할 수 없습니다. 공개용 합성 데이터라면 충실도·유용성·프라이버시 점검 결과를 데이터 설명 문서에 함께 넣습니다.
> → [심화 G — Day G3: 영상·신호·EHR의 생성형 AI: 증강, 합성 데이터, 프라이버시](../advanced/G-ai-biomed/day-G3.md)

## 오늘의 산출물 체크리스트
- [ ] `data/osdr_536_practice/`에 연습 파일 14개가 있다.
- [ ] `data/osdr_536/`에 RCC 파일 12개, ISA zip과 풀린 파일, `download_manifest.csv`가 있다.
- [ ] `data/README.md`에 출처, 날짜, 버전, 파일 수, assay, 군별 n, 인용이 적혀 있다.
- [ ] 라이선스·이용 조건을 직접 찾아 적었거나 "확인 못 함"이라고 적었다.
- [ ] 메타데이터에서 발견한 불일치를 한 줄 이상 적었다.

---
[← 이전](../week-2/day-14.md) · [코스 지도](../../README.md) · [다음 →](day-16.md)
