# Day 14 — PCA와 heatmap: 샘플 전체를 한눈에 보기

> **주차:** 2주차 · **예상 시간:** 75–90분 · **산출물:** `figures/day14_pca.png` + 5문장 해석 (heatmap `figures/day14_heatmap.png` 포함)

## 오늘의 목표
- PCA와 heatmap이 각각 어떤 질문에 답하는 그림인지 설명할 수 있다.
- 가상 count matrix를 변환해 PCA 그림과 군집 heatmap을 만들 수 있다.
- PCA 그림을 과장하지 않고 5문장으로 해석할 수 있다(분리되지 않아도 실패가 아니라는 점 포함).

## 🎬 영상으로 먼저 보기

- [StatQuest: PCA main ideas in only 5 minutes!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=HMOI_lkzW08) (6:04)
- **무엇에 주목할까:** 유전자 수천 개의 정보를 축 두 개로 줄여 "비슷한 샘플끼리 가까이" 놓는다는 큰 그림만 잡으세요. 축(PC1, PC2)마다 중요도가 다르고, PC1 방향의 거리가 PC2 방향의 같은 거리보다 더 큰 차이를 뜻한다는 설명이 해석의 핵심입니다.

- [Drawing and Interpreting Heatmaps — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=oMtDyOn2TCc) (16:48)
- **무엇에 주목할까:** 색이 raw 값이 아니라 유전자별로 표준화(z-score)한 값이라는 점, 그리고 행과 열의 순서가 군집화(clustering)로 다시 정렬된다는 점을 보세요. 같은 데이터라도 스케일링과 군집 방법을 바꾸면 그림이 달라진다는 경고도 중요합니다.

- (더 깊이, 선택) [StatQuest: Principal Component Analysis (PCA), Step-by-Step — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=FgakZw6K1QQ) (21:57)

## 개념 설명

### PCA: 가장 많은 것이 보이는 각도로 사진 찍기

샘플 하나는 유전자 수백 개의 발현값으로 이루어져 있습니다. 유전자가 300개라면 각 샘플은 300차원 공간의 점 하나입니다. 우리는 300차원을 볼 수 없으니 2차원으로 줄여야 합니다.

**주성분분석(principal component analysis, PCA)** 은 입체 조각상의 사진을 찍는 일과 같습니다. 정면에서 찍으면 형태가 잘 보이지만 정수리 위에서 찍으면 동그라미만 보입니다. PCA는 점들이 **가장 넓게 퍼져 보이는 방향**을 찾아 그것을 첫 번째 축(**PC1**)으로 삼고, 그와 직각이면서 그다음으로 넓게 퍼지는 방향을 **PC2**로 삼습니다. 각 축이 전체 흩어짐 중 얼마를 담았는지가 **설명 분산 비율(explained variance ratio)** 입니다.

중요한 점은 PCA가 그룹 정보를 **전혀 모른다**는 것입니다. PCA는 "가장 큰 변동"을 찾을 뿐이고, 그것이 실험 조건일지, 배치일지(Day 11), 품질 나쁜 샘플 하나일지는 그려 봐야 압니다. 그래서 PCA는 가설을 검정하는 도구가 아니라 **데이터의 구조를 점검하는 도구**입니다.

### PCA 그림을 읽는 순서

1. **축 라벨의 %를 먼저 봅니다.** PC1이 60%면 그 축의 차이가 데이터의 주된 이야기이고, 12%면 여러 이야기 중 하나일 뿐입니다.
2. **혼자 떨어진 샘플이 있는지 봅니다.** 한 샘플이 멀리 있으면 나머지가 한 덩어리로 뭉쳐 보입니다. 이때 PC1은 "그 샘플 대 나머지"를 보여 줄 뿐입니다.
3. **색을 바꿔 가며 봅니다.** 조건으로, 배치로, 총 count로 색칠해 축이 무엇과 함께 움직이는지 찾습니다.
4. **그룹이 갈리는지는 마지막에 봅니다.**

