# Day C1 — 신경 데이터의 네 얼굴: spike, LFP, EEG/MEG, 칼슘 이미징

> **주차:** 심화 파트 C — 신경신호·시간-주파수 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/C/C1_neural_data.ipynb`
>
> **먼저 끝내 둘 레슨:** [Day 23 — 시계열 기초](../../week-4/day-23.md) (sampling rate, Nyquist, aliasing, 필터, window), [Day 6 — 생물학·생체신호 파일 형식](../../week-1/day-06.md). 웨어러블·심전도 쪽 흐름은 [Crash Course — 생리 신호 분석](../../../crash-course/physiology-signals.md)에 정리되어 있습니다. 이 파트는 그다음 단계로, **뇌에서 나온 신호**를 다룹니다.

## 오늘의 목표
- spike, LFP, EEG/MEG, 칼슘 이미징이 각각 무엇을 재고 어떤 시간·공간 규모를 갖는지 표로 비교할 수 있다.
- 연속 기록을 사건 기준으로 잘라 `채널 × 시간 × 시행` 배열을 만들고, 자른 결과가 원본과 맞는지 스스로 확인할 수 있다.
- 신호의 표본화 속도를 낮출 때 aliasing을 피하는 방법과, 칼슘 형광을 ΔF/F로 바꾸는 이유를 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [Brain Signals: LFP — Neuromatch](https://www.youtube.com/watch?v=PwkYgrTE2fU) (17:48)
- **무엇에 주목할까:** 전극 하나에 잡히는 전압이 "근처 수많은 세포의 시냅스 전류가 겹친 결과"라는 설명에 집중하세요. 같은 전극에서 빠른 성분은 spike, 느린 성분은 LFP로 나눠 본다는 점이 오늘 표의 출발점입니다.

- [Brain Signals: Calcium Imaging — Neuromatch](https://www.youtube.com/watch?v=_eJ-HvecSzU) (13:45)
- **무엇에 주목할까:** 형광이 스파이크보다 **느리게** 오르내리고, 영상의 한 장(frame)이 수십 밀리초라는 점을 기억하세요. 예시 3에서 가까운 스파이크 여러 개가 사건 하나로 합쳐지는 이유가 여기서 나옵니다.

## 개념 설명

### 같은 뇌, 네 가지 창문

뇌 활동을 재는 방법은 "얼마나 가까이서, 얼마나 빨리 보느냐"로 나눠 생각하면 쉽습니다. 세포 하나에 바짝 붙은 미세전극은 **활동전위(action potential, spike)** 를 잡습니다. 1–2 ms짜리 날카로운 파형이라 수십 kHz로 기록하고, 보통은 파형 대신 "언제 쐈는가"라는 **스파이크 시각 목록**만 남깁니다. 같은 전극의 신호를 수백 Hz 아래로 걸러 내면 **LFP(local field potential, 국소 장 전위)** 가 남습니다. 주변 수천 개 세포의 시냅스 전류가 겹친 느린 전압이고, 리듬(oscillation)을 볼 때 씁니다.

두피에서 재면 **EEG(뇌파)**, 머리 밖 자기장을 재면 **MEG** 입니다. 수백만 개 세포가 같은 방향으로 함께 움직일 때만 보이고, 두개골을 지나며 번지기 때문에 공간 해상도는 낮지만 시간 해상도는 밀리초 수준입니다. **칼슘 이미징(calcium imaging)** 은 세포 안 칼슘이 늘면 밝아지는 형광 단백질을 영상으로 찍습니다. 수백 개 세포를 한 화면에서 구별할 수 있지만, 형광은 스파이크보다 훨씬 느리게 변하고 1초에 10–30장 정도만 찍는 경우가 많습니다.

| 신호 | 무엇을 재나 | 흔한 기록 속도 | 시간 규모 | 공간 규모 | 저장되는 모양 |
|---|---|---|---|---|---|
| spike | 세포 하나의 활동전위 | 20–30 kHz (원파형) | ~1 ms | 세포 하나 | 스파이크 시각 목록, 파형 조각 |
| LFP | 전극 주변 시냅스 전류의 합 | 1 kHz 안팎 | 수 ms–수 초 | 수백 µm–mm | 채널 × 시간 |
| EEG/MEG | 넓은 피질 영역의 동기화된 활동 | 250–1000 Hz | 수 ms–수 초 | cm | 채널 × 시간 (+ 전극 위치) |
| 칼슘 이미징 | 세포 안 칼슘 → 형광 밝기 | 10–30 Hz (frame) | 수백 ms | 세포 하나–수백 개 | 영상 → 세포(ROI) × 시간 |

숫자는 **흔한 출발점**일 뿐이고 장비마다 다릅니다. 데이터를 받으면 설명서에서 반드시 확인합니다([Day 24](../../week-4/day-24.md)의 데이터 사전 습관 그대로).

### 데이터의 모양: 채널 × 시간 × 시행

신경과학 실험은 대개 같은 자극을 수십 번 반복합니다. 그래서 연속 기록(`채널 × 시간`)을 자극 시각마다 잘라 **epoch(시행 구간)** 을 만들고, 결과는 `채널 × 시간 × 시행`의 3차원 배열이 됩니다. 실험실 노트에 "같은 처치를 n번 반복"이라고 적는 것과 같습니다. 이 3차원 배열은 앞으로 7일 내내 쓰는 기본 그릇입니다.

자를 때는 **자극 전 구간**을 꼭 남깁니다. 4일째 배울 기저선 정규화가 이 구간을 "평소 상태"로 쓰기 때문입니다. 또 하나, 배열을 다루다 보면 `reshape`로 한 번에 자르고 싶어지는데, 축의 순서를 잘못 잡으면 오류 없이 **채널과 시간이 뒤섞인 쓰레기**가 나옵니다. 그래서 자른 뒤에는 "원본의 이 위치와 같은가?"를 코드로 한 번 확인하는 습관이 필요합니다(예시 1).

### 표본화 속도 바꾸기: 낮추기 전에 거르기

Day 23에서 Nyquist 주파수(sampling rate의 절반)보다 빠른 성분은 느린 가짜 성분으로 접혀 들어온다는 것을 배웠습니다. 이 문제는 기록할 때만이 아니라 **기록 뒤에 표본화 속도를 낮출 때(downsampling)** 다시 생깁니다. 1000 Hz 기록을 250 Hz로 줄이려고 네 개 중 하나만 남기면, 125 Hz보다 빠른 근육 잡음이 125 Hz 아래 어딘가로 옮겨 앉아 진짜 뇌 리듬처럼 보입니다. 해결은 간단합니다. **먼저 저역 통과 필터로 새 Nyquist보다 빠른 성분을 없애고, 그다음 솎아 냅니다.** `scipy.signal.decimate`나 `resample_poly`는 이 두 단계를 함께 해 줍니다.

반대로 카메라(예: 120 Hz)와 전기생리(예: 2 kHz)처럼 속도가 다른 두 기록을 맞출 때는 **보간(interpolation)** 으로 느린 쪽을 촘촘하게 채웁니다. 측정한 점 **사이**를 추정하는 보간은 비교적 믿을 만하지만, 측정 범위 **밖**을 추정하는 외삽(extrapolation)은 방법에 따라 결과가 크게 달라지므로 피합니다.

### 칼슘 형광은 ΔF/F로 읽는다

칼슘 영상의 원래 숫자는 픽셀 밝기입니다. 그런데 밝기는 세포마다 형광 단백질 양이 다르고, 기록이 길어지면 **광표백(photobleaching)** 으로 점점 어두워집니다. 그래서 "평소 밝기 F0에 비해 몇 % 밝아졌나"인 **ΔF/F = (F − F0) / F0** 로 바꿔 읽습니다. 웨스턴 블롯 밴드를 loading control로 나누는 것과 같은 발상입니다. F0는 보통 몇십 초짜리 이동 창에서 **낮은 백분위수**(예: 10번째)로 잡습니다. 활동이 있을 때는 밝아지기만 하므로, 아래쪽 값들이 "쉬는 상태"를 대표하기 때문입니다.

주의할 점은 ΔF/F의 봉우리가 **스파이크 하나와 같지 않다**는 것입니다. 형광이 오르내리는 데 수백 ms가 걸리므로 가까운 스파이크 여러 개가 사건 하나로 합쳐지고, 스파이크 하나는 잡음에 묻힐 수도 있습니다. 스파이크를 추정하는 전용 방법(deconvolution)은 있지만, 그 결과도 "추정"으로 읽어야 합니다.

## 예시로 이해하기

> 모든 예시는 코드 안에서 만든 **가상 신호**입니다. 숫자는 고정된 seed에서 나온 값이라 실제 데이터에서는 달라집니다.
>
> 이 파트 내내 이 방식을 씁니다. **답을 알고 만든 가상 신호**에 방법을 먼저 적용해 "넣은 것이 그대로 나오는지" 확인하고, 그다음 실제 데이터로 갑니다. 가상 신호에서 맞는다고 실제 데이터에서도 맞는 것은 아니지만, 가상 신호에서 틀리는 방법은 실제 데이터에서도 믿을 수 없습니다.

### 예시 1 — 연속 기록을 epoch로 자르고 확인하기

```python
import numpy as np

