# Day E5 — 탐색 분석과 교란 통제: 회귀 보정, 성향점수, 민감도 분석

> **주차:** 심화 파트 E — EHR 2차 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/E/E5_confounding.ipynb`, `reports/advanced/E/E5_table1_balance.md` (Table 1과 균형 표), `figures/advanced/E/E5_love_plot.png`
>
> **먼저 끝내 둘 레슨:** Day E3, Day E4, Day 31 (교란변수), Day 32 (로지스틱 회귀), Day 39 (민감도 분석).

## 오늘의 목표
- 치료군과 비치료군의 기저 특성을 표준화 평균 차(SMD)로 비교한 Table 1을 만들고, 적응증에 의한 교란을 찾아낼 수 있다.
- 같은 질문을 단순 비교, 회귀 보정, 성향점수 매칭, 역확률 가중(IPW)으로 답하고, 각 방법이 추정하는 대상(전체 인구 vs 치료받은 사람)의 차이를 말할 수 있다.
- 매칭 기준(caliper) 바꾸기와 E-value로 결론이 얼마나 튼튼한지 점검할 수 있다.

## 🎬 영상으로 먼저 보기

- [Propensity score matching: an introduction — Ben Lambert](https://www.youtube.com/watch?v=h0UU6trKR0E) (5:10)
- **무엇에 주목할까:** 여러 교란변수를 "치료받을 확률" 하나로 요약하는 이유와, 그 확률이 비슷한 사람끼리 비교하면 무엇이 좋아지는지에 집중하세요. 짧은 영상이니 예시 3을 하기 직전에 한 번 더 봐도 좋습니다.

- (선택, 깊이 보기) [What is Target Trial Emulation? NIHR RSS Research Methods Academy Seminar Series — NIHR Research Support Service (RSS)](https://www.youtube.com/watch?v=eWImwOCZndU) (57:33)
- **무엇에 주목할까:** Day E3에서 본 "index time을 시험처럼 맞추기"가 교란 통제와 어떻게 합쳐지는지 보여 줍니다. 오늘 분량을 넘기므로 주말에 보세요.

## 개념 설명

### 적응증에 의한 교란: 아픈 사람이 치료를 받는다

EHR 비교 효과 연구에서 가장 흔하고 가장 강한 교란은 **적응증에 의한 교란(confounding by indication)** 입니다. 의사는 더 아픈 환자에게 더 적극적인 치료를 합니다. 그래서 단순 비교에서는 효과 있는 치료도 해로워 보이기 쉽습니다. 병원에서 수혈을 받은 환자의 사망률이 높은 것은 수혈이 위험해서라기보다 출혈이 심한 환자가 수혈을 받기 때문인 것과 같은 이치입니다.

첫 단계는 언제나 **Table 1**, 즉 군별 기저 특성 표입니다. 이때 p-value보다 **표준화 평균 차(standardized mean difference, SMD)** 를 봅니다. SMD는 두 군 평균의 차를 합친 표준편차로 나눈 값이라 단위와 표본 크기에 영향을 받지 않습니다. 관례적으로 |SMD| < 0.1이면 "균형이 잘 맞다"고 봅니다. p-value는 표본이 크면 사소한 차이에도 작아지므로 균형 판단에 맞지 않습니다.

교란변수 후보는 **index time 이전**에 측정된 것만 씁니다(Day E3). 치료 이후에 측정된 변수(치료가 바꿔 놓은 혈압 등)를 보정하면 치료 효과의 일부를 지워 버리는 과보정이 됩니다. 어떤 변수를 넣을지는 데이터에서 유의한 것을 고르는 것이 아니라, 원인 그림(DAG, Day 31)을 그려 임상 지식으로 정합니다.

### 네 가지 도구: 같은 교란, 다른 접근

1. **층화(stratification):** 중증도 층마다 따로 비교. 직관적이지만 변수가 많으면 층이 비어 버립니다.
2. **회귀 보정(regression adjustment):** 결과 모델에 치료와 교란변수를 함께 넣습니다. 로지스틱 회귀라면 "다른 변수가 같을 때" 치료의 조건부 odds ratio를 줍니다. 모델 모양(직선 관계, 상호작용)이 맞아야 합니다.
3. **성향점수 매칭(propensity score matching):** 먼저 "이 사람이 치료받을 확률"(성향점수)을 기저 변수로 추정하고, 확률이 비슷한 치료군·비치료군을 짝지어 비교합니다. 짝을 지을 때 허용하는 최대 거리를 **caliper**라 부르며, 흔히 성향점수 logit의 표준편차 0.2배를 출발점으로 씁니다. 매칭은 보통 **치료받은 사람들**에게서의 효과(ATT)를 추정합니다.
4. **역확률 가중(inverse probability weighting, IPW):** 치료군은 1/성향점수, 비치료군은 1/(1−성향점수)로 가중해 "모두가 치료받았다면 vs 아무도 안 받았다면"의 가상 인구를 만듭니다. 기본적으로 **전체 인구**에서의 평균 효과(ATE)를 추정합니다. 극단적인 가중치가 결과를 흔들 수 있어 안정화 가중치(stabilized weights)를 쓰고, 가중치 범위를 보고합니다.

성향점수는 결과(사망)를 보지 않고 만들기 때문에, 분석가가 "결과가 잘 나오는 모델"을 고르는 유혹에서 비교적 자유롭다는 장점이 있습니다. 그리고 매칭·가중 **후에** 다시 SMD로 균형을 확인하는 것이 필수입니다. 성향점수 모델의 정확도(AUC)가 아니라 균형이 기준입니다.

어떤 방법도 **측정하지 않은 교란변수**는 고치지 못합니다. 네 도구 모두 "필요한 교란변수가 다 측정되었다"는 같은 가정 위에 서 있습니다.

### 측정하지 않은 교란 앞에서: 다른 설계와 민감도 분석

측정된 변수만으로 부족해 보일 때 쓰는 설계들이 있습니다. 이름과 발상만 알아 두고, 필요할 때 더 읽습니다.

- **도구 변수(instrumental variable):** 치료를 받을 확률은 바꾸지만 결과에는 치료를 통해서만 영향을 주는 "자연 실험"(예: 병상 여유, 의사별 처방 습관)을 이용합니다. 가정이 강하고(특히 "치료를 통해서만"), 추정 대상이 "도구에 반응하는 사람들"로 좁아집니다.
- **환자 자신을 대조로 쓰는 설계(case-crossover):** 사건 직전의 노출을 같은 사람의 더 이른 시점 노출과 비교합니다. 사람마다 고정된 교란(유전, 만성질환)은 저절로 상쇄되지만, 노출이 짧게 오가고 결과가 급성일 때만 맞습니다.
- **음성 대조(negative control):** 치료와 관련이 없어야 하는 결과에서 "효과"가 나오면 남은 교란의 신호로 봅니다.

**민감도 분석**은 "가정을 바꿔도 결론이 버티는가"를 묻습니다(Day 39의 EHR판). 대표적으로 (1) 코호트 기준이나 노출 창을 합리적 범위에서 바꾸기, (2) caliper를 바꾸기, (3) 결측 처리 방법 바꾸기, (4) **E-value** 보고입니다. E-value는 "관찰된 연관을 완전히 없애려면, 측정하지 않은 교란변수가 치료와도 결과와도 위험비 몇 배 이상으로 연관되어 있어야 하는가"를 한 숫자로 줍니다. 크면 튼튼하고, 1에 가까우면 약한 교란으로도 뒤집힐 수 있다는 뜻입니다.

## 예시로 이해하기

네 예시는 같은 가상 코호트를 씁니다. 한 노트북에서 순서대로 실행하세요. 이 가상 세계에서 치료 A는 **사망을 줄이도록**(조건부 odds ratio exp(−0.40) ≈ 0.67) 만들었고, 동시에 SOFA 점수(장기부전 점수)와 젖산이 높은 환자가 치료를 더 받도록 만들었습니다.

### 예시 1 — Table 1과 SMD

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
p_treat = 1 / (1 + np.exp(-(-3.0 + 0.35 * sofa + 0.3 * np.log(lactate) + 0.01 * (age - 65))))
treat = rng.random(n) < p_treat
logit_death = -4.2 + 0.30 * sofa + 0.03 * (age - 65) + 0.5 * np.log(lactate) - 0.40 * treat
died = rng.random(n) < 1 / (1 + np.exp(-logit_death))
df = pd.DataFrame({"age": age, "sofa": sofa, "log_lactate": np.log(lactate),
                   "treat": treat.astype(int), "died": died.astype(int)})
covs = ["age", "sofa", "log_lactate"]

def smd(d, w=None):
    w = np.ones(len(d)) if w is None else w
    out = {}
    for c in covs:
        t, u = d.treat == 1, d.treat == 0
        m1, m0 = np.average(d[c][t], weights=w[t]), np.average(d[c][u], weights=w[u])
        v1 = np.average((d[c][t] - m1) ** 2, weights=w[t]); v0 = np.average((d[c][u] - m0) ** 2, weights=w[u])
        out[c] = round(float((m1 - m0) / np.sqrt((v1 + v0) / 2)), 3)
    return out

print(df.groupby("treat")[covs + ["died"]].mean().round(3))
print("SMD(보정 전):", smd(df))
```

