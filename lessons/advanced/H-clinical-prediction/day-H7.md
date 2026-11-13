# Day H7 — 보고와 규제, 그리고 정직한 조기 선별 baseline 미니 프로젝트

> **주차:** 심화 파트 H — 임상 예측·조기진단 ML · **예상 시간:** 90분+ (프로젝트) · **산출물:** `notebooks/advanced/H/H7_project.ipynb`, `reports/advanced/H/H7_model_card.md` (모델 카드와 보고 점검표)
>
> **먼저 끝내 둘 레슨:** Day H1–H6, [Day E7](../E-ehr/day-E7.md) (보고 지침의 쓰임새), [Day G7](../G-ai-biomed/day-G7.md) (모델 카드, 규제 문서 목록)

## 오늘의 목표
- TRIPOD+AI, STARD 2015, CLAIM이 각각 어떤 연구에 쓰이는지 구분하고, 핵심 항목을 자기 원고의 점검표로 쓸 수 있다.
- 의료기기 소프트웨어(SaMD)의 위험 분류가 "정보가 결정에 얼마나 중요한가"와 "상황이 얼마나 위중한가"로 정해진다는 발상을 설명할 수 있다.
- PADS와 같은 모양의 가상 웨어러블 자료로 조기 선별 baseline을 만들고, H2–H6 절차로 평가한 뒤 모델 카드와 한계를 쓸 수 있다.

## 🎬 영상으로 먼저 보기

