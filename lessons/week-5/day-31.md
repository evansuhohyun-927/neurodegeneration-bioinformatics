# Day 31 — 교란변수: 그 차이는 정말 "군" 때문일까

> **주차:** 5주차 · **예상 시간:** 75–90분 · **산출물:** `confounder-table.md` (교란변수 표)

## 오늘의 목표
- 교란변수가 무엇이고 군 비교 결과를 어떻게 왜곡하는지 예를 들어 설명할 수 있다.
- 나이·성별의 군 간 균형을 점검하고, 회귀로 나이를 보정했을 때 군 차이가 어떻게 변하는지 확인할 수 있다.
- 나이, 성별, 과제 조건, 기기, 반복 측정 각각에 대해 "내 데이터에서 확인한 것과 대응"을 표로 정리할 수 있다.

## 🎬 영상으로 먼저 보기

- [Correlation Doesn't Equal Causation: Crash Course Statistics #8 — CrashCourse](https://www.youtube.com/watch?v=GtV-VYdNt_g) (12분 17초)
- **무엇에 주목할까:** 두 변수가 함께 움직여도 제3의 변수가 둘 다를 움직이고 있을 수 있다는 설명에 주목하세요. 오늘의 "나이"가 바로 그 제3의 변수 역할을 합니다.

- [Simpson's Paradox — minutephysics](https://www.youtube.com/watch?v=ebEkn-BiW5k) (4분 39초)
- **무엇에 주목할까:** 전체로 보면 한 방향인 결과가 하위 집단으로 나누면 뒤집히는 장면을 보세요. "어떤 변수로 나누어 볼 것인가"를 데이터가 아니라 연구 설계에 대한 지식이 정해 준다는 마지막 메시지가 핵심입니다.

## 개념 설명

### 교란변수란 무엇인가

어제 가상 데이터에서 `stride_time_cv`는 PD군이 대조군보다 훨씬 높았습니다(d ≈ 1.4). 그런데 이 차이를 "PD라서"라고 읽으려면 한 가지를 더 확인해야 합니다. 두 군이 **진단 말고는 비슷한가**입니다.

**교란변수(confounder)**는 ① 군과도 관련이 있고 ② 결과(feature)와도 관련이 있어서, 군의 효과처럼 보이는 차이를 만들어 내는 제3의 변수입니다. 고전적인 예가 있습니다. 여름에는 아이스크림 판매량과 익사 사고가 함께 늘어납니다. 아이스크림이 익사를 일으키는 것이 아니라 "더운 날씨"가 둘 다를 늘립니다.

우리 데이터에서 가장 흔한 교란변수는 **나이**입니다. PD는 고령에서 많으므로 PD군의 평균 나이가 대조군보다 높기 쉽습니다(①). 그리고 보행 변동성이나 움직임의 속도는 질환이 없어도 나이가 들면 변합니다(②). 두 조건이 모두 맞으면, PD군과 대조군의 차이 중 일부는 사실 "나이 든 사람과 덜 나이 든 사람의 차이"입니다.

마우스 실험이라면 같은 주령·같은 성별·같은 케이지 조건의 동물을 무작위로 배정해서 이 문제를 설계 단계에서 없앱니다. 하지만 사람을 대상으로 한 관찰 데이터에서는 그럴 수 없습니다. 이미 모인 데이터를 받아 쓰는 우리는 **무엇이 불균형한지 확인하고, 가능한 만큼 보정하고, 남은 한계를 적는** 세 가지를 합니다.

### 웨어러블·보행 데이터에서 흔한 교란 후보 다섯 가지

실라부스가 꼽은 다섯 가지를 차례로 봅니다.

- **나이:** 위에서 본 대로입니다. 군별 나이 분포를 먼저 그려 봅니다.
- **성별:** 체격과 보폭, 근력이 평균적으로 다르고, 군마다 성비가 다를 수 있습니다.
- **과제 조건:** "편하게 걷기"와 "숫자를 거꾸로 세며 걷기", "팔을 뻗고 있기"와 "물 마시기"는 전혀 다른 움직임입니다. 군마다 수행한 과제의 종류나 횟수가 다르면 과제 차이가 군 차이처럼 보입니다. 비교는 **같은 과제끼리** 합니다.
- **기기와 측정 환경:** 센서 종류, 착용 위치(어느 손목), sampling rate, 측정 장소가 군마다 다르면 곤란합니다. 환자는 병원에서, 대조군은 다른 곳에서 측정했다면 "장소"가 군과 완전히 겹칩니다. 이것은 2주차 Day 11에서 배운 batch effect와 같은 문제입니다.
- **반복 측정:** 엄밀히는 교란이 아니라 독립성 문제지만, 결과를 왜곡한다는 점에서 함께 점검합니다. 측정 횟수가 군마다 다르거나, 행을 독립 표본처럼 쓰면 결론이 달라집니다.

이 밖에도 약물 복용 상태(on/off), 우세손, 키, 질병 기간 같은 변수가 있을 수 있습니다. 내 데이터셋에 어떤 변수가 실제로 기록되어 있는지는 Day 24에 만든 데이터 사전에서 확인하세요. **기록되지 않은 변수는 보정할 수 없고, 한계로 적을 수만 있습니다.**

### 대응 방법 세 가지: 층화, 보정, 그리고 솔직한 한계

교란 후보를 찾았다면 쓸 수 있는 방법은 세 가지입니다.

**층화(stratification)**는 교란변수의 값이 비슷한 사람끼리 묶어서 그 안에서 비교하는 것입니다. 60대는 60대끼리, 여성은 여성끼리 비교합니다. 직관적이지만 층을 나눌수록 층마다 사람이 적어집니다.

**회귀 보정(adjustment)**은 Day 29에서 본 회귀를 쓰는 방법입니다. `feature ~ 군 + 나이`라는 모형을 세우면, 군의 계수는 "나이가 같은 두 사람을 비교했을 때의 군 차이"로 읽을 수 있습니다. 체중을 잴 때 옷 무게를 빼는 것과 비슷합니다. 옷(나이)이 차지하는 몫을 덜어내고 남은 것을 봅니다. 다만 보정은 만능이 아닙니다. 두 군의 나이가 거의 겹치지 않으면(PD는 전부 70대, 대조군은 전부 30대) 회귀는 데이터가 없는 구간을 직선으로 이어 붙여 추측할 뿐이고, 그 결과는 믿기 어렵습니다.

**한계로 기록하기**는 가장 덜 화려하지만 가장 중요합니다. 측정되지 않은 변수, 군과 완전히 겹치는 변수(환자는 전부 A 기기, 대조군은 전부 B 기기)는 어떤 통계 기법으로도 분리할 수 없습니다. 이때는 "이 차이는 기기 차이와 구분되지 않는다"고 쓰는 것이 유일하게 정직한 선택입니다.

어느 방법을 쓰든 문장은 조심스럽게 씁니다. 보정 후에도 차이가 남았다고 해서 "PD가 이 차이를 일으킨다"는 인과가 증명된 것은 아닙니다. "측정된 변수(나이)를 보정한 뒤에도 군 간 차이가 관찰되었다"까지가 관찰 데이터로 말할 수 있는 범위입니다.

## 예시로 이해하기

### 예시 1 — 두 군은 진단 말고도 다른가: 나이와 성별 점검

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

# 참가자 단위 표 (나이·성별은 사람마다 하나이므로 groupby 키에 넣는다)
person = df.groupby([ID_COL, GROUP_COL, "sex"], as_index=False)[["age"] + FEATURES].mean()

print("군별 나이 (참가자 단위):")
print(person.groupby(GROUP_COL)["age"].describe()[["count", "mean", "std", "min", "max"]].round(1))
print()
print("군별 성별 인원:")
print(pd.crosstab(person[GROUP_COL], person["sex"]))
print()
print("나이와 각 feature의 상관계수 (참가자 단위):")
print(person[FEATURES].corrwith(person["age"]).round(2))
```

실행 결과:

```text
군별 나이 (참가자 단위):
       count  mean  std   min   max
group
HC      25.0  61.2  7.6  44.6  78.6
PD      25.0  67.5  8.1  51.8  86.2

군별 성별 인원:
sex     F   M
group
HC     12  13
PD     16   9

나이와 각 feature의 상관계수 (참가자 단위):
stride_time_cv       0.56
accel_rms            0.21
tremor_band_power    0.04
jerk_mean            0.00
step_regularity     -0.21
arm_swing_asym       0.02
dtype: float64
```

두 가지가 보입니다. PD군이 평균 6살가량 많고(조건 ①), `stride_time_cv`는 나이와 뚜렷한 양의 상관이 있습니다(조건 ②). 두 조건이 모두 충족되었으니 나이는 `stride_time_cv`의 군 차이에 대한 교란 후보입니다. 다른 feature들은 나이와의 상관이 약합니다. 성비도 군마다 조금 다르니 표에 기록해 둡니다.

단, 여기서 조건 ②를 볼 때 주의할 점이 있습니다. 전체 표본에서 구한 상관에는 군 차이 자체가 섞여 들어갑니다(PD군이 나이도 많고 값도 높으니까요). 그래서 다음 예시처럼 회귀로 군과 나이를 **함께** 넣어 보는 것이 더 정확합니다.

### 예시 2 — 회귀로 나이를 보정하면 군 차이가 어떻게 변하는가

예시 1에 이어서 실행합니다. `statsmodels`의 수식 문법(Day 11의 설계식과 같은 모양)을 씁니다.

```python
import statsmodels.formula.api as smf

# 대조군(HC)을 기준으로 삼는다: 계수는 "PD - HC"
group_term = f"C({GROUP_COL}, Treatment('HC'))"
key = f"{group_term}[T.PD]"

for feature in ["stride_time_cv", "tremor_band_power"]:
    crude = smf.ols(f"{feature} ~ {group_term}", data=person).fit()
    adjusted = smf.ols(f"{feature} ~ {group_term} + age", data=person).fit()
    lo0, hi0 = crude.conf_int().loc[key]
    lo1, hi1 = adjusted.conf_int().loc[key]
    print(feature)
    print(f"  보정 전 군 차이  = {crude.params[key]:.2f}  95% CI [{lo0:.2f}, {hi0:.2f}]")
    print(f"  나이 보정 후     = {adjusted.params[key]:.2f}  95% CI [{lo1:.2f}, {hi1:.2f}]")
    print(f"  나이 1살당 변화  = {adjusted.params['age']:.3f}")
```

실행 결과:

```text
stride_time_cv
  보정 전 군 차이  = 1.49  95% CI [0.90, 2.08]
  나이 보정 후     = 1.11  95% CI [0.53, 1.68]
  나이 1살당 변화  = 0.060
tremor_band_power
  보정 전 군 차이  = 0.53  95% CI [0.03, 1.03]
  나이 보정 후     = 0.59  95% CI [0.04, 1.13]
  나이 1살당 변화  = -0.009
```

`stride_time_cv`의 군 차이는 나이를 보정하자 1.49에서 1.11로 약 4분의 1이 줄었습니다. 줄어든 몫이 "두 군의 나이 차이로 설명되는 부분"입니다. 그래도 신뢰구간이 0에서 떨어져 있으므로 "나이를 보정한 뒤에도 군 간 차이가 관찰되었다"고 쓸 수 있습니다. 반면 `tremor_band_power`는 나이와 관련이 약해서 보정 전후가 거의 같습니다. (보정 후 신뢰구간이 조금 넓어진 것도 눈여겨보세요. 변수를 하나 더 넣으면 그만큼 추정이 불확실해집니다.)

보고서에는 **보정 전과 후를 둘 다** 적습니다. 보정 후 숫자만 적으면 독자는 얼마나 달라졌는지 알 수 없습니다.

### 예시 3 — 반복 측정을 독립 표본처럼 쓰면 생기는 일

예시 2에 이어서 실행합니다. 같은 feature를 "행 300개"로 검정할 때와 "참가자 50명"으로 검정할 때를 나란히 놓습니다.

```python
from scipy import stats

print(f"{'feature':<20}{'p_rows (n=300)':>16}{'p_person (n=50)':>18}")   # 행 단위 / 참가자 단위
for f in ["tremor_band_power", "step_regularity", "jerk_mean"]:
    p_rows = stats.ttest_ind(df.loc[df[GROUP_COL] == "PD", f],
                             df.loc[df[GROUP_COL] == "HC", f], equal_var=False).pvalue
    p_person = stats.ttest_ind(person.loc[person[GROUP_COL] == "PD", f],
                               person.loc[person[GROUP_COL] == "HC", f], equal_var=False).pvalue
    print(f"{f:<20}{p_rows:>16.2g}{p_person:>18.3f}")
```

실행 결과:

```text
feature               p_rows (n=300)   p_person (n=50)
tremor_band_power            5.3e-07             0.039
step_regularity              1.1e-05             0.069
jerk_mean                    5.4e-05             0.095
```

평균 차이는 두 방법에서 똑같습니다. 달라진 것은 "표본이 몇 개라고 주장하는가"뿐인데 p-value는 수천 배에서 수만 배 작아졌습니다. 한 사람의 측정 6개는 정보가 6배 있는 것이 아니라 같은 정보를 6번 복사한 것에 가깝기 때문입니다. 행 단위 p-value는 틀린 숫자입니다. 그리고 이 문제는 Day 33에서 "모델 성능이 부풀려지는" 모습으로 다시 나타납니다.

## 직접 해보기

1. 가상 데이터로 예시 1–3을 실행해 출력을 확인합니다.
2. Day 24의 `physionet-pd-data-dictionary.md`를 열고, 내 데이터셋에 **실제로 기록된** 참가자 정보(나이, 성별, 키, 우세손, 약물 상태 등)와 측정 정보(과제 이름, 기기, 착용 위치, 측정 장소 등)를 목록으로 뽑습니다. 데이터 사전에 없는 변수는 데이터셋 페이지의 파일 설명에서 다시 확인하고, 그래도 없으면 "기록 없음"으로 둡니다. 추측해서 채우지 않습니다.
3. 준비 코드의 `🔁` 부분을 내 표로 바꿉니다. 나이·성별 열이 feature table에 없다면 참가자 정보 파일을 `ID_COL` 기준으로 `merge`합니다: `df = df.merge(participants, on=ID_COL, how="left")`. 그리고 예시 코드의 `"age"`, `"sex"`를 내 열 이름으로 바꿉니다.
4. 예시 1을 실행해 군별 나이 분포와 성비를 확인합니다. 나이 boxplot도 하나 그려 봅니다.
5. 주요 outcome에 대해 예시 2를 실행하고(코드의 `'HC'`와 `T.PD`는 내 군 이름으로 바꿉니다), 보정 전·후 군 차이와 신뢰구간을 적습니다.
6. 과제 조건을 점검합니다. feature table에 과제 열이 있다면 `pd.crosstab(df[GROUP_COL], df["과제_열"])`로 군별 과제 수를 봅니다. 한 과제만 골라 분석했다면 어느 과제인지 적습니다.
7. `confounder-table.md`를 만들고 아래 표를 채웁니다.

   ```markdown
   | 변수 | 군과 관련? (근거) | feature와 관련? (근거) | 내 데이터에서 확인한 결과 | 대응 | 남는 한계 |
   |---|---|---|---|---|---|
   | 나이 | 군별 평균/범위 | 상관·회귀 계수 | | 회귀 보정 / 층화 | |
   | 성별 | 군별 성비 | 성별 간 feature 차이 | | | |
   | 과제 조건 | 군별 과제 종류·횟수 | 과제별 feature 분포 | | 같은 과제끼리만 비교 | |
   | 기기·측정 환경 | 군별 기기/장소 | | | | 군과 완전히 겹치면 분리 불가 |
   | 반복 측정 | 군별 측정 횟수 | | | 참가자 단위 요약, 참가자 단위 split | |
   | (기록되지 않은 변수) | | | 기록 없음 | 보정 불가 | 한계로 명시 |
   ```

8. 표 아래에 "가장 걱정되는 교란 한 가지와 그 이유"를 2–3문장으로 적고 commit합니다.

⚠️ **흔한 오류 1 — `merge` 후 행 수가 늘어남:** 참가자 정보 파일에 같은 ID가 두 번 들어 있으면 행이 복제됩니다. merge 전후로 `len(df)`를 비교하고, `participants[ID_COL].duplicated().sum()`이 0인지 확인하세요(Day 16에서 한 점검과 같습니다).

⚠️ **흔한 오류 2 — `KeyError`가 `conf_int().loc[key]`에서 발생:** 내 군 이름이 `"PD"`, `"HC"`가 아니기 때문입니다. `print(crude.params)`로 계수 이름을 그대로 출력해서 `key`에 복사해 넣으세요.

## 퀴즈

**1.** 어떤 변수가 교란변수가 되려면 필요한 조건 두 가지는? (단답)

<details><summary>정답 보기</summary>

**① 군(노출)과 관련이 있고 ② 결과(feature)와도 관련이 있어야** 합니다. 둘 중 하나만 맞으면 군 차이를 왜곡하지 않습니다. 예를 들어 두 군의 나이 분포가 같다면, 나이가 feature에 아무리 큰 영향을 주어도 군 비교는 왜곡되지 않습니다.

</details>

**2.** PD군은 전부 병원 A에서 기기 X로, 대조군은 전부 지역사회에서 기기 Y로 측정했습니다. 가장 적절한 대응은?

- (a) 회귀에 기기 변수를 넣어 보정한다.
- (b) 기기 차이와 군 차이를 통계적으로 분리할 수 없다고 한계에 명시한다.
- (c) 표본이 충분히 크면 문제가 없으므로 무시한다.
- (d) 기기 X의 데이터를 기기 Y에 맞게 임의로 바꾼다.

<details><summary>정답 보기</summary>

**(b)**. 기기가 군과 완전히 겹치면(완전 교란) 회귀로도 둘을 분리할 수 없습니다. 표본이 커져도 마찬가지입니다. 이때 할 수 있는 정직한 일은 한계로 적고, 가능하면 기기에 덜 민감한 feature를 쓰는 것뿐입니다.

</details>

**3.** 나이를 보정했더니 군 차이가 1.49에서 1.11로 줄었고, 95% CI는 [0.53, 1.68]입니다. 알맞은 문장은?

- (a) "나이가 군 차이의 원인이다."
- (b) "나이를 보정한 뒤에도 PD군과 대조군의 차이가 관찰되었으며, 보정 전 차이의 일부는 두 군의 나이 차이로 설명된다."
- (c) "PD가 보행 변동성을 증가시킨다는 것이 증명되었다."

<details><summary>정답 보기</summary>

**(b)**. 보정은 측정된 변수의 몫을 덜어낼 뿐이고, 측정되지 않은 다른 교란이 남아 있을 수 있습니다. 관찰 데이터에서는 "보정 후에도 차이가 관찰되었다"까지만 말하고 인과("증가시킨다", "증명")는 쓰지 않습니다.

</details>

**4.** 같은 데이터에서 행 단위 검정의 p-value가 참가자 단위 검정보다 훨씬 작게 나오는 이유는?

<details><summary>정답 보기</summary>

같은 사람의 반복 측정은 서로 비슷해서(독립이 아니어서) 새로운 정보를 거의 더하지 않는데, 행 단위 검정은 이를 **독립적인 표본이 늘어난 것**으로 계산하기 때문입니다. 평균 차이는 그대로인데 불확실성만 지나치게 작게 추정됩니다.

</details>

**5.** PD군은 전원 70대, 대조군은 전원 30대입니다. `feature ~ 군 + 나이` 회귀로 나이를 보정하면 문제가 해결될까요?

<details><summary>정답 보기</summary>

**아니요.** 두 군의 나이가 전혀 겹치지 않으면 "같은 나이의 PD와 대조군"에 해당하는 데이터가 없으므로, 회귀는 데이터가 없는 구간을 직선으로 추측할 뿐입니다. 이 경우 보정 결과를 믿기 어렵다고 적고, 나이가 겹치는 표본이 필요하다는 한계를 명시해야 합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 군별 나이 분포와 성비를 참가자 단위로 확인했다.
- [ ] 주요 outcome의 군 차이를 나이 보정 전·후로 나란히 적었다.
- [ ] 군별 과제 종류·횟수와 기기 정보를 확인했다(없으면 "기록 없음").
- [ ] `confounder-table.md`의 여섯 행을 내 데이터 기준으로 채웠다.
- [ ] 가장 걱정되는 교란 한 가지를 2–3문장으로 적었다.

---
[← 이전](day-30.md) · [코스 지도](../../README.md) · [다음 →](day-32.md)
