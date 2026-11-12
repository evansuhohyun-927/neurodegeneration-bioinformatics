# Day A7 — Bioconductor 분석 맛보기와 재현성: 선형 모델, limma·DESeq2의 발상, sessionInfo, renv

> **주차:** 심화 파트 A — R과 Bioconductor · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/A/A7_models.R`, `reports/advanced/A/sessionInfo.txt`
>
> **먼저 끝내 둘 레슨:** Day A6. 복습: [Day 10 — FDR과 다중검정](../../week-2/day-10.md), [Day 11 — 반복, 배치, 교란, 대조군](../../week-2/day-11.md), [Day 18 — 차등발현 결과 표](../../week-3/day-18.md), [Day 38 — 재현성](../../week-6/day-38.md).

## 오늘의 목표
- `model.matrix(~ batch + group)`으로 설계 행렬을 만들고, 유전자마다 선형 모델을 적합해 BH 보정까지 할 수 있다.
- limma(분산 정보 빌려 오기)와 DESeq2(count 분포 모델)의 발상을 설명하고, 3주차 nCounter 데이터에 RNA-seq count 모델을 그대로 쓰면 안 되는 이유를 말할 수 있다.
- `sessionInfo()`와 renv로 R 분석 환경을 기록·복원하는 방법을 설명하고, 결과를 파일로 남길 수 있다.

## 🎬 영상으로 먼저 보기

- [limma eBayes Explained: Variance Shrinkage and the Moderated t — MetricGate](https://www.youtube.com/watch?v=NSkM9A0pFls) (2:53)
- **무엇에 주목할까:** 유전자 하나의 분산을 다른 유전자들의 분산 쪽으로 "당긴다"는 그림 하나만 가져가면 됩니다. 오늘 예시 2가 그 당김을 숫자로 보여 줍니다.

- [How to Manage R Package Versions per Project with renv: Reproducible Environments — Posit PBC](https://www.youtube.com/watch?v=yjlEbIDevOs) (20:50)
- **무엇에 주목할까:** `renv::init()` → `renv::snapshot()` → `renv::restore()`의 세 단계와 `renv.lock` 파일의 역할을 보세요. 본 과정의 `environment.yml`이 R에서는 무엇에 해당하는지 찾는 영상입니다.

## 개념 설명

### 설계 행렬: 실험 설계를 숫자로 적기

2주차에 배치와 조건이 겹치면 분리할 수 없고, 알려진 배치는 값에서 "빼지" 말고 모델에 넣으라고 배웠습니다. R에서 그 "모델에 넣는" 일은 **formula**와 **설계 행렬(design matrix)** 로 합니다. `~ batch + group`이라고 쓰면 `model.matrix()`가 샘플마다 한 행인 0/1 표를 만듭니다. 첫 열(Intercept)은 기준 샘플(b1 배치의 ctrl)의 평균, `batchb2` 열은 b2 배치에서 더해지는 양, `grouptreat` 열은 **같은 배치 안에서** 처리군이 더해지는 양입니다. 우리가 알고 싶은 처리 효과가 `grouptreat` 계수이고, 기준이 ctrl이 된 것은 Day A3에서 factor 수준을 그렇게 정했기 때문입니다.

이렇게 적어 두면 유전자마다 `lm(값 ~ batch + group)`을 적합해 처리 효과와 그 p-value를 얻을 수 있습니다. 유전자 수백 개를 검정하므로, 2주차에 배운 대로 `p.adjust(p, method = "BH")`로 FDR을 통제합니다. limma, DESeq2, edgeR도 겉모습은 다르지만 모두 이 설계 행렬을 입력으로 받습니다. 설계 행렬을 읽을 줄 알면 어떤 도구의 Methods 절이든 "무엇을 무엇과 비교했고 무엇을 보정했는지"를 읽을 수 있습니다.

### limma의 발상: 분산을 다른 유전자에게서 빌려 온다

군당 3개처럼 반복이 적으면 유전자 하나의 분산 추정이 크게 흔들립니다. 우연히 세 값이 아주 가깝게 나온 유전자는 분산이 0에 가깝게 추정되고, 작은 차이에도 t 값이 폭발해 거짓 양성이 됩니다. 반대로 진짜 변한 유전자도 분산이 우연히 크게 잡히면 놓칩니다.

**limma**는 "유전자들의 분산은 서로 완전히 남남이 아니다"라는 생각에서 출발합니다. 전체 유전자 분산의 분포를 보고, 유전자 하나의 분산을 그 공통값 쪽으로 **적당히 당긴(shrink)** 뒤 t 통계량을 계산합니다. 이것을 **moderated t**라고 하고, 얼마나 당길지를 데이터에서 정하는 방법이 경험적 베이즈(empirical Bayes, limma의 `eBayes()`)입니다. 비유하자면, 신입 연구원 한 명의 측정 3번만 보고 그 사람의 측정 오차를 단정하지 않고, 실험실 전체의 평소 오차를 함께 참고하는 것입니다. 측정이 많을수록 개인의 값을 더 믿고, 적을수록 실험실 평균 쪽을 더 믿습니다.

limma는 원래 microarray처럼 **log 척도의 연속값**을 위해 만들어졌습니다. RNA-seq count에 쓰려면 count를 log-CPM으로 바꾸고 관측값마다 정밀도 가중치를 주는 **voom** 단계를 앞에 붙입니다.

### DESeq2의 발상, 그리고 nCounter에서 지킬 원칙

**DESeq2**(와 edgeR)는 RNA-seq의 **raw read count**를 직접 모델링합니다. count가 음이항(negative binomial) 분포를 따른다고 보고, 샘플마다 sequencing depth를 보정하는 size factor를 추정하며, 유전자별 흩어짐(dispersion)을 비슷한 발현 수준의 유전자들 쪽으로 당겨 추정합니다. "정보를 빌려 온다"는 점은 limma와 같지만, 대상이 RNA-seq의 시퀀싱 과정에서 생기는 count라는 점이 핵심입니다.

여기서 본 과정의 원칙을 다시 확인합니다. **3주차 OSD-536의 NanoString nCounter 데이터에는 DESeq2·edgeR 같은 RNA-seq count 모델을 그대로 쓰지 않습니다.** nCounter count는 정해진 프로브에 붙은 분자를 직접 센 값이고, library size 대신 positive 대조와 housekeeping 유전자로 정규화하며(Day 17), 배경 잡음을 negative 대조로 판단합니다. 생성 과정이 다르니 RNA-seq용 분포 가정과 depth 보정이 맞는다는 보장이 없습니다. 인터넷의 RNA-seq 튜토리얼을 nCounter 파일에 그대로 따라 하면 안 되는 이유가 이것입니다(Day 18).

그래서 nCounter 같은 패널 데이터에서는 보통 (1) 대조 프로브·housekeeping으로 정규화한 **log 척도 값**에 선형 모델(오늘 예시 1–2의 방식, 또는 limma의 선형 모델 부분)을 쓰거나, (2) nCounter 전용으로 만들어진 Bioconductor 패키지(예: [NanoTube](https://bioconductor.org/packages/release/bioc/html/NanoTube.html), [NanoStringDiff](https://bioconductor.org/packages/release/bioc/html/NanoStringDiff.html))를 씁니다. 어느 쪽이든 그 데이터의 원 논문이 쓴 방법을 먼저 확인하고, 왜 그 방법을 골랐는지 보고서에 적습니다. 그리고 결과는 늘 그렇듯 작은 표본의 탐색적 결과, 즉 가설 생성으로 읽습니다.

### 재현성: R에서는 sessionInfo, renv, Quarto

Day 38에서 재현성의 네 재료(환경, 실행 순서, 데이터 받는 법, random seed)를 배웠습니다. R에서 각각에 해당하는 도구는 이렇습니다.

| 재료 | Python(본 과정) | R |
|---|---|---|
| 환경 기록 | `environment.yml`, `pip freeze` | `sessionInfo()` 출력 저장, `renv.lock` |
| 환경 복원 | `conda env create -f environment.yml` | `renv::restore()` |
| 실행 순서 | 노트북 Run All | `Rscript 스크립트.R`, Quarto 문서 render |
| seed | `np.random.default_rng(SEED)` | `set.seed(SEED)` |

**`sessionInfo()`** 는 R 버전, 운영체제, 불러온 패키지와 버전을 한 번에 보여 줍니다. 분석 스크립트 맨 끝에서 파일로 저장해 두면 논문 Methods와 보충자료에 쓸 정보가 남습니다. 단, 이것은 "기록"일 뿐 "복원"은 해 주지 않습니다.

**renv**는 프로젝트마다 별도의 패키지 라이브러리를 두고, 쓰인 패키지와 정확한 버전을 `renv.lock`에 적습니다. `renv::init()`으로 시작하고, 패키지를 바꿀 때마다 `renv::snapshot()`으로 lock 파일을 갱신하며, 다른 컴퓨터에서는 `renv::restore()`로 같은 버전을 설치합니다. `renv.lock`은 저장소에 올리고, 프로젝트 안의 `renv/library/` 폴더(실제 패키지 파일)는 올리지 않습니다. Bioconductor 패키지도 renv가 기록합니다.

**Quarto**(`.qmd`)는 글과 R 코드와 결과를 한 문서에 묶어 HTML·PDF·Word로 내보내는 도구입니다(예전의 R Markdown과 같은 역할이며, 최신 RStudio에 함께 들어 있습니다). 문서를 render할 때마다 코드가 처음부터 다시 실행되므로, "보고서의 숫자가 지금 코드에서 나온 것"임이 보장됩니다. 본 과정 최종 보고서를 Jupyter로 만들었던 것과 같은 역할입니다.

## 예시로 이해하기

> 모든 값은 연습용 **가상 값**입니다. 유전자 300개, 샘플 6개(군당 3), 배치 2개이며, 앞 30개 유전자만 처리군에서 log2 값이 1.5 올라가도록 만들었습니다. 정규화를 마친 log 척도 값이라고 가정합니다. 아래 코드를 `a7_data.R`로 저장해 예시 1–2가 불러옵니다.

```r
# a7_data.R
set.seed(2024)
n_genes <- 300; n_per <- 3
meta <- data.frame(sample = sprintf("S%d", 1:6),
                   group = factor(rep(c("ctrl", "treat"), each = n_per), levels = c("ctrl", "treat")),
                   batch = factor(c("b1", "b2", "b1", "b2", "b1", "b2")))
