# Day 20 — pathway 수준으로 해석하기

> **주차:** 3주차 · **예상 시간:** 75–90분 · **산출물:** pathway 표 (`processed/pathway_table.csv`) + dotplot (`figures/osdr_real_pathway_dotplot.png`)

> **이 분석의 성격:** 교육용 탐색 근사입니다. 원 논문의 분석을 재현한 것이 아니며, 정규화와 검정 방법이 논문과 다를 수 있습니다. 결과는 가설 생성용으로만 읽고, 논문 Methods와의 차이를 보고서의 한계에 적습니다.

## 오늘의 목표
- over-representation analysis(ORA)가 무엇을 세고 무엇과 비교하는지 설명할 수 있다.
- 패널 데이터에서는 "검정한 유전자"를 배경(background)으로 써야 하는 이유를 설명할 수 있다.
- gene set 표를 만들고 dotplot으로 그릴 수 있다.

## 🎬 영상으로 먼저 보기
- [Fisher's Exact Test and the Hypergeometric Distribution — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=udyAvvaMjfM) (5:15)
- **무엇에 주목할까:** 주머니에서 공을 꺼내는 비유가 오늘 계산의 전부입니다. "전체 공 수, 그중 빨간 공 수, 꺼낸 공 수, 꺼낸 것 중 빨간 공 수" 네 숫자가 각각 오늘의 무엇에 해당하는지 생각하며 보세요.
- [pathway enrichment / over-representation analysis 설명 — YouTube 검색 링크](https://www.youtube.com/results?search_query=over-representation+analysis+gene+set+enrichment+explained+background+gene+list) (검색 링크)
- **무엇에 주목할까:** 확인된 특정 영상이 아니라 검색 결과입니다. "background gene list를 무엇으로 잡는가"를 다루는 영상을 하나 골라 그 부분만 보세요.

## 개념 설명

### 유전자 하나씩이 아니라 묶음으로 본다

어제는 유전자를 하나씩 봤습니다. 하지만 유전자 하나의 변화는 작고 잡음에 묻히기 쉽습니다. 같은 일을 하는 유전자 여럿이 같은 방향으로 조금씩 움직였다면 그쪽이 더 믿을 만한 신호일 수 있습니다. 환자 한 명의 검사 수치 하나가 아니라 같은 계통의 수치들이 함께 오르내리는 패턴을 보는 것과 같습니다. **gene set(유전자 집합)** 은 "같은 과정에 참여한다"고 누군가 정리해 둔 유전자 목록입니다. Gene Ontology(GO)나 Reactome 같은 데이터베이스가 이런 목록을 제공합니다. **over-representation analysis(ORA, 과대표현 분석)** 는 가장 단순한 방법으로, "내 후보 목록에 이 집합의 유전자가 우연히 기대되는 것보다 많이 들어 있는가"를 묻습니다. 주머니에 공이 600개 있고 그중 40개가 빨간색일 때, 44개를 꺼냈더니 빨간 공이 8개 나왔다면 우연이라 하기엔 많은가? 이것을 계산하는 것이 초기하분포(hypergeometric distribution)입니다.

### 패널 데이터의 함정: 주머니를 잘못 정하면 전부 "유의"해진다

여기서 가장 중요한 선택이 **배경(background)**, 즉 주머니에 어떤 공을 넣느냐입니다. OSD-536의 패널은 처음부터 신경염증 관련 유전자 757개를 골라 만든 것입니다. 만약 배경을 마우스 전체 유전자 2만여 개로 잡으면, 후보가 무엇이든 "면역 반응", "염증" 관련 집합이 압도적으로 유의하게 나옵니다. 후보를 그 패널에서만 뽑았으니 당연한 결과이고, 비행의 효과가 아니라 패널 설계를 재발견한 것입니다. 신경과 병동에서만 환자를 뽑아 놓고 "이 표본에는 신경계 질환이 많다"고 보고하는 것과 같습니다. 올바른 배경은 **내가 실제로 검정한 유전자 목록**(Day 18의 표에 있는 유전자)입니다. 웹 도구를 쓸 때도 반드시 사용자 지정 배경(custom background)을 넣어야 합니다. 배경이 수백 개뿐이므로 검정력은 낮고, 집합 대부분은 패널 안에 유전자가 몇 개 없어서 아예 평가할 수 없습니다. 이것이 패널 assay의 한계이며 보고서에 그대로 적습니다.

### 후보 목록의 기준과 결과 읽는 법

ORA에 넣을 "후보 목록"도 정해야 합니다. 이상적으로는 FDR 기준을 통과한 유전자이지만, 작은 표본에서는 그런 유전자가 거의 없을 수 있습니다. 이번 실습에서는 보정 전 p < 0.05인 유전자를 후보로 쓰고, 그 사실을 표와 그림에 "탐색적"이라고 명시합니다. 후보 목록 자체에 거짓 발견이 많이 섞여 있을 수 있으므로 pathway 결과는 한 단계 더 조심스럽게 읽어야 합니다. 결과 표에서 볼 숫자는 네 가지입니다. 집합의 크기(배경 안에서 몇 개인가), 겹친 수, **fold enrichment**(겹친 수 ÷ 우연히 기대되는 수), 그리고 p-value와 그 FDR입니다. 집합을 수백 개 검정하므로 여기서도 다중검정 보정이 필요합니다. dotplot은 이 표를 그림으로 옮긴 것으로, 가로축에 fold enrichment, 점의 크기에 겹친 유전자 수, 색에 p-value를 담습니다. 참고로 study 설명문은 세포 스트레스, 염증, apoptosis, 대사 관련 경로의 변화와 시냅스 신호·수초 유지 관련 유전자의 감소를 보고합니다. 여러분의 결과가 이와 같은 방향인지 비교하되, 방법이 다르므로 일치하지 않는다고 해서 어느 한쪽이 틀린 것은 아닙니다.

## 예시로 이해하기

### 예시 1 — 주머니에서 공 꺼내기

```python
from scipy.stats import hypergeom

N = 600      # 배경: 검정한 유전자 수 (주머니 속 공)
K = 40       # 그중 이 gene set에 속한 유전자 수 (빨간 공)
n = 44       # 후보 유전자 수 (꺼낸 공)
k = 8        # 후보 중 gene set에 속한 수 (꺼낸 빨간 공)

expected = n * K / N
p = hypergeom.sf(k - 1, N, K, n)       # k개 이상 겹칠 확률
print("우연히 기대되는 겹침:", round(expected, 2))
print("fold enrichment:", round(k / expected, 2))
print("p-value:", round(p, 4))
```

```text
우연히 기대되는 겹침: 2.93
fold enrichment: 2.73
p-value: 0.0057
```

### 예시 2 — 배경을 잘못 잡으면

같은 겹침(후보 44개 중 8개)을 두고, 배경만 "전체 유전자 20,000개, 그중 집합 유전자 300개"로 바꿔 봅니다. 숫자는 설명용입니다.

```python
p_panel = hypergeom.sf(8 - 1, 600, 40, 44)
p_genome = hypergeom.sf(8 - 1, 20000, 300, 44)
print(f"패널을 배경으로: p = {p_panel:.4f}")
print(f"전체 유전자를 배경으로: p = {p_genome:.1e}")
```

```text
패널을 배경으로: p = 0.0057
전체 유전자를 배경으로: p = 2.6e-07
```

데이터는 그대로인데 배경만 바꿨더니 p-value가 수만 배 작아졌습니다. 패널이 이미 그 집합의 유전자를 많이 담고 있다는 사실이 "발견"으로 둔갑한 것입니다.

### 예시 3 — GMT 파일은 한 줄이 gene set 하나다

```python
line = "PRAC:001\tinflammation (fake)\tPrac01\tPrac02\tPrac03"
parts = line.split("\t")
print("ID:", parts[0])
print("이름:", parts[1])
print("유전자:", parts[2:])
```

```text
ID: PRAC:001
이름: inflammation (fake)
유전자: ['Prac01', 'Prac02', 'Prac03']
```

gene set 데이터베이스는 흔히 GMT라는 텍스트 형식으로 배포됩니다. 탭으로 구분된 첫 칸이 ID, 둘째 칸이 이름이나 설명, 나머지가 유전자입니다. 내려받은 파일이 정말 이 구조인지는 열어서 첫 줄을 확인해야 합니다.

## 직접 해보기

새 노트북 `notebooks/03_osdr_pathway_analysis.ipynb`를 만듭니다. `MODE = "practice"`로 끝까지 실행한 뒤 `"real"`로 바꿔 다시 실행합니다.

1. 설정 셀. 실제 모드에서는 gene set 파일 경로를 직접 넣어야 합니다.

```python
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import hypergeom
from statsmodels.stats.multitest import multipletests

MODE = "practice"          # 연습이 끝나면 "real"로 바꾸세요
RAW_DIR = Path("../data/osdr_536_practice" if MODE == "practice" else "../data/osdr_536")
OUT_DIR = RAW_DIR / "processed"
FIG_DIR = Path("../figures")

GMT_PATH = None            # 실제 모드: 여기에 실제 GMT 파일 경로를 넣으세요 (아래 2번 참고)
PREFIXES = ("GO:", "REAC:")    # 사용할 gene set ID의 접두어. 파일을 열어 본 뒤 정하세요

de = pd.read_csv(OUT_DIR / "de_table.csv")
background = set(de["gene"])
hits = {
    "all p<0.05": set(de.loc[de["p_value"] < 0.05, "gene"]),
    "FLT down": set(de.loc[(de["p_value"] < 0.05) & (de["log2FC"] < 0), "gene"]),
    "FLT up": set(de.loc[(de["p_value"] < 0.05) & (de["log2FC"] > 0), "gene"]),
}
print("배경:", len(background), "|", {k: len(v) for k, v in hits.items()})
```

```text
배경: 60 | {'all p<0.05': 14, 'FLT down': 11, 'FLT up': 3}
```

2. gene set을 준비합니다. 연습 모드에서는 가짜 GMT 파일을 만들어 씁니다. 실제 모드에서는 마우스 gene set GMT 파일을 직접 구해 `data/reference/`에 넣고 `GMT_PATH`에 경로를 적습니다.

   - 한 가지 출처: g:Profiler가 배포하는 마우스 통합 GMT. 2026-11-12에 `https://biit.cs.ut.ee/gprofiler/static/gprofiler_full_mmusculus.name.gmt` 주소에서 약 19MB 파일이 내려받아지고, 한 줄이 "ID, 이름, 유전자 기호들" 구조이며 ID 접두어가 `GO`, `REAC`, `WP`, `HP`, `CORUM`인 것을 확인했습니다. 주소와 내용은 바뀔 수 있으니 g:Profiler 사이트의 데이터 출처 안내에서 현재 버전과 이용 조건을 직접 확인하세요.
   - 받은 파일의 출처, 날짜, 버전을 Day 15처럼 `data/README.md`에 추가합니다.

```python
if MODE == "practice":
    GMT_PATH = RAW_DIR / "practice_sets.gmt"
    fake_sets = [
        ("PRAC:001", "inflammation (fake)", range(1, 11)),
        ("PRAC:002", "oxidative stress (fake)", range(11, 21)),
        ("PRAC:003", "synapse (fake)", range(21, 31)),
        ("PRAC:004", "myelin (fake)", range(31, 41)),
        ("PRAC:005", "apoptosis (fake)", range(41, 51)),
        ("PRAC:006", "mixed (fake)", range(5, 60, 6)),
    ]
    with open(GMT_PATH, "w", encoding="utf-8") as f:
        for set_id, name, idx in fake_sets:
            f.write("\t".join([set_id, name] + [f"Prac{i:02d}" for i in idx] + ["NotInPanel1"]) + "\n")
    PREFIXES = ("PRAC:",)

assert GMT_PATH is not None, "실제 모드에서는 1번 셀의 GMT_PATH에 파일 경로를 넣어야 합니다."

def read_gmt(path):
    """GMT 파일을 {ID: (이름, 유전자 집합)} 딕셔너리로 읽는다."""
    sets = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            parts = line.rstrip("\n").split("\t")
            if len(parts) >= 3:
                sets[parts[0]] = (parts[1], set(parts[2:]))
    return sets

gene_sets = {k: v for k, v in read_gmt(GMT_PATH).items() if k.startswith(PREFIXES)}
first_id = next(iter(gene_sets))
print("읽은 gene set 수:", len(gene_sets))
print("첫 번째:", first_id, "|", gene_sets[first_id][0], "|", sorted(gene_sets[first_id][1])[:3])
```

```text
읽은 gene set 수: 6
첫 번째: PRAC:001 | inflammation (fake) | ['NotInPanel1', 'Prac01', 'Prac02']
```

3. 파일의 유전자 이름이 우리 데이터의 유전자 기호와 같은 체계인지 확인합니다. 겹치는 비율이 낮으면 종(species)이나 ID 체계가 다른 파일입니다.

```python
all_set_genes = set().union(*(genes for _, genes in gene_sets.values()))
covered = background & all_set_genes
print(f"배경 유전자 {len(background)}개 중 gene set에 한 번이라도 나오는 것: {len(covered)}개")
```

```text
배경 유전자 60개 중 gene set에 한 번이라도 나오는 것: 52개
```

4. ORA 함수를 만들고 세 가지 후보 목록에 대해 실행합니다. 배경 안에서 유전자가 5개 미만이거나 배경의 절반을 넘는 집합은 평가하지 않습니다.

```python
def run_ora(hit_genes, gene_sets, background, min_size=5):
    rows = []
    N, n = len(background), len(hit_genes)
    for set_id, (name, genes) in gene_sets.items():
        in_bg = genes & background                 # 배경(검정한 유전자) 안으로 제한
        K = len(in_bg)
        if K < min_size or K > N / 2:
            continue
        overlap = in_bg & hit_genes
        k = len(overlap)
        expected = n * K / N
        rows.append({
            "set_id": set_id, "name": name, "set_size_in_background": K,
            "overlap": k, "expected": round(expected, 2),
            "fold_enrichment": round(k / expected, 2) if expected > 0 else np.nan,
            "p_value": hypergeom.sf(k - 1, N, K, n),
            "genes": ", ".join(sorted(overlap)),
        })
    out = pd.DataFrame(rows)
    out["FDR"] = multipletests(out["p_value"], method="fdr_bh")[1]
    return out.sort_values("p_value").reset_index(drop=True)

tables = []
for label, hit_genes in hits.items():
    if len(hit_genes) > 0:
        tables.append(run_ora(hit_genes, gene_sets, background).assign(hit_list=label))
pathway = pd.concat(tables, ignore_index=True)

print("평가한 gene set 수(목록당):", pathway["set_id"].nunique())
print("FDR < 0.05 인 행:", int((pathway["FDR"] < 0.05).sum()))
show = ["hit_list", "name", "set_size_in_background", "overlap", "fold_enrichment", "p_value", "FDR"]
print(pathway.sort_values("p_value")[show].head(6).round(4).to_string(index=False))
pathway.round(5).to_csv(OUT_DIR / "pathway_table.csv", index=False)
```

```text
평가한 gene set 수(목록당): 6
FDR < 0.05 인 행: 0
  hit_list                name  set_size_in_background  overlap  fold_enrichment  p_value    FDR
  FLT down      synapse (fake)                      10        5             2.73   0.0131 0.0784
all p<0.05      synapse (fake)                      10        5             2.14   0.0436 0.2618
    FLT up        mixed (fake)                      10        2             4.00   0.0693 0.2078
    FLT up    apoptosis (fake)                      10        2             4.00   0.0693 0.2078
  FLT down inflammation (fake)                      10        4             2.18   0.0743 0.2228
all p<0.05 inflammation (fake)                      10        4             1.71   0.1680 0.5040
```

5. 방향별(FLT down / FLT up) 상위 집합을 dotplot으로 그립니다.

```python
top = (pathway[pathway["hit_list"] != "all p<0.05"]
       .query("overlap >= 2")
       .sort_values("p_value")
       .groupby("hit_list").head(8))
top = top.assign(label=top["name"].str.slice(0, 45) + " [" + top["hit_list"] + "]").iloc[::-1]

fig, ax = plt.subplots(figsize=(8, 0.35 * len(top) + 1.8))
sc = ax.scatter(top["fold_enrichment"], top["label"], s=top["overlap"] * 40,
                c=-np.log10(top["p_value"]), cmap="viridis")
ax.axvline(1, linestyle="--", linewidth=0.8, color="grey")
ax.set_xlabel("Fold enrichment (observed / expected overlap)")
ax.set_title(f"ORA of genes with unadjusted p < 0.05 (exploratory) [data: {MODE}]\nbackground = tested panel genes; dot size = overlap", fontsize=9)
fig.colorbar(sc, ax=ax, label="-log10(p-value)")
fig.tight_layout()
fig.savefig(FIG_DIR / f"osdr_{MODE}_pathway_dotplot.png", dpi=150)
print("그림에 넣은 gene set 수:", len(top))
```

```text
그림에 넣은 gene set 수: 5
```

6. `MODE = "real"`로 바꾸고 `GMT_PATH`에 실제 파일 경로를 넣어 다시 실행합니다. 3번에서 겹침이 낮게 나오면 멈추고 파일을 다시 확인합니다.
7. 실제 결과 표(`pathway_table.csv`)를 열어 아래를 노트북에 적습니다.

```markdown
### Day 20 요약 (실제 데이터)
- gene set 출처와 버전/다운로드 날짜: [직접 확인한 값]
- 배경: 검정한 패널 유전자 [n]개 / 후보 기준: 보정 전 p < 0.05 (FLT down [n]개, FLT up [n]개)
- 평가 가능한 gene set 수: [n]개, 그중 FDR < 0.05: [n]개
- 상위 집합 3–5개 (방향, 겹친 유전자, fold enrichment, FDR): [표에서 옮겨 적기]
- study 설명문/논문이 보고한 경로와 같은 방향인가: [비교]
- 주의점: 패널 배경이라 검정력이 낮음, 후보 목록이 보정 전 기준임, [그 밖에 관찰한 것]
```

8. (선택) 웹 도구로 교차 확인합니다. g:Profiler 같은 enrichment 웹 도구에 후보 유전자를 붙여 넣되, 종을 *Mus musculus*로 고르고 **custom background**에 검정한 유전자 전체를 넣습니다. 내려받은 결과 파일의 열 이름은 도구와 버전마다 다르므로 `pd.read_csv("여기에 실제 파일명을 넣으세요").columns.tolist()`로 먼저 확인한 뒤 사용합니다. 붙여 넣을 목록은 아래처럼 만듭니다.

```python
(OUT_DIR / "genes_background.txt").write_text("\n".join(sorted(background)))
(OUT_DIR / "genes_flt_down.txt").write_text("\n".join(sorted(hits["FLT down"])))
(OUT_DIR / "genes_flt_up.txt").write_text("\n".join(sorted(hits["FLT up"])))
print("목록 파일 3개 저장")
```

```text
목록 파일 3개 저장
```

⚠️ **흔한 오류 1 — 3번에서 겹치는 유전자가 거의 0개.** 사람용 gene set(기호가 전부 대문자)이나 Ensembl ID로 된 파일을 받은 경우입니다. 파일의 첫 줄을 출력해 유전자 표기를 확인하세요. 대문자로 바꿔 억지로 맞추지 말고 마우스용 파일을 구합니다.

⚠️ **흔한 오류 2 — 웹 도구에서 배경을 지정하지 않는다.** 기본 설정은 대개 전체 유전체가 배경이어서, 패널 데이터를 넣으면 면역·염증 관련 항목이 극단적으로 유의하게 나옵니다. 그 결과는 패널 설계를 보여 줄 뿐이므로 보고서에 쓰지 않습니다.

## 퀴즈

**1.** ORA에서 초기하분포 계산에 들어가는 네 숫자를 "주머니와 공"에 대응시켜 쓰세요.

<details><summary>정답 보기</summary>

주머니 속 전체 공 = 배경 유전자 수, 빨간 공 = 배경 중 그 gene set에 속한 유전자 수, 꺼낸 공 = 후보 유전자 수, 꺼낸 빨간 공 = 후보 중 gene set에 속한 수입니다. 이 넷으로 "이만큼 이상 겹칠 확률"을 계산합니다.

</details>

**2.** OSD-536 분석에서 배경을 마우스 전체 유전자로 잡으면 어떤 일이 생기나요?

<details><summary>정답 보기</summary>

패널 자체가 신경염증 관련 유전자로 구성되어 있어서, 후보가 무엇이든 면역·염증 관련 집합이 매우 유의하게 나옵니다. 이는 실험 조건의 효과가 아니라 패널 설계가 반영된 것이므로 잘못된 결론으로 이어집니다.

</details>

**3.** fold enrichment = 1.0은 무엇을 뜻하나요? (가) 겹침이 우연히 기대되는 수준과 같다 (나) 유전자 발현이 2배다 (다) 모든 유전자가 겹쳤다

<details><summary>정답 보기</summary>

(가). fold enrichment는 "관찰된 겹침 ÷ 기대되는 겹침"입니다. 1이면 과대표현이 없고, 1보다 클수록 기대보다 많이 겹친 것입니다. 유전자 발현의 fold change와는 다른 값입니다.

</details>

**4.** 후보 목록을 "보정 전 p < 0.05"로 만들었을 때 pathway 결과를 어떻게 다뤄야 하나요?

<details><summary>정답 보기</summary>

후보 목록에 거짓 발견이 상당수 섞여 있을 수 있으므로 pathway 결과도 탐색적인 것으로 표시합니다. 그림 제목과 보고서에 기준을 명시하고, "경로가 활성화/억제되었다"가 아니라 "관련 유전자가 후보 목록에 기대보다 많이 포함되는 경향"이라고 씁니다.

</details>

**5.** 어떤 gene set이 배경 안에 유전자를 2개만 가지고 있습니다. 이 집합을 평가에서 뺀 이유는?

<details><summary>정답 보기</summary>

유전자 2개로는 "기대보다 많다"를 판단할 수 없고, 하나만 우연히 겹쳐도 큰 fold enrichment가 나오기 때문입니다. 패널에 없는 유전자는 측정되지 않았으므로, 그 집합 전체에 대해 말할 근거가 없습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `03_osdr_pathway_analysis.ipynb`가 연습·실제 모드 모두 오류 없이 실행된다.
- [ ] `processed/pathway_table.csv`와 `figures/osdr_real_pathway_dotplot.png`가 있다.
- [ ] gene set 파일의 출처·날짜·버전을 `data/README.md`에 적었다.
- [ ] 배경과 후보 기준을 노트북과 그림 제목에 명시했다.
- [ ] 상위 집합을 study 설명문/논문의 보고와 비교해 적었다.

---
[← 이전](day-19.md) · [코스 지도](../../README.md) · [다음 →](day-21.md)
