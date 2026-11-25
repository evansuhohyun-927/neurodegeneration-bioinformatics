# Day K1 — 멀티모달 FOG 데이터셋 해부: 파일 구조, 라벨, 그리고 "직접 세어 보기"

> **주차:** 심화 파트 K — 멀티모달 FOG 데이터 분석 · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/K/K1_dataset_anatomy.ipynb`, `data/xuanwu/DATA_DICTIONARY.md`, `figures/advanced/K/K1_real_onset.png`
>
> **먼저 끝내 둘 레슨:** [Day I17](../I-gait/day-I17.md)(FOG 정의·유형), [Day I18](../I-gait/day-I18.md)(freeze index, Daphnet 데이터 사전), [Day I19](../I-gait/day-I19.md)(참가자 단위 검증, event 단위 평가). 선택: [Day I5](../I-gait/day-I5.md)(EMG 처리)
>
> **이론 노트:** [T11 — 보행동결(FOG)](../I-gait-theory/note-T11.md)

## 오늘의 목표
- 헤더 없는 과제 파일에 열 이름을 붙이고, 논문·README·저자 코드·실제 파일이 서로 다른 곳을 코드로 찾아 데이터 사전에 적을 수 있다.
- 라벨 열을 run-length로 읽어 FOG 사건 수, 총 FOG 시간, 환자별 FOG 비율, 라벨의 시간 해상도를 구할 수 있다.
- FOG 시작 전후 30초의 정강이 가속도, 전경골근 EMG, 라벨을 시간축을 공유하는 한 그림에 그릴 수 있다.

## 🎬 영상으로 먼저 보기

- [Freezing of gait — The Lancet](https://www.youtube.com/watch?v=3-wrNhyVTNE) (2:32)
- **무엇에 주목할까:** 오늘 다룰 데이터의 라벨은 의사가 **영상을 보고** 붙였습니다. 영상 속 동결의 시작과 끝을 몇 초 단위로 짚을 수 있을지 스스로 가늠해 보세요. "시작이 정확히 언제인가"를 사람 눈으로 정하는 일이 생각보다 애매하다는 감각이 오늘 라벨 해상도 이야기의 출발점입니다.

## 개념 설명

FOG 자체(정의, 유형, 네트워크 가설)는 [Day I17](../I-gait/day-I17.md)과 [T11](../I-gait-theory/note-T11.md)에서, freeze index와 Daphnet 데이터 사전 만들기는 [Day I18](../I-gait/day-I18.md)에서 이미 했습니다. 오늘은 그 다음 단계, **센서가 다섯 종류인 데이터**를 처음 열어 보는 날입니다.

### 세 개의 문서와 하나의 파일: 무엇을 믿을까

이번 파트의 데이터는 Zhang 외(2022, *Scientific Data*)가 공개한 멀티모달 FOG 데이터셋입니다. 베이징 Xuanwu 병원에서 파킨슨병 환자들이 약효가 떨어진 상태(off-medication)에서 회전·좁은 통로·장애물 우회가 섞인 걷기 과제를 했고, 그동안 EEG, EMG, ECG, 피부전도도(skin conductance, SC), 가속도(ACC)를 함께 기록했습니다. 두 명의 신경과 의사가 영상을 보고 FOG 구간을 표시했습니다.

이 데이터에 대해 말해 주는 곳은 네 군데입니다. (1) 논문 본문, (2) Mendeley에 올라간 README.docx(라벨된 데이터용과 원본 데이터용 두 개), (3) 저자들의 GitHub 처리 코드, (4) 실제 파일. 셋은 사람이 쓴 설명이고 하나만 기계가 만든 사실입니다. 처방전과 실제 약통의 라벨이 다를 때 약통을 열어 알약을 세어 보듯, **설명이 서로 어긋나면 파일을 직접 세어서** 정합니다. 오늘 예시 3에서 실제로 이런 차이를 여러 개 찾습니다.

| 항목 | 설명 문서가 말하는 것 | 파일을 직접 세어 본 결과(예시 3) |
|---|---|---|
| 열 수 | README: 60열 | **61열**. 0번 열은 0,1,2…인 행 번호, 1번 열은 `12:04:38.002` 같은 시각 문자열 |
| 환자 폴더 | README: 하위 폴더 11개 | 폴더 **12개**(001–012). 논문은 12명·13개 실험이라고 씀 |
| 과제 수 | 논문·README: 환자마다 과제 4개 | 4개인 실험 10개, 5개 2개(004, 008의 첫 세션), 6개 1개(009) |
| EEG 채널 | README 표: "28D-EEG", 목록에 C4가 두 번 | 과제 파일에는 **25채널**. 저자 코드의 열 이름 목록에는 C3, C4가 있으므로 README의 "C4, C4"는 오타로 봄. 나머지 3개(TP9, TP10, IO)는 기준 전극·안구 전극 |
| 관성 센서 | 정강이 양쪽, 허리, 손목. 일부 환자는 "왼쪽 정강이와 왼쪽 손목 두 개만" | 양쪽 정강이가 다 있는 환자는 **3명(009, 010, 011)**. 002·004·012는 **오른쪽** 정강이만 있음. 002는 팔 센서가 없어 **SC도 없음** |
| 27–31열 | 환자마다 순서가 다름(README 표) | 29열은 README상 001만 안구 전극(IO)이고 나머지는 빈칸인데, 파일에는 모든 환자에서 작은 신호가 들어 있음 → 정체를 모르므로 쓰지 않음 |

### 인덱스를 초로, 라벨을 사건으로

파일에는 시간이 두 가지로 들어 있습니다. 0번 열 행 번호(0, 1, 2, …)와 1번 열 시각 문자열입니다. 표본화율이 500 Hz이므로 **행 번호 ÷ 500 = 과제 시작부터 흐른 초**입니다. 시각 문자열은 "벽시계"라서 과제 사이 쉬는 시간을 볼 때만 쓰고, 계산은 행 번호로 합니다. 버스 노선의 정류장 번호와 도착 시각표의 관계와 비슷합니다. 정류장이 일정 간격이면 번호만으로 거리를 셀 수 있지요.

라벨 열(60번)은 행마다 0 또는 1입니다. 우리가 알고 싶은 것은 "1이 몇 행인가"가 아니라 **FOG가 몇 번, 각각 얼마나** 일어났는가입니다. 그래서 이어진 1의 덩어리를 하나의 사건으로 묶는 **run-length** 읽기를 합니다. 방법은 간단합니다. 라벨 앞뒤에 0을 하나씩 붙이고 이웃한 값의 차이(`np.diff`)를 구하면, 0→1인 곳에서 +1, 1→0인 곳에서 −1이 나옵니다. +1 위치가 시작, −1 위치가 끝입니다. 앞뒤에 0을 붙이는 이유는 파일이 FOG 중에 시작하거나 끝나도 사건을 놓치지 않기 위해서입니다.

주의할 점이 하나 있습니다. 서로 **붙어 있는** 두 사건은 라벨만으로는 하나로 보입니다. 의사가 "10초에서 20초", "21초에서 25초"로 표시했는데 각 표시가 그 초의 끝까지 칠해지면 두 구간이 맞닿아 한 덩어리가 됩니다. 그래서 파일에서 센 사건 수는 논문이 보고한 사건 수와 다를 수 있습니다(예시 3).

### 라벨의 시간 해상도: 1초 눈금자로 잰 길이

표본은 2 ms 간격이지만 라벨까지 2 ms 정밀도인 것은 아닙니다. 저자 코드(`seg2label.py`)를 보면 의사가 적은 FOG 시작·끝 시각은 **분:초** 단위이고, 코드는 시작 초의 처음부터 끝 초의 마지막까지를 1로 칠합니다. 그러면 모든 FOG 사건의 길이는 정확히 500행의 배수가 되어야 합니다. 이것을 예시 3에서 실제로 확인합니다. 1초 눈금만 있는 자로 잰 길이에 소수점 아래 숫자를 붙여 보고하면 안 되듯, 이 데이터로 "FOG 시작 200 ms 전에 무엇이 변했다" 같은 주장은 할 수 없습니다. 라벨 경계 자체가 ±1초 안에서 흔들리기 때문입니다. 이 사실은 Day K2에서 window 라벨 규칙을 정할 때 다시 씁니다.

## 예시로 이해하기

이 파트의 모든 Day는 같은 **합성 데이터 뼈대**에서 시작합니다. 60초 기록, 500 Hz, 25–35초가 FOG라고 **가정**하고, 걷기는 1 Hz 사인파, FOG는 5 Hz의 작은 떨림으로 흉내 냅니다. 이 모양은 설명을 위한 가정일 뿐 실제 생리를 주장하는 것이 아닙니다. 그날 필요한 모달(EMG, SC, EEG)은 이 뼈대에 몇 줄을 덧붙여 만듭니다.

### 예시 1 — 합성 라벨로 run-length 연습: 사건 수, 총 시간, 해상도

```python
import numpy as np
import pandas as pd

