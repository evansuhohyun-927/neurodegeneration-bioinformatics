# Day E6 — 예측 모델과 검증: 판별, 보정, 시간적 외부 검증, 누수

> **주차:** 심화 파트 E — EHR 2차 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/E/E6_prediction.ipynb`, `figures/advanced/E/E6_calibration.png`
>
> **먼저 끝내 둘 레슨:** Day E4, Day 32 (로지스틱 회귀 baseline), Day 33 (GroupKFold와 데이터 누수), Day 34 (평가 지표 해석).

## 오늘의 목표
- 판별(discrimination, AUC)과 보정(calibration, 예측 위험이 실제 위험과 맞는가)의 차이를 설명하고, 보정 절편·기울기와 10분위 표로 보정을 점검할 수 있다.
- 무작위 분할 대신 **시간 순서로 나눈 검증**(앞 연도로 개발, 뒤 연도로 검증)을 하고, 진료 변화와 측정법 변경이 성능에 주는 영향을 읽을 수 있다.
- 예측 시점 이후의 정보가 특징에 섞이는 누수를 찾아내고, 재보정이 고칠 수 있는 것과 없는 것을 구분할 수 있다.

## 🎬 영상으로 먼저 보기

- [Building and validating prediction models — NIHR Maudsley Biomedical Research Centre (BRC)](https://www.youtube.com/watch?v=ZRf0scPfrVQ) (10:23)
- **무엇에 주목할까:** 임상 예측 모델의 개발–내부 검증–외부 검증 순서와, "외부"가 다른 병원뿐 아니라 다른 시기도 될 수 있다는 점을 들으세요. 예시 1이 바로 시기를 바꾼 검증입니다.

- [Model Calibration - Brier Score Explained — DataMListic](https://www.youtube.com/watch?v=BiaebXlgfNQ) (9:47)
- **무엇에 주목할까:** 예측 확률이 "70%라고 한 환자 중 실제로 70%에게 사건이 일어나는가"를 보는 것이 보정입니다. Brier 점수가 판별과 보정을 함께 담는 숫자라는 점을 기억하세요.

## 개념 설명

### 판별과 보정: 순서를 맞히는 것과 숫자를 맞히는 것

Day 34에서 본 AUC는 **판별**, 즉 "사건이 생긴 환자에게 생기지 않은 환자보다 높은 점수를 주는가"를 잽니다. 순서만 봅니다. 모든 예측 확률을 절반으로 줄여도 순서는 그대로라 AUC는 바뀌지 않습니다. 그런데 임상에서 위험 예측은 숫자 자체로 쓰입니다. "사망 위험 40%"라는 말에 따라 보호자와 상의하고 병상을 배정합니다. 그 숫자가 실제로는 20%라면 판별이 좋아도 해롭습니다.

**보정(calibration)** 은 예측 확률이 실제 비율과 맞는지를 봅니다. 날씨 예보 비유가 정확합니다. "비 올 확률 30%"라고 한 날들을 모아 보면 실제로 30%쯤 비가 와야 좋은 예보입니다. 점검 방법은 셋입니다.

- **전체 수준(calibration-in-the-large):** 평균 예측 위험과 실제 사건 비율이 같은가. 보정 절편(calibration intercept)으로 요약하며 0이 이상적입니다. 음수면 과대 예측입니다.
- **보정 기울기(calibration slope):** 예측의 logit에 실제 결과를 회귀한 기울기. 1이 이상적이고, 1보다 작으면 예측이 너무 극단적(과적합의 흔한 신호), 크면 너무 소심합니다.
- **보정 그림/표:** 예측 위험 10분위별로 평균 예측 vs 실제 비율을 그립니다. 대각선에 붙어 있어야 합니다.

Hosmer–Lemeshow 검정도 보정을 보는 고전적 방법이지만, 표본이 크면 사소한 차이에도 유의해지고 작으면 아무것도 못 잡아서, 요즘은 위의 그림과 절편·기울기를 함께 보고하는 쪽을 권합니다(Van Calster et al. 2019). **Brier 점수**는 예측 확률과 실제 결과(0/1)의 평균 제곱 차이로, 판별과 보정을 함께 반영합니다.

### 검증의 사다리: 무작위 분할 → 시간 분할 → 다른 병원

예측 모델의 성능은 **처음 보는 환자**에게서 재야 합니다(Day 33). EHR에서는 "처음 본다"의 뜻이 여러 층입니다.

1. **내부 검증:** 같은 데이터에서 교차검증이나 무작위 분할. 같은 사람의 여러 입실이 훈련·시험에 갈라지지 않도록 **환자 단위**로 나눕니다(Day 33의 GroupKFold).
2. **시간적 검증(temporal validation):** 앞 연도로 개발하고 뒤 연도로 검증합니다. 모델이 실제로 쓰일 상황(과거 자료로 만들어 미래 환자에게 씀)을 가장 닮았습니다.
3. **외부 검증(external validation):** 다른 병원이나 다른 지역. 가장 엄격합니다.

EHR 데이터는 시간이 지나며 변합니다. 진료 지침이 바뀌어 같은 환자의 사망 위험이 줄고, 검사 장비가 바뀌어 같은 환자의 값이 다르게 찍히고, 코드 체계가 바뀝니다(예: ICD-9에서 ICD-10으로). 이를 **데이터셋 이동(dataset shift)** 이라 합니다. 무작위 분할은 이 변화를 훈련·시험 양쪽에 고르게 섞어 버려 문제를 숨깁니다. 비식별화로 날짜가 이동된 MIMIC 계열에서는 실제 시기를 `anchor_year_group` 같은 구간 정보로만 알 수 있어, 시간적 검증을 설계할 때 이 제약을 문서에서 확인해야 합니다.

### 누수: 미래가 특징에 섞일 때

Day 33의 누수는 "같은 사람이 시험지에도 있다"였습니다. EHR에서는 **시간 누수**가 더 흔하고 더 교묘합니다. 예측 시점(예: 입실 24시간) 이후에야 생기는 정보가 특징에 들어가는 경우입니다.

- 퇴원 시 확정된 진단 코드(입원 중에는 몰랐던 정보)
- 재원 기간 전체의 검사 횟수나 최댓값
- 예측 시점 이후에 결과가 올라온 검사(Day E4 예시 3)
- 사망이 임박했을 때 내려지는 오더(예: 연명 치료 중단·완화 치료 오더). 결과의 **원인**이 아니라 **결과에 대한 의료진의 판단**이 기록된 것입니다.

누수의 신호는 "너무 좋은" 성능, 그리고 특징 중요도 상위에 임상적으로 이상한 변수가 있는 것입니다. 특징마다 "이 값은 예측 시점에 화면에 있었나?"를 묻는 표를 만드는 것이 가장 확실한 예방입니다.

### 재보정과 모델 갱신, 그리고 경보 문턱

시간적 검증에서 판별은 괜찮은데 보정이 틀어졌다면, 최근 자료로 **절편과 기울기만 다시 맞추는 재보정(recalibration)** 이 흔한 처방입니다. 판별(순서)은 그대로 두고 숫자만 고칩니다. 판별까지 떨어졌다면 특징과 모델을 다시 만들어야 합니다. 변화가 계속되는 환경에서는 한 번의 재보정도 곧 낡으므로, 정기적인 성능 감시 계획이 모델의 일부입니다.

경보처럼 문턱을 넘으면 사람이 움직이는 도구라면, AUC 하나보다 **정해진 문턱에서의** 민감도, 양성 예측도(PPV), 그리고 하루 경보 건수가 더 중요합니다. 사건이 드물면 AUC가 좋아도 경보 대부분이 거짓일 수 있고, 거짓 경보가 많으면 사람들이 경보를 무시하게 됩니다(alarm fatigue). 문턱은 임상적 손익(놓쳤을 때의 피해 vs 거짓 경보의 비용)으로 정합니다.

## 예시로 이해하기

세 예시는 같은 가상 자료를 씁니다. 2013–2020년 입원 12,000건이며, 두 가지 변화를 일부러 넣었습니다. 해마다 같은 환자의 사망 위험이 조금씩 낮아지고(진료 개선), 2018년부터 젖산 측정법이 바뀌어 같은 환자의 값이 25% 높게 찍힙니다.

### 예시 1 — 무작위 분할 vs 시간 분할, 그리고 보정 표

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, brier_score_loss

rng = np.random.default_rng(6)
n = 12000
year = rng.integers(2013, 2021, n)
age = rng.normal(66, 14, n)
sofa = np.clip(rng.poisson(4.5, n), 0, 20)
lact_true = np.exp(0.3 + 0.07 * sofa + rng.normal(0, 0.3, n))
lact_meas = np.where(year >= 2018, lact_true * 1.25, lact_true)   # 측정법 변경: 같은 환자, 25% 높게
drift = -0.12 * (year - 2013)
died = rng.random(n) < 1 / (1 + np.exp(-(-3.4 + drift + 0.03 * (age - 66) + 0.28 * sofa + 0.6 * np.log(lact_true))))
df = pd.DataFrame({"year": year, "age": age, "sofa": sofa, "log_lact": np.log(lact_meas), "died": died.astype(int)})
X = ["age", "sofa", "log_lact"]

def calib(y, p):
    lp = np.log(p / (1 - p))
    slope = sm.Logit(y, sm.add_constant(lp)).fit(disp=0).params.iloc[1]
    citl = sm.GLM(y, np.ones((len(y), 1)), family=sm.families.Binomial(), offset=lp).fit().params.iloc[0]
    return citl, slope

def report(name, y, p):
    citl, slope = calib(y, p)
    print(f"{name:22s} AUC {roc_auc_score(y, p):.3f} | Brier {brier_score_loss(y, p):.4f} | "
          f"관찰 {y.mean():.3f} vs 예측 {p.mean():.3f} | 보정 절편 {citl:+.2f} 기울기 {slope:.2f}")

rand = rng.random(n) < 0.7
m = LogisticRegression(max_iter=1000).fit(df.loc[rand, X], df.died[rand])
report("무작위 30% 시험", df.died[~rand], m.predict_proba(df.loc[~rand, X])[:, 1])
dev, val = df.year <= 2017, df.year >= 2019
m_t = LogisticRegression(max_iter=1000).fit(df.loc[dev, X], df.died[dev])
p_val = m_t.predict_proba(df.loc[val, X])[:, 1]
report("2013–17 개발→2019–20", df.died[val], p_val)

t = pd.DataFrame({"p": p_val, "y": df.died[val].values})
t["decile"] = pd.qcut(t.p, 10, labels=False) + 1
print(t.groupby("decile").agg(예측=("p", "mean"), 관찰=("y", "mean"), n=("y", "size")).round(3).iloc[[0, 4, 9]])
```

