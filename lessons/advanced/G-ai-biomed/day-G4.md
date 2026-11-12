# Day G4 — 분자 표현과 활성 예측: SMILES, 지문, QSAR, 분자 생성

> **주차:** 심화 파트 G — AI·생성형 AI in 바이오메디컬 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/G/G4_molecules_qsar.ipynb` + `reports/advanced/G4_split_comparison.md` (무작위 vs 골격 분할 비교표)
>
> **먼저 끝내 둘 레슨:** [Day G2](day-G2.md), [Day 33 — 참가자 단위 검증과 데이터 누수](../../week-5/day-33.md), [Day 34 — 평가 지표 해석](../../week-5/day-34.md). RDKit이 필요합니다(`conda install -c conda-forge rdkit`, 본 과정 environment.yml에는 없음).

## 오늘의 목표
- 분자를 SMILES, 분자 기술자, Morgan 지문으로 표현하고 Tanimoto 유사도를 계산할 수 있다.
- IC50을 pIC50으로 바꾸고, 무작위 분할과 골격(scaffold) 분할의 성능 차이를 설명할 수 있다.
- 생성된 분자를 validity·uniqueness·novelty로 점검하고, 그 지표의 한계를 말할 수 있다.

## 🎬 영상으로 먼저 보기

- [13. Molecular Strings and Fingerprints (RDKit tutorial) — Taylor Sparks](https://www.youtube.com/watch?v=kBk8HbjWwCw) (17:25)
- **무엇에 주목할까:** SMILES가 "분자 그래프를 한 줄로 펼친 글자"라는 점, 같은 분자도 여러 SMILES로 쓸 수 있어 canonical SMILES가 필요하다는 점을 보세요.

- [Morgan fingerprint and ECFPs - using Python and RDKit — Code to Discovery](https://www.youtube.com/watch?v=vgmMIFXWL1w) (7:20)
- **무엇에 주목할까:** 원자마다 반경 1, 2 안의 이웃 모양을 번호(해시)로 바꿔 비트 벡터에 켜는 과정입니다. 예시 1의 `radius=2`가 이것입니다.

## 개념 설명

### 신약 파이프라인에서 ML이 들어가는 자리

표적 선정 → 히트 탐색(대규모 실험 스크리닝 HTS, 또는 컴퓨터로 걸러 내는 가상 스크리닝) → 리드 최적화 → 전임상 → 임상의 긴 흐름에서, ML은 주로 앞쪽에 들어갑니다. "이 분자가 표적에 얼마나 붙을까"(활성 예측, QSAR), "독성·흡수·대사는?"(ADMET 예측), "조건을 만족하는 새 분자는?"(생성 모델)입니다. 신경퇴행 쪽 예로는 아세틸콜린에스터레이스(AD 대증 치료 표적), BACE1, LRRK2 키나아제, MAO-B가 자주 쓰입니다. 질환 전사체 서명과 약물 반응 서명을 비교해 기존 약을 다른 질환에 쓰는 **재창출(repurposing)** 아이디어도 있는데, 모두 실험으로 확인하기 전까지는 **가설**입니다. 예측이 잘 맞은 분자도 "후보" 이상으로 부르지 않습니다.

AI로 설계한 분자의 임상 성과는 아직 초기 단계입니다. 편집서·홍보 자료의 "AI 발견 약" 목록에는 사실과 다른 항목이 섞이기도 하므로, 사례는 1차 문헌으로 확인하세요(예: Jayatunga 2024, Ren 2024 — 아래 더 읽을거리).

### 분자를 숫자로: SMILES, 기술자, 지문

**SMILES**는 분자 그래프를 글자로 적은 것입니다. `C`는 탄소, 소문자 `c`는 방향족 탄소, `=`는 이중결합, 숫자는 고리를 닫는 표시입니다. 같은 분자를 시작 원자에 따라 여러 방식으로 쓸 수 있으므로, 비교·중복 제거 전에는 반드시 **canonical SMILES**로 바꿉니다. 문법이 틀린 문자열은 분자가 되지 않습니다(RDKit이 `None`을 돌려줌).

**분자 기술자(descriptor)** 는 분자 전체의 성질을 숫자 하나로 요약합니다. 분자량(MW), 지용성(logP), 수소결합 주개·받개 수(HBD·HBA), 극성 표면적(TPSA) 등이고, Lipinski의 "5의 규칙"은 이 값들로 경구 흡수 가능성을 대략 걸러 내는 경험칙입니다. QED는 여러 기술자를 묶어 "약다운 정도"를 0–1로 매긴 점수입니다.

**Morgan 지문(ECFP 계열)** 은 원자마다 주변 이웃 모양을 번호로 바꿔 2048칸 같은 비트 벡터의 칸을 켭니다. 본 과정 비유로는 "분자 × 부분구조" 표, 즉 유전자 발현 표의 열이 부분구조인 셈입니다. 두 지문이 켠 칸의 겹침 비율이 **Tanimoto 유사도**(0–1)입니다. 분자 그래프를 직접 받는 그래프 신경망(GNN)도 있지만, 지문 + 랜덤 포레스트는 지금도 강한 기준선입니다.

### QSAR 데이터와 검증: 무작위 분할이 속이는 이유

**QSAR**(정량적 구조–활성 관계)는 구조로 활성 값을 예측하는 회귀입니다. 데이터는 보통 ChEMBL 같은 공개 DB의 측정 기록에서 옵니다. 기록마다 표적, 측정 유형(IC50, Ki, EC50), 단위, 관계 기호(`=`, `<`, `>`)가 있습니다. IC50과 Ki처럼 다른 측정 유형을 섞지 말고, `>10000 nM`처럼 "그보다 약하다"만 알려 주는 **검열된 값**은 그대로 숫자로 넣지 말고 따로 표시하거나 제외합니다. IC50(nM)은 **pIC50 = −log10(IC50 [M])** 로 바꿉니다. 단위가 몰(M)이라 nM이면 10⁻⁹을 곱하고, 부호 때문에 클수록 강한 활성이 됩니다.

화합물 데이터는 한 연구팀이 같은 골격에 치환기만 바꾼 **유사체 시리즈**로 몰려 있습니다. 무작위로 나누면 평가셋의 분자마다 거의 같은 형제가 학습셋에 있으니, 모델은 "형제 값 베끼기"만 해도 잘 맞힙니다. 새 골격의 분자를 예측하려는 실제 상황과 다르죠. 그래서 **Bemis–Murcko 골격**(곁사슬을 떼고 남은 고리·연결 사슬)으로 묶어 같은 골격은 한쪽에만 두는 **scaffold split**을 씁니다. Day 33에서 같은 참가자를 한쪽에만 둔 GroupKFold와 똑같은 논리입니다. 평가할 때는 평균만 답하는 기준선과 비교하고, 학습 분자와 너무 다른 분자(**적용 영역, applicability domain** 밖)의 예측은 믿지 않습니다.

유사도 기반 모델은 "비슷한 분자는 비슷하게 작용한다"를 전제로 합니다. 그 전제가 깨지는 곳이 **활성 절벽(activity cliff)** 입니다. 원자 하나만 다른 두 분자의 활성이 수십~수백 배 차이 나는 경우입니다. 여러 공개 데이터셋에서 비교한 연구에서는 딥러닝을 포함한 모든 모델이 이런 분자쌍에서 크게 틀렸고, 지문 + 고전 ML이 복잡한 그래프 모델보다 오히려 조금 나았습니다(van Tilborg 2022). 그래서 평균 오차와 함께 "절벽 분자에서의 오차"를 따로 보고, 새 모델은 늘 지문 기준선과 비교합니다. 고전 QSAR에서 쓰던 **y-무작위화**(활성 값을 섞어 다시 학습했을 때 성능이 무너지는지 확인)도 "모델이 우연한 패턴을 외운 건 아닌가"를 보는 값싼 점검입니다.

### 구조 기반 vs 리간드 기반 가상 스크리닝, 그리고 벤치마크의 함정

가상 스크리닝에는 두 갈래가 있습니다. **리간드 기반**은 이미 알려진 활성 분자를 출발점으로 삼아 지문 유사도나 QSAR로 비슷한 후보를 고릅니다. 위에서 다룬 방법들이 여기에 속합니다. **구조 기반**은 표적 단백질의 3D 구조(실험 구조, 또는 G5의 예측 구조)가 출발점입니다. **도킹(docking)** 으로 분자가 결합 자리에 놓일 자세(pose)를 찾고, **점수 함수**로 줄을 세웁니다. 흔한 흐름은 도킹 → (선택) 분자동역학(MD)으로 결합 안정성 확인 → ADMET 거르기 → 실험입니다.

도킹 점수는 **측정한 결합력이 아니라 순위를 매기는 대략적인 추정치**입니다. 단백질을 대개 고정된 모양으로 다루고, 물·엔트로피 효과를 크게 단순화하기 때문입니다. 도킹 점수가 좋다는 것은 "실험해 볼 후보 목록에 넣을 만하다"는 뜻일 뿐입니다. 예측 구조로 도킹할 때는 결합 자리의 pLDDT부터 확인합니다(G5).

ML 스크리닝 모델을 평가하는 벤치마크에도 함정이 있습니다. 대부분의 데이터셋에서 "비활성" 분자는 실제로 측정한 값이 아니라, 활성 분자와 물성은 비슷하지만 구조가 다르게 골라 넣은 **디코이(decoy)** 입니다. 널리 쓰인 DUD-E에서는 활성 분자와 디코이를 고르는 방식 자체에 숨은 차이가 있어서, 모델이 결합을 배우지 않고도 높은 점수를 받을 수 있다는 분석이 나왔습니다(Chen 2019). 그래서 실제 측정된 활성·비활성으로 만들고 편향을 줄인 LIT-PCBA 같은 데이터셋이 제안되었습니다(Tran-Nguyen 2020). 교훈은 G7과 같습니다. 높은 벤치마크 점수가 나오면 먼저 데이터를 만든 방식이 정답을 흘리고 있지 않은지 봅니다.

예측이 실험까지 이어진 대표적 사례로는 대장균 생장 억제 데이터로 학습한 그래프 신경망이 약물 재창출 라이브러리에서 고른 항생제 후보 halicin이 있습니다(Stokes 2020). 시험관 실험과 생쥐 감염 모델로 확인했기 때문에 사례가 되었습니다. 모델 점수만으로 사례가 된 것은 아닙니다.

### 분자 생성과 그 지표

G2의 자기회귀·VAE·GAN은 SMILES나 분자 그래프에도 쓸 수 있습니다. 생성 결과는 보통 **validity**(문법상 분자가 되는 비율), **uniqueness**(유효 분자 중 서로 다른 비율), **novelty**(학습셋에 없는 비율)로 먼저 봅니다(MOSES, GuacaMol 벤치마크). 하지만 세 지표가 높아도 그 분자가 합성 가능한지, 활성이 있는지, 안전한지는 전혀 말해 주지 않습니다. 학습 분자에서 메틸 하나만 뗀 분자도 "새롭다"로 셉니다. 그래서 분포 수준의 지표를 함께 봅니다. **FCD**(Fréchet ChemNet Distance)는 생성 분자 묶음과 실제 분자 묶음이 신경망 특징 공간에서 얼마나 떨어져 있는지를 재고(Preuer 2018), **내부 다양성**은 생성 분자끼리 서로 얼마나 다른지를 잽니다. 합성 가능성은 역합성 소프트웨어로 따로 확인해야 하고, 벤치마크 목표 점수만 최적화한 생성 분자 중에는 합성 경로를 찾기 어려운 것이 많다는 보고가 있습니다(Gao & Coley 2020). 잘못된 SMILES가 나오는 문제를 표현 쪽에서 막은 것이 **SELFIES**입니다. 어떤 문자열이든 유효한 분자로 해독되도록 설계한 표기법입니다(Krenn 2020). 이렇게 하면 validity는 처음부터 100%가 되므로, validity 숫자만으로 모델을 비교하는 일은 더욱 의미가 없어집니다.

## 예시로 이해하기

> 약물 SMILES는 공개된 구조를 입력한 것이고(분자식으로 확인), 활성 값은 모두 **가상 규칙으로 만든 값**입니다. 실제 약효를 뜻하지 않습니다.

### 예시 1 — 실제 약물의 SMILES, 기술자, 지문 유사도

```python
from rdkit import Chem, DataStructs, RDLogger
from rdkit.Chem import Descriptors, Crippen, rdMolDescriptors, QED, rdFingerprintGenerator
RDLogger.DisableLog("rdApp.*")

