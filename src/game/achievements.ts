/**
 * 업적: 조건을 처음 채우는 순간 해금 → 팝업 + 인생 기록 한 줄. 보상은 없음 (수집용).
 * 목록·조건 문서: docs/ACHIEVEMENTS.md, 뱃지 이미지 프롬프트: docs/BADGE_PROMPTS.md (npm run docs:badges)
 * 뱃지 그림: src/assets/badges/<id>.webp (없으면 자리표시 그림)
 */
import type { Case } from '../types/case';
import { count, POLITICAL_EVENTS, START_AGE, type Progress } from './progression';

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
    motif: 'a single shirt button being fastened on a black judge robe',
    check: (x) => x.p.correct >= 1,
  },
  {
    id: 'streak-5', name: '명판관', group: '판결', tone: 'good', condition: '5연속 적중',
    motif: 'a golden gavel with five small stars in an arc above it',
    check: (x) => count(x.p, 'streakCorrect') >= 5,
  },
  {
    id: 'streak-10', name: '신들린 판결', group: '판결', tone: 'good', condition: '10연속 적중',
    motif: 'a glowing golden gavel surrounded by radiant light rays and sparkles',
    check: (x) => count(x.p, 'streakCorrect') >= 10,
  },
  {
    id: 'criminal-20', name: '형사 전문가', group: '판결', tone: 'good', condition: '형사 사건 20건 적중',
    motif: 'a pair of handcuffs crossed with a gavel',
    check: (x) => verdicts(x).filter((v) => v.correct && v.c.category === '형사').length >= 20,
  },
  {
    id: 'civil-15', name: '민사의 달인', group: '판결', tone: 'good', condition: '민사 사건 15건 적중',
    motif: 'a signed contract scroll with a red seal stamp and a fountain pen',
    check: (x) => verdicts(x).filter((v) => v.correct && v.c.category === '민사').length >= 15,
  },
  {
    id: 'hard-10', name: '난제 해결사', group: '판결', tone: 'good', condition: '난이도 3 사건 10건 적중',
    motif: 'a tangled knot of rope being cleanly untied, with a small key',
    check: (x) => verdicts(x).filter((v) => v.correct && v.c.difficulty === 3).length >= 10,
  },
  {
    id: 'acquittal-3', name: '무죄 추정', group: '판결', tone: 'good', condition: '정답이 "무죄"인 사건 3건 적중',
    motif: 'a white dove flying out of an open birdcage',
    check: (x) => verdicts(x).filter((v) => v.correct && answerText(v.c) === '무죄').length >= 3,
  },
  {
    id: 'miss-5', name: '엇나간 감', group: '판결', tone: 'bad', condition: '5연속 미적중',
    motif: 'a compass with a spinning broken needle pointing the wrong way',
    check: (x) => count(x.p, 'streakWrong') >= 5,
  },
  {
    id: 'jailed-innocent', name: '판사님 그건 좀…', group: '판결', tone: 'bad',
    condition: '정답이 무죄인데 실형을 고른 것 3번',
    motif: 'a sweating judge face emoji next to cracked jail bars',
    check: (x) => verdicts(x).filter((v) => !v.correct && answerText(v.c) === '무죄' && isPrison(choiceText(v.c, v.choiceId))).length >= 3,
  },
  {
    id: 'too-harsh', name: '철퇴 판사', group: '판결', tone: 'bad', condition: '실제보다 무거운 쪽을 고른 오답 10번',
    motif: 'a heavy iron mace smashing down, with impact lines',
    check: (x) => verdicts(x).filter((v) => !v.correct && heavier(v.c, v.choiceId)).length >= 10,
  },
  {
    id: 'too-soft', name: '솜방망이', group: '판결', tone: 'bad', condition: '실제보다 가벼운 쪽을 고른 오답 10번',
    motif: 'a fluffy cotton-candy club, soft and pink',
    check: (x) => verdicts(x).filter((v) => !v.correct && !heavier(v.c, v.choiceId)).length >= 10,
  },
  {
    id: 'dismiss-5', name: '기각 전문', group: '판결', tone: 'bad', condition: '민사에서 "청구 기각"을 골라 틀린 것 5번',
    motif: 'a big red rejection stamp hitting a document',
    check: (x) => verdicts(x).filter((v) => !v.correct && v.c.category === '민사' && v.choiceId === 'a').length >= 5,
  },

  // ───────── 경력 ─────────
  {
    id: 'first-promotion', name: '첫 발령', group: '경력', tone: 'good', condition: '첫 진급',
    motif: 'an official appointment letter with a ribbon and a gold seal',
    check: (x) => x.p.highestRank >= 1,
  },
  {
    id: 'smooth-road', name: '탄탄대로', group: '경력', tone: 'good', condition: '강등 없이 대법관 도달',
    motif: 'a straight golden road leading up to a courthouse on a hill',
    check: (x) => x.p.rankIndex >= 6 && count(x.p, 'demotions') === 0,
  },
  {
    id: 'fast-track', name: '초고속 승진', group: '경력', tone: 'good', condition: '45세 이전 대법관 도달',
    motif: 'a rocket shooting upward past stair steps',
    check: (x) => x.p.rankIndex >= 6 && age(x.p) < 45,
  },
  {
    id: 'double-promotion', name: '파격 인사', group: '경력', tone: 'good', condition: '2계급 특진',
    motif: 'a person leaping over two steps at once on a staircase, with motion lines',
    check: (x) => count(x.p, 'doublePromotion') >= 1,
  },
  {
    id: 'chief-justice', name: '사법부의 수장', group: '경력', tone: 'good', condition: '대법원장 취임',
    motif: 'a golden crown resting on top of a gavel and scales of justice',
    check: (x) => x.p.rankIndex >= 7,
  },
  {
    id: 'youngest-chief', name: '최연소 대법원장', group: '경력', tone: 'good', condition: '45세 이하에 대법원장 취임',
    motif: 'a small sprout growing out of a golden crown',
    check: (x) => x.p.rankIndex >= 7 && age(x.p) <= 45,
  },
  {
    id: 'verdicts-100', name: '개근상', group: '경력', tone: 'neutral', condition: '판결 100건',
    motif: 'a tall stack of case files with a 100 ribbon',
    check: (x) => x.p.total >= 100,
  },
  {
    id: 'first-demotion', name: '첫 좌천', group: '경력', tone: 'bad', condition: '첫 강등',
    motif: 'a downward arrow on a cracked name plate',
    check: (x) => count(x.p, 'demotions') >= 1,
  },
  {
    id: 'comeback', name: '칠전팔기', group: '경력', tone: 'neutral', condition: '강등 3번 겪고 다시 가장 높았던 직급 회복',
    motif: 'a roly-poly tumbler doll standing back up',
    check: (x) => count(x.p, 'demotions') >= 3 && x.p.rankIndex >= x.p.highestRank,
  },
  {
    id: 'revolving-door', name: '회전문 인사', group: '경력', tone: 'bad', condition: '같은 직급에서 강등·재진급 3번 반복',
    motif: 'a spinning revolving door with circular arrows',
    check: (x) => [0, 1, 2, 3, 4, 5, 6, 7].some((r) => count(x.p, `demoteFrom${r}`) >= 3 && x.p.rankIndex >= r),
  },
  {
    id: 'forever-single', name: '만년 단독', group: '경력', tone: 'bad', condition: '단독판사로 10년 이상 근무 (판결 40건)',
    motif: 'a dusty desk name plate with cobwebs and a calendar with many torn pages',
    check: (x) => count(x.p, 'verdictsAtRank1') >= 40,
  },
  {
    id: 'retired', name: '정년 퇴임', group: '경력', tone: 'bad', condition: '대법원장이 되지 못하고 60세 퇴임',
    motif: 'a judge robe hanging on a coat hook with a farewell flower bouquet',
    check: (x) => !!x.p.retired,
  },

  // ───────── 능력치 ─────────
  {
    id: 'insight-10', name: '꿰뚫어 보는 눈', group: '능력치', tone: 'good', condition: '통찰력으로 다시 고르기 10번',
    motif: 'a sharp glowing eye inside a magnifying glass',
    check: (x) => count(x.p, 'insightRetry') >= 10,
  },
  {
    id: 'shield-3', name: '든든한 뒷배', group: '능력치', tone: 'neutral', condition: '인맥으로 강등 면제 3번',
    motif: 'a sturdy shield held up by several hands from behind',
    check: (x) => count(x.p, 'networkShield') >= 3,
  },
  {
    id: 'early-promotion', name: '좋은 평판', group: '능력치', tone: 'good', condition: '평판으로 조기 진급 1번',
    motif: 'a thumbs-up inside a laurel wreath',
    check: (x) => count(x.p, 'earlyPromotion') >= 1,
  },
  {
    id: 'health-100', name: '철인', group: '능력치', tone: 'good', condition: '건강 100 달성',
    motif: 'a flexed muscular arm with a heart',
    check: (x) => x.p.stats.health >= 100,
  },
  {
    id: 'network-100', name: '마당발', group: '능력치', tone: 'neutral', condition: '인맥 100 달성',
    motif: 'a big foot surrounded by many small connected people icons',
    check: (x) => x.p.stats.network >= 100,
  },
  {
    id: 'reputation-100', name: '국민 판사', group: '능력치', tone: 'good', condition: '평판 100 달성',
    motif: 'a crowd of tiny people cheering under a heart',
    check: (x) => x.p.stats.reputation >= 100,
  },
  {
    id: 'overwork', name: '과로 판사', group: '능력치', tone: 'bad', condition: '건강 35 이하로 떨어짐',
    motif: 'a tired face with dark eye bags next to a steaming coffee cup and a pile of papers',
    check: (x) => x.p.stats.health <= 35,
  },
  {
    id: 'burnout', name: '번아웃', group: '능력치', tone: 'bad', condition: '건강 40 미만 상태에서 판결 누적 10건',
    motif: 'a burnt-out match with a thin wisp of smoke',
    check: (x) => count(x.p, 'lowHealthVerdicts') >= 10,
  },
  {
    id: 'bad-reputation', name: '바닥난 평판', group: '능력치', tone: 'bad', condition: '평판 20 미만',
    motif: 'a newspaper with a big red headline and a downward graph',
    check: (x) => x.p.stats.reputation < 20,
  },

  // ───────── 기습 일정·제안 ─────────
  {
    id: 'clean-10', name: '청렴 판사', group: '기습 일정·제안', tone: 'good', condition: '유혹 제안 10번 거절',
    motif: 'a hand pushing away an envelope of money, with a white lily',
    check: (x) => count(x.p, 'temptDeclined') >= 10,
  },
  {
    id: 'no-politics', name: '정치와 거리 두기', group: '기습 일정·제안', tone: 'good',
    condition: '정당 영입·입각 타진·정치권 회동 제안을 받은 적이 있고 모두 거절',
    motif: 'a judge gavel standing apart from a parliament building, with a line between them',
    check: (x) => count(x.p, 'politicalOffers') >= 1 && count(x.p, 'politicalAccepted') === 0,
  },
  {
    id: 'first-bribe', name: '첫 청탁', group: '기습 일정·제안', tone: 'bad', condition: '유혹 제안 첫 수락',
    motif: 'a hand secretly taking an envelope under a table',
    check: (x) => count(x.p, 'temptAccepted') >= 1,
  },
  {
    id: 'exposed-3', name: '단골 기삿거리', group: '기습 일정·제안', tone: 'bad', condition: '들통 3번',
    motif: 'camera flashes and a microphone pointed at a newspaper headline',
    check: (x) => count(x.p, 'exposed') >= 3,
  },
  {
    id: 'judicial-abuse', name: '사법 농단', group: '기습 일정·제안', tone: 'bad', condition: '유혹 제안 5번 수락하고 대법관 이상 도달',
    motif: 'a cracked scale of justice tilted by a bag of gold coins',
    check: (x) => count(x.p, 'temptAccepted') >= 5 && x.p.rankIndex >= 6,
  },
  {
    id: 'lucky', name: '운 좋은 사람', group: '기습 일정·제안', tone: 'bad', condition: '유혹 제안 5번 수락했는데 한 번도 안 들킴',
    motif: 'a four-leaf clover hiding behind a sneaky grin mask',
    check: (x) => count(x.p, 'temptAccepted') >= 5 && count(x.p, 'exposed') === 0,
  },
  {
    id: 'decliner', name: '거절의 달인', group: '기습 일정·제안', tone: 'neutral', condition: '일반 기습 일정 10번 거절',
    motif: 'a polite hand raised in a stop gesture, with a calendar',
    check: (x) => count(x.p, 'normalDeclined') >= 10,
  },
  {
    id: 'yes-man', name: '예스맨', group: '기습 일정·제안', tone: 'neutral', condition: '일반 기습 일정 10번 연속 참여',
    motif: 'a bobblehead nodding yes with a big speech bubble saying OK',
    check: (x) => count(x.p, 'normalAcceptStreak') >= 10,
  },

  // ───────── 활동 ─────────
  {
    id: 'bookworm', name: '공부벌레', group: '활동', tone: 'neutral', condition: '통찰력 활동 10번',
    motif: 'a cute worm wearing glasses peeking out of a thick law book',
    check: (x) => count(x.p, 'activity_insight') >= 10,
  },
  {
    id: 'social', name: '사교의 왕', group: '활동', tone: 'neutral', condition: '인맥 활동 10번',
    motif: 'two clinking glasses with a small crown above them',
    check: (x) => count(x.p, 'activity_network') >= 10,
  },
  {
    id: 'volunteer', name: '봉사하는 판사', group: '활동', tone: 'good', condition: '평판 활동 10번',
    motif: 'two hands holding a warm glowing heart',
    check: (x) => count(x.p, 'activity_reputation') >= 10,
  },
  {
    id: 'rest-10', name: '쉬어 가기', group: '활동', tone: 'neutral', condition: '건강 활동 10번',
    motif: 'a hammock between two trees with a sleeping cat',
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
