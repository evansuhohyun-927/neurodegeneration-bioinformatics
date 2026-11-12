# Crash Course — 바이오메디컬 AI와 생성형 AI

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** 의료 AI·생성형 AI 논문의 방법 절을 비판적으로 읽고, 내 데이터로 모델이나 합성 데이터를 만들 때 어떤 순서로 무엇을 점검할지 계획할 수 있다.

## 한눈에 보기

이 분야는 "데이터에서 규칙을 배우는 모델"로 두 가지 일을 한다. **판별(discriminative)**: 입력을 보고 라벨·값을 맞힌다. **생성(generative)**: 데이터의 분포를 배워 새 데이터를 만든다. 측정 장비가 아니라 **방법론**이므로, 이 가이드의 "측정 기술 고르기"는 모델 계열 고르기에 해당한다.

| | 내용 |
|---|---|
| 무엇을 하는가 | 영상·신호·표·서열·분자·텍스트에서 패턴을 학습해 예측하거나 새 데이터를 생성 |
| 답할 수 있는 질문 | 이 입력이 어느 범주인가 / 이 값은 얼마인가 / 비슷한 사례끼리 어떻게 묶이나 / 이 조건을 만족하는 그럴듯한 새 사례(영상·분자·표)는 무엇인가 |
| 답하지 못하는 것 | 인과(무엇이 원인인가), 학습 데이터에 없는 현상, 개별 환자의 진단·치료 결정, "모델이 맞다"는 보장. 생성 모델은 새로운 생물학적 정보를 만들지 못하고 기존 정보를 재배열한다 |
| 결과의 성격 | 전부 **탐색적 가설 생성**이다. 전향적 외부 검증 전에는 성능 숫자를 임상 주장으로 옮기지 않는다 |

## 🎬 급할 때 볼 영상

