# Day A4 — 함수, 제어문, apply 계열, 오류 다루기

> **주차:** 심화 파트 A — R과 Bioconductor · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/A/A4_functions.R`
>
> **먼저 끝내 둘 레슨:** Day A3. 비교 대상: [Day F4 — 조건문과 반복문](../../week-0/day-F4.md), [Day F5 — 함수 만들기와 라이브러리 import](../../week-0/day-F5.md), [Day F7 — 오류 메시지 읽는 법](../../week-0/day-F7.md).

## 오늘의 목표
- 기본값이 있는 함수를 만들고, 입력을 검사해 잘못된 호출을 바로 멈추게 할 수 있다.
- `if`/`ifelse`/`switch`와 `apply`/`lapply`/`sapply`/`vapply`/`tapply`를 상황에 맞게 고를 수 있다.
- `tryCatch`와 `on.exit`로 오류·경고를 다루고, `traceback`/`browser`/`system.time`으로 문제를 찾을 수 있다.

## 🎬 영상으로 먼저 보기

- [A tutorial for writing functions in R (CC177) — Riffomonas Project](https://www.youtube.com/watch?v=3uK1OzA7CTs) (14:37)
- **무엇에 주목할까:** 같은 코드를 복사해 붙이던 부분이 함수 하나로 바뀌는 과정, 그리고 인자에 기본값을 주는 방식을 보세요. 생물학 데이터 분석자가 만든 채널이라 예시가 오늘 내용과 가깝습니다.

- [How to Use lapply, sapply and mapply in R — DataDaft](https://www.youtube.com/watch?v=34sbvhr_pm8) (7:45)
- **무엇에 주목할까:** 같은 함수를 여러 원소에 적용한 결과가 list로 오는지(`lapply`) 벡터로 정리되어 오는지(`sapply`)의 차이에 집중하세요.

## 개념 설명

### 함수는 표준 작업 지침서(SOP)다

R의 함수는 `이름 <- function(인자) { 본문 }`으로 만듭니다. Python의 `def`와 달리 함수도 `<-`로 변수에 넣는 값이라는 점이 눈에 띕니다. 마지막으로 계산한 값이 자동으로 돌려주는 값이 되며, 중간에 끝내려면 `return()`을 씁니다.

함수는 실험실의 SOP와 같습니다. 단계를 한 번 잘 적어 두면, 시료(인자)만 바꿔 같은 절차를 정확히 되풀이합니다. 좋은 SOP가 "시료가 이 조건이 아니면 진행하지 말 것"을 적어 두듯, 좋은 함수는 맨 앞에서 입력을 검사합니다. `stop("메시지")`는 그 자리에서 오류를 내며 멈추고, `stopifnot(조건)`은 조건이 거짓이면 멈춥니다. 정규화 계수의 개수가 샘플 수와 다른데도 재활용 규칙(Day A2) 때문에 계산이 그냥 진행되는 사고를 이렇게 막습니다.

인자에는 **기본값**을 줄 수 있고(`pseudo = 1`), 호출할 때 이름으로 넘길 수 있습니다. 이름을 쓰면 순서를 틀려도 안전하고 코드도 읽기 쉬워집니다. `...`은 "나머지 인자를 그대로 다른 함수에 넘긴다"는 뜻으로, R 함수 설명서에서 자주 보게 됩니다.

### 함수는 자기가 태어난 곳을 기억한다

R 함수는 본문에서 쓰는 변수를 찾을 때, 먼저 자기 안을 보고 없으면 **자기가 만들어진 곳**을 봅니다. 이 규칙을 **어휘적 범위(lexical scope)** 라고 합니다. 덕분에 "설정값을 기억하는 함수"를 찍어 낼 수 있습니다. 예를 들어 `make_filter(20)`이 돌려주는 함수는 20이라는 문턱을 기억하고, `make_filter(100)`이 돌려주는 함수는 100을 기억합니다. 이런 함수를 **closure**라고 부릅니다. 같은 피펫 모델이라도 부피를 다르게 고정해 둔 여러 자루를 갖고 있는 것과 같습니다. 우도 함수를 만들어 최적화 함수(`optimize`, `optim`)에 넘기는 통계 코드에서 이 방식이 자주 쓰입니다.

R 함수는 인자의 **복사본**을 받아 일합니다(pass-by-value). 함수 안에서 인자를 고쳐도 바깥의 원래 객체는 바뀌지 않습니다. 결과를 남기려면 반드시 돌려받아 변수에 넣어야 합니다: `x <- f(x)`. Python에서 리스트를 함수에 넘겨 안에서 고치면 바깥도 바뀌던 것과 다릅니다.

### 제어문: 하나의 값에는 if, 벡터에는 ifelse

`if (조건) { ... } else { ... }`는 Python의 `if`와 같지만, 조건이 **길이 1인 TRUE/FALSE**여야 합니다. 길이가 2 이상이면 R 4.2부터 오류입니다. 벡터 전체에 조건을 적용하려면 `ifelse(조건, 참일 때, 거짓일 때)`를 씁니다. 여러 갈래 중 하나를 고를 때는 `switch()`가 깔끔합니다.

반복은 `for (x in 벡터) { ... }`, `while (조건) { ... }`가 있습니다. 다만 R에서는 Day A2의 벡터 연산이나 아래의 apply 계열로 반복문 자체를 없앨 수 있는 경우가 많습니다.

### apply 계열: "모든 행에 대해 이 작업을"

| 함수 | 무엇에 적용하나 | 돌려주는 것 | Python에서 비슷한 것 |
|---|---|---|---|
| `apply(m, 1, f)` | 행렬의 행(1) 또는 열(2)마다 | 벡터 또는 행렬 | `df.apply(f, axis=1)` |
| `lapply(x, f)` | 벡터·list의 원소마다 | 항상 list | `[f(v) for v in x]` |
| `sapply(x, f)` | 원소마다 | 가능하면 벡터로 단순화 | 위와 같고 결과를 배열로 |
| `vapply(x, f, numeric(1))` | 원소마다 | 지정한 모양의 벡터(아니면 오류) | 타입을 보장한 버전 |
| `tapply(값, 그룹, f)` | 그룹별로 | 그룹 이름이 붙은 벡터 | `df.groupby(g)[col].agg(f)` |
| `Map`, `Reduce`, `Filter` | 여러 벡터 짝지어, 누적, 거르기 | list, 값, 벡터 | `map`, `functools.reduce`, `filter` |

`sapply`는 편하지만 결과 모양이 입력에 따라 달라질 수 있어, 함수 안처럼 확실해야 하는 곳에서는 `vapply`가 안전합니다. 또 합계·평균처럼 자주 하는 계산은 `rowSums`, `colMeans` 같은 전용 함수가 `apply`보다 훨씬 빠릅니다.

### 오류와 경고를 다루고, 문제를 찾는 법

R의 이상 신호는 **오류(error, 멈춤)** 와 **경고(warning, 계속하지만 알림)** 두 가지가 주로 쓰입니다. 유전자 수백 개에 같은 검정을 돌리다 하나에서 오류가 나면 전체가 멈춥니다. `tryCatch(식, error = function(e) ...)`로 감싸면 오류를 잡아 `NA`를 기록하고 다음 유전자로 넘어갈 수 있습니다. 단, 잡은 오류는 반드시 **기록**해서 나중에 몇 개가 실패했는지 보고해야 합니다. 조용히 삼키면 결과 표에서 유전자가 사라진 이유를 아무도 모르게 됩니다.

`on.exit()`는 함수가 정상으로 끝나든 오류로 끝나든 마지막에 반드시 할 일(파일 연결 닫기, 설정 되돌리기)을 등록합니다. 실험이 중간에 실패해도 장비 전원은 꼭 끄는 체크리스트와 같습니다.

문제를 찾을 때 쓰는 도구:

- `traceback()` — 방금 난 오류가 어떤 함수 호출 경로에서 났는지 보여 줍니다. 오류가 드러난 곳과 원인이 생긴 곳은 다를 수 있으니 경로 전체를 거슬러 읽습니다.
- `browser()` — 함수 본문에 넣으면 그 줄에서 멈추고, 그 순간의 변수들을 콘솔에서 들여다볼 수 있습니다. `n`(다음 줄), `c`(계속), `Q`(종료). RStudio에서는 줄 번호 왼쪽을 눌러 중단점을 찍는 것과 같습니다.
- `debug(f)` / `undebug(f)` — 함수 `f`가 불릴 때마다 처음부터 `browser`로 들어갑니다.
- `options(warn = 2)` — 경고를 오류로 바꿔, 경고가 어디서 났는지 `traceback()`으로 추적하게 합니다.
- `system.time(식)` — 걸린 시간을 잽니다. 느린 부분이 어딘지 함수 단위로 보려면 `Rprof()`를 씁니다.

## 예시로 이해하기

> 모든 값은 연습용 **가상 값**입니다.

### 예시 1 — 입력을 검사하는 정규화 함수

```r
log2_norm <- function(counts, size_factor, pseudo = 1) {
  if (length(size_factor) != ncol(counts)) stop("size_factor 길이가 샘플 수와 다릅니다")
  log2(sweep(counts, 2, size_factor, "/") + pseudo)
}
m <- matrix(c(100, 400, 200, 800, 50, 200), nrow = 2,
            dimnames = list(c("Gfap", "Cd68"), c("S1", "S2", "S3")))
