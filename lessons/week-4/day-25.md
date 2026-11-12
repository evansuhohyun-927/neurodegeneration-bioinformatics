# Day 25 — participant-level QC: 사람 단위로 세고 점검하기

> **주차:** 4주차 · **예상 시간:** 75–90분 · **산출물:** `reports/pd-qc-table.md` (QC 표와 flowchart), 노트북 `notebooks/04_pd_data_qc.ipynb`

> **기본 경로:** Gait in Parkinson's Disease 데이터로 진행합니다. PADS(스마트워치) 관련 부분은 선택 실습이므로 읽기만 해도 됩니다. ([Day 24](day-24.md)에서 정한 경로)

## 오늘의 목표
- 참가자 ID, 진단군, 과제, 반복 횟수, 결측값, class imbalance를 pandas로 점검할 수 있다.
- "사람 수"와 "기록 수"를 구분해 세고, 왜 둘을 섞으면 안 되는지 설명할 수 있다.
- 몇 명에서 시작해 몇 명이 남았는지 보여 주는 참가자 flowchart를 그릴 수 있다.

## 🎬 영상으로 먼저 보기

- [The Difference Between Technical and Biological Replicates — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=Exk0OoRG0PQ) (약 5분)
- **무엇에 주목할까:** 같은 개체를 여러 번 잰 것(technical replicate)과 서로 다른 개체를 잰 것(biological replicate)의 차이를 다시 떠올리세요. 오늘 데이터에서는 "한 사람의 여러 기록"이 기술 반복에, "서로 다른 참가자"가 생물학적 반복에 해당합니다.

