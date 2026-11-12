# Day B1 — MATLAB과 Octave 시작하기: 설치, 명령 창, 첫 스크립트

> **주차:** 심화 파트 B — MATLAB/Octave 과학 계산 입문 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/B/B1_stride_summary.m`
>
> **먼저 끝내 둘 레슨:** 본 과정 0주차(Day F1–F7). Python으로 변수·반복문·함수를 한 번 다뤄 봤다는 전제로, 오늘은 "같은 일을 MATLAB 문법으로는 어떻게 쓰는가"에 집중합니다.

## 오늘의 목표
- MATLAB(유료)과 GNU Octave(무료) 중 무엇을 쓸지 정하고 설치해 실행할 수 있다.
- 명령 창에서 계산하고, 변수를 만들고, 작업 공간(workspace)을 확인할 수 있다.
- `.m` 스크립트 파일을 만들어 실행하고, Python과 MATLAB의 핵심 차이(1부터 세는 인덱스 등)를 표로 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [MATLAB Crash Course for Beginners — freeCodeCamp.org](https://www.youtube.com/watch?v=7f50sQYjNRA) (1:57:45)
- **무엇에 주목할까:** 오늘은 앞부분(프로그램 화면, 변수, 산술 연산)만 보면 충분합니다. 화면 왼쪽의 현재 폴더, 가운데 명령 창, 오른쪽 작업 공간이 각각 무슨 일을 하는지 눈여겨보세요. 행렬과 인덱스 부분은 Day B2에서 이어 봅니다.

- [The Complete MATLAB Course: Beginner to Advanced! — Joseph Delgadillo](https://www.youtube.com/watch?v=T_ekAD7U-wU) (4:22:09)
- **무엇에 주목할까:** 아주 긴 강의라 처음부터 끝까지 볼 필요는 없습니다. 목차에서 "script"와 "variables" 부분만 골라, 스크립트를 저장하고 실행하는 손동작을 따라 해 보세요. 영상의 MATLAB 화면과 Octave GUI는 모양이 조금 다르지만 개념은 같습니다.

## 개념 설명

### MATLAB은 무엇이고, 왜 신경과학 연구실에서 자주 보이나

MATLAB은 "MATrix LABoratory"의 줄임말입니다. 이름 그대로 **행렬(matrix)을 기본 단위로 계산하는 프로그래밍 환경**입니다. Python에서는 숫자 표를 다루려면 numpy를 불러와야 했지만, MATLAB에서는 숫자 하나도 1×1 행렬이고, 기록 한 줄은 1×N 행렬이며, 시행 × 시점 데이터는 그냥 2차원 행렬입니다. 처음부터 "표 계산기"로 태어난 언어라고 생각하면 됩니다.

신경과학과 인지과학에서 MATLAB이 오래 쓰여 온 이유는 기술보다 **문화**에 가깝습니다. 뇌파(EEG/MEG) 분석 도구인 EEGLAB·FieldTrip, fMRI 도구인 SPM, 심리 실험 자극 제시 도구인 Psychtoolbox가 모두 MATLAB으로 만들어졌고, 많은 연구실의 수십 년 치 분석 코드가 `.m` 파일로 남아 있습니다. 대학원이나 연구실에 들어가면 "선배가 남긴 MATLAB 코드"를 읽고 고쳐야 하는 일이 흔합니다. 이 파트의 목표가 바로 그것입니다. 새 분석을 MATLAB으로 시작하라는 뜻이 아니라, **MATLAB 코드를 읽고, 돌리고, 고치고, 필요하면 Python으로 옮길 수 있는 사람**이 되는 것입니다.

### MATLAB(유료)과 GNU Octave(무료)

MATLAB은 MathWorks사의 상용 소프트웨어입니다. 개인이 사면 비싸지만, 많은 대학이 **학교 전체 라이선스(Campus-Wide License)** 를 갖고 있어 학생은 학교 계정으로 무료 설치할 수 있습니다. 먼저 학교 IT 센터나 소프트웨어 안내 페이지에서 "MATLAB"을 검색해 보세요. MathWorks의 학교 라이선스 안내 페이지([eligibility](https://www.mathworks.com/academia/tah-support-program/eligibility.html))에서도 소속 기관을 확인할 수 있습니다. 신호 처리·통계·영상 처리 같은 **툴박스(toolbox)** 는 따로 라이선스가 필요하므로, 학교 라이선스에 어떤 툴박스가 포함되는지도 확인합니다.

**GNU Octave**는 MATLAB 문법을 거의 그대로 이해하는 무료·오픈소스 프로그램입니다([다운로드](https://octave.org/download)). Windows, macOS, Linux에서 돌아가고, 4.0 버전부터는 MATLAB과 비슷한 GUI 화면도 있습니다. macOS에서 Homebrew를 쓴다면 `brew install octave` 한 줄이면 됩니다. 이 파트의 모든 예시 코드는 **GNU Octave 11.3에서 실제로 실행**한 결과입니다.

둘의 관계는 "같은 악보를 연주하는 다른 악기"와 비슷합니다. 기본 문법(행렬, 인덱스, 반복문, 함수)은 거의 같습니다. 차이는 주로 세 군데서 납니다. (1) 최근 MATLAB에 추가된 기능(`table`, `string` 자료형, `readmatrix`, `tiledlayout` 등)이 Octave에 없거나 별도 패키지에 있고, (2) 툴박스 함수 대신 Octave **패키지**(signal, statistics 등)를 따로 설치해야 하며, (3) 오류 메시지 문구와 난수 생성 결과가 다릅니다. 각 레슨에서 차이가 나는 곳마다 **"Octave와 다른 점"** 상자로 짚습니다. 자세한 목록은 Octave 위키의 [Differences between Octave and Matlab](https://wiki.octave.org/Differences_between_Octave_and_Matlab)에 있습니다.

### 화면 구성과 작업 흐름: 명령 창, 작업 공간, 현재 폴더, 경로

MATLAB이나 Octave GUI를 열면 대개 네 영역이 보입니다.

- **명령 창(Command Window):** `>>` 뒤에 한 줄씩 입력하면 바로 실행됩니다. Python의 대화형 셸(`>>>`)과 같습니다.
- **작업 공간(Workspace):** 지금 메모리에 있는 변수 목록입니다. 명령 창에서 `who`(이름만), `whos`(크기·자료형까지)로도 볼 수 있습니다.
- **현재 폴더(Current Folder):** MATLAB이 "지금 서 있는" 폴더입니다. `pwd`로 확인하고 `cd`로 옮깁니다. 파일을 읽고 쓸 때 기준이 되는 곳입니다.
- **편집기(Editor):** `.m` 파일을 쓰는 곳입니다. `edit 파일이름`으로 엽니다.

MATLAB이 함수나 스크립트 이름을 만나면 **현재 폴더 → 경로(path)에 등록된 폴더들** 순서로 같은 이름의 `.m` 파일을 찾습니다. Python에서 `import`가 모듈을 찾는 방식과 비슷합니다. 내가 만든 함수를 다른 폴더에서도 쓰고 싶으면 `addpath('폴더')`로 경로에 넣습니다. 남과 같이 쓰는 컴퓨터에서는 전체 경로 설정을 함부로 바꾸지 말고, 스크립트 첫머리에서 `addpath`로 필요한 폴더만 더하는 습관이 좋습니다.

도움말은 `help 함수이름`(명령 창에 짧게), `doc 함수이름`(자세한 문서)입니다. 모르는 함수가 나오면 검색 전에 `help`부터 쳐 보세요. 코드를 쓸 때의 순서는 Python 때와 같습니다. **(1) 생각한다** — 데이터가 처음, 중간, 끝에 어떤 모양일지 그림으로 그려 본다. **(2) 쓴다** — 주석으로 단계를 먼저 적고 코드를 채운다. **(3) 점검한다** — 답을 아는 작은 입력으로 결과를 확인한다.

### Python 사용자를 위한 대조표

본 과정의 Python 지식이 그대로 쓰입니다. 다른 점만 기억하면 됩니다.

| 항목 | Python (numpy) | MATLAB / Octave |
|---|---|---|
| 인덱스 시작 | `v[0]`이 첫 원소 | `v(1)`이 첫 원소. `v(0)`은 오류 |
| 마지막 원소 | `v[-1]` | `v(end)` |
| 인덱스 괄호 | 대괄호 `v[2]` | 소괄호 `v(2)` — 함수 호출과 모양이 같다 |
| 구간 | `v[1:3]` → 2, 3번째 (끝 미포함) | `v(2:3)` → 2, 3번째 (**끝 포함**) |
| 기본 자료형 | 리스트, 스칼라, 배열이 따로 | 거의 모든 것이 double 행렬. 숫자 하나도 1×1 |
| 행렬 만들기 | `np.array([[1, 2], [3, 4]])` | `[1 2; 3 4]` (공백=열, 세미콜론=행) |
| 원소별 곱 / 행렬 곱 | `a * b` / `a @ b` | `a .* b` / `a * b` (**반대!**) |
| 저장 순서 | 행 우선(C order) | 열 우선(column-major) |
| 블록 구분 | 들여쓰기 + `:` | 키워드 + `end` (들여쓰기는 가독성용) |
| 주석 | `#` | `%` (블록 주석 `%{ ... %}`) |
| 출력 억제 | 기본이 조용함 | 줄 끝에 `;`가 없으면 결과를 화면에 찍음 |
| 문자열 | `'a'`와 `"a"` 같음 | `'a'`는 char 배열, `"a"`는 MATLAB에서 string 객체(Octave에선 char) |
| 함수 파일 | 한 파일에 여러 함수, `import` | 파일 이름 = 함수 이름 (`myfun.m` 안의 `function ... myfun`) |
| 패키지 | `pip`/`conda`로 설치, `import` | 툴박스(유료, 경로에 자동) / Octave는 `pkg load` |
| 같지 않음 | `!=`, 부정 `not` | `~=`, 부정 `~` |

