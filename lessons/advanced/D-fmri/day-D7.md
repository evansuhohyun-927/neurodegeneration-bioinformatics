# Day D7 — 패턴 분석과 ROI: decoding, 교차검증 누수, circularity, % 신호 변화

> **주차:** 심화 파트 D — fMRI 데이터 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/D/D7_mvpa_roi.ipynb`, `reports/advanced/D7_fmri_analysis_checklist.md`
>
> **먼저 끝내 둘 레슨:** Day D4–D5, Day 32 (baseline 분류 모델), Day 33 (GroupKFold와 데이터 누수), Day 34 (평가 지표).

## 오늘의 목표
- voxel 패턴으로 조건을 맞히는 분석(MVPA)의 네 단계를 말하고, run 단위 교차검증을 설계할 수 있다.
- feature 선택이 교차검증 밖에서 일어나면 신호 없는 자료에서도 높은 정확도가 나오는 것을 직접 보이고, 순열 검정으로 우연 수준을 확인할 수 있다.
- ROI 분석에서 circularity(double dipping)를 피하는 방법과 % 신호 변화를 올바르게 계산·보고하는 방법을 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [Principles of fMRI Part 2, Module 26 MVPA neuroscience Part 1 — Principles of fMRI](https://www.youtube.com/watch?v=87yKz23sPnE) (10:42)
- **무엇에 주목할까:** 한 voxel씩 보는 GLM과 여러 voxel의 패턴을 함께 보는 분석이 묻는 질문이 어떻게 다른지에 집중하세요.

- [Overview of MVPA Tutorial — Andy's Brain Tube](https://www.youtube.com/watch?v=0uMexB0MAOw) (2:51)
- **무엇에 주목할까:** 짧은 개관입니다. 학습 자료와 시험 자료를 나누는 단위가 무엇인지(시행인지 run인지)를 생각하며 보세요.

## 개념 설명

### 설명에서 예측으로: MVPA의 네 단계

D4–D6의 분석은 "이 자료를 가장 잘 설명하는 모수"를 찾았습니다. 기계학습은 "**새 자료**를 가장 잘 맞히는 모수"를 찾습니다. 둘은 같지 않습니다. 모수를 늘리면 학습 자료에는 언제나 더 잘 맞지만, 새 자료에는 어느 순간부터 오히려 나빠집니다(**과적합**, overfitting). fMRI에서는 feature(voxel)가 수만 개, 관측(시행이나 사람)이 수십 개라 이 문제가 극단적입니다. 차원이 늘면 공간을 채우는 데 필요한 표본이 폭발적으로 늘어나는 "차원의 저주"도 있습니다. 대응은 차원 축소(PCA·ICA), 희소성 가정, feature 선택, 그리고 정규화된 분류기입니다.

voxel 패턴 분석(**MVPA**, multivoxel pattern analysis, decoding)은 네 단계로 진행합니다.

1. **자료 추출**: 시행마다(또는 블록·run마다) 한 줄의 voxel 패턴을 만듭니다. 블록 설계나 느린 사건 관련 설계에서는 쉽습니다. 블록 평균, 블록 β, 시행마다 따로 추정한 β(D6의 beta-series)를 쓰거나, 자극 4–6초 뒤의 한 시점을 씁니다. 빠른 사건 관련 설계에서는 시행 반응이 겹쳐 추정이 흔들리므로, run별 요약 지도로 분류하는 대안이 있습니다(그 경우 "시행 하나를 맞힌다"가 아니라 "정보가 있다"는 결론이 됩니다). 패턴 분석에는 smoothing을 하지 않거나 약하게 합니다.
2. **feature 선택**: 뇌 전체, 미리 정한 ROI, 또는 결과와 무관한 기준(예: 분산)으로 voxel을 고릅니다. 결과(조건 이름표)를 쓰는 선택은 반드시 학습 fold 안에서만 합니다.
3. **학습과 시험**: 교차검증으로 일반화 정확도를 추정합니다.
4. **분류기 해석**: 어떤 voxel이 분류에 기여했는지 봅니다.

분류기는 선형(로지스틱 회귀, 선형 SVM, LDA)이 가장 흔합니다. 이해하기 쉽고, 해석하기 쉽고, 조정할 모수가 적기 때문입니다. 비선형 분류기는 조정 모수를 고르려면 교차검증 안에 또 한 겹의 교차검증(nested CV)이 필요합니다. 모든 자료에서 가장 좋은 분류기는 없으므로(no free lunch), 여러 분류기를 비교한다면 그 비교도 시험 자료와 분리된 자료로 합니다.

### 교차검증의 단위와 누수: Day 33을 fMRI로 옮기기

Day 33에서 같은 사람의 기록이 학습과 시험에 동시에 들어가면 정확도가 부풀려지는 것을 보았습니다. fMRI의 시행 패턴에서 그 "같은 사람"에 해당하는 것은 **run**입니다. 같은 run 안의 이웃 시행은 느린 BOLD와 drift를 공유하므로, 시행을 무작위로 섞어 나누면 시험 시행의 정보가 학습 쪽으로 샙니다. 그래서 within-subject decoding은 **run 단위로 나누는 교차검증**(leave-one-run-out, `GroupKFold`)이 기본이고, 사람들 사이 decoding(예: 환자 대 대조군)은 **사람 단위**로 나눕니다.

가장 흔하고 가장 은밀한 누수는 **feature 선택**입니다. 전체 자료로 "두 조건에서 가장 다른 voxel"을 먼저 고른 뒤 교차검증하면, 시험 자료의 잡음이 이미 voxel 선택에 반영되어 있습니다. 예시 1에서 신호가 전혀 없는 자료로 정확도 98%가 나옵니다. 표준화, PCA, voxel 선택 같은 모든 전처리를 `Pipeline` 안에 넣어 fold마다 학습 자료로만 맞추면 이 문제가 사라집니다. 책이 권하는 점검법은 두 가지입니다. 정확도가 너무 좋으면(예: 99%) 누수를 먼저 의심할 것, 그리고 **정답을 섞은 자료로 전체 파이프라인을 처음부터 다시 돌려** 우연 수준(두 조건이면 50%)이 나오는지 확인할 것.

정확도가 우연보다 높은지는 이항 분포로 판단하기보다 **순열 검정**으로 판단합니다. 이름표를 섞어 교차검증 전체를 반복한 정확도 분포가 귀무 분포입니다. 섞는 단위는 교환 가능해야 하므로, run 구조가 있으면 run 안에서 섞는 편이 안전합니다. 조건별 시행 수가 다르면 전체 정확도는 "많은 쪽으로 다 찍기"만 해도 높아지므로, 조건별 정확도의 평균인 **균형 정확도**(balanced accuracy, Day 34)와 층화 교차검증을 씁니다.

분류기를 해석할 때는 voxel 가중치로 만든 **민감도 지도**나, 작은 구(searchlight)를 voxel마다 옮겨 가며 그 안의 voxel만으로 분류해 정확도 지도를 만드는 **searchlight** 방법을 씁니다. 민감도 지도는 그 분류기의 성질을 반영할 뿐이며, 가중치가 크다고 그 voxel이 혼자 정보를 담는다는 뜻은 아닙니다. searchlight 반경에 따라 결과가 달라지고, 사람별 정확도 지도를 2수준 분석으로 넘길 수 있습니다.

> **책 이후의 변화:** fMRI decoding의 교차검증 함정과 권고는 Varoquaux 등(2017)에 정리되어 있습니다. 작은 표본의 교차검증 정확도는 오차 막대가 넓어, 표본이 100개 안팎이어도 정확도 추정이 ±10%p 정도 흔들릴 수 있다는 점이 강조됩니다. 파이썬 생태계에서는 scikit-learn 위에 영상 입출력을 얹은 nilearn(Abraham 등 2014)이 표준 도구가 되었습니다.

### ROI 분석과 circularity

**ROI 분석**은 영역 하나의 신호를 모아 한 숫자로 다룹니다. 쓰는 이유는 셋입니다. 검정 수를 줄여 다중비교 부담을 덜기(D5), 별도의 기능 국재 스캔(localizer)으로 정한 영역에서 다른 과제를 시험하기, 그리고 유의한 결과의 모양(조건별 막대, 시간 경과)을 보여 주기입니다. ROI는 개인의 해부학(자동 분할 후 눈으로 확인), 확률 아틀라스, 독립 localizer, 메타분석 결과로 정합니다. 한 사람의 뇌로 만든 아틀라스(예: AAL)를 그대로 쓰면 개인과 잘 겹치지 않으니 주의합니다.

여기서 가장 중요한 원칙이 **circularity**(순환 분석, double dipping)입니다. 문턱을 넘은 voxel은 진짜 신호 **또는** 우연히 큰 양의 잡음 때문에 뽑힙니다. 같은 자료로 그 voxel들의 효과 크기를 다시 재면, 큰 음의 잡음을 가진 voxel은 이미 탈락했으므로 평균이 반드시 부풀려집니다. 유전학의 "승자의 저주"와 같은 현상입니다. 2009년 사회신경과학의 뇌–행동 상관이 지나치게 높다는 비판(Vul 등)과 신경과학 전반의 순환 분석을 정리한 논문(Kriegeskorte 등)이 나온 뒤, 같은 자료로 고르고 재는 방식은 받아들여지지 않게 되었습니다. 해결책은 **선택과 측정에 독립된 자료**를 쓰는 것입니다. 별도 localizer run, 홀수/짝수 run 나누기, 선행 연구·메타분석이나 해부학으로 미리 정한 ROI가 그 방법입니다. 같은 맥락에서, 표준 HRF 모형으로 찾은 영역의 시간 경과를 그려 "HRF 모양이 잘 나왔다"고 말하는 것도 순환입니다. HRF와 닮은 곳을 골랐으니 닮을 수밖에 없습니다.

ROI 안 신호를 요약할 때는 문턱을 넘은 voxel 수 세기보다 신호 변화 크기를 씁니다. 평균과 첫 주성분은 대개 비슷하지만, 큰 해부학 ROI 안에 일부만 반응하면 평균이 묽어지므로 작고 기능적으로 일관된 ROI가 낫습니다.

### % 신호 변화를 계산하는 방법

β 값은 회귀변수의 높이에 따라 크기가 바뀌므로 그대로는 연구 간 비교가 어렵습니다. 그래서 **% 신호 변화**(percent signal change, PSC) = 100 × β × (기준 사건의 회귀변수 높이) / (시계열 평균)으로 바꿔 보고합니다. 핵심은 "기준 사건의 높이"를 고정된 **자**(ruler)로 쓰는 것입니다. 예를 들어 "1초 자극 하나를 표준 HRF와 convolution했을 때의 봉우리 높이"를 정해 두면, 설계가 달라도 같은 크기의 반응은 같은 PSC가 됩니다. 실제 설계의 회귀변수 최대 높이를 쓰면 사건이 몰린 설계일수록 값이 부풀려집니다. 높이는 고해상도 시간 격자에서 계산하고, 기준 선에서 봉우리까지(undershoot 제외)로 잽니다. contrast로 계산할 때는 [2, −2]처럼 가중치의 크기가 결과를 바꾸므로 양수 가중치 합이 1이 되도록 배율을 맞춥니다. 보고할 때는 어떤 기준 사건과 HRF를 썼는지 함께 적습니다. 길이 단위를 밝히지 않은 "10"이 무의미한 것과 같습니다.

### 자료 관리와 재현성

책의 부록이 강조하듯, 분석이 커질수록 폴더 규칙, 원자료 읽기 전용 보관, 분석마다 따로 둔 폴더, 그리고 **스크립트로만 하는 분석**이 결과를 지켜 줍니다. 손으로 한 클릭은 다시 재현할 수 없고, 같은 작업을 여러 번 손으로 하면 실수가 생깁니다. 파일 이름의 번호는 0을 채워(0001) 정렬이 꼬이지 않게 하고, 스크립트는 먼저 실행할 명령만 출력해 확인한 뒤 돌리며, 와일드카드 삭제는 피합니다. 오늘날에는 BIDS(D1), 컨테이너로 고정한 파이프라인(D2), 공유 저장소(OpenNeuro, 통계 지도를 공유하는 NeuroVault), 사전 등록이 이 원칙을 공동체 표준으로 만들었습니다(Day 38 재현성과 같은 이야기).

## 예시로 이해하기

> 모든 자료는 연습용 **가상 자료**입니다.

### 예시 1 — 신호 없는 자료로 98%가 나오는 누수, 그리고 올바른 파이프라인

```python
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupKFold, cross_val_score, permutation_test_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(0)
n_runs, per_run, n_vox = 6, 10, 3000
y = np.tile([0, 1], n_runs * per_run // 2)              # 두 조건이 번갈아 나오는 시행 60개
runs = np.repeat(np.arange(n_runs), per_run)             # 시행이 어느 run에서 나왔는지
X_null = rng.normal(size=(y.size, n_vox))                # 신호가 '전혀 없는' 시행별 voxel 패턴

clf = LogisticRegression(C=1.0, max_iter=2000)
cv = GroupKFold(n_splits=n_runs)                         # run 하나씩 통째로 빼서 시험

# 잘못된 방법: 전체 자료로 '좋은 voxel' 50개를 먼저 고른 뒤 교차검증
top = SelectKBest(f_classif, k=50).fit(X_null, y).get_support()
leaky = cross_val_score(make_pipeline(StandardScaler(), clf), X_null[:, top], y, cv=cv, groups=runs)

# 올바른 방법: voxel 고르기를 pipeline 안에 넣어 학습 fold에서만 하게 한다
pipe = make_pipeline(StandardScaler(), SelectKBest(f_classif, k=50), clf)
honest = cross_val_score(pipe, X_null, y, cv=cv, groups=runs)
print("신호 없음 | 고르고 나서 CV: %.2f | CV 안에서 고르기: %.2f" % (leaky.mean(), honest.mean()))

# 진짜 신호가 약하게 있는 경우 + 정답 섞기(permutation)로 우연 분포 만들기
X_sig = X_null.copy()
X_sig[:, :30] += 0.8 * (y[:, None] - 0.5)                 # 30개 voxel에만 작은 차이
score, perm, p = permutation_test_score(pipe, X_sig, y, cv=cv, groups=runs,
                                        n_permutations=200, random_state=0)
print("약한 신호 | 정확도 %.2f, 섞은 정답 정확도 평균 %.2f (95%%: %.2f), p = %.3f"
      % (score, perm.mean(), np.quantile(perm, 0.95), p))
```

출력:

```text
신호 없음 | 고르고 나서 CV: 0.98 | CV 안에서 고르기: 0.47
약한 신호 | 정확도 0.82, 섞은 정답 정확도 평균 0.49 (95%: 0.63), p = 0.010
```

첫 줄이 오늘의 가장 중요한 결과입니다. 조건과 무관한 순수 잡음 3,000 voxel에서, 전체 자료로 voxel 50개를 먼저 고르면 run 단위 교차검증을 했는데도 정확도가 0.98입니다. 같은 선택을 pipeline 안에 넣어 학습 fold에서만 하면 0.47, 즉 우연 수준으로 돌아옵니다. 교차검증 단위를 제대로 잡는 것만으로는 부족하고, **이름표를 쓰는 모든 단계**가 fold 안에 있어야 합니다. 둘째 줄은 30개 voxel에만 약한 차이를 넣은 자료입니다. 정확도 0.82는 이름표를 섞은 200번의 정확도(평균 0.49, 95번째 백분위수 0.63)보다 높아 p = 0.010입니다. 200번 섞으면 p의 가장 작은 값이 약 0.005이므로, 더 작은 p를 보고하려면 섞는 횟수를 늘려야 합니다.

### 예시 2 — 같은 자료로 고르고 재면 효과가 부풀려진다

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(12)
n_sub, n_vox = 20, 5000
true_effect = np.zeros(n_vox); true_effect[:100] = 0.3     # 100개 voxel에만 작은 진짜 효과(% 신호 변화)
behavior = rng.normal(size=n_sub)                            # 가상 행동 점수 (뇌와 무관)

def run_once():
    # 두 번의 독립 측정(예: 홀수 run / 짝수 run)
    half1 = true_effect + rng.normal(0, 1, (n_sub, n_vox))
    half2 = true_effect + rng.normal(0, 1, (n_sub, n_vox))
    t1 = stats.ttest_1samp(half1, 0).statistic
    roi = t1 > stats.t.isf(0.001, n_sub - 1)                # half1에서 '유의한' voxel을 고른다
    if roi.sum() == 0:
        return None
    circular = half1[:, roi].mean()                          # 고른 그 자료로 효과 크기 재기
    independent = half2[:, roi].mean()                       # 다른 자료로 재기
    # 행동 상관도 같은 함정: 고를 때 상관이 높은 voxel을 고르면 상관이 부풀려진다
    r_all = np.array([np.corrcoef(behavior, half1[:, v])[0, 1] for v in range(n_vox)])
    best = np.argsort(r_all)[-10:]                           # 상관이 가장 높은 voxel 10개
    r_circ = np.corrcoef(behavior, half1[:, best].mean(1))[0, 1]
    r_ind = np.corrcoef(behavior, half2[:, best].mean(1))[0, 1]
    return roi.sum(), circular, independent, r_circ, r_ind, true_effect[roi].mean()

out = np.array([o for o in (run_once() for _ in range(50)) if o is not None])
print("고른 voxel 수(평균): %.0f" % out[:, 0].mean())
print("고른 voxel들의 진짜 효과 평균: %.2f (가짜로 뽑힌 voxel이 섞여 0.30보다 작다)" % out[:, 5].mean())
print("효과 크기 추정 — 같은 자료: %.2f | 독립 자료: %.2f" % (out[:, 1].mean(), out[:, 2].mean()))
print("뇌–행동 상관 — 진짜 0 | 같은 자료: %.2f | 독립 자료: %.2f" % (out[:, 3].mean(), out[:, 4].mean()))
```

출력:

```text
고른 voxel 수(평균): 8
고른 voxel들의 진짜 효과 평균: 0.10 (가짜로 뽑힌 voxel이 섞여 0.30보다 작다)
효과 크기 추정 — 같은 자료: 0.69 | 독립 자료: 0.09
뇌–행동 상관 — 진짜 0 | 같은 자료: 0.94 | 독립 자료: -0.02
```

5,000 voxel 중 100개에만 0.30의 작은 효과가 있습니다. 첫 번째 절반 자료에서 p < 0.001로 고른 voxel은 평균 8개이고, 그 진짜 효과 평균은 0.10입니다(우연히 뽑힌 효과 없는 voxel이 섞였기 때문). 고른 자료로 다시 재면 0.69로 일곱 배 가까이 부풀려지고, 독립 절반으로 재면 0.09로 진짜 값에 가깝습니다. 뇌–행동 상관은 더 극적입니다. 진짜 상관이 0인데, 5,000 voxel 중 상관이 가장 높은 10개를 같은 자료로 평균하면 r = 0.94가 나옵니다. 독립 자료에서는 0 근처입니다. 피험자 20명, voxel 수천 개라는 흔한 조건에서 일어나는 일입니다.

### 예시 3 — % 신호 변화: 고정된 "자"와 contrast 배율

```python
import numpy as np
from scipy.stats import gamma

dt = 0.1
t = np.arange(0, 32, dt)
hrf = gamma.pdf(t, 6) - gamma.pdf(t, 16) / 6

def unit_regressor(dur, total=60):
    stim = np.zeros(int(total / dt)); stim[: int(dur / dt)] = 1
    return np.convolve(stim, hrf)[: stim.size] * dt     # 정규화하지 않은 '그대로의' 높이

ruler = unit_regressor(1.0).max()       # 기준 사건(1초 자극 하나)의 봉우리 높이 = '자'
print("1초 자극 회귀변수의 높이(자): %.4f" % ruler)

def percent_signal_change(beta, baseline_mean, scale=1.0):
    return 100 * scale * beta * ruler / baseline_mean

beta_face, beta_house, mean_bold = 9.5, 6.0, 820.0     # 가상 GLM 결과와 시계열 평균
print("얼굴 PSC: %.3f%%" % percent_signal_change(beta_face, mean_bold))
# contrast [1, -1]과 [2, -2]는 같은 가설이지만 값의 크기가 두 배 다르다 → 배율(scale)로 맞춘다
for c in ([1, -1], [2, -2]):
    con = c[0] * beta_face + c[1] * beta_house
    sf = 1 / sum(v for v in c if v > 0)                 # 양수 가중치 합이 1이 되도록
    print(f"contrast {c}: 그대로 {percent_signal_change(con, mean_bold):.3f}%"
          f" → 배율 보정 {percent_signal_change(con, mean_bold, sf):.3f}%")
```

출력:

```text
1초 자극 회귀변수의 높이(자): 0.1740
얼굴 PSC: 0.202%
contrast [1, -1]: 그대로 0.074% → 배율 보정 0.074%
contrast [2, -2]: 그대로 0.149% → 배율 보정 0.074%
```

1초 자극 하나의 회귀변수 봉우리 높이(0.1740)를 자로 정해 두면, β와 시계열 평균만으로 PSC를 계산할 수 있습니다. contrast [1, −1]과 [2, −2]는 같은 가설을 검정하지만(t 값도 같음) 값이 두 배 다릅니다. 양수 가중치 합이 1이 되도록 배율을 곱하면 둘 다 0.074%로 같아집니다. 보고서에는 "1초 사건 기준, 이중 감마 HRF로 계산한 PSC"처럼 자의 정의를 함께 적습니다.

### 참고 — nilearn으로 run 단위 decoding을 할 때의 형태 (nilearn 필요)

> 이 코드는 `pip install nibabel nilearn`으로 설치한 환경(nibabel 5.5, nilearn 0.14.1)에서, 같은 이름의 **가상 파일**을 만들어 그대로 실행해 오류 없이 도는 것을 확인했습니다. 출력은 여러분의 실제 파일에 따라 달라지므로 싣지 않았습니다.

```python
# nilearn이 필요하다: pip install nilearn
from nilearn.decoding import Decoder
from sklearn.model_selection import LeaveOneGroupOut
decoder = Decoder(estimator="svc", mask=roi_mask_img, standardize="zscore_sample",
                  screening_percentile=5, cv=LeaveOneGroupOut(), scoring="balanced_accuracy")
decoder.fit(trial_beta_imgs, conditions, groups=run_labels)   # voxel 선별은 fold 안에서 일어난다
print(decoder.cv_scores_)
```

## 직접 해보기

1. `D7_mvpa_roi.ipynb`에서 예시 1–3을 실행한다.
2. 예시 1에서 `GroupKFold` 대신 `KFold(n_splits=6, shuffle=True, random_state=0)`를 쓰고, 시행마다 같은 run 안에서 공유되는 느린 drift(예: `X_null += np.repeat(rng.normal(0, 1, (n_runs, n_vox)), per_run, axis=0)`, 그리고 run마다 조건 비율이 다르도록 `y`를 바꿈)를 넣어 run을 무시한 교차검증이 정확도를 얼마나 부풀리는지 실험한다. 결과를 Day 33의 참가자 단위 split과 비교해 적는다.
3. 예시 1의 약한 신호 자료에서 voxel 수 `k`를 10, 50, 500으로 바꿔 pipeline 정확도가 어떻게 달라지는지 본다. `k`를 고르는 일도 시험 자료와 분리해야 하는 이유를 한 문장으로 적는다.
4. 예시 2에서 선택 문턱을 p < 0.001에서 p < 0.05로 바꾸면 같은 자료 추정치의 부풀림이 커지는지 작아지는지 확인한다.
5. `reports/advanced/D7_fmri_analysis_checklist.md`를 만들고, 이 파트에서 배운 것을 바탕으로 "fMRI 논문 한 편을 읽을 때 확인할 질문" 10개를 적는다. 최소한 BIDS·공유 여부, 전처리 도구와 판, 움직임 기준과 집단별 움직임, 정규화 템플릿, 1수준 모형(HRF·필터·자기상관), 2수준 모형과 공변량, 다중비교 방법과 문턱, ROI의 독립성, decoding의 교차검증 단위, 효과 크기 보고 방식을 포함한다.

⚠️ **흔한 오류 1 — 전처리를 교차검증 밖에서 하기.** 전체 자료로 표준화하거나 PCA를 맞추거나 voxel을 고른 뒤 교차검증하면, 시험 자료의 정보가 학습에 섞입니다. 이름표를 쓰는 단계는 특히 치명적입니다. 모든 단계를 `Pipeline`에 넣어 fold 안에서 맞추세요.

⚠️ **흔한 오류 2 — "유의한 영역의 효과 크기"를 같은 자료로 보고하기.** 전뇌 분석으로 찾은 cluster의 평균 β나 뇌–행동 상관을 같은 자료로 계산해 막대그래프와 함께 보고하면 효과가 부풀려집니다. 그 그림은 "어디인지"를 보여 주는 용도로만 쓰고, 효과 크기는 독립 자료나 미리 정한 ROI로 보고합니다.

## 퀴즈

**1.** within-subject decoding에서 교차검증의 단위로 가장 알맞은 것은?

(a) 시행 무작위 (b) run (c) voxel (d) 시점

<details><summary>정답 보기</summary>

(b). 같은 run 안의 시행은 drift와 느린 BOLD를 공유해 서로 독립이 아닙니다. run을 통째로 빼서 시험해야 새 측정에 대한 일반화를 추정할 수 있습니다. 사람들 사이 분류라면 단위는 사람입니다.

</details>

**2.** 신호가 없는 자료인데 decoding 정확도가 95%로 나왔습니다. 가장 먼저 의심할 것과 확인 방법은? (단답)

<details><summary>정답 보기</summary>

누수입니다. 특히 이름표를 쓰는 feature 선택이나 조정이 교차검증 밖에서 일어났는지 봅니다. 확인 방법은 이름표를 섞은 자료로 전체 파이프라인을 처음부터 다시 돌려 우연 수준(두 조건이면 약 50%)이 나오는지 보는 것입니다.

</details>

**3.** 시행 수가 조건 A 80개, 조건 B 20개입니다. 전체 정확도 대신 쓰기 좋은 지표는?

(a) 학습 정확도 (b) 균형 정확도 (c) 가장 높은 fold의 정확도 (d) 이항 검정 p 값

<details><summary>정답 보기</summary>

(b). 모두 A로 찍으면 전체 정확도가 80%가 됩니다. 조건별 정확도의 평균(균형 정확도)은 이 경우 50%로 우연 수준을 정직하게 보여 줍니다. 층화 교차검증으로 fold마다 비율을 맞추는 것도 함께 씁니다.

</details>

**4.** circularity를 피하는 ROI 정의 방법이 아닌 것은?

(a) 별도의 localizer run으로 정의 (b) 해부학 아틀라스로 미리 정의 (c) 같은 자료의 같은 contrast로 문턱을 넘은 voxel (d) 홀수 run으로 정의하고 짝수 run으로 측정

<details><summary>정답 보기</summary>

(c). 같은 자료, 같은 contrast로 고르고 재면 선택 과정의 잡음이 측정에 그대로 들어가 효과가 부풀려집니다. 나머지는 선택과 측정이 독립입니다.

</details>

**5.** contrast [1, 1, 1]로 세 조건의 평균 반응을 % 신호 변화로 바꿀 때 곱해야 하는 배율은? (단답)

<details><summary>정답 보기</summary>

1/3입니다. [1, 1, 1]의 contrast 값은 세 조건의 합이므로, 평균으로 해석하려면 양수 가중치 합(3)으로 나눕니다. 이렇게 맞추지 않으면 같은 반응이 contrast를 어떻게 썼느냐에 따라 세 배 큰 값으로 보고됩니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] feature 선택 누수를 신호 없는 자료로 직접 재현하고, pipeline으로 고쳤다.
- [ ] 순열 검정으로 decoding 정확도의 우연 분포를 만들었다.
- [ ] circularity로 효과 크기와 상관이 부풀려지는 것을 확인했다.
- [ ] 고정된 자와 contrast 배율로 % 신호 변화를 계산했다.
- [ ] `reports/advanced/D7_fmri_analysis_checklist.md`에 논문 점검 질문 10개를 적었다.

