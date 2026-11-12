# Day D4 — 한 사람의 GLM: HRF convolution, 설계 행렬, contrast, 잡음과 자기상관

> **주차:** 심화 파트 D — fMRI 데이터 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/D/D4_first_level_glm.ipynb`, `figures/advanced/D/D4_design_matrix.png`
>
> **먼저 끝내 둘 레슨:** Day D1–D2, Day 9 (효과크기·신뢰구간·p-value), Day 23 (시계열, 자기상관), Day 29 (회귀 모델 고르기), Day 31 (공변량).

## 오늘의 목표
- 자극 시각표를 HRF와 convolution해 예측 BOLD 회귀변수를 만들고, 설계 행렬을 구성할 수 있다.
- GLM으로 β를 추정하고 contrast 벡터로 t 값을 계산할 수 있다.
- drift와 시간 자기상관을 무시하면 거짓 양성이 늘어나는 이유를 설명하고, high-pass 필터와 prewhitening의 역할을 구분할 수 있다.

## 🎬 영상으로 먼저 보기

- [Principles of fMRI Part 1 Module 15: The General Linear Model - Intro — Principles of fMRI](https://www.youtube.com/watch?v=GDkLQuV4he4) (12:25)
- **무엇에 주목할까:** "자료 = 설계 행렬 × β + 잡음"이라는 한 줄짜리 식이 fMRI의 거의 모든 분석을 담는다는 점, 그리고 voxel마다 같은 회귀를 반복한다는(mass-univariate) 점을 붙잡으세요.

- [Learn fMRI W06 (Monti, UCLA) 04 Single Subject Analysis: The Hemodynamic Response Function (pt 1) — Brain Talk](https://www.youtube.com/watch?v=5xOcPxSNeRY) (8:12)
- **무엇에 주목할까:** HRF의 봉우리 시각, 폭, 늦은 골(undershoot)이 무엇을 뜻하는지, 그리고 그 모양이 사람과 영역마다 다르다는 점을 들어 보세요. 예시 1의 숫자로 이어집니다.

## 개념 설명

### HRF와 convolution: 자극 시각표를 "예측 BOLD"로 바꾸기

아주 짧은 자극 하나에 대한 BOLD의 이상적인 반응 모양을 **혈류역학 반응 함수**(hemodynamic response function, HRF)라 합니다. 1–2초 뒤에 오르기 시작해 4–6초 근처에서 꼭대기에 닿고, 다시 내려와 기준선 아래로 얕게 꺼졌다가(undershoot) 15–20초 뒤에야 돌아옵니다. 봉우리 크기는 감각 자극에서도 몇 %이고, 인지 과제에서는 0.1–0.5% 정도로 작습니다.

D1에서 본 대로 신경 활동과 BOLD 사이가 대략 **선형이고 시간에 대해 불변**(linear time-invariant)이라면, 긴 자극에 대한 반응은 짧은 반응들을 시간을 밀어 가며 더한 것과 같습니다. 이 "밀어 가며 더하기"가 **convolution**입니다. 그래서 자극이 켜진 시각에 1, 꺼진 시각에 0인 시계열(boxcar 또는 막대 함수)을 HRF와 convolution하면 예측 BOLD 곡선이 나옵니다. 비유하면 HRF는 종 한 번 쳤을 때의 울림이고, convolution은 여러 번 친 종소리가 겹쳐 들리는 모양을 계산하는 일입니다.

실무 세부 둘이 있습니다. 첫째, 사건은 TR 경계에 딱 맞춰 일어나지 않으므로 0.1초 같은 **고해상도 시간 격자에서 convolution한 뒤 TR 간격으로 뽑습니다.** TR 해상도에서 바로 계산하면 1초짜리 자극과 3초짜리 자극을 구별하지 못합니다. 둘째, 표준 HRF로는 봉우리와 undershoot를 함께 그리는 **이중 감마**(double gamma) 함수를 흔히 씁니다. 감마 하나만 쓰면 undershoot가 기준선을 끌어내려 효과를 작게 추정할 수 있습니다.

### HRF 모양이 다를 때: 도함수, FIR, 제약된 기저 — 편향과 분산의 거래

HRF는 사람과 영역마다 다르고, 노화 집단에서는 반응의 신호 대 잡음비가 낮다는 보고도 있습니다. 표준 HRF 하나만 쓰면 그 모양과 비슷한 반응만 잘 찾는 **편향**(bias)이 생깁니다. 대안은 여러 **기저 함수**(basis functions)를 함께 넣는 것입니다.

- **표준 HRF + 시간 도함수**: 봉우리가 조금 이르거나 늦은 반응을 잡아 줍니다. 가장 흔한 선택입니다.
- **FIR**(finite impulse response) 모형: 자극 뒤 시점마다 따로 β를 추정해 모양을 가정하지 않습니다. 대신 추정할 모수가 많아 흔들림(**분산**, variance)이 커집니다. 모양 자체를 연구할 때 알맞고, 활성 검출이 목적이면 불리합니다. FIR 결과 중 한 시점만 골라 집단 분석에 넘기면 "봉우리가 그 시점"이라는 가정을 다시 하는 셈입니다.
- **제약된 기저**: 그럴듯한 HRF 모양들의 공통 성분 몇 개로 만든 기저입니다. 두 극단 사이의 절충입니다.

결론은 "작은 편향을 받아들이고 큰 분산을 줄이는 편이 대개 낫다"입니다. Day 32에서 단순한 모델이 복잡한 모델보다 새 자료에서 더 잘 맞을 수 있었던 것과 같은 이야기입니다.

### 설계 행렬과 contrast: 무엇을 넣고, 무엇을 묻는가

**설계 행렬**(design matrix) X는 행이 시점, 열이 회귀변수입니다. 흔히 들어가는 열은 다음과 같습니다.

- 조건별 과제 회귀변수(convolution한 것)와 필요하면 그 도함수.
- **매개 변조**(parametric modulation) 회귀변수: 시행마다 자극 강도나 보상 크기처럼 바뀌는 값을 막대 높이로 준 것. 값은 **평균을 빼서**(demean) 넣고, 변조하지 않은 회귀변수도 반드시 함께 넣습니다. 회귀에서 기울기만 넣고 절편을 빼지 않는 것과 같은 이유입니다.
- 반응 시간(RT): 오래 걸린 시행은 그만큼 BOLD가 커지므로, 조건 차이가 사실은 "시간을 더 쓴 차이"일 수 있습니다. 일정한 길이의 회귀변수에 RT 변조 회귀변수를 더하는 방법이 권장됩니다.
- **방해 회귀변수**(nuisance regressors): 움직임 6개(와 도함수), D2의 spike 회귀변수, drift를 잡는 느린 코사인(DCT) 함수, 절편.

GLM은 각 회귀변수가 **고유하게** 설명하는 변동만으로 그 β를 추정합니다. 두 회귀변수가 많이 겹치면(예: 자극 바로 뒤에 늘 반응이 옴) 각 β가 크게 흔들립니다. 겹친 부분을 한쪽에 몰아주는 **직교화**(orthogonalization)는 결과를 연구자의 선택에 따라 바꿔 버리므로, 시간 도함수처럼 보조 역할이 분명한 경우 외에는 권하지 않습니다. 설계 행렬의 한 열이 다른 열들의 선형 결합이면(rank deficient) β는 하나로 정해지지 않습니다.

β를 추정한 뒤 질문은 **contrast** 벡터 c로 표현합니다. "조건 A 효과가 0인가"는 c = [0, 1, 0, …], "A가 B보다 큰가"는 c = [0, 1, −1, …]입니다. t 값은 cβ̂를 그 표준오차로 나눈 값이고, 여러 contrast를 한꺼번에 묻고 싶을 때(예: 세 조건 중 어디든 차이가 있나)는 F 검정을 씁니다. 같은 GLM 틀로 one-sample t, two-sample t, paired t, ANOVA, ANCOVA를 모두 표현할 수 있어서 "일반" 선형 모형이라 부릅니다.

### 잡음: drift, 자기상관, 그리고 설계

fMRI 잡음은 하얀 잡음이 아닙니다. 스캐너 불안정과 생리 요동 때문에 **느린 흐름**(drift)이 늘 있고, 주파수가 낮을수록 힘이 커지는 1/f 모양을 보입니다. 시체나 물 모형을 찍어도 남으므로 스캐너 자체에서도 옵니다. 대응은 두 단계입니다.

1. **High-pass 필터**: DCT 기저를 설계 행렬에 넣거나(SPM 방식) 국소 회귀 곡선을 빼서(FSL 방식) 느린 흐름을 제거합니다. 이때 과제 주파수까지 지우면 안 되므로, **과제 주기를 충분히 빠르게** 설계해야 합니다. 대략 켜짐–꺼짐 한 주기가 1분 남짓보다 짧아야(블록 하나 약 35–40초 이내) drift와 구별됩니다. 아주 느린 효과를 보고 싶다면 drift가 적은 ASL 같은 다른 측정법을 고려합니다.
2. **Prewhitening**: 필터 뒤에도 이웃 시점끼리 닮는 **시간 자기상관**(autocorrelation)이 남습니다. GLM의 표준오차 공식은 오차가 서로 독립이라고 가정하므로, 이를 무시하면 표준오차가 작게 계산되어 t가 부풀고 거짓 양성이 늘어납니다(예시 2). 잔차로 자기상관 구조(AR(1) 등)를 추정한 뒤 자료와 설계 행렬을 함께 변환해 오차를 독립에 가깝게 만드는 것이 prewhitening입니다. 소프트웨어마다 추정 방식이 다릅니다(뇌 전체에서 하나를 추정하거나, voxel마다 추정해 공간적으로 매끄럽게 하기). 반대로 일부러 시간 smoothing을 걸어 상관을 "알려진 값"으로 덮는 precoloring은 과제 신호의 높은 주파수를 지워 지금은 권하지 않습니다.

설계도 잡음만큼 중요합니다. 같은 시간을 써도 **검출**(detection: 효과가 있나)에는 블록 설계가 유리하고, **추정**(estimation: HRF 모양이 어떤가)에는 시행 간격을 무작위로 흔든 사건 관련 설계가 유리합니다. 두 사건이 늘 같은 짧은 간격으로 붙어 나오면 회귀변수가 겹쳐 효율이 떨어지므로 간격을 흔드는 **jitter**를 씁니다. 설계의 **효율**(efficiency)은 1 / [c(XᵀX)⁻¹cᵀ]로 계산할 수 있어, 자료를 모으기 전에 여러 후보 설계를 비교할 수 있습니다. 예측 가능성, 균형 같은 심리적 조건까지 함께 맞추는 설계 탐색 알고리즘도 있습니다.

## 예시로 이해하기

> 모든 시계열은 연습용 **가상 자료**입니다. HRF 모수는 흔히 쓰이는 모양을 흉내 낸 값이며 특정 소프트웨어의 기본값과 같다고 가정하지 않습니다.

### 예시 1 — 이중 감마 HRF와 블록 설계 회귀변수

```python
import numpy as np
from scipy.stats import gamma

