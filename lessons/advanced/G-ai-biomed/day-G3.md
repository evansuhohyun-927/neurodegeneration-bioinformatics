# Day G3 — 영상·신호·EHR의 생성형 AI: 증강, 합성 데이터, 프라이버시

> **주차:** 심화 파트 G — AI·생성형 AI in 바이오메디컬 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/G/G3_synthetic_data.ipynb` + `reports/advanced/G3_synthetic_report.md` (합성 데이터 3축 점검표)
>
> **먼저 끝내 둘 레슨:** [Day G2](day-G2.md), [Day 33 — 참가자 단위 검증과 데이터 누수](../../week-5/day-33.md), [Day 34 — 평가 지표 해석](../../week-5/day-34.md).

## 오늘의 목표
- 데이터 증강과 합성 데이터의 용도(부족한 표본 보완, 공유, 불균형 보정)와 한계를 구분할 수 있다.
- 합성 표 데이터를 충실도·유용성·프라이버시 세 축으로 점검하는 코드를 돌리고 결과를 읽을 수 있다.
- 증강을 데이터 분할 **뒤에**, 학습 데이터 안에서만 해야 하는 이유와, 연합학습·차분 프라이버시가 무엇을 막는지 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [Generative Adversarial Networks (GANs) - Computerphile — Computerphile](https://www.youtube.com/watch?v=Sw9r8CL98N0) (21:21)
- **무엇에 주목할까:** 생성기와 판별기가 서로를 훈련시키는 고리, 그리고 생성기가 판별기의 약점만 파고들 때 생기는 문제를 보세요. 의료 영상 증강 논문의 대부분이 이 구조의 변형입니다.

- [What is Synthetic Data? No, It's Not "Fake" Data — IBM Technology](https://www.youtube.com/watch?v=HIusawrGBN4) (6:49)
- **무엇에 주목할까:** 합성 데이터를 쓰는 이유(공유, 부족한 사례, 테스트)를 짧게 정리합니다. 영상이 강조하는 장점과 함께, 오늘 레슨의 "그래도 새어 나갈 수 있다"를 나란히 놓고 보세요.

## 개념 설명

### 왜 만들어 쓰는가: 증강과 합성

의료 데이터의 고질적인 문제는 셋입니다. **적다**(희귀 질환, 비싼 라벨), **치우쳤다**(양성 사례가 드묾, 특정 인구집단 부족), **공유하기 어렵다**(개인정보). 생성 모델은 각각에 다른 방식으로 쓰입니다.

- **데이터 증강(augmentation):** 학습 데이터에 그럴듯한 변형을 더해 모델이 과적합을 덜 하게 합니다. 영상이면 회전·밝기 변화 같은 고전적 방법부터 GAN·diffusion으로 병변 영상을 새로 만드는 방법까지, 신호면 잡음·시간 늘이기부터 생성 모델까지 있습니다.
- **합성 데이터(synthetic data):** 실제 데이터의 통계적 성질을 흉내 낸 새 데이터셋을 만들어 실제 대신 공유하거나 소프트웨어 개발·교육에 씁니다.
- **기타 영상 생성 과제:** 저해상도 영상에서 고해상도를 추정하는 **초해상도(super-resolution)**, MRI를 CT처럼 바꾸는 **모달리티 변환**, 빠진 시점을 채우는 **보간**. 이때 품질 지표로 PSNR·SSIM(원 영상과 픽셀·구조가 얼마나 같은가)을 흔히 보고합니다. 정답 영상이 따로 없는 "새로 만든" 영상은 **FID**(Fréchet Inception Distance)로 많이 잽니다. 실제 영상 묶음과 생성 영상 묶음을 사전학습된 신경망에 통과시켜 얻은 특징 분포가 얼마나 떨어져 있는지를 재고, 낮을수록 닮았다고 봅니다. 다만 그 신경망은 일상 사진으로 학습된 것이라 의료 영상의 임상적으로 중요한 차이를 놓칠 수 있습니다. 또 PSNR·SSIM은 고해상도 원본을 일부러 줄여 만든 저해상도 입력으로 재는 경우가 많은데, 실제 장비의 저해상도 영상에서도 같은 점수가 나온다는 보장은 없습니다. FID·PSNR은 판독자 검토, 그리고 그 영상으로 학습한 모델이 실제 평가 데이터에서 나아지는지(아래 유용성 축)와 함께 봅니다.

주의할 점이 있습니다. 생성 모델은 학습 데이터에 있는 정보를 **재배열**할 뿐, 새로운 생물학적 정보를 만들지 못합니다. 원 데이터에 없는 희귀 병변 모양은 합성으로도 나오지 않고, 오히려 그럴듯한 가짜 구조를 지어낼 수 있습니다(영상에서의 "환각"). 초해상도 영상에 보이는 미세 구조가 진짜인지 모델이 그린 것인지는 영상만 봐서는 알 수 없습니다. 그래서 생성 영상은 진단 판독의 근거로 쓰지 않고, 연구에서는 합성이 들어간 부분을 명시합니다.

### 합성 데이터 점검의 세 축

합성 표 데이터는 세 방향으로 재야 합니다. 하나만 좋아서는 안 됩니다.

| 축 | 질문 | 대표 지표 |
|---|---|---|
| 충실도(fidelity) | 변수 하나하나와 변수 사이의 관계가 실제와 닮았나 | 열별 분포 비교(KS 통계량), 상관 행렬 차이, **탐지 검사**(실제와 합성을 구별하는 분류기의 AUC가 0.5에 가까운가) |
| 유용성(utility) | 합성으로 분석·학습해도 실제와 같은 결론이 나오나 | **TSTR**(Train on Synthetic, Test on Real): 합성으로 학습한 모델을 실제 holdout에서 평가해, 실제로 학습한 모델(TRTR)과 비교 |
| 프라이버시(privacy) | 합성 행에서 실제 개인을 알아내거나, 특정인이 학습에 있었는지 추론할 수 있나 | **DCR**(distance to closest record): 합성 행에서 가장 가까운 학습 행까지의 거리. 학습에 쓰지 않은 실제 holdout의 같은 거리와 비교한다 |

DCR 비교의 논리는 이렇습니다. 학습에 쓰지 않은 실제 사람(holdout)도 학습 데이터 속 누군가와 어느 정도는 닮았습니다. 합성 행이 그 정도보다 **훨씬 더** 학습 행에 붙어 있다면, 모델이 개인을 외웠다는 신호입니다. 더 공격적인 점검은 **멤버십 추론(membership inference)** 공격입니다. 어떤 사람의 기록이 학습에 들어갔는지를 모델 출력이나 합성 데이터만 보고 맞히는 시도이고, 맞힐 수 있으면 그 자체가 정보 유출입니다. "합성 데이터라서 개인정보가 아니다"는 자동으로 성립하지 않습니다.

### 증강은 분할 뒤에, 학습 데이터 안에서만

5주차에 데이터 누수를 배웠습니다. 증강에도 같은 규칙이 적용됩니다. 전체 데이터로 생성 모델을 학습시킨 뒤 합성 행을 섞고 나서 train/test를 나누면, 평가 데이터에 있는 환자의 "복제본"이 학습 데이터에 들어갑니다. 모델은 평가 환자를 미리 본 셈이 되어 성능이 부풀려집니다. 올바른 순서는 (1) 참가자 단위로 분할 → (2) **학습 데이터만으로** 생성 모델 학습·증강 → (3) 손대지 않은 실제 평가 데이터로 평가입니다. 교차검증이면 fold마다 이 과정을 반복합니다. 평가 데이터에 합성 행을 넣는 것도 피합니다. 실제 환자에서의 성능을 알고 싶은 것이기 때문입니다.

표 데이터의 클래스 불균형을 맞출 때 흔히 쓰는 **SMOTE**도 합성 데이터입니다. 소수 클래스의 한 점과 그 가까운 이웃 사이 선분 위에 새 점을 찍어 표본을 늘리는 방법입니다(Chawla 2002). 따라서 규칙도 같습니다. 분할 전에 전체 데이터로 SMOTE를 돌리면, 평가셋 환자의 바로 옆에 찍힌 점이 학습셋에 들어갑니다. 결측값 채우기(평균·KNN 대체), 표준화, "결과와 상관이 큰 변수 고르기"도 데이터를 보고 값을 정하는 단계라서 같은 함정이 있습니다. 이런 단계는 `imblearn`·`sklearn`의 Pipeline에 넣어 fold마다 학습 데이터로만 맞추고, 평가셋은 원래 비율 그대로 둡니다. 학습 정확도가 1.0에 가깝고 평가 정확도와 차이가 크게 난다면 이 순서부터 의심합니다.

### 데이터를 옮기지 않는 방법: 연합학습과 차분 프라이버시

합성 데이터 말고도 개인정보를 지키며 학습하는 길이 있습니다.

**연합학습(federated learning)** 은 데이터를 한곳에 모으지 않습니다. 병원마다 자기 데이터로 모델을 조금 학습시키고, **모델의 가중치 변화만** 중앙 서버로 보냅니다. 서버는 이를 평균 내 공통 모델을 갱신해 다시 돌려줍니다. 교과서를 돌려 읽는 대신 각자 공부한 요점 노트만 모아 합치는 방식입니다. 어려운 점은 병원마다 환자 구성·기기·라벨 기준이 달라(비IID, non-IID) 단순 평균이 한쪽에 불리할 수 있다는 것, 그리고 가중치 변화에서도 정보가 일부 새어 나갈 수 있다는 것입니다.

연합학습은 데이터가 나뉜 모양에 따라 둘로 나눕니다. **수평(horizontal) 연합학습**은 병원마다 같은 변수를 가진 서로 다른 환자를 갖고 있는 경우로, 위에서 말한 "가중치 평균"(대표적으로 FedAvg, McMahan 2017)이 이 경우입니다. **수직(vertical) 연합학습**은 같은 환자에 대해 기관마다 다른 변수를 갖고 있는 경우입니다. 예를 들어 병원에는 진료 기록, 검사 기관에는 유전체가 있는 식이고, 먼저 공통 환자를 서로 명단을 드러내지 않고 맞추는 단계가 필요합니다(Yang 2019).

"데이터를 안 보냈으니 안전하다"는 결론도 자동으로 나오지 않습니다. 보호 장치는 막는 대상이 서로 다릅니다.
- **보안 집계(secure aggregation):** 암호 기법으로 서버가 병원별 갱신값은 못 보고 합계만 보게 합니다(Bonawitz 2017). 다만 합계 자체에서 새는 정보까지 막지는 못합니다.
- **차분 프라이버시:** 갱신값에 잡음을 섞어 개인 한 명의 기여를 가립니다(아래 문단).
- **동형암호(homomorphic encryption):** 암호화된 상태 그대로 계산합니다. 계산 비용이 크고, 이것만으로는 DP 같은 보장이 생기지 않습니다.

기관이 악의적인 갱신값을 보내 모델을 망가뜨리는 **오염(poisoning)** 공격도 따로 대비해야 합니다. 연합학습을 썼다는 사실만으로 개인정보 법규를 지켰다고 말할 수는 없습니다. 또 기관마다 단위·코드 체계(진단 코드, 검사 단위)를 먼저 맞추지 않으면, 평균 낸 모델이 서로 다른 것을 섞어 배우게 됩니다.

**차분 프라이버시(differential privacy, DP)** 는 "어떤 한 사람의 데이터가 들어가든 빠지든 공개되는 결과가 거의 같도록" 계산에 잡음을 섞는 수학적 보장입니다. 보호 강도는 ε(엡실론)으로 정하고, ε가 작을수록 보호가 강하고 잡음이 커서 정확도가 떨어집니다. 예시 3에서 평균 하나에 적용해 봅니다. DP를 생성 모델 학습에 적용한 합성기도 있지만, 그만큼 충실도와 유용성이 줄어드는 맞바꿈은 피할 수 없습니다. 흔히 오해하는 것과 달리 DP가 합성 데이터를 "실제와 구별할 수 없게" 만드는 것은 아닙니다. DP가 보장하는 것은 한 사람의 데이터가 결과를 얼마나 바꿀 수 있는가의 상한입니다.

오래된 비식별 기준인 **k-익명성(k-anonymity)** 도 알아 두면 좋습니다(Sweeney 2002). 나이·성별·우편번호처럼 조합하면 사람을 특정할 수 있는 변수(준식별자)가 같은 사람이 표 안에 적어도 k명 있도록 값을 뭉뚱그리는 기준입니다. 이해하기 쉽지만 한계가 큽니다. 변수가 많을수록 k명씩 묶기가 어려워지고, 다른 공개 자료와 이어 붙이는 **연결 공격**에는 약합니다. 유전체는 특히 그렇습니다. 공개 계보 데이터베이스의 Y 염색체 정보만으로 익명 유전체 기증자의 성을 추정한 연구가 있습니다(Gymrek 2013). 유전 데이터는 이름을 지워도 그 자체가 식별자이고 가족에게까지 이어진다는 점을 전제로 다룹니다.

## 예시로 이해하기

> 모든 데이터는 코드 안에서 만드는 **가상 데이터**입니다. 합성기는 GAN 대신 scikit-learn의 `GaussianMixture`(정규분포 여러 개를 섞은 생성 모델)를 씁니다. 원리와 점검 방법은 GAN·VAE 합성기에도 그대로 적용됩니다.

### 예시 1 — 합성 EHR 표를 세 축으로 점검하기

```python
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.mixture import GaussianMixture
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_predict, StratifiedKFold
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(0)
COLS = ["age", "bmi", "sbp", "hba1c"]

