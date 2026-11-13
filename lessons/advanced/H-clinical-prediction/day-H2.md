# Day H2 — 표본 수와 분할: 몇 명이면 충분하고, 어떻게 나누는가

> **주차:** 심화 파트 H — 임상 예측·조기진단 ML · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/H/H2_sample_size.ipynb`, `reports/advanced/H/H2_validation_plan.md` (검증 구조 계획)
>
> **먼저 끝내 둘 레슨:** [Day H1](day-H1.md), [Day 33](../../week-5/day-33.md) (GroupKFold와 데이터 누수), [Day E6](../E-ehr/day-E6.md) (검증의 사다리)

## 오늘의 목표
- 예측 모델 개발에 필요한 최소 표본 수를 Riley 등의 기준으로 계산하고, 각 기준이 무엇을 지키려는지 설명할 수 있다.
- "사건당 변수 10개(EPV 10)" 규칙의 한계를 시뮬레이션으로 보여 줄 수 있다.
- 참가자 단위·기관 단위 분할과 개발/내부/외부 검증 구조를 계획서로 적을 수 있다.

## 🎬 영상으로 먼저 보기

- [Key Steps and Common Pitfalls in Clinical Prediction Model Research — Richard_D_Riley](https://www.youtube.com/watch?v=eM7K8NKATB0) (56:37)
- **무엇에 주목할까:** 오늘 쓰는 표본 수 기준을 만든 연구자의 강연입니다. 전부 볼 필요는 없고, 표본 수와 과적합을 다루는 부분, 그리고 "겉보기 성능(apparent performance)"을 보고하면 안 되는 이유를 찾아 들으세요.

- [pmsampsize sample size prediction model — YouTube 검색](https://www.youtube.com/results?search_query=pmsampsize+sample+size+clinical+prediction+model) (검색 링크)
- **무엇에 주목할까:** 표본 수 계산을 도와주는 공개 패키지(R·Stata의 `pmsampsize`)가 무엇을 입력받는지 보세요. 오늘 예시 1은 그 계산의 핵심을 Python으로 직접 따라 합니다.

## 개념 설명

### 왜 "몇 명"이 성능보다 먼저인가

작은 자료로 만든 모델은 자료의 우연한 굴곡까지 배웁니다. 그러면 개발 자료에서는 잘 맞고(겉보기 성능이 높고), 새 사람에게서는 예측이 너무 극단적으로 나옵니다. 이 상태를 보정 기울기(calibration slope)가 1보다 작은 것으로 확인할 수 있습니다([Day E6](../E-ehr/day-E6.md)). 표본 수 계산은 "우리 자료로 이 정도 복잡한 모델을 만들어도 과적합이 감당할 만한가"를 **분석 전에** 묻는 일입니다.

오래된 규칙은 **사건당 변수 수(events per variable, EPV)** 10 이상입니다(Peduzzi 등 1996의 시뮬레이션에서 유래). 사건이 50건이면 후보 변수는 5개까지라는 식입니다. 간단하지만 한계가 큽니다. 같은 EPV라도 유병률, 기대 성능, 변수 분포에 따라 과적합 정도가 달라진다는 것이 이후 연구에서 드러났고(van Smeden 등 2019), 여기서 "변수"는 최종 모델에 남은 수가 아니라 **검토한 후보 변수(정확히는 회귀 계수) 전체**를 세야 합니다. 변수 선택을 하면서 떨어뜨린 변수도 자유도를 썼기 때문입니다.

### Riley 등의 세 기준

Riley 등(2019, 2020)은 이진 결과 모델에 대해 세 가지를 동시에 만족하는 표본 수를 계산하자고 제안했습니다.

1. **축소(shrinkage) 기준:** 예상되는 과적합이 작도록, 축소 계수(대략 기대 보정 기울기)가 0.9 이상이 되게 한다.
2. **겉보기·보정 R² 차이 기준:** 개발 자료의 겉보기 설명력과 과적합을 보정한 설명력의 차이가 작게(예: 0.05 이하) 한다.
3. **전체 위험의 정밀도 기준:** 평균 위험(유병률) 자체를 충분히 정확히(예: ±0.05) 추정한다.

계산에는 후보 변수 수, 유병률, 그리고 **모델이 얼마나 잘 맞을지에 대한 기대치**(Cox–Snell R²)가 필요합니다. 기대치를 모를 때 논문은 보수적인 출발점(Nagelkerke R² 0.15에 해당하는 값)을 제안합니다. 결과는 "이보다 적으면 곤란하다"는 **최소** 표본 수입니다. 많을수록 좋다는 뜻은 아니지만, 적으면 어떤 검증 기법도 그 부족을 메우지 못합니다.

### 무엇을 단위로 나누는가: 사람, 그리고 기관

[Day 33](../../week-5/day-33.md)에서 기록이 아니라 **참가자** 단위로 나눠야 한다고 배웠습니다. 여러 기관 자료에서는 한 단계가 더 있습니다. 기관마다 기기, 측정 절차, 환자 구성, 유병률이 다릅니다. 같은 기관의 사람들이 훈련과 시험에 섞이면, 모델이 기관의 특징을 배우고도 그 대가를 시험에서 치르지 않습니다.

**기관 하나씩 빼기(internal-external cross-validation, leave-one-site-out)** 는 기관 하나를 통째로 시험에 두고 나머지로 개발하는 일을 기관마다 반복합니다. 결과는 평균 하나가 아니라 **기관별 성능의 흩어짐**으로 봅니다. 흩어짐이 크면 "다른 기관에 쓰면 어떻게 될지 모른다"가 정직한 결론입니다.

### 개발, 내부 검증, 외부 검증

- **개발(development):** 변수 선택, 전처리, 하이퍼파라미터 결정까지 모두 포함한 모델 만들기. 이 전체 과정이 검증 대상입니다.
- **내부 검증(internal validation):** 같은 자료원 안에서 과적합을 추정합니다. 교차검증, 그리고 개발 과정 전체를 부트스트랩 표본마다 반복해 낙관(optimism)을 빼는 방법이 대표적입니다. 무작위로 한 번 나눈 시험 세트는 표본이 작으면 운에 크게 흔들려 권장되지 않는 편입니다.
- **외부 검증(external validation):** 다른 기관, 다른 시기, 다른 집단에서 성능을 다시 잽니다(H6). 내부 검증은 "이 자료에서 얼마나 과적합했나", 외부 검증은 "다른 곳에서도 통하나"에 답합니다. 둘은 서로를 대신하지 못합니다.

## 예시로 이해하기

### 예시 1 — Riley 기준으로 최소 표본 수 계산하기

기대 성능을 모를 때의 보수적 출발점(Nagelkerke R² 0.15)을 가정하고, 후보 변수 수와 유병률을 바꿔 봅니다.

```python
import numpy as np

