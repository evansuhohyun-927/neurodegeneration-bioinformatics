# Day S3 — 치환 행렬: PAM과 BLOSUM은 어떻게 만들어졌나

> **주차:** 보충 단원 · **예상 시간:** 75–90분 · **산출물:** `notebooks/supplement/S3_substitution_matrix.ipynb`
>
> **먼저 끝내 둘 레슨:** Day S2 (identity와 similarity), Day F5 (log2).

## 오늘의 목표
- 치환 행렬의 점수가 "관찰된 빈도 ÷ 우연히 기대되는 빈도"의 로그(log-odds)라는 것을 설명할 수 있다.
- 작은 정렬 블록에서 쌍을 세어 BLOSUM 방식의 점수표를 직접 만들 수 있다.
- PAM과 BLOSUM의 만드는 방식 차이와, 숫자(PAM250, BLOSUM62)가 뜻하는 바를 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [PAM and BLOSUM substitution matrices - Concepts — Farhan Haq](https://www.youtube.com/watch?v=eZsGfmZ3gzU) (12:03)
- **무엇에 주목할까:** 두 행렬 가족이 각각 어떤 자료에서 출발했는지, 이름 뒤 숫자가 커질 때 PAM과 BLOSUM이 서로 반대 방향으로 움직인다는 점을 확인하세요. 계산 세부는 오늘 예시에서 직접 해 봅니다.

- [3. Global Alignment of Protein Sequences (NW, SW, PAM, BLOSUM) — MIT OpenCourseWare](https://www.youtube.com/watch?v=PdyARRNwi7I) (1:20:01)
- **무엇에 주목할까:** 선택 시청입니다. 대학 강의 한 시간 분량이라 전부 볼 필요는 없고, 치환 행렬을 다루는 부분만 찾아 보세요. 정렬 알고리즘 부분은 내일(S4) 레슨을 마친 뒤에 보면 더 잘 들립니다.

## 개념 설명

### 왜 "같다/다르다"만으로는 부족한가

어제의 identity는 글자가 같으면 1점, 다르면 0점을 주는 채점입니다. 가까운 종끼리는 이것으로 충분하지만, 오래전에 갈라진 단백질은 같은 글자가 20% 남짓만 남아 우연히 비슷한 서열과 구별하기 어렵습니다.

그런데 "다르다"에도 등급이 있습니다. 류신이 이소류신으로 바뀐 것은 같은 계열의 항생제로 바꾼 처방과 비슷합니다. 이름은 달라도 하는 일이 거의 같아서 문제가 잘 생기지 않습니다. 반면 류신이 아스파르트산으로 바뀌면 소수성 중심부에 전하가 박히는 셈이라 단백질이 버티기 어렵습니다. 진화는 앞의 교체를 자주 받아들였고 뒤의 교체는 거의 걸러 냈습니다. **치환 행렬(substitution matrix)** 은 이 경험을 20 × 20 점수표로 옮긴 것입니다. 받아들여진 교체에는 양수, 걸러진 교체에는 음수를 줍니다.

### log-odds: 우연보다 몇 배 자주 보이는가

점수는 다음 물음에서 나옵니다. "상동 단백질의 정렬에서 이 두 글자가 한 칸에 나란히 놓인 빈도가, 두 글자를 아무렇게나 뽑아 짝지었을 때보다 몇 배인가?"

- 관찰 빈도 ÷ 기대 빈도가 1보다 크면 "우연보다 자주" → 로그를 씌우면 양수
- 1이면 "우연과 같다" → 0
- 1보다 작으면 "우연보다 드물다" → 음수

로그를 쓰는 이유는 Day F5에서 log2 fold change를 쓴 이유와 같습니다. 2배 많음(+1)과 2배 적음(−1)이 대칭이 되고, 여러 칸의 확률을 **곱하는** 대신 점수를 **더하면** 되기 때문입니다. 정렬 전체의 점수가 칸마다의 점수 합으로 계산되는 근거가 여기에 있습니다.

기대 빈도를 나눠 주는 것도 중요합니다. 류신은 원래 흔해서 L–L 쌍이 우연히도 자주 생기고, 트립토판은 드물어서 W–W 쌍이 우연히 생기기 어렵습니다. 그래서 같은 "일치"라도 W–W의 점수가 훨씬 높습니다. 실제 BLOSUM62에서 W–W는 11점, L–L은 4점입니다.

### PAM: 가까운 친척에서 출발해 먼 과거로 외삽하기

**PAM**(point accepted mutation)은 1978년 Dayhoff 연구진이 만든 첫 번째 본격적인 치환 행렬입니다. 서로 아주 가까운(차이 15% 이내) 단백질들로 계통수를 그리고, 가지마다 일어난 아미노산 교체를 세었습니다. 가까운 서열만 쓴 까닭은 같은 자리에서 교체가 두 번 겹쳤을 가능성이 낮아 세기가 정확하기 때문입니다.

이 집계에서 "100자리 중 평균 1자리가 바뀌는 동안 글자 i가 j로 바뀌어 있을 확률" 표를 만든 것이 PAM1입니다. 더 먼 관계는 직접 세지 않고 **PAM1을 여러 번 곱해서** 얻습니다. 하루 이자율을 알면 250일 뒤 잔고를 복리로 계산하는 것과 같은 발상입니다. PAM250은 PAM1을 250번 곱한 것이고, 그만큼 먼 관계에 맞춘 점수표입니다. 숫자가 클수록 먼 관계용입니다. 250단위가 지나도 같은 자리가 여러 번 바뀌거나 되돌아오므로 서열이 완전히 달라지지는 않습니다.

### BLOSUM: 먼 친척을 직접 세기

**BLOSUM**(blocks substitution matrix)은 1992년 Henikoff 부부가 다른 길로 만들었습니다. 단백질 가족마다 gap 없이 정렬되는 보존 구간(블록)을 모으고, 각 칸 안에서 만들어지는 글자 쌍을 **직접** 세었습니다. 외삽을 하지 않으므로 먼 관계의 교체 양상이 관찰 그대로 들어갑니다.

다만 블록 안에 거의 같은 서열이 많으면 그 쌍이 과하게 세어집니다. 그래서 identity가 기준 이상인 서열들을 한 묶음으로 쳐서 한 표만 행사하게 했습니다. 기준이 62%이면 BLOSUM62입니다. 기준을 높이면(BLOSUM80) 가까운 서열의 정보가 많이 남아 가까운 관계용이 되고, 낮추면(BLOSUM45) 먼 관계용이 됩니다. **PAM과 숫자의 방향이 반대**라는 점만 기억하면 됩니다. BLAST 단백질 검색의 기본값이 BLOSUM62입니다.

> **참고 문헌:** Dayhoff, Schwartz, Orcutt, "A model of evolutionary change in proteins", *Atlas of Protein Sequence and Structure* vol. 5 suppl. 3, pp. 345–352 (1978) · Henikoff & Henikoff, "Amino acid substitution matrices from protein blocks", *PNAS* 89:10915–10919 (1992), [doi:10.1073/pnas.89.22.10915](https://doi.org/10.1073/pnas.89.22.10915)

## 예시로 이해하기

> 예시의 빈도, 서열 블록, 확률 행렬은 모두 계산 과정을 보이려고 지어낸 **가상 값**입니다. 실제 PAM·BLOSUM의 값이 아닙니다.

### 예시 1 — log-odds 점수를 손으로

```python
import math

def log_odds(q_pair, p_a, p_b):
    """관찰된 쌍 빈도 / 우연히 기대되는 빈도 → 2 × log2 점수(half-bit 단위)."""
    if p_a == p_b:
        expected = p_a * p_b            # 같은 글자끼리: p × p
    else:
        expected = 2 * p_a * p_b        # 다른 글자끼리: 순서가 두 가지(a-b, b-a)
    ratio = q_pair / expected
    return ratio, 2 * math.log2(ratio)

cases = [
    ("L–L (흔하고 잘 보존)", 0.040, 0.10, 0.10),
    ("W–W (드물고 잘 보존)", 0.006, 0.01, 0.01),
    ("L–I (비슷한 성질)  ", 0.018, 0.10, 0.06),
    ("L–D (성질이 다름)  ", 0.002, 0.10, 0.05),
]
for name, q, pa, pb in cases:
    ratio, score = log_odds(q, pa, pb)
    print(f"{name}  관찰/기대 = {ratio:5.2f}배  점수 = {score:+.1f} → {round(score):+d}")
```

출력:

```text
L–L (흔하고 잘 보존)  관찰/기대 =  4.00배  점수 = +4.0 → +4
W–W (드물고 잘 보존)  관찰/기대 = 60.00배  점수 = +11.8 → +12
L–I (비슷한 성질)    관찰/기대 =  1.50배  점수 = +1.2 → +1
L–D (성질이 다름)    관찰/기대 =  0.20배  점수 = -4.6 → -5
```

L–L과 W–W는 둘 다 "일치"이지만, 드문 글자인 W의 일치가 우연으로 설명하기 훨씬 어려워 점수가 큽니다. L–I는 우연보다 조금 자주 보여 +1, L–D는 우연의 5분의 1밖에 안 보여 −5입니다. 2를 곱하는 것은 BLOSUM의 관례(half-bit 단위)이고, 마지막에 정수로 반올림합니다.

### 예시 2 — 작은 블록으로 미니 BLOSUM 만들기

```python
import math
from itertools import combinations
import pandas as pd

block = [            # 가상의 보존 구간: 서열 8개 × 8칸, gap 없음
    "KLDEKLLD",
    "KLDERLLD",
    "RLEEKILD",
    "RIDDKLLE",
    "KLDEKLID",
    "RLDERILD",
    "KIEEKLLD",
    "KLDDRLLE",
]
letters = sorted(set("".join(block)))

pair_count = {}                              # 같은 칸(column) 안에서 만들 수 있는 모든 쌍을 센다
for col in range(len(block[0])):
    column = [seq[col] for seq in block]
    for a, b in combinations(column, 2):
        key = tuple(sorted((a, b)))
        pair_count[key] = pair_count.get(key, 0) + 1

total_pairs = sum(pair_count.values())
q = {key: n / total_pairs for key, n in pair_count.items()}     # 관찰된 쌍 빈도

p = {}                                                           # 각 글자의 배경 빈도
for x in letters:
    p[x] = q.get((x, x), 0) + sum(v for k, v in q.items() if x in k and k[0] != k[1]) / 2
assert abs(sum(p.values()) - 1) < 1e-9

score = pd.DataFrame("", index=letters, columns=letters)
for a in letters:
    for b in letters:
        key = tuple(sorted((a, b)))
        if key not in q:
            score.loc[a, b] = "."                                # 한 번도 관찰되지 않은 쌍
            continue
        expected = p[a] * p[b] if a == b else 2 * p[a] * p[b]
        score.loc[a, b] = f"{round(2 * math.log2(q[key] / expected)):+d}"

print("전체 쌍 개수:", total_pairs)
print("배경 빈도:", {x: round(v, 3) for x, v in p.items()})
print(score)
```

출력:

```text
전체 쌍 개수: 224
배경 빈도: {'D': 0.219, 'E': 0.156, 'I': 0.078, 'K': 0.156, 'L': 0.297, 'R': 0.094}
    D   E   I   K   L   R
D  +3  +2   .   .   .   .
E  +2  +3   .   .   .   .
I   .   .  +1   .  +3   .
K   .   .   .  +4   .  +4
L   .   .  +3   .  +3   .
R   .   .   .  +4   .  +3
```

서열 8개에서 한 칸마다 28쌍(8 × 7 ÷ 2)이 나오고, 8칸이므로 224쌍입니다. D–E, K–R, I–L처럼 성질이 비슷한 쌍이 양수로 나왔습니다. 블록을 그렇게 지어냈기 때문입니다. 점(`.`)은 한 번도 관찰되지 않은 쌍으로, 0의 로그는 계산할 수 없어 비워 두었습니다. K–R(+4)이 R–R(+3)보다 높은 것 같은 어색함도 보입니다. 자료가 적으면 점수가 이렇게 흔들리므로, 실제 BLOSUM은 수많은 블록을 모아 만듭니다.

### 예시 3 — PAM의 발상: 행렬을 거듭 곱하기

```python
import numpy as np
import pandas as pd

letters = ["A", "S", "W"]                 # 설명용 3글자 알파벳
f = np.array([0.5, 0.4, 0.1])             # 배경 빈도

# '1% 변화' 행렬: M[i, j] = 글자 i가 한 단위 시간 뒤 j로 바뀌어 있을 확률 (가상 값)
M1 = np.array([
    [0.9900, 0.0096, 0.0004],
    [0.0120, 0.9875, 0.0005],
    [0.0020, 0.0020, 0.9960],
])
assert np.allclose(M1.sum(axis=1), 1)
print("한 단위에서 바뀌는 비율:", round(float(1 - (f * np.diag(M1)).sum()), 4))

for n in [1, 50, 250, 2000]:
    Mn = np.linalg.matrix_power(M1, n)          # 같은 행렬을 n번 곱한다
    unchanged = (f * np.diag(Mn)).sum()
    S = 10 * np.log10(Mn / f)                   # 열 j의 배경 빈도로 나눈 뒤 로그
    print(f"\nPAM{n}: 그대로 남은 자리 {unchanged:.0%}")
    print(pd.DataFrame(S.round().astype(int), index=letters, columns=letters))
```

출력:

```text
한 단위에서 바뀌는 비율: 0.0104

PAM1: 그대로 남은 자리 99%
    A   S   W
A   3 -16 -24
S -16   4 -23
W -24 -23  10

PAM50: 그대로 남은 자리 67%
   A  S  W
A  1 -1 -7
S -1  2 -7
W -7 -7  9

PAM250: 그대로 남은 자리 47%
   A  S  W
A  0  0 -2
S  0  0 -2
W -2 -2  6

PAM2000: 그대로 남은 자리 42%
   A  S  W
A  0  0  0
S  0  0  0
W  0  0  0
```

PAM1에서는 99%가 그대로이고 대각선 밖 점수가 크게 음수입니다. 가까운 관계에서는 교체 자체가 드문 사건이라는 뜻입니다. 곱하는 횟수가 늘수록 음수가 완만해지고, PAM250에서는 A–S 교체가 0점(우연과 같은 수준)이 됩니다. 드문 글자 W의 일치는 끝까지 높은 점수를 유지합니다. 2000번을 곱하면 모든 점수가 0이 됩니다. 출발 글자의 흔적이 사라져 정렬에서 얻을 정보가 없다는 뜻입니다.

## 직접 해보기

1. `notebooks/supplement/S3_substitution_matrix.ipynb`를 만들고 예시 1–3을 실행합니다.

2. **손 계산.** 관찰 빈도 0.03, 두 글자의 배경 빈도가 0.1과 0.05인 서로 다른 쌍의 점수를 계산기로 먼저 구하고(기대 빈도 = 2 × 0.1 × 0.05), `log_odds(0.03, 0.1, 0.05)`로 확인합니다.

3. **블록 바꿔 보기.** 예시 2의 `block` 마지막 서열을 `"KLDDRLLE"`에서 `"KLKDRLLE"`로 바꿔 실행합니다(셋째 칸에 K가 하나 섞임). D–K와 E–K 칸에 어떤 점수가 생기는지, 왜 음수인지 한 줄로 적습니다.

4. **묶음(clustering)의 효과.** `block`에 첫 서열 `"KLDEKLLD"`를 네 번 더 추가해 실행합니다. 전체 쌍 개수가 224에서 528로 늘어나는데, 늘어난 쌍의 대부분은 똑같은 서열끼리 만든 일치 쌍입니다. 배경 빈도와 점수가 어느 쪽으로 움직였는지 적고, BLOSUM이 왜 비슷한 서열을 한 묶음으로 쳐서 한 표만 주는지 한 줄로 정리합니다.

5. **PAM 단위 읽기.** 예시 3의 `for n in [...]` 목록에 100과 500을 넣어 "그대로 남은 자리" 비율이 어떻게 줄어드는지 표로 적습니다.

6. **실제 행렬 구경하기.** [NCBI BLAST](https://blast.ncbi.nlm.nih.gov/Blast.cgi)에서 Protein BLAST 화면을 열고, 아래쪽 "Algorithm parameters"를 펼쳐 Scoring Parameters의 Matrix 목록에 어떤 행렬이 있는지, 기본으로 선택된 것이 무엇인지 노트북에 적습니다. 검색을 실행할 필요는 없습니다.

7. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — `ValueError: math domain error`.** 관찰 빈도가 0인 쌍에 로그를 씌우면 납니다. 예시 2는 그런 쌍을 건너뛰도록 되어 있습니다. 블록을 바꾼 뒤 이 오류가 나면 `if key not in q:` 부분을 지우지 않았는지 확인하세요.

⚠️ **흔한 오류 2 — PAM과 BLOSUM의 숫자 방향 혼동.** PAM은 숫자가 클수록 먼 관계용, BLOSUM은 숫자가 **작을수록** 먼 관계용입니다. "PAM은 지난 시간, BLOSUM은 묶음 기준 identity"라고 숫자의 뜻을 떠올리면 헷갈리지 않습니다.

## 퀴즈

**1.** 치환 행렬에서 어떤 쌍의 점수가 0이라는 것은?

(a) 그 교체가 절대 일어나지 않는다 (b) 그 쌍이 우연히 기대되는 만큼 관찰된다 (c) 두 아미노산이 같다 (d) 자료가 없다

<details><summary>정답 보기</summary>

(b). 관찰 빈도와 기대 빈도의 비가 1이고, 1의 로그가 0이기 때문입니다. 상동이라는 증거도, 아니라는 증거도 되지 않는 쌍입니다.

</details>

**2.** BLOSUM62에서 W–W(11점)가 L–L(4점)보다 높은 이유는? (단답)

<details><summary>정답 보기</summary>

트립토판은 드문 아미노산이라 우연히 W끼리 마주칠 기대 빈도가 매우 낮기 때문입니다. 같은 일치라도 우연으로 설명하기 어려울수록 log-odds가 커집니다. 트립토판이 다른 것으로 잘 바뀌지 않는다는 점도 관찰 빈도를 높입니다.

</details>

**3.** 아주 먼 관계의 단백질을 찾으려 할 때 더 알맞은 조합은?

(a) PAM30, BLOSUM80 (b) PAM250, BLOSUM45 (c) PAM30, BLOSUM45 (d) PAM250, BLOSUM80

<details><summary>정답 보기</summary>

(b). PAM은 숫자가 클수록, BLOSUM은 숫자가 작을수록 먼 관계에 맞춰져 있습니다. (a)는 가까운 관계용 조합입니다.

</details>

**4.** PAM250은 어떻게 얻나요?

(a) 250개 단백질을 정렬해 직접 센다 (b) PAM1 확률 행렬을 250번 곱한다 (c) PAM1 점수에 250을 곱한다 (d) identity 25%인 서열만 골라 센다

<details><summary>정답 보기</summary>

(b). 가까운 서열에서 얻은 짧은 기간의 변화 확률을 거듭 곱해 긴 기간으로 외삽합니다. 점수에 숫자를 곱하는 것이 아니라 확률 행렬을 곱한 뒤 log-odds로 바꿉니다.

</details>

**5.** BLOSUM을 만들 때 비슷한 서열을 한 묶음으로 치는 이유는? (단답)

<details><summary>정답 보기</summary>

거의 같은 서열이 블록에 많이 들어 있으면 그 서열들 사이의 일치 쌍이 지나치게 많이 세어져 점수표가 가까운 관계 쪽으로 치우치기 때문입니다. 묶음 기준(예: 62%)을 정해 그 이상 비슷한 서열은 한 표로 취급합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `log_odds` 함수로 네 가지 쌍의 점수를 계산했다.
- [ ] 가상 블록에서 쌍을 세어 점수표를 만들고, 블록을 바꿨을 때의 변화를 적었다.
- [ ] 행렬을 거듭 곱했을 때 점수가 어떻게 변하는지 설명할 수 있다.
- [ ] PAM과 BLOSUM의 숫자 방향을 헷갈리지 않고 말할 수 있다.

---
[← 이전](day-S2.md) · [코스 지도](../../README.md) · [다음 →](day-S4.md)