여기서 2주차 핵심 규칙 두 가지가 나옵니다. **"PCA에서 그룹이 분리되지 않는다고 실험이 실패한 것은 아니다."** PCA는 많은 유전자가 함께 움직이는 큰 변화만 보여 줍니다. 수백 개 중 몇 개의 유전자만 달라졌다면 PCA에서는 보이지 않고, 유전자별 분석에서야 드러납니다. 반대로 그룹이 깨끗이 갈려도 그것이 조건 때문인지 배치 때문인지는 설계를 확인해야 압니다. 그리고 **"샘플이 적을수록 이상치 및 개별 샘플 plot을 반드시 확인한다."** 점이 12개뿐인 그림에서는 한 점이 축 전체를 차지할 수 있습니다.

### heatmap: 표를 색으로 읽기

**heatmap**은 유전자 × 샘플 표의 숫자를 색으로 바꾼 그림입니다. PCA가 "샘플들이 서로 얼마나 비슷한가"를 요약한다면, heatmap은 "어떤 유전자들이 어떤 샘플에서 높고 낮은가"를 직접 보여 줍니다.

두 가지 가공이 들어갑니다. 첫째, **행별 z-score**입니다. 유전자마다 평균을 빼고 표준편차로 나눠, 색이 "이 유전자의 평소 수준에 비해 높은가 낮은가"를 뜻하게 합니다. 이렇게 하지 않으면 원래 많이 발현되는 유전자만 진하게 보입니다. 둘째, **계층적 군집화(hierarchical clustering)** 입니다. 패턴이 비슷한 행끼리, 비슷한 열끼리 이웃하도록 순서를 다시 정하고, 그 결과를 나뭇가지 그림(dendrogram)으로 옆에 붙입니다.

heatmap을 볼 때 조심할 점이 있습니다. "가장 많이 변하는 유전자"나 "유의한 유전자"만 골라 그리면 그룹이 갈려 보이는 것이 당연합니다. 고르는 과정에서 이미 그런 유전자를 뽑았기 때문입니다. 그러니 heatmap은 증거가 아니라 **요약 그림**으로 다루고, 어떤 기준으로 유전자를 골랐는지 반드시 함께 적습니다.

### 입력 값: 어제의 규칙을 그대로

PCA와 heatmap에는 raw count가 아니라 **정규화하고 log(또는 VST) 변환한 값**을 씁니다. 어제 예시 2에서 본 것처럼, 변환하지 않으면 고발현 유전자 몇 개가 축을 독차지합니다. 오늘은 `log2(CPM + 1)`을 쓰고, PCA 전에 유전자별로 표준화해 모든 유전자가 비슷한 무게로 참여하게 합니다.

데이터에 대해 한 가지 알려 둘 것이 있습니다. Day 12에 확인했듯이 OSD-536의 파일 목록에는 정규화된 발현 표가 없고 샘플별 원시 RCC 파일만 있습니다. 그 파일들을 하나의 행렬로 합치는 일은 3주차(Day 15–17)의 과제이므로, 오늘은 OSD-536과 같은 모양(그룹당 6개, 총 12개 샘플)의 **가상 count matrix**로 연습합니다. 가상 데이터의 결과는 OSD-536에 대해 아무것도 말해 주지 않습니다.

## 예시로 이해하기

세 예시는 한 노트북에서 순서대로 실행합니다. 예시 2와 3은 예시 1에서 정의한 함수를 씁니다.

### 예시 1 — 많은 유전자가 달라진 경우: PCA가 그룹을 가른다

유전자 300개 중 60개가 FLT에서 2배 높은 가상 실험입니다.

