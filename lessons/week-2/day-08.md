# Day 8 — 분포와 요약통계: 숫자 하나로 줄이기 전에 모양부터 보기

> **주차:** 2주차 · **예상 시간:** 75–90분 · **산출물:** `notebooks/02_statistics_basics.ipynb`

## 오늘의 목표
- 평균·중앙값, 표준편차·IQR이 각각 무엇을 요약하는지 설명할 수 있다.
- 이상치(outlier) 하나가 어떤 요약통계를 크게 흔들고 어떤 것은 거의 흔들지 못하는지 시뮬레이션으로 보여줄 수 있다.
- 표본이 작을 때 요약통계 대신 개별 점을 그려야 하는 이유를 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [Calculating the Mean, Variance and Standard Deviation, Clearly Explained!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=SzZ6GpcfoQY) (14:22)
- **무엇에 주목할까:** "모집단(population)의 평균"과 "표본(sample)으로 추정한 평균"을 구분하는 부분을 잘 보세요. 표준편차를 구할 때 왜 n이 아니라 n−1로 나누는지도 나옵니다. 오늘 코드의 `ddof=1`이 바로 그 n−1입니다.

- [Boxplots are Awesome!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=fHLhBnmwUM0) (2:33)
- **무엇에 주목할까:** 상자의 가운데 선, 상자의 위·아래 끝, 수염, 바깥의 점이 각각 무엇인지 확인하세요. 1주차 Day 5에서 그렸던 boxplot이 사실은 중앙값과 IQR을 그린 그림이라는 점이 오늘의 핵심과 연결됩니다.

## 개념 설명

### 분포: 데이터의 "체형"

혈압을 200명에게서 쟀다고 합시다. 숫자 200개를 다 읽을 수는 없으니 우리는 "평균 120"처럼 한 숫자로 줄입니다. 하지만 줄이기 전에 먼저 봐야 할 것이 있습니다. 값들이 어디에 얼마나 몰려 있는지, 즉 **분포(distribution)** 입니다. 분포는 데이터의 체형과 같습니다. 키와 몸무게가 같아도 체형은 다를 수 있듯이, 평균이 같아도 분포의 모양은 전혀 다를 수 있습니다.

생물학 데이터에서 자주 만나는 모양은 두 가지입니다. 하나는 가운데가 볼록하고 좌우가 대칭인 **정규분포(normal distribution)** 모양으로, 성인의 키나 반복 측정 오차가 대개 이렇습니다. 다른 하나는 대부분은 낮은 값에 몰려 있고 소수만 아주 높은 **오른쪽으로 치우친 분포(right-skewed distribution)** 입니다. 유전자 발현량, 혈중 사이토카인 농도, 입원 기간이 전형적입니다. 대부분의 유전자는 조금만 발현되고 몇몇 유전자만 엄청나게 발현되기 때문입니다.

### 중심을 말하는 두 가지 방법: 평균과 중앙값

**평균(mean)** 은 모든 값을 더해 개수로 나눈 것이고, **중앙값(median)** 은 값을 크기순으로 줄 세웠을 때 한가운데 있는 값입니다. 평균은 시소의 균형점이라고 생각하면 됩니다. 시소 끝에 아주 무거운 사람이 한 명 앉으면 균형점이 그쪽으로 크게 끌려갑니다. 중앙값은 줄의 한가운데 선 사람이라서, 맨 끝 사람이 아무리 커도 가운데 사람은 바뀌지 않습니다.

그래서 대칭인 분포에서는 평균과 중앙값이 거의 같고, 오른쪽으로 치우친 분포에서는 평균이 중앙값보다 커집니다. 두 값이 많이 다르다는 사실 자체가 "이 데이터는 치우쳐 있거나 극단값이 있다"는 신호입니다.

### 퍼짐을 말하는 두 가지 방법: 표준편차와 IQR

중심만으로는 부족합니다. 값들이 중심 주변에 얼마나 흩어져 있는지도 알아야 합니다. **표준편차(standard deviation, SD)** 는 "각 값이 평균에서 대략 얼마나 떨어져 있는가"를 나타냅니다. 평균을 기준으로 계산하기 때문에 평균과 마찬가지로 극단값에 민감합니다.