def riley_binary(p, prev, r2_nagelkerke=0.15, shrink=0.9, delta=0.05, margin=0.05):
    """Riley 등(2020)의 세 기준으로 이진 결과 예측 모델의 최소 표본 수를 계산한다."""
    lnL0 = prev * np.log(prev) + (1 - prev) * np.log(1 - prev)   # 1명당 null 로그우도
    max_r2cs = 1 - np.exp(2 * lnL0)                               # 이 유병률에서 R2_CS가 가질 수 있는 최댓값
    r2cs = r2_nagelkerke * max_r2cs                               # 기대 성능을 R2_CS 단위로
    n1 = p / ((shrink - 1) * np.log(1 - r2cs / shrink))           # 기준 1: 축소 계수 0.9 이상
    s2 = r2cs / (r2cs + delta * max_r2cs)
    n2 = p / ((s2 - 1) * np.log(1 - r2cs / s2))                   # 기준 2: 겉보기·보정 R2 차이 0.05 이하
    n3 = (1.96 / margin) ** 2 * prev * (1 - prev)                 # 기준 3: 전체 위험을 ±0.05로 추정
    n = int(np.ceil(max(n1, n2, n3)))
    return int(np.ceil(n1)), int(np.ceil(n2)), int(np.ceil(n3)), n, n * prev, n * prev / p

