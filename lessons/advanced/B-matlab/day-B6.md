# Day B6 — 좋은 코드 습관, 디버깅, 테스트, 속도

> **주차:** 심화 파트 B — MATLAB/Octave 과학 계산 입문 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/B/count_crossings.m`, `notebooks/advanced/B/test_count_crossings.m`, `notebooks/advanced/B/B6_speed.m`
>
> **먼저 끝내 둘 레슨:** Day B5. 본 과정 Day F7(오류 메시지 읽기), Day 38(재현성 강화)과 이어집니다.

## 오늘의 목표
- 이름 짓기, 주석·도움말, 결합도(coupling)와 응집도(cohesion)의 관점으로 코드를 정리할 수 있다.
- 오류 메시지와 호출 스택을 읽고, 중단점(breakpoint)으로 함수 안을 들여다보며, `assert`로 작은 단위 테스트를 쓸 수 있다.
- 미리 할당(preallocation)과 벡터화로 코드를 빠르게 하고, `tic`/`toc`와 프로파일러로 느린 곳을 찾을 수 있다.

## 🎬 영상으로 먼저 보기

- [The Complete MATLAB Course: Beginner to Advanced! — Joseph Delgadillo](https://www.youtube.com/watch?v=T_ekAD7U-wU) (4:22:09)
- **무엇에 주목할까:** 목차에서 디버깅(debugging)이나 오류 처리 부분을 골라 봅니다. 편집기 줄 번호 옆을 눌러 중단점을 만들고 한 줄씩 진행하는 손동작을 익히는 것이 목표입니다.

- [MATLAB vectorization and preallocation (검색 링크)](https://www.youtube.com/results?search_query=MATLAB+vectorization+preallocation+speed)
- **무엇에 주목할까:** 반복문을 행렬 연산 한 줄로 바꾸는 전후 비교를 보세요. 오늘 예시 1의 숫자와 비교합니다.

## 개념 설명

### 읽히는 코드: 이름, 주석, 범위, 그리고 쪼개기

석 달 뒤의 나는 남입니다. **변수 이름**은 무엇이 들었는지 말해야 합니다: `x2`보다 `stride_s`, `fs`(표본추출률처럼 분야에서 굳은 약어는 괜찮음), 단위가 헷갈리면 이름에 넣습니다(`rt_ms`, `dur_s`). 내장 함수 이름(`sum`, `max`, `gamma`, `table`, `i`)은 변수로 쓰지 말고, 의심되면 `which 이름`으로 확인합니다. 한 변수를 용도가 끝난 뒤 다른 뜻으로 다시 쓰는 것도 피합니다.

**함수 첫머리의 주석**은 `help 함수이름`에 그대로 나오는 설명서입니다. 무엇을 하는지, 입력과 출력(모양과 단위), 눈에 안 보이는 부작용(파일을 쓰거나 전역 변수를 바꾸는지)을 적습니다. 스크립트는 `%%` 칸으로 단계(불러오기 / 전처리 / 분석 / 그림)를 나눕니다.

**범위(scope)**: 스크립트는 명령 창과 같은 작업 공간을 쓰므로 기존 변수를 덮어쓸 수 있고, 함수는 호출될 때마다 자기만의 작업 공간을 만들었다가 끝나면 지웁니다(Day B4). `global` 변수는 어디서 바뀌었는지 추적하기 어려워 버그의 온상이니, 값은 입력과 출력으로 주고받습니다.

**쪼개기의 기준**은 두 가지입니다. **결합도(coupling)** 는 낮게 — 함수가 바깥(전역 변수, 특정 필드 이름, 파일 경로)에 덜 기댈수록 다른 곳에서 다시 쓰기 쉽습니다. **응집도(cohesion)** 는 높게 — 한 함수는 한 가지 일만 합니다. "파일 읽기 + 필터 + 통계 + 그림"을 한 함수에 넣지 말고 나눕니다. 이 생각의 연장이 객체 지향(`classdef`)입니다. 형식이 다른 기록 파일(WAV, 장비 고유 형식…)을 "자료와 표본추출률을 돌려주는 물건"이라는 같은 겉모습으로 감싸면, 분석 코드는 파일 형식을 몰라도 됩니다. 처음에는 쓸 일이 드물지만, 큰 툴박스 코드를 읽을 때 `classdef`, `properties`, `methods`, `< handle`이 보이면 이 목적이라고 이해하면 됩니다(`handle` 클래스는 복사해도 같은 객체를 가리킨다는 점이 일반 값과 다릅니다).

### 오류는 정보다: 메시지, 스택, 중단점, 테스트

오류 메시지는 **무엇이**(예: "nonconformant arguments (op1 is 1x3, op2 is 1x2)"), **어디서**(호출 스택: 어느 함수의 몇째 줄, 그 함수를 부른 곳)를 알려 줍니다. 아래에서 위로, 내가 쓴 파일이 나오는 첫 줄부터 봅니다. `try/catch`로 잡은 오류 객체의 `err.stack`에도 같은 정보가 있습니다.

들여다보는 도구는 **중단점**입니다. 편집기에서 줄 번호 옆을 누르거나 `dbstop in 함수 at 줄`, 오류가 나는 순간 멈추게 하려면 `dbstop if error`. 멈추면 그 함수의 작업 공간에서 변수를 찍어 보고(`whos`, 변수 이름), `dbstep`(한 줄), `dbcont`(계속), `dbquit`(중단)로 움직입니다. `dbstack`은 지금 어떤 함수들이 쌓여 있는지 보여 줍니다. 코드 안에 `keyboard`를 넣어도 그 자리에서 멈춥니다.

고친 뒤 다시 깨지지 않게 하는 도구가 **단위 테스트**입니다. 답을 아는 작은 입력, 특히 **경계 사례(edge case)** — 빈 입력, 길이 1, 문턱과 똑같은 값, NaN, 음수 — 를 `assert(조건)`으로 확인하는 스크립트를 만들고, 함수를 고칠 때마다 돌립니다. MATLAB에는 `runtests`와 `matlab.unittest` 프레임워크가 있지만 **Octave 11에는 없습니다**. 대신 `assert` 스크립트는 양쪽에서 돌고, Octave에는 함수 파일 안에 `%!test` 블록을 쓰는 고유 방식(`test 함수이름`)도 있습니다.

`warning`은 알리되 멈추지 않고, `error('패키지:식별자', '메시지 %d', 값)`은 멈춥니다. 식별자를 붙이면 `catch`에서 오류 종류별로 다르게 처리할 수 있습니다. 단, `try/catch`로 모든 오류를 삼키면 문제가 숨으므로, 잡을 오류만 좁게 잡습니다. 또 하나의 조용한 버그원은 **부동소수점 비교**입니다(Day B3). `if x == 1` 대신 허용 오차를 쓰고, 아주 크고 작은 수를 곱할 때는 순서를 바꾸거나 로그로 계산합니다.

### 빠른 코드: 미리 할당, 벡터화, 측정

느리다고 느끼면 **먼저 재고, 그다음 고칩니다**. `tic; ...; toc`는 구간 시간을, 프로파일러(`profile on` → 실행 → `profile off`, MATLAB은 `profile viewer`, Octave는 `profshow`)는 함수·줄별 시간을 보여 줍니다. 대부분 시간은 한두 곳에서 쓰입니다.

흔한 처방 두 가지. **미리 할당**: 반복문에서 `y(k) = ...`로 배열을 한 칸씩 키우면 매번 새 메모리를 잡고 복사합니다. `y = zeros(1, n)`으로 미리 자리를 잡습니다. **벡터화**: 원소마다 도는 반복문을 행렬 연산 한 줄(`sin(x) .* exp(-x/5)`)로 바꾸면 내부의 컴파일된 코드가 한꺼번에 계산합니다. `if`가 낀 반복문은 논리 인덱스로 바꿉니다(`y(x > 0.5) = ...`). 다만 읽기 어려울 만큼 억지로 벡터화할 필요는 없습니다. 최신 MATLAB은 JIT 컴파일 덕분에 단순한 반복문도 꽤 빠르고, 독립적인 반복은 Parallel Computing Toolbox의 `parfor`로 나눌 수도 있습니다(Octave는 `parallel` 패키지, 이 레슨에서는 실행 확인 안 됨).

## 예시로 이해하기

> 출력은 GNU Octave 11.3에서 실행한 그대로입니다. 시간은 컴퓨터와 실행마다 달라집니다.

### 예시 1 — 세 가지 방식의 속도 비교

```matlab
% 같은 계산 세 가지: 미리 할당 없는 반복문 / 미리 할당한 반복문 / 벡터화
n = 2e5;
x = linspace(0, 10, n);

