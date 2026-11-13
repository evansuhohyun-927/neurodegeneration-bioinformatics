# Day H5 — 종단·생존 예측: 언제 발병하는가

> **주차:** 심화 파트 H — 임상 예측·조기진단 ML · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/H/H5_survival.ipynb`, `figures/advanced/H/H5_km.png`
>
> **먼저 끝내 둘 레슨:** [Day H1](day-H1.md) (예측 시점), [Day H3](day-H3.md), [Day E6](../E-ehr/day-E6.md) (시간 누수)

## 오늘의 목표
- 중도절단(censoring)이 무엇이고, 이를 무시한 "단순 비율"이 왜 위험을 과소 추정하는지 설명할 수 있다.
- lifelines로 Kaplan–Meier 곡선, Cox 비례위험 모델, C-index를 계산할 수 있다.
- 예측 시점 이후의 정보가 생존 모델에 섞일 때 생기는 누수를 찾아낼 수 있다.

## 🎬 영상으로 먼저 보기

- [Kaplan-Meier Estimation [Survival Analysis] — math et al](https://www.youtube.com/watch?v=NDgn72ynHcM) (8:38)
- **무엇에 주목할까:** 사건이 일어날 때마다 "그 시점에 아직 위험에 노출된 사람 수"로 나눠 생존 확률을 갱신하는 계산을 따라가 보세요. 중도절단된 사람은 떠나는 순간까지 분모에 남아 기여한다는 점이 핵심입니다.

- [Cox proportional hazards model — YouTube 검색](https://www.youtube.com/results?search_query=Cox+proportional+hazards+model+explained) (검색 링크)
- **무엇에 주목할까:** 위험비(hazard ratio)가 "어느 시점에서든 순간 위험이 몇 배인가"라는 뜻이고, 그 배율이 시간에 따라 변하지 않는다는 가정(비례위험)이 있다는 점을 확인하세요.

## 개념 설명

### 전구기 코호트의 질문은 "누가"가 아니라 "누가, 언제"

H1에서 본 전구기 연구는 대개 이런 모양입니다. 기준 시점에 아직 발병하지 않은 사람들을 모아 지표를 재고, 몇 년간 추적하며 누가 언제 진단 기준을 만족하는지 기록합니다. 결과는 0/1이 아니라 **(시간, 사건 여부)** 쌍입니다.

문제는 모든 사람을 끝까지 볼 수 없다는 것입니다. 연구가 끝나서, 이사해서, 다른 이유로 사망해서 추적이 끊깁니다. 이 사람들은 "끊긴 시점까지 발병하지 않았다"는 정보만 남깁니다. 이것을 **중도절단(right censoring)** 이라 합니다. 비유하면, 도서관에서 빌려 간 책이 언제 반납될지 조사하는데 조사 마감일까지 아직 들고 있는 사람들이 있는 것입니다. 그 사람들을 "반납 안 함"으로 세면 반납 속도를 과소평가하고, 빼 버리면 늦게 반납하는 사람을 빼서 과대평가합니다.

**Kaplan–Meier(KM) 추정**(Kaplan & Meier 1958)은 사건이 생길 때마다 그 시점까지 남아 있는 사람만 분모로 써서 생존 확률을 곱해 나갑니다. 중도절단된 사람은 떠나는 순간까지 분모에 기여합니다. 이 방법이 맞으려면 **중도절단이 사건 위험과 무관해야** 합니다(비정보적 중도절단). 증상이 나빠진 사람이 추적에서 더 잘 빠진다면 이 가정이 깨집니다.

### Cox 모델과 C-index

**Cox 비례위험 모델**(Cox 1972)은 여러 변수가 순간 발병 위험(hazard)에 주는 영향을 위험비로 추정합니다. 위험비 2.0은 "다른 조건이 같다면 어느 시점에서든 순간 위험이 2배"라는 뜻입니다. 기저 위험의 모양을 가정하지 않아 널리 쓰이지만, 위험비가 시간에 따라 일정하다는 **비례위험 가정**은 확인해야 합니다(lifelines의 `check_assumptions`).

생존 모델의 판별력은 **C-index**(Harrell의 concordance)로 잽니다. 비교 가능한 두 사람 쌍(먼저 사건이 난 사람이 분명한 쌍)에서, 모델이 먼저 발병한 사람에게 더 높은 위험을 줬는지의 비율입니다. AUC의 생존 버전이라 0.5는 우연, 1은 완벽입니다. 다만 C-index는 전체 추적 기간을 섞은 숫자라, "5년 위험" 같은 특정 시점의 예측을 쓸 계획이라면 그 시점의 판별과 **보정**(예측 5년 위험 vs KM으로 추정한 관찰 위험)을 따로 봐야 합니다. TRIPOD+AI도 생존 모델에서 예측 시간 지평(time horizon)을 밝히라고 요구합니다.

### 시간 축의 누수

생존 분석에서 누수는 더 교묘합니다. 기준 시점(예측 시점) **이후에** 생긴 정보가 특징에 들어가면, 그 정보는 미래의 사건과 엮여 있습니다.

- **마지막 방문 값:** 발병한 사람의 마지막 방문은 대개 진단 방문입니다. 그때 잰 지표는 이미 질환이 드러난 상태의 값입니다(예시 3).
- **추적 중 방문 횟수·검사 횟수:** 오래 추적된 사람일수록 많아지고, 증상이 생긴 사람일수록 많아집니다. 둘 다 결과와 얽힙니다.
- **불멸 시간 편향(immortal time bias):** "추적 중 어떤 검사를 받은 사람"으로 집단을 나누면, 그 검사를 받을 때까지 살아(발병하지 않고) 있어야 했던 시간이 한쪽 집단에만 유리하게 들어갑니다.

해결은 H1과 같습니다. 예측 시점을 명확히 하고, 모든 특징이 그 시점 이전 값인지 표로 확인합니다. 추적 중 변하는 값을 쓰고 싶다면 랜드마크(landmark) 분석처럼 예측 시점을 여러 개로 다시 정의하는 방법을 씁니다.

## 예시로 이해하기

가상의 전구기 코호트 600명입니다. 기준 시점에 모두 미발병이고, 나이와 가상의 지표 하나가 발병 위험을 높입니다. 추적은 1–8년 사이 임의의 시점에 끝납니다. 예시 2와 3은 예시 1 다음 셀에 이어서 실행합니다.

### 예시 1 — 중도절단을 무시하면

```python
import numpy as np
import pandas as pd
from lifelines import KaplanMeierFitter, CoxPHFitter
from lifelines.utils import concordance_index

