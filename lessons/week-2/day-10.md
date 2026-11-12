# Day 10 — 다중검정과 FDR: 1,000번 검정하면 생기는 일

> **주차:** 2주차 · **예상 시간:** 75–90분 · **산출물:** `figures/day10_fdr.png` (FDR 그림)

## 오늘의 목표
- 여러 유전자를 한꺼번에 검정하면 왜 거짓 양성이 쌓이는지 설명할 수 있다.
- FDR(false discovery rate)의 뜻과 Benjamini–Hochberg 보정의 원리를 말할 수 있다.
- 1,000개 가상 유전자에서 raw p-value와 FDR 보정 결과를 비교하는 그림을 만들 수 있다.

## 🎬 영상으로 먼저 보기

- [False Discovery Rates, FDR, clearly explained — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=K8LQSvtjcEo) (18:27)
- **무엇에 주목할까:** 진짜 차이가 없는 유전자들의 p-value는 0에서 1 사이에 고르게 퍼지고, 진짜 차이가 있는 유전자들의 p-value는 0 근처에 몰린다는 histogram을 꼭 보세요. 오늘 만들 그림이 바로 그 그림입니다. Benjamini–Hochberg 방법을 순위로 설명하는 뒷부분은 예시 2와 같이 보면 이해가 빠릅니다.

- [p-hacking: What it is and how to avoid it! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=HDCOUXE3HMM) (13:44)
- **무엇에 주목할까:** "여러 번 시도하고 잘 나온 것만 보고하는 것"이 왜 다중검정 문제와 같은 문제인지에 주목하세요. 유전자 수가 많을 때뿐 아니라 분석 방법을 이것저것 바꿔 볼 때도 같은 함정이 생깁니다.

## 개념 설명

### 복권을 1,000장 사면

어제 예시 3에서 진짜 차이가 전혀 없어도 약 5%의 실험에서 p < 0.05가 나오는 것을 봤습니다. 검정을 한 번만 한다면 5%는 감수할 만한 위험입니다. 그런데 발현 데이터에서는 유전자마다 검정을 합니다. OSD-536의 패널처럼 유전자가 수백 개면 수백 번, 전체 전사체면 2만 번입니다.

당첨 확률 5%인 복권을 1,000장 사면 약 50장이 당첨됩니다. 마찬가지로 **진짜 차이가 하나도 없는** 유전자 1,000개를 검정하면 약 50개가 p < 0.05로 나옵니다. 이것이 **다중검정(multiple testing)** 문제입니다. "p < 0.05인 유전자 50개를 찾았다"는 문장은, 아무 일도 일어나지 않은 실험에서도 똑같이 쓸 수 있습니다.

### 두 가지 오류율: FWER와 FDR

거짓 양성을 통제하는 방법은 크게 둘입니다. 하나는 **"거짓 양성이 단 하나라도 나올 확률"** 을 5% 아래로 묶는 것이고, 이를 FWER(family-wise error rate)라고 합니다. 가장 유명한 방법이 **Bonferroni 보정**으로, 기준을 0.05 ÷ 검정 횟수로 낮춥니다. 1,000개면 p < 0.00005여야 합니다. 안전하지만 너무 엄격해서 진짜 신호도 대부분 놓칩니다.

다른 하나가 **FDR(false discovery rate, 거짓 발견 비율)** 입니다. FDR은 **"유의하다고 뽑은 목록 중에서 거짓이 차지하는 비율"** 을 통제합니다. FDR 5%로 유전자 80개를 뽑았다면 그중 대략 4개쯤은 거짓일 것으로 예상하고 나머지를 받아들이겠다는 뜻입니다. 탐색 연구에서는 후보를 넉넉히 건지고 뒤에서 검증하는 것이 목적이므로, 유전체 분석은 대부분 FDR을 씁니다.

용어 정리: FDR 보정을 거친 값을 **adjusted p-value**, **padj**, 또는 **q-value**라고 부릅니다. 3주차에 읽을 차등발현 결과 표의 `adj.P.Val`이나 `padj` 열이 이것입니다.

### Benjamini–Hochberg 방법: 순위에 따라 다른 합격선

가장 널리 쓰이는 FDR 방법은 **Benjamini–Hochberg(BH)** 입니다. 절차는 단순합니다.

1. p-value를 작은 것부터 줄 세우고 순위(rank)를 매깁니다.
2. 각 p-value에 (전체 검정 수 ÷ 순위)를 곱합니다. 1등은 가장 크게 벌점을 받고, 꼴찌는 벌점이 없습니다.
3. 뒤에서부터 훑으며, 보정값이 자기보다 뒤 순위의 보정값보다 커지지 않도록 다듬습니다.

