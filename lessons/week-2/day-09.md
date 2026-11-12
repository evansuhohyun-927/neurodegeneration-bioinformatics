# Day 9 — 효과크기, 신뢰구간, p-value: 세 숫자는 서로 다른 질문에 답한다

> **주차:** 2주차 · **예상 시간:** 75–90분 · **산출물:** `effect-size-memo.md` (효과크기 메모)

## 오늘의 목표
- 효과크기, 신뢰구간, p-value가 각각 어떤 질문에 답하는지 구분해서 말할 수 있다.
- 두 그룹의 평균 차이를 그림으로 그리고 Cohen's d를 직접 계산할 수 있다.
- "p < 0.05"만으로 결론을 내리면 안 되는 이유를 시뮬레이션 결과로 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [p-values: What they are and how to interpret them — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=vemZtEM63GY) (11:21)
- **무엇에 주목할까:** p-value가 "차이가 없다고 가정했을 때, 지금 본 것만큼 또는 그보다 극단적인 결과가 나올 확률"이라는 정의를 잡으세요. 영상 뒷부분에서 "p-value가 작다고 차이가 크다는 뜻은 아니다"라고 말하는 대목이 오늘 예시 2와 정확히 같은 이야기입니다.

- [Confidence Intervals, Clearly Explained!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=TqOeMYtOc1w) (6:41)
- **무엇에 주목할까:** 신뢰구간을 "같은 실험을 여러 번 했을 때 추정값이 흩어지는 범위"로 설명하는 방식을 보세요. 구간이 0을 포함하는지 여부가 p-value와 어떻게 연결되는지도 나옵니다.

- (선택, 검색 링크) Cohen's d만 따로 설명한 영상이 필요하면: [YouTube 검색 — "Cohen's d effect size explained"](https://www.youtube.com/results?search_query=cohen%27s+d+effect+size+explained)

## 개념 설명

### 세 가지 질문

새 혈압약 임상시험 결과를 읽는다고 합시다. 우리가 궁금한 것은 사실 세 가지입니다. 첫째, **얼마나 내려갔나?** 둘째, **그 추정이 얼마나 정확한가?** 셋째, **우연히 그렇게 보였을 가능성은 없나?** 이 세 질문에 답하는 숫자가 각각 **효과크기(effect size)**, **신뢰구간(confidence interval, CI)**, **p-value**입니다.

초보자가 가장 많이 하는 실수는 세 번째 숫자 하나로 세 질문에 모두 답하려는 것입니다. p-value는 "차이가 큰가"에도, "추정이 정확한가"에도 답하지 않습니다. 실라부스의 분석 원칙이 "작은 표본에서는 p-value만으로 결론을 내리지 않는다. 효과크기, 분포, 개별 샘플을 함께 검토한다"라고 못 박은 이유입니다.

### 효과크기와 Cohen's d

가장 단순한 효과크기는 **평균 차이** 그 자체입니다. "비행군이 대조군보다 1.4 높다." 그런데 1.4가 큰 차이인지는 데이터가 원래 얼마나 흩어져 있는지에 달려 있습니다. 체온에서 1.4도는 큰 차이지만 수축기 혈압에서 1.4 mmHg는 측정할 때마다 바뀌는 수준입니다.

그래서 평균 차이를 표준편차로 나눈 값을 씁니다. 이것이 **Cohen's d**입니다.

> d = (그룹 B 평균 − 그룹 A 평균) ÷ 합동 표준편차(pooled SD)

"두 그룹이 표준편차 몇 개만큼 떨어져 있는가"라는 뜻입니다. 단위가 사라지므로 서로 다른 유전자, 서로 다른 측정값끼리도 비교할 수 있습니다. 관례적으로 0.2는 작은 효과, 0.5는 중간, 0.8 이상은 큰 효과라고 부르지만, 이는 대략적인 눈금일 뿐입니다. 또한 표본이 작으면 d 자체가 크게 출렁입니다. 그룹당 6마리에서 나온 d=1.4는 "큰 효과일 가능성이 있다" 정도로 읽어야 합니다.

### p-value: 우연이라는 변호사의 주장

p-value는 법정 비유로 이해하면 쉽습니다. **귀무가설(null hypothesis)** 은 "두 그룹 사이에 진짜 차이는 없다"는 변호사의 주장입니다. p-value는 "변호사 말이 맞다고 치자. 그래도 지금 같은 차이(또는 더 큰 차이)가 우연히 나올 확률이 얼마인가?"입니다. 이 확률이 아주 작으면 우리는 변호사의 주장이 미심쩍다고 판단합니다.

