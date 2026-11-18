import { useEffect, useRef } from 'react';
import type { Achievement } from '../game/achievements';
import AchievementBadge from './AchievementBadge';

/** 업적 해금 팝업 (여러 개면 차례로) */
export default function AchievementPopup({ a, onClose }: { a: Achievement; onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="achv-title">
      <div className={`achv-modal tone-${a.tone}`} key={a.id}>
        <div className="achv-kicker">업적 달성</div>
        <div className="achv-badge">
          <AchievementBadge a={a} size={96} />
        </div>
        <h2 className="achv-name" id="achv-title">
          {a.name}
        </h2>
        <p className="achv-cond">{a.condition}</p>
        <button ref={ref} className="btn btn-primary achv-ok" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}
