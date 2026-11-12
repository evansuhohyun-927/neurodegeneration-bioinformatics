# Day C3 — Fourier 변환과 power spectrum: 해상도, 테이퍼, Welch, 다중 테이퍼

> **주차:** 심화 파트 C — 신경신호·시간-주파수 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/C/C3_spectrum.ipynb`, `figures/advanced/C/C3_psd_methods.png`
>
> **먼저 끝내 둘 레슨:** [Day C2](day-C2.md). Fourier 변환의 직관(섞인 신호 속 주파수 찾기)과 `np.fft.rfft` 사용법은 [Day 23 — 시계열 기초](../../week-4/day-23.md)에서 이미 다뤘으니, 오늘은 **숫자를 정확히 읽는 법**에 집중합니다.

## 오늘의 목표
- Fourier 계수가 "복소 사인파와의 내적"이라는 것을 코드로 확인하고, 계수에서 진폭·위상·power를 정확한 단위로 꺼낼 수 있다.
- 주파수 해상도가 기록 길이로 정해지며, zero-padding은 해상도를 높이지 않는다는 것을 설명할 수 있다.
- periodogram, Welch, 다중 테이퍼 스펙트럼의 차이를 말하고, 대역 파워(절대·상대)를 계산할 수 있다.

## 🎬 영상으로 먼저 보기

- [Frequency resolution and zero-padding — Mike X Cohen](https://www.youtube.com/watch?v=oh7WvhlkxnU) (10:15)
- **무엇에 주목할까:** 0을 덧대면 스펙트럼 점이 촘촘해지지만, 가까운 두 봉우리를 갈라 주지는 못한다는 대목을 보세요. 예시 2에서 똑같은 현상을 숫자로 확인합니다.

- [Welch's method for smooth spectral decomposition — Mike X Cohen](https://www.youtube.com/watch?v=YK1F0-3VvQI) (11:14)
- **무엇에 주목할까:** 긴 기록을 짧은 창 여러 개로 나눠 스펙트럼을 평균하면 왜 매끈해지는지, 그 대가로 무엇을 잃는지(주파수 간격)를 따라가세요.

## 개념 설명

### 계수 하나 = 복소 사인파와의 내적

Fourier 변환은 신호를 주파수마다 **복소 사인파(complex sine wave)** 와 내적합니다. 복소 사인파는 실수부가 cos, 허수부가 sin인 "회전하는 화살표"입니다. 내적 결과도 복소수 하나이고, 복소평면 위의 화살표로 생각하면 됩니다. **화살표 길이**가 그 주파수의 세기(진폭), **화살표 각도**가 위상입니다. 길이의 제곱이 **power**입니다. 복소수 c에 대해 c × conj(c) = 실수부² + 허수부²이므로, 두 방법은 같은 값을 줍니다.

숫자를 원래 단위로 읽으려면 두 가지 보정이 필요합니다. 첫째, 내적은 N개 점을 모두 더하므로 **N으로 나눕니다.** 둘째, 실수 신호의 성분은 양(+)의 주파수와 음(−)의 주파수에 반씩 나뉘므로 **0 Hz와 Nyquist를 뺀 나머지에 2를 곱합니다.** 0 Hz 칸은 신호의 평균(DC 성분)이라 2를 곱하지 않습니다. 이 보정을 하면 "진폭 2짜리 5 Hz 사인파"가 스펙트럼에서 정확히 2로 읽힙니다(예시 1). 많은 분석에서 평균을 미리 빼므로 DC 칸을 무시하지만, DC를 해석할 생각이라면 이 구분이 중요합니다.

### 주파수 해상도는 기록 길이가 정한다

FFT 결과의 주파수 칸 간격은 **fs / N = 1 / 기록 길이(초)** 입니다. 2초를 기록했다면 0.5 Hz 간격, 4초면 0.25 Hz 간격입니다. 이것이 **주파수 해상도(frequency resolution)** 이고, 표본화 속도를 높여도 바뀌지 않습니다(점이 많아지는 만큼 시간이 같으면 칸 간격은 그대로). 10 Hz와 10.5 Hz를 갈라 보려면 적어도 2초, 넉넉히는 그 이상이 필요합니다.

끝에 0을 덧대는 **zero-padding**은 FFT 점 수를 늘려 칸을 촘촘하게 만듭니다. 하지만 새 칸은 기존 정보로 **보간한 값**일 뿐입니다. 사진을 확대해 픽셀을 부드럽게 채우면 흐릿한 두 점이 더 선명하게 갈라지지 않는 것과 같습니다. zero-padding은 봉우리 위치를 매끄럽게 읽거나, 두 신호의 FFT 길이를 맞출 때(convolution, C2) 씁니다.

### 가장자리와 테이퍼, 그리고 비정상성

FFT는 잘라 낸 구간이 끝없이 반복된다고 가정합니다. 구간의 시작과 끝 값이 다르면 반복되는 이음매에 **날카로운 모서리**가 생기고, C2에서 본 것처럼 모서리는 넓은 주파수에 가짜 power를 뿌립니다(spectral leakage). 그래서 구간 양 끝을 0으로 부드럽게 줄이는 **테이퍼(taper, window)** 를 곱합니다. Hann 창이 가장 흔합니다. 테이퍼는 가장자리 근처 데이터를 약하게 만들기 때문에 절대 진폭이 줄지만, 주파수끼리의 상대적 비교는 깨끗해집니다.

또 하나의 전제는 **정상성(stationarity)** 입니다. Fourier 변환은 구간 전체를 하나의 스펙트럼으로 요약하므로, 리듬이 구간 중간에 나타났다 사라져도 "언제"는 지워집니다. 주파수가 시간에 따라 변하는 신호(예: chirp)는 넓게 번진 봉우리로 보입니다. 이 한계 때문에 내일(C4) 시간-주파수 분석이 필요합니다.

### periodogram, Welch, 다중 테이퍼

긴 기록 전체에 FFT를 한 번 하는 **periodogram**은 칸은 촘촘하지만 칸마다 값이 크게 출렁입니다. 칸 하나의 추정치에 쓰이는 정보가 적기 때문입니다. 데이터를 많이 모아도 출렁임은 줄지 않습니다. **Welch 방법**은 기록을 짧은 창(예: 2초, 50% 겹침)으로 나눠 창마다 테이퍼를 씌워 스펙트럼을 구하고 **평균**합니다. 출렁임이 크게 줄어드는 대신 주파수 간격은 창 길이로 정해집니다(2초 창 → 0.5 Hz). 실험 시행(epoch)이 여러 개라면 시행마다 스펙트럼을 구해 평균하는 것도 같은 원리입니다.

**다중 테이퍼(multitaper)** 는 같은 구간에 서로 직교하는 여러 테이퍼(DPSS, Slepian 함수)를 씌워 각각 스펙트럼을 구한 뒤 평균합니다. 창을 자르는 대신 "같은 데이터를 다른 안경으로 여러 번 보기"라서, 짧은 구간에서도 매끈한 추정을 얻습니다. 대가는 주파수 방향으로 조금 번지는 것이고, 그 폭은 **시간-대역폭 곱(NW)** 으로 정합니다. 수면 EEG처럼 긴 기록의 스펙트로그램에서 특히 많이 씁니다.

마지막으로 뇌 신호의 스펙트럼은 낮은 주파수일수록 power가 큰 **1/f 모양**의 배경 위에 리듬 봉우리가 얹힌 꼴입니다. 대역 파워를 비교할 때는 이 배경이 사람·전극마다 다르다는 점을 염두에 두고, 필요하면 상대 파워(전체 대비 비율)나 배경을 따로 추정하는 방법(더 읽을거리의 FOOOF/specparam)을 씁니다.

## 예시로 이해하기

> 예시의 신호는 모두 코드 안에서 만든 **가상 신호**입니다.

### 예시 1 — 느린 Fourier 변환으로 진폭과 위상 읽기

```python
import numpy as np