rng = np.random.default_rng(0)
fs = 500                      # 1초에 500번 기록 (Hz)
n_ch = 4                      # 전극 4개
dur = 20                      # 20초 연속 기록
n = fs * dur
t = np.arange(n) / fs

# 연속 기록: 채널 × 시간. 모든 채널에 10 Hz 리듬 + 잡음
cont = 0.5 * np.sin(2 * np.pi * 10 * t) + rng.normal(0, 1, (n_ch, n))
print("연속 데이터 모양 (채널, 시간):", cont.shape)

# 자극이 2초마다 한 번씩 나왔다고 하자 (사건 시각, 초)
events = np.arange(1.0, 19.0, 2.0)
pre, post = 0.5, 1.0                       # 자극 전 0.5초 ~ 후 1.0초
i_pre, i_post = int(pre * fs), int(post * fs)
starts = (events * fs).astype(int)

# epoch 자르기: 채널 × 시간 × 시행
epochs = np.stack([cont[:, s - i_pre:s + i_post] for s in starts], axis=2)
ep_time = np.arange(-i_pre, i_post) / fs
print("epoch 모양 (채널, 시간, 시행):", epochs.shape)
print("epoch 시간축: %.3f초 ~ %.3f초" % (ep_time[0], ep_time[-1]))

