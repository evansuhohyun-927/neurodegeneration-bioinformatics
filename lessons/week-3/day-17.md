# Day 17 — 탐색적 분석: 분포, 정규화, PCA

> **주차:** 3주차 · **예상 시간:** 75–90분 · **산출물:** `02_osdr_qc_and_pca.ipynb`

## 오늘의 목표
- 대조 프로브와 housekeeping 유전자를 이용해 샘플별 품질을 점검하고 count를 정규화할 수 있다.
- 조건별 boxplot, density plot, PCA 그림을 그릴 수 있다.
- outlier 후보를 근거와 함께 기록하되, 섣불리 제외하지 않을 수 있다.

## 🎬 영상으로 먼저 보기
- [StatQuest: PCA main ideas in only 5 minutes!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=HMOI_lkzW08) (6:04)
- **무엇에 주목할까:** PCA 그림에서 가까이 있는 점은 "발현 패턴이 비슷한 샘플"이라는 것, 그리고 PC1이 PC2보다 더 많은 차이를 설명한다는 것 두 가지만 가져가세요. 축에 적힌 퍼센트(설명된 분산)를 읽는 법도 나옵니다.
- [Boxplots are Awesome!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=fHLhBnmwUM0) (2:33)
- **무엇에 주목할까:** 상자의 가운데 선이 중앙값, 상자가 가운데 50%라는 것을 복습합니다. 오늘은 상자 하나가 "샘플 하나의 유전자 전체 분포"를 뜻합니다.

## 개념 설명

### 통계 검정 전에 먼저 "눈으로" 본다

조직 절편을 염색하면 정량화 프로그램을 돌리기 전에 먼저 현미경으로 훑어봅니다. 절편이 접혔는지, 염색이 한쪽만 진한지 확인하기 위해서입니다. **탐색적 분석(exploratory data analysis, EDA)** 이 그 단계입니다. 오늘 보는 것은 세 가지입니다. 샘플마다 전체 신호의 높낮이가 비슷한가(boxplot), 분포의 모양이 비슷한가(density plot), 샘플들이 서로 얼마나 닮았고 무엇에 따라 갈리는가(PCA). 여기서 발견되는 문제는 대부분 생물학이 아니라 기술적인 것입니다. RNA가 덜 들어간 샘플, 유난히 잡음이 큰 샘플 같은 것들입니다. 이런 차이를 정리하지 않고 군 비교를 하면 "비행 효과"가 아니라 "RNA 투입량 차이"를 발견하게 됩니다.

### 대조 프로브와 housekeeping은 저울의 영점이다

nCounter 파일에는 측정 대상 외에 세 종류의 기준자가 들어 있습니다. **Negative 대조**는 마우스 RNA에 붙을 짝이 없는 프로브라서, 여기서 세어진 값은 순수한 배경 잡음입니다. 어떤 유전자의 count가 이 잡음 수준과 비슷하다면 "발현이 낮다"가 아니라 "측정되지 않았다"에 가깝습니다. **Positive 대조**는 정해진 양을 넣어 준 합성 분자로, 기계가 제대로 세었는지 보여 줍니다. **Housekeeping 유전자**는 조건과 상관없이 비슷하게 발현된다고 가정하는 유전자입니다. 샘플 A의 housekeeping count가 전반적으로 B의 두 배라면 A에 RNA가 두 배 들어갔다고 보고, A의 모든 유전자를 2로 나눠 줍니다. 웨스턴 블롯에서 loading control 밴드로 나누는 것과 같은 생각입니다. 여러 housekeeping 유전자를 하나로 요약할 때는 **기하평균(geometric mean)** 을 씁니다. 값이 큰 유전자 하나가 평균을 끌고 가지 않게 하기 위해서입니다. 단, housekeeping 유전자 자체가 잡음 수준이면 기준자로 쓸 수 없으니 count가 너무 낮은 것은 뺍니다.

이것은 가장 단순한 정규화 방식 중 하나이고 유일한 정답이 아닙니다. 원 논문이 어떤 소프트웨어와 방법으로 정규화했는지는 논문의 Methods에서 직접 확인하고, 여러분의 방법과 다르면 그 차이를 Day 21 보고서의 한계에 적습니다.

### log2로 바꾸는 이유, PCA가 보여 주는 것

