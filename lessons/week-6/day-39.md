# Day 39 — 결론이 얼마나 튼튼한가: 민감도 분석

> **주차:** 6주차 · **예상 시간:** 75–90분 · **산출물:** `sensitivity-memo.md`

## 오늘의 목표
- 민감도 분석(sensitivity analysis)이 무엇이고 p-hacking과 어떻게 다른지 설명할 수 있다.
- outlier 포함/제외, 다른 feature 정의에 따라 효과크기가 어떻게 변하는지 계산할 수 있다.
- 주 분석과 민감도 분석 결과를 한 표로 정리하고 "안정적인 것 / 흔들리는 것"을 문장으로 쓸 수 있다.

## 🎬 영상으로 먼저 보기

- [Judging outliers in a dataset | Summarizing quantitative data | AP Statistics | Khan Academy — Khan Academy](https://www.youtube.com/watch?v=FRlTh5HQORA) (약 8분)
- **무엇에 주목할까:** outlier를 "느낌"이 아니라 미리 정한 규칙(1.5 × IQR)으로 판정하는 과정을 보세요. 규칙을 먼저 정하고 데이터를 보는 순서가 중요합니다.

- [p-hacking: What it is and how to avoid it! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=HDCOUXE3HMM) (약 14분)
- **무엇에 주목할까:** 원하는 결과가 나올 때까지 분석을 바꾸는 것이 왜 거짓 양성을 늘리는지에 주목하세요. 오늘 우리는 분석을 여러 가지로 돌리지만, **전부 보고한다**는 점에서 p-hacking과 정반대입니다.

## 개념 설명

### 민감도 분석은 "다른 조건에서도 같은 밴드가 보이는가"이다

Western blot에서 밴드가 보였다고 합시다. 꼼꼼한 연구자는 다른 항체로, 다른 lot의 시료로, 노출 시간을 바꿔서 다시 확인합니다. 조건을 조금 바꿔도 밴드가 그대로면 결과를 믿을 만하고, 노출 시간을 딱 한 가지로 맞췄을 때만 보인다면 조심해야 합니다. **민감도 분석**은 이것의 통계 버전입니다. 분석 과정에서 내가 내린 **임의적인 결정**(이 샘플을 뺄까, feature를 어떻게 정의할까, 평균으로 요약할까 중앙값으로 할까)을 하나씩 바꿔 보고, 결론이 유지되는지 확인합니다. 임상시험 분야의 설명이지만 개념 정리로는 Thabane 등 (2013) *BMC Med Res Methodol* "A tutorial on sensitivity analyses in clinical trials: the what, why, when and how"가 읽기 좋습니다.

확인하는 대상은 p-value가 0.05를 넘나드는지가 아닙니다. (1) 효과의 **방향**이 같은가, (2) 효과크기의 **크기**가 비슷한 범위에 있는가, (3) 그림을 다르게 그려도 같은 인상을 주는가, 이 세 가지입니다.

### p-hacking과의 차이: 고르지 않고 전부 보여 준다

여러 분석을 돌린다는 점에서 민감도 분석과 p-hacking은 겉모습이 비슷합니다. 차이는 **보고 방식**에 있습니다.

| | p-hacking | 민감도 분석 |
|---|---|---|
| 주 분석은 언제 정하나 | 결과를 본 뒤 | 결과를 보기 전 (Day 28의 분석 계획) |
| 여러 분석 중 무엇을 보고하나 | 가장 좋아 보이는 하나 | 전부 |
| 결과가 서로 다르면 | 숨긴다 | "이 결정에 민감하다"고 적는다 |

여러분은 Day 28에 `pd-analysis-plan.md`에서 주요 outcome과 제외 기준을 미리 정했습니다. 그것이 주 분석(primary analysis)입니다. 오늘 하는 추가 분석은 주 분석을 **대체**하지 않습니다. 민감도 분석에서 더 예쁜 숫자가 나왔다고 주 분석을 바꾸면 그 순간 p-hacking이 됩니다.

### 작은 표본에서 outlier 하나의 무게

OSD-536처럼 군당 표본이 작은 데이터에서는 샘플 하나가 평균과 표준편차를 크게 움직입니다. 표본이 작은 연구에서 효과크기 추정이 불안정해지는 문제는 Button 등 (2013) *Nat Rev Neurosci* "Power failure"가 신경과학 맥락에서 다룹니다. 그렇다고 outlier를 지우는 것이 답은 아닙니다. 기술적 오류(RNA 품질 불량, 센서 탈락)라는 **독립적인 근거**가 있을 때만 제외를 정당화할 수 있고, 근거 없이 "튀니까" 지우면 실제 생물학적 변이를 버리게 됩니다. 그래서 원칙은 이렇습니다. 주 분석은 미리 정한 기준대로 하고, outlier 후보를 뺀 분석은 민감도 분석으로 **나란히** 보여 준다.

아래 예시 1에서 보겠지만, outlier를 빼면 효과크기가 줄어든다고 단정할 수도 없습니다. 평균 차이는 줄어도 표준편차가 더 많이 줄면 Cohen's d는 오히려 커집니다. 직접 계산해 보기 전에는 방향을 알 수 없다는 것이 민감도 분석을 실제로 해야 하는 이유입니다.

## 예시로 이해하기

### 예시 1 — outlier 포함/제외에 따른 효과크기 변화

가상의 유전자 발현량(군당 6마리)입니다. 비행군의 마지막 값 13.9가 outlier 후보입니다.

```python
import numpy as np

def cohens_d(a, b):
    a, b = np.asarray(a, float), np.asarray(b, float)
    pooled_sd = np.sqrt(((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1))
                        / (len(a) + len(b) - 2))
    return (a.mean() - b.mean()) / pooled_sd

# 가상 데이터: 어떤 유전자의 정규화 발현량 (군당 6마리)
ground = [10.1, 9.8, 10.3, 10.0, 9.9, 10.2]
flight = [10.4, 10.6, 10.2, 10.5, 10.3, 13.9]   # 마지막 값이 outlier 후보

print("=== 분석 A: 전체 포함 ===")
print("비행군 평균:", round(np.mean(flight), 2), "/ 중앙값:", round(np.median(flight), 2))
print("Cohen's d  :", round(cohens_d(flight, ground), 2))

print("=== 분석 B: outlier 후보(13.9) 제외 ===")
flight_wo = flight[:-1]
print("비행군 평균:", round(np.mean(flight_wo), 2), "/ 중앙값:", round(np.median(flight_wo), 2))
print("Cohen's d  :", round(cohens_d(flight_wo, ground), 2))

print("=== 평균 차이 vs 중앙값 차이 ===")
print("평균 차이   (포함/제외):", round(np.mean(flight) - np.mean(ground), 2), "/",
      round(np.mean(flight_wo) - np.mean(ground), 2))
print("중앙값 차이 (포함/제외):", round(np.median(flight) - np.median(ground), 2), "/",
      round(np.median(flight_wo) - np.median(ground), 2))
```

출력:

```text
=== 분석 A: 전체 포함 ===
비행군 평균: 10.98 / 중앙값: 10.45
Cohen's d  : 0.91
=== 분석 B: outlier 후보(13.9) 제외 ===
비행군 평균: 10.4 / 중앙값: 10.4
Cohen's d  : 2.0
=== 평균 차이 vs 중앙값 차이 ===
평균 차이   (포함/제외): 0.93 / 0.35
중앙값 차이 (포함/제외): 0.4 / 0.35
```

세 가지를 읽어 냅니다.

- **평균 차이**는 샘플 하나 때문에 0.93 → 0.35로 크게 달라졌습니다. 평균은 outlier에 민감합니다.
- **Cohen's d**는 오히려 0.91 → 2.0으로 커졌습니다. outlier가 표준편차(분모)를 부풀리고 있었기 때문입니다. "outlier를 빼면 효과가 약해진다"는 직관이 틀릴 수 있습니다.
- **중앙값 차이**는 0.40 → 0.35로 거의 그대로입니다. 중앙값은 outlier에 튼튼(robust)합니다.

결론 문장: "방향(비행군 > 대조군)은 모든 분석에서 같았으나, 효과크기는 샘플 하나의 포함 여부에 따라 0.91에서 2.0까지 달라져 크기 추정은 불안정하다."

### 예시 2 — feature 정의를 바꿔 보기

걸음 변동성을 표준편차(SD), 변동계수(CV), 중앙값 절대편차(MAD) 세 가지로 정의해 PD군과 대조군의 효과크기를 비교합니다. 데이터는 코드 안에서 만든 가상의 값입니다.

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(7)

def cohens_d(a, b):
    pooled_sd = np.sqrt(((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1))
                        / (len(a) + len(b) - 2))
    return (a.mean() - b.mean()) / pooled_sd

# 가상 데이터: 참가자 1명당 걸음 간격(stride interval, 초) 50개
records = []
for group, n, mean_sd in [("control", 12, 0.020), ("PD", 12, 0.028)]:
    for i in range(n):
        base = rng.normal(1.05, 0.08)                 # 사람마다 다른 평균 걸음 간격
        sd = abs(rng.normal(mean_sd, 0.008))          # 사람마다 다른 걸음 변동성
        strides = rng.normal(base, sd, size=50)
        records.append({
            "participant": f"{group}_{i:02d}",
            "group": group,
            "sd": strides.std(ddof=1),                           # 정의 1: 표준편차(초)
            "cv": strides.std(ddof=1) / strides.mean() * 100,    # 정의 2: 변동계수(%)
            "mad": np.median(np.abs(strides - np.median(strides))),  # 정의 3: 중앙값 절대편차(초)
        })
df = pd.DataFrame(records)

print("참가자 수:", df["group"].value_counts().to_dict())
for feature in ["sd", "cv", "mad"]:
    pd_vals = df.loc[df["group"] == "PD", feature].to_numpy()
    ct_vals = df.loc[df["group"] == "control", feature].to_numpy()
    print(f"{feature:>3}: Cohen's d = {cohens_d(pd_vals, ct_vals):.2f}")
```

출력:

```text
참가자 수: {'control': 12, 'PD': 12}
 sd: Cohen's d = 1.65
 cv: Cohen's d = 1.51
mad: Cohen's d = 1.65
```

세 정의 모두 방향이 같고 크기도 1.5–1.65로 비슷합니다. 이럴 때 "결론은 feature 정의에 민감하지 않았다"고 쓸 수 있습니다. 코드에서 주목할 점: feature는 **참가자 한 명당 한 값**으로 요약한 뒤 비교했습니다. 걸음 50개 × 24명 = 1,200개를 독립 표본처럼 넣으면 4주차의 핵심 규칙(반복 측정은 독립이 아니다)을 어기게 됩니다.

(이 숫자는 가상 데이터의 결과입니다. 실제 데이터에서는 정의에 따라 결과가 달라질 수 있고, 달라지면 그 사실 자체가 보고할 내용입니다.)

### 예시 3 — sensitivity memo의 표

| # | 분석 | 바꾼 결정 | 방향 | 효과크기 | 주 분석과 비교 |
|---|---|---|---|---|---|
| 0 | **주 분석** | (Day 28 계획대로) | 비행군 > 대조군 | d = 0.91 | — |
| 1 | outlier 후보 1개 제외 | 샘플 제외 | 같음 | d = 2.0 | 크기 달라짐 |
| 2 | 중앙값으로 요약 | 요약 통계 | 같음 | 차이 0.40 | 유사 |

> **요약 문장:** 효과의 방향은 세 분석에서 일관되었다. 효과크기는 샘플 한 개의 포함 여부에 민감했으므로, 본 결과는 크기에 대한 추정이 아니라 방향에 대한 가설로 해석한다.

## 직접 해보기

1. `sensitivity-memo.md`를 만들고, 맨 위에 Day 28의 `pd-analysis-plan.md`와 3주차 보고서에서 **주 분석이 무엇이었는지** 각각 한 문장으로 옮겨 적습니다. 이것이 기준선입니다.
2. **OSDR — outlier 포함/제외.** Day 17에 기록한 outlier 후보 샘플이 있다면, Day 19에 고른 후보 유전자 2–3개에 대해 그 샘플을 포함/제외했을 때의 군 평균 차이와 Cohen's d를 예시 1의 `cohens_d` 함수로 계산합니다. outlier 후보가 없었다면, 각 군에서 PCA상 중심에서 가장 먼 샘플을 하나씩 빼 보는 leave-one-out으로 대신합니다.
3. **OSDR — 다른 plot.** 같은 유전자를 boxplot 대신 개별 점을 모두 찍는 strip plot(`seaborn.stripplot`)으로 그려, 군 차이가 샘플 한두 개에 의해 만들어진 것인지 눈으로 확인합니다.
4. **PD — 다른 feature 정의.** Day 26에 만든 주요 feature의 정의를 하나 바꿉니다. 보행 데이터라면 SD ↔ CV ↔ MAD, 웨어러블이라면 평균 ↔ 중앙값, 또는 window 길이를 다르게. 참가자 단위로 요약한 뒤 효과크기를 다시 계산합니다.
5. **PD — 제외 기준.** Day 28에 정한 제외 기준(예: 결측이 많은 참가자)을 적용했을 때와 안 했을 때의 효과크기를 비교합니다.
6. (5주차에 모델을 만들었다면) seed를 3개(예: 0, 42, 123)로 바꿔 participant-level 교차검증 성능의 범위를 기록합니다.
7. 예시 3과 같은 표를 프로젝트별로 하나씩 만듭니다. **계산한 분석은 결과가 마음에 들지 않아도 전부 표에 넣습니다.**
8. 각 표 아래에 요약 문장을 씁니다. "일관되었다 / 민감했다"를 명시하고, 민감한 결과는 내일 보고서 문장을 고칠 때 표현을 낮출 후보로 표시합니다.
9. commit합니다.

⚠️ **흔한 오류 1 — 민감도 분석 결과로 주 분석을 바꾸기.** outlier를 뺀 쪽이 더 깔끔하다고 그것을 본문 결과로 올리고 원래 분석을 지우면 안 됩니다. 주 분석은 그대로 두고, 민감도 분석은 별도 절에 나란히 둡니다.

⚠️ **흔한 오류 2 — 원본 데이터프레임을 덮어쓰기.** `df = df[df["sample"] != "X"]`처럼 원본 변수를 덮어쓰면 그 아래 셀들이 전부 제외된 데이터로 돌아갑니다. `df_wo = df[...]`처럼 새 이름을 쓰세요.

## 퀴즈

**1.** 민감도 분석과 p-hacking의 가장 중요한 차이는?
(a) 민감도 분석은 분석을 한 번만 한다
(b) 민감도 분석은 돌린 분석을 전부 보고하고, 주 분석은 미리 정해 둔다
(c) 민감도 분석은 p-value를 쓰지 않는다
(d) 차이가 없다

<details><summary>정답 보기</summary>

**(b)**. 둘 다 여러 분석을 돌리지만, p-hacking은 좋은 결과만 골라 보고하고 민감도 분석은 전부 보여 줍니다. 주 분석을 결과를 보기 전에 정해 두는 것이 전제입니다.

</details>

**2.** 예시 1에서 outlier를 제외했더니 Cohen's d가 0.91에서 2.0으로 **커진** 이유는?

<details><summary>정답 보기</summary>

**outlier가 표준편차(분모)를 크게 부풀리고 있었기 때문**입니다. 제외하면 평균 차이(분자)는 0.93에서 0.35로 줄지만 합동 표준편차가 훨씬 더 많이 줄어 비율은 커집니다. 방향을 미리 짐작하지 말고 계산해 봐야 하는 이유입니다.

</details>

**3.** (O/X) 값이 다른 샘플과 많이 다르다는 것만으로 그 샘플을 주 분석에서 제외할 수 있다.

<details><summary>정답 보기</summary>

**X**. 제외하려면 기술적 오류 같은 독립적인 근거가 필요하고, 그 기준은 미리 정해져 있어야 합니다. 근거가 없다면 포함한 분석을 주 분석으로 두고, 제외한 분석을 민감도 분석으로 함께 보고합니다.

</details>

**4.** 예시 2에서 걸음 1,200개를 그대로 두 군으로 나눠 비교하지 않고 참가자당 한 값으로 요약한 이유는?

<details><summary>정답 보기</summary>

**같은 사람의 걸음들은 서로 독립이 아니기 때문**입니다. 1,200개를 독립 표본처럼 다루면 표본 수가 부풀려져 불확실성이 실제보다 작게 계산됩니다. 독립적인 단위는 참가자 24명입니다.

</details>

**5.** (단답) 민감도 분석에서 확인하는 세 가지는 효과의 방향, 효과크기의 크기, 그리고 무엇인가요?

<details><summary>정답 보기</summary>

**그림을 다르게 그려도 같은 인상을 주는가**(시각화에 대한 안정성)입니다. boxplot에서 보이던 차이가 개별 점을 찍었을 때 샘플 한두 개 때문이었다면 결론의 표현을 낮춰야 합니다.

</details>

## 더 알아보기

> **📚 측정하지 못한 교란은 얼마나 강해야 할까**
> 민감도 분석은 outlier나 feature 정의뿐 아니라 "측정 못 한 교란"에도 쓸 수 있습니다. E-value는 관찰된 연관을 없애려면 숨은 교란이 치료·결과 모두와 얼마나 강하게 엮여 있어야 하는지를 한 숫자로 보여 줍니다. 큰 값이 인과를 증명하지는 않지만, 작은 값은 결론이 약하다는 경고입니다.
> → [심화 E — Day E5: 탐색 분석과 교란 통제: 회귀 보정, 성향점수, 민감도 분석](../advanced/E-ehr/day-E5.md)

## 오늘의 산출물 체크리스트
- [ ] `sensitivity-memo.md` 맨 위에 두 프로젝트의 주 분석이 한 문장씩 적혀 있다.
- [ ] OSDR: outlier 포함/제외(또는 leave-one-out) 결과와 strip plot 확인 결과가 있다.
- [ ] PD: 다른 feature 정의와 제외 기준 적용 여부에 따른 효과크기가 있다 (참가자 단위 요약).
- [ ] 돌린 분석이 전부 표에 들어 있다.
- [ ] "일관됨 / 민감함"을 밝힌 요약 문장이 프로젝트별로 있다.
- [ ] commit했다.

---
[← 이전](day-38.md) · [코스 지도](../../README.md) · [다음 →](day-40.md)
