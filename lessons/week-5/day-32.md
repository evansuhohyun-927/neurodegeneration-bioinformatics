# Day 32 — 첫 baseline 모델: 로지스틱 회귀

> **주차:** 5주차 · **예상 시간:** 75–90분 · **산출물:** `notebooks/06_pd_baseline_model.ipynb` (모델 노트북)

## 오늘의 목표
- 분류 모델의 재료(X, y, groups)와 학습·평가의 흐름(fit → predict)을 설명할 수 있다.
- 참가자 단위로 나눈 데이터에서 로지스틱 회귀 baseline을 만들고 "아무것도 배우지 않은 모델"과 비교할 수 있다.
- 모델의 결과를 "진단"이 아니라 "이 데이터셋에서 두 군을 구분하는 baseline"으로 표현할 수 있다.

## 🎬 영상으로 먼저 보기

- [StatQuest: Logistic Regression — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=yIYKR4sgzI8) (8분 47초)
- **무엇에 주목할까:** 직선 대신 S자 곡선을 그려 "확률"을 예측한다는 것, 그리고 확률이 0.5를 넘으면 한쪽 군으로 분류한다는 것 두 가지를 잡으세요. 오늘 쓰는 모델이 바로 이것입니다.

- [StatQuest: Random Forests Part 1 - Building, Using and Evaluating — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=J4Wdy0Wc_xQ) (9분 54초)
- **무엇에 주목할까:** 선택 시청입니다. 여러 개의 결정나무가 투표하는 방식이라는 큰 그림만 보세요. 오늘 예시 3에서 비교용으로 한 번 돌려 보고, 내일 데이터 누수를 볼 때 다시 등장합니다.

## 개념 설명

### 분류 모델이 하는 일: 예제로 배우고, 처음 보는 사례에 답하기

머신러닝이 처음이라면 이렇게 생각하면 됩니다. 병리과 전공의가 판독을 배우는 과정과 같습니다. 선배가 "이 슬라이드는 A, 이 슬라이드는 B"라고 정답이 붙은 슬라이드를 많이 보여 줍니다(**학습, training**). 전공의는 그 속에서 규칙을 익힙니다. 실력은 **처음 보는 슬라이드**를 얼마나 맞히는지로 평가합니다(**평가, testing**). 연습 때 본 슬라이드를 다시 보여 주고 맞히게 하면 그건 실력이 아니라 기억력 시험입니다.

코드에서는 재료가 세 가지입니다.

- **X (feature 행렬):** 모델에게 보여 주는 정보. 우리 표의 feature 열들입니다.
- **y (label, 정답):** 맞혀야 하는 것. PD면 1, 대조군이면 0.
- **groups:** 각 행이 어느 참가자의 것인지. 학습에는 쓰지 않고 **데이터를 나눌 때만** 씁니다.

scikit-learn의 모든 모델은 같은 두 동작을 합니다. `model.fit(X_train, y_train)`은 정답이 붙은 예제로 규칙을 배우는 단계이고, `model.predict(X_test)`는 정답을 가린 새 예제에 답을 적어 내는 단계입니다. 그다음 가려 두었던 정답 `y_test`와 비교해 점수를 매깁니다.

나누는 단위는 이번에도 참가자입니다. 같은 사람의 측정이 학습용과 평가용 양쪽에 있으면, 모델은 "이 사람의 움직임"을 기억해서 맞힐 수 있습니다. 오늘은 `GroupShuffleSplit`으로 참가자를 한 번 나누는 것만 하고, 왜 그래야 하는지는 내일 숫자로 직접 확인합니다.

### 로지스틱 회귀: 가중치를 더해 확률로 바꾸는 모델

**로지스틱 회귀(logistic regression)**는 이름에 "회귀"가 들어 있지만 분류 모델입니다. 하는 일은 단순합니다. 각 feature에 가중치(계수)를 곱해 모두 더한 점수를 만들고, 그 점수를 S자 곡선에 통과시켜 0과 1 사이의 확률로 바꿉니다.

용량–반응 곡선을 떠올리면 됩니다. 약물 농도가 낮으면 반응이 거의 0%, 높으면 거의 100%이고 중간에서 가파르게 올라가는 S자 곡선입니다. 로지스틱 회귀에서는 "농도" 자리에 "feature들의 가중합"이, "반응률" 자리에 "PD군일 확률"이 들어갑니다. 확률이 0.5 이상이면 PD군으로, 아니면 대조군으로 분류합니다.

