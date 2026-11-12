# Day C7 — 차원 축소, 분류, 통계: spike sorting, 순열 검정, 군집 기반 보정

> **주차:** 심화 파트 C — 신경신호·시간-주파수 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/C/C7_pca_stats.ipynb`, `reports/advanced/C7_analysis_plan.md`
>
> **먼저 끝내 둘 레슨:** [Day 14 — PCA와 heatmap](../../week-2/day-14.md), [Day 10 — 다중검정과 FDR](../../week-2/day-10.md), [Day 33 — 참가자 단위 검증과 데이터 누수](../../week-5/day-33.md). PCA와 FDR의 기초는 거기서 다뤘으니, 오늘은 **신경 데이터에서 그 도구들이 쓰이는 자리**와 신경 데이터에 특화된 보정 방법에 집중합니다.

## 오늘의 목표
- 스파이크 파형을 문턱으로 검출하고, 공분산 행렬의 고유분해(PCA)와 k-means로 두 세포를 나눌 수 있다.
- 조건 이름표를 섞는 순열 검정으로 p-value를 구하고, 순열 횟수가 결과의 안정성에 미치는 영향을 말할 수 있다.
- 시간-주파수 map의 수천 칸 검정에서 최대값 보정과 군집(cluster) 기반 보정의 차이를 설명하고 적용할 수 있다.

## 🎬 영상으로 먼저 보기

- [StatQuest: PCA main ideas in only 5 minutes!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=HMOI_lkzW08) (6:05)
- **무엇에 주목할까:** Day 14에서 본 PCA를 짧게 되살리는 용도입니다. "데이터가 가장 넓게 퍼진 방향이 PC1"이라는 그림 하나를 스파이크 파형 45차원에 그대로 옮겨 생각해 보세요.

- [Cluster-based multiple comparisons correction — Mike X Cohen](https://www.youtube.com/watch?v=51y6OAGeS2Q) (10:52)
- **무엇에 주목할까:** 칸 하나하나가 아니라 "이어 붙은 덩어리의 크기"를 순열 분포와 비교한다는 발상, 그리고 그 대가로 "어느 칸이 유의한가"는 말할 수 없다는 한계를 들어 보세요.

## 개념 설명

### spike sorting: 한 전극, 여러 세포

미세전극 하나에는 가까운 세포 여러 개의 스파이크가 함께 잡힙니다. 그래서 (1) 잡음 크기의 몇 배를 넘는 지점을 **문턱 검출**하고, (2) 그 주변 1–2 ms 파형을 잘라 모은 뒤, (3) 파형 모양으로 세포를 나눕니다. 이 과정이 **spike sorting**입니다. 문턱은 보통 잡음 SD의 4–5배로 잡는데, 스파이크가 많으면 SD 자체가 부풀므로 **중앙값 기반 SD**(중앙값 절대값 ÷ 0.6745)를 씁니다.

파형 하나는 수십 개 숫자(예: 45표본)라 그대로 묶기 어렵습니다. **PCA**는 파형들이 가장 크게 달라지는 방향 몇 개를 찾아 수십 차원을 2–3차원으로 줄입니다. 계산은 Day 14와 같습니다. 평균을 뺀 파형 행렬로 **공분산 행렬**을 만들고 **고유분해(eigendecomposition)** 해서, 고유값이 큰 순서대로 고유벡터가 PC1, PC2입니다. 고유값 / 고유값 합이 각 PC의 설명 분산 비율입니다. `np.linalg.eigh`는 고유값을 **오름차순**으로 돌려주므로 뒤집어야 합니다. PC 점수 평면에서 점이 몇 개의 덩어리로 갈라지면, 각 덩어리를 한 세포로 봅니다.

덩어리를 나누는 가장 간단한 방법이 **k-means**입니다. 묶음 수 k를 정하고, 중심점을 놓고, 각 점을 가까운 중심에 배정하고, 중심을 다시 계산하는 일을 반복합니다. 묶음 번호는 임의라 실행마다 바뀔 수 있고, 시작점에 따라 결과가 달라질 수 있으며, 덩어리가 둥글고 크기가 비슷할 때 잘 작동합니다. 실제 연구에서는 PCA 대신 wavelet 계수를 특징으로 쓰거나, 더 유연한 군집법과 품질 지표(불응기 위반 비율, 군집 간 거리)를 함께 쓰는 전용 도구(SpikeInterface 등)를 씁니다. **ICA(독립 성분 분석)** 는 PCA처럼 성분을 찾되 "서로 직교"가 아니라 "서로 통계적으로 독립"인 성분을 찾는 방법으로, EEG에서 눈 깜박임 같은 artifact 성분을 떼어 낼 때 특히 많이 씁니다.

### 순열 검정: 이름표를 섞어 만드는 null 분포

신경 데이터는 정규분포 가정이 맞지 않는 경우가 많습니다(발화율은 0 아래로 못 가고 오른쪽 꼬리가 깁니다). **순열 검정(permutation test)** 은 이론 분포 대신 데이터로 null 분포를 만듭니다. "조건 A와 B에 차이가 없다"는 귀무가설이 맞다면 조건 이름표는 아무렇게나 바꿔 붙여도 됩니다. 그래서 **데이터는 그대로 두고 이름표만 섞어** 차이를 수천 번 계산하면, 우연히 나올 수 있는 차이의 분포가 생깁니다. 관측값보다 크거나 같은(양측이면 절댓값 기준) 순열의 비율이 p-value입니다. 순열 결과에 관측 자체를 포함한다는 뜻으로 분자·분모에 1을 더하면 p = 0이 나오지 않습니다.

순열은 난수이므로 **다시 돌리면 p가 조금씩 달라집니다.** 순열 횟수가 적으면 p가 0.05 문턱을 넘나들 수 있습니다(예시 2). 그래서 순열 수(예: 5,000–10,000)와 seed를 보고하고, 결론이 문턱에 걸쳐 있으면 순열 수를 늘려 다시 확인합니다. 무엇을 섞는지도 중요합니다. 한 사람 안의 반복 시행이라면 시행 이름표를 섞고, 여러 사람의 비교라면 **사람 단위**로 섞어야 합니다. 시행을 독립 표본처럼 섞으면 [Day 30](../../week-5/day-30.md)과 [생리 신호 가이드](../../../crash-course/physiology-signals.md)에서 본 pseudoreplication이 됩니다.

### 수천 칸 검정: 최대값 보정과 군집 기반 보정

시간-주파수 map 하나는 쉽게 1,000칸이 넘고, 칸마다 검정하면 효과가 없어도 5% 정도가 "유의"하게 나옵니다. Day 10의 FDR도 쓸 수 있지만, 신경 데이터는 **이웃한 칸끼리 매우 닮았다**는 특성이 있습니다(시간·주파수 방향으로 매끈합니다). 이 성질을 이용하는 두 가지 순열 기반 보정이 있습니다.

**최대값(extreme value) 보정**은 순열마다 map 전체에서 **가장 큰 |t| 하나**만 모아 null 분포를 만들고, 그 95번째 백분위수를 문턱으로 씁니다. "어떤 칸이든 우연히 이만큼 큰 값이 나올 확률"을 직접 제어하므로 family-wise 오류를 엄격히 막지만, 그만큼 보수적이라 넓고 약한 효과는 놓치기 쉽습니다. **군집 기반(cluster-based) 보정**은 먼저 칸 단위 문턱(예: p < 0.05)을 넘는 칸을 이웃끼리 이어 덩어리로 묶고, 덩어리마다 t의 합(**cluster mass**)을 구합니다. 순열마다 **가장 큰 덩어리 하나**의 크기를 모아 null 분포를 만들고, 관측 덩어리가 그보다 크면 유의합니다. 진짜 효과는 넓게 이어져 나타나고 우연한 튐은 작게 흩어진다는 성질을 이용합니다.

군집 보정의 결론은 "이 **덩어리**가 우연보다 크다"입니다. 덩어리 경계의 정확한 시각·주파수나 "이 칸이 유의하다"는 주장은 이 검정이 보증하지 않습니다. 또 처음 칸 단위 문턱을 무엇으로 잡는지에 따라 덩어리 모양이 달라지므로, 문턱을 **미리** 정하고 보고합니다.

### decoding과 순환 추론(double dipping)

신경 활동으로 자극이나 행동을 맞히는 **decoding**은 분류 문제입니다. 방향별 발화율을 투표처럼 더하는 population vector, 각 방향에서의 Poisson 우도를 비교하는 최대우도 decoder, 일반적인 분류기(선형 판별, SVM 등)가 쓰입니다. 원칙은 [Day 33](../../week-5/day-33.md)과 같습니다. **훈련에 쓴 시행으로 성능을 재지 않고**, 하이퍼파라미터 조정도 훈련 자료 안에서만 합니다. 8방향이면 우연 정답률이 12.5%이므로 그것과 비교하고, 순열(이름표 섞기)로 우연 분포를 만들어 확인합니다. "자극이 있었나 없었나"처럼 두 가지를 가르는 문제라면, 발화율 문턱을 옮겨 가며 적중률과 오경보율을 그리는 신호 검출 이론의 ROC 곡선이 같은 질문을 다룹니다([Day 34 — 평가 지표 해석](../../week-5/day-34.md)의 ROC와 같은 도구입니다). 발화율이 자극에 대해 "몇 비트의 정보"를 담는지 재는 상호정보량(mutual information)도 쓰이는데, 시행이 적으면 정보량이 저절로 부풀므로 이름표를 섞은 데이터의 정보량을 빼서 보정합니다. 순열 검정과 같은 발상입니다.

더 교묘한 함정은 **순환 추론(circular inference, double dipping)** 입니다. 예를 들어 "조건 차이가 가장 큰 시간 구간"을 데이터로 고른 뒤, **같은 데이터**로 그 구간의 차이를 검정하면 거의 반드시 유의하게 나옵니다. 큰 값을 골랐으니 큰 것이 당연합니다. 구간·전극·세포를 고를 때는 (1) 데이터를 보기 전에 정하거나, (2) 독립된 자료(다른 시행 절반, 다른 조건의 평균)로 고르거나, (3) 고르는 과정까지 순열에 포함합니다.

## 예시로 이해하기

> 예시의 파형·발화율·map은 모두 코드 안에서 만든 **가상 데이터**입니다.

### 예시 1 — 문턱 검출 → PCA → k-means로 두 세포 나누기

```python
import numpy as np
from scipy.cluster.vq import kmeans2

