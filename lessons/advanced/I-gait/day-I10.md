# Day I10 — 신호처리 I: 표본화, 미분과 잡음, cutoff를 residual로 고르기

> **주차:** 심화 파트 I — 보행분석 (2주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I10_filtering.ipynb`
>
> **먼저 끝내 둘 레슨:** [Day 23 — 시계열 기초](../../week-4/day-23.md)(sampling rate, aliasing, band-pass), [Day C2 — convolution과 필터 설계](../C-neural-signals/day-C2.md)(`filtfilt`와 위상 지연), [Day I3](day-I3.md)(WinterTableA1 마커 좌표). 선택: [Day C3 — Fourier 변환과 power spectrum](../C-neural-signals/day-C3.md)
>
> **이론 노트:** [T09 — 신호처리의 이론](../I-gait-theory/note-T09.md) — 표본화 정리, Butterworth 설계, 통과 횟수 보정의 유도, residual analysis의 가정을 깊게 다룹니다.

## 오늘의 목표
- 미분이 고주파 잡음을 키우는 이유(속도에서 n배, 가속도에서 n²배)를 설명하고, 필터 전후로 가속도 오차를 비교해 보일 수 있다.
- 앞뒤(dual-pass) Butterworth 필터의 실제 −3 dB 지점이 설계값보다 낮아진다는 것을 확인하고, 0.802 보정을 적용할 수 있다.
- WinterTableA1 마커에 residual analysis를 적용해 **좌표마다 다른** cutoff를 얻고, autocorrelation으로 gaitpdb 보행 신호의 stride time을 추정할 수 있다.

## 🎬 영상으로 먼저 보기

- [Sampling, Aliasing & Nyquist Theorem — 0612 TV w/ NERDfirst](https://www.youtube.com/watch?v=yWqrx08UeUs) (10:47)
- **무엇에 주목할까:** 너무 드물게 찍은 점들을 이으면 원래와 전혀 다른 느린 파동이 나타나는 장면을 보세요. 이 가짜 파동은 찍고 난 뒤에는 진짜와 구별할 수 없습니다. Day 23에서 본 내용을 다시 확인하는 영상입니다.

- [Biomechanics of Movement | Lecture 7.6: Inverse Kinematics: Filtering & Differentiating Motion Data — Biomechanics of Movement](https://www.youtube.com/watch?v=bGltq_nHEZ0) (3:57)
- **무엇에 주목할까:** 위치 곡선에서는 거의 안 보이던 잡음이 속도, 가속도로 갈수록 커지는 그림에 주목하세요. 오늘 예시 2가 같은 현상을 숫자로 보입니다.

## 개념 설명

### 복습: 표본화와 aliasing은 "찍기 전에" 정해진다

Day 23에서 본 것처럼, 신호에 들어 있는 가장 높은 주파수의 2배보다 빠르게 표본을 떠야 합니다([Wi] 2.2.4.2 p.23). 이 규칙을 어기면 빠른 성분이 사라지기만 하는 것이 아니라 느린 가짜 성분으로 **접혀 들어옵니다**(aliasing). 예를 들어 45 Hz로 떨리는 진동을 50 Hz로 찍으면 |45 − 50| = 5 Hz짜리 느린 흔들림처럼 보입니다. 이렇게 접힌 성분은 진짜 5 Hz 성분과 구별할 수 없으므로, 표본화 **뒤의** 디지털 필터로는 없앨 수 없고 표본화 **전의** 아날로그 필터(anti-aliasing)로 막아야 합니다([BMC] `signal_basic_properties`). 저장소의 aliasing 시각화(웹사이트의 이 레슨 페이지에 들어 있음)로 직접 돌려 보세요.

보행 운동학은 다행히 느린 신호입니다. 걷기 마커 신호의 힘(power) 대부분이 6 Hz 아래에 있어서([Wi] 2.2 p.27), 초당 수십 frame이면 표본화 정리를 넉넉히 만족합니다. 실무에서는 봉우리의 크기와 시점을 놓치지 않도록 최고 주파수의 5–10배로 뜨라고 권합니다([RM] 12장 p.282). 참고로 [RM]은 "Nyquist"라는 말을 "필요한 최소 표본화율"이라는 뜻으로 쓰는데, 대부분의 신호처리 문서와 scipy에서 Nyquist 주파수는 **표본화율의 절반 fs/2**입니다. 이 레슨은 후자로 씁니다.

스펙트럼(FFT) 읽는 법은 [Day C3](../C-neural-signals/day-C3.md)에서 자세히 다뤘으니, 오늘은 "보행 신호의 가장 센 성분은 stride 주파수(약 1 Hz)와 그 정수배"라는 점만 기억합니다([Wi] 3.5.2 p.53).

### 미분은 잡음을 키운다: n배, n²배

카메라는 마커의 **위치**를 잽니다. 속도는 위치를 한 번, 가속도는 두 번 미분해서 얻습니다. 신호를 사인파의 합으로 생각하면 이유가 바로 보입니다. n번째 조화파(기본 주파수의 n배) 성분은 미분할 때마다 진폭에 n(정확히는 2πnf₀)이 곱해집니다. 그래서 **속도에서는 n배, 가속도에서는 n²배** 커집니다([Wi] 3.5.3 p.54). 위치에서 1% 밖에 안 되던 20번째 조화파 잡음이 가속도에서는 신호의 4배가 됩니다. 조용한 방의 속삭임이 확성기를 두 번 거치면 대화를 덮는 것과 같습니다.

숫자로 미분할 때는 앞뒤 표본을 쓰는 **중앙차분**을 씁니다. 속도 vᵢ = (xᵢ₊₁ − xᵢ₋₁)/(2Δt), 가속도 aᵢ = (xᵢ₊₁ − 2xᵢ + xᵢ₋₁)/Δt²입니다([RM] 1장 p.20, [Wi] 3.6 p.64). 첫 점과 끝 점에는 앞뒤 표본이 없어서 값이 부정확하므로, 실험에서는 관심 구간 앞뒤로 여유 frame을 더 기록합니다([RM] 1장 p.21). 거친 좌표를 그대로 두 번 미분하면 가속도는 잡음에 묻히고, 필터로 먼저 매끄럽게 한 뒤 미분해야 가속도계로 직접 잰 값과 맞는다는 고전적 비교가 있습니다(Pezzack 1977, [RM] 1장 pp.28–29에 소개).

### 앞뒤 Butterworth 필터와 0.802 보정

**Butterworth 저역통과(low-pass) 필터**는 통과대역이 가장 평평한 필터라 운동학 자료에 흔히 씁니다. cutoff(차단 주파수) fc는 진폭이 1/√2 ≈ 0.707배(파워 절반, −3 dB)가 되는 주파수입니다. Day C2에서 본 것처럼 한 방향으로만 거르면 출력이 늦어지므로, 오프라인 분석에서는 앞으로 한 번, 뒤로 한 번 거르는 **dual-pass(zero-lag)** 필터(`filtfilt`)를 씁니다([Wi] 3.5.4.2 pp.56–57).

여기서 Day C2에서 다루지 않은 함정이 하나 있습니다. 필터를 두 번 통과하면 진폭 응답이 **제곱**됩니다. 설계한 fc에서 0.707이던 이득이 0.707² = 0.5가 되어, 실제 −3 dB 지점이 설계값보다 낮아집니다. 2차 Butterworth를 두 번 통과할 때 이를 바로잡는 보정계수는 C = (2^(1/2) − 1)^(1/4) ≈ **0.802**이고, 한 번 통과용 필터를 fc/C 근처로 설계하면 됩니다([Wi] 3.5.4.2 p.56). 따라서 논문의 "6 Hz로 filtfilt했다"는 문장은 보정을 했는지에 따라 실제로 약 4.9 Hz 필터일 수도 있습니다(예시 1). 방법 절에는 **필터 종류, 차수, cutoff, 통과 횟수, 보정 여부**를 함께 적습니다.

⚠️ 교재의 필터 계수 식을 그대로 코드로 옮기지 마세요. [RM] 12장의 2차 Butterworth 계수 식(p.289)에는 인쇄 오류가 두 군데 있고, p.287에는 low-pass 설명이 반대로 적힌 문장이 있습니다. 이 과정은 `scipy.signal.butter`로 계수를 만들고, 직접 구현했다면 DC 이득이 1인지 확인합니다.

### cutoff는 어떻게 고르나: residual analysis

cutoff가 너무 높으면 잡음이 남고, 너무 낮으면 진짜 움직임이 깎입니다. Winter가 제안한 **residual analysis**는 이 둘 사이의 타협점을 찾는 절차입니다([Wi] 3.5.4.3 pp.57–59).

1. 여러 cutoff 후보로 걸러 보고, 각 cutoff마다 원자료와 거른 자료의 차이(residual)를 RMS로 계산합니다: R(fc) = √[(1/N)·Σ(xᵢ − x̂ᵢ)²].
2. R을 fc에 대해 그립니다. 높은 cutoff 쪽에서는 거의 잡음만 걸러지므로 곡선이 **거의 직선**입니다. 낮은 쪽에서는 신호까지 깎이므로 그 직선 위로 솟습니다.
3. 높은 쪽 직선 부분에 회귀선을 맞춰 0 Hz까지 늘이면, 그 **절편이 잡음 크기의 추정값**입니다.
4. 절편 높이에서 수평선을 그어 residual 곡선과 만나는 주파수를 cutoff로 고릅니다. 이 점에서 "깎이는 신호 ≈ 통과하는 잡음"입니다.

중요한 점은 이 방법이 **좌표마다 다른 답**을 준다는 것입니다. 빨리 움직이는 발 마커와 천천히 움직이는 몸통 마커는 신호가 담긴 대역이 다릅니다. [Wi]의 예에서도 발 쪽 마커는 약 6 Hz, 몸통·골반의 수직 변위는 약 3 Hz까지 신호가 있었습니다(p.59). 같은 WinterTableA1을 분석한 BMC `residual_analysis` 노트북의 정답표도 좌표별로 약 2.9–7.3 Hz로 갈립니다. 그러니 "이 자료의 cutoff는 6 Hz"처럼 하나로 말할 수 없고, **공통 cutoff를 쓸지, 좌표마다 다르게 쓸지**가 분석자의 결정 과제입니다. 또 이 기준은 **위치**에 대한 것이어서, 속도·가속도까지 구할 때의 최적 cutoff는 다를 수 있습니다([Wi] 3.5.4.4 pp.59–60). 꼬리 직선을 어느 구간에 맞추느냐에 따라서도 답이 달라지므로, 그 구간을 함께 보고합니다.

### autocorrelation: 신호가 자기 자신과 다시 닮는 지연

**autocorrelation(자기상관)** 은 신호를 τ만큼 밀어 원래 신호와 겹쳤을 때 얼마나 닮았는지를 τ의 함수로 그린 것입니다([Wi] 2.1 pp.8–18). τ = 0에서 항상 1이고, 주기 신호라면 **한 주기만큼 밀었을 때** 다시 봉우리가 섭니다. 평균을 먼저 빼야 합니다(빼지 않으면 모든 τ에서 상관이 부풀려집니다, [Wi] p.15). 한쪽 발의 힘 신호라면 첫 봉우리의 지연이 **stride time**, 양발 합 신호라면 **step time**입니다. 사건 하나하나를 찾지 않고 기록 전체의 평균 리듬을 한 번에 얻는 방법이라, 사건 검출(Day I12) 결과를 검산하는 데 좋습니다.

## 예시로 이해하기

> 예시 1·2는 **가상 신호**입니다. 예시 3·4는 실제 공개 데이터를 씁니다.
>
> **데이터 준비.** ① `WinterTableA1.txt`: BMC 저장소의 `data/` 폴더에 있습니다([파일 보기](https://github.com/BMClab/BMC/blob/master/data/WinterTableA1.txt), 내용 CC BY 4.0). 원전은 Winter 교재 부록 Table A.1(오른쪽 시상면 마커 좌표, 단위 cm)입니다. 내려받아 `data/bmc/`에 둡니다. 머리글 2줄, 106 frame × 18열(FRAME, TIME, 마커 8개의 X·Y). ② gaitpdb: Hausdorff JM. *Gait in Parkinson's Disease* (v1.0.0). PhysioNet; 2008. [doi:10.13026/C24H3N](https://doi.org/10.13026/C24H3N), 라이선스 ODC-By 1.0. [Day 24](../../week-4/day-24.md)에서 받은 `GaCo01_01.txt`를 `data/gaitpdb/`에 둡니다(19열, 18·19열 = 왼발·오른발 총 힘, 100 Hz).

### 예시 1 — 앞뒤로 거르면 cutoff가 내려간다

```python
import numpy as np
from scipy import signal

fs = 70.0                                   # Winter 자료와 비슷한 표본화 주파수
b, a = signal.butter(2, 6, fs=fs)           # 2차 Butterworth, cutoff 6 Hz
w, h1 = signal.freqz(b, a, worN=[6.0], fs=fs)
print(f"한 번 통과(lfilter)  : 6 Hz에서 이득 {abs(h1[0]):.3f}")
print(f"앞뒤 통과(filtfilt)  : 6 Hz에서 이득 {abs(h1[0])**2:.3f}  (제곱이 된다)")

# 앞뒤 통과에서 이득이 0.707이 되는 실제 주파수 찾기
f = np.linspace(0.1, 20, 2000)
_, h = signal.freqz(b, a, worN=f, fs=fs)
f3 = f[np.argmin(abs(abs(h) ** 2 - 2 ** -0.5))]
print(f"보정 없이 filtfilt 하면 -3 dB 지점은 {f3:.2f} Hz")

C = (2 ** 0.5 - 1) ** 0.25
f_design = fs / np.pi * np.arctan(np.tan(np.pi * 6 / fs) / C)
b2, a2 = signal.butter(2, f_design, fs=fs)
_, h2 = signal.freqz(b2, a2, worN=[6.0], fs=fs)
print(f"보정계수 C = {C:.3f}, 설계 cutoff = {f_design:.2f} Hz (단순 근사 6/C = {6/C:.2f} Hz)")
print(f"보정 후 filtfilt: 6 Hz에서 이득 {abs(h2[0])**2:.3f}")
```

실행 결과:

```text
한 번 통과(lfilter)  : 6 Hz에서 이득 0.707
앞뒤 통과(filtfilt)  : 6 Hz에서 이득 0.500  (제곱이 된다)
보정 없이 filtfilt 하면 -3 dB 지점은 4.86 Hz
보정계수 C = 0.802, 설계 cutoff = 7.38 Hz (단순 근사 6/C = 7.48 Hz)
보정 후 filtfilt: 6 Hz에서 이득 0.707
```

`f_design` 식은 디지털 필터의 주파수 축 왜곡(bilinear 변환)까지 고려한 정확한 보정이고, `6/C`는 흔히 쓰는 근사입니다. fs에 비해 cutoff가 낮으면 둘의 차이는 작습니다. 어느 쪽을 썼는지 적어 둡니다.

### 예시 2 — 필터 없이 미분하면 가속도는 잡음이다

```python
import numpy as np
from scipy import signal

rng = np.random.default_rng(10)
fs = 70.0
t = np.arange(0, 3, 1 / fs)
# 가상 마커 수직 위치(cm): stride 1 Hz의 1·2·3번째 조화파의 합
A = [(1, 3.0), (2, 1.5), (3, 0.6)]
true_y = sum(amp * np.sin(2 * np.pi * f * t) for f, amp in A)
true_acc = sum(-amp * (2 * np.pi * f) ** 2 * np.sin(2 * np.pi * f * t) for f, amp in A)
y = true_y + rng.normal(0, 0.2, len(t))          # 측정 잡음 SD 0.2 cm

def acc_central(x, fs):
    a = np.full_like(x, np.nan)
    a[1:-1] = (x[2:] - 2 * x[1:-1] + x[:-2]) * fs ** 2   # 2차 중앙차분
    return a

C = (2 ** 0.5 - 1) ** 0.25
def lowpass(x, fc, fs):
    f_design = fs / np.pi * np.arctan(np.tan(np.pi * fc / fs) / C)
    b, a = signal.butter(2, f_design, fs=fs)
    return signal.filtfilt(b, a, x)

inner = slice(10, -10)                            # 양 끝(필터·차분 가장자리)은 빼고 비교
def rms(e): return np.sqrt(np.nanmean(e[inner] ** 2))
print(f"위치 오차 rms        : {rms(y - true_y):7.2f} cm")
print(f"참 가속도 rms        : {rms(true_acc):7.1f} cm/s²")
print(f"필터 없이 미분한 오차 : {rms(acc_central(y, fs) - true_acc):7.1f} cm/s²")
for fc in [4, 6, 10]:
    print(f"{fc:2d} Hz로 거른 뒤 오차 : {rms(acc_central(lowpass(y, fc, fs), fs) - true_acc):7.1f} cm/s²")
```

실행 결과:

```text
위치 오차 rms        :    0.20 cm
참 가속도 rms        :   218.8 cm/s²
필터 없이 미분한 오차 :  2247.3 cm/s²
 4 Hz로 거른 뒤 오차 :    38.4 cm/s²
 6 Hz로 거른 뒤 오차 :    85.1 cm/s²
10 Hz로 거른 뒤 오차 :   249.0 cm/s²
```

위치에서는 겨우 0.2 cm인 잡음이, 필터 없이 두 번 미분하면 **참 가속도의 10배**짜리 오차가 됩니다. 이 가상 신호는 3 Hz까지만 신호가 있으므로 4 Hz 필터가 가장 좋고, "보행은 6 Hz"라는 관례값은 여기서 최선이 아닙니다. 10 Hz는 잡음을 너무 많이 남깁니다. **cutoff는 자료의 신호 대역에 맞춰 골라야 한다**는 것이 다음 예시의 동기입니다.

### 예시 3 — WinterTableA1의 residual analysis: 좌표마다 답이 다르다

```python
import numpy as np
from scipy import signal

d = np.loadtxt("data/bmc/WinterTableA1.txt", skiprows=2)   # 머리글 2줄 건너뛰기
t = d[:, 1]                                                # 2열 = 시간(s)
fs = (len(t) - 1) / (t[-1] - t[0])
names = ["RIB", "HIP", "KNEE", "FIBULA", "ANKLE", "HEEL", "MT5", "TOE"]
print(f"frame {len(t)}개, fs = {fs:.2f} Hz")

C = (2 ** 0.5 - 1) ** 0.25                 # 앞뒤 두 번 통과 보정계수 0.802
def lowpass(x, fc):
    f_design = fs / np.pi * np.arctan(np.tan(np.pi * fc / fs) / C)
    b, a = signal.butter(2, f_design, fs=fs)
    return signal.filtfilt(b, a, x)

fcs = np.arange(0.5, 28.01, 0.1)           # cutoff 후보(Hz)
def winter_cutoff(x, tail):
    R = np.array([np.sqrt(np.mean((x - lowpass(x, fc)) ** 2)) for fc in fcs])  # RMS residual
    m = (fcs >= tail[0]) & (fcs <= tail[1])
    slope, icpt = np.polyfit(fcs[m], R[m], 1)     # 꼬리 직선의 0 Hz 절편 = 잡음 rms 추정
    return fcs[np.argmax(R <= icpt)], icpt        # residual이 처음 절편 높이로 내려오는 cutoff

print("마커    축  cutoff(꼬리 10–20 Hz)  cutoff(꼬리 15–28 Hz)  잡음 rms(cm)")
allfc = []
for k, nm in enumerate(names):
    for j, ax in enumerate("xy"):               # x = 진행 방향, y = 수직
        x = d[:, 2 + 2 * k + j]
        fc1, noise = winter_cutoff(x, (10, 20))
        fc2, _ = winter_cutoff(x, (15, 28))
        allfc.append(fc1)
        print(f"{nm:7s} {ax}        {fc1:4.1f}                  {fc2:4.1f}              {noise:.2f}")
print(f"꼬리 10–20 Hz 기준 범위 {min(allfc):.1f}–{max(allfc):.1f} Hz, 중앙값 {np.median(allfc):.1f} Hz")
```

실행 결과:

```text
frame 106개, fs = 69.95 Hz
마커    축  cutoff(꼬리 10–20 Hz)  cutoff(꼬리 15–28 Hz)  잡음 rms(cm)
RIB     x         6.1                   6.0              0.17
RIB     y         4.1                   4.0              0.20
HIP     x         5.9                   7.5              0.19
HIP     y         4.8                   4.6              0.23
KNEE    x         7.3                   8.0              0.20
KNEE    y         5.5                   4.7              0.24
FIBULA  x         6.9                   7.7              0.17
FIBULA  y         5.4                   4.1              0.26
ANKLE   x         6.9                   8.0              0.19
ANKLE   y         6.0                   5.5              0.25
HEEL    x         6.5                   6.4              0.23
HEEL    y         6.4                   6.5              0.25
MT5     x         6.8                   6.8              0.22
MT5     y         6.8                   6.4              0.22
TOE     x         7.4                   8.8              0.26
TOE     y         6.4                   6.2              0.26
꼬리 10–20 Hz 기준 범위 4.1–7.4 Hz, 중앙값 6.4 Hz
```

읽는 법:

- **좌표마다 cutoff가 다릅니다.** 몸통(RIB)과 골반(HIP)의 수직 성분은 4–5 Hz, 발 쪽(HEEL, MT5, TOE)은 6–7 Hz 남짓입니다. 천천히 움직이는 마커일수록 낮게 나온다는 Winter의 관찰(p.59)과 같은 방향입니다. 꼬리 10–20 Hz 기준으로 전체 범위는 4.1–7.4 Hz입니다.
- **꼬리 구간을 바꾸면 답이 바뀝니다.** HIP x는 5.9 → 7.5 Hz, FIBULA y는 5.4 → 4.1 Hz로 움직입니다. 같은 자료를 BMC 노트북의 자동 탐색과 근사 보정으로 분석하면 좌표별로 약 2.9–7.3 Hz가 나옵니다. 숫자가 조금씩 다른 것은 구현의 차이이고, "좌표마다 다르고 선택에 민감하다"는 결론은 같습니다.
- **잡음 rms 추정값은 0.2 cm 안팎**으로 좌표 사이에 비슷합니다. 측정 시스템의 잡음 수준이라는 해석과 맞습니다.

### 예시 4 — autocorrelation으로 stride time 찾기 (gaitpdb)

```python
import numpy as np
from scipy.signal import find_peaks

fs = 100                                          # gaitpdb 표본화 주파수(format.txt)
d = np.loadtxt("data/gaitpdb/GaCo01_01.txt")      # 머리글 없음, 탭 구분 19열
left = d[:, 17]                                   # 18번째 열 = 왼발 총 힘(N)
both = d[:, 17] + d[:, 18]                        # 18 + 19번째 열 = 양발 합
seg = slice(10 * fs, 70 * fs)                     # 10–70초 구간(걷기 시작 부분 제외)

def autocorr(x):
    x = x - x.mean()                              # 평균을 빼지 않으면 모든 지연에서 상관이 부풀려진다
    r = np.correlate(x, x, mode="full")[len(x) - 1:]
    return r / r[0]                               # 지연 0에서 1

for name, x in [("왼발", left[seg]), ("양발 합", both[seg])]:
    r = autocorr(x)
    pk, _ = find_peaks(r[: 3 * fs], height=0.2)   # 3초 안의 봉우리들
    print(f"{name:5s}: 봉우리 지연(s) {np.round(pk / fs, 2)}  상관 {np.round(r[pk], 2)}")
    if name == "왼발":
        stride_ac = pk[0] / fs

# 비교 1: 20 N 문턱으로 찾은 왼발 heel strike 간격(= stride time)의 중앙값
x = left[seg]
on = x > 20
hs = np.where(~on[:-1] & on[1:])[0] + 1
print(f"문턱 방법 stride time 중앙값: {np.median(np.diff(hs)) / fs:.2f} s (간격 {len(hs) - 1}개)")

# 비교 2: 같은 신호의 스펙트럼에서 가장 센 성분
X = np.abs(np.fft.rfft(x - x.mean()))
f = np.fft.rfftfreq(len(x), 1 / fs)
print(f"스펙트럼 최대 성분 {f[np.argmax(X)]:.2f} Hz ↔ 1 / (autocorrelation stride) = {1 / stride_ac:.2f} Hz")
```

실행 결과:

```text
왼발   : 봉우리 지연(s) [1.24 2.47]  상관 [0.94 0.89]
양발 합 : 봉우리 지연(s) [0.62 1.23 1.85 2.45]  상관 [0.61 0.71 0.4  0.51]
문턱 방법 stride time 중앙값: 1.24 s (간격 47개)
스펙트럼 최대 성분 0.82 Hz ↔ 1 / (autocorrelation stride) = 0.81 Hz
```

세 방법(autocorrelation, 문턱, 스펙트럼)이 같은 리듬을 가리킵니다. 왼발 신호의 첫 봉우리는 1.24 s(stride), 양발 합 신호의 첫 봉우리는 0.62 s(step)입니다. 그런데 양발 합에서는 **1.23 s 봉우리(0.71)가 0.62 s 봉우리(0.61)보다 높습니다.** 왼발과 오른발의 힘 모양이 조금 달라서, 반 주기 밀었을 때보다 한 주기 밀었을 때 더 잘 겹치기 때문입니다. "가장 높은 봉우리"가 아니라 "첫 봉우리"를 읽어야 하고, 첫 봉우리가 상대적으로 낮다는 것 자체가 좌우 차이의 단서가 됩니다. 이 데이터는 한 참가자의 기록이므로 일반화하지 않습니다.

## 직접 해보기

1. `notebooks/advanced/I/I10_filtering.ipynb`를 만들고 예시 1–4를 실행합니다.
2. **residual 곡선 그리기.** 예시 3에서 HEEL y와 RIB y 두 좌표의 residual 곡선(가로 cutoff, 세로 R)을 한 그림에 그리고, 꼬리 직선과 절편 수평선, 고른 cutoff를 표시합니다. `figures/advanced/I/I10_residual.png`로 저장합니다.
3. **공통 cutoff 결정 과제.** 예시 3의 표를 보고 (a) 모든 좌표에 하나의 cutoff를 쓴다면 몇 Hz로 할지와 그 이유, (b) 좌표마다 다르게 쓴다면 무엇이 좋아지고 무엇이 복잡해지는지(예: 관절각은 두 마커의 차이로 계산됨)를 노트북에 5줄 이내로 적습니다. 정답은 없습니다. 근거를 적는 것이 과제입니다.
4. **실제 마커로 미분 비교.** HEEL y 좌표를 (a) 필터 없이, (b) 그 좌표의 residual cutoff로 거른 뒤 예시 2의 `acc_central`로 두 번 미분합니다. 두 가속도 곡선을 겹쳐 그리고 최댓값(cm/s² → m/s²)을 비교합니다. 단위 변환(÷100)을 잊지 마세요.
5. 예시 4에서 구간을 `slice(70 * fs, 110 * fs)`로 바꿔도 stride time이 비슷한지 확인합니다. 오른발(19열)로도 해 봅니다.
6. (선택) 예시 2의 잡음 SD를 0.05와 0.5 cm로 바꿔 가장 좋은 cutoff가 어떻게 움직이는지 봅니다. "잡음이 클수록 cutoff를 낮춰야 한다"가 residual analysis의 핵심 쓰임입니다.

> ⚠️ **흔한 오류 1:** `signal.butter(2, 6)`처럼 `fs`를 빼면 6이 Nyquist 대비 비율로 해석되어 오류가 나거나 엉뚱한 필터가 됩니다. 항상 `fs=fs`를 함께 씁니다(Day C2와 같은 함정).
>
> ⚠️ **흔한 오류 2:** WinterTableA1에는 단위가 적혀 있지 않습니다. 원전 기준 cm이므로 m/s²로 보고하려면 100으로 나눕니다. 시간 열에서 fs를 계산할 때도 (frame 수 − 1) / (마지막 시각 − 첫 시각)입니다(frame 수 / 시간이 아님).

## 퀴즈

**1.** 위치 신호에 들어 있는 10번째 조화파 잡음의 상대 크기가 1%라면, 가속도에서는 대략 몇 %가 되나요?

<details><summary>정답 보기</summary>

약 **100%** (1% × 10²). n번째 조화파는 속도에서 n배, 가속도에서 n²배가 되므로, 위치에서 거의 안 보이던 잡음이 가속도에서는 신호만큼 커집니다.

</details>

**2.** 2차 Butterworth를 cutoff 6 Hz로 설계해 `filtfilt`로 보정 없이 걸렀다. 6 Hz 성분의 진폭은 몇 배로 남는가? 실제 −3 dB 지점은 6 Hz보다 높은가 낮은가?

<details><summary>정답 보기</summary>

**0.5배**(0.707²)이고, 실제 −3 dB 지점은 **낮습니다**(예시 1에서 약 4.9 Hz). 두 번 통과하면 진폭 응답이 제곱되기 때문입니다. 설계 cutoff를 약 fc/0.802로 올리면 바로잡힙니다.

</details>

**3.** residual analysis에서 높은 cutoff 쪽 직선을 0 Hz까지 늘인 절편은 무엇을 뜻하나요?

<details><summary>정답 보기</summary>

**잡음의 RMS 추정값**입니다. 0 Hz 필터의 출력은 평균값뿐이므로, 잡음만 있다면 그때의 residual이 잡음의 RMS가 됩니다. 그 높이에서 residual 곡선과 만나는 cutoff를 고릅니다.

</details>

**4.** "WinterTableA1의 cutoff는 6 Hz다"라는 문장의 문제는?

<details><summary>정답 보기</summary>

cutoff는 좌표마다 다르게 나옵니다(예시 3에서 약 4–7 Hz, 몸통·골반 수직은 낮고 발은 높음). 또 꼬리 구간 선택에 따라 값이 바뀝니다. 하나로 쓰려면 그것이 "결정"이었음을 밝히고, 좌표별 결과와 선택 근거를 함께 보고해야 합니다.

</details>

**5.** 양발 합 VGRF의 autocorrelation에서 첫 봉우리(0.62 s)보다 두 번째 봉우리(1.23 s)가 더 높았다. 무엇을 시사하나요?

<details><summary>정답 보기</summary>

반 주기(step) 밀었을 때보다 한 주기(stride) 밀었을 때 더 잘 겹친다는 것, 즉 **왼발과 오른발의 신호 모양이 다르다**는(좌우 비대칭) 단서입니다. 완전히 대칭이면 step 지연의 봉우리도 stride 지연만큼 높아야 합니다. 주기를 읽을 때는 가장 높은 봉우리가 아니라 첫 봉우리를 봅니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–4를 실행해 출력이 같음을 확인했다(데이터 출처·라이선스를 노트북 맨 위에 적었다).
- [ ] `figures/advanced/I/I10_residual.png`에 두 좌표의 residual 곡선, 꼬리 직선, 고른 cutoff를 표시했다.
- [ ] 공통 cutoff 결정 과제에 근거를 5줄 이내로 적었다.
- [ ] HEEL y의 필터 전후 가속도 최댓값을 m/s²로 비교했다.
- [ ] 다른 구간·오른발로 autocorrelation stride time을 확인했다.

## 더 읽을거리
- Thomas SJ, Zeni JA, Winter DA. *Winter's Biomechanics and Motor Control of Human Movement*. 5th ed. Wiley; 2023 — 2.1절(pp.8–18, 상관), 2.2절(pp.19–29, 주파수 분석·표본화), 3.5절(pp.52–61, 잡음·미분·dual-pass·residual analysis).
- Robertson DGE, Caldwell GE, Hamill J, Kamen G, Whittlesey SN. *Research Methods in Biomechanics*. 2nd ed. Human Kinetics; 2014 — 1장 pp.19–22, 28–29(수치 미분과 잡음, Pezzack 비교), 12장 Signal Processing(pp.279–290; p.289 계수 식과 p.287 문장은 위 주의 참고).
- Duarte M, Watanabe RN. *Notes on Scientific Computing for Biomechanics and Motor Control* (v0.2.0, CC BY 4.0). [doi:10.5281/zenodo.23654869](https://doi.org/10.5281/zenodo.23654869) — `signal_basic_properties`, `fourier_transform`, `data_filtering`, `residual_analysis`.
- 인터랙티브 시각화: 학습 웹사이트의 이 레슨 페이지에 "표본화 속도와 aliasing", "필터: 시간 파형·power spectrum·위상 지연" 두 개가 들어 있습니다(저장소에서는 `viz/` 폴더의 HTML 파일).

---
[← 이전](day-I9.md) · [코스 지도](../../../README.md) · [다음 →](day-I11.md)