fs = 100
t = np.arange(0, 2, 1 / fs)              # 2초, N = 200
N = len(t)
x = 1.5 + 2.0 * np.sin(2 * np.pi * 5 * t) + 0.7 * np.cos(2 * np.pi * 12 * t + 1.0)

# 느린 Fourier 변환: 주파수마다 복소 사인파와의 내적
dft = np.zeros(N, dtype=complex)
for k in range(N):
    csw = np.exp(-2j * np.pi * k * np.arange(N) / N)
    dft[k] = x @ csw
print("손으로 만든 DFT == np.fft.fft ?", np.allclose(dft, np.fft.fft(x)))

X = np.fft.rfft(x)                       # 0 Hz ~ Nyquist 만
hz = np.fft.rfftfreq(N, 1 / fs)
amp = np.abs(X) / N
amp[1:-1] *= 2                           # 양(+)과 음(-) 주파수에 나뉜 몫을 합친다. 0 Hz와 Nyquist는 제외
phase = np.angle(X)

print("주파수 간격(해상도) = fs/N = %.2f Hz, 칸 수 = %d" % (fs / N, len(hz)))
for f in [0, 5, 12]:
    i = np.argmin(np.abs(hz - f))
    print("%4.1f Hz: 진폭 %.3f, 위상 %+.2f rad" % (hz[i], amp[i], phase[i]))