# 확인 1: 3번째 시행, 2번 채널의 첫 값이 연속 데이터의 같은 위치와 같은가?
print("자른 값이 원본과 같은가:", np.allclose(epochs[1, :, 2], cont[1, starts[2] - i_pre:starts[2] + i_post]))

# 함정: reshape로 '대충' 자르면 순서가 섞인다
wrong = cont[:, :fs * 2 * 9].reshape(n_ch * 9, fs * 2)   # 행 = (채널, 조각)이 한 줄로 섞임
right = cont[:, :fs * 2 * 9].reshape(n_ch, 9, fs * 2)    # 채널은 그대로, 시간만 2초씩
print("wrong[1]이 '채널1'인가?", np.allclose(wrong[1], cont[1, :fs * 2]))
print("wrong[1]은 사실 채널0의 두 번째 2초:", np.allclose(wrong[1], cont[0, fs * 2:fs * 4]))
print("right[1, 0]은 채널1의 첫 2초:", np.allclose(right[1, 0], cont[1, :fs * 2]))
```

실행 결과:

```text
연속 데이터 모양 (채널, 시간): (4, 10000)
epoch 모양 (채널, 시간, 시행): (4, 750, 9)
epoch 시간축: -0.500초 ~ 0.998초
자른 값이 원본과 같은가: True
wrong[1]이 '채널1'인가? False
wrong[1]은 사실 채널0의 두 번째 2초: True
right[1, 0]은 채널1의 첫 2초: True
```

마지막 세 줄이 핵심입니다. `wrong`은 오류 없이 만들어지지만, 두 번째 행이 "채널 1"이 아니라 "채널 0의 두 번째 2초"입니다. 코드가 돌아간다고 맞는 것이 아닙니다. 자른 뒤 원본과 한 점이라도 대조해 보세요.

### 예시 2 — 그냥 솎아 내면 없던 리듬이 생긴다

```python
import numpy as np
from scipy import signal

fs = 1000                                   # 원래 1000 Hz로 기록
t = np.arange(0, 4, 1 / fs)
# 10 Hz 뇌 리듬 + 180 Hz 고주파 잡음(예: 근육 활동)
x = np.sin(2 * np.pi * 10 * t) + 0.8 * np.sin(2 * np.pi * 180 * t)

