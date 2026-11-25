# Day K3 — EMG와 피부전도도를 NeuroKit2로: 라이브러리 기본값 읽기와 단위의 한계

> **주차:** 심화 파트 K — 멀티모달 FOG 데이터 분석 · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/K/K3_emg_eda.ipynb`, `reports/advanced/K/K3_emg_eda.md` (손 구현 vs NeuroKit2 비교, 기록별 EMG RMS·SC 표, 해석 한계 다섯 줄)
>
> **먼저 끝내 둘 레슨:** [Day K2](day-K2.md)(표본화 출처, `window_starts`·`window_label`), [Day I5](../I-gait/day-I5.md)(EMG band-pass → 정류 → envelope → 정규화를 손으로), [Day C3](../C-neural-signals/day-C3.md)(Welch PSD). 선택: [Day 26](../../week-4/day-26.md)(신호를 특징 표로)
>
> **이론 노트:** [T11 — 보행동결(FOG)](../I-gait-theory/note-T11.md)

## 오늘의 목표
- `nk.emg_process`의 기본 처리 단계를 Day I5의 손 구현과 비교하고, 같은 설정이면 같은 숫자가 나오는지 확인할 수 있다.
- window별 EMG RMS를 계산하고, RMS와 절댓값 평균이 FOG/걷기 비교에서 다른 답을 낼 수 있음을 설명할 수 있다.
- 피부전도도를 tonic(SCL)과 phasic(SCR)으로 나누고, 저역 신호라 내려 표본화해도 되는 이유와 ADC 카운트 단위의 해석 한계를 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [Surface Electromyography (SEMG) Signal Processing | Part 1 — ThatsEngineering](https://www.youtube.com/watch?v=5AtAoO51vWQ) (12:15)
- **무엇에 주목할까:** [Day I5](../I-gait/day-I5.md)에서 본 영상입니다. 이번에는 각 단계에서 **어떤 숫자(차단 주파수, 필터 차수)를 골랐는지**에 귀를 기울이세요. 오늘은 라이브러리가 그 숫자들을 대신 골라 줄 때, 그 선택을 직접 찾아 읽는 연습을 합니다.

## 개념 설명

EMG를 band-pass → 정류 → envelope → 정규화로 손수 처리하는 방법과 각 단계의 의미는 [Day I5](../I-gait/day-I5.md)에서 이미 했습니다. 오늘은 같은 일을 **라이브러리(NeuroKit2)** 로 할 때 무엇이 달라지는지, 그리고 처음 만나는 신호인 **피부전도도**를 다룹니다.

### 라이브러리 함수는 "남이 고른 설정의 묶음"이다

`nk.emg_process(emg, sampling_rate=fs)` 한 줄은 편하지만, 그 안에는 누군가 고른 숫자가 여럿 들어 있습니다. 설치된 NeuroKit2 0.3.0의 소스를 열어 보면 기본 처리는 이렇습니다.

| 단계 | Day I5 손 구현(이 레슨의 설정) | `nk.emg_process` 기본값 |
|---|---|---|
| 잡음 제거 | 20–240 Hz band-pass, 4차 Butterworth, 앞뒤 필터 | **100 Hz high-pass**, 4차 Butterworth, 앞뒤 필터, 평균 제거 |
| 크기 만들기 | 전파 정류 `abs` | **TKEO**(Teager–Kaiser 에너지 연산자) → 10 Hz high-pass(400 Hz 위 차단은 Nyquist를 넘으면 생략) → `abs` |
| envelope | 6 Hz low-pass, 2차 | 8 Hz low-pass, 2차 |

TKEO는 이웃한 세 표본으로 x[n]² − x[n−1]·x[n+1]을 계산합니다. 대략 "진폭의 제곱 × 주파수의 제곱"에 비례해서, 진폭이 큰 burst를 훨씬 크게 부풀립니다. 같은 "amplitude"라는 이름이라도 손 구현의 envelope은 **진폭**에, NeuroKit2의 것은 **진폭의 제곱 쪽**에 가깝습니다. 그래서 두 결과는 모양은 닮아도 비교의 **방향**이 뒤집힐 수 있습니다(예시 1). 같은 요리 이름이라도 집마다 양념이 다르듯, 라이브러리 함수의 이름만 보고 결과를 다른 연구와 비교하면 안 됩니다. 반대로 설정을 똑같이 맞추면 결과도 똑같아야 합니다. NeuroKit2의 `signal_filter(method="butterworth")`는 SciPy의 `butter(..., output="sos")`와 `sosfiltfilt`를 그대로 부르므로, 같은 차단 주파수와 차수를 주면 숫자가 완전히 같습니다.

### RMS: 제곱해서 평균 내고 제곱근

window 하나의 EMG 세기를 숫자 하나로 줄이는 대표 방법이 **RMS**(root mean square, 제곱평균제곱근)입니다. 값을 제곱해 평균한 뒤 제곱근을 취하므로 음수와 양수가 상쇄되지 않고, 신호의 **에너지**와 직접 연결됩니다. 큰 값을 제곱으로 키우기 때문에 짧고 강한 burst에 민감합니다. 반면 절댓값 평균(MAV)은 모든 값을 같은 무게로 봅니다. 같은 window라도 "가끔 세게"와 "계속 중간 세기"를 두 지표가 반대로 줄 세울 수 있습니다(예시 2). 두 지표 모두 리듬(규칙적인 켜짐·꺼짐)은 담지 못하므로, 리듬을 보려면 envelope의 변동계수 같은 다른 특징이 필요합니다.

### 피부전도도: 느린 기저선과 빠른 반응

피부전도도(skin conductance, SC; 전기피부활동 EDA라고도 부름)는 땀샘 활동에 따라 피부가 전기를 얼마나 잘 통하는지를 잽니다. 교감신경 활성과 연결되므로 각성·긴장의 지표로 쓰입니다. 신호는 두 성분으로 나눠 봅니다.
- **tonic(SCL, skin conductance level):** 수십 초–분 단위로 천천히 움직이는 기저선
- **phasic(SCR, skin conductance response):** 자극 뒤 1–3초 동안 빠르게 올랐다가 천천히 내려오는 봉우리

조수(tide)와 그 위의 파도를 떠올리면 됩니다. `nk.eda_process`의 기본값은 3 Hz low-pass(4차 Butterworth)로 정리한 뒤, **0.05 Hz high-pass로 걸러 낸 부분을 phasic, low-pass로 걸러 낸 부분을 tonic**으로 나눕니다. 이 분해는 정의일 뿐입니다. 20초보다 빠르게 변하는 것은 모두 phasic으로 분류되므로, 10초에 걸쳐 오르는 기저선 변화는 일부가 "반응"으로 바뀝니다. SCR 봉우리는 phasic 최댓값의 10%보다 낮은 것은 버리는 **상대** 기준으로 찾습니다.

SC는 몇 Hz 위에 정보가 거의 없는 **저역 신호**라서, 저역 통과를 먼저 하고 10 Hz 정도로 내려도 잃는 것이 없습니다(예시 3). 데이터가 50배 작아져 계산도 빨라집니다. 단, [Day K2](day-K2.md)에서 본 것처럼 필터 없이 건너뛰지는 않습니다.

이 데이터의 SC에는 결정적인 한계가 있습니다. 값이 µS(마이크로지멘스)가 아니라 **ADC 카운트**(기록마다 대략 600–1970)이고, README는 연산증폭기 회로(LM324)라는 것 외에 변환식을 주지 않습니다. 카운트가 커질 때 전도도가 커지는지 작아지는지도 문서로 확인할 수 없습니다. 그러면 할 수 있는 것은 **한 과제 안에서의 상대 변화**뿐입니다. 사람 사이의 SCL 크기 비교, 문헌의 µS 값과의 비교, "SCR이 0.05 µS 넘으면" 같은 절대 기준은 쓸 수 없고, 부호가 거꾸로일 가능성까지 열어 둡니다(예시 3의 마지막 줄).

### FOG와 생리 신호: 문헌이 말하는 것과 말하지 않는 것

FOG에 자율신경계·정서 요인이 관여한다는 가설은 [T11](../I-gait-theory/note-T11.md)에서 다뤘습니다. 웨어러블 생리 신호와 직접 관련된 연구 두 편을 서지 확인 후 요약합니다.
- **Maidan 외(2010, *Mov Disord*):** 약효가 떨어진 상태의 FOG 환자 10명에게서 FOG 120회를 분석했습니다. FOG 동안 심박이 FOG 직전보다 평균 1.8 bpm 올랐고, FOG 바로 전에도 약 1 bpm 올랐습니다. 갑자기 멈추거나 180° 회전할 때는 반대로 약 2 bpm 내려갔고, 심박변이도는 FOG와 관련이 없었습니다.
- **Mazilu 외(2015, *IEEE J Biomed Health Inform*):** FOG를 겪는 11명의 ECG와 SC를 분석해, FOG 직전에 보통 걷기와 비교해 통계적으로 유의한 변화를 보고했습니다. SC 특징으로 만든 이상 탐지 알고리즘이 184회의 FOG 중 71.3%를 평균 4.2초 앞서 예측했다고 합니다.

두 연구 모두 **연관**이고 표본이 작으며, 오늘 데이터와 장비·단위가 다릅니다. "SC가 오르면 FOG가 온다"처럼 일반화하지 않습니다. 이 데이터로 할 수 있는 것은 같은 방향의 신호가 **이 기록들 안에서** 보이는지 탐색하는 것까지입니다.

## 예시로 이해하기

### 예시 1 — 손 구현 vs `nk.emg_process`: 모양은 닮았는데 비교의 방향이 다르다

```python
import numpy as np
import neurokit2 as nk
from scipy.signal import butter, sosfiltfilt