rng = np.random.default_rng(12)
fs = 30000                                    # 세포외 기록은 보통 수십 kHz
wt = np.arange(-0.5e-3, 1.0e-3, 1 / fs)       # 스파이크 파형 1.5 ms = 45점
def template(depth, width):                   # 아래로 꺼졌다 올라오는 모양
    return -depth * np.exp(-wt ** 2 / (2 * (width * 1e-4) ** 2)) + 0.3 * depth * np.exp(-(wt - 0.4e-3) ** 2 / (2 * (2 * width * 1e-4) ** 2))
A, B = template(80, 1.5), template(55, 3.0)  # 크고 좁은 세포 A, 작고 넓은 세포 B (µV)

# 연속 기록 2초 안에 두 세포의 스파이크를 섞어 넣는다
n = 2 * fs
x = rng.normal(0, 8, n)
truth = []
for tmpl, lab, k in [(A, 0, 60), (B, 1, 60)]:
    for s in rng.choice(np.arange(100, n - 100), k, replace=False):
        x[s:s + len(wt)] += tmpl; truth.append((s + np.argmin(tmpl), lab))
truth = sorted(truth)

# 1) 문턱 검출: 잡음 SD(중앙값 기반)의 -4배 아래로 처음 내려가는 곳
sd = np.median(np.abs(x)) / 0.6745
cross = np.flatnonzero((x[1:] < -4 * sd) & (x[:-1] >= -4 * sd)) + 1
cross = cross[np.insert(np.diff(cross) > 30, 0, True)]        # 1 ms 안의 중복 제거
# 2) 파형 자르기: 최저점을 기준으로 앞 15점, 뒤 30점
peaks = np.array([c + np.argmin(x[c:c + 15]) for c in cross])
W = np.array([x[p - 15:p + 30] for p in peaks])
print("문턱 %.1f µV, 검출 %d개 (실제 %d개)" % (-4 * sd, len(W), len(truth)))

