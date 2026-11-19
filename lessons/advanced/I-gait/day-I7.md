# Day I7 — 보행의 신경 조절과 이중과제 비용 + 1주차 정리

> **주차:** 심화 파트 I — 보행분석 (1주차) · **예상 시간:** 90분 · **산출물:** `reports/advanced/I/I7_neural_map.png`, `notebooks/advanced/I/I7_dual_task.ipynb`
>
> **먼저 끝내 둘 레슨:** [Day 24 — PhysioNet 데이터 구조](../../week-4/day-24.md)와 [Day 25](../../week-4/day-25.md)(`demographics.txt` 읽기), [Day I1](day-I1.md)–[Day I6](day-I6.md).
>
> **이론 노트:** [T06 — 보행의 신경 조절](../I-gait-theory/note-T06.md)에서 척수–뇌간–기저핵–소뇌–피질의 역할과 파킨슨병의 네트워크 변화를 깊게 다룹니다.

## 오늘의 목표
- 척수 locomotor network, 뇌간(MLR·망상척수로), 기저핵, 소뇌, 피질이 보행에서 맡는 역할을 한 장의 지도로 그릴 수 있다.
- automaticity(자동 조절)와 executive control(집행 조절)을 구분하고, 이중과제 비용(dual-task cost)을 계산하고 그 해석의 한계를 말할 수 있다.
- 1주차의 이론(phase, rocker, GRF, power, EMG, 역진자, 신경 조절)을 하나의 질문, "몸은 무엇으로 앞으로 가고 신경계는 그것을 어떻게 자동으로 유지하는가"에 묶어 답할 수 있다.

## 🎬 영상으로 먼저 보기