rng = np.random.default_rng(7)
n = 600                                         # 가상의 전구기 코호트(기준 시점에 모두 미발병)
age = rng.normal(66, 7, n)
marker = rng.normal(0, 1, n)                    # 기준 시점 지표(가상)
hazard = 0.06 * np.exp(0.05 * (age - 66) + 0.6 * marker)    # 연간 발병 위험
t_event = rng.exponential(1 / hazard)                         # 실제 발병까지 걸릴 시간(관찰 못 할 수도 있음)
t_censor = rng.uniform(1, 8, n)                               # 추적이 끝나는 시점(연구 종료·탈락)
time = np.minimum(t_event, t_censor)
event = (t_event <= t_censor).astype(int)
df = pd.DataFrame({"time": time.round(2), "event": event, "age": age.round(1), "marker": marker.round(2)})
print(df.head(4).to_string(index=False))
print(f"\n발병 관찰 {event.sum()}명 / {n}명, 중도절단 {n - event.sum()}명, 추적 중앙값 {np.median(time):.1f}년")

# 예시 1 — 중도절단을 무시하면 위험을 과소 추정한다
naive = event[time <= 5].sum() / n
km = KaplanMeierFitter().fit(df.time, df.event)
true5 = np.mean(1 - np.exp(-hazard * 5))           # 가상 세계라서 알 수 있는 "정답"
print(f"단순 비율 {naive:.3f} | KM 5년 누적 발병 {1 - km.predict(5.0):.3f} | 정답 {true5:.3f}")
```

출력:

```text
 time  event  age  marker
 4.28      0 66.0   -1.64
 1.51      1 68.1    0.58
 3.69      0 64.1   -0.06
 6.25      0 59.8    0.31

발병 관찰 146명 / 600명, 중도절단 454명, 추적 중앙값 3.5년
단순 비율 0.222 | KM 5년 누적 발병 0.271 | 정답 0.278
```

`event=0`인 사람은 발병하지 않은 것이 아니라 "그 시점까지 관찰된 동안 발병하지 않은" 사람입니다. 600명 중 454명이 그렇습니다. 5년 안에 발병이 관찰된 사람을 전체로 나눈 단순 비율은 0.222로, 정답 0.278을 과소 추정합니다. 5년이 되기 전에 추적이 끝난 사람들 중 일부는 관찰되지 않았을 뿐 5년 안에 발병했을 것이기 때문입니다. KM 추정 0.271은 정답에 가깝습니다. 가상 세계라서 "정답"을 알 수 있다는 점이 시뮬레이션의 장점입니다.

### 예시 2 — KM 곡선 비교, Cox 모델, C-index

```python

# 예시 2 — Kaplan–Meier 곡선 비교, Cox 모델, 시험 세트의 C-index
df["marker_high"] = (df.marker > df.marker.median()).astype(int)
for g, sub in df.groupby("marker_high"):
    k = KaplanMeierFitter().fit(sub.time, sub.event)
    print(f"지표 {'상위' if g else '하위'} 50%: 5년 누적 발병 {1 - k.predict(5.0):.3f} (n={len(sub)}, 사건 {sub.event.sum()})")

