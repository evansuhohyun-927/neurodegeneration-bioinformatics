# Day B3 — 자료형: 숫자와 정밀도, 문자열, cell, struct, table

> **주차:** 심화 파트 B — MATLAB/Octave 과학 계산 입문 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/B/B3_subject_records.m`
>
> **먼저 끝내 둘 레슨:** Day B2. 본 과정 Day F2(변수와 자료형), Day F3(리스트와 딕셔너리), Day 4(tidy data와 메타데이터)를 떠올리면 비교가 쉽습니다.

## 오늘의 목표
- double, single, 정수형, logical의 차이와 부동소수점 비교의 함정을 설명할 수 있다.
- char 문자열과 cell 배열로 이름 목록을 다루고, `strcmp`·`sprintf`·`strsplit`·`regexp`를 쓸 수 있다.
- struct(구조체)와 struct 배열로 참가자 기록을 정리하고, MATLAB의 table이 Octave에서 어떻게 다른지 안다.

## 🎬 영상으로 먼저 보기

- [MATLAB Crash Course for Beginners — freeCodeCamp.org](https://www.youtube.com/watch?v=7f50sQYjNRA) (1:57:45)
- **무엇에 주목할까:** 자료형(data types)과 문자열을 다루는 부분을 찾아 봅니다. 숫자 행렬과 문자열을 한 변수에 섞으려 할 때 무슨 일이 생기는지가 오늘 cell과 struct가 필요한 이유입니다.

- [MATLAB cell array and structure tutorial (검색 링크)](https://www.youtube.com/results?search_query=MATLAB+cell+array+vs+structure+tutorial)
- **무엇에 주목할까:** 중괄호 `{}`와 소괄호 `()`로 cell을 꺼낼 때 결과가 어떻게 다른지, 구조체의 필드 이름을 점(`.`)으로 부르는 장면을 확인하세요.

## 개념 설명

### 숫자 자료형과 부동소수점: "같다"를 조심하기

MATLAB에서 숫자를 그냥 입력하면 **double**(배정밀도 부동소수점, 8바이트, 유효숫자 약 15–16자리)입니다. 메모리를 아끼려고 **single**(4바이트, 약 7자리)이나 **정수형**(`int8`, `uint8`, `int16`, `uint16`, `int32` …)을 쓰기도 합니다. 장비가 기록한 원자료나 영상 픽셀은 흔히 `int16`이나 `uint8`로 저장됩니다.

정수형에는 두 가지 함정이 있습니다. 첫째, 범위를 넘으면 오류 대신 **끝값에 붙어 버립니다**(saturation). `uint8`은 0–255이므로 영상에 100을 더하면 밝은 픽셀이 모두 255에 몰립니다. 둘째, 정수끼리 나누면 결과도 정수로 **반올림**됩니다. 그래서 정수형 원자료는 계산 전에 `double(x)`로 바꾸는 것이 안전합니다. 반대로 double을 single로 바꾸면 정밀도가 줄어듭니다. 대부분의 생체 신호는 잡음이 7자리보다 훨씬 크므로 문제가 없지만, 아주 작은 단위(예: 테슬라 단위의 MEG 자기장, 10⁻¹⁵ 수준)를 큰 값과 함께 계산하면 정보가 사라질 수 있습니다.

부동소수점은 0.1 같은 수를 2진법으로 정확히 표현하지 못합니다. 그래서 `0.1 + 0.2 == 0.3`이 거짓입니다. 계산 결과를 **`==`로 비교하지 말고 허용 오차**로 비교하세요: `abs(a - b) < 1e-10`. 1 근처에서 표현할 수 있는 가장 작은 간격은 `eps`(약 2.2×10⁻¹⁶)입니다. 이와 관련된 특별한 값이 `Inf`(무한대, 1/0)와 `NaN`(Not a Number, 0/0)입니다. `NaN`은 결측값 표시로도 많이 쓰는데, **NaN이 하나라도 섞이면 `mean`, `sum`, `std`의 결과가 NaN**이 됩니다. `isnan`으로 골라 빼거나 `mean(x, 'omitnan')`을 씁니다. NaN은 자기 자신과도 같지 않아서(`NaN == NaN`은 거짓) 반드시 `isnan`으로 찾아야 합니다.

**logical**(참/거짓)은 비교 연산의 결과이고, 더하면 참의 개수가 됩니다(`sum(x > 3)`은 3보다 큰 원소 수). Day B2의 논리 인덱스가 이 자료형을 씁니다.

### 문자열: char 배열과 cell 배열

작은따옴표로 만든 `'SNCA'`는 **char 배열**, 즉 글자 네 개로 된 1×4 행 벡터입니다. 그래서 대괄호로 이어 붙이면(`[gene '-AS1']`) 문자열 연결이 되고, `==`로 비교하면 글자 하나하나를 비교한 논리 벡터가 나오며 길이가 다르면 오류가 납니다. **문자열 전체가 같은지는 `strcmp`**(대소문자 무시는 `strcmpi`)로 확인합니다. 숫자를 문자열에 넣을 때는 `sprintf('sub-%02d', 7)`(→ `sub-07`)이나 `num2str`, 반대로 문자열을 숫자로는 `str2double`을 씁니다. 자르기는 `strsplit`, 이어 붙이기는 `strjoin`, 패턴 찾기는 `regexp`입니다.

char 배열 여러 개를 한 행렬에 쌓으려면 길이가 모두 같아야 합니다. 유전자 이름처럼 길이가 제각각인 문자열 목록은 **cell 배열**에 담습니다. cell은 칸마다 아무 자료(숫자, 문자열, 행렬, 다른 cell)나 넣을 수 있는 상자 묶음입니다. 비유하면 **약품 보관함**입니다. 칸 모양은 같지만 칸 안에 든 물건은 제각각입니다. 여기서 괄호 규칙이 중요합니다. `names{2}`(중괄호)는 칸 **안의 물건**(char)을 꺼내고, `names(2)`(소괄호)는 칸을 **상자째**(1×1 cell) 꺼냅니다. cell의 모든 칸에 같은 함수를 적용할 때는 `cellfun`을 씁니다.

> **Octave와 다른 점 — string 자료형:** MATLAB R2016b부터 큰따옴표 `"SNCA"`는 char가 아니라 **string 객체**입니다. string 배열은 `["SNCA" "LRRK2"]`처럼 길이가 달라도 한 배열에 담기고 `==`로 비교할 수 있으며, `contains`, `startsWith`, `join` 같은 함수와 함께 씁니다. **Octave 11에는 string 자료형이 없고** 큰따옴표도 char를 만듭니다(그리고 `\n` 같은 이스케이프를 해석합니다). Octave에 `contains`도 없습니다. MATLAB과 Octave 양쪽에서 도는 코드를 원하면 **char + cell + `strcmp`/`regexp`** 조합을 쓰세요.

### struct와 struct 배열: 이름 붙은 칸

**struct(구조체)** 는 필드 이름으로 자료를 묶습니다. `s.id = 'P01'; s.age = 67; s.stride = [1.08 1.12 …];`처럼 점 뒤에 이름을 붙이면 됩니다. Python의 딕셔너리와 비슷하지만, 키가 문자열 필드 이름으로 고정되어 있고 점 표기로 부른다는 점이 다릅니다. 한 참가자의 메타데이터(ID, 군, 나이, 표본추출률, 파일 경로)와 그 참가자의 신호를 한 변수에 묶는 데 아주 좋습니다. 필드 이름을 변수로 정하고 싶으면 **동적 필드** `s.(fld)`를 씁니다.

참가자가 여러 명이면 **struct 배열**을 만듭니다. `subj(1)`, `subj(2)`, …가 같은 필드를 가진 구조체입니다. `[subj.age]`는 모든 참가자의 나이를 한 벡터로 모으고, 문자열 필드는 `{subj.group}`처럼 중괄호로 모아 cell을 만든 뒤 `strcmp`로 고릅니다. 필드마다 길이가 다른 자료(참가자마다 보폭 수가 다름)도 담을 수 있다는 것이 행렬과의 큰 차이입니다. 함수 `fieldnames`, `isfield`, `rmfield`, `struct2cell`, `arrayfun`이 자주 같이 쓰입니다. 이름 → 값 사전이 꼭 필요하면 `containers.Map`도 있습니다(MATLAB, Octave 모두).

### table: MATLAB의 데이터프레임(Octave에는 기본으로 없음)

MATLAB R2013b부터 있는 **table**은 pandas DataFrame과 같은 역할을 합니다. 열마다 이름과 자료형이 다를 수 있고, `T.age`, `T(T.group == "PD", :)`처럼 쓰며, `readtable`로 CSV를 바로 읽습니다. 본 과정 Day 4의 tidy data 원칙(한 행 = 한 관측, 한 열 = 한 변수)이 그대로 적용됩니다.

**Octave 11 기본 설치에는 `table`, `readtable`, `categorical`, `datetime`이 없습니다.** Octave Packages의 `datatypes` 패키지를 설치하면 이 함수들과 `writetable`을 쓸 수 있습니다. 한 번만 설치하고, 쓸 때마다 불러옵니다.

```matlab
pkg install -forge datatypes   % 처음 한 번 (인터넷 필요)
pkg load datatypes             % Octave를 켤 때마다
```

아래 코드는 MATLAB(R2013b 이상)에서는 그대로, Octave에서는 `pkg load datatypes` 뒤에 실행됩니다. 출력은 Octave 11.3 + datatypes 패키지에서 실행한 그대로입니다(MATLAB은 표의 테두리 모양이 조금 다릅니다).

```matlab
% MATLAB: 그대로 실행 / Octave: 먼저 pkg load datatypes
T = table({'P01'; 'C01'; 'P02'}, {'PD'; 'control'; 'PD'}, [67; 64; 71], ...
          'VariableNames', {'id', 'group', 'age'});
