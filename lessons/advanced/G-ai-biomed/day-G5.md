# Day G5 — 단백질: 구조 예측과 단백질 언어 모델

> **주차:** 심화 파트 G — AI·생성형 AI in 바이오메디컬 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/G/G5_protein_ai.ipynb` + `reports/advanced/G5_plddt_note.md` (관심 단백질 1개의 예측 구조 신뢰도 메모)
>
> **먼저 끝내 둘 레슨:** [Day S1 — 서열 데이터베이스](../../supplement/day-S1.md), [Day S6 — 다중 서열 정렬과 프로파일](../../supplement/day-S6.md), [Day G1](day-G1.md)(자기지도 학습).

## 오늘의 목표
- 서열을 ML 입력으로 바꾸는 방법(one-hot, k-mer, 언어 모델 임베딩)의 발전 순서를 설명할 수 있다.
- "가린 아미노산 맞히기"가 왜 진화 정보를 배우게 하는지 MSA 예시로 보일 수 있다.
- AlphaFold 예측 구조의 pLDDT를 읽고, 무질서 단백질(α-synuclein, tau)에서 낮은 값이 정상인 이유를 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [AlphaFold: The making of a scientific breakthrough — Google DeepMind](https://www.youtube.com/watch?v=gg7WjuFs8F4) (7:54)
- **무엇에 주목할까:** 구조 예측이 왜 50년 묵은 문제였는지, CASP라는 "정답을 숨긴 시험"으로 평가했다는 점을 보세요. 개발사 제작 영상이므로 한계에 대한 설명은 오늘 개념 설명으로 보충합니다.

- [Protein Language Models — RosettaCommons](https://www.youtube.com/watch?v=9DL1aX5fM_I) (33:48)
- **무엇에 주목할까:** 앞 15분 정도만 봐도 됩니다. 서열을 문장처럼, 아미노산을 단어처럼 다루고 가린 글자를 맞히게 학습한다는 부분에 집중하세요.

## 개념 설명

### 서열을 숫자로: one-hot에서 임베딩까지

ML 모델은 글자를 받지 못하니 서열을 숫자로 바꿔야 합니다. 가장 단순한 **one-hot**은 자리마다 20칸 중 하나를 1로 켭니다. 길이가 다른 서열을 비교하기 어렵다는 단점이 있어, 서열 안의 짧은 조각 빈도를 세는 **k-mer 벡터**(2-mer면 20×20 = 400칸)를 쓰기도 합니다. 둘 다 "A와 G가 비슷한 성질"이라는 생물학 지식을 담지 못합니다. S3의 치환 행렬(BLOSUM)은 사람이 정렬 통계로 그 지식을 숫자로 만든 것이었습니다.

**단백질 언어 모델(protein language model, PLM)** 은 그 지식을 데이터에서 스스로 배웁니다. 수억 개의 서열에서 일부 아미노산을 가리고 맞히게 하면(자기지도), 모델은 각 자리를 수백 차원 벡터(**임베딩**)로 표현하는 법을 익힙니다. ESM 계열 모델이 대표적이고, 이 임베딩을 기능 예측, 변이 영향 예측(예: AlphaMissense), 구조 예측(ESMFold)의 입력으로 씁니다.

### 왜 "빈칸 맞히기"가 생물학을 배우나

같은 가족 단백질들을 정렬해 보면(S6의 MSA), 기능에 중요한 자리는 거의 바뀌지 않고, 서로 맞닿은 두 자리는 함께 바뀝니다(공진화). 가린 글자를 잘 맞히려면 모델은 이 규칙성, 즉 보존과 공변을 배워야 합니다. 예시 1은 PLM 대신 "같은 자리에서 가장 흔한 글자"라는 가장 단순한 규칙으로 맞혀 봅니다. 그것만으로도 무작위보다 훨씬 잘 맞힙니다. PLM은 이것을 MSA 없이 서열 하나만 보고도 할 수 있게, 수많은 가족의 규칙을 한 모델에 담은 것입니다.

### AlphaFold와 신뢰도 점수 읽기

AlphaFold2는 서열과 MSA(공진화 정보)를 입력으로 3D 좌표를 예측하고, 2020년 CASP14에서 실험 구조에 근접한 정확도를 보였습니다. AlphaFold DB는 2억 개 넘는 예측 구조를 공개합니다. AlphaFold3는 단백질–리간드·핵산 복합체까지 넓혔고, ESMFold는 MSA 없이 언어 모델로 빠르게 예측합니다.

예측 구조를 쓸 때 가장 먼저 볼 것은 **잔기별 신뢰도 pLDDT**(0–100)입니다. 파일의 B-factor 칸에 들어 있습니다. 흔한 해석 구간은 >90 매우 높음, 70–90 높음(골격은 대체로 맞음), 50–70 낮음, <50 매우 낮음입니다. 도메인 간 상대 위치는 별도의 **PAE**(예측 정렬 오차) 그림으로 봅니다. 신경퇴행 질환의 핵심 단백질인 α-synuclein, tau는 고정된 구조가 없는 **무질서 단백질(IDP)** 이거나 긴 무질서 구간을 가집니다. 이들의 낮은 pLDDT는 "예측 실패"라기보다 "한 가지 구조가 없다"는 신호에 가깝습니다. 그 영역의 좌표를 구조처럼 해석하거나 도킹에 쓰면 안 됩니다. 또 예측은 한 가지 상태(대개 단량체)를 보여 줄 뿐이라, 섬유(fibril)처럼 응집한 상태나 돌연변이의 영향은 실험 구조(PDB)와 별도 근거가 필요합니다.

예측 구조를 실험 구조와 비교할 때는 두 구조를 가장 잘 겹친 뒤 대응 원자 사이 거리의 제곱평균제곱근, 즉 **RMSD**(Å)를 흔히 씁니다. 직관적이지만 약점이 있습니다. 대부분은 잘 맞아도 유연한 고리(loop)나 꼬리 몇 군데가 크게 어긋나면 값이 확 커지고, 단백질이 길수록 커지는 경향이 있어 크기가 다른 단백질끼리 비교하기 어렵습니다. **TM-score**(0–1)는 이 문제를 줄이려고 거리 기준을 단백질 길이에 맞춰 조정한 점수입니다. 대략 0.5를 넘으면 같은 접힘(fold)으로 봅니다(Zhang & Skolnick 2004). CASP 같은 평가는 이런 전역 점수와 잔기 단위 점수를 함께 씁니다. 무질서 구간이 긴 단백질은 비교 전에 그 구간을 빼고 계산했는지부터 확인합니다.

## 예시로 이해하기

> MSA와 구조 파일은 모두 연습용으로 지어낸 **가상 데이터**입니다.

### 예시 1 — MSA로 가린 아미노산 맞히기, k-mer 벡터

```python
import numpy as np
from collections import Counter

