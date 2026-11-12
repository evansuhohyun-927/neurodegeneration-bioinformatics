# Crash Course — 그 밖의 omics와 multi-omics 통합

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** epigenomics, metabolomics/lipidomics, microbiome 논문이 무엇을 재고 어디서 틀리기 쉬운지 파악하고, 여러 omics 층을 합쳐도 되는 경우와 안 되는 경우를 구분한다.

이 문서는 세 분야를 얕게 훑고, 뒤쪽 절반을 multi-omics 통합에 쓴다. 각 분야를 직접 분석해야 한다면 여기서 흐름과 함정만 잡고 "공개 데이터와 더 볼 곳"의 공식 튜토리얼로 넘어간다.

## 한눈에 보기

| 분야 | 무엇을 측정하는가 | 어떤 질문에 답하는가 | 답하지 못하는 것 |
|---|---|---|---|
| epigenomics — DNA 메틸화 | CpG 자리마다 메틸화된 분자의 비율 | 조건·노출·나이에 따라 어느 자리의 메틸화가 다른가 | 그 차이가 발현을 바꿨는지, 원인인지 결과인지. bulk 조직에서는 세포 구성 변화와 구분하기 어렵다. |
| epigenomics — ChIP-seq | 특정 단백질(전사인자, 히스톤 변형)이 붙어 있던 DNA 구간 | 이 인자·표지가 유전체 어디에 있는가 | 그 결합이 기능을 하는지, 어느 유전자를 조절하는지 |
| epigenomics — ATAC-seq | 열려 있는(접근 가능한) 염색질 구간 | 어느 조절 영역이 열려 있고 조건에 따라 달라지는가 | 무엇이 붙어 있는지, 실제로 전사가 일어나는지 |
| metabolomics / lipidomics | 저분자 대사물·지질의 신호 강도 | 어떤 대사물의 상대량이 조건에 따라 다른가 | 대사 흐름의 속도(flux), 출처 조직, (untargeted에서는) 많은 신호의 정체 |
| microbiome | 미생물 군집의 구성(16S) 또는 유전자 내용(shotgun) | 어떤 분류군·기능 유전자가 상대적으로 많은가 | 절대량, 살아 있거나 활성인지, 숙주 표현형과의 인과 |
| multi-omics 통합 | 위 층들 사이의 공변동 | 여러 층이 같은 방향을 가리키는가, 층 사이의 불일치는 어디인가 | 층 사이 조절의 방향과 인과(관찰 자료만으로는) |

## 🎬 급할 때 볼 영상