## 더 읽을거리
- Poldrack RA, Mumford JA, Nichols TE. *Handbook of Functional MRI Data Analysis.* Cambridge University Press, 2011. <https://www.cambridge.org/core/books/handbook-of-functional-mri-data-analysis/8EDF966C65811FCCC306F7C916228529> — 9장(MVPA와 기계학습), 10장 뒷부분(ROI 분석, circularity, % 신호 변화), 부록 B(자료 관리와 스크립트).
- Kriegeskorte N, et al. Circular analysis in systems neuroscience: the dangers of double dipping. *Nat Neurosci.* 2009;12:535–540. doi:[10.1038/nn.2303](https://doi.org/10.1038/nn.2303)
- Vul E, et al. Puzzlingly high correlations in fMRI studies of emotion, personality, and social cognition. *Perspect Psychol Sci.* 2009;4:274–290. doi:[10.1111/j.1745-6924.2009.01125.x](https://doi.org/10.1111/j.1745-6924.2009.01125.x)
- Haxby JV, et al. Distributed and overlapping representations of faces and objects in ventral temporal cortex. *Science.* 2001;293:2425–2430. doi:[10.1126/science.1063736](https://doi.org/10.1126/science.1063736)
- Kriegeskorte N, Goebel R, Bandettini P. Information-based functional brain mapping. *PNAS.* 2006;103:3863–3868. doi:[10.1073/pnas.0600244103](https://doi.org/10.1073/pnas.0600244103)
- Varoquaux G, et al. Assessing and tuning brain decoders: cross-validation, caveats, and guidelines. *NeuroImage.* 2017;145:166–179. doi:[10.1016/j.neuroimage.2016.10.038](https://doi.org/10.1016/j.neuroimage.2016.10.038)
- Abraham A, et al. Machine learning for neuroimaging with scikit-learn. *Front Neuroinform.* 2014;8:14. doi:[10.3389/fninf.2014.00014](https://doi.org/10.3389/fninf.2014.00014)
- 공유 저장소: OpenNeuro <https://openneuro.org> (Markiewicz 등 2021, doi:[10.7554/eLife.71774](https://doi.org/10.7554/eLife.71774)) · NeuroVault <https://neurovault.org>

---
[← 이전](day-D6.md) · [코스 지도](../../../README.md) · [다음: 코스 지도 →](../../../README.md)
