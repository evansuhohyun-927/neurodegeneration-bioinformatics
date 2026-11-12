# Day 19 — 후보 유전자를 한 개씩 들여다보기

> **주차:** 3주차 · **예상 시간:** 75–90분 · **산출물:** gene-level figure (`figures/osdr_real_gene_level.png`)

> **이 분석의 성격:** 교육용 탐색 근사입니다. 원 논문의 분석을 재현한 것이 아니며, 정규화와 검정 방법이 논문과 다를 수 있습니다. 결과는 가설 생성용으로만 읽고, 논문 Methods와의 차이를 보고서의 한계에 적습니다.

## 오늘의 목표
- 신경염증, ROS, 시냅스, 수초, apoptosis 범주에서 후보 유전자 5–10개를 근거와 함께 고를 수 있다.
- 후보 유전자가 패널에 있는지, 안정적으로 검출되었는지 확인할 수 있다.
- 샘플 하나하나가 보이는 gene-level plot을 그리고, 평균 뒤에 숨은 개체 차이를 읽을 수 있다.

## 🎬 영상으로 먼저 보기
- [p-hacking: What it is and how to avoid it! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=HDCOUXE3HMM) (13:44)
- **무엇에 주목할까:** 결과를 본 뒤에 "보기 좋은" 유전자만 골라 강조하는 것도 p-hacking의 한 형태입니다. 오늘 후보를 고를 때 "미리 정한 후보"와 "표를 보고 고른 후보"를 구분해 적는 이유가 여기에 있습니다.
- [Logs (logarithms), Clearly Explained!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=VSi0Z04fWj0) (15:37)
- **무엇에 주목할까:** 오늘 그림의 세로축은 log2 값입니다. 축에서 1칸 차이가 2배라는 감각만 되살리면 됩니다. 앞 7분 정도면 충분합니다.

## 개념 설명

### 표의 한 줄은 여섯 마리와 여섯 마리의 요약일 뿐이다

어제 만든 표에서 유전자 하나는 log2FC와 p-value 두 숫자로 요약되어 있습니다. 하지만 같은 log2FC = −0.8이라도 사정은 전혀 다를 수 있습니다. 비행군 여섯 마리가 모두 조금씩 낮은 경우와, 다섯 마리는 대조군과 같은데 한 마리만 크게 낮은 경우입니다. 앞의 것은 군 전체의 변화이고 뒤의 것은 한 개체의 사정입니다. 면역조직화학 정량 결과를 막대그래프 평균으로만 보다가 원본 사진을 열어 보니 한 장만 유독 진했던 경험과 같습니다. 그래서 후보 유전자는 반드시 **샘플 하나가 점 하나로 보이는 그림**으로 확인합니다. 군당 6마리이므로 막대와 오차막대 대신 점을 전부 찍는 편이 정보도 많고 정직합니다. 점이 겹치지 않도록 좌우로 살짝 흩뜨리는 것을 jitter라고 합니다.

### 후보를 고르는 두 가지 길을 구분해 적는다

후보 유전자를 고르는 방법은 두 가지입니다. 하나는 **미리 정하기(a priori)** 입니다. 데이터를 보기 전에 생물학 지식으로 "신경염증이라면 이 유전자를 보겠다"고 정하는 것입니다. 다른 하나는 **결과에서 고르기(data-driven)** 입니다. 어제 표의 상위 유전자 중에서 고르는 것입니다. 둘 다 정당하지만 해석의 무게가 다릅니다. 수백 개 중 가장 눈에 띄는 것을 골랐다면 그 유전자의 p-value가 작은 것은 당연하고, 그림도 당연히 그럴듯해 보입니다. 가장 키 큰 학생을 뽑아 놓고 "이 학생은 키가 크다"고 놀라는 것과 같습니다. 그래서 후보 표에 "선정 근거" 열을 두고 `a priori`인지 `data-driven`인지 적습니다. 오늘 실습에서는 범주마다 a priori 후보를 먼저 정하고, 그다음 어제 표에서 몇 개를 더합니다.

