# Day C5 — 위상과 연결성: Hilbert, ITPC, PLV, 위상-진폭 결합

> **주차:** 심화 파트 C — 신경신호·시간-주파수 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/C/C5_phase.ipynb`
>
> **먼저 끝내 둘 레슨:** [Day C2](day-C2.md)(band-pass, filtfilt), [Day C4](day-C4.md)(복소 wavelet 결과에서 진폭·위상 꺼내기).

## 오늘의 목표
- band-pass 필터 + Hilbert 변환으로 순간 진폭과 순간 위상을 구하고, wavelet 결과와 같은 정보라는 것을 설명할 수 있다.
- ITPC(시행 간 위상 일관성)와 PLV(두 채널 간 위상 고정)를 계산하고, 시행 수에 따른 기대치(편향)를 함께 보고할 수 있다.
- 공통 원천(volume conduction)이 만드는 가짜 연결성을 알아보고, 위상-진폭 결합(PAC)의 발상과 대리(surrogate) 검정을 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [The Hilbert transform — Mike X Cohen](https://www.youtube.com/watch?v=VyLU8hlhI-I) (9:46)
- **무엇에 주목할까:** 실수 신호에 "90도 밀린 짝"을 허수부로 붙여 복소 신호를 만든다는 발상, 그리고 FFT에서 음의 주파수를 지우는 것과 같은 일이라는 설명을 보세요.

- [Inter-trial phase clustering (ITPC/ITC) — Mike X Cohen](https://www.youtube.com/watch?v=oVfv7pUkT4Y) (15:17)
- **무엇에 주목할까:** 시행마다의 위상을 길이 1짜리 화살표로 바꿔 평균하면, 방향이 모일수록 평균 화살표가 길어진다는 그림 하나면 충분합니다.

## 개념 설명

### 순간 진폭과 순간 위상: filter-Hilbert

C4의 복소 wavelet 결과는 시간마다 화살표 하나였고, 길이가 진폭, 각도가 위상이었습니다. 같은 정보를 다른 길로도 얻을 수 있습니다. 먼저 관심 대역으로 band-pass 필터를 걸고(C2), **Hilbert 변환**으로 실수 신호를 복소 신호(**analytic signal**)로 바꿉니다. Hilbert 변환은 각 주파수 성분을 90도 밀린 짝으로 만들어 허수부에 붙이는 연산입니다. 실수부는 원래 필터된 신호 그대로이고, `np.abs`가 **포락선(envelope, 순간 진폭)**, `np.angle`이 **순간 위상**입니다(예시 1). 이 조합을 filter-Hilbert 방법이라 하고, 결과는 wavelet convolution과 매우 비슷합니다. 차이는 필터의 모양을 원하는 대로(예: 30–60 Hz 넓은 대역) 정할 수 있다는 점입니다.

중요한 조건이 하나 있습니다. Hilbert 결과의 "위상"은 **좁은 대역의 신호**일 때만 해석할 수 있습니다. 여러 리듬이 섞인 넓은 대역 신호의 위상은 의미가 흐립니다. 그래서 항상 "필터 → Hilbert" 순서이고, 필터의 대역을 함께 보고합니다.

### ITPC: 시행마다 위상이 같은 자리에 오는가

자극이 리듬의 **위상을 리셋**한다면, 자극 후 같은 시각에 시행마다 위상이 비슷하게 모입니다. 이것을 재는 것이 **ITPC(inter-trial phase clustering, ITC·phase-locking factor라고도 함)** 입니다. 각 시행의 위상 θ를 길이 1인 화살표 e^{iθ}로 바꿔 시행에 걸쳐 평균하고, 평균 화살표의 **길이**를 봅니다. 모든 시행 위상이 같으면 1, 사방으로 흩어지면 0에 가깝습니다. 진폭은 버리고 위상만 쓰므로, 큰 시행 몇 개가 결과를 끌고 가지 않습니다.

주의할 점은 **시행 수에 따른 바닥값**입니다. 위상이 완전히 무작위여도 시행이 적으면 화살표들이 우연히 한쪽으로 쏠려 평균 길이가 0보다 큽니다. 기대치는 대략 √(π / 4n)이라 10시행이면 약 0.28, 160시행이면 약 0.07입니다(예시 2). 시행 수가 다른 조건끼리 ITPC를 그대로 비교하면 시행이 적은 쪽이 유리해 보입니다. 시행 수를 맞추거나(무작위로 같은 수만 뽑기), 편향을 보정한 지표(예: pairwise phase consistency)를 씁니다.

### 두 채널 사이의 위상 연결성: PLV와 그 함정

두 전극의 위상 **차이**가 시간(또는 시행)에 걸쳐 일정하면 두 영역이 "위상 고정"되었다고 말합니다. 위상차를 화살표로 바꿔 평균한 길이가 **PLV(phase-locking value)** 이고, 시행에 걸쳐 계산하면 ISPC(inter-site phase clustering)라고도 부릅니다. 비슷한 생각을 진폭까지 포함해 정규화하면 **spectral coherence**(`scipy.signal.coherence`, 0–1)가 됩니다. 상관계수의 주파수판이라고 보면 됩니다.

EEG·MEG에서 가장 큰 함정은 **volume conduction(체적 전도)** 입니다. 뇌 속 원천 하나의 전기장이 두개골을 지나 여러 전극에 **동시에** 퍼집니다. 그러면 두 전극은 위상차 0으로 완벽하게 묶여 보이지만, 두 영역이 소통한 것이 아니라 같은 원천을 함께 본 것입니다. 한 사람의 목소리를 방 안의 마이크 두 개가 동시에 녹음한 것과 같습니다. 진짜 상호작용은 신호 전달에 시간이 걸리므로 0이 아닌 시차가 생긴다는 점을 이용해, 위상차의 **허수 성분**만 쓰는 지표(imaginary coherence, PLI, wPLI)가 제안되었습니다(예시 3). 다만 이 지표들은 진짜 0-시차 상호작용도 놓치므로, 무엇을 버리고 무엇을 얻는지 알고 고릅니다.

### 리듬끼리의 결합: 위상-진폭 결합(PAC)의 발상

느린 리듬의 **위상**에 따라 빠른 리듬의 **진폭**이 커졌다 작아지는 현상을 **위상-진폭 결합(phase-amplitude coupling, PAC)** 이라 합니다. 예를 들어 해마의 theta(4–8 Hz) 마루에서 gamma(30–100 Hz)가 커지는 식입니다. 계산의 뼈대는 간단합니다. 느린 대역으로 필터해 위상 φ(t)를, 빠른 대역으로 필터해 진폭 A(t)를 구한 뒤, A(t)·e^{iφ(t)}의 평균 길이(**mean vector length**)를 봅니다. 진폭이 특정 위상에 몰려 있으면 길어집니다. 위상 구간별 평균 진폭 분포가 균등 분포에서 얼마나 벗어났는지 재는 **modulation index**도 널리 쓰입니다.

PAC는 가짜가 생기기 쉬운 지표입니다. 진폭이 큰 신호에서는 값이 저절로 커지므로, 진폭 시계열을 크게 원형 이동(circular shift)해 위상과의 짝을 끊은 **대리(surrogate) 분포**와 비교해 z값을 냅니다(예시 4). 또 날카로운 비사인파 파형(예: 톱니 모양의 느린 파)은 그 자체로 높은 주파수 성분을 가져 결합이 없어도 PAC처럼 보일 수 있습니다. 원파형을 꼭 눈으로 확인합니다.

## 예시로 이해하기

> 예시의 신호는 모두 코드 안에서 만든 **가상 신호**입니다.

### 예시 1 — filter-Hilbert로 포락선과 위상 구하기

```python
import numpy as np
from scipy import signal

