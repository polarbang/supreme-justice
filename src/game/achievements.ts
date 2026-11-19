/**
 * 업적: 조건을 처음 채우는 순간 해금 → 팝업 + 인생 기록 한 줄. 보상은 없음 (수집용).
 * 목록·조건 문서: docs/ACHIEVEMENTS.md, 뱃지 이미지 프롬프트: docs/BADGE_PROMPTS.md (npm run docs:badges)
 * 뱃지 그림: src/assets/badges/<id>.webp (없으면 자리표시 그림)
 */
import type { Case } from '../types/case';
import { count, START_AGE, type Progress } from './progression';
import { POLITICAL_EVENTS } from './surpriseEvents';

export type Tone = 'good' | 'neutral' | 'bad';

export interface Achievement {
  id: string;
  name: string;
  /** 달성 조건 (화면·문서에 표시) */
  condition: string;
  tone: Tone;
  group: '판결' | '경력' | '능력치' | '기습 일정·제안' | '활동';
  /** 뱃지 그림 소재 (이미지 생성 프롬프트용, 영어) */
  motif: string;
  check: (ctx: Ctx) => boolean;
}

export interface Ctx {
  p: Progress;
  cases: Map<string, Case>;
}

const ORDER = ['a', 'b', 'c', 'd'];
const age = (p: Progress) => START_AGE + p.yearsServed;

/** 판결 기록 (사건 정보와 함께) */
function verdicts({ p, cases }: Ctx) {
  return Object.entries(p.solved)
    .map(([id, s]) => ({ ...s, c: cases.get(id) }))
    .filter((v): v is { choiceId: string; correct: boolean; c: Case } => !!v.c);
}
const answerText = (c: Case) => c.choices.find((x) => x.id === c.answerId)?.text ?? '';
const choiceText = (c: Case, id: string) => c.choices.find((x) => x.id === id)?.text ?? '';
/** 실형: 집행유예 없는 징역·금고 */
const isPrison = (t: string) => /징역|금고/.test(t) && !/집행유예/.test(t);
/** 오답이 정답보다 무거운 쪽(보기 순서가 뒤)인지 */
const heavier = (c: Case, id: string) => ORDER.indexOf(id) > ORDER.indexOf(c.answerId);