def make_cohort(n):
    """가상 EHR 표: 나이, BMI, 수축기 혈압, HbA1c와 가상 결과(outcome)."""
    age = rng.normal(62, 10, n)
    bmi = rng.normal(26, 4, n)
    sbp = 90 + 0.6 * age + 0.8 * bmi + rng.normal(0, 10, n)
    hba1c = 4.5 + 0.02 * age + 0.06 * bmi + rng.normal(0, 0.6, n)
    logit = -14 + 0.08 * age + 0.05 * sbp + 0.6 * hba1c
    outcome = rng.random(n) < 1 / (1 + np.exp(-logit))
    return pd.DataFrame({"age": age, "bmi": bmi, "sbp": sbp, "hba1c": hba1c, "outcome": outcome.astype(int)})

real = make_cohort(1200)
train, holdout = train_test_split(real, test_size=0.5, random_state=0, stratify=real["outcome"])

def synthesize(df, n_components, n_out):
    """결과 군마다 GaussianMixture를 따로 맞추고, 원래 비율대로 새 행을 뽑는다."""
    parts = []
    for y, g in df.groupby("outcome"):
        gm = GaussianMixture(n_components=min(n_components, len(g)), covariance_type="full",
                             reg_covar=1e-6, random_state=0).fit(g[COLS])
        k = int(round(n_out * len(g) / len(df)))
        s, _ = gm.sample(k)
        parts.append(pd.DataFrame(s, columns=COLS).assign(outcome=y))
    return pd.concat(parts, ignore_index=True)

