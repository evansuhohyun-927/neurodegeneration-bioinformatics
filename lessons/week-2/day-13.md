# Day 13 — 전처리와 QC: raw count, 정규화, log 변환은 각각 어디에 쓰나

> **주차:** 2주차 · **예상 시간:** 75–90분 · **산출물:** `qc-checklist.md` (QC 체크리스트)

## 오늘의 목표
- raw count, 정규화된 count, log/VST 변환값이 각각 무엇이고 어떤 분석에 쓰는지 설명할 수 있다.
- 가상 count 표에서 library size 차이를 확인하고 CPM과 log 변환을 직접 계산할 수 있다.
- 분자 데이터를 분석하기 전에 점검할 QC 항목을 체크리스트로 만들 수 있다.

## 🎬 영상으로 먼저 보기

- [StatQuest: DESeq2, part 1, Library Normalization — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=UFB993xufUU) (12:41)
- **무엇에 주목할까:** 샘플마다 읽은 총량(library size)이 다르면 왜 raw count를 그대로 비교할 수 없는지, 그리고 단순히 총합으로 나누는 것만으로는 왜 부족할 수 있는지(몇몇 유전자가 총합을 독차지하는 경우)를 보세요. 계산 절차를 외울 필요는 없고 "무엇을 바로잡으려는가"만 잡으면 됩니다.

- [Logs (logarithms), Clearly Explained!!! — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=VSi0Z04fWj0) (15:37)
- **무엇에 주목할까:** log를 취하면 "몇 배"가 "얼마를 더함"으로 바뀐다는 점에 집중하세요. 2배 증가와 1/2배 감소가 log2에서는 +1과 −1로 대칭이 됩니다. 3주차에 나올 log2 fold change가 여기서 나옵니다.

## 개념 설명

### raw count: 가공하지 않은 재료

**raw count**는 장비가 센 그대로의 정수입니다. RNA-seq에서는 유전자에 붙은 read 수, NanoString nCounter에서는 탐침이 검출된 횟수입니다. 요리로 치면 손질하지 않은 재료입니다. 그대로는 먹기 어렵지만, 원재료의 정보가 가장 온전히 남아 있습니다.

count에는 중요한 성질이 있습니다. 3번 세어진 유전자와 3,000번 세어진 유전자는 측정의 확실성이 다릅니다. 3은 다시 측정하면 1이나 6이 될 수 있지만 3,000이 1,000이나 6,000이 되기는 어렵습니다. 차등발현을 위한 통계 모델(DESeq2, edgeR 등)은 바로 이 "count가 작을수록 불확실하다"는 정보를 이용하도록 설계되어 있습니다. 그래서 2주차 핵심 규칙의 앞 절반이 **"raw count는 차등발현 모델에"** 입니다. 미리 나누거나 log를 취한 값을 넣으면 모델이 그 정보를 잃습니다. (모델은 내부에서 library size를 따로 보정합니다.)

### 정규화: 샘플 사이의 불공평 없애기

같은 조직이라도 샘플마다 총 count는 다릅니다. RNA 양, 장비 효율, 읽은 깊이가 다르기 때문입니다. 한 샘플의 총 count가 다른 샘플의 세 배라면 거의 모든 유전자가 세 배로 보입니다. 이것은 생물학이 아니라 측정의 차이입니다.

**정규화(normalization)** 는 이 차이를 없애 샘플끼리 비교할 수 있게 만드는 일입니다. 시험 점수에 비유하면, 100점 만점 시험과 300점 만점 시험의 점수를 백분율로 바꾸는 것과 같습니다. 가장 단순한 방법이 **CPM(counts per million)** 으로, 각 count를 그 샘플의 총 count로 나누고 100만을 곱합니다. DESeq2의 size factor나 edgeR의 TMM은 몇몇 고발현 유전자가 총합을 좌우하는 문제까지 고려한 더 튼튼한 방법입니다.