```python
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA

def simulate(n_de, seed, n_genes=300, effect=2.0):
    """샘플 12개(GC 6, FLT 6) × 유전자 n_genes개의 가상 raw count를 만든다."""
    rng = np.random.default_rng(seed)
    group = np.array(["GC"] * 6 + ["FLT"] * 6)
    samples = [f"GC{i}" for i in range(1, 7)] + [f"FLT{i}" for i in range(1, 7)]
    level = rng.lognormal(4, 1, n_genes)
    fold = np.ones((n_genes, 12))
    fold[:n_de, 6:] = effect                           # 앞의 n_de개 유전자만 FLT에서 2배
    depth = rng.uniform(0.7, 1.4, 12)
    mu = level[:, None] * fold * depth[None, :]
    counts = rng.negative_binomial(n=20, p=20 / (20 + mu))
    counts = pd.DataFrame(counts, index=[f"gene{i:03d}" for i in range(n_genes)], columns=samples)
    return counts, pd.Series(group, index=samples, name="group")

def log_cpm(counts):
    return np.log2(counts / counts.sum() * 1_000_000 + 1)

def run_pca(counts):
    x = log_cpm(counts).T                              # 행 = 샘플, 열 = 유전자
    x = (x - x.mean()) / x.std()                       # 유전자별 표준화(z-score)
    pca = PCA(n_components=2)
    pcs = pd.DataFrame(pca.fit_transform(x), index=x.index, columns=["PC1", "PC2"])
    return pcs, pca.explained_variance_ratio_

counts, group = simulate(n_de=60, seed=14)
pcs, ratio = run_pca(counts)
print("설명 분산 비율:", ratio.round(2))
print(pcs.join(group).groupby("group")[["PC1", "PC2"]].mean().round(1))
```

출력:

```text
설명 분산 비율: [0.24 0.1 ]
       PC1  PC2
group          
FLT    8.1 -0.0
GC    -8.1  0.0
```

PC1이 전체 변동의 24%를 담고, 두 그룹의 PC1 평균이 +8.1과 −8.1로 갈렸습니다. 유전자의 20%가 한 방향으로 움직였으므로 "가장 큰 변동 방향"이 곧 그룹 차이가 된 것입니다.

### 예시 2 — 몇 개의 유전자만 달라진 경우: PCA는 못 보지만 차이는 있다

이번에는 300개 중 5개만 FLT에서 2배 높습니다.

```python
counts2, group2 = simulate(n_de=5, seed=17)            # 300개 중 5개만 진짜로 다르다
pcs2, ratio2 = run_pca(counts2)
print("설명 분산 비율:", ratio2.round(2))
print("PC1 순서대로 샘플 나열:", list(pcs2["PC1"].sort_values().index))
print("PC2 순서대로 샘플 나열:", list(pcs2["PC2"].sort_values().index))

one_gene = log_cpm(counts2).loc["gene000"]             # 진짜로 다른 5개 중 하나
print("\ngene000의 샘플별 log2(CPM+1):")
print(one_gene.round(1).to_dict())
```

출력:

```text
설명 분산 비율: [0.12 0.11]
PC1 순서대로 샘플 나열: ['FLT5', 'GC2', 'FLT2', 'FLT6', 'FLT3', 'GC4', 'GC6', 'GC5', 'FLT1', 'FLT4', 'GC1', 'GC3']
PC2 순서대로 샘플 나열: ['GC4', 'FLT4', 'GC1', 'FLT5', 'FLT1', 'FLT3', 'GC6', 'GC2', 'GC5', 'FLT2', 'GC3', 'FLT6']

gene000의 샘플별 log2(CPM+1):
{'GC1': 12.7, 'GC2': 12.7, 'GC3': 11.8, 'GC4': 12.7, 'GC5': 12.0, 'GC6': 12.7, 'FLT1': 13.2, 'FLT2': 13.8, 'FLT3': 13.7, 'FLT4': 13.8, 'FLT5': 13.8, 'FLT6': 13.7}
```

