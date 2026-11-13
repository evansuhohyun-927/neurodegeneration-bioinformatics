# 퇴행성 뇌질환 바이오인포매틱스 — 7주 학습 프로그램

학습 위한 웹사이트는 https://neurodegeneration-bioinformatics.vercel.app를 통해 들어가시면 되며 evansuhohyun@yonsei.ac.kr에 비밀번호 문의주시면 공유드리겠습니다.

코딩이 처음인 생물학 전공자를 위한 과정입니다. 하루 한 레슨(75–90분)입니다.
각 레슨은 **🎬 영상 → 개념 설명(줄글) → 예시 → 직접 해보기 → 퀴즈 → 산출물 체크** 순서로 되어 있습니다.

| 구성 | 기간 | 필수 여부 | 내용 |
|---|---|---|---|
| 0주차 — 코딩 기초 | 7일 | 코딩이 처음이면 필수 | 터미널, Python, pandas, Git |
| 1–6주차 — 본 과정 | 42일 | 필수 | NASA OSDR OSD-536(마우스 뇌 nCounter 패널) + PhysioNet PD 운동 데이터 |
| 보충 단원 | 7일 | 선택 | 서열 데이터베이스, 정렬, 치환 행렬, BLAST, 계통수 |
| 심화 파트 A–H | 파트당 7일 | 선택 | R, MATLAB, 신경신호, fMRI, EHR, AI·생성형 AI, 임상 예측·조기진단 ML |

필수 과정은 7주(49일)이고, 한 주에 약 9–11시간(레슨 7개)이 듭니다. 복습과 보고서 작성 주간(3·5·6주차)은 더 걸릴 수 있습니다.

**이 과정이 다루는 범위:** 데이터 분석 기초, 타깃 패널 발현 데이터의 탐색 분석, 웨어러블·보행 신호 분석, 재현 가능한 보고입니다. RNA-seq의 FASTQ → 정렬 → 정량 파이프라인, 변이 호출, single-cell 분석은 직접 수행하지 않습니다. 그쪽은 과정을 마친 뒤 Crash Course의 [Transcriptomics](crash-course/transcriptomics.md), [Genomics](crash-course/genomics.md) 가이드에서 출발하세요.

> **급한가요?** 7주를 따라갈 시간이 없으면 [Crash Course](crash-course/README.md)로 가세요. 생리 신호, genomics, transcriptomics, proteomics, 그 밖의 omics, 통계 응급 키트를 분야별 30–45분 가이드로 정리했습니다.

## 시작하기

1. **환경 만들기.** conda가 없으면 [Day F1](lessons/week-0/day-F1.md)을 따라 설치한다. 이미 있으면 이 폴더에서 아래를 실행한다.

   ```bash
   conda env create -f environment.yml
   ```

   ```bash
   conda activate neurobio
   ```

2. **폴더는 레슨에서 만든다.** `notebooks/`, `figures/`, `reports/`, `data/osdr_536/`, `data/physionet_pd/`는 저장소에 들어 있지 않다. [Day 1](lessons/week-1/day-01.md)에서 직접 만든다. 노트북도 레슨을 따라가며 직접 작성한다.
3. **데이터는 각자 내려받는다.** 원본 데이터는 저장소에 없다. Day 15(OSDR)와 Day 24(PhysioNet)에서 내려받고, 출처·버전·라이선스·체크섬을 [data/README.md](data/README.md) 양식에 기록한다. 실제 데이터가 없어도 모든 레슨의 예시는 코드 안에서 만드는 가상 데이터로 돌아간다.
4. **노트북은 위에서 아래로 실행한다.** 같은 노트북에 여러 날의 코드를 이어 쓰는 주차가 있다(예: 3주차의 `02_osdr_qc_and_pca.ipynb`). 다음 날 시작할 때 Run All로 전날까지의 셀을 먼저 실행한다.
5. **레슨 속 출력은 예시다.** 가상 데이터와 고정된 seed로 얻은 값이다. 실제 데이터로 바꾸면 숫자가 달라지는 것이 정상이다. 무엇을 어떤 환경에서 실제로 실행해 확인했는지는 [VALIDATION.md](VALIDATION.md)에 있다.

## 사용법

