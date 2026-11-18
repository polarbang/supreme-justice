/**
 * data/raw/*.json → Gemini로 게임 문제 변환 → data/drafts/<id>.json (reviewed:false)
 *   npm run data:convert -- [--force] [--only 234709] [--limit 5]
 */
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CaseSchema, type Case } from '../src/types/case';
import type { RawPrecedent } from './fetch-precedents';
import { classifyOrder, clean, extractOrder, geminiModel, stripNameModifiers, toPlayerQuestion } from './lib';
import { pickTargetIndex, regenerate } from './rebalance-choices';
import { assignPersona } from './assign-persona';
import { assignAvatars } from './assign-party-avatars';

const RAW_DIR = 'data/raw';
const DRAFT_DIR = 'data/drafts';
const MODEL = geminiModel();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('.env에 GEMINI_API_KEY가 없습니다');
const ai = new GoogleGenAI({ apiKey });

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const opt = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const ONLY = opt('only');
const LIMIT = Number(opt('limit') ?? Infinity);

const SYSTEM = `당신은 한국 판결문을 일반인용 퀴즈로 바꾸는 편집자입니다. 게임 '대법관 키우기'에서 플레이어는 사건 기록을 읽고 판사가 실제로 내린 형량(형사) 또는 배상액(민사)을 객관식으로 맞힙니다. 이유까지 맞히게 하지 않습니다.

규칙:
1. 쉬운 말: 중학생도 이해할 수 있게. 법률 용어는 꼭 필요할 때만 쓰고 괄호로 풀이.
0. 간결함이 최우선: 플레이어는 모바일로 빠르게 읽습니다. 판단에 꼭 필요한 사실만 남기고 배경 설명·날짜·금액 세부·경위의 곁가지는 과감히 버리세요.
2. background는 사실관계만, 3~4개 항목, 각 항목은 한 문장(40자 안팎), 전체 200자 이내. 누가, 무엇을, 왜, 어떤 피해가 났는지 핵심만. 마지막 항목은 재판에서 다투는 지점(예: "A씨는 ~라고 주장했다")으로. 법 조항·처벌 규정·과태료·"법에 따르면 ~해야 한다" 같은 법령 설명은 절대 넣지 마세요. (법령은 lawRefs에만)
3. 결론 누설 금지: title, background, parties, evidence, keyIssue, question에는 이 판결의 결론이나 형량을 암시하는 표현을 쓰지 마세요. ("결국", "억울하게", "부당하게", "정당한 방어였다" 같은 평가 금지)
4. 항소심 판결이면 1심 결과는 background 마지막 문단에 "1심은 ~을 선고했다"처럼 써도 됩니다. 단, 이번 판결이 그것을 바꿨는지는 쓰지 마세요.
5. 인물·단체: 실명·변호사·판사 이름은 쓰지 말고 알파벳 한 글자 "A", "B", "C"로만 쓰세요. 뒤에 "씨", "시", "회사", "공사" 등을 붙이지 마세요(예: "A씨" X, "B시" X → "A", "B"). 어떤 사람·단체인지는 parties.description에서만 설명.
5-2. 문장 끝은 모두 "~했습니다"체로 통일하세요.
5-3. 같은 대상을 반복해서 길게 쓰지 마세요. 한 번 나온 것은 다음부터 가장 짧은 말로: "공중 전선을 땅속에 묻는 지중화 공사" → "공사", "전선 지중화 공사비" → "공사비". 이미 아는 수식어("~하는", "~에 관한")는 반복하지 말 것.
5-1. 누가 누구에게 무엇을 했는지 문장마다 분명히: 주어와 대상(목적어)을 생략하지 말고 이름(A·B·C)으로 쓰세요. 이름 앞에 "집주인 B", "버스 기사 A"처럼 직업·관계 수식어도 붙이지 마세요(당사자 목록에서 설명함). 예) "검사는 명예훼손 혐의로 기소했다"(X) → "검사는 A를 명예훼손 혐의로 기소했다"(O). "영업양수인", "임차인" 같은 법적 지위 명칭으로 사람을 가리키지 말고 이름을 쓰세요.
7. 형사 사건 — 선택지 4개(choices) = 형량만 짧게 (이유·설명 금지):
   - 예: "무죄", "벌금 300만 원", "징역 1년, 집행유예 2년", "징역 2년 6개월"
   - 가벼운 결과 → 무거운 결과 순(무죄 → 벌금 → 집행유예 → 실형)으로 정렬하고, answerIndex에 실제 판결의 위치(0~3)를 적으세요.
   - 정답은 주문 그대로의 형량. 부가처분(추징·몰수·사회봉사·수강명령 등)은 빼세요. 선고유예는 괄호 설명 없이 "선고유예"로만 쓰세요.
   - 오답은 실제로 나올 법한 값으로. 정답이 항상 가운데에 오지 않게 오답의 범위를 다양하게 잡으세요. 4개의 형식을 똑같이.
8. 민사 사건 — choices/answerIndex는 쓰지 마세요. 선택지는 "청구 기각 / 청구 일부 인정 / 청구 전부 인정" 3개로 고정이고 정답은 프로그램이 주문으로 판정합니다.
   - 사건개요에는 원고가 무엇을 얼마나 청구했는지 분명히 쓰세요.
9. question: 플레이어가 직접 판결하는 느낌으로, '법원은'을 쓰지 말고 현재형 "~할까요?"로. 예: "A에게 어떤 형을 선고할까요?", "B를 폭행한 A에게 어떤 형을 선고할까요?", "A의 대여금 청구에 대해 어떻게 판결할까요?"
10. explanation: 실제 판결 결과(민사는 실제로 인정된 금액 포함)와 그 이유(유리·불리하게 본 사정, 양형 이유 등)를 3~5문장 쉬운 말로.
10-1. ruling: 판결 이유(또는 판결요지)에서 핵심 문장 1~2개를 원문 그대로 인용(400자 이내). 괄호 속 판례 인용 "(대법원 … 판결 참조)"만 빼도 되고, 그 외 단어 수정·요약은 금지.
11. evidence: 판단에 결정적인 증거·사실 2~3개 (CCTV, 진술, 계약서, 진단서 등). name은 10자 이내, description은 한 문장 30자 이내. 국민참여재판의 배심원 평결·양형 의견, 검사 구형, 이번 판결의 결론은 증거가 아니므로 절대 넣지 마세요.
11-1. parties: 핵심 인물 2~3명. description은 20자 이내 한 구절(예: "버스 운전기사, 피고인"). keyIssue는 40자 이내. keyIssue에는 보기로 쓰일 수 있는 구체적 형의 이름(무죄·선고유예·벌금·집행유예·실형·징역·금고·사형 등)을 쓰지 마세요. "형량·처벌" 같은 일반 단어는 괜찮습니다.
12. difficulty: 사건 기록만 읽은 일반인이 정답을 맞힐 가능성으로 정하세요. 무난하게 2를 고르지 말고 아래 기준대로.
   - 1(쉬움): 상식과 결론이 일치. 예) 명백한 폭행에 초범이라 집행유예, 증거가 뻔한 사기에 실형
   - 2(보통): 양형 사정(전과·합의·피해 규모)을 따져야 하거나, 보기 중 2개가 그럴듯함
   - 3(어려움): 상식과 결론이 엇갈림. 예) 음주운전인데 긴급피난으로 무죄, 피해가 큰데 청구 기각, 법리 때문에 일부만 인정
13. 퀴즈로 부적절하면(사실관계가 거의 없음, 주문의 결과를 선택지로 만들 수 없음 등) suitable=false와 이유를 적고 나머지는 대충 채우세요.`;

