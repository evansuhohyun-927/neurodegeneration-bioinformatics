# Day C2 — convolution과 필터 설계: 커널을 밀어 보면 필터가 보인다

> **주차:** 심화 파트 C — 신경신호·시간-주파수 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/C/C2_convolution_filters.ipynb`
>
> **먼저 끝내 둘 레슨:** [Day C1](day-C1.md), [Day 23 — 시계열 기초](../../week-4/day-23.md)의 band-pass 예시. Day 23에서는 Butterworth 필터를 "그냥 썼다"면, 오늘은 그 안에서 무슨 일이 일어나는지 봅니다.

## 오늘의 목표
- convolution을 "커널을 뒤집어 밀며 내적하기"로 설명하고, 시간 영역 계산과 FFT 곱셈이 같은 결과를 낸다는 것을 코드로 확인할 수 있다.
- 이동 평균·이동 중앙값·FIR·IIR 필터의 차이와 각각을 고르는 기준을 말할 수 있다.
- 한 방향 필터가 만드는 시간 지연(위상 왜곡)을 측정하고, `filtfilt`로 없앨 수 있다.

## 🎬 영상으로 먼저 보기

- [Convolution in the time domain — Mike X Cohen](https://www.youtube.com/watch?v=9Hk-RAIzOaw) (23:37)
- **무엇에 주목할까:** 커널을 뒤집어 신호 위에 올려놓고, 겹친 칸끼리 곱해 더한 뒤 한 칸 미는 동작을 손으로 따라가 보세요. 결과의 길이가 왜 "신호 길이 + 커널 길이 − 1"이 되는지도 그림에서 확인됩니다.

- [Convolution as spectral multiplication — Mike X Cohen](https://www.youtube.com/watch?v=hj7j4Q8T3Ck) (19:30)
- **무엇에 주목할까:** "시간 영역의 convolution = 주파수 영역의 곱셈"이라는 한 문장이 필터를 이해하는 열쇠입니다. 커널의 스펙트럼이 0인 주파수는 결과에서도 0이 된다는 점에 주목하세요.

## 개념 설명

### convolution: 도장을 찍으며 지나가기

**convolution(합성곱)** 은 두 신호를 섞어 세 번째 신호를 만드는 연산입니다. 관심 있는 긴 신호를 **signal**, 짧은 모양을 **kernel(커널)** 이라 부릅니다. 계산은 이렇습니다. 커널을 시간 방향으로 뒤집고, 신호의 한 지점에 겹쳐 놓은 뒤, 겹친 칸끼리 곱해 모두 더합니다(내적, dot product). 그 값을 그 지점의 결과로 적고 커널을 한 칸 밀어 다시 반복합니다.

도장에 잉크를 묻혀 종이 위를 한 칸씩 옮기며 찍는다고 생각해 보세요. 결과는 원래 신호의 모양과 커널(도장)의 모양이 섞인 것입니다. 커널이 [1, 1, 1]/3이면 결과는 세 점 평균, 즉 **이동 평균(running mean)** 이 됩니다. 결과 길이는 신호 길이 N + 커널 길이 M − 1입니다. 앞뒤로 커널이 신호에 반쯤 걸친 부분을 **날개(wing)** 라 부르는데, 원래 시간축에 맞추려면 앞뒤에서 (M − 1)/2개씩 잘라 냅니다. 커널 길이를 **홀수**로 만들면 가운데 점이 하나로 정해져 이 계산이 깔끔합니다.

### convolution 정리: 시간에서 밀기 = 주파수에서 곱하기

같은 결과를 얻는 두 번째 길이 있습니다. 신호와 커널을 각각 FFT하고, 주파수마다 계수를 곱한 뒤, 역FFT를 합니다. 이것이 **convolution 정리(convolution theorem)** 입니다. 두 FFT의 길이를 N + M − 1로 맞춰야 앞의 결과와 정확히 같아집니다(예시 1). 긴 신호에서는 이 방법이 훨씬 빠르고, 무엇보다 **필터가 무엇을 하는지** 보여 줍니다. 커널의 스펙트럼이 10 Hz에서 1이고 50 Hz에서 0이라면, 결과에는 10 Hz가 그대로 남고 50 Hz는 사라집니다. 필터를 설계한다는 것은 결국 "어떤 주파수에서 1이고 어떤 주파수에서 0인 커널"을 만드는 일입니다.

이때 조심할 점이 있습니다. 주파수 영역에서 경계가 칼처럼 날카로운 상자(1과 0이 갑자기 바뀌는 모양)를 쓰면, 시간 영역에서는 커널이 길게 출렁이는 모양이 되어 결과에 **물결(ringing)** 이 생깁니다. 반대로 시간 영역에서 날카로운 모서리(예: epoch의 양 끝)는 주파수 영역에서 넓은 가짜 성분을 만듭니다. 그래서 좋은 필터는 경계에 완만한 **전이 구간(transition band)** 을 둡니다.

### 필터의 종류: 평균, 중앙값, FIR, IIR

**이동 평균**은 상자 모양 커널과의 convolution이라 가장 단순한 저역 통과 필터입니다. 다만 상자 커널의 스펙트럼은 출렁여서 주파수 경계가 깔끔하지 않습니다. **이동 중앙값(running median)** 은 convolution이 아닙니다(평균처럼 곱해 더하지 않고 순서를 매깁니다). 대신 드물게 튀는 큰 값에 거의 흔들리지 않아 스파이크성 artifact 제거에 좋습니다(예시 2).

**FIR(finite impulse response) 필터**는 길이가 정해진 커널 하나로 하는 convolution입니다. `scipy.signal.firwin`이나 `firls`로 커널을 설계합니다. 커널이 길수록 주파수 경계가 날카로워지지만 시간 번짐이 커집니다. **IIR(infinite impulse response) 필터**는 이미 걸러 낸 과거 출력값을 다시 입력처럼 써서, 짧은 계수로도 날카로운 경계를 냅니다. Butterworth(`signal.butter`)가 대표입니다. 계산이 빠르지만, 차수를 높이거나 대역을 좁히면 불안정해질 수 있어 `output="sos"` 형식으로 쓰는 것이 안전합니다.

### 위상 왜곡과 filtfilt

한 방향으로만 거르는 필터(`lfilter`, `sosfilt`)는 현재와 **과거** 표본만 쓰기 때문에 결과가 늦게 나옵니다. 길이 251개 FIR이라면 (251 − 1)/2 = 125표본만큼 일정하게 늦고, IIR은 주파수마다 늦는 정도가 달라 파형 모양까지 바뀝니다. 이것을 **위상 왜곡(phase distortion)** 이라 합니다. "자극 후 몇 ms에 반응이 시작했나"를 묻는 분석에서는 치명적입니다.

**`filtfilt`(앞뒤 필터)** 는 신호를 앞으로 한 번 거른 뒤, 뒤집어서 다시 거르고, 다시 뒤집습니다. 두 번의 지연이 서로 상쇄되어 **위상 지연이 0**이 됩니다. 대가가 둘 있습니다. 필터가 두 번 걸리므로 감쇠가 제곱으로 세지고, 미래 표본을 쓰므로 자극 **직전**에 자극 후의 성분이 조금 번져 들어올 수 있습니다. 실시간 처리(뇌-기계 인터페이스 등)에서는 미래를 쓸 수 없으므로 한 방향 필터를 쓰고 지연을 보고합니다. 필터 설정을 두고 연구자마다 선호가 다르지만, 결과가 **합리적인 여러 설정에서 같게 나오는지** 확인하는 것이 어떤 한 설정을 고집하는 것보다 중요합니다.

## 예시로 이해하기

> 예시의 신호는 모두 코드 안에서 만든 **가상 신호**입니다.

### 예시 1 — 손 계산, `np.convolve`, FFT 곱셈은 같다

```python
import numpy as np

