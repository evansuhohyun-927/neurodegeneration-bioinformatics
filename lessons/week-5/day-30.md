# Day 30 — 단변량 군 비교: 분포, 효과크기, 신뢰구간

> **주차:** 5주차 · **예상 시간:** 75–90분 · **산출물:** `figures/day30_group_comparison.png` (군 비교 figure) + 효과크기 표

## 오늘의 목표
- 반복 측정을 참가자 단위로 요약한 뒤 PD군과 대조군의 분포를 그림으로 비교할 수 있다.
- feature마다 평균 차이, Cohen's d, bootstrap 95% 신뢰구간을 계산할 수 있다.
- 여러 feature를 한꺼번에 비교했을 때 FDR 보정이 왜 필요한지 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [Confidence Intervals, Clearly Explained!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=TqOeMYtOc1w) (6분 41초)
- **무엇에 주목할까:** 신뢰구간이 "평균이 있을 법한 범위"를 bootstrap으로 직접 만들어 보이는 장면에 주목하세요. 구간이 0을 포함하는지 여부가 p-value와 어떻게 이어지는지도 나옵니다.

- [Bootstrapping Main Ideas!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=Xz0x-8-cgaQ) (9분 27초)
- **무엇에 주목할까:** "가진 표본에서 복원추출로 다시 뽑기"를 수천 번 반복한다는 핵심 아이디어만 잡으세요. 오늘 코드에서는 뽑는 단위가 측정(행)이 아니라 **참가자**라는 점이 영상과 다릅니다.

## 개념 설명

### 단변량 비교: 한 번에 feature 하나씩

**단변량(univariate) 비교**는 feature를 하나씩 따로 떼어 "PD군과 대조군에서 이 값의 분포가 어떻게 다른가"를 보는 일입니다. 여러 feature를 한꺼번에 쓰는 모델(Day 32)보다 단순하지만, 보고서에서 가장 읽기 쉽고 가장 믿을 만한 부분이 여기서 나옵니다. 임상 논문의 "Table 1"과 첫 번째 그림이 대개 단변량 비교인 것도 그 때문입니다.

순서는 항상 같습니다. ① 참가자 단위로 요약한다 → ② 분포를 그림으로 본다 → ③ 차이의 크기(효과크기)를 계산한다 → ④ 그 크기의 불확실성(신뢰구간)을 붙인다 → ⑤ 여러 개를 검정했다면 FDR로 보정한다. p-value는 맨 마지막에 참고로만 붙입니다.

①이 먼저인 이유는 어제 배운 분석 단위 때문입니다. 한 사람의 측정 6개를 평균(또는 중앙값) 하나로 줄이면 "한 사람 = 한 점"이 되어, 이후의 모든 계산이 독립인 표본 위에서 이루어집니다. 조직 절편 여러 장의 신호를 마우스별 평균으로 먼저 합친 다음 군을 비교하는 것과 같습니다. 반복 횟수가 사람마다 다르더라도 이렇게 하면 측정을 많이 한 사람이 결과를 좌지우지하지 않습니다.

②를 건너뛰면 안 되는 이유는 평균이 분포의 모양을 숨기기 때문입니다. 한두 명의 극단값이 평균 차이를 만들었는지, 두 군이 거의 겹치는지는 점을 하나하나 찍어 봐야 보입니다.

### 효과크기: "얼마나" 다른가

Day 9에서 배운 **Cohen's d**를 다시 꺼냅니다. d는 두 군의 평균 차이를 두 군의 표준편차(합동 표준편차)로 나눈 값입니다. 단위가 서로 다른 feature들(초, m/s², 비율…)을 같은 자로 잴 수 있게 해 줍니다.

키에 비유하면 쉽습니다. 두 반의 평균 키가 3cm 다르다고 할 때, 반 안에서 키가 ±2cm 정도만 퍼져 있다면 두 반은 거의 겹치지 않습니다(d = 1.5). 반 안에서 ±10cm씩 퍼져 있다면 3cm 차이는 거의 눈에 띄지 않습니다(d = 0.3). 같은 3cm라도 "퍼짐에 비해 얼마나 큰가"가 중요합니다.