nCounter 같은 패널 데이터는 사정이 조금 다릅니다. 일반적으로 패널에 함께 들어 있는 **양성 대조 탐침(positive control)** 과 **housekeeping 유전자**를 기준으로 정규화합니다. Day 12에서 열어 본 OSD-536의 RCC 파일(F8 샘플 하나를 확인)에는 `CodeClass` 열에 Endogenous 757개, Housekeeping 13개, Positive 6개, Negative 8개가 있었습니다. 이 연구의 논문이 실제로 어떤 정규화 방법을 썼는지는 이 레슨에서 확인하지 못했으므로, Day 12 데이터 사전의 "직접 확인" 항목으로 남겨 두었습니다.

### log와 VST: 큰 값이 독주하지 못하게

정규화를 해도 문제가 하나 남습니다. 발현량은 유전자에 따라 수천 배씩 차이가 나고, 값이 큰 유전자일수록 흩어짐(분산)도 큽니다. 이 상태로 PCA나 heatmap을 만들면 고발현 유전자 몇 개가 결과를 독차지합니다. 합창에서 한 사람이 마이크를 잡고 소리를 지르면 나머지 목소리가 들리지 않는 것과 같습니다.

**log 변환**은 큰 값을 눌러 줍니다. 보통 `log2(값 + 1)`을 쓰는데, +1(pseudocount)은 0의 log를 피하기 위한 것입니다. **VST(variance stabilizing transformation)** 와 **rlog**는 DESeq2가 제공하는 더 정교한 변환으로, log가 과장하기 쉬운 저발현 유전자의 잡음까지 다듬어 "발현 수준과 상관없이 분산이 비슷하도록" 만듭니다. VST는 R의 DESeq2 기능이므로 이 과정의 Python 실습에서는 `log2(CPM + 1)`을 간단한 대용으로 씁니다.

그래서 핵심 규칙의 뒤 절반은 **"정규화/VST 값은 PCA와 시각화에 주로 사용한다"** 입니다. 정리하면 다음과 같습니다.

| 값의 종류 | 주된 용도 | 쓰면 안 되는 곳 |
|---|---|---|
| raw count | 차등발현 통계 모델의 입력, library size·검출 유전자 수 QC | 샘플 간 직접 비교, PCA, heatmap |
| 정규화 count (CPM 등) | 샘플 간 발현 수준 비교, 유전자별 그림 | count 기반 차등발현 모델의 입력 |
| log / VST 변환값 | PCA, heatmap, 샘플 간 상관, 군집화 | count 기반 차등발현 모델의 입력 |

### QC: 분석 전에 하는 건강검진

**QC(quality control)** 는 "이 데이터로 분석을 시작해도 되는가"를 묻는 단계입니다. 결과가 이상하게 나온 뒤에 원인을 찾는 것보다 미리 보는 편이 훨씬 쌉니다. 샘플 수준에서 보는 대표 항목은 다음과 같습니다.

- **총 count(library size)**: 한 샘플만 유독 작으면 RNA 양이나 측정에 문제가 있었을 수 있습니다.
- **검출된 유전자 수**: count가 0이 아닌 유전자가 다른 샘플보다 훨씬 적으면 의심합니다.
- **샘플 간 상관**: 같은 조직이면 서로 비슷해야 합니다. 혼자 동떨어진 샘플이 있는지 봅니다.
- **분포 모양**: 변환 후 샘플별 boxplot의 중앙값과 폭이 비슷한지 봅니다.
- **메타데이터 일치**: 행렬의 샘플 ID와 메타데이터의 샘플 ID가 빠짐없이, 중복 없이 맞는지 확인합니다.

QC에서 이상한 샘플을 발견해도 Day 8의 원칙은 그대로입니다. 바로 지우지 않고, 기록하고, 포함·제외 결과를 모두 확인합니다. 표본이 12개인 데이터에서 샘플 하나를 빼는 것은 큰 결정입니다.

## 예시로 이해하기

### 예시 1 — 한 유전자를 세 가지 값으로 보기

샘플 6개의 가상 count 표를 만듭니다. 모든 샘플의 **진짜 발현 수준은 같고**, 읽은 깊이(depth)만 0.5배에서 3배까지 다르게 했습니다.

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(13)
n_genes = 500
samples = ["S1", "S2", "S3", "S4", "S5", "S6"]
depth = np.array([0.5, 0.8, 1.0, 1.2, 1.5, 3.0])       # 샘플마다 '읽은 양'이 다르다

