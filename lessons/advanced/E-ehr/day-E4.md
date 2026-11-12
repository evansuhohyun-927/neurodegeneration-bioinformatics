# Day E4 — 데이터 정제: 단위, 이상치, 결측, 시간 정렬

> **주차:** 심화 파트 E — EHR 2차 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/E/E4_cleaning.ipynb`, `reports/advanced/E/E4_cleaning_log.md` (정제 기록표)
>
> **먼저 끝내 둘 레슨:** Day E3, Day 13 (전처리와 QC), Day 25 (participant-level QC), Day 39 (민감도 분석).

## 오늘의 목표
- 같은 검사가 다른 단위로 섞인 것을 찾아 통일하고, "불가능한 값"과 "위험하지만 진짜인 값"을 구분할 수 있다.
- 예측·노출 시점을 기준으로 "그때 알 수 있었던 값"만 고르는 시간 정렬을 할 수 있다.
- 결측이 무작위가 아닐 수 있음(MCAR·MAR·MNAR)을 설명하고, 값을 일부러 가려 대치 방법을 비교할 수 있다.

## 🎬 영상으로 먼저 보기

- [Dealing With Missing Data - Multiple Imputation — ritvikmath](https://www.youtube.com/watch?v=LMsULWGtP2c) (22:48)
- **무엇에 주목할까:** 한 번 채운 값을 "진짜 관측값처럼" 쓰면 불확실성이 사라진다는 점, 그리고 여러 번 채워 결과를 합치는 다중 대치(multiple imputation)가 그 불확실성을 어떻게 되살리는지에 주목하세요. 예시 3은 그 앞 단계, "어떤 방법이 값을 더 잘 되살리나"를 직접 재 봅니다.

## 개념 설명

### 정제는 "고치기"가 아니라 "기록하며 결정하기"

EHR 원자료는 절대 손으로 고치지 않습니다. 원본은 그대로 두고, 모든 변환을 코드로 하고, 무엇을 왜 바꿨는지 정제 기록표에 남깁니다. 정제 결정 하나하나가 결과를 바꿀 수 있기 때문입니다. 여러 가지로 정제해 본 뒤 가장 "좋은" 결과를 고르면 그것은 Day 10의 p-hacking과 같은 일입니다. 주 정제 규칙은 미리 정하고, 다른 규칙은 민감도 분석(Day 39, Day E5)으로 함께 보고합니다.

### 단위와 이상치: 세 종류의 "이상한 값"

이상한 값은 세 부류입니다. **단위 혼합**(포도당이 mg/dL와 mmol/L로, 체온이 섭씨와 화씨로 섞임)은 분포를 그리면 봉우리가 둘로 갈라져 보입니다. 단위 열(`valueuom`)을 먼저 보고 변환합니다. **불가능한 값**(체온 3.7℃, 음수 심박수)은 입력 오류이므로 제거하거나 결측으로 바꿉니다. **위험하지만 가능한 값**(포도당 600 mg/dL)은 가장 아픈 환자의 진짜 기록일 가능성이 높아 지우면 안 됩니다. 사분위 범위(IQR) 규칙이나 z-점수는 "다른 값과 멀다"만 알려 줄 뿐, 셋을 구분해 주지 않습니다. 구분은 임상 지식(정상·위험·불가능 범위표)으로 하고, 통계 규칙은 후보를 찾는 데만 씁니다. 지우는 대신 이상치에 덜 흔들리는 방법(중앙값, 로그 변환, 범주화, robust 회귀)을 쓰는 것도 방법입니다.

### 시간 정렬: "그때 알 수 있었는가"

검사 한 건에도 시각이 여럿입니다. 채혈 시각(`charttime`)과 결과가 전산에 올라온 시각(`storetime`)이 다르고, 투약은 처방 시각과 실제 투여 시각이 다릅니다. "입실 후 24시간 시점에 예측한다"면, 24시간 전에 채혈했더라도 결과가 그 뒤에 올라왔다면 그 시점의 의사는 몰랐던 값입니다. 이런 값을 넣으면 미래 정보가 섞여(누수) 성능이 부풀려집니다(Day E6). 또 불규칙한 기록을 시간 격자(예: 1시간 칸)에 맞출 때 "마지막 값 이어 쓰기(carry forward)"는 실시간에도 쓸 수 있는 방법이지만, 얼마나 오래 이어 쓸지 상한을 정해야 합니다.

### 결측의 세 가지 얼굴

**MCAR**(완전 무작위 결측)는 결측이 아무것과도 관련이 없을 때입니다(검체가 실수로 깨짐). **MAR**(무작위 결측)는 결측이 관측된 다른 변수로 설명될 때입니다(키가 없어서 BMI가 없음). **MNAR**(비무작위 결측)는 결측이 그 값 자체나 관측 안 된 것에 달려 있을 때입니다. EHR에서는 MNAR이 흔합니다. 의사는 걱정될 때 젖산을 재므로 "안 쟀다"는 "아마 정상이었다"는 정보입니다. 또 "재지 않기로 한 값"(임상적으로 필요 없어서)과 "쟀는데 기록이 빠진 값"은 다르게 다뤄야 합니다. 앞의 것을 평균으로 채우면 없는 사실을 만드는 셈입니다.

선택지: 완전 사례 분석(결측 있는 사람 제외)은 간단하지만 MCAR가 아니면 기울어지고 표본을 크게 잃습니다. 평균·중앙값 대치는 분산을 줄이고 상관을 약하게 만듭니다. 회귀·KNN 대치는 변수 사이 관계를 쓰지만 한 번 채우면 불확실성을 숨깁니다. 다중 대치는 여러 번 채워 결과를 합쳐 불확실성을 살리며, MAR 가정에서 흔히 권하는 출발점입니다. 어떤 방법도 MNAR를 자동으로 고치지는 못하므로, 결측 비율을 군별로 보고하고 가정을 바꾼 민감도 분석을 붙입니다.

## 예시로 이해하기

### 예시 1 — 단위 통일과 가능 범위 표시

```python
import numpy as np
import pandas as pd