관습적으로 d = 0.2는 작은, 0.5는 중간, 0.8은 큰 효과라고 부르지만 이 기준은 어림일 뿐입니다. 더 직관적인 해석은 겹침입니다. d = 0.5면 두 군의 분포가 여전히 많이 겹치고, d가 1을 넘어야 "대부분의 PD군 값이 대조군 평균보다 위에 있다"고 말할 수 있습니다. 어제 퀴즈에서 본 것처럼, 평균 차이가 "통계적으로 유의"해도 d가 0.5 근처라면 개별 참가자를 구분하기는 어렵습니다.

d의 부호는 어느 군에서 어느 군을 빼는지에 달려 있습니다. 이 과정에서는 **PD − HC**로 통일합니다. 표와 그림 캡션에 방향을 꼭 적으세요.

### 신뢰구간과 bootstrap: 그 숫자를 얼마나 믿을까

참가자가 50명이면 d = 0.6이라는 값 자체도 흔들립니다. 다른 50명을 모았다면 0.3이 나왔을 수도, 0.9가 나왔을 수도 있습니다. **신뢰구간(confidence interval, CI)**은 이 흔들림의 범위를 보여 줍니다.

**Bootstrap**은 공식을 외우지 않고 신뢰구간을 구하는 방법입니다. 주머니에 참가자 25명의 이름표가 들어 있다고 합시다. 하나 뽑아 적고 **다시 넣기**를 25번 반복하면, 어떤 사람은 두 번 뽑히고 어떤 사람은 빠진 "가짜 표본"이 하나 만들어집니다. 이 가짜 표본으로 평균 차이를 계산합니다. 이것을 수천 번 되풀이하면 평균 차이가 수천 개 생기고, 그 가운데 95%가 들어가는 범위(2.5번째–97.5번째 백분위수)가 bootstrap 95% CI입니다.

주의할 점은 **이름표의 단위가 참가자**라는 것입니다. 측정(행)을 뽑으면 같은 사람의 측정이 독립인 것처럼 취급되어 구간이 실제보다 좁아집니다. 오늘 코드는 참가자 단위 표에서 뽑으므로 이 문제가 없습니다.

구간이 0을 포함하면 "차이가 없다"가 아니라 "이 표본 크기로는 차이의 방향조차 확실하지 않다"고 읽습니다. 구간이 넓다는 것 자체가 중요한 결과입니다.

### 여러 feature를 볼 때: FDR 다시 보기

feature 6개를 각각 검정하면 검정이 6번입니다. Day 10에서 본 것처럼, 검정을 여러 번 하면 실제로는 차이가 없어도 우연히 p < 0.05가 나오는 feature가 생깁니다. feature가 수십 개로 늘어나면 이 문제는 금방 커집니다. 그래서 feature별 p-value를 모아 **Benjamini–Hochberg FDR**로 보정한 값(q-value)을 함께 보고합니다.

두 가지 실천 규칙을 기억하세요. 첫째, Day 28에 미리 정한 **주요 outcome 1–2개**는 보정 대상이 아닌 "사전 지정 분석"으로 따로 보고하고, 나머지 feature는 "탐색적 분석"으로 묶어 FDR을 적용합니다. 둘째, 계산해 본 feature는 결과가 시원찮아도 표에서 빼지 않습니다. 잘 나온 것만 남기면 보정의 의미가 사라집니다.

## 예시로 이해하기

### 예시 1 — 참가자 단위로 요약하기