train = rng.random(n) < 0.7
cph = CoxPHFitter().fit(df.loc[train, ["time", "event", "age", "marker"]], "time", "event")
print(cph.summary[["exp(coef)", "exp(coef) lower 95%", "exp(coef) upper 95%", "p"]].round(3))
risk = cph.predict_partial_hazard(df.loc[~train, ["age", "marker"]])
# concordance_index는 "값이 클수록 오래 산다"를 가정하므로 위험 점수에 마이너스를 붙인다
print(f"시험 세트 C-index {concordance_index(df.time[~train], -risk, df.event[~train]):.3f}")
```

출력:

```text
지표 하위 50%: 5년 누적 발병 0.175 (n=300, 사건 40)
지표 상위 50%: 5년 누적 발병 0.361 (n=300, 사건 106)
           exp(coef)  exp(coef) lower 95%  exp(coef) upper 95%    p
covariate                                                          
age            1.083                1.049                1.118  0.0
marker         2.066                1.681                2.539  0.0
시험 세트 C-index 0.648
```

지표 상위 50%의 5년 누적 발병(0.361)이 하위 50%(0.175)의 두 배쯤입니다. Cox 모델의 위험비는 지표 1단위당 2.07(95% CI 1.68–2.54)로, 가상 세계의 참값(exp(0.6) ≈ 1.82)을 구간 안에 포함합니다. 나이의 위험비 1.08도 참값 1.05와 크게 다르지 않습니다. 시험 세트 C-index 0.648은 "비교 가능한 쌍의 약 65%에서 먼저 발병한 사람을 더 위험하다고 봤다"는 뜻입니다. 한 가지 함정에 주의하세요. lifelines의 `concordance_index`는 "점수가 클수록 오래 산다"를 기대하므로 위험 점수에는 마이너스를 붙입니다. 붙이지 않으면 0.352처럼 1에서 뺀 값이 나옵니다.

### 예시 3 — 예측 시점 이후의 값이 섞이면

```python

