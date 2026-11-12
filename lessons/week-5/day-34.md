# Day 34 — 평가 해석: accuracy 너머, 그리고 오류 분석

> **주차:** 5주차 · **예상 시간:** 75–90분 · **산출물:** `reports/day34_performance_table.csv` (성능표) + 오류 분석 메모

## 오늘의 목표
- confusion matrix에서 accuracy, precision, recall, F1을 직접 계산하고 각각 무엇을 묻는 숫자인지 설명할 수 있다.
- 참가자 단위 교차검증의 예측으로 ROC-AUC와 PR-AUC를 포함한 성능표를 만들 수 있다.
- 모델이 틀린 참가자를 들여다보고, 성능 숫자가 말해 주는 것과 말해 주지 않는 것을 구분해 쓸 수 있다.

## 🎬 영상으로 먼저 보기

- [Machine Learning Fundamentals: The Confusion Matrix — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=Kdsp6soqA7o) (7분 12초)
- **무엇에 주목할까:** 2×2 표의 네 칸(true positive, false positive, false negative, true negative)이 각각 어떤 상황인지 익히세요. 오늘 나오는 모든 지표는 이 네 칸의 숫자를 다르게 조합한 것입니다.

- [ROC and AUC, Clearly Explained! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=4jRBRDbJemM) (16분 17초)
- **무엇에 주목할까:** 분류 기준(threshold)을 0.5에서 다른 값으로 옮기면 confusion matrix가 달라지고, 그 모든 경우를 한 곡선으로 그린 것이 ROC라는 흐름을 따라가세요. 영상 끝부분의 "양성이 드물 때는 precision을 쓰는 곡선이 더 유용할 수 있다"는 언급이 PR-AUC로 이어집니다.

## 개념 설명

### confusion matrix: 틀린 방식에도 종류가 있다

분류 모델이 틀리는 방식은 두 가지입니다. 대조군을 PD군이라고 하는 것(**false positive, FP**)과 PD군을 대조군이라고 하는 것(**false negative, FN**)입니다. 맞히는 방식도 두 가지입니다(**true positive, TP**와 **true negative, TN**). 이 네 가지를 2×2 표로 정리한 것이 **confusion matrix(혼동 행렬)**입니다. 여기서 "positive"는 우리가 1로 둔 군, 즉 PD군입니다.

이 표는 진단검사를 배울 때 본 2×2 표와 똑같이 생겼습니다. 민감도·특이도를 계산하던 그 표입니다. 그래서 지표의 뜻도 익숙합니다.

- **Accuracy(정확도)** = (TP + TN) / 전체. 전체 중 맞힌 비율.
- **Recall(재현율)** = TP / (TP + FN). 실제 PD군 측정 중 모델이 PD군이라고 한 비율. 진단검사의 **민감도(sensitivity)**와 같은 계산입니다.
- **Precision(정밀도)** = TP / (TP + FP). 모델이 PD군이라고 한 것 중 실제 PD군인 비율. 진단검사의 **양성예측도(PPV)**와 같은 계산입니다.
- **F1** = precision과 recall의 조화평균. 둘 중 하나만 높으면 F1은 낮게 나옵니다.

계산은 같지만 **의미까지 같다고 읽으면 안 됩니다.** 진단검사의 민감도는 그 검사가 쓰일 실제 환자 집단에서 평가한 값입니다. 우리 숫자는 연구용으로 모집된 한 데이터셋 안에서, 군 비율도 연구자가 정한 상태에서 나온 값입니다. 특히 precision은 군의 비율에 따라 크게 달라지므로, 이 데이터셋의 precision을 "양성 판정을 받은 사람이 실제 환자일 확률"로 옮겨 쓰면 안 됩니다.

### 왜 accuracy 하나로는 부족한가

accuracy는 직관적이지만 군의 크기가 다를 때 쉽게 속입니다. 참가자의 90%가 PD군인 데이터에서 무조건 "PD"라고만 답하면 accuracy는 90%입니다. 하지만 이 모델은 대조군을 단 한 명도 알아보지 못합니다. 화재경보기에 비유하면, 한 번도 울리지 않는 경보기는 불이 드문 건물에서 "99.9%의 날에 정확"합니다. 그래도 경보기 구실은 못 합니다.

