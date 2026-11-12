# Day B7 — 수치 계산·최적화·시뮬레이션, 그리고 GUI와 실험 제어의 개념

> **주차:** 심화 파트 B — MATLAB/Octave 과학 계산 입문 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/B/B7_fit_and_simulate.m`, `reports/advanced/B_matlab_port_note.md`
>
> **먼저 끝내 둘 레슨:** Day B2(백슬래시), Day B4(함수 핸들), Day B6(테스트). 통계 해석은 본 과정 Day 9(효과크기·신뢰구간), Day 29–32(모델)와 이어집니다.

## 오늘의 목표
- 백슬래시와 `polyfit`으로 선형 최소제곱 적합을 하고 R²로 적합도를 말할 수 있다.
- `fminsearch`로 비선형 모델을 적합하고, 시작값과 지역 최솟값의 위험을 설명할 수 있다.
- 오일러 방법과 `ode45`로 간단한 뉴런 모델을, 난수로 spike 열을 시뮬레이션하고, GUI 콜백과 실험 제어(무작위화·시간 측정)의 구조를 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [MATLAB fminsearch curve fitting tutorial (검색 링크)](https://www.youtube.com/results?search_query=MATLAB+fminsearch+nonlinear+curve+fitting)
- **무엇에 주목할까:** "오차를 계산하는 함수"를 따로 만들고, 그 함수의 핸들을 최적화 함수에 넘기는 구조를 확인하세요. 오늘 예시 2가 같은 구조입니다.

- [Leaky integrate-and-fire neuron simulation (검색 링크)](https://www.youtube.com/results?search_query=leaky+integrate+and+fire+neuron+simulation+euler+method)
- **무엇에 주목할까:** 막전위를 작은 시간 간격(dt)마다 조금씩 갱신하고, 문턱을 넘으면 재설정하는 반복문의 뼈대에 집중하세요. 언어(MATLAB/Python)는 달라도 구조가 같습니다.

## 개념 설명

### 모델 적합 1: 선형 최소제곱

**모델**은 측정값이 어떻게 생겼는지에 대한 수학적 설명이고, **적합(fitting)** 은 모델의 매개변수를 데이터에 가장 잘 맞게 정하는 일입니다. "가장 잘 맞는다"의 흔한 기준은 **오차 제곱합(SSE)** 을 가장 작게 만드는 것입니다.

모델이 매개변수에 대해 선형이면(예: y = β₀ + β₁x, 또는 x², log x 같은 항의 가중합) 답이 공식으로 한 번에 나옵니다. 각 열이 한 항인 **설계 행렬(design matrix)** `A`를 만들고(절편이면 1로 채운 열, 기울기면 x 열), `b = A \ y`로 계수를 구합니다(Day B2의 백슬래시). 예측값은 `A * b`, 잔차는 `y - A*b`입니다. 다항식이면 `polyfit(x, y, 차수)`와 `polyval(p, x)`가 같은 일을 합니다. 단, `polyfit`의 계수는 **높은 차수부터**(`[기울기 절편]`) 나와서 설계 행렬 순서와 반대입니다. 이런 순서 차이는 조용한 버그의 단골입니다.

적합도는 **R²**(데이터 분산 중 모델이 설명하는 비율, 1 − SSE/총제곱합)로 요약합니다. 항을 늘리면 R²는 항상 올라가므로, 모델끼리 비교할 때는 항 수를 벌하는 기준(AIC, BIC)이나 **교차검증**을 씁니다. 본 과정 Day 33의 데이터 누수와 같은 이야기입니다. 고차 다항식으로 잡음까지 맞추는 것이 **과적합**입니다. 값의 분포가 심하게 치우쳐 있으면(반응시간처럼) 로그 등으로 변환한 뒤 선형 모델을 쓰기도 하는데, 그때는 결과를 변환된 단위로 해석해야 합니다. 통계적 추론(p값, 신뢰구간)은 본 과정 Day 9·29–32를 따릅니다. 회귀 계수의 신뢰구간을 주는 `regress`, `fitlm`은 MATLAB Statistics Toolbox 함수이고 Octave에서는 statistics 패키지가 필요합니다(이 레슨에서는 설치하지 않았습니다).

### 모델 적합 2: 비선형 최적화와 그 함정

모델이 매개변수에 대해 비선형이면(로지스틱 정신물리 곡선, 가우스 곡선, 지수 감쇠의 시간 상수) 공식 해가 없어 **반복 탐색**을 합니다. `fminsearch(목적함수, 시작값)`은 넬더–미드(Nelder–Mead) 단체법으로, 기울기 계산 없이 매개변수 공간에서 "더 낮은 곳"을 더듬어 찾습니다. 우리가 할 일은 (1) 매개변수 벡터를 받아 모델 예측을 내는 함수, (2) 예측과 데이터의 SSE를 내는 **목적함수**, (3) 그럴듯한 **시작값**을 준비하는 것입니다.

함정은 셋입니다. 첫째, **지역 최솟값(local minimum)**. 목적함수의 지형에 골짜기가 여러 개면 시작값 근처의 골짜기에 빠집니다. 산에서 안개 속에 아래로만 걸으면 가장 깊은 계곡이 아니라 가까운 웅덩이에 멈추는 것과 같습니다. 그래서 **여러 시작값에서 돌려 결과가 같은지** 확인합니다. 둘째, 매개변수의 **범위 제약**이 없어서 음수 시간 상수 같은 말이 안 되는 값으로 갈 수 있습니다. `exp`로 변환해 양수를 강제하거나, 범위를 넘으면 큰 벌점을 주는 식으로 막습니다(범위 제약 최적화 `fmincon`은 MATLAB Optimization Toolbox). 셋째, 결과가 수렴했는지 `exitflag` 출력으로 확인합니다. 그리고 적합한 곡선을 **데이터 위에 반드시 그려 봅니다.** 숫자만 보면 엉뚱한 적합을 놓칩니다.

### 시뮬레이션: 방정식을 시간 순서대로 굴리기, 난수로 과정 흉내 내기

계산 신경과학의 많은 모델은 "변화율"을 주는 **미분방정식**입니다. 누설 적분-발화(LIF) 뉴런은 τ dV/dt = −(V − E_L) + R·I이고, 문턱을 넘으면 spike로 세고 재설정합니다. 가장 단순한 풀이가 **오일러 방법**입니다. 작은 시간 간격 dt마다 `V = V + dt * (변화율)`로 한 걸음씩 나아갑니다. dt가 작을수록 정확하지만 느리고, 너무 크면 결과가 틀리거나 발산합니다. 그래서 dt를 반으로 줄여도 결과가 거의 같은지 확인하는 것이 기본 점검입니다. 정확한 해가 있는 경우(문턱 아래의 LIF 막전위)와 비교해 보는 것도 좋은 테스트입니다. 더 정교한 풀이기 `ode45`(적응형 룽게–쿠타)는 간격을 알아서 조절하며, 함수 핸들 `@(t, V) ...`를 받습니다. 다만 "문턱에서 재설정"처럼 갑자기 끊기는 규칙은 `ode45`에서 이벤트 기능을 써야 해서, 초보 단계에서는 오일러 반복문이 더 투명합니다. 같은 틀로 Izhikevich 모델, Hodgkin–Huxley 모델, 여러 뉴런의 네트워크, 강화학습(Rescorla–Wagner) 모델로 확장됩니다.

**확률적 시뮬레이션**은 난수로 과정을 흉내 냅니다. 발화율 r인 포아송 spike 열은 작은 칸 dt마다 확률 r·dt로 spike를 놓으면 근사됩니다. 포아송 과정에서는 spike 수의 평균과 분산이 같다는 성질로 점검할 수 있습니다. 시뮬레이션은 **분석 방법의 정답을 아는 시험대**로도 씁니다. 효과를 심어 넣은 가짜 데이터에서 분석이 그 효과를 되찾는지 확인한 뒤에 실제 데이터에 씁니다(시뮬레이션은 믿되 결론은 실제 데이터로). 서로 다른 시간 격자의 자료를 맞출 때는 `interp1`(1차원 보간)을 씁니다. 예를 들어 30 Hz 카메라 자료를 100 Hz 격자로 옮깁니다. 보간은 없는 정보를 만들지 않으며, 범위 밖 외삽(extrapolation)은 특히 조심해야 합니다. 신호를 낮은 표본추출률로 줄이는 다운샘플링은 앨리어싱을 막는 저역 통과 필터가 먼저 필요하므로 C 파트 레슨에서 다룹니다.

### GUI와 실험 제어: 구조만 알아 두기

연구실 MATLAB 코드에는 분석 말고도 **실험을 돌리는 코드**와 **데이터를 둘러보는 작은 창(GUI)** 이 많습니다. 직접 만들지 않더라도 구조를 알면 읽고 고칠 수 있습니다.

**GUI**는 버튼·슬라이더·입력칸 같은 **uicontrol**과, 사용자가 그것을 건드렸을 때 불리는 **콜백(callback) 함수**로 이루어집니다. 콜백은 Day B4의 함수 핸들이고, "슬라이더 값이 바뀌면 그림의 밝기를 바꿔라"처럼 사건(event)과 행동을 잇습니다. 콜백 함수들은 서로의 변수를 볼 수 없으므로, 창 전체가 공유할 자료는 `guidata`나 figure의 `UserData`에 넣어 주고받습니다(오래된 GUIDE 코드에서 `handles` 구조체와 `guidata(hObject, handles)`가 반복해서 나오는 이유). MATLAB의 GUI 도구는 GUIDE에서 **App Designer**(`uifigure` 기반)로 바뀌었고, GUIDE는 최근 버전에서 제거 예정이라 오래된 `.fig` + `.m` GUI는 이전(migration)이 필요할 수 있습니다. Octave는 `figure` + `uicontrol` 방식의 GUI를 지원하지만 GUIDE·App Designer는 없습니다. GUI의 장점은 MATLAB을 모르는 공동연구자도 분석을 돌릴 수 있게 한다는 점이고, 단점은 클릭 순서가 기록되지 않아 재현성이 떨어진다는 점입니다. 최종 분석은 스크립트로 남기세요.

**실험 제어**의 핵심은 세 가지입니다. (1) **무작위화** — 조건 순서를 `randperm`으로 섞되 조건별 횟수는 유지하고, 사용한 씨앗과 실제 순서를 저장합니다. (2) **시간 측정** — `tic`/`toc`나 `GetSecs`(Psychtoolbox)로 자극 제시와 반응 사이를 잽니다. 일반 `figure` 창과 운영체제는 화면 갱신 시점이 정확하지 않아 밀리초 단위 반응시간 실험에는 부족합니다. 그래서 정밀한 자극 제시·반응 수집에는 [Psychtoolbox](http://psychtoolbox.org/)(MATLAB과 Octave 모두 지원) 같은 전용 도구를 쓰고, 모니터 밝기 보정(감마 보정)과 화면 주사율 확인도 필요합니다. (3) **기록** — 시행마다 조건, 자극 값, 반응, 시간을 한 줄씩 즉시 파일에 써서, 실험이 중간에 멈춰도 자료가 남게 합니다. 영상 자극이나 결과 애니메이션은 반복문 안에서 그래픽 객체의 데이터를 `set`으로 바꾸고 `getframe`/`VideoWriter`로 프레임을 모아 만듭니다.

> **이 레슨이 다루지 않는 것:** 푸리에 변환, 스펙트럼, 필터, 웨이블릿과 시간-주파수 분석, spike 정렬·PSTH·발화율 분석, 상관·PCA의 신경과학 적용은 **심화 파트 C — 신경신호·시간-주파수 분석**에서 Python으로 다룹니다: [Day C1](../C-neural-signals/day-C1.md)부터 시작하세요. MATLAB 코드에서 `fft`, `filtfilt`, `hilbert`, `spectrogram`, `pwelch`를 보면 그쪽 개념이 쓰인 것입니다. `filtfilt`, `hilbert`, `spectrogram`, `pwelch` 등은 MATLAB Signal Processing Toolbox 또는 Octave signal 패키지가 필요합니다(이 레슨에서는 설치하지 않음).

## 예시로 이해하기

> 출력은 GNU Octave 11.3에서 실행한 그대로입니다. 모든 데이터는 코드 안에서 만든 **가상 데이터**이며, 실제 환자·참가자의 특성을 뜻하지 않습니다.

### 예시 1 — 선형 최소제곱: 백슬래시와 polyfit

```matlab
% 선형 최소제곱: 나이(세)와 보행 속도(m/s)의 가상 관계
rng(11);
age   = (55:5:85)';
speed = 1.6 - 0.008*age + 0.05*randn(size(age));
A = [ones(size(age)) age];          % 설계 행렬: 절편 열 + 기울기 열
b = A \ speed                        % [절편; 기울기]
pred = A * b;
R2 = 1 - sum((speed - pred).^2) / sum((speed - mean(speed)).^2)
p = polyfit(age, speed, 1)           % 같은 직선, 계수 순서는 [기울기 절편]
polyval(p, 70)                       % 70세에서의 예측값
```

출력:

```text
b =

   1.4382e+00
  -6.1181e-03

