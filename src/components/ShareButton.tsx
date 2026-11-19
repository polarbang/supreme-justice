import { useEffect, useState } from 'react';
import { share, type ShareResult } from '../game/share';

/** 복사·실패 안내를 보여 주는 시간 */
const NOTICE_MS = 2200;
const NOTICE: Partial<Record<ShareResult, string>> = {
  copied: '링크를 복사했습니다',
  failed: '공유하지 못했습니다',
};

/** 공유 결과 안내 (복사했을 때·실패했을 때만, 잠시 뒤 사라짐) */
function useShare(text: string) {
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), NOTICE_MS);
    return () => window.clearTimeout(t);
  }, [notice]);
  const run = async () => setNotice(NOTICE[await share(text)] ?? null);
  return { notice, run };
}

/** 상단 공유 아이콘: 게임 링크 공유 */
export default function ShareButton() {
  const { notice, run } = useShare('실제 판결문으로 만든 사건을 판결하며 대법원장까지 올라가 보세요.');
  return (
    <span className="share-wrap">
      <button type="button" className="share-btn" aria-label="게임 공유하기" title="게임 공유하기" onClick={run}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      </button>
      <span className="share-notice" role="status">
        {notice}
      </span>
    </span>
  );
}

/** 엔딩 화면: 내 결과 문장과 함께 공유 */
export function ShareResultButton({ text }: { text: string }) {
  const { notice, run } = useShare(text);
  return (
    <div className="share-result">
      <button type="button" className="btn btn-secondary btn-large" onClick={run}>
        내 결과 공유하기
      </button>
      <span className="share-notice is-inline" role="status">
        {notice}
      </span>
    </div>
  );
}