round(log2_norm(m, size_factor = c(1, 2, 0.5)), 2)
round(log2_norm(m, c(1, 2, 0.5), pseudo = 0.5), 2)
res <- tryCatch(log2_norm(m, c(1, 2)), error = function(e) conditionMessage(e))
res
```

출력:

```text
       S1   S2   S3
Gfap 6.66 6.66 6.66
Cd68 8.65 8.65 8.65
       S1   S2   S3
Gfap 6.65 6.65 6.65
Cd68 8.65 8.65 8.65
[1] "size_factor 길이가 샘플 수와 다릅니다"
```

행렬이 **열 방향**으로 채워져 S1 = (100, 400), S2 = (200, 800), S3 = (50, 200)입니다. S2는 S1보다 두 배, S3는 절반만큼 "많이 읽힌" 샘플이라고 보고 계수 2와 0.5로 나누면(`sweep`이 열마다 나눔) 세 샘플이 같아집니다. Day 17의 housekeeping 정규화와 같은 생각입니다. 계수를 2개만 주면 재활용 대신 우리가 정한 오류 메시지로 멈춥니다.

### 예시 2 — closure와 제어문

```r
make_filter <- function(min_count) {
  function(x) x[x >= min_count]       # min_count를 기억하는 함수(closure)
}
keep20 <- make_filter(20)
keep100 <- make_filter(100)
v <- c(Gfap = 350, Il6 = 12, Cd68 = 80, Neg1 = 5)
keep20(v)
keep100(v)
classify <- function(lfc) {
  if (is.na(lfc)) return("결측")
  if (lfc >= 1) "증가" else if (lfc <= -1) "감소" else "변화 작음"
}
classify(1.4); classify(NA)
lfcs <- c(1.4, -0.2, -1.8)
ifelse(lfcs >= 1, "증가", ifelse(lfcs <= -1, "감소", "변화 작음"))
unit <- "log2"
switch(unit, log2 = "두 배 = 1", log10 = "열 배 = 1", "모르는 단위")
```

출력:

```text
Gfap Cd68 
 350   80 
