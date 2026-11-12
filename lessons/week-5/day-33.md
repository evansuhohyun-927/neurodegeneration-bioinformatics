# Day 33 — 올바른 검증: GroupKFold와 데이터 누수

> **주차:** 5주차 · **예상 시간:** 75–90분 · **산출물:** 참가자 단위 검증 코드 (`notebooks/06_pd_baseline_model.ipynb`에 추가) + 누수 점검표

## 오늘의 목표
- 교차검증이 무엇이고 왜 한 번 나누는 것보다 믿을 만한지 설명할 수 있다.
- 행 단위 무작위 분할이 성능을 부풀린다는 것을 가상 데이터로 직접 재현하고, `GroupKFold`로 고칠 수 있다.
- 내 모델 코드에서 참가자 누수와 feature 누수를 점검표로 확인할 수 있다.

## 🎬 영상으로 먼저 보기

- [Machine Learning Fundamentals: Cross Validation — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=fSytzGwwBVw) (6분 4초)
- **무엇에 주목할까:** 데이터를 여러 조각으로 나눠 "돌아가며 한 조각씩 평가용으로 쓰는" 그림에 주목하세요. 영상은 행 단위로 조각을 나누지만, 우리는 오늘 그 조각의 단위를 **참가자**로 바꿉니다.