# 3) PCA: 평균을 뺀 뒤 공분산 행렬의 고유분해
Wc = W - W.mean(axis=0)
C = Wc.T @ Wc / (len(W) - 1)
evals, evecs = np.linalg.eigh(C)                  # 오름차순으로 나온다 -> 뒤집기
evals, evecs = evals[::-1], evecs[:, ::-1]
print("PC1–3 설명 분산 비율:", np.round(evals[:3] / evals.sum(), 3))
scores = Wc @ evecs[:, :2]

# 4) k-means로 2개 묶음
_, lab = kmeans2(scores, 2, seed=1, minit="++")
# 실제 정답과 비교 (검출 시점이 ±1 ms 안이면 같은 스파이크로 본다)
t_idx = np.array([t for t, _ in truth]); t_lab = np.array([l for _, l in truth])
match = [t_lab[np.argmin(np.abs(t_idx - p))] if np.min(np.abs(t_idx - p)) < 30 else -1 for p in peaks]
match = np.array(match)
ok = match >= 0
acc = max(np.mean(lab[ok] == match[ok]), np.mean(lab[ok] != match[ok]))   # 묶음 번호는 임의라 두 경우 중 큰 쪽
print("정답과 짝지은 스파이크 %d개, 분류 일치율 %.1f%%" % (ok.sum(), 100 * acc))
for k in [0, 1]:
    print("묶음 %d: %d개, 평균 최저점 %.0f µV" % (k, (lab == k).sum(), W[lab == k].min(axis=1).mean()))
