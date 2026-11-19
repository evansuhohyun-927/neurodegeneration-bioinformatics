# T01 — 보행 주기와 기능 과제: phase 체계, rocker, 전진의 동력

> **이론 노트** · 심화 파트 I — 보행분석 · **읽는 시간:** 40–60분 · **관련 실습:** [Day I1](../I-gait/day-I1.md), [Day I2](../I-gait/day-I2.md), [Day I12](../I-gait/day-I12.md), [Day I20](../I-gait/day-I20.md)

## 이 노트로 이해할 것
- 보행 주기를 "사건으로 나누는 방법"(Whittle)과 "기능으로 나누는 방법"(Perry)이 왜 따로 있는지, 그리고 두 체계를 한 시간축에 겹쳐 놓는 법.
- stance·swing·double stance 비율 사이의 산술 관계(stance % = 50 % + double stance 한 번의 %)와, 속도가 이 비율을 바꾸는 방식.
- 세 기능 과제와 Perry의 네 locomotor function이 각각 무엇을 묻는 틀인지.
- rocker가 Perry에서는 4개, Whittle에서는 3개인 이유와 둘의 대응.
- "몸을 앞으로 보내는 힘은 어디서 오는가"에 대해 교재들이 서로 다른 답을 내놓는다는 사실.

