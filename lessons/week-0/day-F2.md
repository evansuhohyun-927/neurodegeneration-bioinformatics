# Day F2 — 변수와 자료형

> **주차:** 0주차 · **예상 시간:** 75–90분 · **산출물:** `notebooks/week-0/F2_variables.ipynb`

## 오늘의 목표
- 변수에 값을 담고 꺼내 쓸 수 있다.
- 숫자(`int`, `float`), 문자열(`str`), 불리언(`bool`)을 구분하고 `type()`으로 확인할 수 있다.
- 문자열로 된 숫자를 진짜 숫자로 바꿔 계산할 수 있다.

## 🎬 영상으로 먼저 보기

- [Python Tutorial for Beginners 3: Integers and Floats - Working with Numeric Data — Corey Schafer](https://www.youtube.com/watch?v=khKv-8q7YmY) (11:55)
- **무엇에 주목할까:** 정수와 소수가 따로 있다는 점, 그리고 `+ - * /` 외에 `//`, `%`, `**` 같은 연산 기호가 있다는 점만 보세요. 비교 연산(`>`, `==`)의 결과가 `True`/`False`로 나오는 장면도 눈여겨보세요.

- [Python Tutorial for Beginners 2: Strings - Working with Textual Data — Corey Schafer](https://www.youtube.com/watch?v=k9TUPpGqYTo) (21:11)
- **무엇에 주목할까:** 글자는 반드시 따옴표로 감싼다는 것, 그리고 `.upper()`처럼 점을 찍고 부르는 기능(메서드)이 있다는 것에 주목하세요. 후반의 f-string은 오늘 예시 3에서 바로 씁니다.

## 개념 설명

### 변수는 라벨 붙인 튜브다

실험할 때 튜브에 "Gfap, flight, #1"이라고 라벨을 붙입니다. 라벨이 없으면 안에 뭐가 들었는지 알 수 없고, 라벨이 있으면 이름만 불러도 그 튜브를 집을 수 있습니다. 변수(variable)는 바로 이 라벨 붙인 튜브입니다.

```python
gene = "Gfap"
```

이 한 줄은 "`gene`이라는 라벨의 튜브에 `"Gfap"`이라는 글자를 담아라"는 뜻입니다. 여기서 `=`는 수학의 "같다"가 아니라 "오른쪽 값을 왼쪽 이름에 담아라"는 대입(assignment)입니다. "같은가?"를 묻고 싶을 때는 `==`(등호 두 개)를 씁니다. 초보자가 가장 자주 헷갈리는 부분이니 지금 확실히 구분해 두세요.

이름은 자유롭게 지을 수 있지만 규칙이 있습니다. 영문자·숫자·밑줄(`_`)만 쓰고, 숫자로 시작할 수 없고, 띄어쓰기는 안 됩니다. 그래서 여러 단어는 `n_samples`처럼 밑줄로 잇습니다. 대소문자도 구분해서 `Gene`과 `gene`은 서로 다른 튜브입니다. `x`, `a` 같은 이름보다 `expression`, `threshold`처럼 내용이 드러나는 이름이 좋습니다. 석 달 뒤의 내가 읽어도 이해할 수 있어야 하니까요.

### 자료형: 튜브 안에 든 것의 종류

튜브에 든 것이 DNA인지 단백질인지에 따라 할 수 있는 실험이 다르듯, 값도 종류에 따라 할 수 있는 일이 다릅니다. 이 종류를 자료형(data type)이라고 합니다. 오늘은 네 가지만 봅니다.

- **정수 `int`** (integer): `6`, `-2`, `1000`. 샘플 수, 마우스 마릿수처럼 "세는" 값.
- **실수 `float`** (floating point): `12.5`, `0.05`. 발현값, p-value처럼 소수점이 있는 값.
- **문자열 `str`** (string): `"Gfap"`, `"flight"`. 따옴표로 감싼 글자. 유전자 이름, 샘플 ID, 조건 이름.
- **불리언 `bool`** (boolean): `True` 또는 `False` 딱 두 가지. "대조군인가?", "임계값을 넘었나?" 같은 예/아니오.

값의 자료형이 궁금하면 `type(값)`으로 물어봅니다. 주의할 점 하나: `12.5`와 `"12.5"`는 다릅니다. 앞의 것은 숫자라서 계산할 수 있고, 뒤의 것은 따옴표로 감싼 글자라서 "1, 2, 점, 5"라는 문자 네 개일 뿐입니다. 파일에서 데이터를 읽을 때 숫자가 글자로 들어오는 일이 흔해서, 이 차이를 아는 것이 나중에 큰 도움이 됩니다.

### 연산과 비교

숫자끼리는 `+`, `-`, `*`(곱하기), `/`(나누기)를 씁니다. 추가로 `**`는 거듭제곱(`2 ** 10`은 1024), `//`는 몫, `%`는 나머지입니다. 나누기 `/`의 결과는 항상 실수(`float`)로 나옵니다.

문자열에도 `+`를 쓸 수 있는데, 이때는 더하기가 아니라 "이어 붙이기"입니다. `"Gfap" + "_mouse"`는 `"Gfap_mouse"`가 됩니다. 문자열과 숫자를 `+`로 섞으면 Python은 "더하라는 건지 붙이라는 건지 모르겠다"며 오류를 냅니다. 사람이라면 눈치껏 처리하겠지만 컴퓨터는 눈치가 없습니다. 이럴 때는 `float("12.5")`처럼 자료형을 명시적으로 바꿔 줍니다. 이것을 형 변환(type conversion)이라고 합니다.

비교 연산자 `>`, `<`, `>=`, `<=`, `==`, `!=`(다르다)의 결과는 언제나 `True` 아니면 `False`입니다. "발현값이 임계값보다 큰가?"라는 질문에 컴퓨터가 예/아니오로 답하는 셈이고, 이 답이 F4에서 배울 조건문의 재료가 됩니다.

## 예시로 이해하기

> 이 레슨의 유전자 이름과 숫자는 모두 연습용 **가상 값**입니다. 실제 데이터셋의 값이 아닙니다.

### 예시 1 — 네 가지 자료형 만들어 보기

```python
gene = "Gfap"
expression = 12.5
n_samples = 6
is_control = True

print(gene)
print(expression)
print(n_samples)
print(is_control)
print(type(gene))
print(type(expression))
print(type(n_samples))
print(type(is_control))
```

출력:

```text
Gfap
12.5
6
True
<class 'str'>
<class 'float'>
<class 'int'>
<class 'bool'>
```

`True`는 따옴표 없이, 첫 글자 대문자로 씁니다. `"True"`라고 쓰면 불리언이 아니라 문자열이 됩니다.

### 예시 2 — 숫자 계산

우주비행군(flight)과 지상 대조군(ground)의 가상 발현값으로 차이와 비율을 구합니다.

```python
flight = 250.0
ground = 100.0

difference = flight - ground
ratio = flight / ground

print(difference)
print(ratio)
print(7 / 2)
print(7 // 2)
print(7 % 2)
print(2 ** 10)
```

출력:

```text
150.0
2.5
3.5
3
1
1024
```

`ratio`가 2.5라는 것은 flight가 ground의 2.5배라는 뜻입니다. 이 "비율"이 F5에서 함수로 만들 fold change입니다.

### 예시 3 — 문자열 다루기와 f-string

```python
gene = "gfap"
print(gene.upper())
print(gene.capitalize())
print(len(gene))
print(gene + "_mouse")

expression = 12.5
print(f"{gene} 유전자의 발현값은 {expression}입니다.")
```

출력:

```text
GFAP
Gfap
4
gfap_mouse
gfap 유전자의 발현값은 12.5입니다.
```

`.upper()`처럼 값 뒤에 점을 찍고 부르는 기능을 메서드(method)라고 합니다. `len()`은 길이(글자 수)를 셉니다. 따옴표 앞에 `f`를 붙인 f-string은 `{ }` 안의 변수를 값으로 바꿔 끼워 넣어 줍니다. 결과를 문장으로 출력할 때 가장 편한 방법입니다.

### 예시 4 — 비교하면 bool이 나온다

```python
expression = 12.5
threshold = 10

print(expression > threshold)
print(expression == threshold)
print(expression != threshold)

is_high = expression > threshold
print(is_high)
print(type(is_high))
```

출력:

```text
True
False
True
True
<class 'bool'>
```

비교 결과도 변수에 담을 수 있습니다. `is_high`에는 숫자가 아니라 "예"라는 답(`True`)이 들어 있습니다.

### 예시 5 — 글자 "12.5"를 숫자 12.5로

```python
value_text = "12.5"
print(type(value_text))

value_number = float(value_text)
print(value_number + 1)
print(int("6") * 2)
print(str(12.5) + " TPM")
```

출력:

```text
<class 'str'>
13.5
12
12.5 TPM
```

`float()`, `int()`, `str()`은 각각 실수, 정수, 문자열로 바꿔 주는 도구입니다.

## 직접 해보기

1. 터미널을 열고 환경을 켠 뒤 JupyterLab을 실행합니다.

   ```bash
   conda activate neurobio
   cd ~/Documents/neurodegeneration-bioinformatics
   jupyter lab
   ```

2. `notebooks/week-0/`에 새 노트북을 만들고 이름을 `F2_variables.ipynb`로 바꿉니다.

3. 예시 1–5를 **셀 하나에 예시 하나씩** 직접 타이핑해서 실행합니다. 복사·붙여넣기보다 직접 치는 편이 훨씬 잘 남습니다.

4. **내 변수 만들기.** 좋아하는 유전자 하나를 골라 아래 네 변수를 만들고 `print`와 `type`으로 확인합니다.
   - `my_gene` (문자열), `my_expression` (실수), `my_n` (정수), `my_is_flight` (불리언)

5. **비율 계산.** `flight = 80.0`, `ground = 160.0`으로 `ratio`를 구해 출력합니다. 0.5가 나와야 합니다. 그리고 `ratio < 1`을 출력해 `True`가 나오는지 확인합니다.

6. **일부러 오류 내 보기.** 새 셀에 아래를 실행합니다.

   ```python
   value_text = "12.5"
   print(value_text + 1)
   ```

   빨간 오류 메시지의 맨 마지막 줄이 아래와 같은지 확인합니다.

   ```text
   TypeError: can only concatenate str (not "int") to str
   ```

   "문자열에는 문자열만 이어 붙일 수 있다(정수는 안 된다)"는 뜻입니다. `float(value_text) + 1`로 고쳐서 13.5가 나오게 합니다.

7. 노트북을 저장(`Cmd + S`)합니다.

⚠️ **흔한 오류 1 — `NameError: name 'Gfap' is not defined`.** `gene = Gfap`처럼 따옴표를 빼먹으면 Python은 `Gfap`이라는 변수를 찾으려 합니다. 글자 값은 반드시 `"Gfap"`처럼 따옴표로 감쌉니다.

⚠️ **흔한 오류 2 — 셀 실행 순서.** 노트북은 셀을 **실행한 순서대로** 기억합니다. 위쪽 셀에서 변수를 만들어 놓고 실행하지 않은 채 아래 셀을 돌리면 `NameError`가 납니다. 헷갈리면 메뉴의 **Run → Run All Cells**로 처음부터 차례로 돌리세요.

## 퀴즈

**1.** 다음 중 자료형이 `str`인 것은?

(a) `12.5` (b) `True` (c) `"12.5"` (d) `6`

<details><summary>정답 보기</summary>

(c). 따옴표로 감싸면 안에 숫자가 들어 있어도 문자열입니다. (a)는 `float`, (b)는 `bool`, (d)는 `int`입니다.

</details>

**2.** `=`와 `==`의 차이를 한 문장으로 설명하세요. (단답)

<details><summary>정답 보기</summary>

`=`는 오른쪽 값을 왼쪽 변수에 담는 대입이고, `==`는 양쪽이 같은지 물어 `True`/`False`를 돌려주는 비교입니다. `x = 5`는 x에 5를 넣고, `x == 5`는 "x가 5인가?"를 묻습니다.

</details>

**3.** `print(7 // 2)`의 출력은?

(a) `3.5` (b) `3` (c) `1` (d) `4`

<details><summary>정답 보기</summary>

(b) `3`. `//`는 나눗셈의 몫만 돌려줍니다. `7 / 2`는 3.5, `7 % 2`는 나머지인 1입니다.

</details>

**4.** `"Gfap" + "_mouse"`의 결과는? (단답)

<details><summary>정답 보기</summary>

`"Gfap_mouse"`. 문자열끼리의 `+`는 더하기가 아니라 이어 붙이기입니다. 한쪽이 숫자면 `TypeError`가 납니다.

</details>

**5.** `expression = 3.0`, `threshold = 10`일 때 `expression > threshold`의 값과 자료형은?

<details><summary>정답 보기</summary>

값은 `False`, 자료형은 `bool`입니다. 3.0은 10보다 크지 않으므로 "아니오"라는 답이 나옵니다. 비교 연산의 결과는 항상 불리언입니다.

</details>

## 더 알아보기

> **📚 R에서는 1부터 셉니다**
> Python은 첫 원소를 0번으로 세지만 R은 1번부터 셉니다. 더 헷갈리는 것은 음수 인덱스로, Python의 `v[-1]`은 마지막 원소이지만 R의 `v[-1]`은 "첫 원소를 뺀 나머지"입니다. 또 R은 범위를 넘는 위치를 요청해도 오류 대신 `NA`를 돌려줍니다. R 코드를 읽을 일이 생기면 이 세 가지부터 떠올리세요.
> → [심화 A — Day A2: 벡터, 자료형, 부분 선택: R의 기본 단위 다루기](../advanced/A-r-bioconductor/day-A2.md)

## 오늘의 산출물 체크리스트
- [ ] `F2_variables.ipynb`에 예시 1–5가 직접 타이핑되어 실행되어 있다.
- [ ] 내가 지은 변수 4개(`my_gene` 등)의 `type`을 확인했다.
- [ ] `TypeError`를 일부러 내 보고 `float()`로 고쳤다.
- [ ] `=`와 `==`의 차이를 말로 설명할 수 있다.

---
[← 이전](day-F1.md) · [코스 지도](../../README.md) · [다음 →](day-F3.md)