rng = np.random.default_rng(0)
# (1) '빈칸 맞히기' 직관: 같은 가족 서열(가상 MSA)에서 가려진 아미노산을 예측한다
msa = ["MKVLAAGIVGLLAQ", "MKVLSAGIVGLLAQ", "MRVLAAGLVGLIAQ", "MKILAAGIVGMLSQ",
       "MKVLAAGVVGLLAE", "MKVMAAGIVGLLAQ", "MRVLAAGIIGLLAQ", "MKVLGAGIVGLVAQ"]
L = len(msa[0])

def predict_masked(seqs, pos):
    """다른 서열들의 같은 자리에서 가장 흔한 글자 = 가장 단순한 '언어 모델'."""
    return Counter(s[pos] for s in seqs).most_common(1)[0][0]

hits = total = 0
for i, s in enumerate(msa):                      # 한 서열씩 빼 두고(leave-one-out) 자리마다 가린다
    others = msa[:i] + msa[i + 1:]
    for pos in range(L):
        hits += predict_masked(others, pos) == s[pos]
        total += 1
print(f"가족 정보로 가린 글자 맞히기: {hits}/{total} = {hits / total:.0%}")
print(f"무작위로 20종 중 하나 찍기의 기대값: {1 / 20:.0%}")

# 자리별 보존도(엔트로피가 낮을수록 보존): 언어 모델이 '중요한 자리'를 배우는 단서
ent = []
for pos in range(L):
    p = np.array(list(Counter(s[pos] for s in msa).values())) / len(msa)
    ent.append(abs(-(p * np.log2(p)).sum()))   # abs: -0.0 표시 방지
print("자리별 엔트로피:", np.round(ent, 2))

# (2) 고전적 서열 표현: 2-mer 빈도 벡터 (단백질 언어 모델 임베딩 이전의 방식)
from itertools import product
AA = "ACDEFGHIKLMNPQRSTVWY"
kmers = ["".join(p) for p in product(AA, repeat=2)]
def kmer_vec(s):
    c = Counter(s[i:i + 2] for i in range(len(s) - 1))
    return np.array([c[k] for k in kmers], dtype=float)
