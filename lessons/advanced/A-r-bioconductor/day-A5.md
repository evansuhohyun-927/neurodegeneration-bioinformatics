# Day A5 — 표 다루기와 그림: base R, dplyr, ggplot2

> **주차:** 심화 파트 A — R과 Bioconductor · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/A/A5_wrangle_plot.R`, `figures/advanced/A/A5_gene_boxplots.png`
>
> **먼저 끝내 둘 레슨:** Day A4. 비교 대상: [Day 4 — tidy data와 메타데이터, pandas QC](../../week-1/day-04.md), [Day 5 — 시각화 원칙](../../week-1/day-05.md).

## 오늘의 목표
- 같은 요약을 base R(`aggregate`, `merge`, `reshape`)과 dplyr/tidyr 파이프라인으로 각각 만들 수 있다.
- long(tidy) 형식과 wide 형식을 오가며, 어느 분석에 어느 형식이 필요한지 설명할 수 있다.
- ggplot2의 문법(데이터 + aes + geom + 층)으로 개별 점이 보이는 군 비교 그림을 만들어 파일로 저장할 수 있다.

## 🎬 영상으로 먼저 보기

- [Dplyr Essentials (easy data manipulation in R): select, mutate, filter, group_by, summarise, & more — Dataslice](https://www.youtube.com/watch?v=Gvhkp-Yw65U) (11:21)
- **무엇에 주목할까:** 함수 이름이 동사(고르다, 거르다, 만들다, 묶다, 요약하다)라는 점과, 파이프로 이어 쓰면 코드가 "작업 순서"대로 읽힌다는 점을 보세요. pandas의 메서드 체이닝과 비교하며 보면 빠릅니다.

- [ggplot for plots and graphs. An introduction to data visualization using R programming — R Programming 101](https://www.youtube.com/watch?v=HPJn1CMvtmI) (26:51)
- **무엇에 주목할까:** 그림을 "데이터 → 축과 색에 무엇을 연결할지(aes) → 어떤 모양으로 그릴지(geom) → 꾸미기" 층으로 쌓는 방식에 집중하세요. 앞 10분만 보아도 오늘 예시를 따라가기에 충분합니다.

## 개념 설명

### base R과 tidyverse: 같은 실험, 다른 장비

R에서 표를 다루는 길은 크게 둘입니다. 하나는 R에 기본으로 들어 있는 **base R** 함수들(`[ ]`, `subset`, `aggregate`, `merge`, `reshape`)이고, 다른 하나는 **tidyverse**라는 패키지 묶음(dplyr, tidyr, ggplot2, readr 등)입니다. 같은 실험을 수동 피펫으로 할지 자동 분주기로 할지의 차이에 가깝습니다. 결과는 같고, 손에 익은 쪽과 상황에 맞는 쪽을 고르면 됩니다.

이 파트가 두 길을 함께 보여 주는 이유가 있습니다. Bioconductor 패키지 내부와 그 설명서(vignette)는 대부분 base R로 쓰여 있고, 행렬과 이름 기반 부분 선택을 많이 씁니다. 반면 결과 표를 정리하고 그림을 그리는 단계에서는 dplyr과 ggplot2가 압도적으로 많이 쓰입니다. 남의 분석 코드를 읽으려면 둘 다 알아봐야 합니다.

설치 확인: 이 레슨의 코드는 `dplyr`, `tidyr`, `ggplot2`가 필요합니다. `library(dplyr)`에서 "there is no package" 오류가 나면 `install.packages(c("dplyr", "tidyr", "ggplot2"))`로 한 번 설치합니다. 한꺼번에 받으려면 `install.packages("tidyverse")`도 됩니다.

### dplyr의 다섯 동사와 파이프

dplyr의 핵심 함수는 동사입니다. `filter()`(행 거르기), `select()`(열 고르기), `mutate()`(새 열 만들기), `group_by()` + `summarise()`(묶어서 요약), `arrange()`(정렬). 이것들을 **파이프** `|>`로 잇습니다. `x |> f() |> g()`는 `g(f(x))`와 같지만, 왼쪽에서 오른쪽으로 작업 순서대로 읽힙니다. 실험 프로토콜을 "1단계 → 2단계 → 3단계"로 적는 것과 같습니다. 오래된 코드에서는 같은 역할의 `%>%`(magrittr 파이프)를 많이 보게 됩니다.

pandas와의 대응은 대략 이렇습니다: `filter` ↔ `df[조건]` 또는 `query`, `select` ↔ `df[[열들]]`, `mutate` ↔ `assign`, `group_by |> summarise` ↔ `groupby().agg()`, `arrange` ↔ `sort_values`. dplyr의 결과는 **tibble**로 나오는데, 화면에 앞부분만 보여 주고 열마다 자료형을 표시하는 data.frame이라고 보면 됩니다.

### long과 wide: 분석마다 필요한 모양이 다르다

1주차에 배운 **tidy data**는 "한 행 = 한 관측, 한 열 = 한 변수"입니다. 발현 데이터라면 (유전자, 샘플, 값)이 한 행인 **long 형식**입니다. 그룹별 요약, ggplot2 그림, 통계 모델의 입력에는 long 형식이 편합니다. 반면 Bioconductor 도구와 PCA·heatmap은 유전자 × 샘플의 **wide 형식(행렬)** 을 원합니다. tidyr의 `pivot_longer()`와 `pivot_wider()`, base R의 `reshape()`가 두 형식을 오갑니다. 어느 쪽이 "옳은" 모양이 아니라, 다음 단계가 요구하는 모양으로 바꾸는 것입니다.

### ggplot2: 그림을 층으로 쌓는 문법

ggplot2의 그림은 세 가지로 시작합니다: **데이터**(long 형식 data.frame), **aes**(어떤 열을 x, y, 색, 모양에 연결할지), **geom**(점, 상자, 선 등 어떤 모양으로 그릴지). 여기에 `+`로 층을 더합니다. `facet_wrap(~ gene)`은 유전자마다 작은 그림을 나란히 그리고, `labs()`는 축 이름을, `theme_bw()` 같은 theme은 배경과 글꼴을 정합니다. 그림 객체를 변수에 넣어 두고 층을 더하거나 `ggsave()`로 파일에 저장할 수 있습니다.

1주차 Day 5의 원칙은 그대로입니다. 표본이 작을수록 평균 막대 대신 **개별 점**을 보여 주고, 색에 의존하지 않도록 모양(shape)도 함께 쓰며, 축 이름에 단위와 변환(log2 등)을 적습니다. base R의 `plot()`, `boxplot()`도 빠른 확인용으로 여전히 유용하지만, 여러 층을 체계적으로 쌓는 보고서용 그림은 ggplot2가 편합니다.

## 예시로 이해하기

> 모든 값은 연습용 **가상 값**입니다. 세 예시가 같은 가상 데이터를 씁니다. 먼저 아래 코드를 `a5_data.R`로 저장해 두고 각 예시 맨 위에서 `source("a5_data.R")`로 불러옵니다(같은 폴더에서 실행한다고 가정).

```r
# a5_data.R — 유전자 4개 × 샘플 8개의 long 형식 가상 데이터
set.seed(42)
samples <- data.frame(sample = sprintf("S%02d", 1:8),
                      group  = rep(c("ctrl", "treat"), each = 4),
                      batch  = rep(c("b1", "b2"), times = 4))
