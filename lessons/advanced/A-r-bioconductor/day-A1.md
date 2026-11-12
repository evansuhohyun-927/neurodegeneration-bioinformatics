# Day A1 — Python에서 R로: 설치, RStudio, 첫 문법

> **주차:** 심화 파트 A — R과 Bioconductor · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/A/A1_basics.R`
>
> **먼저 끝내 둘 레슨:** 본 과정 0–6주차. 특히 [Day F2 — 변수와 자료형](../../week-0/day-F2.md), [Day F5 — 함수 만들기와 라이브러리 import](../../week-0/day-F5.md)를 떠올리며 읽으면 대조가 쉽습니다.

## 오늘의 목표
- R과 RStudio를 설치하고, 프로젝트 폴더에서 R 스크립트를 만들어 실행할 수 있다.
- Python과 R의 기본 문법 차이(할당, 1부터 세는 인덱스, 벡터 연산, 패키지 불러오기)를 표로 설명할 수 있다.
- 도움말과 설치된 패키지 버전을 R 안에서 스스로 찾아볼 수 있다.

## 🎬 영상으로 먼저 보기

- [What is RStudio and Why Should You Download It? | R Tutorial 1.1 — MarinStatsLectures](https://www.youtube.com/watch?v=riONFzJdXcs) (5:21)
- **무엇에 주목할까:** R(계산하는 엔진)과 RStudio(엔진을 편하게 쓰게 해 주는 작업대)가 서로 다른 프로그램이라는 점을 먼저 잡으세요. 화면의 네 구역이 각각 무엇을 보여 주는지도 보아 두면 오늘 실습이 빨라집니다.

- [R vs Python — IBM Technology](https://www.youtube.com/watch?v=4lcwTGA7MZw) (7:07)
- **무엇에 주목할까:** 어느 언어가 "더 좋다"가 아니라, 어떤 일에 어느 쪽 생태계가 두꺼운지를 듣는 영상입니다. 통계 모델과 생물학 패키지 묶음(Bioconductor)이 R 쪽에 모여 있다는 점이 이 심화 파트의 출발점입니다.

## 개념 설명

### 왜 Python을 배운 뒤에 R인가

본 과정에서 Python으로 표를 읽고, 그림을 그리고, 검정을 했습니다. 그런데 3주차에 차등발현을 다룰 때 "DESeq2, limma 같은 도구는 R에 있다"는 말을 여러 번 들었습니다. 발현 분석, 유전체 주석, 서열 처리 같은 생물정보 도구 상당수는 **Bioconductor**라는 R 패키지 저장소에 모여 있습니다. 논문의 Methods 절에서 "limma (R/Bioconductor)"라는 문구를 자주 보는 이유입니다.

비유하자면 Python은 여러 실험을 두루 하는 공용 실험실이고, R/Bioconductor는 발현 분석 장비가 잘 갖춰진 전문 코어 시설입니다. 둘 중 하나를 버리는 것이 아니라, 필요한 장비가 있는 곳으로 가서 쓰고 결과 표를 가져오면 됩니다. 이 파트의 목표도 "R로 갈아타기"가 아니라, **R로 쓰인 분석을 읽고, 작게 고치고, 다시 돌릴 수 있는 수준**입니다.

R은 처음부터 통계 분석용 언어로 설계되었습니다. 그래서 숫자 하나도 길이 1인 **벡터**로 다루고, 결측값(`NA`)과 범주형 변수(`factor`)가 언어 안에 기본으로 들어 있습니다. Python에서는 numpy와 pandas를 불러와야 하던 것들이 R에서는 처음부터 있다고 생각하면 됩니다.

### 설치: R, RStudio, 그리고 패키지

설치할 것은 둘입니다.

1. **R** — [CRAN](https://cran.r-project.org/)에서 자기 운영체제에 맞는 설치 파일을 받습니다. 계산을 실제로 하는 엔진입니다.
2. **RStudio Desktop** — [Posit 다운로드 페이지](https://posit.co/download/rstudio-desktop/)에서 받습니다. 스크립트 편집기, 콘솔, 변수 목록, 그림 창을 한 화면에 모은 작업대(IDE)입니다. VS Code나 Jupyter를 써 왔다면 같은 역할이라고 보면 됩니다.

본 과정의 conda 환경(`neurobio`)은 Python용이므로 그대로 둡니다. R은 CRAN 설치본을 따로 쓰는 것이 초보자에게 가장 덜 헷갈립니다.

R의 추가 기능은 **패키지**로 받습니다. Python의 `pip install`에 해당하는 것이 `install.packages("이름")`(CRAN 패키지)이고, `import`에 해당하는 것이 `library(이름)`입니다. Bioconductor 패키지는 설치 방법이 조금 다른데, Day A6에서 다룹니다. 설치는 컴퓨터에 한 번, `library()`는 R을 새로 켤 때마다 한다는 점이 Python과 같습니다.

### RStudio 프로젝트와 작업 디렉터리

R도 Python처럼 **작업 디렉터리(working directory)** 를 기준으로 상대 경로를 해석합니다. `getwd()`가 Python의 `os.getcwd()`입니다. RStudio에서 File → New Project로 이 저장소 폴더를 **프로젝트**로 지정하면, 프로젝트를 열 때마다 작업 디렉터리가 저장소 맨 위로 맞춰집니다. 그래서 `setwd("/Users/...")` 같은 개인 경로를 코드에 넣을 필요가 없습니다. 이 습관은 Day A7의 재현성과 바로 이어집니다.

코드는 **스크립트(.R 파일)** 에 쓰고, 한 줄씩(맥 Cmd+Enter, 윈도 Ctrl+Enter) 또는 전체를 실행합니다. 콘솔에 직접 친 명령은 남지 않으니, 남길 가치가 있는 것은 스크립트에 씁니다. 터미널에서는 `Rscript 파일.R`로 스크립트 전체를 실행할 수 있습니다. 이 파트의 예시 출력은 모두 이렇게 실행해 얻었습니다.

또 하나 권할 설정: Tools → Global Options → General에서 "Restore .RData into workspace at startup"을 끄고 "Save workspace on exit"를 Never로 둡니다. 어제 만든 변수가 몰래 남아 있으면, 스크립트를 처음부터 돌렸을 때 재현되지 않는 결과가 생기기 쉽습니다.

### Python ↔ R 대조표

| 하려는 일 | Python | R |
|---|---|---|
| 변수에 값 넣기 | `x = 5` | `x <- 5` (`=`도 되지만 관례는 `<-`) |
| 주석 | `# ...` | `# ...` |
| 첫 번째 원소 | `v[0]` | `v[1]` (R은 **1부터** 센다) |
| 여러 값 묶기 | `[1, 2, 3]` 또는 `np.array` | `c(1, 2, 3)` |
| 연속 정수 | `range(1, 4)` | `1:3` (끝 값 포함) |
| 원소마다 계산 | `np.array(v) * 2` | `v * 2` (기본이 벡터 연산) |
| 결측값 | `None`, `np.nan` | `NA` |
| 참/거짓 | `True`, `False` | `TRUE`, `FALSE` |
| 정수 나눗셈, 나머지 | `7 // 2`, `7 % 2` | `7 %/% 2`, `7 %% 2` |
| 함수 정의 | `def f(x): return x + 1` | `f <- function(x) x + 1` |
| 블록 | 들여쓰기 | 중괄호 `{ }` |
| 라이브러리 | `import pandas as pd` | `library(dplyr)` |
| 특정 패키지의 함수 | `pd.read_csv` | `readr::read_csv` |
| 도움말 | `help(len)` | `?length`, `help(length)` |
| 표 | pandas `DataFrame` | 기본 `data.frame` |

