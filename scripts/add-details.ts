/**
 * "자세한 개요 보기"용 긴 사실관계 만들기: data/raw 판결문 + 기존 draft(인물 A·B·C)를 Gemini에 주고
 * 6~10문장의 자세한 사실관계를 받아 draft.backgroundDetail 에 넣는다. 이 판결의 결론·형량은 절대 쓰지 않는다.
 *   npm run data:details                 (backgroundDetail 없는 draft 전부)
 *   npm run data:details -- --only 207127
 *   npm run data:details -- --force      (전부 다시)
 */
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Case } from '../src/types/case';
import type { RawPrecedent } from './fetch-precedents';
import { clean, extractOrder, geminiModel, stripNameModifiers } from './lib';
import { LEAK_WORDS } from './validate-cases';

const RAW_DIR = 'data/raw';
const DRAFT_DIR = 'data/drafts';
const MODEL = geminiModel();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('.env에 GEMINI_API_KEY가 없습니다');
const ai = new GoogleGenAI({ apiKey });

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined;

const SYSTEM = `당신은 한국 판결문을 일반인용으로 정리하는 편집자입니다. 게임 '대법관 키우기'에서 플레이어는 사건 기록을 읽고 판결을 직접 내립니다.
이미 짧은 사건개요(3~4문장)가 있고, 플레이어가 "자세한 개요 보기"를 누르면 볼 더 길고 자세한 사실관계를 써야 합니다.

규칙:
1. 6~10문장, 각 문장 70자 안팎, 전체 700자 이내. 일이 일어난 순서대로. 문장 끝은 모두 "~했습니다"체.
2. 짧은 개요에 없던 구체적 경위를 담으세요: 두 사람의 관계, 사건이 일어난 계기, 시간·장소의 흐름, 피해의 내용, 사건 뒤의 행동(합의·변제·사과 등), 양쪽이 재판에서 각각 무엇을 주장했는지.
3. 인물·단체 이름은 아래 [인물]에 주어진 A·B·C 등을 그대로 쓰세요. 실명·변호사·판사 이름 금지. 회사·기관·브랜드의 실제 이름(예: 판결문에 나오는 회사명, 공단명, 카드 이름)도 절대 쓰지 마세요. [인물]에 없는 제3자는 "다른 카드사", "한 공공기관"처럼 일반 명칭으로. 이름 뒤에 "씨"·"회사" 등을 붙이지 말고, 이름 앞에 "집주인 B"처럼 직업 수식어도 붙이지 마세요.
4. 결론 누설 절대 금지: 이번 판결의 결과(유죄·무죄, 형량, 인정·기각, 인정된 금액)와 법원이 어떻게 판단했는지("인정되었습니다", "받아들여졌습니다", "판결했습니다", "선고했습니다")를 쓰지 마세요. "결국", "억울하게", "부당하게" 같은 평가도 금지.
   - 항소심이면 마지막 문장에 "1심은 ~을 선고했습니다"처럼 1심 결과만 써도 됩니다. 이번 판결이 그것을 바꿨는지는 쓰지 마세요.
5. 검사 구형, 배심원 평결·양형 의견은 쓰지 마세요. "재판부는 ~을 고려했습니다", "법원은 ~라고 보았습니다"처럼 이번 재판부의 판단·심리 과정도 절대 쓰지 마세요(그 자체가 결론의 단서가 됨).
6. 법 조항·처벌 규정 설명("법에 따르면 ~")은 쓰지 마세요. 사실과 주장만.
7. 쉬운 말로. 법률 용어가 꼭 필요하면 괄호로 짧게 풀이.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    detail: { type: 'array', items: { type: 'string' }, minItems: 6, maxItems: 10, description: '자세한 사실관계 6~10문장' },
  },
  required: ['detail'],
};

function buildPrompt(p: RawPrecedent, c: Case) {
  const body = clean(p.판례내용);
  return `[인물] (이 이름을 그대로 쓸 것)
