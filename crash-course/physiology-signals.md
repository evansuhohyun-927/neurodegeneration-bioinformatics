# Crash Course — 생리 신호 분석

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** ECG·EEG·EMG·가속도계·보행·호흡 같은 연속 생리 신호를 받아 "전처리 → 구간 나누기 → feature → 참가자 단위 통계"까지의 순서를 잡고, 가장 흔한 실수(반복 측정을 독립 표본으로 세기, 데이터 누수)를 피한다.

## 한눈에 보기

| 항목 | 내용 |
|---|---|
| 무엇을 측정하는가 | 시간에 따라 연속으로 변하는 몸의 전기·기계 신호. 심장 전기 활동(ECG), 뇌파(EEG), 근전도(EMG), 몸의 가속도·각속도(IMU), 발바닥이 받는 힘(지면반력), 호흡, 혈압, 맥파(PPG) |
| 어떤 질문에 답하는가 | 두 군 사이에 신호 특성(리듬, 변동성, 주파수 성분)이 다른가 / 과제·자세·약물 전후로 한 사람 안에서 변하는가 / feature로 상태를 얼마나 구분할 수 있는가 |
| 답하지 못하는 것 | 분자·세포 수준의 원인, 인과 관계(관찰 연구일 때), 개인에 대한 진단. 작은 공개 데이터에서 얻은 차이는 가설이지 결론이 아니다 |
| 데이터 모양 | 채널 × 시간 표본의 긴 숫자열 + 표본을 시간으로 바꿔 주는 sampling rate + 참가자·조건 메타데이터 |
| 분석 단위 | 표본도 window도 아닌 **참가자**. 한 사람에게서 나온 수백 개 window는 한 사람의 정보다 |

## 🎬 급할 때 볼 영상