print("후보 변수  유병률 | 기준1  기준2  기준3 | 최소 n  사건 수  EPP")
for p, prev in [(10, 0.30), (10, 0.10), (20, 0.10), (10, 0.03)]:
    n1, n2, n3, n, ev, epp = riley_binary(p, prev)
    print(f"{p:>6d}    {prev:>5.2f} | {n1:>5d}  {n2:>5d}  {n3:>5d} | {n:>6d}  {ev:>7.0f}  {epp:>4.1f}")
```

출력:

```text
후보 변수  유병률 | 기준1  기준2  기준3 | 최소 n  사건 수  EPP
    10     0.30 |   800    264    323 |    800      240  24.0
    10     0.10 |  1205    399    139 |   1205      120  12.1
    20     0.10 |  2409    797    139 |   2409      241  12.0
    10     0.03 |  2490    827     45 |   2490       75   7.5
```

읽는 법: 유병률 30%, 후보 변수 10개면 최소 800명(사건 240건)입니다. 이때 EPP(사건당 변수, 여기서는 후보 계수당 사건)는 24로 "EPV 10"보다 훨씬 많습니다. 유병률이 3%로 낮아지면 최소 2,490명이 필요하지만 사건은 75건, EPP 7.5입니다. 즉 EPV 10 규칙은 어떤 상황에서는 너무 느슨하고 어떤 상황에서는 너무 엄격합니다. 대부분 기준 1(축소)이 가장 큰 숫자를 정합니다. 이 함수는 Riley 등(2020)의 공식을 Python으로 옮긴 것이며, 실제 연구 계획에는 공식 패키지(`pmsampsize`)로 다시 확인하세요. 이 레슨에서는 두 결과를 대조하지 못했습니다.

### 예시 2 — 표본이 작으면 무엇이 무너지나

후보 변수 20개 중 실제로 관련 있는 것은 4개인 가상 세계에서, 개발 표본 크기를 바꿔 같은 연구를 50번씩 반복합니다.

```python
import numpy as np
import statsmodels.api as sm
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

rng = np.random.default_rng(2)
p = 20                                   # 후보 변수 20개, 그중 실제로 관련 있는 것은 4개
beta = np.r_[0.8, 0.6, 0.5, 0.4, np.zeros(p - 4)]

def make(n):
    X = rng.normal(size=(n, p))
    y = rng.random(n) < 1 / (1 + np.exp(-(-2.2 + X @ beta)))   # 유병률 약 15%
    return X, y.astype(int)

X_test, y_test = make(20000)             # "모집단"을 대신하는 큰 시험 세트
print("개발 n  사건 수  EPP  | 겉보기 AUC  시험 AUC  보정 기울기")
for n in [150, 400, 1500, 6000]:
    res = []
    for rep in range(50):                # 같은 크기의 연구를 50번 반복
        X, y = make(n)
        m = LogisticRegression(C=1e6, max_iter=2000).fit(X, y)   # 사실상 벌점 없는 최대우도
        lp = m.decision_function(X_test)
        slope = sm.Logit(y_test, sm.add_constant(lp)).fit(disp=0).params[1]
        res.append((y.sum(), roc_auc_score(y, m.decision_function(X)), roc_auc_score(y_test, lp), slope))
    ev, app, test, slope = np.mean(res, axis=0)
    print(f"{n:>6d}  {ev:>6.0f}  {ev / p:>4.1f} |   {app:.3f}      {test:.3f}      {slope:.2f}")