# ---- 합성 데이터 뼈대 (K1–K5 공통) ----
fs = 500                                   # 500행 = 1초
t = np.arange(0, 60, 1/fs)                 # 60초
label = ((t >= 25) & (t < 35)).astype(int) # 25–35초가 FOG(가정)
label[(t >= 48) & (t < 50.5)] = 1          # 오늘만 덧붙임: 짧은 FOG 하나 더(48–50.5초, 가정)
rng = np.random.default_rng(0)
acc = np.where(label == 0, np.sin(2*np.pi*1.0*t), 0.4*np.sin(2*np.pi*5.0*t)) + 0.1*rng.standard_normal(t.size)

# ---- 인덱스 → 초 ----
idx = np.arange(t.size)                    # 실제 파일의 0번 열처럼 0, 1, 2, ...
print("행 12500은", idx[12500] / fs, "초")

# ---- run-length: 0→1이 되는 곳이 시작, 1→0이 되는 곳이 끝 ----
def fog_events(label, fs):
    edges = np.diff(np.r_[0, label, 0])    # 앞뒤에 0을 붙여 맨 처음·맨 끝 사건도 잡는다
    starts = np.where(edges == 1)[0]       # 시작 행(포함)
    ends = np.where(edges == -1)[0]        # 끝 행(포함하지 않음)
    return pd.DataFrame({"start_s": starts / fs, "end_s": ends / fs,
                         "dur_s": (ends - starts) / fs, "n_rows": ends - starts})

ev = fog_events(label, fs)
print(ev.to_string(index=False))
print("사건 수:", len(ev), "| 총 FOG 시간: %.1f초" % ev["dur_s"].sum(),
      "| 기록 중 FOG 비율: %.1f%%" % (100 * label.mean()))
print("사건 길이를 1초(500행)로 나눈 나머지:", (ev["n_rows"] % fs).tolist())
```

실행 결과:

```text
행 12500은 25.0 초
 start_s  end_s  dur_s  n_rows
    25.0   35.0   10.0    5000
    48.0   50.5    2.5    1250