def double_gamma(t, peak=6.0, under=16.0, ratio=1 / 6):
    """흔히 쓰는 모양의 이중 감마 HRF: 5초 근처 봉우리, 15–16초 근처 얕은 골"""
    h = gamma.pdf(t, peak) - ratio * gamma.pdf(t, under)
    return h / h.max()

dt = 0.1                                   # 고해상도 시간 격자(초)
t_hrf = np.arange(0, 32, dt)
hrf = double_gamma(t_hrf)
print("HRF 봉우리 시각: %.1f s | 가장 깊은 골: %.1f s" % (t_hrf[hrf.argmax()], t_hrf[hrf.argmin()]))

# 블록 설계: 20초 과제, 20초 쉼을 반복 (총 240초)
TR, total = 2.0, 240
t_hi = np.arange(0, total, dt)
boxcar = ((t_hi % 40) < 20).astype(float)
reg_hi = np.convolve(boxcar, hrf)[: t_hi.size] * dt          # 고해상도에서 convolution
regressor = reg_hi[:: int(TR / dt)]                            # TR 간격으로 뽑기
regressor /= regressor.max()

onset_lag = t_hi[np.argmax(reg_hi > 0.5 * reg_hi.max())]
print("과제는 0 s에 시작, 예측 BOLD가 절반 높이에 닿는 시각: %.1f s" % onset_lag)
print("회귀변수 길이:", regressor.size, "(= 240 s / TR 2 s)")
print("첫 12개 값:", np.round(regressor[:12], 2))
```

출력:

```text
HRF 봉우리 시각: 5.0 s | 가장 깊은 골: 15.7 s
과제는 0 s에 시작, 예측 BOLD가 절반 높이에 닿는 시각: 5.5 s
회귀변수 길이: 120 (= 240 s / TR 2 s)
첫 12개 값: [0.   0.02 0.23 0.59 0.85 0.97 1.   0.98 0.95 0.92 0.9  0.87]
```

과제는 0초에 시작하지만 예측 BOLD는 5.5초가 되어서야 절반 높이에 닿습니다. 회귀변수의 첫 값들이 0, 0.02, 0.23, …으로 천천히 오르는 것이 그 지연입니다. boxcar를 그대로 회귀변수로 쓰면 이 지연과 undershoot를 무시하게 되어 자료와 잘 맞지 않습니다.

### 예시 2 — GLM 적합, contrast t, 그리고 자기상관을 무시했을 때의 대가

```python
import numpy as np
import statsmodels.api as sm
from scipy.stats import gamma