출력:

```text
          age   sofa  log_lactate   died
treat                                   
0      64.123  4.684        0.670  0.099
1      67.533  6.430        0.832  0.137
SMD(보정 전): {'age': 0.263, 'sofa': 0.806, 'log_lactate': 0.473}
```

치료군은 평균 SOFA가 1.7점 높고(SMD 0.81), 젖산도 높고, 나이도 많습니다. 세 변수 모두 0.1 기준을 크게 넘습니다. 그리고 치료군의 사망률(13.7%)이 비치료군(9.9%)보다 높습니다. 이 숫자만 보고 "치료 A가 사망을 늘린다"고 쓰면, 정답(사망 감소)과 정반대의 결론이 됩니다.

### 예시 2 — 단순 비교 vs 회귀 보정

```python
X0 = sm.add_constant(df[["treat"]]); X1 = sm.add_constant(df[["treat"] + covs])
or_crude = np.exp(sm.Logit(df.died, X0).fit(disp=0).params["treat"])
fit = sm.Logit(df.died, X1).fit(disp=0)
ci = np.exp(fit.conf_int().loc["treat"])
print(f"단순 OR {or_crude:.2f} | 보정 OR {np.exp(fit.params['treat']):.2f} (95% CI {ci[0]:.2f}–{ci[1]:.2f}) | 진짜 조건부 OR {np.exp(-0.40):.2f}")
```

