import gavelSrc from '../assets/sfx/gavel.mp3'; // 원본: 프로젝트 루트 "판사봉 소리.MP3"

/** 판사봉 소리 크기 (0~1) */
const GAVEL_VOLUME = 0.2;

/** 미리 불러 두어 클릭 즉시 재생되도록 */
let gavel: HTMLAudioElement | null = null;
function getGavel() {
  if (!gavel && typeof Audio !== 'undefined') {
    gavel = new Audio(gavelSrc);
    gavel.preload = 'auto';
    gavel.volume = GAVEL_VOLUME;
  }
  return gavel;
}
getGavel();

/** 판결 선고: 판사봉 소리. 브라우저가 재생을 막아도 게임 진행에는 영향 없음 */
export function playGavel() {
  const a = getGavel();
  if (!a || muted) return;
  a.currentTime = 0;
  a.play().catch(() => {});
}

/* ───────── 음소거 (상단 버튼, 브라우저에 기억) ───────── */
const MUTE_KEY = 'supreme-justice:muted';
let muted = (() => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
})();
const listeners = new Set<() => void>();

export const isMuted = () => muted;

export function setMuted(v: boolean) {
  muted = v;
  try {
    localStorage.setItem(MUTE_KEY, v ? '1' : '0');
  } catch {
    /* 저장 못 해도 이번 접속 동안은 유지 */
  }
  listeners.forEach((l) => l());
}

export function subscribeMuted(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