사건 수: 2 | 총 FOG 시간: 12.5초 | 기록 중 FOG 비율: 20.8%
사건 길이를 1초(500행)로 나눈 나머지: [0, 250]
```

마지막 줄이 해상도 검사입니다. 나머지가 0이 아닌 사건(250행 = 0.5초)이 하나라도 있으면 이 라벨은 1초보다 촘촘하게 붙었다는 뜻입니다. 실제 데이터에서 이 줄이 무엇을 출력하는지 예시 3에서 봅니다.

### 예시 2 — 여러 모달을 한 시간축에: `subplots(sharex=True)`

```python
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# ---- 합성 데이터 뼈대 ----
fs = 500
t = np.arange(0, 60, 1/fs)
label = ((t >= 25) & (t < 35)).astype(int)
rng = np.random.default_rng(0)
acc = np.where(label == 0, np.sin(2*np.pi*1.0*t), 0.4*np.sin(2*np.pi*5.0*t)) + 0.1*rng.standard_normal(t.size)
# ---- 오늘 덧붙임: 전경골근 EMG (설명용 가정) ----
# 걷기: 걸음마다 짧은 burst(1 Hz 리듬) / FOG: 리듬 없이 중간 세기로 계속 켜져 있다고 가정
burst = (np.sin(2*np.pi*1.0*t) > 0.5).astype(float)
amp = np.where(label == 0, 0.1 + 0.9*burst, 0.5)
emg = amp * rng.standard_normal(t.size)

onset = np.flatnonzero(np.diff(label) == 1)[0] + 1      # 첫 FOG 시작 행
seg = slice(max(onset - 30*fs, 0), min(onset + 30*fs, t.size))
tt = t[seg] - t[onset]                                   # FOG 시작을 0초로

fig, ax = plt.subplots(3, 1, figsize=(10, 6), sharex=True,
                       gridspec_kw={"height_ratios": [2, 2, 1]})
ax[0].plot(tt, acc[seg], lw=0.6); ax[0].set_ylabel("shank ACC (a.u.)")
ax[1].plot(tt, emg[seg], lw=0.3, color="tab:green"); ax[1].set_ylabel("TA EMG (a.u.)")
ax[2].step(tt, label[seg], where="post", color="tab:red"); ax[2].set_ylabel("label")
ax[2].set_yticks([0, 1]); ax[2].set_xlabel("time from FOG onset (s)")
for a in ax:
    a.axvline(0, color="k", ls="--", lw=0.8)
fig.suptitle("Synthetic: ACC + EMG + label around FOG onset (assumed shapes)")
fig.tight_layout()
os.makedirs("figures/advanced/K", exist_ok=True)
fig.savefig("figures/advanced/K/K1_synthetic_multiaxis.png", dpi=120)
print("FOG 시작: %.1f초 (행 %d) | 그림 구간: %.1f ~ %.1f초" % (t[onset], onset, tt[0], tt[-1]))
pre, post = slice(onset - 10*fs, onset), slice(onset, onset + 10*fs)
print("시작 전 10초 |EMG| 평균 %.2f, 시작 후 10초 %.2f" % (np.abs(emg[pre]).mean(), np.abs(emg[post]).mean()))
print("저장: figures/advanced/K/K1_synthetic_multiaxis.png")
```

실행 결과:

```text
FOG 시작: 25.0초 (행 12500) | 그림 구간: -25.0 ~ 30.0초
시작 전 10초 |EMG| 평균 0.33, 시작 후 10초 0.39
저장: figures/advanced/K/K1_synthetic_multiaxis.png
```

세 가지를 확인하세요. (1) `sharex=True` 덕분에 한 패널을 확대하면 나머지도 같이 따라옵니다. 모달마다 단위와 크기가 달라 y축은 따로 두고 **시간축만 공유**하는 것이 다중 모달 그림의 기본형입니다. (2) 시작이 25초라 "앞 30초"를 다 가질 수 없어 그림이 −25초에서 시작합니다. `max(..., 0)`이 없으면 음수 인덱스가 기록 **끝**에서부터 잘라 와서 엉뚱한 그림이 나옵니다. (3) 합성 EMG의 평균 세기는 FOG 전후로 거의 같지만(0.33 vs 0.39) 그림에서는 **리듬**이 사라진 것이 보입니다. 평균 하나로 줄이면 놓치는 정보가 있다는 뜻이고, Day K3에서 window별 특징을 만들 때 다시 생각합니다.

### 예시 3 — 실제 파일 해부는 "직접 해보기" 끝의 실제 데이터 절에서

실제 데이터는 약 1.7 GB짜리 zip이라 선택 과제로 두었습니다. 아래 "실제 데이터로 해보기 (선택)"에서 위 표의 숫자를 모두 코드로 확인합니다.

## 직접 해보기

각 문제는 합성 데이터 뼈대에서 돌아갑니다. `____`를 채워 실행하고, 막히면 모범답안을 여세요.

**1. 인덱스 → 초.** 행 17250은 과제 시작 후 몇 초입니까?

```python
import numpy as np
fs = 500
t = np.arange(0, 60, 1/fs)
idx = np.arange(t.size)
print(idx[17250] / ____)
```

<details><summary>모범답안 보기</summary>

```python
print(idx[17250] / fs)
```

```text
34.5
```

`fs`로 나눕니다. 숫자 500을 직접 쓰기보다 변수를 쓰면 표본화율이 다른 데이터(Daphnet 64 Hz 등)로 옮길 때 한 곳만 고치면 됩니다.

</details>

**2. 사건의 시작과 끝 찾기.** 예시 1의 라벨(FOG 두 개)에서 시작과 끝을 초로 출력하세요.

```python
import numpy as np
fs = 500
t = np.arange(0, 60, 1/fs)
label = ((t >= 25) & (t < 35)).astype(int)
label[(t >= 48) & (t < 50.5)] = 1
edges = np.diff(np.r_[0, label, 0])
starts = np.flatnonzero(edges == ____)
ends = np.flatnonzero(edges == ____)
print("사건 수:", len(starts), "| 시작(초):", (starts / fs).tolist(), "| 끝(초):", (ends / fs).tolist())
```

<details><summary>모범답안 보기</summary>

```python
starts = np.flatnonzero(edges == 1)
ends = np.flatnonzero(edges == -1)
```

```text
사건 수: 2 | 시작(초): [25.0, 48.0] | 끝(초): [35.0, 50.5]
```

0→1은 +1, 1→0은 −1입니다. 끝 위치는 "FOG가 아닌 첫 행"이므로 길이는 `ends - starts`로 바로 구해집니다.

</details>

**3. 라벨 해상도 검사.** 2번에 이어서, 시작·끝 위치가 1초 눈금에 딱 떨어지는지 확인하세요.

```python
print("시작 % fs:", sorted(set((starts % ____).tolist())), "| 끝 % fs:", sorted(set((ends % ____).tolist())))
```

<details><summary>모범답안 보기</summary>

```python
print("시작 % fs:", sorted(set((starts % fs).tolist())), "| 끝 % fs:", sorted(set((ends % fs).tolist())))
```

```text
시작 % fs: [0] | 끝 % fs: [0, 250]
```

시작은 모두 정수 초였지만 끝 하나가 50.5초라 나머지 250이 나왔습니다. 실제 데이터에서는 이 집합이 `[0]` 하나만 나와야 "1초 해상도"라고 말할 수 있습니다. (실제 파일은 첫 행이 0초라서 행 번호 기준 나머지를 보면 됩니다.)

</details>

**4. 없는 센서 찾기.** 이 데이터는 센서가 없으면 그 열을 **0으로 채웠습니다.** 작은 표에서 어느 정강이 센서가 있는지 판정하세요.

```python
import pandas as pd
df = pd.DataFrame({"RShank_ax": [0.0, 0.0, 0.0], "RShank_ay": [0.0, 0.0, 0.0], "RShank_az": [0.0, 0.0, 0.0],
                   "LShank_ax": [8019.0, 8012.3, 8013.2], "LShank_ay": [-2540.0, -2550.2, -2568.0], "LShank_az": [-1292.0, -1293.3, -1310.2]})
