# Day 16 — 샘플 표와 유전자 행렬을 안전하게 연결하기

> **주차:** 3주차 · **예상 시간:** 75–90분 · **산출물:** QC 요약표 (`data/osdr_536/processed/qc_summary.csv`)

## 오늘의 목표
- 샘플별 RCC 파일 12개를 읽어 "샘플 × 유전자" count 행렬 하나로 합칠 수 있다.
- 샘플 메타데이터와 행렬의 sample ID가 일치하는지, 중복·누락이 없는지 확인할 수 있다.
- 조건별 샘플 수를 포함한 QC 요약표를 저장할 수 있다.

## 🎬 영상으로 먼저 보기
- [How do I merge DataFrames in pandas? — Data School](https://www.youtube.com/watch?v=iYWKfUOtGaw) (21:48)
- **무엇에 주목할까:** 두 표를 "공통 열"로 잇는 `merge`가 오늘의 핵심 도구입니다. inner join과 outer join에서 행 수가 어떻게 달라지는지, 그리고 한쪽에만 있는 행이 어떻게 처리되는지에 집중하세요. 오늘은 그 "한쪽에만 있는 행"을 일부러 찾아낼 것입니다.

## 개념 설명

### 튜브 라벨과 샘플 시트가 어긋나면 모든 것이 틀린다

웨스턴 블롯에서 레인 순서를 한 칸 밀려 기록하면 밴드는 멀쩡해도 결론은 전부 틀립니다. 데이터 분석에서도 똑같은 사고가 납니다. 발현 값이 담긴 표와 "이 샘플은 비행군"이라고 적힌 표는 서로 다른 파일이고, 둘을 잇는 끈은 **sample ID** 하나뿐입니다. ID가 한 글자만 달라도(`GC8`과 `G8`, 끝에 붙은 공백, 대소문자) 컴퓨터는 다른 샘플로 취급합니다. 더 무서운 것은 오류 없이 조용히 틀리는 경우입니다. 순서가 같다고 가정하고 두 표를 나란히 붙이면 코드가 문제없이 돌아가지만, 한쪽이 알파벳순이고 다른 쪽이 실험 순서라면 군 라벨이 뒤섞입니다. 그래서 원칙은 하나입니다. **순서로 잇지 말고, 반드시 ID 열로 잇는다.**

### OSD-536에서는 세 장의 표가 사슬처럼 이어진다

어제 받은 파일을 기준으로 연결 고리는 다음과 같습니다(2026-11-12에 파일을 열어 확인).

1. 샘플 표 `s_OSD-536.txt`: 한 행이 한 마리. `Source Name`(동물 표기, 예 `F8`, `GC8`), `Sample Name`(예 `GSM5643013`), `Factor Value[Spaceflight]`(`Space Flight` 또는 `Ground Control`)이 있습니다.
2. assay 표 `a_OSD-536_...txt`: `Sample Name`과 그 샘플의 원시 파일 이름인 `Array Data File`이 있습니다.
3. RCC 파일: 각 파일 안에 `CodeClass, Name, Accession, Count` 표가 있습니다.

즉 "파일 → Sample Name → 군" 순서로 따라가야 합니다. 주의할 점이 있습니다. 대조군의 `Source Name`은 `GC8`처럼 적혀 있지만 파일 이름에는 `G8`로 들어 있습니다. 파일 이름에서 글자를 잘라 군을 추측하는 방식은 이런 차이 때문에 깨지기 쉽습니다. assay 표가 알려 주는 공식 연결을 쓰세요.

### 연결한 뒤 꼭 확인할 네 가지

표를 이은 다음에는 "잘 이어졌겠지"라고 믿지 않고 숫자로 확인합니다. 첫째, **일치**: 메타데이터에 있는 파일과 폴더에 실제로 있는 파일이 같은 집합인가. 둘째, **중복**: 같은 sample ID나 같은 유전자 이름이 두 번 나오지 않는가. 셋째, **누락**: 군 정보가 비어 있는 샘플, count가 비어 있는 칸이 없는가. 넷째, **조건별 수**: 군마다 몇 마리인가. pandas에는 이 확인을 돕는 장치가 있습니다. `merge(..., indicator=True)`는 각 행이 양쪽에 다 있었는지(`both`) 한쪽에만 있었는지 알려 주고, `validate="one_to_one"`은 ID가 중복되어 행이 불어나는 순간 오류를 내 줍니다. 오류가 나는 것은 좋은 일입니다. 조용히 틀리는 것보다 시끄럽게 멈추는 편이 낫습니다.

## 예시로 이해하기

### 예시 1 — 순서로 붙이면 조용히 틀린다

```python
import pandas as pd

expr = pd.DataFrame({"sample_id": ["S3", "S1", "S2"], "GeneX": [10, 200, 220]})
meta = pd.DataFrame({"sample_id": ["S1", "S2", "S3"], "group": ["FLT", "FLT", "GC"]})

wrong = expr.copy()
wrong["group"] = meta["group"].values           # 순서만 믿고 붙임
right = expr.merge(meta, on="sample_id")        # ID로 이음

print(wrong.groupby("group")["GeneX"].mean().to_string())
print(right.groupby("group")["GeneX"].mean().to_string())
```

```text
group
FLT    105.0
GC     220.0
group
FLT    210.0
GC      10.0
```

두 방식 모두 오류 없이 실행되지만 군 평균이 전혀 다릅니다. 아래쪽(ID로 이은 것)이 맞습니다.

### 예시 2 — 한쪽에만 있는 샘플 찾기

```python
meta = pd.DataFrame({"sample_id": ["S1", "S2", "S3", "S4"],
                     "group": ["FLT", "FLT", "GC", "GC"]})
files = pd.DataFrame({"sample_id": ["S1", "S2", "S3 ", "S5"],     # "S3 " 뒤에 공백
                      "file": ["a.gz", "b.gz", "c.gz", "e.gz"]})

check = meta.merge(files, on="sample_id", how="outer", indicator=True)
print(check.to_string(index=False))
```

```text
sample_id group file     _merge
       S1   FLT a.gz       both
       S2   FLT b.gz       both
       S3    GC  NaN  left_only
      S3    NaN c.gz right_only
       S4    GC  NaN  left_only
       S5   NaN e.gz right_only
```

`left_only`는 메타데이터에만, `right_only`는 파일 쪽에만 있는 ID입니다. `S3`과 `S3 `(공백 포함)이 서로 다른 것으로 잡힌 점을 보세요. 이런 경우 `files["sample_id"].str.strip()`으로 공백을 지운 뒤 다시 확인합니다.

### 예시 3 — 중복이 있으면 `validate`가 멈춰 준다

```python
meta_dup = pd.DataFrame({"sample_id": ["S1", "S1", "S2"], "group": ["FLT", "GC", "FLT"]})
expr = pd.DataFrame({"sample_id": ["S1", "S2"], "GeneX": [200, 220]})

print("중복된 ID:", meta_dup.loc[meta_dup["sample_id"].duplicated(keep=False), "sample_id"].unique())
try:
    expr.merge(meta_dup, on="sample_id", validate="one_to_one")
except pd.errors.MergeError as e:
    print("멈춤:", e)
```

```text
중복된 ID: ['S1']
멈춤: Merge keys are not unique in right dataset; not a one-to-one merge
```

## 직접 해보기

먼저 연습 데이터(`MODE = "practice"`)로 끝까지 실행하고, 그다음 `MODE = "real"`로 바꿔 처음부터 다시 실행합니다. 코드는 한 글자도 바꿀 필요가 없습니다.

1. 노트북 `02_osdr_qc_and_pca.ipynb`에 "Day 16" 제목 셀을 만들고 설정 셀을 실행합니다.

```python
from pathlib import Path
import gzip
import io
import pandas as pd

MODE = "practice"          # 연습이 끝나면 "real"로 바꾸세요
RAW_DIR = Path("../data/osdr_536_practice" if MODE == "practice" else "../data/osdr_536")
assert RAW_DIR.exists(), f"{RAW_DIR} 폴더가 없습니다. Day 15를 먼저 실행하세요."
OUT_DIR = RAW_DIR / "processed"
OUT_DIR.mkdir(exist_ok=True)
```

2. 샘플 표와 assay 표를 읽고, 열 이름을 **먼저 눈으로 확인**합니다. 실제 샘플 표에는 열이 70개가 넘으므로 우리가 쓸 세 개가 정말 있는지 확인하는 것입니다.

```python
s_table = pd.read_csv(next(RAW_DIR.glob("s_*.txt")), sep="\t")
a_table = pd.read_csv(next(RAW_DIR.glob("a_*.txt")), sep="\t")

need_s = ["Sample Name", "Source Name", "Factor Value[Spaceflight]"]
need_a = ["Sample Name", "Array Data File"]
print("샘플 표 크기:", s_table.shape, "| assay 표 크기:", a_table.shape)
print("필요한 열이 모두 있는가:", set(need_s) <= set(s_table.columns), set(need_a) <= set(a_table.columns))
```

```text
샘플 표 크기: (12, 3) | assay 표 크기: (12, 2)
필요한 열이 모두 있는가: True True
```

3. 두 표를 `Sample Name`으로 잇고, 읽기 쉬운 열 이름과 짧은 군 이름(`FLT`, `GC`)을 붙입니다.

```python
samples = s_table[need_s].merge(a_table[need_a], on="Sample Name",
                                how="outer", validate="one_to_one", indicator=True)
samples.columns = ["sample_id", "source", "condition", "file", "_merge"]
samples["group"] = samples["condition"].map({"Space Flight": "FLT", "Ground Control": "GC"})
print(samples.head(3).to_string(index=False))
```

```text
sample_id source    condition                              file _merge group
      P01     F1 Space Flight PRACTICE_microarray_P01_F1.RCC.gz   both   FLT
      P02     F2 Space Flight PRACTICE_microarray_P02_F2.RCC.gz   both   FLT
      P03     F3 Space Flight PRACTICE_microarray_P03_F3.RCC.gz   both   FLT
```

4. RCC 파일 하나에서 `<Code_Summary>` 표만 꺼내는 함수를 만들고, assay 표가 알려 준 파일 이름대로 모두 읽어 세로로 쌓습니다.

```python
def read_rcc(path):
    """RCC(.gz) 파일 하나에서 Code_Summary 표(CodeClass, Name, Accession, Count)를 꺼낸다."""
    with gzip.open(path, "rt") as f:
        text = f.read()
    block = text.split("<Code_Summary>")[1].split("</Code_Summary>")[0]
    return pd.read_csv(io.StringIO(block.strip()))

long = pd.concat(
    [read_rcc(RAW_DIR / row.file).assign(sample_id=row.sample_id) for row in samples.itertuples()],
    ignore_index=True,
)
print(long.shape)
print(long.head(3).to_string(index=False))
```

```text
(936, 5)
 CodeClass   Name   Accession  Count sample_id
Endogenous Prac01 PRAC_0001.1     49       P01
Endogenous Prac02 PRAC_0002.1     21       P01
Endogenous Prac03 PRAC_0003.1     40       P01
```

5. 세로로 긴 표를 "샘플(행) × 유전자(열)" 행렬로 바꿉니다. 같은 샘플에 같은 이름이 두 번 있으면 `pivot`이 오류를 내므로, 이 줄이 통과했다는 것 자체가 중복 검사입니다.

```python
counts = long.pivot(index="sample_id", columns="Name", values="Count")
probes = long.drop_duplicates("Name")[["Name", "CodeClass", "Accession"]].reset_index(drop=True)
print("행렬 크기(샘플, 프로브):", counts.shape)
print(probes["CodeClass"].value_counts().to_string())
```

```text
행렬 크기(샘플, 프로브): (12, 78)
CodeClass
Endogenous      60
Negative         8
Positive         6
Housekeeping     4
```

6. 네 가지 확인을 숫자로 남기고 QC 요약표로 저장합니다.

```python
on_disk = {p.name for p in RAW_DIR.glob("*.RCC.gz")}
in_meta = set(samples["file"].dropna())

qc = pd.DataFrame([
    ("샘플 표의 샘플 수", len(s_table)),
    ("폴더의 RCC 파일 수", len(on_disk)),
    ("메타데이터에만 있는 파일", len(in_meta - on_disk)),
    ("폴더에만 있는 파일", len(on_disk - in_meta)),
    ("양쪽 표에 모두 있는 샘플", int((samples["_merge"] == "both").sum())),
    ("중복된 sample_id", int(samples["sample_id"].duplicated().sum())),
    ("군 정보가 없는 샘플", int(samples["group"].isna().sum())),
    ("FLT 샘플 수", int((samples["group"] == "FLT").sum())),
    ("GC 샘플 수", int((samples["group"] == "GC").sum())),
    ("샘플마다 프로브 수가 같은가", long.groupby("sample_id")["Name"].nunique().nunique() == 1),
    ("행렬의 빈 칸 수", int(counts.isna().sum().sum())),
    ("Endogenous 유전자 수", int((probes["CodeClass"] == "Endogenous").sum())),
], columns=["확인 항목", "값"])
print(qc.to_string(index=False))

counts.to_csv(OUT_DIR / "counts_raw.csv")
probes.to_csv(OUT_DIR / "probes.csv", index=False)
samples.drop(columns="_merge").to_csv(OUT_DIR / "samples.csv", index=False)
qc.to_csv(OUT_DIR / "qc_summary.csv", index=False)
```

```text
           확인 항목    값
      샘플 표의 샘플 수   12
    폴더의 RCC 파일 수   12
   메타데이터에만 있는 파일    0
      폴더에만 있는 파일    0
  양쪽 표에 모두 있는 샘플   12
   중복된 sample_id    0
     군 정보가 없는 샘플    0
        FLT 샘플 수    6
         GC 샘플 수    6
 샘플마다 프로브 수가 같은가 True
       행렬의 빈 칸 수    0
Endogenous 유전자 수   60
```

7. `MODE = "real"`로 바꾸고 1번부터 다시 실행합니다. 실제 데이터의 QC 요약표에서 (가) 샘플 수와 파일 수가 12로 같은지, (나) "…에만 있는 파일"이 둘 다 0인지, (다) 군별 n이 README에 적은 값과 같은지 확인합니다. 하나라도 어긋나면 다음 단계로 가지 말고 원인을 찾아 `data/README.md`의 "발견한 점"에 적습니다.
8. 실제 데이터에서 `samples[["source", "file"]]`을 출력해 동물 표기와 파일 이름을 나란히 보고, 표기가 어떻게 다른지 한 줄로 학습 로그에 적습니다.

⚠️ **흔한 오류 1 — `KeyError: 'Factor Value[Spaceflight]'`.** 열 이름을 손으로 쳤다면 대괄호, 대소문자, 공백 중 하나가 다릅니다. `print(s_table.columns.tolist())`로 출력해 복사해 붙이세요.

⚠️ **흔한 오류 2 — `ValueError: Index contains duplicate entries, cannot reshape`.** `pivot` 단계에서 같은 샘플에 같은 `Name`이 두 번 있다는 뜻입니다. 셀을 두 번 실행해 `long`에 같은 파일이 두 번 쌓였는지 먼저 의심하고, 4번 셀부터 다시 실행하세요.

## 퀴즈

**1.** 두 표를 이을 때 "순서가 같으니 그냥 옆에 붙이자"가 위험한 이유는?

<details><summary>정답 보기</summary>

두 표의 행 순서가 다르면 오류 없이 군 라벨이 뒤섞이기 때문입니다. 코드가 멈추지 않으므로 틀렸다는 사실조차 알기 어렵습니다. ID 열로 `merge`하면 순서와 무관하게 올바르게 이어집니다.

</details>

**2.** `merge(..., how="outer", indicator=True)` 결과에서 `_merge` 값이 `left_only`인 행은 무엇을 뜻하나요?

<details><summary>정답 보기</summary>

왼쪽 표에는 있는데 오른쪽 표에는 짝이 없는 ID입니다. 오늘의 경우라면 샘플 표에는 있지만 assay 표(파일 목록)에는 없는 샘플입니다. 실제 누락일 수도, ID 철자 차이일 수도 있으니 원인을 확인해야 합니다.

</details>

**3.** OSD-536에서 RCC 파일 이름을 잘라 군을 추측하지 않고 assay 표를 거치는 이유는? (가) 속도가 빨라서 (나) 파일 이름과 메타데이터의 동물 표기가 글자 단위로 같지 않아서 (다) pandas가 파일 이름을 못 읽어서

<details><summary>정답 보기</summary>

(나). 대조군은 샘플 표에 `GC8`처럼 적혀 있지만 파일 이름에는 `G8`로 들어 있습니다. 글자 규칙을 추측하면 이런 차이에서 깨지므로, 저장소가 제공하는 공식 연결(Sample Name ↔ Array Data File)을 씁니다.

</details>

**4.** 실제 데이터의 행렬 열 수는 Endogenous 유전자 수보다 큽니다. 나머지 열은 무엇인가요?

<details><summary>정답 보기</summary>

Housekeeping 유전자와 Positive/Negative 대조 프로브입니다. 이들은 생물학적 비교 대상이 아니라 내일 정규화와 배경 잡음 추정에 쓰는 "기준자"입니다. 그래서 `probes.csv`에 `CodeClass`를 따로 저장해 둡니다.

</details>

**5.** QC 요약표에서 "FLT 샘플 수 6, GC 샘플 수 6"을 확인했습니다. 이 숫자가 이번 주 해석에 주는 의미를 한 문장으로 쓰세요.

<details><summary>정답 보기</summary>

군당 6마리는 작은 표본이어서 개체 하나의 값이 평균과 p-value를 크게 흔들 수 있습니다. 따라서 이번 주의 결과는 확정된 사실이 아니라 추가 검증이 필요한 가설로 다룹니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 연습 데이터로 1–6번이 오류 없이 실행되었다.
- [ ] `data/osdr_536/processed/`에 `counts_raw.csv`, `probes.csv`, `samples.csv`, `qc_summary.csv`가 있다.
- [ ] 실제 데이터 QC 요약표에서 샘플 수 = 파일 수, 불일치 0, 중복 0, 빈 칸 0을 확인했다.
- [ ] 조건별 샘플 수가 `data/README.md`와 일치한다.
- [ ] 동물 표기와 파일 이름의 차이를 학습 로그에 적었다.

---
[← 이전](day-15.md) · [코스 지도](../../README.md) · [다음 →](day-17.md)
