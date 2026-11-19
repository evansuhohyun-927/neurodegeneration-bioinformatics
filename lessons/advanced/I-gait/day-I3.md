# Day I3 — 관절 운동학: 마커 좌표로 시상면 각도 곡선 만들고 읽기

> **주차:** 심화 파트 I — 보행분석 (1주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I3_joint_angles.ipynb`, `figures/advanced/I/I3_joint_angles.png`
>
> **먼저 끝내 둘 레슨:** [Day I1](day-I1.md)(%GC와 phase), [Day I2](day-I2.md)(rocker), [Day 23 — 시계열 기초](../../week-4/day-23.md)(시간축 다루기).
>
> **이론 노트:** [T02 — 운동학](../I-gait-theory/note-T02.md)에서 3차원 각도(Cardan, JCS), 각도 미분과 각속도의 차이를 다룹니다.

## 오늘의 목표
- 분절각(segment angle)과 관절각(joint angle)을 정의하고, 이 레슨이 쓰는 좌표축과 부호 규약을 말로 설명할 수 있다.
- Winter의 공개 마커 자료로 무릎각·발목각·대퇴각을 계산하고, 시간축을 heel contact 기준 %GC로 바꿔 그릴 수 있다.
- 계산한 곡선을 Perry의 phase별 정상 패턴과 특징점으로 비교하고, 숫자가 다를 때 원인을 측정 정의에서 찾을 수 있다.

## 🎬 영상으로 먼저 보기

- [Analysis of Gait Motion: Sagittal Plane — Physical Therapy Education Solutions](https://www.youtube.com/watch?v=uh7riepyJl4) (7:55)
- **무엇에 주목할까:** 고관절·무릎·발목이 한 주기 동안 각각 몇 번 굽고 펴지는지 세어 보세요. 무릎은 굽힘 봉우리가 두 번(작은 것과 큰 것), 발목은 방향이 네 번 바뀝니다. 오늘 계산한 곡선에서 그 횟수를 다시 셀 겁니다. 영상이 "고관절 굴곡 몇 도"라고 할 때 그것이 골반 기준인지 수직선 기준인지도 메모해 두세요.

## 개념 설명

### 각도는 측정값이 아니라 규약이다

곧게 편 무릎을 0°라고 부를 수도, 180°라고 부를 수도 있습니다. 각도는 "무엇과 무엇 사이를, 어느 쪽에서 어느 쪽으로, 어느 방향을 +로" 재는지 정해야 숫자가 됩니다. 그래서 운동학 보고서에서 가장 먼저 적는 것이 **좌표축과 부호 규약**입니다.

이 레슨의 규약은 Winter 교재 부록과 같습니다([Wi] 3.6절 pp.62–63, 부록 A). **x = 진행 방향(앞이 +), y = 수직(위가 +)**, 오른쪽을 보고 걷는 사람을 옆에서 본 시상면입니다. 같은 교재도 3차원을 다루는 3.1절과 7장에서는 **z를 수직축**으로 쓰므로, 책을 오갈 때마다 축 이름부터 확인해야 합니다. **분절각**은 분절 하나가 전역 기준(앞쪽 수평선)과 이루는 각으로, 원위 마커에서 근위 마커로 향하는 벡터를 `arctan2`로 계산하고 반시계 방향을 +로 둡니다. **관절각**은 이웃한 두 분절각의 차입니다. 같은 사람의 같은 자세라도 생체역학식(두 분절각의 차를 그대로)과 임상식(해부학적 자세를 0°로, "굴곡 몇 도"처럼 이름으로 방향 표시)이 다른 숫자를 냅니다([RM] 1장 pp.24–27). 같은 회전 규약 안에서도 무릎 굴곡과 고관절 굴곡은 회전 방향이 반대라서, 임상식으로 바꿀 때 관절마다 부호를 따로 정해야 합니다. 그리고 피험자가 왼쪽을 보고 걷는 영상에서는 모든 부호가 뒤집힙니다.

### Winter 자료에서 어떤 마커를 쓰는가, 발목 부호는 어느 쪽인가

BMC 저장소의 `WinterTableA1.txt`는 Winter 교재 부록 Table A.1의 공개본입니다. 한 사람이 평지를 걷는 1.5초 동안 오른쪽 하지의 마커 7개(hip, knee, fibula head, ankle, heel, 5th metatarsal, toe)와 몸통 마커 1개(rib cage)의 x, y 좌표가 약 70 Hz로 106 frame 들어 있습니다. 단위는 파일에 적혀 있지 않고 원전 기준으로 cm입니다. 이 표의 관절각을 재현하려면 **하퇴는 ankle → fibula head**, **발은 5th metatarsal → heel**로 잡아야 합니다. toe나 knee 마커로 바꾸면 값이 달라집니다(예시 2).

발목 부호는 특히 조심해야 합니다. Winter 교재 본문(3.6.2절)의 식은 **족저굴곡(plantarflexion)을 +** 로 두지만, 같은 책 부록 Table A.4의 발목 값은 **배측굴곡(dorsiflexion)이 +** 인 쪽으로 나옵니다. 둘은 부호만 반대입니다. **이 레슨은 배측굴곡 +, 족저굴곡 −** 를 씁니다. Perry와 임상 문헌의 관례와 같아서 비교가 쉽기 때문입니다. 무릎은 굴곡 +(완전 신전 = 0°)입니다.

고관절은 정의가 둘입니다. Perry는 **thigh 각**(수직선 기준 대퇴의 기울기)을 주로 쓰고, 골반 기준 **hip 각**은 따로 보여 줍니다. 같은 걸음에서 thigh 각은 굴곡 20°(IC)부터 겉보기 신전 20°(TSt 끝)까지, hip 각은 굴곡 30°부터 신전 10°까지로 약 10° 어긋납니다. 차이는 평균 약 10°의 골반 전방경사입니다([P] 6장, Appendix A). Winter 자료에는 골반 마커가 없으므로, 오늘은 수직선 기준 thigh 각을 계산해 Perry의 thigh 각과 비교합니다. 몸통 마커 기준 각도도 함께 출력하지만, 이것은 골반 기준 hip 각과 다르다는 점을 기억하세요.

### 정상 곡선을 phase와 함께 읽기

Perry는 phase마다 대표 각도를 5° 단위로 반올림해 제시합니다([P] 4–6장). 비교의 기준이 될 특징점만 뽑으면 다음과 같습니다.

- **무릎**: IC에 약 5° 굴곡 → LR 끝(12% GC)에 약 20° 굴곡(충격 흡수용 작은 봉우리) → TSt 중간(39% GC)에 약 5°로 최소 → PSw 끝에 약 40° → ISw 끝에 약 60°로 최대(발이 바닥에 끌리지 않게 하는 큰 봉우리) → TSw 끝에 다시 거의 펴짐([P] 5장). 2차원 영상 자료는 최대 굴곡을 70° 안팎으로 보고하기도 합니다.
- **발목**: LR 초반 약 5° 족저굴곡(뒤꿈치를 축으로 발바닥을 내려놓음) → MSt에 정강이가 발 위로 넘어가며 배측굴곡 → 45% GC에 약 10° 배측굴곡 최대 → PSw에 약 15° 족저굴곡까지 빠르게 → swing에서 중립 근처로 복귀. 방향이 네 번 바뀌는 "호(arc) 네 개"입니다([P] 4장).
- **대퇴(thigh 각)**: IC에 약 20° 굴곡 → 27% GC 무렵 수직 → 50% GC에 겉보기 신전 약 20° → MSw에 약 25° 굴곡 최대 → TSw에 20°로 약간 되돌아옴([P] 6장).

Whittle도 같은 흐름을 사건 중심으로 서술합니다([W] 2장 pp.21–24). 각도를 미분해 각속도·각가속도를 구하면 잡음이 크게 늘어나는데, 그 이유와 필터 선택은 Day I10에서 다룹니다. 오늘은 **필터를 걸지 않은 원 좌표**로 각도만 계산합니다.

## 예시로 이해하기

> **데이터:** Duarte M, Watanabe RN. *Notes on Scientific Computing for Biomechanics and Motor Control* v0.2.0의 `data/WinterTableA1.txt`(내용 CC BY 4.0, [doi:10.5281/zenodo.23654869](https://doi.org/10.5281/zenodo.23654869)). 원전은 Winter 교재 부록 Table A.1입니다. 한 사람·한 시행 자료이므로 "정상 곡선"의 대표로 일반화하지 않습니다.
>
> ```bash
> mkdir -p data/bmc
> curl -o data/bmc/WinterTableA1.txt https://raw.githubusercontent.com/BMClab/BMC/master/data/WinterTableA1.txt
> ```

### 예시 1 — 분절각 → 관절각 → %GC 곡선

```python
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# BMC data/WinterTableA1.txt: 머리글 2줄, 106행 × 18열, 좌표 단위 cm(원전 기준), x = 진행 방향, y = 수직
raw = pd.read_csv("data/bmc/WinterTableA1.txt", sep=r"\s+", header=None, skiprows=2).to_numpy()
frame, t = raw[:, 0].astype(int), raw[:, 1]
names = ["rib", "hip", "knee", "fibula", "ankle", "heel", "mt5", "toe"]
M = {nm: raw[:, 2 + 2 * i: 4 + 2 * i] for i, nm in enumerate(names)}     # 마커별 (x, y)
print("frame 수 %d, 기록 %.3f s, 표본화 %.2f Hz" % (len(t), t[-1], (len(t) - 1) / t[-1]))

def seg_angle(distal, proximal):
    """원위 마커 → 근위 마커 벡터가 +x(앞쪽 수평)와 이루는 각(도), 반시계 +"""
    d = M[proximal] - M[distal]
    return np.degrees(np.unwrap(np.arctan2(d[:, 1], d[:, 0])))

thigh = seg_angle("knee", "hip")          # 대퇴: knee → hip
leg   = seg_angle("ankle", "fibula")      # 하퇴: ankle → fibula head  (toe·knee가 아님!)
foot  = seg_angle("mt5", "heel")          # 발:   5th metatarsal → heel
trunk = seg_angle("hip", "rib")           # 몸통(½HAT): hip → rib cage

knee  = thigh - leg                       # + = 굴곡, 0 = 완전 신전
ankle = foot - leg - 90                   # + = 배측굴곡(DF), − = 족저굴곡(PF)  ← 이 레슨의 규약
thigh_v = thigh - 90                      # 수직선 기준 대퇴각(Perry의 thigh 각): + = 굴곡
hip   = thigh - trunk                     # 몸통선 기준 대퇴각: + = 굴곡 (골반 기준 hip 각과는 다르다)

# [Wi] 부록 A가 표시한 사건: 오른발 heel contact = frame 28, 97 / toe-off = frame 1, 70
hc1, to, hc2 = 28, 70, 97
idx = np.arange(hc1 - 1, hc2)             # frame 28…97 (배열 위치는 frame − 1)
gc = (frame[idx] - hc1) / (hc2 - hc1) * 100
print("stride %.3f s, stance %.1f%%GC" % (t[hc2 - 1] - t[hc1 - 1], (to - hc1) / (hc2 - hc1) * 100))

def at(y, pct):                           # 특정 %GC에서의 값(선형 보간)
    return np.interp(pct, gc, y[idx])

print("\n%GC   knee(굴곡+)  ankle(DF+)  thigh_v(굴곡+)  hip_vs_trunk")
for p in [0, 12, 31, 45, 50, 62, 75, 87]:
    print("%3d   %8.1f   %9.1f   %10.1f   %10.1f" % (p, at(knee, p), at(ankle, p), at(thigh_v, p), at(hip, p)))
print("\n최댓값/최솟값 (한 주기)")
for nm, y in [("knee", knee), ("ankle", ankle), ("thigh_v", thigh_v)]:
    yy = y[idx]
    print("%-8s max %5.1f at %4.1f%%GC | min %6.1f at %4.1f%%GC"
          % (nm, yy.max(), gc[yy.argmax()], yy.min(), gc[yy.argmin()]))

fig, axs = plt.subplots(1, 3, figsize=(11, 3.2), sharex=True)
for ax, y, title in zip(axs, [knee, ankle, thigh_v],
                        ["knee (flexion +)", "ankle (dorsiflexion +)", "thigh vs vertical (flexion +)"]):
    ax.plot(gc, y[idx], "k")
    ax.axvline((to - hc1) / (hc2 - hc1) * 100, color="r", ls="--", lw=0.8)   # toe-off
    ax.axhline(0, color="gray", lw=0.5)
    ax.set_title(title); ax.set_xlabel("% gait cycle (right heel contact = 0)")
axs[0].set_ylabel("angle (deg)")
out = Path("figures/advanced/I/I3_joint_angles.png")
out.parent.mkdir(parents=True, exist_ok=True)
fig.tight_layout(); fig.savefig(out, dpi=150)
print("저장:", out)
```

실행 결과(그림은 `figures/advanced/I/I3_joint_angles.png`):

```text
frame 수 106, 기록 1.501 s, 표본화 69.95 Hz
stride 0.987 s, stance 60.9%GC

%GC   knee(굴곡+)  ankle(DF+)  thigh_v(굴곡+)  hip_vs_trunk
  0        1.0         2.0         20.5         13.9
 12       16.9        -2.6         17.5         12.5
 31        8.0         4.3         -3.0          0.9
 45        7.5         6.9        -15.4         -4.4
 50       14.7         1.7        -17.0         -6.2
 62       50.9       -24.5         -5.7         -2.1
 75       62.0        -6.3         19.7         19.8
 87       22.8        -2.5         25.6         22.0

최댓값/최솟값 (한 주기)
knee     max  67.8 at 69.6%GC | min   -4.8 at 95.7%GC
ankle    max   8.3 at 33.3%GC | min  -24.8 at 62.3%GC
thigh_v  max  26.1 at 85.5%GC | min  -17.5 at 50.7%GC
저장: figures/advanced/I/I3_joint_angles.png
```

Perry의 특징점과 나란히 놓아 봅니다.

| 특징점 | Perry(반올림, 3D 자료) | 이 자료(원 좌표, 2D) | 읽는 법 |
|---|---|---|---|
| 무릎 LR 봉우리 | 12% GC에 약 20° | 12% GC에 16.9° | 같은 모양, 크기는 비슷 |
| 무릎 최대 굴곡 | ISw 끝(약 75%)에 약 60° | 69.6% GC에 67.8° | 2D 자료가 더 크게 나오는 경향과 일치 |
| 발목 배측굴곡 최대 | 45% GC에 약 10° | 33–45% GC에 7–8° | 원 좌표의 출렁임(잡음)이 섞임 |
| 발목 족저굴곡 최대 | PSw 끝 약 15° | toe-off 무렵 24.8° | 이 사람·이 속도에서 더 큼 |
| thigh 각 | IC 20° → 50%에 −20° → MSw 25° | 20.5° → −17.0° → 26.1° | 거의 같음 |

이 사람의 stride는 0.987 s(cadence 약 122 steps/min)로 Perry의 평균(113 steps/min)보다 조금 빠릅니다. 속도, 2D와 3D의 차이, 마커 정의, 필터 유무가 모두 숫자를 바꿉니다. 부록 표의 각도는 필터를 거친 좌표로 계산한 값이라 오늘의 원 좌표 결과와 몇 도 다를 수 있습니다. 그래서 비교의 핵심은 **봉우리의 개수, 순서, 대략의 시점**입니다.

### 예시 2 — 마커를 바꾸면, 부호를 바꾸면

```python
import numpy as np
import pandas as pd

raw = pd.read_csv("data/bmc/WinterTableA1.txt", sep=r"\s+", header=None, skiprows=2).to_numpy()
names = ["rib", "hip", "knee", "fibula", "ankle", "heel", "mt5", "toe"]
M = {nm: raw[:, 2 + 2 * i: 4 + 2 * i] for i, nm in enumerate(names)}

def seg_angle(distal, proximal):
    d = M[proximal] - M[distal]
    return np.degrees(np.unwrap(np.arctan2(d[:, 1], d[:, 0])))

leg_fib  = seg_angle("ankle", "fibula")
leg_knee = seg_angle("ankle", "knee")
foot_mt5 = seg_angle("mt5", "heel")
foot_toe = seg_angle("toe", "heel")

ankle_ref = foot_mt5 - leg_fib - 90            # 이 레슨의 기준 정의(DF +)
ankle_alt = foot_toe - leg_knee - 90           # 마커를 바꾼 정의
diff = ankle_alt - ankle_ref
print("마커를 바꾸면 발목각이 평균 %+.1f° 이동 (범위 %+.1f ~ %+.1f°)" % (diff.mean(), diff.min(), diff.max()))

ankle_text = leg_fib - foot_mt5 + 90           # [Wi] 본문 3.6.2 식의 부호(PF +)
print("본문 식(PF +)과 이 레슨 정의(DF +)의 합 = %.1f (항상 0이면 부호만 반대)" % np.abs(ankle_text + ankle_ref).max())
```

실행 결과:

```text
마커를 바꾸면 발목각이 평균 +4.3° 이동 (범위 -3.2 ~ +9.8°)
본문 식(PF +)과 이 레슨 정의(DF +)의 합 = 0.0 (항상 0이면 부호만 반대)
```

마커를 knee와 toe로 바꾸면 발목각이 평균 4° 남짓 움직이는데, 이동량이 일정하지 않고 −3°에서 +10°까지 출렁입니다. 단순히 곡선 전체를 위아래로 옮기는 상수 차이가 아니라는 뜻입니다. 무릎 마커는 무릎 관절 자체의 움직임을, toe 마커는 발가락 관절의 꺾임을 함께 담기 때문입니다. 반면 본문 식과 이 레슨 식은 정확히 부호만 반대입니다. **어느 마커로 어느 부호를 썼는지 그림 옆에 한 줄로 적어야** 다른 자료와 비교할 수 있습니다.

## 직접 해보기

1. `notebooks/advanced/I/I3_joint_angles.ipynb`에서 예시 1–2를 실행하고, 출력이 위와 같은지 확인합니다. 그림을 `figures/advanced/I/I3_joint_angles.png`로 저장합니다.
2. 그림 위에 Perry의 phase 경계(12, 31, 50, 62, 75, 87% GC)를 세로 점선으로 더하고, 무릎의 두 봉우리와 발목의 네 호가 각각 어느 phase에 있는지 표시합니다.
3. 무릎과 발목 그림을 따로 저장해 **그림 2장**을 만듭니다(`I3_knee.png`, `I3_ankle.png`). 각 그림 제목 아래에 마커 정의와 부호 규약을 한 줄로 적습니다.
4. 예시 1의 비교표를 노트북에 마크다운으로 옮기고, "차이가 나는 이유" 열에 속도, 2D/3D, 마커 정의, 필터 유무 중 무엇이 원인일 수 있는지 적습니다.
5. (도전) heel 마커의 수직 좌표(y)가 가장 낮아지는 시점을 찾아 heel contact 후보를 자동으로 고르고, 부록이 표시한 frame 28, 97과 몇 frame 차이가 나는지 확인합니다. 운동학으로 사건을 찾는 방법은 Day I12에서 본격적으로 다룹니다.

> ⚠️ **흔한 오류 1:** `np.arctan(dy/dx)`를 쓰는 실수입니다. 분절이 수직에 가까우면 dx ≈ 0이라 값이 불안정하고, 사분면을 구분하지 못해 180°가 틀립니다. 항상 `np.arctan2(dy, dx)`를 쓰고, 미분하기 전에 `np.unwrap`으로 ±180° 경계의 점프를 없앱니다.
>
> ⚠️ **흔한 오류 2:** BMC 노트북은 stride를 **toe-off에서 toe-off까지**(frame 1–70)로 자릅니다. 이것을 그대로 0–100%로 놓으면 Perry의 %GC(IC 기준)와 약 60% 어긋납니다. 오늘처럼 heel contact(frame 28 → 97)로 다시 잘라야 phase 비교가 됩니다.

## 퀴즈

**1.** 분절각과 관절각의 차이를 한 문장씩 설명하라.

<details><summary>정답 보기</summary>

분절각은 분절 하나가 전역 기준(예: 앞쪽 수평선)과 이루는 절대각이고, 관절각은 이웃한 두 분절 사이의 상대각(두 분절각의 차)입니다. 대퇴 분절각만으로는 고관절각을 알 수 없습니다. 골반의 기울기가 빠지기 때문입니다.

</details>

**2.** 어떤 논문은 IC의 고관절 굴곡을 20°, 다른 논문은 30°로 보고한다. 둘 다 맞을 수 있는 이유는?

<details><summary>정답 보기</summary>

20°는 수직선 기준 thigh 각, 30°는 골반 기준 hip 각일 수 있습니다. 두 정의의 차이는 평균 약 10°의 골반 전방경사입니다. 어느 기준인지 적혀 있지 않은 수치는 비교할 수 없습니다.

</details>

**3.** 이 레슨의 발목 규약에서 toe-off 무렵 −24.8°는 무엇을 뜻하는가? Winter 교재 본문 식(3.6.2절)으로 계산하면 같은 순간의 값은?

<details><summary>정답 보기</summary>

24.8° 족저굴곡입니다(이 레슨은 배측굴곡 +). 본문 식은 족저굴곡을 +로 두므로 +24.8°가 됩니다. 두 식은 부호만 반대입니다.

</details>

**4.** 정상 보행에서 무릎 굴곡 봉우리는 몇 번이며, 각각의 기능은?

<details><summary>정답 보기</summary>

두 번입니다. LR 끝(약 12% GC)의 작은 봉우리(약 20°)는 착지 충격 흡수, ISw 끝의 큰 봉우리(약 60°)는 swing 중 발끝이 바닥에 끌리지 않게 하는 clearance용입니다.

</details>

**5.** 오늘 계산한 무릎 최대 굴곡(67.8°)이 Perry의 약 60°보다 크다. 이 차이로 "이 사람의 무릎이 비정상"이라고 말할 수 없는 이유 두 가지는?

<details><summary>정답 보기</summary>

(1) 측정 체계가 다릅니다. Perry는 3D 자료를 5° 단위로 반올림한 평균이고, 이 자료는 2D 마커 좌표이며 필터도 거치지 않았습니다(2D 자료는 70° 안팎을 보고하기도 함). (2) 속도가 다릅니다. 이 사람은 cadence가 평균보다 빠르고, 속도는 관절 각도의 크기를 바꿉니다. 게다가 한 사람·한 시행이라 정상 범위와 비교할 근거가 없습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–2를 실행하고 출력이 레슨과 같다.
- [ ] `figures/advanced/I/I3_joint_angles.png`와 무릎·발목 그림 2장을 저장했다(그림마다 마커 정의와 부호 규약 한 줄).
- [ ] Perry 특징점 비교표와 "차이가 나는 이유" 열을 채웠다.
- [ ] 데이터 출처(BMC v0.2.0, CC BY 4.0, 원전 Winter Table A.1)를 노트북 첫 셀에 적었다.

## 더 읽을거리
- [Wi] Thomas, Zeni & Winter, 5th ed., Wiley, 2023 — 3.1절(pp.35–36), 3.6절(pp.62–64), 부록 A(pp.295–350; Table A.1·A.4).
- [P] Perry & Burnfield, 2nd ed., 2010 — 4장 Ankle-Foot Complex, 5장 Knee, 6장 Hip, 7장 Head, Trunk, and Pelvis의 앞부분, Appendix A Normative Joint Motion.
- [W] Richards & Levine, eds., 6th ed., 2023 — 2장 Overview of the Gait Cycle(pp.21–24).
- [RM] Robertson DGE, Caldwell GE, Hamill J, Kamen G, Whittlesey SN. *Research Methods in Biomechanics*, 2nd ed. Human Kinetics, 2014 — 1장 Angular Kinematics(pp.24–32).
- [BMC] `kinematics_angular_2d` 노트북: <https://bmclab.github.io/BMC/notebooks_html/kinematics_angular_2d.html>
- 이론 노트: [T02 — 운동학](../I-gait-theory/note-T02.md)

---
[← 이전](day-I2.md) · [코스 지도](../../../README.md) · [다음 →](day-I4.md)
