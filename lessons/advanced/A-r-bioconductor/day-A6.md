# Day A6 — S3·S4 객체와 Bioconductor의 자료 구조

> **주차:** 심화 파트 A — R과 Bioconductor · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/A/A6_objects.R`
>
> **먼저 끝내 둘 레슨:** Day A3(이름 맞추기), Day A4(함수).

## 오늘의 목표
- generic 함수와 method, `class`에 따른 dispatch가 무엇인지 S3 예시로 설명할 수 있다.
- S4 클래스(slot, validity, generic, method)를 직접 만들어, 발현 행렬과 샘플 정보가 함께 움직이는 객체를 만들 수 있다.
- Bioconductor 패키지를 설치하는 방법과 SummarizedExperiment의 구조(assay, colData, rowData)를 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [S3 and S4 Object in R | Object Oriented Programming and Bioconductor — LiquidBrain](https://www.youtube.com/watch?v=YGlse2aW5Ao) (16:48)
- **무엇에 주목할까:** S3는 이름표(class 속성)만 붙이면 되는 느슨한 방식이고, S4는 설계도(slot)를 먼저 정하는 엄격한 방식이라는 대비를 잡으세요. Bioconductor가 왜 S4를 택했는지가 영상 후반의 요점입니다.

- [SummarizedExperiment - Bioconductor for Genomic Data Science — Ta Hai Dang](https://www.youtube.com/watch?v=eUPv8KLtP3o) (7:45)
- **무엇에 주목할까:** 행렬 가운데(assay), 위·아래로 붙는 샘플 정보(colData), 옆으로 붙는 유전자 정보(rowData)의 그림을 머릿속에 남기세요. 오늘 예시 2가 이 구조를 작게 직접 만들어 봅니다.

## 개념 설명

### 객체지향의 두 재료: 클래스와 generic 함수

`print(x)`라고 쓰면 R은 숫자 벡터, 표, 모델 결과를 각각 다르게 보여 줍니다. 같은 이름의 함수가 입력의 **클래스(class)** 를 보고 알맞은 처리 방식을 고르기 때문입니다. 이름은 하나지만 상황에 따라 다른 절차를 부르는 이 함수를 **generic 함수**, 클래스별 실제 절차를 **method**, 클래스를 보고 method를 고르는 과정을 **dispatch**라고 합니다. 병원 접수처(generic)가 환자의 진료과(class)를 보고 해당 진료실(method)로 안내하는 것과 같습니다.

이 구조의 이점은 **데이터의 내부 구조와 사용법을 떼어 놓는 것**입니다. 사용자는 `summary(x)`만 알면 되고, x가 어떻게 저장되어 있는지는 몰라도 됩니다. 설계자는 내부 구조를 바꿔도 method만 고쳐 주면 사용자의 코드는 그대로 돌아갑니다. Python의 클래스 메서드(`df.describe()`)와 목적은 같지만, R에서는 method가 객체 안이 아니라 **generic 함수 쪽에** 붙어 있다는 점이 다릅니다(`describe(df)`에 가까운 모양).

R에는 객체지향 체계가 여럿 있고, 이 파트에서 알아야 할 것은 두 가지입니다.

### S3: 이름표만 붙이는 느슨한 방식

S3에서는 아무 객체에나 `class` 속성(이름표)을 붙이면 그 클래스의 객체가 됩니다. method는 `generic이름.클래스이름`이라는 **이름 규칙**으로 만듭니다. `print.panel_counts`를 정의해 두면, `class`가 `"panel_counts"`인 객체를 출력할 때 R이 이 함수를 찾아 부릅니다. 직접 generic을 만들 때는 본문에 `UseMethod("이름")` 한 줄만 둡니다.

간단하고 빠르게 쓸 수 있어 `lm`, `glm`, `data.frame`, `factor` 같은 R의 기본 통계 도구가 대부분 S3입니다. 대신 검사가 없습니다. 아무 list에 `class(x) <- "lm"`이라고 이름표만 바꿔 붙여도 R은 의심하지 않고 lm용 method를 부르다가 엉뚱한 곳에서 실패합니다. 상속은 `class`에 이름을 여러 개 나열하는 방식(`c("자식", "부모")`)이고, 자식의 method가 일부를 처리한 뒤 `NextMethod()`로 부모의 method에 넘깁니다.

### S4: 설계도를 먼저 정하는 엄격한 방식

S4는 `setClass()`로 클래스의 **설계도**를 먼저 정합니다. 객체가 가질 칸(**slot**)과 각 칸의 자료형, 그리고 객체가 지켜야 할 규칙(**validity**)을 적어 둡니다. 객체는 `new()`로 만들고, 만드는 순간 자료형과 규칙을 검사합니다. 규칙에 맞지 않으면 객체가 아예 만들어지지 않습니다. 시료 접수 단계에서 라벨과 서류가 맞지 않으면 접수를 거부하는 것과 같습니다.

generic은 `setGeneric()`, method는 `setMethod()`로 등록합니다. S4는 첫 번째 인자뿐 아니라 **여러 인자의 클래스 조합**으로 method를 고를 수 있고(multiple dispatch), `setClass(..., contains = "부모")`로 상속하며, `isVirtualClass()`, `existsMethod()`, `showMethods()`처럼 클래스와 method를 조사하는 도구가 갖춰져 있습니다. slot은 `obj@counts`처럼 `@`로 직접 꺼낼 수 있지만, 내부 구조에 의존하게 되므로 **접근자 함수(accessor)** (`counts(obj)`)를 만들어 쓰는 것이 원칙입니다. Bioconductor 문서에서 `assay(se)`, `colData(se)` 같은 함수를 쓰라고 하는 이유가 이것입니다.

S3 클래스를 S4 slot에 넣거나 S4 method의 대상으로 쓰려면 `setOldClass()`로 S4에 알려 줍니다. 상속 확인은 S3에서는 `inherits()`, S4에서는 `is()`가 기본이고, 객체가 S4인지는 `isS4()`로 봅니다.

### Bioconductor는 왜 S4를 쓰나: 스스로를 설명하는 데이터

발현 실험의 결과는 행렬 하나가 아닙니다. 유전자 × 샘플 값, 샘플 정보(군, 배치, 성별), 유전자 정보(ID, 염색체 위치), 실험 설명이 한 세트입니다. 이것을 따로따로 들고 다니면 Day A3에서 본 것처럼 **순서가 어긋나는 사고**가 언제든 일어납니다. 행렬에서 처리군만 골랐는데 샘플 표는 그대로라면 라벨이 통째로 밀립니다.

Bioconductor는 이 세트를 **한 객체**에 묶고, 행렬의 열과 샘플 표의 행이 항상 같은 샘플을 가리키도록 **객체가 직접 보장**하게 했습니다. 이런 객체를 "스스로를 설명하는 데이터(self-describing data)"라고 합니다. 오래된 microarray 분석에서는 Biobase 패키지의 **ExpressionSet**이 이 역할을 했고, 지금은 **SummarizedExperiment**가 표준입니다.

| 부분 | 접근자 | 모양 | 담는 것 |
|---|---|---|---|
| assay | `assay(se)`, `assays(se)` | 유전자 × 샘플 행렬(여러 개 가능) | raw count, 정규화 값 등 |
| colData | `colData(se)` | 샘플 × 정보 표 | 군, 배치, 성별, 나이 |
| rowData | `rowData(se)` | 유전자 × 정보 표 | 유전자 ID, 기호, 프로브 종류 |
| metadata | `metadata(se)` | list | 실험 설명, 처리 기록 |

`se[유전자, 샘플]`로 부분 선택하면 assay, colData, rowData가 **함께** 잘립니다. `se$group`은 colData의 열을 바로 꺼냅니다. single-cell 분석의 SingleCellExperiment, 유전체 위치를 다루는 RangedSummarizedExperiment가 모두 이것을 상속합니다. DESeq2의 `DESeqDataSet`도 SummarizedExperiment를 상속한 S4 클래스입니다. 하나의 그릇 모양을 알면 여러 도구를 같은 방식으로 다룰 수 있다는 것이 Bioconductor 설계의 핵심입니다.

### 패키지, 설치, 이름 공간

Bioconductor는 CRAN과 별도의 저장소이고, 설치는 CRAN 패키지인 **BiocManager**를 통해 합니다. Bioconductor는 1년에 두 번 새 릴리스를 내고, 각 릴리스는 특정 R 버전과 짝을 이룹니다. `BiocManager::install()`은 지금 R 버전에 맞는 릴리스의 패키지를 골라 설치하고, `BiocManager::version()`으로 짝을 확인합니다. 그래서 오래된 R에서는 최신 Bioconductor 패키지를 받을 수 없고, R을 먼저 올려야 할 때가 있습니다. 패키지 페이지(예: [SummarizedExperiment](https://bioconductor.org/packages/release/bioc/html/SummarizedExperiment.html))에는 설치 명령, 설명서(**vignette**), 분야 분류(**biocViews**)가 있습니다. vignette는 함수 하나하나가 아니라 "이 패키지로 분석 전체를 어떻게 하는가"를 코드와 함께 보여 주는 문서라, 새 패키지는 vignette부터 읽는 것이 빠릅니다(`browseVignettes("패키지")`).

패키지는 자기 함수 중 공개할 것을 정하는 **이름 공간(namespace)** 을 갖습니다. 여러 패키지에 같은 이름의 함수가 있을 때 `패키지::함수`로 어느 쪽인지 정확히 부를 수 있습니다(Day A5의 `dplyr::filter`). `search()`는 지금 불러온 패키지들의 검색 순서를, `sessionInfo()`는 버전까지 보여 줍니다(Day A7).

Bioconductor에는 자료 구조 말고도 생물학 정보에 접근하는 패키지가 많습니다. 몇 가지 이름만 알아 두면 논문의 Methods를 읽을 때 도움이 됩니다.

| 패키지 | 하는 일 |
|---|---|
| [Biostrings](https://bioconductor.org/packages/release/bioc/html/Biostrings.html) | DNA·단백질 서열 객체, 패턴 찾기, 정렬 ([보충 S1–S4](../../supplement/day-S1.md)의 R판) |
| [AnnotationDbi](https://bioconductor.org/packages/release/bioc/html/AnnotationDbi.html) | 유전자 ID 사이 변환(기호 ↔ Entrez ↔ Ensembl). 내부는 SQLite 데이터베이스 |
| [biomaRt](https://bioconductor.org/packages/release/bioc/html/biomaRt.html) | Ensembl BioMart에 질의해 주석을 받아 옴 |
| [GEOquery](https://bioconductor.org/packages/release/bioc/html/GEOquery.html) | GEO 데이터를 내려받아 Bioconductor 객체로 변환 |

## 예시로 이해하기

> 모든 값은 연습용 **가상 값**입니다. 예시 1–2는 base R(methods 패키지 포함)만 쓰므로 누구나 실행됩니다.

### 예시 1 — S3 클래스 하나 만들기

```r
new_panel <- function(counts, platform = "가상 패널") {
  stopifnot(is.matrix(counts), !is.null(colnames(counts)))
  structure(list(counts = counts, platform = platform), class = "panel_counts")
}
print.panel_counts <- function(x, ...) {
  cat("<panel_counts>", nrow(x$counts), "genes x", ncol(x$counts), "samples |", x$platform, "\n")
  invisible(x)
}
summary.panel_counts <- function(object, ...) colSums(object$counts)
m <- matrix(c(120, 80, 30, 200, 90, 25), nrow = 3,
            dimnames = list(c("Gfap", "Aif1", "Neg1"), c("S1", "S2")))