### 패널에 없는 유전자, 검출되지 않은 유전자

nCounter는 정해진 유전자만 세는 패널입니다. 그래서 떠올린 유전자가 패널에 없을 수 있습니다. 예를 들어 2026-11-12에 내려받은 RCC 파일에는 `Gfap`이라는 이름의 행이 없었습니다. 이 경우 할 수 있는 말은 "변화 없음"이 아니라 "이 데이터로는 알 수 없음"입니다. 패널에 있더라도 뇌 조직에서 발현이 낮아 배경 잡음 수준으로만 잡힌 유전자도 있습니다(Day 17의 `keep` 열). 이런 유전자의 그림은 잡음을 그린 것이므로 후보에서 빼거나 "검출 불안정"이라고 표시합니다. 마지막으로, 범주 이름에 주의하세요. 유전자 하나가 "신경염증 유전자"라는 말은 편의상의 꼬리표입니다. 대부분의 유전자는 여러 세포 종류에서 여러 역할을 하고, 뇌 조직 전체를 갈아 측정한 값은 세포 구성 비율의 변화와 세포당 발현의 변화를 구분하지 못합니다.

## 예시로 이해하기

### 예시 1 — 평균은 같아도 이야기는 다르다

```python
import numpy as np
import pandas as pd

gc = np.array([8.0, 8.1, 7.9, 8.0, 8.1, 7.9])
flt_a = np.array([7.2, 7.3, 7.1, 7.2, 7.3, 7.1])     # 여섯 마리 모두 낮음
flt_b = np.array([8.0, 8.1, 7.9, 8.0, 8.1, 3.1])     # 한 마리만 크게 낮음

for name, flt in [("geneA", flt_a), ("geneB", flt_b)]:
    full = flt.mean() - gc.mean()
    without_min = np.delete(flt, flt.argmin()).mean() - gc.mean()
    print(f"{name}: log2FC = {full:.2f} | 가장 낮은 한 마리를 빼면 {without_min:.2f}")
```

```text
geneA: log2FC = -0.80 | 가장 낮은 한 마리를 빼면 -0.78
geneB: log2FC = -0.80 | 가장 낮은 한 마리를 빼면 0.02
```

두 유전자의 log2FC는 같지만, geneB는 한 마리를 빼면 차이가 사라집니다. 표만 봐서는 알 수 없고 점을 찍어 봐야 보입니다.

### 예시 2 — 후보가 패널에 있는지 집합으로 확인하기

```python
panel = {"Tnf", "Il1b", "Trem2", "Mog", "Plp1", "Casp3"}      # 설명용 작은 패널
wish_list = ["Trem2", "Gfap", "Mog", "TNF"]

print("패널에 있음:", [g for g in wish_list if g in panel])
print("패널에 없음:", [g for g in wish_list if g not in panel])
```

```text
패널에 있음: ['Trem2', 'Mog']
패널에 없음: ['Gfap', 'TNF']
```

`TNF`가 "없음"으로 나온 이유는 대소문자입니다. 마우스 기호는 `Tnf`입니다. 없다고 나오면 철자와 대소문자를 먼저 의심하세요.

### 예시 3 — 점을 흩뜨려 찍는 가장 작은 그림

```python
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
fig, ax = plt.subplots(figsize=(3, 3))
for x, values, color in [(0, gc, "tab:blue"), (1, flt_b, "tab:red")]:
    jitter = rng.uniform(-0.08, 0.08, size=len(values))
    ax.scatter(x + jitter, values, color=color)
    ax.hlines(values.mean(), x - 0.2, x + 0.2, color="black")      # 군 평균
ax.set_xticks([0, 1], ["GC", "FLT"])
ax.set_ylabel("log2 expression")
ax.set_title("geneB (toy data)")
fig.tight_layout()
print("찍은 점의 수:", len(gc) + len(flt_b))
```

```text
찍은 점의 수: 12
```

검은 가로선(평균)은 FLT가 낮다고 말하지만, 점을 보면 다섯 마리는 대조군과 같은 높이에 있습니다.