# 예시 1: 단위 통일과 생리적 가능 범위
rng = np.random.default_rng(4)
n = 12
labs = pd.DataFrame({
    "stay_id": rng.integers(1, 5, n),
    "label": ["glucose"] * 6 + ["temperature"] * 6,
    "valuenum": [112, 6.1, 98, 7.4, 2300, 145, 37.2, 99.1, 36.8, 101.3, 3.7, 38.4],
    "valueuom": ["mg/dL", "mmol/L", "mg/dL", "mmol/L", "mg/dL", "mg/dL",
                 "°C", "°F", "°C", "°F", "°C", "°C"],
})
to_std = {("glucose", "mmol/L"): lambda v: v * 18.0,           # 포도당 mmol/L → mg/dL (근사 계수)
          ("temperature", "°F"): lambda v: (v - 32) * 5 / 9}   # 화씨 → 섭씨
std = labs.copy()
for (lab, unit), f in to_std.items():
    m = (std.label == lab) & (std.valueuom == unit)
    std.loc[m, "valuenum"] = f(std.loc[m, "valuenum"]).round(1)
    std.loc[m, "valueuom"] = "mg/dL" if lab == "glucose" else "°C"
plausible = {"glucose": (10, 1500), "temperature": (25, 45)}   # '불가능' 경계(가상 출발점)
std["plausible"] = [plausible[l][0] <= v <= plausible[l][1] for l, v in zip(std.label, std.valuenum)]
print(std.to_string(index=False))
```

출력:

```text
 stay_id       label  valuenum valueuom  plausible
       3     glucose     112.0    mg/dL       True
       4     glucose     109.8    mg/dL       True
       4     glucose      98.0    mg/dL       True
       3     glucose     133.2    mg/dL       True
       4     glucose    2300.0    mg/dL      False
       4     glucose     145.0    mg/dL       True
       4 temperature      37.2       °C       True
       1 temperature      37.3       °C       True
       2 temperature      36.8       °C       True
       3 temperature      38.5       °C       True
       2 temperature       3.7       °C      False
       2 temperature      38.4       °C       True