그래서 accuracy와 함께 recall과 precision을 **군별로** 봅니다. 그리고 한 가지 더, 모델은 사실 0/1이 아니라 **확률**을 내놓습니다. 우리가 0.5를 기준으로 잘랐을 뿐입니다. 기준을 0.3으로 낮추면 더 많은 측정을 PD군으로 분류하므로 recall은 오르고 precision은 떨어집니다. 기준 하나에서 계산한 지표는 모델의 한 단면만 보여 줍니다.

**ROC-AUC**는 기준을 0에서 1까지 모두 움직여 본 결과를 숫자 하나로 요약한 것입니다. 해석은 이렇습니다. "PD군 측정 하나와 대조군 측정 하나를 무작위로 뽑았을 때, 모델이 PD군 쪽에 더 높은 확률을 줄 가능성." 0.5면 동전 던지기, 1.0이면 완벽한 구분입니다. 기준값에 의존하지 않고 군 비율의 영향도 덜 받아서 모델끼리 비교하기에 좋습니다.

**PR-AUC**(scikit-learn에서는 average precision)는 precision과 recall의 관계를 요약합니다. ROC-AUC와 달리 **기준선이 0.5가 아니라 양성군의 비율**입니다. PD군이 20%인 데이터라면 아무것도 모르는 모델의 PR-AUC는 약 0.2입니다. 군이 많이 불균형할 때는 ROC-AUC가 좋아 보여도 PR-AUC는 초라할 수 있으므로 둘을 함께 봅니다.

### 오류 분석: 누구를, 왜 틀렸는가

성능표를 만들었다고 끝이 아닙니다. 임상시험에서 전체 반응률만 보고 끝내지 않고 "어떤 환자가 반응하지 않았는가"를 살피는 것처럼, 모델이 **누구를 틀렸는지** 들여다봐야 합니다. 이것을 오류 분석(error analysis)이라고 합니다.

살펴볼 것은 세 가지입니다. 첫째, **오류가 사람에게 몰려 있는가.** 반복 측정 데이터에서는 대개 "어떤 참가자는 측정 6개를 전부 맞히고 어떤 참가자는 전부 틀리는" 모양이 나옵니다. 이는 오류가 측정 잡음이 아니라 그 사람의 특성에서 온다는 뜻입니다. 둘째, **틀린 참가자들의 공통점이 있는가.** 나이, 성별, 과제, 기기, 결측 여부를 맞힌 참가자들과 비교합니다. Day 31의 교란변수 표를 다시 꺼낼 차례입니다. 예를 들어 모델이 나이 많은 대조군을 PD군으로, 젊은 PD군을 대조군으로 자주 틀린다면, 모델이 "PD의 움직임"이 아니라 "나이 든 사람의 움직임"에 기대고 있을 가능성이 큽니다. 셋째, **모델이 자신 있게 틀린 사례.** 확률 0.95로 틀린 참가자는 데이터 오류(라벨, 센서 착용 문제)이거나 그 군 안에서 특이한 사람일 수 있습니다. Day 25의 QC 기록과 대조합니다.

### 성능 숫자를 문장으로 옮길 때

마지막으로, 숫자를 글로 옮길 때 지킬 원칙입니다.

**높은 성능은 임상 유용성을 자동으로 의미하지 않습니다.** 이미 진단이 확정된 사람과 건강한 자원자를 구분하는 것은, 진단이 불확실한 초기 환자나 비슷한 증상의 다른 질환을 가려내는 것보다 훨씬 쉬운 과제입니다. 실제로 도움이 필요한 것은 후자입니다.

**데이터셋 내부 검증은 외부 검증이 아닙니다.** 참가자 단위 교차검증은 "같은 연구에 참여한 다른 사람"에 대한 성능입니다. 다른 기관, 다른 기기, 다른 모집 기준의 사람들에게 통하는지는 독립된 데이터로만 확인할 수 있습니다.

**표본이 작으면 성능 자체가 불확실합니다.** 참가자 50명으로 얻은 AUC 0.83은 fold에 따라 0.7대에서 0.9대까지 움직입니다. 평균만 쓰지 말고 범위를 함께 씁니다.