- [Pseudoreplication - What it is and how to avoid it — GSS - Guided Statistics for Scientists](https://www.youtube.com/watch?v=ZYSl8KZKm1g) (약 5분)
- **무엇에 주목할까:** 독립이 아닌 측정값을 독립인 것처럼 세는 실수에 **pseudoreplication(의사반복)** 이라는 이름이 붙어 있다는 것, 그리고 이것이 p-value를 얼마나 쉽게 작게 만드는지 보세요. Day 28에서 직접 시뮬레이션합니다.

## 개념 설명

### QC의 단위가 바뀐다: 샘플에서 참가자로

2–3주차의 QC는 "샘플 하나가 믿을 만한가"를 물었습니다. 이번에는 질문이 한 층 더 있습니다. **기록 하나가 믿을 만한가**, 그리고 **그 기록들을 가진 사람이 분석에 들어갈 수 있는가**. 이 두 번째를 participant-level QC(참가자 단위 품질 점검)라고 합니다.

병동 회진에 비유할 수 있습니다. 환자 한 명의 차트에는 혈압이 하루에도 여러 번 적혀 있습니다. 병동의 평균 혈압을 구할 때 차트의 모든 숫자를 그냥 평균 내면, 측정을 자주 한 환자가 평균을 좌우합니다. 먼저 **환자별로 정리**한 다음 환자들을 비교해야 합니다. 운동 데이터도 같습니다. 어떤 참가자는 기록이 22개, 어떤 참가자는 일부가 빠져 18개일 수 있습니다. 기록 수로 세면 기록이 많은 사람의 목소리가 커집니다.

그래서 오늘 만드는 모든 집계는 두 가지 버전으로 나란히 봅니다. **사람 수 기준**과 **기록 수 기준**. 두 숫자가 다르다는 것 자체가 "반복 측정은 서로 독립적인 표본이 아닐 수 있다"는 이번 주 규칙을 눈으로 보여 줍니다.

### 점검할 여섯 가지

**① 참가자 ID.** ID가 중복되지 않는가, 참가자 표의 ID와 신호 파일 이름의 ID가 서로 빠짐없이 짝지어지는가. 3주차에 샘플 ID를 맞췄던 것과 같은 작업입니다. 참가자 표에는 있는데 파일이 없는 사람, 파일은 있는데 표에 없는 사람을 각각 셉니다.

**② 진단군.** 어떤 값들이 있는가. "PD와 대조군" 둘뿐이라고 가정하지 말고 `value_counts()`로 직접 봅니다. 예를 들어 PADS에는 PD와 건강 대조군 외에 다른 운동장애 진단군이 있습니다. 이 사람들을 분석에 넣을지, 뺄지, 따로 볼지는 **Day 28의 분석 계획에서 미리** 정합니다.

**③ 과제.** 모든 참가자가 같은 과제를 수행했는가. 과제가 다르면 feature의 의미도 다릅니다. 쉬는 과제의 "움직임 크기"와 물컵을 드는 과제의 "움직임 크기"는 다른 것을 잽니다.

**④ 반복 횟수.** 한 사람당 기록이 몇 개인가, 길이는 예상대로인가. 기대값(예: 과제 수 × 손목 2)과 다르면 표시합니다.

**⑤ 결측값.** 참가자 표의 빈 칸(나이, 키 등)과 신호의 결측(빠진 파일, 짧은 기록, `NaN`)을 따로 셉니다.

**⑥ class imbalance(군 불균형).** 군마다 사람 수가 얼마나 다른가. 한 군이 압도적으로 많으면 "전부 그 군이라고 찍기"만 해도 정확도가 높게 나옵니다. 5주차에 accuracy만 보면 안 되는 이유가 여기서 시작됩니다.

### 제외 기준과 flowchart

QC에서 문제를 찾으면 그 사람이나 기록을 뺄지 결정해야 합니다. 원칙은 두 가지입니다. 첫째, **기준은 결과를 보기 전에 정한다.** "이 사람을 빼니 p-value가 좋아지네"는 QC가 아닙니다. 둘째, **뺀 사람 수와 이유를 모두 남긴다.**

이것을 한 장으로 보여 주는 것이 **참가자 flowchart**입니다. 임상 논문의 CONSORT 그림처럼, 맨 위에 전체 인원을 적고 단계마다 "몇 명 제외, 이유"를 적으며 내려와, 맨 아래에 최종 분석 인원을 군별로 적습니다. 상자 안의 숫자는 **항상 사람 수**입니다. 기록 수는 괄호로 덧붙일 수는 있어도 주인공이 될 수 없습니다.

또 하나 기억할 점이 있습니다. QC로 군을 비교하다 보면 "PD군이 대조군보다 나이가 많다", "성비가 다르다" 같은 것이 눈에 띕니다. 지금은 **고치려 하지 말고 기록만** 합니다. 이런 차이는 5주차 Day 31(교란변수)의 재료가 됩니다.

## 예시로 이해하기

### 예시 1: 가상 참가자 12명으로 QC 한 바퀴

실제 데이터 없이 전체 흐름을 연습합니다. 일부러 문제 두 개를 심어 두었습니다.

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(1)

# 가상 참가자 12명: PD 7명, HC 5명 (실제 데이터가 아님!)
participants = pd.DataFrame({
    "participant_id": [f"S{i:02d}" for i in range(1, 13)],
    "group": ["PD"] * 7 + ["HC"] * 5,
    "age": rng.integers(55, 80, 12).astype(float),
})
participants.loc[3, "age"] = np.nan            # 나이 결측 1명

# 기록 표: 참가자 × 과제 3개 × 손목 2개 = 한 사람당 6줄이어야 정상
tasks = ["Relaxed", "StretchHold", "TouchNose"]
records = pd.DataFrame(
    [(p, t, w) for p in participants["participant_id"] for t in tasks for w in ["Left", "Right"]],
    columns=["participant_id", "task", "wrist"],
)
records["n_samples"] = 1024
# 일부러 문제를 심는다: S05는 TouchNose 기록이 없고, S09는 한 기록이 짧다
records = records[~((records["participant_id"] == "S05") & (records["task"] == "TouchNose"))]
records.loc[(records["participant_id"] == "S09") & (records["task"] == "Relaxed")
            & (records["wrist"] == "Left"), "n_samples"] = 600

# ↓↓↓ 실제 데이터로 바꿀 때는 위 두 표 대신 내 데이터의 참가자 표·기록 표를 읽어 온다 ↓↓↓

print("① 참가자 ID 중복:", participants["participant_id"].duplicated().sum())
print("② 군별 '사람' 수:\n", participants["group"].value_counts().to_string())
print("③ 군별 '기록' 수:\n", records.merge(participants)["group"].value_counts().to_string())
print("④ 참가자 표의 결측:\n", participants.isna().sum().to_string())

qc = (records.groupby("participant_id")
      .agg(n_records=("task", "size"), n_tasks=("task", "nunique"), min_samples=("n_samples", "min"))
      .reset_index()
      .merge(participants[["participant_id", "group"]]))
qc["complete"] = (qc["n_records"] == 6) & (qc["min_samples"] == 1024)
print("⑤ 문제가 있는 참가자:\n", qc[~qc["complete"]].to_string(index=False))
print("⑥ 완전한 참가자 수(군별):\n", qc[qc["complete"]]["group"].value_counts().to_string())
```

출력 (실행 확인):

```text
① 참가자 ID 중복: 0
② 군별 '사람' 수:
 group
PD    7
HC    5
③ 군별 '기록' 수:
 group
PD    40
HC    30
④ 참가자 표의 결측:
 participant_id    0
group             0
age               1
⑤ 문제가 있는 참가자:
 participant_id  n_records  n_tasks  min_samples group  complete
           S05          4        2         1024    PD     False
           S09          6        3          600    HC     False
⑥ 완전한 참가자 수(군별):
 group
PD    6
HC    4
```

②와 ③을 비교하세요. 사람은 7명 대 5명인데 기록은 40개 대 30개입니다. 보고서에 "n=40 vs n=30"이라고 쓰면 틀립니다. `groupby("participant_id")`가 기록 표를 **사람 단위 표로 접는** 핵심 도구입니다.

### 예시 2: 예시 1의 결과를 flowchart로

```text
전체 참가자: 12명 (PD 7, HC 5)
        │
        ├─ 제외 1명: 과제 기록 누락 (S05, PD) — TouchNose 없음
        │
        ├─ 제외 1명: 기록 길이 부족 (S09, HC) — 600 < 1024 표본
        ▼
분석 대상: 10명 (PD 6, HC 4)
   참고: 나이 결측 1명 → 제외하지 않음. 나이를 쓰는 분석에서만 제외.
```

"나이가 비어 있는 사람"을 무조건 빼지 않은 점에 주목하세요. 결측이 있는 변수를 **쓰는 분석에서만** 빼는 편이 사람을 덜 잃습니다. 어느 쪽을 택하든 기준을 적어 두면 됩니다.

### 예시 3: 실제 PADS 참가자 표로 본 군 구성

PADS의 `preprocessed/file_list.csv`는 "한 사람 = 한 줄"인 참가자 표입니다. 아래 코드는 이 파일을 받아 둔 경우에 실행됩니다. 출력은 2026-11-12에 실제 파일로 실행해 얻은 값입니다. 여러분의 결과와 같은지 비교하세요.

```python
import pandas as pd

path = "data/physionet_pd/pads/preprocessed/file_list.csv"   # 내 경로에 맞게 수정
df = pd.read_csv(path, dtype={"id": str})                    # ID는 문자열로!

print(df.shape)
print("ID 중복 없음:", df["id"].is_unique)
print(df["condition"].value_counts().to_string())
print(df["label"].value_counts().to_string())
print(pd.crosstab(df["label"], df["gender"]).to_string())
```

출력 (실제 파일로 실행 확인):

```text
(469, 15)
ID 중복 없음: True
condition
Parkinson's                 276
Healthy                      79
Other Movement Disorders     60
Essential Tremor             28
Atypical Parkinsonism        15
Multiple Sclerosis           11
label
1    276
2    114
0     79
gender  female  male
label               
0           50    29
1           81   195
2           57    57
```

세 가지를 읽을 수 있습니다. 첫째, 군이 여섯 가지 `condition`으로 나뉘고 `label`은 이를 0/1/2 세 묶음으로 합친 것입니다(0 = Healthy 79명, 1 = Parkinson's 276명, 2 = 나머지 네 진단 114명). `pd.crosstab(df["condition"], df["label"])`를 실행하면 이 대응을 직접 볼 수 있습니다. 둘째, PD가 건강 대조군의 약 3.5배입니다. 뚜렷한 class imbalance입니다. 셋째, PD군은 남성이 많고 대조군은 여성이 많습니다. 성별이 군과 얽혀 있다는 뜻이니 기록해 둡니다.

## 직접 해보기

1. `notebooks/04_pd_data_qc.ipynb`를 만들고 예시 1을 그대로 실행해 흐름을 익힙니다.
2. **참가자 표 읽기.** Day 24에서 고른 데이터의 참가자 표를 읽습니다.
   - PADS: 예시 3의 코드.
   - Gait: `demographics.txt`는 탭으로 구분되어 있지만 줄마다 끝에 붙은 빈 칸 수가 달라서 그냥 읽으면 `ParserError`가 납니다(실제로 확인함). 앞의 20개 열만 읽고, ID가 빈 줄을 지웁니다.
     ```python
     df = pd.read_csv("<경로>/demographics.txt", sep="\t", usecols=range(20))
     df = df.dropna(subset=["ID"])
     print(df.shape)          # 실제 파일로 확인한 값: (166, 20)
     print(df["Group"].value_counts())
     ```
     Group·Gender의 숫자 코드가 무엇을 뜻하는지는 `demographics.html`(글자로 적혀 있음)과 대조해 데이터 사전에 적습니다.
3. **① ID 점검.** `df["<ID 열>"].is_unique`를 확인합니다. 신호 파일 이름에서 ID를 뽑아 참가자 표와 비교합니다.
   ```python
   from pathlib import Path
   files = sorted(Path("<신호 파일 폴더>").glob("*.txt"))        # 자리표시자
   file_ids = {f.name.split("_")[0] for f in files}            # 파일 이름 규칙은 Day 24 데이터 사전 참고
   table_ids = set(df["<ID 열>"])
   print("표에만 있는 ID:", len(table_ids - file_ids), " 파일에만 있는 ID:", len(file_ids - table_ids))
   ```
   Gait 데이터는 `format.txt`, `demographics.txt` 같은 신호가 아닌 `.txt`도 같은 폴더에 있으니 제외해야 합니다.
4. **② 진단군, ⑥ class imbalance.** `value_counts()`로 군별 사람 수를 세고, 가장 큰 군 ÷ 가장 작은 군의 비를 계산해 적습니다.
5. **③ 과제, ④ 반복 횟수.** 파일 이름에서 과제(또는 걷기 번호)를 뽑아 기록 표를 만들고, 예시 1의 `groupby("participant_id")` 코드로 사람별 기록 수와 과제 수를 구합니다. 기대값과 다른 사람을 목록으로 뽑습니다.
6. **⑤ 결측값.** `df.isna().sum()`으로 참가자 표의 결측을 세고, 기록 길이(줄 수)가 기대와 다른 파일을 셉니다. 파일이 많으면 줄 수 세기에 시간이 걸리니 먼저 20개만 해 봅니다.
7. **QC 표 작성.** `reports/pd-qc-table.md`에 아래 표를 채웁니다.

   | 점검 항목 | 방법(코드 한 줄) | 결과(사람 수 기준) | 결과(기록 수 기준) | 조치 |
   |---|---|---|---|---|
   | ID 중복/불일치 | | | | |
   | 진단군 분포 | | | | |
   | 과제 완결성 | | | | |
   | 반복 횟수·기록 길이 | | | | |
   | 결측값 | | | | |
   | class imbalance | | | | |

8. **flowchart.** 같은 파일 아래에 예시 2 형식으로 flowchart를 그립니다. 제외 기준은 "기록 누락", "길이 부족"처럼 **결과와 무관한 기준**만 씁니다. 다른 진단군을 어떻게 할지는 아직 정하지 말고 "Day 28에서 결정"이라고 적습니다.
9. 군별 나이·성별 요약을 표 하나로 덧붙이고 "군 간 차이는 Day 31에서 검토"라고 메모합니다.

⚠️ **흔한 오류 1:** `records["group"].value_counts()`의 숫자를 사람 수로 착각하는 것. 기록 표에서 센 것은 기록 수입니다. 사람 수는 `records.drop_duplicates("participant_id")["group"].value_counts()` 또는 참가자 표에서 셉니다.

⚠️ **흔한 오류 2:** `merge` 후 줄 수가 갑자기 늘거나 줄어드는 것. ID의 자료형이 한쪽은 문자열 `"001"`, 다른 쪽은 숫자 `1`이면 짝이 맞지 않아 줄이 사라집니다. `merge` 전후로 `len()`을 출력해 비교하세요.

## 퀴즈

**1.** 참가자 20명(PD 12, HC 8)이 각자 기록 10개를 남겼습니다. 군 비교 보고서의 표본 크기로 옳은 것은?
(a) PD 120, HC 80 (b) PD 12, HC 8 (c) 전체 200 (d) 전체 10

<details><summary>정답 보기</summary>

**(b)**. 독립적인 단위는 사람입니다. 한 사람의 기록 10개는 서로 닮아 있어 독립 표본이 아닙니다. 기록 수를 n으로 쓰면 pseudoreplication이 되어 불확실성이 실제보다 작게 계산됩니다.

</details>

**2.** (단답) 한 데이터셋에 PD 276명, 건강 대조군 79명이 있습니다. 모든 사람을 "PD"라고 예측하는 모델의 accuracy는 약 몇 %입니까?

<details><summary>정답 보기</summary>

276 ÷ (276 + 79) = **약 78%**. 아무것도 배우지 않아도 78%가 나옵니다. class imbalance가 있을 때 accuracy만 보면 안 되는 이유이고, 그래서 balanced accuracy 같은 지표를 씁니다(5주차).

</details>

**3.** 다음 중 적절한 제외 기준은?
(a) feature 값이 군 평균과 반대 방향인 참가자 (b) 과제 기록이 누락된 참가자 (c) 빼면 p-value가 작아지는 참가자 (d) 모델이 틀리게 분류한 참가자

<details><summary>정답 보기</summary>

**(b)**. 제외 기준은 결과(feature 값, p-value, 모델 예측)를 보기 전에, 결과와 무관한 품질 조건으로 정해야 합니다. (a), (c), (d)는 모두 결과를 보고 고르는 것이라 결론을 원하는 쪽으로 끌고 갑니다.

</details>

**4.** 참가자 flowchart의 상자에 들어가는 숫자의 단위는?
(a) 파일 수 (b) window 수 (c) 사람 수 (d) 표본(sample point) 수

<details><summary>정답 보기</summary>

**(c)**. flowchart는 "몇 명에서 시작해 몇 명이 남았는가"를 보여 줍니다. 기록 수나 window 수는 사람마다 다를 수 있어 분석 단위를 흐리게 만듭니다.

</details>

**5.** QC 중에 PD군은 남성이 많고 대조군은 여성이 많다는 것을 발견했습니다. 지금 할 일은?
(a) 여성 PD 환자를 삭제해 성비를 맞춘다 (b) 무시한다 (c) QC 표에 기록하고 교란변수 검토 때 다룬다 (d) 성별 열을 지운다

<details><summary>정답 보기</summary>

**(c)**. 군 간 인구학적 차이는 결과 해석에 영향을 줄 수 있는 교란 가능성입니다. QC 단계에서는 임의로 사람을 지우지 말고 사실을 기록합니다. 어떻게 다룰지는 분석 계획(Day 28)과 교란변수 검토(Day 31)에서 정합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `notebooks/04_pd_data_qc.ipynb`에서 참가자 표를 읽고 ID 중복을 확인했다.
- [ ] 군 분포를 **사람 수**와 **기록 수** 두 가지로 세어 나란히 적었다.
- [ ] 사람별 기록 수·과제 수를 `groupby`로 구하고, 기대와 다른 참가자 목록을 뽑았다.
- [ ] 결측값(참가자 표, 신호)을 따로 셌다.
- [ ] `reports/pd-qc-table.md`에 QC 표 6행이 채워져 있다.
- [ ] 사람 수 기준의 flowchart가 있고, 제외 이유가 결과와 무관하다.
- [ ] 군별 나이·성별 요약을 기록했다.

---
[← 이전](day-24.md) · [코스 지도](../../README.md) · [다음 →](day-26.md)
