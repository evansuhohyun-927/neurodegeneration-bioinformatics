# Day I20 — 중재와 웨어러블 로봇: 임상 근거는 어디까지이고, 실시간 제어는 무엇이 다른가

> **주차:** 심화 파트 I — 보행분석 (3주차) · **예상 시간:** 90분+ · **산출물:** `notebooks/advanced/I/I20_realtime_phase.ipynb`, `reports/advanced/I/I20_evidence_ladder.md` (중재별 근거 사다리 표)
>
> **먼저 끝내 둘 레슨:** [Day I10](day-I10.md)(필터와 위상), [Day I11](day-I11.md)(시간 정규화), [Day I12](day-I12.md)(gait event 검출), [Day I19](day-I19.md)(오경보와 지연). 선택: [심화 C — Day C2](../C-neural-signals/day-C2.md)(`filtfilt`와 위상 왜곡)
>
> **이론 노트:** [T12 — 보조기·의지·웨어러블 로봇](../I-gait-theory/note-T12.md)

## 오늘의 목표
- cueing(open-loop와 closed-loop)과 하지 외골격에 대해 "안전하게 쓸 수 있다", "효과가 있다", "현장에서 쓸모가 있다"를 구분해 각각의 근거 수준을 출처와 함께 말할 수 있다.
- 하지 외골격의 구성(분류, 제어 계층, 안전, 사람–장치 인터페이스)을 개관하고, 교재 각 장이 무엇을 다루고 무엇을 다루지 않는지 정확히 말할 수 있다.
- 실시간 시스템에서 `filtfilt`를 쓸 수 없는 이유를 지연 측정으로 보이고, 표본 하나씩 처리하는 stance/swing 상태기계와 두 가지 위상각(각도–각속도, 각도–시간적분)을 구현해 비교할 수 있다.

## 🎬 영상으로 먼저 보기

