# Day 3 — 배운 문법으로 작은 유전자·임상 표 다루기

> **주차:** 1주차 · **예상 시간:** 75–90분 · **산출물:** `notebooks/01_python_basics.ipynb`

## 오늘의 목표
- 리스트와 딕셔너리를 조합해 작은 표(유전자 표, 임상 표)를 표현할 수 있다.
- 반복되는 계산을 함수로 묶고, 조건문으로 결과에 라벨을 붙일 수 있다.
- 빠진 값(`None`)이 섞인 자료에서 오류 없이 요약값을 계산할 수 있다.

## 🎬 영상으로 먼저 보기

- [Python Tutorial for Beginners 5: Dictionaries - Working with Key-Value Pairs — Corey Schafer](https://www.youtube.com/watch?v=daefaLgNkw0) (9분 59초)
- **무엇에 주목할까:** `.get()`으로 "없는 키"를 안전하게 다루는 부분과, `for key, value in d.items()`로 딕셔너리를 도는 부분을 눈여겨보세요. 오늘 실습에서 두 가지를 계속 씁니다.

- [Python Tutorial for Beginners 8: Functions — Corey Schafer](https://www.youtube.com/watch?v=9Os0o3wzS_I) (21분 47초)
- **무엇에 주목할까:** 0주차 복습용입니다. 앞 10분, 즉 `def`, 인자(argument), `return`, 기본값이 있는 인자까지만 보면 충분합니다. "함수는 값을 **돌려준다**(`return`)"와 "화면에 **보여 준다**(`print`)"의 차이에 집중하세요.

## 개념 설명

오늘은 새 문법을 배우지 않습니다. 0주차에 배운 변수, 리스트, 딕셔너리, 조건문, 반복문, 함수를 **조립**해서 생물학 자료를 다루는 연습을 합니다. 레고 블록은 이미 있고, 오늘은 그것으로 처음 집을 지어 보는 날입니다.

### 표는 "딕셔너리의 리스트"다

엑셀 표를 떠올려 보세요. 한 **행**은 한 대상(유전자 하나, 참가자 한 명)이고, 각 **열**은 그 대상의 속성(이름, 군, 나이)입니다. Python의 기본 자료형만으로 이것을 표현하면 이렇게 됩니다.

- 한 행 = **딕셔너리** 하나. `{"id": "P001", "group": "PD", "age": 67}`
- 표 전체 = 그 딕셔너리들을 담은 **리스트**.

딕셔너리는 환자 한 명의 차트이고, 리스트는 차트를 꽂아 둔 차트 보관함입니다. 보관함에서 차트를 하나씩 꺼내는 것이 `for` 반복문이고, 차트에서 "나이" 칸을 읽는 것이 `p["age"]`입니다.

내일 배울 pandas의 DataFrame도 속을 들여다보면 같은 생각입니다. 오늘 손으로 해 본 사람은 내일 pandas가 **무엇을 대신 해 주는지** 알게 됩니다. 손으로 PCR 프라이머를 설계해 본 사람이 설계 프로그램의 결과를 더 잘 읽는 것과 같습니다.

### 함수는 프로토콜이다

실험실에서 같은 절차를 여러 샘플에 반복할 때 프로토콜을 한 번 써 두고 따라 하듯이, 같은 계산을 여러 번 할 때는 함수로 묶습니다. 함수에는 세 가지가 있습니다.

- **입력(인자):** 프로토콜의 "시료"
- **절차(함수 몸통):** 프로토콜의 "단계"
- **출력(`return`):** 프로토콜의 "결과물"

함수로 묶으면 좋은 점은 두 가지입니다. 첫째, 계산 방법을 바꿀 때 **한 곳만** 고치면 됩니다. 둘째, 이름이 곧 설명이 됩니다. `math.log2(b / a)`보다 `log2_fold_change(control, flight)`가 무엇을 하는지 훨씬 잘 보입니다.

오늘 만들 `log2_fold_change`는 3주차에 계속 만나게 될 값입니다. 처리군이 대조군의 2배면 +1, 절반이면 −1, 같으면 0입니다. 비율에 log2를 씌우는 이유는 "2배 증가"와 "절반 감소"를 0을 중심으로 **대칭**(+1과 −1)으로 만들기 위해서입니다.

### 조건문은 판독 기준이다

검사 결과지에는 숫자 옆에 "정상 / 높음 / 낮음"이 붙어 있지요. 숫자에 기준을 적용해 라벨을 붙이는 일이 조건문(`if / elif / else`)입니다.

주의할 점은, 기준(cutoff)은 **자연이 정해 준 것이 아니라 사람이 정한 것**이라는 사실입니다. log2FC가 0.5보다 크면 "증가"라고 부르기로 했다면, 0.49와 0.51은 생물학적으로 거의 같지만 라벨은 달라집니다. 그래서 기준값은 함수 안에 숨기지 말고 `cutoff=0.5`처럼 **인자로 드러내** 두는 것이 좋습니다. 누가 봐도 어떤 기준을 썼는지 알 수 있고, 바꿔 보기도 쉽습니다.

### 빠진 값은 0이 아니다

실제 자료에는 반드시 빈칸이 있습니다. 측정을 못 했거나, 기록이 누락된 경우입니다. Python에서는 "값이 없음"을 `None`으로 표현합니다.

`None`을 0으로 바꾸면 안 됩니다. 나이 기록이 없는 사람을 0세로 치면 평균 나이가 틀어집니다. 검사를 안 한 것과 검사 결과가 0인 것은 전혀 다릅니다. 그렇다고 `None`을 그대로 더하려 하면 Python이 `TypeError`를 냅니다. 올바른 방법은 **빼고 계산하되, 몇 개를 뺐는지 함께 보고하는 것**입니다. "평균 65.7세 (결측 1명)"처럼요.

## 예시로 이해하기

아래 숫자는 모두 연습용 **가상 데이터**입니다.

### 예시 1 — 유전자 표에서 log2 fold change 계산하고 라벨 붙이기

```python
import math

# 가상 데이터: 유전자 5개의 평균 발현량 (대조군 vs 비행군)
genes = [
    {"symbol": "Gfap",  "pathway": "신경염증",     "control": 10.0, "flight": 15.0},
    {"symbol": "Sod2",  "pathway": "산화스트레스", "control": 8.0,  "flight": 8.4},
    {"symbol": "Mbp",   "pathway": "수초",         "control": 20.0, "flight": 12.0},
    {"symbol": "Casp3", "pathway": "apoptosis",    "control": 5.0,  "flight": 7.5},
    {"symbol": "Syp",   "pathway": "시냅스",       "control": 16.0, "flight": 15.0},
]

def log2_fold_change(control, treated):
    """처리군/대조군 비율에 log2를 씌운 값을 돌려준다."""
    return math.log2(treated / control)

def label_direction(lfc, cutoff=0.5):
    """log2FC가 cutoff보다 크면 '증가', -cutoff보다 작으면 '감소', 아니면 '변화 작음'."""
    if lfc > cutoff:
        return "증가"
    elif lfc < -cutoff:
        return "감소"
    else:
        return "변화 작음"

for gene in genes:
    lfc = log2_fold_change(gene["control"], gene["flight"])
    print(f'{gene["symbol"]:<6} log2FC={lfc:+.2f}  {label_direction(lfc)}  ({gene["pathway"]})')
```

출력:

```text
Gfap   log2FC=+0.58  증가  (신경염증)
Sod2   log2FC=+0.07  변화 작음  (산화스트레스)
Mbp    log2FC=-0.74  감소  (수초)
Casp3  log2FC=+0.58  증가  (apoptosis)
Syp    log2FC=-0.09  변화 작음  (시냅스)
```

읽는 법: `{lfc:+.2f}`는 "부호를 붙이고 소수 둘째 자리까지", `{...:<6}`은 "6칸 폭에 왼쪽 정렬"입니다. *Gfap*(10→15)과 *Casp3*(5→7.5)은 원래 값이 달라도 둘 다 1.5배라서 log2FC가 같습니다. fold change는 **차이**가 아니라 **비율**을 본다는 점을 기억하세요.

### 예시 2 — 임상 표에서 군별 인원과 평균 나이 구하기 (결측 포함)

```python
# 가상 데이터: 참가자 6명의 임상 정보 (None = 기록 없음)
participants = [
    {"id": "P001", "group": "PD",      "age": 67,   "updrs": 28},
    {"id": "P002", "group": "Control", "age": 64,   "updrs": 3},
    {"id": "P003", "group": "PD",      "age": 72,   "updrs": None},
    {"id": "P004", "group": "Control", "age": 59,   "updrs": 1},
    {"id": "P005", "group": "PD",      "age": None, "updrs": 35},
    {"id": "P006", "group": "PD",      "age": 58,   "updrs": 19},
]

def mean_ignoring_missing(values):
    """None을 빼고 평균을 계산한다. 남은 값이 없으면 None을 돌려준다."""
    present = [v for v in values if v is not None]
    if len(present) == 0:
        return None
    return sum(present) / len(present)

# 1) 군별 인원 세기
counts = {}
for p in participants:
    group = p["group"]
    counts[group] = counts.get(group, 0) + 1
print("군별 인원:", counts)

# 2) 군별 평균 나이와 결측 개수
for group in counts:
    ages = [p["age"] for p in participants if p["group"] == group]
    n_missing = ages.count(None)
    print(f"{group}: 평균 나이 = {mean_ignoring_missing(ages):.1f}세 (결측 {n_missing}명)")

# 3) 값이 빠진 참가자 찾기
for p in participants:
    missing = [key for key, value in p.items() if value is None]
    if missing:
        print(p["id"], "→ 빠진 항목:", missing)
```

출력:

```text
군별 인원: {'PD': 4, 'Control': 2}
PD: 평균 나이 = 65.7세 (결측 1명)
Control: 평균 나이 = 61.5세 (결측 0명)
P003 → 빠진 항목: ['updrs']
P005 → 빠진 항목: ['age']
```

눈여겨볼 곳은 `counts.get(group, 0) + 1`입니다. "이 군을 처음 보면 0에서 시작하고, 본 적 있으면 지금 값에 1을 더하라"는 뜻입니다. 접수 창구에서 군별로 바를 정(正) 자를 그어 세는 것과 같습니다. 그리고 벌써 하나가 보입니다. PD군이 Control군보다 평균 나이가 많습니다. 이런 차이가 왜 문제가 되는지는 Day 7에 다룹니다.

### 예시 3 — 없는 키와 대소문자 함정

```python
gene_to_pathway = {
    "Gfap": "신경염증",
    "Sod2": "산화스트레스",
    "Mbp": "수초",
}

for symbol in ["Gfap", "Mbp", "Snca"]:
    pathway = gene_to_pathway.get(symbol, "미분류")
    print(symbol, "→", pathway)

# 대소문자가 다르면 다른 키다
print("GFAP" in gene_to_pathway)
print("GFAP".capitalize() in gene_to_pathway)
```

출력:

```text
Gfap → 신경염증
Mbp → 수초
Snca → 미분류
False
True
```

컴퓨터에게 `Gfap`과 `GFAP`은 완전히 다른 글자입니다. 마우스 유전자는 관례상 첫 글자만 대문자(*Gfap*), 사람 유전자는 전부 대문자(*GFAP*)로 씁니다. 두 종의 표를 이름으로 맞춰 보려다 "하나도 안 맞네?" 하게 되는 흔한 원인입니다. (그리고 이름이 같다고 두 종의 데이터를 합쳐도 된다는 뜻은 아닙니다.)

## 직접 해보기

1. **노트북을 만듭니다.** 터미널에서 프로젝트 폴더로 가서 환경을 켜고 JupyterLab을 엽니다.

   ```bash
   cd ~/Documents/neurodegeneration-bioinformatics
   conda activate neurobio
   jupyter lab
   ```

   왼쪽 파일 목록에서 `notebooks` 폴더로 들어가 새 노트북을 만들고, 이름을 `01_python_basics.ipynb`로 바꿉니다.

2. **맨 위에 Markdown 셀을 하나 만들어** 제목과 날짜, "모든 숫자는 가상 데이터"라는 한 줄을 적습니다.

3. **예시 1, 2, 3을 각각 다른 셀에 직접 타이핑해 실행합니다.** 복사·붙여넣기보다 손으로 치는 편이 훨씬 오래 남습니다. 출력이 위와 같은지 확인하세요.

4. **변형 1 — 기준 바꿔 보기.** 예시 1의 반복문에서 `label_direction(lfc)`를 `label_direction(lfc, cutoff=1.0)`으로 바꿔 실행합니다. "증가"와 "감소"가 몇 개로 줄어드는지 Markdown 셀에 한 줄로 적습니다. 기준 하나로 결론이 바뀐다는 것을 직접 보는 단계입니다.

5. **변형 2 — 필터 함수 만들기.** 아래 빈칸을 채워, 라벨이 "변화 작음"이 **아닌** 유전자의 이름만 리스트로 돌려주는 함수를 완성하세요.

   ```python
   def changed_genes(gene_rows, cutoff=0.5):
       result = []
       for gene in gene_rows:
           lfc = log2_fold_change(gene["control"], gene["flight"])
           if label_direction(lfc, cutoff) != "변화 작음":
               result.append(____)
       return result

   print(changed_genes(genes))
   ```

   기대하는 출력은 `['Gfap', 'Mbp', 'Casp3']`입니다.

6. **변형 3 — 샘플 단위 표.** 지금까지는 "군 평균"이 이미 계산된 표였습니다. 실제 데이터는 샘플 하나하나의 값으로 옵니다. 아래를 실행하고, 코드가 한 줄씩 무엇을 하는지 주석(`#`)을 달아 보세요.

   ```python
   samples = [
       {"sample": "S1", "group": "control", "Gfap": 9.8,  "Sod2": 8.1},
       {"sample": "S2", "group": "control", "Gfap": 10.4, "Sod2": 7.9},
       {"sample": "S3", "group": "flight",  "Gfap": 13.5, "Sod2": 8.6},
       {"sample": "S4", "group": "flight",  "Gfap": None, "Sod2": 8.2},
   ]

   def group_mean(rows, group, gene):
       values = [r[gene] for r in rows if r["group"] == group and r[gene] is not None]
       return sum(values) / len(values)

   for gene in ["Gfap", "Sod2"]:
       c = group_mean(samples, "control", gene)
       f = group_mean(samples, "flight", gene)
       print(f"{gene}: control={c:.2f}, flight={f:.2f}, 차이={f - c:+.2f}")
   ```

   출력:

   ```text
   Gfap: control=10.10, flight=13.50, 차이=+3.40
   Sod2: control=8.00, flight=8.40, 차이=+0.40
   ```

   그리고 생각해 볼 질문 하나를 Markdown 셀에 적습니다. "*Gfap*의 flight 평균 13.50은 샘플 **몇 개**로 계산된 값인가? 그 숫자를 얼마나 믿을 수 있는가?"

7. **저장, 일지, commit.** 노트북을 저장(`Cmd + S`)한 뒤 터미널에서:

   ```bash
   git add notebooks/01_python_basics.ipynb learning-log.md
   git commit -m "Day 3: 리스트·딕셔너리·함수로 유전자/임상 표 처리"
   ```

> ⚠️ **흔한 오류 1 — `KeyError: 'Age'`**
> 딕셔너리에 없는 키를 대괄호로 꺼내려 할 때 납니다. 대부분 오타이거나 대소문자가 다른 경우입니다(`"Age"` 대 `"age"`). 오류 메시지 마지막 줄에 나온 키 이름을 표의 키 이름과 글자 하나하나 비교해 보세요.

> ⚠️ **흔한 오류 2 — `TypeError: unsupported operand type(s) for +: 'int' and 'NoneType'`**
> `None`이 섞인 리스트에 `sum()`을 그대로 썼을 때 납니다. "숫자와 '없음'은 더할 수 없다"는 뜻입니다. 예시 2처럼 `if v is not None`으로 먼저 걸러 내세요.

## 퀴즈

**1.** 다음 코드의 출력은?

```python
p = {"id": "P010", "group": "PD"}
print(p.get("age", "기록 없음"))
```

- (a) `None`
- (b) `KeyError`
- (c) `기록 없음`
- (d) `age`

<details><summary>정답 보기</summary>

**(c)**. `.get(키, 기본값)`은 키가 없을 때 오류 대신 기본값을 돌려줍니다. `p["age"]`라고 썼다면 `KeyError`가 났을 것입니다.

</details>

**2.** 대조군 발현량이 8, 처리군이 2일 때 log2 fold change는 얼마인가요? (단답)

<details><summary>정답 보기</summary>

**−2**입니다. 2/8 = 1/4이고, log2(1/4) = −2입니다. 4분의 1로 줄어든 것은 4배로 늘어난 것(+2)과 크기가 같고 방향만 반대입니다. 이 대칭이 log2를 쓰는 이유입니다.

</details>

**3.** 나이 기록이 `[70, None, 60]`인 군의 평균 나이를 보고하는 방법으로 가장 적절한 것은?

- (a) `None`을 0으로 바꿔 43.3세로 보고한다.
- (b) `None`을 빼고 65.0세로 보고하되, 결측이 1명 있었다고 함께 적는다.
- (c) `None`을 다른 두 사람의 평균인 65로 채워 넣고 아무 말도 하지 않는다.
- (d) 평균을 계산할 수 없으므로 이 군을 통째로 버린다.

<details><summary>정답 보기</summary>

**(b)**. 결측은 0이 아니므로 (a)는 평균을 크게 왜곡합니다. (c)처럼 값을 채워 넣는 방법도 있지만, 그 사실을 숨기면 표본이 실제보다 많아 보입니다. 빼고 계산한 뒤 몇 개를 뺐는지 밝히는 것이 기본입니다.

</details>

**4.** 함수에서 `print`와 `return`의 차이를 한두 문장으로 설명하세요. (단답)

<details><summary>정답 보기</summary>

`print`는 값을 화면에 보여 주기만 하고, `return`은 값을 함수 밖으로 돌려주어 변수에 담거나 다른 계산에 쓸 수 있게 합니다. `print`만 있는 함수의 결과를 변수에 담으면 `None`이 들어갑니다.

</details>

**5.** `"GFAP" in {"Gfap": "신경염증"}`의 결과가 `False`인 이유와, 이것이 실제 분석에서 문제가 되는 상황을 하나 쓰세요. (단답)

<details><summary>정답 보기</summary>

Python은 대소문자를 구분하므로 `"GFAP"`과 `"Gfap"`은 서로 다른 키입니다. 마우스 유전자 표(*Gfap*)와 사람 유전자 목록(*GFAP*)을 이름으로 맞춰 볼 때, 실제로는 대응되는 유전자가 있는데도 "일치하는 것이 없다"는 결과가 나올 수 있습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/01_python_basics.ipynb`가 있고, 위에서 아래로 다시 실행해도(Run → Restart Kernel and Run All Cells) 오류가 없다.
- [ ] 예시 1–3을 직접 입력해 같은 출력을 얻었다.
- [ ] `cutoff`를 바꿨을 때 결과가 어떻게 달라지는지 한 줄로 적었다.
- [ ] `changed_genes` 함수를 완성했다.
- [ ] commit을 남겼다.

---
[← 이전](day-02.md) · [코스 지도](../../README.md) · [다음 →](day-04.md)
