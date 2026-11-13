# Day H3 — 판별력, 보정, 임계값: 숫자 셋을 함께 읽기

> **주차:** 심화 파트 H — 임상 예측·조기진단 ML · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/H/H3_performance.ipynb`, `figures/advanced/H/H3_calibration.png`
>
> **먼저 끝내 둘 레슨:** [Day H2](day-H2.md), [Day 30](../../week-5/day-30.md) (bootstrap 신뢰구간), [Day 34](../../week-5/day-34.md) (ROC·PR, 임계값), [Day E6](../E-ehr/day-E6.md) (보정 절편·기울기)

## 오늘의 목표
- AUC에 참가자 단위 부트스트랩 95% 신뢰구간을 붙여 보고할 수 있다.
- 보정 절편·기울기, 보정 곡선, Brier 점수(와 scaled Brier)를 계산하고, 판별은 같은데 보정만 다른 모델을 구분할 수 있다.
- 놓침(위음성)과 과잉 판정(위양성)의 비용 비율로 임계값을 정하는 원리를 설명하고 계산할 수 있다.

## 🎬 영상으로 먼저 보기

- [ROC and AUC, Clearly Explained! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=4jRBRDbJemM) (16:17)
- **무엇에 주목할까:** ROC 곡선 위의 점 하나하나가 서로 다른 임계값이라는 점을 확인하세요. AUC는 모든 임계값을 한꺼번에 요약한 숫자라서, "어느 임계값을 쓸 것인가"에는 답하지 않습니다. 오늘 예시 3이 그 빈칸을 채웁니다.

- [Bootstrapping Main Ideas!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=Xz0x-8-cgaQ) (9:27)
- **무엇에 주목할까:** 복원 추출로 "같은 크기의 다른 표본"을 흉내 내는 원리를 보세요. 오늘은 행(기록)이 아니라 **참가자**를 복원 추출합니다.

## 개념 설명

### AUC에도 오차 막대가 있다

[Day 34](../../week-5/day-34.md)에서 AUC를 계산했고, [Day E6](../E-ehr/day-E6.md)에서 판별과 보정을 구분했습니다. 오늘은 그 숫자들에 **불확실성**을 붙입니다. 시험 세트 300명에서 얻은 AUC 0.74는 다른 300명을 뽑았다면 0.70일 수도, 0.78일 수도 있었습니다. 시험 세트가 작거나 사건이 적을수록 이 흔들림이 큽니다.

부트스트랩 신뢰구간은 시험 세트의 **참가자**를 복원 추출해 AUC를 수천 번 다시 계산하고, 그 분포의 2.5%와 97.5% 지점을 구간으로 씁니다. 한 사람에게 기록이 여러 개라면 기록이 아니라 사람을 뽑아야 합니다. 기록을 뽑으면 같은 사람의 기록들이 서로 독립인 것처럼 취급되어 구간이 실제보다 좁아집니다([Day 31](../../week-5/day-31.md) 예시 3의 반복 측정 문제와 같은 원리). 두 모델의 AUC를 비교할 때도 각자의 구간만 보지 말고, 같은 부트스트랩 표본에서 **차이**를 계산해 그 구간을 봅니다.

### 보정을 세 층으로 본다

판별(AUC)은 순서를, 보정은 숫자를 봅니다. Van Calster 등(2019)은 보정을 세 수준으로 나눠 보고하라고 권합니다.

- **평균 수준(calibration-in-the-large):** 예측 평균 vs 관찰 비율. 보정 절편으로 요약하며 0이 이상적, 음수면 과대 예측.
- **약한 보정(weak calibration):** 보정 기울기. 1이 이상적, 1보다 작으면 예측이 너무 극단적, 크면 너무 소심.
- **보정 곡선(moderate calibration):** 예측 위험 전 범위에서 관찰 비율이 대각선을 따르는가. 10분위 표([Day E6](../E-ehr/day-E6.md))보다 lowess 같은 매끈한 곡선을 많이 씁니다(Austin & Steyerberg 2014).

**Brier 점수**는 예측 확률과 0/1 결과의 평균 제곱 차이로 판별과 보정을 함께 반영합니다. 다만 유병률에 따라 값의 범위가 달라 집단끼리 직접 비교하기 어렵습니다. 그래서 "평균 위험만 맞히는 모델"의 Brier와 비교한 **scaled Brier**(1 − Brier/Brier_기준)를 함께 쓰기도 합니다(index of prediction accuracy, Kattan & Gerds 2018). 0보다 작으면 평균만 맞히는 것보다 못하다는 뜻입니다.

### 임계값은 통계가 아니라 손익이 정한다

확률을 "다음 검사 의뢰" 같은 행동으로 바꾸려면 임계값이 필요합니다. 흔히 쓰는 Youden 지수(민감도+특이도−1 최대)는 위음성과 위양성을 **같은 무게**로 취급합니다. 그런데 전구기 선별에서 놓친 사람 한 명과 불필요한 정밀 검사 한 건의 무게는 다릅니다.

예측 확률이 잘 보정되어 있다면 깔끔한 결론이 있습니다. 위음성 1건의 비용을 C_FN, 위양성 1건의 비용을 C_FP라 하면, 기대 비용을 최소로 하는 임계값은

  **p\* = C_FP / (C_FP + C_FN)**

입니다. 놓침이 과잉 판정보다 9배 나쁘다고 보면 p\* = 1/10 = 0.1, 즉 "위험 10% 이상이면 다음 검사"입니다. 거꾸로 말하면, 임계값을 정하는 순간 비용 비율에 대한 판단을 이미 한 것입니다. 이 비율은 데이터가 아니라 임상의·환자·연구자가 정하는 값이므로, 보고서에 근거와 함께 적습니다. 이 공식은 **보정이 맞을 때만** 성립합니다. 보정이 틀린 모델에 0.1을 쓰면 실제로는 다른 비용 비율로 판단하게 됩니다. 이 연결이 H4의 결정 곡선으로 이어집니다.

## 예시로 이해하기

세 예시는 같은 가상 자료(개발 800명, 시험 300명)를 씁니다. 예시 2와 3은 예시 1 다음 셀에 이어서 실행합니다.

### 예시 1 — 참가자 단위 부트스트랩 신뢰구간

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, brier_score_loss

rng = np.random.default_rng(4)
def make(n):
    X = rng.normal(size=(n, 3))
    y = rng.random(n) < 1 / (1 + np.exp(-(-1.5 + X @ [1.0, 0.6, 0.3])))
    return X, y.astype(int)

X_dev, y_dev = make(800)
X_te, y_te = make(300)                      # 시험 참가자 300명
m = LogisticRegression().fit(X_dev, y_dev)
p = m.predict_proba(X_te)[:, 1]

# 예시 1 — 참가자 단위 부트스트랩 신뢰구간
auc = roc_auc_score(y_te, p)
boot = []
for b in range(2000):
    i = rng.integers(0, len(y_te), len(y_te))       # 참가자를 복원 추출
    if y_te[i].min() == y_te[i].max():              # 한 군만 뽑히면 AUC를 못 구한다
        continue
    boot.append(roc_auc_score(y_te[i], p[i]))
lo, hi = np.percentile(boot, [2.5, 97.5])
print(f"시험 n={len(y_te)}, 사건 {y_te.sum()}명 | AUC {auc:.3f} (95% 부트스트랩 CI {lo:.3f}–{hi:.3f})")
```

