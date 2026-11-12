# Day 4 — tidy data와 메타데이터: pandas로 표 건강검진하기

> **주차:** 1주차 · **예상 시간:** 75–90분 · **산출물:** `notebooks/01_setup_and_metadata.ipynb` (데이터 QC 코드)

## 오늘의 목표
- tidy data의 세 가지 규칙과 메타데이터의 역할을 설명할 수 있다.
- `pandas`로 CSV를 읽고 열 유형, 결측치, 중복 ID를 점검할 수 있다.
- 점검 절차를 `qc_report()` 함수 하나로 묶어 다른 표에도 재사용할 수 있다.

## 🎬 영상으로 먼저 보기

- [How do I handle missing values in pandas? — Data School](https://www.youtube.com/watch?v=fCMrO_VzeL8) (14분 27초)
- **무엇에 주목할까:** `isna()`(영상에서는 `isnull()`)와 `.sum()`을 이어 붙여 "열마다 빈칸이 몇 개인가"를 세는 장면을 보세요. 그리고 진행자가 빈칸을 **지우기 전에 먼저 센다**는 순서에 주목하세요. 오늘은 세는 데까지만 합니다.

- [How do I find and remove duplicate rows in pandas? — Data School](https://www.youtube.com/watch?v=ht5buXUMqkQ) (9분 48초)
- **무엇에 주목할까:** `duplicated()`가 "두 번째로 나온 것부터" `True`로 표시한다는 점, 그리고 **행 전체**가 같은 경우와 **특정 열(ID)만** 같은 경우를 구분하는 방법을 보세요.

## 개념 설명

### tidy data: 한 행에 한 번의 관찰

tidy data(정돈된 데이터)에는 세 가지 규칙이 있습니다.

1. **열 하나 = 변수 하나** (나이, 군, 발현량)
2. **행 하나 = 관찰 하나** (한 샘플의 한 번 측정)
3. **칸 하나 = 값 하나** ("67세/여"처럼 두 값을 한 칸에 넣지 않는다)

실험실의 샘플 튜브 랙을 떠올려 보세요. 튜브마다 라벨 형식이 같고, 한 튜브에 한 샘플만 들어 있으면 누가 와도 바로 작업할 수 있습니다. 어떤 튜브는 뚜껑에, 어떤 튜브는 옆면에 라벨이 있고, 한 튜브에 두 샘플이 섞여 있다면 실험 전에 정리부터 해야 하지요. tidy data는 "라벨 규칙이 통일된 랙"입니다.

사람이 보기 편한 표와 컴퓨터가 다루기 편한 표는 다릅니다. 유전자마다 열이 하나씩 있는 **넓은(wide)** 표는 눈으로 보기 좋지만, "군별·유전자별 평균"을 구하려면 열마다 따로 계산해야 합니다. 한 행이 "한 샘플의 한 유전자 측정값"인 **긴(long)** 표로 바꾸면 같은 계산이 한 줄로 끝납니다. 예시 1에서 직접 확인합니다.

### 메타데이터: 숫자에 붙은 라벨

메타데이터(metadata)는 "데이터에 대한 데이터"입니다. 발현 행렬이 숫자로 가득 찬 검사 결과지라면, 메타데이터는 그 결과지 위쪽에 적힌 **환자 이름, 채취 날짜, 검체 종류**입니다.

검사 결과지에서 환자 이름이 지워졌다고 생각해 보세요. 숫자는 그대로지만 쓸 수 없는 종이가 됩니다. 발현 행렬도 마찬가지입니다. "S3 샘플의 *Gfap* = 13.5"라는 숫자는 S3이 비행군인지 대조군인지, 어느 조직인지, 어느 날 처리했는지 알아야 의미가 생깁니다. 그 정보가 메타데이터에 있습니다.

그래서 분석은 항상 두 개의 표를 다룹니다. **측정값 표**와 **메타데이터 표**, 그리고 둘을 잇는 **ID 열**입니다. ID가 한쪽에만 있거나, 한 ID가 두 번 나오면 두 표를 이을 때 조용히 틀린 결과가 만들어집니다. 오류 메시지 없이 틀리기 때문에 더 위험합니다.

### QC는 분석 전 건강검진이다

QC(quality control, 품질 점검)는 수술 전 검사와 같습니다. 수술(분석)을 잘하는 것보다 먼저, 수술해도 되는 상태인지 확인합니다. 표를 받으면 네 가지를 봅니다.

- **크기:** 행과 열이 기대한 개수인가? (`df.shape`)
- **열 유형:** 숫자여야 할 열이 숫자로 읽혔는가? (`df.dtypes`)
- **결측치:** 어느 열에 빈칸이 몇 개인가? (`df.isna().sum()`)
- **중복:** 같은 ID가 두 번 나오는가? (`df.duplicated()`)

여기에 하나를 더합니다. **범주 값의 표기:** `"PD"`, `"pd"`, `"PD "`(뒤에 공백)는 사람 눈에는 같지만 컴퓨터에게는 세 개의 다른 군입니다. `value_counts()`로 확인합니다.

### `object`라는 경고등

pandas는 CSV를 읽을 때 열마다 유형(dtype)을 추측합니다. 전부 숫자면 `int64`나 `float64`, 글자가 하나라도 섞이면 `object`(글자)로 읽습니다.

여기에 좋은 단서가 숨어 있습니다. **나이 열이 `object`로 읽혔다면, 그 열 어딘가에 숫자가 아닌 것이 들어 있다는 뜻**입니다. 누군가 빈칸 대신 `unknown`, `N/A`, `-`를 적어 넣은 경우가 흔합니다. 혈액검사 결과 칸에 숫자 대신 "용혈됨"이라고 적혀 있는 것과 같습니다. 그 칸은 숫자가 아니라 결측으로 처리해야 합니다.

## 예시로 이해하기

아래 숫자는 모두 **가상 데이터**입니다.

### 예시 1 — 넓은 표를 tidy한 긴 표로 바꾸기

```python
import pandas as pd

# 넓은(wide) 표: 유전자마다 열이 하나씩 — 사람이 보기엔 편하다 (가상 데이터)
wide = pd.DataFrame({
    "sample_id": ["S1", "S2", "S3", "S4"],
    "group":     ["control", "control", "flight", "flight"],
    "Gfap":      [9.8, 10.4, 13.5, 14.1],
    "Sod2":      [8.1, 7.9, 8.6, 8.2],
})
print(wide)

# 긴(long, tidy) 표: 한 행 = 한 번의 측정
tidy = wide.melt(id_vars=["sample_id", "group"], var_name="gene", value_name="expression")
print(tidy)

# tidy 형태면 "군 × 유전자" 요약이 한 줄이다
print(tidy.groupby(["gene", "group"])["expression"].mean())
```

출력:

```text
  sample_id    group  Gfap  Sod2
0        S1  control   9.8   8.1
1        S2  control  10.4   7.9
2        S3   flight  13.5   8.6
3        S4   flight  14.1   8.2
  sample_id    group  gene  expression
0        S1  control  Gfap         9.8
1        S2  control  Gfap        10.4
2        S3   flight  Gfap        13.5
3        S4   flight  Gfap        14.1
4        S1  control  Sod2         8.1
5        S2  control  Sod2         7.9
6        S3   flight  Sod2         8.6
7        S4   flight  Sod2         8.2
gene  group  
Gfap  control    10.1
      flight     13.8
Sod2  control     8.0
      flight      8.4
Name: expression, dtype: float64
```

`melt`는 "녹인다"는 뜻입니다. 옆으로 늘어선 유전자 열들을 녹여 아래로 흘려보낸다고 생각하세요. 4행 × 유전자 2개가 8행이 되었습니다. 어제 Day 3에서 함수와 반복문으로 한참 걸려 구한 군 평균이 `groupby` 한 줄로 나옵니다.

### 예시 2 — 문제가 숨어 있는 CSV 점검하기

일부러 문제 다섯 가지를 심어 둔 임상 표를 만들고 읽어 봅니다. 실행하기 전에 `csv_text`를 눈으로 보고 문제를 몇 개 찾을 수 있는지 먼저 세어 보세요.

```python
import pandas as pd

# 일부러 문제를 심어 둔 가상 임상 표를 CSV 파일로 만든다
csv_text = """participant_id,group,age,sex,tremor_score
P001,PD,67,F,2.1
P002,Control,64,M,0.3
P003,PD,unknown,M,3.4
P004,control,59,F,
P005,PD,71,F,2.8
P003,PD,unknown,M,3.4
P006,PD ,58,M,1.9
"""
with open("../data/toy_clinical.csv", "w") as f:
    f.write(csv_text)

df = pd.read_csv("../data/toy_clinical.csv")

print("크기(행, 열):", df.shape)
print()
print(df.dtypes)
print()
print("열별 결측 개수:")
print(df.isna().sum())
print()
print("중복된 ID:", df.loc[df["participant_id"].duplicated(), "participant_id"].tolist())
print()
print(df["group"].value_counts())
```

출력:

```text
크기(행, 열): (7, 5)

participant_id     object
group              object
age                object
sex                object
tremor_score      float64
dtype: object

열별 결측 개수:
participant_id    0
group             0
age               0
sex               0
tremor_score      1
dtype: int64

중복된 ID: ['P003']

group
PD         4
Control    1
control    1
PD         1
Name: count, dtype: int64
```

찾아낸 문제를 정리하면:

| 단서 | 진단 |
|---|---|
| `age`가 `object` | 숫자가 아닌 값(`unknown`)이 섞여 있다 |
| `age`의 결측이 0개 | `unknown`은 글자라서 결측으로 **세어지지 않았다** (숨은 결측) |
| `tremor_score` 결측 1개 | P004의 점수가 비어 있다 |
| 중복 ID `P003` | 같은 사람이 두 번 들어갔다 |
| `group`이 4종류 | `Control`/`control`, `PD`/`PD `(공백)가 다른 군으로 세어졌다 |

참가자는 6명인데 표는 7행이고, 군은 2개인데 4개로 세어집니다. 이 상태로 "군별 평균"을 구하면 오류 메시지 하나 없이 틀린 답이 나옵니다.

### 예시 3 — 고치고, 다시 검진하기

```python
import pandas as pd

df = pd.read_csv("../data/toy_clinical.csv")

# 1) 완전히 똑같은 행은 한 번만 남긴다
df = df.drop_duplicates()

# 2) 군 이름 표기를 통일한다: 앞뒤 공백 제거 + 대소문자 통일
df["group"] = df["group"].str.strip().replace({"control": "Control"})

# 3) age를 숫자로 바꾼다. 숫자가 아닌 값("unknown")은 결측(NaN)이 된다
df["age"] = pd.to_numeric(df["age"], errors="coerce")

print(df)
print()
print(df.dtypes)
print()
print(df["group"].value_counts())
print()
print("열별 결측 개수:")
print(df.isna().sum())
```

출력:

```text
  participant_id    group   age sex  tremor_score
0           P001       PD  67.0   F           2.1
1           P002  Control  64.0   M           0.3
2           P003       PD   NaN   M           3.4
3           P004  Control  59.0   F           NaN
4           P005       PD  71.0   F           2.8
6           P006       PD  58.0   M           1.9

participant_id     object
group              object
age               float64
sex                object
tremor_score      float64
dtype: object

group
PD         4
Control    2
Name: count, dtype: int64

열별 결측 개수:
participant_id    0
group             0
age               1
sex               0
tremor_score      1
dtype: int64
```

세 가지를 확인하세요. `age`가 `float64`가 되었고, 숨어 있던 결측이 드러나 `age` 결측이 1로 바뀌었고, 군이 두 개로 정리되었습니다. `NaN`(Not a Number)은 pandas가 결측을 표시하는 방식으로, Day 3의 `None`과 같은 역할입니다.

중요한 점 하나. 우리는 **원본 파일을 고치지 않았습니다.** 파일은 그대로 두고, 읽어 온 뒤 코드로 고쳤습니다. 그래서 "무엇을 어떻게 고쳤는지"가 코드에 전부 남아 있습니다. Day 1의 "원본 데이터는 읽기만 한다"는 원칙이 바로 이것입니다.

## 직접 해보기

1. **노트북을 만듭니다.** JupyterLab에서 `notebooks/01_setup_and_metadata.ipynb`를 새로 만들고, 첫 Markdown 셀에 제목과 "가상 데이터로 QC 절차 연습"이라고 적습니다.

2. **예시 1, 2, 3을 셀 하나씩에 입력해 실행**하고 출력이 위와 같은지 확인합니다. 예시 2를 실행하면 `data/toy_clinical.csv` 파일이 생깁니다(Day 1의 `.gitignore` 덕분에 Git에는 올라가지 않습니다).

3. **QC 함수를 만듭니다.** 매번 네 줄을 치는 대신, 프로토콜 하나로 묶습니다.

   ```python
   import pandas as pd

   def qc_report(df, id_col):
       """표 하나를 받아 기본 QC 결과를 출력한다."""
       print(f"행 {df.shape[0]}개, 열 {df.shape[1]}개")
       print("- 완전히 중복된 행:", int(df.duplicated().sum()))
       print("- 중복된 ID:", sorted(df.loc[df[id_col].duplicated(), id_col].unique().tolist()))
       missing = df.isna().sum()
       print("- 결측이 있는 열:", missing[missing > 0].to_dict())
       text_cols = df.select_dtypes(include="object").columns.tolist()
       print("- 글자(object)로 읽힌 열:", text_cols)

   metadata = pd.read_csv("../data/toy_clinical.csv")
   qc_report(metadata, id_col="participant_id")
   ```

   출력:

   ```text
   행 7개, 열 5개
   - 완전히 중복된 행: 1
   - 중복된 ID: ['P003']
   - 결측이 있는 열: {'tremor_score': 1}
   - 글자(object)로 읽힌 열: ['participant_id', 'group', 'age', 'sex']
   ```

4. **고친 표에도 같은 함수를 돌립니다.** 예시 3에서 만든 `df`로 `qc_report(df, id_col="participant_id")`를 실행하세요. 중복이 0이 되고, `age`가 "글자로 읽힌 열"에서 빠지고, 결측이 있는 열에 `age`가 새로 나타나면 성공입니다.

5. **두 표의 ID가 맞는지 확인합니다.** 측정값 표와 메타데이터 표를 잇기 전에 반드시 하는 점검입니다.

   ```python
   import pandas as pd

   expression = pd.DataFrame({
       "sample_id": ["S1", "S2", "S3", "S5"],
       "Gfap": [9.8, 10.4, 13.5, 12.0],
   })
   metadata = pd.DataFrame({
       "sample_id": ["S1", "S2", "S3", "S4"],
       "group": ["control", "control", "flight", "flight"],
   })

   only_in_expression = set(expression["sample_id"]) - set(metadata["sample_id"])
   only_in_metadata = set(metadata["sample_id"]) - set(expression["sample_id"])
   print("발현 표에만 있는 ID:", only_in_expression)
   print("메타데이터에만 있는 ID:", only_in_metadata)

   merged = expression.merge(metadata, on="sample_id", how="left")
   print(merged)
   ```

   출력:

   ```text
   발현 표에만 있는 ID: {'S5'}
   메타데이터에만 있는 ID: {'S4'}
     sample_id  Gfap    group
   0        S1   9.8  control
   1        S2  10.4  control
   2        S3  13.5   flight
   3        S5  12.0      NaN
   ```

   S5는 측정값은 있지만 어느 군인지 모릅니다(`group`이 `NaN`). 이 샘플은 군 비교에 쓸 수 없습니다. Markdown 셀에 "S5를 어떻게 처리해야 할까?"에 대한 자기 생각을 두 문장으로 적으세요. (정답은 하나가 아닙니다. 다만 "적당히 flight로 넣는다"는 답이 아닙니다.)

6. **QC 메모를 남깁니다.** 노트북 마지막 Markdown 셀에 "표를 받으면 내가 확인할 5가지"를 자기 말로 목록으로 적습니다. 3주차와 4주차에 실제 데이터를 받을 때 이 목록을 그대로 씁니다.

7. **저장, 일지, commit.**

   ```bash
   git add notebooks/01_setup_and_metadata.ipynb learning-log.md
   git commit -m "Day 4: 결측치·중복 ID 점검 함수 작성"
   ```

> ⚠️ **흔한 오류 1 — `FileNotFoundError: ... '../data/toy_clinical.csv'`**
> 노트북이 `notebooks/` 폴더 안에 있지 않거나, `data/` 폴더가 없을 때 납니다. `..`는 "한 단계 위 폴더"라는 뜻이라서, 노트북이 `notebooks/` 안에 있어야 `../data/`가 프로젝트의 `data/`를 가리킵니다. 셀에서 `import os; print(os.getcwd())`를 실행해 지금 위치가 `.../neurodegeneration-bioinformatics/notebooks`인지 확인하세요.

> ⚠️ **흔한 오류 2 — 고쳤는데 안 고쳐진다**
> `df.drop_duplicates()`만 쓰고 결과를 다시 담지 않으면 `df`는 그대로입니다. pandas의 대부분 기능은 원래 표를 바꾸지 않고 **새 표를 돌려줍니다.** `df = df.drop_duplicates()`처럼 다시 담아야 합니다.

## 퀴즈

**1.** 다음 중 tidy data 규칙을 어긴 것은?

- (a) 한 행이 한 샘플의 한 유전자 측정값이다.
- (b) `age_sex` 열에 `67/F`처럼 나이와 성별이 함께 들어 있다.
- (c) 모든 열에 변수 이름이 제목으로 붙어 있다.
- (d) 군 정보가 `group` 열 하나에 들어 있다.

<details><summary>정답 보기</summary>

**(b)**. "칸 하나에 값 하나" 규칙을 어겼습니다. 이 상태로는 평균 나이를 계산할 수도, 성별로 나눌 수도 없습니다. `age`와 `sex` 두 열로 나눠야 합니다.

</details>

**2.** 나이 열의 `dtype`이 `object`로 나왔습니다. 가장 먼저 의심할 것은? (단답)

<details><summary>정답 보기</summary>

그 열에 숫자가 아닌 값(`unknown`, `N/A`, `-`, 단위가 붙은 `67세` 등)이 섞여 있다는 것입니다. pandas는 글자가 하나라도 있으면 열 전체를 글자로 읽습니다. `df["age"].unique()`로 어떤 값이 있는지 직접 확인합니다.

</details>

**3.** 예시 2에서 `df.isna().sum()`은 `age`의 결측을 0개로 보고했습니다. 실제로는 결측이 있었는데 왜 0이 나왔을까요?

- (a) pandas의 버그이다.
- (b) `unknown`은 빈칸이 아니라 글자 값이라서 결측으로 세어지지 않았다.
- (c) `isna()`는 숫자 열에서만 작동한다.
- (d) 중복 행 때문에 계산이 틀렸다.

<details><summary>정답 보기</summary>

**(b)**. `isna()`는 진짜 빈칸(`NaN`)만 셉니다. 사람이 적어 넣은 `unknown`은 컴퓨터에게는 정상적인 글자 값입니다. 그래서 결측 개수만 믿지 말고 열 유형을 함께 봐야 하며, `pd.to_numeric(..., errors="coerce")`로 바꾸면 숨은 결측이 드러납니다.

</details>

**4.** 메타데이터 없이 발현 행렬만 있을 때, 다음 중 **할 수 없는** 것은?

- (a) 유전자별 평균 발현량 계산
- (b) 샘플 사이의 상관계수 계산
- (c) 비행군과 대조군의 발현량 비교
- (d) 발현량 분포의 histogram 그리기

<details><summary>정답 보기</summary>

**(c)**. 어느 샘플이 어느 군인지는 메타데이터에만 있습니다. (a), (b), (d)는 숫자만으로 계산은 되지만, 그 숫자가 무엇을 뜻하는지(어떤 조직, 어떤 조건)는 여전히 메타데이터 없이는 해석할 수 없습니다.

</details>

**5.** 발현 표의 ID는 `S1, S2, S3, S5`, 메타데이터의 ID는 `S1, S2, S3, S4`입니다. 두 표를 이은 뒤 군 비교에 쓸 수 있는 샘플은 몇 개이고, 왜 그런가요? (단답)

<details><summary>정답 보기</summary>

**3개**(S1, S2, S3)입니다. S5는 측정값은 있지만 군 정보가 없고, S4는 군 정보는 있지만 측정값이 없습니다. 양쪽 표에 모두 있는 ID만 비교에 쓸 수 있으며, 빠진 샘플과 그 이유는 기록으로 남겨야 합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/01_setup_and_metadata.ipynb`에 예시 1–3이 실행되어 있다.
- [ ] `qc_report()` 함수가 있고, 고치기 전·후 표에 각각 돌려 보았다.
- [ ] 두 표의 ID 일치 여부를 `set` 빼기로 확인했다.
- [ ] "표를 받으면 확인할 5가지" 목록을 적었다.
- [ ] commit을 남겼다.

---
[← 이전](day-03.md) · [코스 지도](../../README.md) · [다음 →](day-05.md)