출력:

```text
단순 OR 1.45 | 보정 OR 0.66 (95% CI 0.52–0.83) | 진짜 조건부 OR 0.67
```

교란변수 세 개를 넣자 OR이 1.45(해로움)에서 0.66(이로움)으로 뒤집혔고 정답 0.67에 가까워졌습니다. 이 가상 세계에서는 **모든 교란변수를 측정했고 모델 모양도 정답과 같기 때문에** 잘 된 것입니다. 실제 데이터에서는 둘 다 보장되지 않습니다.

### 예시 3 — 성향점수 매칭과 caliper 바꾸기

```python
ps = LogisticRegression(C=1e6, max_iter=1000).fit(df[covs], df.treat).predict_proba(df[covs])[:, 1]
df["ps"] = ps
df["logit_ps"] = np.log(ps / (1 - ps))
print("성향점수 범위  치료군 %.2f–%.2f, 비치료군 %.2f–%.2f" %
      (ps[treat].min(), ps[treat].max(), ps[~treat].min(), ps[~treat].max()))

def match(d, caliper_sd):
    cal = caliper_sd * d.logit_ps.std()
    t = d[d.treat == 1].sample(frac=1, random_state=0)
    pool = d[d.treat == 0].copy()
    pairs = []
    for i, r in t.iterrows():
        if pool.empty: break
        dist = (pool.logit_ps - r.logit_ps).abs()
        j = dist.idxmin()
        if dist[j] <= cal:
            pairs.append((i, j)); pool = pool.drop(j)
    idx_t, idx_c = zip(*pairs)
    return d.loc[list(idx_t) + list(idx_c)]

for cal in [0.05, 0.2, 1.0]:
    m = match(df, cal)
    rd = m[m.treat == 1].died.mean() - m[m.treat == 0].died.mean()
    print(f"caliper {cal:>4} SD: 짝 {len(m)//2}쌍, 위험차 {rd:+.3f}, 매칭 후 SMD {smd(m.reset_index(drop=True))}")
```