T(strcmp(T.group, 'PD'), :)
mean(T.age)
```

```text
ans =
  2x3 table

      id       group     age    
    _______    ______    ___    

    {'P01'}    {'PD'}     67    
    {'P02'}    {'PD'}     71    

ans = 67.333
```

패키지를 설치할 수 없는 환경이라면, Octave에서 같은 일을 하려면 struct 배열(예시 3)이나 "열마다 변수 하나 + cell 열"을 씁니다. 표 형태 분석이 길어지면 그 부분은 본 과정의 pandas로 처리하는 것이 현실적인 선택입니다.

## 예시로 이해하기

> 출력은 GNU Octave 11.3에서 실행한 그대로입니다.

### 예시 1 — 숫자 자료형, 정밀도, NaN

```matlab
% 숫자 자료형과 정밀도
class(3)
x8 = int8([100 120 140])     % int8 범위는 -128~127: 넘으면 잘린다(saturation)
int8(7) / int8(2)            % 정수끼리 나누면 반올림된 정수
u = uint16(4000) * 20        % uint16 최대 65535에서 멈춘다
double(u) * 20               % double로 바꾸고 계산해야 한다
eps                          % 1 근처 double의 간격
0.1 + 0.2 == 0.3             % 부동소수점 비교의 함정
abs((0.1 + 0.2) - 0.3) < 1e-12
single(pi) - pi              % single은 약 7자리만 정확
flag = [true false true];
class(flag)
sum(flag)                    % 논리값은 더하면 개수
r = [3.1 NaN 2.9 3.4];
mean(r)                      % NaN 하나가 결과를 오염시킨다
mean(r(~isnan(r)))           % NaN 빼고 평균 (MATLAB/Octave 공통)
mean(r, 'omitnan')           % 같은 결과, 더 짧게
1/0, -1/0, 0/0
```

출력:

```text
ans = double
x8 =

  100  120  127

