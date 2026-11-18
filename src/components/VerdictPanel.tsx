import type { Case } from '../types/case';
import LawRefs from './LawRefs';

interface Props {
  data: Case;
  choiceId: string;
  /** 능력치 효과 발동 안내 */
  notes?: string[];
  onClose: () => void;
}

export default function VerdictPanel({ data, notes = [], onClose }: Props) {
  const date = data.decisionDate.split('-').map(Number).join('. ');

  return (
    <section className="verdict">
      {/* 하루 1건: 판결이 끝나면 반드시 집무실로 돌아가 다음 날을 맞는다. 선택지 바로 아래, 상세 해설은 그 아래 */}
      <div className="verdict-actions is-single">
        <button className="btn btn-primary btn-large" onClick={onClose}>
          집무실로 돌아가기
        </button>
      </div>

      {notes.map((n) => (
        <p key={n} className="effect-note">
          {n}
        </p>
      ))}

      <div className="paper verdict-paper">
        <div className="verdict-meta">
          {data.court} {date}. 선고 {data.caseNumber}
        </div>

        <h3 className="paper-heading">주문</h3>
        <blockquote className="ruling order">{data.orderText}</blockquote>

        <h3 className="paper-heading">해설</h3>
        <p>{data.explanation}</p>

        <h3 className="paper-heading">판결문 중에서</h3>
        <blockquote className="ruling">{data.ruling}</blockquote>

        <LawRefs refs={data.lawRefs} />
        <a className="source-link" href={data.sourceUrl} target="_blank" rel="noreferrer">
          판결 원문 보기 (국가법령정보센터) ↗
        </a>
      </div>

    </section>
  );
}
