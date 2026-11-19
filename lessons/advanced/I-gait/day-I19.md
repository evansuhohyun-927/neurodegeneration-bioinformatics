# Day I19 — FOG 탐지 모델: 참가자 단위 검증과 event 단위 평가

> **주차:** 심화 파트 I — 보행분석 (3주차) · **예상 시간:** 90분+ · **산출물:** `notebooks/advanced/I/I19_fog_model.ipynb`, `reports/advanced/I/I19_per_patient.md` (환자별 성능 표: window 단위 민감도·특이도, event 검출률, 지연, 오경보)
>
> **먼저 끝내 둘 레슨:** [Day I18](day-I18.md)(freeze index, Daphnet), [Day 33](../../week-5/day-33.md)(GroupKFold·누수), [Day 34](../../week-5/day-34.md)(평가지표·오류 분석). 선택: [심화 H — Day H3](../H-clinical-prediction/day-H3.md)(판별력·임계값)
>
> **이론 노트:** [T11 — 보행동결(FOG)](../I-gait-theory/note-T11.md)

## 오늘의 목표
- 전역 threshold와 환자별 threshold의 차이를 참가자 단위로 비교하고, 환자별 threshold가 왜 "낙관적 상한"인지 설명할 수 있다.
- window feature(FI, band 에너지, 표준편차)로 logistic regression과 random forest를 leave-one-subject-out(LOSO)으로 평가할 수 있다.
- window 단위 지표(민감도·특이도)와 event 단위 지표(검출률, 지연, 오경보)를 참가자별로 함께 보고할 수 있다.

## 🎬 영상으로 먼저 보기

- [Machine Learning Fundamentals: Cross Validation — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=fSytzGwwBVw) (6:04)
- **무엇에 주목할까:** 자료를 여러 묶음으로 나눠 돌아가며 test로 쓰는 원리를 봅니다. 오늘은 그 "묶음"이 무작위 window가 아니라 **한 사람 전체**입니다. 사람 10명이면 fold도 10개입니다.

- [ROC and AUC, Clearly Explained! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=4jRBRDbJemM) (16:17)
- **무엇에 주목할까:** threshold를 옮길 때 민감도와 특이도가 서로 반대로 움직이는 모습에 집중하세요. FOG 경보 장치에서는 "놓친 FOG"와 "괜히 울린 경보"의 비용이 다르고, 그 선택이 threshold입니다.

## 개념 설명

### 전역 threshold와 환자별 threshold: 맞춤 정장과 기성복

Moore 2008의 초록은 전원 공통 threshold보다 사람마다 맞춘 threshold가 더 좋았다고 보고합니다(검출 78% → 89%, 오검출 20% → 10%, 삽화 수 기준). Bächlin 2010도 V-A절에서 같은 비교를 합니다. 환자별로 두 threshold(FreezeTH, PowerTH)를 최적화하면 평균 민감도 88.6%·특이도 92.4%, 전역 매개변수를 다른 사람들로 정하면(LOSO) 결론 절 기준 78.1%·86.9%였습니다. 성능 기준으로는 **min(민감도, 특이도)** 를 썼는데, 둘 중 나쁜 쪽을 끌어올리는 방향이라 한쪽만 좋은 설정을 피하게 해 줍니다.

환자별 threshold는 맞춤 정장과 같습니다. 잘 맞지만, 치수를 재는 데 쓴 바로 그 몸에 입혀 보고 "잘 맞는다"고 말하는 것이라 새 사람에게 얼마나 맞을지는 알려 주지 않습니다. 그래서 **같은 자료로 고른 환자별 threshold의 성능은 낙관적 상한**으로 읽어야 합니다. 실제로 쓰려면 새 환자마다 보정 기록이 필요하고, 그 보정 구간과 평가 구간을 시간으로 분리해야 공정합니다.

### 참가자 단위 검증: 왜 LOSO인가, 그리고 LOSO의 함정

같은 사람의 0.5초 간격 window들은 서로 거의 같습니다(4초 window가 8분의 7씩 겹칩니다). window를 무작위로 train/test에 나누면 모델은 사람을 외우고 성능이 부풀려집니다([Day 33](../../week-5/day-33.md)). 그래서 한 사람을 통째로 test에 두는 **leave-one-subject-out(LOSO)** 을 씁니다. Daphnet은 10명이라 fold가 10개이고, FOG가 없는 두 사람(S04, S10)의 fold에서는 특이도만 계산됩니다.