```

실행 결과:

```text
손으로 만든 DFT == np.fft.fft ? True
주파수 간격(해상도) = fs/N = 0.50 Hz, 칸 수 = 101
 0.0 Hz: 진폭 1.500, 위상 +0.00 rad
 5.0 Hz: 진폭 2.000, 위상 -1.57 rad
12.0 Hz: 진폭 0.700, 위상 +1.00 rad
```

0 Hz 칸이 평균 1.5, 5 Hz가 진폭 2.0, 12 Hz가 진폭 0.7로 정확히 읽힙니다. 5 Hz의 위상이 −π/2(−1.57)인 것은 sin이 cos보다 1/4주기 늦은 파형이기 때문이고, 12 Hz의 위상 +1.00은 코드에서 넣은 값 그대로입니다.

### 예시 2 — zero-padding은 두 봉우리를 갈라 주지 않는다

```python
import numpy as np
from scipy.signal import find_peaks

fs = 250
def two_peaks(dur, pad_to=None):
    t = np.arange(0, dur, 1 / fs)
    x = np.sin(2 * np.pi * 10 * t) + np.sin(2 * np.pi * 10.5 * t)   # 0.5 Hz 떨어진 두 리듬
    nfft = pad_to or len(x)
    amp = np.abs(np.fft.rfft(x, nfft))
    hz = np.fft.rfftfreq(nfft, 1 / fs)
    sel = (hz > 8) & (hz < 13)
    pk, _ = find_peaks(amp[sel], prominence=amp[sel].max() * 0.1)
    return round(fs / len(x), 3), round(fs / nfft, 3), np.round(hz[sel][pk], 2)

for dur, pad in [(1, None), (1, 250 * 8), (4, None)]:
    res, step, pk = two_peaks(dur, pad)
    print("기록 %d초, FFT 점 %5s: 해상도 %.3f Hz, 격자 간격 %.3f Hz, 찾은 봉우리 %s" % (dur, pad or "그대로", res, step, pk))