drugs = {   # 이름: SMILES (입체 정보는 일부 생략)
    "levodopa": "N[C@@H](Cc1ccc(O)c(O)c1)C(=O)O",
    "dopamine": "NCCc1ccc(O)c(O)c1",
    "carbidopa": "CC(Cc1ccc(O)c(O)c1)(NN)C(=O)O",
    "selegiline": "C#CCN(C)C(C)Cc1ccccc1",
    "rasagiline": "C#CCN[C@@H]1CCc2ccccc21",
    "donepezil": "COc1cc2c(cc1OC)C(=O)C(CC1CCN(Cc3ccccc3)CC1)C2",
    "rivastigmine": "CCN(C)C(=O)Oc1cccc(c1)[C@H](C)N(C)C",
    "memantine": "CC12CC3CC(C)(C1)CC(N)(C3)C2",
    "caffeine": "Cn1cnc2c1c(=O)n(C)c(=O)n2C",
}
mols = {k: Chem.MolFromSmiles(s) for k, s in drugs.items()}
print(f"{'이름':<13}{'분자식':<12}{'MW':>7}{'logP':>6}{'HBD':>4}{'HBA':>4}{'TPSA':>7}{'QED':>6}")
for k, m in mols.items():
    print(f"{k:<13}{rdMolDescriptors.CalcMolFormula(m):<12}{Descriptors.MolWt(m):7.1f}"
          f"{Crippen.MolLogP(m):6.2f}{rdMolDescriptors.CalcNumHBD(m):4d}{rdMolDescriptors.CalcNumHBA(m):4d}"
          f"{rdMolDescriptors.CalcTPSA(m):7.1f}{QED.qed(m):6.2f}")