## 직접 해보기

`MODE = "practice"`로 끝까지 실행한 뒤 `"real"`로 바꿔 다시 실행합니다.

1. 설정 셀과 저장해 둔 표를 불러옵니다.

```python
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

MODE = "practice"          # 연습이 끝나면 "real"로 바꾸세요
RAW_DIR = Path("../data/osdr_536_practice" if MODE == "practice" else "../data/osdr_536")
OUT_DIR = RAW_DIR / "processed"
FIG_DIR = Path("../figures")

log2_norm = pd.read_csv(OUT_DIR / "log2_norm.csv", index_col=0)
gene_qc = pd.read_csv(OUT_DIR / "gene_qc.csv", index_col=0)
de = pd.read_csv(OUT_DIR / "de_table.csv").set_index("gene")
samples = pd.read_csv(OUT_DIR / "samples.csv").set_index("sample_id").loc[log2_norm.index]
print(log2_norm.shape, de.shape)
```

```text
(12, 60) (60, 6)
```

2. 범주별 후보를 정합니다. 연습 모드의 범주는 가짜 이름표입니다. 실제 모드의 목록은 **출발점**입니다. 교과서적 기능을 근거로 고른 a priori 후보이고, 모두 패널에 존재함을 2026-11-12에 RCC 파일에서 확인했습니다. 여러분의 판단으로 바꾸고, 어제의 `top_candidates.csv`에서 관심 가는 유전자를 `data_driven`에 추가해 전체가 5–10개가 되게 하세요.

```python
if MODE == "practice":
    candidates = {
        "inflammation (fake)": ["Prac01", "Prac02"],
        "oxidative stress (fake)": ["Prac11", "Prac12"],
        "synapse (fake)": ["Prac21", "Prac22"],
        "myelin (fake)": ["Prac31", "Prac32"],
        "apoptosis (fake)": ["Prac41", "Prac42"],
        "data_driven": [],
    }
else:
    candidates = {
        "neuroinflammation": ["Trem2", "C3"],
        "oxidative stress": ["Nfe2l2", "Hmox1"],
        "synapse": ["Syp", "Dlg4"],
        "myelin": ["Mog", "Plp1"],
        "apoptosis": ["Casp3", "Bax"],
        "data_driven": [],          # 여기에 어제 표에서 고른 유전자 기호를 넣으세요
    }

cand = pd.DataFrame([(g, c) for c, genes in candidates.items() for g in genes],
                    columns=["gene", "category"])
cand["basis"] = np.where(cand["category"] == "data_driven", "data-driven", "a priori")
print(len(cand), "개 후보")
```

```text
10 개 후보
```

3. 후보마다 패널 존재 여부, 검출 안정성, 어제의 통계값을 붙여 한 표로 만듭니다.

```python
cand["in_panel"] = cand["gene"].isin(log2_norm.columns)
cand["detected"] = cand["gene"].map(gene_qc["keep"]).fillna(False).astype(bool)
cand = cand.join(de[["log2FC", "p_value", "FDR"]], on="gene")
print(cand.round(3).to_string(index=False))
cand.round(4).to_csv(OUT_DIR / "candidate_genes.csv", index=False)
```

```text
  gene                category    basis  in_panel  detected  log2FC  p_value   FDR
Prac01     inflammation (fake) a priori      True      True  -1.105    0.002 0.016
Prac02     inflammation (fake) a priori      True      True  -0.567    0.070 0.220
Prac11 oxidative stress (fake) a priori      True      True   0.256    0.318 0.597
Prac12 oxidative stress (fake) a priori      True      True  -0.249    0.619 0.924
Prac21          synapse (fake) a priori      True      True  -0.763    0.001 0.016
Prac22          synapse (fake) a priori      True      True  -0.476    0.019 0.097
Prac31           myelin (fake) a priori      True      True  -0.384    0.052 0.205
Prac32           myelin (fake) a priori      True      True  -0.662    0.057 0.205
Prac41        apoptosis (fake) a priori      True      True   0.914    0.004 0.031
Prac42        apoptosis (fake) a priori      True      True   0.623    0.001 0.016
```

   `in_panel`이 False면 철자를 확인하고, 정말 없으면 다른 유전자로 바꿉니다. `detected`가 False인 유전자는 `log2FC`가 비어 있습니다(어제 검정에서 제외했기 때문). 그림에는 그릴 수 있지만 "검출 불안정"으로 다룹니다.

