# Day H4 — 임상적 유용성: 결정 곡선과 순 이득

> **주차:** 심화 파트 H — 임상 예측·조기진단 ML · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/H/H4_decision_curve.ipynb`, `figures/advanced/H/H4_decision_curve.png`
>
> **먼저 끝내 둘 레슨:** [Day H3](day-H3.md) (보정과 비용 비율로 정한 임계값)

## 오늘의 목표
- 순 이득(net benefit)의 식을 말로 풀어 설명하고, numpy로 직접 계산할 수 있다.
- 결정 곡선(decision curve)을 그려 모델을 "모두 검사"·"아무도 검사 안 함" 전략과 비교할 수 있다.
- AUC가 같아도 보정이 틀린 모델이 특정 임계값 범위에서 "아무것도 안 하는 것"보다 해로울 수 있음을 보여 줄 수 있다.

## 🎬 영상으로 먼저 보기

- [decision curve analysis net benefit — YouTube 검색](https://www.youtube.com/results?search_query=decision+curve+analysis+net+benefit) (검색 링크)
- **무엇에 주목할까:** 결정 곡선 분석을 설명하는 강연이나 튜토리얼을 하나 골라, 가로축이 "임계 확률"이고 세로축이 "순 이득"이며 기준선이 두 개(모두 치료, 아무도 치료 안 함)라는 구성을 확인하세요. 검증된 단일 영상을 찾지 못해 검색 링크로 둡니다.

## 개념 설명

### AUC가 답하지 못하는 질문: "이걸 쓰면 더 나아지나?"

H3까지의 숫자들(AUC, 보정, Brier)은 모두 "예측이 얼마나 맞는가"를 잽니다. 임상에서 묻는 것은 한 단계 더 나아갑니다. **이 모델을 보고 행동을 바꾸면, 모델 없이 행동할 때보다 결과가 나아지는가?** 예를 들어 "위험이 높으면 정밀 검사 의뢰"라는 정책을 생각해 봅시다. 비교 대상은 "모델이 없는 세상"인데, 거기서도 할 수 있는 단순한 전략이 둘 있습니다. 모두에게 정밀 검사를 하거나(treat all), 아무에게도 하지 않는 것(treat none)입니다. 모델은 적어도 이 둘보다 나아야 쓸 이유가 있습니다.

Vickers와 Elkin(2006)이 제안한 **결정 곡선 분석(decision curve analysis, DCA)** 은 이 비교를 하나의 그림으로 보여 줍니다. 핵심 재료는 H3에서 배운 사실, 즉 **임계 확률 p_t를 고르는 것은 위양성과 위음성의 비용 비율을 고르는 것**이라는 사실입니다.

### 순 이득: 진양성에서 위양성의 "환율"을 뺀다

임계 확률 p_t에서의 순 이득은 다음과 같습니다(n = 전체 인원).

  **순 이득 = TP/n − FP/n × p_t/(1 − p_t)**

말로 풀면 이렇습니다. 모델이 양성이라고 한 사람 중 진짜 환자(TP)는 이득입니다. 진짜 환자가 아닌 사람(FP)은 손해인데, 그 손해를 진양성 단위로 바꾸는 **환율**이 p_t/(1 − p_t)입니다. p_t = 0.1이면 환율이 1/9이라서 위양성 9건이 진양성 1건의 이득을 상쇄합니다. "놓침이 과잉 판정보다 9배 나쁘다"는 H3의 판단과 같은 말입니다.

순 이득의 단위는 "100명당 순수하게 찾아낸 환자 수"로 읽을 수 있습니다. 순 이득 0.05는 위양성 비용을 빼고도 100명당 5명의 환자를 찾아낸 것과 같은 가치라는 뜻입니다.

- **아무도 검사 안 함:** TP = FP = 0이라 모든 p_t에서 순 이득 0.
- **모두 검사:** TP/n = 유병률, FP/n = 1 − 유병률. 임계 확률이 낮을 때(놓침이 매우 나쁠 때)는 꽤 좋지만, 임계 확률이 유병률을 넘으면 음수가 됩니다.

### 곡선을 읽는 법과 읽지 말아야 할 것

결정 곡선은 p_t를 가로축에 놓고 각 전략의 순 이득을 그립니다. 읽는 순서는 이렇습니다.

1. **합리적인 p_t 범위부터 정한다.** 전구기 선별에서 정밀 검사 의뢰를 생각한다면, 임상적으로 납득할 만한 임계 확률은 대략 어느 범위인가? 0.5 같은 높은 값은 대개 의미가 없습니다. 이 범위는 데이터를 보기 전에 정합니다.
2. **그 범위에서 모델 곡선이 두 기준선보다 위에 있는가?** 위에 있으면 그 범위의 선호를 가진 사람에게 모델이 도움이 됩니다.
3. **모델끼리 비교한다.** 같은 범위에서 더 높은 곡선이 더 유용합니다.

결정 곡선은 "이 모델을 승인해야 한다"는 증거가 아니라, 주어진 데이터에서 **잠재적** 유용성을 보는 도구입니다. 실제 이득은 모델을 쓴 뒤의 행동과 그 결과(정밀 검사의 정확도, 조기 발견의 실제 가치 등)에 달려 있고, 그것은 전향적 연구로 확인합니다(Vickers 등 2016). 그리고 순 이득 계산은 예측 확률을 **그대로** 믿고 임계값을 적용하므로, 보정이 틀린 모델은 여기서 벌을 받습니다. 예시 1이 이것을 보여 줍니다.

## 예시로 이해하기

### 예시 1 — numpy로 순 이득 계산하기

같은 가상 모집단에서 세 가지 모델을 비교합니다. "good"은 개발 자료로 맞춘 로지스틱 회귀, "over"는 순서는 같지만 위험을 크게 부풀린 버전(다른 집단에서 개발된 모델을 그대로 가져온 상황을 흉내), "weak"는 판별도 약하고 보정도 어긋난 버전입니다.

```python
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