# ---- 합성 데이터 뼈대 + 전경골근 EMG (Day K1 예시 2와 같은 가정) ----
fs = 500
t = np.arange(0, 60, 1/fs)
label = ((t >= 25) & (t < 35)).astype(int)
rng = np.random.default_rng(0)
acc = np.where(label == 0, np.sin(2*np.pi*1.0*t), 0.4*np.sin(2*np.pi*5.0*t)) + 0.1*rng.standard_normal(t.size)
burst = (np.sin(2*np.pi*1.0*t) > 0.5).astype(float)
amp = np.where(label == 0, 0.1 + 0.9*burst, 0.5)
emg = amp * rng.standard_normal(t.size)

# (1) Day I5 방식 손 구현: band-pass → 전파 정류 → low-pass envelope
def hand_envelope(x, fs, band=(20, 240), env_fc=6):
    bp = sosfiltfilt(butter(4, band, btype="bandpass", fs=fs, output="sos"), x - x.mean())
    return sosfiltfilt(butter(2, env_fc, btype="low", fs=fs, output="sos"), np.abs(bp))
env_hand = hand_envelope(emg, fs)

# (2) NeuroKit2 기본값
signals, info = nk.emg_process(emg, sampling_rate=fs)
env_nk = signals["EMG_Amplitude"].to_numpy()
print("nk.emg_process 열:", list(signals.columns))
print("두 envelope의 상관 r = %.3f" % np.corrcoef(env_hand, env_nk)[0, 1])
print("평균 크기: 손 %.3f, nk %.3f" % (env_hand.mean(), env_nk.mean()))
for name, e in [("손", env_hand), ("nk", env_nk)]:
    print(f"{name}: FOG 구간 평균 / 걷기 구간 평균 = {e[label == 1].mean() / e[label == 0].mean():.2f}")