tic
y1 = [];
for k = 1:n
    y1(k) = sin(x(k)) * exp(-x(k)/5);     % 매번 배열이 한 칸씩 자란다
end
t_grow = toc;

tic
y2 = zeros(1, n);                          % 미리 할당(preallocation)
for k = 1:n
    y2(k) = sin(x(k)) * exp(-x(k)/5);
end
t_pre = toc;

tic
y3 = sin(x) .* exp(-x/5);                  % 벡터화
t_vec = toc;

fprintf('자라는 배열 %.3f s | 미리 할당 %.3f s | 벡터화 %.4f s\n', t_grow, t_pre, t_vec);
fprintf('세 결과가 같은가: %d\n', isequal(y1, y2) && max(abs(y2 - y3)) < 1e-12);
```

출력(이 컴퓨터에서 한 번 실행한 값):

```text
자라는 배열 1.165 s | 미리 할당 1.118 s | 벡터화 0.0033 s
세 결과가 같은가: 1
```

벡터화가 약 300배 빨랐습니다. 반면 Octave에서는 미리 할당의 이득이 작게 나왔는데, Octave는 한 줄씩 해석하는 비용 자체가 커서 그 비용이 메모리 재할당 비용을 가리기 때문입니다. **MATLAB에서는 자라는 배열이 눈에 띄게 느리고**, 편집기의 Code Analyzer가 해당 줄에 경고 밑줄을 긋습니다. 어느 쪽이든 결론은 같습니다. 미리 할당은 습관으로, 큰 이득은 벡터화에서 얻습니다. 마지막 줄처럼 **빠른 버전이 같은 답을 내는지** 꼭 확인합니다.

### 예시 2 — 오류와 스택 읽기, 경고, 단위 테스트

`count_crossings.m`:

```matlab
function n = count_crossings(sig, thr)
%COUNT_CROSSINGS  신호가 thr를 아래에서 위로 넘는 횟수.
    above = sig > thr;
    n = sum(diff(above) == 1);