Gfap 
 350 
[1] "증가"
[1] "결측"
[1] "증가"      "변화 작음" "감소"     
[1] "두 배 = 1"
```

`keep20`과 `keep100`은 같은 코드에서 나왔지만 각자 다른 문턱을 기억합니다. `classify()`는 값 하나를 받으므로 `if`를, 벡터 `lfcs`에는 `ifelse()`를 썼습니다. `classify(lfcs)`를 하면 R 4.2 이상에서 "the condition has length > 1" 오류가 납니다. `switch()`의 마지막 이름 없는 값은 어느 경우에도 해당하지 않을 때의 기본값입니다.

### 예시 3 — apply 계열을 한 번에 비교

```r
set.seed(3)
m <- matrix(round(2^rnorm(15, mean = 7)), nrow = 5,
            dimnames = list(paste0("g", 1:5), c("S1", "S2", "S3")))
apply(m, 1, median)                       # 1 = 행(유전자)마다
apply(m, 2, sum)                          # 2 = 열(샘플)마다
colSums(m)                                # 같은 일을 하는 전용 함수
per_sample <- lapply(colnames(m), function(s) summary(m[, s]))
names(per_sample) <- colnames(m)
per_sample$S2
sapply(colnames(m), function(s) max(m[, s]))
vapply(colnames(m), function(s) max(m[, s]), numeric(1))
value <- c(5.1, 5.4, 6.8, 7.0, 4.9, 7.3)
group <- c("ctrl", "ctrl", "treat", "treat", "ctrl", "treat")
tapply(value, group, mean)
Reduce(`+`, list(1:3, 4:6, 7:9))
Filter(function(x) x > 6, value)
Map(function(g, v) paste(g, v), c("a", "b"), c(1, 2))
```

출력:

```text
 g1  g2  g3  g4  g5 
 76 105 153  58 147 
 S1  S2  S3 
