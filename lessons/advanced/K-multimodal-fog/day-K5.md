# Day K5 — 멀티모달 모델: 환자 단위 검증, 결측 모달, 그리고 센서 기여도를 묻는 올바른 방법

> **주차:** 심화 파트 K — 멀티모달 FOG 데이터 분석 · **예상 시간:** 90분+ · **산출물:** `notebooks/advanced/K/K5_multimodal_model.ipynb`, `reports/advanced/K/K5_report.md` (아래 보고 양식으로 쓴 환자별 성능·모달 기여도 보고서)
>
> **먼저 끝내 둘 레슨:** [Day K2](day-K2.md)(window 키와 라벨 규칙), [Day K3](day-K3.md)(EMG·SC 특징), [Day K4](day-K4.md)(EEG 대역 파워), [Day 33](../../week-5/day-33.md)(GroupKFold·누수), [Day 34](../../week-5/day-34.md)(PR-AUC와 기준값), [심화 I — Day I19](../I-gait/day-I19.md)(LOSO, random forest, event 단위 평가). 선택: [Day 32](../../week-5/day-32.md)(`feature_importances_`), [심화 G — Day G7](../G-ai-biomed/day-G7.md)(permutation importance)
>
> **이론 노트:** [T11 — 보행동결(FOG)](../I-gait-theory/note-T11.md)

## 오늘의 목표
- 모달별로 따로 만든 특징 표를 같은 window 키로 합치고, 환자마다 없는 센서(결측 모달)를 어떻게 다룰지 선택지를 비교할 수 있다.
- 환자 ID를 group으로 한 LeaveOneGroupOut으로 random forest와 histogram gradient boosting을 평가하고, FOG가 없는 환자가 test fold일 때 생기는 PR-AUC 문제를 pooled 예측과 환자별 보고로 피할 수 있다.
- 모달 제거(ablation), impurity importance, permutation importance가 각각 무엇을 묻는지 구분하고, "어느 센서가 기여했나"에 맞는 답을 골라 보고할 수 있다.

## 🎬 영상으로 먼저 보기

- [StatQuest: Random Forests Part 1 - Building, Using and Evaluating — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=J4Wdy0Wc_xQ) (9분 54초)
- **무엇에 주목할까:** 나무 여러 그루가 bootstrap 표본과 무작위로 고른 변수로 각자 자라고, 투표로 답을 낸다는 흐름을 보세요. 오늘 비교할 gradient boosting은 나무를 **동시에** 키우지 않고 **차례로** 키운다는 점이 다릅니다. 영상의 "out-of-bag" 평가는 같은 환자의 window가 학습과 평가에 섞이므로 오늘 데이터에는 쓰지 않습니다.

## 개념 설명

### 같은 window 키로 표 합치기: 검사 결과지를 등록번호로 붙이듯

K3·K4에서 EMG, SC, EEG 특징을 각각 계산했습니다. 병원에서 혈액검사 결과지와 영상검사 결과지를 **등록번호 + 검사일**로 한 사람의 기록에 붙이듯, 모달별 표는 [Day K2](day-K2.md)에서 정한 **window 키**(`rec`, `task`, `start`)로 붙입니다. `rec`는 기록 이름(`"001"` … `"012"`, 008만 `"008/OFF_1"`, `"008/OFF_2"`), `start`는 window가 시작하는 표본 번호입니다. 환자 ID는 `rec`의 앞 세 글자(`rec[:3]`)라서, 008의 두 세션은 같은 환자가 됩니다. 모든 모달을 같은 500 Hz 시간축에서 같은 `window_starts`로 잘랐기 때문에 같은 키는 같은 2초를 가리킵니다.

pandas의 `merge`에는 안전장치 두 개를 겁니다. `validate="one_to_one"`은 키가 한쪽이라도 중복되면 오류를 내서, 실수로 행이 불어나는 일을 막습니다. `how="left"`는 **라벨 표를 기준**으로 붙여 센서가 없는 window를 NaN으로 남깁니다. 기본값인 `how="inner"`를 쓰면 한 모달이라도 없는 window가 **조용히 사라지고**, 그 센서가 없던 환자 전체가 분석에서 빠질 수 있습니다(예시 1). 합친 뒤에는 행 수가 라벨 표와 같은지 꼭 출력합니다.

### 결측 모달: 어떤 병원은 MRI를 찍지 않는다

K1에서 센 것처럼 이 데이터는 환자마다 붙인 센서가 다릅니다. 환자 002는 팔 센서가 없어 SC가 통째로 없고, 왼쪽 정강이 센서가 없는 환자도 있습니다. 이것은 값 몇 개가 빠진 것과 성격이 다릅니다. **한 사람의 한 모달이 처음부터 없는 것**입니다. 선택지는 넷입니다.

| 선택 | 하는 일 | 대가 |
|---|---|---|
| 환자 빼기 | 그 모달이 없는 환자를 분석에서 제외 | 환자 수가 줄고, 결과가 "그 센서를 단 환자"에게만 해당 |
| 모달 빼기 | 그 모달을 모든 환자에게서 제외 | 다른 환자에게 있던 정보를 버림 |
| NaN 그대로 | NaN을 받는 모델(sklearn의 `HistGradientBoostingClassifier`, 이 레슨의 sklearn 1.9에서는 `RandomForestClassifier`도)에 그대로 넣음 | "센서 없음" 자체가 그 환자를 알아보는 단서가 될 수 있음 |
| 대체(imputation) | 평균 등으로 채우고 "없었음" 표시 열을 추가 | 채울 값은 **학습 fold에서만** 계산해야 누수가 없음 |

어느 것이 정답인지는 질문이 정합니다. "모든 센서를 단 환자에게 이 시스템이 얼마나 맞나"라면 환자 빼기, "실제로 센서 구성이 들쭉날쭉한 환경에서 쓸 수 있나"라면 NaN 처리나 모달 빼기가 맞습니다. 어느 쪽을 골랐는지와 그 때문에 빠진 환자 수를 보고서에 적습니다.

### 환자 단위 검증과, FOG가 없는 환자의 fold

같은 환자의 window끼리는 서로 닮았습니다. 그래서 학습과 평가를 **환자 단위**로 나눕니다([Day 33](../../week-5/day-33.md), [Day I19](../I-gait/day-I19.md)). `LeaveOneGroupOut(groups=환자 ID)`은 환자 한 명씩을 test로 떼어 놓고 나머지로 학습합니다. 여기서 주의할 점은 **group은 기록(세션)이 아니라 환자**라는 것입니다. 환자 008은 두 번 기록했는데(`OFF_1`, `OFF_2`), 세션을 group으로 잡으면 008의 한 세션으로 학습하고 다른 세션으로 평가하게 되어 같은 사람의 버릇이 test에 새어 들어갑니다.

또 하나의 함정은 **FOG가 한 번도 없는 환자**(이 데이터의 005)입니다. 그 환자가 test fold이면 양성이 없으므로 PR-AUC가 정의되지 않습니다. 그런데 sklearn 1.9의 `average_precision_score`는 이때 오류 대신 경고를 내고 **0.0을 돌려줍니다**(ROC-AUC는 NaN). fold별 PR-AUC를 평균하면 이 0이 조용히 섞여 평균을 끌어내립니다(예시 2). 대처는 두 가지를 함께 하는 것입니다. (1) 모든 fold의 test 예측을 모아(**pooled out-of-fold 예측**) PR-AUC를 한 번 계산합니다. (2) 환자별로 따로 보고하되, FOG가 있는 환자는 PR-AUC를 **그 환자의 FOG 비율(기준값)** 과 나란히 적고, FOG가 없는 환자는 PR-AUC 대신 **오경보율**을 적습니다. pooled 값에도 한계가 있습니다. 환자마다 점수 눈금이 다르면 섞는 과정에서 순위가 뒤엉켜, 환자별로는 잘 맞는데 pooled 값은 낮게 나올 수 있습니다. 그래서 두 가지를 같이 봅니다.

### random forest와 gradient boosting: 동시에 키운 숲, 차례로 고친 나무