```

실행 결과:

```text
문턱 -34.5 µV, 검출 112개 (실제 120개)
PC1–3 설명 분산 비율: [0.436 0.119 0.106]
정답과 짝지은 스파이크 112개, 분류 일치율 99.1%
묶음 0: 56개, 평균 최저점 -78 µV
묶음 1: 56개, 평균 최저점 -53 µV
```

120개 중 112개를 검출했고(나머지는 두 스파이크가 겹치거나 1 ms 안에 붙어 하나로 처리된 경우 등), 정답이 알려진 112개 중 99% 이상을 올바른 세포로 나눴습니다. 두 묶음의 평균 최저점이 −78 µV와 −53 µV로, 만들 때 넣은 큰 세포(80)와 작은 세포(55)에 대응합니다. PC1이 분산의 44%를 설명하고 PC2부터는 잡음 수준과 비슷해, 2차원이면 충분하다는 것도 보입니다.

### 예시 2 — 발화율 차이의 순열 검정

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(13)
# 한 뉴런의 시행별 발화율(Hz): 조건 A 30시행, 조건 B 30시행. 오른쪽으로 꼬리가 긴 분포
a = rng.gamma(shape=2, scale=6, size=30) + 2
b = rng.gamma(shape=2, scale=10, size=30) + 2
obs = b.mean() - a.mean()

data = np.concatenate([a, b])
labels = np.array([0] * len(a) + [1] * len(b))
n_perm = 5000
null = np.empty(n_perm)
for i in range(n_perm):
    lab = rng.permutation(labels)                       # 데이터는 그대로, 조건 이름표만 섞는다
    null[i] = data[lab == 1].mean() - data[lab == 0].mean()

p = (np.sum(np.abs(null) >= abs(obs)) + 1) / (n_perm + 1)   # 양측, +1 보정(0이 나오지 않게)
print("관측 차이 %.2f Hz | 순열 null 평균 %.2f, SD %.2f | 순열 p = %.4f" % (obs, null.mean(), null.std(), p))
print("참고: Welch t-검정 p = %.4f" % stats.ttest_ind(b, a, equal_var=False).pvalue)

# 같은 검정을 다시 돌리면 p가 조금씩 달라진다 (난수 때문). 순열 수가 많을수록 덜 흔들린다
for n in [200, 5000]:
    ps = []
    for _ in range(20):
        nl = np.array([np.diff([data[l == 0].mean(), data[l == 1].mean()])[0] for l in (rng.permutation(labels) for _ in range(n))])
        ps.append((np.sum(np.abs(nl) >= abs(obs)) + 1) / (n + 1))
    print("순열 %4d번 × 20회 반복: p 범위 %.4f – %.4f" % (n, min(ps), max(ps)))
```

실행 결과:

```text
관측 차이 7.33 Hz | 순열 null 평균 0.01, SD 3.33 | 순열 p = 0.0254
참고: Welch t-검정 p = 0.0284
순열  200번 × 20회 반복: p 범위 0.0149 – 0.0597
순열 5000번 × 20회 반복: p 범위 0.0242 – 0.0318
```