출력:

```text
무작위 30% 시험             AUC 0.712 | Brier 0.1043 | 관찰 0.130 vs 예측 0.126 | 보정 절편 +0.03 기울기 0.96
2013–17 개발→2019–20     AUC 0.721 | Brier 0.0833 | 관찰 0.090 vs 예측 0.157 | 보정 절편 -0.69 기울기 0.95
           예측     관찰    n
decile                   
1       0.037  0.020  299
5       0.114  0.060  299
10      0.419  0.244  299
```

무작위 분할에서는 모든 것이 좋아 보입니다. 보정 절편이 0에 가깝고 기울기도 1 근처입니다. 시간 분할에서는 AUC가 거의 같은데(0.721), 예측 사망률 평균이 15.7%로 실제 9.0%의 두 배 가까이 됩니다. 보정 절편 −0.69는 체계적인 과대 예측입니다. 10분위 표를 보면 가장 위험한 10%에게 모델은 42%를 예측했지만 실제 사망은 24%였습니다. 원인은 두 가지가 겹친 것입니다. 진료가 나아져 실제 위험이 줄었고, 측정법이 바뀌어 같은 환자의 젖산이 높게 찍혀 모델이 위험을 더 높게 읽었습니다.

Brier 점수가 시간 분할에서 오히려 **작은** 것에 주의하세요. 검증 연도의 사망률 자체가 낮아 Brier가 작아진 것이지 모델이 좋아진 것이 아닙니다. Brier는 사건 비율이 다른 집단 사이에서 직접 비교하지 않습니다.