random forest는 [Day I19](../I-gait/day-I19.md)에서 썼습니다. 나무 수백 그루를 각자 다른 bootstrap 표본으로 **동시에** 키우고 투표하는 방식입니다. **gradient boosting**은 얕은 나무를 **하나씩 차례로** 더합니다. 새 나무는 앞 나무들이 틀린 만큼(잔차의 방향)을 고치도록 학습합니다. 시험 오답 노트처럼 앞에서 틀린 문제에 집중하는 셈입니다. sklearn의 `HistGradientBoostingClassifier`는 연속값을 구간(히스토그램)으로 묶어 빨리 계산하고, NaN을 따로 처리하는 갈래를 스스로 배웁니다. 새 패키지를 설치하지 않아도 됩니다. 논문에 자주 나오는 XGBoost·LightGBM도 같은 계열의 구현입니다.

boosting이 늘 더 낫지는 않습니다. 환자 수가 적고 환자마다 분포가 다르면, 학습 환자들의 특이한 점까지 차례로 고쳐 맞추다가 새 환자에서 더 흔들릴 수 있습니다. 두 모델을 같은 fold로 비교하고, 기본 설정에서 크게 바꾸지 않습니다. 설정을 test 성능을 보며 고르면 그것이 곧 누수입니다.

### 센서 기여도: 세 가지 질문은 서로 다르다

"어느 센서가 FOG 탐지에 기여했나"라는 질문에 흔히 쓰는 숫자는 셋인데, 각각 다른 것을 잽니다.

- **impurity importance**(`feature_importances_`, [Day 32](../../week-5/day-32.md)): 학습 자료 안에서 그 변수로 가지를 칠 때 불순도가 얼마나 줄었는지의 합입니다. **학습 자료로만** 계산하므로 새 환자에게 통하는지는 모릅니다. 값의 종류가 많은 연속 변수가 유리하게 나오는 편향도 있습니다(Strobl 2007). 환자마다 기저값이 다른 변수는 학습 환자를 서로 구별하는 데 많이 쓰여 높게 나올 수 있습니다.
- **permutation importance**([Day G7](../G-ai-biomed/day-G7.md)): 학습이 끝난 모델은 그대로 두고, **test fold**에서 그 변수(오늘은 한 모달의 열을 **함께**)를 섞었을 때 성능이 얼마나 떨어지는지 봅니다. "**이 모델이** 그 센서에 얼마나 기대나"를 묻습니다. 두 모달이 비슷한 정보를 가지면 하나를 섞어도 다른 쪽이 메워 둘 다 작게 나올 수 있습니다.
- **모달 제거(ablation)**: 그 모달을 **빼고 처음부터 다시 학습**해서 같은 환자 단위 검증으로 성능을 잽니다. "**그 센서를 달지 않으면** 성능이 얼마나 달라지나"를 묻습니다. 센서를 실제로 붙일지 말지를 정하는 질문, 즉 보통 말하는 "센서 기여도"에 가장 가깝습니다. 계산은 가장 비쌉니다(모달 수만큼 다시 학습).

실험실 비유로 말하면, impurity는 "실험 노트에 그 시약 이름이 몇 번 나오나", permutation은 "완성된 실험에서 그 시약만 가짜로 바꾸면 결과가 얼마나 무너지나", ablation은 "그 시약 없이 실험을 처음부터 다시 설계하면 결과가 얼마나 나빠지나"입니다. 보고서에는 ablation을 주 결과로, permutation을 보조로 쓰고, impurity만으로 "기여도"를 말하지 않습니다.

## 예시로 이해하기

합성 환자 8명(P8은 두 세션)을 만듭니다. 각 기록은 K1의 합성 뼈대를 함수로 감싼 것입니다(기본값을 넣으면 뼈대와 똑같음). FOG 모양(떨림형·무동형), EMG가 FOG 때 커지는 것, EEG theta가 조금 오르는 것, SC가 FOG와 무관하게 환자마다 기저값만 다른 것은 모두 **설명용 가정**입니다. EMG·EEG·SC는 K3·K4에서 계산했다고 치고 window 단위 숫자로 바로 만듭니다. 합성 데이터는 일부러 쉽게 만들었습니다. 숫자가 아니라 **절차**를 보세요. 실제 데이터의 숫자는 맨 아래에 있습니다.

### 예시 1 — 모달별 표를 window 키로 합치기

```python
import numpy as np
import pandas as pd
from scipy.signal import welch

fs = 500
KEY = ["rec", "start"]                  # K2의 window 키(합성 데이터에는 task가 없음)

def window_starts(n, fs=500, win_s=2.0, step_s=1.0):    # K2의 함수: 2초 window, 50% 겹침
    w, s = int(win_s * fs), int(step_s * fs)
    return np.arange(0, n - w + 1, s)

def window_label(y_win, rule="majority"):               # K2의 함수
    if rule == "majority": return int(y_win.mean() >= 0.5)
    if rule == "any":      return int(y_win.max() == 1)
    if rule == "center":   return int(y_win[len(y_win) // 2])

def skeleton(seed=0, fog=(25, 35), kind="tremble"):
    """K1의 합성 뼈대를 함수로 감쌌다. 기본값이면 뼈대와 똑같다. kind="akinetic"은 떨림 없는 동결(가정)."""
    t = np.arange(0, 60, 1/fs)
    label = ((t >= fog[0]) & (t < fog[1])).astype(int)
    rng = np.random.default_rng(seed)
    frozen = 0.4*np.sin(2*np.pi*5.0*t) if kind == "tremble" else 0.05*np.sin(2*np.pi*1.0*t)
    acc = np.where(label == 0, np.sin(2*np.pi*1.0*t), frozen) + 0.1*rng.standard_normal(t.size)
    return t, label, acc, rng

def fi(x):
    f, p = welch(x, fs=fs, nperseg=len(x))
    return p[(f >= 3) & (f < 8)].sum() / p[(f >= 0.5) & (f < 3)].sum()

# 합성 환자 8명(P8은 두 세션). 모든 FOG 관련 모양은 설명용 가정이다.
plan = [("P1", 1, (25, 35), "tremble"), ("P2", 2, (10, 20), "tremble"),
        ("P3", 3, (30, 45), "akinetic"), ("P4", 4, (40, 50), "tremble"),
        ("P5", 5, (0, 0), "tremble"),                      # FOG가 한 번도 없는 환자
        ("P6", 6, (20, 26), "tremble"), ("P7", 7, (15, 30), "akinetic"),
        ("P8/OFF_1", 8, (25, 35), "tremble"), ("P8/OFF_2", 9, (35, 50), "akinetic")]
acc_t, emg_t, eeg_t, sc_t, lab_t = [], [], [], [], []
for rec, seed, fog, kind in plan:
    t, label, acc, rng = skeleton(seed, fog, kind)
    gain = rng.uniform(0.5, 2.0)                         # 환자마다 다른 근전도 증폭(단위 없음)
    eeg_offset = rng.normal(0, 0.03)                     # 환자마다 다른 EEG 기저값
    sc_base = rng.uniform(500, 2000)                     # 환자마다 다른 피부전도 기저값(ADC 카운트, FOG와 무관하게 둠)
    for s in window_starts(t.size):
        w = slice(s, s + 2 * fs)
        k = {"rec": rec, "start": int(s)}
        y = window_label(label[w])
        lab_t.append({**k, "fog": y})
        acc_t.append({**k, "acc_fi": fi(acc[w]), "acc_sd": acc[w].std()})
        if rec not in ("P2", "P6"):                      # 두 환자는 EMG 센서가 없었다(가정)
            emg_t.append({**k, "emg_rms": gain * (1.6 if y else 1.0) * rng.lognormal(0, 0.25)})
        eeg_t.append({**k, "eeg_rel_theta": 0.15 + eeg_offset + 0.02 * y + rng.normal(0, 0.03)})
        sc_t.append({**k, "sc_mean": sc_base + rng.normal(0, 20)})
lab, acc_f, emg_f, eeg_f, sc_f = (pd.DataFrame(r) for r in (lab_t, acc_t, emg_t, eeg_t, sc_t))
print("행 수  label %d | acc %d | emg %d | eeg %d | sc %d" % (len(lab), len(acc_f), len(emg_f), len(eeg_f), len(sc_f)))

feat = (lab.merge(acc_f, on=KEY, how="left", validate="one_to_one")
           .merge(emg_f, on=KEY, how="left", validate="one_to_one")
           .merge(eeg_f, on=KEY, how="left", validate="one_to_one")
           .merge(sc_f, on=KEY, how="left", validate="one_to_one"))
feat["patient"] = feat["rec"].str[:2]                  # 기록 → 환자 (P8의 두 세션은 같은 환자)
print("합친 표:", feat.shape)
print(feat.groupby("patient").agg(windows=("fog", "size"), fog=("fog", "sum"),
                                  emg_missing=("emg_rms", lambda v: v.isna().mean())).to_string())
inner = lab.merge(emg_f, on=KEY, how="inner")
print("how='inner'로 합치면 남는 행:", len(inner), "| 사라지는 환자:", sorted(set(lab.rec) - set(inner.rec)))
```

