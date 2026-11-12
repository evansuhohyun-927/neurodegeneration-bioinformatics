# Day B4 — 제어문과 함수: 스크립트에서 재사용할 수 있는 도구로

> **주차:** 심화 파트 B — MATLAB/Octave 과학 계산 입문 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/B/cv_of.m`, `notebooks/advanced/B/B4_control_and_functions.m`
>
> **먼저 끝내 둘 레슨:** Day B3. 본 과정 Day F4(조건문과 반복문), Day F5(함수와 라이브러리)와 나란히 읽으면 좋습니다.

## 오늘의 목표
- `if`/`elseif`/`else`, `for`, `while`, `switch`, `try`/`catch`를 MATLAB 문법으로 쓸 수 있다.
- 파일 이름과 함수 이름이 같은 함수 파일을 만들고, 도움말·입력 검사·기본값·여러 출력을 넣을 수 있다.
- 함수의 지역 작업 공간(scope)과 값 전달을 설명하고, 익명 함수와 함수 핸들을 다른 함수에 넘길 수 있다.

## 🎬 영상으로 먼저 보기

- [MATLAB Crash Course for Beginners — freeCodeCamp.org](https://www.youtube.com/watch?v=7f50sQYjNRA) (1:57:45)
- **무엇에 주목할까:** 뒷부분의 logic, loops, custom functions 부분을 봅니다. 함수 파일 첫 줄의 `function [출력] = 이름(입력)` 모양과, 파일 이름이 함수 이름과 같아야 한다는 규칙에 주목하세요.

- [The Complete MATLAB Course: Beginner to Advanced! — Joseph Delgadillo](https://www.youtube.com/watch?v=T_ekAD7U-wU) (4:22:09)
- **무엇에 주목할까:** 목차에서 함수(functions)와 함수 핸들(function handles) 부분만 골라 봅니다. `@`로 함수를 변수처럼 넘기는 장면이 오늘 예시 3과 이어집니다.

## 개념 설명

### 제어문: 문법만 다르고 생각은 Python과 같다

MATLAB의 제어문은 키워드로 시작해 **`end`로 닫습니다**. 들여쓰기는 읽기 좋으라고 하는 것이지 문법이 아닙니다(그래도 꼭 들여 쓰세요. 편집기에서 전체 선택 후 Ctrl+I로 자동 정리됩니다). 조건 뒤에 콜론도 없습니다.

- `if 조건 ... elseif 조건 ... else ... end`: 조건이 **배열**이면 "모든 원소가 참"일 때만 참으로 칩니다. 의도가 헷갈리므로 조건은 숫자 하나가 되게 쓰거나 `any`/`all`을 명시하세요. 스칼라 조건을 묶을 때는 단락 평가(short-circuit) 연산자 `&&`, `||`를 쓰고, 배열 원소별로는 `&`, `|`를 씁니다.
- `for k = 1:n ... end`: `1:n`의 각 값을 차례로 `k`에 넣습니다. 행렬을 넣으면 **열 단위**로 돕니다. 반복 변수 이름으로 `i`, `j`는 허수 단위와 겹치고 숫자 1과 헷갈리기 쉬우므로 `k`, `ii`, `triali`, `chani`처럼 쓰는 것이 좋습니다.
- `while 조건 ... end`: 몇 번 돌지 미리 모를 때 씁니다. 조건을 바꾸는 줄을 빠뜨리면 무한 반복에 빠지는데, 그때는 명령 창에서 **Ctrl+C**로 멈춥니다.
- `continue`(이번 차례 건너뛰기), `break`(반복 끝내기)는 Python과 같습니다.
- `switch 값 case ... otherwise ... end`: 문자열이나 숫자로 갈래를 나눌 때 `if` 사다리보다 읽기 쉽습니다. 한 `case`에 `{'a', 'b'}`처럼 여러 값을 묶을 수 있습니다.
- `try ... catch err ... end`: 오류가 나면 `catch` 쪽으로 넘어가고, `err.message`, `err.identifier`, `err.stack`에 정보가 담깁니다.

`try/catch`를 오류를 "숨기는" 용도로 남발하면 안 됩니다. 오류는 무언가 잘못됐다는 신호이고, 조용히 넘어가면 틀린 결과가 그대로 논문 그림이 됩니다. 파일 하나가 깨져 있어도 나머지 참가자 처리는 계속하고 싶을 때처럼, **잡은 뒤 무엇이 실패했는지 기록하는** 경우에만 쓰세요.

마지막으로, MATLAB에서는 반복문 대부분을 **벡터화**로 바꿀 수 있습니다. 예시 1에서 반복문으로 만든 판정 벡터를 `rt >= 150 & rt <= 1500` 한 줄로 다시 만듭니다. 반복문이 틀린 것은 아니지만, 벡터화한 코드가 짧고 대개 빠릅니다(Day B6에서 시간을 재 봅니다).

### 함수 파일: 파일 하나 = 함수 하나 = 작은 작업 공간 하나

**스크립트**는 명령을 차례로 실행하는 파일이고, 실행하면 기본 작업 공간(base workspace)의 변수를 그대로 쓰고 바꿉니다. **함수**는 입력을 받아 출력을 돌려주는 파일이고, 실행될 때마다 **자기만의 작업 공간**이 새로 생겼다가 끝나면 사라집니다. 비유하면 스크립트는 공용 실험대에서 하는 작업이고, 함수는 문 닫힌 개인 후드입니다. 시약(입력)을 넣어 주면 결과물(출력)만 내보내고, 안에서 쓴 임시 변수는 밖을 어지럽히지 않습니다.

함수 파일의 규칙은 이렇습니다.

1. 첫 줄은 `function [출력1, 출력2] = 함수이름(입력1, 입력2)`.
2. **파일 이름은 함수 이름과 같아야** 합니다(`cv_of` → `cv_of.m`). 다르면 MATLAB은 파일 이름을 따릅니다.
3. 첫 줄 바로 아래의 연속된 `%` 주석이 **도움말**이 됩니다. `help cv_of`로 보입니다. 무엇을 하는지, 입력과 출력, 단위를 적습니다.
4. 같은 파일 안에서 첫 함수 아래에 다른 함수를 더 쓰면 **지역 함수(local function)** 가 되어 그 파일 안에서만 쓸 수 있습니다.
5. `nargin`(입력 개수), `nargout`(출력 개수)으로 선택 입력의 기본값을 정하고, `varargin`으로 개수가 정해지지 않은 입력을 받습니다.
6. 잘못된 입력은 일찍 거릅니다: `if ~isnumeric(x), error('id:part', '메시지'); end`. 오류 식별자(`'cv_of:input'`)를 붙이면 `catch`에서 오류 종류를 구분할 수 있습니다. `validateattributes`도 쓸 수 있습니다.

MATLAB은 **값 전달(pass by value)** 입니다. 함수 안에서 입력 행렬을 바꿔도 호출한 쪽의 변수는 그대로이고, 바뀐 결과를 쓰려면 출력으로 돌려받아 다시 대입해야 합니다(`x = f(x)`). Python의 리스트가 함수 안에서 바뀌면 밖에서도 바뀌는 것과 다릅니다. 함수 사이에 변수를 몰래 공유하는 `global`은 디버깅을 매우 어렵게 하므로 피하고, 필요한 값은 입력으로 넘기세요.

> **Octave와 다른 점 — 스크립트 안의 함수:** MATLAB(R2016b 이상)은 **스크립트 파일 맨 끝**에 지역 함수를 둘 수 있습니다. Octave는 스크립트 안의 함수를 **호출보다 먼저** 정의해야 하고, 파일 첫 줄이 `function`이면 함수 파일로 오해하므로 첫 줄에 `1;`을 둡니다. 두 규칙이 정반대라서, **함수는 따로 `.m` 파일로 만드는 것**이 양쪽에서 확실히 도는 방법입니다. 또 MATLAB(R2019b 이상)의 `arguments` 입력 검사 블록은 Octave 11이 문법은 받아들이지만 **검사는 하지 않았습니다**(음수 입력에 `mustBePositive`를 걸어도 오류 없이 통과함을 이 레슨 작성 중 확인). Octave에서도 검사가 필요하면 `if ... error(...)`로 직접 쓰세요.

### 함수 핸들과 익명 함수: 함수를 값처럼 넘기기

`@`를 붙이면 함수를 가리키는 **핸들(handle)** 이 됩니다. `f = @sin`이면 `f(pi/2)`는 `sin(pi/2)`와 같습니다. 이름 없는 짧은 함수는 **익명 함수**로 바로 만듭니다: `sq = @(v) v.^2`. Python의 `lambda`와 같습니다. 익명 함수는 **만들어질 때의 변수 값을 기억**합니다. `gain = 3; amp = @(v) gain*v;`를 만든 뒤 `gain = 10`으로 바꿔도 `amp(2)`는 6입니다.

핸들이 쓸모 있는 이유는 **함수를 입력으로 받는 함수**가 많기 때문입니다. 수치 적분 `integral(f, a, b)`, 근 찾기 `fzero(f, x0)`, 최적화 `fminsearch(f, x0)`(Day B7), 미분방정식 풀이 `ode45(f, tspan, y0)`(Day B7), 원소마다 적용하는 `arrayfun`/`cellfun`, GUI의 콜백(callback, Day B7)이 모두 핸들을 받습니다. "무엇을 계산할지"는 핸들로, "어떻게 반복·탐색할지"는 받는 함수가 맡는 분업입니다.

언제 함수를 새로 만들까요? 같은 코드 덩어리를 세 번째 복사하려는 순간이 신호입니다. 복사본이 여럿이면 한 곳만 고치고 나머지를 잊는 버그가 반드시 생깁니다. 반대로, 한 번만 쓰는 분석 단계를 일일이 함수로 쪼개면 코드를 따라가기 어려워집니다. 그리고 남이 만든 함수(툴박스 함수 포함)를 고쳐 써야 할 때는 원본을 직접 수정하지 말고 **다른 이름으로 복사**해 고칩니다. 원본을 고치면 다른 분석이 조용히 바뀝니다.

## 예시로 이해하기

> 출력은 GNU Octave 11.3에서 실행한 그대로입니다. 반응시간은 가상 값입니다.

### 예시 1 — 제어문 모음

```matlab
% 제어문 모음 (가상 반응시간, ms)
rt = [412 389 1530 455 0 401 98 433];
% if / elseif / else : 시행 하나 분류하기
x = rt(3);
if x < 150
    disp('너무 빠름(예측 반응 의심)')
