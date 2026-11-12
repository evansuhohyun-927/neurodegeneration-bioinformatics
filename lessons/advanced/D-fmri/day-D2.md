# Day D2 — 전처리와 QC: slice timing, 움직임, 왜곡, smoothing

> **주차:** 심화 파트 D — fMRI 데이터 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/D/D2_preprocessing_qc.ipynb`, `figures/advanced/D/D2_framewise_displacement.png`
>
> **먼저 끝내 둘 레슨:** Day D1, Day 13 (전처리와 QC의 일반 원칙), Day 23 (샘플링 주파수, 이동 평균).

## 오늘의 목표
- 슬라이스 획득 시각 차이, 머리 움직임, 자기장 왜곡이 자료에 어떤 흔적을 남기는지 설명할 수 있다.
- 움직임 추정치로 framewise displacement를 계산하고, 문제 시점을 처리하는 선택지를 비교할 수 있다.
- smoothing의 크기(FWHM)를 고르는 근거를 말하고, 그 대가를 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [Principles of fMRI Part 1, Module 13: Pre-processing I — Principles of fMRI](https://www.youtube.com/watch?v=Qc3rRaJWOc4) (10:18)
- **무엇에 주목할까:** 전처리 단계들이 어떤 순서로 이어지고, 각 단계가 무엇을 "고친다고 가정하는지"에 집중하세요. 순서가 바뀌면 왜 결과가 달라지는지가 오늘 개념 설명의 핵심입니다.

- [Principles of fMRI Part 1, Module 14: Pre-processing II — Principles of fMRI](https://www.youtube.com/watch?v=qamRGWSC-6g) (7:42)
- **무엇에 주목할까:** 공간 smoothing을 왜 일부러 하는지, 그리고 그때 무엇을 잃는지를 들어 보세요. 예시 3의 숫자와 연결됩니다.

## 개념 설명

### 영상을 움직이는 도구 세 가지: 변환 모형, 비용 함수, 보간

전처리의 상당 부분은 "영상 A를 영상 B에 맞추기"입니다. 이 작업에는 세 부품이 있습니다. **변환 모형**(transformation model)은 영상을 어떻게 움직여도 되는지 정합니다. 이동 3개와 회전 3개만 허용하면 모양이 그대로인 **강체 변환**(rigid-body, 6개 모수)이고, 여기에 축마다 늘이기와 기울이기를 더하면 **affine 변환**(12개 모수)입니다. 모양을 국소적으로 휘게 하는 비선형 변환은 Day D3에서 다룹니다. **비용 함수**(cost function)는 "얼마나 잘 맞았는지"를 점수로 매기고, 최적화 알고리즘은 이 점수가 가장 좋아지는 모수를 찾습니다. 마지막으로 **보간**(interpolation)은 옮겨진 격자 위의 값을 원래 격자의 값들로 추정해 새 영상을 만듭니다.

비유하자면 변환 모형은 "종이를 밀고 돌리기만 할지, 늘이기도 할지"의 규칙이고, 비용 함수는 두 장을 겹쳐 비춰 보며 어긋남을 재는 눈이고, 보간은 옮긴 그림을 새 모눈종이에 다시 옮겨 그리는 손입니다. 옮겨 그릴 때마다 조금씩 번지므로(D3 예시 1), 여러 변환은 합친 뒤 한 번에 적용하는 것이 원칙입니다.

### 시간의 어긋남: slice timing과 aliasing

대부분의 fMRI는 한 TR 안에서 슬라이스를 한 장씩 차례로 찍습니다. 그래서 같은 "시점" 영상 안에서도 슬라이스마다 실제 획득 시각이 최대 TR 가까이 다릅니다. 홀수 슬라이스를 먼저, 짝수를 나중에 찍는 **interleaved** 방식에서는 이웃한 두 슬라이스가 TR의 절반만큼 떨어져 찍힙니다. 모델은 모든 voxel이 같은 순간에 찍혔다고 가정하므로, 이 차이가 크면 예측 시계열과 자료가 어긋납니다. **Slice timing correction**은 각 슬라이스의 시계열을 기준 시각으로 보간해 맞추는 방법입니다. 다만 보간이 한 시점의 이상값을 주변 시점으로 번지게 할 수 있고, TR이 2초 이하로 짧거나 모델에 시간 도함수(Day D4)를 넣으면 이득이 작다는 의견도 있어서, 쓸지 말지와 순서(움직임 보정 앞/뒤)가 연구실마다 다릅니다. 어떤 선택이든 **보고**하는 것이 핵심입니다.

시간 쪽의 또 다른 함정은 **aliasing**(가명 현상)입니다. Day 23에서 배운 대로, 표본을 찍는 속도의 절반(Nyquist 주파수)보다 빠른 리듬은 느린 가짜 리듬으로 둔갑합니다. TR 2초면 0.25 Hz보다 빠른 심장 박동(약 1 Hz)과 호흡(약 0.3 Hz)이 느린 요동으로 접혀 들어와, 과제나 휴지기 연결성 신호와 섞일 수 있습니다. 심박·호흡을 함께 기록해 회귀로 빼거나, ICA로 잡음 성분을 찾는 방법이 쓰입니다.

### 머리 움직임: 가장 흔하고 가장 위험한 잡음

피험자는 침을 삼키기만 해도 움직입니다. 움직임은 두 가지 흔적을 남깁니다. 하나는 영상 전체가 밀리고 돌아가는 **통째 움직임**(bulk motion)이고, 다른 하나는 촬영 도중 움직여 신호 자체가 망가지는 효과(spin history 등)입니다. **움직임 보정**(motion correction, realignment)은 모든 시점을 기준 영상 하나에 강체 변환으로 맞추는데, 앞의 것만 고칠 수 있습니다. 기준 영상은 보통 run 가운데쯤의 영상을 씁니다(처음 몇 장은 신호가 아직 안정되지 않았을 수 있음). 보정 결과로 시점마다 6개의 움직임 추정치가 나옵니다.

가장 위험한 경우는 **과제와 함께 움직일 때**입니다. 말하기 과제나 어려운 조건에서 긴장해 움직이면, 움직임 흔적이 과제와 똑같은 타이밍으로 나타나 가짜 활성을 만듭니다. 이런 흔적은 뇌 가장자리에 고리나 한쪽 띠 모양으로 나타나는 경우가 많습니다. 대응책은 (1) 움직임 6개(와 그 도함수)를 GLM의 방해 회귀변수(nuisance regressor)로 넣기, (2) 문제 시점만 1인 **spike 회귀변수**를 넣거나 그 시점을 빼기(scrubbing), (3) ICA로 움직임 성분을 찾아 제거하기, (4) 그래도 안 되면 run이나 피험자를 제외하기입니다. 제외 기준은 결과를 보기 전에 정해 두어야 합니다(Day 28과 같은 원칙). 움직임 보정을 같은 자료에 두 번 돌리는 것은 권하지 않습니다. 남은 과제 신호를 움직임으로 착각하고 보간 오차만 쌓이기 때문입니다.

**얼마나 움직이면 너무 많은가?** 정답 숫자는 없습니다. 책은 이웃한 시점 사이 이동이 voxel 크기의 절반을 넘으면 강하게 의심하라는 경험칙을 소개합니다. 책 이후에는 이웃 시점 간 변화를 한 숫자로 요약한 **framewise displacement(FD)**가 표준 QC 지표가 되었습니다(Power 등 2012). 휴지기 연결성처럼 움직임에 민감한 분석에서는 0.2–0.5 mm 근처의 문턱이 흔히 쓰이지만, 분석 종류와 집단에 따라 다르므로 "흔히 쓰는 출발점"일 뿐입니다. 아이, 노인, 파킨슨병처럼 떨림이나 불편감이 있는 집단은 움직임이 많고, 움직임이 **집단 차이와 얽혀** 가짜 집단 차이를 만들 수 있습니다(Day 31의 교란과 같은 구조).

### 공간의 어긋남과 smoothing

흔히 쓰는 gradient-echo EPI 영상은 공기와 조직이 맞닿는 곳(부비동, 귓구멍 근처)에서 자기장이 흐트러져 두 문제가 생깁니다. 신호가 아예 사라지는 **dropout**(눈확이마겉질, 아래관자엽 근처)과 위치가 한 방향으로 밀리는 **기하 왜곡**(distortion)입니다. dropout은 촬영 뒤에 되살릴 수 없으므로, 그 영역에서 "활성이 없다"고 결론 내리기 전에 신호가 있기는 했는지부터 확인해야 합니다. 왜곡은 field map 등으로 일부 되돌릴 수 있고, 되돌린 결과를 원본과 나란히 비교해 새 인공물이 없는지 봐야 합니다.

**공간 smoothing**은 영상에 가우시안 필터를 씌워 일부러 흐리게 만드는 단계입니다. 이유는 셋입니다. 넓게 퍼진 활성의 신호 대 잡음비를 높이고, 사람마다 남는 해부학적 어긋남을 줄이며, D5의 무작위장 이론처럼 매끄러움을 가정하는 방법의 전제를 맞춥니다. 크기는 **FWHM**(full width at half maximum, 반높이 전폭; σ의 약 2.355배)으로 말합니다. 대가는 공간 해상도입니다. 찾고 싶은 활성보다 큰 필터를 쓰면 작은 활성은 오히려 묻힙니다. 책은 voxel 크기의 두 배 정도에서 출발하고, 모자란 쪽으로 기우는 편을 권합니다. 패턴 분석(D7)처럼 미세한 공간 패턴이 정보인 경우에는 smoothing을 하지 않거나 아주 약하게 합니다. 또한 영상에는 원래 매끄러움이 있어서, 최종 매끄러움은 적용한 FWHM보다 큽니다.

### QC는 단계마다: 눈으로, 그리고 숫자로

책이 거듭 강조하는 원칙은 "쓰레기를 넣으면 쓰레기가 나온다"입니다. 원자료를 영화처럼 넘겨 보기(갑자기 튀는 시점), 스캐너 인공물(줄무늬 spike, 위상 방향의 유령 상 ghosting) 찾기, 움직임 그래프 보기, 기능 영상을 구조 영상에 겹쳐 dropout 확인하기, 왜곡 보정 전후 비교하기를 각 단계 뒤에 합니다. ICA는 움직임·심박 성분을 찾아내는 데 특히 유용한데, 성분을 버리는 기준은 미리 명시해야 편향을 피할 수 있습니다.

> **책 이후의 변화:** 2011년에는 SPM·FSL·AFNI 안에서 단계를 직접 엮었습니다. 지금은 **fMRIPrep**(Esteban 등 2019)처럼 BIDS 자료를 받아 여러 도구를 검증된 순서로 묶어 돌리고, 단계마다 시각 보고서와 FD 같은 confound 표를 내 주는 파이프라인이 널리 쓰입니다. 자동 QC 지표는 **MRIQC**(Esteban 등 2017)가 계산합니다. 움직임 성분을 자동으로 고르는 ICA-AROMA(Pruim 등 2015) 같은 방법도 나왔습니다. 파이프라인이 편해진 만큼, 보고서를 직접 열어 보는 일이 더 중요해졌습니다.

## 예시로 이해하기

> 모든 값은 연습용 **가상 값**입니다.

### 예시 1 — interleaved 획득 시각과 aliasing 계산

```python
import numpy as np

