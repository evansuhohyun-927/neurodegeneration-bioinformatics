# Crash Course — R과 Bioconductor 빠른 시작

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** Python을 조금 아는 상태에서 R/Bioconductor로 쓰인 발현 분석 코드를 읽고, 필요한 패키지를 설치해 작게 고쳐 다시 돌리며, 환경을 기록할 수 있다.

## 한눈에 보기

R은 통계 분석용으로 설계된 언어이고, **Bioconductor**는 생물학 데이터 분석 R 패키지들의 저장소이자 공동체입니다. 발현 분석(limma, DESeq2, edgeR), 유전자 주석, 서열, single-cell 도구의 상당수가 여기 있습니다.

| | 내용 |
|---|---|
| 무엇을 하는가 | 행렬(유전자 × 샘플) + 샘플 정보 + 유전자 정보를 한 객체에 묶고, 설계식(`~ batch + group`)으로 통계 모델을 적합한다 |
| 잘하는 것 | 선형 모델과 통계 검정, 생물학 전용 자료 구조(SummarizedExperiment 등), 주석·ID 변환, 출판용 그림(ggplot2), 코드와 글을 묶은 보고서(Quarto) |
| 못하거나 불편한 것 | 범용 프로그래밍·웹·딥러닝 생태계는 Python이 두껍다. 아주 큰 반복 계산은 느릴 수 있다(벡터화·전용 함수로 피함) |
| Python 사용자가 가장 자주 틀리는 곳 | 인덱스가 **1부터**, `v[-1]`은 "마지막"이 아니라 "첫 원소 빼기", 범위를 넘어도 오류 대신 `NA`, 길이가 다른 벡터 연산이 경고만 내고 진행(재활용) |

## 🎬 급할 때 볼 영상