rng = np.random.default_rng(11)
TR, n = 2.0, 120
dt = 0.1
t_hrf = np.arange(0, 32, dt)
hrf = gamma.pdf(t_hrf, 6) - gamma.pdf(t_hrf, 16) / 6
t_hi = np.arange(0, n * TR, dt)

def make_regressor(onsets, dur):
    stim = np.zeros(t_hi.size)
    for o in onsets:
        stim[(t_hi >= o) & (t_hi < o + dur)] = 1
    r = (np.convolve(stim, hrf)[: t_hi.size] * dt)[:: int(TR / dt)]
    return r / r.max()

task = make_regressor(np.arange(0, n * TR, 40), 20)           # 20초 켜고 20초 끄기
tt = np.arange(n)
dct = np.column_stack([np.cos(np.pi * k * (tt + 0.5) / n) for k in range(1, 4)])  # 느린 흐름(drift)용 코사인 3개

def ar1_noise(phi, sd=1.0):
    e = np.zeros(n); e[0] = rng.normal(0, sd)
    for i in range(1, n):
        e[i] = phi * e[i - 1] + rng.normal(0, sd)
    return e

X = sm.add_constant(np.column_stack([task, dct]))             # 열: 절편, 과제, DCT 3개
c = np.array([0, 1, 0, 0, 0])                                 # contrast: '과제 효과'