const str = { type: 'string' } as const;
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    suitable: { type: 'boolean' },
    unsuitableReason: str,
    topic: { ...str, description: '짧은 주제 태그. 예: 정당방위, 명예훼손, 전세보증금' },
    difficulty: { type: 'integer', enum: [1, 2, 3] },
    title: { ...str, description: '쉬운 사건 제목. 예: 층간소음에 항의하다 이웃을 밀친 사건' },
    background: { type: 'array', items: str, minItems: 3, maxItems: 4, description: '사실관계 핵심 3~4문장, 각 40자 안팎, 전체 200자 이내' },
    parties: { type: 'array', maxItems: 3, items: { type: 'object', properties: { role: str, name: str, description: str }, required: ['role', 'name', 'description'] } },
    evidence: { type: 'array', minItems: 2, maxItems: 3, items: { type: 'object', properties: { name: str, description: str }, required: ['name', 'description'] } },
    keyIssue: { ...str, description: '이 재판의 쟁점 한 줄, 40자 이내 (질문형 가능, 결론 암시 금지)' },
    question: str,
    choices: { type: 'array', items: str, minItems: 4, maxItems: 4, description: '형사만: 가벼운 결과 → 무거운 결과 순' },
    answerIndex: { type: 'integer', enum: [0, 1, 2, 3], description: '형사만: choices 중 실제 판결의 위치' },
    explanation: str,
    ruling: str,
    lawRefs: { type: 'array', items: str },
  },
  required: ['suitable', 'topic', 'difficulty', 'title', 'background', 'parties', 'evidence', 'keyIssue', 'question', 'explanation', 'ruling', 'lawRefs'],
};

