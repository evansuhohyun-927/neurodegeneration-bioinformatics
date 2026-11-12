# Day C6 — spike train 분석: raster, PSTH, 발화율, ISI, tuning curve

> **주차:** 심화 파트 C — 신경신호·시간-주파수 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/C/C6_spikes.ipynb`, `figures/advanced/C/C6_raster_psth.png`
>
> **먼저 끝내 둘 레슨:** [Day C1](day-C1.md)(스파이크가 무엇이고 어떻게 저장되는가), [Day C2](day-C2.md)(가우시안 커널 convolution). 분포·평균·분산은 [Day 8 — 분포와 요약통계](../../week-2/day-08.md)를 떠올리면 됩니다.

## 오늘의 목표
- 스파이크 시각 목록을 0/1 행렬로 바꾸고, raster와 PSTH(단위: 스파이크/초)를 만들 수 있다.
- 시간에 따라 발화율이 변하는 Poisson 스파이크를 만들고, ISI·CV·Fano factor로 발화의 규칙성을 요약할 수 있다.
- 방향별 발화율로 tuning curve를 만들고 cosine 곡선을 적합해 선호 방향을 추정할 수 있다.

## 🎬 영상으로 먼저 보기

- [Brain Signals: Spiking Activity — Neuromatch](https://www.youtube.com/watch?v=1nhioy3f9BY) (23:53)
- **무엇에 주목할까:** 원파형에서 스파이크를 찾고, 시각만 남겨 raster로 그리는 흐름을 보세요. 스파이크의 크기가 아니라 **시각**이 정보라는 관점이 오늘 전체의 바탕입니다.

- [Calculating a peri stimulus time histogram (PSTH) — anne churchland](https://www.youtube.com/watch?v=B42M3o1expw) (7:55)
- **무엇에 주목할까:** 시행마다 같은 사건 기준으로 정렬하고, 시간 칸마다 스파이크를 세어 시행 수와 칸 폭으로 나누는 순서만 따라가면 됩니다.

## 개념 설명

### 스파이크 데이터의 두 가지 모양

스파이크는 크기가 거의 일정한 사건이라, 보통 **언제 쐈는가**만 저장합니다. 이 목록을 **spike train(스파이크 열)** 이라 합니다. 분석할 때는 두 가지 모양을 오갑니다. 하나는 시행마다 스파이크 시각 목록(희소, sparse)이고, 다른 하나는 1 ms 같은 작은 칸으로 나눠 스파이크가 있으면 1, 없으면 0으로 채운 `시행 × 시간` 행렬(전체, full)입니다. 목록은 저장 공간을 적게 쓰고 정밀한 시각을 유지하며, 행렬은 평균·convolution·행렬 연산이 쉽습니다. 칸이 너무 넓으면 한 칸에 스파이크가 둘 이상 들어가 0/1이 아니게 되니, 칸 폭은 불응기(약 1–2 ms)보다 작게 잡습니다.

**raster plot** 은 시행을 세로로 쌓고 스파이크마다 눈금 하나를 찍은 그림입니다. 시행 간 변동을 그대로 보여 주므로, 요약 전에 반드시 먼저 봅니다. 시행 순서를 반응 시간이나 조건으로 정렬해 그리면 숨은 패턴이 드러나기도 합니다.

### PSTH와 spike density: 단위는 스파이크/초

**PSTH(peri-stimulus time histogram, 사건 주변 시간 히스토그램)** 는 사건(자극, 운동 시작 등)에 맞춰 정렬한 모든 시행에서 시간 칸마다 스파이크를 세어 더한 것입니다. 그대로 두면 단위가 "스파이크 개수"라 칸 폭과 시행 수에 따라 숫자가 바뀝니다. **시행 수와 칸 폭(초)으로 나눠 스파이크/초(Hz)** 로 바꿔야 다른 실험·다른 세포와 비교할 수 있습니다. 칸이 좁으면 들쭉날쭉하고, 넓으면 빠른 변화를 놓칩니다. C3의 해상도 trade-off와 같은 이야기입니다.

칸 경계에 결과가 좌우되는 히스토그램 대신, 1 ms 행렬을 가우시안 커널로 convolution해 매끄러운 곡선을 만들 수 있습니다. 이것을 **spike density function(SDF)** 이라 합니다(C2의 convolution 그대로). 커널 폭(σ)이 곧 시간 해상도이므로, 쓴 커널을 반드시 보고합니다.

### 스파이크를 만드는 모형: Poisson 과정

스파이크가 "평균 r Hz로, 서로 독립적으로, 언제든 같은 확률로" 일어난다고 가정한 모형이 **Poisson 과정**입니다. 이때 일정 시간 T 동안의 스파이크 수는 평균 rT인 Poisson 분포를 따르고(평균 = 분산), 스파이크 사이 간격(**ISI, inter-spike interval**)은 지수 분포를 따릅니다. 발화율이 시간에 따라 변하는 경우(비균질 Poisson)는, 최대 발화율로 스파이크를 넉넉히 만든 뒤 "그 시각의 발화율 / 최대 발화율" 확률로만 남기는 **thinning**으로 간단히 만들 수 있습니다(예시 1).

실제 세포는 Poisson과 다릅니다. 스파이크 직후 1–3 ms는 쏠 수 없는 **불응기(refractory period)** 가 있고, 어떤 세포는 시계처럼 규칙적으로, 어떤 세포는 몰아서(burst) 쏩니다. 이를 요약하는 두 숫자가 있습니다. **CV(변동계수) = ISI의 SD / ISI의 평균**은 Poisson이면 약 1, 규칙적이면 0에 가깝고, 몰아 쏘면 1보다 큽니다. **Fano factor = 시행 간 스파이크 수의 분산 / 평균**은 Poisson이면 약 1입니다. ISI 히스토그램에서 0–2 ms 칸이 비어 있지 않다면, 불응기를 어긴 것이므로 두 세포가 섞였을(spike sorting 오류) 가능성을 의심합니다(C7).

스파이크의 **리듬**은 자기상관(autocorrelogram)으로 봅니다. 모든 스파이크 쌍의 시차를 히스토그램으로 그리면, 불응기는 0 근처의 빈 골짜기로, 규칙적 리듬은 일정 간격의 봉우리로 나타납니다. 두 세포의 시차를 모으면 상호상관(cross-correlogram)이 되고, 같은 생각을 LFP에 적용해 "스파이크가 LFP의 어느 위상에서 나오는가"를 C5의 위상 화살표 평균으로 재면 **spike-field coherence(스파이크-LFP 위상 고정)** 가 됩니다.

### tuning curve와 부호화 모형

**tuning curve(조율 곡선)** 는 자극의 한 성질(움직임 방향, 선의 기울기, 소리 높이)에 따라 발화율이 어떻게 변하는지 그린 곡선입니다. 가장 많이 쏘는 값이 **선호 자극(preferred stimulus)** 입니다. 운동 피질 세포의 방향 조율은 흔히 cosine 곡선 r(θ) = b + d·cos(θ − θ_pref)로 잘 요약됩니다. 방향마다 반복 시행의 평균과 표준오차를 점과 막대로 그리고, 곡선을 적합해 선호 방향을 읽습니다.

곡선 적합에는 두 길이 있습니다. 평균 발화율에 최소제곱으로 맞추는 방법(`scipy.optimize.curve_fit`)은 간단하지만, 발화율은 음수가 될 수 없고 스파이크 수의 분산이 평균에 비례한다는 사실을 무시합니다. 기저 발화가 낮은 세포에서는 곡선이 0 아래로 내려가는 엉뚱한 적합이 나오기도 합니다. 대안은 스파이크 **개수**가 Poisson 분포를 따른다고 보고 log(발화율)을 cos·sin의 선형 결합으로 두는 **Poisson GLM(일반화 선형 모형)** 입니다. log 연결 덕분에 예측 발화율이 항상 양수입니다(예시 3). 거꾸로 발화율에서 자극을 추정하는 것을 **decoding(해독)** 이라 하고, 내일(C7) 검증 원칙과 함께 다룹니다.

## 예시로 이해하기

> 예시의 스파이크는 모두 코드 안에서 만든 **가상 데이터**입니다.

### 예시 1 — Poisson 스파이크 만들기, raster 행렬, PSTH, SDF

```python
import numpy as np