529 908 506 
 S1  S2  S3 
529 908 506 
   Min. 1st Qu.  Median    Mean 3rd Qu.    Max. 
   55.0   131.0   136.0   181.6   278.0   308.0 
 S1  S2  S3 
153 308 152 
 S1  S2  S3 
153 308 152 
    ctrl    treat 
5.133333 7.033333 
[1] 12 15 18
[1] 6.8 7.0 7.3
$a
[1] "a 1"

$b
[1] "b 2"

```

`apply(m, 2, sum)`과 `colSums(m)`의 결과가 같습니다. 큰 행렬에서는 `colSums`가 훨씬 빠르므로 전용 함수가 있으면 그쪽을 씁니다. `lapply`는 샘플마다 `summary()` 결과를 list로 모았고, `sapply`/`vapply`는 숫자 하나씩이라 벡터로 정리되었습니다. `tapply`는 pandas의 `groupby().mean()`과 같은 일을 합니다. `Reduce`는 세 벡터를 차례로 더해 `(1+4+7, 2+5+8, 3+6+9)`를 만들었습니다.

### 예시 4 — 오류·경고 잡기, 뒷정리, 시간 재기

```r
safe_log2 <- function(x) {
  withCallingHandlers(
    tryCatch(log2(x),
             error = function(e) { message("오류를 잡았다: ", conditionMessage(e)); NA }),
    warning = function(w) { message("경고를 기록했다: ", conditionMessage(w)); invokeRestart("muffleWarning") })
}
safe_log2(8)
safe_log2(-1)
safe_log2("Gfap")
read_with_cleanup <- function() {
  con <- file(tempfile(), "w")
  on.exit({ close(con); message("파일 연결을 닫았다") })
  writeLines("S1,ctrl", con)
  stop("중간에 실패")
}
try(read_with_cleanup(), silent = TRUE)
x <- runif(1e6)
t_loop <- system.time({ s <- 0; for (v in x) s <- s + v^2 })["elapsed"]
t_vec  <- system.time(sum(x^2))["elapsed"]
c(loop = unname(t_loop), vectorized = unname(t_vec))
```

이 레슨을 쓴 컴퓨터의 출력(시간은 컴퓨터마다 다릅니다):

```text
[1] 3
경고를 기록했다: NaNs produced
[1] NaN
오류를 잡았다: non-numeric argument to mathematical function
[1] NA
파일 연결을 닫았다
      loop vectorized 
     0.013      0.003 
