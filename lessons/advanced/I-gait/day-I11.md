# Day I11 — 신호처리 II: 시간 정규화, ensemble average, 그리고 센서 융합

> **주차:** 심화 파트 I — 보행분석 (2주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I11_ensemble.ipynb`, `figures/advanced/I/I11_ensemble.png`
>
> **먼저 끝내 둘 레슨:** [Day I9](day-I9.md)(가속도계 기울기, 자이로 drift), [Day I10](day-I10.md)(필터와 cutoff), [Day 26 — 기본 feature 추출](../../week-4/day-26.md)(gaitpdb에서 heel strike 찾기)
>
> **이론 노트:** [T09 — 신호처리의 이론](../I-gait-theory/note-T09.md) — 시간 정규화와 보간, 파형 분석(PCA, SPM)으로 이어지는 이론을 다룹니다.

## 오늘의 목표
- 길이가 제각각인 stride를 0–100% GC의 101점으로 정규화하고, ensemble mean ± SD를 그릴 수 있다.
- ensemble 그림이 **숨기는 것**(초 단위 시간, 사건 시점의 흔들림, 봉우리 높이)을 말하고, SD 띠와 신뢰구간을 구분할 수 있다.
- complementary filter가 "가속도계는 느린 성분, 자이로는 빠른 성분"을 맡기는 원리를 설명하고, 시정수 τ를 바꿨을 때의 trade-off를 코드로 보일 수 있다.

## 🎬 영상으로 먼저 보기

- [Gait Cycle Phases, Events and Normalization — Stuart McErlain-Naylor](https://www.youtube.com/watch?v=jRnxaawNne0) (4:53)
- **무엇에 주목할까:** 한 주기를 IC에서 다음 IC까지로 정하고 0–100%로 펴는 과정을 보세요. "주기를 어디서 자르는가"가 정규화의 첫 결정입니다.

- [Drone Control and the Complementary Filter — Brian Douglas](https://www.youtube.com/watch?v=whSw42XddsU) (11:12)
- **무엇에 주목할까:** 드론 이야기지만 문제는 같습니다. 가속도계 기울기는 흔들리고, 자이로 적분은 흘러갑니다. 두 신호를 주파수 대역별로 나눠 맡기는 그림(저역통과 + 고역통과 = 1)에 주목하세요.

## 개념 설명

### 왜 시간 정규화인가

사람은 매 걸음 조금씩 다른 시간에 걷습니다. 오늘 쓸 gaitpdb 기록에서도 한 stride가 117표본(1.17 s)이기도 하고 133표본(1.33 s)이기도 합니다. 이 stride들을 그대로 겹치면 같은 "표본 번호"가 서로 다른 phase를 가리킵니다. 그래서 각 stride를 **0–100% GC**로 펴서 같은 퍼센트가 같은 phase를 가리키게 합니다([Wi] 2.3.2 pp.31–32). 키가 다른 사람들의 성장 곡선을 "나이"가 아니라 "사춘기 시작부터의 진행률"로 맞춰 보는 것과 비슷합니다.

방법은 **보간(interpolation)** 입니다. n개 표본을 N개 새 위치(보통 0%, 1%, …, 100%의 **101점**)로 다시 뜨고, 새 위치가 원래 표본 사이에 떨어지면 양옆 값으로 계산합니다. 표본 간격이 충분히 촘촘하면 선형 보간으로 충분하고, 나중에 두 번 미분할 자료라면 고차 spline이 낫다고 소개됩니다([RM] 1장 pp.23–25). 101점인 이유는 0%와 100%를 모두 포함하기 때문입니다(100칸이면 점은 101개).

조심할 것이 둘 있습니다. **첫째, 정규화는 초 단위 시간을 지웁니다.** 하중 증가율(N/s), 충격량, 실제 stance 시간처럼 시간이 들어간 변수는 정규화 **전**에 계산해야 합니다([Wi] p.32). 원래 길이는 따로 저장해 둡니다. **둘째, 정규화와 재표본화(resampling)는 다른 연산입니다.** `scipy.signal.resample_poly`는 "100 Hz를 1000 Hz로"처럼 초 단위 격자를 바꾸는 도구이고, stride를 101점으로 펴는 일과는 다른 질문에 답합니다. stride 정규화에 쓰면 양 끝이 0 쪽으로 끌리는 문제도 있습니다([BMC] `resample`). 오늘은 `np.interp`로 직접 정규화합니다.

### ensemble average: 평균 곡선과 그 띠

정규화한 stride들을 행렬(stride 수 × 101)로 쌓으면, 열마다(같은 %GC끼리) 평균과 SD를 낼 수 있습니다. 이것이 **ensemble average**이고, 평균 곡선 위아래로 ±1 SD 띠를 칠한 그림이 보행 보고서의 기본 형식입니다([Wi] 2.3 pp.29–31). 행렬 연산으로는 `curves.mean(axis=0)` 한 줄입니다([Day 23](../../week-4/day-23.md)의 "시행 × 시점" 생각과 같습니다).

이 그림을 읽을 때 세 가지를 기억합니다.

- **±1 SD 띠는 stride 사이의 흩어짐이지, 평균 곡선의 신뢰구간이 아닙니다.** 평균의 불확실성은 SD/√n으로 훨씬 좁습니다. 교재 중에는 ±1.96 SD 띠를 "95% 신뢰구간"이라고 부르는 곳도 있는데([RM] 1장 p.24), 그 띠는 "개별 stride의 약 95%가 들어가는 범위"라고 읽는 편이 정확합니다([BMC] `ensemble_average`).
- **평균 곡선의 봉우리는 각 stride 봉우리의 평균보다 낮고 넓습니다.** 봉우리가 생기는 %GC가 stride마다 조금씩 다르면, 평균을 내면서 봉우리가 옆으로 번지고 깎입니다([Wi] 2.3). "평균 곡선의 최댓값"과 "stride별 최댓값의 평균"은 다른 숫자입니다(예시 1).
- **toe-off처럼 사건 시점이 흔들리면 평균 곡선은 그 사건을 흐리게 그립니다.** 평균 곡선만 보고 "stance가 몇 %에서 끝난다"고 읽으면 stride별 값과 어긋납니다.

같은 사람의 stride 89개는 표본 89명이 아닙니다. 이 그림은 **한 사람의 전형적 패턴**이고, 군 비교는 사람마다 하나의 값(또는 곡선)으로 접은 뒤에 합니다([Day 26](../../week-4/day-26.md), [Day I13](day-I13.md)).

### complementary filter: 느린 것은 가속도계에, 빠른 것은 자이로에

[Day I9](day-I9.md)에서 본 두 센서의 성격을 다시 적으면 이렇습니다. 가속도계 기울기는 **길게 보면 맞지만 순간순간 흔들리고**(선가속도가 섞임), 자이로 적분은 **순간순간 매끄럽지만 길게 보면 흘러갑니다**(bias가 쌓임). 주파수로 바꿔 말하면, 가속도계는 저주파에서 믿을 만하고 자이로는 고주파에서 믿을 만합니다.

**complementary filter**는 이 둘을 대역별로 나눠 맡깁니다. 한 표본마다 다음 계산을 합니다.

  θ̂ₖ = α·(θ̂ₖ₋₁ + ωₖ·Δt) + (1 − α)·θ_acc,k,   α = τ / (τ + Δt)

괄호 안은 "직전 추정값에 자이로가 말하는 변화량을 더한 것", 뒤 항은 "가속도계 기울기"입니다. α가 1에 가까우면(τ가 크면) 거의 자이로만 믿고, 가속도계는 아주 천천히 끌어당기기만 합니다. 이 끌어당김이 자이로의 drift를 계속 0 쪽으로 되돌려 놓습니다. 저역통과(가속도계)와 고역통과(자이로)의 이득을 더하면 모든 주파수에서 1이 되도록 짝지었다는 뜻에서 "complementary(서로 채우는)"라는 이름이 붙었습니다. 개념 수준에서 기억할 trade-off는 하나입니다. **τ가 너무 작으면 가속도계의 흔들림이 그대로 들어오고, 너무 크면 자이로 drift가 다 지워지지 않습니다**(예시 2). Kalman filter 같은 더 정교한 융합도 "어느 센서를 언제 얼마나 믿을까"를 정하는 같은 문제를 푸는 방법입니다.

실제 3차원 방향 추정에서는 각속도 성분을 축마다 따로 적분하면 각도가 되지 않으므로(회전축이 고정된 경우에만 적분 = 각도) 회전을 합성하는 방식이 필요합니다([BMC] `angular_velocity_3d`). 오늘은 시상면 한 축만 다룹니다.

## 예시로 이해하기

> 예시 1은 실제 공개 데이터(gaitpdb v1.0.0, [doi:10.13026/C24H3N](https://doi.org/10.13026/C24H3N), ODC-By 1.0; 파일은 [Day 24](../../week-4/day-24.md)에서 받은 `GaCo01_01.txt`), 예시 2는 **가상 신호**입니다.

### 예시 1 — 한 참가자의 왼발 VGRF를 stride로 잘라 ensemble 평균 내기

```python
import numpy as np
import matplotlib
matplotlib.use("Agg")                              # 노트북에서는 이 두 줄을 빼도 된다
import matplotlib.pyplot as plt

fs = 100
d = np.loadtxt("data/gaitpdb/GaCo01_01.txt")
left = d[:, 17]                                    # 왼발 총 힘(N)

# 1) stride 나누기: 20 N 문턱을 넘는 순간 = IC (간단판. Day I12에서 규칙을 다듬는다)
on = left > 20
ic = np.flatnonzero(~on[:-1] & on[1:]) + 1
dur = np.diff(ic) / fs
med = np.median(dur)
keep = (dur > 0.8 * med) & (dur < 1.2 * med)       # 중앙값의 ±20% 밖 stride는 제외
keep[:2] = keep[-2:] = False                       # 처음·마지막 2 stride(가속·감속)도 제외
print(f"IC {len(ic)}개 → stride {len(dur)}개 → 사용 {keep.sum()}개 (중앙값 {med:.2f} s)")

# 2) stride마다 101점(0, 1, …, 100 %GC)으로 시간 정규화
pct = np.linspace(0, 100, 101)
curves = []
for a, b in zip(ic[:-1][keep], ic[1:][keep]):
    x = left[a:b + 1]                              # IC부터 다음 IC까지(양 끝 포함)
    curves.append(np.interp(pct, np.linspace(0, 100, len(x)), x))
curves = np.array(curves)                          # (stride 수, 101)
mean, sd = curves.mean(axis=0), curves.std(axis=0, ddof=1)
print("정규화 행렬 모양:", curves.shape)
lens = (np.diff(ic)[keep] + 1)
print(f"정규화 전 stride 길이(표본 수): {lens.min()}–{lens.max()}")

# 3) 평균 곡선이 숨기는 것
early = pct <= 30                                  # 첫 봉우리는 stance 앞부분에 있다
print(f"평균 곡선의 첫 봉우리: {mean[early].max():.0f} N ({pct[early][np.argmax(mean[early])]:.0f}%GC)")
print(f"각 stride 첫 봉우리의 평균: {curves[:, early].max(axis=1).mean():.0f} N")
to_pct = np.array([pct[np.argmax((c < 20) & (pct > 30))] for c in curves])   # 30%GC 뒤 처음 20 N 아래
print(f"stride별 toe-off 위치: 평균 {to_pct.mean():.1f}%GC, 범위 {to_pct.min():.0f}–{to_pct.max():.0f}%GC")
print(f"평균 곡선이 20 N 아래로 내려가는 위치: {pct[np.argmax((mean < 20) & (pct > 30))]:.0f}%GC")

plt.figure(figsize=(6, 3.5))
plt.plot(pct, mean, color="k", label="mean")
plt.fill_between(pct, mean - sd, mean + sd, alpha=0.3, label="±1 SD (between strides)")
plt.xlabel("% gait cycle (left IC → next left IC)"); plt.ylabel("left total force (N)")
plt.legend(); plt.tight_layout()
plt.savefig("I11_ensemble.png", dpi=120)
```

실행 결과:

```text
IC 96개 → stride 95개 → 사용 89개 (중앙값 1.23 s)
정규화 행렬 모양: (89, 101)
정규화 전 stride 길이(표본 수): 117–133
평균 곡선의 첫 봉우리: 1079 N (14%GC)
각 stride 첫 봉우리의 평균: 1098 N
stride별 toe-off 위치: 평균 63.6%GC, 범위 60–89%GC
평균 곡선이 20 N 아래로 내려가는 위치: 66%GC
```

그림(직접 그려 확인)에서는 0%에서 힘이 빠르게 올라 14%GC 근처에서 첫 봉우리를 이루고, stance 내내 높은 힘이 이어지다 60%GC 무렵 급히 떨어져 유각기에는 0 근처에 머뭅니다. 숫자가 말해 주는 것:

- **평균 곡선 봉우리(1079 N) < stride별 봉우리의 평균(1098 N).** 봉우리 시점이 stride마다 조금씩 달라 평균에서 깎였습니다.
- **평균 곡선은 66%에서 20 N 아래로 내려가지만, stride별 toe-off의 평균은 63.6%입니다.** 몇몇 stride(최대 89%)는 발을 뗀 뒤에도 깔창 힘이 20 N 위에 오래 남아, 평균 곡선의 꼬리를 늘였습니다. 이런 stride를 어떻게 다룰지가 Day I12의 규칙 만들기입니다.
- **±1 SD 띠는 유각기 구간에서 0 아래로 내려갑니다.** 힘은 음수가 될 수 없는데, 분포가 0 근처에서 한쪽으로 치우쳐 있을 때 "평균 ± SD"가 만드는 인공물입니다. 이런 구간에서는 중앙값과 사분위 띠가 더 정직합니다(직접 해보기 4).

이 결과는 한 참가자의 한 기록이며, 깔창 센서 합계(N)는 힘판의 지면반력과 같은 보정인지 데이터 페이지에 없으므로 체중 대비 값으로 바꾸지 않았습니다.

### 예시 2 — complementary filter로 자이로 drift 잡기 (가상)

```python
import numpy as np

rng = np.random.default_rng(11)
fs = 100
dt = 1 / fs
t = np.arange(0, 60, dt)
# 가상 정강이 기울기(°): 1 Hz로 ±30° 흔들리는 걷기 + 천천히 바뀌는 자세 성분
true = 30 * np.sin(2 * np.pi * 1.0 * t) + 5 * np.sin(2 * np.pi * 0.05 * t)
true_rate = np.gradient(true, dt)                       # 참 각속도(°/s)

gyro = true_rate + 0.5 + rng.normal(0, 1.0, len(t))     # bias 0.5 °/s + 잡음
# 가속도계 기울기: 평균적으로는 맞지만, 걸을 때 선가속도 때문에 크게 흔들린다(가상: 8° 잡음)
acc_angle = true + rng.normal(0, 8.0, len(t))

gyro_only = true[0] + np.cumsum(gyro) * dt               # 자이로만 적분

def complementary(gyro, acc_angle, tau, dt, start):
    alpha = tau / (tau + dt)                             # tau(초)보다 느린 변화는 가속도계를 믿는다
    est = np.empty_like(acc_angle)
    est[0] = start
    for k in range(1, len(est)):
        est[k] = alpha * (est[k - 1] + gyro[k] * dt) + (1 - alpha) * acc_angle[k]
    return est

def rms(e): return np.sqrt(np.mean(e ** 2))
last = t >= 50                                           # 마지막 10초에서 비교
print(f"자이로만 적분   : 마지막 10초 RMS 오차 {rms(gyro_only[last] - true[last]):5.1f}°")
print(f"가속도계 기울기 : 마지막 10초 RMS 오차 {rms(acc_angle[last] - true[last]):5.1f}°")
for tau in [0.1, 1.0, 10.0]:
    est = complementary(gyro, acc_angle, tau, dt, acc_angle[0])
    print(f"complementary τ = {tau:4.1f} s (α = {tau / (tau + dt):.4f}): RMS 오차 {rms(est[last] - true[last]):5.1f}°")
```

실행 결과:

```text
자이로만 적분   : 마지막 10초 RMS 오차  29.4°
가속도계 기울기 : 마지막 10초 RMS 오차   8.0°
complementary τ =  0.1 s (α = 0.9091): RMS 오차   1.6°
complementary τ =  1.0 s (α = 0.9901): RMS 오차   0.9°
complementary τ = 10.0 s (α = 0.9990): RMS 오차   5.3°
```

자이로만 쓰면 1분 뒤 약 30° 흘러가 있고(0.5 °/s × 60 s, Day I9 예시 2와 같음), 가속도계만 쓰면 8°씩 흔들립니다. 둘을 합치면 1° 안팎으로 줄어듭니다. τ = 10 s일 때 오차가 다시 커지는 이유는 가속도계의 끌어당김이 너무 약해서 bias가 남기 때문입니다. 정상 상태의 남는 오차는 대략 **bias × τ**(0.5 °/s × 10 s = 5°)입니다. 반대로 τ = 0.1 s는 가속도계의 흔들림을 더 많이 들여옵니다. 이 가상 신호에서는 τ = 1 s 근처가 균형점이지만, 실제 최적값은 센서의 bias와 움직임의 세기에 따라 달라집니다.

## 직접 해보기

1. `notebooks/advanced/I/I11_ensemble.ipynb`를 만들고 예시 1을 실행해 `figures/advanced/I/I11_ensemble.png`로 저장합니다(그림의 축 이름과 데이터 출처를 캡션에 적습니다).
2. **오른발로 반복:** 19번째 열(인덱스 18)로 같은 그림을 그리고 왼발 평균 곡선과 겹쳐 봅니다. 첫 봉우리 높이와 위치가 같은가요? (Day I13의 비대칭으로 이어집니다.)
3. **stance만 정규화:** IC에서 toe-off까지만 잘라 0–100% stance로 정규화한 그림을 하나 더 그립니다. 주기 전체로 정규화한 그림과 무엇이 다르게 보이는지 두 줄로 적습니다.
4. **평균 ± SD 대신 중앙값과 사분위:** `np.median(curves, axis=0)`, `np.percentile(curves, [25, 75], axis=0)`로 띠를 다시 그리고, 유각기 구간에서 띠가 0 아래로 내려가지 않는 것을 확인합니다.
5. **보간 방법 비교(선택):** `scipy.interpolate.CubicSpline`으로 정규화한 결과와 `np.interp` 결과의 최대 차이(N)를 구합니다. 100 Hz 자료에서 차이가 작은지 확인하세요.
6. **complementary filter 탐색:** 예시 2에서 τ를 0.05–20 s 사이 여러 값으로 바꿔 RMS 오차 곡선을 그리고, 가장 작은 τ를 찾습니다. 그다음 bias를 2 °/s로 바꾸면 최적 τ가 커지는지 작아지는지 예측해 보고 확인합니다.

> ⚠️ **흔한 오류 1:** `np.interp(새 x, 원래 x, 값)`의 인자 순서를 바꾸는 것. 첫 인자가 "값을 알고 싶은 위치"(0–100의 101점), 둘째가 "원래 표본의 위치"(같은 0–100 척도로 편 것), 셋째가 원래 값입니다. 두 위치 배열이 **같은 척도**여야 합니다.
>
> ⚠️ **흔한 오류 2:** `curves.std(axis=0)`의 기본값은 `ddof=0`(모집단 SD)입니다. 표본 SD를 원하면 `ddof=1`을 씁니다. stride가 많으면 차이가 작지만, 몇 개뿐이면 띠가 눈에 띄게 좁아집니다.

## 퀴즈

**1.** 한 stride가 120표본이다. 0–100% GC를 1% 간격으로 정규화하면 몇 점이 되며, 50%GC 지점은 원래 몇 번째 표본(0부터 셈) 근처인가?

<details><summary>정답 보기</summary>

**101점**이고, 50%GC는 원래 표본 위치 59.5(0–119 척도의 절반) 근처입니다. 정수 위치가 아니므로 59번과 60번 표본 사이를 보간해 값을 얻습니다.

</details>

**2.** 정규화한 자료로 "IC 뒤 하중 증가율(N/s)"을 계산하면 무엇이 틀리나요?

<details><summary>정답 보기</summary>

정규화하면 가로축이 초가 아니라 %GC가 되므로, 기울기의 단위가 N/(%GC)가 되고 stride마다 1%GC가 나타내는 시간도 다릅니다. 시간이 들어간 변수는 **정규화 전** 자료로 계산해야 합니다.

</details>

**3.** ensemble 그림의 ±1 SD 띠가 넓다. "평균 곡선을 믿을 수 없다"는 뜻인가요?

<details><summary>정답 보기</summary>

아닙니다. ±1 SD 띠는 **stride 사이의 흩어짐**(변동성)을 보여 줍니다. 평균 곡선의 불확실성은 SD/√n으로 계산하며, stride가 많으면 훨씬 좁습니다. 넓은 SD 띠는 "걸음마다 다르게 걷는다"는 정보 자체일 수 있습니다.

</details>

**4.** 평균 곡선의 최댓값이 각 stride 최댓값의 평균보다 작게 나오는 이유는?

<details><summary>정답 보기</summary>

봉우리가 생기는 %GC가 stride마다 조금씩 다르기 때문입니다. 같은 %GC끼리 평균을 내면 어떤 stride는 봉우리, 어떤 stride는 봉우리 옆의 낮은 값이 섞여 평균 봉우리가 깎이고 넓어집니다.

</details>

**5.** complementary filter에서 α를 0.999(τ ≈ 10 s, 100 Hz)로 두었더니 오래 걸을수록 각도가 한쪽으로 몇 도씩 어긋나 있었다. 원인과 조치는?

<details><summary>정답 보기</summary>

가속도계의 끌어당김이 너무 약해 자이로 bias가 남은 것입니다(남는 오차 ≈ bias × τ). τ를 줄여(α를 낮춰) 가속도계 비중을 늘리거나, 정지 순간에 bias를 추정해 빼는 방법을 씁니다. 단 τ를 너무 줄이면 걸을 때 가속도계의 흔들림이 들어옵니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1을 실행해 출력이 같음을 확인하고 `figures/advanced/I/I11_ensemble.png`를 저장했다.
- [ ] 오른발 평균 곡선을 겹쳐 그리고 첫 봉우리 높이·위치를 비교했다.
- [ ] stance만 정규화한 그림과, 중앙값·사분위 띠 그림을 만들었다.
- [ ] τ에 따른 complementary filter 오차 곡선과 bias를 바꾼 결과를 남겼다.

## 더 읽을거리
- Thomas SJ, Zeni JA, Winter DA. *Winter's Biomechanics and Motor Control of Human Movement*. 5th ed. Wiley; 2023 — 2.3절 Ensemble averaging(pp.29–32), 3.2.3절 drift 보정(p.39).
- Robertson DGE, Caldwell GE, Hamill J, Kamen G, Whittlesey SN. *Research Methods in Biomechanics*. 2nd ed. Human Kinetics; 2014 — 1장 pp.23–25(시간 정규화·보간·ensemble). 선택: 14장 Analysis of Biomechanical Waveform Data(pp.317–337; PCA p.319–, 함수형 데이터 분석 p.327–).
- Richards J, Levine D, eds. *Whittle's Gait Analysis*. 6th ed. Elsevier; 2023 — 5장 pp.92–94(SPM: 파형 전체를 비교해 주기의 어느 구간이 다른지 보는 방법).
- Duarte M, Watanabe RN. *Notes on Scientific Computing for Biomechanics and Motor Control* (v0.2.0, CC BY 4.0). [doi:10.5281/zenodo.23654869](https://doi.org/10.5281/zenodo.23654869) — `ensemble_average`, `resample`, `angular_velocity_3d`.
- MATLAB Tech Talk: [Understanding Sensor Fusion and Tracking, Part 2: Fusing a Mag, Accel, & Gyro Estimate — MATLAB](https://www.youtube.com/watch?v=0rlvvYgmTvI) (16:00) — complementary filter 다음 단계(3축 방향 추정)를 보고 싶을 때.

---
[← 이전](day-I10.md) · [코스 지도](../../../README.md) · [다음 →](day-I12.md)
