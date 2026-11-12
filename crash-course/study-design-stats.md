# Crash Course — 연구 설계와 통계 응급 키트

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** 분야와 상관없이, 내 질문에 맞는 분석을 고르고 효과크기·신뢰구간·보정된 p-value를 함께 보고하며, 표본 수·교란·반복 측정에서 생기는 흔한 오류를 피한다.

## 한눈에 보기

| 항목 | 내용 |
|---|---|
| 무엇을 다루는가 | 데이터 종류(발현량, 영상, 생리 신호, 행동)와 무관하게 공통인 것: 분석 단위, 비교 구조, 불확실성 표현, 여러 번 검정할 때의 보정 |
| 어떤 질문에 답하는가 | 차이·연관이 얼마나 큰가(효과크기) / 그 추정이 얼마나 불확실한가(신뢰구간) / 우연만으로 이 정도가 나올 수 있는가(p-value) / 이 표본 수로 무엇을 볼 수 있는가(검정력) |
| 답하지 못하는 것 | 설계의 결함은 통계로 고치지 못한다. 군과 배치가 완전히 겹친 실험, 무작위 배정 없는 관찰 자료의 인과, 결과를 보고 고른 분석의 p-value |
| 가장 먼저 정할 것 | **분석 단위**(무엇이 독립 표본인가: 사람, 동물, 배양 접시)와 **주 outcome 하나** |
| 보고의 최소 단위 | 군별 n, 효과크기, 95% 신뢰구간, 검정 방법, (여러 번 검정했다면) 보정 방법과 검정 개수 |

## 🎬 급할 때 볼 영상

