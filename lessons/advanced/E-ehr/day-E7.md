# Day E7 — 재현성과 보고: 코드 공개, 흐름도, STROBE·RECORD·TRIPOD

> **주차:** 심화 파트 E — EHR 2차 분석 · **예상 시간:** 75–90분 · **산출물:** `reports/advanced/E/E7_protocol_and_reporting.md` (분석 계획서 + 보고 점검표), `reports/advanced/E/run_record.json`
>
> **먼저 끝내 둘 레슨:** Day E1–E6, Day 38 (재현성), Day 40 (과학적 글쓰기와 윤리).

## 오늘의 목표
- EHR 분석의 "영수증"(데이터 버전, 코드 버전, 환경, seed, 코호트 흐름)을 코드로 남기고, 흐름의 앞뒤가 맞는지 자동으로 검사할 수 있다.
- 결과 표를 밖에 내보내기 전에 작은 칸을 가리고, 가린 칸이 다른 칸으로 역산되지 않는지 확인할 수 있다.
- 내 연구 종류에 맞는 보고 지침(관찰 연구 STROBE, 일상 수집 자료 RECORD, 예측 모델 TRIPOD/TRIPOD+AI)을 고르고, 원고에 필요한 항목이 빠졌는지 점검할 수 있다.

## 🎬 영상으로 먼저 보기

