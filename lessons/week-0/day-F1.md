# Day F1 — 터미널 첫걸음과 환경 설치

> **주차:** 0주차 · **예상 시간:** 75–90분 · **산출물:** `notebooks/week-0/F1_hello.ipynb`

## 오늘의 목표
- 터미널에서 `pwd`, `ls`, `cd`, `mkdir`로 폴더 사이를 오가며 내가 어디에 있는지 말할 수 있다.
- conda로 이 코스 전용 환경(`neurobio`)을 만들고 켤 수 있다.
- JupyterLab을 실행해 노트북의 셀(cell)에서 첫 Python 코드를 돌릴 수 있다.

## 🎬 영상으로 먼저 보기

- [Linux/Mac Terminal Tutorial: Navigating your Filesystem — Corey Schafer](https://www.youtube.com/watch?v=j6vKLJxAKfw) (8:33)
- **무엇에 주목할까:** 명령어를 외우려 하지 말고, 화면 속 "지금 내가 있는 폴더"가 명령을 칠 때마다 어떻게 바뀌는지만 눈으로 따라가세요. `pwd`(어디에 있나), `ls`(뭐가 있나), `cd`(이동) 세 가지만 건지면 충분합니다.

- [Jupyter Notebook Tutorial: Introduction, Setup, and Walkthrough — Corey Schafer](https://www.youtube.com/watch?v=HW29067qVWk) (30:20)
- **무엇에 주목할까:** 앞쪽 10–15분만 봐도 됩니다. 셀에 코드를 쓰고 Shift+Enter로 실행하면 바로 아래에 결과가 나오는 흐름에 주목하세요. 영상은 Jupyter Notebook 화면이고 우리는 JupyterLab을 쓰지만, 셀을 다루는 방식은 같습니다.

## 개념 설명

### 터미널은 "글자로 하는 Finder"다

Finder에서는 폴더를 더블클릭해서 들어가고, 눈으로 파일 목록을 봅니다. 터미널(terminal)은 똑같은 일을 마우스 대신 글자로 합니다. 폴더에 들어가는 것은 `cd`(change directory), 목록을 보는 것은 `ls`(list), 지금 어느 폴더 안에 서 있는지 확인하는 것은 `pwd`(print working directory)입니다.

왜 굳이 글자로 할까요? 실험실에서 프로토콜을 글로 적어 두는 이유와 같습니다. "37도에서 30분 배양"이라고 적혀 있으면 누구든 똑같이 재현할 수 있지만, "대충 이렇게 했어요"는 재현할 수 없습니다. 마우스 클릭은 기록이 남지 않지만 명령어는 그대로 복사해 다시 실행할 수 있습니다. 생명정보학에서 재현성(reproducibility)을 강조하는 만큼, 터미널은 피할 수 없는 도구입니다.

터미널에는 항상 "현재 위치"가 있습니다. 이것을 작업 폴더(working directory)라고 부릅니다. 터미널을 처음 열면 보통 홈 폴더(home, 기호로는 `~`)에 서 있습니다. 명령은 모두 "지금 서 있는 곳"을 기준으로 실행되기 때문에, 뭔가 안 될 때 가장 먼저 할 일은 `pwd`를 쳐서 내 위치를 확인하는 것입니다.

### 경로: 파일의 주소

경로(path)는 파일이나 폴더의 주소입니다. 주소를 말하는 방법은 두 가지가 있습니다.

절대 경로(absolute path)는 "서울시 ○○구 ○○로 12"처럼 맨 꼭대기부터 다 적는 주소입니다. macOS에서는 `/Users/내이름/Documents/neurodegeneration-bioinformatics`처럼 `/`로 시작합니다. 어디에 서 있든 항상 같은 곳을 가리킵니다.

상대 경로(relative path)는 "여기서 두 블록 가서 왼쪽"처럼 현재 위치를 기준으로 한 주소입니다. 지금 프로젝트 폴더 안에 있다면 `notebooks/week-0`이라고만 써도 됩니다. 짧아서 편하지만, 서 있는 위치가 달라지면 다른 곳을 가리키거나 "그런 곳 없음" 오류가 납니다.

자주 쓰는 기호 세 개만 기억하세요. `~`는 내 홈 폴더, `.`은 지금 폴더, `..`은 한 단계 위 폴더입니다. 그래서 `cd ..`은 "한 층 위로 올라가기"입니다. 앞으로 "파일을 찾을 수 없다"는 오류를 수없이 만날 텐데, 열에 아홉은 경로 문제입니다. 오늘 이 개념을 잡아 두면 나중에 시간을 많이 아낍니다.

### conda 환경: 실험마다 따로 쓰는 실험대

Python으로 분석하려면 `pandas`, `numpy` 같은 라이브러리(library, 남이 만들어 둔 도구 모음)를 설치해야 합니다. 그런데 프로젝트마다 필요한 도구와 버전이 다릅니다. 한 실험대에서 RNA 작업과 단백질 작업을 섞어 하면 오염이 생기듯, 한 컴퓨터에 모든 것을 마구 설치하면 서로 충돌합니다.

conda는 "프로젝트별 전용 실험대"를 만들어 주는 도구입니다. 이 실험대를 환경(environment)이라고 부릅니다. 오늘은 `neurobio`라는 환경을 하나 만들고, 거기에만 이 코스에 필요한 도구를 넣습니다. 환경을 켜는 것(activate)은 그 실험대 앞에 앉는 것이고, 켜면 터미널 프롬프트 앞에 `(neurobio)`가 붙습니다.

Miniforge는 conda를 설치해 주는 가볍고 무료인 설치 프로그램입니다. 이미 Anaconda나 Miniconda가 깔려 있다면 conda가 이미 있는 것이므로 새로 설치할 필요가 없습니다.

### JupyterLab: 실험 노트처럼 쓰는 코드 편집기

JupyterLab은 웹 브라우저에서 열리는 작업 공간입니다. 여기서 만드는 노트북(notebook, 확장자 `.ipynb`) 파일은 셀(cell)이라는 칸으로 나뉘어 있고, 셀 하나에 코드 몇 줄을 쓰고 Shift+Enter를 누르면 바로 아래에 결과가 나옵니다.

실험 노트에 "한 단계 하고 → 결과 적고 → 다음 단계"를 적는 것과 같은 리듬입니다. 전체 프로그램을 한 번에 다 짜지 않아도 되고, 한 줄씩 해 보며 확인할 수 있어서 초보자에게 특히 좋습니다. 한 가지만 기억하세요. JupyterLab은 터미널에서 `jupyter lab`을 실행한 **그 폴더**를 기준으로 열립니다. 그래서 항상 프로젝트 폴더로 `cd` 한 다음 실행합니다.

## 예시로 이해하기

### 예시 1 — 터미널에서 폴더 만들고 돌아다니기

아래는 터미널에 치는 명령입니다(Python 코드가 아닙니다). `#` 뒤는 설명이니 치지 않아도 됩니다.

```bash
cd ~                      # 홈 폴더로 이동
mkdir terminal-practice   # 연습용 폴더 만들기
cd terminal-practice      # 그 안으로 들어가기
mkdir data notebooks      # 폴더 두 개를 한 번에 만들기
ls                        # 뭐가 있는지 보기
cd data                   # data 안으로
pwd                       # 지금 어디?
cd ..                     # 한 단계 위로
pwd
```

출력 (`ls`와 두 번의 `pwd` 부분; 실제로는 `~` 자리에 `/Users/내이름`이 나옵니다):

```text
data
notebooks
/Users/내이름/terminal-practice/data
/Users/내이름/terminal-practice
```

`cd data`를 한 뒤에는 주소 끝에 `/data`가 붙고, `cd ..` 뒤에는 다시 사라졌습니다. 이것이 "현재 위치가 바뀐다"는 뜻입니다.

### 예시 2 — 같은 곳을 가리키는 두 가지 주소

홈 폴더에 서 있다고 합시다. 아래 두 명령은 같은 폴더로 이동합니다.

```bash
cd terminal-practice/data                 # 상대 경로: 지금 위치 기준
cd ~/terminal-practice/data               # ~ 로 시작: 어디에 서 있든 통함
```

첫 번째는 홈 폴더에 서 있을 때만 통합니다. 다른 폴더에 서 있으면 `no such file or directory`가 나옵니다. 두 번째는 어디에서 치든 통합니다. 헷갈릴 때는 `~`로 시작하는 주소를 쓰는 것이 안전합니다.

### 예시 3 — 노트북의 첫 셀

JupyterLab 노트북의 셀에 아래를 쓰고 Shift+Enter를 누릅니다.

```python
print("Hello, bioinformatics!")
print(2 + 3)
```

출력:

```text
Hello, bioinformatics!
5
```

`print()`는 괄호 안의 것을 화면에 보여 주라는 명령입니다. 따옴표 안의 글자는 그대로, 계산식은 계산한 결과가 나옵니다.

## 직접 해보기

> 아래 2–4단계의 설치 명령은 이 레슨을 쓰면서 직접 실행해 확인하지 못했습니다(이미 conda가 설치된 컴퓨터에서 작성). 설치 화면의 문구는 버전에 따라 조금 다를 수 있습니다.

1. **터미널 열기.** `Cmd + Space`를 누르고 "터미널"(또는 Terminal)을 입력해 실행합니다. `pwd`와 `ls`를 한 번씩 쳐 봅니다.

2. **conda가 이미 있는지 확인.**

   ```bash
   conda --version
   ```

   `conda 24.x.x`처럼 버전이 나오면 4단계로 건너뜁니다. `command not found`가 나오면 3단계로 갑니다.

3. **Miniforge 설치 (conda가 없을 때만).** 아래 두 줄을 차례로 실행합니다. ([Miniforge 공식 안내](https://github.com/conda-forge/miniforge)의 방법입니다.)

   ```bash
   curl -L -O "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-$(uname)-$(uname -m).sh"
   bash Miniforge3-$(uname)-$(uname -m).sh
   ```

   라이선스 화면은 Enter로 넘기고 `yes`를 입력합니다. 설치 위치는 기본값 그대로 Enter, 마지막에 셸 초기화(conda init)를 묻는 질문에는 `yes`를 입력합니다. 끝나면 **터미널을 완전히 닫고 다시 엽니다.** 프롬프트 앞에 `(base)`가 보이면 성공입니다.

4. **코스 전용 환경 만들기.** 몇 분 걸립니다. 중간에 `Proceed ([y]/n)?`가 나오면 `y`를 누릅니다.

   ```bash
   conda create -n neurobio python=3.12 jupyterlab pandas numpy matplotlib
   ```

5. **환경 켜기와 확인.**

   ```bash
   conda activate neurobio
   python --version
   ```

   예상 출력: `Python 3.12.x` (프롬프트 앞이 `(neurobio)`로 바뀝니다)

6. **프로젝트 폴더 만들고 들어가기.** `-p`는 "중간 폴더가 없으면 같이 만들고, 이미 있으면 그냥 넘어가라"는 뜻입니다.

   ```bash
   mkdir -p ~/Documents/neurodegeneration-bioinformatics/notebooks/week-0
   cd ~/Documents/neurodegeneration-bioinformatics
   pwd
   ```

7. **JupyterLab 실행.**

   ```bash
   jupyter lab
   ```

   브라우저에 JupyterLab이 열립니다. 왼쪽 파일 목록에서 `notebooks` → `week-0`으로 들어간 뒤, Launcher의 **Notebook → Python 3**을 클릭합니다.

8. **노트북 이름 바꾸기.** 탭의 `Untitled.ipynb`를 우클릭 → Rename Notebook → `F1_hello.ipynb`.

9. **첫 셀 실행.** 예시 3의 코드를 치고 Shift+Enter. 그다음 새 셀에 아래를 실행해 라이브러리가 잘 설치됐는지 확인합니다.

   ```python
   import sys
   import pandas as pd
   import numpy as np
   print(sys.version_info.major, sys.version_info.minor)
   print("pandas OK, numpy OK")
   ```

   출력 (첫 줄의 숫자는 설치한 Python 버전입니다. 4단계대로 했다면 `3 12`):

   ```text
   3 12
   pandas OK, numpy OK
   ```

10. **저장하고 끄기.** `Cmd + S`로 저장합니다. 브라우저 탭을 닫고, 터미널로 돌아가 `Ctrl + C`를 누른 뒤 `y`를 입력하면 JupyterLab이 꺼집니다.

⚠️ **흔한 오류 1 — `conda: command not found` 또는 `jupyter: command not found`.** 설치 직후 터미널을 다시 열지 않았거나, `conda activate neurobio`를 잊은 경우가 대부분입니다. 프롬프트 앞에 `(neurobio)`가 있는지 먼저 보세요. 터미널을 새로 열 때마다 환경을 다시 켜야 합니다.

⚠️ **흔한 오류 2 — `cd: no such file or directory`.** 오타이거나, 내가 생각한 곳에 서 있지 않은 것입니다. `pwd`로 위치를, `ls`로 실제 폴더 이름을 확인하세요. 폴더 이름을 몇 글자 치고 `Tab` 키를 누르면 자동 완성되어 오타를 줄일 수 있습니다. 대소문자도 구분합니다(`Documents` ≠ `documents`).

## 퀴즈

**1.** 터미널에서 "지금 내가 어느 폴더에 서 있는지"를 보여 주는 명령은?

(a) `ls` (b) `pwd` (c) `cd` (d) `mkdir`

<details><summary>정답 보기</summary>

(b) `pwd`. print working directory의 줄임말로 현재 작업 폴더의 절대 경로를 보여 줍니다. `ls`는 그 폴더 안의 내용물을 보여 주고, `cd`는 이동, `mkdir`은 폴더 만들기입니다.

</details>

**2.** `/Users/mina/Documents/project/notebooks`에 서 있을 때 `cd ..`을 한 번 실행하면 어디로 가나요? (단답)

<details><summary>정답 보기</summary>

`/Users/mina/Documents/project`. `..`은 "한 단계 위 폴더"를 뜻합니다. 두 번 실행하면 `/Users/mina/Documents`까지 올라갑니다.

</details>

**3.** conda 환경을 프로젝트마다 따로 만드는 가장 큰 이유는?

(a) 컴퓨터가 빨라져서 (b) 프로젝트마다 필요한 라이브러리와 버전이 서로 충돌하지 않게 하려고 (c) 인터넷 없이 쓰려고 (d) 파일을 자동으로 백업하려고

<details><summary>정답 보기</summary>

(b). 환경은 프로젝트 전용 실험대와 같아서, 한 환경에 설치한 도구가 다른 환경에 영향을 주지 않습니다. 덕분에 나중에 다른 사람이 같은 환경을 다시 만들어 분석을 재현하기도 쉽습니다.

</details>

**4.** 터미널을 새로 열었더니 `jupyter lab`이 `command not found`라고 합니다. 가장 먼저 해 볼 일은? (단답)

<details><summary>정답 보기</summary>

`conda activate neurobio`로 환경을 켭니다. JupyterLab은 `neurobio` 환경 안에 설치했기 때문에 환경을 켜지 않으면 터미널이 찾지 못합니다. 프롬프트 앞의 `(neurobio)` 표시로 켜졌는지 확인할 수 있습니다.

</details>

**5.** Jupyter 노트북에서 셀을 실행하는 단축키는?

(a) Enter (b) Cmd + S (c) Shift + Enter (d) Ctrl + C

<details><summary>정답 보기</summary>

(c) Shift + Enter. 그냥 Enter는 셀 안에서 줄바꿈만 합니다. Cmd + S는 저장, Ctrl + C는 터미널에서 실행 중인 프로그램(JupyterLab 서버)을 멈출 때 씁니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] 터미널에서 `pwd`, `ls`, `cd`, `mkdir`을 각각 한 번 이상 써 봤다.
- [ ] `conda activate neurobio` 후 프롬프트에 `(neurobio)`가 보인다.
- [ ] `~/Documents/neurodegeneration-bioinformatics/notebooks/week-0/` 폴더가 있다.
- [ ] `F1_hello.ipynb`에서 `print`와 `import pandas`가 오류 없이 실행된다.
- [ ] JupyterLab을 저장하고 `Ctrl + C`로 끌 수 있다.

---
[← 이전](../../README.md) · [코스 지도](../../README.md) · [다음 →](day-F2.md)