p <- new_panel(m)
p                       # print()가 자동으로 불린다 -> print.panel_counts
summary(p)
class(p); inherits(p, "panel_counts")
unclass(p)$platform
class(m); class(data.frame()); class(sum)
```

출력:

```text
<panel_counts> 3 genes x 2 samples | 가상 패널 
 S1  S2 
230 315 
[1] "panel_counts"
[1] TRUE
[1] "가상 패널"
[1] "matrix" "array" 
[1] "data.frame"
[1] "function"
```

`structure(..., class = "panel_counts")`가 이름표를 붙이는 줄입니다. 그 뒤로 `p`를 치기만 해도 거대한 행렬 대신 한 줄 요약이 나옵니다. 콘솔에서 객체 이름을 치면 내부적으로 `print()`가 불리고, print가 클래스를 보고 `print.panel_counts`를 찾아가기 때문입니다. 생성 함수(`new_panel`) 안의 `stopifnot`이 S3에서 할 수 있는 최소한의 검사입니다. `unclass()`는 이름표를 떼어 원래의 list로 돌려놓습니다. 행렬, data.frame, 함수도 모두 클래스를 갖고 있습니다.

### 예시 2 — 행렬과 샘플 표를 함께 자르는 S4 클래스

```r
setClass("CountPanel",
         slots = c(counts = "matrix", colData = "data.frame"),
         validity = function(object) {
           if (!identical(colnames(object@counts), rownames(object@colData)))
             return("counts의 열 이름과 colData의 행 이름이 같은 순서로 일치해야 합니다")
           TRUE
         })
