/**
 * "형법 제347조 제1항" → 국가법령정보센터 조문 링크 (https://www.law.go.kr/법령/형법/제347조)
 * - "구 ○○법"(개정 전 법)은 현행 법령으로 연결
 * - 폐지·개명돼 조문 주소가 열리지 않는 법령은 국가법령정보센터 검색 결과로
 *   (목록은 npm run data:laws 가 실제로 열어 보고 src/data/law-no-article.json 에 기록)
 * - "부칙(법률 제N호) 제M조"는 해당 법령 본문으로
 * - 조약(협약)은 법령 주소로 열 수 없어 링크 없음
 */
import noArticle from '../data/law-no-article.json';

const NO_ARTICLE_PAGE = new Set<string>(noArticle);

export interface LawRef {
  /** 공백을 뺀 법령명 (주소용) */
  name: string;
  /** 원래 표기 법령명 (검색용) */
  label: string;
  article: string;
  supplement: boolean;
}

export function parseLawRef(ref: string): LawRef | undefined {
  const m = /^(?:구\s*)?(.+?)\s*(제\d+조(?:의\d+)?)/.exec(ref);
  if (!m || /협약|조약|협정/.test(m[1])) return undefined;
  const supplement = /\s*부칙.*$/.test(m[1]);
  const label = m[1].replace(/\s*부칙.*$/, '').trim();
  return { name: label.replace(/\s+/g, ''), label, article: m[2], supplement };
}

export const articleUrl = (name: string, article: string) => encodeURI(`https://www.law.go.kr/법령/${name}/${article}`);

const searchUrl = (label: string) =>
  `https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&tabMenuId=81&query=${encodeURIComponent(label)}`;

export function lawLink(ref: string): string | undefined {
  const p = parseLawRef(ref);
  if (!p) return undefined;
  if (NO_ARTICLE_PAGE.has(p.name)) return searchUrl(p.label);
  if (p.supplement) return encodeURI(`https://www.law.go.kr/법령/${p.name}`);
  return articleUrl(p.name, p.article);
}