- [p-values: What they are and how to interpret them — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=vemZtEM63GY) (약 11분) — p-value가 무엇의 확률인지, 무엇이 아닌지를 가장 짧게 정리한다.
- [False Discovery Rates, FDR, clearly explained — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=K8LQSvtjcEo) (약 18분) — 검정을 많이 하면 왜 거짓 양성이 쌓이는지, BH 보정이 무엇을 하는지 그림으로 보여 준다.
- [Statistical Power, Clearly Explained!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=Rsc5znwR5FA) (약 8분) — 검정력이 표본 수·효과크기·분산과 어떻게 묶여 있는지 설명한다. 표본 수를 정하기 전에 본다.
- (선택) [Pseudoreplication - What it is and how to avoid it — GSS - Guided Statistics for Scientists](https://www.youtube.com/watch?v=ZYSl8KZKm1g) (약 5분) — 반복 측정을 독립 표본으로 세는 실수.

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| 분석 단위 (unit of analysis) | 서로 독립이라고 볼 수 있는 가장 작은 단위. 보통 사람·동물·독립 배양 | n은 이 단위의 개수다. 세포 수, window 수, 기술 반복 수가 아니다 |
| effect size (효과크기) | 차이나 연관의 크기. 평균 차, Cohen's d, 상관계수, odds ratio | "얼마나"에 답하는 유일한 숫자. p-value는 크기를 말하지 않는다 |
| confidence interval (신뢰구간) | 추정값의 불확실성 범위. 같은 방법을 반복하면 95%의 구간이 참값을 포함한다 | 구간이 넓으면 표본이 부족하다는 뜻. "차이 없음"과 "모름"을 구분해 준다 |
| p-value | 차이가 없다는 가정(귀무가설) 아래에서 관찰값 이상으로 극단적인 결과가 나올 확률 | 가설이 참일 확률도, 효과의 크기도 아니다. 표본이 크면 작은 차이도 작은 p가 된다 |
| multiple testing (다중검정)과 FDR | 검정을 여러 번 하면 거짓 양성이 쌓인다. FDR은 "유의하다고 한 것 중 거짓의 기대 비율" | 유전자 2만 개든 feature 20개든 같은 문제. 보정 없이 p < 0.05를 세면 안 된다 |
| power (검정력) | 실제 효과가 있을 때 그것을 검출할 확률 | 표본이 작으면 진짜 효과를 놓치고, 우연히 걸린 효과는 과대 추정된다 |
| confounder (교란변수) | 군과도 outcome과도 관련 있는 제3의 변수. 나이, 성별, 약물, 측정 시점 | 군 차이처럼 보이는 것을 만들거나 가린다. 관찰 연구의 핵심 한계 |
| batch effect (배치 효과) | 실험 날짜·장비·시약·실험자 같은 기술적 묶음에 따른 체계적 차이 | 군과 배치가 겹치면 분리할 수 없다. 설계 단계에서 섞어야 한다 |
| pseudoreplication (유사 반복) | 독립이 아닌 측정(한 개체의 반복 측정, 기술 반복)을 독립 표본처럼 세는 것 | n이 부풀어 p-value가 지나치게 작아진다. 생물·의학 데이터에서 가장 흔한 오류 |
| exploratory vs confirmatory (탐색 대 확증) | 탐색: 데이터를 보며 가설을 만든다. 확증: 미리 정한 가설·분석을 새 데이터로 검정한다 | 탐색에서 나온 p-value는 확증의 증거가 아니다. 같은 데이터로 둘 다 할 수 없다 |

## 분석 방법 고르기

먼저 세 가지를 정한다: (1) outcome이 연속형인가, 범주형인가, 횟수인가 (2) 비교하는 군이 서로 독립인가, 같은 개체의 반복인가 (3) 목적이 설명(차이·연관의 크기)인가 예측인가.

| 질문 유형 | 기본 선택 | 조건이 안 맞을 때 | 함께 보고할 효과크기 | 도구 (Python) | 주의 |
|---|---|---|---|---|---|
| 두 군 비교 (독립) | Welch t-test (분산이 같다고 가정하지 않는다) | 심하게 치우치거나 순위 자료 → Mann–Whitney U. 범주형 outcome → Fisher 정확 검정·카이제곱 | 평균 차와 95% CI, Cohen's d | `scipy.stats.ttest_ind(equal_var=False)`, `mannwhitneyu`, `fisher_exact` | 군당 n이 작으면 정규성 검정은 믿기 어렵다. 그림으로 분포를 본다 |
| 두 조건 비교 (같은 개체, 전후) | 대응 t-test (개체별 차이를 분석) | 차이의 분포가 치우침 → Wilcoxon 부호순위 검정 | 차이의 평균과 CI | `scipy.stats.ttest_rel`, `wilcoxon` | 대응 구조를 무시하고 독립 검정을 쓰면 검정력을 잃는다 |
| 여러 군 비교 | 일원 분산분석(ANOVA) 후 사후 비교, 또는 처음부터 계획한 대비만 검정 | 분산이 많이 다름 → Welch ANOVA. 치우침 → Kruskal–Wallis | 군별 평균과 CI, 쌍별 차이 | `scipy.stats.f_oneway`, `kruskal`, `tukey_hsd`, `statsmodels` `ols` | 쌍별 t-test를 보정 없이 반복하지 않는다 |
| 연관 (두 연속 변수) | Pearson 상관 + 산점도 | 단조 관계이나 직선이 아님, 이상치 → Spearman | r과 CI, 회귀 기울기 | `scipy.stats.pearsonr`, `spearmanr` | 상관은 인과가 아니다. 군이 섞인 자료의 상관은 군 차이일 수 있다 |
| 연관 (교란 보정) | 다중 선형 회귀 (outcome ~ 관심 변수 + 교란변수). 이진 outcome → 로지스틱 회귀 | 횟수 outcome → Poisson/음이항 회귀 | 보정된 계수와 CI, odds ratio | `statsmodels.formula.api.ols`, `logit`, `glm` | 변수 수에 비해 표본이 작으면 불안정. 보정 변수는 미리 정한다 |
| 예측 | 단순한 baseline(로지스틱 회귀 등) + 교차검증 | 표본이 작으면 예측 모델 자체가 무리일 수 있다 | 독립 단위로 나눈 test 성능(AUC, 민감도, 특이도)과 그 변동 | `scikit-learn` (`Pipeline`, `GroupKFold`) | 전처리·feature 선택을 train 안에서만. 같은 개체가 train과 test에 동시에 있으면 누수 |
| 반복 측정·중첩 자료 | 개체 단위로 요약한 뒤 위의 방법, 또는 개체를 random effect로 둔 혼합효과모형 | 시점이 많고 결측이 있으면 혼합효과모형이 유리 | 고정 효과 계수와 CI | `pandas.groupby` 요약, `statsmodels` `mixedlm` | 행 수가 아니라 개체 수가 n이다 |
| 수천 개를 동시에 검정 (omics) | 그 자료형 전용 방법(예: RNA-seq count는 DESeq2·edgeR·limma) + FDR | — | log2 fold change와 보정 p | 전용 패키지, `statsmodels.stats.multitest.multipletests` | 일반 t-test를 유전자마다 돌리는 것은 작은 표본에서 불안정하다 |

고르기 어려우면: 분포 그림을 먼저 그리고, 가장 단순한 방법으로 효과크기와 신뢰구간을 구한 뒤, 가정이 의심되면 비모수 방법이나 bootstrap으로 같은 결론이 나오는지 확인한다.

## 표준 분석 흐름

1. **질문과 분석 단위 고정.** 질문을 한 문장으로 쓰고, 주 outcome 하나와 비교 구조(어느 군 대 어느 군, 보정할 변수)를 정한다.
   - 도구: 문서 한 장(분석 계획). 형식이 필요하면 OSF 사전등록 양식(<https://osf.io/prereg/>)을 참고한다.
   - 입력→출력: 연구 아이디어 → 날짜가 찍힌 분석 계획 파일(`.md`)
   - QC: 데이터를 열기 전에 작성했는가. 주 분석과 탐색 분석이 구분되어 있는가.
2. **표본 수와 검정력 점검.** 기대하는 효과크기를 선행 연구나 "의미 있는 최소 차이"에서 가져와 필요한 표본 수를 계산한다. 이미 모인 데이터라면 이 표본 수로 검출 가능한 최소 효과크기를 계산한다.
   - 도구: `statsmodels.stats.power`, G*Power(무료 프로그램)
   - 입력→출력: 효과크기, alpha, 목표 검정력 → 군당 필요 표본 수
   - QC: 흔한 출발점은 alpha 0.05, 검정력 80%. 관례일 뿐 규칙이 아니다. 효과크기 가정의 출처를 적는다.
3. **설계 점검: 대조군, 무작위화, 배치, 교란.** 군 × 배치(날짜·장비·실험자) 교차표와 군별 교란변수 요약표를 만든다.
   - 도구: `pandas.crosstab`, `groupby().describe()`
   - 입력→출력: 메타데이터 표(`.csv`) → 교차표, 군별 특성표
   - QC: 군과 배치가 완전히 겹친 칸이 없는가. 군 사이에 나이·성별 등이 크게 다르지 않은가. 겹치면 분석으로 해결되지 않으니 한계로 적는다.
4. **자료 QC와 분석 단위로 정리.** 결측, 중복, 불가능한 값, 이상치를 점검하고, 반복 측정은 개체당 한 행으로 요약하거나 개체 ID 열을 유지한다.
   - 입력→출력: 원자료 → 한 행 = 한 분석 단위인 tidy 표(`.csv`) + 제외 기록
   - QC: 제외 기준을 결과를 보기 전에 정했는가. 제외된 수를 군별로 셀 수 있는가. 이상치는 지우기 전에 원인을 조사한다.
5. **분포를 그림으로 확인.** 군별로 모든 점이 보이는 그림(점 + box)을 그린다.
   - 도구: `matplotlib`
   - QC: 치우침, 군 간 분산 차이, 한두 점이 평균을 끌고 가는지 확인한다. 이 결과로 "분석 방법 고르기" 표의 "조건이 안 맞을 때" 열을 본다.
6. **효과크기 → 신뢰구간 → 검정.** 이 순서로 계산하고 이 순서로 보고한다.
   - 도구: `scipy.stats`, `statsmodels`, bootstrap(`scipy.stats.bootstrap`)
   - 입력→출력: tidy 표 → 결과 표(군별 n, 추정값, CI, p)
   - QC: 검정에 들어간 n이 분석 단위의 수와 같은가. 단측/양측, 대응/독립이 계획과 같은가.
7. **다중검정 보정.** 한 질문 묶음 안에서 검정한 모든 p-value를 모아 보정한다.
   - 도구: `statsmodels.stats.multitest.multipletests(method="fdr_bh")`
   - QC: 보정에 넣은 검정 개수를 보고한다. "유의한 것만" 골라 넣고 보정하지 않는다. FDR 문턱(흔히 0.05 또는 0.1)은 미리 정한다.
8. **민감도 분석과 보고.** 이상치 포함/제외, 다른 합리적 정의·방법에서 결론이 유지되는지 전부 보여 준다. 탐색 결과는 탐색이라고 적는다.
   - 도구: 보고 지침 모음 EQUATOR Network(<https://www.equator-network.org/>), 관찰 연구는 STROBE(<https://www.strobe-statement.org/>)
   - 입력→출력: 결과 표 → 보고서(방법, n, 효과크기, CI, 보정 p, 한계) + 코드
   - QC: "유의하지 않음"을 "차이 없음"으로 쓰지 않았는가. 인과·진단·치료 표현이 설계가 허용하는 범위 안에 있는가.

## 최소 실행 예시

### 예시 1 — Welch t-test + Cohen's d + BH 보정

군당 12명, feature 200개인 가상 데이터. 앞의 10개 feature에만 실제 군 차이를 넣었다. feature마다 평균 차와 95% 신뢰구간, Cohen's d, Welch t-test의 p를 구하고 Benjamini–Hochberg(BH)로 보정한다.

```python
import numpy as np, pandas as pd
from scipy import stats
from statsmodels.stats.multitest import multipletests

rng = np.random.default_rng(7)
n, n_feat = 12, 200                      # 군당 12명, feature 200개
true_d = np.zeros(n_feat); true_d[:10] = 2.0             # 앞의 10개만 진짜 차이
ctrl = rng.normal(0, 1, (n, n_feat))
case = rng.normal(true_d, 1.5, (n, n_feat))               # 환자군은 분산도 더 큼

rows = []
for j in range(n_feat):
    a, b = ctrl[:, j], case[:, j]
    res = stats.ttest_ind(b, a, equal_var=False)          # Welch t-test
    ci = res.confidence_interval(0.95)                    # 평균 차이의 95% CI
    sd_pooled = np.sqrt((a.var(ddof=1) + b.var(ddof=1)) / 2)   # 두 군 n이 같을 때
    rows.append((f"f{j + 1:03d}", true_d[j] != 0, b.mean() - a.mean(),
                 ci.low, ci.high, (b.mean() - a.mean()) / sd_pooled, res.pvalue))
out = pd.DataFrame(rows, columns=["feature", "진짜차이", "평균차", "CI_low", "CI_high", "cohen_d", "p"])
out["q_BH"] = multipletests(out["p"], alpha=0.05, method="fdr_bh")[1]

print(out.sort_values("p").head(5).round(4).to_string(index=False))
print(f"\n검정 {n_feat}개, 진짜 차이 {int(out.진짜차이.sum())}개")
print(f"p < 0.05: {(out.p < 0.05).sum()}개 (그중 진짜 {(out.p[out.진짜차이] < 0.05).sum()}개)")
print(f"q < 0.05: {(out.q_BH < 0.05).sum()}개 (그중 진짜 {(out.q_BH[out.진짜차이] < 0.05).sum()}개)")
assert (out.q_BH >= out.p).all()
```

출력:

```text
feature  진짜차이    평균차  CI_low  CI_high  cohen_d      p   q_BH
   f002  True 2.7861  1.9563   3.6159   2.9096 0.0000 0.0005
   f007  True 1.7381  1.0739   2.4023   2.2156 0.0000 0.0014
   f009  True 2.4900  1.5183   3.4618   2.1697 0.0000 0.0014
   f010  True 2.2653  1.3805   3.1502   2.1747 0.0000 0.0014
   f001  True 2.3538  1.3771   3.3305   2.0543 0.0001 0.0027

검정 200개, 진짜 차이 10개
p < 0.05: 21개 (그중 진짜 10개)
q < 0.05: 8개 (그중 진짜 8개)
```

읽는 법:

- 보정 없이 p < 0.05로 자르면 21개가 걸리고 그중 11개는 차이가 없는 feature다. 차이 없는 190개의 5%가 약 10개이므로 예상된 결과다.
- BH 보정 뒤에는 8개가 남고 모두 진짜다. 대신 진짜 10개 중 2개를 놓쳤다. 보정은 거짓 양성을 줄이는 대가로 검정력을 내준다.
- 상위 feature의 관찰된 Cohen's d(2.1–2.9)는 넣어 준 실제 값(평균 차 2.0 ÷ 합동 SD 약 1.27 ≈ 1.6)보다 크다. 작은 표본에서 "가장 유의한 것"을 고르면 효과크기가 과대 추정된다.
- 신뢰구간의 폭(약 1.3–2.0)이 평균 차 자체와 비슷한 크기다. 군당 12명으로는 효과의 크기를 대략만 안다.

### 예시 2 — 표본 수와 검정력

```python
from statsmodels.stats.power import TTestIndPower

power = TTestIndPower()
print("효과크기 d → 검정력 80%에 필요한 군당 표본 수 (양측 alpha 0.05)")
for d in [0.2, 0.5, 0.8, 1.2]:
    print(f"  d = {d}: {power.solve_power(effect_size=d, alpha=0.05, power=0.8):6.1f}명")
print("군당 10명일 때 검정력")
for d in [0.5, 0.8, 1.2]:
    print(f"  d = {d}: {power.power(effect_size=d, nobs1=10, alpha=0.05):.2f}")
```

출력:

```text
효과크기 d → 검정력 80%에 필요한 군당 표본 수 (양측 alpha 0.05)
  d = 0.2:  393.4명
  d = 0.5:   63.8명
  d = 0.8:   25.5명
  d = 1.2:   11.9명
군당 10명일 때 검정력
  d = 0.5: 0.19
  d = 0.8: 0.40
  d = 1.2: 0.72
```

읽는 법: 군당 10명 실험은 중간 크기 효과(d = 0.5)를 5번 중 1번만 잡는다. 이런 실험에서 "유의하지 않음"은 "차이 없음"의 증거가 아니다. 표본 수는 올림해서 쓴다(63.8 → 64명).

## 흔한 함정

1. **반복 측정·기술 반복을 독립 표본으로 센다 (pseudoreplication)** → 동물 4마리의 세포 400개를 n = 400으로 검정하면 p-value가 지나치게 작아진다 → 독립 단위(동물, 사람)로 요약해 검정하거나 혼합효과모형을 쓴다. 보고하는 n은 독립 단위의 수다.
2. **p-value만 보고한다** → 크기도 불확실성도 알 수 없다. 큰 표본의 사소한 차이와 작은 표본의 큰 차이가 같은 p를 가질 수 있다 → 효과크기, 95% 신뢰구간, p를 항상 함께 적는다.
3. **p > 0.05를 "차이 없음"으로 쓴다** → 검정력이 낮으면 진짜 효과도 대부분 놓친다 → 신뢰구간을 보고 "이 범위의 차이는 배제하지 못한다"고 쓴다.
4. **여러 번 검정하고 보정하지 않거나, 유의한 것만 골라 보정한다** → 거짓 양성이 발견으로 보고된다 → 한 질문 묶음에서 수행한 모든 검정을 넣어 FDR 보정을 하고 검정 개수를 밝힌다.
5. **군과 배치가 겹친다** → 대조군은 월요일, 처리군은 금요일에 처리했다면 요일 차이와 처리 차이를 분리할 방법이 없다. 사후 통계 보정으로도 안 된다 → 설계 단계에서 배치마다 모든 군을 섞고(무작위화·블록화), 배치를 기록해 모델에 넣는다.
6. **결과를 보며 분석을 바꾼다 (p-hacking, 분석 경로 고르기)** → 이상치 기준, 변수 변환, 하위군, 보정 변수를 바꿔 가며 p < 0.05가 나올 때 멈추면 거짓 양성률이 5%를 훨씬 넘는다 → 주 분석을 미리 적어 두고, 다른 선택지의 결과는 민감도 분석으로 전부 보여 준다.
7. **탐색에서 찾은 것을 같은 데이터로 "검증"한다** → 가설을 만든 데이터는 그 가설을 이미 지지한다 → 탐색 결과는 가설 생성으로 표시하고, 확증은 독립된 데이터나 미리 떼어 둔 데이터로 한다.
8. **상관·군 차이를 인과로 쓴다** → 무작위 배정이 없으면 교란을 배제할 수 없다 → 교란 후보를 표로 점검하고 보정하되, 문장은 "연관되어 있다" 수준으로 쓴다.

## 연구 설계 체크리스트

- [ ] 질문, 주 outcome, 비교 구조를 데이터를 보기 전에 문서로 적었다.
- [ ] 분석 단위(독립 표본)가 무엇인지 정했고, 군별 n을 그 단위로 세었다.
- [ ] 기대 효과크기와 그 출처를 적고, 필요한 표본 수 또는 검출 가능한 최소 효과크기를 계산했다.
- [ ] 생물학적 반복과 기술 반복을 구분했고, 기술 반복은 평균 내거나 중첩 구조로 모델에 넣는다.
- [ ] 적절한 대조군(음성·양성·vehicle·sham 등)이 같은 조건으로 처리되었다.
- [ ] 군 배정과 처리·측정 순서를 무작위화했고, 가능하면 측정자가 군을 모르게 했다.
- [ ] 군 × 배치 교차표를 만들었고, 군과 배치가 완전히 겹치지 않는다.
- [ ] 교란 후보(나이, 성별, 약물, 시점 등)를 메타데이터에 기록했고 군별로 비교했다.
- [ ] 제외 기준과 이상치 처리 규칙을 미리 정했다.
- [ ] 검정 개수를 알고 있고, 다중검정 보정 방법과 문턱을 미리 정했다. 탐색 분석과 확증 분석을 구분해 보고한다.

## 공개 데이터와 더 볼 곳

이 가이드는 방법 중심이라 특정 데이터 저장소 대신 도구·지침·논문을 모았다. 연습용 데이터는 각 분야 Crash Course의 저장소 목록을 쓴다.

**공식 문서·도구 (모두 무료)**

| 이름 | URL | 무엇이 있나 |
|---|---|---|
| SciPy `ttest_ind` | <https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html> | Welch t-test(`equal_var=False`)와 신뢰구간 |
| statsmodels `multipletests` | <https://www.statsmodels.org/stable/generated/statsmodels.stats.multitest.multipletests.html> | BH(`fdr_bh`), Bonferroni, Holm 등 보정 |
| statsmodels 통계 모음 | <https://www.statsmodels.org/stable/stats.html> | 검정, 검정력, 효과크기 함수 목록 |
| statsmodels `TTestIndPower` | <https://www.statsmodels.org/stable/generated/statsmodels.stats.power.TTestIndPower.html> | 두 군 비교의 표본 수·검정력 계산 |
| statsmodels 혼합효과모형 | <https://www.statsmodels.org/stable/mixed_linear.html> | 반복 측정·중첩 자료 |
| scikit-learn "Common pitfalls" | <https://scikit-learn.org/stable/common_pitfalls.html> | 데이터 누수를 피하는 전처리·교차검증 방법 |
| scikit-learn `GroupKFold` | <https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html> | 개체 단위 교차검증 |
| G*Power | <https://www.psychologie.hhu.de/arbeitsgruppen/allgemeine-psychologie-und-arbeitspsychologie/gpower> | 표본 수 계산 프로그램 |
| EQUATOR Network | <https://www.equator-network.org/> | 연구 유형별 보고 지침 모음 |
| STROBE | <https://www.strobe-statement.org/> | 관찰 연구 보고 체크리스트 |
| OSF 사전등록 | <https://osf.io/prereg/> | 분석 계획을 미리 등록하는 양식 |

**핵심 논문 (Crossref로 서지 확인)**

- Wasserstein RL, Lazar NA. The ASA Statement on p-Values: Context, Process, and Purpose. *Am Stat* 2016;70:129–133. doi:[10.1080/00031305.2016.1154108](https://doi.org/10.1080/00031305.2016.1154108) — p-value가 말하는 것과 말하지 않는 것.
- Benjamini Y, Hochberg Y. Controlling the False Discovery Rate: A Practical and Powerful Approach to Multiple Testing. *J R Stat Soc Series B* 1995;57:289–300. doi:[10.1111/j.2517-6161.1995.tb02031.x](https://doi.org/10.1111/j.2517-6161.1995.tb02031.x) — BH 보정의 원 논문.
- Button KS, et al. Power failure: why small sample size undermines the reliability of neuroscience. *Nat Rev Neurosci* 2013;14:365–376. doi:[10.1038/nrn3475](https://doi.org/10.1038/nrn3475) — 낮은 검정력이 거짓 발견과 효과 과대 추정으로 이어지는 이유.
- Lakens D. Calculating and reporting effect sizes to facilitate cumulative science: a practical primer for t-tests and ANOVAs. *Front Psychol* 2013;4:863. doi:[10.3389/fpsyg.2013.00863](https://doi.org/10.3389/fpsyg.2013.00863) — 효과크기 계산 실무.
- Lazic SE. The problem of pseudoreplication in neuroscientific studies: is it affecting your analysis? *BMC Neurosci* 2010;11:5. doi:[10.1186/1471-2202-11-5](https://doi.org/10.1186/1471-2202-11-5) — 유사 반복의 예와 해결.
- Aarts E, et al. A solution to dependency: using multilevel analysis to accommodate nested data. *Nat Neurosci* 2014;17:491–496. doi:[10.1038/nn.3648](https://doi.org/10.1038/nn.3648) — 중첩 자료에 혼합효과모형을 쓰는 이유.
- Leek JT, et al. Tackling the widespread and critical impact of batch effects in high-throughput data. *Nat Rev Genet* 2010;11:733–739. doi:[10.1038/nrg2825](https://doi.org/10.1038/nrg2825) — 배치 효과와 설계.
- Nosek BA, et al. The preregistration revolution. *Proc Natl Acad Sci USA* 2018;115:2600–2606. doi:[10.1073/pnas.1708274114](https://doi.org/10.1073/pnas.1708274114) — 탐색과 확증의 구분, 사전등록.

## 본 과정과의 연결

| 이 가이드의 부분 | 자세히 다루는 레슨 |
|---|---|
| 검증 가능한 질문 쓰기, 교란 직관 | [Day 7 — 분석 질문 고정하기](../lessons/week-1/day-07.md) |
| 분포 보기, 평균·중앙값·SD·IQR, 이상치 | [Day 8 — 분포와 요약통계](../lessons/week-2/day-08.md) |
| 효과크기, 신뢰구간, p-value가 답하는 서로 다른 질문 | [Day 9 — 효과크기, 신뢰구간, p-value](../lessons/week-2/day-09.md) |
| 다중검정, FWER와 FDR, BH 손계산 | [Day 10 — FDR과 다중검정](../lessons/week-2/day-10.md) |
| 반복, 대조군, 배치, 교란, 설계식 | [Day 11 — 반복, 배치, 교란, 대조군](../lessons/week-2/day-11.md) |
| 독립 단위로 세기, 제외 기준과 flowchart | [Day 25 — participant-level QC](../lessons/week-4/day-25.md) |
| 결과를 보기 전에 계획 고정, 반복 측정을 독립으로 셀 때의 문제 | [Day 28 — 분석 계획 확정](../lessons/week-4/day-28.md) |
| 질문 유형(군 비교·회귀·분류)에 맞는 분석 고르기 | [Day 29 — 가설검정과 모델 선택](../lessons/week-5/day-29.md) |
| Cohen's d, bootstrap 신뢰구간, 여러 feature의 FDR | [Day 30 — 단변량 비교](../lessons/week-5/day-30.md) |
| 층화·회귀 보정과 그 한계 | [Day 31 — 교란변수](../lessons/week-5/day-31.md) |
| 교차검증, GroupKFold, 데이터 누수 | [Day 33 — 참가자 단위 검증과 데이터 누수](../lessons/week-5/day-33.md) |
| 예측 성능 지표 읽기 | [Day 34 — 평가 지표 해석](../lessons/week-5/day-34.md) |
| 민감도 분석과 p-hacking의 차이 | [Day 39 — 민감도 분석](../lessons/week-6/day-39.md) |
| 과장 없는 문장, 한계 쓰기 | [Day 40 — 과학적 글쓰기와 윤리](../lessons/week-6/day-40.md) |
| 같은 다중 비교 문제의 다른 얼굴(E-value) | [Day S5 — BLAST와 E-value](../lessons/supplement/day-S5.md) |

연속 생리 신호 데이터라면 [Crash Course — 생리 신호 분석](physiology-signals.md)을 함께 본다.

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
