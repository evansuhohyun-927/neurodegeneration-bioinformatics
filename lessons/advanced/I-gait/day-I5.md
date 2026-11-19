# Day I5 — 근육 활동과 EMG: 정류, envelope, 정규화, onset을 직접 구현하기

> **주차:** 심화 파트 I — 보행분석 (1주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I5_emg.ipynb`, `figures/advanced/I/I5_emg_processing.png`
>
> **먼저 끝내 둘 레슨:** [Day 23 — 시계열 기초](../../week-4/day-23.md)(band-pass 필터), [Day I2](day-I2.md)(원심성 제동), [Day I4](day-I4.md)(모멘트·파워). 선택: [심화 C2](../C-neural-signals/day-C2.md)(필터 설계와 `filtfilt`).
>
> **이론 노트:** [T04 — 근육과 EMG](../I-gait-theory/note-T04.md)에서 운동단위, force–length/velocity, Hill 모델, EMG–힘 관계의 한계를 깊게 다룹니다.

## 오늘의 목표
- phase별 주요 근육의 역할을 "언제, 늘어나며 제동하는가 줄어들며 일하는가"로 설명할 수 있다(예: LR의 전경골근과 vastii, MSt–TSt의 하퇴삼두근).
- 표면 EMG를 band-pass → 정류 → linear envelope → 진폭 정규화 순서로 처리하는 코드를 외부 패키지 없이 직접 쓸 수 있다.
- threshold로 onset/offset을 찾고, cutoff와 threshold를 바꾸면 결과가 얼마나 달라지는지 기록할 수 있다.

## 🎬 영상으로 먼저 보기

- [Biomechanics of Movement | Demo: Recording EMG to Study Muscle Activity — Biomechanics of Movement](https://www.youtube.com/watch?v=pYnZzQ0D_Bs) (8:46)
- **무엇에 주목할까:** 전극을 어디에, 어떤 방향으로 붙이는지와 원 신호가 어떻게 생겼는지 보세요. 원 신호는 0을 중심으로 위아래로 떨리는 모양이라, 그대로 평균하면 0이 된다는 점이 오늘 "정류"가 필요한 이유입니다.

- [Surface Electromyography (SEMG) Signal Processing | Part 1 — ThatsEngineering](https://www.youtube.com/watch?v=5AtAoO51vWQ) (12:15)
- **무엇에 주목할까:** 처리 단계의 순서(필터 → 정류 → 평활)에 집중하세요. 각 단계의 필터가 **무엇을 없애려는** 필터인지(움직임 잡음, 고주파 잡음, 빠른 떨림) 구분하면 오늘 코드의 숫자들이 이해됩니다.

## 개념 설명

### 걷는 동안 근육은 대부분 브레이크다

Day I2에서 본 것처럼 stance 근육은 대부분 **원심성(eccentric)**, 즉 늘어나면서 힘을 내 움직임을 제동합니다. Perry의 phase별 근육 활동을 요약하면 다음과 같습니다([P] 4–6·9장).

- **LR(2–12%)**: 정강이 앞 근육(전경골근 등)이 발바닥이 툭 떨어지지 않게 늦추며 정강이를 앞으로 끌고(heel rocker), 무릎 신전근 **vastii**(대퇴사두근 중 넓은근 넷)가 무릎이 약 20° 굽는 것을 제동합니다. 대퇴사두근 중 **대퇴직근(rectus femoris)은 LR에 거의 활동하지 않고** 주로 PSw–ISw 무렵(약 57–65% GC)에 나타납니다. 표면 전극으로 대퇴직근 위에서 LR 활동이 보인다면 옆 vastii의 신호가 섞인 것(cross-talk)일 수 있습니다. 고관절 신전근과 외전근도 이때 일합니다.
- **MSt–TSt(12–50%)**: 가자미근과 비복근이 정강이가 발 위로 넘어가는 속도를 제동하고(ankle rocker), TSt에서 활동이 가장 커집니다. 다만 초음파로 보면 TSt에서 근섬유 다발의 길이는 거의 변하지 않고 늘어나는 것은 **건**입니다([P] 21장, Introduction).
- **PSw(50–62%)**: 종아리 근육의 근전도는 PSw 초에 꺼지는데도 발목은 빠르게 족저굴곡합니다. Perry는 이를 늘어난 아킬레스건의 **탄성 반동**으로 설명합니다.
- **swing**: ISw에는 정강이 앞 근육이 발끝을 들고, TSw에는 햄스트링이 무릎이 펴지는 속도를 제동합니다.

원심성 수축이 중요한 이유는 근육의 **force–velocity** 특성에 있습니다. 근육은 빨리 짧아질수록 낼 수 있는 힘이 줄고, 늘어나면서 버틸 때는 등척성 최대보다 큰 힘(최대의 약 1.1–1.8배)을 낼 수 있습니다([Wi] 8.2절 pp.181–184). 같은 힘을 더 적은 활성화로 낼 수 있으니, 낙하하는 몸을 제동하는 데 알맞은 방식입니다.

### EMG는 무엇을 재고, 무엇을 재지 않는가

EMG(근전도)는 근섬유막을 따라 퍼지는 활동전위가 만든 **전기 신호**입니다. 힘이 아닙니다. 그래서 EMG가 말해 주는 것은 두 가지, **언제 켜졌는가(timing)** 와 **상대적으로 얼마나 셌는가(relative intensity)** 입니다([P] 21장, [W] 4장 p.82). EMG만으로는 근육이 짧아지는지 늘어나는지 알 수 없고, 같은 EMG라도 근육 길이·수축 속도·피로·길항근 활동에 따라 힘이 달라집니다. 전기 신호가 먼저 오고 힘은 수십 ms 늦게 따라옵니다([Wi] 9.4절 pp.208–212).

표면 전극은 피부 아래 근육 무리의 신호를 평균해서 듣습니다. 옆 근육 신호가 섞이는 **cross-talk** 때문에 개별 근육보다 근육군의 신호로 보는 것이 안전하고, 깊은 근육은 fine-wire 전극이 필요합니다([W] 4장 pp.82–84, [P] 21장). 기록 단계에서는 두 전극의 **차이**만 증폭하는 차동증폭기가 전원 잡음처럼 두 전극에 똑같이 실리는 신호를 지웁니다(CMRR, [Wi] 9.2.4절). 표면 EMG의 유용한 성분은 대부분 수십–수백 Hz에 있으므로 표본화는 보통 1000 Hz 이상으로 합니다([RM] 8장 p.186).

### 처리 순서와 각 단계의 선택

1. **DC 제거와 band-pass**: 평균을 빼고, 약 20 Hz 아래(몸이 움직이며 전극이 흔들리는 잡음)와 Nyquist 근처 위쪽을 잘라 냅니다([W] 4장 p.83, [Wi] 9.2.3절). 50/60 Hz notch 필터는 그 대역의 진짜 EMG도 지우므로 최후의 수단입니다([RM] 8장 p.186).
2. **전파 정류(full-wave rectification)**: 절댓값을 취합니다. 정류하지 않고 평균하거나 low-pass를 걸면 양과 음이 상쇄되어 0 근처만 남습니다(예시 1).
3. **linear envelope**: 정류한 신호를 low-pass로 평활합니다. cutoff는 교재마다 다릅니다. Whittle은 문헌에서 6–25 Hz로 다양하다고 하고([W] 4장 p.84), Robertson 등은 3–50 Hz 범위에서 10 Hz 정도면 무난하다고 하며([RM] 8장 p.189), Winter는 근육의 twitch(한 번 자극에 대한 힘 반응)의 시간 경과에서 몇 Hz 수준(약 2–4 Hz)의 cutoff를 이끌어 냅니다([Wi] 9.3.2절 pp.207–208). envelope을 세게 평활할수록 onset이 흐려지므로, **진폭 비교가 목적이면 envelope, 시점이 목적이면 덜 평활한 신호**를 씁니다. Perry의 정량화는 이 방법과 다르게, 정류한 신호를 짧은 구간마다 적분해 계단형 곡선을 만듭니다([P] 21장 Quantification).
4. **진폭 정규화**: 원 진폭(mV)은 전극 위치, 피하지방, 피부 임피던스에 크게 좌우되므로 사람·근육 사이를 비교하려면 기준값으로 나눕니다. 기준 후보는 도수근력검사 중 최대 EMG(%MMT), 동력계로 잰 최대 수의 수축(%MVC), 그리고 그 과제 안의 최댓값(% peak)입니다. 과제 내 최대 정규화는 어디에나 쓸 수 있지만 약한 활동도 강한 활동도 100%가 되어 "얼마나 힘들게 일했나"라는 정보가 사라집니다([P] 21장 Normalization, [RM] 8장 p.192).
5. **onset/offset**: threshold를 정해 그 위로 올라가는 순간을 찾습니다. Perry 연구실의 규칙은 "최대 MMT EMG의 5% 이상이 GC의 5% 이상 지속"입니다([P] 21장 Timing). 숙련자도 눈으로 고른 onset이 일주일 뒤에 절반 정도만 같았다는 보고가 있어, **규칙을 정하고 적는 것** 자체가 재현성의 핵심입니다(같은 절).

## 예시로 이해하기

### 예시 1 — 정류하지 않고 평활하면 왜 안 되는가 (가상 신호)

```python
import numpy as np
from scipy import signal

rng = np.random.default_rng(0)
fs = 1000
t = np.arange(0, 2, 1 / fs)
drive = np.where((t > 0.5) & (t < 1.2), 1.0, 0.1)          # 0.5–1.2 s에만 근육이 '켜짐'(가상)
emg = drive * rng.normal(0, 1, t.size)                      # 진폭이 drive를 따르는 무작위 신호

sos = signal.butter(2, 6, btype="low", fs=fs, output="sos")
lp_raw = signal.sosfiltfilt(sos, emg)                       # 정류 없이 바로 low-pass
lp_rect = signal.sosfiltfilt(sos, np.abs(emg))              # 정류한 뒤 low-pass

on = (t > 0.6) & (t < 1.1)
print("켜진 구간 평균  | 정류 없이: %.3f | 정류 후: %.3f" % (lp_raw[on].mean(), lp_rect[on].mean()))
print("꺼진 구간 평균  | 정류 없이: %.3f | 정류 후: %.3f" % (lp_raw[t < 0.4].mean(), lp_rect[t < 0.4].mean()))
```

실행 결과:

```text
켜진 구간 평균  | 정류 없이: -0.072 | 정류 후: 0.759
꺼진 구간 평균  | 정류 없이: -0.001 | 정류 후: 0.076
```

정류하지 않으면 근육이 켜진 구간과 꺼진 구간이 둘 다 0 근처라 구분이 안 됩니다. 정류한 뒤에는 켜진 구간이 꺼진 구간의 약 10배로 드러납니다. 정류는 **비선형** 연산이라 순서를 바꿀 수 없습니다.

### 예시 2 — BMC `emg.csv`를 처음부터 끝까지 처리하기

> **데이터:** BMC v0.2.0의 `data/emg.csv`(내용 CC BY 4.0, [doi:10.5281/zenodo.23654869](https://doi.org/10.5281/zenodo.23654869)). 머리글 없이 2열(시간 s, 진폭)이고 1000 Hz로 3.36초입니다. **어느 근육, 어떤 과제, 어떤 단위인지 파일에 정보가 없으므로** 오늘은 처리 방법 연습용으로만 쓰고 생리적 해석은 하지 않습니다. BMC의 `electromyography` 노트북은 진폭 정규화를 하지 않고 onset 검출에 외부 패키지(`detecta`)를 쓰는데, 과정 환경에는 그 패키지가 없으므로 아래 코드는 numpy/scipy로 직접 구현했습니다.
>
> ```bash
> mkdir -p data/bmc
> curl -o data/bmc/emg.csv https://raw.githubusercontent.com/BMClab/BMC/master/data/emg.csv
> ```

```python
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal

d = np.loadtxt("data/bmc/emg.csv", delimiter=",")          # 1열 시간(s), 2열 EMG(단위·근육 정보 없음)
t, raw = d[:, 0], d[:, 1]
fs = 1 / np.median(np.diff(t))
print("표본 %d개, fs = %.0f Hz, 길이 %.2f s" % (len(t), fs, t[-1]))

# 1) 평균(DC) 제거 → 2) band-pass 20–400 Hz (움직임 잡음은 아래, Nyquist 500 Hz보다 낮게)
x = raw - raw.mean()
sos_bp = signal.butter(4, [20, 400], btype="bandpass", fs=fs, output="sos")
x_bp = signal.sosfiltfilt(sos_bp, x)
# 3) 전파 정류(full-wave rectification)
x_rect = np.abs(x_bp)

# 4) linear envelope: 정류 신호를 low-pass (cutoff를 바꿔 본다)
def envelope(rect, fc):
    sos = signal.butter(2, fc, btype="low", fs=fs, output="sos")
    return signal.sosfiltfilt(sos, rect)                     # 시점 비교가 목적이라 zero-phase

# 5) 진폭 정규화: MVC 기록이 없으므로 '이 기록 안의 최댓값 = 100%'(과제 내 최대 정규화)
# 6) onset/offset: 임계값을 넘는 구간 중 min_dur 이상 지속되는 것만
def bursts(env, thr, min_dur=0.05):
    above = np.r_[False, env > thr, False].astype(int)
    on = np.flatnonzero(np.diff(above) == 1)
    off = np.flatnonzero(np.diff(above) == -1)
    keep = (off - on) / fs >= min_dur
    return t[on[keep]], t[off[keep] - 1]

base = t < 0.3                                               # 처음 0.3 s를 쉬는 구간(baseline)으로 가정
print("\nfc(Hz)  임계값 규칙          burst 수  onset(s)들")
for fc in [3, 6, 10]:
    env = envelope(x_rect, fc)
    env_n = 100 * env / env.max()                            # % of peak
    rules = {"baseline+3SD": env_n[base].mean() + 3 * env_n[base].std(),
             "10% of peak": 10.0,
             "25% of peak": 25.0}
    for name, thr in rules.items():
        on, off = bursts(env_n, thr)
        print("%5d   %-14s(%4.1f%%)  %d      %s" % (fc, name, thr, len(on), np.round(on, 3)))

# 그림: 처리 단계별 신호 (fc = 6 Hz, baseline+3SD 규칙)
env = envelope(x_rect, 6)
env_n = 100 * env / env.max()
thr = env_n[base].mean() + 3 * env_n[base].std()
on, off = bursts(env_n, thr)
print("fc 6 Hz, baseline+3SD: onset", np.round(on, 3), "offset", np.round(off, 3))
fig, axs = plt.subplots(3, 1, figsize=(8, 6), sharex=True)
axs[0].plot(t, raw, lw=0.5); axs[0].set_ylabel("raw")
axs[1].plot(t, x_rect, lw=0.5, color="gray"); axs[1].set_ylabel("band-pass,\nrectified")
axs[2].plot(t, env_n, "k"); axs[2].axhline(thr, color="r", ls="--", lw=0.8)
for a, b in zip(on, off):
    axs[2].axvspan(a, b, color="r", alpha=0.15)
axs[2].set_ylabel("envelope\n(% of peak)"); axs[2].set_xlabel("time (s)")
out = Path("figures/advanced/I/I5_emg_processing.png")
out.parent.mkdir(parents=True, exist_ok=True)
fig.tight_layout(); fig.savefig(out, dpi=150)
print("저장:", out)
```

실행 결과(그림은 `figures/advanced/I/I5_emg_processing.png`):

```text
표본 3360개, fs = 1000 Hz, 길이 3.36 s

fc(Hz)  임계값 규칙          burst 수  onset(s)들
    3   baseline+3SD  (15.5%)  3      [0.29  1.276 2.321]
    3   10% of peak   (10.0%)  1      [0.042]
    3   25% of peak   (25.0%)  3      [0.331 1.327 2.37 ]
    6   baseline+3SD  (13.6%)  3      [0.354 1.34  2.358]
    6   10% of peak   (10.0%)  5      [0.176 0.34  1.313 1.991 3.19 ]
    6   25% of peak   (25.0%)  3      [0.375 1.366 2.396]
   10   baseline+3SD  (13.1%)  4      [0.378 0.913 1.366 2.384]
   10   10% of peak   (10.0%)  7      [0.225 0.371 1.047 1.357 2.213 2.347 3.205]
   10   25% of peak   (25.0%)  3      [0.392 1.381 2.407]
fc 6 Hz, baseline+3SD: onset [0.354 1.34  2.358] offset [1.015 1.937 3.023]
저장: figures/advanced/I/I5_emg_processing.png
```

원 신호에는 눈으로 봐도 활동 덩어리(burst)가 세 개 있습니다. 결과에서 세 가지를 읽을 수 있습니다.

- **threshold가 너무 낮으면 망가진다.** 쉬는 구간의 envelope이 이미 최댓값의 약 10% 근처에서 출렁이기 때문에, "10% of peak" 규칙은 burst를 1개(3 Hz: 전체가 한 덩어리)에서 7개(10 Hz: 잡음 조각)까지 엉뚱하게 셉니다.
- **cutoff를 높이면 envelope이 출렁여 가짜 burst가 생기고, 낮추면 onset이 앞당겨진다.** 같은 baseline+3SD 규칙에서 첫 onset이 3 Hz일 때 0.290 s, 10 Hz일 때 0.378 s로 약 90 ms 차이가 납니다. 걷기 한 주기가 약 1초이니 9% GC에 해당하는 차이입니다. 강하게 평활하면 신호가 시간 방향으로 번지기 때문입니다.
- **결과가 안정된 조합이 있다.** 3·6 Hz에서 baseline+3SD와 25% 규칙은 모두 burst 3개를 찾고, onset이 서로 수십 ms 안에서 맞습니다. 하나의 "정답" 설정을 고집하기보다 **합리적인 여러 설정에서 결론이 같은지** 보는 것이 중요합니다.

## 직접 해보기

1. `notebooks/advanced/I/I5_emg.ipynb`에서 예시 1·2를 실행하고 출력이 같은지 확인합니다.
2. 예시 2의 `min_dur`를 0.02, 0.05, 0.10 s로 바꿔 burst 수가 어떻게 변하는지 표를 만듭니다. Perry 규칙의 "GC의 5% 이상 지속"을 1초 주기에 적용하면 몇 초인지도 계산해 비교합니다.
3. band-pass의 아래 경계를 10, 20, 50 Hz로 바꿔 보고, onset 시각이 바뀌는지 확인합니다. 이 파일에는 움직임 잡음이 크지 않을 수 있으니 차이가 작아도 그대로 기록합니다.
4. envelope을 `sosfiltfilt`(앞뒤) 대신 `sosfilt`(한 방향)로 걸어 onset이 얼마나 늦어지는지 측정합니다. 실시간 장치(외골격, 의수)는 미래 표본을 쓸 수 없어서 한 방향 필터를 써야 한다는 점과 연결해 한 줄로 적습니다(Day I20에서 다시 다룹니다).
5. 노트북 마지막 셀에 **처리 보고 문단**을 씁니다. 표본화율, band-pass(차수·대역·앞뒤 여부), 정류 방식, envelope cutoff, 정규화 기준, onset 규칙(threshold와 최소 지속 시간), 그리고 "이 파일은 근육·과제 정보가 없어 생리적 해석을 하지 않았다"는 한계를 모두 적습니다.

> ⚠️ **흔한 오류 1:** band-pass 위 경계를 표본화율의 절반(Nyquist, 여기서는 500 Hz) 이상으로 잡는 실수입니다. `signal.butter(4, [20, 500], ..., fs=1000)`은 오류가 납니다. 교재의 "10–1000 Hz" 같은 기록 대역은 표본화율이 충분히 높을 때의 이야기이므로, 내 파일의 fs부터 확인합니다.
>
> ⚠️ **흔한 오류 2:** 과제 내 최댓값으로 정규화한 두 사람의 envelope을 놓고 "A가 B보다 근육을 더 세게 쓴다"고 말하는 실수입니다. 각자의 최댓값이 100%가 되므로, 이 정규화로는 **시간 패턴**만 비교할 수 있습니다. 강도를 비교하려면 MVC나 MMT 같은 외부 기준이 필요합니다.

## 퀴즈

**1.** LR에 무릎의 굽힘을 제동하는 근육은 대퇴사두근 중 어느 것인가? 표면 전극으로 대퇴직근 위에서 LR 활동이 보였다면 무엇을 의심해야 하는가?

<details><summary>정답 보기</summary>

vastii(넓은근들)입니다. Perry에 따르면 대퇴직근은 LR에 거의 활동하지 않고 주로 PSw–ISw 무렵에 나타납니다. 표면 전극에서 보인 LR 활동은 옆 vastii 신호가 섞인 cross-talk일 수 있습니다.

</details>

**2.** EMG만으로 근육이 원심성인지 구심성인지 판단할 수 없는 이유는?

<details><summary>정답 보기</summary>

EMG는 근섬유막의 전기적 활성만 재고, 근육 길이가 늘어나는지 줄어드는지는 담지 않기 때문입니다. 수축 형태를 추정하려면 관절의 각속도와 모멘트(파워 부호), 가능하면 초음파 같은 직접 측정을 함께 봐야 합니다.

</details>

**3.** 처리 순서 "정류 → low-pass"를 "low-pass → 정류"로 바꾸면 어떻게 되는가?

<details><summary>정답 보기</summary>

EMG는 0을 중심으로 양·음이 섞인 신호라, 먼저 low-pass를 걸면 거의 0만 남고 그 뒤에 정류해도 활동 크기를 되살릴 수 없습니다(예시 1). 정류는 비선형 연산이라 순서가 결과를 바꿉니다.

</details>

**4.** envelope cutoff를 3 Hz에서 10 Hz로 올렸더니 같은 threshold에서 burst가 3개에서 4개가 되었다. 가장 그럴듯한 이유는?

<details><summary>정답 보기</summary>

cutoff가 높으면 envelope이 덜 평활되어 출렁임이 커지고, 그 출렁임이 threshold를 잠깐 넘어 가짜 burst가 생깁니다. 최소 지속 시간 규칙을 두거나, 여러 설정에서 결론이 같은지 확인합니다.

</details>

**5.** 과제 내 최대 정규화(% peak)의 장점과 단점을 하나씩 말하라.

<details><summary>정답 보기</summary>

장점: 최대 수축 검사를 할 수 없는 환자(심한 경직 등)에게도 쓸 수 있습니다. 단점: 약하게 쓰든 세게 쓰든 최댓값이 100%가 되어 노력 수준 정보가 사라지므로, 사람이나 조건 사이의 활동 **강도**를 비교할 수 없습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1·2를 실행하고 출력이 레슨과 같다.
- [ ] `figures/advanced/I/I5_emg_processing.png`를 저장했다.
- [ ] `min_dur`, band-pass 아래 경계, 앞뒤/한 방향 필터를 바꾼 민감도 표를 만들었다.
- [ ] 처리 보고 문단(설정 전부 + 한계)을 썼다.

## 더 읽을거리
- [P] Perry & Burnfield, 2nd ed., 2010 — 21장 Muscle Control and Dynamic Electromyography(Timing, Normalization, Quantification, Electrodes, Cross-talk), 4·5장의 phase별 근육 활동.
- [Wi] Thomas, Zeni & Winter, 5th ed., 2023 — 8.2절 force–velocity(pp.181–186), 9.2–9.3절 기록과 처리(pp.195–208), 9.4절 EMG와 역학 변수(pp.208–212).
- [W] Richards & Levine, eds., 6th ed., 2023 — 4장 Measuring Muscle Activity(pp.82–84).
- [RM] Robertson et al., 2nd ed., 2014 — 8장 Electromyographic Kinesiology(pp.179–201; 기록 p.182–, 분석·해석 p.188–, 정규화 p.192).
- [BMC] `electromyography`: <https://bmclab.github.io/BMC/notebooks_html/electromyography.html>
- 이론 노트: [T04 — 근육과 EMG](../I-gait-theory/note-T04.md)

---
[← 이전](day-I4.md) · [코스 지도](../../../README.md) · [다음 →](day-I6.md)