> **Octave와 다른 점:** Octave는 `#` 주석, `!=`, `x += 1`, `"큰따옴표 문자열"`도 받아 줍니다. 하지만 이런 코드는 MATLAB에서 오류가 나므로 **MATLAB에서도 도는 문법(`%`, `~=`, `x = x + 1`, 작은따옴표)만 쓰는 습관**을 들이세요.

## 예시로 이해하기

> 예시의 숫자는 모두 연습용 **가상 값**입니다. 출력은 GNU Octave 11.3에서 실행한 그대로이며, MATLAB은 줄 간격·공백이 조금 다르게 보일 수 있습니다.

### 예시 1 — 계산기처럼 쓰기

명령 창에 한 줄씩 입력하거나, 아래를 `B1_calc.m`으로 저장해 실행합니다.

```matlab
% 계산기처럼 쓰기
3 + 4*2
(3 + 4)*2
2^10
sqrt(81)
exp(1)
log(100)      % 자연로그
log10(100)    % 상용로그
x = 7;        % 세미콜론: 결과를 화면에 찍지 않는다
y = x^2 + 1
ans_is_last = ans   % 이름 없이 계산한 마지막 값은 ans에 담긴다
format long
pi
format short
pi
```

출력:

```text
ans = 11
ans = 14
ans = 1024
ans = 9
ans = 2.7183
ans = 4.6052
ans = 2
y = 50
ans_is_last = 2
ans = 3.141592653589793
ans = 3.1416
```

