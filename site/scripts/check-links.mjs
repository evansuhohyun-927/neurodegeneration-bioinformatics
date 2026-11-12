// 빌드 후 dist/ 의 모든 내부 href/src 가 dist 안 파일로 해석되는지 검사한다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const html = fs.readdirSync(DIST, { recursive: true }).filter((f) => f.endsWith('.html'));

const exists = (p) => {
  const f = path.join(DIST, decodeURIComponent(p));
  return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html')));
};

let total = 0;
const broken = [];
for (const file of html) {
  const text = fs.readFileSync(path.join(DIST, file), 'utf8');
  const pageUrl = '/' + file.split(path.sep).join('/').replace(/index\.html$/, '');
  for (const [, attr] of text.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    if (/^([a-z]+:|#|\/\/)/i.test(attr) || attr === '') continue;
    total++;
    const target = new URL(attr.replace(/&amp;/g, '&'), 'http://x' + pageUrl).pathname;
    if (!exists(target)) broken.push(`${pageUrl} → ${attr}`);
  }
}
console.log(`HTML ${html.length}개, 내부 링크 ${total}개 검사, 깨진 링크 ${broken.length}개`);
broken.forEach((b) => console.log('  ' + b));
process.exitCode = broken.length ? 1 : 0;