# (가) interleaved 슬라이스 획득 시각: TR 안에서 슬라이스마다 찍히는 시각이 다르다
TR, n_slices = 1.5, 10
order = list(range(0, n_slices, 2)) + list(range(1, n_slices, 2))   # 0,2,4,...,1,3,5,...
t_slice = np.empty(n_slices)
t_slice[order] = np.arange(n_slices) * TR / n_slices
print("획득 순서:", order)
print("슬라이스별 획득 시각(s):", np.round(t_slice, 2))
print("이웃한 슬라이스 0과 1의 시간 차:", t_slice[1] - t_slice[0], "s")

# (나) aliasing: TR보다 빠른 심장 박동은 느린 가짜 리듬으로 보인다
def aliased(f_true, fs):
    return abs(f_true - fs * round(f_true / fs))

for TR in [0.5, 1.5, 2.0]:
    fs = 1 / TR
    print(f"TR={TR}s (Nyquist {fs/2:.2f} Hz): 심박 1.2 Hz → {aliased(1.2, fs):.2f} Hz,"
          f" 호흡 0.3 Hz → {aliased(0.3, fs):.2f} Hz")
```

출력:

```text
획득 순서: [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]
슬라이스별 획득 시각(s): [0.   0.75 0.15 0.9  0.3  1.05 0.45 1.2  0.6  1.35]
이웃한 슬라이스 0과 1의 시간 차: 0.75 s
TR=0.5s (Nyquist 1.00 Hz): 심박 1.2 Hz → 0.80 Hz, 호흡 0.3 Hz → 0.30 Hz
TR=1.5s (Nyquist 0.33 Hz): 심박 1.2 Hz → 0.13 Hz, 호흡 0.3 Hz → 0.30 Hz
TR=2.0s (Nyquist 0.25 Hz): 심박 1.2 Hz → 0.20 Hz, 호흡 0.3 Hz → 0.20 Hz
```

이웃한 슬라이스 0과 1은 공간으로는 붙어 있지만 0.75초(TR의 절반) 떨어져 찍혔습니다. smoothing을 하면 이 두 슬라이스가 섞이므로, interleaved 획득에서는 slice timing 오차가 실질적으로 TR/2 정도로 줄어든다는 설명이 여기서 나옵니다. 아래쪽 결과는 같은 심박 1.2 Hz가 TR에 따라 0.80, 0.13, 0.20 Hz의 가짜 리듬으로 보인다는 것을 보여 줍니다. TR 2초에서는 심박과 호흡이 모두 0.2 Hz로 겹칩니다.

### 예시 2 — 움직임 추정치에서 framewise displacement 계산

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(7)
n = 150
# 가상 움직임 추정치: 3개 이동(mm) + 3개 회전(rad). 천천히 흐르다가 두 번 '움찔'한다
trans = np.cumsum(rng.normal(0, 0.03, size=(n, 3)), axis=0)
rot = np.cumsum(rng.normal(0, 0.0004, size=(n, 3)), axis=0)
trans[60:, 2] += 0.9          # 60번째 시점에서 z 방향으로 0.9 mm 갑자기 이동
rot[100:, 0] += 0.012         # 100번째 시점에서 x축으로 약 0.7도 회전
motion = pd.DataFrame(np.hstack([trans, rot]),
                      columns=["trans_x", "trans_y", "trans_z", "rot_x", "rot_y", "rot_z"])

# framewise displacement(FD): 이웃한 시점 사이 변화량의 절댓값 합.
# 회전은 반지름 50 mm 구 표면의 이동 거리로 바꿔 더한다 (Power 등 2012의 정의)
d = motion.diff().abs().fillna(0)
fd = d[["trans_x", "trans_y", "trans_z"]].sum(axis=1) + 50 * d[["rot_x", "rot_y", "rot_z"]].sum(axis=1)

print("FD 중앙값: %.3f mm, 최댓값: %.3f mm" % (fd.median(), fd.max()))
print("절대 위치의 최대 이동(z): %.2f mm" % motion["trans_z"].abs().max())
bad = np.where(fd > 0.5)[0]           # 흔히 쓰는 출발점 기준(데이터에 따라 0.2–0.9 mm까지 다양)
print("FD > 0.5 mm 인 시점:", bad.tolist())

# 문제 시점마다 '그 시점만 1'인 회귀변수(spike regressor)를 만들어 GLM에 넣을 수 있다
spikes = np.zeros((n, bad.size))
spikes[bad, np.arange(bad.size)] = 1
print("spike 회귀변수 행렬:", spikes.shape, "| 남는 시점 비율: %.1f%%" % (100 * (1 - bad.size / n)))
```

