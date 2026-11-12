# Crash Course — Proteomics (단백질체)

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** 질량분석 기반 단백질체 논문의 Methods와 정량 표를 읽고, 강도 행렬을 받아 정규화·결측 점검·차등 풍부도 검정까지 틀리지 않게 시작한다.

범위는 **질량분석(mass spectrometry, MS) 기반 bottom-up proteomics**다. 단백질을 효소로 잘라 펩타이드(peptide)로 만든 뒤 측정하는 방식이다. 친화도 기반 패널(Olink, SomaScan)은 비교용으로만 다룬다.

## 한눈에 보기

| | 내용 |
|---|---|
| 무엇을 측정하는가 | 시료 안 펩타이드 이온의 질량 대 전하비(m/z)와 신호 강도(intensity). 단백질의 종류와 양은 여기서 **추론**한 값이다. |
| 어떤 질문에 답하는가 | 어떤 단백질이 검출되는가, 조건 사이에 어떤 단백질의 상대량이 달라지는가, 인산화 같은 번역 후 변형(post-translational modification, PTM)이 어느 자리에서 달라지는가 |
| 답하지 못하는 것 | 검출되지 않은 단백질이 "없다"는 것, (표준물질 없이) 절대 농도, 단백질의 활성·위치·상호작용, 대부분의 경우 isoform 구분, 한 번의 비교로 인과 관계 |

## 🎬 급할 때 볼 영상