실행 결과:

```text
행 수  label 531 | acc 531 | emg 413 | eeg 531 | sc 531
합친 표: (531, 9)
         windows  fog  emg_missing
patient                           
P1            59   11          0.0
P2            59   11          1.0
P3            59   16          0.0
P4            59   11          0.0
P5            59    0          0.0
P6            59    7          1.0
P7            59   16          0.0
P8           118   27          0.0
how='inner'로 합치면 남는 행: 413 | 사라지는 환자: ['P2', 'P6']
```

합성 데이터에는 실제 데이터의 `task`가 없어서 키가 두 칸(`rec`, `start`)이고, 환자 ID는 `rec`의 앞 두 글자입니다. 60초 기록 하나에 2초 window가 59개(0, 1, …, 58초 시작) 나옵니다. `how="left"`로 합친 표는 라벨 표와 같은 531행이고, EMG가 없는 P2·P6은 `emg_rms`가 NaN입니다. `how="inner"`로 합치면 두 환자가 통째로 사라지는데, 오류도 경고도 없습니다.

### 예시 2 — 환자 단위 LeaveOneGroupOut과, FOG 없는 환자의 fold

예시 1에 이어서 실행합니다.

```python
import warnings
from sklearn.model_selection import LeaveOneGroupOut
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import average_precision_score

FEATS = ["acc_fi", "acc_sd", "emg_rms", "eeg_rel_theta", "sc_mean"]
X, y, groups = feat[FEATS], feat["fog"].to_numpy(), feat["patient"].to_numpy()   # group = 환자(세션 아님)

oof = np.zeros(len(y))
fold_ap = {}
for tr, te in LeaveOneGroupOut().split(X, y, groups):
    model = HistGradientBoostingClassifier(random_state=0).fit(X.iloc[tr], y[tr])   # NaN을 그대로 받는다
    oof[te] = model.predict_proba(X.iloc[te])[:, 1]
    with warnings.catch_warnings(record=True) as wlist:
        warnings.simplefilter("always")
        fold_ap[groups[te][0]] = average_precision_score(y[te], oof[te])
        if wlist:
            print("경고(", groups[te][0], "):", str(wlist[0].message)[:60])
print("fold별 PR-AUC:", {k: round(v, 3) for k, v in fold_ap.items()})
print("fold 평균 PR-AUC: %.3f  ← P5(FOG 0개)의 0.000이 섞여 있다" % np.mean(list(fold_ap.values())))
print("pooled PR-AUC: %.3f | 기준값(FOG 비율) %.3f" % (average_precision_score(y, oof), y.mean()))
p5 = groups == "P5"
print("P5: window %d개 중 확률 0.5 이상(오경보) %d개" % (p5.sum(), (oof[p5] >= 0.5).sum()))
```

실행 결과(sklearn 1.9.1):

```text
경고( P5 ): No positive class found in y_true, recall is set to one for 
fold별 PR-AUC: {'P1': 0.917, 'P2': 1.0, 'P3': 1.0, 'P4': 1.0, 'P5': 0.0, 'P6': 1.0, 'P7': 1.0, 'P8': 1.0}
fold 평균 PR-AUC: 0.865  ← P5(FOG 0개)의 0.000이 섞여 있다
pooled PR-AUC: 0.985 | 기준값(FOG 비율) 0.186
P5: window 59개 중 확률 0.5 이상(오경보) 0개
```

P5의 fold는 FOG가 없는데도 PR-AUC 0.0이 "계산"되어 평균을 0.865로 끌어내렸습니다. P5에서 모델은 오경보를 하나도 내지 않았으니, 실제로는 P5에서 가장 잘한 셈입니다. pooled 값(0.985)은 기준값 0.186과 함께 적고, P5는 오경보 수로 따로 적습니다. `groups`에 환자 ID를 넣었으므로 P8의 두 세션은 한 fold에 같이 들어가 fold가 8개입니다.

### 예시 3 — 결측 처리, 두 모델, 그리고 세 가지 기여도

예시 1에 이어서 실행합니다(예시 2를 건너뛰어도 됨). random forest는 window 531개 × fold 8개를 여러 번 학습하므로 20초쯤 걸립니다.

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import LeaveOneGroupOut
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import average_precision_score

MODAL = {"acc": ["acc_fi", "acc_sd"], "emg": ["emg_rms"], "eeg": ["eeg_rel_theta"], "sc": ["sc_mean"]}
y, groups = feat["fog"].to_numpy(), feat["patient"].to_numpy()

def make(kind):
    if kind == "RF":
        return RandomForestClassifier(n_estimators=300, min_samples_leaf=3, n_jobs=-1, random_state=0)
    return HistGradientBoostingClassifier(random_state=0)

def logo_oof(cols, kind="HGB", data=feat):
    """환자 하나씩 빼고 학습 → 뺀 환자 예측. 모든 fold의 예측을 모아(pooled) 돌려준다."""
    X, yy, gg = data[cols], data["fog"].to_numpy(), data["patient"].to_numpy()
    oof = np.zeros(len(yy))
    for tr, te in LeaveOneGroupOut().split(X, yy, gg):
        oof[te] = make(kind).fit(X.iloc[tr], yy[tr]).predict_proba(X.iloc[te])[:, 1]
    return oof

ALL = sum(MODAL.values(), [])
# (1) 결측 모달 처리 세 가지 (HGB)
opts = {"그대로 NaN (모델이 처리)": feat,
        "EMG 없는 환자 빼기": feat[feat["emg_rms"].notna()]}
for name, data in opts.items():
    o = logo_oof(ALL, "HGB", data)
    print(f"{name:22s} 환자 {data.patient.nunique()}명  PR-AUC {average_precision_score(data.fog, o):.3f}")
o = logo_oof([c for c in ALL if c != "emg_rms"], "HGB")
print(f"{'EMG를 모두에게서 빼기':22s} 환자 {feat.patient.nunique()}명  PR-AUC {average_precision_score(y, o):.3f}")

# (2) 모델 두 종류
for kind in ["RF", "HGB"]:
    print(kind, "pooled PR-AUC %.3f" % average_precision_score(y, logo_oof(ALL, kind)))

# (3) 모달 제거(ablation): 그 모달을 빼고 '다시 학습'해서 떨어지는 만큼
full = average_precision_score(y, logo_oof(ALL, "RF"))
for m, cols in MODAL.items():
    ap = average_precision_score(y, logo_oof([c for c in ALL if c not in cols], "RF"))
    print(f"ablation  -{m:3s}: PR-AUC {ap:.3f} (변화 {ap - full:+.3f})")

# (4) impurity importance: 학습 자료 안에서 갈라 쓴 정도 (전체로 한 번 학습)
rf = make("RF").fit(feat[ALL], y)
imp = pd.Series(rf.feature_importances_, index=ALL)
print("impurity  :", {m: float(round(imp[cols].sum(), 3)) for m, cols in MODAL.items()})

# (5) permutation importance(모달 단위): 학습된 모델은 그대로 두고, test fold에서 그 모달의 열을 함께 섞는다
rng = np.random.default_rng(0)
perm = {m: np.zeros((5, len(y))) for m in MODAL}          # 5번 반복 × window
for tr, te in LeaveOneGroupOut().split(feat, y, groups):
    model = make("RF").fit(feat[ALL].iloc[tr], y[tr])
    Xte = feat[ALL].iloc[te]
    for m, cols in MODAL.items():
        for r in range(5):
            Xp = Xte.copy()
            Xp[cols] = Xte[cols].to_numpy()[rng.permutation(len(te))]   # 같은 순서로 함께 섞어 모달 안의 관계는 유지
            perm[m][r, te] = model.predict_proba(Xp)[:, 1]
