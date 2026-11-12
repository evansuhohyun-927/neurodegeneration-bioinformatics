# Day S7 — 분자진화와 계통수: 거리에서 나무로

> **주차:** 보충 단원 · **예상 시간:** 75–90분 · **산출물:** `notebooks/supplement/S7_phylogenetics.ipynb`
>
> **먼저 끝내 둘 레슨:** Day S6 (MSA와 거리 표), Day 30 (bootstrap)을 했다면 예시 3이 쉽습니다.

## 오늘의 목표
- 계통수의 구성 요소(잎, 마디, 가지 길이, 뿌리)를 읽고, 분자 시계의 발상을 설명할 수 있다.
- 정렬된 서열에서 p-distance를 구하고 Jukes–Cantor 보정을 적용할 수 있다.
- 거리 행렬에서 UPGMA로 나무를 만들고, bootstrap 지지도가 무엇을 뜻하는지 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [Understanding and building phylogenetic trees | High school biology | Khan Academy — Khan Academy](https://www.youtube.com/watch?v=6_XMKmFQ_w8) (10:56)
- **무엇에 주목할까:** 나무에서 "누가 누구와 더 가까운가"는 잎이 나열된 순서가 아니라 **가장 최근의 공통 조상이 어디인가**로 읽는다는 점에 주목하세요. 마디를 축으로 가지를 돌려도 같은 나무라는 것을 확인해 두면 Newick 표기를 읽을 때 헷갈리지 않습니다.

- [The UPGMA algorithm for distance-based tree construction — Biotech and Bioinformatics with Prof Greg](https://www.youtube.com/watch?v=061ukTACDvY) (13:26)
- **무엇에 주목할까:** 거리 표에서 가장 작은 값을 찾아 묶고, 표를 한 줄 줄여 다시 쓰는 과정이 반복됩니다. 묶은 뒤 새 거리를 어떻게 계산하는지에 집중하세요. 예시 2의 코드가 그 과정을 그대로 옮긴 것입니다.

## 개념 설명

### 계통수 읽기

**계통수(phylogenetic tree)** 는 서열(또는 종)들이 공통 조상에서 갈라져 온 순서를 그린 가설입니다. 가계도와 닮았지만, 가계도는 기록으로 그리고 계통수는 지금 남아 있는 서열의 차이로 **추정**한다는 점이 다릅니다.

용어는 넷이면 됩니다. **잎(leaf, tip)** 은 우리가 실제로 가진 서열입니다. **내부 마디(node)** 는 추정된 공통 조상이고, 마디에서 갈라져 나온 잎 전체를 **clade(분기군)** 라고 합니다. **가지 길이(branch length)** 는 그 가지에서 일어난 변화의 양(자리당 치환 수)을 뜻합니다. **뿌리(root)** 는 전체의 공통 조상 자리입니다. 뿌리가 있는 나무는 시간의 방향을 말해 주고, 뿌리가 없는 나무는 관계만 말해 줍니다.

나무를 글자로 적는 표준이 **Newick 형식**입니다. `((A:0.1,B:0.1):0.2,C:0.3);`은 "A와 B가 먼저 묶이고, 그 묶음이 C와 묶인다"는 뜻이며 콜론 뒤 숫자가 가지 길이입니다. 괄호가 곧 clade입니다.

### 분자 시계: 차이를 시간으로 바꾸기

1960년대에 Zuckerkandl과 Pauling은 여러 종의 같은 단백질을 비교해, 아미노산 차이의 수가 화석으로 추정한 분기 시점과 대체로 비례한다는 것을 알아챘습니다. 서열이 일정한 속도로 바뀐다면 차이를 시간으로 환산할 수 있습니다. 이것이 **분자 시계(molecular clock)** 입니다.

계산은 단순합니다. 두 서열 사이의 자리당 치환 수를 `K`, 갈라진 뒤 흐른 시간을 `T`라고 하면 치환 속도는 `r = K / (2T)`입니다. 2로 나누는 이유는 공통 조상에서 갈라진 뒤 **양쪽 계통이 각자** `T`만큼 변해 왔기 때문입니다. 분기 시점을 아는 한 쌍으로 `r`을 구해 두면(보정, calibration), 다른 쌍의 `K`에서 `T = K / (2r)`로 시간을 거꾸로 추정할 수 있습니다.

다만 시계는 단백질마다 빠르기가 다릅니다. 기능상 제약이 큰 단백질은 느리고, 제약이 작은 단백질은 빠릅니다(S2의 보존 이야기와 같은 원리입니다). 같은 유전자라도 계통에 따라 속도가 달라지기도 합니다. 그래서 분자 시계로 얻은 연대는 넓은 오차를 가진 추정으로 읽습니다.

### 보이는 차이와 실제 변화: Jukes–Cantor 보정

두 서열에서 다른 자리의 비율을 **p-distance**라고 합니다. 문제는 이것이 실제로 일어난 치환을 **적게** 센다는 점입니다. 같은 자리가 A→G→T로 두 번 바뀌어도 눈에는 한 번의 차이로 보이고, A→G→A로 되돌아오면 차이가 아예 보이지 않습니다. 화이트보드를 여러 번 지우고 다시 쓰면 마지막 글자만 남는 것과 같습니다. 시간이 오래 지날수록 겹쳐 쓴 자리가 늘어 p-distance는 실제 변화량을 따라가지 못하고, 무작위 수준(DNA는 0.75)에서 멈춥니다.

**Jukes–Cantor 모형**은 가장 단순한 가정으로 이 누락을 보정합니다. 네 염기가 같은 빈도로 있고, 어떤 염기든 다른 세 염기로 같은 속도로 바뀐다고 가정하면, 관찰한 비율 `p`에서 자리당 실제 치환 수 `d`를 다음 식으로 추정할 수 있습니다.

`d = −(3/4) × ln(1 − (4/3) × p)`

`p`가 작으면 `d`는 `p`와 거의 같고, `p`가 커질수록 `d`가 훨씬 커집니다. transition과 transversion의 속도를 따로 두는 모형(Kimura), 염기 빈도 차이까지 넣는 모형 등 더 정교한 것들이 있지만 발상은 같습니다.

### 거리에서 나무로: UPGMA, 그리고 그 너머

거리 행렬이 있으면 나무를 만들 수 있습니다. 가장 단순한 방법이 **UPGMA**입니다.

1. 거리 표에서 가장 가까운 두 묶음을 찾아 하나로 합칩니다. 새 마디의 높이는 그 거리의 절반입니다.
2. 새 묶음과 나머지 묶음들 사이의 거리를 **평균**으로 다시 계산합니다.
3. 묶음이 하나 남을 때까지 되풀이합니다.

UPGMA는 **모든 계통이 같은 속도로 변했다**(분자 시계가 정확하다)고 가정합니다. 그래서 뿌리에서 모든 잎까지의 길이가 같은 나무가 나옵니다. 어떤 계통이 유난히 빨리 변했다면 그 계통은 실제보다 먼 친척으로 잘못 배치될 수 있습니다. **Neighbor-joining(NJ)** 은 이 가정 없이 가지마다 다른 길이를 허용하는 거리 기반 방법이고, 뿌리 없는 나무를 만듭니다. 거리로 요약하지 않고 정렬의 각 칸을 직접 쓰는 방법(최대 절약, 최대 가능도, 베이즈)도 있는데, 이 코스에서는 이름만 알아 둡니다.

나무의 각 묶음을 얼마나 믿을지는 **bootstrap**으로 가늠합니다. Day 30에서 참가자를 복원추출했듯이, 여기서는 정렬의 **칸(열)** 을 복원추출해 가짜 정렬을 만들고 나무를 다시 그립니다. 이것을 수백 번 반복해 원래 나무의 clade가 몇 퍼센트에서 다시 나타나는지를 셉니다. 지지도가 높으면 그 묶음이 정렬의 일부 칸에만 기대고 있지 않다는 뜻입니다. 가지 길이가 아니라 **묶이는 순서**에 대한 값이며, 지지도 95%가 "95% 확률로 진실"이라는 뜻은 아닙니다.

> **참고 문헌:** Jukes & Cantor, "Evolution of protein molecules", in *Mammalian Protein Metabolism* (Academic Press, 1969) · Saitou & Nei, "The neighbor-joining method", *Molecular Biology and Evolution* 4:406–425 (1987), [doi:10.1093/oxfordjournals.molbev.a040454](https://doi.org/10.1093/oxfordjournals.molbev.a040454) · Felsenstein, "Confidence limits on phylogenies: an approach using the bootstrap", *Evolution* 39:783–791 (1985), [doi:10.1111/j.1558-5646.1985.tb00420.x](https://doi.org/10.1111/j.1558-5646.1985.tb00420.x)

## 예시로 이해하기

> 예시의 서열 A–E는 코드 안에서 무작위로 만들어 낸 **가상 서열**입니다. 정답 나무 `((A,B),(C,D)),E`를 미리 정해 놓고 그에 따라 변이를 넣었으므로, 방법이 정답을 되찾는지 확인할 수 있습니다.

### 예시 1 — p-distance와 Jukes–Cantor 거리

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(7)
BASES = np.array(list("ACGT"))

def evolve(seq, expected_changes_per_site):
    """각 자리가 주어진 확률로 다른 염기로 바뀐 '자손 서열'을 만든다."""
    seq = seq.copy()
    hit = rng.random(len(seq)) < expected_changes_per_site
    for pos in np.where(hit)[0]:
        seq[pos] = rng.choice(BASES[BASES != seq[pos]])
    return seq

# 정답을 아는 가상 계통: ((A,B),(C,D)),E
root = rng.choice(BASES, 300)
ab = evolve(root, 0.06); cd = evolve(root, 0.06)
seqs = {
    "A": evolve(ab, 0.03), "B": evolve(ab, 0.03),
    "C": evolve(cd, 0.05), "D": evolve(cd, 0.05),
    "E": evolve(root, 0.15),
}
names = list(seqs)

def p_distance(x, y):
    return (x != y).mean()                       # 다른 자리의 비율

def jukes_cantor(p):
    return -0.75 * np.log(1 - 4 * p / 3)         # 겹쳐 일어난 치환을 보정

assert jukes_cantor(0.0) == 0
P = pd.DataFrame([[p_distance(seqs[a], seqs[b]) for b in names] for a in names],
                 index=names, columns=names)
JC = jukes_cantor(P) + 0.0                    # + 0.0은 "-0.000" 표시를 없애는 용도
print("p-distance")
print(P.round(3))
print("\nJukes–Cantor distance")
print(JC.round(3))

print("\np가 커질수록 보정도 커진다")
for p in [0.05, 0.20, 0.40, 0.60]:
    print(f"  p = {p:.2f} → d = {jukes_cantor(p):.3f}")
```

출력:

```text
p-distance
       A      B      C      D      E
A  0.000  0.053  0.177  0.170  0.233
B  0.053  0.000  0.163  0.160  0.217
C  0.177  0.163  0.000  0.087  0.230
D  0.170  0.160  0.087  0.000  0.230
E  0.233  0.217  0.230  0.230  0.000

Jukes–Cantor distance
       A      B      C      D      E
A  0.000  0.055  0.201  0.193  0.280
B  0.055  0.000  0.184  0.180  0.256
C  0.201  0.184  0.000  0.092  0.275
D  0.193  0.180  0.092  0.000  0.275
E  0.280  0.256  0.275  0.275  0.000

p가 커질수록 보정도 커진다
  p = 0.05 → d = 0.052
  p = 0.20 → d = 0.233
  p = 0.40 → d = 0.572
  p = 0.60 → d = 1.207
```

A–B가 가장 가깝고(0.053), 그다음이 C–D(0.087)입니다. Jukes–Cantor 거리는 항상 p-distance보다 크고, 먼 쌍일수록 차이가 벌어집니다(A–E: 0.233 → 0.280). 아래 네 줄이 그 경향을 보여 줍니다. `p`가 0.05일 때는 거의 그대로지만 0.60이면 보정값이 두 배가 됩니다.

### 예시 2 — UPGMA로 나무 만들기

```python
import pandas as pd

def upgma(D):
    """거리 행렬(DataFrame)을 받아 Newick 문자열과 합친 순서를 돌려준다."""
    D = D.copy()
    size = {name: 1 for name in D.index}        # 각 묶음에 든 서열 수
    height = {name: 0.0 for name in D.index}    # 각 묶음의 높이(잎은 0)
    steps = []
    while len(D) > 1:
        labels = list(D.index)
        pairs = [(D.loc[x, y], x, y) for i, x in enumerate(labels) for y in labels[i + 1:]]
        d, x, y = min(pairs)                    # 가장 가까운 두 묶음
        h = d / 2                               # 새 마디의 높이 = 거리의 절반
        new = f"({x}:{h - height[x]:.3f},{y}:{h - height[y]:.3f})"
        steps.append((x, y, round(d, 3)))

        others = [z for z in labels if z not in (x, y)]
        new_row = {z: (D.loc[x, z] * size[x] + D.loc[y, z] * size[y]) / (size[x] + size[y])
                   for z in others}             # 묶음 크기로 가중한 평균 거리
        D = D.loc[others, others]
        for z in others:
            D.loc[new, z] = new_row[z]
            D.loc[z, new] = new_row[z]
        D.loc[new, new] = 0.0
        size[new] = size[x] + size[y]
        height[new] = h
    return D.index[0] + ";", steps

D = pd.DataFrame(                       # 예시 1에서 나온 Jukes–Cantor 거리
    [[0.000, 0.055, 0.201, 0.193, 0.280],
     [0.055, 0.000, 0.184, 0.180, 0.256],
     [0.201, 0.184, 0.000, 0.092, 0.275],
     [0.193, 0.180, 0.092, 0.000, 0.275],
     [0.280, 0.256, 0.275, 0.275, 0.000]],
    index=list("ABCDE"), columns=list("ABCDE"))

newick, steps = upgma(D)
for number, (x, y, d) in enumerate(steps, start=1):
    print(f"{number}단계: {x} + {y}  (거리 {d})")
print(newick)
```

출력:

```text
1단계: A + B  (거리 0.055)
2단계: C + D  (거리 0.092)
3단계: (A:0.028,B:0.028) + (C:0.046,D:0.046)  (거리 0.19)
4단계: E + ((A:0.028,B:0.028):0.067,(C:0.046,D:0.046):0.049)  (거리 0.272)
(E:0.136,((A:0.028,B:0.028):0.067,(C:0.046,D:0.046):0.049):0.041);
```

네 번 합쳐서 나무 하나가 되었습니다. 3단계의 거리 0.19는 A·B 묶음과 C·D 묶음 사이의 네 거리(0.201, 0.193, 0.184, 0.180)의 평균입니다. 마지막 줄이 Newick 표기입니다. 괄호를 따라 읽으면 `((A,B),(C,D))`가 먼저 묶이고 E가 바깥에 붙어, 서열을 만들 때 정해 둔 정답과 같습니다. A와 B의 가지 길이가 0.028로 똑같은 것은 UPGMA가 두 계통의 속도가 같다고 가정하기 때문입니다.

### 예시 3 — bootstrap 지지도

```python
# 예시 1(seqs, names, p_distance, jukes_cantor)과 예시 2(upgma)를 실행한 노트북에서 이어서 실행
def clades(steps):
    """합쳐진 묶음마다 그 안의 잎 이름 집합을 돌려준다."""
    found = set()
    for x, y, _ in steps:
        leaves = frozenset(ch for ch in x + y if ch in names)
        found.add(leaves)
    return found

def tree_from(columns):
    sub = {name: seqs[name][columns] for name in names}
    P = pd.DataFrame([[p_distance(sub[a], sub[b]) for b in names] for a in names],
                     index=names, columns=names)
    return upgma(jukes_cantor(P) + 0.0)

n_sites = len(seqs["A"])
_, original_steps = tree_from(np.arange(n_sites))
original = clades(original_steps)

N_BOOT = 200
support = {clade: 0 for clade in original}
for _ in range(N_BOOT):
    columns = rng.integers(0, n_sites, n_sites)      # 자리(열)를 복원추출
    _, steps = tree_from(columns)
    for clade in clades(steps):
        if clade in support:
            support[clade] += 1

for clade, count in sorted(support.items(), key=lambda item: (len(item[0]), sorted(item[0]))):
    print(f"{''.join(sorted(clade)):6s} bootstrap 지지도 {count / N_BOOT:.0%}")
```

출력:

```text
AB     bootstrap 지지도 100%
CD     bootstrap 지지도 100%
ABCD   bootstrap 지지도 97%
ABCDE  bootstrap 지지도 100%
```

300개 자리를 복원추출해 나무를 200번 다시 그렸습니다. A·B 묶음과 C·D 묶음은 매번 나타났고, 그 둘이 합쳐진 ABCD 묶음은 97%에서 나타났습니다. 나머지 3%에서는 E가 안쪽으로 들어온 다른 모양이 나왔다는 뜻입니다. ABCDE는 전체이므로 언제나 100%입니다.

## 직접 해보기

1. `notebooks/supplement/S7_phylogenetics.ipynb`를 만들고 예시 1, 2, 3을 **순서대로** 실행합니다. 예시 3은 앞의 두 셀에서 만든 변수와 함수를 씁니다.

2. **손으로 한 단계.** 예시 2의 거리 표에서 A와 B를 합친 뒤, 새 묶음 (AB)와 C 사이의 거리를 직접 계산합니다((0.201 + 0.184) ÷ 2). (AB)–D, (AB)–E도 구해 4 × 4 표를 종이에 적습니다.

3. **분자 시계 계산.** 가상의 설정으로, C와 D가 1,000만 년 전에 갈라졌다고 합시다. Jukes–Cantor 거리 0.092를 써서 치환 속도 `r = K / (2T)`를 구하고, 그 속도로 A–B(0.055)의 분기 시점을 추정합니다.

   ```python
   r = 0.092 / (2 * 10_000_000)
   print(r)
   print(0.055 / (2 * r) / 1_000_000, "백만 년")
   ```

   약 600만 년이 나옵니다. 이 숫자는 "속도가 일정하다"는 가정 위에 서 있다는 점을 옆에 적어 둡니다.

4. **서열이 짧으면.** 예시 1의 `rng.choice(BASES, 300)`에서 300을 60으로 바꾸고 예시 1과 예시 3을 다시 실행합니다. (예시 2는 거리 표를 직접 적어 넣은 것이라 바뀌지 않습니다. 달라진 결과는 예시 3의 출력에서 봅니다.) 어떤 묶음이 나타나는지, bootstrap 지지도가 어떻게 달라지는지 적습니다. 자리가 적으면 정답과 다른 묶음이 나올 수 있고 확신도 줄어든다는 것을 확인하는 단계입니다. 확인 후에는 300으로 되돌립니다.

5. **속도가 다른 계통.** 예시 1의 `"B": evolve(ab, 0.03)`을 `"B": evolve(ab, 0.25)`로 바꿔 B 계통만 빨리 변하게 한 뒤 예시 1과 예시 3을 다시 실행합니다. B가 여전히 A와 묶이는지 확인하고, UPGMA의 가정과 연결해 한 줄로 설명합니다. 확인 후 되돌립니다.

6. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — `RuntimeWarning: invalid value encountered in log`와 `nan`.** p-distance가 0.75 이상이면 Jukes–Cantor 식의 로그 안이 0 이하가 되어 계산할 수 없습니다. 서열이 너무 달라 "포화"되었다는 신호이지 코드 오류가 아닙니다. 짧은 서열에서 우연히 생기기도 합니다.

⚠️ **흔한 오류 2 — 잎의 나열 순서로 가까움을 읽기.** Newick이나 그림에서 E가 A 바로 옆에 적혀 있어도 가깝다는 뜻이 아닙니다. 마디를 축으로 가지를 돌리면 순서는 얼마든지 바뀝니다. 가까움은 **공통 조상 마디가 얼마나 최근인가**로 읽습니다.

## 퀴즈

**1.** 치환 속도를 `r = K / (2T)`로 계산할 때 2로 나누는 이유는?

(a) DNA가 이중 가닥이라서 (b) 갈라진 뒤 두 계통이 각각 T만큼 변해 왔기 때문에 (c) transition과 transversion 두 종류가 있어서 (d) 반올림 오차를 줄이려고

<details><summary>정답 보기</summary>

(b). 두 서열 사이의 차이 K는 공통 조상에서 한쪽으로 내려온 변화와 다른 쪽으로 내려온 변화를 합친 것입니다. 따라서 변화가 쌓인 총 시간은 2T입니다.

</details>

**2.** p-distance가 실제 치환 수를 적게 세는 이유는? (단답)

<details><summary>정답 보기</summary>

같은 자리에서 치환이 여러 번 일어나면 마지막 상태만 보이기 때문입니다. 두 번 바뀐 것이 한 번으로 보이거나, 원래 글자로 되돌아와 차이가 없는 것처럼 보입니다. Jukes–Cantor 같은 모형이 이 누락을 보정합니다.

</details>

**3.** UPGMA가 깔고 있는 가정은?

(a) 모든 서열의 길이가 같다 (b) 모든 계통의 변화 속도가 같다 (c) 서열이 단백질이다 (d) 뿌리가 없다

<details><summary>정답 보기</summary>

(b). 그래서 뿌리에서 모든 잎까지의 거리가 같은 나무가 나옵니다. 속도가 크게 다른 계통이 섞여 있으면 묶이는 순서가 틀릴 수 있고, 그럴 때는 neighbor-joining 같은 방법이 더 알맞습니다.

</details>

**4.** Newick 문자열 `((A:0.1,B:0.1):0.2,(C:0.15,D:0.15):0.15);`에서 A와 가장 가까운 것은? (단답)

<details><summary>정답 보기</summary>

B입니다. A와 B가 같은 괄호 안에 있어 가장 최근의 공통 조상을 공유합니다. C와 D는 다른 괄호(다른 clade)에 속합니다.

</details>

**5.** 계통수의 한 clade에 bootstrap 지지도 62%가 붙어 있습니다. 가장 알맞은 해석은?

(a) 그 묶음이 사실일 확률이 62%다 (b) 정렬의 칸을 다시 뽑아 나무를 그리면 62%에서 그 묶음이 다시 나타난다 (c) 두 서열의 identity가 62%다 (d) 가지 길이의 62%만 믿을 수 있다

<details><summary>정답 보기</summary>

(b). bootstrap은 자료를 다시 뽑았을 때 결과가 얼마나 안정적인지를 재는 값입니다. 62%면 그 묶음을 받치는 칸이 많지 않다는 뜻이므로, 그 부분의 분기 순서는 확정된 것으로 쓰지 않습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 가상 서열 다섯 개의 p-distance와 Jukes–Cantor 거리 표를 만들었다.
- [ ] UPGMA 한 단계를 손으로 계산해 코드 결과와 맞춰 보았다.
- [ ] Newick 문자열에서 clade를 읽어 낼 수 있다.
- [ ] bootstrap 지지도와, 서열 길이·계통별 속도를 바꿨을 때의 변화를 적었다.

---
[← 이전](day-S6.md) · [코스 지도](../../README.md) · [다음 → 코스 지도로 돌아가기](../../README.md)