for s in ["LShank", "RShank"]:
    cols = [f"{s}_ax", f"{s}_ay", f"{s}_az"]
    present = (df[cols] != ____).any(axis=None)
    print(s, "있음" if present else "없음(0으로 채워짐)")
```

<details><summary>모범답안 보기</summary>

```python
    present = (df[cols] != 0).any(axis=None)
```

```text
LShank 있음
RShank 없음(0으로 채워짐)
```

"0으로 채움"은 결측을 숫자처럼 보이게 만듭니다. 이 열을 그대로 평균·분산 특징에 넣으면 "움직임이 전혀 없는 다리"로 학습됩니다. 결측 모달 처리는 Day K5에서 다룹니다.

</details>

**5. 환자별 FOG 비율.** 과제 파일 4개(환자 A 두 개, B 두 개)의 표에서 환자별 FOG 비율을 구하세요.

```python
import pandas as pd
files = pd.DataFrame({"patient": ["A", "A", "B", "B"], "dur_s": [300, 60, 200, 40], "fog_s": [90, 0, 0, 4]})
for p, g in files.groupby("patient"):
    pct = 100 * g["fog_s"].sum() / g["dur_s"].____()
    print(p, "FOG %.1f%%" % pct)
print("과제 평균으로 잘못 구하면:", files.assign(r=100 * files.fog_s / files.dur_s).groupby("patient")["r"].mean().round(1).to_dict())
```

<details><summary>모범답안 보기</summary>

```python
    pct = 100 * g["fog_s"].sum() / g["dur_s"].sum()
```

```text
A FOG 25.0%
B FOG 1.7%
과제 평균으로 잘못 구하면: {'A': 15.0, 'B': 5.0}
```

비율은 **시간을 먼저 더하고 나서** 나눕니다. 과제별 비율을 평균하면 40초짜리 짧은 과제가 300초짜리와 같은 무게를 가져 숫자가 크게 달라집니다(B: 1.7% → 5.0%).

</details>

⚠️ **흔한 오류 1 — 61열인데 60개 이름 붙이기.** README대로 60개 이름을 주면 `pandas`가 첫 열을 인덱스로 먹거나 모든 열이 한 칸씩 밀립니다. 라벨 열이 0/1만 가지는지(`unique()`)로 바로 확인됩니다.

⚠️ **흔한 오류 2 — 0으로 채운 센서를 진짜 신호로 쓰기.** 축 평균이 정확히 0.0인 센서는 "가만히 있는 다리"가 아니라 "없는 센서"입니다. 중력 때문에 실제 가속도계의 축 평균은 0이 되기 어렵습니다.

### 실제 데이터로 해보기 (선택)

**준비.** 라벨된 데이터: Mendeley Data "Multimodal Dataset of Freezing of Gait in Parkinson's Disease" v3, [doi:10.17632/r8gmbtv7w2.3](https://doi.org/10.17632/r8gmbtv7w2.3), CC BY 4.0. 페이지의 전체 내려받기 zip(약 1.7 GB)을 `data/xuanwu/`에 풀면 `data/xuanwu/Filtered Data/001/task_1.txt`처럼 됩니다(폴더 이름에 공백이 있으니 경로를 따옴표로 감쌉니다). 이 레슨 작성 때 쓴 zip의 SHA-256은 `3057d4b61fb10c808a617281a91af7168ea0f9d446246acab38b694460eced1f`입니다. Day K2에서 쓸 원본 데이터는 [doi:10.17632/t8j8v4hnm4.1](https://doi.org/10.17632/t8j8v4hnm4.1)(약 0.9 GB)이고 `data/xuanwu_raw/`에 풉니다. `data/`는 저장소에 올리지 않습니다. 사용할 때는 Zhang 외 2022 논문과 두 데이터셋을 인용합니다.

**R1 — 한 파일 열어 보기와 열 이름 붙이기.** 열 이름은 저자 코드의 `settings.toml`(EEG 순서)과 README(나머지)를 합쳐 정했습니다. 27–31열은 환자마다 뜻이 달라서 일단 `c27`…`c31`로 두고, 7번째 IMU 열은 팔(Arm)에서만 SC이고 나머지는 무효(NC)라서 `x7`로 둡니다.

```python
import numpy as np
import pandas as pd