rng = np.random.default_rng(9)
t0, t1 = -0.5, 1.0                     # 자극 전 0.5초 ~ 후 1.0초
def rate(t):                            # 참 발화율(Hz): 기저 5 Hz, 자극 후 0.1–0.3초에 40 Hz까지 오름
    return 5 + 35 * np.exp(-((t - 0.2) ** 2) / (2 * 0.05 ** 2))

def inhomogeneous_poisson(rate_fn, r_max):
    """thinning: 최대 발화율로 균일 Poisson 스파이크를 만든 뒤, rate/r_max 확률로 남긴다"""
    n = rng.poisson(r_max * (t1 - t0))
    cand = np.sort(rng.uniform(t0, t1, n))
    return cand[rng.uniform(0, 1, n) < rate_fn(cand) / r_max]

n_tr = 60
trains = [inhomogeneous_poisson(rate, 40) for _ in range(n_tr)]      # 시행마다 스파이크 시각 목록
print("시행 1의 스파이크 시각(초):", np.round(trains[0], 3))
print("시행당 평균 스파이크 수: %.1f" % np.mean([len(s) for s in trains]))

# raster를 0/1 행렬로: 1 ms 칸
dt = 0.001
edges = np.arange(t0, t1 + dt / 2, dt)
raster = np.array([np.histogram(s, edges)[0] for s in trains])        # 시행 × 시간
print("raster 행렬 모양:", raster.shape, "| 칸 하나에 스파이크 2개 이상인 곳:", int((raster > 1).sum()))