출력:

```text
성향점수 범위  치료군 0.05–0.95, 비치료군 0.04–0.85
caliper 0.05 SD: 짝 1100쌍, 위험차 -0.044, 매칭 후 SMD {'age': 0.025, 'sofa': -0.008, 'log_lactate': 0.01}
caliper  0.2 SD: 짝 1107쌍, 위험차 -0.046, 매칭 후 SMD {'age': 0.029, 'sofa': -0.005, 'log_lactate': 0.007}
caliper  1.0 SD: 짝 1163쌍, 위험차 -0.032, 매칭 후 SMD {'age': 0.038, 'sofa': 0.063, 'log_lactate': 0.04}
```

먼저 성향점수 범위를 봅니다. 치료군의 최댓값(0.95)이 비치료군의 최댓값(0.85)보다 높습니다. 성향점수가 0.85를 넘는 치료군 환자에게는 비슷한 비치료군 짝이 없다는 뜻이고(공통 지지 영역 밖), 이들은 매칭에서 빠집니다. 그래서 매칭 결과는 "짝을 찾을 수 있었던 치료군"에 대한 이야기입니다.

caliper 0.05와 0.2에서는 SMD가 모두 0.03 아래로 균형이 좋고 위험차가 약 −4.5%p로 안정적입니다. caliper를 1.0으로 넓히면 짝은 60쌍쯤 늘지만 덜 비슷한 사람끼리 묶여 SOFA의 SMD가 0.063으로 커지고 위험차가 −3.2%p로 줄어듭니다. 남은 불균형(더 아픈 치료군)이 효과를 가린 것입니다. 이처럼 **caliper는 표본 수와 비교의 질을 맞바꾸는 손잡이**이고, 여러 값에서 결과를 함께 보고하는 것이 민감도 분석입니다. 이 단순한 탐욕적(greedy) 매칭 코드는 학습용입니다. 실제 연구에서는 매칭 후 짝 구조를 반영한 분산 추정까지 하는 검증된 도구를 씁니다.

### 예시 4 — 역확률 가중, 추정 대상의 차이, E-value

```python
p_t = df.treat.mean()
w = np.where(df.treat == 1, p_t / df.ps, (1 - p_t) / (1 - df.ps))      # 안정화 가중치
print("안정화 가중치 범위 %.2f–%.2f, 가중 후 SMD %s" % (w.min(), w.max(), smd(df, w)))
rd_w = (np.average(df.died[df.treat == 1], weights=w[df.treat == 1])
        - np.average(df.died[df.treat == 0], weights=w[df.treat == 0]))
print(f"IPW 위험차 {rd_w:+.3f} | 단순 위험차 {df.died[df.treat==1].mean()-df.died[df.treat==0].mean():+.3f}")

# 진짜 평균 효과(시뮬레이션이라 계산 가능): 모두 치료 vs 모두 비치료
base = -4.2 + 0.30 * sofa + 0.03 * (age - 65) + 0.5 * np.log(lactate)
true_rd = (1 / (1 + np.exp(-(base - 0.40)))).mean() - (1 / (1 + np.exp(-base))).mean()
att = ((1 / (1 + np.exp(-(base - 0.40)))) - (1 / (1 + np.exp(-base))))[treat].mean()
print(f"진짜 평균 위험차: 전체 인구 {true_rd:+.3f}, 치료받은 사람들 {att:+.3f}")

# E-value: 관찰된 위험비를 없애려면 측정 안 된 교란이 얼마나 강해야 하나
rr = 0.80
rr_inv = 1 / rr
print(f"\n관찰 RR {rr} 의 E-value = {rr_inv + np.sqrt(rr_inv * (rr_inv - 1)):.2f}")
```

