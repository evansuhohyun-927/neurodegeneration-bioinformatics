# Day B5 — 데이터 입출력과 시각화: 파일을 읽고, 쓰고, 그림으로 남기기

> **주차:** 심화 파트 B — MATLAB/Octave 과학 계산 입문 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/B/B5_io_and_plots.m`, `figures/advanced/B/B5_trials.png`
>
> **먼저 끝내 둘 레슨:** Day B4. 본 과정 Day F6(파일 읽기), Day 5(시각화 원칙), Day 6(파일 형식)과 연결됩니다.

## 오늘의 목표
- `.mat` 파일로 변수를 저장·불러오고, MATLAB과 Octave 사이에서 호환되는 형식을 고를 수 있다.
- 폴더의 여러 CSV 파일을 `dir`로 찾아 반복문으로 읽고, 결과를 파일로 내보낼 수 있다.
- `plot`, `patch`, `imagesc`, `subplot`과 그래픽 핸들(`get`/`set`)로 논문용 그림을 만들어 PNG로 저장할 수 있다.

## 🎬 영상으로 먼저 보기

- [MATLAB Crash Course for Beginners — freeCodeCamp.org](https://www.youtube.com/watch?v=7f50sQYjNRA) (1:57:45)
- **무엇에 주목할까:** 그림(plotting) 부분을 봅니다. `hold on`으로 선을 겹치는 장면, 축 이름과 제목을 다는 장면을 오늘 예시 3과 비교해 보세요.

- [MATLAB import CSV and loop over files (검색 링크)](https://www.youtube.com/results?search_query=MATLAB+import+multiple+csv+files+loop+dir)
- **무엇에 주목할까:** `dir`이 돌려주는 구조체의 `name` 필드로 파일 목록을 만드는 부분만 보면 충분합니다.

## 개념 설명

### `.mat` 파일: 작업 공간을 통째로 보관하기

`save('파일.mat', '변수1', '변수2')`는 변수를 MATLAB 전용 이진 파일로 저장하고, `load`가 되살립니다. 이름·크기·자료형(struct, cell 포함)이 그대로 보존되므로 분석 중간 결과를 보관하기 좋습니다. 불러올 때는 `S = load('파일.mat')`처럼 **구조체로 받는 습관**이 좋습니다. 그냥 `load`하면 파일 속 변수가 작업 공간에 쏟아져 같은 이름의 기존 변수를 조용히 덮어씁니다.

> **Octave와 다른 점:** Octave의 `save`는 기본이 **Octave 텍스트 형식**이라 MATLAB에서 못 읽습니다. MATLAB과 주고받을 파일은 `save('-v7', ...)`(또는 `-mat7-binary`)로 저장하세요. 2 GB가 넘는 큰 변수는 MATLAB의 `-v7.3`(HDF5 기반)이 필요하며, Octave의 `-v7.3` 지원은 제한적입니다(이 레슨에서 실행 확인 안 됨).

### 텍스트 파일과 폴더 순회

CSV 같은 텍스트 파일은 어떤 프로그램과도 주고받을 수 있어 **원자료 보관과 공유**에 적합합니다. 읽는 방법은 단계별로 있습니다.

| 하고 싶은 일 | MATLAB (최근) | MATLAB·Octave 공통 |
|---|---|---|
| 숫자만 있는 CSV | `readmatrix` | `dlmread(파일, ',', 머리줄수, 0)`, `csvread` |
| 열마다 형식이 다른 표 | `readtable` | `textscan` (열 형식 지정) |
| 한 줄씩 직접 해석 | `fgetl`, `fopen`/`fclose` | 같음 |
| 숫자 표 쓰기 | `writematrix` | `csvwrite`, `dlmwrite` |
| 서식 있게 쓰기 | `fprintf(fid, ...)` | 같음 |

Octave 11에는 `readmatrix`, `writematrix`, `readtable`, `readcell`이 없으므로 오른쪽 열을 씁니다. `fopen`으로 파일을 열면 파일 식별자(`fid`)를 받고, 다 쓰면 반드시 `fclose(fid)`로 닫습니다. `fid`가 −1이면 열기 실패이니 바로 오류를 내 멈추게 합니다.

참가자 파일이 여러 개면 `files = dir('io/sub-*_stride.csv')`로 목록을 얻고 `for k = 1:numel(files)`로 돕니다. 파일 이름은 `sprintf('sub-%02d_stride.csv', k)`처럼 **규칙으로 만들고(soft-coding)**, 경로는 `fullfile`로 이어 운영체제마다 다른 구분자(`/`, `\`) 문제를 피합니다. 장비 회사 고유 형식(EEG, 영상 등)은 회사가 주는 읽기 함수나 EEGLAB·FieldTrip 같은 툴박스의 함수를 쓰는 것이 보통입니다.

### 그림: figure → axes → 그래픽 객체, 그리고 핸들

MATLAB 그림은 계층 구조입니다. **figure**(창) 안에 **axes**(좌표축)가 있고, 그 안에 선(line), 면(patch), 이미지(image), 글자(text) 객체가 있습니다. 각 객체를 만들 때 돌려받는 값이 **핸들(handle)** 이고, `get(h)`로 속성을 보고 `set(h, '속성', 값)`으로 바꿉니다. `gcf`(현재 figure), `gca`(현재 axes)도 핸들입니다. 리모컨에 비유하면, 객체를 그릴 때 받은 리모컨을 들고 있으면 나중에 색·굵기·축 범위를 언제든 바꿀 수 있습니다.

신경과학에서 자주 쓰는 그림은 정해져 있습니다. 시간 축 선 그림(`plot`), 평균 ± 오차 띠(`patch`나 `fill`로 위아래 경계를 이어 칠함), 시행 × 시점 행렬(`imagesc` + `colorbar`; `axis xy`로 1행을 아래에), 분포(`hist`), 막대와 오차 막대(`bar`, `errorbar`), 여러 판(`subplot(행, 열, 번호)`). 좋은 그림의 원칙은 본 과정 Day 5와 같습니다. 판 하나에 요점 하나, 비교할 판끼리는 **축 범위를 같게**, 축 이름과 단위, 데이터보다 장식이 튀지 않게(눈금을 바깥으로 `tickdir out`, 위·오른쪽 테두리 없애기 `box off`).

저장은 `print(fig, '파일.png', '-dpng', '-r300')`처럼 형식과 해상도를 지정합니다. 사진 같은 그림은 PNG/TIFF(픽셀), 선 그림을 확대·편집할 일이 있으면 PDF/SVG/EPS(벡터)로 저장합니다. 화면 없이 스크립트로 그릴 때는 `figure('visible', 'off')`를 씁니다.

> **Octave와 다른 점:** MATLAB의 `histogram`, `tiledlayout`, `sgtitle`, `exportgraphics`, `boxplot`(통계 툴박스)은 Octave 11에 없습니다. `hist`, `subplot`, `print`로 대신합니다. 또 Octave의 그래픽 백엔드에서는 colorbar가 붙은 판의 제목이 잘리는 등 배치가 MATLAB과 조금 다를 수 있습니다.

## 예시로 이해하기

> 출력은 GNU Octave 11.3에서 실행한 그대로입니다. 스크립트가 있는 폴더 아래 `io/` 하위 폴더에 파일을 씁니다.

### 예시 1 — `.mat` 저장과 불러오기

```matlab
% .mat 파일 저장과 불러오기
if ~exist('io', 'dir'), mkdir('io'); end
rng(3);
fs = 100;                              % 표본추출률(Hz)
t  = (0:fs*2-1) / fs;                  % 2초
sig = sin(2*pi*1.5*t) + 0.2*randn(size(t));
meta = struct('subject', 'sub-01', 'fs', fs, 'units', 'g');
save('-v7', 'io/sub-01_acc.mat', 'sig', 't', 'meta');   % MATLAB과 호환되는 형식
clear sig t meta
whos
S = load('io/sub-01_acc.mat');         % 구조체로 받으면 변수 이름이 섞이지 않는다
fieldnames(S)'
S.meta
size(S.sig)
```

출력:

```text
Variables visible from the current scope:

variables in scope: top scope

  Attr   Name        Size                     Bytes  Class
  ====   ====        ====                     =====  ===== 
         fs          1x1                          8  double

Total is 1 element using 8 bytes

ans =
{
  [1,1] = sig
  [1,2] = t
  [1,3] = meta
}

ans =

  scalar structure containing the fields:

    subject = sub-01
    fs = 100
    units = g

ans =

     1   200
```

신호와 함께 **메타데이터(참가자, 표본추출률, 단위)를 같은 파일에** 넣었습니다. 몇 달 뒤 파일만 열어도 무엇을 어떻게 기록했는지 알 수 있게 하는 것이 본 과정 Day 15의 provenance 원칙입니다. MATLAB에서 `save`는 함수형 `save('io/sub-01_acc.mat', 'sig', 't', 'meta')`로 쓰면 되고 `-v7` 옵션은 생략해도 됩니다.

### 예시 2 — 여러 CSV 쓰기, 찾기, 읽기, 요약 내보내기

```matlab
% 여러 참가자의 CSV 파일을 쓰고, 목록을 찾아 다시 읽기 (가상 데이터)
if ~exist('io', 'dir'), mkdir('io'); end
rng(5);
for k = 1:3
    fname = sprintf('io/sub-%02d_stride.csv', k);   % 이름을 규칙으로 만든다(soft-coding)
    fid = fopen(fname, 'w');
    if fid < 0, error('파일을 열 수 없음: %s', fname); end
    fprintf(fid, 'stride_idx,stride_s\n');          % 머리줄
    for j = 1:5
        fprintf(fid, '%d,%.3f\n', j, 1.1 + 0.05*randn);
    end
    fclose(fid);