gene_sd <- sqrt(0.05 * 3 / rchisq(n_genes, df = 3))          # 유전자마다 다른 잡음 크기
truth <- seq_len(n_genes) <= 30                               # 앞 30개만 진짜 변화
y <- matrix(rnorm(n_genes * 6, mean = 8, sd = rep(gene_sd, 6)), nrow = n_genes,
            dimnames = list(sprintf("gene%03d", 1:n_genes), meta$sample))
y[truth, meta$group == "treat"] <- y[truth, meta$group == "treat"] + 1.5
y[, meta$batch == "b2"] <- y[, meta$batch == "b2"] + 0.3      # 배치 효과
```

### 예시 1 — 설계 행렬과 유전자별 선형 모델

```r
source("a7_data.R")
design <- model.matrix(~ batch + group, data = meta)
design
fit_one <- function(v) {
  co <- summary(lm(v ~ batch + group, data = meta))$coefficients
  c(log2FC = co["grouptreat", "Estimate"], p = co["grouptreat", "Pr(>|t|)"])
}
res <- as.data.frame(t(apply(y, 1, fit_one)))
res$padj <- p.adjust(res$p, method = "BH")
head(res[order(res$p), ], 5)
c(raw_p = sum(res$p < 0.05), BH = sum(res$padj < 0.05),
  BH_true = sum(res$padj < 0.05 & truth))