```

음수의 log는 경고와 함께 `NaN`(숫자가 아님)을 주고, 글자의 log는 오류입니다. `safe_log2`는 둘 다 멈추지 않고 메시지를 남긴 채 계속 갑니다. `read_with_cleanup`은 `stop()`으로 실패했지만 `on.exit`에 등록한 정리 작업은 실행되었습니다. 마지막 두 줄은 같은 제곱합을 반복문과 벡터 연산으로 계산한 시간입니다. 숫자 자체보다 "몇 배 차이"를 보세요.

## 직접 해보기

1. `notebooks/advanced/A/A4_functions.R`을 만들고 예시 1–4를 실행합니다.
2. **z-score 함수.** 행렬을 받아 유전자(행)마다 평균을 빼고 표준편차로 나누는 `row_z <- function(m, center = mean, scale = sd)`를 만듭니다. `apply(m, 1, ...)`의 결과가 **뒤집혀**(샘플 × 유전자) 나온다는 점을 확인하고 `t()`로 바로잡습니다. 그다음 `center = median, scale = mad`로 바꿔 호출해 봅니다. 함수를 인자로 넘길 수 있다는 것이 오늘의 요점입니다.
3. **입력 검사 추가.** `row_z`의 첫 줄에 `stopifnot(is.matrix(m), is.numeric(m))`를 넣고, data.frame이나 문자 행렬을 넣었을 때 멈추는지 확인합니다.
4. **유전자마다 검정, 실패는 기록.** 예시 3의 `m`에 행 하나를 `NA`로만 채운 유전자를 추가하고, `sapply(rownames(m), function(g) tryCatch(t.test(m[g, ])$p.value, error = function(e) NA))`로 돌려 봅니다. 실패한 유전자 수를 `sum(is.na(...))`로 세어 출력합니다.
5. **traceback 연습.** 아래를 실행해 오류가 난 뒤 콘솔에 `traceback()`을 칩니다. 어느 함수에서 문제가 시작되었는지 읽어 봅니다.

   ```r
   inner <- function(x) log(x)
   outer <- function(v) inner(as.character(v))
   outer(1:3)
   ```

6. **browser 연습(RStudio에서).** 예시 1의 `log2_norm` 첫 줄 앞에 `browser()`를 넣고 호출한 뒤, 멈춘 상태에서 `size_factor`와 `ncol(counts)`를 쳐서 값을 확인하고 `c`로 계속합니다. 끝나면 `browser()` 줄을 지웁니다.

⚠️ **흔한 오류 1 — `the condition has length > 1`.** `if`에 벡터를 넣었습니다. 원소마다 판단하려면 `ifelse()`나 `sapply()`를 씁니다.

⚠️ **흔한 오류 2 — 함수 안에서 바꾼 값이 밖에 반영되지 않는다.** R 함수는 복사본으로 일합니다. `normalize(m)`만 쓰고 끝내면 `m`은 그대로입니다. `m_norm <- normalize(m)`처럼 결과를 받아야 합니다.

## 퀴즈

**1.** `f <- function(x, k = 2) x^k`일 때 `f(3)`과 `f(3, k = 3)`의 값은?

(a) 9, 27 (b) 6, 9 (c) 9, 9 (d) 오류

<details><summary>정답 보기</summary>

(a). `k`를 주지 않으면 기본값 2가 쓰여 3² = 9, 이름으로 3을 주면 3³ = 27입니다.

</details>

**2.** 유전자 × 샘플 행렬 `m`에서 샘플별 총합을 가장 효율적으로 구하는 식은? (단답)

<details><summary>정답 보기</summary>

`colSums(m)`입니다. `apply(m, 2, sum)`도 같은 값을 주지만, 전용 함수가 내부에서 훨씬 빠르게 계산합니다.

</details>

**3.** `sapply` 대신 `vapply`를 쓰는 이유로 가장 알맞은 것은?

(a) 항상 더 빠르다 (b) 결과의 모양과 자료형을 미리 정해 두고, 어긋나면 오류로 알려 준다 (c) list를 돌려준다 (d) 행렬에만 쓸 수 있다

<details><summary>정답 보기</summary>

(b). `sapply`는 입력에 따라 결과가 벡터·행렬·list로 바뀔 수 있습니다. `vapply`는 "숫자 하나씩"처럼 약속을 적어 두므로, 약속이 깨지면 조용히 넘어가지 않고 멈춥니다.

</details>

**4.** 유전자 500개에 검정을 반복하다 몇 개에서 오류가 납니다. 올바른 처리는?

(a) 오류 난 유전자를 결과 표에서 조용히 지운다 (b) `tryCatch`로 잡아 `NA`를 넣고, 실패한 유전자 수와 이유를 기록·보고한다 (c) `options(warn = -1)`로 메시지를 끈다 (d) 전체 분석을 포기한다

<details><summary>정답 보기</summary>

(b). 분석은 계속하되 실패를 숨기지 않아야 합니다. 몇 개가 왜 빠졌는지가 결과 해석(예: 발현이 너무 낮아 검정 불가)에 필요한 정보입니다.

</details>

**5.** `make_filter <- function(k) function(x) x[x >= k]`로 만든 `f <- make_filter(10)`이 `k = 10`을 기억하는 이유를 한 문장으로 쓰세요. (단답)

<details><summary>정답 보기</summary>

R 함수는 변수를 찾을 때 자기가 **만들어진 환경**을 보기 때문입니다(어휘적 범위). `f`가 만들어진 순간의 `make_filter` 안에 `k = 10`이 있었으므로 `f`는 그 값을 계속 참조합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/advanced/A/A4_functions.R`에 예시 1–4와 실습 2–6을 적고 실행했다.
- [ ] 함수를 인자로 받는 `row_z()`를 만들고 mean/sd와 median/mad 두 방식으로 호출했다.
- [ ] 실패를 `NA`로 기록하고 개수를 보고하는 반복 검정 코드를 갖고 있다.
- [ ] `traceback()`과 `browser()`를 각각 한 번 이상 써 보았다.

---
[← 이전](day-A3.md) · [코스 지도](../../../README.md) · [다음 →](day-A5.md)
