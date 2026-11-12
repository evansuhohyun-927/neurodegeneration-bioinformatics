# Day 29 — 가설검정, 회귀, 분류: 질문에 맞는 분석 고르기

> **주차:** 5주차 · **예상 시간:** 75–90분 · **산출물:** `analysis-choice.md` (분석 선택 근거)

## 오늘의 목표
- 두 그룹 비교, 회귀, 분류가 각각 어떤 질문에 답하는 도구인지 구분할 수 있다.
- 내 feature table에서 "분석 단위"가 행(측정)이 아니라 참가자라는 것을 확인할 수 있다.
- Day 28에 쓴 분석 계획의 질문마다 분석 방법 하나를 고르고 그 이유를 적을 수 있다.

## 🎬 영상으로 먼저 보기

- [Hypothesis Testing and The Null Hypothesis, Clearly Explained!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=0oc49DyA3hU) (14분 40초)
- **무엇에 주목할까:** 가설검정이 "차이가 있다"를 증명하는 것이 아니라 "차이가 없다는 가정(귀무가설)으로는 이 데이터를 설명하기 어렵다"를 따지는 절차라는 점에 주목하세요. 오늘 배울 세 가지 도구 중 첫 번째(군 비교)의 논리입니다.

- [검색 링크: StatQuest "A Gentle Introduction to Machine Learning"](https://www.youtube.com/results?search_query=StatQuest+A+Gentle+Introduction+to+Machine+Learning) (검색 링크 — 영상 주소를 직접 확인하지 못해 검색 결과로 연결합니다)
- **무엇에 주목할까:** 머신러닝이 "분류(classification)"와 "회귀(regression)"라는 두 종류의 예측 문제로 나뉜다는 것, 그리고 모델의 좋고 나쁨을 "처음 보는 데이터(testing data)"에서 판단한다는 것만 잡으면 충분합니다. 이 두 가지가 Day 32–34의 뼈대입니다.

## 개념 설명

### 같은 표, 세 가지 질문

4주차에 만든 feature table은 하나지만, 그 표에 던질 수 있는 질문은 모양이 서로 다릅니다. 병원에 비유해 보겠습니다. 같은 환자를 두고도 "이 환자군의 평균 혈압이 일반인보다 높은가?"(군 비교), "나이가 열 살 많아지면 혈압이 얼마나 오르는가?"(회귀), "혈압·맥박·체온만 보고 이 사람이 어느 병동 환자인지 맞힐 수 있는가?"(분류)는 전혀 다른 질문입니다. 쓰는 도구도, 나오는 답의 모양도 다릅니다.

- **군 비교(가설검정, hypothesis testing):** "PD군과 대조군에서 이 feature의 평균이 다른가?" 답은 **차이의 크기(효과크기)와 그 불확실성(신뢰구간)**입니다. 관심은 *집단*에 있습니다.
- **회귀(regression):** "나이, 군 같은 변수가 한 단위 변할 때 feature가 얼마나 변하는가?" 답은 **기울기(계수)**입니다. 여러 변수를 동시에 넣어 "나이를 고려하고도 군 차이가 남는가"를 볼 수 있습니다.
- **분류(classification):** "feature 여러 개를 함께 쓰면 처음 보는 참가자의 군을 얼마나 맞히는가?" 답은 **예측 성능(정확도, AUC 등)**입니다. 관심은 *개별 예측*에 있습니다.

초보자가 가장 자주 하는 실수는 "머신러닝이 더 고급이니까 분류부터" 하는 것입니다. 하지만 "PD군의 보폭 변동성이 더 큰가?"라는 질문에 분류 모델의 정확도 80%는 답이 아닙니다. 질문이 먼저이고 도구는 그 다음입니다.

### 설명하려는가, 예측하려는가

세 도구는 크게 두 목적으로 나뉩니다. 군 비교와 회귀는 **설명(explanation)**, 즉 "무엇이 얼마나 다른가"를 알고 싶을 때 씁니다. 분류는 **예측(prediction)**, 즉 "새 사례를 얼마나 잘 맞히는가"를 알고 싶을 때 씁니다.

생물학 실험에 빗대면, 설명은 western blot에서 "처리군의 밴드가 대조군보다 1.8배 진하다"를 보고하는 일이고, 예측은 "밴드 패턴 여러 개를 보고 이 lane이 처리군인지 맞히는 판독기"를 만드는 일입니다. 판독기가 잘 맞힌다고 해서 어떤 단백질이 왜 변했는지 알게 되는 것은 아니고, 반대로 한 단백질의 차이가 뚜렷하다고 해서 판독기가 반드시 잘 작동하는 것도 아닙니다(개인차가 크면 평균 차이가 있어도 개별 예측은 어렵습니다).

그래서 보고하는 숫자도 다릅니다. 설명에서는 효과크기와 신뢰구간(2주차 Day 9), 여러 feature를 검정했다면 FDR(Day 10)을 씁니다. 예측에서는 **학습에 쓰지 않은 참가자**에 대한 성능을 씁니다. 이 과정에서 분류 모델은 어디까지나 "이 데이터셋에서 두 군을 구분하는 baseline(기준선)"입니다. 누군가를 진단하는 도구가 아니고, 그렇게 표현해서도 안 됩니다.

### 분석 단위: 행이 아니라 사람

어떤 도구를 고르든 먼저 정해야 하는 것이 **분석 단위(unit of analysis)**입니다. 4주차에 만든 표에는 한 참가자가 여러 행(반복 측정)으로 들어 있습니다. 행이 300개라고 해서 독립적인 표본이 300개인 것은 아닙니다.

한 마우스의 뇌에서 절편 6장을 떠서 염색했다고 합시다. 절편 6장은 서로 매우 비슷합니다. 같은 마우스에서 왔으니까요. 마우스 5마리 × 절편 6장 = 30장을 "n = 30"이라고 쓰면 안 되고 "n = 5마리"라고 써야 한다는 것은 실험실에서 익숙한 규칙입니다. 이것을 **유사반복(pseudoreplication)**이라고 부릅니다. 스마트워치나 보행 데이터의 반복 측정도 똑같습니다. 같은 사람의 측정 6번은 그 사람 고유의 움직임 습관을 공유합니다.

이 규칙은 세 도구 모두에 적용됩니다. 군 비교에서는 참가자별로 먼저 요약(평균 등)한 뒤 비교하고(Day 30), 회귀에서는 참가자 단위 표를 쓰거나 반복 측정을 고려하는 모형을 쓰고(Day 31), 분류에서는 같은 참가자의 행이 학습용과 평가용에 동시에 들어가지 않도록 나눕니다(Day 33). 오늘은 내 표에서 "행 수"와 "참가자 수"를 따로 세는 것부터 시작합니다.

## 예시로 이해하기

이번 주의 모든 코드는 **코드 안에서 만든 가상 feature table**로 돌아갑니다. 가상 참가자 50명(PD 25명, 대조군 HC 25명)이 각자 6번씩 측정된 표입니다. feature 이름(`stride_time_cv` 등)과 값은 연습용으로 지어낸 것이고, 값은 단위 없는 표준화 점수라고 생각하세요. **PADS나 PhysioNet 보행 데이터의 실제 열 이름이 아닙니다.** 내 데이터로 바꿔 끼우는 자리는 코드 안에 `🔁`로 표시했습니다.

### 예시 1 — 준비 코드: 가상 feature table 만들고 구조 세어 보기

아래 "준비 코드"는 이번 주 내내 각 레슨의 첫 셀로 다시 등장합니다. seed를 고정했기 때문에 누가 돌려도 같은 표가 나옵니다.

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

print("행(측정) 수:", len(df))
print("참가자 수:", df[ID_COL].nunique())
print("참가자당 측정 수:", df.groupby(ID_COL).size().unique())
print()
print("참가자 단위 군별 인원:")
print(df.drop_duplicates(ID_COL)[GROUP_COL].value_counts())
print()
print(df.head(3).to_string(index=False))
```

실행 결과:

```text
행(측정) 수: 300
참가자 수: 50
참가자당 측정 수: [6]

참가자 단위 군별 인원:
group
PD    25
HC    25
Name: count, dtype: int64

participant_id group  age sex  repeat  stride_time_cv  accel_rms  tremor_band_power  jerk_mean  step_regularity  arm_swing_asym
          P001    PD 70.1   M       1           1.654      0.227             -1.131     -0.908           -0.256           0.266
          P001    PD 70.1   M       2           1.775      0.226             -1.259     -1.342           -0.053          -0.029
          P001    PD 70.1   M       3           1.612      0.270             -1.045     -1.141           -0.379          -0.104
```

행은 300개지만 사람은 50명입니다. 앞으로 "n"이라고 쓸 때는 50을 뜻합니다.

### 예시 2 — 질문 A(군 비교)와 질문 B(회귀): 답의 모양이 다르다

예시 1과 같은 노트북에서 이어서 실행합니다. 먼저 참가자별 평균으로 표를 줄인 다음, 두 가지 질문을 던집니다.

```python
from scipy import stats

# 참가자 단위 표: 한 사람 = 한 행
person = df.groupby([ID_COL, GROUP_COL], as_index=False)[["age"] + FEATURES].mean()

# 질문 A (군 비교): PD군과 HC군의 tremor_band_power 평균이 다른가?
pd_vals = person.loc[person[GROUP_COL] == "PD", "tremor_band_power"]
hc_vals = person.loc[person[GROUP_COL] == "HC", "tremor_band_power"]
t = stats.ttest_ind(pd_vals, hc_vals, equal_var=False)   # Welch t-검정
print("질문 A — 군 비교")
print(f"  평균 차이(PD - HC) = {pd_vals.mean() - hc_vals.mean():.2f},  p = {t.pvalue:.3f}")

# 질문 B (회귀): 나이가 1살 많으면 stride_time_cv가 얼마나 달라지는가?
reg = stats.linregress(person["age"], person["stride_time_cv"])
print("질문 B — 회귀")
print(f"  기울기 = {reg.slope:.3f} (나이 1살당),  r = {reg.rvalue:.2f}")
```

실행 결과:

```text
질문 A — 군 비교
  평균 차이(PD - HC) = 0.53,  p = 0.039
질문 B — 회귀
  기울기 = 0.085 (나이 1살당),  r = 0.56
```

질문 A의 답은 "두 군의 평균 차이"이고, 질문 B의 답은 "나이 1살당 변화량"입니다. 같은 표에서 나왔지만 서로 다른 문장으로 보고하게 됩니다. (효과크기와 신뢰구간은 내일 제대로 붙입니다.)

### 예시 3 — 질문 C(분류) 맛보기: 답은 "처음 보는 참가자를 맞힌 비율"

분류는 Day 32에서 차근차근 배웁니다. 오늘은 "답의 모양"만 봅니다. 참가자 50명 중 35명으로 규칙을 배우고, **나머지 15명**의 측정을 얼마나 맞히는지 셉니다.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupShuffleSplit

X = df[FEATURES]
y = (df[GROUP_COL] == "PD").astype(int)      # PD = 1, HC = 0

# 참가자 단위로 학습용/평가용을 나눈다 (같은 사람은 한쪽에만)
splitter = GroupShuffleSplit(n_splits=1, test_size=0.3, random_state=0)
train_idx, test_idx = next(splitter.split(X, y, groups=df[ID_COL]))

model = LogisticRegression().fit(X.iloc[train_idx], y.iloc[train_idx])
acc = model.score(X.iloc[test_idx], y.iloc[test_idx])
print("질문 C — 분류")
print(f"  평가용 참가자 수 = {df[ID_COL].iloc[test_idx].nunique()}명")
print(f"  처음 보는 참가자의 측정을 맞힌 비율(accuracy) = {acc:.2f}")
```

실행 결과:

```text
질문 C — 분류
  평가용 참가자 수 = 15명
  처음 보는 참가자의 측정을 맞힌 비율(accuracy) = 0.61
```

이 숫자는 "tremor가 얼마나 다른가"를 말해 주지 않습니다. "여섯 feature를 함께 쓰면 이 가상 데이터셋의 두 군을 이 정도로 구분한다"만 말해 줍니다. 그리고 15명으로 잰 숫자라 나누는 방법에 따라 꽤 출렁입니다. 이 문제는 Day 33–34에서 다룹니다.

## 직접 해보기

1. 새 노트북 `notebooks/05_pd_feature_analysis.ipynb`를 만들고(이번 주 Day 29–31에서 계속 씁니다) 예시 1–3을 그대로 실행해 가상 데이터로 출력이 같은지 확인합니다.
2. 준비 코드의 `🔁` 부분을 고쳐 **내 feature table**을 불러옵니다. `ID_COL`, `GROUP_COL`, `FEATURES`를 내 열 이름으로 바꿉니다.
3. 예시 1의 세는 코드를 내 표에 실행해 행 수, 참가자 수, 참가자당 측정 수(사람마다 다를 수 있습니다), 군별 참가자 수를 적습니다. Day 25의 QC 표와 숫자가 맞는지 대조합니다.
4. Day 28에 쓴 `pd-analysis-plan.md`를 열고, 거기 적은 주요 outcome 1–2개와 질문을 가져옵니다.
5. `analysis-choice.md`를 만들고 아래 표를 질문마다 한 줄씩 채웁니다.

   ```markdown
   | 질문 (한 문장) | 질문의 종류 | 분석 단위 | 결과 변수 | 고른 방법 | 이 방법을 고른 이유 | 보고할 숫자 |
   |---|---|---|---|---|---|---|
   | PD군과 HC군에서 <feature>가 다른가? | 군 비교 | 참가자 | <feature>의 참가자별 평균 | 평균 차이 + 효과크기 + 신뢰구간 | 집단 차이의 크기가 궁금함 | Cohen's d, 95% CI |
   | 나이를 고려해도 군 차이가 남는가? | 회귀 | 참가자 | <feature> | 선형 회귀(군 + 나이) | 교란 가능성 점검 | 군 계수, 95% CI |
   | feature들을 함께 쓰면 두 군이 구분되는가? | 분류 | 참가자 단위 split | 군(PD/HC) | 로지스틱 회귀 baseline | 예측 성능의 기준선 확인 | 참가자 단위 교차검증 성능 |
   ```

6. 표 아래에 "하지 않기로 한 분석"을 1–2줄 적습니다. 예: "feature가 3개뿐이고 군 비교가 주 질문이므로 분류 모델은 보조 분석으로만 한다."
7. `learning-log.md`에 오늘의 결정을 기록하고 commit합니다.

⚠️ **흔한 오류 1 — `KeyError: 'participant_id'`:** 내 표의 참가자 ID 열 이름이 다르기 때문입니다. `print(df.columns.tolist())`로 열 이름을 확인하고 `ID_COL`을 고치세요.

⚠️ **흔한 오류 2 — 군이 세 개 이상:** PADS처럼 군이 PD/대조군 외에 더 있는 데이터라면, 이번 주는 두 군만 남기고 시작하세요. 예: `df = df[df[GROUP_COL].isin(["PD", "HC"])]` (따옴표 안은 내 데이터의 실제 군 이름으로 바꿉니다. 실제 이름은 `df[GROUP_COL].unique()`로 확인합니다). 어떤 군을 왜 제외했는지는 `analysis-choice.md`에 적어 둡니다.

## 퀴즈

**1.** "PD군은 대조군보다 보행 주기 변동성이 큰가?"라는 질문에 가장 알맞은 분석은?

- (a) 분류 모델의 정확도
- (b) 참가자 단위 군 비교(효과크기와 신뢰구간)
- (c) feature 간 상관행렬
- (d) PCA

<details><summary>정답 보기</summary>

**(b)**. 질문이 "집단 간 차이의 크기"를 묻고 있으므로 군 비교가 맞습니다. 분류 정확도는 "여러 feature로 개별 참가자의 군을 맞히는 능력"이라는 다른 질문의 답입니다.

</details>

**2.** 참가자 40명이 각자 8번씩 측정된 표가 있습니다. 군 비교의 표본 수 n은 얼마로 보아야 할까요? (단답)

<details><summary>정답 보기</summary>

**40**. 한 사람의 반복 측정 8개는 서로 독립이 아니므로 320을 표본 수로 쓰면 유사반복(pseudoreplication)이 됩니다. 한 마우스에서 뜬 절편 여러 장을 각각 n으로 세지 않는 것과 같은 이치입니다.

</details>

**3.** 다음 중 "예측"이 목적인 질문은?

- (a) 나이가 많을수록 tremor 대역 파워가 커지는가?
- (b) PD군과 대조군의 팔 흔들기 비대칭이 다른가?
- (c) 여섯 feature를 함께 쓰면 학습에 쓰지 않은 참가자의 군을 얼마나 맞히는가?
- (d) 성별에 따라 가속도 RMS가 다른가?

<details><summary>정답 보기</summary>

**(c)**. (a)는 회귀, (b)와 (d)는 군 비교로 모두 "무엇이 얼마나 다른가"를 설명하려는 질문입니다. (c)만 처음 보는 사례에 대한 예측 성능을 묻습니다.

</details>

**4.** 분류 모델이 이 데이터셋에서 85%를 맞혔습니다. 보고서에 쓸 문장으로 더 적절한 것은?

- (a) "이 모델은 파킨슨병을 85% 정확도로 진단한다."
- (b) "이 데이터셋에서 참가자 단위로 평가했을 때, baseline 모델은 PD군과 대조군의 측정을 85% 구분했다."

<details><summary>정답 보기</summary>

**(b)**. 한 데이터셋 안에서의 성능은 임상 진단 능력을 뜻하지 않습니다. 모델은 "PD를 진단한다"가 아니라 "이 데이터셋에서 두 군을 구분하는 baseline"으로 표현하는 것이 이 과정의 원칙입니다.

</details>

**5.** 한 feature에서 두 군의 평균 차이가 뚜렷한데도 분류 성능은 그다지 높지 않을 수 있습니다. 왜 그럴까요? (단답)

<details><summary>정답 보기</summary>

평균 차이가 있어도 **개인차가 커서 두 군의 분포가 많이 겹치면** 개별 참가자를 맞히기는 어렵기 때문입니다. 군 비교는 집단의 평균을, 분류는 개별 사례를 다루므로 두 결과가 꼭 같이 움직이지는 않습니다.

</details>

## 더 알아보기

> **📚 같은 틀, 다른 데이터: 화합물 활성 예측**
> "질문 → 분석 고르기" 틀은 신약 개발 데이터에도 그대로 적용됩니다. 화합물이 표적을 억제하는 농도(IC50)를 직접 맞히면 회귀, 기준으로 활성/비활성을 나눠 맞히면 분류입니다. IC50는 수천 배씩 차이 나므로 −log10(몰 농도)인 pIC50로 바꿔 쓰는데, 부호를 빠뜨리면 "강한 약일수록 값이 크다"는 방향이 뒤집힙니다. 분석 단위는 화합물이고, 같은 화합물을 여러 번 측정했다면 먼저 하나로 합칩니다.
> → [심화 G — Day G4: 분자 표현과 활성 예측: SMILES, 지문, QSAR, 분자 생성](../advanced/G-ai-biomed/day-G4.md)

> **📚 비선형 모델 적합과 지역 최솟값**
> 정신물리 곡선이나 시간 상수처럼 매개변수에 비선형인 모델은 `fminsearch`(Python은 `scipy.optimize`) 같은 반복 탐색으로 맞춥니다. 탐색은 시작값 근처의 골짜기에 멈출 수 있으므로 여러 시작값에서 같은 답이 나오는지 확인하고, 적합 곡선을 데이터 위에 그려 봅니다. 숫자가 그럴듯해도 그림이 맞지 않으면 적합을 믿지 마세요.
> → [심화 B — Day B7: 수치 계산·최적화·시뮬레이션, 그리고 GUI와 실험 제어의 개념](../advanced/B-matlab/day-B7.md)

## 오늘의 산출물 체크리스트
- [ ] 가상 데이터로 예시 1–3을 실행해 같은 출력을 얻었다.
- [ ] 내 feature table의 행 수, 참가자 수, 군별 참가자 수를 따로 세어 적었다.
- [ ] `analysis-choice.md`에 질문마다 분석 종류·분석 단위·방법·이유·보고할 숫자를 채웠다.
- [ ] "하지 않기로 한 분석"과 그 이유를 적었다.
- [ ] `learning-log.md` 기록과 commit을 남겼다.

---
[← 이전](../week-4/day-28.md) · [코스 지도](../../README.md) · [다음 →](day-30.md)
