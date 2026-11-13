# Day H6 — 외부 검증과 데이터셋 이동: 다른 기관에 가면 무엇이 무너지나

> **주차:** 심화 파트 H — 임상 예측·조기진단 ML · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/H/H6_external.ipynb`, `reports/advanced/H/H6_monitoring_plan.md` (성능 감시 계획)
>
> **먼저 끝내 둘 레슨:** [Day H2](day-H2.md) (기관 하나씩 빼기), [Day H3](day-H3.md), [Day E6](../E-ehr/day-E6.md) (시간적 검증·재보정), [Day G7](../G-ai-biomed/day-G7.md) (하위집단 평가·공정성)

## 오늘의 목표
- 기관·기기·인구 분포 차이(site shift)를 종류별로 나누고, 각각이 판별과 보정에 어떤 흔적을 남기는지 가상 데이터로 보여 줄 수 있다.
- 새 기관의 소량 자료로 절편 또는 절편+기울기 재보정을 하고, 재보정이 고칠 수 있는 것과 없는 것을 구분할 수 있다.
- 하위집단 성능을 신뢰구간과 함께 보고하고, 배포 후 감시 지표(관찰/예측 비)를 설계할 수 있다.

## 🎬 영상으로 먼저 보기

- [dataset shift clinical machine learning — YouTube 검색](https://www.youtube.com/results?search_query=dataset+shift+clinical+machine+learning+external+validation) (검색 링크)
- **무엇에 주목할까:** 한 병원에서 잘 되던 모델이 다른 병원에서 성능이 떨어진 사례를 다루는 강연을 골라, 원인이 "환자 구성이 달라서"인지 "측정이 달라서"인지 "결과의 정의가 달라서"인지 구분해 보세요.

- [Building and validating prediction models — NIHR Maudsley Biomedical Research Centre (BRC)](https://www.youtube.com/watch?v=ZRf0scPfrVQ) (10:23)
- **무엇에 주목할까:** [Day E6](../E-ehr/day-E6.md)에서 이미 본 영상이라면 외부 검증 부분만 다시 보세요. "외부"의 범위(다른 병원, 다른 시기, 다른 나라)를 오늘의 세 가지 이동과 짝지어 보세요.

## 개념 설명

### 데이터셋 이동의 세 얼굴

모델은 개발 자료의 세계를 배웁니다. 새 기관의 세계가 다르면 모델이 틀립니다. 이 레슨에서는 다름을 세 종류로 나눠 봅니다. 기술 변화, 인구 변화, 진료 행태 변화 등으로 실제 임상 AI가 흔들린 사례는 Finlayson 등(2021)이 정리했습니다.

- **집단 구성의 차이(case-mix, covariate shift):** 새 기관 환자가 더 고령이거나, 더 경증이거나, 다른 질환이 섞여 있습니다. 같은 사람이라면 모델은 맞지만, 사람들의 분포가 달라서 판별(AUC)이 오르내리고 유병률이 달라집니다.
- **기저 위험의 차이(prior/label shift):** 같은 특징을 가진 사람의 실제 위험 자체가 다릅니다. 진료 경로(누가 의뢰되어 오는가), 결과 정의, 추적 방식이 다르면 생깁니다. 주로 **보정 절편**이 어긋납니다.
- **측정의 차이(measurement shift):** 같은 사람인데 기기·펌웨어·측정 절차가 달라 다른 값이 찍힙니다. 증폭률이 다르면 **보정 기울기**가, 잡음이 크면 **판별력과 기울기**가 함께 무너집니다(Luijken 등 2019). 웨어러블 연구에서 가장 흔하고 가장 눈에 안 띄는 이동입니다. 손목 위치, 착용 강도, 샘플링 주파수, 전처리 버전이 모두 해당합니다.

비유하자면 같은 레시피(모델)를 다른 부엌(기관)에서 쓰는 상황입니다. 손님 취향이 다르거나(구성), 그 동네 재료가 원래 짜거나(기저 위험), 계량컵 눈금이 다르면(측정) 같은 레시피로도 다른 음식이 나옵니다.

### 외부 검증에서 볼 것, 그리고 재보정

외부 검증 결과는 [Day E6](../E-ehr/day-E6.md)과 H3의 숫자로 읽습니다. AUC(판별), 보정 절편(평균 수준), 보정 기울기(폭), 보정 곡선. 해석의 실마리는 Debray 등(2015)이 정리했습니다. 새 집단이 개발 집단과 **얼마나 닮았는가**를 먼저 보고(나이, 유병률, 특징 분포), 그다음 성능을 봅니다. 닮은 집단에서 성능이 유지되면 "재현성", 다른 집단에서 유지되면 "이전 가능성(transportability)"의 증거입니다.

보정이 어긋났을 때 고치는 순서는 가벼운 것부터입니다.

1. **절편만 재보정:** 평균 위험만 새 기관에 맞춥니다. 기저 위험 차이에 적합합니다.
2. **절편+기울기 재보정:** 예측의 폭까지 조정합니다. 측정 증폭률 차이처럼 예측 전체가 늘어나거나 줄어든 경우.
3. **모델 갱신·재개발:** 특정 변수의 효과가 다르거나 판별력이 무너졌다면 재보정으로는 안 됩니다.

재보정은 **순서를 바꾸지 않으므로 AUC를 올리지 못합니다.** 측정 잡음으로 판별이 떨어졌다면 측정을 고쳐야 합니다.

### 하위집단 성능과 감시

전체 숫자는 하위집단의 차이를 숨깁니다. 성별, 연령대, 기기 종류, 기관별로 AUC·보정·고정 임계값에서의 민감도를 **신뢰구간과 함께** 봅니다. 공정성 지표의 여러 정의와 그 충돌은 [Day G7](../G-ai-biomed/day-G7.md)에서 다뤘으므로 여기서는 반복하지 않습니다. 임상 예측에서 특히 볼 것은 **보정의 하위집단 차이**입니다. 한 집단에서 위험을 체계적으로 낮게 말하면, 같은 임계값에서 그 집단은 덜 의뢰됩니다.

배포 뒤에도 세계는 계속 변합니다(펌웨어 갱신, 진료 지침 변경, 의뢰 경로 변화). 그래서 감시 계획이 모델의 일부입니다. 가장 단순한 지표는 기간별 **관찰/예측 비(O/E)**, 즉 실제 사건 수 ÷ 예측 확률의 합입니다. 1이면 평균 수준 보정이 맞고, 1보다 작으면 과대 예측입니다. 결과가 늦게 확정되는 문제(전구기 발병은 수년 후)에서는 결과 대신 **입력 분포**(특징 평균, 예측 점수 분포)를 먼저 감시합니다.

## 예시로 이해하기

개발 기관 1곳과 외부 기관 3곳의 가상 자료입니다. 외부 기관 1은 같은 조건, 2는 고령·저위험·기기 증폭률 1.6배, 3은 잡음이 큰 기기입니다. 예시 2–4는 예시 1 다음 셀에 이어서 실행합니다.

### 예시 1 — 세 가지 이동이 남기는 흔적

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

rng = np.random.default_rng(8)
def site(n, age_mean, base, gain, noise):
    """기관 하나의 가상 자료. gain=기기 증폭률, noise=기기 잡음, base=기저 위험(logit)."""
    age = rng.normal(age_mean, 8, n)
    sex = rng.integers(0, 2, n)                               # 1 = 여성
    tremor_true = rng.normal(0, 1, n)
    y = rng.random(n) < 1 / (1 + np.exp(-(base + 0.06 * (age - 65) + 1.0 * tremor_true)))
    tremor_meas = gain * tremor_true + rng.normal(0, noise, n)  # 기기가 "보는" 값
    return pd.DataFrame({"age": age, "female": sex, "tremor": tremor_meas, "y": y.astype(int)})

dev  = site(1500, 65, -1.4, gain=1.0, noise=0.3)    # 개발 기관
ext1 = site(1000, 65, -1.4, gain=1.0, noise=0.3)    # 같은 조건의 다른 표본
ext2 = site(1000, 72, -2.2, gain=1.6, noise=0.3)    # 더 고령, 기저 위험 낮음, 기기 증폭률 1.6배
ext3 = site(1000, 65, -1.4, gain=1.0, noise=1.2)    # 기기 잡음이 큼
X = ["age", "female", "tremor"]
m = LogisticRegression().fit(dev[X], dev.y)

def logit(p):
    p = np.clip(p, 1e-6, 1 - 1e-6); return np.log(p / (1 - p))

def evaluate(name, d, p):
    lp = logit(p)
    slope = sm.Logit(d.y, sm.add_constant(lp)).fit(disp=0).params.iloc[1]
    citl = sm.GLM(d.y, np.ones((len(d), 1)), family=sm.families.Binomial(), offset=lp).fit().params.iloc[0]
    print(f"{name:22s} AUC {roc_auc_score(d.y, p):.3f} | 관찰 {d.y.mean():.3f} 예측 {p.mean():.3f} | 절편 {citl:+.2f} 기울기 {slope:.2f}")

for name, d in [("같은 조건", ext1), ("고령·저위험·증폭 1.6배", ext2), ("잡음 큰 기기", ext3)]:
    evaluate(name, d, m.predict_proba(d[X])[:, 1])
```