## 예시로 이해하기

> 예시의 유전자 이름은 친숙한 마우스 유전자 기호를 빌렸지만 값은 모두 연습용으로 지어낸 **가상 값**입니다.

### 예시 1 — 벡터 하나로 해 보는 첫 계산

```r
x <- 5
genes <- c("Gfap", "Aif1", "Cd68", "Tmem119")
counts <- c(820, 410, 95, 260)
names(counts) <- genes
print(counts)
counts[1]          # R은 1부터 센다
length(counts)
counts * 2         # 반복문 없이 원소마다 곱한다
mean(counts)
paste("유전자 수:", length(genes))
```

출력:

```text
   Gfap    Aif1    Cd68 Tmem119 
    820     410      95     260 
Gfap 
 820 
[1] 4
   Gfap    Aif1    Cd68 Tmem119 
   1640     820     190     520 
[1] 396.25
[1] "유전자 수: 4"
```

출력 앞의 `[1]`은 "이 줄은 결과의 1번째 원소부터 시작한다"는 표시입니다. 숫자 하나도 길이 1인 벡터라서 늘 붙습니다. `names()`로 이름표를 붙이면 pandas Series처럼 이름과 값이 함께 다닙니다. `counts * 2`에 반복문이 없다는 점이 R다운 첫 장면입니다.