- [Amputee Experiment with Piecewise and Unified Control of a Powered Prosthetic Leg — Locomotor Control Systems Laboratory](https://www.youtube.com/watch?v=3tdpH6Ud7sE) (1:29)
- **무엇에 주목할까:** 오늘 읽을 [R] 24장 저자 연구실의 실험 영상입니다. 시작·정지가 많은 구간(접지 센서 기반 piecewise 위상)과 꾸준히 걷는 구간(unified 위상)이 어떻게 다른지 보세요. 대상은 외골격이 아니라 **대퇴 절단자의 동력 의지**입니다.

- [Cueing techniques for Freezing in Parkinsons Disease — NHS Tayside](https://www.youtube.com/watch?v=MmOi_sNwOdQ) (4:45)
- **무엇에 주목할까:** 물리치료 현장에서 쓰는 시각·청각·체감각 cue를 봅니다. 어떤 cue가 "항상 켜져 있는" open-loop이고, 어떤 것이 "필요할 때만" 주는 closed-loop가 될 수 있을지 분류해 보세요.

## 개념 설명

### cue는 누구에게, 어떤 과제에서 도움이 되나

**open-loop cueing**은 사람의 상태와 상관없이 일정한 박자나 표적을 계속 줍니다(메트로놈, 바닥의 가로선). **closed-loop cueing**은 센서가 상태를 판단해 필요할 때만 줍니다(Bächlin 2010의 FOG 검출 연동 cue, 뒤꿈치 접지 때마다 켜지는 레이저 신발). 근거를 "조건까지" 함께 읽어야 하는 대표 사례들입니다.

- **Hausdorff 2007(초록):** PD 29명, 대조 26명이 100 m를 걸었습니다. 평소 cadence의 **100%** 박자에서는 속도·stride length·swing time이 좋아졌지만 stride 변동성은 유의하게 변하지 않았고, **110%** 박자에서만 변동성이 줄었으며 그 효과가 2분 뒤와 15분 뒤에도 남아 있었습니다. 건강한 대조군은 RAS로 stride time 변동성이 오히려 **늘었습니다**. 장비·변화량 크기는 초록만으로 확인되지 않습니다.
- **보행 시작([W] 6장 p.113):** 보행 시작 과제에서는 바닥의 고대비 가로선이 도움이 되었고, 평균 step time에 맞춘 청각 리듬 cue는 효과가 없었다는 연구가 소개됩니다. 위 결과와 과제(지속 보행 대 시작)와 결과 변수가 달라 모순은 아닙니다.
- **지속 효과(Mirelman 2019):** cue의 이득은 주로 즉시 효과이고 장기 유지·전이는 약했으며, 간헐적 cue는 이득이 없었다는 연구를 인용합니다(한 문장 수준의 인용).
- **closed-loop(Bächlin 2010):** 효과 근거는 **설문뿐**입니다. FOG를 겪은 8명 중 5명이 횟수가 줄었다고 느꼈고, cue를 켠 세션과 끈 세션의 FOG를 객관적으로 비교한 수치는 없습니다. 특이도가 낮은 환자는 cue가 너무 자주 울린다고 답했습니다(Day I19의 오경보율과 연결).
- **웨어러블 cueing 개관(Gao 2020):** 대체로 유망하지만 실험실 밖·대규모 검증이 필요하다는 평가입니다. 뒤꿈치 접지로 켜지는 레이저 신발 연구(21명)처럼 gait event에 묶인 cue도 소개됩니다.

### 하지 외골격의 구성: 분류, 제어 계층, 안전

[R] 11장은 하지 외골격을 **보조(assistive)**, **재활(rehabilitation)**, **증강(augmentation)** 으로 나누고, 이 분류에 따라 제어 철학이 정반대가 된다고 설명합니다. 완전 마비용 보조 외골격은 따라갈 사람의 움직임이 없으니 미리 정한 궤적을 재생하고, 사용자는 "걷기·서기·앉기" 같은 고수준 명령만 줍니다. 증강용은 사람의 움직임을 따라가며 힘을 보탭니다. 보행 단계마다 동역학이 달라지므로 단계별로 다른 규칙을 쓰는 **유한 상태 기계(FSM)** 가 흔하고, 위치 편차를 힘으로 바꾸는 impedance, 힘을 위치로 바꾸는 admittance 제어, 필요한 만큼만 돕는 assist-as-needed가 소개됩니다. EMG 기반 제어는 도움을 많이 받을수록 근활동이 줄어 입력이 사라지는 구조적 한계가 있습니다([R] 11장).

교재 여러 장을 묶으면 제어는 세 층으로 볼 수 있습니다. **고수준**(지금 무엇을 하려는가: 걷기, 계단, 정지), **중간 수준**(주기의 어디에 있는가: stance/swing, 위상), **저수준**(원하는 토크를 실제로 내기). [R] 13장은 제목과 달리 대부분이 기계 설계(시험대, 스트랩, 관절, 센서, 재료)이고 제어는 두 쪽 남짓의 **저수준 토크 추종**(heel strike 기준 시간 인덱스, 500 Hz 갱신, 걸음마다 반복 오차를 배우는 iterative learning)입니다. 저자들은 iterative learning이 주기성에 기대므로 비정상 보행에서 효용이 떨어진다고 직접 밝힙니다. FOG처럼 주기가 깨지는 상황과 바로 연결되는 지점입니다.

**안전**은 [R] 14장이 다룹니다. 장의 절반은 커프와 피부 사이 마찰 물집(접촉 안전)이고, 나머지 절반이 낙상입니다. 낙상 실험은 **건강한 젊은 남성 9명**에게 보조 타이밍을 일부러 어긋나게 하는 방식이었고 실제 낙상은 0건이었습니다. 그래서 이 장이 준 것은 "낙상 위험의 크기"가 아니라 "낙상 유발 요인에 대한 반응 동작의 관찰"입니다. 더 중요한 교훈은 의도 추정의 trade-off입니다. 주기성을 가정하는 추정기는 지연 없이 미리 보조하지만 걸림 같은 급변에 늦고, 변화에 민감하게 만들면 오검출로 보조 패턴이 갑자기 바뀝니다([R] 14장). [R] 23장은 하루 수천 걸음이면 99.9% 정확도도 여러 번의 오류가 된다고 지적합니다. Day I19의 오경보 숫자가 로봇 제어에서는 곧 안전 문제입니다.

### 임상 근거는 어디까지인가

근거는 사다리처럼 읽습니다. **(1) 할 수 있다·안전하다(feasibility, safety)** → **(2) 통제된 비교에서 효과가 있다(efficacy)** → **(3) 실제 생활에서 쓸모가 있다(effectiveness)**. 한 단계의 근거를 다음 단계로 옮겨 말하면 과장이 됩니다.

| 질문 | 근거(출처) | 사다리 위치 |
|---|---|---|
| SCI 환자가 외골격으로 걸을 수 있나, 안전한가 | 통제된 환경과 훈련된 인력 아래에서 안전성이 확인됨. 인용된 리뷰(14개 연구 111명)에서 낙상 4.4%, 골절 3.4%([R] 15장) | (1) 조건부 |
| 외골격 훈련이 표준 치료보다 나은가 | 트레드밀 훈련이나 다른 고강도 로봇 훈련보다 낫다는 것은 아직 입증되지 않음. 인용된 Cochrane 분석: 전기기계 보조 훈련을 더하면 독립 보행 가능성은 늘었지만 보행 속도·능력은 유의하게 늘지 않음([R] 15장, 2018년 기준) | (2) 미확립 |
| 보행 가능한 만성 뇌졸중 환자의 속도·거리 개선 목적 | 진료지침(Hornby 2020)은 이 목적으로 로봇 보조 훈련·체중지지 트레드밀 훈련을 처방하지 말라고 권고([W] 6장 p.110) | (2) 부정적 권고 |
| 외골격으로 지역사회 보행이 되나 | 인용 리뷰(12개 연구 84명)의 평균 속도 약 0.26 m/s([R] 16장) 대 지역사회 보행의 통상 기준 0.8 m/s·500 m([R] 17장) | (3) 격차 큼 |
| PD에 외골격이 도움이 되나 | 진행 중 외골격 시험 56건 중 PD·CP·MS 대상은 6건뿐([R] 15장, 2018). 가벼운 착용형 외골격으로 PD 보행을 중재한 연구는 드묾(Guo 2022) | 근거 부재 |

같은 사실도 누가 읽느냐에 따라 결론이 달라집니다. [R] 16장은 ReWalk 소속 저자가 쓴 장으로, 약 90%가 SCI용 ReWalk의 임상·보험 논거이고 soft exosuit는 끝의 두 소절뿐입니다(강체와 soft의 공학적 비교는 [R] 4장·13장을 봐야 합니다). 이 장의 이상 사례 표는 낙상 0건이지만 [R] 15장이 인용한 리뷰는 4.4%입니다. 대상 연구와 저자의 이해관계가 다르기 때문입니다. [R] 15장 저자들은 대조군 없는 연구가 많고, 착용을 눈가림할 수 없으며, 급성기에는 자연 회복과 중재 효과를 가르기 어렵다는 점을 근거가 제한적인 이유로 듭니다. 또 외골격 전용 결과 지표가 없고 10MWT·6MWT 같은 기존 지표가 설계 피드백을 줄 만큼 민감하지 않다고 봅니다. 보행분석 변수(Day I13)가 그 빈자리를 채울 후보입니다.

### 국내 사례 두 가지: 범위를 정확히

- **WalkON Suit([R] 12장):** 국내 팀이 완전 하반신 마비 사용자 한 명을 위해 만든 동력 외골격으로 Cybathlon 2016 외골격 경기에서 동메달을 받았습니다. 신발 접지 센서로 stance/swing을 가르고, stance에서는 낮은 이득, swing에서는 앞먹임과 적분 항을 켜는 **단계별 이득 전환**을 씁니다. 6개월 훈련 가운데 기립·균형 훈련이 세브란스병원에서 이루어졌다고 적혀 있습니다. 최고 속도는 약 0.30 m/s로, **한 명의 사례 보고**입니다.
- **뉴시스 2026-06-16 보도:** 범부처 의료기기 연구개발 과제로, 세브란스병원·강남세브란스병원 재활의학과가 임상시험 설계, 환자 모집·평가, 로봇의 사용성·안전성 검증을 맡아 2026–2032년 **양방향 뇌–AI–로봇 연동 의료기기**를 개발한다는 내용입니다. 대상은 **사지마비 환자(경수 손상, ALS 등)** 이고, 뇌에 전극을 넣는 **침습형 뇌–컴퓨터 인터페이스**와 전신형 외골격을 잇는 과제입니다. 보행 보조 로봇이나 PD·FOG 중재 사례가 아니며, 아직 개발 초기 단계라 임상 효과에 관한 결과는 없습니다.

### 실시간 제약: 미래를 볼 수 없다

오프라인 분석에서는 `filtfilt`로 위상 지연 없이 거르고, heel strike를 다 찾은 뒤 주기를 0–100%로 정규화합니다(Day I10, I11). 로봇과 cue 장치는 **지금까지의 표본**만으로 판단해야 합니다. 한 방향 필터는 지연을 남기고(예시 1), window를 길게 잡으면 스펙트럼은 좋아지지만 반응이 늦어집니다. Bächlin 2010 V-C절은 window를 0.25–8초로 바꿔 보며 이 trade-off를 보였고, 최적은 약 4.5초였습니다.

주기 안의 위치를 연속값으로 추정하는 **phase variable**도 같은 제약을 받습니다. [RM] 13장의 위상각은 각도(가로축)와 각속도(세로축)를 **주기 전체의 최솟값·최댓값으로 정규화**한 평면에서 atan2로 구하는 협응 분석용 **오프라인** 방법이며(pp.304–305), 이 평면에서 궤도는 시계 방향으로 돌아 각이 시간에 따라 줄어듭니다. [R] 24장은 외골격이 아니라 **대퇴 절단자용 동력 의지**에서, 허벅지 각도와 **그 시간 적분**을 두 축으로 하는 평면에서 위상을 구합니다. 각속도를 쓰면 제어 이론의 relative degree가 낮아져 PD 제어의 미분 항을 쓸 수 없게 되기 때문이라고 설명합니다. 적분은 heel strike마다 0으로 되돌리고, 축의 배율은 **지난 주기** 정보로 갱신합니다. 시작·정지나 비주기 동작에서는 접지 센서로 stance/swing을 나눈 piecewise 위상으로 돌아갑니다. 실험 대상은 절단자 3명이었고, 이상치 기준으로 전체 시행 자료의 27.46%를 걸러 낸 결과라는 점도 함께 읽어야 합니다([R] 24장).

## 예시로 이해하기

> 오늘의 예시 신호는 모두 코드 안에서 만든 **가상 자이로·각도 신호**입니다. 숫자는 가정에 따라 달라지며 실제 센서·사람의 성능이 아닙니다.

### 예시 1 — 한 방향 필터와 `filtfilt`의 지연

```python
import numpy as np
from scipy import signal

fs = 100                                   # 가상 shank 자이로 표본화 주파수(Hz)
rng = np.random.default_rng(20)

def shank_gyro(n_strides=20, T=1.1, fs=100):
    """가상 shank 시상면 각속도(deg/s)와 실제 IC·toe-off 시각. 주기마다 길이가 조금 다르다."""
    w, ic, to, t0 = [], [], [], 0.0
    for _ in range(n_strides):
        Ti = T * (1 + rng.normal(0, 0.03))
        ph = np.arange(0, Ti, 1 / fs) / Ti                    # 이 stride 안의 0–1 위상
        g = -15 * np.sin(2 * np.pi * ph)                       # stance 동안 느린 변화
        g += -90 * np.exp(-((ph - 0.58) / 0.03) ** 2)          # toe-off 직전 음의 골
        sw = (ph >= 0.62)
        g[sw] += 330 * np.sin(np.pi * (ph[sw] - 0.62) / 0.38) ** 1.5   # swing: 큰 양의 봉우리
        g += -140 * np.exp(-((ph - 0.015) / 0.012) ** 2)       # IC 직후 짧은 음의 골
        ic.append(t0); to.append(t0 + 0.62 * Ti)
        w.append(g); t0 += len(ph) / fs
    return np.concatenate(w), np.array(ic), np.array(to)

clean, ic_true, to_true = shank_gyro()
gyro = clean + rng.normal(0, 12, len(clean))               # 센서 잡음을 더한 "측정값"
sos = signal.butter(4, 6, fs=fs, output="sos")             # 4차 Butterworth 저역통과 6 Hz

causal = signal.sosfilt(sos, gyro)                          # lfilter와 같은 한 방향(과거만 사용)
zero_phase = signal.sosfiltfilt(sos, gyro)                  # filtfilt: 앞뒤로 두 번(미래도 사용)

def peak_times(x):
    """mid-swing 봉우리(가장 큰 양의 값) 시각을 stride마다 찾는다."""
    pk, _ = signal.find_peaks(x, height=150, distance=int(0.6 * fs))
    return pk / fs

ref = peak_times(clean)                                    # 잡음 없는 원 신호의 봉우리 = 정답
for name, x in [("필터 없음", gyro), ("한 방향(sosfilt)", causal), ("앞뒤(sosfiltfilt)", zero_phase)]:
    lag = (peak_times(x) - ref) * 1000
    print(f"{name:16s} mid-swing 봉우리 시각 오차: 평균 {lag.mean():6.1f} ms, SD {lag.std():5.1f} ms")

# 같은 필터의 주파수별 지연(group delay): 보행 신호의 주성분 근처에서
w, gd = signal.group_delay(signal.butter(4, 6, fs=fs), w=[1, 2, 3], fs=fs)
for f_, d in zip(w, gd):
    print(f"  {f_:.0f} Hz 성분의 지연 ≈ {1000 * d / fs:.0f} ms")

# 실시간이라면? 지금까지 받은 표본만으로 filtfilt를 매번 다시 돌리면 '끝 부분'이 매번 달라진다
now = int(5.0 * fs)
offline_value = zero_phase[now]
online_value = signal.sosfiltfilt(sos, gyro[: now + 1])[-1]
print(f"t=5.00 s의 값 — 전체 기록으로 filtfilt: {offline_value:6.1f} | 그 시점까지로 filtfilt: {online_value:6.1f} deg/s")
```

실행 결과:

```text
필터 없음            mid-swing 봉우리 시각 오차: 평균    1.0 ms, SD  15.8 ms
한 방향(sosfilt)    mid-swing 봉우리 시각 오차: 평균   70.0 ms, SD   5.5 ms
앞뒤(sosfiltfilt)  mid-swing 봉우리 시각 오차: 평균    0.5 ms, SD   5.0 ms
  1 Hz 성분의 지연 ≈ 69 ms
  2 Hz 성분의 지연 ≈ 72 ms
  3 Hz 성분의 지연 ≈ 79 ms
t=5.00 s의 값 — 전체 기록으로 filtfilt:   -1.0 | 그 시점까지로 filtfilt:  -24.5 deg/s
```

필터는 잡음에 의한 흔들림(SD 15.8 → 약 5 ms)을 줄입니다. 한 방향 필터는 대신 약 70 ms 늦고, 그 값은 group delay 계산과 맞습니다. `filtfilt`는 지연이 없지만 미래 표본을 쓰므로, 같은 시각의 값이 "그 이후 자료를 얼마나 봤는가"에 따라 −1.0에서 −24.5 deg/s로 달라집니다. 실시간 장치는 이 마지막 줄의 상황에 놓여 있습니다.

### 예시 2 — 표본 하나씩 처리하는 stance/swing 상태기계

예시 1의 셀을 먼저 실행합니다. 상태기계는 미래 표본을 쓰지 않습니다. stance에서 각속도가 +100 deg/s를 넘으면 swing으로, swing 봉우리를 지난 뒤 −40 deg/s 아래로 꺾이면 IC로 보고 stance로 돌아갑니다. 전환 직후 0.25초는 판정하지 않습니다(같은 사건을 두 번 세지 않게).

```python
# 예시 1의 셀을 먼저 실행해 clean, gyro, ic_true, to_true, sos, fs가 있어야 한다.
import numpy as np
from scipy import signal

class StanceSwingFSM:
    """표본을 하나씩 받아 stance/swing을 판정하는 상태기계(미래 표본을 쓰지 않는다)."""
    def __init__(self, sos, fs, on_thr=100.0, ic_thr=-40.0, refractory=0.25, use_filter=True):
        self.sos, self.fs, self.use_filter = sos, fs, use_filter
        self.zi = signal.sosfilt_zi(sos) * 0.0          # 필터 내부 상태(처음엔 0)
        self.on_thr, self.ic_thr, self.refr = on_thr, ic_thr, refractory
        self.state, self.t_last, self.n = "STANCE", -1.0, 0
        self.peak = 0.0
        self.events = []                                   # (시각, "swing" 또는 "IC")

    def update(self, x):
        t = self.n / self.fs; self.n += 1
        if self.use_filter:
            y, self.zi = signal.sosfilt(self.sos, [x], zi=self.zi)   # 한 표본만 거른다
            x = y[0]
        if self.state == "SWING":
            self.peak = max(self.peak, x)                  # swing 중 가장 큰 각속도를 기억
        if t - self.t_last < self.refr:                   # 전환 직후 잠깐은 판정하지 않는다
            return self.state
        if self.state == "STANCE" and x > self.on_thr:     # 큰 양의 각속도 → swing 진행 중
            self.state, self.t_last, self.peak = "SWING", t, x
            self.events.append((t, "swing"))
        elif self.state == "SWING":
            if self.peak > 200 and x < self.ic_thr:          # 봉우리를 지나 음으로 꺾이면 IC
                self.state, self.t_last = "STANCE", t
                self.events.append((t, "IC"))
        return self.state

def evaluate(fsm_events, true_times, kind, tol=0.3):
    det = np.array([t for t, k in fsm_events if k == kind])
    err, used = [], set()
    for tt in true_times[1:]:                              # 첫 stride는 필터가 자리 잡는 구간이라 뺀다
        cand = det[(det >= tt - 0.05) & (det <= tt + tol)]
        if len(cand):
            err.append(cand[0] - tt); used.add(cand[0])
    extra = sum(1 for d in det if d not in used and d > true_times[1] - 0.05)
    return 1000 * np.mean(err), 1000 * np.std(err), len(err), len(true_times) - 1, extra

noisy = clean + np.random.default_rng(7).normal(0, 40, len(clean))   # 잡음이 큰 센서를 가정
for name, data, use_f in [("잡음 작음, 필터 없음", gyro, False), ("잡음 작음, 한 방향 6 Hz", gyro, True),
                          ("잡음 큼, 필터 없음", noisy, False), ("잡음 큼, 한 방향 6 Hz", noisy, True)]:
    fsm = StanceSwingFSM(sos, fs, use_filter=use_f)
    states = [fsm.update(v) for v in data]                 # 스트림처럼 한 표본씩
    m_to = evaluate(fsm.events, to_true, "swing")
    m_ic = evaluate(fsm.events, ic_true, "IC")
    print(f"[{name}] swing 판정: 실제 toe-off보다 평균 {m_to[0]:.0f} ms 늦음(SD {m_to[1]:.0f}), "
          f"{m_to[2]}/{m_to[3]} 검출, 여분 {m_to[4]}회")
    print(f"[{name}] IC 판정    : 실제 IC보다 평균 {m_ic[0]:.0f} ms 늦음(SD {m_ic[1]:.0f}), "
          f"{m_ic[2]}/{m_ic[3]} 검출, 여분 {m_ic[4]}회")
```

실행 결과:

```text
[잡음 작음, 필터 없음] swing 판정: 실제 toe-off보다 평균 58 ms 늦음(SD 5), 19/19 검출, 여분 0회
[잡음 작음, 필터 없음] IC 판정    : 실제 IC보다 평균 6 ms 늦음(SD 5), 19/19 검출, 여분 0회
[잡음 작음, 한 방향 6 Hz] swing 판정: 실제 toe-off보다 평균 130 ms 늦음(SD 3), 19/19 검출, 여분 0회
[잡음 작음, 한 방향 6 Hz] IC 판정    : 실제 IC보다 평균 77 ms 늦음(SD 6), 19/19 검출, 여분 0회
[잡음 큼, 필터 없음] swing 판정: 실제 toe-off보다 평균 51 ms 늦음(SD 13), 16/19 검출, 여분 3회
[잡음 큼, 필터 없음] IC 판정    : 실제 IC보다 평균 4 ms 늦음(SD 7), 19/19 검출, 여분 1회
[잡음 큼, 한 방향 6 Hz] swing 판정: 실제 toe-off보다 평균 144 ms 늦음(SD 39), 19/19 검출, 여분 0회
[잡음 큼, 한 방향 6 Hz] IC 판정    : 실제 IC보다 평균 88 ms 늦음(SD 40), 16/19 검출, 여분 3회
```

읽는 법: swing 판정은 각속도가 threshold를 넘을 때까지 기다리므로 필터 없이도 실제 toe-off보다 약 60 ms 늦습니다(규칙 자체의 지연). 필터를 더하면 약 70 ms가 더 붙습니다. 잡음이 크면 필터 없는 쪽은 여분 판정(가짜 swing)이 생기고, 필터 쪽은 지연이 커지고 흔들려 일부 IC가 허용 범위(0.3초)를 벗어납니다. 공짜 점심은 없습니다. 이 오류들은 [R] 14장이 말한 "보조 타이밍 어긋남"의 원인이 됩니다.

### 예시 3 — 두 가지 위상각: 각도–각속도(오프라인) 대 각도–시간적분(실시간)

가상 허벅지 각도로 두 방법을 비교합니다. (A)는 [RM] 13장처럼 주기 전체의 최솟값·최댓값으로 정규화하므로 **그 주기가 끝나야** 계산할 수 있습니다. (B)는 [R] 24장의 발상을 단순화한 것으로, 지난 주기의 평균과 배율만 쓰고 적분은 heel strike마다 0으로 되돌립니다. 여기서는 heel strike 시각을 정답으로 주었습니다(실제로는 예시 2 같은 검출기나 접지 센서가 필요).

```python
import numpy as np

fs = 100
rng = np.random.default_rng(21)

# 가상 허벅지(thigh) 각도(°): IC 무렵 굴곡 최대, stance 후반 신전 최대인 코사인 비슷한 모양 + 2배음
T_list = np.r_[np.full(10, 1.10), np.linspace(1.10, 0.90, 5), np.full(10, 0.90)]   # 중간에 빨라진다
pieces, phases, hs, n = [], [], [], 0
for T in T_list:
    ph = np.arange(0, T, 1 / fs) / T                 # 이 stride의 실제 위상 0→1
    pieces.append(5 + 20 * np.cos(2 * np.pi * ph) + 3 * np.cos(4 * np.pi * ph - 0.8))
    phases.append(ph); hs.append(n); n += len(ph)
clean, true_phase, hs = np.concatenate(pieces), np.concatenate(phases), np.array(hs)  # hs = heel strike 표본 번호
noise = rng.normal(0, 1, len(clean))
ends = np.r_[hs[1:], len(clean)]

def wrap_err(est, true):
    """원형 오차(주기 단위): 0.98과 0.02의 차이는 0.04다."""
    return (est - true + 0.5) % 1 - 0.5

def compare(sd):
    theta = clean + sd * noise                        # 각도 측정 잡음 sd(°)
    # (A) 각도–각속도 평면([RM] 13장 방식): 그 주기 전체의 min/max로 정규화 → 오프라인
    omega = np.gradient(theta, 1 / fs)                # 각속도(deg/s) — 미분은 잡음을 키운다
    phiA = np.zeros_like(theta)
    for a, b in zip(hs, ends):
        th, om = theta[a:b], omega[a:b]
        thn = 2 * (th - th.min()) / (th.max() - th.min()) - 1      # −1 … +1
        omn = om / np.abs(om).max()
        phiA[a:b] = np.arctan2(omn, thn)              # 이 평면에서는 시간이 가면 각이 '줄어든다'
    phaseA = (-phiA / (2 * np.pi)) % 1                # 부호를 뒤집어 0→1로 늘게

    # (B) 각도–시간적분 평면([R] 24장 방식): 지난 주기 정보만 쓰므로 실시간 계산 가능
    phaseB = np.full_like(theta, np.nan)
    offset, k = None, None
    for a, b in zip(hs, ends):
        if offset is not None:
            thc = theta[a:b] - offset                 # 지난 주기 평균을 빼 적분이 0 근처로 끝나게
            integ = np.cumsum(thc) / fs               # heel strike마다 적분을 0으로 리셋
            if k is not None:
                phaseB[a:b] = (np.arctan2(k * integ, thc) % (2 * np.pi)) / (2 * np.pi)
            k = np.ptp(thc) / np.ptp(integ)           # 다음 주기에 쓸 배율(두 축의 크기 맞추기)
        offset = theta[a:b].mean()

    ok = np.arange(len(theta)) >= hs[2]              # 두 방법 모두 셋째 주기부터 비교
    for name, est in [("A 각도–각속도, 오프라인 정규화", phaseA), ("B 각도–적분, 실시간", phaseB)]:
        e = wrap_err(est[ok], true_phase[ok])
        e = e - np.median(e)                          # 방법마다 다른 고정 오프셋은 빼고 '모양'만 비교
        print(f"잡음 {sd}° | {name}: 위상 오차 RMS {100 * np.sqrt(np.mean(e ** 2)):.1f} %GC, "
              f"최대 {100 * np.abs(e).max():.1f} %GC")

for sd in [0.0, 0.3, 1.0]:
    compare(sd)
```

실행 결과:

```text
잡음 0.0° | A 각도–각속도, 오프라인 정규화: 위상 오차 RMS 3.8 %GC, 최대 7.0 %GC
잡음 0.0° | B 각도–적분, 실시간: 위상 오차 RMS 1.1 %GC, 최대 2.4 %GC
잡음 0.3° | A 각도–각속도, 오프라인 정규화: 위상 오차 RMS 4.4 %GC, 최대 15.9 %GC
잡음 0.3° | B 각도–적분, 실시간: 위상 오차 RMS 1.1 %GC, 최대 3.1 %GC
잡음 1.0° | A 각도–각속도, 오프라인 정규화: 위상 오차 RMS 7.8 %GC, 최대 46.3 %GC
잡음 1.0° | B 각도–적분, 실시간: 위상 오차 RMS 1.2 %GC, 최대 4.7 %GC
```

읽는 법과 단서:
- 잡음이 없을 때도 A의 오차가 있는 것은 각도 곡선에 2배음이 있어 궤도가 원이 아니기 때문입니다. 위상각이 시간에 비례하려면 신호가 정현파에 가까워야 한다는 [RM] 13장의 지적(p.303)과 같은 현상입니다.
- 잡음이 커질수록 A가 나빠지는 것은 미분이 고주파 잡음을 키우기 때문입니다(Day I10). 적분은 반대로 잡음을 누릅니다. 다만 적분은 오프셋이 조금만 틀려도 누적되는 **드리프트**가 생겨, [R] 24장은 heel strike 리셋과 주기마다의 점진 보정을 씁니다.
- 이 비교는 "B가 언제나 낫다"는 증거가 아닙니다. B는 정답 heel strike와 꾸준한 주기를 전제로 했습니다. 시작·정지, 비대칭 보행, FOG처럼 주기가 깨지면 B도 무너지고, 그래서 [R] 24장은 접지 센서 기반 piecewise 위상으로 돌아가는 경로를 둡니다. A는 협응 분석용 오프라인 방법이라 실시간 제어용으로 만들어진 것이 아닙니다.

## 직접 해보기

1. **근거 사다리 표:** `reports/advanced/I/I20_evidence_ladder.md`에 중재 6개 이상(RAS 100%, RAS 110%, 보행 시작의 시각 cue, FOG 검출 연동 cue, SCI 외골격, 뇌졸중 로봇 보조 훈련, PD 외골격)을 행으로, 열은 `대상 | 결과 변수 | 사다리 단계(안전/효과/현장) | 근거 | 출처와 시점 | 저자 이해관계`로 채웁니다. [R] 15장과 16장이 같은 질문에 다른 결론을 내는 행을 하나 이상 넣습니다.
2. **국내 사례 한 단락:** WalkON Suit와 뉴시스 보도 과제를 대상(누구), 장치(무엇), 근거 단계(어디까지)로 나눠 세 줄씩 씁니다. 기사 문장을 옮기지 말고 자기 말로 씁니다.
3. `notebooks/advanced/I/I20_realtime_phase.ipynb`에서 예시 1–3을 실행합니다. 예시 1에서 cutoff를 3 Hz와 10 Hz로 바꿔 지연과 잡음 흔들림(SD)이 어떻게 바뀌는지 표로 적습니다.
4. 예시 2의 `on_thr`를 60, 100, 150으로 바꿔 swing 판정 지연과 여분 판정 수의 trade-off를 표로 적습니다. [R] 14장의 "둔감하면 늦고, 민감하면 오검출" 문장과 연결해 한 줄 해석을 씁니다.
5. 예시 3에 "얼어붙은 3초"를 넣어 봅니다: 15번째 stride 뒤에 각도가 거의 일정하고 작은 5 Hz 떨림(진폭 1°)만 있는 3초 구간을 삽입하고, 두 위상 추정이 이 구간에서 어떻게 행동하는지 그림으로 봅니다. 이 결과가 FOG 탐지(Day I19)와 로봇 제어를 왜 함께 설계해야 하는지에 대해 두 줄을 씁니다.
6. 예시 3 (B)에서 heel strike 시각에 ±50 ms 무작위 오차를 넣으면 위상 오차가 얼마나 커지는지 확인합니다(event 검출 오차가 위상 추정으로 번지는 경로).

⚠️ **흔한 오류 1 — 실시간 성능을 `filtfilt`로 평가하기.** 오프라인에서 `filtfilt`로 거른 신호로 상태기계를 시험하면 지연이 0처럼 보입니다. 실제 장치와 같은 조건(한 방향 필터, 표본 하나씩)으로 평가해야 합니다.

⚠️ **흔한 오류 2 — "외골격이 보행을 개선한다"로 뭉뚱그리기.** 대상(SCI, 뇌졸중, PD), 목적(대체 보행, 재활 훈련), 결과 변수(독립 보행, 속도, 거리), 시점(2018년 기준 리뷰)을 붙이지 않은 문장은 사다리의 어느 단계인지 알 수 없습니다.

## 퀴즈

**1.** Hausdorff 2007의 RAS 결과로 맞는 것은?
(a) 100%와 110% 모두 PD의 변동성을 줄였다 (b) 110%에서만 PD의 변동성이 줄었고 2분·15분 뒤에도 유지됐으며, 대조군은 변동성이 늘었다 (c) 대조군에서도 변동성이 줄었다

<details><summary>정답 보기</summary>

**(b)**. 100% 박자에서는 속도·stride length·swing time만 좋아졌고 변동성은 유의하게 변하지 않았습니다. "RAS가 변동성을 줄인다"는 일반화는 조건을 빼먹은 문장입니다.

</details>

**2.** [R] 14장의 낙상 실험에서 낙상이 0건이었습니다. "외골격의 낙상 위험은 낮다"고 결론 내려도 됩니까?

<details><summary>정답 보기</summary>

**아니요.** 대상이 건강한 젊은 남성 9명이었고 안전 장구를 갖춘 환경이었습니다. 이 실험은 보조 타이밍 어긋남 같은 낙상 유발 요인에 대한 **반응 동작을 관찰**한 것이지, 실제 사용자 집단의 낙상률을 잰 것이 아닙니다.

</details>

**3.** 뉴시스 2026-06-16 보도의 과제를 "세브란스병원이 참여하는 파킨슨병 보행 로봇 개발"로 소개하면 무엇이 틀립니까?

<details><summary>정답 보기</summary>

대상이 **사지마비 환자(경수 손상, ALS 등)** 이고, 침습형 뇌–컴퓨터 인터페이스와 전신형 외골격을 잇는 과제입니다. PD나 보행 보조가 주제가 아니며, 재활의학과의 역할은 임상시험 설계와 사용성·안전성 검증입니다. 아직 효과에 관한 결과도 없습니다.

</details>

**4.** [R] 24장이 phase variable에 각속도 대신 각도의 시간 적분을 쓰는 이유는 무엇이고, 그 대가는 무엇입니까?

<details><summary>정답 보기</summary>

각속도를 쓰면 제어 출력의 relative degree가 1로 떨어져 PD 제어의 미분 항을 쓸 수 없게 되기 때문입니다(미분이 잡음을 키우는 문제도 예시 3에서 보았습니다). 대가는 적분의 **드리프트**로, heel strike마다 적분을 0으로 되돌리고 주기마다 각도 오프셋을 조금씩 보정합니다.

</details>

**5.** 실시간 FOG 검출에서 window를 8초로 늘리면 무엇이 좋아지고 무엇이 나빠집니까? (Bächlin 2010 V-C)

<details><summary>정답 보기</summary>

주파수 해상도가 좋아지고 스펙트럼 누설이 줄어 판정이 안정되지만, 반응이 늦어져 짧은 삽화를 놓치거나 늦게 잡습니다. Bächlin은 0.25–8초를 비교해 약 4.5초가 최적이었다고 보고합니다. Day I17에서 본 것처럼 Daphnet 삽화의 약 40%는 4초보다 짧습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `reports/advanced/I/I20_evidence_ladder.md`: 중재 6행 이상, 사다리 단계·출처·시점·이해관계 열.
- [ ] 국내 사례 두 가지를 대상·장치·근거 단계로 정리(기사 문장 옮기지 않음).
- [ ] `notebooks/advanced/I/I20_realtime_phase.ipynb`: 예시 1–3 실행, cutoff·threshold 바꾸기 표.
- [ ] "얼어붙은 3초" 실험 그림과 두 줄 해석.
- [ ] heel strike 오차가 위상 오차로 번지는 실험 결과 한 줄.

## 더 읽을거리
- [R] Rosen J, Ferguson PW, eds. *Wearable Robotics: Systems and Applications*. Academic Press; 2020. 11장(하지 외골격 개관, 필수), 12장(WalkON Suit), 13장(설계, 저수준 제어), 14장(안전), 15장(재활 임상 근거, 2018년 기준), 16장(ReWalk·exosuit, 제조사 저자), 17장(지역사회 보행 기준), 23장(하지 의지 제어 분류, 걸음당 오류), 24장(unified phase variable, 대퇴 의지).
- [RM] Robertson DGE, et al. *Research Methods in Biomechanics*. 2nd ed. Human Kinetics; 2014. 13장 Dynamical Systems Analysis of Coordination, pp.296–307(핵심 pp.303–305: 정규화와 위상각).
- [W] Richards J, Levine D, eds. *Whittle's Gait Analysis*. 6th ed. Elsevier; 2023. 6장 p.110(뇌졸중 훈련 지침), pp.112–114(PD 보행 시작과 cue).
- Hausdorff JM, Lowenthal J, Herman T, et al. Rhythmic auditory stimulation modulates gait variability in Parkinson's disease. *Eur J Neurosci*. 2007;26(8):2369–2375. doi:[10.1111/j.1460-9568.2007.05810.x](https://doi.org/10.1111/j.1460-9568.2007.05810.x) (초록)
- Bächlin M, et al. Wearable assistant for Parkinson's disease patients with the freezing of gait symptom. *IEEE Trans Inf Technol Biomed*. 2010;14(2):436–446. doi:[10.1109/TITB.2009.2036165](https://doi.org/10.1109/TITB.2009.2036165) — IV-C(설문), V-C(지연)
- Gao C, et al. Freezing of gait in Parkinson's disease: pathophysiology, risk factors and treatments. *Transl Neurodegener*. 2020;9:12. doi:[10.1186/s40035-020-00191-5](https://doi.org/10.1186/s40035-020-00191-5) (웨어러블 cueing)
- Guo Y, et al. Detection and assessment of Parkinson's disease based on gait analysis: a survey. *Front Aging Neurosci*. 2022;14:916971. doi:[10.3389/fnagi.2022.916971](https://doi.org/10.3389/fnagi.2022.916971) — 5.4절(로봇 보조 보행 훈련)
- 뉴시스. "'뇌 신호로 작동'…사지마비 환자용 로봇 만든다". 2026-06-16. <https://www.newsis.com/view/NISX20260616_0003670839>
- 이론 노트: [T12 — 보조기·의지·웨어러블 로봇](../I-gait-theory/note-T12.md)

---
[← 이전](day-I19.md) · [코스 지도](../../../README.md) · [다음 →](day-I21.md)