elseif x > 1500
    disp('너무 느림(주의 이탈 의심)')
else
    disp('정상 범위')
end
% for : 시행마다 판정 기록
ok = false(size(rt));
for k = 1:numel(rt)
    ok(k) = rt(k) >= 150 && rt(k) <= 1500;
end
ok
% 같은 일을 한 줄로 (벡터화)
ok2 = rt >= 150 & rt <= 1500;
isequal(ok, ok2)
% continue / break
for k = 1:numel(rt)
    if rt(k) == 0, continue; end          % 0은 무응답: 건너뛴다
    if rt(k) > 1500, fprintf('%d번째에서 멈춤\n', k); break; end
end
% while : 조건이 참인 동안 반복
total = 0; k = 0;
while total < 1000
    k = k + 1;
    total = total + rt(k);
end
fprintf('누적 1000ms를 넘는 데 %d시행\n', k)
% switch : 이름으로 갈래 나누기
cond = 'incongruent';
switch cond
    case 'congruent'
        code = 1;
    case {'incongruent', 'conflict'}
        code = 2;
    otherwise
        code = NaN;
end
code
% try / catch : 오류를 잡아 메시지만 남기기
try
    rt(20)
catch err
    fprintf('잡은 오류: %s\n', err.message);
end
```

출력:

```text
너무 느림(주의 이탈 의심)
ok =

  1  1  0  1  0  1  0  1

