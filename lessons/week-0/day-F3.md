# Day F3 — 리스트와 딕셔너리

> **주차:** 0주차 · **예상 시간:** 75–90분 · **산출물:** `notebooks/week-0/F3_lists_dicts.ipynb`

## 오늘의 목표
- 리스트를 만들고 인덱스로 원소를 꺼내고, 추가·수정할 수 있다.
- 딕셔너리로 "샘플 → 조건" 같은 짝을 저장하고 키로 값을 찾을 수 있다.
- 어떤 데이터에 리스트가 맞고 어떤 데이터에 딕셔너리가 맞는지 고를 수 있다.

## 🎬 영상으로 먼저 보기

- [Python Tutorial for Beginners 4: Lists, Tuples, and Sets — Corey Schafer](https://www.youtube.com/watch?v=W8KRzm-HUcc) (29:04)
- **무엇에 주목할까:** 리스트 부분만 보면 됩니다(튜플과 세트는 지금은 건너뛰어도 됩니다). 인덱스가 0부터 시작한다는 점과, `[0:2]` 같은 슬라이싱에서 끝 번호가 포함되지 않는다는 점에 주목하세요.

- [Python Tutorial for Beginners 5: Dictionaries - Working with Key-Value Pairs — Corey Schafer](https://www.youtube.com/watch?v=daefaLgNkw0) (9:59)
- **무엇에 주목할까:** 리스트는 "몇 번째"로 찾고 딕셔너리는 "이름(키)"으로 찾는다는 차이를 보세요. 없는 키를 찾았을 때 오류가 나는 장면과 `.get()`으로 피하는 방법도 눈여겨보세요.

## 개념 설명

### 리스트는 튜브 랙이다

어제는 값 하나를 튜브 하나(변수)에 담았습니다. 하지만 유전자가 다섯 개, 샘플이 여섯 개면 변수를 `gene1`, `gene2`, … 로 만들 수는 없습니다. 이럴 때 쓰는 것이 리스트(list)입니다. 리스트는 튜브를 순서대로 꽂아 둔 랙과 같습니다.

```python
genes = ["Gfap", "Aif1", "Tnf", "Il1b", "Sod2"]
```

대괄호 `[ ]` 안에 쉼표로 구분해 값을 나열합니다. 랙의 핵심은 **순서가 있다**는 점입니다. 그래서 "몇 번째 칸"이라는 번호로 꺼낼 수 있고, 이 번호를 인덱스(index)라고 합니다.

여기서 초보자를 가장 당황하게 하는 규칙이 나옵니다. **Python은 0부터 셉니다.** 첫 번째 칸이 0번, 두 번째 칸이 1번입니다. 건물 층수로 치면 유럽식(지상층이 0층)이라고 생각하면 됩니다. 그래서 원소가 5개인 리스트의 마지막 인덱스는 5가 아니라 4입니다. 마지막 원소는 `genes[-1]`처럼 음수로도 꺼낼 수 있는데, "뒤에서 첫 번째"라는 뜻입니다.

### 슬라이싱과 리스트 고치기

랙에서 튜브 여러 개를 한꺼번에 꺼내는 것을 슬라이싱(slicing)이라고 합니다. `genes[0:3]`은 "0번부터 3번 **앞까지**", 즉 0, 1, 2번 세 개를 꺼냅니다. 끝 번호는 포함되지 않습니다. 처음에는 어색하지만 `[0:3]`의 결과가 정확히 3개라는 점이 나름 편리합니다.

리스트는 만든 뒤에도 고칠 수 있습니다. `genes.append("Mbp")`는 랙 맨 끝에 튜브를 하나 더 꽂고, `genes[0] = "GFAP"`는 0번 칸의 튜브를 바꿔 꽂습니다. `len(genes)`는 랙에 꽂힌 개수를 세고, `"Tnf" in genes`는 "이 랙에 Tnf가 있나?"를 `True`/`False`로 답합니다.

숫자로 된 리스트에는 `max()`, `min()`, `sum()`을 쓸 수 있습니다. 평균은 `sum(values) / len(values)`로 직접 구할 수 있습니다. 합계를 개수로 나눈다는, 손으로 계산할 때와 같은 방법입니다.

### 딕셔너리는 샘플 시트다

리스트는 "몇 번째"로 찾습니다. 그런데 "S3 샘플은 어느 군이었지?"라는 질문에는 번호보다 **이름**으로 찾는 편이 자연스럽습니다. 실험실의 샘플 시트를 떠올려 보세요. 왼쪽 칸에 샘플 ID, 오른쪽 칸에 조건이 적혀 있고, ID를 찾으면 조건을 알 수 있습니다. 딕셔너리(dictionary, 줄여서 dict)가 바로 그것입니다.

```python
sample_condition = {"S1": "flight", "S3": "ground"}
```

중괄호 `{ }` 안에 `키: 값` 짝을 나열합니다. 찾을 때 쓰는 이름이 키(key), 찾아지는 내용이 값(value)입니다. `sample_condition["S3"]`이라고 하면 `"ground"`가 나옵니다. 국어사전에서 단어(키)를 찾아 뜻(값)을 읽는 것과 같아서 이름이 dictionary입니다.

규칙 두 가지. 첫째, 키는 중복될 수 없습니다. 같은 샘플 ID가 두 줄 있으면 안 되는 것과 같습니다. 둘째, 없는 키를 찾으면 `KeyError`가 납니다. 대소문자도 구분하므로 `"S1"`과 `"s1"`은 다른 키입니다. 값 자리에는 무엇이든 들어갈 수 있어서, 유전자 이름을 키로 하고 발현값 리스트를 값으로 넣을 수도 있습니다(예시 4). 내일 배울 반복문과, F6에서 배울 표(DataFrame)가 모두 이 두 구조 위에 서 있습니다.

## 예시로 이해하기

> 유전자 이름과 숫자는 모두 연습용 **가상 값**입니다.

### 예시 1 — 리스트에서 꺼내기

```python
genes = ["Gfap", "Aif1", "Tnf", "Il1b", "Sod2"]

print(genes)
print(len(genes))
print(genes[0])
print(genes[1])
print(genes[-1])
print(genes[0:3])
```

출력:

```text
['Gfap', 'Aif1', 'Tnf', 'Il1b', 'Sod2']
5
Gfap
Aif1
Sod2
['Gfap', 'Aif1', 'Tnf']
```

`genes[0]`이 첫 번째, `genes[-1]`이 마지막입니다. `genes[0:3]`은 3번(`Il1b`)을 포함하지 않습니다.

### 예시 2 — 리스트 고치기와 숫자 리스트

```python
genes = ["Gfap", "Aif1", "Tnf"]

genes.append("Mbp")
print(genes)

genes[0] = "GFAP"
print(genes)

print("Tnf" in genes)
print("Snca" in genes)

values = [12.5, 3.2, 8.9, 15.1]
print(max(values))
print(min(values))
print(sum(values))
print(sum(values) / len(values))
print(sorted(values))
```

출력:

```text
['Gfap', 'Aif1', 'Tnf', 'Mbp']
['GFAP', 'Aif1', 'Tnf', 'Mbp']
True
False
15.1
3.2
39.7
9.925
[3.2, 8.9, 12.5, 15.1]
```

### 예시 3 — 샘플 → 조건 딕셔너리

```python
sample_condition = {
    "S1": "flight",
    "S2": "flight",
    "S3": "ground",
    "S4": "ground",
}

print(sample_condition["S1"])
print(sample_condition["S3"])
print(len(sample_condition))

sample_condition["S5"] = "flight"
print(sample_condition)

print(list(sample_condition.keys()))
print(list(sample_condition.values()))
print("S9" in sample_condition)
print(sample_condition.get("S9", "정보 없음"))
```

출력:

```text
flight
ground
4
{'S1': 'flight', 'S2': 'flight', 'S3': 'ground', 'S4': 'ground', 'S5': 'flight'}
['S1', 'S2', 'S3', 'S4', 'S5']
['flight', 'flight', 'ground', 'ground', 'flight']
False
정보 없음
```

새 짝을 추가할 때는 `딕셔너리[새키] = 값`이라고 쓰면 됩니다. `.get(키, 기본값)`은 키가 없어도 오류 대신 기본값을 돌려줍니다.

### 예시 4 — 딕셔너리 안에 리스트

유전자마다 샘플 3개의 발현값이 있는 경우입니다.

```python
expression = {
    "Gfap": [12.5, 14.1, 13.3],
    "Tnf": [2.1, 1.8, 2.4],
}

print(expression["Gfap"])
print(expression["Gfap"][0])

gfap_mean = sum(expression["Gfap"]) / len(expression["Gfap"])
print(round(gfap_mean, 2))
```

출력:

```text
[12.5, 14.1, 13.3]
12.5
13.3
```

`expression["Gfap"]`으로 리스트를 꺼내고, 거기에 다시 `[0]`을 붙여 첫 번째 값을 꺼냈습니다. `round(값, 2)`는 소수 둘째 자리까지 반올림합니다.

## 직접 해보기

1. JupyterLab을 켜고(`conda activate neurobio` → 프로젝트 폴더로 `cd` → `jupyter lab`) `notebooks/week-0/F3_lists_dicts.ipynb`를 만듭니다.

2. 예시 1–4를 셀 하나씩 직접 타이핑해 실행합니다.

3. **내 유전자 리스트.** 관심 있는 유전자 4개로 `my_genes` 리스트를 만들고, 첫 번째·마지막 원소와 길이를 출력합니다. `append`로 하나를 더 넣은 뒤 길이가 5가 됐는지 확인합니다.

4. **발현값 요약.** `values = [5.0, 7.5, 6.5, 9.0]`의 최댓값, 최솟값, 평균을 출력합니다. 평균은 7.0이 나와야 합니다.

5. **샘플 시트 만들기.** 샘플 6개(`"M1"`–`"M6"`)에 대해 앞의 3개는 `"flight"`, 뒤의 3개는 `"ground"`인 딕셔너리 `my_samples`를 만듭니다. `my_samples["M4"]`가 `"ground"`인지 확인합니다.

6. **일부러 오류 내 보기 (두 가지).**

   ```python
   genes = ["Gfap", "Aif1", "Tnf"]
   print(genes[3])
   ```

   마지막 줄: `IndexError: list index out of range` — 원소가 3개면 인덱스는 0, 1, 2까지입니다.

   ```python
   sample_condition = {"S1": "flight"}
   print(sample_condition["s1"])
   ```

   마지막 줄: `KeyError: 's1'` — 키는 대소문자를 구분합니다.

   두 셀 모두 올바르게 고쳐서 실행되게 만듭니다.

7. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — 0부터 세기.** "세 번째 유전자"를 꺼내려고 `genes[3]`을 쓰면 네 번째가 나오거나 `IndexError`가 납니다. 세 번째는 `genes[2]`입니다. 헷갈리면 `print(genes)`로 전체를 찍어 놓고 0부터 손가락으로 세어 보세요.

⚠️ **흔한 오류 2 — 괄호 종류.** 리스트는 `[ ]`, 딕셔너리는 `{ }`로 **만들고**, 꺼낼 때는 둘 다 `[ ]`를 씁니다(`genes[0]`, `sample_condition["S1"]`). 여는 괄호와 닫는 괄호 짝이 안 맞으면 `SyntaxError`가 납니다.

## 퀴즈

**1.** `genes = ["Gfap", "Aif1", "Tnf", "Il1b"]`일 때 `genes[2]`는?

(a) `"Aif1"` (b) `"Tnf"` (c) `"Il1b"` (d) 오류

<details><summary>정답 보기</summary>

(b) `"Tnf"`. 인덱스는 0부터 시작하므로 0번이 Gfap, 1번이 Aif1, 2번이 Tnf입니다.

</details>

**2.** 같은 리스트에서 `genes[1:3]`의 결과는? (단답)

<details><summary>정답 보기</summary>

`['Aif1', 'Tnf']`. 슬라이싱은 시작 번호(1)는 포함하고 끝 번호(3)는 포함하지 않습니다. 그래서 1번과 2번, 두 개가 나옵니다.

</details>

**3.** "샘플 ID로 그 샘플의 조건(flight/ground)을 찾고 싶다." 어떤 구조가 알맞나요?

(a) 리스트 (b) 딕셔너리 (c) 문자열 (d) 불리언

<details><summary>정답 보기</summary>

(b) 딕셔너리. 번호가 아니라 이름(샘플 ID)으로 값을 찾아야 하므로 키-값 짝을 저장하는 딕셔너리가 맞습니다. 리스트로 하면 "S3가 몇 번째였지?"를 따로 기억해야 합니다.

</details>

**4.** `d = {"Gfap": 12.5}`에서 `d["Tnf"]`를 실행하면 어떻게 되나요? 오류 없이 처리하는 방법도 하나 쓰세요. (단답)

<details><summary>정답 보기</summary>

`KeyError: 'Tnf'`가 납니다. 없는 키를 찾았기 때문입니다. `d.get("Tnf", "정보 없음")`처럼 `.get()`을 쓰거나, 먼저 `"Tnf" in d`로 있는지 확인하면 오류를 피할 수 있습니다.

</details>

**5.** `values = [2.0, 4.0, 6.0]`의 평균을 구하는 코드로 알맞은 것은?

(a) `sum(values)` (b) `len(values) / sum(values)` (c) `sum(values) / len(values)` (d) `max(values) / 2`

<details><summary>정답 보기</summary>

(c). 평균은 합계를 개수로 나눈 값이므로 12.0 / 3 = 4.0입니다. (b)는 분자와 분모가 뒤바뀌었습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `F3_lists_dicts.ipynb`에 예시 1–4가 실행되어 있다.
- [ ] `my_genes` 리스트와 `my_samples` 딕셔너리를 직접 만들었다.
- [ ] `IndexError`와 `KeyError`를 일부러 내 보고 고쳤다.
- [ ] 인덱스가 0부터 시작한다는 것을 예를 들어 설명할 수 있다.

---
[← 이전](day-F2.md) · [코스 지도](../../README.md) · [다음 →](day-F4.md)