```

실행 결과:

```text
기록 1초, FFT 점   그대로: 해상도 1.000 Hz, 격자 간격 1.000 Hz, 찾은 봉우리 [10.]
기록 1초, FFT 점  2000: 해상도 1.000 Hz, 격자 간격 0.125 Hz, 찾은 봉우리 [10.25]
기록 4초, FFT 점   그대로: 해상도 0.250 Hz, 격자 간격 0.250 Hz, 찾은 봉우리 [10.  10.5]
```

1초 기록에 0을 덧대 FFT 점을 8배로 늘리자 격자는 0.125 Hz로 촘촘해졌지만, 봉우리는 여전히 하나(10.25 Hz, 두 봉우리의 중간)입니다. 4초를 기록해야 10.0 Hz와 10.5 Hz가 따로 보입니다.

### 예시 3 — 1/f 배경 위의 alpha: periodogram, Welch, 다중 테이퍼

```python
import numpy as np
from scipy import signal
from scipy.integrate import simpson

rng = np.random.default_rng(3)
fs = 250
n = fs * 60                                     # 60초 '휴지기' 기록
# 1/f 모양 배경(분홍 잡음): 흰 잡음의 스펙트럼을 1/sqrt(f)로 깎아 만든다
white = np.fft.rfft(rng.normal(size=n))
f_ax = np.fft.rfftfreq(n, 1 / fs)
f_ax[0] = f_ax[1]
pink = np.fft.irfft(white / np.sqrt(f_ax), n)
pink /= pink.std()
t = np.arange(n) / fs
alpha = 0.6 * np.sin(2 * np.pi * 10 * t + rng.uniform(0, 2 * np.pi))
x = pink + alpha

# (1) 한 번에 통째로: periodogram (Hann 테이퍼)
f1, p1 = signal.periodogram(x, fs, window="hann")
# (2) Welch: 2초 창, 50% 겹침, 창마다 Hann 테이퍼 후 평균
f2, p2 = signal.welch(x, fs, nperseg=2 * fs, noverlap=fs)
# (3) 다중 테이퍼: 2초 조각 하나에 서로 직교하는 DPSS 테이퍼 5개(NW=3)를 씌워 평균
seg = x[:2 * fs]
tapers = signal.windows.dpss(2 * fs, NW=3, Kmax=5)
mt = np.mean([np.abs(np.fft.rfft(seg * w)) ** 2 for w in tapers], axis=0) / fs
f3 = np.fft.rfftfreq(2 * fs, 1 / fs)
f4, p4 = signal.periodogram(seg, fs, window="hann")

def roughness(f, p, lo=20, hi=40):
    """20–40 Hz 구간에서 이웃 칸끼리 log 파워가 얼마나 들쭉날쭉한가 (작을수록 매끈)"""
    s = (f >= lo) & (f <= hi)
    return np.std(np.diff(np.log10(p[s])))

print("주파수 간격: periodogram(60초) %.3f Hz | Welch(2초 창) %.3f Hz" % (f1[1], f2[1]))
print("들쭉날쭉함: periodogram %.2f | Welch %.2f" % (roughness(f1, p1), roughness(f2, p2)))
print("2초 조각 하나: Hann 한 장 %.2f | 다중 테이퍼 5장 %.2f" % (roughness(f4, p4), roughness(f3, mt)))

# 대역 파워: alpha(8–12 Hz)를 Welch 스펙트럼에서 적분
def band_power(f, p, lo, hi):
    s = (f >= lo) & (f <= hi)
    return simpson(p[s], x=f[s])
