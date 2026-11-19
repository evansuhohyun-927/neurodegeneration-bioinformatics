# Day I1 — 보행 주기와 보행의 언어: stride, stance, 8개 phase

> **주차:** 심화 파트 I — 보행분석 (1주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I1_gait_cycle.ipynb`, `reports/advanced/I/I1_phase_table.md`
>
> **먼저 끝내 둘 레슨:** 본 과정 0–6주차(특히 [Day 23 — 시계열 기초](../../week-4/day-23.md)). 오늘은 실제 데이터 없이 가상 시각 표로 계산합니다.
>
> **이론 노트:** [T01 — 보행 주기와 기능 과제](../I-gait-theory/note-T01.md)에서 phase 체계의 역사와 논리를 더 깊게 다룹니다.

## 오늘의 목표
- step과 stride, stance와 swing, double stance를 구분하고, Perry의 8개 phase 순서와 대략의 %GC 구간을 말할 수 있다.
- heel strike·toe off 시각 표에서 stride time, cadence, stance %, double stance %, 속도를 계산할 수 있다.
- Perry의 기능 phase와 Whittle의 사건(event) 체계를 한 표로 대응시킬 수 있다.

## 🎬 영상으로 먼저 보기

- [The Gait Cycle — Adi's Med Videos](https://www.youtube.com/watch?v=-G3EFtkq3qI) (17:54)
- **무엇에 주목할까:** 한 주기를 어디서 시작해 어디서 끝내는지, 그리고 stance와 swing을 다시 어떤 이름으로 쪼개는지 보세요. 영상이 쓰는 이름이 오늘 배울 Perry 8 phase와 같은지, 아니면 heel strike·foot flat 같은 옛 사건 이름인지 표시해 두면 오늘의 대응표 작업이 쉬워집니다.

- [Phases of the Gait Cycle 1 — Physical Therapy Education Solutions](https://www.youtube.com/watch?v=JM0EwSlvR1c) (4:55)
- **무엇에 주목할까:** 짧은 영상이라 phase 경계를 정하는 "사건"에만 집중하세요. 각 경계가 같은 발의 사건인지, 반대 발의 사건인지 구분해 보면 double stance가 왜 두 번 생기는지 보입니다.

## 개념 설명

### 한 주기는 어디서 어디까지인가: stride와 step

걷기는 같은 동작이 되풀이되는 **주기 운동**입니다. 되풀이되는 한 단위를 **보행 주기(gait cycle, GC)** 라고 부르고, 관례상 한 발이 바닥에 닿는 순간에서 시작해 **같은 발**이 다시 닿는 순간에서 끝냅니다. 바닥에 닿는 순간은 영상에서도 센서에서도 가장 잡기 쉬운 사건이기 때문입니다. Perry는 이 순간을 heel strike(뒤꿈치 닿기)가 아니라 **initial contact(IC)** 라고 부릅니다. 환자 중에는 발바닥 전체나 앞꿈치로 먼저 닿는 사람이 많아서, 정상인의 동작 이름을 붙이면 병적 보행을 같은 틀로 기술할 수 없기 때문입니다([P] 1장).

한 주기 = **stride**(같은 발의 IC → 다음 IC)이고, 그 안에 **step**(오른발 IC → 왼발 IC처럼 두 발 사이의 간격)이 두 개 들어 있습니다. 심장 박동에 비유하면 stride는 한 번의 심장 주기 전체, step은 그 안의 수축기와 이완기처럼 "반 주기씩 번갈아 오는 사건"입니다. 그래서 **cadence(분당 걸음 수)는 step을 셉니다**: cadence(steps/min) = 120 / stride time(s)([W] 2장 p.19). 속도는 stride length × cadence / 120 (m/s)으로 계산합니다(같은 쪽). Perry가 제시한 정상 성인의 평소 값은 82 m/min(1.36 m/s), stride length 1.41 m, cadence 113 steps/min 정도입니다([P] 23장).

### stance, swing, 그리고 두 번의 double stance

발이 바닥에 있는 기간이 **stance(입각기)**, 다리를 앞으로 옮기려고 발이 공중에 있는 기간이 **swing(유각기)** 입니다. 두 다리는 반 주기(50%) 어긋나 움직이므로, 한 발의 stance 처음과 끝에 두 발이 모두 바닥에 닿은 **double stance**가 한 번씩 생기고, 그 사이가 한 발로만 버티는 **single limb support(SLS)** 입니다. Perry는 82 m/min의 평소 속도에서 stance 약 62%, swing 약 38%, 두 double stance 각각 약 12%, SLS 약 38%라고 정리합니다. 일반적인 근삿값으로는 60/40과 10%를 씁니다([P] 1장, Table 1-1). Perry가 "double support" 대신 "double stance"를 고집하는 이유는, 두 발이 체중을 반씩 나눠 지는 것처럼 들리는 오해를 피하려는 것입니다. 실제로 이때 체중은 한쪽에서 다른 쪽으로 급히 넘어가는 중입니다.

간단한 산수로 이 숫자들이 서로 묶여 있음을 확인할 수 있습니다. 오른발 SLS 동안 왼발은 swing 중이므로 SLS% = 반대쪽 swing% = 100 − stance%입니다. stance = double stance + SLS + double stance이니, 좌우가 대칭이면 **stance% ≈ 50% + double stance 한 번의 %** 가 됩니다(62 = 50 + 12). 이것은 책의 문장이 아니라 정의에서 바로 나오는 관계라 예시 1에서 숫자로 검산합니다. 속도가 빨라지면 double stance가 줄어들고, 0이 되면 더 이상 걷기가 아니라 달리기입니다([P] 1장, [W] 2장 pp.17–18). 그래서 **환자의 stance%가 크다고 곧바로 병의 효과라고 말할 수 없습니다.** 느리게 걸으면 정상인도 stance%가 커집니다.

### 두 개의 이름 체계: Perry의 8 phase와 Whittle의 사건

**Perry(Rancho Los Amigos 체계)** 는 주기를 기능에 따라 8개 phase로 나눕니다. IC 0–2%, loading response(LR) 2–12%, mid stance(MSt) 12–31%, terminal stance(TSt) 31–50%, pre-swing(PSw) 50–62%, initial swing(ISw) 62–75%, mid swing(MSw) 75–87%, terminal swing(TSw) 87–100%입니다([P] 2장). 이 숫자는 정상인 평균이고, 환자의 phase는 퍼센트가 아니라 **경계 사건**으로 다시 잡아야 합니다.

**Whittle** 은 같은 주기를 눈으로 볼 수 있는 7개 사건으로 나눕니다: initial contact, opposite toe off, heel rise, opposite initial contact, toe off, feet adjacent, tibia vertical. 이 사건들이 7개 구간(stance 4개 + swing 3개)의 경계가 됩니다([W] 2장 pp.16–18). 구간 이름은 Perry와 거의 같지만, Whittle은 IC를 **기간이 아닌 순간**으로 보므로 구간이 하나 적습니다. Perry가 IC를 2% 길이의 phase로 인정한 근거는, 응답이 빠른 force plate로 보면 착지 직후 1–2% GC 동안 짧고 날카로운 힘의 충격(heel transient)이 따로 보인다는 관찰입니다([P] Introduction). 지도에 비유하면 Perry는 "지역(기능)" 이름으로, Whittle은 "경계선(사건)" 이름으로 같은 땅을 나눈 셈입니다. 두 체계를 오가는 대응표를 오늘 직접 만듭니다.

## 예시로 이해하기

> 예시의 시각 표는 모두 코드 안에서 만든 **가상 기록**입니다(seed 고정).

### 예시 1 — 시각 표에서 시간 변수 계산하기

```python
import numpy as np

rng = np.random.default_rng(1)          # seed 고정: 누가 돌려도 같은 가상 기록

# 가상 기록: 오른발(R)과 왼발(L)의 heel strike(HS)·toe off(TO) 시각(초)
stride_true = 1.06                      # 한 주기(초)
n = 6                                   # 오른발 주기 6개
hs_R = np.cumsum(np.r_[0.30, stride_true + rng.normal(0, 0.02, n)])
to_R = hs_R[:-1] + 0.62 * stride_true + rng.normal(0, 0.01, n)          # stance ≈ 62%
hs_L = hs_R[:-1] + 0.50 * stride_true + rng.normal(0, 0.01, n)          # 왼발은 반 주기 뒤
to_L = hs_R[1:] + 0.12 * stride_true + rng.normal(0, 0.01, n)           # 오른발 IC 뒤 약 12%에 왼발이 뜸

stride = np.diff(hs_R)                          # 오른발 stride time
stance = to_R - hs_R[:-1]                       # 오른발 stance time
swing = hs_R[1:] - to_R                         # 오른발 swing time
ds1 = to_L - hs_R[1:]                           # 다음 오른발 IC → 왼발 TO (initial double stance)
ds2 = to_R - hs_L                               # 왼발 IC → 오른발 TO (terminal double stance)
step_RL = hs_L - hs_R[:-1]                      # 오른발 IC → 왼발 IC (step time)

cadence = 60 / np.mean(np.r_[step_RL, hs_R[1:] - hs_L])   # steps/min (step 기준!)
stride_len = 1.40                               # 가정한 stride length (m)
speed = stride_len / np.mean(stride)            # m/s

print("stride time      : %.3f ± %.3f s" % (stride.mean(), stride.std(ddof=1)))
print("cadence          : %.1f steps/min (= 120 / stride time %.1f)" % (cadence, 120 / stride.mean()))
print("stance / swing   : %.1f%% / %.1f%%" % (100 * np.mean(stance / stride), 100 * np.mean(swing / stride)))
print("double stance    : initial %.1f%%, terminal %.1f%%" % (100 * np.mean(ds1 / stride), 100 * np.mean(ds2 / stride)))
print("speed            : %.2f m/s = %.0f m/min" % (speed, speed * 60))
print("검산 stance%% ≈ 50%% + 한 번의 double stance%%: %.1f ≈ 50 + %.1f"
      % (100 * np.mean(stance / stride), 100 * np.mean(ds2 / stride)))
```

실행 결과:

```text
stride time      : 1.065 ± 0.016 s
cadence          : 112.7 steps/min (= 120 / stride time 112.7)
stance / swing   : 61.9% / 38.1%
double stance    : initial 12.1%, terminal 12.3%
speed            : 1.31 m/s = 79 m/min
검산 stance% ≈ 50% + 한 번의 double stance%: 61.9 ≈ 50 + 12.3
```

cadence를 step 간격으로 직접 센 값과 120/stride time으로 바꾼 값이 같게 나옵니다. stance 61.9%는 50% + 12.3%와 거의 같습니다. 가상 기록을 Perry의 평소 속도 값에 맞춰 만들었기 때문에 숫자가 교과서와 비슷한 것이지, 이 코드가 "정상"을 증명하는 것은 아닙니다.

### 예시 2 — Perry phase 표와 두 발의 막대 그림

```python
from pathlib import Path
import matplotlib.pyplot as plt

# Perry 8 phase의 %GC 구간과, 끝 경계에 해당하는 Whittle 사건
phases = [  # (이름, 시작%, 끝%, 끝 경계의 Whittle 사건, 과제)
    ("IC",    0,   2, "(Whittle은 IC를 순간으로 본다)",   "WA"),
    ("LR",    2,  12, "opposite toe off (OT)",            "WA"),
    ("MSt",  12,  31, "heel rise (HR)",                   "SLS"),
    ("TSt",  31,  50, "opposite initial contact (OI)",    "SLS"),
    ("PSw",  50,  62, "toe off (TO)",                     "SLA"),
    ("ISw",  62,  75, "feet adjacent (FA)",               "SLA"),
    ("MSw",  75,  87, "tibia vertical (TV)",              "SLA"),
    ("TSw",  87, 100, "다음 IC",                           "SLA"),
]
stride_s = 1.06
print("phase  %GC       길이(ms)  과제  끝 경계(Whittle 사건)")
for name, a, b, ev, task in phases:
    print("%-5s  %3d–%3d   %5.0f     %-4s  %s" % (name, a, b, (b - a) / 100 * stride_s * 1000, task, ev))

# 오른발과 왼발(50% 어긋남)의 stance/swing 막대
fig, ax = plt.subplots(figsize=(8, 2.4))
for row, shift in [(1, 0), (0, 50)]:          # 1 = 오른발, 0 = 왼발
    for a, b, color in [(0, 62, "tab:blue"), (62, 100, "lightgray")]:
        for k in (-100, 0, 100):            # 0–100% 창 밖으로 넘어가는 부분을 감싸서 그린다
            lo, hi = a + shift + k, b + shift + k
            lo, hi = max(lo, 0), min(hi, 100)
            if hi > lo:
                ax.barh(row, hi - lo, left=lo, color=color, edgecolor="k")
for x in (12, 50, 62):
    ax.axvline(x, color="r", ls="--", lw=0.8)
ax.set_yticks([0, 1], ["left", "right"])
ax.set_xlabel("% gait cycle of the right foot")
ax.set_title("blue = stance, gray = swing, red = events shared by both feet")   # 그림 글자는 영어로(한글 글꼴 문제 회피)
out = Path("figures/advanced/I/I1_phase_bar.png")
out.parent.mkdir(parents=True, exist_ok=True)
fig.tight_layout()
fig.savefig(out, dpi=150)
print("저장:", out)
```

실행 결과(그림은 `figures/advanced/I/I1_phase_bar.png`에 저장됩니다):

```text
phase  %GC       길이(ms)  과제  끝 경계(Whittle 사건)
IC       0–  2      21     WA    (Whittle은 IC를 순간으로 본다)
LR       2– 12     106     WA    opposite toe off (OT)
MSt     12– 31     201     SLS   heel rise (HR)
TSt     31– 50     201     SLS   opposite initial contact (OI)
PSw     50– 62     127     SLA   toe off (TO)
ISw     62– 75     138     SLA   feet adjacent (FA)
MSw     75– 87     127     SLA   tibia vertical (TV)
TSw     87–100     138     SLA   다음 IC
저장: figures/advanced/I/I1_phase_bar.png
```

IC phase는 약 21 ms밖에 되지 않습니다. 초당 30장 찍는 휴대폰 영상(한 장에 33 ms)으로는 IC를 한 장도 온전히 담지 못할 수 있다는 뜻입니다(Day I2에서 다시 씁니다). 그림에서 빨간 점선 12%·50%·62%가 오른발 사건과 왼발 사건이 맞물리는 자리입니다. 12%는 왼발이 뜨는 순간(LR의 끝), 50%는 왼발이 닿는 순간(TSt의 끝), 62%는 오른발이 뜨는 순간입니다. Perry 체계에서 MSt/TSt 경계는 heel rise로 잡지만, heel rise가 아예 없거나 너무 이른 환자에게는 이 경계가 깔끔하게 정해지지 않는다는 점도 기억해 두세요([P] 2장).

## 직접 해보기

1. `notebooks/advanced/I/I1_gait_cycle.ipynb`를 만들고 예시 1–2를 실행해 출력이 위와 같은지 확인합니다.
2. 예시 1에서 `stride_true`를 1.30(느린 걸음)과 0.95(빠른 걸음)로 바꾸고, 동시에 `0.62`와 `0.12`를 각각 (0.66, 0.16)과 (0.59, 0.09)로 바꿔 봅니다. 느린 걸음에서 stance와 double stance 비율이 늘어나는 Perry의 서술과 같은 방향인지 표로 정리합니다. (가상 값이므로 숫자 자체보다 "stance% − 50%"가 double stance%와 맞는지가 점검 포인트입니다.)
3. `reports/advanced/I/I1_phase_table.md`에 **Perry–Whittle 대응표**를 만듭니다. 열: Perry phase | %GC | 시작 사건 | 끝 사건(Whittle 이름) | 그때 반대 발은 어느 phase인가 | 기능 과제(WA/SLS/SLA). 반대 발 열은 "오른발 0–12% ↔ 왼발 50–62%"처럼 50%를 더하거나 빼서 채웁니다.
4. 같은 표 아래에 "IC는 왜 Perry에서는 phase이고 Whittle에서는 사건인가"를 두세 문장으로 적습니다.
5. BMC의 [`spatial_temporal_characteristics`](https://bmclab.github.io/BMC/notebooks_html/spatial_temporal_characteristics.html) 노트북을 읽고, step length·stride length·duty factor(= stance / stride)의 정의를 내 표의 용어와 맞춰 봅니다.

> ⚠️ **흔한 오류 1:** cadence를 stride 수로 세는 실수입니다. 1분에 stride 56번이면 cadence는 56이 아니라 112 steps/min입니다. 논문을 읽을 때도 단위가 steps/min인지 strides/min인지 먼저 확인하세요.
>
> ⚠️ **흔한 오류 2:** "double stance 12%"를 한 주기 전체의 double stance로 읽는 실수입니다. 한 주기에 두 번 있으므로 합은 약 24%입니다.

## 퀴즈

**1.** 한 사람의 stride time이 1.20 s일 때 cadence는?

<details><summary>정답 보기</summary>

100 steps/min. cadence = 120 / stride time입니다. stride 하나에 step이 둘 들어 있으므로 60/1.20 = 50 strides/min의 두 배입니다.

</details>

**2.** 좌우가 대칭인 걸음에서 double stance 한 번이 10%라면 stance%는 대략 얼마인가?

<details><summary>정답 보기</summary>

약 60%. 대칭이면 SLS = 반대쪽 swing이므로 stance% ≈ 50% + double stance 한 번의 %입니다. Perry의 일반 근삿값(60/40, 10%)과 맞습니다.

</details>

**3.** Perry의 8 phase 중 stance(발이 바닥에 있음)에 속하지만 기능 과제로는 다리 전진(swing limb advancement)에 들어가는 phase는?

<details><summary>정답 보기</summary>

pre-swing(PSw, 50–62%). 발은 아직 바닥에 있지만, 체중이 반대 발로 급히 넘어가며 이 다리는 swing을 준비합니다. 그래서 Perry는 PSw를 SLA 과제에 넣습니다(자세한 내용은 Day I2).

</details>

**4.** 환자군의 stance%가 대조군보다 크게 나왔다. 이것을 곧바로 "질환이 stance를 늘린다"고 해석하면 안 되는 이유는?

<details><summary>정답 보기</summary>

stance%와 double stance%는 보행 속도에 따라 달라집니다. 느리게 걸으면 정상인도 stance%가 커집니다. 군 비교에서는 속도를 함께 보고하고, 가능하면 속도를 통제한 비교를 해야 합니다(Day I13).

</details>

**5.** Whittle 체계에서 mid-stance 구간의 시작과 끝 사건은?

<details><summary>정답 보기</summary>

opposite toe off(반대 발이 뜸)에서 heel rise(이 발의 뒤꿈치가 들림)까지입니다. Perry의 MSt(12–31%)와 경계가 같습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–2가 노트북에서 실행되고 출력이 레슨과 같다.
- [ ] 속도를 바꾼 가상 기록 3개의 stance%·double stance% 표를 만들었다.
- [ ] `reports/advanced/I/I1_phase_table.md`에 Perry–Whittle 대응표와 반대 발 phase 열을 채웠다.
- [ ] `figures/advanced/I/I1_phase_bar.png`를 저장했다.

## 더 읽을거리
- [P] Perry J, Burnfield JM. *Gait Analysis: Normal and Pathological Function*, 2nd ed. SLACK, 2010 — 1장 Gait Cycle, 2장 Phases of Gait, 23장 Stride Analysis.
- [W] Richards J, Levine D, eds. *Whittle's Gait Analysis*, 6th ed. Elsevier, 2023 — 2장 Terminology Used in Gait Analysis, Overview of the Gait Cycle, The Gait Cycle in Detail (pp.16–33).
- [BMC] Duarte M, Watanabe RN. *Notes on Scientific Computing for Biomechanics and Motor Control*, v0.2.0 (내용 CC BY 4.0, 코드 MIT). [doi:10.5281/zenodo.23654869](https://doi.org/10.5281/zenodo.23654869) — `spatial_temporal_characteristics`.
- 이론 노트: [T01 — 보행 주기와 기능 과제](../I-gait-theory/note-T01.md)

---
[← 이전](../../../README.md) · [코스 지도](../../../README.md) · [다음 →](day-I2.md)
