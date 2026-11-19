import { memo, type CSSProperties } from 'react';

/**
 * 화면 맨 위 도트 배경: 대법정 법대에 대법관 9명이 나란히 앉은 모습.
 * 1 단위 = 도트 1칸. 가로로 넓게 그려 두고(xMidYMax slice) 화면 폭만큼 잘라 보여 준다.
 * 움직임(들썩임·눈 깜빡임·판사봉)은 layout.css 의 .cb-* 애니메이션.
 */

const W = 1024;
const H = 64;
const MID = W / 2;
const GAP = 22; // 대법관 간격 = 법대 판넬 한 칸
const BENCH_Y = 46; // 법대 윗면
const SEAT_Y = 30; // 대법관 도트 맨 윗줄

type Rect = { x: number; y: number; w: number; h: number; fill: string };

const C = {
  wall: '#c9ad85',
  wallLine: '#b39570',
  pilaster: '#d8bf98',
  cornice: '#8a6a48',
  corniceHi: '#e2cba6',
  chair: '#6e2b2f',
  chairHi: '#8c3a3e',
  chairDot: '#4f1e22',
  gold: '#d9b44a',
  goldDark: '#8a6a1c',
  benchTop: '#c48d5d',
  benchTop2: '#a87449',
  benchEdge: '#4a2c18',
  bench: '#7d4d2e',
  panelDark: '#5e3820',
  panelHi: '#94603b',
  robe: '#1f1d24',
  trim: '#5c1f3a',
  collar: '#f4f1ea',
  eye: '#2a1d1d',
  mouth: '#c27e62',
  paper: '#f4f1ea',
  paperLine: '#c9c2b2',
  mic: '#2b2b30',
  gavel: '#6b3f22',
  gavelHi: '#9a6238',
};

/** 글자 격자 → 가로로 이어진 같은 색끼리 묶은 사각형 */
function grid(rows: string[], ox: number, oy: number, color: (ch: string) => string | undefined): Rect[] {
  const out: Rect[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let n = 1;
      while (row[x + n] === ch) n++;
      const fill = ch === '.' ? undefined : color(ch);
      if (fill) out.push({ x: ox + x, y: oy + y, w: n, h: 1, fill });
      x += n;
    }
  });
  return out;
}

/* ───────── 대법관 도트 (12칸 폭, 아랫부분은 법대에 가려짐) ───────── */
const ROBE = ['.kkkkwwkkkk.', 'kkkkkwwkkkkk', 'kkkpkwwkpkkk', 'kkkpkkkkpkkk', 'kkkpkkkkpkkk', 'kkkpkkkkpkkk', 'kkkpkkkkpkkk', 'kkkpkkkkpkkk'];
const FACE = ['..ssssssss..', '..ssessess..', '..ssssssss..', '..sssmmsss..', '...ssssss...', '....ssss....'];

const HAIR: Record<string, string[]> = {
  short: ['...hhhhhh...', '..hhhhhhhh..', '..hssssssh..', ...FACE, ...ROBE],
  bald: ['............', '...ssssss...', '..hssssssh..', ...FACE, ...ROBE],
  bob: [
    '...hhhhhh...',
    '..hhhhhhhh..',
    '.hhhhhhhhhh.',
    '.hssssssssh.',
    '.hssessessh.',
    '.hssssssssh.',
    '.hsssmmsssh.',
    '.hhsssssshh.',
    '....ssss....',
    ...ROBE,
  ],
  long: [
    '...hhhhhh...',
    '..hhhhhhhh..',
    '.hhhhhhhhhh.',
    '.hssssssssh.',
    '.hssessessh.',
    '.hssssssssh.',
    '.hsssmmsssh.',
    '.hhsssssshh.',
    '.hh.ssss.hh.',
    '.hkkkwwkkkh.',
    ...ROBE.slice(1),
  ],
};

interface Justice {
  style: keyof typeof HAIR;
  hair: string;
  skin: string;
  chief?: boolean;
  /** 들썩임 주기·시작, 깜빡임 주기·시작 (초) — 서로 엇박자가 나도록 */
  bob: [number, number];
  blink: [number, number];
}