세 가지를 확인하세요. 첫째, `log`는 자연로그이고 상용로그는 `log10`입니다(Python의 `np.log`, `np.log10`과 같음). 둘째, 이름을 붙이지 않은 계산은 `ans`라는 변수에 덮어써집니다. `y = 50`은 `y`에 들어갔으므로 `ans`는 여전히 바로 앞의 `log10(100)` 결과인 2입니다. 셋째, `format long`은 **보여 주는 자릿수만** 바꿉니다. 내부 계산은 늘 약 16자리 정밀도(double)로 이뤄집니다.

### 예시 2 — 첫 스크립트: 보폭 간격 요약

4주차에서 Python으로 했던 보행 요약을 MATLAB으로 옮겨 봅니다. 편집기에서 새 파일을 열고 `B1_stride_summary.m`으로 저장한 뒤, 명령 창에서 파일 이름(`B1_stride_summary`, 확장자 없이)을 입력해 실행합니다.

```matlab
% stride_summary.m — 보폭 간격(초) 요약 (가상 데이터)
stride_s = [1.08 1.12 1.05 1.10 1.31 1.07 1.09 1.11];

n      = numel(stride_s);
avg    = mean(stride_s);
sd     = std(stride_s);          % 표본 표준편차(n-1로 나눔)
cv_pct = 100 * sd / avg;         % 변동계수(%)

fprintf('보폭 수: %d\n', n);
fprintf('평균: %.3f s, SD: %.3f s, CV: %.1f%%\n', avg, sd, cv_pct);
[longest, where] = max(stride_s);
fprintf('가장 긴 보폭: %.2f s (%d번째)\n', longest, where);
```

