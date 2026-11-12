# Day D6 — 연결성: seed 상관, PPI, ICA, 유효 연결성, 휴지기 네트워크

> **주차:** 심화 파트 D — fMRI 데이터 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/D/D6_connectivity.ipynb`, `figures/advanced/D/D6_connectivity_matrix.png`
>
> **먼저 끝내 둘 레슨:** Day D2(움직임), Day D4(GLM), Day 14 (PCA), Day 31 (교란변수), Day 37 (상관과 인과를 구분해 가설 세우기).

## 오늘의 목표
- 기능적 연결성(상관)과 유효 연결성(방향 있는 영향)을 구분하고, 두 영역의 상관이 생기는 세 가지 경로를 설명할 수 있다.
- 과제가 만든 가짜 상관을 방해 모형의 잔차로 걸러 내고, PPI 모형의 회귀변수 구성을 말할 수 있다.
- 휴지기 연결성 분석에서 움직임과 전역 신호 처리의 쟁점을 정리하고, 퇴행성 질환 연구에서 결과를 조심스럽게 읽는 법을 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [Intro to FMRI Functional Connectivity — Andy's Brain Tube](https://www.youtube.com/watch?v=L5oo7gJWleo) (5:36)
- **무엇에 주목할까:** seed 영역의 시계열을 다른 모든 voxel과 상관시키는 기본 발상을 보세요. 그 상관이 "연결"의 증거가 되려면 무엇이 더 필요한지 질문하며 보면 오늘의 개념 설명과 이어집니다.

- [Principles of fMRI Part 2, Module 16 - Brain connectivity — Principles of fMRI](https://www.youtube.com/watch?v=J0KX_rW0hmc) (6:07)
- **무엇에 주목할까:** 기능적 연결성과 유효 연결성의 구분, 그리고 방법마다 어떤 가정을 하는지에 집중하세요.

## 개념 설명

### 상관은 세 가지 길로 생긴다

지금까지의 분석은 "어디가 반응하나"(기능적 분화)를 물었습니다. 연결성 분석은 "영역들이 어떻게 함께 일하나"(기능적 통합)를 묻습니다. **기능적 연결성**(functional connectivity)은 떨어진 영역들의 활동이 함께 오르내리는 정도, 즉 상관입니다. 두 영역 A와 B가 상관을 보이는 경로는 셋입니다. A가 B에 직접 영향을 줄 때, A가 C를 거쳐 B에 영향을 줄 때, 그리고 제3의 영역(또는 자극)이 A와 B 모두를 움직일 때입니다. 첫 번째만이 직접적인 인과 연결이므로, 상관 지도는 "연결 지도"가 아니라 "함께 움직임 지도"로 읽어야 합니다. Day 37에서 문헌 증거로 기전 가설을 세울 때 상관과 인과를 구분한 것과 같습니다.

가장 흔한 함정은 **과제가 만든 상관**입니다. 시각 자극이 나올 때마다 두 영역이 모두 반응하면, 둘은 서로 아무 영향이 없어도 시계열 상관이 높게 나옵니다(예시 1). 대응은 두 가지입니다. 과제 효과(와 움직임 등)를 GLM으로 먼저 설명해 버리고 **잔차**끼리 상관을 보거나, 시행마다 β를 따로 추정해(시행마다 회귀변수 하나) 그 **β 시계열**끼리 상관을 보는 방법(beta-series correlation)입니다. 후자는 시행 간격이 8–10초 이상인 느린 설계에 알맞습니다. 사람별 활성 크기를 사람들 사이에서 상관시키는 방법도 있지만, 카페인·움직임처럼 사람 전체의 반응 크기를 바꾸는 요인이 가짜 상관을 만들기 쉬워 단독 근거로는 약합니다.

### PPI: 과제에 따라 연결이 달라지는가

"조건 A일 때 seed와 target의 결합이 조건 B일 때보다 강한가"는 **심리생리 상호작용**(psychophysiological interaction, PPI) 모형으로 묻습니다. 설계 행렬에 과제(심리) 회귀변수, seed 시계열(생리) 회귀변수, 그리고 둘의 곱(상호작용)을 함께 넣고, 상호작용의 β를 검정합니다. 양수면 그 조건에서 seed–target 기울기가 더 가파르다는 뜻입니다. 주의할 점이 셋 있습니다.

- 과제와 seed 회귀변수를 **반드시 함께 넣습니다.** 빠지면 상호작용 효과가 단순한 과제 활성과 구별되지 않습니다.
- 곱은 원래 **신경 수준**에서 일어나는 일이므로, BOLD 시계열끼리 바로 곱하는 대신 seed BOLD를 deconvolution해 신경 신호를 추정한 뒤 곱하고 다시 HRF를 씌우는 방법이 제안되었습니다. 사건 관련 설계에서 특히 중요합니다.
- PPI 회귀변수가 과제 회귀변수와 많이 겹치면 효율이 떨어지고, HRF 모형이 틀리면 남은 활성이 연결처럼 보일 수 있습니다. 움직임 같은 방해 신호는 곱하기 **전에** 자료에서 빼 둡니다.

### 자료에서 성분 찾기: PCA, ICA, PLS

모형을 미리 정하지 않고 자료 속 공통 패턴을 찾는 방법도 있습니다. **PCA**(Day 14)는 분산이 큰 순서로 서로 직교하는 성분을 찾습니다. **ICA**(independent component analysis)는 칵테일 파티에서 여러 마이크의 녹음으로부터 각 사람의 목소리를 분리하는 문제처럼, 섞인 신호를 통계적으로 **독립인** 원천들로 풉니다. 독립성은 비가우시안성으로 찾기 때문에, 가우시안이 아닌 신호(움직임 스파이크, 심박, 네트워크 요동)를 잘 분리합니다. fMRI에서는 보통 "공간적으로 독립인 지도"와 그 시간 경과를 얻습니다. 해가 유일하지 않아 실행마다 조금 다를 수 있고, 이상값에 민감하며, 성분 번호에 순서가 없어 사람들 사이에서 같은 성분을 맞추는 일이 까다롭습니다. 집단 ICA는 흔히 사람들의 자료를 시간 방향으로 이어 붙여 공통 공간 성분을 찾습니다. **PLS**(partial least squares)는 자료와 설계(또는 행동)를 함께 분해해, 둘의 공분산을 가장 잘 설명하는 성분을 찾습니다.

### 유효 연결성: 방향을 묻는 모형들과 그 한계

**유효 연결성**(effective connectivity)은 "A가 B에 영향을 주는가"라는 방향 있는 질문입니다. 관찰 자료만으로도 조건부 독립 관계를 이용해 인과 구조에 대한 증거를 얻을 수 있지만, fMRI에는 특별한 어려움이 있습니다. 영역이 조금만 늘어도 가능한 방향 그래프 수가 폭발하고(영역 6개면 10억 개 이상), 우리가 원하는 신경 신호는 잡음 섞인 느린 BOLD로만 보이며, 사람마다 연결이 다를 수 있습니다. 대표 방법은 다음과 같습니다.

- **구조방정식 모형(SEM)**: 미리 정한 경로 그림이 관찰된 공분산을 재현하는지 봅니다. 적합도 검정이 유의하지 않다고 그 모형이 옳다는 뜻은 아니며, 모형끼리는 AIC·BIC처럼 복잡도를 벌하는 기준으로 비교합니다.
- **그래프 인과 모형 탐색**: 조건부 독립 패턴에서 그래프를 탐색합니다. 여러 사람의 자료를 그냥 합치면 어느 개인에게도 없는 독립 패턴이 생길 수 있어 개인별 적합을 결합하는 방법이 제안되었습니다.
- **동적 인과 모형(DCM)**: 신경 동역학과 혈류역학을 함께 모델링해 몇 개 영역 사이의 연결과 그 조건별 변조를 베이즈 방식으로 추정하고, 후보 모형들을 비교합니다. 모형 선택은 비교적 안정적이지만 세부 모수 값은 덜 안정적일 수 있고, 후보 모형 집합 밖의 정답은 찾지 못합니다.
- **Granger 인과성**: "A의 과거가 B의 미래를 더 잘 예측하는가"를 봅니다. 그러나 HRF의 시간 지연이 영역마다 다르고, 슬라이스 획득 시각 차이가 신경 처리 시간보다 크며, 수 초 간격 표본으로 밀리초 단위 상호작용을 보려는 것이라, 책은 fMRI에 쓰는 것을 권하지 않습니다.

### 휴지기 fMRI와 그래프 분석, 그리고 질환 연구에서의 주의

과제 없이 누워 있을 때의 느린 요동(대략 0.1 Hz 이하)에도 운동망, 시각망, 기본 모드 네트워크(default mode network, DMN) 같은 구조가 나타납니다(Biswal 등 1995). 영역을 마디(node), 영역 쌍의 상관을 연결(edge)로 보면 뇌를 **그래프**로 요약할 수 있고, 연결 수(degree), 경로 길이, 군집 계수, 모듈성 같은 지표를 계산합니다. 상관 문턱을 어디에 두느냐에 따라 그래프가 달라지므로 여러 문턱에서 결론이 유지되는지 확인합니다.

휴지기 분석은 움직임에 특히 약합니다. 관심 신호와 잡음이 모두 낮은 주파수에 모여 있고, 움직임은 가까운 영역 쌍의 상관을 올리고 먼 쌍의 상관을 낮추는 식으로 **체계적인** 가짜 패턴을 만듭니다(Power 등 2012). 그래서 움직임 6개와 도함수, 백질·뇌실 신호, 생리 신호를 회귀로 빼고, FD가 큰 시점을 처리합니다. task 분석에서 표준인 prewhitening은 관심 있는 저주파 요동을 깎을 수 있어 휴지기 분석에서는 쓰지 않습니다. **전역 신호 회귀**(global signal regression)는 논쟁 중입니다. 잡음 제거에 도움이 되지만 음의 상관을 수학적으로 만들어 낼 수 있으므로(Murphy 등 2009), 쓴다면 음의 상관 해석을 특히 조심하고, 쓰지 않은 결과와 함께 보고하는 것이 안전합니다. 잡음 처리 전략의 비교는 Ciric 등(2017)에 정리되어 있습니다.

퇴행성 질환 연구에서는 알츠하이머병에서 DMN 연결성이 달라진다는 초기 보고(Greicius 등 2004)를 비롯해 많은 연구가 있습니다. 하지만 환자군은 움직임이 많고, 위축 때문에 정규화와 부분 용적 효과가 다르며(D3), 약물과 각성 상태도 다릅니다. 이런 차이가 **집단과 얽혀** 있으면 연결성 차이처럼 보일 수 있습니다. 집단별 움직임 요약을 함께 보고하고, 움직임이 비슷한 하위 집단에서도 결과가 유지되는지 민감도 분석(Day 39)으로 확인하세요. 연결성 지표는 진단 도구가 아니라 집단 수준의 가설을 만드는 단서입니다.

## 예시로 이해하기

> 모든 시계열은 연습용 **가상 자료**입니다.

### 예시 1 — 과제가 만든 가짜 상관과 잔차 상관

```python
import numpy as np
import statsmodels.api as sm
from scipy.stats import gamma