- [TRIPOD+AI reporting guideline — YouTube 검색](https://www.youtube.com/results?search_query=TRIPOD%2BAI+reporting+guideline+prediction+model) (검색 링크)
- **무엇에 주목할까:** 지침 저자나 학회 강연을 하나 골라, 2015년 TRIPOD에서 무엇이 추가되었는지(공정성, 오픈 사이언스, 환자·대중 참여 등) 들어 보세요.

- [Key Steps and Common Pitfalls in Clinical Prediction Model Research — Richard_D_Riley](https://www.youtube.com/watch?v=eM7K8NKATB0) (56:37)
- **무엇에 주목할까:** H2에서 본 강연입니다. 오늘은 마지막 부분의 "흔한 함정" 목록을 여러분의 미니 프로젝트 점검표와 대조해 보세요.

## 개념 설명

### 어떤 지침을 쓰는가

보고 지침이 무엇이고 어떻게 쓰는지는 [Day E7](../E-ehr/day-E7.md)에서 배웠습니다. 임상 예측·진단 연구에서 자주 만나는 셋을 구분합니다. 원문과 점검표는 [EQUATOR Network](https://www.equator-network.org/)에서 찾을 수 있습니다.

| 지침 | 대상 연구 | 이 파트와 연결되는 핵심 |
|---|---|---|
| [TRIPOD+AI](https://www.tripod-statement.org/) (Collins 등 2024) | 다변량 예측 모델(회귀·기계학습)의 개발·검증 | 대상 집단과 예측 시점(H1), 표본 수 근거(H2), 판별·보정과 그 불확실성(H3), 검증 방식(H2·H6), 하위집단·공정성(H6), 코드·자료 공개 |
| [STARD 2015](https://www.equator-network.org/reporting-guidelines/stard/) (Bossuyt 등 2015) | 진단 정확도 연구: 하나의 검사(지표 검사, index test)를 기준 검사와 비교 | 참가자 모집 경로와 장소(스펙트럼, H1), 지표 검사와 기준 검사의 상세와 판독 눈가림, 참가자 흐름도, 기준 검사별 교차표, 정확도 추정치의 신뢰구간, 의도한 임상적 역할 |
| CLAIM (Mongan 등 2020, 2024 개정) | 의료 영상 AI 연구 | 영상 자료원과 전처리, 정답(ground truth) 정의, 자료 분할 단위, 모델 구조·학습 세부, 외부 평가 |

고르는 법: 여러 변수를 결합해 **위험 확률**을 내는 모델이면 TRIPOD+AI, 하나의 **검사(또는 고정된 알고리즘 출력)의 정확도**를 기준 검사와 비교하면 STARD, 영상이 입력이면 CLAIM을 추가로 봅니다. 연구의 위험 편향을 평가하는 쪽에서는 PROBAST(Wolff 등 2019)가 예측 모델 연구의 점검 도구로 쓰입니다. 지침은 "좋은 연구를 했다"는 인증이 아니라 독자가 판단할 재료를 빠뜨리지 않았는지 보는 목록이며, 항목 문구는 원문을 직접 읽고 씁니다.

### 의료기기 소프트웨어: 무엇이 위험을 정하는가

[Day G7](../G-ai-biomed/day-G7.md)에서 EU AI Act, FDA의 AI 기기 목록, GMLP 원칙을 봤습니다. 그 바탕에 있는 공통 개념이 **의료기기 소프트웨어(Software as a Medical Device, SaMD)** 입니다. 국제의료기기규제당국포럼(IMDRF)의 정의로는, 하드웨어 기기의 일부가 아니면서 그 자체로 의료 목적(진단, 예방, 감시, 치료 등)을 수행하도록 의도된 소프트웨어입니다. "의도된 용도"가 핵심이라, 같은 코드라도 연구용 탐색 도구인지 진료 결정에 쓰는 도구인지에 따라 규제 대상 여부가 달라집니다.

IMDRF의 위험 분류 틀은 두 축을 곱하는 발상입니다.

- **정보의 중요도:** 소프트웨어 출력이 치료·진단을 직접 결정하는가, 임상 관리를 이끄는가, 참고 정보만 주는가.
- **의료 상황의 위중도:** 위급한(critical) 상황인가, 심각한(serious) 상황인가, 그렇지 않은가.

둘 다 높을수록 위험 등급이 올라가고 요구되는 증거(임상 평가, 시판 후 감시)가 많아집니다. 각 나라 규제기관(미국 FDA, 한국 식품의약품안전처 등)은 이런 틀을 바탕으로 자국 규정을 둡니다. 구체적인 등급과 절차는 각 기관의 최신 공식 문서에서 확인해야 하며, 이 레슨은 개념만 다룹니다. 이 과정의 결과물은 어떤 규제 승인과도 관계없는 **교육용 탐색 분석**이고, 모델 카드에도 그렇게 씁니다.

### 미니 프로젝트의 원칙

오늘 만드는 것은 "조기 선별 모델"이 아니라 **"이 가상 자료에서의 조기 선별 baseline"** 입니다. H1의 카드로 보면, PADS와 같은 모양의 자료(한 사람 = 한 줄, 건강 대조군·PD·다른 운동장애가 섞인 진단군 구조, [Day 24](../../week-4/day-24.md)–[Day 25](../../week-4/day-25.md))는 **이미 진단받은 사람**의 횡단면 자료입니다. 그래서 전구기 예측의 증거가 될 수 없고, 같은 절차를 미래의 전향적 자료에 적용할 준비 연습입니다. 이 한계를 모델 카드 맨 위에 씁니다.

## 예시로 이해하기 — 미니 프로젝트

PADS의 실제 값을 쓰지 않고, 모양만 닮은 가상 참가자 표를 만듭니다. 특징 이름(안정 시 떨림, 좌우 비대칭, 움직임 매끄러움)과 효과 크기는 모두 가상입니다. 결과는 "PD vs PD가 아닌 사람(건강 + 다른 운동장애)"입니다. 1기 자료로 개발하고, 펌웨어가 바뀐 2기 자료로 시간적 검증을 합니다.

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import roc_auc_score, brier_score_loss

rng = np.random.default_rng(42)

def cohort(n, period, gain):
    """PADS와 같은 '모양'의 가상 참가자 표: 한 사람 = 한 줄, 진단군 3개. 값은 모두 가상."""
    group = rng.choice(["Healthy", "PD", "Other"], size=n, p=[0.30, 0.45, 0.25])
    age = rng.normal(np.select([group == "PD", group == "Other"], [67, 64], 61), 9)
    female = rng.integers(0, 2, n)
    pd_ = (group == "PD").astype(float); oth = (group == "Other").astype(float)
    rest_tremor = gain * (0.9 * pd_ + 0.5 * oth + rng.normal(0, 1, n))       # 안정 시 떨림 세기(가상 단위)
    asymmetry = 0.7 * pd_ + 0.1 * oth + rng.normal(0, 1, n)                  # 좌우 손목 차이
    smoothness = -0.5 * pd_ - 0.4 * oth - 0.02 * (age - 63) + rng.normal(0, 1, n)
    return pd.DataFrame({"period": period, "group": group, "age": age.round(1), "female": female,
                         "rest_tremor": rest_tremor, "asymmetry": asymmetry, "smoothness": smoothness,
                         "y": pd_.astype(int)})

dev = cohort(450, "1기", gain=1.0)
tmp = cohort(150, "2기", gain=1.4)          # 2기: 시계 펌웨어가 바뀌어 떨림 값이 1.4배로 찍힌다고 가정
X = ["age", "female", "rest_tremor", "asymmetry", "smoothness"]
print(pd.concat([dev, tmp]).groupby(["period", "group"]).size().unstack())

# 1) 표본 수 점검(H2): 후보 변수 5개, 유병률은 개발 자료에서
prev = dev.y.mean()
lnL0 = prev * np.log(prev) + (1 - prev) * np.log(1 - prev)
r2cs = 0.15 * (1 - np.exp(2 * lnL0))
n_min = 5 / ((0.9 - 1) * np.log(1 - r2cs / 0.9))
print(f"\n개발 n={len(dev)}, PD 비율 {prev:.2f} | 기준 1(축소 0.9)의 최소 n ≈ {np.ceil(n_min):.0f}")

# 2) 내부 검증(H3): 5-fold 교차검증 예측으로 판별·보정
model = make_pipeline(StandardScaler(), LogisticRegression())
p_cv = cross_val_predict(model, dev[X], dev.y, cv=StratifiedKFold(5, shuffle=True, random_state=0),
                         method="predict_proba")[:, 1]
def logit(p):
    p = np.clip(p, 1e-6, 1 - 1e-6); return np.log(p / (1 - p))
def summary(name, y, p):
    y = np.asarray(y); lp = logit(p)
    boots = [roc_auc_score(y[i], p[i]) for i in (rng.integers(0, len(y), len(y)) for _ in range(1000))
             if y[i].min() != y[i].max()]
    lo, hi = np.percentile(boots, [2.5, 97.5])
    slope = sm.Logit(y, sm.add_constant(lp)).fit(disp=0).params[1]
    citl = sm.GLM(y, np.ones((len(y), 1)), family=sm.families.Binomial(), offset=lp).fit().params[0]
    print(f"{name:12s} AUC {roc_auc_score(y, p):.3f} ({lo:.3f}–{hi:.3f}) | Brier {brier_score_loss(y, p):.3f}"
          f" | 절편 {citl:+.2f} 기울기 {slope:.2f}")
summary("내부 5-fold", dev.y, p_cv)

# 3) 시간적 검증(H6): 1기로 최종 모델, 2기에 적용
model.fit(dev[X], dev.y)
p_tmp = model.predict_proba(tmp[X])[:, 1]
summary("2기(시간적)", tmp.y, p_tmp)

# 4) 진단군별 위양성(H1의 스펙트럼): 임계값 0.5에서 PD가 아닌 사람을 양성으로 판정한 비율
for g in ["Healthy", "Other"]:
    mask = (dev.group == g).values
    print(f"내부 CV, {g:7s} 중 양성 판정 비율 {(p_cv[mask] >= 0.5).mean():.2f} (n={mask.sum()})")

# 5) 순 이득(H4): 2기 자료, 임계 확률 몇 개
def net_benefit(y, p, pt):
    y = np.asarray(y); pos = p >= pt
    return (np.sum(pos & (y == 1)) - np.sum(pos & (y == 0)) * pt / (1 - pt)) / len(y)
for pt in [0.2, 0.4, 0.6]:
    allnb = tmp.y.mean() - (1 - tmp.y.mean()) * pt / (1 - pt)
    print(f"pt {pt:.1f} | 모델 {net_benefit(tmp.y, p_tmp, pt):+.3f} | 모두 양성 {allnb:+.3f} | 아무도 0")
```

출력:

```text
group   Healthy  Other   PD
period                     
1기          141    118  191
2기           41     42   67

개발 n=450, PD 비율 0.42 | 기준 1(축소 0.9)의 최소 n ≈ 378
내부 5-fold    AUC 0.798 (0.755–0.838) | Brier 0.180 | 절편 +0.01 기울기 0.96
2기(시간적)      AUC 0.768 (0.685–0.842) | Brier 0.199 | 절편 -0.34 기울기 0.70
내부 CV, Healthy 중 양성 판정 비율 0.18 (n=141)
내부 CV, Other   중 양성 판정 비율 0.32 (n=118)
pt 0.2 | 모델 +0.308 | 모두 양성 +0.308 | 아무도 0
pt 0.4 | 모델 +0.218 | 모두 양성 +0.078 | 아무도 0
pt 0.6 | 모델 +0.053 | 모두 양성 -0.383 | 아무도 0
```

단계별로 읽습니다.

1. **표본 수(H2):** 후보 변수 5개, PD 비율 0.42에서 기준 1의 최소 n은 약 378명이고 개발 자료는 450명입니다. 기준을 넘지만 여유가 크지 않습니다. 후보 변수를 더 늘렸다면 부족했을 것입니다. (H2의 `riley_binary(5, 191/450)`로 확인하면 기준 2는 125명, 기준 3은 376명으로, 기준 1과 3이 거의 같은 크기로 최소 n을 정합니다.)
2. **내부 검증(H3):** 5-fold 교차검증 AUC 0.798(0.755–0.838), 절편 +0.01, 기울기 0.96. 이 자료 안에서는 과적합이 작고 보정도 맞습니다.
3. **시간적 검증(H6):** 2기에서 AUC 0.768(0.685–0.842), 절편 −0.34, 기울기 0.70. 펌웨어 변경으로 떨림 값이 크게 찍혀 예측이 극단적이 되었습니다. 2기는 150명뿐이라 AUC 구간이 넓습니다.
4. **진단군별 위양성(H1의 스펙트럼):** 임계값 0.5에서 건강 대조군의 18%, 다른 운동장애의 32%가 양성으로 판정됩니다. "PD가 아닌 사람" 안에서도 감별 대상 질환에서 위양성이 거의 두 배입니다. 실제 의뢰 클리닉처럼 감별 대상이 많은 곳에서는 성능이 더 나쁠 것입니다.
5. **순 이득(H4):** p_t = 0.2에서는 모델과 "모두 양성"이 같고(+0.308), 0.4와 0.6에서는 모델이 낫습니다. 그런데 이 자료의 PD 비율(1기 0.42, 2기 약 0.45)은 연구자가 모은 비율이지 선별 대상 집단의 유병률이 아닙니다. 유병률이 훨씬 낮은 실제 선별 집단에서는 이 순 이득 숫자를 그대로 쓸 수 없습니다(H1 예시 1).

이 다섯 줄이 미니 프로젝트의 **결과**이고, 그중 무엇도 "이 모델로 PD를 조기 진단할 수 있다"는 결론을 지지하지 않습니다. 지지하는 결론은 "이 가상 자료에서 이 특징들로 만든 로지스틱 회귀 baseline은 내부적으로 중간 정도의 판별과 양호한 보정을 보였고, 측정 변화가 있는 시기에는 보정이 무너졌다" 정도입니다.

## 직접 해보기

1. `notebooks/advanced/H/H7_project.ipynb`에서 미니 프로젝트 코드를 실행하고 출력이 위와 같은지 확인합니다.
2. 2기 자료로 절편+기울기 재보정을 합니다(H6 예시 2). 2기 150명을 75명씩 나눠 한쪽으로 재보정하고 다른 쪽으로 평가합니다. 재보정 후 숫자를 적고, 75명으로 한 평가가 얼마나 불확실한지 부트스트랩 구간으로 보입니다.
3. 결과 정의를 바꿔 봅니다. 다른 운동장애를 제외하고 "PD vs 건강 대조군"만으로 다시 실행하면 AUC가 어떻게 되나요? H1의 스펙트럼 편향과 연결해 두 문장으로 씁니다.
4. `reports/advanced/H/H7_model_card.md`에 모델 카드를 씁니다. 아래 뼈대를 채웁니다.

   ```markdown
   # 모델 카드 — 가상 웨어러블 특징 기반 PD 선별 baseline (교육용)

   > 이 모델은 가상 데이터로 만든 교육용 탐색 분석이며, 진단·선별·치료 결정에 쓰지 않는다.
   > 어떤 규제 승인과도 관계없다.

   ## 1. 의도한 용도와 쓰지 말아야 할 곳
   - 의도: H2–H6 평가 절차를 연습하기 위한 baseline
   - 쓰지 말 것: 개인 진단, 실제 선별, 전구기 위험 안내

   ## 2. 문제 정의 (H1 카드)
   대상 집단 / 예측 시점 / 결과와 기준 검사 / 쓰임새

   ## 3. 자료
   출처(가상, PADS와 같은 모양), 진단군 구성 표, 1기·2기 구분, 표본 수 근거(H2)

   ## 4. 모델
   특징 5개, 전처리(표준화), 로지스틱 회귀, 하이퍼파라미터(기본값)

   ## 5. 성능 (불확실성 포함)
   | 검증 | AUC (95% CI) | 보정 절편 | 보정 기울기 | Brier |
   |---|---|---|---|---|
   | 내부 5-fold | | | | |
   | 2기 시간적 | | | | |
   진단군별 위양성, 결정 곡선 요약, 하위집단 표(성별·연령대)

   ## 6. 한계
   - 진단 후 횡단면 자료라 전구기 예측의 증거가 아님
   - 표본 유병률이 선별 집단과 다름 → PPV·순 이득을 옮길 수 없음
   - 측정(펌웨어) 변화에 보정이 민감함
   - 외부 기관 검증 없음

   ## 7. 보고 점검 (TRIPOD+AI 핵심 항목 간이 점검)
   항목 | 다룬 곳 | 빠진 것
   ```

5. 모델 카드 7절에 TRIPOD+AI 원문을 보며 핵심 항목 10개를 골라 "다룬 곳 / 빠진 것"을 채웁니다. 이 점검은 공식 점검표를 대신하지 않는다고 적습니다.
6. 실제 PADS를 받아 둔 경우(선택): 같은 절차를 실제 참가자 표와 여러분이 만든 특징에 적용합니다. 실제 자료로 얻은 숫자는 위 가상 숫자와 다르며, PADS 저자들의 분석(Varghese 등 2024)과 숫자를 비교할 때는 결과 정의와 분할 방식이 같은지 먼저 확인합니다.

⚠️ **흔한 오류 1 — 교차검증 예측으로 임계값을 고르고 같은 예측으로 성능을 보고한다**
임계값 선택도 개발 과정입니다. 임계값을 고를 계획이면 교차검증 안쪽에서 고르거나, H3처럼 비용 비율로 미리 정합니다.

⚠️ **흔한 오류 2 — 모델 카드에 내부 검증 숫자만 쓴다**
외부·시간적 검증이 없으면 "없음"이라고 쓰고, 그래서 무엇을 주장할 수 없는지 한계에 적습니다. 빈칸을 숨기지 않는 것이 모델 카드의 목적입니다.

## 퀴즈

**1.** (객관식) 혈액 검사 하나의 정확도를 영상 기준 검사와 비교한 연구에 가장 맞는 보고 지침은?
① TRIPOD+AI ② STARD 2015 ③ CLAIM ④ CONSORT-AI

<details><summary>정답 보기</summary>

②. 하나의 지표 검사를 기준 검사와 비교하는 진단 정확도 연구입니다. 여러 변수를 결합한 위험 모델이면 TRIPOD+AI, 영상 AI면 CLAIM, AI 개입의 임상시험이면 CONSORT-AI입니다.

</details>

**2.** (단답) IMDRF의 SaMD 위험 분류에서 위험 등급을 정하는 두 축은?

<details><summary>정답 보기</summary>

소프트웨어가 주는 정보가 의료 결정에서 차지하는 중요도(치료·진단 / 임상 관리 유도 / 정보 제공)와 의료 상황의 위중도(위급 / 심각 / 비심각)입니다.

</details>

**3.** (객관식) 미니 프로젝트 결과로 쓸 수 있는 문장은?
① 이 모델은 PD를 조기 진단한다
② 이 모델은 선별 검사로 쓸 수 있다
③ 이 가상 자료에서 이 baseline은 내부 검증 AUC 0.80(95% CI 0.76–0.84)을 보였고, 측정 변화가 있는 시기에 보정이 나빠졌다
④ 이 모델의 PPV는 실제 인구에서도 같다

<details><summary>정답 보기</summary>

③. 범위(이 가상 자료), 크기(AUC), 불확실성(구간), 한계(보정 변화)를 함께 담은 문장입니다. 나머지는 자료가 지지하지 않는 주장입니다.

</details>

**4.** (단답) 미니 프로젝트 자료가 전구기 예측의 증거가 될 수 없는 이유는?

<details><summary>정답 보기</summary>

이미 진단받은 사람과 대조군을 같은 시점에 측정한 횡단면 자료라서, 진단 **이전** 기준 시점의 측정과 이후의 발병 추적이 없기 때문입니다(H1의 예측 시점과 결과 정의).

</details>

**5.** (객관식) 다른 운동장애 진단군에서 위양성 비율이 건강 대조군보다 높았다는 결과가 시사하는 것은?
① 모델이 완벽하다
② 감별 대상이 많은 실제 진료 환경에서는 성능이 더 나쁠 수 있다
③ 다른 운동장애 참가자를 자료에서 빼야 한다
④ 임계값과 무관하다

<details><summary>정답 보기</summary>

②. 스펙트럼 편향의 신호입니다. 감별 대상 진단군을 빼면 숫자는 좋아지지만 실제 쓰임새에서 더 멀어집니다. 오히려 그 진단군의 성능을 따로 보고해야 합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 미니 프로젝트 코드가 실행되고 출력이 위와 같다.
- [ ] 2기 재보정과 "PD vs 건강 대조군" 비교 결과를 적었다.
- [ ] `reports/advanced/H/H7_model_card.md`에 1–7절이 모두 채워져 있고, 맨 위에 교육용·비진단 문구가 있다.
- [ ] TRIPOD+AI 핵심 항목 10개의 간이 점검표가 있다.
- [ ] `learning-log.md`에 기록하고 commit했다.

## 더 읽을거리
- Collins GS, et al. TRIPOD+AI statement: updated guidance for reporting clinical prediction models that use regression or machine learning methods. *BMJ.* 2024;385:e078378. doi:[10.1136/bmj-2023-078378](https://doi.org/10.1136/bmj-2023-078378)
- Bossuyt PM, et al. STARD 2015: an updated list of essential items for reporting diagnostic accuracy studies. *BMJ.* 2015;351:h5527. doi:[10.1136/bmj.h5527](https://doi.org/10.1136/bmj.h5527)
- Mongan J, Moy L, Kahn CE Jr. Checklist for Artificial Intelligence in Medical Imaging (CLAIM): a guide for authors and reviewers. *Radiol Artif Intell.* 2020;2:e200029. doi:[10.1148/ryai.2020200029](https://doi.org/10.1148/ryai.2020200029) · Tejani AS, et al. CLAIM: 2024 update. *Radiol Artif Intell.* 2024;6. doi:[10.1148/ryai.240300](https://doi.org/10.1148/ryai.240300)
- Wolff RF, et al. PROBAST: a tool to assess the risk of bias and applicability of prediction model studies. *Ann Intern Med.* 2019;170:51–58. doi:[10.7326/M18-1376](https://doi.org/10.7326/M18-1376)
- Varghese J, et al. Machine learning in the Parkinson's disease smartwatch (PADS) dataset. *npj Parkinsons Dis.* 2024;10. doi:[10.1038/s41531-023-00625-7](https://doi.org/10.1038/s41531-023-00625-7)
- IMDRF. *Software as a Medical Device (SaMD): Key Definitions* (2013), *Possible Framework for Risk Categorization and Corresponding Considerations* (2014). IMDRF 공식 사이트(imdrf.org)의 문서 목록에서 검색하세요(이 레슨 작성 시 사이트 접속을 확인하지 못함).

---
[← 이전](day-H6.md) · [코스 지도](../../../README.md) · [다음: 코스 지도 →](../../../README.md)
