# Day 35 — PD 프로젝트 보고서 쓰기

> **주차:** 5주차 · **예상 시간:** 75–90분 · **산출물:** `reports/pd_motor_phenotype_report.md`

## 오늘의 목표
- 4–5주차의 산출물을 질문 → 데이터 → QC → feature → 방법 → 결과 → 한계 → 인용의 순서로 1–2쪽 보고서에 정리할 수 있다.
- 보고서의 모든 숫자를 노트북에서 다시 만들어 낼 수 있게 연결할 수 있다.
- 진단·인과·임상 유용성을 암시하는 과장 표현을 찾아 절제된 문장으로 고칠 수 있다.

## 🎬 영상으로 먼저 보기

- [How to Write a Great Research Paper — Microsoft Research](https://www.youtube.com/watch?v=VK51E3gHENc) (57분 39초 — 앞의 15–20분만 봐도 충분합니다)
- **무엇에 주목할까:** Simon Peyton Jones의 강연입니다. "글의 핵심 아이디어 하나를 먼저 정하라", "무엇을 했는지보다 독자가 무엇을 알게 되는지를 써라"는 앞부분의 조언에 주목하세요. 우리 보고서의 핵심 아이디어는 "이 데이터셋에서 이런 차이가 관찰되었고, 이만큼 불확실하다"입니다.

- [검색 링크: "how to write limitations section research paper"](https://www.youtube.com/results?search_query=how+to+write+limitations+section+research+paper) (검색 링크 — 특정 영상을 확인하지 못해 검색 결과로 연결합니다)
- **무엇에 주목할까:** 선택 시청입니다. 한계(limitations)가 "변명"이 아니라 "이 결과를 어디까지 믿어도 되는지 독자에게 알려 주는 안내문"이라는 관점만 얻으면 됩니다.

## 개념 설명

### 보고서는 실험 노트가 아니라 안내문이다

지난 2주 동안 노트북에는 시도한 것, 실패한 것, 고친 것이 시간 순서대로 쌓였습니다. 그것은 실험 노트입니다. 보고서는 다릅니다. 보고서는 **처음 보는 사람이 10분 안에 "무엇을 물었고, 무엇으로 답했고, 어디까지 믿을 수 있는가"를 알 수 있게 하는 안내문**입니다. 3주차 Day 21에 OSDR 보고서를 쓸 때와 같은 원칙이고, 구조도 거의 같습니다.

여덟 부분이 각각 답하는 질문은 이렇습니다.

1. **질문:** 무엇을 알고 싶었는가? (Day 28의 분석 계획에서 그대로 가져옵니다)
2. **데이터:** 어떤 데이터셋의 어느 버전인가? 누가, 무엇으로, 어떤 과제를 측정했는가?
3. **QC:** 몇 명으로 시작해 몇 명이 남았는가? 무엇을 왜 제외했는가?
4. **Feature:** 원신호에서 어떤 숫자를 어떻게 계산했는가?
5. **방법:** 분석 단위, 군 비교 방법, 교란 점검, 모델, 검증 방식은 무엇인가?
6. **결과:** 효과크기와 신뢰구간, 보정 전후 차이, baseline의 성능과 오류 분석.
7. **한계:** 이 결과를 어디까지 믿을 수 있는가?
8. **인용:** 데이터셋, 버전, 라이선스, 사용한 도구.

논문의 Methods를 읽고 실험을 재현할 수 있어야 하듯, 이 보고서를 읽은 사람이 같은 데이터로 같은 숫자를 얻을 수 있어야 합니다. 그래서 보고서의 숫자는 손으로 옮겨 적지 않고, 노트북이 출력한 표(`reports/day30_effect_sizes.csv`, `reports/day34_performance_table.csv`)에서 가져옵니다.

### 결과 문장의 세 가지 재료: 범위, 크기, 불확실성

좋은 결과 문장에는 세 가지가 들어 있습니다. **범위**(어떤 데이터에서, 어떤 단위로), **크기**(효과크기나 성능), **불확실성**(신뢰구간이나 fold 범위)입니다.

- 약한 문장: "PD군은 보행 변동성이 유의하게 높았다(p < 0.05)."
- 좋은 문장: "이 데이터셋의 참가자 단위 비교에서 PD군(n = 25)의 보행 주기 변동성은 대조군(n = 25)보다 높았다(Cohen's d = 1.43, 95% CI 0.93–2.14). 나이를 보정하면 군 차이는 1.49에서 1.11로 줄었다."

약한 문장은 얼마나 다른지, 몇 명인지, 무엇이 섞여 있는지 알려 주지 않습니다. p-value는 넣어도 되지만 주인공이 아닙니다.

모델 결과도 같은 틀로 씁니다. "이 데이터셋에서 참가자 단위 5-fold 교차검증으로 평가했을 때(범위), 로지스틱 회귀 baseline은 PD군과 대조군의 측정을 ROC-AUC 0.83으로 구분했다(크기). fold별 범위는 0.74–0.91이었다(불확실성)." 그리고 군 비교가 주 분석이고 모델은 보조 분석이라면, 보고서에서도 그 비중대로 씁니다. 모델 결과가 더 화려해 보인다고 앞에 내세우지 않습니다.

기대와 다른 결과도 그대로 씁니다. 신뢰구간이 0을 포함한 feature, FDR 보정 후 기준을 넘지 못한 feature, 더미와 별 차이 없는 성능은 "실패"가 아니라 결과입니다.

### 과장을 걸러 내는 세 가지 질문

글을 쓰다 보면 문장이 조금씩 세집니다. "관찰되었다"가 "보여 준다"로, "보여 준다"가 "증명한다"로 바뀝니다. 약 설명서에 임상시험에서 확인되지 않은 효능을 적으면 안 되는 것처럼, 보고서도 데이터가 뒷받침하는 만큼만 말해야 합니다. 문장마다 세 가지를 물어보세요.

**① 진단을 암시하는가?** 실라부스의 모델 해석 원칙 그대로입니다. 모델은 "PD를 진단한다"가 아니라 "이 데이터셋에서 PD군과 대조군을 구분하는 baseline"입니다. "선별", "조기 발견", "진단 보조"도 같은 과장입니다. 높은 성능은 임상 유용성을 자동으로 의미하지 않습니다.

**② 인과를 암시하는가?** 관찰 데이터의 군 비교는 "PD군에서 더 높았다"까지만 말합니다. "PD가 ~를 증가시킨다", "~ 때문에", "~의 원인"은 쓰지 않습니다. 나이를 보정했어도 측정되지 않은 교란은 남습니다.

**③ 이 데이터셋 바깥을 말하는가?** 데이터셋 내부 검증은 외부 검증이 아닙니다. "스마트워치로 PD를 구분할 수 있다"가 아니라 "이 데이터셋에서 … 구분했다"입니다. "일반적으로", "환자들은"처럼 주어가 넓어지는 표현을 조심합니다.

여기에 이 코스 전체의 원칙이 하나 더 있습니다. **이 보고서에는 3주차의 OSDR 마우스 결과를 끌어오지 않습니다.** 마우스 뇌의 분자 데이터와 사람의 운동 데이터는 종도, 측정 단위도, 참가자도 다릅니다. 두 프로젝트를 잇는 이야기는 6주차에 문헌 기반 가설 수준에서만 다룹니다.

### 한계는 구체적으로 쓴다

"표본이 작다", "추가 연구가 필요하다"는 어느 보고서에나 붙일 수 있는 문장이라 독자에게 정보를 주지 않습니다. 좋은 한계 문장은 **무엇이, 결과의 어느 부분을, 어느 방향으로** 흔들 수 있는지를 말합니다.

- 막연함: "교란변수가 있을 수 있다."
- 구체적: "PD군이 대조군보다 평균 6.4세 많았고, 주요 outcome은 나이와 양의 상관이 있었다. 나이 보정 후 군 차이는 약 4분의 1 줄었으며, 오류 분석에서도 젊은 PD군 참가자가 대조군으로 분류되는 경향이 있었다. 따라서 보고된 군 차이와 모델 성능의 일부는 나이 차이를 반영할 수 있다."

이번 주에 만든 산출물이 그대로 한계 절의 재료가 됩니다. Day 31의 교란변수 표에서 "남는 한계" 열, Day 33의 누수 점검표에서 확인하지 못한 항목, Day 34의 오류 분석 메모와 fold 범위입니다. 그리고 거의 모든 PD 공개 데이터 분석에 공통으로 들어가는 네 가지를 확인하세요: 단일 데이터셋(외부 검증 없음), 단면 자료(시간에 따른 변화를 볼 수 없음), 진단이 확정된 사람과 대조군의 비교(진단이 불확실한 상황과 다름), 내가 고른 feature 정의에 따라 결과가 달라질 가능성(6주차 Day 39의 민감도 분석에서 다룹니다).

## 예시로 이해하기

### 예시 1 — 보고서 뼈대

아래를 `reports/pd_motor_phenotype_report.md`에 붙여 넣고 괄호 안을 채우는 것으로 시작합니다. 굵은 안내문은 채운 뒤 지웁니다.

```markdown
# PD 운동 표현형 탐색 분석 보고서

작성일: YYYY-MM-DD · 작성자: · 노트북: notebooks/04–06

> 이 보고서는 공개 데이터셋 하나에 대한 탐색적·교육적 분석이다.
> 개인에 대한 진단이나 치료 판단에 쓸 수 없다.

## 1. 질문
(Day 28 분석 계획의 질문 1–2개. 주 분석과 보조 분석을 구분.)

## 2. 데이터
- 데이터셋 이름, 버전, 접근 날짜, 라이선스: (데이터셋 페이지에서 확인한 그대로)
- 참가자와 군: (데이터 사전에서 확인한 내용)
- 측정 기기, 과제, 반복 구조:
- 이 분석에 사용한 부분:

## 3. QC
- 시작 참가자 수 → 제외(이유별 인원) → 분석 참가자 수 (군별)
- 결측·artifact 처리:

## 4. Feature
| feature | 정의(어떻게 계산했는가) | 단위 | 사전 지정 / 탐색적 |
|---|---|---|---|

## 5. 방법
- 분석 단위: 참가자 (반복 측정은 참가자별 평균으로 요약)
- 군 비교: 평균 차이, Cohen's d(PD − 대조군), 참가자 단위 bootstrap 95% CI, 탐색적 feature는 FDR 보정
- 교란 점검: (나이 등) 회귀 보정 전·후 비교
- baseline 모델: 표준화 + 로지스틱 회귀, 참가자 단위 5-fold 교차검증, 더미 모델과 비교
- 소프트웨어 버전:

## 6. 결과
### 6.1 군 비교 (주 분석)
(그림 1 + 효과크기 표 + 2–3문장)
### 6.2 교란 점검
(보정 전·후 숫자 + 1–2문장)
### 6.3 baseline 모델 (보조 분석)
(성능표 + fold 범위 + 오류 분석 2–3문장)

## 7. 한계
(구체적으로 4–6개)

## 8. 결론
(2–3문장. "이 데이터셋에서 … 관찰되었다 … 추가 검증이 필요하다.")

## 9. 인용과 재현
- 데이터셋 인용: (데이터셋 페이지의 인용 안내를 그대로 복사)
- PhysioNet 인용: (PhysioNet이 안내하는 표준 인용을 그대로 복사)
- 코드와 실행 순서:
```

### 예시 2 — 보고서에 들어갈 숫자를 한 번에 다시 만들기

보고서의 숫자를 여러 노트북에서 손으로 옮기면 반드시 어긋납니다. 핵심 숫자를 한 셀에서 다시 계산해 문장 형태로 출력하는 코드입니다. 가상 데이터로 실행한 결과이며, 내 데이터로 바꾸면 내 보고서의 문장 초안이 됩니다.

```python
import numpy as np
import pandas as pd

FEATURES = ["stride_time_cv", "accel_rms", "tremor_band_power",
            "jerk_mean", "step_regularity", "arm_swing_asym"]

def make_demo_table(seed=42, n_participants=50, n_repeats=6):
    """연습용 가상 feature table. 실제 환자 데이터가 아니다."""
    rng = np.random.default_rng(seed)
    pd_shift = np.array([0.6, -0.5, 0.6, 0.2, -0.4, 0.3])   # PD군 평균이 이동하는 정도
    rows = []
    for i in range(n_participants):
        group = "PD" if i < n_participants // 2 else "HC"
        age = rng.normal(68 if group == "PD" else 62, 7)
        sex = rng.choice(["F", "M"])
        person = rng.normal(0, 1.0, size=len(FEATURES))      # 그 사람 고유의 '움직임 지문'
        for rep in range(1, n_repeats + 1):
            values = person + rng.normal(0, 0.25, size=len(FEATURES))  # 측정마다 생기는 흔들림
            if group == "PD":
                values = values + pd_shift
            values[0] += 0.06 * (age - 65)                   # stride_time_cv는 나이와도 관련
            rows.append({"participant_id": f"P{i + 1:03d}", "group": group,
                         "age": round(age, 1), "sex": sex, "repeat": rep,
                         **dict(zip(FEATURES, values.round(3)))})
    return pd.DataFrame(rows)

df = make_demo_table()

# 🔁 실제 데이터로 바꿀 지점 ---------------------------------------------
# 4주차(Day 26)에 만든 feature table이 있으면 위의 df = make_demo_table() 대신:
# df = pd.read_csv("data/physionet_pd/derived/pd_features_records.csv")   # 내 파일 경로로
# FEATURES = ["내_feature_1", "내_feature_2"]                # 내 feature 열 이름으로
# 그리고 아래 두 이름을 내 표의 열 이름에 맞춘다.
ID_COL = "participant_id"   # 참가자 ID 열
GROUP_COL = "group"         # 진단군 열 (이 예시에서는 "PD" / "HC")
# -------------------------------------------------------------------------

import sklearn
import statsmodels.formula.api as smf
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import GroupKFold, cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

MAIN = "stride_time_cv"      # 🔁 Day 28에 정한 주요 outcome으로

# --- 표본 ---
person = df.groupby([ID_COL, GROUP_COL], as_index=False)[["age"] + FEATURES].mean()
n_pd = (person[GROUP_COL] == "PD").sum()
n_hc = (person[GROUP_COL] == "HC").sum()

# --- 주 분석: 효과크기와 bootstrap 신뢰구간 (Day 30) ---
def cohens_d(a, b):
    pooled = ((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1)) / (len(a) + len(b) - 2)
    return (a.mean() - b.mean()) / np.sqrt(pooled)

a = person.loc[person[GROUP_COL] == "PD", MAIN].to_numpy()
b = person.loc[person[GROUP_COL] == "HC", MAIN].to_numpy()
rng = np.random.default_rng(0)
boots = [cohens_d(rng.choice(a, len(a)), rng.choice(b, len(b))) for _ in range(5000)]
d_lo, d_hi = np.percentile(boots, [2.5, 97.5])

# --- 교란 점검: 나이 보정 전·후 (Day 31) ---
term = f"C({GROUP_COL}, Treatment('HC'))"
crude = smf.ols(f"{MAIN} ~ {term}", data=person).fit().params[f"{term}[T.PD]"]
adjusted = smf.ols(f"{MAIN} ~ {term} + age", data=person).fit().params[f"{term}[T.PD]"]

# --- 보조 분석: 참가자 단위 교차검증 (Day 33–34) ---
X, y, groups = df[FEATURES], (df[GROUP_COL] == "PD").astype(int), df[ID_COL]
cv = GroupKFold(n_splits=5)
proba = cross_val_predict(make_pipeline(StandardScaler(), LogisticRegression()),
                          X, y, cv=cv, groups=groups, method="predict_proba")[:, 1]
fold_auc = [roc_auc_score(y.iloc[test], proba[test]) for _, test in cv.split(X, y, groups)]

print(f"[표본] 참가자 {len(person)}명 (PD {n_pd}, HC {n_hc}), 측정 {len(df)}개")
print(f"[주 분석] {MAIN}: Cohen's d = {cohens_d(a, b):.2f} (95% CI {d_lo:.2f}–{d_hi:.2f}), PD − HC")
print(f"[교란 점검] 군 차이: 보정 전 {crude:.2f} → 나이 보정 후 {adjusted:.2f}")
print(f"[보조 분석] 참가자 단위 5-fold CV: ROC-AUC = {roc_auc_score(y, proba):.2f} "
      f"(fold 범위 {min(fold_auc):.2f}–{max(fold_auc):.2f}), accuracy = {accuracy_score(y, proba >= 0.5):.2f}")
print(f"[환경] pandas {pd.__version__}, numpy {np.__version__}, scikit-learn {sklearn.__version__}")
```

실행 결과 (마지막 줄의 버전은 내 컴퓨터에 설치된 버전에 따라 다르게 나옵니다):

```text
[표본] 참가자 50명 (PD 25, HC 25), 측정 300개
[주 분석] stride_time_cv: Cohen's d = 1.43 (95% CI 0.93–2.14), PD − HC
[교란 점검] 군 차이: 보정 전 1.49 → 나이 보정 후 1.11
[보조 분석] 참가자 단위 5-fold CV: ROC-AUC = 0.83 (fold 범위 0.74–0.91), accuracy = 0.73
[환경] pandas 2.3.3, numpy 2.3.5, scikit-learn 1.7.2
```

이 다섯 줄이 Day 30, 31, 34에서 본 숫자와 같은지 확인하세요. 다르다면 어딘가에서 데이터나 설정이 달라진 것이니, 보고서를 쓰기 전에 원인을 찾아야 합니다.

### 예시 3 — 과장 표현 점검기

보고서 초안에서 조심해야 할 표현을 찾아 주는 작은 도구입니다. 표현이 걸렸다고 무조건 틀린 것은 아닙니다("진단이 확정된 참가자"처럼 정당한 쓰임도 있습니다). 걸린 줄을 사람이 다시 읽어 보라는 표시입니다.

```python
from pathlib import Path

WATCH_WORDS = {
    "진단 암시": ["진단한다", "진단할 수", "진단 정확도", "선별", "조기 발견", "진단 보조"],
    "인과 암시": ["때문에", "원인", "유발", "증가시킨다", "감소시킨다", "증명"],
    "범위 넘침": ["임상적으로 유용", "일반적으로", "환자들은", "예측할 수 있다"],
    "종 간 직접 연결": ["마우스", "OSD-536", "우주비행"],
}

def check_overclaims(text):
    hits = []
    for line_no, line in enumerate(text.splitlines(), start=1):
        for kind, words in WATCH_WORDS.items():
            for w in words:
                if w in line:
                    hits.append((line_no, kind, w, line.strip()))
    return hits

report_path = Path("reports/pd_motor_phenotype_report.md")   # 🔁 내 보고서 경로
if report_path.exists():
    draft = report_path.read_text(encoding="utf-8")
else:   # 보고서가 아직 없으면 연습용 초안으로 실행
    draft = """이 모델은 파킨슨병을 73% 정확도로 진단한다.
PD 때문에 보행 주기 변동성이 증가한다는 것을 증명했다.
이 데이터셋에서 참가자 단위 교차검증으로 평가했을 때 baseline은 두 군의 측정을 ROC-AUC 0.83으로 구분했다.
이 결과는 마우스 뇌의 신경염증 결과와 일치하므로 스마트워치는 임상적으로 유용하다."""

for line_no, kind, word, line in check_overclaims(draft):
    print(f"{line_no}행 [{kind}] '{word}': {line}")
print("점검한 줄 수:", len(draft.splitlines()))
```

실행 결과 (연습용 초안):

```text
1행 [진단 암시] '진단한다': 이 모델은 파킨슨병을 73% 정확도로 진단한다.
2행 [인과 암시] '때문에': PD 때문에 보행 주기 변동성이 증가한다는 것을 증명했다.
2행 [인과 암시] '증명': PD 때문에 보행 주기 변동성이 증가한다는 것을 증명했다.
4행 [범위 넘침] '임상적으로 유용': 이 결과는 마우스 뇌의 신경염증 결과와 일치하므로 스마트워치는 임상적으로 유용하다.
4행 [종 간 직접 연결] '마우스': 이 결과는 마우스 뇌의 신경염증 결과와 일치하므로 스마트워치는 임상적으로 유용하다.
점검한 줄 수: 4
```

네 문장 중 세 번째만 아무것도 걸리지 않았습니다. 범위(이 데이터셋, 참가자 단위 교차검증), 크기(ROC-AUC 0.83), 절제된 동사(구분했다)를 갖춘 문장입니다. 나머지를 고쳐 보면 이렇습니다.

| 과장된 문장 | 고친 문장 |
|---|---|
| 이 모델은 파킨슨병을 73% 정확도로 진단한다. | 이 데이터셋에서 참가자 단위로 평가했을 때 baseline은 PD군과 대조군의 측정을 73% 구분했다(더미 46%). |
| PD 때문에 보행 주기 변동성이 증가한다는 것을 증명했다. | PD군의 보행 주기 변동성은 대조군보다 높았다(d = 1.43, 95% CI 0.93–2.14). 나이 보정 후에도 차이가 관찰되었다. |
| 이 결과는 마우스 뇌의 신경염증 결과와 일치하므로 스마트워치는 임상적으로 유용하다. | (삭제. 마우스 분자 데이터와 사람 운동 데이터는 직접 연결하지 않는다. 임상 유용성은 이 분석으로 평가할 수 없다.) |

## 직접 해보기

1. `reports/pd_motor_phenotype_report.md`를 만들고 예시 1의 뼈대를 붙여 넣습니다.
2. **1–4절(질문, 데이터, QC, Feature)**을 기존 산출물에서 옮겨 채웁니다. 질문은 `pd-analysis-plan.md`(Day 28), 데이터는 `physionet-pd-data-dictionary.md`(Day 24), QC는 Day 25의 QC 표와 flowchart, feature 정의는 Day 26의 노트북에서 가져옵니다. 데이터셋의 참가자 수, 기기, 과제 같은 사실은 기억이 아니라 **데이터셋 페이지와 내 데이터 사전에서 확인한 그대로** 적습니다.
3. 예시 2의 코드를 내 데이터로 실행해(`🔁` 두 곳 수정) 핵심 숫자 다섯 줄을 얻고, Day 30·31·34의 결과와 일치하는지 확인합니다.
4. **5–6절(방법, 결과)**을 씁니다. 그림은 `figures/day30_group_comparison.png`와 `figures/day34_confusion_roc.png`를 `![캡션](../figures/파일명.png)` 형식으로 넣고, 표는 `reports/day30_effect_sizes.csv`와 `reports/day34_performance_table.csv`의 숫자를 옮깁니다. 결과 문장마다 범위·크기·불확실성이 들어 있는지 확인합니다.
5. **7절(한계)**을 구체적으로 4–6개 씁니다. `confounder-table.md`의 "남는 한계" 열, Day 33의 누수 점검표, Day 34의 오류 분석 메모를 재료로 씁니다.
6. **8절(결론)**을 2–3문장으로 씁니다. 아래 형식을 내 결과에 맞게 고칩니다.

   > 이 데이터셋에서 PD군과 대조군 사이에 (feature)의 차이가 관찰되었고(효과크기, 신뢰구간), 그 일부는 (교란변수)의 차이를 반영할 수 있다. 참가자 단위로 검증한 단순 baseline은 두 군의 측정을 (성능, 범위) 수준으로 구분했다. 이 결과는 단일 데이터셋 내부의 탐색적 분석이며, 진단 성능이나 임상 유용성을 뜻하지 않고 독립 데이터에서의 검증이 필요하다.

7. **9절(인용)**을 채웁니다. 데이터셋 페이지에서 인용 안내 부분을 찾아 그대로 복사하고, 버전·라이선스·접근 날짜를 Day 24의 기록과 대조합니다. 인용문을 기억에 의존해 직접 만들지 않습니다.
8. 예시 3의 점검기를 내 보고서에 실행하고, 걸린 줄을 하나씩 다시 읽어 고치거나 "정당한 사용"임을 확인합니다.
9. 보고서를 처음부터 소리 내어 한 번 읽고, `learning-log.md`에 5주차 회고(가장 놀랐던 결과 하나, 가장 불확실한 부분 하나)를 적은 뒤 commit합니다.

⚠️ **흔한 오류 1 — 보고서의 숫자와 노트북의 숫자가 다름:** 중간에 제외 기준이나 feature 정의를 바꾸고 일부 셀만 다시 실행한 경우입니다. 노트북을 "Restart Kernel and Run All"로 처음부터 끝까지 다시 실행한 뒤 숫자를 옮기세요.

⚠️ **흔한 오류 2 — 그림이 보고서에서 안 보임:** 보고서는 `reports/` 폴더에 있으므로 그림 경로는 `figures/...`가 아니라 `../figures/...`입니다.

## 퀴즈

**1.** 다음 중 보고서의 결과 문장으로 가장 좋은 것은?

- (a) "PD군은 대조군과 유의한 차이를 보였다(p < 0.05)."
- (b) "이 데이터셋의 참가자 단위 비교에서 PD군(n = 25)의 ○○는 대조군(n = 25)보다 높았다(Cohen's d = 0.60, 95% CI 0.05–1.24)."
- (c) "스마트워치로 파킨슨병을 알아낼 수 있음을 확인했다."
- (d) "모델 성능이 매우 우수했다."

<details><summary>정답 보기</summary>

**(b)**. 범위(이 데이터셋, 참가자 단위, 표본 수), 크기(d), 불확실성(신뢰구간)을 모두 담고 있습니다. (a)는 크기와 표본을 알 수 없고, (c)는 데이터셋 바깥과 진단을 암시하며, (d)는 숫자가 없습니다.

</details>

**2.** 실라부스의 모델 해석 원칙 세 가지를 적어 보세요. (단답)

<details><summary>정답 보기</summary>

① **높은 성능은 임상 유용성을 자동으로 의미하지 않는다.** ② **데이터셋 내부 검증은 외부 검증이 아니다.** ③ **모델은 "PD를 진단한다"가 아니라 "이 데이터셋에서 PD군과 대조군을 구분하는 baseline"으로 표현한다.** 세 원칙 모두 "이 데이터로 확인한 범위까지만 말한다"는 한 가지 태도에서 나옵니다.

</details>

**3.** 다음 한계 문장 중 더 좋은 것은?

- (a) "본 연구는 표본 수가 작다는 한계가 있으며 추가 연구가 필요하다."
- (b) "참가자가 군별 25명이어서 d의 95% 신뢰구간이 0.05–1.24로 넓었다. 관찰된 차이가 작은 효과인지 큰 효과인지는 이 표본으로 구분할 수 없다."

<details><summary>정답 보기</summary>

**(b)**. 무엇이(표본 수), 결과의 어느 부분을(효과크기 추정), 어떻게(구간이 넓어 크기를 구분 못 함) 제한하는지 구체적으로 말합니다. (a)는 어느 보고서에나 붙일 수 있어 독자에게 정보를 주지 않습니다.

</details>

**4.** PD 보고서의 결론에 "이 결과는 3주차 마우스 뇌의 신경염증 유전자 변화를 뒷받침한다"고 쓰면 안 되는 이유는? (단답)

<details><summary>정답 보기</summary>

두 데이터는 **종(마우스/사람), 측정 대상(뇌 분자/운동), 참가자, 연구 설계가 모두 다르므로** 한쪽 결과가 다른 쪽을 통계적으로나 인과적으로 뒷받침할 수 없습니다. 두 프로젝트의 연결은 6주차에 문헌 기반 가설 수준에서만 다룹니다.

</details>

**5.** 주요 outcome의 신뢰구간이 0을 포함했고 baseline 성능도 더미와 비슷했습니다. 보고서를 어떻게 써야 할까요?

- (a) 결과가 좋은 다른 feature를 찾아 주요 outcome으로 바꾼다.
- (b) 사전에 정한 outcome의 결과를 그대로 보고하고, 표본 크기와 불확실성을 한계에 적는다.
- (c) 분류 기준과 seed를 바꿔 가며 성능이 가장 좋은 설정을 보고한다.

<details><summary>정답 보기</summary>

**(b)**. 결과를 보고 outcome이나 설정을 바꾸는 것은 Day 30의 "잘 나온 것만 남기기"와 Day 34의 "가장 좋은 숫자 고르기"와 같은 문제로, 결과를 과대평가하게 만듭니다. 기대와 다른 결과도 정직하게 보고하는 것이 탐색 분석의 가치입니다. 다른 feature를 추가로 살펴봤다면 "탐색적 분석"으로 구분해 적습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `reports/pd_motor_phenotype_report.md`에 9개 절이 모두 채워져 있다.
- [ ] 보고서의 핵심 숫자가 예시 2의 재계산 결과 및 Day 30·31·34의 표와 일치한다.
- [ ] 모든 결과 문장에 범위·크기·불확실성이 들어 있다.
- [ ] 한계를 구체적으로 4개 이상 썼다(단일 데이터셋·외부 검증 없음 포함).
- [ ] 과장 표현 점검기를 돌리고 걸린 줄을 모두 검토했다(진단·인과·임상 유용성 주장 없음, 마우스 데이터와 직접 연결 없음).
- [ ] 데이터셋 버전·라이선스·인용을 데이터셋 페이지에서 확인해 적었다.

---
[← 이전](day-34.md) · [코스 지도](../../README.md) · [다음 →](../week-6/day-36.md)