sig = np.array([0, 0, 1, 1, 1, 0, 0, 0], dtype=float)   # 짧은 상자 모양 신호
ker = np.array([1, 2, 1], dtype=float) / 4               # 작은 가중 평균 커널

# (1) 손으로: 커널을 뒤집어 한 칸씩 밀며 내적(dot product)
N, M = len(sig), len(ker)
padded = np.concatenate([np.zeros(M - 1), sig, np.zeros(M - 1)])
by_hand = np.array([padded[i:i + M] @ ker[::-1] for i in range(N + M - 1)])

# (2) numpy 함수
by_np = np.convolve(sig, ker)                            # 기본값 mode="full"

# (3) 주파수 영역: FFT끼리 곱한 뒤 역FFT (길이를 N+M-1로 맞춰야 한다)
L = N + M - 1
by_fft = np.real(np.fft.ifft(np.fft.fft(sig, L) * np.fft.fft(ker, L)))

print("결과 길이:", len(by_hand), "= N + M - 1 =", L)
print("손 계산 :", np.round(by_hand, 3))
print("np 함수 :", np.round(by_np, 3))
print("FFT 곱  :", np.round(by_fft, 3) + 0.0)
print("세 결과가 같은가:", np.allclose(by_hand, by_np) and np.allclose(by_np, by_fft))