출력:

```text
시험 n=300, 사건 74명 | AUC 0.741 (95% 부트스트랩 CI 0.676–0.801)
```

보고서에는 "AUC 0.741 (95% CI 0.676–0.801)"처럼 씁니다. 구간 폭이 0.12쯤 됩니다. 시험 사건이 74명뿐이라 그렇습니다. 이 구간의 아래쪽 끝(0.68)도 "우리 모델이 이 정도일 수 있다"는 정직한 가능성입니다. 이 예시는 한 사람당 한 줄이라 행 = 사람이지만, 기록이 여러 개라면 사람 ID를 뽑고 그 사람의 모든 행을 가져와야 합니다.

### 예시 2 — AUC는 같고 보정만 다른 세 모델

개발한 모델의 확률을 일부러 변형해 "과신하는" 버전과 "과대 예측하는" 버전을 만듭니다. 순서는 그대로라 AUC는 같습니다.

```python
def logit(p):
    p = np.clip(p, 1e-6, 1 - 1e-6)
    return np.log(p / (1 - p))

def calibration(y, p):
    lp = logit(p)
    slope = sm.Logit(y, sm.add_constant(lp)).fit(disp=0).params[1]
    citl = sm.GLM(y, np.ones((len(y), 1)), family=sm.families.Binomial(), offset=lp).fit().params[0]
    brier = brier_score_loss(y, p)
    scaled = 1 - brier / brier_score_loss(y, np.full(len(y), y.mean()))   # 평균만 맞히는 모델 대비 개선 비율
    return citl, slope, brier, scaled

versions = {"개발한 모델": p,
            "과신(logit×2)": 1 / (1 + np.exp(-2 * logit(p))),
            "과대예측(logit+1)": 1 / (1 + np.exp(-(logit(p) + 1)))}
for name, q in versions.items():
    citl, slope, brier, scaled = calibration(y_te, q)
    print(f"{name:14s} AUC {roc_auc_score(y_te, q):.3f} | 절편 {citl:+.2f} 기울기 {slope:.2f} | "
          f"Brier {brier:.3f} scaled {scaled:+.2f}")
```

