# Day I5 — 근육 활동과 EMG: 정류, envelope, 정규화, onset을 직접 구현하기

> **주차:** 심화 파트 I — 보행분석 (1주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I5_emg.ipynb`, `figures/advanced/I/I5_emg_processing.png`
>
> **먼저 끝내 둘 레슨:** [Day 23 — 시계열 기초](../../week-4/day-23.md)(band-pass 필터), [Day I2](day-I2.md)(원심성 제동), [Day I4](day-I4.md)(모멘트·파워). 선택: [심화 C2](../C-neural-signals/day-C2.md)(필터 설계와 `filtfilt`).
>
> **이론 노트:** [T04 — 근육과 EMG](../I-gait-theory/note-T04.md)에서 운동단위, force–length/velocity, Hill 모델, EMG–힘 관계의 한계를 깊게 다룹니다.

## 오늘의 목표
- phase별 주요 근육의 역할을 "언제 켜지는가, 늘어나며 제동하는가 줄어들며 일하는가"로 설명할 수 있다(예: LR의 전경골근과 vastii, MSt–TSt의 하퇴삼두근, TSw의 햄스트링).
- 표면 EMG가 무엇을 재고 무엇을 재지 못하는지, 전극과 증폭기에서 무엇이 섞여 들어오는지 말할 수 있다.
- 표면 EMG를 band-pass → 정류 → linear envelope → 진폭 정규화 순서로 처리하는 코드를 외부 패키지 없이 직접 쓸 수 있다.
- threshold로 onset/offset을 찾고, cutoff와 threshold를 바꾸면 결과가 얼마나 달라지는지 기록하고 보고할 수 있다.

## 🎬 영상으로 먼저 보기

- [Biomechanics of Movement | Demo: Recording EMG to Study Muscle Activity — Biomechanics of Movement](https://www.youtube.com/watch?v=pYnZzQ0D_Bs) (8:46)
- **무엇에 주목할까:** 전극을 어디에, 어떤 방향으로 붙이는지와 원 신호가 어떻게 생겼는지 보세요. 원 신호는 0을 중심으로 위아래로 떨리는 모양이라, 그대로 평균하면 0이 된다는 점이 오늘 "정류"가 필요한 이유입니다.

- [Surface Electromyography (SEMG) Signal Processing | Part 1 — ThatsEngineering](https://www.youtube.com/watch?v=5AtAoO51vWQ) (12:15)
- **무엇에 주목할까:** 처리 단계의 순서(필터 → 정류 → 평활)에 집중하세요. 각 단계의 필터가 **무엇을 없애려는** 필터인지(움직임 잡음, 고주파 잡음, 빠른 떨림) 구분하면 오늘 코드의 숫자들이 이해됩니다.

## 개념 설명

### 걷는 동안 근육은 대부분 브레이크다

Day I2에서 본 것처럼 stance 근육은 대부분 **원심성(eccentric)**, 즉 늘어나면서 힘을 내 움직임을 제동합니다. Perry는 몸을 앞으로 보내는 주된 힘을 체중이 앞으로 떨어지는 것에서 찾고, 근육은 그 낙하의 속도를 조절한다고 봅니다([P] 3장 Propulsive Forces, 9장 Conclusion). Perry의 phase별 근육 활동을 요약하면 다음과 같습니다([P] 4–6·9장).

- **LR(2–12%)**: 정강이 앞 근육(전경골근 등)이 발바닥이 툭 떨어지지 않게 늦추며 정강이를 앞으로 끌고(heel rocker), 무릎 신전근 **vastii**(대퇴사두근 중 넓은근 넷, 이하 광근)가 무릎이 약 20° 굽는 것을 제동합니다. 대퇴사두근 중 **대퇴직근(rectus femoris)은 LR에 거의 활동하지 않고** 주로 PSw–ISw 무렵(약 57–65% GC)에, 그것도 일부 사람에게서만 나타납니다(fine-wire 기록 20명 중 7명, [P] 6장 Flexor Muscles). 이때 대퇴직근은 무릎이 너무 빨리 굽지 않게 제동하면서 고관절 굴곡을 돕습니다([P] 5장 Pre-Swing, [W] 2장 Opposite Initial Contact p.30). 표면 전극으로 대퇴직근 위에서 LR 활동이 보인다면 옆 광근의 신호가 섞인 것(cross-talk)일 수 있습니다([P] 5장 Knee Extension). Whittle도 Perry를 인용해, MSt 초반까지 이어지는 무릎 신전근 활동은 대퇴직근이 아니라 광근의 것이라고 적습니다([W] 2장 Mid-stance p.28). 고관절에서는 무릎에 부담을 주지 않는 단관절근(하부 대둔근, 대내전근)이 신전을, 중둔근이 반대쪽 골반이 떨어지는 것을 제동합니다([P] 6장).
- **MSt–TSt(12–50%)**: 광근은 약 20% GC에 꺼집니다. 그 뒤 무릎과 고관절은 근육이 아니라 GRF 벡터의 정렬과, 가자미근이 정강이의 전진을 늦춰 주는 효과로 안정됩니다([P] 5장, 9장). 가자미근과 비복근이 정강이가 발 위로 넘어가는 속도를 제동하고(ankle rocker), TSt에서 활동이 가장 커집니다. 다만 초음파로 보면 TSt에서 근섬유 다발의 길이는 거의 변하지 않고 늘어나는 것은 **건**입니다([P] 21장 Eccentric, Introduction).
- **PSw(50–62%)**: 종아리 근육의 근전도는 PSw 초(약 50–52% GC)에 꺼지는데도 발목은 빠르게 족저굴곡합니다. Perry는 이를 늘어난 아킬레스건의 **탄성 반동**으로 설명합니다. 같은 순간을 Whittle과 Winter는 하퇴삼두근의 구심성 수축이 만드는 가장 큰 파워 생성(A2)으로 설명합니다([W] 2장 Opposite Initial Contact p.30). 같은 자료를 보는 두 해석이며, Day I4의 파워 부호 논의와 이어집니다.
- **swing**: ISw에는 정강이 앞 근육이 발끝을 들고, 대퇴이두근 단두가 무릎을 굽힙니다. 고관절 굴곡근(장골근)은 평소 속도에서는 거의 쉬는 사람이 절반쯤이고, 속도를 바꿀 때 뚜렷해집니다([P] 6장 Flexor Muscles). TSw에는 햄스트링이 무릎이 펴지는 속도와 고관절 굴곡을 제동하고, 광근이 다시 켜져 무릎 신전을 마무리합니다. **두 길항근이 함께 켜지는 것이 정상**입니다([P] 5장 Terminal Swing).

외골격 설계도 이 사실을 씁니다. stance의 무릎은 "힘을 내는" 것이 아니라 제동하는 것이라, 근육 대신 제어 가능한 댐퍼로 이 일을 받치는 장치가 연구되어 왔습니다([R] 17–18장). Day I20에서 다시 봅니다.

### phase별 근육 시간표 읽는 법

아래 도식 **"보행 주기 동안 주요 근육의 활동 구간"** 은 Perry가 fine-wire EMG로 정리한 정상 평균 시점에서 근육 열 개를 골라 한 시간축에 놓은 것입니다. 막대는 켜진 구간, 점은 가장 센 시점입니다. 읽을 때 다섯 가지를 보세요.

1. **stance는 이어달리기, swing은 합창.** stance에서는 햄스트링 → 단관절 고관절 신전근·광근·전경골근 → 종아리 근육 → 발가락 굴곡근 순으로 책임이 넘어갑니다. swing에서는 고관절·무릎 굴곡근과 발목 배측굴곡근이 거의 한꺼번에 켜집니다([P] 9장 Stance/Swing Muscle Control Pattern).
2. **근육은 필요하기 직전에 켜진다.** 광근(89–95% GC), 하부 대둔근(95%), 중둔근(96%)은 발이 닿기 전 TSw에 이미 켜집니다. LR의 큰 요구에 대비한 사전 활성입니다. EMG가 힘보다 수십 ms 먼저 나타나기 때문이기도 합니다(아래 "원심성 수축과 force–velocity" 절).
3. **전경골근은 두 가지 일을 한다.** swing 내내 발끝을 들고 있다가(56% GC부터), IC 직후 가장 세게 켜져 발이 떨어지는 것을 늦추고, 약 13% GC에 꺼집니다([P] 4장 Dorsiflexors).
4. **세기는 속도를 따른다.** 평소 속도(80 m/min)에서 발목 근육은 최대 근력의 약 15%만 쓰고, 116 m/min에서는 약 25%, 56 m/min에서는 약 10%로 바뀝니다([P] 3장 Dynamic Stability). 근육 시점과 세기를 비교할 때는 걷는 속도를 맞춰야 합니다.
5. **이 표는 하나의 정답이 아니다.** 같은 "정상" 보행을 사람마다 다른 근육 조합으로 만들 수 있고, 피로와 속도에 따라서도 패턴이 바뀝니다(근육계의 중복성, [W] 2장 Overview of the Gait Cycle pp.21–24). 개인 기록이 도식과 조금 다르다고 비정상은 아닙니다.

근육이 phase에 맞춰 켜지는 데는 척수 회로도 관여합니다. 같은 감각 입력이 stance에서는 신전근을 흥분시키고 쉴 때는 억제하는 식으로 반사가 phase에 따라 뒤집힙니다(Takakusaki 2017). 신경 조절은 Day I7에서 다룹니다.

### 원심성 수축과 force–velocity, 그리고 EMG와 힘의 시간차

원심성 수축이 중요한 이유는 근육의 **force–velocity** 특성에 있습니다. 근육은 빨리 짧아질수록 낼 수 있는 힘이 줄고, 늘어나면서 버틸 때는 등척성 최대보다 큰 힘(최대의 약 1.1–1.8배)을 낼 수 있습니다([Wi] 8.2절 pp.181–184). 같은 힘을 더 적은 활성화로, 즉 더 낮은 EMG와 더 적은 대사 비용으로 낼 수 있으니 낙하하는 몸을 제동하는 데 알맞은 방식입니다([Wi] 9.4.2). Perry는 같은 노력에서 낼 수 있는 힘의 비를 구심성 : 등척성 : 원심성 ≈ 0.8 : 1 : 1.2 정도로 정리하고, 그 귀결로 **약한 근육은 느리게 쓸 수밖에 없다**는 점을 듭니다. 약화 환자의 보행이 느려지는 생리적 근거 중 하나입니다([P] 21장 Concentric, Type of Muscle Action).

전기 신호와 힘 사이에는 시간차가 있습니다. 한 번의 자극에 대한 근육의 힘(twitch)은 근전위보다 40–100 ms 늦게 봉우리에 이르고, 최대 수의적 수축에서도 근육이 완전히 켜지는 데 약 200 ms, 꺼지는 데 약 300 ms가 걸리며, EMG가 끝난 뒤에도 약 150 ms 동안 장력이 남습니다([Wi] 8.0.5–8.0.6 pp.175–176, 9.4). EMG onset과 힘 시작 사이의 지연(electromechanical delay)은 초기 연구에서 80 ms, 이후 연구에서는 40 ms 이하로 보고됩니다([P] 21장 Summary). 그래서 EMG 곡선을 관절각·모멘트 곡선과 겹쳐 볼 때는 EMG가 수십 ms 앞서는 것을 감안합니다. 근육 모델의 언어로는 "자극 → 활성 → 힘"의 단계마다 지연이 있다는 뜻입니다([RM] 9장 p.204, T04).

### EMG는 무엇을 재고, 무엇을 재지 않는가

EMG(근전도)는 근섬유막을 따라 퍼지는 활동전위가 만든 **전기 신호**입니다. 힘이 아닙니다. 보행 중 표면 EMG는 여러 운동단위의 전위가 서로 다른 시각에 겹친 간섭 패턴(interference pattern)이라, 운동단위가 더 많이 동원되거나 더 자주 발화하면 함께 커집니다([P] 21장 Signal Management). EMG가 말해 주는 것은 두 가지, **언제 켜졌는가(timing)** 와 **상대적으로 얼마나 셌는가(relative intensity)** 입니다([P] 21장, [W] 4장 p.82). 표면 EMG의 크기는 대략 µV에서 mV 수준이고, 쓸모 있는 주파수 성분은 수백 Hz 아래에 있습니다([W] 4장 p.82, [Wi] 9.2.3).

EMG만으로는 근육이 짧아지는지 늘어나는지 알 수 없습니다([W] 4장 p.82). 원심성에서 구심성으로 넘어가는 순간은 EMG에는 보이지 않고, 관절 모멘트 × 각속도인 파워의 부호에서 보입니다([P] 3장). 다만 그 부호도 근섬유의 움직임을 그대로 말해 주지는 않는다는 것이 Day I4의 결론이었습니다. 같은 EMG라도 근육 길이·수축 속도·피로·길항근 활동에 따라 힘이 달라집니다. 대퇴사두근은 EMG가 같은데도 무릎 굴곡 50°에서 10°로 가면 낼 수 있는 힘이 절반으로 줄었다는 보고가 있습니다([P] 21장 Joint Position). 여러 근육이 함께 관절을 돌리므로 관절 모멘트를 근육 하나에 배정할 수도 없습니다([RM] 5장 p.122).

그런데도 EMG가 임상에서 쓰이는 까닭은 **시점** 정보 때문입니다. 뇌성마비에서 힘줄을 옮기는 수술을 계획할 때는 그 근육이 새 역할에 맞는 시점에 켜지는지 먼저 EMG로 확인하고, 보조기나 테이핑 전후의 상대적 변화를 볼 때도 씁니다([W] 4장 p.84). Perry는 근기능 이상의 패턴을 정확히 정의하는 수단으로 dynamic EMG를 가장 중시합니다([P] 10장). 병적 EMG 패턴(너무 이른 활성, 연장, 지속 활성 등)은 Day I15–I16에서 다룹니다.

**주파수에 대한 주의.** Whittle은 EMG의 주파수를 운동단위의 평균 발화율에 비유해 설명합니다([W] 4장 p.82). 하지만 Robertson 등은 스펙트럼 변화가 발화율보다 근섬유 전도 속도 같은 말초 요인을 더 많이 반영하며, 주파수 변화로 근섬유 유형을 추론하면 안 된다고 경고합니다([RM] 8장 pp.190, 200–201). 근피로가 오면 진폭은 커지고 스펙트럼은 낮은 쪽으로 옮겨 가는 경향이 있습니다([Wi] 9.4.3). 참고로 [Wi] p.220에는 slow-twitch 섬유가 피로에 약하다는 문장이 있는데, 같은 책 8.0.4절과 Whittle 부록의 설명대로 **피로에 강한 쪽이 slow-twitch**입니다.

### 전극과 기록: 무엇을 듣고, 무엇이 섞이나

**전극 세 가지**([W] 4장 pp.82–83, [P] 21장 Electrodes, [RM] 8장 pp.183–185).
- **표면 전극**: 피부에 붙이는 원판 두 개의 전압 차를 기록하고, 접지 전극을 하나 더 둡니다. 편하고 누구나 붙일 수 있지만 피부에서 가까운 근육만 "듣습니다". 신호의 대부분은 피부에서 1–2 cm 남짓 안쪽에서 옵니다(Robertson 등은 약 10–20 mm, Whittle은 25 mm 이내로 적습니다). 그래서 장요근 같은 깊은 근육은 표면으로 잴 수 없습니다.
- **fine-wire 전극**: 바늘로 가는 선을 근육 안에 넣고 바늘만 빼냅니다. 깊은 근육과 개별 근육을 볼 수 있지만 침습적이라 자격 있는 임상가만 넣습니다. Perry의 근육 시점 자료는 대부분 이 방법으로 얻은 것입니다.
- **바늘 전극**: 아주 좁은 범위의 운동단위 몇 개만 봐서 보행분석보다는 생리 연구에 씁니다.

**cross-talk.** 표면 전극에는 옆 근육의 신호가 조직을 타고 섞여 들어옵니다. 그래서 표면 신호는 개별 근육보다 **근육군**의 신호로 보는 것이 안전하고([W] 4장 p.82), 깊은 근육 위에 얕은 근육이 있으면 더 그렇습니다. 표면 전극으로 잰 활성 구간이 fine-wire보다 최대 80% 길게 나올 수 있습니다([RM] 8장 p.195). cross-talk는 onset/offset을 흐리고 **없는 동시수축을 있는 것처럼** 보이게 합니다. 주동근 활동이 낮거나 중간인데 길항근 위에서도 활동이 보이면 cross-talk를 의심합니다([P] 21장 Cross-talk). 표면 전극에서 보였던 가자미근의 "동시수축"이 wire 전극에서는 사라진 사례가 있습니다([RM] 8장 pp.187–188). 확인 방법은 옆 근육만 수축시키는 동작에서 대상 채널이 조용한지 보기, 두 채널의 cross-correlation 구하기(전극 쌍 사이 거리가 2 cm면 공통 신호가 약 36%, 5 cm면 약 6%로 줄었다는 인용값이 있습니다), 작은 전극·double differential 전극 쓰기입니다([Wi] 9.2.5 pp.202–204). 반대 방향의 근거도 있습니다. 아동에서는 표면 전극으로 대퇴사두근의 얕은 세 갈래를 만족스럽게 구분했다는 연구를 Whittle이 소개합니다([W] 4장 p.82). 어느 쪽이든 결론에 개별 근육 정보가 꼭 필요하면 fine-wire를 고려합니다.

**전극을 붙이는 자리.** 근복(근육 배)의 가운데에, 두 전극을 잇는 선이 근섬유와 나란하게 붙이고, 운동점(innervation zone)과 건 쪽은 피합니다([Wi] 9.2.6 p.205, [RM] 8장 p.185). 방향이 근섬유와 어긋나면 진폭이 최대 50%까지 줄 수 있습니다. 피하지방이 두꺼우면 신호가 약해지고 cross-talk가 커지는데, 지방 두께가 진폭 변동의 절반 이상을 설명할 수 있다는 보고도 있습니다([RM] 8장 p.187). 전극 크기·간격·위치·피부 준비는 SENIAM 권고에 맞춰 기록하고 보고합니다([Wi] 9.2.6, [W] 4장 p.82).

**증폭기.** 근육 신호는 작아서 1,000–10,000배쯤 증폭하고, 증폭기를 전극 가까이 두어 잡음이 실릴 선을 짧게 합니다([W] 4장 p.83). 이득이 너무 크면 봉우리가 잘리고(clipping), 너무 작으면 A/D 변환기의 해상도를 버립니다([RM] 8장 pp.182–183). 두 전극의 **차이**만 증폭하는 차동증폭기가 전원 잡음처럼 두 전극에 똑같이 실리는 신호를 지웁니다. 빼기의 품질이 CMRR이고, Winter는 80 dB(10,000 : 1) 이상을 권합니다([Wi] 9.2.4). 증폭기의 입력 임피던스는 1 MΩ 이상으로 높게, 피부 임피던스는 피부 준비로 낮게 해야 신호가 전압 분배로 깎이지 않습니다([Wi] 9.2.2, [RM] 8장 p.184).

**처리하기 전에 원 신호부터 본다.** 흔한 왜곡은 봉우리 잘림(clipping), 0에서 떠 있는 DC offset, 몸이 움직일 때 기준선이 출렁이는 움직임 잡음, 접지 불량, 그리고 몸통 근육에 섞이는 심전도(ECG)입니다([RM] 8장 그림 8.4, p.199). 숙련자가 원 신호를 눈으로 확인한 뒤에 자동 처리를 하라는 것이 Perry의 권고입니다([P] 21장 Analysis Systems). 예시 2의 첫 코드가 이 점검입니다.

### 처리 순서와 각 단계의 선택

아래 도식 **"표면 EMG 처리 단계: 원 신호에서 onset까지"** 는 같은 가상 신호가 다섯 단계를 거치며 어떻게 바뀌는지 위에서 아래로 보여 줍니다. 아래 번호는 도식의 번호와 같습니다.

1. **DC 제거와 band-pass**: 평균을 빼고([W] 4장 p.83), 약 20 Hz 아래(몸이 움직이며 전극이 흔들리는 잡음, 대부분 0–10 Hz)와 Nyquist 근처 위쪽을 잘라 냅니다([W] 4장 p.83, [Wi] 9.2.3). 발이 닿는 순간의 충격 잡음은 더 높은 주파수까지 올라올 수 있지만, high-pass를 너무 올리면 EMG도 깎이므로 절충합니다([W] 4장 p.83). 50/60 Hz notch 필터는 그 대역의 진짜 EMG도 지우므로 최후의 수단입니다([RM] 8장 p.186). 교재마다 숫자가 다른 것은 아래 표에 모았습니다.
2. **전파 정류(full-wave rectification)**: 절댓값을 취합니다. 제곱한 뒤 제곱근을 취해도 같습니다([W] 4장 p.83). 정류하지 않고 평균하거나 low-pass를 걸면 양과 음이 상쇄되어 0 근처만 남습니다(예시 1). 정류는 **비선형** 연산이라 순서를 바꿀 수 없고, 정류가 새 저주파 성분을 만들기 때문에 20 Hz 아래를 지운 신호에서도 몇 Hz짜리 envelope을 얻을 수 있습니다([BMC] `electromyography`).
3. **linear envelope**: 정류한 신호를 low-pass로 평활합니다. cutoff는 교재마다 다릅니다. Whittle은 문헌에서 6–25 Hz로 다양하다고 하고([W] 4장 p.83), Robertson 등은 3–50 Hz 범위에서 10 Hz 정도면 무난하다고 하며([RM] 8장 p.189), Winter는 근육의 twitch(한 번 자극에 대한 힘 반응)의 시간 경과에서 몇 Hz 수준(약 1.5–4 Hz)의 cutoff를 이끌어 냅니다([Wi] 9.3.2절 pp.207–208). BMC 노트북은 envelope에 8 Hz를, onset 검출용으로는 20 Hz를 씁니다. Winter가 낮은 cutoff에 한 방향 필터를 쓰는 것은 envelope이 **장력 곡선을 닮도록** 지연까지 흉내 내려는 것이고, 시점을 찾으려는 분석은 대개 앞뒤(zero-phase) 필터를 씁니다. envelope을 세게 평활할수록 onset이 흐려지므로, **진폭 비교가 목적이면 envelope, 시점이 목적이면 덜 평활한 신호**를 씁니다([RM] 8장 p.191). Perry의 정량화는 이 방법과 다르게, 정류한 신호를 짧은 구간(정상 보행에서 0.01초)마다 적분해 계단형 곡선을 만듭니다([P] 21장 Quantification).
   - envelope 대신 **이동 RMS**(제곱 → 짧은 창 평균 → 제곱근)를 쓰기도 합니다. Whittle은 0.125초 창을 예로 듭니다([W] 4장 p.83). envelope, RMS, 평균 정류값(ARV), 적분 EMG(iEMG, 단위 mV·s)는 서로 다른 양이라 이름을 바꿔 쓰면 안 됩니다([RM] 8장 pp.188–190). envelope을 "integrated EMG"라 부르는 것은 틀린 이름입니다([Wi] 9.3.2). iEMG를 근육이 한 일의 지표로 쓴 연구도 있지만([W] 4장 p.84), EMG가 힘이 아니므로 일로 읽을 때는 조심합니다.
   - 2차 Butterworth 필터는 신호가 갑자기 켜지는 곳 앞뒤에 작은 가짜 봉우리(overshoot)를 만들 수 있어서, Robertson 등은 정류 EMG의 onset 검출에는 overshoot가 없는 임계감쇠 필터를 권합니다([RM] 12장 p.289). 필터 설계는 Day I10에서 다룹니다.
4. **진폭 정규화**: 원 진폭(mV)은 전극 위치, 피하지방, 피부 임피던스에 크게 좌우되므로 사람·근육·날짜 사이를 비교하려면 같은 전극으로 얻은 기준값으로 나눕니다([P] 21장 Normalization, [RM] 8장 p.192).
   - **%MMT**: 도수근력검사 중 최대 EMG. 간편하고, 최대 능력 대비 "얼마나 힘들게 일했나"를 근육끼리 비교할 수 있습니다. 4–5초 등척성 검사에서 가장 높은 1초 평균을 씁니다. 짧고 강한 순간 동작에서는 100%를 넘을 수 있는데 오류가 아닙니다([P] 21장).
   - **%MVC**: 동력계로 잰 최대 수의 수축. 더 정확하지만 시간이 걸리고, 동적 과제에 그대로 적용하면 해석이 틀어질 수 있다는 지적이 있습니다([RM] 8장 pp.192–193).
   - **%MHR**: 종아리 근육은 손으로 하는 검사가 동력계 최대의 약 19%밖에 끌어내지 못해서, Perry는 최대 heel rise(발뒤꿈치 들기) 중 EMG를 기준으로 씁니다([P] 4장 Triceps Surae).
   - **최대 M-wave**: 신경을 전기자극해 얻는 최대 근육 반응을 기준으로 삼는 방법입니다([RM] 8장 p.192).
   - **과제 내 최댓값(% peak)**: 어디에나 쓸 수 있지만 약한 활동도 강한 활동도 100%가 되어 "얼마나 힘들게 일했나"라는 정보가 사라집니다. Perry는 최대 수축을 낼 수 없는 중증 경직 환자에게 한정해 권합니다([P] 21장 Normalization).
   - 최대 노력은 반복할 때마다 약 10% 흔들리고, 50% 수준의 준최대 목표 수축이 오히려 더 일관됐다는 보고도 있습니다([P] 21장). 같은 사람의 같은 근육을 같은 조건에서 추적하는 단순한 설계라면 정규화하지 않은 절댓값 보고도 타당합니다([RM] 8장 p.193). 오늘 쓰는 BMC `electromyography` 노트북에는 진폭 정규화 단계가 없고, Winter의 9장에도 정규화 절차는 없습니다. 그래서 정규화의 근거는 Perry 21장과 Robertson 등 8장에서 가져왔습니다.
5. **onset/offset**: threshold를 정해 그 위로 올라가는 순간을 찾습니다. Perry 연구실(Rancho)의 규칙은 "최대 MMT EMG의 5% 이상이 GC의 5% 이상 지속"입니다. 같은 기록에서 컴퓨터 규칙은 언제나 같은 onset을 고르지만, 숙련자가 일주일 뒤 같은 onset을 다시 고른 비율은 약 51%, 숙련자 세 명이 일치한 비율은 약 23%였습니다([P] 21장 Timing). **규칙을 정하고 적는 것** 자체가 재현성의 핵심입니다. Winter의 9장에는 onset 규칙이 없고, Robertson 등도 구체적 값 대신 threshold 방식이 더 객관적이라고만 하며 Hodges & Bui(1996)를 가리킵니다([RM] 8장 p.191). Hodges & Bui는 low-pass 10·50·500 Hz, 기준선 평균 + 1·2·3 SD, 최소 지속 20·50·100 ms의 조합 27가지를 숙련자의 눈 판정과 비교해, 조합 대부분이 눈 판정과 유의하게 어긋나고 일부 조합만 정확했다고 보고했습니다(PubMed 초록 기준). BMC 노트북은 "쉬는 구간 SD의 몇 배"를 threshold로, 일정 표본 수 이상 지속을 두 번째 조건으로 쓰고(본문은 3배를 예로 들고 코드는 2배·50 ms를 씀), 짧은 끊김(10 ms 이하)은 한 구간으로 잇습니다. 이 노트북은 onset 검출에 외부 패키지(`detecta`)를 쓰는데, 오늘 코드는 같은 생각을 numpy로 직접 짰습니다([BMC] `electromyography`).
   - onset을 표시할 시간축은 %GC, stance/swing, 8 phase 셋 중에서 고릅니다. 기능적 의미가 가장 큰 것은 phase 기준입니다([P] 21장 Interpretation). 여러 stride를 그냥 평균하면 stride마다 onset이 조금씩 달라 평균 곡선이 어느 stride보다도 넓게 퍼지므로, Perry는 평균 onset·offset 시각에 맞춰 늘이고 줄인 뒤 평균하는 방법을 씁니다([P] 21장 Time Adjusted Quantification). 시간 정규화와 평균은 Day I11에서 다룹니다.

인터랙티브 그림 **"EMG onset 탐색기"** 에서는 정답 시점을 아는 가상 EMG에 cutoff, threshold 규칙, 최소 지속 시간, 필터 방향을 바꿔 가며 onset이 정답에서 몇 ms 벗어나는지 직접 볼 수 있습니다.

**교재마다 다른 숫자**(같은 책 안에서도 목적에 따라 다릅니다).

| 단계 | [P] Perry 21장 | [W] Whittle 4장 | [Wi] Winter 9장 | [RM] 8장 | [BMC] `electromyography` |
|---|---|---|---|---|---|
| 아래쪽 경계(high-pass) | 표면 40 Hz, wire 150 Hz(Rancho 시스템) | 20 Hz | 표면 10 Hz 권고, 움직임 잡음이 크면 약 20 Hz | 약 10 Hz | 10 Hz(onset 예시는 20 Hz) |
| 위쪽 경계·표본화 | 2500 Hz로 표본화 | 쓸모 있는 성분 500 Hz까지 | 표면 1000 Hz까지 기록 대역 | 성분 약 400 Hz까지, 표본화 1000 Hz 이상 | 400 Hz(파일은 1000 Hz) |
| 진폭 곡선 | 정류 후 0.01초 구간 적분 | envelope 6–25 Hz, RMS 0.125초 | envelope 약 1.5–4 Hz(twitch 근거) | envelope 3–50 Hz, 보통 10 Hz | envelope 8 Hz |
| onset 규칙 | ≥ 5% MMT, ≥ 5% GC | 정해 둔 threshold | 없음 | 구체 값 없음(Hodges & Bui로 넘김) | 기준선 SD의 배수 + 최소 지속 |
| 정규화 | %MMT, %MHR, 경직 환자만 % peak | — | 없음 | MVC, M-wave, 과제 내 최대 | 없음 |

위쪽 경계는 반드시 내 파일 표본화율의 절반(Nyquist)보다 낮아야 합니다. 1000 Hz 파일에 "1 kHz low-pass"를 그대로 옮기면 안 됩니다([RM] 8장 p.186, Day I10).

## 예시로 이해하기

### 예시 1 — 정류하지 않고 평활하면 왜 안 되는가 (가상 신호)

```python
import numpy as np
from scipy import signal

rng = np.random.default_rng(0)
fs = 1000
t = np.arange(0, 2, 1 / fs)
drive = np.where((t > 0.5) & (t < 1.2), 1.0, 0.1)          # 0.5–1.2 s에만 근육이 '켜짐'(가상)
emg = drive * rng.normal(0, 1, t.size)                      # 진폭이 drive를 따르는 무작위 신호

sos = signal.butter(2, 6, btype="low", fs=fs, output="sos")
lp_raw = signal.sosfiltfilt(sos, emg)                       # 정류 없이 바로 low-pass
lp_rect = signal.sosfiltfilt(sos, np.abs(emg))              # 정류한 뒤 low-pass

on = (t > 0.6) & (t < 1.1)
print("켜진 구간 평균  | 정류 없이: %.3f | 정류 후: %.3f" % (lp_raw[on].mean(), lp_rect[on].mean()))
print("꺼진 구간 평균  | 정류 없이: %.3f | 정류 후: %.3f" % (lp_raw[t < 0.4].mean(), lp_rect[t < 0.4].mean()))
```

실행 결과:

```text
켜진 구간 평균  | 정류 없이: -0.072 | 정류 후: 0.759
꺼진 구간 평균  | 정류 없이: -0.001 | 정류 후: 0.076
```

정류하지 않으면 근육이 켜진 구간과 꺼진 구간이 둘 다 0 근처라 구분이 안 됩니다. 정류한 뒤에는 켜진 구간이 꺼진 구간의 약 10배로 드러납니다. 정류는 **비선형** 연산이라 순서를 바꿀 수 없습니다.

### 예시 2 — BMC `emg.csv`를 처음부터 끝까지 처리하기

> **데이터:** BMC v0.2.0의 `data/emg.csv`(내용 CC BY 4.0, [doi:10.5281/zenodo.23654869](https://doi.org/10.5281/zenodo.23654869)). 머리글 없이 2열(시간 s, 진폭)이고 1000 Hz로 3.36초입니다. **어느 근육, 어떤 과제, 어떤 단위인지 파일에 정보가 없으므로** 오늘은 처리 방법 연습용으로만 쓰고 생리적 해석은 하지 않습니다. 보행 중 기록도 아니라서 phase별 근육 활동은 이 파일로 볼 수 없습니다. BMC의 `electromyography` 노트북은 진폭 정규화를 하지 않고 onset 검출에 외부 패키지(`detecta`)를 쓰는데, 과정 환경에는 그 패키지가 없으므로 아래 코드는 numpy/scipy로 직접 구현했습니다.
>
> ```bash
> mkdir -p data/bmc
> curl -L -o data/bmc/emg.csv https://raw.githubusercontent.com/BMClab/BMC/master/data/emg.csv
> ls -l data/bmc/emg.csv        # 약 49 KB여야 합니다. 0바이트면 주소나 네트워크를 확인합니다.
> ```

먼저 처리하기 전에 원 신호가 멀쩡한지 봅니다(DC offset, 봉우리 잘림, 값의 해상도).

```python
import numpy as np

d = np.loadtxt("data/bmc/emg.csv", delimiter=",")
t, raw = d[:, 0], d[:, 1]
print("시간 간격(s): 최소 %.4f, 최대 %.4f" % (np.diff(t).min(), np.diff(t).max()))
print("평균(DC) %.5f | RMS %.5f | 평균/RMS = %.1f%%" % (raw.mean(), np.sqrt(np.mean(raw**2)), 100 * raw.mean() / np.sqrt(np.mean(raw**2))))
print("최솟값 %.5f, 최댓값 %.5f" % (raw.min(), raw.max()))
levels = np.unique(raw)
print("서로 다른 값 %d개, 가장 작은 간격 %.5f" % (len(levels), np.diff(levels).min()))
print("최솟값·최댓값에 붙은 표본 수: %d, %d" % ((raw == raw.min()).sum(), (raw == raw.max()).sum()))
```

실행 결과:

```text
시간 간격(s): 최소 0.0010, 최대 0.0010
평균(DC) 0.00026 | RMS 0.02111 | 평균/RMS = 1.2%
최솟값 -0.13916, 최댓값 0.19531
서로 다른 값 82개, 가장 작은 간격 0.00244
최솟값·최댓값에 붙은 표본 수: 1, 1
```

- 표본 간격이 일정하므로 fs = 1000 Hz로 계산해도 됩니다.
- 평균이 0이 아닙니다(RMS의 약 1%). 두 전극 사이 전위차의 평균이 0이 아닐 생리적 이유는 없으니 전극·증폭기에서 온 offset으로 보고 빼 줍니다.
- 최솟값과 최댓값이 각각 한 표본에만 나타나므로 봉우리가 잘린(clipping) 흔적은 없습니다. 잘렸다면 같은 극값에 여러 표본이 붙어 평평한 꼭대기가 생깁니다.
- 3,360개 표본이 겨우 82가지 값만 가집니다. 값이 0.00244 간격의 격자 위에 있다는 뜻이고, 증폭 이득이 낮아 A/D 변환기의 단계를 조금밖에 쓰지 못한 것처럼 읽힙니다(파일이 장비 정보를 주지 않으므로 추정입니다). 진폭 비교에는 거친 해상도지만 onset 연습에는 충분합니다.

이제 처리합니다.

```python
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal

d = np.loadtxt("data/bmc/emg.csv", delimiter=",")          # 1열 시간(s), 2열 EMG(단위·근육 정보 없음)
t, raw = d[:, 0], d[:, 1]
fs = 1 / np.median(np.diff(t))
print("표본 %d개, fs = %.0f Hz, 길이 %.2f s" % (len(t), fs, t[-1]))

# 1) 평균(DC) 제거 → 2) band-pass 20–400 Hz (움직임 잡음은 아래, Nyquist 500 Hz보다 낮게)
x = raw - raw.mean()
sos_bp = signal.butter(4, [20, 400], btype="bandpass", fs=fs, output="sos")
x_bp = signal.sosfiltfilt(sos_bp, x)
# 3) 전파 정류(full-wave rectification)
x_rect = np.abs(x_bp)

# 4) linear envelope: 정류 신호를 low-pass (cutoff를 바꿔 본다)
def envelope(rect, fc):
    sos = signal.butter(2, fc, btype="low", fs=fs, output="sos")
    return signal.sosfiltfilt(sos, rect)                     # 시점 비교가 목적이라 zero-phase

# 5) 진폭 정규화: MVC 기록이 없으므로 '이 기록 안의 최댓값 = 100%'(과제 내 최대 정규화)
# 6) onset/offset: 임계값을 넘는 구간 중 min_dur 이상 지속되는 것만
def bursts(env, thr, min_dur=0.05):
    above = np.r_[False, env > thr, False].astype(int)
    on = np.flatnonzero(np.diff(above) == 1)
    off = np.flatnonzero(np.diff(above) == -1)
    keep = (off - on) / fs >= min_dur
    return t[on[keep]], t[off[keep] - 1]

base = t < 0.3                                               # 처음 0.3 s를 쉬는 구간(baseline)으로 가정
print("\nfc(Hz)  임계값 규칙          burst 수  onset(s)들")
for fc in [3, 6, 10]:
    env = envelope(x_rect, fc)
    env_n = 100 * env / env.max()                            # % of peak
    rules = {"baseline+3SD": env_n[base].mean() + 3 * env_n[base].std(),
             "10% of peak": 10.0,
             "25% of peak": 25.0}
    for name, thr in rules.items():
        on, off = bursts(env_n, thr)
        print("%5d   %-14s(%4.1f%%)  %d      %s" % (fc, name, thr, len(on), np.round(on, 3)))

# 그림: 처리 단계별 신호 (fc = 6 Hz, baseline+3SD 규칙)
env = envelope(x_rect, 6)
env_n = 100 * env / env.max()
thr = env_n[base].mean() + 3 * env_n[base].std()
on, off = bursts(env_n, thr)
print("fc 6 Hz, baseline+3SD: onset", np.round(on, 3), "offset", np.round(off, 3))
fig, axs = plt.subplots(3, 1, figsize=(8, 6), sharex=True)
axs[0].plot(t, raw, lw=0.5); axs[0].set_ylabel("raw")
axs[1].plot(t, x_rect, lw=0.5, color="gray"); axs[1].set_ylabel("band-pass,\nrectified")
axs[2].plot(t, env_n, "k"); axs[2].axhline(thr, color="r", ls="--", lw=0.8)
for a, b in zip(on, off):
    axs[2].axvspan(a, b, color="r", alpha=0.15)
axs[2].set_ylabel("envelope\n(% of peak)"); axs[2].set_xlabel("time (s)")
out = Path("figures/advanced/I/I5_emg_processing.png")
out.parent.mkdir(parents=True, exist_ok=True)
fig.tight_layout(); fig.savefig(out, dpi=150)
print("저장:", out)
```

실행 결과(그림은 `figures/advanced/I/I5_emg_processing.png`):

```text
표본 3360개, fs = 1000 Hz, 길이 3.36 s

fc(Hz)  임계값 규칙          burst 수  onset(s)들
    3   baseline+3SD  (15.5%)  3      [0.29  1.276 2.321]
    3   10% of peak   (10.0%)  1      [0.042]
    3   25% of peak   (25.0%)  3      [0.331 1.327 2.37 ]
    6   baseline+3SD  (13.6%)  3      [0.354 1.34  2.358]
    6   10% of peak   (10.0%)  5      [0.176 0.34  1.313 1.991 3.19 ]
    6   25% of peak   (25.0%)  3      [0.375 1.366 2.396]
   10   baseline+3SD  (13.1%)  4      [0.378 0.913 1.366 2.384]
   10   10% of peak   (10.0%)  7      [0.225 0.371 1.047 1.357 2.213 2.347 3.205]
   10   25% of peak   (25.0%)  3      [0.392 1.381 2.407]
fc 6 Hz, baseline+3SD: onset [0.354 1.34  2.358] offset [1.015 1.937 3.023]
저장: figures/advanced/I/I5_emg_processing.png
```

원 신호에는 눈으로 봐도 활동 덩어리(burst)가 세 개 있습니다. 결과에서 세 가지를 읽을 수 있습니다.

- **threshold가 너무 낮으면 망가진다.** 쉬는 구간의 envelope이 이미 최댓값의 약 10% 근처에서 출렁이기 때문에, "10% of peak" 규칙은 burst를 1개(3 Hz: 전체가 한 덩어리)에서 7개(10 Hz: 잡음 조각)까지 엉뚱하게 셉니다.
- **cutoff를 높이면 envelope이 출렁여 가짜 burst가 생기고, 낮추면 onset이 앞당겨진다.** 같은 baseline+3SD 규칙에서 첫 onset이 3 Hz일 때 0.290 s, 10 Hz일 때 0.378 s로 약 90 ms 차이가 납니다. 걷기 한 주기가 약 1초이니 9% GC에 해당하는 차이입니다. 강하게 평활하면 신호가 시간 방향으로 번지기 때문입니다. 3 Hz의 첫 onset(0.290 s)은 기준선으로 가정한 0.3 s 안쪽까지 번져 들어왔습니다. 기준선 구간이 정말 조용한지도 평활 설정에 따라 달라진다는 뜻입니다.
- **결과가 안정된 조합이 있다.** 3·6 Hz에서 baseline+3SD와 25% 규칙은 모두 burst 3개를 찾고, onset이 서로 수십 ms 안에서 맞습니다. 하나의 "정답" 설정을 고집하기보다 **합리적인 여러 설정에서 결론이 같은지** 보는 것이 중요합니다.

## 직접 해보기

1. `notebooks/advanced/I/I5_emg.ipynb`에서 예시 1·2를 실행하고 출력이 같은지 확인합니다.
2. 예시 2의 `min_dur`를 0.02, 0.05, 0.10 s로 바꿔 burst 수가 어떻게 변하는지 표를 만듭니다. Perry 규칙의 "GC의 5% 이상 지속"을 1초 주기에 적용하면 몇 초인지도 계산해 비교합니다.
3. band-pass의 아래 경계를 10, 20, 50 Hz로 바꿔 보고, onset 시각이 바뀌는지 확인합니다. 이 파일에는 움직임 잡음이 크지 않을 수 있으니 차이가 작아도 그대로 기록합니다.
4. envelope을 `sosfiltfilt`(앞뒤) 대신 `sosfilt`(한 방향)로 걸어 onset이 얼마나 늦어지는지 측정합니다. 실시간 장치(외골격, 의수)는 미래 표본을 쓸 수 없어서 한 방향 필터를 써야 한다는 점과 연결해 한 줄로 적습니다(Day I20에서 다시 다룹니다).
5. 노트북 마지막 셀에 **처리 보고 문단**을 씁니다. 표본화율, 원 신호 점검 결과(DC, clipping), band-pass(차수·대역·앞뒤 여부), 정류 방식, envelope cutoff, 정규화 기준, onset 규칙(threshold와 최소 지속 시간), 그리고 "이 파일은 근육·과제 정보가 없어 생리적 해석을 하지 않았다"는 한계를 모두 적습니다.
6. 탐색기를 열어 "관찰할 것"의 다섯 항목을 차례로 해 보고, 같은 정답 burst에 대해 (cutoff, threshold 규칙) 조합 네 개의 onset 오차를 표로 옮깁니다. 6 Hz에서 15 ms짜리 spike가 왜 50 ms 조건을 통과하는지 한 문장으로 설명합니다.
7. (선택) BMC 노트북처럼 "threshold 아래로 10 ms 이하 잠깐 내려간 것은 한 구간으로 잇는다"는 규칙을 `bursts()`에 더해 보고, 10 Hz·baseline+3SD 조합의 burst 수가 4개에서 바뀌는지 확인합니다.

> ⚠️ **흔한 오류 1:** band-pass 위 경계를 표본화율의 절반(Nyquist, 여기서는 500 Hz) 이상으로 잡는 실수입니다. `signal.butter(4, [20, 500], ..., fs=1000)`은 오류가 납니다. 교재의 "10–1000 Hz" 같은 기록 대역은 표본화율이 충분히 높을 때의 이야기이므로, 내 파일의 fs부터 확인합니다.
>
> ⚠️ **흔한 오류 2:** 과제 내 최댓값으로 정규화한 두 사람의 envelope을 놓고 "A가 B보다 근육을 더 세게 쓴다"고 말하는 실수입니다. 각자의 최댓값이 100%가 되므로, 이 정규화로는 **시간 패턴**만 비교할 수 있습니다. 강도를 비교하려면 MVC나 MMT 같은 외부 기준이 필요합니다.
>
> ⚠️ **흔한 오류 3:** 표면 전극에서 주동근과 길항근이 함께 켜진 것을 보고 곧바로 "동시수축"이라고 쓰는 실수입니다. 옆 근육 신호가 넘어온 cross-talk일 수 있습니다. TSw의 햄스트링–광근처럼 정상적인 동시 활성도 있으니, 전극 간 거리, cross-correlation, 옆 근육만 수축시키는 검사로 먼저 확인합니다.

## 퀴즈

**1.** LR에 무릎의 굽힘을 제동하는 근육은 대퇴사두근 중 어느 것인가? 표면 전극으로 대퇴직근 위에서 LR 활동이 보였다면 무엇을 의심해야 하는가?

<details><summary>정답 보기</summary>

vastii(넓은근들)입니다. Perry에 따르면 대퇴직근은 LR에 거의 활동하지 않고 주로 PSw–ISw 무렵에 나타납니다. 표면 전극에서 보인 LR 활동은 옆 vastii 신호가 섞인 cross-talk일 수 있습니다.

</details>

**2.** EMG만으로 근육이 원심성인지 구심성인지 판단할 수 없는 이유는?

<details><summary>정답 보기</summary>

EMG는 근섬유막의 전기적 활성만 재고, 근육 길이가 늘어나는지 줄어드는지는 담지 않기 때문입니다. 수축 형태를 추정하려면 관절의 각속도와 모멘트(파워 부호), 가능하면 초음파 같은 직접 측정을 함께 봐야 합니다.

</details>

**3.** 처리 순서 "정류 → low-pass"를 "low-pass → 정류"로 바꾸면 어떻게 되는가?

<details><summary>정답 보기</summary>

EMG는 0을 중심으로 양·음이 섞인 신호라, 먼저 low-pass를 걸면 거의 0만 남고 그 뒤에 정류해도 활동 크기를 되살릴 수 없습니다(예시 1). 정류는 비선형 연산이라 순서가 결과를 바꿉니다.

</details>

**4.** envelope cutoff를 3 Hz에서 10 Hz로 올렸더니 같은 threshold에서 burst가 3개에서 4개가 되었다. 가장 그럴듯한 이유는?

<details><summary>정답 보기</summary>

cutoff가 높으면 envelope이 덜 평활되어 출렁임이 커지고, 그 출렁임이 threshold를 잠깐 넘어 가짜 burst가 생깁니다. 최소 지속 시간 규칙을 두거나, 여러 설정에서 결론이 같은지 확인합니다.

</details>

**5.** 과제 내 최대 정규화(% peak)의 장점과 단점을 하나씩 말하라.

<details><summary>정답 보기</summary>

장점: 최대 수축 검사를 할 수 없는 환자(심한 경직 등)에게도 쓸 수 있습니다. 단점: 약하게 쓰든 세게 쓰든 최댓값이 100%가 되어 노력 수준 정보가 사라지므로, 사람이나 조건 사이의 활동 **강도**를 비교할 수 없습니다.

</details>

> 🖼️ 웹사이트에서는 이 레슨에 도식 두 개("보행 주기 동안 주요 근육의 활동 구간", "표면 EMG 처리 단계: 원 신호에서 onset까지")와 시각화 "EMG onset 탐색기"가 그림으로 들어갑니다. 저장소에서 읽는다면 `site/diagrams/muscle-timing-gait-cycle.svg`, `site/diagrams/emg-processing-steps.svg`, `viz/emg-onset-explorer.html`(내려받아 브라우저로 열기)을 여세요.

## 오늘의 산출물 체크리스트
- [ ] 예시 1·2를 실행하고 출력이 레슨과 같다.
- [ ] 처리 전에 원 신호(DC, clipping, 해상도)를 점검한 결과를 적었다.
- [ ] `figures/advanced/I/I5_emg_processing.png`를 저장했다.
- [ ] `min_dur`, band-pass 아래 경계, 앞뒤/한 방향 필터를 바꾼 민감도 표를 만들었다.
- [ ] 탐색기로 cutoff·threshold 조합별 onset 오차 표를 만들었다.
- [ ] 처리 보고 문단(설정 전부 + 한계)을 썼다.

## 더 읽을거리
- [P] Perry & Burnfield, 2nd ed., 2010 — 21장 Muscle Control and Dynamic Electromyography(Modes of Muscle Action, Timing, Normalization, Quantification, Electrodes, Cross-talk, Amplifiers and Signal Filtration), 4장 Ankle-Foot Complex(Dorsiflexors, Triceps Surae), 5장 Knee(Knee Extension, Knee Flexion), 6장 Hip(Muscle Control), 9장 Total Limb Function(Stance·Swing Muscle Control Pattern), 3장 Basic Functions(Propulsive Forces, Dynamic Stability).
- [Wi] Thomas, Zeni & Winter, 5th ed., 2023 — 8.0절 운동단위와 twitch(pp.171–176), 8.2절 force–velocity(pp.181–186), 9.2–9.3절 기록과 처리(pp.195–208), 9.4절 EMG와 역학 변수(pp.208–212).
- [W] Richards & Levine, eds., 6th ed., 2023 — 4장 Measuring Muscle Activity(pp.82–84), 2장 Overview of the Gait Cycle(pp.21–24)와 The Gait Cycle in Detail(pp.25–33, 사건별 근육 활동).
- [RM] Robertson et al., 2nd ed., 2014 — 8장 Electromyographic Kinesiology(pp.179–201; 기록 p.182–, 분석·해석 p.188–, onset p.191, 정규화 p.192), 9장 Muscle Modeling(pp.203–231), 12장 임계감쇠 필터(p.289).
- [R] Rosen & Ferguson (eds.), Wearable Robotics, 2020 — 17–18장(근육 대신 제동하는 댐퍼, 근피로와 전기기계 지연).
- Takakusaki K. Functional neuroanatomy for posture and gait control. *J Mov Disord.* 2017;10(1):1–17. [doi:10.14802/jmd.16062](https://doi.org/10.14802/jmd.16062)
- Hodges PW, Bui BH. A comparison of computer-based methods for the determination of onset of muscle contraction using electromyography. *Electroencephalogr Clin Neurophysiol.* 1996;101(6):511–519. [doi:10.1016/s0013-4694(96)95190-5](https://doi.org/10.1016/s0013-4694(96)95190-5)
- [BMC] `electromyography`: <https://bmclab.github.io/BMC/notebooks_html/electromyography.html>, `data_filtering`(이동 RMS와 envelope): <https://bmclab.github.io/BMC/notebooks_html/data_filtering.html>, `muscle_modeling`(force–velocity와 활성 지연): <https://bmclab.github.io/BMC/notebooks_html/muscle_modeling.html>
- SENIAM 전극 배치 권고: <http://www.seniam.org/>
- 이론 노트: [T04 — 근육과 EMG](../I-gait-theory/note-T04.md)

---
[← 이전](day-I4.md) · [코스 지도](../../../README.md) · [다음 →](day-I6.md)
