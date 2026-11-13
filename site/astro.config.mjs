// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const group = (label, directory) => ({ label, collapsed: true, items: [{ autogenerate: { directory } }] });

export default defineConfig({
  integrations: [
    starlight({
      title: '퇴행성 뇌질환 바이오인포매틱스',
      locales: { root: { label: '한국어', lang: 'ko' } },
      customCss: ['./src/styles/custom.css'],
      head: [
        { tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' } },
        { tag: 'script', attrs: { src: '/site.js', defer: true } },
      ],
      sidebar: [
        { label: '홈', link: '/' },
        { label: '내 학습 현황', link: '/dashboard/' },
        { label: '시작하기', link: '/#시작하기' },
        group('0주차 — 코딩 기초', 'lessons/week-0'),
        group('1주차 — 질환 맥락, 도구, 데이터 문해력', 'lessons/week-1'),
        group('2주차 — 통계적 사고와 OSDR 메타데이터', 'lessons/week-2'),
        group('3주차 — OSDR 뇌 신경염증 프로젝트', 'lessons/week-3'),
        group('4주차 — 파킨슨병 운동 데이터와 시계열 기초', 'lessons/week-4'),
        group('5주차 — 파킨슨병 표현형 분석', 'lessons/week-5'),
        group('6주차 — 통합 해석, 재현성, 발표', 'lessons/week-6'),
        group('보충 단원 — 서열·정렬·진화', 'lessons/supplement'),
        group('심화 A — R과 Bioconductor', 'lessons/advanced/a-r-bioconductor'),
        group('심화 B — MATLAB/Octave', 'lessons/advanced/b-matlab'),
        group('심화 C — 신경신호·시간-주파수', 'lessons/advanced/c-neural-signals'),
        group('심화 D — fMRI', 'lessons/advanced/d-fmri'),
        group('심화 E — EHR 2차 분석', 'lessons/advanced/e-ehr'),
        group('심화 G — AI·생성형 AI', 'lessons/advanced/g-ai-biomed'),
        group('심화 H — 임상 예측·조기진단 ML', 'lessons/advanced/h-clinical-prediction'),
        group('Crash Course', 'crash-course'),
        {
          label: '참고',
          collapsed: true,
          items: [
            { label: '실행 검증 기록', slug: 'validation' },
            { label: '데이터 기록 양식', slug: 'data' },
            { label: '라이선스', slug: 'license' },
          ],
        },
      ],
    }),
  ],
});