for m in MODAL:
    d = [full - average_precision_score(y, perm[m][r]) for r in range(5)]
    print(f"permutation {m:3s}: PR-AUC 감소 {np.mean(d):.3f} ± {np.std(d):.3f}")
```

실행 결과(sklearn 1.9.1):

```text
그대로 NaN (모델이 처리)       환자 8명  PR-AUC 0.985
EMG 없는 환자 빼기           환자 6명  PR-AUC 0.977
EMG를 모두에게서 빼기          환자 8명  PR-AUC 0.985
RF pooled PR-AUC 1.000
HGB pooled PR-AUC 0.985
ablation  -acc: PR-AUC 0.513 (변화 -0.487)
ablation  -emg: PR-AUC 1.000 (변화 +0.000)
ablation  -eeg: PR-AUC 1.000 (변화 +0.000)
ablation  -sc : PR-AUC 1.000 (변화 +0.000)
impurity  : {'acc': 0.948, 'emg': 0.044, 'eeg': 0.007, 'sc': 0.001}
permutation acc: PR-AUC 감소 0.756 ± 0.011
permutation emg: PR-AUC 감소 0.000 ± 0.000
permutation eeg: PR-AUC 감소 0.000 ± 0.000
permutation sc : PR-AUC 감소 0.000 ± 0.000
```

읽는 법:
- **결측 처리:** "환자 빼기"의 0.977은 환자 6명에 대한 값이라 다른 두 줄과 같은 잣대가 아닙니다. 결측 처리 방법을 비교할 때는 평가 대상(환자 집합)이 같은지부터 봅니다.
- **ablation과 permutation의 차이:** ACC를 섞으면 PR-AUC가 0.756 떨어지지만, ACC를 빼고 **다시 학습**하면 0.487만 떨어집니다. 다시 학습한 모델은 EMG(가정상 FOG 때 커짐)에 기대는 법을 새로 배우기 때문입니다. "이 모델이 ACC에 기대는 정도"와 "ACC 센서를 빼면 잃는 정도"는 다른 숫자입니다.
- **EMG가 0으로 나오는 이유:** ACC가 있으면 모델은 EMG를 거의 쓰지 않아 permutation도 ablation도 0입니다. 그렇다고 EMG에 정보가 없는 것은 아닙니다(직접 해보기 5에서 두 모달을 함께 빼 봅니다).

## 직접 해보기

모두 예시 1(필요하면 예시 3의 함수 정의까지)에 이어서 실행합니다.

**문제 1 — 안전하게 합치기.** 빈칸을 채워 라벨 표에 EMG 표를 붙이세요. 행 수가 531로 유지되어야 합니다.

```python
merged = lab.merge(emg_f, on=____, how="left", validate="one_to_one")
print(merged.shape, "| emg 결측 행:", int(merged["emg_rms"].isna().sum()))
```

<details><summary>모범답안 보기</summary>

```python
merged = lab.merge(emg_f, on=KEY, how="left", validate="one_to_one")
```

출력: `(531, 4) | emg 결측 행: 118`. 키 일부(예: `on="start"`)로만 합치면 다른 환자의 같은 시작 시각끼리 붙어 `validate="one_to_one"`이 `MergeError`를 냅니다. 이 오류가 안전장치가 일한 결과입니다.

</details>

**문제 2 — group 고르기.** 빈칸을 채워 fold가 환자 수(8)만큼 나오게 하세요.

```python
groups = feat[____].to_numpy()
print("fold 수:", LeaveOneGroupOut().get_n_splits(groups=groups))
```

<details><summary>모범답안 보기</summary>

```python
groups = feat["patient"].to_numpy()
```

출력: `fold 수: 8`. `feat["rec"]`처럼 기록(세션)을 group으로 잡으면 fold가 9개가 되고, P8의 한 세션으로 학습해 다른 세션을 평가하게 됩니다. 합성 데이터에서는 차이가 보이지 않습니다. 실제 데이터 2에서 008로 직접 비교합니다.

</details>

**문제 3 — 환자별 보고.** 예시 3의 함수로 pooled 예측을 만든 뒤, FOG가 있는 환자는 PR-AUC와 기준값을, 없는 환자는 오경보율을 출력하세요.

```python
o_pat = logo_oof(ALL, "RF")
for pid, g in feat.assign(p=o_pat).groupby("patient"):
    yy, pp = g["fog"].to_numpy(), g["p"].to_numpy()
    if ____:
        print(f"{pid}: PR-AUC {average_precision_score(yy, pp):.3f} (기준값 {yy.mean():.2f})")
    else:
        print(f"{pid}: FOG 없음 → 오경보율 {(pp >= 0.5).mean():.2f}")
```

<details><summary>모범답안 보기</summary>

```python
    if yy.sum() > 0:
```

출력:

```text
P1: PR-AUC 1.000 (기준값 0.19)
P2: PR-AUC 1.000 (기준값 0.19)
P3: PR-AUC 1.000 (기준값 0.27)
P4: PR-AUC 1.000 (기준값 0.19)
P5: FOG 없음 → 오경보율 0.00
P6: PR-AUC 1.000 (기준값 0.12)
P7: PR-AUC 1.000 (기준값 0.27)
P8: PR-AUC 1.000 (기준값 0.23)
```

FOG window가 몇 개뿐인 환자(실제 데이터의 002는 4개)는 PR-AUC가 정의는 되지만 매우 불안정합니다. 그런 환자는 FOG window 수를 함께 적어 읽는 사람이 판단하게 합니다.

</details>

**문제 4 — 모달 단위로 섞기.** 예시 3의 (5)에서 한 모달의 열을 **같은 순서로 함께** 섞는 줄입니다. 빈칸을 채우세요.

```python
Xp[cols] = Xte[cols].to_numpy()[____]
```

<details><summary>모범답안 보기</summary>

```python
Xp[cols] = Xte[cols].to_numpy()[rng.permutation(len(te))]
```

출력은 예시 3의 `permutation` 네 줄과 같습니다(ACC 0.756 ± 0.011, 나머지 0.000). 열마다 따로 섞으면(`for c in cols: Xp[c] = rng.permutation(Xp[c])`) 같은 모달 안의 두 변수(`acc_fi`, `acc_sd`)의 관계까지 깨져 "모달 하나를 잃은 것"과 다른 상황이 됩니다. sklearn의 `permutation_importance`는 변수를 하나씩 섞으므로 모달 단위 질문에는 이렇게 직접 씁니다.

</details>

**문제 5 — 두 모달을 함께 빼기.** 빈칸을 채워 ACC, EMG, ACC+EMG를 뺀 세 경우를 비교하세요.

```python
for drop in [["acc"], ["emg"], ["acc", "emg"]]:
    cols = [c for m, cs in MODAL.items() if ____ for c in cs]
    print("-%-8s PR-AUC %.3f" % ("+".join(drop), average_precision_score(y, logo_oof(cols, "RF"))))
```

<details><summary>모범답안 보기</summary>

```python
    cols = [c for m, cs in MODAL.items() if m not in drop for c in cs]
