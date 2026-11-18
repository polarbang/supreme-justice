import { useSyncExternalStore } from 'react';
import { isMuted, setMuted, subscribeMuted } from '../game/sound';

/** 상단 음소거 토글 (판사봉 등 효과음) */
export default function MuteButton() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted);
  return (
    <button
      type="button"
      className="mute-btn"
      aria-pressed={muted}
      aria-label={muted ? '소리 켜기' : '소리 끄기'}
      title={muted ? '소리 켜기' : '소리 끄기'}
      onClick={() => setMuted(!muted)}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {muted ? (
          <path d="M17 9l5 6M22 9l-5 6" />
        ) : (
          <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
        )}
      </svg>
    </button>
  );
}