rng = np.random.default_rng(5)
fs = 500
t = np.arange(0, 3, 1 / fs)
true_amp = 1 + 0.8 * np.sin(2 * np.pi * 0.5 * t)          # 천천히 커졌다 작아지는 진폭
x = true_amp * np.cos(2 * np.pi * 10 * t) + rng.normal(0, 0.5, len(t))

# (1) 대역 통과(8–12 Hz) -> (2) Hilbert로 analytic signal -> 진폭과 위상
sos = signal.butter(4, [8, 12], btype="bandpass", fs=fs, output="sos")
xf = signal.sosfiltfilt(sos, x)
an = signal.hilbert(xf)
env = np.abs(an)                    # 순간 진폭(포락선)
ph = np.angle(an)                   # 순간 위상 (-π ~ π)

inner = slice(fs // 2, -fs // 2)    # 양 끝 0.5초는 가장자리 효과가 있어 제외
print("포락선과 참 진폭의 상관: %.3f" % np.corrcoef(env[inner], true_amp[inner])[0, 1])
print("analytic signal의 실수부 == 필터된 신호 ?", np.allclose(an.real, xf))
# 위상이 1초에 몇 바퀴 도는가 = 순간 주파수
inst_f = np.diff(np.unwrap(ph)) * fs / (2 * np.pi)
print("순간 주파수 중앙값: %.2f Hz" % np.median(inst_f[inner]))
```

실행 결과:

```text
포락선과 참 진폭의 상관: 0.996
analytic signal의 실수부 == 필터된 신호 ? True
순간 주파수 중앙값: 10.02 Hz
```

포락선이 숨겨 둔 진폭 변화와 0.996으로 일치하고, 위상이 1초에 약 10바퀴 돈다(10.02 Hz)는 것도 확인됩니다. `np.unwrap`은 −π에서 +π로 뛰는 위상을 이어 붙여 줍니다.

### 예시 2 — 위상 리셋과 ITPC, 그리고 시행 수의 바닥값

```python
import numpy as np
from scipy import signal

rng = np.random.default_rng(6)
fs = 250
t = np.arange(-0.5, 1.0, 1 / fs)
sos = signal.butter(4, [4, 8], btype="bandpass", fs=fs, output="sos")

def make_trials(n_tr, reset=True):
    X = np.zeros((n_tr, len(t)))
    for k in range(n_tr):
        ph0 = rng.uniform(0, 2 * np.pi)
        pre = np.sin(2 * np.pi * 6 * t + ph0)                       # 자극 전: 시행마다 위상 제각각
        post = np.sin(2 * np.pi * 6 * t) if reset else pre          # 자극 후: 위상이 0으로 '리셋'되는가
        X[k] = np.where(t < 0, pre, post) + rng.normal(0, 1, len(t))
    return X

def itpc(X):
    ph = np.angle(signal.hilbert(signal.sosfiltfilt(sos, X, axis=1), axis=1))
    return np.abs(np.mean(np.exp(1j * ph), axis=0))                  # 시행에 걸친 평균 단위벡터의 길이

for reset in [True, False]:
    v = itpc(make_trials(50, reset))
    print("위상 리셋 %-5s: ITPC 자극 전(-0.4~-0.1초) %.2f | 자극 후(0.2~0.6초) %.2f" %
          (reset, v[(t > -0.4) & (t < -0.1)].mean(), v[(t > 0.2) & (t < 0.6)].mean()))

# 위상이 완전히 무작위여도 시행 수가 적으면 ITPC가 0보다 크게 나온다
for n in [10, 40, 160]:
    sims = [np.abs(np.mean(np.exp(1j * rng.uniform(0, 2 * np.pi, n)))) for _ in range(2000)]
    print("무작위 위상, 시행 %3d개: ITPC 평균 %.3f (참고: sqrt(pi/4/n) = %.3f)" % (n, np.mean(sims), np.sqrt(np.pi / 4 / n)))
```

실행 결과:

```text
위상 리셋 True : ITPC 자극 전(-0.4~-0.1초) 0.23 | 자극 후(0.2~0.6초) 0.98
위상 리셋 False: ITPC 자극 전(-0.4~-0.1초) 0.14 | 자극 후(0.2~0.6초) 0.13
무작위 위상, 시행  10개: ITPC 평균 0.281 (참고: sqrt(pi/4/n) = 0.280)
무작위 위상, 시행  40개: ITPC 평균 0.140 (참고: sqrt(pi/4/n) = 0.140)
무작위 위상, 시행 160개: ITPC 평균 0.071 (참고: sqrt(pi/4/n) = 0.070)
```

위상이 리셋되는 경우 자극 후 ITPC가 0.98로 치솟고, 리셋이 없으면 0.13 근처에 머뭅니다. 50시행에서 무작위 위상의 기대치가 √(π/200) ≈ 0.125이므로, 0.13은 "위상 정렬 없음"으로 읽어야 합니다. 리셋 조건의 자극 **전** 값(0.23)이 바닥값보다 조금 높은 것은, `filtfilt`가 미래 표본을 쓰기 때문에 자극 후의 정렬된 위상이 자극 직전으로 번져 들어온 결과입니다(C2의 대가). 아래 세 줄은 시행 수가 4배가 될 때 바닥값이 절반이 되는 것을 보여 줍니다.

### 예시 3 — PLV, PLI, coherence와 공통 원천

```python
import numpy as np
from scipy import signal

rng = np.random.default_rng(7)
fs = 250
n = fs * 20
t = np.arange(n) / fs
sos = signal.butter(4, [8, 12], btype="bandpass", fs=fs, output="sos")

def phase(x):
    return np.angle(signal.hilbert(signal.sosfiltfilt(sos, x)))

def narrow_osc():
    """주파수가 조금씩 흔들리는 10 Hz 리듬 (실제 뇌 리듬처럼)"""
    f_inst = 10 + np.convolve(rng.normal(0, 1, n), np.ones(fs) / fs, mode="same") * 20
    return np.sin(2 * np.pi * np.cumsum(f_inst) / fs)

def plv_and_wpli(a, b):
    d = phase(a) - phase(b)
    plv = np.abs(np.mean(np.exp(1j * d)))
    im = np.imag(np.exp(1j * d))        # 위상차의 사인 = 0이 아닌 시차가 있을 때만 0에서 벗어난다
    pli = np.abs(np.mean(np.sign(im)))  # phase lag index
    return plv, pli

src = narrow_osc()
cases = {
    "독립된 두 리듬": (narrow_osc() + rng.normal(0, 1, n), narrow_osc() + rng.normal(0, 1, n)),
    "한 리듬, 25 ms 시차": (src + rng.normal(0, 1, n), np.roll(src, int(0.025 * fs)) + rng.normal(0, 1, n)),
    "한 원천을 두 전극이 동시에 봄": (src + rng.normal(0, 1, n), 0.7 * src + rng.normal(0, 1, n)),
}
for name, (a, b) in cases.items():
    plv, pli = plv_and_wpli(a, b)
    f, coh = signal.coherence(a, b, fs, nperseg=2 * fs)
    print("%-18s PLV %.2f | PLI %.2f | 10 Hz coherence %.2f" % (name, plv, pli, coh[np.argmin(np.abs(f - 10))]))
```

실행 결과:

```text
독립된 두 리듬           PLV 0.07 | PLI 0.07 | 10 Hz coherence 0.01
한 리듬, 25 ms 시차     PLV 0.89 | PLI 0.95 | 10 Hz coherence 0.91
한 원천을 두 전극이 동시에 봄  PLV 0.90 | PLI 0.14 | 10 Hz coherence 0.91
```

25 ms 시차로 연결된 두 리듬은 세 지표 모두 높습니다. 하지만 **한 원천을 두 전극이 동시에 본 경우**에도 PLV와 coherence는 0.9로 높습니다. 위상차가 0 근처에 몰려 있어 허수 성분을 쓰는 PLI만 0.14로 낮게 나옵니다. EEG 전극 간 PLV가 높다는 사실만으로 "두 영역이 소통한다"고 쓰면 안 되는 이유입니다.

### 예시 4 — theta 위상과 gamma 진폭의 결합

```python
import numpy as np
from scipy import signal

rng = np.random.default_rng(8)
fs = 1000
t = np.arange(0, 30, 1 / fs)
# 주파수가 대략 4–8 Hz 사이에서 천천히 흔들리는 theta (완벽한 사인파면 대리 검정이 작동하지 않는다)
f_inst = 6 + np.convolve(rng.normal(0, 1, len(t)), np.ones(fs) / fs, mode="same") * 15
theta = np.sin(2 * np.pi * np.cumsum(f_inst) / fs)

def make(coupled):
    gamma_amp = 1 + 0.8 * theta if coupled else np.ones_like(t)    # theta 마루에서 gamma가 커진다
    return theta + 0.3 * gamma_amp * np.sin(2 * np.pi * 60 * t) + rng.normal(0, 0.5, len(t))

def bp(x, lo, hi):
    return signal.sosfiltfilt(signal.butter(4, [lo, hi], btype="bandpass", fs=fs, output="sos"), x)

def mvl(x):
    ph = np.angle(signal.hilbert(bp(x, 4, 8)))       # 느린 리듬의 위상
    amp = np.abs(signal.hilbert(bp(x, 50, 70)))      # 빠른 리듬의 진폭
    return np.abs(np.mean(amp * np.exp(1j * ph))), ph, amp

for coupled in [True, False]:
    x = make(coupled)
    obs, ph, amp = mvl(x)
    # 대리(surrogate) 분포: 진폭 시계열을 무작위로 크게 밀어서(원형 이동) 위상과의 짝을 끊는다
    null = [np.abs(np.mean(np.roll(amp, rng.integers(fs, len(t) - fs)) * np.exp(1j * ph))) for _ in range(200)]
    z = (obs - np.mean(null)) / np.std(null)
    print("결합 %-5s: MVL %.4f | 대리 평균 %.4f | z = %.1f" % (coupled, obs, np.mean(null), z))
```

실행 결과:

```text
결합 True : MVL 0.1057 | 대리 평균 0.0131 | z = 13.4
결합 False: MVL 0.0005 | 대리 평균 0.0033 | z = -1.5
```

결합을 넣은 신호는 대리 분포보다 13 SD 이상 크고, 결합이 없는 신호는 대리 분포 안에 있습니다. 대리 검정 없이 MVL 값만 보고하면 "얼마나 커야 큰 것인지" 알 수 없습니다.

## 직접 해보기

1. `notebooks/advanced/C/C5_phase.ipynb`를 만들고 예시 1–4를 실행합니다.
2. 예시 1과 같은 신호에 C4의 Morlet wavelet(10 Hz, 7 cycles)을 적용해 진폭을 구하고, Hilbert 포락선과의 상관을 계산합니다. 두 방법이 거의 같은 답을 주는지 확인합니다.
3. 예시 1에서 band-pass 없이 원신호에 바로 `signal.hilbert`를 적용해 순간 주파수 중앙값을 다시 구해 보세요. 잡음이 섞인 넓은 대역에서 "위상"이 얼마나 엉망이 되는지 보입니다.
4. 예시 2의 리셋 조건을 시행 15개와 150개로 바꿔 자극 전·후 ITPC를 표로 만듭니다. 바닥값 √(π/4n)을 같은 표에 적어, "자극 후 ITPC가 바닥값보다 얼마나 큰가"로 읽는 연습을 합니다.
5. 예시 3에 네 번째 경우로 "공통 원천 + 25 ms 시차 연결"을 함께 섞은 신호를 만들어 세 지표가 어떻게 나오는지 예측하고 확인합니다.
6. 예시 4의 결합 강도 `0.8`을 0.4, 0.2로 줄여 z값이 어떻게 변하는지 적습니다. 기록 길이를 30초에서 5초로 줄이면 어떤지도 보세요(짧은 기록에서는 PAC 추정이 불안정합니다).

> ⚠️ **흔한 오류 1:** 위상끼리 그냥 평균합니다(`np.mean(phase)`). 위상은 원 위의 값이라 +3.1 rad와 −3.1 rad의 평균이 0(반대 방향)으로 나옵니다. 위상은 항상 `np.exp(1j * phase)`로 화살표로 바꾼 뒤 평균하고, 각도는 `np.angle`로 다시 꺼냅니다.
>
> ⚠️ **흔한 오류 2:** epoch를 자른 뒤 epoch마다 `filtfilt` + `hilbert`를 합니다. 짧은 구간에서는 가장자리 효과가 위상을 크게 왜곡합니다. 연속 기록에서 먼저 거르고 Hilbert한 뒤 epoch를 자릅니다.

## 퀴즈

**1.** analytic signal z(t)에서 순간 진폭과 순간 위상은 각각 어떻게 구하는가? 실수부는 무엇인가?

<details><summary>정답 보기</summary>

순간 진폭 = `np.abs(z)`, 순간 위상 = `np.angle(z)`. 실수부는 Hilbert 변환에 넣은 (필터된) 원래 신호 그대로입니다. 허수부가 90도 밀린 짝입니다.

</details>

**2.** 20시행에서 ITPC가 0.22였다. 이 값을 "위상 정렬이 있다"는 근거로 쓸 수 있는가?

<details><summary>정답 보기</summary>

그대로는 쓸 수 없습니다. 20시행에서 무작위 위상의 기대치는 √(π/80) ≈ 0.20이므로 0.22는 바닥값과 거의 같습니다. 순열(시행별 위상 시점을 섞기)이나 Rayleigh 검정 같은 방법으로 우연과 비교해야 합니다.

</details>

**3.** 두 EEG 전극의 10 Hz PLV가 0.9인데, 위상차가 거의 정확히 0이다. 가장 먼저 의심할 것은?

<details><summary>정답 보기</summary>

volume conduction(공통 원천)입니다. 한 원천의 전기장이 두 전극에 동시에 퍼지면 위상차 0으로 강하게 묶여 보입니다. 허수 성분 기반 지표(PLI, wPLI, imaginary coherence)나 원천 추정(source localization) 후 분석을 고려합니다.

</details>

**4.** 시행 수가 조건 A는 40개, 조건 B는 160개다. 두 조건의 ITPC를 공정하게 비교하는 방법 하나를 제시하라.

<details><summary>정답 보기</summary>

조건 B에서 40시행을 무작위로 여러 번 뽑아 ITPC를 구하고 그 평균을 A와 비교합니다(시행 수 맞추기). 또는 시행 수 편향이 없는 지표(pairwise phase consistency 등)를 씁니다.

</details>

**5.** PAC를 보고할 때 대리(surrogate) 분포가 필요한 이유는?

<details><summary>정답 보기</summary>

MVL 같은 PAC 값은 진폭의 크기, 기록 길이, 필터 설정에 따라 결합이 없어도 0보다 크게 나옵니다. 위상과 진폭의 짝을 끊은 대리 분포와 비교해야 "이 데이터에서 우연히 나올 수 있는 값"보다 큰지 판단할 수 있습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–4가 노트북에서 실행된다.
- [ ] wavelet 진폭과 Hilbert 포락선을 비교했다.
- [ ] 시행 수별 ITPC와 바닥값을 한 표에 정리했다.
- [ ] 공통 원천 + 시차 혼합 신호의 PLV·PLI·coherence 결과를 적었다.
- [ ] PAC 결합 강도·기록 길이 실험 결과를 적었다.

## MATLAB으로는

Hilbert 변환은 `hilbert`, 위상·진폭은 `angle`·`abs`, 위상 펴기는 `unwrap`, coherence는 `mscohere`(또는 Chronux `coherencyc`), 원형 이동은 `circshift`입니다. 자세한 문법은 [파트 B — MATLAB](../B-matlab/)에서 다룹니다.

## 더 읽을거리
- Lachaux JP, Rodriguez E, Martinerie J, Varela FJ. Measuring phase synchrony in brain signals. *Human Brain Mapping* 8:194–208 (1999). [doi:10.1002/(SICI)1097-0193(1999)8:4<194::AID-HBM4>3.0.CO;2-C](https://doi.org/10.1002/(SICI)1097-0193(1999)8:4%3C194::AID-HBM4%3E3.0.CO;2-C)
- Nolte G, et al. Identifying true brain interaction from EEG data using the imaginary part of coherency. *Clinical Neurophysiology* 115:2292–2307 (2004). [doi:10.1016/j.clinph.2004.04.029](https://doi.org/10.1016/j.clinph.2004.04.029)
- Vinck M, et al. The pairwise phase consistency: A bias-free measure of rhythmic neuronal synchronization. *NeuroImage* 51:112–122 (2010). [doi:10.1016/j.neuroimage.2010.01.073](https://doi.org/10.1016/j.neuroimage.2010.01.073)
- Canolty RT, et al. High gamma power is phase-locked to theta oscillations in human neocortex. *Science* 313:1626–1628 (2006). [doi:10.1126/science.1128115](https://doi.org/10.1126/science.1128115)
- Tort ABL, et al. Measuring phase-amplitude coupling between neuronal oscillations of different frequencies. *Journal of Neurophysiology* 104:1195–1210 (2010). [doi:10.1152/jn.00106.2010](https://doi.org/10.1152/jn.00106.2010)
- Mike X Cohen, *MATLAB for Brain and Cognitive Scientists*, MIT Press (2017) — Hilbert 변환, 스펙트럼 coherence, spike-field coherence를 다룬 장. [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/)
- Pascal Wallisch 외, *MATLAB for Neuroscientists*, 2nd ed., Academic Press (2014) — 위상 분석과 coherence, LFP 장. [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0)

---
[← 이전](day-C4.md) · [코스 지도](../../../README.md) · [다음 →](day-C6.md)