출력:

```text
보폭 수: 8
평균: 1.116 s, SD: 0.081 s, CV: 7.3%
가장 긴 보폭: 1.31 s (5번째)
```

Python과 비교해 볼 곳이 많습니다. `numel`은 원소 개수(`len`), `fprintf`는 C 스타일 서식 출력입니다(`%d` 정수, `%.3f` 소수 셋째 자리, `%%`는 퍼센트 기호 자체, `\n` 줄바꿈). `std`는 기본이 표본 표준편차(n−1)라 numpy의 `np.std`(기본 n)와 **다릅니다**. 같은 값을 얻으려면 Python에서 `np.std(x, ddof=1)`을 써야 합니다. 마지막 줄의 `[longest, where] = max(...)`는 **출력이 두 개인 함수**입니다. 대괄호 안에 받을 변수를 나란히 적으면 최댓값과 그 위치를 함께 받습니다. 위치가 5번째로 나온 것은 1부터 세기 때문입니다(Python이라면 4).

### 예시 3 — 1부터 세는 인덱스

```matlab
v = [10 20 30 40];
first = v(1)
last  = v(end)
middle = v(2:3)
try
    v(0)
catch err
    disp(err.message)
end
```

출력:

```text
first = 10
last = 40
middle =

   20   30

v(0): subscripts must be either integers 1 to (2^63)-1 or logicals
```

`v(2:3)`은 2번째와 3번째를 **둘 다** 가져옵니다. Python의 `v[1:3]`이 끝을 빼는 것과 다릅니다. `v(0)`은 "인덱스는 1 이상의 정수이거나 논리값이어야 한다"는 오류를 냅니다. `try ... catch err ... end`는 Python의 `try/except`와 같은 구조이고, `err.message`에 오류 문장이 들어 있습니다(Day B4에서 자세히).

> **Octave와 다른 점:** 같은 오류라도 MATLAB은 "Index in position 1 is invalid. Array indices must be positive integers or logical values."처럼 문구가 다릅니다. 오류 문장을 검색할 때는 쓰는 프로그램 이름을 함께 넣으세요.

## 직접 해보기