true_level = rng.lognormal(mean=3, sigma=1.5, size=n_genes)   # 모든 샘플에서 같은 진짜 발현 수준
mu = true_level[:, None] * depth[None, :]
counts = rng.negative_binomial(n=50, p=50 / (50 + mu))        # RNA 계수 데이터처럼 흩어진 정수
counts = pd.DataFrame(counts, index=[f"gene{i:03d}" for i in range(n_genes)], columns=samples)

lib_size = counts.sum()                          # 샘플별 총 count (library size)
cpm = counts / lib_size * 1_000_000              # counts per million
log_cpm = np.log2(cpm + 1)                       # +1은 log(0)을 피하기 위한 pseudocount

print("샘플별 총 count:")
print(lib_size)
print("\n한 유전자(gene000)를 세 가지 값으로 보기:")
print(pd.DataFrame({"raw": counts.loc["gene000"],
                    "CPM": cpm.loc["gene000"].round(0),
                    "log2(CPM+1)": log_cpm.loc["gene000"].round(2)}))
```

출력:

```text
샘플별 총 count:
S1     19375
S2     32658
S3     37258
S4     46394
S5     59192
S6    117514
dtype: int64

한 유전자(gene000)를 세 가지 값으로 보기:
    raw     CPM  log2(CPM+1)
S1  179  9239.0        13.17
S2  318  9737.0        13.25
S3  208  5583.0        12.45
S4  400  8622.0        13.07
S5  498  8413.0        13.04
S6  904  7693.0        12.91
```

raw count만 보면 S6(904)의 발현이 S1(179)의 다섯 배처럼 보입니다. 하지만 우리는 진짜 발현이 같다는 것을 알고 있습니다. CPM으로 바꾸면 차이가 대부분 사라지고, log 척도에서는 12.5–13.3 사이의 좁은 범위에 모입니다. 남은 차이(S3가 조금 낮은 것 등)는 계수 과정의 무작위 잡음입니다.

### 예시 2 — log 변환 전후, 누가 분산을 차지하나

예시 1을 실행한 같은 노트북에서 이어서 실행합니다.

```python
def top10_share(table):
    v = table.var(axis=1)                        # 유전자별 분산
    return v.sort_values(ascending=False).head(10).sum() / v.sum()

print(f"CPM에서 상위 10개 유전자가 차지하는 분산: {top10_share(cpm):.0%}")
print(f"log2(CPM+1)에서 상위 10개 유전자가 차지하는 분산: {top10_share(log_cpm):.0%}")
```

출력:

```text
CPM에서 상위 10개 유전자가 차지하는 분산: 90%
log2(CPM+1)에서 상위 10개 유전자가 차지하는 분산: 22%
```

CPM 상태에서는 500개 유전자 중 단 10개가 전체 분산의 90%를 차지합니다. 이 값으로 PCA를 하면 사실상 그 10개 유전자만 보는 셈입니다. log를 취하면 22%로 내려가 나머지 유전자들의 목소리가 들리기 시작합니다. 내일 PCA 전에 반드시 변환을 하는 이유입니다.

### 예시 3 — 샘플 QC 표 만들기

역시 같은 노트북에서 이어서 실행합니다.

```python
qc = pd.DataFrame({
    "total_count": counts.sum(),
    "detected_genes": (counts > 0).sum(),                 # count가 1 이상인 유전자 수
    "median_corr": log_cpm.corr(method="spearman").median(),   # 다른 샘플들과의 상관 중앙값
})
print(qc.round(3))
```

출력:

```text
    total_count  detected_genes  median_corr