## 🎬 함께 보면 좋은 영상
- [Biomechanics Lecture 11: Gait — Rehab Science](https://www.youtube.com/watch?v=QB0tJajDvMw)
- **무엇에 주목할까:** 강의가 쓰는 사건 이름(heel strike, foot flat 등)이 이 노트의 Perry 용어(IC, LR …)와 어떻게 대응하는지 표를 옆에 두고 보세요. 강의의 stance 62 %는 Perry가 평소 속도에서 잰 값입니다.

## 핵심 질문
1. Perry는 왜 "heel strike" 대신 "initial contact"라는 말을 고집하는가?
2. stance가 62 %이면 double stance는 왜 12 %가 되어야 하는가?
3. pre-swing은 발이 땅에 있는데 왜 swing limb advancement 과제에 들어가는가?
4. rocker는 몸을 앞으로 "미는" 장치인가, 떨어지는 몸을 "돌려 주는" 경첩인가?
5. push-off라고 부르는 발목의 큰 파워는 근육이 미는 것인가, 힘줄이 되튀는 것인가?

## 본문

### 1. 주기를 보는 세 가지 눈과 "initial contact"라는 이름
보행 주기(gait cycle, GC)는 한 발이 땅에 닿은 순간부터 같은 발이 다시 닿기 직전까지입니다. Perry는 이 주기를 세 층위로 본다고 정리합니다([P] 1장 Gait Cycle). ① 두 발이 바닥에 닿는 패턴(가장 단순), ② 시간·거리(stride 특성), ③ 기능적 의미에 따른 phase.

주기에는 원래 시작점이 없습니다. 발이 닿는 순간을 시작으로 삼는 것은 그 사건이 가장 잡기 쉽기 때문일 뿐입니다. 건강한 사람은 뒤꿈치로 닿지만 뇌졸중이나 뇌성마비 환자는 발 전체나 앞발로 닿기도 합니다. 그래서 Perry는 접촉 부위를 가정하지 않는 **initial contact(IC)** 를 씁니다. 이 선택이 Rancho Los Amigos 체계의 출발점입니다. 정상 보행과 병적 보행을 같은 틀로 기술하려면 이름이 특정 신체 부위를 전제하면 안 된다는 것이지요([P] 2장 도입).

**stride와 step.** stride = GC 한 번(한 다리 기준). step = 한 발 IC에서 반대 발 IC까지. stride 하나에 step이 둘입니다. 그래서 cadence(steps/min)와 stride time(s) 사이에는 `stride time = 120 / cadence`가 성립하고, 속도는 다음과 같습니다([W] 2장 p.19).

```
speed (m/s) = stride length (m) × cadence (steps/min) / 120
```

Perry의 평소 속도 기준은 82 m/min(1.36 m/s)입니다([P] 1장 Table 1-1). 같은 책이 정상 평균으로 드는 stride length 1.41 m와 cadence 113 steps/min을 곱해 2로 나누면 약 80 m/min이 나옵니다. 평균값끼리 곱한 결과가 평균 속도와 정확히 같지 않은 것은 자연스러운 일입니다(평균의 곱 ≠ 곱의 평균).

### 2. 시간 구조: 62/38/12는 서로 묶여 있다
Perry의 82 m/min 자료에서 stance 62 %, swing 38 %, initial·terminal double stance 각 12 %, single limb support(SLS) 38 %입니다. 일반적 근사로는 60/40/10/10을 씁니다([P] 1장 Table 1-1, [W] 2장 pp.17–18).

이 숫자들은 독립이 아닙니다. 두 다리가 정확히 반 주기(50 %) 어긋나 있다고 가정하면:
- 오른쪽 SLS = 왼쪽 swing (동시에 일어나므로) = 100 − S (S = stance %)
- 오른쪽 stance = initial double stance + SLS + terminal double stance = 2·DS + (100 − S)
- 따라서 S = 2·DS + 100 − S, 즉 **S = 50 + DS**

62 = 50 + 12, 60 = 50 + 10으로 맞습니다. 이 항등식에서 두 가지가 바로 나옵니다. 첫째, 빨리 걸을수록 double stance가 줄면 stance %도 50 %에 다가갑니다. 둘째, double stance가 0이 되는 지점(stance = 50 %)이 걷기와 달리기의 경계입니다. 달리기에서는 두 발이 다 떠 있는 구간이 생깁니다([P] 1장, [W] 2장 p.18).

Perry는 "double limb support" 대신 **double stance**를 씁니다. 두 발이 체중을 반씩 나눈다는 인상을 피하려는 것입니다. 실제로는 한쪽에서 다른 쪽으로 하중이 급히 넘어가는 비대칭 구간입니다. 반대로 한 발 구간은 그 다리가 체중 전부를 진다는 뜻을 살려 SLS라 부릅니다. SLS의 상대 길이는 그 다리의 지지 능력을 가장 잘 보여 주는 지표입니다([P] 1장).

**속도 효과.** 빨라지면 stance·swing의 절대 시간이 모두 줄고, 비율로는 SLS가 길어지고 double stance가 짧아집니다. 관계는 곡선이라 느린 쪽에서 변화가 더 큽니다([P] 1장 Gait Cycle Timing). 느리게 걷는 환자의 stance %가 큰 것은 병 자체가 아니라 속도의 결과일 수 있습니다. 군 비교에서 속도를 함께 보고하거나 통제해야 하는 이유입니다(I13).

### 3. 사건 체계(Whittle)와 기능 체계(Perry)를 한 축에 놓기
Whittle은 관찰 가능한 **7개 사건**으로 주기를 나눕니다([W] 2장 p.17): IC, opposite toe off(OT), heel rise(HR), opposite initial contact(OI), toe off(TO), feet adjacent(FA), tibia vertical(TV). 사건 7개가 경계가 되어 구간 7개(stance 4 + swing 3)가 생깁니다. Perry는 IC 자체를 0–2 %의 phase로 세므로 phase가 8개입니다([P] 2장).

| Perry phase | %GC (평소 속도) | 끝을 표시하는 사건 | Whittle 구간 | Perry 과제 |
|---|---|---|---|---|
| IC | 0–2 | 발이 닿은 직후 하중 반응 | (사건, 구간 아님) | WA |
| LR loading response | 2–12 | 반대 발 들림 = OT | loading response (IC→OT) | WA |
| MSt mid stance | 12–31 | 뒤꿈치 들림 = HR | mid-stance (OT→HR) | SLS |
| TSt terminal stance | 31–50 | 반대 발 닿음 = OI | terminal stance (HR→OI) | SLS |
| PSw pre-swing | 50–62 | 발끝 떨어짐 = TO | pre-swing (OI→TO) | SLA |
| ISw initial swing | 62–75 | 두 발이 나란함 = FA | initial swing (TO→FA) | SLA |
| MSw mid swing | 75–87 | 경골 수직 = TV | mid-swing (FA→TV) | SLA |
| TSw terminal swing | 87–100 | 다음 IC | terminal swing (TV→IC) | SLA |

(구간 값: [P] 2장 Phase 1–8. 표는 이 노트를 위해 새로 짠 것입니다.)

두 체계의 차이는 정의 방식에 있습니다. Whittle의 경계는 "그 사건이 언제 일어났는가"로 정해지므로 환자의 %GC가 정상과 달라도 그대로 쓸 수 있습니다. Perry의 % 경계는 정상인의 평균이므로, 환자에게 쓰려면 사건으로 다시 잡아야 합니다. 예를 들어 Whittle 6판의 예시 피험자(빠른 걸음)는 OT가 7 %, TO가 57 %입니다([W] 2장 pp.25–33). 이 값을 일반값으로 외우면 안 됩니다.

MSw의 끝(TV)은 기하학적 정의도 갖습니다. 경골이 수직이 되는 순간은 고관절 굴곡각과 무릎 굴곡각이 같아지는 순간입니다([P] 2장 Phase 7).

### 4. 세 기능 과제: 왜 weight acceptance가 가장 어려운가
Perry는 8 phase를 세 과제로 묶습니다([P] 2장 Figure 2-1).
- **Weight acceptance(WA) = IC + LR (0–12 %).** 방금 앞으로 휘둘러 온, 정렬이 불안정한 다리에 체중이 갑자기 실립니다. 충격 흡수, 초기 안정, 전진 유지를 동시에 해야 해서 가장 어려운 과제입니다.
- **Single limb support(SLS) = MSt + TSt (12–50 %).** 한 다리가 체중 전부를 지는 동안 몸이 그 발 위를 지나갑니다. MSt와 TSt는 전진 기전으로 갈립니다. MSt는 고정된 발 위에서 발목이 배측굴곡하고, TSt는 뒤꿈치가 들려 앞발 위에서 굴러갑니다.
- **Swing limb advancement(SLA) = PSw + ISw + MSw + TSw (50–100 %).** PSw는 발이 아직 바닥에 있지만, 이 시기의 움직임과 근활동이 모두 다리를 앞으로 보낼 준비에 쓰이므로 SLA에 들어갑니다.

과제 이름에 주의하세요. 실라부스나 다른 자료가 "limb advancement"라고 줄여 쓰더라도 Perry의 이름은 **swing limb advancement**이고 PSw를 포함합니다.

### 5. Perry의 네 locomotor function과 몸의 두 단위
[P] 3장 Basic Functions는 세 과제가 아니라 **네 기능**으로 짜여 있습니다: 직립 안정(upright stability), 전진(progression), 충격 흡수(shock absorption), 에너지 보존(energy conservation). 장의 대절 네 개가 그대로 이 기능입니다. 흔히 인용되는 dynamic stability, single limb support, foot rockers, propulsive forces, center of gravity alignment modulation, selective muscular control은 이 대절들 아래의 소절입니다. 같은 장의 "Single Limb Support" 소절은 2장의 과제 SLS가 아니라 한 발로 섰을 때의 관상면 균형(몸을 지지 다리 쪽으로 옮기고 고관절 외전근이 골반을 세우는 일) 이야기라는 점도 헷갈리기 쉽습니다.

Perry는 몸을 **passenger unit**(머리·팔·몸통, HAT)과 **locomotor unit**(골반과 두 다리)로 나눕니다. HAT는 체중의 약 70 %로, 걷기에 직접 기여하지 않고 실려 갑니다. 그러나 이 무거운 덩어리가 다리 위에 어떻게 정렬되느냐가 다리 근육이 해야 할 일을 정합니다. 골반은 두 단위 모두에 속하는 이중 역할을 합니다([P] 3장 Body Subdivisions).

### 6. rocker: 4개(Perry)와 3개(Whittle)
rocker는 stance 동안 발이 차례로 내놓는 회전축입니다.

| Perry | 시기 | 회전축 | 무엇이 제동하나 | Whittle 이름 |
|---|---|---|---|---|
| heel rocker | LR | 종골의 둥근 아랫면 | 전경골근 등 pretibial 근육이 발 떨어짐을 원심성으로 제동, 대퇴사두근(vastii)이 대퇴를 경골에 묶음 | heel/initial rocker |
| ankle rocker | MSt | 발목 관절 | soleus 근건이 경골 전진 속도를 늦춤(gastrocnemius 보조) | ankle/mid-stance/second rocker |
| forefoot rocker | TSt | 중족골두 | gastrocnemius·soleus가 앞으로 떨어지는 몸을 강하게 제동 | forefoot/terminal rocker (HR–TO) |
| toe rocker | PSw | 엄지발가락과 내측 전족부 앞끝 | 족저굴근의 탄성 반동이 경골을 앞으로 보냄 | (terminal rocker에 포함) |

([P] 3장 Foot Rockers, [W] 2장 pp.26–30)

Whittle은 HR부터 TO까지를 하나의 terminal rocker로 묶으므로 Perry의 toe rocker가 따로 없습니다. 충돌하는 설명이 아니라 자르는 단위가 다를 뿐입니다.

[Wi] 8.2.4(pp.184–186)는 같은 순서를 근육 수축 형태로 다시 씁니다. stance 동안 발목 모멘트–각속도 궤적을 따라가면 heel contact 뒤 배측굴곡근의 음의 일(발 내리기) → 족저굴곡근의 음의 일(경골이 발 위로 넘어가는 것을 제어) → heel-off 뒤 족저굴곡근의 양의 일입니다. 다만 TSt·PSw의 "족저굴곡근 양의 일"을 근섬유의 단축으로 볼지 힘줄의 되튐으로 볼지는 아래 7절에서 보듯 교재마다 다릅니다.

Kuo & Donelan(2010)은 다른 각도에서 봅니다. 압력중심(COP)이 발 아래를 진행하는 모습은 반지름이 다리 길이의 약 30 %인 바퀴와 비슷하고, 이렇게 호를 그리는 발은 다음 걸음으로 넘어갈 때 COM 속도의 방향 전환을 줄여 에너지 손실을 줄인다는 것입니다(T05).

### 7. 몸을 앞으로 보내는 힘은 어디서 오는가
같은 현상(발목에서 PSw 무렵 주기 중 가장 큰 양의 파워가 나온다)을 교재들이 서로 다르게 읽습니다. 이 차이를 알아야 I4의 파워 곡선과 I20의 외골격 설계 논리를 읽을 수 있습니다.

- **Perry — 떨어지는 몸과 되튀는 힘줄.** 전진의 주된 힘은 체중의 전방 낙하입니다. forefoot rocker 구간에 몸이 지지면 밖으로 떨어지는 것이 주기 중 가장 강한 추진력이고, 여기에 swing 다리의 고관절 굴곡이 앞으로 당기는 힘, swing 중 무릎 신전이 당기는 힘이 더해집니다. stance 근육은 대부분 이 낙하를 원심성으로 제동하는 브레이크입니다. 양의 파워 burst는 넷(LR 끝 고관절 신전 시작, MSt 초 대퇴사두근, PSw 발목, swing 초 고관절 굴곡)이고 가장 큰 것은 PSw 발목입니다. 2판은 이 PSw 발목 파워를, 체중이 반대 발로 넘어가며 팽팽하던 근건이 풀리는 **탄성 반동**으로 봅니다. 그 시기에 족저굴근 EMG가 거의 없고, 초음파로 본 근섬유 다발 길이가 TSt 동안 거의 변하지 않았다는 근거입니다([P] 3장 Propulsive Forces, 21장 Eccentric, 22장 Power).
- **Winter — A2 push-off.** stance 후반의 발목 파워 생성 봉우리를 A2라 부르고, 보행에서 가장 큰 에너지 생성으로 봅니다. 그 앞의 흡수가 A1입니다([Wi] 7.4.6 pp.168–170).
- **Whittle 6판 — 아직 확정되지 않음.** Perry(1974)는 능동적 밀기가 아니라 몸 정렬에 따른 지렛대 효과라며 roll-off라 불렀고, Winter(1983)는 이 구간이 발목 파워 생성이 가장 큰 때임을 보였습니다. 그 파워가 몸 전체를 가속하는지, 다리만 가속하는지는 결론이 나지 않았고, 책은 "아마 둘의 조합"이라는 입장입니다([W] 2장 p.30).
- **Kuo & Donelan — step-to-step transition.** 뒷다리의 push-off가 앞다리 충돌 직전에 일어나면 충돌 손실이 줄어든다는 역학적 해석입니다. 전진을 "만드는" 힘이라기보다 걸음 사이의 에너지 손실을 메우는 일로 봅니다(T05).

네 해석이 모두 같은 측정값(관절 파워의 큰 양의 봉우리)을 인정한다는 점이 중요합니다. 다른 것은 "그 에너지를 누가 만들었는가(근섬유 vs 힘줄)", "어디로 가는가(몸 전체 vs 다리)"에 대한 해석입니다.

### 8. 두 다리는 반 주기 어긋난 한 쌍
한 다리의 phase는 반대 다리의 phase와 짝을 이룹니다. 한쪽 IC·LR(0–12 %)은 반대쪽 PSw(50–62 %)와 겹치고, 한쪽 SLS 전반은 반대쪽 swing 전반과 겹칩니다([P] 9장 Total Limb Function and Bilateral Synergistic Relationships). 그래서 한쪽에 문제가 있으면 반대쪽 시간 변수가 바뀝니다. 한쪽 다리가 아파 그 다리로 서는 시간을 줄이면 성한 다리가 일찍 내려와 **성한 쪽** step length가 짧아집니다([W] 2장 pp.19–20). "짧은 step = 아픈 쪽"이 아니라 "짧은 step = 반대쪽 지지에 문제"입니다.

이 짝 구조는 Day I20에서 실시간 상태기계(stance/swing 2–4 상태)를 설계할 때도 쓰입니다. 8 phase를 몇 개의 상태로 줄이더라도, 한쪽 다리의 상태 전환은 반대쪽 사건과 맞물려 있습니다.

## 교재마다 다르게 말하는 것

| 주제 | Perry [P] | Whittle [W] | Winter [Wi] | RM [RM] | 그 밖 |
|---|---|---|---|---|---|
| 주기 나누기 | 기능 phase 8개, IC도 0–2 %의 phase | 사건 7개 → 구간 7개, IC는 순간 | 보행 주기 기술 체계를 따로 세우지 않음 | 시간 정규화 예를 toe-off 기준으로 자름(1장 p.23) | — |
| 두 발 구간 이름 | double stance (비대칭 강조) | double support(앞다리는 braking, 뒷다리는 thrusting) | double support | — | — |
| rocker 개수 | 4개(heel·ankle·forefoot·toe) | 3개(toe는 terminal rocker에 포함) | rocker를 수축 형태로 다시 읽음(8.2.4) | — | Kuo & Donelan: 발 = 반지름 약 0.3 L의 바퀴 |
| 전진의 동력 | 체중의 전방 낙하가 주, rocker는 회전축, 근육은 대부분 제동 | 미확정, 수동과 능동의 조합으로 봄 | A2 push-off가 최대 에너지 생성 | — | Kuo & Donelan: push-off는 충돌 손실을 메우는 일 |
| PSw 발목 파워 | 건의 탄성 반동(EMG 없음) | Perry와 Winter 견해를 함께 소개 | 족저굴곡근의 구심성 push-off(A2) | 파워 부호는 관절이 에너지를 내는지 흡수하는지일 뿐(6장) | — |
| 3장의 뼈대 | 4 locomotor function | — | — | — | — |

## 흔한 오해
- **"stance 62 %는 체중의 62 %를 싣는다는 뜻"** → 시간 비율입니다.
- **"double stance는 12 %"** → 한 번에 12 %, 한 주기에 두 번이므로 합은 약 24 %입니다.
- **"MSt는 stance의 한가운데"** → SLS의 앞 절반(12–31 %)입니다.
- **"cadence는 1분에 stride 몇 번"** → step 수입니다. stride time = 120/cadence.
- **"rocker가 몸을 밀어 앞으로 보낸다"** → Perry에서 rocker는 떨어지는 체중을 전진으로 돌리는 회전축이고, 미는 힘의 주체가 아닙니다.
- **"PSw도 stance니까 지지 과제"** → Perry 체계에서는 swing limb advancement입니다.
- **"% 경계는 환자에게도 그대로"** → 정상 평균입니다. 환자는 사건으로 다시 잡습니다.

## 자기 점검

1. stance가 58 %로 측정된 사람의 double stance 한 번의 길이는 몇 %로 예상되나요? 이 계산에 깔린 가정은?
<details><summary>정답</summary>S = 50 + DS에서 DS = 8 %. 두 다리가 정확히 50 % 어긋나 있고 좌우가 대칭이라는 가정입니다. 비대칭 보행에서는 좌우를 따로 재야 합니다.</details>

2. Whittle의 7개 사건 중 Perry의 MSt/TSt 경계와 PSw/ISw 경계에 해당하는 것은?
<details><summary>정답</summary>MSt/TSt = heel rise, PSw/ISw = toe off.</details>

3. Perry가 heel strike 대신 initial contact를 쓰는 이유를 한 문장으로.
<details><summary>정답</summary>환자는 뒤꿈치가 아닌 부위로 닿을 수 있으므로, 접촉 부위를 가정하지 않는 이름이어야 정상·병적 보행을 같은 틀로 기술할 수 있기 때문입니다.</details>

4. Perry의 toe rocker는 Whittle 체계에서 어디에 들어가나요?
<details><summary>정답</summary>HR부터 TO까지를 묶은 forefoot/terminal rocker에 포함됩니다.</details>

5. 왼발 step length가 오른발보다 짧습니다. 어느 다리의 지지를 먼저 의심하나요?
<details><summary>정답</summary>오른쪽입니다. 왼발 step은 오른발 위에 서 있는 동안 왼발이 앞으로 가는 거리이므로, 오른쪽 single support가 짧으면 왼발이 일찍 내려와 왼쪽 step이 짧아집니다.</details>

6. PSw의 큰 발목 양의 파워를 Perry와 Winter는 각각 무엇으로 설명하나요? 두 해석이 공통으로 인정하는 사실은?
<details><summary>정답</summary>Perry: 근건에 저장된 장력이 체중이 넘어가며 풀리는 탄성 반동(근섬유 단축이 아님). Winter: 족저굴곡근의 구심성 push-off(A2). 둘 다 이 시기의 발목 파워가 주기 중 가장 큰 양의 봉우리라는 측정 사실은 인정합니다.</details>

7. weight acceptance가 세 과제 중 가장 어려운 이유는?
<details><summary>정답</summary>앞으로 휘둘러 온 불안정한 다리에 체중이 갑자기 실리는 동안 충격 흡수, 안정, 전진 유지를 동시에 해야 하기 때문입니다.</details>

## 더 읽을거리
- [P] 1장 Gait Cycle(Table 1-1), 2장 Phases of Gait, 3장 Basic Functions(Foot Rockers, Propulsive Forces, Shock Absorption), 9장 Total Limb Function and Bilateral Synergistic Relationships.
- [W] 2장 Terminology Used in Gait Analysis, Overview of the Gait Cycle, The Gait Cycle in Detail (pp.16–33).
- [Wi] 8.2.4 (pp.184–186: 발목 모멘트–각속도 궤적), 7.4.6 (pp.168–170: 파워 봉우리 이름).
- Kuo AD, Donelan JM. Dynamic principles of gait and their clinical implications. *Phys Ther*. 2010;90(2):157–174. [doi:10.2522/ptj.20090125](https://doi.org/10.2522/ptj.20090125)

---
[← 이전 노트](index.md) · [이론 노트 목록](index.md) · [다음 노트 →](note-T02.md)
