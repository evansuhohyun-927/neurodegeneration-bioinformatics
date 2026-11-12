# Day 6 — 생물학·생체신호 파일 형식 읽기

> **주차:** 1주차 · **예상 시간:** 75–90분 · **산출물:** `data-formats.md`

## 오늘의 목표
- FASTA, FASTQ, count matrix, TSV/CSV, EDF, WFDB header가 각각 무엇을 담는 파일인지 한 문장으로 말할 수 있다.
- 서열 데이터가 "FASTQ → count matrix"로 요약되는 흐름에서 우리가 어느 단계의 파일을 쓰는지 설명할 수 있다.
- 처음 보는 파일을 받았을 때 "텍스트인가 바이너리인가, 한 행·한 열이 무엇인가"를 확인할 수 있다.

## 🎬 영상으로 먼저 보기

- [StatQuest: A gentle introduction to RNA-seq — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=tlf6wYJrwKY) (18분 25초)
- **무엇에 주목할까:** 실험 과정보다 **데이터의 모양이 바뀌는 순간**을 보세요. 시퀀서에서 나온 수많은 짧은 서열(read)이 "유전자 × 샘플" 숫자 표로 요약되는 장면이 핵심입니다. 그 표가 오늘 배울 count matrix이고, 3주차에 우리가 다룰 발현 표와 같은 종류입니다.