- [But what is the Fourier Transform? A visual introduction. — 3Blue1Brown](https://www.youtube.com/watch?v=spUNpyF58BY) (약 20분) — 주파수 영역이 무엇인지 그림으로 잡아 준다. 스펙트럼, 대역 파워, 필터가 모두 여기서 출발한다.
- [Sampling, Aliasing & Nyquist Theorem — 0612 TV w/ NERDfirst](https://www.youtube.com/watch?v=yWqrx08UeUs) (약 11분) — sampling rate가 낮으면 왜 없는 주파수가 생겨 보이는지 설명한다. 장비 설정과 downsampling 전에 필요하다.
- [Pseudoreplication - What it is and how to avoid it — GSS - Guided Statistics for Scientists](https://www.youtube.com/watch?v=ZYSl8KZKm1g) (약 5분) — 한 사람의 반복 측정을 독립 표본처럼 세는 실수를 짧게 다룬다. 생리 신호 통계에서 가장 흔한 오류다.
- (선택, 검색 링크) HRV 지표만 따로 설명한 영상: [YouTube 검색 — "heart rate variability time domain frequency domain explained"](https://www.youtube.com/results?search_query=heart+rate+variability+time+domain+frequency+domain+explained)

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| sampling rate (표본화 주파수, fs) | 1초에 몇 번 값을 기록했는가 (Hz) | 표본 번호를 시간으로 바꾸는 유일한 열쇠. 틀리면 모든 주파수·시간 feature가 틀린다 |
| Nyquist 주파수와 aliasing | fs의 절반보다 빠른 성분은 제대로 기록되지 않고 느린 가짜 성분으로 접혀 들어온다 | 관심 주파수의 최소 2배, 실무에서는 그보다 넉넉하게 측정해야 한다. downsampling 전에는 저역 통과 필터가 먼저다 |
| filter (필터) | 특정 주파수 대역만 통과시키거나 막는 연산. 고역·저역·대역 통과, notch | drift와 전원 잡음을 줄이지만, 설정에 따라 관심 신호도 깎고 파형 모양을 바꾼다 |
| artifact (인공물) | 측정 대상이 아닌 원인으로 생긴 신호. 움직임, 눈 깜박임, 전극 접촉 불량, 전원 잡음 | 잡음과 달리 크고 구조가 있어 feature를 직접 오염시킨다. 군에 따라 양이 다르면 가짜 군 차이가 된다 |
| missingness (결측) | 기록이 끊기거나 쓸 수 없어 버린 구간 | 무작위가 아닐 때가 많다(증상이 심할수록 많이 빠짐). 버린 양을 군별로 보고해야 한다 |
| window / epoch (구간) | 긴 신호를 자른 고정 길이 조각, 또는 사건 기준으로 자른 조각 | feature는 구간마다 계산한다. 길이가 주파수 해상도와 feature 안정성을 정한다 |
| feature (특징) | 구간 하나를 숫자 몇 개로 요약한 것. 평균, SD, RMS, 대역 파워, peak 주파수 등 | 신호를 통계·모델이 다룰 수 있는 표로 바꾸는 단계. 정의를 바꾸면 결과가 바뀐다 |
| PSD (power spectral density) | 주파수별로 신호의 힘이 얼마나 있는지 나타낸 곡선 | 떨림 주파수, EEG 대역, HRV의 LF/HF가 모두 PSD에서 나온다 |
| stationarity (정상성) | 구간 안에서 신호의 통계적 성질이 변하지 않는다는 가정 | 스펙트럼 추정의 전제. 자세가 바뀌거나 과제가 섞인 구간은 따로 잘라야 한다 |
| repeated measures (반복 측정) | 한 참가자에게서 여러 기록·window가 나오는 구조 | 서로 닮아 있어 독립 표본이 아니다. 통계에서는 표본 수를, 모델 검증에서는 train/test 분리를 망가뜨린다 |

## 측정 기술 고르기

sampling rate와 주파수 대역은 **흔히 쓰는 출발점**이다. 장비·질문·대상에 따라 달라지므로 각 분야 권고문(아래 "더 볼 곳")을 확인한다.

| 신호 | 무엇을 얻나 | 흔한 fs · 관심 대역 | 장점 | 한계 | 이런 질문에 쓴다 |
|---|---|---|---|---|---|
| ECG (심전도) | 심장 전기 활동 파형, R peak 시각 → RR 간격 | 250–500 Hz 이상 · 약 0.5–40 Hz | 신호가 크고 표준이 잘 잡혀 있다 | 움직임·근전도 섞임, 부정맥·이소성 박동은 HRV 계산 전에 처리 필요 | 심박수와 리듬, 자율신경 지표(HRV)의 군·조건 차이 |
| HRV (심박변이도) | RR 간격의 변동. 시간 영역(SDNN, RMSSD), 주파수 영역(LF 0.04–0.15 Hz, HF 0.15–0.4 Hz) | ECG에서 파생. 단기 분석은 5분 기록이 표준 단위 | 비침습, 계산이 간단 | 기록 길이·호흡·자세·시간대에 민감. 길이가 다른 기록끼리 비교 불가. LF/HF의 생리적 해석은 논쟁 중 | 과제·자세·수면 단계에 따른 자율신경 조절 변화 |
| PPG (광용적맥파) | 말초 혈류량 변화, 맥박 간격 | 25–125 Hz · 약 0.5–8 Hz | 손목·손가락 웨어러블로 장시간 측정 | 움직임 artifact에 매우 약함. 맥박 간격은 RR 간격의 근사 | 일상생활 심박 추적, 호흡 추정 |
| EEG (뇌파) | 두피에서 잰 뇌 전기 활동. 대역 파워(delta·theta·alpha·beta), 사건 관련 전위 | 250–1000 Hz · 약 0.5–40 Hz | 시간 해상도가 밀리초 단위 | 신호가 매우 작다(µV). 눈·근육·전원 artifact가 신호보다 크다. 공간 해상도 낮음 | 수면 단계, 과제 중 리듬 변화, 자극 반응의 시간 경과 |
| EMG (표면 근전도) | 근육 활성의 시점과 크기. 포락선(envelope), RMS, 중앙 주파수 | 1000 Hz 이상 · 약 20–450 Hz | 근육별 활성 시점을 직접 본다 | 전극 위치·피부 상태에 민감. 진폭은 정규화(예: 최대 수축 대비) 없이는 사람 간 비교가 어렵다 | 근육 활성 타이밍, 피로, 떨림의 근육 수준 확인 |
| 가속도계·IMU (웨어러블) | 3축 가속도, 각속도. 활동량, 자세, 떨림 주파수, 걸음 검출 | 50–100 Hz가 흔함 · 사람 움직임 대부분은 약 20 Hz 아래 | 싸고 가볍다. 실험실 밖 장시간 측정 | 착용 위치·방향에 따라 값이 다르다. 중력 성분 분리 필요. 기기 간 차이 | 일상 활동량, 떨림, 보행 리듬, 과제별 움직임 패턴 |
| 지면반력 (보행) | 발이 바닥을 누르는 힘의 시간 변화 → heel strike 시각, stride interval, 좌우 대칭 | 100–1000 Hz | 걸음 시점이 뚜렷하게 잡힌다 | 측정 장소가 제한된다(깔창·힘판). 보행 속도·보조기구가 강한 교란 | 보행 리듬과 변동성, 이중 과제 효과 |
| 호흡 | 흉곽 벨트·기류·임피던스로 얻는 호흡 파형 → 호흡수, 깊이 | 25–125 Hz · 약 0.1–0.5 Hz | 느린 신호라 다루기 쉽다 | 말하기·움직임에 흐트러진다. 측정 방식마다 파형 의미가 다르다 | 호흡수 변화, HRV 해석의 보조 변수 |
| 연속 혈압 | 박동마다의 수축기·이완기 압력 | 100–1000 Hz | 박동 단위 혈압 조절을 본다 | 침습(동맥관)이거나 손가락 커프 보정이 필요. 장비가 비싸다 | 기립 반응, 혈압 변동성, 압수용체 반사 |

고르는 순서: (1) 질문의 생리 현상이 어느 주파수 대역에 있는가 → (2) 그 대역을 넉넉히 담는 fs와 기록 길이가 확보되는가 → (3) 참가자가 견딜 수 있는 측정 환경인가 → (4) 같은 조건의 대조 기록이 있는가.

## 표준 분석 흐름

1. **수집과 sampling rate 확인.** 파일을 열기 전에 fs, 채널 이름과 단위, 기록 길이, 장비, 조건 표시(annotation)를 데이터 설명서에서 확인해 데이터 사전을 만든다.
   - 도구: `wfdb`(WFDB 형식), `mne`(EDF/BDF 등 EEG), `pandas`(CSV/텍스트)
   - 입력→출력: 원자료(`.dat`+`.hea`, `.edf`, `.csv`, `.json`) → 배열 + 메타데이터 표
   - QC: 설명서의 fs와 파일 header의 fs가 일치하는가. 표본 수 ÷ fs가 기록 길이와 맞는가. 단위가 채널마다 같은가.
2. **전처리: 필터, artifact, 결측.** 원자료는 그대로 두고 사본에 적용한다.
   - 필터: 관심 대역만 남기는 대역 통과, 필요하면 전원 주파수(50 또는 60 Hz) notch. 오프라인 분석에서는 앞뒤로 두 번 거는 zero-phase 필터(`scipy.signal.sosfiltfilt`)가 시점을 밀지 않는다.
   - artifact: 진폭 문턱, 포화(값이 끝에 붙음), 평평한 구간을 표시한다. EEG는 독립성분분석(ICA)으로 눈·근육 성분을 덜어내는 방법이 흔하다.
   - 결측: 짧은 끊김만 보간하고, 긴 구간은 버린다. 무엇을 얼마나 버렸는지 기록한다.
   - 도구: `scipy.signal`, `mne`, `neurokit2`
   - 입력→출력: 원신호 → 정제된 신호 + "사용 가능" 표시 mask
   - QC: 필터 전후 파형과 스펙트럼을 겹쳐 그려 본다. 버린 비율을 **참가자별·군별**로 표로 만든다. 문턱값은 데이터를 보기 전에 정한다.
3. **구간 나누기 (window/epoch).** 고정 길이 window(예: 가속도 떨림 분석에 수 초, 단기 HRV에 5분) 또는 사건 기준 epoch(자극 시점, heel strike)으로 자른다.
   - 입력→출력: 연속 신호 → (참가자, 기록, 구간 번호, 조건)이 붙은 구간 목록
   - QC: 구간 길이가 관심 주파수의 주기를 여러 번 담는가(주파수 해상도 = 1 ÷ 구간 길이). artifact가 섞인 구간을 뺀 뒤 참가자별 남은 구간 수가 충분한가. 겹치는(overlap) window는 서로 더 닮아 있다는 점을 기억한다.
4. **feature 추출.** 구간마다 숫자 요약을 만든다.
   - 시간 영역: 평균, SD, RMS, 범위, peak 수, 간격의 평균과 변동계수(CV), HRV의 SDNN·RMSSD
   - 주파수 영역: Welch 방법 PSD(`scipy.signal.welch`), 대역 파워, peak 주파수, 대역 간 비
   - 도구: `numpy`, `scipy.signal`, `neurokit2`(ECG·EMG·호흡 feature), `mne`(EEG)
   - 입력→출력: 구간 목록 → 구간 단위 feature table(`.csv`, 한 행 = 한 구간)
   - QC: feature마다 분포를 그려 불가능한 값(음수 간격, 심박 300회/분 등)을 찾는다. feature 정의(대역 경계, 구간 길이)를 문서에 적는다.
5. **참가자 단위로 요약하고 통계·모델.** 구간 단위 표를 참가자당 한 행으로 줄이거나, 참가자를 묶음으로 명시한 모델을 쓴다.
   - 군 비교: 참가자 평균(또는 중앙값) → 효과크기 + 신뢰구간 + 검정. 구간 정보를 다 쓰고 싶으면 참가자를 random effect로 넣는 혼합효과모형(`statsmodels` `mixedlm`).
   - 예측 모델: train/test를 **참가자 단위로** 나눈다(`sklearn.model_selection.GroupKFold`, `groups=참가자 ID`). 표준화·feature 선택도 train 안에서만 맞춘다.
   - 입력→출력: 구간 단위 표 → 참가자 단위 표, 효과크기 표, 교차검증 성능
   - QC: 통계에 들어간 n이 참가자 수와 같은가. 같은 참가자가 train과 test에 동시에 있지 않은가. 나이·성별·보행 속도·약물 상태 같은 교란 후보가 군 사이에 균형인가.
6. **보고.** 참가자 흐름(모집 → 제외 → 분석), fs와 필터 설정, 구간 길이, artifact 기준과 버린 비율, feature 정의, 분석 단위, 효과크기와 신뢰구간, 다중검정 보정, 한계를 적는다. 코드와 설정 파일을 함께 남긴다.

실제 파일이 필요한 단계의 명령 형태(실행 예가 아니라 모양만):

```python
import wfdb
record = wfdb.rdrecord("<record 이름>", pn_dir="<PhysioNet 데이터베이스 경로>")
signal, fs = record.p_signal, record.fs
```

## 최소 실행 예시

### 예시 1 — 대역 통과 필터와 주파수 스펙트럼

10 Hz 리듬에 느린 drift, 60 Hz 전원 잡음, 백색 잡음을 섞은 가상 신호를 만들고 1–40 Hz 대역 통과 필터를 건다. 필터 전후의 대역별 파워를 비교한다.

```python
import numpy as np
from scipy import signal

fs = 250                                  # sampling rate (Hz)
t = np.arange(0, 20, 1 / fs)              # 20초
rng = np.random.default_rng(0)
x = (1.0 * np.sin(2 * np.pi * 10 * t)     # 관심 신호: 10 Hz 리듬
     + 2.0 * np.sin(2 * np.pi * 0.2 * t)  # 느린 기저선 흔들림 (drift)
     + 0.8 * np.sin(2 * np.pi * 60 * t)   # 전원 잡음 (60 Hz)
     + 0.5 * rng.standard_normal(t.size)) # 백색 잡음

# 1–40 Hz 대역 통과, 4차 Butterworth, 앞뒤로 두 번 걸어 위상 지연 없음
sos = signal.butter(4, [1, 40], btype="bandpass", fs=fs, output="sos")
y = signal.sosfiltfilt(sos, x)

def band_power(sig, lo, hi):
    f, pxx = signal.welch(sig, fs=fs, nperseg=fs * 4)   # 4초 창 → 0.25 Hz 해상도
    keep = (f >= lo) & (f < hi)
    return pxx[keep].sum() * (f[1] - f[0])

print(f"표본 수 {x.size}, Nyquist 주파수 {fs / 2} Hz")
print(f"{'대역':<14}{'필터 전':>10}{'필터 후':>10}")
for name, lo, hi in [("drift 0–1 Hz", 0, 1), ("신호 8–12 Hz", 8, 12), ("전원 58–62 Hz", 58, 62)]:
    print(f"{name:<14}{band_power(x, lo, hi):>12.4f}{band_power(y, lo, hi):>12.4f}")

f, pxx = signal.welch(y, fs=fs, nperseg=fs * 4)
print(f"필터 후 최대 peak 주파수: {f[np.argmax(pxx)]:.2f} Hz")
assert abs(f[np.argmax(pxx)] - 10) < 0.5
```

출력:

```text
표본 수 5000, Nyquist 주파수 125.0 Hz
대역                  필터 전      필터 후
drift 0–1 Hz        1.4087      0.0002
신호 8–12 Hz          0.5022      0.5022
전원 58–62 Hz         0.3196      0.0000
필터 후 최대 peak 주파수: 10.00 Hz
```

읽는 법: drift와 전원 잡음의 파워는 거의 0이 되었고, 관심 대역(8–12 Hz) 파워는 그대로다. 진폭 1인 사인파의 파워는 0.5이므로 0.5022는 기대한 값이다. 필터 경계를 관심 대역 가까이로 옮기면 세 번째 열의 가운데 줄도 줄어든다. 직접 바꿔 확인해 본다.

### 예시 2 — 참가자 단위 요약, 그리고 window를 독립 표본으로 셀 때 생기는 일

군당 6명, 한 사람당 window 20개인 가상 feature table을 만든다. **두 군 사이에 실제 차이는 없다.** 사람마다 고유한 수준이 있어서 한 사람의 window끼리는 서로 닮아 있다.

```python
import numpy as np, pandas as pd
from scipy import stats

def simulate(rng, n_per_group=6, n_windows=20, true_diff=0.0):
    """참가자마다 고유 수준(사람 간 SD 1.0) + window 잡음(SD 0.5)."""
    rows = []
    for g, group in enumerate(["control", "patient"]):
        for i in range(n_per_group):
            person_level = 10 + true_diff * g + rng.normal(0, 1.0)
            for w in range(n_windows):
                rows.append((f"{group[0].upper()}{i + 1:02d}", group, w,
                             person_level + rng.normal(0, 0.5)))
    return pd.DataFrame(rows, columns=["participant", "group", "window", "feature"])

rng = np.random.default_rng(1)
df = simulate(rng)                      # 실제 군 차이 없음
per_person = df.groupby(["group", "participant"], as_index=False)["feature"].mean()
print(f"window 행 수: {len(df)}, 참가자 수: {df['participant'].nunique()}")
print(per_person.groupby("group")["feature"].agg(["count", "mean", "std"]).round(2))

def p_window(d):   # 잘못된 방법: window를 독립 표본으로
    return stats.ttest_ind(*[d.loc[d.group == g, "feature"] for g in ["control", "patient"]],
                           equal_var=False).pvalue
def p_person(d):   # 올바른 방법: 참가자 평균으로 줄인 뒤 검정
    m = d.groupby(["group", "participant"])["feature"].mean()
    return stats.ttest_ind(m["control"], m["patient"], equal_var=False).pvalue

print(f"이 데이터의 p: window 단위 {p_window(df):.4f} (n=240), 참가자 단위 {p_person(df):.4f} (n=12)")

# 군 차이가 없는 데이터를 1,000번 만들어 p<0.05가 나오는 비율(거짓 양성률)
sims = [simulate(rng) for _ in range(1000)]
fp_w = np.mean([p_window(d) < 0.05 for d in sims])
fp_p = np.mean([p_person(d) < 0.05 for d in sims])
print(f"거짓 양성률: window 단위 {fp_w:.3f}, 참가자 단위 {fp_p:.3f} (기대값 0.05)")
assert fp_w > 0.3 and fp_p < 0.08
```

출력:

```text
window 행 수: 240, 참가자 수: 12
         count   mean   std
group                      
control      6  10.00  0.72
patient      6   9.87  0.70
이 데이터의 p: window 단위 0.2027 (n=240), 참가자 단위 0.7549 (n=12)
거짓 양성률: window 단위 0.651, 참가자 단위 0.038 (기대값 0.05)
```

읽는 법: 차이가 없는 데이터인데도 window를 독립 표본으로 세면 1,000번 중 약 65%에서 "유의한 차이"가 나온다. 참가자 평균으로 줄이면 약 4%로, 약속한 5% 근처다. 행이 240개여도 정보는 12명분이다. 같은 구조가 모델 검증에서는 데이터 누수가 된다. 한 사람의 window가 train과 test에 나뉘어 들어가면 모델은 상태가 아니라 "그 사람"을 알아보고 맞힌다.

## 흔한 함정

1. **window를 독립 표본으로 센다** → n이 부풀어 p-value가 지나치게 작아진다(위 예시 2) → 참가자 단위로 요약하거나 참가자를 묶음으로 넣은 혼합효과모형을 쓴다. 보고하는 n은 참가자 수다.
2. **행 단위로 무작위 train/test 분할을 한다** → 같은 사람의 window가 양쪽에 들어가 성능이 실제보다 높게 나온다(데이터 누수) → `GroupKFold`처럼 참가자 ID로 묶어 나눈다. 표준화, feature 선택, 하이퍼파라미터 탐색도 train 안에서만 한다.
3. **sampling rate를 확인하지 않거나 필터 없이 downsampling한다** → 시간축·주파수축이 통째로 틀리거나 aliasing으로 없는 성분이 생긴다 → header에서 fs를 읽어 변수로 두고, 낮출 때는 저역 통과 필터를 포함한 함수(`scipy.signal.decimate`, `resample_poly`)를 쓴다.
4. **필터를 습관대로 건다** → 관심 대역이 깎이거나 파형 모양·시점이 바뀐다(높은 고역 통과 경계는 느린 성분을, 단방향 필터는 시점을 왜곡) → 관심 대역을 먼저 정하고, 필터 전후 파형과 스펙트럼을 비교하고, 설정(종류·차수·경계)을 보고한다.
5. **결과를 본 뒤 artifact 기준을 조정한다** → 원하는 방향의 차이가 만들어진다. 또 한 군에서만 구간이 많이 빠지면 남은 데이터가 그 군을 대표하지 않는다 → 기준을 미리 적어 두고, 버린 비율을 군별로 보고하고, 기준을 바꿔도 결론이 유지되는지 민감도 분석을 한다.
6. **길이나 조건이 다른 기록의 feature를 그대로 비교한다** → SDNN 같은 지표는 기록이 길수록 커지고, 자세·과제·시간대·약물 상태가 다르면 생리 자체가 다르다 → 같은 길이·같은 조건의 구간끼리 비교하고, 조건을 메타데이터 열로 남긴다.
7. **군 차이와 측정 조건 차이가 겹친다** → 환자는 병원 장비로, 대조군은 다른 장비·다른 날 측정했다면 장비 차이와 군 차이를 분리할 수 없다. 나이·성별·보행 속도도 같은 문제다 → 군 × 조건 교차표를 먼저 만들고, 겹치면 한계로 적는다.
8. **feature를 수십 개 만들어 가장 좋은 것만 보고한다** → 우연히 걸린 차이가 발견처럼 보인다 → 주 feature를 미리 정하고, 나머지는 탐색으로 표시하고, 여러 개를 검정했으면 FDR 보정을 한다.

## 연구 설계 체크리스트

- [ ] 질문이 한 문장으로 적혀 있고, 주 outcome feature가 데이터를 보기 전에 정해져 있다.
- [ ] 표본 수를 **참가자 수**로 세었고, 군별 참가자 수와 참가자당 기록·window 수를 표로 만들었다.
- [ ] sampling rate, 채널, 단위, 장비, 센서 위치가 데이터 사전에 적혀 있다.
- [ ] 관심 주파수 대역에 비해 fs와 구간 길이가 충분하다.
- [ ] 대조군 또는 대조 조건이 같은 장비·같은 절차로 측정되었다.
- [ ] 교란 후보(나이, 성별, 약물 상태, 측정 시간대, 자세·과제, 보행 속도, 장비·기관)를 군별로 점검했다.
- [ ] 필터 설정, artifact 기준, 결측 처리 규칙을 미리 적었고, 버린 비율을 군별로 보고한다.
- [ ] 통계 분석 단위가 참가자이고, 반복 측정 구조를 요약 또는 혼합효과모형으로 처리한다.
- [ ] 예측 모델은 참가자 단위로 train/test를 나누고, 전처리를 train 안에서만 맞춘다.
- [ ] 여러 feature를 검정하면 다중검정 보정을 하고, 탐색적 분석과 확증적 분석을 구분해 적는다.

## 공개 데이터와 더 볼 곳

**공개 저장소**

| 이름 | URL | 무엇이 있나 |
|---|---|---|
| PhysioNet | <https://physionet.org/> | 생리 신호 공개 데이터의 중심 저장소. 데이터베이스 목록은 <https://physionet.org/about/database/>. 데이터마다 접근 조건(공개/자격 필요)과 라이선스, 인용 방법이 다르므로 각 페이지를 확인한다 |
| MIT-BIH Arrhythmia Database | <https://physionet.org/content/mitdb/1.0.0/> | 박동 주석이 붙은 ECG 기록. R peak 검출 연습의 표준 |
| MIT-BIH Normal Sinus Rhythm Database | <https://physionet.org/content/nsrdb/1.0.0/> | 장시간 정상 동율동 ECG. HRV 계산 연습 |
| Sleep-EDF Database Expanded | <https://physionet.org/content/sleep-edfx/1.0.0/> | 수면다원검사(EEG 등)와 수면 단계 표시 |
| EEG Motor Movement/Imagery Dataset | <https://physionet.org/content/eegmmidb/1.0.0/> | 운동 실행·상상 과제 중의 다채널 EEG |
| Examples of Electromyograms | <https://physionet.org/content/emgdb/1.0.0/> | 짧은 EMG 예시 기록. 파형과 스펙트럼 살펴보기용 |
| Gait in Parkinson's Disease | <https://physionet.org/content/gaitpdb/1.0.0/> | 발바닥 힘 센서로 잰 보행 지면반력 기록 (본 과정 4–5주차 선택지) |
| PADS - Parkinsons Disease Smartwatch dataset | <https://physionet.org/content/parkinsons-disease-smartwatch/1.0.0/> | 손목 스마트워치 가속도·각속도 기록 (본 과정 4–5주차 선택지) |
| BIDMC PPG and Respiration Dataset | <https://physionet.org/content/bidmc/1.0.0/> | PPG, 호흡, ECG 동시 기록. 호흡수 추정 연습 |
| OpenNeuro | <https://openneuro.org/> | BIDS 형식으로 정리된 EEG·MEG·MRI 공개 데이터 |

**공식 문서·도구 (모두 무료·공개)**

- `scipy.signal` 문서 — 필터 설계, Welch PSD: <https://docs.scipy.org/doc/scipy/reference/signal.html>
- WFDB Python 패키지 — PhysioNet 형식 읽기: <https://wfdb.readthedocs.io/en/latest/>
- MNE-Python — EEG/MEG 전처리와 튜토리얼: <https://mne.tools/stable/index.html>
- NeuroKit2 — ECG·HRV·EMG·호흡 처리: <https://neuropsychology.github.io/NeuroKit/>
- EEGLAB — MATLAB 기반 EEG 도구: <https://eeglab.org/>
- GGIR — 손목 가속도계 장기 기록 처리(R): <https://cran.r-project.org/package=GGIR>
- SENIAM — 표면 근전도 전극 부착 권고: <http://www.seniam.org/>
- scikit-learn `GroupKFold` — 참가자 단위 교차검증: <https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html>
- statsmodels 혼합효과모형: <https://www.statsmodels.org/stable/mixed_linear.html>
- BIDS — 신경·생리 데이터 폴더·메타데이터 표준: <https://bids.neuroimaging.io/>

**핵심 논문 (Crossref로 서지 확인)**

- Task Force of the European Society of Cardiology and the North American Society of Pacing and Electrophysiology. Heart rate variability: standards of measurement, physiological interpretation, and clinical use. *Circulation* 1996;93:1043–1065. doi:[10.1161/01.CIR.93.5.1043](https://doi.org/10.1161/01.CIR.93.5.1043) — HRV 기록 길이·대역 정의의 근거.
- Shaffer F, Ginsberg JP. An Overview of Heart Rate Variability Metrics and Norms. *Front Public Health* 2017;5:258. doi:[10.3389/fpubh.2017.00258](https://doi.org/10.3389/fpubh.2017.00258) — HRV 지표 정리.
- Goldberger AL, et al. PhysioBank, PhysioToolkit, and PhysioNet. *Circulation* 2000;101:e215–e220. doi:[10.1161/01.CIR.101.23.e215](https://doi.org/10.1161/01.CIR.101.23.e215) — PhysioNet 데이터를 쓸 때 함께 인용하는 논문.
- Pernet C, et al. Issues and recommendations from the OHBM COBIDAS MEEG committee for reproducible EEG and MEG research. *Nat Neurosci* 2020;23:1473–1483. doi:[10.1038/s41593-020-00709-0](https://doi.org/10.1038/s41593-020-00709-0) — EEG 전처리·보고 권고.
- De Luca CJ, et al. Filtering the surface EMG signal: Movement artifact and baseline noise contamination. *J Biomech* 2010;43:1573–1579. doi:[10.1016/j.jbiomech.2010.01.027](https://doi.org/10.1016/j.jbiomech.2010.01.027) — 표면 EMG 고역 통과 경계의 근거.
- Hausdorff JM. Gait variability: methods, modeling and meaning. *J Neuroeng Rehabil* 2005;2:19. doi:[10.1186/1743-0003-2-19](https://doi.org/10.1186/1743-0003-2-19) — 보행 변동성 지표.
- Saeb S, et al. The need to approximate the use-case in clinical machine learning. *GigaScience* 2017;6:gix019. doi:[10.1093/gigascience/gix019](https://doi.org/10.1093/gigascience/gix019) — 행 단위 분할이 성능을 부풀린다는 것을 보인 논문.
- Lazic SE. The problem of pseudoreplication in neuroscientific studies: is it affecting your analysis? *BMC Neurosci* 2010;11:5. doi:[10.1186/1471-2202-11-5](https://doi.org/10.1186/1471-2202-11-5) — 반복 측정을 독립으로 세는 문제.
- Makowski D, et al. NeuroKit2: A Python toolbox for neurophysiological signal processing. *Behav Res Methods* 2021;53:1689–1696. doi:[10.3758/s13428-020-01516-y](https://doi.org/10.3758/s13428-020-01516-y)
- Gramfort A, et al. MEG and EEG data analysis with MNE-Python. *Front Neurosci* 2013;7:267. doi:[10.3389/fnins.2013.00267](https://doi.org/10.3389/fnins.2013.00267)

## 본 과정과의 연결

| 이 가이드의 부분 | 자세히 다루는 레슨 |
|---|---|
| 생체신호 파일 형식(EDF, WFDB header) | [Day 6 — 생물학·생체신호 파일 형식](../lessons/week-1/day-06.md) |
| 증상을 feature로 옮기기, 한 사람이 여러 기록을 가지는 구조 | [Day 22 — PD의 운동 표현형](../lessons/week-4/day-22.md) |
| sampling rate, aliasing, 필터, window, 결측, 주파수 영역 | [Day 23 — 시계열 기초](../lessons/week-4/day-23.md) |
| PhysioNet 데이터 설명서 읽기, 데이터 사전 | [Day 24 — PhysioNet 데이터 접근과 구조](../lessons/week-4/day-24.md) |
| 참가자 단위로 세고 제외 기준을 적용하는 QC | [Day 25 — participant-level QC](../lessons/week-4/day-25.md) |
| record-level과 participant-level feature table, stride interval | [Day 26 — 기본 feature 추출](../lessons/week-4/day-26.md) |
| 사람이 보이는 그림(spaghetti, box/violin) | [Day 27 — 개별·군 수준 시각화](../lessons/week-4/day-27.md) |
| 결과를 보기 전에 분석 계획 고정 | [Day 28 — 분석 계획 확정](../lessons/week-4/day-28.md) |
| 군 비교·회귀·분류 중 고르기 | [Day 29 — 가설검정과 모델 선택](../lessons/week-5/day-29.md) |
| 참가자 단위 요약 뒤 효과크기와 bootstrap 신뢰구간 | [Day 30 — 단변량 비교](../lessons/week-5/day-30.md) |
| 웨어러블·보행 데이터의 교란 후보 | [Day 31 — 교란변수](../lessons/week-5/day-31.md) |
| GroupKFold와 데이터 누수 | [Day 33 — 참가자 단위 검증과 데이터 누수](../lessons/week-5/day-33.md) |
| 성능 지표 읽기와 오류 분석 | [Day 34 — 평가 지표 해석](../lessons/week-5/day-34.md) |
| 보고서 구조와 한계 쓰기 | [Day 35 — PD 프로젝트 보고서](../lessons/week-5/day-35.md) |
| artifact 기준·feature 정의를 바꿔 보는 민감도 분석 | [Day 39 — 민감도 분석](../lessons/week-6/day-39.md) |

통계 쪽이 급하면 [Crash Course — 연구 설계와 통계 응급 키트](study-design-stats.md)를 함께 본다.

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
