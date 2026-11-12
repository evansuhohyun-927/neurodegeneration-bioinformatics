# Crash Course — Genomics (유전체)

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** DNA 변이 분석 논문의 방법 절을 따라 읽고, FASTQ에서 주석 달린 변이 표까지(또는 유전자형에서 GWAS 결과까지) 어떤 단계와 점검이 필요한지 계획할 수 있다.

## 한눈에 보기

유전체 분석은 **DNA 서열이 참조 유전체(reference genome)와 어디서 다른지**를 찾고, 그 차이가 표현형과 관련 있는지 해석하는 일이다. 발현량(얼마나 읽히는가)이 아니라 글자 자체(무엇이 적혀 있는가)를 본다.

| | 내용 |
|---|---|
| 무엇을 측정하는가 | 개인의 DNA 변이: 단일염기변이(SNV), 짧은 삽입·결실(indel), 구조 변이(SV), 복제수 변이(CNV), 반복 확장 |
| 답할 수 있는 질문 | 이 사람(가계)에게 질환을 설명할 만한 희귀 변이가 있는가 / 집단에서 어떤 변이가 형질과 통계적으로 연관되는가 / 이 변이는 일반 집단에서 얼마나 흔한가 |
| 답하지 못하는 것 | 변이가 **지금 그 조직에서** 무슨 일을 하는지(발현·단백질 수준은 다른 측정), 연관된 변이가 원인인지(연관 ≠ 인과), 한 사람의 발병 여부 예측 |
| 분석의 두 갈래 | (1) 개인·가계 수준: 변이 호출 → 필터 → 주석 → 해석 (2) 집단 수준: 유전자형 QC → 연관 검정(GWAS) |

## 🎬 급할 때 볼 영상