ans = 1
3번째에서 멈춤
누적 1000ms를 넘는 데 3시행
code = 2
잡은 오류: rt(20): out of bound 8 (dimensions are 1x8)
```

`ok = false(size(rt))`로 **결과를 담을 자리를 먼저 만든 뒤** 반복문에서 채웠습니다(미리 할당, Day B6). 반복문 안의 `&&`는 숫자 하나끼리의 비교이고, 벡터화한 줄의 `&`는 원소별 비교입니다. 벡터에 `&&`를 쓰면 오류가 납니다. 마지막 줄의 오류 문구는 MATLAB에서 "Index exceeds the number of array elements. Index must not exceed 8."처럼 다르게 나옵니다.

### 예시 2 — 함수 파일 만들기: `cv_of.m`

아래를 `cv_of.m`으로 저장합니다(파일 이름 = 함수 이름).

```matlab
function [cv, n] = cv_of(x, pct)
%CV_OF  변동계수(coefficient of variation)를 계산한다.
%   cv = CV_OF(x)       는 SD/평균 (비율)을 돌려준다.
%   cv = CV_OF(x, true) 는 퍼센트로 돌려준다.
%   [cv, n] = CV_OF(...) 는 NaN을 뺀 표본 수 n도 돌려준다.
    if nargin < 2
        pct = false;                 % 두 번째 입력을 안 주면 기본값
    end
    if ~isnumeric(x) || ~isvector(x)
        error('cv_of:input', 'x는 숫자 벡터여야 합니다.');
    end
    x  = x(~isnan(x));
    n  = numel(x);
    cv = std(x) / mean(x);
    if pct
        cv = 100 * cv;
    end