R2 = 0.8313
p =

  -6.1181e-03   1.4382e+00

ans = 1.0099
```

두 방법의 계수가 같고 순서만 반대입니다. 데이터를 만들 때 넣은 기울기는 −0.008인데 추정값은 −0.0061입니다. 점 7개에 잡음이 섞이면 이 정도 차이는 흔합니다. 표본이 작을 때 추정값 하나를 "참값"처럼 말하지 말고 불확실성(신뢰구간, bootstrap — 본 과정 Day 9·30)과 함께 보고하세요.

### 예시 2 — fminsearch로 정신물리 곡선 맞추기, 그리고 지역 최솟값

```matlab
% 비선형 적합: 자극 세기에 따른 정답률(로지스틱 곡선)을 fminsearch로 (가상 데이터)
intensity = [1 2 3 4 5 6 7 8];
p_correct = [0.52 0.55 0.61 0.74 0.86 0.93 0.97 0.98];
model = @(q, x) 0.5 + 0.5 ./ (1 + exp(-(x - q(1)) / q(2)));   % q(1)=문턱, q(2)=기울기 폭
sse   = @(q) sum((p_correct - model(q, intensity)).^2);        % 줄이고 싶은 값
q0 = [3 1];                                                    % 시작값
[q_hat, err] = fminsearch(sse, q0)
starts = [1 0.5; 6 3; 20 0.1];                                 % 시작값을 바꿔 다시
for k = 1:size(starts, 1)
    qk = fminsearch(sse, starts(k, :));
    fprintf('시작 [%g %g] -> 문턱 %.3f, 폭 %.3f\n', starts(k, :), qk);