이 모델을 baseline으로 고르는 이유는 세 가지입니다. 첫째, 단순해서 작은 데이터에서도 엉뚱하게 과하게 배우는 일이 적습니다. 둘째, 계수의 부호와 크기를 보면 어떤 feature가 어느 방향으로 기여했는지 읽을 수 있습니다. 셋째, 더 복잡한 모델이 정말 필요한지 판단할 기준이 됩니다.

한 가지 준비가 필요합니다. feature마다 단위와 범위가 다르면(초 단위 0.02와 m/s² 단위 9.8) 계수를 비교할 수 없고 학습도 불안정해집니다. 그래서 **표준화(standardization)**, 즉 각 feature를 평균 0, 표준편차 1로 맞추는 단계를 모델 앞에 붙입니다. scikit-learn에서는 `make_pipeline(StandardScaler(), LogisticRegression())`처럼 **파이프라인(pipeline)**으로 묶습니다. 파이프라인으로 묶어야 표준화의 평균·표준편차가 학습 데이터에서만 계산됩니다. 이것이 왜 중요한지도 내일 다룹니다.

### baseline의 baseline: 아무것도 배우지 않은 모델과 비교하기

정확도 70%는 좋은 걸까요? 숫자만으로는 알 수 없습니다. 평가용 데이터의 70%가 PD군이라면, feature를 전혀 보지 않고 무조건 "PD"라고만 답해도 70%를 맞히기 때문입니다.

그래서 모델을 만들면 항상 **더미 모델(dummy classifier)**과 나란히 놓습니다. 더미 모델은 학습 데이터에서 더 많은 쪽 군을 무조건 답하는 모델입니다. 신약 임상시험의 위약군과 같은 역할입니다. 위약보다 낫지 않은 약은 효과가 있다고 말할 수 없듯이, 더미 모델보다 낫지 않은 모델은 feature에서 아무것도 배우지 못한 것입니다.

"baseline"이라는 말 자체도 같은 정신입니다. 오늘 만드는 모델은 최고 성능을 노리는 것이 아니라, "가장 단순한 방법으로 이 정도는 된다"는 기준선입니다. 이후에 더 복잡한 것을 시도한다면 이 선을 얼마나 넘는지를 봅니다.

### 모델 결과를 말하는 법

이번 주 뒤쪽 레슨에서 계속 반복할 세 가지 원칙을 지금 정해 둡니다.

1. **높은 성능은 임상 유용성을 자동으로 의미하지 않습니다.** 연구용으로 모집된 참가자들 사이에서 두 군을 구분하는 것과, 진료실에 온 사람에게 쓸모 있는 것은 다른 문제입니다.
2. **데이터셋 내부 검증은 외부 검증이 아닙니다.** 같은 데이터셋에서 떼어 낸 참가자는 같은 기기, 같은 과제, 같은 모집 방식으로 측정되었습니다. 다른 병원, 다른 기기에서도 통할지는 이 데이터로 알 수 없습니다.
3. **모델은 "PD를 진단한다"가 아니라 "이 데이터셋에서 PD군과 대조군을 구분하는 baseline"입니다.** 노트북의 제목, 변수 이름, 그림 캡션까지 이 표현으로 맞춥니다.

계수를 읽을 때도 조심합니다. 계수가 크다는 것은 "이 모델이 이 feature에 크게 의존했다"는 뜻이지, 그 feature가 병의 원인이라거나 생물학적으로 가장 중요하다는 뜻이 아닙니다. 어제 본 것처럼 나이 같은 교란변수의 흔적이 feature에 묻어 있으면, 모델은 그것까지 기꺼이 이용합니다.

## 예시로 이해하기

### 예시 1 — 재료 준비: X, y, groups와 참가자 단위 나누기

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

from sklearn.model_selection import GroupShuffleSplit

X = df[FEATURES]                              # 모델에게 보여 줄 정보
y = (df[GROUP_COL] == "PD").astype(int)       # 정답: PD = 1, HC = 0   🔁 내 군 이름으로
groups = df[ID_COL]                           # 각 행의 참가자 (나눌 때만 사용)

# 참가자의 30%를 평가용으로 떼어 둔다 (같은 사람은 한쪽에만 들어간다)
splitter = GroupShuffleSplit(n_splits=1, test_size=0.3, random_state=2)
train_idx, test_idx = next(splitter.split(X, y, groups=groups))

X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