```

mmol/L로 적힌 포도당 6.1과 7.4는 mg/dL로 바꾸면 109.8과 133.2로 다른 값들과 자연스럽게 섞입니다. 화씨 99.1, 101.3도 섭씨로 바꿨습니다. 2300 mg/dL와 3.7℃는 이 범위표로는 불가능 쪽에 걸렸습니다. 다만 범위표의 경계(10–1500, 25–45)는 이 예시를 위해 정한 가상 출발점입니다. 실제 분석에서는 임상가와 함께 정하고 근거를 정제 기록표에 적습니다. 3.7℃는 37 입력 중 점이 잘못 찍힌 것일 수 있지만, 추측으로 고치지 않고 결측으로 둡니다.

### 예시 2 — 채혈 시각과 결과 입력 시각

```python
import pandas as pd
# 예시 2: 시간 정렬 -- '언제 알 수 있었는가'로 창을 자른다
stay = pd.DataFrame({"stay_id": [1], "intime": pd.to_datetime(["2150-03-01 08:00"])})
lact = pd.DataFrame({
    "stay_id": [1, 1, 1, 1],
    "charttime": pd.to_datetime(["2150-03-01 06:30", "2150-03-01 20:00",
                                 "2150-03-02 07:40", "2150-03-02 12:00"]),
    "storetime": pd.to_datetime(["2150-03-01 07:10", "2150-03-01 20:50",
                                 "2150-03-02 09:15", "2150-03-02 12:40"]),
    "lactate": [2.1, 3.4, 4.8, 2.0],
})
d = lact.merge(stay, on="stay_id")
d["cutoff"] = d.intime + pd.Timedelta(hours=24)               # 예측 시점: 입실 후 24시간
by_chart = d[(d.charttime >= d.intime - pd.Timedelta(hours=6)) & (d.charttime < d.cutoff)]
by_store = by_chart[by_chart.storetime < by_chart.cutoff]      # 그때 결과가 화면에 있었는가
print("\ncharttime 기준 최댓값:", by_chart.lactate.max(), "| storetime까지 고려한 최댓값:", by_store.lactate.max())
```

출력:

```text
charttime 기준 최댓값: 4.8 | storetime까지 고려한 최댓값: 3.4
```

다음 날 07:40에 채혈한 젖산 4.8은 채혈 시각으로는 "입실 후 24시간 안"이지만 결과가 09:15에 올라와 24시간 시점(08:00)에는 화면에 없었습니다. 예측 시점의 정보만 쓰려면 `storetime`까지 확인해야 하고, 그러면 최댓값은 3.4입니다. 반대로 "입실 첫날 환자 상태를 기술"하는 질문이라면 `charttime` 기준이 맞습니다. 어느 시각을 쓸지는 질문이 정합니다.

### 예시 3 — 결측은 무작위가 아니다, 그리고 가려서 채워 보기

```python
import numpy as np
import pandas as pd
# 예시 3: 결측은 무작위가 아니다 + 가려 놓고 채워 보기
rng = np.random.default_rng(13)
n = 3000
severity = rng.normal(0, 1, n)
age = rng.normal(65, 12, n)
lactate = np.exp(0.4 + 0.35 * severity + rng.normal(0, 0.25, n))
died = rng.random(n) < 1 / (1 + np.exp(-(-2.2 + 1.0 * severity)))
measured = rng.random(n) < 1 / (1 + np.exp(-(0.2 + 1.2 * severity)))   # 아플수록 잰다
df = pd.DataFrame({"age": age, "map": 75 - 6 * severity + rng.normal(0, 8, n),
                   "lactate": np.where(measured, lactate, np.nan), "died": died})
print("\n젖산을 잰 환자 사망률 %.3f, 안 잰 환자 사망률 %.3f" %
      (df.died[df.lactate.notna()].mean(), df.died[df.lactate.isna()].mean()))
print("잰 값의 평균 %.2f vs 모든 환자의 '진짜' 평균 %.2f" % (np.nanmean(df.lactate), lactate.mean()))

from sklearn.experimental import enable_iterative_imputer  # noqa: F401
from sklearn.impute import SimpleImputer, KNNImputer, IterativeImputer
complete = df.dropna().reset_index(drop=True)[["age", "map", "lactate"]]
results = {}
for frac in [0.1, 0.3, 0.5]:
    for name, imp in [("평균", SimpleImputer(strategy="mean")),
                      ("중앙값", SimpleImputer(strategy="median")),
                      ("KNN(k=10)", KNNImputer(n_neighbors=10)),
                      ("회귀(반복)", IterativeImputer(random_state=0))]:
        errs = []
        for rep in range(5):
            r = np.random.default_rng(100 + rep)
            mask = r.random(len(complete)) < frac
            x = complete.copy(); x.loc[mask, "lactate"] = np.nan
            filled = imp.fit_transform(x)[:, 2]
            errs.append(np.sqrt(np.mean((filled[mask] - complete.lactate[mask]) ** 2)))
        results.setdefault(name, {})[f"{int(frac*100)}% 가림"] = round(float(np.mean(errs)), 3)