DATA = "data/xuanwu/Filtered Data"          # Mendeley v3 zip을 data/xuanwu/에 푼 위치
fs = 500
EEG = ["FP1","FP2","F3","F4","C3","C4","P3","P4","O1","O2","F7","F8","P7","P8",
       "Fz","Cz","Pz","FC1","FC2","CP1","CP2","FC5","FC6","CP5","CP6"]
IMU = [f"{s}_{q}" for s in ["LShank", "RShank", "Waist", "Arm"]
       for q in ["ax", "ay", "az", "gx", "gy", "gz", "x7"]]          # Arm_x7 = SC, 나머지 x7 = NC
COLS = ["idx", "clock"] + EEG + ["c27", "c28", "c29", "c30", "c31"] + IMU + ["label"]

raw = pd.read_csv(f"{DATA}/001/task_1.txt", header=None)
print("모양:", raw.shape, "← README는 60열이라고 적음")
d = raw.set_axis(COLS, axis=1)
print("0번 열이 0,1,2,...인가:", bool((d["idx"].to_numpy() == np.arange(len(d))).all()))
print("1번 열 처음 3개:", d["clock"].head(3).tolist())
clk = pd.to_datetime(d["clock"], format="mixed")
print("시계 간격(ms) 종류:", np.unique(np.diff(clk.to_numpy()).astype("timedelta64[ms]").astype(int)))
print("길이: %d행 = %.3f초" % (len(d), len(d) / fs))
print("라벨 값:", sorted(d["label"].unique().tolist()))
for s in ["LShank", "RShank", "Waist", "Arm"]:
    a = d[[f"{s}_ax", f"{s}_ay", f"{s}_az"]]
    print(f"{s:7s} 0이 아닌 값 있음: {bool((a != 0).any(axis=None))!s:5s} 축 평균:", a.mean().round(0).tolist())
print("LShank_x7(NC) 고유값:", d["LShank_x7"].round(3).unique()[:5], "| Arm_x7(SC) 범위:", d["Arm_x7"].min(), "~", d["Arm_x7"].max())
print("c27–c31 표준편차:", d[["c27", "c28", "c29", "c30", "c31"]].std().round(0).tolist())
```

실행 결과(Mendeley v3, 환자 001, task_1):

```text
모양: (180501, 61) ← README는 60열이라고 적음
0번 열이 0,1,2,...인가: True
1번 열 처음 3개: ['12:04:38', '12:04:38.002', '12:04:38.004']
시계 간격(ms) 종류: [2]
길이: 180501행 = 361.002초
라벨 값: [0, 1]
LShank  0이 아닌 값 있음: True  축 평균: [8377.0, -1394.0, -1320.0]
RShank  0이 아닌 값 있음: False 축 평균: [0.0, 0.0, 0.0]
Waist   0이 아닌 값 있음: True  축 평균: [8089.0, 311.0, 1517.0]
Arm     0이 아닌 값 있음: True  축 평균: [7800.0, 2607.0, -277.0]
LShank_x7(NC) 고유값: [77.    76.999 77.001 77.002 77.003] | Arm_x7(SC) 범위: 1320.8811207155973 ~ 1833.1851162165387
c27–c31 표준편차: [2969.0, 935.0, 45.0, 2572.0, 3099.0]
```

읽는 법: README가 "0부터 시작하는 시간 열"이라고 부른 것은 실제로는 **행 번호**이고, 그 옆에 시각 문자열 열이 하나 더 있어서 61열이 됩니다. 행 수가 500의 배수 + 1(180501)이라 길이가 361.002초입니다. 가속도는 g나 m/s²가 아니라 **센서가 내놓은 정수(ADC 카운트)** 그대로입니다. 쉬는 자세의 크기가 약 8000이라 "1 g ≈ 8000 카운트" 근처로 보이지만, 센서의 측정 범위 설정이 문서에 없으므로 단위는 카운트로 남겨 둡니다. NC 열은 77 근처의 상수라 정말 쓸모없는 열입니다. 29열(`c29`)은 001에서는 README상 안구 전극(IO)입니다.

**R2 — 56개 과제 파일 전체를 세기.** 라벨과 가속도 12열만 읽어 시간을 줄입니다(전체 약 3.6 GB, 몇 분 걸림).

```python
import glob, os
import numpy as np
import pandas as pd

DATA = "data/xuanwu/Filtered Data"
fs = 500
ACC = {"LShank": [32, 33, 34], "RShank": [39, 40, 41], "Waist": [46, 47, 48], "Arm": [53, 54, 55]}  # 0부터 센 열 번호
LABEL = 60

rows, all_len = [], []
for path in sorted(glob.glob(f"{DATA}/**/task_*.txt", recursive=True)):
    rel = os.path.relpath(path, DATA)                      # 예: 001/task_1.txt, 008/OFF_1/task_1.txt
    parts = rel.split(os.sep)
    use = [LABEL] + sum(ACC.values(), [])
    d = pd.read_csv(path, header=None, usecols=use)        # 필요한 열만 읽어 메모리를 아낀다
    y = d[LABEL].to_numpy()
    edges = np.diff(np.r_[0, y, 0])
    lens = np.flatnonzero(edges == -1) - np.flatnonzero(edges == 1)   # 사건마다 행 수
    all_len += (lens / fs).tolist()
    row = {"patient": parts[0], "session": parts[1] if len(parts) == 3 else "-",
           "task": parts[-1][:-4], "dur_s": len(y) / fs, "events": len(lens),
           "fog_s": y.sum() / fs, "len_mod_500": sorted(set((lens % fs).tolist()))}
    for s, c in ACC.items():
        row[s] = bool((d[c] != 0).any(axis=None))
    rows.append(row)