출력:

```text
안정화 가중치 범위 0.32–6.50, 가중 후 SMD {'age': 0.009, 'sofa': 0.027, 'log_lactate': 0.008}
IPW 위험차 -0.035 | 단순 위험차 +0.038
진짜 평균 위험차: 전체 인구 -0.034, 치료받은 사람들 -0.046

관찰 RR 0.8 의 E-value = 1.81
```

가중 후 SMD가 모두 0.03 아래로 내려왔고, IPW 위험차(−3.5%p)는 전체 인구의 진짜 효과(−3.4%p)와 거의 같습니다. 매칭 위험차(−4.6%p)는 **치료받은 사람들**의 진짜 효과(−4.6%p)와 같습니다. 두 방법 중 하나가 틀린 것이 아니라 **서로 다른 질문에 답한 것**입니다. 이 가상 세계에서는 아픈 환자일수록 치료 효과(위험 감소 폭)가 크고, 치료받은 사람이 더 아프기 때문에 ATT가 ATE보다 큽니다. 보고서에는 어느 대상의 효과인지를 반드시 씁니다.

E-value 계산은 위험비(RR) 0.80이 관찰되었다고 가정한 예입니다. 결과 1.81은 "측정하지 않은 교란변수가 치료와도, 사망과도 각각 위험비 1.81배 이상으로 연관되어 있다면 이 연관을 설명해 버릴 수 있다"는 뜻입니다. 중환자 진료에서 "의사가 본 환자의 인상"은 그 정도 힘을 충분히 가질 수 있으므로, 이 숫자는 결론이 그리 튼튼하지 않다는 경고로 읽어야 합니다. (위험비 1보다 작은 값은 역수로 바꿔 계산합니다. 사건이 드물지 않으면 OR은 RR과 달라서 변환이 필요합니다. 더 읽을거리의 VanderWeele & Ding 참고.)

## 직접 해보기

1. `notebooks/advanced/E/E5_confounding.ipynb`에서 예시 1–4를 순서대로 실행합니다.
2. Love plot(보정 전후 SMD 그림)을 그립니다. 예시 4 다음 셀에 붙여 넣습니다.

   ```python
   import matplotlib.pyplot as plt
   from pathlib import Path

   out = Path("../../../figures/advanced/E"); out.mkdir(parents=True, exist_ok=True)
   m02 = match(df, 0.2).reset_index(drop=True)
   rows = pd.DataFrame({"before": smd(df), "matched (0.2)": smd(m02), "IPW": smd(df, w)})
   plt.figure(figsize=(5.5, 3))
   for col, mk in zip(rows.columns, ["o", "s", "^"]):
       plt.scatter(rows[col].abs(), rows.index, marker=mk, label=col)
   plt.axvline(0.1, color="grey", ls="--")
   plt.xlabel("|standardized mean difference|")
   plt.legend()
   plt.tight_layout()
   plt.savefig(out / "E5_love_plot.png", dpi=150)
   plt.show()
   ```

