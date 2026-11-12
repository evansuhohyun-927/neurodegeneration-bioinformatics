# Day 5 — 시각화 원칙: 정직한 그림 3장 그리기

> **주차:** 1주차 · **예상 시간:** 75–90분 · **산출물:** figure 3개 (`figures/fig01_histogram.png`, `fig02_boxplot.png`, `fig03_scatter.png`)

## 오늘의 목표
- histogram, boxplot, scatter plot이 각각 어떤 질문에 답하는 그림인지 구분할 수 있다.
- 축 이름·단위·제목·범례·색을 갖춘 그림을 `matplotlib`으로 그리고 파일로 저장할 수 있다.
- 요약값(평균, 막대)만 보여 주는 그림이 왜 위험한지 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [How to spot a misleading graph - Lea Gaslowitz — TED-Ed](https://www.youtube.com/watch?v=E91bGT9BjYk) (4분 10초)
- **무엇에 주목할까:** 같은 데이터가 y축을 어디서 자르느냐에 따라 "폭등"으로도 "변화 없음"으로도 보이는 장면을 보세요. 오늘 그림을 그릴 때 "나는 독자를 속이는 축을 쓰고 있지 않은가?"를 스스로 묻는 기준이 됩니다.

- [Matplotlib Tutorial (Part 1): Creating and Customizing Our First Plots — Corey Schafer](https://www.youtube.com/watch?v=UO98lJQ3QGI) (35분 1초)
- **무엇에 주목할까:** 전부 볼 필요는 없습니다. 앞 15분, 즉 그림을 그리고 → 축 이름(`xlabel`, `ylabel`)과 제목을 붙이고 → 범례(`legend`)를 넣고 → 저장(`savefig`)하는 흐름만 따라가세요. 영상은 `plt.plot(...)` 방식을 쓰고 오늘 실습은 `fig, ax = plt.subplots()` 방식을 쓰지만, 붙이는 요소는 같습니다.

## 개념 설명

### 그림은 질문에 대한 답이다

그림을 그리기 전에 "이 그림으로 어떤 질문에 답하려는가?"를 먼저 정합니다. 영상의학에서 무엇을 보려는지에 따라 X-ray, CT, MRI 중 하나를 고르는 것과 같습니다. 오늘 배울 세 그림은 각각 다른 질문에 답합니다.

| 그림 | 답하는 질문 | 변수 |
|---|---|---|
| **histogram** (히스토그램) | 값이 **어떻게 퍼져 있는가?** 봉우리는 하나인가, 한쪽으로 치우쳤는가? | 숫자 변수 1개 |
| **boxplot** (상자그림) | **군 사이에** 분포가 어떻게 다른가? | 범주 1개 + 숫자 1개 |
| **scatter plot** (산점도) | 두 숫자 변수가 **함께 움직이는가?** | 숫자 변수 2개 |

순서도 중요합니다. 항상 histogram부터 봅니다. 분포를 모르는 채로 군을 비교하는 것은, 환자의 전신 상태를 보지 않고 특정 부위만 확대해서 보는 것과 같습니다.

### boxplot 읽는 법, 그리고 점을 함께 찍는 이유

boxplot의 상자는 다섯 숫자를 그림으로 옮긴 것입니다.

- 상자 가운데 선: **중앙값**(median). 줄 세웠을 때 한가운데 값
- 상자의 아래·위 변: **25번째, 75번째 백분위수**. 가운데 절반의 사람이 이 안에 있습니다
- 수염(whisker): 상자 밖으로 뻗은 선. 극단값을 뺀 범위
- 수염 밖의 점: **이상치**(outlier) 후보

소아 성장곡선에서 "이 아이는 키가 75백분위"라고 할 때와 같은 생각입니다.

하지만 상자만 그리면 **몇 명으로 그린 상자인지**가 보이지 않습니다. 5명으로 그린 상자와 500명으로 그린 상자가 똑같이 생겼습니다. 그래서 표본이 작을 때는 상자 위에 **개별 점을 함께** 찍습니다. OSD-536처럼 표본이 작은 데이터에서는 이것이 선택이 아니라 필수입니다. 점이 겹치지 않도록 좌우로 살짝 흩뿌리는 것을 jitter라고 합니다.

### 정직한 그림의 체크리스트

논문 그림을 볼 때 무의식적으로 확인하는 것들을, 이제 그리는 입장에서 챙깁니다.

1. **축 이름과 단위:** `stride_cv`가 아니라 `Stride time variability (CV, %)`. 변수 이름은 나만 압니다.
2. **제목 또는 캡션:** 무엇을 그렸는지, 표본 수가 몇인지.
3. **범례(legend):** 색이나 모양이 뜻을 가지면 반드시.
4. **색:** 색은 **정보**를 담을 때만 씁니다. 그리고 빨강–초록 조합은 색각 이상이 있는 사람에게 구분되지 않으므로 피합니다. 오늘은 파랑(`#0072B2`)과 주황(`#D55E00`)을 씁니다.
5. **축 범위:** 차이를 크게 보이려고 축을 자르지 않습니다. 여러 그림을 비교할 때는 같은 축 범위를 씁니다.
6. **가상 데이터 표시:** 연습용 그림에는 "simulated"라고 적습니다. 나중에 실제 결과와 섞이는 사고를 막습니다.

### 평균만 보면 속는다

평균이 같아도 분포는 전혀 다를 수 있습니다. 두 병동의 평균 재원일수가 똑같이 5일이라도, 한 병동은 모두가 5일 안팎이고 다른 병동은 절반이 1일, 절반이 9일일 수 있습니다. 두 병동은 전혀 다른 곳이지만 평균 막대그래프로는 구분되지 않습니다(예시 1).

그래서 이 과정에서는 평균 막대그래프(bar plot)를 기본으로 쓰지 않습니다. 막대는 숫자 하나만 보여 주고 나머지를 전부 숨깁니다. 대신 분포와 개별 점이 보이는 그림을 씁니다.

## 예시로 이해하기

아래 데이터는 모두 `numpy`로 만든 **가상 데이터**입니다.

### 예시 1 — 평균은 같은데 전혀 다른 두 집단

```python
import numpy as np

a = np.array([4.8, 4.9, 5.0, 5.1, 5.2])
b = np.array([1.0, 1.2, 5.0, 8.8, 9.0])
print("A 평균:", round(a.mean(), 2), " B 평균:", round(b.mean(), 2))
print("A 범위:", a.min(), "~", a.max(), " B 범위:", b.min(), "~", b.max())
```

출력:

```text
A 평균: 5.0  B 평균: 5.0
A 범위: 4.8 ~ 5.2  B 범위: 1.0 ~ 9.0
```

평균 막대를 그리면 A와 B는 똑같은 높이의 막대 두 개가 됩니다. 점을 찍어야 차이가 보입니다.

### 예시 2 — 연습용 가상 데이터 만들기 + histogram

PD군과 대조군 각 30명의 나이와 "보행 시간 변동성"(걸음마다 걸리는 시간이 얼마나 들쭉날쭉한가)을 가상으로 만듭니다.

```python
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

os.makedirs("../figures", exist_ok=True)   # figures 폴더가 없으면 만든다

rng = np.random.default_rng(42)  # 같은 숫자(seed)를 쓰면 매번 같은 가상 데이터가 나온다

n_control, n_pd = 30, 30
df = pd.DataFrame({
    "group": ["Control"] * n_control + ["PD"] * n_pd,
    "age": np.concatenate([rng.normal(62, 8, n_control), rng.normal(66, 8, n_pd)]).round(0),
})
# 보행 변동성(%): 나이가 많을수록, PD군일수록 조금 크게 만든 가상 값
df["stride_cv"] = (
    1.0 + 0.03 * (df["age"] - 60) + np.where(df["group"] == "PD", 0.8, 0.0)
    + rng.normal(0, 0.4, len(df))
).round(2)

print(df.head())
print(df.groupby("group")["stride_cv"].describe().round(2))

fig, ax = plt.subplots(figsize=(6, 4))
ax.hist(df["stride_cv"], bins=12, color="gray", edgecolor="white")
ax.set_xlabel("Stride time variability (CV, %)")
ax.set_ylabel("Number of participants")
ax.set_title("Distribution of stride variability (simulated, n=60)")
fig.tight_layout()
fig.savefig("../figures/fig01_histogram.png", dpi=150)
plt.show()
```

출력(그림 위에 나오는 글자 부분):

```text
     group   age  stride_cv
0  Control  64.0       0.45
1  Control  54.0       0.69
2  Control  68.0       1.31
3  Control  70.0       1.53
4  Control  46.0       0.86
         count  mean   std   min   25%   50%   75%   max
group                                                   
Control   30.0  1.02  0.30  0.45  0.79  0.98  1.23  1.53
PD        30.0  1.90  0.39  1.31  1.65  1.87  2.19  2.76
```

그림에는 0.5에서 2.8 사이에 넓게 퍼진 회색 막대들이 나옵니다. 봉우리가 하나로 뾰족하지 않고 옆으로 넓적한데, 서로 다른 두 군이 섞여 있기 때문입니다. histogram만으로는 "왜 넓은지" 알 수 없고, 그래서 다음 그림이 필요합니다.

코드 읽는 법: `fig, ax = plt.subplots()`에서 `fig`는 **도화지**, `ax`는 도화지 위의 **그림 칸**입니다. 그리는 일(`hist`, `set_xlabel`)은 `ax`에게 시키고, 저장(`savefig`)은 `fig`에게 시킵니다.

### 예시 3 — boxplot + 개별 점, 그리고 scatter plot

예시 2와 **같은 노트북에서 이어서** 실행합니다(`df`와 `rng`를 그대로 씁니다).

```python
colors = {"Control": "#0072B2", "PD": "#D55E00"}  # 색각 이상에도 구분되는 파랑/주황
groups = ["Control", "PD"]

# --- boxplot + 개별 점 ---
fig, ax = plt.subplots(figsize=(5, 4))
data = [df.loc[df["group"] == g, "stride_cv"] for g in groups]
ax.boxplot(data, showfliers=False)          # 이상치 점은 아래에서 직접 그리므로 끈다
ax.set_xticks([1, 2])
ax.set_xticklabels(groups)
for i, g in enumerate(groups, start=1):
    y = df.loc[df["group"] == g, "stride_cv"]
    x = rng.normal(i, 0.05, len(y))          # 점이 겹치지 않게 살짝 흩뿌린다(jitter)
    ax.scatter(x, y, color=colors[g], alpha=0.6, s=20)
ax.set_xlabel("Group")
ax.set_ylabel("Stride time variability (CV, %)")
ax.set_title("Stride variability by group (simulated)")
fig.tight_layout()
fig.savefig("../figures/fig02_boxplot.png", dpi=150)
plt.show()

# --- scatter plot ---
fig, ax = plt.subplots(figsize=(6, 4))
for g in groups:
    sub = df[df["group"] == g]
    ax.scatter(sub["age"], sub["stride_cv"], color=colors[g], label=g, alpha=0.7)
ax.set_xlabel("Age (years)")
ax.set_ylabel("Stride time variability (CV, %)")
ax.set_title("Age vs. stride variability (simulated)")
ax.legend(title="Group")
fig.tight_layout()
fig.savefig("../figures/fig03_scatter.png", dpi=150)
plt.show()
```

boxplot에서는 PD군 상자가 Control군 상자보다 위에 있고, 그 위에 30개씩의 점이 찍혀 있습니다. scatter plot에서는 점들이 오른쪽 위로 올라가는 경향(나이가 많을수록 변동성이 큼)이 보이고, 같은 나이에서도 주황 점(PD)이 파랑 점(Control)보다 대체로 위에 있습니다.

여기서 중요한 관찰 하나. boxplot만 보면 "PD군이 더 높다"로 끝납니다. scatter plot을 보면 "그런데 나이도 관련이 있네?"라는 새로운 질문이 생깁니다. PD군의 평균 나이가 더 많다면, boxplot에서 본 차이의 일부는 병이 아니라 **나이** 때문일 수 있습니다. 이것이 Day 7에 다룰 교란변수입니다. 그림 한 장은 한 가지 질문에만 답하므로, 여러 각도에서 그려 봐야 합니다.

## 직접 해보기

1. **노트북을 엽니다.** 어제 만든 `notebooks/01_setup_and_metadata.ipynb`를 열고, 맨 아래에 Markdown 셀로 `## Day 5 — 시각화`라는 제목을 답니다.

2. **예시 1, 2, 3을 순서대로 입력해 실행합니다.** 그림 세 장이 노트북에 보이고, `figures/` 폴더에 PNG 파일 세 개가 생겼는지 확인합니다.

   ```bash
   ls ~/Documents/neurodegeneration-bioinformatics/figures
   ```

   예상 출력:

   ```text
   fig01_histogram.png  fig02_boxplot.png  fig03_scatter.png
   ```

3. **실험 1 — bin 개수 바꾸기.** histogram 코드에서 `bins=12`를 `bins=4`와 `bins=40`으로 각각 바꿔 그려 봅니다(이때는 `savefig` 줄을 잠시 `#`로 막아 두세요). 같은 데이터가 어떻게 달라 보이는지 Markdown 셀에 두 문장으로 적습니다.

4. **실험 2 — 군별로 겹친 histogram.** 아래 코드를 실행해, 예시 2의 "넓적한 분포"가 사실은 두 봉우리였음을 확인합니다.

   ```python
   fig, ax = plt.subplots(figsize=(6, 4))
   for g in groups:
       ax.hist(df.loc[df["group"] == g, "stride_cv"], bins=10, alpha=0.6, color=colors[g], label=g)
   ax.set_xlabel("Stride time variability (CV, %)")
   ax.set_ylabel("Number of participants")
   ax.set_title("Stride variability by group (simulated)")
   ax.legend(title="Group")
   fig.tight_layout()
   plt.show()
   ```

5. **실험 3 — 일부러 나쁜 그림 만들기.** boxplot 코드를 복사한 다음 `ax.set_xlabel`, `ax.set_ylabel`, `ax.set_title` 세 줄을 지우고, `ax.set_ylim(1.0, 1.2)` 한 줄을 추가해 그려 봅니다. 이 그림을 처음 보는 사람이 무엇을 오해할 수 있는지 두 문장으로 적습니다. (이 그림은 저장하지 않습니다.)

6. **각 그림에 캡션을 씁니다.** 그림 셀 바로 아래 Markdown 셀에 한두 문장씩 적습니다. 형식: "**Figure 1.** 무엇을 그렸는가. 표본 수. 가상 데이터 여부." 해석(왜 그런가)이 아니라 **보이는 것**만 적습니다.

   예: "**Figure 2.** 군별 보행 시간 변동성. 상자는 중앙값과 사분위수, 점은 개별 참가자(군당 n=30). 가상 데이터."

7. **체크리스트로 스스로 채점합니다.** 세 그림 각각에 대해 축 이름·단위·제목·범례(필요한 경우)·"simulated" 표시가 있는지 확인합니다.

8. **저장, 일지, commit.**

   ```bash
   cd ~/Documents/neurodegeneration-bioinformatics
   git add notebooks/01_setup_and_metadata.ipynb figures/ learning-log.md
   git commit -m "Day 5: histogram, boxplot, scatter plot 작성"
   ```

> ⚠️ **흔한 오류 1 — 그림에 한글이 네모(□□□)로 나온다**
> matplotlib의 기본 글꼴에 한글이 없어서 그렇습니다. 가장 쉬운 방법은 오늘처럼 축 이름을 영어로 쓰는 것입니다. 꼭 한글을 쓰고 싶다면 macOS에서는 그림을 그리기 전에 아래 두 줄을 실행하세요.
> ```python
> plt.rcParams["font.family"] = "AppleGothic"
> plt.rcParams["axes.unicode_minus"] = False   # 마이너스 기호가 깨지는 것을 막는다
> ```

> ⚠️ **흔한 오류 2 — `NameError: name 'df' is not defined`**
> 예시 3을 예시 2보다 먼저 실행했거나, 커널을 다시 시작한 뒤 중간 셀부터 실행했을 때 납니다. 노트북의 셀은 **위에서부터 순서대로** 실행해야 합니다. 메뉴의 Run → Run All Cells로 처음부터 다시 실행하세요.

## 퀴즈

**1.** "PD군과 대조군에서 보행 변동성의 분포가 어떻게 다른가?"에 답하는 데 가장 알맞은 그림은?

- (a) 전체 참가자의 histogram 하나
- (b) 군별 boxplot에 개별 점을 겹친 그림
- (c) 나이와 보행 변동성의 scatter plot
- (d) 군별 평균만 보여 주는 막대그래프

<details><summary>정답 보기</summary>

**(b)**. 범주(군) 하나와 숫자 변수 하나의 관계는 boxplot이 답합니다. 개별 점을 겹치면 표본 수와 실제 값의 흩어짐까지 보입니다. (d)는 평균 하나만 보여 주고 분포를 숨깁니다.

</details>

**2.** boxplot에서 상자의 위아래 변과 가운데 선은 각각 무엇을 나타내나요? (단답)

<details><summary>정답 보기</summary>

아래 변은 25번째 백분위수, 위 변은 75번째 백분위수, 가운데 선은 중앙값(50번째 백분위수)입니다. 따라서 상자 안에는 전체 값의 가운데 절반이 들어 있습니다.

</details>

**3.** 군당 표본이 4개인 데이터에서 boxplot만 그리고 개별 점을 찍지 않으면 생기는 문제는?

- (a) 그림 파일이 커진다.
- (b) 상자가 4개의 값으로 만들어졌다는 사실이 보이지 않아, 실제보다 믿을 만해 보인다.
- (c) matplotlib이 오류를 낸다.
- (d) 중앙값을 계산할 수 없다.

<details><summary>정답 보기</summary>

**(b)**. 상자는 4개로 그리든 400개로 그리든 같은 모양입니다. 작은 표본에서는 값 하나가 상자 전체의 위치를 바꿀 수 있으므로, 개별 점을 보여 주어 독자가 직접 판단하게 해야 합니다.

</details>

**4.** y축을 1.0–1.2 범위로 잘라 그린 그림이 독자를 오해하게 만드는 이유를 한두 문장으로 쓰세요. (단답)

<details><summary>정답 보기</summary>

축을 좁게 자르면 작은 차이가 그림 전체를 채워 매우 큰 차이처럼 보이고, 그 범위 밖의 데이터는 아예 보이지 않게 됩니다. 독자는 그림의 **모양**으로 크기를 판단하기 때문에, 숫자가 정확해도 인상은 왜곡됩니다.

</details>

**5.** 예시 3의 scatter plot에서 "나이가 많을수록 변동성이 크고, PD군이 평균적으로 나이가 더 많다"는 것을 보았습니다. boxplot의 군 차이를 해석할 때 무엇을 조심해야 할까요? (단답)

<details><summary>정답 보기</summary>

boxplot에서 보이는 군 차이의 일부가 질환이 아니라 나이 차이 때문일 수 있다는 점입니다. 나이처럼 군과도 관련되고 결과와도 관련된 변수를 교란변수라고 하며, 비슷한 나이끼리 비교하거나 분석에서 나이를 함께 고려해야 합니다.

</details>

## 더 알아보기

> **📚 같은 그림을 R ggplot2로 그린다면**
> ggplot2는 그림을 데이터, 축·색에 연결할 변수(aes), 그리는 모양(geom)의 층으로 쌓습니다. 유전자별 작은 칸을 나란히 두는 `facet_wrap()`과 개별 점을 흩뿌리는 `geom_jitter()`로 "작은 표본은 점을 보여 준다"는 원칙을 그대로 지킬 수 있습니다. 논문 그림의 상당수가 ggplot2로 만들어지므로, 문법을 알면 그림이 어떻게 만들어졌는지 읽는 데도 도움이 됩니다.
> → [심화 A — Day A5: 표 다루기와 그림: base R, dplyr, ggplot2](../advanced/A-r-bioconductor/day-A5.md)

> **📚 MATLAB 그림은 핸들로 고친다**
> MATLAB 그림은 figure → axes → 선·면·영상 객체의 계층이고, 각 객체를 핸들로 받아 `set`으로 한꺼번에 고칠 수 있습니다. 축 눈금을 바깥으로, 위·오른쪽 테두리를 없애고, 패널끼리 축 범위를 맞추는 원칙은 matplotlib과 같습니다. 개별 시행 전체를 `imagesc`로 그려 보면 평균에 묻힌 이상 시행을 쉽게 찾습니다.
> → [심화 B — Day B5: 데이터 입출력과 시각화: 파일을 읽고, 쓰고, 그림으로 남기기](../advanced/B-matlab/day-B5.md)

## 오늘의 산출물 체크리스트
- [ ] `figures/`에 `fig01_histogram.png`, `fig02_boxplot.png`, `fig03_scatter.png`가 있다.
- [ ] 세 그림 모두 축 이름(단위 포함)과 제목이 있고, scatter plot에는 범례가 있다.
- [ ] 세 그림 모두 "simulated"라고 표시되어 있다.
- [ ] 각 그림 아래에 캡션을 썼다.
- [ ] bin 개수 실험과 "나쁜 그림" 실험의 관찰을 적었다.
- [ ] commit을 남겼다.

---
[← 이전](day-04.md) · [코스 지도](../../README.md) · [다음 →](day-06.md)
