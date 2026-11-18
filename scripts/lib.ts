/** 데이터 스크립트 공통 유틸 */

export const clean = (s = '') =>
  s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();

/** 판례내용에서 【주 문】 부분만 추출 */
export function extractOrder(body: string): string {
  const m = clean(body).match(/【\s*주\s*문\s*】([\s\S]*?)(?:【|$)/);
  return m ? m[1].trim() : '';
}

/** "3,000,000원", "300만 원", "1억 2,000만 원", "1억원" → 원 단위 숫자들 */
export function parseAmounts(text: string): number[] {
  const out: number[] = [];
  const re = /(?:(\d[\d,]*)\s*억)?\s*(?:(\d[\d,]*)\s*만)?\s*(\d[\d,]*)?\s*원/g;
  const n = (s?: string) => (s ? Number(s.replace(/,/g, '')) : 0);
  for (const m of text.matchAll(re)) {
    if (!m[1] && !m[2] && !m[3]) continue;
    out.push(n(m[1]) * 1e8 + n(m[2]) * 1e4 + n(m[3]));
  }
  return out;
}

/** "징역 1년 6월", "징역 8개월", "집행유예 2년" → 개월 수 (징역/금고/집행유예 등 기간) */
export function parseDurations(text: string): number[] {
  const out: number[] = [];
  const re = /(\d+)\s*년(?:\s*(\d+)\s*(?:개월|월))?|(\d+)\s*(?:개월|월)/g;
  for (const m of text.matchAll(re)) {
    if (m[1]) out.push(Number(m[1]) * 12 + Number(m[2] ?? 0));
    else out.push(Number(m[3]));
  }
  return out;
}

export type OrderOutcome =
  | { ok: true; kind: 'sentence' | 'acquittal' | 'dismissed' | 'partial' | 'full' }
  | { ok: false; reason: string };

/**
 * 주문을 게임용 결과로 분류. 애매한 주문(당사자 여럿, 반소, 일부 무죄 등)은 ok:false → 수집 단계에서 제외.
 */
export function classifyOrder(order: string, category: string): OrderOutcome {
  const o = order.replace(/\s+/g, ' ');
  if (!o) return { ok: false, reason: '주문 없음' };
  if (category === '형사') {
    if (/피고인\s*\d|피고인들|피고인\s*[A-Z甲乙丙]/.test(o)) return { ok: false, reason: '피고인 여러 명' };
    const sentence = /징역|금고|벌금|구류|형의 선고를 유예/.test(o);
    const acquit = /무죄/.test(o);
    if (sentence && acquit) return { ok: false, reason: '일부 유죄·일부 무죄' };
    if (/면소|공소를 기각/.test(o)) return { ok: false, reason: '면소/공소기각' };
    if (sentence) return { ok: true, kind: 'sentence' };
    if (acquit) return { ok: true, kind: 'acquittal' };
    return { ok: false, reason: '형량 없음(항소기각 등)' };
  }
  if (category === '민사') {
    if (/반소/.test(o)) return { ok: false, reason: '반소 있음' };
    if (/(원고|피고)\s*\d|(원고|피고)들|(원고|피고)\s*[A-Z甲乙丙]|선정자|독립당사자|보조참가/.test(o))
      return { ok: false, reason: '당사자 여럿' };
    if (/각하/.test(o)) return { ok: false, reason: '각하 포함' };
    const pays = /지급하라|인도하라|이행하라|이전등기|명도하라/.test(o);
    const rest = /나머지\s*청구/.test(o);
    const dismissedAll = /청구를\s*(모두\s*)?기각/.test(o);
    if (!pays && dismissedAll) return { ok: true, kind: 'dismissed' };
    if (pays && rest) return { ok: true, kind: 'partial' };
    if (pays && !dismissedAll) return { ok: true, kind: 'full' };
    return { ok: false, reason: '결과 분류 불가' };
  }
  return { ok: false, reason: `사건종류 ${category}` };
}