```

출력:

```text
-acc      PR-AUC 0.513
-emg      PR-AUC 1.000
-acc+emg  PR-AUC 0.210
```

EMG만 빼면 손실이 0이고 ACC만 빼면 0.487을 잃지만, 둘을 함께 빼면 기준값(0.186) 근처인 0.210까지 떨어집니다. ACC가 없을 때 EMG가 대신 일했던 것입니다. 정보가 겹치는 센서는 하나씩 빼는 ablation에서 기여도가 작게 나옵니다. 그래서 "EMG는 쓸모없다"가 아니라 "ACC가 있을 때는 EMG가 더 보태는 것이 없다"고 씁니다.

</details>

⚠️ **흔한 오류 1 — fold별 PR-AUC를 평균하기.** FOG가 없는 환자의 fold는 sklearn이 경고와 함께 0.0을 돌려줍니다. pooled 예측으로 한 번 계산하고, 환자별 표를 따로 붙입니다.

⚠️ **흔한 오류 2 — 전체 데이터로 대체값·정규화·threshold 정하기.** 평균 대체, z-score, 확률 threshold는 모두 **학습 fold 안에서만** 정합니다. 전체 데이터로 정하면 test 환자의 정보가 학습에 들어갑니다(Day 33). sklearn `Pipeline`에 넣어 두면 fold마다 자동으로 다시 맞춥니다.

### 실제 데이터로 해보기 (선택)

**준비:** [Day K4](day-K4.md)와 같이 Mendeley Data v3(doi:[10.17632/r8gmbtv7w2.3](https://doi.org/10.17632/r8gmbtv7w2.3), CC BY 4.0)를 `data/xuanwu/`에 풉니다. 1번은 과제 파일 56개(3.6 GB)를 모두 읽어 window 특징 표 `features_K5.csv`를 만들고(몇 분), 2번은 그 표로 모델을 평가합니다(random forest를 여러 번 학습하므로 수 분–십수 분). 이 특징 표도 환자 기록에서 나온 것이므로 저장소에 올리지 않습니다. 아래 출력은 이 레슨 작성 때 v3로 실제로 돌린 결과입니다.

특징은 일부러 단순하게 골랐습니다. 모달마다 window 하나를 숫자 한두 개로 줄였습니다.

| 모달 | 특징 | 만든 방법 |
|---|---|---|
| ACC | `acc_sd`, `acc_fi` | 정강이 가속도 크기(√(x²+y²+z²))에서 window 평균을 뺀 뒤 표준편차, freeze index(3–8 / 0.5–3 Hz, [Day I18](../I-gait/day-I18.md)). 왼쪽 정강이가 없으면 오른쪽 |
| EMG | `emg_ta_logrms` | 양쪽 전경골근(TA) 두 열을 [Day K3](day-K3.md)와 같이 20–240 Hz band-pass한 뒤 window RMS의 로그를 평균. 열 위치는 README 표(K1의 `L_TA`, `R_TA`) |
| SC | `sc_mean`, `sc_slope` | 팔 IMU 7번째 열(SC)의 window 평균과 기울기. 팔 센서가 없는 기록은 행을 만들지 않음 → NaN |
| EEG | `eeg_rel_theta`, `eeg_rel_beta`, `eeg_hi_60_100` | Cz·FC1·FC2의 상대 theta·beta, 60–100 Hz 파워의 로그([Day K4](day-K4.md)) |

**1. 모달별 특징 표를 만들고 window 키로 합치기**

```python
import glob, os
import numpy as np
import pandas as pd
from scipy.signal import welch, butter, sosfiltfilt

DATA = "data/xuanwu/Filtered Data"
FS, WIN = 500, 1000                                      # 2초 window
KEY = ["rec", "task", "start"]                          # K2의 window 키 (rec = "001" … 또는 "008/OFF_1")
EEG = ["FP1","FP2","F3","F4","C3","C4","P3","P4","O1","O2","F7","F8","P7","P8",
       "Fz","Cz","Pz","FC1","FC2","CP1","CP2","FC5","FC6","CP5","CP6"]
IMU = [f"{s}_{q}" for s in ["LShank","RShank","Waist","Arm"] for q in ["ax","ay","az","gx","gy","gz","x7"]]
COLS = ["idx","clock"] + EEG + ["c27","c28","c29","c30","c31"] + IMU + ["label"]   # K1의 열 이름
# README 표의 전경골근(TA) 열 번호 (K1)
L_TA = {"001":28,"002":28,"003":27,"004":27,"005":27,"006":28,"007":28,"008/OFF_1":28,"008/OFF_2":31,"009":27,"010":27,"011":27,"012":27}
R_TA = {"001":27,"002":27,"003":28,"004":28,"005":28,"006":27,"007":27,"008/OFF_1":27,"008/OFF_2":27,"009":28,"010":28,"011":28,"012":28}

def window_starts(n, fs=500, win_s=2.0, step_s=1.0):    # K2의 함수: 2초 window, 50% 겹침
    w, s = int(win_s * fs), int(step_s * fs)
    return np.arange(0, n - w + 1, s)

