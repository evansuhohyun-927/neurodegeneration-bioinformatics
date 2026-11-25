# Day K4 — EEG를 MNE로: 배열을 Raw로, 전극 위치, theta·beta 파워, 그리고 걷는 중 EEG의 함정

> **주차:** 심화 파트 K — 멀티모달 FOG 데이터 분석 · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/K/K4_eeg_mne.ipynb`, `reports/advanced/K/K4_eeg_bands.md` (환자별 theta·beta 표와 해석 세 줄)
>
> **먼저 끝내 둘 레슨:** [Day K2](day-K2.md)(window와 라벨 규칙), [Day K3](day-K3.md)(EMG 처리), [심화 C — Day C3](../C-neural-signals/day-C3.md)(Welch, 절대·상대 대역 파워), [심화 I — Day I10](../I-gait/day-I10.md)(표본화·필터). 선택: [Day 23](../../week-4/day-23.md)(Welch 첫 만남)
>
> **이론 노트:** [T11 — 보행동결(FOG)](../I-gait-theory/note-T11.md)

## 오늘의 목표
- numpy 배열로 가진 EEG를 `mne.create_info` + `RawArray`로 MNE 객체로 만들고, 표준 전극 배치(montage)를 붙이고, 원하는 채널이 실제로 있는지 확인할 수 있다.
- MNE의 Welch PSD로 theta(4–8 Hz)·beta(13–30 Hz)의 절대 파워와 상대 파워를 window마다 계산할 수 있다.
- 걷는 중 기록한 EEG에서 움직임·근전도 오염이 beta 이상 대역을 어떻게 흔드는지 설명하고, "FOG 때 beta가 변했다"는 결과를 보고하기 전에 무엇을 점검할지 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [MEGIN Masterclass : Analysing MEG data with MNE-Python and its ecosystem -- Alex Gramfort](https://www.youtube.com/watch?v=z0JlHS9kulA) (길이는 링크에서 확인)
- **무엇에 주목할까:** MNE를 만든 사람 중 한 명이 라이브러리의 큰 그림을 설명하는 강연입니다. MEG 예가 많지만 구조는 EEG와 같습니다. `Raw → Epochs → Spectrum`처럼 자료가 단계마다 다른 객체로 바뀌고, 각 객체가 채널 정보(`info`)를 들고 다닌다는 점만 잡으면 오늘 코드가 쉽게 읽힙니다. 처음 20분 정도만 봐도 충분합니다.

## 개념 설명

### numpy 배열 → MNE Raw: 시료 병에 라벨 붙이기

K1–K3에서 과제 파일을 pandas로 읽어 numpy 배열로 다뤘습니다. 배열은 숫자만 가진 맨 병입니다. 그 숫자가 어느 전극인지, 1초에 몇 번 쟀는지, 어떤 종류의 신호인지는 배열 안에 없습니다. MNE는 이 정보를 **`info`** 라는 라벨에 적어 숫자와 함께 들고 다닙니다. 실험실에서 튜브에 시료 이름·날짜·농도를 적은 라벨을 붙여야 나중에 섞이지 않는 것과 같습니다.

만드는 순서는 두 줄입니다. `mne.create_info(ch_names, sfreq, ch_types)`로 라벨을 만들고, `mne.io.RawArray(data, info)`로 배열과 라벨을 묶습니다. 이때 `data`는 **(채널 수, 표본 수)** 모양이어야 합니다. pandas에서 꺼낸 배열은 보통 (표본, 채널)이므로 `.T`로 뒤집습니다.

가장 흔한 함정은 **단위**입니다. MNE는 EEG 값이 **볼트(V)** 라고 가정합니다. µV 단위 숫자를 그대로 넣어도 오류는 나지 않지만, 그림의 눈금과 PSD 값이 10⁶배(파워는 10¹²배) 어긋납니다. 그래서 µV라면 `× 1e-6`을 해서 넣고, 결과를 볼 때 다시 µV로 바꿉니다. 이 데이터셋의 README는 EEG 단위를 적지 않았습니다. 값의 크기(표준편차 약 8–40)가 µV 규모라서 이 레슨은 **µV라고 가정**하고, 그 가정을 보고서에 적습니다.

### montage와 채널 이름: 주소록의 철자가 맞아야 찾아간다

채널 이름만으로는 전극이 머리 어디에 있는지 모릅니다. **montage**(전극 배치)는 "Cz는 정수리, FC1은 그 앞 왼쪽" 같은 3차원 좌표 목록입니다. 표준 10-20 체계 좌표를 MNE가 갖고 있으니 붙이기만 하면 됩니다. MNE 1.13부터 이 표준 배치의 이름이 `"colin27_1020"`으로 바뀌었고, 예전 이름 `"standard_1020"`은 경고를 내며 곧 없어집니다(이 레슨 작성 환경 mne 1.13.2에서 확인). 이전 버전을 쓰는 사람은 예전 이름을 씁니다.

주소록 검색처럼 철자가 맞아야 찾습니다. 이 데이터의 열 이름은 `FP1`, `FP2`처럼 대문자인데 표준 배치는 `Fp1`, `Fp2`입니다. 기본 설정에서는 이 두 채널을 못 찾았다고 오류가 납니다. `match_case=False`로 대소문자를 무시하게 하면 됩니다.

명세나 논문에 "Cz, FCz, TP9를 썼다"고 적혀 있어도 **내 파일에 그 열이 있는지 먼저 확인**합니다. K1에서 센 것처럼 이 데이터의 과제 파일에는 EEG 열이 25개뿐이고, README 표에 있던 TP9·TP10(기준 전극으로 썼다고 적힘)과 IO(안구 전위)는 EEG 열에 없습니다. FCz는 처음부터 없습니다.

### 필터와 theta·beta 파워: 이미 한 일을 먼저 확인한다

Welch PSD와 대역 파워는 [Day C3](../C-neural-signals/day-C3.md)에서, 필터의 원리는 [Day I10](../I-gait/day-I10.md)과 [Day C2](../C-neural-signals/day-C2.md)에서 배웠습니다. 오늘은 MNE에서 같은 일을 하는 방법만 봅니다. `raw.filter(l_freq, h_freq)`는 band-pass를, `raw.compute_psd(method="welch", n_fft=...)`는 Welch PSD를 만들고, `.get_data(return_freqs=True)`로 숫자 배열을 꺼냅니다. 파워는 PSD를 대역 안에서 더하고 주파수 간격을 곱해 구합니다. **상대 파워**는 이것을 1–45 Hz 전체 파워로 나눈 비율입니다.

필터를 걸기 전에 이 파일에 무슨 처리가 이미 되어 있는지 봅니다. README에 따르면 저자들이 EEGLab에서 ICA로 안구 잡음을 빼고, 0.5–100 Hz band-pass와 50 Hz notch를 걸었습니다. 같은 필터를 다시 걸 필요는 없습니다. PSD를 그려 보면 이것이 실제로 되어 있는지 바로 확인할 수 있습니다(실제 데이터 1). 그리고 상대 파워는 **분모**가 같이 움직인다는 점을 기억하세요. 다른 대역 파워가 줄면 theta가 그대로여도 상대 theta는 커집니다.

### 걷는 중 EEG: 측정 장비가 흔들리면 눈금도 흔들린다

앉아서 잰 EEG와 걸으며 잰 EEG는 다릅니다. 걸을 때는 두 종류의 비뇌 신호가 섞입니다. 첫째, **움직임 잡음**: 발이 닿을 때마다 머리와 전극 선이 흔들려 걸음 주파수(약 1 Hz)와 그 배음에 파워가 생깁니다. 트레드밀 보행 연구에서는 걸음 주파수의 배음이 최대 15번째까지 EEG에 섞일 수 있고, 머리에 단 가속도계 신호와 EEG가 150 Hz까지 닮은 시간-주파수 성질을 보였다고 보고했습니다(Castermans 2014). 둘째, **근전도**: 목·턱·이마 근육의 활동은 약 20–300 Hz에 넓게 퍼져 있어 beta와 gamma를 통째로 덮습니다(Muthukumaraswamy 2013 리뷰). 템플릿 회귀와 ICA로 걸음 잡음을 줄이는 방법도 제안되어 있지만(Gwin 2010), 완전히 없애지는 못합니다.

FOG 분석에서 이것이 특히 위험한 이유가 있습니다. FOG가 오면 걸음이 멈추거나 다리가 떨리므로 **움직임 자체가 바뀝니다**. 그러면 뇌가 아무 일을 하지 않아도 잡음의 양이 바뀌고, 그 차이가 "FOG 때 beta가 줄었다/늘었다"처럼 보입니다. 저울이 흔들리는 배 위에서 몸무게를 재면, 파도가 잔잔해진 순간 "살이 빠졌다"고 착각하는 것과 같습니다(예시 3).

문헌은 이렇게 말합니다. Shine 2014는 PD 환자 24명이 timed up-and-go를 하는 동안 두피 전극 4개로 EEG를 쟀고, 걷기에 비해 FOG 동안 중심·전두 전극의 theta 파워가 커졌다고 보고했습니다. Handojoseno 2015(16명)는 PSD와 wavelet 특징으로 FOG로 넘어가는 구간을 예측하려 했습니다. 둘 다 작은 표본이고 실험 과제·전처리·전극이 이 데이터와 다릅니다. 그래서 오늘 실제 데이터에서 보는 숫자는 이 결과를 "재현했다/못 했다"가 아니라 **가설을 세우는 관찰**로만 다룹니다.

점검 방법 두 가지를 씁니다. (1) 근전도의 흔적인 **60–100 Hz 파워**(50 Hz notch 위쪽)를 같이 계산해 beta와 같이 움직이는지 봅니다. (2) 같은 window의 가속도(움직임 양)와 비교합니다(K5에서 모델로 이어짐). 두 점검을 통과하지 못한 beta 변화는 "뇌의 beta"라고 쓰지 않습니다.

## 예시로 이해하기

모든 예시는 K1부터 쓴 합성 데이터 뼈대에 EEG 3채널을 덧붙입니다. 합성 EEG의 모양(10 Hz 리듬, FOG 때 커지는 6 Hz theta, 걷는 동안만 큰 근육 잡음)은 **설명용 가정**이고 실제 생리를 주장하지 않습니다.

### 예시 1 — 합성 EEG를 MNE Raw로 만들기

```python
import numpy as np
import mne