### 예시 2 — 재보정: 숫자는 고치지만 순서는 그대로

2018년 자료(개발에도 검증에도 쓰지 않은 해)로 절편과 기울기만 다시 맞춥니다. 예시 1 다음 셀에 실행합니다.

```python
rec = df.year == 2018
p_rec = m_t.predict_proba(df.loc[rec, X])[:, 1]
lp_rec = np.log(p_rec / (1 - p_rec))
rc = sm.Logit(df.died[rec], sm.add_constant(lp_rec)).fit(disp=0).params
lp_val = np.log(p_val / (1 - p_val))
p_recal = 1 / (1 + np.exp(-(rc.iloc[0] + rc.iloc[1] * lp_val)))
report("재보정 후 2019–20", df.died[val], p_recal)
```

출력:

```text
재보정 후 2019–20          AUC 0.721 | Brier 0.0778 | 관찰 0.090 vs 예측 0.110 | 보정 절편 -0.24 기울기 0.94
```

AUC는 0.721로 그대로입니다. 재보정은 순서를 바꾸지 않기 때문입니다. 평균 예측이 15.7%에서 11.0%로 실제(9.0%)에 가까워졌고 보정 절편도 −0.69에서 −0.24로 줄었습니다. 다만 완전히 맞지는 않았습니다. 2018년 이후에도 진료 변화가 계속되었기 때문입니다(이 가상 세계에서는 매년). 재보정은 한 번으로 끝나는 일이 아니라 감시와 함께 가는 일입니다.

