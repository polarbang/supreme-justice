/**
 * ⚠ 사용 중지 (2026-11-16 사용자 지시: 전체를 비교해 난이도를 다시 매기지 말 것).
 *   npm 스크립트에서 뺐다. 새 사건 난이도는 data:convert 가 매긴 값을 그대로 쓴다.
 *
 * draft 전체를 한 번에 비교해 난이도(1~3)를 상대적으로 매김 → 각 draft의 difficulty 갱신.
 * 사건별로 따로 물으면 모델이 거의 다 2를 주기 때문.
 *   npm run data:difficulty
 */
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Case } from '../src/types/case';
import { geminiModel } from './lib';

if (!process.argv.includes('--yes-rerank-all')) {
  console.error('사용 중지된 스크립트입니다: 전체 사건 난이도를 다시 매깁니다. 정말 필요하면 --yes-rerank-all 을 붙이세요.');
  process.exit(1);
}

const DRAFT_DIR = 'data/drafts';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = geminiModel();

const files = readdirSync(DRAFT_DIR).filter((f) => f.endsWith('.json') && !f.endsWith('.skip.json'));
const cases = files.map((f) => JSON.parse(readFileSync(path.join(DRAFT_DIR, f), 'utf8')) as Case);

const summary = cases.map((c) => ({
  id: c.id,
  category: c.category,
  title: c.title,
  background: c.background.join(' '),
  question: c.question,
  choices: c.choices.map((x) => x.text),
  answer: c.choices.find((x) => x.id === c.answerId)!.text,
}));

const BATCH = 25;
const instructions = (n: number) => `아래는 판결 결과 맞히기 퀴즈 ${n}문제입니다. 사건 기록만 읽은 일반인이 정답을 맞히기 얼마나 어려운지 문제끼리 비교해서 난이도를 매기세요.
- 1(쉬움) / 2(보통) / 3(어려움)을 대략 1/3씩 나누세요.
- 어려움: 상식과 결론이 엇갈림(뜻밖의 무죄·기각), 보기 여러 개가 그럴듯함, 양형 사정이 복잡함.
- 쉬움: 사건개요만 봐도 결론이 자연스럽게 예상됨.
- 민사는 보기가 3개라 찍어도 맞힐 확률이 높다는 점도 고려하세요.
- reason은 20자 이내.`;

async function rankBatch(batch: typeof summary) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: `${instructions(batch.length)}

${JSON.stringify(batch, null, 1)}`,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: {
            type: 'array',
            items: {
              type: 'object',
              properties: { id: { type: 'string' }, difficulty: { type: 'integer', enum: [1, 2, 3] }, reason: { type: 'string' } },
              required: ['id', 'difficulty', 'reason'],
            },
          },
        },
      });
      return JSON.parse(res.text ?? '[]') as { id: string; difficulty: 1 | 2 | 3; reason: string }[];
    } catch (e) {
      if (attempt >= 4) throw e;
      console.log(`  … 재시도 ${attempt}: ${(e as Error).message.slice(0, 80)}`);
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
}

// 형사·민사가 섞이도록 섞은 뒤 25개씩 나눠 비교 (한 번에 100개를 보내면 응답이 불안정)
const shuffled = [...summary].sort(() => Math.random() - 0.5);
const ranked: { id: string; difficulty: 1 | 2 | 3; reason: string }[] = [];
for (let i = 0; i < shuffled.length; i += BATCH) {
  ranked.push(...(await rankBatch(shuffled.slice(i, i + BATCH))));
  console.log(`  배치 ${i / BATCH + 1}/${Math.ceil(shuffled.length / BATCH)} 완료`);
}

const byId = new Map(ranked.map((r) => [r.id, r]));
const dist = { 1: 0, 2: 0, 3: 0 };
for (const [i, c] of cases.entries()) {
  const r = byId.get(c.id);
  if (!r) { console.log(`  ? ${c.id} 결과 없음 — 유지`); continue; }
  c.difficulty = r.difficulty;
  dist[r.difficulty]++;
  writeFileSync(path.join(DRAFT_DIR, files[i]), JSON.stringify(c, null, 2));
}
console.log(`\n분포 1:${dist[1]} 2:${dist[2]} 3:${dist[3]}`);