rng = np.random.default_rng(22)
TR, n, dt = 2.0, 200, 0.1
t_hrf = np.arange(0, 32, dt)
hrf = gamma.pdf(t_hrf, 6) - gamma.pdf(t_hrf, 16) / 6
t_hi = np.arange(0, n * TR, dt)
box = ((t_hi % 40) < 20).astype(float)
task = (np.convolve(box, hrf)[: t_hi.size] * dt)[:: int(TR / dt)]
task /= task.max()

# 세 영역: A와 B는 서로 영향을 주지 않지만 둘 다 과제에 반응한다. C는 A와 실제로 이어져 있다
a_own = rng.normal(0, 1, n)
A = 2.0 * task + a_own
B = 2.0 * task + rng.normal(0, 1, n)
C = 2.0 * task + 0.6 * a_own + rng.normal(0, 0.8, n)

X = sm.add_constant(task)                       # '방해 모형': 과제 효과(필요하면 움직임 등도)
res = {k: sm.OLS(v, X).fit().resid for k, v in {"A": A, "B": B, "C": C}.items()}

print("원 시계열 상관   A–B: %.2f   A–C: %.2f" % (np.corrcoef(A, B)[0, 1], np.corrcoef(A, C)[0, 1]))
print("잔차 상관        A–B: %.2f   A–C: %.2f" % (np.corrcoef(res["A"], res["B"])[0, 1],
                                                 np.corrcoef(res["A"], res["C"])[0, 1]))
