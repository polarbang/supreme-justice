/**
 * data/drafts/*.json 검증: 스키마, 정답이 주문과 일치하는지, 결론 누설·법령 설명, ruling 원문 인용 여부.
 *   npm run data:validate        (오류 있으면 exit 1, 경고는 통과)
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { CaseSchema, type Case } from '../src/types/case';
import { classifyOrder, clean, extractOrder, hasNameModifier, loadExcluded, parseAmounts, parseDurations } from './lib';

const DRAFT_DIR = 'data/drafts';
const RAW_DIR = 'data/raw';

// 사건 기록(정답 공개 전 화면)에 나오면 안 되는 표현
export const LEAK_WORDS = [
  '무죄로 판단', '유죄로 판단', '선고했', '선고하였', '판결했', '인정되었', '받아들여', '억울', '부당하게',
  '정당한 방어', '결국', '판결이 확정', '배심원', '평결', '구형',
];
// 사건개요에 들어가면 안 되는 법령 설명
const LAW_WORDS = ['법령', '에 따르면', '조에 따라', '규정', '과태료', '처벌 대상', '처벌받', '처해질', '위반하면'];

const norm = (s: string) => s.replace(/\s+/g, '').replace(/[“”"‘’']/g, '');

const GENERIC_ORG = /^(지역주택조합|직장주택조합|주택조합|재건축조합|재개발조합|정비사업조합|조합|저축은행|상호저축은행|은행|협회|재단|공사|공단|보증|카드|생명|화재)$/;

/** 판결문 머리 【원 고】【피 고】의 단체 실명 (주식회사 ○○, ○○공단, ○○은행 …) */
function realOrgNames(id: string): string[] {
  const raw = path.join(RAW_DIR, id + '.json');
  if (!existsSync(raw)) return [];
  const head = (JSON.parse(readFileSync(raw, 'utf8')).판례내용 ?? '').replace(/<[^>]+>/g, ' ').slice(0, 1500);
  const names = new Set<string>();
  for (const m of head.matchAll(/【\s*(?:원\s*고|피\s*고)[^】]*】([^【]{0,200})/g)) {
    const seg = m[1].replace(/\(.*?\)/g, ' ');
    for (const x of seg.matchAll(/(?:주식회사|유한회사|재단법인|사단법인|학교법인)\s*([가-힣A-Za-z]{2,15})|([가-힣]{2,15}(?:공단|공사|은행|보증|카드|생명|화재|조합|협회|재단))/g)) {
      const n = (x[1] ?? x[2]).trim();
      // "지역주택조합", "저축은행"처럼 이름이 아니라 종류를 뜻하는 일반 명칭은 제외
      if (n.length >= 2 && !GENERIC_ORG.test(n)) names.add(n);
    }
  }
  return [...names];
}

export interface Report { id: string; errors: string[]; warnings: string[]; data?: Case }

