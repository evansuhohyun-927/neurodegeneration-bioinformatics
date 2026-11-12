# Day G2 — 생성 모델의 원리: 분포를 배우고 새 점을 뽑기

> **주차:** 심화 파트 G — AI·생성형 AI in 바이오메디컬 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/G/G2_generative_intuition.ipynb` + 네 가지 생성 모델 비교 메모(노트북 마지막 셀)
>
> **먼저 끝내 둘 레슨:** [Day G1](day-G1.md), [Day 14 — PCA와 heatmap](../../week-2/day-14.md), [Day 23 — 시계열 기초](../../week-4/day-23.md).

## 오늘의 목표
- "잠재 공간(latent space)에 압축 → 다시 펼치기"를 PCA로 직접 해 보고, VAE가 그것을 어떻게 확장하는지 설명할 수 있다.
- GAN, diffusion, 자기회귀(transformer) 모델이 각각 어떤 방식으로 새 데이터를 만드는지 한두 문장으로 비교할 수 있다.
- 생성 결과를 "실제와 닮았는가"와 "실제를 복사했는가" 두 방향으로 점검할 수 있다.

## 🎬 영상으로 먼저 보기

- [Variational Autoencoders — Arxiv Insights](https://www.youtube.com/watch?v=9zKuYvjFFS8) (15:05)
- **무엇에 주목할까:** 보통 오토인코더와 VAE의 차이를 보세요. 잠재 공간의 각 점을 "하나의 좌표"가 아니라 "작은 구름(평균과 분산)"으로 만드는 이유가 무엇인지, 그 덕분에 잠재 공간 아무 데서나 뽑아도 그럴듯한 결과가 나온다는 점이 핵심입니다. 수식은 넘겨도 됩니다.

- [What are Diffusion Models? — Ari Seff](https://www.youtube.com/watch?v=fbLgFrlTnGU) (15:28)
- **무엇에 주목할까:** 앞 과정(잡음을 조금씩 섞기)은 계산만 하면 되고, 학습하는 것은 뒤 과정(잡음을 한 단계 걷어내기)뿐이라는 점에 집중하세요. 예시 2에서 앞 과정을 numpy로 직접 돌려 봅니다.

## 개념 설명

### 생성 모델의 공통 목표

모든 생성 모델은 같은 일을 하려 합니다. 실제 데이터가 나오는 보이지 않는 분포를 흉내 내어, 그 분포에서 **새 표본을 뽑는** 것입니다. G1의 가우시안 나이브 베이즈는 분포를 "변수마다 정규분포 하나"로 너무 단순하게 그렸습니다. 영상 한 장은 수십만 픽셀, 문장은 단어 수천 개의 조합이라 정규분포 몇 개로는 그릴 수 없습니다. 그래서 신경망으로 분포를 표현하는데, 그 방법이 크게 네 갈래입니다.

| 계열 | 새 데이터를 만드는 방식 | 강점 | 약점 |
|---|---|---|---|
| VAE (variational autoencoder) | 작은 잠재 공간에서 점을 뽑아 디코더로 펼친다 | 잠재 공간이 매끄러워 보간·탐색이 쉽다 | 결과가 흐릿해지기 쉽다 |
| GAN (generative adversarial network) | 생성기가 잡음을 데이터로 바꾸고, 판별기가 진짜/가짜를 가린다 | 선명한 영상 | 학습이 불안정, 일부 모양만 반복(mode collapse) |
| Diffusion | 순수 잡음에서 시작해 잡음을 한 단계씩 걷어낸다 | 품질과 다양성이 높다 | 생성에 여러 단계가 필요해 느리다 |
| 자기회귀(autoregressive), transformer | 앞 토큰을 보고 다음 토큰의 확률을 계산해 하나씩 뽑는다 | 문장·서열·SMILES처럼 순서 있는 데이터에 자연스럽다 | 한 번 틀린 토큰이 뒤로 이어진다 |

정규화 흐름(normalizing flow)처럼 확률을 정확히 계산하는 계열도 있지만, 바이오메디컬 응용에서 가장 자주 보는 것은 위 네 가지입니다.

### 오토인코더와 VAE: 압축했다 다시 펼치기

**오토인코더(autoencoder)** 는 입력을 작은 숫자 묶음(잠재 벡터)으로 줄이는 **인코더**와, 그것을 다시 원래 크기로 펼치는 **디코더**를 함께 학습합니다. 정답은 입력 자신입니다(자기지도). 100칸짜리 보행 파형을 숫자 3개로 줄였다가 복원할 수 있다면, 그 3개가 파형의 핵심(진폭, 위상, 기울기 등)을 담고 있다는 뜻입니다.

사실 PCA가 가장 단순한 오토인코더입니다. 주성분 점수를 구하는 것이 인코더, 점수에 주성분을 곱해 되돌리는 것이 디코더이고, 둘 다 직선(선형) 변환입니다. 신경망 오토인코더는 이 변환을 곡선으로 바꿔 더 복잡한 모양을 담습니다.

압축만으로는 생성이 되지 않습니다. 잠재 공간 아무 곳이나 찍었을 때 디코더가 엉뚱한 것을 내놓으면 쓸모가 없습니다. **VAE**는 인코더가 각 입력을 점 하나 대신 평균과 분산을 가진 작은 구름으로 내놓게 하고, 이 구름들이 표준정규분포 근처에 모이도록 벌점을 줍니다. 그러면 표준정규분포에서 아무 점이나 뽑아도 디코더가 그럴듯한 결과를 냅니다. 오늘 예시 1에서는 PCA 잠재 점수의 평균·공분산에서 새 점을 뽑아 같은 발상을 흉내 냅니다.

### GAN: 위조범과 감정사

GAN은 두 신경망이 경쟁합니다. **생성기(generator)** 는 무작위 잡음을 받아 가짜 데이터를 만들고, **판별기(discriminator)** 는 진짜와 가짜를 가립니다. 위조범이 지폐를 만들고 감정사가 가려내는 게임을 반복하면 둘 다 실력이 늘어, 결국 위조지폐가 진짜와 구별하기 어려워집니다. 판별기는 학습이 끝나면 버리고 생성기만 씁니다. 의료 영상 증강에 많이 쓰였고, 조건을 주는 cGAN(예: "종양 있음" 조건), 두 영상 영역을 서로 바꾸는 CycleGAN(예: MRI ↔ CT 스타일), 해상도를 높이는 SRGAN 같은 변형이 있습니다. 약점은 생성기가 판별기를 속이기 쉬운 몇 가지 모양만 계속 만드는 **mode collapse**입니다. 다양성이 사라지면 증강 데이터로서 가치가 줄어듭니다.

### Diffusion과 transformer: 한 단계씩 만들기

**Diffusion 모델**은 데이터에 잡음을 조금씩 섞어 결국 순수 잡음으로 만드는 앞 과정을 정해 두고, 신경망이 "이 단계에서 섞인 잡음이 무엇인지"를 맞히게 학습합니다. 생성할 때는 순수 잡음에서 출발해 신경망이 추정한 잡음을 한 단계씩 빼 나갑니다. 흐릿한 사진을 조금씩 선명하게 다듬는 화가와 비슷합니다. 현재 영상 생성의 주류이고 의료 영상 합성·재구성 연구도 빠르게 늘었습니다.

**자기회귀 모델**은 순서 있는 데이터를 앞에서부터 한 토큰씩 만듭니다. "MKT 다음에는 A가 올 확률 60%, L이 30%…"처럼 다음 토큰의 확률을 계산하고 하나를 뽑아 붙입니다. **Transformer**는 이 "다음 토큰 확률"을 계산할 때 앞의 모든 토큰을 한꺼번에 보고 어떤 토큰에 주목할지(attention) 스스로 정하는 구조입니다. 문장(LLM), 단백질 서열, SMILES 분자 문자열 모두 이렇게 생성할 수 있습니다. 예시 2의 두 번째 부분은 바로 앞 글자 하나만 보는 가장 단순한 자기회귀 모델입니다. 앞을 한 글자만 기억하니 엉뚱한 길이의 서열이 나오는데, transformer가 긴 문맥을 보는 것이 왜 중요한지 보여 줍니다.

### 생성 결과는 두 방향으로 점검한다

생성물은 "실제와 충분히 닮았는가(충실도, fidelity)"와 "실제를 그대로 복사하지 않았는가(새로움, novelty·프라이버시)"를 함께 봐야 합니다. 학습 데이터를 통째로 외워 그대로 내놓는 모델은 충실도 점수가 완벽하지만 쓸모가 없고, 환자 데이터라면 개인정보를 그대로 흘립니다. 반대로 실제와 너무 다르면 엉뚱한 데이터입니다. 가장 간단한 점검은 **생성물마다 가장 가까운 실제 데이터와의 거리**를 재는 것입니다. 0에 가까운 값이 많으면 복사, 실제끼리의 거리보다 훨씬 크면 엉뚱함입니다. G3에서 이 점검을 표 데이터에 체계적으로 적용합니다.

> **참고 문헌(원 논문):** Kingma & Welling, Auto-Encoding Variational Bayes (2013), [arXiv:1312.6114](https://arxiv.org/abs/1312.6114) · Goodfellow et al., Generative Adversarial Networks (2014), [arXiv:1406.2661](https://arxiv.org/abs/1406.2661) · Ho, Jain & Abbeel, Denoising Diffusion Probabilistic Models (2020), [arXiv:2006.11239](https://arxiv.org/abs/2006.11239) · Vaswani et al., Attention Is All You Need (2017), [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)

## 예시로 이해하기

> 모든 데이터는 코드 안에서 만드는 **가상 데이터**입니다. 딥러닝 프레임워크(PyTorch 등)가 이 환경에 없으므로, 신경망 대신 PCA·numpy로 같은 발상을 흉내 냅니다.

### 예시 1 — PCA를 "선형 오토인코더"로 써서 새 신호 만들기

```python
import numpy as np
from sklearn.decomposition import PCA