```python
import numpy as np
import pandas as pd

FEATURES = ["stride_time_cv", "accel_rms", "tremor_band_power",
            "jerk_mean", "step_regularity", "arm_swing_asym"]

def make_demo_table(seed=42, n_participants=50, n_repeats=6):
    """연습용 가상 feature table. 실제 환자 데이터가 아니다."""
    rng = np.random.default_rng(seed)
    pd_shift = np.array([0.6, -0.5, 0.6, 0.2, -0.4, 0.3])   # PD군 평균이 이동하는 정도
    rows = []
    for i in range(n_participants):
        group = "PD" if i < n_participants // 2 else "HC"
        age = rng.normal(68 if group == "PD" else 62, 7)
        sex = rng.choice(["F", "M"])
        person = rng.normal(0, 1.0, size=len(FEATURES))      # 그 사람 고유의 '움직임 지문'
        for rep in range(1, n_repeats + 1):
            values = person + rng.normal(0, 0.25, size=len(FEATURES))  # 측정마다 생기는 흔들림
            if group == "PD":
                values = values + pd_shift
            values[0] += 0.06 * (age - 65)                   # stride_time_cv는 나이와도 관련
            rows.append({"participant_id": f"P{i + 1:03d}", "group": group,
                         "age": round(age, 1), "sex": sex, "repeat": rep,
                         **dict(zip(FEATURES, values.round(3)))})
    return pd.DataFrame(rows)

df = make_demo_table()

# 🔁 실제 데이터로 바꿀 지점 ---------------------------------------------
# 4주차(Day 26)에 만든 feature table이 있으면 위의 df = make_demo_table() 대신:
# df = pd.read_csv("data/physionet_pd/derived/pd_features_records.csv")   # 내 파일 경로로
# FEATURES = ["내_feature_1", "내_feature_2"]                # 내 feature 열 이름으로
# 그리고 아래 두 이름을 내 표의 열 이름에 맞춘다.
ID_COL = "participant_id"   # 참가자 ID 열
GROUP_COL = "group"         # 진단군 열 (이 예시에서는 "PD" / "HC")
# -------------------------------------------------------------------------

# 한 사람 = 한 행이 되도록 반복 측정을 평균으로 요약
person = df.groupby([ID_COL, GROUP_COL], as_index=False)[FEATURES].mean()

print("요약 전 행 수:", len(df), "→ 요약 후 행 수:", len(person))
print()
print(person.groupby(GROUP_COL)[FEATURES].mean().round(2).T)
```

실행 결과:

```text
요약 전 행 수: 300 → 요약 후 행 수: 50

group                HC    PD
stride_time_cv    -0.48  1.00
accel_rms         -0.05 -0.25
tremor_band_power -0.07  0.46
jerk_mean         -0.23  0.19
step_regularity    0.04 -0.43
arm_swing_asym     0.16  0.39
```

각 숫자는 군별 "참가자 평균의 평균"입니다. `stride_time_cv`의 차이가 가장 커 보이고 `accel_rms`와 `arm_swing_asym`은 차이가 작아 보입니다. 이 인상이 맞는지 숫자로 확인합니다.

### 예시 2 — feature 하나: Cohen's d와 bootstrap 신뢰구간

예시 1에 이어서 실행합니다. 함수 두 개를 만들어 두면 내일도, 보고서를 쓸 때도 다시 씁니다.

```python
def cohens_d(a, b):
    """a - b 방향의 Cohen's d (합동 표준편차 사용)."""
    a, b = np.asarray(a), np.asarray(b)
    pooled_var = ((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1)) / (len(a) + len(b) - 2)
    return (a.mean() - b.mean()) / np.sqrt(pooled_var)

def bootstrap_ci(a, b, stat, n_boot=5000, seed=0):
    """참가자를 복원추출해 stat(a, b)의 95% 신뢰구간을 구한다."""
    rng = np.random.default_rng(seed)
    a, b = np.asarray(a), np.asarray(b)
    boots = [stat(rng.choice(a, size=len(a), replace=True),
                  rng.choice(b, size=len(b), replace=True)) for _ in range(n_boot)]
    return np.percentile(boots, [2.5, 97.5])

feature = "tremor_band_power"
pd_vals = person.loc[person[GROUP_COL] == "PD", feature]
hc_vals = person.loc[person[GROUP_COL] == "HC", feature]

mean_diff = lambda a, b: a.mean() - b.mean()
lo, hi = bootstrap_ci(pd_vals, hc_vals, mean_diff)
d_lo, d_hi = bootstrap_ci(pd_vals, hc_vals, cohens_d)

print(f"{feature}  (PD n={len(pd_vals)}, HC n={len(hc_vals)})")
print(f"  평균 차이(PD - HC) = {mean_diff(pd_vals, hc_vals):.2f},  95% CI [{lo:.2f}, {hi:.2f}]")
print(f"  Cohen's d          = {cohens_d(pd_vals, hc_vals):.2f},  95% CI [{d_lo:.2f}, {d_hi:.2f}]")
```