v = kmer_vec(msa[0])
print("2-mer 벡터 길이:", len(v), "| 0이 아닌 칸:", int((v > 0).sum()))
```

출력:

```text
가족 정보로 가린 글자 맞히기: 98/112 = 88%
무작위로 20종 중 하나 찍기의 기대값: 5%
자리별 엔트로피: [0.   0.81 0.54 0.54 1.06 0.   0.   1.06 0.54 0.   0.54 1.06 0.54 0.54]
2-mer 벡터 길이: 400 | 0이 아닌 칸: 12
```

다른 일곱 서열의 같은 자리만 보고도 88%를 맞힙니다. 엔트로피가 0인 자리(1, 6, 7, 10번째)는 모든 서열에서 같은 글자, 즉 보존된 자리입니다. 언어 모델은 이런 보존 패턴을 수많은 가족에서 동시에 배웁니다. 반대로 2-mer 벡터는 400칸 중 12칸만 켜진, 생물학 지식이 전혀 없는 희소한 표현입니다.

### 예시 2 — 예측 구조 파일에서 pLDDT 읽기

```python
import numpy as np

rng = np.random.default_rng(0)
# 가상 예측 구조 파일(PDB 형식의 CA 원자 줄만). AlphaFold 계열 파일은 B-factor 칸(61–66열)에 pLDDT를 넣는다.
# 1–60번은 잘 접힌 도메인(높은 pLDDT), 61–100번은 무질서 꼬리(낮은 pLDDT)를 흉내 낸 값이다.
plddt_true = np.r_[rng.normal(91, 3, 60), rng.normal(42, 8, 40)].clip(20, 99)
lines = []
for i, b in enumerate(plddt_true, start=1):
    lines.append(f"ATOM  {i:5d}  CA  ALA A{i:4d}    {0.0:8.3f}{0.0:8.3f}{0.0:8.3f}{1.0:6.2f}{b:6.2f}           C")
pdb_text = "\n".join(lines)

# 읽기: 고정 폭 열에서 잔기 번호와 B-factor(=pLDDT)를 꺼낸다
res, plddt = [], []
for line in pdb_text.splitlines():
    if line.startswith("ATOM") and line[12:16].strip() == "CA":
        res.append(int(line[22:26])); plddt.append(float(line[60:66]))
plddt = np.array(plddt)

bands = [(90, 101, "매우 높음(>90)"), (70, 90, "높음(70–90)"), (50, 70, "낮음(50–70)"), (0, 50, "매우 낮음(<50)")]
for lo, hi, name in bands:
    print(f"{name:<14} 잔기 {((plddt >= lo) & (plddt < hi)).sum():>3}개")

# 낮은 신뢰도 구간을 이어진 범위로 찾기: 잔기마다 들쭉날쭉하므로 앞뒤 2잔기씩(창 5) 평균한 뒤 자른다
smooth = np.convolve(plddt, np.ones(5) / 5, mode="same")
low = smooth < 50
starts = [res[i] for i in range(len(res)) if low[i] and (i == 0 or not low[i - 1])]
ends = [res[i] for i in range(len(res)) if low[i] and (i == len(res) - 1 or not low[i + 1])]
print("pLDDT<50 연속 구간(5잔기 이상):", [(s, e) for s, e in zip(starts, ends) if e - s >= 4])
```

출력:

```text
매우 높음(>90)     잔기  41개
높음(70–90)      잔기  19개
낮음(50–70)      잔기  10개
매우 낮음(<50)     잔기  30개
pLDDT<50 연속 구간(5잔기 이상): [(63, 100)]
```

잔기마다 값이 들쭉날쭉해 원값으로 자르면 구간이 잘게 끊기므로, 창 5짜리 평균으로 다듬은 뒤 찾았습니다(`mode="same"`은 양 끝을 0으로 채워 끝 두 잔기의 평균이 조금 낮게 나온다는 점은 알아 두세요). 결과는 63–100번, 즉 일부러 넣은 무질서 꼬리입니다. 실제 파일이라면 이 구간은 "구조 없음"으로 표시하고 해석에서 뺍니다.

### 예시 3 — ESM-2로 단백질 서열을 벡터로 바꾸기

ESM-2는 두 가지 방법으로 받을 수 있습니다. 공식 패키지 `fair-esm`은 Meta 서버에서 가중치를 받는데, **2026년 11월 11일에 그 서버(`dl.fbaipublicfiles.com`)의 보안 인증서가 만료되어** 이 레슨을 쓴 시점에는 `CERTIFICATE_VERIFY_FAILED` 오류로 내려받기가 실패했습니다. 인증서 검증을 끄고 받는 것은 안전하지 않으므로 하지 않습니다. 같은 모델이 Hugging Face에도 공식 게시되어 있어, 아래에서는 `transformers`로 그쪽에서 받습니다.

```python
# 필요: pip install transformers (PyTorch는 G2 예시 3 참고). 첫 실행 때 모델 약 30 MB를 내려받는다.
import torch
from transformers import AutoTokenizer, EsmModel
name = "facebook/esm2_t6_8M_UR50D"                        # 가장 작은 ESM-2
tok = AutoTokenizer.from_pretrained(name)
model = EsmModel.from_pretrained(name, add_pooling_layer=False).eval()
tokens = tok(["MKVLAAGIVGLLAQ"], return_tensors="pt")
with torch.no_grad():
    out = model(**tokens)