직관은 이렇습니다. 진짜 차이가 없으면 p-value는 0–1에 고르게 퍼지므로, 1,000개 중 k번째로 작은 p-value는 대략 k/1000쯤 됩니다. 실제 k번째 p-value가 그 기대보다 훨씬 작다면, 우연만으로는 설명하기 어려운 신호가 거기 섞여 있다는 뜻입니다. BH는 "순위에 비해 얼마나 작은가"로 합격 여부를 정합니다.

### FDR이 해 주지 않는 것

FDR 보정을 했다고 결과가 진실이 되는 것은 아닙니다. 첫째, FDR은 목록 전체의 거짓 비율을 말할 뿐, 목록 안의 **어느** 유전자가 거짓인지는 알려주지 않습니다. 둘째, 표본이 작으면 보정 후 아무것도 남지 않을 수 있습니다. 그것은 "변화가 없다"가 아니라 "이 표본으로는 확신할 수 없다"입니다. 셋째, 논문이나 데이터 설명에서 "p < 0.05"라고만 쓰여 있으면 raw p-value인지 보정값인지 반드시 확인해야 합니다. 같은 0.05라도 의미가 완전히 다릅니다.

## 예시로 이해하기

### 예시 1 — 1,000개 가상 유전자: raw p-value, FDR, Bonferroni 비교

정답을 아는 가상 실험입니다. 유전자 1,000개 중 앞의 100개만 두 그룹 사이에 진짜 차이가 있고, 나머지 900개는 차이가 없습니다.

```python
import numpy as np
from scipy import stats
from statsmodels.stats.multitest import multipletests

rng = np.random.default_rng(10)
n_genes, n_true, n = 1000, 100, 6      # 유전자 1000개 중 100개만 진짜 차이, 그룹당 6마리

effect = np.zeros(n_genes)
effect[:n_true] = 2.5                  # 앞의 100개 유전자만 진짜 차이(표준편차의 2.5배)
is_true = effect > 0

gc = rng.normal(0, 1, size=(n_genes, n))
flt = rng.normal(effect[:, None], 1, size=(n_genes, n))

pvals = stats.ttest_ind(flt, gc, axis=1).pvalue
reject, qvals, _, _ = multipletests(pvals, alpha=0.05, method="fdr_bh")

def count(sig, label):
    tp = (sig & is_true).sum()         # 진짜 차이를 맞게 찾음
    fp = (sig & ~is_true).sum()        # 차이가 없는데 '유의'하다고 함
    print(f"{label}: 유의 {sig.sum()}개 = 진짜 {tp}개 + 가짜 {fp}개 "
          f"(가짜 비율 {fp / max(sig.sum(), 1):.0%})")

count(pvals < 0.05, "raw p < 0.05 ")
count(reject,       "FDR(BH) < 0.05")
count(pvals < 0.05 / n_genes, "Bonferroni    ")
```

출력:

```text
raw p < 0.05 : 유의 144개 = 진짜 98개 + 가짜 46개 (가짜 비율 32%)
FDR(BH) < 0.05: 유의 82개 = 진짜 78개 + 가짜 4개 (가짜 비율 5%)
Bonferroni    : 유의 6개 = 진짜 6개 + 가짜 0개 (가짜 비율 0%)
```

raw p-value로 뽑은 목록은 세 개 중 하나가 가짜입니다(900 × 0.05 = 45개 예상, 실제 46개). FDR로 뽑으면 이번 시뮬레이션에서는 가짜 비율이 5% 근처로 내려갔고, 대신 진짜 20개를 놓쳤습니다. Bonferroni는 가짜가 없지만 진짜 100개 중 6개만 건졌습니다. 어느 쪽도 공짜가 아닙니다.

주의할 점이 있습니다. FDR 5%는 같은 실험을 여러 번 반복했을 때 평균적으로 기대되는 값이지, 이번 목록의 실제 가짜 비율을 보장하는 값이 아닙니다. 한 번의 분석에서는 그보다 높을 수도 낮을 수도 있고, 검정들이 서로 얽혀 있으면(함께 움직이는 유전자들) 더 달라질 수 있습니다. 실제 데이터에서는 어느 것이 가짜인지 모르므로 이 비율을 직접 확인할 수도 없습니다.

### 예시 2 — BH 보정을 손으로 계산하기

