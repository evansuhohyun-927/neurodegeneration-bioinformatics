# Day I4 — 운동역학: 지면반력, 관절 모멘트, 파워

> **주차:** 심화 파트 I — 보행분석 (1주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I4_vgrf.ipynb`, `figures/advanced/I/I4_vgrf.png`(F1·F2·F3 표시)
>
> **먼저 끝내 둘 레슨:** [Day 24 — PhysioNet 데이터 구조](../../week-4/day-24.md)(gaitpdb 19열 구조), [Day 26 — feature 추출](../../week-4/day-26.md)(20 N threshold로 stance 찾기), [Day I1](day-I1.md)–[Day I3](day-I3.md).
>
> **이론 노트:** [T03 — 운동역학과 역동역학](../I-gait-theory/note-T03.md)에서 2D 역동역학 전 과정, 관절 반력과 접촉력의 차이, 외골격이 만드는 닫힌 사슬을 다룹니다.

## 오늘의 목표
- link-segment model과 free-body diagram으로 관절의 순 힘(net force)과 순 모멘트(net moment)를 구하는 순서를 설명하고, 정지한 발 하나로 직접 계산할 수 있다.
- 수직 지면반력의 두 봉우리(F1, F3)와 골짜기(F2)를 phase와 연결하고, 내부 모멘트(Winter)와 외부 모멘트·GRF 벡터(Perry, Whittle)를 서로 바꿔 읽을 수 있다.
- joint power의 부호로 관절의 에너지 생성·흡수를 판정하되, 그것을 근섬유의 수축 형태로 단정하면 안 되는 경우를 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [Biomechanics of Movement | Lecture 2.2: The Walking Gait Cycle and Ground Reaction Forces — Biomechanics of Movement](https://www.youtube.com/watch?v=LAOS8I6dFy4) (13:04)
- **무엇에 주목할까:** 수직 성분이 왜 체중보다 커졌다 작아졌다 하는지, 전후 성분이 언제 뒤로(제동) 언제 앞으로(추진) 향하는지 보세요. 영상이 힘의 방향을 "발이 바닥을 미는 힘"으로 말하는지 "바닥이 발을 미는 힘"으로 말하는지도 확인하세요. 오늘 계속 문제가 되는 것이 바로 이 기준입니다.

- [Biomechanics of Movement | Lecture 8.1: Inverse Dynamics: What is a Joint Moment? — Biomechanics of Movement](https://www.youtube.com/watch?v=zrsQIGK7Gys) (4:02)
- **무엇에 주목할까:** 관절 모멘트가 "근육 하나의 힘"이 아니라 관절을 지나는 모든 조직이 만든 회전 효과의 **순합**이라는 점에 주목하세요.

## 개념 설명

### link-segment model: 몸을 막대 사슬로 보고 아래에서 위로 푼다

근육의 힘을 몸 밖에서 직접 재는 방법은 없습니다. 그래서 관절 위치의 움직임(운동학), 바닥이 발을 미는 힘(지면반력, GRF), 분절의 질량·질량중심·관성모멘트(인체계측)를 재고, 뉴턴의 운동 법칙을 거꾸로 풀어 관절에 걸린 힘과 모멘트를 계산합니다. 이것이 **역동역학(inverse dynamics)** 입니다. 계산을 위해 몸을 **link-segment model**로 단순화합니다. 각 분절의 질량은 질량중심 한 점에 있고, 그 위치와 관성모멘트·길이는 변하지 않으며, 관절은 경첩이라고 가정합니다([Wi] 5.0절 pp.89–92). 분절의 질량과 관성 값은 시신 연구에서 얻은 비율표를 개인의 체중·분절 길이에 맞춰 씁니다([RM] 3장 pp.63–78).

분절 하나를 떼어 내 그 분절에 작용하는 힘과 모멘트를 모두 그린 그림이 **free-body diagram(FBD, 자유물체도)** 입니다. 발에는 중력, 바닥의 GRF(압력중심 COP 한 점에 작용하는 화살표 하나), 그리고 발목에서 다리가 발에 주는 힘과 모멘트가 작용합니다. 미지수는 발목의 힘과 모멘트뿐이므로 ΣF = m·a, ΣM = I·α 세 식으로 풀립니다. 그 답을 뒤집어(작용·반작용) 다리 분절의 아래쪽 입력으로 넣고, 다시 무릎을, 이어서 고관절을 풉니다. **발 → 다리 → 대퇴** 순서인 이유는 바닥 쪽 끝의 힘만 측정되기 때문입니다([Wi] 5.1절, [RM] 5장). 이렇게 얻은 관절의 순 힘은 관절면이 실제로 받는 **접촉력이 아닙니다**. 근육이 관절을 가로질러 당기는 힘이 모두 상쇄된 뒤의 값이라, 근육이 세게 당길수록 실제 관절면 압박은 이 값보다 훨씬 커집니다([Wi] 5.0절 pp.91–92).

### 지면반력: 몸 전체의 가속도계

force plate가 재는 힘은 발에서 나오지만, 그 크기는 **몸 전체의 질량 × (가속도 + 중력)의 합**입니다(F = Σm(a + g), [Wi] 5.2절 p.101). 그래서 Whittle은 force plate를 "몸 전체의 가속도계"라고 부릅니다([W] 4장 p.80). 가만히 서 있으면 체중과 같고, 몸의 질량중심이 위로 가속되면 체중보다 커지고, 아래로 가속되면 작아집니다. 일정한 속도로 오래 걸으면 수직 가속도의 평균은 0이므로, **긴 기록에서 두 발 힘의 평균은 체중과 같아야** 합니다. 오늘 실제 데이터로 이 점을 점검합니다.

수직 GRF는 stance 동안 봉우리 두 개와 골짜기 하나를 그립니다. Perry는 이를 **F1**(LR 끝, 약 12% GC), **F2**(MSt의 골짜기), **F3**(TSt 후반)라고 부르고, 82 m/min에서 봉우리는 체중의 약 110%, 골짜기는 약 80%라고 정리합니다([P] 22장). F1은 체중이 실리며 위로 감속하는 몸을 받는 힘, F2는 몸이 지지 다리 위로 넘어가며 질량중심이 위로 올라가 아래 방향 가속이 생기는 구간, F3는 forefoot rocker 너머로 떨어지는 몸을 받고 밀어내는 힘입니다. **속도가 느리면 봉우리가 낮고 골짜기가 얕아져**, 60 m/min 정도의 느린 걸음에서는 체중 수준의 평평한 고원(plateau)이 됩니다(같은 장). 착지 직후 1–2% GC 동안 생기는 짧은 충격(heel transient)은 100–200 Hz 이상의 응답이 있어야 보입니다([P] Introduction). 전후 성분은 stance 앞쪽에서 뒤로 향해 몸을 감속(제동)하고, 뒤쪽에서 앞으로 향해 가속(추진)합니다([W] 2장 pp.34–36). Perry 본문은 "발이 바닥에 가하는 힘"의 방향으로 서술하므로, GRF 기준 그림과 비교할 때 방향을 뒤집어 읽어야 합니다.

**COP와 COM은 다릅니다.** COM(질량중심)은 몸의 질량 분포로 정해지는 운동학적 점이고, COP(압력중심)는 GRF 벡터가 바닥과 만나는 점으로, 발목 근육이 조절하는 **운동역학적·제어적** 양입니다. 서 있을 때 COP는 COM을 따라다니지만 더 크게 움직이며 COM을 되돌려 놓습니다([Wi] 5.2.5절 pp.107–108). "COP는 COM의 수직 투영"이라는 문장은 틀린 문장입니다.

### 내부 모멘트와 외부 모멘트: 같은 사건, 반대 관점

같은 순간을 두 교재가 반대 말로 설명합니다. **Perry(그리고 Whittle의 벡터 설명)** 는 GRF 벡터가 관절의 앞이나 뒤를 지나면서 관절을 꺾으려는 **외부 모멘트**를 "요구(demand)"로 읽고, 그에 맞서는 근육·인대를 "반응(response)"으로 찾습니다([P] 22장). **Winter** 는 역동역학으로 계산한 **내부(근육) 순모멘트**를 그립니다([Wi] 5.2.4절). LR의 무릎이라면 Perry는 "벡터가 무릎 뒤로 지나 굴곡 요구", Winter는 "무릎 신전 모멘트"라고 씁니다. 같은 사건입니다.

| 상황 | 외부 모멘트(Perry·Whittle의 벡터) | 내부 모멘트(Winter 곡선) | 일하는 쪽 |
|---|---|---|---|
| LR의 무릎 | 벡터가 무릎 뒤 → 외부 굴곡 모멘트 | 무릎 신전 모멘트 | vastii |
| TSt의 발목 | 벡터가 발목 앞 멀리 → 외부 배측굴곡 모멘트 | 족저굴곡 모멘트 | 가자미근·비복근 |
| TSt의 고관절 | 벡터가 고관절 뒤 → 외부 신전 모멘트 | 고관절 굴곡 모멘트 | 근육보다 앞쪽 인대의 수동 긴장 |

벡터만 보고 모멘트를 어림하는 방법은 아래 분절의 무게와 가속을 무시하는 근사입니다. 발목에서는 꽤 맞지만 고관절로 갈수록, 그리고 swing에서는 틀립니다([W] 2장 p.25). Winter는 세 관절의 신전 모멘트를 더한 **support moment**도 씁니다. 관절 하나하나의 모멘트는 걸음마다 크게 달라도 그 합은 single stance 내내 안정적으로 양수라서, 신경계가 "다리 전체의 지지"를 조절한다는 해석으로 이어집니다([Wi] 11.1절 pp.236–239). 이 개념은 Perry에는 없는 Winter의 개념입니다.

**joint power** = 관절 모멘트 × 관절 각속도입니다. 모멘트의 방향과 관절이 움직이는 방향이 같으면 양(+), 즉 관절이 에너지를 **생성**하고(흔히 구심성), 반대면 음(−), 즉 에너지를 **흡수**합니다(흔히 원심성)([Wi] 6.0.4–6.0.6절 pp.118–119, [RM] 6장 pp.141–146). 그러나 Perry는 이 부호로 근섬유의 수축 형태를 **단정하지 말라**고 강조합니다. 인대·근막의 수동 긴장도 모멘트와 파워를 만들고(앞 표의 TSt 고관절), PSw의 가장 큰 발목 파워는 근전도가 이미 꺼진 뒤 아킬레스건이 되튀며 나오는 탄성 반동으로 설명됩니다([P] 22장, Introduction). 길항근이 함께 수축하면 순 모멘트가 작아져 실제 일이 감춰지기도 합니다([Wi] 6.3절). 그래서 "**관절(근건 단위)이 에너지를 흡수·생성한다**"까지가 안전한 해석입니다.

## 예시로 이해하기

### 예시 1 — 한 발로 정지해 선 사람의 발목 모멘트 (가상 숫자)

```python
import numpy as np

# 정지 상태에서 한 발로 선 사람의 발 분절 자유물체도 (가상 숫자)
# 좌표: x = 앞(+), y = 위(+), 반시계 모멘트 = +.  원점 = 발목 관절 중심
g = 9.81
m_body, m_foot = 60.0, 0.9            # kg
grf = np.array([0.0, m_body * g])     # 지면이 발을 미는 힘(N). 정지 → 체중과 같다
r_cop = np.array([0.04, -0.07])       # COP: 발목보다 4 cm 앞, 7 cm 아래(바닥)
r_com = np.array([0.025, -0.04])      # 발 질량중심

def cross2(r, f):                     # 2D 외적의 z 성분 = r_x F_y − r_y F_x
    return r[0] * f[1] - r[1] * f[0]

# 정지: ΣF = 0, 발목 기준 ΣM = 0  →  발목이 발에 주는 힘 F_a와 모멘트 M_a
F_a = -grf - np.array([0.0, -m_foot * g])
M_a = -(cross2(r_cop, grf) + cross2(r_com, np.array([0.0, -m_foot * g])))
print("발목 반력(다리가 발에 주는 힘) = (%.1f, %.1f) N" % tuple(F_a))
print("발목 내부 모멘트 = %.1f N·m  →  %s" % (M_a, "시계 방향 = 족저굴곡근(plantarflexor) 모멘트" if M_a < 0 else "반시계 = 배측굴곡근 모멘트"))
print("체중으로 나누면 %.2f N·m/kg" % (abs(M_a) / m_body))
print("외부 모멘트(지면반력이 발목에 만드는 것) = %.1f N·m → 발목을 배측굴곡시키려는 '요구'" % cross2(r_cop, grf))
```

실행 결과:

```text
발목 반력(다리가 발에 주는 힘) = (-0.0, -579.8) N
발목 내부 모멘트 = -23.3 N·m  →  시계 방향 = 족저굴곡근(plantarflexor) 모멘트
체중으로 나누면 0.39 N·m/kg
외부 모멘트(지면반력이 발목에 만드는 것) = 23.5 N·m → 발목을 배측굴곡시키려는 '요구'
```

COP가 발목보다 앞에 있으면 바닥의 힘이 발끝을 들어 올리려 합니다(외부 배측굴곡 모멘트, Perry의 "요구"). 종아리 근육이 반대 방향의 내부 모멘트로 버팁니다(Winter의 "족저굴곡 모멘트"). 두 숫자가 23.5와 23.3으로 조금 다른 것은 발 자체의 무게가 만든 모멘트 때문입니다. 벡터만으로 어림하는 방법이 무엇을 빼먹는지 보여 주는 작은 예입니다. 발목 반력이 −579.8 N(아래 방향)인 것은 다리가 발을 누른다는 뜻이고, 실제 관절면 압박은 종아리 근육의 당김까지 더해져 이보다 큽니다.

### 예시 2 — 파워 부호 읽기 (가상 숫자, 손 계산)

| 순간 | 모멘트 방향 | 관절이 움직이는 방향 | 파워 | 해석 |
|---|---|---|---|---|
| LR의 무릎 | 신전 0.5 N·m/kg | 굴곡 중, 3 rad/s | 0.5 × 3 = 1.5 W/kg, 방향이 반대이므로 **−1.5 W/kg** | 무릎이 에너지를 흡수(신전근이 늘어나며 제동) |
| PSw의 발목 | 족저굴곡 1.2 N·m/kg | 족저굴곡 중, 4 rad/s | 방향이 같으므로 **+4.8 W/kg** | 발목이 에너지를 생성. 단, Perry는 이 대부분이 건의 탄성 반동이라고 본다 |
| 정지 서기 | 족저굴곡 0.4 N·m/kg | 움직임 없음, 0 rad/s | **0** | 모멘트가 커도 각속도가 0이면 파워는 0(등척성) |

부호 규약(시계/반시계, 굴곡/신전 중 무엇이 +인가)은 교재마다 다르지만, "모멘트와 각속도가 같은 방향이면 생성, 반대면 흡수"라는 규칙은 어떤 규약에서도 같습니다.

### 예시 3 — 실제 데이터: gaitpdb 깔창 센서의 수직 지면반력

> **데이터:** Hausdorff JM. *Gait in Parkinson's Disease* (v1.0.0). PhysioNet; 2008. [doi:10.13026/C24H3N](https://doi.org/10.13026/C24H3N). 라이선스 Open Data Commons Attribution License v1.0. PhysioNet 표준 인용: Pollard T, et al. PhysioNet as a global platform for biomedical research. *Nature Health* (2026). [doi:10.1038/s44360-026-00096-z](https://doi.org/10.1038/s44360-026-00096-z). 신호 파일은 19열(1열 시간, 18열 왼발 8개 센서 합, 19열 오른발 합, 단위 N, 100 Hz)입니다.
>
> ```bash
> mkdir -p data/gaitpdb && cd data/gaitpdb
> curl -O https://physionet.org/files/gaitpdb/1.0.0/GaCo15_01.txt
> curl -O https://physionet.org/files/gaitpdb/1.0.0/GaCo01_01.txt
> curl -O https://physionet.org/files/gaitpdb/1.0.0/demographics.txt
> cd ../..
> ```

```python
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.signal import find_peaks

fs = 100                                                     # gaitpdb 표본화(Hz)
demo = pd.read_csv("data/gaitpdb/demographics.txt", sep="\t", usecols=range(20)).set_index("ID")

def stances(force, thr=20):
    """force > thr 인 연속 구간의 시작·끝 표본 번호(완전한 구간만)"""
    on = (force > thr).astype(int)
    st = np.flatnonzero(np.diff(on) == 1) + 1
    en = np.flatnonzero(np.diff(on) == -1) + 1
    st = st[st < en[-1]]
    en = en[np.searchsorted(en, st[0]):][: len(st)]
    return st, en

def stance_curves(force, bw, trim=5):
    st, en = stances(force)
    stance_pct = np.median((en - st)[:-1] / np.diff(st))     # stance가 주기의 몇 %인가
    grid = np.linspace(0, 100, 101)
    curves = np.array([np.interp(grid, np.linspace(0, 100, e - s), force[s:e] / bw)
                       for s, e in zip(st[trim:-trim], en[trim:-trim])])   # 앞뒤 5개는 버림(가속·감속)
    return grid * stance_pct, curves                          # 가로축을 %GC로

sid = "GaCo15"                                                # 대조군 한 명, walk 01(평소 걷기)
x = np.loadtxt(f"data/gaitpdb/{sid}_01.txt")
bw = demo.loc[sid, "Weight"] * 9.81
print("%s: 평소 속도 %.2f m/s, 체중 %.0f N, 기록 %.0f s" % (sid, demo.loc[sid, "Speed_01"], bw, len(x) / fs))
print("점검: 두 발 합의 평균 / 체중 = %.2f  (힘판이라면 1.00에 가까워야 한다)" % (x[:, 17:19].sum(axis=1).mean() / bw))

fig, ax = plt.subplots(figsize=(6.5, 3.6))
for col, side, color in [(17, "left", "tab:blue"), (18, "right", "tab:orange")]:
    gc, C = stance_curves(x[:, col], bw)
    m = C.mean(axis=0)
    pk, _ = find_peaks(m, prominence=0.05)
    f1, f3 = pk[0], pk[-1]
    f2 = f1 + np.argmin(m[f1:f3 + 1])
    print("%-5s n=%d  F1 %.2f BW @%2.0f%%GC | F2 %.2f BW @%2.0f%%GC | F3 %.2f BW @%2.0f%%GC | stance 끝 %2.0f%%GC"
          % (side, len(C), m[f1], gc[f1], m[f2], gc[f2], m[f3], gc[f3], gc[-1]))
    ax.plot(gc, m, color=color, lw=2, label=side)
    for name, i in [("F1", f1), ("F2", f2), ("F3", f3)]:
        ax.annotate(name, (gc[i], m[i]), textcoords="offset points", xytext=(0, 6), ha="center", color=color)
ax.axhline(1, color="k", ls=":", lw=1)
ax.set_xlabel("% gait cycle (initial contact = 0)")
ax.set_ylabel("insole vertical force / body weight")
ax.set_title("gaitpdb v1.0.0, one control, usual walk (mean of stances)")
ax.legend()
out = Path("figures/advanced/I/I4_vgrf.png")
out.parent.mkdir(parents=True, exist_ok=True)
fig.tight_layout(); fig.savefig(out, dpi=150)
print("저장:", out)
```

실행 결과(그림은 `figures/advanced/I/I4_vgrf.png`):

```text
GaCo15: 평소 속도 1.34 m/s, 체중 687 N, 기록 121 s
점검: 두 발 합의 평균 / 체중 = 1.29  (힘판이라면 1.00에 가까워야 한다)
left  n=104  F1 1.28 BW @14%GC | F2 0.94 BW @29%GC | F3 1.40 BW @45%GC | stance 끝 63%GC
right n=104  F1 1.31 BW @15%GC | F2 1.03 BW @28%GC | F3 1.40 BW @48%GC | stance 끝 62%GC
저장: figures/advanced/I/I4_vgrf.png
```

봉우리의 **시점**은 교과서와 잘 맞습니다. F1은 14–15% GC(Perry의 LR 끝 약 12%), F2는 28–29% GC(MSt), F3는 45–48% GC(TSt 후반)이고, stance는 62–63% GC에서 끝납니다. 그런데 **크기**는 그렇지 않습니다. 두 발 합의 평균이 체중의 1.29배입니다. 오래 걸은 기록이라면 1.00에 가까워야 하므로, 이 깔창 센서의 합은 force plate처럼 체중에 맞게 보정된 값이 아닙니다. 게다가 깔창 센서는 발바닥 8곳의 **수직** 힘만 재고, 좌표계가 발과 함께 움직이며, 센서 사이 빈 곳의 힘은 놓칩니다([W] 4장 p.80). 그래서 이 그림에서 "봉우리가 체중의 1.3–1.4배"라고 읽으면 안 됩니다. 이 그림으로 말할 수 있는 것은 **모양과 시점**이고, 크기를 비교하려면 사람마다 보정 계수(평균 ÷ 체중)가 다르다는 점부터 확인해야 합니다. 이 자료로는 전후 성분, COP, 관절 모멘트·파워를 계산할 수 없습니다.

## 직접 해보기

1. `notebooks/advanced/I/I4_vgrf.ipynb`에서 예시 1·3을 실행하고 출력이 같은지 확인합니다. 예시 2의 표는 직접 손으로 계산해 봅니다.
2. 예시 1에서 COP를 발목 **뒤** 2 cm(`r_cop = [-0.02, -0.07]`)로 옮기면 내부 모멘트의 부호와 이름이 어떻게 바뀌는지 확인합니다. 보행의 어느 phase와 닮았는지(힌트: IC 직후) 적습니다.
3. `figures/advanced/I/I4_vgrf.png`에 Perry phase 경계(2, 12, 31, 50, 62% GC)를 세로 점선으로 추가하고, F1·F2·F3가 각각 어느 phase에 있는지 표로 정리합니다.
4. 예시 3에서 `sid = "GaCo01"`(평소 속도 1.07 m/s인 다른 대조군)로 바꿔 다시 실행합니다(그림 이름도 바꿉니다). 이 사람의 왼발에서는 봉우리가 하나만 잡혀 F1·F2·F3가 같은 점(14% GC)으로 나옵니다. 오른발은 F2 골짜기가 얕습니다(1.26 → 1.14 → 1.24 BW). 이 차이를 Perry의 "느린 걸음에서는 고원" 서술과 깔창 센서의 한계 중 무엇으로 설명할 수 있는지, 둘 다인지 두세 문장으로 씁니다. 사람 둘을 비교한 것이므로 "속도 때문"이라고 단정하지 않습니다.
5. "두 발 합의 평균 / 체중"을 두 사람에서 비교하고(1.29, 1.33), 체중 대신 이 평균으로 나누면 그림이 어떻게 달라지는지 그려 봅니다. 보고서에 어느 정규화를 썼는지 한 줄로 적습니다.

> ⚠️ **흔한 오류 1:** `find_peaks`가 봉우리를 하나만 찾았는데 코드가 그대로 진행해 F1 = F3로 출력되는 경우입니다. 숫자만 보지 말고 반드시 그림으로 확인하고, 봉우리 수가 2가 아니면 "이 사람·이 센서에서는 이중 봉우리가 뚜렷하지 않다"고 기록합니다.
>
> ⚠️ **흔한 오류 2:** demographics의 `Weight` 단위(kg)를 N으로 바꾸지 않고 나누는 실수입니다. 체중(N) = kg × 9.81입니다. 또 `demographics.txt`는 줄 끝 빈칸 때문에 그냥 읽으면 오류가 나므로 앞 20열만 읽습니다([Day 25](../../week-4/day-25.md)).

## 퀴즈

**1.** 역동역학에서 발 → 다리 → 대퇴 순서로 계산하는 이유는?

<details><summary>정답 보기</summary>

미지수를 풀려면 분절 한쪽 끝의 힘을 알아야 하는데, 측정되는 것은 바닥 쪽 끝의 GRF뿐이기 때문입니다. 발의 발목 힘·모멘트를 구한 뒤, 그 반작용을 다리의 아래쪽 입력으로 넣어 위로 올라갑니다.

</details>

**2.** 긴 걷기 기록에서 두 발 수직력의 평균이 체중과 같아야 하는 물리적 이유는?

<details><summary>정답 보기</summary>

GRF = 몸 전체의 질량 × (수직 가속도 + g)입니다. 일정한 속도로 오래 걸으면 질량중심의 수직 가속도는 평균 0이므로 평균 힘은 m·g, 즉 체중이 됩니다. 평균이 체중과 크게 다르면 센서 보정이나 단위를 의심합니다.

</details>

**3.** "외부 무릎 굴곡 모멘트"와 같은 사건을 Winter 방식으로 부르면?

<details><summary>정답 보기</summary>

내부 무릎 신전 모멘트입니다. GRF 벡터가 무릎 뒤를 지나 무릎을 굽히려는 외부 요구에 신전근이 맞서는 상황을, 관점만 바꿔 부른 것입니다.

</details>

**4.** 무릎 모멘트가 신전 방향인데 무릎이 굽혀지고 있다. 파워의 부호와 해석은?

<details><summary>정답 보기</summary>

모멘트와 각속도의 방향이 반대이므로 파워는 음(−), 관절이 에너지를 흡수합니다. 흔히 신전근의 원심성 작용으로 읽지만, 수동 조직의 기여 가능성까지 열어 두는 것이 안전합니다.

</details>

**5.** PSw의 큰 양(+)의 발목 파워를 "종아리 근육이 강하게 구심성 수축한 증거"라고 단정하면 안 되는 이유는?

<details><summary>정답 보기</summary>

Perry는 이 시기에 종아리 근육의 근전도가 이미 꺼져 있고, TSt에서 늘어난 아킬레스건이 되튀는 탄성 반동이 파워의 주된 출처라고 설명합니다. 파워의 부호는 관절(근건 단위)의 에너지 흐름을 말할 뿐, 근섬유의 길이 변화를 직접 말하지 않습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1·3을 실행하고 출력이 레슨과 같다. 예시 2를 손으로 계산했다.
- [ ] `figures/advanced/I/I4_vgrf.png`에 F1·F2·F3와 phase 경계를 표시했다.
- [ ] 다른 대조군(GaCo01)과 비교하고, 속도와 센서 한계에 대한 해석을 단정 없이 적었다.
- [ ] 노트북 첫 셀에 데이터 출처(gaitpdb v1.0.0, ODC-By 1.0, DOI)와 정규화 방법을 적었다.

## 더 읽을거리
- [Wi] Thomas, Zeni & Winter, 5th ed., 2023 — 5.0–5.1절(pp.89–97), 5.2절(pp.98–108), 6.0.4–6.0.6절(pp.118–119), 7.4.4절(p.167), 11.1절(pp.236–239).
- [W] Richards & Levine, eds., 6th ed., 2023 — 1장 Biomechanics(pp.9–12, 내부·외부 모멘트), 2장 Ground Reaction Forces(pp.34–36), 4장 Measuring Force and Pressure(pp.78–82).
- [P] Perry & Burnfield, 2nd ed., 2010 — 22장 Kinetics of Gait: Ground Reaction Forces, Vectors, Moments, Power, and Pressure.
- [RM] Robertson et al., 2nd ed., 2014 — 3장 Body Segment Parameters(pp.63–78), 4장 Forces and Their Measurement(pp.79–108), 5장 Two-Dimensional Inverse Dynamics(pp.109–129), 6장 Joint Power Analysis(pp.141–146).
- [BMC] `free_body_diagram`: <https://bmclab.github.io/BMC/notebooks_html/free_body_diagram.html>. 같은 저장소의 `gait_analysis_2d`는 역동역학 계산 순서를 보여 주지만 예제 자료가 걷기가 아니라 **달리기 시뮬레이션**이고 joint power는 다루지 않는다는 점을 알고 읽으세요.
- 이론 노트: [T03 — 운동역학과 역동역학](../I-gait-theory/note-T03.md)

---
[← 이전](day-I3.md) · [코스 지도](../../../README.md) · [다음 →](day-I5.md)