1. 아래 지도에서 오늘 레슨을 연다. 영상부터 본다. 영상은 이해를 돕는 보조 자료(영어, 자막 사용 가능)이고, 링크가 깨졌거나 보기 어려우면 건너뛰어도 줄글과 예시만으로 진행할 수 있다.
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

## 심화 파트 — 7주 과정 이후 (선택)

정규과정을 마친 뒤 관심 분야에 맞게 골라 듣는다. 파트마다 하루 한 레슨이고, 순서는 자유다. 파트마다 급할 때 보는 [Crash Course](crash-course/README.md) 가이드가 하나씩 있다.

| 파트 | 언어 | 언제 필요한가 | 급할 때 |
|---|---|---|---|
| [A — R과 Bioconductor](lessons/advanced/A-r-bioconductor/day-A1.md) | R | Python 다음으로 생명정보학에서 가장 많이 쓰는 언어. Bioconductor 패키지를 쓰려면 필요하다. | [가이드](crash-course/r-bioconductor.md) |
| [B — MATLAB/Octave 과학 계산](lessons/advanced/B-matlab/day-B1.md) | MATLAB(또는 무료 Octave) | 신경과학 실험실의 기존 코드를 읽고 고칠 때 필요하다. | [가이드](crash-course/matlab-octave.md) |
| [C — 신경신호·시간-주파수 분석](lessons/advanced/C-neural-signals/day-C1.md) | Python | 4주차 웨어러블 신호의 다음 단계. EEG, LFP, spike 데이터. | [가이드](crash-course/neural-time-frequency.md) |
| [D — fMRI 데이터 분석](lessons/advanced/D-fmri/day-D1.md) | Python | 뇌 영상 연구를 읽고 분석할 때. | [가이드](crash-course/fmri.md) |
| [E — EHR(전자건강기록) 2차 분석](lessons/advanced/E-ehr/day-E1.md) | Python | 병원 기록으로 임상 질문에 답할 때. 교란과 편향이 핵심. | [가이드](crash-course/ehr.md) |
| [G — AI·생성형 AI in 바이오메디컬](lessons/advanced/G-ai-biomed/day-G1.md) | Python | 5주차 모델링의 다음 단계. 생성 모델, 신약 ML, 단백질 구조, LLM 검증. | [가이드](crash-course/ai-biomed.md) |
| [H — 임상 예측·조기진단 ML](lessons/advanced/H-clinical-prediction/day-H1.md) | Python | 진단·예후·조기진단 모델을 어떻게 평가·보고하는가. 보정, 임계값, 결정 곡선, 생존 예측, 외부 검증. | [가이드](crash-course/clinical-prediction.md) |

### 심화 A — R과 Bioconductor

- [ ] [Day A1 — Python에서 R로: 설치, RStudio, 첫 문법](lessons/advanced/A-r-bioconductor/day-A1.md)
- [ ] [Day A2 — 벡터, 자료형, 부분 선택: R의 기본 단위 다루기](lessons/advanced/A-r-bioconductor/day-A2.md)
- [ ] [Day A3 — factor, list, matrix, data.frame: 실험 정보를 담는 그릇](lessons/advanced/A-r-bioconductor/day-A3.md)
- [ ] [Day A4 — 함수, 제어문, apply 계열, 오류 다루기](lessons/advanced/A-r-bioconductor/day-A4.md)
- [ ] [Day A5 — 표 다루기와 그림: base R, dplyr, ggplot2](lessons/advanced/A-r-bioconductor/day-A5.md)
- [ ] [Day A6 — S3·S4 객체와 Bioconductor의 자료 구조](lessons/advanced/A-r-bioconductor/day-A6.md)
- [ ] [Day A7 — Bioconductor 분석 맛보기와 재현성: 선형 모델, limma·DESeq2의 발상, sessionInfo, renv](lessons/advanced/A-r-bioconductor/day-A7.md)

### 심화 B — MATLAB/Octave 과학 계산

