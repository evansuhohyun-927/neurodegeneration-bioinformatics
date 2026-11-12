// 레슨 본문(줄 배열)을 사이트용으로 꾸민다: 요약 카드, 구간 블록, 클릭형 퀴즈, 즉석 확인, 도식·시각화 삽입.
// 원천 Markdown은 읽기만 한다. 결과는 Markdown + 원시 HTML 블록(앞뒤 빈 줄로 분리)이다.

export const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 한 줄짜리 인라인 Markdown → HTML (보기 버튼·메타 값용). 링크는 글자만 남긴다(버튼 안에 a 금지).
export function inlineMd(s, { links = false } = {}) {
  return s.split(/(`+[^`]*`+)/).map((seg, i) => {
    if (i % 2) return `<code>${esc(seg.replace(/^`+|`+$/g, ''))}</code>`;
    return seg
      .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, (m, t, u) => (links ? `<a href="${u}">${t}</a>` : t))
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }).join('');
}

// ---------- 구간 종류 ----------
const KINDS = [
  ['goals', /^## 오늘의 목표/],
  ['video', /^## 🎬/],
  ['concept', /^## (개념 설명|한눈에 보기|핵심 개념)/],
  ['example', /^## 예시로 이해하기/],
  ['practice', /^## 직접 해보기/],
  ['ai', /^## 🤖/],
  ['quiz', /^## 퀴즈/],
  ['checklist', /^## 오늘의 산출물 체크리스트/],
  ['more', /^## (더 알아보기|더 읽을거리)/],
];
export const kindOf = (h) => (KINDS.find(([, re]) => re.test(h)) || ['other'])[0];

// 코드 펜스를 존중하며 '## ' 제목으로 나눈다
export function splitSections(lines) {
  const pre = [], sections = [];
  let cur = null, fence = null;
  for (const line of lines) {
    const f = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (fence) { if (f && f[1][0] === fence[0] && f[1].length >= fence.length && !f[2].trim()) fence = null; }
    else if (f) fence = f[1];
    else if (/^## /.test(line)) { cur = { heading: line, lines: [] }; sections.push(cur); continue; }
    (cur ? cur.lines : pre).push(line);
  }
  return { pre, sections };
}

// ---------- 퀴즈 ----------
const FAMILIES = [
  { name: 'circled', labels: '①②③④⑤⑥⑦⑧⑨⑩'.split('') },
  { name: 'hangul', labels: '가나다라마바사'.split('').map((c) => `(${c})`) },
  { name: 'latinParen', labels: 'abcdefgh'.split('').map((c) => `(${c})`) },
  { name: 'latinParenUpper', labels: 'ABCDEFGH'.split('').map((c) => `(${c})`) },
  { name: 'latinClose', labels: 'abcdefgh'.split('').map((c) => `${c})`), boundary: true },
];

// 인라인 코드는 같은 길이의 공백으로 가려서 보기 기호를 코드 안에서 찾지 않게 한다
const maskCode = (s) => s.replace(/`+[^`]*`+/g, (m) => ' '.repeat(m.length));

function findAll(masked, label, boundary) {
  const out = [];
  let i = -1;
  while ((i = masked.indexOf(label, i + 1)) !== -1) {
    if (boundary && i > 0 && !/\s/.test(masked[i - 1])) continue; // f(a), (a) 같은 것 제외
    out.push(i);
  }
  return out;
}

// 보기 영역 텍스트 → { start, options:[{label,text}], family } 또는 null(불확실)
export function parseOptions(text) {
  const masked = maskCode(text);
  let best = null;
  for (const fam of FAMILIES) {
    const firsts = findAll(masked, fam.labels[0], fam.boundary);
    if (firsts.length !== 1) continue; // 첫 기호가 없거나 두 번 이상 → 불확실
    const pos = [firsts[0]];
    for (let k = 1; k < fam.labels.length; k++) {
      const hits = findAll(masked, fam.labels[k], fam.boundary);
      if (hits.length === 0) {
        // 뒤 기호가 하나라도 더 나오면 순서가 꼬인 것
        if (fam.labels.slice(k + 1).some((l) => findAll(masked, l, fam.boundary).length)) return null;
        break;
      }
      if (hits.length !== 1 || hits[0] < pos[k - 1]) return null;
      pos.push(hits[0]);
    }
    if (pos.length < 2) continue;
    if (!best || pos[0] < best.pos[0]) best = { fam, pos };
  }
  if (!best) return null;
  const { fam, pos } = best;
  const options = pos.map((p, k) => {
    const label = fam.labels[k];
    const raw = text.slice(p + label.length, k + 1 < pos.length ? pos[k + 1] : text.length);
    return { label, text: raw.replace(/\n\s*-\s*$/, '').replace(/\s*\n\s*-?\s*/g, ' ').replace(/^[.\s]+/, '').trim() };
  });
  if (options.some((o) => !o.text)) return null;
  // 보기 시작 앞의 '- ' 목록 기호는 지문에서 떼어낸다
  const start = pos[0] - (text.slice(0, pos[0]).match(/(^|\n)\s*-\s*$/) ? text.slice(0, pos[0]).match(/-\s*$/)[0].length : 0);
  return { start, options, family: fam };
}

// 해설 첫머리에서 정답 기호를 읽는다. 둘 이상이거나 애매하면 -1.
export function answerIndex(first, family) {
  let s = first.trim().replace(/^\*\*/, '').replace(/^정답\s*(은|:|：)?\s*/, '').replace(/^\*\*/, '').trim();
  const idx = family.labels.findIndex((l) => s.startsWith(l));
  if (idx < 0) return -1;
  const rest = s.slice(family.labels[idx].length);
  if (!/^(\*\*)?($|[\s.,:)·—–-])/.test(rest)) return -1;
  // "②, ③", "(b)와 (c)" 처럼 복수 정답이면 포기. "②. ①은 …" 같은 해설은 괜찮다.
  const head = maskCode(rest).replace(/^\*\*/, '');
  if (family.labels.some((l) => new RegExp(`^\\s*(,|·|/|와|과|및|그리고|and)\\s*(\\*\\*)?${l.replace(/[()]/g, '\\$&')}`).test(head))) return -1;
  return idx;
}

