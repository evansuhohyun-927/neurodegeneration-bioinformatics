# Day C4 — 시간-주파수 분석: Morlet wavelet, STFT, 기저선 정규화

> **주차:** 심화 파트 C — 신경신호·시간-주파수 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/C/C4_time_frequency.ipynb`, `figures/advanced/C/C4_tf_db.png`
>
> **먼저 끝내 둘 레슨:** [Day C2](day-C2.md)(FFT로 하는 convolution, 날개 자르기), [Day C3](day-C3.md)(진폭 보정, 해상도).

## 오늘의 목표
- 복소 Morlet wavelet을 만들고, cycle 수가 시간·주파수 정밀도를 어떻게 맞바꾸는지 반치폭(FWHM)으로 설명할 수 있다.
- 여러 시행에 wavelet convolution을 해 시간-주파수 power map을 만들고, dB·% 변화·z로 기저선 정규화할 수 있다.
- "시행마다 power를 구해 평균(total)"과 "평균 파형의 power(evoked)"의 차이, STFT와 wavelet의 차이를 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [Morlet wavelets in time and in frequency — Mike X Cohen](https://www.youtube.com/watch?v=7ahrcB5HL0k) (17:48)
- **무엇에 주목할까:** 가우시안을 넓히면 시간 영역에서는 wavelet이 길어지고 주파수 영역에서는 봉우리가 좁아지는 그림을 보세요. 오늘 예시 1의 FWHM 표가 같은 내용을 숫자로 보여 줍니다.

- [Baseline normalization of time-frequency power — Mike X Cohen](https://www.youtube.com/watch?v=4m3d5eQzCYk) (18:35)
- **무엇에 주목할까:** 원래 power map에서는 낮은 주파수만 밝게 보이는데, 기저선으로 나누면 높은 주파수의 변화까지 같은 눈금에서 보이게 되는 과정을 따라가세요.

## 개념 설명

### 왜 시간-주파수인가, 그리고 피할 수 없는 trade-off

C3의 스펙트럼은 구간 전체를 한 줄로 요약하므로 "언제"가 사라집니다. 뇌는 자극 뒤 수백 ms 안에 리듬을 바꾸기 때문에, **시간마다 스펙트럼**을 보는 **시간-주파수(time-frequency, TF) 분석**이 필요합니다. 결과는 가로 시간, 세로 주파수, 색 power인 그림입니다.

여기에는 피할 수 없는 맞바꿈이 있습니다. 주파수를 정밀하게 재려면 긴 구간을 봐야 하고(C3), 긴 구간을 보면 "정확히 언제"가 흐려집니다. 짧게 보면 그 반대입니다. 현미경의 배율과 시야가 함께 커질 수 없는 것과 같습니다. 모든 TF 방법은 이 맞바꿈을 **어디에 둘지** 고르는 방법이라고 생각하면 됩니다.

### 복소 Morlet wavelet

**Morlet wavelet** 은 사인파에 가우시안(종 모양)을 곱해 양 끝을 0으로 줄인 짧은 파형입니다. **복소** Morlet wavelet은 복소 사인파(C3의 회전하는 화살표)에 가우시안을 곱한 것이고, 신호와 convolution하면 결과가 복소수로 나와 **시간마다** 진폭과 위상을 한꺼번에 얻습니다. 주파수 f마다 wavelet을 하나씩 만들어 convolution을 반복하면 TF map이 됩니다.

가우시안의 폭은 보통 **cycle 수** n으로 정합니다. 표준편차 s = n / (2πf)입니다. n이 작으면(3–4) 시간 정밀도가 좋고 주파수가 넓게 번지며, n이 크면(10 이상) 반대입니다. 낮은 주파수는 한 주기 자체가 길기 때문에, 흔히 **주파수가 올라갈수록 cycle 수를 늘려**(예: 4 Hz에서 4 cycles → 60 Hz에서 10 cycles) 균형을 맞춥니다. 같은 설정을 다른 사람이 정확히 재현할 수 있도록, cycle 수 대신 **시간·주파수 반치폭(FWHM)** 을 보고하자는 제안도 있습니다(더 읽을거리의 Cohen 2019).

계산 요령은 C2와 같습니다. 신호의 FFT는 주파수 반복 **밖에서 한 번만** 구하고, wavelet마다 FFT를 곱한 뒤 역FFT하고 날개를 자릅니다. wavelet의 FFT를 최댓값 1로 나눠 두면 결과가 원래 신호 단위로 나옵니다(실수 사인파이므로 C3처럼 ×2). 주파수는 보통 **로그 간격**(`np.logspace`)으로 잡습니다. 낮은 주파수에서 1 Hz 차이는 크지만 높은 주파수에서는 작기 때문입니다.

### 가장자리 효과와 여러 시행 다루기

wavelet 자체에는 모서리가 없지만, 데이터의 처음과 끝은 모서리입니다. convolution이 데이터 끝에 걸치면 큰 가짜 power가 생기고, 이 효과는 대략 그 주파수의 **1–2주기** 동안 이어집니다(10 Hz면 100–200 ms). 해결은 **epoch를 넉넉하게 길게 잘라** 해석할 구간이 가장자리에서 충분히 떨어지게 하는 것입니다. 데이터를 거울처럼 이어 붙이는(reflection) 방법도 있지만, 덧댄 부분은 절대 해석하지 않습니다.

시행이 여러 개면 **시행마다** convolution해서 power를 구한 뒤 시행에 걸쳐 평균합니다. 이것을 **total power**라 합니다. 반대로 시행을 먼저 평균해(ERP) 그 파형의 power를 구하면 **evoked power**입니다. 시행마다 위상이 제각각인 리듬은 평균하는 순간 서로 상쇄되어 evoked에서는 사라집니다. 자극에 "위상까지 맞춰" 나오는 반응은 둘 다에 보이고, 위상은 제각각이지만 세기가 바뀌는 **유도(induced)** 반응은 total에만 보입니다(예시 2). 계산을 빠르게 하려고 시행들을 이어 붙여 긴 신호 하나로 convolution한 뒤 다시 시행 단위로 자르는 방법(super-trial)도 씁니다.

### 기저선 정규화: dB, % 변화, z

원래 power map은 1/f 배경 때문에 낮은 주파수만 밝고, 전극·사람·장비마다 절대값이 달라 비교가 어렵습니다. 그래서 자극 전 구간(**기저선, baseline**)의 평균 power로 나눠 "평소보다 얼마나 변했나"로 바꿉니다. **dB** = 10·log10(P / 기저선)은 증가와 감소를 대칭으로 보여 줍니다(2배 = +3 dB, 절반 = −3 dB). **% 변화** = 100·(P − 기저선)/기저선은 읽기 쉽지만, 감소는 −100%에서 막히고 증가는 끝없이 커져 비대칭입니다. **z 변환**은 기저선의 변동(SD)으로 나눠 통계에 가깝게 만듭니다.

기저선은 한 점이 아니라 **구간의 평균**(예: −500 ~ −200 ms)으로 잡고, 자극 직전은 가장자리 번짐·예측 효과가 섞일 수 있어 조금 떨어뜨립니다. 기저선 power가 원래 작은 주파수에서는 작은 변화도 % 변화가 수천 %로 부풀 수 있다는 점도 기억하세요(예시 2의 theta).

### STFT: 짧은 창으로 FFT 반복

**STFT(short-time Fourier transform)** 는 일정 길이의 창을 조금씩 옮기며 창마다 테이퍼를 씌워 FFT합니다(`scipy.signal.spectrogram`, `stft`). 모든 주파수에 **같은 창 길이**를 쓰므로 주파수 해상도가 일정합니다. wavelet은 주파수마다 길이가 달라지므로, 낮은 주파수에서는 길게, 높은 주파수에서는 짧게 봅니다. 결과는 대개 비슷하고, 둘 다 같은 trade-off 안에서 고른 것일 뿐입니다. STFT는 창의 절반만큼 처음과 끝의 시점을 추정하지 못하고, 창 이동 간격만큼 시간 칸이 성깁니다. `pywt.cwt`(PyWavelets)는 wavelet 변환을 함수 하나로 해 주는데, 주파수 대신 **scale**을 받으므로 `pywt.frequency2scale`로 바꿔 씁니다(예시 3). 신호를 2의 거듭제곱 scale로 쪼개는 **이산 wavelet 변환(DWT)** 은 잡음 제거나 spike 파형 특징 추출에 쓰이고, 오늘의 TF map과는 목적이 다릅니다.

## 예시로 이해하기

> 예시의 신호는 모두 코드 안에서 만든 **가상 신호**입니다.

### 예시 1 — wavelet 만들기와 진폭 되찾기

```python
import numpy as np

