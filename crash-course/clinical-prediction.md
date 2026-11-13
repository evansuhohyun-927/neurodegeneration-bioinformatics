# Crash Course — 임상 예측·조기진단 모델

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** 진단·예후·조기진단 예측 모델 논문을 읽고 대상 집단·표본 수·검증·보정·임상적 유용성·보고 중 어디가 약한지 짚을 수 있고, 내 모델을 만들기 전에 평가 계획을 세울 수 있다.

## 한눈에 보기

| | 내용 |
|---|---|
| 무엇을 재는가 | 예측 모델의 성능: 판별(순서를 맞히는가), 보정(확률 숫자가 맞는가), 임상적 유용성(쓰면 결정이 나아지는가), 그리고 다른 기관·시기로의 이전 가능성 |
| 답할 수 있는 질문 | 정해진 시점의 정보로 지금의 상태(진단) 또는 앞으로의 사건(예후, 발병)을 얼마나 잘 예측하는가 / 어떤 임계값에서 어떤 손익이 생기는가 / 다른 기관에서도 통하는가 |
| 답하지 못하는 것 | 모델을 진료에 썼을 때 환자 결과가 실제로 나아지는지(전향적 연구가 필요), 변수의 인과 효과, 연구 표본과 다른 유병률·스펙트럼의 집단에서의 PPV |
| 가장 먼저 정할 것 | 대상 집단, 예측 시점, 결과와 기준 검사, 결과로 할 행동(쓰임새) |
| 이 가이드의 원칙 | 진단·치료 권고를 하지 않는다. 만든 모델은 "이 데이터에서의 baseline"으로만 표현한다 |

## 🎬 급할 때 볼 영상