```

출력:

```text
원 시계열 상관   A–B: 0.53   A–C: 0.82
잔차 상관        A–B: 0.01   A–C: 0.57
```

A와 B는 서로 아무 영향도 주지 않도록 만들었는데, 원 시계열 상관이 0.53입니다. 둘 다 과제에 반응하기 때문입니다. 과제 효과를 회귀로 빼고 남은 잔차끼리 보면 0.01로 사라집니다. A와 C는 과제와 별개로 실제 공통 요동을 공유하도록 만들었으므로 잔차 상관 0.57이 남습니다. "방해 모형"에 과제를 빠뜨리면 활성 지도를 연결 지도로 착각하게 됩니다.

### 예시 2 — PPI: 조건에 따라 달라지는 결합 찾기

```python
import numpy as np
import statsmodels.api as sm
from scipy.stats import gamma

rng = np.random.default_rng(31)
TR, n, dt = 2.0, 240, 0.1
t_hrf = np.arange(0, 32, dt)
hrf = gamma.pdf(t_hrf, 6) - gamma.pdf(t_hrf, 16) / 6
t_hi = np.arange(0, n * TR, dt)

def conv(x_hi):
    r = (np.convolve(x_hi, hrf)[: t_hi.size] * dt)[:: int(TR / dt)]
    return r