rng = np.random.default_rng(0)
# 가상 신호 80개: 진폭·위상·기울기가 조금씩 다른 걸음 주기 파형(100칸) + 잡음
t = np.linspace(0, 2 * np.pi, 100)
amp = rng.normal(1.0, 0.15, 80)
phase = rng.normal(0.0, 0.3, 80)
slope = rng.normal(0.0, 0.1, 80)
X = amp[:, None] * np.sin(t + phase[:, None]) + slope[:, None] * t / (2 * np.pi)
X = X + rng.normal(0, 0.05, X.shape)

# 인코더 = 100칸 → 3개 숫자(잠재 공간), 디코더 = 3개 숫자 → 100칸
pca = PCA(n_components=3).fit(X)
Z = pca.transform(X)
X_rec = pca.inverse_transform(Z)
print("설명된 분산 비율:", np.round(pca.explained_variance_ratio_, 3))
print("복원 오차(RMSE):", round(float(np.sqrt(((X - X_rec) ** 2).mean())), 4))

# 생성: 잠재 공간의 분포(평균·공분산)를 추정해 새 점을 뽑고 디코더로 펼친다
Z_new = rng.multivariate_normal(Z.mean(axis=0), np.cov(Z.T), size=5)
X_new = pca.inverse_transform(Z_new)
print("실제 신호 최댓값 범위:", np.round([X.max(1).min(), X.max(1).max()], 2))
print("새로 만든 신호 5개의 최댓값:", np.round(X_new.max(1), 2))