fs = 500
def morlet(freq, n_cycles, fs):
    """복소 Morlet wavelet: 복소 사인파 × 가우시안. 시간축은 0을 중심으로 대칭(홀수 개)"""
    wt = np.arange(-2, 2 + 1 / fs, 1 / fs)
    s = n_cycles / (2 * np.pi * freq)              # 가우시안의 표준편차(초)
    return wt, np.exp(2j * np.pi * freq * wt) * np.exp(-wt ** 2 / (2 * s ** 2)), s

for nc in [3, 7, 12]:
    wt, w, s = morlet(10, nc, fs)
    fwhm_t = 2 * np.sqrt(2 * np.log(2)) * s       # 시간 영역 반치폭
    fwhm_f = 2 * np.sqrt(2 * np.log(2)) / (2 * np.pi * s)   # 주파수 영역 반치폭
    print("10 Hz, %2d cycles: 시간 FWHM %4.0f ms | 주파수 FWHM %.1f Hz" % (nc, 1000 * fwhm_t, fwhm_f))

def wavelet_power(x, freqs, n_cycles, fs):
    """FFT 곱으로 wavelet convolution. 반환: (주파수 × 시간) 복소 결과"""
    wt, _, _ = morlet(freqs[0], 3, fs)
    L = len(x) + len(wt) - 1
    X = np.fft.fft(x, L)
    half = (len(wt) - 1) // 2
    out = np.zeros((len(freqs), len(x)), dtype=complex)
    for i, (f, nc) in enumerate(zip(freqs, n_cycles)):
        _, w, _ = morlet(f, nc, fs)
        W = np.fft.fft(w, L)
        W /= np.abs(W).max()                       # 주파수 영역 최댓값을 1로: 진폭이 원 단위로 나온다
        out[i] = np.fft.ifft(X * W)[half:half + len(x)]   # 날개 자르기
    return out