- [But what is a neural network? | Deep learning chapter 1](https://www.youtube.com/watch?v=aircAruvnKk) — 3Blue1Brown (18분). 신경망을 "숫자를 받아 숫자를 내는 함수"로 보는 관점. 하나만 본다면 이것.
- [Transformers, the tech behind LLMs | Deep Learning Chapter 5](https://www.youtube.com/watch?v=wjZofJX0v4M) — 3Blue1Brown (27분). LLM·단백질 언어 모델·SMILES 생성의 공통 구조.
- [Pulmonary Health Case Study: Bias Exploration, Exploring Fairness in Machine Learning](https://www.youtube.com/watch?v=zrB6pocJSI8) — MIT OpenCourseWare (5분). 의료 모델의 하위집단 성능 차이를 실제 사례로 짧게.

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| 지도 / 비지도 / 자기지도 (supervised / unsupervised / self-supervised) | 정답표가 사람에게서 / 없음 / 데이터 자체에서 오는 학습 | 정답표의 출처와 품질이 모델 성능의 상한을 정한다 |
| 판별 모델 / 생성 모델 | P(라벨\|입력)을 배움 / P(입력) 또는 P(입력\|라벨)을 배움 | 생성 모델만 새 데이터를 뽑을 수 있다 |
| 잠재 공간 (latent space) | 데이터를 압축한 저차원 좌표계 | VAE·임베딩·PCA가 공유하는 구조. 보간·탐색·군집의 무대 |
| 전이학습·미세조정 (transfer learning, fine-tuning) | 큰 데이터로 미리 배운 모델을 작은 과제 데이터에 맞추기 | 라벨이 적은 의료 데이터의 표준 전략 |
| 데이터 누수 (leakage) | 평가에 쓰일 정보가 학습에 섞여 성능이 부풀려지는 것 | 의료 AI 재현 실패의 가장 흔한 원인. 환자·골격·시간 단위 분할로 막는다 |
| 합성 데이터 3축 | 충실도(닮았나) / 유용성(같은 결론이 나오나) / 프라이버시(개인을 복사하지 않았나) | 하나만 보고하면 복사에 가까운 합성기가 "최고"로 보인다 |
| TSTR | 합성으로 학습하고 실제로 평가(Train on Synthetic, Test on Real) | 합성 데이터 유용성의 기본 측정법 |
| 보정 (calibration) | 예측 확률 0.3인 사람 중 실제로 30%가 사건을 겪는가 | 임계값·의사결정에 쓰려면 순위(AUC)만으로 부족하다 |
| 하위집단 성능·편향 | 사이트·성별·인종·기기별 성능 차이 | 전체 성능이 좋아도 특정 집단에서 나쁠 수 있고, 라벨 자체가 편향될 수 있다 |
| 적용 영역 (applicability domain) | 모델 예측을 믿어도 되는 입력 범위 | 학습 데이터와 너무 다른 입력의 예측은 쓰지 않는다 |

## 측정 기술 고르기 — 생성 모델 계열

| 계열 | 무엇을 얻나 | 장점 | 한계 | 이런 질문에 쓴다 |
|---|---|---|---|---|
| VAE | 매끄러운 잠재 공간 + 디코더 | 보간·조건부 탐색이 쉽다 | 결과가 흐릿하다 | 분자 잠재 공간 탐색, 표현 학습 |
| GAN (cGAN·CycleGAN·SRGAN 등) | 선명한 샘플 | 영상 품질이 높다 | 학습 불안정, mode collapse(다양성 상실) | 의료 영상 증강, 모달리티 변환, 초해상도 |
| Diffusion | 잡음을 단계적으로 제거해 생성 | 품질·다양성이 높다 | 생성이 느리다 | 영상 합성·재구성의 현재 주류 |
| 자기회귀 / transformer | 토큰을 하나씩 생성 | 서열·문자열·문장에 자연스럽다 | 오류가 뒤로 전파, 환각 | 텍스트(LLM), 단백질 서열, SMILES |
| 통계적 표 합성기 (가우시안 혼합, copula, CTGAN/TVAE 등) | 표 형식 합성 레코드 | 작은 데이터에도 적용 가능, 점검이 쉽다 | 복잡한 시간·중첩 구조를 놓친다 | EHR·임상 변수 공유용 합성 데이터 |

고르는 순서: 표 데이터면 통계적 합성기부터, 영상이면 diffusion(없으면 GAN), 순서 있는 데이터(서열·문자열·문장)면 transformer. 딥러닝 자원이 없다면 **표 데이터 + 전통 ML**로도 대부분의 방법론 점검을 배울 수 있다(이 저장소의 심화 파트 G가 그렇게 구성되어 있다).

## 표준 분석 흐름

판별 모델(예측) 프로젝트:

1. **질문과 쓰임 고정.** 누가 언제 이 예측을 보고 무엇을 하는가. 여기서 평가 지표와 임계값 기준이 정해진다. 산출물: 분석 계획서(미리 작성).
2. **데이터 수집과 provenance.** 출처·버전·라이선스·수집 기기·기간을 기록한다. 입력: 원자료 → 출력: 데이터 사전 + 메타데이터 표. QC: 중복 환자, 기기 교체 시점, 결측 패턴.
3. **분할을 먼저 정한다.** 환자(참가자) 단위, 가능하면 사이트·시간 기준으로도. 전처리 기준값(표준화 평균, 결측 대치값)은 학습 데이터에서만 계산한다. QC: 같은 환자가 양쪽에 있는지 코드로 확인.
4. **feature·전처리.** 결측·이상값 규칙을 미리 정한다. 도구: scikit-learn `Pipeline`(전처리를 모델에 묶어 fold마다 다시 계산되게 한다).
5. **기준선부터.** 다수 범주 모델, 단일 변수 모델, 기존 임상 점수와 비교한다. 기준선을 못 넘으면 복잡한 모델을 쓸 이유가 없다.
6. **모델 학습과 하이퍼파라미터 선택.** 선택은 학습 데이터 안의 내부 교차검증(nested CV)에서만 한다. 평가셋으로 고른 설정은 평가가 아니다.
7. **평가.** 지표를 여러 개 본다: 판별력(AUC, PR-AUC), 임계값 성능(민감도·특이도·PPV), 보정(Brier, 보정 곡선). 모두 신뢰구간과 함께. 하위집단별로 쪼개 본다(각 집단의 n과 사건 수를 함께 적는다).
8. **점검과 민감도 분석.** 순열 중요도·SHAP으로 무엇에 기대는지 본다(설명 ≠ 인과). 이상 사례를 눈으로 본다. 전처리·임계값·제외 규칙을 바꿔 결론이 흔들리는지 본다.
9. **보고.** TRIPOD+AI(예측 모델), CONSORT-AI/SPIRIT-AI(AI 개입 임상시험) 같은 지침 항목을 채우고 모델 카드를 쓴다. 코드·시드·환경을 남긴다.

생성·합성 데이터 프로젝트(위 흐름에 더해):

1. **목적 명시.** 공유용인가, 증강용인가, 소프트웨어 테스트용인가. 목적에 따라 점검의 무게가 달라진다(공유는 프라이버시, 증강은 유용성).
2. **합성기 학습은 분할 뒤 학습 데이터만으로.** 교차검증이면 fold마다 다시.
3. **3축 점검.** 충실도(열별 KS·상관 차이·탐지 AUC), 유용성(TSTR vs TRTR), 프라이버시(DCR을 holdout의 DCR과 비교, 가능하면 멤버십 추론 검사).
4. **합성 비율·설정 민감도.** 합성을 몇 배 섞었을 때 결과가 어떻게 바뀌는지 보고한다.
5. **보고.** 어느 결과가 합성 데이터에 기반했는지 본문에 명시한다. 영상 생성·초해상도 결과는 진단 판독에 쓰지 않는다.

## 최소 실행 예시

합성 표 데이터의 유용성과 프라이버시를 함께 재는 가장 짧은 코드다. 가상 데이터를 만들고, 성분 수가 적은 합성기와 과적합 합성기를 비교한다.

```python
import numpy as np, pandas as pd
from scipy import stats
from sklearn.mixture import GaussianMixture
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(7)
COLS = ["age", "sbp", "marker"]
n = 800
age = rng.normal(64, 9, n)
sbp = 95 + 0.6 * age + rng.normal(0, 11, n)
marker = 0.03 * age + rng.normal(0, 1, n)
y = (rng.random(n) < 1 / (1 + np.exp(-(-9 + 0.05 * age + 0.02 * sbp + 0.8 * marker)))).astype(int)
real = pd.DataFrame({"age": age, "sbp": sbp, "marker": marker, "y": y})
train, hold = train_test_split(real, test_size=0.5, random_state=0, stratify=real.y)

def synth(df, k):
    out = []
    for lab, g in df.groupby("y"):
        gm = GaussianMixture(n_components=min(k, len(g)), covariance_type="full", random_state=0).fit(g[COLS])
        s, _ = gm.sample(len(g))
        out.append(pd.DataFrame(s, columns=COLS).assign(y=lab))
    return pd.concat(out, ignore_index=True)

trtr = roc_auc_score(hold.y, LogisticRegression(max_iter=1000).fit(train[COLS], train.y).predict_proba(hold[COLS])[:, 1])
print(f"실제 학습 → 실제 평가(TRTR) AUC {trtr:.3f}")
sc = StandardScaler().fit(train[COLS])
A, H = sc.transform(train[COLS]), sc.transform(hold[COLS])
dcr_h = np.median(np.sqrt(((H[:, None] - A[None]) ** 2).sum(-1)).min(1))
for k in (2, 200):
    s = synth(train, k)
    tstr = roc_auc_score(hold.y, LogisticRegression(max_iter=1000).fit(s[COLS], s.y).predict_proba(hold[COLS])[:, 1])
    ks = max(stats.ks_2samp(train[c], s[c]).statistic for c in COLS)
    S = sc.transform(s[COLS])
    dcr = np.median(np.sqrt(((S[:, None] - A[None]) ** 2).sum(-1)).min(1))
    print(f"합성(성분 {k:>3}개): KS최대 {ks:.3f} | TSTR AUC {tstr:.3f} | DCR 합성 {dcr:.3f} vs 실제 holdout {dcr_h:.3f}")
```

실제 출력:

```text
실제 학습 → 실제 평가(TRTR) AUC 0.724
합성(성분   2개): KS최대 0.065 | TSTR AUC 0.721 | DCR 합성 0.276 vs 실제 holdout 0.272
합성(성분 200개): KS최대 0.052 | TSTR AUC 0.720 | DCR 합성 0.002 vs 실제 holdout 0.272
```

두 합성기의 충실도(KS)와 유용성(TSTR)은 거의 같다. 차이는 프라이버시다. 성분 200개짜리는 합성 행이 학습 환자와 거리 0.002, 즉 **사실상 복사본**이다. 학습에 쓰지 않은 실제 사람조차 0.272 떨어져 있다는 것과 비교하면 명백하다. 충실도·유용성만 보고하는 합성 데이터 논문을 읽을 때 이 지표가 빠져 있는지 확인하라.

## 흔한 함정

1. **무작위 분할** → 같은 환자의 여러 기록, 같은 골격의 유사체, 같은 사이트 데이터가 양쪽에 들어가 성능이 부풀려진다 → 환자·골격·사이트·시간 단위로 나눈다.
2. **분할 전 전처리·증강** → 표준화 평균, 결측 대치값, 합성 행이 평가 정보를 품는다 → `Pipeline`에 넣고 fold 안에서 계산하며, 합성은 학습 데이터만으로.
3. **평가셋으로 모델·임계값 고르기** → 평가가 아니라 선택 결과를 보고하게 된다 → 내부 교차검증으로 고르고, 평가셋은 마지막에 한 번.
4. **전체 성능만 보고** → 작은 하위집단에서 성능이 무너져도 보이지 않는다 → 집단별 지표를 n·사건 수·신뢰구간과 함께 적는다.
5. **AUC만 보고** → 순위는 좋아도 확률이 틀려 임계값 운영이 불가능할 수 있다 → 보정 곡선·Brier를 함께.
6. **라벨을 사실로 믿기** → 라벨이 대리 지표(예: 의료비, 과거 진료 패턴)면 편향이 모델로 그대로 들어간다 → 라벨 정의와 생성 과정을 문서화하고, 대리 지표의 한계를 본문에 쓴다.
7. **설명 기법을 인과로 읽기** → "SHAP 상위 변수 = 원인"이 아니다. 상관·대리 변수·누수 변수가 상위에 오를 수 있다 → 중요도는 모델 점검 도구로만 쓰고, 인과 주장은 설계로 뒷받침한다.
8. **생성물을 사실로 쓰기** → LLM의 요약·인용, 초해상도 영상의 미세 구조는 지어낸 것일 수 있다 → 숫자·인용은 원문 대조, 생성 영상은 판독 근거로 쓰지 않는다.

## 연구 설계 체크리스트

- [ ] 예측의 쓰임과 의사결정 지점, 그에 맞는 지표와 임계값 기준을 **데이터를 보기 전에** 정했다.
- [ ] 표본 수와 사건 수가 지표의 불확실성을 감당할 만한지 따졌다(작은 집단은 신뢰구간이 매우 넓다).
- [ ] 분할 단위(환자·사이트·시간·골격)를 정하고 양쪽에 겹치는지 코드로 확인했다.
- [ ] 전처리·대치·증강이 모두 학습 데이터 안에서만 일어나도록 묶었다.
- [ ] 기준선(다수 범주, 단일 변수, 기존 임상 점수)을 함께 보고한다.
- [ ] 하위집단(사이트·기기·성별·연령대)별 성능을 n과 함께 보고한다.
- [ ] 보정을 평가한다(보정 곡선 또는 Brier).
- [ ] 라벨의 정의·출처·대리성과 그 한계를 문서화했다.
- [ ] 합성·증강을 썼다면 충실도·유용성·프라이버시 세 축을 보고한다.
- [ ] 시드, 패키지 버전, 코드, 데이터 버전을 남겨 재현 가능하게 했다.
- [ ] 보고 지침(TRIPOD+AI 등) 항목을 점검하고 모델 카드를 작성했다.

## 공개 데이터와 더 볼 곳

**공개 저장소·DB**

- [ChEMBL](https://www.ebi.ac.uk/chembl/) — 생물학적 활성 화합물과 표적·활성 측정값.
- [PubChem](https://pubchem.ncbi.nlm.nih.gov/) — 화합물 구조·물성·생물학적 분석 결과.
- [RCSB PDB](https://www.rcsb.org/) — 실험으로 풀린 단백질 구조.
- [AlphaFold Protein Structure Database](https://alphafold.ebi.ac.uk/) — 예측 구조와 잔기별 신뢰도(pLDDT).
- [PhysioNet](https://physionet.org/) — 생리 신호·임상 시계열 데이터(본 과정 4–5주차에서 사용).

**공식 문서·튜토리얼**

- scikit-learn 사용자 안내서: <https://scikit-learn.org/stable/modules/clustering.html> (군집), 모델 선택·교차검증 장도 함께.
- RDKit 시작하기: <https://www.rdkit.org/docs/GettingStartedInPython.html>
- Synthetic Data Vault(표 데이터 합성 오픈소스) 문서: <https://docs.sdv.dev/sdv>
- ESM 단백질 언어 모델 코드·가중치: <https://github.com/facebookresearch/esm>

**규제·지침 (실재하는 문서만)**

- TRIPOD+AI (예측 모델 보고 지침): Collins GS, et al. *BMJ.* 2024;385:e078378. doi:[10.1136/bmj-2023-078378](https://doi.org/10.1136/bmj-2023-078378)
- CONSORT-AI (AI 개입 임상시험 보고): Liu X, et al. *Nat Med.* 2020;26:1364–1374. doi:[10.1038/s41591-020-1034-x](https://doi.org/10.1038/s41591-020-1034-x)
- 모델 카드: Mitchell M, et al. *FAT\* '19.* 2019:220–229. doi:[10.1145/3287560.3287596](https://doi.org/10.1145/3287560.3287596)
- WHO, *Ethics and governance of artificial intelligence for health* (2021): <https://www.who.int/publications/i/item/9789240029200>
- EU 인공지능법(Regulation (EU) 2024/1689) 원문: <https://eur-lex.europa.eu/eli/reg/2024/1689/oj>

**핵심 논문**

- Rajpurkar P, et al. AI in health and medicine. *Nat Med.* 2022;28:31–38. doi:[10.1038/s41591-021-01614-0](https://doi.org/10.1038/s41591-021-01614-0)
- Obermeyer Z, et al. Dissecting racial bias in an algorithm used to manage the health of populations. *Science.* 2019;366:447–453. doi:[10.1126/science.aax2342](https://doi.org/10.1126/science.aax2342)
- Zech JR, et al. Variable generalization performance of a deep learning model to detect pneumonia in chest radiographs. *PLOS Med.* 2018;15:e1002683. doi:[10.1371/journal.pmed.1002683](https://doi.org/10.1371/journal.pmed.1002683)
- DeGrave AJ, et al. AI for radiographic COVID-19 detection selects shortcuts over signal. *Nat Mach Intell.* 2021;3:610–619. doi:[10.1038/s42256-021-00338-7](https://doi.org/10.1038/s42256-021-00338-7)
- Roberts M, et al. Common pitfalls and recommendations for using machine learning to detect and prognosticate for COVID-19. *Nat Mach Intell.* 2021;3:199–217. doi:[10.1038/s42256-021-00307-0](https://doi.org/10.1038/s42256-021-00307-0)
- Kapoor S, Narayanan A. Leakage and the reproducibility crisis in machine-learning-based science. *Patterns.* 2023;4:100804. doi:[10.1016/j.patter.2023.100804](https://doi.org/10.1016/j.patter.2023.100804)
- Wong A, et al. External validation of a widely implemented proprietary sepsis prediction model. *JAMA Intern Med.* 2021;181:1065–1070. doi:[10.1001/jamainternmed.2021.2626](https://doi.org/10.1001/jamainternmed.2021.2626)
- Rudin C. Stop explaining black box machine learning models for high stakes decisions. *Nat Mach Intell.* 2019;1:206–215. doi:[10.1038/s42256-019-0048-x](https://doi.org/10.1038/s42256-019-0048-x)
- Chen RJ, et al. Synthetic data in machine learning for medicine and healthcare. *Nat Biomed Eng.* 2021;5:493–497. doi:[10.1038/s41551-021-00751-8](https://doi.org/10.1038/s41551-021-00751-8)
- Jumper J, et al. Highly accurate protein structure prediction with AlphaFold. *Nature.* 2021;596:583–589. doi:[10.1038/s41586-021-03819-2](https://doi.org/10.1038/s41586-021-03819-2)
- Thirunavukarasu AJ, et al. Large language models in medicine. *Nat Med.* 2023;29:1930–1940. doi:[10.1038/s41591-023-02448-8](https://doi.org/10.1038/s41591-023-02448-8)
- Moor M, et al. Foundation models for generalist medical artificial intelligence. *Nature.* 2023;616:259–265. doi:[10.1038/s41586-023-05881-4](https://doi.org/10.1038/s41586-023-05881-4)

## 본 과정과의 연결

본 과정 5주차가 판별 모델의 기초(분할·누수·지표)를 실제 데이터로 다룬다. 이 가이드의 생성형 AI 부분은 심화 파트 G가 레슨 7개로 펼친다.

| 이 가이드의 부분 | 자세히 다루는 레슨 |
|---|---|
| 학습 방식 구분, 판별 vs 생성, 군집 점검 | [Day G1 — 바이오메디컬 AI 지도](../lessons/advanced/G-ai-biomed/day-G1.md) |
| VAE·GAN·diffusion·transformer의 원리 | [Day G2 — 생성 모델의 원리](../lessons/advanced/G-ai-biomed/day-G2.md) |
| 합성 데이터 3축 점검, 증강 누수, 연합학습·차분 프라이버시 | [Day G3 — 영상·신호·EHR의 생성형 AI](../lessons/advanced/G-ai-biomed/day-G3.md) |
| SMILES·지문·QSAR·골격 분할·적용 영역 | [Day G4 — 분자와 신약](../lessons/advanced/G-ai-biomed/day-G4.md) |
| 단백질 구조 예측, pLDDT, 단백질 언어 모델 | [Day G5 — 단백질: 구조 예측과 단백질 언어 모델](../lessons/advanced/G-ai-biomed/day-G5.md) |
| LLM 활용과 환각 검증, 임상 텍스트 | [Day G6 — LLM과 검증](../lessons/advanced/G-ai-biomed/day-G6.md) |
| 하위집단 성능·보정·설명·규제·모델 카드 | [Day G7 — 평가·편향·설명·규제와 미니 프로젝트](../lessons/advanced/G-ai-biomed/day-G7.md) |
| 기본 분류 모델과 평가 지표 | [Day 32](../lessons/week-5/day-32.md) · [Day 34](../lessons/week-5/day-34.md) |
| 참가자 단위 검증과 데이터 누수 | [Day 33](../lessons/week-5/day-33.md) |
| PCA와 heatmap(잠재 표현의 출발점) | [Day 14](../lessons/week-2/day-14.md) |
| 반복·배치·교란(군집이 배치로 생기는 문제) | [Day 11](../lessons/week-2/day-11.md) |
| 민감도 분석과 재현성 | [Day 38](../lessons/week-6/day-38.md) · [Day 39](../lessons/week-6/day-39.md) |

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