- [ ] [Day B1 — MATLAB과 Octave 시작하기: 설치, 명령 창, 첫 스크립트](lessons/advanced/B-matlab/day-B1.md)
- [ ] [Day B2 — 행렬로 생각하기: 만들기, 인덱싱, 원소별 연산과 행렬 연산](lessons/advanced/B-matlab/day-B2.md)
- [ ] [Day B3 — 자료형: 숫자와 정밀도, 문자열, cell, struct, table](lessons/advanced/B-matlab/day-B3.md)
- [ ] [Day B4 — 제어문과 함수: 스크립트에서 재사용할 수 있는 도구로](lessons/advanced/B-matlab/day-B4.md)
- [ ] [Day B5 — 데이터 입출력과 시각화: 파일을 읽고, 쓰고, 그림으로 남기기](lessons/advanced/B-matlab/day-B5.md)
- [ ] [Day B6 — 좋은 코드 습관, 디버깅, 테스트, 속도](lessons/advanced/B-matlab/day-B6.md)
- [ ] [Day B7 — 수치 계산·최적화·시뮬레이션, 그리고 GUI와 실험 제어의 개념](lessons/advanced/B-matlab/day-B7.md)

### 심화 C — 신경신호·시간-주파수 분석

- [ ] [Day C1 — 신경 데이터의 네 얼굴: spike, LFP, EEG/MEG, 칼슘 이미징](lessons/advanced/C-neural-signals/day-C1.md)
- [ ] [Day C2 — convolution과 필터 설계: 커널을 밀어 보면 필터가 보인다](lessons/advanced/C-neural-signals/day-C2.md)
- [ ] [Day C3 — Fourier 변환과 power spectrum: 해상도, 테이퍼, Welch, 다중 테이퍼](lessons/advanced/C-neural-signals/day-C3.md)
- [ ] [Day C4 — 시간-주파수 분석: Morlet wavelet, STFT, 기저선 정규화](lessons/advanced/C-neural-signals/day-C4.md)
- [ ] [Day C5 — 위상과 연결성: Hilbert, ITPC, PLV, 위상-진폭 결합](lessons/advanced/C-neural-signals/day-C5.md)
- [ ] [Day C6 — spike train 분석: raster, PSTH, 발화율, ISI, tuning curve](lessons/advanced/C-neural-signals/day-C6.md)
- [ ] [Day C7 — 차원 축소, 분류, 통계: spike sorting, 순열 검정, 군집 기반 보정](lessons/advanced/C-neural-signals/day-C7.md)

### 심화 D — fMRI 데이터 분석

- [ ] [Day D1 — BOLD 신호와 fMRI 데이터의 생김새: 4D 배열, voxel, NIfTI, BIDS](lessons/advanced/D-fmri/day-D1.md)
- [ ] [Day D2 — 전처리와 QC: slice timing, 움직임, 왜곡, smoothing](lessons/advanced/D-fmri/day-D2.md)
- [ ] [Day D3 — 공간 정규화, 템플릿, 아틀라스: 서로 다른 뇌를 한 좌표에 놓기](lessons/advanced/D-fmri/day-D3.md)
- [ ] [Day D4 — 한 사람의 GLM: HRF convolution, 설계 행렬, contrast, 잡음과 자기상관](lessons/advanced/D-fmri/day-D4.md)
- [ ] [Day D5 — 집단 분석과 다중비교: 혼합효과, FWE, cluster, FDR, 순열, 검정력](lessons/advanced/D-fmri/day-D5.md)
- [ ] [Day D6 — 연결성: seed 상관, PPI, ICA, 유효 연결성, 휴지기 네트워크](lessons/advanced/D-fmri/day-D6.md)
- [ ] [Day D7 — 패턴 분석과 ROI: decoding, 교차검증 누수, circularity, % 신호 변화](lessons/advanced/D-fmri/day-D7.md)

### 심화 E — EHR(전자건강기록) 2차 분석

- [ ] [Day E1 — EHR 데이터는 누가, 왜 남긴 기록인가: 임상 질문을 연구 질문으로](lessons/advanced/E-ehr/day-E1.md)
- [ ] [Day E2 — 표 구조, 접근, 윤리, 비식별화: MIMIC 계열 데이터 읽는 법](lessons/advanced/E-ehr/day-E2.md)
- [ ] [Day E3 — 코호트 정의: 포함·제외, index time, 그리고 불멸 시간 편향](lessons/advanced/E-ehr/day-E3.md)
- [ ] [Day E4 — 데이터 정제: 단위, 이상치, 결측, 시간 정렬](lessons/advanced/E-ehr/day-E4.md)
- [ ] [Day E5 — 탐색 분석과 교란 통제: 회귀 보정, 성향점수, 민감도 분석](lessons/advanced/E-ehr/day-E5.md)
- [ ] [Day E6 — 예측 모델과 검증: 판별, 보정, 시간적 외부 검증, 누수](lessons/advanced/E-ehr/day-E6.md)
- [ ] [Day E7 — 재현성과 보고: 코드 공개, 흐름도, STROBE·RECORD·TRIPOD](lessons/advanced/E-ehr/day-E7.md)