# (3) 같은 설정이면 같은 숫자인가: nk.signal_filter로 손 구현의 band-pass를 다시 만든다
bp_scipy = sosfiltfilt(butter(4, (20, 240), btype="bandpass", fs=fs, output="sos"), emg - emg.mean())
bp_nk = nk.signal_filter(emg - emg.mean(), sampling_rate=fs, lowcut=20, highcut=240, method="butterworth", order=4)
print("같은 설정의 band-pass 최대 차이: %.2e" % np.max(np.abs(bp_scipy - bp_nk)))
```

실행 결과(NeuroKit2 0.3.0):

```text
nk.emg_process 열: ['EMG_Raw', 'EMG_Clean', 'EMG_Amplitude', 'EMG_Activity', 'EMG_Onsets', 'EMG_Offsets']
두 envelope의 상관 r = 0.916
평균 크기: 손 0.311, nk 0.171
손: FOG 구간 평균 / 걷기 구간 평균 = 1.21
nk: FOG 구간 평균 / 걷기 구간 평균 = 0.69
같은 설정의 band-pass 최대 차이: 0.00e+00
```

두 envelope은 r = 0.92로 모양이 비슷하지만, "FOG 동안 EMG가 더 큰가"에 대한 답은 반대입니다(1.21 vs 0.69). 손으로 계산해 보면 이유가 보입니다. 이 합성 EMG에서 걷기 진폭은 1/3의 시간 동안 1.0, 나머지 2/3는 0.1이고, FOG 진폭은 늘 0.5입니다. 진폭의 평균은 걷기 0.40 대 FOG 0.5라 FOG가 크지만, 진폭 **제곱**의 평균은 걷기 0.34 대 FOG 0.25라 걷기가 큽니다. TKEO가 제곱 쪽에 가깝기 때문에 생긴 뒤집힘입니다. 마지막 줄은 설정을 맞추면 두 도구가 비트 하나까지 같은 결과를 낸다는 확인입니다. **결과가 다르면 도구가 아니라 설정이 다른 것**입니다.

### 예시 2 — window별 RMS: RMS와 MAV가 다른 답을 낼 때

```python
import numpy as np
import pandas as pd
from scipy.signal import butter, sosfiltfilt

fs = 500
t = np.arange(0, 60, 1/fs)
label = ((t >= 25) & (t < 35)).astype(int)
rng = np.random.default_rng(0)
acc = np.where(label == 0, np.sin(2*np.pi*1.0*t), 0.4*np.sin(2*np.pi*5.0*t)) + 0.1*rng.standard_normal(t.size)
burst = (np.sin(2*np.pi*1.0*t) > 0.5).astype(float)
amp = np.where(label == 0, 0.1 + 0.9*burst, 0.5)
emg = amp * rng.standard_normal(t.size)

def window_starts(n, fs=500, win_s=2.0, step_s=1.0):      # Day K2에서 만든 함수
    w, s = int(win_s * fs), int(step_s * fs)
    return np.arange(0, n - w + 1, s)

bp = sosfiltfilt(butter(4, (20, 240), btype="bandpass", fs=fs, output="sos"), emg - emg.mean())
W = 2 * fs
st = window_starts(bp.size, fs)
seg = bp[st[:, None] + np.arange(W)]                        # (window 수, 1000)
lab = label[st[:, None] + np.arange(W)]
win = pd.DataFrame({"start_s": st / fs,
                    "rms": np.sqrt(np.mean(seg ** 2, axis=1)),          # 제곱 → 평균 → 제곱근
                    "mav": np.mean(np.abs(seg), axis=1),                # 비교용: 절댓값 평균
                    "cv_env": [np.std(e) / np.mean(e) for e in np.abs(seg)],  # 리듬이 있으면 크다
                    "fog": (lab.mean(axis=1) >= 0.5).astype(int)})
print(win.groupby("fog")[["rms", "mav", "cv_env"]].median().round(3))
print("RMS / MAV 비 (가우스 잡음이면 약 1.25):", round(float((win.rms / win.mav).median()), 3))
```

실행 결과:

```text
       rms    mav  cv_env
fog                      
0    0.546  0.302   1.520
1    0.465  0.362   0.765
RMS / MAV 비 (가우스 잡음이면 약 1.25): 1.809
```

RMS로는 걷기 window가 크고(0.546 > 0.465), MAV로는 FOG window가 큽니다(0.302 < 0.362). 예시 1과 같은 이유입니다. RMS가 MAV의 약 1.8배라는 것은 세기가 고르지 않다는 신호이고(고른 가우스 잡음이면 √(π/2) ≈ 1.25배), 정류 신호의 변동계수 `cv_env`는 걷기의 켜짐·꺼짐 리듬을 잡아 FOG window와 크게 갈립니다. 특징 하나만 보고 "FOG 때 근활성이 줄었다/늘었다"고 말하지 않습니다.

### 예시 3 — SC 분해, 10 Hz로 내리기, 그리고 부호를 모를 때

```python
import numpy as np
import neurokit2 as nk
from scipy.signal import resample_poly

fs = 500
t = np.arange(0, 60, 1/fs)
label = ((t >= 25) & (t < 35)).astype(int)
rng = np.random.default_rng(0)
# ---- 오늘 덧붙임: 피부전도도 SC (µS라고 가정한 설명용 신호) ----
tonic = 5 + 0.01 * t                         # SCL: 기록 내내 천천히 오르는 기저선(가정)
scr_onsets = [8.0, 23.0, 44.0]               # SCR: FOG 시작 2초 전(23초)에 하나 있다고 가정
phasic = np.zeros(t.size)
for s in scr_onsets:
    tau = np.clip(t - s, 0, None)
    phasic += 0.4 * (np.exp(-tau / 2.0) - np.exp(-tau / 0.5)) * (t >= s)   # 빠른 상승·느린 하강
sc = tonic + phasic + 0.005 * rng.standard_normal(t.size)

