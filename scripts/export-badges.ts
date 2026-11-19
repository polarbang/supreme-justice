/**
 * 업적 뱃지 이미지 생성 프롬프트 문서: src/game/achievements.ts 목록에서 docs/BADGE_PROMPTS.md 를 만든다.
 * 만든 이미지는 img/badges/<업적 id>.png 로 저장 → npm run assets:badges 로 게임용 webp 변환.
 *   npm run docs:badges
 */
import { writeFileSync } from 'node:fs';
import { ACHIEVEMENTS, type Tone } from '../src/game/achievements';

const OUT = 'docs/BADGE_PROMPTS.md';

/** 모든 뱃지에 공통으로 붙는 스타일 (한 세트로 보이게) */
const STYLE =
  'Cute chibi pixel-art style game achievement icon, matching a Korean courtroom game with chibi judges in black robes. ' +
  'Draw only the subject itself as a freestanding illustration: no medal, no badge frame, no circular border, no background shape. ' +
  'Thick clean outline, soft shading, limited warm palette, no text, no letters, no numbers, transparent background, square 1:1 image. ' +
  'The whole illustration must fit completely inside the square with a small margin on every side; nothing may touch or be cut off at the edges. ' +
  'Do not add any extra decorations that are not in the subject description: no sparkles, no twinkles, no glints, no floating stars, no light rays.';

const TONE_STYLE: Record<Tone, string> = {
  good: 'Bright golden accents, cheerful mood.',
  neutral: 'Cool silver and soft gray-blue accents, calm mood.',
  bad: 'Dull bronze and muted red accents with small cracks or smudges, slightly comical gloomy mood.',
};
const TONE_KO: Record<Tone, string> = { good: '좋음 (금빛)', neutral: '중립 (은빛)', bad: '나쁨 (칙칙한 청동·붉은빛)' };

const sections = ACHIEVEMENTS.map(
  (a, i) => `### ${i + 1}. ${a.name} — \`img/badges/${a.id}.png\`

- 조건: ${a.condition}
- 성격: ${TONE_KO[a.tone]}

\`\`\`
${STYLE} ${TONE_STYLE[a.tone]} Subject: ${a.motif}.
\`\`\``,
);

const md = `# 업적 뱃지 이미지 프롬프트 (ChatGPT 이미지 생성용)

> \`npm run docs:badges\`로 \`src/game/achievements.ts\`에서 자동으로 만든다. 업적을 고치면 다시 실행.

## 쓰는 법

1. 아래 프롬프트를 하나씩 ChatGPT에 넣어 이미지를 만든다. 같은 대화창에서 이어서 만들면 그림체가 더 잘 맞는다.
   - 처음 하나를 만든 뒤 "이 스타일 그대로 다음 뱃지도 만들어 줘"라고 덧붙이면 세트 느낌이 유지된다.
2. 배경은 **투명(PNG)** 으로 받는다. 안 되면 단색 배경도 괜찮다(변환 스크립트가 바깥 배경을 지운다).
3. 파일 이름을 각 제목 옆 경로대로 저장한다: \`img/badges/<업적 id>.png\`
4. \`npm run assets:badges\` 실행 → \`src/assets/badges/<id>.webp\` 로 변환되어 게임에 바로 나온다.

## 공통 스타일

- 귀여운 2등신 픽셀아트 느낌 (게임의 판사 캐릭터와 같은 톤), 글자·숫자 없음
- 메달·테두리 없이 그림만. 모양은 자유지만 1:1 정사각형 안에 다 들어와야 함 (꽉 채울 필요는 없고, 가장자리에 닿거나 잘리면 안 됨)
- 반짝이·광채 같은 덧붙인 장식 없음 (설명에 있는 것만 그림)
- 색감으로 성격 구분: 좋음 = 금빛, 중립 = 은빛·회청색, 나쁨 = 칙칙한 청동·붉은빛 + 금 간 자국

## 프롬프트 (${ACHIEVEMENTS.length}개)

${sections.join('\n\n')}
`;

writeFileSync(OUT, md);
console.log(`${OUT}: 뱃지 프롬프트 ${ACHIEVEMENTS.length}개`);
