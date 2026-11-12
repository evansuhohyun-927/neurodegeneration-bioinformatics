# Day G1 — 바이오메디컬 AI 지도: 무엇을 배우고, 무엇을 만드는가

> **주차:** 심화 파트 G — AI·생성형 AI in 바이오메디컬 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/G/G1_ai_map.ipynb` + `reports/advanced/G1_ai_map.md` (내 연구 질문 1개를 지도 위에 놓은 메모)
>
> **먼저 끝내 둘 레슨:** [Day 32 — baseline 모델](../../week-5/day-32.md), [Day 33 — 참가자 단위 검증과 데이터 누수](../../week-5/day-33.md), [Day 14 — PCA와 heatmap](../../week-2/day-14.md).

## 오늘의 목표
- 지도·비지도·자기지도 학습을 "정답표가 어디서 오는가"로 구분할 수 있다.
- 판별 모델과 생성 모델이 각각 배우는 확률을 말하고, 생성 모델로 새 가상 데이터를 뽑아 볼 수 있다.
- 군집 결과를 실루엣과 부트스트랩 안정성으로 점검하고, "군집은 발견이 아니라 가설"인 이유를 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [But what is a neural network? | Deep learning chapter 1 — 3Blue1Brown](https://www.youtube.com/watch?v=aircAruvnKk) (18:40)
- **무엇에 주목할까:** 신경망을 "숫자를 받아 숫자를 내는 큰 함수"로 보는 관점에 집중하세요. 층과 가중치가 무엇인지만 잡으면 됩니다. 이 파트의 모든 모델(VAE, GAN, transformer)이 이 함수를 어떻게 쌓고 무엇을 맞추게 하느냐의 차이일 뿐입니다.

- [Gaussian Naive Bayes, Clearly Explained!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=H3EjCKtlVog) (9:26)
- **무엇에 주목할까:** 군마다 "측정값이 어떻게 분포하는지"를 정규분포로 적어 둔 뒤 분류에 쓰는 장면을 보세요. 오늘 예시 1의 생성 모델이 바로 이 방식이고, 분포를 적어 두었기 때문에 새 값을 뽑을 수도 있다는 점이 핵심입니다.

## 개념 설명

### 학습 방식 세 가지: 정답표는 어디서 오는가

5주차에 만든 로지스틱 회귀는 **지도 학습(supervised learning)** 이었습니다. 참가자마다 "PD인가 아닌가"라는 정답(label)이 있었고, 모델은 측정값에서 그 정답을 맞히는 규칙을 배웠습니다. 문제집에 해답지가 붙어 있는 공부입니다.

**비지도 학습(unsupervised learning)** 에는 해답지가 없습니다. 환자 수백 명의 측정값만 주고 "비슷한 사람끼리 묶어 보라"(군집, clustering)거나 "정보를 몇 개 축으로 요약하라"(차원 축소, Day 14의 PCA)고 합니다. 결과는 정답과 비교해 채점할 수 없으므로, 묶음이 우연인지 아닌지 따로 점검해야 합니다.

**자기지도 학습(self-supervised learning)** 은 데이터가 스스로 문제를 냅니다. 문장의 단어 하나를 가리고 맞히게 하거나, 단백질 서열의 아미노산 하나를 가리고 맞히게 하면, 사람이 정답을 달지 않아도 문제와 해답이 무한히 생깁니다. 대규모 언어 모델(LLM)과 단백질 언어 모델(G5)이 이렇게 사전학습(pretraining)됩니다. 많은 데이터로 미리 배운 모델을 작은 의료 데이터에 맞춰 조금 더 학습시키는 것을 **전이학습(transfer learning)** 또는 미세조정(fine-tuning)이라 합니다.

### 판별 모델과 생성 모델

같은 분류 문제라도 배우는 대상이 다를 수 있습니다. **판별 모델(discriminative model)** 은 "이 측정값이면 환자일 확률" P(군 | 측정값)만 배웁니다. 경계선 하나를 긋는 데 집중합니다. 로지스틱 회귀, 랜덤 포레스트가 여기에 속합니다.

**생성 모델(generative model)** 은 "환자라면 측정값이 어떻게 생겼는가" P(측정값 | 군), 또는 군 구분 없이 데이터 전체의 분포 P(측정값)를 배웁니다. 경계선이 아니라 각 군의 지도를 그리는 셈입니다. 지도가 있으면 분류도 할 수 있고(베이즈 규칙), 지도 위에서 **새 점을 뽑을 수도** 있습니다. 이 "새 점 뽑기(sampling)"가 생성형 AI의 출발점입니다. 오늘의 가우시안 나이브 베이즈는 지도를 정규분포 몇 개로 단순하게 그렸고, 내일 배울 VAE·GAN·diffusion·transformer는 같은 일을 신경망으로 아주 복잡한 데이터(영상, 문장, 분자)에 대해 합니다.

비유하면, 판별 모델은 "이 그림이 고흐인지 아닌지" 감정하는 사람이고, 생성 모델은 고흐풍 그림을 직접 그릴 수 있는 사람입니다. 그릴 줄 아는 사람은 감정도 할 수 있지만, 감정만 잘하는 사람이 그림을 그리지는 못합니다. 대신 감정만 하는 쪽이 같은 데이터로 더 정확한 경우가 흔합니다.

### 바이오메디컬 데이터 지도

| 데이터 | 예 | 흔한 판별 과제 | 흔한 생성 과제 |
|---|---|---|---|
| 표(EHR·임상 변수) | 나이, 검사 수치, 진단 코드 | 위험 예측 | 합성 코호트(G3) |
| 신호(시계열) | ECG, 보행 가속도 | 부정맥·이상 탐지 | 신호 증강·결측 보완(G2·G3) |
| 영상 | MRI, CT, 병리 슬라이드, 피부 사진 | 병변 분류·분할 | 증강, 초해상도, 모달리티 변환(G3) |
| 분자 | SMILES, 분자 그래프 | 활성·독성 예측(QSAR, G4) | 새 분자 설계(G4) |
| 단백질 서열·구조 | 아미노산 서열, 3D 좌표 | 기능·변이 영향 예측 | 구조 예측·서열 설계(G5) |
| 텍스트 | 진료 메모, 논문 초록 | 정보 추출·분류(G6) | 요약·초안 작성(G6) |

본 과정의 PhysioNet 보행 데이터는 "신호 → 표(feature table)"로 바꾼 뒤 판별 모델을 쓴 경우였고, OSD-536은 "표"에 비지도 탐색(PCA, heatmap)을 적용한 경우였습니다.

### 군집은 가설이다

비지도 군집으로 "환자 아형(subtype)을 발견했다"는 논문을 자주 봅니다. 그런데 k-means는 **구조가 전혀 없는 데이터도 반드시 k개로 나눕니다**. 그러니 세 가지를 확인해야 합니다. (1) **k 고르기**: 실루엣 점수(silhouette, 같은 군집 안은 가깝고 다른 군집과는 먼 정도, −1~1)를 여러 k에서 비교합니다. (2) **안정성**: 환자를 다시 뽑아(부트스트랩) 군집을 반복했을 때 같은 묶음이 나오는지 adjusted Rand index(ARI, 1이면 완전 일치, 0이면 우연 수준)로 잽니다. (3) **순환 논리 피하기**: 측정값으로 군집을 나눈 뒤 **같은 측정값**으로 두 군집을 t-검정하면, 나눈 방식 자체 때문에 거의 항상 유의하게 나옵니다. 아형의 의미는 군집에 쓰지 않은 변수(예후, 독립 코호트)로만 확인할 수 있습니다.

전처리도 결과를 바꿉니다. 단위가 큰 변수가 거리를 지배하지 않도록 표준화하고, 배치(Day 11)가 군집을 만든 것은 아닌지 봅니다. 참고로 보충 단원 S7의 UPGMA 계통수는 "평균 연결(average linkage) 계층 군집"과 같은 알고리즘입니다. 묶는 대상이 서열 간 거리일 뿐입니다.

## 예시로 이해하기

> 모든 데이터는 코드 안에서 만드는 **가상 데이터**입니다. 숫자는 실제 환자 집단을 뜻하지 않습니다.

### 예시 1 — 같은 데이터, 판별 모델과 생성 모델

```python
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(0)
# 가상 데이터: 두 군의 보폭 시간(초)과 보폭 변동계수(%)
n = 200
y = rng.integers(0, 2, n)                      # 0 = 대조군, 1 = 환자군(가상)
stride = rng.normal(1.05 + 0.08 * y, 0.06)
cv = rng.normal(2.0 + 1.2 * y, 0.6)
X = np.column_stack([stride, cv])
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