count는 한 자릿수부터 수만까지 퍼져 있어 그대로 그리면 큰 값 몇 개만 보입니다. log2를 취하면 "두 배"가 항상 같은 간격(1)이 되어 낮은 유전자와 높은 유전자를 한 그림에서 볼 수 있습니다. 0에 log를 취할 수 없으므로 1을 더한 뒤 취합니다. PCA는 수백 개 유전자의 값을 샘플마다 좌표 두 개로 요약하는 방법입니다(2주차 복습). 점이 군별로 갈리면 군 차이가 데이터의 큰 흐름이라는 뜻이고, 한 점만 멀리 떨어져 있으면 **outlier 후보**입니다. 여기서 "후보"라는 말이 중요합니다. 군당 6마리에서 한 마리를 빼면 표본의 17%가 사라집니다. 기술적 문제의 증거(배경 잡음이 유난히 높다, housekeeping이 거의 안 잡혔다)가 있을 때만 제외를 고려하고, 오늘은 **기록만** 합니다. 또 하나 기억할 것: PCA에서 군이 깨끗하게 갈려도 그 원인이 처리 순서나 측정 위치 같은 기술적 요인일 수 있습니다. 군과 기술적 요인이 겹쳐 있으면 데이터만으로는 둘을 구분할 수 없습니다.

## 예시로 이해하기

### 예시 1 — housekeeping으로 나누면 투입량 차이가 사라진다

```python
import numpy as np
import pandas as pd

raw = pd.DataFrame(
    {"HK1": [100, 200], "HK2": [400, 800], "GeneX": [50, 100], "GeneY": [30, 120]},
    index=["sampleA", "sampleB"],            # sampleB에는 RNA가 2배 들어갔다고 가정
)
hk_geo = np.exp(np.log(raw[["HK1", "HK2"]]).mean(axis=1))    # 기하평균
size_factor = hk_geo / hk_geo.mean()
norm = raw[["GeneX", "GeneY"]].div(size_factor, axis=0)

print(size_factor.round(2).to_string())
print(norm.round(1).to_string())
```

```text
sampleA    0.67
sampleB    1.33
         GeneX  GeneY
sampleA   75.0   45.0
sampleB   75.0   90.0
```

GeneX는 정규화 뒤 두 샘플에서 같아졌습니다(차이가 투입량 때문이었음). GeneY는 정규화 뒤에도 B가 두 배입니다(진짜 차이).

### 예시 2 — log2를 취하면 "두 배"가 같은 간격이 된다

```python
counts = np.array([0, 9, 19, 39, 1023, 2047])
print(np.log2(counts + 1))
```

```text
[ 0.          3.32192809  4.32192809  5.32192809 10.         11.        ]
```

9→19와 1023→2047은 원래 숫자로는 10과 1024 차이지만, log2에서는 둘 다 1 차이(두 배)입니다.

### 예시 3 — 아주 작은 PCA

```python
from sklearn.decomposition import PCA

toy = pd.DataFrame(
    {"g1": [5.0, 5.2, 4.9, 7.1, 7.0, 6.8],
     "g2": [3.0, 3.1, 2.9, 1.0, 1.2, 0.9],
     "g3": [6.0, 6.1, 5.9, 6.0, 6.1, 6.0]},
    index=["A1", "A2", "A3", "B1", "B2", "B3"],
)
pca = PCA(n_components=2)
scores = pd.DataFrame(pca.fit_transform(toy), index=toy.index, columns=["PC1", "PC2"])
print(scores.round(2).to_string())
print("설명된 분산 비율:", pca.explained_variance_ratio_.round(3))
```

```text
     PC1   PC2
A1  1.40 -0.02
A2  1.33  0.21
A3  1.40 -0.19
B1 -1.50  0.05
B2 -1.28  0.15
B3 -1.36 -0.21
설명된 분산 비율: [0.986 0.013]
```

A와 B가 PC1의 부호로 깨끗이 갈립니다. g1과 g2가 군에 따라 반대로 움직이기 때문이고, 거의 변하지 않는 g3은 PCA에 기여하지 않습니다.

## 직접 해보기

어제처럼 먼저 `MODE = "practice"`로 끝까지 실행한 뒤 `"real"`로 바꿔 다시 실행합니다. 그림의 글자는 영어로 둡니다(기본 글꼴에 한글이 없어 깨질 수 있습니다).

1. 설정 셀과 어제 저장한 표를 불러옵니다.