3. **측정하지 않은 교란**을 체험합니다. 예시 1의 `covs`에서 `"sofa"`를 빼고(`covs = ["age", "log_lactate"]`) 예시 1–4를 다시 실행합니다. 매칭·가중 후 SMD는 여전히 0.1 아래로 "균형이 좋아" 보이는데, 보정 OR과 위험차가 정답에서 얼마나 멀어지는지 표로 적습니다. (작성자가 실행했을 때 보정 OR은 약 1.02, 매칭·IPW 위험차는 0에 가까웠습니다. 효과가 사라져 보입니다.) "측정한 변수의 균형"이 "모든 교란의 균형"을 뜻하지 않는다는 것을 한 문장으로 적고, 원래대로 돌려놓습니다.
4. 과보정을 체험합니다. 치료 **이후**에 측정된 가상의 변수 `df["post_map"] = 70 + 5 * df.treat - 2 * df.sofa + rng.normal(0, 5, n)`를 만들어 예시 2의 보정 변수에 넣어 봅니다(치료가 올려 놓은 혈압이라고 상상합니다). 작성자가 실행했을 때 보정 OR이 0.66에서 약 0.72로 1 쪽으로 움직였습니다. 이 가상 세계에서 `post_map`은 사망에 직접 영향을 주지 않는데도 추정이 흔들렸습니다. 실제 데이터에서 치료 후 변수가 사망으로 가는 경로 위에 있다면 왜곡이 더 커질 수 있다는 점을 한 문장으로 적습니다.
5. Day E1의 연구 질문으로 `reports/advanced/E/E5_table1_balance.md`를 씁니다.
   - 교란변수 후보 목록과 각각이 index time **이전**에 측정되는지
   - 어느 방법(회귀, 매칭, IPW)을 주 분석으로 쓸지, 그리고 추정 대상(ATE/ATT)
   - 균형 기준(|SMD| < 0.1)과 민감도 분석 계획 세 가지(caliper, 코호트 기준, 결측 처리)
   - 측정하지 못한 중요한 교란변수 한 가지와 E-value를 보고하겠다는 계획
6. `learning-log.md`에 기록하고 commit합니다.

⚠️ **흔한 오류 1 — `PerfectSeparationError` 또는 계수가 수십·수백으로 튄다**
어떤 변수가 치료(또는 결과)를 거의 완벽히 가르면 로지스틱 회귀가 수렴하지 못합니다. 그 변수가 사실상 치료 정의의 일부가 아닌지(예: "치료 약의 용량") 확인하고, 그런 변수는 성향점수 모델에서 뺍니다.

⚠️ **흔한 오류 2 — 성향점수 모델을 AUC로 고른다**
성향점수 모델의 목적은 치료를 잘 맞히는 것이 아니라 균형을 맞추는 것입니다. AUC가 아주 높으면 오히려 두 군이 겹치지 않는다는 경고입니다. 매칭·가중 후 SMD로 판단하세요.

## 퀴즈

**1.** (객관식) Table 1에서 균형을 판단할 때 p-value보다 SMD를 쓰는 이유는?
① SMD가 계산이 더 쉬워서
② p-value는 표본 크기에 따라 같은 차이도 유의/비유의가 바뀌지만, SMD는 차이의 크기 자체를 보기 때문에
③ SMD는 결측을 자동으로 처리해서
④ 논문 심사자가 p-value를 싫어해서

<details><summary>정답 보기</summary>

②. 균형은 "두 군이 얼마나 다른가"의 문제이지 "그 차이가 우연인가"의 문제가 아닙니다. EHR처럼 표본이 크면 사소한 차이도 p < 0.05가 됩니다.

</details>

**2.** (단답) 예시 3에서 caliper를 1.0으로 넓혔을 때 위험차가 −4.6%p에서 −3.2%p로 줄어든 이유는?

<details><summary>정답 보기</summary>

덜 비슷한 사람끼리도 짝을 지어 SOFA 불균형(SMD 0.063)이 남았기 때문입니다. 남은 짝에서는 치료군이 여전히 조금 더 아파서, 치료의 이로운 효과가 일부 가려졌습니다. 표본은 늘었지만 비교의 질이 떨어졌습니다.