genes <- c("Gfap", "Aif1", "Cd68", "Tmem119")
shift <- c(Gfap = 1.0, Aif1 = 0.6, Cd68 = 1.5, Tmem119 = 0)
long <- expand.grid(gene = genes, sample = samples$sample, stringsAsFactors = FALSE)
long <- merge(long, samples, by = "sample")
long$log2expr <- round(8 + rnorm(nrow(long), sd = 0.4) +
                       ifelse(long$group == "treat", shift[long$gene], 0), 2)
```

`expand.grid()`가 모든 (유전자, 샘플) 조합을 만들고, `merge()`가 샘플 정보표를 샘플 ID로 붙입니다(pandas의 `merge`와 같은 일). 처리군에서만 유전자별로 정한 만큼(`shift`) 값을 올렸습니다.

### 예시 1 — base R로 요약하고 모양 바꾸기

```r
source("a5_data.R")
head(long, 4)
# base R
agg <- aggregate(log2expr ~ gene + group, data = long, FUN = mean)
agg[order(agg$gene), ]
wide <- reshape(long[, c("gene", "sample", "log2expr")], idvar = "gene",
                timevar = "sample", direction = "wide")
dim(wide)
```

출력:

```text
  sample    gene group batch log2expr
1    S01    Gfap  ctrl    b1     8.55
2    S01    Aif1  ctrl    b1     7.77
3    S01    Cd68  ctrl    b1     8.15
4    S01 Tmem119  ctrl    b1     8.25
     gene group log2expr
