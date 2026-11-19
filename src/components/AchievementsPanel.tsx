import { useState } from 'react';
import { ACHIEVEMENTS } from '../game/achievements';
import type { Progress } from '../game/progression';
import AchievementBadge from './AchievementBadge';

/** 처음에 보이는 업적 수 (한 줄 3개 × 4줄) */
const SHOWN = 12;

/** 업적 도감: 한 줄에 3개 (뱃지 + 업적명). 얻은 업적이 먼저, 못 얻은 건 뱃지 윤곽만 흐리게 */
export default function AchievementsPanel({ progress }: { progress: Progress }) {
  const [all, setAll] = useState(false);
  const got = progress.achievements ?? {};
  // 얻은 업적 먼저 (얻은 것끼리·못 얻은 것끼리는 목록 순서 그대로)
  const sorted = [...ACHIEVEMENTS.filter((a) => got[a.id]), ...ACHIEVEMENTS.filter((a) => !got[a.id])];
  const n = ACHIEVEMENTS.length - sorted.filter((a) => !got[a.id]).length;
  const visible = all ? sorted : sorted.slice(0, SHOWN);

  return (
    <section className="dash-card achievements">
      <div className="dash-card-head">
        <h2 className="dash-card-title">업적</h2>
        <span className="dash-card-sub">
          {n} / {ACHIEVEMENTS.length}
        </span>
      </div>
      {/* 못 얻은 뱃지 윤곽선: 그림 모양을 두 겹으로 불려 테두리만 남기고, 안쪽은 옅게 채운다 (색은 layout.css) */}
      <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
        <filter id="badge-outline" colorInterpolationFilters="sRGB">
          <feComponentTransfer in="SourceAlpha" result="shape">
            <feFuncA type="linear" slope="4" intercept="-1" />
          </feComponentTransfer>
          <feMorphology in="shape" operator="dilate" radius="1.5" result="grown" />
          <feComposite in="grown" in2="shape" operator="out" result="ring" />
          <feFlood className="badge-outline-line" />
          <feComposite in2="ring" operator="in" result="line" />
          <feFlood className="badge-outline-fill" />
          <feComposite in2="shape" operator="in" result="fill" />
          <feMerge>
            <feMergeNode in="fill" />
            <feMergeNode in="line" />
          </feMerge>
        </filter>
      </svg>
      <ul className="badge-grid">
        {visible.map((a) => {
          const on = !!got[a.id];
          return (
            <li key={a.id} className={`badge-cell${on ? ' is-on' : ''}`}>
              <AchievementBadge a={a} size={48} />
              <span className="badge-name">{a.name}</span>
            </li>
          );
        })}
      </ul>
      {sorted.length > SHOWN && (
        <button type="button" className="btn-link badge-more" aria-expanded={all} onClick={() => setAll(!all)}>
          {all ? '접기 ▴' : `${sorted.length - SHOWN}개 더 보기 ▾`}
        </button>
      )}
    </section>
  );
}