순열 p(0.025)와 Welch t-검정 p(0.028)가 비슷합니다. 아래 두 줄이 중요합니다. 순열 200번으로는 같은 데이터에서 p가 0.015–0.060 사이를 오가며 0.05 문턱을 넘나들지만, 5,000번이면 0.024–0.032로 안정됩니다.

### 예시 3 — 시간-주파수 map: 보정 없음 vs 최대값 보정 vs 군집 보정

```python
import numpy as np
from scipy import ndimage, stats

rng = np.random.default_rng(14)
n_f, n_t, n_tr = 20, 50, 30                       # 주파수 20칸 × 시간 50칸, 조건마다 30시행
F, T = np.meshgrid(np.arange(n_f), np.arange(n_t), indexing="ij")
blob = 0.6 * np.exp(-((F - 8) ** 2 / (2 * 2.5 ** 2) + (T - 30) ** 2 / (2 * 5 ** 2)))   # 숨긴 효과 덩어리

def maps(n, effect):
    """시행별 시간-주파수 map. 이웃 칸끼리 닮은 잡음(실제 TF map처럼 매끈함)"""
    noise = ndimage.gaussian_filter(rng.normal(0, 1, (n, n_f, n_t)), sigma=(0, 1.5, 3)) * 4
    return noise + (blob if effect else 0)

def tmap(A, B):
    return stats.ttest_ind(B, A, axis=0).statistic

def clusters(t, thr):
    """|t| > thr 인 칸을 이웃끼리 묶고, 묶음마다 t 합(cluster mass)"""
    lab, k = ndimage.label(np.abs(t) > thr)
    return lab, np.array([np.abs(t[lab == i]).sum() for i in range(1, k + 1)])

def analyze(effect, n_perm=500):
    A, B = maps(n_tr, False), maps(n_tr, effect)
    t_obs = tmap(A, B)
    thr = stats.t.ppf(0.975, 2 * n_tr - 2)                 # 칸 하나의 양측 p<0.05 문턱
    lab, mass = clusters(t_obs, thr)
    allm = np.concatenate([A, B]); lbl = np.r_[np.zeros(n_tr), np.ones(n_tr)]
    max_t, max_mass = [], []
    for _ in range(n_perm):
        p = rng.permutation(lbl)
        tp = tmap(allm[p == 0], allm[p == 1])
        max_t.append(np.abs(tp).max())                      # map 하나에서 가장 큰 |t| 하나
        _, m = clusters(tp, thr)
        max_mass.append(m.max() if len(m) else 0)           # map 하나에서 가장 큰 cluster 하나
    pix_thr = np.quantile(max_t, 0.95)
    clu_thr = np.quantile(max_mass, 0.95)
    sig_clu = sum((lab == i + 1).sum() for i, m in enumerate(mass) if m > clu_thr)
    print("효과 %-5s | 보정 없음 %4d칸 | 최대 픽셀 보정 %3d칸 (|t|>%.2f) | cluster 보정 %3d칸" %
          (effect, (np.abs(t_obs) > thr).sum(), (np.abs(t_obs) > pix_thr).sum(), pix_thr, sig_clu))

print("전체 칸 수:", n_f * n_t, "| 숨긴 효과가 최대치의 절반 이상인 칸:", int((blob > 0.3).sum()))
analyze(True)
analyze(False)
```

실행 결과:

```text
전체 칸 수: 1000 | 숨긴 효과가 최대치의 절반 이상인 칸: 51
효과 True  | 보정 없음   78칸 | 최대 픽셀 보정   0칸 (|t|>3.83) | cluster 보정  59칸
효과 False | 보정 없음   34칸 | 최대 픽셀 보정   0칸 (|t|>3.95) | cluster 보정   0칸
```

- **효과가 없는 데이터**에서도 보정 없이 34칸(3.4%)이 "유의"했습니다. 두 보정은 모두 0칸으로 막았습니다.
- **효과가 있는 데이터**에서 최대값 보정은 한 칸도 찾지 못했습니다(문턱 |t| > 3.83이 너무 엄격). 군집 보정은 숨긴 효과 덩어리(절반 높이 이상 51칸) 크기와 비슷한 59칸 덩어리를 찾았습니다.
- 넓고 약한 효과에는 군집 보정이 유리하고, 좁고 강한 효과의 "정확한 위치"가 궁금하면 최대값 보정이 맞습니다. 어떤 보정을 쓸지는 **결과를 보기 전에** 정합니다.