end
```

`test_count_crossings.m`:

```matlab
% 작은 단위 테스트: 답을 아는 입력으로 함수를 점검한다
assert(count_crossings([0 0 0], 0.5) == 0)                  % 한 번도 안 넘음
assert(count_crossings([0 1 0 1 0], 0.5) == 2)              % 두 번
assert(count_crossings([1 1 1], 0.5) == 0)                  % 처음부터 위: 넘은 것이 아님
assert(count_crossings([0 0.5 1], 0.5) == 1)                % 경계값과 같은 점
assert(count_crossings([], 0.5) == 0)                       % 빈 입력
disp('test_count_crossings: 모든 검사 통과')
```

실행 스크립트:

```matlab
% 오류 메시지와 호출 스택 읽기
try
    count_crossings([0 1 0], [0.5 0.5])
catch err
    fprintf('메시지: %s\n', err.message);
    for k = 1:numel(err.stack)
        fprintf('  위치: %s (줄 %d)\n', err.stack(k).name, err.stack(k).line);
    end
end
% 부동소수점 비교는 허용 오차로
total = 0;
for k = 1:10, total = total + 0.1; end
total == 1
abs(total - 1) < 1e-10
% 경고는 실행을 멈추지 않는다
warning('demo:lowN', '표본 수가 %d로 작습니다.', 4);
disp('경고 뒤에도 계속 실행됨')
test_count_crossings
```

출력:

```text
메시지: mx_el_gt: nonconformant arguments (op1 is 1x3, op2 is 1x2)
  위치: count_crossings (줄 3)
  위치: B6_ex2 (줄 3)
