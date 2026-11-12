# 퇴행성 뇌질환 바이오인포매틱스 — 7주 학습 프로그램

코딩이 처음인 생물학 전공자를 위한 과정입니다. 하루 한 레슨(75–90분), 총 49일.
각 레슨은 **🎬 영상 → 개념 설명(줄글) → 예시 → 직접 해보기 → 퀴즈 → 산출물 체크** 순서로 되어 있습니다.

- 원본 실라부스: 6주 42일 과정 (NASA OSDR OSD-536 + PhysioNet PD 데이터)
- 추가된 것: **0주차 — 코딩 기초** 7일 (터미널, Python, pandas, Git)
- 선택: **보충 단원** 7일 (서열 데이터베이스, 정렬, 치환 행렬, BLAST, 계통수)

> **급한가요?** 7주를 따라갈 시간이 없으면 [Crash Course](crash-course/README.md)로 가세요. 생리 신호, genomics, transcriptomics, proteomics, 그 밖의 omics, 통계 응급 키트를 분야별 30–45분 가이드로 정리했습니다.

## 사용법

1. 아래 지도에서 오늘 레슨을 연다. 영상부터 본다.
2. 줄글과 예시를 읽으며 코드를 **직접 타이핑**해 본다 (복사·붙여넣기보다 훨씬 잘 남는다).
3. 퀴즈는 정답을 펼치기 전에 먼저 답을 적는다. 5문항 중 4개 이상 맞으면 통과, 아니면 개념 설명을 다시 읽는다.
4. 끝나면 이 파일의 체크박스를 `[x]`로 바꾸고 `learning-log.md`에 한 줄 남긴다.

막히면 레슨 맨 아래 원본 실라부스의 "공통 지시문"을 AI 도구에 붙여 넣고 Day 번호와 함께 질문하세요.

## 코스 지도

### 0주차 — 코딩 기초 (추가 단원)

- [ ] [Day F1 — 터미널 첫걸음과 환경 설치](lessons/week-0/day-F1.md)
- [ ] [Day F2 — 변수와 자료형](lessons/week-0/day-F2.md)
- [ ] [Day F3 — 리스트와 딕셔너리](lessons/week-0/day-F3.md)
- [ ] [Day F4 — 조건문과 반복문](lessons/week-0/day-F4.md)
- [ ] [Day F5 — 함수와 라이브러리](lessons/week-0/day-F5.md)
- [ ] [Day F6 — 파일 읽기와 pandas 첫걸음](lessons/week-0/day-F6.md)
- [ ] [Day F7 — 오류 메시지 읽기와 Git 첫걸음](lessons/week-0/day-F7.md)

### 1주차 — 질환 맥락, 도구, 데이터 문해력

- [ ] [Day 1 — 과정의 범위와 프로젝트 폴더](lessons/week-1/day-01.md)
- [ ] [Day 2 — 퇴행성 뇌질환의 공통·차이 기전](lessons/week-1/day-02.md)
- [ ] [Day 3 — Python으로 작은 유전자/임상 표 다루기](lessons/week-1/day-03.md)
- [ ] [Day 4 — tidy data와 메타데이터, pandas QC](lessons/week-1/day-04.md)
- [ ] [Day 5 — 시각화 원칙](lessons/week-1/day-05.md)
- [ ] [Day 6 — 생물학·생체신호 파일 형식](lessons/week-1/day-06.md)
- [ ] [Day 7 — 분석 질문 고정하기](lessons/week-1/day-07.md)

### 2주차 — 통계적 사고와 OSDR 메타데이터

- [ ] [Day 8 — 분포와 요약통계](lessons/week-2/day-08.md)
- [ ] [Day 9 — 효과크기, 신뢰구간, p-value](lessons/week-2/day-09.md)
- [ ] [Day 10 — FDR과 다중검정](lessons/week-2/day-10.md)
- [ ] [Day 11 — 반복, 배치, 교란, 대조군](lessons/week-2/day-11.md)
- [ ] [Day 12 — OSD-536 연구 설계 읽기](lessons/week-2/day-12.md)
- [ ] [Day 13 — 분자 데이터 전처리와 QC](lessons/week-2/day-13.md)
- [ ] [Day 14 — PCA와 heatmap](lessons/week-2/day-14.md)

### 3주차 — OSDR 뇌 신경염증 프로젝트

- [ ] [Day 15 — 데이터 수집과 provenance](lessons/week-3/day-15.md)
- [ ] [Day 16 — 샘플과 유전자 행렬 연결](lessons/week-3/day-16.md)
- [ ] [Day 17 — 탐색적 분석](lessons/week-3/day-17.md)
- [ ] [Day 18 — 차등발현 결과 읽기](lessons/week-3/day-18.md)
- [ ] [Day 19 — 후보 유전자 개별 검토](lessons/week-3/day-19.md)
- [ ] [Day 20 — pathway 수준 해석](lessons/week-3/day-20.md)
- [ ] [Day 21 — 분자 프로젝트 보고서](lessons/week-3/day-21.md)

### 4주차 — 파킨슨병 운동 데이터와 시계열 기초

