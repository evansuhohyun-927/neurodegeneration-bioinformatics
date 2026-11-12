# Day 23 — 시계열 기초: 작은 신호로 배우는 여섯 가지 개념

> **주차:** 4주차 · **예상 시간:** 75–90분 · **산출물:** `notebooks/04_signal_basics.ipynb`

## 오늘의 목표
- sampling rate, window, missingness, noise, filtering, frequency domain을 각각 한 문장으로 설명할 수 있다.
- numpy로 가상 신호를 만들고, 필터를 걸고, 가장 강한 주파수를 찾을 수 있다.
- feature를 계산하기 전에 단위·시간축·결측값·artifact를 점검해야 하는 이유를 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [But what is the Fourier Transform? A visual introduction. — 3Blue1Brown](https://www.youtube.com/watch?v=spUNpyF58BY) (약 20분)
- **무엇에 주목할까:** 수식은 넘기고 그림만 보세요. "섞인 신호를 감아서(winding) 그 안에 어떤 주파수가 들어 있는지 찾는다"는 직관 하나만 가져가면 충분합니다. 오늘 코드에서는 이 계산을 `np.fft.rfft` 한 줄이 대신 해 줍니다.

- [Sampling, Aliasing & Nyquist Theorem — 0612 TV w/ NERDfirst](https://www.youtube.com/watch?v=yWqrx08UeUs) (약 11분)
- **무엇에 주목할까:** 너무 드문드문 측정하면 빠른 흔들림이 느린 흔들림처럼 **잘못 보이는** 현상(aliasing)을 보세요. "측정 속도는 보고 싶은 주파수의 2배보다 커야 한다"는 규칙이 왜 나오는지 이해하면 됩니다.

## 개념 설명

### sampling rate: 얼마나 자주 사진을 찍는가

센서는 연속적인 움직임을 통째로 기록하지 못합니다. 대신 일정한 간격으로 "찰칵" 하고 값을 하나씩 적습니다. 1초에 몇 번 적는지를 **sampling rate(표본화 주파수)** 라고 하고, 단위는 Hz입니다. 100 Hz라면 1초에 100개, 표본 사이 간격은 0.01초입니다.

세포 분열을 타임랩스로 찍는 것을 떠올려 보세요. 1시간에 한 장씩 찍으면 30분 만에 끝나는 사건은 놓칩니다. 신호도 같습니다. 빠른 떨림을 보려면 충분히 자주 찍어야 합니다. 규칙은 간단합니다. **볼 수 있는 가장 높은 주파수는 sampling rate의 절반**이고, 이것을 **Nyquist 주파수**라고 부릅니다. 100 Hz로 기록했다면 50 Hz까지 볼 수 있습니다. 그보다 빠른 진동은 사라지는 것이 아니라 **엉뚱한 느린 주파수로 둔갑해** 나타나는데, 이것이 **aliasing(에일리어싱)** 입니다. 예시 2에서 직접 확인합니다.

sampling rate를 알면 "표본 번호"를 "초"로 바꿀 수 있습니다. 표본 수 ÷ sampling rate = 길이(초). 1,024개를 100 Hz로 기록했다면 10.24초입니다. 이 변환을 틀리면 이후의 모든 주파수와 시간 feature가 틀립니다. 그래서 **시간축 확인이 항상 첫 단계**입니다.

### noise와 artifact, 그리고 filtering

기록된 신호는 "보고 싶은 것 + 보고 싶지 않은 것"의 합입니다. 보고 싶지 않은 것 중에서 무작위로 자잘하게 흔들리는 것을 **noise(잡음)** 라고 하고, 특정 원인으로 생긴 가짜 모양을 **artifact(인공물)** 라고 합니다. 기록이 시작될 때 기기가 진동하며 생긴 튐, 센서가 옷에 스쳐 생긴 뾰족한 값, 자세가 서서히 바뀌며 생긴 느린 기울어짐(drift) 등이 artifact입니다. 웨스턴 블롯의 배경 얼룩이나 기포 자국과 비슷합니다. 밴드가 아닌데 밴드처럼 정량될 수 있으니 먼저 찾아내야 합니다.

**filtering(필터링)** 은 특정 주파수 범위만 통과시키는 작업입니다. 체(sieve)로 크기별로 입자를 거르는 것과 같습니다. 느린 성분만 남기면 low-pass, 빠른 성분만 남기면 high-pass, 가운데 범위만 남기면 band-pass 필터입니다. 예를 들어 3–8 Hz band-pass를 걸면 그보다 느린 drift와 그보다 빠른 잡음이 줄어듭니다.

필터는 공짜가 아닙니다. **필터를 거는 순간 신호가 바뀝니다.** 범위를 잘못 잡으면 보고 싶던 성분까지 지워집니다. 그래서 필터를 쓸 때는 종류, 차수, 통과 범위를 반드시 기록하고, 필터 전후 그림을 나란히 그려 확인합니다.

### window와 missingness

긴 신호를 통째로 요약하면 중간에 일어난 변화가 묻힙니다. 그래서 신호를 일정 길이의 조각으로 나누어 조각마다 feature를 계산하는데, 이 조각을 **window(창)** 라고 합니다. 2초 window라면 100 Hz에서 200개씩 묶는 것입니다. window가 짧으면 시간 변화는 잘 보이지만 주파수를 세밀하게 구분하지 못하고, 길면 그 반대입니다.

여기서 이번 주 핵심 규칙 하나가 나옵니다. **window는 독립 표본이 아닙니다.** 한 사람의 10초 기록을 5개 window로 잘랐다고 관찰이 5배로 늘어난 것이 아닙니다. 같은 사람의 같은 기록에서 나온 조각이라 서로 매우 닮았습니다. 그래서 **시계열을 무작위로 자른 뒤 train/test에 섞는 방식은 쓰지 않습니다.** 바로 옆 조각이 train과 test에 나뉘어 들어가면, 모델은 "이 사람의 신호 모양"을 외워서 맞히게 되고 성능이 부풀려집니다. 5주차에 참가자 단위로 나누는 방법을 배웁니다.

**missingness(결측)** 는 값이 비어 있는 것입니다. 시계열에서는 표본 몇 개가 빠지거나, 기록이 예정보다 짧게 끝나거나, 과제 하나가 통째로 없는 형태로 나타납니다. 표에서 평균을 낼 때는 결측을 빼고 계산하면 되지만, 시계열에서는 **중간이 빠지면 시간 간격 자체가 달라지므로** 주파수 계산이 틀어질 수 있습니다. 먼저 얼마나, 어디가 비었는지 세는 것이 순서입니다.

### frequency domain: 같은 신호를 다른 축으로 보기

지금까지 신호를 "가로축 = 시간"으로 봤습니다. 이것을 time domain(시간 영역)이라고 합니다. 같은 신호를 "가로축 = 주파수, 세로축 = 그 주파수 성분의 세기"로 바꿔 볼 수도 있는데, 이것이 **frequency domain(주파수 영역)** 이고, 이 그림을 **power spectrum(파워 스펙트럼)** 이라고 합니다.

프리즘이 흰 빛을 색깔별로 나누는 것과 같습니다. 섞여 있을 때는 안 보이던 성분이 분리되면 보입니다. 규칙적인 떨림은 시간 그래프에서는 잡음에 묻혀 잘 안 보여도, 스펙트럼에서는 특정 주파수에 뾰족한 봉우리로 나타납니다. 이 변환을 해 주는 계산이 Fourier transform(푸리에 변환)이고, 컴퓨터에서는 FFT라는 빠른 알고리즘을 씁니다. 잡음이 많은 신호에는 여러 구간의 스펙트럼을 평균하는 **Welch 방법**(`scipy.signal.welch`)을 자주 씁니다.

마지막으로 점검 순서를 정리합니다. **feature를 계산하기 전에 ① 단위(g인가 m/s²인가, 초인가 표본 번호인가) ② 시간축(sampling rate, 길이) ③ 결측값 ④ artifact**를 확인합니다. 순서를 건너뛰면 "계산은 되는데 의미 없는 숫자"가 나옵니다.

## 예시로 이해하기

아래 예시는 모두 코드 안에서 만든 **가상 신호**를 씁니다. 실제 데이터가 아닙니다.

### 예시 1: 신호 만들기와 시간축

```python
import numpy as np

fs = 100                       # sampling rate: 초당 100개
duration = 10                  # 초
t = np.arange(0, duration, 1 / fs)

rng = np.random.default_rng(0)             # seed 고정 → 매번 같은 결과
clean = 0.05 * np.sin(2 * np.pi * 5 * t)   # 5 Hz '떨림'
drift = 0.02 * t / duration                # 천천히 기울어지는 baseline
noise = rng.normal(0, 0.02, len(t))        # 잡음
signal = clean + drift + noise

print("표본 개수:", len(signal))
print("표본 사이 간격(초):", 1 / fs)
print("처음 5개 값:", np.round(signal[:5], 3))
print("평균:", round(signal.mean(), 4), " 표준편차:", round(signal.std(), 4))
```

출력 (실행 확인):

```text
표본 개수: 1000
표본 사이 간격(초): 0.01
처음 5개 값: [0.003 0.013 0.042 0.043 0.037]
평균: 0.009  표준편차: 0.0408
```

100 Hz × 10초 = 1,000개. 표본 개수와 sampling rate, 길이가 서로 맞는지 확인하는 습관을 들이세요.

### 예시 2: 너무 느리게 측정하면 생기는 일 (aliasing)

```python
import numpy as np

def dominant_freq(x, fs):
    """신호 x에서 가장 강한 주파수(Hz)를 돌려준다."""
    x = x - x.mean()                       # 평균(0 Hz 성분) 제거
    power = np.abs(np.fft.rfft(x)) ** 2
    freqs = np.fft.rfftfreq(len(x), 1 / fs)
    return freqs[np.argmax(power)]

for fs in [100, 20, 8]:
    t = np.arange(0, 10, 1 / fs)
    x = np.sin(2 * np.pi * 5 * t)          # 진짜 주파수는 항상 5 Hz
    print(f"fs={fs:>3} Hz, Nyquist={fs/2:>4} Hz → 측정된 주파수: {dominant_freq(x, fs):.1f} Hz")
```

출력 (실행 확인):

```text
fs=100 Hz, Nyquist=50.0 Hz → 측정된 주파수: 5.0 Hz
fs= 20 Hz, Nyquist=10.0 Hz → 측정된 주파수: 5.0 Hz
fs=  8 Hz, Nyquist= 4.0 Hz → 측정된 주파수: 3.0 Hz
```

8 Hz로 측정하면 Nyquist 주파수가 4 Hz라서 5 Hz 신호를 담을 수 없습니다. 그 결과 **존재하지 않는 3 Hz 신호**가 나타났습니다. 오류 메시지는 뜨지 않습니다. 그래서 무섭습니다.

### 예시 3: 필터링과 스펙트럼

```python
import numpy as np
from scipy import signal as sg

fs = 100
t = np.arange(0, 10, 1 / fs)
rng = np.random.default_rng(0)
clean = 0.05 * np.sin(2 * np.pi * 5 * t)
x = clean + 0.02 * t / 10 + rng.normal(0, 0.02, len(t))

# 3–8 Hz만 통과시키는 band-pass filter (Butterworth 4차)
b, a = sg.butter(4, [3, 8], btype="bandpass", fs=fs)
filtered = sg.filtfilt(b, a, x)            # filtfilt: 시간 밀림 없이 필터링

def rmse(u, v):
    return np.sqrt(np.mean((u - v) ** 2))

print("필터 전, 깨끗한 신호와의 차이(RMSE):", round(rmse(x, clean), 4))
print("필터 후, 깨끗한 신호와의 차이(RMSE):", round(rmse(filtered, clean), 4))

# Welch 방법으로 주파수별 세기(power spectrum) 보기
freqs, power = sg.welch(x, fs=fs, nperseg=256)
print("가장 강한 주파수(Hz):", round(freqs[np.argmax(power[1:]) + 1], 2))
print("주파수 해상도(Hz):", round(freqs[1] - freqs[0], 3))
```

출력 (실행 확인):

```text
필터 전, 깨끗한 신호와의 차이(RMSE): 0.022
필터 후, 깨끗한 신호와의 차이(RMSE): 0.0062
가장 강한 주파수(Hz): 5.08
주파수 해상도(Hz): 0.391
```

필터 후 신호가 원래의 깨끗한 5 Hz에 훨씬 가까워졌습니다. 가장 강한 주파수가 5.00이 아니라 5.08로 나온 것은 스펙트럼의 눈금 간격(해상도)이 0.39 Hz이기 때문입니다. 저울의 최소 눈금보다 정밀하게 잴 수 없는 것과 같습니다.

### 예시 4: 결측과 window

```python
import numpy as np
import pandas as pd

fs = 100
t = np.arange(0, 10, 1 / fs)
rng = np.random.default_rng(0)
x = 0.05 * np.sin(2 * np.pi * 5 * t) + rng.normal(0, 0.02, len(t))

# (1) 결측 만들기: 2.00–2.29초 구간 30개가 빠졌다고 가정
x_missing = x.copy()
x_missing[200:230] = np.nan
s = pd.Series(x_missing, index=t)
print("결측 개수:", s.isna().sum(), "/", len(s))
print("결측 비율(%):", round(100 * s.isna().mean(), 1))

# (2) window: 2초(200개)씩, 겹치지 않게 자르기
win = 2 * fs
rows = []
for start in range(0, len(x_missing) - win + 1, win):
    seg = x_missing[start:start + win]
    rows.append({
        "window_start_s": start / fs,
        "n_missing": int(np.isnan(seg).sum()),
        "std": round(float(np.nanstd(seg)), 4),
    })
print(pd.DataFrame(rows).to_string(index=False))
```

출력 (실행 확인):

```text
결측 개수: 30 / 1000
결측 비율(%): 3.0
 window_start_s  n_missing    std
            0.0          0 0.0408
            2.0         30 0.0395
            4.0          0 0.0427
            6.0          0 0.0401
            8.0          0 0.0395
```

window 5개의 표준편차가 0.040 근처로 서로 비슷합니다. 같은 신호에서 나온 조각이니 당연합니다. 이 5개를 "독립적인 5번의 관찰"로 셀 수 없는 이유가 숫자로 보입니다.

## 직접 해보기

1. `notebooks/` 폴더에 `04_signal_basics.ipynb`를 새로 만듭니다. 첫 셀(Markdown)에 "가상 신호로 시계열 기초 연습. 실제 데이터 아님."이라고 씁니다.
2. **신호 만들기:** 예시 1을 실행합니다. 이어서 아래 셀로 그림을 그립니다.

   ```python
   import matplotlib.pyplot as plt
   plt.figure(figsize=(8, 3))
   plt.plot(t[:300], signal[:300])
   plt.xlabel("Time (s)"); plt.ylabel("Acceleration (g, simulated)")
   plt.title("First 3 seconds")
   plt.show()
   ```

3. **sampling rate:** 예시 2를 실행한 뒤 `[100, 20, 8]`에 `12`와 `6`을 추가해 봅니다. 측정된 주파수가 5 Hz에서 벗어나기 시작하는 지점을 Markdown 셀에 한 줄로 적습니다.
4. **noise와 filtering:** 예시 3을 실행합니다. 통과 범위 `[3, 8]`을 `[10, 20]`으로 바꾸고 필터 후 RMSE가 어떻게 되는지 봅니다. (5 Hz 떨림까지 지워져서 오히려 나빠집니다.) 필터 전후를 한 그림에 겹쳐 그립니다.
5. **frequency domain:** `plt.semilogy(freqs, power)`로 스펙트럼을 그리고, 봉우리의 위치를 눈으로 확인합니다. x축 라벨은 "Frequency (Hz)"로 답니다.
6. **missingness와 window:** 예시 4를 실행합니다. 결측 구간을 `[200:230]`에서 `[200:500]`으로 늘리고 결측 비율과 window별 `n_missing`을 다시 봅니다. "window 안의 결측이 몇 % 이상이면 그 window를 버리겠다"는 기준을 직접 정해 Markdown 셀에 적습니다.
7. **점검 목록 쓰기:** 마지막 Markdown 셀에 "feature 계산 전 점검 4가지: 단위 / 시간축 / 결측값 / artifact"를 쓰고, 각각을 오늘 코드의 어느 줄로 확인했는지 한 줄씩 적습니다.

⚠️ **흔한 오류 1:** `ValueError: Digital filter critical frequencies must be 0 < Wn < fs/2` — 필터 범위가 Nyquist 주파수(fs의 절반)를 넘었다는 뜻입니다. fs=100이면 50 Hz 미만으로만 설정할 수 있습니다. `fs=fs` 인자를 빼먹어도 같은 오류가 납니다.

⚠️ **흔한 오류 2:** 결측(`NaN`)이 있는 신호에 `np.std`, `np.fft.rfft`, `sg.filtfilt`를 그대로 쓰면 결과가 전부 `nan`이 됩니다. 오류가 아니라 조용히 `nan`이 나오니, 계산 전에 `np.isnan(x).sum()`으로 먼저 셉니다.

## 퀴즈

**1.** (단답) 100 Hz로 기록된 신호에 표본이 2,048개 있습니다. 기록 길이는 몇 초입니까?

<details><summary>정답 보기</summary>

2,048 ÷ 100 = **20.48초**. 표본 수를 sampling rate로 나누면 초가 됩니다. 이 변환이 시간축 점검의 기본입니다.

</details>

**2.** sampling rate가 30 Hz인 기기로 볼 수 있는 가장 높은 주파수는?
(a) 60 Hz (b) 30 Hz (c) 15 Hz (d) 7.5 Hz

<details><summary>정답 보기</summary>

**(c) 15 Hz**. Nyquist 주파수는 sampling rate의 절반입니다. 그보다 빠른 진동은 aliasing 때문에 더 느린 가짜 주파수로 나타납니다.

</details>

**3.** 한 사람의 10초 기록을 2초 window 5개로 잘라 feature를 계산했습니다. 다음 중 옳은 것은?
(a) 독립 표본이 5개로 늘었다 (b) 5개 window는 같은 사람·같은 기록에서 나왔으므로 독립이 아니다 (c) window를 무작위로 train/test에 나눠도 문제없다 (d) window가 많을수록 참가자 수가 늘어난다

<details><summary>정답 보기</summary>

**(b)**. 같은 기록에서 나온 window들은 서로 매우 닮았습니다. 이를 무작위로 train/test에 섞으면 모델이 그 사람의 신호를 외워 성능이 부풀려집니다. 독립 단위는 여전히 참가자입니다.

</details>

**4.** 3–8 Hz band-pass 필터를 건 뒤 신호의 표준편차를 feature로 썼습니다. 보고서에 반드시 적어야 할 것을 두 가지 쓰세요. (단답)

<details><summary>정답 보기</summary>

**필터의 종류·차수·통과 범위**(예: Butterworth 4차, 3–8 Hz, filtfilt)와 **sampling rate**입니다. 필터는 신호를 바꾸므로, 설정이 다르면 feature 값도 달라집니다. 적어 두지 않으면 다른 사람이 같은 숫자를 재현할 수 없습니다.

</details>

**5.** feature를 계산하기 전에 점검할 네 가지가 아닌 것은?
(a) 단위 (b) 시간축 (c) 결측값과 artifact (d) p-value

<details><summary>정답 보기</summary>

**(d)**. 점검 대상은 단위, 시간축, 결측값, artifact입니다. p-value는 feature가 다 만들어진 뒤 군 비교 단계에서 나오는 것이고, 입력이 잘못되면 p-value도 의미가 없습니다.

</details>

## 더 알아보기

> **📚 뇌 신호로 가면: 시간마다 스펙트럼**
> FFT는 구간 전체를 한 줄로 요약하므로 리듬이 "언제" 바뀌었는지는 지워집니다. 뇌파처럼 자극 뒤 수백 ms 안에 리듬이 바뀌는 신호는 짧은 창(STFT)이나 wavelet으로 시간마다 스펙트럼을 구합니다. 시간 정밀도와 주파수 정밀도는 함께 좋아질 수 없어서, 창 길이를 고르는 것이 곧 둘 사이의 균형을 고르는 일입니다. 결과는 보통 자극 전 구간 대비 dB로 바꿔 읽습니다.
> → [심화 C — Day C4: 시간-주파수 분석: Morlet wavelet, STFT, 기저선 정규화](../advanced/C-neural-signals/day-C4.md)

> **📚 aliasing은 기록 뒤에도, 느린 영상에서도 생긴다**
> 기록 뒤에 `x[::4]`처럼 표본을 솎아 내면 새 Nyquist보다 빠른 성분이 가짜 리듬으로 접혀 들어옵니다(1000 Hz 기록의 180 Hz 근육 잡음은 250 Hz로 솎으면 70 Hz로 보입니다). 그래서 `scipy.signal.decimate`나 `resample_poly`처럼 먼저 거른 뒤 낮추는 함수를 씁니다. 1–2초에 한 장을 찍는 fMRI에서는 심박(약 1 Hz)과 호흡(약 0.3 Hz)이 같은 이유로 느린 신호에 섞이므로, 생리 신호를 따로 기록해 회귀로 빼거나 ICA로 잡음 성분을 찾습니다.
> → [심화 C — Day C1: 신경 데이터의 네 얼굴: spike, LFP, EEG/MEG, 칼슘 이미징](../advanced/C-neural-signals/day-C1.md), [심화 D — Day D2: 전처리와 QC: slice timing, 움직임, 왜곡, smoothing](../advanced/D-fmri/day-D2.md)

> **📚 시행 × 시점 행렬로 생각하기**
> 여러 시행의 시계열을 "시행 × 시점" 행렬 하나로 놓으면, MATLAB에서는 `mean(X, 1)`로 시점별 평균을, `X - mean(X(:, 1:k), 2)`로 시행별 기준선 빼기를 한 줄에 합니다. 반복문 대신 차원을 지정한 연산으로 생각하면 코드가 짧아지고 빨라집니다. numpy에서는 `axis`와 `keepdims`가 같은 역할을 합니다.
> → [심화 B — Day B2: 행렬로 생각하기: 만들기, 인덱싱, 원소별 연산과 행렬 연산](../advanced/B-matlab/day-B2.md)

## 오늘의 산출물 체크리스트
- [ ] `notebooks/04_signal_basics.ipynb`가 위에서 아래로 오류 없이 실행된다.
- [ ] 시간 영역 그림 1개, 필터 전후 비교 그림 1개, 스펙트럼 그림 1개가 있고 축 라벨과 단위가 있다.
- [ ] aliasing이 일어나는 sampling rate를 직접 찾아 적었다.
- [ ] 결측 window를 버리는 나만의 기준을 한 줄로 적었다.
- [ ] "feature 계산 전 점검 4가지"를 마지막 셀에 정리했다.
- [ ] 노트북 첫 셀에 "가상 신호"임을 밝혔다.

---
[← 이전](day-22.md) · [코스 지도](../../README.md) · [다음 →](day-24.md)