4. 후보 유전자마다 작은 그림 하나씩, 샘플 하나가 점 하나가 되게 그립니다.

```python
plot_genes = cand[cand["in_panel"]].reset_index(drop=True)
n_cols = 5
n_rows = int(np.ceil(len(plot_genes) / n_cols))
rng = np.random.default_rng(0)

fig, axes = plt.subplots(n_rows, n_cols, figsize=(2.6 * n_cols, 3 * n_rows), squeeze=False)
for ax in axes.ravel():
    ax.axis("off")

for ax, row in zip(axes.ravel(), plot_genes.itertuples()):
    ax.axis("on")
    for x, g, color in [(0, "GC", "tab:blue"), (1, "FLT", "tab:red")]:
        values = log2_norm.loc[samples["group"] == g, row.gene]
        ax.scatter(x + rng.uniform(-0.08, 0.08, len(values)), values, color=color, s=25)
        ax.hlines(values.mean(), x - 0.25, x + 0.25, color="black", linewidth=1)
    ax.set_xticks([0, 1], ["GC", "FLT"])
    ax.set_xlim(-0.6, 1.6)
    stats_text = f"log2FC {row.log2FC:.2f}, FDR {row.FDR:.2f}" if row.detected else "low detection"
    ax.set_title(f"{row.gene}\n{row.category}\n{stats_text}", fontsize=8)

for ax in axes[:, 0]:
    ax.set_ylabel("log2 normalized count")
fig.suptitle(f"Candidate genes, one dot per animal (exploratory) [data: {MODE}]", fontsize=10)
fig.tight_layout()
fig.savefig(FIG_DIR / f"osdr_{MODE}_gene_level.png", dpi=150)
print("그린 유전자 수:", len(plot_genes))
```

```text
그린 유전자 수: 10
```

5. 그림에서 점 하나가 어느 동물인지 알고 싶을 때는 값을 표로 꺼냅니다. 아래는 첫 번째 후보의 예입니다.

```python
gene = plot_genes.loc[0, "gene"]
view = samples[["source", "group"]].assign(log2=log2_norm[gene].round(2))
print(gene)
print(view.sort_values(["group", "log2"]).to_string(index=False))
```

```text
Prac01
source group  log2
    F4   FLT  4.26
    F6   FLT  4.44
    F5   FLT  4.79
    F3   FLT  4.81
    F2   FLT  5.10
    F1   FLT  5.46
   GC3    GC  5.42
   GC6    GC  5.52
   GC1    GC  5.65
   GC4    GC  6.15
   GC5    GC  6.16
   GC2    GC  6.59
```

6. `MODE = "real"`로 바꿔 다시 실행합니다. 2번의 `data_driven`에 유전자를 추가한 뒤, 완성된 그림을 보며 유전자마다 아래 표를 채웁니다.

```markdown
### 후보 유전자 검토 (실제 데이터)
| 유전자 | 범주 | 선정 근거 (a priori / data-driven) | 점들의 모양 (전체 이동 / 한두 마리가 주도 / 겹침) | log2FC, FDR | 한 줄 메모 |
|---|---|---|---|---|---|
```

7. "한두 마리가 주도"로 보이는 유전자가 있으면, 그 동물이 Day 17에서 적어 둔 outlier 후보와 같은 동물인지 5번 방법으로 확인합니다.
8. 그림 아래에 붙일 캡션을 두세 문장으로 씁니다. 무엇을 그렸는지(정규화 방법, 축), 점과 선이 무엇인지, 그리고 "군당 n = 6, 탐색적 결과"라는 문구를 넣습니다.

