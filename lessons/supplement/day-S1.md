# Day S1 — 서열 데이터베이스와 레코드 읽기

> **주차:** 보충 단원 · **예상 시간:** 75–90분 · **산출물:** `notebooks/supplement/S1_sequence_databases.ipynb`
>
> **먼저 끝내 둘 레슨:** Day F4(반복문), Day F5(함수). Day 6(파일 형식)을 했다면 FASTA가 낯익을 것입니다.

## 오늘의 목표
- GenBank, RefSeq, UniProt이 각각 어떤 성격의 창고인지, accession과 version이 무엇인지 설명할 수 있다.
- FASTA와 GenBank 형식의 레코드에서 헤더·주석(feature)·서열을 구분해 읽고, 코드로 꺼낼 수 있다.
- CDS 위치를 이용해 염기 서열을 잘라 내고 단백질로 번역할 수 있다.

## 🎬 영상으로 먼저 보기

- [NCBI Minute: A Beginner's Guide to Genes and Sequences at NCBI — National Library of Medicine](https://www.youtube.com/watch?v=QIZ8QH6JcC8) (33:44)
- **무엇에 주목할까:** 유전자 하나를 검색했을 때 Gene, Nucleotide, Protein 같은 여러 데이터베이스가 서로 어떻게 이어지는지 흐름을 따라가 보세요. 화면에 나오는 식별자(accession)가 어떤 글자로 시작하는지도 눈여겨보면 오늘 개념 설명이 쉽게 읽힙니다. 화면 구성은 지금 사이트와 조금 다를 수 있습니다.

- [A guide to UniProt for students and biological scientists — EMBL's European Bioinformatics Institute EMBL-EBI](https://www.youtube.com/watch?v=_VJVs2dcGPY) (53:05)
- **무엇에 주목할까:** 긴 웨비나이니 전부 볼 필요는 없습니다. UniProt 항목 한 페이지가 어떤 구획(기능, 서열, 변이 등)으로 나뉘는지, "reviewed"와 "unreviewed"가 어떻게 다른지 설명하는 부분만 골라 보세요.

## 개념 설명

### 세 창고: 접수 창구, 표준 견본, 단백질 백과사전

지금까지 코스에서 다룬 것은 "발현량 표"였습니다. 그런데 그 표의 행 이름인 유전자가 실제로 어떤 글자(서열)로 되어 있는지는 다른 창고에 들어 있습니다. 대표적인 창고가 셋입니다.

**GenBank**는 전 세계 연구자가 제출한 염기 서열을 받아 보관하는 접수 창구입니다. 제출자가 붙인 주석이 그대로 실리고, 같은 유전자를 여러 연구실이 각각 제출하면 레코드도 여러 개 생깁니다. 병원 검체실에 비유하면 "들어온 검체는 일단 모두 접수해 번호를 붙여 두는 접수대"입니다. 원자료가 빠짐없이 남는 대신, 중복과 품질 차이가 있습니다. GenBank는 유럽의 ENA, 일본의 DDBJ와 매일 자료를 맞바꾸므로 세 곳의 내용은 사실상 같습니다.

**RefSeq**는 NCBI가 그 원자료를 바탕으로 유전자·전사체·단백질마다 대표 서열을 골라 정리한 표준 견본 모음입니다. 검체실의 "정도관리용 표준 물질"에 가깝습니다. 그래서 "사람 SNCA의 mRNA 서열"처럼 기준이 하나 필요할 때는 RefSeq를 씁니다.

**UniProt**은 단백질 쪽 백과사전입니다. 서열뿐 아니라 기능, 도메인, 번역 후 변형, 질병 관련 변이 같은 지식이 한 항목에 모여 있습니다. 사람이 문헌을 읽고 검토한 항목(Swiss-Prot, "reviewed")과 컴퓨터가 자동으로 주석을 단 항목(TrEMBL, "unreviewed")이 나뉘어 있다는 점을 꼭 기억하세요.

### accession과 version: 검체 번호와 수정 차수

레코드마다 고유 번호인 **accession(접근 번호)** 이 붙습니다. 유전자 이름은 바뀌기도 하고 별명도 많지만(SNCA는 NACP, PARK1로도 불립니다), accession은 바뀌지 않습니다. 논문 방법란에 서열을 적을 때 이름이 아니라 accession을 쓰는 이유입니다.

RefSeq accession은 앞 글자가 종류를 알려 줍니다. `NM_`은 mRNA, `NP_`는 단백질, `NR_`은 단백질을 만들지 않는 RNA, `NC_`는 염색체 같은 유전체 서열입니다. `XM_`, `XP_`처럼 X로 시작하면 계산으로 예측한 모델이라는 뜻이라, 실험 근거가 약할 수 있습니다.

점 뒤의 숫자는 **version(버전)** 입니다. `NM_000345.4`는 NM_000345의 네 번째 서열 판입니다. 서열이 한 글자라도 고쳐지면 숫자가 올라갑니다. 3주차 Day 15에서 데이터의 출처(provenance)를 기록했듯이, 서열을 쓸 때도 **버전까지** 적어야 다른 사람이 같은 글자를 내려받을 수 있습니다. UniProt은 `P37840`처럼 여섯 글자(또는 열 글자) accession을 쓰고, 항목 버전과 서열 버전을 따로 관리합니다.

### 레코드의 세 부분과 두 가지 형식

서열 레코드는 형식이 달라도 담는 내용은 비슷합니다. 약병 라벨에 비유하면 **헤더**는 약 이름과 제조 번호, **feature(주석)** 는 "어느 부분이 무슨 성분인지" 적은 성분표, **서열**은 병 안의 내용물입니다.

**FASTA**는 가장 단순한 형식입니다. `>`로 시작하는 한 줄이 헤더이고, 그 아래 줄들이 전부 서열입니다. 주석을 담을 자리가 거의 없지만 가벼워서 정렬·검색 프로그램의 입력으로 널리 쓰입니다.

**GenBank flat file**은 주석까지 담는 형식입니다. 위쪽에 `LOCUS`, `DEFINITION`, `ACCESSION`, `VERSION` 같은 헤더 줄이 오고, 가운데 `FEATURES` 구획에 `gene`, `CDS`, `exon` 같은 feature가 위치(`226..648`)와 함께 적히며, `ORIGIN` 아래에 서열이 나오고 `//`로 끝납니다. feature 가운데 **CDS(coding sequence)** 가 특히 중요합니다. mRNA 전체가 단백질이 되는 것이 아니라 시작 코돈부터 종결 코돈까지만 번역되는데, 그 구간이 CDS입니다. 위치는 **1부터** 세고 끝 번호를 **포함**합니다. Python의 슬라이싱(0부터, 끝 제외)과 규칙이 다르다는 점이 오늘 가장 흔한 실수의 원인입니다.

### 번역과 여섯 개의 읽기 틀

CDS 위치를 알면 세 글자씩 끊어 코돈 표로 번역할 수 있습니다. 그런데 주석이 없는 서열 조각만 받았다면 어디서부터 끊어야 할지 모릅니다. 첫 글자, 둘째 글자, 셋째 글자에서 시작하는 세 가지 **읽기 틀(reading frame)** 이 있고, 반대 가닥(역상보 서열)에도 셋이 있어 모두 여섯 가지입니다. 띄어쓰기 없는 문장을 어디서 끊느냐에 따라 뜻이 달라지는 것과 같습니다. 보통은 여섯 틀을 모두 번역해 놓고, 종결 코돈(`*`) 없이 길게 이어지는 틀을 후보로 봅니다.

> **참고 문헌(공개 논문·공식 문서):** Benson et al., "GenBank", *Nucleic Acids Research* 46:D41–D47 (2018), [doi:10.1093/nar/gkx1094](https://doi.org/10.1093/nar/gkx1094) · O'Leary et al., "Reference sequence (RefSeq) database at NCBI", *Nucleic Acids Research* 44:D733–D745 (2016), [doi:10.1093/nar/gkv1189](https://doi.org/10.1093/nar/gkv1189) · The UniProt Consortium, "UniProt: the Universal Protein Knowledgebase in 2023", *Nucleic Acids Research* 51:D523–D531 (2023), [doi:10.1093/nar/gkac1052](https://doi.org/10.1093/nar/gkac1052) · [NCBI GenBank 샘플 레코드 설명](https://www.ncbi.nlm.nih.gov/genbank/samplerecord/) · [UniProt 도움말](https://www.uniprot.org/help)

## 예시로 이해하기

> 예시의 서열과 accession(`DEMO0001`, `PRT001` 등)은 모두 연습용으로 지어낸 **가상 값**입니다. 실제 데이터베이스에는 없습니다.

### 예시 1 — FASTA 읽기

```python
fasta_text = """>demo|PRT001 가상 단백질 1 (연습용)
MKTEGVLAAQ
EKTKQGVAEA
>demo|PRT002 가상 단백질 2 (연습용)
MKSEGVVAAA
EKTK
"""

def read_fasta(text):
    """FASTA 글자를 {헤더: 서열} 딕셔너리로 바꾼다."""
    records = {}
    header = None
    for line in text.splitlines():
        line = line.strip()
        if line == "":
            continue
        if line.startswith(">"):
            header = line[1:]          # '>' 를 떼고 헤더로 쓴다
            records[header] = ""
        else:
            records[header] += line    # 여러 줄에 나뉜 서열을 이어 붙인다
    return records

records = read_fasta(fasta_text)
for header, seq in records.items():
    print(header.split()[0], len(seq), seq)
```

출력:

```text
demo|PRT001 20 MKTEGVLAAQEKTKQGVAEA
demo|PRT002 14 MKSEGVVAAAEKTK
```

`>` 줄을 만나면 새 레코드를 시작하고, 그 밖의 줄은 직전 레코드의 서열 뒤에 붙입니다. 서열이 여러 줄로 나뉘어 있어도 하나로 이어진 것을 확인하세요.

### 예시 2 — GenBank 형식 레코드에서 CDS 꺼내기

```python
record_text = """LOCUS       DEMO0001                  45 bp    mRNA    linear   SYN 01-JAN-2000
DEFINITION  Synthetic practice record (not a real sequence).
ACCESSION   DEMO0001
VERSION     DEMO0001.2
FEATURES             Location/Qualifiers
     source          1..45
                     /organism="synthetic construct"
     CDS             7..36
                     /gene="demoA"
                     /product="practice peptide"
ORIGIN
        1 ggcaccatgg ctgaaaaagg tgttctggca gcataaccgt tcaaa
//
"""

info = {}
sequence = ""
in_origin = False
for line in record_text.splitlines():
    if line.startswith("//"):
        break
    if in_origin:
        parts = line.split()
        sequence += "".join(parts[1:])        # 맨 앞 숫자는 버리고 염기만 모은다
    elif line.startswith("ORIGIN"):
        in_origin = True
    elif line.startswith(("LOCUS", "DEFINITION", "ACCESSION", "VERSION")):
        key, value = line.split(maxsplit=1)
        info[key] = value
    elif line.strip().startswith("CDS"):
        info["CDS"] = line.split()[1]

sequence = sequence.upper()
start, end = info["CDS"].split("..")
start, end = int(start), int(end)
cds = sequence[start - 1:end]                 # GenBank은 1부터, Python은 0부터 센다

print("accession:", info["ACCESSION"])
print("version  :", info["VERSION"])
print("전체 길이:", len(sequence))
print("CDS 위치 :", info["CDS"], "→ 길이", len(cds))
print("CDS 서열 :", cds)
```

출력:

```text
accession: DEMO0001
version  : DEMO0001.2
전체 길이: 45
CDS 위치 : 7..36 → 길이 30
CDS 서열 : ATGGCTGAAAAAGGTGTTCTGGCAGCATAA
```

`CDS 7..36`은 "7번째부터 36번째 염기까지"입니다. Python에서는 `sequence[6:36]`, 즉 `sequence[start - 1:end]`가 됩니다. 시작에서만 1을 빼고 끝은 그대로 둡니다. 꺼낸 CDS가 `ATG`로 시작하고 `TAA`로 끝나며 길이가 3의 배수(30)인지 확인하는 것이 좋은 점검 습관입니다.

### 예시 3 — 여섯 읽기 틀로 번역하기

```python
bases = "TCAG"
amino = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG"
codon_table = {}
i = 0
for b1 in bases:
    for b2 in bases:
        for b3 in bases:
            codon_table[b1 + b2 + b3] = amino[i]
            i += 1

def translate(dna):
    protein = ""
    for pos in range(0, len(dna) - 2, 3):
        protein += codon_table[dna[pos:pos + 3]]
    return protein

def reverse_complement(dna):
    pair = {"A": "T", "T": "A", "G": "C", "C": "G"}
    return "".join(pair[base] for base in reversed(dna))

assert len(codon_table) == 64
assert translate("ATGGCTTAA") == "MA*"
assert reverse_complement("ATGC") == "GCAT"

dna = "GGCACCATGGCTGAAAAAGGTGTTCTGGCAGCATAACCGTTCAAA"
for strand_name, strand in [("+", dna), ("-", reverse_complement(dna))]:
    for frame in range(3):
        print(f"{strand_name}{frame + 1}: {translate(strand[frame:])}")
```

출력:

```text
+1: GTMAEKGVLAA*PFK
+2: APWLKKVFWQHNRS
+3: HHG*KRCSGSITVQ
-1: FERLCCQNTFFSHGA
-2: LNGYAARTPFSAMV
-3: *TVMLPEHLFQPWC
```

`+1` 틀에 `MAEKGVLAA*`가 보입니다. 예시 2에서 꺼낸 CDS와 같은 구간입니다. 다른 다섯 틀은 같은 글자를 다르게 끊었을 뿐인데 전혀 다른 아미노산이 나오고, 종결 코돈(`*`)이 일찍 나오는 틀도 있습니다. `assert` 세 줄은 코돈 표와 함수가 제대로 만들어졌는지 확인하는 자기 점검입니다.

## 직접 해보기

1. JupyterLab에서 `notebooks/supplement/S1_sequence_databases.ipynb`를 만들고 예시 1–3을 셀 하나씩 타이핑해 실행합니다.

2. **실제 RefSeq 레코드 읽기.** 브라우저에서 [NCBI Nucleotide의 NM_000345](https://www.ncbi.nlm.nih.gov/nuccore/NM_000345)를 엽니다. 사람 α-synuclein 유전자 SNCA의 mRNA 레코드입니다. 노트북의 Markdown 셀에 다음을 적습니다.
   - `VERSION` 줄의 값 (이 레슨을 쓰며 확인했을 때는 `NM_000345.4`, 길이 3,177 bp였습니다. 버전이 올라갔다면 여러분이 본 값을 적으세요.)
   - `CDS` feature의 위치 (확인 당시 `226..648`)와 `/protein_id` 값
   - `DEFINITION` 줄에 적힌 내용

3. **손으로 검산하기.** CDS 길이를 `끝 - 시작 + 1`로 계산합니다. 226..648이면 423 염기이고, 3으로 나누면 141 코돈입니다. 종결 코돈 하나를 빼면 아미노산 140개가 됩니다.

4. **UniProt과 맞춰 보기.** [UniProt P37840](https://www.uniprot.org/uniprotkb/P37840/entry)을 열어 서열 길이가 140인지, 항목이 reviewed(Swiss-Prot)인지 확인합니다. 같은 방법으로 SOD1(`P00441`)과 APP(`P05067`)의 길이도 찾아 적습니다.

5. **(선택) 실제 FASTA를 내 함수로 읽기.** UniProt 항목의 Download에서 FASTA를 받아 프로젝트의 `data/` 폴더에 저장한 뒤, 파일 내용을 읽어 예시 1의 `read_fasta`에 넣습니다.

   ```python
   with open("data/P37840.fasta") as handle:
       records = read_fasta(handle.read())
   for header, seq in records.items():
       print(header[:40], len(seq))
   ```

   길이가 140으로 나오면 성공입니다. 내려받은 파일은 저장소에 올리지 말고, 받은 날짜와 accession을 `data/README.md`에 적습니다.

6. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — 한 글자 밀린 CDS.** `sequence[start:end]`로 자르면 첫 염기가 빠져 `TGG...`로 시작하고 번역 결과가 엉뚱해집니다. GenBank 위치는 1부터 세므로 `sequence[start - 1:end]`입니다.

⚠️ **흔한 오류 2 — `KeyError: 'atg'` 또는 `KeyError: 'AUG'`.** 코돈 표의 키는 대문자 DNA 글자(`ATG`)입니다. GenBank의 `ORIGIN` 서열은 소문자이므로 `.upper()`로 바꾸고, RNA 서열이면 `.replace("U", "T")`를 먼저 합니다.

## 퀴즈

**1.** "사람 SNCA mRNA의 기준 서열 하나"가 필요할 때 가장 알맞은 것은?

(a) GenBank에서 검색해 맨 위에 나온 레코드 (b) RefSeq의 `NM_` 레코드 (c) `XM_`으로 시작하는 레코드 (d) UniProt의 unreviewed 항목

<details><summary>정답 보기</summary>

(b). RefSeq는 유전자마다 대표 서열을 골라 정리한 모음이고 `NM_`은 그중 mRNA입니다. GenBank에는 같은 유전자의 제출 레코드가 여럿 있을 수 있고, `XM_`은 계산으로 예측한 모델입니다.

</details>

**2.** `NM_000345.4`에서 `.4`가 뜻하는 것은? (단답)

<details><summary>정답 보기</summary>

서열의 버전입니다. 서열이 고쳐질 때마다 숫자가 올라갑니다. accession만 적으면 나중에 다른 판을 받게 될 수 있으므로 기록에는 버전까지 남깁니다.

</details>

**3.** GenBank 레코드에 `CDS 101..400`이라고 적혀 있습니다. Python 문자열 `seq`에서 이 구간을 꺼내는 코드는?

(a) `seq[101:400]` (b) `seq[100:400]` (c) `seq[100:399]` (d) `seq[101:401]`

<details><summary>정답 보기</summary>

(b). GenBank는 1부터 세고 끝을 포함하지만, Python은 0부터 세고 끝을 포함하지 않습니다. 그래서 시작에서만 1을 뺍니다. 길이는 400 − 101 + 1 = 300으로, `seq[100:400]`의 길이와 같습니다.

</details>

**4.** 주석이 없는 DNA 조각을 번역할 때 읽기 틀이 여섯 개인 이유는? (단답)

<details><summary>정답 보기</summary>

한 가닥에서 시작 위치를 첫째·둘째·셋째 글자로 잡는 세 가지가 있고, 반대 가닥(역상보)에도 같은 세 가지가 있기 때문입니다. 어느 가닥이 코딩 가닥인지, 어디서 코돈이 시작하는지 모르면 여섯 가지를 모두 확인해야 합니다.

</details>

**5.** UniProt 항목이 "reviewed"라는 것은 무엇을 뜻하나요?

(a) 서열이 실험으로 결정되었다 (b) 사람이 문헌을 검토해 주석을 정리했다 (c) 질병 관련 단백질이다 (d) 가장 최근에 등록되었다

<details><summary>정답 보기</summary>

(b). Swiss-Prot 구획의 항목으로, 전문 큐레이터가 문헌 근거를 확인해 정리했다는 뜻입니다. unreviewed(TrEMBL) 항목은 자동 주석이므로 기능 설명을 인용할 때 더 조심해야 합니다.

</details>

## 더 알아보기

> **📚 R에서 서열을 다룬다면**
> 오늘 Python 문자열로 한 역상보 서열 만들기는 R에서도 `chartr()`, `strsplit()`, `rev()`, `paste()`로 몇 줄이면 됩니다. 실제 서열 분석에는 Bioconductor의 Biostrings 패키지가 DNA·단백질 서열 전용 객체와 패턴 찾기·정렬 함수를 제공합니다. 같은 문제를 두 언어로 풀어 보면 어느 도구가 손에 맞는지 알게 됩니다.
> → [심화 A — Day A2: 벡터, 자료형, 부분 선택: R의 기본 단위 다루기](../advanced/A-r-bioconductor/day-A2.md), [심화 A — Day A6: S3·S4 객체와 Bioconductor의 자료 구조](../advanced/A-r-bioconductor/day-A6.md)

> **📚 직접 짠 함수를 Biopython으로 검산하기**
> 오늘 만든 FASTA 읽기, 역상보, 번역 함수는 Biopython의 `SeqIO`와 `Seq`가 이미 제공하는 기능입니다. 같은 입력을 두 방법에 넣어 결과가 같은지 비교하면 내 코드의 버그를 찾는 좋은 점검이 됩니다. 실제 분석에서는 GenBank feature 위치, 여러 줄 FASTA, 소문자·모호 염기 같은 예외를 라이브러리가 처리해 주므로 검증된 도구가 안전합니다. Biopython은 이 과정의 기본 환경에 없으니 필요할 때만 선택 설치합니다(`conda install -c conda-forge biopython`).

> **📚 서열 다음은 구조: PDB와 AlphaFold DB**
> UniProt 레코드에는 3차원 구조로 가는 연결도 있습니다. 실험으로 푼 구조는 PDB에, 예측 구조는 AlphaFold DB에 있고, 둘 다 원자 좌표를 담은 텍스트 파일(PDB/mmCIF)이라 코드로 읽을 수 있습니다. 구조 파일의 서열이 UniProt 서열보다 짧을 수 있는데, 일부 구간만 풀렸거나 결정화용으로 잘라 냈기 때문입니다. α-synuclein처럼 정해진 구조가 없는 구간이 긴 단백질은 예측 신뢰도(pLDDT)가 낮은 것이 정상이므로, 구조 그림을 볼 때 신뢰도 색부터 확인합니다.
> → [심화 G — Day G5: 단백질: 구조 예측과 단백질 언어 모델](../advanced/G-ai-biomed/day-G5.md)

## 오늘의 산출물 체크리스트
- [ ] `S1_sequence_databases.ipynb`에서 `read_fasta`, CDS 추출, `translate`, `reverse_complement`가 실행되어 있다.
- [ ] NM_000345의 version, CDS 위치, protein_id를 직접 확인해 적었다.
- [ ] CDS 길이에서 아미노산 수를 손으로 계산해 UniProt의 길이와 맞춰 보았다.
- [ ] GenBank·RefSeq·UniProt의 차이를 한 문장씩 말할 수 있다.

---
[← 이전: 코스 지도](../../README.md) · [코스 지도](../../README.md) · [다음 →](day-S2.md)
