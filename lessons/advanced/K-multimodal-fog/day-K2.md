# Day K2 — 표본화의 출처와 모달 간 동기화: "500 Hz로 맞췄다"를 의심하기

> **주차:** 심화 파트 K — 멀티모달 FOG 데이터 분석 · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/K/K2_sampling_sync.ipynb`, `reports/advanced/K/K2_sync_report.md` (표본화 출처 표, 지연 추정 결과와 "옮기지 않음" 결정, window 규칙 비교 표)
>
> **먼저 끝내 둘 레슨:** [Day K1](day-K1.md)(데이터 구조·라벨), [Day I10](../I-gait/day-I10.md)(표본화·aliasing·zero-lag 필터), [Day C3](../C-neural-signals/day-C3.md)(Welch PSD), [Day I18](../I-gait/day-I18.md)(freeze index). 선택: [Day C2](../C-neural-signals/day-C2.md)(필터 설계), [Day 33](../../week-5/day-33.md)(누수)
>
> **이론 노트:** [T09 — 신호처리의 이론](../I-gait-theory/note-T09.md)

## 오늘의 목표
- 저장된 표본화율과 센서의 원래 표본화율을 구분하고, 업샘플한 신호의 스펙트럼에서 "빈 대역"을 확인할 수 있다.
- 서로 다른 기기의 시계 차이를 공통 물리 사건의 cross-correlation으로 추정하고, 검증하지 못한 지연은 데이터를 옮기지 않고 보고할 수 있다.
- 여러 모달을 같은 2초·50% 겹침 window로 자르고, window 라벨 규칙(≥50% / 하나라도 / 중앙 표본)이 성능 숫자를 어떻게 바꾸는지 보일 수 있다.

## 🎬 영상으로 먼저 보기

- [Sampling, Aliasing & Nyquist Theorem — 0612 TV w/ NERDfirst](https://www.youtube.com/watch?v=yWqrx08UeUs) (10:47)
- **무엇에 주목할까:** [Day I10](../I-gait/day-I10.md)에서 본 영상입니다. 오늘은 반대 방향 질문을 들고 다시 보세요. "빠른 성분이 느린 가짜로 접히는 것"이 내려 표본화(1000 → 500 Hz)에서 어떻게 생기는지, 그리고 올려 표본화(100 → 500 Hz)는 왜 잃어버린 빠른 성분을 되살리지 못하는지 생각하며 봅니다.

## 개념 설명

표본화와 aliasing의 원리, Butterworth 필터와 zero-lag(앞뒤) 필터는 [Day I10](../I-gait/day-I10.md)·[T09](../I-gait-theory/note-T09.md)·[Day C2](../C-neural-signals/day-C2.md)에서, Welch PSD와 대역 파워는 [Day C3](../C-neural-signals/day-C3.md)에서 배웠습니다. 오늘은 그 도구로 **이 데이터가 어떻게 만들어졌는지 역추적**합니다.

### "500 Hz로 맞춰져 있다"는 저장 격자의 이야기

Zhang 2022 데이터의 과제 파일은 모든 열이 500 Hz(행 간격 2 ms)입니다. 그러나 이것은 **저장할 때 맞춘 격자**이지, 모든 센서가 원래 500 Hz로 쟀다는 뜻이 아닙니다. 문서들은 이 점에서 서로 어긋납니다. 논문 Methods 절은 가속도와 SC가 500 Hz로 기록됐다고 쓰고, 같은 논문의 데이터 설명 절과 라벨된 데이터의 README, 저자 코드(`raw2prep.py`)는 100 Hz라고 씁니다. 원본 데이터의 README는 또 500 Hz라고 씁니다. EEG·EMG는 모두 1000 Hz로 일치합니다.

이럴 때는 원본 파일을 봅니다(실제 데이터 R1). 원본 IMU 파일의 시각 간격은 10 ms, 즉 **100 Hz**였습니다. 그리고 라벨된 파일의 가속도는 5행마다 원본 값과 **정확히 같은 정수**였습니다. 원본 100 Hz 점들을 cubic spline으로 잇고 그 사이에 4개씩 점을 끼워 넣은 것입니다(저자 코드의 `spline` 함수가 하는 일과 같음).

사진을 확대할 때 프로그램이 픽셀 사이를 부드럽게 채워 주지만, 찍을 때 없던 솜털이 생기지는 않습니다. 업샘플도 같습니다. 100 Hz로 잰 신호에는 50 Hz(그 Nyquist)보다 빠른 정보가 처음부터 없으므로, 500 Hz 격자로 옮겨도 50–250 Hz 대역은 **비어** 있습니다(예시 1). 그러니 이 데이터의 가속도로 "50 Hz 위 대역 특징"을 만들면 측정이 아니라 보간 방법의 흔적을 재는 셈입니다.

같은 확인에서 하나 더 드러납니다. README는 가속도에 16 Hz low-pass 필터와 정규화를 했다고 쓰지만, 필터를 거친 신호는 원본 정수값을 그대로 가질 수 없습니다. 실제 파일의 가속도에는 **그 필터가 적용되지 않았습니다**. "Filtered Data"라는 폴더 이름도 문서처럼 그대로 믿지 않습니다.

### 내려 표본화: 건너뛰기는 필터가 아니다

반대로 EEG·EMG는 1000 Hz에서 500 Hz로 **내렸습니다.** 저자 코드(`raw2prep.py`)는 1000 Hz 파일에서 **한 행씩 건너뛰어** 남깁니다. 저역 통과 필터 없이 건너뛰면, 새 Nyquist(250 Hz)보다 빠른 성분이 아래로 접혀 들어옵니다(aliasing, [Day I10](../I-gait/day-I10.md)). 예를 들어 300 Hz 성분은 500 − 300 = 200 Hz처럼 보입니다(예시 2). EMG는 수백 Hz까지 에너지가 있는 신호라 이 문제가 실제로 생길 수 있습니다. 다만 README는 EMG에 10–500 Hz band-pass를 했다고만 하고, 그 필터를 1000 Hz 단계에서 했는지, 건너뛰기 전후 어느 쪽인지는 쓰지 않았습니다. 그래서 오늘 결론은 "aliasing이 있었다"가 아니라 "**있었는지 문서로 확인할 수 없다**"입니다. 처음부터 다시 처리한다면 `scipy.signal.decimate`처럼 저역 통과 후 내리는 함수를 씁니다.

### 서로 다른 시계를 맞추기: 공통 사건과 cross-correlation

이 실험은 EEG·EMG를 한 무선 시스템이, 가속도·SC를 다른 장치들이 기록했습니다. 논문에 따르면 장치마다 자기 밀리초 타이머가 있었고, 저자들은 (1) 따로 둔 스톱워치로 잰 과제 시작·끝 시각과 (2) 과제 전에 빠르게 세 번 일어섰다 앉게 해 가속도에 생긴 급변을 기준점으로 써서 맞췄습니다. 이렇게 맞춘 결과가 얼마나 정확한지는 논문에 숫자로 나와 있지 않습니다.

우리가 직접 점검하는 방법은 **두 기기가 함께 본 물리 사건**을 찾는 것입니다. 발이 땅에 닿는 충격은 정강이 센서에도 허리 센서에도 찍힙니다. 두 신호를 조금씩 밀어 가며 겹쳐 보고(cross-correlation), 가장 잘 겹치는 밀기 양을 지연으로 추정합니다. 두 사람이 같은 공연을 각자 녹음했을 때 박수 소리로 두 파일을 맞추는 것과 같습니다.

함정이 셋 있습니다.
1. **주기적인 신호는 답이 여러 개입니다.** 걸음이 규칙적이면 한 걸음 주기만큼 밀어도 거의 똑같이 잘 겹칩니다(예시 3). 탐색 범위를 반 주기보다 좁게 잡거나, 불규칙한 사건(회전, 일어서기)을 씁니다.
2. **"같은 사건"이 아니면 지연에 생리가 섞입니다.** 전경골근 EMG와 정강이 가속도를 맞추면 지연이 나오지만, 근육은 발 디딤보다 **먼저** 수축하므로 그 값에는 시계 차이와 근육·운동 사이의 시간이 함께 들어 있습니다. 둘을 나눌 방법이 없습니다.
3. **추정은 가설이지 보정값이 아닙니다.** 그래서 이 과정의 규칙은 이렇습니다. **검증하지 못한 지연은 데이터를 옮기지 않고 보고합니다.** 옮겨야 한다면 "X ms 옮겼다, 근거는 Y, 이것은 가정이다"라고 적고, 옮긴 경우와 안 옮긴 경우의 결과를 함께 보여 줍니다.

### 같은 window로 자르기와 window 라벨 규칙

모달을 합치려면 모든 모달을 **같은 시작 행, 같은 길이**로 잘라야 합니다. 이 파트는 2초 window를 1초씩 옮기는 설정(50% 겹침)을 기본으로 하고, window마다 `(기록, 과제, 시작 행)`을 열쇠로 붙입니다. Day K5에서 모달별 특징 표를 이 열쇠로 합칩니다.

window 하나에는 2초 × 500 = 1000개의 라벨이 들어 있으므로 window의 라벨을 하나로 정하는 규칙이 필요합니다.
- **majority:** FOG 표본이 50% 이상이면 1
- **any:** FOG 표본이 하나라도 있으면 1 (놓치지 않기 우선)
- **center:** 가운데 표본의 라벨 (window 끝 라벨을 쓴 [Day I18](../I-gait/day-I18.md)과 비교해 보세요)

논문은 3초 window를 0.3초씩 옮기고 FOG 표본 비율(PFG)이 연구자가 정한 문턱(대략 0.75–0.85)을 넘으면 1로 했습니다. 규칙이 다르면 **같은 탐지기라도 성능 숫자가 달라집니다.** 경계에 걸친 window를 어느 편에 넣느냐가 바뀌기 때문입니다. 그래서 규칙은 결과를 보기 전에 정하고 보고서에 적습니다. 그리고 0.3초씩 옮긴 3초 window는 이웃끼리 90%를 공유하므로, window를 무작위로 train/test에 나누면 거의 같은 window가 양쪽에 들어갑니다([Day 33](../../week-5/day-33.md)). 논문의 검증은 무작위 4:1 분할이었으므로 그 성능 숫자는 이 점을 감안해 읽습니다.

## 예시로 이해하기

### 예시 1 — 업샘플은 정보를 늘리지 않는다: 100 Hz를 500 Hz로 보간한 스펙트럼

```python
import numpy as np
from scipy.interpolate import CubicSpline
from scipy.signal import welch

