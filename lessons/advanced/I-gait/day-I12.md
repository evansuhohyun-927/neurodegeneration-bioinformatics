# Day I12 — gait event 검출: 문턱 하나에도 규칙이 필요하다

> **주차:** 심화 파트 I — 보행분석 (2주차) · **예상 시간:** 90분 · **산출물:** `notebooks/advanced/I/I12_events.ipynb`, `reports/advanced/I/I12_event_rules.md`, `notebooks/advanced/I/gait_events.py`
>
> **먼저 끝내 둘 레슨:** [Day I1](day-I1.md)(IC·toe off·stance·swing), [Day I11](day-I11.md)(stride 자르기), [Day 26 — 기본 feature 추출](../../week-4/day-26.md)(20 N 문턱으로 heel strike 찾기)
>
> **이론 노트:** [T08 — 측정 원리와 오차](../I-gait-theory/note-T08.md)(사건 검출의 측정학, 기준 방법), [T09 — 신호처리의 이론](../I-gait-theory/note-T09.md)(필터가 사건 시각을 옮기는 원리)

## 오늘의 목표
- 힘 문턱으로 initial contact(IC)와 toe off(TO)를 검출하고, stride·stance·swing time을 계산할 수 있다.
- 첫·마지막 stride, 비정상적으로 긴 stride, 문턱 근처의 깜박임을 처리하는 **규칙**을 미리 정해 문서로 남길 수 있다.
- 문턱을 바꾸면 사건 시각이 체계적으로 움직인다는 것을 민감도 표로 보이고, 다른 방법(운동학·자이로)과 비교할 때 timing error와 Bland–Altman을 쓰는 이유를 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [Biomechanics of Movement | Lecture 2.2: The Walking Gait Cycle and Ground Reaction Forces — Biomechanics of Movement](https://www.youtube.com/watch?v=LAOS8I6dFy4) (13:04)
- **무엇에 주목할까:** 발이 닿는 순간 수직 지면반력이 0에서 솟아오르고, 발을 떼는 순간 0으로 돌아가는 모습을 보세요. 오늘의 문턱 방법은 이 "0에서 벗어나는 순간"을 잡는 일입니다. 그런데 "0"은 정확히 어디일까요?

## 개념 설명

### 모든 시간 변수는 사건에서 시작한다

stride time, stance time, swing time, double support, cadence는 모두 **사건(gait event)** 의 시각에서 계산됩니다. 사건 하나가 20 ms 늦게 찍히면 stance time은 20 ms 짧아지고, 그 값으로 만든 CV·비대칭 지수([Day I13](day-I13.md))도 함께 흔들립니다. 그래서 사건 검출은 "전처리의 한 줄"이 아니라 **측정 방법 그 자체**입니다.

힘을 재는 장비가 있다면 가장 단순한 방법은 **문턱(threshold)** 입니다. 수직력이 문턱을 넘어서는 순간을 IC, 다시 내려오는 순간을 TO로 봅니다. 힘판에서는 흔히 20 N을 씁니다. 0으로 두지 않는 이유는 신호 잡음과, 유각기에 발이 바닥을 스치는 일 때문입니다([Wi] 7.2.2 p.152). 힘판이라면 한 발 전체가 판 하나에만 닿아야 한다는 조건도 붙습니다. gaitpdb는 신발 속 깔창 센서의 합계라서 걸음마다 연속으로 잴 수 있지만, 그만큼 **판정 규칙을 우리가 정해야 합니다.**

### 문턱이 사건 시각을 옮긴다

문턱이 높을수록 힘이 그 높이까지 올라오는 데 시간이 걸리므로 **IC는 늦게**, 힘이 그 높이 아래로 떨어지는 순간이 빨라지므로 **TO는 이르게** 찍힙니다. 결과적으로 stance는 짧아지고 swing은 길어집니다. Perry 교재는 깔창형 footswitch가 신발 압력으로 잘못 켜지지 않도록 감도를 높게 잡기 때문에, 힘판보다 stance 시작을 평균 약 2% GC 늦게, 끝을 그만큼 일찍 잡으며 분석 프로그램이 그만큼 보정한다고 설명합니다([P] 23장). 오늘 예시 2의 민감도 표가 같은 현상을 숫자로 보여 줍니다.

필터도 사건 시각을 옮길 수 있습니다. 한 방향 필터는 신호 전체를 늦추고([Day C2](../C-neural-signals/day-C2.md)), 앞뒤 Butterworth도 급격한 변화 앞뒤에 작은 undershoot·overshoot를 만들어 문턱 교차 시각을 앞당겨 보이게 할 수 있습니다([RM] 12장 p.289). 사건을 찾을 신호에는 필터를 걸지 않거나, 걸었다면 그 사실을 적습니다.

### 규칙은 결과를 보기 전에 정한다

실제 기록에는 교과서 그림에 없는 일들이 있습니다. 오늘 쓰는 규칙과 그 근거입니다.

| 규칙 | 무엇을 막나 | 근거 |
|---|---|---|
| ① 앞뒤 2 stride 제외 | 걷기 시작의 가속, 끝의 감속 | 검사 구간 앞뒤에 가감속 구간을 두는 관행([P] 23장) |
| ② stride time이 중앙값에서 크게 벗어나면 제외(중앙값 ± 5 × MAD×1.4826) | 회전, 멈춤, 검출 실패 | 긴 간격 하나가 SD·CV를 크게 부풀린다([Day 26](../../week-4/day-26.md)) |
| ③ 0.1 s보다 짧은 "유각"은 접지로, 0.2 s보다 짧은 "접지"는 유각으로 본다 | 문턱 근처에서 신호가 깜박이는 것 | 이 레슨의 선택(사람의 정상 swing·stance는 이보다 훨씬 길다) |
| ④ 한 stride 안에 TO가 정확히 하나일 때만 사용 | 판정이 꼬인 stride | 이 레슨의 선택 |

**MAD**(median absolute deviation, 중앙값 절대 편차)는 SD 대신 쓰는 흩어짐 지표로, 이상값 몇 개에 흔들리지 않습니다. 1.4826을 곱하면 정규분포에서 SD와 같은 척도가 됩니다.

③과 ④의 숫자는 제가 고른 값입니다. 정답이 아니라 **"미리 정하고, 적고, 바꿔 보았을 때 결과가 얼마나 움직이는지 확인하는 것"** 이 핵심입니다. 군 비교 결과를 보고 규칙을 고치면, Day 28에서 본 p-hacking의 입구가 됩니다. gaitpdb 기록에 회전 구간이 있었는지는 데이터 문서로 확인할 수 없으므로, 규칙 ②로 걸러진 stride의 **원인은 "확인 안 됨"** 으로 둡니다. 측정 프로토콜에서도 같은 원리가 나옵니다. 첫 시행은 낯설어서 느리고 이후 시행과 차이가 크므로 기록하지 않는 연습 시행을 먼저 하라는 권고가 있습니다([P] 23장).

### 힘이 없을 때: 운동학과 자이로로 찾기

힘판이나 깔창이 없으면 다른 신호에서 사건을 추정합니다.

- **마커 좌표 기반:** 천골 마커에 비해 뒤꿈치 마커가 가장 앞에 있는 순간을 heel contact, 발끝 마커가 가장 뒤에 있는 순간을 toe off로 보는 방법(Zeni 2008), 트레드밀에서는 마커의 앞뒤 **속도**가 부호를 바꾸는 순간을 쓰는 방법이 소개됩니다([Wi] 7.2.2 pp.152–153). 보통 속도의 걷기에서는 잘 맞지만, 달리기나 병적 보행에서는 다시 검증해야 합니다.
- **자이로 기반:** 몸에 붙인 자이로만으로 시공간 변수를 추정하고 PD 환자에게 적용한 ambulatory 시스템이 있습니다. 그 연구는 STN-DBS를 받은 PD 환자 10명과 대조군 10명에서 stride velocity, stride length, stance, double support 같은 변수를 걸음마다 계산했습니다([Salarian 2004](https://doi.org/10.1109/TBME.2004.827933), 이 과정에서는 초록만 확인). 원리를 일반적으로 말하면, 정강이의 시상면 각속도는 유각기 중간에 큰 봉우리를 만들고, 그 앞뒤의 특징점(국소 최솟값 등)을 TO와 IC의 후보로 씁니다. 어떤 특징점을 쓰는지, 축과 부호를 어떻게 정의하는지는 연구마다 다르고([Day I9](day-I9.md) 예시 3의 정렬 문제), **반드시 기준 방법과 비교해 검증**해야 합니다.

### 두 방법을 비교하는 법: timing error와 Bland–Altman

새 방법(예: 자이로)의 사건 시각을 기준 방법(예: 힘 문턱)과 비교할 때는, 같은 사건마다 **timing error = 새 방법 − 기준 방법**(ms)을 구하고 그 평균(체계적 차이, bias)과 SD(무작위 차이)를 봅니다. 두 방법의 사건 시각이나 stance time 사이의 **상관계수**는 일치를 말해 주지 못합니다. 늘 30 ms씩 늦게 찍는 방법도 상관은 거의 1이기 때문입니다. 이 문제를 정면으로 다룬 방법이 [Bland & Altman 1986](https://doi.org/10.1016/S0140-6736(86)90837-8)이고, [Day I14](day-I14.md)에서 직접 그립니다. 기억할 점: **기준 방법도 참값이 아닙니다.** 오늘 만든 20 N 문턱 역시 하나의 측정 방법이며, 그 자체의 선택(문턱 값)이 결과를 바꿉니다.

## 예시로 이해하기

> 실제 공개 데이터: Hausdorff JM. *Gait in Parkinson's Disease* (v1.0.0). PhysioNet; 2008. [doi:10.13026/C24H3N](https://doi.org/10.13026/C24H3N), ODC-By 1.0. `GaCo01_01.txt`(대조군 한 명의 평소 걷기)를 `data/gaitpdb/`에 둡니다. 18·19열 = 왼발·오른발 총 힘(N), 100 Hz.

### 예시 1 — 검출 함수를 모듈로 만들기 (`gait_events.py`)

아래 코드를 `notebooks/advanced/I/gait_events.py`로 저장합니다. Day I13·I14에서 `from gait_events import strides`로 다시 씁니다.

```python
import numpy as np

def contact_mask(force, thr, fs, min_swing=0.1, min_contact=0.2):
    """force > thr 이면 접지(True). 너무 짧은 유각(깜박임)은 접지로 메우고,
    너무 짧은 접지(튀는 값)는 유각으로 돌린다."""
    on = force > thr
    for value, min_len in [(False, min_swing), (True, min_contact)]:
        edges = np.flatnonzero(np.diff(on.astype(int))) + 1
        starts = np.r_[0, edges]
        ends = np.r_[edges, len(on)]
        for s, e in zip(starts, ends):
            if on[s] == value and (e - s) < min_len * fs and s > 0 and e < len(on):
                on[s:e] = not value
    return on

def strides(force, thr, fs, drop_ends=2):
    """stride 표: 열 = [IC 시각(s), stride time, stance time, swing time]"""
    on = contact_mask(force, thr, fs)
    ic = np.flatnonzero(~on[:-1] & on[1:]) + 1      # 공중 → 접지
    to = np.flatnonzero(on[:-1] & ~on[1:]) + 1      # 접지 → 공중
    rows = []
    for a, b in zip(ic[:-1], ic[1:]):
        t_off = to[(to > a) & (to < b)]
        if len(t_off) == 1:                         # stride 안에 TO가 정확히 하나일 때만
            rows.append((a / fs, (b - a) / fs, (t_off[0] - a) / fs, (b - t_off[0]) / fs))
    rows = np.array(rows)[drop_ends:len(rows) - drop_ends]   # 규칙 1: 앞뒤 stride 제외
    med = np.median(rows[:, 1])
    mad = 1.4826 * np.median(np.abs(rows[:, 1] - med))
    ok = np.abs(rows[:, 1] - med) <= 5 * mad                  # 규칙 2: 이상 stride 제외
    return rows, ok
```

`contact_mask`는 접지 여부를 True/False 배열로 만든 뒤, 같은 값이 이어지는 구간(run)마다 길이를 재서 너무 짧은 구간을 반대 값으로 바꿉니다(규칙 ③). 기록의 맨 처음과 맨 끝 구간은 잘린 구간일 수 있어 건드리지 않습니다. `strides`는 IC에서 다음 IC까지를 한 stride로 보고, 그 사이의 TO로 stance와 swing을 나눕니다(규칙 ④). 마지막에 규칙 ①과 ②를 적용합니다. 규칙 ②는 지우지 않고 `ok` 표시만 하므로, 나중에 제외된 stride를 직접 살펴볼 수 있습니다.

### 예시 2 — 실제 기록에 적용하고 문턱 민감도 보기

```python
import numpy as np
from gait_events import contact_mask, strides

fs = 100
d = np.loadtxt("data/gaitpdb/GaCo01_01.txt")
for col, name in [(17, "왼발"), (18, "오른발")]:
    raw = d[:, col] > 20
    n_raw = np.sum(~raw[:-1] & raw[1:])
    on = contact_mask(d[:, col], 20, fs)
    n_clean = np.sum(~on[:-1] & on[1:])
    print(f"{name}: 20 N 문턱 그대로 IC {n_raw}개 → 깜박임 정리 후 {n_clean}개")

left = d[:, 17]
rows, ok = strides(left, 20, fs)
print(f"\n왼발 stride {len(rows)}개(앞뒤 2개씩 제외 후) → 이상 stride 제외 후 {ok.sum()}개")
for r in rows[~ok]:
    print(f"  제외: {r[0]:6.2f} s 시작, stride {r[1]:.2f} s")
r = rows[ok]
print(f"평균 stride {r[:, 1].mean():.3f} s | stance {r[:, 2].mean():.3f} s ({100 * np.mean(r[:, 2] / r[:, 1]):.1f}%) | swing {r[:, 3].mean():.3f} s")

p95 = np.percentile(left, 95)          # 그 발 힘의 95번째 백분위수 ≈ 봉우리 높이
print(f"\n민감도 (기준: 왼발 힘 95번째 백분위수 {p95:.0f} N)")
print("문턱            stride  stride(s)  stance(%)  swing(s)")
for frac in [0.01, 0.025, 0.05, 0.10, 0.20]:
    rows, ok = strides(left, frac * p95, fs)
    r = rows[ok]
    print(f"{100 * frac:4.1f}% ({frac * p95:5.1f} N)   {ok.sum():3d}    {r[:, 1].mean():.3f}     {100 * np.mean(r[:, 2] / r[:, 1]):5.1f}     {r[:, 3].mean():.3f}")
```

실행 결과:

```text
왼발: 20 N 문턱 그대로 IC 96개 → 깜박임 정리 후 95개
오른발: 20 N 문턱 그대로 IC 104개 → 깜박임 정리 후 95개

왼발 stride 90개(앞뒤 2개씩 제외 후) → 이상 stride 제외 후 88개
  제외:  26.59 s 시작, stride 2.50 s
  제외:  77.16 s 시작, stride 2.66 s
평균 stride 1.231 s | stance 0.782 s (63.5%) | swing 0.449 s

민감도 (기준: 왼발 힘 95번째 백분위수 1082 N)
문턱            stride  stride(s)  stance(%)  swing(s)
 1.0% ( 10.8 N)    86    1.230      64.1     0.441
 2.5% ( 27.0 N)    89    1.231      62.8     0.457
 5.0% ( 54.1 N)    89    1.231      61.2     0.478
10.0% (108.2 N)    89    1.231      59.4     0.499
20.0% (216.3 N)    91    1.231      57.7     0.520
```

읽는 법:

- **깜박임(규칙 ③)이 없으면 오른발 IC가 9개 더 나옵니다.** 문턱 바로 근처에서 신호가 오르내리며 "유각 0.01초"짜리 가짜 사건을 만든 것입니다. 깜박임 하나가 stride 하나를 둘로 쪼개면 그 사람의 CV는 크게 부풀려집니다.
- **규칙 ②가 2.50 s, 2.66 s짜리 stride 두 개를 걸러냈습니다.** 평소 stride의 두 배 정도로, 회전이나 잠깐 멈춤일 가능성이 있지만 이 자료만으로는 원인을 확인할 수 없습니다. Day 26에서 본 "최대 2.66초"가 바로 이것입니다.
- **문턱을 올리면 stride time은 그대로인데 stance %는 64.1 → 57.7%로 줄고 swing은 길어집니다.** IC와 다음 IC가 똑같이 늦게 찍히므로 stride time은 거의 변하지 않지만, IC는 늦게·TO는 이르게 찍히는 효과가 stance에 누적됩니다. 문턱 차이가 stance %를 6%p 넘게 바꾼다는 것은, **문턱이 다른 두 연구의 stance %를 직접 비교하면 안 된다**는 뜻입니다.
- 가장 낮은 문턱(1%, 약 11 N)에서는 stride 수가 오히려 줄었습니다. 문턱이 잡음 수준에 가까워져 판정이 꼬인 stride(규칙 ④에 걸림)가 늘었기 때문입니다. 너무 낮아도, 너무 높아도 문제입니다.

문턱을 체중이 아니라 "그 발 힘의 95번째 백분위수 대비"로 정한 이유: 실라부스는 체중 대비 비율을 제안했지만, 깔창 센서 합계가 힘판의 지면반력과 같은 보정인지 데이터 페이지에 없어서(한 대조군의 최댓값이 체중의 약 1.4배였습니다) 체중으로 나눈 값의 의미가 분명하지 않습니다. 이 결정도 규칙 문서에 적습니다.

## 직접 해보기

1. `notebooks/advanced/I/gait_events.py`를 예시 1대로 저장하고, `notebooks/advanced/I/I12_events.ipynb`에서 예시 2를 실행해 출력이 같은지 확인합니다.
2. **그림으로 확인:** 왼발 신호의 20–30초 구간을 그리고, 검출한 IC(초록 점)와 TO(빨간 점)를 표시합니다. 규칙 ②로 제외된 stride의 앞뒤 10초도 따로 그려, 그 시간 동안 오른발 신호가 어땠는지 봅니다(양발 모두 멈췄는지, 한 발만 이상한지). 보이는 것만 적고 원인은 추측하지 않습니다.
3. **오른발과 PD 기록:** 같은 분석을 오른발(19열)과, Day 24에서 받은 PD 기록 하나(예: `GaPt05_01.txt`)에 적용합니다. 규칙 ②와 ③에 걸리는 stride 수를 표로 정리합니다.
4. **규칙 민감도:** `min_swing`을 0.05·0.1·0.2 s로, 규칙 ②의 5를 3으로 바꿔 stride 수와 평균 swing time이 얼마나 바뀌는지 표로 만듭니다.
5. `reports/advanced/I/I12_event_rules.md`를 씁니다. 항목: (a) 쓴 신호와 단위, (b) 문턱과 그 근거, (c) 규칙 ①–④와 각 숫자, (d) 민감도 결과 요약(문턱·규칙을 바꾸면 무엇이 얼마나 변했나), (e) 이 규칙으로 처리하지 못하는 상황(예: heel-first가 아닌 접지, 발을 끄는 걸음, FOG처럼 제자리에서 떠는 동안의 힘 변화).

> ⚠️ **흔한 오류 1:** `np.diff`로 찾은 경계 인덱스에 `+ 1`을 빠뜨리는 것. `diff`의 k번째 값은 k와 k+1 사이의 변화이므로, "접지가 시작된 표본"은 k+1입니다. 하나 차이지만 100 Hz에서 10 ms이고, 다른 방법과 비교할 때 체계적 차이가 됩니다.
>
> ⚠️ **흔한 오류 2:** 규칙 ②로 제외한 stride를 지워 버리고 몇 개를 지웠는지 기록하지 않는 것. 군별로 제외 비율이 다르면 그것 자체가 결과입니다(예: PD군에서 회전·멈춤이 더 많다면). 제외한 수를 참가자별로 저장합니다.

## 퀴즈

**1.** 힘 문턱을 20 N에서 100 N으로 올리면 stance time과 swing time은 각각 어떻게 변하나요? stride time은?

<details><summary>정답 보기</summary>

stance는 **짧아지고** swing은 **길어집니다**(IC는 늦게, TO는 이르게 찍힘). stride time(IC → 다음 IC)은 두 IC가 같은 방향으로 늦어지므로 거의 변하지 않습니다(예시 2에서 1.230–1.231 s).

</details>

**2.** 힘판의 사건 검출 문턱을 0 N이 아니라 20 N 같은 값으로 두는 이유는?

<details><summary>정답 보기</summary>

신호 잡음과, 유각기에 발이 바닥을 스치는 일 때문에 0 근처 값이 오르내리면 가짜 사건이 생기기 때문입니다([Wi] 7.2.2). 오늘 본 깜박임도 같은 문제입니다.

</details>

**3.** 걷기 기록의 첫 두 stride와 마지막 두 stride를 빼는 이유를 한 문장으로.

<details><summary>정답 보기</summary>

걷기 시작의 가속과 끝의 감속 구간은 평소 걸음과 리듬·길이가 달라, 평소 보행의 평균과 변동성을 왜곡하기 때문입니다.

</details>

**4.** 새 자이로 방법의 IC 시각이 힘 문턱 방법과 상관 r = 0.999였다. "두 방법이 일치한다"고 말할 수 있나요?

<details><summary>정답 보기</summary>

**아닙니다.** 늘 30 ms 늦게 찍어도 상관은 거의 1입니다. 사건마다 timing error(새 − 기준)를 구해 평균(bias)과 SD, 그리고 Bland–Altman 일치 한계를 봐야 합니다(Day I14). 또 기준 방법도 참값이 아니라 하나의 측정 방법입니다.

</details>

**5.** 규칙 ②(중앙값 ± 5 × MAD)를 군 비교 결과를 본 뒤 "± 3 × MAD로 바꾸니 차이가 커졌다"며 바꿨다. 무엇이 문제인가요?

<details><summary>정답 보기</summary>

결과를 보고 분석 선택을 바꾸면 우연한 차이를 "발견"하기 쉬워집니다(p-hacking). 규칙은 미리 정해 문서로 남기고, 다른 규칙은 **민감도 분석**으로 함께 보고합니다. 바꾼 버전은 탐색적 결과로 표시합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `gait_events.py`를 저장하고 예시 2의 출력이 같음을 확인했다.
- [ ] IC·TO를 표시한 그림, 제외된 stride 앞뒤 그림을 만들었다.
- [ ] 오른발과 PD 기록 하나에 적용해 규칙별 제외 수를 표로 정리했다.
- [ ] 규칙 숫자를 바꾼 민감도 표를 만들었다.
- [ ] `reports/advanced/I/I12_event_rules.md`에 (a)–(e)를 적었다.

## 더 읽을거리
- Thomas SJ, Zeni JA, Winter DA. *Winter's Biomechanics and Motor Control of Human Movement*. 5th ed. Wiley; 2023 — 7.2.2절 gait event detection(pp.152–153).
- Richards J, Levine D, eds. *Whittle's Gait Analysis*. 6th ed. Elsevier; 2023 — 4장 pp.67–69(시공간 변수, footswitch, 보행 매트).
- Perry J, Burnfield JM. *Gait Analysis: Normal and Pathological Function*. 2nd ed. SLACK; 2010 — 23장 Stride Analysis(footswitch 감도와 2% 보정, 검사 절차).
- Salarian A, Russmann H, Vingerhoets FJG, et al. Gait assessment in Parkinson's disease: toward an ambulatory system for long-term monitoring. *IEEE Trans Biomed Eng*. 2004;51(8):1434–1443. [doi:10.1109/TBME.2004.827933](https://doi.org/10.1109/TBME.2004.827933).
- Bland JM, Altman DG. Statistical methods for assessing agreement between two methods of clinical measurement. *Lancet*. 1986;1(8476):307–310. PMID 2868172. [doi:10.1016/S0140-6736(86)90837-8](https://doi.org/10.1016/S0140-6736(86)90837-8).

---
[← 이전](day-I11.md) · [코스 지도](../../../README.md) · [다음 →](day-I13.md)