/** 형사 선택지 표기 통일: "1년 6월"→"1년 6개월", "징역 1년에 집행유예 2년"→"징역 1년, 집행유예 2년", "300만원"→"300만 원" */
/**
 * "법원은 A에게 어떤 형을 선고했을까?" → "A에게 어떤 형을 선고할까요?"
 * 법원 판결을 맞히는 게 아니라 플레이어가 직접 판결하는 느낌이 들도록 '법원은'을 빼고 현재형으로.
 */
export function toPlayerQuestion(q: string): string {
  return q
    .replace(/(?:항소심\s*|재심\s*)?법원은\s*(?:재심에서\s*|두 사건을 합쳐\s*)?/, '')
    .replace(/선고했을까요?\?/, '선고할까요?')
    .replace(/내렸을까요?\?/, '내릴까요?')
    .replace(/판결했을까요?\?/, '판결할까요?')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * 이름 앞 수식어 제거: "집주인 B" → "B", "전 집주인 B" → "B", "대학교수인 시동생 B" → "B".
 * 누가 누구인지는 사건개요 첫머리의 당사자 목록에서 설명하므로 본문에서는 A·B·C로만 쓴다.
 */
const NAME_MODIFIERS = [
  '피고인', '피해자', '집주인', '세입자', '임차인', '건물주', '주인', '소유자', '매도인', '낙찰자', '점주', '운영자',
  '남편', '아내', '배우자', '연인', '지인', '자녀', '아들', '딸', '동생', '시동생', '형', '누나', '언니', '오빠',
  '남성', '여성', '사람', '인물', '당사자', '혐의자', '위반자', '유통자', '브로커', '진행자',
  '구청장', '구의원', '조합장', '이사장', '대표', '반장', '자율방범대장', '방범대원', '관리원',
  '운전자', '보행자', '택배기사', '기사', '배달원', '보안직원', '직원', '근로자', '노동자', '원청업자',
  '경찰관', '경찰공무원', '공무원', '변호사', '의사', '교사', '대학교수',
  '연대보증인', '주채무자', '보증사', '보증기관', '보험사', '공단', '법인', '회사', '건설회사', '의류업체',
  '대부업체', '결혼정보업체', '입주자대표회의', '택시공제조합',
];
/** 수식어 앞에 붙어 함께 지워야 자연스러운 말 ("버스 기사 A" → "A", "다른 세입자 B" → "B") */
const PRECEDERS = [
  '이전', '당시', '기존', '새', '다른', '동료', '계약', '버스', '승용차', '자전거', '주차장', '빌라', '땅', '상가',
  '방송사', '재단', '중국', '숙박업', '주점', '삼촌',
];
const MODIFIER = `(?:${NAME_MODIFIERS.sort((a, b) => b.length - a.length).join('|')})인?`;
const NAME_MOD_RE = new RegExp(
  `(?<![가-힣])(?:(?:${PRECEDERS.join('|')})\\s+)?(?:${MODIFIER}\\s+)+([A-Z])(?![A-Za-z])`,
  'g',
);
export function stripNameModifiers(t: string): string {
  return t.replace(NAME_MOD_RE, (m, name: string, offset: number, s: string) =>
    // "B의 아들 C", "그의 배우자 C"처럼 소유격 뒤 관계어는 뜻이 사라지므로 유지
    /의\s$/.test(s.slice(0, offset)) ? m : name,
  );
}
export const hasNameModifier = (t: string) => stripNameModifiers(t) !== t;

export function normalizeSentence(t: string): string {
  return t
    .replace(/(\d+)\s*월(?!\s*\d)/g, '$1개월')
    .replace(/\s*(?:에|,)?\s*집행유예/g, ', 집행유예')
    .replace(/(\d)\s*만원/g, '$1만 원')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Gemini 모델 ID: .env 의 GEMINI_MODEL 이 화면 표기 이름("Gemini 3.1 Flash-Lite")이어도 API ID("gemini-3.1-flash-lite")로 바꿔 쓴다.
 */
export function geminiModel(fallback = 'gemini-3.8-flash'): string {
  const raw = (process.env.GEMINI_MODEL ?? '').trim();
  if (!raw) return fallback;
  return raw.toLowerCase().replace(/^models\//, '').replace(/\s+/g, '-');
}