**사분위범위(interquartile range, IQR)** 는 값을 크기순으로 세웠을 때 아래 25% 지점(Q1)과 위 25% 지점(Q3) 사이의 거리입니다. 가운데 절반의 데이터가 차지하는 폭이므로, 양 끝의 극단값은 계산에 거의 영향을 주지 않습니다. 정리하면 **평균과 표준편차가 한 짝**, **중앙값과 IQR이 한 짝**입니다. 앞의 짝은 대칭 분포에서 효율적이고, 뒤의 짝은 치우치거나 이상치가 있는 데이터에서 튼튼합니다(robust).

### 이상치: 지울 대상이 아니라 조사할 대상

**이상치(outlier)** 는 나머지 값들과 동떨어진 값입니다. 흔히 쓰는 기준은 "Q1 − 1.5×IQR보다 작거나 Q3 + 1.5×IQR보다 큰 값"이고, boxplot이 점으로 따로 찍는 값이 바로 이것입니다. 다만 이 기준은 "의심해 볼 후보"를 알려줄 뿐, 그 값이 틀렸다는 뜻은 아닙니다. 피펫 실수나 입력 오류일 수도 있고, 그 개체만의 진짜 생물학적 반응일 수도 있습니다.

이 과정에서 다룰 OSD-536처럼 그룹당 몇 마리뿐인 실험에서는 한 마리가 평균을 통째로 움직일 수 있습니다. 그래서 2주차 핵심 규칙 중 하나가 **"샘플이 적을수록 이상치 및 개별 샘플 plot을 반드시 확인한다"** 입니다. 이상치는 이유 없이 지우지 않고, 발견하면 기록하고, 넣었을 때와 뺐을 때 결론이 달라지는지 확인합니다.

## 예시로 이해하기

### 예시 1 — 대칭 분포와 치우친 분포의 요약통계

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(42)          # seed 고정: 누가 돌려도 같은 난수
normal = rng.normal(loc=100, scale=15, size=200)        # 종 모양 분포
skewed = rng.lognormal(mean=4.5, sigma=0.6, size=200)   # 오른쪽 꼬리가 긴 분포

df = pd.DataFrame({"normal": normal, "skewed": skewed})

summary = pd.DataFrame({
    "mean": df.mean(),
    "median": df.median(),
    "std": df.std(),                                  # 표본 표준편차 (ddof=1)
    "IQR": df.quantile(0.75) - df.quantile(0.25),
})
print(summary.round(1))
```

출력:

```text
         mean  median   std   IQR
normal   99.5    99.2  13.2  17.9
skewed  109.7    93.3  73.0  72.8
```

`normal`은 평균과 중앙값이 거의 같습니다. `skewed`는 평균(109.7)이 중앙값(93.3)보다 16이나 큽니다. 긴 오른쪽 꼬리에 있는 소수의 큰 값이 평균을 끌어올렸기 때문입니다.

### 예시 2 — 이상치 한 개의 위력

```python
import numpy as np

clean = np.array([10, 11, 12, 12, 13, 14])
dirty = np.append(clean, 60)             # 이상치 하나 추가

def iqr(x):
    q1, q3 = np.percentile(x, [25, 75])
    return q3 - q1

for name, x in [("이상치 없음", clean), ("이상치 있음", dirty)]:
    print(f"{name}: 평균={x.mean():.1f}, 중앙값={np.median(x):.1f}, "
          f"표준편차={x.std(ddof=1):.1f}, IQR={iqr(x):.1f}")
```

출력:

```text
이상치 없음: 평균=12.0, 중앙값=12.0, 표준편차=1.4, IQR=1.5
이상치 있음: 평균=18.9, 중앙값=12.0, 표준편차=18.2, IQR=2.0
```

값 하나가 추가됐을 뿐인데 평균은 12.0 → 18.9, 표준편차는 1.4 → 18.2로 뛰었습니다. 중앙값은 그대로이고 IQR은 조금만 변했습니다. "평균 18.9"라는 숫자는 일곱 개 값 중 어느 것과도 닮지 않았습니다.

### 예시 3 — IQR 규칙으로 이상치 후보 찾기

```python
import numpy as np

