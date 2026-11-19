# Day I13 — 보행 변수: 평균, 변동성, 비대칭, 그리고 속도라는 함정

> **주차:** 심화 파트 I — 보행분석 (2주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I13_gait_variables.ipynb`, `reports/advanced/I/I13_group_table.md`(군 비교 표 1개)
>
> **먼저 끝내 둘 레슨:** [Day I12](day-I12.md)(`gait_events.py`와 사건 규칙), [Day 26 — 기본 feature 추출](../../week-4/day-26.md)(record-level vs participant-level 표), [Day 30 — 단변량 군 비교](../../week-5/day-30.md)(Cohen's d, bootstrap CI)
>
> **이론 노트:** [T08 — 측정 원리와 오차](../I-gait-theory/note-T08.md), [T09 — 신호처리의 이론](../I-gait-theory/note-T09.md) — 사건 검출 오차가 변동성 지표에 어떻게 스며드는지, 파형 수준의 변동성 지표와의 차이를 다룹니다.

## 오늘의 목표
- stride time CV, swing time CV, 좌우 비대칭 지수를 정의대로 계산하고, 참가자 한 명당 한 행으로 접을 수 있다.
- PD에서 변동성이 왜 관심 지표인지 문헌(Mirelman 2019, Hausdorff 2007)으로 설명하고, 그 문헌이 말하지 **않는** 것을 구분할 수 있다.
- PD군과 대조군을 효과크기와 참가자 단위 bootstrap 95% CI로 비교하고, **보행 속도**를 함께 고려하면 결론이 어떻게 달라지는지 보일 수 있다.

## 🎬 영상으로 먼저 보기

- [Parkinson's gait variability (YouTube 검색 링크)](https://www.youtube.com/results?search_query=gait+variability+Parkinson%27s+disease+stride+time) (검색 링크)
- **무엇에 주목할까:** 이 주제에는 확인된 짧은 강의 영상을 찾지 못해 검색 링크를 둡니다. 연구실 강연이나 학회 발표를 고를 때, 변동성을 **어떤 장비로 몇 걸음 재서**, **어떤 식(SD? CV?)** 으로 계산했는지 말해 주는 영상을 고르세요. 그 두 가지가 없으면 숫자를 비교할 수 없습니다.

## 개념 설명

### 시공간 변수: 정의를 먼저 맞춘다

Whittle 교재의 정의를 따릅니다([W] 2장 pp.17–21). **stride**는 한 발의 IC에서 같은 발의 다음 IC까지, **step**은 한 발의 IC에서 반대 발의 IC까지입니다. **cadence**는 분당 **step** 수(steps/min)이고, stride time = 120 / cadence입니다. **속도** = stride length × cadence / 120(m/s)입니다. Perry는 같은 관계를 m/min 단위로 "stride length × cadence / 2"로 쓰고, 성인의 평소 속도 평균을 약 82 m/min(≈ 1.37 m/s), stride length 1.41 m, cadence 113 steps/min으로 정리합니다([P] 23장). gaitpdb는 깔창 힘 센서라 시간 변수(stride·stance·swing time)는 있지만 **길이 변수(stride length)는 없습니다.** 속도는 demographics 표의 `Speed_01`(별도로 잰 평소 걷기 속도, m/s)을 씁니다.

대부분의 보행 장애에서 속도·cadence·stride length는 **함께** 변합니다([W] 4장 p.67). 그리고 속도가 바뀌면 stance %, 지면반력, 관절 각도까지 바뀝니다. 이 사실이 오늘 마지막 절의 함정으로 이어집니다.

### 변동성과 비대칭: 무엇을 왜 재나

- **CV(coefficient of variation, 변동계수)** = SD ÷ 평균 × 100(%). 한 사람이 걸음마다 얼마나 같은 리듬으로 걷는지를 평균 대비 비율로 나타냅니다([Day 26](../../week-4/day-26.md)). stride time CV와 swing time CV를 따로 봅니다. 파형 전체의 반복성을 재는 [Wi]의 CV(식 2.20, p.32)와는 다른 양이니 섞지 마세요.
- **비대칭 지수(symmetry index, SI)** = |왼쪽 − 오른쪽| ÷ (두 값의 평균) × 100(%). 오늘은 평균 swing time으로 계산합니다. 비대칭 지수는 정의가 여러 가지라(비율, 로그 비율 등) 논문마다 식을 확인해야 합니다. 이 식은 흔히 쓰는 형태 중 하나입니다.

PD에서 이 변수들을 보는 이유는 무엇일까요? Mirelman 2019 리뷰는 PD 초기에 속도와 step length가 줄고(이것은 PD에만 특이하지 않음), 팔 흔들기 감소, 사지 간 **비대칭**, 걸음 간 **변동성 증가**가 더 PD에 특이한 신호일 수 있으며, 변동성 증가는 자동성 저하와 의식적 조절의 증가를 반영한다고 해석합니다. 회전이나 이중과제에서 이런 이상이 더 커지고, 실험실 밖 일상 측정이 추가 정보를 준다는 점도 정리합니다([Mirelman 2019](https://doi.org/10.1016/S1474-4422(19)30044-4)). 단, 같은 리뷰는 질병이 양측으로 진행하면 비대칭은 오히려 줄 수 있다고 덧붙입니다.

Hausdorff 2007은 PD 29명과 대조군 26명에서 평소 걷기의 stride 간 변동성이 PD군에서 높았고, 리듬 청각 자극(RAS)을 평소 cadence의 **110%** 로 주었을 때 PD군의 변동성이 줄었으며 그 효과가 2분·15분 뒤에도 남았다고 보고합니다. 반면 **100%** 박자에서는 속도·stride length·swing time만 좋아지고 변동성은 유의하게 변하지 않았고, **대조군은 RAS로 stride time 변동성이 오히려 늘었습니다**([Hausdorff 2007](https://doi.org/10.1111/j.1460-9568.2007.05810.x), 이 과정에서는 초록만 확인). 이 연구는 gaitpdb의 원 연구 중 하나(Ju 연구)이기도 합니다. "RAS가 변동성을 줄인다"를 조건 없이 일반화하지 않습니다(→ Day I20).

변동성이 클수록 "나쁘다"는 단순화도 조심합니다. Whittle은 습관적으로 다르게 걷는 보행은 변동이 크고, 병으로 바꿀 여지가 줄어든 보행은 오히려 재현성이 높을 수 있다고 지적합니다. 다만 실조나 PD의 FOG처럼 변동 자체가 병의 일부인 경우는 예외입니다([W] 5장 p.90).

### 참가자 단위로 접고, 효과크기와 CI로 비교한다

한 사람의 stride 90개는 표본 90개가 아니라 **그 사람의 값 하나를 만드는 재료**입니다. 오늘 표는 한 행이 한 참가자이고, 각 열은 그 사람의 CV·비대칭 지수입니다([Day 26](../../week-4/day-26.md)). 이 표로 Day 30의 방법을 그대로 씁니다. **Cohen's d**(PD − 대조군, 합동 SD로 나눔)로 "얼마나 다른가"를, **참가자 단위 bootstrap 95% CI**로 "그 값을 얼마나 믿을 수 있나"를 봅니다. bootstrap에서 다시 뽑는 단위가 stride가 아니라 **참가자**라는 점이 핵심입니다.

### 속도라는 함정

PD군은 대조군보다 느리게 걷습니다. 그런데 사람은 느리게 걸을수록 걸음 간 리듬이 덜 일정해질 수 있습니다. 그러면 "PD군의 CV가 높다"는 결과가 **병 때문인지, 느린 속도 때문인지** 구분이 안 됩니다. Perry 교재도 속도가 stance 비율과 여러 변수를 바꾸므로 군 비교에서 속도를 고려하라고 합니다([P] 1장, 23장). 가장 단순한 확인은 **속도를 함께 넣은 회귀**입니다: CV = b₀ + b₁·(PD 여부) + b₂·(속도). b₁이 "같은 속도일 때의 군 차이"를 어림합니다.

하지만 속도 보정이 "정답"인 것도 아닙니다. 느린 속도 자체가 병의 결과라면, 속도를 보정하는 것은 병의 효과 일부를 지우는 일이 될 수 있습니다. 그래서 **보정 전과 보정 후를 함께 보고**하고, 어느 질문에 답하는 숫자인지 적습니다. 느린 속도로 맞춰 걷게 한 대조군과 비교하는 실험 설계도 대안입니다.

## 예시로 이해하기

> **데이터:** Hausdorff JM. *Gait in Parkinson's Disease* (v1.0.0). PhysioNet; 2008. [doi:10.13026/C24H3N](https://doi.org/10.13026/C24H3N), 라이선스 ODC-By 1.0(인용 시 PhysioNet 페이지의 표준 인용도 함께). [Day 24](../../week-4/day-24.md)의 `wget -r -N -c -np https://physionet.org/files/gaitpdb/1.0.0/`로 받은 폴더에서 `*_01.txt`(평소 걷기, 165개)와 `demographics.txt`를 `data/gaitpdb/`에 둡니다. demographics의 Group 1 = PD, 2 = 대조군. 신호 파일은 PD 93개, 대조군 72개입니다(대조군 한 명은 demographics의 ID와 신호 파일 이름이 맞지 않아 신호가 없습니다). 예시 1은 [Day I12](day-I12.md)에서 저장한 `gait_events.py`를 씁니다.

### 예시 1 — 165개 기록을 참가자 표 하나로

```python
import glob, os
import numpy as np, pandas as pd
from gait_events import strides

fs = 100
demo = pd.read_csv("data/gaitpdb/demographics.txt", sep="\t", usecols=range(20))  # 앞 20열만(Day 25)
demo["group"] = demo["Group"].map({1: "PD", 2: "CO"})

def cv(x):
    return 100 * x.std(ddof=1) / x.mean()

rows = []
for path in sorted(glob.glob("data/gaitpdb/*_01.txt")):     # 평소 걷기(walk 01)만
    pid = os.path.basename(path)[:6]                          # 예: GaCo01
    d = np.loadtxt(path)
    feet = {}
    for col, side in [(17, "L"), (18, "R")]:
        r, ok = strides(d[:, col], 20, fs)                    # Day I12의 규칙 그대로
        feet[side] = r[ok]
    swL, swR = feet["L"][:, 3].mean(), feet["R"][:, 3].mean()
    rows.append(dict(
        ID=pid,
        n_strides=min(len(feet["L"]), len(feet["R"])),
        stride_cv=np.mean([cv(feet[s][:, 1]) for s in "LR"]),  # 좌우 발 CV의 평균
        swing_cv=np.mean([cv(feet[s][:, 3]) for s in "LR"]),
        swing_asym=100 * abs(swL - swR) / (0.5 * (swL + swR)), # 대칭 지수(%)
    ))
feat = pd.DataFrame(rows).merge(demo[["ID", "Study", "group", "Speed_01"]], on="ID", how="left")
assert feat["ID"].is_unique and feat["group"].notna().all()   # 한 행 = 한 참가자, 군 정보 빠짐 없음
print(feat.groupby("group").agg(n=("ID", "size"), 최소_stride=("n_strides", "min"),
                                stride_중앙값=("n_strides", "median")))
feat.to_csv("I13_participants.csv", index=False)
```

실행 결과(165개 파일 처리에 1분 안팎):

```text
        n  최소_stride  stride_중앙값
group                           
CO     72         29        92.5
PD     93         31        92.0
```

참가자마다 규칙을 통과한 stride가 최소 29개, 보통 90개 남짓입니다. [Day I8](day-I8.md) 예시 2에서 본 것처럼 30개 안팎이면 CV 추정이 꽤 흔들리므로, stride 수가 적은 참가자는 해석할 때 표시해 둡니다.

### 예시 2 — 군 비교: 효과크기, bootstrap CI, 그리고 속도

```python
import numpy as np, pandas as pd

df = pd.read_csv("I13_participants.csv")              # 한 행 = 한 참가자(걷기 01 기록 하나)
FEATS = ["stride_cv", "swing_cv", "swing_asym", "Speed_01"]
rng = np.random.default_rng(13)

def cohen_d(a, b):                                # PD − CO, 합동 표준편차
    na, nb = len(a), len(b)
    sp = np.sqrt(((na - 1) * a.var(ddof=1) + (nb - 1) * b.var(ddof=1)) / (na + nb - 2))
    return (a.mean() - b.mean()) / sp

def boot_ci(a, b, stat, B=5000):
    vals = [stat(rng.choice(a, len(a)), rng.choice(b, len(b))) for _ in range(B)]   # 군마다 참가자를 복원 추출
    return np.percentile(vals, [2.5, 97.5])

print(f"{'변수':11s} {'PD 중앙값':>9s} {'CO 중앙값':>9s} {'d (PD−CO)':>9s}  95% bootstrap CI")
for f in FEATS:
    sub = df.dropna(subset=[f])
    a = sub.loc[sub.group == "PD", f].to_numpy()
    b = sub.loc[sub.group == "CO", f].to_numpy()
    lo, hi = boot_ci(a, b, cohen_d)
    print(f"{f:11s} {np.median(a):9.2f} {np.median(b):9.2f} {cohen_d(a, b):9.2f}  [{lo:5.2f}, {hi:5.2f}]  (n = {len(a)}, {len(b)})")

# 속도를 함께 넣으면 군 차이는 얼마나 남나: stride_cv = b0 + b1·PD + b2·속도
sub = df.dropna(subset=["Speed_01"]).reset_index(drop=True)
def pd_coef(s):
    X = np.column_stack([np.ones(len(s)), (s.group == "PD").astype(float), s.Speed_01])
    return np.linalg.lstsq(X, s.stride_cv.to_numpy(), rcond=None)[0]
coef = pd_coef(sub)
boots = np.array([pd_coef(sub.iloc[rng.integers(0, len(sub), len(sub))]) for _ in range(5000)])
lo, hi = np.percentile(boots[:, 1], [2.5, 97.5])
raw = sub.loc[sub.group == "PD", "stride_cv"].mean() - sub.loc[sub.group == "CO", "stride_cv"].mean()
print(f"\nstride_cv 평균 차이(PD − CO): 속도 미보정 {raw:.2f}%p → 속도 보정 {coef[1]:.2f}%p [{lo:.2f}, {hi:.2f}]")
print(f"속도 1 m/s 증가당 stride_cv 변화: {coef[2]:.2f}%p")
for g in ["PD", "CO"]:
    s = sub[sub.group == g]
    print(f"{g}: 속도와 stride_cv의 상관 r = {np.corrcoef(s.Speed_01, s.stride_cv)[0, 1]:.2f} (n = {len(s)})")
```

실행 결과:

```text
변수             PD 중앙값    CO 중앙값 d (PD−CO)  95% bootstrap CI
stride_cv        3.12      2.82      0.63  [ 0.37,  0.89]  (n = 93, 72)
swing_cv         7.57      5.62      0.69  [ 0.44,  0.95]  (n = 93, 72)
swing_asym       5.25      1.91      0.73  [ 0.47,  1.01]  (n = 93, 72)
Speed_01         1.08      1.25     -1.09  [-1.39, -0.82]  (n = 92, 72)

stride_cv 평균 차이(PD − CO): 속도 미보정 0.69%p → 속도 보정 0.20%p [-0.13, 0.53]
속도 1 m/s 증가당 stride_cv 변화: -2.39%p
PD: 속도와 stride_cv의 상관 r = -0.53 (n = 92)
CO: 속도와 stride_cv의 상관 r = -0.07 (n = 72)
```

읽는 법(탐색적 분석입니다):

- **세 변동성·비대칭 지표 모두 PD군이 높고(d ≈ 0.6–0.7), CI가 0을 포함하지 않습니다.** 하지만 d가 0.7이면 두 군의 분포는 여전히 많이 겹칩니다. 개인을 구분하는 지표라는 뜻이 아닙니다(Day 30).
- **속도의 차이가 더 큽니다(d ≈ −1.1).** 그리고 PD군 안에서는 느리게 걷는 사람일수록 stride time CV가 높습니다(r = −0.53). 대조군에서는 그런 관계가 거의 없습니다(r = −0.07).
- **속도를 함께 넣으면 stride time CV의 군 차이가 0.69 → 0.20%p로 줄고, CI가 0을 포함합니다.** "이 데이터에서 PD군의 stride time 변동성 증가는 상당 부분 느린 속도와 함께 나타난다"까지가 말할 수 있는 범위입니다. 느린 속도가 병의 일부라면 보정이 병의 효과를 지운 것일 수도 있으므로, 두 숫자를 함께 보고합니다.
- **절대값을 문헌과 바로 비교하지 마세요.** 오늘 규칙으로 얻은 swing time CV(대조군 중앙값 약 5.6%)는 PhysioNet 페이지에 실린 예시 값(대조군 한 명 1.3%)보다 큽니다. 사건 문턱, 회전 구간 처리, 이상 stride 제외 규칙이 다르면 CV는 크게 달라집니다(직접 해보기 4). 같은 규칙 안의 **상대 비교**로 읽습니다.
- **연구(Study)가 섞여 있습니다.** gaitpdb는 세 연구(Ga, Ju, Si)의 자료를 합친 것이고, 연구마다 측정 조건이 다를 수 있습니다. 군 구성도 연구마다 다릅니다(직접 해보기 3).

## 직접 해보기

1. `notebooks/advanced/I/I13_gait_variables.ipynb`에서 예시 1–2를 실행해 출력이 같은지 확인합니다.
2. **그림:** 세 지표마다 군별 점 그림(참가자 한 명 = 점 하나) + 중앙값 선을 그립니다. `stride_cv` 대 `Speed_01` 산점도를 군별 색으로 그리고, 군별 회귀선을 겹칩니다. 저장: `figures/advanced/I/I13_variability.png`.
3. **연구별로 나눠 보기:** `df.groupby(["Study", "group"])[["stride_cv", "swing_cv", "Speed_01"]].median()`을 출력합니다. 세 연구에서 방향이 같은가요? 연구마다 참가자 수가 적어지므로 CI를 계산하지 않고 경향만 적습니다.
4. **규칙 민감도:** Day I12의 규칙 ②를 `5 * mad`에서 `3 * mad`로 바꿔 예시 1–2를 다시 돌립니다. 각 군의 swing_cv 중앙값과 d가 얼마나 바뀌는지 표로 적습니다. (절댓값은 크게, 효과크기는 덜 바뀌는지 확인해 보세요.)
5. **속도 보정을 swing_cv와 swing_asym에도:** 예시 2의 회귀를 두 변수에 적용하고, 보정 전후 차이를 표에 추가합니다.
6. `reports/advanced/I/I13_group_table.md`에 군 비교 표 하나를 만듭니다. 열: 변수 | 정의(식) | PD 중앙값 | 대조군 중앙값 | d (PD − CO) [95% CI] | 속도 보정 차이 [95% CI]. 표 아래에 데이터 출처·버전·라이선스, 사용한 사건 규칙(Day I12 문서 링크), "탐색적 분석이며 진단 성능을 뜻하지 않음"을 적습니다.

> ⚠️ **흔한 오류 1:** stride를 행으로 둔 긴 표로 t-test나 bootstrap을 하는 것. 한 사람의 stride 90개가 90명처럼 취급되어 CI가 터무니없이 좁아집니다. 반드시 참가자 표(한 행 = 한 사람)에서 계산합니다.
>
> ⚠️ **흔한 오류 2:** demographics의 `Speed_01`이 결측인 참가자(1명)를 그대로 두고 회귀를 돌리는 것. `numpy.linalg.lstsq`는 NaN이 섞이면 결과 전체가 NaN이 됩니다. `dropna`로 빼고, 몇 명을 뺐는지 적습니다. 또 demographics에는 일부 키가 cm로 적혀 있는 등 단위 오류가 있으니(Day 25), 다른 열을 쓸 때는 범위부터 확인합니다.

## 퀴즈

**1.** stride time의 평균이 1.10 s, SD가 0.033 s다. CV는?

<details><summary>정답 보기</summary>

**3.0%** (0.033 ÷ 1.10 × 100). CV는 평균 대비 흔들림이라 평균 stride time이 다른 사람끼리도 비교할 수 있게 해 줍니다.

</details>

**2.** 평균 swing time이 왼쪽 0.40 s, 오른쪽 0.44 s다. 오늘 식의 비대칭 지수는?

<details><summary>정답 보기</summary>

약 **9.5%** (|0.40 − 0.44| ÷ 0.42 × 100). 비대칭 지수는 정의가 여러 가지이므로 보고할 때 식을 함께 적습니다.

</details>

**3.** PD군의 stride time CV가 높게 나왔다. 이것을 "PD가 리듬 조절을 망가뜨린다"는 근거로 쓰기 전에 확인할 것 두 가지는?

<details><summary>정답 보기</summary>

예: (1) **속도** — PD군이 느리게 걸어서 생긴 차이일 수 있음(오늘 보정 후 차이가 크게 줄었음). (2) **측정·규칙** — 사건 검출 문턱, 제외 규칙, 연구(측정 조건)의 차이. 그 밖에 표본이 관찰 연구라 인과를 말할 수 없다는 점도 정답입니다.

</details>

**4.** Hausdorff 2007에서 RAS가 PD 환자의 stride 간 변동성을 줄인 조건은? 대조군은 어땠나요?

<details><summary>정답 보기</summary>

평소 cadence의 **110%** 박자에서 줄었고(효과가 2분·15분 뒤에도 남음), 100%에서는 변동성이 유의하게 변하지 않았습니다. 대조군은 RAS로 stride time 변동성이 오히려 **늘었습니다**(초록 기준).

</details>

**5.** bootstrap CI를 만들 때 stride를 다시 뽑지 않고 참가자를 다시 뽑는 이유는?

<details><summary>정답 보기</summary>

군 비교에서 독립적인 단위는 참가자이기 때문입니다. 같은 사람의 stride는 서로 닮아 있어(독립이 아님), stride를 단위로 다시 뽑으면 불확실성이 과소평가되어 CI가 실제보다 좁아집니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–2를 실행해 출력이 같음을 확인했다(`I13_participants.csv` 저장).
- [ ] 군별 점 그림과 속도–CV 산점도를 `figures/advanced/I/I13_variability.png`로 저장했다.
- [ ] 연구별 중앙값 표와 규칙 민감도 표를 만들었다.
- [ ] `reports/advanced/I/I13_group_table.md`에 군 비교 표(보정 전·후 포함)와 출처·규칙·해석 한계를 적었다.

## 더 읽을거리
- Richards J, Levine D, eds. *Whittle's Gait Analysis*. 6th ed. Elsevier; 2023 — 2장 pp.17–21(시공간 변수 정의, 속도·cadence 관계, 정규화), 5장 p.90(습관과 병의 변동성).
- Perry J, Burnfield JM. *Gait Analysis: Normal and Pathological Function*. 2nd ed. SLACK; 2010 — 23장 Stride Analysis(정상값, 속도 공식, 정상 변동).
- Mirelman A, Bonato P, Camicioli R, et al. Gait impairments in Parkinson's disease. *Lancet Neurol*. 2019;18(7):697–708. [doi:10.1016/S1474-4422(19)30044-4](https://doi.org/10.1016/S1474-4422(19)30044-4).
- Hausdorff JM, Lowenthal J, Herman T, et al. Rhythmic auditory stimulation modulates gait variability in Parkinson's disease. *Eur J Neurosci*. 2007;26(8):2369–2375. [doi:10.1111/j.1460-9568.2007.05810.x](https://doi.org/10.1111/j.1460-9568.2007.05810.x).
- Duarte M, Watanabe RN. *Notes on Scientific Computing for Biomechanics and Motor Control* (v0.2.0, CC BY 4.0). [doi:10.5281/zenodo.23654869](https://doi.org/10.5281/zenodo.23654869) — `spatial_temporal_characteristics`.

---
[← 이전](day-I12.md) · [코스 지도](../../../README.md) · [다음 →](day-I14.md)