출력:

```text
개발한 모델         AUC 0.741 | 절편 +0.08 기울기 0.84 | Brier 0.162 scaled +0.13
과신(logit×2)    AUC 0.741 | 절편 +0.96 기울기 0.42 | Brier 0.178 scaled +0.04
과대예측(logit+1)  AUC 0.741 | 절편 -0.92 기울기 0.84 | Brier 0.192 scaled -0.03
```

세 줄의 AUC가 모두 0.741입니다. AUC만 보고했다면 세 모델은 구분되지 않습니다.

- **개발한 모델:** 절편 +0.08, 기울기 0.84. 기울기가 1보다 약간 작지만 시험 300명의 흔들림 안에 있을 수 있습니다(직접 해보기 3에서 부트스트랩 구간을 구해 봅니다).
- **과신 모델:** 기울기 0.42. 확률을 0과 1 쪽으로 밀어 낸 결과입니다. 이 자료처럼 사건이 드문 편이면 대부분의 예측이 0 쪽으로 밀려 평균도 과소 예측(절편 +0.96)이 됩니다.
- **과대 예측 모델:** 절편 −0.92. 모든 사람의 위험을 부풀렸습니다. scaled Brier가 −0.03으로 음수, 즉 "모두에게 평균 위험을 말하는 것"보다 나쁩니다.

### 예시 3 — 오진 비용 비율로 임계값 정하기

```python
# 예시 3 — 오진 비용 비율로 임계값 정하기
def expected_cost(y, q, thr, c_fn, c_fp):
    pos = q >= thr
    fn = np.sum(~pos & (y == 1)); fp = np.sum(pos & (y == 0))
    return (c_fn * fn + c_fp * fp) / len(y)

thr_grid = np.round(np.arange(0.05, 0.80, 0.05), 2)
for c_fn, c_fp in [(1, 1), (4, 1), (9, 1)]:          # 놓침(FN) 1건이 위양성(FP) 1건보다 몇 배 나쁜가
    costs = [expected_cost(y_te, p, t, c_fn, c_fp) for t in thr_grid]
    best = thr_grid[int(np.argmin(costs))]
    theory = c_fp / (c_fp + c_fn)
    pos = p >= best
    print(f"FN:FP = {c_fn}:{c_fp} | 이론 임계값 {theory:.2f} | 시험에서 비용 최소 {best:.2f} | "
          f"민감도 {pos[y_te == 1].mean():.2f} 특이도 {(~pos)[y_te == 0].mean():.2f} 양성 비율 {pos.mean():.2f}")
```