그래서 문장은 이렇게 씁니다. "이 데이터셋에서 참가자 단위 5-fold 교차검증으로 평가했을 때, 로지스틱 회귀 baseline은 PD군과 대조군의 측정을 ROC-AUC 0.83(fold 범위 0.xx–0.xx)으로 구분했다." "진단한다", "선별할 수 있다", "임상적으로 유용하다"는 쓰지 않습니다.

## 예시로 이해하기

### 예시 1 — 손으로 세는 confusion matrix: accuracy가 속이는 경우

데이터 없이 숫자 몇 개로 시작합니다. 측정 100개 중 90개가 PD군, 10개가 대조군(HC)이고, 모델은 무조건 "PD"라고만 답한다고 합시다.

```python
import numpy as np
from sklearn.metrics import (accuracy_score, balanced_accuracy_score,
                             confusion_matrix, precision_score, recall_score)

y_true = np.array([1] * 90 + [0] * 10)     # 실제: PD 90개, HC 10개
y_pred = np.ones(100, dtype=int)           # 모델: 전부 PD라고 답함

tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
print(f"TP={tp}  FN={fn}  FP={fp}  TN={tn}")
print(f"accuracy            = {accuracy_score(y_true, y_pred):.2f}")
print(f"recall (PD)         = {recall_score(y_true, y_pred):.2f}   # TP / (TP + FN)")
print(f"precision (PD)      = {precision_score(y_true, y_pred):.2f}   # TP / (TP + FP)")
print(f"recall (HC)         = {recall_score(y_true, y_pred, pos_label=0):.2f}   # TN / (TN + FP), 특이도")
print(f"balanced accuracy   = {balanced_accuracy_score(y_true, y_pred):.2f}   # 두 군 recall의 평균")
```

실행 결과:

```text
TP=90  FN=0  FP=10  TN=0
accuracy            = 0.90
recall (PD)         = 1.00   # TP / (TP + FN)
precision (PD)      = 0.90   # TP / (TP + FP)
recall (HC)         = 0.00   # TN / (TN + FP), 특이도
balanced accuracy   = 0.50   # 두 군 recall의 평균
```

accuracy 0.90, PD군 recall 1.00만 보면 훌륭한 모델 같지만, 대조군의 recall은 0입니다. 대조군을 하나도 알아보지 못했습니다. 두 군의 recall을 평균한 balanced accuracy는 0.50, 즉 동전 던지기입니다. 군의 크기가 다를 때 accuracy만 보고하면 안 되는 이유입니다.

### 예시 2 — 참가자 단위 교차검증으로 성능표 만들기

이제 가상 feature table로 돌아옵니다. `cross_val_predict`는 교차검증의 각 fold에서 **평가용이었을 때의 예측**만 모아 줍니다. 300개 측정 모두에 대해 "그 참가자를 학습에 쓰지 않은 모델의 예측"이 하나씩 생깁니다.

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

from pathlib import Path
import matplotlib.pyplot as plt
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (ConfusionMatrixDisplay, RocCurveDisplay, accuracy_score,
                             average_precision_score, confusion_matrix, f1_score,
                             precision_score, recall_score, roc_auc_score)
from sklearn.model_selection import GroupKFold, cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X = df[FEATURES]
y = (df[GROUP_COL] == "PD").astype(int)       # PD = 1 (positive), HC = 0   🔁 내 군 이름으로
groups = df[ID_COL]
cv = GroupKFold(n_splits=5)                   # Day 33과 같은 참가자 단위 분할

baseline = make_pipeline(StandardScaler(), LogisticRegression())
dummy = DummyClassifier(strategy="most_frequent")

def out_of_fold_proba(model):
    """각 측정이 평가용 fold에 있었을 때의 'PD군일 확률'."""
    return cross_val_predict(model, X, y, cv=cv, groups=groups, method="predict_proba")[:, 1]

def metric_row(proba, threshold=0.5):
    pred = (proba >= threshold).astype(int)
    return {"accuracy": accuracy_score(y, pred),
            "precision": precision_score(y, pred, zero_division=0),
            "recall": recall_score(y, pred),
            "f1": f1_score(y, pred, zero_division=0),
            "roc_auc": roc_auc_score(y, proba),
            "pr_auc": average_precision_score(y, proba)}