end
files = dir('io/sub-*_stride.csv');
{files.name}'
summary = zeros(numel(files), 2);
for k = 1:numel(files)
    M = dlmread(fullfile('io', files(k).name), ',', 1, 0);   % 머리줄 1줄 건너뛰기
    summary(k, :) = [mean(M(:,2)), std(M(:,2))];
end
summary
% textscan: 열마다 형식을 지정해 읽기 (문자열 열이 섞여 있을 때 유용)
fid = fopen('io/sub-01_stride.csv');
C = textscan(fid, '%d %f', 'Delimiter', ',', 'HeaderLines', 1);
fclose(fid);
class(C), size(C{2})
% 결과 표를 CSV로 내보내기
csvwrite('io/summary.csv', summary);
type('io/summary.csv')
```

출력:

```text
ans =
{
  [1,1] = sub-01_stride.csv
  [2,1] = sub-02_stride.csv
  [3,1] = sub-03_stride.csv
}

summary =

   1.109000   0.052359
   1.093400   0.059307
   1.137600   0.045682

ans = cell
ans =

   5   1

1.109,0.05235933536629359
1.0934,0.05930682928634783
1.1376,0.04568150610476843
```

`dlmread`의 세 번째·네 번째 입력(1, 0)은 "1행, 0열부터 읽기"(0부터 셈!)라서 머리줄을 건너뜁니다. 이 함수만 0부터 세는 이유는 오래된 C 함수의 관례 때문이니 주의하세요. `textscan`은 열마다 cell 칸 하나를 돌려줍니다. `csvwrite`는 머리줄을 쓰지 못하므로, 열 이름이 필요하면 예시 앞부분처럼 `fprintf`로 직접 씁니다.

### 예시 3 — 시행 × 시점 데이터를 세 가지 그림으로

```matlab
% 그림: 시행 x 시점 행렬을 세 가지로 보기 (가상 데이터)
if ~exist('io', 'dir'), mkdir('io'); end
rng(7);
t = linspace(-0.2, 0.8, 101);                    % 초
n_trial = 30;
resp = exp(-((t - 0.3)/0.08).^2);                % 0.3초에 정점인 가상 반응
X = repmat(resp, n_trial, 1) + 0.4*randn(n_trial, numel(t));
m  = mean(X, 1);
se = std(X, 0, 1) / sqrt(n_trial);
fig = figure('visible', 'off', 'position', [100 100 900 360]);
subplot(1, 3, 1)
plot(t, X(1:5, :)', 'color', [0.7 0.7 0.7]); hold on
plot(t, m, 'k', 'linewidth', 2)
xlabel('time (s)'); ylabel('amplitude (a.u.)'); title('trials + mean')
subplot(1, 3, 2)
patch([t fliplr(t)], [m+se fliplr(m-se)], [0.6 0.8 1], 'edgecolor', 'none'); hold on
plot(t, m, 'b', 'linewidth', 2)
xlabel('time (s)'); title('mean \pm SE')
subplot(1, 3, 3)
imagesc(t, 1:n_trial, X); axis xy; colorbar
xlabel('time (s)'); ylabel('trial'); title('all trials')
set(findall(fig, 'type', 'axes'), 'tickdir', 'out', 'box', 'off')
print(fig, 'io/B5_trials.png', '-dpng', '-r150');
close(fig)
d = dir('io/B5_trials.png');
fprintf('저장됨: %s\n', d.name);
[~, peak_idx] = max(m);
fprintf('평균 반응의 정점: %.2f s\n', t(peak_idx));
```

출력:

```text
저장됨: B5_trials.png
평균 반응의 정점: 0.30 s
```

세 판은 같은 데이터를 다르게 보여 줍니다. 왼쪽은 개별 시행(회색)과 평균(검정)을 겹쳐 **평균이 시행들을 대표하는지** 보게 하고, 가운데는 평균 ± 표준오차 띠, 오른쪽은 모든 시행을 색으로 보여 **특정 시행만 튀는지** 확인하게 합니다. 평균만 그리면 몇 개의 이상한 시행이 평균을 끌고 가는 것을 놓칩니다. `patch`에 x를 `[t fliplr(t)]`로 넣은 것은 위 경계를 왼쪽→오른쪽, 아래 경계를 오른쪽→왼쪽으로 한 바퀴 돌아 닫힌 도형을 만들기 위해서입니다. `[~, peak_idx]`의 물결표는 "첫 번째 출력은 버린다"는 뜻입니다. 실행한 Octave 화면에서는 오른쪽 판의 제목이 colorbar 때문에 일부 잘렸습니다.

## 직접 해보기

1. `notebooks/advanced/B/B5_io_and_plots.m`을 만들고 예시 1–3을 칸으로 나눠 실행합니다. 그림을 `figures/advanced/B/B5_trials.png`로 저장하도록 경로를 바꿉니다(폴더가 없으면 먼저 만듭니다).
2. **load의 함정.** 작업 공간에 `fs = 250`을 만든 뒤 `load('io/sub-01_acc.mat')`(구조체로 받지 않고)를 실행해, 어떤 변수가 생기고 덮어써지는지 확인합니다. `whos -file io/sub-01_acc.mat`로 파일 속 변수를 미리 보는 방법도 써 봅니다.
3. **참가자 열 추가.** 예시 2의 요약에 참가자 번호 열을 넣어, `participant,mean_s,sd_s` 머리줄이 있는 CSV를 `fprintf`로 씁니다. 그 파일을 pandas `pd.read_csv`로 읽어 같은 숫자가 나오는지 확인합니다.
4. **그림 다듬기.** 예시 3의 가운데 판과 왼쪽 판의 y축 범위를 `ylim`으로 같게 맞추고, 0초에 세로 점선(`plot([0 0], ylim, 'k:')`)을 그립니다.
5. **핸들 연습.** `h = plot(t, m);` 다음 `set(h, 'linewidth', 3, 'color', [0.8 0.2 0.2])`로 바꾸고, `get(h, 'ydata')`가 `m`과 같은지 `isequal`로 확인합니다.

⚠️ **흔한 오류 1 — `fclose`를 빼먹기.** 반복문 안에서 파일을 열고 닫지 않으면 열린 파일 수 한도에 걸리거나, 버퍼에 남은 내용이 파일에 안 써집니다. 열자마자 닫는 줄을 먼저 써 두세요. 이미 꼬였다면 `fclose('all')`.

⚠️ **흔한 오류 2 — Octave 기본 형식으로 저장한 `.mat`.** 동료가 MATLAB에서 "not a binary MAT-file" 같은 오류를 보면 Octave의 텍스트 형식으로 저장된 것입니다. `save('-v7', ...)`로 다시 저장합니다.

## 퀴즈

**1.** `S = load('a.mat')`와 `load('a.mat')`의 차이는? (단답)

<details><summary>정답 보기</summary>

앞의 것은 파일 속 변수를 구조체 `S`의 필드로 받아 작업 공간을 건드리지 않습니다. 뒤의 것은 변수를 작업 공간에 직접 풀어 놓아 같은 이름의 기존 변수를 덮어쓸 수 있습니다.

</details>

**2.** Octave에서 저장한 `.mat`을 MATLAB 사용자에게 보내려면?

(a) `save('x.mat', 'a')` 그대로 (b) `save('-v7', 'x.mat', 'a')` (c) `csvwrite`로만 가능 (d) 불가능

<details><summary>정답 보기</summary>

(b). Octave 기본 저장 형식은 Octave 텍스트 형식이므로 MATLAB 호환 형식을 명시합니다.

</details>

**3.** 시행 × 시점 행렬에서 개별 시행을 모두 확인하기에 가장 알맞은 그림은?

(a) 평균만 그린 선 그림 (b) `imagesc` 행렬 그림 (c) 막대그래프 (d) 파이 차트

<details><summary>정답 보기</summary>

(b). 행마다 한 시행을 색으로 보여 주므로, 특정 시행의 잡음이나 시점 어긋남이 한눈에 보입니다.

</details>

**4.** `dir('data/*.csv')`가 돌려주는 것과, 파일 이름 목록을 cell로 만드는 코드는? (단답)

<details><summary>정답 보기</summary>

파일마다 `name`, `folder`, `bytes`, `date`, `isdir` 등의 필드를 가진 struct 배열입니다. `{files.name}`으로 이름만 cell로 모읍니다.

</details>

**5.** 논문 그림을 저널에 낼 때 선 그림은 확대해도 깨지지 않아야 합니다. 어떤 형식이 알맞나요? (단답)

<details><summary>정답 보기</summary>

PDF, SVG, EPS 같은 벡터 형식입니다. PNG/TIFF 같은 픽셀 형식은 해상도(dpi)를 충분히 높여야 하고 확대하면 계단이 보입니다. 저널의 그림 규정을 먼저 확인합니다.

</details>

> **더 읽을거리:** Wallisch P, et al. *MATLAB for Neuroscientists*, 2nd ed. Academic Press (Elsevier), 2014 — [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0) · Cohen MX. *MATLAB for Brain and Cognitive Scientists*. MIT Press, 2017 — [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/) · [GNU Octave 문서](https://docs.octave.org/latest/) · [Octave와 MATLAB의 차이](https://wiki.octave.org/Differences_between_Octave_and_Matlab)

## 오늘의 산출물 체크리스트
- [ ] `.mat` 저장·불러오기를 구조체 방식으로 했고, Octave라면 `-v7`을 썼다.
- [ ] 참가자 번호가 든 요약 CSV를 쓰고 pandas로 다시 읽어 확인했다.
- [ ] `figures/advanced/B/B5_trials.png`가 생성되었다.

---
[← 이전](day-B4.md) · [코스 지도](../../../README.md) · [다음 →](day-B6.md)