end
% 지역 최솟값이 많은 문제: 사인파의 주파수 맞추기 (참값 3 Hz)
t = 0:0.01:1;
y = sin(2*pi*3*t);
sse_f = @(f) sum((y - sin(2*pi*f*t)).^2);
for f0 = [2.8 1 5.5]
    fprintf('시작 %.1f Hz -> 찾은 값 %.2f Hz (오차제곱합 %.1f)\n', f0, fminsearch(sse_f, f0), sse_f(fminsearch(sse_f, f0)));
end
```

출력:

```text
q_hat =

   4.1312   0.9746

err = 3.3731e-04
시작 [1 0.5] -> 문턱 4.131, 폭 0.975
시작 [6 3] -> 문턱 4.131, 폭 0.975
시작 [20 0.1] -> 문턱 4.131, 폭 0.974
시작 2.8 Hz -> 찾은 값 3.00 Hz (오차제곱합 0.0)
시작 1.0 Hz -> 찾은 값 5.19 Hz (오차제곱합 94.9)
시작 5.5 Hz -> 찾은 값 27.46 Hz (오차제곱합 100.0)
```

정신물리 곡선은 지형이 단순해 어디서 시작해도 같은 답(문턱 약 4.13)에 도착했습니다. 반면 사인파 주파수 맞추기는 목적함수에 골짜기가 많아, 참값 근처(2.8 Hz)에서 시작할 때만 3 Hz를 찾았고 다른 시작값에서는 엉뚱한 곳에 멈췄습니다. **오차제곱합이 크게 남는 것이 경고 신호**입니다. 이런 문제는 시작값을 격자로 여러 개 시도하거나, 애초에 다른 방법(주파수라면 푸리에 변환 — C 파트)을 씁니다.

### 예시 3 — LIF 뉴런: 오일러 방법과 ode45

```matlab
% 누설 적분-발화(leaky integrate-and-fire) 뉴런을 오일러 방법으로 시뮬레이션
dt = 0.1;  T = 500;                  % ms
time = 0:dt:T;
E_L = -70; V_th = -54; V_reset = -80;   % mV
tau = 20;  R = 10;                      % ms, MOhm
I_list = [1.0 1.8 2.5 3.5];             % nA
for I = I_list
    V = E_L;  n_spike = 0;
    for k = 2:numel(time)
        dV = (-(V - E_L) + R*I) / tau;  % 막전위 변화율
        V  = V + dt * dV;               % 오일러 한 걸음
        if V >= V_th
            V = V_reset;  n_spike = n_spike + 1;
        end
    end
    fprintf('I = %.1f nA -> %2d spikes / %d ms (%.0f Hz)\n', I, n_spike, T, n_spike/(T/1000));