ans = 0
ans = 1
warning: 표본 수가 4로 작습니다.
warning: called from
    B6_ex2 at line 16 column 1

경고 뒤에도 계속 실행됨
test_count_crossings: 모든 검사 통과
```

스택은 "count_crossings의 3번째 줄(`sig > thr`)에서, B6_ex2의 3번째 줄이 부른 호출 때문에" 실패했다고 말합니다. 문턱에 벡터를 넣은 호출자 쪽 실수입니다. 이런 실수를 함수가 친절히 알려 주게 하려면 함수 첫머리에 `if ~isscalar(thr), error('count_crossings:thr', 'thr는 숫자 하나여야 합니다'); end`를 넣습니다(직접 해보기 2). 0.1을 열 번 더한 값이 1과 `==`로는 다르다는 것도 다시 확인하세요.

### 예시 3 — 프로파일러로 느린 곳 찾기

```matlab
% 프로파일러: 어디서 시간이 드는지 찾기
rng(2);
sig = randn(1, 5e5);
profile clear
profile on
n1 = count_crossings(sig, 1);
s  = sort(sig);
c  = cumsum(sig);
profile off
p = profile('info');
names = {p.FunctionTable.FunctionName};
[~, order] = sort([p.FunctionTable.TotalTime], 'descend');
fprintf('시간이 가장 많이 든 항목 3개:\n');
fprintf('  %s\n', names{order(1:3)});
```

출력:

```text
시간이 가장 많이 든 항목 3개:
  sort
  diff
  cumsum
