# Day 27 — 개별·군 수준 시각화: 사람이 보이는 그림 그리기

> **주차:** 4주차 · **예상 시간:** 75–90분 · **산출물:** feature figure 2개 — `figures/pd_spaghetti.png`, `figures/pd_group_box.png`

## 오늘의 목표
- 한 사람이 선 하나로 보이는 spaghetti plot을 그릴 수 있다.
- 한 사람이 점 하나로 보이는 box/violin plot으로 군별 분포를 비교할 수 있다.
- 그림 속의 점이나 선이 "사람"인지 "기록"인지 캡션에 명확히 적을 수 있다.

## 🎬 영상으로 먼저 보기

- [Boxplots are Awesome!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=fHLhBnmwUM0) (약 3분)
- **무엇에 주목할까:** 상자의 가운데 선(중앙값), 상자의 위아래(사분위수), 수염이 각각 무엇을 뜻하는지 복습하세요. 1주차 Day 5에서 본 내용이지만, 오늘은 "상자 뒤에 숨은 개별 사람"을 함께 보여 주는 것이 핵심입니다.

- [Violin Plot [Simply explained] — numiqo](https://www.youtube.com/watch?v=Rw00VmP--qk) (약 4분)
- **무엇에 주목할까:** violin plot의 폭이 "그 값 근처에 데이터가 얼마나 많은가"를 뜻한다는 점, 그리고 box plot으로는 보이지 않는 "봉우리가 두 개인 분포"가 violin에서는 보인다는 점을 보세요.

## 개념 설명

### 왜 평균 막대 하나로는 부족한가

군 평균을 막대그래프로 그리면 깔끔합니다. 하지만 막대는 세 가지를 숨깁니다. 군 안에 몇 명이 있는지, 사람마다 얼마나 다른지, 그리고 한 사람의 값이 조건에 따라 어떻게 변하는지입니다. 운동 데이터에서는 이 세 가지가 전부 중요합니다.

임상 경험으로 생각해 보세요. "PD 환자는 평균적으로 이렇다"는 문장과 실제 외래에서 만나는 환자 한 명 한 명 사이에는 큰 간격이 있습니다. 떨림이 두드러진 사람도, 거의 없는 사람도 있습니다. 그림이 그 다양성을 보여 주지 못하면, 읽는 사람은 "PD면 다 이렇다"고 오해합니다. 그래서 이번 주 그림의 원칙은 하나입니다. **개별 참가자가 보여야 한다.**

오늘은 그림을 두 종류 그립니다. **개별 수준** 그림은 한 사람의 변화를 따라갑니다(spaghetti plot). **군 수준** 그림은 사람들의 분포를 군별로 비교합니다(box/violin plot + 개별 점). 두 그림 모두 **participant-level table**에서 출발합니다.

### spaghetti plot: 한 사람 = 선 하나

**spaghetti plot**은 가로축에 조건(과제, 시점 등)을 놓고, 한 사람의 값들을 선으로 이은 그림입니다. 선이 여러 가닥 겹쳐 보여서 스파게티라고 부릅니다. 같은 환자의 검사 수치를 방문마다 이어 그린 경과 그래프와 같은 발상입니다.

이 그림이 알려 주는 것은 평균이 알려 주지 못하는 것들입니다. 모든 선이 같은 방향으로 기우는가(조건의 효과가 일관적인가), 유독 다른 길을 가는 선이 있는가(이상치 또는 다른 하위 유형), 선들이 넓게 퍼져 있는가(사람 간 차이가 큰가). 선을 군별로 색칠하면 군 간 차이도 함께 보입니다.

주의할 점은 두 가지입니다. 첫째, **선은 같은 사람의 값끼리만 잇습니다.** 서로 다른 사람을 선으로 이으면 존재하지 않는 "변화"를 그리게 됩니다. 둘째, 가로축의 순서에 의미가 있어야 선이 자연스럽습니다. 과제는 수행 순서나 미리 정한 순서로 고정하세요.

### box/violin plot: 한 사람 = 점 하나

군 비교 그림에서 가장 흔한 실수는 **기록을 점으로 찍는 것**입니다. 12명이 4개씩 기록을 남겼다면 점이 48개 찍히고, 군 차이가 실제보다 훨씬 확실해 보입니다. 이것은 그림으로 하는 pseudoreplication입니다. 반복 측정은 독립 표본이 아니므로, **먼저 사람당 한 값으로 요약한 뒤** 그립니다.

**box plot**은 중앙값과 사분위수로 분포를 요약합니다. 표본이 적을 때(군당 10명 안팎)는 상자만으로는 정보가 부족하므로 **개별 점을 겹쳐** 그립니다. 점이 겹치지 않도록 좌우로 살짝 흩는 것을 jitter라고 합니다. **violin plot**은 분포의 모양을 부드러운 곡선으로 보여 주어, 봉우리가 두 개인 분포를 드러냅니다. 다만 사람이 적으면 곡선이 실제보다 그럴듯해 보이는 착시가 있으니, 군당 수십 명 이상일 때 쓰는 편이 안전합니다.

그림을 그리며 **분포 확인**도 함께 합니다. 한쪽으로 길게 늘어졌는가(치우침), 봉우리가 둘인가, 동떨어진 점이 있는가. 이 관찰이 5주차에 어떤 검정과 효과크기를 쓸지 정하는 근거가 됩니다. 그리고 2주차에 배운 대로, **그림에서 차이가 보인다고 결론을 내리지 않습니다.** 오늘의 그림은 탐색이고, 검정과 해석은 계획(Day 28)을 세운 뒤에 합니다.

### 캡션에 반드시 들어갈 것

좋은 그림은 캡션만 읽어도 무엇을 그렸는지 알 수 있습니다. 이번 주 그림의 캡션에는 다음이 들어갑니다. ① 점·선 하나가 무엇인가(참가자 1명). ② 군별 사람 수(n). ③ feature의 정의와 단위. ④ 어떤 과제·손목(또는 걷기 조건)의 값인가. ⑤ 데이터 출처와 버전, 가상 데이터라면 그 사실. 축 라벨에는 단위를 답니다. 색은 군마다 일관되게 쓰고, 색만으로 구분하지 않도록 범례를 넣습니다.

## 예시로 이해하기

### 예시 1: 그림 두 장을 한 번에

가상 feature table을 코드 안에서 만들어 그립니다. Day 26의 CSV가 있으면 표 만드는 부분을 `pd.read_csv`로 바꾸면 됩니다. (그림 속 글자는 한글 글꼴 설정 문제를 피하려고 영어로 적었습니다.)

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# ---------- 가상 feature table (Day 26 파일이 있으면 그 파일을 읽어도 된다) ----------
rng = np.random.default_rng(3)
ids = [f"S{i:02d}" for i in range(1, 13)]
group = ["PD"] * 6 + ["HC"] * 6
base = np.where(np.array(group) == "PD", rng.uniform(0.015, 0.045, 12), rng.uniform(0.009, 0.014, 12))
rows = []
for pid, g, b in zip(ids, group, base):
    for task, scale in [("Relaxed", 1.0), ("StretchHold", 0.7), ("TouchNose", 1.6)]:
        rows.append({"participant_id": pid, "group": g, "task": task,
                     "std_g": b * scale + rng.normal(0, 0.001)})
df = pd.DataFrame(rows)
# ↑↑↑ 실제 데이터로 바꿀 때: df = pd.read_csv("<내 feature table 경로>") 후 열 이름 맞추기 ↑↑↑

tasks = ["Relaxed", "StretchHold", "TouchNose"]
colors = {"PD": "tab:red", "HC": "tab:blue"}

# ---------- Figure 1: spaghetti plot (한 사람 = 선 하나) ----------
fig, ax = plt.subplots(figsize=(6, 4))
for pid, sub in df.groupby("participant_id"):
    sub = sub.set_index("task").loc[tasks]
    ax.plot(tasks, sub["std_g"], marker="o", alpha=0.7, color=colors[sub["group"].iloc[0]])
for g, c in colors.items():
    ax.plot([], [], color=c, marker="o", label=f"{g} (n={df[df.group == g].participant_id.nunique()})")
ax.set_xlabel("Task")
ax.set_ylabel("Movement SD (g)")
ax.set_title("Simulated data: one line per participant")
ax.legend()
fig.tight_layout()
fig.savefig("fig_spaghetti.png", dpi=150)

# ---------- Figure 2: box plot + 개별 점 (한 사람 = 점 하나) ----------
one = df[df["task"] == "Relaxed"]                 # 과제 하나만 골라 '한 사람당 한 값'으로
assert one["participant_id"].is_unique
fig, ax = plt.subplots(figsize=(4.5, 4))
data = [one[one.group == g]["std_g"].values for g in ["HC", "PD"]]
ax.boxplot(data, showfliers=False)
ax.set_xticks([1, 2], ["HC", "PD"])
for i, (g, vals) in enumerate(zip(["HC", "PD"], data), start=1):
    jitter = rng.uniform(-0.08, 0.08, len(vals))  # 점이 겹치지 않게 좌우로 살짝 흩기
    ax.scatter(np.full(len(vals), i) + jitter, vals, color=colors[g], zorder=3)
ax.set_ylabel("Movement SD at rest (g)")
ax.set_title("Simulated data: one dot per participant")
fig.tight_layout()
fig.savefig("fig_box.png", dpi=150)

print(one.groupby("group")["std_g"].describe()[["count", "mean", "50%", "min", "max"]].round(4).to_string())
print("저장 완료: fig_spaghetti.png, fig_box.png")
```

출력 (실행 확인. 그림 파일 두 개도 함께 만들어집니다):

```text
       count    mean     50%     min     max
group                                       
HC       6.0  0.0105  0.0103  0.0081  0.0129
PD       6.0  0.0253  0.0241  0.0150  0.0382
저장 완료: fig_spaghetti.png, fig_box.png
```

세 군데를 눈여겨보세요. 범례에 `n=`을 **사람 수**(`nunique()`)로 넣었습니다. box plot 앞에 `assert one["participant_id"].is_unique`로 "한 사람 = 한 점"을 자동 확인합니다. 그리고 `showfliers=False`는 이상치를 숨기려는 것이 아니라, 개별 점을 전부 따로 찍기 때문에 같은 점이 두 번 그려지지 않게 한 것입니다.

### 예시 2: box plot이 숨기는 것을 violin plot이 보여 준다

가상의 PD군 안에 "움직임이 작은 사람들"과 "큰 사람들" 두 덩어리가 있다고 해 봅시다.

```python
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(5)
hc = rng.normal(0.012, 0.002, 40)
pd_ = np.concatenate([rng.normal(0.015, 0.003, 25), rng.normal(0.045, 0.005, 15)])  # 두 덩어리

fig, axes = plt.subplots(1, 2, figsize=(8, 3.5), sharey=True)
axes[0].boxplot([hc, pd_]); axes[0].set_xticks([1, 2], ["HC", "PD"]); axes[0].set_title("Box plot")
axes[1].violinplot([hc, pd_], showmedians=True); axes[1].set_xticks([1, 2], ["HC", "PD"]); axes[1].set_title("Violin plot")
axes[0].set_ylabel("Movement SD (g)")
fig.suptitle("Simulated data")
fig.tight_layout()
fig.savefig("fig_box_vs_violin.png", dpi=150)

print("PD 중앙값:", round(float(np.median(pd_)), 4), " PD 평균:", round(float(pd_.mean()), 4))
```

출력 (실행 확인):

```text
PD 중앙값: 0.0177  PD 평균: 0.0261
```

중앙값(0.018)과 평균(0.026)이 꽤 다릅니다. 분포가 대칭이 아니라는 신호입니다. box plot에서는 길쭉한 상자 하나로 보이지만, violin plot에서는 아래쪽과 위쪽에 볼록한 부분이 따로 보입니다. "PD군의 평균"이라는 숫자 하나가 실제로는 **누구도 대표하지 못할 수** 있습니다.

### 예시 3: 같은 데이터, 잘못된 그림

예시 1의 `df`는 36줄(12명 × 과제 3개)입니다. 과제를 고르지 않고 `df` 전체로 box plot을 그리면 군당 점이 18개씩 찍힙니다. 사람은 6명인데 말입니다. 게다가 과제마다 움직임 크기가 달라서, 군 차이와 과제 차이가 한 상자 안에 뒤섞입니다. 고치는 방법은 둘 중 하나입니다. **과제 하나를 고르거나**(예시 1의 방식), **사람별로 과제들의 평균을 내어** 한 값으로 만듭니다. 어느 쪽이든 그리기 직전에 `is_unique`로 확인합니다.

## 직접 해보기

1. `notebooks/05_pd_feature_analysis.ipynb`에 "Day 27 시각화" 제목 셀을 추가하고, 예시 1을 실행해 그림 두 장이 보이는지 확인합니다.
2. **내 feature table 읽기.** Day 26에서 저장한 표를 읽습니다. spaghetti plot에는 "사람 × 과제(또는 걷기 조건)" 형태의 긴 표가, box plot에는 "한 사람 = 한 줄" 표가 필요합니다.
   ```python
   df = pd.read_csv("<Day 26에서 저장한 feature table 경로>")   # 자리표시자
   print(df.columns.tolist())
   print(df["<참가자 ID 열>"].nunique(), "명 /", len(df), "줄")
   ```
   record-level 표라면 먼저 사람 × 과제로 접습니다: `df.groupby(["<ID 열>", "<군 열>", "<과제 열>"], as_index=False)["<feature 열>"].mean()`.
3. **Figure 1 — spaghetti plot.** 예시 1의 Figure 1 코드에서 열 이름, `tasks` 목록, `colors`의 군 이름을 내 데이터에 맞게 고칩니다. 참가자가 수백 명이면 선이 뭉개지니 `alpha=0.2`로 낮추거나, 군별로 무작위 20명씩만 그립니다(뽑을 때 `random_state`를 고정하고 캡션에 "무작위 20명"이라고 적습니다).
   - 보행 데이터에서 과제가 하나뿐이면, 한 사람의 stride interval을 걸음 번호 순서로 이은 그림을 2–4명만 골라 그리는 것으로 대신합니다(participant summary).
4. **Figure 2 — box 또는 violin plot.** 주요 feature 하나와 과제 하나를 골라 "한 사람당 한 값"으로 만들고, `assert ... .is_unique`를 통과시킨 뒤 그립니다. 군당 30명 미만이면 box + 개별 점, 그 이상이면 violin도 시도해 봅니다. 군이 셋 이상이면 모두 그리되, 어떤 군을 주요 비교로 삼을지는 내일 정합니다.
5. **분포 확인.** 같은 feature의 히스토그램을 군별로 그리고(`plt.hist(..., alpha=0.5)`), 치우침·봉우리 수·동떨어진 점을 Markdown 셀에 세 줄로 적습니다. 동떨어진 점은 **지우지 말고** 참가자 ID를 적어 둡니다.
6. **저장.** 두 그림을 `figures/pd_spaghetti.png`, `figures/pd_group_box.png`로 저장합니다(`fig.savefig(경로, dpi=150)`).
7. **캡션 쓰기.** 각 그림 아래 Markdown 셀에 캡션을 씁니다. 틀: "Figure N. [feature 정의, 단위]. 선/점 하나 = 참가자 1명. [군 이름] n=__, [군 이름] n=__. 과제: __. 데이터: [데이터셋 이름, 버전] (또는 simulated). 탐색적 그림이며 통계 검정은 하지 않음."

⚠️ **흔한 오류 1:** spaghetti plot의 선이 지그재그로 엉키는 것. `groupby("participant_id")` 없이 전체를 한 번에 `plot`하면 서로 다른 사람의 값이 한 선으로 이어집니다. 반드시 사람별로 반복문을 돌려 한 사람씩 그립니다.

⚠️ **흔한 오류 2:** `KeyError: "['TouchNose'] not in index"` 같은 오류. 어떤 참가자에게 그 과제 기록이 없어서 `.loc[tasks]`가 실패한 것입니다. `sub.set_index("task").reindex(tasks)`로 바꾸면 없는 과제는 빈 값이 되어 선이 끊겨 그려집니다. 그런 사람이 몇 명인지는 Day 25의 QC 표와 맞춰 봅니다.

## 퀴즈

**1.** spaghetti plot에서 선 하나가 나타내는 것은?
(a) 한 군의 평균 (b) 한 참가자의 조건별 값 (c) 한 기록의 원신호 (d) 회귀선

<details><summary>정답 보기</summary>

**(b)**. 같은 사람의 값들을 조건 순서대로 이은 것입니다. 그래서 사람 안에서의 변화와 사람 사이의 차이를 동시에 볼 수 있습니다. 서로 다른 사람의 값을 이으면 안 됩니다.

</details>

**2.** 참가자 10명이 각자 기록 8개를 남겼습니다. 군 비교 box plot 위에 찍을 개별 점의 수로 적절한 것은?
(a) 80 (b) 10 (c) 8 (d) 1

<details><summary>정답 보기</summary>

**(b) 10**. 사람당 한 값으로 요약한 뒤 한 사람을 점 하나로 찍습니다. 80개를 찍으면 같은 사람의 닮은 값들이 여러 번 나타나 군 차이가 실제보다 확실해 보입니다.

</details>

**3.** box plot에서는 잘 보이지 않지만 violin plot에서는 보이는 것은?
(a) 중앙값 (b) 봉우리가 두 개인 분포 (c) 최댓값 (d) 군 이름

<details><summary>정답 보기</summary>

**(b)**. box plot은 사분위수 다섯 숫자로 요약하므로 분포의 모양(봉우리 수)을 숨깁니다. violin plot은 값이 몰려 있는 곳이 볼록하게 나타나 두 덩어리를 드러냅니다. 다만 사람이 적을 때는 곡선을 과신하면 안 됩니다.

</details>

**4.** (단답) 이번 주 그림의 캡션에 꼭 들어가야 할 것 중 세 가지를 쓰세요.

<details><summary>정답 보기</summary>

다음 중 셋: **점·선 하나가 참가자 1명이라는 것, 군별 사람 수(n), feature 정의와 단위, 과제·손목(조건), 데이터 출처·버전(가상 데이터 여부)**. 특히 "점 하나 = 사람 한 명"과 n은 읽는 사람이 분석 단위를 오해하지 않게 하는 핵심 정보입니다.

</details>

**5.** 그림에서 PD군의 점들이 대조군보다 위에 있는 것처럼 보입니다. 지금 내릴 수 있는 결론은?
(a) PD는 이 feature로 진단할 수 있다 (b) 군 간 차이가 통계적으로 유의하다 (c) 탐색적으로 차이가 보이며, 계획을 세워 검정과 효과크기로 확인해야 한다 (d) 떨림이 PD의 원인이다

<details><summary>정답 보기</summary>

**(c)**. 그림은 탐색 단계입니다. 유의성은 미리 정한 방법으로 검정해야 말할 수 있고, 이 데이터로는 진단이나 인과를 주장할 수 없습니다. 군 간 나이·성별 차이 같은 교란 가능성도 아직 검토하지 않았습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `figures/pd_spaghetti.png`: 한 사람 = 선 하나, 군별 색, 범례에 사람 수 n.
- [ ] `figures/pd_group_box.png`: 한 사람 = 점 하나(그리기 전 `is_unique` 확인), 군별 box 또는 violin.
- [ ] 두 그림 모두 축 라벨에 단위가 있다.
- [ ] 각 그림에 캡션(분석 단위, n, feature 정의, 과제, 데이터 출처)이 있다.
- [ ] 분포 관찰 세 줄(치우침, 봉우리, 동떨어진 점)을 적었고, 동떨어진 점을 지우지 않았다.
- [ ] 가상 데이터로 그렸다면 제목이나 캡션에 simulated라고 표시했다.

---
[← 이전](day-26.md) · [코스 지도](../../README.md) · [다음 →](day-28.md)