emb = out.last_hidden_state[0, 1:-1].mean(0)             # 시작·끝 토큰을 빼고 평균: 서열 하나 → 벡터 하나
print(tokens["input_ids"].shape, emb.shape)
print(emb[:5].round(decimals=3))
```

출력 (transformers + PyTorch 2.14):

```text
torch.Size([1, 16]) torch.Size([320])
tensor([ 0.1400,  0.0090,  0.3070,  0.1410, -0.1590])
```

아미노산 14개에 시작·끝 토큰 2개가 붙어 16개 토큰이 되고, 평균을 내면 320차원 벡터 하나가 됩니다. 불러올 때 `lm_head ... UNEXPECTED`라는 안내가 나오는데, 이는 마스크 언어 모델용 머리(쓰지 않는 부분)를 버렸다는 뜻이라 무시해도 됩니다.

공식 `fair-esm` 패키지로 쓸 때의 형태는 아래와 같습니다. 서버 인증서가 갱신되면 그대로 동작해야 하지만, 위 이유로 이 레슨을 쓸 때는 **실행 확인 안 됨(가중치 서버 인증서 만료)** 입니다.

```python
import torch, esm
model, alphabet = esm.pretrained.esm2_t6_8M_UR50D()
batch = alphabet.get_batch_converter()
_, _, tokens = batch([("demo", "MKVLAAGIVGLLAQ")])
with torch.no_grad():
    out = model(tokens, repr_layers=[6])