- [17.6 Central Pattern Generators — UChicago Online](https://www.youtube.com/watch?v=KmGEBRz-GTY) (10:22)
- **무엇에 주목할까:** 리듬을 만드는 회로(CPG)가 뇌의 명령 없이도 리듬을 낼 수 있다는 실험 논리를 따라가 보세요. 그리고 그 리듬을 "켜고 속도를 정하는" 위쪽 신호가 무엇인지 메모하세요. 오늘 지도에서 뇌간 MLR이 그 자리에 들어갑니다.

- [Dual task training in Parkinson's — Parkinson's Europe](https://www.youtube.com/watch?v=DFTiRpqxR-Q) (21:20)
- **무엇에 주목할까:** 걸으면서 다른 일을 할 때 왜 파킨슨병 환자의 걸음이 더 흐트러지는지, 그리고 훈련이 무엇을 겨냥하는지 들어 보세요. 영상의 설명을 오늘 배우는 automaticity 개념과 짝지어 보되, 치료 효과에 대한 주장은 근거 문헌을 따로 확인해야 하는 정보로 표시해 둡니다.

## 개념 설명

### 걷기를 만드는 층: 척수에서 피질까지

Takakusaki(2017)는 자세와 보행의 조절을 **자동 과정**과 **인지 과정**으로 나눠 정리합니다.

- **척수**: 좌우 다리를 번갈아 움직이는 리듬은 척수의 회로(CPG, central pattern generator)가 만들고, 그 뒤 단계의 사이신경세포가 다리별 근육 패턴을 짭니다. 감각 입력은 주기 단계에 따라 효과가 뒤집힙니다. 예를 들어 발목 신전근의 부하 신호는 쉴 때는 같은 근육을 억제하지만 stance 중에는 오히려 흥분시켜, 그 근육의 부하가 빠지기 전에는 swing이 시작되지 않게 합니다. 다만 척수만으로는 자세 균형을 유지하지 못합니다.
- **뇌간**: 중뇌 보행 영역(**MLR**, mesencephalic locomotor region)이 망상척수로를 거쳐 척수 회로를 켜고 조절합니다. MLR 안에서도 쐐기핵(CNF) 자극은 주로 보행을 일으키고, 대뇌각교뇌핵(**PPN**) 자극은 근긴장을 떨어뜨리는 쪽으로 작용해, 리듬과 근긴장이 같은 계통에서 함께 조절됩니다. 동물에서는 시상밑 보행 영역과 소뇌 보행 영역도 보행을 일으킵니다.
- **기저핵**: 출력핵(흑질 그물부 SNr 등)의 GABA성 억제 출력이 MLR/PPN을 누릅니다. 파킨슨병에서는 이 억제가 지나쳐 MLR이 과도하게 억제되고, 그것이 보행 장애와 강직으로 이어질 수 있다는 것이 저자의 **가설**입니다. 저자는 사람에게 같은 기전이 그대로 적용되는지 모른다고 명시합니다.
- **소뇌**: 척수 출력의 사본과 감각 정보를 비교해 오차를 교정합니다. Winter 교재도 소뇌를 "계획한 명령과 실제 감각을 비교하는 비교기"로 설명합니다([Wi] 12.1절 pp.247–249).
- **피질**: 측두두정 연합피질이 시각·전정·체성감각을 합쳐 몸의 지도와 수직 감각을 만들고, 보조운동영역(SMA)·전운동영역이 이를 바탕으로 걸음을 떼기 전의 **예측성 자세 조절(APA)** 을 만듭니다. 피라미드로를 끊어도 평지 보행은 남지만 좁은 들보나 사다리 걷기 같은 숙련 보행은 무너집니다.

Winter 교재는 대부분의 보행이 큰 의식적 개입 없이 피질하에서 조절된다고 설명합니다([Wi] 12.1절). 한 가지 주의할 점은, 같은 교재의 CPG 위치 서술(뇌간을 주된 위치로 쓴 문장)이 위의 표준 서술(척수 회로를 뇌간이 켜고 조절)과 다르다는 것입니다. 이 레슨은 Takakusaki의 서술을 기준으로 합니다.

걸음 떼기는 신경 조절이 역학으로 드러나는 좋은 예입니다. 서 있다가 첫걸음을 내딛기 전에 압력중심(COP)이 먼저 **뒤로, 그리고 내디딜 발 쪽으로** 잠깐 움직이고, 그 결과 질량중심(COM)이 반대 방향, 즉 앞과 지지 발 쪽으로 가속됩니다([Wi] 11.3.2절 pp.242–244, [W] 2장 pp.41–42). Day I4에서 본 "COP가 COM을 넘어서야 COM을 움직일 수 있다"는 관계가 걸음 떼기에서 그대로 나타납니다.

### automaticity와 executive control, 그리고 이중과제

Clark(2015)는 보행 조절을 **자동 처리**와 **집행(주의) 처리**의 균형으로 봅니다. 자동 처리는 빠르고 병렬적이며 노력이 적고 스트레스에 강합니다. 집행 처리는 느리고 직렬적이며 노력이 많이 들고, 다른 과제와 자원을 다투며, 불안에 약합니다. 보행 장애는 이 균형이 **자동에서 보상적 집행 조절 쪽으로 옮겨 간 상태**로 볼 수 있습니다. 운전에 비유하면, 익숙한 길에서는 대화하며 운전하지만 처음 가는 복잡한 길에서는 대화를 멈추고 운전에만 집중하는 것과 같습니다.

automaticity를 직접 재는 방법은 없어서, 가장 널리 쓰는 간접 지표가 **이중과제(dual-task)** 입니다. 걷기만 할 때와 걸으면서 다른 일(예: 100에서 7씩 빼기)을 할 때의 수행 차이가 클수록 걷기가 집행 자원에 많이 기대고 있다고 해석합니다. 흔히 쓰는 정의는 다음과 같습니다.

> 이중과제 비용(%) = (평소 속도 − 이중과제 속도) / 평소 속도 × 100 (양수 = 이중과제에서 느려짐)

Clark는 이 개념을 말로 정의하고 식은 제시하지 않으므로, 위 식은 "흔히 쓰는 정의"로만 소개합니다. Clark는 해석 주의점도 짚습니다. 어느 과제를 우선하라고 지시했는지, 이차 과제의 난이도, 그 사람의 인지 능력에 따라 비용이 달라집니다. 같은 사람이 걷기를 희생할 수도, 빼기를 희생할 수도 있다는 뜻입니다.

### 파킨슨병에서 보행 네트워크는 어떻게 바뀌는가

Peterson과 Horak(2016)은 PD 보행 이상을 **지속형(continuous)** 과 **일과성(transient)** 으로 나눕니다(이 구분의 원출처로 Giladi, Horak & Hausdorff 2013을 인용). 지속형은 느림, 변동성·비대칭 증가, 자세 조절 저하이고, 일과성은 상황에 따라 나타나는 보행동결(FOG)과 가속보행(festination)입니다. 지속형에 대한 해석은 다음과 같습니다.

- **느림**: 주로 보폭이 작아지는 것(hypokinesia)이고, 기저핵–시상–피질 고리에서 SMA의 활성이 떨어져 걸음과 APA의 "크기"가 작아지는 것과 연결됩니다. 보폭은 levodopa로 잘 좋아집니다.
- **변동성**: 자동 조절에서 수의(피질) 조절로의 이동 가설로 설명하며, levodopa에 잘 반응하지 않습니다. 그래서 평균 보폭과 걸음 간 변동성은 **서로 다른 기전의 지표**로 다뤄야 합니다(Day I13).
- **보상과 cue 의존**: 소뇌와 전운동피질의 활성 증가가 SMA 저하를 부분적으로 메우지만, 그 대가로 외부 cue(소리 리듬, 바닥 선)에 기대게 됩니다(Day I20).
- **자세 불안정**: PPN 등 콜린성 경로의 변화와 관련됩니다.

이 서술의 상당 부분은 영상 연구와 동물 실험에 근거한 가설입니다. 레슨과 보고서에서는 "~와 관련된다", "~라는 가설이 있다"의 수준으로 씁니다.

## 예시로 이해하기

### 예시 1 — 신경 조절 지도의 뼈대 그리기

아래 코드는 지도의 **뼈대**만 그립니다. 오늘 직접 해보기에서 화살표와 설명을 더해 완성합니다.

```python
from pathlib import Path
import matplotlib.pyplot as plt

# 상자 이름과 (x, y) 위치. 그림 글자는 영어(한글 글꼴 문제 회피)
nodes = {
    "Cortex\n(M1, SMA/PM,\ntemporoparietal)": (0.5, 0.92),
    "Basal ganglia\n(SNr/GPi output)": (0.15, 0.68),
    "Cerebellum\n(error correction)": (0.85, 0.68),
    "Brainstem\nMLR (CNF, PPN)": (0.5, 0.48),
    "Reticulospinal\ntract": (0.5, 0.28),
    "Spinal locomotor\nnetwork (CPG)": (0.5, 0.08),
    "Sensory feedback\n(proprioception,\nvision, vestibular)": (0.88, 0.2),
}
edges = [  # (출발, 도착, 선 모양) : "-" 흥분/조절, "--" 억제(GABA)
    ("Cortex\n(M1, SMA/PM,\ntemporoparietal)", "Brainstem\nMLR (CNF, PPN)", "-"),
    ("Basal ganglia\n(SNr/GPi output)", "Brainstem\nMLR (CNF, PPN)", "--"),
    ("Cerebellum\n(error correction)", "Brainstem\nMLR (CNF, PPN)", "-"),
    ("Brainstem\nMLR (CNF, PPN)", "Reticulospinal\ntract", "-"),
    ("Reticulospinal\ntract", "Spinal locomotor\nnetwork (CPG)", "-"),
    ("Sensory feedback\n(proprioception,\nvision, vestibular)", "Spinal locomotor\nnetwork (CPG)", "-"),
    ("Sensory feedback\n(proprioception,\nvision, vestibular)", "Cerebellum\n(error correction)", "-"),
]
fig, ax = plt.subplots(figsize=(7, 6))
for name, (x, y) in nodes.items():
    ax.text(x, y, name, ha="center", va="center", fontsize=9,
            bbox=dict(boxstyle="round", fc="white", ec="k"))
for a, b, style in edges:
    (x0, y0), (x1, y1) = nodes[a], nodes[b]
    ax.annotate("", xy=(x1, y1), xytext=(x0, y0),
                arrowprops=dict(arrowstyle="->", ls=style, shrinkA=28, shrinkB=28))
ax.text(0.02, 0.02, "automatic (brainstem-spinal) vs executive (cortical) control\n"
        "dashed = inhibitory output", transform=ax.transAxes, va="bottom", fontsize=8)
ax.axis("off")
out = Path("reports/advanced/I/I7_neural_map.png")
out.parent.mkdir(parents=True, exist_ok=True)
fig.tight_layout(); fig.savefig(out, dpi=150)
print("저장:", out)
```

실행 결과:

```text
저장: reports/advanced/I/I7_neural_map.png
```

### 예시 2 — gaitpdb로 이중과제 비용 계산하기

> **데이터:** Hausdorff JM. *Gait in Parkinson's Disease* (v1.0.0). PhysioNet; 2008. [doi:10.13026/C24H3N](https://doi.org/10.13026/C24H3N). Open Data Commons Attribution License v1.0. PhysioNet 표준 인용: Pollard T, et al. *Nature Health* (2026). [doi:10.1038/s44360-026-00096-z](https://doi.org/10.1038/s44360-026-00096-z). `demographics.txt`의 `Group`은 1 = PD, 2 = 대조군이고(`.html`과 대조해 확인), `Speed_01`은 평소 걷기, `Speed_10`은 Ga 연구의 이중과제(걸으며 7씩 빼기) 걷기 속도(m/s)입니다. 내려받기는 [Day I4](day-I4.md)와 같습니다(`demographics.txt`만 있으면 됩니다).

```python
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# 줄 끝 빈칸 때문에 앞 20열만 읽는다(Day 25에서 본 ParserError 회피)
demo = pd.read_csv("data/gaitpdb/demographics.txt", sep="\t", usecols=range(20))
demo["group"] = demo["Group"].map({1: "PD", 2: "Control"})      # .html과 대조해 확인한 코드

print("Speed_10 값이 있는 연구:", sorted(demo.loc[demo["Speed_10"].notna(), "Study"].unique()))
ga = demo[(demo["Study"] == "Ga") & demo["Speed_01"].notna() & demo["Speed_10"].notna()].copy()
print("두 속도가 모두 있는 Ga 참가자:", ga["group"].value_counts().to_dict())

# 흔히 쓰는 정의: 이중과제 비용(%) = (평소 − 이중과제) / 평소 × 100  (클수록 이중과제에서 더 느려짐)
ga["DTC"] = (ga["Speed_01"] - ga["Speed_10"]) / ga["Speed_01"] * 100

summary = ga.groupby("group").agg(n=("DTC", "size"),
                                  usual=("Speed_01", "median"),
                                  dual=("Speed_10", "median"),
                                  DTC_median=("DTC", "median"),
                                  DTC_q1=("DTC", lambda s: s.quantile(0.25)),
                                  DTC_q3=("DTC", lambda s: s.quantile(0.75)),
                                  slower_n=("DTC", lambda s: int((s > 0).sum())))
print(summary.round(2).to_string())

fig, ax = plt.subplots(figsize=(4.5, 3.6))
rng = np.random.default_rng(0)                                   # 점이 겹치지 않게 가로로 살짝 흩뿌림
for k, (g, sub) in enumerate(ga.groupby("group")):
    ax.scatter(k + rng.uniform(-0.08, 0.08, len(sub)), sub["DTC"], alpha=0.7)
    ax.hlines(sub["DTC"].median(), k - 0.25, k + 0.25, color="k")
ax.axhline(0, color="gray", lw=0.6)
ax.set_xticks([0, 1], [f"{g} (n={n})" for g, n in ga["group"].value_counts().sort_index().items()])
ax.set_ylabel("dual-task cost of gait speed (%)")
ax.set_title("gaitpdb v1.0.0, Ga study only")
out = Path("figures/advanced/I/I7_dual_task_cost.png")
out.parent.mkdir(parents=True, exist_ok=True)
fig.tight_layout(); fig.savefig(out, dpi=150)
print("저장:", out)
```

실행 결과(그림은 `figures/advanced/I/I7_dual_task_cost.png`):

```text
Speed_10 값이 있는 연구: ['Ga']
두 속도가 모두 있는 Ga 참가자: {'PD': 14, 'Control': 5}
          n  usual  dual  DTC_median  DTC_q1  DTC_q3  slower_n
group                                                         
Control   5   1.35  1.25        3.85    0.65    8.32         5
PD       14   0.90  0.88        3.82  -10.35   20.57         8
저장: figures/advanced/I/I7_dual_task_cost.png
```

읽는 법:

- **표본이 매우 작다.** 두 속도가 모두 있는 사람은 PD 14명, 대조군 5명뿐입니다. 대조군 5명으로 군 차이를 검정하거나 "PD의 이중과제 비용이 더 크다/작다"고 말할 수 없습니다. 오늘 결과는 **탐색적 기술**입니다.
- **중앙값은 두 군 모두 약 4%로 비슷하지만 흩어짐이 전혀 다르다.** 대조군 5명은 모두 이중과제에서 조금 느려졌습니다(사분위 0.7–8.3%). PD 14명 중 8명은 느려졌지만 나머지는 오히려 빨라져, 사분위 범위가 −10%에서 +21%까지 넓습니다.
- **음수(이중과제에서 더 빠름)를 바로 "이상하다"고 버리지 않는다.** 과제 우선순위를 어떻게 지시했는지, 두 걷기의 측정 조건이 같았는지, 같은 날 측정했는지가 데이터 문서에 없습니다. 측정 오차와 과제 전략의 개인차 모두 가능한 설명입니다. 원 연구(Yogev 2005)의 방법을 확인하기 전에는 해석을 보류합니다.
- **신호 파일과 짝이 맞지 않는다.** `Speed_10` 값이 있는 사람과 walk 10 신호 파일(`_10.txt`)이 있는 사람이 서로 다릅니다. 그래서 오늘은 demographics의 속도 열만 썼고, 신호로 이중과제 변수를 계산하려면 대상이 달라진다는 점을 보고서에 적어야 합니다.

## 직접 해보기

1. `notebooks/advanced/I/I7_dual_task.ipynb`에서 예시 1·2를 실행하고 출력이 같은지 확인합니다.
2. **신경 조절 지도 완성:** 예시 1의 그림에 다음을 더해 `reports/advanced/I/I7_neural_map.png`로 저장합니다. (a) 기저핵–시상–피질(SMA) 고리, (b) 피질에서 망상척수로로 가는 APA 경로, (c) 각 상자 옆에 "PD에서 무엇이 바뀐다고 보는가" 한 줄(가설이면 "가설"이라고 표시), (d) 자동 과정과 인지 과정을 색으로 구분. 손으로 그려 사진을 찍어도 됩니다.
3. 예시 2의 표에 **평소 속도의 범위**도 더하고, 평소 속도가 느린 사람일수록 이중과제 비용이 큰지 산점도(가로 `Speed_01`, 세로 `DTC`, 군별 색)로 그려 봅니다. 상관계수를 계산하더라도 19명 자료에서는 결론이 아니라 "다음에 확인할 가설"로만 적습니다.
4. `Speed_10`이 있는 Ga 참가자 목록과 `GaPt??_10.txt`·`GaCo??_10.txt` 파일 목록을 비교해(PhysioNet 페이지의 파일 목록이나 `SHA256SUMS.txt` 사용) 겹치는 사람 수를 세고, 데이터 사전에 메모합니다.
5. 1주차 정리: "몸은 무엇으로 앞으로 가고, 신경계는 그것을 어떻게 자동으로 유지하는가?"에 대한 답을 5–8문장으로 씁니다. Day I2(전진의 동력), I4(파워 부호의 한계), I6(충돌과 push-off), I7(자동 조절과 이중과제)의 개념을 각각 한 번 이상 씁니다.

> ⚠️ **흔한 오류 1:** `Speed_10`이 비어 있는 사람을 0으로 채우거나, Ju·Si 연구 참가자까지 넣어 계산하는 실수입니다. `Speed_10`은 Ga 연구에만 있고 결측은 `NaN`입니다. 비용은 두 속도가 **모두 있는 사람**으로만 계산합니다.
>
> ⚠️ **흔한 오류 2:** 이중과제 비용 식의 부호 방향을 밝히지 않는 실수입니다. 어떤 논문은 (이중 − 평소)/평소로 써서 부호가 반대입니다. 보고서에 식과 "양수 = 이중과제에서 느려짐"을 함께 적습니다.

## 🤖 AI와 함께 하기 (주간 실습, 20–30분)

**이번 주의 기술: AI가 설명한 생체역학 개념과 코드를 교재와 "정답을 아는 시험"으로 검증하기**

보행 생체역학은 AI가 그럴듯하게 설명하지만, 이번 주에 본 것처럼 **교재마다 관점과 부호가 다른** 분야입니다. AI는 흔히 Perry의 외부 모멘트와 Winter의 내부 모멘트를 섞고, rocker 개수를 한 가지로만 말하고, "push-off 근육이 몸을 민다"를 정설처럼 말합니다. 각도 계산 코드도 부호 규약을 말하지 않은 채 돌아갑니다. 오늘은 AI의 설명과 코드를 받아 **교재의 쪽 번호**와 **정답을 아는 가상 자세**로 확인합니다.

1. **질문을 정하고, 내가 확인한 사실을 먼저 적습니다.** 예: "LR에서 무릎 모멘트는 굴곡인가 신전인가?", "발목각의 + 방향은?" 이번 주 레슨과 교재에서 확인한 답과 쪽 번호를 적고, 모르는 것은 "[확인 필요]"로 둡니다.
2. **아래 프롬프트로 설명과 코드를 요청합니다.** 관점과 부호를 명시하라고 요구합니다.

   ```text
   나는 보행분석 자습 과정(심화 파트 I)의 1주차를 마쳤다.
   교재는 Perry & Burnfield(2010), Whittle's Gait Analysis 6판(2023), Winter 5판(2023)이다.

   중요한 원칙:
   - 교재마다 관점이 다르다(외부 모멘트 vs 내부 모멘트, rocker 3개 vs 4개). 어느 관점인지 매번 밝혀 달라.
   - 확실하지 않은 사실은 "확인 필요"라고 표시하고, 쪽 번호를 지어내지 말라.
   - 결과는 진단이나 치료 권고로 표현하지 않는다.

   질문 1: loading response에서 무릎의 모멘트를 외부 모멘트와 내부 모멘트로 각각 설명해 달라.
   질문 2: 시상면 마커 좌표(x = 진행 방향, y = 수직)로 무릎 굴곡각을 계산하는 Python 함수를 써 달라.

   다음 순서로 답해 달라:
   1. 각 답이 어느 교재 관점인지
   2. 코드가 가정하는 좌표축, 각도 기준(0°가 어떤 자세인가), + 방향
   3. 코드
   4. 이 코드가 틀릴 수 있는 상황(예: 피험자가 반대 방향으로 걷는 영상)
   ```

3. **AI 코드를 "정답을 아는 가상 자세"로 시험합니다.** 아래는 이번 주 규약(굴곡 +)으로 쓴 함수를 시험하는 예입니다. AI가 준 함수로 `knee_angle`을 바꿔 넣고 같은 세 자세를 넣어 보세요.

   ```python
   import numpy as np

   def knee_angle(hip, knee, ankle):
       """AI가 써 준 함수라고 가정하고, 정답을 아는 자세로 시험한다 (x = 앞, y = 위)."""
       thigh = np.degrees(np.arctan2(hip[1] - knee[1], hip[0] - knee[0]))
       leg = np.degrees(np.arctan2(knee[1] - ankle[1], knee[0] - ankle[0]))
       return thigh - leg

   # 정답을 아는 가상 자세 1: 다리를 곧게 편 채 수직으로 섬 → 0°
   print("곧게 선 자세  :", round(knee_angle((0, 0.9), (0, 0.5), (0, 0.1)), 1))
   # 가상 자세 2: 대퇴는 수직, 하퇴가 뒤로 30° 기움(무릎이 굽음) → +30°가 나와야 굴곡 + 규약
   d = 0.4
   ankle = (-d * np.sin(np.radians(30)), 0.5 - d * np.cos(np.radians(30)))
   print("무릎 30° 굽힘 :", round(knee_angle((0, 0.9), (0, 0.5), ankle), 1))
   # 가상 자세 3: 반대쪽(왼쪽)을 보고 걷는 영상이라 x가 뒤집힌 경우 → 부호가 뒤집힌다
   print("좌우 뒤집힌 영상:", round(knee_angle((0, 0.9), (0, 0.5), (-ankle[0], ankle[1])), 1))
   ```

   출력:

   ```text
   곧게 선 자세  : 0.0
   무릎 30° 굽힘 : 30.0
   좌우 뒤집힌 영상: -30.0
   ```

   AI의 함수가 곧게 선 자세에서 180°를 내거나, 굽힌 자세에서 −30°를 내면 틀린 것이 아니라 **규약이 다른 것**일 수 있습니다. 어느 쪽인지 밝혀 적고, 이 과정의 규약(굴곡 +, 편 무릎 0°)으로 맞춥니다. 세 번째 결과처럼 영상 방향이 바뀌면 부호가 뒤집힌다는 점도 확인합니다.

4. **설명은 쪽 번호로 대조합니다.** AI가 "LR에 대퇴사두근(대퇴직근 포함)이 수축한다"고 하면 [P] 5장으로, "push-off가 몸을 추진한다"고 하면 [P] 3·22장과 [W] 2장 p.30으로 확인합니다. 교재와 다른 문장에는 밑줄을 긋고 교재 쪽을 옆에 적습니다.

**검증 체크**
- [ ] AI 답의 각 문장이 어느 관점(외부/내부 모멘트, rocker 3/4개)인지 표시했다.
- [ ] AI 코드를 세 가지 가상 자세로 시험했고, 규약이 다르면 맞춰 고쳤다.
- [ ] AI가 든 쪽 번호·수치를 교재에서 직접 확인했고, 확인하지 못한 것은 "확인 필요"로 남겼다.

> 🔒 **개인정보·데이터 라이선스 주의:** 참가자 원자료(gaitpdb 신호 파일, demographics의 행)는 외부 AI에 붙여 넣지 않습니다. gaitpdb는 ODC-By 1.0으로 공개되어 있지만, 이 과정에서는 열 이름·단위·표본화율 같은 **구조 정보**와 직접 만든 **가상 좌표**만 AI에 줍니다. Day I2에서 찍은 본인 보행 영상과 캡처도 올리지 않습니다. 이 실습은 학습용이며 진단·치료 판단에 쓰지 않습니다.

## 퀴즈

**1.** 다음 중 Takakusaki(2017)의 서술과 가장 맞는 것은?
(a) 보행 리듬은 운동피질이 매 걸음 만든다 (b) 척수 회로가 리듬을 만들고 뇌간의 MLR이 망상척수로를 거쳐 이를 켜고 조절한다 (c) 소뇌가 리듬을 만든다 (d) 기저핵이 척수 회로를 직접 흥분시킨다

<details><summary>정답 보기</summary>

**(b)**. 피질은 숙련 보행·APA·낯선 환경의 프로그래밍에, 소뇌는 오차 교정에 관여하고, 기저핵 출력은 MLR/PPN을 억제하는 방향으로 작용합니다.

</details>

**2.** 자동 처리와 집행 처리의 차이를 세 가지 대비로 말하라.

<details><summary>정답 보기</summary>

자동 처리는 빠르고, 병렬적이고, 노력이 적고 스트레스에 강합니다. 집행 처리는 느리고, 직렬적이고, 노력이 많이 들며 다른 과제와 간섭하고 불안에 약합니다(Clark 2015).

</details>

**3.** 평소 속도 1.00 m/s, 이중과제 속도 0.85 m/s일 때 이중과제 비용은? 이 값을 "이 사람의 automaticity가 낮다"로 바로 해석하면 안 되는 이유 하나는?

<details><summary>정답 보기</summary>

(1.00 − 0.85)/1.00 × 100 = 15%. 과제 우선순위 지시, 이차 과제의 난이도, 개인의 인지 능력이 모두 비용을 바꾸므로, 한 숫자를 automaticity의 직접 척도로 읽을 수 없습니다.

</details>

**4.** Peterson & Horak(2016)이 말하는 PD 보행의 지속형 이상 세 가지와 일과성 이상 두 가지는?

<details><summary>정답 보기</summary>

지속형: 느림(주로 보폭 감소), 변동성·비대칭 증가, 자세 조절 저하. 일과성: 보행동결(FOG), 가속보행(festination). 이 구분의 원출처로 Giladi, Horak & Hausdorff(2013)를 인용합니다.

</details>

**5.** 오늘 gaitpdb 결과에서 대조군 5명의 이중과제 비용 중앙값이 PD와 비슷했다. 이것으로 "PD와 대조군의 이중과제 비용에 차이가 없다"고 결론 내릴 수 없는 이유 두 가지는?

<details><summary>정답 보기</summary>

(1) 대조군이 5명뿐이라 차이가 있어도 검출할 수 없습니다(차이 없음의 증거가 아님). (2) 과제 지시와 측정 조건이 문서에 없고, 속도 열과 신호 파일의 대상이 맞지 않는 등 데이터 자체의 한계가 있습니다. 탐색적 기술로만 보고합니다.

</details>

**1주차 종합 퀴즈 (10문항)**

**6.** Perry의 8 phase 중 반대 발이 바닥에서 떨어지는 순간에 끝나는 phase와, 반대 발이 바닥에 닿는 순간에 끝나는 phase는?

<details><summary>정답 보기</summary>

LR(12% GC에 끝, Whittle의 opposite toe off)과 TSt(50% GC에 끝, Whittle의 opposite initial contact)입니다. 그래서 0–12%와 50–62%가 double stance입니다.

</details>

**7.** Perry의 rocker 네 개를 phase와 회전축으로 짝지어라. Whittle은 이 중 무엇을 하나로 묶는가?

<details><summary>정답 보기</summary>

heel rocker(LR, 뒤꿈치), ankle rocker(MSt, 발목 관절), forefoot rocker(TSt, 중족골두), toe rocker(PSw, 엄지와 안쪽 전족부). Whittle은 heel rise부터 toe off까지를 하나의 terminal rocker로 묶어 forefoot rocker와 toe rocker를 합칩니다.

</details>

**8.** 수직 지면반력의 첫 봉우리가 체중보다 큰 이유를 F = Σm(a + g)로 설명하라.

<details><summary>정답 보기</summary>

체중을 받는 LR 끝에 몸의 질량중심이 아래로 내려오던 움직임을 멈추고 위로 가속되므로(a > 0, 위 방향), m(a + g)가 mg보다 커집니다. 골짜기(F2)는 질량중심이 지지 다리 위로 넘어가며 아래 방향 가속이 생겨 체중보다 작아집니다.

</details>

**9.** 무릎의 내부 모멘트가 신전 방향이고 무릎이 굽혀지는 중이다. 파워의 부호와 가장 안전한 해석은?

<details><summary>정답 보기</summary>

음(−)입니다. 무릎(근건 단위)이 에너지를 흡수합니다. 흔히 신전근의 원심성 작용이지만, 수동 조직의 기여나 동시수축 가능성 때문에 근섬유의 수축 형태를 단정하지 않습니다.

</details>

**10.** 걷기 연구에서 TSt의 발목에 내부 족저굴곡 모멘트가 크다. 이것을 Perry식 외부 모멘트로 바꿔 말하면?

<details><summary>정답 보기</summary>

GRF 벡터가 발목 앞을 크게 지나가 발목을 배측굴곡시키려는 외부 모멘트(요구)가 크다는 뜻입니다. 같은 사건을 반대 관점에서 부른 것입니다.

</details>

**11.** 표면 EMG 처리에서 band-pass, 정류, linear envelope는 각각 무엇을 위한 단계인가?

<details><summary>정답 보기</summary>

band-pass는 움직임 잡음(저주파)과 고주파 잡음을 없애고, 정류는 양·음이 상쇄되지 않게 크기로 바꾸고, linear envelope은 정류 신호의 빠른 떨림을 평활해 활동의 추세(시간 패턴)를 얻습니다.

</details>

**12.** EMG 진폭을 과제 내 최댓값으로 정규화했을 때 할 수 있는 비교와 할 수 없는 비교를 하나씩 말하라.

<details><summary>정답 보기</summary>

할 수 있는 것: 한 사람 안에서 주기 중 언제 상대적으로 활동이 큰지(시간 패턴) 비교. 할 수 없는 것: 사람이나 조건 사이에 "누가 더 세게 근육을 썼는지" 강도 비교. 최댓값이 각자 100%가 되기 때문입니다.

</details>

**13.** 역진자 모델에서 다리 길이 1.0 m인 사람이 걸을 수 있는 이론상 최대 속도의 크기는 대략? 그 근거는?

<details><summary>정답 보기</summary>

약 3.1 m/s(√(g·L) = √9.81). 원호 꼭대기에서 필요한 구심가속도 v²/L이 g를 넘으면 다리가 몸을 붙잡아 둘 수 없기 때문입니다. 실제 사람은 이보다 훨씬 낮은 속도에서 달리기로 바꿉니다.

</details>

**14.** 병적 보행에서 늘어나는 에너지 지표는 O₂ rate인가 O₂ cost인가? Perry의 설명은?

<details><summary>정답 보기</summary>

주로 O₂ cost(거리당)입니다. 대부분의 환자는 속도를 줄여 시간당 O₂ rate를 정상 범위로 유지하고, 그 대가로 1 m당 비용이 커집니다(Perry 24장).

</details>

**15.** 1주차의 핵심 질문 "정상 보행에서 몸을 앞으로 보내는 힘은 어디서 오고, 신경계는 그것을 어떻게 자동으로 유지하는가?"에 세 문장으로 답하라.

<details><summary>정답 보기</summary>

예시 답: Perry는 체중의 전방 낙하와 swing 다리의 당김을 주된 동력으로, rocker를 그 힘을 전진으로 돌리는 회전축으로, stance 근육을 주로 제동 장치로 봅니다(push-off의 능동적 기여에 대해서는 교재마다 해석이 다르고, 역진자 관점에서는 걸음 사이 방향 전환을 push-off와 충돌이 맡습니다). 신경계는 척수 회로가 리듬을 만들고 뇌간 MLR이 망상척수로를 통해 이를 켜고 조절하며, 기저핵·소뇌·피질이 상황에 맞게 조정합니다. 과제가 어렵거나 신경계가 손상되면 조절이 자동에서 집행 쪽으로 옮겨 가고, 이중과제 비용이 그 간접 지표가 됩니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `reports/advanced/I/I7_neural_map.png`를 완성했다(고리·APA 경로·PD 변화·자동/인지 구분).
- [ ] `notebooks/advanced/I/I7_dual_task.ipynb`에서 이중과제 비용 표와 `figures/advanced/I/I7_dual_task_cost.png`를 만들었다.
- [ ] 표본 크기·자료 불일치·해석 보류를 노트북에 적었다.
- [ ] 1주차 핵심 질문에 대한 답을 썼다.
- [ ] AI와 함께 하기 실습을 하고 검증 결과를 `learning-log.md`에 적었다.

## 더 읽을거리
- Takakusaki K. Functional neuroanatomy for posture and gait control. *J Mov Disord*. 2017;10(1):1–17. [doi:10.14802/jmd.16062](https://doi.org/10.14802/jmd.16062)
- Clark DJ. Automaticity of walking: functional significance, mechanisms, measurement and rehabilitation strategies. *Front Hum Neurosci*. 2015;9:246. [doi:10.3389/fnhum.2015.00246](https://doi.org/10.3389/fnhum.2015.00246)
- Peterson DS, Horak FB. Neural control of walking in people with parkinsonism. *Physiology (Bethesda)*. 2016;31(2):95–107. [doi:10.1152/physiol.00034.2015](https://doi.org/10.1152/physiol.00034.2015)
- [Wi] Thomas, Zeni & Winter, 5th ed., 2023 — 12.1절(pp.247–249; 구조 목록과 소뇌의 역할 위주로 읽고, CPG 위치 서술은 위 논문과 비교), 11.3.2절 보행 시작(pp.242–244).
- [W] Richards & Levine, eds., 6th ed., 2023 — 2장 Starting and Stopping(pp.41–42).
- 이론 노트: [T06 — 보행의 신경 조절](../I-gait-theory/note-T06.md)

---
[← 이전](day-I6.md) · [코스 지도](../../../README.md) · [다음 →](day-I8.md)
