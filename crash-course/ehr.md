# Crash Course — EHR 2차 분석

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** EHR(전자건강기록) 자료로 한 관찰 연구나 예측 모델 논문의 방법 절을 읽고 어디가 약한지 짚을 수 있고, 내 연구를 시작하기 전에 질문·코호트·정제·교란 통제·검증·보고의 순서와 점검 항목을 계획할 수 있다.

## 한눈에 보기

| | 내용 |
|---|---|
| 무엇을 재는가 | 진료와 청구를 위해 남긴 기록: 입원·전원, 진단·처치 코드, 검사값, 활력징후, 투약·오더, (일부 자료는) 임상 노트와 생체 파형. 연구용으로 설계된 측정이 아니다 |
| 답할 수 있는 질문 | 처치·질환의 빈도와 추세(기술) / 실제 진료에서 치료 A와 B를 받은 환자의 결과 차이(비교 효과, 연관) / 정해진 시점의 정보로 앞으로의 사건 위험 예측 / 시판 후 드문 부작용 신호(약물 감시) |
| 답하지 못하는 것 | 한 편의 연구로 인과 확정. 측정되지 않은 교란(의사가 본 환자의 인상, 사회적 요인)은 어떤 통계로도 지워지지 않는다. 기록되지 않은 사건(다른 병원에서 일어난 일), 정확한 실제 날짜(비식별화된 공개 자료) |
| 값의 성격 | **측정 자체가 선택적**이다. 걱정되는 환자를 더 자주 재므로 "측정했는가"가 정보다. 코드는 청구 규칙을, 시각은 기록 습관을 따른다 |
| 가장 먼저 정할 것 | 연구 질문의 다섯 칸(대상·노출·비교·결과·시점)과 **index time** |

## 🎬 급할 때 볼 영상