```

출력:

```text
개발 n  사건 수  EPP  | 겉보기 AUC  시험 AUC  보정 기울기
   150      24   1.2 |   0.870      0.692      0.35
   400      59   3.0 |   0.824      0.740      0.64
  1500     218  10.9 |   0.791      0.771      0.90
  6000     877  43.9 |   0.783      0.779      0.99
```

개발 150명(사건 24건)일 때 겉보기 AUC는 0.87로 가장 높지만, 새 사람에게서는 0.69입니다. 보정 기울기 0.35는 예측이 실제보다 훨씬 극단적이라는 뜻입니다. "작은 자료에서 가장 좋은 숫자가 나온다"는 역설이 바로 과적합입니다. EPP가 11 근처(1,500명)일 때 기울기가 0.90으로, 예시 1의 기준 1(축소 0.9)과 맞아떨어집니다. 이 모델은 사실상 벌점이 없는 로지스틱 회귀(`C=1e6`)라서 과적합이 그대로 드러납니다. 벌점(정규화)을 주면 기울기가 나아지지만, 작은 자료에서는 벌점의 세기 자체도 불안정하게 추정된다는 보고가 있어(Riley 등 2021) 표본 부족을 완전히 해결하지는 못합니다.

### 예시 3 — 기관 하나씩 빼기

기관 4곳, 한 사람당 기록 3개인 가상 자료입니다. 기관 C와 D는 기기 증폭률이 다르고, 기관마다 유병률이 다릅니다.

```python
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import StratifiedKFold, GroupKFold

rng = np.random.default_rng(3)
rows = []
pid = 0
for site, (n_people, prev, gain) in {"A": (120, 0.5, 1.0), "B": (120, 0.4, 1.0),
                                     "C": (100, 0.3, 1.3), "D": (80, 0.2, 0.8)}.items():
    for _ in range(n_people):
        pid += 1
        case = rng.random() < prev
        person = rng.normal(0, 1)                     # 사람마다 고유한 기준값
        for rec in range(3):                          # 한 사람당 기록 3개
            tremor = gain * (0.8 * case + person + rng.normal(0, 0.5))   # 기기마다 증폭률(gain)이 다르다
            sway = 0.5 * case + 0.6 * person + rng.normal(0, 1)
            rows.append(dict(pid=pid, site=site, case=int(case), tremor=tremor, sway=sway))
df = pd.DataFrame(rows)
X, y = df[["tremor", "sway"]].values, df.case.values
print(df.groupby("site").agg(사람=("pid", "nunique"), 기록=("pid", "size"), 유병률=("case", "mean")).round(2))

def cv_auc(splitter, groups=None):
    scores = []
    for tr, te in splitter.split(X, y, groups):
        m = LogisticRegression().fit(X[tr], y[tr])
        scores.append(roc_auc_score(y[te], m.predict_proba(X[te])[:, 1]))
    return np.array(scores)

print("\n기록 단위 무작위 5-fold :", cv_auc(StratifiedKFold(5, shuffle=True, random_state=0)).mean().round(3))
print("참가자 단위 5-fold      :", cv_auc(GroupKFold(5), df.pid).mean().round(3))
print("기관 하나씩 빼기:")
for site in sorted(df.site.unique()):          # 기관 하나씩 빼기(internal-external CV)
    tr, te = df.site != site, df.site == site
    m = LogisticRegression().fit(X[tr], y[tr])
    p = m.predict_proba(X[te])[:, 1]
    print(f"  {site}를 빼고 개발 → {site}에서 검증: AUC {roc_auc_score(y[te], p):.3f} | 관찰 {y[te].mean():.2f} vs 예측 평균 {p.mean():.2f}")
```

출력:

```text
       사람   기록   유병률
site                
A     120  360  0.53
B     120  360  0.31
C     100  300  0.31
D      80  240  0.18

