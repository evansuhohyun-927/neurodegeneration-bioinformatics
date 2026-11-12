# Day A3 — factor, list, matrix, data.frame: 실험 정보를 담는 그릇

> **주차:** 심화 파트 A — R과 Bioconductor · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/A/A3_structures.R`
>
> **먼저 끝내 둘 레슨:** Day A2. 비교 대상: [Day F6 — 파일 읽기와 pandas 첫걸음](../../week-0/day-F6.md), [Day 16 — 샘플과 유전자 행렬 연결](../../week-3/day-16.md).

## 오늘의 목표
- factor의 수준(level)과 기준 수준을 정하고, factor를 숫자로 바꿀 때의 함정을 피할 수 있다.
- list의 `[`, `[[`, `$`가 각각 무엇을 돌려주는지 구분할 수 있다.
- count matrix와 샘플 data.frame을 **이름으로** 맞추고, CSV와 RDS로 저장·불러오기를 할 수 있다.

## 🎬 영상으로 먼저 보기

- [Factors in R: Levels and Labels — McMaster DASH](https://www.youtube.com/watch?v=XwyhJIxy4Dk) (8:33)
- **무엇에 주목할까:** factor가 겉으로는 글자처럼 보여도 속은 정수 코드와 수준 목록이라는 점, 그리고 수준의 순서를 직접 정하는 방법을 보세요. 오늘 예시 1의 "숫자 factor 함정"이 바로 이 구조에서 나옵니다.

- [Data Frames and Lists in R: The Basics — R LABS](https://www.youtube.com/watch?v=zCI56FeNTLo) (10:07)
- **무엇에 주목할까:** data.frame이 "길이가 같은 벡터들을 묶은 list"라는 관점을 잡으세요. 열 하나를 꺼낼 때 `$`와 `[[ ]]`와 `[ ]`가 어떻게 다른지가 핵심입니다.

## 개념 설명

### factor: 범주에 순서와 기준을 정해 둔 벡터

대조군/처리군, 성별, 배치처럼 정해진 몇 가지 값 중 하나를 갖는 변수를 **범주형 변수**라고 합니다. R은 이것을 **factor**로 다룹니다. factor는 속으로는 정수 코드(1, 2, ...)를 갖고, 각 코드가 무엇인지 적힌 **수준(levels)** 목록을 함께 들고 다닙니다. 시약장에 "1번 칸 = ctrl, 2번 칸 = treat"라고 라벨을 붙여 둔 것과 같습니다.

factor가 중요한 이유는 통계 모델이 **첫 번째 수준을 기준(reference)** 으로 삼기 때문입니다. 수준을 따로 정하지 않으면 알파벳순이 되어, `"ctrl"`과 `"treat"`는 우연히 맞지만 `"WT"`와 `"KO"`라면 KO가 기준이 됩니다. 그러면 fold change의 부호가 통째로 뒤집힙니다. 3주차 Day 18에서 "contrast 방향을 확인하라"고 한 것이 R에서는 `factor(..., levels = c("ctrl", "treat"))` 한 줄로 해결됩니다.

함정이 하나 있습니다. 용량 `"5"`, `"10"`, `"20"`이 factor로 들어 있을 때 `as.numeric()`을 하면 값이 아니라 **정수 코드**가 나옵니다. 값을 원하면 `as.numeric(as.character(f))`처럼 문자로 바꾼 뒤 숫자로 바꿉니다. 또 일부만 골라내도 수준 목록은 그대로 남으니, 빈 수준을 지우려면 `droplevels()`를 씁니다.

### list: 무엇이든 넣는 실험 노트 바인더

원자 벡터는 한 종류만 담지만, **list**는 종류가 다른 것들을 한데 묶습니다. 문자 벡터, 숫자, 다른 list, 표까지 무엇이든 칸마다 넣을 수 있어 실험 노트 바인더와 비슷합니다. 분석 함수의 결과(예: `t.test()`의 결과)도 대부분 list입니다.

list에서 꺼내는 방법은 세 가지이고, 돌려주는 것이 다릅니다.

- `run["genes"]` — **바인더에서 칸을 떼어 낸 작은 바인더**. 결과가 여전히 list입니다.
- `run[["genes"]]` — **칸 안의 내용물**. 결과가 그 칸에 들어 있던 벡터입니다.
- `run$genes` — `[[ ]]`의 줄임말. 이름으로만 씁니다.

이 차이는 Python에서 `d["genes"]`(내용물)와 `{k: d[k] for k in ["genes"]}`(작은 딕셔너리)의 차이와 같습니다. 구조가 헷갈리면 `str()`로 들여다봅니다. `str()`은 R에서 가장 자주 쓰게 될 함수 중 하나입니다.

### matrix와 data.frame

**matrix**는 한 종류의 값만 담는 2차원 표입니다. 실제로는 원자 벡터에 `dim`(행 수, 열 수)이라는 **속성(attribute)** 을 붙인 것입니다. 값을 채울 때 기본이 **열 방향**이라는 점이 numpy(행 방향)와 다릅니다. 유전자 × 샘플 count 표처럼 모든 칸이 숫자인 데이터에 알맞고, 행과 열에 이름(`dimnames`)을 붙일 수 있습니다.

**data.frame**은 열마다 종류가 달라도 되는 표입니다. 속은 "길이가 같은 벡터들의 list"이고, pandas DataFrame과 거의 같은 역할입니다. 샘플 정보표(샘플 ID는 문자, 군은 factor, 나이는 숫자)가 전형적인 예입니다. 열은 `df$group`, 행·열 동시 선택은 `df[행, 열]`로 하며, 행 자리에 논리 조건을 넣으면 pandas의 boolean indexing과 같습니다.

발현 분석의 기본 짝은 **count matrix(유전자 × 샘플)** 와 **샘플 data.frame(샘플 × 정보)** 입니다. 둘을 연결하는 규칙은 Day 16에서 배운 그대로입니다: **순서가 아니라 이름으로 맞추고, 맞췄는지 코드로 확인합니다.** R에서는 `match()`로 짝을 찾고 `stopifnot(identical(...))`로 확인합니다. Day A6의 Bioconductor 자료 구조는 이 짝 맞추기를 객체가 대신 지켜 주도록 만든 것입니다.

### 파일로 저장하고 다시 읽기

표는 `read.csv()`/`write.csv()`로 읽고 씁니다. 탭 구분 파일은 `read.delim()`, 더 일반적으로는 `read.table()`입니다. R 4.0부터는 문자 열이 자동으로 factor가 되지 않으므로(`stringsAsFactors = FALSE`가 기본), factor가 필요하면 읽은 뒤 직접 지정합니다.

CSV는 어느 프로그램에서나 열리는 대신, factor의 수준 순서 같은 R 고유의 정보는 잃습니다. R 객체를 그대로 보존하려면 `saveRDS()`/`readRDS()`를 씁니다. Python의 pickle에 해당하며, 객체 하나를 파일 하나로 저장합니다. 원칙은 이렇습니다: **다른 사람과 나눌 원자료와 최종 표는 CSV**, R 안에서 중간 결과를 다시 쓸 때는 **RDS**.

## 예시로 이해하기

> 모든 값은 연습용 **가상 값**입니다.

### 예시 1 — factor의 수준과 숫자 함정

```r
group <- factor(c("treat", "ctrl", "ctrl", "treat", "ctrl"))
levels(group)                         # 알파벳순: ctrl이 기준
relevel(group, ref = "treat")
table(group)
as.integer(group)                     # 속은 정수 코드
dose <- factor(c("10", "5", "20", "5"))
as.numeric(dose)                      # 함정: 코드 번호가 나온다
as.numeric(as.character(dose))        # 의도한 값
sub <- group[group == "ctrl"]
levels(sub)
levels(droplevels(sub))
```

출력:

```text
[1] "ctrl"  "treat"
[1] treat ctrl  ctrl  treat ctrl 
Levels: treat ctrl
group
 ctrl treat 
    3     2 
[1] 2 1 1 2 1
[1] 1 3 2 3
[1] 10  5 20  5
[1] "ctrl"  "treat"
[1] "ctrl"
```

`dose`의 수준은 문자 정렬 순서라 `"10" < "20" < "5"`입니다. 그래서 `as.numeric(dose)`는 `10, 5, 20, 5`가 아니라 수준 번호 `1, 3, 2, 3`을 돌려줍니다. 오류도 경고도 없으니 특히 위험합니다. ctrl만 골라낸 `sub`에도 `treat` 수준이 남아 있다가 `droplevels()`로 사라지는 것도 확인하세요. 빈 수준이 남아 있으면 표나 그림에 개수 0인 군이 나타납니다.

### 예시 2 — list에서 꺼내는 세 가지 방법

```r
run <- list(study = "가상연구-01", n_samples = 6L,
            genes = c("Gfap", "Aif1"), qc = list(pass = TRUE, flagged = "S4"))
str(run)
run["genes"]          # 리스트 한 칸짜리 리스트
run[["genes"]]        # 칸 안의 내용물
run$qc$flagged
length(run)
names(run)
```

출력:

```text
List of 4
 $ study    : chr "가상연구-01"
 $ n_samples: int 6
 $ genes    : chr [1:2] "Gfap" "Aif1"
 $ qc       :List of 2
  ..$ pass   : logi TRUE
  ..$ flagged: chr "S4"
$genes
[1] "Gfap" "Aif1"

[1] "Gfap" "Aif1"
[1] "S4"
[1] 4
[1] "study"     "n_samples" "genes"     "qc"       
```

`run["genes"]`는 출력 위에 `$genes`라는 이름표가 붙어 있습니다. 아직 list라는 표시입니다. `run[["genes"]]`는 이름표 없이 문자 벡터만 나옵니다. `$`는 겹쳐 쓸 수 있어 `run$qc$flagged`로 바인더 속 바인더의 칸까지 내려갑니다.

### 예시 3 — count matrix와 샘플 표를 이름으로 맞추기

```r
set.seed(7)
counts <- matrix(rpois(12, lambda = 200), nrow = 3,
                 dimnames = list(c("Gfap", "Aif1", "Cd68"), c("S3", "S1", "S4", "S2")))
counts
meta <- data.frame(sample = c("S1", "S2", "S3", "S4"),
                   group  = factor(c("ctrl", "ctrl", "treat", "treat"), levels = c("ctrl", "treat")),
                   batch  = c("b1", "b2", "b1", "b2"))
str(meta)
identical(colnames(counts), meta$sample)          # 순서가 다르다
idx <- match(meta$sample, colnames(counts))       # 이름으로 짝 찾기
counts <- counts[, idx]
stopifnot(identical(colnames(counts), meta$sample))
counts
meta[meta$group == "treat", ]
```

출력:

```text
      S3  S1  S4  S2
Gfap 232 227 198 205
Aif1 183 198 202 238
Cd68 211 189 230 232
'data.frame':	4 obs. of  3 variables:
 $ sample: chr  "S1" "S2" "S3" "S4"
 $ group : Factor w/ 2 levels "ctrl","treat": 1 1 2 2
 $ batch : chr  "b1" "b2" "b1" "b2"
[1] FALSE
      S1  S2  S3  S4
Gfap 227 205 232 198
Aif1 198 238 183 202
Cd68 189 232 211 230
  sample group batch
3     S3 treat    b1
4     S4 treat    b2
```

장비가 내보낸 열 순서(S3, S1, S4, S2)와 샘플 표의 순서가 다릅니다. 순서대로 붙였다면 S3의 값이 S1의 라벨(ctrl)을 달고 분석되었을 것입니다. `match(meta$sample, colnames(counts))`는 "샘플 표의 각 샘플이 count 표의 몇 번째 열에 있나"를 알려 주고, 그 순서로 열을 다시 꽂습니다. `stopifnot()`은 맞지 않으면 그 자리에서 멈춥니다.

### 예시 4 — CSV와 RDS의 차이

```r
meta <- data.frame(sample = c("S1", "S2"), group = c("ctrl", "treat"))
path_csv <- file.path(tempdir(), "meta.csv")
write.csv(meta, path_csv, row.names = FALSE)
readLines(path_csv)
back <- read.csv(path_csv)
str(back)
path_rds <- file.path(tempdir(), "meta.rds")
meta$group <- factor(meta$group, levels = c("ctrl", "treat"))
saveRDS(meta, path_rds)
str(readRDS(path_rds))             # factor와 수준 순서가 그대로 남는다
str(read.csv(path_csv))            # CSV를 다시 읽으면 글자로 돌아온다
```

출력:

```text
[1] "\"sample\",\"group\"" "\"S1\",\"ctrl\""      "\"S2\",\"treat\""    
'data.frame':	2 obs. of  2 variables:
 $ sample: chr  "S1" "S2"
 $ group : chr  "ctrl" "treat"
'data.frame':	2 obs. of  2 variables:
 $ sample: chr  "S1" "S2"
 $ group : Factor w/ 2 levels "ctrl","treat": 1 2
'data.frame':	2 obs. of  2 variables:
 $ sample: chr  "S1" "S2"
 $ group : chr  "ctrl" "treat"
```

`tempdir()`은 R 세션마다 생기는 임시 폴더라 연습용 파일이 저장소를 어지럽히지 않습니다. `readLines()`로 CSV의 실제 글자를 들여다보면 따옴표로 감싼 평범한 텍스트입니다. RDS로 저장한 쪽만 factor가 살아 있습니다. `write.csv()`의 `row.names = FALSE`를 빼면 1, 2 같은 행 번호가 이름 없는 첫 열로 들어가니 기억해 두세요.

## 직접 해보기

1. `notebooks/advanced/A/A3_structures.R`을 만들고 예시 1–4를 실행합니다.
2. **기준 수준 바꾸기.** `genotype <- factor(c("WT", "KO", "KO", "WT"))`의 수준을 확인하고, WT가 기준이 되도록 고칩니다. 왜 이것이 fold change의 부호와 관계있는지 주석으로 적습니다.
3. **결과 list 들여다보기.** `tt <- t.test(c(5.1, 5.4, 4.9), c(6.8, 7.0, 7.3))`를 실행하고 `str(tt)`로 구조를 본 뒤, `tt$p.value`와 `tt[["conf.int"]]`를 꺼냅니다. Python에서 `scipy.stats.ttest_ind`가 돌려주던 것과 비교해 봅니다.
4. **이름 맞추기 실패 실험.** 예시 3에서 `meta`의 한 샘플 ID를 `"S5"`로 바꾸고 다시 실행합니다. `match()`가 무엇을 돌려주고 `stopifnot()`이 어디서 멈추는지 확인한 뒤 원래대로 돌립니다.
5. **행렬의 열 방향 채우기.** `matrix(1:6, nrow = 2)`와 `matrix(1:6, nrow = 2, byrow = TRUE)`를 비교하고, numpy의 `np.arange(1, 7).reshape(2, 3)`과 같은 것은 어느 쪽인지 적습니다.
6. 예시 3의 정렬된 `counts`와 `meta`를 `saveRDS(list(counts = counts, meta = meta), "data/advanced_A3_demo.rds")`처럼 한 파일로 묶어 저장해 봅니다. (`data/` 폴더의 파일은 저장소에 올리지 않는다는 본 과정 규칙을 그대로 따릅니다.)

⚠️ **흔한 오류 1 — `$ operator is invalid for atomic vectors`.** list나 data.frame이 아닌 일반 벡터에 `$`를 썼습니다. 이름 붙은 벡터에서 꺼낼 때는 `x["Gfap"]` 또는 `x[["Gfap"]]`를 씁니다.

⚠️ **흔한 오류 2 — `df[df$group == "treat"]`처럼 쉼표를 빠뜨린다.** data.frame에서 행을 고르려면 `df[조건, ]`처럼 쉼표 뒤를 비워 "모든 열"이라고 알려야 합니다. 쉼표가 없으면 R은 조건을 열 선택으로 해석합니다.

## 퀴즈

**1.** `f <- factor(c("high", "low", "mid"))`의 기본 수준 순서는?

(a) high, low, mid (b) low, mid, high (c) 입력 순서 그대로 (d) 정해지지 않는다

<details><summary>정답 보기</summary>

(a). 수준을 지정하지 않으면 알파벳순입니다. 의미 있는 순서(low < mid < high)가 필요하면 `factor(x, levels = c("low", "mid", "high"))`로 직접 정합니다.

</details>

**2.** factor `d`에 용량 `"5"`, `"10"`, `"20"`이 들어 있습니다. 실제 숫자 값을 얻는 올바른 식은? (단답)

<details><summary>정답 보기</summary>

`as.numeric(as.character(d))`입니다. `as.numeric(d)`는 속에 있는 정수 코드(수준 번호)를 돌려주므로 값이 엉뚱해집니다.

</details>

**3.** `x <- list(a = 1:3, b = "z")`에서 `class(x["a"])`와 `class(x[["a"]])`는 각각?

(a) list, integer (b) integer, list (c) list, list (d) integer, integer

<details><summary>정답 보기</summary>

(a). `[ ]`는 칸을 떼어 낸 작은 list를, `[[ ]]`는 칸 안의 내용물(정수 벡터)을 돌려줍니다.

</details>

**4.** count matrix의 열 이름과 샘플 표의 샘플 ID가 같은 집합이지만 순서가 다릅니다. 가장 안전한 처리는?

(a) 그냥 순서대로 붙인다 (b) 둘 다 알파벳순으로 정렬한 뒤 붙인다 (c) `match()`로 이름 기준 재배열 후 `identical()`로 확인한다 (d) 샘플 표를 손으로 고친다

<details><summary>정답 보기</summary>

(c). 이름으로 짝을 찾고, 맞았는지 코드로 확인해야 다음에 데이터가 바뀌어도 같은 안전장치가 작동합니다. (b)도 결과가 맞을 수 있지만 확인 단계가 없으면 ID 하나가 다를 때 조용히 어긋납니다.

</details>

**5.** factor의 수준 순서까지 보존해 R 객체를 저장하려면 무엇을 쓰나요? 그리고 다른 연구자에게 최종 결과 표를 보낼 때는? (단답)

<details><summary>정답 보기</summary>

R 안에서 다시 쓸 객체는 `saveRDS()`/`readRDS()`, 다른 사람에게 보낼 표는 `write.csv()`입니다. RDS는 R 고유 정보를 보존하지만 R에서만 열리고, CSV는 어디서나 열리지만 factor 수준 같은 정보는 잃습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/advanced/A/A3_structures.R`에 예시 1–4와 실습 2–6을 적고 실행했다.
- [ ] 기준 수준을 직접 지정한 factor를 하나 이상 만들었다.
- [ ] `match()` + `stopifnot(identical(...))`로 행렬과 샘플 표를 맞추는 코드를 갖고 있다.
- [ ] CSV와 RDS의 쓰임새 차이를 주석으로 정리했다.

---
[← 이전](day-A2.md) · [코스 지도](../../../README.md) · [다음 →](day-A4.md)