# 날개(wing) 자르기: 앞뒤로 (M-1)/2 개씩 버리면 원래 길이 N, 시점도 맞는다
half = (M - 1) // 2
same = by_np[half:half + N]
print("날개 자른 결과:", np.round(same, 3), "| mode='same'과 같은가:", np.allclose(same, np.convolve(sig, ker, mode="same")))
```

실행 결과:

```text
결과 길이: 10 = N + M - 1 = 10
손 계산 : [0.   0.   0.25 0.75 1.   0.75 0.25 0.   0.   0.  ]
np 함수 : [0.   0.   0.25 0.75 1.   0.75 0.25 0.   0.   0.  ]
FFT 곱  : [0.   0.   0.25 0.75 1.   0.75 0.25 0.   0.   0.  ]
세 결과가 같은가: True
날개 자른 결과: [0.   0.25 0.75 1.   0.75 0.25 0.   0.  ] | mode='same'과 같은가: True
```

### 예시 2 — 튀는 값이 있을 때: 이동 평균 vs 이동 중앙값

```python
import numpy as np
from scipy import signal

rng = np.random.default_rng(2)
fs = 200
t = np.arange(0, 3, 1 / fs)
clean = np.sin(2 * np.pi * 2 * t)                 # 느린 2 Hz 파형
x = clean + rng.normal(0, 0.3, len(t))
spike_idx = rng.choice(len(t), 8, replace=False)
x[spike_idx] += 6                                  # 드문 큰 튐(artifact) 8개

k = 11                                             # 창 길이 11개 = 55 ms (홀수로)
run_mean = np.convolve(x, np.ones(k) / k, mode="same")   # 이동 평균 = 상자 커널과의 convolution
run_med = signal.medfilt(x, kernel_size=k)               # 이동 중앙값

def err(y):
    inner = slice(k, -k)                           # 양 끝 날개 구간은 빼고 비교
    return np.sqrt(np.mean((y[inner] - clean[inner]) ** 2))

print("원 신호와의 RMS 오차: 원자료 %.3f | 이동 평균 %.3f | 이동 중앙값 %.3f" % (err(x), err(run_mean), err(run_med)))
i = spike_idx[0]
print("튐 위치 값  원자료 %.2f | 이동 평균 %.2f | 이동 중앙값 %.2f | 참값 %.2f" % (x[i], run_mean[i], run_med[i], clean[i]))
```

실행 결과:

```text
원 신호와의 RMS 오차: 원자료 0.781 | 이동 평균 0.241 | 이동 중앙값 0.113
튐 위치 값  원자료 5.22 | 이동 평균 -0.34 | 이동 중앙값 -0.80 | 참값 -1.00
```

두 필터 모두 잡음을 줄였지만, 이동 평균은 큰 튐을 이웃 11칸에 **나눠 퍼뜨립니다**. 이동 중앙값은 튐을 거의 무시하므로 오차가 절반 이하입니다. 다만 중앙값 필터는 파형의 뾰족한 진짜 봉우리도 깎을 수 있으니, 창 길이는 보고 싶은 사건보다 충분히 짧게 잡습니다.

### 예시 3 — FIR와 IIR, 한 방향과 앞뒤

```python
import numpy as np
from scipy import signal

fs = 500
t = np.arange(-1, 2, 1 / fs)
# 0초에 시작해 0.4초 동안 이어지는 10 Hz 폭발(burst), 가우시안 포락선
env = np.exp(-((t - 0.2) ** 2) / (2 * 0.08 ** 2))
x = env * np.sin(2 * np.pi * 10 * t)

band = [8, 12]
# FIR: 계수 numtaps개짜리 커널. 길수록 주파수 경계가 날카롭다 (여기선 0.5초 = 251개)
fir = signal.firwin(251, band, pass_zero=False, fs=fs)
# IIR: Butterworth 4차, sos 형식이 수치적으로 안전하다
sos = signal.butter(4, band, btype="bandpass", fs=fs, output="sos")

def gain(f, which):
    if which == "fir":
        w, h = signal.freqz(fir, worN=[f], fs=fs)
    else:
        w, h = signal.sosfreqz(sos, worN=[f], fs=fs)
    return abs(h[0])

for f in [4, 10, 20]:
    print("%2d Hz 통과 비율  FIR %.3f | IIR %.3f" % (f, gain(f, "fir"), gain(f, "iir")))