여기서 꼭 기억할 것이 세 가지 있습니다. p-value는 **"귀무가설이 참일 확률"이 아닙니다.** p-value는 **효과의 크기를 말하지 않습니다.** 그리고 p-value는 **표본 크기에 크게 좌우됩니다.** 표본이 수천 명이면 의미 없이 작은 차이도 p가 0에 가깝게 나오고, 표본이 네 마리면 꽤 큰 차이도 p가 0.2를 넘습니다.

### 신뢰구간: 추정값의 오차 막대

평균 차이 1.4는 이번 표본에서 나온 값입니다. 마우스 6마리를 새로 뽑아 실험을 반복하면 1.1이 나올 수도, 2.0이 나올 수도 있습니다. **95% 신뢰구간**은 "이런 식으로 구간을 만드는 절차를 무한히 반복하면 그중 95%가 진짜 값을 포함한다"는 의미의 범위입니다. 실용적으로는 **"데이터와 양립 가능한 진짜 차이의 범위"** 로 읽으면 됩니다.

신뢰구간은 효과크기와 불확실성을 한꺼번에 보여줍니다. 구간이 좁으면 추정이 정밀하고, 넓으면 표본이 부족하다는 뜻입니다. 구간이 0을 포함하지 않으면 대략 p < 0.05와 같은 이야기가 됩니다. 그러니 결과를 보고할 때는 "p=0.04"보다 "평균 차이 1.4 (95% CI 0.1–2.8)"가 훨씬 많은 정보를 줍니다.

## 예시로 이해하기

### 예시 1 — 그룹당 6마리 실험에서 세 숫자를 모두 계산하기

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(11)
gc = rng.normal(loc=10.0, scale=1.0, size=6)    # 가상의 지상 대조군
flt = rng.normal(loc=11.5, scale=1.0, size=6)   # 가상의 비행군 (진짜 차이 1.5)

def cohens_d(a, b):
    """두 그룹 평균 차이를 '합동 표준편차' 단위로 나타낸다."""
    na, nb = len(a), len(b)
    pooled_sd = np.sqrt(((na - 1) * a.var(ddof=1) + (nb - 1) * b.var(ddof=1)) / (na + nb - 2))
    return (a.mean() - b.mean()) / pooled_sd

diff = flt.mean() - gc.mean()
res = stats.ttest_ind(flt, gc, equal_var=False)       # Welch t-검정
ci = res.confidence_interval(confidence_level=0.95)

print(f"평균 차이 (FLT - GC): {diff:.2f}")
print(f"Cohen's d: {cohens_d(flt, gc):.2f}")
print(f"95% 신뢰구간: {ci.low:.2f} ~ {ci.high:.2f}")
print(f"p-value: {res.pvalue:.4f}")
```

출력:

```text
평균 차이 (FLT - GC): 1.43
Cohen's d: 1.41
95% 신뢰구간: 0.11 ~ 2.76
p-value: 0.0365
```

p는 0.05보다 작습니다. 하지만 신뢰구간을 보세요. 진짜 차이는 0.11처럼 거의 없을 수도, 2.76처럼 아주 클 수도 있습니다. 6마리로는 "차이가 있는 것 같다"까지는 말할 수 있어도 "얼마나 큰지"는 거의 모르는 상태입니다.

### 예시 2 — 작은 p가 큰 효과를 뜻하지 않고, 큰 p가 효과 없음을 뜻하지 않는다

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(1)

def report(name, a, b):
    sd = np.sqrt((a.var(ddof=1) + b.var(ddof=1)) / 2)   # 두 그룹 크기가 같을 때의 합동 SD
    d = (b.mean() - a.mean()) / sd
    p = stats.ttest_ind(b, a, equal_var=False).pvalue
    print(f"{name}: n={len(a)}/그룹, 평균 차이={b.mean() - a.mean():.2f}, d={d:.2f}, p={p:.4f}")

# A: 표본은 아주 크고, 진짜 차이는 아주 작다
report("A (큰 표본, 작은 효과)", rng.normal(10, 1, 5000), rng.normal(10.1, 1, 5000))
# B: 표본은 작고, 차이는 크다
report("B (작은 표본, 큰 효과)", np.array([8.9, 10.4, 9.6, 11.1]), np.array([9.8, 12.3, 10.2, 11.7]))
```

출력:

