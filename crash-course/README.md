# Crash Course — 급할 때 보는 압축 가이드

본 과정(하루 한 레슨, 7주)을 따라갈 시간이 없을 때 쓰는 참조 문서 모음이다.
가이드 하나는 30–45분이면 읽는다. 각 가이드는 같은 순서로 되어 있다(언어 가이드는 "측정 기술 고르기" 대신 "도구 고르기"):
**한눈에 보기 → 영상 → 핵심 개념 10개 → 측정 기술 고르기 → 표준 분석 흐름 → 최소 실행 예시 → 흔한 함정 → 연구 설계 체크리스트 → 공개 데이터 → 본 과정과의 연결.**

## 어떤 가이드부터 볼까

| 지금 내 상황 | 볼 가이드 |
|---|---|
| ECG, EEG, EMG, 가속도계, 보행 같은 **연속 신호**를 분석해야 한다 | [생리 신호 분석](physiology-signals.md) |
| **DNA 변이**(SNP, WES/WGS, GWAS)를 다룬다 | [Genomics](genomics.md) |
| **RNA 발현**(RNA-seq, 패널, single-cell)을 다룬다 | [Transcriptomics](transcriptomics.md) |
| **질량분석 단백질** 데이터나 단백질 패널을 다룬다 | [Proteomics](proteomics.md) |
| 메틸화, ChIP/ATAC-seq, 대사체, 마이크로바이옴, 또는 **여러 omics를 함께** 본다 | [그 밖의 omics와 multi-omics 통합](other-omics.md) |
| R 코드를 읽거나 **Bioconductor** 패키지를 써야 한다 | [R과 Bioconductor 빠른 시작](r-bioconductor.md) |
| 실험실의 **MATLAB** 코드를 넘겨받았다 | [MATLAB/Octave 빠른 시작](matlab-octave.md) |
| **EEG, LFP, spike** 데이터의 스펙트럼·시간-주파수·위상을 봐야 한다 | [신경신호 시간-주파수 분석](neural-time-frequency.md) |
| **fMRI** 데이터를 분석하거나 논문을 읽어야 한다 | [fMRI 데이터 분석](fmri.md) |
| **병원 기록(EHR)**, MIMIC 같은 데이터로 연구한다 | [EHR 2차 분석](ehr.md) |
| **머신러닝·생성형 AI·LLM**을 연구에 쓰거나 평가해야 한다 | [바이오메디컬 AI와 생성형 AI](ai-biomed.md) |
| 분야와 상관없이 **군 비교, 표본 수, p-value, 다중검정**이 급하다 | [연구 설계와 통계 응급 키트](study-design-stats.md) |

어느 분야든 [연구 설계와 통계 응급 키트](study-design-stats.md)는 함께 읽는 것을 권한다. 분석이 잘못되는 이유의 대부분은 도구가 아니라 설계에 있다.

더 깊이 배우려면 각 가이드 끝의 "본 과정과의 연결"에서 [심화 파트](../README.md#심화-파트--7주-과정-이후-선택) 레슨으로 넘어간다.

## 시간이 정말 없을 때

- **30분:** 해당 분야 가이드의 "한눈에 보기", "표준 분석 흐름", "흔한 함정"만 읽는다.
- **반나절:** 가이드 전체 + 영상 1개 + "최소 실행 예시"를 직접 돌려 본다.
- **코딩이 처음인데 사흘이 있다:** [Day F1](../lessons/week-0/day-F1.md)(환경 설치) → [Day F6](../lessons/week-0/day-F6.md)(pandas) → [Day F7](../lessons/week-0/day-F7.md)(오류 읽기) 뒤에 해당 분야 가이드로 온다.

## 이 가이드가 하지 않는 것

- 개념을 처음부터 차근차근 설명하지 않는다. 그건 [본 과정](../README.md)의 몫이다.
- 기준값(QC 문턱 등)은 흔히 쓰는 출발점일 뿐이다. 자기 데이터와 해당 도구의 공식 문서로 확인한다.
- 진단이나 치료에 대한 판단 근거가 아니다.

---
[코스 지도](../README.md)
