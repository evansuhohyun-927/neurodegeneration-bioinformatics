# Day 12 — OSD-536 study record 읽기: 데이터를 열기 전에 설계부터

> **주차:** 2주차 · **예상 시간:** 75–90분 · **산출물:** `osdr-536-data-dictionary.md`

## 오늘의 목표
- OSDR study record에서 조직, 조건, assay, 표본 수를 찾아 읽을 수 있다.
- 샘플 메타데이터 표의 열을 "개체 특성 / 실험 요인 / 처리 조건"으로 구분할 수 있다.
- 확인한 사실과 확인하지 못한 사실을 구분해 데이터 사전(data dictionary)으로 정리할 수 있다.

## 🎬 영상으로 먼저 보기

오늘 주제에 딱 맞으면서 링크를 확인할 수 있었던 영상은 찾지 못했습니다. 아래 두 개는 **검색 링크**입니다. 각 검색 결과에서 NASA 또는 장비 제조사 공식 채널의 5–15분짜리 영상을 하나씩 골라 보세요.

- [YouTube 검색 — "NASA Open Science Data Repository OSDR tutorial"](https://www.youtube.com/results?search_query=NASA+Open+Science+Data+Repository+OSDR+tutorial) (검색 링크)
- **무엇에 주목할까:** OSDR이 어떤 종류의 데이터를 모아 두는 곳인지, study 페이지가 어떤 탭(설명, 샘플, assay, 파일 등)으로 나뉘는지만 파악하면 됩니다. 화면 구성은 시기에 따라 바뀔 수 있으니 세부 메뉴 위치보다 "무엇을 찾을 수 있는가"에 집중하세요.

- [YouTube 검색 — "NanoString nCounter technology how it works"](https://www.youtube.com/results?search_query=NanoString+nCounter+technology+how+it+works) (검색 링크)
- **무엇에 주목할까:** nCounter는 RNA를 증폭하거나 서열을 읽지 않고, 미리 정해 둔 유전자 목록(패널)에 색 바코드 탐침을 붙여 분자 수를 **센다**는 점을 보세요. 그래서 결과가 "유전자별 count"로 나오고, 패널에 없는 유전자는 아예 측정되지 않습니다.

## 개념 설명

### study record는 논문의 Methods를 표로 만든 것

요리 블로그의 완성 사진만 보고는 그 음식을 다시 만들 수 없습니다. 재료 목록과 조리 순서가 있어야 합니다. 발현 행렬이 완성 사진이라면 **study record**는 레시피입니다. 어떤 동물을, 몇 마리, 어떤 조건에 두었고, 어느 조직을, 어떤 방법으로 측정했는지가 적혀 있습니다.

OSDR의 메타데이터는 **ISA** 형식을 따릅니다. 세 층으로 되어 있습니다.

- **Investigation(조사)**: 연구 전체의 제목, 설명, 논문, 프로토콜 글.
- **Study(연구)**: 샘플 표. 한 행이 한 샘플이고, 열은 그 샘플의 특성과 처리 조건입니다.
- **Assay(측정)**: 각 샘플을 어떤 장비로 측정했고 어떤 데이터 파일이 나왔는지.

오늘 내려받을 ISA 압축 파일 안에 이 세 층이 각각 `i_`, `s_`, `a_`로 시작하는 텍스트 파일로 들어 있습니다.

### 샘플 표의 열은 세 종류다

ISA 샘플 표의 열 이름에는 규칙이 있습니다. Day 11에서 배운 설계 개념과 바로 연결됩니다.

- **`Characteristics[...]`** : 개체나 시료가 원래 가진 특성(종, 계통, 성별, 나이, 조직).
- **`Factor Value[...]`** : 연구자가 비교하려는 **실험 요인**. 설계식의 `condition`에 해당하는 열입니다.
- **`Parameter Value[...]`** : 프로토콜을 수행할 때의 조건(사육 온도, 조명 주기, 보존 방법 등).

읽는 요령은 간단합니다. Factor Value 열은 **그룹마다 값이 달라야** 하고, 나머지 열은 **모든 샘플에서 값이 같을수록** 좋습니다. Factor Value가 아닌 열인데 그룹에 따라 값이 다르다면, 그것은 비교하려는 요인과 함께 움직이는 다른 차이, 즉 교란 후보입니다.

### 이 레슨이 확인한 OSD-536의 사실 (2026-11-12 조회)

아래는 OSDR 공개 API와 ISA 메타데이터 파일에서 직접 확인한 내용입니다. 데이터베이스는 갱신될 수 있으므로, 실습에서 여러분이 다시 확인합니다.

- **제목**: Gene expression profiling for spaceflight induced-neuroinflammation in the mouse brain. 식별자 OSD-536(GLDS-536), GEO 원 자료 GSE186278.
- **동물**: *Mus musculus*, C57BL/6J, 수컷, 10주령, Jackson Laboratory.
- **임무**: Rodent Research-9(RR-9), SpaceX-12, 2017-08-14 ~ 2017-09-16, ISS Rodent Habitat, 35일.
- **실험 요인**: `Factor Value[Spaceflight]` 하나. 값은 `Space Flight`와 `Ground Control`, 각 6개 샘플, 합계 12개.
- **조직**: 메타데이터 열에는 `Brain`. study 설명에는 더 구체적으로 "right caudal half hemispheres containing mid- and hindbrain"(중뇌·후뇌를 포함한 오른쪽 뒤쪽 반구 절반)이라고 적혀 있습니다.
- **assay**: transcription profiling, 플랫폼 nCounter MAX. NanoString nCounter Neuroinflammation 패널이며 study 설명은 757개 유전자라고 밝힙니다.
- **파일**: 13개. ISA 메타데이터 zip 1개와 샘플별 원시 파일 `.RCC.gz` 12개. 파일 목록 API에는 정규화된 발현 표나 차등발현 결과 표가 **없습니다.**
- **논문**: Holley JM 외, "Characterization of gene expression profiles in the mouse brain after 35 days of spaceflight mission." DOI 10.1038/s41526-022-00217-4.

### 읽으면서 발견한 "질문거리"

study record를 꼼꼼히 읽으면 답보다 질문이 먼저 나옵니다. 이것이 정상이고, 데이터 사전의 "한계와 미확인" 칸에 적을 내용입니다.

1. **표본 수 서술이 두 가지입니다.** study 설명은 "n equals 6 per group", sample collection 프로토콜은 "n equals 5–6 per group"이라고 씁니다. 샘플 표에는 그룹당 6개가 있습니다. 왜 다른지는 메타데이터만으로는 알 수 없습니다.
2. **기술 유형이 "DNA microarray"로 분류되어 있습니다.** 실제 플랫폼은 NanoString nCounter로, 마이크로어레이와도 RNA-seq과도 다른 방식입니다. 데이터베이스의 분류 칸이 실제 기술과 정확히 맞지 않을 수 있다는 예입니다.
3. **"54개 유전자가 차등발현(p less than 0.05)"** 이라고만 쓰여 있습니다. Day 10에서 배웠듯이 이 p가 다중검정 보정값인지 여부는 이 문장만으로 알 수 없습니다.
4. **대조군이 비행군과 무엇이 다른가.** 프로토콜에 따르면 지상 대조군은 비행군의 환경 기록(온도, 습도, CO2)을 48시간 늦게 따라가며 비슷하게 맞췄습니다. 반면 방사선 열은 비행군에만 값이 있습니다(흡수선량 8.295 milligray). 발사·귀환 과정도 대조군에는 없습니다. 따라서 관찰된 차이는 "미세중력"이 아니라 **"우주비행 환경 전체"** 의 효과로 읽어야 합니다.
5. **표본이 12개뿐이고 패널에 든 유전자만 측정했습니다.** 실라부스의 표현대로, 이 데이터의 결과는 가설 생성용입니다. 이 마우스 뇌 결과를 사람의 파킨슨병 운동 데이터와 직접 잇거나 인과로 연결하지 않습니다.

## 예시로 이해하기

오늘의 예시는 인터넷 연결이 필요합니다. 모든 출력은 2026-11-12에 실제로 실행해 얻은 것입니다.

### 예시 1 — API로 파일 목록 확인하기

```python
import json
import urllib.request

url = "https://osdr.nasa.gov/osdr/data/osd/files/536"
with urllib.request.urlopen(url, timeout=60) as r:
    data = json.load(r)

study = data["studies"]["OSD-536"]
print("파일 수:", study["file_count"])
for f in study["study_files"]:
    print(f["category"], "|", f["file_name"], "|", f["file_size"], "bytes")
```

출력:

```text
파일 수: 13
Study Metadata Files | OSD-536_metadata_OSD-536-ISA.zip | 32495 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643024_G14_RR9_B_06.RCC.gz | 9116 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643023_G13_RR9_B_05.RCC.gz | 9175 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643022_G12_RR9_B_04.RCC.gz | 9056 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643021_G10_RR9_B_03.RCC.gz | 9095 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643020_G9_RR9_B_02.RCC.gz | 9018 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643019_G8_RR9_B_01.RCC.gz | 9011 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643018_F14_RR9_B_12.RCC.gz | 8805 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643017_F13_RR9_B_11.RCC.gz | 8780 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643016_F12_RR9_B_10.RCC.gz | 8905 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643015_F10_RR9_B_09.RCC.gz | 8629 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643014_F9_RR9_B_08.RCC.gz | 8845 bytes
Microarray Data Files | GLDS-536_microarray_GSM5643013_F8_RR9_B_07.RCC.gz | 8953 bytes
```

파일 하나가 9 KB 정도로 아주 작습니다. 유전자 수백 개의 count만 담고 있기 때문입니다. 파일 이름에 `F`/`G`와 번호가 들어 있다는 것도 눈여겨보세요.

### 예시 2 — ISA 메타데이터에서 샘플 표 읽기

```python
import io
import zipfile
import urllib.request
import pandas as pd

isa_url = ("https://osdr.nasa.gov/geode-py/ws/studies/OSD-536/download"
           "?source=datamanager&file=OSD-536_metadata_OSD-536-ISA.zip")
with urllib.request.urlopen(isa_url, timeout=60) as r:
    z = zipfile.ZipFile(io.BytesIO(r.read()))

print(z.namelist())                                   # zip 안에 든 파일 이름
sample_file = [n for n in z.namelist() if n.startswith("s_")][0]
samples = pd.read_csv(z.open(sample_file), sep="\t")

print(samples.shape)
print(samples[["Source Name", "Sample Name", "Factor Value[Spaceflight]"]])
print(samples["Factor Value[Spaceflight]"].value_counts())
```

출력:

```text
['a_OSD-536_transcription-profiling_dna-microarray_ncounter max.txt', 's_OSD-536.txt', 'i_Investigation.txt']
(12, 71)
   Source Name Sample Name Factor Value[Spaceflight]
0           F8  GSM5643013              Space Flight
1           F9  GSM5643014              Space Flight
2          F10  GSM5643015              Space Flight
3          F12  GSM5643016              Space Flight
4          F13  GSM5643017              Space Flight
5          F14  GSM5643018              Space Flight
6          GC8  GSM5643019            Ground Control
7          GC9  GSM5643020            Ground Control
8         GC10  GSM5643021            Ground Control
9         GC12  GSM5643022            Ground Control
10        GC13  GSM5643023            Ground Control
11        GC14  GSM5643024            Ground Control
Factor Value[Spaceflight]
Space Flight      6
Ground Control    6
Name: count, dtype: int64
```

샘플 12개, 열 71개입니다. `Source Name`은 동물 ID(F8, GC8…), `Sample Name`은 GEO 샘플 번호입니다. 예시 1의 파일 이름에는 두 ID가 함께 들어 있어서(`GSM5643013_F8_...`) 파일과 샘플을 연결할 수 있습니다. 대조군은 샘플 표에서는 `GC8`, 파일 이름에서는 `G8`로 표기가 조금 다릅니다. 이런 차이가 3주차에 샘플과 행렬을 연결할 때 오류의 원인이 됩니다.

### 예시 3 — 열을 세 종류로 나누고 값의 종류 보기

예시 2를 실행한 같은 노트북에서 이어서 실행합니다.

```python
keep = [c for c in samples.columns
        if c.startswith(("Characteristics", "Factor Value", "Parameter Value"))]

for c in keep:
    values = samples[c].astype(str).str.strip().unique()
    print(f"{c}: {list(values)}")
```

출력:

```text
Characteristics[Organism]: ['Mus musculus']
Characteristics[Strain]: ['C57BL/6J']
Characteristics[Animal Source]: ['Jackson Laboratory']
Characteristics[age]: ['10']
Characteristics[Sex]: ['Male']
Characteristics[diet]: ['Nutrient Upgraded Rodent Food Bar (NuRFB)']
Characteristics[Material Type]: ['Brain']
Factor Value[Spaceflight]: ['Space Flight', 'Ground Control']
Parameter Value[habitat]: ['Rodent Habitat']
Parameter Value[Enrichment material]: ['Hut']
Parameter Value[duration]: ['35']
Parameter Value[Light Cycle]: ['12-h light/dark cycle']
Parameter Value[Housing Temperature]: ['26-28']
Parameter Value[Euthanasia Method]: ['Carbon Dioxide']
Parameter Value[Sample Preservation Method]: ['Liquid Nitrogen']
Parameter Value[Sample Storage Temperature]: ['-80']
Parameter Value[ionizing radiation]: ['space radiation', 'non-irradiated']
Parameter Value[absorbed radiation dose]: ['8.295', 'nan']
Parameter Value[absorbed radiation dose rate]: ['0.237', 'nan']
Parameter Value[exposure duration]: ['35.0', 'nan']
Parameter Value[ionizing radiation categorized by source]: ['outer space', 'Not Applicable']
Parameter Value[vehicle]: ['ISS-US Laboratory', 'Not Applicable']
```

값이 하나뿐인 열은 모든 샘플에서 같다는 뜻입니다. 값이 둘인 열은 Factor Value와 방사선 관련 열뿐입니다(`nan`은 지상 대조군에 값이 없다는 표시). 숫자 열의 단위(week, day, degree Celsius, milligray)는 바로 옆의 `Unit` 열에 따로 들어 있습니다. 71개 열 중 나머지는 이런 `Unit` 열과 용어 출처를 적은 `Term Source REF`, `Term Accession Number` 열입니다.

## 직접 해보기

1. 브라우저에서 <https://osdr.nasa.gov/bio/repo/data/studies/OSD-536>을 엽니다. 페이지의 Description(설명)을 끝까지 읽고, 연구 목적을 한국어 두 문장으로 요약해 둡니다.
2. 페이지에서 샘플 표, assay 표, 프로토콜, 파일 목록에 해당하는 탭이나 섹션을 찾아 한 번씩 열어 봅니다. (화면 구성은 바뀔 수 있습니다. 이름이 조금 달라도 같은 내용을 찾으면 됩니다.)
3. 새 노트북 `notebooks/01_setup_and_metadata.ipynb`를 열고(1주차에 만들었다면 맨 아래에 `## Day 12 — OSD-536 메타데이터` 섹션 추가) 예시 1, 2, 3을 실행합니다. 출력이 이 레슨과 같은지 확인하고, **다르면 다른 부분과 조회 날짜를 적어 둡니다.** 다르다고 해서 여러분이 틀린 것이 아닙니다. 데이터베이스가 갱신되었을 수 있습니다.
4. 프로토콜 글을 읽습니다. 웹 페이지의 프로토콜 섹션에서 읽거나, 노트북에서 다음 코드로 Investigation 파일의 프로토콜 설명을 꺼냅니다(예시 2의 `z`를 이어서 씁니다).

   ```python
   text = z.read("i_Investigation.txt").decode("utf-8", errors="replace")
   names, descs = [], []
   for line in text.splitlines():
       if line.startswith("Study Protocol Name"):
           names = line.split("\t")[1:]          # 프로토콜 이름들이 탭으로 나뉘어 한 줄에 있다
       if line.startswith("Study Protocol Description"):
           descs = line.split("\t")[1:]

   for name, desc in zip(names, descs):
       print(f"[{name}]")
       print(desc)
       print()
   ```

   프로토콜 여섯 개(RNA Extraction, Nucleic Acid Hybridization, Data Collection, Animal Husbandry, sample collection, radiation dosimetry protocol)가 차례로 출력됩니다.

   Animal Husbandry와 sample collection 설명에서 (a) 대조군 환경을 어떻게 맞췄는지, (b) 귀환 후 얼마 만에 조직을 채취했는지, (c) 대조군은 언제 채취했는지를 찾습니다.
5. Day 11의 숙제를 마무리합니다. 조건 × 배치 교차표를 만들 수 있는지 확인합니다. 샘플 표에는 추출 날짜나 장비 lane 같은 배치 열이 보이지 않습니다. 대신 원시 `.RCC` 파일 안에 측정 정보가 들어 있습니다. 파일 목록에서 `.RCC.gz` 두세 개(F와 G 각각)를 내려받아 압축을 풀고 텍스트 편집기로 열어 보세요. 이 레슨을 만들 때 F8 파일 하나를 열어 보니 `<Header>`, `<Sample_Attributes>`, `<Lane_Attributes>`, `<Code_Summary>` 구역이 있었고, `<Lane_Attributes>`에 lane ID와 카트리지 정보가, `<Sample_Attributes>`에 날짜가 있었습니다. **나머지 11개 파일은 확인하지 않았으므로**, 비행군과 대조군이 같은 날짜·같은 카트리지에서 측정되었는지는 여러분이 직접 표로 정리합니다.
6. 프로젝트 폴더에 `osdr-536-data-dictionary.md`를 만들고 아래 틀을 붙여 넣은 뒤 채웁니다. "이 레슨이 확인한 값"은 그대로 믿지 말고 여러분의 조회 결과와 대조해 "내 확인" 칸에 ✔ 또는 다른 값을 적습니다.

   ```markdown
   # OSD-536 데이터 사전

   - 조회 날짜: 
   - 출처: https://osdr.nasa.gov/bio/repo/data/studies/OSD-536
   - 연구 목적(2문장): 

   ## 1. 연구 설계
   | 항목 | 이 레슨이 확인한 값 (2026-11-12) | 내 확인 | 근거(어느 표/파일/문장) |
   |---|---|---|---|
   | 종/계통/성별/나이 | Mus musculus / C57BL/6J / Male / 10 week | | |
   | 조직 | Brain (설명: right caudal half hemisphere, mid- and hindbrain) | | |
   | 실험 요인 | Factor Value[Spaceflight] | | |
   | 그룹과 표본 수 | Space Flight 6, Ground Control 6 | | |
   | 임무/기간 | RR-9, SpaceX-12, 35 day | | |
   | assay / 플랫폼 | transcription profiling / nCounter MAX (NanoString Neuroinflammation panel) | | |
   | 측정 유전자 수 | 757 (study 설명) | | |
   | 파일 | ISA zip 1 + RCC.gz 12 | | |
   | 관련 논문 DOI | 10.1038/s41526-022-00217-4 | | |

   ## 2. 샘플 표 주요 열
   | 열 이름 | 종류(Characteristics/Factor/Parameter) | 값의 종류 | 단위 | 그룹 간 차이 있음? |
   |---|---|---|---|---|
   | Source Name | (ID) | | | |
   | Sample Name | (ID) | | | |
   | Factor Value[Spaceflight] | | | | |
   | Parameter Value[duration] | | | | |
   | Parameter Value[Housing Temperature] | | | | |
   | Parameter Value[absorbed radiation dose] | | | | |
   | (직접 고른 열 3개 이상 추가) | | | | |

   ## 3. 샘플–파일 연결표
   | Source Name | Sample Name | 그룹 | 원시 파일 이름 | RCC 날짜 | lane ID | 카트리지 |
   |---|---|---|---|---|---|---|
   | F8 | GSM5643013 | Space Flight | GLDS-536_microarray_GSM5643013_F8_RR9_B_07.RCC.gz | | | |
   | (나머지 11개 직접 작성) | | | | | | |

   ## 4. 직접 확인해서 채울 항목 (이 레슨이 확인하지 못함)
   | 항목 | 확인 방법 | 내가 찾은 내용 |
   |---|---|---|
   | 12개 RCC 파일의 측정 날짜·lane·카트리지가 그룹과 겹치는가 | 각 RCC 파일의 Sample_Attributes, Lane_Attributes | |
   | RCC 파일의 탐침 종류(CodeClass)별 개수 | RCC 파일의 Code_Summary 구역 | |
   | "54 differently expressed genes (p less than 0.05)"의 p가 보정값인가 | 논문 Methods/Results | |
   | 논문이 사용한 정규화 방법 | 논문 Methods | |
   | "n = 6"과 "n = 5–6" 서술이 다른 이유 | 논문 Methods, 그림 범례 | |
   | 데이터 이용 조건과 인용 방법 | OSDR study 페이지와 OSDR 사이트의 인용 안내 | |
   | 정규화된 표나 분석 결과가 study 페이지에 추가되었는가 | study 페이지 파일 목록 | |

   ## 5. 연구 한계 (내 말로 4줄 이상)
   - 표본 수: 
   - 대조군과 비행군의 차이(요인 이외): 
   - 조직/assay 범위: 
   - 해석 범위(종, 인과, 다른 데이터와의 연결): 
   ```
7. Day 11의 `design-formula-draft.md`로 돌아가 "OSD-536 설계식 초안" 부분을 채웁니다. 배치 정보가 그룹과 겹치지 않으면 `~ batch + condition`, 배치를 확인할 수 없거나 한 종류뿐이면 `~ condition`으로 쓰고 그 이유를 한 줄 적습니다.
8. `learning-log.md`에 기록하고 commit합니다.

⚠️ **흔한 오류 1 — `URLError` / `SSL: CERTIFICATE_VERIFY_FAILED` / 시간 초과**
네트워크나 인증서 설정 문제입니다. 코드를 고치려 애쓰지 말고, 브라우저로 study 페이지의 파일 목록에서 `OSD-536_metadata_OSD-536-ISA.zip`을 내려받아 `data/osdr_536/`에 두고 다음처럼 읽으세요: `z = zipfile.ZipFile("../data/osdr_536/OSD-536_metadata_OSD-536-ISA.zip")`. 이후 코드는 같습니다.

⚠️ **흔한 오류 2 — `KeyError: 'Factor Value[Spaceflight]'`**
열 이름의 대괄호, 대소문자, 띄어쓰기가 정확해야 합니다. `print(list(samples.columns))`로 실제 이름을 출력해 복사해 쓰세요. 웹 화면에는 `Factor Value: Spaceflight`처럼 표시되지만 파일 안의 열 이름은 대괄호 형식입니다.

## 퀴즈

**1.** (단답) ISA 샘플 표에서 설계식의 `condition`에 해당하는 열은 어떤 접두어로 시작하나요? OSD-536에서 그 열의 이름과 값 두 가지는?

<details><summary>정답 보기</summary>

`Factor Value`로 시작합니다. OSD-536에서는 `Factor Value[Spaceflight]`이고 값은 `Space Flight`와 `Ground Control`입니다. Characteristics는 개체의 원래 특성, Parameter Value는 프로토콜 수행 조건이라는 점과 구분합니다.

</details>

**2.** (객관식) OSD-536의 파일 목록에서 확인된 원시 데이터의 형태는?
① FASTQ 서열 파일 ② 샘플별 RCC count 파일 ③ 정규화된 발현 행렬 CSV ④ 차등발현 결과 표

<details><summary>정답 보기</summary>

②. 샘플당 하나씩 12개의 `.RCC.gz` 파일이 있습니다. NanoString nCounter는 서열을 읽지 않고 탐침을 세기 때문에 FASTQ가 없습니다. 정규화 표나 차등발현 결과는 이 레슨이 조회한 시점의 파일 목록에 없었으므로, 3주차에는 원시 count에서 출발하거나 논문의 결과를 참고해야 합니다.

</details>

**3.** 이 연구의 결과를 "미세중력이 뇌 유전자 발현을 바꾼다"고 요약하면 왜 부정확한가요?

<details><summary>정답 보기</summary>

비행군은 미세중력뿐 아니라 우주 방사선, 발사와 귀환의 스트레스, 귀환 후 채취까지의 시간 등을 함께 겪었고, 지상 대조군은 이 가운데 사육 환경만 비슷하게 맞춘 것입니다. 따라서 비교가 말해 주는 것은 "우주비행 환경 전체"의 효과입니다. 개별 요인으로 좁히려면 다른 설계의 실험이 필요합니다.

</details>

**4.** study 설명에는 그룹당 6마리, 프로토콜 설명에는 5–6마리라고 쓰여 있습니다. 데이터 사전에는 어떻게 적어야 할까요?

<details><summary>정답 보기</summary>

두 서술을 모두 출처와 함께 적고, 샘플 표에서 실제로 센 수(그룹당 6개)를 별도로 적은 뒤 "불일치 이유 미확인, 논문에서 확인 필요"라고 표시합니다. 한쪽을 골라 조용히 정리해 버리면 나중에 그 차이가 중요한 문제였을 때 추적할 수 없습니다.

</details>

**5.** 이 마우스 뇌 데이터에서 신경염증 관련 유전자 변화를 발견했다고 합시다. "따라서 우주비행은 파킨슨병 위험을 높인다"고 쓸 수 없는 이유를 두 가지 드세요.

<details><summary>정답 보기</summary>

첫째, 12마리의 마우스 뇌 조직에서 정해진 패널 유전자만 본 가설 생성 수준의 자료입니다. 둘째, 종이 다르고 측정한 것도 질병 발생이 아니라 발현량이므로 사람의 질병 위험이나 인과를 말할 근거가 없습니다. 이 과정에서는 두 데이터의 연결을 문헌에 근거한 공통 기전 가설 수준으로만 다룹니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] OSD-536 study 페이지의 설명과 프로토콜을 읽었다.
- [ ] 예시 1–3을 실행했고, 이 레슨의 출력과 다른 점(있다면)을 조회 날짜와 함께 적었다.
- [ ] `osdr-536-data-dictionary.md`의 1–3번 표를 채웠다.
- [ ] 4번 표(직접 확인 항목)를 가능한 만큼 채우고, 못 찾은 것은 "미확인"으로 남겼다.
- [ ] 연구 한계를 내 말로 4줄 이상 썼다.
- [ ] `design-formula-draft.md`의 OSD-536 부분을 채웠다.
- [ ] `learning-log.md` 기록과 commit을 남겼다.

---
[← 이전](day-11.md) · [코스 지도](../../README.md) · [다음 →](day-13.md)