- [Overview of Illumina Sequencing by Synthesis Workflow | Standard SBS chemistry](https://www.youtube.com/watch?v=fCd6B5HRaZ8) — Illumina (5분). short-read가 어떻게 만들어지는지 알아야 FASTQ 품질 점수와 read 길이의 한계가 이해된다.
- [Episode 1 - GATK Explained: The Complete NGS Variant Calling Workflow | Omics in 10](https://www.youtube.com/watch?v=g118qvtcmfU) — OmicsLogic (8분). 아래 "표준 분석 흐름"의 개인 수준 단계를 처음부터 끝까지 한 번 훑는 용도.
- [Understanding Manhattan Plots and Genome-wide Association Studies](https://www.youtube.com/watch?v=Pdic7p_dk0I) — Oxford Academic (Oxford University Press) (7분). GWAS 논문의 대표 그림인 Manhattan plot 읽는 법.

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| 참조 유전체 (reference genome) | 변이를 "다르다"고 말할 때의 기준 서열. 사람은 GRCh37(hg19), GRCh38(hg38)이 널리 쓰인다 | 버전이 다르면 같은 변이의 좌표가 달라진다. 모든 파일이 같은 버전이어야 한다 |
| read와 coverage(depth) | read는 시퀀서가 읽은 짧은 조각, coverage는 한 위치를 덮은 read 수 | 깊이가 얕으면 이형접합 변이를 놓치거나 오류를 변이로 착각한다 |
| 변이 호출 (variant calling) | 정렬된 read에서 참조와 다른 자리를 통계적으로 판정하는 것 | 결과는 "사실"이 아니라 품질 점수가 붙은 추정이다 |
| 유전자형 (genotype) | 한 자리의 두 대립유전자 조합: 0/0, 0/1, 1/1 | 동형·이형접합 여부가 유전 양식(우성·열성) 해석의 출발점 |
| 대립유전자 빈도 (allele frequency, AF) | 집단의 전체 염색체 중 그 대립유전자가 차지하는 비율 | 흔한 변이는 희귀 단일유전자 질환의 원인이 되기 어렵다. 가장 강력한 필터 |
| 주석 (annotation) | 변이가 어느 유전자의 어느 전사체에서 어떤 결과(missense, frameshift 등)를 내는지 붙이는 것 | 같은 변이도 전사체 선택에 따라 결과가 달라진다 |
| 병원성 분류 | ACMG/AMP 기준의 5단계: pathogenic, likely pathogenic, VUS(의미 불명), likely benign, benign | 대부분의 희귀 변이는 VUS다. "희귀 + 단백질 변화"만으로 병원성이라 하지 않는다 |
| 연관 불균형 (linkage disequilibrium, LD) | 가까운 변이들이 함께 유전되어 유전자형이 서로 상관되는 현상 | GWAS에서 유의한 SNP은 원인 변이가 아니라 그 근처의 표지일 수 있다 |
| 집단 층화 (population stratification) | 환자군과 대조군의 유전적 배경(조상 집단)이 달라 생기는 가짜 연관 | 유전체 분석에서의 교란. 주성분(PC) 보정이 표준 대응 |
| 유전체 수준 유의성 (genome-wide significance) | 흔히 쓰는 문턱 p < 5×10⁻⁸. 약 백만 개의 독립 검정에 대한 Bonferroni 보정에 해당 | 수백만 SNP을 검정하므로 p < 0.05는 아무 의미가 없다 |

## 측정 기술 고르기

| 기술 | 무엇을 얻나 | 장점 | 한계 | 이런 질문에 쓴다 |
|---|---|---|---|---|
| SNP array | 미리 정한 수십만~수백만 자리의 유전자형 | 싸다. 수만 명 규모가 가능. imputation으로 관측하지 않은 흔한 변이를 추정 | 칩에 없는 희귀·새 변이는 못 본다 | 흔한 변이와 형질의 연관(GWAS), 다유전자 점수 |
| Targeted panel | 선택한 유전자 수십~수백 개의 서열 | 깊이가 깊어 민감도가 높고 해석 범위가 좁다 | 패널 밖은 보지 않는다. 패널 설계가 낡을 수 있다 | 알려진 원인 유전자 집합의 확인 |
| WES (whole-exome sequencing) | 단백질 암호화 영역(유전체의 1–2%) | WGS보다 싸면서 암호화 변이 대부분을 본다 | 포획(capture) 효율이 고르지 않다. 비암호화·구조 변이에 약하다 | 희귀 단일유전자 질환의 원인 변이 탐색 |
| WGS (short-read) | 유전체 거의 전체의 SNV·indel, 일부 SV·CNV | 깊이가 고르고 비암호화 영역까지 포함 | 비용·저장 공간. 반복 서열과 큰 구조 변이는 짧은 read로 어렵다 | WES로 못 찾은 사례, 비암호화 변이, 집단 참조 패널 |
| Long-read (PacBio, Oxford Nanopore) | 수 kb~수십 kb read | 구조 변이, 반복 확장, 위상(phasing, 어느 변이들이 같은 염색체에 있는가)에 강하다 | read당 비용이 높고 처리량이 낮다. 플랫폼에 따라 오류 양상이 다르다 | 반복 확장 질환, 복잡한 재배열, 짧은 read가 정렬되지 않는 영역 |

고르는 순서: 질문이 **흔한 변이의 집단 연관**이면 array, **한 사람·가계의 희귀 변이**면 WES/WGS, **반복 확장이나 큰 재배열**이 의심되면 long-read.

## 표준 분석 흐름

### 개인·가계 수준: FASTQ → 해석된 변이 표

1. **Read QC.** 염기 품질, adapter 오염, 중복률을 본다. 도구: [FastQC](https://www.bioinformatics.babraham.ac.uk/projects/fastqc/), [fastp](https://github.com/OpenGene/fastp), 여러 샘플 요약은 [MultiQC](https://multiqc.info/). 입력 FASTQ → 출력 QC 보고서(및 다듬은 FASTQ). QC: 샘플 하나만 품질 분포가 다르면 표시해 둔다.
2. **정렬 (alignment).** read를 참조 유전체에 붙인다. 도구: short-read는 [BWA-MEM](https://github.com/lh3/bwa), long-read는 [minimap2](https://github.com/lh3/minimap2). FASTQ + 참조 FASTA → BAM/CRAM. QC: 정렬률, 평균 깊이와 그 고른 정도([samtools](https://samtools.github.io/hts-specs/) `flagstat`, [mosdepth](https://github.com/brentp/mosdepth)). 생식세포 변이 분석에서 흔히 쓰는 출발점은 WGS 약 30×이며, WES는 목표 영역 평균뿐 아니라 "20× 이상 덮인 목표 영역의 비율"을 함께 본다.
3. **정렬 후처리.** PCR 중복 read 표시(duplicate marking), 필요하면 염기 품질 재보정. BAM → BAM.
4. **변이 호출.** 도구: GATK HaplotypeCaller([코드 저장소](https://github.com/broadinstitute/gatk), [문서](https://gatk.broadinstitute.org/hc/en-us)), [DeepVariant](https://github.com/google/deepvariant), [bcftools](https://samtools.github.io/bcftools/howtos/index.html). BAM → VCF(여러 샘플은 joint calling으로 한 VCF). 명령의 형태: `bcftools mpileup -f ref.fa sample.bam | bcftools call -mv -o sample.vcf.gz`.
5. **필터링.** 호출 품질(QUAL), 깊이(DP), 유전자형 품질(GQ), 대립유전자 비율로 믿기 어려운 호출을 거른다. VCF → VCF(FILTER 열이 채워짐). QC: 샘플당 변이 수, 전이/전환 비(Ti/Tv), 이형/동형접합 비가 다른 샘플과 비슷한지. 문턱값은 호출 도구마다 다르므로 그 도구의 공식 권고에서 출발한다(GATK 문서의 필터링 절).
6. **주석.** 유전자·전사체·결과 유형, 집단 빈도, 임상 DB 기록을 붙인다. 도구: [Ensembl VEP](https://www.ensembl.org/info/docs/tools/vep/index.html), [SnpEff](https://pcingola.github.io/SnpEff/). VCF → 주석 달린 VCF 또는 표.
7. **해석.** 빈도([gnomAD](https://gnomad.broadinstitute.org/)), 기존 보고([ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/)), 유전 양식과 가계 내 분리(segregation), 결과 유형을 합쳐 ACMG/AMP 틀로 분류한다. 남은 후보는 [IGV](https://igv.org/)로 read를 직접 눈으로 확인한다. 이 단계는 자동화되지 않는다.

전 과정을 묶은 공개 파이프라인: [nf-core/sarek](https://nf-co.re/sarek).

### 집단 수준: 유전자형 → GWAS

1. **샘플 QC.** call rate가 낮은 샘플, 기록된 성별과 유전적 성별의 불일치, 지나친 이형접합률, 숨은 친척·중복 샘플을 뺀다.
2. **변이 QC.** call rate가 낮은 SNP, 소수 대립유전자 빈도(MAF)가 너무 낮은 SNP, 대조군에서 Hardy–Weinberg 평형(HWE)을 크게 벗어난 SNP을 뺀다. 흔히 보는 출발점(예: call rate 98% 안팎, MAF 1%, HWE p < 10⁻⁶)과 그 근거는 Anderson 2010, Marees 2018(아래)에 정리되어 있다. 문턱은 표본 수와 칩에 따라 조정한다.
3. **집단 구조.** 유전자형으로 PCA를 해 조상 집단의 축을 얻는다. 동떨어진 샘플은 따로 다루고, 상위 PC를 공변량으로 쓴다.
4. **(선택) imputation.** 참조 패널로 관측하지 않은 변이의 유전자형을 추정한다.
5. **연관 검정.** SNP마다 회귀 한 번: 이분형 형질은 로지스틱, 연속 형질은 선형. 공변량에 나이·성별·PC를 넣는다. 도구: [PLINK 2](https://www.cog-genomics.org/plink/2.0/). 명령의 형태: `plink2 --bfile data --glm --covar covariates.txt`.
6. **결과 점검.** Manhattan plot(염색체 위치 × −log10 p)으로 신호 위치를, QQ plot(기대 p 대 관측 p)으로 전체적 부풀림을 본다. QQ plot이 처음부터 대각선 위로 뜨거나 genomic inflation factor(λ)가 1보다 뚜렷이 크면 층화나 QC 문제를 먼저 의심한다.
7. **후속.** 유의한 구역(locus)마다 LD로 묶어 대표 SNP을 정하고, 독립 코호트에서 재현을 확인한다. 어느 유전자가 원인인지는 fine-mapping, eQTL 등 별도 분석이 필요하다.

### 파일 형식

| 형식 | 담는 것 | 알아 둘 점 |
|---|---|---|
| FASTQ | read 서열 + 염기별 품질 점수 (read 하나 = 4줄) | 보통 gzip 압축. paired-end면 파일 두 개(R1, R2)가 짝 |
| BAM / CRAM | 참조에 정렬된 read. SAM의 이진 압축형 | 좌표순 정렬 + 색인(.bai/.crai)이 있어야 도구가 읽는다. CRAM은 복원에 **같은 참조 FASTA**가 필요 |
| VCF / BCF | 변이 자리(행) × 샘플(열)의 유전자형과 품질 | 좌표가 **1부터** 시작. 헤더에 참조 버전과 각 필드 정의가 있다 |
| BED | 유전체 구간 목록 (염색체, 시작, 끝) | 시작 좌표가 **0부터**, 끝은 포함하지 않는다 |
| GFF / GTF | 유전자·전사체·엑손의 위치(유전자 모델) | 좌표가 **1부터**, 끝 포함. 주석 버전(Ensembl/GENCODE 릴리스)을 기록한다 |

형식 정의의 원문: [hts-specs](https://samtools.github.io/hts-specs/) (SAM/BAM/CRAM/VCF), [UCSC 형식 FAQ](https://genome.ucsc.edu/FAQ/FAQformat.html) (BED, GFF/GTF).

## 최소 실행 예시

두 예시 모두 지어낸 값이다. 흐름을 보여 주기 위한 것이며 실제 문턱값을 권하는 것이 아니다.

### 예시 1 — 주석 달린 변이 표를 단계적으로 좁히기

```python
import pandas as pd

# 가상 변이 표: 주석까지 끝난 VCF를 표로 펼친 모습 (값은 모두 지어낸 것)
variants = pd.DataFrame({
    "chrom":  ["chr1", "chr1", "chr2", "chr7", "chr12", "chr17", "chr19", "chrX"],
    "pos":    [155235, 155240, 47403, 117559, 40340, 43093, 44908, 15372],
    "ref":    ["G", "C", "A", "CTT", "G", "T", "T", "A"],
    "alt":    ["A", "T", "G", "C", "A", "TA", "C", "G"],
    "gene":   ["GENE_A", "GENE_A", "GENE_B", "GENE_C", "GENE_D", "GENE_E", "GENE_F", "GENE_G"],
    "consequence": ["missense", "synonymous", "missense", "frameshift",
                    "missense", "frameshift", "missense", "stop_gained"],
    "QUAL":   [812, 45, 630, 990, 18, 240, 1500, 77],   # 변이 품질 점수
    "DP":     [42, 35, 8, 51, 30, 12, 60, 6],           # 그 자리를 덮은 read 수
    "FILTER": ["PASS", "PASS", "PASS", "PASS", "LowQual", "PASS", "PASS", "PASS"],
    "pop_AF": [0.00002, 0.21, 0.0004, None, 0.0001, 0.00001, 0.14, 0.0],  # 집단 빈도, None = DB에 없음
})

print("전체 변이 수:", len(variants))

# 1단계 — 기술적 필터: 호출 자체를 믿을 수 있는가
tech = variants[(variants["FILTER"] == "PASS") & (variants["QUAL"] >= 30) & (variants["DP"] >= 10)]
print("기술적 필터 통과:", len(tech))

# 2단계 — 빈도 필터: 희귀 질환 후보라면 흔한 변이는 뺀다.
# DB에 없는 변이(None)는 0으로 간주해 '남긴다' — 지우면 가장 희귀한 변이를 잃는다.
rare = tech[tech["pop_AF"].fillna(0) < 0.001]
print("희귀(AF < 0.001) 변이:", len(rare))

# 3단계 — 기능 필터: 단백질을 바꾸는 변이만
damaging = ["missense", "frameshift", "stop_gained", "splice_site"]
cand = rare[rare["consequence"].isin(damaging)]
print("단백질 변화 변이:", len(cand))
print()
print(cand[["chrom", "pos", "ref", "alt", "gene", "consequence", "DP", "pop_AF"]].to_string(index=False))

# 자기 점검: 단계가 진행될수록 수가 줄어야 하고, 빈도 미상 변이는 남아 있어야 한다
assert len(variants) >= len(tech) >= len(rare) >= len(cand)
assert cand["pop_AF"].isna().sum() == 1
```

```text
전체 변이 수: 8
기술적 필터 통과: 5
희귀(AF < 0.001) 변이: 3
단백질 변화 변이: 3

chrom    pos ref alt   gene consequence  DP  pop_AF
 chr1 155235   G   A GENE_A    missense  42 0.00002
 chr7 117559 CTT   C GENE_C  frameshift  51     NaN
chr17  43093   T  TA GENE_E  frameshift  12 0.00001
```

읽는 법: 8개 중 3개가 깊이·품질 때문에 먼저 빠졌고, 흔한 변이 2개가 빈도에서 빠졌다. 빈도 DB에 없는 chr7 변이가 끝까지 남은 것에 주목한다. 남은 3개는 "원인 변이"가 아니라 **사람이 검토할 후보**다. 필터 순서와 각 단계의 수를 기록해 두면 나중에 "왜 이 변이가 빠졌는가"에 답할 수 있다.

### 예시 2 — 유전자형에서 대립유전자 빈도와 case/control 연관 검정

```python
import numpy as np
import pandas as pd
from scipy import stats

rng = np.random.default_rng(7)

# 가상 SNP 하나: 유전자형을 '대체 대립유전자(alt allele) 개수' 0/1/2로 적는다
# 환자군의 alt 빈도를 0.30, 대조군을 0.20으로 두고 뽑는다 (지어낸 값)
n_case, n_ctrl = 500, 500
case = rng.binomial(2, 0.30, n_case)
ctrl = rng.binomial(2, 0.20, n_ctrl)

geno = pd.DataFrame({
    "group": ["case"] * n_case + ["control"] * n_ctrl,
    "alt_count": np.concatenate([case, ctrl]),
})

# 유전자형 개수 표
print(pd.crosstab(geno["group"], geno["alt_count"]))
print()

# 대립유전자 빈도 = alt 대립유전자 수 / 전체 대립유전자 수(사람 수 x 2)
af = geno.groupby("group")["alt_count"].sum() / (geno.groupby("group")["alt_count"].count() * 2)
print("alt 대립유전자 빈도")
print(af.round(3).to_string())
print()

# 대립유전자 단위 2x2 표: 행 = 군, 열 = (alt, ref)
alt = geno.groupby("group")["alt_count"].sum()
tot = geno.groupby("group")["alt_count"].count() * 2
table = np.array([[alt["case"], tot["case"] - alt["case"]],
                  [alt["control"], tot["control"] - alt["control"]]])
chi2, p, dof, _ = stats.chi2_contingency(table, correction=False)
odds_ratio = (table[0, 0] * table[1, 1]) / (table[0, 1] * table[1, 0])
print(f"chi2 = {chi2:.2f}, p = {p:.2e}, odds ratio = {odds_ratio:.2f}")
print("유전체 수준 유의성(5e-8) 통과:", p < 5e-8)

# QC 한 가지: 대조군의 Hardy-Weinberg 평형 (관찰 유전자형 수 vs 기대 수)
q = af["control"]
obs = np.bincount(ctrl, minlength=3)
exp = np.array([(1 - q) ** 2, 2 * q * (1 - q), q ** 2]) * n_ctrl
hwe_chi2 = ((obs - exp) ** 2 / exp).sum()
print(f"대조군 HWE: chi2 = {hwe_chi2:.2f}, p = {stats.chi2.sf(hwe_chi2, df=1):.2f}")

assert table.sum() == 2 * (n_case + n_ctrl)
```

```text
alt_count    0    1   2
group                  
case       231  226  43
control    335  145  20

alt 대립유전자 빈도
group
case       0.312
control    0.185

chi2 = 43.18, p = 4.98e-11, odds ratio = 2.00
유전체 수준 유의성(5e-8) 통과: True
대조군 HWE: chi2 = 0.73, p = 0.39
```

읽는 법: 환자군의 alt 빈도가 더 높고(0.312 대 0.185), 대립유전자 단위 odds ratio는 2.00이다. 이것은 GWAS가 SNP 하나에 대해 하는 일의 가장 단순한 형태다. 실제 분석은 이 검정을 수백만 SNP에 반복하므로 문턱이 5×10⁻⁸이 되고, 단순 카이제곱 대신 나이·성별·PC를 넣은 회귀를 쓴다. 대조군이 HWE에서 벗어나지 않았다는 것은 유전자형 판정에 큰 기술적 문제가 없다는 간접 증거로 쓰인다.

## 흔한 함정

1. **참조 유전체 버전을 섞는다** → GRCh37 좌표의 변이 목록을 GRCh38 BAM·주석과 맞추면 엉뚱한 자리를 보게 되고, 오류 없이 조용히 틀린다 → 모든 파일(FASTA, BAM, VCF, BED, GTF, 빈도 DB)의 버전을 표로 적고, 다르면 [LiftOver](https://genome.ucsc.edu/cgi-bin/hgLiftOver) 같은 도구로 변환하되 변환에 실패한 자리 수를 기록한다.
2. **염색체 이름 표기를 확인하지 않는다** → `chr1`과 `1`, `chrM`과 `MT`가 섞이면 구간 교집합이 0개가 된다 → 결과가 비었을 때 가장 먼저 두 파일의 염색체 이름을 비교한다.
3. **0-기반과 1-기반 좌표를 혼동한다** → BED와 VCF/GFF 사이에서 한 칸씩 어긋난다 → 형식을 바꿀 때는 직접 계산하지 말고 검증된 도구를 쓰고, 알려진 변이 하나로 결과를 확인한다.
4. **필터를 통과한 변이를 곧 원인 변이로 쓴다** → 건강한 사람도 희귀한 단백질 변화 변이를 많이 갖고 있다 → 빈도, 유전 양식, 가계 내 분리, 기존 보고를 함께 보고 ACMG/AMP 범주로 적는다. 대부분은 VUS로 남는다.
5. **빈도 DB에 없는 변이를 지운다, 또는 맞지 않는 집단의 빈도만 본다** → 가장 희귀한 후보를 잃거나, 특정 집단에서는 흔한 변이를 희귀하다고 착각한다 → 결측은 "관측된 적 없음"으로 남기고, 전체 빈도와 집단별 최대 빈도를 함께 본다.
6. **집단 층화를 보정하지 않고 연관 검정을 한다** → 조상 집단 차이가 질환 연관처럼 보인다 → 유전자형 PCA로 구조를 확인하고 PC를 공변량에 넣는다. QQ plot으로 부풀림을 점검한다.
7. **유의한 SNP과 가장 가까운 유전자를 원인이라 쓴다** → LD 때문에 신호는 구역 전체에 퍼져 있고, 조절 변이는 먼 유전자에 작용할 수 있다 → "이 구역이 연관된다"까지만 말하고, 유전자 지목은 추가 증거가 있을 때만 한다.
8. **환자와 대조를 다른 배치·다른 플랫폼에서 처리한다** → 호출 오류의 차이가 연관 신호가 된다 → 환자와 대조를 같은 조건에서 처리하고 함께 호출(joint calling)한다. 불가능하면 배치별 QC 지표를 비교해 한계로 적는다.

## 연구 설계 체크리스트

- [ ] 질문이 "한 사람·가계의 희귀 변이"인지 "집단의 흔한 변이 연관"인지 정했다 (기술과 흐름이 갈린다)
- [ ] 참조 유전체 버전과 유전자 주석 버전을 정했고, 받은 모든 파일이 그 버전인지 확인했다
- [ ] 목표 깊이와, 그 깊이에 못 미친 샘플·영역을 어떻게 다룰지 정했다
- [ ] 표본 수가 질문에 맞다 (GWAS는 작은 효과를 찾으므로 수천 명 이상이 흔하다. 가계 분석은 발병·비발병 가족 구성원이 필요하다)
- [ ] 환자와 대조가 같은 플랫폼·같은 배치·같은 파이프라인으로 처리된다
- [ ] 메타데이터에 성별, 나이, 조상 집단(자가 보고), 가족 관계, 표현형 정의가 있다
- [ ] 샘플 뒤바뀜을 잡을 방법이 있다 (유전적 성별 대 기록, 친척 관계 추정)
- [ ] 필터 기준과 유의성 문턱을 결과를 보기 전에 적었다
- [ ] 다중검정 방식(유전체 수준 문턱, 또는 유전자 단위 검정의 보정)을 정했다
- [ ] 재현·검증 계획이 있다 (독립 코호트, 또는 후보 변이의 다른 방법 확인)
- [ ] 개인 유전체 자료의 동의 범위와 접근 통제 조건을 확인했다 (공개 저장소에 올릴 수 있는 수준인지)

## 공개 데이터와 더 볼 곳

**저장소·데이터베이스**

| 이름 | URL | 무엇이 있나 |
|---|---|---|
| gnomAD | <https://gnomad.broadinstitute.org/> | 대규모 exome·genome에서 집계한 변이별 집단 빈도 |
| ClinVar | <https://www.ncbi.nlm.nih.gov/clinvar/> | 변이와 질환의 관계에 대한 제출 기록과 근거 수준 |
| dbSNP | <https://www.ncbi.nlm.nih.gov/snp/> | 짧은 변이의 식별자(rs 번호)와 좌표 |
| 1000 Genomes (IGSR) | <https://www.internationalgenome.org/> | 여러 집단의 공개 유전체. 참조 패널과 연습용으로 쓴다 |
| GWAS Catalog | <https://www.ebi.ac.uk/gwas/> | 발표된 GWAS의 연관 신호와 요약 통계 |
| SRA | <https://www.ncbi.nlm.nih.gov/sra> | 원시 시퀀싱 read |
| dbGaP | <https://www.ncbi.nlm.nih.gov/gap/> | 개인 수준 유전자형·표현형 (승인 후 접근) |
| AD Knowledge Portal | <https://adknowledgeportal.synapse.org/> | 알츠하이머병 관련 코호트의 유전체·오믹스 자료 (일부는 승인 필요) |
| GRC | <https://www.ncbi.nlm.nih.gov/grc/human> | 사람 참조 유전체의 버전과 패치 정보 |

**공식 문서·튜토리얼**

- GATK 문서: <https://gatk.broadinstitute.org/hc/en-us> (자동 요청에는 403을 돌려준다. 브라우저에서 연다)
- bcftools 사용법: <https://samtools.github.io/bcftools/howtos/index.html>
- PLINK 2: <https://www.cog-genomics.org/plink/2.0/>
- Galaxy Training Network (설치 없이 브라우저에서 변이 분석 실습): <https://training.galaxyproject.org/>
- EMBL-EBI 온라인 과정, 사람 유전 변이 입문: <https://www.ebi.ac.uk/training/online/courses/human-genetic-variation-introduction/>
- ClinGen (변이·유전자 해석 기준 자료): <https://clinicalgenome.org/>

**핵심 논문**

- Van der Auwera GA, et al. From FastQ data to high-confidence variant calls: the Genome Analysis Toolkit best practices pipeline. *Curr Protoc Bioinformatics.* 2013;43. doi:[10.1002/0471250953.bi1110s43](https://doi.org/10.1002/0471250953.bi1110s43)
- Danecek P, et al. The variant call format and VCFtools. *Bioinformatics.* 2011;27:2156–2158. doi:[10.1093/bioinformatics/btr330](https://doi.org/10.1093/bioinformatics/btr330)
- Richards S, et al. Standards and guidelines for the interpretation of sequence variants (ACMG/AMP). *Genet Med.* 2015;17:405–424. doi:[10.1038/gim.2015.30](https://doi.org/10.1038/gim.2015.30)
- Karczewski KJ, et al. The mutational constraint spectrum quantified from variation in 141,456 humans. *Nature.* 2020;581:434–443. doi:[10.1038/s41586-020-2308-7](https://doi.org/10.1038/s41586-020-2308-7)
- Uffelmann E, et al. Genome-wide association studies. *Nat Rev Methods Primers.* 2021;1. doi:[10.1038/s43586-021-00056-9](https://doi.org/10.1038/s43586-021-00056-9)
- Marees AT, et al. A tutorial on conducting genome-wide association studies: quality control and statistical analysis. *Int J Methods Psychiatr Res.* 2018;27. doi:[10.1002/mpr.1608](https://doi.org/10.1002/mpr.1608)
- Anderson CA, et al. Data quality control in genetic case-control association studies. *Nat Protoc.* 2010;5:1564–1573. doi:[10.1038/nprot.2010.116](https://doi.org/10.1038/nprot.2010.116)

## 본 과정과의 연결

본 과정의 실습 데이터는 발현량과 운동 신호이며 변이 호출을 직접 하지는 않는다. 아래 레슨이 이 가이드의 바탕 개념을 자세히 다룬다.

| 이 가이드의 부분 | 자세히 다루는 레슨 |
|---|---|
| 변이와 발현량은 다른 종류의 데이터 | [Day 2 — 퇴행성 뇌질환의 공통·차이 기전](../lessons/week-1/day-02.md) |
| FASTA·FASTQ 읽기, 파일 형식은 약속 | [Day 6 — 생물학·생체신호 파일 형식](../lessons/week-1/day-06.md) |
| accession과 version, 참조 서열 레코드 | [Day S1 — 서열 데이터베이스와 레코드 읽기](../lessons/supplement/day-S1.md) |
| missense·frameshift 등 변이 분류, 보존 | [Day S2 — 돌연변이, 보존, 상동성](../lessons/supplement/day-S2.md) |
| 정렬이 실제로 하는 계산 | [Day S4 — 쌍 정렬과 동적 프로그래밍](../lessons/supplement/day-S4.md) |
| 많은 후보 중 "우연히 이만큼"의 통계 | [Day S5 — BLAST와 E-value](../lessons/supplement/day-S5.md) |
| p-value·효과크기, 다중검정 | [Day 9](../lessons/week-2/day-09.md), [Day 10 — FDR과 다중검정](../lessons/week-2/day-10.md) |
| 배치·교란(집단 층화의 일반형), 공변량 보정 | [Day 11 — 반복, 배치, 교란, 대조군](../lessons/week-2/day-11.md), [Day 31 — 교란변수](../lessons/week-5/day-31.md) |
| PCA로 샘플 구조 보기 | [Day 14 — PCA와 heatmap](../lessons/week-2/day-14.md) |
| 표 필터링에 쓰는 pandas 기초 | [Day F6 — 파일 읽기와 pandas 첫걸음](../lessons/week-0/day-F6.md) |
| 버전과 출처 기록 | [Day 15 — 데이터 수집과 provenance](../lessons/week-3/day-15.md) |

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
