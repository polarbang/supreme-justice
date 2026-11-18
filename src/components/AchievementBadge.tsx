import type { Achievement } from '../game/achievements';

// 뱃지 그림: src/assets/badges/<업적 id>.webp (scripts/process-badges.ts). 아직 없으면 자리표시 그림
const BADGES = import.meta.glob<string>('../assets/badges/*.webp', { eager: true, query: '?url', import: 'default' });
export const badgeImage = (id: string) => BADGES[`../assets/badges/${id}.webp`];

/** 업적 뱃지 하나: 그림(없으면 이름 첫 글자 원) */
export default function AchievementBadge({ a, size = 56 }: { a: Achievement; size?: number }) {
  const src = badgeImage(a.id);
  return src ? (
    <img className="badge-img" src={src} alt="" style={{ width: size, height: size }} />
  ) : (
    <span className={`badge-placeholder tone-${a.tone}`} style={{ width: size, height: size, fontSize: size * 0.4 }} aria-hidden>
      {a.name[0]}
    </span>
  );
}