1    Aif1  ctrl   7.8975
5    Aif1 treat   8.0500
2    Cd68  ctrl   8.3050
6    Cd68 treat   9.2575
3    Gfap  ctrl   8.2400
7    Gfap treat   9.1775
4 Tmem119  ctrl   8.3425
8 Tmem119 treat   8.1475
[1] 4 9
```

`aggregate(값 ~ 묶을 변수들, data, FUN)`의 물결표(`~`)는 R의 **formula** 문법입니다. "왼쪽을 오른쪽으로 묶어서"라는 뜻이고, Day A7의 선형 모델 `lm(y ~ batch + group)`에서도 같은 문법을 씁니다. `reshape()`로 만든 wide 표는 유전자 4행 × (유전자 열 1개 + 샘플 8열)입니다.

### 예시 2 — dplyr/tidyr 파이프라인

```r
source("a5_data.R")
suppressPackageStartupMessages({ library(dplyr); library(tidyr) })
summ <- long |>
  filter(gene != "Tmem119") |>
  group_by(gene, group) |>
  summarise(mean = mean(log2expr), n = n(), .groups = "drop") |>
  pivot_wider(names_from = group, values_from = mean) |>
  mutate(diff = round(treat - ctrl, 2)) |>
  arrange(desc(diff))
summ
mat <- long |>
  select(gene, sample, log2expr) |>
  pivot_wider(names_from = sample, values_from = log2expr)
dim(mat)
```

출력:

```text
# A tibble: 3 × 5
  gene      n  ctrl treat  diff
  <chr> <int> <dbl> <dbl> <dbl>
1 Cd68      4  8.30  9.26  0.95
2 Gfap      4  8.24  9.18  0.94
3 Aif1      4  7.90  8.05  0.15
[1] 4 9
```

파이프를 위에서 아래로 읽으면 그대로 작업 설명이 됩니다: Tmem119를 빼고 → 유전자·군별로 묶어 → 평균과 개수를 내고 → 군을 열로 펼쳐 → 차이 열을 만들고 → 차이가 큰 순으로 정렬. `diff`는 평균의 차이일 뿐 통계 검정이 아닙니다. 군당 4개에서 0.95와 0.94는 사실상 같은 크기로 읽어야 하며, 이 순위로 "Cd68이 더 중요하다"고 말할 수는 없습니다. 아래쪽 `pivot_wider`는 예시 1의 `reshape()`와 같은 4 × 9 wide 표를 만듭니다.

### 예시 3 — ggplot2로 군 비교 그림 저장

```r
source("a5_data.R")
suppressPackageStartupMessages(library(ggplot2))
dir.create("figures/advanced/A", recursive = TRUE, showWarnings = FALSE)
p <- ggplot(long, aes(x = group, y = log2expr)) +
  geom_boxplot(outlier.shape = NA, fill = "grey90") +
  geom_jitter(aes(shape = batch), width = 0.1, size = 2) +
  facet_wrap(~ gene, nrow = 1) +
  labs(x = NULL, y = "log2 정규화 발현(가상)", title = "가상 데이터: 유전자별 군 비교") +
  theme_bw(base_size = 11)
