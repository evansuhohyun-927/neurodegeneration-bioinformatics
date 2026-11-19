# Day I6 — 에너지와 동역학적 보행: 역진자, 충돌, 그리고 걷기의 비용

> **주차:** 심화 파트 I — 보행분석 (1주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I6_inverted_pendulum.ipynb`, `figures/advanced/I/I6_pe_ke.png`
>
> **먼저 끝내 둘 레슨:** [Day I2](day-I2.md)(전진의 동력), [Day I4](day-I4.md)(일·파워의 부호). 오늘은 실제 데이터 없이 물리 모델을 시뮬레이션합니다.
>
> **이론 노트:** [T05 — 에너지와 동역학적 보행](../I-gait-theory/note-T05.md)에서 일·파워·효율의 정의와 속도의 영향을 더 깊게 다룹니다.

## 오늘의 목표
- stance 다리를 역진자(inverted pendulum)로 보고, 질량중심(COM)의 위치에너지와 운동에너지가 서로 바뀌는 모습을 시뮬레이션으로 보일 수 있다.
- heel strike 충돌과 step-to-step transition이 왜 에너지 비용을 만드는지, 보폭에 따라 그 비용이 어떻게 커지는지 계산할 수 있다.
- 시간당 에너지(O₂ rate)와 거리당 에너지(O₂ cost)를 구분하고, 병적 보행에서 늘어나는 것이 무엇인지 말할 수 있다. six determinants 이론과 그 비판을 함께 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [Biomechanics of Movement | Demo: Energy Exchange Mechanisms During Walking and Running — Biomechanics of Movement](https://www.youtube.com/watch?v=uMznt12Ro1U) (1:52)
- **무엇에 주목할까:** 걷기에서는 몸이 가장 높을 때 가장 느리고, 달리기에서는 그렇지 않다는 대비에 주목하세요. 오늘 시뮬레이션의 위치에너지와 운동에너지 그래프가 바로 이 대비를 보여 줍니다.

- [Why we walk the way we do 4 (energy) — Walking with Richard](https://www.youtube.com/watch?v=hDt6QsErrX8) (15:28)
- **무엇에 주목할까:** 걷기의 에너지를 "진자처럼 공짜로 교환되는 부분"과 "걸음마다 다시 채워 넣어야 하는 부분"으로 나누어 보는지 확인하세요. 후자가 오늘 계산할 충돌 손실입니다.

## 개념 설명

### 역진자: 진자를 거꾸로 세우면 걷기가 된다

추시계의 진자는 맨 아래에서 가장 빠르고 양 끝에서 멈칫합니다. 위치에너지(PE)와 운동에너지(KE)가 서로 바뀌기 때문입니다. stance 다리는 이 진자를 **거꾸로 세운 것**과 비슷합니다. 발을 축으로 몸이 원호를 그리며 넘어가는데, 다리가 수직이 되는 MSt에 몸이 가장 높고 가장 느리며, 다리가 비스듬한 double stance 무렵에 가장 낮고 가장 빠릅니다([W] 2장 pp.36–38, [Wi] 6.2절 pp.128–133). PE와 KE가 **반대 위상**으로 움직이면 근육이 일하지 않아도 둘이 서로 메워 주고, 같은 위상이면 교환이 없습니다. Winter는 몸통(HAT)에서는 교환이 크고 종아리 분절에서는 거의 없다고 정리합니다([Wi] 6.2.1절).

이상적인 역진자는 마찰이 없는 보존계라서, 글자 그대로면 걷는 데 일이 **전혀 필요 없다**는 결론이 나옵니다. 실제로는 걷는 데 에너지가 듭니다. 이 모순을 푸는 것이 다음 개념입니다([Kuo & Donelan 2010](https://doi.org/10.2522/ptj.20090125)).

### 충돌과 step-to-step transition: 에너지가 새는 곳

Kuo와 Donelan의 dynamic walking 관점은 역진자 stance, 진자 swing에 **heel strike 충돌**을 더합니다. 한 걸음이 끝날 때 COM은 앞·아래로 움직이고 있는데, 다음 역진자 호는 앞·위로 시작해야 합니다. 이 방향 전환을 앞다리의 **충돌**(음의 일, 에너지 손실)과 뒷다리의 **push-off**(양의 일)가 맡습니다. 두 다리의 이 일을 합쳐 **step-to-step transition** 비용이라고 부르고, 편한 속도에서 순 대사 비용의 약 2/3가 여기서, 최대 약 1/3이 다리를 앞뒤로 흔드는 데서 나온다고 봅니다. 앞다리가 닿기 **직전에** 뒷다리로 미리 밀어 주면 충돌 속도가 줄어 손실이 가장 작고, 다른 방식(예: stance 중 고관절의 일)으로 메우면 이상 모델에서 손실이 최대 4배까지 커집니다. 걸음 빈도를 고정하면 이 전환 비용은 보폭의 약 4제곱에 비례해 늘어납니다(같은 논문).

임상과의 연결도 여기서 나옵니다. 마비측 push-off가 약하면 반대쪽 다리의 충돌이 커져 전체 일이 늘어납니다. 뇌졸중 환자는 마비측 push-off 일이 적고 두 다리의 총 일이 같은 속도의 건강인보다 많습니다. 체중의 3/4을 들어 주는 체중 지지 장치도 에너지 소비를 1/4만큼도 줄이지 못하는데, COM의 방향 전환은 체중이 아니라 **질량**에 달렸기 때문입니다(같은 논문).

### six determinants: 소개하되 정설로 외우지 않는다

Saunders 등(1953)은 COM의 상하·좌우 이동을 **줄이는** 여섯 가지 움직임(골반 회전, 골반 기울임, stance 무릎 굴곡, 발목·발의 기전 둘, 몸의 좌우 이동)이 에너지를 아낀다고 제안했습니다. Whittle은 이 이론을 자세히 소개하면서도, 그 전에 반론을 먼저 싣습니다. 이 움직임들이 실제로 있기는 하지만 에너지 절약에 기여하는지는 의문이고, 특히 Baker(2004)는 "상하 이동을 줄여 에너지를 아낀다"는 전제 자체를 부정하고 PE–KE 교환을 주된 절약 기전으로 봅니다([W] 2장 pp.38–41). Perry도 골반 기울임과 무릎 굴곡이 COM 최고점(약 29% GC)보다 너무 일찍(약 12% GC) 작용해 최고점을 몇 mm밖에 낮추지 못한다는 반론을 인용합니다([P] 3장 Center of Gravity Alignment Modulation). Kuo와 Donelan은 더 나아가, COM을 일부러 평평하게 유지하며 걸으면 에너지가 오히려 늘고 최대한 평평하게 하면 두 배 이상이 된다는 실험들을 들어 이 이론을 **검증되지 않은 가설**로 봅니다. 역진자 관점에서는 COM이 오르내려야 교환이 일어나므로, 두 관점은 정면으로 부딪칩니다.

### 시간당 비용과 거리당 비용, 그리고 병적 보행

대사 에너지는 두 가지로 표현합니다. **O₂ rate**(시간당 산소 소비, mL/kg·min)는 "지금 얼마나 힘든가", **O₂ cost**(거리당 산소 소비, mL/kg·m)는 "1 m 가는 데 얼마나 드는가"입니다. cost = rate ÷ 속도입니다([P] 24장). Whittle이 소개하는 경험식으로 보면, 시간당 비용은 속도의 제곱으로 늘지만 거리당 비용은 U자 모양이라 약 1.33 m/s에서 가장 낮습니다([W] 2장 p.37). Perry는 평소 속도(82 m/min)의 정상 보행이 최대 유산소 능력의 약 38%를 쓰고, 지치지 않고 계속할 수 있는 한계가 약 50%라고 정리합니다([P] 3장 Energy Conservation).

병적 보행에서 늘어나는 것은 무엇일까요? Perry 24장(Waters)의 중심 명제는 이렇습니다. 걷기가 비효율적이 되면 대부분의 환자는 **속도를 줄여서 시간당 O₂ rate를 정상 범위에 묶어 둡니다.** 그 대가로 **거리당 O₂ cost가 커집니다.** 즉 "rate는 거의 정상, 속도는 느림, cost는 큼"이 전형입니다([P] 24장 Amputation Level, Hemiplegia, Spastic Diplegia). "환자는 걸을 때 더 숨이 찬다"보다 "**같은 거리를 가는 데 더 많은 에너지를 쓰고, 그 부담을 느린 속도로 나눠 낸다**"가 정확한 표현입니다. 하나 더 조심할 점: COM의 에너지 변화만으로 일을 계산하면 두 다리처럼 반대로 움직이는 분절의 변화가 서로 상쇄되어 실제 근육 일을 과소평가합니다([Wi] 6.3절 pp.133–136).

## 예시로 이해하기

> 아래는 모두 **가상 시뮬레이션**입니다. 모델의 가정(점 질량, 질량 없는 곧은 다리, 마찰 없음)이 결과를 정합니다.

### 예시 1 — 역진자 한 step: PE와 KE의 교환

```python
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp

g = 9.81

def stance(L=0.9, step=0.7, v_mid=1.2, m=70.0):
    """질량 m이 길이 L의 가벼운 다리 끝에 얹힌 역진자.
    θ = 수직선에서 앞으로 기운 각(rad). 운동방정식 θ'' = (g/L) sin θ.
    한 step 동안 θ는 −α → +α (α = asin(step/2 / L)). 중간(θ = 0, 가장 높고 가장 느린 점)의 속력이 v_mid가 되도록 시작 속도를 정한다."""
    a = np.arcsin(step / 2 / L)
    w0 = np.sqrt((v_mid / L) ** 2 + 2 * g / L * (1 - np.cos(a)))   # 중간(가장 높은 점)에서 v_mid가 되도록 에너지 보존으로 역산
    hit = lambda t, s: s[0] - a                                      # θ가 +α에 닿으면 멈춤
    hit.terminal = True
    sol = solve_ivp(lambda t, s: [s[1], g / L * np.sin(s[0])], [0, 3], [-a, w0],
                    events=hit, max_step=1e-3, rtol=1e-9)
    th, w = sol.y
    y = L * np.cos(th)                            # COM 높이
    v = L * w                                     # COM 속력(원 궤도 위)
    PE = m * g * (y - y.min())                    # 가장 낮은 점을 0으로
    KE = 0.5 * m * v ** 2
    return sol.t, th, y, v, PE, KE, a

t, th, y, v, PE, KE, a = stance()
E = PE + KE
print("step 시간 %.3f s, COM 높이 변화 %.1f cm, 속력 %.2f → %.2f → %.2f m/s"
      % (t[-1], 100 * (y.max() - y.min()), v[0], v[np.argmax(y)], v[-1]))
print("PE 최대 시점 = KE 최소 시점? %s | 총에너지 변동 %.2e J (보존계라 거의 0)"
      % (np.argmax(PE) == np.argmin(KE), E.max() - E.min()))
r = (np.abs(np.diff(PE)).sum() + np.abs(np.diff(KE)).sum() - np.abs(np.diff(E)).sum()) / \
    (np.abs(np.diff(PE)).sum() + np.abs(np.diff(KE)).sum())
print("PE–KE 교환 비율(recovery) = %.0f%%" % (100 * r))

fig, ax = plt.subplots(figsize=(6, 3.4))
pct = 100 * t / t[-1]
ax.plot(pct, PE, label="potential (PE)")
ax.plot(pct, KE - KE.min(), label="kinetic (KE − min)")
ax.plot(pct, E - E.min(), "k--", label="total (− min)")
ax.set_xlabel("% of single stance (inverted pendulum)"); ax.set_ylabel("energy change (J)")
ax.legend(); ax.set_title("simulated inverted-pendulum stance, L = 0.9 m")
out = Path("figures/advanced/I/I6_pe_ke.png")
out.parent.mkdir(parents=True, exist_ok=True)
fig.tight_layout(); fig.savefig(out, dpi=150)
print("저장:", out)

print("\n다리 길이·속도를 바꾸면 (step 0.7 m)")
print(" L(m)  v_mid(m/s)  step 시간(s)  COM 높이 변화(cm)  v²/(gL)")
for L in (0.8, 0.9, 1.0):
    for vm in (1.0, 1.4):
        t, th, y, v, PE, KE, a = stance(L=L, v_mid=vm)
        print(" %.1f     %.1f        %.3f          %.1f            %.2f"
              % (L, vm, t[-1], 100 * (y.max() - y.min()), vm ** 2 / (g * L)))
```

실행 결과(그림은 `figures/advanced/I/I6_pe_ke.png`):

```text
step 시간 0.530 s, COM 높이 변화 7.1 cm, 속력 1.68 → 1.20 → 1.68 m/s
PE 최대 시점 = KE 최소 시점? True | 총에너지 변동 2.27e-13 J (보존계라 거의 0)
PE–KE 교환 비율(recovery) = 100%
저장: figures/advanced/I/I6_pe_ke.png

다리 길이·속도를 바꾸면 (step 0.7 m)
 L(m)  v_mid(m/s)  step 시간(s)  COM 높이 변화(cm)  v²/(gL)
 0.8     1.0        0.606          8.1            0.13
 0.8     1.4        0.465          8.1            0.25
 0.9     1.0        0.611          7.1            0.11
 0.9     1.4        0.466          7.1            0.22
 1.0     1.0        0.616          6.3            0.10
 1.0     1.4        0.468          6.3            0.20
```

PE가 가장 클 때 KE가 가장 작고, 총에너지는 계산 오차 수준(10⁻¹³ J)으로 일정합니다. 교환 비율은 100%로, 이 모델에서는 근육 일이 필요 없습니다. 세 가지를 짚어 둡니다.

- **COM 높이 변화가 너무 크다.** 곧은 다리 역진자는 7 cm 안팎을 예측하지만, 실제 측정은 Perry가 인용한 값으로 수직 약 3.2 cm, Whittle이 인용한 값으로 전체 범위 약 4.6 cm입니다([P] 3장, [W] 2장 pp.23–24). 실제 다리는 stance 무릎 굴곡, 발목과 발의 굴림, double stance 때문에 완전한 원호를 그리지 않습니다.
- **COM 높이 변화는 다리 길이와 보폭만으로 정해지고 속도와 무관하다.** 기하학(L − L·cos α)이기 때문입니다. 속도는 step 시간만 바꿉니다.
- **v²/(gL)이 1을 넘으면 모델이 깨진다.** 원호 꼭대기에서 몸을 다리 위에 붙잡아 두려면 구심가속도 v²/L이 g보다 작아야 합니다. 다리 길이 0.9 m라면 약 3 m/s가 걷기의 물리적 상한이라는 뜻이고, 실제 사람은 그보다 훨씬 낮은 속도에서 달리기로 바꿉니다. 이 비율은 다리 길이가 다른 사람의 속도를 비교하는 무차원 지표(Froude 수)로도 쓰입니다.

### 예시 2 — 충돌 손실은 보폭의 4제곱으로 커진다

```python
import numpy as np

# 가장 단순한 충돌 모델: heel strike 순간 COM 속도 방향이 두 다리 사이 각 2α만큼 꺾이고,
# 새 다리 방향(다리를 따라 미는 충격) 성분은 사라진다 → 남는 속력 = v·cos(2α)
L, m, f = 0.9, 70.0, 1.8            # 다리 길이(m), 질량(kg), step 빈도(steps/s)를 고정
print("step(m)  α(deg)  속도(m/s)  KE 중 잃는 비율  step당 손실(J)  손실/step⁴")
for s in [0.5, 0.6, 0.7, 0.8]:
    a = np.arcsin(s / 2 / L)
    v = s * f                         # 빈도를 고정하면 속도는 step 길이에 비례(충돌 직전 속력을 평균 속도로 근사)
    lost_frac = 1 - np.cos(2 * a) ** 2
    lost = 0.5 * m * v ** 2 * lost_frac
    print(" %.1f     %5.1f    %.2f       %5.1f%%          %5.1f        %.0f"
          % (s, np.degrees(a), v, 100 * lost_frac, lost, lost / s ** 4))
```

실행 결과:

```text
step(m)  α(deg)  속도(m/s)  KE 중 잃는 비율  step당 손실(J)  손실/step⁴
 0.5      16.1    0.90        28.5%            8.1        129
 0.6      19.5    1.08        39.5%           16.1        124
 0.7      22.9    1.26        51.3%           28.5        119
 0.8      26.4    1.44        63.4%           46.0        112
```

step을 0.5 m에서 0.8 m로 1.6배 늘리면 손실은 8.1 J에서 46.0 J로 약 5.7배 커집니다. 마지막 열(손실 ÷ step⁴)이 거의 일정하다는 것은 손실이 대략 보폭의 4제곱을 따른다는 뜻입니다. 두 다리 사이 각이 커지면 꺾이는 방향 2α가 커지고(손실 비율 ∝ α²), 빈도가 고정이면 속도도 보폭에 비례하기 때문(v² ∝ s²)입니다. 이 모델은 push-off를 넣지 않았기 때문에 잃는 비율(29–63%)이 매우 큽니다. 실제 사람은 충돌 직전에 뒷다리로 밀어 이 손실의 상당 부분을 막습니다. 이 단순 충돌식은 모델의 가정에서 직접 유도한 것이고, 논문에 실린 식을 옮긴 것이 아닙니다.

### 예시 3 — 시간당 비용과 거리당 비용

```python
import numpy as np

# [W] 2장 p.37의 두 경험식(체중 1 kg당): 시간당 Ew = 2.23 + 1.26 v² (W/kg), 거리당 Em = Ew / v (J/m/kg)
v = np.linspace(0.5, 2.0, 151)
Ew = 2.23 + 1.26 * v ** 2
Em = Ew / v
i = np.argmin(Em)
print("거리당 비용이 가장 낮은 속도 = %.2f m/s (해석해 √(2.23/1.26) = %.2f)" % (v[i], np.sqrt(2.23 / 1.26)))
for vv in (0.6, 1.0, 1.33, 1.8):
    print("v = %.2f m/s: 시간당 %.2f W/kg, 거리당 %.2f J/m/kg" % (vv, 2.23 + 1.26 * vv ** 2, (2.23 + 1.26 * vv ** 2) / vv))

# [P] 24장의 성인 식: O2 rate(mL/kg·min) = 0.129·V + 2.60 (V: m/min), cost = rate / V
V = 82
rate = 0.129 * V + 2.60
print("\n정상 성인 82 m/min: O2 rate %.1f mL/kg·min, O2 cost %.3f mL/kg·m" % (rate, rate / V))
V_pt = 40                                       # 가상 환자: 같은 rate를 유지하려고 40 m/min으로 걷는다
print("가상 환자 40 m/min, rate를 %.1f로 유지하면 cost = %.3f mL/kg·m (정상의 %.1f배)"
      % (rate, rate / V_pt, (rate / V_pt) / (rate / V)))
```

실행 결과:

```text
거리당 비용이 가장 낮은 속도 = 1.33 m/s (해석해 √(2.23/1.26) = 1.33)
v = 0.60 m/s: 시간당 2.68 W/kg, 거리당 4.47 J/m/kg
v = 1.00 m/s: 시간당 3.49 W/kg, 거리당 3.49 J/m/kg
v = 1.33 m/s: 시간당 4.46 W/kg, 거리당 3.35 J/m/kg
v = 1.80 m/s: 시간당 6.31 W/kg, 거리당 3.51 J/m/kg

정상 성인 82 m/min: O2 rate 13.2 mL/kg·min, O2 cost 0.161 mL/kg·m
가상 환자 40 m/min, rate를 13.2로 유지하면 cost = 0.329 mL/kg·m (정상의 2.1배)
```

0.6 m/s로 느리게 걸으면 시간당으로는 가장 덜 힘들지만, 1 m마다 드는 에너지는 1.33 m/s보다 약 33% 많습니다. 두 식은 출처가 다르고(앞의 것은 Whittle이 소개한 경험식, 뒤의 것은 Perry 24장의 성인 선형식) 단위도 다르므로 숫자끼리 직접 섞지 않습니다. Perry의 선형식은 측정한 속도 범위(약 40–100 m/min)에서 거의 직선이라 그 자체로는 "가장 경제적인 속도"를 주지 않습니다. 가상 환자의 예는 Perry가 말한 "rate를 지키려고 속도를 줄이면 cost가 커진다"는 관계를 숫자로 보여 줄 뿐, 실제 환자 자료가 아닙니다.

## 직접 해보기

1. `notebooks/advanced/I/I6_inverted_pendulum.ipynb`에서 예시 1–3을 실행하고 출력이 같은지 확인합니다.
2. 예시 1의 `stance()`에서 `step`을 0.5, 0.7, 0.9 m로 바꿔 COM 높이 변화와 step 시간을 표로 만듭니다. "보폭이 커지면 COM이 더 많이 오르내린다"가 six determinants 관점에서는 왜 나쁜 일이고, 역진자 관점에서는 무엇을 뜻하는지 한 문단씩 씁니다.
3. 예시 2에 **pre-emptive push-off**를 흉내 내 봅니다. 충돌 직전에 뒷다리 방향으로 속도의 일부를 미리 더해 손실을 줄이는 코드를 짜기보다, 우선 말로 설계합니다: push-off가 COM 속도 방향을 얼마나 미리 꺾어 주면 남은 꺾임각이 2α에서 α로 줄어드는가? 그때 손실 비율(1 − cos²)은 얼마가 되는가? (힌트: 각이 절반이면 손실 비율은 대략 1/4.)
4. 예시 3에 `matplotlib`으로 시간당 비용과 거리당 비용을 속도에 대해 그리고, 1.33 m/s를 표시합니다. gaitpdb의 PD군 평소 속도 평균은 약 1.03 m/s, 대조군은 약 1.24 m/s입니다(Day I7에서 직접 확인). 두 속도를 그림에 점으로 찍고, "느린 속도가 거리당 비용을 얼마나 늘리는가"를 경험식으로 어림하되, 이 식이 PD 환자에게 그대로 맞는다고 주장하지 않습니다.
5. 노트북 마지막에 "역진자 모델이 설명하는 것 / 설명하지 못하는 것" 표를 만듭니다(예: PE–KE 교환 ○, COM 높이 변화의 크기 ✗, 에너지 비용의 원인 ✗ → 충돌 모델 필요).

> ⚠️ **흔한 오류 1:** 역진자의 꼭대기(θ = 0)를 가장 빠른 점으로 착각해 시작 속도를 거꾸로 계산하는 실수입니다. 역진자는 꼭대기에서 가장 **느립니다**. 부호를 틀리면 몸이 꼭대기를 넘지 못하고 뒤로 넘어가거나(`sqrt`에 음수), 3초 내내 넘어지는 이상한 결과가 나옵니다.
>
> ⚠️ **흔한 오류 2:** "환자는 에너지를 더 많이 쓴다"를 시간당 비용으로 읽는 실수입니다. Perry가 정리한 전형은 시간당 rate는 거의 정상이고 거리당 cost가 큰 경우입니다. 논문의 단위가 mL/kg·min인지 mL/kg·m인지 먼저 확인합니다.

## 퀴즈

**1.** 역진자 stance에서 몸이 가장 높은 순간의 속력은 최대인가 최소인가? 그 이유는?

<details><summary>정답 보기</summary>

최소입니다. 총에너지가 일정한 보존계에서 위치에너지가 최대일 때 운동에너지는 최소가 됩니다. 걷기에서 MSt 무렵 몸이 가장 높고 가장 느린 이유입니다.

</details>

**2.** 이상적인 역진자만으로 걷기의 에너지 비용을 설명할 수 없는 이유와, Kuo & Donelan이 더한 요소는?

<details><summary>정답 보기</summary>

이상적인 역진자는 보존계라 일이 필요 없다는 결론이 나오기 때문입니다. Kuo & Donelan은 heel strike 충돌과 그것을 메우는 push-off, 즉 step-to-step transition을 더해 에너지가 어디서 새는지 설명합니다. 편한 속도에서 순 비용의 약 2/3가 여기서 나온다고 봅니다.

</details>

**3.** 걸음 빈도를 고정하고 보폭을 두 배로 늘리면, 단순 충돌 모델에서 step당 충돌 손실은 대략 몇 배가 되는가?

<details><summary>정답 보기</summary>

약 16배(2⁴). 손실 비율이 다리 사이 각의 제곱에, 속도의 제곱이 보폭의 제곱에 비례하므로 합쳐서 보폭의 약 4제곱입니다(예시 2에서 손실 ÷ step⁴이 거의 일정).

</details>

**4.** six determinants 이론과 역진자 관점이 정면으로 부딪치는 지점은?

<details><summary>정답 보기</summary>

six determinants는 COM의 오르내림을 **줄여야** 에너지를 아낀다고 보지만, 역진자 관점에서는 COM이 오르내려야 PE와 KE의 교환이 일어납니다. 실험에서는 COM을 일부러 평평하게 하면 에너지가 오히려 늘었습니다(Kuo & Donelan). Whittle과 Perry도 이 이론의 에너지 절약 효과에 대한 반론을 함께 소개합니다.

</details>

**5.** 편마비 환자가 정상보다 느린 속도로 걷는데 시간당 산소 소비량은 정상과 비슷했다. 거리당 비용은 어떻게 되었겠는가?

<details><summary>정답 보기</summary>

커졌습니다. cost = rate ÷ 속도이므로, rate가 같고 속도가 느리면 거리당 cost가 늘어납니다. Perry 24장은 환자가 속도를 줄여 rate를 정상 범위로 지키고 그 대가로 cost가 커진다고 정리합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3을 실행하고 출력이 레슨과 같다.
- [ ] `figures/advanced/I/I6_pe_ke.png`를 저장했다.
- [ ] 보폭을 바꾼 표와 두 관점(six determinants vs 역진자) 문단을 썼다.
- [ ] 시간당·거리당 비용 그림에 PD·대조군 평균 속도를 표시하고, 경험식의 한계를 한 줄로 적었다.
- [ ] "역진자 모델이 설명하는 것 / 못 하는 것" 표를 만들었다.

## 더 읽을거리
- Kuo AD, Donelan JM. Dynamic principles of gait and their clinical implications. *Phys Ther*. 2010;90(2):157–174. [doi:10.2522/ptj.20090125](https://doi.org/10.2522/ptj.20090125) (필수, PMC 무료 전문)
- [Wi] Thomas, Zeni & Winter, 5th ed., 2023 — 6.0.3절(pp.116–117), 6.2–6.3절(pp.128–136), 5.2.6절 역진자(pp.108–110), 11.3절 보행 중 동적 균형(pp.241–245).
- [W] Richards & Levine, eds., 6th ed., 2023 — 2장 Energy Consumption, The Six Determinants of Gait(pp.36–41).
- [P] Perry & Burnfield, 2nd ed., 2010 — 3장 Energy Conservation(Center of Gravity Alignment Modulation), 24장 Energy Expenditure(개관).
- [RM] Robertson et al., 2nd ed., 2014 — 6장 Energy, Work, and Power(pp.131–149, 선택), 10장 Computer Simulation of Human Movement(pp.233–246), 부록 F·G(이중 진자와 수치 적분; 부록 F의 식에는 부호 오류가 있으니 식을 그대로 옮기지 말 것).
- [BMC] `ip_model`(서 있기의 역진자): <https://bmclab.github.io/BMC/notebooks_html/ip_model.html>
- 이론 노트: [T05 — 에너지와 동역학적 보행](../I-gait-theory/note-T05.md)

---
[← 이전](day-I5.md) · [코스 지도](../../../README.md) · [다음 →](day-I7.md)