출력:

```text
같은 조건                  AUC 0.756 | 관찰 0.266 예측 0.238 | 절편 +0.18 기울기 0.95
고령·저위험·증폭 1.6배         AUC 0.759 | 관찰 0.184 예측 0.361 | 절편 -1.32 기울기 0.63
잡음 큰 기기                AUC 0.652 | 관찰 0.269 예측 0.270 | 절편 -0.01 기울기 0.34
```

- **같은 조건:** 모든 숫자가 개발 때와 비슷합니다. 이것이 기준입니다.
- **고령·저위험·증폭 1.6배:** AUC는 0.759로 **오히려 같거나 높습니다.** 그런데 예측 평균 0.361 vs 관찰 0.184, 절편 −1.32, 기울기 0.63. AUC만 봤다면 "외부 검증 성공"이라고 썼을 것입니다. 기저 위험이 낮아(절편) 과대 예측하고, 떨림 값이 1.6배로 찍혀(기울기) 예측이 너무 극단적입니다.
- **잡음 큰 기기:** 평균은 맞는데(절편 −0.01) AUC가 0.652로 떨어지고 기울기가 0.34로 무너졌습니다. 측정 잡음은 신호를 흐리게 해서 순서 자체를 망가뜨립니다.

### 예시 2 — 새 기관 200명으로 재보정하기