# PSTH: 20 ms 칸, 단위를 '스파이크/초(Hz)'로
bw = 0.020
pedges = np.arange(t0, t1 + bw / 2, bw)
counts = np.sum([np.histogram(s, pedges)[0] for s in trains], axis=0)
psth = counts / n_tr / bw
centers = pedges[:-1] + bw / 2
for c in [-0.25, 0.11, 0.21, 0.61]:
    i = np.argmin(np.abs(centers - c))
    print("t = %+.2f초: PSTH %.1f Hz (참값 %.1f Hz)" % (centers[i], psth[i], rate(centers[i])))

# spike density function: 1 ms raster의 시행 평균을 가우시안 커널(σ = 15 ms)로 매끄럽게
sig = 0.015
kt = np.arange(-4 * sig, 4 * sig + dt / 2, dt)
kern = np.exp(-kt ** 2 / (2 * sig ** 2)); kern /= kern.sum()
sdf = np.convolve(raster.mean(axis=0) / dt, kern, mode="same")
tc = edges[:-1] + dt / 2
print("SDF 최고점: %.3f초, %.1f Hz" % (tc[np.argmax(sdf)], sdf.max()))
```

실행 결과:

```text
시행 1의 스파이크 시각(초): [-0.207  0.217  0.227  0.31   0.877  0.944]
시행당 평균 스파이크 수: 11.3
raster 행렬 모양: (60, 1500) | 칸 하나에 스파이크 2개 이상인 곳: 8
t = -0.25초: PSTH 3.3 Hz (참값 5.0 Hz)
t = +0.11초: PSTH 12.5 Hz (참값 11.9 Hz)
t = +0.21초: PSTH 35.0 Hz (참값 39.3 Hz)
t = +0.61초: PSTH 6.7 Hz (참값 5.0 Hz)
SDF 최고점: 0.184초, 42.6 Hz
```

PSTH를 스파이크/초로 바꾸었기 때문에 참 발화율과 같은 단위로 비교할 수 있습니다. 20 ms 칸 하나에 시행 60개로는 값이 참값 주변에서 꽤 흔들립니다(−0.25초에서 3.3 vs 5.0 Hz). SDF는 최고점을 0.18–0.2초 근처, 약 40 Hz로 매끄럽게 잡았습니다. 1 ms 칸인데도 스파이크 2개가 한 칸에 들어간 곳이 8곳 있는 것은, 순수 Poisson 모형에 불응기가 없기 때문입니다.

### 예시 2 — ISI, CV, Fano factor, 그리고 불응기

```python
import numpy as np

rng = np.random.default_rng(10)
def poisson_train(r, T, dead=0.0):
    """일정 발화율 r Hz의 Poisson 스파이크. dead > 0이면 스파이크 뒤 dead초 동안 못 쏜다(불응기)"""
    isi = rng.exponential(1 / r, int(r * T * 3)) + dead
    st = np.cumsum(isi)
    return st[st < T]