### 예시 3 — 누수 변수 하나가 만드는 "놀라운" 성능

사망한 환자의 60%(와 생존 환자의 3%)에게 내려진 가상의 "완화 치료 오더"를 특징으로 넣어 봅니다. 이 오더는 결과가 가까워졌다는 의료진의 판단이 기록된 것이라 예측 시점에는 존재하지 않습니다.

```python
df["comfort_care_order"] = ((df.died == 1) & (rng.random(n) < 0.6)) | (rng.random(n) < 0.03)
X_leak = X + ["comfort_care_order"]
m_l = LogisticRegression(max_iter=1000).fit(df.loc[dev, X_leak], df.died[dev])
report("누수 변수 포함", df.died[val], m_l.predict_proba(df.loc[val, X_leak])[:, 1])
```

출력:

```text
누수 변수 포함               AUC 0.871 | Brier 0.0527 | 관찰 0.090 vs 예측 0.128 | 보정 절편 -0.66 기울기 0.95
```

AUC가 0.72에서 0.87로 뛰었습니다. 논문 초록에 쓰고 싶어지는 숫자지만, 이 모델은 실제 사용 시점에는 쓸 수 없는 정보를 쓴 것입니다. 누수는 성능을 올리고, 보정 문제(절편 −0.66)는 그대로 남깁니다. "성능이 갑자기 좋아졌다"는 축하가 아니라 점검의 신호입니다.

## 직접 해보기

1. `notebooks/advanced/E/E6_prediction.ipynb`에서 예시 1–3을 실행합니다.
2. 보정 그림을 그립니다. 예시 2 다음 셀에 붙여 넣습니다.

   ```python
   import matplotlib.pyplot as plt
   from pathlib import Path

   out = Path("../../../figures/advanced/E"); out.mkdir(parents=True, exist_ok=True)
   plt.figure(figsize=(4.5, 4.5))
   for name, p in [("before recalibration", p_val), ("after recalibration", p_recal)]:
       g = pd.DataFrame({"p": p, "y": df.died[val].values})
       g["bin"] = pd.qcut(g.p, 10, labels=False)
       s = g.groupby("bin").agg(pred=("p", "mean"), obs=("y", "mean"))
       plt.plot(s.pred, s.obs, "o-", label=name)
   plt.plot([0, 0.5], [0, 0.5], "k--", lw=1, label="perfect")
   plt.xlabel("mean predicted risk"); plt.ylabel("observed proportion")
   plt.title("Temporal validation 2019–20")
   plt.legend(); plt.tight_layout()
   plt.savefig(out / "E6_calibration.png", dpi=150)
   plt.show()
   ```

3. 원인 분리 실험: 예시 1의 `lact_meas`를 만드는 줄에서 `1.25`를 `1.0`으로 바꿔(측정법 변경 없음) 다시 실행하고, 시간 분할의 보정 절편이 얼마나 줄어드는지 적습니다. 다음으로 `drift`의 `-0.12`를 `0.0`으로 바꿔 진료 변화를 없애 봅니다. 두 원인이 각각 얼마나 기여했는지 표로 정리하고 원래 값으로 돌립니다.
4. 문턱 정하기: 시간 분할 예측(`p_val`)에서 문턱 0.2, 0.3, 0.4마다 민감도, PPV, "경보 비율"(문턱을 넘은 환자 비율)을 계산하는 코드를 직접 써 봅니다. 힌트: `alert = p_val >= thr`, `y = df.died[val].values`.
5. 노트북 끝 Markdown 셀에 **특징 누수 점검표**를 만듭니다. Day E1의 질문으로 예측 모델을 만든다고 가정하고, 쓰고 싶은 특징 5개마다 "예측 시점에 화면에 있었나? (예/아니오/모름)"과 근거 열을 채웁니다.
6. `learning-log.md`에 기록하고 commit합니다.

⚠️ **흔한 오류 1 — `log(p / (1 - p))`에서 `inf`나 경고가 나온다**
예측 확률이 정확히 0 또는 1이면 logit이 무한대가 됩니다. `p = np.clip(p, 1e-6, 1 - 1e-6)`로 양 끝을 살짝 잘라 계산합니다. 확률이 0이나 1로 나오는 것 자체가 누수나 과적합의 신호일 수 있으니 원인도 확인합니다.

