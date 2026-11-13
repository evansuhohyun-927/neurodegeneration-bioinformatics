# 실행 검증 기록

이 파일에는 **실제로 실행해 확인한 것만** 적는다. 확인하지 않은 것은 확인하지 않았다고 적는다.
레슨 본문의 출력 블록은 작성 당시 실행한 결과이며, 아래 표시가 없는 레슨은 이 파일 기준으로 "작성자 보고만 있음"이다.

마지막 갱신: 2026-11-13

## 1. 깨끗한 환경에서 전 과정을 순서대로 실행 — **아직 하지 않음**

새 conda 환경에서 0–6주차, 보충 단원, 심화 파트의 모든 코드 블록을 순서대로 실행한 기록은 없다.
아래 2–3절은 부분 검증이다.

## 2. 과정 환경 (`environment.yml`) 설치 검증 — 2026-11-13

- `conda env create -f environment.yml`로 새 환경 `neurobio`를 만들었다(macOS, Apple Silicon, conda-forge).
- 첫 시도는 conda 패키지 설치까지 성공하고, 마지막 pip 단계(`wfdb`)가 일시적인 DNS 오류(`Failed to resolve 'pypi.org'`)로 실패했다. 환경 안에서 `pip install wfdb`를 다시 실행해 해결했다.
- 확인한 것: `pandas, scipy, scikit-learn, statsmodels, seaborn, pywavelets, rdkit, biopython, wfdb, jupyterlab`이 모두 import된다. Python 3.12.16.
- 버전을 고정하지 않았을 때 pandas 3.1.1이 설치되어, 레슨 출력(pandas 2.3.3 기준)과 표시가 달라질 수 있었다. `pandas<3`으로 고정하고 `conda env create --dry-run`으로 pandas 2.3.3이 선택되는 것을 확인했다.
- 고정 후의 `environment.yml`로 환경을 처음부터 다시 만드는 시험은 하지 않았다(dry-run만).
- 이 환경의 다른 버전: numpy 2.5.4, scipy 1.18.1, scikit-learn 1.9.1, statsmodels 0.15.0, matplotlib 3.11.2. **정규 레슨(0–6주차) 코드를 이 환경에서 다시 실행하지는 않았다.** 레슨 출력은 작성 당시 numpy 2.3.5 / scipy 1.16.3 / scikit-learn 1.7.2 / statsmodels 0.14.5 / pandas 2.3.3 환경에서 나온 것이다.

## 3. 직접 다시 실행해 확인한 예시 — 2026-11-13

선택 패키지를 설치하고, 레슨의 코드 블록을 레슨에 적힌 그대로 추출해 실행했다.

| 레슨 | 실행 환경 | 결과 |
|---|---|---|
| A6 예시 3 (SummarizedExperiment) | R 4.3.2, Bioconductor 3.18, SummarizedExperiment 1.32.0 | 통과. 출력을 레슨에 넣음. `browseVignettes()` 줄은 브라우저를 여는 명령이라 제외하고 실행 |
| A7 예시 3 (limma, DESeq2) | limma 3.58.1, DESeq2 1.42.1 | limma 통과. **DESeq2 부분은 `raw_counts` 미정의로 실패** → 가상 count 생성 줄을 추가해 고친 뒤 통과. 출력을 레슨에 넣음 |
| A7 renv 명령 4개 | renv 1.1.4 | 저장소 밖 빈 폴더에서 통과(`renv/`, `renv.lock`, `.Rprofile` 생성, status 동기화) |
| B3 `table` 예시 | GNU Octave 11.3.0 + datatypes 1.6.2 | 통과. 출력을 레슨에 넣음 |
| D1 nibabel, D4·D6·D7 nilearn, D5 nilearn 2수준 | nibabel 5.5.0, nilearn 0.14.1 | 같은 이름의 **가상 NIfTI 파일**을 만들어 레슨 코드 그대로 실행, 모두 오류 없음. D5는 실행 시간 때문에 `n_perm`만 5000 → 500으로 줄임. D6은 Harvard-Oxford 아틀라스를 내려받음 |
| G2 예시 3 (VAE) | PyTorch 2.14.1 (conda-forge) | 통과. 사용 예와 출력을 레슨에 넣음 |
| G5 예시 3 (ESM-2) | transformers 5.22.2 | Hugging Face 경로로 통과. 출력을 레슨에 넣음 |
| Day 21 보고서 뼈대 코드 | 시스템 Python | 새 "논문 분석과의 차이" 절을 넣은 뒤, 앞 셀이 만드는 변수(`MODE`, `facts`, `REPORT_DIR`)를 채워 실행해 뼈대 파일에 새 절이 생기는 것을 확인 |

이 과정에서 겪은 실패와 우회:

- **Bioconductor 설치:** 내려받기 중 `SSL connect error`, `HTTP2 framing layer` 오류로 BiocGenerics·Biobase·statmod가 빠졌다. `BiocManager::install()`을 다시 실행해 채웠다. RCurl은 소스 컴파일 후 불러오기에 실패해 `install.packages("RCurl", type = "binary")`로 해결했다. (A6에 반영)
- **PyTorch:** pip로 설치하면 `OMP: Error #15`(OpenMP 라이브러리 중복)로 `import torch`가 실패했다. conda-forge의 `pytorch`로 바꿔 해결했다. (G2에 반영)
- **ESM 공식 가중치 서버:** `dl.fbaipublicfiles.com`의 인증서가 2026-11-11에 만료되어 `fair-esm`의 내려받기가 실패했다. 인증서 검증을 끄지 않고 Hugging Face 경로로 바꿨다. (G5에 반영)