```

출력:

```text
  (Intercept) batchb2 grouptreat
1           1       0          0
2           1       1          0
3           1       0          0
4           1       1          1
5           1       0          1
6           1       1          1
attr(,"assign")
[1] 0 1 2
attr(,"contrasts")
attr(,"contrasts")$batch
[1] "contr.treatment"

attr(,"contrasts")$group
[1] "contr.treatment"

          log2FC            p       padj
gene020 1.381015 0.0001412705 0.02366713
gene028 1.470847 0.0002233953 0.02366713
gene021 1.530572 0.0002366713 0.02366713
gene011 1.413596 0.0003711547 0.02783660
gene014 1.312508 0.0013503271 0.06119753
  raw_p      BH BH_true 
     42       4       4 
```

설계 행렬의 각 행이 샘플 하나입니다. 샘플 4는 b2 배치의 처리군이라 `batchb2`와 `grouptreat`가 모두 1입니다. 아래 `attr` 줄들은 factor를 0/1로 바꾼 방식(기준 수준과 비교하는 treatment 대비)의 기록이니 지금은 넘어가도 됩니다. 결과를 보면 raw p < 0.05인 유전자는 42개인데, 진짜 변한 유전자는 30개뿐이므로 상당수가 우연입니다. BH로 보정하면 4개만 남고 모두 진짜입니다. 거짓 양성은 막았지만 진짜 30개 중 26개를 놓쳤습니다. 군당 3개로는 유전자 하나씩의 검정이 힘이 약하다는 뜻입니다.

### 예시 2 — limma의 발상을 손으로: 분산 당기기

```r
source("a7_data.R")
X <- model.matrix(~ batch + group, data = meta)
fit <- lm.fit(X, t(y))                                   # 모든 유전자를 한 번에 적합
df_res <- nrow(X) - ncol(X)
s2 <- colSums(fit$residuals^2) / df_res                  # 유전자별 잔차 분산
XtXinv <- solve(crossprod(X))
beta <- fit$coefficients["grouptreat", ]
se_unit <- sqrt(XtXinv["grouptreat", "grouptreat"])
t_ord <- beta / (sqrt(s2) * se_unit)
p_ord <- 2 * pt(-abs(t_ord), df_res)
# shortcut: d0와 s0^2를 고정값으로 둔다. limma는 이 둘을 데이터에서 추정한다(eBayes)
d0 <- 4; s0sq <- median(s2)
s2_mod <- (d0 * s0sq + df_res * s2) / (d0 + df_res)     # 유전자 분산을 공통값 쪽으로 당김
t_mod <- beta / (sqrt(s2_mod) * se_unit)
p_mod <- 2 * pt(-abs(t_mod), df_res + d0)
truth <- seq_len(nrow(y)) <= 30
summ <- function(p) { hit <- p.adjust(p, "BH") < 0.05; c(selected = sum(hit), true = sum(hit & truth), false = sum(hit & !truth)) }
rbind(ordinary_t = summ(p_ord), moderated_t = summ(p_mod))
smallest <- order(s2)[1:3]
round(cbind(s2 = s2[smallest], s2_mod = s2_mod[smallest]), 4)
stopifnot(all(abs(beta - apply(y, 1, function(v) coef(lm(v ~ batch + group, data = meta))["grouptreat"])) < 1e-8))
```

출력:

```text
            selected true false