const Q_START = /^\*\*(\d+)\.\*\*/;

// 퀴즈 절 줄 배열 → { lines, total, clickable, items:[clickable html blocks] }
export function transformQuiz(lines, src) {
  const out = [];
  let total = 0, clickable = 0;
  const clickBlocks = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(Q_START);
    if (!m) { out.push(lines[i++]); continue; }
    // 문항 하나: 시작 줄부터 </details> 까지
    let j = i, detailsAt = -1, endAt = -1, fence = null;
    for (; j < lines.length; j++) {
      const f = lines[j].match(/^\s*(`{3,}|~{3,})(.*)$/);
      if (fence) { if (f && f[1][0] === fence[0] && !f[2].trim()) fence = null; continue; }
      if (f) { fence = f[1]; continue; }
      if (j > i && Q_START.test(lines[j]) && detailsAt < 0) break;
      if (detailsAt < 0 && /^<details/.test(lines[j].trim())) detailsAt = j;
      if (detailsAt >= 0 && /<\/details>\s*$/.test(lines[j])) { endAt = j; break; }
    }
    total++;
    if (detailsAt < 0 || endAt < 0) { // 해설 없는 문항: 그대로
      const stop = detailsAt < 0 ? j : endAt + 1;
      out.push(...lines.slice(i, stop)); i = stop; continue;
    }
    const item = lines.slice(i, endAt + 1);
    const stemLines = lines.slice(i, detailsAt);
    const detailLines = lines.slice(detailsAt, endAt + 1);
    const html = clickItem(stemLines, detailLines, m[1], src);
    if (html) { clickable++; out.push(...html); clickBlocks.push(html); }
    else out.push(...item.map((l) => l.replace('<summary>정답 보기</summary>', '<summary>먼저 답을 적어 본 뒤 펼치기</summary>')));
    i = endAt + 1;
  }
  if (total) out.push('', `<div class="quiz-score not-content" data-total="${total}" aria-live="polite"></div>`, '');
  return { lines: out, total, clickable, clickBlocks };
}

function clickItem(stemLines, detailLines, num, src) {
  const stemText = stemLines.join('\n');
  if (/```|~~~/.test(stemText) && !/```[^]*```/.test(stemText)) return null;
  // 보기는 마지막 코드 펜스 뒤에서만 찾는다
  const lastFence = stemText.lastIndexOf('```');
  const offset = lastFence >= 0 ? stemText.indexOf('\n', lastFence) + 1 : 0;
  if (lastFence >= 0 && offset === 0) return null;
  if (/모두 고르|복수|두 개 고르|2개 고르|O\/X|참\/거짓/.test(stemText)) return null;
  const parsed = parseOptions(stemText.slice(offset));
  if (!parsed) return null;
  const firstAnswer = detailLines.slice(1).find((l) => l.trim() && !/^<\/?details|<summary/.test(l.trim()))
    ?? detailLines[0].replace(/^.*<\/summary>/, '');
  const ans = answerIndex(firstAnswer || '', parsed.family);
  if (ans < 0 || ans >= parsed.options.length) return null;
  const stem = stemText.slice(0, offset + parsed.start).trimEnd();
  if (!stem.replace(Q_START, '').trim()) return null;
  const body = detailLines.map((l) => l.replace(/<summary>[^<]*<\/summary>/, '<summary>해설</summary>'))
    .map((l, k) => (k === 0 ? l.replace('<details>', '<details class="quiz-answer">') : l));
  return [
    `<div class="quiz-item" data-q="${num}" data-answer="${ans}">`, '',
    stem, '',
    `<div class="quiz-options not-content" role="group" aria-label="${num}번 보기">`,
    ...parsed.options.map((o, k) =>
      `<button type="button" class="quiz-opt" data-i="${k}"><span class="quiz-label">${esc(o.label)}</span><span class="quiz-text">${inlineMd(o.text)}</span></button>`),
    '</div>',
    '<p class="quiz-feedback not-content" aria-live="polite"></p>', '',
    ...body, '',
    '</div>', '',
  ];
}

// ---------- 요약 카드 ----------
// 머리 인용줄 "> **주차:** … · **예상 시간:** …" → [[키, 값]]
export function parseMeta(pre) {
  const idx = pre.findIndex((l) => l.trim());
  if (idx < 0 || !/^>\s*\*\*[^*]+:\*\*/.test(pre[idx])) return null;
  let end = idx;
  while (end < pre.length && /^>/.test(pre[end])) end++;
  const text = pre.slice(idx, end).map((l) => l.replace(/^>\s?/, '')).join(' ');
  const pairs = text.split(/\s+·\s+(?=\*\*)/).map((p) => p.match(/^\*\*([^*]+?):\*\*\s*(.*)$/)).filter(Boolean)
    .map(([, k, v]) => [k.trim(), v.trim()]);
  if (!pairs.length) return null;
  return { pairs, rest: [...pre.slice(0, idx), ...pre.slice(end)] };
}

export function lessonCard({ meta, goals, colabUrl, slides }) {
  const out = ['<div class="lesson-card not-content">'];
  if (meta?.length) {
    out.push('<dl class="lesson-meta">',
      ...meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${inlineMd(v, { links: true })}</dd></div>`), '</dl>');
  }
  if (goals?.length) {
    out.push('<p class="lesson-card-label" id="goals-label">오늘의 목표</p>',
      '<ul class="lesson-goals" aria-labelledby="goals-label">',
      ...goals.map((g, k) => `<li><label><input type="checkbox" data-goal="${k}"><span>${inlineMd(g, { links: true })}</span></label></li>`),
      '</ul>');
  }
  out.push('<div class="lesson-actions">');
  if (colabUrl) out.push(`<a class="btn btn-primary colab-btn" href="${colabUrl}" target="_blank" rel="noopener">Colab에서 열기</a>`);
  if (slides) out.push('<button type="button" class="btn slide-open" hidden>한 장씩 보기</button>');
  out.push('<div class="lesson-done"></div>', '</div>', '</div>', '');
  return out;
}

export const selfRate = () => [
  '<div class="self-rate not-content">',
  '<p class="self-rate-q" id="self-rate-q">이 레슨을 얼마나 이해했나요?</p>',
  '<div class="self-rate-scale" role="group" aria-labelledby="self-rate-q">',
  ...[1, 2, 3, 4, 5].map((n) => `<button type="button" data-score="${n}" aria-pressed="false">${n}</button>`),
  '</div>',
  '<p class="self-rate-ends"><span>1 거의 모르겠다</span><span>5 남에게 설명할 수 있다</span></p>',
  '<p class="self-rate-msg" aria-live="polite"></p>',
  '</div>', '',
];

// 도식 SVG를 figure로. 빈 줄이 있으면 HTML 블록이 끊기므로 지운다.
export const diagramFigure = (svg, { title, caption }) => [
  '', `<figure class="diagram not-content">`,
  `<div class="diagram-scroll" tabindex="0" role="region" aria-label="${esc(title)} 도식">`,
  svg.replace(/\n\s*\n/g, '\n').trim(),
  '</div>',
  '<p class="diagram-hint" aria-hidden="true">도식을 옆으로 밀어 끝까지 볼 수 있습니다.</p>',
  `<figcaption><strong>${esc(title)}</strong> ${esc(caption || '')}</figcaption>`,
  '</figure>', '',
];

export const vizFigure = ({ file, title, height }) => [
  '', '<figure class="viz-wide not-content">',
  `<figcaption><span class="viz-title">직접 만져 보기: ${esc(title)}</span> <a class="viz-open" href="/viz/${esc(file)}" target="_blank" rel="noopener">새 창에서 크게 보기</a></figcaption>`,
  `<iframe class="viz-frame" src="/viz/${esc(file)}" data-viz-src="/viz/${esc(file)}" title="${esc(title)}" loading="lazy" height="${Number(height) || 560}"></iframe>`,
  '</figure>', '',
];

export const quickCheck = (block) => [
  '', '<aside class="quick-check" aria-label="즉석 확인">', '',
  '<p class="quick-check-label not-content">즉석 확인 <span>퀴즈 문항 하나를 미리 풀어 봅니다</span></p>', '',
  ...block.map((l) => l.replace('<div class="quiz-item"', '<div class="quiz-item" data-quick="1"')), '',
  '</aside>', '',
];
