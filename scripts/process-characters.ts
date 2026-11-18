/**
 * img/<성별><직급>.png (흰 배경 RGB, 예: 남성배석판사.png) → src/assets/characters/<male|female>-<rankId>.webp (투명 배경)
 * 원본이 없는 성별·직급은 건너뛴다 (여성 캐릭터는 추가 예정).
 * 가장자리에서 flood-fill 해서 "바깥과 연결된" 흰 픽셀만 투명화 → 옷의 흰 셔츠는 보존.
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SRC = 'img';
const OUT = 'src/assets/characters';
const TARGET_HEIGHT = 640;
const WHITE_THRESHOLD = 235; // R,G,B 모두 이 값 이상이면 배경 후보
const FEATHER_THRESHOLD = 200; // 경계 픽셀 부분 투명 처리용

const RANK_FILES: Record<string, string> = {
  associate: '배석판사',
  single: '단독판사',
  chief: '부장판사',
  'senior-chief': '수석부장판사',
  'district-president': '지방법원장',
  'high-president': '고등법원장',
  justice: '대법관',
  'chief-justice': '대법원장',
};

const GENDERS: Record<string, string> = { male: '남성', female: '여성' };

async function processOne(outName: string, fileName: string) {
  const input = path.join(SRC, `${fileName}.png`);
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = (x: number, y: number) => (y * w + x) * 4;
  const isBg = (i: number) =>
    data[i] >= WHITE_THRESHOLD && data[i + 1] >= WHITE_THRESHOLD && data[i + 2] >= WHITE_THRESHOLD;

  const visited = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    const k = y * w + x;
    if (visited[k]) return;
    visited[k] = 1;
    if (isBg(k * 4)) stack.push(k);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }

  const bg = new Uint8Array(w * h);
  while (stack.length) {
    const k = stack.pop()!;
    bg[k] = 1;
    const x = k % w, y = (k - x) / w;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }

  for (let k = 0; k < w * h; k++) {
    const i = k * 4;
    if (bg[k]) { data[i + 3] = 0; continue; }
    // 배경과 맞닿은 밝은 경계 픽셀은 부분 투명 (흰 테두리 halo 제거)
    const x = k % w, y = (k - x) / w;
    const touchesBg =
      (x > 0 && bg[k - 1]) || (x < w - 1 && bg[k + 1]) || (y > 0 && bg[k - w]) || (y < h - 1 && bg[k + w]);
    if (touchesBg) {
      const minC = Math.min(data[i], data[i + 1], data[i + 2]);
      if (minC >= FEATHER_THRESHOLD) {
        data[i + 3] = Math.round(255 * (1 - (minC - FEATHER_THRESHOLD) / (255 - FEATHER_THRESHOLD)));
      }
    }
  }

  const out = path.join(OUT, `${outName}.webp`);
  const trimmed = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer()
    .then((b) => sharp(b).trim().toBuffer());
  await sharp(trimmed)
    .resize({ height: TARGET_HEIGHT, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(out);
  const meta = await sharp(out).metadata();
  console.log(`✓ ${fileName} → ${out} (${meta.width}×${meta.height})`);
}

mkdirSync(OUT, { recursive: true });
for (const [gender, prefix] of Object.entries(GENDERS)) {
  for (const [rankId, rankName] of Object.entries(RANK_FILES)) {
    const fileName = `${prefix}${rankName}`;
    if (!existsSync(path.join(SRC, `${fileName}.png`))) continue;
    await processOne(`${gender}-${rankId}`, fileName);
  }
}