ordinary_t         4    4     0
moderated_t       31   28     3
            s2 s2_mod
gene136 0.0003 0.0259
gene265 0.0023 0.0268
gene059 0.0023 0.0268
```

`lm.fit()`은 유전자 300개를 한꺼번에 적합하는 저수준 함수입니다. 마지막 `stopifnot` 줄이 예시 1의 `lm()`과 계수가 같음을 확인합니다. 보통 t(`ordinary_t`)는 예시 1과 같은 4개를 고릅니다. 분산을 당긴 moderated t는 31개를 골랐고 그중 28개가 진짜, 3개가 거짓입니다(31개 중 약 10%). 거짓이 0개에서 3개로 늘었다는 점도 함께 보세요. FDR 5% 통제는 평균적인 약속이고, 한 번의 결과에서 거짓 비율이 그보다 높게 나올 수도 있습니다. 아래 표는 분산이 가장 작게 추정된 유전자 셋입니다. 0.0003처럼 우연히 작게 나온 분산이 공통값 근처(약 0.026)로 끌어올려져, "분산이 작아서 생기는 가짜 큰 t"가 줄어듭니다. 자유도도 3에서 3 + d0 = 7로 늘어 검정력이 올라갑니다.

이 코드는 발상을 보여 주려는 **학습용 대역**입니다. `d0`와 `s0sq`를 고정값으로 정했지만, 실제 limma는 이 둘을 전체 유전자 분산 분포에서 추정하고, 발현 수준에 따른 추세까지 고려할 수 있습니다. 실제 분석에는 이 코드가 아니라 limma를 씁니다.

### 예시 3 — 실제 도구의 모양: limma와 DESeq2

> 설치: `BiocManager::install(c("limma", "DESeq2"))`. 아래 출력은 R 4.3.2 + Bioconductor 3.18(limma, DESeq2 1.42.1)에서 실행한 그대로입니다. 함수 이름과 인자는 각 패키지의 공식 문서([limma](https://bioconductor.org/packages/release/bioc/html/limma.html), [DESeq2](https://bioconductor.org/packages/release/bioc/html/DESeq2.html))에서 설치한 버전에 맞춰 확인하세요.

```r
# (가) limma: 정규화된 log 척도 행렬 y와 meta가 있을 때 (예시 1–2의 진짜 도구판)
library(limma)
design <- model.matrix(~ batch + group, data = meta)
fit <- lmFit(y, design)
fit <- eBayes(fit)                       # 예시 2의 '분산 당기기'를 데이터로부터 추정
topTable(fit, coef = "grouptreat", number = 10, adjust.method = "BH")