def report(name, synth):
    # 1) 충실도: 열마다 분포 비교(KS 통계량, 작을수록 비슷), 상관 행렬 차이
    ks = [stats.ks_2samp(train[c], synth[c]).statistic for c in COLS]
    corr_gap = np.abs(train[COLS].corr().values - synth[COLS].corr().values).max()
    # 2) 유용성: 합성으로 학습 → 실제 holdout으로 평가(TSTR)
    m = LogisticRegression(max_iter=1000).fit(synth[COLS], synth["outcome"])
    tstr = roc_auc_score(holdout["outcome"], m.predict_proba(holdout[COLS])[:, 1])
    # 3) 탐지 검사: 학습에 안 쓴 실제(holdout)와 합성을 구별하는 분류기의 AUC
    #    0.5에 가까울수록 구별이 어렵다. (학습 행과 비교하면 '복사본' 때문에 값이 왜곡된다)
    both = pd.concat([holdout[COLS].assign(is_syn=0), synth[COLS].assign(is_syn=1)])
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
    p = cross_val_predict(RandomForestClassifier(n_estimators=200, random_state=0),
                          both[COLS], both["is_syn"], cv=cv, method="predict_proba")[:, 1]
    det = roc_auc_score(both["is_syn"], p)
    # 4) 프라이버시: 합성 행에서 가장 가까운 학습 행까지의 거리(DCR)
    sc = StandardScaler().fit(train[COLS])
    A, H, S = (sc.transform(d[COLS]) for d in (train, holdout, synth))
    dcr_syn = np.median(np.sqrt(((S[:, None] - A[None]) ** 2).sum(-1)).min(1))
    dcr_hold = np.median(np.sqrt(((H[:, None] - A[None]) ** 2).sum(-1)).min(1))
    print(f"{name:<22} KS최대 {max(ks):.3f} | 상관차 {corr_gap:.3f} | TSTR AUC {tstr:.3f} | "
          f"탐지 AUC {det:.3f} | DCR 합성 {dcr_syn:.3f} vs holdout {dcr_hold:.3f}")