# 같은 분자, 다른 SMILES → canonical SMILES는 하나
for s in ["OC(=O)C(N)Cc1ccc(O)c(O)c1", "c1cc(O)c(O)cc1CC(N)C(O)=O"]:
    print(s, "→", Chem.MolToSmiles(Chem.MolFromSmiles(s)))
print("문법이 틀린 SMILES:", Chem.MolFromSmiles("c1ccc(cc1"))

# Morgan(ECFP4 계열) 지문과 Tanimoto 유사도
gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
fps = {k: gen.GetFingerprint(m) for k, m in mols.items()}
print("levodopa 기준 Tanimoto 유사도:")
for k in drugs:
    print(f"  {k:<13}{DataStructs.TanimotoSimilarity(fps['levodopa'], fps[k]):.2f}")
```

출력:

```text
이름           분자식              MW  logP HBD HBA   TPSA   QED
levodopa     C9H11NO4      197.2  0.05   4   4  103.8  0.51
dopamine     C8H11NO2      153.2  0.60   3   3   66.5  0.54
carbidopa    C10H14N2O4    226.2 -0.05   5   5  115.8  0.28
selegiline   C13H17N       187.3  2.18   0   1    3.2  0.65
rasagiline   C12H13N       171.2  1.90   1   1   12.0  0.67
donepezil    C24H29NO3     379.5  4.36   0   4   38.8  0.75
rivastigmine C14H22N2O2    250.3  2.76   0   3   32.8  0.82
memantine    C12H21N       179.3  2.69   1   1   26.0  0.61
caffeine     C8H10N4O2     194.2 -1.03   0   3   61.8  0.54
OC(=O)C(N)Cc1ccc(O)c(O)c1 → NC(Cc1ccc(O)c(O)c1)C(=O)O
c1cc(O)c(O)cc1CC(N)C(O)=O → NC(Cc1ccc(O)c(O)c1)C(=O)O
문법이 틀린 SMILES: None
levodopa 기준 Tanimoto 유사도:
  levodopa     1.00
  dopamine     0.45
  carbidopa    0.44
  selegiline   0.20
  rasagiline   0.08
  donepezil    0.12
  rivastigmine 0.17
  memantine    0.02
  caffeine     0.06