def summarize(x, fs, name):
    sig, info = nk.eda_process(x, sampling_rate=fs)
    peaks = np.flatnonzero(sig["SCR_Peaks"].to_numpy()) / fs
    print(f"{name:16s} 행 {x.size:5d} | SCR 봉우리(초): {np.round(peaks, 1).tolist()} "
          f"| tonic 처음·끝: {sig['EDA_Tonic'].iloc[0]:.2f} → {sig['EDA_Tonic'].iloc[-1]:.2f}")
    return sig

sig = summarize(sc, fs, "500 Hz")
print("열:", list(sig.columns))
sc10 = resample_poly(sc, up=1, down=50, padtype="line")    # 저역 통과 후 500 → 10 Hz
summarize(sc10, 10, "10 Hz (필터 후 내림)")
summarize(2000 - 100 * sc, fs, "부호 뒤집힌 카운트")        # 회로에 따라 카운트가 거꾸로 움직일 수 있다(가정)
```

실행 결과:

```text
500 Hz           행 30000 | SCR 봉우리(초): [8.9, 23.9, 44.9] | tonic 처음·끝: 5.01 → 5.56
열: ['EDA_Raw', 'EDA_Clean', 'EDA_Tonic', 'EDA_Phasic', 'SCR_Onsets', 'SCR_Peaks', 'SCR_Height', 'SCR_Amplitude', 'SCR_RiseTime', 'SCR_Recovery', 'SCR_RecoveryTime']
10 Hz (필터 후 내림)  행   600 | SCR 봉우리(초): [8.9, 23.9, 44.9] | tonic 처음·끝: 5.01 → 5.57
부호 뒤집힌 카운트       행 30000 | SCR 봉우리(초): [7.9, 22.9, 43.9, 50.4] | tonic 처음·끝: 1498.59 → 1444.01
```

세 가지를 읽습니다. (1) SCR 세 개가 시작 약 0.9초 뒤 봉우리로 잡혔고, 기저선은 5.0 → 5.6으로 천천히 오릅니다. (2) **10 Hz로 내려도 결과가 같습니다**(행은 50분의 1). 그래서 실제 데이터는 10 Hz로 내려 처리합니다. `padtype="line"`을 빼면 SC처럼 0에서 먼 값에서는 기록 양 끝에 가짜 계단이 생겨 첫 봉우리로 잡힐 수 있습니다. (3) 같은 신호를 카운트가 거꾸로 움직이는 회로로 쟀다고 가정하면, 봉우리 위치가 1초씩 당겨지고 없던 봉우리(50.4초)가 생깁니다. 단위와 방향을 모르는 SC에 SCR 검출을 그대로 돌리면 이런 결과가 섞일 수 있습니다.

## 직접 해보기

모든 문제는 위 합성 데이터 뼈대(`fs`, `t`, `label`, `rng`, `acc`)와 예시 1의 `emg`를 쓴다고 가정합니다. 문제 앞에 다음을 먼저 실행하세요.

```python
import numpy as np
import neurokit2 as nk
from scipy.signal import butter, sosfiltfilt, resample_poly
fs = 500
t = np.arange(0, 60, 1/fs)
label = ((t >= 25) & (t < 35)).astype(int)
rng = np.random.default_rng(0)
acc = np.where(label == 0, np.sin(2*np.pi*1.0*t), 0.4*np.sin(2*np.pi*5.0*t)) + 0.1*rng.standard_normal(t.size)
burst = (np.sin(2*np.pi*1.0*t) > 0.5).astype(float)
amp = np.where(label == 0, 0.1 + 0.9*burst, 0.5)
emg = amp * rng.standard_normal(t.size)
```

**1. RMS 한 줄.** 처음 2초(1000표본)의 RMS를 구하세요.

```python
seg = emg[:1000].reshape(1, -1)
print("첫 2초 RMS: %.3f" % np.sqrt(np.mean(seg ** ____, axis=1))[0])
```

<details><summary>모범답안 보기</summary>

```python
print("첫 2초 RMS: %.3f" % np.sqrt(np.mean(seg ** 2, axis=1))[0])
```

```text
첫 2초 RMS: 0.564
```

제곱 → 평균 → 제곱근 순서입니다. `axis=1`은 "window 안의 표본들에 대해"라는 뜻이라 window가 여러 개여도 한 줄로 됩니다.

</details>

**2. 전파 정류.** band-pass한 EMG의 평균은 거의 0입니다. 정류해서 평균을 다시 구하세요.

```python
bp = sosfiltfilt(butter(4, (20, 240), btype="bandpass", fs=fs, output="sos"), emg - emg.mean())
print("정류 전 평균 %.4f, 정류 후 평균 %.3f" % (bp.mean(), np.____(bp).mean()))
```

<details><summary>모범답안 보기</summary>

```python
print("정류 전 평균 %.4f, 정류 후 평균 %.3f" % (bp.mean(), np.abs(bp).mean()))
```

```text
정류 전 평균 0.0000, 정류 후 평균 0.311
```

[Day I5](../I-gait/day-I5.md) 예시 1에서 본 것처럼 정류하지 않고 평균하면 양과 음이 상쇄됩니다.

</details>

**3. NeuroKit2로 처리하고 FOG/걷기 비 구하기.**

```python
signals, info = nk.emg_process(emg, sampling_rate=____)
a = signals["EMG_Amplitude"].to_numpy()
print("nk amplitude FOG/걷기 = %.2f" % (a[label == 1].mean() / a[label == 0].mean()))
```

<details><summary>모범답안 보기</summary>

```python
signals, info = nk.emg_process(emg, sampling_rate=fs)
```

```text
nk amplitude FOG/걷기 = 0.69
```

`sampling_rate`를 빼면 기본값 1000 Hz로 가정되어 모든 차단 주파수가 두 배 어긋납니다. NeuroKit2 함수는 거의 다 이 인자를 받으니 **항상 명시**합니다.

</details>

**4. SC를 10 Hz로 내리기.** 500 Hz SC를 10 Hz로 내리려면 몇 분의 1로 줄입니까?

```python
sc = 5 + 0.01 * t + 0.005 * rng.standard_normal(t.size)
sc10 = resample_poly(sc, up=1, down=____, padtype="line")
print(sc.size, "→", sc10.size, "행")
```

<details><summary>모범답안 보기</summary>

```python
sc10 = resample_poly(sc, up=1, down=50, padtype="line")
```

```text
30000 → 600 행
```

500 / 10 = 50. `resample_poly`는 줄이기 전에 저역 통과 필터를 걸어 [Day K2](day-K2.md)의 aliasing을 막습니다.

</details>

**5. 과제 안 z-점수.** 단위가 카운트인 tonic 값을 과제 안에서 표준화하세요.

```python
tonic = np.array([1500.0, 1510.0, 1520.0, 1530.0, 1540.0])
z = (tonic - tonic.mean()) / tonic.____()
print(np.round(z, 2))
```

<details><summary>모범답안 보기</summary>

```python
z = (tonic - tonic.mean()) / tonic.std()
```

```text
[-1.41 -0.71  0.    0.71  1.41]
```

z-점수는 "이 과제 안에서 평소보다 얼마나 높은가"만 남기고 카운트의 크기를 지웁니다. 사람 사이 비교가 불가능한 단위일 때 쓸 수 있는 최소한의 표준화입니다. 대신 "이 사람의 SCL이 높다"는 정보는 함께 사라집니다.

</details>

⚠️ **흔한 오류 1 — `sampling_rate`를 빼먹기.** NeuroKit2의 기본값은 1000 Hz입니다. 500 Hz 데이터에 빼먹으면 100 Hz high-pass가 실제로는 50 Hz high-pass가 되는 식으로 모든 설정이 어긋나지만 오류는 나지 않습니다.

⚠️ **흔한 오류 2 — 문서의 필터를 믿고 바로 특징을 만들기.** 아래 R1에서 보듯 이 데이터의 EMG 열은 README가 말한 band-pass가 적용된 모양이 아닙니다. 특징을 만들기 전에 스펙트럼부터 봅니다.

### 실제 데이터로 해보기 (선택)

준비는 [Day K1](day-K1.md)과 같습니다(`data/xuanwu/Filtered Data/`). 어느 열이 어느 근육인지는 K1의 README 표(`L_TA`)를 씁니다.

**R1 — 001의 왼쪽 전경골근: 스펙트럼, 손 구현 vs NeuroKit2, 움직임 잡음 점검.**

```python
import numpy as np
import pandas as pd
import neurokit2 as nk
from scipy.signal import butter, sosfiltfilt, welch

