# Day E2 — 표 구조, 접근, 윤리, 비식별화: MIMIC 계열 데이터 읽는 법

> **주차:** 심화 파트 E — EHR 2차 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/E/E2_tables_and_access.ipynb`, `data/README.md`에 데이터 기록 한 줄
>
> **먼저 끝내 둘 레슨:** Day E1, Day 4 (tidy data), Day 15 (데이터 수집과 provenance), Day 24 (PhysioNet 데이터 접근).

## 오늘의 목표
- 환자·입원·ICU 입실의 세 겹 식별자(`subject_id`, `hadm_id`, `stay_id`)로 표를 안전하게 합치고, 합친 뒤 행 수가 맞는지 검사할 수 있다.
- SQL 창 함수(window function)와 pandas로 "환자별 첫 ICU 입실"을 고를 수 있다.
- 공개 데모(open access)와 자격 심사형(credentialed) 데이터의 차이, 비식별화가 바꾸는 것(날짜 이동, 나이 상한)과 사용 계약이 금지하는 것을 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [MEDomicsLab | MIMIC database tutorial 1 : Physionet and CITI Program — MEDomicsLab](https://www.youtube.com/watch?v=dfZhM4YjTTs) (16:31)
- **무엇에 주목할까:** PhysioNet 계정 → 자격 심사(credentialing) → 연구윤리 교육(CITI) → 데이터 사용 계약(DUA) 서명으로 이어지는 순서를 보세요. 화면 속 메뉴 이름은 시간이 지나며 바뀔 수 있으니, 실제 신청할 때는 오늘 레슨의 "접근 절차" 표와 PhysioNet 페이지를 기준으로 합니다.

## 개념 설명

### 관계형 표: 한 장의 큰 엑셀이 아니라 열쇠로 이어진 여러 장

EHR 데이터베이스는 표 하나에 모든 것을 담지 않습니다. 사람 한 명에 입원이 여러 번, 입원 한 번에 ICU 입실이 여러 번, 입실 한 번에 검사가 수백 개 있기 때문입니다. 그래서 **관계형 데이터베이스(relational database)** 로 나눠 담고, 표끼리는 **열쇠(key)** 로 잇습니다. 표 안에서 한 행을 유일하게 가리키는 열이 **기본 키(primary key)**, 다른 표의 기본 키를 가리키는 열이 **외래 키(foreign key)** 입니다.

가계도 비유가 편합니다. `patients`는 사람 명부, `admissions`는 그 사람이 병원에 온 횟수별 기록, `icustays`는 그 입원 중 ICU에 들어간 횟수별 기록입니다. MIMIC-IV에서는 이를 `subject_id`(사람) → `hadm_id`(입원) → `stay_id`(ICU 입실)로 잇습니다. 검사 표 `labevents`의 `itemid`는 숫자일 뿐이고, 그것이 무슨 검사인지는 사전 표 `d_labitems`에 있습니다. MIMIC-IV에서 이름이 `d_`로 시작하는 표가 이런 사전(dictionary) 표입니다.

열쇠를 잘못 고르면 조용히 틀립니다. 같은 사람이 두 번 입원했는데 `subject_id`로만 검사를 붙이면 첫 입원의 검사가 둘째 입원에도 붙습니다. 그래서 합칠 때마다 **"이 합치기는 몇 대 몇인가"** 를 코드로 검사하는 습관이 필요합니다(pandas `merge`의 `validate=` 인자).

### 데이터 접근: 열린 데모와 자격 심사형 원본

MIMIC 계열은 PhysioNet에서 배포합니다. 2026년 11월에 PhysioNet 페이지에서 확인한 내용은 다음과 같습니다(정책은 바뀔 수 있으니 신청 전에 다시 확인하세요).

| | MIMIC-IV Clinical Database Demo | MIMIC-IV (원본) |
|---|---|---|
| 페이지 | [physionet.org/content/mimic-iv-demo](https://physionet.org/content/mimic-iv-demo/2.2/) | [physionet.org/content/mimiciv](https://physionet.org/content/mimiciv/) |
| 확인한 버전 | 2.2 (2023-01-31 공개), DOI 10.13026/dp1f-ex47 | 3.1 (2024-10-11) |
| 규모 | 환자 100명의 부분집합, 자유 서술 임상 노트 제외 | 전체 |
| 접근 | 누구나, 라이선스 조건을 지키면 | 자격 심사(credentialed) 사용자 + 필수 교육 + DUA 서명 |
| 라이선스/계약 | Open Data Commons Open Database License (ODbL) v1.0 | PhysioNet Credentialed Health Data License 1.5.0, 같은 이름의 DUA 1.5.0 |
| 필수 교육 | 없음 | CITI "Data or Specimens Only Research" |
| 파일 | `hosp/`, `icu/` 폴더의 `.csv.gz`, `LICENSE.txt`, `README.txt`, `SHA256SUMS.txt`, `demo_subject_id.csv`. ZIP 약 15.4 MB | 같은 구조(데모는 원본과 같은 스키마) |

데모는 "원본을 신청할 가치가 있는지 미리 보는 용도"로 공개된 것입니다. 이 레슨의 연습은 데모와 직접 만든 가상 표로 충분합니다.

자격 심사형 계약(DUA)의 핵심은 짧습니다. 개인이나 기관을 **식별하려고 시도하지 않는다**, 접근 권한을 **남과 공유하지 않는다**, 발표물에서 식별 가능성을 피한다, 식별 가능 정보를 발견하면 신고한다, 논문에 쓴 코드는 공개 저장소에 올린다. PhysioNet은 2023년 공지에서 자격 심사형 데이터를 ChatGPT 같은 **온라인 AI 서비스에 붙여 넣거나 API로 보내는 것도 제3자 공유에 해당해 금지**된다고 밝혔습니다([공지](https://physionet.org/news/post/gpt-responsible-use)). 이 과정 README는 막히면 AI 도구에 질문하라고 권하지만, **원본 MIMIC의 값이나 표 내용은 절대 붙여 넣지 않습니다.** 질문할 때는 오류 메시지와 가상 데이터만 씁니다.

### 비식별화가 바꿔 놓은 것들

MIMIC-IV는 미국 HIPAA의 Safe Harbor 조항이 열거한 보호 대상 건강정보(PHI)를 제거하는 방식으로 비식별화되었다고 데모 페이지에 적혀 있습니다. 분석하는 사람이 알아야 할 결과는 세 가지입니다.

1. **날짜가 환자마다 다르게 미래로 옮겨져 있다.** 그래서 2150년 같은 연도가 보입니다. 한 환자 안에서의 간격(재원 기간, 투약 후 몇 시간)은 그대로지만, 서로 다른 환자의 날짜를 달력처럼 비교하거나 요일·계절 효과를 볼 수는 없습니다. 대략의 시기는 `patients.anchor_year_group`(3년 단위 구간)으로만 알 수 있습니다.
2. **나이는 기준 연도의 나이(`anchor_age`)로 주어지고, 고령은 한 값으로 묶인다.** [patients 표 문서](https://mimic.mit.edu/docs/iv/modules/hosp/patients)에 따르면 기준 연도에 89세를 넘은 환자는 실제 나이와 상관없이 91로 기록됩니다. 그래서 "91세"는 나이가 아니라 "90세 이상" 범주로 다뤄야 합니다. 입원 시 나이는 `anchor_age`에 (입원 연도 − `anchor_year`)를 더해 근사합니다.
3. **식별자는 무작위로 다시 매겨졌다.** 번호 순서에 의미가 없습니다.

비식별화되었다고 위험이 0이 되는 것은 아닙니다. 아주 드문 질환 + 좁은 나이대 + 짧은 기간처럼 조건을 겹치면 몇 명만 남는 칸이 생길 수 있습니다. 그래서 결과 표를 밖에 낼 때 작은 칸을 가리는 습관이 필요합니다(Day E7).

## 예시로 이해하기

### 예시 1 — 세 겹의 열쇠로 안전하게 합치기

MIMIC-IV와 같은 열 이름을 쓴 가상 표 세 개를 만들어 합칩니다.

```python
import sqlite3
import pandas as pd

