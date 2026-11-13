// 원천 Markdown(저장소 루트)을 읽어 src/content/docs/ 로 변환한다. 원천 파일은 수정하지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, kindOf, splitSections, transformQuiz, parseMeta, lessonCard, selfRate, diagramFigure, vizFigure, quickCheck } from './enhance.mjs';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(SITE, '..');
const OUT = path.join(SITE, 'src/content/docs');
const VIZ_OUT = path.join(SITE, 'public/viz');
const COLAB_BASE =
  'https://colab.research.google.com/github/evansuhohyun-927/neurodegeneration-bioinformatics/blob/main/';

// ---------- 대상 파일 모으기 ----------
const listMd = (dir) =>
  fs.existsSync(path.join(REPO, dir))
    ? fs.readdirSync(path.join(REPO, dir), { recursive: true })
        .filter((f) => f.endsWith('.md') && !path.basename(f).startsWith('_'))
        .map((f) => path.posix.join(dir, f.split(path.sep).join('/')))
    : [];

const sources = [
  'README.md', 'VALIDATION.md', 'data/README.md', 'LICENSE.md',
  ...listMd('lessons'), ...listMd('crash-course'),
];

// 원천 경로 → 출력 경로(소문자). URL은 출력 경로에서 나온다.
function outPathOf(src) {
  if (src === 'README.md') return 'index.md';
  if (src === 'VALIDATION.md') return 'validation.md';
  if (src === 'LICENSE.md') return 'license.md';
  if (src.endsWith('/README.md')) return src.replace(/README\.md$/, 'index.md').toLowerCase();
  return src.toLowerCase();
}
const urlOf = (out) => '/' + out.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '/');

const pages = new Map(sources.map((s) => [s, { out: outPathOf(s), url: urlOf(outPathOf(s)) }]));

// sidebar.order: 같은 폴더 안 파일 이름 순서 (README는 맨 앞)
const naturalSort = (a, b) => a.localeCompare(b, 'en', { numeric: true });
const orderOf = new Map();
for (const dir of new Set(sources.map((s) => path.posix.dirname(s)))) {
  const files = sources.filter((s) => path.posix.dirname(s) === dir)
    .sort((a, b) => (a.endsWith('README.md') ? -1 : b.endsWith('README.md') ? 1 : naturalSort(a, b)));
  files.forEach((f, i) => orderOf.set(f, i));
}

// ---------- 시각화 지도 ----------
const vizMapPath = path.join(REPO, 'viz/map.json');
const vizMap = fs.existsSync(vizMapPath) ? JSON.parse(fs.readFileSync(vizMapPath, 'utf8')) : {};
fs.rmSync(VIZ_OUT, { recursive: true, force: true });
if (fs.existsSync(vizMapPath)) fs.cpSync(path.join(REPO, 'viz'), VIZ_OUT, { recursive: true });

// ---------- 변환 도우미 ----------

// 상대 링크 → 사이트 URL. 저장소 밖·없는 대상은 그대로 둔다.
function rewriteLink(src, target) {
  if (/^([a-z]+:|#|\/)/i.test(target)) return target;
  const [p, hash] = target.split('#');
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(src), decodeURI(p)));
  if (resolved.startsWith('..')) return target;
  let key = resolved.replace(/\/$/, '');
  if (!pages.has(key) && fs.existsSync(path.join(REPO, key)) && fs.statSync(path.join(REPO, key)).isDirectory()) {
    // 폴더 링크: 그 폴더의 README, 없으면 첫 페이지
    key = pages.has(`${key}/README.md`) ? `${key}/README.md`
      : [...pages.keys()].filter((k) => path.posix.dirname(k) === key).sort(naturalSort)[0];
  }
  if (!key || !pages.has(key)) return target;
  return pages.get(key).url + (hash ? `#${hash}` : '');
}

const ALLOWED_TAGS = new Set(['details', 'summary', 'br', 'sub', 'sup', 'kbd', 'b', 'i', 'em', 'strong', 'a', 'p', 'div', 'span', 'code']);

