// src/assets/people/<나이><m|f>.webp — 원본 img/<나이>대<남|녀>.png 를 scripts/process-people.ts 로 배경 투명화
const PEOPLE = import.meta.glob<string>('../assets/people/*.webp', { eager: true, query: '?url', import: 'default' });

/** 당사자 목록 인물 아이콘 */
export function personImage(age?: number, gender?: '남' | '여'): string | undefined {
  if (!age || !gender) return undefined;
  return PEOPLE[`../assets/people/${age}${gender === '남' ? 'm' : 'f'}.webp`];
}
