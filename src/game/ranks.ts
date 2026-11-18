import { RANK_NAMES } from './rankNames';

// 직급 캐릭터 그림: src/assets/characters/<male|female>-<rankId>.webp
// 원본 img/<남성|여성><직급>.png → scripts/process-characters.ts
const IMAGES = import.meta.glob<string>('../assets/characters/*.webp', { eager: true, query: '?url', import: 'default' });

/** 플레이어 성별 (직급 캐릭터 그림) */
export type Gender = 'male' | 'female';
export const GENDER_NAMES: Record<Gender, string> = { male: '남', female: '여' };


export type Difficulty = 1 | 2 | 3;

export interface Rank {
  id: string;
  name: string;
  /** 성별별 캐릭터 그림 */
  images: Record<Gender, string>;
  /** 이 직급에서 출제할 난이도 (앞쪽일수록 우선) */
  difficulties: Difficulty[];
}

const img = (gender: Gender, id: string) => IMAGES[`../assets/characters/${gender}-${id}.webp`];
const rank = (id: string, name: string, difficulties: Difficulty[]): Rank => ({
  id,
  name,
  images: { male: img('male', id), female: img('female', id) ?? img('male', id) },
  difficulties,
});

export const RANKS: readonly Rank[] = [
  rank('associate', RANK_NAMES[0], [1]),
  rank('single', RANK_NAMES[1], [1, 2]),
  rank('chief', RANK_NAMES[2], [1, 2]),
  rank('senior-chief', RANK_NAMES[3], [2, 1]),
  rank('district-president', RANK_NAMES[4], [2, 3]),
  rank('high-president', RANK_NAMES[5], [2, 3]),
  rank('justice', RANK_NAMES[6], [3, 2]),
  rank('chief-justice', RANK_NAMES[7], [3, 2]),
];

export const MAX_RANK = RANKS.length - 1;

/** 직급 캐릭터 그림 (성별에 맞게) */
export const rankImage = (r: Rank, gender: Gender = 'female') => r.images[gender];
