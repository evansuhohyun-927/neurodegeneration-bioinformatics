# Day I3 — 관절 운동학: 마커 좌표로 시상면 각도 곡선 만들고 읽기

> **주차:** 심화 파트 I — 보행분석 (1주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I3_joint_angles.ipynb`, `figures/advanced/I/I3_joint_angles.png`
>
> **먼저 끝내 둘 레슨:** [Day I1](day-I1.md)(%GC와 phase), [Day I2](day-I2.md)(rocker), [Day 23 — 시계열 기초](../../week-4/day-23.md)(시간축 다루기).
>
> **이론 노트:** [T02 — 운동학](../I-gait-theory/note-T02.md)에서 3차원 각도(Cardan, JCS), 각도 미분과 각속도의 차이를 다룹니다. 마커가 뼈와 따로 움직이는 오차는 [T08](../I-gait-theory/note-T08.md), 좌표를 거르는 필터는 [T09](../I-gait-theory/note-T09.md)에 있습니다.

## 오늘의 목표
- 분절각(segment angle)과 관절각(joint angle)을 정의하고, 이 레슨이 쓰는 좌표축과 부호 규약을 말로 설명할 수 있다.
- Winter의 공개 마커 자료로 무릎각·발목각·대퇴각을 계산하고, 시간축을 heel contact 기준 %GC로 바꿔 그릴 수 있다.
- 계산한 곡선을 Perry의 phase별 정상 패턴과 특징점으로 비교하고, 숫자가 다를 때 원인을 측정 정의에서 찾을 수 있다.

## 🎬 영상으로 먼저 보기

- [Analysis of Gait Motion: Sagittal Plane — Physical Therapy Education Solutions](https://www.youtube.com/watch?v=uh7riepyJl4) (7:55)
- **무엇에 주목할까:** 고관절·무릎·발목이 한 주기 동안 각각 몇 번 굽고 펴지는지 세어 보세요. 무릎은 굽힘 봉우리가 두 번(작은 것과 큰 것), 발목은 방향이 네 번 바뀝니다. 오늘 계산한 곡선에서 그 횟수를 다시 셀 겁니다. 영상이 "고관절 굴곡 몇 도"라고 할 때 그것이 골반 기준인지 수직선 기준인지도 메모해 두세요.

## 개념 설명

### 각도는 측정값이 아니라 규약이다

**운동학(kinematics)** 은 움직임을 일으킨 힘은 묻지 않고, 위치·각도와 그 변화만 기술합니다. 힘과 모멘트를 다루는 운동역학(kinetics)은 Day I4의 몫입니다([W] 1장 p.10, [Wi] 3.0절).

곧게 편 무릎을 0°라고 부를 수도, 180°라고 부를 수도 있습니다. 각도는 "무엇과 무엇 사이를, 어느 쪽에서 어느 쪽으로, 어느 방향을 +로" 재는지 정해야 숫자가 됩니다. 그래서 운동학 보고서에서 가장 먼저 적는 것이 **좌표축과 부호 규약**입니다.

"굴곡", "신전" 같은 해부학 이름은 **두 분절 사이의 관계**만 말해 줍니다. 허벅지가 바닥에 대해 얼마나 기울었는지, 즉 공간 속의 방향을 말하려면 실험실에 고정된 좌표축이 따로 있어야 합니다([Wi] 3.1절). 그래서 각도도 두 종류가 필요합니다. 공간 속 방향을 재는 **분절각**과, 이웃한 두 분절의 관계를 재는 **관절각**입니다. 발목은 굴곡·신전이라는 말 대신 **배측굴곡(dorsiflexion, DF: 발등이 정강이 쪽으로)** 과 **족저굴곡(plantarflexion, PF: 발바닥 쪽으로)** 을 씁니다. 발목에서 "굴곡"이 어느 쪽인지 저자마다 반대로 써 왔기 때문에 Perry는 DF/PF만 씁니다([P] 4장 Terminology, [W] 1장).

이 레슨의 규약은 Winter 교재 부록과 같습니다([Wi] 3.6절 pp.62–63, 부록 A). **x = 진행 방향(앞이 +), y = 수직(위가 +)**, 오른쪽을 보고 걷는 사람을 옆에서 본 시상면입니다. 같은 교재도 3차원을 다루는 3.1절과 7장에서는 **z를 수직축**으로 쓰므로, 책을 오갈 때마다 축 이름부터 확인해야 합니다. **분절각**은 분절 하나가 전역 기준(앞쪽 수평선)과 이루는 각으로, 원위 마커에서 근위 마커로 향하는 벡터를 `arctan2`로 계산하고 반시계 방향을 +로 둡니다. **관절각**은 이웃한 두 분절각의 차입니다. 같은 사람의 같은 자세라도 생체역학식(두 분절각의 차를 그대로)과 임상식(해부학적 자세를 0°로, "굴곡 몇 도"처럼 이름으로 방향 표시)이 다른 숫자를 냅니다([RM] 1장 pp.24–27). 같은 회전 규약 안에서도 무릎 굴곡과 고관절 굴곡은 회전 방향이 반대라서, 임상식으로 바꿀 때 관절마다 부호를 따로 정해야 합니다. 그리고 피험자가 왼쪽을 보고 걷는 영상에서는(또는 보행로 반대편에 카메라를 두면) 모든 부호가 뒤집힙니다.

같은 원리에서 나오는 주의 몇 가지를 더 적어 둡니다.

- **벡터 방향.** Winter는 원위 → 근위 마커 벡터로 분절각을 재고, [RM] 1장은 분절의 근위 끝을 기준으로 잽니다. 두 정의의 분절각은 180° 차이가 나지만, 두 분절에 같은 정의를 쓰면 관절각을 구할 때 그 차이가 빠집니다. 한 분절만 방향을 뒤집으면 관절각이 180° 틀어집니다([RM] 1장 p.24, BMC `kinematics_angular_2d`). 또 "두 분절각의 차 = 관절각"은 두 분절이 같은 평면에서 움직일 때만 맞습니다.
- **부호 없는 각.** 두 벡터의 내적으로 `arccos`를 구하면 0–180°의 **부호 없는** 사이각이 나옵니다. 이 값으로는 무릎 5° 굴곡과 5° 과신전이 똑같이 5°라서 구분되지 않습니다. 그래서 오늘은 방향을 담은 `arctan2`로 분절각을 구해 뺍니다(BMC `kinematics_angular_2d`).
- **그래프의 +와 말의 이름.** 임상 그래프는 보통 굴곡(무릎·고관절)과 배측굴곡(발목)을 +로 그립니다. 다만 +/−는 그래프용 약속일 뿐이라, 임상에서 말할 때는 "발목 −10°"가 아니라 "족저굴곡 10°"라고 합니다([P] 20장 Reference Scales). 0°를 중립에 두는 척도가 임상 표준이고, 180° 척도는 숫자를 모두 양수로 만들어 컴퓨터 처리에는 편하지만 읽는 사람이 다시 바꿔 읽어야 합니다(같은 절).
- **같은 저장소 안에서도 다르다.** BMC의 `transformation_2d` 노트북은 이 레슨과 같은 시야(x 앞, y 위)인데도 무릎 굴곡을 **음수**로 내고, `kinematics_angular_2d` 노트북의 고관절 식은 몸통각에서 대퇴각을 빼서 이 레슨의 `hip`과 부호가 반대입니다. 코드를 가져다 쓸 때는 식부터 확인합니다.

아래 도식 **"분절각에서 관절각으로: 이 레슨의 규약"** 은 오늘 쓰는 마커 쌍, 벡터 방향, 관절각 식과 부호를 한 장에 모은 것입니다. 인터랙티브 그림 **"관절각 탐색기"** 에서는 대퇴·하퇴·발의 분절각을 슬라이더로 움직이며 무릎·발목 각이 여러 규약에서 각각 어떤 숫자가 되는지 함께 볼 수 있습니다.

### Winter 자료에서 어떤 마커를 쓰는가, 발목 부호는 어느 쪽인가

BMC 저장소의 `WinterTableA1.txt`는 Winter 교재 부록 Table A.1의 공개본입니다. 한 사람이 평지를 걷는 1.5초 동안 오른쪽 하지의 마커 7개(hip, knee, fibula head, ankle, heel, 5th metatarsal, toe)와 몸통 마커 1개(rib cage)의 x, y 좌표가 약 70 Hz로 106 frame 들어 있습니다. 단위는 파일에 적혀 있지 않고 원전 기준으로 cm입니다. 70 Hz는 Perry가 보행 촬영의 최소로 드는 60 Hz를 넘습니다([P] 20장). 이 표의 관절각을 재현하려면 **하퇴는 ankle → fibula head**, **발은 5th metatarsal → heel**로 잡아야 합니다. toe나 knee 마커로 바꾸면 값이 달라집니다(예시 2).

마커가 붙은 자리는 대략 다음과 같습니다([Wi] 부록 A 그림 A.1의 설명을 따름). hip = 대퇴골의 대전자(greater trochanter), knee = 대퇴골 외측 상과(lateral epicondyle), fibula = 비골두, ankle = 외측 복사뼈, heel = 뒤꿈치, mt5 = 제5중족골, toe = 발끝. 무릎 근처에 마커가 둘(knee, fibula)인 데는 이유가 있습니다. 무릎은 순수한 경첩이 아니라 굽힐 때 회전 중심이 움직이므로, 두 분절이 마커 하나를 나눠 쓰기보다 대퇴 끝(knee)과 하퇴 시작(fibula head)에 따로 붙이는 편이 낫습니다([RM] 1장 pp.17–18). 또 비골두 위의 피부는 팽팽해서 무릎을 굽혀도 마커가 덜 밀립니다([P] 20장 Independent Skin Motion). 마커가 분절의 양 끝에 꼭 있을 필요는 없고, 분절의 긴 축 위에만 있으면 그 분절의 기울기를 잴 수 있습니다([Wi] 3.6절). 분절마다 마커 두 개를 잇는 이런 단순한 방식으로는 분절이 자기 긴 축 둘레로 도는 회전은 볼 수 없습니다([W] 4장 pp.72–75). 오늘 시상면만 보는 이유이기도 합니다.

마커는 관절 축 위에 정확히 놓이지 않습니다. 예컨대 발목의 실제 회전축은 복사뼈 끝보다 조금 아래·앞을 지나지만, 그 부위는 피부가 많이 움직여서 마커는 복사뼈 끝에 붙입니다([P] 20장 Sagittal Plane Landmarks). 그리고 발목 0°는 "정강이와 발이 직각"인 자세를 부르는 약속입니다. 실제 사이각은 약 90°인데 그것을 0°로 놓습니다([W] 1장, [P] 4장). heel–mt5 선으로 잰 "발목각"에는 엄밀히 말해 발목(경골–거골) 관절만이 아니라 그 아래 거골하 관절과 발 중간 관절의 움직임도 섞입니다. 보행분석에서는 이 둘을 따로 떼어 보기 어려워 흔히 묶어 부릅니다([W] 1장 p.6, [P] 4장).

발목 부호는 특히 조심해야 합니다. Winter 교재 본문(3.6.2절)의 식은 **족저굴곡(plantarflexion)을 +** 로 두지만, 같은 책 부록 Table A.4의 발목 값은 **배측굴곡(dorsiflexion)이 +** 인 쪽으로 나옵니다. 둘은 부호만 반대입니다. **이 레슨은 배측굴곡 +, 족저굴곡 −** 를 씁니다. Perry와 임상 문헌의 관례와 같아서 비교가 쉽기 때문입니다. 무릎은 굴곡 +(완전 신전 = 0°)입니다.

고관절은 정의가 둘입니다. Perry는 **thigh 각**(수직선 기준 대퇴의 기울기)을 주로 쓰고, 골반 기준 **hip 각**은 따로 보여 줍니다. 같은 걸음에서 thigh 각은 굴곡 20°(IC)부터 겉보기 신전 20°(TSt 끝)까지, hip 각은 굴곡 30°부터 신전 10°까지로 약 10° 어긋납니다. 차이는 평균 약 10°의 골반 전방경사입니다([P] 6장, Appendix A). 골반의 앞뒤 기울기는 뒤쪽 PSIS(위뒤엉덩뼈가시)와 앞쪽 ASIS(위앞엉덩뼈가시)를 잇는 선으로 재는데, 정상인이 조용히 서 있을 때 이 선이 수평에서 앞으로 약 10° 숙어 있습니다. 그만큼 골반 기준 고관절 굴곡이 크게 측정됩니다([P] 20장, 14장). 걷는 동안 골반 경사는 이 기본값 위에서 몇 도(약 4°) 더 오르내리므로, 두 각의 차이도 늘 정확히 10°인 상수는 아닙니다([P] 7장 Pelvis).

Perry가 thigh 각을 더 낫다고 보는 이유는, 골반과 대퇴는 병에 서로 다르게 반응하므로 따로 봐야 원인을 가릴 수 있고, 대퇴가 보폭에 얼마나 기여하는지가 바로 보이기 때문입니다. 다만 3D 동작분석 장비가 보통 보고하는 것은 골반–대퇴 사이의 hip 각입니다([P] 6장). 몸통을 앞으로 숙이면 골반도 따라 숙여지므로 hip 각에는 "굴곡"으로 나타나지만, 대퇴가 그대로면 thigh 각은 변하지 않습니다([W] 2장 p.21). 허벅지에 붙인 IMU(Day I9)가 재는 것도 hip 각이 아니라 thigh 분절각입니다.

Winter 자료에는 골반 마커가 없으므로, 오늘은 수직선 기준 thigh 각을 계산해 Perry의 thigh 각과 비교합니다. 몸통 마커 기준 각도도 함께 출력하지만, 이것은 골반 기준 hip 각과 다르다는 점을 기억하세요. 아래 도식 **"thigh 각과 hip 각"** 은 같은 허벅지 자세를 두 기준으로 잴 때 숫자가 어떻게 갈리는지 보여 줍니다.

### 정상 곡선을 phase와 함께 읽기

Perry는 phase마다 대표 각도를 5° 단위로 반올림해 제시합니다([P] 4–6장). 비교의 기준이 될 특징점만 뽑으면 다음과 같습니다.

- **무릎**: IC에 약 5° 굴곡 → LR 끝(12% GC)에 약 20° 굴곡(충격 흡수용 작은 봉우리) → TSt 중간(39% GC)에 약 5°로 최소 → PSw 끝에 약 40° → ISw 끝에 약 60°로 최대(발이 바닥에 끌리지 않게 하는 큰 봉우리) → 95% GC에 0°로 완전히 펴졌다가 TSw 끝에 약 5°([P] 5장). 2차원 영상 자료는 최대 굴곡을 70° 안팎으로 보고하기도 합니다.
  - IC의 무릎은 "쭉 편" 것처럼 보여도 평균 5°쯤 굽어 있고(정상 범위 0–10°), 빨리 걸을수록 더 굽어 닿습니다. 주기 중 무릎이 완전히 0°가 되는 때는 오히려 TSw 끝 무렵입니다([P] 5장 Sagittal Motion).
  - swing에서 발끝을 들어 주는 주역은 발목이 아니라 무릎입니다. 뒤에 남은 다리는 발끝이 아래를 향한 채라 발목을 들어 올리는 것만으로는 모자라고, 무릎이 약 60° 굽어야 합니다. 그중 약 40°는 발이 아직 바닥에 있는 PSw에 미리 확보됩니다. ISw 끝에도 발목은 아직 5°쯤 족저굴곡 상태입니다([P] 4장, 5장).
- **발목**: LR 초반 약 5° 족저굴곡(뒤꿈치를 축으로 발바닥을 내려놓음) → MSt에 정강이가 발 위로 넘어가며 배측굴곡 → 45% GC에 약 10° 배측굴곡 최대 → PSw에 약 15° 족저굴곡까지 빠르게 → swing에서 중립 근처로 복귀. 방향이 네 번 바뀌는 "호(arc) 네 개"입니다([P] 4장). 한 주기에 쓰는 전체 범위는 평균 25° 정도로 무릎보다 훨씬 작지만, stance의 세 호는 Day I2의 rocker와 이어집니다(LR의 족저굴곡 = heel rocker, MSt–TSt의 배측굴곡 = ankle·forefoot rocker 위의 정강이 전진, PSw의 족저굴곡 = toe rocker; T02 8절).
- **대퇴(thigh 각)**: IC에 약 20° 굴곡 → 27% GC 무렵 수직 → 50% GC에 겉보기 신전 약 20° → MSw에 약 25° 굴곡 최대 → TSw에 20°로 약간 되돌아옴([P] 6장). 무릎·발목과 달리 호는 둘뿐입니다(stance에 신전, swing에 굴곡). IC의 20° 굴곡은 보폭을 벌리면서도 다리가 너무 비스듬해 미끄러지지 않게 하는 절충 자세입니다. TSt 끝의 "신전 20°"는 고관절 혼자 낼 수 있는 범위를 넘습니다. 고관절이 끝까지 펴진 위에 골반이 앞으로 더 기울고(3–7°) 뒤로 돌아간(약 5°) 것이 더해진 **겉보기 과신전**입니다([P] 6장).

Whittle도 같은 흐름을 사건 중심으로 서술합니다([W] 2장 pp.21–24). 숫자는 조금 다릅니다. 무릎의 stance 굴곡 봉우리는 보통 10–20°(주기의 15–20% 무렵), swing 봉우리는 60–70°이고, 고관절은 swing 중간쯤 최대 굴곡 약 30°에 이르러 다음 IC까지 그대로 머물고, 최대 신전 10–20°는 stance 후반 반대 발이 닿을 무렵에 나옵니다. 이 고관절 숫자를 Perry 값과 맞대려면 그 그림이 수직선 기준인지 골반 기준인지부터 확인해야 합니다. Whittle은 두 정의가 다 쓰인다고 짚을 뿐, 어느 쪽 곡선인지가 숫자를 10°쯤 바꿉니다. Whittle의 예시 피험자는 toe-off 직후 발목이 약 25° 족저굴곡했습니다. 그런데 이 사람은 cadence 136 steps/min으로 꽤 빨리 걸었고, 책도 절대값보다 변화의 패턴을 보라고 권합니다(같은 쪽).

각도를 미분해 각속도·각가속도를 구하면 잡음이 크게 늘어나는데, 그 이유와 필터 선택은 Day I10에서 다룹니다. 오늘은 **필터를 걸지 않은 원 좌표**로 각도를 계산하고, 예시 3에서만 거른 좌표와 잠깐 비교합니다. 위의 phase별 자세 몇 개는 **"관절각 탐색기"** 의 단추로 불러와 막대 그림으로 볼 수 있습니다.

### 숫자를 비교하기 전에 확인할 것

계산한 곡선이 교재 값과 몇 도 다를 때 "이 사람은 비정상"이나 "내 코드가 틀렸다"로 바로 가지 않습니다. Perry 스스로 같은 대상자를 세 연구실에서 재면 곡선의 모양은 같아도 끝값은 꽤 다르게 나왔다고 적습니다. 원인은 마커 위치와 0° 기준 자세의 차이였습니다([P] 20장). 모양과 시점의 비교는 비교적 믿을 만하지만, 연구실 사이의 절대 각도 비교는 조심해야 합니다. 차이를 만드는 흔한 원인을 차례로 점검합니다.

1. **정의가 같은가.** 마커 쌍, 벡터 방향, +의 방향, 고관절은 thigh 각인지 hip 각인지. 그리고 **0° 자세**. 조용히 선 자세를 0°로 삼는 실험실이 많은데, 균형 잡힌 기립의 발목은 직각이 아니라 배측굴곡 5°쯤이고, 무릎이 과신전된 채 선 사람을 0°로 두면 걷는 동안 무릎이 "다 안 펴지는" 것처럼 기록됩니다. Perry는 해부학적 중립 정렬을 기준으로 삼고 실제 기립 자세는 그대로 기록하라고 권합니다([P] 20장 The Zero (Neutral) Position).
2. **2D인가 3D인가.** 시상면 분석은 보행의 큰 움직임이 그 평면에 몰려 있어 단순하고 쓸모 있지만, 다른 두 평면의 정보는 버립니다([RM] 1장 p.12). 화면 위의 각은 3D 각을 평면에 투영한 것이라, 다리가 카메라 평면에서 돌아가면 굴곡이 작게 찍힙니다(Day I2 예시 3, [P] 20장). 세 평면의 2D 각을 모아도 3D 관절각이 되지 않습니다([RM] 2장 p.50). Perry의 정상값은 3D 자료입니다.
3. **마커는 뼈가 아니다.** 관절 중심은 피부 위 마커로 **추정**한 값이고(고관절 중심은 특히 어렵다), 피부와 근육은 뼈와 따로 움직입니다. 무릎을 90° 굽히면 무릎 근처 피부 마커가 뒤로 수 cm 밀려 무릎각이 실제보다 작게 나온다는 방사선 연구가 있습니다([P] 20장). 이런 연부조직 오차는 시상면 무릎각에는 비교적 작지만, 짧은 분절(발)과 횡단면 회전에서는 큽니다([W] 4장 p.71). 자세한 것은 [T08](../I-gait-theory/note-T08.md).
4. **속도가 같은가.** 같은 사람도 느리게 걸으면 LR의 무릎 굴곡이 크게 줄어듭니다. Perry가 인용한 자료에서는 90 m/min 대비 60 m/min에서 약 67% 줄고, 120 m/min에서는 약 38% 늘었습니다([P] 5장). 느린 환자를 평소 속도의 정상값과 바로 비교하면 안 되는 이유입니다.
5. **나이가 같은가.** 성인의 정상값은 대략 7세 이후의 아이에게만 그대로 적용됩니다([P] 16장).
6. **개인차는 얼마인가.** Perry의 Appendix A는 정상인 54–55명의 평균과 SD를 1% GC 간격으로 줍니다. SD는 발목 약 3–5°, 무릎 약 5–9°(swing에서 큼), hip 약 6–8°입니다. 한 사람의 곡선이 평균에서 몇 도 벗어났다고 이상이라 할 수 없습니다. 본문의 phase 값은 그 평균을 5° 단위로 반올림한 것이라 부록 평균과 1–3° 다릅니다. 예컨대 무릎 LR 봉우리는 본문 20°, 부록 평균 약 18°이고, 발목 최대 족저굴곡은 본문 15°, 부록 평균 약 17°입니다([P] Appendix A, 표는 그림으로만 실려 있어 몇 개 값만 옮김).
7. **표본이 몇 개인가.** 오늘 자료는 한 사람의 1.5초, 온전한 주기는 하나뿐입니다. 여러 주기를 평균하고 흩어짐을 보는 ensemble average는 만들 수 없습니다(Day I11).

### 곡선을 읽는 세 단계

Perry는 운동 자료를 세 단계로 읽으라고 권합니다([P] 20장 Motion Data Interpretation). ① 최대·최소의 **크기**(stance와 swing은 요구가 달라 따로), ② 그 일이 **어느 phase에** 일어났는가(%GC 숫자만 적으면 기능적 의미가 빠짐), ③ **이웃 관절**의 곡선을 함께 보기. 책의 뇌졸중 환자 예가 이 순서의 쓸모를 보여 줍니다. 무릎의 최대·최소만 보면 거의 정상 범위인데, phase로 다시 보면 stance 초의 굴곡은 충격 흡수가 아니라 swing에서 덜 펴진 채 닿은 것이었고, swing 굴곡은 늦게 나타나 발끝이 끌렸습니다. 발목을 함께 보니 swing 말부터 toe-off까지 족저굴곡된 채 머무는 발목(첨족)이 stance에서 정강이 전진을 막아 무릎 이상이 뒤따라 생긴 것이었습니다. 같은 무릎 40° 굴곡도 PSw 끝이면 정상이고 MSt면 이상입니다(T02 8절). 다만 운동 자료는 이상이 언제·얼마나인지를 보여 줄 뿐, 원인은 정상 phase 기능과 대조하는 추론으로 찾아야 합니다(Day I15).

## 예시로 이해하기

> **데이터:** Duarte M, Watanabe RN. *Notes on Scientific Computing for Biomechanics and Motor Control* v0.2.0의 `data/WinterTableA1.txt`(내용 CC BY 4.0, [doi:10.5281/zenodo.23654869](https://doi.org/10.5281/zenodo.23654869)). 원전은 Winter 교재 부록 Table A.1입니다. 한 사람·한 시행 자료이므로 "정상 곡선"의 대표로 일반화하지 않습니다.
>
> ```bash
> mkdir -p data/bmc
> curl -o data/bmc/WinterTableA1.txt https://raw.githubusercontent.com/BMClab/BMC/master/data/WinterTableA1.txt
> ```

### 예시 1 — 분절각 → 관절각 → %GC 곡선

```python
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# BMC data/WinterTableA1.txt: 머리글 2줄, 106행 × 18열, 좌표 단위 cm(원전 기준), x = 진행 방향, y = 수직
raw = pd.read_csv("data/bmc/WinterTableA1.txt", sep=r"\s+", header=None, skiprows=2).to_numpy()
frame, t = raw[:, 0].astype(int), raw[:, 1]
names = ["rib", "hip", "knee", "fibula", "ankle", "heel", "mt5", "toe"]
M = {nm: raw[:, 2 + 2 * i: 4 + 2 * i] for i, nm in enumerate(names)}     # 마커별 (x, y)
print("frame 수 %d, 기록 %.3f s, 표본화 %.2f Hz" % (len(t), t[-1], (len(t) - 1) / t[-1]))

def seg_angle(distal, proximal):
    """원위 마커 → 근위 마커 벡터가 +x(앞쪽 수평)와 이루는 각(도), 반시계 +"""
    d = M[proximal] - M[distal]
    return np.degrees(np.unwrap(np.arctan2(d[:, 1], d[:, 0])))

thigh = seg_angle("knee", "hip")          # 대퇴: knee → hip
leg   = seg_angle("ankle", "fibula")      # 하퇴: ankle → fibula head  (toe·knee가 아님!)
foot  = seg_angle("mt5", "heel")          # 발:   5th metatarsal → heel
trunk = seg_angle("hip", "rib")           # 몸통(½HAT): hip → rib cage

knee  = thigh - leg                       # + = 굴곡, 0 = 완전 신전
ankle = foot - leg - 90                   # + = 배측굴곡(DF), − = 족저굴곡(PF)  ← 이 레슨의 규약
thigh_v = thigh - 90                      # 수직선 기준 대퇴각(Perry의 thigh 각): + = 굴곡
hip   = thigh - trunk                     # 몸통선 기준 대퇴각: + = 굴곡 (골반 기준 hip 각과는 다르다)

# [Wi] 부록 A가 표시한 사건: 오른발 heel contact = frame 28, 97 / toe-off = frame 1, 70
hc1, to, hc2 = 28, 70, 97
idx = np.arange(hc1 - 1, hc2)             # frame 28…97 (배열 위치는 frame − 1)
gc = (frame[idx] - hc1) / (hc2 - hc1) * 100
print("stride %.3f s, stance %.1f%%GC" % (t[hc2 - 1] - t[hc1 - 1], (to - hc1) / (hc2 - hc1) * 100))

def at(y, pct):                           # 특정 %GC에서의 값(선형 보간)
    return np.interp(pct, gc, y[idx])

print("\n%GC   knee(굴곡+)  ankle(DF+)  thigh_v(굴곡+)  hip_vs_trunk")
for p in [0, 12, 31, 45, 50, 62, 75, 87]:
    print("%3d   %8.1f   %9.1f   %10.1f   %10.1f" % (p, at(knee, p), at(ankle, p), at(thigh_v, p), at(hip, p)))
print("\n최댓값/최솟값 (한 주기)")
for nm, y in [("knee", knee), ("ankle", ankle), ("thigh_v", thigh_v)]:
    yy = y[idx]
    print("%-8s max %5.1f at %4.1f%%GC | min %6.1f at %4.1f%%GC"
          % (nm, yy.max(), gc[yy.argmax()], yy.min(), gc[yy.argmin()]))

fig, axs = plt.subplots(1, 3, figsize=(11, 3.2), sharex=True)
for ax, y, title in zip(axs, [knee, ankle, thigh_v],
                        ["knee (flexion +)", "ankle (dorsiflexion +)", "thigh vs vertical (flexion +)"]):
    ax.plot(gc, y[idx], "k")
    ax.axvline((to - hc1) / (hc2 - hc1) * 100, color="r", ls="--", lw=0.8)   # toe-off
    ax.axhline(0, color="gray", lw=0.5)
    ax.set_title(title); ax.set_xlabel("% gait cycle (right heel contact = 0)")
axs[0].set_ylabel("angle (deg)")
out = Path("figures/advanced/I/I3_joint_angles.png")
out.parent.mkdir(parents=True, exist_ok=True)
fig.tight_layout(); fig.savefig(out, dpi=150)
print("저장:", out)
```

실행 결과(그림은 `figures/advanced/I/I3_joint_angles.png`):

```text
frame 수 106, 기록 1.501 s, 표본화 69.95 Hz
stride 0.987 s, stance 60.9%GC

%GC   knee(굴곡+)  ankle(DF+)  thigh_v(굴곡+)  hip_vs_trunk
  0        1.0         2.0         20.5         13.9
 12       16.9        -2.6         17.5         12.5
 31        8.0         4.3         -3.0          0.9
 45        7.5         6.9        -15.4         -4.4
 50       14.7         1.7        -17.0         -6.2
 62       50.9       -24.5         -5.7         -2.1
 75       62.0        -6.3         19.7         19.8
 87       22.8        -2.5         25.6         22.0

최댓값/최솟값 (한 주기)
knee     max  67.8 at 69.6%GC | min   -4.8 at 95.7%GC
ankle    max   8.3 at 33.3%GC | min  -24.8 at 62.3%GC
thigh_v  max  26.1 at 85.5%GC | min  -17.5 at 50.7%GC
저장: figures/advanced/I/I3_joint_angles.png
```

Perry의 특징점과 나란히 놓아 봅니다.

| 특징점 | Perry(반올림, 3D 자료) | 이 자료(원 좌표, 2D) | 읽는 법 |
|---|---|---|---|
| 무릎 LR 봉우리 | 12% GC에 약 20° | 12% GC에 16.9° | 같은 모양, 크기는 비슷 |
| 무릎 최대 굴곡 | ISw 끝(약 75%)에 약 60° | 69.6% GC에 67.8° | 2D 자료가 더 크게 나오는 경향과 일치 |
| 발목 배측굴곡 최대 | 45% GC에 약 10° | 33.3% GC에 8.3°(거른 좌표: 37.7% GC에 6.9°) | 작은 봉우리라 시점이 잡음에 흔들림(예시 3) |
| 발목 족저굴곡 최대 | PSw 끝 약 15°(부록 평균 약 17°) | 62.3% GC에 24.8°(거른 좌표: 20.4°) | 원 좌표의 잡음이 봉우리를 4° 남짓 키움. 거른 뒤에도 몇 도 더 큼 |
| thigh 각 | IC 20° → 50%에 −20° → MSw 25° | 20.5° → −17.0° → 26.1° | 거의 같음 |

이 사람의 stride는 0.987 s(cadence 약 122 steps/min)로 Perry의 평균(113 steps/min)보다 조금 빠릅니다. 속도, 2D와 3D의 차이, 마커 정의, 필터 유무가 모두 숫자를 바꿉니다. 부록 표의 각도는 필터를 거친 좌표로 계산한 값이라 오늘의 원 좌표 결과와 몇 도 다를 수 있고, 봉우리에서는 그 차이가 더 큽니다(예시 3). 개인차도 큽니다. Perry 부록의 SD만 해도 무릎 5–9°입니다. 그래서 비교의 핵심은 **봉우리의 개수, 순서, 대략의 시점**입니다.

### 예시 2 — 마커를 바꾸면, 부호를 바꾸면

```python
import numpy as np
import pandas as pd

raw = pd.read_csv("data/bmc/WinterTableA1.txt", sep=r"\s+", header=None, skiprows=2).to_numpy()
names = ["rib", "hip", "knee", "fibula", "ankle", "heel", "mt5", "toe"]
M = {nm: raw[:, 2 + 2 * i: 4 + 2 * i] for i, nm in enumerate(names)}

def seg_angle(distal, proximal):
    d = M[proximal] - M[distal]
    return np.degrees(np.unwrap(np.arctan2(d[:, 1], d[:, 0])))

leg_fib  = seg_angle("ankle", "fibula")
leg_knee = seg_angle("ankle", "knee")
foot_mt5 = seg_angle("mt5", "heel")
foot_toe = seg_angle("toe", "heel")

ankle_ref = foot_mt5 - leg_fib - 90            # 이 레슨의 기준 정의(DF +)
ankle_alt = foot_toe - leg_knee - 90           # 마커를 바꾼 정의
diff = ankle_alt - ankle_ref
print("마커를 바꾸면 발목각이 평균 %+.1f° 이동 (범위 %+.1f ~ %+.1f°)" % (diff.mean(), diff.min(), diff.max()))

ankle_text = leg_fib - foot_mt5 + 90           # [Wi] 본문 3.6.2 식의 부호(PF +)
print("본문 식(PF +)과 이 레슨 정의(DF +)의 합 = %.1f (항상 0이면 부호만 반대)" % np.abs(ankle_text + ankle_ref).max())
```

실행 결과:

```text
마커를 바꾸면 발목각이 평균 +4.3° 이동 (범위 -3.2 ~ +9.8°)
본문 식(PF +)과 이 레슨 정의(DF +)의 합 = 0.0 (항상 0이면 부호만 반대)
```

마커를 knee와 toe로 바꾸면 발목각이 평균 4° 남짓 움직이는데, 이동량이 일정하지 않고 −3°에서 +10°까지 출렁입니다. 단순히 곡선 전체를 위아래로 옮기는 상수 차이가 아니라는 뜻입니다. 무릎 마커는 무릎 관절 자체의 움직임을, toe 마커는 발가락 관절의 꺾임을 함께 담기 때문입니다. 반면 본문 식과 이 레슨 식은 정확히 부호만 반대입니다. **어느 마커로 어느 부호를 썼는지 그림 옆에 한 줄로 적어야** 다른 자료와 비교할 수 있습니다.

같은 Winter 부록 안에서도 분절의 정의는 하나가 아닙니다. 관절각용 하퇴는 ankle → fibula head지만, 힘과 모멘트를 계산하는 운동역학용 하퇴는 ankle → knee로 잡혀 있어 그 분절각이 약 4° 다르고, 운동역학용 발도 mt5 → ankle로 따로 정의됩니다([Wi] 부록 A). 분절의 끝점을 무엇으로 정했는지가 각도와 분절 길이를 함께 바꿉니다([RM] 3장).

### 예시 3 — 원 좌표의 두 가지 한계: 마커는 뼈가 아니고, 봉우리는 잡음에 흔들린다

Winter 부록은 원 좌표(Table A.1)와 필터를 거친 좌표를 함께 실어, 필터가 무엇을 바꾸는지 직접 비교하게 합니다([Wi] 부록 A). 같은 비교를 공개본으로 해 봅니다. 필터 자체(왜 6 Hz인지, 왜 앞뒤로 두 번 거르는지)는 Day I10에서 배우니 오늘은 결과만 봅니다. 6 Hz는 걷기 마커에 흔히 쓰는 경험값을 임시로 하나 고른 것이고, 실제로는 좌표마다 알맞은 cutoff가 다르게 나옵니다(Day I10).

```python
import numpy as np
import pandas as pd
from scipy.signal import butter, filtfilt

raw = pd.read_csv("data/bmc/WinterTableA1.txt", sep=r"\s+", header=None, skiprows=2).to_numpy()
frame, fs = raw[:, 0].astype(int), (len(raw) - 1) / raw[-1, 1]
names = ["rib", "hip", "knee", "fibula", "ankle", "heel", "mt5", "toe"]
segs = {"thigh": ("knee", "hip"), "leg": ("ankle", "fibula"), "foot": ("mt5", "heel")}

def markers(X):
    return {nm: X[:, 2 + 2 * i: 4 + 2 * i] for i, nm in enumerate(names)}

def joint_angles(M):                                # 예시 1과 같은 마커 쌍·부호 규약
    def seg(distal, proximal):
        d = M[proximal] - M[distal]
        return np.degrees(np.unwrap(np.arctan2(d[:, 1], d[:, 0])))
    thigh, leg, foot = seg("knee", "hip"), seg("ankle", "fibula"), seg("mt5", "heel")
    return {"knee": thigh - leg, "ankle": foot - leg - 90, "thigh_v": thigh - 90}

# (1) 마커는 뼈가 아니다: 길이가 변하지 않아야 할 분절의 길이가 frame마다 달라진다
M = markers(raw)
print("분절   길이 최소–최대(cm)   한쪽 마커가 1 mm 어긋날 때 각도 변화(°)")
for nm, (d, p) in segs.items():
    L = np.linalg.norm(M[p] - M[d], axis=1)
    print("%-6s %6.1f – %4.1f          %.2f" % (nm, L.min(), L.max(), np.degrees(np.arctan(0.1 / L.mean()))))

# (2) 원 좌표의 잡음이 봉우리를 키운다: 좌표를 6 Hz 저역통과(앞뒤 두 번)로 거른 뒤 같은 계산
b, a = butter(2, 6 / (fs / 2))
filt = raw.copy()
filt[:, 2:] = filtfilt(b, a, raw[:, 2:], axis=0)
A_raw, A_flt = joint_angles(M), joint_angles(markers(filt))

hc1, hc2 = 28, 97                                   # 오른발 heel contact (예시 1과 같음)
idx = np.arange(hc1 - 1, hc2)
gc = (frame[idx] - hc1) / (hc2 - hc1) * 100
print("\n한 주기(frame 28–97)의 최댓값/최솟값과 시점(%GC)")
print("관절        원 좌표                       거른 좌표")
for k in A_raw:
    r, f = A_raw[k][idx], A_flt[k][idx]
    print("%-8s max %5.1f(%4.1f) min %6.1f(%4.1f) | max %5.1f(%4.1f) min %6.1f(%4.1f)"
          % (k, r.max(), gc[r.argmax()], r.min(), gc[r.argmin()], f.max(), gc[f.argmax()], f.min(), gc[f.argmin()]))
print("\n106 frame 전체 범위(거른 좌표): knee %.1f ~ %.1f, ankle %.1f ~ %.1f"
      % (A_flt["knee"].min(), A_flt["knee"].max(), A_flt["ankle"].min(), A_flt["ankle"].max()))
```

실행 결과:

```text
분절   길이 최소–최대(cm)   한쪽 마커가 1 mm 어긋날 때 각도 변화(°)
thigh    30.5 – 32.1          0.18
leg      31.8 – 34.6          0.17
foot     14.6 – 16.8          0.36

한 주기(frame 28–97)의 최댓값/최솟값과 시점(%GC)
관절        원 좌표                       거른 좌표
knee     max  67.8(69.6) min   -4.8(95.7) | max  66.5(71.0) min   -2.9(97.1)
ankle    max   8.3(33.3) min  -24.8(62.3) | max   6.9(37.7) min  -20.4(62.3)
thigh_v  max  26.1(85.5) min  -17.5(50.7) | max  25.7(84.1) min  -16.9(49.3)

106 frame 전체 범위(거른 좌표): knee -2.9 ~ 67.2, ankle -20.4 ~ 6.9
```

읽는 법:

- **(1) 길이가 변한다.** 뼈는 늘었다 줄었다 하지 않는데, 하퇴(ankle–fibula) 길이가 31.8–34.6 cm로 약 3 cm, 발(heel–mt5) 길이가 약 2 cm 출렁입니다. 피부 위 마커가 뼈와 따로 움직이고, 좌표를 읽는 데에도 오차가 있기 때문입니다(BMC `kinematics_angular_2d`도 같은 자료에서 이 점을 짚습니다). 강체여야 할 두 마커 사이의 거리가 변하는지 보는 것은 자료의 질을 점검하는 가장 쉬운 방법입니다.
- **(1) 짧은 분절일수록 각도가 더 흔들린다.** 한쪽 마커가 분절에 수직으로 1 mm 어긋나면 분절각은 대략 1 mm ÷ 분절 길이(rad)만큼 바뀝니다. 발은 대퇴의 절반 길이라 같은 마커 오차에 두 배쯤 흔들립니다(BMC `coordinate_system`, `propagation_uncertainty`의 원리). 발목 곡선이 세 관절 가운데 가장 거친 이유 중 하나입니다.
- **(2) 봉우리가 가장 많이 바뀐다.** 거른 좌표에서는 발목의 최대 족저굴곡이 24.8°에서 20.4°로, 최대 배측굴곡이 8.3°에서 6.9°로 줄고 그 시점도 옮겨 갑니다. 무릎은 1–2°만 바뀝니다. 거른 좌표의 범위(무릎 −2.9–67.2°, 발목 −20.4–6.9°)는 T02 노트에 적은 부록 기준 범위(무릎 약 −3–67°, 발목 약 −20.5–+6.9°)와 1° 안쪽으로 맞습니다. 즉 예시 1의 마커·부호 정의는 맞고, 남은 차이는 대부분 잡음이었다는 뜻입니다.

## 직접 해보기

1. `notebooks/advanced/I/I3_joint_angles.ipynb`에서 예시 1–3을 실행하고, 출력이 위와 같은지 확인합니다. 그림을 `figures/advanced/I/I3_joint_angles.png`로 저장합니다.
2. 그림 위에 Perry의 phase 경계(12, 31, 50, 62, 75, 87% GC)를 세로 점선으로 더하고, 무릎의 두 봉우리와 발목의 네 호가 각각 어느 phase에 있는지 표시합니다.
3. 무릎과 발목 그림을 따로 저장해 **그림 2장**을 만듭니다(`I3_knee.png`, `I3_ankle.png`). 각 그림 제목 아래에 마커 정의와 부호 규약을 한 줄로 적습니다.
4. 예시 1의 비교표를 노트북에 마크다운으로 옮기고, "차이가 나는 이유" 열에 속도, 2D/3D, 마커 정의, 필터 유무 중 무엇이 원인일 수 있는지 적습니다.
5. (도전) heel 마커의 수직 좌표(y)가 가장 낮아지는 시점을 찾아 heel contact 후보를 자동으로 고르고, 부록이 표시한 frame 28, 97과 몇 frame 차이가 나는지 확인합니다. 운동학으로 사건을 찾는 방법은 Day I12에서 본격적으로 다룹니다.
6. (도전) **angle–angle 그림**을 그립니다. 가로축에 thigh 각, 세로축에 무릎각을 놓고 한 주기(frame 28–97)를 선으로 잇습니다. 이 그림에는 시간축이 없으므로 IC·toe-off 점을 표시하고 진행 방향 화살표를 넣어야 읽을 수 있습니다([RM] 1장 p.32). 고리의 어느 부분이 stance이고 어느 부분이 swing인지 적어 보세요. 두 관절의 협응을 이렇게 보는 방법은 [W] 4장 p.76에도 나오고, 정량 분석(coupling angle 등)은 이론 노트 T07의 주제입니다.

> ⚠️ **흔한 오류 1:** `np.arctan(dy/dx)`를 쓰는 실수입니다. 분절이 수직에 가까우면 dx ≈ 0이라 값이 불안정하고, 사분면을 구분하지 못해 180°가 틀립니다. 항상 `np.arctan2(dy, dx)`를 쓰고, 미분하기 전에 `np.unwrap`으로 ±180° 경계의 점프를 없앱니다. 각도는 0–360°로도 −180–+180°로도 표기할 수 있어 경계가 어디냐만 다를 뿐 같은 문제입니다([RM] 1장 p.24). `unwrap`은 "연속한 두 표본 사이에 실제로 반 바퀴 넘게 돌지 않았다"고 가정하므로 표본화가 너무 드물면 실패합니다(BMC `kinematics_angular_2d`). 분절각을 빼는 대신 두 분절의 회전행렬을 곱해 상대 회전을 구하면 이 점프가 처음부터 생기지 않습니다(BMC `transformation_2d`, 3D로 가면 이 방법이 표준, T02 6절).
>
> ⚠️ **흔한 오류 2:** BMC 노트북은 stride를 **toe-off에서 toe-off까지**(frame 1–70)로 자릅니다. 이것을 그대로 0–100%로 놓으면 Perry의 %GC(IC 기준)와 약 60% 어긋납니다. 오늘처럼 heel contact(frame 28 → 97)로 다시 잘라야 phase 비교가 됩니다.

## 퀴즈

**1.** 분절각과 관절각의 차이를 한 문장씩 설명하라.

<details><summary>정답 보기</summary>

분절각은 분절 하나가 전역 기준(예: 앞쪽 수평선)과 이루는 절대각이고, 관절각은 이웃한 두 분절 사이의 상대각(두 분절각의 차)입니다. 대퇴 분절각만으로는 고관절각을 알 수 없습니다. 골반의 기울기가 빠지기 때문입니다.

</details>

**2.** 어떤 논문은 IC의 고관절 굴곡을 20°, 다른 논문은 30°로 보고한다. 둘 다 맞을 수 있는 이유는?

<details><summary>정답 보기</summary>

20°는 수직선 기준 thigh 각, 30°는 골반 기준 hip 각일 수 있습니다. 두 정의의 차이는 평균 약 10°의 골반 전방경사입니다. 어느 기준인지 적혀 있지 않은 수치는 비교할 수 없습니다.

</details>

**3.** 이 레슨의 발목 규약에서 toe-off 무렵 −24.8°는 무엇을 뜻하는가? Winter 교재 본문 식(3.6.2절)으로 계산하면 같은 순간의 값은?

<details><summary>정답 보기</summary>

24.8° 족저굴곡입니다(이 레슨은 배측굴곡 +). 본문 식은 족저굴곡을 +로 두므로 +24.8°가 됩니다. 두 식은 부호만 반대입니다. 덧붙여 예시 3에서 보았듯 이 봉우리의 4° 남짓은 원 좌표의 잡음이라, 좌표를 거르면 약 20°가 됩니다.

</details>

**4.** 정상 보행에서 무릎 굴곡 봉우리는 몇 번이며, 각각의 기능은?

<details><summary>정답 보기</summary>

두 번입니다. LR 끝(약 12% GC)의 작은 봉우리(약 20°)는 착지 충격 흡수, ISw 끝의 큰 봉우리(약 60°)는 swing 중 발끝이 바닥에 끌리지 않게 하는 clearance용입니다.

</details>

**5.** 오늘 계산한 무릎 최대 굴곡(67.8°)이 Perry의 약 60°보다 크다. 이 차이로 "이 사람의 무릎이 비정상"이라고 말할 수 없는 이유 두 가지는?

<details><summary>정답 보기</summary>

(1) 측정 체계가 다릅니다. Perry는 3D 자료를 5° 단위로 반올림한 평균이고, 이 자료는 2D 마커 좌표이며 필터도 거치지 않았습니다(2D 자료는 70° 안팎을 보고하기도 함). (2) 속도가 다릅니다. 이 사람은 cadence가 평균보다 빠르고, 속도는 관절 각도의 크기를 바꿉니다. 게다가 한 사람·한 시행이라 정상 범위와 비교할 근거가 없습니다. 정상인 사이의 흩어짐도 큽니다. Perry 부록에서 무릎 각의 SD는 5–9°(swing에서 큼)라, 평균에서 몇 도 벗어난 한 사람의 값은 정상 범위 안일 수 있습니다.

</details>

> 🖼️ 웹사이트에서는 이 레슨에 도식 두 개("분절각에서 관절각으로: 이 레슨의 규약", "thigh 각과 hip 각")와 시각화 "관절각 탐색기"가 그림으로 들어갑니다. 저장소에서 읽는다면 `site/diagrams/segment-joint-angles.svg`, `site/diagrams/thigh-vs-hip-angle.svg`, `viz/joint-angle-explorer.html`(내려받아 브라우저로 열기)을 여세요.

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3을 실행하고 출력이 레슨과 같다.
- [ ] `figures/advanced/I/I3_joint_angles.png`와 무릎·발목 그림 2장을 저장했다(그림마다 마커 정의와 부호 규약 한 줄).
- [ ] Perry 특징점 비교표와 "차이가 나는 이유" 열을 채웠다.
- [ ] "숫자를 비교하기 전에 확인할 것" 일곱 가지 중 오늘 자료에 해당하는 것을 비교표 아래에 적었다.
- [ ] 데이터 출처(BMC v0.2.0, CC BY 4.0, 원전 Winter Table A.1)를 노트북 첫 셀에 적었다.

## 더 읽을거리
- [Wi] Thomas, Zeni & Winter, 5th ed., Wiley, 2023 — 3.1절(pp.35–36), 3.6절(pp.62–64), 부록 A(pp.295–350; Table A.1·A.4).
- [P] Perry & Burnfield, 2nd ed., 2010 — 4장 Ankle-Foot Complex, 5장 Knee, 6장 Hip, 7장 Head, Trunk, and Pelvis의 앞부분, Appendix A Normative Joint Motion. 측정과 해석은 20장 Motion Analysis(Motion Marker Landmarks, Factors Influencing Accuracy of Marker Data, Reference Scales, Motion Data Interpretation). 아이 자료는 16장 앞부분의 성숙 시기.
- [W] Richards & Levine, eds., 6th ed., 2023 — 1장 Basic Sciences(pp.1–6, 기준면과 운동 이름), 2장 Overview of the Gait Cycle(pp.21–24), 4장 카메라 기반 운동 분석(pp.71–76: 2D와 3D, 연부조직 오차, 마커 세트, angle–angle 그림).
- [RM] Robertson DGE, Caldwell GE, Hamill J, Kamen G, Whittlesey SN. *Research Methods in Biomechanics*, 2nd ed. Human Kinetics, 2014 — 1장 Angular Kinematics(pp.24–32), 2장 Joint Angles(p.50: 투영 각이 3D 각이 아닌 이유).
- [BMC] `kinematics_angular_2d` 노트북: <https://bmclab.github.io/BMC/notebooks_html/kinematics_angular_2d.html> · `transformation_2d` 노트북(회전행렬로 관절각 구하기, 거울상과 부호): <https://bmclab.github.io/BMC/notebooks_html/transformation_2d.html>
- 이론 노트: [T02 — 운동학](../I-gait-theory/note-T02.md), [T08 — 측정 원리와 오차](../I-gait-theory/note-T08.md)

---
[← 이전](day-I2.md) · [코스 지도](../../../README.md) · [다음 →](day-I4.md)