# 예시 3 — 예측 시점 이후의 정보가 섞이면
# 마지막 방문 때 잰 지표: 발병한 사람은 발병 무렵(진단 방문) 값이 기록되어 높게 나온다
df["marker_last_visit"] = df.marker + 1.5 * df.event + rng.normal(0, 0.5, n)
cols = ["age", "marker_last_visit"]
cph_leak = CoxPHFitter().fit(df.loc[train, ["time", "event"] + cols], "time", "event")
risk_leak = cph_leak.predict_partial_hazard(df.loc[~train, cols])
print(f"누수 변수 사용 C-index {concordance_index(df.time[~train], -risk_leak, df.event[~train]):.3f}")
```

출력:

```text
누수 변수 사용 C-index 0.840
```

C-index가 0.648에서 0.840으로 뛰었습니다. 모델이 좋아진 것이 아니라, 발병한 사람의 값이 **발병 무렵에** 기록되었기 때문입니다. 이 모델은 기준 시점에 있는 사람에게 쓸 수 없습니다. 그 값이 아직 존재하지 않기 때문입니다. 전구기 연구 논문을 읽을 때 "지표를 언제 쟀는가"를 가장 먼저 확인해야 하는 이유입니다.

## 직접 해보기

1. `notebooks/advanced/H/H5_survival.ipynb`에서 예시 1–3을 실행합니다.
2. KM 곡선을 그립니다. 예시 2 다음 셀에 붙여 넣습니다.

   ```python
   import matplotlib.pyplot as plt
   from pathlib import Path

   out = Path("../../../figures/advanced/H"); out.mkdir(parents=True, exist_ok=True)
   fig, ax = plt.subplots(figsize=(6, 4))
   for g, sub in df.groupby("marker_high"):
       KaplanMeierFitter(label="marker high" if g else "marker low").fit(sub.time, sub.event).plot_survival_function(ax=ax)
   ax.set_xlabel("years from baseline"); ax.set_ylabel("proportion still unconverted")
   fig.tight_layout(); fig.savefig(out / "H5_km.png", dpi=150)
   ```

   곡선의 음영(신뢰구간)이 뒤로 갈수록 넓어지는 이유를 "남아 있는 사람 수"로 설명해 적습니다.
3. 비례위험 가정을 점검합니다: `cph.check_assumptions(df.loc[train, ["time", "event", "age", "marker"]], p_value_threshold=0.05)`. 출력의 요지를 한 문장으로 적습니다.
4. 정보적 중도절단 실험: 예시 1의 `t_censor`를 만드는 줄 다음에 `t_censor = np.where(marker > 1, t_censor * 0.5, t_censor)`(지표가 높은 사람이 더 일찍 추적에서 빠짐)를 넣고, KM 5년 추정이 정답에서 얼마나 멀어지는지 기록합니다. 원래대로 되돌립니다.
5. H1 카드에 생존 결과용 항목을 추가합니다: 예측 시간 지평(예: 5년), 중도절단의 주요 원인과 그것이 사건과 관련될 가능성, 기준 시점 이후 정보를 쓰지 않는다는 규칙.

⚠️ **흔한 오류 1 — `CoxPHFitter().fit()`에서 `ConvergenceError`**
변수 하나가 사건을 완벽히 가르거나(예: 예시 3보다 더 심한 누수 변수), 변수 척도가 매우 크면 생깁니다. 먼저 누수를 의심하고, 그다음 `CoxPHFitter(penalizer=0.01)`이나 표준화를 시도합니다.

⚠️ **흔한 오류 2 — `time`에 날짜를 그대로 넣었다**
lifelines는 숫자 기간을 받습니다. 기준 시점 날짜와 사건/중도절단 날짜의 차이를 일(또는 년) 단위 숫자로 바꿔 `time` 열을 만듭니다. 0 이하의 시간이 있으면 날짜 순서 오류이니 원자료를 확인합니다.

## 퀴즈

**1.** (단답) 중도절단된 사람에 대해 우리가 아는 것은 무엇인가요?

<details><summary>정답 보기</summary>

중도절단 시점까지는 사건(발병)이 일어나지 않았다는 것. 그 이후는 모릅니다.

</details>

**2.** (객관식) 예시 1에서 단순 비율이 KM 추정보다 낮은 이유는?
① KM이 과대 추정해서
② 5년 전에 추적이 끝난 사람을 "발병하지 않음"으로 세서
③ 사건 수가 너무 많아서
④ Cox 모델을 쓰지 않아서

<details><summary>정답 보기</summary>

②. 그 사람들 중 일부는 관찰되지 않았을 뿐 5년 안에 발병했을 것입니다. KM은 이들을 떠나는 시점까지만 분모에 넣어 이 문제를 피합니다.

</details>

**3.** (객관식) 위험비 2.07의 해석으로 맞는 것은?
① 5년 안에 발병할 확률이 2.07배
② 다른 조건이 같을 때, 지표가 1 높으면 어느 시점에서든 순간 발병 위험이 약 2.07배
③ 발병까지 시간이 2.07배 길다
④ C-index가 2.07이다

<details><summary>정답 보기</summary>

②. 위험비는 순간 위험(hazard)의 비이며, 누적 확률의 비와는 다릅니다. 사건이 드물 때만 둘이 비슷해집니다.

</details>

**4.** (단답) `concordance_index(time, risk, event)`에 위험 점수를 마이너스 없이 넣으면 어떤 값이 나오나요?

<details><summary>정답 보기</summary>

1 − (올바른 C-index)에 해당하는 값이 나옵니다. 이 함수는 점수가 클수록 오래 산다고 기대하므로, 위험 점수는 부호를 바꿔 넣어야 합니다.

</details>

**5.** (객관식) 다음 중 기준 시점 발병 예측 모델의 특징으로 쓰면 누수인 것은?
① 기준 시점의 나이
② 기준 시점 방문에서 잰 센서 지표
③ 추적 기간 전체의 방문 횟수
④ 기준 시점 이전에 진단된 수면 장애

<details><summary>정답 보기</summary>

③. 방문 횟수는 추적이 길수록, 증상이 생길수록 늘어나 미래의 결과와 얽힌 정보입니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3이 실행되고 출력이 위와 같다.
- [ ] `figures/advanced/H/H5_km.png`에 두 집단의 KM 곡선이 있다.
- [ ] 비례위험 가정 점검과 정보적 중도절단 실험 결과를 적었다.
- [ ] H1 카드에 시간 지평·중도절단·기준 시점 규칙을 추가했다.

## 더 읽을거리
- Kaplan EL, Meier P. Nonparametric estimation from incomplete observations. *J Am Stat Assoc.* 1958;53:457–481. doi:[10.1080/01621459.1958.10501452](https://doi.org/10.1080/01621459.1958.10501452)
- Cox DR. Regression models and life-tables. *J R Stat Soc Series B.* 1972;34:187–202. doi:[10.1111/j.2517-6161.1972.tb00899.x](https://doi.org/10.1111/j.2517-6161.1972.tb00899.x)
- Riley RD, et al. Minimum sample size for developing a multivariable prediction model: Part II — binary and time-to-event outcomes. *Stat Med.* 2019;38:1276–1296. doi:[10.1002/sim.7992](https://doi.org/10.1002/sim.7992) (생존 결과의 표본 수)
- lifelines 문서: <https://lifelines.readthedocs.io/>

---
[← 이전](day-H4.md) · [코스 지도](../../../README.md) · [다음 →](day-H6.md)
