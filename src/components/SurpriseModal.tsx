import { useState } from 'react';
import type { SurpriseOutcome } from '../game/progression';
import { STAT_NAMES, type StatId } from '../game/stats';
import {
  SURPRISE_COST,
  SURPRISE_GAIN,
  TEMPT_COST,
  TEMPT_GAIN,
  type SurpriseEvent,
} from '../game/surpriseEvents';

interface Props {
  event: SurpriseEvent;
  /** 언제 (예: 2031년 · 법관 6년차) */
  when: string;
  onAnswer: (accepted: boolean) => SurpriseOutcome | undefined;
  onClose: () => void;
}

const fx = (id: StatId, v: number) => `${STAT_NAMES[id]} ${v > 0 ? '+' : '−'}${Math.abs(v)}`;

/** 기습 이벤트: 참여할지 거절할지 고르고, 결과 한 문장을 보여 준 뒤 닫는다 */
export default function SurpriseModal({ event, when, onAnswer, onClose }: Props) {
  const [result, setResult] = useState<SurpriseOutcome | null>(null);
  const tempt = event.kind === 'temptation';

  const acceptFx = tempt
    ? [fx(event.main, TEMPT_GAIN), fx('reputation', -TEMPT_COST)]
    : [fx(event.main, SURPRISE_GAIN), fx(event.cost, -SURPRISE_COST)];
  const declineFx = event.declineCost ? [fx(event.declineCost, -SURPRISE_COST)] : [];

  const answer = (accepted: boolean) => {
    const out = onAnswer(accepted);
    if (out) setResult(out);
    else onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="surprise-title">
      <div className={`surprise-modal${tempt ? ' is-temptation' : ''}`}>
        <div className="surprise-kicker">
          {/* 일반 이벤트는 머리말 없이 날짜만, 유혹 이벤트만 "은밀한 제안" 표시 */}
          <span>{tempt ? '은밀한 제안' : ''}</span>
          <span>{when}</span>
        </div>
        <h2 className="surprise-title" id="surprise-title">
          {event.name}
        </h2>
        <p className="surprise-desc">{event.description}</p>

        {result ? (
          <>
            <p className="surprise-result">
              {result.accepted ? event.acceptText : event.declineText}
              {result.exposed && event.exposedText && (
                <>
                  <br />
                  <strong className="surprise-exposed">{event.exposedText}</strong>
                </>
              )}
            </p>
            <EffectChips effects={result.effects} />
            <button className="btn btn-primary surprise-ok" onClick={onClose} autoFocus>
              확인
            </button>
          </>
        ) : (
          <>
            <dl className="surprise-options">
              <dt>참여하면</dt>
              <dd>
                {acceptFx.join(', ')}
                {tempt && <span className="surprise-risk">알려지면 평판이 더 떨어질 수 있습니다.</span>}
              </dd>
              <dt>거절하면</dt>
              <dd>{declineFx.length ? declineFx.join(', ') : '변화 없음'}</dd>
            </dl>
            <div className="surprise-actions">
              <button className="btn btn-secondary" onClick={() => answer(false)}>
                거절한다
              </button>
              <button className="btn btn-primary" onClick={() => answer(true)}>
                참여한다
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EffectChips({ effects }: { effects: Partial<Record<StatId, number>> }) {
  const list = Object.entries(effects) as [StatId, number][];
  if (!list.length) return <p className="surprise-none">능력치 변화는 없습니다.</p>;
  return (
    <p className="activity-effects surprise-effects">
      {list.map(([k, v]) => (
        <span key={k} className={`effect ${v > 0 ? 'up' : 'down'}`}>
          {fx(k, v)}
        </span>
      ))}
    </p>
  );
}
