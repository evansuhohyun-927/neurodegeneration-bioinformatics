// Vercel Routing Middleware: one shared password for the whole static site.
// The password lives only in the SITE_PASSWORD environment variable on Vercel.
// If it is not set, every request is refused (fail closed).
import { next } from '@vercel/functions';

const COOKIE = 'site_auth';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function token(password) {
  const data = new TextEncoder().encode('neurobio-site:' + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

function page(message, status) {
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>로그인</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, -apple-system, "Apple SD Gothic Neo", sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 16px; box-sizing: border-box; }
  form { width: 100%; max-width: 340px; display: grid; gap: 12px; }
  h1 { font-size: 1.2rem; margin: 0 0 4px; }
  input, button { font: inherit; padding: 10px 12px; border-radius: 8px; border: 1px solid #8888; }
  button { cursor: pointer; font-weight: 600; }
  p { margin: 0; font-size: .9rem; opacity: .8; }
  .err { color: #c0392b; opacity: 1; }
</style></head><body>
<form method="POST" action="/__login">
  <h1>퇴행성 뇌질환 바이오인포매틱스</h1>
  <p>스터디 팀 전용 사이트입니다. 공유받은 비밀번호를 입력하세요.</p>
  <label for="pw" class="visually-hidden">비밀번호</label>
  <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus aria-label="비밀번호">
  <button type="submit">들어가기</button>
  ${message ? `<p class="err" role="alert">${message}</p>` : ''}
</form></body></html>`;
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store' },
  });
}

export default async function middleware(request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return page('사이트 비밀번호가 아직 설정되지 않았습니다. 관리자에게 문의하세요.', 503);

  const url = new URL(request.url);
  const expected = await token(password);

  if (url.pathname === '/__login' && request.method === 'POST') {
    const form = await request.formData();
    const given = String(form.get('password') || '');
    if (given && (await token(given)) === expected) {
      return new Response(null, {
        status: 303,
        headers: {
          location: '/',
          'set-cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
          'cache-control': 'no-store',
        },
      });
    }
    return page('비밀번호가 맞지 않습니다.', 401);
  }

  if (readCookie(request, COOKIE) === expected) return next();
  return page('', 401);
}

export const config = { matcher: '/:path*' };