end
% 같은 막 방정식을 ode45로 풀어 문턱 아래 구간에서 오일러 결과와 비교
I = 1.0;
f = @(t, V) (-(V - E_L) + R*I) / tau;
[t45, V45] = ode45(f, [0 100], E_L);
V_euler = E_L; for k = 1:round(100/dt), V_euler = V_euler + dt*f(0, V_euler); end
V_exact = E_L + R*I*(1 - exp(-100/tau));
fprintf('100 ms 후: 정확해 %.4f | 오일러 %.4f | ode45 %.4f mV\n', V_exact, V_euler, V45(end));
```

출력:

```text
I = 1.0 nA ->  0 spikes / 500 ms (0 Hz)
I = 1.8 nA ->  9 spikes / 500 ms (18 Hz)
I = 2.5 nA -> 18 spikes / 500 ms (36 Hz)
I = 3.5 nA -> 29 spikes / 500 ms (58 Hz)
100 ms 후: 정확해 -60.0674 | 오일러 -60.0665 | ode45 -60.0674 mV
```

1 nA에서는 막전위가 최대 −70 + 10 = −60 mV까지만 올라 문턱(−54 mV)에 닿지 못해 spike가 없습니다. 전류를 올리면 발화율이 늘어나는 **f–I 곡선**이 나옵니다. 마지막 줄은 모델 점검입니다. 정확한 해와 비교하면 오일러(dt = 0.1 ms)는 소수 셋째 자리에서 차이가 나고, `ode45`는 거의 정확합니다.

### 예시 4 — 포아송 spike 열과 보간

```matlab
% 포아송 spike 열 흉내 내기 + interp1으로 다른 시간 격자에 맞추기
rng(4);
rate = 20;  dt = 0.001;  T = 2;           % 20 Hz, 1 ms 칸, 2초
n_trial = 200;
spikes = rand(n_trial, round(T/dt)) < rate*dt;   % 칸마다 확률 rate*dt로 spike
counts = sum(spikes, 2);
fprintf('시행당 spike 수: 평균 %.2f, 분산 %.2f (포아송이면 둘이 비슷)\n', mean(counts), var(counts));
% 30 Hz로 기록된 속도 값을 100 Hz 격자로 보간
t30  = 0:1/30:1;
v30  = sin(2*pi*t30);
t100 = 0:1/100:1;
v100 = interp1(t30, v30, t100, 'linear');
fprintf('보간 전 %d점 -> 보간 후 %d점, t=0.25 s 값: %.3f (참값 1)\n', numel(t30), numel(t100), v100(26));
```

출력:

```text
시행당 spike 수: 평균 40.33, 분산 32.93 (포아송이면 둘이 비슷)
보간 전 31점 -> 보간 후 101점, t=0.25 s 값: 0.995 (참값 1)
```

평균은 기대값 40(20 Hz × 2초)에 가깝습니다. 분산이 평균보다 조금 작은 것은 이 방식이 칸마다 spike를 최대 하나만 허용하는 근사(이항 분포)이고 시행이 200개뿐이기 때문입니다. 선형 보간은 정점(t = 0.25 s) 근처에서 곡선을 직선으로 이어 실제값보다 조금 낮게 나왔습니다. 이런 spike 행렬로 PSTH나 발화율을 계산하는 방법은 [C 파트](../C-neural-signals/day-C1.md)에서 다룹니다.

### 예시 5 — 시행 순서 무작위화와 아주 작은 GUI 콜백

```matlab
% 시행 순서 무작위화 + 아주 작은 GUI (화면 없이 콜백만 시험)
rng(9);
conds = repmat([1 2 3], 1, 4);                 % 세 조건 x 4번
order = conds(randperm(numel(conds)))
histc(order, 1:3)                              % 조건별 횟수는 그대로 4,4,4
fig = figure('visible', 'off');
ax  = axes('parent', fig, 'position', [0.1 0.3 0.8 0.6]);
img = imagesc(ax, zeros(10)); caxis(ax, [0 1]);
sld = uicontrol(fig, 'style', 'slider', 'min', 0, 'max', 1, 'value', 0, ...
                'units', 'normalized', 'position', [0.1 0.05 0.8 0.08]);
