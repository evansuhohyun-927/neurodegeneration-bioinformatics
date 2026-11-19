# 심화 파트 I — 보행분석: 이론 노트 목록

> **이론 노트** · 심화 파트 I — 보행분석 · 노트 12편 · 노트당 읽는 시간 40–60분 · 실습 레슨: [Day I1부터](../I-gait/day-I1.md)

실습 레슨(Day I1–I21)은 "코드를 돌려 보며 배우는 날"입니다. 개념 설명은 그날 실습에 필요한 만큼만 들어 있습니다. 이 폴더의 이론 노트는 그 반대로 **실습 없이 이론만** 깊게 다룹니다. 교재 여러 권이 같은 현상을 어떻게 다르게 설명하는지, 식이 어디서 나오고 단위·부호가 무엇인지, 흔히 어디서 틀리는지를 한 주제씩 정리했습니다.

- 실습을 하다가 "왜 그런가"가 궁금하면 그 Day 맨 위에 적힌 이론 노트로 오면 됩니다.
- 실습 전에 이론부터 차근차근 읽고 싶다면 아래 "이론만 먼저 읽는 순서"를 따르세요.
- 모든 노트는 같은 틀입니다: 이 노트로 이해할 것 → 영상 → 핵심 질문 → 본문 → **교재마다 다르게 말하는 것** → 흔한 오해 → 자기 점검 → 더 읽을거리.

## 교재 약칭

노트 안에서 교재는 아래 약칭과 장·쪽으로 가리킵니다. 쪽은 인쇄 쪽입니다([P]는 전자책이라 장·절 제목으로 가리킵니다).

| 약칭 | 서지 |
|---|---|
| [P] | Perry J, Burnfield JM. *Gait Analysis: Normal and Pathological Function*. 2nd ed. SLACK; 2010. |
| [W] | Richards J, Levine D, eds. *Whittle's Gait Analysis*. 6th ed. Elsevier; 2023. |
| [W4] | Whittle MW. 같은 책의 4판(2007, 단독 저자). 옛 판과 비교할 때만 씁니다. |
| [Wi] | Thomas SJ, Zeni JA, Winter DA. *Winter's Biomechanics and Motor Control of Human Movement*. 5th ed. Wiley; 2023. |
| [RM] | Robertson DGE, Caldwell GE, Hamill J, Kamen G, Whittlesey SN. *Research Methods in Biomechanics*. 2nd ed. Human Kinetics; 2014. |
| [R] | Rosen J, Ferguson PW, eds. *Wearable Robotics: Systems and Applications*. Academic Press; 2020. |
| [BMC] | Duarte M, Watanabe RN. *Notes on Scientific Computing for Biomechanics and Motor Control* (CC BY 4.0). <https://bmclab.github.io/BMC/> |

## 노트 목록과 실습 Day 대응

| 노트 | 제목 | 주로 받치는 실습 | 함께 쓰이는 실습 |
|---|---|---|---|
| [T01](note-T01.md) | 보행 주기와 기능 과제: phase 체계, rocker, 전진의 동력 | [I1](../I-gait/day-I1.md), [I2](../I-gait/day-I2.md) | I12, I13, I20 |
| [T02](note-T02.md) | 운동학: 좌표계·부호 규약, 분절각·관절각, 2D에서 3D로 | [I3](../I-gait/day-I3.md) | I9, I11, I16 |
| [T03](note-T03.md) | 운동역학과 역동역학: link-segment, 모멘트, joint power와 그 한계 | [I4](../I-gait/day-I4.md) | I6, I12, I20 |
| [T04](note-T04.md) | 근육과 EMG: 근육 역학, EMG 기록·처리, EMG–힘 관계의 한계 | [I5](../I-gait/day-I5.md) | I10, I16, I20 |
| [T05](note-T05.md) | 에너지와 동역학적 보행: 역진자, step-to-step transition, O2 cost | [I6](../I-gait/day-I6.md) | I15, I16, I20 |
| [T06](note-T06.md) | 보행의 신경 조절: 척수에서 피질까지, automaticity, 파킨슨병 | [I7](../I-gait/day-I7.md) | I16, I17 |
| [T07](note-T07.md) | 균형·자세 제어와 협응: COM–COP, 보행 시작·정지, synergy, 변동성 | [I13](../I-gait/day-I13.md) | I6, I7, I20 |
| [T08](note-T08.md) | 측정 원리와 오차: motion capture, force plate, 신발 센서, IMU, 신뢰도 | [I8](../I-gait/day-I8.md), [I9](../I-gait/day-I9.md), [I14](../I-gait/day-I14.md) | I12 |
| [T09](note-T09.md) | 신호처리의 이론: 표본화, 필터, 미분과 잡음, 정규화, 파형 분석 | [I10](../I-gait/day-I10.md), [I11](../I-gait/day-I11.md) | I12, I18 |
| [T10](note-T10.md) | 병적 보행의 원리와 임상 지표 | [I15](../I-gait/day-I15.md), [I16](../I-gait/day-I16.md) | I13 |
| [T11](note-T11.md) | 보행동결(FOG) | [I17](../I-gait/day-I17.md), [I18](../I-gait/day-I18.md) | I19 |
| [T12](note-T12.md) | 보조기·의지·웨어러블 로봇 | [I20](../I-gait/day-I20.md) | I21 |