FIL = "data/xuanwu/Filtered Data/001"
fs = 500
d = pd.read_csv(f"{FIL}/task_1.txt", header=None, usecols=[28, 32, 33, 34, 60])   # 28 = 001의 L-TA
emg, y = d[28].to_numpy(), d[60].to_numpy()

# 1) 스펙트럼: EMG의 power가 어느 대역에 있나
f, p = welch(emg - emg.mean(), fs=fs, nperseg=1000)
tot = p[f > 0].sum()
for lo, hi in [(0, 10), (10, 20), (20, 50), (50, 250)]:
    print(f"{lo:3d}–{hi:<3d} Hz: {100 * p[(f > lo) & (f <= hi)].sum() / tot:5.1f}%")

# 2) 손 구현(Day I5 방식) vs nk.emg_process
def hand_envelope(x, fs, band=(20, 240), env_fc=6):
    bp = sosfiltfilt(butter(4, band, btype="bandpass", fs=fs, output="sos"), x - x.mean())
    return sosfiltfilt(butter(2, env_fc, btype="low", fs=fs, output="sos"), np.abs(bp))
env_hand = hand_envelope(emg, fs)
env_nk = nk.emg_process(emg, sampling_rate=fs)[0]["EMG_Amplitude"].to_numpy()
print("손 vs nk envelope 상관 r = %.3f" % np.corrcoef(env_hand, env_nk)[0, 1])

# 3) 움직임 잡음 의심: EMG envelope이 정강이 충격 덩어리와 얼마나 닮았나
sos_hp = butter(2, 0.5, btype="high", fs=fs, output="sos")
sos_lp = butter(2, 5, btype="low", fs=fs, output="sos")
impact = sosfiltfilt(sos_lp, np.abs(sosfiltfilt(sos_hp, np.linalg.norm(d[[32, 33, 34]].to_numpy(), axis=1))))
for name, e in [("손", env_hand), ("nk", env_nk)]:
    print(f"{name} envelope vs 정강이 충격 r = {np.corrcoef(e, impact)[0, 1]:.3f}")
for name, e in [("손", env_hand), ("nk", env_nk)]:
    print(f"{name}: FOG 구간 평균 / 비FOG 구간 평균 = {e[y == 1].mean() / e[y == 0].mean():.2f}")
```

실행 결과(Mendeley v3, 환자 001 task_1, NeuroKit2 0.3.0):

```text
  0–10  Hz:  82.3%
 10–20  Hz:  11.7%
 20–50  Hz:   4.5%
 50–250 Hz:   1.5%
