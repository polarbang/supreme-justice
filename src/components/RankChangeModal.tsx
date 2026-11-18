import { useEffect, useRef } from 'react';
import { RANKS, MAX_RANK, rankImage, type Gender } from '../game/ranks';
import type { RankChange } from '../game/progression';
import { euro } from '../game/korean';

interface Props {
  change: RankChange;
  gender: Gender;
  onClose: () => void;
}

export default function RankChangeModal({ change, gender, onClose }: Props) {
  const from = RANKS[change.from];
  const to = RANKS[change.to];
  const promote = change.type === 'promote';
  const final = change.to === MAX_RANK;
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // 전환 연출이 끝날 즈음 버튼에 포커스
    const t = window.setTimeout(() => buttonRef.current?.focus(), 1200);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const kicker = final ? '대법원장 취임' : promote ? '임 명 장' : '인 사 발 령';
  // 새 근무처
  const message = final
    ? '사법부의 수장이 되었습니다. 게임 클리어!'
    : promote
      ? `${to.name}${euro(to.name)} 진급해 ${change.post}${euro(change.post)} 발령받았습니다.`
      : `${to.name}${euro(to.name)} 좌천되어 ${change.post}${euro(change.post)} 발령받았습니다.`;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="rank-modal-title">
      <div className={`rank-modal ${promote ? 'is-promote' : 'is-demote'}${final ? ' is-final' : ''}`}>
        <div className="rank-kicker" id="rank-modal-title">
          {kicker}
        </div>

        <div className="rank-stage">
          {promote && <div className="rank-rays" aria-hidden />}
          <img className="character rank-img rank-from" src={rankImage(from, gender)} alt="" />
          <img className="character rank-img rank-to" src={rankImage(to, gender)} alt={to.name} />
        </div>

        <p className="rank-names">
          <span className="rank-old">{from.name}</span>
          <span className="rank-arrow" aria-hidden>
            {promote ? '▲' : '▼'}
          </span>
          <strong className="rank-new">{to.name}</strong>
        </p>
        <p className="rank-msg">{message}</p>

        <button ref={buttonRef} className="btn btn-primary rank-ok" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}