S1        19375             473        0.950
S2        32658             481        0.966
S3        37258             477        0.965
S4        46394             486        0.966
S5        59192             492        0.967
S6       117514             497        0.972
```

깊이가 얕은 S1은 검출된 유전자 수가 가장 적고(473개) 다른 샘플과의 상관도 조금 낮습니다. 저발현 유전자가 0으로 세어지기 쉽고 잡음이 상대적으로 크기 때문입니다. 이 정도 차이는 깊이로 설명되는 범위지만, 실제 데이터에서 한 샘플만 크게 벗어나면 조사 대상입니다.

## 직접 해보기

1. 새 노트북 `notebooks/02_osdr_qc_and_pca.ipynb`를 만들고(3주차까지 계속 쓸 노트북입니다) 첫 섹션 제목을 `## Day 13 — 전처리와 QC 연습 (가상 데이터)`로 답니다. 예시 1–3을 차례로 실행합니다.
2. 세 가지 값의 샘플별 분포를 나란히 그립니다.

   ```python
   import matplotlib.pyplot as plt
   import seaborn as sns

   fig, axes = plt.subplots(1, 3, figsize=(13, 4))
   for ax, (name, table) in zip(axes, [("raw count", counts), ("CPM", cpm), ("log2(CPM+1)", log_cpm)]):
       sns.boxplot(data=table, ax=ax, showfliers=False)
       ax.set_title(name)
   plt.tight_layout()
   plt.savefig("../figures/day13_three_scales.png", dpi=150)
   plt.show()
   ```

   raw count 그림에서는 상자가 S1에서 S6으로 갈수록 계단처럼 올라갑니다(샘플별 중앙값: 10, 17, 21, 26, 30, 62). log2(CPM+1) 그림에서는 여섯 상자의 중앙값이 9.0–9.1로 거의 같아집니다. 세 그림 중 어느 것이 "샘플끼리 비교 가능한 상태"인지 한 문장으로 적습니다.
3. 문제 있는 샘플을 일부러 만들어 QC 표가 잡아내는지 봅니다. 예시 1 뒤에 다음 한 줄을 추가하고 `lib_size`, `cpm`, `log_cpm` 계산과 예시 3을 다시 실행합니다.

   ```python
   counts["S3"] = rng.poisson(75, n_genes)      # S3를 유전자와 무관한 잡음으로 바꿈 (총 count는 원래와 비슷하게)
   ```

   QC 표의 세 열 중 어느 열이 S3의 이상을 가장 뚜렷하게 보여 주는지 적습니다(총 count는 약 37,500으로 정상처럼 보이지만 `median_corr`는 0 근처로 떨어집니다). 총 count만 봤다면 발견할 수 있었을지도 생각해 보세요. (확인 후 그 줄을 지우고 처음부터 다시 실행해 원래대로 돌려놓습니다.)
4. 예시 1에서 `log2(cpm + 1)`의 `+ 1`을 지우고 실행해 봅니다. 어떤 값과 경고가 나오는지 확인하고 pseudocount가 필요한 이유를 한 문장으로 적습니다. (다시 `+ 1`을 넣어 둡니다.)
5. 개념 설명의 "값의 종류 / 주된 용도" 표를 보지 않고 자기 말로 다시 써 봅니다. 그다음 프로젝트 폴더에 `qc-checklist.md`를 만들고 아래 틀을 채웁니다.

   ```markdown
   # 분자 데이터 QC 체크리스트 (Day 13)

   ## A. 값의 종류와 용도 (내 말로)
   | 값 | 무엇인가 | 어디에 쓰나 | 어디에 쓰면 안 되나 |
   |---|---|---|---|
   | raw count | | | |
   | 정규화 count | | | |
   | log / VST 변환값 | | | |

   ## B. 분석 전에 확인할 것
   - [ ] 내가 받은 표가 raw인지, 정규화된 것인지, 변환된 것인지 확인했다 (근거: ____)
   - [ ] 행렬의 샘플 ID와 메타데이터의 샘플 ID가 일치한다 (누락 __개, 중복 __개)
   - [ ] 조건별 샘플 수를 셌다
   - [ ] 샘플별 총 count를 비교했다 (최소 __ / 최대 __)
   - [ ] 샘플별 검출 유전자 수를 비교했다
   - [ ] 변환 후 샘플별 분포(boxplot)를 그렸다
   - [ ] 샘플 간 상관을 확인했다 (가장 낮은 샘플: ____)
   - [ ] 이상해 보이는 샘플을 기록했다 (지우지 않고 기록)
   - [ ] (직접 추가) 

   ## C. OSD-536에 적용할 때 미리 적어 둘 것
   - 원시 파일 형식: RCC (샘플당 1개)
   - 탐침 종류별 개수(내가 RCC 파일에서 확인한 값): Endogenous __, Housekeeping __, Positive __, Negative __
   - 정규화에 쓸 기준(논문 Methods에서 확인): ____
   - 표본이 그룹당 6개이므로 이상 샘플을 발견했을 때의 내 원칙: 
   ```
