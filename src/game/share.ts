/** 공유: 휴대폰은 기기 공유 창(카카오톡·문자 등), 공유 창이 없으면 클립보드에 복사 */

/** 공유할 때 쓰는 대표 주소 (미리보기 배포 주소에서 눌러도 운영 주소로) */
export const SITE_URL = 'https://supreme-justice.vercel.app/';
export const SITE_TITLE = '대법관 키우기';

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function share(text: string): Promise<ShareResult> {
  const data = { title: SITE_TITLE, text, url: SITE_URL };
  if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(data))) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (e) {
      // 사용자가 공유 창을 닫은 경우는 실패로 보지 않음
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${SITE_URL}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}