patients = pd.DataFrame({
    "subject_id": [101, 102, 103, 104],
    "gender": ["F", "M", "F", "M"],
    "anchor_age": [67, 54, 81, 45],
})
admissions = pd.DataFrame({
    "subject_id": [101, 101, 102, 103, 104],
    "hadm_id":    [2001, 2002, 2003, 2004, 2005],
    "admittime": pd.to_datetime(["2150-01-03", "2150-06-20", "2151-03-11",
                                 "2149-11-30", "2152-08-02"]),
})
icustays = pd.DataFrame({
    "subject_id": [101, 101, 101, 102, 103],
    "hadm_id":    [2001, 2001, 2002, 2003, 2004],
    "stay_id":    [3001, 3002, 3003, 3004, 3005],
    "intime": pd.to_datetime(["2150-01-04 02:00", "2150-01-09 15:00", "2150-06-21 08:00",
                              "2151-03-11 20:00", "2149-12-01 06:00"]),
})
for name, df, key in [("patients", patients, "subject_id"),
                      ("admissions", admissions, "hadm_id"),
                      ("icustays", icustays, "stay_id")]:
    print(f"{name:10s} 행 {len(df)}개, 열쇠 {key} 중복 없음: {df[key].is_unique}")

stays = (icustays
         .merge(admissions[["hadm_id", "admittime"]], on="hadm_id", how="left", validate="many_to_one")
         .merge(patients, on="subject_id", how="left", validate="many_to_one"))
