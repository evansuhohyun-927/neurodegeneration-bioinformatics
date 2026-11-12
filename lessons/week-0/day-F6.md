# Day F6 — 파일 읽기와 pandas 첫걸음

> **주차:** 0주차 · **예상 시간:** 75–90분 · **산출물:** `notebooks/week-0/F6_pandas_first.ipynb`, `toy_expression.csv`

## 오늘의 목표
- CSV 파일이 "쉼표로 구분된 글자"라는 것을 직접 열어 확인할 수 있다.
- pandas로 작은 표를 만들어 CSV로 저장하고 다시 읽어 올 수 있다.
- `head()`, `shape`, `columns`와 열 선택으로 표의 구조를 살펴볼 수 있다.

## 🎬 영상으로 먼저 보기

- [How do I read a tabular data file into pandas? — Data School](https://www.youtube.com/watch?v=5_QXMwezPJE) (8:54)
- **무엇에 주목할까:** 파일 하나를 읽어 표로 만드는 데 코드 한 줄이면 된다는 점을 보세요. 구분자(쉼표인지 탭인지)와 첫 줄이 열 이름으로 쓰인다는 점에 주목하면 됩니다.

- [Python Pandas Tutorial (Part 1): Getting Started with Data Analysis - Installation and Loading Data — Corey Schafer](https://www.youtube.com/watch?v=ZyhVh-qRZPA) (23:01)
- **무엇에 주목할까:** 큰 데이터를 읽은 직후 `shape`와 `head()`로 "몇 행 몇 열인지, 앞부분이 어떻게 생겼는지"부터 확인하는 습관을 보세요. 영상의 설치 부분은 F1에서 이미 했으니 건너뛰어도 됩니다.

## 개념 설명

### 파일과 CSV: 데이터가 노트북 밖에서 사는 방식

지금까지는 데이터를 코드 안에 직접 적었습니다. 하지만 실제 발현 데이터는 수천 줄이라 코드에 적을 수 없고, 파일(file)에 따로 저장되어 있습니다. 변수는 노트북을 끄면 사라지는 "작업대 위의 시료"이고, 파일은 "냉동고에 보관한 시료"입니다. 분석은 냉동고에서 꺼내 오는 것(읽기)으로 시작해 결과를 다시 넣는 것(저장)으로 끝납니다.

표 데이터를 저장하는 가장 흔한 형식이 CSV(comma-separated values, 쉼표로 구분된 값)입니다. 이름 그대로입니다. 한 줄이 표의 한 행이고, 칸은 쉼표로 나눕니다. 보통 첫 줄에는 열 이름(header)을 적습니다.

```text
gene,flight_1,ground_1
Gfap,250.0,100.0
```

엑셀로 열면 표처럼 보이지만 실체는 그냥 글자입니다. 그래서 어떤 프로그램에서도 열 수 있고, 생명정보학 데이터가 대부분 CSV나 그 사촌인 TSV(탭으로 구분)로 배포됩니다. 파일을 읽으려면 그 파일의 **경로**를 알려 줘야 합니다. F1에서 배운 상대 경로 개념이 여기서 쓰입니다. 노트북에서 `"toy_expression.csv"`라고만 쓰면 "이 노트북이 있는 폴더 안의 그 파일"을 뜻합니다.

### pandas와 DataFrame: 코드로 다루는 엑셀 시트

pandas는 표 데이터를 다루는 라이브러리이고, 관례적으로 `import pandas as pd`로 불러옵니다. pandas의 표를 DataFrame(데이터프레임)이라고 부릅니다. 엑셀 시트 한 장이라고 생각하면 됩니다. 행(row)과 열(column)이 있고, 각 열에는 이름이 있습니다.

F3의 딕셔너리와 리스트를 떠올리면 구조가 바로 이해됩니다. DataFrame은 "열 이름을 키로, 그 열의 값 리스트를 값으로 하는 딕셔너리"로 만들 수 있습니다. 표 왼쪽에 자동으로 붙는 0, 1, 2, … 번호는 인덱스(index)로, 행에 붙은 번호표입니다. 여기서도 0부터 셉니다.

표에서 열 하나만 꺼낸 것은 Series(시리즈)라고 부릅니다. 랙에서 한 줄만 뽑아낸 것과 같습니다. Series에는 `.mean()`, `.max()` 같은 메서드가 있어서 반복문 없이도 한 번에 계산할 수 있습니다. F4에서 손으로 짰던 "합계 구해서 개수로 나누기"를 pandas가 대신 해 주는 것입니다.

엑셀과의 가장 큰 차이는 **원본을 건드리지 않는다**는 점입니다. 엑셀에서는 셀을 직접 고치다가 원본이 망가지기 쉽지만, pandas에서는 파일을 읽어 메모리에서 작업하고 결과는 다른 이름으로 저장합니다. 그리고 무엇을 했는지가 코드로 전부 남습니다.

### 데이터를 받으면 가장 먼저 할 세 가지

새 환자의 차트를 받으면 진단부터 내리지 않고 이름, 나이, 주 증상부터 확인합니다. 데이터도 마찬가지입니다. 파일을 읽은 직후에는 분석에 뛰어들지 말고 세 가지를 먼저 봅니다.

- **`df.head()`** — 앞의 다섯 행을 보여 줍니다. 열 이름이 제대로 읽혔는지, 값이 예상한 모양인지 눈으로 확인합니다.
- **`df.shape`** — `(행 수, 열 수)`를 알려 줍니다. 유전자가 6개, 열이 5개여야 하는데 다르게 나오면 읽는 과정에 문제가 있는 것입니다.
- **`df.columns`** — 열 이름 목록입니다. 열을 선택할 때 이름을 정확히 써야 하므로 꼭 확인합니다.

`shape`와 `columns` 뒤에는 괄호가 없고 `head()`에는 괄호가 있습니다. 괄호가 없는 것은 표가 가진 "정보"(속성), 괄호가 있는 것은 표에게 시키는 "동작"(메서드)이라고 생각하면 됩니다.

열을 고를 때는 딕셔너리처럼 대괄호를 씁니다. `df["gene"]`은 열 하나, `df[["gene", "flight_1"]]`은 열 여러 개입니다. 여러 개일 때 대괄호가 두 겹인 이유는, 바깥은 "선택한다"는 표시이고 안쪽은 "열 이름들의 리스트"이기 때문입니다.

## 예시로 이해하기

> 아래 표는 연습을 위해 코드로 직접 만든 **가상 데이터**입니다. 유전자 이름은 실제 마우스 유전자이지만 숫자는 임의로 지은 것이며, OSD-536 등 실제 데이터셋의 값이 아닙니다.

### 예시 1 — 표를 만들어 CSV로 저장하기

```python
import pandas as pd

data = {
    "gene": ["Gfap", "Aif1", "Tnf", "Il1b", "Sod2", "Mbp"],
    "flight_1": [250.0, 120.0, 30.0, 14.0, 80.0, 400.0],
    "flight_2": [230.0, 131.0, 26.0, 16.0, 75.0, 410.0],
    "ground_1": [100.0, 115.0, 28.0, 15.0, 160.0, 395.0],
    "ground_2": [110.0, 125.0, 29.0, 13.0, 150.0, 405.0],
}

df = pd.DataFrame(data)
print(df)

df.to_csv("toy_expression.csv", index=False)
print("저장 완료")
```

출력:

```text
   gene  flight_1  flight_2  ground_1  ground_2
0  Gfap     250.0     230.0     100.0     110.0
1  Aif1     120.0     131.0     115.0     125.0
2   Tnf      30.0      26.0      28.0      29.0
3  Il1b      14.0      16.0      15.0      13.0
4  Sod2      80.0      75.0     160.0     150.0
5   Mbp     400.0     410.0     395.0     405.0
저장 완료
```

행은 유전자, 열은 샘플입니다. 이것이 "유전자 × 샘플 발현 행렬"의 가장 작은 모형입니다. `index=False`는 왼쪽의 0–5 번호를 파일에 쓰지 말라는 뜻입니다. 실행 후 JupyterLab 왼쪽 파일 목록에 `toy_expression.csv`가 생긴 것을 확인하세요.

### 예시 2 — CSV의 맨얼굴 보기

pandas 없이, Python 기본 기능으로 파일을 글자 그대로 읽어 봅니다.

```python
with open("toy_expression.csv") as f:
    text = f.read()

print(text)
```

출력:

```text
gene,flight_1,flight_2,ground_1,ground_2
Gfap,250.0,230.0,100.0,110.0
Aif1,120.0,131.0,115.0,125.0
Tnf,30.0,26.0,28.0,29.0
Il1b,14.0,16.0,15.0,13.0
Sod2,80.0,75.0,160.0,150.0
Mbp,400.0,410.0,395.0,405.0
```

정말로 쉼표로 구분된 글자일 뿐입니다. `open()`은 파일을 열고, `with … as f:`는 "이 블록이 끝나면 파일을 자동으로 닫아라"는 뜻입니다. 냉동고 문을 열고 나서 반드시 닫는 것과 같습니다.

### 예시 3 — 다시 읽어서 구조 확인하기

```python
import pandas as pd

df = pd.read_csv("toy_expression.csv")

print(df.head(3))
print(df.shape)
print(list(df.columns))
print(df.dtypes)
```

출력:

```text
   gene  flight_1  flight_2  ground_1  ground_2
0  Gfap     250.0     230.0     100.0     110.0
1  Aif1     120.0     131.0     115.0     125.0
2   Tnf      30.0      26.0      28.0      29.0
(6, 5)
['gene', 'flight_1', 'flight_2', 'ground_1', 'ground_2']
gene         object
flight_1    float64
flight_2    float64
ground_1    float64
ground_2    float64
dtype: object
```

`head(3)`은 앞의 3행만 보여 줍니다(숫자를 안 쓰면 5행). `shape`가 `(6, 5)`이므로 6행 5열입니다. `dtypes`는 열마다의 자료형으로, `float64`는 F2의 실수, `object`는 대체로 문자열을 뜻합니다(pandas 버전에 따라 `str`로 표시될 수도 있습니다). 숫자여야 할 열이 `object`로 나온다면 그 열에 글자가 섞여 있다는 신호입니다.

### 예시 4 — 열 선택하기

```python
import pandas as pd

df = pd.read_csv("toy_expression.csv")

print(df["gene"])
print(type(df["gene"]))
print(df[["gene", "flight_1"]])
print(df["flight_1"].mean())
print(df["flight_1"].max())
```

출력:

```text
0    Gfap
1    Aif1
2     Tnf
3    Il1b
4    Sod2
5     Mbp
Name: gene, dtype: object
<class 'pandas.core.series.Series'>
   gene  flight_1
0  Gfap     250.0
1  Aif1     120.0
2   Tnf      30.0
3  Il1b      14.0
4  Sod2      80.0
5   Mbp     400.0
149.0
400.0
```

열 하나(`df["gene"]`)는 Series, 열 여러 개(`df[["gene", "flight_1"]]`)는 작은 DataFrame으로 나옵니다.

### 예시 5 — 새 열 만들고 조건으로 고르기

F5의 log2 fold change를 표 전체에 한 번에 적용합니다.

```python
import numpy as np
import pandas as pd

df = pd.read_csv("toy_expression.csv")

df["flight_mean"] = df[["flight_1", "flight_2"]].mean(axis=1)
df["ground_mean"] = df[["ground_1", "ground_2"]].mean(axis=1)
df["log2fc"] = np.log2(df["flight_mean"] / df["ground_mean"])

print(df[["gene", "flight_mean", "ground_mean", "log2fc"]].round(2))

changed = df[df["log2fc"].abs() > 0.5]
print(changed[["gene", "log2fc"]].round(2))

df.round(3).to_csv("toy_expression_with_fc.csv", index=False)
```

출력:

```text
   gene  flight_mean  ground_mean  log2fc
0  Gfap        240.0        105.0    1.19
1  Aif1        125.5        120.0    0.06
2   Tnf         28.0         28.5   -0.03
3  Il1b         15.0         14.0    0.10
4  Sod2         77.5        155.0   -1.00
5   Mbp        405.0        400.0    0.02
   gene  log2fc
0  Gfap    1.19
4  Sod2   -1.00
```

`df["새이름"] = …`으로 새 열을 만듭니다. `mean(axis=1)`은 "행 방향으로, 즉 유전자마다 옆으로 평균"이라는 뜻입니다. `df[조건]`은 조건이 참인 행만 남기는데, F4에서 반복문과 `if`로 짰던 필터링을 한 줄로 쓴 것입니다. `.abs()`는 절댓값입니다.

다시 한번 강조합니다. 이 숫자는 가상이고, 그룹당 2개 샘플의 평균 비율은 통계적 근거가 아닙니다. 작은 표본의 결과는 결론이 아니라 가설을 세우는 재료로만 씁니다.

## 직접 해보기

1. JupyterLab을 켜고 `notebooks/week-0/F6_pandas_first.ipynb`를 만듭니다. 첫 셀에 `import`를 모읍니다.

   ```python
   import numpy as np
   import pandas as pd
   ```

2. 예시 1을 실행하고, 왼쪽 파일 목록에서 `toy_expression.csv`를 더블클릭해 열어 봅니다. JupyterLab이 표 모양으로 보여 줍니다.

3. 예시 2–5를 셀 하나씩 직접 타이핑해 실행합니다.

4. **구조 확인 연습.** `df.tail(2)`(마지막 2행)와 `df.describe()`(숫자 열의 요약 통계)를 실행해 봅니다. `describe()`의 `mean` 행에서 `flight_1`의 평균이 149.0인지 확인합니다.

5. **열 선택 연습.** `ground_1` 열의 평균과 최솟값을 구합니다. 평균은 135.5, 최솟값은 15.0이 나와야 합니다.

6. **메타데이터 파일 만들기.** 발현 표만으로는 어느 열이 어느 군인지 열 이름으로 짐작할 수밖에 없습니다. 샘플 정보를 담은 표, 즉 메타데이터(metadata)를 따로 만듭니다.

   ```python
   with open("toy_metadata.csv", "w") as f:
       f.write("sample,condition\n")
       f.write("flight_1,flight\n")
       f.write("flight_2,flight\n")
       f.write("ground_1,ground\n")
       f.write("ground_2,ground\n")

   meta = pd.read_csv("toy_metadata.csv")
   print(meta)
   print(meta.shape)
   print(meta["condition"].value_counts())
   ```

   출력:

   ```text
        sample condition
   0  flight_1    flight
   1  flight_2    flight
   2  ground_1    ground
   3  ground_2    ground
   (4, 2)
   condition
   flight    2
   ground    2
   Name: count, dtype: int64
   ```

   `open(…, "w")`의 `"w"`는 쓰기(write) 모드이고 `\n`은 줄바꿈입니다. `value_counts()`는 값별 개수를 세어 줍니다. F4에서 반복문으로 짰던 "조건별 샘플 수 세기"가 한 줄이 됐습니다. 발현 표의 열 이름과 메타데이터의 `sample` 값이 정확히 일치한다는 점도 눈여겨보세요. 3주차에 실제 데이터에서 이 일치 여부를 점검합니다.

7. **일부러 오류 내 보기.** 파일 이름에 오타를 내 봅니다.

   ```python
   df = pd.read_csv("toy_expresion.csv")
   ```

   긴 오류 메시지가 쏟아지지만, **맨 마지막 줄만** 읽으면 됩니다.

   ```text
   FileNotFoundError: [Errno 2] No such file or directory: 'toy_expresion.csv'
   ```

   "그런 파일 없음"입니다. 이름을 고쳐 다시 실행합니다. 긴 오류 메시지를 읽는 법은 내일 자세히 배웁니다.

8. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — `FileNotFoundError`.** 원인은 둘 중 하나입니다. 파일 이름 오타이거나, 파일이 노트북과 다른 폴더에 있는 것입니다. 왼쪽 파일 목록에서 노트북과 CSV가 같은 폴더(`notebooks/week-0/`)에 있는지 확인하세요.

⚠️ **흔한 오류 2 — `KeyError: 'Gene'`.** 열 이름은 대소문자와 띄어쓰기까지 정확해야 합니다. `df["Gene"]`은 `gene` 열을 찾지 못합니다. `print(list(df.columns))`로 실제 열 이름을 확인하고 그대로 복사해 쓰세요.

## 퀴즈

**1.** CSV 파일에서 열(칸)을 구분하는 문자는?

(a) 탭 (b) 쉼표 (c) 세미콜론 (d) 띄어쓰기

<details><summary>정답 보기</summary>

(b) 쉼표. CSV는 comma-separated values의 줄임말입니다. 탭으로 구분한 파일은 TSV라고 부르며, `pd.read_csv("파일", sep="\t")`로 읽을 수 있습니다.

</details>

**2.** `df.shape`가 `(20000, 12)`입니다. 행이 유전자, 열이 샘플이라면 유전자와 샘플은 각각 몇 개인가요? (단답)

<details><summary>정답 보기</summary>

유전자 20,000개, 샘플 12개. `shape`는 (행 수, 열 수) 순서입니다. 다만 유전자 이름이 들어 있는 열이 하나 포함되어 있다면 실제 샘플 열은 11개이므로 `head()`로 함께 확인해야 합니다.

</details>

**3.** 데이터를 읽은 직후 가장 먼저 할 일로 알맞지 **않은** 것은?

(a) `df.head()`로 앞부분 보기 (b) `df.shape`로 크기 확인 (c) `df.columns`로 열 이름 확인 (d) 바로 통계 검정을 돌려 p-value 구하기

<details><summary>정답 보기</summary>

(d). 표가 제대로 읽혔는지, 무엇이 행이고 열인지 확인하기 전에 분석부터 하면 잘못 읽힌 데이터로 그럴듯한 숫자를 얻을 위험이 있습니다. 구조 확인이 항상 먼저입니다.

</details>

**4.** `df["gene"]`과 `df[["gene", "flight_1"]]`의 결과는 각각 어떤 종류인가요? (단답)

<details><summary>정답 보기</summary>

앞의 것은 Series(열 하나), 뒤의 것은 DataFrame(열 두 개짜리 작은 표)입니다. 열을 여러 개 고를 때는 열 이름의 리스트를 넣어야 하므로 대괄호가 두 겹이 됩니다.

</details>

**5.** `df.to_csv("out.csv", index=False)`에서 `index=False`를 쓰는 이유는?

(a) 파일을 더 빨리 저장하려고 (b) 왼쪽의 행 번호(0, 1, 2…)가 불필요한 열로 저장되지 않게 하려고 (c) 열 이름을 저장하지 않으려고 (d) 숫자를 반올림하려고

<details><summary>정답 보기</summary>

(b). 이 옵션이 없으면 행 번호가 이름 없는 첫 열로 저장되어, 다시 읽었을 때 `Unnamed: 0`이라는 쓸모없는 열이 생깁니다.

</details>

## 더 알아보기

> **📚 폴더 안 파일 여러 개를 한 번에**
> 실제 데이터는 샘플마다 파일 하나씩 오는 경우가 많습니다. `pathlib.Path("data").glob("*.csv")`로 파일 목록을 얻어 하나씩 읽고, 파일 이름에서 샘플 ID를 떼어 열로 붙인 뒤 `pd.concat`으로 합칩니다. 목록을 `sorted()`로 정렬해 두면 실행할 때마다 순서가 같고, 읽은 파일 수를 출력하면 빠진 파일이 없는지 확인할 수 있습니다.

## 오늘의 산출물 체크리스트
- [ ] `notebooks/week-0/`에 `toy_expression.csv`, `toy_expression_with_fc.csv`, `toy_metadata.csv`가 있다.
- [ ] `F6_pandas_first.ipynb`에서 `head`, `shape`, `columns`를 실행했다.
- [ ] 열 하나 선택과 여러 열 선택을 모두 해 봤다.
- [ ] `FileNotFoundError`를 일부러 내 보고 고쳤다.

---
[← 이전](day-F5.md) · [코스 지도](../../README.md) · [다음 →](day-F7.md)