```text
A (큰 표본, 작은 효과): n=5000/그룹, 평균 차이=0.11, d=0.11, p=0.0000
B (작은 표본, 큰 효과): n=4/그룹, 평균 차이=1.00, d=0.93, p=0.2405
```

A는 p가 0에 가깝지만 효과크기 d=0.11은 생물학적으로 의미가 있을지 의심스러운 수준입니다. B는 d=0.93으로 큰 효과인데 p=0.24입니다. B를 보고 "차이가 없다"고 결론 내리면 틀립니다. 올바른 표현은 "이 표본 크기로는 판단할 수 없다"입니다.

### 예시 3 — 진짜 차이가 전혀 없어도 20번에 1번은 p < 0.05

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(0)
n_experiments = 2000

# 두 그룹이 '완전히 같은' 모집단에서 나온 실험을 2000번 반복
a = rng.normal(10, 1, size=(n_experiments, 6))
b = rng.normal(10, 1, size=(n_experiments, 6))
p = stats.ttest_ind(a, b, axis=1, equal_var=False).pvalue

print(f"p < 0.05 인 실험: {(p < 0.05).sum()}개 / {n_experiments}개 ({(p < 0.05).mean():.1%})")
```

출력:

```text
p < 0.05 인 실험: 98개 / 2000개 (4.9%)
```

아무 차이가 없는데도 약 5%의 실험에서 "유의하다"는 결과가 나왔습니다. 0.05라는 기준은 "거짓 경보를 5%까지는 허용하겠다"는 약속이기 때문입니다. 유전자 수백 개를 한꺼번에 검정하면 이 5%가 어떤 일을 벌이는지가 내일(Day 10)의 주제입니다.

## 직접 해보기

1. 어제 만든 `notebooks/02_statistics_basics.ipynb`를 열고 맨 아래에 Markdown 셀로 `## Day 9 — 효과크기, 신뢰구간, p-value`를 추가합니다.
2. 예시 1을 실행해 네 숫자가 같은지 확인합니다.
3. 두 그룹을 그림으로 그립니다. 개별 점을 모두 찍고 그룹 평균을 빨간 가로선으로 표시합니다.

   ```python
   import pandas as pd
   import matplotlib.pyplot as plt
   import seaborn as sns

   df = pd.DataFrame({"group": ["GC"] * 6 + ["FLT"] * 6, "expression": np.r_[gc, flt]})

   fig, ax = plt.subplots(figsize=(4, 4))
   sns.stripplot(data=df, x="group", y="expression", size=8, color="black", ax=ax)
   for i, g in enumerate(["GC", "FLT"]):
       m = df.loc[df["group"] == g, "expression"].mean()
       ax.hlines(m, i - 0.25, i + 0.25, color="red")
   ax.set_title(f"diff = {diff:.2f}, d = {cohens_d(flt, gc):.2f}")
   plt.tight_layout()
   plt.savefig("../figures/day09_two_groups.png", dpi=150)
   plt.show()
   ```

   그림을 보고 두 그룹의 점이 얼마나 겹치는지 확인합니다. d=1.41이라는 숫자와 눈으로 본 겹침 정도가 어울리는지 생각해 보세요.
4. 예시 1에서 `size=6`을 두 군데 모두 `size=30`으로 바꿔 다시 실행합니다. 평균 차이, d, 신뢰구간의 폭, p-value 중 무엇이 크게 변하고 무엇이 비슷하게 유지되는지 표로 적습니다. (확인 후 다시 6으로 돌려놓습니다.)
5. 예시 2와 예시 3을 실행합니다. 예시 3에서 `rng.normal(10, 1, ...)` 중 `b` 쪽 평균을 11로 바꾸면 p < 0.05인 실험의 비율이 몇 %가 되는지 확인합니다. 진짜 차이가 1(d=1)이나 되는데도 놓치는 실험이 얼마나 많은지 보세요. 이 비율이 **검정력(statistical power)** 입니다.
6. 프로젝트 폴더에 `effect-size-memo.md`를 만들고 아래 틀을 채웁니다.

   ```markdown
   # 효과크기 메모 (Day 9)

   ## 세 숫자가 답하는 질문
   - 효과크기: 
   - 신뢰구간: 
   - p-value: 

   ## 시뮬레이션에서 본 것
   - n=6일 때: 평균 차이 __, d __, 95% CI __ ~ __, p __
   - n=30일 때: 평균 차이 __, d __, 95% CI __ ~ __, p __
   - 진짜 차이가 없을 때 p < 0.05 비율: __ %
   - 진짜 차이가 1일 때(n=6) p < 0.05 비율: __ %

   ## 앞으로 결과를 보고할 때 내 규칙 (3줄)
   1. 
   2. 
   3. 
   ```