print(stays[["subject_id", "hadm_id", "stay_id", "intime", "anchor_age"]])
print("ICU 기록이 없는 환자:", sorted(set(patients.subject_id) - set(icustays.subject_id)))
```

출력:

```text
patients   행 4개, 열쇠 subject_id 중복 없음: True
admissions 행 5개, 열쇠 hadm_id 중복 없음: True
icustays   행 5개, 열쇠 stay_id 중복 없음: True
   subject_id  hadm_id  stay_id              intime  anchor_age
0         101     2001     3001 2150-01-04 02:00:00          67
1         101     2001     3002 2150-01-09 15:00:00          67
2         101     2002     3003 2150-06-21 08:00:00          67
3         102     2003     3004 2151-03-11 20:00:00          54
4         103     2004     3005 2149-12-01 06:00:00          81
ICU 기록이 없는 환자: [104]
```

`validate="many_to_one"`은 "왼쪽 여러 행이 오른쪽 한 행에 붙는다"는 약속입니다. 오른쪽 열쇠가 중복이면 pandas가 오류를 내서 조용히 행이 불어나는 사고를 막아 줍니다. 101번 환자는 한 입원(2001) 안에서 ICU에 두 번 들어갔고(3001, 3002), 다른 입원에서 한 번 더 들어갔습니다. "환자 한 명 = 한 행"이라고 착각하면 이 사람을 세 번 세게 됩니다. 104번은 입원은 했지만 ICU에는 가지 않았습니다. ICU 코호트에서는 빠지는 것이 맞지만, "입원 환자 전체"를 묻는 질문이라면 `how="left"`를 어느 쪽에 두느냐로 이 사람이 살거나 사라집니다.

### 예시 2 — SQL 창 함수와 pandas로 "환자별 첫 ICU 입실" 고르기

같은 노트북에서 예시 1 바로 다음 셀에 실행합니다. `sqlite3`는 Python에 기본으로 들어 있어 따로 설치할 것이 없습니다.

```python
con = sqlite3.connect(":memory:")
icustays.assign(intime=icustays.intime.astype(str)).to_sql("icustays", con, index=False)
q = """
WITH ranked AS (
  SELECT subject_id, stay_id, intime,
         RANK() OVER (PARTITION BY subject_id ORDER BY intime) AS stay_rank
  FROM icustays
)
SELECT subject_id, stay_id, intime FROM ranked WHERE stay_rank = 1 ORDER BY subject_id;
"""
first_sql = pd.read_sql(q, con)
print(first_sql)
first_pd = icustays.sort_values("intime").groupby("subject_id").head(1).sort_values("subject_id")
print("pandas 결과와 같은가:", first_sql["stay_id"].tolist() == first_pd["stay_id"].tolist())
```

출력:

```text
   subject_id  stay_id               intime
