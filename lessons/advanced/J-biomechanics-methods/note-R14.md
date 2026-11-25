# R14 — Analysis of Biomechanical Waveform Data: 곡선 전체를 PCA와 FDA로 줄이고 비교하기

> **교재 노트** · 심화 파트 J — 생체역학 연구방법 · **교재:** [RM] 14장 pp.317–338 · **읽는 시간:** 50–60분 · **함께 읽기:** [T09 신호처리의 이론](../I-gait-theory/note-T09.md), [Day I11](../I-gait/day-I11.md)

## 이 노트로 이해할 것
- 보행 파형(waveform) 자료의 세 가지 성질(고차원, 상관 구조, 변동)과, 봉우리 같은 이산 지표만 뽑을 때 잃는 것.
- principal component analysis(PCA, 주성분 분석)의 계산 순서: 자료 행렬 → 공분산 행렬 → 대각화 → loading vector와 PC score.
- 주성분을 몇 개 남길지 정하는 규칙과, 남긴 주성분으로 원래 파형을 되살려 보는 방법.
- loading vector와 "평균 ± 1 SD" 재구성 파형으로 주성분의 뜻을 읽는 법.
- functional data analysis(FDA, 함수 자료 분석)의 네 단계: 평활 함수 만들기, registration, functional PCA, 결과 제시.
- PCA와 FDA가 입력 자료의 형태, 전처리, 접근성에서 어떻게 다른가.