# 시험 신호: 1–2초에 진폭 1인 15 Hz, 2.5–3초에 진폭 2인 40 Hz
t = np.arange(0, 4, 1 / fs)
x = np.where((t >= 1) & (t < 2), np.sin(2 * np.pi * 15 * t), 0) \
  + np.where((t >= 2.5) & (t < 3), 2 * np.sin(2 * np.pi * 40 * t), 0)
freqs = np.logspace(np.log10(4), np.log10(60), 30)        # 4–60 Hz 로그 간격
n_cycles = np.logspace(np.log10(4), np.log10(10), 30)     # 낮은 주파수 4 cycles -> 높은 주파수 10 cycles
tf = wavelet_power(x, freqs, n_cycles, fs)
amp = 2 * np.abs(tf)    # 실수 사인파는 양·음 주파수에 반씩 나뉘므로 ×2 (C3과 같은 이유). power는 이것의 제곱

for f0, (a, b) in [(15, (1.3, 1.7)), (40, (2.6, 2.9))]:
    i = np.argmin(np.abs(freqs - f0))
    sel = (t >= a) & (t <= b)
    print("%.1f Hz 부근, %.1f–%.1f초 평균 진폭: %.2f" % (freqs[i], a, b, amp[i, sel].mean()))
i40 = np.argmin(np.abs(freqs - 40))
print("40 Hz 진폭이 최대인 시각: %.2f초" % t[np.argmax(amp[i40])])
```

실행 결과:

```text
10 Hz,  3 cycles: 시간 FWHM  112 ms | 주파수 FWHM 7.8 Hz
10 Hz,  7 cycles: 시간 FWHM  262 ms | 주파수 FWHM 3.4 Hz
10 Hz, 12 cycles: 시간 FWHM  450 ms | 주파수 FWHM 2.0 Hz
14.8 Hz 부근, 1.3–1.7초 평균 진폭: 1.00
41.3 Hz 부근, 2.6–2.9초 평균 진폭: 1.92
40 Hz 진폭이 최대인 시각: 2.74초
```

cycle 수를 3 → 12로 늘리면 시간 반치폭은 112 → 450 ms로 넓어지고 주파수 반치폭은 7.8 → 2.0 Hz로 좁아집니다. 진폭 1인 15 Hz 구간은 1.00으로, 진폭 2인 40 Hz 구간은 가장 가까운 41.3 Hz 칸에서 1.92로 읽혔습니다(칸이 40 Hz에 정확히 있지 않아 조금 작습니다). 40 Hz 진폭은 2.5–3초 구간의 가운데쯤에서 가장 큽니다.

### 예시 2 — total vs evoked, 그리고 세 가지 정규화

```python
import numpy as np