x = np.array([10, 11, 12, 12, 13, 14, 60])
q1, q3 = np.percentile(x, [25, 75])
iqr = q3 - q1
lower = q1 - 1.5 * iqr
upper = q3 + 1.5 * iqr
print(f"Q1={q1}, Q3={q3}, IQR={iqr}")
print(f"울타리: {lower} ~ {upper}")
print("이상치 후보:", x[(x < lower) | (x > upper)])
```

출력:

```text
Q1=11.5, Q3=13.5, IQR=2.0
울타리: 8.5 ~ 16.5
이상치 후보: [60]
```

울타리(8.5–16.5) 밖에 있는 60이 후보로 잡혔습니다. 이것이 boxplot이 점을 따로 찍는 규칙입니다.

## 직접 해보기

1. JupyterLab(또는 VS Code)을 열고 `notebooks/` 폴더에 `02_statistics_basics.ipynb`를 새로 만듭니다. 첫 셀은 Markdown으로 `# Day 8 — 분포와 요약통계`라고 제목을 답니다.
2. 예시 1의 코드를 한 셀에 붙여 넣고 실행해 같은 표가 나오는지 확인합니다.
3. 다음 셀에서 두 분포를 histogram으로 그리고, 평균(빨간 실선)과 중앙값(검은 점선)을 표시합니다.

   ```python
   import matplotlib.pyplot as plt
   import seaborn as sns

   fig, axes = plt.subplots(1, 2, figsize=(10, 4))
   for ax, col in zip(axes, ["normal", "skewed"]):
       sns.histplot(df[col], bins=30, ax=ax)
       ax.axvline(df[col].mean(), color="red", label="mean")
       ax.axvline(df[col].median(), color="black", linestyle="--", label="median")
       ax.set_title(col)
       ax.legend()
   plt.tight_layout()
   plt.savefig("../figures/day08_distributions.png", dpi=150)
   plt.show()
   ```

   어느 그림에서 두 선이 벌어지는지, 벌어지는 방향이 꼬리 방향과 같은지 Markdown 셀에 한 문장으로 적습니다.
4. 예시 2와 예시 3을 각각 새 셀에서 실행합니다. 그다음 `dirty`의 60을 20으로 바꿔 다시 실행하고, 평균·표준편차가 얼마나 달라지는지, 20은 여전히 이상치 후보인지 확인합니다.
5. 이제 "그룹당 6마리"인 작은 실험을 흉내 냅니다. 예시 1의 `rng`를 이어서 씁니다.

   ```python
   small = pd.DataFrame({
       "group": ["GC"] * 6 + ["FLT"] * 6,
       "expression": np.r_[rng.normal(10, 1, 6), rng.normal(11, 1, 6)],
   })
   small.loc[11, "expression"] = 17      # 일부러 넣은 이상치

   print(small.groupby("group")["expression"].agg(["mean", "median", "std"]).round(2))

   fig, ax = plt.subplots(figsize=(4, 4))
   sns.boxplot(data=small, x="group", y="expression", color="lightgray", ax=ax)
   sns.stripplot(data=small, x="group", y="expression", color="black", size=7, ax=ax)
   plt.tight_layout()
   plt.savefig("../figures/day08_small_sample.png", dpi=150)
   plt.show()
   ```

   1–4단계를 위에서부터 순서대로 한 번씩만 실행했다면 표는 다음과 같습니다(셀을 여러 번 실행했다면 난수가 더 소비되어 숫자가 달라집니다. 그럴 때는 Kernel → Restart & Run All).

   ```text
           mean  median   std
   group
   FLT    11.32   10.29  2.96
   GC     10.12   10.01  0.48
   ```

   FLT의 평균(11.32)과 중앙값(10.29)이 1 넘게 벌어져 있습니다. 그림에서 어느 점이 그 원인인지 찾아보세요.
6. 노트북 맨 아래 Markdown 셀에 다음 세 가지를 자기 말로 적습니다. (a) 평균과 중앙값이 다를 때 의심할 것, (b) 표본이 6개일 때 boxplot만 그리면 안 되는 이유, (c) 이상치를 발견했을 때 할 일.
7. `learning-log.md`에 오늘 배운 점을 2–3줄 적고 commit합니다.

⚠️ **흔한 오류 1 — `FileNotFoundError: ... '../figures/day08_distributions.png'`**
노트북이 `notebooks/` 폴더 안에 있지 않거나 `figures/` 폴더가 아직 없을 때 납니다. 프로젝트 폴더에 `figures/` 폴더를 만들거나, 경로를 `"day08_distributions.png"`로 바꿔 노트북 옆에 저장하세요.