def amp_at(sig, rate, f):
    """진폭 스펙트럼에서 주파수 f(Hz)의 진폭"""
    amp = np.abs(np.fft.rfft(sig)) / len(sig) * 2
    hz = np.fft.rfftfreq(len(sig), 1 / rate)
    return round(float(amp[np.argmin(np.abs(hz - f))]), 3)

print("원본 1000 Hz  : 10 Hz=%.3f, 180 Hz=%.3f" % (amp_at(x, fs, 10), amp_at(x, fs, 180)))

# (1) 4개마다 하나씩 그냥 버리기 -> 250 Hz, Nyquist = 125 Hz
naive = x[::4]
print("그냥 솎아 냄  : 10 Hz=%.3f, 70 Hz=%.3f  <- 없던 70 Hz가 생겼다" % (amp_at(naive, 250, 10), amp_at(naive, 250, 70)))

# (2) 저역 통과 필터를 먼저 건 뒤 낮추기 (decimate가 둘 다 해 준다)
safe = signal.decimate(x, 4, ftype="fir", zero_phase=True)
print("decimate 사용 : 10 Hz=%.3f, 70 Hz=%.3f" % (amp_at(safe, 250, 10), amp_at(safe, 250, 70)))
```

실행 결과:

```text
원본 1000 Hz  : 10 Hz=1.000, 180 Hz=0.800
그냥 솎아 냄  : 10 Hz=1.000, 70 Hz=0.800  <- 없던 70 Hz가 생겼다
decimate 사용 : 10 Hz=1.003, 70 Hz=0.001
```

180 Hz 잡음이 250 Hz 기록에서는 |250 − 180| = 70 Hz로 접혀 나타났습니다. 70 Hz는 감마 대역이라, 모르고 보면 "자극 후 감마가 늘었다" 같은 잘못된 결론이 나올 수 있습니다. `decimate`는 먼저 거른 뒤 낮추므로 70 Hz 자리가 거의 0입니다.

### 예시 3 — 칼슘 형광을 ΔF/F로 바꾸고 사건 찾기

```python
import numpy as np
from scipy import ndimage

rng = np.random.default_rng(1)
fs = 30                                  # 칼슘 영상: 1초에 30장(frame)
t = np.arange(0, 60, 1 / fs)             # 60초
n = len(t)

# 1) 숨은 '진짜' 스파이크: 60초 동안 몇 번
spike_times = np.array([5.0, 5.3, 14.0, 27.5, 28.0, 28.4, 41.0, 52.2])
spikes = np.zeros(n)
spikes[np.round(spike_times * fs).astype(int)] = 1

# 2) 스파이크 하나가 남기는 칼슘 형광 모양: 빨리 오르고 천천히 감소(약 0.5초)
kt = np.arange(0, 3, 1 / fs)
kernel = (1 - np.exp(-kt / 0.05)) * np.exp(-kt / 0.5)
calcium = np.convolve(spikes, kernel)[:n]

# 3) 측정되는 형광 F = 기저 밝기(서서히 어두워짐: 광표백) + 신호 + 잡음
baseline = 100 * np.exp(-t / 300)
F = baseline * (1 + 0.6 * calcium) + rng.normal(0, 1.5, n)

# 4) ΔF/F: 기저 F0를 '이동 하위 백분위수'로 추정한 뒤 (F - F0) / F0
F0 = ndimage.percentile_filter(F, percentile=10, size=int(20 * fs))
dff = (F - F0) / F0