export const ACHIEVEMENTS: Achievement[] = [
  // ───────── 판결 ─────────
  {
    id: 'first-hit', name: '첫 단추', group: '판결', tone: 'good', condition: '첫 판결 적중',
    motif: 'a small whole black judge robe shown on its own like a floating garment icon, with a single shiny gold button just fastened at the top collar, the other buttonholes below still empty',
    check: (x) => x.p.correct >= 1,
  },
  {
    id: 'streak-5', name: '명판관', group: '판결', tone: 'good', condition: '5연속 적중',
    motif: 'a wooden judge gavel resting diagonally, with five small golden stars in a gentle rising arc above it, each star slightly bigger and brighter than the one before, like a combo streak lighting up',
    check: (x) => count(x.p, 'streakCorrect') >= 5,
  },
  {
    id: 'streak-10', name: '신들린 판결', group: '판결', tone: 'good', condition: '10연속 적중',
    motif: 'a chibi judge in a black robe with eyes calmly closed in deep focus, confidently striking a golden gavel down onto a sound block with one hand, bold motion lines behind the gavel',
    check: (x) => count(x.p, 'streakCorrect') >= 10,
  },
  {
    id: 'criminal-20', name: '형사 전문가', group: '판결', tone: 'good', condition: '형사 사건 20건 적중',
    motif: 'a single pair of steel handcuffs lying half open, with a small golden key inserted in one cuff',
    check: (x) => verdicts(x).filter((v) => v.correct && v.c.category === '형사').length >= 20,
  },
  {
    id: 'civil-15', name: '민사의 달인', group: '판결', tone: 'good', condition: '민사 사건 15건 적중',
    motif: 'a small folded paper IOU note with a red thumbprint mark, tucked half inside a plump white money envelope',
    check: (x) => verdicts(x).filter((v) => v.correct && v.c.category === '민사').length >= 15,
  },
  {
    id: 'hard-10', name: '난제 해결사', group: '판결', tone: 'good', condition: '가장 어려운 사건 10건 적중',
    motif: 'a small magnifying glass hovering over the final golden jigsaw puzzle piece clicking into place in an almost finished puzzle square',
    check: (x) => verdicts(x).filter((v) => v.correct && v.c.difficulty === 3).length >= 10,
  },
  {
    id: 'acquittal-3', name: '무죄 추정', group: '판결', tone: 'good', condition: '무죄 사건을 3번 무죄로 판결',
    motif: 'a white dove flying out of an open birdcage',
    check: (x) => verdicts(x).filter((v) => v.correct && answerText(v.c) === '무죄').length >= 3,
  },
  {
    id: 'miss-5', name: '엇나간 감', group: '판결', tone: 'bad', condition: '5연속 미적중',
    motif: 'a small round dartboard with three darts all stuck outside the rim, none near the center',
    check: (x) => count(x.p, 'streakWrong') >= 5,
  },
  {
    id: 'jailed-innocent', name: '판사님 그건 좀', group: '판결', tone: 'bad',
    condition: '무죄 사건에 3번 실형 선고',
    motif: 'a small white dove sitting sadly behind iron jail bars, with a single droplet of a tear on its cheek',
    check: (x) => verdicts(x).filter((v) => !v.correct && answerText(v.c) === '무죄' && isPrison(choiceText(v.c, v.choiceId))).length >= 3,
  },
  {
    id: 'too-harsh', name: '철퇴 판사', group: '판결', tone: 'bad', condition: '실제 판결보다 무겁게 10번 선고',
    motif: 'a wooden gavel with an oversized heavy iron head, just slammed down onto a sound block that has cracked in half, with bold impact lines',
    check: (x) => verdicts(x).filter((v) => !v.correct && heavier(v.c, v.choiceId)).length >= 10,
  },
  {
    id: 'too-soft', name: '솜방망이', group: '판결', tone: 'bad', condition: '실제 판결보다 가볍게 10번 선고',
    motif: 'a wooden gavel whose head is a puffy white cotton ball, softly squishing as it touches a sound block',
    check: (x) => verdicts(x).filter((v) => !v.correct && !heavier(v.c, v.choiceId)).length >= 10,
  },
  {
    id: 'dismiss-5', name: '기각 전문', group: '판결', tone: 'bad', condition: '민사에서 5번 잘못 청구 기각',
    motif: 'a small metal wastebasket overflowing with crumpled paper documents, one crumpled sheet fallen on the floor beside it',
    check: (x) => verdicts(x).filter((v) => !v.correct && v.c.category === '민사' && v.choiceId === 'a').length >= 5,
  },

  // ───────── 경력 ─────────
  {
    id: 'first-promotion', name: '새 명패', group: '경력', tone: 'good', condition: '첫 진급',
    motif: 'a wooden desk name plate with a brand new shiny gold trim, a small red ribbon bow tied on one corner',
    check: (x) => x.p.highestRank >= 1,
  },
  {
    id: 'smooth-road', name: '탄탄대로', group: '경력', tone: 'good', condition: '강등 없이 대법관 도달',
    motif: 'a long straight red carpet rolled out without a single wrinkle, leading to the front steps of a small courthouse',
    check: (x) => x.p.rankIndex >= 6 && count(x.p, 'demotions') === 0,
  },
  {
    id: 'fast-track', name: '초고속 승진', group: '경력', tone: 'good', condition: '45세 이전 대법관 도달',
    motif: 'a chibi judge character wearing a black judge robe like a superhero cape, flying straight vertically upward with one fist raised overhead, the robe fluttering behind, bold vertical speed lines below',
    check: (x) => x.p.rankIndex >= 6 && age(x.p) < 45,
  },
  {
    id: 'double-promotion', name: '파격 인사', group: '경력', tone: 'good', condition: '2계급 특진',
    motif: 'the collar of a black judge robe with two shiny gold rank pins being pinned on at once, side by side',
    check: (x) => count(x.p, 'doublePromotion') >= 1,
  },
  {
    id: 'chief-justice', name: '사법부의 수장', group: '경력', tone: 'good', condition: '대법원장 취임',
    motif: 'a small grand courthouse building with white columns, golden trim on its triangular roof, and wide front steps',
    check: (x) => x.p.rankIndex >= 7,
  },
  {
    id: 'youngest-chief', name: '최연소 대법원장', group: '경력', tone: 'good', condition: '45세 이하에 대법원장 취임',
    motif: 'a younger kid-faced chibi judge character with a black judge robe worn like a superhero cape, just landing on top of a small golden high-backed chair, cape still fluttering, a small golden crown on the head',
    check: (x) => x.p.rankIndex >= 7 && age(x.p) <= 45,
  },
  {
    id: 'verdicts-100', name: '닳고 닳은 봉', group: '경력', tone: 'neutral', condition: '100건 판결',
    motif: 'a well-worn wooden gavel with a smooth polished handle, resting on a sound block with a deep dent worn into its center from countless strikes',
    check: (x) => x.p.total >= 100,
  },
  {
    id: 'first-demotion', name: '이게 아닌데', group: '경력', tone: 'bad', condition: '첫 강등',
    motif: 'a wooden desk name plate fallen face-down on the floor with a crack running through it',
    check: (x) => count(x.p, 'demotions') >= 1,
  },
  {
    id: 'comeback', name: '칠전팔기', group: '경력', tone: 'neutral', condition: '3번 강등 겪고 최고 직급 되찾기',
    motif: 'a round-bottomed roly-poly tumbler toy shaped like a chibi judge in a black robe, swaying back upright after being tipped over, with small curved rocking lines at its base',
    check: (x) => count(x.p, 'demotions') >= 3 && x.p.rankIndex >= x.p.highestRank,
  },
  {
    id: 'revolving-door', name: '쳇바퀴 인사', group: '경력', tone: 'bad', condition: '같은 직급에서 강등과 재진급 3번 반복',
    motif: 'a chibi judge character in a black robe running hard inside a small hamster exercise wheel, sweating with a tired face, with circular motion lines around the wheel',
    check: (x) => [0, 1, 2, 3, 4, 5, 6, 7].some((r) => count(x.p, `demoteFrom${r}`) >= 3 && x.p.rankIndex >= r),
  },
  {
    id: 'forever-associate', name: '만년 배석', group: '경력', tone: 'bad', condition: '진급 없이 배석판사로 5년 근무',
    motif: 'a plain wooden desk name plate covered in thick dust and draped with cobwebs, a tiny spider hanging from one corner',
    check: (x) => count(x.p, 'verdictsAtRank0') >= 20 && x.p.highestRank === 0,
  },
  {
    id: 'retired', name: '정년 퇴임', group: '경력', tone: 'bad', condition: '대법원장이 되지 못한 채 정년 퇴임',
    motif: 'a black judge robe neatly draped over the back of an empty wooden chair, a small farewell flower bouquet resting on the seat',
    check: (x) => !!x.p.retired,
  },
  {
    id: 'exit-politics', name: '이제는 정치인', group: '경력', tone: 'neutral', condition: '국회의원 당선 또는 입각으로 정계 진출',
    motif: 'a chibi character in a dark suit with a shiny round gold lapel pin, waving from a small podium, a black judge robe hanging on a coat stand behind it',
    // 총선 낙선은 정계 진출로 치지 않음
    check: (x) => x.p.exit?.kind === 'politics' && x.p.exit.ending !== 'lost',
  },
  {
    id: 'exit-lawfirm', name: '돈이 좋아', group: '경력', tone: 'bad', condition: '법복을 벗고 대형 로펌 파트너 되기',
    motif: 'a chibi character tossing a black judge robe aside while picking up a sleek leather briefcase with bundles of cash peeking out of it',
    check: (x) => x.p.exit?.kind === 'lawfirm',
  },

  // ───────── 능력치 ─────────
  {
    id: 'insight-1', name: '다시 보니', group: '능력치', tone: 'good', condition: '통찰력으로 판결 1번 다시 고르기',
    motif: 'a chibi judge character in a black robe pushing up round glasses with one finger while taking a second closer look at a case file held in the other hand',
    check: (x) => count(x.p, 'insightRetry') >= 1,
  },
  {
    id: 'insight-10', name: '꿰뚫어 보는 눈', group: '능력치', tone: 'good', condition: '통찰력으로 판결 10번 다시 고르기',
    motif: 'a small hawk wearing a tiny black judge cap, perched on a stack of case files and staring down at them with sharp focused eyes',
    check: (x) => count(x.p, 'insightRetry') >= 10,
  },
  {
    id: 'shield-1', name: '인맥 찬스', group: '능력치', tone: 'neutral', condition: '인맥 덕분에 1번 강등 면하기',
    motif: 'a smartphone showing an incoming call screen with a blank contact silhouette, a single small blank business card leaning against it',
    check: (x) => count(x.p, 'networkShield') >= 1,
  },
  {
    id: 'shield-5', name: '든든한 뒷배', group: '능력치', tone: 'neutral', condition: '인맥 덕분에 5번 강등 면하기',
    motif: 'a thick bulging business card holder book stuffed with so many blank business cards that they are sticking out on every side',
    check: (x) => count(x.p, 'networkShield') >= 5,
  },
  {
    id: 'early-promotion', name: '좋은 평판', group: '능력치', tone: 'good', condition: '평판 덕분에 1번 조기 진급',
    motif: 'a small round bird wearing a tiny black judge cap, holding a golden promotion envelope in its beak, perched on a branch with a sun just starting to peek over the horizon',
    check: (x) => count(x.p, 'earlyPromotion') >= 1,
  },
  {
    id: 'early-promotion-3', name: '자자한 명성', group: '능력치', tone: 'good', condition: '평판 덕분에 3번 조기 진급',
    motif: 'three small round birds wearing tiny black judge caps, perched in a row on a branch, each holding a golden promotion envelope in its beak, a sun just peeking over the horizon',
    check: (x) => count(x.p, 'earlyPromotion') >= 3,
  },
  {
    id: 'health-100', name: '철인', group: '능력치', tone: 'good', condition: '건강 100 달성',
    motif: 'a chibi judge character in a black robe with sleeves rolled up, lifting a dumbbell high with one hand and flexing proudly',
    check: (x) => x.p.stats.health >= 100,
  },
  {
    id: 'network-100', name: '마당발', group: '능력치', tone: 'neutral', condition: '인맥 100 달성',
    motif: 'a small photo frame showing a crowded group photo, a chibi judge in a black robe in the very center making a peace sign, many smiling people squeezed in around it',
    check: (x) => x.p.stats.network >= 100,
  },
  {
    id: 'reputation-100', name: '국민 판사', group: '능력치', tone: 'good', condition: '평판 100 달성',
    motif: 'a folded newspaper front page with a large smiling portrait drawing of a chibi judge, the headline area shown as thick blank lines',
    check: (x) => x.p.stats.reputation >= 100,
  },
  {
    id: 'overwork', name: '카페인 중독', group: '능력치', tone: 'bad', condition: '건강 35 이하로 떨어지기',
    motif: 'a chibi judge character in a black robe with heavy dark eye bags, half buried behind tall piles of case files, clutching a coffee mug with a tired blank stare',
    check: (x) => x.p.stats.health <= 35,
  },
  {
    id: 'burnout', name: '번아웃', group: '능력치', tone: 'bad', condition: '건강 40 미만인 채로 10건 판결',
    motif: 'a chibi judge character in a black robe melted and slumped limply over a chair like a puddle, with a dazed face',
    check: (x) => count(x.p, 'lowHealthVerdicts') >= 10,
  },
  {
    id: 'bad-reputation', name: '바닥난 평판', group: '능력치', tone: 'bad', condition: '평판 20 미만',
    motif: 'a chibi judge character in a black robe shielding its face with one sleeve, a squashed tomato splattered on the robe and another tomato flying toward it',
    check: (x) => x.p.stats.reputation < 20,
  },

  // ───────── 기습 일정·제안 ─────────
  {
    id: 'clean-10', name: '청렴 판사', group: '기습 일정·제안', tone: 'good', condition: '유혹 제안 10번 거절',
    motif: 'a chibi judge character in a black robe firmly pushing back a cardboard apple box with both hands, shaking its head, a thick envelope peeking out from between the apples',
    check: (x) => count(x.p, 'temptDeclined') >= 10,
  },
  {
    id: 'no-politics', name: '여의도 안가요', group: '기습 일정·제안', tone: 'good',
    condition: '한 판에서 정치권 제안 3가지 모두 거절',
    motif: 'a small open gift box holding a shiny round gold lapel pin, with a red return arrow sticker on the lid, being pushed back',
    // 정치권 제안은 한 판에 한 번씩만 뜨므로, 셋 다 거절 기록이 있으면 모두 거절한 것
    check: (x) => [...POLITICAL_EVENTS].every((id) => count(x.p, `politicalDeclined:${id}`) >= 1),
  },
  {
    id: 'first-bribe', name: '사과 박스', group: '기습 일정·제안', tone: 'bad', condition: '유혹 제안 첫 수락',
    motif: 'a cardboard apple box with its lid half open, shiny red apples on top and a thick envelope peeking out from between the apples',
    check: (x) => count(x.p, 'temptAccepted') >= 1,
  },
  {
    id: 'exposed-3', name: '단골 기삿거리', group: '기습 일정·제안', tone: 'bad', condition: '유혹 제안 수락이 3번 들통나기',
    motif: 'a startled chibi judge character in a black robe caught in the middle, surrounded by several cameras with long telephoto lenses aimed at it from all sides, bold camera flash bursts going off',
    check: (x) => count(x.p, 'exposed') >= 3,
  },
  {
    id: 'judicial-abuse', name: '사법 농단', group: '기습 일정·제안', tone: 'bad', condition: '유혹 제안 5번 수락하고 대법관 되기',
    motif: 'a wooden judge gavel hanging from puppet strings like a marionette, the strings leading up to a large hand at the top controlling them with its fingers',
    check: (x) => count(x.p, 'temptAccepted') >= 5 && x.p.rankIndex >= 6,
  },
  {
    id: 'lucky', name: '완전 범죄', group: '기습 일정·제안', tone: 'bad', condition: '유혹 제안 5번 수락하고 한 번도 안 들키기',
    motif: 'several cameras all aimed the wrong way, while a chibi judge character in a black robe tiptoes sneakily behind them carrying an envelope',
    check: (x) => count(x.p, 'temptAccepted') >= 5 && count(x.p, 'exposed') === 0,
  },
  {
    id: 'decliner', name: '거절의 달인', group: '기습 일정·제안', tone: 'neutral', condition: '기습 일정 10번 거절',
    motif: 'a chibi judge character in a black robe smiling apologetically while waving both hands in front of it in a polite no-thank-you gesture',
    check: (x) => count(x.p, 'normalDeclined') >= 10,
  },
  {
    id: 'yes-man', name: '예스맨', group: '기습 일정·제안', tone: 'neutral', condition: '기습 일정 10번 연속 참여',
    motif: 'a chibi judge character in a black robe eagerly stretching one hand as high as it can go, standing on tiptoes, with an excited face',
    check: (x) => count(x.p, 'normalAcceptStreak') >= 10,
  },

  // ───────── 활동 ─────────
  {
    id: 'bookworm', name: '공부벌레', group: '활동', tone: 'neutral', condition: '통찰력 활동 10번',
    motif: 'a chibi judge character in a black robe sitting between tall stacks of law books, rubbing its eyes while reading by a small desk lamp',
    check: (x) => count(x.p, 'activity_insight') >= 10,
  },
  {
    id: 'social', name: '사교의 왕', group: '활동', tone: 'neutral', condition: '인맥 활동 10번',
    motif: 'a chibi judge character in a black robe wearing a golf visor, mid-swing with a golf club, a small golf ball flying off, surrounded by a few other chibi golfers in visors clapping and cheering',
    check: (x) => count(x.p, 'activity_network') >= 10,
  },
  {
    id: 'volunteer', name: '시민의 판사', group: '활동', tone: 'good', condition: '평판 활동 10번',
    motif: 'a chibi judge character in a black robe wearing cotton work gloves, cheerfully carrying a stack of black coal briquettes',
    check: (x) => count(x.p, 'activity_reputation') >= 10,
  },
  {
    id: 'rest-10', name: '휴정 중', group: '활동', tone: 'neutral', condition: '건강 활동 10번',
    motif: 'a chibi judge character asleep in a hammock strung between two small trees, its black robe draped over it like a blanket',
    check: (x) => count(x.p, 'activity_health') >= 10,
  },
];

/** 아직 해금하지 않았는데 지금 조건을 채운 업적 */
export function newlyUnlocked(p: Progress, cases: Map<string, Case>): Achievement[] {
  const ctx = { p, cases };
  return ACHIEVEMENTS.filter((a) => !p.achievements?.[a.id] && a.check(ctx));
}

/** 정치권 제안 id 목록 (문서용) */
export const POLITICAL_EVENT_IDS = [...POLITICAL_EVENTS];
