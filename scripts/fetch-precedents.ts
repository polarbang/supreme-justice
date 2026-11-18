/**
 * 국가법령정보센터 Open API로 하급심 형사/민사 판례 수집 → data/raw/<판례일련번호>.json
 * 주문에 형량(형사) 또는 지급액·청구기각(민사)이 명시된 판결만 저장.
 *   npm run data:fetch -- [--limit 5] [--per 5] [--keyword 정당방위,손해배상]
 */
import 'dotenv/config';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { classifyOrder, extractOrder } from './lib';

const OC = process.env.LAW_OC;
if (!OC) throw new Error('.env에 LAW_OC가 없습니다');

const RAW_DIR = 'data/raw';
const BASE = 'https://www.law.go.kr/DRF';
const DELAY_MS = 400;
const MIN_BODY = 800; // 판례내용이 너무 짧으면(원문 미제공) 제외
const CATEGORIES = new Set(['형사', '민사']);

const args = process.argv.slice(2);
const opt = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const LIMIT = Number(opt('limit') ?? Infinity); // 이번 실행에서 새로 저장할 최대 건수
const PER = Number(opt('per') ?? 5); // 키워드당 최대 저장 건수
const ONLY_KEYWORD = opt('keyword');
/** --set civil | criminal : seeds.json 의 해당 키워드 목록 사용 + 그 사건종류만 저장 */
const SET = opt('set') as 'civil' | 'criminal' | undefined;
const ONLY_CATEGORY = SET === 'civil' ? '민사' : SET === 'criminal' ? '형사' : undefined;

interface SearchItem {
  판례일련번호: string;
  사건번호: string;
  사건명: string;
  사건종류명: string;
  법원명: string;
  선고일자: string;
}

export interface RawPrecedent {
  판례정보일련번호: string;
  사건명: string;
  사건번호: string;
  선고일자: string;
  법원명: string;
  사건종류명: string;
  판결유형: string;
  판시사항: string;
  판결요지: string;
  참조조문: string;
  참조판례: string;
  판례내용: string;
  _keyword?: string;
  _fetchedAt?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string): Promise<any> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`JSON 아님: ${text.slice(0, 120)}`);
      }
    } catch (e) {
      if (attempt >= 3) throw e;
      await sleep(1000 * attempt);
    }
  }
}

async function search(keyword: string): Promise<SearchItem[]> {
  const q = new URLSearchParams({ OC: OC!, target: 'prec', type: 'JSON', query: keyword, display: '100' });
  const d = await getJson(`${BASE}/lawSearch.do?${q}`);
  const prec = d?.PrecSearch?.prec;
  if (!prec) return [];
  return Array.isArray(prec) ? prec : [prec]; // 결과 1건이면 객체로 옴
}

async function detail(id: string): Promise<RawPrecedent | null> {
  const q = new URLSearchParams({ OC: OC!, target: 'prec', ID: id, type: 'JSON' });
  const d = await getJson(`${BASE}/lawService.do?${q}`);
  return d?.PrecService ?? null;
}

function isUsable(p: RawPrecedent): string | null {
  if (!CATEGORIES.has(p.사건종류명)) return `사건종류 ${p.사건종류명}`;
  if (!p.판례내용 || p.판례내용.length < MIN_BODY) return '본문 없음/짧음';
  // 민사 항소심(나)·가사(드/르)는 주문이 1심 대비로 쓰여 애매 → 민사는 1심만
  if (p.사건종류명 === '민사' && !CIVIL_FIRST_INSTANCE.test(p.사건번호)) return `민사 1심 아님 (${p.사건번호})`;
  const r = unsuitableTopic(p);
  if (r) return r;
  const c = classifyOrder(extractOrder(p.판례내용), p.사건종류명);
  if (!c.ok) return `주문 제외: ${c.reason}`;
  return null;
}

/** 1심(고단·고합·고정 / 가단·가합·가소) 우선 → 그 외 하급심. 대법원은 주문이 상고기각·파기환송뿐이라 제외 */
const FIRST_INSTANCE = /고단|고합|고정|가단|가합|가소/;
export const CIVIL_FIRST_INSTANCE = /\d(가단|가합|가소)\d/;