# (나) DESeq2: RNA-seq의 raw count 정수 행렬일 때만. nCounter 정규화 값에는 쓰지 않는다
library(DESeq2)
set.seed(7)                                   # 연습용 가상 RNA-seq count (y와 같은 크기·같은 진짜 변화)
mu <- matrix(200, nrow(y), ncol(y), dimnames = dimnames(y))
mu[truth, meta$group == "treat"] <- 200 * 2^1.5
raw_counts <- matrix(rnbinom(length(mu), mu = mu, size = 10), nrow(y), dimnames = dimnames(y))
dds <- DESeqDataSetFromMatrix(countData = raw_counts, colData = meta, design = ~ batch + group)
dds <- DESeq(dds, quiet = TRUE)
res <- results(dds, contrast = c("group", "treat", "ctrl"))
head(res[order(res$pvalue), ], 5)
c(BH = sum(res$padj < 0.05, na.rm = TRUE), BH_true = sum(res$padj < 0.05 & truth, na.rm = TRUE))
is(dds, "SummarizedExperiment")
```

출력 (가)의 `topTable`:

```text
           logFC  AveExpr         t      P.Value   adj.P.Val        B
gene021 1.530572 8.905316 10.411649 4.259483e-05 0.004068793 2.905341
gene028 1.470847 8.890946 10.073948 5.153826e-05 0.004068793 2.714762
gene020 1.381015 8.874323  9.646133 6.616927e-05 0.004068793 2.462658
gene011 1.413596 8.869767  9.527368 7.104739e-05 0.004068793 2.390457
gene027 1.629679 8.863229  9.350477 7.910438e-05 0.004068793 2.281066
gene002 1.693190 8.964544  9.304346 8.137585e-05 0.004068793 2.252167
gene017 1.381692 8.950872  8.547233 1.319344e-04 0.004506015 1.754705
gene023 1.558961 8.778328  8.388112 1.467289e-04 0.004506015 1.644300
gene004 1.605775 8.814415  8.313363 1.543334e-04 0.004506015 1.591694
gene014 1.312508 8.938527  8.263461 1.596630e-04 0.004506015 1.556307
```

출력 (나):

```text
converting counts to integer mode
log2 fold change (MLE): group treat vs ctrl 
Wald test p-value: group treat vs ctrl 
DataFrame with 5 rows and 6 columns
         baseMean log2FoldChange     lfcSE      stat      pvalue        padj
        <numeric>      <numeric> <numeric> <numeric>   <numeric>   <numeric>