ans = 4
u = 65535
ans = 1310700
ans = 2.2204e-16
ans = 0
ans = 1
ans = 0
ans = logical
ans = 2
ans = NaN
ans = 3.1333
ans = 3.1333
ans = Inf
ans = -Inf
ans = NaN
```

두 군데를 꼭 보세요. `u = 65535`에서 `double(u) * 20`이 80000이 아니라 1310700인 것은, `u`가 **이미 65535로 잘린 뒤**이기 때문입니다. 정보는 처음 잘릴 때 사라지고 되돌아오지 않습니다. `single(pi) - pi`가 0으로 보이는 것은 single과 double을 섞어 계산하면 결과가 single이 되어, single의 정밀도로는 차이가 표시되지 않기 때문입니다(MATLAB도 같음). 차이를 보려면 `double(single(pi)) - pi`를 계산해 보세요(직접 해보기 1).

> 출력에서 `ans = 0`은 두 번 나옵니다. 첫째(`ans = 1` 앞)는 `0.1 + 0.2 == 0.3`의 거짓, 둘째(`ans = 1` 뒤)는 `single(pi) - pi`입니다.

### 예시 2 — 문자열과 cell 배열

```matlab
% 문자열(char)과 cell 배열
gene = 'SNCA';
class(gene)
size(gene)                   % char는 글자의 행벡터
[gene '-AS1']                % 대괄호로 이어 붙이기
label = sprintf('sub-%02d_%s.csv', 7, 'walk')
strcmp(gene, 'SNCA')         % 문자열 비교는 == 대신 strcmp
try
    'SNCA' == 'LRRK2'        % 길이가 다르면 ==는 오류