## 🎬 함께 보면 좋은 영상
- [StatQuest: Principal Component Analysis (PCA), Step-by-Step — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=FgakZw6K1QQ)
- [What is functional data analysis? — Very Normal](https://www.youtube.com/watch?v=U2TvHLA18lo)
- [ISBS 2020: Stuart A. McErlain-Naylor A COMPARISON OF DISCRETE + CONTINUOUS BIOMECHANICAL ANALYSIS .. — ISBS](https://www.youtube.com/watch?v=HjivOkeGeiw)
- **무엇에 주목할까:** 주성분 분석의 계산 과정을 단계별로 익히고, 함수형 자료 분석이 무엇인지 짧게 확인합니다. 마지막 발표에서는 생체역학 자료의 이산 분석과 연속 분석이 어떻게 비교되는지를 봅니다.

## 핵심 질문
1. 파형에서 최댓값 하나만 뽑아 비교하면 무엇이 문제인가?
2. 시점 101개짜리 곡선을 숫자 두세 개로 줄여도 되는 근거는 무엇인가?
3. PC score의 군 간 차이가 유의할 때, 그것이 파형의 어떤 모양 차이인지 어떻게 알아내는가?
4. 평활화 강도(λ)는 누가, 어떻게 정하는가?
5. 곡선들의 봉우리 시점을 맞추는 landmark registration은 언제 해야 하고 언제 하면 안 되는가?
6. 내 자료에는 PCA와 FDA 가운데 무엇이 맞는가?

## 교재 절 지도

대문자 제목은 큰 절, 나머지는 소절(가운뎃점을 붙인 것은 그 아래 단계)입니다. 쪽은 인쇄 쪽 번호이고, p.338은 빈 쪽입니다.

| 교재 절 (원제) | 쪽 | 이 노트 |
|---|---|---|
| (도입부, 제목 없음) | 317 | 본문 1 |
| BIOMECHANICAL WAVEFORM DATA | 317–319 | 본문 1 |
| PRINCIPAL COMPONENT ANALYSIS | 319 | 본문 2 |
| Calculating Principal Components | 320–321 | 본문 3 |
| · PC Scores | 321 | 본문 3 |
| · PC Loading Vectors | 322 | 본문 3 |
| Selecting the Number of Principal Components to Retain | 322–323 | 본문 4 |
| Estimating the Waveform Data From Principal Components | 323–324 | 본문 4 |
| Interpreting the Principal Components | 324–326 | 본문 5 |
| Hypothesis Testing Using Principal Components | 326–327 | 본문 6 |
| From the Scientific Literature (Smith 외 2004, 상자글) | 326 | 본문 6 |
| FUNCTIONAL DATA ANALYSIS | 327 | 본문 7 |
| Step 1: Derivation of Smooth Functions | 327–328 | 본문 7 |
| · Smoothing Using Basis Functions | 328–330 | 본문 8 |
| · Choosing Basis Functions | 330 | 본문 8 |
| Step 2: Registration of Data | 330–331 | 본문 9 |
| From the Scientific Literature (Ryan 외 2006, 상자글) | 330 | 본문 9 |
| Step 3: Functional Principal Component Analysis | 331–332 | 본문 10 |
| · Calculating Functional Principal Components | 332 | 본문 10 |
| · Smoothing of Functional Principal Components | 332 | 본문 10 |
| Step 4: Presentation and Analysis of Results | 332 | 본문 11 |
| · Analyzing Functional Principal Component Scores | 333 | 본문 11 |
| · Analyzing Coordination Using Bivariate Functional Principal Components | 333–335 | 본문 11 |
| · Additional Resources for Functional Data Analysis | 336 | 더 읽을거리 |
| COMPARISON OF PCA AND FDA | 336 | 본문 12 |
| SUMMARY | 336 | 본문 12 |
| SUGGESTED READINGS | 336–337 | 더 읽을거리 |

## 본문

**추가 설명:** 인쇄본의 식 네 곳은 본문의 설명과 표준 정의에 맞추어 고쳐 적었습니다. 식 14.5(p.320)의 분모에는 제곱근이 없고, 식 14.10(p.322)의 마지막 항은 `x_1p`이며, 식 14.21(p.329)의 적분 안에는 제곱 표시가 없고, 식 14.22(p.332)에는 N으로 나누는 표시가 없습니다. 이 노트에서는 각각 `√(s_ii·s_jj)`, `x_ip`, `[D²y]²`, `1/N`로 적었습니다.

### 1. 파형 자료의 성질과 이산 지표의 한계
생체역학 자료는 대부분 시간에 따른 곡선(각도, 모멘트, 힘)이거나 angle-angle·phase-plane 같은 협응 곡선입니다. 모두 고차원이고 곡선으로 나타낼 수 있습니다. 이런 자료를 분석하는 표준 기법은 아직 없으며, 대부분의 분석은 통계 검정 전에 자료를 더 작은 형태로 줄이는 단계가 필요합니다([RM] p.317).

교재의 예제는 무릎 골관절염(OA) 50명과 비OA 60명의 보행주기 한 번의 무릎 굴곡각입니다([RM] 그림 14.1, p.318). 여기서 세 가지 성질이 보입니다. (1) 양이 많습니다. 110개 파형 × 101개 시점(0–100%) = 11,110개 값이어서 multidimensional이라고 부릅니다. (2) 한 값은 같은 파형의 이웃 값, 다른 파형의 값과 관련됩니다. 이 관련의 세기가 collinearity, 곧 자료의 상관 구조입니다. (3) 변동이 큽니다. 군 안의 대상자 간 변동(subject-to-subject)과 군 간 변동(between-group)이 섞여 있고, 보통 관심사는 뒤쪽입니다([RM] pp.317–318).

전통적인 방법은 최댓값·최솟값 같은 **이산 지표**(discrete parameter)를 뽑는 것입니다. 교재가 드는 문제는 셋입니다([RM] p.318). 첫째, 시간 정보를 너무 많이 버립니다(Donoghue 외 2008; Donà 외 2009). 둘째, 연구마다 지표 정의(구간 평균인지 특정 사건 시점의 값인지)가 달라 결론이 엇갈리는 원인으로 지목됩니다(O'Connor & Bottum 2009). 셋째, 병적 움직임에서는 지표를 정의하기 어렵습니다. 무릎 내전 모멘트는 흔히 봉우리가 둘이지만 봉우리가 뚜렷하지 않거나 한쪽 봉우리가 없는 파형도 있고([RM] 그림 14.2, p.319), Hurwitz 외(2002)는 무릎 OA 대상자의 52%, 무증상 대상자의 29%에서 둘째 봉우리가 뚜렷하지 않았다고 보고했습니다.

파형 전체를 다루는 기법은 여럿이고(factor analysis, correspondence analysis, Fourier analysis, fuzzy·fractal analysis, wavelet transform, neural network 등) 비교는 Chau(2001a, 2001b)에 있습니다. 이 장은 PCA와 FDA 둘만 자세히 다룹니다([RM] p.318).

### 2. PCA의 발상: 자료에서 뽑은 basis function
principal component analysis(PCA)는 서로 상관된 여러 변수를 그보다 적은 수의 상관 없는 변수(principal component)로 바꾸는 직교 변환입니다. singular value decomposition(SVD)이나 Karhunen-Loève expansion은 PCA와 같은 것으로 볼 수 있고, 자료의 구조나 특정 사건의 중요도를 미리 가정하지 않습니다([RM] pp.318–319). 교재는 Fourier 분석에 빗댑니다([RM] p.319).

| | Fourier 분석 | PCA |
|---|---|---|
| basis function | 미리 정해진 사인파 | 파형 자료의 변동에서 계산해 낸 것(= principal component) |
| 파형 하나를 나타내는 수 | Fourier 계수 | PC score |

사인파가 원자료에 잘 맞지 않는 경우가 많으므로 자료 자신에게서 basis를 얻는다는 것이 요점입니다. PCA의 강점은 (1) 주성분들이 서로 독립이고, (2) 소수의 주성분으로 원파형을 충분히 나타낼 수 있으며, (3) score를 가설 검정·discriminant analysis·cluster analysis의 종속 변수로 쓸 수 있다는 것입니다([RM] p.319).

### 3. 주성분 계산: 공분산 행렬, PC score, loading vector
자료 행렬 X는 행이 대상자(파형 하나), 열이 시점입니다. 예제에서는 n = 110, p = 101입니다. PCA는 X의 **열**에 대해 수행하므로 상관된 변수는 p개의 시점입니다([RM] 식 14.1–14.10, pp.320–322).

```
X : n × p (행 = 파형 n개, 열 = 시점 p개),   S : X의 열들 사이의 p × p 공분산 행렬
s_ii = Σ(k=1..n) (x_ki − x̄_i)² / (n − 1)                  시점 i의 분산        (식 14.3)
s_ij = Σ(k=1..n) (x_ki − x̄_i)(x_kj − x̄_j) / (n − 1)        시점 i, j의 공분산   (식 14.4)
r_ij = s_ij / √(s_ii · s_jj)                               상관계수            (식 14.5)

Uᵗ S U = D          U의 열 = S의 eigenvector = loading vector                  (식 14.6)
                    D = 대각 행렬, 대각 원소 λ_i = eigenvalue = 주성분의 변동량
Z = [X − X̄] U       Z (n × r)의 각 열 = 주성분, 그 원소 = PC score             (식 14.7)
tr(S) = tr(D),      PC_i의 변동 비율 = λ_i / tr(S) = λ_i / Σλ                  (식 14.8–14.9)
z_1i = (x_i1 − x̄_1)·u_11 + (x_i2 − x̄_2)·u_21 + … + (x_ip − x̄_p)·u_p1         (식 14.10, 대상자 i의 PC1 score)
```

- 단위가 서로 다른 변수라면 공분산 행렬 대신 상관 행렬(열을 평균 0, 분산 1로 맞춘 것)을 권합니다([RM] p.320 각주 1). 공분산 행렬은 X의 평균과 무관하므로 모호함을 없애려고 평균을 빼고 변환합니다([RM] p.320 각주 2).
- 주성분의 최대 개수는 D의 0이 아닌 대각 원소 수이고, n과 p 가운데 작은 쪽, 곧 S의 rank r입니다. 예제에서는 101개입니다([RM] p.320).
- **추가 설명:** 평균을 뺀 n개 행으로 만든 공분산 행렬의 rank는 최대 n − 1이므로 엄밀한 상한은 min(n − 1, p)입니다. 예제에서는 어느 쪽으로 세어도 101입니다.
- 주성분은 설명하는 분산이 큰 순서로 정렬되고, 둘째는 첫째와 직교한다는 조건 아래 분산이 최대입니다. PCA는 분산을 보존하므로 전체 변동(S의 대각 원소 합, trace)이 그대로 주성분에 담깁니다([RM] p.321).
- 예제에서는 PC1이 61.5%, PC2가 19.9%, PC3이 12.5%를 설명해 3개의 누적이 93.9%이고, 5개까지 더하면 98.7%입니다([RM] 표 14.1, p.321).

**PC score**는 대상자마다 주성분 하나당 하나씩 나오는, 원자료의 선형 결합입니다. score 산점도에서는 원파형에서보다 군 분리가 뚜렷하고, 분리는 주로 PC1–PC2 평면에서 보입니다. PC3·PC4는 군 차이와 무관한 변동입니다([RM] p.321, 그림 14.3). 군 평균 score의 unpaired t-test(Holm-Sidak 보정) 결과는 PC1 p < 1E−4, PC2 p < 1E−12, PC3 p = 0.55, PC4 p = 0.08입니다([RM] 그림 14.4, p.322).

**loading vector**는 원파형과 길이가 같은 또 하나의 파형이어서 보행주기 축 위에 그릴 수 있습니다([RM] 그림 14.5, p.322). score는 평균을 뺀 파형에 이 계수를 곱해 더한 값이므로(식 14.10), 계수가 0에 가까운 시점은 score에 거의 기여하지 않고, 계수의 크기가 큰 구간이 그 주성분에서 중요합니다. 예제의 PC2는 초기 입각기(약 15%)보다 후기 입각기(약 40%)와 초기 유각기(약 70%)를 더 강조합니다([RM] p.322).

### 4. 몇 개를 남길 것인가, 그리고 파형 되살리기
변동의 대부분이 처음 몇 개 주성분에 담기므로 나머지는 중요한 정보를 잃지 않고 버릴 수 있는 경우가 많습니다. 정보가 있는 변동과 잡음의 경계를 찾는 stopping rule 가운데 가장 단순한 것은 남긴 주성분의 누적 변동 비율이 보통 90–95%가 되는 곳에서 끊는 것입니다. **scree test**는 eigenvalue를 큰 순서로 그렸을 때 절벽 모양 곡선이 꺾이는 곳(elbow)을 경계로 삼습니다. 더 많은 규칙은 Jackson(1991)에 있습니다([RM] pp.322–323, 그림 14.6).

다른 관점은 "남긴 주성분이 원파형을 얼마나 잘 되살리는가"입니다. U는 직교 행렬이라 역행렬이 전치 행렬과 같으므로 식 14.7을 뒤집을 수 있습니다([RM] 식 14.11–14.14, pp.323–324).

```
X = Z Uᵗ + X̄                                          (식 14.11)
x_i = z_i1·u_1 + z_i2·u_2 + … + z_ir·u_r + x̄          (식 14.12, 파형 하나)
x_i* = z_i1·u_1 + x̄                                   (식 14.13, PC1만 쓴 추정)
SSres = Σ (x − x*)²                                   (식 14.14, 잔차 제곱합)
```

주성분을 전부 쓰면 원자료가 그대로 나오고, 처음 몇 개만 써도 쓸 만한 추정이 됩니다. Fourier harmonic 몇 개로 시계열을 되살리는 것과 같습니다. 교재의 예에서 PC1만 썼을 때는 비OA 대상자의 추정이 OA 대상자보다 나았지만, 3개를 쓰면 두 대상자 모두 매우 잘 맞았습니다. SSres는 주성분이 원자료를 얼마나 잘 대표하는지의 척도입니다([RM] pp.323–324, 그림 14.7).

### 5. 주성분 해석하기
score 차이가 유의해도 그것이 파형의 어떤 특징인지 모르면 해석할 수 없습니다. 각 주성분은 파형의 특정한 모양 변화에 대응하므로 세 가지 도구를 함께 씁니다([RM] p.324, 그림 14.8, p.325).

- **loading vector에 0선 긋기:** 양의 score가 평균 파형에 더하는 쪽인지 빼는 쪽인지 구간별로 보입니다.
- **극단 score의 실제 파형:** score의 5·95 백분위 대상자의 파형을 고릅니다(Deluzio & Astephen 2007). 단 고른 두 파형은 다른 주성분에서도 다를 수 있습니다(교재의 3번·4번 파형은 PC1과 PC2가 모두 다름). score 산점도를 보며 고르면 낫습니다.
- **한 주성분만으로 재구성:** 평균 파형에 loading vector의 배수를 더하고 뺍니다. 배수로는 해당 score의 표준편차가 편리합니다([RM] 식 14.15, p.324).

```
x_H = x̄ + SD(z_i) × u_i          x_L = x̄ − SD(z_i) × u_i
```

| 주성분 | loading vector | 재구성 파형의 차이 | 해석 | 군 차이 |
|---|---|---|---|---|
| PC1 | 계수가 전부 양수 → score는 파형의 가중 평균 | 위아래 평행 이동 | 파형의 전체 평균(크기) | 있음 |
| PC2 | 양·음이 섞이고 봉우리가 원파형의 봉우리와 겹침 | 유각기(60–80%)는 높고 후기 입각기(40%)와 후기 유각기–초기 입각기(90–10%)는 낮음 ↔ 평평한 파형 | 보행주기 전체의 가동 범위 | 가장 큼(OA군이 유의하게 작음) |
| PC3 | 양·음이 섞이지만 봉우리가 원파형과 어긋남 | 위상 이동(낮은 score의 파형이 앞섬) | 시간적 이동 | 없음 |

표의 내용은 [RM] pp.324–325의 설명입니다. 가장 큰 변동원인 PC1이 파형의 전체 평균 크기인 경우가 매우 흔합니다([RM] p.324). 시간적 이동은 파형 자료에 흔한데 PCA로 따로 떼어낼 수 있고, PC1·PC2의 군 차이는 이 위상 이동과 독립입니다([RM] p.325). 교재의 정리는 ±SD 재구성이 각 주성분의 모양 변화를 떼어 보는 가장 좋은 방법이고, 극단 score의 개별 파형에는 보통 다른 주성분의 변동이 섞여 있다는 것입니다([RM] p.326).

### 6. PC score로 가설 검정하기
score가 검정에 알맞은 이유는 셋입니다. 주성분이 원자료의 분산을 최대로 설명하므로 실험 조건에 따른 차이가 변동의 특징으로 드러날 것이고, 주성분끼리 직교하므로 서로 독립된 특징을 검정하게 되며, score는 대개 정규 분포를 따라 모수적 기법을 쓸 수 있습니다([RM] p.326). 절차는 모든 대상자·조건의 파형을 한 행렬에 넣어 PCA를 하고, 관심 있는 score 열마다 검정하는 것입니다. 예제에서는 평균 관절각(PC1)과 가동 범위(PC2)에서 두 군이 유의하게 달랐습니다. repeated-measures ANOVA(Landry 외 2007)나 discriminant analysis(Deluzio & Astephen 2007)로 넓혀도 접근은 같습니다([RM] pp.326–327).

**문헌 사례(Smith 외 2004).** 무릎 인공관절 전치환술 전의 무릎 굴곡 모멘트 파형이 수술 뒤 무릎 앞쪽 통증과 관련되는지 본 전향적 연구입니다. 주성분 4개의 score에 cluster analysis를 적용해 biphasic, flexor, extensor 세 패턴을 찾았습니다. 대조군의 95%가 biphasic이었고 수술 전 패턴이 수술 뒤 패턴과 관련되었습니다. 통증 유무(logistic regression)와 정도(multiple linear regression) 모두 가장 좋은 예측 변수는 PC2 score(초기 중간 입각기 굴곡 모멘트의 크기로 해석)였고, 같은 구간의 최댓값 같은 통상적 지표보다 나았습니다([RM] p.326).

### 7. FDA의 발상과 네 단계
PCA가 파형을 개별 시점 값의 나열로 다룬다면, functional data analysis(FDA)는 측정값의 열 전체를 **함수 하나**로 봅니다(Ryan 외 2006; 용어는 Ramsay & Dalzell 1991). 전제는 세 가지입니다. 자료는 바탕 함수 y_i(t)를 여러 시점에서 찍은 것이고(시계열이 아닌 phase-plane 곡선에도 적용 가능), 이웃한 값이 크게 다르지 않을 만큼 매끄러우며, 도함수도 여러 차수까지 매끄럽습니다([RM] p.327).

```
1. 자료 표현: 매끄러운 함수 만들기
2. registration: 시간 정규화 또는 landmark registration (선택)
3. functional principal component analysis
4. 결과 제시와 분석                                   ([RM] p.327)

y_ij = y_i(t_ij) + ε_ij      신호(추정할 매끄러운 함수) + 잡음            (식 14.16)
```

t_ij는 대상자 i(1..N)의 j번째(1..n_i) 측정 시점입니다. 측정 횟수와 시점은 대상자마다 달라도 됩니다. 교재는 설명을 위해 n_i = n으로 두지만 이는 FDA의 요구 조건이 아닙니다([RM] p.327). 잡음을 줄이는 데는 polynomial smoothing, 디지털 필터, general cross-validatory(GCV) spline 같은 spline basis 평활화가 쓰여 왔고, basis function 전개는 더 유연하며 자료를 함수로 분석하는 일로 그대로 이어집니다([RM] pp.327–328).

### 8. Step 1: basis function으로 평활하기
미리 정한 basis function K개의 선형 결합으로 함수를 근사하고, 계수는 잔차 제곱합을 최소화해 구합니다([RM] 식 14.17–14.20, p.328).

```
y_i(t) = Σ(k=1..K) c_ik · φ_k(t)                                          (식 14.17)
y_i = Φ c_i,   Y = Φ C       Φ : n × K,  c_i : 길이 K,  Y : n × N,  C : K × N   (식 14.18–14.19)
SSE = Σ(j=1..n) [ y_ij − Σ(k) c_ik·φ_k(t_ij) ]² = (y_i − Φc_i)′(y_i − Φc_i)   (식 14.20)
```

K가 클수록 보간에 가까워지고(K = n이면 평활 없이 보간), K가 작을수록 매끄럽지만 잔차가 커질 수 있습니다. K를 최적화하는 일은 복잡하고, basis를 넣고 빼는 것만으로는 평활 정도를 조절하기 어렵습니다([RM] p.328). **smoothing spline**은 K = n으로 두고 곡률에 벌점을 주어 과적합을 누릅니다. 곡률은 이차 도함수 제곱의 적분으로 잽니다(Green & Silverman 1994)([RM] p.328, 식 14.21, p.329).

```
PENSSE = (y_i − Φc_i)′(y_i − Φc_i)  +  λ · ∫ [D²y_i(t)]² dt
              적합(최소제곱) 항            roughness penalty 항,  λ = smoothing parameter
```

- λ가 커지면 매끄러움을, 작아지면 자료 적합을 더 중시합니다. λ = 0이면 최소제곱 적합입니다. 이 λ는 PCA의 eigenvalue λ_i와 무관한 기호입니다([RM] pp.328–329).
- λ는 값을 바꿔 가며 주관적으로 고르거나 자동 방법에 맡깁니다. cross-validation과 generalized cross-validation(Craven & Wahba 1979)은 λ를 너무 작게 잡는다는(덜 평활한다는) 비판이 있고(Hastie & Tibshirani 1990), generalized maximum likelihood(Wahba 1985)가 일부 보완합니다. 권고는 자동 방법을 **출발점**으로만 쓰고 최종 선택은 주관적으로 하는 것입니다(Ramsay & Silverman 2002)([RM] p.329).
- 달리기 중 발목 내·외전각에 λ를 1 × 10⁻⁹, 1 × 10⁻⁶, 1 × 10⁻⁴으로 준 예에서, 모두 매우 작은 값인데도 조금만 바꾸면 훨씬 매끄러워집니다([RM] 그림 14.9, p.329). 초당 수백–수천 개를 측정해 K = n이 계산상 어려우면 더 적은 basis로도 roughness penalty 방식을 쓸 수 있습니다([RM] p.330).

basis는 자료의 특징에 맞춰 고르며 모든 자료에 맞는 basis는 없습니다. 목표는 비교적 적은 K로 가장 좋은 근사를 얻는 것입니다([RM] pp.328, 330).

| 자료의 특징 | 알맞은 basis ([RM] p.330) |
|---|---|
| 주기적인 파형 | Fourier basis |
| 국소적으로 매끄럽고 주기적이지 않음 | B-spline (knot에서 이어 붙인 다항식 조각. 국소 거동의 변화를 담을 수 있어 운동학 자료에 유용) |
| 잡음이 있지만 정보가 담긴 spike를 뭉개면 안 됨 | wavelet basis |

### 9. Step 2: registration
평활한 곡선들이 전체 모양은 비슷해도 최댓값·최솟값·0 교차 같은 특징의 시점이나 위치가 기록마다 다를 수 있습니다. **landmark registration**은 눈에 띄는 특징의 위치를 찾아 그 특징들이 같은 곳에 오도록 각 곡선을 옮깁니다([RM] pp.330–331). 분명한 특징이 있는 곡선에서는 훨씬 의미 있는 횡단 평균이 나오고 시점별 변동도 크게 줄 수 있습니다. 정렬하지 않고 ensemble average를 내면 중요한 변동원이 지워질 수 있습니다. 예를 들어 Godwin 외(2009)는 들기 작업의 모멘트 곡선을 상자 집기·놓기에 해당하는 변곡점 두 개로 정렬(double registration)했습니다. 그러나 어떤 곡선에는 landmark가 없거나 시점이 모호하고, 부적절한 registration은 의도하지 않은 효과를 냅니다(Clarkson 외 2005). 그래서 선택 단계이며, 원치 않는 시간적·공간적 변동을 없앨 근거가 있을 때만 사례별로 판단합니다([RM] p.331).

**문헌 사례(Ryan 외 2006).** 아동의 수직 점프 무릎각을 발달 단계(1 initial, 2 elementary, 3 mature)별로 비교하고, landmark registration 전후의 FPC를 견주었습니다. registration 뒤 FPC1은 웅크린 최저점의 무릎각 변동을 그 시점과 무관하게 더 정확히 나타냈습니다. FPC2는 16.8%를 설명했고(registration으로 늘어남) 두 경우 모두 무릎 굴곡 범위와 관련되었지만 +와 − 곡선의 위치가 서로 바뀌었습니다. FDA에서 가끔 생기는 일이므로 부호가 아니라 높은·낮은 score 곡선의 **모양**을 봐야 합니다. FPC3(7.9%)은 반동 동작 중 무릎 굴곡의 속도·범위·매끄러움을 나타냈습니다. FPC1 score의 범위는 1단계에서 3단계로 갈수록 줄었고, FPC2에는 뚜렷한 경향이 없었으며, FPC3 score는 단계에 따라 뚜렷이 커졌습니다. 저자들은 성숙한 점프일수록 stretch-shortening cycle을 더 효과적으로 쓴다고 결론지었습니다([RM] p.330).

### 10. Step 3: functional principal component analysis (FPCA)
FPCA는 다변량 PCA를 함수 영역으로 넓힌 것으로, eigenvector 대신 **eigenfunction**이 주성분이 됩니다. FPC가 원래 관측과 같은 영역의 함수라서 생체역학적으로 뚜렷하게 해석된다는 것이 큰 장점입니다. 몇 개를 쓸지는 scree plot으로 판단하며, 교재의 예에서는 2–3개가 95% 넘게 설명해 3개 넘게 볼 이유가 거의 없습니다([RM] pp.331–332, 그림 14.10–14.11). 계산은 공분산 **행렬** 대신 공분산 **함수**를 직교 분해한다는 점만 다르고 구조는 PCA와 같습니다([RM] p.332).

```
ȳ(t)   = (1/N) · Σ(i=1..N) y_i(t)                              평균 함수     (식 14.22)
v(s,t) = N⁻¹ · Σ(i=1..N) [y_i(s) − ȳ(s)]·[y_i(t) − ȳ(t)]       공분산 함수   (식 14.23)
∫ v(s,t)·ξ_r(t) dt = ρ_r·ξ_r(s)        ξ_r = r번째 FPC,  ρ_r = eigenvalue   (식 14.24)
r번째 FPC의 변동 비율 = ρ_r / Σρ_r                                           (식 14.25)
f_ir = ∫ ξ_r(t)·[y_i(t) − ȳ(t)] dt     대상자 i의 r번째 FPC score            (식 14.26)
```

**FPC의 평활.** 원자료를 평활한 뒤 FPC를 뽑아도 FPC가 매끄럽다는 보장은 없습니다. 다른 길은 원자료로 작업하면서 FPC 추출 과정에 평활을 넣는 것입니다. B-spline을 쓰면 어느 쪽이든 보통 큰 차이가 없지만 원자료에 잡음이 많으면 따져 볼 문제입니다. 일반 원칙은 평활을 최종 산출물이 계산될 때까지 미루는 것입니다. 평균 곡선이 관심사면 원자료를, FPC가 관심사면 추출된 FPC를 평활합니다([RM] p.332). 그림 14.12(p.333)의 세 패널이 각각 어떤 λ 값인지는 캡션에 적혀 있지 않습니다.

### 11. Step 4: 결과 제시와 분석
Ramsay & Silverman(2005)의 권고는 ensemble 평균 곡선과, 거기에 각 FPC의 적당한 배수를 더하고 뺀 곡선 `ȳ(t) ± c × ξ_r(t)`를 함께 그리는 것입니다. 달리기 입각기의 다리 내·외전각 예(Coffey 외 2011)에서 FPC1의 높은 score는 입각기 내내 평균보다 낮은 각도, FPC2의 높은 score는 heel strike에서 더 작은 각도, FPC3의 높은 score는 더 큰 가동 범위를 뜻합니다([RM] p.332, 그림 14.13, p.334).

**score 분석.** FPC score에는 ANOVA와 effect size를 적용할 수 있습니다(Donoghue 외 2008). 달리기 입각기 발목 배측굴곡의 FPC1 score를 아킬레스건염 대상자의 맞춤 orthotics 착용, 미착용, 같은 대상자의 다치지 않은 다리(대조)로 비교했을 때 미착용 조건과 대조 사이에 유의한 차이와 큰 effect size가 있었습니다(그림에 p = 0.033, d = 0.86 표기)([RM] p.333, 그림 14.14, p.334). Godwin 외(2009)의 수정된 functional ANOVA, Epifanio 외(2008)의 sit-to-stand 정상·병적 패턴 구분도 소개됩니다. FPC1 score가 가장 높은 대상자(17번)의 곡선은 "평균 + FPC1"을, 가장 낮은 대상자(28번)의 곡선은 "평균 − FPC1"을 닮아, 결과가 대상자의 실제 거동과 바로 이어집니다([RM] p.333, 그림 14.15, p.335).

**bivariate FPCA로 협응 보기.** 협응 분석은 둘 이상의 함수를 동시에 다뤄야 합니다. Harrison 외(2007)는 수직 점프의 hip–knee angle-angle 패턴에 bivariate FPCA를 적용했습니다. 두 평균 함수를 시점마다 짝지어 평균 hip–knee 곡선을 그리고, 곡선의 각 점에 아래 좌표를 향하는 화살표를 붙입니다(c는 보기 좋게 고른 가중치). 교재 그림의 첫째 bivariate FPC는 전체 변동의 66.96%를 설명합니다([RM] pp.333–335, 그림 14.16).

```
ξ_r(t) = [ ξ_r^HIP(t), ξ_r^KNEE(t) ]                         각 성분이 FPC의 벡터
화살표 끝:  [ ȳ^HIP(t) + c·ξ_r^HIP(t),  ȳ^KNEE(t) + c·ξ_r^KNEE(t) ]
```

### 12. PCA와 FDA의 비교, 그리고 요약
두 방법의 목적은 파형들이 서로 어떻게 다른지 드러내는 특징을 뽑는 것으로 같습니다. 핵심 차이는 주성분을 계산하기 **전의 자료 표현**입니다. 아래 표는 [RM] p.336의 설명을 정리한 것입니다.

| | PCA | FDA |
|---|---|---|
| 성격 | 전처리(평활, 필터, registration, 시간 정규화) 뒤에 하는 자료 축소 기법 | 파형의 추정·분석과 주성분 축소를 아우르는 통계 기법 모음 |
| 입력 | 실제 관측값 또는 보간한 값 | 함수(basis function 계수 묶음) |
| 자료점 | 모든 파형이 같은 수의 점을 갖고 열마다 시간이 맞아야 함 | 측정 시점과 점의 수가 파형마다 달라도 됨 |
| 평활·registration | 미리 따로 해야 함 | 분석 과정에 포함. 도함수·phase-plane·이변량 함수도 쉽게 포함 |
| 접근성 | SPSS, Minitab 같은 널리 쓰이는 소프트웨어로 가능 | Matlab, S-Plus, R 프로그래밍이 필요해 접근성이 낮음 |

교재의 요약은 세 가지입니다. 두 방법 모두 파형 전체의 중요한 정보를 지키면서 자료를 줄이고, 파형의 모양·패턴 차이로 대상자 군을 구분할 수 있으며, score에 표준 통계 절차를 적용하면 그 차이를 객관적으로 검정할 수 있습니다([RM] p.336).

## 주요 용어

| 용어 | 한국어 | 뜻 |
|---|---|---|
| discrete parameter | 이산 지표 | 최댓값, 특정 시점 값처럼 파형에서 뽑은 숫자 하나 |
| principal component (PC) | 주성분 | 상관된 변수를 직교 변환해 얻은 상관 없는 새 변수 |
| eigenvalue (λ_i) | 고윳값 | 각 주성분이 설명하는 변동량 |
| loading vector | 적재 벡터 | S의 eigenvector. 원파형과 길이가 같은 가중 파형 |
| PC score | 주성분 점수 | 평균을 뺀 파형과 loading vector의 선형 결합 값 |
| scree test | 스크리 검사 | eigenvalue 그림의 꺾이는 곳에서 주성분 수를 정하는 방법 |
| functional data analysis (FDA) | 함수 자료 분석 | 측정값 열 전체를 함수 하나로 보고 분석하는 기법 모음 |
| basis function | 기저 함수 | 선형 결합해 곡선을 나타내는 기본 함수(Fourier, B-spline, wavelet 등) |
| roughness penalty / λ | 거칠기 벌점 / 평활 모수 | 이차 도함수 제곱의 적분 / 적합과 매끄러움 사이의 무게 |
| landmark registration | 표지점 정합 | 곡선의 특징점이 같은 위치에 오도록 곡선을 옮기는 일 |
| eigenfunction / FPC | 고유함수 / 함수 주성분 | FPCA에서 주성분 구실을 하는 함수 |

## 흔한 오해
- **"PCA를 하면 정보가 줄어든다"** → 변환 자체는 분산을 보존합니다(tr(S) = tr(D)). 정보가 줄어드는 것은 주성분 일부를 버릴 때입니다([RM] pp.321–323).
- **"PC1이 가장 중요한 군 차이를 담는다"** → PC1은 전체 변동이 가장 큰 방향일 뿐입니다. 예제에서 군 차이가 가장 큰 것은 PC2였고, 변동의 12.5%를 차지하는 PC3에는 군 차이가 없었습니다([RM] pp.321–325).
- **"score가 높은 대상자와 낮은 대상자의 파형을 비교하면 그 주성분의 뜻이 보인다"** → 두 파형은 다른 주성분에서도 다를 수 있습니다. ±SD 재구성이 그 주성분만 떼어 보여 줍니다([RM] pp.324, 326).
- **"FPC의 +와 −는 고정된 방향을 뜻한다"** → 부호는 분석에 따라 뒤바뀔 수 있습니다. 곡선의 모양으로 해석합니다([RM] p.330).
- **"landmark registration은 항상 하는 것이 좋다"** → landmark가 없거나 모호한 곡선이 있고 의도하지 않은 효과가 생길 수 있어, 근거가 있을 때만 씁니다([RM] p.331).

## 자기 점검

1. 두 시점의 분산이 s_ii = 16, s_jj = 25이고 공분산이 s_ij = 12입니다. 상관계수는?
<details><summary>정답</summary>r = 12 / √(16 × 25) = 12 / 20 = 0.6입니다([RM] 식 14.5, p.320). 제곱근 없이 12 / 400 = 0.03으로 계산하면 표준 정의와 다른 값이 됩니다(본문 첫머리의 추가 설명 참조).</details>

2. 어떤 파형 자료의 eigenvalue가 48, 18, 9, 5이고 나머지는 0입니다. 각 주성분의 변동 비율과 누적 비율을 구하고, 90% 규칙으로 몇 개를 남길지 정하세요.
<details><summary>정답</summary>합 = 80. 비율은 48/80 = 60%, 18/80 = 22.5%, 9/80 = 11.25%, 5/80 = 6.25%. 누적은 60, 82.5, 93.75, 100%. 90%를 처음 넘는 것은 3개입니다([RM] 식 14.9, pp.321–322).</details>

3. 시점이 3개뿐인 파형에서 한 대상자의 평균을 뺀 값이 (2, −1, 3)이고 PC1 loading vector가 (0.6, 0, 0.8)입니다. PC1 score와, PC1만으로 추정했을 때의 SSres를 구하세요.
<details><summary>정답</summary>z = 2 × 0.6 + (−1) × 0 + 3 × 0.8 = 1.2 + 0 + 2.4 = 3.6. 추정(평균을 뺀 형태) = 3.6 × (0.6, 0, 0.8) = (2.16, 0, 2.88). 잔차 = (−0.16, −1, 0.12), SSres = 0.0256 + 1 + 0.0144 = 1.04. 검산: 원래 제곱합 4 + 1 + 9 = 14에서 z² = 12.96을 빼면 1.04입니다([RM] 식 14.10, 14.13, 14.14, pp.322–324).</details>

4. 어떤 시점의 평균 무릎 굴곡각이 40°, 그 시점의 PC2 loading 계수가 0.15, PC2 score의 표준편차가 30입니다. 높은·낮은 재구성 파형의 그 시점 값은? loading 계수가 −0.10인 다른 시점에서는 어느 파형이 더 높습니까?
<details><summary>정답</summary>x_H = 40 + 30 × 0.15 = 44.5°, x_L = 40 − 4.5 = 35.5°. 계수가 음수인 시점에서는 30 × (−0.10) = −3이므로 x_H가 평균보다 3° 낮고 x_L이 3° 높습니다. 그래서 0선을 그어 보는 것이 도움이 됩니다([RM] 식 14.15, p.324).</details>

5. smoothing spline에서 K = n으로 두는데도 곡선이 자료를 그대로 지나가지 않는 이유는 무엇이고, λ를 0으로 두면 어떻게 됩니까?
<details><summary>정답</summary>최소화하는 양이 잔차 제곱합만이 아니라 곡률(이차 도함수 제곱의 적분)에 λ를 곱한 벌점까지 더한 PENSSE이기 때문입니다. λ가 클수록 매끄러움이 우선하고, λ = 0이면 벌점이 사라져 최소제곱 적합이 됩니다([RM] pp.328–329).</details>

6. 대상자마다 표본화 주파수가 달라 한 시행의 자료점 수가 제각각이고, 속도 곡선도 함께 분석하고 싶습니다. PCA와 FDA 가운데 어느 쪽이 맞고, 치러야 할 비용은 무엇입니까?
<details><summary>정답</summary>FDA입니다. 각 파형을 함수로 나타내므로 측정 시점과 점의 수가 달라도 되고, 함수가 매끄러워 도함수를 분석에 쉽게 넣을 수 있습니다. PCA를 쓰려면 먼저 보간해 점의 수와 시간을 맞추고 평활·registration을 따로 해야 합니다. 비용은 Matlab, S-Plus, R로 프로그래밍할 수 있어야 한다는 점입니다([RM] p.336).</details>

## 더 읽을거리
- 교재의 Suggested Readings, PCA([RM] pp.336–337): Deluzio & Astephen (2007) *Gait Posture* 25:86–93(무릎 OA 보행 파형의 PCA); Chau (2001) *Gait Posture* 13:49–66; Daffertshofer 외 (2004) *Clin Biomech* 19:415–28(PCA tutorial); Jackson (1991) *A User's Guide to Principal Components*.
- 교재의 Suggested Readings, FDA([RM] p.337): Ramsay & Silverman (2005) *Functional Data Analysis* 2판; Ramsay, Hooker & Graves, *Functional Data Analysis With R and MATLAB*; Coffey 외 (2011) *Hum Mov Sci* 30:1144–66; Donoghue 외 (2008) *Med Sci Sports Exerc* 40:1323–35. FDA 웹사이트(www.psych.mcgill.ca/misc/fda)와 S+ 구현서도 안내됩니다([RM] p.336). 주소가 지금도 유효한지는 확인하지 않았습니다.
- 이 저장소: [T09 신호처리의 이론](../I-gait-theory/note-T09.md), [Day I11](../I-gait/day-I11.md)(시간 정규화와 ensemble average). Fourier 분석과 평활화는 [R12](note-R12.md), angle-angle·phase-plane 곡선은 [R13](note-R13.md), 행렬 계산의 기초는 [R15](note-R15.md).

---
[← 이전 노트](note-R13.md) · [노트 목록](index.md) · [다음 노트 →](note-R15.md)