def window_label(y_win, rule="majority"):               # K2의 함수
    if rule == "majority": return int(y_win.mean() >= 0.5)
    if rule == "any":      return int(y_win.max() == 1)
    if rule == "center":   return int(y_win[len(y_win) // 2])

def band(x, lo, hi, nperseg):
    f, p = welch(x, fs=FS, nperseg=nperseg, axis=-1)
    return p[..., (f >= lo) & (f < hi)].sum(-1)

acc_rows, emg_rows, sc_rows, eeg_rows, lab_rows, used = [], [], [], [], [], []
for path in sorted(glob.glob(os.path.join(DATA, "**", "task_*.txt"), recursive=True)):
    parts = os.path.relpath(path, DATA).split(os.sep)
    rec, task = "/".join(parts[:-1]), parts[-1][:-4]     # "003" 또는 "008/OFF_1", "task_1"
    d = pd.read_csv(path, header=None, names=COLS, usecols=COLS[2:])   # 행 번호·시각 문자열은 빼고 읽는다
    side = "LShank" if (d[["LShank_ax", "LShank_ay", "LShank_az"]] != 0).any(axis=None) else "RShank"   # 왼쪽이 없으면 오른쪽
    ta = [f"c{L_TA[rec]}", f"c{R_TA[rec]}"]                # 양쪽 전경골근
    acc_mag = np.sqrt(sum(d[f"{side}_{q}"].to_numpy() ** 2 for q in ["ax", "ay", "az"]))
    sc = d["Arm_x7"].to_numpy()                          # 팔 IMU의 7번째 열 = SC
    has_sc = np.any(sc != 0)
    eeg = d[["Cz", "FC1", "FC2"]].to_numpy().T
    sos = butter(4, (20, 240), btype="bandpass", fs=FS, output="sos")   # K3: 파일의 EMG는 10 Hz 아래 파워가 대부분
    emg = {c: sosfiltfilt(sos, d[c].to_numpy() - d[c].mean()) for c in ta}
    y = d["label"].to_numpy().astype(int)
    used.append({"rec": rec, "shank": side, "SC": has_sc})
    for s in window_starts(len(d)):
        k = dict(rec=rec, task=task, start=int(s))
        w = slice(s, s + WIN)
        x = acc_mag[w] - acc_mag[w].mean()
        acc_rows.append({**k, "acc_sd": x.std(),
                         "acc_fi": band(x, 3, 8, WIN) / band(x, 0.5, 3, WIN)})
        emg_rows.append({**k, "emg_ta_logrms": np.mean([np.log(np.sqrt(np.mean(emg[c][w] ** 2))) for c in ta])})
        if has_sc:                                        # 센서가 없는 기록은 행 자체를 만들지 않는다
            tt = np.arange(WIN) / FS
            sc_rows.append({**k, "sc_mean": sc[w].mean(), "sc_slope": np.polyfit(tt, sc[w], 1)[0]})
        tot = band(eeg[:, w], 1, 45, 500)
        eeg_rows.append({**k, "eeg_rel_theta": (band(eeg[:, w], 4, 8, 500) / tot).mean(),
                         "eeg_rel_beta": (band(eeg[:, w], 13, 30, 500) / tot).mean(),
                         "eeg_hi_60_100": np.log(band(eeg[:, w], 60, 100, 500).mean())})
        lab_rows.append({**k, "fog": window_label(y[w], "majority")})

print(pd.DataFrame(used).drop_duplicates().to_string(index=False))
tables = {name: pd.DataFrame(r) for name, r in
          [("label", lab_rows), ("acc", acc_rows), ("emg", emg_rows), ("sc", sc_rows), ("eeg", eeg_rows)]}
for name, tb in tables.items():
    print(f"{name:5s} 행 {len(tb):6d}  키 중복 {tb.duplicated(KEY).sum()}")
feat = tables["label"]
for name in ["acc", "emg", "sc", "eeg"]:
    feat = feat.merge(tables[name], on=KEY, how="left", validate="one_to_one")   # 라벨 표 기준으로 붙인다
feat.to_csv("features_K5.csv", index=False)
print("합친 표:", feat.shape, "| SC 결측 window:", int(feat["sc_mean"].isna().sum()))
```

실행 결과(Mendeley v3):

```text
      rec  shank    SC
      001 LShank  True
      002 RShank False
      003 LShank  True
      004 RShank  True
      005 LShank  True
      006 LShank  True
      007 LShank  True
008/OFF_1 LShank  True
008/OFF_2 LShank  True
      009 LShank  True
      010 LShank  True
      011 LShank  True
      012 RShank  True
label 행  12366  키 중복 0
acc   행  12366  키 중복 0
emg   행  12366  키 중복 0
sc    행  11833  키 중복 0
eeg   행  12366  키 중복 0
합친 표: (12366, 12) | SC 결측 window: 533
```

결측 모달은 SC 하나, 환자 002의 window 533개입니다(팔 센서의 7개 열이 모두 0). 정강이 센서는 모든 기록에 적어도 한쪽이 있지만 002·004·012는 **오른쪽**, 나머지는 왼쪽을 썼습니다. 같은 이름의 특징(`acc_fi`)이 환자에 따라 다른 다리에서 왔다는 뜻이고, 이것도 보고서에 적을 사항입니다.

**2. 환자 단위 검증, 환자별 보고, ablation, 두 가지 importance**

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import LeaveOneGroupOut
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import average_precision_score, roc_auc_score

feat = pd.read_csv("features_K5.csv", dtype={"rec": str})   # "001"의 0을 지키려면 str
feat["patient"] = feat["rec"].str[:3]                   # 기록 → 환자 (008의 두 세션은 한 환자)
MODAL = {"acc": ["acc_sd", "acc_fi"], "emg": ["emg_ta_logrms"], "sc": ["sc_mean", "sc_slope"],
         "eeg": ["eeg_rel_theta", "eeg_rel_beta", "eeg_hi_60_100"]}
ALL = sum(MODAL.values(), [])
y = feat["fog"].to_numpy()

def make(kind):
    if kind == "RF":
        return RandomForestClassifier(n_estimators=300, min_samples_leaf=5, n_jobs=-1, random_state=0)
    return HistGradientBoostingClassifier(random_state=0)

def logo_oof(cols, kind="RF", groups=feat["patient"].to_numpy()):
    oof = np.zeros(len(y))
    for tr, te in LeaveOneGroupOut().split(feat, y, groups):
        oof[te] = make(kind).fit(feat[cols].iloc[tr], y[tr]).predict_proba(feat[cols].iloc[te])[:, 1]
    return oof

print("window %d개, 환자 %d명, 세션 %d개, FOG 비율(PR-AUC 기준값) %.3f"
      % (len(feat), feat.patient.nunique(), feat["rec"].nunique(), y.mean()))
res = {}
for kind in ["RF", "HGB"]:
    res[kind] = logo_oof(ALL, kind)
    print(f"{kind:3s} pooled PR-AUC {average_precision_score(y, res[kind]):.3f}  ROC-AUC {roc_auc_score(y, res[kind]):.3f}")

# 환자별 보고 (RF)
rows = []
for pid, g in feat.assign(p=res["RF"]).groupby("patient"):
    yy, pp = g["fog"].to_numpy(), g["p"].to_numpy()
    rows.append({"patient": pid, "windows": len(g), "fog_%": round(100 * yy.mean(), 1),
                 "PR_AUC": round(average_precision_score(yy, pp), 3) if yy.sum() >= 1 else "정의 안 됨",
                 "sens@0.5": round((pp[yy == 1] >= 0.5).mean(), 2) if yy.sum() else "-",
                 "false_alarm@0.5": round((pp[yy == 0] >= 0.5).mean(), 2)})
print(pd.DataFrame(rows).to_string(index=False))

# group을 세션으로 잡으면? (008의 두 세션이 서로를 돕는다)
ses_groups = feat["rec"].to_numpy()
o_ses = logo_oof(ALL, "RF", ses_groups)
m8 = (feat["patient"] == "008").to_numpy()
print("008 PR-AUC: group=환자 %.3f | group=세션 %.3f" % (average_precision_score(y[m8], res["RF"][m8]),
                                                       average_precision_score(y[m8], o_ses[m8])))

# 모달 제거(ablation): 빼고 다시 학습
full = average_precision_score(y, res["RF"])
for m, cols in MODAL.items():
    ap = average_precision_score(y, logo_oof([c for c in ALL if c not in cols]))
    print(f"ablation -{m:3s}: PR-AUC {ap:.3f} ({ap - full:+.3f})")
for m, cols in MODAL.items():
    ap = average_precision_score(y, logo_oof(cols))
    print(f"{m:3s}만 사용  : PR-AUC {ap:.3f}")

# impurity importance (전체로 한 번 학습, 모달별 합)
imp = pd.Series(make("RF").fit(feat[ALL], y).feature_importances_, index=ALL)
print("impurity:", {m: float(round(imp[c].sum(), 3)) for m, c in MODAL.items()})

# permutation importance (모달 단위, test fold 안에서 섞기, 5회)
rng = np.random.default_rng(0)
perm = {m: np.zeros((5, len(y))) for m in MODAL}
for tr, te in LeaveOneGroupOut().split(feat, y, feat["patient"]):
    model = make("RF").fit(feat[ALL].iloc[tr], y[tr])
    Xte = feat[ALL].iloc[te]
    for m, cols in MODAL.items():
        for r in range(5):
            Xp = Xte.copy()
            Xp[cols] = Xte[cols].to_numpy()[rng.permutation(len(te))]
            perm[m][r, te] = model.predict_proba(Xp)[:, 1]
for m in MODAL:
    d = [full - average_precision_score(y, perm[m][r]) for r in range(5)]
    print(f"permutation {m:3s}: PR-AUC 감소 {np.mean(d):.3f} ± {np.std(d):.3f}")
```

실행 결과(Mendeley v3, sklearn 1.9.1; 환자 005 fold의 PR-AUC 경고는 환자별 표에서 이미 처리했으므로 출력에 없음). 같은 코드를 두 번 돌렸을 때 한 번은 `` `sklearn.utils.parallel.delayed` should be used with ... `` 라는 UserWarning이 수만 줄 함께 찍혔습니다(`n_jobs=-1`의 여러 스레드에서 생기는 경고로 보임). 두 번 모두 아래 숫자는 똑같았으므로, 이 경고가 나오면 숫자 줄만 확인하면 됩니다.

```text
window 12366개, 환자 12명, 세션 13개, FOG 비율(PR-AUC 기준값) 0.456
RF  pooled PR-AUC 0.644  ROC-AUC 0.704
HGB pooled PR-AUC 0.589  ROC-AUC 0.569
patient  windows  fog_% PR_AUC sens@0.5  false_alarm@0.5
    001      749   37.7  0.784     0.83             0.16
    002      533    0.8  0.143      1.0             0.10
    003     2065   87.5  0.958      0.0             0.00
    004      639   23.3  0.585     0.88             0.44
    005      302    0.0 정의 안 됨        -             0.33
    006     1057   35.8   0.75     0.27             0.04
    007      682   53.2  0.883     0.67             0.09
    008     1759   52.2  0.899      0.7             0.09
    009      786   19.7  0.463     0.37             0.08
    010     1603   50.0  0.749     0.83             0.34
    011     1157   45.3  0.696      0.8             0.29
    012     1034   25.0  0.618     0.84             0.26
008 PR-AUC: group=환자 0.899 | group=세션 0.900
ablation -acc: PR-AUC 0.403 (-0.241)
ablation -emg: PR-AUC 0.626 (-0.019)
ablation -sc : PR-AUC 0.807 (+0.162)
ablation -eeg: PR-AUC 0.622 (-0.022)
acc만 사용  : PR-AUC 0.798
emg만 사용  : PR-AUC 0.492
sc 만 사용  : PR-AUC 0.367
eeg만 사용  : PR-AUC 0.399
impurity: {'acc': 0.551, 'emg': 0.104, 'sc': 0.204, 'eeg': 0.141}
permutation acc: PR-AUC 감소 0.206 ± 0.005
permutation emg: PR-AUC 감소 0.013 ± 0.002
permutation sc : PR-AUC 감소 -0.005 ± 0.001
permutation eeg: PR-AUC 감소 0.005 ± 0.001
```

**결과 읽기(탐색적 관찰):**
- **기준값부터:** window의 45.6%가 FOG라서 아무것도 모르는 모델의 PR-AUC가 0.456입니다. 네 모달을 다 쓴 random forest(0.644)는 그보다 낫지만, **ACC만 쓴 모델(0.798)보다 못합니다.** HGB(0.589, ROC-AUC 0.569)는 random forest보다 더 흔들렸습니다.
- **SC가 오히려 해를 끼침:** SC를 빼면 PR-AUC가 0.162 **올라갑니다**(0.807). 그런데 impurity importance는 SC를 두 번째로 높게(0.204) 매겼고, permutation은 거의 0(−0.005)입니다. 환자마다 SC 기저값(이 데이터에서 window 평균 약 600–1960 ADC 카운트)이 크게 달라서, 나무가 SC로 "학습 환자들을 서로 구별"하는 데 가지를 많이 썼고, 그 갈래가 처음 보는 환자에게는 엉뚱하게 작동한 것으로 보입니다. 학습 자료만 보는 impurity가 왜 "기여도" 답이 될 수 없는지 보여 주는 예입니다.
- **EMG·EEG:** 하나씩 뺐을 때 약 0.02씩 떨어집니다(EMG −0.019, EEG −0.022). 단독으로는 EMG 0.492로 기준값을 조금 넘고, EEG 0.399와 SC 0.367은 기준값(0.456)보다도 낮습니다. pooled PR-AUC는 환자마다 다른 점수 눈금을 섞으므로, 환자 사이 기저값 차이가 큰 특징을 그대로 쓰면 단독 성능이 기준값 아래로도 떨어질 수 있습니다.
- **환자별:** 003은 PR-AUC 0.958이지만 그 환자의 기준값이 0.875라서 크게 나은 것이 아니고, 확률 0.5를 한 번도 넘지 않아 민감도가 0입니다. 002는 FOG window 4개로 PR-AUC 0.143(기준값 0.008)이라 숫자를 믿기 어렵습니다. FOG가 없는 005는 window의 33%에서 경보가 울렸습니다.
- **group 선택:** 008을 세션 단위로 나눠도 PR-AUC가 0.899 → 0.900으로 거의 같았습니다. 이 레슨을 쓰며 EMG를 band-pass하기 전의 특징으로 같은 비교를 했을 때는 0.862 → 0.889로 더 벌어졌습니다. 누수의 크기는 특징에 따라 달라지므로, 이번에 작게 나왔다고 세션 단위 분할이 괜찮다는 뜻은 아닙니다. 규칙(group = 환자)은 결과를 보기 전에 정합니다.

**이 결과로 말할 수 없는 것:** "이 데이터에서 EEG·EMG·SC는 FOG 탐지에 쓸모없다"고 결론 내리면 안 됩니다. 모달마다 window를 숫자 한두 개로 거칠게 줄였고, 환자별 기준화(예: 각 환자의 걷기 구간으로 나누기)를 하지 않았으며, 환자는 12명뿐입니다. 이 숫자는 저자 논문(Zhang 2022)이 보고한 탐지 성능과도 특징·평가 방식이 달라 직접 비교할 수 없습니다. 말할 수 있는 것은 "이 특징 설계와 환자 단위 검증에서는 ACC에 EMG·EEG를 더해도 새 환자 성능이 거의 오르지 않았고(SC를 뺀 세 모달 0.807 대 ACC만 0.798), SC 기저값을 그대로 넣으면 오히려 방해했다"는 관찰입니다. SC는 [Day K3](day-K3.md)처럼 과제 안에서 기준화한 뒤 다시 시험해 볼 만합니다. 또 EEG·EMG와 IMU 사이의 시계 지연은 [Day K2](day-K2.md)에서 검증하지 못했으므로, 짧은 지연이 있다면 2초 window 안에서 모달끼리 조금 어긋나 있을 수 있습니다.

### 결과 보고 양식 (`reports/advanced/K/K5_report.md`)

```text
# K5 멀티모달 FOG 탐지 — 결과 보고

## 1. 데이터
- 출처·버전: Zhang 2022 (doi:10.1038/s41597-022-01713-8), Mendeley v3 (doi:10.17632/r8gmbtv7w2.3), CC BY 4.0
- 환자 __명 / 세션 __개 / window __개 (2초, 1초 이동), FOG window 비율 __% (= PR-AUC 기준값)
- window 라벨 규칙: ____ (K2) / 라벨 시간 해상도: ____ (K1)
- 모달별 사용 센서와 결측: (표) 환자 | 정강이(왼/오) | EMG 열 | SC 유무 | EEG 채널

## 2. 방법
- 특징: 모달별 이름과 계산법 한 줄씩. 단위 가정(EEG µV 등)
- 결측 모달 처리: ____ (이유 한 줄, 그 때문에 빠진 환자 수)
- 검증: LeaveOneGroupOut, group = 환자 ID (008의 두 세션은 한 group)
- 모델과 설정: RF(____), HGB(기본값). 설정을 test 성능으로 고르지 않았음
- 지표: pooled out-of-fold PR-AUC·ROC-AUC + 환자별 표

## 3. 결과
- 전체: 모델 | pooled PR-AUC | ROC-AUC | 기준값
- 환자별: 환자 | window | FOG % | PR-AUC | 민감도@thr | 오경보율@thr (FOG 없는 환자는 오경보율만)
- 모달 기여도: 모달 | ablation 변화 | 단독 사용 | permutation 감소(±SD) | (참고) impurity

## 4. 해석과 한계
- 관찰한 것 (숫자와 함께)
- 다른 설명이 가능한 것 (환자 기저값, 움직임 잡음, 라벨 해상도, 다리 좌우 차이)
- 이 결과로 말할 수 없는 것 (일반화, 임상 사용, 인과)
```

## 🤖 AI와 함께 하기 (파트 K 마무리, 20–30분)

**이번 파트의 기술: 내 분석 코드를 AI에게 리뷰받되, 데이터 누수와 신호처리 오류를 체크리스트로 묻기**

멀티모달 코드는 길고, 틀린 곳이 있어도 대부분 그냥 돌아갑니다. AI에게 "코드 좀 봐 줘"라고만 하면 변수 이름이나 속도 같은 겉모습을 고쳐 주고 끝나기 쉽습니다. 그래서 **무엇을 의심해야 하는지 목록을 주고** 항목마다 답하게 합니다. 실험 프로토콜을 동료에게 검토받을 때 "대조군, 맹검, 표본 수를 봐 달라"고 짚어 주는 것과 같습니다.

1. **코드에서 환자 데이터를 걷어 냅니다.** 경로는 `data/xuanwu/...`처럼 일반 경로로, 출력은 숫자 요약(행 수, 환자 수, PR-AUC)만 남깁니다. 실제 신호 값이나 행 단위 표는 붙이지 않습니다.
2. **아래 프롬프트에 내 코드(오늘의 실제 데이터 1·2 또는 내가 고친 버전)를 붙여 넣습니다.**

   ```text
   나는 파킨슨병 보행동결(FOG) 멀티모달 데이터(ACC, EMG, SC, EEG, 500 Hz, 2초 window)로
   FOG window 분류 모델을 만들고 있다. 아래 코드를 리뷰해 달라. 코드를 새로 쓰지 말고,
   항목마다 "문제 없음 / 의심 / 문제"와 해당 줄, 이유, 확인 방법을 답해 달라.

   [데이터 누수]
   1. train/test가 환자 단위로 나뉘는가? 같은 환자의 다른 세션이 train과 test에 갈라지지 않는가?
   2. 정규화·결측 대체·특징 선택·threshold·하이퍼파라미터를 test 정보 없이 학습 fold 안에서만 정하는가?
   3. 겹치는 window(50%)가 train/test 경계에서 같은 표본을 공유하지 않는가?
   4. 라벨에서 만든 값(예: FOG 시작까지 남은 시간)이 특징에 들어가 있지 않은가?

   [신호처리]
   5. 표본화율, 단위(µV/V, ADC 카운트), 열 순서를 코드가 어디서 가정하는가? 근거가 데이터 문서와 맞는가?
   6. 필터 차단 주파수가 Nyquist(fs/2)를 넘거나, 이미 걸린 필터를 다시 거는 곳이 있는가?
   7. 비율 특징(freeze index, 상대 파워)에서 분모가 0 또는 매우 작은 경우를 어떻게 처리하는가?
   8. EEG beta 이상 대역 특징이 근전도·움직임 잡음일 가능성을 점검하는 코드가 있는가?

   [평가]
   9. 양성이 없는 test fold에서 PR-AUC를 어떻게 계산하는가? fold 평균인가 pooled인가?
   10. 기준값(양성 비율)과 환자별 결과를 함께 보고하는가?

   마지막에, 이 결과를 설명할 때 피해야 할 과장 표현 세 가지를 적어 달라.

   [코드]
   (여기에 붙여 넣기)
   ```

3. **AI의 지적을 하나씩 직접 확인합니다.** "문제"라고 한 항목은 작은 실험으로 확인합니다. 예를 들어 "정규화를 전체 데이터로 했다"는 지적이면, fold 안에서 정규화하도록 바꾼 뒤 PR-AUC가 달라지는지 봅니다. AI가 "문제 없음"이라고 한 항목도 1번(환자 단위 분할)과 9번(빈 fold)은 내 출력(fold 수, 경고)으로 직접 확인합니다. AI는 내 파일을 열어 보지 못하므로 5번의 "근거"는 내가 K1에서 센 사실로 확인합니다.

**검증 체크**
- [ ] 리뷰 요청에 환자 신호 값·행 단위 자료를 넣지 않았다.
- [ ] AI가 지적한 항목마다 "확인함 / 고침 / 동의하지 않음(이유)"을 적었다.
- [ ] fold 수 = 환자 수(12)이고, 008의 두 세션이 같은 fold에 있음을 출력으로 확인했다.
- [ ] 고친 뒤의 숫자와 고치기 전 숫자를 보고서에 나란히 적었다.

> 🔒 **환자 데이터·라이선스 주의:** 이 데이터셋(Mendeley v3, Raw v1)은 CC BY 4.0이라 출처를 밝히면 재사용할 수 있지만, 파킨슨병 환자의 생체 신호라는 점은 그대로입니다. 원자료와 거기서 만든 window 표(`features_K5.csv`)는 외부 AI 서비스에 올리지 않고 저장소에도 커밋하지 않습니다. AI에는 코드, 열 이름·단위·표본화율 같은 구조 정보, 요약 숫자, 직접 만든 합성 데이터만 줍니다. 결과를 쓸 때는 Zhang 2022 논문과 데이터 DOI를 인용하고, 저자 처리 코드(github.com/AccSrd/multimodal-Parkinson-data-processing)는 Apache-2.0 조건을 따릅니다. 이 실습은 학습용이며 진단·치료 판단에 쓰지 않습니다.

## 퀴즈

**1.** 모달별 특징 표를 `how="inner"`로 합쳤더니 행이 12366에서 11833으로 줄었습니다. 무슨 일이 일어났고, 어떻게 해야 합니까?

<details><summary>정답 보기</summary>

SC 표에 없는 window(환자 002 전체, 533개)가 **조용히 빠졌습니다**. 라벨 표를 기준으로 `how="left"`, `validate="one_to_one"`로 합쳐 행 수를 지키고, 결측 모달을 어떻게 처리할지(환자 빼기 / 모달 빼기 / NaN 처리 / 대체)를 일부러 골라 보고합니다.

</details>

**2.** 환자 008은 두 세션을 기록했습니다. LeaveOneGroupOut의 group을 세션으로 잡으면 무엇이 문제입니까?

<details><summary>정답 보기</summary>

008의 한 세션으로 학습하고 다른 세션으로 평가하게 되어, **같은 사람의 특징이 test에 새어 듭니다**. 새 환자에 대한 성능을 묻는 질문이므로 group은 환자 ID입니다. 실제 데이터에서 그 차이의 크기는 특징에 따라 달랐습니다(EMG 필터 전 특징 0.862 → 0.889, 레슨의 최종 특징 0.899 → 0.900). 차이가 작게 나와도 규칙은 바뀌지 않습니다.

</details>

**3.** FOG가 한 번도 없는 환자가 test fold일 때 `average_precision_score`는 무엇을 돌려주고(sklearn 1.9), 어떻게 대처합니까?

<details><summary>정답 보기</summary>

경고와 함께 **0.0**을 돌려줍니다(ROC-AUC는 NaN). fold별 값을 평균하면 이 0이 섞여 성능을 왜곡합니다. 모든 fold의 예측을 모은 **pooled PR-AUC**를 기준값과 함께 보고하고, 환자별 표에서는 FOG가 없는 환자에 PR-AUC 대신 **오경보율**을 적습니다.

</details>

**4.** "우리 시스템에 SC 센서를 붙일 가치가 있나?"라는 질문에 가장 맞는 숫자는? (a) impurity importance (b) permutation importance (c) 모달 제거(ablation)

<details><summary>정답 보기</summary>

**(c)**. SC를 빼고 **다시 학습**해서 같은 환자 단위 검증으로 성능 변화를 보는 것이 "센서를 달지 않으면 어떻게 되나"에 대한 직접적인 답입니다. (a)는 학습 자료 안에서만 계산되어 새 환자에게 통하는지 모르고(실제 데이터에서 SC를 두 번째로 높게 매김), (b)는 이미 학습된 모델이 그 센서에 기대는 정도라서 다른 센서가 대신할 수 있는 몫을 반영하지 못합니다.

</details>

**5.** 실제 데이터에서 환자 003의 PR-AUC가 0.958이었습니다. "003에서 모델이 아주 잘했다"고 써도 됩니까?

<details><summary>정답 보기</summary>

**아니요.** 003의 window 87.5%가 FOG라서 그 환자의 PR-AUC 기준값이 이미 0.875입니다. 게다가 확률이 0.5를 한 번도 넘지 않아 threshold 0.5에서는 민감도가 0이었습니다. 환자별 PR-AUC는 그 환자의 FOG 비율과 나란히, threshold에서의 민감도·오경보율과 함께 읽습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/advanced/K/K5_multimodal_model.ipynb`: 예시 1–3, 문제 1–5 실행, 출력이 레슨과 같은지 확인.
- [ ] (선택) 실제 데이터 1–2 실행: 센서 사용표, SC 결측 window 수, fold 수 = 12 확인. `features_K5.csv`는 커밋하지 않음.
- [ ] `reports/advanced/K/K5_report.md`: 위 보고 양식의 네 절을 모두 채움(환자별 표, 모달 기여도 표, 할 수 없는 말).
- [ ] AI 리뷰 기록: 체크리스트 10항목에 대한 AI의 답과 내 확인 결과.

## 더 읽을거리
- Zhang W, Yang Z, Li H, et al. Multimodal Data for the Detection of Freezing of Gait in Parkinson's Disease. *Sci Data*. 2022;9:606. doi:[10.1038/s41597-022-01713-8](https://doi.org/10.1038/s41597-022-01713-8) (PMC9546845)
- Li H. Multimodal Dataset of Freezing of Gait in Parkinson's Disease [Dataset]. Mendeley Data; v3. doi:[10.17632/r8gmbtv7w2.3](https://doi.org/10.17632/r8gmbtv7w2.3) · Raw Data v1. doi:[10.17632/t8j8v4hnm4.1](https://doi.org/10.17632/t8j8v4hnm4.1) (CC BY 4.0)
- Strobl C, Boulesteix AL, Zeileis A, Hothorn T. Bias in random forest variable importance measures: illustrations, sources and a solution. *BMC Bioinformatics*. 2007;8:25. doi:[10.1186/1471-2105-8-25](https://doi.org/10.1186/1471-2105-8-25)
- scikit-learn 문서: 앙상블 안내서의 "Histogram-Based Gradient Boosting" 절 (<https://scikit-learn.org/stable/modules/ensemble.html>), `permutation_importance` (<https://scikit-learn.org/stable/modules/generated/sklearn.inspection.permutation_importance.html>)
- 저자 처리 코드: <https://github.com/AccSrd/multimodal-Parkinson-data-processing> (Apache-2.0)
- 이론 노트: [T11 — 보행동결(FOG)](../I-gait-theory/note-T11.md)

---
[← 이전](day-K4.md) · [코스 지도](../../../README.md) · [다음: 코스 지도 →](../../../README.md)