ggsave("figures/advanced/A/A5_gene_boxplots.png", p, width = 8, height = 3, dpi = 150)
file.exists("figures/advanced/A/A5_gene_boxplots.png")
class(p)
```

출력:

```text
[1] TRUE
[1] "gg"     "ggplot"
```

이 레슨을 쓴 컴퓨터에서는 맨 위에 `package 'ggplot2' was built under R version 4.3.3` 경고가 한 줄 더 나왔습니다. 설치된 패키지가 조금 더 새 R에서 빌드되었다는 알림으로, 이 예시의 결과에는 영향이 없었습니다.

만들어진 그림에는 유전자 네 칸이 나란히 있고, 칸마다 ctrl/treat 상자 위에 개별 샘플 점이 배치별 모양(동그라미 b1, 세모 b2)으로 찍힙니다. `outlier.shape = NA`는 상자그림이 따로 찍는 이상치 점을 끄는 옵션입니다. 모든 점을 `geom_jitter`로 이미 찍고 있으므로 같은 점이 두 번 나오지 않게 합니다. `class(p)`가 보여 주듯 그림도 하나의 R 객체입니다.

## 직접 해보기

1. 위의 데이터 코드를 `notebooks/advanced/A/a5_data.R`로, 예시 1–3을 `notebooks/advanced/A/A5_wrangle_plot.R`로 저장합니다. 저장소 맨 위에서 실행한다면 `source("notebooks/advanced/A/a5_data.R")`처럼 경로를 맞춥니다.
2. 패키지가 없다는 오류가 나면 `install.packages(c("dplyr", "tidyr", "ggplot2"))`로 설치한 뒤 다시 실행합니다.
3. **같은 질문, 두 방법.** "배치(b1/b2)별 평균 log2expr"를 (a) `aggregate()`로, (b) `group_by(batch) |> summarise()`로 구해 값이 같은지 비교합니다.
4. **wide → long 왕복.** 예시 2의 `mat`을 `pivot_longer(mat, cols = -gene, names_to = "sample", values_to = "log2expr")`로 되돌리고, 원래 `long`과 행 수가 같은지 `nrow()`로 확인합니다.
5. **행렬로 바꾸기.** `mat`에서 gene 열을 행 이름으로 옮겨 숫자 행렬을 만듭니다: `m <- as.matrix(mat[, -1]); rownames(m) <- mat$gene`. Day A6의 Bioconductor 객체에 들어갈 모양이 바로 이것입니다.
6. **그림 고치기.** 예시 3에서 (a) `facet_wrap(..., scales = "free_y")`를 넣어 보고 무엇이 달라지는지, (b) 그것이 유전자 간 비교를 어떻게 오해하게 만들 수 있는지 주석으로 적습니다. 마지막으로 그림 파일을 열어 확인합니다.

⚠️ **흔한 오류 1 — 파이프 줄 끝의 `|>`나 ggplot의 `+`를 줄 맨 앞에 둔다.** R은 줄이 끝나면 식이 끝났다고 봅니다. 연결 기호는 항상 **줄 끝**에 둡니다.

⚠️ **흔한 오류 2 — `filter()`가 엉뚱하게 동작한다.** dplyr의 `filter`와 base R `stats`의 `filter`가 이름이 같습니다. dplyr을 불러오지 않았거나 다른 패키지가 덮어썼다면 `dplyr::filter()`처럼 패키지 이름을 붙여 부릅니다. `library()` 때 나오는 "masked from" 메시지가 이 충돌을 알려 줍니다.

## 퀴즈

**1.** `long |> group_by(gene) |> summarise(m = mean(value))`와 같은 일을 하는 base R 식은?

(a) `aggregate(value ~ gene, data = long, FUN = mean)` (b) `merge(long, gene)` (c) `reshape(long, direction = "wide")` (d) `apply(long, 1, mean)`

<details><summary>정답 보기</summary>

(a). formula `value ~ gene`이 "value를 gene별로 묶어서", `FUN = mean`이 "평균을 내라"입니다. `tapply(long$value, long$gene, mean)`도 같은 숫자를 줍니다.

</details>

**2.** ggplot2 그림에 유전자별 작은 칸을 나란히 만들 때 쓰는 층은? (단답)

<details><summary>정답 보기</summary>

`facet_wrap(~ gene)`(또는 두 변수로 격자를 만들 때 `facet_grid`)입니다. 각 칸이 같은 축 범위를 공유하는 것이 기본이라 칸끼리 크기를 비교하기 좋습니다.

</details>

**3.** 다음 중 long 형식이 더 알맞은 작업은?

(a) PCA (b) 유전자 × 샘플 heatmap (c) ggplot2로 유전자·군별 점 그림 (d) Bioconductor 객체의 assay에 넣기

<details><summary>정답 보기</summary>

(c). ggplot2는 한 행이 한 관측인 long 형식에서 열을 aes에 연결합니다. 나머지 셋은 유전자 × 샘플 행렬(wide)을 입력으로 받습니다.

</details>

**4.** 예시 2에서 Cd68(0.95)이 Gfap(0.94)보다 위에 정렬되었습니다. 이 결과에 대한 해석으로 알맞은 것은?

(a) Cd68이 더 중요한 유전자다 (b) 두 유전자의 변화 크기는 사실상 같으며, 평균 차이만으로는 순위를 정할 근거가 없다 (c) Gfap은 변하지 않았다 (d) p-value가 Cd68 쪽이 더 작다

<details><summary>정답 보기</summary>

(b). 군당 4개의 평균 차이 0.01은 잡음 범위입니다. 검정도 하지 않았으므로 p-value에 대해서도 말할 수 없습니다. 정렬은 보기 편하게 하는 것이지 중요도의 증거가 아닙니다.

</details>

**5.** `long |> filter(gene == "Gfap")`에서 "could not find function" 또는 이상한 인자 오류가 납니다. 먼저 확인할 것 두 가지는? (단답)

<details><summary>정답 보기</summary>

(1) 이번 세션에서 `library(dplyr)`를 실행했는지, (2) 다른 패키지의 같은 이름 함수가 덮어쓰지 않았는지입니다. `dplyr::filter()`처럼 패키지 이름을 붙이면 둘 다 피할 수 있습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/advanced/A/A5_wrangle_plot.R`과 `a5_data.R`을 만들고 끝까지 실행했다.
- [ ] 같은 요약을 base R과 dplyr로 각각 만들어 값이 같음을 확인했다.
- [ ] long ↔ wide를 왕복하고 숫자 행렬까지 만들었다.
- [ ] `figures/advanced/A/A5_gene_boxplots.png`를 저장하고 개별 점·배치 모양이 보이는지 확인했다.

---
[← 이전](day-A4.md) · [코스 지도](../../../README.md) · [다음 →](day-A6.md)