train_people = set(groups.iloc[train_idx])
test_people = set(groups.iloc[test_idx])
print("학습용: 참가자", len(train_people), "명 /", len(train_idx), "행")
print("평가용: 참가자", len(test_people), "명 /", len(test_idx), "행")
print("양쪽에 모두 있는 참가자 수:", len(train_people & test_people))
print("평가용 중 PD 비율:", round(y_test.mean(), 2))

assert len(train_people & test_people) == 0, "같은 참가자가 학습용과 평가용에 모두 있습니다!"
```

실행 결과:

```text
학습용: 참가자 35 명 / 210 행
평가용: 참가자 15 명 / 90 행
양쪽에 모두 있는 참가자 수: 0
평가용 중 PD 비율: 0.47
```

마지막 `assert` 줄은 안전장치입니다. 겹치는 참가자가 한 명이라도 있으면 오류를 내며 멈춥니다. 내 데이터로 바꿔도 이 줄은 지우지 마세요.

이 한 번의 분할은 흐름을 보여 주는 탐색용 데모입니다. 평가용 참가자가 15명뿐이라 누가 뽑혔는지에 따라 성능 숫자가 크게 달라집니다(`random_state`를 바꿔 보면 확인할 수 있습니다). 그래서 오늘 나온 숫자는 보고서에 쓰지 않고, Day 33에서 참가자 단위 교차검증(`GroupKFold`)으로 바꿔 여러 번 나눈 결과의 평균과 흩어짐을 함께 봅니다. 표준화 같은 전처리는 항상 `make_pipeline` 안에 넣어, 평가용 데이터의 정보가 학습에 새어 들지 않게 합니다.

### 예시 2 — 로지스틱 회귀 baseline과 더미 모델

예시 1에 이어서 실행합니다.

```python
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# 위약군: 학습 데이터에서 더 많은 군만 답하는 모델
dummy = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)

# baseline: 표준화 → 로지스틱 회귀
baseline = make_pipeline(StandardScaler(), LogisticRegression())
baseline.fit(X_train, y_train)                 # 학습: 정답이 붙은 예제로 규칙 배우기

print(f"더미 모델      평가용 accuracy = {dummy.score(X_test, y_test):.2f}")
print(f"로지스틱 회귀  학습용 accuracy = {baseline.score(X_train, y_train):.2f}")
print(f"로지스틱 회귀  평가용 accuracy = {baseline.score(X_test, y_test):.2f}")

# 처음 보는 참가자 몇 명의 예측 확률 들여다보기 (측정 6개의 평균)
proba = baseline.predict_proba(X_test)[:, 1]   # 각 측정이 PD군(1)일 확률
peek = pd.DataFrame({"participant": groups.iloc[test_idx].values,
                     "정답": y_test.values, "PD군일_확률": proba})
print()
print(peek.groupby("participant").mean().round(2).head(6))

# 계수: 이 모델이 각 feature에 준 가중치 (표준화된 단위)
coefs = pd.Series(baseline[-1].coef_[0], index=FEATURES).sort_values(key=abs, ascending=False)
print()
print("계수 (양수 = 값이 클수록 PD군 쪽으로):")
print(coefs.round(2))
```

실행 결과:

```text
더미 모델      평가용 accuracy = 0.47
로지스틱 회귀  학습용 accuracy = 0.81
로지스틱 회귀  평가용 accuracy = 0.74

              정답  PD군일_확률
participant
P001         1.0     0.53
P010         1.0     0.86
P013         1.0     1.00
P014         1.0     0.44
P018         1.0     0.91
P024         1.0     0.45

계수 (양수 = 값이 클수록 PD군 쪽으로):
stride_time_cv       1.86
tremor_band_power    0.84
step_regularity     -0.38
jerk_mean            0.36
accel_rms           -0.36
arm_swing_asym       0.16
dtype: float64
```

읽는 법을 정리합니다.

- 더미 모델과 비교해 얼마나 나은지가 첫 번째 확인 사항입니다.
- 학습용 점수가 평가용 점수보다 높은 것은 정상입니다. 연습 문제는 이미 본 문제니까요. 보고할 숫자는 **평가용** 점수입니다.
- 계수의 부호는 Day 30에서 본 군 차이의 방향과 대체로 같습니다(`stride_time_cv`는 양수, `step_regularity`는 음수). 모델이 마법을 부린 것이 아니라 단변량 비교에서 본 차이들을 조합했다는 뜻입니다.
- 평가용 참가자는 15명뿐입니다. 한 명의 측정이 맞고 틀리는 것만으로 점수가 몇 %p씩 움직입니다. `random_state=2`를 다른 숫자로 바꾸면 결과가 꽤 달라집니다. 한 번 나눈 결과는 그만큼 불안정합니다. 내일 교차검증으로 이 문제를 줄입니다.

### 예시 3 — (선택) 랜덤 포레스트로 같은 일을 해 보기

실라부스는 로지스틱 회귀와 랜덤 포레스트 **중 하나**를 고르라고 합니다. 이 코스는 로지스틱 회귀를 주 baseline으로 쓰지만, scikit-learn에서는 모델을 바꿔 끼우는 것이 한 줄이라는 것을 보여 주기 위해 한 번 돌려 봅니다. 예시 2에 이어서 실행합니다.

```python
from sklearn.ensemble import RandomForestClassifier

