import type { Progress } from '../game/progression';

/** 한 줄 칸 수 */
const PER_ROW = 10;
/** 처음부터 보여 줄 최소 줄 수 (빈 칸으로 채움) */
const MIN_ROWS = 3;
/** 최근 판결 몇 건까지 보여 줄지 */
const MAX_CELLS = 100;

/** 경력 지도: 판결 1건 = 네모 1칸 (적중 초록·미적중 빨강, 진급·강등한 판결에 마름모). 나머지는 빈 네모 */
export default function CareerMap({ progress }: { progress: Progress }) {
  const log = progress.log;
  const cells = log
    .map((e, i) => {
      if (e.kind !== 'verdict') return null;
      // 같은 판결 직후에 붙은 진급·강등 기록
      const r = log
        .slice(i + 1, i + 4)
        .find((x) => x.week === e.week && x.day === e.day && (x.kind === 'promote' || x.kind === 'demote'));
      return {
        ok: !!e.ok,
        mark: r?.kind as 'promote' | 'demote' | undefined,
        title: `${e.ok ? '적중' : '미적중'} · ${e.text}${r ? ` · ${r.text}` : ''}`,
      };
    })
    .filter((c) => c !== null)
    .slice(-MAX_CELLS);
  const total = Math.max(MIN_ROWS, Math.ceil((cells.length + 1) / PER_ROW)) * PER_ROW;

  return (
    <section className="dash-card career-map">
      <div className="dash-card-head">
        <h2 className="dash-card-title">경력 지도</h2>
        <span className="dash-card-sub">한 칸 = 판결 1건</span>
      </div>
      <div className="cmap" role="img" aria-label="판결 적중 기록">
        {Array.from({ length: total }, (_, i) => {
          const v = cells[i];
          return v ? (
            <span
              key={i}
              className={`cmap-cell ${v.ok ? 'is-ok' : 'is-miss'}${v.mark ? ` has-${v.mark}` : ''}`}
              title={v.title}
            />
          ) : (
            <span key={i} className="cmap-cell is-empty" />
          );
        })}
      </div>
      <ul className="cmap-legend">
        <li>
          <span className="cmap-cell is-ok" /> 적중
        </li>
        <li>
          <span className="cmap-cell is-miss" /> 미적중
        </li>
        <li>
          <span className="cmap-cell is-empty has-promote" /> 진급
        </li>
        <li>
          <span className="cmap-cell is-empty has-demote" /> 강등
        </li>
      </ul>
    </section>
  );
}
