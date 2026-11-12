# Crash Course — Transcriptomics (전사체)

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** bulk RNA-seq 논문의 방법 절을 따라 읽고, FASTQ(또는 받은 count matrix)에서 차등발현·enrichment 결과까지 어떤 단계와 점검이 필요한지 계획할 수 있다.

## 한눈에 보기

전사체 분석은 **어떤 유전자의 RNA가 얼마나 있는지**를 샘플마다 세고, 조건 사이에서 그 양이 달라졌는지 묻는 일이다. 이 가이드는 조직 덩어리를 통째로 재는 bulk RNA-seq을 중심으로 하고, 다른 기술은 비교 표와 짧은 소절로 다룬다.

| | 내용 |
|---|---|
| 무엇을 측정하는가 | 샘플(또는 세포·위치)별 유전자 RNA의 상대적 양. 결과물은 유전자 × 샘플의 count matrix |
| 답할 수 있는 질문 | 조건 A와 B 사이에 발현이 달라진 유전자는 무엇인가 / 그 유전자들이 어떤 경로·기능에 몰려 있는가 / 샘플들이 발현 양상으로 어떻게 묶이는가 |
| 답하지 못하는 것 | 단백질의 양·활성·위치, DNA 변이 여부, 발현 변화가 원인인지 결과인지. bulk에서는 변화가 "세포 하나하나의 발현"인지 "세포 구성 비율"인지도 구분하지 못한다 |
| 값의 성격 | 절대량이 아니라 **상대량**이다. 한 샘플에서 읽은 read 총량 안에서의 몫이므로 샘플 간 비교에는 정규화가 필요하다 |

## 🎬 급할 때 볼 영상