손 vs nk envelope 상관 r = 0.503
손 envelope vs 정강이 충격 r = 0.158
nk envelope vs 정강이 충격 r = 0.021
손: FOG 구간 평균 / 비FOG 구간 평균 = 0.84
nk: FOG 구간 평균 / 비FOG 구간 평균 = 0.91
```

**결과 읽기:**
- **EMG 열의 power 82%가 10 Hz 아래에 있습니다.** README는 EMG에 10–500 Hz band-pass를 했다고 쓰지만, 그런 필터를 거친 신호라면 10 Hz 아래가 이렇게 클 수 없습니다. 같은 계산을 13개 기록의 task_1, EMG·ECG 네 열(27, 28, 30, 31열)에 해 보면 10 Hz 아래 비율이 59–98%였습니다(코드는 위와 같아 생략). K1 그림의 뾰족한 봉우리와 함께, 이 열에는 근전도 외에 움직임과 관련된 느린 성분이 크게 섞여 있다고 봅니다. 그래서 이 파트에서는 **EMG 특징을 만들기 전에 직접 20–240 Hz band-pass를 겁니다.**
- 손 구현과 NeuroKit2의 상관이 합성 데이터(0.92)보다 크게 낮은 0.50입니다. NeuroKit2의 100 Hz high-pass는 이 기록에서 power의 1.5%만 남은 대역만 보기 때문입니다. 어느 쪽이 "맞는지"가 아니라, **보는 대역이 다르다**는 것을 보고서에 적습니다.
- envelope과 정강이 충격 덩어리의 상관은 약했습니다(0.16, 0.02). 20 Hz 위로 거른 뒤에는 발 디딤 충격을 그대로 따라가는 신호가 아니라는 뜻이지만, 움직임 잡음이 없다는 증명은 아닙니다.

**R2 — 기록별 전경골근 RMS: FOG window vs 비FOG window.** 2초 window, majority 규칙(K2)으로 window 라벨을 정하고, 파일 값 그대로의 RMS와 20–240 Hz band-pass 후의 RMS를 비교합니다.

```python
import glob, os
import numpy as np
import pandas as pd
from scipy.signal import butter, sosfiltfilt

DATA = "data/xuanwu/Filtered Data"
fs, W = 500, 1000
L_TA = {"001": 28, "002": 28, "003": 27, "004": 27, "005": 27, "006": 28, "007": 28,
        "008/OFF_1": 28, "008/OFF_2": 31, "009": 27, "010": 27, "011": 27, "012": 27}
sos_bp = butter(4, (20, 240), btype="bandpass", fs=fs, output="sos")

def window_starts(n, fs=500, win_s=2.0, step_s=1.0):
    w, s = int(win_s * fs), int(step_s * fs)
    return np.arange(0, n - w + 1, s)

rows = []
for path in sorted(glob.glob(f"{DATA}/**/task_*.txt", recursive=True)):
    rec = os.path.dirname(os.path.relpath(path, DATA))
    d = pd.read_csv(path, header=None, usecols=[L_TA[rec], 60])
    x = d[L_TA[rec]].to_numpy(); y = d[60].to_numpy()
    xb = sosfiltfilt(sos_bp, x - x.mean())
    st = window_starts(len(y), fs)
    idx = st[:, None] + np.arange(W)
    rows.append(pd.DataFrame({"rec": rec, "fog": (y[idx].mean(1) >= 0.5).astype(int),
                              "rms_file": np.sqrt(np.mean((x[idx] - x[idx].mean(1, keepdims=True)) ** 2, 1)),
                              "rms_bp": np.sqrt(np.mean(xb[idx] ** 2, 1))}))
win = pd.concat(rows, ignore_index=True)
tab = win.groupby(["rec", "fog"])[["rms_file", "rms_bp"]].median().unstack("fog")
out = pd.DataFrame({"FOG windows": win.groupby("rec")["fog"].sum(),
                    "ratio_file": tab[("rms_file", 1)] / tab[("rms_file", 0)],
                    "ratio_bp": tab[("rms_bp", 1)] / tab[("rms_bp", 0)]})
print("L-TA RMS 중앙값 비 (FOG window / 비FOG window), 2초 window, majority 규칙")
print(out.round(2).to_string())
print("비 < 1인 기록 수: 파일 그대로 %d / 20–240 Hz 후 %d (FOG 있는 기록 %d개)" % (
    (out.ratio_file < 1).sum(), (out.ratio_bp < 1).sum(), out["ratio_bp"].notna().sum()))
```

실행 결과:

```text
L-TA RMS 중앙값 비 (FOG window / 비FOG window), 2초 window, majority 규칙
           FOG windows  ratio_file  ratio_bp
rec                                         
001                282        0.56      0.82
002                  4        0.74      0.37
003               1807        0.98      0.97
004                149        0.69      0.59
005                  0         NaN       NaN
006                378        0.87      1.11
007                363        0.75      0.93
008/OFF_1          444        1.01      1.03
008/OFF_2          475        0.64      0.72
009                155        1.00      0.98
010                801        0.65      0.70
011                524        0.93      0.80
012                258        0.92      1.11
비 < 1인 기록 수: 파일 그대로 11 / 20–240 Hz 후 9 (FOG 있는 기록 12개)
```

**결과 읽기(탐색적 관찰):** FOG window의 전경골근 RMS가 비FOG window보다 낮은 기록이 많습니다(band-pass 후 12개 중 9개). 그러나 크기는 0.37–1.11로 제각각이고, 006과 012는 band-pass 전후로 방향이 바뀝니다(0.87 → 1.11, 0.92 → 1.11). 표시가 1.00인 009는 반올림 전 값이 1보다 조금 작아 "< 1"로 세어졌습니다. 002는 FOG window가 4개뿐이라 비가 거의 의미가 없습니다. **필터 선택이 결론의 방향을 바꿀 수 있다**는 것, 그리고 FOG window에는 제자리 떨림뿐 아니라 움직임이 거의 없는 구간(K1 그림)도 섞여 있다는 것을 함께 적습니다. 진폭 정규화(Day I5의 %MVC 등)를 할 기준 수축 기록이 이 데이터에는 없으므로 사람 사이 크기 비교는 하지 않고, 기록 안의 비율만 봅니다.

**R3 — 피부전도도: 과제 안 tonic의 변화와 SCR 빈도.** 팔 센서가 있는 기록만, 10 Hz로 내려 `nk.eda_process`로 처리합니다.

```python
import glob, os
import numpy as np
import pandas as pd
import neurokit2 as nk
from scipy.signal import resample_poly

DATA = "data/xuanwu/Filtered Data"
SC_COL, LABEL = 59, 60                      # Arm의 7번째 열 = SC (ADC 카운트)
fs_sc = 10                                  # SC는 느린 신호라 10 Hz면 충분