LOSO도 만능은 아닙니다. Salomon 2024는 기존 FOG 연구들이 LOSO를 쓰면서도 hyperparameter나 threshold를 **전체 자료로** 맞춘 경우가 많아 결과가 낙관적일 수 있다고 지적합니다. 정규화(scaler), PCA 같은 차원 축소([RM] 14장의 PCA를 feature 추출에 쓴다면), threshold 선택은 모두 **각 fold의 train 참가자 안에서만** 해야 합니다. scikit-learn의 `Pipeline`이 이것을 지켜 줍니다. 어제 Day I18에서 데이터를 보고 고른 에너지 threshold 1e4가 오늘 그대로 쓰이지 않고, fold마다 다시 고르는 이유입니다.

### window 단위, event 단위, 그리고 시계의 단위

window 단위 민감도·특이도는 "0.5초마다 맞혔나"를 셉니다. 그런데 cue 장치를 쓰는 사람에게 중요한 질문은 다릅니다. **삽화를 놓치지 않았나(event 검출률)**, **얼마나 늦게 울렸나(지연)**, **FOG가 없는데 몇 번 울렸나(오경보율)**. Bächlin 2010은 FOG 시작 후 2초 안에 잡으면 성공으로 보는 허용 규칙을 썼지만 event 단위 검출률과 지연 분포는 따로 보고하지 않았습니다. 오늘은 셋을 모두 계산합니다.

[R] 23장은 하지 의지의 의도 인식을 다루며 중요한 관점을 줍니다. 사람은 하루에 수천 걸음을 걷기 때문에 99.9% 정확도라도 하루에 여러 번의 오류가 생기고, 그 오류가 넘어짐으로 이어질 수 있다는 것입니다. 정확도를 **걸음 수나 시간으로 곱해 보는** 습관이 필요합니다. 특이도 90%는 0.5초 window 기준으로 비FOG 10분(1,200 window) 동안 약 120개의 양성 window를 뜻하고, 그것이 몇 번의 "경보"로 묶이는지가 사용자가 실제로 겪는 성능입니다.

FOG 탐지 연구의 흐름도 짧게 짚어 둡니다. Guo 2022의 개관은 규칙·threshold 방식에서 전통 기계학습(SVM, random forest 등)을 거쳐 딥러닝으로 이어지는 흐름과, 수집 → 전처리(분할·정규화) → feature → 분류 → 평가(K-fold 또는 LOSO)의 다섯 단계 pipeline을 정리합니다. 다만 이 개관이 옮겨 적은 개별 성능 수치는 본문과 표가 어긋나는 곳이 있어 원 논문 확인 없이 인용하지 않습니다. Salomon 2024의 Kaggle 경진대회에는 3개월 동안 83개국 1,379팀이 24,862개 해법을 제출했고, 입력은 허리 센서 하나의 3축 가속도였습니다. 상위 모델을 **7일 연속(24/7) 일상 기록**에 적용한 분석에서, 1위 모델 단독으로는 FOG가 있는 사람과 없는 사람의 시간대별 차이가 유의하지 않았고 **1·3·5위 결합 모델**에서 아침 7시와 밤 10시 무렵에 봉우리가 보였습니다. 일상 기록에는 정답 라벨이 없어 저자들 스스로 **탐색적 결과**라고 강조합니다.

## 예시로 이해하기