const JUSTICES: Justice[] = [
  { style: 'long', hair: '#1d1a1a', skin: '#f2c9a0', bob: [2.2, -0.3], blink: [5.1, -1.2] },
  { style: 'short', hair: '#8d8d8d', skin: '#e8b98f', bob: [1.8, -1.1], blink: [6.3, -4.0] },
  { style: 'short', hair: '#1d1a1a', skin: '#f5d2b0', bob: [2.6, -0.7], blink: [4.4, -2.5] },
  { style: 'bob', hair: '#3a2a22', skin: '#f2c9a0', bob: [2.0, -1.6], blink: [5.7, -0.4] },
  { style: 'short', hair: '#e2e2e2', skin: '#e8b98f', chief: true, bob: [2.9, -0.2], blink: [4.9, -3.1] },
  { style: 'long', hair: '#2a2220', skin: '#f5d2b0', bob: [2.3, -1.9], blink: [6.0, -2.2] },
  { style: 'bald', hair: '#9a9a9a', skin: '#f2c9a0', bob: [1.9, -0.9], blink: [5.4, -4.6] },
  { style: 'short', hair: '#3a2a22', skin: '#e8b98f', bob: [2.5, -1.3], blink: [4.6, -0.9] },
  { style: 'bob', hair: '#a3a3a3', skin: '#f5d2b0', bob: [2.1, -0.5], blink: [5.9, -3.6] },
];

const centerOf = (i: number) => MID + GAP * (i - 4);

function justiceRects(j: Justice, cx: number) {
  const rows = HAIR[j.style];
  const ox = cx - 6;
  const palette: Record<string, string> = {
    h: j.hair,
    s: j.skin,
    e: j.skin, // 눈 자리는 피부를 깔고 눈은 따로 (깜빡일 때 피부가 보이게)
    m: C.mouth,
    k: C.robe,
    p: C.trim,
    w: C.collar,
  };
  const body = grid(rows, ox, SEAT_Y, (ch) => palette[ch]);
  const eyes = grid(rows, ox, SEAT_Y, (ch) => (ch === 'e' ? C.eye : undefined));
  return { body, eyes };
}

/* ───────── 벽 · 휘장 · 의자 ───────── */
function wallRects(): Rect[] {
  const r: Rect[] = [{ x: 0, y: 0, w: W, h: BENCH_Y, fill: C.wall }];
  // 판넬 경계마다 기둥 (의자 사이로 보임)
  for (let cx = MID % GAP; cx < W + GAP; cx += GAP) {
    const x = cx + GAP / 2 - 1;
    r.push({ x: x - 1, y: 3, w: 1, h: BENCH_Y - 3, fill: C.wallLine });
    r.push({ x, y: 3, w: 2, h: BENCH_Y - 3, fill: C.pilaster });
  }
  r.push({ x: 0, y: 0, w: W, h: 2, fill: C.cornice });
  r.push({ x: 0, y: 2, w: W, h: 1, fill: C.corniceHi });
  return r;
}

const EMBLEM = [
  '....ggggg....',
  '..ggGGGGGgg..',
  '.gGGGGdGGGGg.',
  '.gGdddddddGg.',
  'gGGdGGdGGdGGg',
  'gGdddGdGdddGg',
  'gGGGGGdGGGGGg',
  'gGGGGGdGGGGGg',
  '.gGGGdddGGGg.',
  '.gGGGGGGGGGg.',
  '..ggGGGGGgg..',
  '....ggggg....',
];

function emblemRects(): Rect[] {
  const col: Record<string, string> = { g: C.goldDark, G: C.gold, d: C.goldDark };
  return grid(EMBLEM, MID - 6, 4, (ch) => col[ch]);
}

function chairRects(cx: number, chief?: boolean): Rect[] {
  const top = chief ? 18 : 22;
  const x = cx - 7;
  const r: Rect[] = [
    { x: x + 1, y: top, w: 12, h: 1, fill: chief ? C.gold : C.chairHi },
    { x, y: top + 1, w: 14, h: BENCH_Y - top - 1, fill: C.chair },
    { x, y: top + 1, w: 1, h: BENCH_Y - top - 1, fill: C.chairHi },
  ];
  // 가죽 단추
  for (let y = top + 4; y < SEAT_Y; y += 4) for (const dx of [-4, 0, 4]) r.push({ x: cx + dx, y, w: 1, h: 1, fill: C.chairDot });
  return r;
}

