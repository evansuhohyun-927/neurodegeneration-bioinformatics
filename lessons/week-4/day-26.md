# Day 26 — 기본 feature 추출: 신호를 표로 바꾸기

> **주차:** 4주차 · **예상 시간:** 75–90분 · **산출물:** feature table 2개 — `data/physionet_pd/derived/pd_features_records.csv`, `pd_features_participants.csv`

> **기본 경로:** Gait in Parkinson's Disease 데이터로 진행합니다. PADS(스마트워치) 관련 부분은 선택 실습이므로 읽기만 해도 됩니다. ([Day 24](day-24.md)에서 정한 경로)

## 오늘의 목표
- 신호 하나에서 요약 통계 feature(크기, 범위, 주파수)를 계산하는 함수를 만들 수 있다.
- 모든 기록에 함수를 적용해 record-level feature table을 만들고, 이를 participant-level table로 접을 수 있다.
- 보행 데이터라면 stride interval의 평균·SD·CV를 계산할 수 있다.

## 🎬 영상으로 먼저 보기

- [Python Pandas Tutorial (Part 8): Grouping and Aggregating - Analyzing and Exploring Your Data — Corey Schafer](https://www.youtube.com/watch?v=txMdrV1Ut64) (약 49분, 앞 25분 권장)
- **무엇에 주목할까:** `groupby` 뒤에 `.mean()`이나 `.agg()`를 붙이면 "묶음별로 한 줄"이 된다는 점을 보세요. 오늘은 `participant_id`로 묶어서 "기록별 표"를 "사람별 표"로 접는 데 이 도구를 씁니다.

- [Gait impairments in Parkinson's disease — The Lancet](https://www.youtube.com/watch?v=pFLC9C-xH8E) (약 2분)
- **무엇에 주목할까:** 보행 이상이 어떤 모습인지 짧게 보고, "걸음마다 박자가 달라진다"는 것을 숫자로 어떻게 표현할지 떠올려 보세요. 오늘 stride interval의 변동성으로 계산합니다.

## 개념 설명

### feature 추출은 "요약"이고, 요약에는 선택이 들어간다

10초짜리 기록 하나에는 6개 채널 × 약 1,000개 = 6,000개의 숫자가 있습니다. 469명 × 22개 기록이면 수천만 개입니다. 이 숫자들을 그대로 비교할 수는 없으니, 기록 하나를 숫자 몇 개로 **요약**합니다. 이것이 feature 추출입니다.

3주차의 pathway 분석과 닮았습니다. 유전자 수만 개의 발현량을 "염증 pathway 점수" 하나로 요약했던 것처럼, 표본 수천 개를 "움직임의 크기" 하나로 요약합니다. 그리고 그때와 마찬가지로, **어떻게 요약하느냐에 따라 결과가 달라집니다.** 어떤 축을 쓸지, 처음 몇 초를 버릴지, 필터를 걸지, 어느 주파수 범위를 볼지가 모두 분석자의 선택입니다. 선택 자체는 잘못이 아닙니다. **기록하지 않는 것**이 잘못입니다.

처음에는 단순한 feature가 좋습니다. 오늘 쓸 것은 네 가지입니다. ① **표준편차(SD)**: 평균을 뺀 뒤 얼마나 흔들리는가. 움직임의 전반적 크기. ② **범위(range)**: 최댓값 − 최솟값. 큰 튐에 민감합니다. ③ **dominant frequency(가장 강한 주파수)**: 스펙트럼에서 봉우리의 위치. ④ **대역 비율(band fraction)**: 전체 세기 중 특정 주파수 대역(예: 3–8 Hz)이 차지하는 비율. 규칙적인 떨림이 있으면 커집니다.

### 계산 전 점검 4가지를 코드에 넣기

Day 23의 규칙을 다시 적습니다. **feature를 계산하기 전 단위, 시간축, 결측값, artifact를 점검한다.** 오늘은 이것을 말이 아니라 코드로 실행합니다.

- **단위:** 가속도가 g인지 m/s²인지에 따라 숫자가 약 9.8배 달라집니다. 열 이름에 단위를 붙이면(`std_g`) 나중에 헷갈리지 않습니다.
- **시간축:** sampling rate를 상수로 맨 위에 적고(`FS = 100`), 표본 수가 기대와 같은지 확인합니다.
- **결측값:** `NaN`이 하나라도 있으면 표준편차와 스펙트럼이 `nan`이 됩니다. 먼저 세고, 기준을 넘으면 그 기록의 feature를 비워 둡니다.
- **artifact:** 제작자가 알려 준 artifact는 먼저 제거합니다. PADS는 기록 시작 때 시계의 진동 알림 때문에 처음 약 0.5초를 잘라내라고 권고합니다. 중력 때문에 가속도 값이 0이 아닌 곳에 떠 있으므로 평균을 빼는 것도 필요합니다.

오늘 예시의 가상 신호에는 일부러 "처음 0.5초의 튐"을 넣어 두었습니다. 잘라내지 않으면 range가 어떻게 달라지는지 직접 확인해 보세요.

### 두 층의 표: record-level과 participant-level

feature를 계산하면 먼저 **record-level table**이 나옵니다. 한 줄이 "사람 × 과제 × 손목"인 긴 표입니다. 이 표는 그림을 그리거나 문제를 추적할 때 유용하지만, **군 비교에 그대로 쓰면 안 됩니다.** 한 사람이 여러 줄을 차지하기 때문입니다.

그래서 한 번 더 접어 **participant-level table**을 만듭니다. 한 줄이 한 사람이고, 열은 "과제별 feature"입니다. 접는 방법은 여러 가지입니다. 양쪽 손목의 평균을 쓸 수도, 더 크게 움직인 쪽을 쓸 수도, 과제 하나만 고를 수도 있습니다. 어느 것이 옳다는 정답은 없지만 **미리 정해 두어야** 합니다. 결과를 보고 "오른손만 쓰니 차이가 크네"라며 바꾸는 것은 Day 28에서 다룰 p-hacking의 입구입니다.

반복 측정이 독립 표본이 아니라는 점을 여기서 한 번 더 확인하세요. record-level 표의 줄 수가 48이고 participant-level 표의 줄 수가 12라면, 통계 검정의 n은 12입니다.

### 보행을 골랐다면: stride interval과 변동성

보행 데이터의 원자료는 발바닥에 실리는 힘입니다. 발이 땅에 닿으면 힘이 커지고, 떼면 0에 가까워집니다. 힘이 "거의 0"에서 "분명히 0보다 큼"으로 넘어가는 순간이 **heel strike(발 디딤)** 이고, 같은 발의 연속된 두 heel strike 사이 시간이 **stride interval**입니다.

한 번의 걷기에서 stride interval이 수십~백여 개 나옵니다. 여기서 feature는 **평균**(걷는 박자), **SD**(박자의 흔들림), **CV = SD ÷ 평균 × 100%**(평균 대비 흔들림)입니다. PhysioNet 페이지의 설명 예시에서도 이 CV를 변동성 지표로 씁니다.

주의할 점이 있습니다. 걷기 시작과 끝, 방향을 바꾸는 구간은 평소 걸음과 다릅니다. 문턱값 하나로 heel strike를 찾는 단순한 방법은 이런 구간에서 비정상적으로 긴 간격을 만들어 냅니다. 긴 간격 하나가 SD와 CV를 크게 부풀리므로, stride interval의 분포를 먼저 그려 보고 제외 규칙(예: 처음 몇 초 제외, 중앙값에서 크게 벗어난 간격 제외)을 **미리** 정해야 합니다.

## 예시로 이해하기

### 예시 1: 가상 참가자 12명으로 feature table 두 개 만들기

코드가 길지만 네 덩어리입니다. ① 가상 데이터 만들기, ② feature 함수, ③ 모든 기록에 적용, ④ 사람 단위로 접기. **실제 데이터가 아닙니다.** PD군에 떨림을 넣은 것은 코드를 연습하기 위한 설정일 뿐, 실제 군 차이에 대한 주장이 아닙니다.

```python
import numpy as np
import pandas as pd
from scipy import signal as sg

FS = 100            # sampling rate (Hz)
N = 1024            # 기록 하나의 표본 수 (10.24초)
rng = np.random.default_rng(42)

# ---------- 1. 가상 데이터 만들기 (실제 데이터가 아님!) ----------
participants = pd.DataFrame({
    "participant_id": [f"S{i:02d}" for i in range(1, 13)],
    "group": ["PD"] * 6 + ["HC"] * 6,
})
# 사람마다 고유한 떨림 세기·주파수를 하나씩 뽑는다 → 같은 사람의 기록끼리 닮게 된다
participants["tremor_amp"] = np.where(participants["group"] == "PD",
                                      rng.uniform(0.01, 0.06, 12), rng.uniform(0.0, 0.01, 12))
participants["tremor_hz"] = rng.uniform(4, 6, 12)

def make_record(amp, hz, task):
    """가상 손목 가속도 한 축(단위 g)을 만든다."""
    t = np.arange(N) / FS
    scale = 1.0 if task == "Relaxed" else 0.5          # 가정: 쉬는 과제에서 떨림이 더 큼
    x = scale * amp * np.sin(2 * np.pi * hz * t)       # 떨림
    x = x + rng.normal(0, 0.01, N)                     # 센서 잡음
    x[:50] += 0.2 * np.exp(-np.arange(50) / 10)        # 시작 진동 알림 artifact (처음 0.5초)
    return x

# ---------- 2. feature 함수 ----------
def extract_features(x, fs=FS):
    x = x[int(0.5 * fs):]                  # 처음 0.5초 버리기 (artifact)
    x = x - np.mean(x)                     # 평균 제거 (중력·자세 성분)
    freqs, power = sg.welch(x, fs=fs, nperseg=256)
    band = (freqs >= 3) & (freqs <= 8)
    return {
        "std_g": np.std(x),                                   # 움직임 크기
        "range_g": np.max(x) - np.min(x),                     # 최대-최소
        "dom_freq_hz": freqs[1:][np.argmax(power[1:])],       # 가장 강한 주파수
        "band_3_8_frac": power[band].sum() / power[1:].sum()  # 3–8 Hz 비율
    }

# ---------- 3. 모든 기록에 적용 → record-level feature table ----------
rows = []
for p in participants.itertuples():
    for task in ["Relaxed", "StretchHold"]:
        for wrist in ["Left", "Right"]:
            x = make_record(p.tremor_amp, p.tremor_hz, task)
            # ↑↑↑ 실제 데이터로 바꿀 때: 이 한 줄을 "파일에서 신호 한 축 읽기"로 교체 ↑↑↑
            rows.append({"participant_id": p.participant_id, "group": p.group,
                         "task": task, "wrist": wrist, **extract_features(x)})
records = pd.DataFrame(rows)
print("record-level 표 크기:", records.shape)
print(records.head(4).round(3).to_string(index=False))

# ---------- 4. 참가자 단위로 요약 → participant-level feature table ----------
per_person = (records.groupby(["participant_id", "group", "task"])[["std_g", "band_3_8_frac"]]
              .mean().unstack("task"))
per_person.columns = [f"{feat}_{task}" for feat, task in per_person.columns]
per_person = per_person.reset_index()
print("\nparticipant-level 표 크기:", per_person.shape)
print(per_person.round(3).to_string(index=False))

assert per_person["participant_id"].is_unique          # 한 사람 = 한 줄인지 자동 확인
records.to_csv("pd_features_records.csv", index=False)
per_person.to_csv("pd_features_participants.csv", index=False)
```

출력 (실행 확인):

```text
record-level 표 크기: (48, 8)
participant_id group        task wrist  std_g  range_g  dom_freq_hz  band_3_8_frac
           S01    PD     Relaxed  Left  0.036    0.153        5.469          0.928
           S01    PD     Relaxed Right  0.036    0.148        5.469          0.927
           S01    PD StretchHold  Left  0.020    0.102        5.469          0.770
           S01    PD StretchHold Right  0.020    0.102        5.469          0.783

participant-level 표 크기: (12, 6)
participant_id group  std_g_Relaxed  std_g_StretchHold  band_3_8_frac_Relaxed  band_3_8_frac_StretchHold
           S01    PD          0.036              0.020                  0.927                      0.777
           S02    PD          0.025              0.015                  0.848                      0.621
           S03    PD          0.039              0.021                  0.936                      0.798
           S04    PD          0.034              0.019                  0.921                      0.756
           S05    PD          0.015              0.012                  0.584                      0.309
           S06    PD          0.043              0.023                  0.954                      0.840
           S07    HC          0.012              0.011                  0.328                      0.186
           S08    HC          0.011              0.010                  0.260                      0.153
           S09    HC          0.011              0.010                  0.318                      0.157
           S10    HC          0.010              0.010                  0.124                      0.117
           S11    HC          0.012              0.010                  0.408                      0.202
           S12    HC          0.012              0.010                  0.373                      0.196
```

두 가지를 보세요. 첫째, S01의 왼쪽·오른쪽 기록은 값이 거의 같습니다. 같은 사람의 기록이 서로 닮았다는 것이 표에서 보입니다. 48줄이 48개의 독립 정보가 아닌 이유입니다. 둘째, 가상 데이터에서도 S05(PD)는 다른 PD 참가자보다 값이 작습니다. 군 안에서도 사람마다 다르고, feature 하나로 군이 깔끔하게 나뉘리라 기대하면 안 됩니다.

### 예시 2: stride interval의 평균, SD, CV

```python
import numpy as np

rng = np.random.default_rng(7)

# 가상 stride interval(한쪽 발이 땅에 닿고 다시 닿을 때까지의 시간, 초) 100걸음
steady = rng.normal(1.05, 0.02, 100)     # 규칙적으로 걷는 가상 인물 A
uneven = rng.normal(1.15, 0.06, 100)     # 걸음마다 들쭉날쭉한 가상 인물 B

for name, s in [("A", steady), ("B", uneven)]:
    mean, sd = s.mean(), s.std(ddof=1)
    print(f"{name}: 평균 {mean:.3f}초, SD {sd:.3f}초, CV {100 * sd / mean:.1f}%")
```

출력 (실행 확인):

```text
A: 평균 1.047초, SD 0.018초, CV 1.7%
B: 평균 1.145초, SD 0.052초, CV 4.6%
```

걸음 100개가 숫자 세 개로 요약되었습니다. 이 세 숫자가 그 사람의 feature입니다. 걸음 100개를 표본 100개로 세지 않습니다.

### 예시 3: 힘 신호에서 heel strike 찾기

```python
import numpy as np

fs = 100
t = np.arange(0, 20, 1 / fs)
# 가상 '한쪽 발 총 힘' 신호: 1.1초마다 한 번씩 발을 디딘다 (디딜 때만 힘 > 0)
force = np.clip(np.sin(2 * np.pi * t / 1.1), 0, None) * 600     # 단위 N

on_ground = force > 20                                  # 문턱값 20 N 이상이면 '디딤'
heel_strikes = np.where(~on_ground[:-1] & on_ground[1:])[0] + 1   # 공중→디딤으로 바뀌는 순간
stride_intervals = np.diff(heel_strikes) / fs           # 표본 개수 → 초

print("찾은 heel strike 수:", len(heel_strikes))
print("stride interval 처음 5개(초):", stride_intervals[:5])
print("평균:", round(stride_intervals.mean(), 3), "초")
```

출력 (실행 확인):

```text
찾은 heel strike 수: 19
stride interval 처음 5개(초): [1.1 1.1 1.1 1.1 1.1]
평균: 1.1 초
```

가상 신호는 완벽하게 규칙적이라 모든 간격이 1.1초입니다. 실제 데이터는 다릅니다. 같은 방법(문턱값 20 N)을 실제 `GaCo01_01.txt`의 18번째 열(왼발 총 힘)에 적용해 보니 heel strike 96개, stride interval 평균 약 1.26초, 최소 1.16초, **최대 2.66초**가 나왔습니다. 2.66초짜리 간격 하나는 평소 걸음이 아닐 가능성이 큽니다(원인은 확인하지 못했습니다). 이런 값을 그대로 두면 SD가 부풀려지므로, 분포를 그려 보고 제외 규칙을 정해야 합니다. 문턱값 20 N도 제가 임의로 고른 값이니 그림으로 타당성을 확인하세요.

## 직접 해보기

1. 새 노트북 `notebooks/05_pd_feature_analysis.ipynb`를 만들고 예시 1을 실행합니다. `extract_features`에서 `x = x[int(0.5 * fs):]` 줄을 주석 처리하고 다시 실행해 `range_g`가 얼마나 커지는지 확인한 뒤, 원래대로 되돌립니다.
2. **실제 데이터로 바꿔 끼우기.** Day 24에서 고른 데이터에 맞춰 "신호 한 개 읽기" 함수를 만듭니다. 열 번호와 이름은 **내 데이터 사전에서 확인한 것**을 씁니다.

   ```python
   import pandas as pd

   def load_signal(path, column):
       """파일 하나에서 열 하나를 numpy 배열로 읽는다. column은 0부터 세는 열 번호."""
       df = pd.read_csv(path, header=None, sep=None, engine="python")
       return df[column].to_numpy()

   x = load_signal("<파일 경로>", <열 번호>)        # 자리표시자 두 곳을 채우기
   print(len(x), x[:5])
   ```

3. **점검 4가지를 실행합니다.** (a) 단위를 데이터 사전에서 확인해 주석으로 적는다. (b) `len(x) / FS`가 기대한 길이(초)인지 본다. (c) `np.isnan(x).sum()`을 출력한다. (d) 처음 2초를 그림으로 그려 시작 부분에 튐이 있는지 본다.
4. **기록 5개로 먼저 시험합니다.** 파일 5개에만 `extract_features`를 적용해 값이 상식적인지 봅니다(전부 0이거나 `nan`이면 열 번호나 단위를 다시 확인).
5. **전체에 적용합니다.** Day 25에서 만든 기록 표(참가자 ID, 과제, 손목/걷기 번호, 파일 경로)를 한 줄씩 돌며 feature를 계산해 record-level table을 만듭니다.
   - PADS(웨어러블): 과제를 2–3개만 고르고(예: 쉬는 과제 1개, 자세 유지 과제 1개), 축은 하나 또는 세 축의 크기 `np.sqrt(ax**2 + ay**2 + az**2)`를 씁니다. 어느 것을 골랐는지 적습니다.
   - Gait(보행): 예시 3의 방법으로 걷기 기록마다 stride interval을 구하고, 예시 2처럼 평균·SD·CV를 계산합니다. 먼저 한 파일의 stride interval 히스토그램을 그려 제외 규칙을 정합니다.
6. **participant-level table로 접습니다.** 예시 1의 4번 덩어리를 내 열 이름에 맞게 고칩니다. `assert per_person["participant_id"].is_unique`가 통과하는지 확인합니다.
7. 두 표를 `data/physionet_pd/derived/`에 CSV로 저장합니다. 같은 폴더에 `README.md`를 만들어 "사용한 과제/열, 버린 구간, 필터 유무, feature 정의, 만든 날짜"를 적습니다.
8. 실제 데이터를 아직 못 받았다면 예시 1의 가상 표 두 개를 저장하고, 파일 이름과 README에 **simulated**라고 분명히 표시합니다. Day 27은 그 표로 진행할 수 있습니다.

⚠️ **흔한 오류 1:** feature가 전부 `nan`으로 나오는 것. 신호에 `NaN`이 섞여 있거나, 잘못된 열(예: 글자가 든 열)을 읽은 경우입니다. `np.isnan(x).sum()`과 `x.dtype`을 먼저 출력하세요.

⚠️ **흔한 오류 2:** `groupby(...).mean()`에서 `TypeError: agg function failed` 또는 글자 열 관련 오류. 숫자가 아닌 열(`wrist` 등)까지 평균 내려고 해서 생깁니다. 예시처럼 `[["std_g", "band_3_8_frac"]]`로 **평균 낼 열을 명시**하세요.

## 퀴즈

**1.** record-level feature table이 48줄, participant-level table이 12줄입니다. 군 간 통계 검정에 쓸 표와 n은?
(a) record-level, n=48 (b) participant-level, n=12 (c) 둘 다 가능 (d) record-level, n=12

<details><summary>정답 보기</summary>

**(b)**. 같은 사람의 기록들은 서로 닮아 독립이 아닙니다. 사람 단위로 접은 표에서 한 줄이 한 독립 단위가 되므로, 검정은 participant-level 표로 하고 n은 사람 수입니다.

</details>

**2.** (단답) feature를 계산하기 전에 점검해야 할 네 가지를 쓰세요.

<details><summary>정답 보기</summary>

**단위, 시간축, 결측값, artifact**. 단위가 틀리면 크기가, 시간축이 틀리면 주파수가, 결측이 있으면 계산 자체가, artifact가 남으면 range 같은 feature가 왜곡됩니다. 이 순서를 코드 안에 넣어 두면 빠뜨리지 않습니다.

</details>

**3.** 기록 시작 직후 기기 진동으로 생긴 튐을 제거하지 않았을 때 가장 크게 왜곡되는 feature는?
(a) 참가자 ID (b) range(최대−최소) (c) sampling rate (d) 과제 이름

<details><summary>정답 보기</summary>

**(b)**. range는 가장 큰 값과 가장 작은 값만 보기 때문에 튐 하나에 그대로 끌려갑니다. 표준편차도 영향을 받지만 range보다는 덜합니다. 그래서 제작자가 알려 준 artifact 구간은 먼저 잘라냅니다.

</details>

**4.** (단답) 어떤 사람의 stride interval 평균이 1.20초, SD가 0.06초입니다. CV는?

<details><summary>정답 보기</summary>

0.06 ÷ 1.20 × 100 = **5.0%**. CV는 평균으로 나눈 값이라 걷는 속도가 다른 사람끼리도 변동성을 비교할 수 있습니다.

</details>

**5.** 양쪽 손목 중 어느 쪽 feature를 쓸지 정하는 가장 좋은 시점은?
(a) 군 비교 결과를 본 뒤 차이가 큰 쪽으로 (b) 결과를 보기 전에 미리 정해 기록 (c) 매번 다르게 (d) 논문을 쓸 때

<details><summary>정답 보기</summary>

**(b)**. 결과를 보고 고르면 우연히 차이가 큰 쪽을 선택하게 되어 거짓 양성이 늘어납니다. 요약 방법은 분석 계획에 미리 적고, 다른 선택은 민감도 분석으로 따로 보고합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `extract_features` 함수가 있고, 처음 0.5초 제거와 평균 제거가 들어 있다(또는 보행: heel strike → stride interval 함수).
- [ ] 단위·시간축·결측값·artifact 점검을 실제로 실행한 셀이 있다.
- [ ] record-level feature table을 만들어 CSV로 저장했다.
- [ ] participant-level feature table을 만들었고 `participant_id`가 중복되지 않는다.
- [ ] `derived/README.md`에 feature 정의와 선택 사항(과제, 축, 버린 구간)을 적었다.
- [ ] 가상 데이터를 썼다면 파일 이름과 README에 simulated라고 표시했다.

---
[← 이전](day-25.md) · [코스 지도](../../README.md) · [다음 →](day-27.md)