rng = np.random.default_rng(5)
def make(n):
    X = rng.normal(size=(n, 3))
    y = rng.random(n) < 1 / (1 + np.exp(-(-2.0 + X @ [1.0, 0.7, 0.4])))   # 유병률 약 20%
    return X, y.astype(int)

X_dev, y_dev = make(1000)
X_te, y_te = make(2000)
p_good = LogisticRegression().fit(X_dev, y_dev).predict_proba(X_te)[:, 1]
lp = np.log(p_good / (1 - p_good))
p_over = 1 / (1 + np.exp(-(lp + 1.5)))          # 같은 순서, 위험을 크게 부풀린 버전(다른 기관에서 개발된 모델이라 가정)
p_weak = 1 / (1 + np.exp(-(0.3 * lp - 1.0)))    # 판별도 약하고 보정도 어긋난 버전에 잡음을 더함
p_weak = np.clip(p_weak + rng.normal(0, 0.05, len(p_weak)), 0.001, 0.999)

def net_benefit(y, p, pt):
    """임계 확률 pt에서 '양성이면 다음 검사를 한다'는 전략의 순 이득."""
    n = len(y)
    pos = p >= pt
    tp = np.sum(pos & (y == 1)); fp = np.sum(pos & (y == 0))
    return tp / n - fp / n * pt / (1 - pt)

def treat_all(y, pt):
    prev = y.mean()
    return prev - (1 - prev) * pt / (1 - pt)

print(f"유병률 {y_te.mean():.3f} | AUC good {roc_auc_score(y_te, p_good):.3f}, "
      f"over {roc_auc_score(y_te, p_over):.3f}, weak {roc_auc_score(y_te, p_weak):.3f}")
print("  pt  | 모두 검사  아무도 안 함 | good    over    weak")
for pt in [0.05, 0.10, 0.20, 0.30, 0.40]:
    print(f" {pt:.2f} |  {treat_all(y_te, pt):+.3f}     +0.000    | "
          f"{net_benefit(y_te, p_good, pt):+.3f}  {net_benefit(y_te, p_over, pt):+.3f}  {net_benefit(y_te, p_weak, pt):+.3f}")
```

출력:

```text
유병률 0.170 | AUC good 0.800, over 0.800, weak 0.739
  pt  | 모두 검사  아무도 안 함 | good    over    weak
 0.05 |  +0.126     +0.000    | +0.134  +0.128  +0.128
 0.10 |  +0.078     +0.000    | +0.104  +0.089  +0.089
 0.20 |  -0.037     +0.000    | +0.065  +0.017  +0.047
 0.30 |  -0.186     +0.000    | +0.033  -0.050  +0.024
 0.40 |  -0.383     +0.000    | +0.026  -0.105  +0.003
