# Day F4 — 조건문과 반복문

> **주차:** 0주차 · **예상 시간:** 75–90분 · **산출물:** `notebooks/week-0/F4_if_for.ipynb`

## 오늘의 목표
- `if` / `elif` / `else`로 값에 따라 다른 일을 하게 만들 수 있다.
- `for` 반복문으로 리스트와 딕셔너리의 원소를 하나씩 처리할 수 있다.
- 반복문 안에 조건문을 넣어 임계값을 넘는 유전자만 골라낼 수 있다.

## 🎬 영상으로 먼저 보기

- [Python Tutorial for Beginners 6: Conditionals and Booleans - If, Else, and Elif Statements — Corey Schafer](https://www.youtube.com/watch?v=DZwmZ8Usvnk) (16:28)
- **무엇에 주목할까:** `if` 줄 끝의 콜론(`:`)과 그 아랫줄의 들여쓰기를 눈여겨보세요. 조건이 참일 때만 들여쓴 줄이 실행된다는 것이 핵심입니다. `and`, `or`, `not`은 가볍게 보고 넘어가도 됩니다.

- [Python Tutorial for Beginners 7: Loops and Iterations - For/While Loops — Corey Schafer](https://www.youtube.com/watch?v=6iF8Xb7Z3wQ) (10:14)
- **무엇에 주목할까:** `for` 반복문 부분에 집중하세요. 반복이 한 바퀴 돌 때마다 변수에 다음 원소가 차례로 담기는 모습을 따라가면 됩니다. `while`과 `break`/`continue`는 지금은 몰라도 괜찮습니다.

## 개념 설명

### 조건문은 프로토콜의 "만약 ~이면"이다

실험 프로토콜에는 이런 문장이 흔합니다. "RNA 농도가 50 ng/µL 이상이면 다음 단계로, 아니면 다시 추출." 상황에 따라 할 일이 달라지는 것이죠. 코드에서 이 역할을 하는 것이 조건문(conditional)입니다.

```python
if expression > 10:
    print("발현이 높다")
else:
    print("발현이 높지 않다")
```

`if` 뒤에는 F2에서 배운 비교식, 즉 `True`나 `False`가 되는 식이 옵니다. 참이면 바로 아래 들여쓴 줄을 실행하고, 거짓이면 `else` 아래를 실행합니다. 경우가 셋 이상이면 사이에 `elif`(else if의 줄임)를 끼웁니다. Python은 위에서부터 차례로 확인하다가 **처음으로 참이 되는 한 곳만** 실행하고 나머지는 건너뜁니다.

문법에서 두 가지만 지키면 됩니다. 조건 줄 끝에는 콜론(`:`)을 붙이고, 그 조건에 속하는 줄은 스페이스 4칸 들여씁니다. 다른 언어는 중괄호로 묶지만 Python은 **들여쓰기 자체가 "이 줄은 저 조건 소속"이라는 표시**입니다. 들여쓰기가 틀리면 오류가 나거나, 더 나쁘게는 오류 없이 엉뚱하게 동작합니다. JupyterLab에서는 콜론 뒤에 Enter를 치면 자동으로 들여써 줍니다.

### 반복문은 멀티채널 피펫이다

96-well 플레이트의 well마다 같은 시약을 넣어야 한다면, 한 칸씩 96번 반복하는 대신 멀티채널 피펫을 씁니다. 같은 동작을 여러 대상에 되풀이하는 것, 이것이 반복문(loop)입니다.

```python
for gene in genes:
    print(gene)
```

읽는 법은 "`genes` 안의 원소를 하나씩 꺼내 `gene`이라는 이름에 담고, 그때마다 아래 들여쓴 줄을 실행하라"입니다. 리스트에 유전자가 3개면 3번, 2만 개면 2만 번 실행됩니다. 코드는 똑같이 두 줄입니다. 이것이 손으로 엑셀을 고치는 것과 코드로 분석하는 것의 결정적 차이입니다.

`gene`이라는 이름은 내가 정하는 것입니다. `for x in genes:`라고 써도 동작하지만, 리스트 이름은 복수형(`genes`), 꺼낸 원소는 단수형(`gene`)으로 쓰면 읽기 쉽습니다. 조건문과 마찬가지로 줄 끝에 콜론, 반복할 내용은 들여쓰기입니다. 들여쓰기가 끝난 줄부터는 반복이 다 끝난 뒤에 한 번만 실행됩니다.

### 둘을 합치면 필터가 된다

반복문 안에 조건문을 넣으면 "하나씩 꺼내 보고, 조건에 맞는 것만 따로 모으기"가 됩니다. 세포를 하나씩 확인해 형광 신호가 기준을 넘는 것만 분류하는 FACS와 같은 원리입니다.

패턴은 항상 같습니다. ① 빈 리스트를 하나 만든다. ② 반복문으로 하나씩 꺼낸다. ③ 조건에 맞으면 `append`로 빈 리스트에 넣는다. 이 세 단계를 필터링(filtering)이라고 부릅니다. 개수를 세고 싶을 때도 비슷해서, 0으로 시작하는 변수를 만들고 조건에 맞을 때마다 1씩 더합니다.

딕셔너리를 반복할 때는 `.items()`를 붙이면 키와 값을 한 번에 꺼낼 수 있습니다. `for gene, value in expression.items():`라고 쓰면 바퀴마다 `gene`에는 유전자 이름이, `value`에는 발현값이 담깁니다.

나중에 pandas를 배우면 이런 필터링을 한 줄로 쓰게 됩니다. 하지만 그 한 줄이 속으로 하는 일이 바로 오늘의 "반복 + 조건"입니다. 원리를 알고 쓰는 것과 주문처럼 외워 쓰는 것은 오류를 만났을 때 큰 차이를 만듭니다.

## 예시로 이해하기

> 유전자 이름과 숫자는 모두 연습용 **가상 값**이고, 임계값(5, 10 등)도 설명을 위해 임의로 정한 것입니다.

### 예시 1 — if / elif / else

```python
expression = 4.0

if expression > 10:
    label = "high"
elif expression > 3:
    label = "medium"
else:
    label = "low"

print(label)
```

출력:

```text
medium
```

4.0은 10보다 크지 않으니 첫 조건은 거짓, 3보다는 크니 두 번째 조건이 참입니다. `expression`을 `12.5`나 `1.0`으로 바꿔 다시 실행해 보세요.

### 예시 2 — for로 하나씩 꺼내기

```python
genes = ["Gfap", "Aif1", "Tnf"]

for gene in genes:
    print(f"지금 보는 유전자: {gene}")

print("반복 끝")
```

출력:

```text
지금 보는 유전자: Gfap
지금 보는 유전자: Aif1
지금 보는 유전자: Tnf
반복 끝
```

들여쓴 줄은 3번, 들여쓰지 않은 마지막 줄은 1번만 실행됐습니다.

### 예시 3 — 임계값을 넘는 유전자만 고르기

```python
expression = {
    "Gfap": 12.5,
    "Aif1": 8.9,
    "Tnf": 2.1,
    "Il1b": 1.4,
    "Sod2": 15.1,
}
threshold = 5

high_genes = []

for gene, value in expression.items():
    if value > threshold:
        high_genes.append(gene)

print(high_genes)
print(f"임계값 {threshold} 초과 유전자 수: {len(high_genes)}")
```

출력:

```text
['Gfap', 'Aif1', 'Sod2']
임계값 5 초과 유전자 수: 3
```

`if` 줄은 `for`에 속하므로 4칸, `append` 줄은 `if`에 속하므로 8칸 들여썼습니다. `threshold`를 10으로 바꾸면 결과가 어떻게 달라질지 먼저 예상한 뒤 실행해 보세요.

### 예시 4 — 조건별 샘플 수 세기

데이터를 받으면 가장 먼저 "각 군에 샘플이 몇 개인가"를 확인합니다. 그 일을 손으로 짜 봅니다.

```python
sample_condition = {
    "S1": "flight",
    "S2": "flight",
    "S3": "ground",
    "S4": "ground",
    "S5": "flight",
}

n_flight = 0
n_ground = 0

for sample, condition in sample_condition.items():
    if condition == "flight":
        n_flight = n_flight + 1
    elif condition == "ground":
        n_ground = n_ground + 1

print(f"flight: {n_flight}개, ground: {n_ground}개")
```

출력:

```text
flight: 3개, ground: 2개
```

`n_flight = n_flight + 1`은 "지금 값에 1을 더해 다시 담아라"는 뜻입니다. 수학식으로는 이상하지만 `=`가 대입이라는 것을 떠올리면 자연스럽습니다.

### 예시 5 — 비율로 방향 판정하기

```python
flight = {"Gfap": 250.0, "Tnf": 30.0, "Sod2": 80.0}
ground = {"Gfap": 100.0, "Tnf": 28.0, "Sod2": 160.0}

for gene in flight:
    ratio = flight[gene] / ground[gene]
    if ratio >= 2:
        direction = "증가"
    elif ratio <= 0.5:
        direction = "감소"
    else:
        direction = "큰 변화 없음"
    print(f"{gene}: 비율 {round(ratio, 2)} → {direction}")
```

출력:

```text
Gfap: 비율 2.5 → 증가
Tnf: 비율 1.07 → 큰 변화 없음
Sod2: 비율 0.5 → 감소
```

딕셔너리를 `.items()` 없이 반복하면 키만 하나씩 나옵니다. 같은 키로 두 딕셔너리에서 값을 꺼내 비율을 구했습니다. 참고로 실제 분석에서는 이렇게 비율 하나로 "증가/감소"를 단정하지 않습니다. 반복 샘플의 흩어짐과 통계 검정을 함께 봐야 하고, 그 내용은 2주차에 다룹니다.

## 직접 해보기

1. JupyterLab을 켜고 `notebooks/week-0/F4_if_for.ipynb`를 만듭니다.

2. 예시 1–5를 셀 하나씩 직접 타이핑해 실행합니다. 들여쓰기는 JupyterLab이 자동으로 넣어 주는 것을 그대로 쓰세요.

3. **예시 1 바꿔 보기.** `expression`을 `12.5`, `4.0`, `1.0`으로 바꿔 가며 `high`, `medium`, `low`가 차례로 나오는지 확인합니다.

4. **숫자 반복.** 아래를 실행해 `range(3)`이 0, 1, 2를 차례로 내놓는 것을 확인하고, 리스트의 합과 평균을 반복문으로 직접 구합니다.

   ```python
   for i in range(3):
       print(i)

   values = [12.5, 3.2, 8.9]
   total = 0
   for v in values:
       total = total + v
   print(total)
   print(round(total / len(values), 2))
   ```

   출력:

   ```text
   0
   1
   2
   24.6
   8.2
   ```

5. **낮은 유전자 고르기.** 예시 3의 `expression` 딕셔너리에서 발현값이 `3` **미만**인 유전자만 모은 `low_genes` 리스트를 만듭니다. `['Tnf', 'Il1b']`가 나와야 합니다.

6. **세 구간으로 나누기.** 예시 3의 딕셔너리를 반복하면서 유전자마다 예시 1의 기준(`> 10` high, `> 3` medium, 나머지 low)으로 라벨을 붙여 `Gfap: high`처럼 한 줄씩 출력합니다. Gfap·Sod2는 high, Aif1은 medium, Tnf·Il1b는 low가 나와야 합니다.

7. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — 콜론 빼먹기.** `for gene in genes` 뒤에 `:`가 없으면 `SyntaxError: expected ':'`가 납니다. `if`, `elif`, `else`, `for` 줄은 모두 콜론으로 끝납니다.

⚠️ **흔한 오류 2 — 들여쓰기.** `for` 아랫줄을 들여쓰지 않으면 `IndentationError: expected an indented block`이 납니다. 반대로, 오류는 안 나는데 결과가 이상하다면 `print`가 반복문 **안**에 있는지 **밖**에 있는지(들여썼는지)부터 확인하세요. 예시 3에서 `print(high_genes)`를 8칸 들여쓰면 유전자를 넣을 때마다 리스트가 출력됩니다.

## 퀴즈

**1.** 아래 코드의 출력은?

```python
value = 10
if value > 10:
    print("A")
elif value >= 10:
    print("B")
else:
    print("C")
```

(a) A (b) B (c) C (d) A와 B

<details><summary>정답 보기</summary>

(b) B. 10은 10보다 "크지" 않으므로 첫 조건은 거짓이고, `>=`(크거나 같다)는 참입니다. `if`-`elif`-`else`는 처음 참이 된 한 곳만 실행하므로 B만 출력됩니다.

</details>

**2.** `for gene in ["Gfap", "Tnf", "Sod2", "Mbp"]:` 아래의 들여쓴 줄은 몇 번 실행되나요? (단답)

<details><summary>정답 보기</summary>

4번. 리스트의 원소 개수만큼 실행되고, 매번 `gene`에 다음 원소가 담깁니다.

</details>

**3.** Python에서 "이 줄은 저 `if`에 속한다"를 나타내는 방법은?

(a) 중괄호 `{ }` (b) 세미콜론 `;` (c) 들여쓰기 (d) 괄호 `( )`

<details><summary>정답 보기</summary>

(c) 들여쓰기. Python은 들여쓰기 자체가 문법입니다. 그래서 들여쓰기가 틀리면 오류가 나거나 의도와 다르게 동작합니다.

</details>

**4.** 필터링 패턴의 세 단계를 순서대로 쓰세요. (단답)

<details><summary>정답 보기</summary>

① 빈 리스트를 만든다 → ② 반복문으로 원소를 하나씩 꺼낸다 → ③ 조건에 맞으면 `append`로 빈 리스트에 넣는다. 빈 리스트를 반복문 **밖**(앞)에서 만들어야 한다는 점이 중요합니다. 안에서 만들면 바퀴마다 다시 비워집니다.

</details>

**5.** `expression = {"Gfap": 12.5, "Tnf": 2.1}`일 때, 유전자 이름과 값을 함께 꺼내는 올바른 반복문은?

(a) `for gene, value in expression:` (b) `for gene, value in expression.items():` (c) `for expression in gene:` (d) `for gene in value:`

<details><summary>정답 보기</summary>

(b). `.items()`가 (키, 값) 짝을 하나씩 내놓습니다. `.items()` 없이 반복하면 키만 나오기 때문에 (a)처럼 두 변수로 받으려 하면 오류가 납니다.

</details>

## 더 알아보기

> **📚 몇 번 돌지 모를 때: while과 break**
> for는 정해진 목록을 돌 때, while은 "조건이 참인 동안" 돌 때 씁니다. 서열에서 첫 정지 코돈이 나올 때까지 세 글자씩 읽는 일은 while이나 for + break로 표현할 수 있습니다. while은 조건이 끝내 거짓이 되지 않으면 영원히 돌기 때문에, 반복마다 위치가 앞으로 가는지 꼭 확인하세요. 노트북이 멈추면 커널 중단 버튼을 누릅니다.

## 오늘의 산출물 체크리스트
- [ ] `F4_if_for.ipynb`에 예시 1–5가 실행되어 있다.
- [ ] `low_genes` 필터링 결과가 `['Tnf', 'Il1b']`로 나온다.
- [ ] 유전자별 high/medium/low 라벨을 반복문으로 출력했다.
- [ ] 들여쓰기가 왜 중요한지 한 문장으로 설명할 수 있다.

---
[← 이전](day-F3.md) · [코스 지도](../../README.md) · [다음 →](day-F5.md)
