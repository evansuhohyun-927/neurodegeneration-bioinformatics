# Day I14 — 측정 신뢰도와 타당도: Bland–Altman과 ICC를 손으로 + 2주차 정리

> **주차:** 심화 파트 I — 보행분석 (2주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I14_reliability.ipynb`, `figures/advanced/I/I14_bland_altman.png`
>
> **먼저 끝내 둘 레슨:** [Day I12](day-I12.md)(`gait_events.py`, 기준 방법으로 쓸 힘 문턱), [Day I13](day-I13.md)(참가자 단위 표), [Day 30 — 단변량 군 비교](../../week-5/day-30.md)(bootstrap CI)
>
> **이론 노트:** [T08 — 측정 원리와 오차](../I-gait-theory/note-T08.md) — 신뢰도·타당도·일치도의 개념과 측정 시스템별 오차 크기를 더 깊게 다룹니다.

## 오늘의 목표
- 신뢰도(reliability), 타당도(validity), 일치도(agreement)를 구분하고, 상관계수가 일치도를 말해 주지 못하는 이유를 설명할 수 있다.
- Bland–Altman 그림을 그리고 bias, 일치 한계(2s와 1.96s의 차이 포함), 그 신뢰구간을 계산·해석할 수 있다.
- 연구 설계에 맞는 ICC 형태를 고르고, ICC(2,1)을 분산분석의 평균제곱으로 직접 계산해 95% CI로 해석할 수 있다. SEM과 MDC의 뜻을 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [Bland-Altman Plot [Simply explained] — numiqo](https://www.youtube.com/watch?v=hHsfn7jE79M) (5:34)
- **무엇에 주목할까:** 가로축이 "두 측정의 평균", 세로축이 "두 측정의 차이"라는 점, 그리고 가운데 선(bias)과 위아래 두 선(일치 한계)이 각각 무엇을 뜻하는지에 집중하세요.

- [What is an Intraclass Correlation? — QuantFish](https://www.youtube.com/watch?v=u4bDT--OlZ4) (17:17)
- **무엇에 주목할까:** ICC가 "전체 분산 중 대상자 사이 분산의 비율"이라는 직관을 잡으세요. 대상자들이 서로 비슷하면(분산이 작으면) 같은 측정 오차라도 ICC가 낮아진다는 점이 오늘 해석의 핵심입니다.

## 개념 설명

### 세 단어 구분하기: 신뢰도, 타당도, 일치도

- **신뢰도(reliability):** 같은 것을 다시 쟀을 때 같은 값이 나오는 정도. 다시 재는 방법에 따라 검사–재검사(test-retest), 평가자 간(interrater), 평가자 내(intrarater) 신뢰도로 나눕니다. 수식으로는 "참 분산 / (참 분산 + 오차 분산)"이고 0–1 사이입니다([Koo & Li 2016](https://doi.org/10.1016/j.jcm.2016.02.012)).
- **타당도(validity):** 재고 싶은 것을 재고 있는가. 흔히 기준 방법(criterion)과 비교해 체계적인 차이가 있는지로 봅니다. [Day I8](day-I8.md)의 accuracy와 가깝습니다.
- **일치도(agreement):** 두 방법(또는 두 번의 측정)이 **원래 단위로** 얼마나 가까운가. "두 방법의 차이가 대부분 ±25 ms 안에 든다"처럼 말합니다.

저울에 비유하면, 같은 사람을 열 번 올렸을 때 늘 같은 숫자가 나오면 신뢰도가 높은 것이고, 그 숫자가 병원 표준 저울과 같으면 타당도가 높은 것이며, 두 저울의 차이가 몇 그램 안이라고 말하는 것이 일치도입니다. Koo & Li는 ICC를 신뢰도 지표로, Bland–Altman을 일치도 분석으로 구분합니다. 보행 측정에서 신뢰도가 보고되는 예로는 무릎 굴곡을 잰 전기각도계의 평가자 내 ICC 0.99와 SEM 약 2.2°가 있습니다([W] 4장 p.77). 시행 자체도 신뢰도에 영향을 줍니다. 첫 보행 시행은 낯설어서 이후 시행과 차이가 크므로 연습 시행을 먼저 하라는 권고가 그 예입니다([P] 23장).

### 상관계수는 일치를 말하지 못한다

Bland & Altman 1986의 요지는 이렇습니다. 상관계수 r은 **직선 관계의 세기**를 잴 뿐, 두 값이 **같은지**는 재지 않습니다. 한 방법이 다른 방법보다 늘 20 ms 크거나 늘 두 배여도 r은 1에 가깝습니다. r은 표본에 든 값의 범위가 넓을수록 커지고, 같은 양을 재는 두 방법이 "관련 있다"는 유의성 검정은 일치 문제와 무관합니다([Bland & Altman 1986](https://doi.org/10.1016/S0140-6736(86)90837-8)). 그래서 [Day I12](day-I12.md)에서 "상관 0.999인 자이로 방법"이 일치한다고 말할 수 없었습니다.

### Bland–Altman: 차이를 평균에 대해 그린다

1. 대상자마다 두 방법의 **차이**(새 방법 − 기준)와 **평균**을 구합니다. 참값을 모르므로 두 측정의 평균이 가장 좋은 추정이고, 차이를 한쪽 값에 대해 그리면 인공적인 경향이 생깁니다.
2. 가로축 평균, 세로축 차이로 점을 찍습니다.
3. 차이의 평균 d̄가 **bias**(체계적 차이), 차이의 표준편차 s가 무작위 차이의 크기입니다.
4. **일치 한계(limits of agreement, LoA)** = d̄ ± 2s. 차이가 정규분포라면 대부분(약 95%)의 차이가 이 안에 듭니다.

**2s와 1.96s.** 1986년 원 논문은 본문과 계산 예에서 **2s**를 쓰고, 1.96s는 "더 정확히는" 하는 보충으로만 적습니다. 이후 문헌과 소프트웨어는 대부분 1.96s를 씁니다. 차이는 작지만(예시에서 1 ms 미만), **어느 쪽을 썼는지 적어야** 다른 연구와 비교할 수 있습니다. 표본이 작으면 1.96도 한계를 약간 좁게 잡는다는 점도 기억해 둡니다([BMC] `confidence_prediction_intervals`).

LoA는 "새로운 대상자 한 명에서 두 방법의 차이가 놓일 범위"를 말하는 구간입니다. 평균 bias가 어디쯤인지 말하는 **bias의 신뢰구간**과는 다른 질문입니다. 한계 자체도 표본에서 추정한 값이라 흔들리므로, 원 논문은 bias의 표준오차 s/√n, 한계의 표준오차 약 √(3s²/n)으로 각각의 신뢰구간을 구하라고 합니다. **허용 가능한 차이**(예: "stance time은 ±30 ms면 충분")는 통계가 아니라 임상·연구 목적이 정하며, 가능하면 미리 정해 둡니다. 차이가 평균과 함께 커지면(비례 오차) 로그 변환 뒤 같은 분석을 하고 한계를 비율로 읽습니다. 원 논문은 대상자당 한 쌍을 전제합니다. 그래서 오늘은 사건 하나하나가 아니라 **참가자마다 하나의 값**(평균 stance time)으로 비교합니다.

### ICC: 형태를 먼저 고르고, 95% CI로 읽는다

**ICC(intraclass correlation coefficient)** 는 형태가 여럿입니다. Koo & Li는 McGraw & Wong의 10가지 형태를 세 축으로 정리합니다(Shrout & Fleiss의 6가지는 그 일부).

| 축 | 선택지 | 고르는 질문 |
|---|---|---|
| Model | 1원 무작위 / 2원 무작위 / 2원 혼합 | 모든 대상자를 같은 평가자(방법)가 쟀나? 평가자를 더 큰 집단의 표본으로 보나, 이 평가자들만 관심인가? |
| Type | 단일 측정 / k개 평균 | 실제로 쓸 때 측정 하나를 쓰나, 여러 번의 평균을 쓰나? |
| Definition | 일관성(consistency) / 절대 일치(absolute agreement) | 한 방법이 늘 일정량 큰 것(y = x + c)을 허용하나, 같은 값(y = x)이어야 하나? |

식은 이원 분산분석의 평균제곱으로 씁니다. n = 대상자 수, k = 평가자(방법) 수, MSR = 대상자(행) 평균제곱, MSC = 평가자(열) 평균제곱, MSE = 잔차 평균제곱, MSW = 대상자 안 평균제곱입니다.

- ICC(2,1) — 2원, 절대 일치, 단일: (MSR − MSE) / [MSR + (k − 1)MSE + (k/n)(MSC − MSE)]
- ICC(3,1) — 2원, 일관성, 단일: (MSR − MSE) / [MSR + (k − 1)MSE]
- ICC(1,1) — 1원, 단일: (MSR − MSW) / [MSR + (k − 1)MSW]

⚠️ ICC(1,1)의 분모는 **(k − 1)** 입니다. Koo & Li 2016의 Table 3은 처음에 (k + 1)로 실렸다가 2017년 정오표로 고쳐졌고([Erratum, J Chiropr Med 2017;16(4):346](https://doi.org/10.1016/j.jcm.2017.10.001)), 논문 사이트에 따라 고치기 전 식이 그대로 보일 수 있습니다.

오늘 실습은 **"힘 문턱 방법"과 "가상 IMU 방법"이라는 두 고정된 방법**을 비교합니다. 이 두 방법은 더 큰 방법 집단에서 뽑은 표본이 아니므로 Koo & Li의 분류로는 **2원 혼합 모형, 절대 일치, 단일 측정**에 해당합니다. 같은 definition이면 2원 무작위와 2원 혼합은 **계산식이 같고** 해석(일반화 범위)만 다르므로, 계산은 위의 ICC(2,1) 식으로 합니다. Shrout & Fleiss 표기의 "ICC(3,1)"은 일관성 정의라서 이 경우를 가리키지 않는다는 점에 주의합니다.

**해석.** Koo & Li는 점 추정값이 아니라 **95% 신뢰구간**으로 판정하자고 제안합니다: 0.5 미만 poor, 0.5–0.75 moderate, 0.75–0.9 good, 0.9 초과 excellent. 예를 들어 CI가 0.83–0.94면 "good에서 excellent"라고 씁니다. 이 기준에는 전제가 붙어 있습니다. 저자들은 **표준 기준값은 없다**고 먼저 밝히고, 경험칙으로 **이질적인 대상 30명 이상, 평가자 3명 이상**을 권합니다. 또 ICC는 대상자 사이의 분산이 작으면 같은 측정 오차에도 낮아집니다. 보고할 때는 소프트웨어(또는 직접 계산), Model, Type, Definition, 추정값과 95% CI를 모두 적습니다.

### SEM과 MDC: 원래 단위로 돌아가기

ICC는 단위가 없어 "몇 ms까지 믿을 수 있나"를 바로 말해 주지 않습니다. 그래서 흔히 **SEM(standard error of measurement, 측정의 표준오차)** = SD × √(1 − ICC)를 함께 보고합니다. 측정 하나에 따라붙는 오차의 크기를 원래 단위로 나타낸 것입니다. 여기서 SD는 표본 전체 값의 표준편차입니다. 다시 쟀을 때 "진짜 변화"라고 말하려면 필요한 최소 변화를 **MDC(minimal detectable change)** 라 하고, 95% 기준으로 흔히 MDC95 = 1.96 × √2 × SEM으로 계산합니다(두 번 잰 차이이므로 √2). 이름이 비슷한 "sem(standard error of the **mean**, 평균의 표준오차)"과 혼동하지 마세요.

## 예시로 이해하기

> **설계:** gaitpdb 평소 걷기 기록에서 참가자 30명을 무작위로 뽑고(seed 고정), 왼발 힘 문턱(20 N, [Day I12](day-I12.md) 규칙)으로 구한 **참가자별 평균 stance time**을 기준 방법으로 삼습니다. 여기에 **가상의 IMU 방법** = 기준 + 체계적 차이 20 ms + 참가자마다 다른 무작위 오차(SD 15 ms)를 만듭니다. IMU 값은 실제 측정이 아닙니다. 데이터: Hausdorff JM. *Gait in Parkinson's Disease* (v1.0.0). PhysioNet; 2008. [doi:10.13026/C24H3N](https://doi.org/10.13026/C24H3N), ODC-By 1.0. Day I13처럼 `*_01.txt` 165개가 `data/gaitpdb/`에 있어야 합니다.

### 예시 1 — 상관, Bland–Altman, ICC, SEM을 한 번에

```python
import glob
import numpy as np, pandas as pd
from scipy import stats
from gait_events import strides

fs = 100
rng = np.random.default_rng(14)
files = sorted(glob.glob("data/gaitpdb/*_01.txt"))
pick = rng.choice(files, 30, replace=False)       # 참가자 30명(무작위, seed 고정)

ref = []
for p in pick:
    r, ok = strides(np.loadtxt(p)[:, 17], 20, fs)  # 왼발, 20 N 문턱 = 기준 방법
    ref.append(r[ok, 2].mean())                    # 참가자별 평균 stance time(s)
ref = np.array(ref)
# 가상 IMU 방법: 체계적 차이(bias) +20 ms, 참가자마다 다른 무작위 오차 SD 15 ms
imu = ref + 0.020 + rng.normal(0, 0.015, len(ref))

# ---- 상관 ----
r = np.corrcoef(ref, imu)[0, 1]
print(f"참가자 {len(ref)}명, 기준 stance 범위 {ref.min():.2f}–{ref.max():.2f} s")
print(f"Pearson r = {r:.3f}")

# ---- Bland–Altman ----
diff = imu - ref
mean2 = (imu + ref) / 2
n = len(diff)
bias, s = diff.mean(), diff.std(ddof=1)
print(f"bias(IMU − 기준) = {1000 * bias:.1f} ms, 차이의 SD = {1000 * s:.1f} ms")
print(f"일치 한계 bias ± 1.96·SD = [{1000 * (bias - 1.96 * s):.1f}, {1000 * (bias + 1.96 * s):.1f}] ms")
print(f"일치 한계 bias ± 2·SD    = [{1000 * (bias - 2 * s):.1f}, {1000 * (bias + 2 * s):.1f}] ms (1986년 원 논문 방식)")
tcrit = stats.t.ppf(0.975, n - 1)
se_bias, se_loa = s / np.sqrt(n), np.sqrt(3 * s ** 2 / n)
print(f"bias의 95% CI = [{1000 * (bias - tcrit * se_bias):.1f}, {1000 * (bias + tcrit * se_bias):.1f}] ms")
print(f"아래 한계의 95% CI = [{1000 * (bias - 1.96 * s - tcrit * se_loa):.1f}, {1000 * (bias - 1.96 * s + tcrit * se_loa):.1f}] ms")
print(f"차이와 평균의 상관 r = {np.corrcoef(mean2, diff)[0, 1]:.2f} (차이가 크기에 따라 변하는지 점검)")

# ---- ICC: 이원 분산분석의 평균제곱으로 직접 ----
def icc_table(Y):
    """Y: (참가자 n, 방법/평가자 k). 평균제곱 MSR(행), MSC(열), MSE(잔차)를 돌려준다."""
    n, k = Y.shape
    grand = Y.mean()
    ss_r = k * ((Y.mean(axis=1) - grand) ** 2).sum()
    ss_c = n * ((Y.mean(axis=0) - grand) ** 2).sum()
    ss_e = ((Y - grand) ** 2).sum() - ss_r - ss_c
    return ss_r / (n - 1), ss_c / (k - 1), ss_e / ((n - 1) * (k - 1)), n, k

def icc_2_1(Y):            # 2원, 절대 일치(absolute agreement), 단일 측정
    msr, msc, mse, n, k = icc_table(Y)
    return (msr - mse) / (msr + (k - 1) * mse + k / n * (msc - mse))

def icc_3_1(Y):            # 2원, 일관성(consistency), 단일 측정
    msr, msc, mse, n, k = icc_table(Y)
    return (msr - mse) / (msr + (k - 1) * mse)

Y = np.column_stack([ref, imu])
msr, msc, mse, _, _ = icc_table(Y)
print(f"\nMSR = {msr:.6f}, MSC = {msc:.6f}, MSE = {mse:.6f}")
print(f"ICC(2,1) 절대 일치 = {icc_2_1(Y):.3f}")
print(f"ICC(3,1) 일관성   = {icc_3_1(Y):.3f}")
Y0 = np.column_stack([ref, imu - bias])                 # 같은 무작위 오차, bias만 제거
print(f"bias가 없을 때 ICC(2,1) = {icc_2_1(Y0):.3f}")

# 자기 점검(assert): 두 방법이 같으면 1, 상수만 더하면 일관성은 그대로 1
assert np.isclose(icc_2_1(np.column_stack([ref, ref])), 1)
assert np.isclose(icc_3_1(np.column_stack([ref, ref + 0.05])), 1)

# ---- bootstrap 95% CI (참가자 단위) ----
bs = [icc_2_1(Y[rng.integers(0, n, n)]) for _ in range(5000)]
print(f"ICC(2,1) bootstrap 95% CI = [{np.percentile(bs, 2.5):.3f}, {np.percentile(bs, 97.5):.3f}]")

# ---- SEM, MDC ----
icc = icc_2_1(Y)
sd_all = Y.std(ddof=1)
sem = sd_all * np.sqrt(1 - icc)
print(f"SEM = SD·√(1 − ICC) = {1000 * sem:.1f} ms, MDC95 = 1.96·√2·SEM = {1000 * 1.96 * np.sqrt(2) * sem:.1f} ms")
```

실행 결과:

```text
참가자 30명, 기준 stance 범위 0.62–0.91 s
Pearson r = 0.986
bias(IMU − 기준) = 22.0 ms, 차이의 SD = 13.4 ms
일치 한계 bias ± 1.96·SD = [-4.2, 48.2] ms
일치 한계 bias ± 2·SD    = [-4.8, 48.7] ms (1986년 원 논문 방식)
bias의 95% CI = [17.0, 27.0] ms
아래 한계의 95% CI = [-12.9, 4.4] ms
차이와 평균의 상관 r = 0.25 (차이가 크기에 따라 변하는지 점검)

MSR = 0.011607, MSC = 0.007248, MSE = 0.000090
ICC(2,1) 절대 일치 = 0.946
ICC(3,1) 일관성   = 0.985
bias가 없을 때 ICC(2,1) = 0.985
ICC(2,1) bootstrap 95% CI = [0.893, 0.967]
SEM = SD·√(1 − ICC) = 17.8 ms, MDC95 = 1.96·√2·SEM = 49.3 ms
```

읽는 법:

- **r = 0.986.** 상관만 보면 "거의 완벽"입니다. 그러나 IMU 방법은 평균 22 ms 길게 재고(bias의 CI 17–27 ms, 0을 포함하지 않음), 한 사람에서는 −4에서 +48 ms까지 차이가 날 수 있습니다. stance time의 군 차이가 수십 ms 수준이라면 이 일치 한계는 무시할 수 없습니다. 받아들일지는 연구 목적에 따라 **미리 정한 허용 범위**와 비교해 판단합니다.
- **2s와 1.96s의 차이는 1 ms 미만.** 그래도 어느 쪽인지 적습니다. 한계 자체의 CI(아래 한계 −12.9 ~ 4.4 ms)가 꽤 넓다는 것이 더 중요합니다. 30명으로 잡은 한계는 그만큼 흔들립니다.
- **ICC(3,1) 일관성 0.985 > ICC(2,1) 절대 일치 0.946.** 차이는 정확히 bias 때문입니다. bias만 빼면 절대 일치 ICC도 0.985로 올라갑니다. 일관성 ICC는 "늘 22 ms 길게 잰다"를 문제 삼지 않습니다. 두 방법을 **바꿔 쓸 수 있는가**를 묻는다면 절대 일치를 봐야 합니다.
- **95% CI(0.893–0.967)로 판정하면 "good에서 excellent".** 점 추정값 0.946만 보고 "excellent"라고 쓰지 않습니다. 이 CI는 참가자 단위 bootstrap으로 구했습니다(분석적 F 분포 식 대신 Day 30의 방법).
- **MDC95 ≈ 49 ms.** 이 방법으로 한 사람을 두 번 쟀을 때 약 50 ms 넘게 달라져야 "진짜 변화"라고 말할 수 있다는 뜻입니다(이 가상 오차 설정에서).
- 차이와 평균의 상관(0.25)이 약간 있지만 가상 자료는 비례 오차 없이 만들었으므로 우연으로 보입니다. 실제 자료라면 그림으로 확인하고, 뚜렷하면 로그 변환을 검토합니다.
- 위 함수는 고전적인 공개 예제 자료(6명 × 평가자 4명)에 넣어 알려진 ICC 값과 같은지 따로 확인했습니다. 여러분도 assert 두 줄로 최소한의 자기 점검을 합니다.

## 직접 해보기

1. `notebooks/advanced/I/I14_reliability.ipynb`에서 예시 1을 실행해 출력이 같은지 확인합니다.
2. **Bland–Altman 그림:** 가로축 `mean2 * 1000`(ms), 세로축 `diff * 1000`(ms)로 점을 찍고, bias(실선)와 1.96s 일치 한계(점선)를 그립니다. 축 이름과 "IMU 값은 가상"이라는 캡션을 넣어 `figures/advanced/I/I14_bland_altman.png`로 저장합니다.
3. **세 가지 오차 시나리오:** 가상 IMU를 (a) bias 0, 무작위 SD 15 ms, (b) bias 20 ms, 무작위 SD 40 ms, (c) 비례 오차(`imu = ref * 1.05 + noise`)로 바꿔 각각 r, bias, LoA, ICC(2,1), ICC(3,1)을 표로 만듭니다. (c)의 Bland–Altman 그림에서 점들이 기울어지는 것을 확인하고, `np.log`로 변환해 다시 그려 봅니다.
4. **대상자 이질성이 ICC를 바꾼다:** 30명 중 기준 stance time이 중앙값 근처인 10명만 남겨(값의 범위가 좁아짐) ICC(2,1)을 다시 계산합니다. 측정 오차는 같은데 ICC가 왜 낮아지는지 두 줄로 설명합니다. 같은 일이 r에도 일어나는지 확인합니다.
5. **ICC(1,1) 정오표 확인:** 예시 1의 `Y`에 대해 1원 모형의 MSW(대상자 안 평균제곱)를 직접 계산하고, 분모에 (k − 1)을 쓴 값과 (k + 1)을 쓴 값을 비교합니다. 어느 쪽이 맞는지와 그 근거(2017 정오표)를 적습니다.
6. 노트북 끝에 "이 방법 비교의 보고 문단"을 Koo & Li의 보고 항목(계산 방법, Model, Type, Definition, 추정값과 95% CI)과 Bland–Altman 결과(bias와 CI, LoA와 계수 1.96/2, 허용 범위)를 모두 넣어 5–6줄로 씁니다. 30명·방법 2개라는 점이 Koo & Li의 경험칙(30명 이상, 평가자 3명 이상)과 어떻게 맞고 어긋나는지도 한 줄 적습니다.

> ⚠️ **흔한 오류 1:** 사건(stride) 하나하나를 독립된 쌍으로 넣어 Bland–Altman이나 ICC를 계산하는 것. 같은 사람의 stride는 서로 닮아 있어 n이 부풀려지고 CI가 좁아집니다. 오늘처럼 참가자마다 하나의 값으로 접거나, 반복 측정을 고려한 방법을 써야 합니다.
>
> ⚠️ **흔한 오류 2:** 소프트웨어가 출력한 "ICC" 하나를 형태 확인 없이 옮겨 적는 것. 같은 자료에서도 형태에 따라 값이 크게 다릅니다(오늘 0.946 대 0.985). Model·Type·Definition을 함께 적지 않은 ICC는 읽는 사람이 해석할 수 없습니다.

## 🤖 AI와 함께 하기 (주간 실습, 20–30분)

**이번 주의 기술: 통계 코드를 AI에게 받되, 형태와 계수를 내 손 계산으로 검증하기**

ICC와 Bland–Altman은 AI가 몇 초 만에 코드를 써 주는 분야입니다. 문제는 AI가 **어떤 ICC 형태를 골랐는지**, 일치 한계에 **1.96과 2 중 무엇을 썼는지**, stride를 독립 쌍으로 넣었는지를 말하지 않고 넘어가기 쉽다는 것입니다. 이번 주 내내 연습한 "결정을 적고, 바꿔 보고, 확인하기"를 AI 코드에도 적용합니다.

1. **설계를 먼저 적습니다.** AI에게 묻기 전에 내 설계를 세 줄로 씁니다: 무엇과 무엇을 비교하나(예: 힘 문턱 vs 가상 IMU), 분석 단위(참가자당 값 하나), 원하는 형태(2원 혼합, 절대 일치, 단일 측정).
2. **아래 프롬프트로 요청합니다.**

   ```text
   나는 보행분석 자습 과정의 2주차(측정과 신호처리)를 하고 있다.
   지금은 두 측정 방법의 일치도와 신뢰도를 평가하는 단계다.

   중요한 해석 원칙:
   - 분석 단위는 참가자다. 한 사람의 여러 stride를 독립 표본으로 쓰지 않는다.
   - 결과를 진단이나 치료 판단으로 표현하지 않는다.

   데이터 구조(가상 예시, 실제 값 아님):
   - 행 = 참가자 30명, 열 = method_A, method_B (단위: 초)
   - 두 방법은 고정된 두 방법이다(더 큰 방법 집단의 표본이 아님)

   요청:
   1. 이 설계에 맞는 ICC 형태(Model, Type, Definition)를 근거와 함께 제시
   2. 이원 분산분석 평균제곱(MSR, MSC, MSE)으로 ICC를 계산하는 numpy 코드
      (외부 ICC 패키지 쓰지 말 것)
   3. Bland–Altman bias와 일치 한계 코드. 계수가 1.96인지 2인지 명시
   4. 코드가 가정하는 것(정규성, 차이가 평균과 무관 등)을 나열
   5. 결과를 보고할 때 빠뜨리면 안 되는 항목
   ```

3. **검증합니다.**
   - AI가 고른 형태가 내 설계(1단계)와 같은지 봅니다. "ICC(3,1)"이라고만 했다면 그것이 일관성 정의라는 점을 확인합니다.
   - AI 코드에 예시 1의 `Y`를 넣어 **내 함수와 같은 값**(0.946)이 나오는지 비교합니다. 다르면 어느 식이 다른지 찾습니다.
   - ICC(1,1) 식을 함께 줬다면 분모가 (k − 1)인지 확인합니다(2017 정오표).
   - assert 두 줄(두 방법이 같으면 1, 상수만 더하면 일관성은 1)을 AI 코드에도 돌립니다.

**검증 체크**
- [ ] AI가 고른 ICC 형태와 내 설계를 비교해 적었다(같은지, 다르면 왜).
- [ ] AI 코드와 내 코드의 ICC·bias·LoA가 같은 자료에서 일치함을 확인했다(다르면 원인을 적었다).
- [ ] 일치 한계 계수(1.96/2)와 분석 단위(참가자)를 보고 문단에 명시했다.

> 🔒 **개인정보·데이터 라이선스 주의:** 참가자 원자료(신호 파일, 행 단위 측정값)는 외부 AI에 올리지 않습니다. 열 이름·단위·표본 수 같은 **구조 정보**와 직접 만든 **가상 값**만 붙여 넣습니다. gaitpdb(ODC-By 1.0)와 Daphnet(CC BY 4.0)은 공개 데이터지만, 공개 여부와 별개로 출처 표기 조건이 있고, 연구실의 환자 자료는 기관 규정이 우선합니다. PhysioNet의 자격 심사형 데이터는 이용 계약상 온라인 AI 서비스에 넣으면 안 됩니다(PhysioNet 공지: <https://physionet.org/news/post/gpt-responsible-use>, 자세한 내용은 [심화 E — Day E2](../E-ehr/day-E2.md)). 이 실습은 학습용이며 진단·치료 판단에 쓰지 않습니다.

## 퀴즈

**1.** 두 방법의 stance time 상관이 r = 0.99인데 Bland–Altman bias가 +40 ms였다. 두 방법을 바꿔 써도 되나요?

<details><summary>정답 보기</summary>

상관만으로는 판단할 수 없고, 이 경우 **그대로 바꿔 쓰기 어렵습니다**. r은 직선 관계의 세기일 뿐이고, 새 방법은 평균 40 ms 길게 잽니다. 허용 범위가 그보다 좁다면 바꿔 쓸 수 없습니다. bias가 안정적이면 보정할 수 있지만, 그 경우에도 일치 한계(무작위 차이)를 함께 봐야 합니다.

</details>

**2.** 1986년 Bland & Altman 원 논문의 일치 한계는 bias ± 몇 s인가요? 요즘 흔히 쓰는 값은?

<details><summary>정답 보기</summary>

원 논문은 본문과 계산 예에서 **± 2s**를 쓰고, 1.96s는 보충 설명으로만 언급합니다. 이후 문헌과 소프트웨어는 대부분 **± 1.96s**를 씁니다. 보고할 때 어느 쪽인지 적습니다.

</details>

**3.** 같은 자료에서 ICC(3,1)(일관성)이 0.98, ICC(2,1)(절대 일치)이 0.90이었다. 두 값의 차이는 무엇을 시사하나요?

<details><summary>정답 보기</summary>

두 방법 사이에 **체계적 차이(bias)** 가 있다는 뜻입니다. 일관성 정의는 한 방법이 늘 일정량 큰 것을 허용하지만 절대 일치는 그것도 불일치로 셉니다. 방법을 바꿔 쓸 수 있는지를 묻는다면 절대 일치 값을 봐야 합니다.

</details>

**4.** ICC 추정값이 0.88, 95% CI가 0.71–0.95였다. Koo & Li 기준으로 어떻게 보고하나요?

<details><summary>정답 보기</summary>

CI 하한 0.71(moderate)부터 상한 0.95(excellent)까지 걸치므로 **"moderate에서 excellent"** 로 보고합니다. 점 추정값 0.88만 보고 "good"이라고 하지 않습니다. 그리고 형태(Model, Type, Definition)와 계산 방법을 함께 적습니다.

</details>

**5.** 어떤 보행 지표의 SEM이 20 ms였다. MDC95는 대략 얼마이고, 무엇을 뜻하나요?

<details><summary>정답 보기</summary>

약 **55 ms**(1.96 × √2 × 20). 같은 사람을 두 번 쟀을 때 약 55 ms보다 작은 변화는 측정 오차와 구분하기 어렵다는 뜻입니다. 치료 전후 변화를 해석할 때의 최소 기준이 됩니다.

</details>

### 2주차 종합 퀴즈 (10문항)

**1. (측정 시스템 선택)** 집에서 2주 동안 FOG 삽화를 세려는 연구에 가장 알맞은 측정 방법과, 그 방법이 **잴 수 없는** 것 하나를 말하세요.

<details><summary>정답 보기</summary>

몸에 다는 관성 센서(IMU, 예: 정강이 또는 허리)가 알맞습니다. 실험실 밖에서 며칠씩 연속 기록할 수 있기 때문입니다. 대신 지면반력·COP가 없어 관절 모멘트를 계산할 수 없고, 라벨(영상·관찰자)이 없어 검출 결과를 검증하기 어렵습니다(Day I8).

</details>

**2. (IMU 원리)** 가만히 서 있는 사람의 허리 센서 수직축이 약 1000 mg를 읽는 이유는?

<details><summary>정답 보기</summary>

가속도계는 내부 질량에 걸리는 힘을 재므로 중력과 움직임을 구분하지 못합니다. 정지해도 중력(1 g = 1000 mg)이 측정됩니다. 그래서 정지 구간에서는 기울기를 계산할 수 있지만, 걷는 동안에는 선가속도가 섞여 기울기 추정이 틀어집니다(Day I9).

</details>

**3. (IMU 원리)** bias 0.3 °/s인 자이로만으로 3분간 각도를 적분했다. 오차는 대략? 줄이는 방법 하나는?

<details><summary>정답 보기</summary>

약 **54°**(0.3 × 180). 정지 순간에 다시 맞추기, 가속도계와의 센서 융합(complementary filter), high-pass 필터 중 하나면 정답입니다(Day I9, I11).

</details>

**4. (aliasing)** 진동 성분이 최대 40 Hz인 신호를 50 Hz로 표본화했다. 무슨 일이 생기고, 기록 뒤에 고칠 수 있나요?

<details><summary>정답 보기</summary>

Nyquist 주파수(25 Hz)보다 빠른 성분이 낮은 주파수로 접혀 들어옵니다(40 Hz → |40 − 50| = 10 Hz). 접힌 성분은 진짜 10 Hz 성분과 구별할 수 없으므로 **기록 뒤에는 고칠 수 없고**, 표본화 전 anti-aliasing 필터나 더 높은 표본화율로 막아야 합니다(Day I10).

</details>

**5. (cutoff)** residual analysis를 WinterTableA1의 16개 좌표에 적용했더니 cutoff가 약 4–7 Hz로 갈렸다. "이 자료의 cutoff는 6 Hz"라고 쓰면 무엇이 빠지나요?

<details><summary>정답 보기</summary>

좌표마다 신호 대역이 달라 cutoff가 다르다는 사실, 그리고 하나로 정한 것이 "결정"이었다는 점(근거 포함), 꼬리 구간 선택에 따른 민감도가 빠집니다. 또 이 기준은 위치에 대한 것이라 가속도용 최적값은 다를 수 있습니다(Day I10).

</details>

**6. (cutoff)** 2차 Butterworth를 6 Hz로 설계해 보정 없이 `filtfilt`했다. 실제로는 몇 Hz 필터에 가까운가요?

<details><summary>정답 보기</summary>

약 **4.9 Hz**(fs 70 Hz 예). 두 번 통과하면 진폭 응답이 제곱되어 6 Hz에서 이득이 0.5가 되기 때문입니다. 설계 cutoff를 약 6/0.802로 올려 보정합니다(Day I10).

</details>

**7. (ensemble)** stride 80개의 ensemble 평균 곡선의 첫 봉우리가 각 stride 첫 봉우리의 평균보다 낮았다. 왜인가요? ±1 SD 띠는 무엇을 뜻하나요?

<details><summary>정답 보기</summary>

봉우리가 생기는 %GC가 stride마다 달라 평균을 내면서 봉우리가 깎이고 넓어지기 때문입니다. ±1 SD 띠는 **stride 사이의 흩어짐**이지 평균 곡선의 신뢰구간이 아닙니다(Day I11).

</details>

**8. (event 검출)** 힘 문턱을 높이면 stance %는 어떻게 변하나요? 문턱이 다른 두 연구의 stance %를 비교할 때의 주의점은?

<details><summary>정답 보기</summary>

IC는 늦게, TO는 이르게 찍혀 stance %가 **줄어듭니다**(Day I12에서 1% → 20% 문턱으로 64.1 → 57.7%). 문턱·규칙이 다르면 체계적 차이가 생기므로 직접 비교하지 말고, 방법을 맞추거나 차이를 감안해야 합니다.

</details>

**9. (CV)** PD군의 stride time CV가 대조군보다 높았지만, 보행 속도를 함께 넣자 차이가 크게 줄었다. 어떻게 보고해야 하나요?

<details><summary>정답 보기</summary>

보정 전과 보정 후의 차이를 **둘 다** 효과크기·CI와 함께 보고하고, 각각이 어떤 질문에 답하는지 적습니다. 느린 속도가 병의 일부라면 보정이 병의 효과를 지울 수 있으므로 "속도와 무관한 순수 효과"라고 단정하지 않습니다. 분석 단위는 참가자이고 결과는 탐색적입니다(Day I13).

</details>

**10. (ICC·Bland–Altman)** 새 보행 측정 앱을 기존 실험실 방법과 비교한 논문이 "ICC = 0.91, excellent"만 보고했다. 더 요구해야 할 정보 세 가지는?

<details><summary>정답 보기</summary>

예: (1) ICC 형태(Model, Type, Definition)와 계산 방법, (2) 95% CI(판정은 CI로), (3) Bland–Altman bias와 일치 한계(원래 단위, 계수 1.96/2), (4) 대상자 수와 이질성, 분석 단위(참가자 vs stride), (5) 미리 정한 허용 범위. 이 중 세 가지면 정답입니다(Day I14).

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1을 실행해 출력이 같음을 확인했다.
- [ ] `figures/advanced/I/I14_bland_altman.png`를 저장했다(가상 IMU라는 캡션 포함).
- [ ] 세 가지 오차 시나리오 표, 대상자 범위를 좁혔을 때의 ICC·r 비교를 만들었다.
- [ ] ICC(1,1) 분모 (k − 1)/(k + 1) 비교와 근거를 적었다.
- [ ] 보고 문단(형태·CI·bias·LoA·계수·허용 범위·표본 조건)을 썼다.
- [ ] AI와 함께 하기 실습의 검증 체크 세 가지를 마쳤다.
- [ ] 2주차 종합 퀴즈 10문항을 풀고 틀린 문항의 Day를 다시 읽었다.

## 더 읽을거리
- Bland JM, Altman DG. Statistical methods for assessing agreement between two methods of clinical measurement. *Lancet*. 1986;1(8476):307–310. PMID 2868172. [doi:10.1016/S0140-6736(86)90837-8](https://doi.org/10.1016/S0140-6736(86)90837-8).
- Koo TK, Li MY. A guideline of selecting and reporting intraclass correlation coefficients for reliability research. *J Chiropr Med*. 2016;15(2):155–163. [doi:10.1016/j.jcm.2016.02.012](https://doi.org/10.1016/j.jcm.2016.02.012). 정오표: *J Chiropr Med*. 2017;16(4):346. [doi:10.1016/j.jcm.2017.10.001](https://doi.org/10.1016/j.jcm.2017.10.001).
- Richards J, Levine D, eds. *Whittle's Gait Analysis*. 6th ed. Elsevier; 2023 — 4장 pp.71, 76–78(accuracy·precision, 전기각도계와 IMU의 신뢰도·타당도 보고 예).
- Duarte M, Watanabe RN. *Notes on Scientific Computing for Biomechanics and Motor Control* (v0.2.0, CC BY 4.0). [doi:10.5281/zenodo.23654869](https://doi.org/10.5281/zenodo.23654869) — `confidence_prediction_intervals`(신뢰구간과 예측구간의 차이, 1.96 근사의 한계).
- [Agreement Explained | Statistics in Healthcare — Physiotutors](https://www.youtube.com/watch?v=bEp_ygrTDes) (9:11) — 재활 분야 예로 본 일치도.

---
[← 이전](day-I13.md) · [코스 지도](../../../README.md) · [다음 →](day-I15.md)