```

- **good**은 모든 임계 확률에서 두 기준선보다 높습니다.
- **over**는 good과 AUC가 **똑같이** 0.800인데, p_t = 0.30에서 순 이득 −0.050, 0.40에서 −0.105입니다. "아무도 검사 안 함"(0)보다 나쁩니다. 위험을 부풀려서 임계값을 넘는 사람이 너무 많아지고, 그만큼 위양성이 쌓였기 때문입니다. 판별력은 좋은데 해로운 모델이 가능하다는 뜻입니다.
- **weak**는 AUC가 0.739로 낮지만, p_t = 0.2–0.3에서는 over보다 낫습니다. 순 이득은 판별과 보정을 함께 반영합니다.
- p_t = 0.05처럼 매우 낮은 임계 확률에서는 모든 모델이 "모두 검사"(+0.126)와 거의 같습니다. 놓침을 극단적으로 싫어하면 사실상 모두 검사하게 되므로 모델이 더할 정보가 적습니다.

### 예시 2 — 보정만 고치면 순 이득이 돌아온다

예시 1 다음 셀에 이어서 실행합니다. 과대 예측 모델을, 시험에 쓰지 않은 별도 자료 500명으로 절편만 재보정합니다([Day E6](../E-ehr/day-E6.md)의 재보정).

```python

# 예시 2 — 과대 예측 모델을 별도 자료 500명으로 절편만 재보정하면
import statsmodels.api as sm
model_good = LogisticRegression().fit(X_dev, y_dev)
X_cal, y_cal = make(500)
q = model_good.predict_proba(X_cal)[:, 1]
lp_cal = np.log(q / (1 - q)) + 1.5            # 재보정용 자료에서 과대 예측 모델이 내놓는 logit
shift = sm.GLM(y_cal, np.ones((500, 1)), family=sm.families.Binomial(), offset=lp_cal).fit().params[0]
p_fixed = 1 / (1 + np.exp(-(np.log(p_over / (1 - p_over)) + shift)))
print(f"추정한 절편 보정량 {shift:+.2f} | 예측 평균: 과대 {p_over.mean():.3f} → 재보정 {p_fixed.mean():.3f} (관찰 {y_te.mean():.3f})")
for pt in [0.10, 0.20, 0.30, 0.40]:
    print(f" pt {pt:.2f} | over {net_benefit(y_te, p_over, pt):+.3f} → 재보정 {net_benefit(y_te, p_fixed, pt):+.3f} | good {net_benefit(y_te, p_good, pt):+.3f}")
```

출력:

```text
추정한 절편 보정량 -1.73 | 예측 평균: 과대 0.442 → 재보정 0.177 (관찰 0.170)
 pt 0.10 | over +0.089 → 재보정 +0.107 | good +0.104
 pt 0.20 | over +0.017 → 재보정 +0.065 | good +0.065
 pt 0.30 | over -0.050 → 재보정 +0.038 | good +0.033
 pt 0.40 | over -0.105 → 재보정 +0.029 | good +0.026
```

절편 보정량 −1.73이 추정되었습니다(실제로 부풀린 양은 +1.5, 차이는 500명 표본의 잡음). 재보정 후 예측 평균이 0.177로 관찰 0.170에 가까워졌고, 순 이득이 good 모델 수준으로 돌아왔습니다. 판별(순서)은 처음부터 좋았으므로, 숫자만 맞추면 유용성이 회복됩니다. 거꾸로 말해, 다른 곳에서 만든 모델을 가져올 때 **판별만 확인하고 보정을 확인하지 않으면** 해로운 결정을 내릴 수 있습니다. H6에서 이 상황을 기관 차이로 다시 만납니다.

## 직접 해보기

1. `notebooks/advanced/H/H4_decision_curve.ipynb`에서 예시 1–2를 실행합니다.
2. 결정 곡선을 그립니다. 예시 1 다음 셀에 붙여 넣습니다.

```python
import matplotlib.pyplot as plt
from pathlib import Path

out = Path("../../../figures/advanced/H"); out.mkdir(parents=True, exist_ok=True)
pts = np.arange(0.01, 0.61, 0.01)
fig, ax = plt.subplots(figsize=(6, 4))
ax.plot(pts, [treat_all(y_te, t) for t in pts], color="gray", label="treat all")
ax.axhline(0, color="black", lw=1, label="treat none")
for name, q in [("calibrated model", p_good), ("over-predicting (same AUC)", p_over), ("weak model", p_weak)]:
    ax.plot(pts, [net_benefit(y_te, q, t) for t in pts], label=name)
