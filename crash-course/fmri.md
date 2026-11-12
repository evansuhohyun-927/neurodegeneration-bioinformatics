# Crash Course — fMRI 데이터 분석

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** fMRI 논문의 방법 절을 읽고 "무엇을 재서, 어떤 순서로 처리했고, 어디서 결론이 부풀려질 수 있는지" 판단하며, 공개 BIDS 자료로 분석을 시작할 계획을 세운다.

## 한눈에 보기

| 무엇을 측정하는가 | 어떤 질문에 답하는가 | 답하지 못하는 것 |
|---|---|---|
| BOLD: 신경 활동에 뒤따르는 국소 혈액 산소 상태 변화. 2–3 mm voxel, 0.5–3초 간격, 4D 영상 | 과제 조건에 따라 어느 영역의 신호가 달라지나(활성), 영역들이 함께 움직이나(연결성), 패턴에 조건 정보가 담겼나(decoding), 집단 간 차이가 있나 | 신경 발화 자체, 밀리초 단위 순서, 흥분/억제의 구분, 절대 단위의 활동량, 개인 진단. 상관만으로 영역 간 인과 방향 |

## 🎬 급할 때 볼 영상

- [Principles of fMRI Part 1, Module 2: Analysis of fMRI Data — Principles of fMRI](https://www.youtube.com/watch?v=tQyMqRqHwao) (12:23) — 전처리부터 집단 추론까지 전체 흐름을 한 번에 훑는다.
- [Principles of fMRI Part 1 Module 15: The General Linear Model - Intro — Principles of fMRI](https://www.youtube.com/watch?v=GDkLQuV4he4) (12:25) — fMRI 분석의 중심인 GLM의 발상.
- [Principles of fMRI Part 1, Module 26: Multiple Comparisons — Principles of fMRI](https://www.youtube.com/watch?v=AalIM9-5-Pk) (9:04) — voxel 수만 개를 검정할 때의 오류율.

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| BOLD | 혈중 산소 수준에 따라 달라지는 MRI 신호 | 간접·상대 신호라 느리고, 혈관 반응이 다른 집단(노화·혈관 질환)에서는 해석이 조심스럽다 |
| HRF | 짧은 자극 하나에 대한 이상적인 BOLD 반응 모양(4–6초 봉우리, 늦은 undershoot) | 자극 시각표를 HRF와 convolution해야 예측 신호가 된다 |
| 설계 행렬 / GLM | 행=시점, 열=회귀변수. 자료 = Xβ + 잡음 | voxel마다 같은 회귀를 반복한다(mass-univariate) |
| contrast | β의 선형 결합으로 표현한 질문(예: A − B) | 무엇을 검정했는지가 contrast로 정해진다 |
| 시간 자기상관 / drift | 이웃 시점이 닮고 느린 흐름이 있는 잡음 | 무시하면 표준오차가 작아져 거짓 양성이 는다. high-pass + prewhitening |
| 머리 움직임 / FD | 시점 간 위치 변화. framewise displacement로 요약 | 과제·집단과 얽히면 가짜 활성·가짜 연결을 만든다 |
| 공간 정규화 / MNI | 개인 뇌를 표준 템플릿 공간으로 변형 | 집단 비교의 전제. 위축된 뇌에서는 정합 오차가 집단 차이와 섞인다 |
| 혼합효과(2수준) | 사람별 contrast를 모아 사람을 무작위 효과로 분석 | 결론을 모집단으로 일반화한다. 시점 수가 아니라 사람 수가 표본이다 |
| FWE / FDR / cluster | 지도 전체 오류율의 두 정의와, 덩어리 크기 기반 추론 | 보정 방법과 문턱이 결론을 좌우한다. 순열 검정이 가정이 적다 |
| circularity / 누수 | 같은 자료로 고르고 재기, 시험 정보가 학습에 섞이기 | 효과 크기·상관·decoding 정확도가 부풀려진다 |

## 측정 기술 고르기

| 기술 | 무엇을 얻나 | 장점 | 한계 | 이런 질문에 쓴다 |
|---|---|---|---|---|
| 과제 fMRI — 블록 설계 | 조건별 평균 활성 | 검출력이 가장 크다 | HRF 모양 추정이 약함, 예측 가능해 습관화. 블록이 너무 길면 drift와 섞임 | "이 과제에서 어디가 반응하나" |
| 과제 fMRI — 사건 관련 설계(jitter) | 시행별 반응, HRF 모양 | 조건을 섞어 제시, 시행 단위 분석·decoding | 블록보다 검출력이 낮음, 설계 효율을 미리 계산해야 함 | 시행 유형 비교, 반응 시간과의 관계, MVPA |
| 휴지기 fMRI | 과제 없는 저주파 요동의 상관 | 과제를 수행하기 어려운 환자에게도 찍을 수 있다 | 움직임·생리 잡음에 매우 민감, 전역 신호 처리 논쟁, 해석이 간접적 | 네트워크 연결성, 집단 간 연결성 차이(가설 생성) |
| ASL(동맥 스핀 표지) | 국소 뇌혈류의 정량값 | 절대 단위, 저주파 drift가 적어 느린 변화에 유리 | 신호 대 잡음비와 시간 해상도가 낮다 | 휴지 혈류, 긴 시간에 걸친 상태 변화 |
| 구조 MRI(T1 등) | 해부학, 부피·두께 | fMRI 정규화의 다리, 위축 측정 | 기능 정보는 없다 | 정규화, 위축 공변량, 개인 ROI 정의 |

## 표준 분석 흐름

1. **자료 정리.** DICOM → NIfTI 변환, BIDS 폴더로 정리, 사건 시각표(`events.tsv`)와 획득 정보(JSON) 확인. 도구: dcm2niix 계열 변환기, BIDS Validator. 입력→출력: DICOM → `sub-*/func/*_bold.nii.gz` + `.json` + `_events.tsv`. QC: 피험자·run 수, TR, 슬라이스 수, 사건 시각의 단위(초)와 기준점.
2. **원자료 QC.** 시계열 넘겨 보기, 스파이크·ghosting, dropout 위치. 도구: MRIQC. 출력: 피험자별 QC 지표와 HTML 보고서. QC: 이상 피험자 목록을 결과를 보기 전에 기록.
3. **전처리.** 움직임 보정, (선택) slice timing, 왜곡 보정, 기능–구조 정합, 표준 공간 정규화, smoothing. 도구: fMRIPrep(내부적으로 FSL·ANTs·FreeSurfer·AFNI 일부 사용), 또는 SPM·FSL·AFNI 단독. 출력: 전처리된 BOLD, confound 표(움직임 6개, FD, 백질·뇌실 신호 등), 시각 보고서. QC: 정합 윤곽 겹침, FD 분포와 집단별 평균, 제외 기준은 사전에 정한 값. smoothing은 voxel 크기의 약 두 배가 흔한 출발점(패턴 분석에서는 약하게 또는 생략).
4. **1수준 모형.** 사건을 HRF와 convolution, 방해 회귀변수(움직임, spike, DCT drift), 자기상관 모형(AR(1) 등)으로 voxel별 GLM, contrast 지도 계산. 도구: SPM, FSL FEAT, AFNI 3dDeconvolve, nilearn `FirstLevelModel`. 출력: 사람별 contrast(β)·분산·t/z 지도. QC: 설계 행렬 그림, 회귀변수 상관, 과제와 움직임의 상관.
5. **2수준(집단) 모형.** 사람별 contrast로 one/two-sample t, 회귀, ANOVA. 공변량은 전체 평균으로 중심화. 도구: FSL FLAME, SPM, AFNI 3dMEMA, nilearn `SecondLevelModel`. 출력: 집단 통계 지도. QC: 이상 피험자, 공변량의 집단 간 분포.
6. **추론.** voxel 또는 cluster 단위 FWE(순열 검정, RFT) 또는 FDR. 탐색 범위를 줄이려면 미리 정한 ROI. 도구: FSL randomise(TFCE), SnPM, nilearn `non_parametric_inference`. 출력: 보정된 문턱 지도, cluster 표. QC: 1차 문턱은 p < 0.001 이상으로 엄격히, 방법과 문턱을 사전에 정함.
7. **연결성·패턴 분석(필요 시).** seed 상관(잔차), PPI, ICA, 그래프 지표 / run·사람 단위 교차검증의 decoding, searchlight. 도구: nilearn, FSL MELODIC, scikit-learn. QC: 움직임 영향, 문턱 민감도, 이름표를 섞은 자료로 전체 파이프라인을 돌려 우연 수준 확인.
8. **보고와 공유.** MNI 좌표·템플릿 판·도구 판, 확률 아틀라스 기반 위치 이름, 독립 자료로 계산한 효과 크기(% 신호 변화의 기준 정의 포함), 비보정 통계 지도 공유. 도구: NeuroVault, OpenNeuro. QC: COBIDAS 체크리스트.

## 최소 실행 예시

> numpy·scipy·statsmodels·scikit-learn만 쓰는 가상 자료입니다. 실제 영상을 읽는 nibabel·nilearn은 이 저장소 환경에 설치되어 있지 않아 쓰지 않았습니다.

### 예시 1 — 2,000개 voxel에 같은 GLM을 돌리고 다중비교 보정하기

```python
import numpy as np
from scipy import stats
from scipy.stats import gamma
from statsmodels.stats.multitest import multipletests

rng = np.random.default_rng(100)
TR, n, dt = 2.0, 160, 0.1
t_hrf = np.arange(0, 32, dt)
hrf = gamma.pdf(t_hrf, 6) - gamma.pdf(t_hrf, 16) / 6       # 이중 감마 모양 HRF
t_hi = np.arange(0, n * TR, dt)
box = ((t_hi % 40) < 20).astype(float)                       # 20초 과제 / 20초 쉼
task = (np.convolve(box, hrf)[: t_hi.size] * dt)[:: int(TR / dt)]
task /= task.max()

# 설계 행렬: 절편 + 과제 + 느린 drift를 잡는 코사인 2개
k = np.arange(n)
X = np.column_stack([np.ones(n), task] + [np.cos(np.pi * j * (k + 0.5) / n) for j in (1, 2)])

# 가상 voxel 2,000개 중 앞 100개만 과제에 반응 (% 신호 변화로 약 1%)
n_vox = 2000
amp = np.zeros(n_vox); amp[:100] = 1.0
Y = 100 + np.outer(task, amp) + rng.normal(0, 1.2, (n, n_vox))

# voxel마다 같은 GLM을 한꺼번에 푼다 (mass-univariate)
beta, *_ = np.linalg.lstsq(X, Y, rcond=None)
resid = Y - X @ beta
dof = n - X.shape[1]
sigma2 = (resid ** 2).sum(0) / dof
c = np.array([0, 1, 0, 0])
t = (c @ beta) / np.sqrt(sigma2 * (c @ np.linalg.inv(X.T @ X) @ c))
p = stats.t.sf(t, dof)

for name, rej in [("보정 없음 p<0.05", p < 0.05),
                  ("Bonferroni", multipletests(p, 0.05, "bonferroni")[0]),
                  ("BH FDR", multipletests(p, 0.05, "fdr_bh")[0])]:
    print(f"{name:16} 검출 {rej.sum():4d} | 진짜 {rej[:100].sum():3d} | 가짜 {rej[100:].sum():3d}")
```

출력:

```text
보정 없음 p<0.05     검출  193 | 진짜  99 | 가짜  94
Bonferroni       검출   70 | 진짜  70 | 가짜   0
BH FDR           검출   98 | 진짜  94 | 가짜   4
```

보정 없는 p < 0.05는 진짜 100개 중 99개를 찾지만 가짜도 94개를 함께 찾습니다. Bonferroni는 가짜가 0개인 대신 70개만 찾고, BH FDR은 94개를 찾으면서 가짜를 4개(약 4%)로 묶습니다. 이 예시는 잡음을 독립으로 만들었습니다. 실제 fMRI 잡음은 시간 자기상관과 공간 상관을 갖고 있어 prewhitening과, 공간 상관을 반영하는 FWE 방법(순열 검정 등)이 필요합니다. 자세한 비교는 [Day D4](../lessons/advanced/D-fmri/day-D4.md), [Day D5](../lessons/advanced/D-fmri/day-D5.md)를 보세요.

### 예시 2 — decoding에서 feature 선택 누수

```python
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupKFold, cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(1)
y = np.tile([0, 1], 24)                      # 시행 48개, 두 조건
runs = np.repeat(np.arange(4), 12)           # run 4개
cv, clf = GroupKFold(4), LogisticRegression(max_iter=2000)

bad, good = [], []
for _ in range(20):                          # 신호 없는 자료를 20번 새로 만들어 평균을 본다
    X = rng.normal(size=(48, 2000))          # voxel 2,000개, 조건과 무관
    top = SelectKBest(f_classif, k=20).fit(X, y).get_support()             # ✗ 전체 자료로 voxel 고르기
    bad.append(cross_val_score(clf, X[:, top], y, cv=cv, groups=runs).mean())
    good.append(cross_val_score(make_pipeline(SelectKBest(f_classif, k=20), clf),  # ✓ fold 안에서 고르기
                                X, y, cv=cv, groups=runs).mean())
print("우연 수준 0.50 | 누수 있는 정확도 평균 %.2f | 누수 없는 정확도 평균 %.2f (범위 %.2f–%.2f)"
      % (np.mean(bad), np.mean(good), min(good), max(good)))
```

출력:

```text
우연 수준 0.50 | 누수 있는 정확도 평균 0.95 | 누수 없는 정확도 평균 0.51 (범위 0.25–0.67)
```

조건과 무관한 잡음인데, 전체 자료로 voxel을 고른 뒤 교차검증하면 평균 정확도가 0.95입니다. 같은 선택을 pipeline 안에 넣으면 평균 0.51로 우연 수준이 됩니다. 시행 48개짜리 자료 하나에서는 우연 정확도가 0.25–0.67까지 흔들린다는 점도 보세요. 우연보다 높은지는 이름표 순열 검정으로 판단합니다.

## 흔한 함정

1. **사람 수 대신 시점 수를 표본으로 쓰기** → 고정효과 결론이 모집단 결론처럼 보고됨 → 사람별 contrast로 2수준 혼합효과 분석을 한다.
2. **시간 자기상관 무시** → 표준오차가 작아져 거짓 양성 증가 → high-pass 필터와 prewhitening(소프트웨어 기본값을 끄지 않기).
3. **움직임이 과제나 집단과 얽힘** → 가짜 활성·가짜 연결성 → FD를 집단별로 보고하고, 움직임 회귀변수·spike 처리, 움직임이 맞춰진 하위 표본에서 재확인. 제외 기준은 미리 정한다.
4. **관대한 1차 문턱의 매개변수 cluster 추론, 또는 임의의 "p < 0.001 + k > 10"** → 명목보다 큰 거짓 양성(Eklund 등 2016) → 순열 검정·TFCE, 엄격한 1차 문턱.
5. **같은 자료로 고르고 재기(circularity)** → 효과 크기와 뇌–행동 상관이 부풀려짐 → 독립 localizer, 홀짝 run 분할, 사전 정의 ROI.
6. **교차검증 밖의 전처리·feature 선택, 시행 무작위 분할** → decoding 정확도가 부풀려짐 → run·사람 단위 분할, 모든 단계를 pipeline 안에.
7. **위축 뇌를 젊은 템플릿에 맞추거나 집단마다 다른 템플릿** → 정합 오차가 집단 차이처럼 보임 → 같은 템플릿, 엄격한 정규화 QC, 회백질 양 공변량 등 민감도 분석.
8. **dropout 영역에서 "활성 없음"을 결론** → 신호 자체가 없던 곳을 음성 결과로 해석 → 평균 EPI와 구조 영상을 겹쳐 신호 범위를 확인하고 보고.

## 연구 설계 체크리스트

- [ ] 질문이 활성(어디), 연결성(함께), decoding(정보), 개인차(상관) 중 무엇인지 정했고, 개인차라면 필요한 표본이 훨씬 크다는 점을 반영했다.
- [ ] 미리 정한 ROI 하나로 검정력을 계산했다(효과 크기와 사람 간 SD의 출처, "만약" 시나리오 포함).
- [ ] 설계 효율을 계산해 블록/사건 관련/jitter를 골랐고, 블록 주기가 drift 대역과 겹치지 않는다.
- [ ] 집단 간 나이·성별·교육·약물·움직임이 비슷한지, 다르면 어떤 공변량으로 어떻게 중심화할지 정했다.
- [ ] 움직임 기준(FD 문턱, 제외 규칙)과 전처리 파이프라인·판을 결과를 보기 전에 고정했다.
- [ ] 정규화 템플릿(집단 공통)과 QC 방법을 정했다. 고령·위축 집단이면 민감도 분석을 계획했다.
- [ ] 다중비교 방법(순열 FWE·TFCE·FDR)과 1차 문턱, 사전 정의 ROI를 분석 계획서에 적었다.
- [ ] decoding이면 교차검증 단위(run/사람), pipeline 구성, 순열 검정 횟수를 정했다.
- [ ] 효과 크기는 독립 자료로 계산하고, % 신호 변화의 기준(자)을 정의했다.
- [ ] BIDS 정리, 개인 정보 제거(DICOM header, 얼굴), 공유 계획(OpenNeuro, NeuroVault)과 동의서 범위를 확인했다.

## 공개 데이터와 더 볼 곳

**공개 저장소**

| 이름 | 공식 URL | 무엇이 있나 |
|---|---|---|
| OpenNeuro | <https://openneuro.org> | BIDS 형식의 공개 MRI·fMRI·EEG 자료. 과제·휴지기 자료가 많다 |
| NeuroVault | <https://neurovault.org> | 논문의 비보정 통계 지도 공유·검색 |
| Neurosynth | <https://neurosynth.org> | 논문 좌표 기반 자동 메타분석(ROI 출처로 쓸 때는 방법을 확인) |
| Human Connectome Project | <https://www.humanconnectome.org> | 고품질 과제·휴지기 fMRI 대규모 자료(이용 약관 동의 필요) |
| ADNI | <https://adni.loni.usc.edu> | 알츠하이머병 코호트의 영상·임상 자료(접근 승인 필요, 영상 종류는 사이트에서 확인) |
| PPMI | <https://www.ppmi-info.org> | 파킨슨병 코호트의 임상·영상 자료(접근 승인 필요, 영상 종류는 사이트에서 확인) |
| OASIS | <https://www.oasis-brains.org> | 노화·치매 관련 MRI 자료(이용 조건은 사이트에서 확인) |

**공식 문서·튜토리얼**

- BIDS 명세: <https://bids-specification.readthedocs.io/> · 소개: <https://bids.neuroimaging.io>
- fMRIPrep: <https://fmriprep.org> · MRIQC: <https://mriqc.readthedocs.io>
- nilearn(파이썬 GLM·연결성·decoding): <https://nilearn.github.io> · nibabel(NIfTI 입출력): <https://nipy.org/nibabel/>
- SPM: <https://www.fil.ion.ucl.ac.uk/spm/> · FSL: <https://fsl.fmrib.ox.ac.uk/fsl/> · AFNI: <https://afni.nimh.nih.gov/> · FreeSurfer: <https://surfer.nmr.mgh.harvard.edu/>
- 입문 교재(웹): Andy's Brain Book <https://andysbrainbook.readthedocs.io> · DartBrains <https://dartbrains.org>
- 교재: Poldrack RA, Mumford JA, Nichols TE. *Handbook of Functional MRI Data Analysis.* Cambridge University Press, 2011. <https://www.cambridge.org/core/books/handbook-of-functional-mri-data-analysis/8EDF966C65811FCCC306F7C916228529> (doi:[10.1017/CBO9780511895029](https://doi.org/10.1017/CBO9780511895029))

**핵심 논문**

- Logothetis NK. What we can do and what we cannot do with fMRI. *Nature.* 2008;453:869–878. doi:[10.1038/nature06976](https://doi.org/10.1038/nature06976)
- Gorgolewski KJ, et al. The brain imaging data structure. *Sci Data.* 2016;3:160044. doi:[10.1038/sdata.2016.44](https://doi.org/10.1038/sdata.2016.44)
- Esteban O, et al. fMRIPrep: a robust preprocessing pipeline for functional MRI. *Nat Methods.* 2019;16:111–116. doi:[10.1038/s41592-018-0235-4](https://doi.org/10.1038/s41592-018-0235-4)
- Power JD, et al. Spurious but systematic correlations in functional connectivity MRI networks arise from subject motion. *NeuroImage.* 2012;59:2142–2154. doi:[10.1016/j.neuroimage.2011.10.018](https://doi.org/10.1016/j.neuroimage.2011.10.018)
- Nichols TE, Holmes AP. Nonparametric permutation tests for functional neuroimaging. *Hum Brain Mapp.* 2002;15:1–25. doi:[10.1002/hbm.1058](https://doi.org/10.1002/hbm.1058)
- Eklund A, Nichols TE, Knutsson H. Cluster failure. *PNAS.* 2016;113:7900–7905. doi:[10.1073/pnas.1602413113](https://doi.org/10.1073/pnas.1602413113)
- Kriegeskorte N, et al. Circular analysis in systems neuroscience: the dangers of double dipping. *Nat Neurosci.* 2009;12:535–540. doi:[10.1038/nn.2303](https://doi.org/10.1038/nn.2303)
- Varoquaux G, et al. Assessing and tuning brain decoders: cross-validation, caveats, and guidelines. *NeuroImage.* 2017;145:166–179. doi:[10.1016/j.neuroimage.2016.10.038](https://doi.org/10.1016/j.neuroimage.2016.10.038)
- Nichols TE, et al. Best practices in data analysis and sharing in neuroimaging using MRI (COBIDAS). *Nat Neurosci.* 2017;20:299–303. doi:[10.1038/nn.4500](https://doi.org/10.1038/nn.4500)
- Botvinik-Nezer R, et al. Variability in the analysis of a single neuroimaging dataset by many teams. *Nature.* 2020;582:84–88. doi:[10.1038/s41586-020-2314-9](https://doi.org/10.1038/s41586-020-2314-9)
- Marek S, et al. Reproducible brain-wide association studies require thousands of individuals. *Nature.* 2022;603:654–660. doi:[10.1038/s41586-022-04492-9](https://doi.org/10.1038/s41586-022-04492-9)
- D'Esposito M, Deouell LY, Gazzaley A. Alterations in the BOLD fMRI signal with ageing and disease. *Nat Rev Neurosci.* 2003;4:863–872. doi:[10.1038/nrn1246](https://doi.org/10.1038/nrn1246)

## 본 과정과의 연결

본 과정은 fMRI 자료를 직접 다루지 않습니다. 아래 레슨이 이 가이드의 통계·설계 부분을 자세히 다루고, 심화 파트 D가 fMRI 자체를 7일로 다룹니다.

| 이 가이드의 부분 | 자세히 다루는 레슨 |
|---|---|
| 파일 형식, 메타데이터, provenance | [Day 6](../lessons/week-1/day-06.md), [Day 4](../lessons/week-1/day-04.md), [Day 15](../lessons/week-3/day-15.md) |
| 시계열, 샘플링, 자기상관 | [Day 23 — 시계열 기초](../lessons/week-4/day-23.md) |
| p-value, 효과크기, 검정력 | [Day 9](../lessons/week-2/day-09.md) |
| 다중검정, FDR | [Day 10 — FDR과 다중검정](../lessons/week-2/day-10.md) |
| 반복·배치·교란, 공변량 | [Day 11](../lessons/week-2/day-11.md), [Day 31 — 교란변수](../lessons/week-5/day-31.md) |
| PCA(ICA의 출발점) | [Day 14 — PCA와 heatmap](../lessons/week-2/day-14.md) |
| 사전 분석 계획, 제외 기준 | [Day 28 — 분석 계획 확정](../lessons/week-4/day-28.md) |
| 참가자 단위 교차검증, 누수 | [Day 33 — GroupKFold와 데이터 누수](../lessons/week-5/day-33.md), [Day 34 — 평가 지표](../lessons/week-5/day-34.md) |
| 순열 검정, bootstrap | [Day 30](../lessons/week-5/day-30.md), [Day 36](../lessons/week-6/day-36.md) |
| 재현성, 민감도 분석 | [Day 38](../lessons/week-6/day-38.md), [Day 39](../lessons/week-6/day-39.md) |
| **심화 파트 D — fMRI 데이터 분석** | [D1 BOLD와 자료 구조](../lessons/advanced/D-fmri/day-D1.md) · [D2 전처리와 QC](../lessons/advanced/D-fmri/day-D2.md) · [D3 정규화와 아틀라스](../lessons/advanced/D-fmri/day-D3.md) · [D4 1수준 GLM](../lessons/advanced/D-fmri/day-D4.md) · [D5 집단 분석과 다중비교](../lessons/advanced/D-fmri/day-D5.md) · [D6 연결성](../lessons/advanced/D-fmri/day-D6.md) · [D7 패턴 분석과 ROI](../lessons/advanced/D-fmri/day-D7.md) |

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