catch err
    disp(err.message)
end
names = {'SNCA', 'LRRK2', 'GBA1'}   % 길이가 다른 문자열은 cell에
class(names)
names{2}                     % 중괄호: 내용물 꺼내기
class(names(2))              % 괄호: 작은 cell 그대로
lens = cellfun(@numel, names)
upper(strjoin(names, ', '))
parts = strsplit('sub-07_walk_run-2', '_')
tok = regexp('sub-07_walk', 'sub-(\d+)', 'tokens');
subj = str2double(tok{1}{1})
```

출력:

```text
ans = char
ans =

   1   4

ans = SNCA-AS1
label = sub-07_walk.csv
ans = 1
mx_el_eq: nonconformant arguments (op1 is 1x4, op2 is 1x5)
names =
{
  [1,1] = SNCA
  [1,2] = LRRK2
  [1,3] = GBA1
}

ans = cell
ans = LRRK2
ans = cell
lens =

   4   5   4

ans = SNCA, LRRK2, GBA1
parts =
{
  [1,1] = sub-07
  [1,2] = walk
  [1,3] = run-2
}

subj = 7
```

`regexp(..., 'tokens')`는 괄호로 묶은 부분(`(\d+)`, 숫자 한 개 이상)을 cell 안의 cell로 돌려줍니다. 그래서 `tok{1}{1}`로 두 번 꺼낸 뒤 `str2double`로 숫자로 바꿉니다. 파일 이름에서 참가자 번호를 뽑는 일은 데이터 정리에서 매일 하는 작업입니다.

### 예시 3 — struct와 struct 배열로 참가자 기록 만들기

```matlab
% struct: 이름 붙은 칸에 서로 다른 자료를 담는다
s.id      = 'P01';
s.group   = 'PD';
s.age     = 67;
s.stride  = [1.08 1.12 1.05 1.10];
s
fieldnames(s)'
mean(s.stride)
% struct 배열: 참가자 여러 명
subj(1) = s;
subj(2) = struct('id', 'C01', 'group', 'control', 'age', 64, 'stride', [1.02 1.01 1.04]);
subj(3) = struct('id', 'P02', 'group', 'PD', 'age', 71, 'stride', [1.20 1.31 1.18 1.25 1.22]);
size(subj)
ages = [subj.age]                        % 필드 값을 한 줄로 모으기
isPD = strcmp({subj.group}, 'PD')        % 문자열 필드는 {}로 모아 cell
mean_stride = arrayfun(@(p) mean(p.stride), subj)
{subj(isPD).id}
fld = 'age';
subj(2).(fld)                            % 동적 필드 이름
% containers.Map: 이름 -> 값 사전 (Python dict와 비슷)
m = containers.Map({'SNCA', 'LRRK2'}, {4, 12});
m('LRRK2')
keys(m)
```

출력:

```text
s =

  scalar structure containing the fields:

    id = P01
    group = PD
    age = 67
    stride =

       1.0800   1.1200   1.0500   1.1000


