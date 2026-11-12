# Day 18 — 차등발현 결과 표를 만들고 읽기

> **주차:** 3주차 · **예상 시간:** 75–90분 · **산출물:** 상위 후보 유전자 표 (`data/osdr_536/processed/top_candidates.csv`)

## 오늘의 목표
- contrast의 방향(무엇에서 무엇을 뺐는가)을 정하고 log2 fold change를 해석할 수 있다.
- p-value와 adjusted p-value(FDR)의 차이를 설명하고, 표에서 두 값을 구분해 읽을 수 있다.
- 유전자 ID 체계(기호, RefSeq accession)를 확인하고 상위 후보 표를 저장할 수 있다.

## 🎬 영상으로 먼저 보기
- [False Discovery Rates, FDR, clearly explained — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=K8LQSvtjcEo) (18:27)
- **무엇에 주목할까:** 아무 차이가 없는 유전자만 검정해도 p-value가 0.05보다 작은 것이 5%쯤 나온다는 그림이 핵심입니다. Benjamini-Hochberg 보정이 p-value를 "키워서" 거짓 발견의 비율을 통제한다는 흐름만 잡으세요.
- [p-values: What they are and how to interpret them — StatQuest with Josh Starmer](https://www.youtube.com/watch?v=vemZtEM63GY) (11:21)
- **무엇에 주목할까:** p-value는 "차이가 얼마나 큰가"가 아니라 "차이가 없다고 가정할 때 이런 데이터가 얼마나 드문가"입니다. 효과크기(log2FC)와 p-value를 따로 봐야 하는 이유를 떠올리며 보세요.

## 개념 설명

### 차등발현 표는 유전자마다 같은 질문을 반복한 결과다

**차등발현(differential expression, DE) 분석**은 거창해 보이지만, 2주차에 배운 두 군 비교를 유전자마다 한 번씩 반복한 것입니다. 유전자 하나를 골라 FLT 6개 값과 GC 6개 값을 비교하고, 그 결과를 한 행으로 적습니다. 이것을 수백 번 하면 표가 됩니다. OSD-536은 차등발현 결과 표를 제공하지 않으므로(Day 15에서 확인) 오늘은 표를 직접 만듭니다. 방법은 가장 단순한 것을 씁니다. 어제 만든 정규화된 log2 값에 대해 유전자마다 Welch t-test(두 군의 분산이 같다고 가정하지 않는 t-test)를 합니다. 실제 연구에서는 표본이 작을 때 유전자들끼리 정보를 빌려 오는 더 정교한 방법을 쓰지만, 표의 **읽는 법**은 똑같습니다. 어떤 도구가 만든 표든 "contrast, 효과크기, p-value, 보정된 p-value, 유전자 ID" 다섯 가지를 찾으면 됩니다.

### contrast와 log2 fold change: 방향부터 확인한다

**contrast**는 "무엇에서 무엇을 뺐는가"입니다. 이 코스에서는 **FLT − GC**로 정합니다. log2 값끼리의 뺄셈이므로 결과는 **log2 fold change(log2FC)** 입니다. log2FC가 +1이면 FLT에서 2배, −1이면 절반, 0이면 차이 없음입니다. 방향을 반대로(GC − FLT) 잡으면 부호가 전부 뒤집히므로, 남이 만든 표를 읽을 때는 가장 먼저 contrast의 방향을 확인해야 합니다. "상향 조절"이라는 말이 어느 군 기준인지 모르면 결론이 정반대가 됩니다. 한 가지 주의: 발현이 아주 낮은 유전자는 count 몇 개 차이로도 log2FC가 크게 나옵니다. 그래서 어제 "검출이 불안정한 유전자"를 표시해 두었고, 오늘은 그것들을 빼고 검정합니다.

### p-value를 수백 번 구하면 생기는 일: FDR

복권을 한 장 사서 당첨되면 놀랍지만, 600장을 사서 몇 장 당첨되는 것은 놀랍지 않습니다. 유전자 600개를 검정하면, 실제로는 아무 차이가 없어도 p < 0.05인 유전자가 평균 30개쯤(600 × 0.05) 나옵니다. 그래서 "p < 0.05인 유전자 수"만으로는 진짜 신호가 있는지 알 수 없습니다. **FDR(false discovery rate, 거짓 발견 비율)** 보정은 "내가 유의하다고 부른 목록 중 거짓이 차지하는 비율"을 통제합니다. Benjamini-Hochberg(BH) 방법으로 구한 **adjusted p-value**가 0.05보다 작은 유전자만 고르면, 그 목록의 약 5%만 거짓일 것으로 기대합니다.

이 구분은 OSD-536을 읽을 때 특히 중요합니다. study 설명에는 "A set of 54 differently expressed genes (p less than 0.05)"라고 적혀 있습니다. 이 0.05가 보정 전 p-value인지 보정 후인지는 설명문만으로는 알 수 없으니 논문의 Methods에서 직접 확인하세요. 그리고 여러분의 표에서 p < 0.05인 유전자 수와 FDR < 0.05인 유전자 수를 나란히 적어 두세요. 군당 6마리에서는 FDR 기준을 통과하는 유전자가 매우 적거나 없을 수 있습니다. 그것은 실패가 아니라 "이 표본 크기로 말할 수 있는 범위"를 정직하게 보여 주는 결과입니다.

## 예시로 이해하기

### 예시 1 — log2FC를 손으로 계산하기

```python
import numpy as np

flt = np.array([7.9, 8.1, 8.0])       # 어떤 유전자의 log2 발현값 (가상)
gc = np.array([9.0, 9.1, 8.9])

log2fc = flt.mean() - gc.mean()       # contrast: FLT - GC
print("log2FC:", round(log2fc, 2))
print("배수:", round(2 ** log2fc, 2), "(FLT가 GC의 몇 배인가)")
```

```text
log2FC: -1.0
배수: 0.5 (FLT가 GC의 몇 배인가)
```

log2FC가 −1이므로 FLT에서 발현이 절반입니다.

### 예시 2 — 아무 차이가 없어도 "유의한" 유전자는 나온다

```python
from scipy import stats
from statsmodels.stats.multitest import multipletests

rng = np.random.default_rng(1)
null_flt = rng.normal(8, 0.4, size=(6, 600))      # 6마리 × 600유전자, 군 차이 없음
null_gc = rng.normal(8, 0.4, size=(6, 600))

p = stats.ttest_ind(null_flt, null_gc, equal_var=False).pvalue
fdr = multipletests(p, method="fdr_bh")[1]
print("p < 0.05 인 유전자 수:", (p < 0.05).sum())
print("FDR < 0.05 인 유전자 수:", (fdr < 0.05).sum())
```

```text
p < 0.05 인 유전자 수: 31
FDR < 0.05 인 유전자 수: 0
```

두 군을 똑같은 분포에서 뽑았는데도 보정 전에는 수십 개가 "유의"합니다. 보정 후에는 사라집니다.

### 예시 3 — BH 보정이 p-value를 어떻게 바꾸는가

```python
p_small = np.array([0.001, 0.008, 0.039, 0.041, 0.20, 0.74])
adj = multipletests(p_small, method="fdr_bh")[1]
for a, b in zip(p_small, adj):
    print(f"p = {a:<6}  →  adjusted p = {b:.3f}")
```

```text
p = 0.001   →  adjusted p = 0.006
p = 0.008   →  adjusted p = 0.024
p = 0.039   →  adjusted p = 0.062
p = 0.041   →  adjusted p = 0.062
p = 0.2     →  adjusted p = 0.240
p = 0.74    →  adjusted p = 0.740
```

보정된 값은 원래 값보다 항상 같거나 큽니다. 0.039와 0.041은 보정 전에는 0.05 아래였지만 보정 후에는 넘습니다.

## 직접 해보기

`MODE = "practice"`로 끝까지 실행한 뒤 `"real"`로 바꿔 다시 실행합니다.

1. 설정 셀과 어제 저장한 표를 불러옵니다.

```python
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats
from statsmodels.stats.multitest import multipletests

MODE = "practice"          # 연습이 끝나면 "real"로 바꾸세요
RAW_DIR = Path("../data/osdr_536_practice" if MODE == "practice" else "../data/osdr_536")
OUT_DIR = RAW_DIR / "processed"
FIG_DIR = Path("../figures")

log2_norm = pd.read_csv(OUT_DIR / "log2_norm.csv", index_col=0)
gene_qc = pd.read_csv(OUT_DIR / "gene_qc.csv", index_col=0)
probes = pd.read_csv(OUT_DIR / "probes.csv")
group = pd.read_csv(OUT_DIR / "samples.csv").set_index("sample_id").loc[log2_norm.index, "group"]

keep = gene_qc.index[gene_qc["keep"]]
flt = log2_norm.loc[group == "FLT", keep]
gc = log2_norm.loc[group == "GC", keep]
print("FLT:", flt.shape, "| GC:", gc.shape)
```

```text
FLT: (6, 60) | GC: (6, 60)
```

2. 유전자마다 Welch t-test를 하고 표를 만듭니다. contrast는 FLT − GC입니다.

```python
res = stats.ttest_ind(flt, gc, equal_var=False)       # 열(유전자)마다 한 번씩

de = pd.DataFrame({
    "gene": keep,
    "mean_GC": gc.mean().values,
    "mean_FLT": flt.mean().values,
    "log2FC": (flt.mean() - gc.mean()).values,        # FLT - GC
    "p_value": res.pvalue,
})
de["FDR"] = multipletests(de["p_value"], method="fdr_bh")[1]
de = de.merge(probes[["Name", "Accession"]], left_on="gene", right_on="Name").drop(columns="Name")
de = de.sort_values("p_value").reset_index(drop=True)
print(de.head(8).round(4).to_string(index=False))
```

```text
  gene  mean_GC  mean_FLT  log2FC  p_value    FDR   Accession
Prac34  10.8351    9.8816 -0.9535   0.0004 0.0156 PRAC_0034.1
Prac05   5.8486    4.8695 -0.9791   0.0007 0.0156 PRAC_0005.1
Prac06   7.1486    6.1264 -1.0223   0.0008 0.0156 PRAC_0006.1
Prac21  10.0801    9.3176 -0.7625   0.0012 0.0156 PRAC_0021.1
Prac42   8.6868    9.3096  0.6228   0.0014 0.0156 PRAC_0042.1
Prac01   5.9152    4.8101 -1.1051   0.0016 0.0156 PRAC_0001.1
Prac04  10.1975    9.4665 -0.7311   0.0019 0.0160 PRAC_0004.1
Prac41   5.5130    6.4269  0.9140   0.0041 0.0306 PRAC_0041.1
```

3. 표 전체를 숫자 몇 개로 요약합니다.

```python
n = len(de)
print("검정한 유전자 수:", n)
print("차이가 전혀 없어도 p < 0.05 로 기대되는 수:", round(n * 0.05, 1))
print("p < 0.05:", int((de["p_value"] < 0.05).sum()),
      "| 그중 FLT 감소:", int(((de["p_value"] < 0.05) & (de["log2FC"] < 0)).sum()))
print("FDR < 0.05:", int((de["FDR"] < 0.05).sum()), "| FDR < 0.10:", int((de["FDR"] < 0.10).sum()))
print("|log2FC| 최대:", round(de["log2FC"].abs().max(), 2))
```

```text
검정한 유전자 수: 60
차이가 전혀 없어도 p < 0.05 로 기대되는 수: 3.0
p < 0.05: 14 | 그중 FLT 감소: 11
FDR < 0.05: 10 | FDR < 0.10: 12
|log2FC| 최대: 1.11
```

4. 유전자 ID 체계를 확인합니다. `gene` 열은 유전자 기호(symbol), `Accession` 열은 전사체 번호입니다. 접두어별 개수를 세어 어떤 체계인지 봅니다.

```python
print(de["Accession"].str.split("_").str[0].value_counts().to_string())
print("기호가 중복된 유전자:", int(de["gene"].duplicated().sum()))
```

```text
Accession
PRAC    60
기호가 중복된 유전자: 0
```

   실제 데이터에서는 `NM`, `XM` 같은 RefSeq 접두어가 나옵니다. 연습 데이터의 `PRAC`은 가짜입니다. 마우스 유전자 기호는 첫 글자만 대문자(`Tnf`)이고 사람은 전부 대문자(`TNF`)라는 점도 기억해 두세요. Day 20에서 도구에 유전자 목록을 넣을 때 종(species)을 잘못 고르면 이 차이 때문에 매칭이 안 됩니다.

5. volcano plot으로 표 전체를 한 장에 봅니다. 가로축은 효과크기, 세로축은 −log10(p-value)입니다.

```python
fig, ax = plt.subplots(figsize=(5.5, 4.5))
sig = de["FDR"] < 0.05
ax.scatter(de.loc[~sig, "log2FC"], -np.log10(de.loc[~sig, "p_value"]), s=12, color="grey", label="FDR >= 0.05")
ax.scatter(de.loc[sig, "log2FC"], -np.log10(de.loc[sig, "p_value"]), s=18, color="tab:red", label="FDR < 0.05")
ax.axhline(-np.log10(0.05), linestyle="--", linewidth=0.8, color="black")
for _, row in de.head(8).iterrows():
    ax.annotate(row["gene"], (row["log2FC"], -np.log10(row["p_value"])), fontsize=7,
                xytext=(3, 3), textcoords="offset points")
ax.set_xlabel("log2 fold change (FLT - GC)")
ax.set_ylabel("-log10(p-value)")
ax.set_title("Volcano plot (dashed line: unadjusted p = 0.05)")
ax.legend(fontsize=8)
fig.tight_layout()
fig.savefig(FIG_DIR / f"osdr_{MODE}_volcano.png", dpi=150)
```

6. 전체 표와 상위 후보 표를 저장합니다. 상위 후보는 "p-value 순 상위 20개"로 정하되, 이 기준은 탐색용이라는 점을 열 이름으로도 남깁니다.

```python
de.to_csv(OUT_DIR / "de_table.csv", index=False)

top = de.head(20).copy()
top["direction"] = np.where(top["log2FC"] > 0, "FLT_up", "FLT_down")
top["passes_FDR_0.05"] = top["FDR"] < 0.05
top.round(4).to_csv(OUT_DIR / "top_candidates.csv", index=False)
print(top[["gene", "log2FC", "p_value", "FDR", "direction", "passes_FDR_0.05"]].head(5).round(4).to_string(index=False))
```

```text
  gene  log2FC  p_value    FDR direction  passes_FDR_0.05
Prac34 -0.9535   0.0004 0.0156  FLT_down             True
Prac05 -0.9791   0.0007 0.0156  FLT_down             True
Prac06 -1.0223   0.0008 0.0156  FLT_down             True
Prac21 -0.7625   0.0012 0.0156  FLT_down             True
Prac42  0.6228   0.0014 0.0156    FLT_up             True
```

7. `MODE = "real"`로 바꿔 다시 실행하고, 노트북에 마크다운 셀로 아래 문장을 채웁니다.

```markdown
### Day 18 요약 (실제 데이터)
- contrast: FLT − GC, 검정 방법: 유전자별 Welch t-test (정규화된 log2 값), 다중검정 보정: BH
- 검정한 유전자 [n]개 중 p < 0.05: [n]개 (우연만으로 기대되는 수: 약 [n]개), FDR < 0.05: [n]개
- p < 0.05 유전자 중 FLT 감소 [n]개 / 증가 [n]개
- 논문·study 설명의 "54 DEGs (p < 0.05)"와 비교: [내 결과와 같은가, 다른가. 논문 Methods에서 확인한 보정 여부와 정규화 방법]
- 이 표를 해석할 때의 주의점: [한두 문장]
```

8. 논문(DOI `10.1038/s41526-022-00217-4`)의 Methods에서 통계 방법 부분을 찾아 읽고, 여러분의 방법과 다른 점을 두 가지 적습니다. 숫자가 논문과 똑같지 않은 것은 정상입니다. 정규화와 검정 방법이 다르면 목록도 달라집니다.

⚠️ **흔한 오류 1 — log2FC의 부호를 반대로 읽는다.** 표의 `log2FC`는 FLT − GC입니다. 음수면 "비행군에서 낮다"입니다. 헷갈리면 `mean_FLT`와 `mean_GC` 열을 직접 비교하세요.

⚠️ **흔한 오류 2 — `p_value` 순 상위 목록을 "유의한 유전자"라고 부른다.** 상위 20개는 순위일 뿐입니다. FDR 열을 함께 보고, FDR 기준을 통과하지 못한 유전자는 "후보"라고만 부르세요.

## 퀴즈

**1.** contrast가 FLT − GC일 때 log2FC = −2는 무엇을 뜻하나요?

<details><summary>정답 보기</summary>

비행군의 발현이 지상 대조군의 1/4(2의 −2제곱)이라는 뜻입니다. contrast를 GC − FLT로 잡았다면 같은 데이터에서 +2가 나오므로, 표를 읽을 때는 방향을 먼저 확인합니다.

</details>

**2.** 600개 유전자를 검정해 p < 0.05인 유전자가 35개 나왔습니다. 이것만으로 "35개 유전자가 변했다"고 할 수 없는 이유는?

<details><summary>정답 보기</summary>

아무 차이가 없어도 600 × 0.05 = 30개쯤은 우연히 p < 0.05가 되기 때문입니다. 35개는 우연으로 기대되는 수와 거의 같습니다. FDR로 보정한 값을 봐야 목록 중 거짓 발견이 얼마나 섞였을지 가늠할 수 있습니다.

</details>

**3.** adjusted p-value(FDR) < 0.05인 유전자 목록에 대한 올바른 설명은? (가) 목록의 각 유전자가 틀릴 확률이 5% (나) 목록 전체에서 거짓 발견이 약 5% 이하로 기대됨 (다) 효과크기가 5% 이상

<details><summary>정답 보기</summary>

(나). FDR은 개별 유전자가 아니라 "유의하다고 부른 목록 전체"에 대한 비율입니다. 효과가 큰지 작은지는 FDR이 아니라 log2FC가 알려 줍니다.

</details>

**4.** 검출이 불안정한(배경 수준) 유전자를 검정 전에 뺀 이유를 한 문장으로 쓰세요.

<details><summary>정답 보기</summary>

count가 잡음 수준인 유전자는 몇 개 차이로도 log2FC가 크게 흔들려 가짜 후보가 되기 쉽고, 검정 횟수만 늘려 다중검정 보정을 불리하게 만들기 때문입니다.

</details>

**5.** 실제 데이터에서 FDR < 0.05인 유전자가 0개였다면, 보고서에 어떻게 써야 할까요?

<details><summary>정답 보기</summary>

"다중검정 보정 후 유의한 유전자는 없었다"고 그대로 쓰고, 보정 전 p-value 기준 후보는 탐색적 결과로 구분해 제시합니다. 기준을 통과하는 결과가 나올 때까지 방법을 바꿔 보는 것은 p-hacking이며, 작은 표본에서는 "없음"도 정직한 결과입니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `processed/de_table.csv`와 `processed/top_candidates.csv`가 실제 데이터로 저장되었다.
- [ ] contrast 방향, 검정 방법, 보정 방법을 노트북에 적었다.
- [ ] p < 0.05 개수, 우연 기대 수, FDR < 0.05 개수를 나란히 적었다.
- [ ] 유전자 ID 체계(기호 + RefSeq accession)를 확인했다.
- [ ] 논문의 통계 방법과 내 방법의 차이를 두 가지 적었다.

---
[← 이전](day-17.md) · [코스 지도](../../README.md) · [다음 →](day-19.md)
