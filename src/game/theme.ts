/* ───────── 화면 테마 (상단 버튼, 브라우저에 기억) ─────────
   고른 적이 없으면 OS 설정(prefers-color-scheme)을 따른다.
   첫 화면 깜빡임을 막으려고 index.html 의 인라인 스크립트가 같은 규칙으로 먼저 적용해 둔다. */
export type Theme = 'light' | 'dark';

const THEME_KEY = 'supreme-justice:theme';
const media = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-color-scheme: dark)') : null;

function saved(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

const systemTheme = (): Theme => (media?.matches ? 'dark' : 'light');

let theme: Theme = saved() ?? systemTheme();
const listeners = new Set<() => void>();

function apply() {
  document.documentElement.dataset.theme = theme;
  listeners.forEach((l) => l());
}
apply();

// 직접 고르기 전에는 OS 설정이 바뀌면 따라감
media?.addEventListener('change', () => {
  if (saved()) return;
  theme = systemTheme();
  apply();
});

export const getTheme = () => theme;

export function setTheme(v: Theme) {
  theme = v;
  try {
    localStorage.setItem(THEME_KEY, v);
  } catch {
    /* 저장 못 해도 이번 접속 동안은 유지 */
  }
  apply();
}

export function subscribeTheme(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