${c.parties.map((x) => `- ${x.name}: ${x.role}, ${x.description}`).join('\n')}
[짧은 사건개요] (이것보다 자세하게)
${c.background.map((b) => `- ${b}`).join('\n')}
[사건번호] ${p.사건번호} / ${p.법원명} / ${p.사건종류명}
[주문] (참고만. 결과를 쓰지 말 것)
${extractOrder(p.판례내용)}
[판례내용]
${body.length > 14000 ? body.slice(0, 14000) + '\n…(이하 생략)' : body}`;
}

async function generate(p: RawPrecedent, c: Case, attempts = 4): Promise<string[]> {
  for (let i = 1; ; i++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: buildPrompt(p, c),
        config: { systemInstruction: SYSTEM, responseMimeType: 'application/json', responseJsonSchema: RESPONSE_SCHEMA, temperature: 0.3 },
      });
      const out = JSON.parse(res.text ?? '{}');
      return (out.detail as string[]).map((t) => stripNameModifiers(t.trim())).filter(Boolean);
    } catch (e) {
      const msg = (e as Error).message;
      if (i >= attempts || !/503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded/i.test(msg)) throw e;
      await new Promise((r) => setTimeout(r, 3000 * i));
    }
  }
}

/** 지난 재판 이야기 (1심·원심, 예전 소송·확정판결, 임시조치) — 이번 재판부의 판단이 아님 */
const PAST_TRIAL = /1심|원심|과거 다른|다른 소송|당시 재판부|바 있습니다|임시조치|제기했고/;
/** 이번 재판부·법원이 무엇을 따지고 어떻게 봤는지 말하는 문장 */
const COURT_VIEW = /(재판부|법원)(은|는|이|가|도)?[^.]*?(판단|보았|고려|검토|심리|지적|확인|인정|들어주)/;
/**
 * 결론 누설 문장: 누설 표현이 들었거나 이번 재판부의 판단을 말하는 문장
 * (항소심의 "1심은 … 선고했습니다", 과거 전과·지난 소송 이야기는 허용)
 */
export const leaks = (lines: string[]) =>
  lines.filter((t) => !PAST_TRIAL.test(t) && (LEAK_WORDS.some((w) => t.includes(w)) || COURT_VIEW.test(t)));

if (process.argv[1]?.includes('add-details')) await main();

async function main() {
const files = readdirSync(DRAFT_DIR).filter((f) => f.endsWith('.json') && !f.endsWith('.skip.json'));
let done = 0;
let failed = 0;
for (const f of files) {
  const id = path.basename(f, '.json');
  if (ONLY && id !== ONLY) continue;
  const draftPath = path.join(DRAFT_DIR, f);
  const c = JSON.parse(readFileSync(draftPath, 'utf8')) as Case;
  if (c.backgroundDetail && !FORCE) continue;
  try {
    const p = JSON.parse(readFileSync(path.join(RAW_DIR, f), 'utf8')) as RawPrecedent;
    let detail = await generate(p, c);
    // 누설 문장이 있으면 한 번 더 만들고, 그래도 있으면 그 문장만 뺀다
    if (leaks(detail).length) detail = await generate(p, c);
    const bad = leaks(detail);
    if (bad.length) detail = detail.filter((t) => !bad.includes(t));
    if (detail.length < 3) throw new Error('쓸 만한 문장이 3개 미만');
    c.backgroundDetail = detail;
    writeFileSync(draftPath, JSON.stringify(c, null, 2) + '\n');
    done++;
    console.log(`  ✓ ${id} ${c.title} (${detail.length}문장${bad.length ? `, 누설 의심 ${bad.length}문장 제외` : ''})`);
  } catch (e) {
    failed++;
    console.log(`  ✗ ${id}: ${(e as Error).message.slice(0, 160)}`);
  }
}
console.log(`\n자세한 개요 ${done}건 / 실패 ${failed}건 (모델 ${MODEL})`);
}