def morlet(freq, n_cycles, fs):
    wt = np.arange(-2, 2 + 1 / fs, 1 / fs)
    s = n_cycles / (2 * np.pi * freq)
    return np.exp(2j * np.pi * freq * wt) * np.exp(-wt ** 2 / (2 * s ** 2))

def tf_power(x, freqs, n_cycles, fs):
    """x: 시행 × 시간. 반환: 주파수 × 시행 × 시간의 power"""
    n_tr, n_t = x.shape
    M = len(morlet(freqs[0], 3, fs)); half = (M - 1) // 2
    L = n_t + M - 1
    X = np.fft.fft(x, L, axis=1)
    P = np.zeros((len(freqs), n_tr, n_t))
    for i, (f, nc) in enumerate(zip(freqs, n_cycles)):
        W = np.fft.fft(morlet(f, nc, fs), L); W /= np.abs(W).max()
        P[i] = np.abs(np.fft.ifft(X * W, axis=1)[:, half:half + n_t] * 2) ** 2
    return P

rng = np.random.default_rng(4)
fs = 250
t = np.arange(-1, 1.5, 1 / fs)
n_tr = 40
gate_a = ((t > 0.3) & (t < 0.9)).astype(float)      # alpha가 줄어드는 구간
gate_t = ((t > 0.1) & (t < 0.5)).astype(float)      # theta가 나타나는 구간
trials = np.zeros((n_tr, len(t)))
for k in range(n_tr):
    alpha = (1 - 0.6 * gate_a) * np.sin(2 * np.pi * 10 * t + rng.uniform(0, 2 * np.pi))  # 시행마다 위상이 다름
    theta = gate_t * np.sin(2 * np.pi * 6 * t)                                            # 매 시행 같은 위상
    trials[k] = alpha + theta + rng.normal(0, 1, len(t))

freqs = np.arange(4, 31, 1.0)
nc = np.linspace(4, 8, len(freqs))
total = tf_power(trials, freqs, nc, fs).mean(axis=1)            # 시행마다 power -> 평균 (total)
evoked = tf_power(trials.mean(axis=0, keepdims=True), freqs, nc, fs)[:, 0]   # 평균 파형(ERP)의 power

base = (t >= -0.7) & (t <= -0.2)                                 # 기저선: 자극 전 -0.7 ~ -0.2초
def normalize(P):
    b = P[:, base].mean(axis=1, keepdims=True)
    sd = P[:, base].std(axis=1, keepdims=True)
    return 10 * np.log10(P / b), 100 * (P - b) / b, (P - b) / sd

db, pct, z = normalize(total)
def at(A, f, a, b_):
    return A[np.argmin(np.abs(freqs - f)), (t >= a) & (t <= b_)].mean()