// 코드 밖 텍스트 한 줄: 인라인 코드(`...`)는 건드리지 않는다
function transformProse(src, line) {
  return line.split(/(`+[^`]*`+)/).map((seg, i) => {
    if (i % 2) return seg;
    seg = seg.replace(/\]\(([^)\s]+)((?:\s+"[^"]*")?)\)/g, (m, t, title) => `](${rewriteLink(src, t)}${title})`);
    // CommonMark won't close **…)** when a Korean particle follows (e.g. "**교차검증(CV)**은"); emit <strong> instead
    seg = seg.replace(/\*\*([^*\n]+?[)\]」"'])\*\*(?=[가-힣])/g, '<strong>$1</strong>');
    // <feature> 같은 자리표시자가 HTML 태그로 사라지지 않게
    return seg.replace(/<(\/?)([A-Za-z][\w-]*)([^>]*)>/g, (m, slash, tag, rest) =>
      ALLOWED_TAGS.has(tag.toLowerCase()) || /^[:@.]/.test(rest) || rest.includes('@') ? m : m.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  }).join('');
}

const YT = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/g;
function youtubeEmbeds(line) {
  const title = (line.match(/\[([^\]]+)\]\(/) || [, 'YouTube 영상'])[1];
  return [...line.matchAll(YT)].map(([, id]) =>
    `<div class="yt-embed"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${esc(title)}" loading="lazy" ` +
    `allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`);
}

// ---------- 도식 지도 ----------
const DIAGRAM_DIR = path.join(SITE, 'diagrams');
const diagramMap = fs.existsSync(path.join(DIAGRAM_DIR, 'map.json'))
  ? JSON.parse(fs.readFileSync(path.join(DIAGRAM_DIR, 'map.json'), 'utf8')) : {};
const diagramsFor = (src, heading) => (diagramMap[src] || [])
  .filter((d) => heading.startsWith(d.section || '## 개념 설명'))
  .flatMap((d) => diagramFigure(fs.readFileSync(path.join(DIAGRAM_DIR, d.file), 'utf8'), d));