```

분자식이 공개 자료와 같으니 SMILES 입력은 맞습니다. levodopa와 가장 닮은 것은 dopamine, carbidopa(둘 다 카테콜 고리 공유)이고, 작용 기전이 같은 MAO-B 억제제(selegiline, rasagiline)도 구조는 거의 닮지 않았습니다. **구조 유사도는 기능 유사도가 아닙니다.** 같은 levodopa를 두 방식으로 쓴 SMILES가 한 가지 canonical SMILES로 모이고, 괄호가 닫히지 않은 문자열은 `None`이 됩니다.

### 예시 2 — 가상 QSAR: 무작위 분할 vs 골격 분할, 그리고 적용 영역

```python
import numpy as np
from rdkit import Chem, DataStructs, RDLogger
from rdkit.Chem import Crippen, rdFingerprintGenerator
from sklearn.ensemble import RandomForestRegressor
from sklearn.dummy import DummyRegressor
from sklearn.model_selection import KFold, GroupKFold, cross_val_predict
from sklearn.metrics import r2_score, mean_squared_error
RDLogger.DisableLog("rdApp.*")
rng = np.random.default_rng(0)

# (1) 단위 변환: IC50(nM) → pIC50 = -log10(IC50 [M]). 클수록 강한 활성.
for ic50_nM in [1, 10, 250, 10000]:
    print(f"IC50 {ic50_nM:>6} nM → pIC50 {-np.log10(ic50_nM * 1e-9):.2f}")

