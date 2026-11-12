# Day 11 — 실험 설계: 반복, 배치, 교란, 대조군

> **주차:** 2주차 · **예상 시간:** 75–90분 · **산출물:** `design-formula-draft.md` (설계식 초안)

## 오늘의 목표
- 생물학적 반복, 배치 효과, 교란, 대조군이 무엇이고 왜 통계보다 먼저 확인해야 하는지 설명할 수 있다.
- 가상의 RNA 발현 표에서 PCA와 메타데이터를 이용해 batch effect를 찾아낼 수 있다.
- `~ batch + condition` 같은 설계식(design formula)을 읽고 쓸 수 있다.

## 🎬 영상으로 먼저 보기

- [Types of Experimental Designs (3.3) — Simple Learning Pro](https://www.youtube.com/watch?v=10ikXret7Lk) (6:36)
- **무엇에 주목할까:** 완전 무작위 설계와 블록 설계(randomized block design)의 차이를 보세요. "블록"은 오늘 배울 "배치를 조건과 섞어 배치하는 것"과 같은 생각입니다. 무작위 배정이 왜 교란을 막아 주는지도 함께 확인합니다.

- [Design Matrices For Linear Models, Clearly Explained!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=CqLGvwi-5Pc) (14:39)
- **무엇에 주목할까:** 그룹을 0과 1로 표시한 표(design matrix)가 어떻게 "평균 + 그룹 차이" 모델이 되는지 보세요. 관심 요인 외의 요인을 열 하나로 더 추가하는 부분이 나오면, 그것이 오늘의 `~ batch + condition`과 같은 생각이라고 연결해 보세요. 수식이 낯설면 그림만 따라가도 충분합니다.

- (선택, 검색 링크) RNA-seq의 batch effect만 다룬 영상: [YouTube 검색 — "batch effect RNA-seq explained"](https://www.youtube.com/results?search_query=batch+effect+RNA-seq+explained)

## 개념 설명

### 반복: 무엇을 여러 번 했는가

**반복(replicate)** 에는 두 종류가 있습니다. **생물학적 반복(biological replicate)** 은 서로 다른 개체(마우스 6마리)에서 얻은 측정이고, **기술적 반복(technical replicate)** 은 같은 시료를 여러 번 측정한 것입니다. 한 마우스의 RNA를 세 번 측정하면 "측정 장비가 얼마나 일정한가"는 알 수 있지만 "마우스마다 얼마나 다른가"는 전혀 알 수 없습니다.

우리가 내리고 싶은 결론은 대개 "우주비행을 한 마우스는 일반적으로 이렇다"입니다. 그러려면 개체 간 변이를 알아야 하므로 통계 검정의 n은 **생물학적 반복 수**여야 합니다. 같은 개체의 반복 측정을 독립된 표본처럼 세면 n이 부풀려져 p-value가 거짓으로 작아집니다. 이 문제는 4–5주차 파킨슨병 데이터에서 "같은 참가자의 반복 측정을 train과 test에 나눠 넣지 않는다"는 규칙으로 다시 만납니다.

### 대조군: 무엇과 비교하는가

"비행군에서 유전자 X가 높다"는 문장은 "무엇보다?"가 빠지면 의미가 없습니다. **대조군(control)** 은 관심 있는 요인 하나만 빼고 나머지를 최대한 같게 맞춘 그룹입니다. 좋은 대조군일수록 관찰된 차이를 그 요인 탓으로 돌릴 수 있습니다.

우주비행 연구에서는 이것이 특히 어렵습니다. 비행군은 미세중력만 겪는 것이 아니라 발사 진동, 방사선, 좁은 사육장, 귀환 스트레스를 함께 겪습니다. 그래서 지상에서 같은 종류의 사육 장치와 비슷한 환경 조건으로 키우는 대조군을 따로 둡니다. 내일 OSD-536을 읽을 때 "이 대조군은 비행군과 무엇이 같고 무엇이 다른가"를 가장 먼저 확인할 것입니다.

### 배치 효과: 같은 빵집, 다른 날

**배치(batch)** 는 함께 처리된 시료의 묶음입니다. RNA를 추출한 날짜, 실험자, 시약 lot, 장비의 lane이나 카트리지가 모두 배치가 될 수 있습니다. **배치 효과(batch effect)** 는 생물학과 무관하게 배치 때문에 측정값이 체계적으로 달라지는 현상입니다. 같은 빵집에서 같은 레시피로 구워도 월요일 빵과 금요일 빵은 오븐 상태와 반죽 온도 때문에 조금 다릅니다. 발현 데이터에서는 이 차이가 생물학적 차이보다 큰 경우가 흔합니다.

배치 효과 자체는 피할 수 없지만, 어떻게 배치했느냐에 따라 결과는 완전히 달라집니다. 각 배치에 대조군과 처리군을 고르게 섞어 넣었다면(**균형 설계**), 배치 차이를 통계 모델에서 따로 떼어낼 수 있습니다.

### 교란: 두 원인이 한 몸이 되었을 때

**교란(confounding)** 은 관심 요인과 다른 요인이 완전히 겹쳐서 둘을 구별할 수 없는 상태입니다. 대조군 6마리는 모두 월요일에, 비행군 6마리는 모두 금요일에 처리했다고 합시다. 두 그룹의 차이가 우주비행 때문인지 요일 때문인지는 **어떤 통계 방법으로도 가려낼 수 없습니다.** 데이터를 모은 뒤에는 고칠 수 없고, 실험 설계 단계에서만 막을 수 있습니다.

그래서 분석가는 그래프를 그리기 전에 메타데이터로 교차표를 만들어 봅니다. 조건 × 배치 표에 0인 칸이 있으면 위험 신호입니다. 실라부스의 "메타데이터와 연구 설계를 먼저 읽고, 그래프와 모델은 그 뒤에 만든다"가 이 뜻입니다.

### 설계식: 모델에게 알려주는 실험 구조

**설계식(design formula)** 은 "측정값이 어떤 요인들로 설명되는가"를 적은 짧은 문장입니다. `~` 오른쪽에 요인을 `+`로 이어 씁니다.

- `~ condition` : 발현량은 조건(GC/FLT)에 따라 다르다.
- `~ batch + condition` : 발현량은 배치에 따라서도 다르고, **배치 차이를 감안한 뒤** 조건에 따라 다르다.

관례상 보정하고 싶은 요인(batch)을 앞에, 관심 요인(condition)을 맨 뒤에 씁니다. 3주차에 읽을 차등발현 분석 도구들이 이 형식을 그대로 받습니다. 단, 식에 batch를 넣을 수 있는 것은 설계가 교란되지 않았을 때뿐입니다.

## 예시로 이해하기

### 예시 1 — 가상의 발현 표에서 batch effect 찾기

샘플 12개(GC 6, FLT 6)를 두 배치로 나눠 처리한 가상 데이터를 만듭니다. 유전자 200개 중 100개는 배치 B2에서 1.0만큼 높고, 20개는 FLT에서 0.8만큼 높습니다.

```python
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA

rng = np.random.default_rng(11)
n_genes = 200

meta = pd.DataFrame({
    "sample": [f"S{i:02d}" for i in range(1, 13)],
    "condition": ["GC"] * 6 + ["FLT"] * 6,
    "batch": ["B1", "B2"] * 6,            # 실험 날짜가 두 번으로 나뉘었다고 가정
}).set_index("sample")

gene_mean = rng.normal(8, 1, n_genes)                         # 유전자마다 다른 기본 발현량
expr = gene_mean + rng.normal(0, 0.3, size=(12, n_genes))     # 샘플 12개 × 유전자 200개
expr[(meta["batch"] == "B2").to_numpy(), :100] += 1.0         # 배치 효과: 유전자 100개가 B2에서 +1.0
expr[(meta["condition"] == "FLT").to_numpy(), :20] += 0.8     # 생물학적 효과: 유전자 20개가 FLT에서 +0.8
expr = pd.DataFrame(expr, index=meta.index, columns=[f"gene{i:03d}" for i in range(n_genes)])

pca = PCA(n_components=2)
pcs = pca.fit_transform(expr - expr.mean())                   # 유전자별 평균을 빼고 PCA
meta["PC1"], meta["PC2"] = pcs[:, 0], pcs[:, 1]

print("설명 분산 비율:", pca.explained_variance_ratio_.round(2))
print(meta.groupby("batch")["PC1"].mean().round(2))
print(meta.groupby("condition")["PC1"].mean().round(2))
```

출력:

```text
설명 분산 비율: [0.6 0.1]
batch
B1   -5.05
B2    5.05
Name: PC1, dtype: float64
condition
FLT    0.86
GC    -0.86
Name: PC1, dtype: float64
```

PCA는 Day 14에서 자세히 배웁니다. 지금은 "샘플들 사이의 가장 큰 차이 방향이 PC1"이라고만 알면 됩니다. 전체 변동의 60%를 차지하는 PC1은 배치(−5.05 대 +5.05)를 가르고 있고, 조건은 PC1에서 거의 구별되지 않습니다. 이 데이터에서 가장 큰 목소리는 생물학이 아니라 실험 날짜입니다.

### 예시 2 — 설계식에 batch를 넣으면 무엇이 달라지나

예시 1을 실행한 같은 노트북에서 이어서 실행합니다(`meta`, `expr`를 그대로 씁니다).

```python
import statsmodels.formula.api as smf

d = meta.assign(y=expr["gene005"])        # gene005: 배치 효과와 조건 효과를 둘 다 받는 유전자

m1 = smf.ols("y ~ condition", data=d).fit()
m2 = smf.ols("y ~ batch + condition", data=d).fit()

term = "condition[T.GC]"                  # FLT가 기준(알파벳 순), GC가 FLT보다 얼마나 다른가
for name, m in [("y ~ condition        ", m1), ("y ~ batch + condition", m2)]:
    print(f"{name}: 계수={m.params[term]:.2f}, 표준오차={m.bse[term]:.2f}, p={m.pvalues[term]:.4f}")
```

출력:

```text
y ~ condition        : 계수=-0.91, 표준오차=0.29, p=0.0097
y ~ batch + condition: 계수=-0.91, 표준오차=0.16, p=0.0003
```

계수 −0.91은 "GC가 FLT보다 0.91 낮다"는 뜻이고(우리가 넣은 진짜 값은 0.8), 두 모델에서 같습니다. 설계가 균형 잡혀 있어 배치가 조건 추정을 한쪽으로 밀지 않기 때문입니다. 달라진 것은 표준오차입니다. batch를 식에 넣자 배치 때문에 생긴 흩어짐이 "설명된 변동"으로 빠져나가 조건 효과가 더 선명해졌습니다(0.29 → 0.16).

### 예시 3 — 교차표로 교란을 미리 잡기

```python
import pandas as pd

balanced = pd.DataFrame({"condition": ["GC"] * 6 + ["FLT"] * 6, "batch": ["B1", "B2"] * 6})
confounded = pd.DataFrame({"condition": ["GC"] * 6 + ["FLT"] * 6, "batch": ["B1"] * 6 + ["B2"] * 6})

print("균형 잡힌 설계")
print(pd.crosstab(balanced["condition"], balanced["batch"]))
print("\n교란된 설계")
print(pd.crosstab(confounded["condition"], confounded["batch"]))
```

출력:

```text
균형 잡힌 설계
batch      B1  B2
condition        
FLT         3   3
GC          3   3

교란된 설계
batch      B1  B2
condition        
FLT         0   6
GC          6   0
```

아래 표처럼 0인 칸이 대각선으로 나오면 조건과 배치가 한 몸입니다. 이 경우 `~ batch + condition`을 써도 모델이 두 효과를 나눌 수 없습니다. 분석을 시작하기 전에 교차표 한 번이면 알 수 있습니다.

## 직접 해보기

1. `notebooks/02_statistics_basics.ipynb` 맨 아래에 `## Day 11 — 실험 설계와 batch effect` 섹션을 만들고 예시 1을 실행합니다.
2. 먼저 메타데이터부터 봅니다. `pd.crosstab(meta["condition"], meta["batch"])`를 실행해 설계가 균형인지 확인합니다(네 칸 모두 3이어야 합니다).
3. 같은 PCA 결과를 색만 바꿔 두 번 그립니다.

   ```python
   import matplotlib.pyplot as plt
   import seaborn as sns

   fig, axes = plt.subplots(1, 2, figsize=(10, 4))
   sns.scatterplot(data=meta, x="PC1", y="PC2", hue="batch", s=80, ax=axes[0])
   sns.scatterplot(data=meta, x="PC1", y="PC2", hue="condition", s=80, ax=axes[1])
   plt.tight_layout()
   plt.savefig("../figures/day11_batch_pca.png", dpi=150)
   plt.show()
   ```

   왼쪽 그림에서 PC1(가로축)이 무엇을 가르는지, 오른쪽 그림에서 PC2(세로축)가 무엇을 가르는지 적습니다. `meta.groupby("condition")["PC2"].mean()`으로 확인하면 FLT 2.0, GC −2.0이 나옵니다. 조건의 신호는 사라진 것이 아니라 배치보다 작아서 두 번째 축으로 밀려난 것입니다.
4. 예시 2를 실행합니다. 그다음 `gene005`를 `gene150`(배치 효과도 조건 효과도 없는 유전자)으로 바꿔 실행하고, 두 모델의 p-value가 어떻게 나오는지 봅니다(둘 다 계수 0.04, p는 0.8 근처로 나옵니다. 효과가 없는 유전자는 batch를 넣어도 유의해지지 않습니다).
5. 교란된 설계를 직접 겪어 봅니다. 예시 1에서 `"batch": ["B1", "B2"] * 6`을 `"batch": ["B1"] * 6 + ["B2"] * 6`으로 바꿔 전체를 다시 실행합니다. PCA 그림 두 장이 이제 어떻게 보이는지, 이 그림만 보고 "FLT와 GC가 뚜렷이 다르다"고 결론 내리면 무엇이 틀렸는지 적습니다. 예시 2도 다시 실행해 보세요. 이 레슨을 만들 때 실행한 결과는 `y ~ condition`의 계수가 −1.91(우리가 넣은 조건 효과 0.8과 배치 효과 1.0이 합쳐진 값), `y ~ batch + condition`의 계수가 +1.84로 **부호까지 뒤집혔고**, 두 경우 모두 p는 0.0000이었습니다. 오류 메시지도 없이 그럴듯한 숫자가 나온다는 점이 무섭습니다. 그것이 "가려낼 수 없다"는 말의 실제 모습입니다. (확인 후 원래대로 돌려놓습니다.)
6. 프로젝트 폴더에 `design-formula-draft.md`를 만들고 아래 틀을 채웁니다. OSD-536의 실제 내용은 내일 채우므로 오늘은 "확인할 것" 목록까지만 씁니다.

   ```markdown
   # 설계식 초안 (Day 11)

   ## 용어를 내 말로
   - 생물학적 반복: 
   - 배치 효과: 
   - 교란: 
   - 대조군: 

   ## 가상 데이터에서 본 것
   - PC1이 가른 것: ____ (설명 분산 __ %)
   - 조건 신호가 나타난 축: ____
   - `y ~ condition` 대 `y ~ batch + condition`의 표준오차: __ → __

   ## OSD-536 설계식 초안
   - 관심 요인(condition에 해당): ____  ← Day 12에 study record에서 확인
   - 배치가 될 수 있는 것(추출 날짜, 장비 lane, 카트리지 등): ____  ← Day 12에 확인
   - 조건 × 배치 교차표에 0인 칸이 있는가: ____  ← Day 12에 확인
   - 초안: `~ ____`
   - 배치 정보를 확인할 수 없다면 보고서에 쓸 한계 문장: 
   ```
7. `learning-log.md`에 기록하고 commit합니다.

⚠️ **흔한 오류 1 — `KeyError: 'condition[T.GC]'`**
statsmodels는 범주의 알파벳 순서로 기준 그룹을 정합니다. 그룹 이름을 바꿨다면 계수 이름도 달라집니다. `print(m2.params)`로 실제 이름을 확인한 뒤 `term`을 고치세요.

⚠️ **흔한 오류 2 — PC1의 부호가 반대로 나온다**
PCA 축의 +/− 방향은 임의입니다. B1이 +5, B2가 −5로 나와도 같은 결과입니다. 중요한 것은 부호가 아니라 "어떤 그룹들이 서로 떨어져 있는가"입니다.

## 퀴즈

**1.** 마우스 3마리의 뇌 RNA를 각각 4번씩 측정해 값 12개를 얻었습니다. 그룹 비교 검정에서 n은 몇으로 봐야 할까요?

<details><summary>정답 보기</summary>

3입니다. 같은 마우스의 반복 측정은 기술적 반복이라 개체 간 변이에 대한 정보를 주지 않습니다. 12로 세면 독립적인 표본이 실제보다 많은 것처럼 되어 p-value가 거짓으로 작아집니다.

</details>

**2.** (객관식) 다음 중 통계 분석으로 사후에 해결할 수 **없는** 상황은?
① 각 배치에 대조군과 처리군이 반씩 들어 있고 배치 간 차이가 크다
② 대조군은 전부 1차 실험, 처리군은 전부 2차 실험에서 처리했다
③ 한 샘플의 총 count가 다른 샘플보다 두 배 많다
④ 한 유전자의 분포가 오른쪽으로 치우쳐 있다

<details><summary>정답 보기</summary>

②. 조건과 배치가 완전히 겹친 교란 상태라 두 효과를 분리할 정보가 데이터에 없습니다. ①은 설계식에 batch를 넣어 보정할 수 있고, ③은 정규화, ④는 log 변환으로 다룹니다.

</details>

**3.** (단답) 배치 차이를 보정하면서 조건 효과를 보고 싶을 때의 설계식을 쓰세요.

<details><summary>정답 보기</summary>

`~ batch + condition`. 보정할 요인을 앞에, 관심 요인을 마지막에 둡니다. "배치에 따른 차이를 감안한 뒤에도 남는 조건의 차이"를 추정하겠다는 뜻입니다.

</details>

**4.** PCA 그림에서 샘플들이 실험 조건이 아니라 RNA 추출 날짜에 따라 두 덩어리로 갈렸습니다. 다음에 할 일 두 가지는?

<details><summary>정답 보기</summary>

첫째, 조건 × 추출 날짜 교차표를 만들어 교란 여부를 확인합니다. 둘째, 교란이 아니라면 설계식에 날짜(batch)를 포함해 분석하고, 교란이라면 조건 효과를 분리할 수 없다는 한계를 보고서에 명시합니다. 어느 경우든 발견 사실을 기록으로 남깁니다.

</details>

**5.** 우주비행 연구에서 "지상 대조군을 비행군과 같은 종류의 사육 장치에서 키웠다"는 정보가 왜 중요할까요?

<details><summary>정답 보기</summary>

사육 장치(공간, 먹이 형태, 환기 등)의 차이가 비행 효과와 섞이지 않게 해 주기 때문입니다. 대조군이 비행군과 다른 점이 적을수록 관찰된 차이를 비행 환경 탓으로 볼 근거가 강해집니다. 그래도 발사·귀환 스트레스나 방사선처럼 맞출 수 없는 요인은 남으므로 "미세중력 때문"이라고 좁혀 말할 수는 없습니다.

</details>

## 더 알아보기

> **📚 처리 방법도 배치가 된다: 집단마다 다른 템플릿**
> 환자와 대조군의 뇌 영상을 서로 다른 템플릿이나 전처리 기준으로 처리하면, 처리 차이가 집단 차이와 완전히 겹칩니다. 위축된 뇌는 표준 템플릿에 맞출 때 정합 오차가 체계적으로 생기므로 더 엄격한 확인이 필요합니다. 비교할 집단은 같은 파이프라인과 템플릿으로 처리하고, 위축이 결과에 섞였는지 민감도 분석으로 확인합니다.
> → [심화 D — Day D3: 공간 정규화, 템플릿, 아틀라스: 서로 다른 뇌를 한 좌표에 놓기](../advanced/D-fmri/day-D3.md)

> **📚 군집이 배치를 찾아낼 때**
> 비지도 군집으로 "환자 아형을 발견했다"고 했는데 실은 추출일·기기·수집 사이트가 묶인 경우가 흔합니다. 군집 결과를 받으면 먼저 군집별 배치 변수 분포를 교차표로 확인하세요. 그다음 데이터를 다시 뽑아도 묶음이 유지되는지(부트스트랩 안정성), 군집에 쓰지 않은 변수로도 차이가 보이는지 확인합니다.
> → [심화 G — Day G1: 바이오메디컬 AI 지도: 무엇을 배우고, 무엇을 만드는가](../advanced/G-ai-biomed/day-G1.md)

## 오늘의 산출물 체크리스트
- [ ] 노트북에 Day 11 섹션이 있고 예시 1–3이 실행된다.
- [ ] 배치 색/조건 색으로 그린 PCA 그림(`day11_batch_pca.png`)이 있다.
- [ ] 교란된 설계로 바꿔 본 결과와 느낀 점을 적었다.
- [ ] `design-formula-draft.md`의 용어 정리와 가상 데이터 부분을 채웠고, OSD-536 부분은 "Day 12에 확인" 상태로 남겼다.
- [ ] `learning-log.md` 기록과 commit을 남겼다.

---
[← 이전](day-10.md) · [코스 지도](../../README.md) · [다음 →](day-12.md)