> 데이터: Daphnet Freezing of Gait(UCI #245, doi:10.24432/C56K78, CC BY 4.0, 2013-03-06 기증본, 버전 번호 없음). PD 10명(FOG 8명)의 실험실 기록 약 8시간 19분. 준비 방법은 [Day I18](day-I18.md) 예시 2. 모든 숫자는 이 작은 실험실 데이터의 결과이며 일반 PD 환자나 일상 환경의 성능이 아닙니다.

### 예시 1 — window feature 만들기와 threshold baseline(전역 LOSO vs 환자별)

```python
import glob, os
import numpy as np
import pandas as pd

DATA = "data/daphnet/dataset_fog_release/dataset"
OUT = "results/advanced/I"
os.makedirs(OUT, exist_ok=True)
fs, WIN, STEP = 64, 256, 32
SENSORS = {"shank": 2, "thigh": 5, "hip": 8}          # 각 센서의 수직축 열 번호(0부터)
f = np.fft.rfftfreq(WIN, 1 / fs)
LOCO, FRZ = (f >= 0.5) & (f < 3), (f >= 3) & (f <= 8)

def window_features(a):
    ends = np.arange(WIN - 1, len(a), STEP)
    idx = ends[:, None] - np.arange(WIN)[::-1]
    feat = {"t_end": ends / fs, "label": a[ends, 10]}
    for name, col in SENSORS.items():
        seg = a[idx, col]
        seg = seg - seg.mean(axis=1, keepdims=True)
        p = np.abs(np.fft.rfft(seg, axis=1)) ** 2 / WIN
        loco, frz = p[:, LOCO].sum(1), p[:, FRZ].sum(1)
        feat[f"{name}_energy"] = loco + frz
        feat[f"{name}_logFI"] = np.log10((frz + 1) / (loco + 1))   # +1: 0으로 나누기 방지
        feat[f"{name}_logE"] = np.log10(loco + frz + 1)
        feat[f"{name}_sd"] = seg.std(axis=1)
    return pd.DataFrame(feat)

parts = []
for path in sorted(glob.glob(os.path.join(DATA, "S*R*.txt"))):
    a = np.loadtxt(path)
    w = window_features(a)
    w.insert(0, "run", os.path.basename(path)[3:6])
    w.insert(0, "subject", os.path.basename(path)[:3])
    parts.append(w)
win = pd.concat(parts, ignore_index=True)
win = win[win["label"] > 0].reset_index(drop=True)
win["fog"] = (win["label"] == 2).astype(int)
win.to_csv(os.path.join(OUT, "I19_windows.csv.gz"), index=False)
print(win.shape, "| FOG window 비율 %.1f%%" % (100 * win["fog"].mean()))

# ---- 1단계: freeze index threshold baseline (shank 수직축) ----
FI = 10 ** win["shank_logFI"].to_numpy()
E = win["shank_energy"].to_numpy()
y = win["fog"].to_numpy().astype(bool)
subj = win["subject"].to_numpy()
FTH = np.round(np.logspace(-0.3, 1.3, 33), 2)        # FreezeTH 후보 0.5–20
PTH = [1e3, 1e4, 1e5, 1e6]                           # PowerTH 후보

def sens_spec(pred, yy):
    se = pred[yy].mean() if yy.any() else np.nan
    sp = (~pred[~yy]).mean()
    return se, sp

def score(fth, pth, mask):
    """mask 안 참가자마다 min(민감도, 특이도)를 구해 평균(FOG 없는 참가자는 제외)."""
    vals = []
    for s in np.unique(subj[mask]):
        m = mask & (subj == s)
        if not y[m].any():
            continue
        se, sp = sens_spec((FI[m] > fth) & (E[m] >= pth), y[m])
        vals.append(min(se, sp))
    return np.mean(vals)

rows = []
for s in np.unique(subj):
    test = subj == s
    # (a) 전역 threshold: 나머지 9명으로 고르고 s에 적용 (LOSO)
    g = max(((score(ft, pt, ~test), ft, pt) for ft in FTH for pt in PTH))
    se_g, sp_g = sens_spec((FI[test] > g[1]) & (E[test] >= g[2]), y[test])
    row = {"subject": s, "glob_FTH": g[1], "glob_PTH": g[2],
           "glob_sens": se_g, "glob_spec": sp_g}
    # (b) 환자별 threshold: s 자신의 자료로 고른 값(낙관적 상한)
    if y[test].any():
        b = max(((score(ft, pt, test), ft, pt) for ft in FTH for pt in PTH))
        se_b, sp_b = sens_spec((FI[test] > b[1]) & (E[test] >= b[2]), y[test])
        row.update({"own_FTH": b[1], "own_PTH": b[2], "own_sens": se_b, "own_spec": sp_b})
    rows.append(row)
res = pd.DataFrame(rows)
pct = ["glob_sens", "glob_spec", "own_sens", "own_spec"]
res[pct] = (100 * res[pct]).round(1)
print(res.to_string(index=False, na_rep="-"))
res.to_csv(os.path.join(OUT, "I19_thresholds.csv"), index=False)
fog = res.dropna(subset=["own_sens"])
print("FOG 있는 8명 평균 | 전역: 민감도 %.1f, 특이도 %.1f | 환자별: 민감도 %.1f, 특이도 %.1f" % (
    fog.glob_sens.mean(), fog.glob_spec.mean(), fog.own_sens.mean(), fog.own_spec.mean()))
print("FOG 있는 8명 평균 min(민감도, 특이도) | 전역 %.1f | 환자별 %.1f" % (
    np.minimum(fog.glob_sens, fog.glob_spec).mean(), np.minimum(fog.own_sens, fog.own_spec).mean()))
```

실행 결과(약 15초):

```text
(35685, 17) | FOG window 비율 9.7%
subject  glob_FTH  glob_PTH  glob_sens  glob_spec  own_FTH   own_PTH  own_sens  own_spec
    S01      1.12  100000.0       94.7       83.0     1.26 1000000.0      87.9      88.2
    S02      1.00  100000.0       93.3       73.8     1.26 1000000.0      86.1      88.3
    S03      1.12  100000.0       96.4       71.7     2.82  100000.0      84.5      83.8
    S04      1.12  100000.0          -       94.9        -         -         -         -
    S05      1.26  100000.0       70.2       86.3     1.00  100000.0      81.4      79.2
    S06      1.26  100000.0       63.9       92.6     1.00   10000.0      77.6      82.6
    S07      1.12  100000.0       80.5       85.0     0.89  100000.0      82.9      83.4
    S08      1.12  100000.0       75.2       55.3     1.78  100000.0      69.7      72.6
    S09      1.12  100000.0       73.2       85.2     1.78   10000.0      89.6      89.1
    S10      1.12  100000.0          -       69.7        -         -         -         -
FOG 있는 8명 평균 | 전역: 민감도 80.9, 특이도 79.1 | 환자별: 민감도 82.5, 특이도 83.4
FOG 있는 8명 평균 min(민감도, 특이도) | 전역 71.5 | 환자별 82.0
```

읽는 법: 평균 민감도·특이도만 보면 두 방식의 차이가 작아 보이지만, 목표로 삼은 min(민감도, 특이도)는 71.5 대 82.0으로 벌어집니다. 전역 threshold는 사람에 따라 한쪽으로 크게 기웁니다(S03은 민감도 96.4·특이도 71.7, S06은 63.9·92.6). LOSO가 고른 PowerTH는 대부분 1e5로, 어제 분포를 보고 정한 1e4보다 높았습니다. Bächlin의 값(전역 LOSO 78.1/86.9, 환자별 88.6/92.4)과 크기가 비슷해 보이지만, 그쪽은 0.5초 frame과 2초 허용 규칙을 쓴 평가라 **같은 기준의 비교가 아닙니다**.

### 예시 2 — LOSO로 logistic regression과 random forest 평가하기

예시 1이 저장한 `results/advanced/I/I19_windows.csv.gz`를 읽습니다.

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import LeaveOneGroupOut
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

win = pd.read_csv("results/advanced/I/I19_windows.csv.gz")
FEATS = [c for c in win.columns if c.endswith(("_logFI", "_logE", "_sd"))]   # 3 센서 × 3 = 9개
X, y, groups = win[FEATS].to_numpy(), win["fog"].to_numpy(), win["subject"].to_numpy()
print("feature:", FEATS)

models = {
    # scaler는 pipeline 안에 → 각 fold의 train 9명으로만 평균·SD를 맞춘다(누수 방지)
    "LR": make_pipeline(StandardScaler(), LogisticRegression(class_weight="balanced", max_iter=2000)),
    "RF": RandomForestClassifier(n_estimators=200, min_samples_leaf=20, class_weight="balanced_subsample",
                                 n_jobs=-1, random_state=0),
}
for name, model in models.items():
    prob = np.zeros(len(y))
    for tr, te in LeaveOneGroupOut().split(X, y, groups):       # 한 번에 한 사람을 통째로 test
        model.fit(X[tr], y[tr])
        prob[te] = model.predict_proba(X[te])[:, 1]
    win[f"p_{name}"] = prob
win.to_csv("results/advanced/I/I19_loso_pred.csv.gz", index=False)

rows = []
for s, g in win.groupby("subject"):
    yy = g["fog"].to_numpy().astype(bool)
    row = {"subject": s, "FOG_windows": int(yy.sum())}
    for name in models:
        pred = g[f"p_{name}"].to_numpy() >= 0.5
        row[f"{name}_sens"] = round(100 * pred[yy].mean(), 1) if yy.any() else np.nan
        row[f"{name}_spec"] = round(100 * (~pred[~yy]).mean(), 1)
    rows.append(row)
tab = pd.DataFrame(rows)
print(tab.to_string(index=False, na_rep="-"))
fog = tab[tab.FOG_windows > 0]
for name in models:
    print("%s: FOG 있는 8명 평균 민감도 %.1f (범위 %.1f–%.1f), 10명 평균 특이도 %.1f (범위 %.1f–%.1f)" % (
        name, fog[f"{name}_sens"].mean(), fog[f"{name}_sens"].min(), fog[f"{name}_sens"].max(),
        tab[f"{name}_spec"].mean(), tab[f"{name}_spec"].min(), tab[f"{name}_spec"].max()))
```

실행 결과(약 30초, random forest가 대부분):

```text
feature: ['shank_logFI', 'shank_logE', 'shank_sd', 'thigh_logFI', 'thigh_logE', 'thigh_sd', 'hip_logFI', 'hip_logE', 'hip_sd']
subject  FOG_windows  LR_sens  LR_spec  RF_sens  RF_spec
    S01          206     95.1     58.8     94.2     81.2
    S02          360     77.8     91.5     78.9     93.4
    S03          576     97.0     77.5     94.3     80.5
    S04            0        -     92.6        -     96.4
    S05          947     70.2     87.9     71.9     89.6
    S06          263     79.5     77.9     68.1     93.5
    S07          164     82.9     88.8     81.1     89.8
    S08          403     91.8     40.5     74.9     67.7
    S09          541     77.6     87.9     73.6     94.4
    S10            0        -     90.8        -     97.8
LR: FOG 있는 8명 평균 민감도 84.0 (범위 70.2–97.0), 10명 평균 특이도 79.4 (범위 40.5–92.6)
RF: FOG 있는 8명 평균 민감도 79.6 (범위 68.1–94.3), 10명 평균 특이도 88.4 (범위 67.7–97.8)
```

평균만 보면 RF가 특이도에서 앞서지만, 가장 눈에 띄는 것은 **사람 간 범위**입니다. S08은 두 모델 모두 특이도가 낮습니다(LR 40.5%). 이 사람은 FOG 비율이 26%로 가장 높고 기록이 가장 짧아, 다른 9명으로 배운 "FOG 아님"의 모습과 걸음 양식이 다를 가능성이 있습니다(추정, 확인하지 않음). 개별 참가자를 임상적으로 묘사하지 말고 "어떤 유형의 실패인가"로만 기록합니다. Bächlin 2010 IV-B절도 한 환자는 발 구름이 강해 민감도는 높고 특이도는 낮았고, 움직임이 아주 적은 다른 환자는 반대였다고 보고합니다.

### 예시 3 — event 단위: 삽화를 놓쳤나, 언제 울렸나, 몇 번 헛울렸나

```python
import numpy as np
import pandas as pd

win = pd.read_csv("results/advanced/I/I19_loso_pred.csv.gz")
th = pd.read_csv("results/advanced/I/I19_thresholds.csv").set_index("subject")
# 전역(LOSO) FI threshold의 예측도 같은 형식으로 붙인다
fi = 10 ** win["shank_logFI"]
win["pred_FI"] = (fi > win["subject"].map(th["glob_FTH"])) & (win["shank_energy"] >= win["subject"].map(th["glob_PTH"]))
win["pred_LR"], win["pred_RF"] = win["p_LR"] >= 0.5, win["p_RF"] >= 0.5
TOL = 2.0   # 삽화가 끝난 뒤 2초까지 켜진 경보는 "그 삽화를 잡은 것"으로 인정(Bächlin의 2 s 허용과 같은 발상)

def events(g):
    """window 라벨 열에서 FOG 삽화의 [시작, 끝] 시각(window 끝 시각 기준)을 찾는다."""
    fog = g["fog"].to_numpy().astype(bool); t = g["t_end"].to_numpy()
    gap = np.r_[True, np.diff(t) > 0.51]                 # 라벨 0 구간으로 끊긴 곳
    start = fog & (~np.r_[False, fog[:-1]] | gap)
    stop = fog & (~np.r_[fog[1:], False] | np.r_[gap[1:], True])
    return list(zip(t[start], t[stop]))

rows = []
for (s, r), g in win.sort_values(["subject", "run", "t_end"]).groupby(["subject", "run"]):
    t = g["t_end"].to_numpy()
    ev = events(g)
    for m in ["FI", "LR", "RF"]:
        pred = g[f"pred_{m}"].to_numpy().astype(bool)
        for on, off in ev:
            hit = pred & (t >= on) & (t <= off + TOL)
            rows.append({"subject": s, "model": m, "kind": "event", "detected": float(hit.any()),
                         "latency": t[hit][0] - on if hit.any() else np.nan,
                         "already_on": float(pred[(t > on - 0.75) & (t < on)].any())})  # 시작 직전 window가 이미 양성
        inside = np.zeros(len(t), bool)
        for on, off in ev:
            inside |= (t >= on - TOL) & (t <= off + TOL)   # 시작 2초 전 경보도 오경보로 세지 않음
        rise = pred & ~np.r_[False, pred[:-1]]            # 경보가 새로 켜진 순간
        rows.append({"subject": s, "model": m, "kind": "alarm",
                     "false_alarms": int((rise & ~inside).sum()),
                     "nonfog_min": (g["fog"] == 0).sum() * 0.5 / 60})
d = pd.DataFrame(rows)
ev, al = d[d.kind == "event"], d[d.kind == "alarm"]
tab = ev.groupby(["model", "subject"]).agg(events=("detected", "size"), detect_pct=("detected", "mean"),
                                           latency_med_s=("latency", "median"), already_on_pct=("already_on", "mean"))
fa = al.groupby(["model", "subject"])[["false_alarms", "nonfog_min"]].sum()
tab = tab.join(fa, how="outer")
tab["FA_per_10min"] = 10 * tab["false_alarms"] / tab["nonfog_min"]
tab["detect_pct"] *= 100
tab["already_on_pct"] *= 100
cols = ["events", "detect_pct", "latency_med_s", "already_on_pct", "FA_per_10min"]
print(tab.loc["RF", cols].round(1).to_string(na_rep="-"))     # 참가자별 표는 RF만 출력(FI, LR도 같은 방식)
for m in ["FI", "LR", "RF"]:
    e = ev[ev.model == m]; a = al[al.model == m]
    print("%s: 삽화 %d개 중 %.1f%% 검출 | 지연 중앙값 %.1f s (IQR %.1f–%.1f) | 시작 전에 이미 켜짐 %.1f%% | 오경보 %.1f회/비FOG 10분" % (
        m, len(e), 100 * e.detected.mean(), e.latency.median(), e.latency.quantile(.25), e.latency.quantile(.75),
        100 * e.already_on.mean(), 10 * a.false_alarms.sum() / a.nonfog_min.sum()))
```

실행 결과:

```text
         events  detect_pct  latency_med_s  already_on_pct  FA_per_10min
subject                                                                 
S01        23.0        95.7            0.0            65.2          28.0
S02        24.0        87.5            1.5            20.8          12.6
S03        49.0        95.9            0.0            91.8          11.5
S04           -           -              -               -          16.5
S05        66.0        90.9            0.0            37.9          11.9
S06        10.0        80.0            0.0            40.0          29.3
S07        24.0        91.7            0.0            66.7          13.3
S08        14.0        92.9            0.0            50.0          44.2
S09        27.0        92.6            0.0            40.7           9.4
S10           -           -              -               -           7.5
FI: 삽화 237개 중 94.1% 검출 | 지연 중앙값 0.0 s (IQR 0.0–0.5) | 시작 전에 이미 켜짐 62.9% | 오경보 29.7회/비FOG 10분
LR: 삽화 237개 중 95.4% 검출 | 지연 중앙값 0.0 s (IQR 0.0–1.0) | 시작 전에 이미 켜짐 59.1% | 오경보 29.3회/비FOG 10분
RF: 삽화 237개 중 92.0% 검출 | 지연 중앙값 0.0 s (IQR 0.0–1.0) | 시작 전에 이미 켜짐 54.0% | 오경보 16.8회/비FOG 10분
```

**세 숫자를 함께 읽어야 하는 이유:**
- event 검출률(92–95%)은 window 민감도(80–84%)보다 높습니다. 긴 삽화는 window 몇 개만 맞혀도 "검출"이 되기 때문입니다. 어느 단위로 셌는지 반드시 적습니다.
- 지연 중앙값이 0초인데, 그중 절반 이상은 라벨 시작 **전부터** 경보가 켜져 있던 경우입니다. 이것이 동결 직전의 변화(Day I17의 threshold 모델)를 잡은 것인지, 라벨 경계의 수백 ms 오차인지, 직전 비FOG 구간의 오경보가 이어진 것인지는 이 분석만으로 가를 수 없습니다.
- 오경보는 비FOG 10분마다 약 17–30회, 즉 1분에 2–3회입니다. 특이도 80–90%가 사용자에게는 이렇게 느껴집니다. Bächlin 2010의 설문에서도 특이도가 낮았던 환자들이 cue가 너무 자주 울린다고 답했습니다.

## 직접 해보기

1. `notebooks/advanced/I/I19_fog_model.ipynb`에서 예시 1–3을 실행하고 출력이 같은지 확인합니다(random forest는 `random_state=0`으로 고정).
2. `reports/advanced/I/I19_per_patient.md`에 참가자별 표를 만듭니다. 열: `참가자 | FOG 삽화 수 | window 민감도 | window 특이도 | event 검출률 | 지연 중앙값 | 시작 전 켜짐 | 오경보/10분`. 모델은 전역 FI threshold와 RF 두 가지를 나란히 둡니다. 표 머리에 "Daphnet(UCI #245, 2013 기증본), PD 10명 실험실 기록, LOSO" 한 줄을 붙입니다.
3. **경보 다듬기 실험:** RF 예측에 "연속 2개 window가 양성일 때만 경보" 규칙을 더해 오경보율과 지연이 어떻게 바뀌는지 측정합니다. 오경보는 줄고 지연은 약 0.5초 늘어날 것으로 예상됩니다. 결과로 확인하세요.
4. **누수 실험:** 예시 2에서 `LeaveOneGroupOut` 대신 window를 무작위로 섞는 `KFold(n_splits=10, shuffle=True, random_state=0)`를 써 보고 평균 민감도·특이도가 얼마나 부풀려지는지 적습니다. 보고서에는 LOSO 결과만 씁니다.
5. 환자별 threshold의 공정한 버전을 설계해 봅니다: 각 참가자의 첫 번째 run(또는 기록 앞 절반)으로 threshold를 고르고 나머지로 평가합니다. 예시 1의 "환자별" 숫자와 비교합니다.
6. 표 아래에 한계 세 줄을 씁니다: 참가자 수, 실험실 과제(FOG를 많이 유발하도록 설계), 라벨 경계 오차와 window 끝 시점 라벨링.

⚠️ **흔한 오류 1 — 전체 window를 한데 모아 평균 내기.** FOG window가 947개인 사람과 164개인 사람이 같은 비중으로 들어가지 않습니다. 참가자별로 먼저 계산한 뒤 참가자 평균과 범위를 보고합니다(Day I21 예시 1에서 두 방식을 비교).

⚠️ **흔한 오류 2 — threshold·scaler를 전체 자료로 맞춘 뒤 LOSO.** 예시 1처럼 threshold 선택을 fold 안으로 넣고, 예시 2처럼 scaler를 `Pipeline` 안에 둡니다. 밖에서 한 번이라도 test 참가자를 보면 LOSO의 의미가 사라집니다.

## 퀴즈

**1.** 환자별 threshold로 얻은 성능(예: 민감도 82.5%, 특이도 83.4%)을 새 환자에게 기대할 수 있는 성능이라고 보고하면 무엇이 문제입니까?

<details><summary>정답 보기</summary>

threshold를 고른 자료와 평가한 자료가 같아서 **낙관적 상한**입니다. 새 환자에게는 보정 기록이 따로 필요하고, 그 보정 구간과 평가 구간을 분리해야 공정한 추정이 됩니다(직접 해보기 5).

</details>

**2.** Daphnet에서 LOSO fold는 몇 개이고, S04 fold에서는 어떤 지표를 계산할 수 없습니까?

<details><summary>정답 보기</summary>

참가자 수만큼 **10개**입니다. S04와 S10은 FOG가 없어 **민감도(와 event 검출률, 지연)** 를 계산할 수 없고 특이도와 오경보율만 계산합니다. 평균을 낼 때 분모(8명 또는 10명)를 밝혀야 합니다.

</details>

**3.** RF의 window 특이도가 88%인데 오경보가 비FOG 10분마다 약 17회입니다. 둘이 어떻게 같이 성립합니까?

<details><summary>정답 보기</summary>

비FOG 10분은 0.5초 window 1,200개입니다. 12%면 약 140개의 양성 window가 생기고, 이것이 여러 덩어리로 끊겨 나타나면 경보 "켜짐"이 여러 번 생깁니다. window 단위 지표는 사용자가 겪는 경보 횟수를 직접 알려 주지 않으므로 event 단위로 따로 셉니다.

</details>

**4.** Salomon 2024의 일상생활 분석에 대한 설명으로 맞는 것은?
(a) 우승 모델을 24시간 기록에 적용해 시간대 패턴을 확인했다 (b) 상위 모델들을 7일 연속 기록에 적용했고, 1·3·5위 결합 모델에서 시간대 차이가 보였으며 탐색적 결과다 (c) 일상 기록에도 영상 라벨이 있어 정확도를 검증했다

<details><summary>정답 보기</summary>

**(b)**. 1위 모델 단독으로는 군 간 시간대 차이가 유의하지 않았고, 일상 기록에는 정답 라벨이 없어 저자들이 예비·탐색 결과라고 밝힙니다.

</details>

**5.** "정확도 99.9%면 충분히 안전하다"는 말에 [R] 23장의 관점으로 반론하세요. (단답)

<details><summary>정답 보기</summary>

판정이 걸음마다(또는 0.5초마다) 반복되므로, 하루 수천 걸음이면 0.1% 오류도 하루 여러 번의 오류가 됩니다. 오류 한 번이 넘어짐이나 잘못된 보조로 이어질 수 있다면, 비율이 아니라 **시간당·걸음당 오류 횟수**와 오류에서 안전하게 회복하는 설계를 함께 봐야 합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/advanced/I/I19_fog_model.ipynb`: 예시 1–3 실행, 출력 일치 확인.
- [ ] `reports/advanced/I/I19_per_patient.md`: 참가자별 window·event 지표 표, 데이터·검증 방식 머리줄.
- [ ] 연속 2 window 규칙 실험(오경보 vs 지연) 결과 한 단락.
- [ ] 무작위 KFold 누수 실험 결과(보고서 본문에는 쓰지 않음, 노트에만).
- [ ] 한계 세 줄.

## 더 읽을거리
- Bächlin M, et al. Wearable assistant for Parkinson's disease patients with the freezing of gait symptom. *IEEE Trans Inf Technol Biomed*. 2010;14(2):436–446. doi:[10.1109/TITB.2009.2036165](https://doi.org/10.1109/TITB.2009.2036165) — IV절(환자별 편차), V절(min(Sens, Spec), 전역 대 개인별, 센서 위치, 지연)
- Salomon A, Gazit E, Ginis P, et al. A machine learning contest enhances automated freezing of gait detection and reveals time-of-day effects. *Nat Commun*. 2024;15:4853. doi:[10.1038/s41467-024-49027-0](https://doi.org/10.1038/s41467-024-49027-0)
- Guo Y, Yang J, Liu Y, Chen X, Yang GZ. Detection and assessment of Parkinson's disease based on gait analysis: a survey. *Front Aging Neurosci*. 2022;14:916971. doi:[10.3389/fnagi.2022.916971](https://doi.org/10.3389/fnagi.2022.916971) — 4.1절(pipeline), 4.2.3절(FI), 4.4절·표 5(FOG 검출), 4.5절(공개 데이터)
- Moore ST, MacDougall HG, Ondo WG. Ambulatory monitoring of freezing of gait in Parkinson's disease. *J Neurosci Methods*. 2008;167(2):340–348. doi:[10.1016/j.jneumeth.2007.08.023](https://doi.org/10.1016/j.jneumeth.2007.08.023)
- [R] Rosen J, Ferguson PW, eds. *Wearable Robotics: Systems and Applications*. Academic Press; 2020. 23장 Lower Limb Active Prosthetic Systems—Overview(의도 인식의 오류율과 걸음 수).
- [RM] Robertson DGE, et al. *Research Methods in Biomechanics*. 2nd ed. Human Kinetics; 2014. 14장 PCA(pp.319–) — window 신호를 줄일 때는 fold 안에서만 적합.
- 이론 노트: [T11 — 보행동결(FOG)](../I-gait-theory/note-T11.md)

---
[← 이전](day-I18.md) · [코스 지도](../../../README.md) · [다음 →](day-I20.md)