m = LogisticRegression(max_iter=1000).fit(train[COLS], train["outcome"])
print("기준: 실제로 학습 → 실제 평가(TRTR) AUC",
      round(roc_auc_score(holdout["outcome"], m.predict_proba(holdout[COLS])[:, 1]), 3))
report("GMM 성분 3개", synthesize(train, 3, len(train)))
report("GMM 성분 300개(과적합)", synthesize(train, 300, len(train)))
```

출력:

```text
기준: 실제로 학습 → 실제 평가(TRTR) AUC 0.815
GMM 성분 3개              KS최대 0.052 | 상관차 0.046 | TSTR AUC 0.812 | 탐지 AUC 0.564 | DCR 합성 0.439 vs holdout 0.477
GMM 성분 300개(과적합)       KS최대 0.045 | 상관차 0.040 | TSTR AUC 0.819 | 탐지 AUC 0.723 | DCR 합성 0.106 vs holdout 0.477
```

성분 3개짜리 합성기는 세 축이 모두 무난합니다. 열 분포와 상관이 실제와 비슷하고, 합성으로 학습한 모델이 실제로 학습한 모델(0.815)과 거의 같은 AUC(0.812)를 내고, 탐지 분류기도 구별을 잘 못 하며(0.56), 합성 행이 학습 행에 붙어 있는 정도(0.439)가 학습에 안 쓴 실제 사람(0.477)과 비슷합니다.

성분 300개짜리는 과적합 합성기입니다. 학습 데이터 300여 명 하나하나 주위에 작은 정규분포를 하나씩 둔 셈이라, 사실상 **실제 환자를 살짝 흔들어 복사**합니다. 놀랍게도 KS·상관·TSTR은 오히려 조금 더 좋아 보입니다. 이 숫자들만 보고하면 "더 좋은 합성기"로 보입니다. 하지만 DCR이 0.106으로 holdout(0.477)보다 훨씬 작습니다. 합성 행 대부분이 특정 실제 환자의 바로 옆에 있다는 뜻이고, 그것이 개인정보 유출 위험입니다. 탐지 AUC도 0.72로 올라갔습니다. 학습 환자 주변에만 몰린 데이터는 처음 보는 실제 사람(holdout)과 분포가 달라지기 때문입니다. **충실도 지표만으로는 복사를 잡아내지 못합니다.**

### 예시 2 — 분할 전 증강의 누수 (생각 실험)

환자 100명 중 양성이 10명인 데이터를 생각해 봅시다. 양성을 늘리려고 전체 100명으로 생성 모델을 학습해 양성 합성 행 90개를 만든 뒤, 190행을 무작위로 train/test로 나눕니다. 그러면 평가 데이터에 들어간 실제 양성 환자 A의 "흔들린 복사본"들이 학습 데이터에도 들어갑니다. 모델은 A를 미리 본 셈이니 A를 쉽게 맞히고, 양성 민감도가 부풀려집니다. 게다가 평가 데이터에는 합성 행도 섞여 있어, 성능의 상당 부분이 "모델이 합성기의 특징을 맞힌 것"일 수 있습니다. 올바른 설계: 실제 100명을 먼저 참가자 단위로 나누고, 학습 쪽 양성만으로 생성 모델을 학습해 증강하고, 평가는 손대지 않은 실제 평가 데이터로 합니다. G7 프로젝트 코드가 이 순서를 따릅니다.

### 예시 3 — 차분 프라이버시: 평균 하나를 공개할 때

```python
import numpy as np

