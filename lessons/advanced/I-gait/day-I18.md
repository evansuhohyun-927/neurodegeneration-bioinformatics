# Day I18 — FOG 신호: freeze index와 에너지 threshold를 Daphnet으로 직접 계산하기

> **주차:** 심화 파트 I — 보행분석 (3주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I18_freeze_index.ipynb`, `data/daphnet/README.md` (provenance), `figures/advanced/I/I18_fi_overlay.png`
>
> **먼저 끝내 둘 레슨:** [Day I9](day-I9.md)(가속도계·센서 위치), [Day I10](day-I10.md)(표본화·Fourier·필터), [Day I17](day-I17.md)(FOG 유형과 가설), [Day 23](../../week-4/day-23.md)(3–8 Hz band-pass)
>
> **이론 노트:** [T11 — 보행동결(FOG)](../I-gait-theory/note-T11.md)

## 오늘의 목표
- freeze band(3–8 Hz)와 locomotor band(0.5–3 Hz)의 power 비로 freeze index(FI)를 4 s window, 0.5 s step으로 계산할 수 있다.
- 서 있기처럼 움직임이 거의 없는 구간에서 FI가 왜 의미를 잃는지, 그래서 에너지 threshold가 왜 필요한지 설명할 수 있다.
- Daphnet의 채널·단위·라벨 코드를 데이터 사전으로 정리하고, FI·에너지 시계열을 FOG 라벨과 겹쳐 그려 Day I17의 가설을 점검할 수 있다.

## 🎬 영상으로 먼저 보기

- [Understanding Power Spectral Density and the Power Spectrum — MATLAB](https://www.youtube.com/watch?v=pfjiwxhqd1M) (20:43)
- **무엇에 주목할까:** 신호의 "힘"을 주파수별로 나눠 담는다는 생각, 그리고 window 길이가 주파수 해상도를 정한다는 점에 집중하세요. 오늘은 4초 window라서 bin 간격이 1/4 = 0.25 Hz가 됩니다.

- [Freezing and Festinating Gait of Parkinson's Disease — Dr Pawan Soni Neurologist](https://www.youtube.com/watch?v=EjZnNLq5FQI) (0:27)
- **무엇에 주목할까:** 짧은 영상입니다. 걸음이 점점 빨라지고 작아지는 festination과, 다리가 제자리에서 떨리는 동결을 구분해 보세요. 어느 쪽이 shank 가속도에 3–8 Hz 성분을 더 많이 남길지 예상하고 시작합니다.

## 개념 설명

### freeze index: 걸음 리듬과 떨림의 에너지 비

정상 걸음의 shank 수직 가속도는 걸음 주기(대략 1 Hz)와 그 배음에 에너지가 모입니다. 제자리 떨림형 FOG에서는 걸음 리듬이 무너지고 3–8 Hz 근처에 에너지가 생깁니다(Nutt 2011이 보고한 떨림 주파수와 겹침). Moore 2008은 이 차이를 숫자 하나로 만들었습니다. 발목에 단 센서로 shank 수직 가속도를 100 Hz로 재고, **FI = (3–8 Hz freeze band power) / (0.5–3 Hz locomotor band power)** 로 정의한 뒤 threshold를 넘으면 FOG로 판정했습니다. 초록에 따르면 전원 공통 threshold로 **FOG 삽화의 78%** 를 잡았지만 **서 있기 삽화의 20%** 를 FOG로 잘못 표시했고, 사람마다 threshold를 맞추면 89% 검출, 오검출 10%였습니다. 이 분모들은 시간이 아니라 **삽화(event) 수**라는 점에 주의하세요. Moore 2008의 방법 절은 공개본이 없어 이 레슨은 초록만 근거로 씁니다(window 길이 등 세부는 확인하지 않았습니다).

Bächlin 2010은 이 방법을 실시간으로 옮겼습니다. 3개 센서(shank, thigh, 허리)를 64 Hz로 기록했지만 **온라인 검출에는 shank 센서만** 썼고, 직사각형 4초 window를 0.5초씩 옮기며 256-point FFT로 스펙트럼을 구했습니다(II-C절). 4초 × 64 Hz = 256표본이라 zero padding이 필요 없고 bin 간격은 0.25 Hz입니다. 결과는 0.5초 frame 단위로 평균 민감도 73.1%, 특이도 81.6%였습니다. FOG가 검출되면 1 Hz 똑딱 소리를 들려주었는데, 그 소리의 효과는 **설문으로만** 보고되었습니다(FOG를 겪은 8명 중 5명이 횟수 감소를 느낌). "cue가 FOG를 줄였다"고 옮기면 과장입니다.

### 에너지 threshold: 조용할 때의 비율은 잡음끼리의 비율

비율 지표에는 약점이 있습니다. 분자와 분모가 둘 다 작으면, 둘 다 잡음일 뿐인데도 비율은 커질 수 있습니다. 가만히 서 있을 때 센서 신호는 거의 잡음이라 FI가 1을 훌쩍 넘을 수 있습니다(예시 1). 체중계 두 개의 영점 오차를 나눠서 "몸무게 비"를 말하는 것과 같습니다. Bächlin은 그래서 두 band의 에너지 합이 일정 값(PowerTH)보다 작으면 FI를 0으로 만드는 **게이트**를 먼저 두고, 그다음 freeze threshold(FreezeTH)를 적용했습니다(II-B, II-C절). 대가도 있습니다. 움직임이 거의 없는 **무동형 FOG**도 같이 걸러져 놓치게 됩니다(Day I17 예시 2).

### Daphnet 데이터 사전: 라벨 코드와 센서 위치

Daphnet은 Bächlin 2010 연구의 기록을 공개한 데이터입니다. 확인한 사실(UCI 페이지와 배포본 문서, 2026-11-19 확인):

| 항목 | 내용 |
|---|---|
| 출처·식별자 | Roggen D, Plotnik M, Hausdorff J. Daphnet Freezing of Gait. UCI Machine Learning Repository #245, doi:10.24432/C56K78, 기증 2013-03-06. 페이지에 버전 번호는 없음 |
| 라이선스 | CC BY 4.0. 사용 시 Bächlin 2010 인용을 배포본 README가 요구 |
| 참가자 | PD 10명, 그중 8명에서 FOG 발생(S04, S10은 FOG 없음), FOG 삽화 237개, 전체 약 8시간 19분 |
| 과제 | 실험실(Tel Aviv)에서 직선 보행, 회전이 많은 보행, 일상 활동 모사 |
| 센서 | 3축 가속도계 3개, **64 Hz**: 발목 위 shank, 무릎 바로 위 thigh, **엉덩이(hip)**. 채널 이름은 "Trunk"이지만 부착 위치는 hip |
| 파일 | `S<ss>R<rr>.txt` 17개, 공백 구분, 머리글 없음, **11열**: 시간(ms), shank 전후·수직·좌우, thigh 같은 순서, hip 같은 순서, 라벨. 가속도 단위 **mg** |
| 라벨 | **0 = 실험 외 구간**(센서 착용, 디브리핑 등), **1 = 실험 중 FOG 아님**(서기·걷기·회전 모두), **2 = FOG** |
| 라벨 방법 | 영상 사후 분석. 수작업이라 경계에 최대 수백 ms의 흔들림이 있을 수 있다고 문서가 밝힘 |

라벨 1에는 "걷기"뿐 아니라 "서 있기"와 "회전"이 다 들어 있다는 점이 오늘 분석의 핵심입니다. 그리고 zip 안에는 Bächlin 2010의 preprint PDF가 들어 있는데, 이 파일은 저장소에 올리거나 다시 배포하지 않고 논문은 DOI로만 가리킵니다.

## 예시로 이해하기

### 예시 1 — 가상 신호로 본 세 상황: 걷기, 떨림, 서 있기

```python
import numpy as np

fs = 64                      # Daphnet과 같은 표본화 주파수(Hz)
win = 4 * fs                 # 4초 window = 256표본
rng = np.random.default_rng(18)
t = np.arange(win) / fs

def band_powers(x, fs):
    """한 window의 locomotor band(0.5–3 Hz)와 freeze band(3–8 Hz) power."""
    x = x - x.mean()                          # 중력(직류) 성분 제거
    p = np.abs(np.fft.rfft(x)) ** 2 / len(x)  # 256-point FFT → 주파수별 power
    f = np.fft.rfftfreq(len(x), 1 / fs)       # bin 간격 = 64/256 = 0.25 Hz
    loco = p[(f >= 0.5) & (f < 3)].sum()      # 경계 3 Hz bin은 freeze 쪽에 넣기로 정함
    frz = p[(f >= 3) & (f <= 8)].sum()
    return loco, frz

# 가상 shank 수직 가속도(mg): 세 상황
walk = 300 * np.sin(2 * np.pi * 1.0 * t) + 80 * np.sin(2 * np.pi * 2.0 * t)   # 1 Hz 걸음 + 배음
tremble = 60 * np.sin(2 * np.pi * 1.0 * t) + 150 * np.sin(2 * np.pi * 5.5 * t)  # 걸음 리듬은 약하고 5.5 Hz 떨림
stand = np.zeros(win)
for name, x in [("걷기", walk), ("제자리 떨림(FOG 흉내)", tremble), ("서 있기", stand)]:
    x = 1000 + x + rng.normal(0, 8, win)     # 중력 1 g = 1000 mg + 센서 잡음
    loco, frz = band_powers(x, fs)
    print(f"{name:14s} loco={loco:12.0f}  freeze={frz:10.0f}  합={loco + frz:12.0f}  FI={frz / loco:6.2f}")
```

실행 결과:

```text
걷기             loco=     6183448  freeze=      1092  합=     6184539  FI=  0.00
제자리 떨림(FOG 흉내) loco=      234093  freeze=   1412800  합=     1646893  FI=  6.04
서 있기           loco=         564  freeze=      1274  합=        1838  FI=  2.26
```

서 있기의 FI(2.26)가 걷기보다 훨씬 크고, threshold를 2로 잡으면 FOG로 판정됩니다. 그러나 에너지 합은 걷기·떨림보다 1000배 이상 작습니다. 에너지 게이트가 이 경우를 걸러 줍니다. 0.5–3 Hz와 3–8 Hz의 경계인 3 Hz bin을 어느 쪽에 넣을지는 Bächlin 논문이 밝히지 않으므로, 여기서는 freeze 쪽에 넣기로 정하고 코드에 주석으로 남겼습니다. 이런 작은 선택도 보고서에 적어야 재현됩니다.

### 예시 2 — Daphnet 데이터 사전을 코드로 확인하기

**준비:** UCI 페이지(<https://archive.ics.uci.edu/dataset/245/daphnet+freezing+of+gait>)에서 zip을 내려받아 `data/daphnet/`에 풉니다. 풀면 `data/daphnet/dataset_fog_release/dataset/S01R01.txt`처럼 됩니다. 이 레슨 작성 때 받은 zip의 SHA-256은 `27c6173b3acee75a69284903756b9011a00766c1bbb743c37fc884c5dbc39399`이었습니다(`shasum -a 256`으로 비교). `data/`는 저장소에 올리지 않습니다.

```python
import glob, os
import numpy as np
import pandas as pd

DATA = "data/daphnet/dataset_fog_release/dataset"   # UCI zip을 data/daphnet/에 푼 위치
cols = ["t_ms",
        "shank_fwd", "shank_vert", "shank_lat",       # 발목 위(shank)
        "thigh_fwd", "thigh_vert", "thigh_lat",       # 무릎 바로 위(thigh)
        "hip_fwd", "hip_vert", "hip_lat",             # 엉덩이(hip), 문서의 채널 이름은 Trunk
        "label"]                                      # 0 실험 외, 1 FOG 아님, 2 FOG

rows = []
for path in sorted(glob.glob(os.path.join(DATA, "S*R*.txt"))):
    d = pd.read_csv(path, sep=r"\s+", header=None, names=cols)
    fname = os.path.basename(path)
    lab = d["label"].to_numpy()
    onsets = np.sum((lab[1:] == 2) & (lab[:-1] != 2)) + int(lab[0] == 2)  # 라벨 2가 시작되는 지점 수
    exp = d[d["label"] > 0]
    rows.append({"subject": fname[:3], "run": fname[3:6],
                 "n": len(d), "dt_median_ms": np.median(np.diff(d["t_ms"])),
                 "label_values": sorted(d["label"].unique().tolist()),
                 "shank_vert_mean_mg": round(exp["shank_vert"].mean()),
                 "fog_episodes": onsets,
                 "fog_s": (lab == 2).sum() / 64, "nofog_s": (lab == 1).sum() / 64})   # 64 Hz → 초
runs = pd.DataFrame(rows)
print(runs.head(3).round(1).to_string(index=False))
subj = runs.groupby("subject")[["fog_episodes", "fog_s", "nofog_s"]].sum()
subj["fog_pct"] = (100 * subj["fog_s"] / (subj["fog_s"] + subj["nofog_s"])).round(1)
subj[["fog_s", "nofog_s"]] = subj[["fog_s", "nofog_s"]].round().astype(int)
print(subj.to_string())
print("파일", len(runs), "개 | 참가자", runs["subject"].nunique(), "명 | FOG 삽화 합", int(subj["fog_episodes"].sum()),
      "| 전체 길이 %.1f분" % (runs["n"].sum() / 64 / 60))
print("실험 구간 중 FOG 비율 %.1f%%" % (100 * subj["fog_s"].sum() / (subj["fog_s"].sum() + subj["nofog_s"].sum())))
```

실행 결과:

```text
subject run      n  dt_median_ms label_values  shank_vert_mean_mg  fog_episodes  fog_s  nofog_s
    S01 R01 151987          16.0    [0, 1, 2]                 962            18   80.4   1369.6
    S01 R02  52095          16.0    [0, 1, 2]                1017             5   24.2    425.8
    S02 R01  72561          16.0    [0, 1, 2]                1067             9   55.3    344.8
         fog_episodes  fog_s  nofog_s  fog_pct
subject                                       
S01                23    105     1795      5.5
S02                24    181     1234     12.8
S03                49    287     1724     14.3
S04                 0      0     2070      0.0
S05                66    475     1616     22.7
S06                10    131     1859      6.6
S07                24     81     1529      5.1
S08                14    201      569     26.1
S09                27    270     1470     15.5
S10                 0      0     2230      0.0
파일 17 개 | 참가자 10 명 | FOG 삽화 합 237 | 전체 길이 499.4분
실험 구간 중 FOG 비율 9.7%
```

확인할 것 세 가지: (1) 시간 간격 중앙값 16 ms ≈ 64 Hz(15.625 ms를 정수 ms로 적은 것)라서 fs = 64로 고정하고 시간 열은 점검용으로만 씁니다. (2) shank 수직축 평균이 약 1000 mg(중력 1 g)이므로 열 순서가 문서와 맞습니다. 일부 파일은 라벨 0 구간(센서 착용 중)에 축 부호가 다르게 나오므로 라벨 0을 빼고 다룹니다. (3) 참가자마다 FOG 삽화 수(0–66)와 비율(0–26%)이 크게 다릅니다. 그래서 결과를 반드시 참가자별로 봐야 합니다.

### 예시 3 — 전체 데이터의 FI와 에너지, 그리고 라벨과 겹쳐 보기

```python
import glob, os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")                     # 창을 띄우지 않고 파일로만 저장
import matplotlib.pyplot as plt

DATA = "data/daphnet/dataset_fog_release/dataset"
FIG = "figures/advanced/I"
os.makedirs(FIG, exist_ok=True)
fs, WIN, STEP = 64, 256, 32               # 4 s window, 0.5 s step
SHANK_VERT = 2                            # 0부터 센 열 번호: 시간(0), shank 전후(1), shank 수직(2)
POWER_TH = 1e4                            # 에너지 threshold (mg² 단위의 band power 합, 아래 본문 참고)

f = np.fft.rfftfreq(WIN, 1 / fs)
LOCO = (f >= 0.5) & (f < 3)
FRZ = (f >= 3) & (f <= 8)

def freeze_index(x, lab):
    """window 끝 시점을 '지금'으로 보고, 지난 4초로 FI와 에너지를 계산한다(causal)."""
    ends = np.arange(WIN - 1, len(x), STEP)
    seg = x[ends[:, None] - np.arange(WIN)[::-1]]          # (window 수, 256)
    seg = seg - seg.mean(axis=1, keepdims=True)
    p = np.abs(np.fft.rfft(seg, axis=1)) ** 2 / WIN
    loco, frz = p[:, LOCO].sum(1), p[:, FRZ].sum(1)
    energy = loco + frz
    fi = np.divide(frz, loco, out=np.zeros_like(frz), where=loco > 0)
    return pd.DataFrame({"t_s": ends / fs, "label": lab[ends], "energy": energy,
                         "fi": fi, "fi_gated": np.where(energy >= POWER_TH, fi, 0.0)})

def auc(score, y):
    """순위로 계산한 AUC: FOG window의 점수가 비FOG보다 높을 확률."""
    r = pd.Series(score).rank().to_numpy()
    n1, n0 = y.sum(), (~y).sum()
    return (r[y].sum() - n1 * (n1 + 1) / 2) / (n1 * n0)

parts = []
for path in sorted(glob.glob(os.path.join(DATA, "S*R*.txt"))):
    a = np.loadtxt(path)
    w = freeze_index(a[:, SHANK_VERT], a[:, 10])
    w["subject"], w["run"] = os.path.basename(path)[:3], os.path.basename(path)[3:6]
    parts.append(w)
win = pd.concat(parts, ignore_index=True)
win = win[win["label"] > 0].copy()                    # 라벨 0(실험 외) window는 뺀다
win["fog"] = win["label"] == 2

rows = []
for s, g in win.groupby("subject"):
    y = g["fog"].to_numpy()
    row = {"subject": s, "windows": len(g), "fog_windows": int(y.sum()),
           "low_energy_%_nonFOG": round(100 * (g.loc[~g.fog, "energy"] < POWER_TH).mean(), 1)}
    if y.any():
        row["FI_median_FOG"] = round(g.loc[g.fog, "fi"].median(), 2)
        row["FI_median_nonFOG"] = round(g.loc[~g.fog, "fi"].median(), 2)
        row["AUC_FI"] = round(auc(g["fi"].to_numpy(), y), 3)
        row["AUC_FI_gated"] = round(auc(g["fi_gated"].to_numpy(), y), 3)
    rows.append(row)
print(pd.DataFrame(rows).to_string(index=False))

y = win["fog"].to_numpy()
print("\n전체 window %d개 (FOG %d개, %.1f%%)" % (len(win), y.sum(), 100 * y.mean()))
print("에너지 threshold 아래 비율: 비FOG %.1f%% | FOG %.1f%%" % (
    100 * (win.loc[~win.fog, "energy"] < POWER_TH).mean(), 100 * (win.loc[win.fog, "energy"] < POWER_TH).mean()))
for th in [1.5, 2.0, 3.0]:
    pred = win["fi_gated"].to_numpy() > th
    print("FreezeTH %.1f: 민감도 %.1f%%, 특이도 %.1f%% (전체 window를 한데 모은 값)" % (
        th, 100 * pred[y].mean(), 100 * (~pred[~y]).mean()))

# 그림: 한 run에서 FI·에너지와 FOG 라벨 겹쳐 보기
g = win[(win.subject == "S02") & (win.run == "R01")]
fig, ax = plt.subplots(2, 1, figsize=(11, 5), sharex=True)
for a_ in ax:
    on = g["fog"].to_numpy()
    a_.fill_between(g["t_s"], 0, 1, where=on, transform=a_.get_xaxis_transform(),
                    color="tab:red", alpha=0.2, step="post", label="FOG label")
ax[0].plot(g["t_s"], g["fi"], lw=0.8, color="0.3", label="FI")
ax[0].set_yscale("log"); ax[0].set_ylabel("freeze index"); ax[0].legend(loc="upper right")
ax[1].plot(g["t_s"], g["energy"], lw=0.8, color="tab:blue")
ax[1].axhline(POWER_TH, ls="--", color="k", lw=0.8)
ax[1].set_yscale("log"); ax[1].set_ylabel("band energy (mg²)"); ax[1].set_xlabel("time (s)")
fig.suptitle("Daphnet S02R01, shank vertical, 4 s window / 0.5 s step")
fig.tight_layout()
fig.savefig(os.path.join(FIG, "I18_fi_overlay.png"), dpi=120)
print("저장:", os.path.join(FIG, "I18_fi_overlay.png"))
```

실행 결과(Daphnet UCI #245 기증본, PD 10명의 실험실 기록, shank 수직축):

```text
subject  windows  fog_windows  low_energy_%_nonFOG  FI_median_FOG  FI_median_nonFOG  AUC_FI  AUC_FI_gated
    S01     3803          206                 18.9           5.06              1.21   0.782         0.845
    S02     2832          360                 29.9           1.97              1.14   0.741         0.906
    S03     4024          576                 51.0           7.38              2.41   0.817         0.887
    S04     4142            0                 49.7            NaN               NaN     NaN           NaN
    S05     4186          947                 41.2           1.74              1.39   0.609         0.851
    S06     3985          263                 40.2           2.17              1.00   0.734         0.846
    S07     3222          164                 18.6           3.89              0.54   0.842         0.895
    S08     1544          403                  5.4           7.79              2.07   0.752         0.769
    S09     3485          541                 47.6           4.05              1.52   0.832         0.922
    S10     4462            0                 39.4            NaN               NaN     NaN           NaN

전체 window 35685개 (FOG 3460개, 9.7%)
에너지 threshold 아래 비율: 비FOG 36.8% | FOG 1.0%
FreezeTH 1.5: 민감도 79.9%, 특이도 82.4% (전체 window를 한데 모은 값)
FreezeTH 2.0: 민감도 69.0%, 특이도 87.1% (전체 window를 한데 모은 값)
FreezeTH 3.0: 민감도 52.9%, 특이도 91.3% (전체 window를 한데 모은 값)
저장: figures/advanced/I/I18_fi_overlay.png
```

그림은 `figures/advanced/I/I18_fi_overlay.png`에 저장됩니다(위 panel: FI와 FOG 라벨 구간, 아래 panel: band 에너지와 threshold 점선).

**결과 읽기(탐색적 관찰):**
- **H1(FOG window의 FI가 더 높다):** FOG가 있는 8명 모두에서 FI 중앙값이 FOG window에서 더 높았습니다. 그러나 차이의 크기는 사람마다 크게 다릅니다(S05는 1.74 대 1.39로 거의 겹침).
- **H2(에너지 게이트가 도움이 된다):** 비FOG window의 36.8%가 에너지 threshold 아래였고(대부분 서 있기로 추정), FOG window는 1.0%뿐이었습니다. 이 window의 FI를 0으로 바꾸자 8명 모두에서 AUC가 올랐습니다(예: S05 0.609 → 0.851). 그림에서도 에너지가 낮은 구간(서 있기로 보이는 곳)의 FI가 걷기 구간보다 높게 출렁입니다.
- **H3(참가자 간 차이):** 같은 설정에서 gated AUC가 0.769–0.922로 갈립니다.

**이 결과로 말할 수 없는 것:** 에너지 threshold 1e4는 이 데이터의 분포를 직접 보고 고른 값이라, 이 숫자로 계산한 성능은 같은 데이터로 매개변수를 정한 **낙관적 탐색 결과**입니다(공정한 평가는 Day I19의 LOSO). 이 에너지 값은 FFT 크기의 제곱을 그대로 더한 상대 척도라서 Bächlin의 PowerTH 숫자와 직접 비교할 수 없습니다. window 라벨은 window **끝 시점**의 라벨로 정했는데(실시간 판정을 흉내), 4초 window의 대부분이 이전 상태를 담고 있으므로 FOG 시작 직후 window는 늦게 반응합니다. 그리고 이것은 10명, 실험실, 약 8시간의 기록입니다. 일상 환경이나 다른 PD 환자에게 그대로 일반화할 수 없습니다.

## 직접 해보기

1. **데이터 준비와 provenance:** 예시 2의 안내대로 내려받고, `data/daphnet/README.md`를 아래 틀로 씁니다(이 파일은 저장소에 올려도 됩니다. 데이터 파일 자체는 올리지 않음).

   ```text
   # Daphnet Freezing of Gait — provenance
   - 출처: Roggen D, Plotnik M, Hausdorff J. Daphnet Freezing of Gait. UCI ML Repository #245
   - DOI: 10.24432/C56K78 / 페이지 URL: https://archive.ics.uci.edu/dataset/245/daphnet+freezing+of+gait
   - 라이선스: CC BY 4.0 (사용 시 Bächlin et al. 2010, doi:10.1109/TITB.2009.2036165 인용)
   - 버전: 페이지에 버전 번호 없음, 기증일 2013-03-06 / 내려받은 날: ____ / zip SHA-256: ____
   - 구조: 17개 파일, 11열(시간 ms, shank·thigh·hip 각 3축 mg, 라벨), 64 Hz
   - 라벨: 0 실험 외, 1 FOG 아님(서기·걷기·회전), 2 FOG / 영상 사후 주석, 경계 오차 수백 ms 가능
   - 주의: zip 안의 논문 preprint PDF는 재배포하지 않는다. 세 번째 센서 위치는 hip(채널명 Trunk)
   ```

2. `notebooks/advanced/I/I18_freeze_index.ipynb`에서 예시 1–3을 차례로 실행하고, 출력이 위와 같은지 확인합니다.
3. `SHANK_VERT`를 thigh 수직(5)과 hip 수직(8)으로 바꿔 gated AUC 표를 다시 만들고, 센서 위치에 따라 어떻게 달라지는지 한 문단으로 적습니다. Bächlin 2010 V-B절도 허리(hip) 센서 신호가 작고 매개변수에 더 민감했다고 보고합니다.
4. `POWER_TH`를 1e3, 1e5로 바꿔 "비FOG 중 걸러진 비율"과 "FOG 중 걸러진 비율"이 어떻게 변하는지 표로 적습니다. 너무 높이면 무엇을 잃습니까?
5. 그림에서 FOG 라벨이 시작되기 몇 초 전부터 FI가 오르는 장면이 있는지 찾고, Day I17의 threshold 모델(동결 직전의 보폭 감소)과 라벨 경계 오차 중 어느 설명이 더 그럴듯한지 적습니다. 단정하지 말고 두 가능성을 모두 적습니다.
6. Day I17에서 쓴 가설 3개 아래에 "지지됨 / 부분 지지 / 지지 안 됨"과 근거 숫자를 적습니다.

⚠️ **흔한 오류 1 — 열 번호를 하나 밀려 읽기.** 첫 열이 시간이므로 shank 수직축은 0부터 세어 2번 열입니다. 수직축 평균이 약 1000 mg인지 확인하면 바로 잡힙니다.

⚠️ **흔한 오류 2 — 라벨 0을 "FOG 아님"으로 쓰기.** 라벨 0은 실험 밖 구간(센서 착용, 휴식, 디브리핑)입니다. 평가에서 빼지 않으면 특이도가 부풀려집니다.

## 퀴즈

**1.** 4초 window, 64 Hz, 256-point FFT일 때 주파수 bin 간격은 얼마입니까? (단답)

<details><summary>정답 보기</summary>

**0.25 Hz** (= 64 / 256 = 1 / 4 s). window 길이가 주파수 해상도를 정합니다. 0.5–3 Hz 같은 좁은 band를 나누려면 window가 충분히 길어야 하고, 그만큼 반응이 늦어집니다(Day I20).

</details>

**2.** 서 있을 때 FI가 오히려 커질 수 있는 이유와 그 해결책은?

<details><summary>정답 보기</summary>

움직임이 거의 없으면 두 band의 power가 모두 잡음 수준이어서 비율이 의미 없이 커질 수 있습니다. 두 band 에너지의 합이 threshold보다 작으면 FI를 0으로 만드는 **에너지 게이트**를 먼저 둡니다(Bächlin 2010). 대가로 무동형 FOG도 함께 놓칠 수 있습니다.

</details>

**3.** Moore 2008의 "전역 threshold로 78% 검출, 20% 오검출"에서 분모는 무엇입니까?
(a) 기록 시간 (b) 삽화(event) 수 (c) window 수

<details><summary>정답 보기</summary>

**(b)**. FOG 삽화의 78%를 잡았고 서 있기 삽화의 20%를 FOG로 표시했다는 뜻입니다(초록 기준). 시간이나 window 단위 성능과 직접 비교하면 안 됩니다.

</details>

**4.** Daphnet의 세 번째 센서는 어디에 붙어 있고, 채널 이름은 무엇입니까?

<details><summary>정답 보기</summary>

**엉덩이(hip)** 에 붙어 있고 채널 이름은 **Trunk**입니다. 문서의 센서 설명은 hip, 채널 목록은 Trunk라고 부르므로, 보고서에는 부착 위치를 hip으로 적고 채널명을 병기합니다.

</details>

**5.** 예시 3에서 FreezeTH 1.5일 때 민감도 79.9%, 특이도 82.4%가 나왔습니다. 이것을 "Daphnet에서 FI 알고리즘의 성능"이라고 보고해도 됩니까?

<details><summary>정답 보기</summary>

**아니요.** threshold들을 같은 데이터를 보고 골랐고(누수), window를 참가자 구분 없이 한데 모은 값이라 FOG window가 많은 사람이 결과를 좌우합니다. 공정한 성능은 참가자 단위로 threshold를 고르고 평가하는 LOSO로 구하고, 참가자별로 보고해야 합니다(Day I19).

</details>

## 오늘의 산출물 체크리스트
- [ ] `data/daphnet/README.md`: 출처, DOI, 라이선스, 기증일, 내려받은 날, SHA-256, 구조, 라벨 코드, hip/Trunk 주의, preprint 재배포 금지.
- [ ] `notebooks/advanced/I/I18_freeze_index.ipynb`: 예시 1–3 실행, 출력 일치 확인.
- [ ] `figures/advanced/I/I18_fi_overlay.png` 저장, 그림 설명 두 줄.
- [ ] 센서 위치(shank/thigh/hip)와 `POWER_TH` 바꾸기 결과 표.
- [ ] Day I17 가설 3개의 판정과 근거 숫자, "말할 수 없는 것" 세 줄.

## 더 읽을거리
- Moore ST, MacDougall HG, Ondo WG. Ambulatory monitoring of freezing of gait in Parkinson's disease. *J Neurosci Methods*. 2008;167(2):340–348. doi:[10.1016/j.jneumeth.2007.08.023](https://doi.org/10.1016/j.jneumeth.2007.08.023) (초록)
- Bächlin M, Plotnik M, Roggen D, et al. Wearable assistant for Parkinson's disease patients with the freezing of gait symptom. *IEEE Trans Inf Technol Biomed*. 2010;14(2):436–446. doi:[10.1109/TITB.2009.2036165](https://doi.org/10.1109/TITB.2009.2036165) — II절(A 하드웨어, B 원리, C 온라인 구현), III-C(라벨)
- Roggen D, Plotnik M, Hausdorff J. Daphnet Freezing of Gait [Dataset]. UCI Machine Learning Repository; 2010. doi:[10.24432/C56K78](https://doi.org/10.24432/C56K78)
- Nutt JG, et al. Freezing of gait: moving forward on a mysterious clinical phenomenon. *Lancet Neurol*. 2011;10(8):734–744. doi:[10.1016/S1474-4422(11)70143-0](https://doi.org/10.1016/S1474-4422(11)70143-0) (3–8 Hz 떨림)
- 이론 노트: [T11 — 보행동결(FOG)](../I-gait-theory/note-T11.md)

---
[← 이전](day-I17.md) · [코스 지도](../../../README.md) · [다음 →](day-I19.md)