```python
import numpy as np
from statsmodels.stats.multitest import multipletests

p = np.array([0.001, 0.008, 0.039, 0.041, 0.20])
m = len(p)
rank = np.arange(1, m + 1)                  # p가 이미 작은 순서로 정렬되어 있음
by_hand = p * m / rank                      # p × (전체 개수 / 순위)
by_hand = np.minimum.accumulate(by_hand[::-1])[::-1]   # 뒤에서부터 누적 최솟값
print("손으로 계산:", by_hand.round(3))
print("statsmodels:", multipletests(p, method="fdr_bh")[1].round(3))
```

출력:

```text
손으로 계산: [0.005 0.02  0.051 0.051 0.2  ]
statsmodels: [0.005 0.02  0.051 0.051 0.2  ]
```

세 번째 값을 따라가 봅시다. 0.039 × 5/3 = 0.065인데, 네 번째 값이 0.041 × 5/4 = 0.051로 더 작으므로 세 번째도 0.051로 내려옵니다. raw p로는 0.039, 0.041 둘 다 "유의"였지만 보정 후에는 0.051로 기준을 아슬아슬하게 넘습니다.

### 예시 3 — 아무 차이도 없는 실험

```python
import numpy as np
from scipy import stats
from statsmodels.stats.multitest import multipletests

rng = np.random.default_rng(3)
a = rng.normal(0, 1, size=(1000, 6))
b = rng.normal(0, 1, size=(1000, 6))      # 모든 유전자에서 진짜 차이 없음
p = stats.ttest_ind(a, b, axis=1).pvalue
print("raw p < 0.05:", (p < 0.05).sum(), "개")
print("FDR < 0.05  :", multipletests(p, method="fdr_bh")[0].sum(), "개")
```

출력:

```text
raw p < 0.05: 51 개
FDR < 0.05  : 0 개
```

두 그룹이 완전히 같은데도 raw p-value는 51개의 "유의한 유전자"를 내놓습니다. FDR 보정 후에는 0개입니다. 보정 없이 "유의한 유전자 51개 발견"이라고 보고했다면 전부 우연이었을 것입니다.

## 직접 해보기

1. `notebooks/02_statistics_basics.ipynb` 맨 아래에 `## Day 10 — 다중검정과 FDR` 섹션을 만들고 예시 1을 실행합니다.
2. 같은 노트북에서 다음 코드로 그림 두 개를 나란히 그립니다. 왼쪽은 p-value histogram, 오른쪽은 작은 순으로 정렬한 p-value와 BH 합격선입니다.

   ```python
   import matplotlib.pyplot as plt

   fig, axes = plt.subplots(1, 2, figsize=(10, 4))

   axes[0].hist([pvals[~is_true], pvals[is_true]], bins=20, stacked=True,
                label=["no true difference", "true difference"])
   axes[0].set_xlabel("raw p-value")
   axes[0].set_ylabel("number of genes")
   axes[0].legend()

   order = np.argsort(pvals)
   k = np.arange(1, n_genes + 1)
   axes[1].plot(k[:200], pvals[order][:200], ".", label="sorted p-values")
   axes[1].plot(k[:200], 0.05 * k[:200] / n_genes, label="BH line: 0.05 x rank / 1000")
   axes[1].set_xlabel("rank")
   axes[1].set_ylabel("p-value")
   axes[1].legend()

   plt.tight_layout()
   plt.savefig("../figures/day10_fdr.png", dpi=150)
   plt.show()
   ```

3. 왼쪽 그림에서 확인합니다. 차이 없는 900개는 0–1 전체에 평평하게 깔려 있고(막대 하나에 약 45개), 진짜 차이가 있는 100개는 맨 왼쪽 막대에 몰려 있습니다. 맨 왼쪽 막대(p < 0.05)의 두 색 비율이 예시 1의 "진짜 98 + 가짜 46"과 맞는지 보세요.
4. 오른쪽 그림에서 확인합니다. 점들이 직선 아래에 있다가 위로 올라가는 지점의 순위가 FDR로 뽑힌 유전자 수(82개) 근처인지 봅니다.
5. 실험을 바꿔 봅니다. 각각 예시 1 셀을 고쳐 다시 실행하고 세 줄 출력의 변화를 표로 적은 뒤 원래 값으로 돌려놓습니다.
   - `n = 6`을 `n = 3`으로 (표본이 더 작으면?)
   - `effect[:n_true] = 2.5`를 `1.0`으로 (효과가 더 작으면?)
   - `n_true = 100`을 `10`으로 (진짜 신호가 드물면 raw p 목록의 가짜 비율은?)
6. 예시 2, 3을 실행합니다. 예시 2에서 0.039 × 5/3을 계산기로 직접 해 보고 0.051로 바뀌는 이유를 한 문장으로 적습니다.
7. 그림 아래 Markdown 셀에 "raw p-value 목록과 FDR 목록의 차이"를 3문장으로 설명합니다. `learning-log.md`에 기록하고 commit합니다.

