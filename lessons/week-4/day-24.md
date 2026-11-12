# Day 24 — PhysioNet 데이터 접근과 구조: 데이터 사전 만들기

> **주차:** 4주차 · **예상 시간:** 75–90분 · **산출물:** `reports/physionet-pd-data-dictionary.md`

## 오늘의 목표
- PhysioNet 데이터셋 페이지에서 접근 조건, 라이선스, 인용 방법, 파일 구조를 찾아 기록할 수 있다.
- JSON 메타데이터 파일을 Python으로 열어 "누가, 어떤 과제를, 몇 개 표본으로" 기록했는지 표로 만들 수 있다.
- 데이터 사전(data dictionary)을 작성하고, 확인한 것과 아직 확인하지 못한 것을 구분해 적을 수 있다.

## 🎬 영상으로 먼저 보기

- [Python Tutorial: Working with JSON Data using the json Module — Corey Schafer](https://www.youtube.com/watch?v=9N6a-VLBa2I) (약 21분)
- **무엇에 주목할까:** JSON이 0주차에 배운 딕셔너리와 리스트가 겹겹이 들어 있는 구조라는 점, 그리고 `json.load`(파일에서 읽기)와 `json.loads`(문자열에서 읽기)의 차이를 보세요. 오늘 다룰 PADS의 메타데이터가 전부 JSON입니다. 앞쪽 12분만 봐도 충분합니다.

## 개념 설명

### 데이터를 열기 전에 읽어야 하는 것

3주차 Day 15에서 OSD-536의 provenance(출처 기록)를 적었던 것처럼, 새 데이터셋을 만나면 숫자를 보기 전에 **문서**부터 읽습니다. 확인할 것은 네 가지입니다. ① **접근 조건(access)**: 누구나 받을 수 있는가, 가입이나 교육 이수가 필요한가. ② **라이선스(license)**: 무엇을 해도 되고 무엇은 안 되는가. ③ **인용(citation)**: 어떤 논문과 DOI를 적어야 하는가. ④ **버전**: 내가 쓴 것이 몇 번째 판인가.

시약 병의 라벨을 읽는 것과 같습니다. 농도, 보관 조건, 유효기간을 확인하지 않고 실험에 쓰지 않듯이, 라이선스와 버전을 확인하지 않고 분석에 쓰지 않습니다. PhysioNet은 데이터셋마다 페이지 아래쪽 **Files** 영역 근처에 Access Policy와 License를 보여 줍니다.

그다음은 **데이터 사전(data dictionary)** 입니다. 파일마다, 열마다 "이름 / 뜻 / 단위 / 가능한 값 / 결측 표시 방법 / 출처"를 적은 표입니다. 실험 노트의 약어 목록에 해당합니다. 한 달 뒤의 나, 그리고 내 보고서를 읽는 사람이 "`label`이 1이면 무슨 뜻이지?"를 다시 찾아 헤매지 않게 해 줍니다.

### 선택지 1 — PADS (스마트워치): 페이지에서 확인된 사실

아래는 2026-11-12에 [PADS v1.0.0 페이지](https://physionet.org/content/parkinsons-disease-smartwatch/1.0.0/)와 그 안의 파일을 직접 열어 확인한 내용입니다. 여러분도 같은 것을 직접 눈으로 확인해 데이터 사전에 옮기세요.

- **접근·라이선스:** Open Access(누구나 접근 가능, 라이선스 조건 준수). 라이선스는 Creative Commons Attribution-NonCommercial-ShareAlike 4.0(CC BY-NC-SA 4.0). 2024-03-25 공개, 버전 1.0.0, DOI `10.13026/m0w9-zx22`, 압축 해제 크기 1.4 GB.
- **연구 설계:** 2018–2021년 독일 뮌스터 대학병원 운동장애 외래에서 수행된 단면(cross-sectional) 전향 연구. 참가자 **469명**, 측정 단계 총 5,159개.
- **세 집단:** PD 환자 / 감별진단군(DD: 본태성 떨림, 비전형 파킨슨증, 이차성 파킨슨증, 다발성 경화증 등) / 건강 대조군(HC).
- **측정:** Apple Watch Series 4를 **양쪽 손목**에 착용, 의자에 앉아서 **11개 움직임 과제**(각 10–20초) 수행. 가속도(단위 **g**)와 회전(단위 **rad/s**)을 **100 Hz**로 기록.
- **설문:** 나이, 키, 몸무게, 성별, 가족력, 알코올이 떨림에 미치는 영향, 그리고 비운동 증상 예/아니오 30문항.
- **폴더:** `movement/`(참가자별 `observation_XXX.json`과 `timeseries/` 안의 신호 `.txt`), `questionnaire/`, `patients/`(참가자별 `patient_XXX.json`), `scripts/`(예제 Python 코드), `preprocessed/`(전처리된 파일과 `file_list.csv`), 그리고 `LICENSE.txt`, `SHA256SUMS.txt`.
- **신호 파일 이름 규칙:** `001_CrossArms_LeftWrist.txt`처럼 `참가자번호_과제_손목.txt`. 참가자 001의 경우 과제 이름 11개(CrossArms, DrinkGlas, Entrainment, HoldWeight, LiftHold, PointFinger, Relaxed, RelaxedTask, StretchHold, TouchIndex, TouchNose) × 손목 2개 = 22개 파일이 있었습니다.
- **기록 길이:** 페이지 설명에 따르면 파일 하나는 1,024개 표본(10.24초)이고 일부 과제는 20.48초입니다. 실제로 `001_CrossArms_LeftWrist.txt`는 1,024줄, `001_Relaxed_LeftWrist.txt`는 2,048줄이었습니다.
- **`patient_XXX.json`의 항목:** `id`, `condition`, `disease_comment`, `age_at_diagnosis`, `age`, `height`, `weight`, `gender`, `handedness`, `appearance_in_kinship`, `appearance_in_first_grade_kinship`, `effect_of_alcohol_on_tremor` 등.
- **제작자의 사용 주의(Usage Notes):** 기록이 시작될 때 시계가 진동 알림을 주므로 **각 시계열의 처음 약 0.5초를 잘라내길 권장**. 군 크기가 불균형하므로 balanced accuracy 등을 권장. 성별 분포도 군마다 다름.

**아직 확인하지 못한 것(직접 확인하세요):** 페이지의 과제 표(1a, 1b, 2 … 10)와 파일 이름의 과제명이 정확히 어떻게 짝지어지는지는 페이지에 명시되어 있지 않습니다. 신호 `.txt`는 쉼표로 구분된 **7개 열**이고 머리글이 없는데, JSON에는 채널이 6개만 적혀 있습니다. 첫 열이 0, 0.0099, 0.0199…로 늘어나므로 시간(초)으로 **보이지만**, 이것은 추정입니다. `scripts/utils/` 안의 읽기 함수를 열어 확인하세요. 또 JSON의 `file_name`은 `bins/….bin`을 가리키는데 실제 폴더에는 `timeseries/….txt`가 있습니다. 이런 불일치를 발견하면 데이터 사전의 "메모" 칸에 그대로 적습니다. 약 복용 상태나 증상 중증도 척도가 포함되어 있는지도 페이지 설명에서는 확인하지 못했습니다.

### 선택지 2 — Gait in Parkinson's Disease (보행): 페이지에서 확인된 사실

[Gait in Parkinson's Disease v1.0.0 페이지](https://physionet.org/content/gaitpdb/1.0.0/)와 `format.txt`에서 확인한 내용입니다.

- **접근·라이선스:** Open Access. Open Data Commons Attribution License v1.0. 2008-02-25 공개, DOI `10.13026/C24H3N`, 288.4 MB.
- **참가자:** 특발성 PD 환자 **93명**, 건강 대조군 **73명**. 세 개의 연구에서 모은 자료.
- **측정:** 평지에서 평소 속도로 약 2분간 걷는 동안, 양발 밑 각 8개 센서로 수직 지면반력(vertical ground reaction force, 단위 **Newton**)을 **100 Hz**로 기록.
- **파일 형식(`format.txt`):** 한 줄에 **19개 열**. 1열 시간(초), 2–9열 왼발 센서 8개, 10–17열 오른발 센서 8개, 18열 왼발 총 힘, 19열 오른발 총 힘.
- **파일 이름 규칙:** `GaCo01_02.txt`처럼 `연구(Ga/Ju/Si)` + `Co(대조군)/Pt(환자)` + 참가자 번호 + `_걷기 번호`. Ga 연구에서 걷기 번호 `10`은 걸으면서 7씩 빼는 이중 과제(dual task), `01`은 평소 걷기.
- **참가자 정보:** `demographics.txt`(`.xls`, `.html`도 있음). 열 이름은 `ID, Study, Group, Subjnum, Gender, Age, Height, Weight, HoehnYahr, UPDRS, UPDRSM, TUAG, Speed_01 … Speed_10`. `.txt`에서는 Group과 Gender가 숫자 코드로, `.html`에서는 글자(PD, male 등)로 적혀 있으니 **두 파일을 나란히 놓고 코드의 뜻을 확인**하세요. 빈 칸(`NaN`)도 있습니다.

**직접 확인할 것:** 걷기 번호 `02`–`07`의 의미는 연구(Ju, Si)마다 다를 수 있고 `format.txt`에는 `01`과 `10`만 설명되어 있습니다. 해당 논문(페이지의 References)을 확인하기 전에는 `01` 기록만 쓰는 편이 안전합니다. 또 **같은 사람이 여러 걷기 기록을 갖는다**는 점을 파일 이름에서 바로 볼 수 있습니다(`GaCo02_01`, `GaCo02_02`).

### 어느 것을 고를까, 그리고 참가자 단위 구조

두 데이터 모두 이번 주 실습에 쓸 수 있습니다. PADS는 참가자가 많고 과제가 다양하지만 구조가 복잡합니다(JSON + 여러 폴더). 보행 데이터는 구조가 단순하고(텍스트 파일 + 참가자 표) stride interval이라는 직관적인 feature가 있지만, 발 디딤 시점을 직접 찾아야 합니다. 처음이라면 **하나만** 고르세요. 둘 다 하려다 둘 다 못 끝내는 것이 가장 흔한 실패입니다.

어느 쪽이든 공통점이 있습니다. **표가 두 층**이라는 것입니다. 한 층은 "한 사람 = 한 줄"인 참가자 표(PADS의 `patients/`나 `file_list.csv`, 보행의 `demographics.txt`)이고, 다른 층은 "한 기록 = 한 파일"인 신호 파일들입니다. 둘을 잇는 열쇠가 **참가자 ID**입니다. 3주차에 샘플 메타데이터와 발현 행렬을 샘플 ID로 이었던 것과 같은 구조지만, 이번에는 한 사람에게 파일이 여러 개 매달려 있습니다. 데이터 사전에 "이 파일의 한 줄(또는 한 파일)이 무엇을 뜻하는가"를 반드시 적는 이유입니다.

## 예시로 이해하기

### 예시 1: JSON 메타데이터를 표로 펼치기

아래 JSON은 PADS 페이지에 실린 `observation_001.json` 발췌를 그대로 옮긴 것입니다(일부 항목 생략). 실제 파일을 받기 전에도 구조를 연습할 수 있습니다.

```python
import json
import pandas as pd

# PhysioNet PADS 페이지에 실린 observation JSON 발췌를 그대로 옮긴 것(일부만)
text = """
{
  "resource_type": "observation",
  "subject_id": "001",
  "study_id": "PADS",
  "device_id": "Apple Watch Series 4",
  "sampling_rate": 100,
  "session": [
    {
      "record_name": "Relaxed",
      "rows": 2048,
      "records": [
        {"device_location": "LeftWrist",
         "channels": ["Accelerometer_X", "Accelerometer_Y", "Accelerometer_Z",
                      "Gyroscope_X", "Gyroscope_Y", "Gyroscope_Z"],
         "units": ["g", "g", "g", "rad/s", "rad/s", "rad/s"],
         "file_name": "bins/001_Relaxed_LeftWrist.bin"},
        {"device_location": "RightWrist",
         "channels": ["Accelerometer_X", "Accelerometer_Y", "Accelerometer_Z",
                      "Gyroscope_X", "Gyroscope_Y", "Gyroscope_Z"],
         "units": ["g", "g", "g", "rad/s", "rad/s", "rad/s"],
         "file_name": "bins/001_Relaxed_RightWrist.bin"}
      ]
    }
  ]
}
"""
obs = json.loads(text)        # 실제 파일이라면: obs = json.load(open(경로))

print("최상위 key:", list(obs.keys()))
print("sampling rate:", obs["sampling_rate"], "Hz")

rows = []
for session in obs["session"]:              # 과제 하나
    for rec in session["records"]:          # 손목 하나
        rows.append({
            "subject_id": obs["subject_id"],
            "task": session["record_name"],
            "wrist": rec["device_location"],
            "n_rows": session["rows"],
            "seconds": session["rows"] / obs["sampling_rate"],
            "n_channels": len(rec["channels"]),
        })
print(pd.DataFrame(rows).to_string(index=False))
```

출력 (실행 확인):

```text
최상위 key: ['resource_type', 'subject_id', 'study_id', 'device_id', 'sampling_rate', 'session']
sampling rate: 100 Hz
subject_id    task      wrist  n_rows  seconds  n_channels
       001 Relaxed  LeftWrist    2048    20.48           6
       001 Relaxed RightWrist    2048    20.48           6
```

JSON은 "사람 → 과제(session) → 손목(records)"의 3단 구조입니다. 이중 `for`문으로 펼치면 "한 기록 = 한 줄"인 표가 됩니다. 어제 배운 "표본 수 ÷ sampling rate = 초"가 여기서 바로 쓰였습니다.

### 예시 2: 머리글 없는 신호 파일의 처음 몇 줄 읽기

아래 세 줄은 실제 `001_Relaxed_LeftWrist.txt`의 처음 세 줄입니다. 머리글이 없으므로 열 이름을 **내가** 붙여야 합니다.

```python
import io
import pandas as pd

# PADS 001_Relaxed_LeftWrist.txt의 처음 3줄(실제 파일에서 확인한 값)
sample = """0.0000000000,-0.0039583882,0.0023599046,0.0017461196,-0.0154924262,0.0056162034,0.0010342058
0.0099029541,-0.0040048202,0.0022586959,0.0008355394,-0.0122763924,0.0056047519,-0.0032175307
0.0199010372,0.0008331696,0.0022254365,0.0009437218,-0.0090513043,0.0024323943,-0.0021368200
"""
cols = ["time_s", "acc_x", "acc_y", "acc_z", "gyr_x", "gyr_y", "gyr_z"]   # 내가 붙인 이름
df = pd.read_csv(io.StringIO(sample), header=None, names=cols)
# 실제 파일이라면: pd.read_csv("<경로>/001_Relaxed_LeftWrist.txt", header=None, names=cols)

print(df.shape)
print(df.round(4).to_string(index=False))
print("시간 간격(초):", df["time_s"].diff().round(4).tolist())
```

출력 (실행 확인):

```text
(3, 7)
 time_s   acc_x  acc_y  acc_z   gyr_x  gyr_y   gyr_z
 0.0000 -0.0040 0.0024 0.0017 -0.0155 0.0056  0.0010
 0.0099 -0.0040 0.0023 0.0008 -0.0123 0.0056 -0.0032
 0.0199  0.0008 0.0022 0.0009 -0.0091 0.0024 -0.0021
시간 간격(초): [nan, 0.0099, 0.01]
```

첫 열의 간격이 약 0.01초로, 100 Hz와 맞아떨어집니다. 그래서 "시간"이라고 **추정**했습니다. 하지만 `time_s`, `acc_x` 같은 이름과 열 순서는 제가 JSON의 채널 순서를 보고 붙인 것일 뿐입니다. 데이터 사전에는 "추정, `scripts/utils/`의 읽기 코드로 확인 필요"라고 적어 두고, 확인한 뒤에 "확인됨"으로 고칩니다.

### 예시 3: 데이터 사전의 두 줄

| 파일 | 한 줄(한 파일)의 의미 | 변수 | 뜻 | 단위/값 | 결측 표시 | 근거 | 상태 |
|---|---|---|---|---|---|---|---|
| `patients/patient_XXX.json` | 참가자 1명 | `condition` | 진단군 | 문자열 (예: `Healthy`) — 전체 값 목록은 직접 집계 | 직접 확인 | PADS 페이지 Data Description | 확인됨 |
| `movement/timeseries/*.txt` | 기록 1개(사람×과제×손목) | 1열 | 시간으로 보임 | 초(추정) | 직접 확인 | 파일 첫 3줄 관찰 | **추정** |

"상태" 열이 이 표에서 가장 중요합니다. 확인된 것과 추정을 섞어 두면, 나중에 추정이 사실처럼 보고서에 들어갑니다.

## 직접 해보기

1. 두 데이터셋 페이지를 브라우저로 엽니다. 각 페이지에서 **Access Policy, License, DOI, 버전, 공개일, 전체 크기**를 찾아 `reports/physionet-pd-data-dictionary.md` 맨 위 "출처" 표에 적습니다. 인용 문구(페이지의 "please cite")도 복사해 둡니다. 오늘 날짜를 "확인일"로 적습니다.
2. 둘 중 **하나**를 고르고, 고른 이유를 두 문장으로 씁니다.
3. 데이터를 받습니다. 전체를 받기 전에 **작은 파일 몇 개만** 받아 구조를 봅니다.
   - PADS: 브라우저의 Files 영역에서 `preprocessed/file_list.csv`, `patients/patient_001.json`, `movement/observation_001.json`, `movement/timeseries/` 안의 파일 2개를 받아 `data/physionet_pd/pads/`에 원래 폴더 구조 그대로 둡니다.
   - Gait: `format.txt`, `demographics.txt`, `GaCo01_01.txt`, `GaPt03_01.txt`를 받아 `data/physionet_pd/gaitpdb/`에 둡니다.
   - 전체가 필요해지면 페이지에 적힌 명령을 씁니다(PADS는 1.4 GB이니 저장 공간을 확인하세요):
     ```bash
     wget -r -N -c -np https://physionet.org/files/parkinsons-disease-smartwatch/1.0.0/
     wget -r -N -c -np https://physionet.org/files/gaitpdb/1.0.0/
     ```
4. 받은 파일을 **텍스트 편집기로 먼저 열어** 처음 5줄을 눈으로 봅니다. 구분자가 쉼표인지 탭인지, 머리글이 있는지, 열이 몇 개인지 적습니다. 그다음 Python으로 확인합니다.
   ```python
   import pandas as pd
   path = "<받은 파일 경로>"                       # 자리표시자: 내 경로로 바꾸기
   df = pd.read_csv(path, header=None, sep=None, engine="python")   # 구분자 자동 추정
   print(df.shape)
   print(df.head())
   ```
5. (PADS를 골랐다면) 예시 1의 코드에서 `json.loads(text)`를 `json.load(open("<observation_001.json 경로>"))`로 바꿔 실행하고, 과제가 몇 개이며 각각 몇 초인지 표로 만듭니다. `patient_001.json`도 열어 key 목록을 출력합니다.
6. 데이터 사전 표를 채웁니다. 머리글은 예시 3과 같게 하고, 최소한 다음을 넣습니다: 참가자 ID, 진단군, 나이, 성별, 과제(또는 걷기 번호), 손목(또는 발), 각 신호 채널, sampling rate, 기록 길이.
7. 표 아래에 "아직 확인하지 못한 것" 목록을 만들어 최소 3개를 적고, 각각 **어디를 보면 확인할 수 있는지**(README, `format.txt`, `scripts/`, 원 논문) 적습니다.
8. `data/README.md`에 데이터셋 이름, 버전, 받은 날짜, 라이선스, 받은 파일 목록을 추가합니다. `data/` 안의 원자료는 Git에 올리지 않습니다(`.gitignore` 확인).

⚠️ **흔한 오류 1:** `pd.read_csv`로 읽었더니 첫 줄의 숫자들이 열 이름이 되어 버리는 것. 머리글이 없는 파일은 `header=None`을 줘야 합니다. `df.shape`의 줄 수가 편집기에서 본 줄 수보다 1 적으면 이 문제입니다.

⚠️ **흔한 오류 2:** 참가자 번호 `001`을 숫자로 읽어 `1`이 되어 버리는 것. 그러면 파일 이름 `001_...`과 이어 붙일 수 없습니다. ID는 **문자열**로 읽습니다: `pd.read_csv(path, dtype={"id": str})`.

## 퀴즈

**1.** PADS 데이터셋의 라이선스(CC BY-NC-SA 4.0)에서 "NC"가 뜻하는 것은?
(a) 인용 불필요 (b) 비상업적 이용만 허용 (c) 수정 금지 (d) 접근에 승인 필요

<details><summary>정답 보기</summary>

**(b)**. NC는 NonCommercial입니다. BY는 출처 표시, SA는 2차 저작물을 같은 조건으로 공유하라는 뜻입니다. 접근 조건(Open Access)과 라이선스는 서로 다른 항목이므로 따로 기록합니다.

</details>

**2.** (단답) PADS 신호 파일 하나에 2,048줄이 있고 sampling rate가 100 Hz입니다. 제작자의 권고대로 처음 0.5초를 잘라내면 몇 줄이 남습니까?

<details><summary>정답 보기</summary>

0.5초 × 100 Hz = 50줄을 버리므로 **1,998줄**이 남습니다. 기록 시작 때의 진동 알림이 만든 artifact를 피하기 위한 권고입니다. 이런 권고는 페이지의 Usage Notes에 있으니 꼭 읽어야 합니다.

</details>

**3.** Gait in Parkinson's Disease 데이터에서 파일 `GaPt07_01.txt`와 `GaPt07_02.txt`의 관계로 옳은 것은?
(a) 서로 다른 두 환자 (b) 같은 환자의 서로 다른 걷기 기록 (c) 왼발과 오른발 (d) 대조군과 환자

<details><summary>정답 보기</summary>

**(b)**. `Ga`는 연구, `Pt`는 환자, `07`은 참가자 번호, `_01`/`_02`는 걷기 번호입니다. 같은 사람의 반복 측정이므로 독립 표본 두 개로 세면 안 됩니다. 왼발·오른발은 한 파일 안의 서로 다른 열에 들어 있습니다.

</details>

**4.** 머리글이 없는 신호 파일에 직접 열 이름을 붙였습니다. 데이터 사전에 어떻게 적어야 합니까?

<details><summary>정답 보기</summary>

"**추정**"이라고 표시하고 근거(예: JSON의 채널 순서, 첫 열 간격이 0.01초)와 확인 방법(제작자의 읽기 스크립트, README)을 함께 적습니다. 확인한 뒤에 "확인됨"으로 바꿉니다. 추정을 사실처럼 적으면 열이 뒤바뀐 채로 모든 feature가 계산될 수 있습니다.

</details>

**5.** 두 데이터셋에 공통된 구조로 옳은 것은?
(a) 한 사람당 신호 파일이 정확히 하나 (b) 참가자 표(한 사람 = 한 줄)와 신호 파일(한 기록 = 한 파일)이 참가자 ID로 연결된다 (c) 모든 정보가 하나의 CSV에 있다 (d) 참가자 ID가 없다

<details><summary>정답 보기</summary>

**(b)**. 두 층의 자료를 참가자 ID로 잇습니다. 한 사람에게 여러 기록이 달려 있으므로, 어떤 표를 볼 때든 "한 줄이 사람인가 기록인가"를 먼저 확인해야 합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `reports/physionet-pd-data-dictionary.md`에 출처 표(접근 조건, 라이선스, DOI, 버전, 확인일, 인용 문구)가 있다.
- [ ] 사용할 데이터셋 하나를 고르고 이유를 적었다.
- [ ] 작은 파일 몇 개를 받아 편집기와 Python 양쪽으로 열어 보았다.
- [ ] 데이터 사전 표에 변수 9개 이상이 있고, 각 줄에 단위와 "확인됨/추정" 상태가 있다.
- [ ] "아직 확인하지 못한 것" 3개 이상과 확인 방법을 적었다.
- [ ] `data/README.md`를 갱신했고 원자료는 Git에 올리지 않았다.

---
[← 이전](day-23.md) · [코스 지도](../../README.md) · [다음 →](day-25.md)
