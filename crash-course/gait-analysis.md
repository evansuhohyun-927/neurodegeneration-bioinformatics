# Crash Course — 보행분석

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** 보행 자료(힘 센서, 마커, IMU)를 받아 "질문에 맞는 측정 → 이벤트 검출 → stride 단위 변수 → 참가자 단위 통계"의 순서를 잡고, 가장 흔한 실수(속도를 무시한 군 비교, stride를 독립 표본으로 세기, 필터 설정을 숨기기)를 피한다.

## 한눈에 보기

| 항목 | 내용 |
|---|---|
| 무엇을 측정하는가 | 걸음의 시간·공간 구조(속도, cadence, stride·step length, stance·swing 비율), 관절 각도(운동학), 지면반력과 관절 모멘트·파워(운동역학), 근활동(EMG), 에너지 소비, 그리고 착용 센서의 가속도·각속도 |
| 어떤 질문에 답하는가 | 군 사이에 보행이 어떻게 다른가 / 중재 전후로 한 사람 안에서 무엇이 변했는가 / 어느 phase의 어느 관절에서 문제가 생기는가 / 센서 신호로 동결(FOG) 같은 사건을 잡을 수 있는가 / 로봇·보조기가 보행 역학을 어떻게 바꾸는가 |
| 답하지 못하는 것 | 이상의 원인(관찰된 보행은 병 + 보상의 순 결과), 근육 하나하나의 힘(net moment는 근력이 아니다), 개인 진단. 실험실에서 얻은 결과가 일상 보행을 대표한다는 보장 |
| 데이터 모양 | 채널 × 시간 표본의 연속 신호 + 표본화 주파수 + 이벤트(heel strike, toe off) + 참가자·조건 메타데이터(나이, 키, 체중, 보행 속도, 약물 상태) |
| 분석 단위 | stride가 아니라 **참가자**. 한 사람에게서 나온 수백 개 stride는 한 사람의 정보다 |

## 🎬 급할 때 볼 영상