### 예시 2 — Python 습관이 틀리는 자리

```r
v <- c(10, 20, 30)
v[0]        # Python의 v[0]과 다르다: 빈 벡터
v[-1]       # 음수는 "그 위치를 빼라"
v[4]        # 범위를 넘으면 오류가 아니라 NA
class(5)
class(5L)
7 / 2
7 %/% 2     # Python의 //
7 %% 2      # Python의 %
TRUE & FALSE
is.null(NULL)
```

출력:

```text
numeric(0)
[1] 20 30
[1] NA
[1] "numeric"
[1] "integer"
[1] 3.5
[1] 3
[1] 1
[1] FALSE
[1] TRUE
```

가장 위험한 세 줄이 맨 위에 있습니다. Python에서 `v[0]`은 첫 원소, `v[-1]`은 마지막 원소인데, R에서는 각각 "빈 벡터"와 "첫 원소를 뺀 나머지"입니다. 게다가 R은 `v[4]`처럼 범위를 넘어도 **오류를 내지 않고 `NA`를 돌려줍니다**. Python이라면 `IndexError`로 멈췄을 실수가 R에서는 조용히 결측값이 되어 뒤 계산으로 흘러갑니다. `5`는 실수(double), `5L`처럼 L을 붙여야 정수입니다.

### 예시 3 — 내 컴퓨터에 무엇이 깔려 있나

```r
for (p in c("ggplot2", "dplyr", "renv", "SummarizedExperiment")) {
  ok <- p %in% rownames(installed.packages())
  cat(sprintf("%-22s %s\n", p, if (ok) as.character(packageVersion(p)) else "설치 안 됨"))
}
cat(R.version.string, "\n")
```

이 레슨을 쓴 컴퓨터의 출력:

```text
ggplot2                3.5.2
dplyr                  1.1.4
renv                   1.1.4
SummarizedExperiment   설치 안 됨
R version 4.3.2 (2023-10-31) 
```

여러분의 결과는 다를 것이고, 그것이 정상입니다. 이 파트에서 **base R**(R에 기본으로 들어 있는 기능)만 쓰는 예시는 누구나 돌아가고, `dplyr`·`ggplot2`가 필요한 예시는 Day A5에서, Bioconductor 패키지가 필요한 예시는 Day A6–A7에서 설치 방법과 함께 따로 표시합니다. 버전을 확인하는 이 습관이 Day A7의 `sessionInfo()`로 이어집니다.

## 직접 해보기

1. R과 RStudio를 설치하고 RStudio를 엽니다. 콘솔에 `R.version.string`을 쳐서 버전을 확인합니다.
2. File → New Project → Existing Directory에서 이 저장소 폴더를 프로젝트로 엽니다. 콘솔에서 `getwd()`가 저장소 맨 위를 가리키는지 확인합니다.
3. Global Options에서 `.RData` 복원을 끄고 workspace 저장을 Never로 바꿉니다.
4. 콘솔에서 폴더를 만듭니다: `dir.create("notebooks/advanced/A", recursive = TRUE)`.
5. File → New File → R Script로 `notebooks/advanced/A/A1_basics.R`을 만들고 예시 1–3을 직접 타이핑해 한 줄씩 실행합니다.
6. 도움말 연습: 콘솔에 `?mean`을 치고 Help 창에서 `na.rm` 인자가 무슨 뜻인지 찾아 스크립트에 주석으로 적습니다. 함수 이름을 모르면 `??"standard deviation"`처럼 키워드로 찾습니다.
7. 터미널(RStudio의 Terminal 탭도 됩니다)에서 `Rscript notebooks/advanced/A/A1_basics.R`로 스크립트 전체를 실행해 봅니다.
8. 대조표를 보며 Python으로 쓴 한 줄 `[x * 2 for x in [3, 6, 9]]`를 R 한 줄로 바꿔 스크립트 맨 아래에 적습니다.

