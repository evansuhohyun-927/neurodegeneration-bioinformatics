# Crash Course — 신경신호 시간-주파수 분석

> **읽는 시간:** 30–45분 · **이 가이드로 할 수 있는 것:** spike·LFP·EEG/MEG·칼슘 신호를 받아 "epoch → 필터 → 스펙트럼 또는 시간-주파수 → 기저선 정규화 → 위상·연결성 → 순열 통계"의 순서를 잡고, 가장 흔한 실수(aliasing, 위상 왜곡, 가장자리 효과, ITPC 편향, volume conduction, 순환 추론)를 피한다.

## 한눈에 보기

| 항목 | 내용 |
|---|---|
| 무엇을 측정하는가 | 뉴런의 활동전위 시각(spike), 전극 주변의 시냅스 전류 합(LFP), 두피 전위·자기장(EEG/MEG), 세포 안 칼슘 형광(칼슘 이미징) |
| 어떤 질문에 답하는가 | 자극·과제 뒤 언제, 어느 주파수 리듬의 세기가 바뀌는가 / 위상이 시행마다 정렬되는가 / 두 영역 리듬이 고정된 위상차를 갖는가 / 세포가 어떤 자극에 맞춰 쏘는가 |
| 답하지 못하는 것 | 리듬 변화의 세포·분자 원인, 인과 관계(관찰만 할 때), 개인 진단. EEG 전극 간 연결성은 영역 간 소통의 직접 증거가 아니다 |
| 데이터 모양 | 채널 × 시간 × 시행 배열 + sampling rate + 사건 시각 + 조건 이름표 (spike는 시각 목록) |
| 분석 단위 | 통계는 시행이 아니라 **동물·참가자** 단위로. 시행은 그 안에서 평균하는 반복 측정이다 |

## 🎬 급할 때 볼 영상