0         101     3001  2150-01-04 02:00:00
1         102     3004  2151-03-11 20:00:00
2         103     3005  2149-12-01 06:00:00
pandas 결과와 같은가: True
```

`PARTITION BY subject_id`는 "사람마다 따로", `ORDER BY intime`은 "입실 시각 순으로", `RANK()`는 "순번을 매겨라"입니다. `WITH ... AS`는 긴 쿼리를 이름 붙은 중간 단계로 나누는 문법이라, 순번 매기기와 거르기를 두 단계로 읽을 수 있게 해 줍니다. 원본 MIMIC-IV는 크기 때문에 BigQuery나 PostgreSQL에서 SQL로 다루는 일이 많고, 데모는 pandas로도 충분합니다. 같은 일을 두 방법으로 해서 결과를 맞춰 보는 것은 좋은 검산입니다.

같은 사람의 여러 입실을 독립 표본처럼 쓰면 Day 31·33에서 본 반복 측정 문제가 그대로 생깁니다. "첫 입실만"은 가장 흔한 해결책이지만 유일한 해결책은 아닙니다. 어느 쪽을 골랐는지 보고서에 적습니다.

### 예시 3 — 날짜 이동은 간격을 보존한다

비식별화의 날짜 이동을 흉내 냅니다(이동량은 가상의 값입니다).

```python
import pandas as pd

true_dates = pd.DataFrame({
    "subject_id": [101, 101, 102],
    "event": ["입원", "퇴원", "입원"],
    "real_time": pd.to_datetime(["2019-02-01 10:00", "2019-02-09 16:00", "2020-07-15 09:00"]),
})
shift_years = {101: 131, 102: 130}           # 환자마다 다른 무작위 이동(가상의 값)
true_dates["shifted"] = true_dates.apply(
    lambda r: r.real_time + pd.DateOffset(years=shift_years[r.subject_id]), axis=1)
p101 = true_dates[true_dates.subject_id == 101]
print(true_dates)
print("101번 환자 재원 기간(실제):", p101.real_time.iloc[1] - p101.real_time.iloc[0])
print("101번 환자 재원 기간(이동 후):", p101.shifted.iloc[1] - p101.shifted.iloc[0])
```

출력:

```text
   subject_id event           real_time             shifted