files = pd.DataFrame(rows)
print("과제 파일 %d개, 환자 %d명, 실험(세션) %d개" % (
    len(files), files["patient"].nunique(), len(files[["patient", "session"]].drop_duplicates())))
print("과제 수/실험:", files.groupby(["patient", "session"]).size().value_counts().sort_index().to_dict())
print("FOG 사건 길이를 500행으로 나눈 나머지(모든 파일):",
      sorted(set(sum(files["len_mod_500"].tolist(), []))))

pt = files.groupby("patient").agg(tasks=("task", "size"), minutes=("dur_s", lambda x: x.sum() / 60),
                                  events=("events", "sum"), fog_s=("fog_s", "sum"),
                                  LShank=("LShank", "max"), RShank=("RShank", "max"),
                                  Waist=("Waist", "max"), Arm=("Arm", "max"))
pt["fog_pct"] = 100 * pt["fog_s"] / (60 * pt["minutes"])
print(pt.round(1).to_string())
print("합계: %.1f분, FOG 사건(연속 구간) %d개, FOG %.1f분" % (
    files["dur_s"].sum() / 60, files["events"].sum(), files["fog_s"].sum() / 60))
L = np.array(all_len)
print("사건 길이: %.0f–%.0f초, 5초 미만 %.0f%%, 10초 미만 %.0f%%" % (L.min(), L.max(), 100 * (L < 5).mean(), 100 * (L < 10).mean()))
print("센서가 과제마다 바뀐 환자:", [p for p, g in files.groupby("patient")
                                     if g[list(ACC)].nunique().max() > 1])
files.to_csv("K1_files.csv", index=False)
```

실행 결과(Mendeley v3 전체):

```text
과제 파일 56개, 환자 12명, 실험(세션) 13개
과제 수/실험: {4: 10, 5: 2, 6: 1}
FOG 사건 길이를 500행으로 나눈 나머지(모든 파일): [0]
         tasks  minutes  events   fog_s  LShank  RShank  Waist    Arm  fog_pct
patient                                                                       
001          4     12.6      22   260.0    True   False   True   True     34.5
002          4      9.0       1     3.0   False    True   True  False      0.6
003          4     34.5      51  1756.0    True   False   True   True     84.9
004          5     10.7      15   134.0   False    True  False   True     20.8
005          4      5.1       0     0.0    True   False  False   True      0.0
006          4     17.7      22   356.0    True   False  False   True     33.6
007          4     11.4      30   333.0    True   False  False   True     48.5
008          9     29.5      47   872.0    True   False  False   True     49.3
009          6     13.2      38   117.0    True    True   True   True     14.8
010          4     26.8      35   766.0    True    True   True   True     47.7
011          4     19.4      51   473.0    True    True  False   True     40.7
012          4     17.3      12   246.0   False    True   True   True     23.7
합계: 207.0분, FOG 사건(연속 구간) 324개, FOG 88.6분
사건 길이: 1–238초, 5초 미만 28%, 10초 미만 53%
센서가 과제마다 바뀐 환자: []
```

**결과 읽기:**
- **라벨 해상도는 1초입니다.** 324개 사건 모두 길이가 500행의 배수였습니다. 저자 코드가 분:초 단위 표시를 초 경계까지 칠한다는 것과 맞습니다.
- **논문과의 비교.** 논문은 3시간 42분 3초(약 222분), FOG 334회, 총 FOG 88분 19초, 사건 길이 1–201초, 5초 미만이 35% 넘음이라고 보고합니다. 파일에서 센 값은 207.0분, 연속 구간 324개, 88.6분, 1–238초, 5초 미만 28%입니다. FOG 총 시간은 거의 같지만 사건 수는 적고 가장 긴 사건은 더 깁니다. **맞닿은 사건이 한 구간으로 합쳐졌다**고 보면 세 차이가 함께 설명되지만, 의사의 원래 표시 시각이 공개되지 않아 확인할 수는 없습니다. 기록 길이 15분 차이의 이유도 문서에서 찾지 못했습니다. 이런 것은 추측으로 메우지 않고 "확인 못 함"으로 데이터 사전에 적습니다.
- **환자 사이 차이가 매우 큽니다.** 005는 FOG가 한 번도 없고, 002는 3초짜리 한 번뿐이며, 003은 기록의 85%가 FOG입니다. 참가자 단위로 나누지 않고 window를 한데 모으면 003 한 사람이 결과를 좌우합니다([Day I19](../I-gait/day-I19.md), [Day 33](../../week-5/day-33.md)).
- **센서 구성은 환자마다 다르고, 한 환자 안에서는 같습니다.** "모든 환자가 양쪽 정강이에 센서를 달았다"는 말은 틀립니다. 양쪽 정강이는 3명뿐이고, 오른쪽 정강이만 있는 환자도 3명입니다. 그래서 다음 Day부터 "정강이 가속도"는 **있는 쪽 정강이**를 씁니다.
- **008은 두 번 실험했습니다**(폴더 `OFF_1`, `OFF_2`, 다른 날). 위 표는 환자 단위로 합쳤습니다. 모델을 평가할 때 두 세션을 다른 사람처럼 나누면 같은 사람이 train과 test에 모두 들어갑니다(Day K5).

**R3 — FOG 시작 전후 30초 그림.** 001의 왼쪽 정강이 가속도 크기, 왼쪽 전경골근(L-TA) EMG, 라벨을 한 그림에 그립니다. 어느 열이 L-TA인지는 README의 "Order of 27-31 columns" 표에서 옮겼습니다.

```python
import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