# ---- 공통 합성 뼈대 (K1–K5 같음) ----
fs = 500                                   # 500행 = 1초
t = np.arange(0, 60, 1/fs)                 # 60초
label = ((t >= 25) & (t < 35)).astype(int) # 25–35초가 FOG(가정)
rng = np.random.default_rng(0)
acc = np.where(label == 0, np.sin(2*np.pi*1.0*t), 0.4*np.sin(2*np.pi*5.0*t)) + 0.1*rng.standard_normal(t.size)

# ---- 오늘 덧붙이는 합성 EEG 3채널 (단위: µV, 모양은 모두 설명용 가정) ----
names = ["Cz", "FC1", "FC2"]
brain = np.cumsum(rng.standard_normal((3, t.size)), axis=1) * 0.05    # 느리게 출렁이는 배경
brain -= brain.mean(axis=1, keepdims=True)
alpha = 4 * np.sin(2*np.pi*10*t)                                     # 10 Hz 리듬
theta = np.where(label == 1, 6.0, 2.0) * np.sin(2*np.pi*6*t)         # 가정: FOG 중 theta가 커짐
muscle = np.where(label == 0, 5.0, 1.0) * rng.standard_normal((3, t.size))  # 가정: 걷는 동안 근육·움직임 잡음
eeg_uv = brain + alpha + theta + muscle                              # (채널 3, 표본 30000)