외부 기관 2의 처음 200명으로 재보정하고, 나머지 800명으로 확인합니다.

```python

# 예시 2 — 새 기관의 일부(200명)로 재보정하고 나머지(800명)로 확인
local, hold = ext2.iloc[:200], ext2.iloc[200:]
lp_local = logit(m.predict_proba(local[X])[:, 1])
lp_hold = logit(m.predict_proba(hold[X])[:, 1])
a = sm.GLM(local.y, np.ones((200, 1)), family=sm.families.Binomial(), offset=lp_local).fit().params.iloc[0]
ab = sm.Logit(local.y, sm.add_constant(lp_local)).fit(disp=0).params
evaluate("재보정 전", hold, 1 / (1 + np.exp(-lp_hold)))
evaluate("절편만 재보정", hold, 1 / (1 + np.exp(-(a + lp_hold))))
evaluate("절편+기울기 재보정", hold, 1 / (1 + np.exp(-(ab.iloc[0] + ab.iloc[1] * lp_hold))))
```

출력:

```text
재보정 전                  AUC 0.757 | 관찰 0.191 예측 0.367 | 절편 -1.29 기울기 0.63
절편만 재보정                AUC 0.757 | 관찰 0.191 예측 0.171 | 절편 +0.19 기울기 0.63
절편+기울기 재보정             AUC 0.757 | 관찰 0.191 예측 0.166 | 절편 +0.20 기울기 0.96
```

