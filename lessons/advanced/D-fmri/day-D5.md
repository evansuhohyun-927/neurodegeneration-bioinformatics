# Day D5 — 집단 분석과 다중비교: 혼합효과, FWE, cluster, FDR, 순열, 검정력

> **주차:** 심화 파트 D — fMRI 데이터 분석 · **예상 시간:** 75–90분 (복습 포함 90분 이상 걸릴 수 있음) · **산출물:** `notebooks/advanced/D/D5_group_inference.ipynb`, `reports/advanced/D5_inference_plan.md`
>
> **먼저 끝내 둘 레슨:** Day D4, Day 9 (p-value와 검정력), Day 10 (다중검정과 FDR), Day 30·36 (bootstrap, permutation), Day 31 (공변량).

## 오늘의 목표
- 1수준(사람 안)과 2수준(사람 사이) 분석을 잇는 요약 통계 방식을 설명하고, 고정효과와 혼합효과의 결론 범위를 구분할 수 있다.
- voxel 수만 개를 검정할 때 FWE와 FDR이 각각 무엇을 통제하는지, Bonferroni·무작위장 이론·순열 검정·cluster 추론의 발상을 비교할 수 있다.
- 미리 정한 ROI 하나에 대해 필요한 피험자 수를 계산하고, 사후 검정력 계산이 왜 무의미한지 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [Principles of fMRI Part 1, Module 24: Group-level Analysis II — Principles of fMRI](https://www.youtube.com/watch?v=-abMLQSjMSI) (10:09)
- **무엇에 주목할까:** 사람 안 변동과 사람 사이 변동이 각각 어디서 추정되고, 집단 결론의 표준오차에 어떻게 들어가는지에 집중하세요.

- [Principles of fMRI Part 1, Module 26: Multiple Comparisons — Principles of fMRI](https://www.youtube.com/watch?v=AalIM9-5-Pk) (9:04)
- **무엇에 주목할까:** "어딘가에 하나라도 틀린 것이 있을 확률"(FWE)과 "찾은 것 중 틀린 것의 비율"(FDR)이 다른 질문이라는 점을 붙잡으세요. Day 10의 내용이 뇌 지도에서 어떻게 바뀌는지가 오늘의 주제입니다.

## 개념 설명

### 2수준 모형: 사람마다 한 숫자로 줄인 뒤 사람들을 비교한다

한 사람에게서 수백 시점을 얻었다고 표본이 수백 개가 되는 것은 아닙니다. 집단 연구의 질문은 "이 사람들"이 아니라 "이 사람들이 뽑혀 나온 모집단"에 관한 것이므로, 사람 자체를 무작위로 뽑힌 표본, 즉 **무작위 효과**(random effect)로 다뤄야 합니다. 사람 안 변동과 사람 사이 변동을 함께 모델링하는 것이 **혼합효과 모형**(mixed effects model)입니다.

fMRI는 이를 단계로 나눠 풉니다. **1수준**에서 사람마다 D4의 GLM을 돌려 contrast 값(예: 얼굴 − 집) 하나와 그 분산을 얻습니다. 한 사람이 run을 여러 개 찍었다면 run들을 먼저 **고정효과**(fixed effects, 사람 안 분산만 쓰는 가중 평균)로 합칩니다. **2수준**에서는 사람별 contrast 값들을 새 자료로 삼아 또 하나의 GLM을 돌립니다. 한 집단의 평균이면 one-sample t, 두 집단 비교면 two-sample t, 나이 같은 공변량이 있으면 회귀가 됩니다. 이것이 Day 33에서 배운 "참가자 단위로 생각하기"의 fMRI 판입니다.

비유하면, 혈압약 효과를 알고 싶을 때 한 사람을 하루에 백 번 재서 그 사람의 혈압은 아주 정확히 알 수 있지만, "이 약이 사람들에게 듣는가"는 결국 몇 사람을 쟀느냐가 정합니다. 예시 1에서 보듯 사람 사이 변동이 크면, 사람 안 측정을 아무리 정밀하게 해도 집단 결론의 표준오차는 거의 줄지 않습니다.

2수준을 푸는 방식은 두 갈래입니다. 사람별 추정치만 써서 보통의 t 검정을 하는 **OLS 방식**(사람 안 분산이 모두 같다고 가정)과, 1수준 분산까지 넘겨받아 덜 정밀한 사람의 비중을 낮추는 **가중(GLS) 방식**입니다. 한 집단 평균에서는 둘의 차이가 대개 작지만, 두 집단을 비교하거나 공변량을 넣으면 달라질 수 있습니다.

**공변량의 평균 중심화.** 나이를 공변량으로 넣으면 절편은 "나이 0세의 평균 활성"이 되어 쓸모가 없습니다. 나이에서 전체 평균을 빼면 절편이 "평균 나이에서의 활성"이 됩니다. 기울기는 바뀌지 않습니다. 두 집단을 비교할 때는 **전체 평균**으로 중심화해야 하고, 집단마다 따로 중심화하면 "공변량을 맞춘 집단 차이"라는 해석이 무너집니다. 집단 × 공변량 상호작용이 유의하면 두 직선이 어딘가에서 엇갈린다는 뜻이므로, 그때는 "집단 주효과" 하나만 따로 해석하지 않습니다. 환자군과 대조군의 나이, 교육 연수, 약물, 움직임이 다를 때 이 원칙이 바로 쓰입니다(Day 31).

### 다중비교: 지도 전체에 대한 오류를 정의한다

voxel 10만 개를 p < 0.05로 각각 검정하면 신호가 없어도 평균 5,000개가 "유의"합니다. 그래서 지도 전체에 대한 오류율을 정의합니다.

- **FWE**(familywise error rate): 지도 **어디에든** 거짓 양성이 하나라도 있을 확률. FWE 5%로 문턱을 넘은 지도는 "거짓 양성이 하나도 없을" 것을 95% 확신한다는 뜻입니다.
- **FDR**(false discovery rate): 찾아낸 것 중 거짓의 **비율**의 기댓값. FDR 5%면 오래 반복했을 때 평균적으로 검출의 5% 이하가 거짓입니다. FWE보다 관대해 검출력이 크지만, 지도 안의 어느 voxel이 거짓인지는 말해 주지 않습니다.

FWE를 지키는 방법은 셋입니다. **Bonferroni**(α를 검정 수로 나누기)는 어떤 자료에도 타당하지만, smoothing으로 이웃 voxel이 강하게 닮아 있는 fMRI에서는 지나치게 보수적입니다. **무작위장 이론**(random field theory, RFT)은 매끄러운 잡음 지도가 높은 문턱을 넘는 확률을 수학적으로 근사합니다. 지도의 매끄러움을 FWHM으로 추정하고, 탐색 부피를 "해상도 원소"(RESEL, FWHM 크기의 가상 voxel) 수로 세어, 매끄러울수록(RESEL이 적을수록) 덜 엄격한 문턱을 줍니다. 다만 RESEL 수로 Bonferroni를 하는 것과 같지는 않고, 충분한 smoothing(voxel의 2–3배 이상)과 충분한 표본을 가정합니다. **순열 검정**(permutation test)은 자료 자체로 귀무 분포를 만듭니다. 두 집단이면 집단 이름표를 섞고, 한 집단이면 사람별 contrast 지도의 부호를 무작위로 뒤집습니다(귀무가설에서 0을 중심으로 대칭이라는 가정). 섞을 때마다 **지도 전체의 최댓값**을 기록하면 그 분포의 95번째 백분위수가 FWE 5% 문턱입니다(예시 2). 가정이 적고 표본이 작을 때도 정확해서, 책은 집단 분석의 FWE에 순열 검정을 권합니다. 1수준 시계열에는 자기상관 때문에 그대로 섞을 수 없습니다(Day 36의 교환 가능성).

**cluster 추론.** 활성은 대개 여러 voxel에 걸쳐 퍼져 있으므로, 1차 문턱(cluster-forming threshold)을 넘은 이웃 voxel 덩어리의 **크기**로 판단하는 방법이 널리 쓰입니다. 효과가 잡음의 매끄러움보다 넓게 퍼져 있으면 voxel 단위보다 검출력이 큽니다. 대가는 둘입니다. 1차 문턱이 임의적이어서 조금만 바꿔도 cluster가 합쳐지거나 갈라지고, "이 cluster 안 어딘가에 신호가 있다"까지만 말할 수 있어 공간 특이성이 떨어집니다. 1차 문턱을 여러 개 시도해 보고 마음에 드는 것을 고르면 그것 자체가 다중비교입니다. 문턱 없이 모든 문턱을 통합하는 TFCE(Smith & Nichols 2009)는 이 의존성을 줄이려는 방법입니다.

> **책 이후의 변화:** Eklund 등(2016)은 실제 휴지기 자료에 가짜 과제를 씌워, 당시 널리 쓰인 매개변수 cluster 추론(특히 관대한 1차 문턱 p < 0.01)이 명목 5%보다 훨씬 많은 거짓 양성을 낸다는 것을 보였습니다. 공간 자기상관이 가우시안 모양이라는 가정이 실제와 달랐기 때문입니다. 이후 1차 문턱은 p < 0.001 이상으로 엄격하게 잡고, 집단 분석에는 순열(예: FSL randomise, SnPM)이나 TFCE를 쓰는 쪽으로 관행이 바뀌었습니다. 같은 자료를 70개 팀이 분석했을 때 결론이 갈린 NARPS 연구(Botvinik-Nezer 등 2020)는 분석 선택을 미리 정하고 모두 보고해야 하는 이유를 보여 줍니다.

### 결합 추론, 마스크, ROI

여러 contrast를 함께 해석할 때 두 질문을 구분합니다. **상호작용**은 "효과가 조건에 따라 다른가", **결합**(conjunction)은 "두 효과가 모두 있는가"입니다. 결합은 각 지도를 따로 문턱 처리한 뒤 교집합을 취하면 되고(두 지도의 voxel별 최솟값을 문턱 처리하는 것과 같음), 각 검정과 같은 오류 수준을 유지합니다. 다만 모든 효과가 유의해야 하므로 검출력이 낮습니다. 두 효과의 주효과가 유의하다고 결합이 성립하는 것은 아닙니다.

가설이 특정 영역에 있다면 탐색 범위를 그 **ROI**로 좁혀 다중비교 부담을 줄일 수 있습니다(small volume correction). 조건은 하나, ROI를 **자료를 보기 전에** 독립적으로 정해야 합니다. 결과를 보고 고른 ROI로 보정하면 오류율이 부풀려집니다(Day D7의 circularity). 아주 작은 ROI에서는 cluster 추론과 FDR이 잘 작동하지 않으니 voxel 단위 FWE를 씁니다.

### 검정력: 자료를 모으기 전에 계산한다

**검정력**(power)은 진짜 효과가 있을 때 그것을 찾아낼 확률이고, 흔히 80%를 목표로 합니다. 뇌 전체의 검정력을 계산하는 것은 복잡하므로, 실무에서는 **미리 정한 ROI 하나의 평균 % 신호 변화**에 대한 one-sample t 검정력을 계산합니다. 이것조차 부족하면 더 복잡한 분석은 확실히 부족합니다. 필요한 값은 기대 효과 크기(평균)와 사람 사이 표준편차이며, 비슷한 설계의 선행 연구나 예비 자료에서 독립적으로 정한 ROI로 얻습니다(같은 자료로 고른 ROI의 효과 크기는 부풀려져 있음). 효과가 20% 작다면, 표준편차가 10% 크다면 같은 "만약"들을 함께 계산해 둡니다.

이미 끝난 연구의 관찰된 효과로 검정력을 계산하는 **사후 검정력**(post hoc power)은 의미가 없습니다. 관찰된 t가 문턱과 같으면 계산된 검정력은 늘 50% 근처가 나오고, 그 값은 이미 얻은 p 값을 다른 말로 바꾼 것에 불과하기 때문입니다.

> **책 이후의 변화:** 개인차(뇌–행동 상관)를 전뇌에서 찾는 연구는 기대 효과가 매우 작아, 신뢰할 만한 결과를 얻으려면 수천 명이 필요할 수 있다는 분석(Marek 등 2022)이 나왔습니다. 집단 평균 활성처럼 효과가 큰 질문과 개인차 질문은 필요한 표본 수의 규모가 다르다는 점을 구분하세요.

## 예시로 이해하기

> 모든 수치는 연습용 **가상 자료**입니다. 예시 2는 계산을 빠르게 하려고 3D 뇌 대신 48×48 2D 지도를 씁니다.

### 예시 1 — 고정효과와 혼합효과: 같은 평균, 전혀 다른 결론

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(4)
n_sub = 12
true_pop_mean, sd_between = 0.2, 0.6        # 사람마다 진짜 효과가 크게 다르다
sd_within = 0.15                            # 1수준(한 사람 안) 추정 오차

subj_true = rng.normal(true_pop_mean, sd_between, n_sub)
beta = subj_true + rng.normal(0, sd_within, n_sub)      # 1수준에서 얻은 사람별 contrast 추정치
var_within = np.full(n_sub, sd_within ** 2)             # 1수준이 함께 알려 주는 분산

# 고정효과(FFX): 사람 안 오차만 쓴다 → '이 12명'에 대한 결론
w = 1 / var_within
ffx_mean = np.sum(w * beta) / w.sum()
ffx_se = np.sqrt(1 / w.sum())
print("FFX: 평균 %.2f, SE %.3f, z = %.1f" % (ffx_mean, ffx_se, ffx_mean / ffx_se))

# 혼합효과(요약 통계 방식, OLS): 사람별 추정치 12개로 one-sample t-test → '모집단'에 대한 결론
t, p = stats.ttest_1samp(beta, 0)
print("MFX(OLS): 평균 %.2f, SE %.3f, t(%d) = %.2f, p = %.3f"
      % (beta.mean(), beta.std(ddof=1) / np.sqrt(n_sub), n_sub - 1, t, p))
print("사람별 추정치:", np.round(beta, 2))
```

출력:

```text
FFX: 평균 0.17, SE 0.043, z = 4.0
MFX(OLS): 평균 0.17, SE 0.197, t(11) = 0.88, p = 0.400
사람별 추정치: [-0.14  0.17  0.97  0.93 -1.07  0.36 -0.22  0.16 -0.86  0.24  0.4   1.13]
```

평균은 0.17로 같지만, 사람 안 오차만 쓴 FFX는 표준오차 0.04로 z = 4.0이라는 "강한" 결과를 내고, 사람 사이 흩어짐까지 반영한 MFX는 표준오차 0.20으로 p = 0.40입니다. 사람별 추정치를 보면 −1.07부터 1.13까지 흩어져 있어, 모집단 평균이 0보다 크다고 말할 근거는 약합니다. FFX의 결론은 "이 12명에게서는 평균이 0이 아니었다"까지만 유효합니다. 초창기 fMRI에서 모든 사람의 시계열을 이어 붙여 분석하던 방식이 바로 이 문제를 갖고 있었습니다.

### 예시 2 — 신호가 있는 지도에서 보정 방법 다섯 가지 비교

```python
import numpy as np
from scipy import ndimage, stats
from statsmodels.stats.multitest import multipletests

rng = np.random.default_rng(8)
n_sub, shape = 16, (48, 48)                   # 피험자 16명, 2D '뇌' 48×48 = 2,304 voxel
sigma = 2.0                                   # 공간 smoothing (voxel 단위 σ)

def subject_maps(signal):
    maps = rng.normal(size=(n_sub, *shape))
    maps = np.array([ndimage.gaussian_filter(m, sigma) for m in maps])
    maps /= maps.std()
    return maps + signal

def tmap(maps):
    return maps.mean(0) / (maps.std(0, ddof=1) / np.sqrt(n_sub))

yy, xx = np.mgrid[0:48, 0:48]
signal = 1.2 * np.exp(-((xx - 14) ** 2 + (yy - 24) ** 2) / (2 * 4.0 ** 2))   # 왼쪽에만 진짜 효과
maps = subject_maps(signal)
t_obs = tmap(maps)
df, V = n_sub - 1, t_obs.size
truth = signal > 0.1

def report(name, thr):
    hit = t_obs > thr
    print(f"{name:22} 문턱 t>{thr:5.2f} | 검출 {hit.sum():4d} | 그중 신호 없는 곳 {np.sum(hit & ~truth):4d}")

report("보정 없음 p<0.05", stats.t.isf(0.05, df))
report("보정 없음 p<0.001", stats.t.isf(0.001, df))
report("Bonferroni FWE 0.05", stats.t.isf(0.05 / V, df))

# 순열(부호 뒤집기) 최대값 분포: 매번 지도 전체의 최대 t와 최대 cluster 크기를 기록
u_cluster = stats.t.isf(0.01, df)              # cluster를 만드는 1차 문턱
max_t, max_k = [], []
for _ in range(1000):
    flips = rng.choice([-1, 1], size=(n_sub, 1, 1))
    tp = tmap(maps * flips)
    max_t.append(tp.max())
    lab, nlab = ndimage.label(tp > u_cluster)
    max_k.append(np.bincount(lab.ravel())[1:].max() if nlab else 0)
report("순열 max-T FWE 0.05", np.quantile(max_t, 0.95))

k_crit = np.quantile(max_k, 0.95)
lab, nlab = ndimage.label(t_obs > u_cluster)
sizes = np.bincount(lab.ravel())[1:]
print(f"cluster 추론: 1차 문턱 t>{u_cluster:.2f}에서 cluster {nlab}개, 크기 {sorted(sizes.tolist(), reverse=True)[:5]}"
      f" | FWE 0.05 임계 크기 {k_crit:.0f} voxel → 살아남은 cluster {np.sum(sizes > k_crit)}개")

p = stats.t.sf(t_obs, df).ravel()
rej = multipletests(p, alpha=0.05, method="fdr_bh")[0].reshape(shape)
print(f"BH FDR 0.05            검출 {rej.sum():4d} | 그중 신호 없는 곳 {np.sum(rej & ~truth):4d}")
```

출력:

```text
보정 없음 p<0.05           문턱 t> 1.75 | 검출  215 | 그중 신호 없는 곳  122
보정 없음 p<0.001          문턱 t> 3.73 | 검출   36 | 그중 신호 없는 곳    0
Bonferroni FWE 0.05    문턱 t> 5.68 | 검출   13 | 그중 신호 없는 곳    0
순열 max-T FWE 0.05      문턱 t> 5.16 | 검출   17 | 그중 신호 없는 곳    0
cluster 추론: 1차 문턱 t>2.60에서 cluster 3개, 크기 [61, 12, 7] | FWE 0.05 임계 크기 29 voxel → 살아남은 cluster 1개
BH FDR 0.05            검출   33 | 그중 신호 없는 곳    0
```

"신호 없는 곳"은 가상 신호의 크기가 0.1 이하인 voxel입니다. 보정 없는 p < 0.05는 215개를 찾았지만 그중 122개가 신호 없는 곳입니다. Bonferroni(t > 5.68)는 거짓 양성이 없지만 13개만 찾습니다. 부호 뒤집기 순열로 만든 최대 t 분포는 문턱을 5.16으로 낮춰 같은 FWE 5%를 지키면서 17개를 찾습니다. smoothing으로 voxel들이 서로 닮아 "실질적인 검정 수"가 2,304보다 적다는 것을 자료가 알려 준 셈입니다. cluster 추론은 크기 61짜리 덩어리 하나를 유의하다고 판단했고, 그 안의 어느 voxel이 진짜인지는 말하지 않습니다. BH FDR은 33개를 찾았습니다. 여기서 보정 없는 p < 0.001도 거짓 양성이 0이었지만, 이것은 이 지도 하나의 우연이며 그 문턱이 지도 전체의 오류율을 보장하지는 않습니다.

### 예시 3 — 미리 정한 ROI의 검정력 곡선

```python
import numpy as np
from scipy import stats

def power_one_sample(mu, sd, n, alpha=0.05):
    """미리 정한 ROI 하나의 평균 % 신호 변화에 대한 단측 one-sample t-test 검정력"""
    df = n - 1
    ncp = np.sqrt(n) * mu / sd                 # 비중심 모수
    return stats.nct.sf(stats.t.isf(alpha, df), df, ncp)

mu, sd = 0.5, 1.2                              # 가상 예비 자료: 평균 0.5%, 사람 간 SD 1.2%
for n in [10, 20, 30, 40, 50, 60]:
    print(f"N = {n:2d}: 검정력 {power_one_sample(mu, sd, n):.2f}")

need = next(n for n in range(5, 500) if power_one_sample(mu, sd, n) >= 0.8)
print("80%에 처음 닿는 N:", need)
# '만약'을 바꿔 보기: 효과가 20% 작다면?
need_small = next(n for n in range(5, 500) if power_one_sample(0.8 * mu, sd, n) >= 0.8)
print("효과가 20% 작으면 필요한 N:", need_small)

# 자기 점검: 시뮬레이션으로 같은 값을 다시 얻는지
rng = np.random.default_rng(0)
sims = rng.normal(mu, sd, size=(20000, need))
p = stats.ttest_1samp(sims, 0, axis=1, alternative="greater").pvalue
print("시뮬레이션 검정력(N=%d): %.2f" % (need, np.mean(p < 0.05)))
```

출력:

```text
N = 10: 검정력 0.34
N = 20: 검정력 0.56
N = 30: 검정력 0.72
N = 40: 검정력 0.83
N = 50: 검정력 0.90
N = 60: 검정력 0.94
80%에 처음 닿는 N: 38
효과가 20% 작으면 필요한 N: 58
시뮬레이션 검정력(N=38): 0.81
```

평균 0.5%, 사람 간 표준편차 1.2%라면 80% 검정력에 38명이 필요하고, 효과가 20%만 작아도 58명으로 늘어납니다. 마지막 줄은 공식이 맞는지 시뮬레이션으로 확인한 것입니다. 이 계산은 단측 검정, 한 ROI, 한 집단이라는 가장 단순한 상황입니다. 두 집단 비교, 다중비교 보정, 탈락자를 고려하면 숫자는 더 커집니다.

### 참고 — 실제 집단 분석·순열 검정 도구의 명령 형태 (FSL 부분은 실행 확인 안 됨)

```bash
# FSL randomise: 사람별 contrast 지도를 4D로 쌓은 파일에 one-sample t, 부호 뒤집기 5,000번, TFCE.
randomise -i all_subjects_cope.nii.gz -o grp -1 -T -n 5000 -m group_mask.nii.gz
```

```python
# nilearn 2수준 모형. nilearn 0.14.1에서 가상 contrast 지도 8개로 실행 확인(n_perm만 줄여서). FSL randomise는 FSL 미설치로 실행 확인 안 됨.
from nilearn.glm.second_level import SecondLevelModel, non_parametric_inference
import pandas as pd
design = pd.DataFrame({"intercept": [1] * len(cmap_files)})
z = SecondLevelModel().fit(cmap_files, design_matrix=design).compute_contrast("intercept", output_type="z_score")
neg_log_p = non_parametric_inference(cmap_files, design_matrix=design, n_perm=5000)
```

## 직접 해보기

1. `D5_group_inference.ipynb`에서 예시 1–3을 실행한다.
2. 예시 1에서 `sd_within`을 0.05와 0.5로 바꿔 FFX와 MFX의 표준오차가 각각 어떻게 변하는지 표로 만든다. 사람 안 정밀도를 높이는 것과 사람을 더 모으는 것 중 어느 쪽이 집단 결론에 효과적인지 적는다.
3. 예시 2에서 신호를 지우고(`signal = 0 * signal`) 다시 실행해 각 방법의 검출 수를 적는다. 이 과정을 seed를 바꿔 10번 반복하면, 순열 max-T에서 하나라도 검출이 나온 횟수가 대략 몇 번일지 예상하고 확인한다(FWE 5%의 뜻).
4. 예시 2에서 1차 문턱 `u_cluster`를 p < 0.001에 해당하는 값으로 바꾸고 cluster 결과가 어떻게 달라지는지 본다. 문턱을 결과를 본 뒤 고르면 왜 문제인지 한 문장으로 적는다.
5. `reports/advanced/D5_inference_plan.md`를 만들고 가상의 연구(예: "경도인지장애 환자 25명과 대조군 25명의 기억 과제 fMRI")에 대해 적는다: 2수준 모형의 설계 행렬 열 / 공변량과 중심화 방식 / 다중비교 방법과 1차 문턱 / 미리 정한 ROI와 그 출처 / 예시 3 방식으로 계산한 검정력과 그 가정.

⚠️ **흔한 오류 1 — 집단마다 따로 평균 중심화하기.** 환자군의 나이는 환자 평균으로, 대조군의 나이는 대조군 평균으로 빼면 두 집단의 나이 차이가 보정되지 않은 채 "나이를 보정한 집단 차이"로 보고됩니다. 공변량은 전체 평균으로 중심화합니다.

⚠️ **흔한 오류 2 — "보정 없는 p < 0.001, cluster 크기 k > 10"을 FWE처럼 쓰기.** 고정된 임의의 cluster 크기 문턱은 지도의 매끄러움과 탐색 부피를 반영하지 않으므로 오류율을 보장하지 않습니다. 탐색적 그림에는 쓸 수 있지만, 확증적 결론에는 FWE(순열·RFT) 또는 FDR로 보정한 결과를 씁니다.

## 퀴즈

**1.** 피험자 12명, 각자 run 3개를 찍었습니다. 표준적인 다단계 분석의 순서를 적으세요. (단답)

<details><summary>정답 보기</summary>

(1) run마다 1수준 GLM으로 contrast와 분산을 추정한다. (2) 한 사람의 run 3개를 고정효과로 합쳐 사람별 contrast 하나를 만든다. (3) 사람별 contrast 12개로 2수준 혼합효과(또는 OLS) 모형을 적합한다. run이 사람당 몇 개뿐이라 run 수준에서는 무작위 효과 분산을 믿을 만하게 추정하기 어렵기 때문에 (2)는 고정효과로 합칩니다.

</details>

**2.** FWE 5%와 FDR 5%의 차이를 가장 잘 설명한 것은?

(a) 둘은 같다 (b) FWE는 거짓 양성이 하나라도 있을 확률, FDR은 검출 중 거짓 비율의 기댓값을 통제한다 (c) FDR이 더 엄격하다 (d) FWE는 cluster에만 쓴다

<details><summary>정답 보기</summary>

(b). FWE는 "지도에 거짓이 하나도 없다"를 95% 지키고, FDR은 "찾은 것의 대부분이 진짜"를 평균적으로 지킵니다. FDR이 더 관대해 검출이 많습니다. 둘 다 voxel 단위로도 cluster 단위로도 정의할 수 있습니다.

</details>

**3.** 순열 검정으로 FWE 보정 문턱을 얻으려면 순열마다 무엇을 기록하나요?

(a) 모든 voxel의 t (b) 지도 전체의 최대 통계량(또는 최대 cluster 크기) (c) 평균 t (d) p 값의 중앙값

<details><summary>정답 보기</summary>

(b). "어디에든 하나라도"를 통제하려면 지도에서 가장 큰 값의 분포가 필요합니다. 그 분포의 95번째 백분위수를 넘는 voxel(또는 cluster)은 FWE 5%에서 유의합니다.

</details>

**4.** cluster 추론의 결과가 "크기 6,000 voxel짜리 cluster가 FWE p < 0.001"입니다. 이 결과로 말할 수 있는 것은?

<details><summary>정답 보기</summary>

"이 cluster 안 어딘가에 하나 이상의 진짜 신호가 있다"입니다. cluster 안의 특정 voxel이나 특정 해부학 영역에 효과가 있다고 말할 수는 없습니다. 영역별 주장이 필요하면 voxel 단위 추론이나 미리 정한 ROI 분석을 함께 보고합니다.

</details>

**5.** 효과가 유의하지 않게 나온 연구에서 "관찰된 효과로 계산한 검정력이 30%였으니 표본이 작았다"고 쓰는 것이 왜 부적절한가요?

<details><summary>정답 보기</summary>

관찰된 효과로 계산한 사후 검정력은 p 값과 일대일로 대응하는 값이라 새 정보가 없습니다. p가 크면 사후 검정력은 늘 낮게 나옵니다. 검정력은 연구 전에 독립적인 근거(선행 연구, 예비 자료)로 계산하고, 결과 해석은 효과 크기와 신뢰구간으로 합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] FFX와 MFX의 표준오차 차이를 직접 계산했다.
- [ ] 같은 지도에 Bonferroni, 순열 max-T, cluster, FDR을 적용해 결과를 비교했다.
- [ ] 신호 없는 지도로 각 방법의 거짓 양성을 확인했다.
- [ ] 검정력 곡선을 그리고 "만약" 시나리오를 계산했다.
- [ ] `reports/advanced/D5_inference_plan.md`에 추론 계획을 적었다.

## 더 읽을거리
- Poldrack RA, Mumford JA, Nichols TE. *Handbook of Functional MRI Data Analysis.* Cambridge University Press, 2011. <https://www.cambridge.org/core/books/handbook-of-functional-mri-data-analysis/8EDF966C65811FCCC306F7C916228529> — 6장(집단 분석, 평균 중심화), 7장(추론, 다중비교, 결합, ROI, 검정력).
- Nichols TE, Holmes AP. Nonparametric permutation tests for functional neuroimaging: a primer with examples. *Hum Brain Mapp.* 2002;15:1–25. doi:[10.1002/hbm.1058](https://doi.org/10.1002/hbm.1058)
- Nichols T, Hayasaka S. Controlling the familywise error rate in functional neuroimaging: a comparative review. *Stat Methods Med Res.* 2003;12:419–446. doi:[10.1191/0962280203sm341ra](https://doi.org/10.1191/0962280203sm341ra)
- Genovese CR, Lazar NA, Nichols T. Thresholding of statistical maps in functional neuroimaging using the false discovery rate. *NeuroImage.* 2002;15:870–878. doi:[10.1006/nimg.2001.1037](https://doi.org/10.1006/nimg.2001.1037)
- Smith SM, Nichols TE. Threshold-free cluster enhancement. *NeuroImage.* 2009;44:83–98. doi:[10.1016/j.neuroimage.2008.03.061](https://doi.org/10.1016/j.neuroimage.2008.03.061)
- Eklund A, Nichols TE, Knutsson H. Cluster failure: Why fMRI inferences for spatial extent have inflated false-positive rates. *PNAS.* 2016;113:7900–7905. doi:[10.1073/pnas.1602413113](https://doi.org/10.1073/pnas.1602413113)
- Mumford JA, Nichols TE. Power calculation for group fMRI studies accounting for arbitrary design and temporal autocorrelation. *NeuroImage.* 2008;39:261–268. doi:[10.1016/j.neuroimage.2007.07.061](https://doi.org/10.1016/j.neuroimage.2007.07.061)
- Botvinik-Nezer R, et al. Variability in the analysis of a single neuroimaging dataset by many teams. *Nature.* 2020;582:84–88. doi:[10.1038/s41586-020-2314-9](https://doi.org/10.1038/s41586-020-2314-9)
- Marek S, et al. Reproducible brain-wide association studies require thousands of individuals. *Nature.* 2022;603:654–660. doi:[10.1038/s41586-022-04492-9](https://doi.org/10.1038/s41586-022-04492-9)

---
[← 이전](day-D4.md) · [코스 지도](../../../README.md) · [다음 →](day-D6.md)