- [MS-based proteomics: A short introduction to the core concepts of proteomics and mass spectrometry — Lars Juhl Jensen](https://www.youtube.com/watch?v=wx4F6kGy1Fs) (10:59) — 가장 짧다. 용어(펩타이드, MS1/MS2, 동정, 정량)를 한 번 듣고 이 문서를 읽으면 빠르다.
- [Introduction into data analysis for mass spectrometry-based proteomics - Lecture by Lennart Martens — CompOmics](https://www.youtube.com/watch?v=ZgwNWRul98o) (2:50:52) — 데이터 분석 쪽을 처음부터 다루는 긴 강의. 급하면 동정·FDR 부분만 골라 본다.
- [GTN Training - Proteomics - MaxQuant and MSstats for the analysis of label-free data — GalaxyProject](https://www.youtube.com/watch?v=ad3E4VaTp7M) (1:16:00) — 공개 도구로 label-free 데이터를 처음부터 끝까지 처리하는 실습. 설치 없이 Galaxy에서 따라 할 수 있다.

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| bottom-up proteomics | 단백질을 trypsin 등으로 잘라 펩타이드 단위로 측정하는 방식 | 측정 단위가 단백질이 아니라 펩타이드다. 단백질 수준의 값은 모두 조립된 결과다. |
| LC-MS/MS | 액체 크로마토그래피(LC)로 펩타이드를 시간 순으로 분리하고, 질량분석기로 두 번(MS1: 온전한 이온, MS2: 조각 이온) 재는 것 | MS1 강도는 주로 정량에, MS2 조각 패턴은 서열 동정에 쓴다. |
| PSM (peptide-spectrum match) | MS2 스펙트럼 하나와 후보 펩타이드 서열 하나의 짝 | 동정의 최소 단위. PSM → 펩타이드 → 단백질 순으로 근거가 쌓인다. |
| target-decoy FDR | 진짜 서열(target)과 가짜 서열(decoy, 보통 뒤집은 서열)을 함께 검색해 틀린 동정의 비율을 추정하는 방법 | "이 목록의 약 1%는 틀린 동정"이라는 뜻이다. 차등 풍부도의 FDR과는 다른 숫자다. |
| 단백질 추론 (protein inference) | 동정된 펩타이드로부터 어떤 단백질이 있었는지 결정하는 일 | 여러 단백질이 공유하는 펩타이드 때문에 답이 하나가 아닐 수 있다. 결과는 protein group으로 보고된다. |
| DDA / DIA | DDA(data-dependent acquisition)는 그 순간 강한 이온만 골라 조각낸다. DIA(data-independent acquisition)는 정해진 m/z 구간의 이온을 모두 조각낸다. | DDA는 run마다 고르는 이온이 달라 결측이 많다. DIA는 결측이 적지만 스펙트럼이 섞여 있어 전용 소프트웨어가 필요하다. |
| label-free quantification (LFQ) | 표지 없이 run마다 따로 측정한 강도를 비교하는 정량 | 준비가 간단하지만 run 간 변동과 결측에 가장 민감하다. |
| isobaric labeling (TMT, iTRAQ) | 시료마다 다른 화학 표지를 붙여 섞은 뒤 한 번에 측정하고, MS2(또는 MS3)의 reporter 이온으로 정량 | 한 묶음(plex) 안에서는 결측이 적다. 대신 비율이 실제보다 작게 나오는 ratio compression과 plex 간 배치 효과가 있다. |
| MNAR / MCAR | MNAR(missing not at random): 양이 적어서 빠진 결측. MCAR(missing completely at random): 양과 무관하게 우연히 빠진 결측 | 결측의 원인에 따라 처리법이 달라진다. 단백질체 결측은 대개 둘이 섞여 있고 MNAR 비중이 크다. |
| dynamic range | 가장 많은 단백질과 가장 적은 단백질의 양 차이 | 혈장처럼 소수의 단백질이 대부분을 차지하는 시료에서는 적은 단백질이 가려진다. 고풍부 단백질 제거(depletion)나 분획(fractionation)이 필요한 이유다. |

## 측정 기술 고르기

| 기술 | 무엇을 얻나 | 장점 | 한계 | 이런 질문에 쓴다 |
|---|---|---|---|---|
| DDA label-free | 수천 개 단백질의 상대 강도 | 준비가 단순, 시료 수 제한 없음, 도구·문헌이 가장 많음 | run마다 결측이 다름, run 간 변동 | 소규모 탐색, 처음 해 보는 비교 |
| DIA | 수천 개 단백질의 상대 강도, 결측이 적은 행렬 | 재현성과 완전성이 높아 시료가 많은 코호트에 적합 | 분석 소프트웨어 의존도가 큼, 스펙트럼 라이브러리 또는 library-free 예측이 필요 | 수십–수백 시료 비교, 임상 코호트 |
| TMT / iTRAQ 표지 | 한 plex 안 시료들의 상대 비율 | plex 안에서는 결측이 적고 정밀, 분획과 결합해 깊이를 확보 | ratio compression, plex를 넘으면 배치 효과와 결측이 생김, 시약 비용 | 시료 수가 plex 크기와 잘 맞는 설계, PTM 정량 |
| targeted (SRM/PRM) | 미리 정한 수십–수백 개 펩타이드의 정밀한 정량 | 민감도·재현성이 높음, 표지된 표준 펩타이드를 쓰면 절대 정량 가능 | 미리 정한 것만 본다, 분석법 개발에 시간이 듦 | 후보의 검증, 정해진 패널의 반복 측정 |
| 친화도 기반 패널 (Olink, SomaScan) | 미리 정한 수백–수천 개 단백질의 상대 신호 (Olink는 항체 쌍 + DNA 표지, SomaScan은 aptamer) | 혈장·뇌척수액 같은 체액에서 적은 양으로 저농도 단백질까지 측정, 처리량이 큼 | 패널에 있는 것만 본다, 결합 시약의 특이성에 의존, 서열 변이·복합체 형성이 신호에 영향을 줄 수 있음, 플랫폼 간 값이 항상 일치하지는 않음 | 대규모 체액 코호트의 바이오마커 탐색 |
| PTM 농축 (인산화 등) | 변형된 펩타이드와 변형 자리별 강도 | 농축하지 않으면 거의 보이지 않는 변형을 볼 수 있음 | 시료가 많이 필요, 농축 효율의 변동, 자리 지정(localization)의 불확실성, 단백질 총량 변화와 구분해야 함 | 신호전달 변화, 특정 변형의 조건 간 비교 |

고르는 순서: (1) 보고 싶은 단백질이 정해져 있는가 → 그렇다면 targeted나 패널. (2) 시료가 몇 개인가 → 많으면 DIA, plex에 맞으면 TMT. (3) 시료가 체액인가 조직인가 → 체액의 저농도 단백질은 MS만으로는 어렵다.

## 표준 분석 흐름

1. **시료 준비와 소화**
   - 하는 일: 단백질 추출 → 환원·알킬화 → trypsin 소화(lysine, arginine 뒤를 자름) → 탈염. 필요하면 표지(TMT), 분획, PTM 농축.
   - 여기서 정해지는 것: 배치, 처리 순서. **분석 단계에서 고칠 수 없다.**
   - QC: 시료마다 같은 양을 넣었는지, 조건이 처리 날짜·plex와 겹치지 않는지 기록한다.
2. **LC-MS/MS 측정**
   - 출력: 제조사 원자료(`.raw`, `.d`, `.wiff` 등). 공개 형식 `mzML`로 바꿀 때는 [ProteoWizard](https://proteowizard.sourceforge.io/)의 msconvert를 쓴다.
   - QC: run 순서 무작위화, 일정 간격으로 넣은 QC 시료(pooled 시료나 표준 시료)의 동정 수와 머무름 시간(retention time)이 흔들리지 않는지 본다.
3. **펩타이드 동정 (DB 검색, target-decoy FDR)**
   - 하는 일: 단백질 서열 DB(`FASTA`, 보통 [UniProt](https://www.uniprot.org/)의 해당 종 proteome + 오염 단백질 목록)에서 이론 스펙트럼을 만들어 실제 MS2와 맞춘다. decoy를 함께 검색해 FDR을 추정한다.
   - 도구: [MaxQuant](https://maxquant.org/)(DDA, TMT), [FragPipe](https://fragpipe.nesvilab.org/)(검색 엔진 MSFragger 포함; DDA, DIA, TMT), [DIA-NN](https://github.com/vdemichev/DiaNN)(DIA), [Percolator](http://percolator.ms/)(PSM 재채점). 학술 목적 무료인 도구가 많으니 라이선스를 확인한다.
   - 입력→출력: `raw`/`mzML` + `FASTA` → PSM·펩타이드 표(도구별 `txt`/`tsv`, 표준 형식으로는 `mzIdentML`, `mzTab`).
   - QC: PSM·펩타이드·단백질 수준 FDR을 각각 1%로 두는 것이 흔히 쓰는 출발점이다(근거와 한계는 [Elias & Gygi 2007](https://doi.org/10.1038/nmeth1019), [Savitski 2015](https://doi.org/10.1074/mcp.M114.046995)). 검색 설정(효소, 허용 missed cleavage, 고정·가변 변형, 질량 허용 오차, DB 버전)을 그대로 기록한다.
4. **단백질 추론**
   - 하는 일: 펩타이드를 단백질에 배정한다. 구분할 수 없는 단백질들은 하나의 protein group으로 묶인다. 공유 펩타이드를 어느 쪽에 줄지는 도구마다 규칙이 다르다.
   - QC: decoy 항목, 오염 단백질(keratin, trypsin 등), 변형 자리로만 동정된 항목을 뺀다. 단백질당 펩타이드 수 기준(예: 고유 펩타이드 1개 또는 2개 이상)을 미리 정한다.
5. **정량**
   - 하는 일: 펩타이드 강도를 단백질 값으로 요약한다. label-free는 MS1 면적(MaxQuant의 MaxLFQ 등), DIA는 조각 이온 면적, TMT는 reporter 이온 강도.
   - 출력: 단백질 × 시료 강도 행렬. 예: MaxQuant `proteinGroups.txt`, FragPipe `combined_protein.tsv`, DIA-NN 단백질 행렬(`pg_matrix`). targeted 데이터는 [Skyline](https://skyline.ms/)에서 피크를 직접 확인한다.
   - QC: 반복 시료 사이의 상관과 변동계수(CV), 시료별 동정 단백질 수가 한 시료만 유독 낮지 않은지.
6. **정규화**
   - 하는 일: log2 변환 후 시료 간 전체 수준 차이(주입량 차이)를 맞춘다. 가장 단순한 방법이 중앙값 정규화다.
   - 전제: "대부분의 단백질은 변하지 않는다." 이 전제가 깨지는 실험(면역침강, 분획, 농축 시료)에서는 다른 기준이 필요하다.
   - QC: 정규화 전후의 시료별 분포(boxplot), PCA에서 시료가 조건보다 배치·run 순서로 먼저 갈리지 않는지.
7. **결측값 처리 (MNAR vs MCAR)**
   - 하는 일: 먼저 **패턴을 본다.** 결측이 낮은 강도에 몰려 있으면 MNAR, 강도와 무관하면 MCAR에 가깝다. 그다음 (a) 유효값이 부족한 단백질은 검정에서 제외, (b) 결측을 모형 안에서 다루는 도구 사용, (c) 대체(imputation) 중에서 고른다.
   - 대체를 한다면: MNAR에는 낮은 쪽에서 뽑는 방법(검출 한계 근처의 분포에서 추출), MCAR에는 이웃 기반(kNN 등) 방법이 쓰인다. 방법별 차이는 [Lazar 2016](https://doi.org/10.1021/acs.jproteome.5b00981) 참조.
   - QC: 대체 전후로 결론이 바뀌는지 비교하고(민감도 분석), 대체한 값의 비율을 보고한다.
8. **차등 풍부도 검정**
   - 도구: [MSstats](https://msstats.org/)(R, 펩타이드 수준 자료에서 시작), [limma](https://bioconductor.org/packages/limma/)(R, 단백질 행렬에 선형 모형), [Perseus](https://maxquant.org/perseus/)(GUI). 가장 단순하게는 단백질별 t-검정.
   - 설계: 배치·plex·환자 짝(pairing)이 있으면 모형에 넣는다. 기술 반복은 독립 표본이 아니다.
9. **다중검정 보정**
   - 단백질 수만큼 검정했으므로 Benjamini–Hochberg(BH) 등으로 FDR을 조절한다. 효과크기(log2 fold change)와 함께 보고한다.
10. **기능 해석**
    - 하는 일: gene set 과대표현 분석이나 순위 기반 분석, 네트워크 분석.
    - 주의: 배경 집합은 전체 유전체가 아니라 **이 실험에서 정량된 단백질**이다. protein group의 ID를 유전자 이름으로 바꿀 때 하나가 여럿에 대응하는 경우를 어떻게 처리했는지 적는다.

## 최소 실행 예시

실제 원자료 검색(3–5단계)은 전용 도구와 큰 파일이 필요하므로 여기서는 다루지 않는다. 아래는 **정량 행렬을 받은 뒤**(6–9단계)에 하는 일이다. 데이터는 가상이며 생물학적 의미가 없다.

### 예시 1 — log 변환, 중앙값 정규화, 결측 패턴, 단백질별 검정 + BH

```python
import numpy as np, pandas as pd
from scipy import stats
from statsmodels.stats.multitest import multipletests

rng = np.random.default_rng(42)
n_prot, n_per = 300, 6
samples = [f"C{i}" for i in range(1, 7)] + [f"D{i}" for i in range(1, 7)]
group = np.array(["control"] * n_per + ["disease"] * n_per)

# 가상 데이터: 단백질마다 기본 풍부도(log2)가 다르고, 앞의 30개만 disease에서 2배(+1) 높다
base = rng.normal(24, 2, n_prot)
log_true = base[:, None] + rng.normal(0, 0.35, (n_prot, 12))
log_true[:30, n_per:] += 1.0
load = rng.normal(0, 0.4, 12)                       # 시료마다 주입량이 조금씩 다르다
raw = pd.DataFrame(2 ** (log_true + load), columns=samples,
                   index=[f"P{i:03d}" for i in range(n_prot)])

# 결측 심기: (1) 강도가 낮을수록 잘 빠진다(MNAR)  (2) 강도와 무관하게 2%가 빠진다(MCAR)
p_mnar = 1 / (1 + np.exp((np.log2(raw) - 21.5) * 2))
raw = raw.mask(rng.random(raw.shape) < p_mnar).mask(rng.random(raw.shape) < 0.02)

# 1) log2 변환 → 2) 중앙값 정규화(시료 중앙값을 전체 평균 중앙값에 맞춘다)
logx = np.log2(raw)
med = logx.median()
norm = logx - med + med.mean()
print("시료별 중앙값 (정규화 전):", med.round(2).tolist())
print("시료별 중앙값 (정규화 후):", norm.median().round(2).tolist())

# 3) 결측 패턴 확인
miss = norm.isna()
print(f"\n전체 결측 비율: {miss.to_numpy().mean():.1%}")
print("시료별 결측 비율:", miss.mean().round(2).tolist())
q = pd.qcut(norm.mean(axis=1), 4, labels=["Q1(낮음)", "Q2", "Q3", "Q4(높음)"])
print("평균 강도 사분위별 결측 비율:")
print(miss.mean(axis=1).groupby(q, observed=True).mean().round(3).to_string())

# 4) 군마다 유효값이 4개 이상인 단백질만 검정 (결측은 채우지 않고 빼고 계산)
ctrl, dis = norm.loc[:, group == "control"], norm.loc[:, group == "disease"]
keep = (ctrl.notna().sum(axis=1) >= 4) & (dis.notna().sum(axis=1) >= 4)
t, p = stats.ttest_ind(dis[keep], ctrl[keep], axis=1, equal_var=False, nan_policy="omit")
res = pd.DataFrame({"log2FC": dis[keep].mean(axis=1) - ctrl[keep].mean(axis=1), "p": np.asarray(p)})
res["padj"] = multipletests(res["p"], method="fdr_bh")[1]
sig = res[res["padj"] < 0.05]
truth = set(raw.index[:30])
print(f"\n검정한 단백질: {keep.sum()} / {n_prot}  (제외 {n_prot - keep.sum()}개는 유효값 부족)")
print(f"raw p < 0.05: {(res['p'] < 0.05).sum()}개,  BH padj < 0.05: {len(sig)}개")
print(f"padj < 0.05 중 진짜 변화: {len(set(sig.index) & truth)}개, 거짓 양성: {len(set(sig.index) - truth)}개")
print(sig.sort_values("padj").head(5).round(4).to_string())

# 자기 점검: 정규화 후 시료 중앙값이 모두 같아야 한다
assert np.allclose(norm.median(), norm.median().iloc[0])
```

출력:

```text
시료별 중앙값 (정규화 전): [24.38, 24.32, 23.76, 24.06, 23.68, 24.89, 23.71, 23.92, 23.78, 23.88, 24.67, 24.92]
시료별 중앙값 (정규화 후): [24.16, 24.16, 24.16, 24.16, 24.16, 24.16, 24.16, 24.16, 24.16, 24.16, 24.16, 24.16]

전체 결측 비율: 14.8%
시료별 결측 비율: [0.11, 0.1, 0.22, 0.14, 0.21, 0.04, 0.2, 0.17, 0.2, 0.22, 0.12, 0.04]
평균 강도 사분위별 결측 비율:
Q1(낮음)    0.431
Q2        0.081
Q3        0.020
Q4(높음)    0.032

검정한 단백질: 246 / 300  (제외 54개는 유효값 부족)
raw p < 0.05: 36개,  BH padj < 0.05: 13개
padj < 0.05 중 진짜 변화: 13개, 거짓 양성: 0개
      log2FC       p    padj
P000  1.2256  0.0001  0.0069
P010  1.2112  0.0001  0.0069
P011  1.1997  0.0001  0.0069
P012  1.1544  0.0001  0.0069
P020  1.1720  0.0001  0.0069
```

읽는 법:

- 평균 강도가 최하위 사분위인 단백질에서는 값의 43%가 결측이고, 그 위 사분위에서는 8% 이하다. 낮은 값이 빠지는 MNAR의 흔적이다. Q3·Q4의 2–3%는 심어 둔 MCAR 수준이다.
- 시료별 결측 비율(4%–22%)은 정규화 전 중앙값이 낮은 시료(주입량이 적은 시료)에서 높다. 실제 데이터에서도 결측 비율이 유독 높은 시료는 주입량이나 run 품질을 먼저 의심한다.
- 진짜로 변한 단백질은 30개인데 13개만 찾았다. 군당 6개에 결측까지 있으면 검정력이 낮다. "유의하지 않음"은 "변화 없음"이 아니다.
- raw p < 0.05인 36개를 그대로 쓰면 그중 상당수는 우연이다. BH 보정 뒤에는 거짓 양성이 0개였다(이 시드에서의 결과이며, FDR 5%는 평균적으로 그 정도의 거짓 양성을 허용한다는 뜻이다).
- 제외된 54개는 대부분 양이 적은 단백질이다. 결과 표에 없다고 해서 변하지 않은 것이 아니라 **판단할 수 없었던** 것이다.

### 예시 2 — 결측을 0으로 채우면

예시 1에 이어서 실행한다.

```python
zero = norm.fillna(0)                     # 흔한 실수: "안 보였으니 0"
fc0 = zero.loc[:, group == "disease"].mean(axis=1) - zero.loc[:, group == "control"].mean(axis=1)
p0 = stats.ttest_ind(zero.loc[:, group == "disease"], zero.loc[:, group == "control"], axis=1, equal_var=False)[1]
padj0 = multipletests(p0, method="fdr_bh")[1]
null = ~norm.index.isin(list(truth))      # 실제로는 변화가 없는 270개
print("\n[0으로 채운 경우] 변화 없는 단백질 270개 중")
print(f"  |log2FC| > 1 인 것: {(fc0[null].abs() > 1).sum()}개   (결측 제외 계산에서는 {(res.loc[res.index.isin(norm.index[null]), 'log2FC'].abs() > 1).sum()}개)")
print(f"  가장 큰 |log2FC|: {fc0[null].abs().max():.1f}  → 2^{fc0[null].abs().max():.1f}배 차이로 읽힌다")
print(f"  padj < 0.05: {(padj0[null] < 0.05).sum()}개")
worst = fc0[null].abs().idxmax()
print(f"  예: {worst} 의 값 →", norm.loc[worst].round(1).tolist())
```

출력:

```text
[0으로 채운 경우] 변화 없는 단백질 270개 중
  |log2FC| > 1 인 것: 131개   (결측 제외 계산에서는 0개)
  가장 큰 |log2FC|: 14.9  → 2^14.9배 차이로 읽힌다
  padj < 0.05: 0개
  예: P161 의 값 → [22.1, 23.2, 22.0, 22.2, 22.4, 22.8, nan, 22.3, nan, nan, nan, 23.1]
```

log2 강도가 22 안팎인 단백질에 0을 넣으면 그 시료만 400만 배 낮은 값이 된다. 변화가 없는 단백질 270개 가운데 131개에서 2배 이상의 가짜 fold change가 생겼다. 동시에 분산도 폭발해서 이 예에서는 유의한 것이 하나도 남지 않았다. 즉 0 채우기는 fold change 순위와 검정을 **둘 다** 망가뜨린다. 결측의 개수가 군마다 다르면 가짜 유의성이 생기는 방향으로도 틀어질 수 있다.

## 흔한 함정

1. **동정 FDR 수준을 혼동한다.** PSM이나 펩타이드 수준에서 1%로 걸렀다고 단백질 목록의 오류율이 1%인 것은 아니다 → 틀린 PSM은 여러 단백질에 흩어지고 맞는 PSM은 같은 단백질에 모이므로, 시료·run을 많이 합칠수록 단백질 수준 오류율이 커진다 → 단백질 수준 FDR을 따로 적용했는지 Methods에서 확인하고, 펩타이드 1개로만 동정된 단백질은 따로 표시한다.
2. **동정의 FDR과 차등 풍부도의 FDR을 같은 것으로 읽는다.** → 앞의 것은 "이 단백질이 정말 있었는가", 뒤의 것은 "조건 간에 정말 달랐는가"에 대한 오류율이다 → 논문에서 "FDR 1%"가 어느 쪽인지 문장마다 구분한다.
3. **결측을 0으로 채운다.** → 예시 2처럼 가짜 fold change와 부풀린 분산이 생긴다 → 결측 패턴을 먼저 보고, 유효값 기준으로 거른 뒤 제외·모형·대체 중 하나를 고르고, 선택에 따라 결론이 바뀌는지 확인한다. "한 군에서만 전부 검출됨"은 흥미로운 후보지만 통계 검정이 아니라 별도 목록으로 다룬다.
4. **배치와 run 순서를 무시한다.** → 대조군을 먼저, 환자군을 나중에 측정하면 기기 감도 변화(drift)가 군 차이처럼 보인다. TMT에서는 plex가 곧 배치다 → 측정 전에 순서를 무작위화하거나 블록으로 나누고, 분석에서는 PCA를 배치·run 순서로 색칠해 확인한 뒤 모형에 넣는다. 조건과 배치가 완전히 겹치면 분석으로 분리할 수 없다.
5. **mRNA 변화가 곧 단백질 변화라고 가정한다(또는 그 반대).** → 번역 효율, 단백질 분해 속도, 분비·이동 때문에 두 층의 양은 중간 정도로만 일치하는 경우가 흔하다([Vogel & Marcotte 2012](https://doi.org/10.1038/nrg3185), [Liu 2016](https://doi.org/10.1016/j.cell.2016.03.014)) → RNA-seq 결과를 단백질 수준의 증거로 쓰지 않는다. 불일치는 오류일 수도, 전사 후 조절일 수도 있으므로 둘을 구분할 설계(같은 시료, 같은 시점)가 있는지 본다.
6. **protein group을 단일 유전자·단일 isoform으로 읽는다.** → 공유 펩타이드는 어느 isoform·paralog에서 왔는지 알 수 없다. 표의 첫 번째 ID만 남기면 근거 없는 선택을 한 셈이다 → group 전체를 보존하고, isoform을 말하려면 그 isoform에만 있는 고유 펩타이드가 정량에 쓰였는지 확인한다.
7. **정규화의 전제를 확인하지 않는다.** → 중앙값 정규화는 대부분의 단백질이 변하지 않는다고 가정한다. 농축 시료, 면역침강, 한쪽 조건에서 전체 단백질 구성이 크게 바뀌는 실험에서는 진짜 차이를 지워 버린다 → 전제를 적고, 필요하면 spike-in이나 기준 단백질 집합으로 정규화한다.
8. **인산화 변화를 단백질 총량 변화와 구분하지 않는다.** → 인산화 펩타이드가 늘어난 것이 단백질 자체가 늘어서일 수 있다 → 같은 시료의 전체 단백질체와 함께 보거나, 그렇게 하지 못했다면 한계로 적는다. 자리 지정 확률이 낮은 자리는 따로 표시한다.

## 연구 설계 체크리스트

- [ ] 질문이 탐색(무엇이 달라지는가)인지 확증(정한 후보가 달라지는가)인지 정했고, 그에 맞는 측정 기술을 골랐다.
- [ ] 생물학적 반복 수를 적었다. 기술 반복(같은 시료의 재주입)과 구분했다.
- [ ] 시료 준비 날짜, 준비자, LC 칼럼, run 순서, TMT plex와 channel이 메타데이터 표에 있다.
- [ ] 조건 × 배치 교차표에 0인 칸이 없다(조건과 배치가 겹치지 않는다).
- [ ] run 순서를 무작위화했고, QC 시료(pooled 또는 표준)를 일정 간격으로 넣었다. TMT라면 plex마다 공통 기준 channel이 있다.
- [ ] 검색에 쓴 FASTA의 출처·종·내려받은 날짜(버전), 오염 단백질 DB 포함 여부, 소프트웨어 버전과 설정 파일을 보관했다.
- [ ] PSM·펩타이드·단백질 수준 FDR 기준과 단백질당 최소 펩타이드 수를 **결과를 보기 전에** 정했다.
- [ ] 유효값 필터 기준과 결측 처리 방법을 미리 정했고, 다른 방법으로 바꿨을 때의 결과도 볼 계획이 있다.
- [ ] 통계 모형에 배치·짝 구조를 넣었고, 다중검정 보정 방법과 보고할 효과크기를 정했다.
- [ ] 후보의 검증 방법(독립 코호트, targeted MS, 항체 기반 방법 등)을 정했다. 검증 전 결과는 가설로 쓴다.

## 공개 데이터와 더 볼 곳

**공개 저장소**

| 이름 | URL | 무엇이 있나 |
|---|---|---|
| ProteomeXchange | <https://www.proteomexchange.org/> | 여러 저장소를 묶는 연합. 논문에 나오는 `PXD` 번호로 데이터셋을 찾는다. |
| PRIDE | <https://www.ebi.ac.uk/pride/> | ProteomeXchange의 대표 저장소. 원자료, 검색 결과, 실험 설명. |
| MassIVE | <https://massive.ucsd.edu/> | ProteomeXchange 회원 저장소. 원자료와 재분석 결과. |
| Proteomic Data Commons | <https://pdc.cancer.gov/> | 암 조직 중심의 대규모 단백질체·인산화 단백질체와 임상 정보. |
| AD Knowledge Portal | <https://adknowledgeportal.synapse.org/> | 알츠하이머병 관련 코호트의 단백질체를 포함한 여러 omics. 일부 자료는 이용 승인이 필요하다. |
| UniProt | <https://www.uniprot.org/> | 검색에 쓰는 단백질 서열 DB와 기능 주석. |
| Human Protein Atlas | <https://www.proteinatlas.org/> | 조직·세포별 단백질 발현 정보. 후보를 해석할 때 참고. |

**공식 문서·튜토리얼**

- [Galaxy Training — Proteomics](https://training.galaxyproject.org/training-material/topics/proteomics/): 설치 없이 따라 하는 실습 모음.
- [EMBL-EBI Training — Proteomics: an introduction](https://www.ebi.ac.uk/training/online/courses/proteomics-an-introduction/): 무료 온라인 입문 과정.
- 도구 문서: [MaxQuant·Perseus](https://maxquant.org/), [FragPipe](https://fragpipe.nesvilab.org/), [DIA-NN](https://vdemichev.github.io/DiaNN/), [Skyline](https://skyline.ms/), [MSstats](https://msstats.org/).
- 친화도 패널 제조사: [Olink](https://olink.com/), [SomaLogic(SomaScan)](https://somalogic.com/). 값의 단위와 정규화 방식은 플랫폼 문서를 직접 확인한다.

**핵심 논문** (Crossref로 서지 확인)

- 개관: Aebersold R, Mann M. Mass-spectrometric exploration of proteome structure and function. *Nature* 2016;537:347–355. [doi:10.1038/nature19949](https://doi.org/10.1038/nature19949)
- target-decoy: Elias JE, Gygi SP. Target-decoy search strategy for increased confidence in large-scale protein identifications by mass spectrometry. *Nat Methods* 2007;4:207–214. [doi:10.1038/nmeth1019](https://doi.org/10.1038/nmeth1019)
- 단백질 추론: Nesvizhskii AI, Aebersold R. Interpretation of shotgun proteomic data: the protein inference problem. *Mol Cell Proteomics* 2005;4:1419–1440. [doi:10.1074/mcp.R500012-MCP200](https://doi.org/10.1074/mcp.R500012-MCP200)
- 단백질 수준 FDR: Savitski MM 외. A scalable approach for protein false discovery rate estimation in large proteomic data sets. *Mol Cell Proteomics* 2015;14:2394–2404. [doi:10.1074/mcp.M114.046995](https://doi.org/10.1074/mcp.M114.046995)
- 결측값: Lazar C 외. Accounting for the multiple natures of missing values in label-free quantitative proteomics data sets to compare imputation strategies. *J Proteome Res* 2016;15:1116–1125. [doi:10.1021/acs.jproteome.5b00981](https://doi.org/10.1021/acs.jproteome.5b00981)
- ratio compression: Ting L 외. MS3 eliminates ratio distortion in isobaric multiplexed quantitative proteomics. *Nat Methods* 2011;8:937–940. [doi:10.1038/nmeth.1714](https://doi.org/10.1038/nmeth.1714)
- mRNA와 단백질: Vogel C, Marcotte EM. Insights into the regulation of protein abundance from proteomic and transcriptomic analyses. *Nat Rev Genet* 2012;13:227–232. [doi:10.1038/nrg3185](https://doi.org/10.1038/nrg3185) · Liu Y, Beyer A, Aebersold R. On the dependency of cellular protein levels on mRNA abundance. *Cell* 2016;165:535–550. [doi:10.1016/j.cell.2016.03.014](https://doi.org/10.1016/j.cell.2016.03.014)
- 도구: MaxQuant [doi:10.1038/nbt.1511](https://doi.org/10.1038/nbt.1511) · MSFragger [doi:10.1038/nmeth.4256](https://doi.org/10.1038/nmeth.4256) · DIA-NN [doi:10.1038/s41592-019-0638-x](https://doi.org/10.1038/s41592-019-0638-x) · Skyline [doi:10.1093/bioinformatics/btq054](https://doi.org/10.1093/bioinformatics/btq054) · Perseus [doi:10.1038/nmeth.3901](https://doi.org/10.1038/nmeth.3901) · MSstats [doi:10.1093/bioinformatics/btu305](https://doi.org/10.1093/bioinformatics/btu305)
- 저장소: Perez-Riverol Y 외. The PRIDE database resources in 2022. *Nucleic Acids Res* 2022;50:D543–D552. [doi:10.1093/nar/gkab1038](https://doi.org/10.1093/nar/gkab1038)

## 본 과정과의 연결

본 과정은 전사체(nCounter 패널) 데이터를 다루지만, 정량 행렬을 받은 뒤의 사고방식은 단백질체와 거의 같다.

| 이 가이드의 부분 | 자세히 다루는 레슨 | 연결점 |
|---|---|---|
| 파일 형식, 서열 DB | [Day 6](../lessons/week-1/day-06.md), [Day S1](../lessons/supplement/day-S1.md) | FASTA 읽기, UniProt accession과 버전 기록 |
| DB 검색의 통계 | [Day S5](../lessons/supplement/day-S5.md) | "우연히 이만큼 맞을 확률"이라는 발상은 BLAST의 E-value와 target-decoy가 같다 |
| log 변환, 정규화, QC | [Day 13](../lessons/week-2/day-13.md), [Day 8](../lessons/week-2/day-08.md) | 왜 log를 취하는가, 시료 간 수준 맞추기, 분포부터 보기 |
| 배치, run 순서, 설계식 | [Day 11](../lessons/week-2/day-11.md) | 조건 × 배치 교차표, `~ batch + condition` |
| 시료 수준 QC | [Day 14](../lessons/week-2/day-14.md) | PCA로 배치와 이상 시료 찾기 |
| 메타데이터와 행렬 연결 | [Day 16](../lessons/week-3/day-16.md) | 시료 ID를 순서가 아니라 이름으로 맞추기 |
| 효과크기, p-value, FDR | [Day 9](../lessons/week-2/day-09.md), [Day 10](../lessons/week-2/day-10.md), [Day 18](../lessons/week-3/day-18.md) | BH 보정, log2 fold change의 방향 |
| 검출되지 않은 것의 해석 | [Day 19](../lessons/week-3/day-19.md) | "변화 없음"과 "이 데이터로는 알 수 없음"의 구분 |
| 기능 해석의 배경 집합 | [Day 20](../lessons/week-3/day-20.md) | 패널·정량된 집합을 배경으로 써야 하는 이유 |
| 결측 처리에 따른 결론 변화 | [Day 39](../lessons/week-6/day-39.md) | 민감도 분석: 고르지 않고 전부 보여 주기 |
| isoform, paralog | [Day S2](../lessons/supplement/day-S2.md) | 상동 서열이 공유 펩타이드를 만드는 이유 |

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