disc = LogisticRegression().fit(X_tr, y_tr)   # 판별 모델: P(군 | 측정값)만 배운다
gen = GaussianNB().fit(X_tr, y_tr)            # 생성 모델: 군마다 P(측정값 | 군)을 배운다
print("판별(로지스틱) 정확도:", round(disc.score(X_te, y_te), 3))
print("생성(가우시안 NB) 정확도:", round(gen.score(X_te, y_te), 3))

# 생성 모델은 '새 가상 환자'를 뽑을 수 있다: 군 1의 평균·분산에서 샘플링
mu, var = gen.theta_[1], gen.var_[1]
fake = rng.normal(mu, np.sqrt(var), size=(5, 2))
print("군 1에서 뽑은 가상 측정값 5개:")
print(np.round(fake, 2))
print("군 1 실제 평균:", np.round(X_tr[y_tr == 1].mean(axis=0), 2))
```

출력:

```text
판별(로지스틱) 정확도: 0.767
생성(가우시안 NB) 정확도: 0.833
군 1에서 뽑은 가상 측정값 5개:
[[1.05 3.41]
 [1.2  3.46]
 [1.03 2.84]
 [1.19 3.38]
 [1.12 3.45]]
군 1 실제 평균: [1.12 3.22]
```

두 모델 모두 분류는 합니다. 평가 사례가 60명뿐이라 0.767과 0.833의 차이는 몇 명 차이이고, 어느 쪽이 낫다고 말할 근거가 되지 못합니다(Day 34). 중요한 차이는 마지막 부분입니다. 생성 모델은 군 1의 평균과 분산을 알고 있으므로 그럴듯한 가상 측정값을 새로 뽑을 수 있습니다. 로지스틱 회귀에는 그런 기능이 없습니다. 다만 이 생성 모델은 두 측정값이 서로 **독립**이라고 가정합니다("naive"). 실제로 상관된 변수라면 뽑힌 값의 조합이 비현실적일 수 있고, 이 한계를 넘는 것이 G2–G3의 주제입니다.

### 예시 2 — 학습 방식 분류해 보기 (손으로)

아래 다섯 과제가 지도·비지도·자기지도 중 무엇인지 먼저 적어 보세요.

| 과제 | 답 |
|---|---|
| 병리 슬라이드 수천 장에 병리의가 단 "종양/정상" 정답으로 분류기 만들기 | 지도 |
| 라벨 없는 뇌 MRI 1만 장에서 일부를 가리고 복원하게 해 영상 특징을 미리 배우기 | 자기지도 |
| 위 모델을 라벨 있는 MRI 200장으로 미세조정해 위축 여부 분류 | 지도(전이학습) |
| PD 환자 300명의 운동·비운동 점수로 아형 묶기 | 비지도 |
| 논문 초록 수백만 개로 다음 단어 맞히기 학습 | 자기지도 |

같은 프로젝트 안에서 단계마다 방식이 바뀌는 경우가 흔합니다. 셋째 줄처럼 "자기지도로 사전학습 → 지도로 미세조정"이 현재 의료 영상·텍스트 AI의 기본 조합입니다.

### 예시 3 — 군집 점검: 실루엣, 안정성, 그리고 순환 논리

```python
import numpy as np
from scipy import stats
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, adjusted_rand_score
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(1)
# 가상 데이터: 세 '아형'이 숨어 있는 환자 90명 × 측정 4개
centers = np.array([[0, 0, 0, 0], [3, 3, 0, 0], [0, 3, 3, 0]])
X = np.vstack([rng.normal(c, 1.0, size=(30, 4)) for c in centers])
X = StandardScaler().fit_transform(X)

