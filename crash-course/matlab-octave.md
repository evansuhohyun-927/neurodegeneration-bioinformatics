# Crash Course — MATLAB/Octave 빠른 시작

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** 연구실에서 물려받은 MATLAB 분석 코드를 MATLAB이나 무료 GNU Octave로 실행하고, 문법을 읽고, 흔한 함정을 피해 고치거나 Python으로 옮길 계획을 세울 수 있다.

## 한눈에 보기

MATLAB은 **행렬을 기본 단위로 계산하는 과학 계산 언어이자 환경**이다. 신경과학·심리학에서는 EEG/MEG·fMRI 분석 도구와 실험 자극 제시 도구가 MATLAB으로 만들어져 있어, 연구실의 오래된 분석·실험 코드가 `.m` 파일로 남아 있는 경우가 많다. GNU Octave는 같은 문법을 대부분 실행하는 무료 프로그램이다.

| | 내용 |
|---|---|
| 무엇을 하는 도구인가 | 행렬 연산, 수치 계산(선형대수, 적분, 최적화, 미분방정식), 시각화, 실험 제어·GUI를 한 환경에서 |
| 이런 일에 쓴다 | 물려받은 `.m` 분석 코드 실행·수정, MATLAB 기반 툴박스(EEGLAB, FieldTrip, SPM, Psychtoolbox) 사용, 행렬 중심 계산과 시뮬레이션 |
| 이것만으로는 어려운 것 | 표 형태 자료 정리(Octave에는 table이 없음), 최신 머신러닝·딥러닝 생태계, 무료 배포(MATLAB은 유료, 툴박스 별도) |
| 이 과정과의 관계 | 본 과정은 Python이다. 이 가이드와 [심화 파트 B](../lessons/advanced/B-matlab/day-B1.md)의 목표는 MATLAB 코드를 **읽고 돌리고 옮길 수 있는 것**이지, 새 분석을 MATLAB으로 시작하라는 것이 아니다 |

## 🎬 급할 때 볼 영상