```python
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

MODE = "practice"          # 연습이 끝나면 "real"로 바꾸세요
RAW_DIR = Path("../data/osdr_536_practice" if MODE == "practice" else "../data/osdr_536")
OUT_DIR = RAW_DIR / "processed"
FIG_DIR = Path("../figures")
FIG_DIR.mkdir(exist_ok=True)

counts = pd.read_csv(OUT_DIR / "counts_raw.csv", index_col=0)
probes = pd.read_csv(OUT_DIR / "probes.csv")
samples = pd.read_csv(OUT_DIR / "samples.csv").set_index("sample_id").loc[counts.index]

def names(code_class):
    return probes.loc[probes["CodeClass"] == code_class, "Name"].tolist()

endo, hk, neg, pos = (counts[names(c)] for c in ["Endogenous", "Housekeeping", "Negative", "Positive"])
colors = samples["group"].map({"FLT": "tab:red", "GC": "tab:blue"})
print(endo.shape, hk.shape, neg.shape, pos.shape)
```

```text
(12, 60) (12, 4) (12, 8) (12, 6)
```

2. 샘플별 QC 표를 만듭니다. 배경 기준은 "Negative 대조의 평균 + 2 × 표준편차"로 잡습니다.

```python
hk_use = hk.columns[hk.min() >= 20]                 # 너무 낮은 housekeeping은 기준자로 쓰지 않음
hk_geo = np.exp(np.log(hk[hk_use]).mean(axis=1))
background = neg.mean(axis=1) + 2 * neg.std(axis=1)

sample_qc = pd.DataFrame({
    "source": samples["source"],
    "group": samples["group"],
    "endo_total": endo.sum(axis=1),
    "hk_geomean": hk_geo.round(1),
    "size_factor": (hk_geo / hk_geo.mean()).round(2),
    "background": background.round(1),
    "pos_max": pos.max(axis=1),
    "pct_detected": (endo.gt(background, axis=0).mean(axis=1) * 100).round(1),
})
print("사용한 housekeeping:", len(hk_use), "/", hk.shape[1])
print(sample_qc.to_string())
```

```text
사용한 housekeeping: 3 / 4
          source group  endo_total  hk_geomean  size_factor  background  pos_max  pct_detected
sample_id                                                                                     
P01           F1   FLT       31322       455.4         1.14         9.9    30094         100.0
P02           F2   FLT       24302       358.9         0.90        10.7    29943         100.0
P03           F3   FLT       30957       486.2         1.22        10.1    29956          98.3
P04           F4   FLT       27816       460.8         1.16        12.8    29808          98.3
P05           F5   FLT       25922       357.4         0.90         9.8    29716          98.3
P06           F6   FLT       28329       516.6         1.30        10.5    30087         100.0
P07          GC1    GC       15910       243.2         0.61        10.5    30178          93.3
P08          GC2    GC       21101       322.1         0.81         8.7    29778         100.0
P09          GC3    GC       27432       418.6         1.05        13.1    29998         100.0
P10          GC4    GC       31286       410.2         1.03        13.0    30184         100.0
P11          GC5    GC       18808       272.8         0.68        10.4    29877         100.0
P12          GC6    GC       33189       479.4         1.20         9.4    30056         100.0
```

   표를 읽으며 세 가지를 적습니다. (가) `size_factor`가 샘플마다 얼마나 다른가, (나) 그 차이가 **군과 겹치는가**(한 군이 전반적으로 낮거나 높은가), (다) `pct_detected`가 유난히 낮은 샘플이 있는가, (라) `pos_max`가 샘플마다 비슷한가. Positive 대조는 모든 샘플에 같은 양을 넣는 것이므로, 이 값이 군에 따라 다르다면 RNA 양이 아니라 측정 과정의 차이를 시사합니다.

3. 정규화하고 log2로 바꿉니다. 배경보다 높게 잡힌 샘플이 절반 미만인 유전자는 "측정이 불안정한 유전자"로 표시해 둡니다.

```python
norm = endo.div(sample_qc["size_factor"], axis=0)
log2_raw = np.log2(endo + 1)
log2_norm = np.log2(norm + 1)

gene_qc = pd.DataFrame({
    "detected_frac": endo.gt(background, axis=0).mean(),
    "mean_log2": log2_norm.mean(),
})
gene_qc["keep"] = gene_qc["detected_frac"] >= 0.5
print("전체 유전자:", len(gene_qc), "| 분석에 남길 유전자:", int(gene_qc["keep"].sum()))
```

```text
전체 유전자: 60 | 분석에 남길 유전자: 60
```