### 심화 G — AI·생성형 AI in 바이오메디컬

- [ ] [Day G1 — 바이오메디컬 AI 지도: 무엇을 배우고, 무엇을 만드는가](lessons/advanced/G-ai-biomed/day-G1.md)
- [ ] [Day G2 — 생성 모델의 원리: 분포를 배우고 새 점을 뽑기](lessons/advanced/G-ai-biomed/day-G2.md)
- [ ] [Day G3 — 영상·신호·EHR의 생성형 AI: 증강, 합성 데이터, 프라이버시](lessons/advanced/G-ai-biomed/day-G3.md)
- [ ] [Day G4 — 분자 표현과 활성 예측: SMILES, 지문, QSAR, 분자 생성](lessons/advanced/G-ai-biomed/day-G4.md)
- [ ] [Day G5 — 단백질: 구조 예측과 단백질 언어 모델](lessons/advanced/G-ai-biomed/day-G5.md)
- [ ] [Day G6 — LLM 활용: 임상 텍스트, 문헌 요약, 코드 보조, 그리고 검증](lessons/advanced/G-ai-biomed/day-G6.md)
- [ ] [Day G7 — 평가·편향·설명·규제, 그리고 정직한 미니 프로젝트](lessons/advanced/G-ai-biomed/day-G7.md)

### 심화 H — 임상 예측·조기진단 ML

- [ ] [Day H1 — 진단, 예후, 조기진단: 문제를 먼저 정의하기](lessons/advanced/H-clinical-prediction/day-H1.md)
- [ ] [Day H2 — 표본 수와 분할: 몇 명이면 충분하고, 어떻게 나누는가](lessons/advanced/H-clinical-prediction/day-H2.md)
- [ ] [Day H3 — 판별력, 보정, 임계값: 숫자 셋을 함께 읽기](lessons/advanced/H-clinical-prediction/day-H3.md)
- [ ] [Day H4 — 임상적 유용성: 결정 곡선과 순 이득](lessons/advanced/H-clinical-prediction/day-H4.md)
- [ ] [Day H5 — 종단·생존 예측: 언제 발병하는가](lessons/advanced/H-clinical-prediction/day-H5.md)
- [ ] [Day H6 — 외부 검증과 데이터셋 이동: 다른 기관에 가면 무엇이 무너지나](lessons/advanced/H-clinical-prediction/day-H6.md)
- [ ] [Day H7 — 보고와 규제, 그리고 정직한 조기 선별 baseline 미니 프로젝트](lessons/advanced/H-clinical-prediction/day-H7.md)

## 저작권과 출처

- 레슨의 글·예시·퀴즈·코드는 이 과정을 위해 새로 쓴 것이다. 글은 CC BY 4.0, 코드는 MIT ([LICENSE.md](LICENSE.md)).
- 심화 파트는 여러 교재를 읽고 주제와 깊이를 정했지만, 설명·예시·코드·퀴즈는 모두 새로 썼다. 교재는 각 레슨의 "더 읽을거리"에 서지와 출판사 공식 페이지로만 소개한다.
- 영상은 **링크로만** 소개한다. 영상·자막·썸네일·슬라이드는 각 제작자의 저작물이며 이 저장소에 복제하지 않는다.
- 데이터셋 원본은 저장소에 넣지 않는다. 내려받는 방법과 버전·인용은 `data/README.md`에 기록한다.
- 그림은 직접 만든 코드로 생성한 것만 쓴다. 논문·교과서 그림은 옮기지 않고 출처를 링크한다.
- 링크가 깨졌거나 저작권 문제가 보이면 issue로 알려 달라.

## 해석 원칙 (과정 내내 유지)

- OSDR은 마우스 뇌 분자 데이터, PhysioNet은 인간 운동 데이터다. 직접 합치거나 인과로 연결하지 않는다.
- 작은 표본의 결과는 가설 생성으로 읽는다.
- 반복 측정·시계열은 참가자 단위로 train/test를 나눈다.
- 결과를 진단이나 치료 권고로 표현하지 않는다.