ans =
{
  [1,1] = id
  [1,2] = group
  [1,3] = age
  [1,4] = stride
}

ans = 1.0875
ans =

   1   3

ages =

   67   64   71

isPD =

  1  0  1

mean_stride =

   1.0875   1.0233   1.2320

ans =
{
  [1,1] = P01
  [1,2] = P02
}

ans = 64
ans = 12
ans =
{
  [1,1] = LRRK2
  [1,2] = SNCA
}
```

참가자마다 보폭 개수가 4, 3, 5개로 다른데도 한 변수에 깔끔히 들어갔습니다. 같은 자료를 행렬 하나에 넣으려 했다면 빈칸을 NaN으로 채워야 했을 것입니다. `arrayfun(@(p) mean(p.stride), subj)`는 "subj의 원소 p마다 `mean(p.stride)`를 계산해 모으라"는 뜻이며, `@(p) ...`는 Day B4에서 배울 익명 함수입니다. `keys(m)`이 알파벳 순서로 나온 것도 확인하세요.

> **Octave와 다른 점:** 구조체를 화면에 찍는 모양이 다릅니다. MATLAB은 `s = struct with fields:` 아래에 `id: 'P01'` 형태로 보여 줍니다. 내용은 같습니다.

## 직접 해보기

1. **정밀도 확인.** `double(single(pi)) - pi`를 계산해 single의 오차 크기를 봅니다. `x = uint8(250); x + 10`, `double(x) + 10`도 비교합니다.
2. **NaN 다루기.** `r = [3.1 NaN 2.9 NaN 3.4];`에서 결측 개수(`sum(isnan(r))`), 결측을 뺀 평균, 결측을 앞 값으로 채운 벡터를 각각 만들어 봅니다(마지막은 반복문으로 써도 됩니다).
3. **파일 이름 만들기와 해석하기.** `sprintf`로 `sub-01_walk.csv` … `sub-12_walk.csv` 이름 12개를 cell 배열에 만들고, 다시 `regexp`로 번호만 숫자 벡터로 뽑아 1:12와 같은지 `isequal`로 확인합니다.
4. **참가자 기록.** `notebooks/advanced/B/B3_subject_records.m`에 struct 배열로 가상 참가자 6명(PD 3, control 3)을 만들고, 군별 평균 나이와 군별 평균 보폭 CV를 출력합니다. 같은 표를 pandas로 만든다면 어떤 열 구성이 될지 주석으로 적습니다.
5. **(MATLAB이 있으면)** 4의 자료를 `struct2table(subj)`로 table로 바꿔 보고, Octave 사용자는 이 단계를 건너뛰고 "MATLAB 전용"이라고 기록합니다.

⚠️ **흔한 오류 1 — `{}`와 `()`를 바꿔 쓰기.** `names(2)`를 `strcmp`나 `fprintf('%s', ...)`에 넣으면 cell이라 오류가 나거나 이상하게 찍힙니다. "내용물이 필요하면 중괄호"라고 기억하세요.

⚠️ **흔한 오류 2 — `==`로 문자열 비교.** `if group == 'PD'`는 group이 `'control'`이면 길이가 달라 오류가 나고, 길이가 같은 다른 문자열이면 논리 벡터가 되어 `if`가 예상과 다르게 동작합니다. 항상 `strcmp`를 씁니다.

## 퀴즈

**1.** `x = uint8(200) + uint8(100)`의 결과는?

(a) 300 (b) 255 (c) 44 (d) 오류

<details><summary>정답 보기</summary>

(b). uint8의 최대값 255에서 멈춥니다(saturation). C 언어처럼 넘친 값이 돌아가는(44) 방식이 아닙니다. 계산 전에 double로 바꾸면 300을 얻습니다.

</details>

**2.** `c = {'a', [1 2 3], 'hello'};`에서 `c{2}`와 `c(2)`의 `class`는 각각? (단답)

<details><summary>정답 보기</summary>

`c{2}`는 double(내용물인 [1 2 3]), `c(2)`는 cell(1×1 cell 상자)입니다.

</details>

**3.** 계산 결과 `v`가 0인지 확인하는 코드로 가장 안전한 것은?

(a) `v == 0` (b) `abs(v) < 1e-10` (c) `isequal(v, 0)` (d) `v = 0`

<details><summary>정답 보기</summary>

(b). 부동소수점 계산 결과는 0에 아주 가까운 작은 수(예: 1e-17)일 수 있으므로 허용 오차로 비교합니다. (d)는 비교가 아니라 대입입니다.

</details>

**4.** 참가자마다 기록 길이가 다른 보폭 데이터와 문자열 메타데이터를 한 변수에 담으려 합니다. Octave에서도 도는 가장 알맞은 자료형은?

(a) double 행렬 (b) char 행렬 (c) struct 배열 (d) table

<details><summary>정답 보기</summary>

(c). struct 배열은 필드마다 자료형과 길이가 달라도 됩니다. table도 MATLAB에서는 가능하지만 Octave 기본 설치에는 없습니다.

</details>

**5.** MATLAB에서 `"PD" == "PD"`는 참이 되는데, 같은 줄이 Octave에서 다르게 동작할 수 있는 이유는? (단답)

<details><summary>정답 보기</summary>

MATLAB에서 큰따옴표는 string 객체를 만들어 `==`가 문자열 전체를 비교하지만, Octave에서는 큰따옴표도 char 배열이라 글자별 비교가 됩니다(이 예에서는 [1 1]이 나옴). 두 프로그램에서 같게 동작하게 하려면 `strcmp('PD', 'PD')`를 씁니다.

</details>

> **더 읽을거리:** Wallisch P, et al. *MATLAB for Neuroscientists*, 2nd ed. Academic Press (Elsevier), 2014 — [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0) · Cohen MX. *MATLAB for Brain and Cognitive Scientists*. MIT Press, 2017 — [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/) · [GNU Octave 문서](https://docs.octave.org/latest/) · [Octave와 MATLAB의 차이](https://wiki.octave.org/Differences_between_Octave_and_Matlab)

## 오늘의 산출물 체크리스트
- [ ] 정수형 saturation, 부동소수점 비교, NaN 전파를 직접 확인했다.
- [ ] 파일 이름 12개를 만들고 번호를 다시 뽑아 일치함을 확인했다.
- [ ] `B3_subject_records.m`이 struct 배열로 군별 평균 나이와 CV를 출력한다.
- [ ] 쓰는 프로그램(MATLAB/Octave)에서 table과 string이 되는지 확인해 기록했다.

---
[← 이전](day-B2.md) · [코스 지도](../../../README.md) · [다음 →](day-B4.md)