# 가장 가까운 실제 신호와의 거리: 0에 가까우면 '복사', 너무 크면 '엉뚱함'
d = np.sqrt(((X_new[:, None, :] - X[None, :, :]) ** 2).mean(-1)).min(1)
print("새 신호 → 가장 가까운 실제 신호 RMSE:", np.round(d, 3))
```

출력:

```text
설명된 분산 비율: [0.706 0.208 0.047]
복원 오차(RMSE): 0.0481
실제 신호 최댓값 범위: [0.73 1.37]
새로 만든 신호 5개의 최댓값: [1.15 1.06 1.37 1.08 0.89]
새 신호 → 가장 가까운 실제 신호 RMSE: [0.078 0.072 0.083 0.059 0.096]
```

100칸 파형을 숫자 3개로 줄였다 되돌렸는데 복원 오차(0.048)가 처음에 넣은 잡음 크기(0.05)와 비슷합니다. 즉 3개 숫자가 신호의 구조를 거의 다 담았고, 잃은 것은 대부분 잡음입니다. 잠재 공간에서 뽑은 새 신호는 최댓값이 실제 범위 안에 있고, 가장 가까운 실제 신호와도 0이 아닌 적당한 거리를 둡니다. 복사도 엉뚱함도 아닌 셈입니다. 이것이 VAE가 하는 일의 뼈대입니다. 다만 PCA는 직선 변환이라 "진폭이 클 때만 모양이 바뀌는" 식의 곡선 관계는 담지 못하고, 그 부분을 신경망이 맡습니다.

### 예시 2 — 확산의 앞 과정과 가장 단순한 자기회귀 생성

```python
import numpy as np
from collections import Counter, defaultdict