PC1과 PC2 어느 쪽으로 줄을 세워도 GC와 FLT가 뒤섞여 있습니다. 설명 분산도 12%, 11%로 두드러진 축이 없습니다. 그런데 gene000 하나만 보면 FLT 6개(13.2–13.8)가 모두 GC 6개(11.8–12.7)보다 높습니다. 차이는 분명히 있는데 PCA에 안 보일 뿐입니다. "PCA에서 안 갈리니 효과가 없다"는 결론은 틀립니다.

### 예시 3 — 품질이 나쁜 샘플 하나가 PCA를 차지한다

예시 1의 데이터에서 FLT6 샘플 하나만 유전자마다 무작위로 값을 흔들어 망가뜨립니다.

```python
counts3, group3 = simulate(n_de=60, seed=14)
noise = np.random.default_rng(0).lognormal(0, 1.0, len(counts3))
counts3["FLT6"] = (counts3["FLT6"] * noise).round().astype(int)   # FLT6만 품질이 나쁜 샘플로 만든다
pcs3, ratio3 = run_pca(counts3)
print("설명 분산 비율:", ratio3.round(2))
print(pcs3.round(1))
```

출력:

```text
설명 분산 비율: [0.42 0.16]
       PC1  PC2
GC1    5.9 -6.3
GC2    4.7 -5.2
GC3    4.3 -6.0
GC4    5.3 -5.6
GC5    5.8 -5.0
GC6    3.5 -6.6
FLT1   0.4  7.5
FLT2   1.8  7.5
FLT3   1.1  8.0
FLT4   0.8  8.6
FLT5   1.1  6.7
FLT6 -34.9 -3.7
```

PC1(42%)은 이제 "FLT6 대 나머지 11개"입니다. FLT6만 −34.9에 있고 나머지는 0–6 사이에 몰려 있습니다. 진짜 그룹 차이는 PC2로 밀려났습니다. 설명 분산 비율이 예시 1보다 높아졌다고 좋아할 일이 아닙니다. 샘플 이름을 붙여 그려 보지 않으면 이 상황을 "그룹이 잘 갈렸다"로 오해하기 쉽습니다.

## 직접 해보기

1. 어제 만든 `notebooks/02_osdr_qc_and_pca.ipynb`에 `## Day 14 — PCA와 heatmap 연습 (가상 데이터)` 섹션을 추가하고 예시 1을 실행합니다.
2. PCA 그림을 그립니다. 축 라벨에 설명 분산 비율을 넣고, 점마다 샘플 이름을 붙입니다.

   ```python
   import matplotlib.pyplot as plt
   import seaborn as sns

   d = pcs.join(group)
   fig, ax = plt.subplots(figsize=(5, 4))
   sns.scatterplot(data=d, x="PC1", y="PC2", hue="group", s=90, ax=ax)
   for name, row in d.iterrows():
       ax.annotate(name, (row["PC1"], row["PC2"]), fontsize=8, xytext=(4, 4), textcoords="offset points")
   ax.set_xlabel(f"PC1 ({ratio[0]:.0%})")
   ax.set_ylabel(f"PC2 ({ratio[1]:.0%})")
   plt.tight_layout()
   plt.savefig("../figures/day14_pca.png", dpi=150)
   plt.show()
   ```

3. heatmap을 그립니다. 가장 많이 변하는 유전자 30개를 골라, 유전자별 z-score로 색칠하고, 행과 열을 군집화합니다. 열 위의 색 띠는 그룹을 나타냅니다(회색 GC, 주황 FLT).

   ```python
   lc = log_cpm(counts)
   top = lc.var(axis=1).sort_values(ascending=False).head(30).index     # 가장 많이 변하는 유전자 30개
   g = sns.clustermap(lc.loc[top], z_score=0, cmap="vlag", center=0, figsize=(7, 8),
                      col_colors=group.map({"GC": "gray", "FLT": "orange"}))
   g.savefig("../figures/day14_heatmap.png", dpi=150)
   plt.show()
   ```

   이 레슨을 만들 때 실행한 결과에서는 열이 FLT 6개와 GC 6개로 깔끔하게 두 가지로 나뉘었고, 고른 30개 유전자 중 14개가 우리가 실제로 차이를 넣은 유전자(gene000–gene059)였습니다. 나머지 16개는 무엇 때문에 "많이 변하는 유전자"로 뽑혔을지 생각해 보세요(힌트: 발현이 낮은 유전자의 잡음).