# 한 voxel: 기저값 100, 과제 효과 2.0, 느린 drift, AR(1) 잡음
y = 100 + 2.0 * task + 1.5 * dct[:, 0] + ar1_noise(0.5)
ols = sm.OLS(y, X).fit()
print("OLS   β_task = %.2f, SE = %.3f, t = %.2f" % (ols.params[1], ols.bse[1], ols.tvalues[1]))
gls = sm.GLSAR(y, X, rho=1).iterative_fit(maxiter=5)          # 잔차로 AR(1)을 추정해 prewhitening
print("GLSAR β_task = %.2f, SE = %.3f, t = %.2f, 추정 ρ = %.2f" % (gls.params[1], gls.bse[1], gls.tvalues[1], gls.model.rho[0]))
print("contrast t (OLS) 직접 계산:", round(float(c @ ols.params / np.sqrt(c @ ols.cov_params() @ c)), 2))

# 신호가 전혀 없는 voxel 1,000개를 만들어 반복해 보자
b, se_ols, se_gls, p_ols, p_gls = [], [], [], [], []
for _ in range(1000):
    y0 = 100 + 1.5 * dct[:, 0] + ar1_noise(0.5)
    f1 = sm.OLS(y0, X).fit()
    f2 = sm.GLSAR(y0, X, rho=1).iterative_fit(maxiter=5)
    b.append(f1.params[1]); se_ols.append(f1.bse[1]); se_gls.append(f2.bse[1])
    p_ols.append(f1.pvalues[1]); p_gls.append(f2.pvalues[1])
print("β의 실제 흩어짐(SD): %.3f | OLS가 말하는 SE 평균: %.3f | GLSAR SE 평균: %.3f"
      % (np.std(b), np.mean(se_ols), np.mean(se_gls)))
