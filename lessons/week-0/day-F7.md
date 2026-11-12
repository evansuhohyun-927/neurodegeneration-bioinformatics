# Day F7 — 오류 메시지 읽는 법과 Git 첫걸음

> **주차:** 0주차 · **예상 시간:** 75–90분 · **산출물:** `notebooks/week-0/F7_errors.ipynb`, `~/Documents/git-practice` 저장소(commit 2개)

## 오늘의 목표
- Traceback을 아래에서 위로 읽어 오류의 종류와 위치를 찾을 수 있다.
- 자주 만나는 오류 여섯 가지의 이름을 보고 원인을 짐작할 수 있다.
- `git init` → `git add` → `git commit`으로 변경 내용을 기록할 수 있다.

## 🎬 영상으로 먼저 보기

- [Python Tutorial: Using Try/Except Blocks for Error Handling — Corey Schafer](https://www.youtube.com/watch?v=NIWwJbo-9_8) (10:34)
- **무엇에 주목할까:** 오류가 났을 때 화면에 찍히는 오류 **이름**(`FileNotFoundError` 등)에 주목하세요. 오류마다 이름이 있고, 그 이름으로 상황을 구분해 대처할 수 있다는 것이 요점입니다. `try`/`except` 문법 자체는 오늘 예시 4에서 한 번만 써 봅니다.

- [Git Tutorial for Beginners: Command-Line Fundamentals — Corey Schafer](https://www.youtube.com/watch?v=HVsySz-h9r4) (30:33)
- **무엇에 주목할까:** 앞쪽 절반, 즉 내 컴퓨터 안에서 `git init`, `git status`, `git add`, `git commit`, `git log`를 쓰는 부분만 보면 됩니다. `git status`를 칠 때마다 파일의 상태가 어떻게 바뀌는지 따라가세요. 원격 저장소와 브랜치(clone, push, branch) 부분은 지금은 건너뛰어도 됩니다.

## 개념 설명

### 오류는 고장이 아니라 검사 결과지다

코드를 돌리다 빨간 글씨가 쏟아지면 뭔가 망가뜨린 것 같아 겁이 납니다. 하지만 오류 메시지는 컴퓨터가 "여기서, 이런 이유로 멈췄어요"라고 알려 주는 검사 결과지입니다. 전기영동 겔에 밴드가 안 나왔을 때 "실험이 망했다"에서 멈추지 않고 "어느 단계가 문제였을까"를 따지듯, 오류 메시지도 읽어서 원인을 찾으면 됩니다. 경력 많은 개발자도 매일 수십 번 오류를 봅니다. 차이는 오류를 안 내는 것이 아니라 빨리 읽는 것입니다.

Python의 오류 메시지를 Traceback(트레이스백, 역추적)이라고 부릅니다. 길어 보여도 읽는 순서만 알면 됩니다. **아래에서 위로** 읽습니다.

1. **맨 마지막 줄**이 가장 중요합니다. `오류이름: 설명` 형식입니다. 예: `KeyError: 'Sod2'`.
2. 그 **바로 위**에 오류가 난 코드 줄과 줄 번호가 있습니다.
3. 더 위쪽은 "그 줄에 도달하기까지 거쳐 온 경로"입니다. 함수가 함수를 부른 경우에 여러 층으로 나옵니다.

어제 `pd.read_csv`에 오타를 냈을 때 수십 줄이 나왔던 것은 pandas 내부의 경로가 전부 찍혔기 때문입니다. 그 안쪽은 읽을 필요가 없습니다. 맨 마지막 줄, 그리고 **내가 쓴 코드**가 나오는 부분만 찾으면 됩니다.

### 자주 만나는 오류 여섯 가지

오류 이름은 진단명과 같습니다. 이름만 알아도 원인의 범위가 확 줄어듭니다. 지난 엿새 동안 이미 대부분 만났습니다.

| 오류 이름 | 뜻 | 가장 흔한 원인 |
|---|---|---|
| `SyntaxError` | 문법이 틀려 읽을 수조차 없음 | 콜론·괄호·따옴표 빠짐 |
| `NameError` | 그런 이름을 모름 | 변수명 오타, 정의한 셀을 실행 안 함, 따옴표 빠짐 |
| `TypeError` | 자료형이 맞지 않음 | 문자열 + 숫자 |
| `KeyError` | 그런 키(또는 열 이름)가 없음 | 딕셔너리 키·열 이름의 오타, 대소문자 |
| `IndexError` | 그 번호 칸이 없음 | 0부터 세기를 잊음 |
| `FileNotFoundError` | 그런 파일이 없음 | 파일명 오타, 다른 폴더에 있음 |

`SyntaxError`와 `IndentationError`(들여쓰기 오류)는 조금 특별합니다. 다른 오류는 코드를 실행하다가 문제의 줄에서 멈추지만, 이 둘은 **실행을 시작하기도 전에** 납니다. 프로토콜 문장 자체가 말이 안 되어 첫 단계조차 시작할 수 없는 경우입니다.

오류를 만나면 이 순서로 해 보세요. ① 마지막 줄의 오류 이름과 설명을 읽는다. ② 화살표나 줄 번호가 가리키는 줄을 본다. ③ 그 줄에 쓰인 변수를 `print()`와 `type()`으로 찍어 본다. ④ 그래도 모르겠으면 마지막 줄을 그대로 복사해 검색하거나 AI 도구에 물어본다. 이때 오류 메시지 **전체**와 문제의 코드를 함께 붙여 넣어야 정확한 답을 얻습니다.

### Git은 코드의 실험 노트다

`report_final.docx`, `report_final2.docx`, `report_진짜최종.docx`. 누구나 겪어 본 상황입니다. Git은 이 문제를 해결하는 버전 관리(version control) 도구입니다. 파일 이름을 바꿔 가며 복사본을 쌓는 대신, 한 폴더 안에서 "이 시점의 상태"를 스냅숏으로 찍어 기록합니다.

실험 노트와 닮았습니다. 날짜와 함께 "오늘 무엇을 했고 왜 그렇게 했는지"를 적어 두면, 몇 달 뒤에도 그날의 상태를 되짚을 수 있습니다. Git에서 이 한 번의 기록을 커밋(commit)이라고 하고, 기록에 붙이는 한 줄 메모를 커밋 메시지라고 합니다. Git이 관리하는 폴더는 저장소(repository, 줄여서 repo)라고 부릅니다.

Git이 재현성에 중요한 이유는, 분석 결과가 "어떤 버전의 코드"에서 나왔는지 추적할 수 있기 때문입니다. 그림이 지난주와 달라졌다면 그 사이에 코드의 무엇이 바뀌었는지 Git이 정확히 보여 줍니다. 실라부스의 매일 루틴 마지막 단계가 "의미 있는 변경이 있으면 commit"인 이유입니다.

### 세 단계: 작업 → 스테이징 → 커밋

Git에서 기록은 두 번에 나눠 이루어집니다. 처음에는 번거로워 보이지만 이유가 있습니다.

택배 보내기를 떠올려 보세요. 책상 위 물건들(작업 폴더의 파일) 중에서 보낼 것만 골라 상자에 담고(`git add`), 송장을 붙여 발송합니다(`git commit`). 상자에 담는 중간 단계를 스테이징(staging)이라고 합니다. 이 단계 덕분에 파일 다섯 개를 고쳤더라도 서로 관련된 두 개만 골라 하나의 기록으로 남길 수 있습니다.

- `git status` — 지금 상태 확인. 무엇이 바뀌었고 무엇이 상자에 담겼는지 보여 줍니다. **헷갈리면 무조건 이것부터** 칩니다. 터미널의 `pwd`와 같은 역할입니다.
- `git add 파일명` — 그 파일을 상자에 담습니다.
- `git commit -m "메시지"` — 상자에 담긴 것을 메시지와 함께 기록합니다.
- `git log --oneline` — 지금까지의 기록을 한 줄씩 보여 줍니다.

커밋 메시지는 "무엇을 했는지"를 짧게 씁니다. `update`나 `수정`보다 `Add QC table for sample counts`처럼 구체적으로 쓰면 나중에 기록을 훑어볼 때 훨씬 유용합니다.

## 예시로 이해하기

> 아래 Traceback은 코드를 `.py` 파일로 저장해 실행했을 때의 실제 출력이며, 긴 파일 경로는 `F7_example.py`로 줄였습니다. Jupyter 노트북에서는 파일 이름 자리에 `Cell In[3], line 2`처럼 셀 번호가 나오고 문제의 줄 앞에 `---->` 화살표가 붙는 등 모양이 조금 다르지만, **맨 마지막 줄은 같고 읽는 법도 같습니다.** `~~~^^^` 같은 밑줄 표시는 Python 버전에 따라 다르게 보일 수 있습니다.

### 예시 1 — NameError: 한 글자 차이

```python
genes = ["Gfap", "Aif1", "Tnf"]
print(gene)
```

출력:

```text
Traceback (most recent call last):
  File "F7_example.py", line 2, in <module>
    print(gene)
          ^^^^
NameError: name 'gene' is not defined. Did you mean: 'genes'?
```

아래에서 위로 읽습니다. 마지막 줄: `NameError`, "`gene`이라는 이름이 정의되지 않았다". 친절하게 "`genes`를 말한 건가요?"라고 묻기까지 합니다. 그 위: 2번째 줄의 `print(gene)`. 변수는 `genes`로 만들고 `gene`으로 불렀습니다.

### 예시 2 — KeyError: 없는 키

```python
expression = {"Gfap": 12.5, "Tnf": 2.1}
print(expression["Sod2"])
```

출력:

```text
Traceback (most recent call last):
  File "F7_example.py", line 2, in <module>
    print(expression["Sod2"])
          ~~~~~~~~~~^^^^^^^^
KeyError: 'Sod2'
```

`KeyError` 뒤에 나오는 `'Sod2'`가 바로 "찾지 못한 키"입니다. pandas에서 없는 열 이름을 쓸 때도 같은 오류가 납니다.

### 예시 3 — 여러 층짜리 Traceback

함수가 함수를 부르면 Traceback이 여러 층이 됩니다.

```python
def fold_change(treated, control):
    return treated / control

def report(gene, treated, control):
    fc = fold_change(treated, control)
    print(f"{gene}: {fc}")

report("Gfap", 250.0, 100.0)
report("Il1b", 14.0, 0)
```

출력:

```text
Gfap: 2.5
Traceback (most recent call last):
  File "F7_example.py", line 9, in <module>
    report("Il1b", 14.0, 0)
    ~~~~~~^^^^^^^^^^^^^^^^^
  File "F7_example.py", line 5, in report
    fc = fold_change(treated, control)
  File "F7_example.py", line 2, in fold_change
    return treated / control
           ~~~~~~~~^~~~~~~~~
ZeroDivisionError: float division by zero
```

읽는 순서:

1. **맨 아래**: `ZeroDivisionError: float division by zero` — 0으로 나눴다.
2. **그 위**: 2번째 줄 `return treated / control`, `fold_change` 함수 안 — 실제로 멈춘 곳.
3. **더 위**: 5번째 줄, `report` 함수가 `fold_change`를 불렀다.
4. **맨 위**: 9번째 줄 `report("Il1b", 14.0, 0)` — 모든 것의 시작. 여기서 `control`에 0을 넣었다.

멈춘 곳은 2번째 줄이지만 **원인은 9번째 줄**에 있습니다. 증상이 나타난 곳과 원인이 있는 곳이 다를 수 있다는 점이 Traceback이 경로 전체를 보여 주는 이유입니다. 첫 번째 `report` 호출은 정상 출력됐다는 것도 보세요. 오류는 문제의 줄에서 멈출 뿐, 그 앞의 결과는 남아 있습니다.

### 예시 4 — 오류를 예상하고 대비하기

0으로 나누는 상황을 미리 예상했다면 `try`/`except`로 멈추지 않게 만들 수 있습니다.

```python
def safe_fold_change(treated, control):
    try:
        return treated / control
    except ZeroDivisionError:
        print("control이 0이라 계산할 수 없습니다. None을 돌려줍니다.")
        return None

print(safe_fold_change(250.0, 100.0))
print(safe_fold_change(14.0, 0))
```

출력:

```text
2.5
control이 0이라 계산할 수 없습니다. None을 돌려줍니다.
None
```

"일단 해 보고(`try`), 이 오류가 나면(`except`) 이렇게 하라"는 뜻입니다. 다만 초보 단계에서는 오류를 숨기기보다 **보고 고치는** 편이 낫습니다. `except`로 모든 오류를 덮어 버리면 데이터 문제를 모른 채 지나칠 수 있습니다.

### 예시 5 — Git의 한 사이클

아래는 터미널 명령입니다. 빈 폴더에서 파일 하나를 만들어 첫 커밋을 남기는 전체 흐름입니다.

```bash
mkdir ~/Documents/git-practice
cd ~/Documents/git-practice
git init
echo "# Git 연습" > README.md
git status
```

출력 (`git init`과 `git status` 부분):

```text
Initialized empty Git repository in /Users/내이름/Documents/git-practice/.git/
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	README.md

nothing added to commit but untracked files present (use "git add" to track)
```

`Untracked files`는 "Git이 아직 관리하지 않는 새 파일"이라는 뜻입니다. Git은 다음에 할 일(`git add`)까지 괄호 안에 알려 줍니다.

```bash
git add README.md
git status
git commit -m "Add README"
```

출력:

```text
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   README.md

[main (root-commit) a396166] Add README
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
```

`git add` 뒤에는 파일이 `Changes to be committed`(상자에 담김)로 옮겨졌고, `git commit` 뒤에는 기록이 남았습니다. `a396166` 같은 일곱 글자는 그 커밋의 고유 번호로, 여러분 화면에서는 다른 값이 나옵니다.

## 직접 해보기

### A. 오류 읽기 연습 (약 35분)

1. JupyterLab을 켜고 `notebooks/week-0/F7_errors.ipynb`를 만듭니다.

2. 예시 1–4를 셀 하나씩 실행합니다. 오류가 나는 것이 정상입니다. 각 셀 아래에 새 셀을 만들고, 맨 위 툴바의 드롭다운을 **Markdown**으로 바꾼 뒤 "오류 이름 / 몇 번째 줄 / 원인"을 한 줄로 적습니다.

3. **오류 맞히기.** 아래 네 조각을 각각 다른 셀에서 실행합니다. 실행하기 **전에** 어떤 오류가 날지 먼저 예상해 보세요.

   ```python
   print("3" + 4)
   ```

   ```python
   for gene in ["Gfap", "Tnf"]
       print(gene)
   ```

   ```python
   for gene in ["Gfap", "Tnf"]:
   print(gene)
   ```

   ```python
   values = [12.5, 3.2, "8.9"]
   total = 0
   for v in values:
       total = total + v
   print(total)
   ```

   각 오류의 마지막 줄은 차례로 다음과 같습니다.

   ```text
   TypeError: can only concatenate str (not "int") to str
   SyntaxError: expected ':'
   IndentationError: expected an indented block after 'for' statement on line 1
   TypeError: unsupported operand type(s) for +: 'float' and 'str'
   ```

4. **고치기.** 네 조각을 모두 고쳐서 오류 없이 실행되게 만듭니다. 네 번째는 리스트 안의 `"8.9"`가 문자열인 것이 원인입니다. 따옴표를 지우거나 `total + float(v)`로 고치면 24.6이 나옵니다. 실제 데이터에서 숫자 열에 글자가 섞여 있을 때 정확히 이 오류를 만납니다.

5. 노트북을 저장합니다.

### B. Git 첫 커밋 (약 35분)

> 오늘은 연습용 폴더에서 Git을 익힙니다. 코스 프로젝트 폴더의 진짜 저장소는 1주차 Day 1에서 만듭니다.

6. **Git 확인.** 터미널을 열고 실행합니다.

   ```bash
   git --version
   ```

   `git version 2.x.x`가 나오면 됩니다. "명령어 라인 개발자 도구" 설치 창이 뜨면 **설치**를 눌러 끝날 때까지 기다린 뒤 다시 실행합니다.

7. **내 이름 등록 (컴퓨터당 한 번만).** 커밋에 기록될 이름과 이메일을 본인 것으로 바꿔 입력합니다. 세 번째 줄은 기본 브랜치 이름을 `main`으로 정하는 설정입니다.

   ```bash
   git config --global user.name "Hong Gildong"
   git config --global user.email "gildong@example.com"
   git config --global init.defaultBranch main
   ```

8. **예시 5를 그대로 따라 합니다.** `git status`를 칠 때마다 출력이 어떻게 달라지는지 눈으로 확인합니다.

9. **두 번째 커밋.** 파일을 고치고 무엇이 바뀌었는지 확인한 뒤 기록합니다.

   ```bash
   echo "오늘 Traceback 읽는 법을 배웠다." >> README.md
   git status --short
   git diff
   ```

   출력:

   ```text
    M README.md
   diff --git a/README.md b/README.md
   index b01bdaf..4d507e4 100644
   --- a/README.md
   +++ b/README.md
   @@ -1 +1,2 @@
    # Git 연습
   +오늘 Traceback 읽는 법을 배웠다.
   ```

   `M`은 수정됨(modified), `+`로 시작하는 줄이 새로 추가된 줄입니다. (`git diff` 결과가 화면을 가득 채우고 멈춰 있으면 `q`를 눌러 빠져나옵니다.)

   ```bash
   git add README.md
   git commit -m "Add learning note"
   git log --oneline
   ```

   출력 (앞의 일곱 글자는 여러분 화면에서 다릅니다):

   ```text
   [main e9a1541] Add learning note
    1 file changed, 1 insertion(+)
   e9a1541 Add learning note
   a396166 Add README
   ```

   `git log`는 최신 커밋이 위에 오도록 보여 줍니다. 커밋이 두 개 쌓였습니다.

10. **기록하지 않을 파일 정하기.** 큰 데이터 파일이나 Jupyter 임시 폴더는 Git에 넣지 않습니다. `.gitignore`라는 파일에 무시할 목록을 적습니다.

    ```bash
    printf 'data/\n.ipynb_checkpoints/\n' > .gitignore
    mkdir data
    echo x > data/big.csv
    git status --short
    ```

    출력:

    ```text
    ?? .gitignore
    ```

    `data/big.csv`를 만들었는데도 목록에 나오지 않습니다. Git이 `data/` 폴더를 무시하고 있다는 뜻입니다. `??`는 아직 관리되지 않는 새 파일(`.gitignore` 자신)입니다. 이것도 `git add .gitignore` → `git commit -m "Add gitignore"`로 기록해 보세요.

⚠️ **흔한 오류 1 — `fatal: not a git repository`.** `git init`을 한 폴더가 아닌 다른 곳에 서 있는 것입니다. `pwd`로 위치를 확인하고 `cd ~/Documents/git-practice`로 돌아가세요. Git 명령은 저장소 폴더 안에서만 통합니다.

⚠️ **흔한 오류 2 — `git commit`을 쳤더니 이상한 편집 화면에 갇혔다.** `-m "메시지"`를 빼먹으면 메시지를 쓰라고 편집기(vim)가 열립니다. `Esc`를 누르고 `:q!`를 입력한 뒤 Enter를 치면 빠져나옵니다. 그리고 `-m`을 붙여 다시 실행하세요. 또 `nothing to commit`이 나오면 `git add`를 먼저 하지 않은 것입니다.

## 퀴즈

**1.** Traceback에서 가장 먼저 읽어야 하는 곳은?

(a) 맨 첫 줄 (b) 가운데 (c) 맨 마지막 줄 (d) 가장 긴 줄

<details><summary>정답 보기</summary>

(c) 맨 마지막 줄. `오류이름: 설명` 형식으로 무엇이 잘못됐는지가 요약되어 있습니다. 그다음 바로 위로 올라가며 어느 줄에서 났는지를 확인합니다.

</details>

**2.** `df["Gene"]`을 실행했더니 `KeyError: 'Gene'`이 났습니다. 가장 먼저 확인할 것은? (단답)

<details><summary>정답 보기</summary>

실제 열 이름입니다. `print(list(df.columns))`로 확인하면 열 이름이 `gene`(소문자)처럼 다르게 적혀 있을 가능성이 큽니다. `KeyError`는 "그런 키/열 이름이 없다"는 뜻이고 대소문자와 띄어쓰기까지 정확히 일치해야 합니다.

</details>

**3.** 다음 중 코드가 **실행을 시작하기도 전에** 나는 오류는?

(a) `KeyError` (b) `SyntaxError` (c) `ZeroDivisionError` (d) `FileNotFoundError`

<details><summary>정답 보기</summary>

(b) `SyntaxError`. 콜론이나 괄호가 빠져 문법 자체가 성립하지 않으면 Python은 코드를 한 줄도 실행하지 못합니다. 나머지 셋은 실행 도중 그 줄에 도달했을 때 납니다.

</details>

**4.** 파일을 고친 뒤 기록으로 남기기까지의 Git 명령 두 개를 순서대로 쓰세요. (단답)

<details><summary>정답 보기</summary>

`git add 파일명` → `git commit -m "메시지"`. `add`는 기록할 변경을 골라 담는 스테이징 단계이고, `commit`이 실제로 스냅숏을 남기는 단계입니다. 중간중간 `git status`로 상태를 확인하면 실수가 줄어듭니다.

</details>

**5.** 예시 3의 Traceback에서 오류가 "멈춘 곳"은 `fold_change` 함수 안의 2번째 줄인데, 고쳐야 할 "원인"은 어디에 있나요?

(a) 2번째 줄의 나눗셈 기호 (b) 5번째 줄의 변수 이름 (c) 9번째 줄에서 `control`에 0을 넣은 호출 (d) 원인을 알 수 없다

<details><summary>정답 보기</summary>

(c). 나눗셈 코드 자체는 틀리지 않았고, 0이 입력으로 들어온 것이 문제입니다. Traceback이 호출 경로 전체를 보여 주는 이유가 바로 이렇게 증상이 나타난 곳과 원인이 있는 곳이 다를 수 있기 때문입니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] `F7_errors.ipynb`에 오류 예시마다 "오류 이름 / 줄 / 원인" 메모가 있다.
- [ ] 오류 맞히기 네 조각을 모두 고쳤다.
- [ ] `~/Documents/git-practice`에서 `git log --oneline`에 커밋이 2개 이상 보인다.
- [ ] `git status`의 출력을 읽고 다음에 할 일을 말할 수 있다.
- [ ] 🎉 0주차를 마쳤다. 다음은 1주차 Day 1입니다.

---
[← 이전](day-F6.md) · [코스 지도](../../README.md) · [다음 →](../week-1/day-01.md)