rng = np.random.default_rng(0)
# (1) 확산 모델의 '앞 과정': 원래 신호에 잡음을 조금씩 섞으면 결국 순수 잡음이 된다
t = np.linspace(0, 2 * np.pi, 100)
x0 = np.sin(t)
print("단계  원 신호와의 상관")
x = x0.copy()
for step in range(1, 51):
    beta = 0.05                                    # 한 단계에 섞는 잡음의 양
    x = np.sqrt(1 - beta) * x + np.sqrt(beta) * rng.normal(size=x.shape)
    if step in (1, 5, 10, 25, 50):
        print(f"{step:>3}   {np.corrcoef(x0, x)[0, 1]:.3f}")
# 확산 모델은 이 과정을 '거꾸로' 한 단계씩 되돌리는 법을 신경망으로 배운다(여기서는 생략).

# (2) 자기회귀(autoregressive) 생성: 앞 글자를 보고 다음 글자를 확률로 고른다
train = ["MKTAYIAK", "MKTLLVAG", "MKSAYLAK", "MKTAYLVG", "MRTAYIAK", "MKTAFIAG"]  # 가상 펩타이드
nxt = defaultdict(Counter)
for s in train:
    s = "^" + s + "$"                              # 시작·끝 표시
    for a, b in zip(s, s[1:]):
        nxt[a][b] += 1

def sample(max_len=12):
    out, cur = "", "^"
    while len(out) < max_len:
        chars, counts = zip(*nxt[cur].items())
        cur = rng.choice(chars, p=np.array(counts) / sum(counts))
        if cur == "$":
            break
        out += cur
    return out

gen = [sample() for _ in range(8)]
print("생성된 서열:", gen)
print("학습 서열을 그대로 복사한 개수:", sum(g in train for g in gen), "/", len(gen))
```

출력:

```text
단계  원 신호와의 상관
  1   0.952
  5   0.819
 10   0.670
 25   0.539
 50   0.212
생성된 서열: ['MKTAKTAFIAYI', 'MKTAKTLLVAYL', 'MK', 'MKTAYIAYLAFI', 'MKTAYIAFIAYL', 'MKTAK', 'MK', 'MK']
학습 서열을 그대로 복사한 개수: 0 / 8
```

(1) 단계가 늘수록 원 신호와의 상관이 줄어 50단계 뒤에는 거의 잡음입니다. 실제 diffusion 모델은 수백~천 단계를 쓰고, 신경망이 각 단계에서 "방금 섞인 잡음"을 맞히도록 학습합니다. 생성할 때는 이 과정을 거꾸로 밟습니다.

(2) 앞 글자 하나만 보는 모델은 학습 서열에 없던 조합을 만들지만, 길이가 들쭉날쭉합니다. `K` 다음에 서열이 끝나는 경우(`...AK$`)를 배운 탓에 `MK`에서 바로 끝나 버리기도 합니다. 문맥을 한 글자밖에 기억하지 못해서 생기는 일입니다. Transformer는 앞의 모든 글자를 보고 판단하므로 이런 실수가 줄어듭니다. 이 원리는 G4(SMILES 생성), G5(단백질 서열), G6(LLM)에서 그대로 다시 나옵니다.

### 예시 3 — PyTorch로 쓴 아주 작은 VAE

> PyTorch가 필요합니다. 과정의 conda 환경이라면 `conda install -n neurobio -c conda-forge pytorch`로 설치합니다. 출력은 PyTorch 2.14(conda-forge)에서 실행한 그대로입니다.

```python
import torch, torch.nn as nn

class TinyVAE(nn.Module):
    def __init__(self, d_in=100, d_z=3):
        super().__init__()
        self.enc = nn.Sequential(nn.Linear(d_in, 32), nn.ReLU())
        self.mu, self.logvar = nn.Linear(32, d_z), nn.Linear(32, d_z)    # 점 대신 '구름'
        self.dec = nn.Sequential(nn.Linear(d_z, 32), nn.ReLU(), nn.Linear(32, d_in))

    def forward(self, x):
        h = self.enc(x)
        mu, logvar = self.mu(h), self.logvar(h)
        z = mu + torch.randn_like(mu) * torch.exp(0.5 * logvar)          # 구름에서 한 점 뽑기
        return self.dec(z), mu, logvar

