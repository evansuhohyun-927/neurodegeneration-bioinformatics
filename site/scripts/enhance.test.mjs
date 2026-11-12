// 퀴즈 파서 자기 점검: node scripts/enhance.test.mjs
import assert from 'node:assert/strict';
import { parseOptions, answerIndex, transformQuiz } from './enhance.mjs';

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
console.log('enhance self-test ok');
