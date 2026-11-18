/**
 * reviewed:true 인 draft만 src/data/cases.json 으로 병합.
 *   npm run data:build            (검수 완료분만)
 *   npm run data:build -- --all   (개발용: 미검수 포함, 오류 없는 것 전부)
 */
import { writeFileSync } from 'node:fs';
import { validateAll } from './validate-cases';

const ALL = process.argv.includes('--all');
const reports = validateAll();
const cases = reports
  .filter((r) => r.data && r.errors.length === 0 && (ALL || r.data.reviewed))
  .map((r) => r.data!)
  .sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));

writeFileSync('src/data/cases.json', JSON.stringify(cases, null, 2) + '\n');

const count = (f: (c: (typeof cases)[number]) => string | number) =>
  Object.entries(cases.reduce<Record<string, number>>((m, c) => ((m[f(c)] = (m[f(c)] ?? 0) + 1), m), {}))
    .map(([k, v]) => `${k}:${v}`).join('  ');
console.log(`cases.json ← ${cases.length}건${ALL ? ' (미검수 포함)' : ''} / 전체 draft ${reports.length}건`);
console.log(`  분류  ${count((c) => c.category)}`);
console.log(`  난이도 ${count((c) => c.difficulty)}`);
console.log(`  정답위치 ${count((c) => c.answerId)}`);
