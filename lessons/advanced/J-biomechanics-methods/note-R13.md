# R13 — Dynamical Systems Analysis of Coordination: 협응과 변동성을 relative phase와 vector coding으로 재기

> **교재 노트** · 심화 파트 J — 생체역학 연구방법 · **교재:** [RM] 13장 pp.291–316 · **읽는 시간:** 55–65분 · **함께 읽기:** [T07 균형·자세 제어와 협응](../I-gait-theory/note-T07.md), [Day I13](../I-gait/day-I13.md)

## 이 노트로 이해할 것
- 협응(coordination)을 "자유도를 묶는 일"로 보는 관점과, order parameter·control parameter·attractor라는 dynamical systems의 기본 어휘.
- 변동성(variability)이 잡음만은 아니라는 주장의 근거와 그 한계(대부분 후향적 연구).
- state space의 세 가지 그림(시계열, angle-angle, phase plane)과 point·limit-cycle·chaotic attractor.
- relative phase 계열 다섯 방법(DRP, multifrequency DRP, CRP, relative Fourier phase, Hilbert transform)의 계산 절차와 전제.
- vector coding의 coupling angle, circular statistics로 평균 내는 법, 네 가지 협응 패턴 분류.
- 협응 변동성은 주기 전체의 표준편차가 아니라 주기 간(between-cycle) 표준편차로 재야 한다는 것.