def make_acc(t, rng):
    """합성 데이터 뼈대의 가속도 식 (25–35초 FOG 가정)"""
    label = ((t >= 25) & (t < 35)).astype(int)
    return np.where(label == 0, np.sin(2*np.pi*1.0*t), 0.4*np.sin(2*np.pi*5.0*t)) + 0.1*rng.standard_normal(t.size)

# (가) 처음부터 500 Hz로 기록했다면
fs = 500
t = np.arange(0, 60, 1/fs)
acc500 = make_acc(t, np.random.default_rng(0))

# (나) 센서는 100 Hz로 기록했고, 나중에 cubic spline으로 500 Hz 격자에 맞췄다면
t100 = np.arange(0, 60, 1/100)
acc100 = make_acc(t100, np.random.default_rng(1))
up = CubicSpline(t100, acc100)(t[t <= t100[-1]])          # 500 Hz 격자로 보간

print("행 수: 500 Hz 원본 %d, 100 Hz 원본 %d, 보간 후 %d" % (acc500.size, acc100.size, up.size))
print("보간 결과의 5행마다 값 == 100 Hz 원본:", np.allclose(up[::5], acc100))
for name, x in [("처음부터 500 Hz", acc500), ("100 Hz → 500 Hz 보간", up)]:
    f, p = welch(x, fs=fs, nperseg=1000)                  # 2초 window, 0.5 Hz 간격
    share = p[f > 50].sum() / p.sum()
    print(f"{name:16s} 50 Hz 위 power 비율 = {share:.2e}")
```

실행 결과:

```text
행 수: 500 Hz 원본 30000, 100 Hz 원본 6000, 보간 후 29996
보간 결과의 5행마다 값 == 100 Hz 원본: True
처음부터 500 Hz      50 Hz 위 power 비율 = 1.81e-02
100 Hz → 500 Hz 보간 50 Hz 위 power 비율 = 5.17e-04
```

두 신호 모두 "500 Hz 신호"처럼 생겼지만, 보간한 쪽은 50 Hz 위 power가 35배쯤 작습니다. 처음부터 500 Hz로 잰 쪽에 있던 50 Hz 위 power는 센서 잡음이었는데, 100 Hz로 잰 순간 그 대역은 기록되지 않았고 보간이 되살리지 못합니다. 남은 아주 작은 값은 spline 곡선이 만든 흔적입니다. 그리고 "5행마다 원본과 같다"는 검사가 실제 데이터에서 업샘플 여부를 가려내는 지문이 됩니다(R1).

### 예시 2 — 한 행씩 건너뛰면 300 Hz가 200 Hz로 접힌다

```python
import numpy as np
from scipy.signal import welch, decimate