emb = out["representations"][6][0, 1:-1].mean(0)
```

이렇게 얻은 벡터를 G1·G4처럼 표의 한 행으로 놓고 로지스틱 회귀나 랜덤 포레스트에 넣는 것이 흔한 사용법입니다. 공식 저장소: <https://github.com/facebookresearch/esm>

## 직접 해보기

1. `notebooks/advanced/G/G5_protein_ai.ipynb`를 만들고 예시 1–2를 실행합니다.
2. **MSA 줄이기.** 예시 1의 `msa`를 앞 세 서열만 남기고 다시 실행합니다. 정확도가 어떻게 변하는지 적습니다. 가족 정보가 적은 단백질(고아 단백질)에서 MSA 기반 방법이 약한 이유입니다.
3. **보존 자리와 변이.** 엔트로피 0인 자리 하나를 골라, 그 자리의 변이가 기능에 미칠 영향을 "보존되어 있으니 영향이 클 가능성이 있다(가설)"처럼 조심스럽게 한 문장으로 씁니다.
4. **실제 예측 구조 보기(브라우저).** AlphaFold DB(<https://alphafold.ebi.ac.uk/>)에서 사람 α-synuclein(유전자 SNCA)을 검색해 구조 그림의 색(pLDDT)과 PAE 그림을 봅니다. 숫자(구간 경계 등)는 화면에서 직접 확인한 것만 `reports/advanced/G5_plddt_note.md`에 적고, "낮은 pLDDT 구간을 어떻게 해석할지" 세 문장을 씁니다.
5. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — pLDDT를 결합 친화도나 기능 점수로 읽기.** pLDDT는 "이 자리 좌표를 얼마나 믿을 수 있나"일 뿐입니다. 높다고 기능이 있거나 약이 잘 붙는다는 뜻이 아닙니다.

⚠️ **흔한 오류 2 — 예측 구조를 실험 구조처럼 인용.** 논문·보고서에는 "AlphaFold 예측 모델(DB 버전, 접근 날짜)"이라고 출처를 밝히고, 실험 구조(PDB, <https://www.rcsb.org/>)가 있으면 그것을 우선합니다.

## 퀴즈

**1.** 단백질 언어 모델의 사전학습 과제로 가장 흔한 것은?

(a) 3D 좌표 회귀 (b) 가린 아미노산 맞히기 (c) 질환 여부 분류 (d) 서열 길이 예측

<details><summary>정답 보기</summary>

(b). 라벨 없이 서열만으로 문제를 만드는 자기지도 학습입니다. 이를 잘 풀려면 보존·공변 같은 진화 규칙을 배워야 합니다.

</details>

**2.** 예측 구조에서 어떤 구간의 pLDDT가 모두 40 안팎입니다. 가장 알맞은 해석은?

(a) 그 구간이 약물 결합 부위다 (b) 좌표를 신뢰할 수 없고, 무질서 구간일 가능성이 있다 (c) 실험 구조와 정확히 같다 (d) 그 구간은 잘린 서열이다

<details><summary>정답 보기</summary>

(b). 50 미만은 좌표를 믿기 어려운 구간이고, 상당수는 고정 구조가 없는 무질서 영역입니다. 구조로 해석하거나 도킹에 쓰지 않습니다.

</details>

**3.** α-synuclein 단량체 예측 구조만으로 답할 수 없는 질문을 하나 고르세요.

(a) 어느 구간의 예측 신뢰도가 낮은가 (b) 응집한 섬유에서 분자들이 어떻게 쌓이는가 (c) 서열 길이 (d) 예측에 쓴 DB 버전

<details><summary>정답 보기</summary>

(b). 예측은 대개 단량체 한 상태를 보여 줍니다. 섬유 구조는 cryo-EM 같은 실험 구조와 별도 연구가 필요합니다.

</details>

**4.** 2-mer 벡터에 비해 언어 모델 임베딩이 가진 장점을 한 문장으로 쓰세요. (단답)

<details><summary>정답 보기</summary>

아미노산의 성질 유사성과 문맥(주변 자리, 진화적 보존)을 대량 서열에서 배운 조밀한 벡터라, 사람이 규칙을 정하지 않아도 기능과 관련된 정보를 담습니다. 2-mer는 조각 빈도만 세는 희소한 표현입니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] MSA 크기를 줄였을 때 가린 글자 맞히기 정확도의 변화를 적었다.
- [ ] 구조 파일 B-factor 칸에서 pLDDT를 읽고 낮은 구간을 찾았다.
- [ ] AlphaFold DB에서 무질서 단백질 하나를 보고 해석 메모를 썼다.

## 더 읽을거리
- Jumper J, et al. Highly accurate protein structure prediction with AlphaFold. *Nature.* 2021;596:583–589. doi:[10.1038/s41586-021-03819-2](https://doi.org/10.1038/s41586-021-03819-2)
- Tunyasuvunakool K, et al. Highly accurate protein structure prediction for the human proteome. *Nature.* 2021;596:590–596. doi:[10.1038/s41586-021-03828-1](https://doi.org/10.1038/s41586-021-03828-1)
- Varadi M, et al. AlphaFold Protein Structure Database. *Nucleic Acids Res.* 2022;50:D439–D444. doi:[10.1093/nar/gkab1061](https://doi.org/10.1093/nar/gkab1061)
- Abramson J, et al. Accurate structure prediction of biomolecular interactions with AlphaFold 3. *Nature.* 2024;630:493–500. doi:[10.1038/s41586-024-07487-w](https://doi.org/10.1038/s41586-024-07487-w)
- Rives A, et al. *PNAS.* 2021;118:e2016239118. doi:[10.1073/pnas.2016239118](https://doi.org/10.1073/pnas.2016239118) · Lin Z, et al. Evolutionary-scale prediction of atomic-level protein structure with a language model. *Science.* 2023;379:1123–1130. doi:[10.1126/science.ade2574](https://doi.org/10.1126/science.ade2574)
- Cheng J, et al. AlphaMissense. *Science.* 2023;381:eadg7492. doi:[10.1126/science.adg7492](https://doi.org/10.1126/science.adg7492)
- Zhang Y, Skolnick J. Scoring function for automated assessment of protein structure template quality (TM-score). *Proteins.* 2004;57:702–710. doi:[10.1002/prot.20264](https://doi.org/10.1002/prot.20264)
- Ruff KM, Pappu RV. AlphaFold and implications for intrinsically disordered proteins. *J Mol Biol.* 2021;433:167208. doi:[10.1016/j.jmb.2021.167208](https://doi.org/10.1016/j.jmb.2021.167208)

---
[← 이전](day-G4.md) · [코스 지도](../../../README.md) · [다음 →](day-G6.md)