세 줄의 AUC는 모두 0.757입니다. 재보정은 판별을 바꾸지 않습니다. 절편만 고치면 평균(예측 0.171 vs 관찰 0.191)은 맞지만 기울기 0.63은 그대로라, 고위험 쪽은 여전히 과대, 저위험 쪽은 과소 예측입니다. 절편+기울기를 고쳐야 기울기가 0.96이 됩니다. 원인이 측정 증폭률이었기 때문입니다. 반대로 외부 기관 3(잡음)에 같은 일을 하면 보정은 나아져도 AUC 0.65는 그대로입니다(직접 해보기 3).

### 예시 3 — 하위집단 성능을 구간과 함께

```python

# 예시 3 — 하위집단 성능: 숫자 하나 대신 집단별 숫자와 불확실성
d = ext1.copy()
d["p"] = m.predict_proba(d[X])[:, 1]
d["age_group"] = np.where(d.age >= 70, "70+", "<70")
def boot_auc(sub, B=1000):
    vals = []
    for _ in range(B):
        i = rng.integers(0, len(sub), len(sub))
        s = sub.iloc[i]
        if s.y.nunique() == 2:
            vals.append(roc_auc_score(s.y, s.p))
    return np.percentile(vals, [2.5, 97.5])
for col in ["female", "age_group"]:
    for g, sub in d.groupby(col):
        lo, hi = boot_auc(sub)
        sens = (sub.p[sub.y == 1] >= 0.25).mean()
        print(f"{col}={g!s:4s} n={len(sub):4d} 사건 {sub.y.sum():3d} | AUC {roc_auc_score(sub.y, sub.p):.3f} ({lo:.3f}–{hi:.3f})"
              f" | 임계값 0.25 민감도 {sens:.2f} | 관찰 {sub.y.mean():.2f} 예측 {sub.p.mean():.2f}")
```

출력:

```text
female=0    n= 482 사건 128 | AUC 0.754 (0.705–0.802) | 임계값 0.25 민감도 0.63 | 관찰 0.27 예측 0.24
female=1    n= 518 사건 138 | AUC 0.758 (0.712–0.804) | 임계값 0.25 민감도 0.65 | 관찰 0.27 예측 0.24
age_group=70+  n= 268 사건 101 | AUC 0.722 (0.656–0.784) | 임계값 0.25 민감도 0.78 | 관찰 0.38 예측 0.34
age_group=<70  n= 732 사건 165 | AUC 0.751 (0.712–0.790) | 임계값 0.25 민감도 0.56 | 관찰 0.23 예측 0.20
```

성별 사이에는 차이가 거의 없습니다. 연령대에서는 70세 이상의 AUC가 0.722로 조금 낮지만 구간(0.656–0.784)이 70세 미만의 구간과 크게 겹칩니다. 268명으로는 "차이가 있다"고도 "없다"고도 확신할 수 없습니다. 반면 같은 임계값 0.25에서 민감도는 0.78 vs 0.56으로 꽤 다릅니다. AUC는 비슷해도 **유병률이 다른 집단에 같은 임계값을 쓰면** 민감도와 위양성률이 달라집니다. 하위집단 표에는 n, 사건 수, 구간, 그리고 실제로 쓸 임계값에서의 숫자를 함께 둡니다.

### 예시 4 — 배포 후 감시: O/E