rng = np.random.default_rng(0)
# 차분 프라이버시(differential privacy)의 가장 단순한 예: 평균에 라플라스 잡음 더하기
age = rng.normal(62, 10, 200).clip(18, 90)          # 가상 나이 200명, 18–90세로 자름
sens = (90 - 18) / len(age)                         # 한 사람이 바뀔 때 평균이 최대로 움직이는 폭
print(f"실제 평균 나이 {age.mean():.2f}")
for eps in [0.1, 1.0, 10.0]:                        # ε가 작을수록 강한 보호, 큰 잡음
    noisy = [age.mean() + rng.laplace(0, sens / eps) for _ in range(1000)]
    print(f"ε = {eps:>4}: 공개되는 평균의 표준편차 {np.std(noisy):.2f}세")
```

출력:

```text
실제 평균 나이 62.15
ε =  0.1: 공개되는 평균의 표준편차 4.96세
ε =  1.0: 공개되는 평균의 표준편차 0.53세
ε = 10.0: 공개되는 평균의 표준편차 0.05세
```

한 사람의 나이가 바뀌어도 평균은 최대 (90 − 18)/200 = 0.36세밖에 움직이지 않습니다(민감도, sensitivity). 이 폭을 ε로 나눈 크기의 잡음을 섞으면, 공개된 평균만 보고는 특정인이 들어 있었는지 알기 어려워집니다. ε = 0.1이면 평균이 ±5세 가까이 흔들려 보호는 강하지만 쓸모가 줄고, ε = 10이면 거의 정확하지만 보호가 약합니다. 같은 데이터로 질문을 여러 번 하면 ε가 쌓여 보호가 약해진다는 점도 알아 두세요.

## 직접 해보기

1. `notebooks/advanced/G/G3_synthetic_data.ipynb`를 만들고 예시 1과 3을 실행합니다.
2. **성분 수 훑기.** `synthesize(train, k, len(train))`의 `k`를 1, 3, 10, 30, 100, 300으로 바꿔 다섯 지표를 표로 모읍니다. DCR이 holdout 값 아래로 뚜렷이 떨어지기 시작하는 `k`를 찾습니다.
3. **관계를 잃는 합성기.** 변수마다 따로 섞어(`synth[c] = rng.permutation(train[c].values)`) 만든 "열 독립" 합성 데이터를 `report`에 넣어 봅니다. KS는 완벽하지만(열 분포는 그대로이므로) 상관차와 TSTR이 어떻게 변하는지 적습니다.
4. **점검표 쓰기.** `reports/advanced/G3_synthetic_report.md`에 2–3번 결과로 표를 만들고, "충실도·유용성·프라이버시를 모두 만족한 설정"과 "그 판단의 한계(가상 데이터, 하나의 seed, 공격 시나리오는 DCR 하나뿐)"를 씁니다.
5. **내 데이터에 적용한다면(글로).** 본 과정 PhysioNet 보행 feature 표를 합성해 공유한다고 할 때, 1명이 여러 기록을 가진 구조를 어떻게 다룰지(참가자 단위로 합성해야 하는 이유) 세 문장으로 적습니다.

⚠️ **흔한 오류 1 — 충실도만 보고 "좋은 합성 데이터"라고 결론.** 예시 1의 성분 300개처럼 복사에 가까운 합성기가 충실도·유용성 점수를 가장 잘 받을 수 있습니다. 프라이버시 지표(DCR, 가능하면 멤버십 추론 검사)를 반드시 같이 보고합니다.

⚠️ **흔한 오류 2 — 탐지 검사를 학습 데이터와 비교.** 합성 행과 **학습에 쓴** 실제 행으로 탐지 분류기를 교차검증하면, 복사본과 원본이 서로 다른 fold에 나뉘어 이상한 값(0.5보다 훨씬 낮은 AUC 등)이 나올 수 있습니다. 비교 대상은 학습에 쓰지 않은 실제 데이터(holdout)로 합니다.

## 퀴즈

**1.** 합성 데이터 점검 세 축과, 각 축의 대표 지표를 하나씩 쓰세요. (단답)

<details><summary>정답 보기</summary>

충실도(열별 KS 통계량·상관 차이·탐지 AUC), 유용성(TSTR: 합성으로 학습해 실제로 평가한 성능을 TRTR과 비교), 프라이버시(DCR: 합성 행에서 가장 가까운 학습 행까지의 거리를 holdout의 같은 값과 비교, 또는 멤버십 추론 검사).

</details>

**2.** 합성 행의 DCR 중앙값이 0.05, 학습에 쓰지 않은 실제 holdout의 DCR 중앙값이 0.48이었습니다. 해석은?

(a) 합성 데이터가 다양하다 (b) 합성 행이 학습 환자에 비정상적으로 가까워 복사·유출 위험이 있다 (c) 합성 데이터의 유용성이 낮다 (d) 아무 의미 없다

<details><summary>정답 보기</summary>

(b). 처음 보는 실제 사람도 학습 데이터와 0.48 정도는 떨어져 있는데, 합성 행은 그보다 훨씬 가깝습니다. 모델이 개별 환자를 외워 거의 그대로 내놓았다는 신호입니다.

</details>

**3.** 양성 사례를 GAN으로 증강하는 올바른 순서를 고르세요.

(a) 전체 데이터로 GAN 학습 → 증강 → train/test 분할 → 평가 (b) train/test 분할 → 학습 데이터로만 GAN 학습·증강 → 실제 test로 평가 (c) 증강 → 평가 → 분할 (d) test에도 합성 행을 넣어 균형을 맞춘 뒤 평가

<details><summary>정답 보기</summary>

(b). 생성 모델이 평가 환자를 보면 그 복사본이 학습 데이터로 새어 들어가 성능이 부풀려집니다. 평가는 실제 환자에서의 성능을 알기 위한 것이므로 합성 행을 넣지 않습니다.

</details>

**4.** 연합학습에서 병원 사이에 오가는 것은 무엇이고, 그래도 남는 위험 하나는? (단답)

<details><summary>정답 보기</summary>

환자 데이터가 아니라 모델 가중치(또는 그 변화량)가 오갑니다. 그래도 가중치 변화에서 학습 데이터 정보가 일부 추론될 수 있고, 병원마다 데이터 분포가 달라(non-IID) 공통 모델이 일부 병원에 맞지 않을 수 있습니다.

</details>

**5.** 차분 프라이버시에서 ε를 0.1에서 10으로 키우면?

(a) 보호가 강해지고 잡음이 커진다 (b) 보호가 약해지고 결과가 정확해진다 (c) 아무 변화 없다 (d) 표본 수가 늘어난다

<details><summary>정답 보기</summary>

(b). ε는 "한 사람이 결과를 얼마나 바꿀 수 있는지"의 허용 폭입니다. 크게 잡을수록 잡음이 작아 정확하지만 개인 보호는 약해집니다. 예시 3에서 표준편차가 약 5세에서 0.05세로 줄었습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1을 실행해 정상 합성기와 과적합 합성기의 다섯 지표를 비교했다.
- [ ] 성분 수를 훑어 DCR이 무너지는 지점을 찾았다.
- [ ] 열 독립 합성 데이터에서 KS는 좋지만 관계가 사라지는 것을 확인했다.
- [ ] `reports/advanced/G3_synthetic_report.md`에 세 축 점검표와 한계를 적었다.

## 더 읽을거리
- Chen RJ, et al. Synthetic data in machine learning for medicine and healthcare. *Nat Biomed Eng.* 2021;5:493–497. doi:[10.1038/s41551-021-00751-8](https://doi.org/10.1038/s41551-021-00751-8)
- Yoon J, Drumright LN, van der Schaar M. Anonymization through data synthesis using generative adversarial networks (ADS-GAN). *IEEE J Biomed Health Inform.* 2020;24:2378–2388. doi:[10.1109/JBHI.2020.2980262](https://doi.org/10.1109/JBHI.2020.2980262)
- Frid-Adar M, et al. GAN-based synthetic medical image augmentation for increased CNN performance in liver lesion classification. *Neurocomputing.* 2018;321:321–331. doi:[10.1016/j.neucom.2018.09.013](https://doi.org/10.1016/j.neucom.2018.09.013)
- Yi X, Walia E, Babyn P. Generative adversarial network in medical imaging: a review. *Med Image Anal.* 2019;58:101552. doi:[10.1016/j.media.2019.101552](https://doi.org/10.1016/j.media.2019.101552)
- Shokri R, et al. Membership inference attacks against machine learning models. *IEEE S&P.* 2017:3–18. doi:[10.1109/SP.2017.41](https://doi.org/10.1109/SP.2017.41)
- Dwork C, Roth A. The algorithmic foundations of differential privacy. *Found Trends Theor Comput Sci.* 2014;9:211–487. doi:[10.1561/0400000042](https://doi.org/10.1561/0400000042)
- McMahan HB, et al. Communication-efficient learning of deep networks from decentralized data (2017), [arXiv:1602.05629](https://arxiv.org/abs/1602.05629) · Rieke N, et al. The future of digital health with federated learning. *npj Digit Med.* 2020;3:119. doi:[10.1038/s41746-020-00323-1](https://doi.org/10.1038/s41746-020-00323-1) · Kaissis GA, et al. Secure, privacy-preserving and federated machine learning in medical imaging. *Nat Mach Intell.* 2020;2:305–311. doi:[10.1038/s42256-020-0186-1](https://doi.org/10.1038/s42256-020-0186-1)
- Heusel M, et al. GANs trained by a two time-scale update rule converge to a local Nash equilibrium (FID를 제안한 논문). 2017. [arXiv:1706.08500](https://arxiv.org/abs/1706.08500)
- Chawla NV, et al. SMOTE: synthetic minority over-sampling technique. *J Artif Intell Res.* 2002;16:321–357. doi:[10.1613/jair.953](https://doi.org/10.1613/jair.953)
- Yang Q, et al. Federated machine learning: concept and applications. *ACM Trans Intell Syst Technol.* 2019;10:1–19. doi:[10.1145/3298981](https://doi.org/10.1145/3298981) · Bonawitz K, et al. Practical secure aggregation for privacy-preserving machine learning. *ACM CCS.* 2017:1175–1191. doi:[10.1145/3133956.3133982](https://doi.org/10.1145/3133956.3133982)
- Sweeney L. k-anonymity: a model for protecting privacy. *Int J Uncertain Fuzziness Knowl-Based Syst.* 2002;10:557–570. doi:[10.1142/S0218488502001648](https://doi.org/10.1142/S0218488502001648) · Gymrek M, et al. Identifying personal genomes by surname inference. *Science.* 2013;339:321–324. doi:[10.1126/science.1229566](https://doi.org/10.1126/science.1229566)
- 표 데이터 합성 오픈소스 도구 예: Synthetic Data Vault(SDV) 문서 <https://docs.sdv.dev/sdv> (이 환경에는 미설치)

---
[← 이전](day-G2.md) · [코스 지도](../../../README.md) · [다음 →](day-G4.md)
