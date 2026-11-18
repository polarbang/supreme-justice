/**
 * 사건개요 당사자 목록의 인물 아이콘 배정 (API 없이 규칙으로).
 * 당사자 설명·사건개요·해설에서 그 사람을 가리키는 단서(남편·아내·딸·할머니·대학생·은퇴 등)로 나이대·성별을 정하고,
 * 단서가 없으면 기본값(40대 남성). 한 사건 안에서 같은 아이콘(나이대+성별)은 두 번 쓰지 않는다.
 * 민사 persona(판결 결과 gif 인물)가 있으면 그 당사자는 persona와 같게 고정.
 * overrides.json 에 { "<사건id>": { "B": "60여" } } 처럼 적으면 그 값이 최우선.
 *   npm run data:avatars              (아이콘 없는 사건만)
 *   npm run data:avatars -- --force   (전부 다시)
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CaseSchema, type Case } from '../src/types/case';

const DRAFT_DIR = 'data/drafts';
const OVERRIDES = 'data/avatar-overrides.json';
const FORCE = process.argv.includes('--force');

type Age = 20 | 40 | 60 | 80;
type Gender = '남' | '여';
const AGES: Age[] = [20, 40, 60, 80];

const FEMALE = /아내|부인|처제|전처|어머니|엄마|모친|딸|할머니|여성|여자|며느리|시어머니|장모|언니|누나|여동생|여자친구|여직원|주부|미용실 사장|간호사/;
const MALE = /남편|전남편|아버지|아빠|부친|아들|할아버지|남성|남자|사위|시동생|형님|오빠|남동생|남자친구|군인|군복무|아저씨/;
const AGE_80 = /할머니|할아버지|노인|고령|8\d세|9\d세|80대|90대|노모|노부/;
const AGE_60 = /6\d세|7\d세|60대|70대|은퇴|퇴직|정년|원로|노부부|손자|손녀|시아버지|시어머니|장인|장모|망인/;
const AGE_20 = /2\d세|3\d세|20대|30대|학생|대학생|대학원|청년|신입|인턴|아르바이트|사회초년생|취업준비|군인|신혼|미성년|10대/;

/** 이름 A가 들어간 문장/구절 중 그 사람을 직접 수식하는 부분만 (다른 사람 단서가 섞이지 않게) */
function cluesFor(c: Case, name: string): string {
  const p = c.parties.find((x) => x.name === name)!;
  const sentences = [...c.background, c.explanation].flatMap((t) => t.split(/(?<=[.!?다])\s+/));
  // "B의 아내 C" → C의 단서 '아내' / "A는 남편 B에게" → B의 단서 '남편'
  const near = sentences
    .flatMap((s) => [...s.matchAll(new RegExp(`([가-힣]+\\s+){0,2}${name}(?![A-Za-z])`, 'g'))].map((m) => m[0]))
    .join(' ');
  return `${p.description} ${p.role} ${near}`;
}

function infer(c: Case, name: string): { age?: Age; gender?: Gender } {
  const t = cluesFor(c, name);
  const gender: Gender | undefined = FEMALE.test(t) ? '여' : MALE.test(t) ? '남' : undefined;
  const age: Age | undefined = AGE_80.test(t) ? 80 : AGE_60.test(t) ? 60 : AGE_20.test(t) ? 20 : undefined;
  return { age, gender };
}

/** 이미 쓴 아이콘을 피해 가장 가까운 칸: 같은 성별에서 나이 가까운 순 → 다른 성별 */
function nearestFree(age: Age, gender: Gender, used: Set<string>): { age: Age; gender: Gender } {
  const other: Gender = gender === '남' ? '여' : '남';
  // 거리가 같으면 중년(50) 쪽: 40이 차 있으면 20보다 60
  const byDistance = [...AGES].sort((a, b) => Math.abs(a - age) - Math.abs(b - age) || Math.abs(a - 50) - Math.abs(b - 50));
  for (const g of [gender, other]) for (const a of byDistance) if (!used.has(`${a}${g}`)) return { age: a, gender: g };
  return { age, gender };
}

const parseOverride = (s: string): { age: Age; gender: Gender } => {
  const m = /^(20|40|60|80)(남|여)$/.exec(s);
  if (!m) throw new Error(`override 형식 오류: ${s} (예: 60여)`);
  return { age: Number(m[1]) as Age, gender: m[2] as Gender };
};

export function assignAvatars(c: Case, overrides: Record<string, string> = {}): Case {
  const used = new Set<string>();
  const result = new Map<string, { age: Age; gender: Gender }>();
  const fix = (name: string, v: { age: Age; gender: Gender }) => {
    result.set(name, v);
    used.add(`${v.age}${v.gender}`);
  };
  for (const [name, v] of Object.entries(overrides)) fix(name, parseOverride(v));
  if (c.persona && !result.has(c.persona.name) && c.parties.some((p) => p.name === c.persona!.name))
    fix(c.persona.name, { age: c.persona.age, gender: c.persona.gender });

  // 단서가 많은 사람부터 원하는 칸을 차지
  const rest = c.parties
    .filter((p) => !result.has(p.name))
    .map((p) => ({ p, g: infer(c, p.name) }))
    .sort((a, b) => Number(!!b.g.gender) + Number(!!b.g.age) - (Number(!!a.g.gender) + Number(!!a.g.age)));
  for (const { p, g } of rest) fix(p.name, nearestFree(g.age ?? 40, g.gender ?? '남', used));

  return { ...c, parties: c.parties.map((p) => ({ ...p, ...result.get(p.name) })) };
}

function main() {
  const overrides: Record<string, Record<string, string>> = existsSync(OVERRIDES) ? JSON.parse(readFileSync(OVERRIDES, 'utf8')) : {};
  const files = readdirSync(DRAFT_DIR).filter((f) => f.endsWith('.json') && !f.endsWith('.skip.json'));
  for (const f of files) {
    const file = path.join(DRAFT_DIR, f);
    const c = JSON.parse(readFileSync(file, 'utf8')) as Case;
    if (!FORCE && c.parties.every((p) => p.age && p.gender)) continue;
    const next = CaseSchema.parse(assignAvatars(c, overrides[c.id]));
    writeFileSync(file, JSON.stringify(next, null, 2));
    console.log(`${c.id} ${next.parties.map((p) => `${p.name}(${p.role}:${p.description}) ${p.age}${p.gender}`).join(' · ')}`);
  }
}

if (process.argv[1]?.includes('assign-party-avatars')) main();