# (2) 가상 화합물 시리즈: 골격(scaffold) 6개 × 치환기 2자리. 활성은 '가상 규칙 + 잡음'.
scaffolds = {   # {a}, {b}에 치환기가 들어간다. 오른쪽 숫자는 골격 고유의 가상 활성 보정값
    "c1cc({a})ccc1C(=O)Nc1ccc({b})cc1": 0.0,
    "c1cc({a})ccc1S(=O)(=O)Nc1ccc({b})cc1": -0.8,
    "c1cc({a})ccc1CNC(=O)c1ccc({b})nc1": 0.6,
    "c1cc({a})ccc1Oc1ncc({b})cn1": 1.0,
    "c1cc({a})ccc1C1CCN(C1)c1ccc({b})cc1": -0.4,
    "c1cc({a})ccc1-c1nc2cc({b})ccc2o1": 1.4,
}
subs = ["[H]", "F", "Cl", "Br", "C", "CC", "OC", "C(F)(F)F", "C#N", "O", "N"]
gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
smiles, y, fps = [], [], []
for tpl, offset in scaffolds.items():
    for a in subs:
        for b in subs:
            m = Chem.RemoveHs(Chem.MolFromSmiles(tpl.format(a=a, b=b)))
            logp = Crippen.MolLogP(m)
            hal = sum(at.GetSymbol() in ("F", "Cl", "Br") for at in m.GetAtoms())
            act = 6.0 + offset + 0.35 * logp - 0.15 * (logp - 3.5) ** 2 + 0.2 * hal + rng.normal(0, 0.3)
            smiles.append(Chem.MolToSmiles(m)); y.append(act)
            fps.append(gen.GetFingerprint(m))
X = np.array([list(fp) for fp in fps], dtype=np.uint8)
y = np.array(y)

def murcko(smi):
    """단순화한 Bemis–Murcko 골격: 고리와 고리를 잇는 사슬만 남기고, 끝에 매달린 원자를 반복해 지운다.
    (보통은 rdkit.Chem.Scaffolds.MurckoScaffold를 쓰지만, 이 환경의 RDKit 판에서 오류가 나 직접 구현)"""
    rw = Chem.RWMol(Chem.MolFromSmiles(smi))
    while True:
        ends = [a.GetIdx() for a in rw.GetAtoms() if a.GetDegree() <= 1 and not a.IsInRing()]
        if not ends:
            break
        for i in sorted(ends, reverse=True):
            rw.RemoveAtom(i)
    m = rw.GetMol()
    for a in m.GetAtoms():          # 지운 자리 때문에 남은 수소 수 정보를 다시 계산하게 한다
        a.SetNoImplicit(False); a.SetNumExplicitHs(0)
    Chem.SanitizeMol(m)
    return Chem.MolToSmiles(m)

assert murcko("CCOc1ccc(Cl)cc1C(=O)NCc1ccccn1") == murcko("c1ccccc1C(=O)NCc1ncccc1")

# 실제 작업처럼 SMILES에서 Murcko 골격을 계산해 묶음(group) 이름으로 쓴다
scaf = [murcko(s) for s in smiles]
groups = np.unique(scaf, return_inverse=True)[1]
print("화합물", len(y), "개 | 서로 다른 Murcko 골격", groups.max() + 1, "개")

rf = RandomForestRegressor(n_estimators=300, random_state=0, n_jobs=-1)
for name, cv, g in [("무작위 5-fold", KFold(5, shuffle=True, random_state=0), None),
                    ("골격 단위 GroupKFold", GroupKFold(n_splits=6), groups)]:
    pred = cross_val_predict(rf, X, y, cv=cv, groups=g)
    base = cross_val_predict(DummyRegressor(), X, y, cv=cv, groups=g)
    print(f"{name:<20} RF: R² {r2_score(y, pred):.2f}, RMSE {np.sqrt(mean_squared_error(y, pred)):.2f}"
          f" | 평균만 답하는 기준선 RMSE {np.sqrt(mean_squared_error(y, base)):.2f}")
    if g is not None:
        scaf_pred = pred

# (3) 적용 영역: 학습 화합물과 얼마나 닮았나(최대 Tanimoto) vs 예측 오차
err = np.abs(scaf_pred - y)
maxsim = np.array([max(DataStructs.BulkTanimotoSimilarity(fps[i], [fps[j] for j in np.where(groups != groups[i])[0]]))
                   for i in range(len(y))])
cuts = np.quantile(maxsim, [0, 1/3, 2/3, 1])          # 화합물을 유사도 순으로 셋으로 나눈다
for i, name in enumerate(["낮음", "중간", "높음"]):
    sel = (maxsim >= cuts[i]) & ((maxsim < cuts[i + 1]) | (i == 2))
    print(f"학습셋과의 유사도 {name} ({cuts[i]:.2f}–{cuts[i+1]:.2f}): 화합물 {sel.sum():>3}개, 평균 절대오차 {err[sel].mean():.2f}")
