# R08 — Electromyographic Kinesiology: EMG 신호의 기원, 기록·처리, 진폭·주파수 해석과 응용

> **교재 노트** · 심화 파트 J — 생체역학 연구방법 · **교재:** [RM] 8장 pp.179–202 · **읽는 시간:** 55–65분 · **함께 읽기:** [T04 근육과 EMG](../I-gait-theory/note-T04.md), [Day I5](../I-gait/day-I5.md)

## 이 노트로 이해할 것
- 근섬유 활동전위에서 motor unit action potential(MUAP), 표면 EMG까지 신호가 합쳐지는 경로.
- monopolar·bipolar·double differential 기록과 common-mode rejection이 하는 일.
- 전극 종류·위치·방향, 필터 대역, 표본화율을 정할 때 교재가 주는 기준과 단서.
- 피하지방, 근육 길이·깊이, crosstalk처럼 근활성과 무관하게 신호를 바꾸는 요인.
- 진폭 변수 다섯 가지와 주파수 변수의 정의, 그리고 주파수 해석에 붙는 경고.
- 정규화, EMG–힘 관계, 보행·허리 통증·피로 연구에서 EMG를 읽을 때의 한계.

## 🎬 함께 보면 좋은 영상
- [Biomechanics of Movement | Lecture 5.1: From Electricity to Force: Neuromuscular Biomechanics — Biomechanics of Movement](https://www.youtube.com/watch?v=CGC2KhTMLmI)
- [Biomechanics of Movement | Demo: Recording EMG to Study Muscle Activity — Biomechanics of Movement](https://www.youtube.com/watch?v=pYnZzQ0D_Bs)
- [Surface Electromyography (SEMG) Signal Processing | Part 1 — ThatsEngineering](https://www.youtube.com/watch?v=5AtAoO51vWQ)
- **무엇에 주목할까:** 전기적 신호가 근력으로 이어지는 신경근 과정과, 근활동을 연구하기 위해 근전도를 기록하는 시연을 봅니다. 표면 근전도 신호처리 영상에서는 기록한 원신호를 어떻게 처리하는지에 주목합니다.

## 핵심 질문
1. 표면 EMG의 한 순간 값은 무엇의 합인가?
2. 차동 증폭기는 왜 전원선 잡음을 줄이며, 왜 motor point 위에서는 신호까지 줄이는가?
3. 50–60 Hz notch filter로 신호가 깨끗해 보이면 좋은 것인가?
4. EMG 진폭이 커지면 근력도 그만큼 커졌다고 말할 수 있는가?
5. 주파수가 올라갔다는 사실만으로 속근 운동단위가 더 동원됐다고 할 수 있는가?
6. 최대 등척성 수축으로 정규화하는 방법은 언제 맞지 않는가?

## 교재 절 지도

| 교재 절 (원제) | 쪽 | 이 노트 |
|---|---|---|
| (장 도입, 제목 없음) | 179 | 1절 |
| PHYSIOLOGICAL ORIGIN OF THE ELECTROMYOGRAPHIC SIGNAL | 179 | 1절 |
| · Muscle Fiber Action Potential | 179 | 1절 |
| · · Resting Membrane Potential / Action Potentials | 179–180 | 1절 |
| · Muscle Fiber Conduction Velocity | 180 | 1절 |
| · Motor Unit Action Potential | 180–181 | 2절 |
| · · Motor Unit Activation | 181 | 2절 |
| · · Motor Unit Action Potential and the Electromyographic Signal | 181–182 | 2절 |
| RECORDING AND ACQUIRING THE ELECTROMYOGRAPHIC SIGNAL | 182–183 | 3절 |
| · Electrode Types | 183 | 4절 |
| · · Surface Electrodes / Fine-Wire Electrodes / Needle Electrodes / Other Electrode Designs | 183–185 | 4절 |
| · Electrode Geometry and Placement | 185–186 | 5절 |
| · Electromyographic Signal Processing | 186 | 6절 |
| · · Application of Analog and Digital Filtering / Analog-Digital Data Acquisition | 186 | 6절 |
| · FROM THE SCIENTIFIC LITERATURE: Masuda, Miyano, and Sadoyama 1992 (상자) | 186 | 5절 |
| · Influences on the Electromyographic Signal | 186 | 7절 |
| · · Electrodes / Blood Flow and Tissue Influences / Muscle Length / Muscle Depth | 186–187 | 7절 |
| · · Crosstalk | 187–188 | 7절 |
| ANALYZING AND INTERPRETING THE ELECTROMYOGRAPHIC SIGNAL | 188 | 8절 |
| · Electromyographic Amplitude | 188 | 8절 |
| · · Peak-to-Peak Amplitude / Average Rectified Amplitude / Root Mean Square Amplitude / Linear Envelope / Integrated Electromyography | 188–190 | 8절 |
| · Electromyographic Frequency Characteristics | 190 | 9절 |
| · · Turning Points and Zero Crossings / Mean and Median Frequency | 190–191 | 9절 |
| · Other Electromyographic Analysis Techniques | 191 | 10절 |
| · · Onset-Offset Analysis / Polar Plots and Phase-Plane Diagrams / Other Analysis Techniques | 191–192 | 10절 |
| · Normalization of the Electromyographic Signal | 192–193 | 10절 |
| APPLICATIONS FOR ELECTROMYOGRAPHIC TECHNIQUES | 193 | 11절 |
| · Muscle Force versus EMG Amplitude Relationships | 193–194 | 11절 |
| · Gait | 194 | 12절 |
| · · Sprinting / Developmental Gait Issues / Gait Disorders | 194–197 | 12절 |
| · Electromyography in Ergonomics | 197 | 13절 |
| · · EMG and Carpal Tunnel Injuries (Sensory and Motor Conduction Velocity / Other Applications) | 197–198 | 13절 |
| · · EMG and Low Back Pain | 198–200 | 13절 |
| · Electrophysiological Assessment of Muscle Fatigue | 200 | 14절 |
| · · Electromyographic Activity During Prolonged Isometric Contractions | 200–201 | 14절 |
| SUMMARY | 201 | 14절 끝 |
| SUGGESTED READINGS | 201 | 더 읽을거리 |

(p.202는 빈 쪽입니다. 들여쓰기 단계는 인쇄본의 제목 크기를 보고 정한 것이며, Gait 아래 세 소절과 Motor Unit Action Potential 아래 두 소절의 위계는 추출 텍스트만으로 확정하지 못했습니다.)

## 본문

### 1. 신호의 생리적 기원: 막전위, 활동전위, 전도 속도
Electromyography(근전도)는 근육의 전기 활동을 다루며, 수의·반사 운동의 제어와 실행에 관한 정보를 줍니다([RM] p.179). 처리 기법을 배우기 전에 신호가 어디서 오는지를 먼저 봅니다.

- **안정막전위(resting membrane potential).** 근섬유 안쪽은 쉬고 있을 때 약 −90 mV이며, 근초(sarcolemma) 양쪽의 Na+, K+, Cl− 농도 차이에서 생깁니다. 지근(slow-twitch) 섬유는 약 9–15 mV 더 양(+)에 가깝고, 이 값은 고정되지 않아 훈련으로도 달라질 수 있습니다([RM] p.179).
- **활동전위(action potential, AP).** 막의 Na+ 투과성이 변하면 Na+가 들어와 극성이 뒤집히고, 섬유 안쪽이 바깥에 비해 약 30 mV 양이 됩니다. 이어서 K+가 빠져나가며 재분극됩니다([RM] pp.179–180).
- **전파.** AP는 신경근접합부에서 **양쪽 방향으로** 수동적으로 퍼지고, 가로세관(transverse tubule)을 따라 섬유 깊은 곳까지 들어갑니다. 운동신경 축삭 말단의 길이가 섬유마다 조금씩 달라 활성 시작 시점도 조금씩 어긋납니다([RM] p.180, 그림 8.1).

**근섬유 전도 속도(muscle fiber conduction velocity).** AP가 퍼지는 속도는 EMG의 여러 성질을 정합니다. 느리게 움직이는 AP는 표면 EMG에 저주파 성분을 보탭니다([RM] p.180). 속근(fast-twitch) 섬유는 AP 진폭이 크고 탈분극·재분극이 빨라 전도 속도가 빠릅니다. 굵은 섬유는 AP가 크고, 위축된 섬유는 전도가 뚜렷이 느리며, 섬유가 길어지면 전도 속도가 줄어드는 경향이 있습니다([RM] p.180).

### 2. 운동단위, MUAP, 그리고 간섭 신호
- **운동단위(motor unit)**는 운동신경세포 하나와 그것이 지배하는 근섬유 전부입니다. 신경세포 하나가 지배하는 섬유 수(innervation ratio)는 보통 수백 개이고, 근육에 따라 약 10개에서 수천 개까지 다릅니다([RM] pp.180–181).
- **MUAP**는 한 운동단위에 속한 섬유들의 전기 활동을 합친 것입니다. 섬유가 많거나 굵을수록 크지만, 깊은 섬유일수록 표면 신호에 덜 기여합니다([RM] p.181, 그림 8.2).
- **힘 조절.** 작은 운동단위부터 동원되고(recruitment), 발화율(firing rate)이 오를수록 힘이 커집니다. 수축 시작 때 짧은 간격의 두 번 발화(doublet)가 나타날 수 있고, 둘 이상의 운동단위가 동시에 발화하는 synchronization도 있습니다. 교재는 synchronization이 힘 생성에서 맡는 역할이 분명하지 않다고 적습니다([RM] p.181).
- **표면 EMG.** 어느 순간의 신호는 그때 활성인 모든 운동단위의 전기적 합입니다. 양·음 위상이 서로 상쇄될 수 있습니다([RM] p.182).
- **저자의 단서([RM] p.182).** 수축이 강해지면 진폭이 커지지만 진폭–힘 관계는 흔히 비선형입니다. 길항근의 동시수축이 있으면 주동근이 보상 활동을 더 해야 하므로, EMG 증가를 같은 크기의 힘 증가로 가정할 수 없습니다. 또 손목 굴곡처럼 협력근(synergist)이 함께 일하는 동작에서는 이웃 근육의 활동도 표면 전극에 잡힙니다([RM] p.181).

### 3. 기록 구성과 증폭기
| 구성 | 전극 | 성질 | 쓰임과 주의 |
|---|---|---|---|
| monopolar | 근육 위 1개 + 전기적 중립 부위 1개 | 주파수 응답이 낮고 선택성이 떨어짐 | 정적 수축, 바늘 전극 임상 검사, H·T 반사와 M-wave. 본래 덜 안정적이라 비등척성 수축에는 부적합 |
| bipolar (single differential) | 근육 위 2개 + 접지 1개 | 두 전극의 차이를 기록 | 훨씬 흔함 |
| double differential | 일렬로 놓은 3개, 증폭기 3대 | 먼 신호원을 더 줄임 | crosstalk 감소에 쓰일 수 있음 |

(내용: [RM] pp.182, 188, 그림 8.3 p.182. 표는 이 노트를 위해 정리한 것입니다.)

차동 증폭기는 두 입력에 공통으로 들어온 신호를 크게 줄입니다. 이 성질이 common-mode rejection이고, 정도를 common-mode rejection ratio(CMRR)로 나타냅니다. 아주 좋은 상용 증폭기는 100 dB쯤이며 선형 비로는 100,000:1입니다([RM] p.182).

```
CMRR(dB) = 20 · log10( CMRR(linear) )      (8.1)
```

- 전등·콘센트에서 오는 전원선 잡음(지역에 따라 50 또는 60 Hz)은 EMG의 주파수 범위 한가운데에 있습니다. 두 입력에 같은 위상으로 들어오므로 차동 증폭으로 크게 줄어듭니다([RM] p.182).
- **이득(gain).** 신호가 증폭기 한계를 넘으면 포화되어 clipping이 생기고, 이득이 너무 낮으면 A/D 변환 뒤 분해능이 나빠집니다. 신호 진폭이 A/D 변환기의 범위에 맞도록 정합니다([RM] pp.182–183). [RM] 그림 8.4(p.183)는 clipping, DC offset, 움직임 잡음, 접지 전극 누락, ECG 혼입을 나란히 보여 줍니다.

### 4. 전극 종류
전극은 과제, 연구 질문, 대상 근육에 따라 고릅니다([RM] p.183).

**표면 전극(surface electrode).**
- 피부 안팎 층 사이에는 보통 30 mV의 전위가 있고, 피부가 늘어나면 약 25 mV로 떨어집니다. 이 5 mV 변화가 움직임 잡음(motion artifact)으로 기록됩니다. 은–염화은(silver–silver chloride) 전극을 쓰고 피부를 가볍게 문질러 보통 50 kΩ인 피부 임피던스를 낮추면 줄일 수 있습니다. 전극은 주변 RF 잡음의 안테나 노릇도 하므로 전극 간 임피던스를 낮추고, 케이블은 짧게, 차폐선으로, 서로 꼬아 씁니다([RM] p.184).
- **active electrode**는 unity gain 증폭기를 전극 바로 옆에 둔 것으로, 케이블 움직임에서 오는 잡음을 줄이고 신호 대 잡음비(SNR)를 높입니다([RM] p.184).
- 유효 기록 범위는 피부에서 10–20 mm로 추정됩니다. 깊은 근육과 작은 근육에는 한계가 있고, 더 크고 해당계(glycolytic) 성질이 강한 운동단위 쪽으로 치우쳐 기록될 수 있습니다([RM] pp.184–185).

**삽입형 전극.** fine-wire 전극은 지름 약 75 µm의 절연선 두 가닥을 속이 빈 바늘로 넣은 뒤 바늘만 빼는 방식입니다. 절연을 많이 벗길수록 기록 부피가 커집니다([RM] p.185). needle 전극은 주로 개별 운동단위를 보는 데 쓰이고, concentric 전극은 속이 빈 cannula 가운데에 선을 고정하고 끝을 약 15° 예각으로 자른 것입니다([RM] p.185). 그 밖에 전파하는 AP를 보는 longitudinal array, 전극면 9개 이상을 격자로 놓는 2-D array, 3축 가속도계를 넣은 무선 전극이 소개됩니다. 표면 다중 전극 배열로 개별 AP를 기록하려는 시도도 있으나 피부 가까운 섬유로 치우칩니다([RM] p.185).

### 5. 전극 배치와 기하
- 힘줄이 많은 부위를 피합니다. **motor point(신경이 근육으로 들어가는 곳)도 좋은 자리가 아닙니다.** MUAP가 접합부에서 양쪽으로 퍼지므로, 그 위에서는 두 전극에 공통인 신호가 차동 증폭에서 상쇄됩니다. 여러 회기에 걸친 연구에서 종판 구역(endplate zone)은 변동이 가장 큰 신호를 낼 수 있습니다([RM] p.185).
- 전극이 근섬유와 평행하지 않으면 진폭이 최대 50%까지 줄 수 있고 주파수 성분도 달라집니다. 우상각(pennation angle)을 알기 어렵더라도 평행하게 놓으려 노력해야 합니다([RM] p.185).
- **전극 간 거리.** 근거는 엇갈립니다. 기록면 지름 7 mm 전극에서 약 60 mm 간격이 가장 큰 진폭을 냈다는 보고가 있지만, 뒤의 연구는 전극 종류·면적·간격에 따른 복합근 AP 진폭 차이를 찾지 못했습니다. 간격이 좁을수록 스펙트럼 주파수는 높게 나옵니다([RM] p.185). 결론은 회기 사이, 피험자 사이에 가능한 한 많은 조건을 일정하게 두라는 것입니다([RM] p.186).

**Masuda 등(1992) 상자([RM] p.186).** 위팔두갈래근 위에 선형 표면 전극 배열을 놓고 전파하는 AP를 추적했습니다. 신경지배 구역 근처에서 AP의 극성이 뒤집히므로 motor point 위치를 찾을 수 있고, 저자들은 회귀 기법으로 이를 자동 계산하는 프로그램을 기술했습니다.

### 6. 필터링과 표본화
- 스펙트럼을 보면 약 10 Hz 아래나 1 kHz 위에는 신호가 거의 없습니다. 표면 EMG는 더 좁아 가장 높은 성분이 약 400 Hz이고, 근육 안에서 기록한 신호는 고주파 성분이 더 많습니다. 그래서 표면 EMG는 약 10 Hz high-pass, 약 1 kHz antialiasing low-pass로 받으라는 권고가 흔합니다. 다만 정확한 대역에 대해서는 의견이 갈립니다([RM] p.186).
- **표본화율.** Nyquist 한계에 따라 신호 최고 주파수의 두 배 이상이어야 하고, 표면 EMG에서는 대개 초당 1000 표본 이상이 필요합니다([RM] p.186).
- **notch filter 경고.** 50–60 Hz에는 EMG 자체의 성분이 많으므로 notch filter를 쓰면 신호의 상당 부분이 함께 사라집니다. 교재는 장비 환경, 전극, 접지 구성, 전극–피부 접촉을 고치는 쪽을 권합니다([RM] p.186).

**추가 설명:** 교재 p.186은 antialiasing filter를 "Nyquist 한계(신호의 최고 주파수)"에 둔다고 적습니다. 신호 처리의 일반 용어로 Nyquist 주파수는 표본화율의 절반을 가리키므로, 다른 자료와 대조할 때 용어 차이에 주의합니다.

### 7. 근활성과 무관하게 신호를 바꾸는 요인
- **전극과 피하지방.** 진폭은 전극–근육 거리가 늘수록 거듭제곱 함수로 줄어듭니다. 비만인 사람의 피하지방층은 마른 사람보다 400–500% 두꺼울 수 있고, 지방층 두께가 EMG 분산의 50% 이상을 설명할 수 있습니다. 지방층이 매우 두꺼우면 정규화를 시도하라는 권고가 있습니다([RM] p.187).
- **조직과 혈류.** 근육과 전극 사이의 조직은 강한 low-pass filter입니다. 근섬유에서 100 µm만 떨어져도 신호 세기의 약 80%가 사라집니다. 수축 때 늘어나는 근혈류도 저역 통과 효과를 낼 수 있고, 피로·탈수·혈류 차단처럼 Na+가 변하는 상황도 EMG에 영향을 줄 수 있습니다([RM] p.187).
- **근육 길이.** 길어지면 전도 속도와 AP 진폭이 줄고 스펙트럼이 저주파 쪽으로 옮겨 갑니다. 동적 수축의 EMG를 해석하기 어려운 이유 가운데 하나입니다([RM] p.187).
- **근육 깊이.** 깊은 섬유는 지근 성질이 더 많고 낮은 힘에서 동원되는 것으로 보이므로, 표면 EMG는 얕고 AP가 큰 속근 섬유 쪽으로 치우칠 수 있습니다([RM] p.187).

**Crosstalk(혼선)([RM] pp.187–188).** 근육은 부피 전도체라서 이웃 근육의 신호가 그대로 전해집니다(예: gastrocnemius의 활동이 soleus 위 전극에 잡힘).
- 크기에 대해서는 논쟁이 있습니다. 상당하고 자주 과소평가된다는 쪽과 아주 작다는 쪽이 모두 있으며, 교재의 입장은 문제가 될 수 있는 상황이면 연구자가 직접 그 정도를 확인해야 한다는 것입니다. 피하지방층이 두꺼울수록 커집니다.
- 발바닥굽힘 뒤 발등굽힘을 하는 과제에서 표면 전극은 발등굽힘 구간에 soleus 활동을 기록했지만 wire 전극에서는 활동이 없었습니다. 동시수축으로 여겨지던 것이 길항근에서 온 crosstalk였습니다(Etnyre and Abraham 1988).
- 확인·감소 방법: 길항근의 운동신경을 자극한 뒤 눈으로 확인, 두 근육 EMG의 교차상관(cross-correlation), double differential 기록, 기록 면적이 작은 wire 전극.

### 8. 진폭 변수
진폭은 근활성의 크기를 나타내며 주로 활성 운동단위 수와 발화율에 따라 커집니다. 다만 앞 절의 기술적·생리적 요인이 진폭과 주파수 모두에 영향을 줍니다([RM] p.188).

| 변수 | 구하는 법 | 교재의 주의 | 쪽 |
|---|---|---|---|
| peak-to-peak (p-p) amplitude | 음의 정점에서 양의 정점까지 | 동기성이 높은 신호(M-wave, H-reflex)에 특히 유용 | 188 |
| average rectified amplitude | 정류(절댓값) 뒤 평균 | 원신호는 평균이 0이라 그냥 평균은 진폭 지표가 못 됨 | 188–189 |
| root mean square (RMS) amplitude | 식 8.2 | 제곱을 쓰므로 정류가 필요 없음 | 189 |
| linear envelope | 전파 정류 신호에 low-pass filter | 차단 주파수는 다소 임의적(3–50 Hz 제안, 대체로 10 Hz면 무난, 짧은 동작은 더 높게). onset·offset 분해능이 떨어짐 | 189 |
| integrated EMG | 정해진 시간 동안 누적 합, 이후 0으로 재설정 | 엄밀한 정의가 있는데 정류 평균이나 RMS와 자주 혼동됨 | 190 |

(표는 이 노트를 위해 정리한 것입니다. 네 가지 처리 결과의 모양은 [RM] 그림 8.7, p.189.)

```
RMS[EMG(t)] = [ (1/T) · ∫(t → t+T) EMG²(t) dt ]^(1/2)      (8.2)
EMG: 각 시점의 신호 값,  T: 분석 구간의 길이      ([RM] p.189)
```

- **M-wave**는 말초 운동신경을 자극해 운동신경세포를 동시에 활성시킨 동기 신호이고, 자극이 충분히 세면 그 근육이 낼 수 있는 최대 전기 활동이 됩니다. **H-reflex**는 약한 자극으로 Ia 구심섬유만 활성시켜 얻으며, 모든 운동신경세포가 활성되는 일이 드물어 M-wave보다 작습니다([RM] p.188, 그림 8.6).
- **추가 설명:** 표본 N개로 된 디지털 신호에서는 식 8.2의 적분이 합으로 바뀌어 RMS = sqrt( (x1² + … + xN²) / N )이 됩니다.

### 9. 주파수 변수와 해석의 경고
- **turning point와 zero crossing.** 신호가 방향을 바꾸는 횟수, 0 기준선을 지나는 횟수를 단위 시간당 세는 가장 간단한 주파수 추정입니다. 임상에서 신경근 병리 기술에 쓰이고, zero crossing 수는 스펙트럼 분석 변수와 상관이 높습니다([RM] p.190).
- **mean / median frequency.** 표면 EMG 스펙트럼은 양의 방향으로 치우쳐 있으며 평균이 약 120 Hz, 중앙값이 약 100 Hz입니다([RM] p.190, 그림 8.8). 이 변수들은 근섬유 전도 특성의 변화를 반영하는 일이 많으므로, 신경·중추 구동보다는 말초 근육 변화의 표지로 읽는 편이 낫습니다([RM] p.190).

**교재의 경고([RM] pp.190–191).** 주파수 특성은 잘못 해석되거나 지나치게 해석되는 일이 잦습니다.
1. 주파수 증가가 곧 속근 운동단위의 추가 동원은 아닙니다. 지근 단위의 발화율 증가, 전도 속도가 빠른 섬유의 활성, synchronization 감소, 협력근의 추가 활성일 수도 있습니다.
2. 주파수 감소가 곧 synchronization 증가도 아닙니다. 활성 단위 수 감소, 발화율 감소, 전도 속도 저하, 근육 내 환경 변화일 수 있습니다.
3. 스펙트럼 계산은 분석 구간 안에서 주파수 성분이 변하지 않는다는 **정상성(stationarity)**을 가정합니다. 등척성 수축의 짧은 구간에서는 대체로 맞지만 동적 수축에서는 일반적으로 깨지고, 그 정도는 과제에 달려 있습니다. 대안은 짧은 구간(epoch)으로 나눠 분석하거나 Choi-Williams 분포, wavelet 분석을 쓰는 것입니다.

### 10. onset 분석, 그림 기법, 정규화
- **onset–offset.** 근활성의 시작과 끝을 찾을 때는 고주파 성분이 걸러지지 않았는지 확인해야 합니다. 필터링은 시점 판정을 늦춥니다. [RM] 그림 8.9(p.191)는 500 Hz, 50 Hz, 10 Hz로 평활화할수록 onset 판정이 부정확해지는 것을 보여 줍니다. 주관적인 알고리듬이 많고, 문턱값이나 활성 변화율을 쓰는 더 객관적인 방법도 있습니다([RM] p.191).
- **phase-plane diagram과 polar plot.** 운동학 변수(예: 무릎 각도와 각속도)와 주동근·길항근 EMG를 한 그림에 묶어 봅니다([RM] p.192, 그림 8.10). wavelet, 자기회귀 모델, 신경망 분류, 프랙털 분석 등 다른 기법도 용도에 맞게 고려합니다([RM] p.192).

**정규화(normalization)([RM] pp.192–193).** 피험자·근육·날짜가 다르면 기술적·생리적 요인이 진폭 차이에 섞입니다. 처치에 따른 변화를 볼 때는 정규화한 값을 보고해야 잘못된 해석을 피할 수 있습니다.
- 가장 흔한 기준은 최대 등척성 수축 때의 EMG입니다. 최대 M-wave의 p-p 값이나 면적을 쓰는 방법도 있습니다.
- 동적 수축 연구에서는 최대 등척성 기준이 이상적이지 않고 해석 오류를 낳을 수 있습니다. 보행이라면 주기를 구간으로 나누고 그 안의 최대 진폭을 100%로 두는 방법이 있습니다.
- **항상 필요한 것은 아닙니다.** 한 근육군을 여러 날에 걸쳐 보는 단순한 설계에서는 절댓값 보고가 타당하고 신뢰할 수 있으며 상대 점수보다 의미 있을 수 있습니다. 최대하(submaximal) 등척성 수축의 진폭이 최대 수축보다 신뢰도가 높아 보인다는 보고도 있어, 정규화 기준으로 고려할 만합니다.

### 11. 응용: EMG–힘 관계
- 등척성 조건에서 EMG 진폭과 근력은 흔히 선형이지만 예외가 많습니다. 곡선 관계도 자주 관찰되며, 힘의 낮은 끝과 높은 끝에서 작은 힘 증가에 큰 진폭 증가가 따를 수 있습니다([RM] p.193, 그림 8.11).
- 이 관계는 EMG 처리 기법에 따라 달라지므로 획득·처리 방법을 자세히 보고해야 합니다([RM] pp.193–194). 지식의 대부분은 등척성 실험에서 나왔습니다. 자전거 타기에서는 같은 발바닥굽힘근이라도 soleus는 선형, gastrocnemius는 비선형일 수 있고, 근육 온도와 피로도 관계를 바꿉니다([RM] p.194).
- 힘과 주파수의 관계는 대개 비선형이며, 평균·중앙 파워 주파수는 최대 수의 수축의 약 20–30%까지 빠르게 오릅니다([RM] p.194, 그림 8.12).
- **한계.** 기존 문헌의 거의 전부는 EMG와 **외부로 나온 힘**의 관계만 다뤘습니다. 근육 내부 힘과 전기적 활성의 관계는 아직 충분히 이해되지 않았습니다([RM] p.194).

### 12. 응용: 보행
보행에서는 근육의 활성 순서와 상대 크기가 관심사입니다. 순서를 정확히 보려면 적절한 onset 알고리듬이 필요하고 이때 원신호가 유용할 수 있습니다. linear envelope로 진폭을 볼 때는 정규화가 필요할 수 있습니다. 주기적으로 반복되는 동작이라 여러 주기를 분석할 수 있다는 것이 장점입니다([RM] p.194).

**Sprinting([RM] pp.194–195).**
- 빠른 주기 동작이라 피부·전극 움직임 잡음이 크고, 특히 heel-strike나 피부가 많이 늘어나는 구간에서 두드러집니다. 주의해서 기록하면 최고 속도에서도 신뢰할 만한 결과를 얻을 수 있습니다.
- iliacus, psoas, tibialis posterior처럼 작거나 깊은 근육은 표면 EMG가 이웃 근육 활동에 오염되기 쉬워 삽입형(대개 fine-wire) 전극이 중요합니다. 표면 전극의 활성 지속 시간은 wire 전극보다 최대 80% 길게 나올 수 있으므로, onset–offset이 중요하면 삽입형을 고려합니다.
- 해부학적 지표에 따른 전극 위치 선정은 대부분의 연구 질문에 무난하며 SENIAM 권고(www.seniam.org)가 있습니다. 그러나 같은 근육이라도 부위에 따라 신호가 크게 다르고, 신경지배 구역이나 힘줄 구역에 놓으면 신뢰도가 떨어집니다. 여러 날에 걸쳐 부착 위치가 달라질 때 가장 심각합니다.
- 달리기의 원심성 구간 hamstrings 활동과 근육 손상의 관련을 볼 때, 활성 시점과 지속 시간은 평균하거나 필터링한 신호보다 원신호에서 가장 잘 보입니다.

**발달·노화와 보행 장애.**
- **발달과 노화([RM] pp.195–197, 그림 8.13 p.196).** 성인은 구분된 짧은 구간에만 활성이 나타나고 그 사이에는 활동이 거의 없습니다. 막 걷기 시작한 영아는 대부분의 근육이 길게 활성되고 주동근–길항근 동시수축이 여러 곳에서 보이며, 일부 노인에서는 동시수축이 안정화 수단으로 다시 나타납니다. 영아는 피하지방이 상대적으로 많아 기록이 어려울 수 있으나, 전극 간 임피던스를 5 kΩ 미만으로 낮춘 연구가 있어 이 관찰은 믿을 만할 수 있다고 교재는 봅니다. 노인도 피하지방이 늘어 같은 점을 살펴야 합니다. 새 과제를 배우는 성인에게서도 처음에는 필요 없는 근육까지 켜는 양상이 나타났다가 점차 정돈됩니다.
- **보행 장애([RM] p.197).** 전방십자인대 손상에 따른 미세한 변화를 패턴 분석으로 기술한 예가 있습니다. foot drop에서는 heel-strike 전에 tibialis anterior 활동이 부족하거나 없음을 표면 EMG로 확인할 수 있습니다.

### 13. 응용: 인간공학
**손목굴(carpal tunnel)과 신경 전도 속도([RM] pp.197–198).** 정중신경의 감각 전도 속도는 먼쪽 손목 주름에서 약 3 cm 몸쪽에 약한 자극을 주고 둘째 또는 셋째 손가락의 고리 전극으로 기록해 잽니다. 신호가 보통 20–50 µV로 작아 여러 시행을 평균합니다(spike-triggered averaging, 그림 8.14 p.198). 이 평균은 시행마다의 잡음이 무작위라는 가정에 기대며, 그러면 잡음은 0으로 평균됩니다. 자극에서 신경 AP까지의 시간(latency)과 자극–기록 부위 사이 거리로 전도 속도(m/s)를 구하고, 반응이 전혀 없으면 두 부위 사이의 완전 전도 차단입니다. 교재는 표면 EMG가 주관적 편안함 보고를 검증한 예로 키 작동력 0.83 N인 키보드 연구도 듭니다([RM] pp.197–198).

```
전도 속도(m/s) = 자극 부위–기록 부위 거리(m) / latency(s)      ([RM] p.197의 설명을 식으로 옮김)
```

**허리 통증([RM] pp.198–200).** 미국에서 허리 통증은 산재 보상 비용의 3분의 2를 차지합니다.
- 등 근육은 구조가 복잡합니다. multifidus의 얕은 부분은 여러 분절을 건너 폄에 유리하고, 깊은 섬유는 한두 분절만 건너 요추 분절을 부적절한 전단·비틀림에서 보호합니다. 근육량 대부분이 얕은 부분에 있어 표면 EMG에 유리한 면이 있지만 두 부분의 역할은 다릅니다.
- **ECG 잡음.** 몸통 근육 기록에는 심전도가 섞이며 힘이 작은 수축에서 특히 문제입니다. 진폭을 부풀리고 저주파 성분으로 주파수 특성도 바꿉니다. 가장 좋은 해법은 ECG가 잡히지 않는 위치에 전극을 두는 것이지만 대개 어렵습니다.
- 제거 방법: ECG template를 만들어 빼는 방법([RM] 그림 8.15, p.199), 디지털 필터링, adaptive filter, wavelet·독립성분분석. 한 비교 연구는 4차, 30 Hz high-pass Butterworth filter가 가장 효율적이라고 결론지었고, template subtraction은 효과는 좋으나 시간이 많이 들었습니다.
- 척주세움근의 세 근육이 항상 함께 활동하지는 않는다는 오래된 관찰이 있어, 진폭이 크거나 작다는 것만으로 특정 근육의 이상을 말하기 어렵습니다. 진폭보다 **활성 시점**이 더 중요할 수 있습니다. 피로 과제에서 중앙 주파수 감소는 건강한 사람에서 더 컸다는 보고가 있고, 환자군에서는 흉추부가 요추부보다 중앙 주파수가 낮았으나 대조군에서는 반대였습니다. 전극 위치가 결론을 바꿀 수 있고, 근육의 서로 다른 부분을 기록하려면 wire 전극이 필요한 경우가 많습니다.

### 14. 응용: 근피로의 전기생리학적 평가
- 피로는 말초(근육) 또는 중추(신경) 기전에서 올 수 있습니다([RM] p.200).
- **최대 등척성 수축을 지속하면** EMG 진폭이 힘과 나란히 줄어듭니다. 말초 몫을 가려내려면 신경을 전기 자극해 중추의 영향을 빼고 M-wave를 봅니다. M-wave 진폭은 장시간 근활성에서 대개 줄고, 특히 오래 지속되는 저강도 수축에서 그렇습니다. 일부 섬유에서 AP가 끝까지 전파되지 못하는 것이 한 원인으로 제시됩니다([RM] p.200).
- **최대하 등척성 수축에서는** 진폭이 처음에 오히려 증가합니다. 수축 기능이 떨어지면서 운동단위가 더 동원되고 새로 동원된 단위의 발화율이 오르기 때문으로 봅니다([RM] p.200).
- **주파수.** 약 100 Hz인 중앙 주파수와 zero crossing 수가 줄어듭니다. 원인이 여럿이어서 **표면 EMG만으로는 피로의 기전을 가려내기에 부족할 수 있습니다**([RM] p.200).
- 전도 속도는 근육 내 pH와 Na+ 변화 같은 대사 요인으로 느려집니다. 발화율도 줄지만 모의실험과 실험 연구는 발화율 변화가 파워 스펙트럼에 거의 영향을 주지 않는다고 결론지었습니다. synchronization이 스펙트럼을 저주파 쪽으로 옮길 수는 있으나 피로 때 늘어난다는 증거는 충분하지 않습니다([RM] pp.200–201).
- 오래 지속되는 과제에서는 협력근 사이에 활동을 돌려 가며 나눌 수 있습니다. 최대 노력의 5%로 1시간 지속한 실험에서 대퇴사두근들의 활동 크기가 시간에 따라 달랐다는 보고가 있으나, 교재는 추가 검증이 필요하다고 적습니다([RM] p.201). 피로 중 지근·속근 섬유의 상대 기여를 EMG로 가려낸다는 생각은 매력적이지만, 위 요인들 때문에 확실하게 말할 수 없습니다([RM] p.201).

요약하면 EMG 신호는 근섬유막의 이온 전하에 뿌리를 두며, 전극·증폭기·분석 기법은 다양하지만 신호 특성을 흐리는 기술적 문제를 사용자가 알고 있어야 합니다([RM] p.201).

## 주요 용어

| 용어 | 한국어 | 뜻 |
|---|---|---|
| action potential (AP) | 활동전위 | 막 극성이 잠깐 뒤집히며 근섬유를 따라 퍼지는 전기 신호 |
| muscle fiber conduction velocity | 근섬유 전도 속도 | AP가 근섬유를 따라 퍼지는 속도 |
| innervation ratio | 신경지배비 | 운동신경세포 하나가 지배하는 근섬유 수 |
| motor unit action potential (MUAP) | 운동단위 활동전위 | 한 운동단위 섬유들의 AP를 합친 것 |
| recruitment / firing rate | 동원 / 발화율 | 활성 운동단위 수를 늘리는 것 / 운동단위가 발화하는 빈도 |
| synchronization | 동기화 | 둘 이상의 운동단위가 동시에 발화하는 현상 |
| common-mode rejection ratio (CMRR) | 공통 모드 제거비 | 두 입력에 공통인 신호를 줄이는 정도 |
| motor point / innervation zone | 운동점 / 신경지배 구역 | 신경이 근육으로 들어가는 곳. 전극 위치로 부적합 |
| crosstalk | 혼선 | 이웃 근육의 신호가 섞여 기록되는 것 |
| rectification | 정류 | 음의 전압을 양으로 바꾸는 것(절댓값) |
| linear envelope | 선형 포락선 | 정류 신호를 low-pass filter로 평활화한 것 |
| integrated EMG | 적분 EMG | 정해진 시간 동안의 누적 합 |
| M-wave / H-reflex | M파 / H반사 | 운동신경 자극의 직접 반응 / Ia 구심섬유를 거친 반사 반응 |
| stationarity | 정상성 | 분석 구간 안에서 주파수 성분이 변하지 않는다는 가정 |
| normalization | 정규화 | 기준 값에 대한 비율로 진폭을 나타내는 것 |
| spike-triggered averaging | 스파이크 유발 평균 | 여러 시행을 평균해 작은 신호를 드러내는 기법 |

## 흔한 오해
- **"EMG 진폭이 두 배면 근력도 두 배다"** → 관계는 흔히 비선형이고, 동시수축·처리 기법·수축 유형에 따라 달라집니다([RM] pp.182, 193–194).
- **"전극은 motor point 위에 붙여야 신호가 가장 좋다"** → 그 위에서는 양방향으로 퍼지는 신호가 차동 증폭에서 상쇄되고 변동도 큽니다([RM] p.185).
- **"notch filter로 60 Hz를 지우면 더 좋은 자료가 된다"** → 그 대역의 EMG 성분도 함께 사라집니다([RM] p.186).
- **"표면 전극에 잡힌 활동은 그 아래 근육의 것이다"** → 이웃 근육의 crosstalk일 수 있고, 동시수축으로 오인된 사례가 있습니다([RM] pp.187–188).
- **"주파수가 올라가면 속근 운동단위가 더 동원된 것이다"** → 가능한 설명이 여럿이며 그것만으로 결론 낼 수 없습니다([RM] p.190).
- **"정규화는 언제나 해야 한다"** → 한 근육군을 여러 날 보는 단순한 설계에서는 절댓값 보고도 타당합니다([RM] p.193).

## 자기 점검

1. (계산) 선형 CMRR이 100,000:1과 10,000:1인 두 증폭기를 식 8.1로 dB로 바꾸세요.
<details><summary>정답</summary>20 × log10(100,000) = 20 × 5 = 100 dB. 20 × log10(10,000) = 20 × 4 = 80 dB. 앞의 값이 교재가 말하는 아주 좋은 상용 증폭기 수준입니다([RM] p.182). 10,000:1은 이 문제를 위해 든 값입니다.</details>

2. (계산) 표본 다섯 개가 3, −4, 0, 4, −3 mV입니다. 평균, 정류 평균, RMS를 구하세요.
<details><summary>정답</summary>평균 = (3 − 4 + 0 + 4 − 3)/5 = 0 mV. 정류 평균 = (3 + 4 + 0 + 4 + 3)/5 = 14/5 = 2.8 mV. RMS = sqrt((9 + 16 + 0 + 16 + 9)/5) = sqrt(50/5) = sqrt(10) ≈ 3.16 mV. 평균이 0이라 진폭 지표가 못 되는 이유([RM] p.188)와, RMS에는 정류가 필요 없다는 점([RM] p.189)을 확인할 수 있습니다.</details>

3. (계산) 자극 부위와 기록 부위가 0.14 m 떨어져 있고 latency가 2.8 ms입니다. 전도 속도는? (수치는 이 문제를 위한 가정입니다.)
<details><summary>정답</summary>0.14 m / 0.0028 s = 50 m/s. 정상 여부는 발표된 기준 값과 대조해 판단합니다([RM] p.197).</details>

4. 표면 EMG의 최고 주파수 성분을 약 400 Hz로 볼 때 Nyquist 조건의 최소 표본화율은 얼마이며, 교재가 실제로 권하는 값은?
<details><summary>정답</summary>최소 2 × 400 = 800 표본/초입니다. 교재는 표면 EMG에 대개 초당 1000 표본 이상, 때로는 그보다 높은 값이 필요하다고 적습니다([RM] p.186).</details>

5. 발등굽힘 중 soleus 위 표면 전극에 활동이 기록되었습니다. 동시수축이라고 쓰기 전에 무엇을 해야 합니까?
<details><summary>정답</summary>crosstalk 여부를 확인합니다. 길항근의 운동신경을 자극해 눈으로 확인하거나, 두 근육 신호의 교차상관을 구하거나, double differential 기록 또는 wire 전극으로 다시 기록합니다. 같은 상황에서 wire 전극으로는 활동이 없었던 사례가 있습니다([RM] pp.187–188).</details>

6. 달리기 중 hamstrings의 활성 시작 시점을 10 Hz linear envelope에서 읽으려 합니다. 무엇이 문제입니까?
<details><summary>정답</summary>low-pass filtering이 고주파 성분을 줄여 onset 판정을 늦추고 부정확하게 만듭니다([RM] pp.189, 191, 그림 8.9). 교재는 활성 시점과 지속 시간은 원신호에서 가장 잘 보인다고 하고([RM] p.195), 표면 전극은 지속 시간을 wire 전극보다 길게 낼 수 있다는 점도 함께 고려하라고 합니다.</details>

7. 최대하 등척성 수축을 오래 유지했더니 진폭은 늘고 중앙 주파수는 줄었습니다. 표면 EMG만으로 "속근 섬유가 먼저 지쳤다"고 결론 낼 수 있습니까?
<details><summary>정답</summary>없습니다. 진폭 증가는 추가 동원과 발화율 증가로, 주파수 감소는 전도 속도 저하를 비롯한 여러 원인으로 설명될 수 있습니다. 교재는 섬유 유형별 기여를 확실하게 말할 수 없다고 적습니다([RM] pp.200–201).</details>

8. 보행 EMG를 최대 등척성 수축 값으로 정규화하는 대신 쓸 수 있는 방법과, 정규화를 생략해도 되는 경우는?
<details><summary>정답</summary>보행 주기를 구간으로 나누고 그 안의 최대 진폭을 100%로 두는 방법이 있습니다. 한 근육군을 여러 날에 걸쳐 보는 단순한 설계라면 절댓값 보고가 타당하고 더 의미 있을 수 있습니다([RM] p.193).</details>

## 더 읽을거리
- 교재 Suggested Readings([RM] p.201): Basmajian and De Luca (1985) *Muscles Alive: Their Functions Revealed by Electromyography*, 5th ed.; Loeb and Gans (1986) *Electromyography for Experimentalists*; Luttmann (1996) "Physiological basis and concepts of electromyography", *Electromyography in Ergonomics* (Kumar and Mital, eds.); U.S. Department of Health and Human Services (1992) *Selected Topics in Surface Electromyography for Use in the Occupational Setting: Expert Perspectives*.
- 이 저장소: [T04 근육과 EMG](../I-gait-theory/note-T04.md)(근육 역학, EMG 처리·정규화, EMG–힘 관계의 한계), [Day I5](../I-gait/day-I5.md)(실습), [R07 Three-Dimensional Kinetics](note-R07.md), [R09 Muscle Modeling](note-R09.md).

---
[← 이전 노트](note-R07.md) · [노트 목록](index.md) · [다음 노트 →](note-R09.md)