setGeneric("counts", function(x) standardGeneric("counts"))
setMethod("counts", "CountPanel", function(x) x@counts)
setMethod("show", "CountPanel", function(object)
  cat("CountPanel:", nrow(object@counts), "genes x", ncol(object@counts), "samples\n"))
setMethod("[", "CountPanel", function(x, i, j, ..., drop = FALSE) {
  if (missing(i)) i <- seq_len(nrow(x@counts))
  if (missing(j)) j <- seq_len(ncol(x@counts))
  new("CountPanel", counts = x@counts[i, j, drop = FALSE],
      colData = x@colData[j, , drop = FALSE])
})
m <- matrix(1:12, nrow = 3, dimnames = list(c("Gfap", "Aif1", "Cd68"), paste0("S", 1:4)))
cd <- data.frame(group = c("ctrl", "ctrl", "treat", "treat"), row.names = paste0("S", 1:4))
obj <- new("CountPanel", counts = m, colData = cd)
obj
sub <- obj[c("Gfap", "Cd68"), obj@colData$group == "treat"]
sub
counts(sub)
sub@colData
isVirtualClass("CountPanel"); is(obj, "CountPanel"); isS4(obj)
bad <- tryCatch(new("CountPanel", counts = m, colData = cd[4:1, , drop = FALSE]),
                error = function(e) conditionMessage(e))
