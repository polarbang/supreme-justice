import {
  HEALTH_HALF_CHANCE_BELOW,
  HEALTH_REST_ONLY_BELOW,
  STAT_MAX,
  STAT_NAMES,
  type StatId,
  type Stats,
} from '../game/stats';

const ORDER: StatId[] = ['insight', 'network', 'reputation', 'health'];

/** 프로필 카드 하단의 능력치 4개 */
export default function StatBars({ stats }: { stats: Stats }) {
  return (
    <ul className="stat-bars">
      {ORDER.map((id) => {
        const v = stats[id];
        const low = id === 'health' && v < HEALTH_HALF_CHANCE_BELOW;
        const critical = id === 'health' && v < HEALTH_REST_ONLY_BELOW;
        return (
          <li key={id} className={`stat-bar stat-${id}${low ? ' is-low' : ''}${critical ? ' is-critical' : ''}`}>
            <span className="stat-bar-name">{STAT_NAMES[id]}</span>
            <span
              className="stat-bar-track"
              role="meter"
              aria-label={STAT_NAMES[id]}
              aria-valuemin={0}
              aria-valuemax={STAT_MAX}
              aria-valuenow={v}
            >
              <span key={v} className="stat-bar-fill" style={{ width: `${(v / STAT_MAX) * 100}%` }} />
            </span>
            <span className="stat-bar-value">{v}</span>
          </li>
        );
      })}
    </ul>
  );
}