## 🎬 함께 보면 좋은 영상
- [ISBS 2020: Hannah Eve Wyatt COORDINATION VARIABILITY IN OVERGROUND RUNNING + WALKING AT PREFERRED .. — ISBS](https://www.youtube.com/watch?v=Bea1SuL6bb4)
- [Variability, stability, complexity and adaptability - Prof. Joseph Hamill — Neuromech TV](https://www.youtube.com/watch?v=cAsbF1LUqCQ)
- **무엇에 주목할까:** 걷기와 달리기에서의 협응 변동성을 다룬 학회 발표와, 변동성·안정성·복잡성·적응성을 주제로 한 Joseph Hamill 교수의 강연입니다. 강연은 약 90분으로 길지만 이 장의 주제를 직접 다루므로 나누어 보시기를 권합니다.

## 핵심 질문
1. 두 분절의 "협응"을 숫자 하나 또는 곡선 하나로 나타내려면 무엇을 재야 하는가?
2. 변동성이 크면 나쁜 것인가, 작으면 좋은 것인가?
3. 좁은 띠 모양의 phase plane 궤적만으로 limit-cycle attractor라고 말할 수 있는가?
4. CRP를 계산할 때 정규화를 건너뛰면 무슨 일이 생기고, CRP로 "누가 먼저 움직이는지"를 말할 수 있는가?
5. 각도의 평균을 산술평균으로 내면 왜 틀릴 수 있는가?
6. 내 자료에는 DRP, CRP, vector coding 가운데 무엇이 맞는가?

## 교재 절 지도

대문자 제목은 큰 절, 나머지는 소절(들여쓴 것은 그 아래 단계)입니다. 쪽은 인쇄 쪽 번호입니다.

| 교재 절 (원제) | 쪽 | 이 노트 |
|---|---|---|
| (도입부, 제목 없음) | 291 | 본문 1 |
| MOVEMENT COORDINATION | 291 | 본문 1 |
| Degrees of Freedom | 291–292 | 본문 1 |
| Oscillatory Movement Dynamics | 292–293 | 본문 2 |
| Movement Stability and Transitions | 293 | 본문 2 |
| Variability and Coordination | 293–296 | 본문 3 |
| FOUNDATIONS FOR COORDINATION ANALYSIS | 296 | 본문 4 |
| The State Space | 296–297 | 본문 4 |
| Attractors in State Space | 297–298 | 본문 4 |
| QUANTIFYING COORDINATION: RELATIVE PHASE METHODS | 298–299 | 본문 5 |
| Discrete Relative Phase | 299–300 | 본문 5 |
| Discrete Relative Phase and Multifrequency Coordination | 300–303 | 본문 6 |
| From the Scientific Literature (Diedrich & Warren 1995, 상자글) | 300 | 본문 5 |
| Continuous Relative Phase | 303–304 | 본문 7 |
| · Construction of the Phase Plane | 304 | 본문 7 |
| · Normalization of State Variables | 304–305 | 본문 7 |
| · Calculation of the Phase Angle and Relative Phase | 305–306 | 본문 7 |
| · Dependent Measures Derived From a CRP Analysis | 306 | 본문 8 |
| · Assessment of Coordination Variability Based on CRP Analysis | 306–307 | 본문 8 |
| Alternative Measures of Relative Phase | 307 | 본문 9 |
| · Relative Fourier Phase | 308–309 | 본문 9 |
| From the Scientific Literature (Miller 외 2008, 상자글) | 308 | 본문 8 |
| · The Hilbert Transform | 309 | 본문 9 |
| Benefits and Limitations of Relative Phase Analysis | 309–310 | 본문 10 |
| QUANTIFYING COORDINATION: VECTOR CODING | 310–311 | 본문 11 |
| Vector Coding Procedures | 311 | 본문 11 |
| Further Quantification of the Coupling Angle Time Series | 311–312 | 본문 12 |
| From the Scientific Literature (Chang 외 2008, 상자글) | 313 | 본문 12 |
| Benefits and Limitations of Vector Coding | 314 | 본문 12 |
| OVERVIEW OF COORDINATION ANALYSIS TECHNIQUES | 314–315 | 본문 13 |
| SUMMARY | 315 | 본문 13 |
| SUGGESTED READINGS | 315 | 더 읽을거리 |

## 본문

### 1. 협응은 자유도를 묶는 일이다
전통적인 생체역학 분석은 관절이나 분절 하나의 시계열에서 최대 변위·속도·힘 같은 이산값을 뽑습니다. dynamical systems 접근은 관절·분절 회전 사이의 **상대 운동 패턴**을 봅니다([RM] p.291). 사람 몸에는 근육이 800개 가까이 있고, 매끄러운 목표 지향 운동이 나오려면 운동단위·근육·분절·관절이라는 여러 수준의 자유도(degrees of freedom)가 기능 단위로 묶여야 합니다([RM] p.291).

- Weiss(1941): 협응은 자유도를 골라 활성화해 그 합이 조직된 운동이 되게 하는 것([RM] p.291).
- Bernstein: 과제 하나를 푸는 방법이 여럿이라는 뜻의 **redundancy**를 짚고, 협응을 남는 자유도를 다스려 몸을 제어 가능한 계로 바꾸는 일로 정의했습니다([RM] p.291).
- 신경역학 관점: 높은 자유도의 생리 기제가 낮은 자유도의 역학 "template"으로 묶입니다. 걷기는 역진자처럼 넘어가기(vaulting), 달리기는 질량-스프링처럼 튀기입니다. 근육의 힘-길이·힘-속도 관계와 이관절근도 움직임을 안정시켜 자유도 문제를 덜어 줍니다([RM] pp.291–292).
- 학습 초기에는 관절을 잠그거나 관절 사이 관계를 단순하게 만들어 자유도를 줄이고, 나중에 풀어 줍니다. 최근에는 남는 자유도를 "극복할 것"이 아니라 안정성과 유연성을 함께 주는 **abundancy**로 보는 제안이 있습니다([RM] p.292).

### 2. 진동 운동, HKB 모형, 안정성과 전이
Bernstein은 운동 구성을 네 수준으로 나눴고, 둘째 수준인 synergy(근-관절 연결)가 지상 이동의 모든 패턴을 떠받칩니다. synergy 수준의 협응은 진동 운동에서 가장 잘 드러납니다([RM] p.292). Von Holst는 두 가지를 구분했습니다. 두 진동자의 위상과 주파수가 모두 잠긴 **absolute coordination**, 그리고 특정 위상 관계로 끌리지만 훨씬 다양한 주파수·위상 관계를 보이는 **relative coordination**입니다([RM] p.292, 그림 13.1).

두 진동자의 위상 관계는 synergy 수준의 원리를 드러내는 기본 변수로 제안되었습니다. synergetics는 두 종류의 변수를 나눕니다([RM] pp.292–293).

| | order parameter | control parameter |
|---|---|---|
| 뜻 | 계 전체의 거시적 행동을 나타내는 변수 | 체계적으로 바꾸면 안정·불안정 영역이 드러나는 비특정 변수 |
| 네발 동물 보행의 예 | 다리 사이 위상 관계(걷기·속보·구보·질주마다 다르고 한 방식 안에서는 일정) | 보행 속도 |

**Kelso의 손가락 실험.** 두 검지를 in-phase 또는 antiphase로 흔듭니다. antiphase에서 시작해 진동 주파수를 올리면 처음에는 유지되다가 어떤 임계 주파수에서 갑자기 in-phase로 넘어갑니다. 전이 직전에 relative phase의 변동성이 커지고, 주파수를 다시 내려도 antiphase로 돌아가지 않습니다. in-phase에서 시작하면 전이가 없습니다([RM] p.293). 이 현상을 설명하는 Haken–Kelso–Bunz(HKB) 모형의 relative phase 동역학은 다음과 같습니다([RM] 식 13.1, p.293).

```
dφ/dt = Δω − a·sin(φ) − 2b·sin(2φ) + N
φ = relative phase,  Δω = 두 진동자의 고유 주파수 차이,  N = 무작위 요동
b/a 는 진동 주파수와 반비례 관계
```

대칭성이 높고 주파수가 낮으면 안정 상태(attractor)가 둘입니다. in-phase(φ = 0°)와 antiphase(φ = ±π)입니다. potential 그림에서 우물이 깊을수록 attractor가 강하고, in-phase 우물이 훨씬 깊어서 전이가 antiphase → in-phase 한 방향으로만 일어납니다. 주파수가 높아지면 antiphase 우물이 사라져 in-phase만 남습니다. 이렇게 control parameter의 임계값에서 attractor의 배치나 안정성이 바뀌는 것을 bifurcation(phase transition)이라고 합니다([RM] p.293, 그림 13.2, p.294). 팔과 다리처럼 대칭성이 낮은 조합에서는 안정 상태의 수가 줄고 우물이 얕아져 요동만으로도 상태가 바뀌기 쉽습니다([RM] p.293).

**추가 설명:** Δω = 0이고 N을 무시하면 φ = π에서 우변의 기울기는 a − 4b입니다. 이 값이 음수(b/a > 1/4)일 때만 antiphase가 안정이고, 주파수가 올라 b/a가 1/4 아래로 내려가면 antiphase가 불안정해집니다. HKB 모형의 표준 결과이며 [RM] 본문에는 이 수치가 나오지 않습니다.

### 3. 변동성: 잡음인가 기능인가
전통적으로 변동성은 잡음과 같은 것으로 취급되어 자료에서 지워졌고, 숙련·건강할수록 줄어든다고 보았습니다. dynamical systems 관점은 다른 그림을 제시합니다([RM] pp.293–296).

- **loss of complexity 가설(Lipsitz 2002):** 노쇠는 변동성의 **상실**로 드러나고, 이는 자유도 사이 상호작용이 줄었음을 반영합니다. 유효 자유도·상호작용 요소·synergy가 줄면서 변동성이 줄고, 임계 threshold에 닿으면 부상이나 질병이 나타날 수 있다는 도식입니다([RM] p.294, 그림 13.3, p.295).
- **전이의 표지 두 가지:** 전이 전에 요동이 크게 늘어나는 **critical fluctuations**, 교란 뒤 원래 상태로 돌아오는 시간이 크게 늘어나는 **critical slowing down**. 우물이 얕아지면 최저점으로 돌아가는 속도가 느려진다는 것으로 이해합니다([RM] p.294).
- **보행 변수와 분절 협응은 다를 수 있음:** stride length·stride frequency의 변동성 증가를 불안정·낙상 위험과 연결하는 가정이 흔하지만, 기제를 알려면 상·하체 분절 협응을 봐야 합니다. Parkinson병 연구에서 두 수준의 변동성 양상이 일치하지 않았습니다([RM] p.295).
- **달리기 부상 연구:** 편측 patellofemoral pain이 있는 주자는 무릎이 관여하는 분절 coupling의 변동성이 건강한 주자보다 작았습니다(Hamill 외 1999; Heiderscheit 외 2002). iliotibial band syndrome 병력 연구(Miller 외 2008)도 비슷한 결론이었고, 고속 비예측 cutting에서 여성이 남성보다 여러 하지 coupling의 변동성이 작았다는 보고(Pollard 외 2005)도 있습니다([RM] pp.295–296).

교재가 붙인 단서: 이 연구들은 모두 **후향적**이어서 변동성과 부상의 인과를 말할 수 없고, 전향적 연구가 필요합니다. 결론은 "변동성은 본래 좋지도 나쁘지도 않으며, 과제를 수행하는 데 쓰인 협응 패턴의 범위를 나타낸다. 비정상적으로 낮아도 높아도 해로울 수 있다"입니다([RM] p.296). coordination variability는 흔히 시행 간 또는 보행주기 간 표준편차로 재며, relative phase나 vector coding으로 구합니다([RM] p.295).

### 4. state space와 attractor
state space는 계의 안정성과 변화 능력을 드러내는 변수들로 만든 공간입니다([RM] p.296). 교재는 같은 자료를 세 가지로 그립니다.

| 그림 | 축 | 보이는 것 | 교재 예 |
|---|---|---|---|
| 시계열 | 시간 – 각도 | 최대 굴곡·신전, 대략적인 위상 관계 | 1.2 m/s 트레드밀 보행의 좌우 넙다리 각도 10 s([RM] 그림 13.4, p.296) |
| angle-angle | 각도 – 각도 | 협응이 바뀌는 구간과 변하지 않는 구간 → vector coding의 입력 | [RM] 그림 13.5, p.297 |
| phase plane | 위치 – 속도 | 한 분절의 동역학. CRP의 첫 단계 | [RM] 그림 13.6, p.297 |

state space에서 궤적이 모여드는 선호 영역이 **attractor**입니다([RM] p.297).

- **point attractor:** 값 하나로 수렴합니다. 좌우 넙다리의 최대 굴곡 시점으로 구한 discrete relative phase는 주기마다 약 180°(antiphase)로 일정합니다. n번째 값과 n+1번째 값을 마주 그린 **return map**에서 한 점 주위에 모입니다. 속도를 1.2 m/s에서 2.0 m/s로 5초 동안 올렸다 되돌리는 교란을 주어도 짧은 지연 뒤 원래 값으로 돌아옵니다([RM] pp.297–298, 그림 13.7).
- **limit-cycle attractor:** 개별 분절의 phase plane 궤적은 좁은 고리 모양 띠입니다. 그러나 좁은 띠는 **필요조건일 뿐 충분조건이 아닙니다.** 교란 뒤 원래 궤도로 돌아오는 저항성이 있어야 limit cycle입니다. phase plane 궤적이 모이고 퍼지는 모습으로 계의 에너지 손실과 획득도 읽을 수 있습니다([RM] pp.297–298).
- **quasiperiodic·chaotic attractor:** 3차원 이상에서 나타납니다. chaotic attractor(예: Lorenz attractor)는 한 영역으로 끌리는 안정성과 변동성을 함께 가집니다. 이 이중성은 건강하고 숙련된 계의 복잡성과 연결되며, 심박 변동성이 큰 것이 건강한 심장 기능의 지표로 여겨지는 것이 예입니다([RM] p.298, 그림 13.8, p.299).

### 5. Discrete relative phase (DRP)
DRP는 두 시계열에서 대응하는 사건(예: 최대 굴곡)의 시간 차를 한쪽 시계열의 주기 길이로 나눈 것입니다([RM] 식 13.2, p.299, 그림 13.9).

```
DRP = (Δt / T) × 360°
Δt = 두 시계열의 봉우리 시점 차,  T = 한쪽 시계열의 주기 길이
```

주기로 나누는 이유는 속도가 달라지면 stride 길이가 달라지기 때문입니다. 보통 주기마다 구한 뒤 여러 주기에 걸쳐 평균합니다([RM] p.299).

| 좋은 점 | 한계 ([RM] pp.299–300) |
|---|---|
| 속도·가속도 계산이나 state space 재구성 없이 원 시계열을 그대로 씀 | 대개 주기당 한 점만 씀. 주기 안에서 협응이 바뀌는 신호에는 부족 |
| 손가락 진동처럼 규칙적인 신호에 충분 | 봉우리가 분명해야 함. 봉우리가 여럿이고 주기마다 흔들리면 결과가 틀리고 변동성이 인위적으로 커짐 |

대안은 주기 안의 점을 더 고르거나 CRP·vector coding을 쓰는 것입니다([RM] p.300).

**문헌 사례(Diedrich & Warren 1995).** 벨트 속도를 30초에 걸쳐 0.95에서 3.60 m/s로 연속 변화시키며 걷기–달리기 전이를 보았습니다. 고관절 또는 무릎 신전 봉우리 사이를 0–360°로 두고 발목 족저굴곡 봉우리의 시점을 DRP로 삼았습니다. walk→run 전이 속도(2.09 m/s)가 run→walk(2.05 m/s)보다 조금 빨랐고, 달리기 직전 마지막 걸음에서 ankle-hip·ankle-knee DRP가 약 50° 급락했습니다. 일정 속도 조건에서 DRP 변동성은 전이 영역(Froude 수 약 0.5) 근처에서 커졌으나 전이 뒤에 줄지는 않았습니다. stride frequency를 고정한 실험 2에서도 전이는 일관되게 2.2 m/s에서 일어나 control 변수가 속도임을 뒷받침했습니다([RM] p.300).

### 6. 주파수가 다른 두 리듬: multifrequency DRP
DRP는 봉우리가 주기당 한 번씩 나오는 1:1 관계에 잘 맞습니다. 느린 보행의 팔-다리(2:1)나 호흡-보행처럼 주파수 비가 다르고 도중에 바뀌는 계에는 수정이 필요합니다([RM] p.300). 말은 앞다리 충격이 흉곽을 제약해 호흡:stride가 거의 1:1로 고정되지만, 사람은 1:1, 2:1, 3:1, 3:2, 4:1, 5:2가 관찰되고 2:1이 가장 흔합니다([RM] p.301).

McDermott 외(2003)의 방법은 호흡의 end-inspiration(EI)과 heel strike 사이의 relative phase를 구합니다([RM] 식 13.3, p.301, 그림 13.10).

```
DRPmf = [ (t + n·T) / T ] × 360°
T = EI가 일어난 stride의 길이
t = 그 stride의 시작에서 EI까지의 시간
n = 해당 heel strike와 다음 EI 사이에 들어 있는 완전한 stride 수
```

한 호흡 안에 heel strike가 셋이면 첫 번째는 720°–1080°, 두 번째는 360°–720°, 마지막은 0°–360° 범위에 떨어집니다([RM] p.301). 이후 절차는 다음과 같습니다([RM] pp.301–303, 그림 13.11).

```
1. heel strike마다 DRPmf를 구해 시계열로 만든다.
2. 시차를 둔 return map(xn 대 xn+2, xn 대 xn+3 …)을 그린다.
   k차 map에서 대각선(line of identity)으로 모이면 k:1 coupling.
3. 호흡 수 대비 각 coupling과 noncoupling의 비율(%)을 낸다.
   가장 잦은 것 = dominant coupling(결합 강도), 둘째로 잦은 것과 noncoupling = 변동성.
4. phase coupling(PC): 가장 낮은 범위(0°–360°)의 점들이 대각선에서 떨어진 거리 dn으로 계산.
```

```
wdn = 1 − |dn| / (40·cos 45°)   (dn ≤ 40),     wdn = 0   (dn > 40)     (식 13.4)
PC  = ( Σ wdn / m ) × 100%       m = 가장 낮은 범위의 점 수            (식 13.5)
```

모든 점이 대각선 위에 있으면 PC = 100%이고, 흩어질수록 내려갑니다([RM] p.303). 교재가 전하는 결과: entrainment(주파수·위상이 강하게 잠김)만으로는 변동이 큰 호흡-보행 상호작용을 다루기에 부족했고, 보행 경험이 많다고 entrainment가 높지는 않았으며 차이는 부과된 속도·주파수 조건에 대한 **적응성**에서 나타났습니다([RM] p.303).

**추가 설명:** 40·cos 45° ≈ 28.3이므로 식 13.4를 그대로 쓰면 dn이 28.3과 40 사이일 때 가중치가 음수가 됩니다. 본문의 "40° 이상이면 0"이라는 설명과 딱 맞지 않아 dn의 정확한 정의(수직 거리인지 두 축 값의 차인지)는 McDermott 외(2003) 원문에서 확인해야 합니다.

### 7. Continuous relative phase (CRP): 계산 절차
CRP는 두 진동자(두 분절 또는 두 관절)의 phase plane 각도 차입니다. 위치와 속도를 함께 쓰므로 "고차" 협응 지표로 불립니다([RM] pp.303–304). 원래 손가락 실험에서는 움직임이 사인파에 가까워 CRP가 DRP의 고해상도판 구실을 했지만, 사인파에서 벗어난 신호나 부분 진동으로 넓히면 계산에 세심한 주의가 필요합니다([RM] p.303).

```
1. phase plane 만들기      각 진동자의 각도 θ와 각속도 ω를 구한다.
2. 정규화                  θ → θ′ (−1 ~ +1),  ω → ω′ (0을 원점에 유지)
3. 시간 정규화             두 진동자의 점 수를 맞춘다(흔히 주기 = 100%).
4. phase angle             φ(i) = tan⁻¹[ ω′(i) / θ′(i) ]   (4사분면 arctangent)
5. CRP                     CRP(i) = φA(i) − φB(i)
```

**1단계의 주의.** 2D 각도는 central difference로 미분하면 되지만, 3D에서는 각도를 그냥 미분해 각속도를 얻을 수 없습니다(교재 2장 참조)([RM] p.304). phase plane은 위치-속도 말고 속도-가속도, 모멘트-각도, 모멘트-모멘트로도 만들 수 있습니다([RM] p.304).

**2단계가 필요한 이유.** 속도의 진폭이 위치보다 훨씬 커서 그대로 두면 속도가 phase angle을 지배합니다. 두 신호의 가동 범위가 크게 달라도 같은 문제가 생기고, 주파수 차이를 보정하지 않으면 CRP에 저주파 진동이라는 artifact가 나타납니다(Peters 외 2003)([RM] p.304).

```
θ′i = 2·[ θi − min(θ) ] / [ max(θ) − min(θ) ] − 1          (식 13.6)
ω′i = ωi / max[ max(ω), max(−ω) ]                          (식 13.7)
```

| 정규화 방식 | 내용 | 주의 ([RM] pp.304–305) |
|---|---|---|
| 단위원 방식 | 위치·속도 모두 최대·최소로 맞춤(Van Emmerik & Wagenaar 1996a) | 세로축 0이 실제 속도 0과 어긋남 |
| 속도를 0 중심으로 유지 | 식 13.6–13.7. 생체역학 문헌에서 가장 흔함(Burgess-Limerick 외 1993) | 속도 0이 원점에 남아 궤적의 수렴·발산으로 에너지 변화를 볼 수 있음 |
| 평균 진동 주파수로 나눔 | 속도를 여러 주기의 평균 주파수로 나눔(Sternad 외 1999) | 사지 간 협응 연구에서 사용 |

최댓값을 주기마다 잡을지 여러 주기 전체에서 잡을지도 정해야 합니다. 질적 차이는 작지만 전체 최댓값을 쓰면 주기 사이의 공간적 관계가 더 잘 보존됩니다. 단 이상한 주기 하나가 최댓값을 바꿀 수 있으니 자료를 눈으로 확인합니다([RM] p.305).

**추가 설명:** x = A·sin(ωt)의 속도는 Aω·cos(ωt)입니다. ω = 1 rad/s, 곧 f = 1/(2π) = 0.5/π Hz일 때만 phase plane 궤적이 원이 되고 그 밖에는 타원이 됩니다. 교재가 "0.5/π Hz가 아닌 사인파"에서도 문제가 생긴다고 한 것([RM] p.303)은 이 때문으로 이해할 수 있습니다.

**4–5단계의 범위 처리.** phase angle은 0°–360°(또는 ±180°) 범위라 차를 구하면 불연속이 생깁니다. circular statistics를 쓰거나, CRP를 0°–180°로 제한해 180°를 넘는 차는 360°에서 뺍니다. phase angle 자체를 한두 사분면으로 접어 버리면 해석이 크게 달라질 수 있으므로 극좌표 전체를 유지합니다(Wheat 외 2002)([RM] p.305).

**해석.** 두 진동자가 대체로 사인파이고 주파수 비가 1:1이라는 전제에서, CRP 0°는 완전한 in-phase(자동차 와이퍼 두 개가 나란히 움직임), 180°는 완전한 antiphase(두 와이퍼가 동시에 가운데로 모임)입니다([RM] p.305).

**lead-lag은 읽지 않습니다.** 한 phase angle에서 다른 것을 빼니 "누가 앞서는가"를 읽고 싶어지지만, phase angle이 위치와 속도 둘에서 나오고 정규화까지 거치므로 그런 해석은 성립하지 않습니다. 시간적 선후는 cross-correlation으로 봅니다([RM] pp.305–306).

### 8. CRP에서 뽑는 지표와 변동성
어떤 종속 변수를 뽑을지 문헌의 합의는 거의 없고, coupling마다 따로 분석합니다([RM] p.306).

- 주기의 특정 시점(시작점, 기능적으로 중요한 점)의 CRP 값.
- 구간 평균: 주기의 10%씩, 또는 기능 단위(예: 오른발 접지 → 최대 무릎 굴곡 → toe-off → 다음 접지).
- stride 전체의 CRP 분포를 histogram으로 보기(Van Emmerik & Wagenaar 1996b)([RM] p.306).

**변동성을 잴 때의 두 원칙**([RM] pp.306–307):

1. 주기 안에서 체계적으로 변하는 CRP 시계열 전체의 표준편차를 변동성으로 쓰면 안 됩니다. 보행·달리기의 CRP는 주기 안에서 크게 오르내리므로, 그 표준편차에는 체계적 변화가 섞입니다. CRP가 주기 내내 거의 일정한 경우(손가락 실험)에만 쓸 수 있습니다.
2. 불연속이 없는 자료에서만 구합니다.

올바른 절차는 **between-cycle 변동성**입니다. n개 주기를 각각 100%로 맞추고, 주기의 각 % 지점에서 n개 CRP 값의 표준편차를 구해 "CRP variability 시계열"을 만듭니다. 그 뒤 전체 평균, stance·swing 평균, 기능 구간 평균을 냅니다([RM] p.307, 그림 13.14).

**문헌 사례(Miller 외 2008).** ITBS 병력이 있는 주자와 없는 주자가 탈진까지 트레드밀을 달렸고, 변동성은 stride 간 CRP 표준편차로 쟀습니다. 병력군은 ITBS·무릎 통증과 관련된 분절 운동이 포함된 swing 구간과 heel strike에서 변동성이 작았으나 stance에서는 차이가 없었습니다. 피로의 주효과와 군×피로 상호작용은 없었습니다([RM] p.308).

### 9. 사인파가 아닌 신호를 위한 대안: relative Fourier phase와 Hilbert transform
보행 운동학은 CRP의 두 전제(사인파에 가까움, 주기 안에서 CRP가 비교적 일정)를 흔히 어깁니다. 특히 하지 관절 각도가 그렇습니다([RM] p.308).

**Relative Fourier phase(RFP, Lamoth 외 2002).** 신호에서 특정 harmonic 하나를 골라 그 위상으로 relative phase를 구합니다([RM] pp.308–309).

```
1. harmonicity 지표를 정한다:  IH = P0 / Σ(i=0..5) Pi          (식 13.10)
   Pi = (i+1)번째 harmonic의 PSD, P0 = 기본 주파수 성분. IH = 1이면 완전한 harmonic 진동.
2. 창 폭을 정한다(정해진 규칙 없음. 선행 연구: IH가 가장 큰 신호의 기본 주기의 4배).
3. 창을 첫 시점부터 옮겨 가며 두 신호를 주파수 영역으로 변환하고,
   공통 주파수(IH가 가장 큰 신호의 기본 주파수)의 위상을 기록한다.
4. 위상들을 시간 영역 시계열(Fourier phase angle)로 되돌리고 두 신호의 차를 구한다.
```

0°는 in-phase, 180°는 antiphase이지만, 이 해석은 **기본 주파수의 진동에만** 해당합니다([RM] p.309).

**Hilbert transform.** state space를 시간 지연 복사본이나 도함수 대신 Hilbert transform으로 만듭니다. 사인파가 아니고 nonstationary한 임의의 두 신호 사이의 위상 차를 모호함 없이 구할 수 있습니다(Rosenblum & Kurths 1998)([RM] p.309).

```
s̃(t) = (1/π) · ∫ s(τ) / (t − τ) dτ      (식 13.11, t = τ 에서는 Cauchy principal value)
φhrp = φ1 − φ2 = tan⁻¹[ (s̃1·s2 − s1·s̃2) / (s1·s2 + s̃1·s̃2) ]      (식 13.12)
```

미분을 하지 않으므로 원 신호의 잡음을 키우지 않아, 잡음이 많거나 거르지 않은 자료에 더 알맞을 수 있습니다([RM] p.309).

**추가 설명:** p.309에 인쇄된 식 13.11의 적분 안은 s(t)로 보이는데, 적분 변수가 τ이므로 표준 정의대로 s(τ)로 적었습니다.

### 10. relative phase 방법들의 장단점
- **DRP:** 단순하고 추가 유도가 없습니다. 두드러진 사건 하나에 기대므로, 그 사건이 중요하다는 선행 근거가 있을 때 적합합니다. 사건이 여럿이거나 봉우리 시점이 들쭉날쭉하면 CRP나 vector coding이 낫습니다([RM] p.309).
- **CRP:** 주기 전체의 협응을 재고 변위와 속도를 함께 반영합니다. 사인파에 가까운 신호에서 가장 잘 작동하고, 크게 벗어나면 가짜 진동이 생깁니다. 정규화가 일부를 잡지만 강한 비사인파 신호에는 Hilbert transform이 나을 수 있습니다([RM] p.309).
- **RFP:** 비사인파 신호 문제를 다루지만 지배 주파수만 남기므로 원 시계열의 다른 진동을 잃습니다. 그래서 DRP와 더 닮았고 신호의 복잡성을 다 담지 못할 수 있습니다([RM] pp.309–310).
- CRP 결과는 순수한 공간적 위상 해석으로 되돌리기 어렵거나 불가능한 경우가 많습니다. 재활이나 운동 학습처럼 관절·분절의 공간적 관계가 관심사일 때는 vector coding이 더 알맞을 수 있습니다([RM] p.310).

### 11. Vector coding: coupling angle과 circular statistics
angle-angle diagram은 정상·이상 보행의 구분, 발달 과정의 대칭성, 숙련도에 따른 협응 변화 연구에 쓰여 왔습니다. 교재는 걷기와 달리기의 thigh–leg(동측), 좌우 thigh(양측) 그림을 예로 듭니다([RM] p.310, 그림 13.15). 정량화는 격자를 씌워 방향을 숫자 코드로 바꾸는 chain encoding에서 시작했고, 미세한 변화를 잃는 약점을 Sparrow 외(1987)가 연속한 점 사이의 각도를 쓰는 vector 기반 방식으로 보완했으며, Tepavac & Field-Fote(2001)가 여러 주기의 변동성·유사성 정량화로 넓혔습니다([RM] pp.310–311).

**coupling angle γ**는 angle-angle 그림에서 연속한 두 점을 잇는 벡터가 오른쪽 수평선과 이루는 각입니다([RM] 식 13.13, p.311, 그림 13.16).

```
γ(j,i) = tan⁻¹[ ( y(j,i+1) − y(j,i) ) / ( x(j,i+1) − x(j,i) ) ],   0° ≤ γ ≤ 360°
i = 주기 안의 연속한 자료점(여기서는 stance의 %),  j = 보행주기 번호
```

γ는 방향을 가진 각이어서 산술평균을 내면 실제 방향과 다른 값이 나올 수 있습니다. 그래서 **circular statistics**로 평균합니다. 주기의 각 % 지점 i에서 여러 주기 j에 걸쳐([RM] 식 13.14–13.17, p.311):

```
x̄i = (1/n)·Σj cos γ(j,i)        ȳi = (1/n)·Σj sin γ(j,i)
ri = √( x̄i² + ȳi² )              평균 벡터의 길이
γ̄i = arctan(ȳi / x̄i)             (x̄i > 0)
γ̄i = 180° + arctan(ȳi / x̄i)      (x̄i < 0)
```

대상자 안에서 먼저 평균하고 그다음 집단에 걸쳐 평균합니다([RM] p.311).

**추가 설명:** 식 13.17에서 x̄ > 0이고 ȳ < 0이면 결과가 음수이므로 360°를 더해 0°–360° 범위로 옮깁니다. ri는 0(방향이 고르게 흩어짐)에서 1(모두 같은 방향) 사이이고, 문헌에서는 ri에서 변환한 circular 표준편차를 coupling angle 변동성으로 쓰기도 합니다. [RM] 본문은 ri의 정의까지만 적습니다.

**변동성.** DRP·CRP와 같은 원칙입니다. 주기 전체에 걸친 변동성은 권하지 않고, 각 시행을 100%로 맞춘 뒤 각 지점의 주기 간 변동을 먼저 구합니다. 그 평균이 전역 지표이고, 초기 stance·midstance·swing 같은 구간별 값이 국소 지표입니다([RM] p.311).

### 12. coupling angle의 분류, 유사성, 그리고 vector coding의 장단점
coupling angle의 주기 평균은 협응이 주기 안에서 체계적으로 변하지 않을 때만 대표값이 됩니다. 그래서 구간 평균이나 histogram을 쓰거나, Chang 외(2008)처럼 극좌표를 45° 폭의 bin으로 나눠 네 패턴으로 분류합니다([RM] pp.311–312, 그림 13.18). thigh(가로축)–leg(세로축) 예:

| 패턴 | γ 범위 | 중심 방향 | 뜻 |
|---|---|---|---|
| in-phase | 22.5°–67.5°, 202.5°–247.5° | 45°, 225°(양의 대각선) | 두 분절이 같은 방향으로 회전 |
| antiphase | 112.5°–157.5°, 292.5°–337.5° | 135°, 315°(음의 대각선) | 반대 방향으로 회전 |
| thigh phase | 0°–22.5°, 157.5°–202.5°, 337.5°–360° | 0°, 180°(수평) | 넙다리만 주로 움직임 |
| leg phase | 67.5°–112.5°, 247.5°–292.5° | 90°, 270°(수직) | 종아리만 주로 움직임 |

두 angle-angle 그림이 얼마나 닮았는지는 coupling angle 시계열을 cross-correlation해 평가합니다(Sparrow 외 1987의 pattern similarity, Tepavac & Field-Fote 2001의 확장)([RM] p.312).

**문헌 사례(Chang 외 2008).** 문헌은 안정된 발을 forefoot 회내와 rearfoot 회외가 함께 일어나는 antiphase 운동으로 묘사해 왔습니다. 피부 마커 9개의 다분절 발 모형으로 1.35 m/s 보행을 측정해 rearfoot–forefoot coupling을 네 패턴으로 분류했더니, push-off에서 antiphase가 우세하지 않았습니다. 두 분절의 협응이 기존 설명보다 복잡하다는 뜻입니다([RM] p.313, 그림 13.19).

**장점**([RM] p.314): (1) 속도를 쓰지 않아 비사인파 시계열에서도 가짜 진동이 덜 생긴다. (2) coupling angle이 움직임 패턴을 직접 말해 준다. (3) 정규화 요구가 덜 엄격하다. 임상에서는 바꿔야 할 움직임으로 바로 읽히는 지표가 유리합니다. **한계:** CRP 같은 고차 변수가 질병 진행이나 회복 과정의 미세한 변화를 더 민감하게 잡을 수 있습니다([RM] p.314).

### 13. 어떤 방법을 고를 것인가
교재가 꼽는 네 가지 고려 사항([RM] p.314): (1) 공간적 수준과 고차 수준 중 어디에서 협응을 이해하려는가, (2) 시계열이 사인파에 얼마나 가까운가, (3) 주파수 관계가 1:1인가 multifrequency인가, (4) 주기 안의 한 사건을 볼 것인가 전체를 볼 것인가. 아래는 [RM] 표 13.1(p.314)의 내용을 질문 형식으로 다시 짠 것입니다.

| 방법 | 미분 필요 | 비사인파 신호 | 주기 전체 | 가장 큰 약점 |
|---|---|---|---|---|
| DRP | 아니오 | 봉우리가 분명하면 가능 | 아니오(한 사건) | 봉우리가 흐리거나 바뀌면 신뢰할 수 없고 변동성에 영향 |
| multifrequency DRP | 아니오 | — | 아니오 | return map을 만드는 더 복잡한 절차 |
| CRP | 예 | 크게 벗어나면 부적합 | 예 | 정규화 필요, 공간적 해석으로 되돌리기 어려움 |
| Fourier phase | 아니오 | 가능(기본 주파수만 비교) | 예 | 두 시계열의 협응 정보를 잃을 수 있고 DRP와 다른 정보를 못 줄 수 있음 |
| Hilbert transform | 아니오 | 가능 | 예 | state space를 얻는 해석적 절차가 더 복잡 |
| vector coding | 아니오 | 가능 | 예 | 고차 정보 상실, 민감도가 낮을 수 있음 |

장의 맺음말도 같은 당부입니다. 방법을 쓰기 전에 각 방법의 장점과 한계를 연구 질문에 비추어 따져 보라는 것입니다([RM] p.315).

## 주요 용어

| 용어 | 한국어 | 뜻 |
|---|---|---|
| degrees of freedom | 자유도 | 독립적으로 변할 수 있는 요소(운동단위, 근육, 분절, 관절) |
| redundancy / abundancy | 잉여성 / 풍부성 | 과제의 해가 여럿임 / 모든 자유도가 안정성과 유연성에 기여한다는 관점 |
| absolute / relative coordination | 절대·상대 협응 | 위상·주파수가 잠김 / 특정 위상으로 끌리지만 다양한 관계를 보임 |
| order parameter | 질서 변수 | 계의 집합적 행동을 나타내는 변수(예: relative phase) |
| control parameter | 제어 변수 | 바꾸면 안정·불안정 영역이 드러나는 변수(예: 속도) |
| attractor | 끌개 | state space에서 궤적이 모여드는 영역 |
| bifurcation (phase transition) | 분기(상전이) | attractor의 배치나 안정성이 바뀌는 질적 변화 |
| critical fluctuations | 임계 요동 | 전이 직전에 커지는 변동 |
| critical slowing down | 임계 감속 | 전이 근처에서 교란 뒤 회복이 느려짐 |
| state space / phase plane | 상태 공간 / 위상 평면 | 계의 상태를 나타내는 변수 공간 / 위치-속도 평면 |
| return map | 리턴 맵 | n번째 값과 n+k번째 값을 마주 그린 그림 |
| limit-cycle attractor | 한계 주기 끌개 | 교란 뒤에도 돌아오는 닫힌 궤도 |
| DRP | 이산 상대 위상 | 대응 사건의 시간 차 ÷ 주기 × 360° |
| entrainment | 동조 | 두 리듬의 주파수·위상이 강하게 잠김 |
| CRP | 연속 상대 위상 | 두 진동자의 phase angle 차를 주기 전체에서 구한 것 |
| phase angle | 위상각 | 정규화한 phase plane에서 점이 수평축과 이루는 각 |
| coordination variability | 협응 변동성 | 과제 수행에 쓰인 협응 패턴의 범위. 주기 간 표준편차로 측정 |
| index of harmonicity (IH) | 조화 지수 | 기본 주파수 파워 ÷ 처음 6개 harmonic 파워의 합 |
| coupling angle (γ) | 결합각 | angle-angle 그림의 연속한 두 점을 잇는 벡터의 방향 |
| circular statistics | 원형 통계 | 각도 자료를 cos·sin 성분으로 평균하는 통계 |

## 흔한 오해
- **"변동성은 작을수록 좋다"** → 교재의 결론은 너무 낮아도 너무 높아도 해로울 수 있다는 것입니다. 부상군의 협응 변동성이 더 **작았다**는 보고들이 있습니다([RM] pp.295–296).
- **"변동성이 작으면 부상이 생긴다는 것이 증명되었다"** → 인용된 연구는 모두 후향적이라 인과를 말하지 못합니다([RM] p.296).
- **"phase plane 궤적이 좁은 띠면 limit cycle이다"** → 필요조건일 뿐입니다. 교란에 대한 저항성을 보여야 합니다([RM] p.297).
- **"CRP가 양수면 A가 B를 앞선다"** → CRP는 lead-lag 지표가 아닙니다. 선후는 cross-correlation으로 봅니다([RM] pp.305–306).
- **"CRP 곡선 전체의 표준편차가 협응 변동성이다"** → 주기 안의 체계적 변화가 섞입니다. 각 % 지점의 주기 간 표준편차를 씁니다([RM] p.307).
- **"coupling angle은 그냥 평균 내면 된다"** → 350°와 10°의 산술평균은 180°이지만 실제 평균 방향은 0°입니다. circular statistics를 씁니다([RM] p.311).

## 자기 점검

1. stride 길이가 1.10 s이고 오른쪽 넙다리의 최대 굴곡이 왼쪽보다 0.55 s 늦게 나타납니다. DRP와 협응 형태는?
<details><summary>정답</summary>DRP = (0.55/1.10) × 360° = 180°. antiphase입니다([RM] 식 13.2, p.299). 시간 차가 0.11 s였다면 36°입니다.</details>

2. EI가 일어난 stride의 길이가 T = 1.0 s, 그 stride 시작에서 EI까지 t = 0.4 s입니다. EI 전에 완전한 stride 하나를 사이에 둔 heel strike의 DRPmf는? 이 값은 어느 범위에 속합니까?
<details><summary>정답</summary>n = 1이므로 DRPmf = (0.4 + 1 × 1.0)/1.0 × 360° = 504°. 360°–720° 범위이므로 EI 직전 heel strike보다 하나 앞선 heel strike입니다([RM] 식 13.3, p.301). 교재의 예(T = 100 ms, t = 75 ms, n = 2, 1, 0)는 990°, 630°, 270°입니다.</details>

3. return map의 가장 낮은 범위에 점이 셋 있고 대각선까지 거리가 0, 10, 50입니다. 식 13.4–13.5로 PC를 구하세요.
<details><summary>정답</summary>40·cos 45° = 28.28. wd = 1 − 0/28.28 = 1, 1 − 10/28.28 = 0.646, 0(50 > 40). PC = (1 + 0.646 + 0)/3 × 100 = 54.9%([RM] p.303).</details>

4. 한 주기에서 넙다리 각도 범위가 −10°~30°, 각속도 범위가 −250~200°/s입니다. θ = 20°, ω = 125°/s인 시점의 정규화 값과 phase angle은? 같은 시점에 다른 분절의 정규화 값이 θ′ = −0.5, ω′ = 0.5라면 CRP는?
<details><summary>정답</summary>θ′ = 2 × (20 − (−10))/(30 − (−10)) − 1 = 60/40 − 1 = 0.5. ω′ = 125/max(200, 250) = 0.5. φA = tan⁻¹(0.5/0.5) = 45°. 다른 분절은 2사분면이므로 φB = 135°. 차는 −90°이고 0°–180° 표기로 90°입니다. in-phase와 antiphase의 한가운데입니다([RM] 식 13.6–13.9, pp.304–305).</details>

5. 같은 % 지점에서 세 주기의 coupling angle이 80°, 100°, 120°입니다. circular 평균과 평균 벡터 길이는?
<details><summary>정답</summary>x̄ = (cos 80° + cos 100° + cos 120°)/3 = (0.1736 − 0.1736 − 0.5)/3 = −0.1667. ȳ = (0.9848 + 0.9848 + 0.8660)/3 = 0.9452. x̄ < 0이므로 γ̄ = 180° + arctan(0.9452/−0.1667) = 180° − 80° = 100°. r = √(0.0278 + 0.8934) = 0.960([RM] 식 13.14–13.17, p.311).</details>

6. thigh(가로축)–leg(세로축) angle-angle 그림에서 연속한 두 점 사이에 넙다리 각도가 +3°, 종아리 각도가 −0.5° 변했습니다. coupling angle과 패턴은?
<details><summary>정답</summary>γ = tan⁻¹(−0.5/3) = −9.5° → 350.5°. 337.5°–360° 범위이므로 thigh phase입니다. 두 변화가 모두 +2°였다면 γ = 45°로 in-phase입니다([RM] 식 13.13, 그림 13.18, pp.311–312).</details>

7. 보행 중 무릎과 고관절 각도의 협응을 보려 합니다. CRP를 그대로 쓰면 어떤 문제가 생기고 대안은 무엇인가요?
<details><summary>정답</summary>하지 관절 각도는 사인파에서 크게 벗어나 CRP에 가짜 진동이 생길 수 있고, CRP가 주기 안에서 크게 변해 주기 내 변동성을 쓸 수 없습니다. 대안은 relative Fourier phase(기본 주파수만 비교), Hilbert transform(미분 없이 비사인파·nonstationary 신호 처리), 또는 공간적 해석이 목적이면 vector coding입니다([RM] pp.308–310, 314).</details>

8. Kelso의 손가락 실험에서 주파수를 올리면 antiphase → in-phase 전이는 있는데 반대 방향 전이는 없는 이유를 potential 그림으로 설명하세요.
<details><summary>정답</summary>in-phase 우물이 antiphase 우물보다 훨씬 깊습니다. 주파수가 오르면 antiphase 우물이 얕아지다 사라져 계가 in-phase 우물로 떨어지지만, in-phase 우물은 남아 있으므로 빠져나올 이유가 없습니다. 주파수를 다시 내려도 이미 깊은 우물 안에 있어 돌아가지 않습니다([RM] p.293, 그림 13.2).</details>

## 더 읽을거리
- 교재의 Suggested Readings([RM] p.315): Miller 외 (2010) *J Biomech* 43:2554–60(vector coding과 CRP의 변동성 비교); Hamill 외 (1999) *Clin Biomech* 14:297–308(달리기 부상과 dynamical systems); Tepavac & Field-Fote (2001) *J Appl Biomech* 17:259–70(vector coding); Van Emmerik 외 (2004) *J Appl Biomech* 20:396–420(비선형 동역학 개관); Wheat & Glazier (2006) *Movement System Variability* 167–81쪽.
- 본문에 인용된 방법 원전: Peters 외 (2003, CRP 정규화), Lamoth 외 (2002, relative Fourier phase), Rosenblum & Kurths (1998, Hilbert transform), McDermott 외 (2003, multifrequency DRP), Chang 외 (2008, coupling angle 분류)([RM] pp.301–313).
- 이 저장소: [T07 균형·자세 제어와 협응](../I-gait-theory/note-T07.md), [Day I13](../I-gait/day-I13.md)(보행 변수의 변동성). 각속도를 구하기 전의 평활화는 [R12](note-R12.md), angle-angle·phase-plane 곡선을 통째로 통계 분석하는 방법은 [R14](note-R14.md).

---
[← 이전 노트](note-R12.md) · [노트 목록](index.md) · [다음 노트 →](note-R14.md)