실행 결과:

```text
tremor_band_power  (PD n=25, HC n=25)
  평균 차이(PD - HC) = 0.53,  95% CI [0.05, 1.01]
  Cohen's d          = 0.60,  95% CI [0.05, 1.24]
```

읽는 법: 이 가상 데이터에서 PD군의 `tremor_band_power`는 대조군보다 평균 0.53 높고, d는 0.60(중간 크기)입니다. 하지만 d의 신뢰구간이 0 근처부터 1을 넘는 값까지 넓게 퍼져 있습니다. 25명씩으로는 "중간 정도의 차이가 있는 것 같지만 작을 수도, 클 수도 있다"까지만 말할 수 있습니다.

### 예시 3 — 모든 feature: 효과크기 표, FDR, 그림

예시 2에 이어서 실행합니다.

```python
from pathlib import Path
import matplotlib.pyplot as plt
from scipy import stats

rows = []
for f in FEATURES:
    a = person.loc[person[GROUP_COL] == "PD", f]
    b = person.loc[person[GROUP_COL] == "HC", f]
    lo, hi = bootstrap_ci(a, b, cohens_d)
    p = stats.ttest_ind(a, b, equal_var=False).pvalue        # Welch t-검정
    rows.append({"feature": f, "mean_diff": a.mean() - b.mean(),
                 "cohens_d": cohens_d(a, b), "d_ci_low": lo, "d_ci_high": hi, "p": p})

table = pd.DataFrame(rows)
table["q_fdr"] = stats.false_discovery_control(table["p"])   # Benjamini-Hochberg
table = table.sort_values("cohens_d", key=abs, ascending=False)
print(table.round(3).to_string(index=False))

Path("reports").mkdir(exist_ok=True)
table.to_csv("reports/day30_effect_sizes.csv", index=False)

# 그림: 참가자 한 명 = 점 하나, 그 위에 boxplot
Path("figures").mkdir(exist_ok=True)
rng = np.random.default_rng(0)
fig, axes = plt.subplots(2, 3, figsize=(11, 6.5))
for ax, f in zip(axes.ravel(), table["feature"]):
    groups = ["HC", "PD"]
    data = [person.loc[person[GROUP_COL] == g, f] for g in groups]
    ax.boxplot(data, positions=[0, 1], widths=0.5, showfliers=False)
    for x, vals in enumerate(data):
        ax.scatter(x + rng.uniform(-0.12, 0.12, len(vals)), vals, s=18, alpha=0.6)
    d = table.set_index("feature").loc[f]
    ax.set_title(f"{f}\nd = {d.cohens_d:.2f} [{d.d_ci_low:.2f}, {d.d_ci_high:.2f}]", fontsize=10)
    ax.set_xticks([0, 1])
    ax.set_xticklabels([f"{g} (n={len(v)})" for g, v in zip(groups, data)])
    ax.set_ylabel("participant mean (a.u.)")
fig.suptitle("Synthetic demo data: participant-level group comparison (d = PD - HC, bootstrap 95% CI)")
fig.tight_layout()
fig.savefig("figures/day30_group_comparison.png", dpi=150)
plt.show()
print("저장: figures/day30_group_comparison.png, reports/day30_effect_sizes.csv")
```

실행 결과:

```text
          feature  mean_diff  cohens_d  d_ci_low  d_ci_high     p  q_fdr
   stride_time_cv      1.487     1.434     0.927      2.144 0.000  0.000
tremor_band_power      0.529     0.602     0.050      1.240 0.039  0.116
  step_regularity     -0.468    -0.527    -1.180      0.037 0.069  0.137
        jerk_mean      0.419     0.482    -0.042      1.070 0.095  0.142
   arm_swing_asym      0.225     0.219    -0.327      0.803 0.443  0.489
        accel_rms     -0.200    -0.197    -0.767      0.351 0.489  0.489
저장: figures/day30_group_comparison.png, reports/day30_effect_sizes.csv
```