info = mne.create_info(ch_names=names, sfreq=fs, ch_types="eeg")
raw = mne.io.RawArray(eeg_uv * 1e-6, info, verbose=False)          # MNE는 볼트(V) 단위를 기대한다
print(raw)
print("채널:", raw.ch_names, "| fs:", raw.info["sfreq"], "Hz | 길이:", raw.n_times / fs, "초")
print("Cz 첫 3표본 (V):", raw.get_data(picks="Cz")[0, :3])
print("Cz 표준편차: %.1f µV" % (raw.get_data(picks="Cz").std() * 1e6))
```

실행 결과(mne 1.13.2):

```text
<RawArray | 3 x 30000 (60.0 s), ~710 KiB, data loaded>
채널: ['Cz', 'FC1', 'FC2'] | fs: 500.0 Hz | 길이: 60.0 초
Cz 첫 3표본 (V): [1.10790068e-05 5.09231706e-06 6.31423013e-07]
Cz 표준편차: 6.6 µV
```

`3 x 30000`이 (채널, 표본)입니다. 값이 1e-05 근처(= 10 µV 근처)로 보이면 단위 변환이 맞은 것입니다. `× 1e-6`을 빼먹으면 첫 값이 11.08처럼 나오는데, MNE는 이것을 11 **볼트**로 읽습니다.

### 예시 2 — 실제 파일의 채널 이름으로 montage 붙이기와 채널 확인

```python
import numpy as np
import mne

# 실제 과제 파일의 EEG 25열 이름(저자 코드 config.py 순서, K1 참고)
EEG = ["FP1","FP2","F3","F4","C3","C4","P3","P4","O1","O2","F7","F8","P7","P8",
       "Fz","Cz","Pz","FC1","FC2","CP1","CP2","FC5","FC6","CP5","CP6"]
info = mne.create_info(EEG, sfreq=500, ch_types="eeg")
raw = mne.io.RawArray(np.zeros((len(EEG), 1000)), info, verbose=False)   # 모양만 보는 빈 신호

montage = mne.channels.make_standard_montage("colin27_1020")   # MNE 1.12 이하에서는 "standard_1020"
try:
    raw.set_montage(montage)                                    # 기본값: 대소문자까지 똑같아야 한다
except ValueError as e:
    print("오류: montage에서 못 찾은 채널 →", str(e).split("\n\n")[1])
raw.set_montage(montage, match_case=False)                      # FP1 = Fp1 로 맞춘다
pos = raw.get_montage().get_positions()["ch_pos"]
print("위치가 붙은 채널 수:", len(pos), "| Cz 좌표(m):", np.round(pos["Cz"], 3))

want = ["Cz", "FC1", "FC2", "TP9", "TP10", "FCz"]
have = [ch for ch in want if ch in raw.ch_names]
print("원하는 채널:", want)
print("파일에 있는 채널:", have, "| 없는 채널:", sorted(set(want) - set(have)))
sub = raw.copy().pick(have)
print(sub.ch_names)
```

실행 결과:

```text
오류: montage에서 못 찾은 채널 → ['FP1', 'FP2'].
위치가 붙은 채널 수: 25 | Cz 좌표(m): [-0.001  0.028  0.14 ]
원하는 채널: ['Cz', 'FC1', 'FC2', 'TP9', 'TP10', 'FCz']
파일에 있는 채널: ['Cz', 'FC1', 'FC2'] | 없는 채널: ['FCz', 'TP10', 'TP9']
['Cz', 'FC1', 'FC2']
```

`raw.pick(["Cz", "TP9"])`처럼 없는 채널을 바로 고르면 `ValueError`(TP9를 고를 수 없음)가 납니다. 그래서 목록 비교로 "없는 채널"을 먼저 출력해 두는 습관을 들입니다. 보고서에는 "명세의 FCz 대신 FC1·FC2·Cz를 썼다"처럼 바꾼 이유를 적습니다.

### 예시 3 — theta·beta 절대·상대 파워, 그리고 근육 잡음이 만드는 가짜 변화

예시 1의 코드에 이어서 실행합니다(같은 노트북에서 `raw`, `fs`를 그대로 씀).

```python
import numpy as np

def band_powers(psd, freqs):
    """PSD(…, 주파수)에서 절대 파워(µV²)와 상대 파워(1–45 Hz 합 대비)."""
    df = freqs[1] - freqs[0]
    bp = lambda lo, hi: psd[..., (freqs >= lo) & (freqs < hi)].sum(-1) * df * 1e12   # V² → µV²
    total = bp(1, 45)
    return {"theta": bp(4, 8), "beta": bp(13, 30), "rel_theta": bp(4, 8) / total,
            "rel_beta": bp(13, 30) / total, "hi_60_100": bp(60, 100)}

for name, (t0, t1) in {"걷기 5–15 s": (5, 15), "FOG 25–35 s": (25, 35)}.items():
    spec = raw.compute_psd(method="welch", fmin=1, fmax=100, tmin=t0, tmax=t1 - 1/fs,
                           n_fft=1000, picks=["Cz", "FC1", "FC2"], verbose=False)
    psd, freqs = spec.get_data(return_freqs=True)      # psd: (채널 3, 주파수), 단위 V²/Hz
    b = {k: v.mean() for k, v in band_powers(psd, freqs).items()}   # 세 채널 평균
    print(f"{name}: theta {b['theta']:6.1f} µV²  beta {b['beta']:6.1f} µV²  "
          f"상대 theta {b['rel_theta']:.3f}  상대 beta {b['rel_beta']:.3f}  60–100 Hz {b['hi_60_100']:6.1f} µV²")
print("주파수 간격:", freqs[1] - freqs[0], "Hz")

# 1–45 Hz로 거른 뒤에도 beta 안의 '근육 몫'은 남는다
filt = raw.copy().filter(l_freq=1.0, h_freq=45.0, verbose=False)
for name, (t0, t1) in {"걷기": (5, 15), "FOG": (25, 35)}.items():
    spec = filt.compute_psd(method="welch", fmin=1, fmax=100, tmin=t0, tmax=t1 - 1/fs, n_fft=1000, verbose=False)
    psd, freqs = spec.get_data(return_freqs=True)
    b = {k: v.mean() for k, v in band_powers(psd, freqs).items()}
    print(f"필터 뒤 {name}: 상대 beta {b['rel_beta']:.3f}  60–100 Hz {b['hi_60_100']:.2f} µV²")
