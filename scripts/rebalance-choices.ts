/**
 * 형사 문제 선택지의 정답 위치 쏠림 보정.
 * 정답(형량) 텍스트는 그대로 두고, 코드가 정한 위치(k)에 정답이 오도록 오답 3개만 다시 만든다.
 * 무죄는 가장 가벼운 결과라 항상 1번(k=0).
 *   npm run data:rebalance            (형사 전부)
 *   npm run data:rebalance -- --only 234709
 */
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CaseSchema, type Case } from '../src/types/case';
import { geminiModel, normalizeSentence } from './lib';

const DRAFT_DIR = 'data/drafts';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = geminiModel();
const IDS = ['a', 'b', 'c', 'd'] as const;
const args = process.argv.slice(2);
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined;

/** 무죄면 0, 아니면 0~3 균등 */
export function pickTargetIndex(answerText: string) {
  return /무죄/.test(answerText) ? 0 : Math.floor(Math.random() * 4);
}

export async function regenerate(c: Case, answer: string, k: number): Promise<string[]> {
  const prompt = `판결 결과 맞히기 퀴즈의 형사 선택지 4개를 만드세요.
[사건] ${c.title}
${c.background.join(' ')}
[실제 선고] ${answer}

규칙:
- 4개를 가벼운 결과 → 무거운 결과 순(무죄 → 선고유예 → 벌금 → 집행유예 → 실형, 같은 종류면 적은 것 → 많은 것)으로 정렬.
- 실제 선고 "${answer}"를 글자 그대로 ${k + 1}번째(인덱스 ${k})에 두세요.
- 나머지 3개는 이 사건에서 실제로 나올 법한 그럴듯한 형량. 정답과 형식·길이를 똑같이(괄호 설명 금지, 부가처분 제외).
- 같은 값 중복 금지.`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          temperature: 0.5,
          responseMimeType: 'application/json',
          responseJsonSchema: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
        },
      });
      const out = JSON.parse(res.text ?? '[]') as string[];
      if (out.length === 4 && out[k]?.trim() === answer && new Set(out).size === 4) return out.map(normalizeSentence);
      console.log(`    … 위치/중복 불일치, 재시도 (${attempt})`);
    } catch (e) {
      console.log(`    … 오류, 재시도 (${attempt}): ${(e as Error).message.slice(0, 60)}`);
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
  throw new Error('선택지 재생성 실패');
}

async function main() {
  const files = readdirSync(DRAFT_DIR).filter((f) => f.endsWith('.json') && !f.endsWith('.skip.json'));
  const dist: Record<string, number> = {};
  for (const f of files) {
    const p = path.join(DRAFT_DIR, f);
    const c = JSON.parse(readFileSync(p, 'utf8')) as Case;
    if (c.category !== '형사' || (ONLY && c.id !== ONLY)) continue;
    const answer = c.choices.find((x) => x.id === c.answerId)!.text.trim();
    const k = pickTargetIndex(answer);
    try {
      const texts = await regenerate(c, answer, k);
      c.choices = texts.map((text, i) => ({ id: IDS[i], text }));
      c.answerId = IDS[k];
      CaseSchema.parse(c);
      writeFileSync(p, JSON.stringify(c, null, 2));
      dist[IDS[k]] = (dist[IDS[k]] ?? 0) + 1;
      console.log(`  ✓ ${c.caseNumber} [${k + 1}번] ${texts.join(' | ')}`);
    } catch (e) {
      console.log(`  ✗ ${c.caseNumber}: ${(e as Error).message}`);
    }
  }
  console.log('\n정답 위치', JSON.stringify(dist));
}

if (process.argv[1]?.includes('rebalance-choices')) main();