4. 샘플별 boxplot을 정규화 전후로 나란히 그립니다.

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 4), sharey=True)
for ax, data, title in [(axes[0], log2_raw, "Before normalization"),
                        (axes[1], log2_norm, "After housekeeping normalization")]:
    bp = ax.boxplot(data.T.values, patch_artist=True)
    for box, c in zip(bp["boxes"], colors):
        box.set_facecolor(c)
        box.set_alpha(0.6)
    ax.set_xticks(range(1, len(data) + 1), samples["source"], rotation=90)
    ax.set_title(title)
axes[0].set_ylabel("log2(count + 1)")
fig.suptitle("Per-sample distribution (red = FLT, blue = GC)")
fig.tight_layout()
fig.savefig(FIG_DIR / f"osdr_{MODE}_boxplot.png", dpi=150)
```

5. density plot을 그립니다. 선 하나가 샘플 하나입니다.

```python
fig, ax = plt.subplots(figsize=(6, 4))
for sid in log2_norm.index:
    log2_norm.loc[sid].plot.density(ax=ax, color=colors[sid], alpha=0.7, linewidth=1)
ax.set_xlabel("log2(normalized count + 1)")
ax.set_title("Density per sample (red = FLT, blue = GC)")
fig.tight_layout()
fig.savefig(FIG_DIR / f"osdr_{MODE}_density.png", dpi=150)
```

6. 남긴 유전자로 PCA를 그리고, 좌표를 표로도 봅니다.

```python
X = log2_norm.loc[:, gene_qc["keep"]]
pca = PCA(n_components=2)
pcs = pd.DataFrame(pca.fit_transform(X), index=X.index, columns=["PC1", "PC2"])
var = pca.explained_variance_ratio_ * 100

fig, ax = plt.subplots(figsize=(5.5, 4.5))
ax.scatter(pcs["PC1"], pcs["PC2"], c=colors, s=60)
for sid, row in pcs.iterrows():
    ax.annotate(samples.loc[sid, "source"], (row["PC1"], row["PC2"]),
                xytext=(4, 4), textcoords="offset points", fontsize=8)
ax.set_xlabel(f"PC1 ({var[0]:.1f}%)")
ax.set_ylabel(f"PC2 ({var[1]:.1f}%)")
ax.set_title("PCA of normalized log2 counts (red = FLT, blue = GC)")
fig.tight_layout()
fig.savefig(FIG_DIR / f"osdr_{MODE}_pca.png", dpi=150)

center = pcs.groupby(samples["group"]).transform("mean")       # 자기 군의 중심
dist = np.sqrt(((pcs - center) ** 2).sum(axis=1))
sample_qc["dist_ratio"] = (dist / dist.median()).round(2)
print(f"PC1 {var[0]:.1f}%, PC2 {var[1]:.1f}%")
print(sample_qc[["source", "group", "size_factor", "pct_detected", "dist_ratio"]].to_string())
```

```text
PC1 28.2%, PC2 14.6%
          source group  size_factor  pct_detected  dist_ratio
sample_id                                                    
P01           F1   FLT         1.14         100.0        1.16
P02           F2   FLT         0.90         100.0        0.53
P03           F3   FLT         1.22          98.3        1.26
P04           F4   FLT         1.16          98.3        0.69
P05           F5   FLT         0.90          98.3        1.44
P06           F6   FLT         1.30         100.0        0.67
P07          GC1    GC         0.61          93.3        3.63
P08          GC2    GC         0.81         100.0        0.54
P09          GC3    GC         1.05         100.0        0.84
P10          GC4    GC         1.03         100.0        0.71
P11          GC5    GC         0.68         100.0        1.62
P12          GC6    GC         1.20         100.0        1.56
```

   `dist_ratio`는 "자기 군 중심에서 떨어진 거리가 보통 샘플의 몇 배인가"입니다. 정해진 기준선은 없지만 2.5배를 넘으면 한 번 더 들여다볼 만합니다.

7. 결과를 저장합니다.

```python
log2_norm.to_csv(OUT_DIR / "log2_norm.csv")
gene_qc.to_csv(OUT_DIR / "gene_qc.csv")
sample_qc.to_csv(OUT_DIR / "sample_qc.csv")
print("저장 완료:", sorted(p.name for p in OUT_DIR.glob("*.csv")))
```

```text
저장 완료: ['counts_raw.csv', 'gene_qc.csv', 'log2_norm.csv', 'probes.csv', 'qc_summary.csv', 'sample_qc.csv', 'samples.csv']
```

8. `MODE = "real"`로 바꿔 다시 실행한 뒤, 노트북 마지막에 마크다운 셀로 아래 표를 채웁니다.

```markdown
### Outlier 후보 기록 (제외하지 않음, 기록만)
| 샘플(source) | 무엇이 눈에 띄었나 | 근거 수치 | 기술적 원인으로 볼 증거가 있나 | 결정 |
|---|---|---|---|---|
| | | | | 유지 / 민감도 분석에서만 제외 |