total = band_power(f2, p2, 1, 40)
a = band_power(f2, p2, 8, 12)
print("alpha 절대 파워 %.3f, 1–40 Hz 대비 상대 파워 %.1f%%" % (a, 100 * a / total))
print("Welch 최고점(5–20 Hz): %.1f Hz" % f2[(f2 > 5) & (f2 < 20)][np.argmax(p2[(f2 > 5) & (f2 < 20)])])
```

실행 결과:

```text
주파수 간격: periodogram(60초) 0.017 Hz | Welch(2초 창) 0.500 Hz
들쭉날쭉함: periodogram 0.63 | Welch 0.05
2초 조각 하나: Hann 한 장 0.81 | 다중 테이퍼 5장 0.12
alpha 절대 파워 0.226, 1–40 Hz 대비 상대 파워 34.9%
Welch 최고점(5–20 Hz): 10.0 Hz
```

"들쭉날쭉함"은 이웃한 주파수 칸끼리 log power가 얼마나 튀는지를 잰 값입니다. 60초 전체의 periodogram은 칸이 0.017 Hz로 촘촘하지만 값이 크게 튀고, Welch는 0.5 Hz 칸으로 대신 매끈합니다. 2초 조각 **하나**만 있을 때도 다중 테이퍼 5장을 쓰면 Hann 한 장보다 훨씬 매끈합니다. alpha 봉우리는 10.0 Hz에서 찾았고, 1–40 Hz 전체 대비 약 35%였습니다.

## 직접 해보기

1. `notebooks/advanced/C/C3_spectrum.ipynb`를 만들고 예시 1–3을 실행합니다.
2. 예시 1에서 `amp[1:-1] *= 2` 줄을 지우고 다시 실행해, 어느 칸이 절반으로 읽히는지 확인합니다. 그다음 `N`이 홀수(예: 2초 대신 1.99초)일 때도 마지막 칸이 Nyquist인지 `hz[-1]`을 출력해 봅니다(홀수면 Nyquist 칸이 없어 마지막 칸도 2를 곱해야 합니다).
3. 예시 2를 2초 기록으로 바꿔 보세요. 해상도 0.5 Hz에서 10과 10.5 Hz가 갈라지는지, 갈라진다면 얼마나 또렷한지 적습니다.
4. 예시 3의 세 스펙트럼을 한 그림에 겹쳐 그립니다. 세로축은 `plt.semilogy`로 log, 가로축은 1–40 Hz로 자르고 `figures/advanced/C/C3_psd_methods.png`로 저장합니다. 1/f 배경과 10 Hz 봉우리가 함께 보여야 합니다.
5. Welch의 `nperseg`를 0.5초, 2초, 8초로 바꿔 "주파수 간격"과 "들쭉날쭉함"이 서로 반대로 움직이는 것을 표로 정리합니다.
6. **주파수 인덱스 찾기 연습:** 예시 3의 `f2`에서 정확히 10 Hz에 가장 가까운 칸 번호를 `np.argmin(np.abs(f2 - 10))`으로 찾고, 그 칸의 실제 주파수를 출력합니다. 앞으로 "8–12 Hz"를 자를 때도 이 방식으로 칸을 찾습니다.

> ⚠️ **흔한 오류 1:** 주파수축을 `np.linspace(0, fs, N)`처럼 만들면 칸이 한 칸씩 어긋납니다. `np.fft.rfftfreq(N, 1/fs)`를 쓰거나, 직접 만든다면 "13 Hz 사인파를 넣었을 때 봉우리가 13 Hz에 오는가"로 반드시 확인합니다.
>
> ⚠️ **흔한 오류 2:** 서로 다른 길이의 기록이나 서로 다른 `nperseg`로 구한 스펙트럼의 **절대값**을 그대로 비교합니다. 단위(power vs power spectral density)와 테이퍼 보정이 달라집니다. 같은 함수·같은 설정으로 계산한 값끼리 비교하고, 설정을 보고합니다.

## 퀴즈

**1.** 500 Hz로 3초를 기록했다. FFT의 주파수 칸 간격과 가장 높은 주파수는?

<details><summary>정답 보기</summary>

칸 간격은 1/3 ≈ 0.333 Hz(= 500/1500), 가장 높은 주파수는 Nyquist인 250 Hz입니다. 칸 간격은 표본화 속도가 아니라 기록 길이가 정합니다.

</details>

**2.** 진폭 3인 8 Hz 사인파를 FFT해 `np.abs(X)/N`으로 읽었더니 1.5가 나왔다. 무엇을 빠뜨렸는가?

<details><summary>정답 보기</summary>

양·음 주파수에 나뉜 몫을 합치는 ×2입니다. 실수 신호의 성분은 +8 Hz와 −8 Hz에 반씩 나뉘므로, 0 Hz와 Nyquist를 제외한 칸에 2를 곱해야 원래 진폭 3이 됩니다.

</details>

**3.** 1초짜리 epoch에서 9.6 Hz와 10.2 Hz를 구분하고 싶어 FFT 길이를 10초 분량으로 zero-padding했다. 이 계획의 문제는?

<details><summary>정답 보기</summary>

zero-padding은 칸을 촘촘하게 보간할 뿐 해상도(1 Hz)를 높이지 않습니다. 두 성분은 여전히 한 봉우리로 섞여 보입니다. 구분하려면 더 긴 구간(적어도 2초 이상)이 필요합니다.

</details>

**4.** Welch 방법이 periodogram보다 매끈한 이유와 그 대가를 각각 한 문장으로.

<details><summary>정답 보기</summary>

이유: 짧은 창 여러 개의 스펙트럼을 평균하므로 칸마다의 무작위 출렁임이 줄어듭니다. 대가: 주파수 간격이 창 길이로 정해져(예: 2초 창 → 0.5 Hz) 촘촘한 주파수 정보를 잃습니다.

</details>

**5.** 다중 테이퍼 방법에서 NW(시간-대역폭 곱)를 키우면 스펙트럼은 어떻게 변하는가?

<details><summary>정답 보기</summary>

쓸 수 있는 직교 테이퍼 수가 늘어 추정이 더 매끈해지지만(분산 감소), 각 주파수의 값이 더 넓은 대역(약 ±NW/구간길이 Hz)에서 섞여 봉우리가 넓게 번집니다. 매끈함과 주파수 정밀도 사이의 trade-off입니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3이 노트북에서 실행된다.
- [ ] 진폭 보정(÷N, ×2)을 빼면 어떻게 틀리는지 확인했다.
- [ ] `figures/advanced/C/C3_psd_methods.png`에 세 방법의 스펙트럼이 log 축으로 겹쳐 있다.
- [ ] Welch 창 길이별 "간격 vs 매끈함" 표를 만들었다.

## MATLAB으로는

FFT는 `fft`·`ifft`, 진폭·위상은 `abs`·`angle`, 테이퍼는 `hann`·`hamming`, Welch는 `pwelch`, 다중 테이퍼는 `pmtm`(Signal Processing Toolbox)이나 Chronux의 `mtspectrumc`, 대역 파워는 `bandpower`입니다. 자세한 문법은 [파트 B — MATLAB](../B-matlab/)에서 다룹니다.

## 더 읽을거리
- Welch P. The use of fast Fourier transform for the estimation of power spectra: A method based on time averaging over short, modified periodograms. *IEEE Transactions on Audio and Electroacoustics* 15:70–73 (1967). [doi:10.1109/TAU.1967.1161901](https://doi.org/10.1109/TAU.1967.1161901)
- Prerau MJ, et al. Sleep Neurophysiological Dynamics Through the Lens of Multitaper Spectral Analysis. *Physiology* 32:60–92 (2017). [doi:10.1152/physiol.00062.2015](https://doi.org/10.1152/physiol.00062.2015)
- Donoghue T, et al. Parameterizing neural power spectra into periodic and aperiodic components. *Nature Neuroscience* 23:1655–1665 (2020). [doi:10.1038/s41593-020-00744-x](https://doi.org/10.1038/s41593-020-00744-x) · 도구: <https://fooof-tools.github.io/fooof/>
- `scipy.signal.windows.dpss` 문서: <https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.windows.dpss.html>
- Mike X Cohen, *MATLAB for Brain and Cognitive Scientists*, MIT Press (2017) — Fourier 변환, 주파수 분석 장. [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/)
- Pascal Wallisch 외, *MATLAB for Neuroscientists*, 2nd ed., Academic Press (2014) — Fourier 분해 장. [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0)

---
[← 이전](day-C2.md) · [코스 지도](../../../README.md) · [다음 →](day-C4.md)
