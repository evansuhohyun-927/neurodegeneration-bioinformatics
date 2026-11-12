// 사이트 공통 클라이언트 스크립트: 진도·목표·퀴즈·자기평가 기록(localStorage), 홈·학습 현황, 읽기 진행 막대,
// 한 장씩 보기, 시각화 테마·높이 전달, 브라우저 안 Python 실행(Pyodide)
(() => {
  const norm = (p) => (p.endsWith('/') ? p : p + '/');
  const here = norm(location.pathname);

  // ---------- 진도 체크 (localStorage) ----------
  const KEY = 'neurobio-done';
  const loadDone = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const saveDone = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };

  function showDone() {
    const done = loadDone();
    document.querySelectorAll('#starlight__sidebar a[href]').forEach((a) => {
      a.classList.toggle('is-done', !!done[norm(new URL(a.href).pathname)]);
    });
    // 홈 코스 지도의 체크박스
    document.querySelectorAll('.sl-markdown-content li > input[type=checkbox]').forEach((box) => {
      const a = box.parentElement.querySelector('a[href]');
      if (a) box.checked = !!done[norm(new URL(a.href).pathname)];
    });
  }

  document.querySelectorAll('.lesson-done').forEach((el) => {
    el.innerHTML = '<label><input type="checkbox"> 이 레슨 완료로 표시</label>';
    const box = el.querySelector('input');
    box.checked = !!loadDone()[here];
    box.addEventListener('change', () => {
      const d = loadDone();
      if (box.checked) d[here] = Date.now(); else delete d[here];
      saveDone(d);
      showDone();
    });
  });
  showDone();

  // ---------- 시각화 iframe에 현재 테마 전달 ----------
  function setVizTheme() {
    const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    document.querySelectorAll('iframe.viz-frame[data-viz-src]').forEach((f) => {
      const src = `${f.dataset.vizSrc}?theme=${theme}`;
      if (f.getAttribute('src') !== src) f.setAttribute('src', src);
    });
  }
  setVizTheme();
  new MutationObserver(setVizTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ---------- 이 브라우저에만 남는 학습 기록 ----------
  const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const html = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pageTitle = () => document.querySelector('h1')?.textContent.trim() || here;
  const conceptHref = () => {
    const h = document.querySelector('.sec-concept h2, .sec-video h2');
    return h ? '#' + h.id : '#_top';
  };

  // ---------- 오늘의 목표 체크 ----------
  const GOALS = 'neurobio-goals';
  document.querySelectorAll('.lesson-goals input[data-goal]').forEach((box) => {
    const g = load(GOALS);
    box.checked = !!g[here]?.includes(+box.dataset.goal);
    box.addEventListener('change', () => {
      const all = load(GOALS);
      const set = new Set(all[here] || []);
      box.checked ? set.add(+box.dataset.goal) : set.delete(+box.dataset.goal);
      all[here] = [...set];
      save(GOALS, all);
    });
  });

  // ---------- 퀴즈: 클릭형 + 스스로 채점 + 점수 ----------
  const QUIZ = 'neurobio-quiz', QUICK = 'neurobio-quick';
  const quizSec = document.querySelector('.sec-quiz');
  const scoreEl = document.querySelector('.quiz-score');

  function updateScore() {
    if (!scoreEl) return;
    const total = +scoreEl.dataset.total;
    const rec = Object.values(load(QUIZ)[here] || {});
    const done = rec.length, right = rec.filter((r) => r.ok).length;
    if (!done) { scoreEl.innerHTML = ''; return; }
    const pass = Math.ceil(total * 0.8);
    let msg = `${total - done}문항 남았습니다.`;
    if (done >= total) msg = right >= pass
      ? '통과 기준을 넘었습니다. 산출물 체크리스트를 확인하고 이 레슨을 완료로 표시하세요.'
      : `통과 기준은 ${pass}개입니다. <a href="${conceptHref()}">개념 설명</a>을 다시 읽고 틀린 문항의 해설을 보세요.`;
    scoreEl.innerHTML = `이 레슨 퀴즈 <strong>${right} / ${total}</strong> 정답<p>${msg}</p>`;
  }

  function record(item, ok, choice) {
    const quick = item.dataset.quick === '1';
    const all = load(quick ? QUICK : QUIZ);
    if (quick) all[here] = { ok, choice, title: pageTitle(), at: Date.now() };
    else (all[here] ??= {})[item.dataset.q] = { ok, choice };
    save(quick ? QUICK : QUIZ, all);
    if (!quick) updateScore();
  }
  function forget(item) {
    const quick = item.dataset.quick === '1';
    const all = load(quick ? QUICK : QUIZ);
    if (quick) delete all[here]; else if (all[here]) delete all[here][item.dataset.q];
    save(quick ? QUICK : QUIZ, all);
    if (!quick) updateScore();
  }

  function showResult(item, choice) {
    const answer = +item.dataset.answer;
    const ok = choice === answer;
    item.classList.add('is-answered');
    item.querySelectorAll('.quiz-opt').forEach((b, i) => {
      b.disabled = true;
      b.classList.toggle('is-right', i === answer);
      b.classList.toggle('is-wrong', i === choice && !ok);
      b.classList.toggle('is-dim', i !== answer && i !== choice);
      b.setAttribute('aria-pressed', String(i === choice));
    });
    const fb = item.querySelector('.quiz-feedback');
    const label = item.querySelectorAll('.quiz-label')[answer]?.textContent;
    fb.className = 'quiz-feedback not-content ' + (ok ? 'ok' : 'no');
    fb.innerHTML = (ok ? '정답입니다.' : `아쉬워요. 정답은 ${html(label)}입니다.`)
      + ' <button type="button" class="btn quiz-retry">다시 풀기</button>';
    const det = item.querySelector('.quiz-answer');
    if (det) det.open = true;
    fb.querySelector('.quiz-retry').addEventListener('click', () => {
      item.classList.remove('is-answered');
      item.querySelectorAll('.quiz-opt').forEach((b) => {
        b.disabled = false; b.classList.remove('is-right', 'is-wrong', 'is-dim'); b.removeAttribute('aria-pressed');
      });
      fb.innerHTML = ''; fb.className = 'quiz-feedback not-content';
      forget(item);
      item.querySelector('.quiz-opt')?.focus();
    });
    return ok;
  }

  document.querySelectorAll('.quiz-item').forEach((item) => {
    item.closest('.sec-quiz, .quick-check')?.classList.add('js-quiz');
    const quick = item.dataset.quick === '1';
    const prev = quick ? load(QUICK)[here] : load(QUIZ)[here]?.[item.dataset.q];
    if (prev && Number.isInteger(prev.choice)) showResult(item, prev.choice);
    item.querySelectorAll('.quiz-opt').forEach((b) => b.addEventListener('click', () => {
      const choice = +b.dataset.i;
      record(item, showResult(item, choice), choice);
    }));
  });

  // 접기형 문항: 해설을 펼친 뒤 스스로 채점
  if (quizSec) {
    quizSec.querySelectorAll(':scope details:not(.quiz-answer)').forEach((det) => {
      const p = det.previousElementSibling;
      const m = p?.textContent.match(/^(\d+)\./);
      if (!m) return;
      const q = m[1];
      const bar = document.createElement('div');
      bar.className = 'self-grade not-content';
      bar.hidden = true;
      bar.innerHTML = '<span>내 답은</span><button type="button" class="btn" data-ok="1" aria-pressed="false">맞았어요</button>'
        + '<button type="button" class="btn" data-ok="0" aria-pressed="false">틀렸어요</button>';
      det.after(bar);
      const paint = () => {
        const r = load(QUIZ)[here]?.[q];
        bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(!!r && r.ok === (b.dataset.ok === '1'))));
        if (r) bar.hidden = false;
      };
      det.addEventListener('toggle', () => { if (det.open) bar.hidden = false; });
      bar.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        const all = load(QUIZ);
        (all[here] ??= {})[q] = { ok: b.dataset.ok === '1', self: true };
        save(QUIZ, all);
        paint(); updateScore();
      }));
      paint();
    });
    updateScore();
  }

  // ---------- 자기평가 ----------
  const RATE = 'neurobio-rate';
  document.querySelectorAll('.self-rate').forEach((box) => {
    const msg = box.querySelector('.self-rate-msg');
    const paint = () => {
      const r = load(RATE)[here];
      box.querySelectorAll('[data-score]').forEach((b) => b.setAttribute('aria-pressed', String(r?.score === +b.dataset.score)));
      if (!r) { msg.innerHTML = ''; return; }
      const video = document.querySelector('.sec-video h2');
      msg.innerHTML = r.score <= 2
        ? `<strong>복습 추천.</strong> <a href="${conceptHref()}">개념 설명</a>${video ? ` 또는 <a href="#${video.id}">영상</a>` : ''}부터 다시 보세요. 내 학습 현황의 "복습할 레슨"에도 올려 두었습니다.`
        : '기록했습니다. 내 학습 현황에서 다시 볼 수 있습니다.';
    };
    box.querySelectorAll('[data-score]').forEach((b) => b.addEventListener('click', () => {
      const all = load(RATE);
      all[here] = { score: +b.dataset.score, title: pageTitle(), at: Date.now() };
      save(RATE, all);
      paint();
    }));
    paint();
  });

  // ---------- 읽기 진행 막대 (구간별) ----------
  const secs = [...document.querySelectorAll('.sl-markdown-content section.sec')];
  if (secs.length > 2) {
    const bar = document.createElement('div');
    bar.className = 'sec-progress';
    bar.setAttribute('aria-hidden', 'true');
    const parts = secs.map((s) => {
      const span = document.createElement('span');
      const cs = getComputedStyle(s);
      span.style.setProperty('--h', cs.getPropertyValue('--h'));
      span.style.setProperty('--s', cs.getPropertyValue('--s'));
      span.append(document.createElement('i'));
      bar.append(span);
      return span;
    });
    document.body.append(bar);
    let ticking = false;
    const paint = () => {
      ticking = false;
      const y = window.scrollY + window.innerHeight * 0.35;
      secs.forEach((s, i) => {
        const top = s.getBoundingClientRect().top + window.scrollY, h = s.offsetHeight;
        parts[i].style.flexGrow = Math.max(h, 1);
        parts[i].style.setProperty('--p', Math.min(1, Math.max(0, (y - top) / h)));
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    addEventListener('resize', paint);
    paint();
  }

  // ---------- 한 장씩 보기 (개념 설명의 ### 소단원) ----------
  const slideBtn = document.querySelector('.slide-open');
  const concept = document.querySelector('.sec-concept');
  if (slideBtn && concept && typeof HTMLDialogElement === 'function') {
    const slides = [];
    let cur = null;
    for (const el of concept.children) {
      if (el === concept.firstElementChild) continue; // 구간 제목
      if (el.matches('.quick-check, .viz-wide, .diagram')) continue;
      if (el.matches('.sl-heading-wrapper.level-h3') || el.matches('h3')) { cur = []; slides.push(cur); }
      if (cur) cur.push(el);
    }
    if (slides.length >= 2) {
      slideBtn.hidden = false;
      const dlg = document.createElement('dialog');
      dlg.className = 'slides';
      dlg.setAttribute('aria-label', '개념 설명 한 장씩 보기');
      dlg.innerHTML = '<div class="slides-head"><span class="slides-count" aria-live="polite"></span>'
        + '<div class="slides-bar" aria-hidden="true"><i></i></div>'
        + '<button type="button" class="btn slides-close">닫기 (Esc)</button></div>'
        + '<div class="slides-body sl-markdown-content" tabindex="-1"></div>'
        + '<div class="slides-foot"><button type="button" class="btn slides-prev">← 이전</button>'
        + '<button type="button" class="btn btn-primary slides-next">다음 →</button></div>';
      document.body.append(dlg);
      const body = dlg.querySelector('.slides-body');
      const prev = dlg.querySelector('.slides-prev'), next = dlg.querySelector('.slides-next');
      let n = 0;
      const show = (i) => {
        n = Math.max(0, Math.min(slides.length - 1, i));
        body.replaceChildren(...slides[n].map((el) => {
          const c = el.cloneNode(true);
          c.querySelectorAll('[id]').forEach((x) => x.removeAttribute('id'));
          c.removeAttribute?.('id');
          c.querySelectorAll('.sl-anchor-link').forEach((x) => x.remove());
          return c;
        }));
        dlg.querySelector('.slides-count').textContent = `${n + 1} / ${slides.length}`;
        dlg.querySelector('.slides-bar').style.setProperty('--p', (n + 1) / slides.length);
        prev.disabled = n === 0;
        next.textContent = n === slides.length - 1 ? '마치기' : '다음 →';
        body.scrollTop = 0;
        body.focus();
      };
      prev.addEventListener('click', () => show(n - 1));
      next.addEventListener('click', () => (n === slides.length - 1 ? dlg.close() : show(n + 1)));
      dlg.querySelector('.slides-close').addEventListener('click', () => dlg.close());
      dlg.addEventListener('keydown', (e) => {
        if (e.target.closest('input, textarea')) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); show(n + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); show(n - 1); }
      });
      let x0 = null;
      body.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      body.addEventListener('touchend', (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        x0 = null;
        if (Math.abs(dx) > 60) show(n + (dx < 0 ? 1 : -1));
      });
      dlg.addEventListener('close', () => slideBtn.focus());
      slideBtn.addEventListener('click', () => { dlg.showModal(); show(n); });
    }
  }

  // ---------- 홈: 오늘 할 레슨, 주차별 카드 ----------
  const doneMap = loadDone();
  const firstOpen = (lessons) => lessons.find(([u]) => !doneMap[u]);
  const coreLessons = [];
  document.querySelectorAll('.group-card[data-lessons]').forEach((card) => {
    const lessons = JSON.parse(card.dataset.lessons);
    if (card.classList.contains('is-core')) coreLessons.push(...lessons);
    const n = lessons.filter(([u]) => doneMap[u]).length;
    card.querySelector('.group-done').textContent = n;
    card.querySelector('.bar').style.setProperty('--p', lessons.length ? n / lessons.length : 0);
    card.classList.toggle('is-complete', n === lessons.length);
    const btn = card.querySelector('.group-next');
    const open = firstOpen(lessons);
    if (open) { btn.href = open[0]; btn.textContent = n ? '이어서 하기' : '시작하기'; btn.title = open[1]; }
    else { btn.href = lessons[0][0]; btn.textContent = '처음부터 복습'; }
  });
  const today = document.querySelector('.today');
  if (today && coreLessons.length) {
    const n = coreLessons.filter(([u]) => doneMap[u]).length;
    const open = firstOpen(coreLessons);
    today.querySelector('.core-done').textContent = n;
    today.querySelector('.core-total').textContent = coreLessons.length;
    today.querySelector('.bar').style.setProperty('--p', n / coreLessons.length);
    const a = today.querySelector('.today-title a'), go = today.querySelector('.today-go');
    if (open) { a.href = go.href = open[0]; a.textContent = open[1]; go.textContent = n ? '이어서 하기' : '이 레슨 시작'; }
    else { today.querySelector('.today-tag').textContent = '필수 과정 완료'; a.textContent = '심화 파트나 보충 단원을 골라 보세요'; a.href = go.href = '#주차별-레슨'; go.textContent = '카드 보기'; }
  }
  // 접힌 과정 안내 속 제목으로 가는 링크(사이드바 "시작하기" 등)
  const openReadme = () => {
    const more = document.querySelector('.readme-more');
    const id = decodeURIComponent(location.hash.slice(1));
    const t = id && document.getElementById(id);
    if (more && t && more.contains(t)) { more.open = true; t.scrollIntoView(); }
  };
  openReadme();
  addEventListener('hashchange', openReadme);

  // ---------- 내 학습 현황 ----------
  const dash = document.querySelector('.dash[data-groups]');
  if (dash) {
    const groups = JSON.parse(dash.dataset.groups);
    const titleOf = new Map(groups.flatMap((g) => g.lessons));
    const core = groups.filter((g) => g.core).flatMap((g) => g.lessons);
    const nDone = (ls) => ls.filter(([u]) => doneMap[u]).length;
    const quick = Object.values(load(QUICK));
    const qRight = quick.filter((q) => q.ok).length;
    const rates = Object.entries(load(RATE));
    const review = rates.filter(([, r]) => r.score <= 2).sort((a, b) => a[1].score - b[1].score);
    const quizAll = Object.values(load(QUIZ)).flatMap((o) => Object.values(o));
    const intro = dash.innerHTML;
    dash.innerHTML = `
      <div class="dash-top">
        <div class="dash-stat"><b>${nDone(core)} / ${core.length}</b><span>필수 과정(0–6주차) 완료 레슨</span></div>
        <div class="dash-stat"><b>${quick.length ? Math.round((qRight / quick.length) * 100) + '%' : '–'}</b><span>즉석 확인 정답률 (${qRight} / ${quick.length}문항)</span></div>
        <div class="dash-stat"><b>${quizAll.length ? Math.round((quizAll.filter((q) => q.ok).length / quizAll.length) * 100) + '%' : '–'}</b><span>레슨 퀴즈 정답률 (푼 문항 ${quizAll.length}개)</span></div>
      </div>
      <h2 id="by-group">주차별 진도</h2>
      <ul class="dash-bars">${groups.map((g) => {
        const d = nDone(g.lessons);
        return `<li><span class="lbl">${html(g.name)}</span><div class="bar" role="img" aria-label="${html(g.name)} ${g.lessons.length}개 중 ${d}개 완료"><span style="--p:${g.lessons.length ? d / g.lessons.length : 0}"></span></div><span class="num">${d} / ${g.lessons.length}</span></li>`;
      }).join('')}</ul>
      <h2 id="review">복습할 레슨</h2>
      ${review.length
        ? `<ul class="dash-list">${review.map(([u, r]) => `<li><a href="${html(u)}">${html(titleOf.get(u) || r.title)}</a> — 이해도 ${r.score}점</li>`).join('')}</ul>`
        : '<p class="dash-empty">레슨 끝의 "얼마나 이해했나요?"에서 1–2점을 고른 레슨이 여기에 모입니다.</p>'}
      <h2 id="backup">기록 옮기기</h2>
      <p class="dash-note">다른 브라우저나 기기로 옮길 때 파일로 내보내고, 새 곳에서 가져오세요. 가져오면 이 브라우저의 기록을 파일 내용으로 바꿉니다.</p>
      <div class="dash-io"><button type="button" class="btn dash-export">진도 내보내기 (JSON)</button>
      <button type="button" class="btn dash-import-btn">진도 가져오기</button><input id="dash-import" type="file" accept="application/json,.json" hidden>
      <span class="dash-io-msg" aria-live="polite"></span></div>
      ${intro}`;
    const KEYS = ['neurobio-done', GOALS, QUIZ, QUICK, RATE];
    dash.querySelector('.dash-export').addEventListener('click', () => {
      const data = Object.fromEntries(KEYS.map((k) => [k, load(k)]));
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      a.download = `neurobio-progress-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    dash.querySelector('.dash-import-btn').addEventListener('click', () => dash.querySelector('#dash-import').click());
    dash.querySelector('#dash-import').addEventListener('change', async (e) => {
      const out = dash.querySelector('.dash-io-msg');
      try {
        const data = JSON.parse(await e.target.files[0].text());
        const keys = Object.keys(data).filter((k) => KEYS.includes(k) && data[k] && typeof data[k] === 'object' && !Array.isArray(data[k]));
        if (!keys.length) throw new Error('진도 파일이 아닙니다');
        keys.forEach((k) => save(k, data[k]));
        location.reload();
      } catch (err) {
        out.textContent = `가져오지 못했습니다: ${err.message}. 이 사이트에서 내보낸 JSON 파일인지 확인하세요.`;
      }
    });
  }

  // ---------- 시각화를 본문 칸보다 넓게 (데스크톱) ----------
  const wides = document.querySelectorAll('.viz-wide');
  const pane = document.querySelector('.main-pane');
  function widen() {
    const pr = pane?.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(document.querySelector('.content-panel') || document.body).paddingLeft) || 0;
    wides.forEach((f) => {
      f.style.width = f.style.marginLeft = '';
      if (!pr || innerWidth < 800) return; // 모바일은 CSS가 전체 폭으로
      const cr = f.getBoundingClientRect();
      const left = pr.left + pad, right = pr.right - pad;
      const w = Math.min(1024, right - left);
      if (w <= cr.width) return;
      const x = Math.min(Math.max(cr.left + cr.width / 2 - w / 2, left), right - w);
      f.style.width = w + 'px';
      f.style.marginLeft = (x - cr.left) + 'px';
    });
  }
  if (wides.length) { widen(); addEventListener('resize', widen); }

  // ---------- 시각화 iframe 높이 맞추기 ----------
  addEventListener('message', (e) => {
    if (e.data?.type !== 'viz-height') return;
    const h = Number(e.data.height);
    if (!Number.isFinite(h) || h < 100) return;
    for (const f of document.querySelectorAll('iframe.viz-frame')) {
      if (f.contentWindow === e.source) { f.style.height = Math.min(Math.ceil(h) + 4, 4000) + 'px'; break; }
    }
  });

  // ---------- 브라우저 안 Python (Pyodide) ----------
  // 정규 과정(0–6주차)과 Crash Course에만. 심화 파트에는 붙이지 않는다.
  if (!/^\/(lessons\/week-[0-6]|crash-course)\//.test(here)) return;
  const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.29.5/full/';
  const UNSUPPORTED = /^\s*(?:import|from)\s+(wfdb|torch|nilearn|nibabel|mne|rdkit|transformers|tensorflow)\b/m;
  const SETUP = `
import os, sys, warnings
os.environ["MPLBACKEND"] = "AGG"
warnings.filterwarnings("ignore", message=".*non-interactive.*")
# 레슨 노트북은 notebooks/ 에서 ../figures 등에 저장한다. 같은 폴더 구조를 만들어 둔다.
for d in ["figures", "reports", "data", "notebooks/figures", "notebooks/reports", "notebooks/data"]:
    os.makedirs(d, exist_ok=True)
os.chdir("notebooks")

def _new_ns():
    return {"__name__": "__main__"}

def _figs():
    if "matplotlib.pyplot" not in sys.modules:
        return []
    import io, base64
    plt = sys.modules["matplotlib.pyplot"]
    out = []
    for n in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(n).savefig(buf, format="png", dpi=100, bbox_inches="tight")
        out.append(base64.b64encode(buf.getvalue()).decode())
    plt.close("all")
    return out
`;
  let pyPromise = null, ns = null, queue = Promise.resolve();
  const statusEls = [];
  const setStatus = (t) => statusEls.forEach((s) => (s.textContent = t));

  function getPy() {
    pyPromise ??= new Promise((ok, fail) => {
      setStatus('Python 불러오는 중… (처음 한 번, 수십 초 걸릴 수 있음)');
      const s = document.createElement('script');
      s.src = PYODIDE_URL + 'pyodide.js';
      s.onload = () => ok(loadPyodide({ indexURL: PYODIDE_URL }));
      s.onerror = () => fail(new Error('Pyodide를 불러오지 못했습니다(인터넷 연결 확인).'));
      document.head.append(s);
    }).then((py) => {
      py.runPython(SETUP);
      ns = py.globals.get('_new_ns')();
      return py;
    });
    pyPromise.catch(() => { pyPromise = null; });
    return pyPromise;
  }

  const colab = document.querySelector('a.colab-btn');
  const hint = '브라우저 안 Python은 내 컴퓨터의 데이터 파일, 인터넷 다운로드, 일부 패키지를 쓸 수 없습니다. 이 블록은 '
    + (colab ? 'Colab(위의 "Colab에서 열기")' : 'Colab') + '이나 내 컴퓨터에서 실행하세요. '
    + '앞 블록의 변수를 쓰는 코드라면 위 블록부터 차례로 실행해 보세요.';

  function runBlock(code, out, btn) {
    btn.disabled = true;
    out.textContent = '';
    const append = (text, cls) => {
      const span = document.createElement('span');
      if (cls) span.className = cls;
      span.textContent = text;
      out.append(span);
    };
    queue = queue.then(async () => {
      try {
        const py = await getPy();
        setStatus('패키지 확인 중…');
        await py.loadPackagesFromImports(code, { messageCallback: () => {} });
        setStatus('실행 중…');
        py.setStdout({ batched: (s) => append(s + '\n') });
        py.setStderr({ batched: (s) => append(s + '\n', 'py-err') });
        const res = await py.runPythonAsync(code, { globals: ns });
        if (res !== undefined) append(String(res) + '\n');
        res?.destroy?.();
        const figs = py.globals.get('_figs')();
        for (const b64 of figs.toJs()) {
          const img = document.createElement('img');
          img.alt = '코드가 그린 그림';
          img.src = 'data:image/png;base64,' + b64;
          out.append(img);
        }
        figs.destroy();
        if (!out.childNodes.length) append('(출력 없음 — 실행 완료)');
        setStatus('');
      } catch (e) {
        // Pyodide 내부 프레임은 빼고 사용자 코드부터 보여 준다
        append(String(e.message || e).replace(/^Traceback[^]*?(?=  File "<exec>")/, 'Traceback (most recent call last):\n'), 'py-err');
        pyPromise?.then((py) => py.globals.get('_figs')().destroy()).catch(() => {});
        append(hint, 'py-hint');
        setStatus('');
      } finally {
        btn.disabled = false;
      }
    });
  }

  document.querySelectorAll('.sl-markdown-content pre[data-language="python"]').forEach((pre) => {
    const block = pre.closest('.expressive-code') || pre;
    const copy = block.querySelector('button[data-code]');
    const original = copy ? copy.dataset.code.replace(/\u007f/g, '\n') : pre.innerText;
    if (UNSUPPORTED.test(original)) return;

    const bar = document.createElement('div');
    bar.className = 'py-runner not-content';
    bar.innerHTML = '<button class="py-run" type="button">▶ 실행</button>'
      + '<button class="py-edit-btn" type="button">✎ 편집</button>'
      + '<button class="py-reset" type="button" title="이 페이지의 모든 변수를 지웁니다">세션 초기화</button>'
      + '<span class="py-status" aria-live="polite"></span>';
    const out = document.createElement('div');
    out.className = 'py-output not-content';
    out.setAttribute('aria-live', 'polite');
    block.after(bar, out);
    statusEls.push(bar.querySelector('.py-status'));

    let editor = null;
    const editBtn = bar.querySelector('.py-edit-btn');
    editBtn.addEventListener('click', () => {
      if (editor) {
        editor.remove(); editor = null; block.hidden = false; editBtn.textContent = '✎ 편집';
      } else {
        editor = document.createElement('textarea');
        editor.className = 'py-edit';
        editor.spellcheck = false;
        editor.value = original;
        editor.rows = Math.min(30, original.split('\n').length + 1);
        block.hidden = true;
        block.after(editor);
        editBtn.textContent = '↺ 원래 코드';
        editor.focus();
      }
    });
    const runBtn = bar.querySelector('.py-run');
    runBtn.addEventListener('click', () => runBlock(editor ? editor.value : original, out, runBtn));
    bar.querySelector('.py-reset').addEventListener('click', async () => {
      if (!pyPromise) return;
      const py = await pyPromise;
      ns?.destroy?.();
      ns = py.globals.get('_new_ns')();
      py.globals.get('_figs')().destroy();
      document.querySelectorAll('.py-output').forEach((o) => (o.textContent = ''));
      setStatus('세션을 초기화했습니다.');
    });
  });
})();