- [ ] [Day 22 — PD의 운동 표현형](lessons/week-4/day-22.md)
- [ ] [Day 23 — 시계열 기초](lessons/week-4/day-23.md)
- [ ] [Day 24 — PhysioNet 데이터 접근과 구조](lessons/week-4/day-24.md)
- [ ] [Day 25 — participant-level QC](lessons/week-4/day-25.md)
- [ ] [Day 26 — 기본 feature 추출](lessons/week-4/day-26.md)
- [ ] [Day 27 — 개별·군 수준 시각화](lessons/week-4/day-27.md)
- [ ] [Day 28 — 분석 계획 확정](lessons/week-4/day-28.md)

### 5주차 — 파킨슨병 표현형 분석

- [ ] [Day 29 — 가설검정과 모델 선택](lessons/week-5/day-29.md)
- [ ] [Day 30 — 단변량 비교](lessons/week-5/day-30.md)
- [ ] [Day 31 — 교란변수](lessons/week-5/day-31.md)
- [ ] [Day 32 — baseline 모델](lessons/week-5/day-32.md)
- [ ] [Day 33 — 참가자 단위 검증과 데이터 누수](lessons/week-5/day-33.md)
- [ ] [Day 34 — 평가 지표 해석](lessons/week-5/day-34.md)
- [ ] [Day 35 — PD 프로젝트 보고서](lessons/week-5/day-35.md)

### 6주차 — 통합 해석, 재현성, 발표

- [ ] [Day 36 — 두 데이터의 비교 가능 범위](lessons/week-6/day-36.md)
- [ ] [Day 37 — 공통 기전 가설](lessons/week-6/day-37.md)
- [ ] [Day 38 — 재현성 강화](lessons/week-6/day-38.md)
- [ ] [Day 39 — 민감도 분석](lessons/week-6/day-39.md)
- [ ] [Day 40 — 과학적 글쓰기와 윤리](lessons/week-6/day-40.md)
- [ ] [Day 41 — 최종 보고서 편집](lessons/week-6/day-41.md)
- [ ] [Day 42 — 발표 제작과 리허설](lessons/week-6/day-42.md)

### 보충 단원 — 고전 생명정보학 (서열·정렬·진화)

본 과정과 독립된 선택 단원이다. 0주차를 마쳤으면 언제든 시작할 수 있다.

- [ ] [Day S1 — 서열 데이터베이스와 레코드 읽기](lessons/supplement/day-S1.md)
- [ ] [Day S2 — 돌연변이, 보존, 상동성](lessons/supplement/day-S2.md)
- [ ] [Day S3 — 치환 행렬: PAM과 BLOSUM](lessons/supplement/day-S3.md)
- [ ] [Day S4 — 쌍 정렬과 동적 프로그래밍](lessons/supplement/day-S4.md)
- [ ] [Day S5 — BLAST와 E-value](lessons/supplement/day-S5.md)
- [ ] [Day S6 — 다중 서열 정렬과 프로파일](lessons/supplement/day-S6.md)
- [ ] [Day S7 — 분자진화와 계통수](lessons/supplement/day-S7.md)

본 과정을 하다가 아래 레슨에서 더 깊이 알고 싶으면 해당 보충 레슨으로 넘어간다.

| 본 과정 레슨 | 이어지는 보충 레슨 | 연결점 |
|---|---|---|
| Day 6 파일 형식, Day 15 provenance, Day 18 유전자 ID | S1 | FASTA, accession과 version |
| Day 2 질환 기전, Day 36–37 마우스–사람 비교 | S2 | 변이 분류, ortholog/paralog |
| Day F5 log2 fold change | S3, S6 | log-odds, pseudocount |
| Day 23 이동 창 | S4 | sliding window, dot plot |
| Day 9–10 p-value와 다중검정 | S5 | E-value도 같은 다중 비교 문제 |
| Day 19 후보 유전자 검토 | S2, S5, S6 | 보존 구간, 상동 서열 찾기 |
| Day 30 bootstrap 신뢰구간 | S7 | bootstrap 지지도 |

## 저작권과 출처

- 레슨의 글·예시·퀴즈·코드는 이 과정을 위해 새로 쓴 것이다. 글은 CC BY 4.0, 코드는 MIT ([LICENSE.md](LICENSE.md)).
- 영상은 **링크로만** 소개한다. 영상·자막·썸네일·슬라이드는 각 제작자의 저작물이며 이 저장소에 복제하지 않는다.
- 데이터셋 원본은 저장소에 넣지 않는다. 내려받는 방법과 버전·인용은 `data/README.md`에 기록한다.
- 그림은 직접 만든 코드로 생성한 것만 쓴다. 논문·교과서 그림은 옮기지 않고 출처를 링크한다.
- 링크가 깨졌거나 저작권 문제가 보이면 issue로 알려 달라.

## 해석 원칙 (과정 내내 유지)

- OSDR은 마우스 뇌 분자 데이터, PhysioNet은 인간 운동 데이터다. 직접 합치거나 인과로 연결하지 않는다.
- 작은 표본의 결과는 가설 생성으로 읽는다.
- 반복 측정·시계열은 참가자 단위로 train/test를 나눈다.
- 결과를 진단이나 치료 권고로 표현하지 않는다.