rows = []
for path in sorted(glob.glob(f"{DATA}/**/task_*.txt", recursive=True)):
    rec = os.path.dirname(os.path.relpath(path, DATA))
    d = pd.read_csv(path, header=None, usecols=[SC_COL, LABEL])
    sc = d[SC_COL].to_numpy()
    if np.all(sc == sc[0]):                 # 팔 센서가 없으면 SC가 상수(0)
        continue
    sc10 = resample_poly(sc, up=1, down=50, padtype="line")   # 500 → 10 Hz
    y10 = d[LABEL].to_numpy()[::50][: sc10.size]
    sig, info = nk.eda_process(sc10, sampling_rate=fs_sc)
    tonic = sig["EDA_Tonic"].to_numpy()
    z = (tonic - tonic.mean()) / tonic.std()                  # 과제 안에서 z-점수(단위가 카운트라서)
    pos = np.linspace(0, 1, sc10.size)                        # 과제 안의 상대 위치(0 시작, 1 끝)
    peaks = sig["SCR_Peaks"].to_numpy() == 1
    rows.append(pd.DataFrame({"rec": rec, "fog": y10, "z_tonic": z, "pos": pos, "peak": peaks,
                              "sc_raw": sc10}))
s = pd.concat(rows, ignore_index=True)
g = s.groupby(["rec", "fog"])
tab = pd.DataFrame({
    "FOG분": s[s.fog == 1].groupby("rec").size() / fs_sc / 60,
    "z_tonic FOG−비FOG": g["z_tonic"].mean().unstack()[1] - g["z_tonic"].mean().unstack()[0],
    "상대위치 FOG": g["pos"].mean().unstack()[1],
    "SCR/분 FOG": g["peak"].sum().unstack()[1] / (g.size().unstack()[1] / fs_sc / 60),
    "SCR/분 비FOG": g["peak"].sum().unstack()[0] / (g.size().unstack()[0] / fs_sc / 60)})
print(tab.round(2).to_string())
print("\n상관(모든 기록 합쳐서): z_tonic ~ 과제 안 상대위치 r = %.2f" % np.corrcoef(s.z_tonic, s.pos)[0, 1])
print("SC 기록 수:", s.rec.nunique(), "| 기록별 SC 범위(카운트):",
      {r: (int(x.sc_raw.min()), int(x.sc_raw.max())) for r, x in s.groupby("rec")})
```

실행 결과:

```text
            FOG분  z_tonic FOG−비FOG  상대위치 FOG  SCR/분 FOG  SCR/분 비FOG
rec                                                                
001         4.33              0.10      0.47       5.31        6.32
003        29.27              0.78      0.50       6.32        8.81
004         2.23             -0.07      0.47       8.51        6.58
005          NaN               NaN       NaN        NaN        9.20
006         5.93             -0.18      0.51      16.01       13.69
007         5.55             -0.30      0.56       6.67        3.23
008/OFF_1   7.02             -0.11      0.45       6.41       11.59
008/OFF_2   7.52              0.29      0.47      10.11       14.33
009         1.95             -0.24      0.53       2.05        3.91
010        12.77              0.15      0.55       7.75        5.35
011         7.88             -0.20      0.47      10.91       13.42
012         4.10              0.35      0.52       1.46       10.75

