/**
 * 민사 사건의 판결 결과 연출(gif)에 쓸 인물(persona) 지정.
 * 판결문에서 주된 당사자(원고 우선, 원고가 법인이면 사건에 가장 깊이 관련된 개인)의 나이대·성별을 추정한다.
 *   npm run data:persona              (persona 없는 민사 전부)
 *   npm run data:persona -- --force   (전부 다시)
 *   npm run data:persona -- --only 129761
 */
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CaseSchema, type Case, type Persona } from '../src/types/case';
import { clean, geminiModel } from './lib';

const DRAFT_DIR = 'data/drafts';
const RAW_DIR = 'data/raw';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = geminiModel();
const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined;

const SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: '퀴즈 속 이름(A·B·C 중 하나)' },
    age: { type: 'integer', enum: [20, 40, 60, 80], description: '20=20~30대, 40=40~50대, 60=60~70대, 80=80대 이상' },
    gender: { type: 'string', enum: ['남', '여'] },
    basis: { type: 'string', description: '나이·성별 판단 근거 한 줄 (30자 이내)' },
  },
  required: ['name', 'age', 'gender', 'basis'],
};

export async function assignPersona(c: Case, rawBody: string): Promise<Persona> {
  const body = clean(rawBody);
  const prompt = `민사 판결 퀴즈에서 판결 결과 화면에 등장시킬 인물 1명을 고르고, 그 사람의 나이대와 성별을 정하세요.

[퀴즈 속 당사자]
${c.parties.map((p) => `${p.name} (${p.role}): ${p.description}`).join('\n')}
[퀴즈 사건개요]
${c.background.join(' ')}

규칙:
- 원고가 개인이면 원고. 원고가 회사·기관이면 피고나 사건에 가장 깊이 관련된 개인(대표, 직원, 세입자 등).
- name은 퀴즈 속 이름(A·B·C) 그대로.
- 나이: 판결문에 나이·생년·학년·직업·경력·자녀·퇴직·연금 등 단서가 있으면 그대로 따르고, 없으면 사건 내용(전세 계약, 사업 운영, 퇴직금, 결혼 등)으로 가장 그럴듯한 나이대를 추정.
- 성별: 판결문 단서(남편/아내, 아들/딸, 군복무 등)를 따르고, 단서가 전혀 없으면 사건 내용으로 가장 그럴듯하게 추정.

[판결문]
${body.length > 12000 ? body.slice(0, 12000) + '\n…(이하 생략)' : body}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { temperature: 0.2, responseMimeType: 'application/json', responseJsonSchema: SCHEMA },
      });
      const out = JSON.parse(res.text ?? '{}') as Persona & { basis: string };
      return { name: out.name, age: out.age, gender: out.gender, basis: out.basis };
    } catch (e) {
      console.log(`    … 오류, 재시도 (${attempt}): ${(e as Error).message.slice(0, 60)}`);
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
  throw new Error('persona 지정 실패');
}

async function main() {
  const files = readdirSync(DRAFT_DIR).filter((f) => f.endsWith('.json') && !f.endsWith('.skip.json'));
  const dist: Record<string, number> = {};
  for (const f of files) {
    const p = path.join(DRAFT_DIR, f);
    const c = JSON.parse(readFileSync(p, 'utf8')) as Case;
    if (c.category !== '민사' || (ONLY && c.id !== ONLY) || (c.persona && !FORCE)) continue;
    const raw = JSON.parse(readFileSync(path.join(RAW_DIR, f), 'utf8'));
    try {
      c.persona = await assignPersona(c, raw.판례내용);
      CaseSchema.parse(c);
      writeFileSync(p, JSON.stringify(c, null, 2));
      const key = `${c.persona.age}대${c.persona.gender}`;
      dist[key] = (dist[key] ?? 0) + 1;
      console.log(`  ✓ ${c.caseNumber} ${c.persona.name} ${key} — ${c.persona.basis}`);
    } catch (e) {
      console.log(`  ✗ ${c.caseNumber}: ${(e as Error).message}`);
    }
  }
  console.log('\n분포', JSON.stringify(dist));
}

if (process.argv[1]?.includes('assign-persona')) main();
