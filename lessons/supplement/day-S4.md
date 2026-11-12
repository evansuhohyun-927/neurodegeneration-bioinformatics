# Day S4 — 쌍 정렬과 동적 프로그래밍: 표를 채워 최적 정렬 찾기

> **주차:** 보충 단원 · **예상 시간:** 75–90분 · **산출물:** `notebooks/supplement/S4_pairwise_alignment.ipynb`
>
> **먼저 끝내 둘 레슨:** Day S3 (점수 체계), Day F4 (이중 반복문).

## 오늘의 목표
- dot plot으로 두 서열의 비슷한 구간을 눈으로 찾을 수 있다.
- Needleman–Wunsch 전역 정렬의 점수 표를 채우고 traceback으로 정렬을 읽어 낼 수 있다.
- 전역 정렬과 국소 정렬(Smith–Waterman)의 차이, gap 벌점의 역할을 설명할 수 있다.

## 🎬 영상으로 먼저 보기

- [Understanding Sequence Alignment Algorithms: with Needleman-Wunsch — Professor Hendrix](https://www.youtube.com/watch?v=b6xBvl0yPAY) (12:12)
- **무엇에 주목할까:** 표의 한 칸을 채울 때 왼쪽, 위, 대각선의 세 칸만 본다는 규칙에 집중하세요. 표가 다 채워진 뒤 어느 칸에서 출발해 어느 방향으로 되짚어 가는지도 눈으로 따라가 보면 예시 2의 코드가 그대로 읽힙니다.

- [Local Sequence Alignment & Smith-Waterman || Algorithm and Example — Bioinformatica](https://www.youtube.com/watch?v=lu9ScxSejSE) (7:56)
- **무엇에 주목할까:** 전역 정렬과 달라지는 점이 무엇인지만 찾아보세요. 첫 줄을 어떻게 채우는지, 음수가 나올 때 어떻게 하는지, 되짚기를 어디서 시작하고 어디서 멈추는지입니다.

## 개념 설명

### dot plot: 계산하기 전에 먼저 보기

두 서열을 비교하는 가장 단순한 방법은 표를 그리는 것입니다. 한 서열을 세로에, 다른 서열을 가로에 놓고 글자가 같은 칸마다 점을 찍습니다. 두 서열에 비슷한 구간이 있으면 점이 **대각선**으로 이어집니다. 대각선이 중간에 한 칸 옆으로 옮겨 가면 그 자리에 삽입이나 결실이 있다는 뜻이고, 대각선이 여러 줄 나란히 보이면 같은 구간이 반복된다는 뜻입니다.

글자 하나만 비교하면 우연히 같은 칸이 많아 그림이 지저분합니다. DNA는 글자가 네 가지뿐이라 아무 두 칸이나 4분의 1 확률로 같기 때문입니다. 그래서 **window(창)** 를 씁니다. 연속한 세 글자가 모두 같을 때만 점을 찍으면 우연히 찍힐 확률이 1/64로 줄어 진짜 대각선만 남습니다. 창을 한 칸씩 옮기며 구간의 성질을 계산하는 이 방식(sliding window)은 4주차 시계열에서 이동 평균을 구할 때와 같은 발상입니다.

### 정렬은 길 찾기 문제다

dot plot은 눈으로 보는 도구이고, 점수가 가장 높은 정렬을 실제로 찾으려면 계산이 필요합니다. 문제는 경우의 수입니다. gap을 어디에 몇 개 넣을지까지 따지면 길이 100짜리 두 서열을 정렬하는 방법은 우주의 원자 수보다 많습니다. 전부 해 볼 수는 없습니다.

해결책이 **동적 프로그래밍(dynamic programming)** 입니다. 바둑판 모양 도시에서 왼쪽 위 집에서 오른쪽 아래 학교까지 간다고 합시다. 한 번에 오른쪽, 아래, 또는 대각선으로 한 칸씩만 움직일 수 있고, 길마다 얻는 점수가 다릅니다. 어떤 교차로에 도착하는 최고 점수는 바로 앞의 세 교차로(왼쪽, 위, 왼쪽 위) 각각의 최고 점수에 마지막 한 걸음의 점수를 더한 것 중 가장 큰 값입니다. 그 앞까지 어떤 길로 왔는지는 다시 따질 필요가 없습니다. 이 규칙으로 표를 왼쪽 위부터 차례로 채우면, 모든 길을 걸어 보지 않고도 오른쪽 아래 칸에 전체 최고 점수가 남습니다.

정렬에서 세 방향의 뜻은 이렇습니다. **대각선**은 두 서열의 글자를 한 쌍으로 짝짓는 것(일치 또는 불일치), **아래**와 **오른쪽**은 한쪽 서열의 글자를 gap과 짝짓는 것입니다. 표를 채우는 데 필요한 계산은 (길이 1) × (길이 2)칸뿐입니다.

### 전역 정렬: 표를 채우고 되짚기

**Needleman–Wunsch** 알고리즘은 두 서열을 **처음부터 끝까지** 맞춥니다(전역 정렬, global alignment). 세 단계입니다.

1. **초기화**: 첫 행과 첫 열을 gap 벌점의 누적으로 채웁니다. 한쪽 서열의 앞부분을 통째로 gap과 짝지은 경우의 점수입니다.
2. **표 채우기**: 각 칸에 "대각선 칸 + 일치/불일치 점수", "위 칸 + gap 벌점", "왼쪽 칸 + gap 벌점" 중 최댓값을 적습니다.
3. **되짚기(traceback)**: 오른쪽 아래 칸에서 출발해, 그 값이 어느 칸에서 왔는지 거꾸로 따라 올라가며 정렬을 뒤에서부터 적습니다.

점수가 같은 길이 둘 이상이면 최적 정렬도 여러 개입니다. 프로그램은 그중 하나만 보여 주므로 "유일한 정답"이 아닐 수 있다는 점을 알아 두세요.

**gap 벌점**은 정렬의 성격을 정합니다. 벌점이 0이면 gap을 마구 넣어 우연한 일치를 긁어모으고, 너무 크면 실제 삽입·결실이 있는 자리도 억지로 불일치로 채웁니다. 오늘 코드는 gap 한 칸마다 같은 벌점을 주는 linear 방식입니다. 실제 프로그램은 gap을 여는 값은 크게, 늘리는 값은 작게 주는 **affine** 방식을 주로 씁니다. 긴 결실 한 번이 짧은 결실 여러 번보다 생물학적으로 그럴듯하기 때문입니다.

### 국소 정렬: 닮은 부분만 찾기

단백질은 여러 도메인의 조립품이라, 전체는 달라도 도메인 하나만 닮은 경우가 흔합니다. 이럴 때 전역 정렬을 하면 닮지 않은 나머지 부분의 벌점이 점수를 깎아 닮은 구간이 묻힙니다.

**Smith–Waterman** 알고리즘(국소 정렬, local alignment)은 규칙 세 가지만 바꿉니다. 첫 행과 첫 열을 0으로 두고, 칸의 값이 음수가 되면 **0으로 바꿔** 거기서 새로 시작하게 하며, 되짚기는 표에서 **가장 큰 값**에서 출발해 0을 만나면 멈춥니다. 책 두 권 전체를 맞대는 대신 서로 겹치는 한 단락만 찾아내는 셈입니다. 내일 배울 BLAST가 찾는 것도 이 국소 정렬입니다.

> **참고 문헌:** Needleman & Wunsch, *Journal of Molecular Biology* 48:443–453 (1970), [doi:10.1016/0022-2836(70)90057-4](https://doi.org/10.1016/0022-2836%2870%2990057-4) · Smith & Waterman, "Identification of common molecular subsequences", *Journal of Molecular Biology* 147:195–197 (1981), [doi:10.1016/0022-2836(81)90087-5](https://doi.org/10.1016/0022-2836%2881%2990087-5)

## 예시로 이해하기

> 예시의 서열과 점수 체계는 모두 연습용으로 지어낸 **가상 값**입니다.

### 예시 1 — 글자로 그리는 dot plot

```python
def dot_plot(seq_a, seq_b, window=1):
    """seq_a를 세로, seq_b를 가로에 놓고 window칸이 연속으로 같으면 점을 찍는다."""
    print("  " + seq_b)
    for i in range(len(seq_a)):
        row = ""
        for j in range(len(seq_b)):
            same = seq_a[i:i + window] == seq_b[j:j + window] and i + window <= len(seq_a)
            row += "*" if same else "."
        print(seq_a[i] + " " + row)

a = "GATTACAGATTACA"
b = "GATTTCAGATACA"
print("window = 1")
dot_plot(a, b, window=1)
print("\nwindow = 3")
dot_plot(a, b, window=3)
```

출력:

```text
window = 1
  GATTTCAGATACA
G *......*.....
A .*....*.*.*.*
T ..***....*...
T ..***....*...
A .*....*.*.*.*
C .....*.....*.
A .*....*.*.*.*
G *......*.....
A .*....*.*.*.*
T ..***....*...
T ..***....*...
A .*....*.*.*.*
C .....*.....*.
A .*....*.*.*.*

window = 3
  GATTTCAGATACA
G *......*.....
A .*...........
T .............
T .........*...
A ..........*..
C .....*.......
A ......*......
G *......*.....
A .*...........
T .............
T .........*...
A ..........*..
C .............
A .............
```

window가 1일 때는 점이 사방에 찍혀 대각선이 잘 보이지 않습니다. window를 3으로 올리면 우연한 점이 대부분 사라지고 왼쪽 위에서 오른쪽 아래로 내려가는 대각선이 드러납니다. 이 대각선은 두 군데에서 달라집니다. 위쪽에서는 잠깐 끊겼다가 같은 줄에서 다시 이어지는데, 글자 하나가 다른 자리(불일치)입니다. 아래쪽에서는 **한 칸 왼쪽으로 어긋나** 이어지는데, 세로 서열에만 T가 하나 더 있기 때문입니다(삽입·결실). 대각선에서 멀리 떨어진 점들은 `GAT`, `TAC`, `ACA` 같은 조각이 서열 안에서 반복되어 생긴 것입니다. 점은 창이 **시작하는** 칸에 찍힙니다.

### 예시 2 — Needleman–Wunsch 전역 정렬

```python
import numpy as np
import pandas as pd

def needleman_wunsch(seq1, seq2, match=1, mismatch=-1, gap=-2):
    n, m = len(seq1), len(seq2)
    F = np.zeros((n + 1, m + 1), dtype=int)
    F[:, 0] = gap * np.arange(n + 1)          # 첫 열: seq1을 전부 gap과 짝지은 경우
    F[0, :] = gap * np.arange(m + 1)          # 첫 행: seq2를 전부 gap과 짝지은 경우

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            s = match if seq1[i - 1] == seq2[j - 1] else mismatch
            F[i, j] = max(F[i - 1, j - 1] + s,   # 대각선: 두 글자를 짝짓는다
                          F[i - 1, j] + gap,     # 위: seq2 쪽에 gap
                          F[i, j - 1] + gap)     # 왼쪽: seq1 쪽에 gap

    out1, out2 = "", ""                        # 오른쪽 아래에서 거꾸로 되짚기(traceback)
    i, j = n, m
    while i > 0 or j > 0:
        s = match if i > 0 and j > 0 and seq1[i - 1] == seq2[j - 1] else mismatch
        if i > 0 and j > 0 and F[i, j] == F[i - 1, j - 1] + s:
            out1, out2 = seq1[i - 1] + out1, seq2[j - 1] + out2
            i, j = i - 1, j - 1
        elif i > 0 and F[i, j] == F[i - 1, j] + gap:
            out1, out2 = seq1[i - 1] + out1, "-" + out2
            i = i - 1
        else:
            out1, out2 = "-" + out1, seq2[j - 1] + out2
            j = j - 1
    return F, out1, out2

seq1, seq2 = "GATTACA", "GCTACA"
F, a1, a2 = needleman_wunsch(seq1, seq2)
print(pd.DataFrame(F, index=list("-" + seq1), columns=list("-" + seq2)))
print()
print(a1)
print(a2)
print("점수:", F[-1, -1])

# 자기 점검: 정렬 결과의 점수를 직접 더하면 표의 마지막 칸과 같아야 한다
check = sum(-2 if "-" in (x, y) else (1 if x == y else -1) for x, y in zip(a1, a2))
assert check == F[-1, -1]
```

출력:

```text
    -   G  C  T  A   C   A
-   0  -2 -4 -6 -8 -10 -12
G  -2   1 -1 -3 -5  -7  -9
A  -4  -1  0 -2 -2  -4  -6
T  -6  -3 -2  1 -1  -3  -5
T  -8  -5 -4 -1  0  -2  -4
A -10  -7 -6 -3  0  -1  -1
C -12  -9 -6 -5 -2   1  -1
A -14 -11 -8 -7 -4  -1   2

GATTACA
G-CTACA
점수: 2
```

표의 한 칸을 직접 확인해 봅시다. G행 G열의 1은 대각선 칸(0)에 일치 점수 +1을 더한 값입니다. 위 칸에서 오면 −2 − 2 = −4, 왼쪽 칸에서 와도 −4이므로 최댓값은 1입니다. 정렬 결과는 일치 5개(+5), 불일치 1개(−1), gap 1개(−2)로 합이 2이고, 오른쪽 아래 칸의 값과 같습니다. 마지막의 `assert`가 이 검산을 자동으로 합니다.

### 예시 3 — Smith–Waterman 국소 정렬

```python
import numpy as np

def smith_waterman(seq1, seq2, match=2, mismatch=-1, gap=-2):
    n, m = len(seq1), len(seq2)
    H = np.zeros((n + 1, m + 1), dtype=int)   # 첫 행·첫 열은 0으로 둔다
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            s = match if seq1[i - 1] == seq2[j - 1] else mismatch
            H[i, j] = max(0,                    # 음수가 되면 0에서 새로 시작
                          H[i - 1, j - 1] + s,
                          H[i - 1, j] + gap,
                          H[i, j - 1] + gap)

    i, j = np.unravel_index(H.argmax(), H.shape)   # 가장 큰 칸에서 출발
    best = H[i, j]
    end1, end2 = i, j
    out1, out2 = "", ""
    while H[i, j] > 0:                             # 0을 만나면 멈춘다
        s = match if seq1[i - 1] == seq2[j - 1] else mismatch
        if H[i, j] == H[i - 1, j - 1] + s:
            out1, out2 = seq1[i - 1] + out1, seq2[j - 1] + out2
            i, j = i - 1, j - 1
        elif H[i, j] == H[i - 1, j] + gap:
            out1, out2 = seq1[i - 1] + out1, "-" + out2
            i = i - 1
        else:
            out1, out2 = "-" + out1, seq2[j - 1] + out2
            j = j - 1
    return best, out1, out2, (i + 1, end1), (j + 1, end2)

long_seq = "MPSLDAKTKEGVVHGLWEQ"      # 가상 단백질
short_seq = "RRKTKQGVVHAA"            # 가운데에만 비슷한 구간이 있는 가상 조각
score, a1, a2, pos1, pos2 = smith_waterman(long_seq, short_seq)
print("최고 점수:", score)
print(f"seq1 {pos1[0]:>2}  {a1}  {pos1[1]}")
print(f"seq2 {pos2[0]:>2}  {a2}  {pos2[1]}")
```

출력:

```text
최고 점수: 13
seq1  7  KTKEGVVH  14
seq2  3  KTKQGVVH  10
```

두 서열의 앞뒤는 전혀 닮지 않았지만, 가운데 여덟 글자 구간이 한 글자(E/Q)만 빼고 같습니다. 국소 정렬은 그 구간만 잘라 보여 주고, 각 서열의 몇 번째 글자부터 몇 번째까지인지도 알려 줍니다. 점수는 일치 7개 × 2 − 불일치 1개 = 13입니다.

## 직접 해보기

1. `notebooks/supplement/S4_pairwise_alignment.ipynb`를 만들고 예시 1–3을 실행합니다.

2. **손으로 표 채우기.** 종이에 `GAT`(세로)와 `GT`(가로)의 4 × 3 표를 그리고, 일치 +1, 불일치 −1, gap −2로 직접 채웁니다. 그다음 `needleman_wunsch("GAT", "GT")`의 표와 비교합니다. 오른쪽 아래 칸은 0이 나와야 합니다.

3. **gap 벌점 실험.** 예시 2를 `gap=0`과 `gap=-5`로 각각 실행해 정렬이 어떻게 달라지는지 봅니다. 예시의 자기 점검 줄은 gap이 −2라고 가정하므로, 아래처럼 함수만 따로 호출합니다.

   ```python
   for g in [0, -2, -5]:
       F, a1, a2 = needleman_wunsch("GATTACA", "GCTACA", gap=g)
       print(f"gap {g:>2}: {a1} / {a2}  점수 {F[-1, -1]}")
   ```

4. **전역과 국소 비교.** 예시 3의 두 서열을 `needleman_wunsch(long_seq, short_seq, match=2, mismatch=-1, gap=-2)`로 전역 정렬해 봅니다. 닮은 구간이 그대로 맞춰지는지, 전체 점수가 국소 정렬의 13과 얼마나 다른지 적습니다.

5. **치환 행렬 연결(생각해 보기).** 지금 코드는 일치/불일치 두 값만 씁니다. S3의 점수표를 쓰려면 `s = match if ... else mismatch` 한 줄을 무엇으로 바꾸면 될지 한 문장으로 적습니다.

6. 노트북을 저장합니다.

⚠️ **흔한 오류 1 — `IndexError` 또는 한 글자씩 밀린 정렬.** 표는 서열보다 한 줄, 한 칸이 더 큽니다(맨 앞의 빈 행·열). 그래서 표의 `i`번째 행은 서열의 `seq1[i - 1]` 글자에 해당합니다. `- 1`을 빼먹으면 범위를 벗어나거나 엉뚱한 글자를 비교합니다.

⚠️ **흔한 오류 2 — 점수가 높으니 상동이라고 결론 내리기.** 긴 서열 둘을 정렬하면 아무 관계가 없어도 어느 정도 점수는 나옵니다. 그 점수가 우연으로 얼마나 흔한지를 따져야 하고, 그것이 내일(S5)의 E-value입니다.

## 퀴즈

**1.** dot plot에서 대각선이 중간에 옆으로 한 칸 옮겨 가 이어진다면?

(a) 두 서열이 완전히 같다 (b) 그 자리에 삽입 또는 결실이 있다 (c) 서열이 뒤집혀 있다 (d) window가 너무 크다

<details><summary>정답 보기</summary>

(b). 한쪽 서열에만 글자가 더 있으면 그 뒤의 일치가 한 칸 어긋난 대각선으로 이어집니다. 완전히 같은 서열이면 끊김 없는 대각선 하나가 나옵니다.

</details>

**2.** Needleman–Wunsch 표에서 한 칸의 값을 정할 때 참고하는 칸은 몇 개이며 어디인가요? (단답)

<details><summary>정답 보기</summary>

세 개입니다. 왼쪽 위(대각선), 위, 왼쪽 칸입니다. 각각 글자끼리 짝짓기, 한쪽에 gap 넣기, 다른 쪽에 gap 넣기에 해당하고, 세 후보 중 최댓값을 적습니다.

</details>

**3.** 길이 300과 400인 두 서열을 전역 정렬할 때 채워야 하는 칸의 수는 대략?

(a) 700 (b) 12만 (c) 300의 400제곱 (d) 알 수 없다

<details><summary>정답 보기</summary>

(b). 표의 크기는 두 길이의 곱(정확히는 301 × 401)입니다. 가능한 정렬의 수는 천문학적이지만, 동적 프로그래밍은 칸마다 한 번씩만 계산하므로 길이의 곱에 비례하는 시간이면 충분합니다.

</details>

**4.** Smith–Waterman이 Needleman–Wunsch와 다른 점이 아닌 것은?

(a) 음수가 되는 칸을 0으로 둔다 (b) 표에서 가장 큰 값에서 되짚기를 시작한다 (c) 대각선·위·왼쪽 세 칸을 본다 (d) 0을 만나면 되짚기를 멈춘다

<details><summary>정답 보기</summary>

(c). 세 칸을 보고 최댓값을 고르는 규칙은 두 알고리즘이 같습니다. 나머지 셋이 국소 정렬을 만드는 변경점입니다.

</details>

**5.** 긴 단백질 안에 짧은 도메인 하나가 들어 있는지 알고 싶습니다. 전역과 국소 중 무엇을 쓰고, 이유는? (단답)

<details><summary>정답 보기</summary>

국소 정렬입니다. 전역 정렬은 두 서열의 처음부터 끝까지를 억지로 맞추므로 도메인 밖의 긴 구간이 모두 gap 벌점이 되어 닮은 구간의 신호가 묻힙니다. 국소 정렬은 점수가 가장 높은 구간만 골라 보여 줍니다.

</details>

## 오늘의 산출물 체크리스트
- [ ] dot plot을 window 1과 3으로 그려 차이를 설명할 수 있다.
- [ ] `GAT`/`GT` 표를 손으로 채워 코드 결과와 맞춰 보았다.
- [ ] gap 벌점을 바꿨을 때 정렬이 달라지는 것을 확인했다.
- [ ] 같은 두 서열의 전역·국소 정렬 결과를 비교해 적었다.

---
[← 이전](day-S3.md) · [코스 지도](../../README.md) · [다음 →](day-S5.md)