def describe(name, trains, T):
    isi = np.concatenate([np.diff(s) for s in trains])
    cv = isi.std() / isi.mean()                                 # ISI 변동계수
    counts = np.array([len(s) for s in trains])
    fano = counts.var(ddof=1) / counts.mean()                   # 시행 간 스파이크 수의 분산/평균
    short = np.mean(isi < 0.002) * 100
    print("%-18s 발화율 %.1f Hz | CV %.2f | Fano %.2f | ISI<2ms %.1f%%" % (name, counts.mean() / T, cv, fano, short))

T, r = 2.0, 20
describe("Poisson", [poisson_train(r, T) for _ in range(200)], T)
describe("Poisson+불응기 3ms", [poisson_train(r / (1 - r * 0.003), T, 0.003) for _ in range(200)], T)
# 규칙적으로 쏘는 세포: ISI가 평균 50 ms, SD 5 ms인 정규분포
def regular_train(T):
    st = np.cumsum(np.abs(rng.normal(0.05, 0.005, 80)))
    return st[st < T]
describe("규칙적 발화", [regular_train(T) for _ in range(200)], T)

# 자기상관(autocorrelogram)의 핵심: 모든 스파이크 쌍의 시차를 모은다 (±30 ms)
s = poisson_train(r / (1 - r * 0.003), 200, 0.003)
d = s[None, :] - s[:, None]
lags = np.abs(d[(d != 0) & (np.abs(d) <= 0.03)])
print("시차 0–2 ms인 쌍: %d개 | 시차 10–12 ms인 쌍: %d개" % ((lags < 0.002).sum(), ((lags > 0.010) & (lags < 0.012)).sum()))
```

실행 결과:

```text
Poisson            발화율 20.0 Hz | CV 1.02 | Fano 0.98 | ISI<2ms 4.1%
Poisson+불응기 3ms    발화율 20.0 Hz | CV 0.95 | Fano 0.91 | ISI<2ms 0.0%
규칙적 발화             발화율 19.8 Hz | CV 0.10 | Fano 0.01 | ISI<2ms 0.0%
시차 0–2 ms인 쌍: 0개 | 시차 10–12 ms인 쌍: 354개
```

순수 Poisson은 CV와 Fano가 1 근처이고, ISI의 4%가 2 ms보다 짧습니다. 3 ms 불응기를 넣으면 짧은 ISI가 사라지고 CV가 1보다 조금 작아집니다. 규칙적으로 쏘는 세포는 CV 0.10, Fano 0.01입니다. 불응기 세포의 자기상관에서는 시차 0–2 ms 쌍이 하나도 없습니다.

### 예시 3 — 방향 tuning curve와 cosine 적합

```python
import numpy as np
from scipy.optimize import curve_fit, minimize

rng = np.random.default_rng(11)
dirs = np.deg2rad(np.arange(0, 360, 45))            # 8방향
n_rep = 12                                          # 방향마다 12번 반복
pref_true = np.deg2rad(135)
def cos_tune(th, base, depth, pref):
    return base + depth * np.cos(th - pref)

theta = np.repeat(dirs, n_rep)
T = 0.5                                             # 0.5초 창에서 센 스파이크 수
lam = np.clip(cos_tune(theta, 20, 15, pref_true), 0, None) * T
counts = rng.poisson(lam)
rate = counts / T                                   # 스파이크/초

mean_r = np.array([rate[theta == d].mean() for d in dirs])
sem_r = np.array([rate[theta == d].std(ddof=1) / np.sqrt(n_rep) for d in dirs])
for d, m, s in zip(np.rad2deg(dirs), mean_r, sem_r):
    print("%3d°: %5.1f ± %.1f Hz" % (d, m, s))

# (1) 최소제곱 cosine 적합 (시행 하나하나를 넣는다)
p, cov = curve_fit(cos_tune, theta, rate, p0=[rate.mean(), 5, 0])
base, depth, pref = p
if depth < 0:                                       # 진폭이 음수로 나오면 같은 곡선을 180° 돌려 표현
    depth, pref = -depth, pref + np.pi