# 두 조건이 번갈아 나오는 블록 설계: 조건 1(+1)과 조건 2(−1)
cond_hi = np.where((t_hi % 60) < 30, 1.0, -1.0)
psych = conv(cond_hi)                               # '심리' 회귀변수(과제 차이)

# 가상 '신경 활동': seed 영역의 자발적 요동. target은 조건 1일 때만 seed를 따라간다
seed_neural_hi = np.repeat(rng.normal(0, 1, n), int(TR / dt))
coupling_hi = np.where(cond_hi > 0, 0.8, 0.0)
seed = conv(seed_neural_hi) + rng.normal(0, 0.3, n)
target = conv(coupling_hi * seed_neural_hi) + 0.5 * psych + rng.normal(0, 0.3, n)

# PPI 회귀변수: 학습용으로 '신경 수준'의 seed × 조건을 곱한 뒤 HRF를 다시 씌운다.
# (실제 seed의 신경 신호는 모르므로 SPM 등은 BOLD에서 deconvolution으로 추정한다)
ppi = conv(seed_neural_hi * cond_hi)
naive_ppi = (seed - seed.mean()) * np.sign(psych)   # 흔한 지름길: BOLD끼리 그냥 곱하기

for name, p in [("deconvolution형 PPI", ppi), ("BOLD 곱 PPI(지름길)", naive_ppi)]:
    X = sm.add_constant(np.column_stack([psych, seed, p]))   # 과제, seed, 상호작용을 모두 넣는다
    fit = sm.OLS(target, X).fit()
    print(f"{name:20} PPI t = {fit.tvalues[3]:5.2f} | 과제 t = {fit.tvalues[1]:5.2f}"
          f" | PPI–과제 상관 {np.corrcoef(p, psych)[0, 1]:5.2f}")