실습 레슨 전체 목록은 [Day I1](../I-gait/day-I1.md)에서 시작해 각 레슨 맨 아래의 "다음 →"으로 이어집니다. 주차 구성은 1주차 정상 보행의 이론(I1–I7), 2주차 측정과 신호처리(I8–I14), 3주차 병적 보행·FOG·웨어러블 로봇(I15–I21)입니다.

## 이론만 먼저 읽는 순서

노트 번호는 대체로 실습 순서를 따르지만, 이론만 읽을 때는 아래 순서가 덜 막힙니다.

1. **언어부터: T01.** phase 이름, 기능 과제, rocker를 모르면 다른 노트의 모든 문장이 막힙니다.
2. **움직임을 숫자로: T02 → T09의 앞부분(표본화·미분과 잡음).** 각도를 어떻게 정의하고, 미분하면 왜 잡음이 커지는지 알아야 T03의 가속도·모멘트를 믿을지 판단할 수 있습니다.
3. **힘과 에너지: T03 → T05.** 모멘트와 파워(T03)를 알고 나면 에너지 교환과 대사 비용(T05)이 자연스럽게 이어집니다.
4. **누가 힘을 내는가: T04.** T03의 "알짜 모멘트"가 근육 하나의 힘이 아니라는 결론을 근육 역학과 EMG 쪽에서 다시 확인합니다.
5. **누가 명령하는가: T06 → T07.** 신경 조절의 계층(T06)을 본 뒤 균형·협응(T07)으로 갑니다.
6. **측정의 현실: T08 → T09 전체.** 실험실과 웨어러블 센서가 무엇을 얼마나 정확히 재는지.
7. **병과 중재: T10 → T11 → T12.** 정상 보행의 원리가 무너지는 방식, 파킨슨병의 보행동결, 그리고 보조기·로봇이 그 틈을 어떻게 메우려 하는지.

시간이 없다면 T01, T03, T05, T06, T10, T11을 먼저 읽으세요. 이 여섯 편이 "정상 보행은 어떻게 돌아가고, 파킨슨병에서는 어디가 깨지는가"의 뼈대입니다.

## 읽을 때 지킬 것

- **부호와 축은 매번 확인합니다.** 같은 "굴곡 모멘트"가 교재에 따라 내부 모멘트일 수도, 외부 모멘트일 수도 있습니다. 각 노트의 "교재마다 다르게 말하는 것" 표를 먼저 훑어도 좋습니다.
- **정상값은 조건이 붙은 숫자입니다.** 보행 속도, 나이, 측정 방법이 바뀌면 값이 바뀝니다. 노트의 수치에는 출처(교재 장·쪽)를 달았습니다.
- **이론 노트는 진단이나 치료 지침이 아닙니다.** 임상 연구의 결과는 연구 설계와 대상의 범위 안에서만 읽습니다.

---
[코스 지도](../../../README.md) · [T01 →](note-T01.md)