proba = out_of_fold_proba(baseline)
pred = (proba >= 0.5).astype(int)

table = pd.DataFrame({"dummy": metric_row(out_of_fold_proba(dummy)),
                      "logistic_baseline": metric_row(proba)}).round(2)
print("confusion matrix (행 = 실제 HC/PD, 열 = 예측 HC/PD):")
print(confusion_matrix(y, pred))
print()
print(table)
print(f"\nPD군 측정의 비율(PR-AUC의 기준선) = {y.mean():.2f}")

# fold마다 ROC-AUC가 얼마나 다른지
fold_auc = [roc_auc_score(y.iloc[test], proba[test]) for _, test in cv.split(X, y, groups)]
print("fold별 ROC-AUC:", np.round(fold_auc, 2), f"→ 범위 {min(fold_auc):.2f}–{max(fold_auc):.2f}")

Path("reports").mkdir(exist_ok=True)
table.to_csv("reports/day34_performance_table.csv")

Path("figures").mkdir(exist_ok=True)
fig, axes = plt.subplots(1, 2, figsize=(9.5, 4))
ConfusionMatrixDisplay.from_predictions(y, pred, display_labels=["HC", "PD"], cmap="Blues",
                                        colorbar=False, ax=axes[0])
axes[0].set_title("Out-of-fold confusion matrix (rows = recordings)")
RocCurveDisplay.from_predictions(y, proba, name="logistic baseline", plot_chance_level=True, ax=axes[1])
axes[1].set_title("ROC curve (participant-wise 5-fold CV)")
fig.suptitle("Synthetic demo data — baseline separating PD vs HC within this dataset")
fig.tight_layout()
fig.savefig("figures/day34_confusion_roc.png", dpi=150)
plt.show()
```

실행 결과:

```text
confusion matrix (행 = 실제 HC/PD, 열 = 예측 HC/PD):
[[112  38]
 [ 43 107]]

           dummy  logistic_baseline
accuracy    0.46               0.73
precision   0.40               0.74
recall      0.16               0.71
f1          0.23               0.73
roc_auc     0.46               0.83
pr_auc      0.48               0.83

PD군 측정의 비율(PR-AUC의 기준선) = 0.50
fold별 ROC-AUC: [0.88 0.78 0.91 0.81 0.74] → 범위 0.74–0.91
```

표를 읽어 봅시다.

- confusion matrix: 대조군 측정 150개 중 112개, PD군 측정 150개 중 107개를 맞혔습니다. 두 종류의 오류(FP 38, FN 43)가 비슷한 크기입니다.
- baseline의 accuracy는 0.73으로 더미(0.46)보다 높습니다. 군 크기가 같아서 이 예에서는 accuracy, precision, recall, F1이 서로 비슷합니다. 군이 불균형한 데이터에서는 이 넷이 크게 벌어집니다.
- ROC-AUC 0.83: PD군 측정과 대조군 측정을 하나씩 뽑으면 83%의 경우에 모델이 PD군 쪽에 더 높은 확률을 준다는 뜻입니다. 더미는 0.46으로 우연 수준(0.5) 근처입니다(fold마다 학습용의 군 비율이 조금씩 달라 정확히 0.5가 되지는 않습니다).
- PR-AUC 0.83은 기준선 0.50(PD군 비율)과 비교해 읽습니다.
- fold별 ROC-AUC가 꽤 넓게 퍼져 있습니다. "0.83"이라는 숫자 하나만 쓰면 이 불확실성이 감춰집니다.

### 예시 3 — 오류 분석: 누구를 틀렸는가

예시 2에 이어서 실행합니다. 측정 단위 예측을 참가자 단위로 모읍니다.

```python
errors = df[[ID_COL, GROUP_COL, "age"]].assign(proba=proba, wrong=(pred != y))

by_person = (errors.groupby([ID_COL, GROUP_COL])
             .agg(age=("age", "first"),
                  mean_proba=("proba", "mean"),        # 측정 6개의 평균 'PD군일 확률'
                  wrong_frac=("wrong", "mean"))        # 틀린 측정의 비율
             .reset_index())