- [R Programming Tutorial - Learn the Basics of Statistical Computing](https://www.youtube.com/watch?v=_V8eKsto3Ug) — freeCodeCamp.org (2:10:39). R 문법 전체를 한 번에 훑는 긴 강좌. 앞 40분이면 이 가이드의 문법 부분을 다 본다.
- [SummarizedExperiment - Bioconductor for Genomic Data Science](https://www.youtube.com/watch?v=eUPv8KLtP3o) — Ta Hai Dang (7:45). Bioconductor 자료 구조의 그림 하나를 잡는 영상. 남의 분석 코드를 읽기 전에 하나만 본다면 이것.
- [How to Manage R Package Versions per Project with renv: Reproducible Environments](https://www.youtube.com/watch?v=yjlEbIDevOs) — Posit PBC (20:50). 받은 R 프로젝트가 내 컴퓨터에서 안 돌아갈 때.

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| 벡터 (atomic vector) | 같은 종류의 값만 담는 R의 기본 단위. 숫자 하나도 길이 1인 벡터 | 거의 모든 연산이 벡터 전체에 한 번에 작용한다(반복문이 덜 필요) |
| 강제 변환 (coercion) | 종류가 섞이면 논리 → 정수 → 실수 → 문자 쪽으로 조용히 맞춰짐 | 숫자 열에 "n/a" 하나만 있어도 열 전체가 문자로 읽힌다 |
| 재활용 규칙 (recycling) | 길이가 다른 벡터 연산에서 짧은 쪽을 되풀이 | 길이가 안 맞아도 경고만 내고 결과가 나온다 |
| factor | 수준(levels)을 가진 범주형 벡터. 첫 수준이 모델의 기준 | 기준을 안 정하면 알파벳순이 되어 fold change 부호가 뒤집힐 수 있다 |
| list와 `[[ ]]` | 무엇이든 담는 그릇. `[ ]`는 작은 list, `[[ ]]`/`$`는 내용물 | 분석 함수의 결과 대부분이 list다 |
| data.frame | 열마다 종류가 다른 표(pandas DataFrame에 해당) | 샘플 정보표의 기본 형식 |
| generic 함수와 dispatch | `print`, `summary`처럼 객체의 class를 보고 알맞은 method를 부르는 함수 | 같은 함수 이름이 객체마다 다르게 동작하는 이유 |
| S4 클래스 | slot과 규칙(validity)을 미리 정한 엄격한 객체 | Bioconductor 자료 구조가 모두 S4다. 접근자 함수로 다룬다 |
| SummarizedExperiment | assay(행렬) + colData(샘플 정보) + rowData(유전자 정보)를 묶은 표준 그릇 | 부분 선택 시 셋이 함께 잘려 샘플 라벨이 어긋나지 않는다 |
| 설계식·설계 행렬 | `~ batch + group`과 그것을 0/1 표로 펼친 `model.matrix()` | limma, DESeq2, edgeR 모두의 공통 입력. 무엇을 비교·보정했는지가 여기 적힌다 |

## 도구·패키지 고르기

| 도구·패키지 | 무엇을 얻나 | 장점 | 한계 | 이런 상황에 쓴다 |
|---|---|---|---|---|
| base R | 벡터·행렬·data.frame, `lm`, `t.test`, `p.adjust`, `aggregate`, `merge` | 설치 없이 어디서나 돌아간다. Bioconductor 코드 대부분이 이 문법 | 표 정리 코드가 길어지기 쉽다 | 남의 패키지 코드 읽기, 행렬 연산, 간단한 통계 |
| dplyr / tidyr (CRAN) | 동사형 표 처리(`filter`, `mutate`, `group_by`, `summarise`), long ↔ wide | 파이프로 읽기 쉬운 단계별 코드 | base R과 함수 이름 충돌(`filter`) | 결과 표 정리, 요약표 |
| ggplot2 (CRAN) | 층으로 쌓는 그림 문법 | 개별 점·facet·출판용 서식이 쉽다 | 입력이 long 형식이어야 편하다 | 보고서·논문 그림 |
| SummarizedExperiment (Bioc) | 행렬 + 샘플·유전자 정보를 묶은 S4 객체 | 순서 어긋남 방지, 여러 Bioc 도구가 같은 그릇을 공유 | 처음에 S4 접근자 문법이 낯설다 | 발현 데이터를 Bioc 도구로 넘길 때 |
| limma (Bioc) | 선형 모델 + 경험적 베이즈 분산 공유(moderated t) | 반복이 적을 때 강하다. 복잡한 설계에 유연 | 입력은 log 척도 연속값(RNA-seq은 voom 필요) | microarray, 정규화된 log 값, 패널 데이터의 선형 모델 |
| DESeq2 / edgeR (Bioc) | 음이항 count 모델, size factor·TMM, dispersion 공유 | RNA-seq raw count의 표준 | **raw read count 정수 전용**. 정규화 값·nCounter 값에 그대로 쓰지 않는다 | bulk RNA-seq, pseudobulk |
| NanoTube, NanoStringDiff (Bioc) | NanoString nCounter 전용 처리·QC·차등 분석 | 대조 프로브·housekeeping 구조를 반영 | 패키지마다 가정이 다르니 문서 확인 필요 | nCounter 패널 데이터 |
| AnnotationDbi, biomaRt (Bioc) | 유전자 ID 변환, Ensembl 주석 질의 | 버전이 고정된 주석을 코드로 받는다 | 주석 버전에 따라 결과가 바뀐다 | 기호 ↔ Entrez ↔ Ensembl 변환 |
| renv (CRAN) | 프로젝트별 패키지 라이브러리와 `renv.lock` | 같은 버전을 다른 컴퓨터에서 복원 | 처음 설정과 복원에 시간이 걸린다 | 공유·출판할 분석 프로젝트 |

고르는 순서: 데이터가 **어떤 기술에서 나온 어떤 값인지**(raw count인지, 정규화 log 값인지, 어떤 플랫폼인지)를 먼저 확인하고, 그 값에 맞는 모델을 고릅니다. 도구가 유명한지가 아니라 **가정이 데이터와 맞는지**가 기준입니다.

## 표준 분석 흐름

R/Bioconductor로 발현 분석을 할 때의 뼈대입니다.

1. **환경 준비.** R(CRAN)과 RStudio 설치 → 프로젝트 폴더를 RStudio Project로 열기 → `.RData` 자동 저장 끄기. CRAN 패키지는 `install.packages()`, Bioconductor 패키지는 `install.packages("BiocManager")` 후 `BiocManager::install("이름")`. QC: `R.version.string`과 `BiocManager::version()`이 짝이 맞는지([설치 안내](https://bioconductor.org/install/)).
2. **읽기.** 행렬은 `read.csv(..., row.names = 1)` 후 `as.matrix()`, 샘플 표는 `read.csv()`. 입력: CSV/TSV → 행렬 + data.frame. QC: `str()`로 숫자 열이 숫자인지, `anyNA()`, 행렬이 raw 정수인지 정규화 값인지.
3. **이름으로 맞추기.** `match()`로 행렬 열을 샘플 표 순서에 맞추고 `stopifnot(identical(colnames(m), meta$sample))`. factor 수준을 명시(`levels = c("ctrl", "treat")`). QC: 맞추지 못한 샘플 0개, 기준 수준 확인.
4. **그릇에 담기.** `SummarizedExperiment(assays = list(counts = m), colData = meta)`. 이후 부분 선택은 `se[, 조건]`. QC: `dim(se)`, `colData(se)`가 기대한 샘플 수와 같은지.
5. **정규화와 탐색.** 데이터 종류에 맞는 정규화(RNA-seq: 도구 내부 size factor/TMM, nCounter: 대조 프로브·housekeeping) → log 척도에서 PCA·상관 heatmap. QC: PC1이 배치·품질 지표와 겹치지 않는지.
6. **설계식과 모델.** `model.matrix(~ batch + group, data = meta)`로 설계 확인 → limma(`lmFit` → `eBayes` → `topTable`) 또는 DESeq2(`DESeqDataSetFromMatrix` → `DESeq` → `results`). QC: 계수 이름에 기준 수준이 의도대로 반영되었는지(`grouptreat`), contrast 방향 명시.
7. **다중검정과 결과 표.** BH 보정(`p.adjust(p, "BH")`, 도구가 자동 제공). 출력: 유전자 × (log2FC, p, padj) 표를 `write.csv()`. QC: padj 문턱과 효과크기 기준을 결과 전에 정했는지.
8. **그림.** ggplot2로 상위·관심 유전자의 샘플별 점 그림, volcano plot. `ggsave()`로 저장. QC: 한두 샘플이 결과를 끌고 가지 않는지.
9. **기록.** 스크립트 맨 끝에 `writeLines(capture.output(sessionInfo()), "reports/sessionInfo.txt")`, 프로젝트에 `renv::snapshot()`, 보고서는 Quarto(`.qmd`)로 render. QC: 새 R 세션에서 `Rscript`로 처음부터 끝까지 돌아가는지.

## 최소 실행 예시

아래 코드는 base R만 씁니다. 실행 환경: R 4.3.2. 값은 모두 가상입니다.

### 예시 1 — 이름으로 맞추고, 유전자마다 검정하고, BH 보정

```r
set.seed(11)
genes <- sprintf("g%03d", 1:200)
samples <- c("S4", "S2", "S6", "S1", "S5", "S3")                 # 장비가 내보낸 열 순서
counts <- matrix(rnbinom(1200, mu = 300, size = 100), nrow = 200, dimnames = list(genes, samples))
counts[1:5, c("S4", "S5", "S6")] <- counts[1:5, c("S4", "S5", "S6")] * 3   # 앞 5개 유전자만 처리군에서 증가
meta <- data.frame(group = factor(rep(c("ctrl", "treat"), each = 3), levels = c("ctrl", "treat")),
                   row.names = paste0("S", 1:6))
counts <- counts[, rownames(meta)]                                 # 이름으로 정렬
stopifnot(identical(colnames(counts), rownames(meta)))
logcpm <- log2(t(t(counts) / colSums(counts)) * 1e6 + 1)
p <- apply(logcpm, 1, function(v) t.test(v ~ meta$group)$p.value)
lfc <- rowMeans(logcpm[, meta$group == "treat"]) - rowMeans(logcpm[, meta$group == "ctrl"])
res <- data.frame(log2FC = round(lfc, 2), p = signif(p, 3), padj = signif(p.adjust(p, "BH"), 3))
head(res[order(res$p), ], 6)
table(BH_0.05 = res$padj < 0.05)
```

```text
     log2FC        p   padj
g001   1.41 0.000291 0.0318
g004   1.38 0.000318 0.0318
g002   1.30 0.001160 0.0700
g003   1.45 0.001400 0.0700
g005   1.55 0.001940 0.0776
g158  -0.26 0.005690 0.1900
BH_0.05
FALSE  TRUE 
  198     2 
```

읽는 법: 진짜 변한 다섯 유전자가 p 순위 1–5위를 차지했지만, 군당 3개의 t-검정으로는 BH 5%를 2개만 통과합니다. log2FC가 정답 log2(3) ≈ 1.58보다 조금 작은 것은 다섯 유전자가 오르면서 CPM의 분모가 커져 나머지가 상대적으로 눌렸기 때문입니다(조성 편향). 반복이 적을 때 분산 정보를 공유하는 limma, 조성을 보정하는 DESeq2/edgeR이 필요한 이유가 이 두 줄에 다 있습니다. 실제 분석은 이 코드가 아니라 그 도구들로 합니다. 이 예시의 값은 RNA-seq 비슷한 가상 count이며, nCounter 데이터의 정규화 방식과는 다릅니다.

### 예시 2 — factor 기준 수준이 부호를 정한다

```r
expr  <- c(7.9, 8.1, 8.0, 9.2, 9.0, 9.4)                      # 한 유전자의 log2 값(가상)
geno  <- c("WT", "WT", "WT", "KO", "KO", "KO")
g1 <- factor(geno)                                            # 기본: 알파벳순 -> KO가 기준
g2 <- factor(geno, levels = c("WT", "KO"))                    # WT를 기준으로 명시
coef(lm(expr ~ g1))
coef(lm(expr ~ g2))
```

```text
(Intercept)        g1WT 
        9.2        -1.2 
(Intercept)        g2KO 
        8.0         1.2 
```

읽는 법: 같은 데이터인데 계수의 부호가 반대입니다. 기본 factor는 알파벳순이라 KO가 기준이 되어 "WT가 KO보다 1.2 낮다"로 나오고, WT를 기준으로 명시하면 "KO가 WT보다 1.2 높다"가 됩니다. 계수 이름(`g1WT`, `g2KO`)에 어느 쪽이 비교 대상인지 적혀 있으니 결과를 해석하기 전에 반드시 읽습니다.

## 흔한 함정

1. **Python 인덱스 습관** → `v[0]`은 빈 벡터, `v[-1]`은 첫 원소를 뺀 나머지, 범위 밖은 오류 대신 `NA` → 위치 대신 **이름과 논리 조건**으로 고르고, 길이를 `length()`로 확인한다.
2. **재활용 경고를 무시한다** → 정규화 계수 5개로 샘플 6개를 나눠도 결과가 나온다 → 함수 맨 앞에 `stopifnot(length(sf) == ncol(m))`. 경고는 `options(warn = 2)`로 오류로 바꿔 추적할 수 있다.
3. **factor를 숫자로 바꾼다** → `as.numeric(factor(c("10", "5")))`은 값이 아니라 수준 번호를 준다 → `as.numeric(as.character(f))`.
4. **샘플 순서로 행렬과 메타데이터를 붙인다** → 장비가 내보낸 열 순서가 다르면 라벨이 통째로 밀리고, 오류도 나지 않는다 → `match()`로 이름 기준 정렬 후 `identical()`로 확인하거나, SummarizedExperiment에 담아 함께 자른다.
5. **데이터 종류와 모델이 맞지 않는다** → 정규화된 값이나 NanoString nCounter 값을 DESeq2·edgeR에 넣으면 count 분포 가정과 depth 보정이 어긋난다 → raw RNA-seq count는 DESeq2/edgeR(또는 limma-voom), 정규화된 log 값은 limma식 선형 모델, nCounter는 대조 프로브·housekeeping 정규화 후 선형 모델 또는 nCounter 전용 도구. 원 논문의 방법을 확인한다.
6. **Bioconductor 패키지를 `install.packages()`로 설치하거나, R 버전과 맞지 않는 릴리스를 섞는다** → "not available for this version of R" → `BiocManager::install()`을 쓰고, 필요하면 R을 먼저 올린다. 한 프로젝트 안에서 Bioconductor 릴리스를 섞지 않는다.
7. **slot을 `@`로 직접 꺼내 고친다** → 패키지 버전이 바뀌면 코드가 깨지고, 객체 규칙 검사를 우회하게 된다 → `assay()`, `colData()` 같은 접근자를 쓴다.
8. **환경을 기록하지 않는다** → 1년 뒤 같은 스크립트가 다른 숫자를 내도 원인을 찾을 수 없다 → 스크립트 끝에 `sessionInfo()` 저장, 프로젝트에 renv, seed는 `set.seed()`. 새 세션에서 `Rscript`로 처음부터 돌려 본다.

## 연구 설계 체크리스트

- [ ] 데이터가 어떤 플랫폼의 어떤 값인지(raw count / 정규화 / log) 알고, 그에 맞는 모델을 골랐다
- [ ] 비교할 contrast(무엇 대 무엇)와 기준 수준을 factor `levels`로 명시했다
- [ ] 배치·성별 등 알려진 요인을 설계식에 넣었고, 조건과 완전히 겹치는 요인이 없는지 표로 확인했다
- [ ] 통계의 단위가 개체(생물학적 반복)다. 기술적 반복은 n으로 세지 않았다
- [ ] 행렬의 열과 샘플 표의 행을 이름으로 맞추고 코드로 확인했다
- [ ] 유의성 기준(padj 문턱, log2FC 기준)을 결과를 보기 전에 정했다
- [ ] 쓰는 패키지와 버전, Bioconductor 릴리스를 기록한다(`sessionInfo()`, `renv.lock`)
- [ ] 난수를 쓰는 단계에 `set.seed()`를 두었다
- [ ] 탐색적 분석과 확증적 분석을 구분해 보고하고, 작은 표본의 결과는 가설 생성으로 쓴다
- [ ] 결과를 진단·치료 주장으로 표현하지 않는다

## 공개 데이터와 더 볼 곳

**저장소와 공식 페이지**

| 이름 | URL | 무엇이 있나 |
|---|---|---|
| CRAN | <https://cran.r-project.org/> | R 설치 파일과 일반 R 패키지 |
| RStudio Desktop (Posit) | <https://posit.co/download/rstudio-desktop/> | R 작업대(IDE) |
| Bioconductor | <https://www.bioconductor.org/> | 생물학 R 패키지, vignette, 교육 자료, 지원 포럼 |
| Bioconductor 설치 안내 | <https://bioconductor.org/install/> | BiocManager 사용법과 R 버전 짝 |
| airway (Bioc 실험 데이터 패키지) | <https://bioconductor.org/packages/release/data/experiment/html/airway.html> | 교육용으로 널리 쓰이는 RNA-seq 데이터가 SummarizedExperiment로 들어 있음 |
| GEO | <https://www.ncbi.nlm.nih.gov/geo/> | 발현 데이터. GEOquery로 R에 바로 불러올 수 있음 |
| NASA OSDR | <https://osdr.nasa.gov/bio/> | 본 과정 OSD-536이 있는 곳 |

**공식 문서·튜토리얼**

- NIH NCI BTEP, *R Introductory Series* (무료 공개 교육 자료: R/RStudio, 데이터 프레임, tidyverse, ggplot2, Bioconductor 소개, Quarto): <https://bioinformatics.ccr.cancer.gov/docs/rintro/>
- NIH NCI BTEP, *Introductory R for Novices*: <https://bioinformatics.ccr.cancer.gov/docs/r_for_novices/>
- Data Carpentry, *Intro to R and RStudio for Genomics*: <https://datacarpentry.org/genomics-r-intro/>
- Carpentries Incubator, *Introduction to data analysis with R and Bioconductor*: <https://carpentries-incubator.github.io/bioc-intro/>
- *R for Data Science* (2판, 무료 온라인): <https://r4ds.hadley.nz/>
- *Advanced R* (환경, S3/S4, 함수형 프로그래밍을 깊게, 무료 온라인): <https://adv-r.hadley.nz/>
- SummarizedExperiment vignette: <https://bioconductor.org/packages/release/bioc/vignettes/SummarizedExperiment/inst/doc/SummarizedExperiment.html>
- DESeq2 vignette: <https://bioconductor.org/packages/release/bioc/vignettes/DESeq2/inst/doc/DESeq2.html>
- limma 패키지 페이지(사용자 안내서 링크): <https://bioconductor.org/packages/release/bioc/html/limma.html>
- renv: <https://rstudio.github.io/renv/>
- Quarto: <https://quarto.org/>
- *Writing R Extensions* (패키지 작성, 이름 공간, C 연결의 공식 매뉴얼): <https://cran.r-project.org/doc/manuals/r-release/R-exts.html>

**책**

- Gentleman R. *R Programming for Bioinformatics*. Chapman & Hall/CRC, 2008. 출판사 페이지: <https://www.routledge.com/R-Programming-for-Bioinformatics/Gentleman/p/book/9781420063677> — R 언어 자체(평가, 범위, S3/S4, 입출력, 문자열, C 연결, 패키지, 디버깅)를 Bioconductor 설계자의 관점에서 다룬다. 오래된 책이라 일부 패키지 이름(예: ExpressionSet 중심 설명)은 지금 표준과 다르다.

**핵심 논문**

- Gentleman RC, et al. Bioconductor: open software development for computational biology and bioinformatics. *Genome Biol.* 2004;5:R80. doi:[10.1186/gb-2004-5-10-r80](https://doi.org/10.1186/gb-2004-5-10-r80)
- Huber W, et al. Orchestrating high-throughput genomic analysis with Bioconductor. *Nat Methods.* 2015;12:115–121. doi:[10.1038/nmeth.3252](https://doi.org/10.1038/nmeth.3252)
- Smyth GK. Linear models and empirical Bayes methods for assessing differential expression in microarray experiments. *Stat Appl Genet Mol Biol.* 2004;3:Article 3. doi:[10.2202/1544-6115.1027](https://doi.org/10.2202/1544-6115.1027)
- Ritchie ME, et al. limma powers differential expression analyses for RNA-sequencing and microarray studies. *Nucleic Acids Res.* 2015;43:e47. doi:[10.1093/nar/gkv007](https://doi.org/10.1093/nar/gkv007)
- Love MI, Huber W, Anders S. Moderated estimation of fold change and dispersion for RNA-seq data with DESeq2. *Genome Biol.* 2014;15:550. doi:[10.1186/s13059-014-0550-8](https://doi.org/10.1186/s13059-014-0550-8)
- Waggott D, et al. NanoStringNorm: an extensible R package for the pre-processing of NanoString mRNA and miRNA data. *Bioinformatics.* 2012;28:1546–1548. doi:[10.1093/bioinformatics/bts188](https://doi.org/10.1093/bioinformatics/bts188)

## 본 과정과의 연결

**심화 파트 A — R과 Bioconductor (7일)** 가 이 가이드의 각 부분을 하루 단위로 자세히 다룹니다.

| 이 가이드의 부분 | 자세히 다루는 레슨 |
|---|---|
| 설치, RStudio 프로젝트, Python ↔ R 대조표 | [Day A1 — Python에서 R로](../lessons/advanced/A-r-bioconductor/day-A1.md) |
| 벡터, 강제 변환, 재활용, 부분 선택, 문자열 | [Day A2 — 벡터, 자료형, 부분 선택](../lessons/advanced/A-r-bioconductor/day-A2.md) |
| factor, list, matrix, data.frame, 이름으로 맞추기, CSV/RDS | [Day A3 — 실험 정보를 담는 그릇](../lessons/advanced/A-r-bioconductor/day-A3.md) |
| 함수, apply 계열, 오류 처리, 디버깅 | [Day A4 — 함수, 제어문, apply 계열](../lessons/advanced/A-r-bioconductor/day-A4.md) |
| base R vs dplyr, long/wide, ggplot2 | [Day A5 — 표 다루기와 그림](../lessons/advanced/A-r-bioconductor/day-A5.md) |
| S3·S4, SummarizedExperiment, BiocManager | [Day A6 — S3·S4 객체와 Bioconductor 자료 구조](../lessons/advanced/A-r-bioconductor/day-A6.md) |
| 설계 행렬, limma·DESeq2의 발상, sessionInfo, renv | [Day A7 — Bioconductor 분석 맛보기와 재현성](../lessons/advanced/A-r-bioconductor/day-A7.md) |

본 과정(Python)에서 같은 개념을 처음 배운 곳:

| 개념 | 본 과정 레슨 |
|---|---|
| 자료형, 리스트·딕셔너리, 함수 | [Day F2](../lessons/week-0/day-F2.md), [Day F3](../lessons/week-0/day-F3.md), [Day F5](../lessons/week-0/day-F5.md) |
| tidy data와 메타데이터 | [Day 4 — tidy data와 메타데이터, pandas QC](../lessons/week-1/day-04.md) |
| 다중검정과 BH | [Day 10 — FDR과 다중검정](../lessons/week-2/day-10.md) |
| 배치·교란과 설계 | [Day 11 — 반복, 배치, 교란, 대조군](../lessons/week-2/day-11.md) |
| raw count·정규화·log 값의 용도 | [Day 13 — 분자 데이터 전처리와 QC](../lessons/week-2/day-13.md) |
| 샘플 표와 행렬을 이름으로 연결 | [Day 16 — 샘플과 유전자 행렬 연결](../lessons/week-3/day-16.md) |
| nCounter 대조 프로브·housekeeping 정규화 | [Day 17 — 탐색적 분석](../lessons/week-3/day-17.md) |
| 차등발현 표, contrast 방향, RNA-seq 모델을 nCounter에 쓰지 않는 이유 | [Day 18 — 차등발현 결과 읽기](../lessons/week-3/day-18.md) |
| 재현성(환경, 실행 순서, seed) | [Day 38 — 재현성 강화](../lessons/week-6/day-38.md) |

RNA-seq 전체 흐름은 [Crash Course — Transcriptomics](transcriptomics.md)에 있습니다.

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