- [MIMIC-IV, a deidentified critical care database — Clinical ML | Alistair Johnson | AMLD Intelligence Summit](https://www.youtube.com/watch?v=qA-xG1HjlRo) (7:47) — 가장 많이 쓰이는 공개 중환자 EHR 데이터베이스가 무엇을 담고 어떻게 비식별화되었는지 만든 사람에게 듣는다.
- [Time-Based Biases | Understanding Medical Research — YaleCourses](https://www.youtube.com/watch?v=PgfAImPNVu4) (17:12) — EHR 연구에서 가장 자주, 가장 크게 결과를 뒤집는 시간 관련 편향(불멸 시간 등). 하나만 본다면 이것.
- [Building and validating prediction models — NIHR Maudsley Biomedical Research Centre (BRC)](https://www.youtube.com/watch?v=ZRf0scPfrVQ) (10:23) — 예측 모델을 다룬다면. 개발·내부 검증·외부 검증의 구분.

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| 2차 사용 (secondary use) | 진료·청구용으로 남긴 기록을 나중에 연구에 쓰는 것 | 기록의 원래 목적이 결측·코드 정확도·시각의 의미를 정한다 |
| 관계형 표와 식별자 | 환자 → 입원 → ICU 입실처럼 여러 단계의 열쇠(예: MIMIC-IV의 `subject_id`, `hadm_id`, `stay_id`)로 이어진 표들 | 열쇠를 잘못 고르면 행이 조용히 불어나거나 다른 입원의 값이 섞인다 |
| 표현형 정의 (phenotyping) | 코드·투약·검사·노트를 조합해 "이 환자는 X다"를 판정하는 알고리즘 | 같은 질환명도 정의에 따라 다른 사람들이 잡힌다. 차트 검토로 PPV·민감도를 확인한다 |
| index time | 각 환자의 추적이 시작되는 순간. 기저값은 이전, 결과는 이후 정보로 잰다 | 이 규칙이 깨지면 원인과 결과가 섞인다 |
| 불멸 시간 편향 (immortal time bias) | 노출이 정해지기 전까지 "살아 있어야 했던" 시간을 노출군에 넣어 생기는 편향 | 효과가 0인 약도 사망을 크게 줄이는 것처럼 보이게 만든다 |
| 적응증에 의한 교란 (confounding by indication) | 더 아픈 환자가 더 적극적인 치료를 받아, 치료와 나쁜 결과가 함께 나타나는 것 | 단순 비교에서 효과 있는 치료가 해로워 보인다 |
| 정보가 있는 결측 (informative missingness) | 측정 여부가 환자 상태나 의료진 판단에 달린 결측. 대개 MNAR 성격 | 잰 사람만의 평균으로 빈칸을 채우면 체계적으로 틀린다 |
| 성향점수 (propensity score) | 기저 변수로 추정한 "치료받을 확률". 매칭·가중에 쓴다 | 많은 교란변수를 한 숫자로 요약해 균형을 맞춘다. 측정한 변수만 다룬다 |
| 판별과 보정 (discrimination, calibration) | 판별: 위험 순서를 맞히는가(AUC). 보정: 예측 숫자가 실제 비율과 맞는가 | AUC가 좋아도 위험을 두 배로 말하는 모델은 임상에서 해롭다 |
| 데이터셋 이동 (dataset shift) | 시간·병원이 바뀌며 진료·측정·코드 체계가 변하는 것 | 무작위 분할 검증은 이를 숨긴다. 시간적·외부 검증으로 드러낸다 |

## 측정 기술 고르기

EHR 2차 분석에서 "기술"은 자료원이다. 질문에 필요한 교란변수와 시각 정보가 그 자료에 있는지가 고르는 기준이다.

| 자료원 | 무엇을 얻나 | 장점 | 한계 | 이런 질문에 쓴다 |
|---|---|---|---|---|
| 보험 청구·행정 자료 | 진단·처치 코드, 처방 조제, 비용, 장기 추적 | 인구 대표성, 큰 규모, 여러 병원에 걸친 추적 | 검사값·활력징후·정확한 시각이 거의 없다. 코드는 청구 목적 | 이용 양상, 장기 결과, 드문 사건 |
| 질환·처치 등록부 (registry) | 미리 정한 변수의 표준화된 수집 | 정의가 일정하고 품질 관리가 된다 | 등록부가 정한 변수 밖은 없다. 참여 기관에 치우칠 수 있다 | 특정 질환·수술의 결과 비교 |
| 병원 EHR (단일·소수 기관) | 시간 단위 검사·활력징후·투약·오더·노트 | 중증도를 촘촘히 잴 수 있어 교란 통제에 유리 | 그 기관 환자만. 기관의 진료 습관이 결과에 섞인다 | 입원 중 처치의 비교 효과, 조기 경보·예측 |
| 공개 중환자 DB (MIMIC-IV, eICU-CRD) | 위와 같은 종류의 비식별 자료 + 공개 코드 커뮤니티 | 누구나(자격 심사 후) 같은 자료로 재현 가능 | 날짜 이동, 고령 나이 상한 등 비식별화 제약. 중환자 중심 | 방법 학습, 재현 연구, 가설 생성 |
| 다기관 공통 데이터 모델 (OMOP CDM 등) | 여러 기관 자료를 같은 표 구조·용어로 변환한 것 | 같은 분석 코드를 여러 기관에 돌려 외부 검증 | 변환 과정에서 정보 손실. 기관마다 기록 습관 차이는 남는다 | 다기관 비교 효과, 외부 검증 |
| 임상 노트 + NLP | 증상, 판단 근거, 부정·가족력 표현 | 코드에 없는 정보(중증도 인상, 기능 상태) | 비식별화가 어렵고 공개 범위가 좁다. 부정 표현·약어 처리 필요 | 표현형 정의 보완, 코드로 안 잡히는 노출 |

## 표준 분석 흐름

1. **질문 고정.** 대상·노출·비교·결과·시점 다섯 칸과 질문 종류(기술, 비교 효과, 예측, 약물 감시)를 적는다. 비교 효과라면 하고 싶었던 무작위 시험의 설계를 먼저 적는다(표적 시험 모사). 출력: 분석 계획서(날짜 포함). QC: 주 결과가 하나인가, 시점 칸이 비어 있지 않은가.
2. **자료 접근과 기록.** 자료의 버전·라이선스·접근 조건을 확인하고 기록한다. MIMIC-IV 원본은 PhysioNet 자격 심사 + CITI 교육 + DUA가 필요하고, [데모](https://physionet.org/content/mimic-iv-demo/2.2/)(100명, ODbL)는 누구나 받을 수 있다(2026년 11월 확인). 출력: 데이터 기록 한 줄(이름, 버전, DOI, 날짜, 체크섬). QC: 체크섬 일치, 데이터 파일이 코드 저장소에 들어가지 않았는가. **자격 심사형 자료를 온라인 AI 서비스에 붙여 넣지 않는다**(PhysioNet 2023 공지).
3. **표 연결.** SQL(BigQuery, PostgreSQL, 작은 자료는 SQLite) 또는 pandas로 표를 열쇠로 잇는다. 출력: 분석 단위(보통 입원 또는 입실) 한 행짜리 표. QC: 합치기 전후 행 수, 열쇠 유일성(pandas `merge(validate=...)`).
4. **코호트 깔때기.** 포함·제외 기준을 순서대로 적용하고 단계마다 남은 수를 기록한다. 환자별 첫 입실, 신규 사용자 설계 등. 노출·결과는 코드 목록이나 알고리즘으로 정의하고 일부를 차트 검토로 검증한다. 출력: 흐름표, 코드 목록 파일. QC: 단계마다 수가 줄기만 하는가, 정의의 PPV·민감도.
5. **시간 창 자르기.** index time을 기준으로 기저값 창, 노출 창, 결과 창을 정한다. 예측이라면 "예측 시점에 결과가 화면에 있었는가"(MIMIC-IV `labevents`의 `charttime`과 `storetime` 구분)까지 본다. QC: 기저 변수에 index 이후 값이 섞이지 않았는가, 노출을 추적 기간 전체로 정의하지 않았는가.
6. **정제.** 검사별 단위 통일 → 불가능 범위 제거(결측으로) → 위험하지만 가능한 값은 표시만 → 결측 비율을 군별로 보고 → 결측 처리(추론이면 다중 대치, 예측이면 결측 지시 변수도 고려). 출력: 정제 기록표. QC: 이름 × 단위별 분포에 봉우리가 둘인가, 규칙을 결과를 보기 전에 정했는가.
7. **탐색과 교란 점검.** 군별 Table 1을 SMD로 만든다. 교란변수는 원인 그림(DAG)과 임상 지식으로 고르고, index 이전 측정만 쓴다. QC: |SMD| > 0.1인 변수 목록.
8. **주 분석.** 비교 효과라면 회귀 보정, 성향점수 매칭(ATT), 역확률 가중(ATE) 중 질문에 맞는 것을 고른다. 시간-사건 결과는 Kaplan–Meier와 Cox 모형(비례위험 가정 확인). 도구: statsmodels, scikit-learn, R의 MatchIt·WeightIt·survival. QC: 매칭·가중 후 SMD < 0.1, 가중치 범위, 공통 지지 영역.
9. **민감도 분석.** 코호트 기준·노출 창·caliper·결측 처리를 합리적 범위에서 바꾸고, E-value로 측정하지 않은 교란에 대한 튼튼함을 보고한다. 필요하면 음성 대조, 도구 변수, case-crossover 같은 다른 설계로 교차 확인. QC: 결론이 바뀌는 조건을 숨기지 않았는가.
10. **(예측 모델) 검증.** 환자 단위 분할 → 시간적 검증(앞 연도 개발, 뒤 연도 검증) → 가능하면 외부 검증. 판별(AUC), 보정(절편·기울기·보정 그림), Brier, 정해진 문턱의 민감도·PPV·경보 비율. 하이퍼파라미터는 검증 자료에서만 고른다. QC: 누수 점검표(특징마다 예측 시점에 존재했는가).
11. **보고와 공개.** 비교 효과·기술 연구는 STROBE + RECORD, 예측 모델은 TRIPOD+AI. 코드(코호트 정의 포함)를 공개 저장소에 올리고, 작은 칸은 가린다(기준은 계약·IRB를 따름). 출력: 원고, 점검표, 실행 기록(run record). QC: 계획서와 달라진 분석을 사후 분석으로 표시했는가.

## 최소 실행 예시

### 1. 불멸 시간 편향을 눈으로 보기

효과가 0인 약입니다. 사망 시점은 약과 무관하게 정해지고, 약은 살아 있을 때만 시작할 수 있습니다.

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(42)
n = 20000
death_day = rng.exponential(scale=80, size=n)
will_get = rng.random(n) < 0.4
start_day = rng.exponential(scale=5, size=n)
treated = will_get & (start_day < np.minimum(death_day, 28))
died28 = death_day < 28
print("잘못된 비교(한 번이라도 투약):", pd.Series(died28).groupby(treated).mean().round(3).to_dict())

alive3 = death_day >= 3
lm = pd.Series(died28[alive3]).groupby((will_get & (start_day < 3))[alive3]).mean().round(3)
print("landmark 3일:", lm.to_dict())
```

출력:

```text
잘못된 비교(한 번이라도 투약): {False: 0.322, True: 0.246}
landmark 3일: {False: 0.268, True: 0.261}
```

잘못된 비교는 사망을 7.6%p 줄이는 "효과"를 만들어 냅니다. landmark(3일째 생존자를 3일까지의 투약으로 나눔)에서는 차이가 사라집니다.

### 2. 교란 통제 전후: 단순 OR → 보정 OR, 그리고 성향점수 가중 후 균형

아픈 환자일수록 치료받고, 치료는 실제로 사망을 줄이도록(조건부 OR ≈ 0.67) 만든 가상 자료입니다.

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm
from sklearn.linear_model import LogisticRegression

rng = np.random.default_rng(23)
n = 4000
age = rng.normal(65, 13, n)
sofa = np.clip(rng.poisson(5, n) + (age > 75), 0, 20)
lactate = np.exp(0.3 + 0.08 * sofa + rng.normal(0, 0.3, n))
treat = rng.random(n) < 1 / (1 + np.exp(-(-3.0 + 0.35 * sofa + 0.3 * np.log(lactate) + 0.01 * (age - 65))))
died = rng.random(n) < 1 / (1 + np.exp(-(-4.2 + 0.30 * sofa + 0.03 * (age - 65) + 0.5 * np.log(lactate) - 0.40 * treat)))
df = pd.DataFrame({"age": age, "sofa": sofa, "log_lactate": np.log(lactate),
                   "treat": treat.astype(int), "died": died.astype(int)})
covs = ["age", "sofa", "log_lactate"]

crude = np.exp(sm.Logit(df.died, sm.add_constant(df[["treat"]])).fit(disp=0).params["treat"])
adj = np.exp(sm.Logit(df.died, sm.add_constant(df[["treat"] + covs])).fit(disp=0).params["treat"])
print(f"단순 OR {crude:.2f} → 보정 OR {adj:.2f}")

ps = LogisticRegression(C=1e6, max_iter=1000).fit(df[covs], df.treat).predict_proba(df[covs])[:, 1]
w = np.where(df.treat == 1, df.treat.mean() / ps, (1 - df.treat.mean()) / (1 - ps))
for c in covs:
    t, u = df.treat == 1, df.treat == 0
    def s(wt):
        m1, m0 = np.average(df[c][t], weights=wt[t]), np.average(df[c][u], weights=wt[u])
        v1 = np.average((df[c][t] - m1) ** 2, weights=wt[t]); v0 = np.average((df[c][u] - m0) ** 2, weights=wt[u])
        return (m1 - m0) / np.sqrt((v1 + v0) / 2)
    print(f"{c:12s} SMD 전 {s(np.ones(n)):.2f} → IPW 후 {s(w):.2f}")
```

출력:

```text
단순 OR 1.45 → 보정 OR 0.66
age          SMD 전 0.26 → IPW 후 0.01
sofa         SMD 전 0.81 → IPW 후 0.03
log_lactate  SMD 전 0.47 → IPW 후 0.01
```

단순 비교는 치료가 해롭다고(OR 1.45) 말하지만, 교란변수를 보정하면 이롭다는(0.66) 정답 쪽으로 뒤집힙니다. 가중 후 SMD가 모두 0.1 아래입니다. 이것은 **측정한** 교란변수가 다 들어 있는 가상 세계라서 가능한 결과이고, 실제 자료에서는 측정하지 않은 교란이 남는다는 전제로 민감도 분석을 함께 보고합니다.

## 흔한 함정

1. **노출을 "입원 중 한 번이라도"로 정의한다** → 노출 전 생존 시간이 노출군에 들어가 불멸 시간 편향이 생긴다 → index time 기준의 노출 창, landmark, 시간 의존 노출, 표적 시험 모사로 자격·배정·추적 시작을 맞춘다.
2. **치료 이후에 잰 변수를 보정한다** → 치료 효과의 경로 일부를 지우거나 새 편향을 만든다 → 교란변수는 index 이전 측정만. DAG로 고른다.
3. **Table 1을 p-value로 판단한다** → 큰 EHR 표본에서는 사소한 차이도 유의, 작은 하위군에서는 큰 차이도 비유의 → SMD로 보고, 매칭·가중 후에도 SMD로 확인한다.
4. **측정한 사람만의 평균으로 결측을 채운다** → 아픈 사람을 더 자주 재므로 덜 아픈 사람에게 너무 나쁜 값을 넣는다 → 결측 비율을 군별로 보고, 메커니즘을 추론하고, 다중 대치와 결측 지시 변수, 민감도 분석을 쓴다.
5. **극단값을 통계 규칙으로 자동 삭제한다** → 중환자의 위험하지만 진짜인 값이 사라져 가장 아픈 환자가 빠진다 → 임상 지식으로 정한 "불가능" 범위만 결측으로, 나머지는 표시 후 민감도 분석.
6. **같은 환자의 여러 입원·입실을 독립 표본으로 쓰거나 훈련·시험에 나눠 넣는다** → 표준오차가 작아지고 예측 성능이 부풀려진다 → 첫 입실만 쓰거나, 군집 구조를 반영하고, 분할은 환자 단위로.
7. **예측 시점 이후 정보가 특징에 들어간다** → 퇴원 진단, 재원 기간 전체 통계, 늦게 올라온 검사, 임종 관련 오더로 AUC가 "놀랍게" 오른다 → 특징마다 "예측 시점에 화면에 있었나"를 표로 점검하고, `storetime`까지 고려한다.
8. **무작위 분할 검증만 하고 AUC만 보고한다** → 진료·측정 변화로 미래 환자에게 위험을 크게 틀리게 말하는 모델을 놓친다 → 시간적·외부 검증, 보정 절편·기울기·보정 그림을 함께 보고하고, 배포 후 재보정·감시 계획을 둔다.

## 연구 설계 체크리스트

- [ ] 연구 질문의 다섯 칸(대상·노출·비교·결과·시점)과 질문 종류를 계획서에 적고 날짜를 남겼다
- [ ] 자료의 이름·버전·DOI·라이선스·접근 조건을 기록했고, 데이터는 코드 저장소 밖에 있다
- [ ] 분석 단위(환자, 입원, 입실)를 정했고, 같은 사람이 여러 번 들어가는 문제를 어떻게 다룰지 정했다
- [ ] index time을 정의했고, 자격·치료 전략 갈림·추적 시작이 같은 순간인지 확인했다
- [ ] 노출·결과·대상을 찾는 코드 목록(진단 코드, 검사 `itemid`, 약 목록)을 파일로 남겼고, 일부를 차트 검토 등으로 검증할 계획이 있다
- [ ] 단위 통일 규칙, 불가능 범위, 결측 처리 방법을 결과를 보기 전에 정했다
- [ ] 교란변수 후보를 DAG와 임상 지식으로 골랐고, 모두 index 이전 측정이다
- [ ] 주 분석과 추정 대상(ATE/ATT 또는 예측 시점), 민감도 분석 목록, E-value 보고 계획이 있다
- [ ] (예측) 환자 단위·시간적 검증 계획과 판별·보정 지표, 누수 점검표가 있다
- [ ] 보고 지침(STROBE+RECORD 또는 TRIPOD+AI)을 정했고, 작은 칸 가림 기준을 계약·IRB에서 확인했다

## 공개 데이터와 더 볼 곳

**저장소** (접근 조건은 2026년 11월 PhysioNet 페이지 기준)

| 이름 | URL | 무엇이 있나 |
|---|---|---|
| MIMIC-IV Clinical Database Demo v2.2 | <https://physionet.org/content/mimic-iv-demo/2.2/> | MIMIC-IV에서 환자 100명을 뽑은 공개 데모(노트 제외). ODbL v1.0, 누구나 |
| MIMIC-IV | <https://physionet.org/content/mimiciv/> | 미국 한 대학병원의 비식별 입원·ICU 기록. 자격 심사 + CITI + DUA |
| MIMIC-IV-Note, MIMIC-IV-ED | <https://physionet.org/content/mimic-iv-note/>, <https://physionet.org/content/mimic-iv-ed/> | 같은 병원의 비식별 노트, 응급실 모듈. 자격 심사형 |
| eICU-CRD (와 데모) | <https://physionet.org/content/eicu-crd/>, <https://physionet.org/content/eicu-crd-demo/> | 미국 여러 병원의 원격 ICU 프로그램 자료. 본 자료는 자격 심사형, 데모는 ODbL |
| MIMIC 문서 | <https://mimic.mit.edu/docs/iv/> | 표별 열 정의(날짜 이동, 나이 규칙, 시각 열의 뜻) |
| OHDSI / OMOP CDM | <https://www.ohdsi.org/>, <https://ohdsi.github.io/CommonDataModel/> | 다기관 공통 데이터 모델과 공개 도구, 교재(The Book of OHDSI: <https://ohdsi.github.io/TheBookOfOhdsi/>) |

**공식 문서·도구**

- MIMIC Code Repository (SOFA, 패혈증 등 개념 정의의 공유 코드): <https://github.com/MIT-LCP/mimic-code>
- PhysioNet 자격 심사형 라이선스 1.5.0: <https://physionet.org/about/licenses/physionet-credentialed-health-data-license-150/>
- 온라인 AI 서비스와 자격 심사형 자료에 관한 PhysioNet 공지(2023): <https://physionet.org/news/post/gpt-responsible-use>
- 보고 지침 모음 EQUATOR Network: <https://www.equator-network.org/> · STROBE <https://www.strobe-statement.org/> · RECORD <https://www.record-statement.org/> · TRIPOD <https://www.tripod-statement.org/>
- 교재: MIT Critical Data. *Secondary Analysis of Electronic Health Records*. Springer, 2016. 오픈 액세스(CC BY-NC 4.0). NCBI Bookshelf <https://www.ncbi.nlm.nih.gov/books/NBK543630/> · Springer <https://doi.org/10.1007/978-3-319-43742-2>. 연구 질문부터 검증까지의 1–2부와 사례 연구 3부. 데이터 접근 절차와 표 이름은 2016년(MIMIC-II/III) 기준이다.

**핵심 논문** (PubMed에서 서지 확인)

- Johnson AEW, et al. MIMIC-IV, a freely accessible electronic health record dataset. *Sci Data.* 2023. doi:[10.1038/s41597-022-01899-x](https://doi.org/10.1038/s41597-022-01899-x)
- Hernán MA, Robins JM. Using big data to emulate a target trial when a randomized trial is not available. *Am J Epidemiol.* 2016. doi:[10.1093/aje/kwv254](https://doi.org/10.1093/aje/kwv254)
- Suissa S. Immortal time bias in pharmaco-epidemiology. *Am J Epidemiol.* 2008. doi:[10.1093/aje/kwm324](https://doi.org/10.1093/aje/kwm324)
- Hripcsak G, Albers DJ. Next-generation phenotyping of electronic health records. *J Am Med Inform Assoc.* 2013. doi:[10.1136/amiajnl-2012-001145](https://doi.org/10.1136/amiajnl-2012-001145)
- Austin PC. An introduction to propensity score methods for reducing the effects of confounding in observational studies. *Multivariate Behav Res.* 2011. doi:[10.1080/00273171.2011.568786](https://doi.org/10.1080/00273171.2011.568786)
- VanderWeele TJ, Ding P. Sensitivity analysis in observational research: introducing the E-value. *Ann Intern Med.* 2017. doi:[10.7326/M16-2607](https://doi.org/10.7326/M16-2607)
- Sterne JAC, et al. Multiple imputation for missing data in epidemiological and clinical research: potential and pitfalls. *BMJ.* 2009. doi:[10.1136/bmj.b2393](https://doi.org/10.1136/bmj.b2393)
- Van Calster B, et al. Calibration: the Achilles heel of predictive analytics. *BMC Med.* 2019. doi:[10.1186/s12916-019-1466-7](https://doi.org/10.1186/s12916-019-1466-7)
- Benchimol EI, et al. The REporting of studies Conducted using Observational Routinely-collected health Data (RECORD) statement. *PLoS Med.* 2015. doi:[10.1371/journal.pmed.1001885](https://doi.org/10.1371/journal.pmed.1001885)
- Collins GS, et al. Transparent reporting of a multivariable prediction model for individual prognosis or diagnosis (TRIPOD). *BMJ.* 2015. doi:[10.1136/bmj.g7594](https://doi.org/10.1136/bmj.g7594) · TRIPOD+AI: *BMJ.* 2024. doi:[10.1136/bmj-2023-078378](https://doi.org/10.1136/bmj-2023-078378)
- Johnson AEW, et al. The MIMIC Code Repository: enabling reproducibility in critical care research. *J Am Med Inform Assoc.* 2018. doi:[10.1093/jamia/ocx084](https://doi.org/10.1093/jamia/ocx084)

## 본 과정과의 연결

본 과정에는 EHR 자료가 없다. 통계·검증·재현성의 기초는 본 과정에서, EHR에 특화된 단계는 심화 파트 E에서 다룬다.

| 이 가이드의 부분 | 자세히 다루는 레슨 |
|---|---|
| 질문 고정, 2차 사용의 흔적 | [Day 7 — 분석 질문 고정하기](../lessons/week-1/day-07.md), [Day E1 — 임상 질문을 연구 질문으로](../lessons/advanced/E-ehr/day-E1.md) |
| 표 구조·열쇠, 데이터 접근·비식별화 | [Day 4 — tidy data](../lessons/week-1/day-04.md), [Day 24 — PhysioNet 데이터 접근](../lessons/week-4/day-24.md), [Day E2 — 표 구조, 접근, 윤리, 비식별화](../lessons/advanced/E-ehr/day-E2.md) |
| 코호트, index time, 불멸 시간 편향 | [Day E3 — 코호트 정의](../lessons/advanced/E-ehr/day-E3.md) |
| 단위·이상치·시간 정렬·결측 | [Day 25 — participant-level QC](../lessons/week-4/day-25.md), [Day E4 — 정제](../lessons/advanced/E-ehr/day-E4.md) |
| 교란, 회귀 보정, 성향점수, 민감도 분석 | [Day 11 — 반복·배치·교란](../lessons/week-2/day-11.md), [Day 31 — 교란변수](../lessons/week-5/day-31.md), [Day 39 — 민감도 분석](../lessons/week-6/day-39.md), [Day E5 — 교란 통제](../lessons/advanced/E-ehr/day-E5.md) |
| 예측 모델, 누수, 판별과 보정 | [Day 32 — baseline 모델](../lessons/week-5/day-32.md), [Day 33 — 참가자 단위 검증과 누수](../lessons/week-5/day-33.md), [Day 34 — 평가 지표](../lessons/week-5/day-34.md), [Day E6 — 예측 모델과 검증](../lessons/advanced/E-ehr/day-E6.md) |
| 재현성, 보고 지침, 윤리 | [Day 38 — 재현성](../lessons/week-6/day-38.md), [Day 40 — 과학적 글쓰기와 윤리](../lessons/week-6/day-40.md), [Day E7 — 재현성과 보고](../lessons/advanced/E-ehr/day-E7.md) |
| 통계 일반(효과크기, 다중검정) | [Crash Course — 연구 설계와 통계 응급 키트](study-design-stats.md) |
| 생체 파형·경보(중환자 모니터 신호) | [Crash Course — 생리 신호](physiology-signals.md) |

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