/** 민사 선택지: 3개 고정 */
export const CIVIL_CHOICES = {
  dismissed: '청구 기각 — 하나도 인정되지 않음',
  partial: '청구 일부 인정 — 청구한 것 중 일부만 받음',
  full: '청구 전부 인정 — 청구한 것을 모두 받음',
} as const;

function buildChoices(p: RawPrecedent, out: any) {
  if (p.사건종류명 === '민사') {
    const c = classifyOrder(extractOrder(p.판례내용), '민사');
    if (!c.ok) throw new Error(`주문 분류 불가: ${c.reason}`);
    const texts = [CIVIL_CHOICES.dismissed, CIVIL_CHOICES.partial, CIVIL_CHOICES.full];
    const answerIndex = ['dismissed', 'partial', 'full'].indexOf(c.kind);
    if (answerIndex < 0) throw new Error(`민사 결과 아님: ${c.kind}`);
    return { texts, answerIndex };
  }
  if (!Array.isArray(out.choices) || out.answerIndex == null) throw new Error('형사인데 choices/answerIndex 없음');
  return { texts: out.choices as string[], answerIndex: out.answerIndex as number };
}

function buildPrompt(p: RawPrecedent) {
  const body = clean(p.판례내용);
  return `[사건명] ${p.사건명}
[사건번호] ${p.사건번호} / ${p.법원명} / 선고 ${p.선고일자} / ${p.사건종류명}
[주문]
${extractOrder(p.판례내용)}
[판시사항]
${clean(p.판시사항) || '(없음)'}
[판결요지]
${clean(p.판결요지) || '(없음)'}
[참조조문] ${clean(p.참조조문) || '(없음)'}
[판례내용]
${body.length > 14000 ? body.slice(0, 14000) + '\n…(이하 생략)' : body}`;
}

const IDS = ['a', 'b', 'c', 'd'] as const;
const fmtDate = (d: string) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;