기록 단위 무작위 5-fold : 0.656
참가자 단위 5-fold      : 0.647
기관 하나씩 빼기:
  A를 빼고 개발 → A에서 검증: AUC 0.589 | 관찰 0.53 vs 예측 평균 0.30
  B를 빼고 개발 → B에서 검증: AUC 0.704 | 관찰 0.31 vs 예측 평균 0.38
  C를 빼고 개발 → C에서 검증: AUC 0.690 | 관찰 0.31 vs 예측 평균 0.33
  D를 빼고 개발 → D에서 검증: AUC 0.622 | 관찰 0.17 vs 예측 평균 0.37
```

기록 단위와 참가자 단위 교차검증의 차이가 작은 것은 이 모델(변수 2개의 로지스틱 회귀)이 개인을 외울 능력이 거의 없기 때문입니다. [Day 33](../../week-5/day-33.md)의 랜덤 포레스트처럼 유연한 모델에서는 차이가 커집니다. 더 중요한 것은 기관 하나씩 빼기의 결과입니다. AUC가 0.59에서 0.70까지 흩어지고, 예측 평균이 관찰 비율과 크게 어긋나는 기관(A: 관찰 0.53 vs 예측 0.30, D: 0.17 vs 0.37)이 있습니다. 평균 AUC 하나로 요약했다면 이 정보는 사라졌을 것입니다.

## 직접 해보기

1. `notebooks/advanced/H/H2_sample_size.ipynb`에서 예시 1–3을 실행합니다.
2. 예시 1의 함수로 여러분의 H1 카드에 맞는 계산을 합니다. 후보 변수 수와 기대 유병률을 정하고(근거 한 줄), 최소 n과 필요한 사건 수를 적습니다. `r2_nagelkerke`를 0.15에서 0.3으로 바꾸면 숫자가 어떻게 되는지도 적습니다.
3. 예시 2에서 `LogisticRegression(C=1e6, ...)`을 `LogisticRegression(C=0.1, ...)`(강한 벌점)로 바꿔 다시 실행하고, 작은 표본에서 기울기가 어떻게 변하는지 기록합니다.
4. 예시 3에 `RandomForestClassifier(min_samples_leaf=1)`를 넣어 기록 단위와 참가자 단위 교차검증의 차이가 커지는지 확인합니다. (힌트: `from sklearn.ensemble import RandomForestClassifier`, `cv_auc` 안의 모델만 바꿉니다.)
5. `reports/advanced/H/H2_validation_plan.md`에 검증 구조를 씁니다. 항목: 분할 단위(참가자/기관/시기), 내부 검증 방법, 외부 검증에 쓸 수 있는 자료(없으면 "없음"이라고 쓰고 그 결과 무엇을 주장할 수 없는지), 최소 표본 수 계산 결과.

⚠️ **흔한 오류 1 — 변수 선택을 전체 자료로 한 다음 교차검증한다**
단변량 p-value로 변수를 고르고 그 변수로 교차검증하면, 시험 fold의 정보가 이미 변수 선택에 쓰였습니다. 변수 선택·스케일링·결측 대체 등 **모든 개발 단계**를 파이프라인에 넣어 fold 안에서만 하게 합니다.

⚠️ **흔한 오류 2 — `GroupKFold`에 기관 ID를 넣었는데 기관이 3곳뿐이다**
5-fold를 만들 수 없어 오류가 나거나, fold 수가 기관 수와 같아집니다. 기관이 적을 때는 기관 하나씩 빼기를 쓰고, 기관 수가 적다는 사실 자체를 한계로 적습니다.

## 퀴즈

**1.** (객관식) EPV를 계산할 때 분모로 세야 하는 것은?
① 최종 모델에 남은 변수 수
② 검토한 후보 변수(회귀 계수) 전체 수
③ 참가자 수
④ 기관 수

<details><summary>정답 보기</summary>

②. 변수 선택 과정에서 떨어뜨린 변수도 자료를 보고 결정한 것이므로 과적합에 기여합니다. 범주형 변수는 범주 수만큼 계수를 셉니다.

</details>

**2.** (단답) 예시 2에서 개발 150명일 때 겉보기 AUC(0.87)가 시험 AUC(0.69)보다 높은 이유는?

<details><summary>정답 보기</summary>

모델이 개발 자료의 우연한 잡음까지 맞췄기 때문입니다(과적합). 개발 자료로 평가한 성능은 이 낙관을 포함하므로, 새 자료나 교차검증으로 잰 성능을 보고해야 합니다.

</details>

**3.** (객관식) 보정 기울기가 0.35라는 것은?
① 예측이 너무 소심하다
② 예측이 너무 극단적이다(고위험은 더 높게, 저위험은 더 낮게)
③ 전체적으로 과소 예측한다
④ 판별력이 없다

<details><summary>정답 보기</summary>

②. 기울기가 1보다 작으면 예측 logit의 폭을 줄여야 실제와 맞는다는 뜻으로, 과적합의 전형적 신호입니다.

</details>

**4.** (단답) 기관 하나씩 빼기 결과를 평균 AUC 하나로만 보고하면 무엇을 잃나요?

<details><summary>정답 보기</summary>

기관 간 성능의 흩어짐(이질성)과 기관별 보정 어긋남을 잃습니다. 새 기관에 적용했을 때의 불확실성이 바로 그 흩어짐이므로, 기관별 값과 범위를 함께 보고합니다.

</details>

**5.** (객관식) 내부 검증과 외부 검증의 관계로 맞는 것은?
① 내부 검증을 잘하면 외부 검증은 필요 없다
② 외부 검증이 있으면 내부 검증은 필요 없다
③ 내부 검증은 과적합을, 외부 검증은 다른 환경으로의 이전 가능성을 본다
④ 둘은 같은 것이다

<details><summary>정답 보기</summary>

③. 서로 다른 질문에 답하므로 하나가 다른 하나를 대신하지 못합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3이 실행되고 출력이 위와 같다.
- [ ] 내 문제에 대한 최소 표본 수 계산과 근거가 있다.
- [ ] 벌점 세기와 모델 종류를 바꾼 실험 결과를 기록했다.
- [ ] `reports/advanced/H/H2_validation_plan.md`에 분할 단위와 검증 구조가 있다.

## 더 읽을거리
- Riley RD, et al. Calculating the sample size required for developing a clinical prediction model. *BMJ.* 2020;368:m441. doi:[10.1136/bmj.m441](https://doi.org/10.1136/bmj.m441)
- Riley RD, et al. Minimum sample size for developing a multivariable prediction model: Part II — binary and time-to-event outcomes. *Stat Med.* 2019;38:1276–1296. doi:[10.1002/sim.7992](https://doi.org/10.1002/sim.7992)
- Peduzzi P, et al. A simulation study of the number of events per variable in logistic regression analysis. *J Clin Epidemiol.* 1996;49:1373–1379. doi:[10.1016/S0895-4356(96)00236-3](https://doi.org/10.1016/S0895-4356(96)00236-3)
- van Smeden M, et al. Sample size for binary logistic prediction models: beyond events per variable criteria. *Stat Methods Med Res.* 2019;28:2455–2474. doi:[10.1177/0962280218784726](https://doi.org/10.1177/0962280218784726)
- Riley RD, et al. Penalization and shrinkage methods produced unreliable clinical prediction models especially when sample size was small. *J Clin Epidemiol.* 2021;132:88–96. doi:[10.1016/j.jclinepi.2020.12.005](https://doi.org/10.1016/j.jclinepi.2020.12.005)
- Steyerberg EW, Vergouwe Y. Towards better clinical prediction models: seven steps for development and an ABCD for validation. *Eur Heart J.* 2014;35:1925–1931. doi:[10.1093/eurheartj/ehu207](https://doi.org/10.1093/eurheartj/ehu207)

---
[← 이전](day-H1.md) · [코스 지도](../../../README.md) · [다음 →](day-H3.md)