cat(bad, "\n")
existsMethod("counts", "CountPanel")
showMethods("counts")
```

출력:

```text
[1] "counts"
CountPanel: 3 genes x 4 samples
CountPanel: 2 genes x 2 samples
     S3 S4
Gfap  7 10
Cd68  9 12
   group
S3 treat
S4 treat
[1] FALSE
[1] TRUE
[1] TRUE
invalid class “CountPanel” object: counts의 열 이름과 colData의 행 이름이 같은 순서로 일치해야 합니다 
[1] TRUE
Function: counts (package .GlobalEnv)
x="CountPanel"
```

맨 위의 `[1] "counts"`는 `setGeneric()`이 새 generic의 이름을 알려 주는 출력입니다. 핵심은 세 군데입니다. (1) **validity**: 샘플 표의 순서를 뒤집어 넣자(`cd[4:1, ]`) 객체가 만들어지지 않고 우리가 쓴 메시지로 거부됩니다. Day A3에서 `stopifnot`으로 손수 하던 확인을 이제 클래스가 매번 대신합니다. (2) **`[` method**: 처리군 샘플만 고르자 행렬과 샘플 표가 **함께** 잘렸습니다. (3) **접근자** `counts(sub)`: slot 이름을 몰라도 값을 꺼냅니다. SummarizedExperiment가 하는 일을 아주 작게 흉내 낸 것입니다.

### 예시 3 — 진짜 SummarizedExperiment

> 설치는 처음 한 번만 하면 되고, 인터넷 연결과 몇 분(소스에서 컴파일하면 수십 분)이 필요합니다. 아래 출력은 R 4.3.2 + Bioconductor 3.18(SummarizedExperiment 설치 후)에서 "# 사용" 아래 줄을 실행한 그대로입니다. 패키지를 불러올 때 나오는 긴 "masked" 안내문은 뺐습니다.

```r
# 설치 (처음 한 번)
if (!requireNamespace("BiocManager", quietly = TRUE)) install.packages("BiocManager")
BiocManager::install("SummarizedExperiment")
BiocManager::version()          # 지금 R과 짝을 이룬 Bioconductor 릴리스

# 사용
library(SummarizedExperiment)
m  <- matrix(1:12, nrow = 3, dimnames = list(c("Gfap", "Aif1", "Cd68"), paste0("S", 1:4)))
cd <- DataFrame(group = c("ctrl", "ctrl", "treat", "treat"), row.names = paste0("S", 1:4))
rd <- DataFrame(probe_class = c("Endogenous", "Endogenous", "Endogenous"), row.names = rownames(m))
se <- SummarizedExperiment(assays = list(counts = m), colData = cd, rowData = rd)
se                                 # 요약 출력
assay(se, "counts")
colData(se)
se_treat <- se[, se$group == "treat"]   # assay와 colData가 함께 잘린다
dim(se_treat)
assay(se, "log2") <- log2(assay(se, "counts") + 1)   # 같은 그릇에 두 번째 assay 추가
assayNames(se)
browseVignettes("SummarizedExperiment")   # 브라우저에 공식 안내서가 열린다 (출력 생략)
```

출력:

```text
class: SummarizedExperiment 
dim: 3 4 
metadata(0):
assays(1): counts
rownames(3): Gfap Aif1 Cd68
rowData names(1): probe_class
colnames(4): S1 S2 S3 S4
colData names(1): group
     S1 S2 S3 S4
Gfap  1  4  7 10
Aif1  2  5  8 11
Cd68  3  6  9 12
DataFrame with 4 rows and 1 column
         group
   <character>
S1        ctrl
S2        ctrl
S3       treat
S4       treat
[1] 3 2
[1] "counts" "log2"  
```

`se_treat`의 `dim`이 `3 2`인 것을 보세요. 열(샘플)을 고르자 assay와 colData가 함께 잘렸습니다.

⚠️ **설치 중 흔한 문제:** 내려받기 도중 네트워크 오류(`SSL connect error`, `HTTP2 framing layer`)가 나면 설치 명령은 끝나도 일부 의존 패키지가 빠집니다. 그러면 `library()`에서 "there is no package called ..."로 멈춥니다. 같은 `BiocManager::install()`을 다시 실행하면 빠진 것만 채워집니다. `RCurl`처럼 소스 컴파일에 실패하는 패키지는 `install.packages("RCurl", type = "binary")`로 미리 만든 판을 받습니다.

예시 2와 비교해 보세요. `CountPanel`의 `counts`/`colData` slot이 여기서는 `assay`/`colData`이고, 유전자 정보를 담는 `rowData`와 여러 assay를 담는 기능이 더해졌습니다. `DataFrame`(대문자 D)은 Bioconductor의 S4판 data.frame입니다. 3주차의 nCounter 데이터라면 rowData의 `probe_class`에 Endogenous/Housekeeping/Positive/Negative를 넣어 두고 `se[rowData(se)$probe_class == "Housekeeping", ]`처럼 고를 수 있습니다.

## 직접 해보기

1. `notebooks/advanced/A/A6_objects.R`을 만들고 예시 1–2를 실행합니다.
2. **S3 method 더하기.** `panel_counts`에 `dim.panel_counts <- function(x) dim(x$counts)`를 정의하고 `dim(p)`, `nrow(p)`를 실행해 봅니다. `nrow`는 내부에서 `dim`을 부르므로 함께 작동합니다.
3. **이름표의 위험.** 아무 list `fake <- list(a = 1)`에 `class(fake) <- "panel_counts"`를 붙이고 `print(fake)`와 `summary(fake)`를 차례로 실행합니다. print는 오류 없이 숫자가 빠진 엉뚱한 줄을 찍고, summary에서야 `colSums` 오류로 멈춥니다. 문제는 이름표를 붙인 곳에서 생겼는데 오류는 다른 곳에서 드러난다는 점, 그리고 이것이 S3가 "검사하지 않는다"는 말의 뜻이라는 점을 주석으로 적습니다.
4. **S4 validity 보강.** `CountPanel`의 validity에 "count에 음수가 있으면 거부"하는 규칙을 더하고, 음수가 든 행렬로 `new()`를 시도해 거부되는지 확인합니다.
5. **S4 method 더하기.** `setGeneric("libSize", function(x) standardGeneric("libSize"))`와 `CountPanel`용 method(`colSums(x@counts)`)를 만들고, 원본과 `sub`에 각각 써 봅니다.
6. **(선택) Bioconductor 설치.** 인터넷이 되고 시간이 있으면 예시 3의 설치 명령을 실행한 뒤 예시 3 전체를 돌려 봅니다. 설치가 R 버전 문제로 실패하면 오류 메시지와 `R.version.string`, `BiocManager::version()`을 기록해 두고 넘어갑니다. 오늘 실습의 핵심은 예시 1–2입니다.

⚠️ **흔한 오류 1 — `no slot of name "counts" for this object of class ...`.** slot 이름 철자가 틀렸거나, 클래스 정의를 바꾼 뒤 예전에 만든 객체를 쓰고 있습니다. `slotNames("CountPanel")`로 확인하고 객체를 다시 만듭니다.

⚠️ **흔한 오류 2 — Bioconductor 패키지를 `install.packages()`로 설치하려 한다.** "package is not available for this version of R"이 나옵니다. CRAN에 없기 때문입니다. `BiocManager::install("이름")`을 씁니다. 반대로 BiocManager 자체는 CRAN 패키지라 `install.packages("BiocManager")`로 받습니다.

## 퀴즈

**1.** `print(x)`가 x의 클래스에 따라 다르게 동작하는 원리를 가리키는 말은?

(a) 재활용 규칙 (b) dispatch (c) 강제 변환 (d) 어휘적 범위

<details><summary>정답 보기</summary>

(b). generic 함수인 print가 x의 클래스를 보고 그 클래스용 method(예: `print.data.frame`)를 골라 부르는 과정을 dispatch라고 합니다.

</details>

**2.** S3와 S4의 차이로 옳지 **않은** 것은?

(a) S4는 slot과 자료형을 미리 정의한다 (b) S4는 validity로 객체 생성 시 규칙을 검사할 수 있다 (c) S3 method는 `generic.class` 이름 규칙으로 찾는다 (d) S3는 객체를 만들 때 slot의 자료형을 자동으로 검사한다

<details><summary>정답 보기</summary>

(d). S3는 class 이름표만 볼 뿐 내부 구조를 검사하지 않습니다. 검사가 필요하면 생성 함수 안에 직접 넣어야 합니다.

</details>

**3.** SummarizedExperiment에서 샘플의 군·배치 정보는 어디에 들어가나요? (단답)

<details><summary>정답 보기</summary>

`colData`입니다. assay의 열(샘플)마다 한 행씩 대응하는 표이고, `colData(se)` 또는 `se$group`처럼 꺼냅니다. 유전자 정보는 `rowData`에 들어갑니다.

</details>

**4.** `se[, se$group == "treat"]`를 실행하면 colData는 어떻게 되나요?

(a) 그대로 남아 assay와 어긋난다 (b) 처리군 샘플의 행만 남도록 함께 잘린다 (c) 삭제된다 (d) 오류가 난다

<details><summary>정답 보기</summary>

(b). 행렬과 샘플 정보가 같은 샘플을 가리키도록 객체가 함께 자릅니다. 순서 어긋남을 사람이 매번 확인하지 않아도 되게 하는 것이 이 자료 구조의 존재 이유입니다.

</details>

**5.** slot을 `obj@counts`로 직접 꺼내기보다 `counts(obj)` 같은 접근자를 쓰라고 권하는 이유는? (단답)

<details><summary>정답 보기</summary>

`@`는 클래스의 내부 구현(slot 이름과 배치)에 의존하기 때문입니다. 패키지가 내부 구조를 바꾸면 `@`를 쓴 코드는 깨지지만, 접근자는 패키지가 함께 고쳐 주므로 사용자 코드는 그대로 돌아갑니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/advanced/A/A6_objects.R`에 예시 1–2와 실습 2–5를 적고 실행했다.
- [ ] S3 method를 하나 이상 직접 정의했다.
- [ ] S4 validity가 잘못된 객체를 거부하는 것을 두 가지 이상의 규칙으로 확인했다.
- [ ] assay / colData / rowData가 각각 무엇을 담는지 한 줄씩 적었다.
- [ ] (선택) BiocManager로 SummarizedExperiment를 설치하고 예시 3을 실행했거나, 실패 기록을 남겼다.

---
[← 이전](day-A5.md) · [코스 지도](../../../README.md) · [다음 →](day-A7.md)