출력:

```text
FN:FP = 1:1 | 이론 임계값 0.50 | 시험에서 비용 최소 0.50 | 민감도 0.27 특이도 0.94 양성 비율 0.11
FN:FP = 4:1 | 이론 임계값 0.20 | 시험에서 비용 최소 0.15 | 민감도 0.88 특이도 0.48 양성 비율 0.61
FN:FP = 9:1 | 이론 임계값 0.10 | 시험에서 비용 최소 0.15 | 민감도 0.88 특이도 0.48 양성 비율 0.61
```

비용이 같을 때(1:1) 임계값 0.5에서 민감도는 0.27뿐입니다. 사건이 드문 자료에서 "확률 50% 이상만 양성"은 대부분을 놓치는 선택입니다. 놓침을 4배, 9배 무겁게 보면 최적 임계값이 내려가고 민감도가 0.88까지 오르는 대신 양성 판정이 61%로 늘어납니다. 9:1에서 시험 세트의 최적값(0.15)이 이론값(0.10)과 다른 것은 300명짜리 시험 세트의 잡음과 0.05 간격의 격자 때문입니다. 시험 세트에서 고른 임계값을 같은 시험 세트로 평가하면 낙관적이므로, 임계값은 개발 단계에서 정하고 시험에서는 확인만 합니다.

## 직접 해보기

1. `notebooks/advanced/H/H3_performance.ipynb`에서 예시 1–3을 실행합니다.
2. 보정 곡선을 그립니다. 예시 2 다음 셀에 붙여 넣습니다.

```python
import matplotlib.pyplot as plt
from pathlib import Path
from statsmodels.nonparametric.smoothers_lowess import lowess

out = Path("../../../figures/advanced/H"); out.mkdir(parents=True, exist_ok=True)
fig, ax = plt.subplots(figsize=(4.8, 4.8))
eng = {"개발한 모델": "developed", "과신(logit×2)": "overconfident", "과대예측(logit+1)": "over-predicting"}
for name, q in versions.items():
    sm_curve = lowess(y_te, q, frac=0.6, return_sorted=True)       # 매끈한 보정 곡선
    ax.plot(sm_curve[:, 0], sm_curve[:, 1], label=eng[name])
ax.plot([0, 1], [0, 1], "k--", lw=1, label="perfect")
ax.set_xlabel("predicted risk"); ax.set_ylabel("observed proportion (lowess)")
ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.legend(fontsize=8)
fig.tight_layout(); fig.savefig(out / "H3_calibration.png", dpi=150)
print("saved", out / "H3_calibration.png")
```

그림에서 과신 모델의 곡선이 대각선보다 **눕는지(기울기<1)**, 과대 예측 모델이 대각선 **아래로 평행 이동**하는지 확인합니다.
3. 예시 2의 `calibration` 함수를 예시 1의 부트스트랩 반복 안에 넣어, 개발한 모델의 보정 기울기 95% 구간을 구합니다. 1을 포함하는지 적습니다.
4. 두 모델 비교: `X_dev[:, :2]`(변수 2개)만 쓴 모델을 하나 더 만들고, 같은 부트스트랩 인덱스 `i`에서 두 모델의 AUC **차이**를 계산해 95% 구간을 구합니다.
5. 여러분의 H1 카드에 맞는 비용 비율(C_FN:C_FP)을 정하고 근거를 한 문장으로 씁니다. 그 비율에 해당하는 임계값을 계산해 노트북에 적습니다.

⚠️ **흔한 오류 1 — 부트스트랩 표본에 한 군만 뽑혀 `ValueError: Only one class present`**
사건이 적은 시험 세트에서 생깁니다. 예시 1처럼 한 군만 뽑힌 표본은 건너뛰고, 건너뛴 횟수가 많다면 시험 세트가 너무 작다는 신호로 기록합니다.

