import { useState } from 'react';
import type { LogEntry } from '../game/progression';

const SHOWN = 12;

/** 인생 기록: 최근 순 타임라인 (판결 적중·미적중, 능력치 발동, 진급/강등, 기습 일정·제안, 활동) */
export default function CaseLog({ log }: { log: LogEntry[] }) {
  const [all, setAll] = useState(false);
  // 같은 날(같은 연차) 기록끼리 묶어 최근 날부터
  const days: { key: string; year?: number; entries: LogEntry[] }[] = [];
  // 업적은 인생 기록에 보이지 않음 (예전에 남은 업적 줄도 숨김)
  for (const e of log.filter((x) => x.kind !== 'achievement')) {
    // 첫 배정(임관)은 같은 날 판결과 섞이지 않게 따로
    const key = e.kind === 'start' ? 'start' : `${e.year ?? ''}-${e.week}-${e.day}`;
    const last = days[days.length - 1];
    if (last?.key === key) last.entries.push(e);
    else
      days.push({
        key,
        year: e.year,
        entries: [e],
      });
  }
  // 최근 것이 위: 날짜 묶음도, 같은 날 안의 기록도 (예: 기습 일정 → 판결 → 진급 순으로 일어났으면 진급이 맨 위)
  days.reverse();
  for (const d of days) d.entries.reverse();
  const visible = all ? days : days.slice(0, SHOWN);
  // 연차가 바뀌는 곳마다 "법관 N년차" 머리글
  const yearHead = (i: number) => {
    const y = visible[i].year;
    return y !== undefined && (i === 0 || visible[i - 1].year !== y) ? y : undefined;
  };

  return (
    <section className="dash-card case-log">
      <div className="dash-card-head">
        <h2 className="dash-card-title">인생 기록</h2>
        <span className="dash-card-sub">최근 순</span>
      </div>
      {days.length === 0 ? (
        <p className="dash-empty">아직 기록이 없습니다. 첫 사건을 배당받아 보세요.</p>
      ) : (
        <ol className="log-days">
          {visible.map((d, i) => (
            <li key={d.key} className="log-day">
              {yearHead(i) !== undefined && <span className="log-year">법관 {yearHead(i)}년차</span>}
              <ul className="log-entries">
                {d.entries.map((e, i) => (
                  <li
                    key={i}
                    className={`log-entry is-${e.kind}${e.kind === 'verdict' || e.tag ? (e.ok ? ' is-ok' : ' is-miss') : ''}${e.tag === '일정' ? ' is-schedule' : ''}`}
                  >
                    {e.kind === 'verdict' && <span className="log-tag">{e.ok ? '적중' : '미적중'}</span>}
                    {e.tag && <span className="log-tag">{e.tag}</span>}
                    {e.text}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
      {days.length > SHOWN && (
        <button className="btn-link log-more" onClick={() => setAll(!all)}>
          {all ? '접기' : `이전 기록 ${days.length - SHOWN}일 더 보기`}
        </button>
      )}
    </section>
  );
}