6. `learning-log.md`에 기록하고 commit합니다.

⚠️ **흔한 오류 1 — 행과 열을 헷갈려 엉뚱한 방향으로 나눈다**
이 표는 행이 유전자, 열이 샘플입니다. `counts.sum()`은 열(샘플)별 합이고 `counts.sum(axis=1)`은 행(유전자)별 합입니다. 정규화가 제대로 됐는지는 `cpm.sum()`이 모든 샘플에서 1,000,000인지로 확인할 수 있습니다.

⚠️ **흔한 오류 2 — `RuntimeWarning: divide by zero encountered in log2`**
0이 들어 있는 표에 pseudocount 없이 log를 취했을 때 나옵니다. 결과에 `-inf`가 생겨 이후 평균, 분산, PCA가 모두 망가집니다. `np.log2(cpm + 1)`처럼 더해 주세요.

## 퀴즈

**1.** (객관식) 차등발현 통계 모델(DESeq2, edgeR 등)에 넣는 값으로 알맞은 것은?
① raw count ② CPM ③ log2(CPM+1) ④ z-score

<details><summary>정답 보기</summary>

① raw count. 이런 모델은 "count가 작을수록 불확실하다"는 계수 데이터의 성질을 이용하고, library size 차이는 모델 내부에서 따로 보정합니다. 미리 정규화하거나 log를 취한 값을 넣으면 그 정보가 사라집니다. 2주차 핵심 규칙의 앞 절반입니다.

</details>

**2.** 샘플 A의 총 count는 2,000만, 샘플 B는 4,000만입니다. 유전자 X의 raw count가 A에서 200, B에서 400이라면 X의 발현은 B에서 두 배일까요?

<details><summary>정답 보기</summary>

아닙니다. CPM으로 바꾸면 A는 200/2,000만×100만 = 10, B는 400/4,000만×100만 = 10으로 같습니다. raw count의 차이는 읽은 깊이의 차이였습니다. 샘플 간 비교는 정규화 후에 합니다.

</details>

**3.** PCA나 heatmap을 만들기 전에 log(또는 VST) 변환을 하는 이유는?

<details><summary>정답 보기</summary>

발현량이 큰 유전자일수록 분산도 커서, 변환 없이 분석하면 고발현 유전자 몇 개가 결과를 지배합니다. 예시 2에서 상위 10개 유전자의 분산 비중이 90%에서 22%로 내려간 것처럼, 변환은 유전자들이 더 고르게 기여하도록 해 줍니다.

</details>

**4.** (단답) `log2(CPM + 1)`에서 +1을 더하는 이유는?

<details><summary>정답 보기</summary>

count가 0인 유전자의 log2(0)은 −∞가 되어 계산이 불가능하기 때문입니다. 1을 더하면 0은 log2(1) = 0으로 바뀌고, 큰 값에는 거의 영향이 없습니다. 이 더해 주는 작은 수를 pseudocount라고 합니다.

</details>

**5.** 그룹당 6개 샘플인 실험에서 QC 결과 한 샘플의 총 count가 유난히 낮습니다. 바람직한 대응은?

<details><summary>정답 보기</summary>

바로 제외하지 않습니다. 검출 유전자 수, 다른 샘플과의 상관, 분포 그림, 실험 기록을 함께 확인해 원인을 조사하고 발견 사실을 기록합니다. 그다음 포함했을 때와 제외했을 때의 결과를 모두 확인해, 결론이 그 샘플 하나에 좌우되는지 보고합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/02_osdr_qc_and_pca.ipynb`에 Day 13 섹션이 있고 예시 1–3이 실행된다.
- [ ] 세 가지 값의 boxplot 그림(`day13_three_scales.png`)이 있다.
- [ ] 잡음 샘플 실험과 pseudocount 실험의 결과를 적었다.
- [ ] `qc-checklist.md`의 A, B, C를 채웠다.
- [ ] `learning-log.md` 기록과 commit을 남겼다.

---
[← 이전](day-12.md) · [코스 지도](../../README.md) · [다음 →](day-14.md)