```

실행 결과:

```text
걷기 5–15 s: theta    2.4 µV²  beta    1.5 µV²  상대 theta 0.170  상대 beta 0.111  60–100 Hz    4.0 µV²
FOG 25–35 s: theta   18.0 µV²  beta    0.1 µV²  상대 theta 0.684  상대 beta 0.003  60–100 Hz    0.2 µV²
주파수 간격: 0.5 Hz
필터 뒤 걷기: 상대 beta 0.111  60–100 Hz 0.00 µV²
필터 뒤 FOG: 상대 beta 0.003  60–100 Hz 0.00 µV²
```

읽는 법:
- **theta:** 합성 신호에 FOG 동안 진폭 3배(파워 9배)를 넣었으니 절대 theta가 2.4 → 18.0 µV²로 커진 것은 의도한 대로입니다. 그런데 상대 theta는 0.17 → 0.68로 네 배 커졌습니다. 근육 잡음이 줄어 **분모**가 작아진 몫이 더해졌기 때문입니다.
- **beta:** 이 합성 데이터의 "뇌" 신호에는 beta 리듬이 전혀 없습니다. 그런데도 beta가 걷기 1.5 µV² → FOG 0.1 µV²로 크게 "줄었습니다". 전부 근육 잡음(가정: 걷는 동안만 큼)이 사라진 몫입니다. 60–100 Hz 파워도 4.0 → 0.2로 같은 방향으로 움직였다는 것이 단서입니다.
- **필터 뒤:** 1–45 Hz로 걸러도 상대 beta의 차이(0.111 대 0.003)는 그대로입니다. 근전도는 beta 대역 안에도 있으므로 low-pass로는 지워지지 않습니다. 오히려 60–100 Hz가 0이 되어 **점검 도구를 잃었습니다**. 근육 점검용 고주파 파워는 low-pass 전에 계산합니다.

## 직접 해보기

각 문제는 예시 코드에 이어서 실행합니다. `____`를 채우고, 바로 아래 모범답안과 출력을 비교하세요.

**문제 1 — 단위 맞춰 Raw 만들기.** 예시 1에서 아래 줄의 빈칸을 채워 Cz 표준편차가 6.6 µV로 나오게 하세요.

```python
info = mne.create_info(ch_names=names, sfreq=fs, ch_types="eeg")
raw = mne.io.RawArray(____, info, verbose=False)
print("Cz 표준편차: %.1f µV" % (raw.get_data(picks="Cz").std() * 1e6))
```

<details><summary>모범답안 보기</summary>

```python
raw = mne.io.RawArray(eeg_uv * 1e-6, info, verbose=False)
```

출력: `Cz 표준편차: 6.6 µV`. `eeg_uv`를 그대로 넣으면 `Cz 표준편차: 6554650.1 µV`처럼 10⁶배 큰 값이 나옵니다(오류는 나지 않음). 모양이 (채널, 표본)인지도 함께 확인합니다(`eeg_uv.shape` → `(3, 30000)`).

</details>

**문제 2 — 원하는 채널 중 있는 것만 고르기.** 예시 2에서 빈칸을 채우세요.

```python
want = ["Cz", "FC1", "FC2", "TP9", "TP10", "FCz"]
have = [ch for ch in want if ____]
print("파일에 있는 채널:", have)
```

<details><summary>모범답안 보기</summary>

```python
have = [ch for ch in want if ch in raw.ch_names]
```

출력: `파일에 있는 채널: ['Cz', 'FC1', 'FC2']`. 대소문자가 다를 수 있는 이름(FP1/Fp1)을 찾을 때는 `ch.upper() in [c.upper() for c in raw.ch_names]`처럼 양쪽을 대문자로 바꿔 비교합니다.

</details>

**문제 3 — 상대 beta.** 예시 1 다음에 실행합니다. 걷기 구간(5–15초)의 채널별 상대 beta를 구하세요.

```python
spec = raw.compute_psd(method="welch", fmin=1, fmax=100, tmin=5, tmax=15 - 1/fs, n_fft=1000, verbose=False)
psd, freqs = spec.get_data(return_freqs=True)
beta = psd[:, (freqs >= 13) & (freqs < 30)].sum(axis=1)
total = psd[:, (freqs >= 1) & (freqs < 45)].sum(axis=1)
rel_beta = ____
print("상대 beta (Cz, FC1, FC2):", np.round(rel_beta, 3))
```

<details><summary>모범답안 보기</summary>

```python
rel_beta = beta / total
```

출력: `상대 beta (Cz, FC1, FC2): [0.109 0.108 0.116]`. 비율이라 주파수 간격(`df`)과 V→µV 변환은 분자·분모에서 지워집니다. 절대 파워를 보고할 때만 둘 다 곱합니다.

</details>

**문제 4 — window마다 근육 점검.** 2초 window(1초 이동)로 잘라 상대 beta와 60–100 Hz 파워의 순위 상관(Spearman)을 구하세요. `pandas`가 필요합니다.

```python
import pandas as pd
ep = mne.make_fixed_length_epochs(raw, duration=2.0, overlap=1.0, preload=True, verbose=False)
p, f = ep.compute_psd(method="welch", fmin=1, fmax=100, n_fft=500, n_overlap=250, verbose=False).get_data(return_freqs=True)
bp = lambda lo, hi: p[..., (f >= lo) & (f < hi)].sum(-1).mean(-1)     # (window,) 세 채널 평균
tab = pd.DataFrame({"rel_beta": bp(13, 30) / bp(1, 45), "hi_60_100": bp(60, 100)})
rho = tab["rel_beta"].corr(tab["hi_60_100"], method=____)
print("window %d개, Spearman rho = %.2f" % (len(tab), rho))
```

<details><summary>모범답안 보기</summary>

```python
rho = tab["rel_beta"].corr(tab["hi_60_100"], method="spearman")
```

출력: `window 59개, Spearman rho = 0.47`. `make_fixed_length_epochs(duration=2.0, overlap=1.0)`의 시작점(`ep.events[:, 0]`)은 K2의 `window_starts(n)`와 같은 0, 500, 1000, …입니다. 이 상관이 크면 beta의 상당 부분이 근육·움직임과 함께 움직인다는 신호입니다. 0에 가깝다고 해서 깨끗하다는 증명은 아닙니다.

</details>

**문제 5 (실제 데이터) — 기준 전극을 바꾸면?** 아래 "실제 데이터 1"을 실행한 뒤, 평균 기준(average reference)으로 바꿔 C3–C4 상관을 비교하세요.

```python
r = lambda R: np.corrcoef(R.get_data(picks="C3")[0], R.get_data(picks="C4")[0])[0, 1]
avg = raw.copy().set_eeg_reference(____, verbose=False)
print("C3–C4 상관: 원래 %.2f → 평균 기준 %.2f" % (r(raw), r(avg)))
```

<details><summary>모범답안 보기</summary>

```python
avg = raw.copy().set_eeg_reference("average", verbose=False)
```

출력(환자 003 task_1): `C3–C4 상관: 원래 0.93 → 평균 기준 0.15`. 좌우 반구의 전극이 0.93으로 거의 같이 움직였다는 것은 모든 채널에 공통으로 들어간 큰 성분이 있다는 뜻입니다(기준 전극의 신호, 머리 전체의 움직임 등 가능성은 여럿). 평균을 빼자 상관이 0.15로 떨어졌습니다. 채널 하나의 대역 파워는 기준을 무엇으로 잡았는지에 따라 달라지므로, 보고서에 기준을 적습니다.

</details>

⚠️ **흔한 오류 1 — µV를 V로 바꾸지 않기.** 오류 없이 돌아가지만 파워가 10¹²배 어긋납니다. `raw.get_data()`의 첫 값이 1e-05 근처인지 확인합니다.

⚠️ **흔한 오류 2 — `fmax`를 45로 자르고 근육 점검하기.** PSD를 1–45 Hz로만 구하면 60–100 Hz 점검을 할 수 없습니다. PSD는 넓게(1–100 Hz) 구하고 대역은 나중에 고릅니다.

### 실제 데이터로 해보기 (선택)

**준비:** Mendeley Data의 "Multimodal Dataset of Freezing of Gait in Parkinson's Disease" v3(doi:[10.17632/r8gmbtv7w2.3](https://doi.org/10.17632/r8gmbtv7w2.3), CC BY 4.0)를 내려받아 `data/xuanwu/`에 풉니다([Day K1](day-K1.md)과 같은 위치). 과제 파일은 `data/xuanwu/Filtered Data/003/task_1.txt`처럼 됩니다(폴더 이름에 공백이 있으니 따옴표로 감쌉니다). 원본 EEG를 보는 2번은 "Raw Data" v1(doi:[10.17632/t8j8v4hnm4.1](https://doi.org/10.17632/t8j8v4hnm4.1))을 `data/xuanwu_raw/`에 푼 경우에만 실행합니다. 아래 출력은 이 두 버전으로 이 레슨 작성 때 실제로 돌린 결과입니다.

**1. 과제 파일 EEG를 Raw로, 그리고 README의 주장 확인하기**

```python
import numpy as np
import pandas as pd
import mne

