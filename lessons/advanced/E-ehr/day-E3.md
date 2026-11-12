# Day E3 — 코호트 정의: 포함·제외, index time, 그리고 불멸 시간 편향

> **주차:** 심화 파트 E — EHR 2차 분석 · **예상 시간:** 75–90분 · **산출물:** `reports/advanced/E/E3_cohort_definition.md` (코호트 정의서와 흐름표), `figures/advanced/E/E3_immortal_time.png`
>
> **먼저 끝내 둘 레슨:** Day E1, Day E2, Day 31 (교란변수).

## 오늘의 목표
- 포함·제외 기준을 단계별로 적용하고, 단계마다 남은 수와 빠진 수를 흐름표로 남길 수 있다.
- index time(추적 시작 시점)을 정하고, 기저값 창·노출 창·결과 창을 index time 기준으로 자를 수 있다.
- 불멸 시간 편향(immortal time bias)이 왜 생기는지 시뮬레이션으로 보이고, landmark 분석이나 사람-시간 분할로 고칠 수 있다.

## 🎬 영상으로 먼저 보기

- [Time-Based Biases | Understanding Medical Research — YaleCourses](https://www.youtube.com/watch?v=PgfAImPNVu4) (17:12)
- **무엇에 주목할까:** "치료군에 들어가려면 그때까지 살아 있어야 한다"는 한 문장이 어떻게 치료를 좋아 보이게 만드는지에 집중하세요. 예시 2의 시뮬레이션이 영상의 설명을 숫자로 재현합니다.

- [intuitive EPI - Immortal time bias — intuitive EPI](https://www.youtube.com/watch?v=iRO6DAi4u6Y) (8:28)
- **무엇에 주목할까:** 타임라인 그림에서 "불멸 시간"이 어느 칸에 잘못 배정되는지 보세요. 같은 시간을 노출 전 칸으로 옮기는 것이 해결책의 핵심입니다.

## 개념 설명

### 코호트는 "깔때기"로 만든다

코호트(cohort)는 질문에 답할 사람들의 명단입니다. EHR에서는 전체 기록에서 출발해 기준을 하나씩 적용하며 좁혀 갑니다. 이때 단계마다 **남은 사람 수**를 기록해 두면 세 가지 이점이 있습니다. 첫째, 어느 기준이 사람을 가장 많이 덜어 냈는지 보이고, 그 기준이 결과를 기울일지 따져 볼 수 있습니다. 둘째, 다른 사람이 같은 코드를 돌렸을 때 숫자가 맞는지 비교할 수 있습니다. 셋째, 보고 지침(Day E7)이 요구하는 흐름도(flow diagram)를 그대로 그릴 수 있습니다.

기준을 고를 때는 두 힘이 당깁니다. 기준을 좁히면(예: 특정 병동, 특정 질환만) 환자들이 비슷해져 교란이 줄지만, 결과를 다른 환자에게 넓혀 말하기 어려워집니다. 넓히면 그 반대입니다. 어느 쪽이 옳다기보다, 내 질문의 대상(Day E1의 첫 칸)에 맞춰 고르고 이유를 적는 것이 중요합니다.

흔히 쓰는 기준: 성인만, 환자별 첫 입실만(같은 사람이 여러 번 세어지는 것을 막음), 최소 체류 시간(관찰할 시간이 있어야 함), 질문과 맞지 않는 환자 제외(예: 이미 다른 이유로 같은 치료를 받던 사람). 마지막 기준은 **신규 사용자 설계(new-user design)** 라고 부릅니다. 이미 약을 쓰던 사람은 "약을 견뎌 낸 사람"이라 처음 시작하는 사람과 다르기 때문입니다.

### 노출을 기록에서 "찾는" 일: 표현형 정의와 충실도

"패혈증 환자", "섬망이 있던 환자"처럼 노출이나 대상이 기록에 한 칸으로 적혀 있는 경우는 드뭅니다. 진단 코드, 투약 기록, 검사값 문턱, 노트의 단어를 조합해 **알고리즘으로 정의**해야 하고, 이것을 표현형 정의(phenotyping)라고 부릅니다. 코드는 빠르지만 청구 목적이라 틀릴 수 있고, 노트는 정확할 수 있지만 자연어 처리(NLP)가 필요하며 "가족력"이나 "배제됨" 같은 부정 표현에 속기 쉽습니다. 여러 출처를 겹치면 놓치는 환자가 줄어듭니다.

어떤 정의를 쓰든 **충실도(fidelity)** 를 확인해야 합니다. 무작위로 뽑은 일부 환자(예: 수십–수백 명)의 차트를 임상가가 직접 읽어 "진짜 해당하는가"를 판정하고, 알고리즘 결과와 비교합니다. 정밀도(PPV, 알고리즘이 고른 사람 중 진짜 비율), 민감도(진짜 중 알고리즘이 찾은 비율), 두 판정자 사이나 알고리즘–판정자 사이의 일치도(Cohen's kappa)를 보고합니다. 주의할 점: 검토 표본을 알고리즘이 고른 사람 중에서만 뽑으면 민감도를 계산할 수 없습니다. 놓친 사람은 그 표본에 없기 때문입니다.

### index time: 시계의 0초를 어디에 둘까

**index time**은 각 환자의 추적이 시작되는 순간입니다. 기저 특성(나이, 중증도)은 index time **이전** 정보로, 결과는 **이후** 정보로 잽니다. 이 규칙이 무너지면 원인과 결과가 뒤섞입니다. 예를 들어 index time 이후 72시간의 크레아티닌 최댓값을 "기저 신기능"으로 쓰면, 치료가 콩팥에 준 영향이 기저값에 섞여 들어갑니다.

비교 효과 연구에서 index time의 이상적인 조건은 세 가지가 **같은 순간**에 겹치는 것입니다. 대상 자격을 갖춘 순간, 치료 전략이 갈리는 순간, 추적이 시작되는 순간. 이것이 **표적 시험 모사(target trial emulation)** 의 핵심 발상입니다. 실제로 하고 싶었던 무작위 시험의 설계(대상, 치료 전략, 배정 시점, 추적, 결과)를 먼저 종이에 적고, EHR로 그 시험을 최대한 흉내 내는 방식입니다(Hernán & Robins 2016).

### 불멸 시간 편향: 살아 있어야 치료군이 된다

"입원 중 한 번이라도 약 A를 받은 환자"와 "받지 않은 환자"의 사망률을 비교한다고 합시다. 약 A를 셋째 날 시작한 환자는 정의상 셋째 날까지 살아 있었습니다. 입원 첫날부터 셋째 날까지는 이 환자에게 **죽을 수 없는 시간(immortal time)** 입니다. 반면 둘째 날 사망한 환자는 약을 받을 기회가 없었으니 자동으로 비치료군에 들어갑니다. 결과적으로 비치료군에는 일찍 죽은 사람이 몰리고, 치료군은 실제보다 오래 산 것처럼 보입니다. 약이 아무 효과가 없어도 생깁니다.

고치는 방법은 모두 "노출 전의 시간을 비노출로 센다"는 같은 원리입니다.

- **landmark 분석:** 정해진 시점(예: 3일째)에 살아 있는 사람만 대상으로 하고, 그때까지의 노출로 군을 나눈 뒤 그 시점부터 추적합니다.
- **시간 의존 노출(time-varying exposure):** 한 사람의 시간을 "투약 전"과 "투약 후"로 쪼개 각각 비노출·노출 사람-시간으로 셉니다. Cox 모형의 시간 의존 공변량이 같은 일을 합니다.
- **표적 시험 모사의 복제-검열(clone–censor–weight):** 같은 환자를 두 전략에 모두 복제해 두고, 전략에서 벗어나는 순간 검열한 뒤 가중치로 보정합니다. 이름만 알아 두고, 필요할 때 더 읽을거리의 논문으로 갑니다.

## 예시로 이해하기

### 예시 1 — 포함·제외 흐름표

가상의 ICU 입실 5,000건에서 코호트를 좁힙니다.

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(3)
n = 5000
stays = pd.DataFrame({
    "subject_id": rng.integers(1, 3800, n),
    "age": rng.integers(15, 95, n),
    "intime": pd.Timestamp("2150-01-01") + pd.to_timedelta(rng.integers(0, 3 * 365 * 24, n), unit="h"),
    "los_hours": rng.gamma(2.0, 30, n).round(1),
    "on_drug_before_icu": rng.random(n) < 0.12,      # ICU 오기 전부터 이미 약을 쓰던 사람
})
flow = [("전체 ICU 입실", len(stays))]
c = stays[stays.age >= 18];                                   flow.append(("18세 이상", len(c)))
c = c.sort_values("intime").groupby("subject_id").head(1);    flow.append(("환자별 첫 ICU 입실만", len(c)))
c = c[c.los_hours >= 24];                                     flow.append(("ICU 24시간 이상 체류", len(c)))
c = c[~c.on_drug_before_icu];                                 flow.append(("입실 전부터 투약 중인 사람 제외", len(c)))
flow = pd.DataFrame(flow, columns=["단계", "남은 수"])
flow["빠진 수"] = (-flow["남은 수"].diff()).fillna(0).astype(int)
print(flow.to_string(index=False))
```

출력:

```text
                단계  남은 수  빠진 수
         전체 ICU 입실  5000     0
            18세 이상  4793   207
     환자별 첫 ICU 입실만  2717  2076
    ICU 24시간 이상 체류  2218   499
입실 전부터 투약 중인 사람 제외  1970   248
```

이 가상 자료에서는 "첫 입실만" 단계가 가장 많이 덜어 냈습니다. 같은 사람이 여러 번 들어온 기록이 많다는 뜻입니다. 실제 연구라면 여기서 질문해야 합니다. 재입실하는 사람은 더 아픈 사람일 가능성이 크고, 첫 입실만 남기면 결과를 그 사람들에게는 넓혀 말하기 어렵습니다. 순서도 중요합니다. "24시간 이상 체류"를 "첫 입실만"보다 먼저 적용하면, 첫 입실이 짧았던 사람의 둘째 입실이 남는 등 다른 코호트가 나옵니다. 순서를 정의서에 적어 둡니다.

### 예시 2 — 효과가 0인 약이 사람을 살리는 것처럼 보이는 과정

약이 사망에 전혀 영향을 주지 않도록 만든 가상 세계입니다. 사망 시점은 약과 무관하게 먼저 정해지고, 40%의 환자는 언젠가 약을 받을 후보이지만 **살아 있을 때만** 약을 시작할 수 있습니다.

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(42)
n = 20000
death_day = rng.exponential(scale=80, size=n)          # 약과 무관하게 정해진 사망 시점(일)
will_get = rng.random(n) < 0.4                         # 40%는 언젠가 약을 받을 '후보'
start_day = rng.exponential(scale=5, size=n)           # 후보라면 약을 시작했을 시점
treated = will_get & (start_day < np.minimum(death_day, 28))   # 살아 있어야 시작할 수 있다
died28 = death_day < 28
naive = pd.DataFrame({"treated": treated, "died28": died28})
print("[잘못된 분석] 28일 안에 한 번이라도 투약 vs 아님")
print(naive.groupby("treated")["died28"].mean().round(3))

# 고친 분석 A: landmark -- 3일째 살아 있는 사람만, 3일까지의 투약 여부로 나눈다
alive3 = death_day >= 3
lm = pd.DataFrame({"treated_by_day3": (will_get & (start_day < 3))[alive3], "died28": died28[alive3]})
print("\n[landmark 3일] 3일째 생존자, 3일까지 투약 여부로 비교")
print(lm.groupby("treated_by_day3")["died28"].mean().round(3))

# 고친 분석 B: 사람-시간을 노출 전/후로 쪼개 사망률(1,000인-일당) 비교
end = np.minimum(death_day, 28)
unexposed_time = np.where(treated, start_day, end).sum()
exposed_time = np.where(treated, end - start_day, 0).sum()
deaths_unexposed = (died28 & ~treated).sum()
deaths_exposed = (died28 & treated).sum()
print("\n[사람-시간 분할] 1,000인-일당 사망")
print("노출 전 시간:", round(1000 * deaths_unexposed / unexposed_time, 1))
print("노출 후 시간:", round(1000 * deaths_exposed / exposed_time, 1))
```

출력:

```text
[잘못된 분석] 28일 안에 한 번이라도 투약 vs 아님
treated
False    0.322
True     0.246
Name: died28, dtype: float64

[landmark 3일] 3일째 생존자, 3일까지 투약 여부로 비교
treated_by_day3
False    0.268
True     0.261
Name: died28, dtype: float64

[사람-시간 분할] 1,000인-일당 사망
노출 전 시간: 12.6
노출 후 시간: 12.1
```

잘못된 분석에서는 투약군의 28일 사망이 24.6%, 비투약군이 32.2%로, 약이 사망을 크게 줄이는 것처럼 보입니다. 우리가 정답(효과 0)을 알기 때문에 이 차이가 전부 편향임을 압니다. landmark 분석(26.1% vs 26.8%)과 사람-시간 분할(12.1 vs 12.6)에서는 차이가 거의 사라집니다. 남은 작은 차이는 우연의 흔들림입니다.

한 가지 더: 사람-시간 분할에서 투약 환자가 **투약 전에** 보낸 시간은 비노출 칸으로 갔습니다. 잘못된 분석은 바로 이 시간을 노출 칸에 넣었습니다. 이 한 줄(`np.where(treated, start_day, end)`)이 편향과 교정의 차이입니다.

### 예시 3 — index time 기준으로 창 자르기

기저 크레아티닌은 index time 전 24시간 안의 마지막 값, 결과는 index time 후 72시간 안의 최댓값으로 정의합니다.

```python
import pandas as pd

labs = pd.DataFrame({
    "stay_id": [1, 1, 1, 1, 2, 2],
    "charttime": pd.to_datetime(["2150-05-01 03:00", "2150-05-01 09:30", "2150-05-02 01:00",
                                 "2150-05-03 12:00", "2150-07-10 10:00", "2150-07-10 23:00"]),
    "creatinine": [1.1, 1.4, 2.2, 2.9, 0.8, 0.9],
})
index = pd.DataFrame({"stay_id": [1, 2],
                      "index_time": pd.to_datetime(["2150-05-01 08:00", "2150-07-10 12:00"])})
d = labs.merge(index, on="stay_id")
d["hours_from_index"] = (d.charttime - d.index_time).dt.total_seconds() / 3600
baseline = (d[d.hours_from_index.between(-24, 0)]
            .sort_values("charttime").groupby("stay_id").tail(1)[["stay_id", "creatinine"]])
after = d[d.hours_from_index.between(0, 72, inclusive="right")].groupby("stay_id").creatinine.max()
print(d[["stay_id", "charttime", "hours_from_index", "creatinine"]])
print("기저값(index 전 24시간 중 마지막):", baseline.set_index("stay_id").creatinine.to_dict())
print("index 후 72시간 최댓값:", after.to_dict())
```

출력:

```text
   stay_id           charttime  hours_from_index  creatinine
0        1 2150-05-01 03:00:00              -5.0         1.1
1        1 2150-05-01 09:30:00               1.5         1.4
2        1 2150-05-02 01:00:00              17.0         2.2
3        1 2150-05-03 12:00:00              52.0         2.9
4        2 2150-07-10 10:00:00              -2.0         0.8
5        2 2150-07-10 23:00:00              11.0         0.9
기저값(index 전 24시간 중 마지막): {1: 1.1, 2: 0.8}
index 후 72시간 최댓값: {1: 2.9, 2: 0.9}
```

모든 시간을 "index time으로부터 몇 시간"(`hours_from_index`)으로 바꿔 두면 창을 자르는 코드가 단순해지고, 경계(0시간 정각의 값은 어느 쪽인가)를 `inclusive=`로 명시할 수 있습니다. 1번 환자에게 "입원 중 첫 크레아티닌"을 기저값으로 썼다면 1.1이지만, "ICU 첫날 평균"을 썼다면 index 이후 값(1.4, 2.2)이 섞여 기저값이 부풀었을 것입니다.

### 예시 4 — 코호트 충실도: 알고리즘 vs 차트 검토

가상의 표현형 알고리즘을 의사의 차트 검토 200건과 비교합니다.

```python
import numpy as np
from sklearn.metrics import cohen_kappa_score

rng = np.random.default_rng(5)
chart = rng.random(200) < 0.3                          # 의사가 차트를 보고 판단한 '진짜' 노출
algo = np.where(chart, rng.random(200) < 0.85, rng.random(200) < 0.08)
tp = (algo & chart).sum(); fp = (algo & ~chart).sum(); fn = (~algo & chart).sum()
print(f"PPV(정밀도) {tp/(tp+fp):.2f}, 민감도(재현율) {tp/(tp+fn):.2f}, "
      f"Cohen's kappa {cohen_kappa_score(chart, algo):.2f}")
```

출력:

```text
PPV(정밀도) 0.77, 민감도(재현율) 0.86, Cohen's kappa 0.73
```

알고리즘이 "노출"이라고 한 사람 넷 중 하나 가까이는 사실 노출이 아니었습니다. 이 오분류는 효과 추정을 흐리게(대개 0 쪽으로) 만듭니다. 얼마면 충분한지에 정답은 없지만, 숫자를 보고하고 정의를 바꿔 본 민감도 분석(Day E5)을 함께 내는 것이 기본입니다.

## 직접 해보기

1. `notebooks/advanced/E/E3_cohort.ipynb`를 만들고 예시 1–4를 실행합니다. 출력이 위와 같은지 확인합니다.
2. 예시 1에서 "ICU 24시간 이상 체류"와 "환자별 첫 ICU 입실만"의 **순서를 바꿔** 다시 실행하고 최종 인원이 어떻게 달라지는지 적습니다.
3. 예시 2를 그림으로 남깁니다. 같은 셀 아래에 붙여 넣습니다.

   ```python
   import matplotlib.pyplot as plt
   from pathlib import Path

   out = Path("../../../figures/advanced/E"); out.mkdir(parents=True, exist_ok=True)
   labels = ["naive: never", "naive: ever", "landmark: no", "landmark: yes"]
   values = [naive.groupby("treated")["died28"].mean()[False], naive.groupby("treated")["died28"].mean()[True],
             lm.groupby("treated_by_day3")["died28"].mean()[False], lm.groupby("treated_by_day3")["died28"].mean()[True]]
   plt.figure(figsize=(6, 3.5))
   plt.bar(labels, values, color=["grey", "tab:blue", "grey", "tab:blue"])
   plt.ylabel("28-day mortality")
   plt.title("Drug with zero true effect")
   plt.tight_layout()
   plt.savefig(out / "E3_immortal_time.png", dpi=150)
   plt.show()
   ```

4. 예시 2에서 `scale=5`(투약 시작까지 걸리는 평균 일수)를 `1`과 `10`으로 바꿔 잘못된 분석의 차이가 어떻게 변하는지 표로 적습니다. 투약이 늦을수록 불멸 시간이 길어진다는 것을 확인합니다.
5. Day E1의 연구 질문으로 `reports/advanced/E/E3_cohort_definition.md`를 씁니다.
   - 포함·제외 기준을 **적용 순서대로** 번호 목록으로
   - index time의 정의 한 문장, 그리고 "자격·전략 갈림·추적 시작이 같은 순간인가?"에 대한 답
   - 기저값 창, 노출 창, 결과 창(예: "index 전 24시간", "index 후 0–3시간", "index 후 28일")
   - 노출을 기록에서 찾는 방법(코드, 투약, 검사, 노트 중 무엇)과 충실도를 확인할 계획
   - 불멸 시간이 생길 위험이 있는가, 있다면 landmark와 시간 의존 노출 중 무엇으로 막을지
6. `learning-log.md`에 기록하고 commit합니다.

⚠️ **흔한 오류 1 — `between`의 경계를 기본값으로 두고 같은 값을 두 창에 넣는다**
`Series.between(a, b)`는 기본이 양 끝 포함(`inclusive="both"`)입니다. index time 정각의 값이 기저값 창과 결과 창에 동시에 들어갈 수 있으니, 한쪽은 `inclusive="right"`처럼 명시합니다.

⚠️ **흔한 오류 2 — "한 번이라도 받았는가"로 노출을 정의한다**
추적 기간 전체를 보고 노출을 정하면 예시 2의 편향이 그대로 들어옵니다. 노출은 index time 기준의 정해진 창 안에서만 정의하거나, 시간에 따라 바뀌는 변수로 다룹니다.

## 퀴즈

**1.** (객관식) 불멸 시간 편향이 생기는 조건으로 가장 정확한 것은?
① 치료군의 표본 수가 적을 때
② 추적 시작 후에야 정해지는 노출을 추적 시작부터 노출로 셀 때
③ 결과 변수에 결측이 있을 때
④ 성향점수 매칭을 하지 않았을 때

<details><summary>정답 보기</summary>

②. 노출이 정해지기 전까지의 시간은 치료군 사람이 "반드시 살아 있어야 하는" 시간인데, 이를 노출 시간으로 잘못 배정하면 치료군이 유리해집니다. 표본 수, 결측, 매칭과는 별개의 설계 문제이고, 매칭으로도 고쳐지지 않습니다.

</details>

**2.** (단답) 예시 2의 사람-시간 분할에서, 투약 환자가 투약 전에 보낸 시간은 어느 칸으로 갔나요? 그것이 왜 중요합니까?

<details><summary>정답 보기</summary>

비노출(노출 전) 칸입니다. 그 시간 동안 그 사람은 실제로 약을 받지 않았으므로 비노출로 세는 것이 옳습니다. 잘못된 분석은 이 시간을 노출 칸에 넣어 "죽지 않은 시간"을 치료의 공으로 돌렸습니다.

</details>

**3.** (객관식) 기저 신기능(크레아티닌)을 정의하는 방법으로 가장 적절한 것은?
① 입원 기간 전체의 평균
② index time 이전 정해진 창 안의 값
③ index time 이후 72시간의 최댓값
④ 퇴원 직전 값

<details><summary>정답 보기</summary>

②. 기저 특성은 index time 이전 정보로만 정의해야 합니다. ①③④에는 노출 이후의 변화가 섞여, 노출의 결과가 "보정할 교란변수"로 둔갑합니다.

</details>

**4.** (단답) 표현형 알고리즘의 충실도를 확인하려고 알고리즘이 "해당"이라고 판정한 환자 100명만 차트 검토했습니다. 계산할 수 없는 지표는 무엇이고 왜 그런가요?

<details><summary>정답 보기</summary>

민감도(재현율)입니다. 알고리즘이 놓친 진짜 환자(거짓 음성)는 검토 표본에 없으므로 분모를 알 수 없습니다. 정밀도(PPV)만 계산할 수 있습니다. 민감도를 보려면 알고리즘 결과와 무관하게 무작위로 뽑은 표본이 필요합니다.

</details>

**5.** (객관식) 표적 시험 모사(target trial emulation)에서 index time이 갖춰야 할 조건은?
① 결과가 처음 관찰된 시점
② 자격 충족, 치료 전략의 갈림, 추적 시작이 같은 순간
③ 데이터베이스에 처음 기록이 생긴 날
④ 퇴원 시점

<details><summary>정답 보기</summary>

②. 무작위 시험에서는 자격 확인, 배정, 추적 시작이 같은 날 일어납니다. EHR로 시험을 흉내 낼 때도 이 세 가지를 맞추면 불멸 시간 편향과 "이미 치료를 견뎌 낸 사람" 문제를 대부분 피할 수 있습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 예시 1–4가 실행되고, 기준 순서를 바꾼 결과를 적었다.
- [ ] `figures/advanced/E/E3_immortal_time.png`가 저장되어 있다.
- [ ] `scale`을 바꾼 실험 결과를 표로 적었다.
- [ ] `reports/advanced/E/E3_cohort_definition.md`에 기준(순서대로), index time, 세 창, 노출 탐색법, 불멸 시간 대책이 있다.
- [ ] `learning-log.md` 기록과 commit을 남겼다.

## 더 읽을거리
- MIT Critical Data. *Secondary Analysis of Electronic Health Records*. Springer, 2016 (CC BY-NC 4.0). [NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK543630/) · [Springer](https://doi.org/10.1007/978-3-319-43742-2). 9장(노출·결과 정의), 10장(코호트 정의, 숨은 노출, 충실도), 28장(NLP로 코호트 찾기).
- Suissa S. Immortal time bias in pharmaco-epidemiology. *American Journal of Epidemiology* 2008. doi:[10.1093/aje/kwm324](https://doi.org/10.1093/aje/kwm324) (PMID 18056625)
- Hernán MA, Robins JM. Using big data to emulate a target trial when a randomized trial is not available. *American Journal of Epidemiology* 2016. doi:[10.1093/aje/kwv254](https://doi.org/10.1093/aje/kwv254) (PMID 26994063)
- Hripcsak G, Albers DJ. Next-generation phenotyping of electronic health records. *JAMIA* 2013. doi:[10.1136/amiajnl-2012-001145](https://doi.org/10.1136/amiajnl-2012-001145) (PMID 22955496)

---
[← 이전](day-E2.md) · [코스 지도](../../../README.md) · [다음 →](day-E4.md)