## 4. 작성 당시 에이전트가 실행했다고 보고한 것 — **이 파일 작성자가 다시 실행하지 않음**

각 레슨을 쓴 에이전트는 코드 블록을 추출해 실행하고 출력을 붙였다고 보고했다. 아래는 그 보고를 옮긴 것이며, 3절에 없는 항목은 다시 실행해 확인하지 않았다.

- 0–6주차: 각 주차 Python 블록 실행 보고(Python 3.13, pandas 2.3.3, numpy 2.3.5 등). "직접 해보기"의 변형 과제는 대부분 실행 보고 없음.
- 보충 S1–S7: 예시 코드 21개 실행 보고. 네트워크가 필요한 선택 단계(UniProt 내려받기, NCBI BLAST, Clustal Omega)는 실행하지 않음.
- Crash Course: 가이드별 예시 실행 보고.
- 심화 A–G: 파트별 실행 보고(R 4.3.2, Octave 11.3, Python 3.13).

## 5. 실행하지 않은 것 (본문에 "실행 확인 안 됨"으로 표시)

| 레슨 | 이유 |
|---|---|
| D2 fMRIPrep | Docker 컨테이너(수십 GB)와 FreeSurfer 라이선스 필요 |
| D5 FSL `randomise` | FSL 미설치(수 GB) |
| G5 `fair-esm` 공식 경로 | 가중치 서버 인증서 만료 |
| G6 LLM API 호출 | API 키 필요, 외부 서비스로 데이터 전송 |
| B 파트 MATLAB 전용 기능 일부 | MATLAB 라이선스 없음 |
| 실제 OSD-536 / PhysioNet 데이터로 전체 파이프라인 | 레슨 출력은 가상 데이터 기준. 실제 데이터 모드는 작성 에이전트가 일부 확인했다고 보고했으나 재확인하지 않음 |

## 6. 레슨별 Colab 노트북 실행 — 2026-11-13

`tools/make_colab.py`가 레슨 Markdown에서 만든 노트북 102개(Python 94, R 8)를 과정 환경(`neurobio`)과 R 4.3.2에서 위에서부터 끝까지 실행했다.

- 통과: Python 67/94, R 7/8.
- 실패 원인: 일부러 오류를 내는 연습 셀(6), 학습자가 채울 경로 자리표시자(4), 실제 데이터 파일 필요(9), 앞 레슨 산출물 필요(6, Day 16–21 — 한 폴더에서 Day 15→21을 순서대로 실행하면 오류 0), 네트워크(1, G5 공식 ESM 서버), 로컬 환경 누락(1, `tabulate`).
- 레슨 코드 결함 1건: Day F4의 개념 설명 예시가 변수를 정의하지 않아 노트북 첫 셀에서 멈췄다 → 예시 값 한 줄씩 추가.
- 주의: 이 컴퓨터에서 `neurobio`의 `jupyter nbconvert`가 base Python 커널로 뜨는 문제가 있어 `PATH`·`JUPYTER_PATH`를 지정해 다시 실행했다.
- 실제 Google Colab에서 열어 보지는 않았다(GitHub에 push된 뒤에 열린다).

## 7. 학습 웹사이트 (`site/`) — 2026-11-13

- `npm run build` 성공(117페이지), `npm run check-links` 내부 링크 15,913개 중 깨진 링크 0.
- 브라우저 확인: 홈·Day 10·Day 33·심화 C2·Crash Course genomics·학습 현황 페이지, 데스크톱과 375px 모바일. Day 10의 브라우저 안 Python 실행 출력이 레슨 값과 일치.
- 인터랙티브 시각화 10개: 화면 계산 함수 214개를 Python(scipy·statsmodels·scikit-learn·numpy) 결과와 대조해 모두 일치.
- 비밀번호 미들웨어: 9가지 경우(미설정·오답·정답·위조 쿠키·비밀번호 변경) 단위 시험 통과. Vercel에 실제로 배포한 상태에서는 아직 확인하지 않았다.
- 확인하지 않은 것: 실제 휴대폰 터치(스와이프), 진도 JSON 가져오기, Vercel에서의 빌드.

## 8. 심화 H (임상 예측·조기진단 ML) — 2026-11-13

- 레슨 7개와 Crash Course 가이드의 예시 코드는 작성 시 과정 환경(scikit-learn 1.9.1, lifelines 0.30.3)에서 실행해 출력을 붙였다(작성 에이전트 보고).
- 이 파트의 Colab 노트북 8개를 과정 환경에서 위에서부터 끝까지 다시 실행해 8개 모두 오류 없이 통과했다.
- 사이트 빌드 125페이지, 내부 링크 18,042개 중 깨진 링크 0.
- H2의 Riley 표본 수 공식 구현은 공식 패키지(pmsampsize)와 대조하지 않았다.
