import { useState } from 'react';
import type { Case } from '../types/case';
import { personImage } from '../game/people';
import LawRefs from './LawRefs';

const TABS = [
  { id: 'background', label: '사건개요' },
  { id: 'evidence', label: '증거목록' },
  { id: 'issue', label: '쟁점' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function CaseFile({ data }: { data: Case }) {
  const [tab, setTab] = useState<TabId>('background');
  const [showDetail, setShowDetail] = useState(false);

  return (
    <section className="case-file">
      <div className="case-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`case-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="paper" role="tabpanel">
        {tab === 'background' && (
          <>
            {/* 당사자는 사건개요 맨 위에 한 사람당 한 줄로 */}
            <ul className="party-line">
              {data.parties.map((p, i) => (
                <li key={i} className="party-chip">
                  <span className="party-avatar" aria-hidden>
                    {personImage(p.age, p.gender) && <img src={personImage(p.age, p.gender)} alt="" />}
                  </span>
                  <strong>{p.name}</strong>
                  <span className="party-role">{p.role}</span>
                  <span className="party-desc">{p.description}</span>
                </li>
              ))}
            </ul>
            <ul className="fact-list">
              {data.background.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            {/* 자세한 개요: 판결문에서 더 길게 정리한 사실관계 (결론은 없음) */}
            {data.backgroundDetail && (
              <div className="detail-box">
                <button
                  type="button"
                  className="detail-toggle"
                  aria-expanded={showDetail}
                  onClick={() => setShowDetail(!showDetail)}
                >
                  {showDetail ? '자세한 개요 접기 ▴' : '자세한 개요 보기 ▾'}
                </button>
                {showDetail && (
                  <ol className="detail-list">
                    {data.backgroundDetail.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'evidence' && (
          <ol className="evidence-list">
            {data.evidence.map((e, i) => (
              <li key={i} className="evidence">
                <div>
                  <div className="evidence-name">
                    <span className="evidence-no">증 제{i + 1}호</span>
                    {e.name}
                  </div>
                  <p>{e.description}</p>
                </div>
              </li>
            ))}
          </ol>
        )}

        {tab === 'issue' && (
          <div className="paper-body">
            <p className="key-issue">{data.keyIssue}</p>
            <LawRefs refs={data.lawRefs} />
          </div>
        )}
      </div>
    </section>
  );
}
