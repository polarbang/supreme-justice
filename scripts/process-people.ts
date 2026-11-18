/**
 * img/<나이>대<남|녀>.png (크림색 배경) → src/assets/people/<나이><m|f>.webp (투명 배경, 여백 제거)
 * 사건개요 당사자 목록에 쓰는 인물 아이콘.
 *   npx tsx scripts/process-people.ts
 */
import sharp from 'sharp';
import { mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const SRC = 'img';
const OUT = 'src/assets/people';
const TARGET_HEIGHT = 240;
/** 배경 후보: 밝고 무채색에 가까운 픽셀. 배경은 (250,241,234) 근처 */
const isBgColor = (r: number, g: number, b: number) => Math.min(r, g, b) >= 222 && Math.max(r, g, b) - Math.min(r, g, b) <= 24;

async function processOne(file: string) {
  const m = /^(\d0)대(남|녀)\.png$/.exec(file);
  if (!m) return;
  const name = `${m[1]}${m[2] === '남' ? 'm' : 'f'}`;
  const { data, info } = await sharp(path.join(SRC, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  // 가장자리에서 flood-fill: 바깥과 이어진 배경만 투명 (옷의 밝은 부분은 보존)
  const bg = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    const k = y * w + x;
    if (bg[k]) return;
    const i = k * 4;
    if (!isBgColor(data[i], data[i + 1], data[i + 2])) return;
    bg[k] = 1;
    stack.push(k);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const k = stack.pop()!;
    const x = k % w, y = (k - x) / w;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
  for (let k = 0; k < w * h; k++) if (bg[k]) data[k * 4 + 3] = 0;

  const dest = path.join(OUT, `${name}.webp`);
  const trimmed = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer().then((b) => sharp(b).trim().toBuffer());
  await sharp(trimmed).resize({ height: TARGET_HEIGHT }).webp({ quality: 90, alphaQuality: 100 }).toFile(dest);
  const meta = await sharp(dest).metadata();
  console.log(`✓ ${file} → ${dest} (${meta.width}×${meta.height})`);
}

mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(SRC)) await processOne(f);