출력:

```text
FD 중앙값: 0.113 mm, 최댓값: 0.979 mm
절대 위치의 최대 이동(z): 0.82 mm
FD > 0.5 mm 인 시점: [60, 100]
spike 회귀변수 행렬: (150, 2) | 남는 시점 비율: 98.7%
```

절대 위치(기준 영상에서 얼마나 떨어졌나)보다 이웃 시점 사이의 변화가 문제를 더 잘 드러냅니다. 천천히 흐르는 이동은 강체 보정이 잘 따라잡지만, 60번째와 100번째처럼 한 번에 튄 순간은 신호 자체를 망가뜨렸을 가능성이 큽니다. 회전은 라디안 단위라 그대로 더하면 너무 작으므로 반지름 50 mm 구 표면의 이동 거리로 바꿔 더합니다. 두 시점에 spike 회귀변수를 만들면 GLM이 그 시점을 사실상 빼고 추정합니다.

그림으로 남기려면 아래를 이어 붙입니다(그림 파일만 저장하고 화면 출력은 없습니다).

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path

Path("figures/advanced/D").mkdir(parents=True, exist_ok=True)
fig, ax = plt.subplots(2, 1, figsize=(8, 5), sharex=True)
ax[0].plot(motion[["trans_x", "trans_y", "trans_z"]]); ax[0].set_ylabel("translation (mm)")
ax[1].plot(fd, color="k"); ax[1].axhline(0.5, ls="--", color="r"); ax[1].set_ylabel("FD (mm)")
ax[1].set_xlabel("volume (TR)")
fig.tight_layout(); fig.savefig("figures/advanced/D/D2_framewise_displacement.png", dpi=150)
```

### 예시 3 — smoothing 크기에 따라 넓은 활성과 작은 활성이 어떻게 달라지나

```python
import numpy as np
from scipy import ndimage