print("거짓 양성 비율 — OLS: %.1f%%, GLSAR: %.1f%% (명목 5%%)"
      % (100 * np.mean(np.array(p_ols) < 0.05), 100 * np.mean(np.array(p_gls) < 0.05)))
```

출력:

```text
OLS   β_task = 1.33, SE = 0.201, t = 6.61
GLSAR β_task = 1.32, SE = 0.276, t = 4.78, 추정 ρ = 0.34
contrast t (OLS) 직접 계산: 6.61
β의 실제 흩어짐(SD): 0.371 | OLS가 말하는 SE 평균: 0.224 | GLSAR SE 평균: 0.331
거짓 양성 비율 — OLS: 23.1%, GLSAR: 8.9% (명목 5%)
```

윗부분은 한 voxel의 결과입니다. 두 방법의 β는 거의 같지만 표준오차가 다릅니다. contrast 공식을 직접 계산한 t도 statsmodels의 값과 같습니다.

아랫부분이 핵심입니다. 신호가 전혀 없는 voxel 1,000개를 만들었더니 β의 실제 흩어짐은 0.37인데, 오차가 독립이라고 가정한 OLS는 표준오차를 평균 0.22로 말합니다. 실제보다 정밀하다고 착각한 결과, p < 0.05가 5%가 아니라 23%에서 나옵니다. AR(1)로 prewhitening한 GLSAR은 9%로 크게 줄었지만 명목 5%에는 못 미칩니다. 시점 120개로 자기상관을 voxel 하나에서만 추정하면 그 추정이 덜 정확하기 때문이고, 실제 소프트웨어가 여러 voxel의 정보를 모아 추정하는 이유가 여기 있습니다. 이 거짓 양성이 뇌 전체 수만 voxel에서 일어난다고 생각해 보세요.

설계 행렬을 그림으로 남기려면 예시 2 뒤에 아래를 붙입니다(그림 파일만 저장).

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path

Path("figures/advanced/D").mkdir(parents=True, exist_ok=True)
fig, ax = plt.subplots(figsize=(4, 6))
ax.imshow((X - X.mean(0)) / (X.std(0) + 1e-12), aspect="auto", cmap="gray")
ax.set_xticks(range(X.shape[1])); ax.set_xticklabels(["const", "task", "dct1", "dct2", "dct3"], rotation=45)
ax.set_ylabel("volume (TR)")
fig.tight_layout(); fig.savefig("figures/advanced/D/D4_design_matrix.png", dpi=150)
```

### 예시 3 — 두 사건 사이 간격과 설계 효율

```python
import numpy as np
from scipy.stats import gamma

rng = np.random.default_rng(2)
TR, n, dt = 2.0, 150, 0.1
t_hrf = np.arange(0, 32, dt)
hrf = gamma.pdf(t_hrf, 6) - gamma.pdf(t_hrf, 16) / 6
t_hi = np.arange(0, n * TR, dt)

def reg(onsets, dur=1.0):
    s = np.zeros(t_hi.size)
    for o in onsets:
        s[(t_hi >= o) & (t_hi < o + dur)] = 1
    r = (np.convolve(s, hrf)[: t_hi.size] * dt)[:: int(TR / dt)]
    return r / r.max()

def efficiency(X, c):
    return 1 / (c @ np.linalg.inv(X.T @ X) @ c)    # 클수록 같은 잡음에서 추정이 덜 흔들린다

cue = np.cumsum(rng.uniform(12, 16, 18))            # '단서' 사건 18번
designs = {f"고정 {g} s": cue + g for g in [1, 2, 4]}
designs["무작위 1–8 s"] = cue + rng.uniform(1, 8, cue.size)
for name, target in designs.items():
    a, b = reg(cue), reg(target)                    # '단서'와 '목표' 회귀변수
    X = np.column_stack([np.ones(n), a, b])
    r = np.corrcoef(a, b)[0, 1]
    print(f"{name:12} 상관 {r:5.2f} | 효율(단서만) {efficiency(X, np.array([0, 1, 0])):5.1f}"
          f" | 효율(목표만) {efficiency(X, np.array([0, 0, 1])):5.1f}")
```

출력:

```text
고정 1 s       상관  0.90 | 효율(단서만)   3.9 | 효율(목표만)   3.8
고정 2 s       상관  0.62 | 효율(단서만)  12.3 | 효율(목표만)  12.3
고정 4 s       상관 -0.08 | 효율(단서만)  19.9 | 효율(목표만)  19.9
무작위 1–8 s    상관 -0.12 | 효율(단서만)  19.7 | 효율(목표만)  19.0
```

'단서' 뒤에 '목표'가 늘 1초 뒤에 오면 두 회귀변수의 상관이 0.90이고, 각 사건의 효율은 4 근처로 떨어집니다. 같은 자료량으로 다섯 배쯤 더 흔들리는 추정을 얻는다는 뜻입니다. 간격이 4초로 고정되거나 1–8초에서 무작위로 흔들리면 상관이 0 근처로 내려가고 효율이 20 가까이 회복됩니다. 무작위 설계는 짧은 간격이 섞여 있어도 평균적으로 겹침을 피합니다. 자료를 모으기 **전에** 이런 계산으로 설계를 고를 수 있습니다.

### 참고 — nilearn으로 같은 1수준 분석을 할 때의 형태 (nilearn 필요)

> 이 코드는 `pip install nibabel nilearn`으로 설치한 환경(nibabel 5.5, nilearn 0.14.1)에서, 같은 이름의 **가상 파일**을 만들어 그대로 실행해 오류 없이 도는 것을 확인했습니다. 출력은 여러분의 실제 파일에 따라 달라지므로 싣지 않았습니다.

```python
# nilearn이 필요하다: pip install nilearn
from nilearn.glm.first_level import FirstLevelModel
model = FirstLevelModel(t_r=2.0, hrf_model="spm", drift_model="cosine",
                        high_pass=0.01, noise_model="ar1", smoothing_fwhm=6)
model = model.fit("sub-01_task-x_bold.nii.gz", events=events_df, confounds=confounds_df)
z_map = model.compute_contrast("condA - condB", output_type="z_score")
```

## 직접 해보기

1. `D4_first_level_glm.ipynb`에서 예시 1–3을 실행한다.
2. 예시 1에서 블록 길이를 20초에서 60초(주기 120초)로 바꾸고, 예시 2의 DCT 코사인 개수를 3에서 8로 늘리면 과제 회귀변수와 DCT 열 사이의 상관이 어떻게 되는지 `np.corrcoef`로 확인한다. "블록을 길게 하면 왜 위험한가"를 한 문장으로 적는다.
3. 예시 2의 AR 계수 0.5를 0과 0.8로 바꿔 거짓 양성 비율을 다시 계산한다. 반복 횟수를 300으로 줄여도 된다.
4. 예시 2에 매개 변조 회귀변수를 하나 추가해 본다. 블록마다 가상의 난이도 1–3을 주고, 평균을 뺀 값으로 막대 높이를 만든 뒤 convolution한다. 변조 회귀변수와 원래 과제 회귀변수의 상관을 평균을 빼기 전과 후로 비교한다.
5. 예시 2 뒤에 그림 코드를 붙여 `figures/advanced/D/D4_design_matrix.png`를 만든다.

⚠️ **흔한 오류 1 — 사건 시각의 단위와 기준점 혼동.** 시행 시각을 초가 아니라 TR 번호로 적었거나, run 시작이 아니라 실험 프로그램 시작 시각을 기준으로 적으면 회귀변수 전체가 밀립니다. BIDS의 `events.tsv`처럼 onset·duration을 초 단위, run 시작 기준으로 기록하고, 처음 몇 장을 버렸다면(dummy scans) 그만큼 시각을 보정합니다.

⚠️ **흔한 오류 2 — 효과 없는 결과를 "활성 없음"으로 읽기.** 단일 피험자 t 지도에서 문턱을 넘지 못한 것은 효과가 없다는 증거가 아닙니다. 검출력이 부족했을 수 있습니다(Day 9). 해석은 효과 크기와 신뢰구간으로, 집단 결론은 D5의 2수준 분석으로 합니다.

## 퀴즈

**1.** 고해상도 시간 격자에서 convolution한 뒤 TR 간격으로 뽑는 이유는?

<details><summary>정답 보기</summary>