// ---------- 홈 카드 묶음 ----------
const GROUPS = [
  { dir: 'lessons/week-0', name: '0주차', title: '코딩 기초', desc: '터미널, Python, pandas, Git을 처음부터', core: true },
  { dir: 'lessons/week-1', name: '1주차', title: '질환 맥락, 도구, 데이터 문해력', desc: '네 질환의 기전과 표 읽는 법', core: true },
  { dir: 'lessons/week-2', name: '2주차', title: '통계적 사고와 OSDR 메타데이터', desc: '분포, p-value, FDR, 실험 설계', core: true },
  { dir: 'lessons/week-3', name: '3주차', title: 'OSDR 뇌 신경염증 프로젝트', desc: '마우스 뇌 발현 데이터로 첫 분석 보고서', core: true },
  { dir: 'lessons/week-4', name: '4주차', title: 'PD 운동 데이터와 시계열 기초', desc: '보행 신호를 사람 단위 표로', core: true },
  { dir: 'lessons/week-5', name: '5주차', title: '파킨슨병 표현형 분석', desc: '군 비교, 교란, 누수 없는 검증', core: true },
  { dir: 'lessons/week-6', name: '6주차', title: '통합 해석, 재현성, 발표', desc: '두 프로젝트를 하나의 이야기로', core: true },
  { dir: 'lessons/supplement', name: '보충', title: '서열·정렬·진화', desc: '0주차 뒤 언제든, 고전 생명정보학' },
  { dir: 'lessons/advanced/A-r-bioconductor', name: '심화 A', title: 'R과 Bioconductor', desc: 'Python 다음 언어, 패키지 생태계' },
  { dir: 'lessons/advanced/B-matlab', name: '심화 B', title: 'MATLAB/Octave', desc: '실험실 코드를 읽고 고치기' },
  { dir: 'lessons/advanced/C-neural-signals', name: '심화 C', title: '신경신호·시간-주파수', desc: 'EEG, LFP, spike 데이터' },
  { dir: 'lessons/advanced/D-fmri', name: '심화 D', title: 'fMRI', desc: '뇌 영상 분석과 읽기' },
  { dir: 'lessons/advanced/E-ehr', name: '심화 E', title: 'EHR 2차 분석', desc: '병원 기록, 교란과 편향' },
  { dir: 'lessons/advanced/G-ai-biomed', name: '심화 G', title: 'AI·생성형 AI', desc: '생성 모델, 단백질, LLM 검증' },
  { dir: 'lessons/advanced/H-clinical-prediction', name: '심화 H', title: '임상 예측·조기진단 ML', desc: '보정, 임계값, decision curve, 외부 검증' },
  { dir: 'crash-course', name: 'Crash Course', title: '급할 때 보는 가이드', desc: '분야별 30–45분 압축 가이드' },
];
const titleOf = (src) => (fs.readFileSync(path.join(REPO, src), 'utf8').match(/^# (.+)$/m) || [, src])[1].trim();
const groupLessons = (g) => sources.filter((s) => path.posix.dirname(s) === g.dir && !s.endsWith('README.md'))
  .sort(naturalSort).map((s) => [pages.get(s).url, titleOf(s)]);

function homeDashboard() {
  const cards = GROUPS.map((g) => {
    const ls = groupLessons(g);
    return `<li class="group-card${g.core ? ' is-core' : ''}" data-lessons="${esc(JSON.stringify(ls))}">` +
      `<p class="group-name">${esc(g.name)}</p><h3 class="group-title">${esc(g.title)}</h3>` +
      `<p class="group-desc">${esc(g.desc)}</p>` +
      `<p class="group-count"><span class="group-done">0</span> / ${ls.length} 레슨</p>` +
      `<div class="bar" aria-hidden="true"><span></span></div>` +
      `<a class="btn group-next" href="${ls[0][0]}">시작하기</a></li>`;
  });
  return [
    '<div class="home-dash not-content">',
    '<section class="today" aria-labelledby="today-h">',
    '<p class="today-tag">오늘 할 레슨</p>',
    `<h2 id="today-h" class="today-title"><a href="${groupLessons(GROUPS[0])[0][0]}">${esc(groupLessons(GROUPS[0])[0][1])}</a></h2>`,
    '<p class="today-sub">필수 과정 <strong class="core-done">0</strong> / <span class="core-total">49</span> 레슨 완료</p>',
    '<div class="bar bar-lg" aria-hidden="true"><span></span></div>',
    `<p class="today-actions"><a class="btn btn-primary today-go" href="${groupLessons(GROUPS[0])[0][0]}">이 레슨 시작</a> <a class="btn" href="/dashboard/">내 학습 현황</a></p>`,
    '</section>',
    '<h2 class="cards-h" id="주차별-레슨">주차별 레슨</h2>',
    `<ul class="group-cards">${cards.join('')}</ul>`,
    '</div>', '',
  ];
}

// ---------- 레슨 변환 ----------
const quizStats = { total: 0, clickable: 0, lessons: 0 };

function convert(src) {
  const lines = fs.readFileSync(path.join(REPO, src), 'utf8').replace(/\r\n/g, '\n').split('\n');
  let title = null, fence = null, section = '';
  const body = [];

  for (const line of lines) {
    const f = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (f && f[1][0] === fence[0] && f[1].length >= fence.length && !f[2].trim()) fence = null;
      body.push(line);
      continue;
    }
    if (f) { fence = f[1]; body.push(line); continue; }

    if (title === null && /^# /.test(line)) { title = line.slice(2).trim(); continue; }
    if (/^## /.test(line)) section = line;
    body.push(transformProse(src, line));
    if (section.startsWith('## 🎬') && !/results\?search_query/.test(line) && YT.test(line)) {
      YT.lastIndex = 0;
      body.push('', ...youtubeEmbeds(line), '');
    }
    YT.lastIndex = 0;
  }

  const isLesson = /^lessons\//.test(src) || (/^crash-course\//.test(src) && !src.endsWith('README.md'));
  const viz = vizMap[src] || [];
  const { pre, sections } = splitSections(body);
  const nb = 'colab/' + src.replace(/\.md$/, '.ipynb');
  const colabUrl = src.startsWith('lessons/') && fs.existsSync(path.join(REPO, nb)) ? COLAB_BASE + nb : null;

  // 퀴즈 먼저 (즉석 확인에 첫 클릭형 문항을 쓴다)
  let quick = null;
  for (const s of sections) {
    if (isLesson && kindOf(s.heading) === 'quiz') {
      const q = transformQuiz(s.lines, src);
      s.lines = q.lines;
      quizStats.total += q.total; quizStats.clickable += q.clickable; quizStats.lessons++;
      quick ??= q.clickBlocks[0];
    }
  }

  const out = [];
  let preLines = pre;
  if (isLesson) {
    const meta = parseMeta(pre);
    if (meta) preLines = meta.rest;
    const goalsSec = sections.find((s) => kindOf(s.heading) === 'goals');
    const goals = goalsSec ? goalsSec.lines.filter((l) => /^\s*[-*] /.test(l)).map((l) => l.replace(/^\s*[-*] /, '').trim()) : [];
    const concept = sections.find((s) => kindOf(s.heading) === 'concept');
    const slides = concept && concept.lines.filter((l) => /^### /.test(l)).length >= 2;
    out.push(...lessonCard({ meta: meta?.pairs, goals, colabUrl, slides }));
  } else if (colabUrl) {
    out.push(`<p class="colab-row"><a class="btn btn-primary colab-btn" href="${colabUrl}" target="_blank" rel="noopener">Colab에서 열기</a></p>`, '');
  }
  if (src === 'README.md') out.push(...homeDashboard());
  out.push(...preLines);
  if (src === 'README.md') out.push('', '<details class="readme-more">', '<summary>과정 안내 전체 보기 — 시작하기, 사용법, 코스 지도, 심화 파트</summary>', '');

  let vizDone = viz.length === 0;
  for (const s of sections) {
    const kind = kindOf(s.heading);
    if (isLesson && kind === 'goals') continue;
    if (isLesson && kind === 'checklist') out.push('', ...selfRate());
    if (isLesson) out.push('', `<section class="sec sec-${kind}" data-sec="${kind}">`, '');
    // 구간 아이콘이 따로 있으니 제목 앞 이모지는 뺀다(본문 링크가 이 앵커를 쓰지 않음을 확인함)
    out.push(isLesson ? s.heading.replace(/^## [\p{Extended_Pictographic}\uFE0F]+\s*/u, '## ') : s.heading, ...diagramsFor(src, s.heading));
    let ls = s.lines;
    if (kind === 'concept' && isLesson) {
      while (ls.length && !ls[ls.length - 1].trim()) ls = ls.slice(0, -1);
      ls = [...ls, ...(quick ? quickCheck(quick) : []), ...(vizDone ? [] : viz.flatMap(vizFigure))];
      vizDone = true;
    } else if (/^## 개념 설명/.test(s.heading) && !vizDone) {
      ls = [...ls, ...viz.flatMap(vizFigure)]; vizDone = true;
    }
    out.push(...ls);
    if (isLesson) out.push('', '</section>', '');
  }
  if (!vizDone) console.warn(`[sync] ${src}: "## 개념 설명" 절이 없어 시각화를 넣지 못함`);
  if (src === 'README.md') out.push('', '</details>', '');

  const fm = ['---', `title: ${JSON.stringify(title ?? path.basename(src, '.md'))}`, 'sidebar:', `  order: ${orderOf.get(src)}`];
  if (src === 'crash-course/README.md') fm.push('  label: "가이드 고르기"');
  if (src === 'README.md') fm.push('tableOfContents: false');
  fm.push('---', '');
  while (out.length && !out[0].trim()) out.shift();
  return fm.join('\n') + out.join('\n');
}

// ---------- 쓰기 ----------
fs.rmSync(OUT, { recursive: true, force: true });
for (const src of sources) {
  const dest = path.join(OUT, pages.get(src).out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, convert(src));
}
// 내 학습 현황 페이지 (내용은 site.js가 이 브라우저의 기록으로 채운다)
fs.writeFileSync(path.join(OUT, 'dashboard.md'), ['---', 'title: "내 학습 현황"', 'tableOfContents: false', 'sidebar:', '  hidden: true', '---', '',
  '<div class="dash not-content" data-groups="' + esc(JSON.stringify(GROUPS.map((g) => ({ name: g.name, title: g.title, core: !!g.core, lessons: groupLessons(g) })))) + '">',
  '<p class="dash-note">이 기록은 지금 쓰는 브라우저에만 저장됩니다. 다른 사람에게 보이지 않고, 다른 기기와 자동으로 맞춰지지 않습니다.</p>',
  '</div>', ''].join('\n'));
console.log(`[sync] ${sources.length}개 페이지 생성, 시각화 지도 ${Object.keys(vizMap).length}개 레슨, 도식 ${Object.values(diagramMap).flat().length}개`);
console.log(`[sync] 퀴즈: 레슨 ${quizStats.lessons}개, 전체 ${quizStats.total}문항 → 클릭형 ${quizStats.clickable} / 접기 유지 ${quizStats.total - quizStats.clickable}`);