- [검색 링크: "data leakage machine learning explained"](https://www.youtube.com/results?search_query=data+leakage+machine+learning+explained) (검색 링크 — 특정 영상을 확인하지 못해 검색 결과로 연결합니다)
- **무엇에 주목할까:** 10분 안팎의 영상 하나를 골라 보세요. "평가용 데이터의 정보가 학습 과정에 새어 들어가는 경로"가 몇 가지로 분류되는지(분할 방법, 전처리, 정답에서 파생된 feature)만 확인하면 됩니다. 영상을 못 찾아도 아래 개념 설명만으로 충분합니다.

## 개념 설명

### 교차검증: 시험을 한 번이 아니라 다섯 번 보기

어제 참가자 50명 중 15명을 평가용으로 떼었더니, 어느 15명이 뽑히느냐에 따라 정확도가 크게 흔들렸습니다. 시험을 한 번만 보면 운이 크게 작용하는 것과 같습니다.

**교차검증(cross-validation, CV)**은 시험을 여러 번 보는 방법입니다. 5-fold 교차검증이라면 참가자를 다섯 조(fold)로 나눕니다. 1조를 평가용으로 빼고 나머지 네 조로 학습해 점수를 냅니다. 다음에는 2조를 빼고 학습해 점수를 냅니다. 이렇게 다섯 번 하면 모든 참가자가 정확히 한 번씩 평가용이 되고, 점수가 다섯 개 나옵니다. 다섯 점수의 평균이 성능의 추정값이고, 다섯 점수가 얼마나 퍼져 있는지가 그 추정값의 불안정함을 보여 줍니다.

실험에 빗대면 같은 실험을 독립적으로 다섯 번 반복하고 평균과 편차를 보고하는 것과 같습니다. 한 번의 결과만 보고하는 것보다 훨씬 정직합니다.

scikit-learn에는 조를 나누는 도구가 여럿 있고, 이름이 비슷해서 헷갈리기 쉽습니다.

- `KFold`: **행**을 무작위로 다섯 조로 나눕니다. 한 행이 한 사람인 데이터에만 맞습니다.
- `GroupKFold`: **그룹(참가자)**을 다섯 조로 나눕니다. 같은 참가자의 행은 항상 같은 조에 들어갑니다. 우리가 쓸 도구입니다.
- `StratifiedGroupKFold`: 참가자 단위로 나누되, 조마다 PD/대조군 비율도 비슷하게 맞춥니다. 군의 크기가 많이 다를 때 씁니다.

### 데이터 누수: 시험지가 미리 새어 나갔다

**데이터 누수(data leakage)**는 평가용 데이터에 대한 정보가 학습 과정에 흘러 들어가서 성능이 실제보다 좋게 나오는 현상입니다. 시험 전날 시험지가 유출된 것과 같습니다. 점수는 높지만 실력을 재지 못합니다.

반복 측정 데이터에서 가장 흔한 누수가 **참가자 누수**입니다. 같은 사람의 측정이 학습용과 평가용에 나뉘어 들어가는 경우입니다. 왜 문제일까요? 사람의 움직임에는 지문처럼 개인 고유의 패턴이 있습니다. 걸음걸이만 보고 멀리서 친구를 알아볼 수 있는 것처럼요. 모델은 "PD군의 움직임이 어떤가"를 배우는 대신 "P007의 움직임은 이렇고, P007은 PD군이다"를 외울 수 있습니다. 평가용에 P007의 다른 측정이 나오면 그 사람을 알아보고 맞힙니다.

병리 판독 시험에 비유하면, 연습 때 본 환자의 **같은 조직에서 뜬 다른 절편**을 시험에 내는 것입니다. 전공의는 질환의 특징이 아니라 그 조직의 생김새를 기억해서 맞힙니다. 처음 보는 환자의 조직으로 시험을 보면 점수가 떨어질 것입니다.

우리가 알고 싶은 것은 "**처음 보는 사람**에게도 통하는가"입니다. 그러니 시험은 처음 보는 사람으로 치러야 합니다. 4주차의 규칙 "시계열을 무작위로 자른 뒤 train/test에 섞지 않는다"와 Day 31의 "행 단위 p-value는 틀린 숫자다"가 같은 뿌리에서 나온 이야기입니다. 독립이 아닌 것을 독립인 것처럼 다루면 결과가 부풀려집니다.

### feature 누수: 정답이 문제지에 적혀 있다

참가자 단위로 잘 나누었어도 누수는 다른 길로 들어올 수 있습니다. 이것을 통틀어 **feature 누수**라고 부르겠습니다. 대표적인 세 경로가 있습니다.

**① 정답에서 파생된 열.** 진단이 내려진 뒤에야 생기는 정보가 feature에 섞여 있는 경우입니다. 예를 들어 "신경과 외래 방문 횟수", "PD 약물 복용 여부", "증상 척도 점수"는 사실상 진단 그 자체입니다. 이런 열을 넣으면 정확도가 100%에 가깝게 나오지만 움직임에서 배운 것은 아무것도 없습니다. **성능이 너무 좋으면 기뻐하기 전에 의심합니다.**

**② 군과 겹치는 측정 정보.** 파일 이름, 측정 날짜, 기기 일련번호, 기록 길이처럼 군마다 체계적으로 다른 "곁다리 정보"입니다. Day 31의 기기 교란과 같은 문제인데, 모델은 이런 지름길(shortcut)을 사람보다 훨씬 잘 찾아냅니다.

**③ 전처리 단계의 누수.** 표준화에 쓰는 평균·표준편차, 결측값을 채우는 값, "군 차이가 큰 feature 고르기" 같은 작업을 **전체 데이터로 먼저 한 뒤** 나누면, 평가용 데이터의 정보가 전처리를 통해 학습에 스며듭니다. 특히 정답(y)을 보고 feature를 고르는 작업을 분할 전에 하면 무의미한 feature로도 높은 성능이 나올 수 있습니다. 해결책은 어제 배운 **파이프라인**입니다. 전처리를 파이프라인 안에 넣으면 각 fold의 학습 데이터에서만 계산됩니다.

오늘의 누수 점검은 결국 한 가지 질문으로 모입니다. "모델이 실제로 처음 보는 참가자를 만났을 때는 가질 수 없는 정보를, 학습이나 전처리 때 쓰지 않았는가?"

## 예시로 이해하기

### 예시 1 — 같은 데이터, 같은 모델, 나누는 방법만 바꾸기

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

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupKFold, KFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X = df[FEATURES]
y = (df[GROUP_COL] == "PD").astype(int)       # 🔁 내 군 이름으로
groups = df[ID_COL]

models = {
    "logistic regression": make_pipeline(StandardScaler(), LogisticRegression()),
    "random forest": RandomForestClassifier(n_estimators=200, random_state=0),
}
row_cv = KFold(n_splits=5, shuffle=True, random_state=0)   # ❌ 행 단위 무작위 분할
group_cv = GroupKFold(n_splits=5)                          # ✅ 참가자 단위 분할

print(f"{'model':<22}{'row-wise (leaky)':>18}{'participant-wise':>18}{'inflation':>11}")
for name, model in models.items():
    leaky = cross_val_score(model, X, y, cv=row_cv).mean()
    honest = cross_val_score(model, X, y, cv=group_cv, groups=groups).mean()
    print(f"{name:<22}{leaky:>18.2f}{honest:>18.2f}{leaky - honest:>+11.2f}")
```

실행 결과 (5-fold 평균 accuracy):

```text
model                   row-wise (leaky)  participant-wise  inflation
logistic regression                 0.82              0.73      +0.09
random forest                       0.92              0.75      +0.17
```

데이터도 모델도 그대로인데, 나누는 방법 하나로 랜덤 포레스트의 정확도가 0.17이나 달라졌습니다. 왼쪽 열(행 단위)의 숫자는 "이미 본 사람의 다른 측정을 맞히는 능력"이고, 오른쪽 열(참가자 단위)이 "처음 보는 사람을 맞히는 능력"입니다. 보고서에 쓸 수 있는 것은 오른쪽뿐입니다.

랜덤 포레스트에서 부풀려지는 폭이 더 큰 이유는 어제 본 대로 이 모델이 학습 데이터를 통째로 외울 수 있기 때문입니다. 유연한 모델일수록 개인의 "지문"을 잘 외우고, 그만큼 누수의 덕을 크게 봅니다. 인터넷에서 "웨어러블 데이터로 정확도 95% 이상"이라는 결과를 보면 가장 먼저 분할 단위를 확인해야 하는 이유입니다.

### 예시 2 — 모델이 정말 "사람"을 외우는지 확인하기: 가짜 정답 실험

정말 개인을 외워서 생긴 일인지 확인하는 실험입니다. 참가자 50명에게 **진단과 무관한 가짜 군**을 무작위로 붙입니다. 이제 feature와 정답 사이에는 아무 관계가 없으므로, 정직한 평가라면 정확도는 동전 던지기(0.5) 근처여야 합니다. 예시 1에 이어서 실행합니다.

```python
# 첫 번째 fold에서 평가용 행의 참가자가 학습용에도 있는지 세어 보기
first_folds = {"row-wise": next(row_cv.split(X, y)),
               "participant-wise": next(group_cv.split(X, y, groups))}
for label, (train_idx, test_idx) in first_folds.items():
    seen = groups.iloc[test_idx].isin(set(groups.iloc[train_idx]))
    print(f"{label:<17} 평가용 {len(test_idx)}행 중 학습용에 같은 참가자가 있는 행: {seen.sum()}")

# 참가자마다 가짜 군(0/1)을 무작위로 배정: 진짜 신호가 전혀 없는 정답
rng = np.random.default_rng(1)
people = df[ID_COL].unique()
fake_label = dict(zip(people, rng.permutation(len(people)) % 2))
y_fake = df[ID_COL].map(fake_label)

forest = models["random forest"]
leaky = cross_val_score(forest, X, y_fake, cv=row_cv).mean()
honest = cross_val_score(forest, X, y_fake, cv=group_cv, groups=groups).mean()
print()
print(f"가짜 정답 + row-wise 분할         accuracy = {leaky:.2f}")
print(f"가짜 정답 + participant-wise 분할 accuracy = {honest:.2f}")
```

실행 결과:

```text
row-wise          평가용 60행 중 학습용에 같은 참가자가 있는 행: 60
participant-wise  평가용 60행 중 학습용에 같은 참가자가 있는 행: 0

가짜 정답 + row-wise 분할         accuracy = 0.91
가짜 정답 + participant-wise 분할 accuracy = 0.54
```

행 단위로 나누면 평가용 행 60개 **전부**가 학습용에 같은 참가자를 두고 있습니다. 그리고 아무 의미 없는 가짜 정답인데도 행 단위 분할에서는 정확도가 0.9에 가깝게 나옵니다. 모델이 배운 것은 "누가 누구인가"뿐이라는 증거입니다. 참가자 단위로 나누면 우연 수준 근처(0.54)로 내려갑니다. 배울 신호가 없으니 당연한 결과입니다.

이 "가짜 정답 실험"은 내 파이프라인에 누수가 있는지 점검하는 쓸모 있는 도구입니다. 정답을 뒤섞었는데도 성능이 우연 수준보다 뚜렷이 높다면 어딘가에서 정보가 새고 있는 것입니다.

### 예시 3 — 참가자 단위 검증 코드와 feature 누수 점검

오늘의 산출물이 될 검증 코드입니다. fold마다 겹치는 참가자가 없는지 확인하고, 평가용 인원과 PD 비율, 점수를 표로 남깁니다. 이어서 일부러 "정답에서 파생된 열"을 하나 넣어 feature 누수가 어떻게 보이는지 확인합니다. 예시 2에 이어서 실행합니다.

```python
from sklearn.base import clone

def participant_cv(model, X, y, groups, n_splits=5):
    """참가자 단위 교차검증. fold별 점검 결과와 accuracy를 표로 돌려준다."""
    rows = []
    for fold, (train_idx, test_idx) in enumerate(GroupKFold(n_splits=n_splits).split(X, y, groups), start=1):
        overlap = set(groups.iloc[train_idx]) & set(groups.iloc[test_idx])
        assert not overlap, f"fold {fold}: 참가자 누수 {overlap}"
        fitted = clone(model).fit(X.iloc[train_idx], y.iloc[train_idx])   # 전처리도 학습용에서만 fit
        rows.append({"fold": fold,
                     "test_participants": groups.iloc[test_idx].nunique(),
                     "test_PD_ratio": round(y.iloc[test_idx].mean(), 2),
                     "accuracy": round(fitted.score(X.iloc[test_idx], y.iloc[test_idx]), 2)})
    return pd.DataFrame(rows)

baseline = models["logistic regression"]
result = participant_cv(baseline, X, y, groups)
print(result.to_string(index=False))
print(f"평균 accuracy = {result['accuracy'].mean():.2f} (fold 간 표준편차 {result['accuracy'].std():.2f})")

# --- feature 누수 실험: 진단 뒤에야 생기는 정보를 feature로 넣으면? ---
rng = np.random.default_rng(2)
visits = {pid: (rng.poisson(6) + 2 if g == "PD" else rng.integers(0, 2))
          for pid, g in df.drop_duplicates(ID_COL)[[ID_COL, GROUP_COL]].values}
X_leaky = X.assign(neurology_visits=df[ID_COL].map(visits))   # 가상의 '신경과 방문 횟수'

leaky_result = participant_cv(baseline, X_leaky, y, groups)
print()
print(f"누수 열을 넣은 뒤 평균 accuracy = {leaky_result['accuracy'].mean():.2f}")

# 점검: feature 하나만으로 두 군이 거의 완벽히 갈리는 열 찾기 (참가자 단위)
from sklearn.metrics import roc_auc_score
person = X_leaky.groupby(groups).mean()
person_y = y.groupby(groups).first()
auc = person.apply(lambda col: roc_auc_score(person_y, col))
auc = auc.where(auc >= 0.5, 1 - auc).sort_values(ascending=False)   # 방향과 무관하게 0.5~1로
print()
print("feature 하나만 썼을 때의 구분 정도 (1.0 = 완벽히 갈림):")
print(auc.round(2))
```

실행 결과:

```text
 fold  test_participants  test_PD_ratio  accuracy
    1                 10            0.5      0.70
    2                 10            0.5      0.70
    3                 10            0.5      0.90
    4                 10            0.4      0.73
    5                 10            0.6      0.62
평균 accuracy = 0.73 (fold 간 표준편차 0.10)

누수 열을 넣은 뒤 평균 accuracy = 1.00

feature 하나만 썼을 때의 구분 정도 (1.0 = 완벽히 갈림):
neurology_visits     1.00
stride_time_cv       0.85
tremor_band_power    0.67
step_regularity      0.66
jerk_mean            0.63
accel_rms            0.57
arm_swing_asym       0.53
dtype: float64
```

참가자 단위로 올바르게 나누었는데도, 누수 열 하나를 넣자 정확도가 1.0에 가까워졌습니다. 마지막 표에서 `neurology_visits`는 혼자서 두 군을 완벽하게 가릅니다. 움직임 feature에서는 이런 일이 거의 일어나지 않습니다. **혼자서 0.95 이상을 내는 열이 있다면 "이 값은 진단을 알기 전에도 얻을 수 있는 정보인가?"를 반드시 확인하세요.** 답이 "아니요"라면 그 열은 feature가 아니라 정답의 다른 이름입니다.

fold별 표도 읽어 봅시다. fold마다 정확도가 꽤 다릅니다. 평가용이 10명뿐이라 그렇습니다. 그래서 평균 하나만 적지 않고 fold 간 퍼짐을 함께 적습니다.

## 직접 해보기

1. `notebooks/06_pd_baseline_model.ipynb`에 "Day 33 — 검증" 섹션을 만들고, 가상 데이터로 예시 1–3을 실행합니다.
2. 준비 코드의 `🔁`를 내 feature table로 바꾸고 예시 1을 실행합니다. 내 데이터에서 행 단위와 참가자 단위 accuracy가 얼마나 다른지 적습니다. (참가자당 측정이 1개뿐인 데이터라면 두 값이 비슷하게 나옵니다. 그것도 올바른 결과입니다.)
3. 예시 2의 가짜 정답 실험을 내 데이터에 실행합니다. 참가자 단위 분할에서 accuracy가 0.5 근처인지 확인합니다.
4. 예시 3의 `participant_cv` 함수를 내 baseline에 적용해 fold별 표를 얻습니다. 군의 크기가 많이 다르거나 어떤 fold의 `test_PD_ratio`가 0이나 1에 가깝다면, 함수 안의 `GroupKFold(n_splits=n_splits)`를 `StratifiedGroupKFold(n_splits=n_splits)`로 바꿉니다(`from sklearn.model_selection import StratifiedGroupKFold`).
5. 예시 3의 마지막 부분(feature 하나씩의 구분 정도)을 **내 feature 전체**에 실행합니다(`X_leaky` 대신 `X`). 0.95를 넘는 열이 있으면 Day 24의 데이터 사전에서 그 열의 뜻을 다시 확인합니다.
6. 아래 누수 점검표를 노트북의 markdown 셀에 붙이고 하나씩 확인합니다.

   ```markdown
   ### 누수 점검표
   - [ ] 분할 단위가 참가자다 (`GroupKFold` 또는 `StratifiedGroupKFold`, `groups=참가자 ID`).
   - [ ] 모든 fold에서 학습용과 평가용에 겹치는 참가자가 0명임을 `assert`로 확인했다.
   - [ ] 표준화·결측 대체·feature 선택이 파이프라인 안에 있다 (분할 전에 전체 데이터로 하지 않았다).
   - [ ] X에 참가자 ID, 파일 이름, 측정 날짜, 기기 번호 같은 열이 들어 있지 않다.
   - [ ] X에 진단 뒤에야 생기는 정보(약물, 증상 척도, 병력 문항 등)가 들어 있지 않다.
   - [ ] feature 하나만으로 두 군이 거의 완벽히 갈리는 열이 없다 (있다면 이유를 확인했다).
   - [ ] 정답을 참가자 단위로 뒤섞으면 성능이 우연 수준으로 내려간다.
   - [ ] 여러 설정을 시도한 뒤 가장 좋은 fold나 seed의 숫자만 고르지 않았다.
   ```

7. 점검 결과와 "행 단위 vs 참가자 단위" 두 숫자를 `learning-log.md`에 적고 commit합니다.

⚠️ **흔한 오류 1 — `groups`를 빼먹음:** `cross_val_score(model, X, y, cv=GroupKFold(5))`처럼 `groups=`를 넘기지 않으면 `ValueError: The 'groups' parameter should not be None.`이 납니다. 반대로 `cv=5`라고만 쓰면 오류 없이 **참가자를 고려하지 않는 행 단위 분할**이 조용히 실행됩니다. 오류가 안 나는 쪽이 더 위험합니다.

⚠️ **흔한 오류 2 — 분할 전에 `StandardScaler().fit_transform(X)`:** 전체 데이터로 표준화한 뒤 나누면 전처리 누수입니다. 표준화는 항상 `make_pipeline(StandardScaler(), ...)` 안에 두세요. 이 데이터에서는 차이가 작을 수 있지만, 정답을 보고 feature를 고르는 작업이라면 차이가 매우 커집니다.

## 퀴즈

**1.** 5-fold 교차검증에서 각 참가자는 평가용으로 몇 번 쓰이나요? (단답)

<details><summary>정답 보기</summary>

**정확히 한 번**입니다. 다섯 조 가운데 자기 조가 평가용일 때 한 번 평가되고, 나머지 네 번은 학습용으로 쓰입니다. 그래서 모든 참가자에 대해 "학습에 쓰이지 않은 상태에서의 예측"을 얻을 수 있습니다.

</details>

**2.** 참가자당 반복 측정이 6개인 데이터에서 `KFold(shuffle=True)`로 행을 무작위로 나누면 성능이 부풀려지는 이유는?

- (a) 학습 데이터가 더 많아져서
- (b) 같은 참가자의 다른 측정이 학습용에 있어, 모델이 군의 특징이 아니라 개인의 특징을 외워 맞힐 수 있어서
- (c) 무작위 분할은 항상 틀린 방법이어서
- (d) 표준화가 되지 않아서

<details><summary>정답 보기</summary>

**(b)**. 사람마다 고유한 움직임 패턴이 있어서, 같은 사람의 측정이 양쪽에 있으면 모델은 "이 사람은 PD군"이라고 외운 것을 꺼내 쓰면 됩니다. 그 점수는 처음 보는 사람에 대한 성능이 아닙니다. 한 행이 한 사람인 데이터라면 무작위 분할 자체는 문제가 없습니다.

</details>

**3.** 정답을 참가자 단위로 무작위로 뒤섞었는데도 교차검증 accuracy가 0.88로 나왔습니다. 무엇을 의심해야 하나요? (단답)

<details><summary>정답 보기</summary>

**데이터 누수**, 특히 같은 참가자가 학습용과 평가용에 함께 들어가는 분할을 의심해야 합니다. 뒤섞은 정답에는 배울 신호가 없으므로 정직한 평가라면 0.5 근처가 나와야 합니다. 높게 나왔다면 모델이 개인을 식별해서 맞히고 있다는 뜻입니다.

</details>

**4.** 다음 중 feature로 쓰면 **안 되는** 열을 모두 고르세요.

- (a) 손목 가속도의 RMS
- (b) PD 약물 복용 여부
- (c) 기록 파일 이름에 들어 있는 번호
- (d) 보행 주기의 변동계수

<details><summary>정답 보기</summary>

**(b)와 (c)**. (b)는 진단이 내려진 뒤에야 생기는 정보로 사실상 정답 그 자체입니다. (c)는 군마다 체계적으로 다를 수 있는 곁다리 정보라서 모델이 지름길로 이용할 수 있습니다. (a)와 (d)는 움직임에서 계산한 feature입니다.

</details>

**5.** 참가자 단위 교차검증으로 accuracy 0.72가 나왔습니다. 이 숫자에 대한 설명으로 옳은 것은?

- (a) 다른 병원에서 다른 기기로 측정한 사람에게도 72% 맞는다는 뜻이다.
- (b) 이 데이터셋 안에서, 학습에 쓰지 않은 참가자의 측정을 구분한 비율이다. 외부 검증은 아니다.
- (c) 임상에서 진단 보조로 쓸 수 있다는 뜻이다.

<details><summary>정답 보기</summary>

**(b)**. 참가자 단위 분할은 "같은 사람을 다시 보는" 누수를 막아 줄 뿐입니다. 평가용 참가자도 같은 연구, 같은 기기, 같은 과제로 측정된 사람들이므로 데이터셋 내부 검증입니다. 다른 환경에서의 성능이나 임상 유용성은 이 숫자로 말할 수 없습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 가상 데이터에서 행 단위 분할과 참가자 단위 분할의 accuracy 차이를 직접 재현했다.
- [ ] 내 데이터에서 `participant_cv`로 fold별 표(평가용 인원, PD 비율, accuracy)를 만들었다.
- [ ] 모든 fold에서 참가자 겹침이 0명임을 `assert`로 확인했다.
- [ ] feature 하나씩의 구분 정도를 확인해 의심스러운 열이 없는지 살폈다.
- [ ] 누수 점검표 8항목을 확인하고 노트북에 남겼다.

---
[← 이전](day-32.md) · [코스 지도](../../README.md) · [다음 →](day-34.md)