- [Key Steps and Common Pitfalls in Clinical Prediction Model Research — Richard_D_Riley](https://www.youtube.com/watch?v=eM7K8NKATB0) (56:37) — 표본 수 기준을 만든 연구자가 예측 모델 연구의 단계와 함정을 정리한다. 하나만 본다면 이것.
- [ROC and AUC, Clearly Explained! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=4jRBRDbJemM) (16:17) — 판별력의 기본. AUC가 임계값을 고르지 않는다는 점을 확인한다.
- [Model Calibration - Brier Score Explained — DataMListic](https://www.youtube.com/watch?v=BiaebXlgfNQ) (9:47) — 보정과 Brier 점수. 판별과 다른 질문이라는 것을 잡는다.

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| 진단 / 예후 / 조기진단 모델 | 지금의 상태 / 미래의 사건 / 아직 진단 전인 사람의 발병을 예측 | 필요한 자료 설계(횡단면 vs 추적)와 결과 정의가 다르다 |
| 예측 시점 (prediction time) | 모델이 쓸 수 있는 정보의 마지막 시점 | 그 이후 정보가 특징에 섞이면 누수로 성능이 부풀려진다 |
| 스펙트럼 편향 (spectrum bias) | 연구 대상이 실제 사용 집단보다 구분하기 쉬워 성능이 부풀려지는 것 | 환자-대조군 연구의 AUC는 진료실에서 재현되지 않기 쉽다 |
| PPV와 유병률 | 양성 예측도는 유병률에 따라 크게 바뀐다 | 연구 표본의 PPV를 선별 집단에 옮기면 크게 과장된다 |
| 최소 표본 수 (Riley 기준) | 과적합·정밀도 기준으로 계산한 개발 표본 수의 하한 | "EPV 10"보다 상황에 맞는 기준. 부족하면 어떤 검증도 메우지 못한다 |
| 내부 / 외부 검증 | 같은 자료원에서 과적합 추정 / 다른 기관·시기에서 이전 가능성 확인 | 서로 다른 질문이라 하나가 다른 하나를 대신하지 못한다 |
| 보정 절편·기울기 | 평균 수준 과대·과소 예측 / 예측 폭이 너무 극단적인가 | AUC가 같아도 보정이 틀리면 확률을 그대로 쓸 수 없다 |
| 순 이득 (net benefit) | 진양성 − 위양성 × p_t/(1−p_t), 결정 곡선의 세로축 | 모델이 "모두 검사"·"아무도 안 함"보다 나은지 보여 준다 |
| C-index와 중도절단 | 생존 모델의 판별력 / 추적이 끊겨 사건 여부를 모르는 사람 | 중도절단을 무시하면 위험을 과소 추정한다 |
| 데이터셋 이동 (dataset shift) | 집단 구성·기저 위험·측정이 개발 때와 달라지는 것 | 외부 기관에서 보정이 먼저 무너진다. 재보정과 감시가 필요하다 |

## 모델·평가 방법 고르기

| 방법 | 무엇을 얻나 | 장점 | 한계 | 이런 질문에 쓴다 |
|---|---|---|---|---|
| (벌점) 로지스틱 회귀 | 이진 결과의 확률 | 해석 쉬움, 보정이 대체로 좋음, 작은 표본에 강함 | 비선형·상호작용은 직접 넣어야 함 | 대부분의 진단·조기 선별 baseline. 임상 예측에서 기계학습이 평균적으로 더 낫지 않았다는 체계적 문헌고찰도 있다(Christodoulou 등 2019) |
| 트리 앙상블(랜덤 포레스트, 부스팅) | 이진·연속 결과 예측 | 비선형 자동 포착 | 표본이 더 많이 필요, 확률 보정이 틀어지기 쉬움, 기록 단위 분할에서 누수가 크게 드러남 | 표본이 크고 복잡한 관계가 예상될 때. 반드시 보정 확인 |
| Kaplan–Meier | 시간에 따른 누적 발병(생존) 곡선 | 중도절단 처리, 가정이 적음 | 공변량을 많이 다루지 못함 | 집단별 발병 시간 기술 |
| Cox 비례위험 모델 | 위험비, 시점별 위험 예측(기저 위험과 결합) | 표준적, 중도절단 처리 | 비례위험 가정, 특정 시점 보정은 따로 확인 | 전구기 코호트의 발병 예측 |
| 부트스트랩 신뢰구간 | AUC·보정 지표의 불확실성 | 분포 가정 없음 | 참가자 단위로 뽑아야 함 | 모든 성능 숫자에 구간 붙이기 |
| 보정 곡선(lowess)·절편·기울기 | 확률의 정확도 | 판별과 독립적인 정보 | 작은 표본에서 곡선이 흔들림 | 외부 검증, 재보정 전후 비교 |
| 결정 곡선 분석 | 임계 확률별 순 이득 | 임상 손익을 직접 반영 | 실제 결과 개선의 증거는 아님 | 모델이 쓸 가치가 있는지 1차 판단 |
| 기관 하나씩 빼기 / 시간 분할 | 이전 가능성의 추정 | 외부 자료 없이도 이질성을 봄 | 기관 수가 적으면 거침 | 다기관·장기 자료 |

## 표준 분석 흐름

1. **문제 정의 카드** — 대상 집단, 예측 시점, 결과와 기준 검사, 쓰임새, 합리적 임계 확률 범위. 입력: 연구 질문 → 출력: `problem_card.md`. QC: 네 칸이 모두 구체적인 문장인가.
2. **표본 수 점검** — Riley 기준(공개 R·Stata 패키지 `pmsampsize`). 입력: 후보 변수 수, 기대 유병률, 기대 성능 → 출력: 최소 n·사건 수. QC: 후보 변수는 "검토한 전체"로 셌는가.
3. **분할·검증 계획** — 참가자 단위(필요하면 기관·시기 단위), 내부 검증(교차검증, 부트스트랩 낙관 보정), 외부 검증 자료. 출력: `validation_plan.md`. QC: 전처리·변수 선택이 fold 안에서만 일어나는가.
4. **모델 개발** — scikit-learn 파이프라인(표준화 + 로지스틱 회귀 등), 생존 결과면 lifelines. 입력: 참가자 × 특징 표(CSV) → 출력: 모델 객체, 교차검증 예측. QC: 특징마다 "예측 시점에 존재했는가" 점검표.
5. **판별·보정·불확실성** — AUC(또는 C-index)와 부트스트랩 95% CI, 보정 절편·기울기, 보정 곡선, Brier. 출력: 성능표 CSV, 보정 그림. QC: 시험 사건 수, 구간 폭을 함께 보고.
6. **임계값과 임상적 유용성** — 비용 비율로 정한 임계값의 민감도·특이도·PPV(목표 집단 유병률로 다시 계산), 결정 곡선. 출력: 결정 곡선 그림. QC: 범위와 임계값을 분석 전에 정했는가.
7. **외부·시간적 검증과 하위집단** — 다른 기관·시기·기기에서 같은 지표, 필요하면 재보정. 성별·연령대·기기별 표(n, 사건 수, 구간). QC: 재보정용과 평가용 자료가 분리되었는가.
8. **보고와 감시 계획** — TRIPOD+AI(예측 모델), STARD 2015(진단 정확도), CLAIM(영상 AI) 점검표, 모델 카드, 배포 시 감시 지표(입력 분포, O/E). QC: 빠진 항목을 "없음"으로 명시했는가.

## 최소 실행 예시

### 예시 1 — 같은 도구, 다른 유병률에서의 PPV

```python
import numpy as np
import pandas as pd

sens, spec = 0.85, 0.90          # 가상의 선별 도구: 민감도 85%, 특이도 90%
rows = []
for setting, prev in [("환자-대조군 연구(1:1)", 0.50),
                      ("고위험 의뢰 클리닉", 0.10),
                      ("일반 인구 선별", 0.005)]:
    n = 10000
    diseased = n * prev
    tp = sens * diseased
    fp = (1 - spec) * (n - diseased)
    fn = diseased - tp
    tn = (n - diseased) - fp
    rows.append({"상황": setting, "유병률": prev, "양성 판정": round(tp + fp),
                 "진양성": round(tp), "위양성": round(fp),
                 "PPV": round(tp / (tp + fp), 3), "NPV": round(tn / (tn + fn), 4)})
print(pd.DataFrame(rows).to_string(index=False))
```

출력:

```text
            상황   유병률  양성 판정  진양성  위양성   PPV    NPV
환자-대조군 연구(1:1) 0.500   4750 4250  500 0.895 0.8571
    고위험 의뢰 클리닉 0.100   1750  850  900 0.486 0.9818
      일반 인구 선별 0.005   1037   42  995 0.041 0.9992
```

민감도·특이도가 같아도 일반 인구 선별에서는 양성 판정의 약 96%가 위양성이다. 환자-대조군 연구의 PPV를 옮기지 않는다.

### 예시 2 — 외부 기관에서의 보정과 순 이득, 그리고 재보정

```python
import numpy as np
import statsmodels.api as sm
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, brier_score_loss

rng = np.random.default_rng(0)
def make(n, base=-1.6):
    X = rng.normal(size=(n, 2))
    y = rng.random(n) < 1 / (1 + np.exp(-(base + X @ [1.0, 0.5])))
    return X, y.astype(int)

X_dev, y_dev = make(1000)
X_ext, y_ext = make(1000, base=-2.6)          # 외부 기관: 기저 위험이 더 낮다
p = LogisticRegression().fit(X_dev, y_dev).predict_proba(X_ext)[:, 1]
lp = np.log(p / (1 - p))

citl = sm.GLM(y_ext, np.ones((len(p), 1)), family=sm.families.Binomial(), offset=lp).fit().params[0]
slope = sm.Logit(y_ext, sm.add_constant(lp)).fit(disp=0).params[1]
print(f"AUC {roc_auc_score(y_ext, p):.3f} | Brier {brier_score_loss(y_ext, p):.3f} | 관찰 {y_ext.mean():.3f} 예측 {p.mean():.3f}"
      f" | 보정 절편 {citl:+.2f} 기울기 {slope:.2f}")

def net_benefit(y, p, pt):
    pos = p >= pt
    return (np.sum(pos & (y == 1)) - np.sum(pos & (y == 0)) * pt / (1 - pt)) / len(y)
p_recal = 1 / (1 + np.exp(-(lp + citl)))       # 절편만 재보정(원래는 별도 자료로 추정해야 한다)
for pt in [0.1, 0.2, 0.3]:
    print(f"pt {pt:.1f} | 원래 모델 {net_benefit(y_ext, p, pt):+.3f} | 재보정 {net_benefit(y_ext, p_recal, pt):+.3f}"
          f" | 모두 양성 {y_ext.mean() - (1 - y_ext.mean()) * pt / (1 - pt):+.3f}")
```

출력:

```text
AUC 0.770 | Brier 0.106 | 관찰 0.115 예측 0.220 | 보정 절편 -0.95 기울기 0.88
pt 0.1 | 원래 모델 +0.040 | 재보정 +0.051 | 모두 양성 +0.017
pt 0.2 | 원래 모델 +0.004 | 재보정 +0.025 | 모두 양성 -0.106
pt 0.3 | 원래 모델 -0.011 | 재보정 +0.015 | 모두 양성 -0.264
```

AUC 0.77은 괜찮아 보이지만 예측 평균(0.220)이 관찰(0.115)의 두 배이고(절편 −0.95), 임계 확률 0.3에서 순 이득이 음수다. 절편만 맞추면 순 이득이 돌아온다. 이 예시는 짧게 보이려고 같은 자료로 재보정량을 추정했지만, 실제로는 재보정용 자료와 평가용 자료를 나눠야 한다([Day H6](../lessons/advanced/H-clinical-prediction/day-H6.md) 예시 2).

## 흔한 함정

1. **환자-대조군 자료로 "조기진단" 성능을 주장한다** → 이미 진단된 중등도 환자와 건강 자원자는 쉽게 구분되어 성능이 부풀려진다 → 실제 대상 집단(감별 대상 포함, 진단 전 시점)의 자료로 평가하고, 없으면 주장을 "진단된 사람 구분 baseline"으로 낮춘다.
2. **AUC만 보고한다** → 보정이 틀린 모델도 AUC가 같을 수 있고, 그 확률로 결정하면 해롭다 → 보정 절편·기울기·곡선과 결정 곡선을 함께 낸다.
3. **겉보기 성능(개발 자료 성능)을 보고한다** → 작은 표본일수록 과적합으로 부풀려진다 → 교차검증·부트스트랩으로 낙관을 보정한 값을 낸다.
4. **전체 자료로 변수 선택 후 교차검증** → 시험 fold 정보가 이미 쓰였다 → 변수 선택·전처리를 파이프라인에 넣는다.
5. **기록 단위로 나눈다** → 같은 사람이 훈련·시험에 모두 있다 → 참가자 단위, 다기관이면 기관 단위까지 고려한다.
6. **예측 시점 이후의 정보를 특징으로 쓴다** (마지막 방문 값, 추적 중 방문 횟수) → C-index·AUC가 크게 오른다 → 특징별 "예측 시점에 존재했나" 표를 만든다.
7. **중도절단을 "사건 없음"으로 센다** → 위험을 과소 추정한다 → Kaplan–Meier·Cox 등 생존 방법을 쓴다.
8. **외부 기관에 그대로 적용한다** → 기저 위험·기기 차이로 보정이 무너진다 → 외부 검증, 필요하면 재보정, 그리고 배포 후 감시.

## 연구 설계 체크리스트

- [ ] 대상 집단·예측 시점·결과와 기준 검사·쓰임새를 문장으로 적었다
- [ ] 결과 정의와 기준 검사의 한계(오분류, 일부만 검사받음)를 적었다
- [ ] Riley 기준 등으로 최소 표본 수를 계산했고, 후보 변수 전체를 셌다
- [ ] 분할 단위(참가자, 기관, 시기)와 내부·외부 검증 계획을 미리 정했다
- [ ] 결측 처리 방법과 결측 비율을 보고할 계획이 있다
- [ ] 모든 특징이 예측 시점 이전 정보인지 점검표를 만들었다
- [ ] 판별·보정 지표와 부트스트랩 구간을 보고할 계획이 있다
- [ ] 합리적 임계 확률 범위와 비용 비율의 근거를 분석 전에 적었다
- [ ] 하위집단(성별, 연령대, 기관·기기)을 미리 정했다
- [ ] 해당 보고 지침(TRIPOD+AI / STARD 2015 / CLAIM)과 모델 카드 양식을 정했다

## 공개 데이터와 더 볼 곳

**공개 데이터**
- PhysioNet, Parkinson's Disease Smartwatch (PADS) v1.0.0: <https://physionet.org/content/parkinsons-disease-smartwatch/1.0.0/> — 스마트워치 손목 움직임 기록과 참가자 표, 진단군에 건강 대조군·PD·다른 운동장애. 횡단면 자료라 전구기 예측에는 쓸 수 없다. 관련 논문: Varghese J, et al. *npj Parkinsons Dis.* 2024. doi:[10.1038/s41531-023-00625-7](https://doi.org/10.1038/s41531-023-00625-7)

**공식 문서·도구**
- TRIPOD 공식 사이트: <https://www.tripod-statement.org/> · EQUATOR Network의 STARD: <https://www.equator-network.org/reporting-guidelines/stard/>
- 결정 곡선 분석 튜토리얼(R·Stata·Python): <https://mskcc-epi-bio.github.io/decisioncurveanalysis/>
- lifelines 문서: <https://lifelines.readthedocs.io/> · scikit-learn 확률 보정: <https://scikit-learn.org/stable/modules/calibration.html>
- PROBAST(예측 모델 연구의 위험 편향 평가 도구): <https://www.probast.org/>

**핵심 논문**
- Collins GS, et al. TRIPOD+AI statement. *BMJ.* 2024;385:e078378. doi:[10.1136/bmj-2023-078378](https://doi.org/10.1136/bmj-2023-078378)
- Bossuyt PM, et al. STARD 2015. *BMJ.* 2015;351:h5527. doi:[10.1136/bmj.h5527](https://doi.org/10.1136/bmj.h5527)
- Tejani AS, et al. CLAIM: 2024 update. *Radiol Artif Intell.* 2024. doi:[10.1148/ryai.240300](https://doi.org/10.1148/ryai.240300)
- Riley RD, et al. Calculating the sample size required for developing a clinical prediction model. *BMJ.* 2020;368:m441. doi:[10.1136/bmj.m441](https://doi.org/10.1136/bmj.m441)
- Van Calster B, et al. Calibration: the Achilles heel of predictive analytics. *BMC Med.* 2019. doi:[10.1186/s12916-019-1466-7](https://doi.org/10.1186/s12916-019-1466-7)
- Vickers AJ, Van Calster B, Steyerberg EW. Net benefit approaches to the evaluation of prediction models, molecular markers, and diagnostic tests. *BMJ.* 2016;352:i6. doi:[10.1136/bmj.i6](https://doi.org/10.1136/bmj.i6)
- Steyerberg EW, Vergouwe Y. Towards better clinical prediction models: seven steps for development and an ABCD for validation. *Eur Heart J.* 2014;35:1925–1931. doi:[10.1093/eurheartj/ehu207](https://doi.org/10.1093/eurheartj/ehu207)
- Debray TPA, et al. A new framework to enhance the interpretation of external validation studies of clinical prediction models. *J Clin Epidemiol.* 2015;68:279–289. doi:[10.1016/j.jclinepi.2014.06.018](https://doi.org/10.1016/j.jclinepi.2014.06.018)
- Christodoulou E, et al. A systematic review shows no performance benefit of machine learning over logistic regression for clinical prediction models. *J Clin Epidemiol.* 2019;110:12–22. doi:[10.1016/j.jclinepi.2019.02.004](https://doi.org/10.1016/j.jclinepi.2019.02.004)
- Berg D, Postuma RB, et al. MDS research criteria for prodromal Parkinson's disease. *Mov Disord.* 2015;30:1600–1611. doi:[10.1002/mds.26431](https://doi.org/10.1002/mds.26431)

## 본 과정과의 연결

| 이 가이드의 부분 | 자세히 다루는 레슨 |
|---|---|
| 설명 vs 예측, 분석 단위 | [Day 29 — 질문에 맞는 분석 고르기](../lessons/week-5/day-29.md) |
| baseline 모델, 참가자 단위 검증, 누수 | [Day 32 — 로지스틱 회귀 baseline](../lessons/week-5/day-32.md), [Day 33 — GroupKFold와 데이터 누수](../lessons/week-5/day-33.md) |
| 민감도·특이도·ROC·임계값 | [Day 34 — 평가 해석](../lessons/week-5/day-34.md) |
| 문제 정의, 스펙트럼 편향, PPV와 유병률 | [Day H1](../lessons/advanced/H-clinical-prediction/day-H1.md) |
| 표본 수, 분할, 개발·내부·외부 검증 구조 | [Day H2](../lessons/advanced/H-clinical-prediction/day-H2.md) |
| AUC 신뢰구간, 보정, Brier, 비용 기반 임계값 | [Day H3](../lessons/advanced/H-clinical-prediction/day-H3.md), [Day E6 — 예측 모델과 검증](../lessons/advanced/E-ehr/day-E6.md) |
| 결정 곡선과 순 이득 | [Day H4](../lessons/advanced/H-clinical-prediction/day-H4.md) |
| 생존 분석, C-index, 시간 누수 | [Day H5](../lessons/advanced/H-clinical-prediction/day-H5.md) |
| 외부 검증, 데이터셋 이동, 재보정, 하위집단, 감시 | [Day H6](../lessons/advanced/H-clinical-prediction/day-H6.md), [Day G7 — 평가·편향·규제](../lessons/advanced/G-ai-biomed/day-G7.md) |
| 보고 지침, SaMD, 모델 카드, 미니 프로젝트 | [Day H7](../lessons/advanced/H-clinical-prediction/day-H7.md), [Day E7 — 재현성과 보고](../lessons/advanced/E-ehr/day-E7.md) |
| PADS 데이터 구조 | [Day 24 — PhysioNet 데이터 접근](../lessons/week-4/day-24.md), [Day 25 — participant-level QC](../lessons/week-4/day-25.md) |
| 효과크기·다중검정 등 통계 일반 | [Crash Course — 연구 설계와 통계 응급 키트](study-design-stats.md) |
| EHR 자료로 예측 모델을 만든다면 | [Crash Course — EHR 2차 분석](ehr.md) |

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
