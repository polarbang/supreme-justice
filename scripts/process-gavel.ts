/**
 * gif/판사봉.gif (투명 배경 2프레임) → src/assets/gavel.webp (여백 잘라 애니메이션 webp)
 *   npx tsx scripts/process-gavel.ts
 */
import sharp from 'sharp';

const SRC = 'gif/판사봉.gif';
const OUT = 'src/assets/gavel.webp';
const TARGET = 240;

const img = sharp(SRC, { animated: true });
const meta = await img.metadata();
const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const w = info.width, ph = meta.pageHeight ?? info.height, pages = info.height / ph;

// 모든 프레임의 불투명 영역을 합친 경계
let minX = w, minY = ph, maxX = 0, maxY = 0;
for (let f = 0; f < pages; f++)
  for (let y = 0; y < ph; y++)
    for (let x = 0; x < w; x++)
      if (data[((f * ph + y) * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
const cw = maxX - minX + 1, ch = maxY - minY + 1;
const scale = Math.min(1, TARGET / Math.max(cw, ch));
const tw = Math.round(cw * scale), th = Math.round(ch * scale);

const frames = await Promise.all(
  Array.from({ length: pages }, async (_, f) => {
    const frame = Buffer.alloc(cw * ch * 4);
    for (let y = 0; y < ch; y++) {
      const src = ((f * ph + minY + y) * w + minX) * 4;
      data.copy(frame, y * cw * 4, src, src + cw * 4);
    }
    return sharp(frame, { raw: { width: cw, height: ch, channels: 4 } }).resize(tw, th, { kernel: 'nearest' }).raw().toBuffer();
  }),
);
await sharp(Buffer.concat(frames), { raw: { width: tw, height: th * pages, channels: 4, pageHeight: th } })
  .webp({ quality: 90, alphaQuality: 100, loop: 0, delay: meta.delay ?? Array(pages).fill(350) })
  .toFile(OUT);
console.log(`✓ ${SRC} → ${OUT} (${tw}×${th}, ${pages}프레임)`);