4. 예시 2와 예시 3을 실행합니다. 각각 2단계의 그림 코드에서 `pcs`, `group`, `ratio`를 `pcs2`, `group2`, `ratio2`(또는 `pcs3`, `group3`, `ratio3`)로 바꿔 PCA 그림을 그려 봅니다(파일 이름도 `day14_pca_ex2.png`처럼 바꿉니다). 세 그림을 나란히 놓고 어떤 점이 다른지 봅니다.
5. 예시 2 데이터에서 gene000을 개별 샘플 그림으로 그립니다.

   ```python
   one = pd.DataFrame({"group": group2, "log2(CPM+1)": log_cpm(counts2).loc["gene000"]})
   fig, ax = plt.subplots(figsize=(3.5, 4))
   sns.stripplot(data=one, x="group", y="log2(CPM+1)", size=8, color="black", ax=ax)
   ax.set_title("gene000")
   plt.tight_layout()
   plt.show()
   ```

   PCA에서는 보이지 않던 차이가 유전자 하나의 그림에서는 분명히 보이는지 확인합니다.
6. **5문장 해석**을 씁니다. 2단계에서 만든 그림(예시 1 데이터) 아래 Markdown 셀에 아래 틀에 맞춰 한 문장씩 적습니다.

   ```markdown
   ### PCA 해석 (5문장)
   1. (입력) 이 PCA는 ____ 값을 사용했고, 샘플 __개 × 유전자 __개로 계산했다.
   2. (축) PC1은 전체 변동의 __%, PC2는 __%를 설명한다.
   3. (이상치) 다른 샘플과 동떨어진 샘플은 ____ (없음 / 있음: 이름).
   4. (구조) PC1 방향으로 ____와 ____가 나뉘며, 이는 ____(조건/배치/품질)과 함께 움직인다.
   5. (한계) 이 그림은 ____을 보여 줄 뿐 ____을 증명하지 않으며, 이것은 가상 데이터이므로 OSD-536에 대한 결론이 아니다.
   ```

   그다음 예시 2의 그림에 대해서도 같은 틀로 써 봅니다. 4번 문장에 "그룹이 분리되지 않았다. 이는 효과가 없다는 뜻이 아니라 ____"를 넣어 완성하세요.
7. 2주차를 마무리합니다. `learning-log.md`에 이번 주 산출물 목록(노트북 2개, 메모 3개, 데이터 사전, 그림들)을 적고, 핵심 규칙 세 가지를 보지 않고 써 본 뒤 commit합니다.

⚠️ **흔한 오류 1 — 샘플과 유전자의 방향이 뒤바뀐 PCA**
scikit-learn의 PCA는 **행을 샘플**로 봅니다. count 표는 보통 행이 유전자이므로 `.T`로 뒤집어야 합니다. PCA 결과의 점이 12개가 아니라 300개 나왔다면 뒤집는 것을 잊은 것입니다.

⚠️ **흔한 오류 2 — `clustermap`에서 `ValueError`(NaN 또는 inf 관련)**
모든 샘플에서 값이 같은 유전자는 표준편차가 0이라 z-score를 계산할 수 없습니다. 분산이 큰 유전자만 고르면 대개 피할 수 있습니다. 직접 만든 표에서 오류가 나면 `lc = lc[lc.var(axis=1) > 0]`으로 먼저 걸러 주세요.

## 퀴즈

**1.** (객관식) PCA와 heatmap의 입력으로 알맞은 값은?
① raw count ② 정규화 후 log 또는 VST 변환한 값 ③ p-value ④ 유전자 길이