def vae_loss(x, x_hat, mu, logvar):
    recon = ((x - x_hat) ** 2).sum(dim=1).mean()                        # 복원 오차
    kl = (-0.5 * (1 + logvar - mu ** 2 - logvar.exp()).sum(dim=1)).mean()  # 구름을 표준정규 쪽으로
    return recon + kl

# 사용 예: 가상 데이터 300개 × 100차원(3개 잠재 요인 + 잡음)으로 200번 학습
torch.manual_seed(0)
x = torch.randn(300, 3) @ torch.randn(3, 100) + 0.1 * torch.randn(300, 100)
vae = TinyVAE()
opt = torch.optim.Adam(vae.parameters(), lr=1e-2)
for step in range(201):
    x_hat, mu, logvar = vae(x)
    loss = vae_loss(x, x_hat, mu, logvar)
    opt.zero_grad(); loss.backward(); opt.step()
    if step % 100 == 0:
        print(f"step {step:3d}  loss {loss.item():.1f}")
with torch.no_grad():
    new = vae.dec(torch.randn(5, 3))       # 잠재 공간에서 5점을 뽑아 새 샘플 만들기
print(new.shape)
```

출력:

```text
step   0  loss 270.6
step 100  loss 12.7
step 200  loss 10.8
torch.Size([5, 100])
```

손실이 줄어드는 것은 "학습이 된다"는 뜻일 뿐, 만든 샘플이 쓸 만하다는 뜻은 아닙니다. 새 샘플의 품질은 G3의 방법(실제 데이터와 분포 비교, 기억해 베낀 샘플이 없는지 확인)으로 따로 평가합니다.

⚠️ **설치 중 흔한 오류 — `OMP: Error #15: Initializing libomp.dylib, but found libomp.dylib already initialized`.** conda 환경에 PyTorch를 `pip`로 설치하면, conda가 깐 numpy·scikit-learn과 PyTorch가 서로 다른 OpenMP 라이브러리를 들고 와서 `import torch`만으로도 이 오류가 납니다(이 레슨을 쓸 때 실제로 겪었습니다). `pip uninstall torch` 뒤 `conda install -c conda-forge pytorch`로 다시 설치하면 해결됩니다. 오류 메시지가 권하는 `KMP_DUPLICATE_LIB_OK=TRUE`는 결과가 조용히 틀어질 수 있어 쓰지 않습니다.

예시 1과 비교하면, 인코더·디코더가 `nn.Linear` + 곡선 함수(`ReLU`)로 바뀌었고, 잠재 공간을 정규분포 근처로 모으는 `kl` 벌점이 추가된 것이 전부입니다.

## 직접 해보기

1. `notebooks/advanced/G/G2_generative_intuition.ipynb`를 만들고 예시 1과 2를 실행합니다.
2. **잠재 차원 바꾸기.** 예시 1에서 `n_components`를 1, 2, 3, 10으로 바꾸며 복원 오차를 적습니다. 어디서부터 오차가 잡음 크기(0.05) 근처에서 더 줄지 않는지 찾습니다. 그 이상의 차원은 잡음을 외우는 데 쓰입니다.
3. **복사하는 생성기 만들기.** `Z_new = Z[:5]`(실제 점수를 그대로 사용)로 바꾸고 마지막 줄의 거리를 봅니다. 거리가 잡음 수준까지 작아집니다. "충실도는 완벽한데 새것은 없는" 상태입니다.
4. **확산 속도.** 예시 2의 `beta`를 0.01과 0.2로 바꿔 상관이 0.2 아래로 떨어지는 단계를 비교합니다.
5. **문맥 늘리기(도전).** 예시 2의 자기회귀 모델을 "앞 두 글자 → 다음 글자"로 바꿔 봅니다(`nxt[s[i-2:i]]`). 생성 서열의 길이가 학습 서열(8글자)에 더 가까워지는지, 학습 서열을 복사한 비율은 어떻게 변하는지 적습니다. 문맥을 늘릴수록 복사가 늘어나는 것은 작은 데이터에서 피할 수 없는 맞바꿈입니다.
6. 노트북 마지막 셀에 개념 설명의 네 계열 표를 내 말로 한 줄씩 다시 적습니다.

