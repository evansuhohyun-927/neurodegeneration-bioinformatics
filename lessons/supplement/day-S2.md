# Day S2 — 돌연변이, 보존, 상동성: 서열이 달라지는 방식

> **주차:** 보충 단원 · **예상 시간:** 75–90분 · **산출물:** `notebooks/supplement/S2_mutation_homology.ipynb`
>
> **먼저 끝내 둘 레슨:** Day S1 (코돈 표와 `translate` 함수를 다시 씁니다).

## 오늘의 목표
- 점 돌연변이를 염기 수준(transition/transversion)과 단백질 수준(synonymous/missense/nonsense)으로 분류할 수 있다.
- 보존된 구간이 왜 생기는지, homolog·ortholog·paralog가 어떻게 다른지 설명할 수 있다.
- 정렬된 두 서열에서 percent identity와 similarity를 계산할 수 있다.

## 🎬 영상으로 먼저 보기

- [The different types of mutations | Biomolecules | MCAT | Khan Academy — khanacademymedicine](https://www.youtube.com/watch?v=xYOK-yzUWSI) (5:52)
- **무엇에 주목할까:** 이미 아는 내용일 테니 용어의 영어 표현을 귀에 익히는 데 집중하세요. 염기 하나가 바뀌는 경우와, 염기가 끼어들거나 빠져 읽기 틀이 밀리는 경우를 어떻게 구분해 부르는지 들어 두면 예시 1, 2의 코드가 곧바로 읽힙니다.

- [Lecture 11, concept 10: Homologs, orthologs & paralogs — Erik Lindahl](https://www.youtube.com/watch?v=rl-VagT9EtI) (3:53)
- **무엇에 주목할까:** 세 용어를 가르는 기준이 "서열이 얼마나 비슷한가"가 아니라 "어떤 사건(종 분화인가, 유전자 중복인가)으로 갈라졌는가"라는 점을 확인하세요.

## 개념 설명

### 돌연변이를 두 층으로 분류하기

돌연변이의 종류는 이미 알고 계실 것입니다. 코드로 다루려면 그것을 **두 층**으로 나누어 생각하면 편합니다.

첫째 층은 **염기 글자**입니다. A와 G는 퓨린, C와 T는 피리미딘입니다. 같은 계열 안에서 바뀌면(A↔G, C↔T) **transition**, 계열을 넘어 바뀌면 **transversion**입니다. 가능한 경우의 수는 transversion이 두 배 많지만, 실제 유전체에서는 transition이 더 자주 관찰됩니다.

둘째 층은 **단백질 글자**입니다. 코돈이 바뀌어도 같은 아미노산이면 **synonymous(동의)**, 다른 아미노산이 되면 **missense(과오)**, 종결 코돈이 되면 **nonsense**입니다. 염기가 3의 배수가 아닌 만큼 끼어들거나 빠지면 그 뒤의 읽기 틀이 모두 밀리는 **frameshift**가 됩니다.

두 층은 독립입니다. 예를 들어 파킨슨병 가족에서 처음 보고된 SNCA의 A53T 변이는 코돈 `GCA`가 `ACA`로 바뀐 것으로, 염기 층에서는 transition이고 단백질 층에서는 missense입니다. 분류는 "무슨 일이 일어났는가"를 말해 줄 뿐, 그 변이가 병을 일으키는지는 따로 근거가 필요하다는 점도 기억하세요.

### 보존: 고칠 수 없는 부품

여러 종의 같은 단백질을 나란히 놓으면 어떤 구간은 글자가 거의 같고 어떤 구간은 제각각입니다. 글자가 유지된 구간을 **보존된 구간(conserved region)** 이라고 합니다.

자동차에 비유해 봅시다. 여러 해 동안 모델이 바뀌어도 브레이크 구조는 거의 그대로이고, 컵홀더 모양은 해마다 달라집니다. 브레이크를 잘못 바꾼 차는 팔리지 못하고 사라졌기 때문입니다. 단백질도 같습니다. 돌연변이는 모든 자리에서 일어나지만, 활성 부위나 접힘에 꼭 필요한 자리가 바뀐 개체는 자손을 덜 남겨 그 변이가 집단에서 사라집니다. 반대로 기능에 영향이 없는 **중립(neutral)** 변이는 우연히 퍼져 남을 수 있습니다. 그래서 "보존되어 있다"는 "그 자리가 중요할 가능성이 높다"는 간접 증거가 됩니다. 3주차 Day 19에서 후보 유전자를 검토할 때 이 관점을 하나 더 얹을 수 있습니다.

### homolog, ortholog, paralog

공통 조상 유전자에서 갈라져 나온 유전자들을 **homolog(상동 유전자)** 라고 합니다. 갈라진 사건에 따라 둘로 나눕니다.

- **Ortholog**: **종이 갈라지면서** 나뉜 것. 사람 SNCA와 마우스 Snca가 그 예입니다. 보통 같은 기능을 유지합니다.
- **Paralog**: 한 유전체 안에서 **유전자가 중복된 뒤** 나뉜 것. 사람의 SNCA(140 aa), SNCB(134 aa), SNCG(127 aa)는 synuclein 가족의 paralog입니다. 중복된 사본은 원래 기능에서 조금씩 벗어날 여유가 있습니다.

이 구분은 코스의 해석 원칙과도 닿아 있습니다. 마우스 데이터(OSD-536)의 유전자를 사람 질환과 연결해 이야기할 때, 그 연결이 ortholog 관계인지 먼저 확인해야 합니다. 그리고 상동성은 **있거나 없는** 것이지 "70% 상동" 같은 정도가 아닙니다. 퍼센트로 말할 수 있는 것은 다음에 나오는 identity와 similarity입니다.

### identity와 similarity

두 서열을 정렬한 뒤 같은 칸에 같은 글자가 온 비율이 **percent identity**입니다. 분모는 정렬 길이이고, 여기에는 **gap(끼워 넣은 빈칸)도 포함**하는 것이 일반적입니다. **Similarity**는 여기에 "글자는 다르지만 성질이 비슷한 쌍"(예: 류신과 이소류신)까지 더한 비율입니다. 무엇을 비슷하다고 볼지는 기준 표가 필요한데, 그 표를 만드는 방법이 내일(S3)의 주제입니다.

한 가지 주의할 점은, 프로그램마다 분모를 다르게 잡을 수 있다는 것입니다(gap 제외, 짧은 서열 길이 기준 등). 논문의 "identity 45%"를 읽을 때는 무엇으로 나눴는지 확인하세요.

> **참고 문헌:** Polymeropoulos et al., "Mutation in the α-Synuclein Gene Identified in Families with Parkinson's Disease", *Science* 276:2045–2047 (1997), [doi:10.1126/science.276.5321.2045](https://doi.org/10.1126/science.276.5321.2045) · 코돈은 RefSeq [NM_000345.4](https://www.ncbi.nlm.nih.gov/nuccore/NM_000345)의 CDS에서 확인 · 길이는 UniProt [P37840](https://www.uniprot.org/uniprotkb/P37840/entry), [Q16143](https://www.uniprot.org/uniprotkb/Q16143/entry), [O76070](https://www.uniprot.org/uniprotkb/O76070/entry)

## 예시로 이해하기

> SNCA의 세 코돈(30, 46, 53번)은 RefSeq 레코드에서 확인한 실제 값이고, "가상"이라고 표시한 것과 예시 2, 3의 서열은 연습용으로 지어낸 것입니다.

### 예시 1 — 점 돌연변이 분류기

```python
bases = "TCAG"
amino = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG"
codon_table = {b1 + b2 + b3: amino[16 * i + 4 * j + k]
               for i, b1 in enumerate(bases)
               for j, b2 in enumerate(bases)
               for k, b3 in enumerate(bases)}

PURINES = {"A", "G"}

def classify(ref_codon, alt_codon):
    """코돈 하나에서 일어난 점 돌연변이를 두 가지 기준으로 분류한다."""
    diffs = [(r, a) for r, a in zip(ref_codon, alt_codon) if r != a]
    assert len(diffs) == 1, "염기가 정확히 하나만 달라야 한다"
    ref_base, alt_base = diffs[0]
    same_family = (ref_base in PURINES) == (alt_base in PURINES)
    base_change = "transition" if same_family else "transversion"

    ref_aa, alt_aa = codon_table[ref_codon], codon_table[alt_codon]
    if ref_aa == alt_aa:
        effect = "synonymous"
    elif alt_aa == "*":
        effect = "nonsense"
    else:
        effect = "missense"
    return f"{ref_codon}→{alt_codon}  {ref_base}>{alt_base} {base_change:12s} {ref_aa}→{alt_aa} {effect}"

examples = [
    ("SNCA 코돈 53 (A53T)", "GCA", "ACA"),
    ("SNCA 코돈 30 (A30P)", "GCA", "CCA"),
    ("SNCA 코돈 46 (E46K)", "GAG", "AAG"),
    ("가상: 셋째 자리 변화", "GCA", "GCG"),
    ("가상: 종결 코돈 생성", "TAC", "TAA"),
]
for name, ref, alt in examples:
    print(f"{name:22s} {classify(ref, alt)}")
```

출력:

```text
SNCA 코돈 53 (A53T)      GCA→ACA  G>A transition   A→T missense
SNCA 코돈 30 (A30P)      GCA→CCA  G>C transversion A→P missense
SNCA 코돈 46 (E46K)      GAG→AAG  G>A transition   E→K missense
가상: 셋째 자리 변화           GCA→GCG  A>G transition   A→A synonymous
가상: 종결 코돈 생성           TAC→TAA  C>A transversion Y→* nonsense
```

코돈 표를 만드는 부분은 S1의 3중 반복문을 한 줄(딕셔너리 컴프리헨션)로 줄인 것으로, 결과는 같습니다. A53T와 E46K는 둘 다 G>A transition이고, A30P는 G>C transversion입니다. 넷째 줄처럼 코돈의 셋째 자리가 바뀌면 아미노산이 그대로인 경우가 많습니다.

### 예시 2 — frameshift: 한 글자와 세 글자의 차이

```python
bases = "TCAG"
amino = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG"
codon_table = {b1 + b2 + b3: amino[16 * i + 4 * j + k]
               for i, b1 in enumerate(bases)
               for j, b2 in enumerate(bases)
               for k, b3 in enumerate(bases)}

def translate(dna):
    protein = ""
    for pos in range(0, len(dna) - 2, 3):
        aa = codon_table[dna[pos:pos + 3]]
        protein += aa
        if aa == "*":          # 종결 코돈을 만나면 멈춘다
            break
    return protein

original = "ATGGCTGAAAAAGGTGTTCTGGCAGCATAA"     # 가상 CDS (10코돈)
minus_one = original[:7] + original[8:]          # 8번째 염기 1개 결실
minus_three = original[:6] + original[9:]        # 셋째 코돈 3개 결실

print("원래     :", translate(original))
print("1염기 결실:", translate(minus_one))
print("3염기 결실:", translate(minus_three))
```

출력:

```text
원래     : MAEKGVLAA*
1염기 결실: MAEKVFWQH
3염기 결실: MAKGVLAA*
```

염기 하나가 빠지자 넷째 아미노산까지만 같고 그 뒤는 전혀 다른 글자가 되었으며, 원래 있던 종결 코돈도 사라졌습니다. 세 개가 빠지면 아미노산 하나(E)만 없어지고 나머지는 그대로입니다.

### 예시 3 — identity와 similarity 계산

```python
seq1 = "MKTEGVLAAQEKTK-QGVAEA"
seq2 = "MKSEGVVAAAEKTKEQGLQEA"

groups = ["ILVM", "FWY", "KRH", "DE", "STNQ", "AG"]   # 성질이 비슷한 아미노산 묶음(설명용)

def similar(a, b):
    return any(a in g and b in g for g in groups)

assert len(seq1) == len(seq2)
identical = 0
similar_count = 0
marks = ""
for a, b in zip(seq1, seq2):
    if a == "-" or b == "-":
        marks += " "
    elif a == b:
        identical += 1
        marks += "|"
    elif similar(a, b):
        similar_count += 1
        marks += ":"
    else:
        marks += "."

length = len(seq1)                       # gap도 정렬 길이에 포함한다
print(seq1)
print(marks)
print(seq2)
print(f"정렬 길이 {length}, 동일 {identical}, 유사(동일 제외) {similar_count}")
print(f"identity   = {identical / length:.1%}")
print(f"similarity = {(identical + similar_count) / length:.1%}")
```

출력:

```text
MKTEGVLAAQEKTK-QGVAEA
||:|||:||.|||| ||:.||
MKSEGVVAAAEKTKEQGLQEA
정렬 길이 21, 동일 15, 유사(동일 제외) 3
identity   = 71.4%
similarity = 85.7%
```

가운데 줄의 `|`는 같은 글자, `:`는 비슷한 글자, `.`는 다른 글자, 빈칸은 gap입니다. 21칸 중 15칸이 같으므로 identity는 71.4%입니다. `groups`의 묶음은 설명을 위해 임의로 정한 것이고, 실제 프로그램은 S3에서 배울 치환 행렬의 점수로 "비슷함"을 판정합니다.

## 직접 해보기

1. `notebooks/supplement/S2_mutation_homology.ipynb`를 만들고 예시 1–3을 실행합니다.

2. **분류기 써 보기.** `classify("GAG", "GTG")`와 `classify("TGG", "TGA")`를 실행하기 전에 결과를 먼저 종이에 적고, 실행해 비교합니다.

3. **셋째 자리 실험.** 아래 코드로 코돈 `GCA`의 각 자리를 다른 세 염기로 바꿨을 때 synonymous가 몇 번 나오는지 셉니다. 자리마다 결과가 어떻게 다른지 한 줄로 적습니다.

   ```python
   ref = "GCA"
   for pos in range(3):
       for base in "ACGT":
           if base != ref[pos]:
               alt = ref[:pos] + base + ref[pos + 1:]
               print(pos + 1, classify(ref, alt))
   ```

4. **분모 바꿔 보기.** 예시 3에서 gap이 있는 칸을 분모에서 빼면 identity가 얼마가 되는지 계산합니다(15 ÷ 20). 같은 정렬인데 숫자가 달라진다는 것을 확인하는 단계입니다.

5. **실제 가족 확인하기.** UniProt에서 `Q16143`(SNCB)과 `O76070`(SNCG)을 열어 길이를 확인하고, SNCA와 이 둘이 ortholog인지 paralog인지 이유와 함께 노트북에 적습니다.

6. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — `AssertionError: 염기가 정확히 하나만 달라야 한다`.** 두 코돈이 같거나 두 글자 이상 다를 때 납니다. 오타가 없는지, 소문자를 넣지 않았는지 확인하세요.

⚠️ **흔한 오류 2 — "보존 = 기능 증명"으로 읽기.** 보존은 중요성을 시사하는 간접 증거일 뿐입니다. 변이 하나가 질환의 원인인지는 가계 분석, 기능 실험 같은 별도 근거로 판단하며, 이 코스에서는 진단이나 치료에 관한 주장을 하지 않습니다.

## 퀴즈

**1.** C→T 변화는?

(a) transition (b) transversion (c) frameshift (d) nonsense

<details><summary>정답 보기</summary>

(a). C와 T는 둘 다 피리미딘이므로 같은 계열 안의 변화입니다. frameshift와 nonsense는 염기 종류가 아니라 읽기 틀과 단백질에 미치는 결과를 가리키는 말입니다.

</details>

**2.** 코돈 `TGG`(트립토판)가 `TGA`로 바뀌었습니다. 단백질 수준의 분류는? (단답)

<details><summary>정답 보기</summary>

nonsense. `TGA`는 종결 코돈이므로 번역이 그 자리에서 멈춥니다. 염기 수준에서는 G>A transition입니다.

</details>

**3.** 사람 SNCA와 사람 SNCB의 관계는?

(a) ortholog (b) paralog (c) 상동이 아니다 (d) 같은 유전자의 isoform

<details><summary>정답 보기</summary>

(b). 같은 종의 유전체 안에서 유전자 중복으로 생긴 가족이기 때문입니다. 사람 SNCA와 마우스 Snca처럼 종 분화로 갈라진 관계가 ortholog입니다.

</details>

**4.** 길이 50칸의 정렬에서 같은 글자가 30칸, gap이 5칸입니다. gap을 분모에 포함한 percent identity는? (단답)

<details><summary>정답 보기</summary>

60%. 30 ÷ 50입니다. gap을 빼고 30 ÷ 45로 계산하면 약 67%가 되므로, 숫자를 보고할 때는 분모를 함께 밝혀야 합니다.

</details>

**5.** "두 단백질은 40% 상동이다"라는 문장이 정확하지 않은 이유는? (단답)

<details><summary>정답 보기</summary>

상동성(homology)은 공통 조상에서 왔는지 아닌지를 말하는 것이라 정도가 없습니다. 퍼센트로 표현할 수 있는 것은 identity나 similarity이고, 그 값이 높으면 상동일 가능성이 높다고 추론할 수 있을 뿐입니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `classify` 함수가 SNCA의 세 변이를 예시와 같게 분류한다.
- [ ] 1염기 결실과 3염기 결실의 번역 결과 차이를 설명할 수 있다.
- [ ] identity를 분모 두 가지(gap 포함/제외)로 계산해 보았다.
- [ ] SNCA·SNCB·SNCG의 관계를 ortholog/paralog 용어로 적었다.

---
[← 이전](day-S1.md) · [코스 지도](../../README.md) · [다음 →](day-S3.md)