# 1000 Hz로 기록한 "EMG 같은" 신호: 80 Hz 성분 + 300 Hz 성분 (설명용 가정)
fs_hi = 1000
t = np.arange(0, 10, 1/fs_hi)
rng = np.random.default_rng(0)
x = np.sin(2*np.pi*80*t) + np.sin(2*np.pi*300*t) + 0.1*rng.standard_normal(t.size)

skip = x[::2]                  # 한 행 걸러 버리기 (필터 없음) → 500 Hz
dec = decimate(x, 2, ftype="fir", zero_phase=True)   # 저역 통과 후 버리기 → 500 Hz

for name, y in [("1000 Hz 원본", x), ("[::2] 건너뛰기", skip), ("decimate", dec)]:
    fs = fs_hi if y is x else 500
    f, p = welch(y, fs=fs, nperseg=fs)               # 1 Hz 간격
    top = f[np.argsort(p)[-2:]][::-1]
    print(f"{name:12s} fs={fs:4d}  가장 큰 두 봉우리: {top} Hz  | 200 Hz의 power: {p[f == 200][0]:.3f}")
```

실행 결과:

```text
1000 Hz 원본   fs=1000  가장 큰 두 봉우리: [300.  80.] Hz  | 200 Hz의 power: 0.000
[::2] 건너뛰기   fs= 500  가장 큰 두 봉우리: [200.  80.] Hz  | 200 Hz의 power: 0.337
decimate     fs= 500  가장 큰 두 봉우리: [80. 81.] Hz  | 200 Hz의 power: 0.000
```

건너뛰기 결과에는 원래 없던 200 Hz 봉우리가 생겼습니다. 이 가짜 봉우리는 진짜 200 Hz 성분과 구별할 수 없어서, 나중에 어떤 필터를 걸어도 골라 낼 수 없습니다. `decimate`는 먼저 250 Hz 위를 잘라 내고 내리므로 300 Hz 성분이 그냥 사라집니다(80 Hz 봉우리가 이웃 칸 81 Hz로 조금 번진 것은 Welch window의 누출입니다).

### 예시 3 — 공통 사건으로 두 기기의 지연 추정하기

```python
import numpy as np
from scipy.signal import correlate, correlation_lags

fs = 500
t = np.arange(0, 60, 1/fs)
label = ((t >= 25) & (t < 35)).astype(int)
rng = np.random.default_rng(0)

# 공통 물리 사건: 발 디딤 충격. 걷는 동안 약 1초마다, 간격은 조금씩 불규칙(가정)
steps = np.cumsum(rng.uniform(0.85, 1.15, 80))
steps = steps[(steps < 60) & ~((steps >= 25) & (steps < 35))]     # FOG 중에는 디딤 없음(가정)
def impacts(times, width=0.03):
    x = np.zeros(t.size)
    for s in times:
        x += np.exp(-0.5 * ((t - s) / width) ** 2)
    return x

TRUE_LAG = 0.120                                   # 기기 B의 시계가 120 ms 늦다고 가정
a = impacts(steps) + 0.05 * rng.standard_normal(t.size)             # 기기 A (예: 정강이 IMU)
b = impacts(steps + TRUE_LAG) + 0.05 * rng.standard_normal(t.size)  # 기기 B (같은 충격을 늦게 기록)

def best_lag(a, b, fs, max_lag_s):
    """b가 a보다 몇 초 늦은가 (+면 b가 늦음). 탐색 범위를 ±max_lag_s로 제한한다."""
    c = correlate(b - b.mean(), a - a.mean(), mode="full")
    lags = correlation_lags(b.size, a.size, mode="full")
    keep = np.abs(lags) <= max_lag_s * fs
    c, lags = c[keep], lags[keep]
    i = np.argmax(c)
    r = c[i] / np.sqrt(((a - a.mean())**2).sum() * ((b - b.mean())**2).sum())
    return lags[i] / fs, r

print("참값: %.3f s" % TRUE_LAG)
print("추정(±0.5 s 탐색): %.3f s, r = %.2f" % best_lag(a, b, fs, 0.5))

# 걸음이 완벽히 규칙적이면? → 한 걸음 주기만큼 떨어진 곳에도 똑같이 높은 봉우리가 생긴다
reg = np.arange(0.5, 60, 1.0)
a2 = impacts(reg) + 0.05 * rng.standard_normal(t.size)
b2 = impacts(reg + TRUE_LAG) + 0.05 * rng.standard_normal(t.size)
for m in [0.5, 1.5]:
    print("규칙적 걸음, 탐색 ±%.1f s: 추정 %.3f s, r = %.2f" % ((m,) + best_lag(a2, b2, fs, m)))
lags = correlation_lags(t.size, t.size, mode="full")
for name, (x, y) in [("불규칙", (a, b)), ("규칙적", (a2, b2))]:
    c = correlate(y - y.mean(), x - x.mean(), mode="full")
    print("  %s 걸음: 지연 +0.12 / −0.88 / +1.12 s의 상관(최댓값 대비) = %s" % (
        name, " / ".join("%.2f" % (c[lags == round(L * fs)][0] / c.max()) for L in [0.12, -0.88, 1.12])))
```

실행 결과:

```text
참값: 0.120 s
추정(±0.5 s 탐색): 0.120 s, r = 0.94
규칙적 걸음, 탐색 ±0.5 s: 추정 0.120 s, r = 0.95
규칙적 걸음, 탐색 ±1.5 s: 추정 0.120 s, r = 0.95
  불규칙 걸음: 지연 +0.12 / −0.88 / +1.12 s의 상관(최댓값 대비) = 1.00 / 0.24 / 0.24
  규칙적 걸음: 지연 +0.12 / −0.88 / +1.12 s의 상관(최댓값 대비) = 1.00 / 0.98 / 0.98
```

지연 자체는 두 경우 모두 맞게 나왔지만, 규칙적인 걸음에서는 ±1걸음 떨어진 지연(−0.88 s, +1.12 s)도 상관이 0.98로 거의 같습니다. 잡음이 조금만 더 커도 최댓값이 이웃 봉우리로 넘어갈 수 있다는 뜻입니다. 불규칙한 걸음에서는 이웃 봉우리가 0.24로 낮아 답이 하나로 정해집니다. 실제 데이터에서 추정한 지연이 구간마다 반 걸음·한 걸음씩 튀면 이 함정을 먼저 의심합니다.

### 예시 4 — 같은 탐지기, 다른 window 라벨 규칙, 다른 성능 숫자

```python
import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score

# ---- 합성 데이터 뼈대 + 짧은 FOG 하나(48–50.5초, 가정) ----
fs = 500
t = np.arange(0, 60, 1/fs)
label = ((t >= 25) & (t < 35)).astype(int)
label[(t >= 48) & (t < 50.5)] = 1
rng = np.random.default_rng(0)
acc = np.where(label == 0, np.sin(2*np.pi*1.0*t), 0.4*np.sin(2*np.pi*5.0*t)) + 0.1*rng.standard_normal(t.size)