DATA = "data/xuanwu/Filtered Data"
fs = 500
# README "Order of 27-31 columns" 표에서 왼쪽 전경골근(L-TA)이 들어 있는 열(0부터 센 번호)
L_TA = {"001": 28, "002": 28, "003": 27, "004": 27, "005": 27, "006": 28, "007": 28,
        "008/OFF_1": 28, "008/OFF_2": 31, "009": 27, "010": 27, "011": 27, "012": 27}
rec = "001"
d = pd.read_csv(f"{DATA}/{rec}/task_1.txt", header=None, usecols=[0, 32, 33, 34, L_TA[rec], 60])
d.columns = ["idx", "ax", "ay", "az", "emg", "label"]
t = d["idx"].to_numpy() / fs                            # 인덱스 → 초
y = d["label"].to_numpy()
edges = np.diff(np.r_[0, y, 0])
starts, ends = np.flatnonzero(edges == 1), np.flatnonzero(edges == -1)
ok = (starts >= 30 * fs) & (ends - starts >= 10 * fs)  # 앞에 30초가 온전히 있고 10초 이상 이어진 첫 FOG
on, off = starts[ok][0], ends[ok][0]
print("FOG 시작 %.1f초, 끝 %.1f초, 길이 %.0f초" % (t[on], t[off], (off - on) / fs))
seg = slice(on - 30 * fs, on + 30 * fs)
tt = t[seg] - t[on]
acc_mag = np.linalg.norm(d[["ax", "ay", "az"]].to_numpy()[seg], axis=1)

fig, ax = plt.subplots(3, 1, figsize=(10, 6), sharex=True, gridspec_kw={"height_ratios": [2, 2, 1]})
ax[0].plot(tt, acc_mag, lw=0.5); ax[0].set_ylabel("L shank |ACC|\n(ADC counts)")
ax[1].plot(tt, d["emg"].to_numpy()[seg], lw=0.3, color="tab:green"); ax[1].set_ylabel("L-TA EMG\n(file units)")
ax[2].step(tt, y[seg], where="post", color="tab:red"); ax[2].set_ylabel("label"); ax[2].set_yticks([0, 1])
ax[2].set_xlabel("time from FOG onset (s)")
for a in ax:
    a.axvline(0, color="k", ls="--", lw=0.8)