⚠️ **흔한 오류 2 — 보정 곡선이 들쭉날쭉하다**
lowess의 `frac`가 너무 작거나 시험 세트가 작으면 곡선이 잡음을 따라갑니다. `frac`를 키우거나 10분위 점을 함께 그리고, 곡선 아래에 예측 확률의 분포(히스토그램)를 덧붙이면 "자료가 없는 구간의 곡선"을 과신하지 않게 됩니다.

## 퀴즈

**1.** (객관식) 시험 세트에 한 사람당 기록이 5개 있습니다. AUC 부트스트랩 구간을 기록 단위로 만들면?
① 구간이 실제보다 넓어진다 ② 구간이 실제보다 좁아진다 ③ 차이가 없다 ④ AUC 값이 바뀐다

<details><summary>정답 보기</summary>

②. 같은 사람의 기록들은 서로 닮아서 독립 정보가 5배가 아닙니다. 기록을 독립처럼 뽑으면 불확실성을 과소평가합니다.

</details>

**2.** (단답) 예시 2에서 세 모델의 AUC가 같은 이유는?

<details><summary>정답 보기</summary>

logit에 2를 곱하거나 1을 더하는 것은 순서를 바꾸지 않는 단조 변환이고, AUC는 순서만 보기 때문입니다.

</details>

**3.** (객관식) scaled Brier가 음수라는 것은?
① 판별력이 완벽하다
② 모든 사람에게 평균 위험을 말하는 것보다 예측이 나쁘다
③ 보정 기울기가 1이다
④ 유병률이 낮다

<details><summary>정답 보기</summary>

②. scaled Brier는 평균만 맞히는 기준 모델 대비 개선 비율이므로, 음수면 기준보다 못합니다.

</details>

**4.** (단답) 놓침이 과잉 판정보다 4배 나쁘다고 판단했습니다. 잘 보정된 모델에서 기대 비용을 최소화하는 임계값은?

<details><summary>정답 보기</summary>

1/(1+4) = 0.2. 위험이 20% 이상이면 양성으로 판정합니다. 이 결론은 예측 확률이 잘 보정되어 있을 때만 성립합니다.

</details>

**5.** (객관식) Youden 지수로 고른 임계값의 숨은 가정은?
① 유병률이 50%다
② 민감도와 특이도를 같은 무게로 본다
③ 보정이 완벽하다
④ 표본이 크다

<details><summary>정답 보기</summary>

②. 민감도+특이도를 최대화하므로 두 오류를 같은 무게로 취급합니다. 임상적 비용이 다르면 다른 임계값이 맞습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3이 실행되고 출력이 위와 같다.
- [ ] `figures/advanced/H/H3_calibration.png`에 세 모델의 보정 곡선이 있다.
- [ ] 보정 기울기의 부트스트랩 구간과 두 모델 AUC 차이의 구간을 구했다.
- [ ] 내 문제의 비용 비율과 그에 해당하는 임계값을 근거와 함께 적었다.

## 더 읽을거리
- Van Calster B, et al. Calibration: the Achilles heel of predictive analytics. *BMC Med.* 2019;17. doi:[10.1186/s12916-019-1466-7](https://doi.org/10.1186/s12916-019-1466-7)
- Austin PC, Steyerberg EW. Graphical assessment of internal and external calibration of logistic regression models by using loess smoothers. *Stat Med.* 2014;33:517–535. doi:[10.1002/sim.5941](https://doi.org/10.1002/sim.5941)
- Kattan MW, Gerds TA. The index of prediction accuracy: an intuitive measure useful for evaluating risk prediction models. *Diagn Progn Res.* 2018;2. doi:[10.1186/s41512-018-0029-2](https://doi.org/10.1186/s41512-018-0029-2)
- scikit-learn 문서, Probability calibration: <https://scikit-learn.org/stable/modules/calibration.html>

---
[← 이전](day-H2.md) · [코스 지도](../../../README.md) · [다음 →](day-H4.md)