⚠️ **흔한 오류 2 — numpy와 pandas의 표준편차가 다르게 나온다**
`np.std(x)`는 기본이 n으로 나누는 값(`ddof=0`)이고, `df.std()`는 기본이 n−1로 나누는 값(`ddof=1`)입니다. 표본에서 계산할 때는 `np.std(x, ddof=1)` 또는 `x.std(ddof=1)`로 맞춰 줍니다.

## 퀴즈

**1.** 어떤 유전자의 발현량이 대부분 낮고 몇 개 샘플에서만 매우 높습니다. 평균과 중앙값 중 어느 쪽이 더 클까요?

<details><summary>정답 보기</summary>

평균이 더 큽니다. 오른쪽으로 치우친 분포에서는 소수의 큰 값이 평균을 끌어올리지만, 중앙값은 순서의 한가운데 값이라 거의 움직이지 않습니다. 예시 1의 `skewed`에서 평균 109.7, 중앙값 93.3이었던 것과 같은 현상입니다.

</details>

**2.** (객관식) 이상치 하나가 추가되었을 때 가장 덜 변하는 조합은?
① 평균과 표준편차 ② 평균과 IQR ③ 중앙값과 IQR ④ 중앙값과 표준편차

<details><summary>정답 보기</summary>

③ 중앙값과 IQR. 둘 다 값의 "순서"에 기반하기 때문에 맨 끝 값이 아무리 커도 가운데 부분은 거의 그대로입니다. 평균과 표준편차는 모든 값의 크기를 직접 계산에 쓰므로 극단값에 크게 흔들립니다.

</details>

**3.** (단답) 값이 `[4, 5, 5, 6, 7, 8, 30]`일 때 Q1=5.0, Q3=7.5입니다. IQR 규칙의 위쪽 울타리는 얼마이고, 30은 이상치 후보인가요?

<details><summary>정답 보기</summary>

IQR = 7.5 − 5.0 = 2.5이므로 위쪽 울타리는 7.5 + 1.5×2.5 = 11.25입니다. 30은 11.25보다 크므로 이상치 후보입니다. "후보"라는 말이 중요합니다. 이 규칙은 조사할 값을 알려줄 뿐, 지워도 된다는 허가가 아닙니다.

</details>

**4.** 그룹당 6마리인 실험에서 boxplot만 그리지 않고 개별 점(strip plot)을 함께 그려야 하는 이유는?

<details><summary>정답 보기</summary>

점이 6개뿐이면 상자와 수염은 사실상 값 두세 개로 결정되므로, 상자 모양이 안정적인 분포 요약이라고 보기 어렵습니다. 개별 점을 그려야 한 마리가 평균을 끌고 가는지, 값이 두 덩어리로 갈라져 있는지 볼 수 있습니다. 2주차 핵심 규칙 "샘플이 적을수록 이상치 및 개별 샘플 plot을 반드시 확인한다"가 이 내용입니다.

</details>

**5.** 실험 노트에 근거가 없는데도 이상치로 보이는 샘플을 바로 삭제하면 왜 문제가 될까요?

<details><summary>정답 보기</summary>

그 값이 측정 오류인지 진짜 생물학적 변이인지 알 수 없는 상태에서 지우면, 결과를 원하는 방향으로 고르는 것과 구별되지 않습니다. 올바른 순서는 원인을 조사하고(메타데이터, 실험 기록), 발견 사실을 기록하고, 포함·제외 두 경우의 결과를 모두 확인하는 것입니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/02_statistics_basics.ipynb`가 위에서 아래로 오류 없이 실행된다.
- [ ] 대칭/치우친 분포의 요약통계 표와 histogram(평균·중앙값 선 포함)이 있다.
- [ ] 이상치 실험(예시 2, 3)과 60 → 20 변경 결과가 있다.
- [ ] 작은 표본의 boxplot + 개별 점 그림이 있다.
- [ ] 노트북 끝에 자기 말로 쓴 3문장 정리가 있다.
- [ ] `learning-log.md` 기록과 commit을 남겼다.

---
[← 이전](../week-1/day-07.md) · [코스 지도](../../README.md) · [다음 →](day-09.md)