상관(모든 기록 합쳐서): z_tonic ~ 과제 안 상대위치 r = -0.20
SC 기록 수: 12 | 기록별 SC 범위(카운트): {'001': (1322, 1884), '003': (602, 1097), '004': (924, 1149), '005': (787, 999), '006': (1864, 1965), '007': (1156, 1804), '008/OFF_1': (1204, 1448), '008/OFF_2': (1297, 1522), '009': (1074, 1689), '010': (1310, 1783), '011': (1734, 1861), '012': (1750, 1966)}
```

**결과 읽기(탐색적 관찰):**
- **일관된 방향이 없습니다.** FOG 동안의 tonic z-점수는 기록에 따라 −0.30에서 +0.78까지, SCR 빈도도 FOG 쪽이 높은 기록(004, 006, 007, 010)과 낮은 기록이 섞여 있습니다. 이 결과는 "SC가 FOG와 관련 없다"는 증거도, Mazilu 2015를 재현한 것도 아닙니다. 단위와 부호를 모르는 신호를, 문헌과 다른 장비·과제에서, 기록 12개로 본 탐색입니다.
- **시간의 흐름이라는 교란.** tonic은 과제 안의 위치와 약하게 상관합니다(r = −0.20). FOG가 과제 후반에 몰렸다면 FOG–SCL 차이는 그냥 시간 추세일 수 있습니다. 여기서는 FOG 구간의 평균 위치가 0.45–0.56으로 과제 한가운데 근처라 이 교란은 크지 않아 보이지만, 이런 점검을 표에 함께 넣는 습관을 들입니다.
- **SCR 빈도가 분당 수 회에서 16회까지로 높습니다.** NeuroKit2의 봉우리 기준이 "최댓값의 10%"라는 **상대** 기준이라, 신호 전체가 잔잔하면 작은 흔들림까지 SCR로 셉니다. 단위가 µS라면 절대 기준(예: 최소 진폭)을 함께 쓰겠지만, 카운트에서는 그 기준을 정할 수 없습니다.
- **SC 범위가 기록마다 600–1970 카운트로 다릅니다.** 사람·날마다 전극 접촉과 회로 상태가 다를 수 있어 SCL 크기를 사람 사이에 비교하지 않습니다. 그리고 [Day K2](day-K2.md)에서 본 것처럼 이 SC는 원래 100 Hz를 보간한 값입니다. 저역 신호라 영향은 작지만 기록해 둡니다.

**`reports/advanced/K/K3_emg_eda.md`에 남길 것:** 처리 설정 표(손 구현 vs NeuroKit2 기본값, 실제로 쓴 설정), EMG 스펙트럼 점검 결과와 "직접 band-pass를 건다"는 결정, R2·R3 표, 그리고 해석 한계 다섯 줄(필터에 따라 방향이 바뀜, FOG window의 이질성, SC 단위·부호 미상, 상대 SCR 기준, 표본 수).

## 퀴즈

**1.** `nk.emg_process`의 기본 처리에서 손 구현(20–240 Hz band-pass → 정류 → 6 Hz envelope)과 가장 크게 다른 두 가지는?

<details><summary>정답 보기</summary>

(1) 잡음 제거가 **100 Hz high-pass**라서 훨씬 높은 대역만 봅니다. (2) 정류 전에 **TKEO**를 써서 진폭의 제곱 쪽에 가까운 크기를 만듭니다. 그래서 큰 burst를 더 크게 반영하고, 비교의 방향이 손 구현과 뒤집힐 수 있습니다. (envelope 차단 주파수 8 Hz vs 6 Hz도 다르지만 영향은 작습니다.)

</details>

**2.** 같은 window에서 RMS는 걷기가 크고 MAV는 FOG가 컸습니다. 왜 이런 일이 생깁니까?

<details><summary>정답 보기</summary>

RMS는 값을 **제곱**해서 평균하므로 짧고 강한 burst에 큰 무게를 줍니다. 걷기는 "가끔 세게", FOG는 "계속 중간 세기"였기 때문에, 제곱 평균은 걷기가, 절댓값 평균은 FOG가 큽니다. 어떤 지표를 썼는지 밝히지 않고 "근활성이 줄었다"고 말하면 안 됩니다.

</details>

**3.** SC를 500 Hz에서 10 Hz로 내려도 괜찮은 이유와, 내릴 때 꼭 지킬 것 하나는?

<details><summary>정답 보기</summary>

SC는 tonic이 수십 초, SCR이 수 초 단위로 변하는 **저역 신호**라 5 Hz(10 Hz의 Nyquist) 위에 정보가 거의 없습니다. 내리기 **전에 저역 통과 필터**를 거쳐야 하고(`resample_poly`, `decimate`), 값이 0에서 먼 신호는 끝부분 처리(`padtype="line"`)도 확인합니다.

</details>

**4.** 이 데이터의 SC가 ADC 카운트라서 **할 수 없는** 분석을 두 가지 쓰세요.

<details><summary>정답 보기</summary>

예: (1) 사람 사이의 SCL 크기 비교, (2) 문헌의 µS 값이나 "0.05 µS 이상" 같은 절대 SCR 기준 적용, (3) 카운트와 전도도의 방향이 확인되지 않았으므로 "SC가 올랐다 = 각성이 올랐다"는 해석. 할 수 있는 것은 한 과제 안에서의 상대 변화(z-점수)뿐입니다.

</details>

**5.** README는 EMG에 10–500 Hz band-pass를 했다고 하는데, 실제 파일의 EMG power는 59–98%가 10 Hz 아래였습니다. 이 사실을 보고 어떻게 해야 합니까?

<details><summary>정답 보기</summary>

문서의 필터가 이 값들에 적용되었다고 가정하지 않고, **직접 band-pass(이 레슨은 20–240 Hz)를 건 뒤** 특징을 만듭니다. 그리고 보고서에 "README와 실제 스펙트럼이 다름, 확인한 방법(Welch 대역 비율), 우리가 쓴 필터"를 적습니다. 낮은 대역이 무엇인지(움직임 잡음 등)는 단정하지 않습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/advanced/K/K3_emg_eda.ipynb`: 예시 1–3과 직접 해보기 1–5 실행.
- [ ] (선택) 실제 데이터 R1–R3 실행, 출력이 위와 같은지 확인.
- [ ] `reports/advanced/K/K3_emg_eda.md`: 처리 설정 표, EMG 스펙트럼 점검과 필터 결정, R2·R3 표, 해석 한계 다섯 줄.
- [ ] NeuroKit2 버전(`nk.__version__`)을 보고서 맨 위에 적기. 기본값은 버전마다 바뀔 수 있습니다.

## 더 읽을거리
- Makowski D, Pham T, Lau ZJ, et al. NeuroKit2: A Python toolbox for neurophysiological signal processing. *Behav Res Methods*. 2021;53:1689–1696. doi:[10.3758/s13428-020-01516-y](https://doi.org/10.3758/s13428-020-01516-y)
- Maidan I, Plotnik M, Mirelman A, Weiss A, Giladi N, Hausdorff JM. Heart rate changes during freezing of gait in patients with Parkinson's disease. *Mov Disord*. 2010;25(14):2346–2354. doi:[10.1002/mds.23280](https://doi.org/10.1002/mds.23280) (PMID 20721914)
- Mazilu S, Calatroni A, Gazit E, Mirelman A, Hausdorff JM, Tröster G. Prediction of Freezing of Gait in Parkinson's From Physiological Wearables: An Exploratory Study. *IEEE J Biomed Health Inform*. 2015;19(6):1843–1854. doi:[10.1109/JBHI.2015.2465134](https://doi.org/10.1109/JBHI.2015.2465134) (PMID 26259206)
- Zhang W, Yang Z, Li H, et al. Multimodal Data for the Detection of Freezing of Gait in Parkinson's Disease. *Sci Data*. 2022;9:606. doi:[10.1038/s41597-022-01713-8](https://doi.org/10.1038/s41597-022-01713-8) — Methods의 센서 구성(SC 위치), 전처리
- NeuroKit2 문서: <https://neuropsychology.github.io/NeuroKit/> — `emg_process`, `eda_process`, `eda_phasic`의 설명. 설치된 버전의 소스를 직접 여는 법: `import inspect, neurokit2 as nk; print(inspect.getsource(nk.emg_clean))`
- 이론 노트: [T11 — 보행동결(FOG)](../I-gait-theory/note-T11.md)

---
[← 이전](day-K2.md) · [코스 지도](../../../README.md) · [다음 →](day-K4.md)