- [Key Steps and Common Pitfalls in Clinical Prediction Model Research — Richard_D_Riley](https://www.youtube.com/watch?v=eM7K8NKATB0) (5:00)
- **무엇에 주목할까:** 예측 모델 연구의 단계마다 "흔히 빠뜨리는 것"이 무엇인지 들으세요. Day E6에서 한 보정과 검증이 보고 단계에서 어떻게 드러나야 하는지 연결됩니다.

## 개념 설명

### EHR 분석의 재현성은 "같은 사람을 다시 고를 수 있는가"에서 시작한다

Day 38에서 재현성을 실험 노트의 "재료 및 방법"에 비유했습니다. EHR 연구에서 재료는 데이터베이스의 특정 **버전**이고, 방법의 절반은 **코호트를 고르는 코드**입니다. 같은 MIMIC이라도 버전이 다르면 표 구조와 환자 수가 다르고, "패혈증"을 찾는 코드 목록이 조금만 달라도 다른 사람들이 잡힙니다. 그래서 EHR 연구의 재현성 단위는 다음 다섯 가지입니다.

1. **데이터 출처와 버전:** 이름, 버전 번호, DOI, 접근한 날짜.
2. **코호트 정의 코드:** 포함·제외 기준과 그 순서(Day E3), 노출·결과를 찾은 코드 목록(진단 코드, `itemid`, 약 이름 목록).
3. **정제 규칙:** 단위 통일, 불가능 범위, 결측 처리(Day E4의 기록표).
4. **분석 코드와 환경:** 커밋 해시, 패키지 버전, seed.
5. **흐름 수치:** 단계마다 남은 수. 다른 사람이 코드를 돌렸을 때 가장 먼저 맞춰 볼 숫자입니다.

원본 데이터를 공유할 수 없는 자격 심사형 데이터에서는 **코드를 공유하는 것이 재현성의 거의 전부**입니다. PhysioNet의 자격 심사형 데이터 라이선스는 출판물과 관련된 코드를 공개 저장소에 올리도록 요구하고, MIMIC 커뮤니티는 개념 정의(SOFA 점수, 패혈증 정의 등)를 공유하는 [mimic-code 저장소](https://github.com/MIT-LCP/mimic-code)를 운영합니다. 바퀴를 새로 만들기 전에 그곳의 정의를 먼저 확인하고, 썼다면 인용합니다.

### 결과를 밖에 낼 때: 작은 칸과 역산

비식별화된 데이터라도 결과 표의 **작은 칸**은 재식별 위험을 키웁니다. "신경과 ICU, 90세 이상, 특정 진단" 칸에 3명이 있다고 발표하면, 그 3명을 아는 사람에게는 정보가 됩니다. 그래서 많은 기관과 데이터 사용 계약이 일정 수 미만의 칸을 가리도록 요구합니다. **기준값(몇 명 미만인가)은 데이터·기관·계약마다 다르므로** 반드시 자기 계약과 IRB 규정을 확인합니다. 이 레슨의 10은 예시입니다.

가리는 것만으로 끝나지 않습니다. 행 합계나 열 합계가 함께 공개되면 가린 칸을 빼기로 되살릴 수 있습니다. 그래서 필요하면 다른 칸 하나를 더 가리거나(보완 가림, complementary suppression), 합계를 범주로 묶어 보고합니다.

### 보고 지침: 무엇을 썼는지가 아니라 무엇을 빠뜨렸는지 보는 도구

보고 지침은 "좋은 연구를 하는 법"이 아니라 "독자가 연구를 평가할 수 있도록 무엇을 적어야 하는가"의 목록입니다. EHR 연구에서 자주 쓰는 셋은 다음과 같습니다. 모두 [EQUATOR Network](https://www.equator-network.org/)에서 원문과 점검표를 찾을 수 있습니다.

| 지침 | 대상 | EHR 연구에서 특히 보는 것 |
|---|---|---|
| [STROBE](https://www.strobe-statement.org/) | 관찰 연구(코호트, 환자-대조군, 단면) 전반 | 대상 선정, 변수 정의, 편향 대책, 결측 처리, 흐름도 |
| [RECORD](https://www.record-statement.org/) | 일상적으로 수집된 건강 자료(EHR, 청구 자료, 등록부)를 쓴 관찰 연구. STROBE의 확장 | 사용한 코드 목록과 알고리즘, 그 검증, 데이터 연결(linkage) 방법, 정제 과정, 데이터 접근 방식 |
| [TRIPOD](https://www.tripod-statement.org/) / TRIPOD+AI | 진단·예후 예측 모델의 개발·검증. TRIPOD+AI(2024)는 기계학습 모델까지 포함 | 예측 시점, 결측 처리, 판별과 보정, 검증 방식(내부·시간적·외부) |

약물역학 연구에는 RECORD의 확장판인 RECORD-PE도 있습니다. 지침의 항목 문구는 원문을 직접 읽고, 원고의 어느 줄에서 그 항목을 다뤘는지 점검표에 쪽·줄을 적는 방식으로 씁니다. 이 레슨의 예시 3은 그 과정을 흉내 낸 **간이 점검**이며, 공식 점검표를 대신하지 않습니다.

### 분석 계획을 먼저 공개하기

EHR 연구는 데이터가 이미 있어서 "돌려 보고 정하기"의 유혹이 큽니다. 결과를 보기 전에 연구 질문, 코호트 정의, 주 결과, 주 분석, 민감도 분석을 적은 **분석 계획서(protocol)** 를 날짜와 함께 남기면(저장소 commit도 날짜 기록입니다), 나중에 계획과 달라진 부분을 정직하게 보고할 수 있습니다. 탐색적으로 바꾼 분석은 "사후 분석"으로 구분해 적습니다. 이것이 이 과정 내내 지킨 "탐색과 확증 구분" 원칙의 EHR판입니다.

## 예시로 이해하기

### 예시 1 — 분석 영수증을 코드로 남기기

```python
import json
import platform
import numpy as np
import pandas as pd
import sklearn
import statsmodels

run_record = {
    "data_source": "MIMIC-IV Clinical Database Demo",
    "data_version": "2.2",
    "data_doi": "10.13026/dp1f-ex47",
    "cohort_definition_file": "cohort_definition.md",
    "random_seed": 2026,
    "python": platform.python_version(),
    "packages": {"numpy": np.__version__, "pandas": pd.__version__,
                 "scikit-learn": sklearn.__version__, "statsmodels": statsmodels.__version__},
    "cohort_flow": {"전체 ICU 입실": 5000, "18세 이상": 4793, "첫 입실만": 2717,
                    "24시간 이상": 2218, "입실 전 투약 중 제외": 1970},
}
steps = list(run_record["cohort_flow"].items())
for (a, na), (b, nb) in zip(steps, steps[1:]):
    assert nb <= na, f"'{b}' 단계에서 사람이 늘었다 -- 정의를 확인하자"
with open("run_record.json", "w", encoding="utf-8") as f:
    json.dump(run_record, f, ensure_ascii=False, indent=2)
print(json.dumps(run_record["packages"]), "| 흐름 단계 수:", len(steps))
```

출력(패키지 버전은 환경마다 다릅니다):

```text
{"numpy": "2.3.5", "pandas": "2.3.3", "scikit-learn": "1.7.2", "statsmodels": "0.14.5"} | 흐름 단계 수: 5
```

`assert`는 "이 조건이 거짓이면 멈춰라"는 명령입니다. 제외 단계에서 사람이 늘어나는 것은 merge가 행을 불렸다는 신호(Day E2)이므로, 흐름 수치를 기록하는 순간 자동으로 검사하게 해 둡니다. 이 파일을 결과와 함께 commit하면 "어떤 데이터, 어떤 환경, 어떤 코호트에서 나온 숫자인가"를 언제든 되짚을 수 있습니다. 데이터 자체는 넣지 않고, 데이터의 **이름표**만 넣습니다.

### 예시 2 — 작은 칸 가리기

```python
import pandas as pd

tab = pd.DataFrame({"unit": ["MICU", "SICU", "CCU", "Neuro"],
                    "n": [812, 455, 301, 7], "deaths": [97, 41, 30, 3]})
THRESHOLD = 10          # 예시 값. 실제 기준은 자기 데이터 사용 계약·IRB·기관 규칙을 따른다
def suppress(t, cols, k=THRESHOLD):
    out = t.astype(object).copy()
    for c in cols:
        out.loc[t[c] < k, c] = f"<{k}"
    return out
print(suppress(tab, ["n", "deaths"]).to_string(index=False))
```

출력:

```text
 unit   n deaths
 MICU 812     97
 SICU 455     41
  CCU 301     30
Neuro <10    <10
```

신경계 ICU 행이 가려졌습니다. 그런데 이 표 아래에 "전체 1,575명, 사망 171명"이라는 합계를 함께 적으면, 독자는 1,575 − 812 − 455 − 301 = 7, 171 − 97 − 41 − 30 = 3으로 가린 칸을 그대로 되살립니다. 합계를 낼 거라면 다른 작은 행과 묶어 "기타 병동"으로 보고하거나, 보완 가림을 합니다.

### 예시 3 — 원고 간이 점검

```python
report = """
## 방법
데이터: MIMIC-IV Clinical Database Demo v2.2 (doi 10.13026/dp1f-ex47).
코호트: 18세 이상, 첫 ICU 입실, index time = ICU 입실 시각.
결측: 젖산 결측 비율을 군별로 보고하고 다중 대치를 민감도 분석으로 수행.
코드: 저장소 주소와 커밋 해시를 부록에 기재.
"""
checks = {
    "데이터 출처와 버전": ["v2.2", "version", "버전"],
    "코호트 선택 기준": ["코호트", "포함", "제외"],
    "index time 정의": ["index time"],
    "노출/결과를 찾은 코드 목록": ["ICD", "itemid", "코드 목록"],
    "결측 처리": ["결측"],
    "민감도 분석": ["민감도"],
    "코드 공개": ["커밋", "저장소"],
}
for item, keys in checks.items():
    ok = any(k in report for k in keys)
    print(("✓ " if ok else "✗ 빠짐: ") + item)
```

출력:

```text
✓ 데이터 출처와 버전
✓ 코호트 선택 기준
✓ index time 정의
✗ 빠짐: 노출/결과를 찾은 코드 목록
✓ 결측 처리
✓ 민감도 분석
✓ 코드 공개
```

원고 초안에 노출·결과를 어떤 코드(진단 코드, `itemid`)로 찾았는지가 빠졌습니다. RECORD가 특히 강조하는 항목이고, EHR 연구를 재현할 수 없게 만드는 가장 흔한 누락입니다. 단어 찾기는 "단어가 있는가"만 보므로, ✓가 나와도 내용이 충분한지는 사람이 읽고 판단합니다.

## 직접 해보기

1. `notebooks/advanced/E/E7_reporting.ipynb`에서 예시 1–3을 실행합니다. 예시 1의 `run_record.json`은 `reports/advanced/E/`에 저장되도록 경로를 바꿉니다.
2. 예시 1의 `cohort_flow`에서 마지막 단계 숫자를 일부러 2,300으로 바꿔 `assert`가 멈추는 것을 확인하고 되돌립니다. 그다음 `cohort_flow`를 Day E3 직접 해보기 5에서 만든 **내 코호트의 흐름표**로 고칩니다.
3. 예시 2에 "전체" 행을 추가했을 때 역산이 가능해지는 것을 확인하고, 신경계 ICU를 다른 작은 행과 묶어 "기타"로 보고하는 버전을 만듭니다.
4. 내 연구 종류에 맞는 지침을 고릅니다(비교 효과·기술 연구라면 STROBE + RECORD, 예측 모델이라면 TRIPOD+AI). EQUATOR Network에서 공식 점검표를 열고, 항목 번호와 "내 계획서의 어느 절에서 다루는가"를 표로 만듭니다(항목 문구는 옮겨 적지 말고 번호와 내 말로 된 짧은 요약만 씁니다).
5. `reports/advanced/E/E7_protocol_and_reporting.md`를 완성합니다. Day E1–E6의 산출물을 묶는 분석 계획서입니다.
   - 연구 질문(E1), 데이터 출처·버전·접근 조건(E2), 코호트 정의와 흐름표(E3), 정제 규칙(E4), 주 분석·추정 대상·민감도 분석(E5), (예측이라면) 검증 계획과 누수 점검표(E6)
   - 작성 날짜, 그리고 "이 계획서 이후에 바뀐 부분은 사후 분석으로 표시한다"는 문장
   - 보고 지침 점검표(4번)
   - 한계 절: 측정하지 못한 교란, 한 기관 자료의 일반화 한계, 날짜 이동으로 할 수 없는 분석
6. 저장소를 commit하기 전에 `git status`로 데이터 파일(`.csv`, `.csv.gz`)이 없는지 확인합니다. `learning-log.md`에 심화 파트 E를 마친 소감 한 줄을 적고 commit합니다.

⚠️ **흔한 오류 1 — `AssertionError`가 났는데 `assert` 줄을 지운다**
assert는 알람입니다. 지우지 말고 원인을 찾습니다. 대개 merge가 행을 불렸거나(중복 열쇠), 거르기 순서가 바뀌었거나, 이전 셀의 결과를 다시 쓰고 있는 경우입니다. 노트북을 Run All로 처음부터 다시 실행해 보세요.

⚠️ **흔한 오류 2 — 보고 지침 문장을 그대로 붙여 넣는다**
지침 원문은 저작물이고, 붙여 넣는다고 항목을 다룬 것이 되지도 않습니다. 점검표에는 항목 번호와 "내 원고의 어디"만 적고, 원고 본문은 내 연구의 구체적인 내용으로 씁니다.

## 퀴즈

**1.** (객관식) 원본 데이터를 공유할 수 없는 자격 심사형 EHR 연구에서 재현성을 가장 크게 높이는 것은?
① 결과 표를 더 많이 싣는다
② 데이터 버전과 함께 코호트 정의·정제·분석 코드를 공개 저장소에 올린다
③ p-value를 소수점 넷째 자리까지 쓴다
④ 원본 데이터 일부를 부록에 싣는다

<details><summary>정답 보기</summary>

②. 데이터에 접근 자격이 있는 다른 연구자는 같은 버전과 같은 코드로 같은 코호트를 다시 만들 수 있습니다. ④는 데이터 사용 계약 위반입니다. PhysioNet 자격 심사형 라이선스는 출판물 관련 코드의 공개도 요구합니다.

</details>

**2.** (단답) 예시 2에서 작은 칸을 가렸는데도 합계를 같이 내면 왜 문제가 되나요?

<details><summary>정답 보기</summary>

합계에서 공개된 칸들을 빼면 가린 칸의 값을 정확히 되살릴 수 있기 때문입니다. 작은 범주를 묶거나 보완 가림을 해서 역산을 막습니다.

</details>

**3.** (객관식) EHR 자료로 입원 사망 예측 모델을 만들어 시간적 검증을 했습니다. 가장 먼저 볼 보고 지침은?
① STROBE ② RECORD ③ TRIPOD(+AI) ④ 어떤 지침도 해당하지 않는다

<details><summary>정답 보기</summary>

③. 예측 모델의 개발·검증 보고 지침은 TRIPOD이고, 기계학습 모델까지 포함한 개정판이 TRIPOD+AI(2024)입니다. EHR 자료라는 점 때문에 RECORD의 데이터 관련 항목(코드 목록, 연결, 정제)을 함께 참고하면 좋습니다.

</details>

**4.** (단답) RECORD가 STROBE에 추가로 강조하는 항목 두 가지를 말해 보세요.

<details><summary>정답 보기</summary>

예: (1) 대상·노출·결과를 찾는 데 쓴 코드 목록과 알고리즘, 그리고 그 검증, (2) 여러 데이터의 연결(linkage) 방법, (3) 데이터 정제 과정, (4) 연구자가 데이터에 어떻게 접근했는가(전체 데이터인지, 일부인지). 이 중 두 가지면 정답입니다. 일상 수집 자료는 연구용으로 설계되지 않았기 때문에 "어떻게 연구 변수로 바꿨는가"를 보고해야 한다는 것이 공통된 이유입니다.

</details>

**5.** (객관식) 분석 도중 주 결과를 28일 사망에서 90일 사망으로 바꿨더니 결과가 유의해졌습니다. 올바른 보고는?
① 90일 사망을 처음부터 주 결과였던 것처럼 쓴다
② 계획서의 주 결과(28일)를 그대로 보고하고, 90일 결과는 사후 분석으로 구분해 바꾼 이유와 함께 보고한다
③ 28일 결과는 생략한다
④ 두 결과의 p-value를 평균 낸다

<details><summary>정답 보기</summary>

②. 계획서와 다른 분석을 했다면 숨기지 않고 사후 분석으로 표시합니다. ①③은 결과를 보고 고른 분석을 확증처럼 보이게 하는 선택적 보고이고, 이 과정의 "탐색과 확증 구분" 원칙에 어긋납니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–3이 실행되고 `reports/advanced/E/run_record.json`이 저장되어 있다.
- [ ] `assert`가 흐름 오류를 잡는 것을 확인했고, 내 흐름표로 바꿨다.
- [ ] 역산이 가능한 표와 막은 표를 둘 다 만들어 봤다.
- [ ] `reports/advanced/E/E7_protocol_and_reporting.md`에 계획서(E1–E6 통합), 작성 날짜, 보고 지침 점검표, 한계 절이 있다.
- [ ] `git status`에 데이터 파일이 없고, `learning-log.md` 기록과 commit을 남겼다.

## 더 읽을거리
- MIT Critical Data. *Secondary Analysis of Electronic Health Records*. Springer, 2016 (CC BY-NC 4.0). [NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK543630/) · [Springer](https://doi.org/10.1007/978-3-319-43742-2). 1장(연구 질 기준), 11장(재현성: 원자료를 고치지 않기, 버전 관리), 사례 연구 장들(18–29장)은 각자 공개 코드와 함께 읽도록 구성되어 있다. 24장(마르코프 모형과 비용-효과 분석)은 이 파트에서 다루지 않은 주제로, 관심 있으면 따로 읽는다.
- Benchimol EI et al. The REporting of studies Conducted using Observational Routinely-collected health Data (RECORD) statement. *PLoS Medicine* 2015. doi:[10.1371/journal.pmed.1001885](https://doi.org/10.1371/journal.pmed.1001885) (PMID 26440803)
- von Elm E et al. The Strengthening the Reporting of Observational Studies in Epidemiology (STROBE) statement. *BMJ* 2007. doi:[10.1136/bmj.39335.541782.AD](https://doi.org/10.1136/bmj.39335.541782.AD) (PMID 17947786)
- Collins GS et al. TRIPOD+AI statement: updated guidance for reporting clinical prediction models that use regression or machine learning methods. *BMJ* 2024. doi:[10.1136/bmj-2023-078378](https://doi.org/10.1136/bmj-2023-078378) (PMID 38626948)
- Langan SM et al. RECORD-PE: The reporting of studies conducted using observational routinely collected health data statement for pharmacoepidemiology. *BMJ* 2018. doi:[10.1136/bmj.k3532](https://doi.org/10.1136/bmj.k3532) (PMID 30429167)
- Johnson AEW et al. The MIMIC Code Repository: enabling reproducibility in critical care research. *JAMIA* 2018. doi:[10.1093/jamia/ocx084](https://doi.org/10.1093/jamia/ocx084) (PMID 29036464)

---
[← 이전](day-E6.md) · [코스 지도](../../../README.md) · [다음 →](../../../README.md)