export function validateFile(file: string): Report {
  const id = path.basename(file, '.json');
  const r: Report = { id, errors: [], warnings: [] };
  const parsed = CaseSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
  if (!parsed.success) {
    r.errors.push(...parsed.error.issues.map((i) => `스키마: ${i.path.join('.')} ${i.message}`));
    return r;
  }
  const c = (r.data = parsed.data);

  const preReveal: [string, string][] = [
    ['title', c.title], ['keyIssue', c.keyIssue],
    ...c.background.map((t, i) => [`background[${i}]`, t] as [string, string]),
    ...(c.backgroundDetail ?? []).map((t, i) => [`backgroundDetail[${i}]`, t] as [string, string]),
    ...c.evidence.map((e, i) => [`evidence[${i}]`, e.name + ' ' + e.description] as [string, string]),
    ...c.parties.map((p, i) => [`parties[${i}]`, p.description] as [string, string]),
  ];
  for (const [field, text] of preReveal)
    for (const w of LEAK_WORDS) if (text.includes(w)) r.warnings.push(`누설 의심 "${w}" in ${field}`);
  // 당사자 이름은 알파벳 한 글자만 (예: "A", "A, B", "B 등"). 실명·회사명 금지
  for (const p of c.parties)
    if (!/^[A-Z](, ?[A-Z])*( 등)?$/.test(p.name)) r.errors.push(`당사자 이름이 알파벳이 아님: "${p.name}"`);
  // 판결문 머리의 원고·피고 단체 실명(회사·공단·은행 등)이 화면 글에 그대로 나오면 안 됨
  for (const n of realOrgNames(id)) {
    const all = [c.title, c.keyIssue, c.question, c.explanation, ...c.background, ...(c.backgroundDetail ?? []),
      ...c.parties.map((p) => p.description), ...c.evidence.map((e) => e.name + ' ' + e.description)].join('\n');
    if (all.includes(n)) r.errors.push(`실명 노출: "${n}" (A·B·C나 일반 명칭으로)`);
  }
  // 쟁점에 보기로 쓰일 수 있는 구체적 형의 이름 금지 ("형량·처벌"은 허용)
  const sentenceWord = /무죄|유죄|선고유예|벌금|집행유예|실형|징역|금고|사형/.exec(c.keyIssue);
  if (sentenceWord) r.errors.push(`쟁점에 형의 이름 "${sentenceWord[0]}" — 보기 단서가 됨`);

  // 질문은 플레이어가 판결하는 형식 ("법원은 ~했을까?" X → "A에게 어떤 형을 선고할까요?")
  if (/법원은|했을까|렸을까/.test(c.question)) r.warnings.push(`질문이 법원 판결 맞히기 형식: "${c.question}"`);

  c.background.forEach((t, i) => {
    for (const w of LAW_WORDS) if (t.includes(w)) r.warnings.push(`법령 설명 의심 "${w}" in background[${i}]`);
    // 기소·고소·소송 문장에는 대상이 이름으로 있어야 함 ("검사는 기소했다" X → "검사는 A씨를 기소했다" O)
    for (const s of t.split(/(?<=다\.|요\.)\s*/)) {
      if (/기소|재판에 넘|고소|소송을|소를 제기/.test(s) && !/넘겨졌|넘겨져|기소됐|기소되|고소당|소송을 당/.test(s) && !/[A-Z][가-힣]{0,6}(씨|회사|공사|은행|시|조합|센터)?\s*(를|을|에게|에 대해|상대로)/.test(s))
        r.warnings.push(`누구를 상대로 한 것인지 불분명: background[${i}] "${s.slice(0, 30)}…"`);
    }
  });

  // 이름은 A·B·C만 (A씨·B시·C회사 X). 판결문 원문(orderText·ruling)은 제외
  const visible = JSON.stringify([c.title, c.keyIssue, c.question, c.explanation, c.background, c.parties, c.evidence, c.choices]);
  const suffixed = [...new Set([...visible.matchAll(/(?<![A-Za-z])[A-Z](씨|시|공사|회사)/g)].map((m) => m[0]))];
  if (suffixed.length) r.warnings.push(`이름에 접미사: ${suffixed.join(', ')} → A·B·C로만`);
  // 이름 앞 수식어도 금지 ("집주인 B" → "B"). 당사자 목록 설명(parties.description)이 그 역할을 함
  for (const t of [c.title, c.keyIssue, c.question, c.explanation, ...c.background, ...c.evidence.map((e) => e.description)])
    if (hasNameModifier(t)) r.warnings.push(`이름 앞 수식어: "${t.slice(0, 40)}…"`);

  // 당사자 인물 아이콘: 전원 배정, 한 사건 안에서 중복 없음
  if (c.parties.some((p) => !p.age || !p.gender)) r.warnings.push('인물 아이콘 미배정 당사자 있음 (npm run data:avatars)');
  const avatars = c.parties.filter((p) => p.age && p.gender).map((p) => `${p.age}${p.gender}`);
  if (new Set(avatars).size !== avatars.length) r.errors.push(`인물 아이콘 중복: ${avatars.join(', ')}`);

  // 분량: 모바일에서 빠르게 읽히도록
  const bgLen = c.background.join('').length;
  if (bgLen > 260) r.warnings.push(`사건개요가 김 (${bgLen}자, 목표 200자)`);
  if (c.evidence.length > 3) r.warnings.push(`증거가 많음 (${c.evidence.length}개)`);
  const extra = c.parties.map((p) => p.description).join('').length + c.evidence.map((e) => e.description).join('').length;
  if (extra > 200) r.warnings.push(`당사자·증거 설명이 김 (${extra}자)`);

  // 정답 선택지의 숫자(금액·기간)가 주문에 실제로 있는지
  const answer = c.choices.find((x) => x.id === c.answerId)!.text;
  const order = c.orderText;
  const amounts = parseAmounts(order);
  const durations = new Set(parseDurations(order));
  // 선택지 금액은 만 원 단위 반올림을 허용 (오차 1% 이내)
  for (const a of parseAmounts(answer))
    if (!amounts.some((x) => Math.abs(a - x) <= x * 0.01))
      r.errors.push(`정답 금액 ${a.toLocaleString()}원이 주문에 없음`);
  for (const d of parseDurations(answer))
    if (!durations.has(d)) r.errors.push(`정답 기간 ${d}개월이 주문에 없음`);
  if (answer.includes('무죄') && !order.includes('무죄')) r.errors.push('정답이 무죄인데 주문에 무죄 없음');
  if (c.category === '민사' && !/\d(가단|가합|가소)\d/.test(c.caseNumber)) r.errors.push('민사 1심 아님 — 제외 대상');
  const outcome = classifyOrder(order, c.category);
  if (!outcome.ok) r.errors.push(`애매한 주문(${outcome.reason}) — 제외 대상`);
  else if (c.category === '민사') {
    // 민사 선택지: a=청구 기각, b=일부 인정, c=전부 인정
    const expected = { dismissed: 'a', partial: 'b', full: 'c' }[outcome.kind as 'dismissed' | 'partial' | 'full'];
    if (expected !== c.answerId) r.errors.push(`민사 정답 불일치: 주문상 ${expected}, 정답 ${c.answerId}`);
  } else if (outcome.kind === 'acquittal' && !answer.includes('무죄')) r.errors.push('주문은 무죄인데 정답이 무죄가 아님');
  if (new Set(c.choices.map((x) => x.text.trim())).size !== c.choices.length) r.errors.push('선택지 중복');

  const rawFile = path.join(RAW_DIR, `${id}.json`);
  if (existsSync(rawFile)) {
    const raw = JSON.parse(readFileSync(rawFile, 'utf8'));
    if (norm(extractOrder(raw.판례내용)) !== norm(order)) r.errors.push('orderText가 원문 주문과 다름');
    const src = norm(clean(raw.판결요지) + clean(raw.판시사항) + clean(raw.판례내용));
    // 판례 인용 괄호 삭제·어미 정리 같은 작은 편집은 허용: 10자 조각의 85% 이상이 원문에 있으면 인용으로 인정
    const q = norm(c.ruling);
    const shingles = Array.from({ length: Math.max(1, q.length - 9) }, (_, i) => q.slice(i, i + 10));
    const hit = shingles.filter((s) => src.includes(s)).length / shingles.length;
    if (hit < 0.85) r.warnings.push(`ruling이 판결문 원문과 다름 (일치율 ${Math.round(hit * 100)}%)`);
    if (raw.사건번호 !== c.caseNumber) r.errors.push(`사건번호 불일치: raw ${raw.사건번호} / draft ${c.caseNumber}`);
  } else r.warnings.push('raw 원문 없음');

  for (const m of /(?:변호사|판사|검사)\s+[가-힣]{3}(?![가-힣])/.exec(JSON.stringify(c)) ?? [])
    r.warnings.push(`실명 의심: ${m}`);
  return r;
}

export function validateAll(): Report[] {
  // 게임에서 영구 제외한 판례는 draft가 남아 있어도 빌드에 넣지 않음 (data/excluded.json)
  const excluded = loadExcluded().ids;
  return readdirSync(DRAFT_DIR)
    .filter((f) => f.endsWith('.json') && !f.endsWith('.skip.json') && !excluded.has(f.replace('.json', '')))
    .map((f) => validateFile(path.join(DRAFT_DIR, f)));
}

if (process.argv[1]?.includes('validate-cases')) {
  const reports = validateAll();
  let errs = 0;
  for (const r of reports) {
    const tag = r.errors.length ? '✗' : r.warnings.length ? '△' : '✓';
    console.log(`${tag} ${r.id} ${r.data?.title ?? ''}${r.data?.reviewed ? ' [검수완료]' : ''}`);
    r.errors.forEach((e) => console.log(`    오류: ${e}`));
    r.warnings.forEach((w) => console.log(`    경고: ${w}`));
    errs += r.errors.length;
  }
  console.log(`\n${reports.length}건 / 오류 ${errs}건`);
  if (errs) process.exit(1);
}