PATH = "data/xuanwu/Filtered Data/003/task_1.txt"        # 머리글 없는 쉼표 구분, 61열 (K1)
EEG = ["FP1","FP2","F3","F4","C3","C4","P3","P4","O1","O2","F7","F8","P7","P8",
       "Fz","Cz","Pz","FC1","FC2","CP1","CP2","FC5","FC6","CP5","CP6"]
IMU = [f"{s}_{q}" for s in ["LShank","RShank","Waist","Arm"] for q in ["ax","ay","az","gx","gy","gz","x7"]]
COLS = ["idx","clock"] + EEG + ["c27","c28","c29","c30","c31"] + IMU + ["label"]   # K1의 열 이름
d = pd.read_csv(PATH, header=None, names=COLS, usecols=EEG + ["label"])   # 필요한 열만 읽는다
eeg_uv = d[EEG].to_numpy().T                             # (25, 표본 수)
y = d["label"].to_numpy().astype(int)

# 단위는 README에 없다. 값의 크기(SD 10–40)가 µV 규모라서 µV로 가정하고 V로 바꾼다.
raw = mne.io.RawArray(eeg_uv * 1e-6, mne.create_info(EEG, 500, "eeg"), verbose=False)
raw.set_montage(mne.channels.make_standard_montage("colin27_1020"), match_case=False)
print(raw)
print("EEG 열 수:", len(raw.ch_names), "| README 표의 TP9·TP10·IO가 EEG 열에 있나:",
      [c for c in ["TP9", "TP10", "IO"] if c in raw.ch_names])
print("C3–C4 상관: %.2f (README의 'C4, C4'가 같은 열을 두 번 넣은 것이라면 1.00)"
      % np.corrcoef(raw.get_data(picks="C3")[0], raw.get_data(picks="C4")[0])[0, 1])

# 전처리 흔적 확인: Cz 전체 PSD에서 대역별 몫
spec = raw.compute_psd(method="welch", fmin=0, fmax=250, n_fft=1000, picks="Cz", verbose=False)
p, f = spec.get_data(return_freqs=True)
share = lambda lo, hi: 100 * p[0, (f >= lo) & (f < hi)].sum() / p[0].sum()
print("Cz 파워 몫(%%): <1 Hz %.1f | 1–45 Hz %.1f | 45–49 Hz %.2f | 49–51 Hz %.3f | 51–100 Hz %.2f | 100–250 Hz %.3f"
      % (share(0, 1), share(1, 45), share(45, 49), share(49, 51), share(51, 100), share(100, 251)))
```

실행 결과(Mendeley v3, 환자 003 task_1):

```text
<RawArray | 25 x 643501 (1287.0 s), ~122.8 MiB, data loaded>
EEG 열 수: 25 | README 표의 TP9·TP10·IO가 EEG 열에 있나: []
C3–C4 상관: 0.93 (README의 'C4, C4'가 같은 열을 두 번 넣은 것이라면 1.00)
Cz 파워 몫(%): <1 Hz 13.1 | 1–45 Hz 85.8 | 45–49 Hz 0.37 | 49–51 Hz 0.002 | 51–100 Hz 0.65 | 100–250 Hz 0.001
```

확인한 것:
- **"EEG 28채널"은 과제 파일에 맞지 않습니다.** README의 센서 표는 28개를 적지만, 그중 TP9·TP10은 기준용, IO는 안구 전위이고 과제 파일의 EEG 열은 25개입니다. (아래 2번에서 원본 기록에는 이 세 채널이 따로 있음을 확인합니다.)
- README의 열 목록에 `C4, C4`라고 두 번 적힌 곳은 오타로 보입니다. 저자 코드의 열 이름은 C3, C4이고, 두 열의 상관은 1이 아니라 0.93이므로 같은 열의 복사본이 아닙니다.
- 49–51 Hz가 바로 옆 45–49 Hz보다 100배 이상 작습니다(50 Hz notch의 흔적). 100 Hz 위는 거의 비어 있습니다(0.5–100 Hz band-pass). README가 말한 전처리는 실제로 되어 있으므로 같은 필터를 다시 걸 필요가 없습니다.
- 반대로 README는 데이터가 "정규화(normalized)"되었다고 적었지만, EEG 열의 표준편차는 환자·과제마다 약 8–40으로 1이 아닙니다(z-score가 아님). 1 Hz 아래 몫도 13%로 작지 않아, 0.5 Hz high-pass 뒤에도 느린 흔들림이 남아 있습니다. 이 몫은 환자마다 크게 달라서, 같은 방법으로 세어 보면 005는 76–85%, 006은 1–3%였습니다.

**2. (원본 Raw Data를 받은 경우) 원래 기록은 몇 채널, 몇 Hz였나**

```python
import glob, warnings
import mne

