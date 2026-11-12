# Day G7 — 평가·편향·설명·규제, 그리고 정직한 미니 프로젝트

> **주차:** 심화 파트 G — AI·생성형 AI in 바이오메디컬 · **예상 시간:** 90분+ (프로젝트) · **산출물:** `notebooks/advanced/G/G7_project.ipynb` + `reports/advanced/G7_model_card.md` (모델 카드)
>
> **먼저 끝내 둘 레슨:** [Day G3](day-G3.md)(합성 증강), [Day 34 — 평가 지표 해석](../../week-5/day-34.md), [Day 39 — 민감도 분석](../../week-6/day-39.md).

## 오늘의 목표
- 전체 성능 뒤에 숨은 하위집단(사이트·성별·기기) 성능 차이를 신뢰구간과 함께 보고할 수 있다.
- 보정(calibration), 순열 중요도로 모델을 점검하고, 설명 기법이 인과를 말하지 않는다는 점을 설명할 수 있다.
- 실재하는 보고 지침·규제 문서를 알고, 작은 모델의 결과를 모델 카드로 정직하게 정리할 수 있다.

## 🎬 영상으로 먼저 보기

- [Pulmonary Health Case Study: Bias Exploration, Exploring Fairness in Machine Learning — MIT OpenCourseWare](https://www.youtube.com/watch?v=zrB6pocJSI8) (5:30)
- **무엇에 주목할까:** 측정 기기 자체가 집단에 따라 다르게 작동하면, 그 값으로 만든 모델도 편향을 물려받는다는 점입니다. 예시의 "사이트 B 기기 차이"와 같은 구조입니다.

- [Shapley Values : Data Science Concepts — ritvikmath](https://www.youtube.com/watch?v=NBg7YirBTN8) (15:03)
- **무엇에 주목할까:** feature 기여를 "여러 순서로 넣어 보며 평균한 몫"으로 나눈다는 발상입니다. 기여가 크다는 것이 원인이라는 뜻은 아니라는 점을 기억하며 보세요.

## 개념 설명

### 전체 숫자 하나로는 부족하다: 하위집단 평가

5주차에서 AUC·민감도·특이도를 배웠습니다(Day 34). 실제 배포에서 문제가 되는 것은 대개 **누구에게서** 틀리느냐입니다. 흉부 X선 모델이 병원마다 성능이 크게 달랐던 연구, 코로나19 X선 모델이 병변 대신 병원·촬영 방식의 표식(shortcut)을 배운 연구, 의료비를 건강 필요의 대리 지표로 쓴 알고리즘이 흑인 환자의 필요를 과소평가한 연구가 대표적입니다. 그래서 사이트·성별·연령대·기기별로 성능을 나눠 보고합니다. 이때 하위집단이 작으면 신뢰구간이 매우 넓어져, "B에서 더 좋다/나쁘다"를 말할 수 없는 경우가 많습니다. 숫자와 함께 n, 양성 수, 신뢰구간을 같이 씁니다.

### 공정성 지표: "편향이 없다"는 말의 여러 뜻

하위집단 차이를 숫자 하나로 요약하는 기준은 여러 가지이고, 서로 다른 것을 잽니다.
- **인구집단 동등성(demographic parity):** 집단마다 "양성"으로 예측받는 비율이 같은가.
- **동등화된 오즈(equalized odds):** 실제 상태가 같은 사람들 사이에서 집단마다 민감도·위양성률이 같은가.
- **기회 균등(equal opportunity):** 그중 민감도만 같은가(Hardt 2016).

실제 유병률이 집단마다 다르면 첫째 기준과 둘째 기준을 동시에 맞추기는 일반적으로 불가능합니다. 그래서 "공정하다"고 쓰려면 **어떤 기준으로** 보았는지를 밝혀야 합니다. 차이를 줄이는 방법도 세 단계로 나눕니다. 학습 전에는 표본 가중치를 주거나 다시 뽑고, 학습 중에는 손실 함수에 격차 벌점을 더하고, 학습 후에는 집단별 임곗값을 조정합니다. 마지막 방법은 집단 정보를 결정에 직접 쓰는 것이라 법적·윤리적 논란이 있을 수 있습니다. 어느 방법이든, 바로잡기 전에 측정 기기·라벨 자체가 집단에 따라 다르게 작동하는지(영상의 예)를 먼저 봅니다.

### 숫자를 믿기 전에: 기준선, 라벨, 전처리 순서

논문이나 편집서의 "정확도 97%"는 다음 순서로 점검합니다. 실제 출판물에서 반복해서 보이는 문제들입니다.

1. **아무것도 안 배운 기준선과 비교했나.** 비정상 72%인 데이터에서는 "전부 비정상"이라고만 답해도 정확도가 0.72입니다. 그보다 낮은 모델은 쓸모가 없습니다. 클래스가 8개로 균형이면 우연 수준은 0.125입니다. 불균형 데이터에서는 정확도 대신 balanced accuracy, 클래스별 민감도, PR-AUC를 봅니다(Day 34). 표 데이터 임상 예측에서는 로지스틱 회귀가 복잡한 ML과 성능 차이가 없는 경우가 많다는 체계적 문헌고찰도 있습니다(Christodoulou 2019). 그러니 로지스틱 회귀 기준선은 꼭 같이 둡니다.
2. **숫자끼리 맞나.** 초록·본문·표의 정확도, 표본 수, 분할 크기가 서로 일치하는지 봅니다. 정확도와 정밀도·재현율이 산술적으로 함께 나올 수 있는 값인지도 확인합니다. 어긋나면 그 결과는 재현할 수 없습니다.
3. **라벨이 입력에 들어 있지 않나.** 진단 라벨이 설문 문항 점수의 합으로 정해지는데 그 문항들이 그대로 입력 변수라면, 모델은 채점 규칙을 다시 배울 뿐입니다. 정확도가 거의 100%여도 아무 의미가 없습니다. 어떤 입력 열이 라벨을 결정하거나 라벨에서 계산된 것은 아닌지 확인합니다.
4. **라벨 자체는 얼마나 믿을 만한가.** 전문가 판독(병리 등급, 영상 판독)도 사람마다 다릅니다. 두 판독자의 일치도는 우연히 일치할 몫을 뺀 **Cohen의 kappa**로 잽니다(Cohen 1960). 판독자끼리도 잘 일치하지 않는 과제에서 "모델이 한 명의 전문가보다 낫다"는 약한 근거입니다. 라벨 기준(진단 기준의 판)이 바뀌면 같은 모델의 "정확도"도 달라집니다.
5. **전처리를 분할 뒤에 했나.** 결측 대체, 표준화, 변수 선택, SMOTE는 학습 fold 안에서만 맞춥니다(G3). 한 사람이 여러 기록을 남기는 데이터, 예를 들어 심전도 박동 수천 개, 3D 영상의 2D 단면들, 같은 환자의 여러 부위 검체는 사람 단위로 한쪽에만 둡니다(Day 33).
6. **여러 라벨을 한 숫자로 뭉치지 않았나.** 진단 25개를 동시에 예측하는 다중 라벨 문제에서 **micro 평균**은 흔한 진단에 끌려가고, **macro 평균**은 모든 진단을 같은 무게로 봅니다. 희귀 진단에서 실패해도 micro AUROC는 높게 나올 수 있으니, 라벨별 AUROC와 macro 평균을 함께 보고합니다.

### 보정: 확률이 확률다운가

**판별력**(AUC: 환자를 비환자보다 높게 줄 세우는가)과 **보정**(calibration: "30%"라고 한 사람들 중 실제로 30%가 환자인가)은 다른 성질입니다. 위험 확률을 숫자 그대로 쓰는 임상 상황에서는 보정이 중요합니다. 간단히는 평균 예측 확률과 실제 양성 비율을 비교하고, Brier 점수(확률과 0/1 정답의 제곱 오차 평균, 작을수록 좋음)를 봅니다. 유병률이 다른 집단에 그대로 적용하면 AUC는 비슷해도 보정은 깨지기 쉽습니다. 외부 검증에서 상용 패혈증 예측 모델의 성능이 개발사 보고보다 훨씬 낮았던 사례가 이런 차이를 보여 줍니다.

### 설명 가능성: 무엇을 말하고 무엇을 말하지 않나

**순열 중요도**(permutation importance)는 평가셋에서 한 feature 값을 섞었을 때 성능이 얼마나 떨어지는지 잽니다. **SHAP**은 개별 예측을 feature별 몫으로 나눕니다. 둘 다 "모델이 무엇에 기대는가"를 보여 줄 뿐 "무엇이 질병의 원인인가"를 보여 주지 않습니다. 상관된 feature끼리는 몫이 나뉘거나 한쪽으로 쏠리고, 모델이 shortcut(병원 표식, 기기 차이)에 기대고 있다면 그것도 "중요"하게 나옵니다. 그 자체가 설명 도구의 쓸모, 즉 이상한 의존을 찾는 점검 도구입니다. 고위험 결정에는 처음부터 해석 가능한 모델을 쓰자는 주장(Rudin 2019)도 함께 알아 두세요.

### 보고 지침과 규제: 실재하는 문서들

| 문서 | 무엇인가 |
|---|---|
| TRIPOD+AI (BMJ 2024) | 예측 모델 연구(개발·검증)의 보고 체크리스트 |
| CONSORT-AI (Nat Med 2020) | AI 개입을 평가한 임상시험의 보고 지침 |
| Model Cards (Mitchell 2019) | 모델의 용도·데이터·성능·한계를 한 장에 정리하는 형식 |
| WHO, *Ethics and governance of artificial intelligence for health* (2021) | 보건 AI 윤리·거버넌스 6원칙 지침 |
| EU AI Act, Regulation (EU) 2024/1689 | 위험 기반 AI 규제. 의료기기 AI는 대부분 고위험 범주 |
| 미국 FDA의 AI 기반 의료기기 목록, GMLP 10원칙(FDA·Health Canada·MHRA) | 승인 기기 공개 목록과 개발 모범 원칙 (FDA 웹사이트에서 검색) |

이 과정의 결과물은 이 중 어떤 규제 승인과도 관계없는 **교육용 탐색 분석**입니다. 보고 지침은 "무엇을 빠뜨리지 말고 써야 하는가"의 점검표로 씁니다.

## 예시로 이해하기 — 미니 프로젝트

> 두 사이트의 **가상** 참가자 데이터입니다. 사이트 B는 표본이 작고, 기기 차이로 cadence 값이 체계적으로 밀려 있게 만들었습니다. 1명 = 1행이라 행 단위 분할이 곧 참가자 단위 분할입니다(반복 측정이면 GroupKFold, Day 33).

```python
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, brier_score_loss, recall_score
from sklearn.inspection import permutation_importance
from sklearn.mixture import GaussianMixture

rng = np.random.default_rng(42)
FEATS = ["stride_cv", "cadence", "arm_swing", "age"]

def site(n, name, shift, prevalence):
    """가상 참가자 표(1행 = 1명). 사이트 B는 기기 차이로 cadence 값이 체계적으로 밀려 있다."""
    y = (rng.random(n) < prevalence).astype(int)
    df = pd.DataFrame({
        "stride_cv": rng.normal(2.0 + 1.0 * y, 0.7, n),
        "cadence": rng.normal(112 - 6 * y + shift, 7, n),
        "arm_swing": rng.normal(1.0 - 0.25 * y, 0.25, n),
        "age": rng.normal(66, 8, n),
        "site": name, "y": y})
    return df

df = pd.concat([site(400, "A", 0, 0.4), site(80, "B", 8, 0.25)], ignore_index=True)
df["pid"] = np.arange(len(df))                      # 참가자 ID (1명 1행이라 행 = 참가자)
tr, te = train_test_split(df, test_size=0.4, random_state=0, stratify=df[["site", "y"]])

def fit(train):
    return make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(train[FEATS], train["y"])

def boot_auc(y, p, n=1000):
    idx = [rng.integers(0, len(y), len(y)) for _ in range(n)]
    vals = [roc_auc_score(y[i], p[i]) for i in idx if len(set(y[i])) == 2]
    return np.percentile(vals, [2.5, 97.5])

def evaluate(model, label):
    p = model.predict_proba(te[FEATS])[:, 1]
    thr = 0.5
    rows = []
    for name, sel in [("전체", np.ones(len(te), bool)), ("사이트 A", te.site.values == "A"), ("사이트 B", te.site.values == "B")]:
        yy, pp = te.y.values[sel], p[sel]
        lo, hi = boot_auc(yy, pp)
        rows.append({"모델": label, "집단": name, "n": int(sel.sum()), "양성": int(yy.sum()),
                     "AUC": round(roc_auc_score(yy, pp), 3), "AUC 95% CI": f"{lo:.2f}–{hi:.2f}",
                     "민감도@0.5": round(recall_score(yy, pp >= thr), 2),
                     "Brier": round(brier_score_loss(yy, pp), 3),
                     "평균 예측 vs 실제 비율": f"{pp.mean():.2f} vs {yy.mean():.2f}"})
    return pd.DataFrame(rows), p

base = fit(tr)
t1, p_base = evaluate(base, "기준")

# 합성 증강은 '학습 데이터 안에서만': 사이트 B 학습 행으로만 GMM을 맞춰 B를 늘린다
trB = tr[tr.site == "B"]
aug = [tr]
for y, g in trB.groupby("y"):
    gm = GaussianMixture(n_components=1, random_state=0).fit(g[FEATS])
    s, _ = gm.sample(len(g) * 3)
    aug.append(pd.DataFrame(s, columns=FEATS).assign(site="B", y=y))
t2, _ = evaluate(fit(pd.concat(aug, ignore_index=True)), "B 합성 증강")
table = pd.concat([t1, t2], ignore_index=True)
pd.set_option("display.width", 200)
print(table.to_string(index=False))

imp = permutation_importance(base, te[FEATS], te["y"], scoring="roc_auc", n_repeats=30, random_state=0)
print("\n순열 중요도(AUC 감소량, 평균 ± 표준편차):")
for f, m, s in sorted(zip(FEATS, imp.importances_mean, imp.importances_std), key=lambda x: -x[1]):
    print(f"  {f:<10} {m:.3f} ± {s:.3f}")

# 모델 카드 초안을 파일로 저장한다
out = Path("reports/advanced"); out.mkdir(parents=True, exist_ok=True)
card = f"""# 모델 카드 — G7 가상 보행 분류 모델 (연습용)

- **용도:** 교육용 연습. 실제 진단·선별에 쓰지 않는다.
- **데이터:** 가상 참가자 {len(df)}명(사이트 A {int((df.site=='A').sum())}명, B {int((df.site=='B').sum())}명), 1명 1행, 참가자 단위 6:4 분할.
- **모델:** 표준화 + 로지스틱 회귀, feature {', '.join(FEATS)}.
- **평가(평가셋):**

{table.to_markdown(index=False) if hasattr(table, 'to_markdown') else table.to_string(index=False)}

- **알려진 한계:** 사이트 B는 표본이 작아 신뢰구간이 넓다. 사이트 B의 cadence는 기기 차이로 밀려 있다(가상 설정). 합성 증강은 학습셋 안에서만 했다.
- **하지 말 것:** 다른 기기·다른 인구집단에 그대로 적용, 성능 숫자를 진단 정확도로 표현.
"""
(out / "G7_model_card.md").write_text(card, encoding="utf-8")
print("\n저장:", out / "G7_model_card.md")
```

출력:

```text
     모델    집단   n  양성   AUC AUC 95% CI  민감도@0.5  Brier 평균 예측 vs 실제 비율
     기준    전체 192  70 0.934  0.89–0.97     0.77  0.099   0.33 vs 0.36
     기준 사이트 A 160  63 0.930  0.89–0.97     0.79  0.104   0.36 vs 0.39
     기준 사이트 B  32   7 0.949  0.83–1.00     0.57  0.074   0.20 vs 0.22
B 합성 증강    전체 192  70 0.925  0.88–0.96     0.73  0.102   0.32 vs 0.36
B 합성 증강 사이트 A 160  63 0.922  0.88–0.96     0.73  0.109   0.35 vs 0.39
B 합성 증강 사이트 B  32   7 0.909  0.73–1.00     0.71  0.068   0.21 vs 0.22

순열 중요도(AUC 감소량, 평균 ± 표준편차):
  stride_cv  0.230 ± 0.042
  arm_swing  0.071 ± 0.015
  cadence    0.070 ± 0.015
  age        0.001 ± 0.001

저장: reports/advanced/G7_model_card.md
```

**읽는 법.** 전체 AUC 0.93은 좋아 보이지만, 사이트 B는 평가 인원 32명에 양성 7명입니다. AUC 0.95의 신뢰구간이 0.83–1.00이라 A보다 낫다고 말할 수 없습니다. 민감도는 0.57(7명 중 4명)로 A의 0.79보다 낮은데, 이 역시 한두 명 차이입니다. 합성 증강 뒤 B의 민감도가 0.71(5명)로 올랐지만 **딱 한 명** 차이이고 AUC는 오히려 내려갔으니, "증강이 B 성능을 개선했다"고 쓰면 과장입니다. 보정은 양쪽 모두 평균 예측이 실제 비율보다 약간 낮은 정도로 큰 문제는 없습니다. 순열 중요도는 stride_cv에 가장 크게 기대고 있음을 보여 주지만, 이것은 가상 규칙에서 그 변수를 가장 강하게 만들었기 때문이고 생물학적 원인과는 무관합니다. 이 모든 내용이 모델 카드에 들어갑니다.

## 직접 해보기

1. `notebooks/advanced/G/G7_project.ipynb`를 만들고 위 코드를 실행합니다. `reports/advanced/G7_model_card.md`가 생기는지 확인합니다(`to_markdown`에는 tabulate 패키지가 필요하며, 없으면 일반 표 문자열로 저장됩니다).
2. **seed 민감도.** `rng = np.random.default_rng(42)`의 42를 0, 1, 2로 바꿔 사이트 B의 민감도가 어떻게 흔들리는지 표로 적습니다(Day 39). 흔들림의 폭이 증강 효과보다 큰지 봅니다.
3. **외부 사이트처럼 평가.** 사이트 A로만 학습하고 사이트 B 전체로 평가합니다. cadence 기기 차이 때문에 보정(평균 예측 vs 실제)이 어떻게 변하는지 적습니다.
4. **shortcut 심기.** feature에 `site_is_B = (site == "B")` 열을 추가하고, 사이트 B의 유병률을 0.6으로 바꿔 다시 학습합니다. 순열 중요도에서 이 열이 올라오는지 보고, "모델이 사이트를 보고 판단한다"는 것이 왜 위험한지 적습니다.
5. **모델 카드 완성.** 자동 생성된 카드에 TRIPOD+AI 체크리스트를 참고해 (가) 결과 정의, (나) 결측 처리, (다) 표본 수 근거, (라) 하위집단 결과 해석, (마) 사용해선 안 되는 상황을 추가합니다.

⚠️ **흔한 오류 1 — 평가셋으로 반복 튜닝.** 임곗값·하이퍼파라미터를 평가셋 결과를 보며 계속 고치면 평가셋이 학습셋이 됩니다. 튜닝은 학습셋 안의 교차검증으로 하고 평가셋은 마지막에 한 번 씁니다.

⚠️ **흔한 오류 2 — 합성 데이터를 평가셋에 넣기.** 증강·합성은 학습셋에만 씁니다(G3). 평가는 언제나 실제 데이터로 합니다.

## 퀴즈

**1.** 하위집단 평가에서 n = 32, 양성 7명인 집단의 민감도 0.57과 0.71의 차이를 해석하면?

(a) 증강이 효과적이다 (b) 한 명 차이라 우연과 구별할 수 없다 (c) 0.71이 진짜 값이다 (d) 민감도는 하위집단에서 계산하면 안 된다

<details><summary>정답 보기</summary>

(b). 7명 중 4명과 5명의 차이입니다. seed만 바꿔도 이 정도는 흔들립니다. 신뢰구간과 n을 함께 보고합니다.

</details>

**2.** AUC는 같은데 Brier 점수가 나빠지는 상황의 예는? (단답)

<details><summary>정답 보기</summary>

줄 세우기(판별)는 그대로인데 확률 수준이 틀어진 경우입니다. 예를 들어 유병률이 다른 병원에 그대로 적용해 모든 확률이 실제보다 높게(또는 낮게) 나오는 경우입니다.

</details>

**3.** 순열 중요도가 가장 큰 feature에 대해 쓸 수 있는 문장은?

(a) 이 feature가 질병의 원인이다 (b) 이 데이터에서 모델이 예측에 가장 크게 의존하는 feature다 (c) 이 feature를 치료 목표로 삼아야 한다 (d) 다른 feature는 무의미하다

<details><summary>정답 보기</summary>

(b). 중요도는 모델의 의존을 말할 뿐 인과·치료 가치를 말하지 않습니다. 상관된 feature가 있으면 몫이 나뉘어 다른 feature가 작게 보일 수도 있습니다.

</details>

**4.** 예측 모델 개발·검증 논문을 쓸 때 참고할 보고 지침은?

(a) CONSORT-AI (b) TRIPOD+AI (c) EU AI Act (d) GDPR

<details><summary>정답 보기</summary>

(b). TRIPOD+AI는 예측 모델 연구의 보고 지침입니다. CONSORT-AI는 AI 개입 임상시험, EU AI Act·GDPR은 법령입니다.

</details>

**5.** 모델 카드의 "하지 말 것" 칸에 이 미니 프로젝트라면 무엇을 쓰겠습니까? 두 가지. (단답)

<details><summary>정답 보기</summary>

예: 다른 기기·사이트 데이터에 재보정·외부 검증 없이 적용하지 말 것, 성능 숫자를 진단 정확도로 표현하지 말 것, 가상 데이터 결과를 실제 환자에 대한 주장으로 쓰지 말 것.

</details>

## 오늘의 산출물 체크리스트
- [ ] 하위집단별 AUC·민감도·Brier를 n·양성 수·신뢰구간과 함께 표로 냈다.
- [ ] seed 민감도와 외부 사이트 평가를 해 보았다.
- [ ] shortcut feature가 중요도에 나타나는 것을 확인했다.
- [ ] 모델 카드를 TRIPOD+AI 항목으로 보완했다.

## 더 읽을거리
- Collins GS, et al. TRIPOD+AI statement. *BMJ.* 2024;385:e078378. doi:[10.1136/bmj-2023-078378](https://doi.org/10.1136/bmj-2023-078378)
- Liu X, et al. (CONSORT-AI) *Nat Med.* 2020;26:1364–1374. doi:[10.1038/s41591-020-1034-x](https://doi.org/10.1038/s41591-020-1034-x)
- Mitchell M, et al. Model cards for model reporting. *FAT\* '19.* 2019:220–229. doi:[10.1145/3287560.3287596](https://doi.org/10.1145/3287560.3287596)
- Obermeyer Z, et al. Dissecting racial bias in an algorithm used to manage the health of populations. *Science.* 2019;366:447–453. doi:[10.1126/science.aax2342](https://doi.org/10.1126/science.aax2342)
- Zech JR, et al. *PLoS Med.* 2018;15:e1002683. doi:[10.1371/journal.pmed.1002683](https://doi.org/10.1371/journal.pmed.1002683) · DeGrave AJ, et al. AI for radiographic COVID-19 detection selects shortcuts over signal. *Nat Mach Intell.* 2021;3:610–619. doi:[10.1038/s42256-021-00338-7](https://doi.org/10.1038/s42256-021-00338-7) · Roberts M, et al. *Nat Mach Intell.* 2021;3:199–217. doi:[10.1038/s42256-021-00307-0](https://doi.org/10.1038/s42256-021-00307-0)
- Wong A, et al. External validation of a widely implemented proprietary sepsis prediction model. *JAMA Intern Med.* 2021;181:1065. doi:[10.1001/jamainternmed.2021.2626](https://doi.org/10.1001/jamainternmed.2021.2626)
- Rudin C. *Nat Mach Intell.* 2019;1:206–215. doi:[10.1038/s42256-019-0048-x](https://doi.org/10.1038/s42256-019-0048-x) · Lundberg SM, Lee S-I. A unified approach to interpreting model predictions (SHAP). 2017. [arXiv:1705.07874](https://arxiv.org/abs/1705.07874) · Kapoor S, Narayanan A. Leakage and the reproducibility crisis in ML-based science. *Patterns.* 2023;4:100804. doi:[10.1016/j.patter.2023.100804](https://doi.org/10.1016/j.patter.2023.100804)
- Hardt M, Price E, Srebro N. Equality of opportunity in supervised learning. *NeurIPS.* 2016. [arXiv:1610.02413](https://arxiv.org/abs/1610.02413)
- Christodoulou E, et al. A systematic review shows no performance benefit of machine learning over logistic regression for clinical prediction models. *J Clin Epidemiol.* 2019;110:12–22. doi:[10.1016/j.jclinepi.2019.02.004](https://doi.org/10.1016/j.jclinepi.2019.02.004)
- Cohen J. A coefficient of agreement for nominal scales. *Educ Psychol Meas.* 1960;20:37–46. doi:[10.1177/001316446002000104](https://doi.org/10.1177/001316446002000104)
- WHO. *Ethics and governance of artificial intelligence for health.* 2021. <https://www.who.int/publications/i/item/9789240029200> · EU AI Act, Regulation (EU) 2024/1689: <https://eur-lex.europa.eu/eli/reg/2024/1689/oj>

---
[← 이전](day-G6.md) · [코스 지도](../../../README.md) · [다음: 코스 지도 →](../../../README.md)