1. **설치.** 학교 MATLAB 라이선스가 있으면 MATLAB을, 없으면 [GNU Octave](https://octave.org/download)를 설치합니다. 터미널에서 `octave --version`(또는 MATLAB 실행 후 `version`)으로 버전을 확인해 `learning-log.md`에 적습니다.
2. **폴더 만들기.** 이 저장소 안에 `notebooks/advanced/B/` 폴더를 만들고, MATLAB/Octave에서 `cd`로 그 폴더로 이동합니다. `pwd`로 확인합니다.
3. **예시 1**을 명령 창에 한 줄씩 입력합니다. 세미콜론을 붙였다 뗐다 하며 무엇이 달라지는지 봅니다. `whos`로 작업 공간을 확인하고, `clear x`로 변수 하나를, `clear`로 전부를 지워 봅니다.
4. **예시 2**를 `B1_stride_summary.m`으로 저장하고 실행합니다. 그다음 `%%`로 스크립트를 세 칸(데이터 / 계산 / 출력)으로 나눠 봅니다. MATLAB 편집기에서는 `%%` 칸 단위로 Ctrl+Enter(맥은 Cmd+Enter) 실행이 됩니다.
5. **도움말 연습.** `help std`를 읽고, n으로 나누는 표준편차를 얻는 방법을 찾아 스크립트에 한 줄 추가합니다(힌트: 두 번째 입력).
6. **번역 연습.** 0주차 Day F4에서 쓴 Python 반복문 하나를 골라 MATLAB으로 옮겨 봅니다. 인덱스 시작을 1로 바꾸는 것을 잊지 마세요.

⚠️ **흔한 오류 1 — `'B1_stride_summary' undefined`.** 현재 폴더가 파일이 있는 폴더가 아니거나, 파일 이름에 공백·하이픈·숫자 시작이 들어가 있을 때 납니다. 파일 이름은 영문자로 시작하고 영문자·숫자·밑줄만 씁니다(`B1-stride.m` ✗, `B1_stride.m` ✓).

⚠️ **흔한 오류 2 — 내장 함수 이름을 변수로 덮어쓰기.** `mean = 3;`이라고 한 뒤 `mean(x)`를 부르면 함수 대신 변수 `mean`의 x번째 원소를 찾으려다 엉뚱한 오류가 납니다. `which mean`으로 무엇이 불리는지 확인하고, `clear mean`으로 변수를 지우면 해결됩니다. `i`, `j`(허수 단위), `sum`, `max`, `length`, `table` 같은 이름은 변수로 쓰지 마세요.

## 퀴즈

**1.** `v = [5 6 7 8];`일 때 `v(2:3)`의 결과는?

(a) `[5 6]` (b) `[6 7]` (c) `[6 7 8]` (d) 오류

<details><summary>정답 보기</summary>

(b). 1부터 세고 끝도 포함하므로 2번째(6)와 3번째(7)입니다. Python의 `v[2:3]`이었다면 7 하나만 나왔을 것입니다.

</details>

**2.** 명령 창에서 `x = 3` 다음 줄에 `x * 2`를 입력하면, 그다음 `ans`의 값과 `x`의 값은? (단답)

<details><summary>정답 보기</summary>

`ans`는 6, `x`는 3입니다. 이름 없는 계산 결과만 `ans`에 들어가고, `x`는 바뀌지 않습니다.

</details>

**3.** 학교에 MATLAB 라이선스가 없고 비용을 쓸 수 없습니다. 선배의 `.m` 분석 코드를 돌려 보려면 무엇을 먼저 해야 하나요?

(a) 코드를 전부 Python으로 다시 쓴다 (b) GNU Octave를 설치해 돌려 보고, 안 되는 함수만 찾아 대체한다 (c) MATLAB 문법은 다른 프로그램에서 읽을 수 없다 (d) 툴박스를 따로 사면 MATLAB 없이 돈다

<details><summary>정답 보기</summary>

(b). Octave는 MATLAB 문법 대부분을 그대로 실행합니다. 최근 MATLAB 전용 기능이나 툴박스 함수를 쓴 부분만 Octave 패키지나 직접 쓴 코드로 바꾸면 됩니다. 툴박스는 MATLAB 본체 없이는 쓸 수 없습니다.

</details>

**4.** MATLAB에서 `a * b`와 `a .* b`의 차이를 Python numpy 표기로 설명하세요. (단답)

<details><summary>정답 보기</summary>

MATLAB의 `a * b`는 행렬 곱으로 numpy의 `a @ b`, MATLAB의 `a .* b`는 원소별 곱으로 numpy의 `a * b`입니다. 기호가 정확히 반대라서 Python에서 넘어온 사람이 가장 자주 틀리는 부분입니다.

</details>

**5.** `std([2 4 4 4 5 5 7 9])`를 MATLAB과 numpy의 기본 `np.std`로 각각 구하면 값이 같을까요? 이유는? (단답)

<details><summary>정답 보기</summary>

다릅니다. MATLAB의 `std`는 기본으로 n−1로 나누는 표본 표준편차이고, `np.std`는 기본으로 n으로 나눕니다. 코드를 옮길 때 이런 기본값 차이가 조용히 결과를 바꾸므로, numpy에서는 `ddof=1`을 넣어 맞춥니다.

</details>

> **더 읽을거리:** Wallisch P, et al. *MATLAB for Neuroscientists*, 2nd ed. Academic Press (Elsevier), 2014 — [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0) · Cohen MX. *MATLAB for Brain and Cognitive Scientists*. MIT Press, 2017 — [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/) · [GNU Octave 문서](https://docs.octave.org/latest/) · [Octave와 MATLAB의 차이](https://wiki.octave.org/Differences_between_Octave_and_Matlab) · [NumPy for MATLAB users](https://numpy.org/doc/stable/user/numpy-for-matlab-users.html)

## 오늘의 산출물 체크리스트
- [ ] MATLAB 또는 Octave를 설치하고 버전을 `learning-log.md`에 적었다.
- [ ] `notebooks/advanced/B/B1_stride_summary.m`이 실행되어 평균·SD·CV를 출력한다.
- [ ] `help`, `whos`, `clear`, `which`를 한 번씩 써 보았다.
- [ ] Python ↔ MATLAB 대조표에서 가장 헷갈리는 세 줄을 골라 노트에 적었다.

---
[← 이전](../../../README.md) · [코스 지도](../../../README.md) · [다음 →](day-B2.md)