print("\n가린 젖산 값을 되살린 오차(RMSE, 작을수록 좋음)")
print(pd.DataFrame(results).T)
```

출력:

```text
젖산을 잰 환자 사망률 0.174, 안 잰 환자 사망률 0.087
잰 값의 평균 1.89 vs 모든 환자의 '진짜' 평균 1.64

가린 젖산 값을 되살린 오차(RMSE, 작을수록 좋음)
           10% 가림  30% 가림  50% 가림
평균          0.795   0.798   0.795
중앙값         0.806   0.810   0.805
KNN(k=10)   0.763   0.760   0.757
회귀(반복)      0.736   0.736   0.729
```

먼저 젖산을 잰 환자의 사망률이 안 잰 환자의 두 배입니다. 잰 값의 평균(1.89)도 모든 환자의 진짜 평균(1.64)보다 높습니다. 잰 사람만 보고 "이 병원 환자의 평균 젖산"을 말하면 과대평가됩니다. 이것이 MNAR에 가까운 결측입니다.

다음으로, 값이 다 있는 환자들에서 젖산을 일부러 가린 뒤 네 방법으로 되살려 오차를 쟀습니다. 이 가상 자료에서는 다른 변수(평균동맥압 `map`)와의 관계를 쓰는 회귀 대치가 가장 작은 오차를 냈고, 평균·중앙값은 가린 비율과 상관없이 나빴습니다. 두 가지를 기억하세요. 첫째, 이 실험은 **무작위로** 가렸으므로 MCAR 상황의 성적입니다. 실제 결측이 MNAR이면 이 순위가 그대로 맞는다는 보장이 없습니다. 둘째, KNN은 변수의 척도에 민감합니다(나이는 수십 단위, 로그 젖산은 1 근처). 실제로 쓸 때는 표준화부터 합니다.

## 직접 해보기

1. `notebooks/advanced/E/E4_cleaning.ipynb`를 만들고 예시 1–3을 실행합니다.
2. 예시 1에 칼륨(`potassium`) 행 4개를 직접 추가해 봅니다. 단위는 mEq/L, 값은 4.1, 3.8, 41, 0으로 하고, 가능 범위를 정한 뒤 어떤 값이 걸리는지, 41은 "점이 빠진 4.1"일 가능성이 있는데 어떻게 처리할지 한 문장으로 정합니다.
3. 예시 2에서 예측 시점을 입실 후 48시간으로 바꾸면 두 기준의 최댓값이 어떻게 되는지 확인합니다.
4. 예시 3에서 `measured`를 만드는 식의 `1.2 * severity`를 `0.0 * severity`로 바꿔(결측이 중증도와 무관해짐) 다시 실행합니다. 잰/안 잰 환자의 사망률 차이가 사라지는지 확인하고 원래대로 돌립니다.
5. 예시 3의 대치 비교 앞에 `StandardScaler`로 표준화한 KNN을 하나 더 넣어 결과가 달라지는지 봅니다.
6. `reports/advanced/E/E4_cleaning_log.md`에 정제 기록표를 만듭니다. 열은 `변수 | 문제 | 규칙 | 근거 | 영향받은 행 수 | 민감도 분석 계획`. 오늘 예시에서 최소 4줄을 채웁니다.
7. (선택, 데모 데이터) MIMIC-IV 데모의 `hosp/d_labitems.csv.gz`에서 관심 검사의 `itemid`를 찾고, `labevents`에서 그 `itemid`의 `valueuom` 종류를 셉니다(`value_counts()`). 단위가 둘 이상이면 기록표에 적습니다. 환자별 값은 옮기지 않습니다.

⚠️ **흔한 오류 1 — `ValueError: Can only compare identically-labeled Series objects`**
행 순서·길이가 다른 두 Series를 직접 비교할 때 납니다. 비교할 열을 같은 DataFrame 안에 만들어 두고(`d["cutoff"] = ...`) 같은 표 안에서 비교하면 해결됩니다.

⚠️ **흔한 오류 2 — 대치를 전체 데이터에 먼저 하고 나서 train/test를 나눈다**
대치 모델이 시험 자료의 정보를 이미 본 셈이 됩니다(누수). 대치기는 학습 자료로만 `fit`하고 시험 자료에는 `transform`만 합니다. scikit-learn `Pipeline`에 넣으면 실수가 줄어듭니다(Day 33).

## 퀴즈

**1.** (객관식) 체온 기록 중 "104"가 있습니다. 가장 먼저 할 일은?
① 이상치이므로 삭제 ② 평균으로 대체 ③ 단위 열을 확인해 화씨인지 본다 ④ z-점수로 판정

<details><summary>정답 보기</summary>

③. 104℉는 40℃로 고열이지만 가능한 값입니다. 단위를 확인하지 않고 지우면 가장 아픈 환자의 진짜 기록을 잃습니다.

</details>

**2.** (단답) "위험하지만 가능한 값"을 통계 규칙(IQR)만으로 지우면 어떤 문제가 생기나요?

<details><summary>정답 보기</summary>

가장 아픈 환자들의 정보가 체계적으로 빠져 중증도와 결과의 관계가 약해지거나 왜곡됩니다. IQR 규칙은 "멀다"만 알려 주고 "틀렸다"를 알려 주지 않습니다.

</details>

**3.** (객관식) 의사가 걱정될 때만 재는 검사의 결측은 주로 어떤 유형에 가까운가요?
① MCAR ② MAR ③ MNAR ④ 결측이 아니다

<details><summary>정답 보기</summary>

③ MNAR에 가깝습니다(관측된 변수로 걱정의 이유가 충분히 설명되면 MAR에 가까워질 수도 있습니다). 결측 여부 자체가 환자 상태와 관련되므로, 결측 비율을 군별로 보고하고 민감도 분석을 붙입니다.

</details>

**4.** (단답) 입실 24시간 시점의 예측 모델에서 `charttime`만으로 창을 자르면 왜 위험한가요?

<details><summary>정답 보기</summary>

24시간 전에 채혈했지만 결과는 그 뒤에 올라온 값이 들어가, 예측 시점에 알 수 없던 정보가 섞입니다. `storetime`(또는 결과 확인 가능 시각)까지 기준으로 써야 합니다.

</details>

**5.** (객관식) 예시 3의 "가려서 채워 보기" 실험의 한계로 맞는 것은?
① 무작위로 가렸으므로 실제 MNAR 결측에서의 성능을 보장하지 않는다
② 오차를 계산할 수 없다
③ 다중 대치보다 항상 정확하다
④ 결측 비율이 높을수록 평균 대치가 좋아진다

<details><summary>정답 보기</summary>

①. 무작위 마스킹은 MCAR 상황을 흉내 냅니다. 실제 결측이 값 자체와 관련되어 있다면 방법들의 순위가 달라질 수 있습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3이 노트북에서 실행되고, 직접 해보기 2–5의 결과를 적었다.
- [ ] `reports/advanced/E/E4_cleaning_log.md`에 정제 기록표가 4줄 이상 있다.
- [ ] 결측 비율과 결측 이유(추정)를 변수별로 적었다.
- [ ] `learning-log.md` 기록과 commit을 남겼다.

## 더 읽을거리
- MIT Critical Data. *Secondary Analysis of Electronic Health Records*. Springer, 2016 (CC BY-NC 4.0). [NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK543630/) · [Springer](https://doi.org/10.1007/978-3-319-43742-2). 12장(전처리), 13장(결측), 14장(잡음과 이상치)이 오늘 내용과 이어진다.
- Sterne JAC et al. Multiple imputation for missing data in epidemiological and clinical research: potential and pitfalls. *BMJ* 2009. doi:[10.1136/bmj.b2393](https://doi.org/10.1136/bmj.b2393) (PMID 19564179)

---
[← 이전](day-E3.md) · [코스 지도](../../../README.md) · [다음 →](day-E5.md)