⚠️ **흔한 오류 2 — 시간 분할을 했는데 같은 환자가 양쪽에 있다**
2017년과 2019년에 모두 입원한 사람이 있으면 개발·검증에 같은 사람이 들어갑니다. 시간 분할과 환자 단위 분할을 함께 적용하거나(예: 검증 기간에 처음 등장한 환자만 검증), 최소한 겹치는 환자 수를 보고합니다.

## 퀴즈

**1.** (객관식) 모든 예측 확률을 절반으로 줄이면 어떻게 될까요?
① AUC와 보정이 모두 그대로다
② AUC는 그대로, 보정은 바뀐다
③ AUC는 바뀌고 보정은 그대로다
④ 둘 다 바뀐다

<details><summary>정답 보기</summary>

②. AUC는 순서만 보므로 단조 변환(모두 절반으로)에 영향을 받지 않습니다. 하지만 예측 숫자가 실제 비율과 맞는지(보정)는 크게 바뀝니다. 판별과 보정을 따로 보고해야 하는 이유입니다.

</details>

**2.** (단답) 예시 1에서 보정 절편이 −0.69였습니다. 무슨 뜻인가요?

<details><summary>정답 보기</summary>

모델이 전반적으로 위험을 과대 예측한다는 뜻입니다(평균 예측 15.7% vs 실제 9.0%). 보정 절편은 0이 이상적이며, 음수면 과대 예측, 양수면 과소 예측입니다.

</details>

**3.** (객관식) 무작위 분할 검증이 좋은데 시간 분할 검증에서 보정이 무너졌습니다. 가장 그럴듯한 설명은?
① 표본이 너무 커서
② 시간이 지나며 진료 방식·측정 방법·환자 구성이 바뀌어(데이터셋 이동), 과거 자료의 관계가 미래에 그대로 맞지 않아서
③ 로지스틱 회귀가 원래 보정을 못 해서
④ 무작위 분할이 잘못된 방법이라서

<details><summary>정답 보기</summary>

②. 무작위 분할은 변화를 훈련·시험에 고르게 섞어 숨깁니다. 시간 분할은 모델이 실제로 쓰일 상황(과거로 만들어 미래에 씀)을 흉내 내서 이 문제를 드러냅니다.

</details>

**4.** (단답) 재보정 후 AUC가 바뀌지 않은 이유는?

<details><summary>정답 보기</summary>

재보정은 예측 logit에 같은 절편과 기울기를 적용하는 단조 변환이라 환자들 사이의 순서를 바꾸지 않습니다. 숫자의 크기만 조정하므로 판별(AUC)은 그대로이고 보정만 달라집니다.

</details>

**5.** (객관식) 다음 중 입실 24시간 시점 사망 예측 모델의 특징으로 쓰면 **누수**인 것은?
① 입실 전 진단된 만성 질환 코드
② 입실 후 24시간 안에 채혈되고 결과가 올라온 젖산
③ 퇴원 요약지의 최종 진단 코드
④ 나이

<details><summary>정답 보기</summary>

③. 퇴원 요약지의 진단은 입원이 끝난 뒤 확정된 정보로, 예측 시점에는 알 수 없었습니다. ①②④는 예측 시점에 이미 존재하던 정보입니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3이 실행되고, 출력이 위와 같다.
- [ ] `figures/advanced/E/E6_calibration.png`에 재보정 전후 보정 곡선이 있다.
- [ ] 측정법 변경과 진료 변화의 기여를 나눈 실험 표가 있다.
- [ ] 문턱 3개에서 민감도·PPV·경보 비율을 계산했다.
- [ ] 특징 누수 점검표(5개)가 노트북에 있다.
- [ ] `learning-log.md` 기록과 commit을 남겼다.

## 더 읽을거리
- MIT Critical Data. *Secondary Analysis of Electronic Health Records*. Springer, 2016 (CC BY-NC 4.0). [NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK543630/) · [Springer](https://doi.org/10.1007/978-3-319-43742-2). 17장(편향–분산, 검증), 20–21장(중환자 사망 예측, 판별과 보정, 재분류), 22장(조기 경보 점수와 경보 문턱), 27장(거짓 경보 줄이기, 환자 단위 분할), 29장(하이퍼파라미터 선택).
- Van Calster B et al. Calibration: the Achilles heel of predictive analytics. *BMC Medicine* 2019. doi:[10.1186/s12916-019-1466-7](https://doi.org/10.1186/s12916-019-1466-7) (PMID 31842878)

---
[← 이전](day-E5.md) · [코스 지도](../../../README.md) · [다음 →](day-E7.md)
