import { useState } from 'react';
import { RANKS } from '../game/ranks';
import type { CareerRecord } from '../game/history';

/** 지난 경력의 결과 이름 */
const OUTCOME: Record<CareerRecord['outcome'], string> = {
  chief: '대법원장 취임',
  retired: '정년 퇴임',
  politics: '정계 진출',
  lawfirm: '로펌 파트너',
};

const dateText = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
};

/** 지난 경력: 끝난 판(대법원장 취임·정년 퇴임·정계 진출·로펌 이직) 최근 몇 개. 누르면 요약이 펼쳐진다 */
export default function HistoryPanel({ history }: { history: CareerRecord[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!history.length) return null;

  return (
    <section className="dash-card career-history">
      <div className="dash-card-head">
        <h2 className="dash-card-title">지난 경력</h2>
        <span className="dash-card-sub">최근 {history.length}판</span>
      </div>
      <ul className="history-list">
        {history.map((h, i) => {
          const on = open === i;
          const rate = h.total ? Math.round((h.correct / h.total) * 100) : 0;
          return (
            <li key={h.endedAt} className={`history-item${on ? ' is-open' : ''}`}>
              <button type="button" className="history-head" aria-expanded={on} onClick={() => setOpen(on ? null : i)}>
                <span className={`history-outcome is-${h.outcome}`}>{h.exitTitle ?? OUTCOME[h.outcome]}</span>
                <span className="history-who">{h.name ? `${h.name} 판사` : RANKS[h.rankIndex].name}</span>
                <span className="history-date">{dateText(h.endedAt)}</span>
              </button>
              {on && (
                <dl className="history-detail">
                  <div>
                    <dt>마지막 직급</dt>
                    <dd>{RANKS[h.rankIndex].name}</dd>
                  </div>
                  {h.highestRank > h.rankIndex && (
                    <div>
                      <dt>최고 직급</dt>
                      <dd>{RANKS[h.highestRank].name}</dd>
                    </div>
                  )}
                  <div>
                    <dt>법관 생활</dt>
                    <dd>
                      {h.years}년 · {h.age}세
                    </dd>
                  </div>
                  <div>
                    <dt>판결</dt>
                    <dd>{h.total}건</dd>
                  </div>
                  <div>
                    <dt>적중률</dt>
                    <dd>{rate}%</dd>
                  </div>
                  <div>
                    <dt>강등</dt>
                    <dd>{h.demotions}번</dd>
                  </div>
                </dl>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