```python

# 예시 4 — 배포 후 감시: 달마다 관찰/예측 비(O/E)와 3개월 누적 O/E
log = []
for month in range(1, 13):
    gain = 1.0 if month <= 6 else 1.6            # 7월에 센서 펌웨어가 바뀌어 같은 떨림이 1.6배로 찍힌다고 가정
    d = site(300, 65, -1.4, gain=gain, noise=0.3)
    log.append((month, d.y.sum(), m.predict_proba(d[X])[:, 1].sum()))
log = pd.DataFrame(log, columns=["month", "O", "E"])
log["O/E"] = log.O / log.E
log["O/E_3m"] = log.O.rolling(3).sum() / log.E.rolling(3).sum()
# 0.9는 이 예시에서 정한 규칙이다. 실제 규칙은 표본 크기와 허용 오차를 보고 미리 정한다
log["flag"] = np.where(log["O/E_3m"] < 0.9, "점검", "")
print(log.round(2).to_string(index=False))
```

출력:

```text
 month  O     E  O/E  O/E_3m flag
     1 75 77.81 0.96     NaN     
     2 76 64.45 1.18     NaN     
     3 70 71.14 0.98    1.04     
     4 75 65.59 1.14    1.10     
     5 69 71.73 0.96    1.03     
     6 71 70.20 1.01    1.04     
     7 83 86.27 0.96    0.98     
     8 70 79.87 0.88    0.95     
     9 73 83.98 0.87    0.90     
    10 66 79.67 0.83    0.86   점검
    11 78 98.67 0.79    0.83   점검
    12 75 78.84 0.95    0.85   점검
```

달마다의 O/E는 0.79–1.18 사이에서 출렁입니다. 한 달 300명, 사건 70명 남짓이면 이 정도 흔들림은 우연으로도 생깁니다. 3개월 누적 O/E는 더 안정적이고, 펌웨어 변경(7월) 후 서서히 내려가 10월에 규칙(0.9 미만)을 넘습니다. 변경 시점과 경보 시점 사이에 석 달의 지연이 있다는 것도 감시 설계의 일부로 적어야 합니다. 이 예시에서 펌웨어 변경 날짜를 기록해 두었다면, 결과를 기다리지 않고 **입력 분포**(떨림 값의 평균과 분산)를 변경 전후로 비교해 더 빨리 알아챌 수 있었을 것입니다.

## 직접 해보기

1. `notebooks/advanced/H/H6_external.ipynb`에서 예시 1–4를 실행합니다.
2. 이동을 하나씩 분리합니다. 예시 1의 `ext2`를 세 번 바꿔 만들어(① 나이만 72, ② 기저 위험만 −2.2, ③ gain만 1.6) 각 이동이 AUC·절편·기울기 중 무엇을 주로 움직이는지 표로 정리합니다.
3. 예시 2의 재보정을 `ext3`(잡음 큰 기기)에 적용하고, AUC가 그대로인지 확인합니다. "재보정으로 고칠 수 없는 것"을 한 문장으로 적습니다.
4. 입력 분포 감시를 추가합니다. 예시 4의 반복문 안에서 `d.tremor.std()`를 함께 기록하고, 펌웨어 변경 전후 평균을 비교합니다. O/E 경보보다 몇 달 먼저 알아챌 수 있는지 적습니다.
5. `reports/advanced/H/H6_monitoring_plan.md`에 감시 계획을 씁니다: 감시 지표(입력 분포, O/E, 가능하면 AUC), 집계 주기, 경보 규칙과 그 근거, 경보 시 행동(점검 → 재보정 → 재개발), 하위집단 표의 항목.

⚠️ **흔한 오류 1 — 재보정에 쓴 자료로 재보정 성능을 평가한다**
예시 2에서 200명으로 재보정하고 같은 200명으로 평가하면 낙관적입니다. 재보정용과 평가용을 나누거나, 재보정 과정 전체를 교차검증합니다.

⚠️ **흔한 오류 2 — 작은 하위집단의 AUC 차이를 "편향 발견"으로 보고한다**
n이 작으면 구간이 넓어 우연한 차이가 큽니다. 구간을 함께 쓰고, 미리 정한 하위집단만 주 분석으로 보고, 나머지는 탐색으로 표시합니다.

## 퀴즈

