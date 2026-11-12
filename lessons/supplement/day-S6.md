# Day S6 — 다중 서열 정렬과 프로파일: 여러 서열에서 보존 패턴 읽기

> **주차:** 보충 단원 · **예상 시간:** 75–90분 · **산출물:** `notebooks/supplement/S6_msa_profile.ipynb`
>
> **먼저 끝내 둘 레슨:** Day S3 (log-odds), Day S4 (전역 정렬).

## 오늘의 목표
- 다중 서열 정렬(MSA)이 쌍 정렬로는 보이지 않는 무엇을 보여 주는지, progressive 정렬이 어떤 순서로 진행되는지 설명할 수 있다.
- 정렬된 서열에서 칸별 보존도와 consensus를 계산할 수 있다.
- 정렬에서 위치별 점수 행렬(PSSM)을 만들어 새 서열을 채점할 수 있다.

## 🎬 영상으로 먼저 보기

- [MultipleSequenceAlignment ProgressiveClustal IterativeMUSCLE — Dr.T](https://www.youtube.com/watch?v=HYbr5_WFxpM) (12:57)
- **무엇에 주목할까:** 여러 서열을 "한꺼번에"가 아니라 "가까운 것부터 차례로" 맞춰 나간다는 progressive 방식의 순서를 따라가 보세요. 먼저 한 정렬의 실수가 뒤에서 고쳐지지 않는다는 약점과, 그것을 보완하려는 반복(iterative) 방식이 어떻게 다른지도 들어 두면 좋습니다.

- [Lecture 11, Concept 19: Position-specific scoring matrices add more biological information — Erik Lindahl](https://www.youtube.com/watch?v=X0flDzC3FnA) (5:42)
- **무엇에 주목할까:** S3의 치환 행렬은 서열의 어느 자리에서나 같은 점수를 줍니다. 위치마다 다른 점수표를 쓰면 무엇이 좋아지는지에 주목하세요.

## 개념 설명

### 둘보다 여럿이 알려 주는 것

두 서열을 정렬해 어떤 칸의 글자가 같다고 합시다. 그것이 꼭 필요해서 유지된 것인지, 갈라진 지 얼마 안 되어 아직 안 바뀐 것인지 구별할 수 없습니다. 환자 두 명의 공통 증상만으로는 그것이 병의 특징인지 우연인지 알기 어려운 것과 같습니다. 환자가 스무 명이 되어도 모두에게 나타나는 소견이라면 이야기가 달라집니다.

**다중 서열 정렬(multiple sequence alignment, MSA)** 은 셋 이상의 서열을 한 표에 맞춰 놓는 것입니다. 행은 서열, 열(칸)은 "진화적으로 같은 자리"입니다. 여러 종에 걸쳐 한 칸의 글자가 모두 같다면 그 자리는 오랜 시간 동안 바뀌는 것이 허용되지 않았다는 뜻이고, S2에서 말한 보존의 증거가 훨씬 단단해집니다. Clustal 계열 프로그램의 출력 아래 줄에 붙는 기호가 이 정보입니다. `*`는 모두 같은 글자, `:`는 성질이 매우 비슷한 글자들, `.`는 약하게 비슷한 글자들입니다.

MSA는 그 자체가 목적이라기보다 다음 분석의 재료입니다. 보존된 자리 찾기, 단백질 가족의 프로파일 만들기, 그리고 내일(S7)의 계통수가 모두 MSA에서 출발합니다.

### progressive 정렬: 가까운 것부터 차례로

S4의 동적 프로그래밍을 서열 세 개로 늘리면 표가 정육면체가 되고, 열 개면 10차원이 됩니다. 계산량이 감당할 수 없이 커집니다. 그래서 대부분의 프로그램은 근사 방법인 **progressive(점진적) 정렬**을 씁니다.

1. 모든 쌍을 정렬해 서로 얼마나 다른지 **거리**를 구합니다.
2. 거리로 **guide tree(안내 나무)** 를 만듭니다. 어떤 것끼리 먼저 묶을지 정하는 순서표입니다.
3. 나무를 따라 **가장 가까운 쌍부터** 정렬하고, 이미 정렬된 묶음에 다음 서열(또는 묶음)을 차례로 붙입니다.

단체 사진을 찍을 때 먼저 가족끼리 줄을 맞추고, 그 가족 단위를 옮겨 가며 전체 줄을 맞추는 것과 비슷합니다. 약점도 여기서 나옵니다. 한번 넣은 gap은 뒤에서 다시 고치지 않습니다. 초반의 실수가 끝까지 남는다는 뜻입니다. 그래서 너무 먼 서열을 섞으면 정렬 품질이 떨어지고, 결과를 눈으로 확인해 이상한 구간을 걸러 내는 일이 필요합니다. ClustalW가 이 방식의 대표이고, 지금은 Clustal Omega, MUSCLE, MAFFT처럼 정렬을 반복해서 다듬는 프로그램을 많이 씁니다.

### 프로파일과 PSSM: 자리마다 다른 채점표

MSA가 있으면 칸마다 어떤 글자가 몇 번 나왔는지 셀 수 있습니다. 이 집계를 **프로파일(profile)** 이라고 하고, 배경 빈도와 비교해 log-odds로 바꾼 것이 **PSSM**(position-specific scoring matrix, 위치별 점수 행렬)입니다. 계산은 S3과 똑같습니다. 달라진 것은 점수표가 하나가 아니라 **칸마다 하나씩** 있다는 점입니다.

BLOSUM62는 류신이 이소류신으로 바뀌면 어느 자리에서나 같은 점수를 줍니다. 하지만 실제로는 활성 부위의 류신은 절대 바뀌면 안 되고, 표면 고리의 류신은 무엇으로 바뀌어도 괜찮을 수 있습니다. PSSM은 그 차이를 담습니다. 채용 공고에 비유하면, 치환 행렬은 "모든 직무에 공통인 평가표"이고 PSSM은 "이 자리 전용 평가표"입니다.

한 번도 관찰되지 않은 글자는 빈도가 0이라 로그를 씌울 수 없습니다. 그래서 모든 칸에 작은 수를 더해 주는데, 이것을 **pseudocount**라고 합니다. Day F5에서 0으로 나누기를 피하려고 썼던 것과 같은 장치입니다.

### PSI-BLAST와 profile HMM

PSSM을 검색에 쓰면 먼 친척을 더 잘 찾습니다. **PSI-BLAST**는 보통의 BLAST로 찾은 결과를 정렬해 PSSM을 만들고, 그 PSSM으로 다시 검색하고, 새로 찾은 서열을 더해 PSSM을 고치기를 반복합니다. 가족의 "평균적인 모습"이 점점 뚜렷해져 서열 하나로는 닿지 않던 친척까지 닿습니다. 다만 중간에 관계없는 서열이 한 번 섞이면 프로파일이 그쪽으로 끌려가 엉뚱한 것들을 계속 끌어들일 수 있습니다.

PSSM은 gap을 다루기 어렵습니다. **profile HMM**(hidden Markov model)은 칸마다 "일치", "삽입", "결실" 세 가지 상태를 두고, 각 상태에서 어떤 글자가 나올 확률과 다음 상태로 넘어갈 확률을 함께 담은 모형입니다. 어느 자리에서 삽입이 흔한지까지 학습한다는 뜻입니다. 단백질 도메인 데이터베이스인 Pfam이 이 방식으로 가족을 정의합니다. 오늘은 이름과 발상만 알아 두면 충분합니다.

> **참고 문헌:** Thompson, Higgins, Gibson, "CLUSTAL W", *Nucleic Acids Research* 22:4673–4680 (1994), [doi:10.1093/nar/22.22.4673](https://doi.org/10.1093/nar/22.22.4673) · Altschul et al., "Gapped BLAST and PSI-BLAST", *Nucleic Acids Research* 25:3389–3402 (1997), [doi:10.1093/nar/25.17.3389](https://doi.org/10.1093/nar/25.17.3389) · [EMBL-EBI Clustal Omega](https://www.ebi.ac.uk/jdispatcher/msa/clustalo)

## 예시로 이해하기

> 예시의 서열(`seqA`–`seqE`, DNA 결합 자리)은 모두 연습용으로 지어낸 **가상 값**입니다. 실제 종이나 단백질의 서열이 아닙니다.

### 예시 1 — 칸별 보존도와 consensus

```python
from collections import Counter

msa = {                              # 가상의 다중 정렬 (이미 정렬된 상태, '-'는 gap)
    "seqA": "MKTEGVLAAQ-EKTKQGV",
    "seqB": "MKTEGVMAAQ-EKTKQGV",
    "seqC": "MKSEGVVAAQ-EKSKQGV",
    "seqD": "MKTDGVLAASGEKTKEGV",
    "seqE": "MRSEGIVAAS-DKTREGV",
}
names = list(msa)
length = len(msa[names[0]])
assert all(len(seq) == length for seq in msa.values())

consensus = ""
marks = ""
for col in range(length):
    column = [msa[name][col] for name in names]
    letter, count = Counter(column).most_common(1)[0]
    consensus += letter
    if count == len(names) and letter != "-":
        marks += "*"                          # 모든 서열이 같은 글자
    elif count >= 4:
        marks += "+"                          # 5개 중 4개 이상이 같음
    else:
        marks += " "

for name in names:
    print(f"{name:9s} {msa[name]}")
print(f"{'':9s} {marks}")
print(f"{'consensus':9s} {consensus}")
print("완전히 보존된 칸:", marks.count("*"), "/", length)
```

출력:

```text
seqA      MKTEGVLAAQ-EKTKQGV
seqB      MKTEGVMAAQ-EKTKQGV
seqC      MKSEGVVAAQ-EKSKQGV
seqD      MKTDGVLAASGEKTKEGV
seqE      MRSEGIVAAS-DKTREGV
          *+ +*+ ** ++*++ **
consensus MKTEGVLAAQ-EKTKQGV
완전히 보존된 칸: 7 / 18
```

`*`가 붙은 일곱 칸은 다섯 서열이 모두 같고, `+`는 넷 이상이 같습니다. consensus는 칸마다 가장 흔한 글자를 이은 것입니다. 열한 번째 칸은 `seqD`에만 글자(G)가 있고 나머지는 gap입니다. `seqD`에 삽입이 있었거나 다른 서열들에서 결실이 있었다는 뜻인데, 정렬만으로는 어느 쪽인지 알 수 없습니다.

### 예시 2 — PSSM을 만들어 서열 훑기

```python
import numpy as np
import pandas as pd

sites = [            # 어떤 단백질이 붙는 가상의 DNA 자리 8개 (이미 정렬됨)
    "TGACGT",
    "TGACGC",
    "TGATGT",
    "TGACGT",
    "CGACGT",
    "TGACAT",
    "TGACGT",
    "TTACGT",
]
BASES = "ACGT"
n_sites, width = len(sites), len(sites[0])

counts = pd.DataFrame(0, index=list(BASES), columns=range(1, width + 1))
for site in sites:
    for pos, base in enumerate(site, start=1):
        counts.loc[base, pos] += 1

PSEUDO = 1                                             # 한 번도 안 나온 글자도 확률 0이 되지 않게
freq = (counts + PSEUDO) / (n_sites + 4 * PSEUDO)
pssm = np.log2(freq / 0.25)                            # 배경 빈도 0.25와 비교한 log-odds

print(counts)
print()
print(pssm.round(2))

def pssm_score(window):
    return sum(pssm.loc[base, pos] for pos, base in enumerate(window, start=1))

target = "AAGCTGACGTTCATTGATGTCC"
print()
for start in range(len(target) - width + 1):
    window = target[start:start + width]
    s = pssm_score(window)
    if s > 3:
        print(f"위치 {start + 1:2d}  {window}  점수 {s:5.2f}")
```

출력:

```text
   1  2  3  4  5  6
A  0  0  8  0  1  0
C  1  0  0  7  0  1
G  0  7  0  0  7  0
T  7  1  0  1  0  7

      1     2     3     4     5     6
A -1.58 -1.58  1.58 -1.58 -0.58 -1.58
C -0.58 -1.58 -1.58  1.42 -1.58 -0.58
G -1.58  1.42 -1.58 -1.58  1.42 -1.58
T  1.42 -0.58 -1.58 -0.58 -1.58  1.42

위치  5  TGACGT  점수  8.66
위치 15  TGATGT  점수  6.66
```

위 표는 자리별 글자 수, 아래 표는 log-odds 점수입니다. 3번 자리는 여덟 개 모두 A라서 A에 +1.58, 나머지에 −1.58이 들어갔습니다. 4번 자리는 C가 일곱, T가 하나라 T의 벌점이 −0.58로 가볍습니다. 이 PSSM으로 긴 서열을 여섯 글자씩 훑으면 두 곳이 높은 점수를 받습니다. 15번 위치의 `TGATGT`는 4번 자리가 T이지만, 그 자리의 변이는 원래 관대하게 채점되므로 여전히 높은 점수(6.66)가 나옵니다. 위치마다 채점이 다르다는 것이 바로 이 뜻입니다.

### 예시 3 — progressive 정렬의 첫 단계: 누구부터 묶을까

```python
import numpy as np
import pandas as pd

def nw_align(a, b, match=1, mismatch=-1, gap=-2):
    """S4의 전역 정렬을 줄인 버전. 정렬된 두 문자열을 돌려준다."""
    n, m = len(a), len(b)
    F = np.zeros((n + 1, m + 1), dtype=int)
    F[:, 0] = gap * np.arange(n + 1)
    F[0, :] = gap * np.arange(m + 1)
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            s = match if a[i - 1] == b[j - 1] else mismatch
            F[i, j] = max(F[i - 1, j - 1] + s, F[i - 1, j] + gap, F[i, j - 1] + gap)
    out_a, out_b, i, j = "", "", n, m
    while i > 0 or j > 0:
        s = match if i > 0 and j > 0 and a[i - 1] == b[j - 1] else mismatch
        if i > 0 and j > 0 and F[i, j] == F[i - 1, j - 1] + s:
            out_a, out_b, i, j = a[i - 1] + out_a, b[j - 1] + out_b, i - 1, j - 1
        elif i > 0 and F[i, j] == F[i - 1, j] + gap:
            out_a, out_b, i = a[i - 1] + out_a, "-" + out_b, i - 1
        else:
            out_a, out_b, j = "-" + out_a, b[j - 1] + out_b, j - 1
    return out_a, out_b

def distance(a, b):
    """정렬한 뒤 '다른 칸의 비율'을 거리로 쓴다."""
    x, y = nw_align(a, b)
    return sum(p != q for p, q in zip(x, y)) / len(x)

seqs = {                              # 정렬하기 전의 가상 서열 (gap 없음)
    "seqA": "MKTEGVLAAQEKTKQGV",
    "seqB": "MKTEGVMAAQEKTKQGV",
    "seqC": "MKSEGVVAAQEKSKQGV",
    "seqD": "MKTDGVLAASGEKTKEGV",
    "seqE": "MRSEGIVAASDKTREGV",
}
names = list(seqs)
D = pd.DataFrame(0.0, index=names, columns=names)
for x in names:
    for y in names:
        D.loc[x, y] = distance(seqs[x], seqs[y])
print(D.round(2))

pairs = [(D.loc[x, y], x, y) for i, x in enumerate(names) for y in names[i + 1:]]
print("\n가까운 쌍부터:")
for d, x, y in sorted(pairs)[:4]:
    print(f"  {x} – {y} 거리 {d:.2f}")
```

출력:

```text
      seqA  seqB  seqC  seqD  seqE
seqA  0.00  0.06  0.18  0.22  0.47
seqB  0.06  0.00  0.18  0.28  0.47
seqC  0.18  0.18  0.00  0.39  0.41
seqD  0.22  0.28  0.39  0.00  0.44
seqE  0.47  0.47  0.41  0.44  0.00

가까운 쌍부터:
  seqA – seqB 거리 0.06
  seqA – seqC 거리 0.18
  seqB – seqC 거리 0.18
  seqA – seqD 거리 0.22
```

`nw_align`은 S4의 함수를 짧게 줄인 것입니다. 모든 쌍을 정렬해 "다른 칸의 비율"을 거리로 삼았습니다. 가장 가까운 `seqA`–`seqB`가 먼저 정렬되고, 그 묶음에 `seqC`가 붙는 식으로 진행됩니다. `seqE`는 누구와도 멀어서 마지막에 들어갑니다. 이 거리 표는 내일 계통수를 만들 때 쓰는 것과 같은 종류의 표입니다.

## 직접 해보기

1. `notebooks/supplement/S6_msa_profile.ipynb`를 만들고 예시 1–3을 실행합니다.

2. **보존도를 숫자로.** 예시 1의 반복문 안에서 `count / len(names)`를 리스트에 모아, 칸 번호와 보존 비율을 `pandas` DataFrame으로 만들고 비율이 1.0인 칸 번호를 출력합니다.

3. **pseudocount의 효과.** 예시 2에서 `PSEUDO = 1`을 `PSEUDO = 0.01`로 바꿔 PSSM을 다시 출력합니다. 한 번도 관찰되지 않은 글자의 점수가 얼마나 내려가는지, 그 결과 `pssm_score("TGACGA")`(6번 자리에 한 번도 관찰되지 않은 A가 있는 후보)의 점수가 어떻게 달라지는지 적습니다. 자리 여덟 개만 보고 "절대 안 나온다"고 단정하는 것이 왜 위험한지 한 줄로 정리합니다.

4. **새 후보 채점.** `pssm_score("TGACGT")`, `pssm_score("TGACGA")`, `pssm_score("AAAAAA")`를 실행하고 점수 순서를 설명합니다.

5. **먼 서열 섞어 보기.** 예시 3의 `seqs`에 `"seqF": "MPLWQRSTCNHYFDIAG"`(전혀 닮지 않은 가상 서열)를 추가해 거리 표를 다시 만듭니다. 이 서열이 guide tree의 어디에 붙을지, progressive 정렬에 넣었을 때 어떤 문제가 생길지 적습니다.

6. **(선택) 실제 도구로 정렬하기.** UniProt에서 사람 SNCA(`P37840`), SNCB(`Q16143`), SNCG(`O76070`)의 FASTA를 받아 [EMBL-EBI Clustal Omega](https://www.ebi.ac.uk/jdispatcher/msa/clustalo)에 붙여 넣고 정렬합니다. 결과에서 `*`가 몰려 있는 구간이 서열의 앞쪽인지 뒤쪽인지 관찰해 적습니다. 관찰만 적고, 그 구간의 기능은 UniProt 항목의 설명을 읽고 출처와 함께 적습니다.

7. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — `AssertionError`(예시 1).** 정렬된 서열은 길이가 모두 같아야 합니다. gap(`-`)을 하나 빼먹으면 그 뒤 칸이 전부 한 칸씩 밀려 엉뚱한 글자끼리 비교하게 됩니다. `assert`가 이 실수를 잡아 줍니다.

⚠️ **흔한 오류 2 — 정렬 결과를 사실로 받아들이기.** MSA는 프로그램이 내놓은 **추정**입니다. 특히 gap이 많은 구간과 서열 양 끝은 믿기 어렵습니다. 그 구간의 `*` 하나에 큰 의미를 싣지 마세요.

## 퀴즈

**1.** MSA의 한 열(칸)이 나타내는 것은?

(a) 한 종의 서열 전체 (b) 여러 서열에서 진화적으로 대응하는 같은 자리 (c) 한 유전자의 여러 isoform (d) 치환 행렬의 한 줄

<details><summary>정답 보기</summary>

(b). 행이 서열이고 열이 대응하는 자리입니다. 그래서 한 열 안의 글자들을 비교하면 그 자리가 얼마나 보존되었는지 알 수 있습니다.

</details>

**2.** progressive 정렬에서 가장 먼저 정렬되는 것은? (단답)

<details><summary>정답 보기</summary>

거리가 가장 가까운(가장 비슷한) 두 서열입니다. 쌍별 거리로 만든 guide tree의 순서를 따라 가까운 것부터 묶고, 먼 서열은 나중에 붙입니다.

</details>

**3.** progressive 정렬의 대표적인 약점은?

(a) 서열이 세 개를 넘으면 쓸 수 없다 (b) 초반에 잘못 넣은 gap이 뒤에서 고쳐지지 않는다 (c) 단백질에는 쓸 수 없다 (d) 항상 gap이 없는 정렬만 만든다

<details><summary>정답 보기</summary>

(b). 한번 정렬된 묶음은 고정된 채로 다음 서열과 맞춰지기 때문입니다. 그래서 반복해서 다듬는 방식의 프로그램이 나왔고, 결과를 눈으로 확인하는 과정도 필요합니다.

</details>

**4.** PSSM이 BLOSUM62 같은 치환 행렬과 다른 점은? (단답)

<details><summary>정답 보기</summary>

점수가 서열의 위치마다 따로 있다는 점입니다. 치환 행렬은 같은 글자 쌍에 어디서나 같은 점수를 주지만, PSSM은 엄격하게 보존된 자리에서는 변이를 크게 벌하고 변이가 많은 자리에서는 가볍게 벌합니다.

</details>

**5.** PSSM을 만들 때 pseudocount를 더하는 이유는?

(a) 계산을 빠르게 하려고 (b) 관찰되지 않은 글자의 빈도가 0이 되어 로그를 계산할 수 없게 되는 것을 막으려고 (c) gap을 표현하려고 (d) 점수를 정수로 만들려고

<details><summary>정답 보기</summary>

(b). 표본이 작으면 "안 나온 것"과 "나올 수 없는 것"을 구별할 수 없습니다. 작은 수를 더해 두면 로그 계산이 가능해지고, 관찰되지 않은 글자에도 지나치게 극단적이지 않은 벌점이 매겨집니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 가상 MSA에서 완전히 보존된 칸과 consensus를 구했다.
- [ ] PSSM을 만들어 서열을 훑고, pseudocount를 바꿨을 때의 변화를 적었다.
- [ ] 쌍별 거리 표에서 progressive 정렬의 순서를 읽어 냈다.
- [ ] 치환 행렬과 PSSM의 차이를 한 문장으로 설명할 수 있다.

---
[← 이전](day-S5.md) · [코스 지도](../../README.md) · [다음 →](day-S7.md)