# 5) 사건 검출: 중앙값을 0으로 맞추고, 잡음 SD(중앙값 절대편차로 추정)의 4배를 넘는 '시작' 지점
dff = dff - np.median(dff)
noise_sd = 1.4826 * np.median(np.abs(dff))
above = dff > 4 * noise_sd
onsets = np.flatnonzero(above[1:] & ~above[:-1]) + 1
print("잡음 SD 추정: %.3f" % noise_sd)
print("검출된 사건 시작(초):", np.round(onsets / fs, 2))
print("실제 스파이크(초):    ", spike_times)
print("F의 처음/끝 평균 밝기: %.1f -> %.1f (광표백)" % (F[:fs].mean(), F[-fs:].mean()))
print("ΔF/F의 처음/끝 중앙값: %.3f -> %.3f" % (np.median(dff[:10 * fs]), np.median(dff[-10 * fs:])))
```

실행 결과:

```text
잡음 SD 추정: 0.023
검출된 사건 시작(초): [ 5.03 14.03 27.53 29.63 29.8  41.03 52.23 53.17]
실제 스파이크(초):     [ 5.   5.3 14.  27.5 28.  28.4 41.  52.2]
F의 처음/끝 평균 밝기: 99.7 -> 82.5 (광표백)
ΔF/F의 처음/끝 중앙값: 0.001 -> -0.006
```

읽는 법: 5.0, 14.0, 27.5, 41.0, 52.2초 근처의 사건은 잘 찾았습니다. 그러나 5.0초와 5.3초, 27.5·28.0·28.4초처럼 **가까운 스파이크는 사건 하나로 합쳐졌고**, 29.6–29.8초와 53.2초처럼 큰 사건의 꼬리에서 문턱을 다시 넘은 **가짜 사건**도 생겼습니다. 칼슘 데이터의 "사건 수"를 "스파이크 수"로 바꿔 말하면 안 되는 이유입니다. 원래 밝기는 광표백으로 100에서 82로 떨어졌지만, 이동 백분위수 F0로 나눈 ΔF/F는 처음과 끝의 기준선이 거의 같습니다.

## 직접 해보기

1. `notebooks/advanced/C/C1_neural_data.ipynb`를 만들고 예시 1–3을 셀 세 개에 나눠 실행합니다. 첫 셀 맨 위에 `fs`, 채널 수, 기록 길이를 변수로 적어 두는 습관을 들입니다.
2. 예시 1에서 `pre`를 0.2초로 줄여 다시 자르고, `ep_time`의 처음 값이 어떻게 바뀌는지 확인합니다. 그다음 `post`를 4초로 늘리면 무슨 일이 생기는지 보세요. 마지막 사건(17초) 뒤로 기록이 3초밖에 없어서, 그 조각만 짧게 잘리고 `np.stack`이 모양이 다르다는 오류를 냅니다.
3. **시행별 RMS로 이상 시행 찾기:** 예시 1의 `epochs`에서 시행 하나(예: 5번째)의 채널 2에 큰 값 `+8`을 50개 표본 동안 더한 뒤, `np.sqrt(np.mean(epochs**2, axis=1))`로 `채널 × 시행` RMS 표를 만들어 출력합니다. 평균 파형만 볼 때보다 어느 시행이 이상한지 훨씬 쉽게 보입니다.
4. 예시 2에서 잡음 주파수를 180 Hz 대신 240 Hz, 260 Hz로 바꿔 보고, 솎아 낸 신호에서 어느 주파수로 접혀 나타나는지 예측한 다음 확인합니다.
5. 예시 3에서 `percentile=10`을 50으로 바꾸면 ΔF/F의 기준선과 검출 사건이 어떻게 바뀌는지 적습니다. 그다음 F0 창 `size`를 2초로 줄여 보세요. 긴 사건이 F0에 "먹혀" 작아지는 것을 볼 수 있습니다.
6. 노트북 마지막 셀에 오늘 다룬 네 신호를 표로 적고, 내 관심 질환(예: 파킨슨병의 beta 리듬, 알츠하이머 모델 생쥐의 칼슘 영상)에서 어느 신호가 쓰이는지 한 줄씩 메모합니다. 진단이 아니라 "무엇을 잴 수 있나"의 메모입니다.

> ⚠️ **흔한 오류 1:** `epochs[:, s - i_pre : s + i_post]`에서 `s - i_pre`가 음수가 되면 NumPy는 오류 대신 **배열 끝에서부터** 잘라 길이가 0인 조각을 돌려줍니다. 첫 사건이 기록 시작에 너무 가까우면 그 시행을 빼고, 몇 개를 뺐는지 기록하세요.
>
> ⚠️ **흔한 오류 2:** `x[::4]`처럼 슬라이싱으로 표본화 속도를 낮추면 오류 없이 aliasing이 생깁니다. 낮출 때는 `signal.decimate` 또는 `signal.resample_poly`를 씁니다.

## 퀴즈

**1.** 같은 미세전극에서 얻은 기록을 300 Hz 저역 통과 필터로 거르면 주로 무엇이 남는가?

(a) 활동전위 파형 (b) LFP (c) EEG (d) 칼슘 형광

<details><summary>정답 보기</summary>

(b) LFP. 활동전위는 1–2 ms짜리 빠른 파형이라 높은 주파수 성분이 대부분이고, 낮은 주파수 쪽에는 주변 시냅스 전류가 겹친 LFP가 남습니다. EEG는 두피에서 재는 다른 측정입니다.

</details>

**2.** 1000 Hz 기록에 150 Hz 잡음이 있다. 필터 없이 200 Hz로 솎아 내면 이 잡음은 몇 Hz로 보이는가?

<details><summary>정답 보기</summary>

50 Hz. 새 Nyquist는 100 Hz이고, 150 Hz는 표본화 주파수 200 Hz에서 |200 − 150| = 50 Hz로 접혀 들어옵니다. 50 Hz는 전원 잡음 주파수와 같아 더 헷갈리게 됩니다.

</details>

**3.** 연속 기록 `cont`(4채널 × 10,000표본)를 `reshape(4 * 5, 2000)`로 바꿨다. 이 배열의 두 번째 행은 무엇인가?

<details><summary>정답 보기</summary>

채널 0의 두 번째 2000표본 구간입니다. NumPy는 마지막 축부터 채우므로 한 채널의 시간 축이 먼저 2000개씩 잘려 줄을 섭니다. 행 번호가 "채널"이라고 생각하면 틀립니다. 그래서 자른 뒤 원본과 대조하는 확인 코드가 필요합니다.

</details>

**4.** ΔF/F의 F0를 이동 창의 **평균**이 아니라 **낮은 백분위수**로 잡는 이유는?

<details><summary>정답 보기</summary>

세포가 활동할 때 형광은 밝아지는 쪽으로만 움직입니다. 평균을 쓰면 활동이 많은 구간에서 F0가 올라가 ΔF/F가 작게 나옵니다. 낮은 백분위수는 "쉬는 상태"의 밝기를 대표하므로 활동량에 덜 끌려갑니다.

</details>

**5.** 칼슘 영상에서 ΔF/F 사건이 10개 검출되었다. "이 세포는 스파이크를 10번 쏘았다"고 쓸 수 있는가?

<details><summary>정답 보기</summary>

쓸 수 없습니다. 형광은 느려서 가까운 스파이크 여러 개가 사건 하나로 합쳐지고, 스파이크 하나는 잡음에 묻히기도 합니다. "ΔF/F 사건 10개"라고 쓰고, 스파이크 추정이 필요하면 추정 방법과 그 한계를 함께 밝힙니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/advanced/C/C1_neural_data.ipynb`에 예시 1–3이 위에서 아래로 실행된다.
- [ ] epoch 배열의 모양과 시간축(시작·끝 시각)을 출력하고, 원본 대조 확인 코드가 `True`를 낸다.
- [ ] 시행별 RMS 표로 일부러 망가뜨린 시행을 찾았다.
- [ ] aliasing 실험(240 Hz, 260 Hz) 결과와 예측이 맞았는지 적었다.
- [ ] 네 가지 신호 비교표와 관심 질환 메모를 남겼다.

## MATLAB으로는

epoch 자르기는 인덱싱과 `reshape`·`permute`, 표본화 속도 낮추기는 `decimate`·`resample`, 보간은 `interp1`·`griddedInterpolant`, 백분위수 기저선은 `prctile`·`movmedian`을 씁니다. 자세한 문법은 [파트 B — MATLAB](../B-matlab/)에서 다룹니다.

## 더 읽을거리
- Buzsáki G, Anastassiou CA, Koch C. The origin of extracellular fields and currents — EEG, ECoG, LFP and spikes. *Nature Reviews Neuroscience* 13:407–420 (2012). [doi:10.1038/nrn3241](https://doi.org/10.1038/nrn3241)
- Mike X Cohen, *MATLAB for Brain and Cognitive Scientists*, MIT Press (2017) — 데이터 분석 태도, 보간과 표본화 속도 낮추기를 다룬 장. [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/)
- Pascal Wallisch 외, *MATLAB for Neuroscientists*, 2nd ed., Academic Press (2014). [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0)

---
[← 이전](../../../README.md) · [코스 지도](../../../README.md) · [다음 →](day-C2.md)