0         101    입원 2019-02-01 10:00:00 2150-02-01 10:00:00
1         101    퇴원 2019-02-09 16:00:00 2150-02-09 16:00:00
2         102    입원 2020-07-15 09:00:00 2150-07-15 09:00:00
101번 환자 재원 기간(실제): 8 days 06:00:00
101번 환자 재원 기간(이동 후): 8 days 06:00:00
```

한 환자 안의 간격(8일 6시간)은 그대로입니다. 그런데 이동 후 102번의 입원은 101번보다 몇 달 뒤로 보이지만, 실제로는 1년 넘게 뒤였습니다. 이동된 날짜로 "2150년 여름에 입원이 몰렸다"고 말하는 것은 의미가 없습니다. 실제 데이터에서는 이동 방식이 이 예시와 다를 수 있으니(요일·계절까지 지우도록 설계됨) 문서를 확인하세요.

## 직접 해보기

1. `notebooks/advanced/E/E2_tables_and_access.ipynb`를 만들고 예시 1–3을 실행합니다.
2. 일부러 사고를 내 봅니다. 예시 1의 `admissions`에서 `hadm_id` 2003을 2002로 바꿔(중복 열쇠) 다시 실행하면 `merge`가 어떤 오류를 내는지 읽고, 오류 메시지의 핵심 단어를 노트에 적습니다. 원래대로 돌려놓습니다.
3. (선택, 데모 데이터) [MIMIC-IV Clinical Database Demo v2.2](https://physionet.org/content/mimic-iv-demo/2.2/) 페이지 아래 Files에서 ZIP을 내려받아 **저장소 밖**의 폴더(또는 `.gitignore`에 넣은 `data/` 아래)에 풉니다. 라이선스(`LICENSE.txt`)를 읽고, `SHA256SUMS.txt`로 파일이 온전한지 확인합니다.

   ```python
   import hashlib
   from pathlib import Path

   root = Path("../../../data/mimic_iv_demo/mimic-iv-clinical-database-demo-2.2")   # 내가 푼 위치로 바꾼다
   bad = 0
   for line in (root / "SHA256SUMS.txt").read_text().splitlines():
       h, name = line.split(maxsplit=1)
       if hashlib.sha256((root / name).read_bytes()).hexdigest() != h:
           print("불일치:", name); bad += 1
   print("검사한 파일 수:", len(open(root / "SHA256SUMS.txt").readlines()), "| 불일치:", bad)
   ```

4. (선택, 계속) 데모의 세 표로 예시 1과 같은 검사를 합니다. **출력은 열 이름과 True/False만** 확인하고, 환자별 값은 노트북 밖으로 옮기지 않습니다.

   ```python
   import pandas as pd

   patients = pd.read_csv(root / "hosp" / "patients.csv.gz")
   admissions = pd.read_csv(root / "hosp" / "admissions.csv.gz", parse_dates=["admittime", "dischtime"])
   icustays = pd.read_csv(root / "icu" / "icustays.csv.gz", parse_dates=["intime", "outtime"])
   for name, df in [("patients", patients), ("admissions", admissions), ("icustays", icustays)]:
       print(name, "| 열:", ", ".join(df.columns[:8]), "...")
   print("subject_id 유일:", patients.subject_id.is_unique,
         "| hadm_id 유일:", admissions.hadm_id.is_unique, "| stay_id 유일:", icustays.stay_id.is_unique)
   stays = icustays.merge(admissions[["hadm_id", "admittime"]], on="hadm_id", how="left", validate="many_to_one")
   print("ICU 입실 시각이 입원 시각보다 앞선 행:", int((stays.intime < stays.admittime).sum()))
   first = icustays.sort_values("intime").groupby("subject_id").head(1)
   print("첫 ICU 입실만 남기면 행 수가 줄었는가:", len(first) < len(icustays))
   ```

   데모 v2.2로 실행해 보면 열 이름은 아래처럼 나오고, 세 열쇠는 모두 유일했습니다. "ICU 입실이 입원보다 앞선 행"이 0이 아닐 수도 있는데, 응급실을 거쳐 온 경우처럼 시각 기록의 정의 차이일 수 있습니다. 숫자를 해석하기 전에 [MIMIC-IV 문서](https://mimic.mit.edu/docs/iv/)에서 각 시각 열의 뜻을 찾아 노트에 적으세요.

   ```text
   patients | 열: subject_id, gender, anchor_age, anchor_year, anchor_year_group, dod ...
   admissions | 열: subject_id, hadm_id, admittime, dischtime, deathtime, admission_type, admit_provider_id, admission_location ...
   icustays | 열: subject_id, hadm_id, stay_id, first_careunit, last_careunit, intime, outtime, los ...
   subject_id 유일: True | hadm_id 유일: True | stay_id 유일: True
   ```

5. `data/README.md` 양식에 데모 데이터의 이름, 버전(2.2), DOI, 라이선스(ODbL v1.0), 내려받은 날짜, 체크섬 확인 여부를 한 줄로 적습니다. 데이터 파일 자체는 commit하지 않습니다(`git status`로 확인).
6. 노트에 "원본 MIMIC-IV를 쓰려면 필요한 세 가지"(자격 심사, CITI 교육, DUA)와 "절대 하지 않을 것 두 가지"(재식별 시도, 온라인 AI 서비스에 데이터 붙여 넣기)를 적고 commit합니다.

⚠️ **흔한 오류 1 — `MergeError: Merge keys are not unique in right dataset`**
`validate=`가 제 할 일을 한 것입니다. 오른쪽 표에 같은 열쇠가 여러 번 있다는 뜻이니, 열쇠를 더 구체적으로(예: `subject_id`만이 아니라 `hadm_id`까지) 쓰거나, 오른쪽 표를 먼저 한 행씩으로 요약한 뒤 합칩니다.

⚠️ **흔한 오류 2 — 데이터 폴더를 실수로 commit한다**
`git status`에 `.csv.gz`가 보이면 commit하지 마세요. 공개 데모라도 이 저장소는 데이터를 넣지 않는 규칙이고, 원본 MIMIC이라면 계약 위반입니다. 데이터 폴더 이름을 `.gitignore`에 추가합니다.

## 퀴즈

**1.** (객관식) 검사 결과를 입원 단위로 붙이려 합니다. 가장 안전한 열쇠는?
① `subject_id`만 ② `hadm_id` ③ `itemid` ④ 행 번호

<details><summary>정답 보기</summary>

② `hadm_id`. 같은 사람이 여러 번 입원할 수 있으므로 `subject_id`만 쓰면 다른 입원의 검사가 섞입니다. `itemid`는 검사 종류를 가리키는 번호이고, 행 번호는 의미가 없습니다.

</details>

**2.** (단답) 예시 2의 SQL에서 `PARTITION BY subject_id`를 빼면 결과가 어떻게 바뀔까요?

<details><summary>정답 보기</summary>

모든 입실이 한 줄로 순번이 매겨져, 전체에서 가장 이른 입실 한 건만 `stay_rank = 1`로 남습니다. "사람마다 첫 입실"이 아니라 "전체에서 첫 입실"이 됩니다.

</details>

**3.** (객관식) MIMIC 계열의 날짜 이동 때문에 할 수 **없는** 분석은?
① 입원 후 ICU 입실까지 걸린 시간
② 한 환자의 재원 기간
③ 실제 요일에 따른 입원 수 비교
④ 투약 후 6시간 안의 검사값 찾기

<details><summary>정답 보기</summary>

③. 날짜 이동은 한 환자 안의 간격을 보존하지만 실제 달력 정보(연도, 계절, 요일)는 지웁니다. ①②④는 모두 한 환자 안의 간격이라 가능합니다.

</details>

**4.** (단답) 원본 MIMIC-IV에 접근하려면 무엇이 필요한가요? (2026년 11월 PhysioNet 페이지 기준 세 가지)

<details><summary>정답 보기</summary>

PhysioNet 자격 심사(credentialed user), 필수 교육(CITI "Data or Specimens Only Research") 이수, 데이터 사용 계약(PhysioNet Credentialed Health Data Use Agreement) 서명입니다. 데모는 이 절차 없이 ODbL 라이선스 조건만 지키면 됩니다.

</details>

**5.** (객관식) 원본 MIMIC-IV를 분석하다 오류가 났습니다. 해도 되는 것은?
① 표 일부를 온라인 챗봇에 붙여 넣고 질문한다
② 계정을 동료와 같이 쓴다
③ 오류 메시지와, 같은 구조로 직접 만든 가상 데이터만으로 질문한다
④ 드문 환자 한 명의 기록을 예시로 발표 자료에 넣는다

<details><summary>정답 보기</summary>

③. ①은 PhysioNet이 제3자 공유로 보고 금지한 행위이고, ②는 접근 공유 금지 조항 위반이며, ④는 식별 가능성을 높입니다. 가상 데이터로 문제를 재현해 질문하는 것은 디버깅에도 더 좋습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3이 노트북에서 실행되고, 일부러 낸 `MergeError`의 뜻을 적었다.
- [ ] (선택) 데모를 내려받아 체크섬과 열쇠 유일성을 확인했고, 데이터 파일은 commit하지 않았다.
- [ ] `data/README.md`에 데모의 이름·버전·DOI·라이선스·날짜를 적었다.
- [ ] 원본 접근 요건 세 가지와 금지 행위 두 가지를 노트에 적었다.
- [ ] `learning-log.md` 기록과 commit을 남겼다.

## 더 읽을거리
- MIT Critical Data. *Secondary Analysis of Electronic Health Records*. Springer, 2016 (CC BY-NC 4.0). [NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK543630/) · [Springer](https://doi.org/10.1007/978-3-319-43742-2). 2장(임상 데이터베이스 개관), 5장(MIMIC의 역사), 11장(데이터 준비와 SQL)이 오늘 내용과 이어진다. 책은 MIMIC-II/III 시절(2016) 기준이라 표 이름과 접근 절차가 지금과 다르다.
- Johnson AEW et al. MIMIC-IV, a freely accessible electronic health record dataset. *Scientific Data* 2023. doi:[10.1038/s41597-022-01899-x](https://doi.org/10.1038/s41597-022-01899-x) (PMID 36596836)
- Johnson AEW, Bulgarelli L, Pollard T, Horng S, Celi LA, Mark R. MIMIC-IV Clinical Database Demo (version 2.2). PhysioNet 2023. doi:[10.13026/dp1f-ex47](https://doi.org/10.13026/dp1f-ex47)

---
[← 이전](day-E1.md) · [코스 지도](../../../README.md) · [다음 →](day-E3.md)