print("최소제곱: 기저 %.1f Hz, 변조 %.1f Hz, 선호 방향 %.0f°" % (base, depth, np.rad2deg(pref) % 360))

# (2) Poisson 우도 최대화: log(λ) = b0 + b1 cosθ + b2 sinθ  (Poisson GLM과 같은 모양)
X = np.column_stack([np.ones_like(theta), np.cos(theta), np.sin(theta)])
def nll(b):
    eta = X @ b
    return np.sum(np.exp(eta) * T - counts * eta)   # 음의 로그우도 (상수항 생략)
b = minimize(nll, np.zeros(3)).x
print("Poisson GLM: 선호 방향 %.0f° (참값 135°)" % (np.rad2deg(np.arctan2(b[2], b[1])) % 360))
```

실행 결과:

```text
  0°:   8.0 ± 1.1 Hz
 45°:  20.2 ± 2.2 Hz
 90°:  28.0 ± 2.0 Hz
135°:  33.3 ± 3.0 Hz
180°:  27.7 ± 1.7 Hz
225°:  21.3 ± 1.2 Hz
270°:   9.3 ± 1.3 Hz
315°:   4.5 ± 0.9 Hz
최소제곱: 기저 19.0 Hz, 변조 14.0 Hz, 선호 방향 137°
Poisson GLM: 선호 방향 137° (참값 135°)
```

두 방법 모두 선호 방향을 137°로 추정했습니다(참값 135°). 이 세포는 기저 발화가 충분히 높아 두 방법이 비슷하지만, 315°처럼 발화율이 0 근처인 방향이 많은 세포에서는 최소제곱 cosine이 음수 발화율을 예측하고 Poisson GLM이 더 자연스러운 곡선을 줍니다.

## 직접 해보기

1. `notebooks/advanced/C/C6_spikes.ipynb`를 만들고 예시 1–3을 실행합니다.
2. 예시 1의 결과로 위에는 raster(`plt.eventplot(trains)`), 아래에는 PSTH 막대와 SDF 곡선, 참 발화율 점선을 겹친 그림을 그려 `figures/advanced/C/C6_raster_psth.png`로 저장합니다. 세로축 단위 "스파이크/초"를 꼭 적습니다.
3. PSTH 칸 폭을 5, 20, 100 ms로, SDF의 σ를 5, 15, 50 ms로 바꿔 보고 "봉우리 시각"과 "들쭉날쭉함"이 어떻게 바뀌는지 표로 정리합니다.
4. 예시 2에 **몰아 쏘는(burst) 세포**를 추가해 보세요. 예: 스파이크 하나마다 50% 확률로 3 ms 뒤에 스파이크를 하나 더 붙입니다. CV가 1보다 커지는지 확인합니다.
5. 예시 3에서 기저 발화를 20 → 3 Hz로 낮추고(`cos_tune(theta, 3, 15, pref_true)`), 최소제곱 곡선의 최솟값이 음수가 되는지, 두 방법의 선호 방향 추정이 어떻게 달라지는지 비교합니다.
6. **spike-field 위상 고정 맛보기:** C5 예시 1처럼 10 Hz LFP를 만들고 위상을 구한 뒤, 위상이 0 근처일 때 발화 확률이 높은 스파이크(thinning으로 rate ∝ 1 + cos(위상))를 만들어 보세요. 스파이크 시각의 위상들을 화살표로 평균한 길이가 위상과 무관한 스파이크보다 큰지 확인합니다.

> ⚠️ **흔한 오류 1:** PSTH 세로축을 "스파이크 수"로 둔 채 칸 폭이나 시행 수가 다른 두 그림을 비교합니다. 항상 (개수) ÷ (시행 수) ÷ (칸 폭, 초)로 스파이크/초로 바꿉니다. 시간이 ms 단위면 1000으로 나누는 것을 잊지 마세요.
>
> ⚠️ **흔한 오류 2:** `np.histogram`의 칸 경계를 `np.arange(t0, t1, dt)`로 만들면 마지막 경계가 빠져 칸 하나가 사라집니다. 예시처럼 `np.arange(t0, t1 + dt/2, dt)`로 끝 경계까지 포함하고, 칸 수를 출력해 확인합니다.

## 퀴즈

**1.** 40시행, 50 ms 칸에서 어떤 칸의 스파이크 합이 60개였다. 이 칸의 PSTH 값은 몇 Hz인가?

<details><summary>정답 보기</summary>

60 ÷ 40 ÷ 0.05 = 30 Hz. 시행당 평균 1.5개가 0.05초 동안 나왔다는 뜻이므로 초당 30개입니다.

</details>

**2.** ISI 히스토그램에서 1 ms 이하 간격이 전체의 3%였다. 무엇을 의심해야 하는가?

<details><summary>정답 보기</summary>

한 세포는 불응기 때문에 1 ms 이하 간격으로 쏘기 어렵습니다. 둘 이상의 세포가 한 "unit"으로 묶였거나(spike sorting 오류), 잡음이 스파이크로 검출되었을 가능성을 먼저 의심합니다.

</details>

**3.** 어떤 세포의 ISI CV가 0.15, 다른 세포는 1.6이다. 각각 어떤 발화 양상으로 해석하는가?

<details><summary>정답 보기</summary>

CV 0.15는 간격이 매우 일정한 규칙적 발화(예: pacemaker 성질), CV 1.6은 Poisson보다 불규칙한, 몰아 쏘는(burst) 양상입니다. Poisson 기준은 약 1입니다.

</details>

**4.** 발화율 tuning curve를 최소제곱 cosine으로 적합했더니 몇몇 방향에서 예측 발화율이 −4 Hz였다. 왜 이런 일이 생기고, 대안은?

<details><summary>정답 보기</summary>

cosine은 대칭인 곡선이라, 기저 발화가 낮고 선호 방향에서만 크게 쏘는 세포에서는 반대 방향에서 0 아래로 내려갑니다. 최소제곱은 발화율이 음수가 될 수 없다는 제약을 모릅니다. 스파이크 수를 Poisson으로 보고 log 연결을 쓰는 Poisson GLM(지수 cosine 모형)을 쓰면 예측이 항상 양수입니다.

</details>

**5.** SDF를 그릴 때 쓴 가우시안 σ를 보고해야 하는 이유는?

<details><summary>정답 보기</summary>

σ가 곧 시간 해상도이기 때문입니다. σ가 크면 빠른 변화가 뭉개지고 반응 시작이 앞당겨진 것처럼 보이며, σ가 작으면 잡음이 큽니다. 같은 데이터도 σ에 따라 봉우리 시각과 높이가 달라집니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3이 노트북에서 실행된다.
- [ ] `figures/advanced/C/C6_raster_psth.png`에 raster, PSTH(Hz), SDF, 참 발화율이 함께 있다.
- [ ] 칸 폭·σ 비교표, burst 세포의 CV를 적었다.
- [ ] 낮은 기저 발화에서 최소제곱 vs Poisson GLM 비교 결과를 적었다.

## MATLAB으로는

스파이크 세기는 `histcounts`(옛 코드는 `histc`), 0/1 행렬은 `sparse`·`full`, raster는 `imagesc` 또는 `line`, SDF는 `conv`와 `normpdf`, cosine 적합은 `nlinfit`·`fit`, Poisson GLM은 `glmfit(..., 'poisson')`·`fitglm`, Poisson 난수는 `poissrnd`·`exprnd`입니다. 자세한 문법은 [파트 B — MATLAB](../B-matlab/)에서 다룹니다.

## 더 읽을거리
- Kass RE, Ventura V, Brown EN. Statistical issues in the analysis of neuronal data. *Journal of Neurophysiology* 94:8–25 (2005). [doi:10.1152/jn.00648.2004](https://doi.org/10.1152/jn.00648.2004)
- Elephant(Python 스파이크 분석 라이브러리) 문서: <https://elephant.readthedocs.io/en/latest/>
- Pascal Wallisch 외, *MATLAB for Neuroscientists*, 2nd ed., Academic Press (2014) — 부호화(raster, PETH, tuning curve), binned spike와 Poisson 모형, Poisson 과정 장. [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0)
- Mike X Cohen, *MATLAB for Brain and Cognitive Scientists*, MIT Press (2017) — 행렬로 다루는 스파이크, 스파이크 타이밍 장. [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/)

---
[← 이전](day-C5.md) · [코스 지도](../../../README.md) · [다음 →](day-C7.md)