```

출력:

```text
IC50      1 nM → pIC50 9.00
IC50     10 nM → pIC50 8.00
IC50    250 nM → pIC50 6.60
IC50  10000 nM → pIC50 5.00
화합물 726 개 | 서로 다른 Murcko 골격 6 개
무작위 5-fold           RF: R² 0.85, RMSE 0.38 | 평균만 답하는 기준선 RMSE 0.98
골격 단위 GroupKFold     RF: R² -0.29, RMSE 1.12 | 평균만 답하는 기준선 RMSE 1.12
학습셋과의 유사도 낮음 (0.17–0.33): 화합물 241개, 평균 절대오차 1.23
학습셋과의 유사도 중간 (0.33–0.43): 화합물 215개, 평균 절대오차 1.03
학습셋과의 유사도 높음 (0.43–0.55): 화합물 270개, 평균 절대오차 0.80
```

같은 모델·같은 데이터인데, 무작위 분할에서는 R² 0.85로 훌륭해 보이고 골격 분할에서는 평균만 답하는 기준선과 같은 수준(R² −0.29)입니다. 이 가상 데이터에서는 활성의 큰 몫이 "골격 고유의 보정값"이라, 처음 보는 골격에서는 그 몫을 알 길이 없기 때문입니다. 실제 데이터에서 차이가 이만큼 극단적이지는 않지만 방향은 늘 같습니다. 셋째 부분은 학습셋과 덜 닮은 분자일수록 오차가 커지는 것을 보여 줍니다. 예측값과 함께 "가장 닮은 학습 분자와의 유사도"를 보고하는 이유입니다. 참고로 이 환경의 RDKit 판에서 `MurckoScaffold` 함수가 오류를 내서 골격 함수를 직접 썼습니다. 보통은 `rdkit.Chem.Scaffolds.MurckoScaffold`를 씁니다.

### 예시 3 — 엉성한 생성기와 validity·uniqueness·novelty

```python
import numpy as np
from rdkit import Chem, RDLogger
from rdkit.Chem import QED
RDLogger.DisableLog("rdApp.*")
rng = np.random.default_rng(0)

# 아주 엉성한 '생성기': 학습 SMILES의 글자 하나를 무작위로 바꾸거나 지운다
train = ["NCCc1ccc(O)c(O)c1", "C#CCN(C)C(C)Cc1ccccc1", "CCN(C)C(=O)Oc1cccc(c1)C(C)N(C)C",
         "COc1cc2c(cc1OC)C(=O)C(CC1CCN(Cc3ccccc3)CC1)C2", "CC12CC3CC(C)(C1)CC(N)(C3)C2"]
alphabet = list("CNOcn()=1#")
train_canon = {Chem.MolToSmiles(Chem.MolFromSmiles(s)) for s in train}

def mutate(s):
    i = rng.integers(len(s))
    return s[:i] + (rng.choice(alphabet) if rng.random() < 0.7 else "") + s[i + 1:]

samples = [mutate(train[rng.integers(len(train))]) for _ in range(500)]
mols = [Chem.MolFromSmiles(s) for s in samples]
valid = [Chem.MolToSmiles(m) for m in mols if m is not None]
unique = set(valid)
novel = unique - train_canon
print(f"생성 500개 → 유효(validity) {len(valid) / 500:.0%}, "
      f"유효 중 고유(uniqueness) {len(unique) / len(valid):.0%}, "
      f"고유 중 새로움(novelty) {len(novel) / len(unique):.0%}")
q = sorted(((QED.qed(Chem.MolFromSmiles(s)), s) for s in novel), reverse=True)[:3]
print("QED가 높은 새 분자 3개:")
for score, s in q:
    print(f"  {score:.2f}  {s}")
```

출력:

```text
생성 500개 → 유효(validity) 23%, 유효 중 고유(uniqueness) 43%, 고유 중 새로움(novelty) 90%
QED가 높은 새 분자 3개:
  0.87  CCN(C)C(=O)Oc1cccc(C(C)NC)c1
  0.87  COc1cc2c(cc1O)CC(CC1CCN(Cc3ccccc3)CC1)C2=O
  0.87  COc1cc2c(cc1O)C(=O)C(CC1CCN(Cc3ccccc3)CC1)C2