gene004   354.664        1.87164  0.359449   5.20696 1.91960e-07 1.40131e-05
gene021   361.785        1.55357  0.337078   4.60893 4.04753e-06 1.14784e-04
gene014   378.455        1.62676  0.355970   4.56992 4.87915e-06 1.14784e-04
gene027   350.834        1.75992  0.389672   4.51641 6.28956e-06 1.14784e-04
gene019   316.314        1.71160  0.385261   4.44271 8.88335e-06 1.29123e-04
     BH BH_true 
     24      23 
[1] TRUE
```

limma의 상위 10개가 모두 앞 30개(진짜 변화) 안에 있고, 예시 2에서 손으로 만든 moderated t와 같은 방향으로 움직입니다. DESeq2는 별도로 만든 가상 count라 순위가 다르지만, BH 기준 24개 중 23개가 진짜 변화 유전자입니다. 마지막 `TRUE`는 DESeq2 객체가 Day A6의 SummarizedExperiment를 상속했다는 뜻입니다. `converting counts to integer mode`는 오류가 아니라 count를 정수형으로 바꿨다는 안내입니다.

두 도구 모두 입력이 **행렬 + 샘플 표 + 설계식**이라는 점, 그리고 contrast 방향(`treat` 대 `ctrl`)을 명시한다는 점을 보세요. `DESeqDataSetFromMatrix`가 만드는 객체는 Day A6의 SummarizedExperiment를 상속한 S4 객체입니다.

### 예시 4 — 환경 기록 남기기

```r
suppressPackageStartupMessages(library(dplyr))
si <- sessionInfo()
si$R.version$version.string
names(si$otherPkgs)
dir.create("reports/advanced/A", recursive = TRUE, showWarnings = FALSE)
writeLines(capture.output(si), "reports/advanced/A/sessionInfo.txt")
length(readLines("reports/advanced/A/sessionInfo.txt")) > 5
proj <- file.path(tempdir(), "demo_proj"); dir.create(proj, showWarnings = FALSE)
writeLines(c("library(dplyr)", "library(ggplot2)", "x <- stats::median(1:3)"), file.path(proj, "analysis.R"))
deps <- renv::dependencies(proj, progress = FALSE)
sort(unique(deps$Package))
```

이 레슨을 쓴 컴퓨터의 출력:

```text
[1] "R version 4.3.2 (2023-10-31)"
[1] "dplyr"
[1] TRUE
[1] "dplyr"   "ggplot2" "stats"
```

`sessionInfo()`의 전체 출력은 길어서 파일로 저장하고, 여기서는 R 버전과 `library()`로 불러온 패키지 이름만 꺼냈습니다. `renv::dependencies()`는 폴더 안의 R 파일을 읽어 어떤 패키지를 쓰는지 찾아 줍니다. 아무것도 설치하지 않으므로 지금 바로 써 볼 수 있습니다. `library()`뿐 아니라 `stats::median`처럼 `::`로 부른 패키지도 잡아낸다는 점을 보세요. renv가 `renv.lock`에 기록할 대상이 바로 이 목록입니다.

renv를 실제 프로젝트에 적용하는 명령은 아래와 같습니다. 이 명령은 프로젝트 폴더에 `renv/`와 `renv.lock`을 만들고 패키지를 프로젝트 라이브러리로 설치하므로, 연습은 저장소가 아닌 별도의 빈 폴더에서 하세요. 이 레슨을 쓸 때 빈 연습 폴더(R 파일 하나)에서 네 명령을 차례로 실행해 `renv/`, `renv.lock`, `.Rprofile`이 생기고 `renv::status()`가 동기화됨(synchronized)으로 나오는 것을 확인했습니다. 스크립트에서 실행할 때는 `renv::init(restart = FALSE)`, `renv::snapshot(prompt = FALSE)`처럼 확인 질문을 끄는 인자를 붙입니다.

```r
renv::init()       # 프로젝트 전용 라이브러리를 만들고 지금 쓰는 패키지를 기록
renv::snapshot()   # 패키지를 추가·변경한 뒤 renv.lock 갱신
renv::status()     # 코드와 lock 파일이 어긋난 곳 확인
renv::restore()    # 다른 컴퓨터에서 lock 파일대로 설치
```

## 직접 해보기

1. `notebooks/advanced/A/a7_data.R`과 `notebooks/advanced/A/A7_models.R`을 만들고 예시 1, 2, 4를 실행합니다.
2. **배치를 빼면?** 예시 1의 모델을 `~ group`으로 바꿔 다시 돌리고, BH 통과 유전자 수와 상위 유전자의 p-value가 어떻게 바뀌는지 적습니다. 배치를 모델에 넣는 것이 왜 도움이 되는지 Day 11과 연결해 한 문장으로 씁니다.
3. **기준 수준 뒤집기.** `meta$group <- relevel(meta$group, ref = "treat")`로 바꾼 뒤 예시 1을 다시 돌려, 계수 이름과 log2FC의 부호가 어떻게 바뀌는지 확인합니다.
4. **당기는 세기 바꾸기.** 예시 2의 `d0`를 0, 4, 50으로 바꿔 가며 `moderated_t` 행이 어떻게 변하는지 표로 적습니다. `d0 = 0`이 보통 t와 같아지는 이유, `d0`가 아주 크면 무엇에 가까워지는지를 생각해 봅니다.
5. **환경 기록.** 예시 4를 실행해 `reports/advanced/A/sessionInfo.txt`를 만들고, 파일을 열어 R 버전과 불러온 패키지를 확인합니다. 이 파일을 본 과정 Day 38의 버전 기록과 같은 위치에 함께 보관합니다.
6. **(선택) renv 체험.** 저장소 밖에 빈 폴더를 만들고 RStudio 프로젝트로 연 뒤, 예시 4 아래의 renv 명령을 차례로 실행해 `renv.lock`이 어떻게 생겼는지 열어 봅니다.
7. **(선택) Quarto 보고서.** RStudio에서 File → New File → Quarto Document로 `.qmd`를 만들고, 예시 1의 코드를 코드 칸에 넣어 Render해 봅니다. 맨 아래 코드 칸에 `sessionInfo()`를 두는 습관을 들입니다.

⚠️ **흔한 오류 1 — 설계식의 factor 기준이 의도와 다르다.** 계수 이름이 `groupctrl`로 나오면 treat가 기준이 된 것이고, log2FC의 부호가 반대입니다. 모델을 돌리기 전에 `levels(meta$group)`를 확인합니다.

⚠️ **흔한 오류 2 — 이미 정규화·log 변환한 값을 DESeq2에 넣는다.** DESeq2는 raw 정수 count를 기대합니다. 정수가 아니라는 오류가 나면 입력이 잘못된 것이고, 정수로 반올림해 억지로 넣는 것은 해결책이 아닙니다. 그리고 nCounter 데이터라면 애초에 이 도구가 맞는지부터 다시 확인합니다.

## 퀴즈

**1.** `model.matrix(~ batch + group)`에서 `grouptreat` 계수가 뜻하는 것은?

(a) 처리군 전체 평균 (b) 같은 배치 안에서 처리군이 대조군보다 높은 정도 (c) 배치 효과 (d) 대조군 평균

<details><summary>정답 보기</summary>

(b). 배치를 함께 넣었으므로 배치 차이를 고려한 뒤의 처리 효과입니다. 기준이 ctrl인 것은 factor의 첫 수준이 ctrl이기 때문입니다.

</details>

**2.** 군당 3개처럼 반복이 적을 때 limma의 moderated t가 보통 t보다 유리한 이유를 한 문장으로 쓰세요. (단답)

<details><summary>정답 보기</summary>

유전자 하나의 분산 추정이 불안정하므로, 다른 유전자들의 분산 정보를 빌려 공통값 쪽으로 당기면 우연히 작게 추정된 분산 때문에 생기는 가짜 큰 t가 줄고, 자유도가 늘어 검정력이 올라가기 때문입니다.

</details>

**3.** 3주차 OSD-536 nCounter 데이터의 차등발현 분석으로 이 과정의 원칙에 맞는 것은?

(a) 정규화 값을 반올림해 DESeq2에 넣는다 (b) RNA-seq 튜토리얼의 edgeR 코드를 그대로 쓴다 (c) 대조 프로브·housekeeping으로 정규화한 log 값에 선형 모델을 쓰거나 nCounter 전용 도구를 쓰고, 원 논문의 방법을 확인한다 (d) 차등발현은 할 수 없다

<details><summary>정답 보기</summary>

(c). nCounter count는 RNA-seq read count와 생성 과정과 정규화 방식이 다르므로 RNA-seq count 모델의 가정이 맞는다는 보장이 없습니다. 어떤 방법을 왜 골랐는지 보고서에 적고, 결과는 가설 생성으로 읽습니다.

</details>

**4.** `sessionInfo()`와 `renv.lock`의 차이로 알맞은 것은?

(a) 둘 다 환경을 자동으로 복원한다 (b) sessionInfo는 기록만, renv.lock은 `renv::restore()`로 같은 버전을 다시 설치하는 데 쓰인다 (c) sessionInfo는 Python용이다 (d) renv.lock은 데이터 파일 목록이다

<details><summary>정답 보기</summary>

(b). sessionInfo는 "그때 무엇을 썼는지"의 기록이고, renv.lock은 그 상태를 다른 컴퓨터에서 되살리는 주문서입니다. 본 과정의 버전 기록과 `environment.yml`의 관계와 같습니다.

</details>

**5.** 예시 2에서 moderated t가 31개를 골랐고 그중 3개가 거짓이었습니다. 이 결과를 보고서에 쓸 때 알맞은 문장은?

(a) "moderated t는 항상 보통 t보다 정확하다" (b) "이 가상 데이터에서 분산 공유는 검출 수를 크게 늘렸고, 대신 거짓 양성이 일부 생겼다. 군당 3개의 결과이므로 후보 목록은 확인이 필요한 가설로 다룬다" (c) "31개 유전자가 처리에 의해 변한다는 것이 증명되었다" (d) "FDR 5%이므로 거짓은 정확히 1.5개다"

<details><summary>정답 보기</summary>

(b). 한 번의 가상 실험 결과를 일반 법칙으로 쓰지 않고(a), 탐색적 결과를 증명으로 쓰지 않으며(c), FDR을 한 번의 결과에 대한 정확한 개수로 오해하지 않습니다(d).

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/advanced/A/A7_models.R`에 예시 1, 2, 4와 실습 2–5를 적고 실행했다.
- [ ] 설계 행렬의 각 열이 무엇을 뜻하는지 주석으로 적었다.
- [ ] `d0`를 바꿔 가며 moderated t의 변화를 표로 남겼다.
- [ ] `reports/advanced/A/sessionInfo.txt`를 만들었다.
- [ ] nCounter 데이터에 RNA-seq count 모델을 그대로 쓰지 않는 이유를 내 말로 두 문장 이상 적었다.

---
[← 이전](day-A6.md) · [코스 지도](../../../README.md) · [다음 →](../../../README.md)
