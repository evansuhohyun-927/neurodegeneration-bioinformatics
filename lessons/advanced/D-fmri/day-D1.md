# Day D1 — BOLD 신호와 fMRI 데이터의 생김새: 4D 배열, voxel, NIfTI, BIDS

> **주차:** 심화 파트 D — fMRI 데이터 분석 · **예상 시간:** 75–90분 · **산출물:** `notebooks/advanced/D/D1_fmri_data_structure.ipynb`
>
> **먼저 끝내 둘 레슨:** Day 6 (파일 형식), Day 4 (메타데이터), Day 23 (시계열 기초). 이 파트는 본 과정 0–6주차를 마친 뒤 듣는 심화 과정입니다.

## 오늘의 목표
- fMRI가 무엇을 재는지(BOLD), 그 신호가 왜 느리고 간접적인지 설명할 수 있다.
- fMRI 자료를 4차원 배열(x, y, z, 시간)과 "voxel × 시간" 행렬로 바꿔 생각할 수 있다.
- NIfTI의 affine과 BIDS 파일 이름을 읽어 "어느 사람의, 어느 과제의, 어느 위치의 값인지"를 찾아낼 수 있다.

## 🎬 영상으로 먼저 보기

- [Understanding MRI: What is functional MRI (fMRI)? — Wellcome Centre for Human Neuroimaging](https://www.youtube.com/watch?v=4UOeBM5BwdY) (4:34)
- **무엇에 주목할까:** 영상이 말하는 "활동"이 신경세포의 전기 신호가 아니라 혈액 산소 상태의 변화라는 점을 붙잡으세요. 이 차이가 오늘 배우는 "느린 반응"과 이후 모든 모델링의 출발점입니다.

- [Chris Gorgolewski - Brain imaging data structure [2015] — INCF](https://www.youtube.com/watch?v=5H6XaJLp2V8) (11:08)
- **무엇에 주목할까:** 폴더와 파일 이름 규칙만으로 "누가, 어떤 과제를, 몇 번째로" 했는지 기계가 읽게 만든다는 발상에 집중하세요. 2015년 발표라 세부 규칙은 지금과 다를 수 있으니 공식 명세(아래 링크)를 기준으로 삼습니다.

## 개념 설명

### BOLD: 뇌 활동을 '혈류의 흔적'으로 잰다

fMRI는 신경세포의 발화를 직접 보지 못합니다. 어떤 영역이 일을 하면 그 주변으로 혈류가 늘어나는데, 실제로 쓰는 산소보다 더 많은 피가 몰려 와서 그 자리의 산소가 상대적으로 남게 됩니다. 산소를 내려놓은 헤모글로빈은 자기장을 미세하게 흐트러뜨리므로, 산소가 많아지면 MRI 신호가 아주 조금 커집니다. 이것이 **BOLD**(blood oxygenation level dependent, 혈중 산소 수준 의존) 신호입니다.

비유하면 BOLD는 "가게 안에서 일어난 일"을 보는 대신 "가게 앞에 몰려든 배달 트럭"을 세는 셈입니다. 두 가지 성질이 이후 분석을 결정합니다. 첫째, **느립니다.** 짧은 자극에도 반응은 수 초 뒤에 꼭대기에 닿고, 다 가라앉는 데 십여 초가 걸립니다. 그래서 사건의 시각과 신호의 시각이 어긋나 있고, 이를 Day D4에서 HRF와 convolution으로 모델링합니다. 둘째, 첫 근사로는 **선형**으로 겹칩니다. 자극이 두 배면 반응도 대략 두 배, 두 자극이 이어지면 두 반응을 더한 모양이 됩니다(아주 짧은 간격에서는 어긋남). 변화의 크기는 작아서, 인지 과제의 효과는 흔히 1%도 되지 않습니다. 작은 효과를 큰 잡음 속에서 찾아야 하므로 통계가 중심이 됩니다.

BOLD는 상대적인 신호라는 점도 기억하세요. 한 voxel 값 1,000이라는 숫자 자체에는 생리적 단위가 없고, 같은 voxel 안의 **변화**만 해석합니다. 또 혈관 반응에 기대므로, 노화나 혈관 질환처럼 신경–혈관 결합이 달라질 수 있는 집단에서는 "BOLD가 작다 = 신경 활동이 작다"로 곧바로 옮기면 안 됩니다(D'Esposito 등 2003 리뷰).

### 영상은 숫자 배열이고, fMRI는 그 배열이 시간을 따라 쌓인 것이다

디지털 영상은 숫자의 격자입니다. 3차원 격자의 한 칸을 **voxel**(부피 화소, volume pixel)이라 부르고, 흔히 한 변이 2–3 mm입니다. 구조 영상(T1 강조 영상)은 한 장의 3D 배열이지만, fMRI는 같은 뇌를 1–2초마다 반복해 찍은 3D 배열들의 묶음이라서 **4차원 배열**(x, y, z, 시간)이 됩니다. 한 번 찍는 간격을 **TR**(repetition time)이라 합니다.

분석 프로그램은 이 4D 배열을 대개 **시간 × voxel** 2D 행렬로 펼쳐 계산합니다. 뇌 밖을 빼는 **마스크**(mask)로 voxel을 고른 뒤, 각 열이 voxel 하나의 시계열이 되게 하는 것이지요. 본 과정의 유전자 발현 행렬(샘플 × 유전자)을 떠올리면 됩니다. 다만 fMRI에서는 열(voxel)이 수만~수십만 개이고, 행(시점)은 수백 개뿐이며, 이웃한 열끼리 서로 닮아 있습니다(공간 상관). 이 세 가지가 이후의 다중비교(D5)와 기계학습(D7) 문제를 만듭니다.

**저장 자료형**도 중요합니다. 스캐너 원자료는 보통 16비트 정수로 저장되는데, 처리 중간값을 정수로 다시 저장하면 소수점 아래가 잘려 정보가 사라집니다. 통계 지도처럼 처리된 결과는 실수(float)로 저장합니다. 대신 파일이 커집니다.

### 좌표계: voxel 번호와 실제 위치(mm)를 잇는 affine

배열의 칸 번호 (i, j, k)는 "몇 번째 칸"일 뿐, 뇌의 어디인지는 말해 주지 않습니다. 이를 실제 공간 좌표 (x, y, z, mm)로 바꾸는 4×4 행렬을 **affine**이라 부르고, 영상 파일의 머리말(header)에 들어 있습니다. 관례상 x는 좌–우, y는 앞–뒤, z는 아래–위입니다.

가장 위험한 축은 **좌우**입니다. 뇌는 좌우가 거의 대칭이라 영상만 보고는 어느 쪽이 왼쪽인지 알 수 없습니다. 영상의 왼쪽에 환자의 오른쪽을 그리는 방사선과 관례(radiological)와 왼쪽에 왼쪽을 그리는 신경과 관례(neurological)가 공존하므로, 좌우는 반드시 header의 affine으로 판단해야 합니다. 직접 배열을 뒤집거나 축을 바꾸는 코드를 쓸 때는 특히 조심하세요.

### 파일 형식과 BIDS: 데이터에 이름표를 붙이는 규칙

스캐너는 보통 **DICOM** 형식으로 저장합니다. 슬라이스마다 파일이 하나씩이고 획득 정보와 개인 정보가 header에 많이 담겨 있어서, 분석 전에 변환하는 것이 일반적입니다. 분석용 표준은 **NIfTI**(.nii, 압축하면 .nii.gz)입니다. 한 파일에 header와 영상이 함께 들어 있고, 4D 시계열도 한 파일로 담을 수 있으며, affine이 들어 있어 방향을 잃지 않게 해 줍니다. 변환은 직접 만들지 말고 검증된 공개 변환기를 씁니다.

책이 나온 2011년에는 "연구실마다 일관된 폴더 규칙을 정하라"는 조언이 전부였습니다. 그 뒤 이 조언이 공동체 표준이 되었는데, 그것이 **BIDS**(Brain Imaging Data Structure, Gorgolewski 등 2016)입니다. `sub-01/func/sub-01_task-rest_run-1_bold.nii.gz`처럼 `키-값` 조각을 `_`로 잇고, 영상 옆 JSON 파일(사이드카, sidecar)에 TR, 슬라이스 획득 시각 같은 정보를 적습니다. 이름이 규칙을 따르면 전처리 도구가 사람 손 없이 자료를 찾아 읽습니다. 본 과정 Day 15에서 provenance를 기록했던 것과 같은 정신이며, 공개 저장소 OpenNeuro도 BIDS 형식으로만 자료를 받습니다.

> **책 이후의 변화(2016–):** BIDS 명세는 공동체가 계속 갱신하는 문서입니다(<https://bids-specification.readthedocs.io/>). 파이썬에서는 NIfTI를 `nibabel`로 읽고, BIDS 자료는 `pybids` 같은 도구로 조회합니다. 이 저장소의 환경에는 두 패키지가 설치되어 있지 않으므로 아래의 해당 명령은 형태만 보여 줍니다.

## 예시로 이해하기

> 예시의 배열과 숫자는 모두 연습용으로 만든 **가상 값**입니다. 실제 영상 파일은 쓰지 않습니다.

### 예시 1 — 4D 배열, voxel 시계열, 시간 × voxel 행렬

```python
import numpy as np

rng = np.random.default_rng(1)
nx, ny, nz, nt = 8, 8, 4, 120              # 아주 작은 가상 뇌: 8×8×4 voxel, 120 시점
data = 1000 + rng.normal(0, 10, size=(nx, ny, nz, nt))   # 4D 배열 (x, y, z, 시간)

print("4D shape:", data.shape)
print("한 시점의 3D 영상:", data[..., 0].shape)
ts = data[3, 4, 2, :]                       # 한 voxel의 시계열
print("voxel (3,4,2) 시계열 길이:", ts.shape, "평균:", round(ts.mean(), 1))

# 분석 프로그램은 보통 (시간 × voxel) 2D 행렬로 바꿔 계산한다
mask = np.zeros((nx, ny, nz), dtype=bool)
mask[2:6, 2:6, :] = True                    # 가상 '뇌 마스크'
Y = data[mask].T                            # (voxel, 시간) → 전치 → (시간, voxel)
print("마스크 안 voxel 수:", mask.sum(), "| 2D 행렬:", Y.shape)

# 저장 형식에 따른 크기: 실제 크기의 4D 영상을 가정해 계산만 한다
shape_real = (64, 64, 36, 200)
n = np.prod(shape_real)
for dtype in ["int16", "float32", "float64"]:
    mb = n * np.dtype(dtype).itemsize / 1024**2
    print(f"{dtype:>8}: {mb:7.1f} MB")
```

출력:

```text
4D shape: (8, 8, 4, 120)
한 시점의 3D 영상: (8, 8, 4)
voxel (3,4,2) 시계열 길이: (120,) 평균: 998.8
마스크 안 voxel 수: 64 | 2D 행렬: (120, 64)
   int16:    56.2 MB
 float32:   112.5 MB
 float64:   225.0 MB
```

`data[3, 4, 2, :]`처럼 공간 좌표 셋을 고정하고 시간 축을 통째로 꺼내면 voxel 하나의 시계열입니다. 마스크로 고른 voxel만 모아 전치하면 (시간 120 × voxel 64) 행렬이 되고, 이후 GLM은 이 행렬의 열마다 같은 회귀를 반복합니다. 아래 표는 64×64×36 크기 영상 200장을 저장할 때의 크기입니다. 같은 자료라도 64비트 실수로 저장하면 16비트 정수의 네 배가 됩니다.

### 예시 2 — affine으로 voxel 번호를 mm 좌표로 바꾸기

```python
import numpy as np

# affine: voxel 번호(i, j, k) → 스캐너/표준 공간 좌표(mm)를 잇는 4×4 행렬
voxel_size = 3.0
affine = np.array([
    [-voxel_size, 0, 0,  96.0],   # x: i가 커질수록 x(mm)가 작아진다 = 왼쪽→오른쪽이 뒤집힌 저장
    [0, voxel_size, 0, -132.0],
    [0, 0, voxel_size,  -78.0],
    [0, 0, 0, 1.0],
])

def vox2mm(ijk):
    return (affine @ np.append(ijk, 1))[:3]

def mm2vox(xyz):
    return (np.linalg.inv(affine) @ np.append(xyz, 1))[:3]

for ijk in [(0, 0, 0), (32, 44, 26), (63, 0, 0)]:
    print(ijk, "→", vox2mm(np.array(ijk)), "mm")

xyz = vox2mm(np.array([32, 44, 26]))
back = mm2vox(xyz)
print("되돌리기:", back)
assert np.allclose(back, [32, 44, 26])      # 왕복 변환이 맞는지 자기 점검

# 같은 배열을 '왼쪽이 +x'로 잘못 해석하면?
wrong = affine.copy(); wrong[0, 0] = +voxel_size; wrong[0, 3] = -96.0
print("올바른 x:", vox2mm(np.array([10, 44, 26]))[0],
      "| 부호를 잘못 읽은 x:", (wrong @ np.array([10, 44, 26, 1]))[0])
```

출력:

```text
(0, 0, 0) → [  96. -132.  -78.] mm
(32, 44, 26) → [0. 0. 0.] mm
(63, 0, 0) → [ -93. -132.  -78.] mm
되돌리기: [32. 44. 26.]
올바른 x: 66.0 | 부호를 잘못 읽은 x: -66.0
```

affine의 첫 줄 계수가 음수(−3)라서 i가 커질수록 x(mm)가 작아집니다. 즉 이 배열은 첫 번째 칸이 뇌의 오른쪽(+x)부터 저장되어 있습니다. 부호 하나를 잘못 읽으면 66 mm(오른쪽)가 −66 mm(왼쪽)로 바뀌는데, 영상은 겉보기에 멀쩡하므로 눈으로는 이 오류를 잡기 어렵습니다. `assert`로 왕복 변환을 검산하는 습관을 들이세요.

### 예시 3 — BIDS 이름 읽기와 자료형에 따른 정보 손실

```python
import json
import numpy as np

# (가) BIDS 파일 이름에서 정보 꺼내기: key-value 조각이 '_'로 이어진다
names = [
    "sub-01/func/sub-01_task-rest_run-1_bold.nii.gz",
    "sub-01/func/sub-01_task-nback_run-2_bold.nii.gz",
    "sub-02/anat/sub-02_T1w.nii.gz",
]
for path in names:
    stem = path.split("/")[-1].split(".")[0]
    *entities, suffix = stem.split("_")
    info = dict(e.split("-", 1) for e in entities)
    print(f"{suffix:5} {info}")

# 영상 옆의 JSON 사이드카에는 분석에 꼭 필요한 획득 정보가 들어 있다 (가상 예시)
sidecar = json.loads('{"RepetitionTime": 2.0, "TaskName": "nback", '
                     '"SliceTiming": [0.0, 1.0, 0.2, 1.2, 0.4, 1.4, 0.6, 1.6, 0.8, 1.8]}')
print("TR =", sidecar["RepetitionTime"], "s | 슬라이스 수 =", len(sidecar["SliceTiming"]))

# (나) 저장 자료형과 정보 손실: 정수로 저장하면 소수점이 잘린다
rng = np.random.default_rng(0)
raw = rng.integers(200, 4000, size=10_000).astype(np.int16)   # 가상 원시 신호
scaled = raw * 0.037                                            # 어떤 처리 뒤의 값
as_float = scaled.astype(np.float32)
as_int = np.round(scaled).astype(np.int16)
print("서로 다른 값의 수 — 원본:", np.unique(raw).size,
      "| float32 저장:", np.unique(as_float).size,
      "| int16 저장:", np.unique(as_int).size)
```

출력:

```text
bold  {'sub': '01', 'task': 'rest', 'run': '1'}
bold  {'sub': '01', 'task': 'nback', 'run': '2'}
T1w   {'sub': '02'}
TR = 2.0 s | 슬라이스 수 = 10
서로 다른 값의 수 — 원본: 3533 | float32 저장: 3533 | int16 저장: 142
```

파일 이름만으로 피험자·과제·run이 표로 풀립니다. 이 규칙 덕분에 "rest 과제의 모든 bold 파일" 같은 질문을 코드 한 줄로 던질 수 있습니다. 아래쪽 결과는 처리된 값을 정수로 다시 저장하면 서로 다른 값이 3,533개에서 142개로 줄어든다는 것, 즉 대부분의 정보가 반올림으로 사라진다는 것을 보여 줍니다.

### 참고 — 실제 NIfTI 파일을 읽을 때의 명령 형태 (nibabel 필요)

> 이 코드는 `pip install nibabel nilearn`으로 설치한 환경(nibabel 5.5, nilearn 0.14.1)에서, 같은 이름의 **가상 파일**을 만들어 그대로 실행해 오류 없이 도는 것을 확인했습니다. 출력은 여러분의 실제 파일에 따라 달라지므로 싣지 않았습니다.

```python
# nibabel이 필요하다: pip install nibabel
import nibabel as nib
img = nib.load("sub-01/func/sub-01_task-rest_run-1_bold.nii.gz")
print(img.shape)        # (x, y, z, 시간)
print(img.affine)       # voxel → mm 4×4 행렬
data = img.get_fdata()  # numpy 배열 (실수형)
print(img.header.get_zooms())   # voxel 크기(mm)와 TR(초)
```

## 직접 해보기

1. `notebooks/advanced/D/` 폴더를 만들고 `D1_fmri_data_structure.ipynb`를 연다. 예시 1–3을 직접 타이핑해 실행한다.
2. 예시 1에서 `nt`를 300으로 바꾸고 "시간 × voxel" 행렬의 모양이 어떻게 바뀌는지 적는다. 이어서 TR이 2초라면 이 run이 몇 분짜리인지 계산한다.
3. 예시 2의 affine에서 voxel 크기를 2 mm로 바꾸고, 원점(0, 0, 0 mm)이 몇 번째 voxel이 되는지 `mm2vox`로 구한다.
4. 예시 3의 `names`에 `sub-03/func/sub-03_task-nback_run-1_bold.nii.gz`와 `sub-03/func/sub-03_task-nback_run-1_events.tsv`를 더하고, 파일 끝(suffix)이 `bold`인 것만 골라 출력하는 코드를 짠다.
5. OpenNeuro(<https://openneuro.org>)에서 아무 데이터셋 하나의 파일 목록을 열어 `dataset_description.json`, `participants.tsv`, `sub-*/func/*_bold.json`이 있는지 확인하고, 그 JSON에서 `RepetitionTime` 값을 노트에 적는다(내려받을 필요는 없다).

⚠️ **흔한 오류 1 — 좌우를 화면으로 판단하기.** 보는 프로그램마다 좌우 표시 관례가 다를 수 있습니다. 좌우는 affine(또는 프로그램의 L/R 표시)으로만 판단하고, 배열을 직접 뒤집었다면 affine도 함께 고쳤는지 확인하세요.

⚠️ **흔한 오류 2 — 개인 정보가 담긴 DICOM을 그대로 공유하기.** DICOM header에는 이름·생년월일·검사 날짜가 들어 있을 수 있습니다. 공유 전에는 공인 도구로 변환·비식별화하고, 구조 영상은 얼굴 제거(defacing)가 필요한지도 확인합니다. 이 저장소에는 어떤 영상 파일도 올리지 않습니다.

## 퀴즈

**1.** BOLD 신호가 직접 반영하는 것은?

(a) 신경세포의 활동 전위 (b) 국소 혈액의 산소 상태 변화 (c) 포도당 대사량의 절댓값 (d) 뇌척수액의 흐름

<details><summary>정답 보기</summary>

(b). BOLD는 활동에 뒤따르는 혈류 변화가 만든 산소 상태의 차이를 잽니다. 신경 활동의 간접 지표이므로 느리고, 혈관 반응이 다른 집단에서는 해석에 주의가 필요합니다.

</details>

**2.** 64×64×36 voxel 영상을 TR 2초로 6분 동안 찍었습니다. 4D 배열의 모양은? (단답)

<details><summary>정답 보기</summary>

(64, 64, 36, 180)입니다. 6분은 360초이고 2초마다 한 장이므로 180장입니다. 분석 때는 마스크 안 voxel 수를 V라 하면 (180 × V) 행렬로 펼칩니다.

</details>

**3.** affine 행렬의 역할로 가장 알맞은 것은?

(a) 영상의 밝기를 보정한다 (b) voxel 번호를 실제 공간 좌표(mm)로 바꾼다 (c) 움직임을 보정한다 (d) 파일을 압축한다

<details><summary>정답 보기</summary>

(b). affine은 배열의 칸 번호와 물리적 위치를 잇습니다. 좌우 방향도 이 행렬의 부호로 정해지므로, 영상을 변환·저장하는 모든 단계에서 affine이 함께 따라가야 합니다.

</details>

**4.** `sub-07_ses-2_task-memory_run-3_bold.nii.gz`에서 읽을 수 있는 정보를 모두 적으세요. (단답)

<details><summary>정답 보기</summary>

피험자 07, 두 번째 세션, memory 과제, 세 번째 run, 자료 종류는 BOLD 기능 영상, 형식은 압축된 NIfTI입니다. TR 같은 획득 정보는 이름이 아니라 같은 이름의 `.json` 사이드카에서 읽습니다.

</details>

**5.** 처리된 통계 지도를 16비트 정수로 저장하면 생기는 문제는?

<details><summary>정답 보기</summary>

소수점 아래가 반올림되어 서로 다른 값이 크게 줄어듭니다(양자화 오류). t 값 2.31과 2.49가 같은 값이 되는 식입니다. 처리 결과는 실수형(float32 등)으로 저장하고, 원자료는 처음 형식 그대로 읽기 전용으로 보관합니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 4D 배열에서 voxel 시계열을 꺼내고 "시간 × voxel" 행렬로 바꿨다.
- [ ] affine 왕복 변환을 `assert`로 검산했다.
- [ ] BIDS 파일 이름을 피험자·과제·run으로 풀어 표로 만들었다.
- [ ] 공개 데이터셋 하나의 BIDS 구조와 TR을 노트에 적었다.

## 더 읽을거리
- Poldrack RA, Mumford JA, Nichols TE. *Handbook of Functional MRI Data Analysis.* Cambridge University Press, 2011. 출판사 페이지: <https://www.cambridge.org/core/books/handbook-of-functional-mri-data-analysis/8EDF966C65811FCCC306F7C916228529> (doi:[10.1017/CBO9780511895029](https://doi.org/10.1017/CBO9780511895029)) — 1장(개요), 2장 앞부분(영상과 좌표), 부록 B·C(자료 관리와 파일 형식).
- Gorgolewski KJ, et al. The brain imaging data structure, a format for organizing and describing outputs of neuroimaging experiments. *Sci Data.* 2016;3:160044. doi:[10.1038/sdata.2016.44](https://doi.org/10.1038/sdata.2016.44)
- Logothetis NK. What we can do and what we cannot do with fMRI. *Nature.* 2008;453:869–878. doi:[10.1038/nature06976](https://doi.org/10.1038/nature06976)
- D'Esposito M, Deouell LY, Gazzaley A. Alterations in the BOLD fMRI signal with ageing and disease: a challenge for neuroimaging. *Nat Rev Neurosci.* 2003;4:863–872. doi:[10.1038/nrn1246](https://doi.org/10.1038/nrn1246)
- NIfTI 공식 페이지: <https://nifti.nimh.nih.gov/> · nibabel 문서: <https://nipy.org/nibabel/> · BIDS: <https://bids.neuroimaging.io>

---
[← 이전: 코스 지도](../../../README.md) · [코스 지도](../../../README.md) · [다음 →](day-D2.md)