print("            | total 원power | dB     | % 변화 | z    | evoked 원power")
for name, f, a, b_ in [("alpha 10 Hz", 10, 0.4, 0.8), ("theta 6 Hz", 6, 0.2, 0.4)]:
    print("%-11s | %13.2f | %+6.2f | %+6.1f | %+5.1f | %.3f" % (name, at(total, f, a, b_), at(db, f, a, b_), at(pct, f, a, b_), at(z, f, a, b_), at(evoked, f, a, b_)))
print("기저선 구간 alpha total power %.2f vs evoked power %.3f" % (at(total, 10, -0.7, -0.2), at(evoked, 10, -0.7, -0.2)))
```

실행 결과:

```text
            | total 원power | dB     | % 변화 | z    | evoked 원power
alpha 10 Hz |          0.26 |  -6.03 |  -75.0 | -17.7 | 0.027
theta 6 Hz  |          0.82 | +13.18 | +1984.7 | +155.6 | 0.769
기저선 구간 alpha total power 1.05 vs evoked power 0.004
```

읽는 법:
- **alpha 감소(유도 반응)** 는 total에서 −6 dB, −75%로 분명히 보이지만, evoked power는 기저선에서부터 거의 0입니다. 시행마다 위상이 달라 평균 파형에서 상쇄되었기 때문입니다. ERP만 보면 이 변화를 통째로 놓칩니다.
- **theta(위상 고정 반응)** 는 total과 evoked 모두에서 보입니다.
- theta의 % 변화가 +1985%나 되는 것은 기저선 theta power가 원래 작았기 때문입니다. 같은 변화도 dB로는 +13 dB로 다른 주파수와 비교하기 쉬운 눈금이 됩니다. z가 매우 크게 나온 것은 시행 평균 power의 기저선 SD가 작기 때문으로, z의 크기를 p-value처럼 읽으면 안 됩니다.

### 예시 3 — STFT의 창 길이, 그리고 PyWavelets

```python
import numpy as np
from scipy import signal
import pywt

fs = 500
t = np.arange(0, 4, 1 / fs)
# 2.000초에 아주 짧은(50 ms) 30 Hz 깜박임 + 내내 이어지는 10 Hz와 11 Hz
x = np.sin(2 * np.pi * 10 * t) + np.sin(2 * np.pi * 11 * t)
x += 3 * np.where((t >= 2.0) & (t < 2.05), np.sin(2 * np.pi * 30 * (t - 2.0)), 0)

