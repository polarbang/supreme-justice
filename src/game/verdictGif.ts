import type { Case, Persona } from '../types/case';

// src/assets/verdict/<나이><m|f>-<win|lose>.webp — 원본 gif/<나이>대<남|녀> 판결성공|실패.gif 를
// scripts/process-verdict-gifs.ts 로 배경 투명화한 애니메이션 webp
const GIFS = import.meta.glob<string>('../assets/verdict/*.webp', { eager: true, query: '?url', import: 'default' });

/** 판결 결과 연출(민사·형사 공통): 정답이면 판결성공, 오답이면 판결실패 */
export function verdictGif(persona: Persona | undefined, correct: boolean): string | undefined {
  if (!persona) return undefined;
  const g = persona.gender === '남' ? 'm' : 'f';
  return GIFS[`../assets/verdict/${persona.age}${g}-${correct ? 'win' : 'lose'}.webp`];
}

/** gif에 쓸 인물: 민사는 persona, 형사는 피고인(사건개요 인물 그림과 같은 나이대·성별) */
export function casePersona(c: Case): Persona | undefined {
  if (c.persona) return c.persona;
  const d = c.parties.find((p) => p.role.includes('피고인') && p.age && p.gender);
  return d ? { name: d.name, age: d.age!, gender: d.gender! } : undefined;
}