- [MATLAB Crash Course for Beginners](https://www.youtube.com/watch?v=7f50sQYjNRA) — freeCodeCamp.org (1시간 58분). 화면 구성, 변수, 행렬과 인덱스, 그림, 반복문, 함수를 한 번에. 하나만 본다면 이것.
- [The Complete MATLAB Course: Beginner to Advanced!](https://www.youtube.com/watch?v=T_ekAD7U-wU) — Joseph Delgadillo (4시간 22분). 목차에서 필요한 부분(함수 핸들, 파일 입출력)만 골라 볼 때.
- [MATLAB debugging breakpoints tutorial](https://www.youtube.com/results?search_query=MATLAB+debugging+breakpoints+tutorial) (검색 링크). 남의 코드가 오류를 낼 때 중단점으로 들여다보는 손동작.

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| 행렬 기본형 | 숫자 하나도 1×1 double 행렬. `[1 2; 3 4]`는 2×2 | 모든 연산이 모양(size)에 좌우된다. 막히면 `size`부터 찍는다 |
| 1-기반 인덱스, `end` | 첫 원소는 `v(1)`, 마지막은 `v(end)`, `v(2:3)`은 끝 포함 | Python에서 옮길 때 한 칸씩 밀리는 버그의 원인 |
| 열 우선(column-major) | 선형 인덱스 `X(k)`와 `X(:)`, `reshape`는 열을 따라 채운다 | numpy(행 우선)와 `reshape` 결과가 다르다 |
| 원소별 vs 행렬 연산 | `.*`, `./`, `.^`는 같은 자리끼리, `*`, `/`, `^`는 선형대수 | numpy와 기호가 반대(`*` ↔ `@`). 정사각 행렬이면 틀려도 오류가 안 난다 |
| 논리 인덱스 | `X(X > 5)`, `X(isnan(X)) = 0` | 반복문 + if를 한 줄로. 이상치 제거·조건 선택의 기본 |
| 암묵적 확장 | 크기 1인 차원을 자동으로 늘려 맞춤 (`X - mean(X, 2)`) | 시행별 기준선 빼기. 옛 코드의 `bsxfun`, `repmat`과 같은 뜻 |
| cell / struct | cell은 무엇이든 담는 칸 묶음(`{}`로 꺼냄), struct는 이름 붙은 필드 | 길이가 다른 자료와 메타데이터를 한 변수에 |
| 함수 파일 | `function [out] = name(in)`, 파일 이름 = 함수 이름, 자기 작업 공간 | 값 전달이라 입력을 바꿔도 밖은 그대로. 같은 이름 파일이 둘이면 엉뚱한 게 불린다(`which -all`) |
| 함수 핸들 `@` | `f = @(x) x.^2`처럼 함수를 값으로 | `fminsearch`, `integral`, `ode45`, `cellfun`, GUI 콜백이 모두 핸들을 받는다 |
| 툴박스 / 패키지 | 분야별 함수 묶음(MATLAB은 유료 라이선스, Octave는 `pkg load`) | 코드가 어떤 툴박스 함수에 의존하는지 먼저 확인해야 실행 가능 여부를 안다 |

## 도구 고르기: MATLAB vs Octave vs Python

| 도구 | 무엇을 얻나 | 장점 | 한계 | 이런 경우에 쓴다 |
|---|---|---|---|---|
| MATLAB | 상용 환경 + 툴박스(신호처리, 통계, 영상, 최적화 등) + App Designer, Live Script | 툴박스 품질과 문서, 빠른 실행(JIT), 신경과학 레거시 코드와 완전 호환 | 유료(학교 라이선스 확인), 툴박스 별도, 코드 공유 시 상대도 라이선스 필요 | 학교 라이선스가 있고, 툴박스 의존 코드(EEGLAB·FieldTrip·SPM 등)를 그대로 써야 할 때 |
| GNU Octave | MATLAB 문법 호환 무료 인터프리터 + 패키지(signal, statistics 등) | 무료·오픈소스, 서버·클러스터에 라이선스 없이 설치, 기본 문법 대부분 호환 | 대체로 느림(특히 반복문), `table`·`string`·`readmatrix`·`histogram`·App Designer 등 최근 기능 없음, 일부 동작 차이 | 라이선스 없이 MATLAB 코드를 돌려 보거나, 이식 전에 결과를 재현할 때 |
| Python (numpy/scipy/pandas/matplotlib, MNE 등) | 범용 언어 + 과학 계산·머신러닝 생태계 | 무료, 표 자료(pandas)와 ML, 재현 가능한 환경 관리(conda), 이 과정의 표준 | MATLAB 코드를 바로 실행하지 못함(이식 필요), 0-기반·행 우선 등 차이 | 새 분석, 공개 배포, 머신러닝, 이 과정의 프로젝트 |

고르는 순서: 물려받은 코드가 있고 라이선스가 있으면 MATLAB으로 **먼저 원래 결과를 재현**한다. 라이선스가 없으면 Octave로 시도하고, 안 되는 함수 목록을 만든다. 새로 시작하는 분석이나 공개할 코드는 Python으로 쓰되, 이식할 때는 원래 MATLAB(또는 Octave) 결과와 숫자를 비교해 같은지 확인한다.

**Octave 11에서 확인한 주요 차이**(이 가이드 작성 중 실제 실행으로 확인):

| 항목 | MATLAB | Octave 11.3 |
|---|---|---|
| `table`, `readtable`, `writetable`, `readmatrix`, `writematrix` | 있음 | 없음 → `dlmread`/`csvread`/`textscan`/`fprintf` |
| `string` 자료형, `contains` | 있음(큰따옴표 = string) | 없음(큰따옴표도 char) → char + cell + `strcmp`/`regexp` |
| `histogram`, `histcounts`, `tiledlayout`, `sgtitle`, `exportgraphics` | 있음 | 없음 → `hist`/`histc`, `subplot`, `print` |
| `datetime`, `categorical`, `timeit`, `runtests` | 있음 | 없음 |
| `save` 기본 형식 | MATLAB `.mat`(v7) | **Octave 텍스트 형식** → MATLAB과 주고받으려면 `save('-v7', ...)`. `-v7.3` 쓰기 미지원 |
| 스크립트 안 지역 함수 | 파일 **끝**에 | 호출 **전**에, 첫 줄 `1;` → 별도 `.m` 파일이 양쪽에서 안전 |
| `arguments` 입력 검사 블록 | 검사함 | 문법은 받지만 **검사하지 않음**(음수가 `mustBePositive`를 통과함을 확인) |
| 같은 `rng` 씨앗의 난수 | — | MATLAB과 다른 값 |
| 확장 문법(`#`, `!=`, `+=`, `x(…)(…)` 연속 인덱스) | 오류 | 허용 → 쓰지 말 것 |

## 표준 분석 흐름

물려받은 MATLAB 분석 코드를 받아 결과를 재현하고 손보는 흐름이다.

1. **환경 확인.** MATLAB 버전(`version`), 설치된 툴박스(`ver`), 또는 Octave 버전과 패키지(`pkg list`)를 기록한다. 코드에서 툴박스 함수 의존을 찾는다: 낯선 함수마다 `which 함수이름`. 입력 → 출력: 코드 폴더 → "필요한 툴박스·외부 함수 목록". QC: 목록의 모든 함수가 `which`로 찾아지는가.
2. **경로와 폴더 정리.** 원자료는 읽기 전용 폴더에, 결과는 다른 폴더에. `addpath`로 필요한 폴더만 추가하고, 하드코딩된 절대 경로(`C:\Users\...`)를 맨 위의 변수 하나로 모은다. QC: 다른 컴퓨터에서도 변수 하나만 바꾸면 도는가.
3. **자료 불러오기.** `.mat`은 `S = load(...)`(구조체로 받기), 텍스트는 `readmatrix`/`readtable`(MATLAB) 또는 `dlmread`/`textscan`(Octave), 장비 형식은 해당 툴박스의 읽기 함수. 출력: 행렬·struct. QC: `size`, `class`, NaN 개수, 단위·표본추출률이 메타데이터와 맞는가.
4. **코드 읽기와 한 줄씩 실행.** `%%` 칸 단위로 실행하며 각 변수의 `size`와 값을 확인한다. 이해 안 되는 줄은 `help`/`doc`. 오류가 나면 `dbstop if error`로 그 자리에서 멈춰 변수를 본다. QC: 각 단계 출력의 모양을 주석으로 적을 수 있는가.
5. **원래 결과 재현.** 저자가 남긴 그림·숫자와 비교한다. 난수가 있으면 `rng` 씨앗과 프로그램(MATLAB/Octave)이 같아야 같은 값이 나온다. QC: 주요 숫자가 허용 오차 안에서 일치하는가(`abs(a - b) < tol`).
6. **테스트 붙이기.** 핵심 함수에 답을 아는 입력으로 `assert` 테스트를 만든다(빈 입력, NaN, 경계값 포함). QC: 수정 전후 테스트가 모두 통과하는가.
7. **수정·최적화.** 매개변수 정리, 이름 개선, 필요할 때만 프로파일러(`profile on/off`)로 찾은 느린 곳을 미리 할당·벡터화. QC: 결과가 수정 전과 같은가.
8. **저장과 기록.** 결과는 `save('-v7', ...)`(Octave) 또는 기본 `save`(MATLAB), 표는 CSV, 그림은 `print(..., '-dpdf')`/`-dpng -r300`. 코드는 Git에. QC: 그림마다 만든 스크립트와 버전이 기록되어 있는가.
9. **(선택) Python 이식.** 함수 단위로 옮기고 같은 입력에 대해 MATLAB/Octave 결과와 숫자를 비교한다. 대응표는 [NumPy for MATLAB users](https://numpy.org/doc/stable/user/numpy-for-matlab-users.html). `.mat`은 `scipy.io.loadmat`(v7 이하), `h5py`(v7.3)로 읽는다. QC: 인덱스(1→0), `std` 기본값(n−1 vs n), `reshape` 순서를 점검했는가.

## 최소 실행 예시

같은 계산(시행 × 시점 행렬에서 시행별 기준선 빼기 → 이상 시행 표시 → 시점별 평균)을 MATLAB/Octave와 Python으로 나란히 쓴다. 가상 데이터.

```matlab
% 시행 x 시점 행렬: 기준선 빼기 -> 이상 시행 표시 -> 시점별 평균 (가상 데이터)
X = [ 2  4  9  5  3;
      1  3  8  6  2;
      2  5 11  4  1;
      9  9 30  9  9 ];
base     = mean(X(:, 1:2), 2);          % 처음 두 시점을 기준선으로 (시행마다 하나)
Xb       = X - base;                    % 암묵적 확장으로 시행별 기준선 빼기
peak     = max(Xb, [], 2);              % 시행별 최댓값
bad      = peak > 2 * median(peak);     % 중앙값의 두 배를 넘는 시행 표시
fprintf('제외 시행: %s\n', mat2str(find(bad)'));
erp      = mean(Xb(~bad, :), 1)         % 남은 시행의 시점별 평균
[~, t_peak] = max(erp);
fprintf('정점 시점(1부터 셈): %d\n', t_peak);
```

실제 출력(GNU Octave 11.3):

```text
제외 시행: 4
erp =

  -1.1667   1.1667   6.5000   2.1667  -0.8333

정점 시점(1부터 셈): 3
```

```python
import numpy as np
# MATLAB 예시와 같은 계산을 numpy로 (인덱스는 0부터)
X = np.array([[2, 4, 9, 5, 3],
              [1, 3, 8, 6, 2],
              [2, 5, 11, 4, 1],
              [9, 9, 30, 9, 9]], dtype=float)
base = X[:, 0:2].mean(axis=1, keepdims=True)   # MATLAB X(:, 1:2) == numpy X[:, 0:2]
Xb = X - base
peak = Xb.max(axis=1)
bad = peak > 2 * np.median(peak)
print("제외 시행(0부터 셈):", np.flatnonzero(bad))
erp = Xb[~bad].mean(axis=0)
print("erp =", np.round(erp, 4))
print("정점 시점(0부터 셈):", int(np.argmax(erp)))
```

실제 출력:

```text
제외 시행(0부터 셈): [3]
erp = [-1.1667  1.1667  6.5     2.1667 -0.8333]
정점 시점(0부터 셈): 2
```

숫자는 같고, 위치 번호만 하나씩 다르다(4번째 시행 = MATLAB 4, Python 3). 차이가 나는 줄은 세 곳이다: 구간 표기(`1:2` ↔ `0:2`), 차원 번호(`mean(…, 2)` ↔ `axis=1`), 열 벡터 유지(MATLAB은 자동, numpy는 `keepdims=True`). 이식할 때 이 셋을 먼저 점검한다.

## 흔한 함정

1. **`*`를 원소별 곱으로 씀** → 정사각 행렬이면 오류 없이 행렬 곱이 되어 틀린 숫자가 나온다 → 원소별은 항상 `.*`, `.^`, `./`.
2. **Python에서 옮기며 인덱스를 그대로 둠** → 한 칸씩 밀리거나 `v(0)` 오류 → 범위는 `a:b`가 끝을 포함한다는 것까지 함께 고친다. 위치를 출력하는 숫자(참가자 번호, 시점 번호)는 1부터인지 0부터인지 표기한다.
3. **`reshape` 순서를 numpy와 같다고 가정** → 채널과 시점이 뒤섞인 행렬 → MATLAB은 열 우선. numpy에서 `order='F'`를 쓰거나, 작은 예(`reshape(1:6, 2, 3)`)로 확인한다.
4. **Octave에서 `save('x.mat', ...)`로 저장해 MATLAB 사용자에게 보냄** → MATLAB이 읽지 못함 → `save('-v7', 'x.mat', ...)`.
5. **`load('x.mat')`로 작업 공간에 풀어놓음** → 같은 이름 변수가 조용히 덮어써짐 → `S = load('x.mat')`.
6. **내장 함수 이름을 변수로 씀**(`mean = …`, `i = …`, `table = …`) → 함수 호출이 인덱싱으로 바뀌어 엉뚱한 오류 → `which 이름`으로 확인, 그런 이름은 피한다.
7. **`try/catch`로 오류를 삼킴** → 참가자 일부가 조용히 빠진 결과 → 잡을 때는 반드시 무엇이 실패했는지 기록하고 끝에 출력한다.
8. **`std`, `var`의 기본값 차이를 무시** → MATLAB은 n−1, numpy는 n으로 나눠 이식 후 숫자가 달라짐 → numpy에 `ddof=1`.

## 연구 설계 체크리스트

코드를 실행하기 전에, 그리고 결과를 보고하기 전에 확인한다.

- [ ] MATLAB/Octave 버전, 툴박스·패키지 목록과 버전을 기록했다.
- [ ] 코드가 의존하는 외부 함수(툴박스, 연구실 공용 함수)를 모두 찾았고, 출처와 버전을 적었다.
- [ ] 원자료 폴더는 읽기 전용으로 두고, 결과는 다른 폴더에 쓴다.
- [ ] 표본추출률·단위·채널 순서 같은 메타데이터가 자료와 함께 저장되어 있다.
- [ ] 난수를 쓰는 단계의 씨앗(`rng`)과 프로그램을 기록했다(MATLAB과 Octave는 같은 씨앗이라도 다른 난수).
- [ ] 분석 매개변수(창 길이, 문턱, 제외 기준)가 스크립트 맨 위에 이름 붙은 변수로 모여 있고, 자료를 보기 **전에** 정했다.
- [ ] 제외한 시행·참가자와 그 이유가 파일로 남는다(조용한 `try/catch` 없음).
- [ ] 핵심 함수에 경계 사례를 포함한 `assert` 테스트가 있다.
- [ ] 원저자 결과(또는 원 프로그램 결과)를 허용 오차 안에서 재현했다.
- [ ] 반복 측정 자료는 참가자 단위로 나눠 검증하고, 작은 표본의 결과는 가설 생성으로 보고한다.

## 공개 데이터와 더 볼 곳

**설치와 공식 문서**

- GNU Octave 다운로드: <https://octave.org/download> · 문서: <https://docs.octave.org/latest/> · 패키지: <https://packages.octave.org/>
- Octave와 MATLAB의 차이(Octave 위키): <https://wiki.octave.org/Differences_between_Octave_and_Matlab>
- MATLAB 학교 라이선스 확인(MathWorks): <https://www.mathworks.com/academia/tah-support-program/eligibility.html>
- MATLAB 문서 홈: <https://www.mathworks.com/help/matlab/> (자동 요청에는 403을 돌려주어 이 가이드 작성 중 직접 확인하지 못함. 브라우저에서는 열림이 일반적)
- NumPy for MATLAB users(대응표): <https://numpy.org/doc/stable/user/numpy-for-matlab-users.html>
- Psychtoolbox(실험 자극 제시, MATLAB·Octave): <http://psychtoolbox.org/>
- 신경과학 MATLAB 예제 코드(저자 공개 저장소): <https://github.com/mikexcohen>

**책 (서지 정보와 출판사 페이지)**

- Wallisch P, Lusignan ME, Benayoun MD, Baker TI, Dickey AS, Hatsopoulos NG. *MATLAB for Neuroscientists: An Introduction to Scientific Computing in MATLAB*, 2nd ed. Academic Press (Elsevier), 2014. <https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0>
- Cohen MX. *MATLAB for Brain and Cognitive Scientists*. MIT Press, 2017. <https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/> (자동 요청에 403. 브라우저에서 확인)

**핵심 논문**

- Wilson G, et al. Best practices for scientific computing. *PLoS Biol.* 2014;12:e1001745. doi:[10.1371/journal.pbio.1001745](https://doi.org/10.1371/journal.pbio.1001745)
- Wilson G, et al. Good enough practices in scientific computing. *PLoS Comput Biol.* 2017;13:e1005510. doi:[10.1371/journal.pcbi.1005510](https://doi.org/10.1371/journal.pcbi.1005510)
- Kriegeskorte N, Simmons WK, Bellgowan PSF, Baker CI. Circular analysis in systems neuroscience: the dangers of double dipping. *Nat Neurosci.* 2009;12:535–540. doi:[10.1038/nn.2303](https://doi.org/10.1038/nn.2303)
- Brainard DH. The Psychophysics Toolbox. *Spat Vis.* 1997;10:433–436. doi:[10.1163/156856897X00357](https://doi.org/10.1163/156856897X00357)
- Izhikevich EM. Simple model of spiking neurons. *IEEE Trans Neural Netw.* 2003;14:1569–1572. doi:[10.1109/TNN.2003.820440](https://doi.org/10.1109/TNN.2003.820440)

## 본 과정과의 연결

| 이 가이드의 부분 | 자세히 다루는 레슨 |
|---|---|
| 설치, 화면 구성, Python 대조표 | [Day B1 — MATLAB과 Octave 시작하기](../lessons/advanced/B-matlab/day-B1.md) |
| 행렬, 인덱스, 원소별·행렬 연산, 백슬래시 | [Day B2 — 행렬로 생각하기](../lessons/advanced/B-matlab/day-B2.md) |
| 자료형, 정밀도, NaN, 문자열, cell, struct, table | [Day B3 — 자료형](../lessons/advanced/B-matlab/day-B3.md) |
| 제어문, 함수 파일, 스코프, 함수 핸들 | [Day B4 — 제어문과 함수](../lessons/advanced/B-matlab/day-B4.md) |
| `.mat`·CSV 입출력, 여러 파일 처리, 그림 | [Day B5 — 데이터 입출력과 시각화](../lessons/advanced/B-matlab/day-B5.md) |
| 좋은 코드 습관, 디버깅, 테스트, 프로파일링 | [Day B6 — 좋은 코드 습관](../lessons/advanced/B-matlab/day-B6.md) |
| 최소제곱·`fminsearch`·시뮬레이션·GUI·실험 제어 | [Day B7 — 수치 계산과 시뮬레이션](../lessons/advanced/B-matlab/day-B7.md) |
| 푸리에·필터·시간-주파수·spike 분석 | [심화 파트 C — 신경신호·시간-주파수 분석](../lessons/advanced/C-neural-signals/day-C1.md) |
| Python의 변수·반복문·함수 기초 | [Day F2](../lessons/week-0/day-F2.md) · [Day F4](../lessons/week-0/day-F4.md) · [Day F5](../lessons/week-0/day-F5.md) |
| 오류 메시지 읽기와 Git | [Day F7 — 오류 메시지 읽기와 Git 첫걸음](../lessons/week-0/day-F7.md) |
| 시각화 원칙 | [Day 5 — 시각화 원칙](../lessons/week-1/day-05.md) |
| 시계열 기초(표본추출률, 이동 창) | [Day 23 — 시계열 기초](../lessons/week-4/day-23.md) |
| 재현성(씨앗, 환경, 버전 기록) | [Day 38 — 재현성 강화](../lessons/week-6/day-38.md) |

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