- [StatQuest: A gentle introduction to RNA-seq](https://www.youtube.com/watch?v=tlf6wYJrwKY) — StatQuest with Josh Starmer (18분). 실험에서 count, 차등발현까지 전체 흐름을 한 번에 본다. 하나만 본다면 이것.
- [StatQuest: DESeq2, part 1, Library Normalization](https://www.youtube.com/watch?v=UFB993xufUU) — StatQuest with Josh Starmer (13분). 왜 총 read 수로 나누는 것만으로 부족한지, 가장 자주 틀리는 단계인 정규화를 다룬다.
- [Single Cell Sequencing - Eric Chow (UCSF)](https://www.youtube.com/watch?v=k9VFNLLQP8c) — iBiology Techniques (25분). single-cell 데이터를 받았거나 읽어야 할 때만.

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| count matrix | 행 = 유전자, 열 = 샘플, 값 = 그 유전자에 배정된 read(조각) 수 | 이후 모든 분석의 입력. 이 표가 어떤 값(raw인지 정규화인지)인지부터 확인한다 |
| library size (sequencing depth) | 한 샘플에서 얻은 총 read 수 | 샘플마다 다르다. 보정하지 않으면 깊이 차이가 발현 차이로 보인다 |
| 정규화 (normalization) | 깊이와 조성 차이를 없애 샘플끼리 비교할 수 있게 하는 것 (CPM, TPM, DESeq2 size factor, edgeR TMM) | 방법마다 용도가 다르다. 검정용과 그림용을 구분해야 한다 |
| log2 fold change (log2FC) | 두 조건 평균 발현의 비에 log2를 취한 값. 1이면 2배, −1이면 절반 | 효과의 크기. 어느 군이 분자인지(방향)를 반드시 확인한다 |
| 분산·dispersion | 같은 조건의 생물학적 반복 사이에서 count가 흔들리는 정도 | 반복이 적으면 유전자 하나만으로는 추정이 불안정하다. 전용 도구가 유전자들 사이에서 정보를 빌리는 이유 |
| 생물학적 반복 (biological replicate) | 독립된 개체·배양에서 얻은 샘플 | 통계의 n. 같은 RNA를 두 번 읽은 기술적 반복은 n을 늘리지 않는다 |
| 배치 효과 (batch effect) | 추출일, 라이브러리 제작, 시퀀싱 런 등 기술적 차이로 생기는 체계적 변동 | 조건과 겹치면 분리할 수 없다. 설계 단계에서만 막을 수 있다 |
| FDR, adjusted p (padj) | 유의하다고 고른 유전자 중 거짓 양성의 기대 비율을 통제한 값. Benjamini–Hochberg(BH)가 표준 | 수만 유전자를 검정하므로 raw p < 0.05는 쓸 수 없다 |
| enrichment (ORA, GSEA) | 유전자 목록이 특정 gene set(경로·기능)에 우연보다 많이 몰려 있는지 검정 | 유전자 수백 개를 해석 가능한 주제로 요약한다. 배경 집합 선택에 민감하다 |
| pseudobulk | single-cell count를 "샘플 × 세포 유형"별로 합쳐 bulk처럼 만든 것 | 세포가 아니라 개체를 독립 표본으로 삼기 위한 방법 |

## 측정 기술 고르기

| 기술 | 무엇을 얻나 | 장점 | 한계 | 이런 질문에 쓴다 |
|---|---|---|---|---|
| qPCR | 유전자 몇 개~수십 개의 상대 발현 (Ct 값) | 민감하고 싸고 빠르다 | 미리 고른 유전자만. 기준 유전자(reference gene) 선택에 결과가 좌우된다 | 소수 후보의 확인·검증 |
| 패널 기반 (NanoString nCounter) | 정해진 수백 개 유전자의 직접 계수(증폭 없이 프로브로 센다) | 분해된 RNA(FFPE 등)에도 비교적 강하다. 분석이 단순하다 | 패널에 없는 유전자는 보지 못한다. enrichment의 배경이 패널로 제한된다 | 특정 주제(예: 신경염증)의 표적 프로파일링 |
| Microarray | 프로브가 있는 유전자 수만 개의 형광 강도 | 축적된 공개 자료가 많다. 분석법이 성숙했다 | 새 전사체는 못 본다. 낮은·높은 발현 양끝에서 범위가 좁다 | 기존 공개 자료의 재분석 |
| Bulk RNA-seq | 전사체 전체의 count. 설계에 따라 isoform·새 전사체도 | 편향 없는 전체 탐색. 표준 흐름과 도구가 확립되어 있다 | 조직 내 세포 유형의 평균값이다. 세포 구성 변화와 발현 변화가 섞인다 | 조건 간 차등발현의 전체 탐색 |
| Single-cell / single-nucleus RNA-seq | 세포(핵) 하나하나의 발현. 수천~수십만 세포 | 세포 유형별 변화와 구성 비율을 분리해 본다 | 세포당 검출 유전자가 적고 0이 많다. 비싸고, 조직 해리 과정이 발현을 바꿀 수 있다 | 어떤 세포 유형에서 변화가 일어나는가 |
| Spatial transcriptomics | 조직 절편 위 위치별 발현 | 조직 구조·이웃 관계를 유지한다 | 방식에 따라 한 측정점에 여러 세포가 섞이거나(스폿 기반), 측정 유전자 수가 제한된다(이미징 기반) | 병변 주변과 먼 곳의 차이, 층·구역별 발현 |

고르는 순서: 후보가 몇 개로 정해져 있으면 qPCR이나 패널, 전체를 탐색하면 bulk RNA-seq, "어느 세포에서"가 질문의 핵심이면 single-cell, "어디에서"가 핵심이면 spatial. 넓게 본 뒤 좁혀 확인하는 조합이 흔하다.

## 표준 분석 흐름

### Bulk RNA-seq

1. **Read QC.** 염기 품질, adapter, 중복률, rRNA 비율을 본다. 도구: [FastQC](https://www.bioinformatics.babraham.ac.uk/projects/fastqc/), [fastp](https://github.com/OpenGene/fastp), 샘플 전체 요약은 [MultiQC](https://multiqc.info/). 입력 FASTQ → QC 보고서. QC: 한 샘플만 분포가 다르면 표시한다.
2. **정렬 또는 pseudo-alignment.** 두 길이 있다. (가) 유전체에 splice를 고려해 정렬: [STAR](https://github.com/alexdobin/STAR) → BAM. (나) 전사체에 직접 배정해 정량: [Salmon](https://salmon.readthedocs.io/en/latest/) → 전사체별 추정 count. 유전자 수준 차등발현만 필요하면 (나)가 빠르고 가볍다. BAM을 눈으로 보거나 새 전사체·변이를 볼 때는 (가). QC: 정렬률(배정률), 유전자 영역에 떨어진 비율. 유난히 낮은 샘플은 오염·분해·잘못된 참조를 의심한다.
3. **Count matrix 만들기.** (가)의 BAM은 featureCounts([Subread](https://github.com/ShiLab-Bioinformatics/subread))로 유전자별 count를 센다. (나)의 결과는 [tximport](https://bioconductor.org/packages/release/bioc/html/tximport.html)로 유전자 수준으로 합친다. BAM + GTF → 유전자 × 샘플 표. 명령의 형태: `featureCounts -a genes.gtf -o counts.txt *.bam`. QC: 열 이름과 샘플 메타데이터가 1:1로 맞는지, 라이브러리의 strand 설정이 맞는지(틀리면 count가 대부분 사라진다).
4. **낮은 발현 필터와 정규화.** 거의 모든 샘플에서 0에 가까운 유전자를 뺀다. 그다음 용도에 따라 값을 나눈다: **검정에는 raw count**를 도구에 그대로 넣고(도구가 내부에서 정규화), **그림·PCA·군집에는 정규화 후 log 계열 변환값**(log-CPM, DESeq2의 VST 등)을 쓴다.
5. **탐색.** 변환값으로 PCA와 샘플 간 상관 heatmap을 그린다. 군이 갈리는지보다 먼저 **무엇이 PC1을 설명하는지**(배치, 성별, RNA 품질, 깊이)를 본다. outlier 후보는 기록하고, 제외는 기술적 근거가 있을 때만 한다.
6. **차등발현 검정.** 유전자마다 같은 모델을 적합한다. 세 도구의 발상:
   - [DESeq2](https://bioconductor.org/packages/release/bioc/vignettes/DESeq2/inst/doc/DESeq2.html): count를 음이항 분포로 모델링. 유전자별 흩어짐을 비슷한 발현 수준의 유전자들 쪽으로 당겨 추정한다.
   - [edgeR](https://bioconductor.org/packages/release/bioc/html/edgeR.html): 같은 음이항 틀. 조성 차이를 TMM으로 보정한다.
   - [limma](https://bioconductor.org/packages/release/bioc/html/limma.html)-voom: log-CPM으로 바꾸고 관측값마다 정밀도 가중치를 준 뒤 선형 모델. 설계가 복잡할 때 유연하다.

   공통점은 **적은 반복에서 유전자 하나의 분산 추정이 불안정하므로 전체 유전자에서 정보를 빌린다**는 것이다. 배치·성별 같은 알려진 요인은 값을 미리 "제거"하지 말고 설계식에 넣는다(예: `~ batch + condition`). 출력: 유전자별 log2FC, p, padj 표.
7. **다중검정 보정.** BH로 조정한 padj로 판단한다. 문턱(흔히 padj < 0.05 또는 0.1)과 효과크기 기준은 결과를 보기 전에 정한다.
8. **Enrichment.** 두 방식 중 고른다.
   - **ORA** (over-representation analysis): 문턱을 넘은 유전자 목록이 gene set에 몰려 있는지 초기하 검정. 입력은 목록 + **배경 집합**. 도구: [g:Profiler](https://biit.cs.ut.ee/gprofiler/gost).
   - **GSEA** (gene set enrichment analysis): 문턱 없이 모든 유전자를 통계량 순으로 줄 세우고, gene set이 위나 아래에 몰려 있는지 본다. 작지만 일관된 변화를 잡는다. 도구와 gene set: [GSEA/MSigDB](https://www.gsea-msigdb.org/gsea/index.jsp).

   gene set 출처([Gene Ontology](https://geneontology.org/), [Reactome](https://reactome.org/), MSigDB)와 버전을 기록한다.
9. **개별 유전자 확인.** 상위 유전자와 관심 유전자를 샘플별 점으로 그려 본다. 한두 샘플이 결과를 끌고 가는지, 방향이 표와 맞는지 확인한다. 중요한 결론은 독립 시료·다른 방법(qPCR, 단백질 수준)으로 확인할 계획을 적는다.

전 과정(1–3단계와 QC)을 묶은 공개 파이프라인: [nf-core/rnaseq](https://nf-co.re/rnaseq).

### Single-cell RNA-seq (흐름만)

1. **세포 QC.** 세포당 총 count, 검출 유전자 수, 미토콘드리아 유전자 비율로 빈 방울·죽어 가는 세포를 거르고, 두 세포가 한 방울에 든 doublet을 제거한다. 문턱은 조직과 실험법에 따라 다르므로 고정값을 베끼지 말고 분포를 보고 정한다.
2. **정규화와 변동 큰 유전자 선택.** 세포별 깊이를 맞추고 log 변환한 뒤, 세포 사이에서 변동이 큰 유전자 수천 개를 고른다.
3. **차원 축소.** PCA로 줄이고, 그 위에서 이웃 그래프를 만든다. UMAP·t-SNE는 **보기 위한 그림**이지 거리를 재는 좌표가 아니다. 여러 샘플·배치는 이 단계에서 통합(integration)한다.
4. **군집 (clustering).** 이웃 그래프에서 군집을 찾는다. 해상도 매개변수에 따라 군집 수가 바뀌므로 "군집 수"는 발견이 아니라 선택이다.
5. **마커와 세포 유형 주석.** 군집별로 두드러진 유전자를 찾아 알려진 마커와 대조한다. 군집을 정의한 같은 데이터로 구한 마커의 p-value는 부풀려져 있으므로 순위로만 쓴다.
6. **조건 간 비교는 pseudobulk로.** 같은 개체에서 나온 세포들은 서로 독립이 아니다. 세포를 표본으로 세면 n이 수천으로 부풀어 거의 모든 유전자가 유의해진다. "개체 × 세포 유형"별로 count를 합쳐 개체를 n으로 삼고, 위 bulk 흐름의 6단계 도구로 검정한다(Squair 2021, 아래).

도구: [Scanpy](https://scanpy.readthedocs.io/en/stable/) (Python), [Seurat](https://satijalab.org/seurat/) (R). 단계별 근거는 [Single-cell best practices](https://www.sc-best-practices.org/) 온라인 책에 정리되어 있다.

## 최소 실행 예시

두 예시는 같은 가상 데이터(유전자 2,000개, 군당 6샘플, 앞의 200개 유전자가 처리군에서 3배)를 쓴다.

### 예시 1 — raw count와 log 변환값의 PCA 비교

```python
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA

rng = np.random.default_rng(1)
n_genes, n_per_group = 2000, 6
samples = [f"ctrl_{i+1}" for i in range(n_per_group)] + [f"treat_{i+1}" for i in range(n_per_group)]

# 가상 raw count: 유전자마다 기본 발현량이 다르고, 앞 200개 유전자는 처리군에서 3배
base = rng.lognormal(mean=4, sigma=1.5, size=n_genes)
fold = np.ones((n_genes, 2 * n_per_group))
fold[:200, n_per_group:] = 3
depth = np.array([1.0, 0.6, 1.4, 0.9, 1.2, 0.7, 1.1, 0.5, 2.0, 0.8, 1.3, 1.6])   # 샘플마다 다른 시퀀싱 깊이
mu = base[:, None] * fold * depth[None, :]
counts = pd.DataFrame(rng.negative_binomial(n=10, p=10 / (10 + mu)),
                      index=[f"gene_{i+1}" for i in range(n_genes)], columns=samples)

print("샘플별 총 read 수 (library size)")
print(counts.sum().to_string())
print()

def pca_report(matrix, label):
    # 행 = 샘플이 되도록 뒤집고, 유전자별 평균을 뺀 뒤 PCA
    x = matrix.T.values
    pca = PCA(n_components=2)
    pcs = pca.fit_transform(x - x.mean(axis=0))
    ratio = pca.explained_variance_ratio_
    print(f"[{label}] PC1 {ratio[0]:.0%}, PC2 {ratio[1]:.0%}")
    out = pd.DataFrame(pcs, index=matrix.columns, columns=["PC1", "PC2"]).round(1)
    out["lib_size_M"] = (counts.sum() / 1e6).round(2)
    print(out.to_string())
    r = np.corrcoef(pcs[:, 0], counts.sum())[0, 1]
    print(f"PC1과 library size의 상관: {r:.2f}")
    print()
    return pcs

# (가) raw count 그대로 PCA — 하면 안 되는 방식
pca_report(counts, "raw count")

# (나) CPM 정규화 후 log2(CPM + 1) — 탐색·시각화용 값
keep = (counts >= 10).sum(axis=1) >= n_per_group          # 낮은 발현 유전자 제거
cpm = counts[keep] / counts[keep].sum() * 1e6
logcpm = np.log2(cpm + 1)
print("필터 후 유전자 수:", int(keep.sum()))
pcs = pca_report(logcpm, "log2(CPM+1)")

# 자기 점검: 정규화 후에는 PC1이 군을 완전히 가른다
is_treat = np.array([s.startswith("treat") for s in samples])
assert pcs[is_treat, 0].min() > pcs[~is_treat, 0].max() or pcs[is_treat, 0].max() < pcs[~is_treat, 0].min()
```

```text
샘플별 총 read 수 (library size)
ctrl_1     348189
ctrl_2     210455
ctrl_3     476050
ctrl_4     316609
ctrl_5     405962
ctrl_6     243572
treat_1    430089
treat_2    201327
treat_3    798366
treat_4    320125
treat_5    486261
treat_6    617935

[raw count] PC1 63%, PC2 12%
             PC1     PC2  lib_size_M
ctrl_1   -4403.5  7289.9        0.35
ctrl_2  -12290.1  2329.0        0.21
ctrl_3    -966.5 -2716.7        0.48
ctrl_4   -7523.8  3292.5        0.32
ctrl_5   -3028.0  2805.7        0.41
ctrl_6  -10865.2  1016.2        0.24
treat_1   2654.4  2215.1        0.43
treat_2 -10113.2  -280.0        0.20
treat_3  31960.4  7386.8        0.80
treat_4  -3503.5 -5509.8        0.32
treat_5   4945.4 -8849.8        0.49
treat_6  13133.5 -8979.0        0.62
PC1과 library size의 상관: 0.97

필터 후 유전자 수: 1758
[log2(CPM+1)] PC1 26%, PC2 9%
          PC1   PC2  lib_size_M
ctrl_1  -11.6   1.2        0.35
ctrl_2  -12.8  -6.3        0.21
ctrl_3  -10.2   1.5        0.48
ctrl_4  -11.9 -12.0        0.32
ctrl_5  -13.4   1.4        0.41
ctrl_6  -12.5  13.6        0.24
treat_1  11.7  -1.5        0.43
treat_2  11.9  10.5        0.20
treat_3  11.5   0.5        0.80
treat_4  13.6  -8.2        0.32
treat_5  11.8   4.9        0.49
treat_6  11.7  -5.7        0.62
PC1과 library size의 상관: 0.42
```

읽는 법: raw count로 PCA를 하면 PC1이 library size와 상관 0.97이다. 가장 깊이 읽은 `treat_3`이 혼자 멀리 있고, 얕게 읽은 `treat_2`는 대조군 사이에 섞여 있다. PCA가 "얼마나 많이 읽었는가"를 보여 주고 있는 것이다. CPM으로 나누고 log2를 취하면 PC1이 군을 가른다(−10대와 +11대). 변환 후에도 library size와 상관이 0.42 남는 것은 이 가상 데이터에서 처리군이 우연히 더 깊이 읽혔기 때문이며, 실제 데이터라면 "깊이와 조건이 겹쳤다"는 경고로 기록할 만한 지점이다.

### 예시 2 — 유전자별 검정과 BH 보정

```python
import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.stats.multitest import multipletests

rng = np.random.default_rng(1)
n_genes, n = 2000, 6
base = rng.lognormal(mean=4, sigma=1.5, size=n_genes)
fold = np.ones((n_genes, 2 * n)); fold[:200, n:] = 3        # 진짜 변한 유전자: 앞 200개
depth = np.array([1.0, 0.6, 1.4, 0.9, 1.2, 0.7, 1.1, 0.5, 2.0, 0.8, 1.3, 1.6])
mu = base[:, None] * fold * depth[None, :]
counts = pd.DataFrame(rng.negative_binomial(n=10, p=10 / (10 + mu)),
                      index=[f"gene_{i+1}" for i in range(n_genes)])
truth = pd.Series(np.arange(n_genes) < 200, index=counts.index)

keep = (counts >= 10).sum(axis=1) >= n
logcpm = np.log2(counts[keep] / counts[keep].sum() * 1e6 + 1)
ctrl, treat = logcpm.iloc[:, :n], logcpm.iloc[:, n:]

# 유전자마다 같은 검정을 반복한다 (Welch t-test: 학습용 대역. 실제 분석은 DESeq2/edgeR/limma)
t, p = stats.ttest_ind(treat, ctrl, axis=1, equal_var=False)
res = pd.DataFrame({"log2FC": treat.mean(axis=1) - ctrl.mean(axis=1), "p": p}, index=logcpm.index)
res["padj"] = multipletests(res["p"], method="fdr_bh")[1]
res["truth"] = truth[res.index]

print("검정한 유전자 수:", len(res), "/ 그중 진짜 변한 유전자:", int(res["truth"].sum()))
for name, hit in [("raw p < 0.05", res["p"] < 0.05),
                  ("BH padj < 0.05", res["padj"] < 0.05),
                  ("Bonferroni < 0.05", res["p"] * len(res) < 0.05)]:
    tp = int((hit & res["truth"]).sum()); fp = int((hit & ~res["truth"]).sum())
    print(f"{name:18s} 선택 {hit.sum():4d}개 | 진짜 {tp:3d} | 가짜 {fp:3d}")
print()
print(res.sort_values("p").head(5).to_string(float_format=lambda v: f"{v:.3g}"))

assert (res["padj"] >= res["p"]).all()      # 보정값은 원래 p보다 작아질 수 없다
```

```text
검정한 유전자 수: 1758 / 그중 진짜 변한 유전자: 188
raw p < 0.05       선택  305개 | 진짜 186 | 가짜 119
BH padj < 0.05     선택  161개 | 진짜 148 | 가짜  13
Bonferroni < 0.05  선택   13개 | 진짜  13 | 가짜   0

          log2FC        p     padj  truth
gene_120     1.8 1.74e-07 0.000307   True
gene_104    1.49 3.96e-06  0.00267   True
gene_133    2.43 4.55e-06  0.00267   True
gene_156    1.82 6.15e-06   0.0027   True
gene_41     1.49 8.56e-06  0.00276   True
```

읽는 법: raw p < 0.05로 고르면 305개 중 119개가 가짜다. BH로 보정하면 161개 중 13개로 줄고, Bonferroni는 가짜가 없지만 진짜 188개 중 13개만 찾는다. BH에서 가짜 비율이 목표 5%보다 조금 높은 것(13/161)은 이 예시가 일부러 단순한 방법을 썼기 때문이다. 200개 유전자가 한 방향으로 크게 오르면 CPM의 분모가 커져 나머지 유전자가 조금씩 내려간 것처럼 보이고(조성 편향), 군당 6개의 t-검정은 분산 추정이 불안정하다. DESeq2·edgeR·limma가 조성 보정과 분산 정보 공유를 넣는 이유가 여기 있다. **실제 분석에는 이 코드가 아니라 그 도구들을 쓴다.**

## 흔한 함정

1. **raw count와 정규화 값을 바꿔 쓴다** → DESeq2·edgeR에 TPM이나 log 값을 넣으면 모델의 가정이 깨지고, 반대로 raw count로 PCA·heatmap을 그리면 깊이와 고발현 유전자 몇 개가 그림을 차지한다 → 검정 도구에는 raw count, 탐색과 그림에는 정규화 + log 계열 변환값. 받은 표가 어느 쪽인지 모르면 정수인지, 열 합계가 얼마인지부터 본다.
2. **배치와 조건이 완전히 겹친다** → 대조군은 월요일, 처리군은 화요일에 처리했다면 요일 효과와 처리 효과를 어떤 통계로도 분리할 수 없다 → 설계 단계에서 각 배치에 모든 조건을 섞어 넣는다. 이미 겹쳤다면 보정 도구로 해결되지 않으며, 한계로 명시하고 결과를 가설 수준으로 낮춘다.
3. **세포를 독립 표본으로 센다 (pseudoreplication)** → 개체 3 대 3에서 나온 세포 수만 개로 검정하면 n이 수만인 것처럼 계산되어 p-value가 터무니없이 작아진다 → 개체 단위로 pseudobulk를 만들어 검정한다. 같은 원리로, 한 개체에서 얻은 여러 절편·기술적 반복도 개체 단위로 합친다.
4. **Enrichment의 배경 유전자 집합을 잘못 잡는다** → 배경을 "전체 유전체"로 두면, 그 조직에서 발현되는(또는 패널에 실린) 유전자의 특성이 그대로 유의하게 나온다. 신경염증 패널 결과를 전체 유전체 대비로 검정하면 무엇을 넣어도 면역 경로가 나온다 → 배경은 **실제로 검정 대상이 된 유전자**(필터를 통과한 유전자, 또는 패널의 유전자)로 지정한다.
5. **fold change의 방향을 확인하지 않는다** → 기준 수준이 알파벳순으로 정해져 "처리/대조"가 아니라 "대조/처리"가 되고, 올라간 유전자와 내려간 유전자가 통째로 뒤바뀐다 → contrast를 명시하고, 잘 아는 유전자 하나를 raw 값으로 직접 확인한다.
6. **문턱을 결과를 보고 고른다** → padj 0.05에서 원하는 유전자가 빠지자 0.1로, log2FC 기준을 1에서 0.5로 옮기면 보고된 오류율은 의미를 잃는다 → 기준을 미리 적고, 바꿨다면 바꿨다고 쓴다.
7. **padj가 작다는 것과 효과가 크다는 것을 같게 본다** → 발현이 높은 유전자는 아주 작은 변화도 유의해지고, 발현이 낮은 유전자는 큰 log2FC가 잡음일 수 있다 → padj, log2FC, 평균 발현량을 함께 보고, 개별 유전자 그림으로 확인한다.
8. **bulk의 변화를 "세포가 그 유전자를 더 발현한다"로 해석한다** → 미세아교세포 마커가 올랐을 때 세포당 발현이 늘었는지 미세아교세포 수가 늘었는지 bulk로는 구분되지 않는다 → 문장을 "조직 수준에서 이 RNA가 늘었다"로 쓰고, 구분이 필요하면 single-cell이나 조직학 자료를 본다.

## 연구 설계 체크리스트

- [ ] 비교할 조건과 contrast(무엇 대 무엇, 어느 쪽이 기준)를 한 문장으로 적었다
- [ ] 생물학적 반복 수가 충분하다. 군당 3은 최소한이며, 벤치마크 연구(Schurch 2016, 아래)는 군당 6 이상을 권한다
- [ ] 통계의 단위가 개체다. 기술적 반복·같은 개체의 여러 세포는 n으로 세지 않는다
- [ ] 추출·라이브러리 제작·시퀀싱 배치마다 모든 조건이 섞여 있고, 배치 정보가 메타데이터에 기록되어 있다
- [ ] 대조군이 질문에 맞다 (같은 조직 부위, 같은 연령·성별 분포, 같은 처리 과정)
- [ ] 샘플 메타데이터에 조건, 배치, 성별, 나이, RNA 품질 지표, 채취 시각·부위가 있다
- [ ] count matrix의 열과 메타데이터의 행이 이름으로 1:1 대응됨을 확인했다 (순서로 붙이지 않는다)
- [ ] 받은 값이 raw count인지 정규화 값인지, 어느 참조 유전체·주석 버전으로 만들었는지 안다
- [ ] 유의성 기준(padj 문턱, log2FC 기준)과 enrichment의 배경 집합을 결과를 보기 전에 정했다
- [ ] 탐색적 분석(가설 생성)과 확증적 분석(사전에 정한 가설 검정)을 구분해 보고할 계획이다
- [ ] 핵심 결과를 확인할 방법이 있다 (독립 코호트, 공개 자료에서의 재현, 다른 측정법)

## 공개 데이터와 더 볼 곳

**저장소**

| 이름 | URL | 무엇이 있나 |
|---|---|---|
| GEO | <https://www.ncbi.nlm.nih.gov/geo/> | 발현 연구의 처리된 표와 메타데이터. microarray부터 single-cell까지 |
| ArrayExpress (BioStudies) | <https://www.ebi.ac.uk/biostudies/arrayexpress> | EMBL-EBI의 기능 유전체 자료 |
| SRA | <https://www.ncbi.nlm.nih.gov/sra> | 원시 FASTQ |
| GTEx | <https://gtexportal.org/home/> | 사람의 여러 정상 조직(뇌 부위 포함) 발현 |
| CZ CELLxGENE | <https://cellxgene.cziscience.com/> | 표준화된 single-cell 자료와 브라우저 |
| NASA OSDR | <https://osdr.nasa.gov/bio/> | 우주 생명과학 오믹스 자료. 본 과정의 OSD-536이 여기 있다 |
| AD Knowledge Portal | <https://adknowledgeportal.synapse.org/> | 알츠하이머병 코호트의 전사체 등 (일부는 승인 필요) |
| MSigDB | <https://www.gsea-msigdb.org/gsea/msigdb/> | enrichment용 gene set 모음 |
| GENCODE | <https://www.gencodegenes.org/> | 사람·마우스 유전자 주석(GTF) |

**공식 문서·튜토리얼**

- DESeq2 vignette (정규화·설계식·결과 해석의 기준 문서): <https://bioconductor.org/packages/release/bioc/vignettes/DESeq2/inst/doc/DESeq2.html>
- limma 사용자 안내서: <https://bioconductor.org/packages/release/bioc/vignettes/limma/inst/doc/usersguide.pdf>
- Harvard Chan Bioinformatics Core, 차등발현 입문 교재: <https://hbctraining.github.io/Intro-to-DGE/>
- Galaxy Training Network (설치 없이 브라우저에서 RNA-seq 실습): <https://training.galaxyproject.org/>
- Single-cell best practices: <https://www.sc-best-practices.org/>
- NanoString nCounter 개요(제조사): <https://nanostring.com/products/ncounter-analysis-system/ncounter-systems-overview/>

**핵심 논문**

- Conesa A, et al. A survey of best practices for RNA-seq data analysis. *Genome Biol.* 2016;17:13. doi:[10.1186/s13059-016-0881-8](https://doi.org/10.1186/s13059-016-0881-8)
- Love MI, Huber W, Anders S. Moderated estimation of fold change and dispersion for RNA-seq data with DESeq2. *Genome Biol.* 2014;15:550. doi:[10.1186/s13059-014-0550-8](https://doi.org/10.1186/s13059-014-0550-8)
- Schurch NJ, et al. How many biological replicates are needed in an RNA-seq experiment and which differential expression tool should you use? *RNA.* 2016;22:839–851. doi:[10.1261/rna.053959.115](https://doi.org/10.1261/rna.053959.115)
- Leek JT, et al. Tackling the widespread and critical impact of batch effects in high-throughput data. *Nat Rev Genet.* 2010;11:733–739. doi:[10.1038/nrg2825](https://doi.org/10.1038/nrg2825)
- Subramanian A, et al. Gene set enrichment analysis: a knowledge-based approach for interpreting genome-wide expression profiles. *Proc Natl Acad Sci USA.* 2005;102:15545–15550. doi:[10.1073/pnas.0506580102](https://doi.org/10.1073/pnas.0506580102)
- Timmons JA, Szkop KJ, Gallagher IJ. Multiple sources of bias confound functional enrichment analysis of global -omics data. *Genome Biol.* 2015;16:186. doi:[10.1186/s13059-015-0761-7](https://doi.org/10.1186/s13059-015-0761-7)
- Luecken MD, Theis FJ. Current best practices in single-cell RNA-seq analysis: a tutorial. *Mol Syst Biol.* 2019;15:e8746. doi:[10.15252/msb.20188746](https://doi.org/10.15252/msb.20188746)
- Heumos L, et al. Best practices for single-cell analysis across modalities. *Nat Rev Genet.* 2023;24:550–572. doi:[10.1038/s41576-023-00586-w](https://doi.org/10.1038/s41576-023-00586-w)
- Squair JW, et al. Confronting false discoveries in single-cell differential expression. *Nat Commun.* 2021;12:5692. doi:[10.1038/s41467-021-25960-2](https://doi.org/10.1038/s41467-021-25960-2)

## 본 과정과의 연결

본 과정 2–3주차의 OSD-536 프로젝트는 NanoString nCounter 패널 데이터로 이 가이드의 4–9단계를 실제로 수행한다. 패널 데이터이므로 FASTQ·정렬 단계는 없다.

| 이 가이드의 부분 | 자세히 다루는 레슨 |
|---|---|
| FASTQ와 count matrix 파일 읽기 | [Day 6 — 생물학·생체신호 파일 형식](../lessons/week-1/day-06.md) |
| log2 fold change의 뜻 | [Day F5 — 함수와 라이브러리](../lessons/week-0/day-F5.md) |
| p-value·효과크기·신뢰구간 | [Day 9 — 효과크기, 신뢰구간, p-value](../lessons/week-2/day-09.md) |
| 다중검정과 BH 보정 | [Day 10 — FDR과 다중검정](../lessons/week-2/day-10.md) |
| 반복·배치·교란, 설계식 | [Day 11 — 반복, 배치, 교란, 대조군](../lessons/week-2/day-11.md) |
| 패널 기반 연구 설계 읽기 (nCounter) | [Day 12 — OSD-536 연구 설계 읽기](../lessons/week-2/day-12.md) |
| raw count·정규화·log 변환의 용도 구분 | [Day 13 — 분자 데이터 전처리와 QC](../lessons/week-2/day-13.md) |
| PCA와 heatmap 읽기 | [Day 14 — PCA와 heatmap](../lessons/week-2/day-14.md) |
| 샘플 표와 유전자 행렬을 이름으로 연결 | [Day 16 — 샘플과 유전자 행렬 연결](../lessons/week-3/day-16.md) |
| 대조 프로브·housekeeping 정규화, 탐색 | [Day 17 — 탐색적 분석](../lessons/week-3/day-17.md) |
| 차등발현 표, contrast 방향 | [Day 18 — 차등발현 결과 읽기](../lessons/week-3/day-18.md) |
| 개별 유전자 확인 | [Day 19 — 후보 유전자 개별 검토](../lessons/week-3/day-19.md) |
| ORA와 배경 유전자 집합 | [Day 20 — pathway 수준 해석](../lessons/week-3/day-20.md) |

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