표 읽기 연습을 해 봅시다.

- `stride_time_cv`는 d가 1을 넘고 신뢰구간도 0에서 멀리 떨어져 있습니다. q값도 아주 작습니다.
- `tremor_band_power`는 p만 보면 0.05 아래지만, FDR 보정 후 q는 0.05를 넘습니다. "탐색적 분석에서 중간 크기의 차이가 관찰되었으나 다중검정 보정 후에는 기준을 넘지 않았다"고 써야 합니다.
- `step_regularity`와 `jerk_mean`은 d가 ±0.5 근처이지만 구간이 0을 포함합니다. "차이가 없다"가 아니라 "이 표본으로는 불확실하다"입니다.
- `accel_rms`, `arm_swing_asym`은 d가 작고 구간이 0을 가운데 두고 있습니다.

그리고 한 가지 더: 이 가상 데이터에서 `stride_time_cv`의 큰 차이에는 **나이**가 섞여 있습니다(준비 코드에서 일부러 그렇게 만들었습니다). 그 이야기는 내일 합니다.

## 직접 해보기

1. `notebooks/05_pd_feature_analysis.ipynb`에서 예시 1–3을 가상 데이터로 실행해 같은 표가 나오는지 확인합니다.
2. 준비 코드의 `🔁` 부분을 내 feature table로 바꾸고 예시 1을 실행합니다. 요약 후 행 수가 Day 29에 센 참가자 수와 같은지 확인합니다.
3. `analysis-choice.md`에 적은 **주요 outcome**에 대해 예시 2를 실행하고, 평균 차이·d·95% CI를 한 문장으로 적습니다. 형식: "이 데이터셋에서 PD군의 ○○는 대조군보다 평균 △ 높았다(Cohen's d = □, 95% CI [ , ])."
4. 예시 3을 내 feature 전체에 실행해 `reports/day30_effect_sizes.csv`와 `figures/day30_group_comparison.png`를 만듭니다. feature가 6개보다 많으면 `plt.subplots(2, 3, ...)`의 행·열 수를 늘리거나, 그림에는 주요 feature 6개만 넣고 표에는 전부 넣습니다.
5. 그림의 `fig.suptitle(...)`을 내 데이터셋 이름과 버전으로 바꾸고, y축 단위(`a.u.` 대신 실제 단위)를 고칩니다.
6. 그림 아래에 붙일 캡션을 3문장으로 씁니다: 무엇을 그렸는가(점 하나 = 참가자 한 명), d의 방향(PD − HC), 신뢰구간 계산 방법(참가자 단위 bootstrap 5,000회).
7. 주요 outcome은 "사전 지정", 나머지는 "탐색적(FDR 보정)"이라고 표에 구분해 적고 commit합니다.

⚠️ **흔한 오류 1 — 반복 측정을 요약하지 않고 바로 `df`로 검정:** 표본 수가 부풀려져 p-value가 터무니없이 작아집니다. 검정과 bootstrap에는 항상 `person`(참가자 단위 표)을 쓰세요. 내일 이 차이를 직접 봅니다.

⚠️ **흔한 오류 2 — `AttributeError: module 'scipy.stats' has no attribute 'false_discovery_control'`:** SciPy가 1.11보다 오래된 경우입니다. Day 10에서 쓴 `statsmodels`로 대신하세요: `from statsmodels.stats.multitest import multipletests` 후 `table["q_fdr"] = multipletests(table["p"], method="fdr_bh")[1]`.

## 퀴즈

**1.** 군 비교 전에 반복 측정을 참가자별 평균으로 요약하는 가장 큰 이유는?

- (a) 계산이 빨라져서
- (b) 같은 사람의 반복 측정은 독립이 아니어서, 그대로 쓰면 표본 수가 부풀려지기 때문에
- (c) 평균이 중앙값보다 항상 정확해서
- (d) 그림이 예뻐져서