## 직접 해보기

1. `notebooks/advanced/C/C7_pca_stats.ipynb`를 만들고 예시 1–3을 실행합니다.
2. 예시 1에서 두 세포의 모양을 더 비슷하게(`template(80, 1.5)`와 `template(70, 1.8)`) 바꾸고, PC 점수 산점도를 그려 덩어리가 겹치기 시작하는 것을 확인합니다. 분류 일치율이 얼마나 떨어지는지 적습니다.
3. 예시 1에서 `kmeans2(scores, 3, ...)`으로 묶음을 3개로 늘려 봅니다. 데이터에는 세포가 2개뿐인데도 k-means는 군말 없이 3개로 나눕니다. "k를 데이터가 정해 주지 않는다"는 점을 노트에 적고, 묶음마다 ISI 0–2 ms 위반 비율을 계산하는 방법을 계획해 봅니다.
4. 예시 2에서 두 조건의 시행 수를 30 → 8로 줄이면 순열 p와 t-검정 p가 어떻게 달라지는지 비교합니다. 시행 8개에서 가능한 서로 다른 이름표 배치 수(`math.comb(16, 8)`)도 계산해 보세요.
5. 예시 3의 `analyze`에서 칸 단위 문턱 `0.975`를 `0.995`(p < 0.01)로 바꿔 군집 결과가 어떻게 변하는지 봅니다. 문턱을 결과를 본 뒤 바꾸면 왜 안 되는지 한 문장으로 적습니다.
6. **분석 계획서 쓰기:** `reports/advanced/C7_analysis_plan.md`에 가상의 실험(예: "자극 후 0–1초 alpha power가 조건 A보다 B에서 낮은가")에 대해 다음을 미리 적습니다. 분석 단위(시행인가 참가자인가), TF 방법과 파라미터(C4), 기저선 구간, 비교할 시간·주파수 범위와 그 선택 근거, 다중비교 보정 방법과 문턱, 순열 수와 seed, 탐색적 분석으로 표시할 부분. [Day 28 — 분석 계획 확정](../../week-4/day-28.md)의 형식을 따릅니다.

> ⚠️ **흔한 오류 1:** PCA 전에 파형의 평균을 빼지 않습니다. 그러면 PC1이 "평균 파형 방향"을 가리켜 세포 간 차이가 아닌 전체 크기만 반영합니다. `W - W.mean(axis=0)`을 먼저 합니다.
>
> ⚠️ **흔한 오류 2:** "효과가 가장 큰 시간 구간"을 TF map에서 고른 뒤 같은 데이터로 그 구간을 t-검정합니다(순환 추론). 구간을 미리 정하거나, 고르는 과정까지 순열 안에 넣거나, 군집 기반 순열 검정을 처음부터 계획합니다.

## 퀴즈

**1.** `np.linalg.eigh(C)`가 고유값 `[0.1, 0.4, 2.5]`를 돌려주었다. PC1은 몇 번째 고유벡터이고, PC1의 설명 분산 비율은?

<details><summary>정답 보기</summary>

마지막(세 번째) 고유벡터가 PC1입니다(`eigh`는 오름차순). 설명 분산 비율은 2.5 / (0.1 + 0.4 + 2.5) = 2.5 / 3.0 ≈ 83%입니다.

</details>

**2.** 순열 검정에서 1,000번 섞었더니 관측값 이상인 경우가 0번이었다. p-value를 0이라고 보고해도 되는가?

<details><summary>정답 보기</summary>

안 됩니다. 순열은 표본일 뿐이라 "1,000번 중 0번"은 p < 1/1001 정도라는 뜻입니다. (0 + 1)/(1000 + 1) ≈ 0.001로 보고하거나 "p < 0.001"로 쓰고 순열 수를 함께 밝힙니다.

</details>

**3.** 시간-주파수 map 1,200칸에서 칸마다 p < 0.05로 검정했다. 효과가 전혀 없어도 대략 몇 칸이 "유의"하게 나오는가? 그런데 이 칸들이 실제로는 독립이 아니라면 무엇이 달라지는가?

<details><summary>정답 보기</summary>