⚠️ **흔한 오류 1 — 잠재 공간 밖에서 뽑기.** `Z_new`를 실제 점수 범위보다 훨씬 큰 분산으로 뽑으면 실제에 없는 진폭의 파형이 나옵니다. 생성 모델이 "상상"하는 범위는 학습 데이터가 덮은 범위까지입니다.

⚠️ **흔한 오류 2 — 복원이 잘 된다 = 생성이 잘 된다고 착각.** 잠재 차원을 크게 하면 복원 오차는 계속 줄지만, 잠재 공간이 듬성듬성해져 새로 뽑은 점이 엉뚱해지기 쉽습니다. 복원과 생성은 따로 점검합니다.

## 퀴즈

**1.** PCA를 오토인코더로 볼 때 인코더와 디코더는 각각 무엇인가요? (단답)

<details><summary>정답 보기</summary>

인코더는 데이터를 주성분 점수로 바꾸는 것(`transform`), 디코더는 점수에 주성분을 곱해 원래 공간으로 되돌리는 것(`inverse_transform`)입니다. 둘 다 선형 변환이라는 점이 신경망 오토인코더와 다릅니다.

</details>

**2.** GAN에서 학습이 끝난 뒤 실제로 사용하는 것은?

(a) 판별기 (b) 생성기 (c) 둘 다 (d) 잠재 공간의 평균

<details><summary>정답 보기</summary>

(b). 판별기는 생성기를 훈련시키는 감정사 역할이고, 새 데이터를 만드는 것은 생성기입니다.

</details>

**3.** Diffusion 모델에서 신경망이 학습하는 것은?

(a) 데이터에 잡음을 섞는 방법 (b) 각 단계에서 섞인 잡음을 추정해 걷어내는 방법 (c) 진짜/가짜 판별 (d) 다음 토큰의 확률

<details><summary>정답 보기</summary>

(b). 잡음을 섞는 앞 과정은 미리 정한 공식이라 배울 것이 없습니다. 신경망은 거꾸로 잡음을 한 단계씩 제거하는 법을 배웁니다.

</details>

**4.** 어떤 생성 모델의 결과가 학습 데이터 각 행과 거의 똑같았습니다(가장 가까운 거리 ≈ 0). 충실도 지표는 아주 좋게 나왔습니다. 무엇이 문제인가요? (단답)

<details><summary>정답 보기</summary>

모델이 학습 데이터를 외워 복사한 것입니다. 새로운 정보가 없어 증강 가치가 없고, 환자 데이터라면 개인 기록이 그대로 새어 나가는 프라이버시 문제가 됩니다. 충실도와 함께 가장 가까운 실제 데이터와의 거리를 봐야 하는 이유입니다.

</details>

**5.** SMILES 문자열이나 단백질 서열처럼 순서가 있는 데이터를 생성할 때 가장 자연스러운 계열은?

(a) GAN (b) 자기회귀(transformer) (c) PCA (d) k-means

<details><summary>정답 보기</summary>

(b). 앞 토큰들을 보고 다음 토큰의 확률을 계산해 하나씩 이어 붙이는 방식이 순서 있는 데이터에 그대로 맞습니다. 다른 계열도 쓸 수는 있지만 문자열을 다루려면 변환이 더 필요합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 잠재 차원을 바꾸며 복원 오차가 잡음 수준에서 멈추는 지점을 찾았다.
- [ ] "복사하는 생성기"에서 가장 가까운 거리가 잡음 수준으로 줄어드는 것을 확인했다.
- [ ] 확산 앞 과정에서 `beta`에 따라 신호가 사라지는 속도를 비교했다.
- [ ] 네 생성 계열을 내 말로 한 줄씩 정리했다.

## 더 읽을거리
- 위 "참고 문헌(원 논문)"의 네 논문.
- Gómez-Bombarelli R, et al. Automatic chemical design using a data-driven continuous representation of molecules. *ACS Cent Sci.* 2018;4:268–276. doi:[10.1021/acscentsci.7b00572](https://doi.org/10.1021/acscentsci.7b00572) — VAE 잠재 공간에서 분자를 탐색한 초기 연구(G4와 연결).
- Kazerouni A, et al. Diffusion models in medical imaging: a comprehensive survey. *Med Image Anal.* 2023;88:102846. doi:[10.1016/j.media.2023.102846](https://doi.org/10.1016/j.media.2023.102846)

---
[← 이전](day-G1.md) · [코스 지도](../../../README.md) · [다음 →](day-G3.md)