```

글자를 무작위로 바꾸면 대부분 문법이 깨집니다(유효 23%). 유효한 것 중 90%가 "새롭다"지만, QED 상위 분자를 보면 rivastigmine·donepezil에서 메틸 하나를 떼거나 위치를 옮긴 것입니다. novelty가 높다는 것이 의미 있게 새롭다는 뜻은 아니고, QED가 높다는 것이 활성이나 안전성을 뜻하지도 않습니다.

## 직접 해보기

1. `notebooks/advanced/G/G4_molecules_qsar.ipynb`를 만들고 예시 1–3을 실행합니다.
2. **유사도 행렬.** 예시 1의 아홉 분자로 9×9 Tanimoto 행렬을 만들고 heatmap으로 그립니다(Day 14). 기전이 같은 약끼리 묶이는지 봅니다.
3. **pIC50 부호 실수 찾기.** 동료가 `pIC50 = np.log10(ic50_nM * 1e-9)`로 계산했습니다. 결과가 어떻게 보일지, 어떻게 알아챌 수 있을지 한 줄로 씁니다.
4. **분할 비교표.** 예시 2의 두 줄과 기준선을 `reports/advanced/G4_split_comparison.md`에 표로 옮기고, "이 데이터에서 새 골격 예측은 기준선보다 낫지 않다"처럼 결론을 한 문장으로 씁니다.
5. **골격 효과 줄이기.** `scaffolds`의 보정값을 모두 0으로 바꿔 다시 실행합니다. 골격 분할 성능이 어떻게 변하는지 보고, 그 이유를 적습니다.
6. (선택, 네트워크 필요) ChEMBL 웹사이트(<https://www.ebi.ac.uk/chembl/>)에서 관심 표적(예: BACE1)을 검색해 활성 기록의 열(측정 유형, 관계 기호, 단위)을 눈으로만 확인합니다. 레코드 수 같은 숫자는 직접 본 것만 적습니다.

⚠️ **흔한 오류 1 — canonical 처리 없이 중복 제거.** 같은 분자가 다른 SMILES로 두 번 들어가 학습셋과 평가셋에 하나씩 갈 수 있습니다. 중복 제거 전에 반드시 `Chem.MolToSmiles(Chem.MolFromSmiles(s))`로 통일합니다.

⚠️ **흔한 오류 2 — 회귀 결과를 accuracy로 보고.** 활성 값 예측은 회귀이므로 R²와 RMSE(pIC50 단위)로 쓰고, 항상 기준선과 나란히 둡니다.

## 퀴즈

**1.** IC50 = 50 nM의 pIC50은? (단답, 소수 첫째 자리)

<details><summary>정답 보기</summary>

약 7.3입니다. 50 nM = 5 × 10⁻⁸ M이고 −log10(5 × 10⁻⁸) = 8 − log10(5) ≈ 8 − 0.70 = 7.30입니다.

</details>

**2.** 무작위 분할의 QSAR 성능이 골격 분할보다 훨씬 좋게 나오는 주된 이유는?

(a) 무작위 분할이 표본을 더 많이 쓴다 (b) 평가 분자의 유사체가 학습셋에 있어 사실상 답을 베낄 수 있다 (c) 랜덤 포레스트가 무작위성을 좋아한다 (d) 골격 분할은 잘못된 방법이다

<details><summary>정답 보기</summary>

(b). 같은 시리즈의 형제 분자가 양쪽에 나뉘면 모델은 가까운 형제의 값을 맞히는 것만으로 높은 점수를 얻습니다. 새 골격에 대한 예측력을 알려면 골격 단위로 나눠야 합니다(Day 33 GroupKFold와 같은 논리).

</details>

**3.** `>10000 nM`로 기록된 활성을 10000으로 바꿔 회귀에 넣으면 생기는 문제는? (단답)

<details><summary>정답 보기</summary>

실제로는 10000 nM보다 약하다는(값을 모른다는) 검열 정보인데, 정확히 10000인 것처럼 다뤄 약한 분자들의 값을 한 점에 몰아 버립니다. 모델이 비활성 쪽을 잘못 배우고 오차 계산도 왜곡됩니다. 따로 표시하거나 분류 문제로 바꾸는 식으로 다룹니다.

</details>

**4.** 생성 모델이 validity 99%, uniqueness 98%, novelty 95%를 보고했습니다. 이것으로 알 수 있는 것은?

(a) 생성 분자가 활성이 있다 (b) 생성 분자가 합성 가능하다 (c) 문법상 맞고 서로 다르며 학습셋에 없는 분자를 많이 만든다 (d) 신약 후보가 나왔다

<details><summary>정답 보기</summary>

(c). 세 지표는 생성물의 형식적 성질만 봅니다. 합성 가능성, 활성, 안전성은 별도의 예측과 결국 실험이 필요합니다.

</details>

**5.** levodopa와 rasagiline의 Tanimoto 유사도는 0.08로 낮지만 둘 다 PD에 씁니다. 여기서 얻을 교훈은? (단답)

<details><summary>정답 보기</summary>

구조 유사도는 기능(적응증, 기전) 유사도와 다릅니다. 지문 유사도 기반 검색은 "닮은 구조"를 찾을 뿐, 다른 구조로 같은 효과를 내는 분자는 놓칠 수 있습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 아홉 분자의 기술자와 유사도 행렬을 만들었다.
- [ ] pIC50 변환과 부호 실수를 설명할 수 있다.
- [ ] 무작위 vs 골격 분할 비교표와 결론 문장을 `reports/advanced/G4_split_comparison.md`에 썼다.
- [ ] validity·uniqueness·novelty가 말해 주지 않는 것을 적었다.

## 더 읽을거리
- Weininger D. SMILES, a chemical language and information system. *J Chem Inf Comput Sci.* 1988;28:31–36. doi:[10.1021/ci00057a005](https://doi.org/10.1021/ci00057a005)
- Rogers D, Hahn M. Extended-connectivity fingerprints. *J Chem Inf Model.* 2010;50:742–754. doi:[10.1021/ci100050t](https://doi.org/10.1021/ci100050t)
- Bemis GW, Murcko MA. The properties of known drugs. 1. Molecular frameworks. *J Med Chem.* 1996;39:2887–2893. doi:[10.1021/jm9602928](https://doi.org/10.1021/jm9602928)
- Lipinski CA, et al. *Adv Drug Deliv Rev.* 2001;46:3–26. doi:[10.1016/S0169-409X(00)00129-0](https://doi.org/10.1016/S0169-409X%2800%2900129-0) · Bickerton GR, et al. Quantifying the chemical beauty of drugs. *Nat Chem.* 2012;4:90–98. doi:[10.1038/nchem.1243](https://doi.org/10.1038/nchem.1243)
- Wu Z, et al. MoleculeNet. *Chem Sci.* 2018;9:513–530. doi:[10.1039/C7SC02664A](https://doi.org/10.1039/C7SC02664A) · Yang K, et al. (Chemprop) *J Chem Inf Model.* 2019;59:3370–3388. doi:[10.1021/acs.jcim.9b00237](https://doi.org/10.1021/acs.jcim.9b00237)
- Polykovskiy D, et al. MOSES. *Front Pharmacol.* 2020;11:565644. doi:[10.3389/fphar.2020.565644](https://doi.org/10.3389/fphar.2020.565644) · Brown N, et al. GuacaMol. *J Chem Inf Model.* 2019;59:1096–1108. doi:[10.1021/acs.jcim.8b00839](https://doi.org/10.1021/acs.jcim.8b00839) · Gao W, Coley CW. The synthesizability of molecules proposed by generative models. *J Chem Inf Model.* 2020;60:5714–5723. doi:[10.1021/acs.jcim.0c00174](https://doi.org/10.1021/acs.jcim.0c00174)
- van Tilborg D, Alenicheva A, Grisoni F. Exposing the limitations of molecular machine learning with activity cliffs. *J Chem Inf Model.* 2022;62:5938–5951. doi:[10.1021/acs.jcim.2c01073](https://doi.org/10.1021/acs.jcim.2c01073)
- Chen L, et al. Hidden bias in the DUD-E dataset leads to misleading performance of deep learning in structure-based virtual screening. *PLoS One.* 2019;14:e0220113. doi:[10.1371/journal.pone.0220113](https://doi.org/10.1371/journal.pone.0220113) · Tran-Nguyen VK, Jacquemard C, Rognan D. LIT-PCBA: an unbiased data set for machine learning and virtual screening. *J Chem Inf Model.* 2020;60:4263–4273. doi:[10.1021/acs.jcim.0c00155](https://doi.org/10.1021/acs.jcim.0c00155)
- Preuer K, et al. Fréchet ChemNet Distance. *J Chem Inf Model.* 2018;58:1736–1741. doi:[10.1021/acs.jcim.8b00234](https://doi.org/10.1021/acs.jcim.8b00234) · Krenn M, et al. Self-referencing embedded strings (SELFIES). *Mach Learn: Sci Technol.* 2020;1:045024. doi:[10.1088/2632-2153/aba947](https://doi.org/10.1088/2632-2153/aba947)
- Gaulton A, et al. The ChEMBL database in 2017. *Nucleic Acids Res.* 2017;45:D945–D954. doi:[10.1093/nar/gkw1074](https://doi.org/10.1093/nar/gkw1074) · ChEMBL: <https://www.ebi.ac.uk/chembl/> · RDKit: <https://www.rdkit.org/>
- Stokes JM, et al. A deep learning approach to antibiotic discovery. *Cell.* 2020;180:688–702. doi:[10.1016/j.cell.2020.01.021](https://doi.org/10.1016/j.cell.2020.01.021) · Ren F, et al. A small-molecule TNIK inhibitor targets fibrosis in preclinical and clinical models. *Nat Biotechnol.* 2025;43:63–75 (온라인 공개 2024). doi:[10.1038/s41587-024-02143-0](https://doi.org/10.1038/s41587-024-02143-0) · Jayatunga MKP, et al. How successful are AI-discovered drugs in clinical trials? *Drug Discov Today.* 2024;29:104009. doi:[10.1016/j.drudis.2024.104009](https://doi.org/10.1016/j.drudis.2024.104009)

---
[← 이전](day-G3.md) · [코스 지도](../../../README.md) · [다음 →](day-G5.md)