set(sld, 'callback', @(src, evt) set(img, 'cdata', get(src, 'value') * ones(10)));
set(sld, 'value', 0.7);                        % 사용자가 슬라이더를 0.7로 옮겼다고 치고
cb = get(sld, 'callback'); cb(sld, []);        % 콜백을 직접 호출
c = get(img, 'cdata');
fprintf('그림 밝기 = %.1f\n', mean(c(:)));
close(fig)
```

출력:

```text
order =

   3   1   1   2   2   3   3   2   3   2   1   1

ans =

   4   4   4

그림 밝기 = 0.7
```

`randperm`으로 섞어도 조건별 횟수는 4, 4, 4로 유지됩니다(균형 잡힌 무작위화). 같은 조건이 연달아 세 번 이상 나오지 않게 하는 등 추가 제약이 필요하면 섞은 뒤 검사해 다시 섞습니다. GUI 부분은 화면 없이 실행하려고 창을 숨기고, 사용자가 슬라이더를 움직인 상황을 **콜백을 직접 불러** 흉내 냈습니다. 콜백 함수는 `(src, evt)` 두 입력을 받는다는 규칙과, 콜백 안에서 다른 그래픽 객체(`img`)를 핸들로 바꾼다는 구조가 핵심입니다. 실제 화면에서는 `'visible', 'off'`를 빼고 슬라이더를 마우스로 움직이면 됩니다(화면 조작은 이 레슨에서 실행 확인하지 않았습니다). `histc`는 MATLAB에서 권장되지 않는 함수로 바뀌었고 `histcounts`가 대신하지만, `histcounts`는 Octave 11에 없어 양쪽에서 도는 `histc`를 썼습니다.

## 직접 해보기

1. `notebooks/advanced/B/B7_fit_and_simulate.m`에 예시 1–5를 칸별로 넣고 실행합니다.
2. **적합 그림.** 예시 2의 데이터 점과 적합 곡선(`intensity`를 `linspace(1, 8, 100)`로 촘촘히)을 한 그림에 그리고, 문턱 위치에 세로선을 긋습니다. `figures/advanced/B/B7_psychometric.png`로 저장합니다.
3. **dt 점검.** 예시 3에서 dt를 0.1, 0.05, 0.01 ms로 바꿔 I = 2.5 nA의 spike 수가 안정되는지 표로 적습니다. 결과가 dt에 따라 크게 바뀌면 시뮬레이션을 믿을 수 없다는 뜻입니다.
4. **f–I 곡선.** 전류 0–4 nA를 0.1 간격으로 돌려 발화율 곡선을 그립니다. 반복문 안의 반복문이 느리면 Day B6 방법으로 시간을 재 봅니다.
5. **분석 방법 시험.** 예시 4의 방식으로 두 조건(20 Hz, 25 Hz) spike 열을 시행 20개씩 만들고, 시행별 spike 수의 평균 차이를 permutation 검정(조건 이름표를 `randperm`으로 섞어 1000번)으로 검정합니다. 정답(실제로 차이가 있음)을 아는 데이터에서 방법이 그 차이를 찾는지, 시행 수를 5개로 줄이면 어떻게 되는지 적습니다. 검정의 개념은 본 과정 Day 9·30을 참고합니다.
6. **이식 노트 쓰기.** `reports/advanced/B_matlab_port_note.md`에 이번 파트에서 만든 MATLAB 코드 하나(예: `cv_of.m` 또는 예시 3)를 Python으로 옮길 때의 대응표(함수, 인덱스, 기본값 차이)를 5줄 이상 적습니다. Octave에서 안 돌았던 MATLAB 전용 기능 목록도 함께 적습니다.

⚠️ **흔한 오류 1 — 목적함수가 매개변수 벡터를 받지 않음.** `fminsearch`는 목적함수에 **벡터 하나**를 넘깁니다. `sse(a, b)`처럼 매개변수를 따로 받게 쓰면 오류가 납니다. `@(q) ...`에서 `q(1)`, `q(2)`로 꺼내 쓰세요.

⚠️ **흔한 오류 2 — 시뮬레이션 결과를 실제 생물학으로 말하기.** 예시 3의 발화율은 우리가 고른 매개변수의 결과일 뿐입니다. 모델의 출력은 "이 가정이면 이런 행동이 나온다"는 가설이고, 실제 뉴런·환자에 대한 주장은 실제 데이터로만 할 수 있습니다.

## 퀴즈

**1.** `polyfit(x, y, 1)`이 `[0.5 2]`를 돌려줬습니다. 이 직선의 식은?

(a) y = 0.5 + 2x (b) y = 0.5x + 2 (c) y = 2x² + 0.5 (d) 알 수 없다

<details><summary>정답 보기</summary>

(b). `polyfit`은 높은 차수부터 계수를 돌려주므로 [기울기 절편]입니다. `A = [ones x]`로 만든 설계 행렬의 `A \ y`는 [절편; 기울기] 순서라 반대입니다.

</details>

**2.** `fminsearch`를 시작값 세 개로 돌렸더니 결과가 셋 다 다르고 오차제곱합도 다릅니다. 무엇을 의심해야 하나요? (단답)

<details><summary>정답 보기</summary>

목적함수에 지역 최솟값이 여럿 있어 시작값마다 다른 골짜기에 멈췄을 가능성입니다. 오차제곱합이 가장 작은 결과를 고르되, 시작값을 더 넓게 격자로 시도하고, 적합 곡선을 데이터 위에 그려 확인하며, 가능하면 문제에 맞는 다른 방법을 씁니다.

</details>

**3.** 오일러 방법으로 시뮬레이션할 때 결과를 믿을 수 있는지 확인하는 가장 간단한 방법은?

(a) dt를 키워 빠르게 돌린다 (b) dt를 줄여도 결과가 거의 같은지 본다 (c) 반복문을 벡터화한다 (d) 난수 씨앗을 바꾼다

<details><summary>정답 보기</summary>

(b). 간격을 줄였을 때 결과가 수렴하면 이산화 오차가 작다는 뜻입니다. 정확한 해가 있는 단순한 경우와 비교하는 것도 좋은 점검입니다.

</details>

**4.** GUI의 콜백 함수끼리 변수를 직접 볼 수 없는 이유와, 자료를 공유하는 방법은? (단답)

<details><summary>정답 보기</summary>

콜백도 함수라서 실행될 때마다 자기 작업 공간을 가지기 때문입니다(Day B4의 스코프). figure에 붙은 `guidata`나 `UserData`에 자료를 넣고 꺼내 공유하며, 바꾼 뒤에는 다시 저장해야 다른 콜백이 새 값을 봅니다.

</details>

**5.** 밀리초 단위 반응시간 실험을 일반 `figure` 창과 `tic`/`toc`만으로 만들면 왜 문제가 될 수 있나요? (단답)

<details><summary>정답 보기</summary>

일반 창은 화면이 실제로 바뀌는 순간(모니터 주사 시점)과 코드가 그리라고 명령한 순간이 어긋나고, 운영체제의 다른 작업이 끼어들어 시간 오차가 수십 ms까지 생길 수 있습니다. Psychtoolbox 같은 도구는 화면 갱신과 동기화하고 시간을 정밀하게 기록합니다.

</details>

> **더 읽을거리:** Wallisch P, et al. *MATLAB for Neuroscientists*, 2nd ed. Academic Press (Elsevier), 2014 — [출판사 페이지](https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0) · Cohen MX. *MATLAB for Brain and Cognitive Scientists*. MIT Press, 2017 — [출판사 페이지](https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/) · [GNU Octave 문서](https://docs.octave.org/latest/) · [Octave와 MATLAB의 차이](https://wiki.octave.org/Differences_between_Octave_and_Matlab) · Izhikevich EM. Simple model of spiking neurons. *IEEE Trans Neural Netw.* 2003;14:1569–1572. doi:[10.1109/TNN.2003.820440](https://doi.org/10.1109/TNN.2003.820440) · Brainard DH. The Psychophysics Toolbox. *Spat Vis.* 1997;10:433–436. doi:[10.1163/156856897X00357](https://doi.org/10.1163/156856897X00357)

## 오늘의 산출물 체크리스트
- [ ] 선형 적합의 두 방법(백슬래시, `polyfit`) 계수 순서 차이를 확인했다.
- [ ] 정신물리 곡선 적합 그림을 저장하고, 시작값을 바꿔 결과가 안정적인지 확인했다.
- [ ] LIF 시뮬레이션의 dt 점검 표와 f–I 곡선을 만들었다.
- [ ] `reports/advanced/B_matlab_port_note.md`에 MATLAB → Python 대응표와 Octave 미지원 목록을 적었다.
- [ ] 다음 단계로 [심화 파트 C — 신경신호·시간-주파수 분석](../C-neural-signals/day-C1.md)을 확인했다.

---
[← 이전](day-B6.md) · [코스 지도](../../../README.md) · [다음 →](../../../README.md)