fig.suptitle(f"Zhang 2022 filtered data, patient {rec} task_1: ±30 s around a FOG onset")
fig.tight_layout()
os.makedirs("figures/advanced/K", exist_ok=True)
fig.savefig("figures/advanced/K/K1_real_onset.png", dpi=120)
pre, post = slice(on - 10 * fs, on), slice(on, on + 10 * fs)
e = d["emg"].to_numpy()
print("|ACC| 표준편차  시작 전 10초 %.0f, 시작 후 10초 %.0f" % (acc_mag[20*fs:30*fs].std(), acc_mag[30*fs:40*fs].std()))
print("|EMG| 평균      시작 전 10초 %.0f, 시작 후 10초 %.0f" % (np.abs(e[pre]).mean(), np.abs(e[post]).mean()))
print("저장: figures/advanced/K/K1_real_onset.png")
```

실행 결과:

```text
FOG 시작 89.0초, 끝 102.0초, 길이 13초
|ACC| 표준편차  시작 전 10초 6734, 시작 후 10초 3370
|EMG| 평균      시작 전 10초 2328, 시작 후 10초 1695
저장: figures/advanced/K/K1_real_onset.png
```

그림에서 볼 것(관찰이지 결론이 아닙니다):
- FOG 구간(0–13초)에서 가속도의 큰 충격 봉우리(발 디딤)가 사라지고 작은 흔들림만 남습니다. 표준편차도 절반으로 줄었습니다.
- EMG의 뾰족한 봉우리가 가속도의 충격 봉우리와 **같은 순간**에 서 있습니다. 근육이 만든 신호라기보다 발이 땅에 닿을 때 전극·케이블이 흔들려 생긴 **움직임 잡음**일 가능성이 있습니다. 이 의심은 Day K3에서 EMG를 처리할 때 다시 봅니다.
- 그림 맨 앞(−30초에서 −26초)은 라벨이 1인데 가속도가 거의 평평합니다. 움직임이 거의 없는 동결(무동형)이거나 출발 지연일 수 있지만 영상이 공개되지 않아 확인할 수 없습니다. [Day I18](../I-gait/day-I18.md)의 에너지 게이트라면 이런 구간을 놓칩니다.

**데이터 사전 쓰기.** `data/xuanwu/DATA_DICTIONARY.md`에 아래 틀을 채웁니다. 각 줄 옆에 **어떻게 확인했는지**(README / 논문 / 저자 코드 / 내가 센 코드)를 괄호로 적습니다.

```text
# Zhang 2022 multimodal FOG dataset — data dictionary
- 출처: Zhang W, et al. Sci Data 2022;9:606. doi:10.1038/s41597-022-01713-8
- 데이터: Mendeley v3 doi:10.17632/r8gmbtv7w2.3 (라벨), v1 doi:10.17632/t8j8v4hnm4.1 (원본), CC BY 4.0
- 저자 코드: github.com/AccSrd/multimodal-Parkinson-data-processing (Apache-2.0)
- 내려받은 날: ____ / zip SHA-256: ____
- 파일: 과제 파일 56개, 헤더 없음, 쉼표 구분, 61열, 500행 = 1초 (내가 셈)
- 열: 0 행 번호 / 1 시각 / 2–26 EEG 25채널 / 27–31 EMG·ECG·IO(환자별 표) / 32–59 IMU 4×7 / 60 라벨 (README + 저자 코드 + 내가 셈)
- 라벨: 1 FOG, 0 아님 / 영상 보고 의사 2명 / 해상도 1초 (내가 셈)
- 센서 보유: 환자별 표 (내가 셈) / 없는 센서는 0으로 채움
- 단위: ACC·SC는 ADC 카운트, 측정 범위 미기재 (README + 내가 봄)
- 문서와 다른 점: 60열→61열, 폴더 11→12, 과제 4개→4–6개, C4 중복 오타, 양쪽 정강이는 3명뿐, 29열 정체 불명
- 확인 못 한 것: 사건 334 vs 324의 차이, 기록 222분 vs 207분의 차이
```

## 퀴즈

**1.** 실제 과제 파일의 0번 열과 1번 열은 각각 무엇입니까? README의 설명과 어떻게 다릅니까?

<details><summary>정답 보기</summary>

0번 열은 0부터 1씩 늘어나는 **행 번호**, 1번 열은 `12:04:38.002` 같은 **벽시계 시각**입니다. README는 "0부터 시작하는 시간 열 하나"와 나머지 59열, 합해서 60열이라고 적었지만 실제로는 두 열이 따로 있어 61열입니다. 열 이름을 60개만 붙이면 모든 열이 밀립니다.

</details>

**2.** 라벨 열 `[0, 0, 1, 1, 1, 0, 1, 1, 0]`에서 `np.diff(np.r_[0, y, 0])`의 결과와 FOG 사건 수는? (단답)

<details><summary>정답 보기</summary>

앞뒤에 0을 붙이면 `[0,0,0,1,1,1,0,1,1,0,0]`이고 차이는 `[0,0,1,0,0,-1,1,0,-1,0]`입니다. +1이 두 번이므로 **사건 2개**(길이 3행과 2행)입니다.

</details>

**3.** 실제 데이터의 모든 FOG 사건 길이가 500행의 배수였습니다. 이것으로 알 수 있는 것과, 그래서 하면 안 되는 주장은?

<details><summary>정답 보기</summary>

라벨이 **1초 단위**로 붙었다는 것(저자 코드가 분:초 표시를 초 경계까지 칠함)을 알 수 있습니다. 따라서 "FOG 시작 0.3초 전에 EMG가 변했다"처럼 1초보다 짧은 시간 차이를 근거로 한 주장은 라벨 경계 오차 안에 묻혀서 할 수 없습니다.

</details>

**4.** 다음 중 이 데이터에 대해 **파일로 확인한 사실**과 맞는 것을 모두 고르세요.
(a) 모든 환자가 양쪽 정강이 센서를 달았다 (b) 과제 파일의 EEG는 25채널이다 (c) 모든 환자에게 FOG가 있었다 (d) 없는 센서의 열은 0으로 채워져 있다

<details><summary>정답 보기</summary>

**(b), (d)**. 양쪽 정강이는 009, 010, 011 세 명뿐이고, 005는 FOG가 한 번도 없었습니다. README 표의 "28D-EEG"는 기준 전극 2개와 안구 전극 1개를 포함한 수이고 과제 파일에는 25채널만 있습니다.

</details>

**5.** 파일에서 센 FOG 사건 수(324)가 논문(334)보다 적은데 총 FOG 시간은 거의 같았습니다. 가장 그럴듯한 설명 하나와, 그 설명을 데이터 사전에 어떻게 적어야 하는지 쓰세요.

<details><summary>정답 보기</summary>

의사가 따로 표시한 사건이 **맞닿아 있어 라벨에서 한 구간으로 합쳐졌다**는 설명이 사건 수 감소, 총 시간 유지, 최장 사건 증가(201→238초)를 함께 설명합니다. 그러나 원래 표시 시각이 공개되지 않아 확인할 수 없으므로 "가능한 설명(미확인)"으로 적고, 사건 단위 분석을 할 때 이 한계를 함께 보고합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/advanced/K/K1_dataset_anatomy.ipynb`: 예시 1–2와 직접 해보기 1–5 실행.
- [ ] (선택) 실제 데이터 R1–R3 실행, 출력이 위와 같은지 확인. `K1_files.csv` 저장.
- [ ] `data/xuanwu/DATA_DICTIONARY.md`: 각 줄에 확인 방법 표시, "문서와 다른 점"과 "확인 못 한 것" 포함.
- [ ] `figures/advanced/K/K1_real_onset.png`(또는 합성판 `K1_synthetic_multiaxis.png`)와 그림 설명 세 줄.

## 더 읽을거리
- Zhang W, Yang Z, Li H, et al. Multimodal Data for the Detection of Freezing of Gait in Parkinson's Disease. *Sci Data*. 2022;9:606. doi:[10.1038/s41597-022-01713-8](https://doi.org/10.1038/s41597-022-01713-8) (PMC9546845, 오픈 액세스) — Methods(참가자, 과제, 데이터 전처리), Data Records
- Li H, et al. Multimodal Dataset of Freezing of Gait in Parkinson's Disease, v3. Mendeley Data. doi:[10.17632/r8gmbtv7w2.3](https://doi.org/10.17632/r8gmbtv7w2.3) / Raw Data, v1. doi:[10.17632/t8j8v4hnm4.1](https://doi.org/10.17632/t8j8v4hnm4.1)
- 저자 처리 코드: <https://github.com/AccSrd/multimodal-Parkinson-data-processing> — `Scripts/seg2label.py`(라벨 칠하기), `settings.toml`(열 이름)
- 이론 노트: [T11 — 보행동결(FOG)](../I-gait-theory/note-T11.md)

---
[← 이전](../I-gait/day-I19.md) · [코스 지도](../../../README.md) · [다음 →](day-K2.md)