</details>

**3.** (객관식) 예시 4에서 IPW(−3.5%p)와 매칭(−4.6%p)의 결과가 달랐습니다. 올바른 해석은?
① IPW가 틀렸다
② 매칭이 틀렸다
③ IPW는 전체 인구의 평균 효과, 매칭은 치료받은 사람들의 평균 효과를 추정해서, 효과가 사람마다 다르면 값이 다르다
④ 우연일 뿐 의미가 없다

<details><summary>정답 보기</summary>

③. 시뮬레이션의 정답이 각각 −3.4%p(전체)와 −4.6%p(치료받은 사람)로, 두 방법 모두 자기 질문에는 맞게 답했습니다. 보고서에는 추정 대상(ATE, ATT)을 명시합니다.

</details>

**4.** (단답) 직접 해보기 3에서 SOFA를 보정 변수에서 빼면, 남은 변수의 SMD는 작은데도 왜 결과가 정답에서 멀어지나요? 실제 연구에서 이 상황은 무엇에 해당하나요?

<details><summary>정답 보기</summary>

SOFA가 치료 배정과 사망 모두에 영향을 주는 강한 교란변수인데 보정에서 빠졌기 때문입니다. SMD는 모델에 넣은 변수의 균형만 보여 줄 뿐, 빠진 변수의 불균형은 보여 주지 않습니다. 실제 연구에서는 "측정하지 않은(또는 기록되지 않은) 교란변수"에 해당하며, 성향점수든 회귀든 어떤 방법으로도 고칠 수 없습니다. 그래서 E-value 같은 민감도 분석을 보고합니다.

</details>

**5.** (객관식) 다음 중 보정 변수로 넣으면 **안 되는** 것은?
① index time 전의 나이
② index time 전 24시간의 SOFA 점수
③ 치료 시작 6시간 뒤의 혈압
④ 입원 전 만성 신장질환 여부

<details><summary>정답 보기</summary>

③. 치료 이후에 측정된 변수는 치료의 영향을 받았을 수 있어, 보정하면 치료 효과의 경로 일부를 지우거나 새로운 편향을 만들 수 있습니다. 교란변수는 index time 이전 정보로만 정의합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–4가 실행되고, 출력이 위와 같다.
- [ ] `figures/advanced/E/E5_love_plot.png`가 저장되어 있다.
- [ ] SOFA를 뺀 실험과 치료 후 변수를 넣은 실험의 결과를 표로 적었다.
- [ ] `reports/advanced/E/E5_table1_balance.md`에 교란 후보, 주 분석과 추정 대상, 균형 기준, 민감도 분석 계획이 있다.
- [ ] `learning-log.md` 기록과 commit을 남겼다.

## 더 읽을거리
- MIT Critical Data. *Secondary Analysis of Electronic Health Records*. Springer, 2016 (CC BY-NC 4.0). [NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK543630/) · [Springer](https://doi.org/10.1007/978-3-319-43742-2). 8장(남은 교란), 15장(탐색 분석), 16장(선형·로지스틱 회귀, 생존 분석), 17장(민감도 분석과 caliper), 19장(도구 변수), 23장(성향점수), 25장(case-control과 case-crossover).
- Austin PC. An introduction to propensity score methods for reducing the effects of confounding in observational studies. *Multivariate Behavioral Research* 2011. doi:[10.1080/00273171.2011.568786](https://doi.org/10.1080/00273171.2011.568786) (PMID 21818162)
- VanderWeele TJ, Ding P. Sensitivity analysis in observational research: introducing the E-value. *Annals of Internal Medicine* 2017. doi:[10.7326/M16-2607](https://doi.org/10.7326/M16-2607) (PMID 28693043)

---
[← 이전](day-E4.md) · [코스 지도](../../../README.md) · [다음 →](day-E6.md)