forest = RandomForestClassifier(n_estimators=200, random_state=0)
forest.fit(X_train, y_train)

print(f"랜덤 포레스트  학습용 accuracy = {forest.score(X_train, y_train):.2f}")
print(f"랜덤 포레스트  평가용 accuracy = {forest.score(X_test, y_test):.2f}")
print()
print("feature 중요도:")
print(pd.Series(forest.feature_importances_, index=FEATURES).sort_values(ascending=False).round(2))
```

실행 결과:

```text
랜덤 포레스트  학습용 accuracy = 1.00
랜덤 포레스트  평가용 accuracy = 0.67

feature 중요도:
stride_time_cv       0.27
step_regularity      0.21
tremor_band_power    0.18
jerk_mean            0.15
arm_swing_asym       0.12
accel_rms            0.08
dtype: float64
```

학습용 정확도가 1.00입니다. 랜덤 포레스트는 연습 문제를 통째로 외울 수 있을 만큼 유연한 모델이기 때문입니다. 그런데 평가용 점수는 로지스틱 회귀보다 낫지 않습니다. 이렇게 학습용에서만 잘하는 현상을 **과적합(overfitting)**이라고 합니다. 참가자가 수십 명인 데이터에서는 단순한 모델이 더 복잡한 모델에 밀리지 않는 일이 흔합니다. baseline을 단순한 모델로 잡는 이유입니다.

## 직접 해보기

1. 새 노트북 `notebooks/06_pd_baseline_model.ipynb`를 만듭니다. 첫 셀(markdown)에 다음 문장을 적습니다: "이 노트북의 모델은 PD를 진단하지 않는다. 이 데이터셋에서 PD군과 대조군을 구분하는 baseline이다."
2. 가상 데이터로 예시 1–2를 실행해 같은 출력을 확인합니다. (예시 3은 선택)
3. 준비 코드의 `🔁` 부분을 내 feature table로 바꿉니다. 예시 1의 `y = (df[GROUP_COL] == "PD")`에서 `"PD"`를 내 데이터의 PD군 이름으로 바꿉니다.
4. 모델에 넣기 전에 `X.isna().sum()`으로 결측값을 확인합니다. 결측이 있으면 Day 28에 정한 제외 기준대로 처리하고(예: 해당 행 제외) 몇 행이 빠졌는지 기록합니다.
5. 예시 1을 실행해 학습용/평가용 참가자 수, 겹치는 참가자 수(0이어야 함), 평가용의 PD 비율을 적습니다. `GroupShuffleSplit`은 군의 비율까지 맞춰 주지는 않으므로, 평가용에 한 군이 거의 없다면 `random_state`를 바꿔 다시 나눕니다(내일 배울 `StratifiedGroupKFold`가 이 문제를 줄여 줍니다).
6. 예시 2를 실행해 더미 모델과 baseline의 평가용 accuracy, 계수 표를 얻습니다.
7. 예시 1의 `random_state`를 1, 2, 3, 4, 5로 바꿔 가며 평가용 accuracy가 어떻게 변하는지 다섯 숫자를 적어 봅니다. 가장 좋은 숫자를 골라 보고하지 **않습니다**. 흔들림의 폭을 보는 것이 목적입니다.
8. 노트북 마지막 셀에 결과를 3문장으로 요약합니다. 형식: "참가자 단위로 나눈 한 번의 평가에서 baseline은 평가용 측정의 ○○%를 구분했다(더미 모델 △△%). 분할에 따라 □□–□□% 범위로 변했다. 이 결과는 이 데이터셋 내부의 값이며 진단 성능이 아니다."

⚠️ **흔한 오류 1 — `ValueError: Input X contains NaN`:** 로지스틱 회귀는 결측값을 받지 못합니다. 4번 단계의 결측 확인을 건너뛴 경우입니다. 어떤 행을 왜 뺐는지 기록을 남기고 제외하세요.

⚠️ **흔한 오류 2 — `train_test_split(X, y)`를 그대로 사용:** 인터넷 예제에서 가장 흔히 보는 이 함수는 **행 단위로** 무작위 분할합니다. 반복 측정이 있는 우리 데이터에 쓰면 같은 참가자가 양쪽에 들어갑니다. 반드시 `GroupShuffleSplit`(오늘)이나 `GroupKFold`(내일)를 쓰고 `assert`로 겹침이 없는지 확인하세요.

## 퀴즈

**1.** `model.fit(X_train, y_train)`과 `model.predict(X_test)`는 각각 무엇을 하나요? (단답)

<details><summary>정답 보기</summary>

`fit`은 **정답이 붙은 학습용 예제에서 규칙(계수)을 배우는** 단계이고, `predict`는 **정답을 보지 않은 새 예제에 대해 답을 내는** 단계입니다. 모델의 성능은 predict 결과를 가려 두었던 정답과 비교해 평가합니다.

</details>

**2.** 평가용 데이터의 70%가 PD군입니다. 모델의 평가용 accuracy가 0.71이라면?

- (a) 꽤 좋은 모델이다.
- (b) 무조건 "PD"라고 답하는 더미 모델(0.70)과 거의 같으므로, feature에서 배운 것이 거의 없다.
- (c) 과적합이다.
- (d) 데이터 누수가 있다.

<details><summary>정답 보기</summary>

**(b)**. 성능은 항상 더미 모델과 비교해서 읽어야 합니다. 위약과 차이가 없는 약을 효과 있다고 하지 않는 것과 같습니다.

</details>

**3.** 표준화(StandardScaler)를 로지스틱 회귀 앞에 붙이는 이유로 알맞은 것은?

- (a) feature마다 단위와 범위가 달라도 계수를 비교할 수 있고 학습이 안정되기 때문에
- (b) 결측값을 자동으로 채워 주기 때문에
- (c) 참가자 단위 분할을 대신해 주기 때문에
- (d) 정확도를 항상 높여 주기 때문에

<details><summary>정답 보기</summary>

**(a)**. 표준화는 각 feature를 평균 0, 표준편차 1로 맞춰 같은 저울에 올립니다. 결측값 처리나 데이터 분할과는 관계가 없고, 성능을 항상 올려 주는 것도 아닙니다.

</details>

**4.** 랜덤 포레스트의 학습용 accuracy가 1.00, 평가용 accuracy가 0.67로 나왔습니다. 이 현상의 이름과 뜻은? (단답)

<details><summary>정답 보기</summary>

**과적합(overfitting)**입니다. 모델이 학습 데이터의 세부(우연한 잡음이나 개인별 특징)까지 외워서 학습용에서는 완벽하지만, 처음 보는 참가자에게는 그만큼 통하지 않는 상태입니다. 그래서 보고할 숫자는 항상 평가용 성능입니다.

</details>

**5.** 로지스틱 회귀에서 어떤 feature의 계수가 가장 컸습니다. 다음 중 할 수 **없는** 해석은?

- (a) 이 모델은 두 군을 구분할 때 이 feature에 가장 크게 의존했다.
- (b) 이 feature가 파킨슨병의 원인이다.
- (c) 이 feature의 군 간 차이에 나이 같은 교란이 섞여 있을 수 있으니 Day 31의 표와 대조해 봐야 한다.

<details><summary>정답 보기</summary>

**(b)**. 계수는 "모델이 무엇에 의존했는가"를 말할 뿐 인과나 생물학적 중요도를 말하지 않습니다. 모델은 교란변수의 흔적도 구분에 도움이 되면 그대로 이용합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/06_pd_baseline_model.ipynb` 첫 셀에 "진단이 아닌 baseline" 문장을 적었다.
- [ ] 참가자 단위로 학습용/평가용을 나누고 겹치는 참가자가 0명임을 `assert`로 확인했다.
- [ ] 더미 모델과 로지스틱 회귀 baseline의 평가용 accuracy를 나란히 적었다.
- [ ] 계수 표를 Day 30의 효과크기 표와 대조해 보았다.
- [ ] `random_state` 5개에 대한 accuracy 범위를 적고, 3문장 요약을 썼다.

---
[← 이전](day-31.md) · [코스 지도](../../README.md) · [다음 →](day-33.md)