⚠️ **흔한 오류 1 — `Error: object 'x' not found`.** 변수를 만든 줄을 아직 실행하지 않았거나 철자가 다릅니다. R은 대소문자를 구분합니다(`Counts`와 `counts`는 다름). 오른쪽 위 Environment 창에 그 변수가 있는지 봅니다.

⚠️ **흔한 오류 2 — 한글이 `"\354\234\240..."`처럼 깨져 나온다.** 터미널의 언어 설정(locale)이 UTF-8이 아닐 때 `Rscript`에서 생깁니다. `Sys.getlocale()`로 확인하고, 맥 터미널이라면 `LANG=ko_KR.UTF-8 Rscript 파일.R` 또는 `LANG=en_US.UTF-8`로 실행합니다. RStudio 안에서는 보통 문제가 없습니다.

## 퀴즈

**1.** R에서 `v <- c(4, 5, 6)`일 때 `v[1]`의 값은?

(a) 4 (b) 5 (c) 6 (d) 오류

<details><summary>정답 보기</summary>

(a). R은 1부터 셉니다. Python의 `v[0]`에 해당하는 것이 R의 `v[1]`입니다.

</details>

**2.** 같은 `v`에서 `v[-1]`의 결과는? (단답)

<details><summary>정답 보기</summary>

`5 6`입니다. R에서 음수 인덱스는 "그 위치를 빼라"는 뜻이라 첫 원소를 뺀 나머지가 나옵니다. Python의 "마지막 원소"와 정반대이니 주의합니다.

</details>

**3.** `v[10]`처럼 범위를 넘는 위치를 요청하면 R은?

(a) IndexError로 멈춘다 (b) 마지막 원소를 준다 (c) NA를 준다 (d) 0을 준다

<details><summary>정답 보기</summary>

(c). 오류 없이 `NA`를 돌려줍니다. 실수가 조용히 결측값으로 바뀌어 뒤로 흘러가므로, 길이와 인덱스를 스스로 확인하는 습관이 필요합니다.

</details>

**4.** RStudio 프로젝트를 쓰면 `setwd("/Users/내이름/...")`를 코드에 넣지 않아도 되는 이유는? (단답)

<details><summary>정답 보기</summary>

프로젝트를 열면 작업 디렉터리가 자동으로 프로젝트 폴더로 맞춰지기 때문입니다. 코드에는 그 폴더 기준의 상대 경로만 쓰면 되고, 다른 사람의 컴퓨터에서도 같은 코드가 돌아갑니다.

</details>

**5.** Python의 `import numpy as np`에 가장 가까운 R의 동작은?

(a) `install.packages("numpy")` (b) `library(패키지)` (c) `source("파일.R")` (d) `?numpy`

<details><summary>정답 보기</summary>

(b). `install.packages()`는 컴퓨터에 한 번 설치하는 것(pip install), `library()`는 이번 세션에서 불러오는 것(import)입니다. `source()`는 다른 R 스크립트 파일을 통째로 실행합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] R과 RStudio를 설치하고 버전을 확인했다.
- [ ] 저장소를 RStudio 프로젝트로 열고 `.RData` 자동 저장을 껐다.
- [ ] `notebooks/advanced/A/A1_basics.R`에 예시 1–3과 도움말 메모를 적고 `Rscript`로 끝까지 실행했다.
- [ ] Python ↔ R 대조표에서 가장 헷갈리는 세 줄을 골라 스크립트 주석으로 남겼다.

---
[← 이전](../../../README.md) · [코스 지도](../../../README.md) · [다음 →](day-A2.md)