def window_starts(n, fs=500, win_s=2.0, step_s=1.0):
    """win_s초 window를 step_s초씩 옮길 때 각 window의 시작 행 (기본: 2초, 50% 겹침)"""
    w, s = int(win_s * fs), int(step_s * fs)
    return np.arange(0, n - w + 1, s)

def window_label(y_win, rule="majority"):
    if rule == "majority":                       # FOG 표본이 절반 이상이면 1
        return int(y_win.mean() >= 0.5)
    if rule == "any":                            # FOG 표본이 하나라도 있으면 1
        return int(y_win.max() == 1)
    if rule == "center":                         # 가운데 표본의 라벨
        return int(y_win[len(y_win) // 2])
    raise ValueError(rule)

def fi_score(x, fs):
    """한 window의 freeze index (Day I18의 정의를 점수로만 사용)"""
    x = x - x.mean()
    p = np.abs(np.fft.rfft(x)) ** 2
    f = np.fft.rfftfreq(x.size, 1 / fs)
    return p[(f >= 3) & (f <= 8)].sum() / p[(f >= 0.5) & (f < 3)].sum()

W = 2 * fs
starts = window_starts(t.size, fs)
score = np.array([fi_score(acc[s:s + W], fs) for s in starts])
frac = np.array([label[s:s + W].mean() for s in starts])
print("window 수:", len(starts), "| FOG가 일부만 걸친 window:", int(((frac > 0) & (frac < 1)).sum()))
rows = []
for rule in ["majority", "any", "center"]:
    y = np.array([window_label(label[s:s + W], rule) for s in starts])
    pred = score > 1.0
    rows.append({"rule": rule, "positives": int(y.sum()),
                 "sens": pred[y == 1].mean(), "spec": (~pred[y == 0]).mean(), "AUC": roc_auc_score(y, score)})
print(pd.DataFrame(rows).round(3).to_string(index=False))
print("\n경계 window (시작초, FOG 비율, 점수):")
for s, fr, sc in zip(starts, frac, score):
    if 0 < fr < 1:
        print("  %4.1f  %.2f  %6.2f" % (s / fs, fr, sc))
```

실행 결과:

```text
window 수: 59 | FOG가 일부만 걸친 window: 5
    rule  positives  sens  spec   AUC
majority         14 0.714   1.0 1.000
     any         15 0.667   1.0 1.000
  center         13 0.769   1.0 0.997

경계 window (시작초, FOG 비율, 점수):
  24.0  0.50    0.17
  34.0  0.50    0.17
  47.0  0.50    0.17
  49.0  0.75    0.59
  50.0  0.25    0.06
```

탐지기와 threshold는 같은데 민감도가 0.667에서 0.769까지 움직였습니다. 차이는 전부 경계 window 5개에서 나옵니다. 걷기와 떨림이 반씩 섞인 window는 freeze index가 낮아서, 그런 window를 FOG로 부르는 규칙(any)일수록 민감도가 떨어집니다. "민감도 77%"라는 숫자만 보고는 이 차이를 알 수 없으므로, 보고서에는 window 길이·이동 간격·라벨 규칙을 반드시 함께 적습니다.

## 직접 해보기

**1. 업샘플 지문 찾기.** 100 Hz 신호를 500 Hz로 보간한 뒤, 원본이 몇 행마다 그대로 들어 있는지 확인하세요.

```python
import numpy as np
from scipy.interpolate import CubicSpline
t100 = np.arange(0, 10, 1/100)
x100 = np.sin(2*np.pi*1.0*t100)
t500 = np.arange(0, t100[-1] + 1e-9, 1/500)
up = CubicSpline(t100, x100)(t500)
print(len(x100), len(up), np.allclose(up[::____], x100))
```

<details><summary>모범답안 보기</summary>

```python
print(len(x100), len(up), np.allclose(up[::5], x100))
```

```text
1000 4996 True
```

500 / 100 = 5행마다 원본 점(매듭)이 있습니다. 실제 파일에서 이 검사가 `True`면 그 열은 원래 100 Hz였다는 강한 증거입니다.

</details>

**2. 올바른 내려 표본화.** 80 Hz와 400 Hz 성분이 있는 1000 Hz 신호를 500 Hz로 내리세요. 건너뛰기와 비교합니다.

```python
import numpy as np
from scipy.signal import welch, decimate
fs_hi = 1000
t = np.arange(0, 10, 1/fs_hi)
x = np.sin(2*np.pi*80*t) + np.sin(2*np.pi*400*t)
for name, y in [("[::2]", x[::2]), ("decimate", decimate(x, ____, ftype="fir", zero_phase=True))]:
    f, p = welch(y, fs=500, nperseg=500)
    print(name, "봉우리:", sorted(f[np.argsort(p)[-2:]].tolist()))
```

<details><summary>모범답안 보기</summary>

```python
("decimate", decimate(x, 2, ftype="fir", zero_phase=True))
```

```text
[::2] 봉우리: [80.0, 100.0]
decimate 봉우리: [79.0, 80.0]
```

400 Hz는 500 − 400 = 100 Hz로 접혔습니다. `decimate`의 두 번째 인자는 "몇 배로 줄이나"이고, 내리기 전에 새 Nyquist 위를 잘라 냅니다.

</details>

**3. 지연의 부호 읽기.** 기기 B가 A보다 80 ms **이르게** 기록했습니다. 예시 3의 `best_lag`로 추정하고 부호를 해석하세요. 빈칸은 탐색 범위를 행 수로 바꾸는 부분입니다.

```python
import numpy as np
from scipy.signal import correlate, correlation_lags
fs = 500
t = np.arange(0, 60, 1/fs)
rng = np.random.default_rng(3)
steps = np.cumsum(rng.uniform(0.85, 1.15, 70)); steps = steps[steps < 59]
def impacts(times, width=0.03):
    return sum(np.exp(-0.5 * ((t - s) / width) ** 2) for s in times)
a = impacts(steps); b = impacts(steps - 0.08)          # B가 80 ms 이르다
def best_lag(a, b, fs, max_lag_s):
    c = correlate(b - b.mean(), a - a.mean(), mode="full")
    lags = correlation_lags(b.size, a.size, mode="full")
    keep = np.abs(lags) <= max_lag_s * ____
    return lags[keep][np.argmax(c[keep])] / fs
print("추정 지연: %.3f s" % best_lag(a, b, fs, 0.5))
```

<details><summary>모범답안 보기</summary>

```python
    keep = np.abs(lags) <= max_lag_s * fs
```

```text
추정 지연: -0.080 s
```

음수는 "B가 A보다 이르다"는 뜻입니다. 부호 규약은 함수마다 다르므로, 실제 데이터에 쓰기 전에 이렇게 **답을 아는 합성 신호로 부호부터 확인**합니다.

</details>

**4. window 개수 세기.** 60초(30000행) 기록을 2초 window, 1초 이동으로 자르면 window가 몇 개입니까? 3초 window, 0.3초 이동이면?

```python
import numpy as np
def window_starts(n, fs=500, win_s=2.0, step_s=1.0):
    w, s = int(win_s * fs), int(step_s * fs)
    return np.arange(0, n - w + 1, ____)
st = window_starts(30000)
print(len(st), st[:3], st[-1])
print(len(window_starts(30000, win_s=3.0, step_s=0.3)))
```

<details><summary>모범답안 보기</summary>

```python
    return np.arange(0, n - w + 1, s)
```

```text
59 [   0  500 1000] 29000
191
```

마지막 window는 29000행(58초)에서 시작해 60초에 끝납니다. `n - w + 1`의 `+ 1`이 없으면 마지막 window 하나를 잃습니다. 0.3초 이동은 같은 기록에서 window를 3배 넘게 만들지만, 이웃 window끼리 90%가 겹쳐서 새 정보가 그만큼 늘지는 않습니다.

</details>

**5. "any" 규칙 구현.** 1000표본 window 중 마지막 300개만 FOG일 때 세 규칙의 라벨을 구하세요.

```python
import numpy as np
def window_label(y_win, rule="majority"):
    if rule == "majority": return int(y_win.mean() >= 0.5)
    if rule == "any":      return int(y_win.____() == 1)
    if rule == "center":   return int(y_win[len(y_win) // 2])
y_win = np.r_[np.zeros(700), np.ones(300)]           # 1000표본 중 마지막 300개만 FOG
print({r: window_label(y_win, r) for r in ["majority", "any", "center"]})
```

<details><summary>모범답안 보기</summary>

```python
    if rule == "any":      return int(y_win.max() == 1)
```

```text
{'majority': 0, 'any': 1, 'center': 0}
```

FOG가 시작되는 순간을 담은 window입니다. 조기 경보가 목적이면 이런 window를 1로 부르고 싶겠지만(any), 그 대가로 "걷기가 대부분인 window"까지 FOG로 학습하게 됩니다.

</details>

⚠️ **흔한 오류 1 — 저장 격자를 센서 속도로 착각하기.** "500 Hz 파일이니 200 Hz 대역 특징도 쓸 수 있다"는 가속도에서는 틀립니다. 원래 100 Hz였으므로 50 Hz 위는 보간의 흔적입니다.

⚠️ **흔한 오류 2 — 추정한 지연으로 데이터를 조용히 옮기기.** 지연 추정에는 생리적 시간차와 주기 모호성이 섞입니다. 옮겼다면 얼마를 왜 옮겼는지 적고, 안 옮긴 결과도 함께 보여 줍니다.

### 실제 데이터로 해보기 (선택)

준비는 [Day K1](day-K1.md)과 같고, 원본 데이터([doi:10.17632/t8j8v4hnm4.1](https://doi.org/10.17632/t8j8v4hnm4.1), CC BY 4.0)를 `data/xuanwu_raw/`에 풀어 `data/xuanwu_raw/Raw/001/LShank.csv`처럼 되게 합니다. 이 레슨 작성 때 쓴 원본 zip의 SHA-256은 `5b685af25a780c72bf1e8305f77324d59bfeadfa0909d4cf0d0d734fd2984587`입니다.

**R1 — 원래 표본화율과 업샘플 지문.**

```python
import numpy as np
import pandas as pd
from scipy.signal import welch

RAW = "data/xuanwu_raw/Raw/001"             # 원본 zip을 data/xuanwu_raw/에 푼 위치
FIL = "data/xuanwu/Filtered Data/001"

# 1) 원본 EEG/EMG 헤더: 채널 수와 표본 간격
hdr = open(f"{RAW}/1211-003.vhdr", encoding="utf-8", errors="replace").read().splitlines()
print([l for l in hdr if l.startswith(("NumberOfChannels", "SamplingInterval"))])

# 2) 원본 IMU 파일: 시각 간격으로 원래 표본화율 확인
imu = {}
for s in ["LShank", "Waist", "Arm"]:
    r = pd.read_csv(f"{RAW}/{s}.csv", header=None, usecols=range(8), skipinitialspace=True)
    ts = pd.to_datetime(r[0], format="%Y_%m_%d_%H_%M_%S_%f")
    dt = np.diff(ts.to_numpy()).astype("timedelta64[ms]").astype(int)
    print(f"{s:6s} 원본 {len(r)}행, 시각 간격 중앙값 {np.median(dt):.0f} ms")
    imu[s] = (r, ts)

# 3) 라벨된 파일의 IMU 7열이 원본 행과 같은가? (5행마다 = 보간의 매듭)
COL0 = {"LShank": 32, "Waist": 46, "Arm": 53}
f = pd.read_csv(f"{FIL}/task_1.txt", header=None, usecols=[1] + list(range(32, 60)))
print("라벨된 파일 시각:", f[1].iloc[0], "→", f[1].iloc[-1], f"({len(f)}행)")
for s, (r, ts) in imu.items():
    rv = r[list(range(1, 8))].to_numpy(float)
    k = f[list(range(COL0[s], COL0[s] + 7))].to_numpy()[::5]
    h = np.flatnonzero(np.isclose(rv, k[0], atol=1e-6).all(axis=1))[0]   # 첫 매듭과 같은 원본 행
    same = np.isclose(rv[h:h + len(k)], k, atol=1e-6).all(axis=1).mean()
    span = (ts.iloc[h + len(k) - 1] - ts.iloc[h]).total_seconds()
    print(f"{s:6s} 매듭 {len(k)}개 중 원본과 같은 비율 {same:.4f} | 시작 원본 행 {h} | 그 행의 원본 시각 {ts.iloc[h].time()} | 원본 시각으로 잰 길이 {span:.2f} s")

# 4) 스펙트럼: 원래 100 Hz였다면 50 Hz 위는 비어 있어야 한다
fs = 500
for name, c in [("LShank_ax", 32), ("Arm_SC", 59)]:
    x = f[c].to_numpy()
    fr, p = welch(x - x.mean(), fs=fs, nperseg=1000)
    tot = p[fr > 0.5].sum()
    print(f"{name:9s} power 비율: 16 Hz 위 {p[fr > 16].sum() / tot:.3f}, 50 Hz 위 {p[fr > 50].sum() / tot:.5f}")
e = pd.read_csv(f"{FIL}/task_1.txt", header=None, usecols=[28])[28].to_numpy()
fr, p = welch(e - e.mean(), fs=fs, nperseg=1000)
print(f"EMG(c28) power 비율: 50 Hz 위 {p[fr > 50].sum() / p[fr > 0.5].sum():.3f} | 49–51 Hz / 45–55 Hz 중앙값: {p[(fr >= 49) & (fr <= 51)].mean() / np.median(p[(fr > 45) & (fr < 55)]):.3f}")
```

실행 결과(원본 v1과 라벨된 v3, 환자 001):

```text
['NumberOfChannels=32', 'SamplingInterval=1000']
LShank 원본 221165행, 시각 간격 중앙값 10 ms
Waist  원본 221164행, 시각 간격 중앙값 10 ms
Arm    원본 221164행, 시각 간격 중앙값 10 ms
라벨된 파일 시각: 12:04:38 → 12:10:39 (180501행)
LShank 매듭 36101개 중 원본과 같은 비율 1.0000 | 시작 원본 행 94800 | 그 행의 원본 시각 11:57:51.591000 | 원본 시각으로 잰 길이 361.00 s
Waist  매듭 36101개 중 원본과 같은 비율 1.0000 | 시작 원본 행 94800 | 그 행의 원본 시각 12:04:13.624000 | 원본 시각으로 잰 길이 360.52 s
Arm    매듭 36101개 중 원본과 같은 비율 1.0000 | 시작 원본 행 94800 | 그 행의 원본 시각 12:04:27.453000 | 원본 시각으로 잰 길이 360.77 s
LShank_ax power 비율: 16 Hz 위 0.161, 50 Hz 위 0.00096
Arm_SC    power 비율: 16 Hz 위 0.002, 50 Hz 위 0.00005
EMG(c28) power 비율: 50 Hz 위 0.015 | 49–51 Hz / 45–55 Hz 중앙값: 0.043
```

**결과 읽기:**
- **원래 표본화율:** EEG·EMG 기록 장치는 32채널(25 EEG + EMG 4 + IO + TP9·TP10), 1000 µs 간격 = 1000 Hz. IMU 원본은 10 ms 간격 = **100 Hz**. "모든 센서가 500 Hz로 동기화되어 있다"는 문장은 "500 Hz 격자에 **옮겨 담았다**"로 고쳐 읽어야 합니다. 001의 다른 IMU와 다른 환자들의 원본 IMU 파일도 같은 방법으로 보면 모두 10 ms 간격이었습니다(코드는 같으므로 생략).
- **업샘플 지문:** 세 IMU 모두 5행마다의 값 36101개가 원본과 100% 같았습니다. 라벨된 파일의 가속도·SC는 **원본 100 Hz를 cubic spline으로 보간한 것**이고, README가 말한 16 Hz low-pass는 이 값들에 적용되지 않았습니다. 실제로 정강이 가속도는 16 Hz 위 power가 16%나 남아 있고, 50 Hz 위는 0.1%로 비어 있습니다(원래 Nyquist가 50 Hz).
- **EMG의 notch:** 50 Hz 근처 power가 이웃 대역의 4% 수준으로 움푹 패어 있어, README의 50 Hz notch는 EMG에 적용된 것으로 보입니다. 한편 EMG power의 98.5%가 50 Hz **아래**에 있습니다. 근전도로서는 낮은 쪽에 쏠린 스펙트럼이며, K1 그림에서 본 발 디딤 순간의 뾰족한 봉우리(움직임 잡음 의심)와 함께 Day K3에서 다시 봅니다.
- **시계 문제:** 세 IMU는 **같은 원본 행 번호(94800)** 에서 잘렸습니다. 그런데 그 행의 원본 시각은 정강이 11:57:51, 허리 12:04:13, 팔 12:04:27로 제각각이고, 라벨된 파일은 12:04:38이라고 씁니다. 장치마다 시계의 영점이 달랐다는 뜻이고, 저자들은 시각이 아니라 **행 번호가 같으면 같은 순간**이라고 보고 맞췄습니다. 더 미묘한 것은 같은 36100개 행을 각 장치 시계로 재면 361.00 s, 360.52 s, 360.77 s로 최대 0.48초 차이가 난다는 점입니다. 시계가 맞다면 과제 끝 무렵 허리와 정강이가 0.5초 어긋나 있어야 합니다. 이것을 R2에서 데이터로 점검합니다.

**R2 — 허리와 정강이가 함께 본 발 디딤 충격으로 지연 추정.** 30초 구간마다 지연을 구해, 과제가 진행되며 지연이 0.5초 쪽으로 **흘러가는지** 봅니다.

```python
import numpy as np
import pandas as pd
from scipy.signal import butter, sosfiltfilt, correlate, correlation_lags

FIL = "data/xuanwu/Filtered Data/001"
fs = 500
d = pd.read_csv(f"{FIL}/task_1.txt", header=None, usecols=[28, 32, 33, 34, 46, 47, 48])

sos_hp = butter(2, 0.5, btype="high", fs=fs, output="sos")
sos_lp = butter(2, 5, btype="low", fs=fs, output="sos")
def impact_env(xyz):
    """3축 크기 → 0.5 Hz 고역(중력 제거) → 정류 → 5 Hz 저역: 발 디딤 충격의 덩어리"""
    m = np.linalg.norm(xyz, axis=1)
    return sosfiltfilt(sos_lp, np.abs(sosfiltfilt(sos_hp, m)))

def best_lag(a, b, fs, max_lag_s):
    """b가 a보다 몇 초 늦은가 (+면 b가 늦음), 탐색 범위 ±max_lag_s"""
    a, b = a - a.mean(), b - b.mean()
    c = correlate(b, a, mode="full")
    lags = correlation_lags(b.size, a.size, mode="full")
    keep = np.abs(lags) <= max_lag_s * fs
    i = np.argmax(c[keep])
    return lags[keep][i] / fs, c[keep][i] / np.sqrt((a**2).sum() * (b**2).sum())

shank = impact_env(d[[32, 33, 34]].to_numpy())
waist = impact_env(d[[46, 47, 48]].to_numpy())
emg = sosfiltfilt(sos_lp, np.abs(d[28].to_numpy() - d[28].mean()))    # L-TA EMG 크기 덩어리
W = 30 * fs
print(" 구간(s)  허리-정강이 지연(ms)  r   | EMG-정강이 지연(ms)  r")
for s in range(0, len(shank) - W + 1, W):
    sl = slice(s, s + W)
    l1, r1 = best_lag(shank[sl], waist[sl], fs, 0.25)
    l2, r2 = best_lag(shank[sl], emg[sl], fs, 0.25)
    print(f"{s // fs:4d}–{(s + W) // fs:<4d}     {1000 * l1:+6.0f}          {r1:.2f} |   {1000 * l2:+6.0f}            {r2:.2f}")
```

실행 결과(환자 001, task_1):

```text
 구간(s)  허리-정강이 지연(ms)  r   | EMG-정강이 지연(ms)  r
   0–30          -18          0.34 |      -42            0.53
  30–60          +14          0.38 |     -100            0.30
  60–90           -8          0.63 |      -80            0.61
  90–120          -6          0.53 |      -94            0.53
 120–150         +82          0.43 |     +132            0.18
 150–180         -14          0.50 |      -84            0.63
 180–210          -8          0.65 |      -72            0.61
 210–240          -2          0.62 |      -54            0.59
 240–270          -4          0.51 |      -78            0.64
 270–300         -30          0.56 |     -152            0.48
 300–330         -10          0.49 |      +30            0.42
 330–360         -10          0.49 |      -64            0.58
```

**결과 읽기와 결정:**
- **허리-정강이:** 대부분의 구간에서 −30 ~ +14 ms에 머물고, 처음부터 끝까지 흘러가는 경향이 없습니다. 원본 시계가 말한 0.48초 어긋남은 데이터에 보이지 않습니다. 이 기록에서는 "행 번호가 같으면 같은 순간"이라는 저자들의 가정이 30 ms 정도의 정밀도 안에서 데이터와 맞고, 원본 시각 열이 오히려 믿기 어렵다고 해석합니다. 튀는 구간(120–150 s, +82 ms, r = 0.43)은 회전이나 FOG로 걸음이 흐트러진 구간일 수 있습니다.
- **EMG-정강이:** EMG 쪽이 대략 50–100 ms **먼저** 나옵니다. 그러나 근육은 발 디딤보다 먼저 수축하므로 이 값은 시계 차이와 생리적 시간차가 섞인 것이고, 둘을 나눌 공통 사건이 없습니다. EEG·EMG 장치와 IMU 사이의 시계 차이는 **검증하지 못했습니다.**
- **결정:** 어느 모달도 옮기지 않습니다. 보고서에는 "IMU 사이: 001 task_1에서 ±30 ms 안, 흐름 없음(확인). EEG/EMG-IMU 사이: 미검증, 원 정렬을 그대로 사용(가정)"이라고 적습니다. 이 가정 때문에 Day K3–K5의 결론은 수백 ms보다 짧은 모달 간 시간차에 기대지 않도록 설계합니다(2초 window 단위 비교). 다른 기록에서 같은 분석을 하면 허리가 양발의 충격을 모두 받아서 지연이 반 걸음(±0.5 s)씩 튀는 경우가 있습니다(예시 3의 함정). 그럴 때는 탐색 범위를 좁히고, 그래도 불안정하면 "추정 불가"로 적습니다.

**R3 — window 라벨 규칙이 실제 숫자를 얼마나 바꾸나.** 모든 기록에서 있는 쪽 정강이의 가속도 크기로 window별 freeze index를 구하고, 규칙마다 AUC를 계산합니다. 2초/1초(이 파트의 기본)와 3초/0.3초(논문 설정)를 비교합니다.

```python
import glob, os
import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score

DATA = "data/xuanwu/Filtered Data"
fs = 500
SHANK = {"L": [32, 33, 34], "R": [39, 40, 41]}

def window_starts(n, fs=500, win_s=2.0, step_s=1.0):
    w, s = int(win_s * fs), int(step_s * fs)
    return np.arange(0, n - w + 1, s)

recs = []                                          # (기록 이름, 있는 쪽 정강이 크기, 라벨)
for path in sorted(glob.glob(f"{DATA}/**/task_*.txt", recursive=True)):
    rec = os.path.dirname(os.path.relpath(path, DATA))          # 001 … 또는 008/OFF_1
    d = pd.read_csv(path, header=None, usecols=[60] + SHANK["L"] + SHANK["R"])
    side = "L" if (d[SHANK["L"]] != 0).any(axis=None) else "R"   # 있는 쪽 정강이
    recs.append((rec, np.linalg.norm(d[SHANK[side]].to_numpy(), axis=1), d[60].to_numpy()))

for win_s, step_s in [(2.0, 1.0), (3.0, 0.3)]:     # 이 Day의 기본값, 그리고 논문이 쓴 설정
    W = int(win_s * fs)
    f = np.fft.rfftfreq(W, 1 / fs)
    LOCO, FRZ = (f >= 0.5) & (f < 3), (f >= 3) & (f <= 8)
    parts = []
    for rec, mag, y in recs:
        st = window_starts(len(y), fs, win_s, step_s)
        seg = mag[st[:, None] + np.arange(W)]
        seg = seg - seg.mean(axis=1, keepdims=True)
        p = np.abs(np.fft.rfft(seg, axis=1)) ** 2
        lab = y[st[:, None] + np.arange(W)]
        parts.append(pd.DataFrame({"patient": rec[:3], "fi": p[:, FRZ].sum(1) / p[:, LOCO].sum(1),
                                   "frac": lab.mean(1), "center": lab[:, W // 2]}))
    win = pd.concat(parts, ignore_index=True)
    rules = {"majority (≥50%)": win["frac"] >= 0.5, "any (>0%)": win["frac"] > 0,
             "center": win["center"] == 1, "PFG ≥ 80%": win["frac"] >= 0.8}
    print(f"\n== {win_s:.0f}초 window, {step_s}초 이동: window {len(win)}개, "
          f"FOG가 일부만 걸친 window {100 * ((win.frac > 0) & (win.frac < 1)).mean():.1f}%")
    rows = []
    for name, y in rules.items():
        y = y.to_numpy()
        per = [roc_auc_score(y[g.index], g["fi"]) for _, g in win.groupby("patient") if 0 < y[g.index].mean() < 1]
        rows.append({"rule": name, "FOG window %": 100 * y.mean(), "AUC pooled": roc_auc_score(y, win["fi"]),
                     "AUC 환자별 중앙값": np.median(per), "환자 수": len(per)})
    print(pd.DataFrame(rows).round(3).to_string(index=False))
```

실행 결과(Mendeley v3 전체, 정강이 가속도 크기의 freeze index):

```text

== 2초 window, 1.0초 이동: window 12366개, FOG가 일부만 걸친 window 5.2%
           rule  FOG window %  AUC pooled  AUC 환자별 중앙값  환자 수
majority (≥50%)        45.609       0.849        0.871    11
      any (>0%)        45.609       0.849        0.871    11
         center        42.989       0.865        0.890    11
      PFG ≥ 80%        40.369       0.864        0.873    11

== 3초 window, 0.3초 이동: window 40884개, FOG가 일부만 걸친 window 14.6%
           rule  FOG window %  AUC pooled  AUC 환자별 중앙값  환자 수
majority (≥50%)        43.665       0.872        0.891    11
      any (>0%)        50.560       0.846        0.869    11
         center        43.335       0.874        0.892    11
      PFG ≥ 80%        38.785       0.884        0.884    11
```

**결과 읽기:**
- **2초/1초에서 majority와 any가 똑같습니다.** 우연이 아닙니다. 라벨이 1초 단위(K1)이고 window도 정수 초에서 시작하므로, 경계에 걸친 window는 언제나 정확히 FOG 1초 + 비FOG 1초, 즉 50%입니다. "≥50%"와 ">0%"가 같은 window를 고르게 됩니다. **라벨 해상도와 window 격자가 맞물리면 규칙 비교 자체가 의미를 잃는** 예입니다.
- **3초/0.3초에서는 규칙에 따라 FOG window 비율이 38.8%에서 50.6%까지, pooled AUC가 0.846에서 0.884까지 움직입니다.** 탐지기는 그대로인데 경계 window를 어느 편에 넣느냐만 바꾼 결과입니다. 경계 window를 빼는 쪽(PFG ≥ 80%)이 가장 좋아 보이는 것은 어려운 문제를 덜 풀었기 때문입니다.
- 이 표는 전체 데이터를 한 번에 본 **탐색적 비교**입니다. threshold를 고르지 않는 AUC라 누수는 없지만, FOG가 없는 005는 환자별 AUC를 정의할 수 없어 빠졌고(11명), FOG window 비율이 40–50%로 매우 높은 데이터라 일상 환경의 숫자와 비교할 수 없습니다. 환자 단위 검증은 Day K5에서 합니다.

**`reports/advanced/K/K2_sync_report.md`에 남길 것:** 모달별 원래 표본화율과 그 근거(문서 vs 파일), 업샘플·건너뛰기 처리 내역, 지연 추정 표와 "옮기지 않음" 결정, 앞으로 쓸 window 설정(2초, 1초 이동)과 라벨 규칙, 그리고 규칙 비교 표.

## 퀴즈

**1.** 라벨된 파일의 가속도가 500 Hz인데 원래 100 Hz였다는 것을 어떤 두 가지 방법으로 확인했습니까?

<details><summary>정답 보기</summary>

(1) 원본 IMU 파일의 시각 간격이 10 ms였습니다. (2) 라벨된 파일의 값이 5행마다 원본 정수값과 정확히 같았습니다(보간의 매듭). 덧붙여 50 Hz 위 power가 거의 0이라는 스펙트럼도 같은 결론을 지지합니다.

</details>

**2.** 1000 Hz EMG를 `x[::2]`로 500 Hz로 만들었습니다. 원래 신호의 320 Hz 성분은 어디에 나타납니까? 나중에 band-pass 필터로 없앨 수 있습니까?

<details><summary>정답 보기</summary>

500 − 320 = **180 Hz**에 나타납니다. 진짜 180 Hz 성분과 구별할 수 없으므로 내린 **뒤의** 필터로는 없앨 수 없습니다. 내리기 **전에** 저역 통과 필터를 거는 `decimate` 같은 방법을 써야 합니다.

</details>

**3.** 정강이 가속도와 전경골근 EMG의 cross-correlation에서 EMG가 80 ms 먼저 나왔습니다. "EMG 장치의 시계가 80 ms 빠르다"고 결론 내릴 수 있습니까?

<details><summary>정답 보기</summary>

**아니요.** 두 신호는 같은 물리 사건이 아닙니다. 전경골근은 발 디딤 전에 활동하므로 80 ms에는 생리적 시간차가 섞여 있고, 시계 차이와 분리할 수 없습니다. 이런 지연은 보고만 하고 데이터를 옮기지 않습니다.

</details>

**4.** 걸음이 매우 규칙적인 구간에서 cross-correlation 지연 추정이 0.12 s, −0.88 s, 1.12 s 사이를 오갔습니다. 무엇이 문제이고 어떻게 대처합니까?

<details><summary>정답 보기</summary>

주기 신호라서 한 걸음 주기(약 1 s)만큼 떨어진 지연에서도 상관이 거의 같아 답이 여러 개입니다. 탐색 범위를 반 주기보다 좁히거나, 일어서기·회전처럼 불규칙한 사건이 있는 구간을 쓰고, 그래도 불안정하면 "추정 불가"로 보고합니다.

</details>

**5.** 실제 데이터의 2초/1초 window에서 majority 규칙과 any 규칙의 결과가 완전히 같았습니다. 왜 그렇습니까?

<details><summary>정답 보기</summary>

라벨이 **1초 단위**로 붙어 있고 window가 정수 초에서 시작해 2초 길이이므로, 경계에 걸친 window는 항상 FOG가 정확히 50%입니다. 그래서 "≥50%"와 ">0%"가 같은 window를 고릅니다. 규칙의 영향을 보려면 라벨 해상도와 맞물리지 않는 격자(예: 0.3초 이동)에서 비교해야 합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/advanced/K/K2_sampling_sync.ipynb`: 예시 1–4와 직접 해보기 1–5 실행.
- [ ] (선택) 실제 데이터 R1–R3 실행, 출력이 위와 같은지 확인.
- [ ] `reports/advanced/K/K2_sync_report.md`: 모달별 원래 표본화율 표(문서별 주장 vs 파일 확인), 지연 추정 표와 "옮기지 않음" 결정문, window 설정과 라벨 규칙, 규칙 비교 표.
- [ ] `window_starts`, `window_label`을 이후 Day에서 다시 쓸 수 있게 노트북 맨 위 셀(또는 작은 `.py` 파일)에 정리.

## 더 읽을거리
- Zhang W, Yang Z, Li H, et al. Multimodal Data for the Detection of Freezing of Gait in Parkinson's Disease. *Sci Data*. 2022;9:606. doi:[10.1038/s41597-022-01713-8](https://doi.org/10.1038/s41597-022-01713-8) — Methods의 데이터 전처리(정렬 규칙, 재표본화), Technical Validation의 window·PFG 정의
- 저자 처리 코드: <https://github.com/AccSrd/multimodal-Parkinson-data-processing> — `Scripts/raw2prep.py`(가속도 5배 spline, EEG/EMG 한 행 건너뛰기), `Scripts/function.py`(`spline`)
- SciPy 문서: `scipy.signal.decimate`, `scipy.signal.correlate`, `scipy.signal.correlation_lags` (<https://docs.scipy.org/doc/scipy/reference/signal.html>)
- 이론 노트: [T09 — 신호처리의 이론](../I-gait-theory/note-T09.md)

---
[← 이전](day-K1.md) · [코스 지도](../../../README.md) · [다음 →](day-K3.md)
