# Day S5 — BLAST와 E-value: 데이터베이스 검색과 "우연히 이만큼"의 통계

> **주차:** 보충 단원 · **예상 시간:** 75–90분 · **산출물:** `notebooks/supplement/S5_blast_statistics.ipynb`
>
> **먼저 끝내 둘 레슨:** Day S4 (국소 정렬), Day 9 (p-value), Day 10 (다중검정).

## 오늘의 목표
- BLAST가 씨앗 찾기 → 늘리기 → 평가의 순서로 빠르게 검색한다는 것을 설명할 수 있다.
- 무작위 서열끼리의 최고 점수 분포를 시뮬레이션해, 점수의 유의성을 왜 따져야 하는지 보일 수 있다.
- raw score, bit score, E-value의 관계를 계산하고, 데이터베이스 크기에 따라 E-value가 달라지는 이유를 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [BLAST Results: Expect Values, Part 1 — National Library of Medicine](https://www.youtube.com/watch?v=ZN3RrXAe0uM) (2:30)
- **무엇에 주목할까:** BLAST를 운영하는 기관이 직접 만든 짧은 설명입니다. E-value가 "확률"이 아니라 "기대되는 개수"라는 표현에 주목하세요. 오늘 레슨 전체가 이 한 문장을 풀어 쓴 것입니다.

- [2. Local Alignment (BLAST) and Statistics — MIT OpenCourseWare](https://www.youtube.com/watch?v=6Udqou3vmng) (1:16:48)
- **무엇에 주목할까:** 선택 시청입니다. 한 시간이 넘는 대학 강의이므로 오늘 레슨을 마친 뒤, 점수의 통계를 다루는 부분만 골라 보기를 권합니다. 수식이 낯설어도 "무작위 서열에서 최고 점수가 어떤 분포를 따르는가"라는 질문만 따라가면 됩니다.

## 개념 설명

### 모든 책을 다 읽을 수는 없다: 씨앗에서 시작하기

어제 배운 Smith–Waterman은 정확하지만, 표의 모든 칸을 채워야 합니다. 내 서열 하나를 수억 개의 서열이 든 데이터베이스와 하나하나 그렇게 비교하면 너무 오래 걸립니다.

**BLAST**(basic local alignment search tool)는 정확성을 조금 내주고 속도를 얻습니다. 도서관에서 어떤 문단과 비슷한 글이 실린 책을 찾는다고 합시다. 모든 책을 처음부터 끝까지 대조하는 대신, 문단에서 특징적인 **짧은 단어 몇 개**를 뽑아 색인에서 그 단어가 나오는 쪽만 펼쳐 봅니다. 그리고 그 자리의 앞뒤 문장이 실제로 비슷한지 읽어 봅니다. BLAST의 세 단계가 이것입니다.

1. **씨앗(seed) 찾기**: query를 짧은 단어(단백질은 세 글자 안팎, DNA는 열 글자 이상)로 쪼개고, 데이터베이스에서 그 단어와 일치하거나 점수가 높은 자리를 찾습니다.
2. **늘리기(extension)**: 씨앗을 양쪽으로 늘리며 점수를 더합니다. 점수가 최고점에서 일정 값 넘게 떨어지면 멈춥니다. 이렇게 얻은 구간을 HSP(high-scoring segment pair)라고 합니다.
3. **평가**: 점수가 우연으로 얼마나 흔한지 계산해 순위를 매깁니다.

대가는 씨앗이 하나도 없는 정렬을 놓칠 수 있다는 것입니다. 이런 방법을 **휴리스틱(heuristic)** 이라고 부릅니다. 항상 최적을 보장하지는 않지만 대부분의 경우 충분히 좋은 답을 빨리 주는 방법이라는 뜻입니다.

### 가장 키 큰 사람의 분포

Day 10의 복권 비유를 떠올려 봅시다. 검정을 1,000번 하면 우연한 "당첨"이 쌓였습니다. 데이터베이스 검색은 그보다 심한 다중 비교입니다. query와 데이터베이스의 **모든 위치 조합**을 견주고 그중 **가장 높은** 점수만 보고하기 때문입니다.

교실마다 가장 키 큰 학생을 뽑아 모으면, 그 키의 분포는 보통 학생 키의 분포와 다릅니다. 평균이 훨씬 높고, 큰 쪽으로 꼬리가 길게 늘어집니다. 교실 인원이 많을수록 "가장 큰 학생"은 더 커집니다. 이렇게 **최댓값**이 따르는 분포를 극값 분포(extreme value distribution)라고 합니다.

무작위 서열끼리의 최고 국소 정렬 점수도 이 분포를 따릅니다. 두 가지 결론이 나옵니다. 첫째, 관계없는 서열 사이에도 0보다 꽤 높은 점수가 **항상** 나옵니다. 둘째, 비교하는 범위(query 길이 × 데이터베이스 크기)가 커질수록 우연한 최고점도 올라갑니다. 그래서 점수 그 자체가 아니라 "이 검색 규모에서 이 점수가 우연히 나올 만한가"를 물어야 합니다.

### E-value: 우연히 기대되는 개수

**E-value**는 그 물음에 대한 답입니다. "지금 이 크기의 검색에서, 점수가 S 이상인 정렬이 **우연만으로 몇 개쯤** 나올 것으로 기대되는가"입니다. 식은 다음과 같습니다.

`E = K × m × n × e^(−λS)`

`m`은 query 길이, `n`은 데이터베이스 전체 길이, `S`는 raw score이고, `K`와 `λ`는 점수 체계(치환 행렬과 gap 벌점)에 따라 정해지는 상수입니다. 식에서 읽을 것은 세 가지입니다. 점수가 오르면 E는 **지수적으로** 줄어듭니다. 검색 범위(`m × n`)에 **비례해** 커집니다. 그리고 E는 확률이 아니라 **개수**라서 1보다 클 수 있습니다. E = 10이면 "이 정도 점수는 우연히 10개쯤 나온다"이므로 증거가 되지 못하고, E = 0.001이면 "천 번 검색해야 한 번 우연히 나올 정도"입니다. E가 작을 때는 p-value와 값이 거의 같습니다(`P = 1 − e^(−E)`).

### bit score: 단위를 통일한 점수

raw score는 치환 행렬과 gap 벌점이 바뀌면 척도가 달라져 서로 비교할 수 없습니다. **bit score**는 `K`와 `λ`를 미리 반영해 단위를 맞춘 점수입니다.

`S' = (λS − ln K) / ln 2`,  `E = m × n × 2^(−S')`

bit score가 1 오를 때마다 E가 절반이 됩니다. 검색 조건이 달라도 비교할 수 있어 결과 표에서는 보통 bit score와 E-value를 함께 봅니다.

마지막으로, E-value가 작다는 것은 "우연으로 보기 어렵다"까지만 말해 줍니다. 그것이 상동성, 나아가 같은 기능을 뜻하는지는 정렬이 덮는 범위, 보존된 자리, 다른 근거를 함께 보고 판단합니다. 통계적 유의성과 생물학적 의미를 구분하는 것은 2주차부터 이어 온 원칙 그대로입니다.

> **참고 문헌:** Altschul et al., "Basic local alignment search tool", *Journal of Molecular Biology* 215:403–410 (1990), [doi:10.1016/S0022-2836(05)80360-2](https://doi.org/10.1016/S0022-2836%2805%2980360-2) · Karlin & Altschul, *PNAS* 87:2264–2268 (1990), [doi:10.1073/pnas.87.6.2264](https://doi.org/10.1073/pnas.87.6.2264) · Altschul et al., "Gapped BLAST and PSI-BLAST", *Nucleic Acids Research* 25:3389–3402 (1997), [doi:10.1093/nar/25.17.3389](https://doi.org/10.1093/nar/25.17.3389) · [NCBI BLAST 도움말](https://blast.ncbi.nlm.nih.gov/doc/blast-help/)

## 예시로 이해하기

> 예시의 서열, 데이터베이스, 점수는 모두 연습용으로 지어낸 **가상 값**입니다. 예시 1은 원리를 보이려고 크게 단순화한 것이며 실제 BLAST 프로그램과 같지 않습니다.

### 예시 1 — 씨앗을 찾고 늘리기

```python
database = {                      # 가상의 작은 단백질 데이터베이스
    "db1": "MSLLDAKTKEGVVHGLWEQPRS",
    "db2": "MAHHTTPLLQWERRYGGCNV",
    "db3": "GSPKTKQGVVHAAELRKTKE",
}
query = "AKTKEGVVHGA"
K = 3

def score(a, b):
    return 2 if a == b else -1

# 1단계: 데이터베이스의 모든 3글자 단어 위치를 미리 색인해 둔다
index = {}
for name, seq in database.items():
    for pos in range(len(seq) - K + 1):
        index.setdefault(seq[pos:pos + K], []).append((name, pos))

# 2단계: query의 단어가 색인에 있으면 그 자리가 씨앗(seed)
seeds = []
for qpos in range(len(query) - K + 1):
    for name, dpos in index.get(query[qpos:qpos + K], []):
        seeds.append((name, qpos, dpos))
print("씨앗 개수:", len(seeds))

# 3단계: 씨앗을 양쪽으로 gap 없이 늘린다. 점수가 최고점에서 DROP 넘게 떨어지면 멈춘다
DROP = 3
def extend(q, d, qpos, dpos, step):
    best = total = 0
    best_len = length = 0
    while 0 <= qpos < len(q) and 0 <= dpos < len(d):
        total += score(q[qpos], d[dpos])
        length += 1
        if total > best:
            best, best_len = total, length
        if best - total > DROP:
            break
        qpos, dpos = qpos + step, dpos + step
    return best, best_len

hits = {}
for name, qpos, dpos in seeds:
    d = database[name]
    right, right_len = extend(query, d, qpos + K, dpos + K, +1)
    left, left_len = extend(query, d, qpos - 1, dpos - 1, -1)
    total = 2 * K + right + left
    q_start, d_start = qpos - left_len, dpos - left_len
    length = left_len + K + right_len
    hits[(name, q_start, d_start)] = (total, query[q_start:q_start + length], d[d_start:d_start + length])

for (name, q_start, d_start), (total, q_part, d_part) in sorted(hits.items(), key=lambda x: -x[1][0]):
    print(f"{name}  점수 {total:2d}  query {q_start + 1:>2} {q_part}")
    print(f"{'':14s}  db    {d_start + 1:>2} {d_part}")
```

출력:

```text
씨앗 개수: 13
db1  점수 20  query  1 AKTKEGVVHG
                db     6 AKTKEGVVHG
db3  점수 14  query  2 KTKEGVVHGA
                db     4 KTKQGVVHAA
db3  점수  8  query  2 KTKE
                db    17 KTKE
```

데이터베이스 전체를 정렬하지 않고, 세 글자 단어가 일치하는 자리에서만 일을 시작했습니다. `db2`에는 씨앗이 없어 아예 건드리지 않았습니다. 같은 구간 안의 여러 씨앗이 늘어나면 같은 HSP로 합쳐지므로 씨앗은 13개지만 결과는 3개입니다. 실제 BLAST는 여기에 더해 "정확히 같지는 않지만 치환 행렬 점수가 높은 단어"도 씨앗으로 쓰고, 늘린 뒤 gap을 허용하는 정렬을 한 번 더 합니다.

### 예시 2 — 무작위 서열끼리도 점수는 나온다

```python
import numpy as np

rng = np.random.default_rng(5)
LETTERS = np.array(list("ACDEFGHIKLMNPQRSTVWY"))

def best_local_score(a, b, match=2, mismatch=-1):
    """gap 없는 최고 국소 점수: 모든 대각선에서 '가장 점수가 높은 연속 구간'을 찾는다."""
    s = np.where(a[:, None] == b[None, :], match, mismatch)
    best = 0
    for k in range(-len(a) + 1, len(b)):
        run = 0
        for value in np.diagonal(s, k):
            run = max(0, run + value)
            best = max(best, run)
    return best

assert best_local_score(np.array(list("AAKTKAA")), np.array(list("CCKTKCC"))) == 6

for length in [50, 100, 200]:
    scores = [best_local_score(rng.choice(LETTERS, length), rng.choice(LETTERS, length))
              for _ in range(300)]
    scores = np.array(scores)
    print(f"길이 {length:3d} × {length:3d}: 무작위 최고점 평균 {scores.mean():.1f}, "
          f"95% 지점 {np.percentile(scores, 95):.0f}, 최댓값 {scores.max()}")

scores = np.array([best_local_score(rng.choice(LETTERS, 100), rng.choice(LETTERS, 100))
                   for _ in range(1000)])
print("\n길이 100 × 100, 1000번 반복한 최고점 분포")
for value in range(scores.min(), scores.max() + 1):
    count = (scores == value).sum()
    print(f"{value:3d} {'#' * (count // 10)} {count}")
```

출력:

```text
길이  50 ×  50: 무작위 최고점 평균 4.9, 95% 지점 6, 최댓값 10
길이 100 × 100: 무작위 최고점 평균 6.1, 95% 지점 8, 최댓값 10
길이 200 × 200: 무작위 최고점 평균 7.1, 95% 지점 9, 최댓값 12

길이 100 × 100, 1000번 반복한 최고점 분포
  4 ### 37
  5 ###################### 226
  6 ################################################### 513
  7 ############# 139
  8 ###### 67
  9 # 11
 10  6
 11  1
```

20가지 글자를 아무렇게나 늘어놓은 서열끼리인데도 최고 점수는 0이 아니라 평균 5–7점이고, 서열이 길수록 올라갑니다. 아래 히스토그램은 오른쪽 꼬리가 긴 모양입니다. 대부분 5–7점이지만 가끔 10점 이상도 나옵니다. 이 설정에서 어떤 정렬이 8점을 받았다면 우연으로도 흔한 값이고, 예시 1의 20점은 이 분포의 한참 바깥입니다. 실행하는 데 몇 초 걸릴 수 있습니다.

### 예시 3 — raw score, bit score, E-value

```python
import math

LAMBDA, K = 0.267, 0.041      # BLOSUM62 + gap 11/1 조합에서 BLAST가 쓰는 값

def bit_score(raw):
    return (LAMBDA * raw - math.log(K)) / math.log(2)

def e_value(raw, m, n):
    return K * m * n * math.exp(-LAMBDA * raw)

m = 140                        # query 길이 (예: 140 aa 단백질)
print("raw  bit    E(DB 1천만)  E(DB 2억)")
for raw in [40, 60, 80, 120]:
    print(f"{raw:3d}  {bit_score(raw):5.1f}  {e_value(raw, m, 1e7):10.2e}  {e_value(raw, m, 2e8):9.2e}")

print("\nbit score로 다시 계산한 E (raw 60):", f"{m * 1e7 * 2 ** (-bit_score(60)):.2e}")
for raw in [60, 80]:
    e = e_value(raw, m, 1e7)
    print(f"raw {raw}: E = {e:.3f}, P(우연히 1개 이상) = 1 - exp(-E) = {1 - math.exp(-e):.3f}")
```

출력:

```text
raw  bit    E(DB 1천만)  E(DB 2억)
 40   20.0    1.32e+03   2.64e+04
 60   27.7    6.33e+00   1.27e+02
 80   35.4    3.04e-02   6.07e-01
120   50.8    6.98e-07   1.40e-05

bit score로 다시 계산한 E (raw 60): 6.33e+00
raw 60: E = 6.332, P(우연히 1개 이상) = 1 - exp(-E) = 0.998
raw 80: E = 0.030, P(우연히 1개 이상) = 1 - exp(-E) = 0.030
```

raw score가 20 오를 때마다 E가 약 200분의 1로 줄어듭니다. 같은 raw score 80이라도 데이터베이스가 20배 커지면 E도 20배(0.03 → 0.6)가 됩니다. bit score만으로 다시 계산한 E가 원래 값과 같다는 것, E가 작을 때(0.030)는 P와 거의 같고 클 때(6.3)는 전혀 다르다는 것도 확인하세요. `λ`와 `K`는 실제 BLAST 결과 맨 아래 통계 구획에 적혀 나옵니다.

## 직접 해보기

1. `notebooks/supplement/S5_blast_statistics.ipynb`를 만들고 예시 1–3을 실행합니다.

2. **단어 길이 바꾸기.** 예시 1의 `K = 3`을 `K = 2`와 `K = 5`로 바꿔 씨앗 개수와 찾은 결과가 어떻게 달라지는지 표로 적습니다. 단어가 짧으면 민감하지만 할 일이 늘고, 길면 빠르지만 놓치는 것이 생긴다는 맞바꿈을 확인하는 단계입니다.

3. **검색 규모와 E.** 예시 3의 함수로 `e_value(70, 140, 1e6)`, `e_value(70, 140, 1e8)`, `e_value(70, 1400, 1e8)`을 계산해 어떤 규칙으로 변하는지 한 줄로 적습니다.

4. **E = 0.001이 되려면.** query 140, 데이터베이스 1천만(1e7) 조건에서 E가 0.001 아래로 내려가는 가장 작은 raw score를 `for` 반복문으로 찾습니다.

   ```python
   for raw in range(40, 200):
       if e_value(raw, 140, 1e7) < 0.001:
           print(raw, round(bit_score(raw), 1))
           break
   ```

5. **(선택) 실제 BLAST 결과 읽기.** [NCBI BLAST](https://blast.ncbi.nlm.nih.gov/Blast.cgi)의 Protein BLAST에 accession `P37840`(사람 α-synuclein)을 넣고, 데이터베이스를 UniProtKB/Swiss-Prot로 골라 검색합니다. 결과 표에서 Max Score, Query Cover, E value, Per. Ident 열의 뜻을 오늘 배운 용어로 한 줄씩 적고, 사람의 SNCB·SNCG가 목록에 나오는지 확인합니다. 결과의 구체적인 숫자는 데이터베이스가 갱신될 때마다 달라지므로, 검색한 날짜를 함께 적습니다.

6. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — E-value를 확률로 읽기.** "E = 3이니까 300%"는 말이 되지 않습니다. E는 우연히 기대되는 **개수**입니다. 그리고 E-value는 검색 규모에 따라 달라지므로, 다른 데이터베이스에서 얻은 E-value끼리 그대로 비교하면 안 됩니다. 조건이 다를 때는 bit score를 비교합니다.

⚠️ **흔한 오류 2 — 예시 2가 끝나지 않는 것처럼 보임.** 반복이 많아 몇 초에서 십여 초 걸립니다. 셀 왼쪽의 `[*]`가 숫자로 바뀔 때까지 기다리세요. 너무 느리면 `300`과 `1000`을 절반으로 줄여도 됩니다(출력 숫자는 달라집니다).

## 퀴즈

**1.** BLAST가 Smith–Waterman보다 빠른 핵심 이유는?

(a) 더 좋은 치환 행렬을 쓴다 (b) 짧은 단어가 일치하는 자리에서만 정렬을 시도한다 (c) gap을 허용하지 않는다 (d) DNA만 다룬다

<details><summary>정답 보기</summary>

(b). 데이터베이스 전체에 표를 채우는 대신 씨앗이 있는 자리만 늘려 보기 때문입니다. 그 대가로 씨앗이 없는 정렬은 놓칠 수 있습니다.

</details>

**2.** E-value가 5라는 것의 뜻은? (단답)

<details><summary>정답 보기</summary>

이 검색 규모에서 그 점수 이상의 정렬이 우연만으로 5개쯤 나올 것으로 기대된다는 뜻입니다. 확률이 아니라 기대 개수이며, 이 정도면 우연과 구별할 근거가 없습니다.

</details>

**3.** 같은 query, 같은 정렬 점수인데 데이터베이스가 10배 커졌습니다. E-value는?

(a) 그대로 (b) 10배 커진다 (c) 10분의 1이 된다 (d) 100배 커진다

<details><summary>정답 보기</summary>

(b). E는 `m × n`에 비례합니다. 뒤져 본 범위가 넓을수록 같은 점수가 우연히 나올 기회가 많아지기 때문입니다. Day 10의 다중검정과 같은 원리입니다.

</details>

**4.** bit score가 raw score보다 편리한 이유는? (단답)

<details><summary>정답 보기</summary>

치환 행렬과 gap 벌점에 따라 달라지는 상수(K, λ)를 이미 반영해 단위를 맞췄기 때문입니다. 그래서 점수 체계나 데이터베이스가 다른 검색 결과끼리도 비교할 수 있고, 1 오를 때마다 E가 절반이 된다는 해석도 일정합니다.

</details>

**5.** 관계없는 무작위 서열 둘을 국소 정렬하면 최고 점수는 보통?

(a) 정확히 0이다 (b) 음수다 (c) 0보다 크고, 서열이 길수록 커지는 경향이 있다 (d) 길이와 무관하게 일정하다

<details><summary>정답 보기</summary>

(c). 수많은 위치 조합 가운데 가장 좋은 것만 고르기 때문에 우연한 일치가 이어진 구간이 항상 어딘가에 있습니다. 비교 범위가 넓을수록 그런 구간이 더 길어질 기회가 늘어납니다.

</details>

## 더 알아보기

> **📚 BLAST를 스크립트로 돌릴 때**
> 웹 화면 대신 코드로 BLAST를 호출할 수도 있습니다(Biopython `NCBIWWW.qblast` — 선택 설치 `conda install -c conda-forge biopython` — 또는 NCBI의 BLAST+ 명령줄 도구). 결과를 XML이나 표 형식으로 저장하고, E-value·bit score·query cover 기준으로 거르는 코드를 따로 두면 검색 조건이 기록으로 남습니다. NCBI 원격 서버에는 요청 빈도 제한이 있으니 서열이 많으면 로컬 BLAST+와 내려받은 데이터베이스를 씁니다. 데이터베이스는 계속 갱신되므로 검색 날짜와 DB 버전을 결과와 함께 적습니다.

## 오늘의 산출물 체크리스트
- [ ] 씨앗 찾기와 늘리기 코드를 실행하고 단어 길이를 바꿔 보았다.
- [ ] 무작위 서열의 최고 점수 분포를 만들어 꼬리 모양을 확인했다.
- [ ] `bit_score`와 `e_value` 함수로 검색 규모에 따른 E의 변화를 계산했다.
- [ ] "E-value는 확률이 아니라 기대 개수"를 자기 말로 설명할 수 있다.

---
[← 이전](day-S4.md) · [코스 지도](../../README.md) · [다음 →](day-S6.md)