사건의 시작과 길이가 TR 경계와 맞지 않기 때문입니다. TR 해상도에서 바로 계산하면 서로 다른 길이·시각의 자극이 같은 회귀변수로 뭉개지고, HRF 모양도 거칠게 표현됩니다.

</details>

**2.** FIR 모형의 장점과 단점을 한 쌍으로 적으세요. (단답)

<details><summary>정답 보기</summary>

장점은 HRF 모양을 가정하지 않아 편향이 작다는 것, 단점은 모수가 많아 추정이 흔들리고(분산이 큼) 집단 분석에 넘기기 어렵다는 것입니다. 모양을 연구할 때 알맞고, 활성 검출에는 표준 HRF(+도함수)가 대개 낫습니다.

</details>

**3.** 세 조건 A, B, C와 절편이 [A, B, C, 절편] 순서로 들어 있을 때 "A가 B와 C의 평균보다 큰가"를 묻는 contrast는?

(a) [1, −1, −1, 0] (b) [1, −0.5, −0.5, 0] (c) [1, 0, 0, −1] (d) [0, 1, 1, 0]

<details><summary>정답 보기</summary>

(b). A − (B + C)/2 = 0을 검정합니다. (a)는 A = B + C라는 전혀 다른 가설입니다. [2, −1, −1, 0]은 (b)와 같은 가설이지만 contrast 값이 두 배가 되어 % 신호 변화로 옮길 때 혼동을 줍니다(Day D7 예시 3). 양수 가중치의 합 1, 음수 가중치의 합 −1로 맞추는 습관이 좋습니다.

</details>

**4.** 시간 자기상관을 무시하고 OLS로 추정하면 무엇이 잘못되나요?

(a) β가 체계적으로 틀어진다 (b) 표준오차가 작게 계산되어 거짓 양성이 늘어난다 (c) 설계 행렬이 rank deficient가 된다 (d) 아무 문제 없다

<details><summary>정답 보기</summary>

(b). 예시 2에서 β의 평균은 거의 맞았지만 표준오차를 실제보다 작게 말해 p < 0.05가 23%에서 나왔습니다. prewhitening은 이 표준오차를 바로잡는 과정입니다.

</details>

**5.** 매개 변조 회귀변수를 만들 때 값의 평균을 빼는 이유는? (단답)

<details><summary>정답 보기</summary>

평균을 빼지 않으면 변조 회귀변수가 원래(변조하지 않은) 과제 회귀변수와 크게 겹쳐, 두 β가 서로의 몫을 나눠 갖고 흔들립니다. 평균을 빼면 변조 회귀변수는 "평균보다 강한 시행에서 더 큰 반응"만 담게 되어 해석이 분명해집니다. 원래 과제 회귀변수도 함께 넣어야 합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] HRF를 만들고 블록 설계를 convolution해 회귀변수를 얻었다.
- [ ] GLM을 적합하고 contrast t를 직접 계산해 라이브러리 값과 맞췄다.
- [ ] 자기상관을 무시했을 때의 거짓 양성 비율을 시뮬레이션으로 확인했다.
- [ ] `figures/advanced/D/D4_design_matrix.png`를 저장했다.
- [ ] 사건 간격과 설계 효율의 관계를 표로 정리했다.

## 더 읽을거리
- Poldrack RA, Mumford JA, Nichols TE. *Handbook of Functional MRI Data Analysis.* Cambridge University Press, 2011. <https://www.cambridge.org/core/books/handbook-of-functional-mri-data-analysis/8EDF966C65811FCCC306F7C916228529> — 5장(1수준 모형, 잡음, 설계), 부록 A(GLM 복습).
- Glover GH. Deconvolution of impulse response in event-related BOLD fMRI. *NeuroImage.* 1999;9:416–429. doi:[10.1006/nimg.1998.0419](https://doi.org/10.1006/nimg.1998.0419)
- Woolrich MW, et al. Temporal autocorrelation in univariate linear modeling of FMRI data. *NeuroImage.* 2001;14:1370–1386. doi:[10.1006/nimg.2001.0931](https://doi.org/10.1006/nimg.2001.0931)
- nilearn 1수준 GLM 안내: <https://nilearn.github.io>

---
[← 이전](day-D3.md) · [코스 지도](../../../README.md) · [다음 →](day-D5.md)