⚠️ **흔한 오류 1 — `KeyError: 'Xxx'`.** 그 이름의 유전자가 행렬에 없습니다. 3번 표의 `in_panel` 열을 먼저 확인하세요. 4번 코드는 패널에 있는 유전자만 그리도록 되어 있으므로, 이 오류는 보통 5번 셀에서 이름을 직접 쳤을 때 납니다.

⚠️ **흔한 오류 2 — 범주 이름을 결론처럼 쓴다.** "수초 유전자 Mog가 감소했으므로 탈수초가 일어났다"는 이 데이터가 뒷받침하지 않는 문장입니다. 쓸 수 있는 문장은 "수초 관련 유전자 Mog의 mRNA 수준이 FLT에서 낮은 경향을 보였다" 정도입니다.

## 퀴즈

**1.** 군당 6마리 데이터에서 막대그래프(평균 ± 오차막대)보다 점을 모두 찍는 그림이 나은 이유는?

<details><summary>정답 보기</summary>

평균과 오차막대는 여섯 개 값을 두 숫자로 줄여 버려서, 한 마리가 차이를 주도하는지 전체가 함께 움직였는지 알 수 없기 때문입니다. 점이 여섯 개뿐이라면 전부 보여 주는 것이 가장 많은 정보를 줍니다.

</details>

**2.** 어제 표에서 p-value가 가장 작은 유전자를 골라 그렸더니 두 군이 깨끗하게 갈렸습니다. 이 그림을 "강한 증거"로 제시하면 안 되는 이유는?

<details><summary>정답 보기</summary>

수백 개 중 가장 잘 갈리는 것을 골랐으니 잘 갈려 보이는 것이 당연하기 때문입니다. 선택 과정이 이미 결과를 반영했으므로, 그림은 "후보를 보여 주는 것"이지 독립적인 확인이 아닙니다. 그래서 선정 근거를 data-driven으로 표시합니다.

</details>

**3.** 관심 유전자가 패널에 없습니다. 보고서에 쓸 수 있는 문장은? (가) "해당 유전자는 변화가 없었다" (나) "해당 유전자는 이 패널에 포함되지 않아 평가할 수 없었다" (다) 언급하지 않는다

<details><summary>정답 보기</summary>

(나). 측정하지 않은 것과 변화가 없는 것은 다릅니다. 패널 기반 assay의 범위가 제한적이라는 점은 Day 21 보고서의 한계에도 들어갑니다.

</details>

**4.** 뇌 조직 전체에서 미세아교세포 표지 유전자의 mRNA가 낮게 측정되었습니다. 가능한 설명 두 가지를 쓰세요.

<details><summary>정답 보기</summary>

세포 하나당 그 유전자의 발현이 줄었을 수도 있고, 조직 안에서 그 세포가 차지하는 비율이 줄었을(또는 채취 부위의 세포 구성이 달랐을) 수도 있습니다. 조직을 통째로 측정한 데이터는 이 둘을 구분하지 못합니다.

</details>

**5.** 그림 제목에 "low detection"이라고 표시된 유전자를 어떻게 다뤄야 할까요?

<details><summary>정답 보기</summary>

대부분의 샘플에서 배경 잡음 수준으로만 측정된 유전자이므로, 점들의 높낮이는 잡음일 가능성이 큽니다. 후보에서 빼거나, 남긴다면 "검출이 불안정해 해석하지 않음"이라고 명시합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 실제 데이터로 후보 5–10개를 정하고 `processed/candidate_genes.csv`에 저장했다.
- [ ] 각 후보의 선정 근거(a priori / data-driven)가 적혀 있다.
- [ ] `figures/osdr_real_gene_level.png`가 있고, 샘플 하나가 점 하나로 보인다.
- [ ] 후보 유전자 검토 표를 채웠다.
- [ ] 그림 캡션에 정규화 방법, n, "탐색적"이라는 표현이 들어 있다.

---
[← 이전](day-18.md) · [코스 지도](../../README.md) · [다음 →](day-20.md)