def fwhm_to_sigma(fwhm):
    return fwhm / (2 * np.sqrt(2 * np.log(2)))    # FWHM ≈ 2.355 σ

voxel = 3.0                                          # mm
rng = np.random.default_rng(3)
yy, xx = np.mgrid[0:64, 0:64]
big = 1.0 * ((xx - 20) ** 2 + (yy - 32) ** 2 < 8 ** 2)    # 반지름 8 voxel(24 mm)짜리 넓은 활성
small = 1.0 * ((xx - 48) ** 2 + (yy - 32) ** 2 < 1.5 ** 2)  # 반지름 1.5 voxel짜리 작은 활성
truth = big + small
noisy = truth + rng.normal(0, 1.0, truth.shape)

print("FWHM(mm)  넓은 활성 SNR  작은 활성 SNR")
for fwhm_mm in [0, 6, 12, 24, 36]:
    img = noisy if fwhm_mm == 0 else ndimage.gaussian_filter(noisy, fwhm_to_sigma(fwhm_mm / voxel))
    noise_sd = img[truth == 0].std()
    snr_big = img[big == 1].mean() / noise_sd
    snr_small = img[small == 1].mean() / noise_sd
    print(f"{fwhm_mm:>7}   {snr_big:12.2f}   {snr_small:12.2f}")

