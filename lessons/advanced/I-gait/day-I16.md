# Day I16 — 신경계 질환의 보행: 뇌졸중, 뇌성마비, 파킨슨병을 같은 변수로 비교하기

> **주차:** 심화 파트 I — 보행분석 (3주차) · **예상 시간:** 90분 · **산출물:** `reports/advanced/I/I16_disease_table.md` (질환별 특징 보행 변수 비교표), `notebooks/advanced/I/I16_asymmetry.ipynb` (stance 시간 비대칭 지수)
>
> **먼저 끝내 둘 레슨:** [Day I13](day-I13.md)(시공간 변수·변동성), [Day I15](day-I15.md)(다섯 기전, 강제와 보상), [Day 24](../../week-4/day-24.md)(PhysioNet gaitpdb)
>
> **이론 노트:** [T10 — 병적 보행의 원리와 임상 지표](../I-gait-theory/note-T10.md)

## 오늘의 목표
- 뇌졸중, 뇌성마비(CP), 파킨슨병(PD)의 보행 특징을 시공간·운동학·운동역학 변수로 나눠 비교표를 만들 수 있다.
- PD 보행 이상을 지속형(continuous)과 삽화형(episodic: FOG·festination)으로 나누고, 이 구분의 출처를 정확히 말할 수 있다.
- 가상 편마비 자료로 stance 시간 비대칭 지수(SI)와 비율(ratio)을 계산하고, 방향을 가정하지 않고 해석할 수 있다.

## 🎬 영상으로 먼저 보기

