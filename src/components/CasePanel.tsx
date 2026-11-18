import { useState } from 'react';
import type { Case } from '../types/case';
import CaseFile from './CaseFile';

interface Props {
  data: Case;
  /** 선고 후에는 선택지가 잠기고 정답/오답 표시 */
  submittedId: string | null;
  /** 통찰력 발동으로 다시 고를 때, 앞서 고른 오답 (선택 불가) */
  blockedIds?: string[];
  /** 보기 위에 띄우는 한 줄 안내 (예: 통찰력 발동) */
  notice?: string;
  onSubmit: (choiceId: string) => void;
  /** 선고하지 않고 집무실로 (사건은 보류되어 다음 배당 때 그대로 나옴) */
  onClose: () => void;
}

export default function CasePanel({ data, submittedId, blockedIds = [], notice, onSubmit, onClose }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const locked = submittedId !== null;
  // 다시 고르기로 막힌 보기는 선택 해제
  const selected = picked && !blockedIds.includes(picked) ? picked : null;

  const correct = submittedId === data.answerId;

  const stateOf = (id: string) => {
    if (!locked) {
      if (blockedIds.includes(id)) return ' is-blocked';
      return selected === id ? ' selected' : '';
    }
    if (id === data.answerId) return ' is-answer';
    if (id === submittedId) return ' is-wrong-pick';
    return ' is-dim';
  };

  return (
    <section className="case-panel">
      <div className="case-heading">
        <span className="case-label">배당 사건</span>
        <h2 className="case-title">{data.title}</h2>
      </div>

      <CaseFile data={data} />

      <div className="judgment">
        <h3 className="question">{data.question}</h3>
        {notice && <p className="effect-note">{notice}</p>}
        <div className="choices" role="radiogroup">
          {data.choices.map((c, i) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={(locked ? submittedId : selected) === c.id}
              disabled={locked || blockedIds.includes(c.id)}
              className={`choice${stateOf(c.id)}`}
              onClick={() => setPicked(c.id)}
            >
              <span className="choice-id">{i + 1}</span>
              <span className="choice-text">{c.text}</span>
              {/* 선고 후: 내가 고른 보기 안 오른쪽에 정판/오판 도장 */}
              {locked && c.id === submittedId && (
                <span className={`pick-result ${correct ? 'is-correct' : 'is-wrong'}`}>
                  <span className="verdict-stamp">{correct ? '정판' : '오판'}</span>
                </span>
              )}
            </button>
          ))}
        </div>
        {!locked && (
          <div className="verdict-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              집무실로 돌아가기
            </button>
            <button className="btn btn-primary" disabled={!selected} onClick={() => selected && onSubmit(selected)}>
              판결 선고
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