vhdr = glob.glob("data/xuanwu_raw/Raw/003/*.vhdr")[0]       # 파일 이름은 기록마다 제각각이라 glob으로 찾는다
with warnings.catch_warnings(record=True) as wl:
    warnings.simplefilter("always")
    rr = mne.io.read_raw_brainvision(vhdr, preload=False, verbose=False)
for w in wl:
    print("경고:", str(w.message)[:75])
print("원본 fs:", rr.info["sfreq"], "Hz | 채널 수:", len(rr.ch_names), "| 길이: %.0f초" % (rr.n_times / rr.info["sfreq"]))
print("두피 EEG가 아닌 이름:", [c for c in rr.ch_names if c.startswith(("EMG", "IO", "TP"))])
```

실행 결과(Raw Data v1, 환자 003):

```text
경고: Online software filter detected. Using software filter settings and ignorin
경고: Channels contain different lowpass filters. Highest (weakest) filter settin
원본 fs: 1000.0 Hz | 채널 수: 32 | 길이: 2409초
두피 EEG가 아닌 이름: ['EMG1', 'EMG2', 'IO', 'EMG3', 'EMG4', 'TP9', 'TP10']
```

원본 BrainVision 기록은 1000 Hz, 32채널(두피 EEG 25 + IO + TP9·TP10 + EMG 4)입니다. 과제 파일의 500 Hz는 원래 표본화율이 아니라 저자들이 맞춘 값이라는 [Day K2](day-K2.md)의 이야기가 EEG에서도 확인됩니다. 원본 길이 2409초는 과제 파일 네 개의 합(1287 + 631 + 76 + 75 = 2069초)보다 깁니다. 저자 저장소 README가 설명하듯 준비 시간까지 들어 있기 때문입니다. 경고 두 줄은 기록 장비의 필터 설정을 읽는 방식에 관한 안내이고, 오늘 분석에는 영향이 없습니다.

**3. window마다 theta·beta, FOG와 비교 (환자 003)** — 1번 코드에 이어서 실행합니다.

```python
# ---- 2초 window(1초 이동)로 자르고, K2의 다수결 규칙으로 window 라벨 ----
def window_label(y_win, rule="majority"):          # K2에서 만든 함수
    if rule == "majority": return int(y_win.mean() >= 0.5)
    if rule == "any":      return int(y_win.max() == 1)
    if rule == "center":   return int(y_win[len(y_win) // 2])

epochs = mne.make_fixed_length_epochs(raw, duration=2.0, overlap=1.0, preload=True, verbose=False)
starts = epochs.events[:, 0]                       # 각 window의 시작 표본 번호
wy = np.array([window_label(y[s:s + 1000]) for s in starts])

spec = epochs.compute_psd(method="welch", fmin=1, fmax=100, n_fft=500, n_overlap=250,
                          picks=["Cz", "FC1", "FC2"], verbose=False)
psd, freqs = spec.get_data(return_freqs=True)      # (window, 채널 3, 주파수)
df = freqs[1] - freqs[0]
bp = lambda lo, hi: psd[..., (freqs >= lo) & (freqs < hi)].sum(-1).mean(-1) * df * 1e12   # 세 채널 평균, µV²
tab = pd.DataFrame({"fog": wy, "theta": bp(4, 8), "beta": bp(13, 30),
                    "rel_theta": bp(4, 8) / bp(1, 45), "rel_beta": bp(13, 30) / bp(1, 45),
                    "hi_60_100": bp(60, 100)})
print("window 수:", len(tab), "| FOG window:", int(tab.fog.sum()))
print(tab.groupby("fog").median().round(3).to_string())
print("Spearman(상대 beta, 60–100 Hz 파워) = %.2f" % tab["rel_beta"].corr(tab["hi_60_100"], method="spearman"))
```

실행 결과(1번 출력 네 줄 뒤에 이어짐):

```text
window 수: 1286 | FOG window: 1197
      theta    beta  rel_theta  rel_beta  hi_60_100
fog                                                
0    13.924  33.006      0.131     0.287      0.404
1    17.882  35.686      0.133     0.284      0.425
Spearman(상대 beta, 60–100 Hz 파워) = 0.49
```

이 과제에서는 window의 93%가 FOG라서 비FOG window가 89개뿐입니다. 비교의 한쪽이 이렇게 작으면 중앙값 차이를 믿기 어렵습니다. 그리고 상대 beta가 60–100 Hz 파워와 0.49로 함께 움직입니다.

**4. 모든 환자: 환자별 중앙값과 근육 점검**

```python
import glob, os
import numpy as np
import pandas as pd
import mne

DATA = "data/xuanwu/Filtered Data"
EEG = ["FP1","FP2","F3","F4","C3","C4","P3","P4","O1","O2","F7","F8","P7","P8",
       "Fz","Cz","Pz","FC1","FC2","CP1","CP2","FC5","FC6","CP5","CP6"]
IMU = [f"{s}_{q}" for s in ["LShank","RShank","Waist","Arm"] for q in ["ax","ay","az","gx","gy","gz","x7"]]
COLS = ["idx","clock"] + EEG + ["c27","c28","c29","c30","c31"] + IMU + ["label"]
PICK = ["Cz", "FC1", "FC2"]
rows = []
for path in sorted(glob.glob(os.path.join(DATA, "**", "task_*.txt"), recursive=True)):
    parts = os.path.relpath(path, DATA).split(os.sep)  # ['003', 'task_1.txt'] 또는 ['008', 'OFF_1', 'task_1.txt']
    d = pd.read_csv(path, header=None, names=COLS, usecols=PICK + ["label"])
    raw = mne.io.RawArray(d[PICK].to_numpy().T * 1e-6, mne.create_info(PICK, 500, "eeg"), verbose=False)
    y = d["label"].to_numpy().astype(int)
    ep = mne.make_fixed_length_epochs(raw, duration=2.0, overlap=1.0, preload=True, verbose=False)
    spec = ep.compute_psd(method="welch", fmin=1, fmax=100, n_fft=500, n_overlap=250, verbose=False)
    psd, freqs = spec.get_data(return_freqs=True)
    bp = lambda lo, hi: psd[..., (freqs >= lo) & (freqs < hi)].sum(-1).mean(-1)
    rows.append(pd.DataFrame({"patient": parts[0], "fog": [int(y[s:s + 1000].mean() >= 0.5) for s in ep.events[:, 0]],
                              "rel_theta": bp(4, 8) / bp(1, 45), "rel_beta": bp(13, 30) / bp(1, 45),
                              "hi_60_100": bp(60, 100) * 1e12}))
w = pd.concat(rows, ignore_index=True)

out = []
for pid, g in w.groupby("patient"):
    r = {"patient": pid, "windows": len(g), "fog_win": int(g.fog.sum())}
    for c in ["rel_theta", "rel_beta"]:
        m = g.groupby("fog")[c].median()
        r[c + "_nonFOG"], r[c + "_FOG"] = m.get(0, np.nan), m.get(1, np.nan)
    r["rho_beta_hi"] = g["rel_beta"].corr(g["hi_60_100"], method="spearman")
    out.append(r)
res = pd.DataFrame(out)
print(res.round(3).to_string(index=False))
both = res.dropna()
print("FOG window가 있는 환자 %d명 중 FOG에서 상대 theta가 더 큰 환자 %d명, 상대 beta가 더 작은 환자 %d명"
      % (len(both), (both.rel_theta_FOG > both.rel_theta_nonFOG).sum(), (both.rel_beta_FOG < both.rel_beta_nonFOG).sum()))
```

실행 결과(Mendeley v3, 과제 파일 56개 전체, 2초 window·1초 이동, 다수결 라벨, Cz·FC1·FC2 평균; 파일 3.6 GB를 읽느라 몇 분 걸립니다):

```text
patient  windows  fog_win  rel_theta_nonFOG  rel_theta_FOG  rel_beta_nonFOG  rel_beta_FOG  rho_beta_hi
    001      749      282             0.142          0.176            0.246         0.292        0.079
    002      533        4             0.188          0.107            0.235         0.145        0.331
    003     2065     1807             0.130          0.133            0.234         0.239        0.472
    004      639      149             0.185          0.191            0.194         0.218        0.114
    005      302        0             0.062            NaN            0.133           NaN       -0.219
    006     1057      378             0.078          0.089            0.563         0.522        0.511
    007      682      363             0.265          0.167            0.099         0.084       -0.104
    008     1759      919             0.138          0.132            0.169         0.217        0.114
    009      786      155             0.126          0.126            0.317         0.338        0.086
    010     1603      801             0.085          0.095            0.186         0.237        0.180
    011     1157      524             0.142          0.141            0.387         0.402        0.212
    012     1034      258             0.099          0.097            0.377         0.390        0.687
FOG window가 있는 환자 11명 중 FOG에서 상대 theta가 더 큰 환자 6명, 상대 beta가 더 작은 환자 3명
```

**결과 읽기(탐색적 관찰):**
- **theta:** FOG에서 상대 theta가 더 큰 환자는 11명 중 6명으로, 반반에 가깝습니다. 차이도 대부분 0.01 이하입니다. 예외는 001(0.142 → 0.176)과 007(0.265 → 0.167, 반대 방향)입니다. 002는 FOG window가 4개뿐이라 숫자를 읽지 않습니다. 005는 FOG가 한 번도 없었습니다.
- **beta:** 환자 사이 차이(비FOG 중앙값 0.099–0.563)가 FOG 전후 차이보다 훨씬 큽니다. 006의 0.56은 EEG 전체 파워의 절반 이상이 beta라는 뜻인데, 쉬는 뇌 EEG에서 보기 드문 값이라 근육 잡음을 먼저 의심합니다.
- **근육 점검:** 상대 beta와 60–100 Hz 파워의 상관이 012에서 0.69, 006에서 0.51, 003에서 0.47입니다. 이 환자들의 beta 변화는 근육·움직임과 떼어 해석할 수 없습니다.

**이 결과로 말할 수 없는 것:** "이 데이터에서 FOG 때 theta가 늘었다(또는 늘지 않았다)"는 결론은 내릴 수 없습니다. 측정 단위(µV)는 가정이고, 저자들의 ICA·기준 전극 처리가 이미 들어가 있으며, 라벨은 1초 단위이고(K1), 전극(Cz·FC1·FC2 평균)·과제·window 길이가 Shine 2014와 다릅니다. 무엇보다 FOG 동안 움직임이 달라지므로 EEG 차이가 뇌에서 왔는지 잡음에서 왔는지 이 표만으로 가를 수 없습니다. 다음 날(K5)에는 EEG 특징이 FOG 탐지에 실제로 보탬이 되는지를 모델로 따져 봅니다.

## 퀴즈

**1.** EEG를 µV 단위 numpy 배열로 갖고 있습니다. `mne.io.RawArray`에 넣기 전에 무엇을 해야 하고, 하지 않으면 어떻게 됩니까?

<details><summary>정답 보기</summary>

`× 1e-6`으로 **볼트(V)로 바꿉니다**(그리고 모양을 (채널, 표본)으로). MNE는 EEG를 V로 가정하므로 바꾸지 않아도 오류는 나지 않지만, 그림 눈금과 PSD가 10⁶배(파워 10¹²배) 어긋나고, µV 기준으로 정한 threshold나 비교가 모두 틀어집니다.

</details>

**2.** `raw.set_montage(mne.channels.make_standard_montage("colin27_1020"))`이 `FP1`, `FP2`를 못 찾는다며 오류를 냈습니다. 원인과 해결은?

<details><summary>정답 보기</summary>

표준 배치의 이름은 `Fp1`, `Fp2`로 **대소문자가 다릅니다**. `set_montage(..., match_case=False)`로 대소문자를 무시하게 하거나, `raw.rename_channels({"FP1": "Fp1", "FP2": "Fp2"})`로 이름을 바꿉니다. 함께, 명세에 적힌 채널(FCz, TP9 등)이 실제 열에 있는지 목록 비교로 확인합니다.

</details>

**3.** 걷기와 FOG를 비교했더니 FOG 때 **상대 theta**가 커졌습니다. 절대 theta는 그대로입니다. 어떤 설명이 가능합니까?

<details><summary>정답 보기</summary>

상대 파워는 비율이라 **분모(1–45 Hz 전체)** 가 줄어도 커집니다. FOG 때 걸음이 멈춰 움직임·근육 잡음이 줄면 다른 대역의 파워가 줄고, theta 자체는 그대로여도 상대 theta가 올라갑니다(예시 3에서 분모 몫이 더해진 것). 그래서 절대·상대 파워를 함께 보고합니다.

</details>

**4.** 걷는 중 EEG에서 "FOG 때 beta가 줄었다"는 결과를 보고하기 전에 할 점검 두 가지는?

<details><summary>정답 보기</summary>

(1) beta와 함께 **60–100 Hz 같은 고주파 파워**(근전도의 흔적)가 같은 방향으로 움직이는지, window마다 순위 상관을 봅니다. (2) 같은 window의 **움직임 양(가속도)** 이 FOG와 비FOG에서 어떻게 다른지 봅니다. 근전도(약 20–300 Hz)는 beta를 덮으므로 low-pass로 지워지지 않고, FOG는 움직임을 바꾸므로 잡음의 양도 바뀝니다. 두 점검을 통과하지 못하면 뇌의 beta 변화라고 쓰지 않습니다.

</details>

**5.** 이 데이터셋에 대해 "EEG 28채널, 500 Hz로 기록"이라는 문장을 보고서에 그대로 써도 됩니까?

<details><summary>정답 보기</summary>

**아니요.** 직접 세어 보면 과제 파일의 EEG 열은 **25개**이고(TP9·TP10·IO 없음), 원본 BrainVision 기록은 **1000 Hz, 32채널**(두피 EEG 25 + IO + TP9·TP10 + EMG 4)입니다. 500 Hz는 저자들이 모달을 맞추며 정한 값입니다. "원본 1000 Hz를 저자들이 500 Hz로 맞춘 25채널 EEG(과제 파일 기준)"처럼, 확인한 방법과 함께 씁니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/advanced/K/K4_eeg_mne.ipynb`: 예시 1–3, 문제 1–5 실행, 출력이 레슨과 같은지 확인.
- [ ] (선택) 실제 데이터 1–4 실행: EEG 열 수, C3–C4 상관, PSD의 notch·100 Hz 흔적, 원본 fs·채널 수를 내 손으로 확인.
- [ ] `reports/advanced/K/K4_eeg_bands.md`: 환자별 상대 theta·beta(FOG/비FOG)와 `rho_beta_hi` 표, 단위 가정(µV)·기준 전극·채널 선택을 적은 방법 세 줄.
- [ ] 해석 세 줄: 관찰한 것, 근육·움직임으로 설명될 수 있는 것, 이 표로 말할 수 없는 것.

## 더 읽을거리
- Shine JM, Handojoseno AMA, Nguyen TN, et al. Abnormal patterns of theta frequency oscillations during the temporal evolution of freezing of gait in Parkinson's disease. *Clin Neurophysiol*. 2014;125(3):569–576. doi:[10.1016/j.clinph.2013.09.006](https://doi.org/10.1016/j.clinph.2013.09.006)
- Handojoseno AMA, Shine JM, Nguyen TN, et al. Analysis and prediction of the freezing of gait using EEG brain dynamics. *IEEE Trans Neural Syst Rehabil Eng*. 2015;23(5):887–896. doi:[10.1109/TNSRE.2014.2381254](https://doi.org/10.1109/TNSRE.2014.2381254)
- Handojoseno AMA, Gilat M, Ly QT, et al. An EEG study of turning freeze in Parkinson's disease patients: the alteration of brain dynamic on the motor and visual cortex. *Conf Proc IEEE Eng Med Biol Soc*. 2015:6618–6621. doi:[10.1109/EMBC.2015.7319910](https://doi.org/10.1109/EMBC.2015.7319910) (환자 4명)
- Gwin JT, Gramann K, Makeig S, Ferris DP. Removal of movement artifact from high-density EEG recorded during walking and running. *J Neurophysiol*. 2010;103(6):3526–3534. doi:[10.1152/jn.00105.2010](https://doi.org/10.1152/jn.00105.2010)
- Castermans T, Duvinage M, Cheron G, Dutoit T. About the cortical origin of the low-delta and high-gamma rhythms observed in EEG signals during treadmill walking. *Neurosci Lett*. 2014;561:166–170. doi:[10.1016/j.neulet.2013.12.059](https://doi.org/10.1016/j.neulet.2013.12.059)
- Muthukumaraswamy SD. High-frequency brain activity and muscle artifacts in MEG/EEG: a review and recommendations. *Front Hum Neurosci*. 2013;7:138. doi:[10.3389/fnhum.2013.00138](https://doi.org/10.3389/fnhum.2013.00138)
- Zhang W, Yang Z, Li H, et al. Multimodal Data for the Detection of Freezing of Gait in Parkinson's Disease. *Sci Data*. 2022;9:606. doi:[10.1038/s41597-022-01713-8](https://doi.org/10.1038/s41597-022-01713-8)
- MNE-Python 문서: <https://mne.tools/stable/index.html> ("Creating MNE-Python data structures from scratch", "The Spectrum and EpochsSpectrum classes" 튜토리얼)
- 이론 노트: [T11 — 보행동결(FOG)](../I-gait-theory/note-T11.md)

---
[← 이전](day-K3.md) · [코스 지도](../../../README.md) · [다음 →](day-K5.md)