/** 503·429 같은 일시 오류는 잠시 후 재시도 */
async function generateWithRetry(p: RawPrecedent, attempts = 4) {
  for (let i = 1; ; i++) {
    try {
      return await ai.models.generateContent({
        model: MODEL,
        contents: buildPrompt(p),
        config: { systemInstruction: SYSTEM, responseMimeType: 'application/json', responseJsonSchema: RESPONSE_SCHEMA, temperature: 0.4 },
      });
    } catch (e) {
      const msg = (e as Error).message;
      if (i >= attempts || !/503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded/i.test(msg)) throw e;
      const wait = 3000 * i;
      console.log(`    … 일시 오류, ${wait / 1000}초 후 재시도 (${i}/${attempts - 1})`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

async function convert(p: RawPrecedent): Promise<Case | { skipped: string }> {
  const res = await generateWithRetry(p);
  const out = JSON.parse(res.text ?? '{}');
  if (!out.suitable) return { skipped: out.unsuitableReason || '부적합' };

  // 선택지는 경중 순서 그대로 (1. 무죄 2. 벌금 … 처럼 보이도록)
  const { texts, answerIndex } = buildChoices(p, out);
  const choices = texts.map((text, i) => ({ id: IDS[i], text }));
  const answerId = IDS[answerIndex];
  const id = p.판례정보일련번호;

  const draft = CaseSchema.parse({
    id,
    caseNumber: p.사건번호,
    court: p.법원명,
    decisionDate: fmtDate(p.선고일자),
    category: p.사건종류명,
    topic: out.topic,
    difficulty: out.difficulty,
    title: stripNameModifiers(out.title),
    background: out.background.map(stripNameModifiers),
    parties: out.parties.map((x: { description: string }) => ({ ...x, description: stripNameModifiers(x.description) })),
    evidence: out.evidence.map((x: { description: string }) => ({ ...x, description: stripNameModifiers(x.description) })),
    keyIssue: stripNameModifiers(out.keyIssue),
    question: stripNameModifiers(toPlayerQuestion(out.question)),
    choices,
    answerId,
    explanation: stripNameModifiers(out.explanation),
    orderText: extractOrder(p.판례내용),
    ruling: out.ruling,
    lawRefs: out.lawRefs,
    sourceUrl: `https://www.law.go.kr/precInfoP.do?precSeq=${id}`,
    reviewed: false,
  });

  // 형사: 모델이 정답을 3번 근처에 두는 경향이 있어, 정답 위치를 코드가 정하고 오답만 다시 만든다
  if (draft.category === '형사') {
    const answer = draft.choices.find((x) => x.id === draft.answerId)!.text.trim();
    const k = pickTargetIndex(answer);
    const texts = await regenerate(draft, answer, k);
    draft.choices = texts.map((text, i) => ({ id: IDS[i], text }));
    draft.answerId = IDS[k];
  }
  // 민사: 판결 결과 연출(gif)에 등장할 인물의 나이대·성별
  if (draft.category === '민사') draft.persona = await assignPersona(draft, p.판례내용);
  // 당사자 인물 아이콘 (규칙 기반, API 없음)
  return CaseSchema.parse(assignAvatars(draft));
}

async function main() {
  mkdirSync(DRAFT_DIR, { recursive: true });
  let files = readdirSync(RAW_DIR).filter((f) => f.endsWith('.json'));
  if (ONLY) files = files.filter((f) => f === `${ONLY}.json`);
  let done = 0, skipped = 0, failed = 0;
  for (const f of files) {
    if (done >= LIMIT) break;
    const out = path.join(DRAFT_DIR, f);
    const skipFile = path.join(DRAFT_DIR, f.replace('.json', '.skip.json'));
    if (!FORCE && (existsSync(out) || existsSync(skipFile))) continue;
    const p = JSON.parse(readFileSync(path.join(RAW_DIR, f), 'utf8')) as RawPrecedent;
    try {
      const r = await convert(p);
      if ('skipped' in r) {
        writeFileSync(skipFile, JSON.stringify({ id: p.판례정보일련번호, caseNumber: p.사건번호, reason: r.skipped }, null, 2));
        console.log(`  - ${p.사건번호}: 부적합 (${r.skipped})`);
        skipped++;
      } else {
        writeFileSync(out, JSON.stringify(r, null, 2));
        console.log(`  ✓ ${p.사건번호} → ${r.title} [난이도 ${r.difficulty}, 정답 ${r.answerId}]`);
        done++;
      }
    } catch (e) {
      console.log(`  ✗ ${p.사건번호}: ${(e as Error).message.slice(0, 300)}`);
      failed++;
    }
  }
  console.log(`\n변환 ${done} / 부적합 ${skipped} / 실패 ${failed}`);
}

if (process.argv[1]?.includes('convert-with-gemini')) main();