⚠️ **흔한 오류 1 — `ModuleNotFoundError: No module named 'statsmodels'`**
1주차에 만든 환경이 활성화되지 않았거나 statsmodels가 빠져 있는 경우입니다. 터미널에서 프로젝트 환경을 활성화한 뒤 JupyterLab을 다시 열고, 그래도 없으면 `environment.yml`에 `statsmodels`가 있는지 확인하세요.

⚠️ **흔한 오류 2 — `multipletests`의 결과를 잘못 꺼낸다**
`multipletests`는 값 네 개를 돌려줍니다. 첫 번째(`[0]`)가 기각 여부(True/False 배열), 두 번째(`[1]`)가 보정된 p-value입니다. `qvals < 0.05`와 `reject`는 같은 결과여야 하니 `(reject == (qvals < 0.05)).all()`로 확인해 보세요.

## 퀴즈

**1.** (단답) 진짜 차이가 전혀 없는 유전자 757개를 각각 p < 0.05 기준으로 검정하면, 우연히 "유의"하게 나오는 유전자는 평균 몇 개쯤일까요?

<details><summary>정답 보기</summary>

757 × 0.05 ≈ 38개. 아무 효과가 없어도 수십 개의 "유의한 유전자"가 나온다는 뜻입니다. 그래서 유의한 유전자 개수를 볼 때는 항상 "검정을 몇 번 했는가"와 "보정을 했는가"를 함께 물어야 합니다.

</details>

**2.** (객관식) "FDR 5% 기준으로 유전자 80개를 선별했다"의 올바른 해석은?
① 각 유전자가 거짓일 확률이 정확히 5%다
② 80개 중 거짓 발견이 평균적으로 약 4개 정도 섞여 있을 것으로 기대한다
③ 전체 유전자 중 5%가 차등발현되었다
④ 거짓 양성이 하나도 없을 확률이 95%다

<details><summary>정답 보기</summary>

②. FDR은 "뽑은 목록 안에서 거짓이 차지하는 기대 비율"입니다. 80 × 0.05 = 4개. ④는 Bonferroni 같은 FWER 통제의 설명이고, FDR은 어느 유전자가 거짓인지는 알려주지 않습니다.

</details>

**3.** Bonferroni 보정이 유전체 탐색 연구에서 잘 쓰이지 않는 이유는?

<details><summary>정답 보기</summary>

"거짓 양성이 단 하나도 없도록" 하는 기준이라 검정 수가 많으면 지나치게 엄격해집니다. 예시 1에서 진짜 100개 중 6개만 찾았듯이 진짜 신호 대부분을 놓칩니다. 후보를 찾아 후속 검증하는 것이 목적인 탐색 연구에서는 약간의 거짓을 허용하는 FDR이 더 실용적입니다.

</details>

**4.** 어느 데이터 설명에 "54개 유전자가 차등발현되었다(p < 0.05)"라고만 쓰여 있습니다. 이 문장을 인용하기 전에 확인해야 할 것은?

<details><summary>정답 보기</summary>

그 p가 raw p-value인지 다중검정 보정값(adjusted p, FDR)인지, 그리고 총 몇 개의 유전자를 검정했는지입니다. 수백 개를 검정했고 raw p라면 그중 상당수는 우연으로도 나올 수 있는 숫자입니다. 원 논문의 Methods에서 확인하고, 확인하지 못했다면 "보정 여부 미확인"이라고 적습니다.

</details>

**5.** 그룹당 3마리 실험에서 FDR 보정 후 유의한 유전자가 0개였습니다. "우주비행은 유전자 발현에 영향이 없다"고 결론 내려도 될까요?

<details><summary>정답 보기</summary>

안 됩니다. 표본이 작으면 검정력이 낮아 진짜 차이가 있어도 보정을 통과하지 못합니다. 올바른 서술은 "이 표본 크기에서는 FDR 기준을 통과한 유전자가 없었다"이며, 효과크기와 개별 샘플 그림을 함께 보고 가설 생성 수준에서 해석합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 노트북에 Day 10 섹션이 있고 예시 1–3이 실행된다.
- [ ] `figures/day10_fdr.png`(p-value histogram + BH 합격선)가 저장되어 있다.
- [ ] n, effect, n_true를 바꾼 세 가지 실험 결과를 표로 적었다.
- [ ] raw p 목록과 FDR 목록의 차이를 3문장으로 설명했다.
- [ ] `learning-log.md` 기록과 commit을 남겼다.

---
[← 이전](day-09.md) · [코스 지도](../../README.md) · [다음 →](day-11.md)