end
```

같은 폴더에서 다음 스크립트를 실행합니다.

```matlab
stride = [1.08 1.12 NaN 1.10 1.31 1.07];
cv_of(stride)
[c, n] = cv_of(stride, true)
help cv_of
try
    cv_of('abc')
catch err
    fprintf('%s | %s\n', err.identifier, err.message);
end
```

출력(`help`가 찍는 파일 경로 줄과 Octave 안내 문구는 생략):

```text
ans = 0.087277
c = 8.7277
n = 5
CV_OF  변동계수(coefficient of variation)를 계산한다.
   cv = CV_OF(x)       는 SD/평균 (비율)을 돌려준다.
   cv = CV_OF(x, true) 는 퍼센트로 돌려준다.
   [cv, n] = CV_OF(...) 는 NaN을 뺀 표본 수 n도 돌려준다.
cv_of:input | x는 숫자 벡터여야 합니다.
```

출력을 하나만 받으면 첫 번째 출력(`cv`)만 돌아오고, 대괄호로 두 개를 받으면 `n`도 받습니다. `'abc'`는 char라서 `isnumeric`에 걸려 우리가 정한 식별자와 메시지로 멈췄습니다. 이렇게 **입력을 함수 입구에서 검사**하면, 엉뚱한 자료가 계산 깊숙이 들어가 알아보기 힘든 오류를 내는 일을 막습니다.

### 예시 3 — 값 전달과 함수 핸들

먼저 `set_first.m`을 만듭니다.

```matlab
function out = set_first(v, val)
    v(1) = val;
    out = v;
end
```

그리고 다음을 실행합니다.

```matlab
% 값 전달(pass by value): 함수 안에서 바꿔도 밖은 그대로
x = [1 2 3];
y = set_first(x, 99);
x
y
% 익명 함수와 함수 핸들
sq   = @(v) v.^2;
sq([1 2 3])
gain = 3;
amp  = @(v) gain * v;      % 만들 때의 gain(=3)을 기억한다
gain = 10;
amp(2)                      % 여전히 3*2
f = @sin;
feval(f, pi/2)
integral(@(t) exp(-t), 0, Inf)       % 함수를 받는 함수 1
fzero(@(v) v.^3 - 2, 1)              % 함수를 받는 함수 2: 세제곱근 2
arrayfun(@(k) sum(1:k), 1:5)
```

출력:

```text
x =

   1   2   3

y =

   99    2    3

ans =

   1   4   9

ans = 6
ans = 1
ans = 1.0000
ans = 1.2599
ans =

    1    3    6   10   15
