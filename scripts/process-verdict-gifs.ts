/**
 * gif/<나이>대<남|녀> 판결성공|실패.gif (크림색 배경) → src/assets/verdict/<나이><m|f>-<win|lose>.webp (투명 배경 애니메이션)
 * 프레임마다 가장자리에서 flood-fill 해서 바깥과 연결된 배경색만 투명화, 모든 프레임 공통 영역으로 자른다.
 *   npx tsx scripts/process-verdict-gifs.ts
 */
import sharp from 'sharp';
import { mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const SRC = 'gif';
const OUT = 'src/assets/verdict';
const TARGET_HEIGHT = 360;
/** 배경 후보: 밝고(최소 채널 ≥ 222) 무채색에 가까운(채널 차 ≤ 24) 픽셀. 배경은 (249,240,234) */
const isBgColor = (r: number, g: number, b: number) => Math.min(r, g, b) >= 222 && Math.max(r, g, b) - Math.min(r, g, b) <= 24;

async function processOne(file: string) {
  const m = /^(\d0)대(남|녀) 판결(성공|실패)\.gif$/.exec(file);
  if (!m) return;
  const name = `${m[1]}${m[2] === '남' ? 'm' : 'f'}-${m[3] === '성공' ? 'win' : 'lose'}`;
  const img = sharp(path.join(SRC, file), { animated: true });
  const meta = await img.metadata();
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, ph = meta.pageHeight ?? info.height, pages = info.height / ph;

  let minX = w, minY = ph, maxX = 0, maxY = 0;
  for (let f = 0; f < pages; f++) {
    const base = f * w * ph;
    const bg = new Uint8Array(w * ph);
    const stack: number[] = [];
    const push = (x: number, y: number) => {
      const k = y * w + x;
      if (bg[k]) return;
      const i = (base + k) * 4;
      if (!isBgColor(data[i], data[i + 1], data[i + 2])) return;
      bg[k] = 1;
      stack.push(k);
    };
    for (let x = 0; x < w; x++) { push(x, 0); push(x, ph - 1); }
    for (let y = 0; y < ph; y++) { push(0, y); push(w - 1, y); }
    while (stack.length) {
      const k = stack.pop()!;
      const x = k % w, y = (k - x) / w;
      if (x > 0) push(x - 1, y);
      if (x < w - 1) push(x + 1, y);
      if (y > 0) push(x, y - 1);
      if (y < ph - 1) push(x, y + 1);
    }
    for (let k = 0; k < w * ph; k++) {
      const x = k % w, y = (k - x) / w;
      if (bg[k]) { data[(base + k) * 4 + 3] = 0; continue; }
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }

  // 모든 프레임 공통 영역으로 잘라 새 프레임 스택 구성
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  const out = Buffer.alloc(cw * ch * pages * 4);
  for (let f = 0; f < pages; f++)
    for (let y = 0; y < ch; y++) {
      const src = ((f * ph + minY + y) * w + minX) * 4;
      data.copy(out, (f * ch + y) * cw * 4, src, src + cw * 4);
    }
  const scale = Math.min(1, TARGET_HEIGHT / ch);
  const tw = Math.round(cw * scale), th = Math.round(ch * scale);
  // 프레임별로 리사이즈 후 다시 쌓기 (애니메이션 리사이즈를 프레임 단위로 확실히)
  const frames = await Promise.all(
    Array.from({ length: pages }, (_, f) =>
      sharp(out.subarray(f * cw * ch * 4, (f + 1) * cw * ch * 4), { raw: { width: cw, height: ch, channels: 4 } })
        .resize(tw, th, { kernel: 'nearest' })
        .raw()
        .toBuffer(),
    ),
  );
  const dest = path.join(OUT, `${name}.webp`);
  await sharp(Buffer.concat(frames), { raw: { width: tw, height: th * pages, channels: 4, pageHeight: th } })
    .webp({ quality: 90, alphaQuality: 100, loop: 0, delay: meta.delay ?? Array(pages).fill(350) })
    .toFile(dest);
  console.log(`✓ ${file} → ${dest} (${tw}×${th}, ${pages}프레임)`);
}

mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(SRC)) await processOne(f);