# 원래 있던 매끄러움과 일부러 준 smoothing은 제곱합의 제곱근으로 합쳐진다
intrinsic, applied = 4.0, 6.0
print("최종 매끄러움 ≈ %.1f mm (6 mm만 준 게 아니다)" % np.sqrt(intrinsic**2 + applied**2))
```

출력:

```text
FWHM(mm)  넓은 활성 SNR  작은 활성 SNR
      0           0.90           0.72
      6           2.38           1.60
     12           4.15           2.37
     24           5.99           2.34
     36           6.02           1.59
최종 매끄러움 ≈ 7.2 mm (6 mm만 준 게 아니다)
```

넓은 활성(지름 약 48 mm)은 필터를 키울수록 SNR이 계속 좋아지다가 포화합니다. 작은 활성은 12–24 mm 근처에서 가장 좋고, 36 mm에서는 다시 나빠집니다. 필터가 활성보다 커지면 신호가 주변의 0과 섞여 희석되기 때문입니다. "얼마나 smoothing할까"의 답이 "찾고 싶은 효과의 크기에 달려 있다"인 이유입니다. 마지막 줄은 원래 4 mm 매끄러움을 가진 영상에 6 mm를 더하면 결과가 약 7.2 mm라는 뜻으로, D5에서 매끄러움을 추정하는 방법이 왜 적용한 FWHM이 아니라 자료에서 추정한 값을 쓰는지와 연결됩니다.

### 참고 — 실제 자료를 전처리할 때의 명령 형태 (실행 확인 안 됨, 패키지 미설치)

```bash
# Docker/Apptainer 컨테이너로 배포되는 fMRIPrep의 기본 호출 형태. 이 저장소 환경에서는 실행하지 않았다.
# 입력은 BIDS 폴더, 출력 폴더, 처리 수준(participant)이다. FreeSurfer 라이선스 파일이 필요하다.
fmriprep /path/to/bids /path/to/derivatives participant --participant-label 01 --fs-license-file /path/to/license.txt
# 결과: derivatives/sub-01/func/ 아래의 전처리된 BOLD, *_desc-confounds_timeseries.tsv(FD 등), HTML 시각 보고서
```

## 직접 해보기

1. `D2_preprocessing_qc.ipynb`를 열고 예시 1–3을 실행한다.
2. 예시 1에서 슬라이스 순서를 오름차순(`order = list(range(n_slices))`)으로 바꾸고, 이웃 슬라이스의 시간 차가 어떻게 달라지는지 비교한다.
3. 예시 2에서 FD 문턱을 0.2, 0.5, 0.9 mm로 바꿔 가며 "남는 시점 비율"을 표로 만든다. 문턱을 결과를 보기 **전에** 정해야 하는 이유를 한 문장으로 적는다.
4. 예시 2의 그림 코드를 실행해 `figures/advanced/D/D2_framewise_displacement.png`를 만든다.
5. 예시 3에 반지름 4 voxel짜리 "중간 활성"을 추가하고, 그 활성의 SNR이 가장 좋아지는 FWHM이 어디쯤인지 찾는다.
6. 노트에 "내가 PD 환자 fMRI를 분석한다면 움직임을 어떻게 다룰 것인가"를 3줄로 적는다(측정, 처리 방법, 집단 간 움직임 비교).

⚠️ **흔한 오류 1 — 회전 단위를 섞기.** 프로그램마다 회전을 라디안 또는 도로 저장하고, 열 순서(이동이 먼저인지 회전이 먼저인지)도 다릅니다. FD를 계산하기 전에 해당 도구의 문서에서 단위와 순서를 확인하세요.

⚠️ **흔한 오류 2 — 집단마다 다른 전처리.** 환자군만 더 강하게 smoothing하거나 다른 FD 문턱을 쓰면, 처리 차이가 곧 집단 차이처럼 보입니다. 모든 피험자에게 같은 파이프라인과 기준을 적용하고, 집단별 움직임 요약(평균 FD, 제외된 시점 수)을 함께 보고합니다.

## 퀴즈

**1.** 움직임 보정이 기본적으로 쓰는 변환 모형과 모수 수는?

(a) affine, 12개 (b) 강체, 6개 (c) 비선형, 수천 개 (d) 이동만, 3개

<details><summary>정답 보기</summary>

(b). 같은 사람의 머리는 크기나 모양이 바뀌지 않는다고 가정하므로 이동 3개와 회전 3개만 씁니다. 그래서 촬영 도중 움직여 신호가 망가진 효과는 이 보정으로 고칠 수 없습니다.

</details>

**2.** TR이 2초일 때 심박(약 1.1 Hz)이 자료에서 느린 리듬으로 보이는 현상의 이름은? (단답)

<details><summary>정답 보기</summary>

aliasing입니다. 샘플링 주파수 0.5 Hz의 절반(0.25 Hz)보다 빠른 신호는 그대로 표현될 수 없어 낮은 주파수로 접혀 들어옵니다. 심박·호흡 기록을 회귀로 빼거나 ICA로 성분을 찾는 이유입니다.

</details>

**3.** 과제와 함께 생긴 움직임이 특히 위험한 이유는?

<details><summary>정답 보기</summary>

움직임 흔적이 과제와 같은 타이밍으로 나타나 가짜 활성이 되기 때문입니다. 움직임 회귀변수를 넣으면 가짜 활성은 줄지만, 과제와 겹친 진짜 신호도 함께 빠져 검출력이 떨어집니다. 설계 단계에서 움직임과 과제의 타이밍을 떼어 놓는 것이 가장 좋습니다.

</details>

**4.** 3 mm voxel 자료에서 책이 권하는 smoothing의 출발점은?

(a) 1 mm (b) 6 mm (c) 20 mm (d) smoothing하지 않는다

<details><summary>정답 보기</summary>

(b). voxel 크기의 두 배 정도가 출발점입니다. 찾는 효과가 작거나 패턴 분석을 한다면 더 작게, 넓은 효과만 본다면 더 크게 조정할 수 있지만, 그 선택은 결과를 보기 전에 정하고 보고합니다.

</details>

**5.** 눈확이마겉질에서 "활성이 없었다"고 결론 내리기 전에 확인해야 할 것은? (단답)

<details><summary>정답 보기</summary>

그 영역에 신호가 있었는지(dropout 여부)입니다. 기능 영상을 구조 영상에 겹쳐 보거나 평균 신호 지도를 확인합니다. 신호가 사라진 곳에서는 활성이 없다는 결론도, 있다는 결론도 내릴 수 없습니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] interleaved 획득 시각을 계산하고 aliasing된 주파수를 구했다.
- [ ] FD를 계산하고 문턱별 남는 시점 비율 표를 만들었다.
- [ ] `figures/advanced/D/D2_framewise_displacement.png`를 저장했다.
- [ ] smoothing 크기와 활성 크기의 관계를 숫자로 확인했다.

## 더 읽을거리
- Poldrack RA, Mumford JA, Nichols TE. *Handbook of Functional MRI Data Analysis.* Cambridge University Press, 2011. <https://www.cambridge.org/core/books/handbook-of-functional-mri-data-analysis/8EDF966C65811FCCC306F7C916228529> — 2장(변환·비용 함수·보간·필터링), 3장(전처리와 QC).
- Power JD, et al. Spurious but systematic correlations in functional connectivity MRI networks arise from subject motion. *NeuroImage.* 2012;59:2142–2154. doi:[10.1016/j.neuroimage.2011.10.018](https://doi.org/10.1016/j.neuroimage.2011.10.018)
- Esteban O, et al. fMRIPrep: a robust preprocessing pipeline for functional MRI. *Nat Methods.* 2019;16:111–116. doi:[10.1038/s41592-018-0235-4](https://doi.org/10.1038/s41592-018-0235-4) · 문서: <https://fmriprep.org>
- Esteban O, et al. MRIQC: Advancing the automatic prediction of image quality in MRI from unseen sites. *PLoS One.* 2017;12:e0184661. doi:[10.1371/journal.pone.0184661](https://doi.org/10.1371/journal.pone.0184661) · 문서: <https://mriqc.readthedocs.io>
- Pruim RHR, et al. ICA-AROMA: A robust ICA-based strategy for removing motion artifacts from fMRI data. *NeuroImage.* 2015;112:267–277. doi:[10.1016/j.neuroimage.2015.02.064](https://doi.org/10.1016/j.neuroimage.2015.02.064)

---
[← 이전](day-D1.md) · [코스 지도](../../../README.md) · [다음 →](day-D3.md)