### 군과 겹치는 기술적 차이
- size_factor, background, pct_detected가 군에 따라 체계적으로 다른가? [관찰한 내용]
- 그렇다면 정규화 뒤 boxplot에서 그 차이가 얼마나 줄었는가? [관찰한 내용]
- 이 점이 해석에 주는 한계: [한 문장]
```

⚠️ **흔한 오류 1 — boxplot의 색이 군과 맞지 않는다.** `colors`를 만든 뒤 `counts`의 행 순서를 바꾸지 않았는지 확인하세요. 1번 셀에서 `samples`를 `counts.index` 순서로 맞춘 것이 바로 어제 배운 "ID로 잇기"입니다.

⚠️ **흔한 오류 2 — 정규화 전 그림만 보고 "FLT에서 유전자가 전반적으로 감소"라고 적는다.** 정규화 전 차이는 대부분 투입량·측정 조건의 차이입니다. 생물학적 해석은 반드시 정규화 뒤 값으로 하고, 정규화가 군 차이를 완전히 지웠다고도 가정하지 마세요.

## 퀴즈

**1.** Negative 대조 프로브의 count가 뜻하는 것은? (가) 발현이 억제된 유전자 (나) 배경 잡음 수준 (다) 기계 고장

<details><summary>정답 보기</summary>

(나). Negative 프로브는 마우스 RNA에 짝이 없으므로 세어진 값은 비특이적 신호입니다. 어떤 유전자의 count가 이 수준과 비슷하면 그 유전자는 사실상 검출되지 않은 것으로 봅니다.

</details>

**2.** housekeeping 유전자 중 count가 0–10 정도인 것을 정규화 기준에서 뺀 이유는?

<details><summary>정답 보기</summary>

잡음 수준의 값은 우연에 따라 몇 배씩 흔들립니다. 그런 유전자를 기준자에 넣으면 정규화 계수 자체가 불안정해져 모든 유전자에 잡음을 퍼뜨립니다. 영점이 흔들리는 저울로 무게를 재는 것과 같습니다.

</details>

**3.** PCA에서 FLT와 GC가 PC1을 따라 깨끗하게 갈렸습니다. "비행이 뇌 유전자 발현을 크게 바꿨다"고 결론 내려도 될까요?

<details><summary>정답 보기</summary>

아직 안 됩니다. 군과 기술적 요인(측정 순서, 카트리지 내 위치, 처리 날짜 등)이 겹쳐 있으면 PCA는 둘을 구분하지 못합니다. sample QC 표에서 기술적 지표가 군에 따라 체계적으로 다른지 확인하고, 다르다면 한계로 적어야 합니다.

</details>

**4.** 한 샘플이 PCA에서 멀리 떨어져 있습니다. 가장 적절한 행동은? (가) 즉시 제외 (나) 근거 수치와 함께 후보로 기록하고, 기술적 원인의 증거를 찾는다 (다) 못 본 척한다

<details><summary>정답 보기</summary>

(나). 군당 6마리에서 한 마리를 빼는 것은 큰 결정이고, 결과를 본 뒤 마음에 드는 방향으로 빼면 편향이 생깁니다. 기록해 두고, 필요하면 "그 샘플을 뺀 경우에도 결론이 유지되는가"를 민감도 분석으로 확인합니다.

</details>

**5.** `np.log2(count + 1)`에서 1을 더하는 이유를 한 문장으로 쓰세요.

<details><summary>정답 보기</summary>

count가 0인 칸에 log를 취하면 음의 무한대가 되어 계산과 그림이 깨지기 때문입니다. 1을 더하면 0은 0으로, 큰 값은 거의 그대로 변환됩니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `02_osdr_qc_and_pca.ipynb`가 위에서 아래로 오류 없이 실행된다(연습·실제 모두).
- [ ] `figures/`에 실제 데이터의 boxplot, density, PCA 그림 3개가 있다.
- [ ] `processed/`에 `log2_norm.csv`, `gene_qc.csv`, `sample_qc.csv`가 있다.
- [ ] outlier 후보 표를 채웠다(후보가 없으면 "없음"과 그 근거).
- [ ] 군과 겹치는 기술적 차이가 있는지 관찰해 적었다.

---
[← 이전](day-16.md) · [코스 지도](../../README.md) · [다음 →](day-18.md)