평균적으로 약 60칸(5%)입니다. 이웃 칸이 닮아 있으면 거짓 양성이 흩어지지 않고 작은 덩어리로 몰려 나오며, 실제 독립 검정 수는 1,200보다 훨씬 적습니다. Bonferroni(1,200으로 나누기)는 지나치게 보수적이 되고, 최대값·군집 기반 순열 보정이 이 상관 구조를 자동으로 반영합니다.

</details>

**4.** 군집 기반 순열 검정에서 0.3–0.7초, 8–12 Hz 덩어리가 p = 0.01로 나왔다. "0.30초부터 alpha가 유의하게 감소했다"고 쓸 수 있는가?

<details><summary>정답 보기</summary>

정확한 시작 시각에 대한 주장은 할 수 없습니다. 군집 검정은 "이 덩어리 전체가 우연보다 크다"를 보증할 뿐, 경계의 개별 칸이 유의하다는 것을 보증하지 않습니다. "대략 0.3–0.7초, 8–12 Hz에 걸친 감소 군집이 유의했다"처럼 씁니다.

</details>

**5.** 32개 전극 중 조건 차이가 가장 큰 전극 하나를 골라, 같은 데이터로 그 전극의 차이를 t-검정해 p = 0.003을 얻었다. 무엇이 문제이고 어떻게 고칠 수 있는가?

<details><summary>정답 보기</summary>

순환 추론(double dipping)입니다. 차이가 큰 전극을 골랐으니 그 전극의 차이가 큰 것은 당연하고, p가 지나치게 작아집니다. 전극을 미리 정하거나, 조건을 합친 평균 반응(조건 차이와 독립인 기준)으로 고르거나, 시행을 반으로 나눠 한쪽에서 고르고 다른 쪽에서 검정하거나, 전극 선택까지 순열 안에 넣습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3이 노트북에서 실행된다.
- [ ] 세포 모양을 비슷하게 했을 때와 k=3일 때의 결과를 비교했다.
- [ ] 시행 수를 줄였을 때의 순열 p와 t-검정 p를 비교했다.
- [ ] 칸 단위 문턱을 바꾼 군집 결과를 적었다.
- [ ] `reports/advanced/C7_analysis_plan.md`에 분석 단위·파라미터·보정 방법·탐색 표시가 모두 들어 있다.

## MATLAB으로는

고유분해는 `eig`, PCA는 `pca`(옛 코드는 `princomp`), k-means는 `kmeans`, 순열은 `randperm`, 군집 찾기는 `bwconncomp`·`bwlabel`(Image Processing Toolbox), t-검정은 `ttest2`입니다. FieldTrip의 `ft_freqstatistics`가 군집 기반 순열 검정을 제공합니다. 자세한 문법은 [파트 B — MATLAB](../B-matlab/)에서 다룹니다.

## 더 읽을거리
- Maris E, Oostenveld R. Nonparametric statistical testing of EEG- and MEG-data. *Journal of Neuroscience Methods* 164:177–190 (2007). [doi:10.1016/j.jneumeth.2007.03.024](https://doi.org/10.1016/j.jneumeth.2007.03.024)
- Kriegeskorte N, et al. Circular analysis in systems neuroscience: the dangers of double dipping. *Nature Neuroscience* 12:535–540 (2009). [doi:10.1038/nn.2303](https://doi.org/10.1038/nn.2303)
- Quiroga RQ, Nadasdy Z, Ben-Shaul Y. Unsupervised spike detection and sorting with wavelets and superparamagnetic clustering. *Neural Computation* 16:1661–1687 (2004). [doi:10.1162/089976604774201631](https://doi.org/10.1162/089976604774201631)
- SpikeInterface 문서: <https://spikeinterface.readthedocs.io/en/latest/> · MNE-Python 군집 순열 검정 튜토리얼은 <https://mne.tools/stable/index.html>에서 "cluster permutation"으로 검색
- Mike X Cohen, *MATLAB for Brain and Cognitive Scientists*, MIT Press (2017) — 비모수 통계(순열, 최대값 보정), PCA·ICA, spike sorting, 분류와 군집 장. [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/)
- Pascal Wallisch 외, *MATLAB for Neuroscientists*, 2nd ed., Academic Press (2014) — PCA와 spike sorting, 정보 이론, 이산·연속 변수 decoding 장. [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0)

---
[← 이전](day-C6.md) · [코스 지도](../../../README.md) · [다음 →](../../../README.md)