- [StatQuest: A gentle introduction to ChIP-Seq — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=nkWGmaYRues) (8:30) — "읽은 조각이 쌓인 곳이 peak"라는 발상을 잡는다. ATAC-seq을 읽을 때도 같은 그림을 쓴다.
- [16S rRNA Gene Sequencing vs. Shotgun Metagenomic Sequencing — Microbiome Insights](https://www.youtube.com/watch?v=SDbYFCAHX8s) (16:18) — microbiome 연구에서 가장 먼저 해야 하는 선택을 다룬다.
- [Intro to Multiomics — MHSc Medical Genomics](https://www.youtube.com/watch?v=o0KckPa4oQw) (15:11) — 여러 층을 함께 본다는 것이 무엇인지에 대한 짧은 개관.
- (선택, 검색 링크) 메틸화와 대사체는 위 영상에 없다: [YouTube 검색 — "bisulfite sequencing DNA methylation explained"](https://www.youtube.com/results?search_query=bisulfite+sequencing+DNA+methylation+explained), [YouTube 검색 — "untargeted metabolomics LC-MS introduction"](https://www.youtube.com/results?search_query=untargeted+metabolomics+LC-MS+introduction)

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| beta value / M-value | beta는 한 CpG 자리의 메틸화 비율(0–1), M-value는 그 logit(log2 비) 변환 | beta는 해석에, M-value는 통계 검정에 주로 쓴다. 어느 값으로 검정했는지에 따라 결과가 달라진다. |
| bisulfite 전환 | 메틸화되지 않은 C만 U(읽을 때 T)로 바꾸는 화학 처리 | 메틸화를 서열 차이로 바꿔 읽게 해 준다. 전환이 불완전하면 메틸화가 과대평가된다. |
| peak | 읽은 조각(read)이 배경보다 많이 쌓인 유전체 구간 | ChIP-seq·ATAC-seq의 기본 단위. peak의 유무와 높이는 깊이·배경·설정에 따라 달라진다. |
| input control | 항체 없이(또는 비특이 항체로) 같은 과정을 거친 대조 시료 | 잘 열려 있거나 반복이 많은 구간은 항체 없이도 쌓인다. 대조 없이는 진짜 신호와 구분할 수 없다. |
| feature (대사체) | 질량 대 전하비(m/z)와 머무름 시간(retention time)의 쌍으로 정의된 신호 하나 | feature는 대사물이 아니다. 한 대사물이 여러 feature(adduct, 동위원소, 조각)를 만들고, 많은 feature는 정체가 없다. |
| annotation 신뢰 수준 | 대사물 이름이 표준물질로 확인된 것인지, DB 검색으로 추정한 것인지의 등급 | 논문 표의 대사물 이름이 모두 같은 확실성이 아니다. 등급을 보고 읽는다. |
| ASV (amplicon sequence variant) | 오류를 제거한 뒤 남은, 한 염기까지 구분된 amplicon 서열 | 16S 분석의 단위. 예전의 OTU(유사도로 묶은 군집)보다 연구 간 비교가 쉽다. |
| compositional data | 합이 고정되어 각 값이 "전체 중 비율"로만 의미를 갖는 자료 | sequencing 기반 상대 풍부도가 그렇다. 한 분류군이 늘면 나머지는 변하지 않아도 비율이 줄어든다. |
| matched / unmatched | 여러 층을 **같은 시료**에서 얻었는가(matched), 서로 다른 시료·연구에서 얻었는가(unmatched) | 통계적으로 합칠 수 있는지를 결정하는 첫 번째 질문이다. |
| p ≫ n | 변수(유전자, 자리, feature)의 수 p가 시료 수 n보다 훨씬 많은 상황 | 변수가 많으면 우연한 패턴이 반드시 생긴다. 층을 더할수록 p만 늘고 n은 그대로다. |

## 측정 기술 고르기

"어떤 기술이 좋은가"보다 "내 질문이 어느 층에 있는가"를 먼저 정한다.

| 이런 질문이면 | 이 omics | 무엇을 얻나 | 장점 | 한계 |
|---|---|---|---|---|
| 타고난 유전 변이가 위험과 관련되는가 | genomics (genotyping array, WGS/WES) | 변이 목록, 유전형 | 평생 거의 변하지 않아 역인과 걱정이 적다 | 변이가 어떤 기전으로 작용하는지는 따로 밝혀야 한다 |
| 어떤 유전자의 발현이 달라지는가 | transcriptomics (RNA-seq, 패널) | 유전자별 발현량 | 유전체 전체를 한 번에, 도구가 성숙 | 단백질 양·활성과 다를 수 있다 |
| 어떤 단백질의 양·변형이 달라지는가 | proteomics ([별도 가이드](proteomics.md)) | 단백질·PTM 상대량 | 기능 분자를 직접 본다 | 결측이 많고 깊이에 한계 |
| 조절 영역의 상태가 달라지는가 (적은 세포, 인자를 모를 때) | ATAC-seq | 열린 염색질 구간 | 세포가 적어도 되고 항체가 필요 없다 | 무엇이 붙었는지는 간접 추정(motif) |
| 특정 전사인자·히스톤 표지가 어디에 있는가 | ChIP-seq | 그 인자의 결합 구간 | 인자를 직접 지정해 본다 | 좋은 항체와 많은 세포가 필요하다 |
| 많은 사람에서 메틸화와 노출·질병의 연관을 보고 싶다 | 메틸화 array | 정해진 CpG 자리 수십만 개의 beta | 시료당 비용이 낮고 코호트 간 비교가 쉽다 | array에 있는 자리만 본다 |
| 유전체 전체나 특정 영역의 메틸화를 염기 단위로 보고 싶다 | bisulfite-seq (WGBS, RRBS) | 자리별 메틸화 비율 | array에 없는 자리까지 | 비용, 깊이가 얕으면 자리별 추정이 불안정 |
| 정해진 대사물 수십–수백 개의 농도가 다른가 | targeted metabolomics / lipidomics | 표준물질로 확인된 대사물의 정량값 | 정체가 확실하고 재현성이 높다 | 정한 것만 본다 |
| 무엇이 달라지는지 모른 채 넓게 찾고 싶다 | untargeted metabolomics (LC-MS) | 수천 개 feature의 상대 강도 | 예상하지 못한 것을 찾는다 | 대부분의 feature는 정체 미확인, 배치·drift에 민감 |
| 적은 수의 풍부한 대사물을 재현성 있게 재고 싶다 | NMR metabolomics | 수십 개 대사물의 정량값 | 재현성과 정량성이 높고 시료 손상이 적다 | 민감도가 낮아 저농도 대사물은 못 본다 |
| 군집에 어떤 분류군이 있는가 (예산이 적고 시료가 많다) | 16S amplicon | 속(genus) 수준의 상대 구성 | 싸고 숙주 DNA의 영향이 적다 | 종·균주 구분과 기능 추정이 제한적, 세균·고세균만 |
| 종·균주 수준, 또는 어떤 기능 유전자가 있는가 | shotgun metagenomics | 종 수준 구성과 유전자·경로 풍부도 | 해상도가 높고 기능을 직접 본다 | 비용, 숙주 DNA가 많은 시료에서는 대부분의 read가 버려진다 |

## 표준 분석 흐름

분야마다 "무엇을 재나 → 흐름(5단계 이내) → 대표 함정 2개" 순서로 적는다. QC 기준값은 흔히 쓰는 출발점이며 시료 종류에 따라 달라진다. 숫자는 각 항목에 건 공식 문서에서 확인한다.

### 1. DNA 메틸화 (array, bisulfite-seq)

**무엇을 재나:** CpG 자리의 cytosine이 메틸화된 비율. array는 정해진 자리의 신호 강도 두 개(메틸화/비메틸화)를, bisulfite-seq은 그 자리를 덮은 read 중 C로 읽힌 비율을 쓴다.

1. 원자료 QC — array: `IDAT` 파일, 검출 p-value가 나쁜 시료·probe 제거. seq: `FASTQ` 품질 확인과 adapter 제거([FastQC](https://www.bioinformatics.babraham.ac.uk/projects/fastqc/)).
2. 정렬과 메틸화 추출(seq만) — bisulfite 전용 정렬 도구 [Bismark](https://www.bioinformatics.babraham.ac.uk/projects/bismark/): `FASTQ` → `BAM` → 자리별 메틸화/비메틸화 read 수. 비메틸화 대조 DNA(spike-in)나 non-CpG 자리로 전환 효율을 확인한다. 전체 파이프라인은 [nf-core/methylseq](https://nf-co.re/methylseq).
3. 정규화와 필터 — array: [minfi](https://bioconductor.org/packages/minfi/), [SeSAMe](https://www.bioconductor.org/packages/sesame/)(R). SNP과 겹치거나 여러 곳에 붙는 probe, 성염색체 probe를 질문에 맞게 처리한다. seq: 최소 깊이 기준으로 자리를 거른다.
4. 차등 메틸화 — 자리 단위(DMP)와 영역 단위(DMR). 공변량(나이, 성별, 배치, 세포 구성)을 모형에 넣고 다중검정을 보정한다.
5. 해석 — 가까운 유전자·조절 영역에 주석을 달고, 가능하면 같은 시료의 발현과 비교한다.

**대표 함정**

- **세포 구성을 무시한다.** 혈액이나 뇌 조직은 여러 세포 유형의 혼합이고 세포 유형마다 메틸화가 크게 다르다 → 질병군에서 세포 비율이 바뀌면 그것만으로 수많은 자리가 "유의"해진다 → 세포 비율을 추정해 보정하거나 분리한 세포로 측정한다([Jaffe & Irizarry 2014](https://doi.org/10.1186/gb-2014-15-2-r31)).
- **array의 위치(슬라이드, 행)와 처리 날짜가 조건과 겹친다.** → 배치 효과가 군 차이로 읽힌다 → 시료를 무작위로 배치하고, PCA를 배치 변수로 색칠해 확인한다.

### 2. ChIP-seq, ATAC-seq

**무엇을 재나:** ChIP-seq은 항체로 끌어낸 DNA 조각, ATAC-seq은 Tn5 transposase가 끼어든 자리(열린 염색질)의 DNA 조각. 둘 다 "read가 쌓인 구간"을 찾는 분석이다.

1. QC와 정렬 — `FASTQ` → `BAM`. 중복 read, 미토콘드리아 read(ATAC-seq에서 많다), 정렬 품질이 낮은 read를 처리한다.
2. peak 찾기 — [MACS](https://github.com/macs3-project/MACS): `BAM` → peak 목록(`BED`/`narrowPeak`). ChIP-seq은 input control을 함께 준다. 전사인자는 좁은 peak, 일부 히스톤 표지는 넓은 peak 설정을 쓴다.
3. 시료 QC — peak 안에 든 read의 비율(FRiP), 반복 간 peak 일치도, ATAC-seq에서는 전사 시작점(TSS) 주변 농축과 조각 길이 분포. 기준값은 [ENCODE의 ChIP-seq](https://www.encodeproject.org/chip-seq/transcription_factor/)·[ATAC-seq](https://www.encodeproject.org/atac-seq/) 자료 표준 문서와 [Landt 2012](https://doi.org/10.1101/gr.136184.111)를 본다.
4. 차등 분석 — 반복 시료 전체의 합의 peak 집합에서 read를 세어 count 행렬을 만들고, RNA-seq과 같은 방식의 count 모형으로 검정한다.
5. 해석 — motif 분석, 가까운 유전자 주석, 발현 자료와의 비교. 전체 파이프라인은 [nf-core/chipseq](https://nf-co.re/chipseq), [nf-core/atacseq](https://nf-co.re/atacseq).

**대표 함정**

- **대조와 반복 없이 peak를 믿는다.** → 열린 구간·반복 서열에는 항체와 무관하게 read가 쌓인다 → input control과 생물학적 반복 2개 이상을 요구하고, 반복 간에 재현되는 peak만 쓴다. 항체의 특이성 검증 여부도 Methods에서 확인한다.
- **peak를 가장 가까운 유전자의 조절 증거로 읽는다.** → enhancer는 멀리 있는 유전자를 조절할 수 있고, 열려 있다고 해서 활성인 것도 아니다 → "가까운 유전자"는 주석일 뿐 가설이다. 발현 자료나 염색질 접촉 자료로 뒷받침되는지 본다.

### 3. metabolomics / lipidomics

**무엇을 재나:** 저분자 대사물·지질 이온의 강도. LC-MS(또는 GC-MS)는 민감하고 넓게 보며, NMR은 덜 민감하지만 재현성과 정량성이 높다. targeted는 표준물질로 정한 대사물을, untargeted는 검출되는 모든 feature를 잰다.

1. 측정 설계 — run 순서 무작위화, **pooled QC 시료**(모든 시료를 조금씩 섞은 것)를 일정 간격으로 주입, blank 포함.
2. feature 추출 — 피크 검출, run 간 머무름 시간 정렬, 묶기. 도구: [XCMS](https://bioconductor.org/packages/xcms/)(R), [mzmine](https://mzmine.github.io/). `mzML` → feature × 시료 강도 표.
3. 품질 필터와 보정 — blank에서도 나오는 feature, QC 시료에서 변동이 큰 feature를 제거하고, QC 시료를 기준으로 신호 drift와 배치를 보정한다. QC에서의 상대표준편차 문턱은 연구마다 다르며 근거와 권고는 [Broadhurst 2018](https://doi.org/10.1007/s11306-018-1367-3)을 본다.
4. 정규화·변환·통계 — 시료량 보정(예: 조직 무게, 소변의 희석 정도), log 변환, feature별 검정 + 다중검정 보정. 웹 도구로는 [MetaboAnalyst](https://www.metaboanalyst.ca/).
5. annotation — m/z·MS2 스펙트럼을 DB([HMDB](https://hmdb.ca/) 등)와 맞추고, 중요한 것은 표준물질로 확인한다. 신뢰 수준을 함께 보고한다([Sumner 2007](https://doi.org/10.1007/s11306-007-0082-2)).

**대표 함정**

- **DB 검색으로 붙인 이름을 확인된 대사물처럼 쓴다.** → 같은 질량의 이성질체가 많고, 지질은 총 탄소 수·이중결합 수만 알고 구조는 모르는 경우가 흔하다 → 표준물질로 확인한 것과 추정한 것을 표에서 구분하고, 추정 수준의 이름으로 경로 해석을 길게 쓰지 않는다.
- **채취 조건과 run 순서를 통제하지 않는다.** → 공복 여부, 채취 시각, 약물, 용혈, 보관 시간·동결 해동 횟수가 대사물을 크게 바꾸고, 기기 신호는 run 동안 흐른다 → 채취 조건을 메타데이터로 기록·보정하고, QC 시료 없이 측정한 untargeted 자료의 미세한 군 차이는 믿지 않는다.

### 4. microbiome (16S, shotgun metagenomics)

**무엇을 재나:** 16S는 세균·고세균의 16S rRNA 유전자 일부 구간을 증폭해 읽은 서열의 구성, shotgun은 시료 안 모든 DNA를 무작위로 읽은 것. 둘 다 결과는 **상대** 풍부도다.

1. QC — `FASTQ` 품질 확인, primer·adapter 제거. shotgun은 숙주(사람, 마우스) read를 제거한다.
2. 단위 만들기 — 16S: [DADA2](https://benjjneb.github.io/dada2/)로 오류를 제거해 ASV 표를 만든다([QIIME 2](https://qiime2.org/) 안에서도 실행, 전체 파이프라인은 [nf-core/ampliseq](https://nf-co.re/ampliseq)). shotgun: [MetaPhlAn](https://github.com/biobakery/MetaPhlAn), [Kraken 2](https://github.com/DerrickWood/kraken2) 등으로 분류군별 풍부도를 추정한다.
3. 분류 — 16S ASV를 참조 DB([SILVA](https://www.arb-silva.de/) 등)와 맞춰 분류군 이름을 붙인다. DB 이름과 버전을 기록한다.
4. 다양성 — 한 시료 안의 다양성(alpha)과 시료 사이의 거리(beta). 시료 간 read 깊이 차이를 어떻게 처리했는지(희석 추출, 변환 등) 밝힌다.
5. 차등 풍부도 — 구성 자료임을 고려한 방법을 쓰고, 방법을 바꿔도 결과가 유지되는지 본다.

**대표 함정**

- **상대 풍부도를 절대량처럼 해석한다.** → 한 분류군이 크게 늘면 다른 분류군은 그대로여도 비율이 줄어 "감소"로 나온다. 비율끼리의 상관에는 가짜 음의 상관이 생긴다 → 구성 자료용 변환·방법을 쓰고, "줄었다"가 아니라 "상대 비율이 줄었다"고 쓴다([Gloor 2017](https://doi.org/10.3389/fmicb.2017.02224)).
- **음성 대조 없이 미생물이 적은 시료를 분석한다.** → 추출 시약과 실험실 환경에서 온 DNA가 결과의 대부분을 차지할 수 있다 → 추출 blank와 PCR 음성 대조를 같은 배치에서 함께 읽고, 대조에서 나온 분류군을 확인한다([Salter 2014](https://doi.org/10.1186/s12915-014-0087-z)).

### 5. multi-omics 통합

**먼저 구분할 것: 같은 시료인가, 다른 연구인가**

| | 같은 시료에서 얻은 여러 층 (matched) | 서로 다른 연구의 결과를 연결 (unmatched) |
|---|---|---|
| 예 | 같은 환자의 같은 조직에서 RNA-seq과 단백질체를 측정 | 마우스 뇌 발현 연구와 사람 혈장 단백질체 연구 |
| 짝 | 행(시료)이 층마다 같은 개체 | 짝이 없다 |
| 할 수 있는 것 | 층간 상관, 공통 요인 찾기, 여러 층을 쓰는 예측 모형 | 유전자·경로 수준에서 "방향이 일치하는가"를 표로 비교, 문헌 기반 가설 |
| 할 수 없는 것 | (설계 없이) 층 사이의 인과 방향 | 두 자료의 숫자를 한 계산(상관, 한 모형, p-value 결합)에 넣는 것 |
| 결론의 형태 | "이 코호트에서 A층과 B층이 함께 변했다" | "~라는 가설을 제안한다" |

**합치지 않는 원칙:** 종(마우스와 사람), 조직(뇌와 혈액), 측정 단위(count, 강도, 비율)가 다른 자료는 통계적으로 합치지 않는다. 숫자를 나란히 놓으려면 "같은 행 = 같은 개체"라는 짝이 있어야 하고, 종이 다르면 유전자 대응(ortholog)부터 일대일이 아니다. 연결은 각 자료를 따로 분석한 **결과**(어떤 경로가 어느 방향으로)의 수준에서, 출판된 문헌을 다리로 삼아 한다.

**같은 시료일 때의 흐름**

1. 층별 전처리와 QC — 각 층을 그 분야의 표준 흐름대로 따로 처리한다. 통합은 층별 QC를 대신하지 못한다.
2. 시료 정합성 — 시료 ID를 이름으로 맞추고, 층마다 빠진 시료를 표로 만든다(아래 예시). 모든 층이 있는 시료만 쓰면 n이 얼마나 줄어드는지 확인한다.
3. 변수 대응 — 층 사이의 ID(유전자 이름, 단백질 accession, CpG–유전자, 대사물–효소)를 어떤 규칙으로 이었는지 기록한다. 일대다 대응의 처리 방법을 정한다.
4. 통합 방식 선택 — 아래 표.
5. 검증 — 독립 코호트나 남겨 둔 시료로 확인한다. 통합 결과를 층별 분석 결과와 나란히 놓고, 통합에서만 보이는 신호는 더 의심한다.

**초기 / 중간 / 후기 통합**

| 방식 | 발상 | 장점 | 주의 |
|---|---|---|---|
| 초기 (early) | 모든 층의 변수를 옆으로 이어 붙여 한 표로 만들고 한 번에 분석 | 단순하다 | 변수가 가장 많은 층·분산이 큰 층이 결과를 지배한다. 층마다 척도와 결측 양상이 다르다. p가 가장 커진다. |
| 중간 (intermediate) | 층별 구조를 유지한 채 여러 층이 공유하는 소수의 요인(잠재 변수)을 함께 추정 | 층 사이의 공통 변동과 층 고유의 변동을 나눠 본다 | 요인의 의미는 사후 해석이다. 배치가 요인으로 잡히는 일이 흔하다. 도구 예: [MOFA](https://biofam.github.io/MOFA2/), [mixOmics](http://mixomics.org/). |
| 후기 (late) | 층마다 따로 분석한 뒤 결과(유의 목록, 경로, 예측값)를 합침 | 층별 분석이 투명하고 층마다 적합한 방법을 쓸 수 있다. 시료가 완전히 겹치지 않아도 된다. | 층 사이의 상호 관계는 직접 모형화하지 않는다. 층마다 검정력이 달라 "겹치지 않음"을 "불일치"로 읽기 쉽다. |

처음이라면 후기 통합으로 시작한다. 층별 결과가 이해된 뒤에 중간 통합으로 넘어간다.

**p ≫ n 문제:** 시료 30개에 유전자 2만 개, 단백질 5천 개, CpG 수십만 개를 더하면 변수는 늘지만 시료는 30개 그대로다. 변수가 많을수록 우연히 군을 가르는 조합이 반드시 존재한다. 대응: 변수 수를 분석 전에 줄이고(분산 필터, 경로 단위 요약), 변수 선택을 포함한 **모든** 단계를 교차검증 안에서 수행하며, 최종 확인은 독립 자료로 한다.

## 최소 실행 예시

가상의 두 층(같은 시료의 전사체와 단백질체)으로 통합 흐름의 2단계(시료 정합성)와 가장 단순한 층간 분석(유전자별 상관)을 본다. 데이터는 가상이며 생물학적 의미가 없다.

```python
import numpy as np, pandas as pd
from scipy import stats

rng = np.random.default_rng(7)
n_gene, n_samp = 200, 20
genes = [f"G{i:03d}" for i in range(n_gene)]
ids = [f"S{i:02d}" for i in range(1, n_samp + 1)]

# 가상 데이터: 유전자마다 "mRNA가 단백질을 얼마나 따라가는가"(rho)가 다르다
rho = rng.uniform(-0.1, 0.9, n_gene)
z = rng.normal(size=(n_gene, n_samp))
rna = pd.DataFrame(z, index=genes, columns=ids)
prot = pd.DataFrame(rho[:, None] * z + np.sqrt(1 - rho[:, None] ** 2) * rng.normal(size=z.shape),
                    index=genes, columns=ids)

# 현실처럼 어긋나게 만든다: 단백질 표는 열 순서가 다르고, S07이 빠졌고, RNA에 없는 S21이 있다
order = rng.permutation(ids).tolist()
order.remove("S07")
prot = prot[order].assign(S21=rng.normal(size=n_gene))
prot = prot.iloc[rng.permutation(n_gene)[:150]]      # 단백질은 150개만 정량되었다

# 1) 시료 ID 정합성 확인: 순서가 아니라 이름으로
print("RNA 시료 수:", rna.shape[1], "/ 단백질 시료 수:", prot.shape[1])
print("ID 중복:", rna.columns.duplicated().any(), prot.columns.duplicated().any())
print("RNA에만 있는 시료:", sorted(set(rna.columns) - set(prot.columns)))
print("단백질에만 있는 시료:", sorted(set(prot.columns) - set(rna.columns)))
print("열 순서가 같은가:", list(rna.columns[:5]), "vs", list(prot.columns[:5]))

# 2) 공통 시료·공통 유전자만, 같은 순서로 맞춘다
common_s = sorted(set(rna.columns) & set(prot.columns))
common_g = sorted(set(rna.index) & set(prot.index))
R, P = rna.loc[common_g, common_s], prot.loc[common_g, common_s]
assert (R.columns == P.columns).all() and (R.index == P.index).all()
print(f"\n맞춘 뒤: 유전자 {len(common_g)}개 × 시료 {len(common_s)}개  (변수 수 / 시료 수 = {len(common_g) / len(common_s):.1f})")

# 3) 유전자별 층간 상관 (Spearman): 한 유전자의 mRNA와 단백질이 시료에 걸쳐 함께 움직이는가
r = pd.Series([stats.spearmanr(R.loc[g], P.loc[g])[0] for g in common_g], index=common_g)
print("유전자별 mRNA–단백질 상관 요약:")
print(r.describe()[["min", "25%", "50%", "75%", "max"]].round(2).to_string())
print(f"상관 > 0.5: {(r > 0.5).sum()}개,  상관 < 0.2: {(r < 0.2).sum()}개")

# 4) 순서만 믿고 붙이면: 이름을 무시하고 위치로 짝지은 경우
k = len(common_s)
r_bad = pd.Series([stats.spearmanr(rna.loc[g].to_numpy()[:k], prot.loc[g].to_numpy()[:k])[0] for g in common_g])
print(f"\n위치로 짝지었을 때 상관 중앙값: {r_bad.median():.2f}   (이름으로 맞췄을 때: {r.median():.2f})")
```

출력:

```text
RNA 시료 수: 20 / 단백질 시료 수: 20
ID 중복: False False
RNA에만 있는 시료: ['S07']
단백질에만 있는 시료: ['S21']
열 순서가 같은가: ['S01', 'S02', 'S03', 'S04', 'S05'] vs ['S19', 'S18', 'S17', 'S20', 'S14']

맞춘 뒤: 유전자 150개 × 시료 19개  (변수 수 / 시료 수 = 7.9)
유전자별 mRNA–단백질 상관 요약:
min   -0.51
25%    0.17
50%    0.39
75%    0.69
max    0.92
상관 > 0.5: 59개,  상관 < 0.2: 42개

위치로 짝지었을 때 상관 중앙값: -0.00   (이름으로 맞췄을 때: 0.39)
```

읽는 법:

- 두 표 모두 시료가 20개지만 같은 20개가 아니다. **개수가 같다는 것은 아무것도 보장하지 않는다.** 집합 차이와 순서를 직접 확인해야 한다.
- 위치로 짝지으면 오류 메시지 없이 상관이 0 근처로 사라진다. 실제 분석에서는 이것이 "두 층은 관련이 없다"는 잘못된 결론이 된다.
- 유전자별 상관은 −0.51부터 0.92까지 넓게 퍼진다(여기서는 그렇게 만들었다). 시료 19개로 계산한 상관은 불확실성이 크므로 개별 유전자의 값보다 분포 전체를 읽는다.
- 이것은 **유전자별, 시료에 걸친** 상관이다. "한 시료 안에서 유전자들에 걸친" 상관과는 다른 질문이고 값도 다르게 나온다. 논문이 어느 쪽을 보고했는지 확인한다.
- 맞춘 뒤에도 변수가 시료의 약 8배다. 여기에 층을 더하면 비율은 더 나빠진다.

## 흔한 함정

1. **짝이 없는 자료를 한 계산에 넣는다.** 서로 다른 코호트·종·조직의 값을 상관시키거나 한 모형에 넣는다 → 짝이 없으면 어떤 숫자가 나와도 의미가 없다 → 결과 수준(경로, 방향)에서 표로 비교하고 문헌 기반 가설로 쓴다.
2. **시료 ID를 확인하지 않고 붙인다.** → 위 예시처럼 오류 없이 틀린다. 시료 뒤바뀜은 통합에서 처음 드러나는 경우가 많다 → 이름으로 맞추고, 층마다 독립적으로 확인할 수 있는 정보(성별 관련 유전자, 유전형)로 동일 개체인지 점검한다.
3. **층별 QC를 건너뛰고 통합부터 한다.** → 한 층의 배치 효과가 "여러 층에 걸친 요인"으로 나타난다 → 층마다 PCA와 배치 점검을 끝낸 뒤 통합하고, 통합 요인을 배치 변수와 대조한다.
4. **변수 선택을 교차검증 밖에서 한다.** 전체 자료에서 군 차이가 큰 변수를 고른 뒤 예측 성능을 평가한다 → 정답이 변수 선택에 새어 들어가 성능이 부풀려진다 → 선택·정규화·대체를 모두 학습 fold 안에서 한다.
5. **층이 일치하지 않으면 한쪽이 틀렸다고 본다.** → mRNA와 단백질, 메틸화와 발현은 시간차와 전사 후 조절 때문에 원래 완전히 일치하지 않는다 → 불일치를 기록하고, 검정력 차이(한 층에서 유의하지 않음 ≠ 변화 없음)와 실제 생물학적 차이를 구분한다.
6. **모든 층이 있는 시료만 남겨 n이 크게 준다.** → 남은 시료가 원래 코호트를 대표하지 않을 수 있다 → 층별 가용 시료 표를 먼저 만들고, 후기 통합이나 결측 층을 허용하는 방법을 검토한다.
7. **척도가 다른 층을 그대로 이어 붙인다.** → 변수 수가 많거나 분산이 큰 층이 결과를 차지한다 → 층별로 변환·표준화하고 층의 크기를 고려하는 방법을 쓴다.
8. **연관을 조절 관계로 쓴다.** "메틸화가 발현을 억제했다", "장내 세균이 대사물을 바꿨다" → 한 시점의 관찰 자료는 방향을 말해 주지 않는다 → "함께 변했다"로 쓰고, 방향은 시간 순서가 있는 설계나 실험으로 확인할 가설로 남긴다.

## 연구 설계 체크리스트

- [ ] 질문을 한 문장으로 적었고, 그 질문이 어느 층에서 답해지는지(위 "측정 기술 고르기" 표) 정했다. 층을 더하는 이유가 "가능해서"가 아니다.
- [ ] 여러 층이 같은 개체·같은 조직·같은 시점의 시료에서 나왔는지 확인했다. 아니라면 통계적으로 합치지 않기로 했다.
- [ ] 층별 가용 시료 표(시료 × 층)를 만들었고, 모든 층이 있는 시료 수를 안다.
- [ ] 생물학적 반복 수가 층마다 충분한지, 가장 약한 층이 어디인지 적었다.
- [ ] 층마다 배치 변수(추출 날짜, run 순서, array 위치, sequencing lane)를 기록했고 조건과 겹치지 않는다.
- [ ] 분야별 필수 대조가 있다: ChIP-seq의 input, 대사체의 pooled QC와 blank, microbiome의 추출·PCR 음성 대조, bisulfite 전환 대조.
- [ ] 공변량을 수집했다: 나이, 성별, 조직의 세포 구성, 대사체라면 공복·채취 시각·약물, microbiome이라면 식이·항생제.
- [ ] 층 사이의 ID 대응 규칙과 참조 DB·유전체 버전을 기록했다.
- [ ] 통합 방식(초기/중간/후기)과 다중검정 보정 방법을 결과를 보기 전에 정했다.
- [ ] 독립 검증 자료 또는 남겨 둘 시료를 정했고, 검증 전 결과는 탐색적이라고 쓸 것이다.

## 공개 데이터와 더 볼 곳

**공개 저장소**

| 이름 | URL | 무엇이 있나 |
|---|---|---|
| GEO | <https://www.ncbi.nlm.nih.gov/geo/> | 메틸화 array, ChIP-seq, ATAC-seq 등 기능유전체 자료의 처리된 표와 메타데이터 |
| SRA / ENA | <https://www.ncbi.nlm.nih.gov/sra> · <https://www.ebi.ac.uk/ena/browser/home> | sequencing 원자료(FASTQ). 16S, shotgun 포함 |
| ENCODE | <https://www.encodeproject.org/> | 표준화된 ChIP-seq·ATAC-seq 자료와 자료 표준·파이프라인 문서 |
| MetaboLights | <https://www.ebi.ac.uk/metabolights/> | 대사체 연구의 원자료와 메타데이터 |
| Metabolomics Workbench | <https://www.metabolomicsworkbench.org/> | 대사체 자료 저장소와 분석 도구 |
| HMDB | <https://hmdb.ca/> | 사람 대사물의 구조·스펙트럼·농도 정보 |
| MGnify | <https://www.ebi.ac.uk/metagenomics> | microbiome 자료와 표준 파이프라인으로 처리한 결과 |
| AD Knowledge Portal | <https://adknowledgeportal.synapse.org/> | 알츠하이머병 관련 코호트의 여러 omics. 일부 자료는 이용 승인이 필요하다. |

**공식 문서·튜토리얼**

- Galaxy Training: [Epigenetics](https://training.galaxyproject.org/training-material/topics/epigenetics/) · [Metabolomics](https://training.galaxyproject.org/training-material/topics/metabolomics/) · [Microbiome](https://training.galaxyproject.org/training-material/topics/microbiome/) — 설치 없이 따라 하는 실습.
- [QIIME 2 문서](https://docs.qiime2.org/), [DADA2 튜토리얼](https://benjjneb.github.io/dada2/) — 16S 분석.
- [EMBL-EBI Training — Metabolomics: an introduction](https://www.ebi.ac.uk/training/online/courses/metabolomics-introduction/) — 무료 온라인 입문 과정.
- [MOFA2](https://biofam.github.io/MOFA2/), [mixOmics](http://mixomics.org/), [MultiAssayExperiment](https://bioconductor.org/packages/MultiAssayExperiment/)(여러 층과 시료 대응표를 한 객체로 관리하는 R 패키지).

**핵심 논문** (Crossref로 서지 확인)

- multi-omics 개관: Hasin Y, Seldin M, Lusis A. Multi-omics approaches to disease. *Genome Biol* 2017;18:83. [doi:10.1186/s13059-017-1215-1](https://doi.org/10.1186/s13059-017-1215-1)
- 통합 방법 분류: Ritchie MD 외. Methods of integrating data to uncover genotype–phenotype interactions. *Nat Rev Genet* 2015;16:85–97. [doi:10.1038/nrg3868](https://doi.org/10.1038/nrg3868)
- 중간 통합의 예: Argelaguet R 외. Multi-Omics Factor Analysis—a framework for unsupervised integration of multi-omics data sets. *Mol Syst Biol* 2018;14. [doi:10.15252/msb.20178124](https://doi.org/10.15252/msb.20178124)
- 메틸화와 세포 구성: Jaffe AE, Irizarry RA. Accounting for cellular heterogeneity is critical in epigenome-wide association studies. *Genome Biol* 2014;15:R31. [doi:10.1186/gb-2014-15-2-r31](https://doi.org/10.1186/gb-2014-15-2-r31)
- ChIP-seq 기준: Landt SG 외. ChIP-seq guidelines and practices of the ENCODE and modENCODE consortia. *Genome Res* 2012;22:1813–1831. [doi:10.1101/gr.136184.111](https://doi.org/10.1101/gr.136184.111)
- ATAC-seq 원논문: Buenrostro JD 외. Transposition of native chromatin for fast and sensitive epigenomic profiling of open chromatin, DNA-binding proteins and nucleosome position. *Nat Methods* 2013;10:1213–1218. [doi:10.1038/nmeth.2688](https://doi.org/10.1038/nmeth.2688)
- 대사물 annotation 수준: Sumner LW 외. Proposed minimum reporting standards for chemical analysis. *Metabolomics* 2007;3:211–221. [doi:10.1007/s11306-007-0082-2](https://doi.org/10.1007/s11306-007-0082-2)
- 대사체 QC 시료: Broadhurst D 외. Guidelines and considerations for the use of system suitability and quality control samples in mass spectrometry assays applied in untargeted clinical metabolomic studies. *Metabolomics* 2018;14:72. [doi:10.1007/s11306-018-1367-3](https://doi.org/10.1007/s11306-018-1367-3)
- microbiome의 구성 자료 문제: Gloor GB 외. Microbiome datasets are compositional: and this is not optional. *Front Microbiol* 2017;8:2224. [doi:10.3389/fmicb.2017.02224](https://doi.org/10.3389/fmicb.2017.02224)
- 시약 오염: Salter SJ 외. Reagent and laboratory contamination can critically impact sequence-based microbiome analyses. *BMC Biol* 2014;12:87. [doi:10.1186/s12915-014-0087-z](https://doi.org/10.1186/s12915-014-0087-z)
- DADA2: Callahan BJ 외. DADA2: High-resolution sample inference from Illumina amplicon data. *Nat Methods* 2016;13:581–583. [doi:10.1038/nmeth.3869](https://doi.org/10.1038/nmeth.3869)

## 본 과정과의 연결

본 과정의 6주차는 "마우스 뇌 분자 자료와 사람 운동 자료"라는 unmatched 통합의 실제 사례다. 이 가이드의 통합 원칙은 그 주에서 가장 자세히 다룬다.

| 이 가이드의 부분 | 자세히 다루는 레슨 | 연결점 |
|---|---|---|
| 합치지 않는 원칙, 다섯 가지 비교 축 | [Day 36](../lessons/week-6/day-36.md) | 종·재료·측정 단위·설계·outcome이 다를 때 "통계적으로 결합하지 않는다"의 뜻, 짝 없는 자료를 억지로 짝지은 실험 |
| 문헌 수준에서 연결하기 | [Day 37](../lessons/week-6/day-37.md) | 관찰·문헌·추측의 세 층으로 가설 쓰기 |
| 종 사이의 유전자 대응 | [Day S2](../lessons/supplement/day-S2.md) | ortholog와 paralog |
| 시료 ID 정합성 | [Day 16](../lessons/week-3/day-16.md), [Day 4](../lessons/week-1/day-04.md) | 순서로 붙이면 조용히 틀린다, 메타데이터 점검 |
| 배치, 교란, 대조군 | [Day 11](../lessons/week-2/day-11.md), [Day 31](../lessons/week-5/day-31.md) | 조건 × 배치 교차표, 공변량 보정 |
| 변환과 정규화, 층별 QC | [Day 13](../lessons/week-2/day-13.md), [Day 14](../lessons/week-2/day-14.md) | log 변환의 이유, PCA로 배치 찾기 |
| 다중검정 | [Day 10](../lessons/week-2/day-10.md) | 변수가 많을수록 우연한 발견이 는다 |
| p ≫ n과 검증 | [Day 33](../lessons/week-5/day-33.md) | 데이터 누수, 선택 단계를 검증 안에 넣기 |
| FASTQ와 count 행렬 | [Day 6](../lessons/week-1/day-06.md) | sequencing 기반 omics의 공통 파일 형식 |
| 경로 수준 해석 | [Day 20](../lessons/week-3/day-20.md) | 배경 집합 고르기 |
| 방법을 바꿔도 결론이 유지되는가 | [Day 39](../lessons/week-6/day-39.md) | 민감도 분석 |

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