<details><summary>정답 보기</summary>

②. 2주차 핵심 규칙 "raw count는 차등발현 모델에, 정규화/VST 값은 PCA와 시각화에 주로 사용한다"의 뒤 절반입니다. raw count로 PCA를 하면 library size 차이와 고발현 유전자 몇 개가 축을 차지해 버립니다.

</details>

**2.** PCA 그림에서 비행군과 대조군이 뒤섞여 있습니다. "이 실험은 실패했다"고 말할 수 없는 이유는?

<details><summary>정답 보기</summary>

PCA는 많은 유전자가 함께 움직이는 큰 변동만 보여 주기 때문입니다. 예시 2처럼 수백 개 중 몇 개의 유전자만 달라졌다면 PCA에는 나타나지 않아도 유전자별 그림과 검정에서는 분명한 차이가 보일 수 있습니다. 분리되지 않았다는 것은 "전반적인 발현 양상이 크게 다르지 않다"는 정보일 뿐입니다.

</details>

**3.** (단답) PC1이 42%를 설명하는 PCA 그림에서 샘플 하나만 멀리 떨어져 있고 나머지 11개는 한데 모여 있습니다. PC1은 무엇을 보여 주고 있을 가능성이 높으며, 다음에 할 일은 무엇인가요?

<details><summary>정답 보기</summary>

PC1은 그룹 차이가 아니라 "그 샘플 대 나머지"를 보여 주고 있을 가능성이 높습니다. Day 13의 QC 표(총 count, 검출 유전자 수, 상관)와 메타데이터로 그 샘플을 조사하고 기록한 뒤, 포함·제외 두 경우의 결과를 비교합니다. 샘플이 적을수록 이상치와 개별 샘플 plot을 반드시 확인한다는 규칙이 여기에 해당합니다.

</details>

**4.** "FDR < 0.05인 유전자 30개"로 heatmap을 그렸더니 두 그룹이 완벽하게 갈렸습니다. 이 그림을 "두 그룹이 다르다는 증거"로 제시하면 왜 문제가 될까요?

<details><summary>정답 보기</summary>

그룹 간 차이가 큰 유전자만 골랐으므로 그 유전자들로 그리면 그룹이 갈리는 것이 당연합니다(순환 논리). 이 heatmap은 선별된 유전자의 패턴을 보여 주는 요약 그림이지 독립적인 증거가 아닙니다. 그림 설명에 유전자 선별 기준을 반드시 적어야 합니다.

</details>

**5.** PCA에서 두 그룹이 PC1을 따라 깨끗하게 갈렸습니다. 이것을 처리 효과라고 말하기 전에 확인해야 할 것은?

<details><summary>정답 보기</summary>

조건과 배치(추출 날짜, 장비 lane·카트리지 등)가 겹쳐 있지 않은지 메타데이터 교차표로 확인해야 합니다. PCA는 가장 큰 변동을 보여 줄 뿐 그 원인이 무엇인지는 알려 주지 않습니다. Day 11의 교란된 설계에서도 PCA는 두 그룹을 깨끗하게 갈랐습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 노트북에 Day 14 섹션이 있고 예시 1–3이 실행된다.
- [ ] 샘플 이름과 설명 분산 비율이 들어간 PCA 그림(`figures/day14_pca.png`)이 있다.
- [ ] 군집 heatmap(`figures/day14_heatmap.png`)이 있고, 유전자 선별 기준을 적었다.
- [ ] 예시 1 그림에 대한 5문장 해석을 썼다.
- [ ] 예시 2(분리되지 않는 경우)에 대한 해석과 gene000 개별 그림이 있다.
- [ ] 2주차 핵심 규칙 세 가지를 `learning-log.md`에 자기 말로 적고 commit했다.

---
[← 이전](day-13.md) · [코스 지도](../../README.md) · [다음 →](../week-3/day-15.md)