print("k  실루엣  부트스트랩 안정성(ARI 평균)")
for k in range(2, 6):
    labels = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X)
    sil = silhouette_score(X, labels)
    aris = []
    for b in range(20):                       # 환자를 다시 뽑아 군집을 반복
        idx = rng.choice(len(X), len(X), replace=True)
        lb = KMeans(n_clusters=k, n_init=10, random_state=b).fit(X[idx]).predict(X)
        aris.append(adjusted_rand_score(labels, lb))
    print(f"{k}  {sil:.3f}   {np.mean(aris):.3f}")

# 순환 논리의 함정: 아무 구조 없는 잡음을 둘로 나누고, 같은 변수로 두 군을 검정
noise = rng.normal(size=(100, 1))
lab = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(noise)
t, p = stats.ttest_ind(noise[lab == 0, 0], noise[lab == 1, 0])
print(f"잡음을 군집한 뒤 t-검정 p = {p:.1e}  (구조가 없어도 '유의'하게 나온다)")
```

출력:

```text
k  실루엣  부트스트랩 안정성(ARI 평균)
2  0.281   0.663
3  0.366   0.959
4  0.334   0.759
5  0.299   0.674
잡음을 군집한 뒤 t-검정 p = 4.7e-25  (구조가 없어도 '유의'하게 나온다)
```

심어 둔 정답인 k = 3에서 실루엣이 가장 높고, 다시 뽑아도 거의 같은 묶음이 나옵니다(ARI 0.96). k = 2나 5는 실루엣도 낮고 안정성도 떨어집니다. 실제 데이터에서는 이렇게 깔끔한 봉우리가 드물어서, 여러 k가 비슷하면 "아형의 수는 데이터가 정해 주지 않는다"고 쓰는 것이 정직합니다. 마지막 줄은 구조가 전혀 없는 잡음인데도 p가 10⁻²⁵입니다. 군집이 값을 기준으로 위아래를 나눴으니 두 군의 평균이 다른 것은 당연합니다. 이 p-value는 아무것도 증명하지 않습니다.

## 직접 해보기

1. `notebooks/advanced/G/G1_ai_map.ipynb`를 만들고 예시 1과 3을 실행합니다.
2. **생성 모델의 한계 보기.** 예시 1에서 `cv`를 `stride`와 강하게 상관되게 바꿉니다(예: `cv = rng.normal(2.0 + 1.2 * y, 0.6) + 20 * (stride - 1.05)`). 그다음 실제 군 1의 두 변수 상관(`np.corrcoef`)과, 가우시안 NB로 뽑은 가상 값 200개의 상관을 비교합니다. 가상 값의 상관이 0 근처라면 그것이 "naive" 가정의 대가입니다.
3. **구조 없는 데이터 군집하기.** 예시 3의 `X`를 `rng.normal(size=(90, 4))`로 바꿔 다시 실행합니다. 실루엣과 ARI가 어떻게 달라지는지, 그래도 KMeans가 군집을 "찾아 주는지" 적습니다.
4. **내 연구 질문 지도에 놓기.** `reports/advanced/G1_ai_map.md`에 다음을 씁니다. (가) 관심 있는 질문 하나(예: "보행 신호로 PD 진행 속도를 예측할 수 있는가"), (나) 데이터 유형(위 표의 어느 줄), (다) 지도·비지도·자기지도 중 무엇, (라) 판별 과제인지 생성 과제인지, (마) 정답표는 누가 어떻게 만드는지와 그 정답표의 오류 가능성.
5. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — 표준화 없이 군집.** 나이(수십)와 혈액 지표(0.x)를 그대로 넣으면 거리가 거의 나이로만 정해집니다. `StandardScaler`를 먼저 적용하세요. 단, 예측 모델을 평가할 때와 마찬가지로 이후 다른 데이터에 적용할 거라면 표준화 기준도 학습 데이터에서만 계산합니다(Day 33).

⚠️ **흔한 오류 2 — UMAP 그림의 섬을 군집으로 착각.** UMAP·t-SNE 그림에서 떨어져 보이는 덩어리는 시각화 설정(이웃 수 등)에 따라 생기기도 사라지기도 합니다. 군집과 안정성은 원래 공간이나 PCA 공간에서 계산하고, UMAP은 보여 주는 용도로만 씁니다.

## 퀴즈

**1.** 사람이 정답을 달지 않은 단백질 서열 수억 개로, 가린 아미노산을 맞히게 학습시키는 방식은?

(a) 지도 학습 (b) 비지도 군집 (c) 자기지도 학습 (d) 강화학습

<details><summary>정답 보기</summary>

(c). 정답(가린 글자)이 데이터 자체에서 나오므로 자기지도 학습입니다. 형식은 "맞히기"라 지도 학습과 비슷하지만, 정답표를 사람이 만들지 않는다는 점이 다릅니다.

</details>

**2.** 생성 모델이 판별 모델과 달리 할 수 있는 일을 한 문장으로 쓰세요. (단답)

<details><summary>정답 보기</summary>

데이터의 분포 P(측정값) 또는 P(측정값 | 군)를 배우므로, 그 분포에서 새 가상 데이터를 뽑을 수 있습니다. 판별 모델은 P(군 | 측정값)만 배워 경계선은 알지만 데이터가 어떻게 생겼는지는 모릅니다.

</details>

**3.** 측정값 10개로 환자를 k-means 두 군집으로 나눈 뒤, 같은 10개 측정값을 군집 간 t-검정해 "모두 p < 0.001"을 보고했습니다. 무엇이 문제인가요?

(a) 표본이 작다 (b) 순환 논리라 p-value에 의미가 없다 (c) t-검정 대신 Mann–Whitney를 써야 한다 (d) 문제없다

<details><summary>정답 보기</summary>

(b). 군집이 바로 그 측정값의 차이로 나눴으므로 차이가 나는 것은 정의상 당연합니다. 예시 3처럼 구조가 없는 잡음에서도 극단적인 p가 나옵니다. 군집의 의미는 군집에 쓰지 않은 변수나 독립 데이터로 확인해야 합니다.

</details>

**4.** 실루엣 점수가 k = 3, 4, 5에서 0.21, 0.22, 0.20으로 비슷하고 부트스트랩 ARI도 모두 0.5 안팎이었습니다. 가장 정직한 보고는?

(a) 최고점인 k = 4를 아형 수로 확정한다 (b) 데이터가 뚜렷한 아형 수를 지지하지 않으며 묶음은 불안정하다고 쓴다 (c) k = 3이 해석하기 쉬우니 3으로 쓴다 (d) ARI는 보고하지 않는다

<details><summary>정답 보기</summary>

(b). 점수 차이가 작고 안정성도 중간 수준이면 특정 k를 고를 근거가 약합니다. 군집 수는 분석자의 선택이라는 점, 결과가 불안정하다는 점을 그대로 쓰고 가설로 다룹니다.

</details>

**5.** "자기지도 사전학습 → 지도 미세조정" 조합이 의료 AI에서 흔한 이유를 데이터 측면에서 설명하세요. (단답)

<details><summary>정답 보기</summary>

정답(라벨)이 달린 의료 데이터는 전문가 시간이 들어 적고 비싸지만, 라벨 없는 영상·텍스트·서열은 훨씬 많습니다. 라벨 없는 대량 데이터로 일반적인 특징을 먼저 배워 두면, 적은 라벨 데이터로도 과적합을 덜 하며 과제에 맞출 수 있습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1을 실행해 생성 모델로 가상 측정값을 뽑아 보았다.
- [ ] 상관된 변수에서 naive 가정의 한계를 확인했다.
- [ ] 구조 없는 데이터에서도 k-means가 군집을 만든다는 것을 실루엣·ARI로 확인했다.
- [ ] `reports/advanced/G1_ai_map.md`에 내 질문의 데이터 유형·학습 방식·과제 유형·정답표 출처를 적었다.

## 더 읽을거리
- Rajpurkar P, et al. AI in health and medicine. *Nat Med.* 2022;28:31–38. doi:[10.1038/s41591-021-01614-0](https://doi.org/10.1038/s41591-021-01614-0)
- Ching T, et al. Opportunities and obstacles for deep learning in biology and medicine. *J R Soc Interface.* 2018;15:20170387. doi:[10.1098/rsif.2017.0387](https://doi.org/10.1098/rsif.2017.0387)
- scikit-learn 사용자 안내서, 군집(Clustering): <https://scikit-learn.org/stable/modules/clustering.html>
- 이 파트의 배경 도서(편집서): Khamparia A, Gupta D (eds.). *Generative Artificial Intelligence for Biomedical and Smart Health Informatics.* Wiley–IEEE Press, 2025. [출판사 페이지](https://www.wiley.com/en-us/Generative+Artificial+Intelligence+for+Biomedical+and+Smart+Health+Informatics-p-9781394280704) · Sharma M, Sharma DK, Agarwal D, Al Harthy K (eds.). *Bioinformatics and Beyond: AI Applications in Healthcare.* CRC Press, 2025. [출판사 페이지](https://www.routledge.com/Bioinformatics-and-Beyond-AI-Applications-in-Healthcare/Sharma-Sharma-Agarwal-Harthy/p/book/9781032832425)

---
[← 이전: 코스 지도](../../../README.md) · [코스 지도](../../../README.md) · [다음 →](day-G2.md)