```

출력:

```text
deconvolution형 PPI   PPI t =  7.51 | 과제 t = 21.07 | PPI–과제 상관  0.04
BOLD 곱 PPI(지름길)      PPI t =  4.31 | 과제 t = 19.83 | PPI–과제 상관  0.01
```

target은 조건 1에서만 seed를 따라가도록 만들었습니다. 과제·seed·PPI 세 회귀변수를 함께 넣었을 때 PPI의 t는 두 방법 모두 유의하지만, 신경 수준에서 곱을 만든 쪽(t = 7.5)이 BOLD끼리 곱한 지름길(t = 4.3)보다 상호작용을 훨씬 잘 잡습니다. 다만 이 예시는 정답인 "신경 신호"를 알고 있는 가상 상황입니다. 실제로는 seed BOLD에서 신경 신호를 deconvolution으로 **추정**해야 하므로, 그 추정의 품질이 결과를 좌우합니다. PPI–과제 상관이 작다는 점도 확인하세요. 이 값이 크면 두 효과를 떼어 내기 어렵습니다.

### 예시 3 — 휴지기 연결성 행렬과 움직임

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(41)
n, names = 300, ["DMN_1", "DMN_2", "DMN_3", "MOT_1", "MOT_2", "MOT_3"]
# 가상 휴지기 자료: 두 '네트워크'가 각자 공통 요동을 갖는다
net_dmn, net_mot = rng.normal(size=n), rng.normal(size=n)
ts = np.column_stack([0.7 * net_dmn + rng.normal(size=n) for _ in range(3)] +
                     [0.7 * net_mot + rng.normal(size=n) for _ in range(3)])

# 머리 움직임이 모든 영역에 같은 흔적을 남긴다고 가정 (실제로는 영역마다 다르다)
fd_like = np.abs(rng.normal(0, 0.1, n)); fd_like[[50, 51, 120, 180, 181, 182, 250]] += 1.5
dirty = ts + 3.0 * fd_like[:, None]

def corr_table(x):
    return pd.DataFrame(np.corrcoef(x.T), index=names, columns=names).round(2)

def regress_out(x, nuis):
    Z = np.column_stack([np.ones(n), nuis])
    beta, *_ = np.linalg.lstsq(Z, x, rcond=None)
    return x - Z @ beta

clean = regress_out(dirty, fd_like)
for label, x in [("움직임 섞인 자료", dirty), ("움직임 회귀 뒤", clean)]:
    r = np.corrcoef(x.T)
    between = r[:3, 3:].mean()
    within = (r[:3, :3][np.triu_indices(3, 1)].mean() + r[3:, 3:][np.triu_indices(3, 1)].mean()) / 2
    print(f"{label:10} 네트워크 안 평균 r {within:.2f} | 네트워크 사이 평균 r {between:.2f}")

# 그래프로 요약: |r| > 0.2를 연결(edge)로 보고 마디(node)마다 연결 수(degree)를 센다
for label, x in [("움직임 섞인 자료", dirty), ("움직임 회귀 뒤", clean)]:
    r = np.corrcoef(x.T); np.fill_diagonal(r, 0)
    adj = np.abs(r) > 0.2
    print(f"{label:10} 연결 수 {adj.sum() // 2:2d} | degree {adj.sum(1).tolist()}")
print(corr_table(clean))
```

출력:

```text
움직임 섞인 자료  네트워크 안 평균 r 0.48 | 네트워크 사이 평균 r 0.21
움직임 회귀 뒤   네트워크 안 평균 r 0.32 | 네트워크 사이 평균 r -0.03
움직임 섞인 자료  연결 수 11 | degree [4, 4, 3, 3, 4, 4]
움직임 회귀 뒤   연결 수  6 | degree [2, 2, 2, 2, 2, 2]
       DMN_1  DMN_2  DMN_3  MOT_1  MOT_2  MOT_3
DMN_1   1.00   0.24   0.32  -0.03  -0.04   0.07
DMN_2   0.24   1.00   0.24  -0.04  -0.06  -0.00
DMN_3   0.32   0.24   1.00   0.02  -0.10  -0.05
MOT_1  -0.03  -0.04   0.02   1.00   0.27   0.43
MOT_2  -0.04  -0.06  -0.10   0.27   1.00   0.43
MOT_3   0.07  -0.00  -0.05   0.43   0.43   1.00
```

두 가상 네트워크(DMN_1–3, MOT_1–3)는 네트워크 안에서만 공통 요동을 갖습니다. 움직임 흔적이 섞이자 네트워크 **사이**의 평균 상관이 0.21로 올라 연결이 11개로 늘었습니다. 움직임 시계열을 회귀로 빼자 사이 상관은 0 근처로, 연결은 네트워크 안의 6개로 돌아왔습니다. 실제 움직임은 영역마다 다른 흔적을 남기므로 이렇게 깨끗하게 지워지지 않습니다. 그래서 집단 비교에서는 움직임이 비슷한지부터 확인합니다.

연결 행렬을 그림으로 남기려면 예시 3 뒤에 아래를 붙입니다(그림 파일만 저장).

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path

Path("figures/advanced/D").mkdir(parents=True, exist_ok=True)
fig, axes = plt.subplots(1, 2, figsize=(9, 4))
for ax, (label, x) in zip(axes, [("with motion", dirty), ("motion regressed", clean)]):
    im = ax.imshow(np.corrcoef(x.T), vmin=-1, vmax=1, cmap="RdBu_r")
    ax.set_xticks(range(6)); ax.set_xticklabels(names, rotation=90)
    ax.set_yticks(range(6)); ax.set_yticklabels(names); ax.set_title(label)
