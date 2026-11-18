/**
 * 관련 조문 링크 점검: 모든 draft의 lawRefs 법령을 국가법령정보센터에서 실제로 열어 보고,
 * 조문 페이지가 없는 법령(폐지·개명)을 src/data/law-no-article.json 에 기록한다.
 * 화면(src/game/lawLink.ts)은 이 목록의 법령을 검색 결과 링크로 연결한다.
 *   npm run data:laws
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Case } from '../src/types/case';
import { articleUrl, parseLawRef } from '../src/game/lawLink';

const DRAFT_DIR = 'data/drafts';
const OUT = 'src/data/law-no-article.json';

const refs = new Set<string>();
for (const f of readdirSync(DRAFT_DIR).filter((f) => f.endsWith('.json') && !f.endsWith('.skip.json')))
  for (const r of (JSON.parse(readFileSync(path.join(DRAFT_DIR, f), 'utf8')) as Case).lawRefs) refs.add(r);

// 법령마다 대표 조문 하나만 열어 본다
const byLaw = new Map<string, string>();
for (const r of refs) {
  const p = parseLawRef(r);
  if (p && !p.supplement && !byLaw.has(p.name)) byLaw.set(p.name, articleUrl(p.name, p.article));
}

const missing: string[] = [];
for (const [name, url] of byLaw) {
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const html = await (await fetch(url)).text();
      // 조문 페이지 제목: "<법령명> > 법령 > 본문 | 국가법령정보센터". 없는 법령은 "한글주소" 안내 페이지
      ok = /법령 &gt; 본문/.test(/<title>([^<]*)/.exec(html)?.[1] ?? '');
      if (!ok && attempt === 1) break;
    } catch {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  if (!ok) missing.push(name);
  console.log(`${ok ? '✓' : '✗'} ${name}`);
  await new Promise((r) => setTimeout(r, 300));
}

writeFileSync(OUT, JSON.stringify(missing.sort(), null, 2) + '\n');
console.log(`\n법령 ${byLaw.size}개 중 조문 페이지 없음 ${missing.length}개 → ${OUT}`);