```

`x`는 함수 호출 뒤에도 `[1 2 3]` 그대로입니다. `integral`이 `1.0000`(정확히 1이 아니라 아주 가까운 수)을 돌려준 것도 수치 계산의 성질입니다. `fzero`는 시작값 1 근처에서 `v^3 - 2 = 0`의 해 1.2599를 찾았습니다.

> **Octave에서만 되는 형태(참고):** Octave는 스크립트 안에 함수를 둘 수 있는데, 첫 줄에 `1;`을 쓰고 호출보다 먼저 정의해야 합니다. 아래는 Octave에서 실행해 `ans = 8`을 확인했지만, **MATLAB에서는 함수가 파일 끝에 있지 않아 오류**가 납니다.
>
> ```matlab
> 1;
> function out = double_it(v)
>     out = 2 * v;
> end
> double_it(4)
> ```

## 직접 해보기

1. 예시 1을 `notebooks/advanced/B/B4_control_and_functions.m`에 넣고 실행합니다. `rt`에 값을 몇 개 더해 `while` 결과가 어떻게 바뀌는지 봅니다.
2. **판정 함수 만들기.** `classify_rt.m`을 만들어 반응시간 벡터를 받아 각 시행을 `'fast'`, `'ok'`, `'slow'`, `'miss'`(0) 중 하나로 분류한 cell 배열과, 범주별 개수를 돌려주게 합니다. 기준값(150, 1500)은 선택 입력으로 받고 `nargin`으로 기본값을 줍니다. 도움말 주석도 씁니다.
3. **입력 검사 추가.** `classify_rt`에 숫자가 아닌 입력, 음수가 들어오면 식별자가 붙은 `error`를 내도록 하고, `try/catch`로 일부러 오류를 일으켜 `err.identifier`를 출력해 봅니다.
4. **핸들 연습.** `arrayfun`과 익명 함수로 `cv_of`를 Day B3의 struct 배열 각 참가자의 보폭에 적용해 CV 벡터를 만듭니다.
5. **스코프 확인.** 함수 안에 중단점을 걸거나(편집기에서 줄 번호 옆 클릭, 또는 `dbstop in cv_of at 14`) 함수 안에서 `whos`를 실행해, 함수 작업 공간에 무엇이 있는지 보고 `dbcont`(계속), `dbquit`(중단)로 빠져나옵니다. 디버거는 Day B6에서 자세히 다룹니다.

⚠️ **흔한 오류 1 — 함수를 스크립트처럼 실행하기.** 편집기에서 함수 파일을 열어 "실행" 버튼을 누르면 입력이 없어 `'x' undefined` 오류가 납니다. 함수는 명령 창이나 다른 스크립트에서 입력과 함께 불러야 합니다.

⚠️ **흔한 오류 2 — 같은 이름의 파일이 두 개.** 경로의 다른 폴더에 같은 이름의 오래된 `cv_of.m`이 있으면 엉뚱한 버전이 불립니다. 결과가 고친 대로 바뀌지 않으면 `which -all cv_of`로 어느 파일이 불리는지 확인하세요.

## 퀴즈

**1.** 다음 중 MATLAB에서 문법 오류인 것은?

(a) `for k = 1:3, disp(k), end` (b) `if x > 1: y = 2 end` (c) `while n < 5, n = n + 1; end` (d) `switch s, case 'a', y = 1; end`

<details><summary>정답 보기</summary>

(b). MATLAB의 `if`에는 콜론이 없습니다. 같은 줄에 여러 문장을 쓸 때는 쉼표나 세미콜론으로 나눕니다.

</details>

**2.** 함수 `y = scale(x)` 안에서 `x = x * 2;`를 실행했습니다. 호출한 쪽에서 `a = [1 2]; scale(a);`를 한 뒤 `a`의 값은? (단답)

<details><summary>정답 보기</summary>

`[1 2]` 그대로입니다. MATLAB은 값을 복사해 넘기므로 함수 안의 변경은 밖에 영향을 주지 않습니다. 바뀐 값을 쓰려면 `a = scale(a);`처럼 출력을 받아야 합니다.

</details>

**3.** `k = 2; f = @(x) k * x; k = 5; f(3)`의 결과는?

(a) 6 (b) 15 (c) 오류 (d) 3

<details><summary>정답 보기</summary>

(a). 익명 함수는 만들어질 때의 `k`(2)를 기억합니다.

</details>

**4.** 같은 코드가 MATLAB과 Octave 모두에서 돌게 하려면, 스크립트에서 쓰는 보조 함수를 어디에 두는 것이 가장 안전한가요? (단답)

<details><summary>정답 보기</summary>

함수마다 별도의 `.m` 파일(파일 이름 = 함수 이름)로 만들어 같은 폴더나 경로에 둡니다. MATLAB은 스크립트 끝, Octave는 호출 전에 함수를 정의하라고 요구해 규칙이 서로 반대이기 때문입니다.

</details>

**5.** 참가자 파일 50개를 반복문으로 처리하는데 3번 파일이 깨져 있어 전체가 멈춥니다. `try/catch`를 어떻게 쓰는 것이 좋을까요? (단답)

<details><summary>정답 보기</summary>

반복문 안에서 한 참가자 처리를 `try`로 감싸고, `catch err`에서 참가자 번호와 `err.message`를 실패 목록에 기록한 뒤 다음 참가자로 넘어갑니다. 마지막에 실패 목록을 반드시 출력·저장해, 조용히 빠진 참가자가 없게 합니다.

</details>

> **더 읽을거리:** Wallisch P, et al. *MATLAB for Neuroscientists*, 2nd ed. Academic Press (Elsevier), 2014 — [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0) · Cohen MX. *MATLAB for Brain and Cognitive Scientists*. MIT Press, 2017 — [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/) · [GNU Octave 문서](https://docs.octave.org/latest/) · [Octave와 MATLAB의 차이](https://wiki.octave.org/Differences_between_Octave_and_Matlab)

## 오늘의 산출물 체크리스트
- [ ] `cv_of.m`이 도움말, 기본값, 입력 검사, 출력 두 개를 갖췄고 `help cv_of`로 설명이 보인다.
- [ ] `classify_rt.m`이 범주 cell과 개수를 돌려주고, 잘못된 입력에 식별자가 붙은 오류를 낸다.
- [ ] 값 전달과 익명 함수의 변수 기억을 직접 확인했다.
- [ ] 쓰는 프로그램에서 스크립트 안 함수 규칙이 어떻게 다른지 기록했다.

---
[← 이전](day-B3.md) · [코스 지도](../../../README.md) · [다음 →](day-B5.md)