<details><summary>정답 보기</summary>

**(b)**. 검정과 신뢰구간은 관측값이 서로 독립이라고 가정합니다. 한 사람의 측정 6개를 6명분처럼 쓰면 신뢰구간이 지나치게 좁아지고 p-value가 지나치게 작아집니다.

</details>

**2.** 어떤 feature의 Cohen's d가 0.60, 95% CI가 [−0.02, 1.25]로 나왔습니다. 가장 적절한 해석은?

- (a) 차이가 없다.
- (b) 큰 차이가 확실히 있다.
- (c) 중간 크기의 차이가 관찰되었지만, 이 표본 크기로는 거의 0부터 큰 차이까지 모두 가능하다.
- (d) 계산이 잘못되었다.

<details><summary>정답 보기</summary>

**(c)**. 점 추정값은 중간 크기지만 구간이 넓고 0을 살짝 포함합니다. "없다"도 "확실하다"도 아니고, 불확실성의 범위를 그대로 보고하는 것이 정직한 해석입니다.

</details>

**3.** bootstrap으로 신뢰구간을 구할 때 복원추출의 단위는 무엇이어야 할까요? (단답)

<details><summary>정답 보기</summary>

**참가자**입니다. 측정(행) 단위로 뽑으면 같은 사람의 측정들을 독립으로 취급하게 되어 구간이 실제보다 좁아집니다. 참가자 단위 표에서 뽑으면 이 문제가 생기지 않습니다.

</details>

**4.** feature 20개를 검정했더니 3개에서 p < 0.05가 나왔습니다. 보고서에 그 3개만 싣고 나머지 17개는 뺐습니다. 무엇이 문제일까요? (단답)

<details><summary>정답 보기</summary>

20번 검정하면 실제 차이가 없어도 우연히 1개쯤은 p < 0.05가 나옵니다. 잘 나온 것만 남기면 독자는 **몇 번 시도했는지** 알 수 없어 결과를 과대평가하게 됩니다. 20개 전부를 표에 싣고 FDR 보정값을 함께 보고해야 합니다.

</details>

**5.** 그림에서 boxplot만 그리지 않고 참가자별 점을 함께 찍는 이유는?

<details><summary>정답 보기</summary>

상자와 평균은 분포의 모양을 숨기기 때문입니다. 점을 찍어야 한두 명의 극단값이 차이를 만들었는지, 두 군이 얼마나 겹치는지, 각 군에 몇 명이 있는지가 보입니다. 표본이 작을수록 개별 점이 중요합니다.

</details>

## 더 알아보기

> **📚 가정 없는 null 분포: 순열 검정**
> bootstrap이 데이터를 다시 뽑아 신뢰구간을 만든다면, 순열 검정은 조건 이름표를 섞어 "차이가 없을 때의 분포"를 데이터로 만듭니다. 관측한 차이보다 크거나 같은 순열의 비율이 p-value입니다. 섞는 단위는 설계를 따라야 해서, 참가자 비교라면 시행이 아니라 참가자 단위로 섞습니다. 난수에 따라 p가 조금씩 흔들리므로 순열 수와 seed를 보고합니다.
> → [심화 C — Day C7: 차원 축소, 분류, 통계: spike sorting, 순열 검정, 군집 기반 보정](../advanced/C-neural-signals/day-C7.md)

## 오늘의 산출물 체크리스트
- [ ] 참가자 단위 요약표(`person`)를 만들고 행 수가 참가자 수와 같은지 확인했다.
- [ ] 주요 outcome의 평균 차이, Cohen's d, bootstrap 95% CI를 한 문장으로 적었다.
- [ ] 모든 feature의 효과크기 표(`reports/day30_effect_sizes.csv`)에 p와 FDR q를 함께 넣었다.
- [ ] `figures/day30_group_comparison.png`를 만들고 3문장 캡션을 썼다.
- [ ] 사전 지정 outcome과 탐색적 feature를 구분해 표시했다.

---
[← 이전](day-29.md) · [코스 지도](../../README.md) · [다음 →](day-31.md)