by_person["mostly_wrong"] = by_person["wrong_frac"] > 0.5

n_all_right = (by_person["wrong_frac"] == 0).sum()
n_all_wrong = (by_person["wrong_frac"] == 1).sum()
print(f"측정을 전부 맞힌 참가자 {n_all_right}명, 전부 틀린 참가자 {n_all_wrong}명, "
      f"섞인 참가자 {len(by_person) - n_all_right - n_all_wrong}명")
print()
print("가장 많이 틀린 참가자 6명:")
print(by_person.sort_values("wrong_frac", ascending=False).head(6).round(2).to_string(index=False))
print()
print("군별 · 오류 여부별 인원과 평균 나이:")
print(by_person.groupby([GROUP_COL, "mostly_wrong"]).agg(n=("age", "size"), mean_age=("age", "mean")).round(1))
```

실행 결과:

```text
측정을 전부 맞힌 참가자 29명, 전부 틀린 참가자 6명, 섞인 참가자 15명

가장 많이 틀린 참가자 6명:
participant_id group  age  mean_proba  wrong_frac  mostly_wrong
          P017    PD 51.8        0.15         1.0          True
          P035    HC 73.9        0.92         1.0          True
          P027    HC 60.2        0.91         1.0          True
          P025    PD 62.7        0.38         1.0          True
          P041    HC 59.3        0.68         1.0          True
          P014    PD 66.9        0.27         1.0          True

군별 · 오류 여부별 인원과 평균 나이:
                     n  mean_age
group mostly_wrong
HC    False         20      60.7
      True           5      62.9
PD    False         18      69.6
      True           7      62.4
