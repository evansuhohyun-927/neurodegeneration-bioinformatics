# Day 38 — 남의 컴퓨터에서도 돌아가게: 재현성

> **주차:** 6주차 · **예상 시간:** 75–90분 · **산출물:** `environment.yml`, 실행 가능한 `README.md`

## 오늘의 목표
- 재현성(reproducibility)의 네 재료(환경, 실행 순서, 데이터 받는 법, random seed)를 설명할 수 있다.
- `environment.yml`을 작성하고 현재 환경의 라이브러리 버전을 기록할 수 있다.
- 처음 보는 사람이 따라 할 수 있는 README를 쓸 수 있다.

## 🎬 영상으로 먼저 보기

- [Python Tutorial: Anaconda - Installation and Using Conda — Corey Schafer](https://www.youtube.com/watch?v=YJC6ldI3hWk) (약 11분)
- **무엇에 주목할까:** 환경(environment)을 만들고, 활성화하고, 내보내는 세 동작에 주목하세요. 설치 부분은 이미 했으니 건너뛰고, 환경을 파일로 내보내 다른 곳에서 다시 만드는 부분을 집중해서 봅니다.

- [Sarah Gibson - Sharing Reproducible Python Environments with Binder — EuroPython Conference](https://www.youtube.com/watch?v=wTVMHallSSA) (약 28분, 앞 10분만 봐도 충분)
- **무엇에 주목할까:** "내 컴퓨터에서는 되는데"가 왜 생기는지, 환경 파일 하나가 그 문제를 어떻게 줄이는지에 대한 설명을 들으세요. Binder 자체는 이 과정에서 쓰지 않아도 됩니다.

## 개념 설명

### 재현성은 실험 노트의 "재료 및 방법"이다

실험실에서 Western blot 결과를 발표할 때 항체의 제조사·카탈로그 번호·희석 배수를 적지 않으면 누구도 따라 할 수 없습니다. 분석도 같습니다. 재현성이란 **다른 사람(또는 6개월 뒤의 나)이 같은 데이터와 같은 코드로 같은 숫자와 그림을 다시 얻을 수 있는 성질**입니다. 계산 연구의 재현성을 위한 실천 규칙은 Sandve 등 (2013) *PLoS Comput Biol* "Ten simple rules for reproducible computational research"와 Wilson 등 (2017) *PLoS Comput Biol* "Good enough practices in scientific computing"에 잘 정리되어 있습니다. 둘 다 무료로 읽을 수 있고 길지 않습니다.

오늘 챙길 재료는 네 가지입니다.

| 실험실의 기록 | 분석에서의 대응물 | 오늘 만들 것 |
|---|---|---|
| 시약·항체 lot 번호 | 라이브러리 이름과 버전 | `environment.yml` |
| 프로토콜의 단계 순서 | 노트북 실행 순서 | README의 "실행 순서" |
| 시료를 어디서 받았는지 | 데이터 다운로드 방법과 버전 | README의 "데이터 받기" |
| 무작위 배정표 | random seed | 노트북 맨 위의 `SEED = 42` |

### 환경 파일: 무엇을, 얼마나 정확히 적을까

`environment.yml`은 conda에게 "이 이름의 환경에 이 패키지들을 설치해 달라"고 알려 주는 주문서입니다. `requirements.txt`는 pip용의 같은 역할을 하는 파일입니다. 둘 중 하나만 있어도 되지만, 이 과정의 폴더 구조에는 `environment.yml`이 있으므로 그것을 기본으로 합니다.

버전을 얼마나 정확히 적을지는 절충입니다. 버전을 전혀 적지 않으면(`pandas`) 1년 뒤 설치할 때 새 버전이 깔려 결과가 달라질 수 있습니다. 반대로 모든 의존 패키지의 빌드 번호까지 적으면 다른 운영체제에서 설치가 실패하기 쉽습니다. 초보자에게 권하는 타협은 두 가지를 함께 남기는 것입니다. (1) 사람이 읽기 쉬운 짧은 `environment.yml`(직접 쓰는 패키지만, 주요 버전 표기), (2) 분석을 실제로 돌린 시점의 정확한 버전 목록을 README나 별도 파일에 기록. 논문의 Methods에 "pandas 2.x를 사용했다"라고 쓰는 것과 같은 수준의 정보입니다.

### 실행 순서, 데이터, 그리고 seed

노트북은 셀을 아무 순서로나 실행할 수 있어서, 화면에 보이는 결과가 "위에서 아래로" 실행한 결과가 아닐 수 있습니다. 재현성 점검의 가장 간단한 방법은 **Kernel → Restart Kernel and Run All Cells**입니다. 이렇게 돌려도 오류 없이 같은 그림이 나와야 합니다.

데이터 파일은 보통 Git 저장소에 넣지 않습니다(용량, 라이선스 때문). 대신 README에 **어디서(URL), 어떤 버전을, 어느 폴더에** 받아야 하는지 적습니다. Day 15에 만든 `data/README.md`가 바로 그 문서이니 README에서 링크로 연결하면 됩니다.

**random seed**는 난수 생성기의 출발점입니다. 5주차의 교차검증, 모델 초기화, 무작위 표본 추출은 모두 난수를 쓰므로 seed를 고정하지 않으면 실행할 때마다 성능 숫자가 조금씩 달라집니다. `scikit-learn`에서는 `random_state=SEED`, `numpy`에서는 `np.random.default_rng(SEED)` 형태로 고정합니다. 단, seed 고정은 "같은 숫자를 다시 얻는 것"이지 "결과가 옳다"는 보증이 아닙니다. seed를 바꿨을 때 결론이 뒤집히는지는 내일 민감도 분석에서 봅니다.

## 예시로 이해하기

### 예시 1 — 현재 환경의 버전 기록하기

```python
import sys
import numpy, pandas, scipy, matplotlib, seaborn, sklearn, statsmodels

print("python      ", sys.version.split()[0])
for lib in [numpy, pandas, scipy, matplotlib, seaborn, sklearn, statsmodels]:
    print(f"{lib.__name__:<12}", lib.__version__)
```

출력(이 레슨을 쓴 컴퓨터의 경우. 여러분의 숫자는 다를 수 있고, 달라도 정상입니다):

```text
python       3.13.9
numpy        2.3.5
pandas       2.3.3
scipy        1.16.3
matplotlib   3.10.6
seaborn      0.13.2
sklearn      1.7.2
statsmodels  0.14.5
```

이 출력을 그대로 README의 "분석에 사용한 버전" 절에 붙여 넣습니다. `ModuleNotFoundError`가 나오면 그 라이브러리는 설치되어 있지 않은 것이니 `import` 줄과 리스트에서 빼고 다시 실행하세요.

### 예시 2 — `environment.yml` 예시

```yaml
name: neurobio
channels:
  - conda-forge
dependencies:
  - python=3.12
  - pandas
  - numpy
  - scipy
  - matplotlib
  - seaborn
  - scikit-learn
  - statsmodels
  - jupyterlab
  - pip
  - pip:
      - wfdb
```

읽는 법: `name`은 환경 이름, `channels`는 패키지를 받아 올 저장소, `dependencies`는 설치할 목록입니다. `python=3.12`은 3.12 계열을 뜻합니다. 맨 아래 `pip:` 아래에는 conda 대신 pip로 설치할 패키지를 적습니다(`wfdb`는 PhysioNet의 WFDB 형식을 읽을 때만 필요하니, 쓰지 않았다면 그 두 줄을 지우세요). YAML은 **들여쓰기(공백 2칸)**가 문법이므로 탭 대신 공백을 씁니다.

새 컴퓨터에서 이 파일로 환경을 만드는 명령(터미널):

```bash
conda env create -f environment.yml
conda activate neurobio
jupyter lab
```

첫 명령은 패키지를 내려받아 설치한 뒤 `done`과 함께 `conda activate neurobio` 안내문을 보여 줍니다. 수 분이 걸릴 수 있습니다. 이 저장소의 `environment.yml`은 실제로 새 환경을 만들어 과정 패키지가 모두 불러와지는지 확인했습니다. 그때 겪은 일 두 가지: (1) 마지막 pip 단계가 일시적인 네트워크 오류(`Failed to resolve 'pypi.org'`)로 실패했는데, 환경은 이미 만들어져 있으므로 `conda activate neurobio` 뒤 `pip install wfdb`만 다시 하면 됩니다. (2) 버전을 정하지 않으면 pandas 3.x가 깔려 레슨 출력과 표시가 달라질 수 있어, `pandas<3`으로 고정했습니다. 버전 고정이 재현성에 왜 필요한지 보여 주는 실제 사례입니다.

conda를 쓰지 않는 사람을 위해 `requirements.txt`도 함께 두고 싶다면, 같은 패키지 이름을 한 줄에 하나씩 적으면 됩니다(`pandas`, `numpy`, …). 설치 명령은 `pip install -r requirements.txt`입니다.

### 예시 3 — seed가 있을 때와 없을 때

```python
import numpy as np

# 씨앗 없이: 실행할 때마다 다른 숫자
print("seed 없음 :", np.random.default_rng().integers(0, 100, size=5))

# 씨앗 고정: 언제 실행해도 같은 숫자
SEED = 42
print("seed=42 1회:", np.random.default_rng(SEED).integers(0, 100, size=5))
print("seed=42 2회:", np.random.default_rng(SEED).integers(0, 100, size=5))
```

출력(첫 줄은 실행할 때마다 달라집니다):

```text
seed 없음 : [27 79 77 97 74]
seed=42 1회: [ 8 77 65 43 43]
seed=42 2회: [ 8 77 65 43 43]
```

### 예시 4 — README 뼈대

```markdown
# 퇴행성 뇌질환 바이오인포매틱스 실습

우주비행 마우스 뇌 분자 데이터(NASA OSDR OSD-536)와 사람 파킨슨병 운동 데이터(PhysioNet)를
각각 탐색 분석한 교육용 프로젝트. 두 데이터는 통계적으로 결합하지 않았다.

## 1. 환경 만들기
    conda env create -f environment.yml
    conda activate neurobio

## 2. 데이터 받기
데이터는 저장소에 포함되어 있지 않다. `data/README.md`의 안내(출처 URL, 버전, 다운로드 날짜,
저장 위치)를 따라 `data/osdr_536/`과 `data/physionet_pd/`에 내려받는다.

## 3. 실행 순서
1. `notebooks/01_setup_and_metadata.ipynb`
2. `notebooks/02_osdr_qc_and_pca.ipynb`
3. `notebooks/03_osdr_pathway_analysis.ipynb`
4. `notebooks/04_pd_data_qc.ipynb`
5. `notebooks/05_pd_feature_analysis.ipynb`

각 노트북은 "Restart Kernel and Run All Cells"로 실행한다. random seed는 42로 고정했다.

## 4. 결과물
- 그림: `figures/`
- 보고서: `reports/`

## 5. 분석에 사용한 버전
(예시 1의 출력을 붙여 넣는다)

## 6. 데이터 인용과 라이선스
(각 데이터셋 페이지의 인용 지침과 라이선스를 그대로 옮겨 적는다)

## 7. 한계
교육용 탐색 분석이며 진단·치료 목적이 아니다.
```

노트북 파일 이름은 실라부스의 권장 구조를 따른 예시입니다. 여러분의 실제 파일 이름으로 바꾸세요.

## 직접 해보기

1. JupyterLab에서 새 셀에 예시 1의 코드를 실행하고 출력을 복사해 둡니다.
2. 프로젝트 최상위 폴더에 `environment.yml`을 만듭니다(이미 있다면 엽니다). 예시 2를 바탕으로, 여러분의 노트북들이 실제로 `import`하는 라이브러리만 남기거나 추가합니다. 노트북에서 `import`로 시작하는 줄을 훑어보면 목록을 만들 수 있습니다.
3. 모든 노트북의 맨 위 셀에 `SEED = 42`가 있고, 난수를 쓰는 곳(`random_state=`, `default_rng(`, `shuffle=True`)에서 그 변수를 쓰는지 확인합니다.
4. 각 노트북을 **Restart Kernel and Run All Cells**로 실행합니다. 오류가 나면 고칩니다. 가장 흔한 원인은 "나중 셀에서 만든 변수를 앞 셀에서 쓰는 것"과 "내 컴퓨터에만 있는 절대 경로"입니다.
5. 두 번 연속 실행해 주요 숫자(예: 효과크기, ROC-AUC)가 같은지 확인합니다.
6. 예시 4의 뼈대로 `README.md`를 고쳐 씁니다. Day 1에 만든 내용은 지우지 말고 위 구조 안에 녹여 넣습니다.
7. `data/README.md`에 데이터셋별 URL, 버전, 다운로드 날짜, 저장 폴더가 모두 있는지 확인하고 빠진 것을 채웁니다. 버전과 라이선스는 반드시 데이터셋 페이지에서 직접 확인해 적습니다.
8. (선택) 가능하다면 새 환경 테스트를 합니다: `conda env create -f environment.yml` → `conda activate neurobio` → 노트북 Run All. 시간이 오래 걸리면 내일로 미뤄도 됩니다.
9. commit합니다. 메시지 예: `Add environment.yml and runnable README`.

⚠️ **흔한 오류 1 — 절대 경로.** `pd.read_csv("/Users/내이름/Documents/.../data.csv")`는 다른 컴퓨터에서 반드시 실패합니다. 프로젝트 폴더 기준의 상대 경로(`"../data/osdr_536/파일이름.csv"`)로 바꾸세요.

⚠️ **흔한 오류 2 — YAML 들여쓰기.** `environment.yml`에서 `- pandas` 앞의 공백 수가 줄마다 다르거나 탭이 섞이면 `conda`가 파일을 읽지 못합니다. 편집기에서 공백 문자 표시를 켜고 2칸으로 맞추세요.

## 퀴즈

**1.** (단답) 노트북의 재현성을 확인하는 가장 간단한 메뉴 동작은?

<details><summary>정답 보기</summary>

**Restart Kernel and Run All Cells**. 커널을 새로 시작하면 메모리에 남아 있던 변수가 사라지므로, 셀을 위에서 아래로 실행했을 때만 재현되는 결과인지 확인할 수 있습니다.

</details>

**2.** 데이터 파일을 Git 저장소에 넣지 않는 대신 README에 꼭 적어야 하는 것을 모두 고르세요.
(a) 다운로드 URL (b) 데이터셋 버전 (c) 저장할 폴더 위치 (d) 내 컴퓨터의 사용자 이름

<details><summary>정답 보기</summary>

**(a), (b), (c)**. 어디서, 어떤 버전을, 어디에 두어야 하는지 알면 다른 사람이 같은 데이터를 준비할 수 있습니다. 사용자 이름은 필요 없고, 절대 경로에 들어가면 오히려 재현을 방해합니다.

</details>

**3.** (O/X) random seed를 고정하면 분석 결과가 옳다는 것이 보장된다.

<details><summary>정답 보기</summary>

**X**. seed 고정은 같은 숫자를 다시 얻게 해 줄 뿐입니다. seed를 바꿨을 때 결론이 유지되는지는 별도의 민감도 분석으로 확인해야 합니다.

</details>

**4.** `environment.yml`에 `- pandas`라고만 적었을 때의 단점은?
(a) 설치가 불가능하다
(b) 나중에 설치하면 다른 버전이 깔려 결과가 달라질 수 있다
(c) conda가 pip를 대신 쓴다
(d) 단점이 없다

<details><summary>정답 보기</summary>

**(b)**. 버전을 지정하지 않으면 설치 시점의 최신 버전이 깔립니다. 그래서 분석 시점의 정확한 버전 목록을 README 등에 함께 기록해 두는 것이 좋습니다.

</details>

**5.** (단답) 실험실의 "항체 카탈로그 번호"에 해당하는 분석의 기록은 무엇인가요?

<details><summary>정답 보기</summary>

**라이브러리 이름과 버전**(그리고 데이터셋 버전)입니다. 같은 이름의 도구라도 버전에 따라 기본값과 동작이 달라질 수 있어서, 버전이 없으면 따라 하기 어렵습니다.

</details>

## 더 알아보기

> **📚 R 프로젝트의 environment.yml은 renv.lock**
> R에서 환경을 기록하는 가장 간단한 방법은 분석 끝에 `sessionInfo()` 출력을 파일로 저장하는 것입니다. 다른 컴퓨터에서 같은 버전을 되살리려면 renv가 만드는 `renv.lock`을 저장소에 함께 올리고 `renv::restore()`로 복원합니다. 글과 코드와 결과를 한 문서로 묶어 다시 실행하는 Quarto는 Jupyter 노트북의 Run All과 같은 역할입니다.
> → [심화 A — Day A7: Bioconductor 분석 맛보기와 재현성: 선형 모델, limma·DESeq2의 발상, sessionInfo, renv](../advanced/A-r-bioconductor/day-A7.md)

> **📚 난수 씨앗은 프로그램마다 다르다**
> `rng(1)`처럼 씨앗을 고정해도 MATLAB과 Octave(그리고 numpy)는 서로 다른 난수를 냅니다. 재현성 기록에는 씨앗뿐 아니라 프로그램 이름과 버전을 함께 적어야 합니다. 핵심 함수에는 답을 아는 입력으로 `assert` 테스트를 붙여, 코드를 고칠 때마다 결과가 바뀌지 않았는지 확인합니다.
> → [심화 B — Day B6: 좋은 코드 습관, 디버깅, 테스트, 속도](../advanced/B-matlab/day-B6.md)

## 오늘의 산출물 체크리스트
- [ ] `environment.yml`에 실제로 사용한 라이브러리가 모두 들어 있다.
- [ ] 모든 노트북이 Restart Kernel and Run All Cells로 오류 없이 실행된다.
- [ ] seed가 고정되어 있고, 두 번 실행한 주요 숫자가 같다.
- [ ] `README.md`에 환경 만들기, 데이터 받기, 실행 순서, 사용 버전, 인용/라이선스, 한계가 있다.
- [ ] 코드에 절대 경로가 남아 있지 않다.
- [ ] commit했다.

---
[← 이전](day-37.md) · [코스 지도](../../README.md) · [다음 →](day-39.md)