```

이 결과는 실행마다 순서가 바뀔 수 있습니다. 실제 분석에서는 `profile viewer`(MATLAB)나 `profshow`(Octave)로 표 전체를 보며, 시간 대부분을 쓰는 한두 줄만 고칩니다.

> **Octave와 다른 점:** `profile('info')`의 구조(필드 이름)는 MATLAB과 다릅니다. MATLAB에서는 `p = profile('info'); p.FunctionTable`의 필드 이름이 `FunctionName`, `TotalTime`으로 같아 위 코드가 대체로 돌지만, 버전에 따라 확인이 필요합니다(실행 확인 안 됨).

## 직접 해보기

1. `count_crossings.m`, `test_count_crossings.m`을 `notebooks/advanced/B/`에 만들고 테스트를 돌립니다.
2. **입력 점검 추가.** `count_crossings`에 `thr`가 숫자 하나인지, `sig`가 벡터인지 확인하는 `error` 줄을 넣고, 그 오류가 실제로 나는지 확인하는 테스트를 `try/catch`로 추가합니다(오류가 안 나면 `error('테스트 실패')`).
3. **경계 사례 하나 더.** `sig`에 NaN이 섞인 경우(`[0 NaN 1]`)에 함수가 몇을 돌려줘야 맞는지 정하고, 그 결정을 도움말 주석과 테스트에 함께 적습니다.
4. **중단점 연습.** `dbstop in count_crossings at 4`를 걸고 `count_crossings([0 1 0 1], 0.5)`를 부릅니다. 멈춘 상태에서 `above`를 찍어 보고 `dbcont`로 마칩니다. 끝나면 `dbclear all`.
5. **속도.** `B6_speed.m`에 예시 1을 넣고 n을 1e4, 1e5, 1e6으로 바꿔 시간을 표로 적습니다. 반복문 버전 하나를 논리 인덱스로 바꾸는 과제: `y = zeros(size(x)); for k ... if x(k) > 5, y(k) = x(k)^2; end, end`를 한 줄로 씁니다.
6. **재현성 머리말.** 오늘 만든 스크립트 맨 위에 날짜, 프로그램과 버전(`version`), 난수 씨앗, 입력 파일 경로를 적는 주석·코드 머리말을 붙입니다. 버전 관리는 본 과정 Day F7·Day 38의 Git 습관을 그대로 씁니다(`.m` 파일은 텍스트라 Git에 잘 맞습니다).

⚠️ **흔한 오류 1 — 고친 함수가 반영되지 않음.** 같은 이름의 함수가 경로 두 곳에 있으면 앞의 것이 불립니다. `which -all count_crossings`로 확인합니다. 파일을 고친 뒤에도 이상하면 `clear functions`(MATLAB) 또는 `clear all`.

⚠️ **흔한 오류 2 — 모든 것을 `try/catch`로 감싸기.** 오류가 사라진 것처럼 보여도 결과가 틀린 채로 끝까지 실행됩니다. 오류는 멈추라고 있는 것입니다.

## 퀴즈

**1.** 함수의 결합도를 **낮추는** 변경은?

(a) 전역 변수로 설정값을 받던 것을 입력 인수로 받는다 (b) 함수 안에서 파일 경로를 고정한다 (c) 그림 그리기와 통계 계산을 한 함수에 합친다 (d) 입력 구조체의 특정 필드 이름에 기대도록 한다

<details><summary>정답 보기</summary>

(a). 바깥 상태에 덜 기댈수록 결합도가 낮습니다. (c)는 응집도를 떨어뜨리고, (b)와 (d)는 결합도를 높입니다.

</details>

**2.** 호출 스택이 `myfilter (줄 12)` 다음 `run_analysis (줄 40)`을 보여 줍니다. 무엇부터 보나요? (단답)

<details><summary>정답 보기</summary>

오류가 난 곳은 `myfilter`의 12번째 줄이고, 그 호출을 만든 곳은 `run_analysis`의 40번째 줄입니다. 12번째 줄에서 무엇이 실패했는지 보고, 원인이 입력값이라면 40번째 줄에서 넘긴 값을 확인합니다.

</details>

**3.** 단위 테스트에서 특히 넣어야 하는 입력은?

(a) 가장 흔한 입력 하나 (b) 빈 입력, 문턱과 같은 값, NaN 같은 경계 사례 (c) 무작위 입력만 (d) 테스트는 필요 없다

<details><summary>정답 보기</summary>

(b). 버그는 경계에서 숨습니다. 답을 손으로 알 수 있는 작은 경계 사례가 가장 효율적인 테스트입니다.

</details>

**4.** 반복문으로 `y(k) = ...`를 1백만 번 채웁니다. 반복문 **앞에** 넣을 한 줄은? (단답)

<details><summary>정답 보기</summary>

`y = zeros(1, 1e6);`(필요한 모양으로) 미리 할당합니다. 매번 배열이 자라며 복사되는 비용을 없앱니다.

</details>

**5.** 코드가 느릴 때의 올바른 순서는?

(a) 감으로 고친다 → 잰다 (b) 잰다(`tic/toc`, 프로파일러) → 가장 오래 걸리는 곳을 고친다 → 결과가 같은지 확인한다 (c) 모든 반복문을 벡터화한다 (d) 컴퓨터를 바꾼다

<details><summary>정답 보기</summary>

(b). 시간은 대개 한두 곳에서 쓰이므로 측정 없이 고치면 헛수고가 됩니다. 빨라진 코드가 같은 답을 내는지 확인하는 것도 빼면 안 됩니다.

</details>

> **더 읽을거리:** Wallisch P, et al. *MATLAB for Neuroscientists*, 2nd ed. Academic Press (Elsevier), 2014 — [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0) · Cohen MX. *MATLAB for Brain and Cognitive Scientists*. MIT Press, 2017 — [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/) · [GNU Octave 문서](https://docs.octave.org/latest/) · [Octave와 MATLAB의 차이](https://wiki.octave.org/Differences_between_Octave_and_Matlab) · Wilson G, et al. Best practices for scientific computing. *PLoS Biol.* 2014;12:e1001745. doi:[10.1371/journal.pbio.1001745](https://doi.org/10.1371/journal.pbio.1001745)

## 오늘의 산출물 체크리스트
- [ ] `test_count_crossings.m`이 입력 점검·NaN 사례를 포함해 통과한다.
- [ ] 중단점으로 함수 안의 변수를 찍어 보았다.
- [ ] n별 실행 시간 표와 벡터화 전후 결과 일치 확인이 `B6_speed.m`에 있다.
- [ ] 스크립트마다 버전·씨앗·입력 경로 머리말을 붙였다.

---
[← 이전](day-B5.md) · [코스 지도](../../../README.md) · [다음 →](day-B7.md)
