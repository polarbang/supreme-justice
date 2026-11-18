/**
 * img/badges/<업적 id>.png (ChatGPT로 만든 뱃지) → src/assets/badges/<id>.webp (192px, 여백 제거)
 * 배경이 투명이 아니면 가장자리에서 이어진 밝은 단색 배경을 지운다 (flood-fill).
 *   npm run assets:badges
 */
import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ACHIEVEMENTS } from '../src/game/achievements';

const SRC = 'img/badges';
const OUT = 'src/assets/badges';
const SIZE = 192;

async function removeFlatBackground(input: string) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  // 이미 투명 배경이면 그대로
  if (data[3] < 10 && data[(w - 1) * 4 + 3] < 10) return sharp(input).png().toBuffer();
  const bg = [data[0], data[1], data[2]];
  const near = (i: number) => Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) < 40;
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    const k = y * w + x;
    if (seen[k]) return;
    seen[k] = 1;
    if (near(k * 4)) stack.push(k);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const k = stack.pop()!;
    data[k * 4 + 3] = 0;
    const x = k % w, y = (k - x) / w;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

if (!existsSync(SRC)) {
  console.log(`${SRC} 폴더가 없습니다. 뱃지 이미지를 ${SRC}/<업적 id>.png 로 넣어 주세요.`);
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });
const ids = new Set(ACHIEVEMENTS.map((a) => a.id));
let n = 0;
for (const f of readdirSync(SRC).filter((f) => /\.(png|webp|jpg|jpeg)$/i.test(f))) {
  const id = path.basename(f, path.extname(f));
  if (!ids.has(id)) {
    console.log(`  ? ${f}: 업적 id가 아님 (docs/BADGE_PROMPTS.md의 파일 이름 확인)`);
    continue;
  }
  const cleared = await removeFlatBackground(path.join(SRC, f));
  const trimmed = await sharp(cleared).trim().toBuffer();
  await sharp(trimmed)
    .resize({ width: SIZE, height: SIZE, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(path.join(OUT, `${id}.webp`));
  n++;
  console.log(`  ✓ ${f} → ${OUT}/${id}.webp`);
}
const missing = ACHIEVEMENTS.filter((a) => !existsSync(path.join(OUT, `${a.id}.webp`))).map((a) => a.id);
console.log(`\n변환 ${n}개 / 아직 그림 없는 업적 ${missing.length}개${missing.length ? `: ${missing.join(', ')}` : ''}`);