- [Overview of Illumina Sequencing by Synthesis Workflow | Standard SBS chemistry — Illumina](https://www.youtube.com/watch?v=fCd6B5HRaZ8) (5분 13초)
- **무엇에 주목할까:** 염기가 하나씩 붙을 때마다 형광 신호를 찍어 서열을 읽는 장면을 보세요. 신호가 흐릿하면 그 염기는 "자신 없는 판독"이 됩니다. FASTQ 파일의 네 번째 줄(품질 점수)이 바로 이 "자신 있는 정도"를 적어 둔 것입니다.

## 개념 설명

### 파일 형식은 약속이다

파일 형식(format)은 "무엇을 어떤 순서로 적을지"에 대한 약속입니다. 처방전에는 정해진 칸(환자, 약 이름, 용량, 용법)이 있어서 어느 약국에 가도 읽을 수 있지요. 파일 형식도 같은 역할을 합니다. 형식을 알면 처음 보는 파일도 "어디에 무엇이 있는지" 압니다.

새 파일을 만나면 세 가지를 먼저 묻습니다.

1. **텍스트인가, 바이너리인가?** 텍스트 파일은 메모장으로 열어 사람이 읽을 수 있습니다(FASTA, FASTQ, CSV, TSV, WFDB header). 바이너리(binary) 파일은 컴퓨터용 압축 표기라서 전용 도구로만 읽습니다(EDF, WFDB의 `.dat`). 손글씨 차트와 PACS 영상 파일의 차이와 비슷합니다.
2. **한 단위(레코드)가 무엇인가?** 한 줄이 한 샘플인가, 네 줄이 read 하나인가?
3. **메타데이터는 어디에 있는가?** 파일 안에 함께 있는가(EDF의 header), 별도 파일인가(WFDB의 `.hea`, 발현 행렬의 샘플 표)?

### 서열에서 숫자 표까지: FASTA → FASTQ → count matrix

분자 데이터는 **원재료에서 요약으로** 가는 흐름이 있습니다.

- **FASTA:** 서열 그 자체. `>`로 시작하는 이름 줄과 그 아래의 서열로 이루어집니다. 참조 유전체나 유전자 서열처럼 "정답지" 역할을 하는 서열을 담습니다.
- **FASTQ:** 시퀀서가 읽어 낸 **read**(짧은 서열 조각)와 **품질 점수**. read 하나가 네 줄입니다. 파일 하나에 수천만 개의 read가 들어 있어 용량이 매우 큽니다.
- **count matrix:** 각 유전자에 read가 몇 개 붙었는지 센 **숫자 표**. 보통 행이 유전자, 열이 샘플입니다.

병원에 비유하면 FASTQ는 현미경으로 찍은 수천 장의 **원본 슬라이드 사진**이고, count matrix는 "세포 종류별 개수"를 적은 **판독 결과지**입니다. 결과지는 작고 다루기 쉽지만, 사진을 어떻게 세었는지(어떤 정답지에 맞췄는지, 어떤 기준으로 걸렀는지)에 따라 숫자가 달라집니다.

이 과정에서 우리는 FASTQ부터 시작하지 않습니다. 이미 누군가 처리해 둔 **숫자 표 단계**에서 시작합니다. OSD-536에 정확히 어떤 파일이 제공되는지는 2주차 Day 12에 study record에서 직접 확인합니다. 지금은 "숫자 표 앞에 이런 단계들이 있었다"는 것만 알아 두면 됩니다. 앞 단계를 알아야 "이 숫자는 어떤 처리를 거쳤나요?"라는 질문을 던질 수 있기 때문입니다.

### CSV와 TSV: 표를 글자로 적는 두 가지 방법

- **CSV** (comma-separated values): 칸을 쉼표(`,`)로 나눔
- **TSV** (tab-separated values): 칸을 탭으로 나눔

생물학 데이터에서는 TSV를 자주 씁니다. 유전자 설명에 쉼표가 들어가는 일이 많기 때문입니다(예: `solute carrier family 2, member 1`). 쉼표로 나누면 이 설명이 두 칸으로 쪼개집니다.

pandas에서는 `sep` 하나만 다릅니다. `pd.read_csv("파일.csv")`와 `pd.read_csv("파일.tsv", sep="\t")`. 확장자가 `.txt`여도 속은 TSV인 경우가 많으니, 확장자를 믿지 말고 **첫 몇 줄을 직접 열어 보는** 습관을 들이세요.

한 가지 경고. 유전자 표를 엑셀로 열면 `SEPT2`, `MARCH1` 같은 유전자 이름이 날짜(9월 2일, 3월 1일)로 자동 변환되는 유명한 사고가 있습니다. 원본 파일은 엑셀로 열어 저장하지 않습니다.

### 생체신호 파일: EDF와 WFDB

시계열(시간에 따라 연속으로 측정한 신호) 데이터는 표와 성격이 다릅니다. 초당 수십~수백 번 측정한 값이 몇 분에서 몇 시간 이어지므로, 글자로 적으면 너무 커집니다. 그래서 **숫자는 바이너리로, 설명은 header로** 나눠 적습니다.

- **EDF** (European Data Format): 파일 **하나** 안에 header(기록 정보, 채널 이름, 단위, 샘플링 주파수)와 신호 데이터가 함께 들어 있습니다. 뇌파(EEG)나 수면다원검사에서 표준처럼 쓰입니다. Python에서는 `mne`나 `pyedflib`로 읽습니다.
- **WFDB** (WaveForm DataBase): PhysioNet의 고유 형식입니다. 기록 하나가 **여러 파일**로 나뉩니다. `.hea`는 사람이 읽을 수 있는 텍스트 header이고, `.dat`는 바이너리 신호입니다. Python에서는 `wfdb` 패키지로 읽습니다.

심전도 기록지를 떠올려 보세요. 파형만 있고 "25 mm/s, 10 mm/mV"라는 표시가 없으면 심박수도 전압도 읽을 수 없습니다. header가 바로 그 표시입니다. 특히 **샘플링 주파수**(sampling frequency, 1초에 몇 번 측정했는가, 단위 Hz)를 모르면 "숫자 6,000개"가 1분짜리인지 10분짜리인지 알 수 없습니다.

PADS 데이터가 실제로 어떤 형식으로 제공되는지는 4주차 Day 24에 PhysioNet 페이지에서 직접 확인합니다. PhysioNet의 모든 데이터가 WFDB 형식인 것은 아닙니다.

## 예시로 이해하기

아래 내용은 모두 형식을 보여 주기 위한 **가상 예시**입니다.

### 예시 1 — FASTA와 FASTQ를 직접 읽어 보기

```python
# --- FASTA: 이름 줄(>) + 서열 ---
fasta_text = """>geneA 가상 서열 1
ATGGCGTTAGC
CCGTTA
>geneB 가상 서열 2
ATGAAATTTGGG
"""
sequences = {}
for line in fasta_text.splitlines():
    if line.startswith(">"):
        name = line[1:].split()[0]      # '>' 뒤 첫 단어가 ID
        sequences[name] = ""
    else:
        sequences[name] += line         # 여러 줄에 걸친 서열을 이어 붙인다
for name, seq in sequences.items():
    print(name, len(seq), "bp", seq)

# --- FASTQ: read 하나 = 4줄 (ID, 서열, +, 품질) ---
fastq_text = """@read1
ACGTTGCA
+
IIIIII#5
@read2
GGCATTAC
+
IIII5555
"""
lines = fastq_text.splitlines()
for i in range(0, len(lines), 4):
    read_id, seq, _, qual = lines[i:i + 4]
    scores = [ord(ch) - 33 for ch in qual]   # Phred+33: 문자 코드에서 33을 뺀다
    print(read_id, seq, scores, "최저 품질 =", min(scores))
```

출력:

```text
geneA 17 bp ATGGCGTTAGCCCGTTA
geneB 12 bp ATGAAATTTGGG
@read1 ACGTTGCA [40, 40, 40, 40, 40, 40, 2, 20] 최저 품질 = 2
@read2 GGCATTAC [40, 40, 40, 40, 20, 20, 20, 20] 최저 품질 = 20
```

FASTQ의 품질 줄은 염기 하나마다 글자 하나로 "이 판독이 틀렸을 확률"을 적습니다. 이것을 Phred 점수라고 하며, 점수 Q와 오류 확률의 관계는 다음과 같습니다.

| 글자 | Phred 점수 (Q) | 틀렸을 확률 |
|---|---|---|
| `#` | 2 | 약 63% (거의 믿을 수 없음) |
| `5` | 20 | 1% |
| `?` | 30 | 0.1% |
| `I` | 40 | 0.01% |

`read1`의 일곱 번째 염기 `C`는 품질이 2입니다. 서열에는 `C`라고 적혀 있지만 사실상 "모르겠다"는 뜻입니다. 숫자 표만 받으면 이런 정보는 이미 걸러진 뒤입니다.

### 예시 2 — TSV로 저장된 count matrix 읽기

```python
import io
import pandas as pd

# 탭으로 구분된 가상 count matrix: 행 = 유전자, 열 = 샘플
tsv_text = "gene\tS1\tS2\tS3\tS4\nGfap\t120\t135\t210\t198\nSod2\t80\t76\t91\t85\nMbp\t400\t388\t250\t262\n"
counts = pd.read_csv(io.StringIO(tsv_text), sep="\t", index_col="gene")
print(counts)
print("모양(유전자 수, 샘플 수):", counts.shape)
print("샘플별 총 count:")
print(counts.sum())
```

출력:

```text
       S1   S2   S3   S4
gene                    
Gfap  120  135  210  198
Sod2   80   76   91   85
Mbp   400  388  250  262
모양(유전자 수, 샘플 수): (3, 4)
샘플별 총 count:
S1    600
S2    599
S3    551
S4    545
dtype: int64
```

`\t`는 탭 문자, `\n`은 줄바꿈입니다. `io.StringIO`는 글자 덩어리를 파일인 것처럼 읽게 해 주는 도구로, 연습할 때 파일을 따로 만들지 않아도 되어 편합니다.

두 가지를 눈여겨보세요. 첫째, 이 표는 Day 4에서 본 **넓은(wide) 표**입니다. 행이 유전자, 열이 샘플이어서 "행 = 관찰"이라는 tidy 규칙과 방향이 반대입니다. 발현 행렬은 관례상 이렇게 저장하므로, 분석할 때 필요에 따라 뒤집거나 녹여 씁니다. 둘째, 이 표 어디에도 **S1이 어느 군인지** 적혀 있지 않습니다. 그 정보는 별도의 메타데이터 표에 있습니다.

### 예시 3 — WFDB header에서 기록 길이 알아내기

실제 WFDB header와 같은 형식으로 만든 가상 예시입니다. 첫 줄은 기록 전체의 정보(기록 이름, 신호 수, 샘플링 주파수, 샘플 수)이고, 그 아래는 신호(채널)마다 한 줄씩입니다.

```python
# WFDB 헤더(.hea)의 형식을 흉내 낸 가상 예시
header_text = """demo01 3 100 6000
demo01.dat 16 1000/g 16 0 12 -532 0 ACC_X
demo01.dat 16 1000/g 16 0 -3 1210 0 ACC_Y
demo01.dat 16 1000/g 16 0 998 77 0 ACC_Z
"""
lines = header_text.splitlines()
record_name, n_signals, fs, n_samples = lines[0].split()
n_signals, fs, n_samples = int(n_signals), int(fs), int(n_samples)

print("기록 이름:", record_name)
print("신호(채널) 수:", n_signals)
print("샘플링 주파수:", fs, "Hz")
print("기록 길이:", n_samples / fs, "초")
for line in lines[1:]:
    fields = line.split()
    print("채널:", fields[-1], "| 데이터 파일:", fields[0], "| gain:", fields[2])
```

출력:

```text
기록 이름: demo01
신호(채널) 수: 3
샘플링 주파수: 100 Hz
기록 길이: 60.0 초
채널: ACC_X | 데이터 파일: demo01.dat | gain: 1000/g
채널: ACC_Y | 데이터 파일: demo01.dat | gain: 1000/g
채널: ACC_Z | 데이터 파일: demo01.dat | gain: 1000/g
```

핵심 계산은 하나입니다. **기록 길이(초) = 샘플 수 ÷ 샘플링 주파수.** 6,000개를 1초에 100개씩 측정했으니 60초입니다. `gain`의 `1000/g`는 "저장된 숫자 1000이 실제 가속도 1 g에 해당한다"는 환산 비율입니다. header가 없으면 `.dat` 안의 숫자는 길이도 단위도 알 수 없는 숫자 더미입니다. 실제 분석에서는 직접 쪼개 읽지 않고 `wfdb` 패키지가 대신 해 줍니다.

## 직접 해보기

1. **예시 코드를 실행해 봅니다.** `notebooks/01_setup_and_metadata.ipynb` 맨 아래에 `## Day 6 — 파일 형식` 제목을 달고, 예시 1–3을 입력해 실행합니다.

2. **작은 실험 두 가지.**
   - 예시 1의 `fastq_text`에서 `read2`의 품질 줄을 `IIII5555`에서 `IIII####`으로 바꿔 실행합니다. 최저 품질이 어떻게 바뀌나요?
   - 예시 3의 첫 줄을 `demo01 3 50 6000`으로 바꿔 실행합니다. 같은 6,000개의 숫자인데 기록 길이가 몇 초가 되나요? 이 결과를 한 문장으로 적습니다.

3. **산출물 파일을 만듭니다.**

   ```bash
   cd ~/Documents/neurodegeneration-bioinformatics
   touch data-formats.md
   open -e data-formats.md
   ```

4. **아래 뼈대를 붙여 넣고 빈칸을 채웁니다.** 첫 행은 예시로 채워 두었습니다.

   ```markdown
   # 데이터 형식 정리

   작성일: 2026-__-__

   ## 1. 형식 비교표

   | 형식 | 무엇을 담는가 | 텍스트/바이너리 | 한 단위(레코드) | 메타데이터 위치 | Python으로 읽는 법 | 이 과정에서의 역할 |
   |---|---|---|---|---|---|---|
   | FASTA | 서열(참조 유전체, 유전자) | 텍스트 | `>` 이름 줄 + 서열 | 이름 줄 | 직접 읽기 또는 Biopython | 배경 지식 (직접 쓰지 않음) |
   | FASTQ | | | | | | |
   | count matrix | | | | | | |
   | TSV/CSV | | | | | | |
   | EDF | | | | | | |
   | WFDB header (.hea) | | | | | | |

   ## 2. 분자 데이터의 흐름

   FASTQ → (정렬·정량) → count matrix → (정규화) → 분석

   우리가 시작하는 단계:

   ## 3. 새 파일을 받으면 확인할 질문

   1. 
   2. 
   3. 

   ## 4. 아직 모르는 것 (나중에 확인할 것)

   - OSD-536에서 실제로 제공되는 파일 형식: 2주차 Day 12에 study record에서 확인
   - PADS의 실제 파일 형식: 4주차 Day 24에 PhysioNet 페이지에서 확인
   ```

5. **"이 과정에서의 역할" 칸을 신중하게 채웁니다.** 확실한 것만 적고, 모르는 것은 "확인 필요"라고 적습니다. 추측으로 채우지 않습니다. 예를 들어 EDF는 "PADS가 이 형식인지 확인 필요, 다른 PhysioNet 데이터에서 만날 수 있음" 정도가 정직한 답입니다.

6. **3번에 질문을 세 개 이상 적습니다.** 오늘 배운 "텍스트인가 바이너리인가", "한 행·한 열이 무엇인가", "단위와 샘플링 주파수는 어디 적혀 있는가" 등을 자기 말로 적습니다.

7. **일지와 commit.**

   ```bash
   git add data-formats.md notebooks/01_setup_and_metadata.ipynb learning-log.md
   git commit -m "Day 6: 데이터 형식 비교표 작성"
   ```

> ⚠️ **흔한 오류 1 — 표가 한 열로 뭉쳐서 읽힌다**
> TSV 파일을 `sep="\t"` 없이 `pd.read_csv()`로 읽으면, 쉼표가 없으니 한 줄 전체가 한 칸으로 들어갑니다. `df.shape`의 열 개수가 1이면 이 문제입니다. 구분자를 확인하려면 터미널에서 `head -n 3 파일이름`으로 첫 세 줄을 직접 보세요.

> ⚠️ **흔한 오류 2 — 바이너리 파일을 텍스트로 열었다**
> `.edf`나 `.dat`를 텍스트 편집기로 열면 깨진 글자가 가득 나옵니다. 파일이 망가진 것이 아니라 원래 사람이 읽는 형식이 아닙니다. **저장하지 말고** 닫으세요. 저장하면 정말로 망가질 수 있습니다.

## 퀴즈

**1.** FASTQ 파일에서 read 하나는 몇 줄이며, FASTA에는 없고 FASTQ에만 있는 정보는 무엇인가요? (단답)

<details><summary>정답 보기</summary>

**네 줄**(ID, 서열, `+`, 품질)이며, FASTQ에만 있는 것은 염기별 **품질 점수**입니다. FASTA는 "확정된 서열"을 담고, FASTQ는 "기계가 읽어 낸 서열과 그 판독의 자신 있는 정도"를 함께 담습니다.

</details>

**2.** count matrix에 대한 설명으로 옳은 것은?

- (a) 각 샘플의 DNA 서열이 들어 있다.
- (b) 보통 행이 유전자, 열이 샘플이며, 칸에는 그 유전자에 붙은 read 수가 들어 있다.
- (c) 샘플이 어느 군에 속하는지가 함께 적혀 있다.
- (d) 염기별 품질 점수가 들어 있다.

<details><summary>정답 보기</summary>

**(b)**. count matrix는 서열이 아니라 "개수"를 요약한 숫자 표입니다. 군 정보(c)는 별도의 메타데이터 표에 있고, 품질 점수(d)는 FASTQ 단계의 정보로 count matrix에는 남아 있지 않습니다.

</details>

**3.** 샘플링 주파수가 50 Hz이고 샘플이 15,000개인 기록의 길이는 몇 분인가요? (단답)

<details><summary>정답 보기</summary>

**5분**입니다. 15,000 ÷ 50 = 300초 = 5분. 샘플링 주파수를 모르면 같은 15,000개의 숫자가 몇 분짜리인지 알 수 없으므로, header에서 가장 먼저 확인할 값입니다.

</details>

**4.** 유전자 주석이 담긴 표를 CSV보다 TSV로 저장하는 일이 많은 이유는?

- (a) TSV가 용량이 더 작아서
- (b) 유전자 설명에 쉼표가 자주 들어가 칸이 잘못 나뉠 수 있어서
- (c) pandas가 CSV를 읽지 못해서
- (d) TSV는 바이너리 형식이라 더 안전해서

<details><summary>정답 보기</summary>

**(b)**. `solute carrier family 2, member 1`처럼 값 안에 쉼표가 있으면 쉼표 구분에서는 한 칸이 두 칸으로 쪼개질 수 있습니다. 탭은 값 안에 거의 등장하지 않아 더 안전합니다. TSV도 CSV처럼 텍스트 형식입니다.

</details>

**5.** EDF와 WFDB는 메타데이터(header)를 두는 방식이 어떻게 다른가요? (단답)

<details><summary>정답 보기</summary>

EDF는 **파일 하나** 안에 header와 신호가 함께 들어 있고, WFDB는 텍스트 header 파일(`.hea`)과 바이너리 신호 파일(`.dat`)이 **따로** 있습니다. 그래서 WFDB 기록을 옮길 때는 짝이 되는 파일들을 함께 옮겨야 합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `data-formats.md`의 비교표 여섯 행이 모두 채워져 있다.
- [ ] "이 과정에서의 역할" 칸에 추측 대신 "확인 필요"를 정직하게 적었다.
- [ ] "분자 데이터의 흐름"에서 우리가 시작하는 단계를 적었다.
- [ ] "새 파일을 받으면 확인할 질문"을 세 개 이상 적었다.
- [ ] 예시 코드 세 개를 실행했고, commit을 남겼다.

---
[← 이전](day-05.md) · [코스 지도](../../README.md) · [다음 →](day-07.md)