**1.** (객관식) 외부 기관에서 AUC는 개발 때와 같은데 보정 절편이 −1.3입니다. 가장 적절한 해석은?
① 모델이 그 기관에서도 문제없다
② 순서는 맞히지만 위험을 체계적으로 과대 예측하므로, 확률을 그대로 쓰면 안 된다
③ 판별이 무너졌다
④ 표본이 너무 크다

<details><summary>정답 보기</summary>

②. 절편이 음수면 과대 예측입니다. 임계값을 확률로 정해 쓰면 의뢰가 과도해지고, H4에서 본 것처럼 순 이득이 음수가 될 수 있습니다.

</details>

**2.** (단답) 기기 잡음이 커져 AUC가 떨어졌습니다. 절편+기울기 재보정을 하면 AUC가 회복될까요?

<details><summary>정답 보기</summary>

아니요. 재보정은 단조 변환이라 순서를 바꾸지 않으므로 AUC가 그대로입니다. 측정 자체를 개선하거나 그 기기 자료로 모델을 다시 만들어야 합니다.

</details>

**3.** (객관식) 기기의 증폭률이 개발 때보다 1.6배일 때 주로 나타나는 흔적은?
① 보정 기울기가 1보다 작아진다
② AUC가 0.5가 된다
③ 유병률이 바뀐다
④ 아무 변화가 없다

<details><summary>정답 보기</summary>

①. 같은 사람의 값이 더 크게 찍혀 logit이 넓게 퍼지므로 예측이 극단적이 되고, 보정 기울기가 1보다 작아집니다.

</details>

**4.** (단답) 전구기 발병처럼 결과 확정에 수년이 걸리는 경우, 배포 직후 무엇을 먼저 감시해야 하나요?

<details><summary>정답 보기</summary>

입력 특징의 분포와 예측 점수의 분포. 결과가 쌓이기 전에도 측정 변화나 집단 변화를 알아챌 수 있습니다.

</details>

**5.** (객관식) 예시 3에서 두 연령대의 AUC는 비슷하지만 임계값 0.25의 민감도가 다른 주된 이유는?
① 모델이 연령을 쓰지 않아서
② 두 집단의 위험 분포(유병률)가 달라 같은 임계값이 다른 지점을 자르기 때문
③ 부트스트랩 오류
④ 성별 차이

<details><summary>정답 보기</summary>

②. 70세 이상은 위험이 높은 쪽에 몰려 있어 같은 임계값을 넘는 비율이 높습니다. AUC는 순서만 보므로 이 차이를 드러내지 않습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–4가 실행되고 출력이 위와 같다.
- [ ] 세 가지 이동을 하나씩 분리한 표가 있다.
- [ ] 잡음 기기에 재보정을 적용해 AUC가 그대로임을 확인했다.
- [ ] `reports/advanced/H/H6_monitoring_plan.md`에 지표·주기·경보 규칙·행동이 있다.

## 더 읽을거리
- Finlayson SG, et al. The clinician and dataset shift in artificial intelligence. *N Engl J Med.* 2021;385:283–286. doi:[10.1056/NEJMc2104626](https://doi.org/10.1056/NEJMc2104626)
- Debray TPA, et al. A new framework to enhance the interpretation of external validation studies of clinical prediction models. *J Clin Epidemiol.* 2015;68:279–289. doi:[10.1016/j.jclinepi.2014.06.018](https://doi.org/10.1016/j.jclinepi.2014.06.018)
- Luijken K, et al. Impact of predictor measurement heterogeneity across settings on the performance of prediction models: a measurement error perspective. *Stat Med.* 2019;38:3444–3459. doi:[10.1002/sim.8183](https://doi.org/10.1002/sim.8183)
- Van Calster B, et al. Calibration: the Achilles heel of predictive analytics. *BMC Med.* 2019;17. doi:[10.1186/s12916-019-1466-7](https://doi.org/10.1186/s12916-019-1466-7)

---
[← 이전](day-H5.md) · [코스 지도](../../../README.md) · [다음 →](day-H7.md)