7. `learning-log.md`에 기록하고 commit합니다.

⚠️ **흔한 오류 1 — `AttributeError: 'TtestResult' object has no attribute 'confidence_interval'`** (또는 비슷한 메시지)
SciPy 버전이 오래되면 `confidence_interval()`이 없습니다. `import scipy; print(scipy.__version__)`으로 확인하세요(이 레슨은 1.16에서 확인했습니다). 오래된 버전이면 신뢰구간 두 줄만 빼고 나머지를 진행해도 됩니다.

⚠️ **흔한 오류 2 — d의 부호가 반대로 나온다**
`cohens_d(flt, gc)`와 `cohens_d(gc, flt)`는 부호가 반대입니다. 틀린 것이 아니라 "누구에서 누구를 뺐는가"가 다른 것입니다. 메모와 그림 제목에 항상 방향(FLT − GC)을 적어 두세요.

## 퀴즈

**1.** (객관식) p = 0.03의 올바른 해석은?
① 귀무가설이 참일 확률이 3%다
② 효과가 실제로 존재할 확률이 97%다
③ 진짜 차이가 없다고 가정할 때, 관찰한 것만큼 또는 더 극단적인 결과가 나올 확률이 3%다
④ 두 그룹의 차이가 3%다

<details><summary>정답 보기</summary>

③. p-value는 "귀무가설이 참이라는 가정 아래에서 데이터가 얼마나 드문가"를 말합니다. 가설 자체가 참일 확률(①, ②)이나 차이의 크기(④)를 말해 주지 않습니다.

</details>

**2.** (단답) 대조군 평균 20, 처리군 평균 26, 합동 표준편차 4입니다. Cohen's d는?

<details><summary>정답 보기</summary>

d = (26 − 20) ÷ 4 = 1.5. 두 그룹이 표준편차 1.5개만큼 떨어져 있다는 뜻으로, 관례상 큰 효과입니다. 다만 표본이 작다면 이 값의 신뢰구간도 매우 넓다는 점을 함께 적어야 합니다.

</details>

**3.** 그룹당 4마리 실험에서 d=0.9, p=0.24가 나왔습니다. "두 그룹은 차이가 없다"고 써도 될까요?

<details><summary>정답 보기</summary>

안 됩니다. p가 크다는 것은 "차이가 없다는 증거"가 아니라 "이 표본으로는 구별할 수 없다"는 뜻입니다. 효과크기는 오히려 큰 편이므로 "표본이 작아 결론을 내릴 수 없으며, 큰 효과의 가능성을 배제하지 못한다"고 쓰는 것이 정확합니다.

</details>

**4.** 평균 차이의 95% 신뢰구간이 −0.4 ~ 3.1입니다. 이 결과에서 읽을 수 있는 것 두 가지는?

<details><summary>정답 보기</summary>

첫째, 구간이 0을 포함하므로 통상적인 기준(p < 0.05)으로는 유의하지 않습니다. 둘째, 구간이 매우 넓어 진짜 차이가 거의 없을 수도, 3이 넘을 수도 있으므로 추정이 부정확합니다. 즉 "효과 없음"이 아니라 "정보 부족"입니다.

</details>

**5.** 표본을 5,000명으로 늘렸더니 p < 0.0001이 나왔습니다. 이것만으로 "임상적으로 중요한 차이"라고 할 수 없는 이유는?

<details><summary>정답 보기</summary>

표본이 아주 크면 d=0.1 같은 미미한 차이도 p가 0에 가깝게 나옵니다(예시 2의 A). 중요한지 여부는 효과크기와 그 분야의 지식으로 판단해야 하며, p-value는 그 판단을 대신해 주지 않습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 노트북에 Day 9 섹션이 있고 예시 1–3이 실행된다.
- [ ] 두 그룹의 개별 점 + 평균선 그림(`day09_two_groups.png`)이 있다.
- [ ] n=6과 n=30의 비교 결과를 적었다.
- [ ] `effect-size-memo.md`의 빈칸과 "내 규칙 3줄"을 채웠다.
- [ ] `learning-log.md` 기록과 commit을 남겼다.

---
[← 이전](day-08.md) · [코스 지도](../../README.md) · [다음 →](day-10.md)
