# Day F5 — 함수 만들기와 라이브러리 import

> **주차:** 0주차 · **예상 시간:** 75–90분 · **산출물:** `notebooks/week-0/F5_functions.ipynb`

## 오늘의 목표
- `def`로 입력을 받아 결과를 `return`하는 함수를 만들 수 있다.
- `import`로 `math`, `numpy` 같은 라이브러리를 불러와 쓸 수 있다.
- fold change와 log2 fold change를 계산하는 함수를 만들어 여러 유전자에 적용할 수 있다.

## 🎬 영상으로 먼저 보기

- [Python Tutorial for Beginners 8: Functions — Corey Schafer](https://www.youtube.com/watch?v=9Os0o3wzS_I) (21:47)
- **무엇에 주목할까:** 함수를 "정의하는 것"과 "호출하는 것"이 별개의 단계라는 점, 그리고 `print`와 `return`이 다르다는 점에 주목하세요. 후반부의 `*args`, `**kwargs`는 지금은 건너뛰어도 됩니다.

- [Python Tutorial for Beginners 9: Import Modules and Exploring The Standard Library — Corey Schafer](https://www.youtube.com/watch?v=CqvZ3vGoGs0) (21:57)
- **무엇에 주목할까:** `import 이름`, `import 이름 as 별명`, `from 이름 import 기능` 세 가지 모양을 구분해 보세요. 모듈을 찾는 경로(`sys.path`) 이야기는 가볍게 듣고 넘어가면 됩니다.

## 개념 설명

### 함수는 이름 붙인 프로토콜이다

실험실에서 "BCA assay 해 줘"라고 하면 상대방은 시약 섞고, 배양하고, 흡광도 재는 여러 단계를 알아서 수행합니다. 여러 단계에 이름을 붙여 두었기 때문에 매번 처음부터 설명할 필요가 없습니다. 함수(function)는 코드에서의 "이름 붙인 프로토콜"입니다.

사실 여러분은 이미 함수를 써 왔습니다. `print()`, `len()`, `sum()`, `round()`가 모두 누군가 만들어 둔 함수입니다. 오늘은 직접 만듭니다.

```python
def fold_change(treated, control):
    return treated / control
```

`def`는 define(정의하다)의 줄임말입니다. `fold_change`가 함수 이름이고, 괄호 안의 `treated`, `control`은 매개변수(parameter)로, 프로토콜의 "시료를 여기에 넣으세요" 자리에 해당합니다. `return`은 결과물을 돌려주는 명령입니다. 줄 끝의 콜론과 들여쓰기는 어제 배운 `if`, `for`와 같은 규칙입니다.

함수를 정의한 셀을 실행해도 화면에는 아무것도 나오지 않습니다. 프로토콜을 노트에 적어 두기만 한 상태이기 때문입니다. 실제로 수행하려면 `fold_change(250.0, 100.0)`처럼 이름을 부르며 값을 넣어 줘야 하고, 이것을 호출(call)이라고 합니다.

### return과 print는 다르다

초보자가 가장 많이 헷갈리는 부분입니다. `print`는 결과를 **화면에 보여 주기만** 하고, `return`은 결과를 **호출한 쪽에 건네줍니다.**

원심분리기에 비유하면, `print`는 기계 화면에 "완료"라고 표시하는 것이고 `return`은 튜브를 여러분 손에 돌려주는 것입니다. 화면 표시만 있고 튜브를 못 받으면 다음 실험을 할 수 없습니다. 마찬가지로 `return`이 없는 함수의 결과는 변수에 담을 수도, 다음 계산에 쓸 수도 없습니다. 이런 함수의 결과를 변수에 담으면 "아무것도 없음"을 뜻하는 `None`이 들어갑니다(예시 5).

그래서 원칙은 이렇습니다. **계산하는 함수는 `return`으로 값을 돌려주고, 화면에 보여 줄지는 호출한 쪽에서 `print`로 정한다.** 이렇게 해 두면 같은 함수를 출력에도, 다른 계산의 재료로도 쓸 수 있습니다.

함수를 만드는 이유는 세 가지입니다. 같은 코드를 여러 번 복사하지 않아도 되고, 고칠 일이 생기면 한 곳만 고치면 되고, 이름만 봐도 무슨 일을 하는지 알 수 있습니다. "같은 코드를 세 번째 복사하고 있다면 함수로 만들 때"라고 기억하세요.

### import: 남이 만든 도구 상자 가져오기

모든 함수를 직접 만들 필요는 없습니다. 실험실에서 버퍼를 매번 직접 만들지 않고 키트를 사서 쓰듯, 코드에서도 남이 잘 만들어 둔 도구 모음을 가져다 씁니다. 이 도구 모음을 라이브러리(library) 또는 모듈(module)이라 하고, 가져오는 명령이 `import`입니다.

```python
import math
import numpy as np
```

`import math`를 하면 `math.log2()`, `math.sqrt()`처럼 `math.` 뒤에 점을 찍고 그 안의 함수를 쓸 수 있습니다. "math 상자 안의 log2"라는 뜻입니다. `import numpy as np`의 `as np`는 별명을 붙이는 것으로, 매번 `numpy.mean()`이라고 길게 쓰는 대신 `np.mean()`이라고 짧게 쓰게 해 줍니다. `np`(numpy), `pd`(pandas)는 전 세계가 똑같이 쓰는 관례이니 그대로 따르세요.

`math`는 Python에 기본으로 들어 있고(표준 라이브러리), `numpy`와 `pandas`는 F1에서 conda로 설치한 것입니다. 설치하지 않은 라이브러리를 `import`하면 `ModuleNotFoundError`가 납니다. `import`는 보통 노트북의 맨 첫 셀에 모아 둡니다.

### 왜 log2 fold change를 쓸까

fold change(배수 변화)는 두 조건의 발현값 비율입니다. 처리군이 대조군의 2배면 2, 절반이면 0.5입니다. 그런데 이 숫자는 비대칭입니다. 증가는 1부터 무한대까지 뻗는데, 감소는 0과 1 사이에 눌려 있습니다. "2배 증가"(2)와 "2배 감소"(0.5)가 같은 크기의 변화인데도 숫자로는 그렇게 보이지 않습니다.

여기에 밑이 2인 로그(log2)를 씌우면 대칭이 됩니다. 2배 증가는 +1, 2배 감소는 −1, 변화 없음은 0입니다. 4배 증가는 +2, 4배 감소는 −2. 그래프에서도 0을 중심으로 좌우가 균형 잡힙니다. 이것이 논문에서 log2FC를 쓰는 이유이고, 3주차에 차등발현 결과를 읽을 때 계속 나옵니다.

## 예시로 이해하기

> 유전자 이름과 숫자는 모두 연습용 **가상 값**입니다. 실제 데이터셋의 값이 아닙니다.

### 예시 1 — 첫 함수: fold change

```python
def fold_change(treated, control):
    return treated / control

print(fold_change(250.0, 100.0))
print(fold_change(80.0, 160.0))

fc = fold_change(30.0, 28.0)
print(round(fc, 3))
```

출력:

```text
2.5
0.5
1.071
```

함수는 한 번 정의하고 세 번 호출했습니다. 세 번째처럼 결과를 변수(`fc`)에 담아 다음 계산에 쓸 수 있는 것은 `return` 덕분입니다.

### 예시 2 — math 불러와서 log2 계산

```python
import math

print(math.log2(8))
print(math.log2(2.5))
print(math.log2(0.5))
print(math.sqrt(16))
```

출력:

```text
3.0
1.3219280948873624
-1.0
4.0
```

2를 세 번 곱하면 8이므로 `log2(8)`은 3입니다. 비율 0.5(절반)는 −1이 됩니다.

### 예시 3 — 기본값이 있는 함수와 설명글(docstring)

대조군 값이 0이면 나눗셈이 불가능합니다. 실무에서는 양쪽에 작은 수(pseudocount)를 더해 이를 피하곤 합니다.

```python
import math

def log2_fold_change(treated, control, pseudocount=1):
    """treated와 control의 log2 fold change를 돌려준다.

    0으로 나누는 일을 피하려고 양쪽에 pseudocount를 더한다.
    """
    ratio = (treated + pseudocount) / (control + pseudocount)
    return math.log2(ratio)

print(round(log2_fold_change(250.0, 100.0), 3))
print(round(log2_fold_change(80.0, 160.0), 3))
print(round(log2_fold_change(5.0, 0.0), 3))
print(round(log2_fold_change(250.0, 100.0, pseudocount=0), 3))
```

출력:

```text
1.313
-0.991
2.585
1.322
```

`pseudocount=1`은 기본값(default)입니다. 호출할 때 따로 안 주면 1이 쓰이고, 마지막 줄처럼 `pseudocount=0`이라고 주면 그 값이 쓰입니다. 함수 첫 줄 아래 `""" """` 안의 글은 docstring이라는 설명글로, 실행에는 영향이 없지만 이 함수가 무엇을 하는지 미래의 나에게 알려 줍니다.

### 예시 4 — numpy로 평균 구하고 여러 유전자에 적용하기

```python
import math
import numpy as np

def mean_log2fc(treated_values, control_values):
    """두 그룹 평균의 log2 fold change."""
    treated_mean = np.mean(treated_values)
    control_mean = np.mean(control_values)
    return math.log2(treated_mean / control_mean)

data = {
    "Gfap": ([250.0, 230.0, 270.0], [100.0, 110.0, 90.0]),
    "Tnf": ([30.0, 26.0, 31.0], [28.0, 29.0, 27.0]),
    "Sod2": ([80.0, 75.0, 85.0], [160.0, 150.0, 170.0]),
}

for gene, (flight_values, ground_values) in data.items():
    result = mean_log2fc(flight_values, ground_values)
    print(f"{gene}: log2FC = {round(result, 2)}")
```

출력:

```text
Gfap: log2FC = 1.32
Tnf: log2FC = 0.05
Sod2: log2FC = -1.0
```

지난 나흘 동안 배운 것이 모두 들어 있습니다. 딕셔너리(F3), 반복문(F4), 함수와 `import`(오늘). `np.mean()`은 리스트의 평균을 구해 주는 numpy 함수입니다. 이 가상 데이터에서는 Gfap이 약 2.5배 높고(+1.32), Sod2가 절반(−1.0), Tnf는 거의 차이가 없습니다.

한 가지 꼭 기억할 점. 그룹당 샘플 3개의 평균 비율만으로는 "차이가 있다"고 말할 수 없습니다. 샘플 간 흩어짐과 다중검정을 함께 봐야 하고(2주차), 표본이 작은 연구의 결과는 결론이 아니라 **가설 생성** 수준으로 해석합니다.

### 예시 5 — print만 하는 함수 vs return하는 함수

```python
def show_fc(treated, control):
    print(treated / control)

def get_fc(treated, control):
    return treated / control

a = show_fc(250.0, 100.0)
b = get_fc(250.0, 100.0)
print(a)
print(b)
```

출력:

```text
2.5
None
2.5
```

첫 줄의 2.5는 `show_fc`가 안에서 `print`한 것입니다. 하지만 돌려준 것이 없어서 `a`에는 `None`이 들어갔습니다. `b`에는 2.5가 제대로 담겼습니다.

## 직접 해보기

1. JupyterLab을 켜고 `notebooks/week-0/F5_functions.ipynb`를 만듭니다.

2. 첫 셀에 `import`를 모아 실행합니다.

   ```python
   import math
   import numpy as np
   ```

3. 예시 1–5를 셀 하나씩 직접 타이핑해 실행합니다.

4. **함수 고쳐 보기.** 예시 1의 `fold_change`를 `fold_change(100.0, 250.0)`처럼 순서를 바꿔 호출해 0.4가 나오는지 확인합니다. 인자(argument)의 순서가 결과를 바꾼다는 것을 눈으로 확인하는 단계입니다.

5. **내 함수 만들기 ①.** 숫자 리스트를 받아 평균을 돌려주는 `mean_of(values)` 함수를 `sum`과 `len`으로 만듭니다. `mean_of([5.0, 7.5, 6.5, 9.0])`이 7.0이면 성공입니다. `np.mean([5.0, 7.5, 6.5, 9.0])`과 결과가 같은지도 비교합니다.

6. **내 함수 만들기 ②.** 발현값과 임계값을 받아 `"high"` 또는 `"low"`를 돌려주는 `label_expression(value, threshold=10)` 함수를 만듭니다. `label_expression(12.5)`는 `"high"`, `label_expression(12.5, threshold=20)`은 `"low"`가 나와야 합니다.

7. **numpy 맛보기.** 아래를 실행합니다. `np.std(..., ddof=1)`은 표본 표준편차(샘플 간 흩어짐의 크기)로, 2주차에 자세히 배웁니다.

   ```python
   flight_values = [250.0, 230.0, 270.0]
   ground_values = [100.0, 110.0, 90.0]

   flight_mean = np.mean(flight_values)
   ground_mean = np.mean(ground_values)

   print(flight_mean)
   print(ground_mean)
   print(np.std(flight_values, ddof=1))
   print(np.log2(flight_mean / ground_mean))
   ```

   출력:

   ```text
   250.0
   100.0
   20.0
   1.3219280948873624
   ```

8. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — `NameError: name 'fold_change' is not defined`.** 함수를 정의한 셀을 실행하지 않고 호출한 경우입니다. 함수 정의 셀을 먼저 실행하세요. 함수를 고쳤다면 **정의 셀을 다시 실행해야** 고친 내용이 반영됩니다. `name 'math' is not defined`도 같은 원리로, `import` 셀을 실행하지 않은 것입니다.

⚠️ **흔한 오류 2 — `ValueError: math domain error`.** `math.log2(0)`처럼 0이나 음수의 로그를 구하려 할 때 납니다. 로그는 양수에서만 정의되기 때문입니다. 발현값에 0이 섞여 있으면 흔히 만나는 오류이고, 예시 3의 pseudocount가 이를 피하는 한 가지 방법입니다.

## 퀴즈

**1.** 함수를 정의할 때 쓰는 키워드는?

(a) `function` (b) `def` (c) `return` (d) `import`

<details><summary>정답 보기</summary>

(b) `def`. define의 줄임말입니다. `return`은 함수 안에서 결과를 돌려줄 때, `import`는 라이브러리를 불러올 때 씁니다.

</details>

**2.** 아래 코드를 실행하면 `x`에 무엇이 들어 있나요?

```python
def double(n):
    print(n * 2)

x = double(5)
```

(a) `10` (b) `5` (c) `None` (d) 오류

<details><summary>정답 보기</summary>

(c) `None`. 화면에는 10이 출력되지만 `return`이 없어서 함수가 돌려주는 값이 없습니다. 계산 결과를 변수에 담아 쓰려면 `print` 대신 `return n * 2`로 써야 합니다.

</details>

**3.** fold change가 0.25일 때 log2 fold change는? (단답)

<details><summary>정답 보기</summary>

−2. 0.25는 1/4, 즉 2를 두 번 나눈 값이므로 log2는 −2입니다. 4배 증가(+2)와 4배 감소(−2)가 부호만 다른 같은 크기로 표현되는 것이 log2를 쓰는 이유입니다.

</details>

**4.** `import numpy as np` 뒤에 평균을 구하는 올바른 코드는?

(a) `numpy.mean(values)` (b) `np.mean(values)` (c) `mean(values)` (d) `np(values).mean`

<details><summary>정답 보기</summary>

(b). `as np`로 별명을 붙였으므로 `np.`으로 불러야 합니다. 별명을 붙인 뒤에는 원래 이름 `numpy`로는 부를 수 없고, 그냥 `mean`이라는 함수는 기본 Python에 없습니다.

</details>

**5.** `def log2_fold_change(treated, control, pseudocount=1):`에서 `pseudocount=1`의 의미는? (단답)

<details><summary>정답 보기</summary>

기본값입니다. 호출할 때 세 번째 값을 주지 않으면 자동으로 1이 쓰이고, `pseudocount=0`처럼 직접 주면 그 값이 대신 쓰입니다. 자주 쓰는 설정을 매번 적지 않아도 되게 해 줍니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `F5_functions.ipynb`의 첫 셀에 `import math`, `import numpy as np`가 있다.
- [ ] `fold_change`, `log2_fold_change`, `mean_log2fc` 함수가 실행되어 있다.
- [ ] 직접 만든 `mean_of`, `label_expression` 함수가 기대한 값을 돌려준다.
- [ ] `print`와 `return`의 차이를 설명할 수 있다.

---
[← 이전](day-F4.md) · [코스 지도](../../README.md) · [다음 →](day-F6.md)