- [Gait impairments in Parkinson's disease — The Lancet](https://www.youtube.com/watch?v=pFLC9C-xH8E) — 파킨슨병 보행이 단계별로 어떻게 변하는지 짧게 보여 준다. 질환 보행에서 무엇을 재야 하는지 감을 잡는 데 쓴다.
- [Sampling, Aliasing & Nyquist Theorem — 0612 TV w/ NERDfirst](https://www.youtube.com/watch?v=yWqrx08UeUs) (약 11분) — 표본화가 느리면 없는 주파수가 생긴다. 센서 표본화율을 정하기 전에 본다.
- [Bland-Altman Plot [Simply explained] — numiqo](https://www.youtube.com/watch?v=hHsfn7jE79M) — 새 센서·알고리즘을 기준 방법과 비교할 때 상관계수 대신 쓰는 그림. 원 논문은 일치 한계에 2s를 썼다는 점을 기억한다.

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| gait cycle (보행 주기) | 한 발의 initial contact에서 같은 발의 다음 initial contact까지. 정상 속도에서 stance 약 60%, swing 약 40% | 모든 변수의 시간축(0–100% GC). stance 비율은 속도에 따라 변한다 |
| 시공간 변수 | 속도, cadence(steps/min), stride·step length, stance·swing·double support 시간. 속도 = stride length × cadence ÷ 2 | 가장 싸고 신뢰도 높은 요약. 대부분의 장애에서 함께 변하므로 원인은 말해 주지 않는다 |
| gait event | heel strike(initial contact)와 toe off. 힘 threshold(흔히 20 N), footswitch, 마커 좌표·속도, 자이로 신호로 검출 | 모든 stride 변수의 출발점. threshold와 필터가 시점을 체계적으로 옮긴다 |
| 지면반력과 COP | 바닥이 몸에 주는 힘(3성분)과 그 작용점. 수직력 = Σ 분절 질량 × (가속도 + g) | 힘판은 몸 전체의 가속도를 잰다. COP는 COM과 다른 양이다 |
| 관절각과 부호 규약 | 인접 분절 사이의 상대 각도. 축 정의·회전 순서·부호(예: 배측굴곡 +)가 교재·소프트웨어마다 다르다 | 규약을 적지 않은 각도는 비교할 수 없다 |
| 내부 vs 외부 모멘트 | 역동역학으로 구한 근육·인대의 순 모멘트(내부) vs 지면반력이 관절에 만드는 모멘트(외부) | 같은 사건이 "외부 굴곡 모멘트"와 "내부 신전 모멘트"로 다르게 불린다 |
| joint power | 관절 모멘트 × 각속도. 양수 = 에너지 생성, 음수 = 흡수 | push-off(A2) 같은 보행의 동력원을 찾는다. 단 부호로 근수축 형태를 단정하지 않는다(건 탄성, 수동 조직) |
| zero-phase 필터와 cutoff | 앞뒤로 두 번 거는 Butterworth(`filtfilt`). 위상 지연은 없지만 실효 cutoff가 약 0.8배로 내려간다 | 미분 전에 반드시 거른다. cutoff는 residual analysis로 고르고, 보정 여부를 보고한다. 실시간 제어에는 못 쓴다 |
| 변동성과 비대칭 | stride time CV(SD/평균), 좌우 비대칭 지수 | PD·낙상 위험 연구의 핵심 지표. 단 "변동성 = 나쁨"은 변수에 따라 성립하지 않는다 |
| freeze index (FI) | 다리 가속도에서 3–8 Hz(freeze band) 파워 ÷ 0.5–3 Hz(locomotor band) 파워 | 떨림형 FOG 검출의 기본 feature. 무동형 FOG와 정지 상태에는 약하다 |

## 측정 기술 고르기

보행 측정 시스템 비교. 값은 교재에 인용된 **흔한 출발점**이고, 장비·모델·대상에 따라 달라진다.

| 시스템 | 무엇을 얻나 | 장점 | 한계 | 이런 질문에 쓴다 |
|---|---|---|---|---|
| 관찰·비디오(2D) | 운동 양상, 시상면 각도 근사 | 장비가 거의 필요 없음, 기록·공유 | 관절 각도를 신뢰성 있게 추정 못 함, 평면 밖 운동은 투영되어 틀어짐 | 임상 선별, 체크리스트 기반 관찰 |
| 스톱워치·footswitch·계측 보행로 | 속도, cadence, stride·step, stance·swing 시간, 발 위치(보행로) | 싸고 빠름, 많은 걸음 | 관절 정보 없음. footswitch는 threshold 때문에 힘판보다 이벤트가 늦음 | 10MWT, 시공간 변동성, 중재 전후 비교 |
| 광학 motion capture | 마커 3D 위치 → 관절각(3면) | 실험실 표준, 마커 오차 mm 수준 | 비용, 실험실에 묶임, 관절 중심 추정·연부조직 오차, 마커 세트마다 값이 다름 | 3D 운동학, 수술 계획, 정밀 연구 |
| 힘판·계측 트레드밀 | 3성분 지면반력, COP | 운동학과 합치면 관절 모멘트·파워 | 조준(targeting), 판 수 제한, 작은 힘에서 COP 불신 | 추진·제동, paretic propulsion, 역동역학 |
| 깔창 힘·압력 센서 | (대개) 수직력, 족저압 | 연속된 많은 걸음, 조준 문제 없음 | 수평 성분 없음, 좌표계가 발과 함께 움직임 | 이벤트·리듬·변동성(예: PhysioNet gaitpdb), 족부 압력 |
| IMU(가속도계·자이로) | 분절 가속도·각속도 → 방향, 이벤트, 활동 | 실험실 밖·장시간·가정 측정 | drift, 센서–분절 정렬, 중력 성분 처리, **지면반력 없음** | 일상 모니터링, FOG 탐지, 착용 로봇 입력 |
| markerless 비디오 | 딥러닝으로 관절 중심 추정 | 준비 시간 짧음, 평소 옷 | 마커 기반보다 오차가 대체로 큼, 회전 운동학에 약함 | 실험실 밖 운동학, 대규모 선별 |
| 표면 EMG | 근육 활성 시점과 상대 크기 | 활성 타이밍을 직접 봄 | cross-talk, 진폭 정규화 필요, 힘·수축 형태를 주지 않음 | 근활동 순서, 경직·보상 패턴 |
| 산소 섭취 | 대사 에너지 rate·cost | 효율의 표준 | 장비, 정상 상태 필요 | 보조기·로봇의 대사 비용 효과 |

고르는 순서: (1) 질문에 필요한 변수(시간·각도·힘·근활동·에너지) → (2) 그 변수를 담는 최소 시스템 → (3) 측정 환경(실험실·병원·가정) → (4) 그 시스템의 신뢰도·타당도 근거. 예: 일상의 FOG 모니터링은 IMU, 뇌졸중의 추진 비대칭은 힘판, 외골격 실시간 제어는 지연이 짧은 착용 센서.

## 표준 분석 흐름

1. **질문과 프로토콜.** 결과 변수, 속도 조건(자기 선택 vs 고정), 보행로 길이(건강한 성인은 최소 약 8 m, 가능하면 12 m 이상), 연습 시행, 약물 상태(PD는 on/off)를 미리 정한다.
   - 입력→출력: 연구 계획 → 프로토콜 문서, 사전 등록한 분석 계획
   - QC: 첫 시행은 낯설어 느리다(연습 시행을 두고 기록하지 않는다). 가감속 구간을 빼고 잰다.
2. **수집과 데이터 사전.** 표본화 주파수, 채널 이름·단위, 좌표축 정의, 센서 부착 위치, 마커 세트 이름을 먼저 표로 만든다.
   - 도구: `pandas`(텍스트), C3D 형식 리더(motion capture), PhysioNet 자료는 페이지의 형식 설명
   - 입력→출력: 원자료(`.txt`, `.csv`, `.c3d`) → 배열 + 메타데이터 표
   - QC: 설명서의 fs와 시간 열이 맞는가, 표본 수 ÷ fs가 기록 길이와 맞는가, 단위(N, mg, m/s², cm)가 채널마다 맞는가.
3. **전처리.** 결측·포화 확인, 필요하면 중력 성분 처리(가속도계), low-pass 필터(운동학은 미분 전에 반드시).
   - 도구: `scipy.signal.butter`, `sosfiltfilt`(오프라인), `lfilter`(실시간 흉내)
   - 입력→출력: 원신호 → 정제 신호 + 사용 가능 표시
   - QC: cutoff를 residual analysis로 정했는가, 두 번 통과 보정을 했는가, 필터 전후 파형을 겹쳐 봤는가. 끝점 몇 표본은 믿지 않는다.
4. **이벤트 검출.** 힘 threshold, 마커 좌표·속도, 자이로 특징점으로 heel strike·toe off를 찾는다.
   - 입력→출력: 신호 → 이벤트 시각 표(참가자, 발, 이벤트, 시각)
   - QC: 최소 접지 시간·stride 길이 같은 그럴듯함 규칙, 첫·마지막 stride와 회전 구간 처리 규칙을 **데이터를 보기 전에** 정한다. threshold를 바꿨을 때 결과 민감도를 확인한다.
5. **stride 단위 변수와 시간 정규화.** stride·stance·swing 시간, 길이, 각도·힘의 특징값. 파형은 stride마다 101점(0–100% GC)으로 정규화해 ensemble 평균을 낸다.
   - 입력→출력: 이벤트 + 신호 → stride 단위 표(한 행 = 한 stride), 정규화 파형 배열
   - QC: loading rate처럼 시간이 들어가는 변수는 정규화 전 자료로 계산한다. 이상 stride 수를 참가자별로 센다.
6. **참가자 단위 요약과 통계.** 참가자마다 평균·CV·비대칭 지수를 구해 한 행으로 줄이고, 효과크기와 신뢰구간으로 비교한다. 파형 전체는 PCA나 SPM으로.
   - 도구: `pandas`, `scipy.stats`, `statsmodels`(혼합효과모형), 파형 검정은 spm1d
   - 입력→출력: stride 단위 표 → 참가자 단위 표 → 효과크기 표
   - QC: n이 참가자 수와 같은가. 보행 속도·나이·키가 군 사이에 균형인가(아니면 공변량). 모델 검증은 참가자 단위 분할(GroupKFold, LOSO)이고 전처리·정규화·PCA도 train fold 안에서만 맞춘다.
7. **신뢰도·타당도.** 새 측정법은 기준 방법과 Bland–Altman(bias, 일치 한계)으로, 반복 측정은 ICC(형태 명시, 95% CI)와 SEM·MDC로 보고한다.
8. **보고.** 장비·표본화율·필터(종류, 차수, cutoff, 통과 횟수, 보정 여부), 이벤트 규칙, 제외한 stride와 참가자, 속도, 분석 단위, 효과크기와 신뢰구간, 한계(실험실 vs 일상, 표본 크기, 라벨 기준).

실제 파일이 필요한 단계의 명령 형태(실행 예가 아니라 모양만):

```python
import pandas as pd
# gaitpdb 신호 파일: 머리글 없음, 탭 구분, 19열(1열 시간, 18·19열 = 왼발·오른발 총 힘, N)
df = pd.read_csv("data/gaitpdb/<파일 이름>_01.txt", sep="\t", header=None)
left_total = df[17].to_numpy()       # 0부터 세면 17번이 18열
```

## 최소 실행 예시

### 예시 1 — 힘 threshold로 stride를 잘라 참가자 단위 CV 구하기

가상 참가자 두 명의 한쪽 발 수직력(100 Hz)을 만들고 20 N threshold로 접지와 떨어짐을 찾는다. 두 번째 참가자 자료에는 swing 중 잡음 spike 하나가 threshold를 넘었다. "최소 접지 시간 100 ms" 규칙이 있을 때와 없을 때 CV를 비교한다.

```python
import numpy as np
import pandas as pd

fs = 100                                     # gaitpdb와 같은 100 Hz
rng = np.random.default_rng(7)

def one_foot_vgrf(stride_times, stance_frac=0.62, bw=700):
    """stride마다 길이가 다른 한쪽 발 수직력(N) 가상 신호: stance 동안 반원 모양 + 잡음."""
    out = []
    for T in stride_times:
        n, ns = int(round(T * fs)), int(round(T * stance_frac * fs))
        x = np.zeros(n)
        x[:ns] = 1.1 * bw * np.sin(np.pi * np.arange(ns) / ns)
        out.append(x)
    return np.concatenate(out) + rng.normal(0, 5, sum(len(o) for o in out))

def stride_table(f, thr=20, min_contact_s=0.0):
    on = np.flatnonzero((f[1:] >= thr) & (f[:-1] < thr)) + 1    # 접지(위로 교차)
    off = np.flatnonzero((f[1:] < thr) & (f[:-1] >= thr)) + 1   # 떨어짐(아래로 교차)
    if min_contact_s > 0:                                       # 짧은 "접지"(잡음 spike)는 버린다
        keep = [i for i, a in enumerate(on)
                if (off[off > a][:1] - a).size and (off[off > a][0] - a) / fs >= min_contact_s]
        on = on[keep]
    rows = []
    for a, b in zip(on[:-1], on[1:]):                           # 접지–다음 접지 = 1 stride
        o = off[(off > a) & (off < b)]
        if len(o) == 1:
            rows.append({"stride_s": (b - a) / fs, "stance_pct": 100 * (o[0] - a) / (b - a)})
    return pd.DataFrame(rows).iloc[1:-1]                        # 첫·마지막 stride는 버린다

people = {"P01": rng.normal(1.10, 0.015, 40), "P02": rng.normal(1.05, 0.045, 40)}
summary = []
for pid, st in people.items():
    f = one_foot_vgrf(st)
    for rule in [0.0, 0.1]:                                     # 규칙 없음 vs 최소 접지 100 ms
        tab = stride_table(f, min_contact_s=rule)
        summary.append({"참가자": pid, "최소 접지(s)": rule, "stride 수": len(tab),
                        "stride time 평균(s)": round(tab.stride_s.mean(), 3),
                        "stride time CV(%)": round(100 * tab.stride_s.std(ddof=1) / tab.stride_s.mean(), 2),
                        "stance(%)": round(tab.stance_pct.mean(), 1)})
print(pd.DataFrame(summary).to_string(index=False))
```

실제 출력(neurobio 환경):

```
참가자  최소 접지(s)  stride 수  stride time 평균(s)  stride time CV(%)  stance(%)
P01       0.0        37              1.094               1.19       61.0
P01       0.1        37              1.094               1.19       61.0
P02       0.0        38              1.023              15.49       59.9
P02       0.1        36              1.050               3.98       61.1
```

P02의 참 stride time SD는 평균의 약 4%로 만들었다. 잡음 spike 하나가 0.11초짜리 가짜 stride를 만들어 CV를 15%로 부풀렸고, 최소 접지 규칙이 이를 걸러 냈다(그 대가로 spike가 끼었던 stride 하나도 빠졌다). 변동성 지표는 이벤트 검출의 작은 오류에 매우 민감하다. 규칙은 데이터를 보기 전에 정하고 보고한다.

### 예시 2 — freeze index를 window마다 계산하기

64 Hz 가상 shank 가속도(mg)에 0–20초 걷기, 20–25초 동결(6 Hz 떨림), 25–30초 정지를 넣고, 4초 window를 밀며 FI를 계산한다. 두 대역 에너지의 합이 작으면(정지) 판정하지 않는다.

```python
import numpy as np
from scipy import signal

fs = 64                                       # Bächlin 2010과 같은 64 Hz
rng = np.random.default_rng(3)
t = np.arange(0, 30, 1 / fs)
x = (300 * np.sin(2 * np.pi * 1.0 * t)         # 0–20 s: 1 Hz 걸음 리듬(mg)
     + 90 * np.sin(2 * np.pi * 2.0 * t)        #         + 2·4 Hz harmonic
     + 40 * np.sin(2 * np.pi * 4.0 * t))
fog = (t >= 20) & (t < 25)                     # 20–25 s: 가상 동결(6 Hz 떨림 + 작은 1.5 Hz 움직임)
x[fog] = 80 * np.sin(2 * np.pi * 6.0 * t[fog]) + 60 * np.sin(2 * np.pi * 1.5 * t[fog])
x[t >= 25] = 0                                 # 25–30 s: 정지
x += rng.normal(0, 5, t.size)                  # 센서 잡음

win, step = 4 * fs, fs // 2                    # 4 s window(256 표본), 0.5 s씩 이동
for start in range(0, t.size - win + 1, 4 * step):          # 출력은 2 s 간격만
    seg = x[start:start + win]
    f, p = signal.periodogram(seg - seg.mean(), fs=fs, window="boxcar")
    loco = p[(f >= 0.5) & (f < 3)].sum()
    frz = p[(f >= 3) & (f <= 8)].sum()
    gate = (loco + frz) > 1e3                  # 에너지가 작으면(정지) 판정하지 않음
    fi = frz / loco if gate else float("nan")
    print(f"{t[start]:4.1f}–{t[start] + 4:4.1f} s  FI = {fi:8.2f}  {'(에너지 낮음: 판정 안 함)' if not gate else ''}")
```

실제 출력(neurobio 환경):

```
 0.0– 4.0 s  FI =     0.02  
 2.0– 6.0 s  FI =     0.02  
 4.0– 8.0 s  FI =     0.02  
 6.0–10.0 s  FI =     0.02  
 8.0–12.0 s  FI =     0.02  
10.0–14.0 s  FI =     0.02  
12.0–16.0 s  FI =     0.02  
14.0–18.0 s  FI =     0.02  
16.0–20.0 s  FI =     0.02  
18.0–22.0 s  FI =     0.09  
20.0–24.0 s  FI =     1.78  
22.0–26.0 s  FI =     1.78  
24.0–28.0 s  FI =     1.88  
26.0–30.0 s  FI =      nan  (에너지 낮음: 판정 안 함)
```

읽을 점: 동결이 시작된 20초를 반쯤 덮는 18–22초 window는 FI가 아직 낮다(검출 지연). 동결이 끝난 뒤에도 24–28초 window는 FI가 높다. 정지 구간의 에너지가 작아 동결 1초의 떨림이 비율을 지배하기 때문이다. window 길이는 지연과 안정성의 trade-off이고, 대역 경계(3 Hz bin을 어느 쪽에 넣는가)는 규칙으로 적어야 한다. 실제 자료의 FI 값 범위는 이와 다르다.

## 흔한 함정

1. **속도를 무시한 군 비교** → stance 비율, 무릎 굴곡, 지면반력 봉우리가 모두 속도에 따라 변해서 "질환 효과"가 사실은 속도 효과일 수 있다 → 속도를 맞추거나 공변량으로 넣고, 느린 속도 자체가 보상일 수 있음을 해석에 적는다.
2. **stride를 독립 표본으로 세기** → 한 사람의 수백 stride로 p값이 터무니없이 작아지고, 모델 검증에서는 같은 사람이 train과 test에 동시에 들어가 성능이 부풀려진다 → 참가자 단위로 요약하거나 혼합효과모형, 검증은 GroupKFold·LOSO.
3. **필터 설정을 숨기거나 보정 없이 `filtfilt`** → "6 Hz"라고 적었지만 실제 −3 dB는 약 4.8 Hz → 종류·차수·cutoff·통과 횟수·보정 여부를 모두 적고, cutoff는 residual analysis 등 근거를 남긴다.
4. **이벤트 규칙을 결과를 보고 고르기** → threshold·제외 규칙이 군 차이를 만들어 낼 수 있다 → 규칙을 미리 정하고 민감도 분석을 붙인다.
5. **내부·외부 모멘트, 각도 부호 규약을 섞기** → 같은 사건이 반대 부호로 보여 교재·논문 비교가 엉킨다 → 축 정의, 부호, 내부/외부 관점을 그림마다 한 줄로 적는다.
6. **상관계수로 새 센서의 타당도를 주장** → r = 0.95여도 체계적 bias와 넓은 오차가 있을 수 있다 → Bland–Altman bias와 일치 한계, 미리 정한 허용 범위로 판단한다.
7. **변동성은 클수록 나쁘다고 단정** → 느린 뇌졸중 보행의 step width처럼 줄어든 변동성이 나쁜 신호일 수 있다 → 어느 변수·방향·과제의 변동성인지 함께 적는다.
8. **window 단위 정확도만 보고** → FOG 같은 드문 사건에서는 accuracy가 높아도 쓸모없을 수 있고, 장치로 이어지면 걸음당 오류가 안전을 정한다 → 정밀도·재현율, 삽화 단위 검출률, 검출 지연, 시간당 오경보를 함께 보고한다.

## 연구 설계 체크리스트

- [ ] 결과 변수와 필요한 측정 시스템이 질문에서 거꾸로 정해졌는가(지면반력이 필요한데 IMU만 쓰지 않는가)
- [ ] 표본 수를 **참가자 수**로 계산했는가(stride 수가 아니라)
- [ ] 보행 속도 조건(자기 선택/고정)과 속도의 군 간 균형 또는 공변량 계획이 있는가
- [ ] 연습 시행, 보행로 길이, 가감속 구간 제외, 회전 구간 처리 규칙이 있는가
- [ ] 약물 상태(PD on/off), 보조기·신발 착용 조건을 통제하고 기록했는가
- [ ] 필터·cutoff·이벤트 threshold·제외 규칙을 데이터를 보기 전에 정했는가
- [ ] 라벨(예: FOG 구간)의 기준, 평가자 수, 평가자 간 일치를 정했는가
- [ ] 새 측정법이라면 기준 방법과의 일치(Bland–Altman)와 반복 신뢰도(ICC, 95% CI)를 함께 계획했는가
- [ ] 모델을 만든다면 참가자 단위 분할과 fold 안 전처리를 계획했는가
- [ ] 다중 비교(여러 변수, 여러 관절·면)를 어떻게 보정하거나 탐색적으로 보고할지 정했는가

## 공개 데이터와 더 볼 곳

**공개 데이터**
- PhysioNet — Gait in Parkinson's Disease (gaitpdb) v1.0.0: https://physionet.org/content/gaitpdb/1.0.0/ — PD 93명·대조 73명, 양발 깔창 힘 센서 각 8개(수직력, 100 Hz), 일부 이중과제 보행. ODC-By 1.0, doi:10.13026/C24H3N.
- PhysioNet — Gait in Neurodegenerative Disease Database v1.0.0: https://physionet.org/content/gaitndd/1.0.0/ — PD 15명, 헌팅턴병 20명, ALS 13명, 대조 16명의 발 접촉 신호(force-sensitive resistor)와 stride 단위 시간 자료. ODC-By 1.0, doi:10.13026/C27G6C.
- UCI — Daphnet Freezing of Gait: https://archive.ics.uci.edu/dataset/245/daphnet+freezing+of+gait — PD 10명(8명에서 FOG)의 shank·thigh·hip 3축 가속도(mg, 64 Hz), FOG 라벨. CC BY 4.0, doi:10.24432/C56K78, 사용 시 Bächlin 2010 인용.
- Salomon 2024 경진대회 자료와 상위 코드: Zenodo [doi:10.5281/zenodo.10959560](https://doi.org/10.5281/zenodo.10959560) — 허리 가속도계 FOG 자료. 기록의 라이선스 표시는 CC BY 4.0이지만, 데이터 사용 조건은 직접 확인하고 쓴다.

**공식 문서·튜토리얼(무료·공개)**
- BMC — Notes on Scientific Computing for Biomechanics and Motor Control: https://github.com/BMClab/BMC , https://bmclab.github.io/BMC/ — 신호처리, 좌표계, 역동역학, EMG 노트북. 내용 CC BY 4.0, 코드 MIT, [doi:10.5281/zenodo.23654869](https://doi.org/10.5281/zenodo.23654869).
- OpenSim: https://opensim.stanford.edu/ — 근골격 모델링·시뮬레이션 공개 소프트웨어.
- spm1d: https://spm1d.org/ — 파형 전체를 검정하는 1차원 SPM의 Python 구현(Pataky 2012, [doi:10.1080/10255842.2010.527837](https://doi.org/10.1080/10255842.2010.527837)).

**핵심 리뷰·방법 논문(서지 확인함)**
- Mirelman A, et al. Gait impairments in Parkinson's disease. *Lancet Neurol*. 2019;18(7):697–708. [doi:10.1016/S1474-4422(19)30044-4](https://doi.org/10.1016/S1474-4422(19)30044-4)
- Nutt JG, et al. Freezing of gait: moving forward on a mysterious clinical phenomenon. *Lancet Neurol*. 2011;10(8):734–744. [doi:10.1016/S1474-4422(11)70143-0](https://doi.org/10.1016/S1474-4422(11)70143-0)
- Kuo AD, Donelan JM. Dynamic principles of gait and their clinical implications. *Phys Ther*. 2010;90(2):157–174. [doi:10.2522/ptj.20090125](https://doi.org/10.2522/ptj.20090125)
- Koo TK, Li MY. A guideline of selecting and reporting intraclass correlation coefficients for reliability research. *J Chiropr Med*. 2016;15(2):155–163. [doi:10.1016/j.jcm.2016.02.012](https://doi.org/10.1016/j.jcm.2016.02.012) (2017 정오표 [doi:10.1016/j.jcm.2017.10.001](https://doi.org/10.1016/j.jcm.2017.10.001))
- Bland JM, Altman DG. Statistical methods for assessing agreement between two methods of clinical measurement. *Lancet*. 1986;1(8476):307–310. PMID 2868172
- Salomon A, et al. A machine learning contest enhances automated freezing of gait detection and reveals time-of-day effects. *Nat Commun*. 2024;15:4853. [doi:10.1038/s41467-024-49027-0](https://doi.org/10.1038/s41467-024-49027-0)

**교재(서지와 장으로만)**: Perry & Burnfield, *Gait Analysis*, 2nd ed., SLACK 2010 · Richards & Levine (eds.), *Whittle's Gait Analysis*, 6th ed., Elsevier 2023 · Thomas, Zeni & Winter, *Winter's Biomechanics and Motor Control of Human Movement*, 5th ed., Wiley 2023 · Robertson et al., *Research Methods in Biomechanics*, 2nd ed., Human Kinetics 2014 · Rosen & Ferguson (eds.), *Wearable Robotics*, Academic Press 2020.

## 본 과정과의 연결

**심화 파트 I — 보행분석 실습 레슨(핵심만)**
- 보행 주기·기능 과제: [Day I1](../lessons/advanced/I-gait/day-I1.md), [Day I2](../lessons/advanced/I-gait/day-I2.md)
- 운동학·운동역학·EMG: [Day I3](../lessons/advanced/I-gait/day-I3.md), [Day I4](../lessons/advanced/I-gait/day-I4.md), [Day I5](../lessons/advanced/I-gait/day-I5.md)
- 측정 시스템과 IMU: [Day I8](../lessons/advanced/I-gait/day-I8.md), [Day I9](../lessons/advanced/I-gait/day-I9.md)
- 신호처리와 이벤트 검출: [Day I10](../lessons/advanced/I-gait/day-I10.md), [Day I11](../lessons/advanced/I-gait/day-I11.md), [Day I12](../lessons/advanced/I-gait/day-I12.md)
- 보행 변수와 신뢰도: [Day I13](../lessons/advanced/I-gait/day-I13.md), [Day I14](../lessons/advanced/I-gait/day-I14.md)
- 질환 보행과 FOG: [Day I16](../lessons/advanced/I-gait/day-I16.md), [Day I17](../lessons/advanced/I-gait/day-I17.md), [Day I18](../lessons/advanced/I-gait/day-I18.md), [Day I19](../lessons/advanced/I-gait/day-I19.md)
- 중재·웨어러블 로봇과 캡스톤: [Day I20](../lessons/advanced/I-gait/day-I20.md), [Day I21](../lessons/advanced/I-gait/day-I21.md)
- EEG·EMG·피부전도도까지 함께 쓰는 멀티모달 FOG 분석: [심화 K](../lessons/advanced/K-multimodal-fog/day-K1.md)(K1–K5)

**이론 노트(실습 없이 깊게)** — [이론 노트 목록](../lessons/advanced/I-gait-theory/index.md)
- [T01 보행 주기와 기능 과제](../lessons/advanced/I-gait-theory/note-T01.md) · [T02 운동학](../lessons/advanced/I-gait-theory/note-T02.md) · [T03 운동역학과 역동역학](../lessons/advanced/I-gait-theory/note-T03.md) · [T04 근육과 EMG](../lessons/advanced/I-gait-theory/note-T04.md) · [T05 에너지와 동역학적 보행](../lessons/advanced/I-gait-theory/note-T05.md) · [T06 보행의 신경 조절](../lessons/advanced/I-gait-theory/note-T06.md)
- [T07 균형·자세 제어와 협응](../lessons/advanced/I-gait-theory/note-T07.md) · [T08 측정 원리와 오차](../lessons/advanced/I-gait-theory/note-T08.md) · [T09 신호처리의 이론](../lessons/advanced/I-gait-theory/note-T09.md) · [T10 병적 보행의 원리와 임상 지표](../lessons/advanced/I-gait-theory/note-T10.md) · [T11 보행동결(FOG)](../lessons/advanced/I-gait-theory/note-T11.md) · [T12 보조기·의지·웨어러블 로봇](../lessons/advanced/I-gait-theory/note-T12.md)

**본 과정 레슨**
- [Day 23 — 시계열 기초](../lessons/week-4/day-23.md): 표본화, 필터, 3–8 Hz band-pass의 첫 예
- [Day 24 — PhysioNet 데이터 접근과 구조](../lessons/week-4/day-24.md): gaitpdb 파일 구조와 데이터 사전
- [Day 25 — participant-level QC](../lessons/week-4/day-25.md): 참가자 단위로 세고 점검하기
- [Day 26 — 기본 feature 추출](../lessons/week-4/day-26.md): 힘 threshold로 heel strike 잡기
- [Day 33 — GroupKFold와 데이터 누수](../lessons/week-5/day-33.md): 참가자 단위 검증
- [Day 34 — 평가 해석](../lessons/week-5/day-34.md): accuracy 너머의 지표와 오류 분석
- [Crash Course — 생리 신호 분석](physiology-signals.md): 연속 신호의 일반 흐름(전처리 → 구간 → feature → 참가자 단위 통계)

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
