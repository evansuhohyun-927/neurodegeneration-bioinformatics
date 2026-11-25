// 퀴즈 파서 자기 점검: node scripts/enhance.test.mjs
import assert from 'node:assert/strict';
import { parseOptions, answerIndex, transformQuiz, parseMeta } from './enhance.mjs';

const inline = parseOptions('질문? (a) `x(a)` (b) 둘 (c) 셋');
assert.deepEqual(inline.options.map((o) => o.text), ['`x(a)`', '둘', '셋']);
assert.equal(answerIndex('**(b)**. (a)는 틀림', inline.family), 1);
assert.equal(answerIndex('(b)와 (c). 둘 다', inline.family), -1); // 복수 정답
assert.equal(answerIndex('`[1 2]` 그대로', inline.family), -1);
const circled = parseOptions('질문\n① 하나\n② 둘\n③ 셋');
assert.equal(answerIndex('정답: ③ 이유', circled.family), 2);
assert.equal(parseOptions('질문 ① 하나 ③ 셋'), null); // 순서가 빠짐
assert.equal(parseOptions('print(a) 결과는?'), null);

const q = transformQuiz(['**1.** 고르세요', '① 가', '② 나', '', '<details><summary>정답 보기</summary>', '', '②. 설명', '', '</details>',
  '', '**2.** (단답) 왜?', '', '<details><summary>정답 보기</summary>', '', '이유', '', '</details>'], 'x.md');
assert.equal(q.total, 2);
assert.equal(q.clickable, 1);
assert.ok(q.lines.join('\n').includes('data-answer="1"'));
assert.ok(q.lines.join('\n').includes('먼저 답을 적어 본 뒤 펼치기'));
const m1 = parseMeta(['> **교재 노트** · 심화 파트 J · **읽는 시간:** 45분 · **함께 읽기:** [T03](a.md), [I4](b.md)', '', '본문']);
assert.deepEqual(m1.pairs, [['구분', '**교재 노트** · 심화 파트 J'], ['읽는 시간', '45분'], ['함께 읽기', '[T03](a.md), [I4](b.md)']]);
assert.deepEqual(m1.rest, ['', '본문']);
assert.deepEqual(parseMeta(['> **이론 노트** · 노트 12편 · 실습: [Day I1](x.md)']).pairs, [['구분', '**이론 노트** · 노트 12편 · 실습: [Day I1](x.md)']]);
assert.deepEqual(parseMeta(['> **주차:** 1주 · **예상 시간:** 90분']).pairs, [['주차', '1주'], ['예상 시간', '90분']]);
assert.equal(parseMeta(['> **주의** 이건 인용문이다']), null);
console.log('enhance self-test ok');