fig.colorbar(im, ax=axes, shrink=0.8)
fig.savefig("figures/advanced/D/D6_connectivity_matrix.png", dpi=150, bbox_inches="tight")
```

### 참고 — 실제 자료에서 ROI 시계열과 연결 행렬을 얻는 형태 (실행 확인 안 됨, 패키지 미설치)

```python
# nilearn이 설치된 환경에서만 동작한다. 이 저장소 환경에서는 실행하지 않았다.
from nilearn import datasets
from nilearn.maskers import NiftiLabelsMasker
from nilearn.connectome import ConnectivityMeasure
atlas = datasets.fetch_atlas_harvard_oxford("cort-maxprob-thr25-2mm")
masker = NiftiLabelsMasker(labels_img=atlas.maps, standardize=True, t_r=2.0,
                           high_pass=0.01, low_pass=0.1)
ts = masker.fit_transform("sub-01_task-rest_bold.nii.gz", confounds=confounds_df)  # 방해 신호를 함께 회귀
r = ConnectivityMeasure(kind="correlation").fit_transform([ts])[0]
```

## 직접 해보기

1. `D6_connectivity.ipynb`에서 예시 1–3을 실행한다.
2. 예시 1의 방해 모형 `X`에서 과제 회귀변수를 빼고 절편만 둔 채 잔차 상관을 다시 계산한다. 결과가 원 시계열 상관과 같아지는 이유를 적는다.
3. 예시 2의 PPI 모형에서 과제 회귀변수(`psych`)를 빼고 적합해 PPI t가 어떻게 변하는지 본다. 그 변화가 무엇을 뜻하는지 한 문장으로 적는다.
4. 예시 3 뒤에 그림 코드를 붙여 `figures/advanced/D/D6_connectivity_matrix.png`를 만든다.
5. 예시 3에서 연결 문턱을 0.1, 0.2, 0.3으로 바꿔 degree가 어떻게 달라지는지 표로 만든다. "그래프 지표는 문턱 선택에 민감하다"를 숫자로 보여 주는 표다.
6. 노트에 "알츠하이머병 환자에서 DMN 연결성이 낮다"는 결과를 읽을 때 확인할 질문 다섯 개를 적는다(움직임, 위축, 전역 신호 처리, 약물·각성, 표본 크기와 반복 검증).

⚠️ **흔한 오류 1 — 상관 행렬을 "배선도"로 읽기.** 상관은 직접 연결, 간접 연결, 공통 입력을 구분하지 못합니다. "A와 B가 연결되어 있다"가 아니라 "A와 B의 활동이 함께 움직였다"로 쓰고, 방향을 주장하려면 그에 맞는 모형과 가정을 명시합니다.

⚠️ **흔한 오류 2 — 집단 간 움직임 차이를 확인하지 않기.** 환자군의 평균 FD가 대조군보다 크면, 연결성 차이의 상당 부분이 움직임일 수 있습니다. 집단별 FD를 보고하고, 움직임을 공변량으로 넣거나 움직임이 맞춰진 하위 표본에서 재확인합니다.

## 퀴즈

**1.** 두 영역의 시계열 상관이 높게 나오는 경우가 아닌 것은?

(a) A가 B에 직접 영향을 준다 (b) 둘 다 같은 자극에 반응한다 (c) 둘 다 같은 머리 움직임 흔적을 갖는다 (d) 위 셋 모두 상관을 만들 수 있다

<details><summary>정답 보기</summary>

(d). 셋 모두 상관을 만듭니다. 그래서 과제 효과와 방해 신호를 먼저 설명해 버리고 잔차를 보거나, 방향을 묻는 모형을 따로 씁니다.

</details>

**2.** PPI 모형에 반드시 함께 들어가야 하는 세 회귀변수는? (단답)

<details><summary>정답 보기</summary>

과제(심리) 회귀변수, seed 시계열(생리) 회귀변수, 둘의 상호작용(PPI) 회귀변수입니다. 앞의 둘이 빠지면 PPI 효과가 단순한 과제 활성이나 조건과 무관한 seed 상관과 구별되지 않습니다.

</details>

**3.** fMRI에서 Granger 인과성을 권하지 않는 이유로 맞지 않는 것은?

(a) HRF 지연이 영역마다 다르다 (b) 슬라이스 획득 시각 차이가 크다 (c) 표본 간격이 신경 상호작용보다 훨씬 느리다 (d) 상관 계수를 계산할 수 없다

<details><summary>정답 보기</summary>

(d). 상관은 얼마든지 계산할 수 있습니다. 문제는 (a)–(c) 때문에 "먼저 일어난 쪽이 원인"이라는 Granger의 핵심 가정이 fMRI의 시간 정보에서 깨진다는 것입니다.

</details>

**4.** 휴지기 연결성에서 전역 신호 회귀를 했다면 특히 조심해서 해석해야 하는 결과는? (단답)

<details><summary>정답 보기</summary>

음의 상관(반상관)입니다. 전역 신호 회귀는 상관 분포를 음수 쪽으로 옮겨 음의 상관을 수학적으로 만들어 낼 수 있습니다. 양의 상관은 상대적으로 덜 영향을 받습니다. 쓴 경우와 쓰지 않은 경우를 함께 보고하는 것이 안전합니다.

</details>

**5.** 휴지기 분석에서 task GLM의 표준 단계인 prewhitening을 하지 않는 이유는?

<details><summary>정답 보기</summary>

prewhitening은 시간 자기상관을 제거하는데, 휴지기 연결성의 관심 신호가 바로 그 느린(저주파) 요동이기 때문입니다. 대신 방해 신호 회귀와 대역 필터로 잡음을 다루고, 상관 검정의 자유도를 방해 회귀변수 수만큼 줄여 계산합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 과제가 만든 상관과 잔차 상관을 비교했다.
- [ ] PPI 모형을 구성하고 회귀변수를 빼면 결과가 어떻게 변하는지 확인했다.
- [ ] 움직임이 연결 행렬과 그래프 지표를 어떻게 바꾸는지 확인했다.
- [ ] `figures/advanced/D/D6_connectivity_matrix.png`를 저장했다.
- [ ] 질환 연결성 결과를 읽을 때의 질문 다섯 개를 적었다.

## 더 읽을거리
- Poldrack RA, Mumford JA, Nichols TE. *Handbook of Functional MRI Data Analysis.* Cambridge University Press, 2011. <https://www.cambridge.org/core/books/handbook-of-functional-mri-data-analysis/8EDF966C65811FCCC306F7C916228529> — 8장(기능적·유효 연결성, 네트워크, 연결성 전처리).
- Friston KJ, et al. Psychophysiological and modulatory interactions in neuroimaging. *NeuroImage.* 1997;6:218–229. doi:[10.1006/nimg.1997.0291](https://doi.org/10.1006/nimg.1997.0291)
- Rissman J, Gazzaley A, D'Esposito M. Measuring functional connectivity during distinct stages of a cognitive task. *NeuroImage.* 2004;23:752–763. doi:[10.1016/j.neuroimage.2004.06.035](https://doi.org/10.1016/j.neuroimage.2004.06.035)
- Biswal B, et al. Functional connectivity in the motor cortex of resting human brain using echo-planar MRI. *Magn Reson Med.* 1995;34:537–541. doi:[10.1002/mrm.1910340409](https://doi.org/10.1002/mrm.1910340409)
- Greicius MD, et al. Default-mode network activity distinguishes Alzheimer's disease from healthy aging. *PNAS.* 2004;101:4637–4642. doi:[10.1073/pnas.0308627101](https://doi.org/10.1073/pnas.0308627101)
- Murphy K, et al. The impact of global signal regression on resting state correlations: are anti-correlated networks introduced? *NeuroImage.* 2009;44:893–905. doi:[10.1016/j.neuroimage.2008.09.036](https://doi.org/10.1016/j.neuroimage.2008.09.036)
- Ciric R, et al. Benchmarking of participant-level confound regression strategies for the control of motion artifact in studies of functional connectivity. *NeuroImage.* 2017;154:174–187. doi:[10.1016/j.neuroimage.2017.03.020](https://doi.org/10.1016/j.neuroimage.2017.03.020)

---
[← 이전](day-D5.md) · [코스 지도](../../../README.md) · [다음 →](day-D7.md)