```

세 가지가 보입니다.

1. **오류는 사람에게 몰려 있습니다.** 50명 중 35명은 측정 6개가 전부 맞거나 전부 틀렸습니다. 오류가 측정마다 생기는 잡음이라기보다 "이 사람은 군의 전형에서 벗어나 있다"에 가깝습니다. 그래서 측정 수를 늘려도 성능은 잘 오르지 않고, 참가자 수가 늘어야 합니다.
2. **자신 있게 틀린 사례가 있습니다.** 평균 확률 0.9 이상으로 PD군이라고 한 대조군, 0.15로 대조군이라고 한 PD군이 있습니다. 실제 데이터라면 이 참가자들의 원자료와 QC 기록을 다시 열어 봅니다.
3. **나이와 관련된 패턴이 있습니다.** 모델이 대조군으로 잘못 분류한 PD군 참가자들은 평균 62세로, 맞힌 PD군(약 70세)보다 젊습니다. 이 가상 데이터에서 가장 큰 가중치를 받은 `stride_time_cv`가 나이와 관련되어 있었기 때문입니다(Day 31). 즉 이 baseline은 일부 "나이 든 사람의 움직임"에 기대고 있습니다. 성능 숫자만 봐서는 알 수 없던 사실입니다.

## 직접 해보기

1. `notebooks/06_pd_baseline_model.ipynb`에 "Day 34 — 평가" 섹션을 만들고 가상 데이터로 예시 1–3을 실행합니다.
2. 준비 코드의 `🔁`를 내 feature table로 바꾸고 예시 2를 실행합니다. `cv`는 Day 33에서 정한 것과 **같은 분할**을 씁니다(`StratifiedGroupKFold`로 바꿨다면 여기서도 그것으로).
3. 성능표 `reports/day34_performance_table.csv`와 그림 `figures/day34_confusion_roc.png`를 만듭니다. 그림 제목의 "Synthetic demo data"를 내 데이터셋 이름과 버전으로 바꿉니다.
4. 성능표 아래에 다음을 적습니다: 측정 수와 참가자 수, PD군 비율(PR-AUC 기준선), 분류 기준(0.5), 검증 방법(참가자 단위 5-fold), fold별 ROC-AUC 범위.
5. 군이 불균형하다면 `recall_score(y, pred, pos_label=0)`(대조군 recall)과 `balanced_accuracy_score`를 표에 추가합니다.
6. 예시 3을 실행해 오류 분석을 합니다. `"age"` 외에 Day 31의 교란변수 표에 있는 변수(성별, 과제, 기기 등)를 `agg`에 추가해 틀린 참가자와 맞힌 참가자를 비교합니다.
7. 오류 분석 메모를 노트북에 5문장 안팎으로 씁니다: ① 오류가 사람에게 몰려 있는가 ② 틀린 참가자들의 공통점 ③ 자신 있게 틀린 사례와 그 QC 기록 ④ 이 결과가 Day 31의 교란 우려와 이어지는가 ⑤ 이 성능이 말해 주지 **않는** 것(외부 검증 아님, 임상 유용성 아님).
8. 결과를 한 문장으로 정리해 둡니다(내일 보고서에 그대로 씁니다): "이 데이터셋에서 참가자 단위 5-fold 교차검증으로 평가했을 때, 로지스틱 회귀 baseline은 PD군과 대조군의 측정을 ROC-AUC ○○(fold 범위 ○○–○○), accuracy ○○(더미 ○○)로 구분했다."

⚠️ **흔한 오류 1 — 어느 군이 positive인지 헷갈림:** precision과 recall은 "1로 둔 군" 기준입니다. `y = (df[GROUP_COL] == "PD").astype(int)`로 만들었으니 PD군이 positive입니다. confusion matrix는 행이 실제, 열이 예측이고 순서는 0(HC), 1(PD)입니다. 표를 보고서에 옮길 때 행·열 이름을 꼭 붙이세요.

⚠️ **흔한 오류 2 — 분류 기준을 바꿔 가며 가장 좋은 숫자 고르기:** 평가용 예측을 보면서 기준(0.5)을 0.42로 바꿔 accuracy를 올리면, 그것도 평가 데이터를 보고 모델을 조정한 누수입니다. 기준은 0.5로 고정하고, 기준에 의존하지 않는 ROC-AUC를 함께 보고하세요.

## 퀴즈

**1.** confusion matrix가 TP = 40, FN = 10, FP = 20, TN = 30입니다. recall과 precision은 각각 얼마인가요? (단답)

<details><summary>정답 보기</summary>

**recall = 40 / (40 + 10) = 0.80, precision = 40 / (40 + 20) ≈ 0.67**입니다. recall은 "실제 positive 중 찾아낸 비율", precision은 "positive라고 한 것 중 실제 positive의 비율"입니다. 분모가 다르다는 것이 핵심입니다.

</details>

**2.** 참가자의 85%가 PD군인 데이터에서 accuracy 0.86을 얻었습니다. 가장 먼저 확인할 것은?

- (a) 더 복잡한 모델을 쓰면 얼마나 오르는지
- (b) 무조건 "PD"라고 답하는 더미 모델의 accuracy(0.85)와 대조군의 recall
- (c) 학습용 accuracy
- (d) feature의 개수

<details><summary>정답 보기</summary>

**(b)**. 군이 불균형하면 다수 군만 답해도 accuracy가 높게 나옵니다. 더미 모델과 거의 같다면 모델은 대조군을 거의 알아보지 못하고 있을 가능성이 큽니다. 대조군 recall이나 balanced accuracy로 확인해야 합니다.

</details>

**3.** ROC-AUC 0.83의 뜻으로 가장 알맞은 것은?

- (a) 측정의 83%를 맞혔다.
- (b) PD군 측정 하나와 대조군 측정 하나를 무작위로 뽑으면, 83%의 경우에 모델이 PD군 측정에 더 높은 확률을 준다.
- (c) PD라고 판정된 사람의 83%가 실제 환자다.
- (d) 이 모델을 병원에서 쓰면 83%의 환자를 찾아낸다.

<details><summary>정답 보기</summary>

**(b)**. ROC-AUC는 두 군을 확률 순서로 얼마나 잘 줄 세우는지를 나타냅니다. (a)는 accuracy, (c)는 precision의 정의이고, (d)는 데이터셋 내부 결과를 임상 성능으로 옮긴 과장입니다.

</details>

**4.** PD군이 전체의 20%인 데이터에서 PR-AUC가 0.25로 나왔습니다. 좋은 결과일까요? (단답)

<details><summary>정답 보기</summary>

**아니요, 거의 우연 수준입니다.** PR-AUC의 기준선은 0.5가 아니라 양성군의 비율(여기서는 0.20)입니다. 0.25는 아무것도 모르는 모델보다 조금 나은 정도입니다.

</details>

**5.** 오류 분석에서 모델이 틀린 대조군 참가자들이 맞힌 대조군보다 평균 나이가 뚜렷이 많았습니다. 이것이 시사하는 바와, 보고서에 써야 할 내용은?

<details><summary>정답 보기</summary>

모델이 PD 고유의 움직임이 아니라 **나이와 관련된 움직임 변화**에 일부 기대어 군을 구분하고 있을 가능성을 시사합니다. 보고서의 한계에 "두 군의 나이 분포가 달라 모델 성능의 일부가 나이 차이를 반영할 수 있다"고 적고, 가능하면 나이가 비슷한 참가자끼리의 결과를 함께 제시합니다.

</details>

## 더 알아보기

> **📚 AUC 옆에 보정을, 전체 옆에 하위집단을**
> 확률을 내놓는 모델은 "누가 더 위험한가"(판별)와 "위험 20%가 정말 20%인가"(보정)를 따로 평가합니다. 모든 확률에 같은 값을 더해도 AUC는 그대로지만 눈금은 틀리므로, 보정 그림과 보정 절편·기울기를 함께 보고합니다. 또 전체 AUC 하나로는 특정 집단에서 모델이 무너져도 보이지 않으니, 사이트·기기·성별·연령대별로 성능을 쪼개고 각 집단의 표본 수와 사건 수를 적습니다. 작은 집단은 신뢰구간이 아주 넓어 집단 간 비교가 성립하지 않는 일이 많습니다.
> → [심화 E — Day E6: 예측 모델과 검증: 판별, 보정, 시간적 외부 검증, 누수](../advanced/E-ehr/day-E6.md), [심화 G — Day G7: 평가·편향·설명·규제, 그리고 정직한 미니 프로젝트](../advanced/G-ai-biomed/day-G7.md)

> **📚 회귀 모델에는 "accuracy"가 없다**
> 숫자를 맞히는 회귀 모델의 `.score()`는 정확도가 아니라 결정계수 R²입니다. 0.43이면 "맞힌 비율 43%"가 아니라 "평균만 찍는 모델보다 오차 제곱을 43% 줄였다"는 뜻입니다. 회귀 성능은 RMSE나 MAE처럼 원래 단위의 오차로도 보고하고, 평균만 내놓는 더미 모델과 비교합니다. 시험 세트가 작으면 R²가 크게 출렁이므로 교차검증 평균과 범위를 함께 적습니다.
> → [심화 G — Day G4: 분자 표현과 활성 예측: SMILES, 지문, QSAR, 분자 생성](../advanced/G-ai-biomed/day-G4.md)

> **📚 신호 검출 이론: 세포 하나의 ROC**
> ROC 곡선은 신경과학의 신호 검출 이론에서도 같은 모양으로 쓰입니다. "이 세포의 발화율로 자극이 있었는지를 얼마나 가를 수 있나"를 묻고, 발화율 문턱을 옮겨 가며 적중률과 오경보율을 그립니다. decoding 성능도 훈련에 쓰지 않은 시행·세션에서만 잽니다. 가장 좋은 시간 창을 같은 데이터로 고른 뒤 그 창의 성능을 보고하면 순환 추론이 됩니다.
> → [심화 C — Day C7: 차원 축소, 분류, 통계: spike sorting, 순열 검정, 군집 기반 보정](../advanced/C-neural-signals/day-C7.md)

## 오늘의 산출물 체크리스트
- [ ] 참가자 단위 교차검증의 out-of-fold 예측으로 confusion matrix를 만들었다.
- [ ] 성능표에 accuracy, precision, recall, F1, ROC-AUC, PR-AUC를 더미 모델과 나란히 넣었다.
- [ ] PD군 비율(PR-AUC 기준선)과 fold별 ROC-AUC 범위를 표 아래에 적었다.
- [ ] 참가자 단위 오류 분석을 하고 5문장 메모를 썼다.
- [ ] 결과 문장을 "이 데이터셋에서 … 구분했다" 형식으로 정리했다.

---
[← 이전](day-33.md) · [코스 지도](../../README.md) · [다음 →](day-35.md)