/** 게임에 부적합한 사건: 성범죄, 사건 여러 개 병합(사실관계가 너무 많음), 부착·보호관찰명령 등 부가처분 */
const SEX_CRIME = /강간|추행|성폭력|성매매|음란|불법촬영|카메라등이용촬영|아동ㆍ청소년의성보호|아동·청소년의성보호/;
function unsuitableTopic(p: RawPrecedent): string | null {
  if (SEX_CRIME.test(p.사건명)) return '성범죄';
  const caseCount = p.사건번호.split(',').filter((s) => /\d/.test(s) && !/초기|전고|보고/.test(s)).length;
  if (caseCount > 2) return `병합 사건 ${caseCount}건`;
  if (/부착명령|보호관찰명령|치료감호/.test(p.사건명)) return '부가 명령';
  return null;
}
const priority = (x: SearchItem) => (FIRST_INSTANCE.test(x.사건번호) ? 0 : 1);

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });
  const seeds = JSON.parse(readFileSync('data/seeds.json', 'utf8')) as {
    civil: string[];
    criminal: string[];
    caseIds: string[];
  };
  const keywords = ONLY_KEYWORD ? ONLY_KEYWORD.split(',') : SET ? seeds[SET] : [...seeds.criminal, ...seeds.civil];
  let saved = 0;
  const has = (id: string) => existsSync(path.join(RAW_DIR, `${id}.json`));
  // 같은 판결이 다른 일련번호로 중복 등록된 경우가 있어 사건번호로도 중복 체크
  const caseNumbers = new Set(
    readdirSync(RAW_DIR).map((f) => (JSON.parse(readFileSync(path.join(RAW_DIR, f), 'utf8')) as RawPrecedent).사건번호),
  );

  const save = async (id: string, keyword?: string): Promise<boolean> => {
    if (has(id)) return false;
    await sleep(DELAY_MS);
    const p = await detail(id);
    if (!p) { console.log(`  - ${id}: 본문 응답 없음`); return false; }
    if (caseNumbers.has(p.사건번호)) { console.log(`  - ${id} ${p.사건번호}: 중복 사건`); return false; }
    caseNumbers.add(p.사건번호);
    const reason = isUsable(p);
    if (reason) { console.log(`  - ${id} ${p.사건번호}: 제외 (${reason})`); return false; }
    p._keyword = keyword;
    p._fetchedAt = new Date().toISOString();
    writeFileSync(path.join(RAW_DIR, `${id}.json`), JSON.stringify(p, null, 2));
    console.log(`  ✓ ${id} ${p.사건번호} ${p.사건명}`);
    saved++;
    return true;
  };

  for (const id of seeds.caseIds) {
    if (saved >= LIMIT) break;
    await save(id);
  }

  for (const kw of keywords) {
    if (saved >= LIMIT) break;
    await sleep(DELAY_MS);
    // 본문 요청 전에 목록 정보만으로 걸러낼 수 있는 건 미리 제외 (요청 수 절약)
    const items = (await search(kw)).filter(
      (x) =>
        x.법원명 !== '대법원' &&
        CATEGORIES.has(x.사건종류명) &&
        (!ONLY_CATEGORY || x.사건종류명 === ONLY_CATEGORY) &&
        (x.사건종류명 !== '민사' || CIVIL_FIRST_INSTANCE.test(x.사건번호)) &&
        !caseNumbers.has(x.사건번호) &&
        !SEX_CRIME.test(x.사건명),
    );
    items.sort((a, b) => priority(a) - priority(b) || b.선고일자.localeCompare(a.선고일자));
    console.log(`[${kw}] 후보 ${items.length}건`);
    let perKw = 0;
    for (const it of items) {
      if (saved >= LIMIT || perKw >= PER) break;
      if (await save(it.판례일련번호, kw)) perKw++;
    }
  }
  console.log(`\n새로 저장: ${saved}건 → ${RAW_DIR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