- [Gait impairments in Parkinson's disease — The Lancet](https://www.youtube.com/watch?v=pFLC9C-xH8E) (2:27)
- **무엇에 주목할까:** 학술지 채널의 짧은 시연 영상입니다. 보폭, 팔 흔들기, 회전 장면을 따로 보세요. "느리다"는 한 단어 안에 보폭 감소, 팔 흔들기 감소, 통째로 도는 회전(en bloc) 같은 서로 다른 변수가 들어 있습니다.

- [Hemiparetic Gait Example | Extensor Tone — Mission Gait](https://www.youtube.com/watch?v=ihz74Zv6D84) (2:44)
- **무엇에 주목할까:** 환측 다리의 swing에서 무릎이 덜 굽는지, 골반을 들어 올리거나 다리를 바깥으로 돌리는지 보세요. Day I15의 이름(hip hiking, circumduction)으로 불러 보고, 그것이 강제인지 보상인지 판정해 봅니다.

## 개념 설명

### 같은 "느린 보행", 서로 다른 뿌리

세 질환 모두 보행 속도가 느려지지만, 느려지는 이유가 다릅니다. 뇌졸중과 CP는 상위운동신경원 손상이라 Perry가 말한 **운동 조절 장애**의 네 결손(약화, 선택적 조절 상실, 원시 패턴, 경직)이 섞입니다([P] 10장). PD는 기저핵 질환이라 이 틀에 잘 맞지 않습니다. 실제로 **Perry 교재에는 파킨슨병이 다뤄지지 않습니다**. 그래서 오늘 PD 부분은 [W] 6장과 논문(Mirelman 2019, Peterson & Horak 2016)에 기댑니다. 또 Perry 15장은 뇌졸중·CP에 대해 시공간·운동학·EMG 자료를 주지만 모멘트·파워 같은 운동역학 자료는 주지 않으므로, 운동역학 칸은 [W] 6장에서 채웁니다.

Whittle 6판 6장은 네 질환(CP, 뇌졸중, PD, 근이영양증)을 각각 다른 저자가 씁니다([W] 6장 pp.98–117). 장의 목적은 보행분석으로 **중증도·진행·치료 효과**를 판단하는 예를 보여 주는 것입니다. 비교표를 만들 때도 같은 질문을 던지세요: 이 변수는 중증도를 가르는가, 시간에 따라 변하는가, 치료에 반응하는가?

### 뇌졸중: 느리고 비대칭, 그리고 추진력

뇌졸중 보행은 전형적으로 느리고 비대칭이며 사람마다 차이가 큽니다. 공통 언어가 필요해 **10 m 보행 검사(10MWT, 속도)** 와 **6분 보행 검사(6MWT, 거리)** 가 기본 측정으로 쓰입니다([W] 6장 pp.107–108). 흔히 double support와 **건측 stance 시간이 늘고 환측 step length가 짧아지지만**, 추진력 부족의 방향에 따라 반대 양상도 있으므로 방향은 계산해서 확인합니다. 운동역학 지표로는 **환측 추진 비율(paretic propulsion)** 이 좋은 예입니다. 전후 방향 지면반력에서 환측이 낸 추진의 비율로, 대칭이면 50%인데 중증일수록 낮아집니다([W] 6장 pp.109–110). 지역사회에서 안전하게 걷는 데 필요한 속도는 대략 1.1–1.5 m/s로 소개됩니다([W] 6장 p.110).

Perry 15장은 입원 재활 중인 뇌졸중 환자를 군집 분석으로 네 군으로 나눈 연구를 소개합니다. 군을 가르는 변수는 **보행 속도, mid-swing의 발목 배측굴곡, mid-stance의 무릎 굴곡** 세 가지였고, 네 대표 환자 모두에서 공통적으로 terminal stance의 heel rise가 사라져 있었습니다. Perry는 겉으로 보이는 무릎 문제의 뿌리를 **저측굴곡근(특히 soleus)의 활성 부족**으로 해석합니다([P] 15장 Impaired Control의 Stroke 절). 겉모습(무릎)과 기전(발목)이 다른 자리에 있는 좋은 예입니다.

"stiff knee gait"라는 제목은 Perry 15장에서 **척수손상 사례에만** 붙어 있고, 그 사례의 원인은 대퇴직근이 아니라 vastii의 지속 활동이었습니다. swing 무릎 굴곡이 줄어드는 기전(대퇴사두근 각 갈래의 과활동 패턴, 햄스트링 조기 활동)은 [P] 12장 Limited Knee Flexion 부분에 자세히 있으며 갈래 구분은 fine-wire EMG로만 가능하다고 합니다. "stiff knee = 대퇴직근 과활동"이라는 통념을 그대로 쓰지 않도록 주의합니다.

### 뇌성마비: 손상은 그대로, 걸음은 자란다

CP의 뇌 손상은 진행하지 않지만, 아이가 자라면서 근골격계 양상은 계속 변합니다([W] 6장 p.98). Whittle은 손상을 네 범주로 정리합니다: **경직**(속도 의존적 신장 반사 증가, 신경계의 성질), **근 구축**(근–건의 수동 길이 감소, 소아기에 발달), **약화**, **뼈 정렬 이상**(예: 줄어들지 않고 남은 대퇴 전경)([W] 6장 pp.100–102). 기능 수준은 GMFCS 5단계로 표현합니다. 양지마비의 시상면 패턴은 발목 첨족부터 무릎·고관절 과굴곡(crouch)까지 네 군으로 나누는 분류가 널리 쓰이지만, 군 안의 변이가 크고 자연 군집이 뚜렷하지 않아 대략의 길잡이로 봐야 한다는 비판도 함께 소개됩니다([W] 6장 p.100). Perry는 소아 보행을 16장에서 따로 다루며, 경직성 양지마비에서 가장 흔한 무릎 패턴으로 **jump gait**(stance의 고관절·무릎 굴곡 증가 + 첨족)를 꼽습니다([P] 16장).

### 파킨슨병: 지속형과 삽화형

PD 보행의 표지는 **stride length가 크게 줄면서 cadence는 대개 정상에 가깝다**는 점입니다(Murray 등 1978의 고전 연구, [W] 6장 p.112). 팔 흔들기 감소, 몸통이 골반과 같은 방향으로 도는 회전, 구부정하고 끄는 걸음이 더해집니다. levodopa는 속도와 stride length를 늘리지만 cadence는 크게 바꾸지 않습니다([W] 6장 p.112). Mirelman 2019는 병기별로 정리합니다. 초기에는 팔 흔들기 감소와 좌우 비대칭이 PD에 더 특이적이고, 중등도에서는 끄는 걸음·double support 증가·en bloc 회전·보행 시작 문제가 나타나며 FOG와 festination이 생길 수 있습니다. 중등도 단계에서는 증상이 양측으로 퍼지며 비대칭이 오히려 줄 수도 있습니다.

PD 보행 이상을 **지속형(continuous)** 과 **삽화형(episodic)** 으로 나누는 틀은 Mirelman 2019에서 나온 것이 **아닙니다**. 이 구분을 명시한 것은 Peterson & Horak 2016이며, 이들은 원 출처로 Giladi, Horak & Hausdorff 2013을 인용합니다. Peterson & Horak은 지속형 이상을 **느림**, **변동성·비대칭**, **자세 조절 저하** 세 묶음으로 정리하고, 상황에 따라 나타나는 festination과 FOG를 삽화형(이들의 표현으로는 transient)으로 둡니다. 두 묶음은 약물 반응도 다릅니다. 보폭 감소는 levodopa에 잘 반응하지만 변동성은 levodopa 저항성이라는 정리가 있습니다(Peterson & Horak 2016). 그래서 평균 stride length와 stride time CV는 같은 "PD 지표"가 아니라 서로 다른 기전을 보는 변수입니다. 근이영양증(DMD)은 [W] 6장 pp.114–117에서 대퇴사두근 부전을 골반 전방 경사·첨족으로 버티는 "힘선으로 서기"의 예로 읽어 두면 Day I15와 이어집니다.

## 예시로 이해하기

### 예시 1 — stance 시간 비대칭 지수: 방향을 가정하지 말 것

비대칭을 숫자 하나로 요약하는 방법은 여럿입니다. 흔히 쓰는 두 가지를 비교합니다. **SI(symmetry index)** = (a − b) / (0.5(a + b)) × 100은 부호에 어느 쪽이 긴지가 담기고, **ratio** = 큰 값/작은 값은 방향 정보를 버립니다. 아래 자료는 코드 안에서 만든 **가상 자료**입니다.

```python
import numpy as np
rng = np.random.default_rng(16)

def stance_times(mean, sd, n=30):
    return rng.normal(mean, sd, n)

# 가상 편마비 보행 30 stride: 환측(paretic) stance가 짧고, 건측(non-paretic) stance가 길다고 가정
paretic = stance_times(0.68, 0.04)
nonparetic = stance_times(0.86, 0.03)
control_L, control_R = stance_times(0.66, 0.02), stance_times(0.66, 0.02)

def symmetry_index(a, b):
    """SI = (a − b) / (0.5 (a + b)) × 100. 0이면 대칭, 부호는 어느 쪽이 긴지."""
    return 100 * (a - b) / (0.5 * (a + b))

def ratio(a, b):
    """큰 값 / 작은 값. 1이면 대칭(방향 정보는 버린다)."""
    return max(a, b) / min(a, b)

for name, a, b in [("가상 편마비 (환측, 건측)", paretic, nonparetic), ("가상 대조 (왼, 오른)", control_L, control_R)]:
    ma, mb = a.mean(), b.mean()
    si_stride = symmetry_index(a, b)                    # stride마다 계산한 SI
    print(f"{name}: stance 평균 {ma:.3f} s vs {mb:.3f} s | SI(평균으로) {symmetry_index(ma, mb):6.1f}% | "
          f"ratio {ratio(ma, mb):.2f} | stride별 SI 평균 {si_stride.mean():6.1f}%, SD {si_stride.std(ddof=1):.1f}% | "
          f"CV {100 * a.std(ddof=1) / ma:.1f}% / {100 * b.std(ddof=1) / mb:.1f}%")
```

실행 결과:

```text
가상 편마비 (환측, 건측): stance 평균 0.679 s vs 0.866 s | SI(평균으로)  -24.1% | ratio 1.27 | stride별 SI 평균  -24.2%, SD 6.8% | CV 5.5% / 3.2%
가상 대조 (왼, 오른): stance 평균 0.665 s vs 0.658 s | SI(평균으로)    1.0% | ratio 1.01 | stride별 SI 평균    1.0%, SD 4.2% | CV 3.3% / 3.3%
```

읽는 법: SI −24%는 "환측 stance가 건측보다 평균의 약 24%만큼 짧다"는 뜻입니다. ratio 1.27은 같은 정보를 방향 없이 줍니다. 마지막 열의 CV는 **비대칭과 다른 것**, 즉 한쪽 다리 안에서 stride마다 얼마나 흔들리는지(변동성)입니다. Whittle도 리듬 이상을 좌우 타이밍이 다른 **비대칭형**과 stride마다 타이밍이 변하는 **불규칙형**으로 나눕니다([W] 3장 pp.58–59). 보고서에는 SI 정의식(분모가 평균인지, 어느 쪽을 a로 놓았는지)을 반드시 적습니다. 정의가 다르면 같은 자료에서 다른 숫자가 나옵니다.

### 예시 2 — 비교표의 뼈대

| 변수 묶음 | 뇌졸중 | 뇌성마비(경직성 양지마비 중심) | 파킨슨병 |
|---|---|---|---|
| 시공간 | 느림, 비대칭(건측 stance↑, 환측 step 짧은 경우가 흔함), 10MWT·6MWT | GMFCS에 따라 다양, 성장에 따라 변함 | stride length↓, cadence는 대개 정상, 변동성↑, double support↑(중등도) |
| 운동학 | swing 무릎 굴곡 감소, stance 고관절 신전 감소, 첨족·foot drop, 보상(hip hiking, circumduction, 건측 vaulting) | 첨족 → jump → crouch 스펙트럼, 대퇴 전경에 따른 회전 이상 | 관절 가동범위(특히 신전) 감소, 팔 흔들기↓, en bloc 회전, 구부정한 자세 |
| 운동역학 | 환측 추진 비율↓, 환측 하중 지연·조기 탈부하 | (오늘 범위 밖, [W] 6장 해석 4단계 참고) | (오늘 범위 밖, 발목 저측굴곡 토크 감소 보고: Peterson & Horak 2016) |
| 삽화형 | — | — | FOG, festination |
| 출처 | [W] 6장 pp.107–110, [P] 15장 | [W] 6장 pp.98–106, [P] 16장 | [W] 6장 pp.111–114, Mirelman 2019, Peterson & Horak 2016 |

칸마다 "어느 책의 몇 쪽"을 붙이는 것이 핵심입니다. 출처가 없는 칸은 기억에서 나온 일반화일 가능성이 큽니다.

### 예시 3 — 이름은 같아도 원인이 다르다: stiff knee

| 사례(책) | swing 무릎 굴곡이 줄어든 이유 |
|---|---|
| 척수손상 사례([P] 15장, 이 장에서 "stiff knee gait"라는 제목이 붙은 유일한 절) | vastii의 연속 활동(대퇴직근은 거의 활동 없음) |
| 경직성 CP의 반장슬 사례([P] 15장) | mid-swing의 대퇴직근 + 이른 햄스트링 활동 |
| 소아 보행의 무릎 패턴([P] 16장) | 대퇴사두근 어느 갈래든 과활동, 드물게 PSw 햄스트링 과활동 |

같은 이름이 서로 다른 근육 문제를 가립니다. 비교표의 "운동학" 칸에 stiff knee라고 적었다면, 기전은 EMG 없이 단정하지 않는다는 단서를 함께 답니다.

## 직접 해보기

1. `reports/advanced/I/I16_disease_table.md`에 예시 2의 표를 바탕으로 뇌졸중·CP·PD 세 질환(선택으로 DMD)의 비교표를 만듭니다. 열마다 출처(책·장·쪽 또는 논문)를 붙입니다.
2. PD 칸 아래에 "지속형 / 삽화형" 두 줄을 따로 두고, 이 구분의 출처로 **Peterson & Horak 2016(원 출처 Giladi, Horak & Hausdorff 2013)** 을 적습니다. Mirelman 2019는 병기별 특징의 출처로 씁니다.
3. `notebooks/advanced/I/I16_asymmetry.ipynb`에서 예시 1을 실행하고 두 가지를 바꿔 봅니다: (a) 환측 stance가 건측보다 **긴** 가상 환자를 만들어 SI 부호가 어떻게 바뀌는지, (b) SI 분모를 평균 대신 큰 값으로 바꾸면 숫자가 얼마나 달라지는지.
4. (선택) [Day 24](../../week-4/day-24.md)의 gaitpdb에서 PD 한 명과 대조군 한 명의 좌·우발 총 힘(18·19열)으로 stance 시간을 구해 SI를 계산합니다(heel strike 검출은 [Day I12](day-I12.md)). 두 사람만으로 군 차이를 말하지 않습니다.
5. 비교표 아래에 "이 표로 말할 수 없는 것" 세 줄을 씁니다(예: 중증도·약물 상태가 섞인 문헌 요약이라 같은 조건의 비교가 아님).

⚠️ **흔한 오류 1 — "환측 step이 짧다"를 규칙처럼 쓰기.** step length는 반대쪽 다리의 지지 능력과 추진력에도 좌우됩니다. 방향을 가정하지 말고 계산해서 확인합니다.

⚠️ **흔한 오류 2 — PD 근거를 Perry에서 찾기.** Perry 교재에는 PD가 없습니다. 출처 칸에 [P]를 PD 근거로 적었다면 다시 확인하세요.

## 퀴즈

**1.** PD 보행의 시공간적 표지로 가장 맞는 것은?
(a) cadence가 크게 줄고 stride length는 정상 (b) stride length가 크게 줄고 cadence는 대개 정상 (c) 둘 다 정상, 변동성만 증가 (d) step width만 감소

<details><summary>정답 보기</summary>

**(b)**. 속도 저하가 주로 보폭 감소에서 온다는 것이 고전적 소견입니다([W] 6장 p.112). levodopa도 cadence보다 stride length를 늘리는 쪽으로 속도를 올립니다.

</details>

**2.** PD 보행 이상의 지속형/삽화형 구분을 인용할 때 맞는 출처는? (단답)

<details><summary>정답 보기</summary>

**Peterson & Horak 2016**(원 출처 Giladi, Horak & Hausdorff, *Mov Disord* 2013;28:1469–1473). Mirelman 2019는 병기별 특징을 정리하지만 이 이분법을 제시하지 않습니다.

</details>

**3.** 같은 자료에서 SI = −24%, ratio = 1.27이 나왔습니다. 두 숫자의 차이를 한 문장으로 설명하세요.

<details><summary>정답 보기</summary>

SI는 부호로 **어느 쪽이 긴지** 알려 주고(여기서는 a로 둔 환측이 짧음), ratio는 방향 없이 **얼마나 다른지**만 알려 줍니다. 어느 지표든 정의식과 a·b를 무엇으로 두었는지 보고서에 적어야 합니다.

</details>

**4.** Perry 15장의 뇌졸중 군집 분석에서 군을 가른 세 변수는 무엇입니까?

<details><summary>정답 보기</summary>

**보행 속도, mid-swing 발목 배측굴곡, mid-stance 무릎 굴곡**입니다. 네 대표 환자 모두 terminal stance의 heel rise가 없었고, Perry는 무릎 이상의 뿌리를 저측굴곡근 활성 부족으로 해석합니다.

</details>

**5.** "stiff knee gait = 대퇴직근 과활동"이라고 써도 됩니까?

<details><summary>정답 보기</summary>

**아니요.** Perry 15장에서 "stiff knee gait" 제목이 붙은 척수손상 사례의 원인은 vastii의 연속 활동이었고, 다른 사례들은 대퇴직근, 햄스트링, toe rocker 부족 등 원인이 제각각이었습니다. 갈래 구분은 fine-wire EMG로만 가능하다고 합니다([P] 12장).

</details>

## 오늘의 산출물 체크리스트
- [ ] `reports/advanced/I/I16_disease_table.md`: 세 질환 × 시공간·운동학·운동역학·삽화형, 칸마다 출처.
- [ ] PD 지속형/삽화형 구분의 출처를 Peterson & Horak 2016(원 출처 Giladi 2013)으로 적었다.
- [ ] `notebooks/advanced/I/I16_asymmetry.ipynb`: 예시 1 실행, SI 부호 바꾸기와 분모 바꾸기 실험.
- [ ] "이 표로 말할 수 없는 것" 세 줄.

## 더 읽을거리
- [W] Richards J, Levine D, eds. *Whittle's Gait Analysis*. 6th ed. Elsevier; 2023. 6장 Gait Assessment of Neurological Disorders, pp.98–117(CP pp.98–106, 뇌졸중 pp.107–111, PD pp.111–114, 근이영양증 pp.114–117).
- [P] Perry J, Burnfield JM. *Gait Analysis*. 2nd ed. SLACK; 2010. 15장 Impaired Control 절(뇌졸중, 편마비 swing 내반, 경직성 CP, 척수손상 stiff knee), 12장 Limited Knee Flexion 부분, 16장 Pediatric Gait Analysis.
- Mirelman A, Bonato P, Camicioli R, et al. Gait impairments in Parkinson's disease. *Lancet Neurol*. 2019;18(7):697–708. doi:[10.1016/S1474-4422(19)30044-4](https://doi.org/10.1016/S1474-4422(19)30044-4)
- Peterson DS, Horak FB. Neural control of walking in people with parkinsonism. *Physiology (Bethesda)*. 2016;31(2):95–107. doi:[10.1152/physiol.00034.2015](https://doi.org/10.1152/physiol.00034.2015)
- Giladi N, Horak FB, Hausdorff JM. Classification of gait disturbances: distinguishing between continuous and episodic changes. *Mov Disord*. 2013;28(11):1469–1473. doi:[10.1002/mds.25672](https://doi.org/10.1002/mds.25672) (서지만 확인, 본문은 이 레슨 작성 시 읽지 않음)
- 이론 노트: [T10 — 병적 보행의 원리와 임상 지표](../I-gait-theory/note-T10.md)

---
[← 이전](day-I15.md) · [코스 지도](../../../README.md) · [다음 →](day-I17.md)