ax.set_ylim(-0.05, y_te.mean() + 0.02)
ax.set_xlabel("threshold probability"); ax.set_ylabel("net benefit")
ax.legend(fontsize=8); fig.tight_layout()
fig.savefig(out / "H4_decision_curve.png", dpi=150)
print("saved", out / "H4_decision_curve.png")
```

그림에서 over 곡선이 "treat none" 선(0) 아래로 내려가는 임계 확률을 읽어 적습니다.

3. `net_benefit` 함수가 맞는지 손으로 확인합니다. 10명 중 환자 3명, 모델이 4명을 양성으로 판정했고 그중 2명이 환자라면 p_t = 0.25에서 순 이득은? 손으로 계산한 값과 `net_benefit(np.array([1,1,1,0,0,0,0,0,0,0]), np.array([.9,.8,.1,.7,.6,.1,.1,.1,.1,.1]), 0.25)`의 값을 비교합니다.
4. 순 이득을 "100명당 추가로 찾아낸 환자 수"로 바꿔, good 모델이 p_t = 0.2에서 "모두 검사"보다 몇 명분 나은지 한 문장으로 씁니다.
5. 여러분의 H1 카드에 "합리적인 임계 확률 범위"를 추가합니다. 범위와 근거(무엇과 무엇의 비용을 비교했는가)를 적습니다.

⚠️ **흔한 오류 1 — p_t = 1에서 0으로 나누기 경고**
환율 p_t/(1 − p_t)는 p_t = 1에서 정의되지 않습니다. 가로축은 0.01부터 임상적으로 의미 있는 상한(예: 0.6)까지만 그립니다.

⚠️ **흔한 오류 2 — 결정 곡선을 그린 뒤에 "좋아 보이는" 범위를 고른다**
곡선이 위에 있는 구간을 골라 "이 범위에서 유용하다"고 쓰면 순환 논리입니다. 범위는 H1 카드처럼 분석 전에 적어 둡니다.

## 퀴즈

**1.** (단답) p_t = 0.2일 때 위양성 몇 건이 진양성 1건의 이득을 상쇄하나요?

<details><summary>정답 보기</summary>

4건. 환율이 0.2/0.8 = 1/4이므로 위양성 1건은 진양성 0.25건만큼의 손해로 계산됩니다.

</details>

**2.** (객관식) "모두 검사" 전략의 순 이득이 0이 되는 임계 확률은?
① 0.5 ② 유병률과 같은 값 ③ 0 ④ 1 − 유병률

<details><summary>정답 보기</summary>

②. 유병률 − (1 − 유병률) × p_t/(1 − p_t) = 0을 풀면 p_t = 유병률입니다. 예시 1에서도 유병률 0.17 근처에서 부호가 바뀝니다.

</details>

**3.** (객관식) 예시 1의 over 모델에 대한 설명으로 맞는 것은?
① AUC가 낮아서 해롭다
② AUC는 good과 같지만 보정이 틀려 일부 임계 확률에서 아무것도 안 하는 것보다 해롭다
③ 모든 임계 확률에서 good보다 낫다
④ 순 이득은 보정과 무관하다

<details><summary>정답 보기</summary>

②. 순 이득은 예측 확률에 임계값을 그대로 적용하므로 보정 오류가 위양성 증가로 이어집니다.

</details>

**4.** (단답) 결정 곡선에서 모델이 기준선보다 위에 있다는 것만으로 "이 모델을 진료에 써야 한다"고 결론 내릴 수 없는 이유 하나는?

<details><summary>정답 보기</summary>

예: 실제 이득은 모델 사용 후의 행동과 결과(후속 검사 정확도, 조기 발견의 실제 효과, 부작용 등)에 달려 있어 전향적 평가가 필요하다. 또는 이 데이터의 유병률·집단에서만 계산된 값이라 다른 집단에서 달라질 수 있다.

</details>

**5.** (객관식) 순 이득 0.03의 해석으로 가장 적절한 것은?
① 정확도 3%
② 위양성 비용을 고려하고도 100명당 환자 3명을 찾아낸 것과 같은 가치
③ AUC가 0.03 높다
④ 3%의 환자에게 해롭다

<details><summary>정답 보기</summary>

②. 순 이득은 진양성 단위로 환산한 이득입니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–2가 실행되고 출력이 위와 같다.
- [ ] `figures/advanced/H/H4_decision_curve.png`에 세 모델과 두 기준선이 있다.
- [ ] 손 계산으로 `net_benefit` 함수를 확인했다.
- [ ] H1 카드에 합리적인 임계 확률 범위와 근거를 추가했다.

## 더 읽을거리
- Vickers AJ, Elkin EB. Decision curve analysis: a novel method for evaluating prediction models. *Med Decis Making.* 2006;26:565–574. doi:[10.1177/0272989X06295361](https://doi.org/10.1177/0272989X06295361)
- Vickers AJ, Van Calster B, Steyerberg EW. Net benefit approaches to the evaluation of prediction models, molecular markers, and diagnostic tests. *BMJ.* 2016;352:i6. doi:[10.1136/bmj.i6](https://doi.org/10.1136/bmj.i6)
- 결정 곡선 분석 튜토리얼과 코드(R·Stata·Python): <https://mskcc-epi-bio.github.io/decisioncurveanalysis/>

---
[← 이전](day-H3.md) · [코스 지도](../../../README.md) · [다음 →](day-H5.md)