def peak_time(y):
    return t[np.argmax(np.abs(signal.hilbert(y)))]   # 포락선이 가장 큰 시각

out = {
    "FIR 한 방향 (lfilter)": signal.lfilter(fir, 1, x),
    "FIR 앞뒤 (filtfilt)": signal.filtfilt(fir, 1, x),
    "IIR 한 방향 (sosfilt)": signal.sosfilt(sos, x),
    "IIR 앞뒤 (sosfiltfilt)": signal.sosfiltfilt(sos, x),
}
print("원 신호 포락선 최고점: %.3f초" % peak_time(x))
for name, y in out.items():
    print("%-22s 최고점 %.3f초 (지연 %+.0f ms)" % (name, peak_time(y), 1000 * (peak_time(y) - peak_time(x))))
print("FIR 이론 지연 = (numtaps-1)/2/fs = %.0f ms" % (1000 * (251 - 1) / 2 / fs))
```

실행 결과:

```text
 4 Hz 통과 비율  FIR 0.004 | IIR 0.002
10 Hz 통과 비율  FIR 1.000 | IIR 1.000
20 Hz 통과 비율  FIR 0.000 | IIR 0.005
원 신호 포락선 최고점: 0.200초
FIR 한 방향 (lfilter)     최고점 0.450초 (지연 +250 ms)
FIR 앞뒤 (filtfilt)      최고점 0.200초 (지연 +0 ms)
IIR 한 방향 (sosfilt)     최고점 0.432초 (지연 +232 ms)
IIR 앞뒤 (sosfiltfilt)   최고점 0.200초 (지연 +0 ms)
FIR 이론 지연 = (numtaps-1)/2/fs = 250 ms
```

두 필터 모두 4 Hz와 20 Hz를 거의 막고 10 Hz는 그대로 통과시킵니다. 차이는 **시간**에서 납니다. 한 방향 FIR은 이론값과 똑같이 250 ms 늦고, 한 방향 IIR도 200 ms 넘게 늦습니다. 앞뒤로 걸면 둘 다 지연이 0입니다. 좁은 대역(8–12 Hz)일수록 필터가 오래 "울리므로" 지연이 커진다는 점도 기억하세요.

## 직접 해보기

1. `notebooks/advanced/C/C2_convolution_filters.ipynb`를 만들고 예시 1–3을 실행합니다.
2. 예시 1의 커널을 `[1, 2, 3, 2, 1] / 9`로 바꾸고, 결과 길이가 N + M − 1 = 12인지, `mode="same"`과 날개 자른 결과가 여전히 같은지 확인합니다.
3. 예시 2에서 `k`를 5, 11, 41로 바꿔 RMS 오차 표를 만듭니다. 창이 너무 길면 2 Hz 파형 자체가 깎여 오차가 다시 커지는 지점을 찾으세요.
4. 예시 3에서 FIR의 `numtaps`를 51, 251, 1001로 바꾸고 4 Hz·20 Hz 통과 비율과 한 방향 지연을 표로 적습니다. "긴 커널 = 날카로운 경계 + 큰 지연"을 숫자로 확인합니다.
5. `signal.freqz(fir, worN=2000, fs=fs)`의 결과로 FIR의 주파수 응답 곡선(가로: Hz, 세로: 통과 비율)을 그려 `figures/advanced/C/C2_fir_response.png`로 저장합니다. 8 Hz와 12 Hz 근처의 전이 구간이 보이는지 확인하세요.
6. **전원 잡음(notch):** 1초짜리 10 Hz 사인파에 60 Hz 사인파를 더한 신호를 만들고, `signal.iirnotch(60, Q=30, fs=fs)`로 만든 `b, a`를 `signal.filtfilt(b, a, x)`에 넣어 60 Hz 진폭이 얼마나 줄었는지 C3에서 배울 FFT 진폭으로 확인합니다(한국·미국은 60 Hz, 유럽은 50 Hz).

> ⚠️ **흔한 오류 1:** `signal.butter(4, [8, 12], btype="bandpass")`처럼 `fs`를 빼면 SciPy는 경계를 Nyquist에 대한 비율(0–1)로 해석합니다. 8과 12는 1보다 커서 오류가 나거나, 다른 값을 넣으면 엉뚱한 대역이 됩니다. 항상 `fs=fs`를 함께 씁니다.
>
> ⚠️ **흔한 오류 2:** `filtfilt`는 신호가 필터 길이의 약 3배보다 짧으면 `ValueError`를 냅니다(양 끝을 덧대는 길이가 부족). 짧은 epoch마다 따로 거르지 말고, **연속 기록을 먼저 거른 뒤 epoch를 자르세요.** 가장자리 효과도 함께 줄어듭니다.

## 퀴즈

**1.** 길이 1000인 신호와 길이 51인 커널을 `mode="full"`로 convolution하면 결과 길이는?

<details><summary>정답 보기</summary>

1050 (= 1000 + 51 − 1). 커널이 신호에 조금이라도 걸치는 모든 위치에서 값이 나오기 때문입니다. 원래 길이로 맞추려면 앞뒤에서 25개씩 잘라 냅니다.

</details>

**2.** 커널의 스펙트럼이 30 Hz에서 0이다. 이 커널로 convolution한 결과에 30 Hz 성분은 얼마나 남는가? 그 이유는?

<details><summary>정답 보기</summary>

남지 않습니다(0). convolution 정리에 따라 결과의 스펙트럼은 신호 스펙트럼 × 커널 스펙트럼이므로, 커널이 0인 주파수는 결과에서도 0입니다. 필터 설계는 이 "곱하기 0과 1"을 원하는 대역에 배치하는 일입니다.

</details>

**3.** 드물게 아주 큰 튐이 섞인 신호를 매끄럽게 하려 한다. 이동 평균과 이동 중앙값 중 무엇이 적합한가?

<details><summary>정답 보기</summary>

이동 중앙값. 평균은 튐 하나를 창 안의 모든 점에 나눠 퍼뜨리지만, 중앙값은 순서의 가운데 값을 고르므로 소수의 극단값에 거의 영향을 받지 않습니다.

</details>

**4.** 자극 후 반응 시작 시각(latency)을 비교하는 연구에서 `lfilter`로 한 방향 IIR band-pass를 걸었다. 무엇이 문제인가?

<details><summary>정답 보기</summary>

한 방향 필터는 출력이 늦게 나오고, IIR은 주파수마다 늦는 정도가 달라 파형 모양도 바뀝니다. 측정한 latency에 필터 지연이 섞입니다. 오프라인 분석이면 `filtfilt`/`sosfiltfilt`로 위상 지연을 없애고, 사용한 필터 종류·차수·대역을 보고합니다.

</details>

**5.** `filtfilt`의 대가 두 가지를 말하라.

<details><summary>정답 보기</summary>

(1) 필터가 두 번 걸리므로 감쇠가 제곱으로 세집니다(통과 대역 경계의 −3 dB 지점이 바뀝니다). (2) 미래 표본을 쓰므로 실시간 처리에는 못 쓰고, 큰 사건의 성분이 그 직전 시점으로 조금 번져 들어갈 수 있습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3이 노트북에서 실행되고, 세 가지 convolution 결과가 같다는 `True`를 확인했다.
- [ ] 이동 평균 창 길이별 RMS 오차 표를 만들었다.
- [ ] FIR `numtaps`별 통과 비율·지연 표를 만들었다.
- [ ] `figures/advanced/C/C2_fir_response.png`를 저장했다.
- [ ] notch 필터 전후 60 Hz 진폭을 비교했다.

## MATLAB으로는

convolution은 `conv`(2차원은 `conv2`), 이동 평균·중앙값은 `movmean`·`movmedian`(또는 `medfilt1`), 필터 설계는 `fir1`·`firls`·`butter`·`designfilt`, 적용은 `filter`(한 방향)와 `filtfilt`(앞뒤), 주파수 응답은 `freqz`입니다. 자세한 문법은 [파트 B — MATLAB](../B-matlab/)에서 다룹니다.

## 더 읽을거리
- Widmann A, Schröger E, Maess B. Digital filter design for electrophysiological data – a practical approach. *Journal of Neuroscience Methods* 250:34–46 (2015). [doi:10.1016/j.jneumeth.2014.08.002](https://doi.org/10.1016/j.jneumeth.2014.08.002)
- `scipy.signal` 공식 문서 — 필터 설계와 적용: <https://docs.scipy.org/doc/scipy/reference/signal.html>
- Mike X Cohen, *MATLAB for Brain and Cognitive Scientists*, MIT Press (2017) — convolution, 시계열 필터링 장. [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/)
- Pascal Wallisch 외, *MATLAB for Neuroscientists*, 2nd ed., Academic Press (2014) — convolution(시각 수용장 예), LFP 대역 필터 장. [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0)

---
[← 이전](day-C1.md) · [코스 지도](../../../README.md) · [다음 →](day-C3.md)