for win in [0.1, 0.5, 2.0]:
    nper = int(win * fs)
    f, tt, S = signal.spectrogram(x, fs, window="hann", nperseg=nper, noverlap=nper - nper // 10)
    # (a) 10 Hz와 11 Hz가 따로 보이는가? 9–12 Hz 사이 봉우리가 2개면 구분된 것
    sel = (f >= 9) & (f <= 12)
    spec = S[sel].mean(axis=1)
    n_pk = len(signal.find_peaks(spec)[0])
    # (b) 30 Hz 깜박임이 얼마나 넓게 번지는가: 30 Hz 행에서 최고값 절반 이상인 시간 폭
    row = S[np.argmin(np.abs(f - 30))]
    width = (row > row.max() / 2).sum() * (tt[1] - tt[0])
    print("창 %.1f초: 주파수 간격 %.2f Hz | 10/11 Hz 구분: %s | 30 Hz 번짐 폭 %.2f초" % (win, f[1], "예" if n_pk >= 2 else "아니오", width))

# PyWavelets의 연속 wavelet 변환(복소 Morlet 'cmor'): scale을 주파수로 바꾸어 쓴다
wav = "cmor1.5-1.0"
target = np.array([10.5, 30.0])
scales = pywt.frequency2scale(wav, target / fs)
coef, fr = pywt.cwt(x, scales, wav, sampling_period=1 / fs)
print("pywt scale -> 주파수 확인:", np.round(fr, 2), "Hz")
print("30 Hz 계수가 가장 큰 시각: %.3f초" % t[np.argmax(np.abs(coef[1]))])
```

실행 결과:

```text
창 0.1초: 주파수 간격 10.00 Hz | 10/11 Hz 구분: 아니오 | 30 Hz 번짐 폭 0.04초
창 0.5초: 주파수 간격 2.00 Hz | 10/11 Hz 구분: 아니오 | 30 Hz 번짐 폭 0.20초
창 2.0초: 주파수 간격 0.50 Hz | 10/11 Hz 구분: 예 | 30 Hz 번짐 폭 0.60초
pywt scale -> 주파수 확인: [10.5 30. ] Hz
30 Hz 계수가 가장 큰 시각: 2.026초
```

0.1초 창은 50 ms짜리 30 Hz 깜박임을 0.04초 폭으로 거의 제자리에 잡지만, 10 Hz와 11 Hz를 가르지 못합니다. 2초 창은 두 리듬을 가르지만 깜박임을 0.6초로 번지게 만듭니다. 한 창 길이로 두 질문을 모두 만족시킬 수 없다는 것이 trade-off입니다. `pywt.cwt`는 요청한 10.5 Hz와 30 Hz를 정확히 돌려주었고, 30 Hz 계수는 깜박임 구간(2.00–2.05초)에서 가장 컸습니다.

## 직접 해보기

1. `notebooks/advanced/C/C4_time_frequency.ipynb`를 만들고 예시 1–3을 실행합니다.
2. 예시 2의 `db` 배열을 `plt.pcolormesh(t, freqs, db, cmap="RdBu_r", vmin=-8, vmax=8, shading="auto")`로 그리고, 색 막대(colorbar)에 "dB (기저선 −0.7 ~ −0.2초)"라고 적어 `figures/advanced/C/C4_tf_db.png`로 저장합니다. 0을 흰색으로 두는 대칭 색 범위가 증가·감소를 공정하게 보여 줍니다.
3. 같은 그림을 `total` 원 power로 그려 보고(정규화 전), 무엇이 보이고 무엇이 안 보이는지 두 그림을 나란히 비교합니다.
4. 예시 2의 `nc`를 모든 주파수에서 3으로, 다음엔 12로 바꿔 TF map을 다시 그립니다. 6 Hz theta 덩어리가 시간 방향·주파수 방향으로 어떻게 늘어나는지 적습니다.
5. **가장자리 효과 보기:** 예시 2의 `t`를 −0.3초부터 시작하도록 짧게 자른 데이터로 다시 계산하고, 기저선을 −0.25 ~ −0.05초로 바꿔 봅니다. 4–6 Hz의 기저선이 epoch 시작 모서리의 영향을 받아 결과가 어떻게 흔들리는지 확인하세요. 이것이 epoch를 넉넉히 자르는 이유입니다.
6. 기저선을 자극 **후** 구간(예: 1.0–1.4초)으로 잘못 잡으면 alpha 감소가 어떻게 보이는지 확인합니다. 기저선 선택이 결론을 바꿀 수 있다는 것을 노트에 적습니다.

> ⚠️ **흔한 오류 1:** wavelet 시간축을 `np.arange(-2, 2, 1/fs)`처럼 만들면 점 수가 짝수라 중심이 0에서 반 칸 어긋나고 위상이 조금 밀립니다. `np.arange(-2, 2 + 1/fs, 1/fs)`처럼 0을 가운데 둔 홀수 길이로 만듭니다.
>
> ⚠️ **흔한 오류 2:** 시행을 먼저 평균한 뒤 TF 분석을 하고 "power가 변하지 않았다"고 결론 내립니다. 그것은 evoked power일 뿐입니다. 유도 반응을 보려면 시행마다 power를 구한 뒤 평균합니다.

## 퀴즈

**1.** 8 Hz에서 cycle 수를 4에서 8로 늘리면 시간 정밀도와 주파수 정밀도는 각각 어떻게 되는가?

<details><summary>정답 보기</summary>

가우시안이 두 배 넓어지므로 시간 정밀도는 나빠지고(시간 반치폭 2배), 주파수 정밀도는 좋아집니다(주파수 반치폭 절반). 두 값의 곱은 일정하게 유지됩니다.

</details>

**2.** 시행마다 위상이 무작위인 10 Hz 리듬의 세기가 자극 후 절반으로 줄었다. evoked power와 total power 중 어디에서 이 변화가 보이는가?

<details><summary>정답 보기</summary>

total power입니다. 위상이 시행마다 다르면 평균 파형(ERP)에서 서로 상쇄되어 evoked power에는 처음부터 거의 남지 않습니다. 시행마다 power를 구한 뒤 평균해야 세기 변화가 보입니다.

</details>

**3.** 어떤 주파수의 power가 기저선의 4배가 되었다. dB로는? 기저선의 1/4로 줄었다면?

<details><summary>정답 보기</summary>

10·log10(4) ≈ +6.0 dB, 10·log10(1/4) ≈ −6.0 dB. dB는 증가와 감소가 대칭입니다. % 변화로는 +300%와 −75%로 비대칭이 됩니다.

</details>

**4.** 10 Hz wavelet 분석에서 epoch가 자극 전 0.1초부터 시작한다. 기저선을 −0.1 ~ 0초로 잡으면 무엇이 문제인가?

<details><summary>정답 보기</summary>

기저선 전체가 epoch 시작 모서리의 가장자리 효과 구간(10 Hz의 1–2주기 = 100–200 ms) 안에 들어 있어, 가짜 power가 기저선을 오염시킵니다. 자극 직전이라 반응이 번져 들어올 수도 있습니다. epoch를 더 길게 자르고 기저선을 모서리와 자극에서 모두 떨어뜨립니다.

</details>

**5.** STFT와 Morlet wavelet의 가장 큰 차이 하나를 "창 길이"로 설명하라.

<details><summary>정답 보기</summary>

STFT는 모든 주파수에 같은 길이의 창을 쓰므로 주파수 해상도가 일정합니다. Morlet wavelet은 주파수마다 길이가 달라(보통 cycle 수로 정함) 낮은 주파수는 길게, 높은 주파수는 짧게 봅니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3이 노트북에서 실행된다.
- [ ] `figures/advanced/C/C4_tf_db.png`에 대칭 색 범위의 dB map과 색 막대 설명이 있다.
- [ ] 정규화 전후 그림, cycle 수 3/12 그림을 비교한 메모가 있다.
- [ ] 가장자리 효과와 기저선 선택 실험 결과를 적었다.

## MATLAB으로는

wavelet convolution은 `fft`·`ifft`로 직접 하거나 `cwt`(Wavelet Toolbox), STFT는 `spectrogram`·`stft`, 다중 테이퍼 스펙트로그램은 Chronux `mtspecgramc`, 기저선 나누기는 암시적 확장(또는 `bsxfun`), 로그 간격 주파수는 `logspace`입니다. 자세한 문법은 [파트 B — MATLAB](../B-matlab/)에서 다룹니다.

## 더 읽을거리
- Cohen MX. A better way to define and describe Morlet wavelets for time-frequency analysis. *NeuroImage* 199:81–86 (2019). [doi:10.1016/j.neuroimage.2019.05.048](https://doi.org/10.1016/j.neuroimage.2019.05.048)
- Grandchamp R, Delorme A. Single-trial normalization for event-related spectral decomposition reduces sensitivity to noisy trials. *Frontiers in Psychology* 2:236 (2011). [doi:10.3389/fpsyg.2011.00236](https://doi.org/10.3389/fpsyg.2011.00236)
- PyWavelets 문서: <https://pywavelets.readthedocs.io/en/latest/>
- Mike X Cohen, *MATLAB for Brain and Cognitive Scientists*, MIT Press (2017) — 시간-주파수 분석 장. [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/)
- Pascal Wallisch 외, *MATLAB for Neuroscientists*, 2nd ed., Academic Press (2014) — 비정상 신호와 스펙트로그램, wavelet 장. [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0)

---
[← 이전](day-C3.md) · [코스 지도](../../../README.md) · [다음 →](day-C5.md)