/* ───────── 법대 (판넬이 대법관과 같은 간격으로 끝없이) ───────── */
function benchRects(): Rect[] {
  const r: Rect[] = [
    { x: 0, y: BENCH_Y, w: W, h: 1, fill: C.benchTop },
    { x: 0, y: BENCH_Y + 1, w: W, h: 1, fill: C.benchTop2 },
    { x: 0, y: BENCH_Y + 2, w: W, h: 1, fill: C.benchEdge },
    { x: 0, y: BENCH_Y + 3, w: W, h: H - BENCH_Y - 3, fill: C.bench },
  ];
  for (let cx = MID % GAP - GAP; cx < W + GAP; cx += GAP) {
    const x = cx - GAP / 2 + 3;
    const w = GAP - 6;
    const y = BENCH_Y + 6;
    const h = H - y - 3;
    r.push({ x, y, w, h: 1, fill: C.panelDark }, { x, y, w: 1, h, fill: C.panelDark });
    r.push({ x, y: y + h, w, h: 1, fill: C.panelHi }, { x: x + w - 1, y, w: 1, h: h + 1, fill: C.panelHi });
  }
  // 가운데 판넬의 금색 명패
  r.push({ x: MID - 4, y: BENCH_Y + 8, w: 9, h: 4, fill: C.goldDark }, { x: MID - 3, y: BENCH_Y + 9, w: 7, h: 2, fill: C.gold });
  return r;
}

/** 법대 위 소품: 서류 · 마이크 */
function deskRects(): Rect[] {
  const r: Rect[] = [];
  JUSTICES.forEach((j, i) => {
    const cx = centerOf(i);
    if (i % 3 !== 1) r.push({ x: cx - 4, y: BENCH_Y - 2, w: 6, h: 2, fill: C.paper }, { x: cx - 4, y: BENCH_Y - 1, w: 6, h: 1, fill: C.paperLine });
    if (!j.chief) {
      r.push({ x: cx + 7, y: BENCH_Y - 7, w: 1, h: 7, fill: C.mic }, { x: cx + 6, y: BENCH_Y - 8, w: 2, h: 1, fill: C.mic });
    }
  });
  return r;
}

/** 대법원장 앞 판사봉 (이따금 두드림) */
function gavelRects(): Rect[] {
  const x = MID + 4;
  const y = BENCH_Y - 3;
  return [
    { x: x + 4, y: y + 1, w: 5, h: 1, fill: C.gavelHi },
    { x, y, w: 4, h: 3, fill: C.gavel },
    { x, y, w: 4, h: 1, fill: C.gavelHi },
  ];
}

const draw = (rects: Rect[]) => rects.map((p, i) => <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.fill} />);

const BACK = [...wallRects(), ...emblemRects(), ...JUSTICES.flatMap((j, i) => chairRects(centerOf(i), j.chief))];
const PEOPLE = JUSTICES.map((j, i) => ({ j, ...justiceRects(j, centerOf(i)) }));
const FRONT = [...deskRects(), ...benchRects()];
const GAVEL = gavelRects();

function CourtBanner() {
  return (
    <div className="court-banner" aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges">
        {draw(BACK)}
        {PEOPLE.map(({ j, body, eyes }, i) => (
          <g
            key={i}
            className="cb-justice"
            style={{ '--bob': `${j.bob[0]}s`, '--bob-at': `${j.bob[1]}s`, '--blink': `${j.blink[0]}s`, '--blink-at': `${j.blink[1]}s` } as CSSProperties}
          >
            {draw(body)}
            <g className="cb-eyes">{draw(eyes)}</g>
          </g>
        ))}
        {draw(FRONT)}
        <g className="cb-gavel">{draw(GAVEL)}</g>
      </svg>
    </div>
  );
}

export default memo(CourtBanner);