- [Comparing wavelet, filter-Hilbert, and STFFT — Mike X Cohen](https://www.youtube.com/watch?v=6x3iFs_j5j8) (13:23) — 세 가지 시간-주파수 방법이 사실상 같은 trade-off 안의 선택이라는 것을 한 번에 보여 준다.
- [Interpreting time-frequency plots — Mike X Cohen](https://www.youtube.com/watch?v=s2MfmIx8wv4) (16:12) — 논문의 TF 그림을 읽을 때 축·색·기저선을 어떻게 확인할지.
- [Intro to connectivity, volume conduction, and time- vs. trial-based connectivity — Mike X Cohen](https://www.youtube.com/watch?v=2h2X4TVUF5I) (19:20) — 연결성 지표를 쓰기 전에 알아야 할 공통 원천 문제.

## 핵심 개념 10개

| 용어 | 한 줄 정의 | 왜 중요한가 |
|---|---|---|
| epoch | 사건 기준으로 자른 시행 구간 (채널 × 시간 × 시행) | 기저선 구간과 가장자리 여유를 함께 잘라야 이후 단계가 가능하다 |
| convolution | 커널을 뒤집어 밀며 내적하기 = 주파수 영역의 곱셈 | 필터·wavelet·spike 평활화가 모두 이것이다 |
| 위상 왜곡 / filtfilt | 한 방향 필터는 출력이 늦는다. 앞뒤로 걸면 지연 0 | latency 비교가 필터 지연에 오염된다 |
| 주파수 해상도 | 1 / 구간 길이(초). zero-padding으로는 늘지 않는다 | 가까운 두 리듬을 가르려면 긴 구간이 필요하다 |
| Welch / 다중 테이퍼 | 여러 창 또는 여러 테이퍼의 스펙트럼 평균 | 분산을 줄이는 대신 주파수 정밀도를 일부 잃는다 |
| Morlet wavelet | 복소 사인파 × 가우시안. cycle 수로 폭을 정함 | 시간마다 진폭·위상. cycle 수가 시간·주파수 trade-off를 정한다 |
| 기저선 정규화 (dB) | 10·log10(power / 자극 전 평균) | 1/f 배경과 개인·전극 차이를 지우고 증감을 대칭으로 보여 준다 |
| total vs evoked power | 시행별 power의 평균 vs 평균 파형의 power | 위상이 제각각인 유도 반응은 evoked에서 사라진다 |
| ITPC / PLV | 위상(차)을 단위벡터로 바꿔 평균한 길이 | 시행 수가 적으면 바닥값이 √(π/4n)만큼 높다. 공통 원천은 가짜 PLV를 만든다 |
| cluster 순열 검정 | 이웃한 유의 칸 덩어리의 크기를 이름표 섞기 null과 비교 | 수천 칸 다중비교를 덩어리 단위로 통제한다. 경계 시점은 보장하지 않는다 |

## 측정 기술 고르기

숫자는 **흔한 출발점**이다. 장비와 질문에 따라 다르므로 각 데이터의 설명서를 확인한다.

| 기술 | 무엇을 얻나 | 장점 | 한계 | 이런 질문에 쓴다 |
|---|---|---|---|---|
| 단일·다중 세포 기록 (spike) | 스파이크 시각, 파형 (20–30 kHz) | 세포 하나의 ms 단위 활동 | 침습적. spike sorting 품질에 결과가 좌우된다 | tuning, PSTH, 스파이크-LFP 위상 관계 |
| LFP / ECoG | 국소 리듬 (1 kHz 안팎) | 리듬과 위상을 직접 본다 | 원천이 넓게 섞인다. 참조 전극에 민감 | 해마 theta–gamma, 기저핵 beta, 과제 관련 리듬 변화 |
| EEG | 두피 전위 (250–1000 Hz) | 비침습, 싸고 시간 해상도 높음 | 공간 해상도 낮음, 눈·근육 artifact, volume conduction | 수면 단계, ERP, 과제 중 alpha/theta 변화 |
| MEG | 머리 밖 자기장 | EEG보다 덜 번진다 | 장비가 비싸고 움직임에 민감 | 피질 원천 추정이 중요한 리듬 연구 |
| 칼슘 이미징 | 세포별 ΔF/F (10–30 Hz frame) | 수백 개 세포를 동시에, 세포 유형 표지 가능 | 느린 형광이라 스파이크 하나하나는 못 본다 | 집단 활동 패턴, 학습에 따른 세포 반응 변화 |

## 표준 분석 흐름

1. **원자료와 메타데이터 확인.** fs, 채널 이름·위치, 단위, 참조 전극, 사건 코드표를 읽는다. 도구: MNE-Python(`mne`), NWB 파일은 `pynwb`. 입력→출력: `.edf`/`.bdf`/`.fif`/BIDS 폴더/`.nwb` → 배열 + 사건 표. QC: header fs와 설명서 fs가 같은가, 사건 수가 설계와 맞는가.
2. **연속 기록 필터링과 표본화 속도 조정.** 고역 통과(drift), 저역 통과, 필요하면 notch(50/60 Hz). 낮출 때는 `decimate`/`resample_poly`. 오프라인이면 `sosfiltfilt`. 입력→출력: 연속 배열 → 연속 배열. QC: 필터 전후 스펙트럼 비교, 필터 종류·차수·대역 기록.
3. **epoch 자르기와 artifact 제거.** 해석할 구간 + 기저선 + 양쪽 가장자리 여유(가장 낮은 주파수의 2–3주기). 눈·근육 artifact는 문턱·ICA. 입력→출력: 연속 배열 → 채널 × 시간 × 시행. QC: 원본 대조, 시행별 RMS, 조건별 제외 비율 보고.
4. **스펙트럼 또는 시간-주파수 분해.** 정상 상태(휴지기)는 Welch/다중 테이퍼, 사건 관련은 Morlet wavelet·STFT·filter-Hilbert. 도구: `scipy.signal`, `mne.time_frequency`, `pywt`. QC: 알려진 사인파를 넣어 주파수·진폭이 맞게 나오는지, cycle 수·FWHM 보고.
5. **정규화와 요약.** dB(또는 % 변화, z) 기저선 정규화, 대역·시간 창 평균. 창은 **미리** 정한다. QC: 기저선 구간이 가장자리·자극에서 떨어져 있는가.
6. **위상·연결성 (질문이 있을 때만).** ITPC, PLV/ISPC, coherence, PLI/wPLI, PAC. QC: 시행 수 맞추기, 대리 분포, 원파형 확인.
7. **통계.** 동물·참가자 단위 요약 후 순열 검정, TF map은 cluster 순열 검정(FieldTrip, `mne.stats`). 보고: 효과 크기, 보정 방법, 순열 수와 seed, 탐색/확증 구분.

## 최소 실행 예시

### 예시 1 — wavelet 한 번으로 dB power와 ITPC를 함께

```python
import numpy as np

rng = np.random.default_rng(20)
fs = 250
t = np.arange(-0.8, 1.2, 1 / fs)
n_tr = 50
# 가상 EEG 시행: 배경 잡음 + 자극 후 0–0.4초 위상 고정 5 Hz + 0.4–0.9초 alpha(10 Hz) 감소
X = rng.normal(0, 1, (n_tr, len(t)))
for k in range(n_tr):
    X[k] += (1 - 0.6 * ((t > 0.4) & (t < 0.9))) * np.sin(2 * np.pi * 10 * t + rng.uniform(0, 2 * np.pi))
    X[k] += 1.0 * ((t > 0) & (t < 0.4)) * np.sin(2 * np.pi * 5 * t)

def morlet_tf(X, freqs, cycles, fs):
    """시행 × 시간 -> (주파수 × 시행 × 시간) 복소 계수. FFT 곱 + 날개 자르기 + 주파수 영역 정규화"""
    wt = np.arange(-2, 2 + 1 / fs, 1 / fs); half = (len(wt) - 1) // 2
    L = X.shape[1] + len(wt) - 1
    FX = np.fft.fft(X, L, axis=1)
    out = np.empty((len(freqs), *X.shape), dtype=complex)
    for i, (f, c) in enumerate(zip(freqs, cycles)):
        s = c / (2 * np.pi * f)
        W = np.fft.fft(np.exp(2j * np.pi * f * wt - wt ** 2 / (2 * s ** 2)), L)
        out[i] = np.fft.ifft(FX * (W / np.abs(W).max()), axis=1)[:, half:half + X.shape[1]]
    return out

freqs = np.arange(3, 31, 1.0)
C = morlet_tf(X, freqs, np.linspace(3, 8, len(freqs)), fs)
power = (np.abs(C) ** 2).mean(axis=1)                       # total power (주파수 × 시간)
itpc = np.abs(np.exp(1j * np.angle(C)).mean(axis=1))        # 시행 간 위상 일관성
base = (t > -0.6) & (t < -0.2)
db = 10 * np.log10(power / power[:, base].mean(axis=1, keepdims=True))

def at(M, f, a, b):
    return M[np.argmin(np.abs(freqs - f)), (t > a) & (t < b)].mean()
print("10 Hz, 0.5–0.8초: %+.1f dB | ITPC %.2f" % (at(db, 10, 0.5, 0.8), at(itpc, 10, 0.5, 0.8)))
print(" 5 Hz, 0.1–0.3초: %+.1f dB | ITPC %.2f" % (at(db, 5, 0.1, 0.3), at(itpc, 5, 0.1, 0.3)))
print("기저선 ITPC 평균 %.2f (시행 50개에서 무작위 위상의 기대치 약 %.2f)" % (itpc[:, base].mean(), np.sqrt(np.pi / 4 / n_tr)))
```

실행 결과:

```text
10 Hz, 0.5–0.8초: -6.3 dB | ITPC 0.15
 5 Hz, 0.1–0.3초: +12.2 dB | ITPC 0.99
기저선 ITPC 평균 0.12 (시행 50개에서 무작위 위상의 기대치 약 0.13)
```

alpha의 유도 감소는 power(−6 dB)에는 보이지만 ITPC는 바닥값 수준이고, 위상 고정 5 Hz 반응은 power와 ITPC 모두에서 크다. 기저선 ITPC 0.12는 50시행의 무작위 기대치(0.13)와 같다.

### 예시 2 — 시간 경과에 대한 cluster 순열 검정

```python
import numpy as np
from scipy import ndimage, stats

rng = np.random.default_rng(21)
t = np.linspace(-0.5, 1.0, 151)                  # 10 ms 간격의 시간축
n = 25                                           # 조건마다 25시행 (또는 25명)
def courses(effect):
    """시행별 alpha 파워 시간 경과(dB). 이웃 시점끼리 닮은 잡음 + (선택) 0.3–0.7초 감소"""
    noise = ndimage.gaussian_filter1d(rng.normal(0, 1, (n, len(t))), 4, axis=1) * 3
    return noise - (1.2 * ((t > 0.3) & (t < 0.7)) if effect else 0)

A, B = courses(False), courses(True)
thr = stats.t.ppf(0.975, 2 * n - 2)

def max_cluster_mass(tv):
    lab, k = ndimage.label(np.abs(tv) > thr)
    return lab, [np.abs(tv[lab == i]).sum() for i in range(1, k + 1)]

t_obs = stats.ttest_ind(B, A, axis=0).statistic
lab, mass = max_cluster_mass(t_obs)
both = np.vstack([A, B]); g = np.r_[np.zeros(n), np.ones(n)]
null = []
for _ in range(1000):
    p = rng.permutation(g)
    _, m = max_cluster_mass(stats.ttest_ind(both[p == 1], both[p == 0], axis=0).statistic)
    null.append(max(m) if m else 0)
for i, m in enumerate(mass, 1):
    p_c = (np.sum(np.array(null) >= m) + 1) / (len(null) + 1)
    seg = t[lab == i]
    print("cluster %d: %.2f–%.2f초, mass %.1f, 순열 p = %.3f" % (i, seg[0], seg[-1], m, p_c))
```

실행 결과:

```text
cluster 1: -0.30–-0.23초, mass 19.5, 순열 p = 0.254
cluster 2: 0.30–0.69초, mass 241.6, 순열 p = 0.001
```

0.30–0.69초 덩어리만 순열 분포보다 크고, 자극 전 −0.30초 근처의 작은 덩어리는 우연 수준이다. 결론은 "0.3–0.7초 부근에 덩어리 효과가 있다"이지 "0.30초에 시작했다"가 아니다.

## 흔한 함정

1. **슬라이싱으로 표본화 속도를 낮춘다** → 빠른 잡음이 낮은 주파수로 접혀 가짜 리듬이 된다 → `decimate`/`resample_poly`로 거른 뒤 낮춘다.
2. **한 방향 필터로 latency를 비교한다** → 필터 지연이 결과에 섞인다 → `filtfilt`로 위상 지연을 없애고 설정을 보고한다. 실시간 분석이면 지연을 측정해 보고한다.
3. **짧은 epoch를 따로따로 거르고 wavelet한다** → 가장자리 효과가 해석 구간을 덮는다 → 연속 기록에서 거르고, epoch를 넉넉히 잘라 가장자리를 버린다.
4. **zero-padding으로 해상도를 높였다고 쓴다** → 칸만 촘촘해졌을 뿐 두 봉우리는 갈라지지 않는다 → 해상도가 필요하면 더 긴 구간을 쓴다.
5. **ERP의 TF만 보고 "리듬 변화 없음"이라 쓴다** → 위상이 제각각인 유도 반응을 놓친다 → 시행별 power를 구한 뒤 평균한다(total).
6. **시행 수가 다른 조건의 ITPC·PLV를 그대로 비교한다** → 시행이 적은 쪽이 높게 나온다 → 시행 수를 맞추거나 편향 없는 지표(PPC)를 쓴다.
7. **EEG 전극 간 0-시차 PLV를 영역 간 소통으로 해석한다** → 공통 원천(volume conduction)일 수 있다 → PLI/wPLI·imaginary coherence, 원천 공간 분석을 고려하고 한계를 쓴다.
8. **효과가 가장 큰 창을 데이터에서 고른 뒤 같은 데이터로 검정한다** → 순환 추론으로 거짓 양성 → 창을 미리 정하거나 독립 데이터에서 고른다. 수천 칸은 cluster 순열로 보정한다.

## 연구 설계 체크리스트

- [ ] 질문과 주 지표(대역, 시간 창, 채널·ROI)가 데이터를 보기 전에 적혀 있다.
- [ ] 표본 수를 동물·참가자 수로 세었고, 조건별 시행 수 표가 있다.
- [ ] fs, 참조 전극, 채널 위치, 사건 코드표가 데이터 사전에 있다.
- [ ] 가장 낮은 관심 주파수에 비해 epoch 길이와 기저선 구간이 충분하다.
- [ ] 필터 종류·차수·대역, wavelet cycle 수(또는 FWHM), 기저선 구간과 정규화 방법을 미리 정했다.
- [ ] artifact 기준과 제외 비율을 조건별로 보고한다.
- [ ] 조건 간 시행 수를 맞추거나 편향 없는 지표를 쓴다.
- [ ] 연결성 분석에 volume conduction 대책이 있다.
- [ ] 다중비교 보정 방법(cluster 순열, FDR 등), 순열 수, seed를 기록한다.
- [ ] 탐색적 분석과 확증적 분석을 구분해 적고, 진단·치료 주장을 하지 않는다.

## 공개 데이터와 더 볼 곳

**공개 저장소**

| 이름 | URL | 무엇이 있나 |
|---|---|---|
| OpenNeuro | <https://openneuro.org/> | BIDS 형식의 EEG·MEG·iEEG·MRI 공개 데이터셋 |
| EEG Motor Movement/Imagery Dataset (PhysioNet) | <https://physionet.org/content/eegmmidb/1.0.0/> | 운동 실행·상상 과제 중의 다채널 EEG |
| Sleep-EDF Database Expanded (PhysioNet) | <https://physionet.org/content/sleep-edfx/1.0.0/> | 수면 EEG와 수면 단계 표시. 다중 테이퍼 스펙트로그램 연습용 |
| DANDI Archive | <https://dandiarchive.org/> | NWB 형식의 세포 기록·칼슘 이미징 등 신경생리 데이터 |
| CRCNS | <https://crcns.org/> | 공유된 spike·LFP 등 신경생리 데이터셋 모음 |
| Allen Brain Observatory — Visual Coding | <https://observatory.brain-map.org/visualcoding> | 생쥐 시각피질의 칼슘 이미징·Neuropixels 기록 |

각 데이터의 접근 조건·라이선스·인용 방법은 해당 페이지에서 확인한다.

**공식 문서·도구 (무료·공개)**

- `scipy.signal`: <https://docs.scipy.org/doc/scipy/reference/signal.html> · PyWavelets: <https://pywavelets.readthedocs.io/en/latest/>
- MNE-Python: <https://mne.tools/stable/index.html> · Elephant(spike train 분석): <https://elephant.readthedocs.io/en/latest/>
- SpikeInterface: <https://spikeinterface.readthedocs.io/en/latest/> · Suite2p(칼슘 영상): <https://suite2p.readthedocs.io/en/latest/>
- NWB: <https://www.nwb.org/> · BIDS: <https://bids.neuroimaging.io/>
- FieldTrip: <https://www.fieldtriptoolbox.org/> · EEGLAB: <https://eeglab.org/> · Chronux: <http://chronux.org/> (MATLAB 기반)
- FOOOF/specparam: <https://fooof-tools.github.io/fooof/> · Neuromatch Academy 교재: <https://compneuro.neuromatch.io/>

**핵심 논문 (Crossref로 서지 확인)**

- Buzsáki G, Anastassiou CA, Koch C. The origin of extracellular fields and currents — EEG, ECoG, LFP and spikes. *Nat Rev Neurosci* 2012;13:407–420. doi:[10.1038/nrn3241](https://doi.org/10.1038/nrn3241)
- Widmann A, Schröger E, Maess B. Digital filter design for electrophysiological data – a practical approach. *J Neurosci Methods* 2015;250:34–46. doi:[10.1016/j.jneumeth.2014.08.002](https://doi.org/10.1016/j.jneumeth.2014.08.002)
- Cohen MX. A better way to define and describe Morlet wavelets for time-frequency analysis. *NeuroImage* 2019;199:81–86. doi:[10.1016/j.neuroimage.2019.05.048](https://doi.org/10.1016/j.neuroimage.2019.05.048)
- Prerau MJ, et al. Sleep Neurophysiological Dynamics Through the Lens of Multitaper Spectral Analysis. *Physiology* 2017;32:60–92. doi:[10.1152/physiol.00062.2015](https://doi.org/10.1152/physiol.00062.2015)
- Donoghue T, et al. Parameterizing neural power spectra into periodic and aperiodic components. *Nat Neurosci* 2020;23:1655–1665. doi:[10.1038/s41593-020-00744-x](https://doi.org/10.1038/s41593-020-00744-x)
- Lachaux JP, et al. Measuring phase synchrony in brain signals. *Hum Brain Mapp* 1999;8:194–208. doi:[10.1002/(SICI)1097-0193(1999)8:4<194::AID-HBM4>3.0.CO;2-C](https://doi.org/10.1002/(SICI)1097-0193(1999)8:4%3C194::AID-HBM4%3E3.0.CO;2-C)
- Nolte G, et al. Identifying true brain interaction from EEG data using the imaginary part of coherency. *Clin Neurophysiol* 2004;115:2292–2307. doi:[10.1016/j.clinph.2004.04.029](https://doi.org/10.1016/j.clinph.2004.04.029)
- Vinck M, et al. The pairwise phase consistency. *NeuroImage* 2010;51:112–122. doi:[10.1016/j.neuroimage.2010.01.073](https://doi.org/10.1016/j.neuroimage.2010.01.073)
- Tort ABL, et al. Measuring phase-amplitude coupling between neuronal oscillations of different frequencies. *J Neurophysiol* 2010;104:1195–1210. doi:[10.1152/jn.00106.2010](https://doi.org/10.1152/jn.00106.2010)
- Kass RE, Ventura V, Brown EN. Statistical issues in the analysis of neuronal data. *J Neurophysiol* 2005;94:8–25. doi:[10.1152/jn.00648.2004](https://doi.org/10.1152/jn.00648.2004)
- Maris E, Oostenveld R. Nonparametric statistical testing of EEG- and MEG-data. *J Neurosci Methods* 2007;164:177–190. doi:[10.1016/j.jneumeth.2007.03.024](https://doi.org/10.1016/j.jneumeth.2007.03.024)
- Kriegeskorte N, et al. Circular analysis in systems neuroscience: the dangers of double dipping. *Nat Neurosci* 2009;12:535–540. doi:[10.1038/nn.2303](https://doi.org/10.1038/nn.2303)
- Gramfort A, et al. MEG and EEG data analysis with MNE-Python. *Front Neurosci* 2013;7:267. doi:[10.3389/fnins.2013.00267](https://doi.org/10.3389/fnins.2013.00267)

**교재 (출판사 페이지)**

- Mike X Cohen, *MATLAB for Brain and Cognitive Scientists*, MIT Press (2017). <https://mitpress.mit.edu/9780262035828/matlab-for-brain-and-cognitive-scientists/>
- Pascal Wallisch 외, *MATLAB for Neuroscientists*, 2nd ed., Academic Press (2014). <https://shop.elsevier.com/books/matlab-for-neuroscientists/wallisch/978-0-12-383836-0>

## 본 과정과의 연결

| 이 가이드의 부분 | 자세히 다루는 레슨 |
|---|---|
| sampling rate, aliasing, 필터·스펙트럼 기초 | [Day 23 — 시계열 기초](../lessons/week-4/day-23.md), [Crash Course — 생리 신호 분석](physiology-signals.md) |
| 신호 종류, epoch, 표본화 속도 낮추기, ΔF/F | [Day C1](../lessons/advanced/C-neural-signals/day-C1.md) |
| convolution, FIR/IIR, filtfilt | [Day C2](../lessons/advanced/C-neural-signals/day-C2.md) |
| Fourier 진폭, 해상도, Welch, 다중 테이퍼 | [Day C3](../lessons/advanced/C-neural-signals/day-C3.md) |
| Morlet wavelet, STFT, 기저선 정규화 | [Day C4](../lessons/advanced/C-neural-signals/day-C4.md) |
| Hilbert, ITPC, PLV, PAC | [Day C5](../lessons/advanced/C-neural-signals/day-C5.md) |
| raster, PSTH, ISI, tuning curve | [Day C6](../lessons/advanced/C-neural-signals/day-C6.md) |
| PCA spike sorting, 순열·cluster 검정, 순환 추론 | [Day C7](../lessons/advanced/C-neural-signals/day-C7.md), [Day 10 — FDR](../lessons/week-2/day-10.md), [Day 14 — PCA](../lessons/week-2/day-14.md) |
| 참가자 단위 분할과 누수, 성능 지표 | [Day 33](../lessons/week-5/day-33.md), [Day 34](../lessons/week-5/day-34.md) |
| MATLAB 함수 대응 | [파트 B — MATLAB](../lessons/advanced/B-matlab/) |

통계 쪽이 급하면 [Crash Course — 연구 설계와 통계 응급 키트](study-design-stats.md)를 함께 본다.

---
[Crash Course 목록](README.md) · [코스 지도](../README.md)
