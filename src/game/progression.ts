import type { Gender } from './ranks';
import { CORRECT_INSIGHT_GAIN, INITIAL_STATS, MAX_CHANCE, VERDICT_HEALTH_COST, applyEffects, rollEffect, type Stats } from './stats';
import { pickPost } from './posts';
import { pickSurprise, POLITICAL_EVENTS, scheduleCycle, SURPRISE_EVENTS, surpriseEffects, TEMPT_EXPOSE_CHANCE, type SurpriseEvent } from './surpriseEvents';
import { activityEffects, pickWeekendChoices, WEEKEND_ACTIVITIES, type WeekendActivity } from './weekendActivities';

/** 직급(index 0~6)별 진급에 필요한 적중 수. 7번 진급하면 대법원장(index 7) → 게임 클리어 */
export const PROMOTE_REQUIRED = [3, 3, 4, 4, 5, 6, 7] as const;

/**
 * 법관 경력의 시간: 판결 4건마다 1년 + 처음 오르는 직급으로 진급할 때 1년.
 * 30세 임관 → 전부 적중하면 50세에 대법원장. 60세가 되면 정년 퇴임(게임 종료).
 */
export const START_AGE = 30;
/** 판결 몇 건마다 1년이 흐르는지 */
export const VERDICTS_PER_YEAR = 4;
/** 처음 오르는 직급으로 진급할 때 흐르는 햇수 (두 단계 진급도 한 번의 인사, 강등 뒤 되찾는 진급은 0) */
export const PROMOTION_YEARS = 1;
/** 판결 수 → 흐른 햇수 */
export const yearsForVerdicts = (total: number) => Math.floor(total / VERDICTS_PER_YEAR);
/** 정년: 이 나이가 되면 자동 퇴임 */
export const RETIRE_AGE = 60;
export const RETIRE_NOTE = `만 ${RETIRE_AGE}세 정년을 맞아 법복을 벗게 되었습니다.`;
/** 최고 직급 index (ranks.ts의 RANKS 길이 - 1 과 같아야 함) */
const MAX_RANK = PROMOTE_REQUIRED.length;
/** 진급 조건을 채우기 전에 이만큼 틀리면 강등 */
export const DEMOTE_WRONG = 2;

/** 강등은 Lv2~Lv7(index 1~6)에만 존재. Lv1은 더 내려갈 곳이 없고 Lv8은 게임 종료 */
export const canDemote = (rankIndex: number) => rankIndex >= 1 && rankIndex < MAX_RANK;
export const isFinished = (rankIndex: number) => rankIndex >= MAX_RANK;
/** 게임 끝: 대법원장 취임 또는 정년 퇴임 */
export const isOver = (p: { rankIndex: number; retired?: boolean }) => isFinished(p.rankIndex) || !!p.retired;

/**
 * 진행 단위(한 바퀴): 사건 3건을 판결하면 활동 하나를 고른다.
 * day 0~2 = 사건 차례, day 3 = 활동 차례. week = 몇 번째 바퀴인지 (화면에는 표시하지 않음)
 */
export const CASES_PER_CYCLE = 3;
export const isActivityTime = (day: number) => day >= CASES_PER_CYCLE;

/** 판결 기록(타임라인)·경력 지도 한 줄 */
export interface LogEntry {
  week: number;
  /** 0 월 … 6 일 */
  day: number;
  kind: 'start' | 'retire' | 'achievement' | 'verdict' | 'activity' | 'promote' | 'demote' | 'effect' | 'event' | 'scandal';
  /** 법관 몇 년차에 있었던 일 (인생 기록의 연차 머리글) */
  year?: number;
  text: string;
  /** verdict: 적중 여부 / event: 좋은 선택이었는지 (꼬리표 색) */
  ok?: boolean;
  /** 앞에 붙는 꼬리표 (예: 참여·거절·제안 수락·제안 거절) */
  tag?: string;
  /** verdict: 사건 id */
  caseId?: string;
}

/** 저장 용량을 위해 최근 기록만 보관 */
export const LOG_LIMIT = 500;

export interface Progress {
  rankIndex: number;
  /** 플레이어 성별 (직급 캐릭터 그림) — 신분증에서 언제든 바꿀 수 있음 */
  gender: Gender;
  /** 판사 이름 (신분증에서 정함, 비어 있으면 "이름 정하기") */
  name: string;
  /** 임관한 해 (게임 시작 연도) */
  startYear: number;
  /** 임관 후 흐른 햇수 = 판결 수 ÷ 5 + 진급으로 흐른 햇수 */
  yearsServed: number;
  /** 진급(인사 발령)으로 흐른 햇수 합 */
  promotionYears: number;
  /** 지금까지 올라 본 가장 높은 직급 (강등 뒤 되찾는 진급은 세월이 흐르지 않음) */
  highestRank: number;
  /** 정년(60세)으로 퇴임해 게임이 끝났는지 */
  retired?: boolean;
  /** 현재 근무처 (직급이 바뀔 때 posts.ts에서 새로 배정) */
  post: string;
  /** 현재 직급에서의 적중/오판 수 — 직급이 바뀌면 0으로 초기화 */
  levelCorrect: number;
  levelWrong: number;
  solved: Record<string, { choiceId: string; correct: boolean }>;
  correct: number;
  total: number;
  stats: Stats;
  week: number;
  day: number;
  /** 활동 선택지 (활동 id). 활동 차례가 시작될 때 정해 두어 새로고침해도 바뀌지 않게 */
  weekendOffer: string[];
  /** 직전 활동 차례에 보였던 선택지 (이번 차례에서 되도록 제외) */
  weekendDone: string[];
  /** 가장 최근 활동 (결과 안내용) */
  lastActivity?: { id: string; day: number };
  /** 판결·활동·진급/강등·능력치 발동·기습 이벤트 기록 (오래된 순) */
  log: LogEntry[];
  /** 이번 바퀴에서 기습 이벤트가 뜰 사건 차례 (0~2, 없거나 하나) */
  surpriseDays: number[];
  /** 오늘 뜬, 아직 답하지 않은 기습 이벤트 */
  surprise?: { id: string; week: number; day: number };
  /** 이벤트 id → 마지막으로 나온 바퀴(week) (같은 이벤트 반복 방지) */
  surpriseSeen: Record<string, number>;
  /** 업적 판정용 카운터 (연속 적중, 능력치 발동, 강등, 기습 일정 응답 등) */
  counters: Record<string, number>;
  /** 해금한 업적 id → 해금 정보 */
  achievements: Record<string, { year: number }>;
}

/** 카운터 더하기 (없으면 0부터) */
export const bump = (c: Record<string, number>, key: string, n = 1) => ({ ...c, [key]: (c[key] ?? 0) + n });
export const count = (p: { counters?: Record<string, number> }, key: string) => p.counters?.[key] ?? 0;

export const INITIAL_PROGRESS: Progress = {
  rankIndex: 0,
  gender: 'female',
  name: '',
  startYear: new Date().getFullYear(),
  yearsServed: 0,
  promotionYears: 0,
  highestRank: 0,
  post: '',
  levelCorrect: 0,
  levelWrong: 0,
  solved: {},
  correct: 0,
  total: 0,
  stats: INITIAL_STATS,
  week: 1,
  day: 0,
  weekendOffer: [],
  weekendDone: [],
  log: [],
  surpriseDays: [],
  surpriseSeen: {},
  counters: {},
  achievements: {},
};

export interface RankChange {
  type: 'promote' | 'demote';
  from: number;
  to: number;
  /** 이번 인사로 흐른 햇수 (처음 오르는 직급 2년, 그 외 0) */
  years: number;
  /** 새 근무처 */
  post: string;
}

/** 법관 몇 년차 (임관한 해 = 1년차) */
export const careerYear = (p: Progress) => p.yearsServed + 1;
export const currentAge = (p: Progress) => START_AGE + p.yearsServed;
export const currentYear = (p: Progress) => p.startYear + p.yearsServed;

export interface VerdictOutcome {
  next: Progress;
  change: RankChange | null;
  /** 능력치 효과 발동 안내 (담담한 한 문장씩) */
  notes: string[];
}

/** 판결 1건 반영: 진급/강등 판정(능력치 확률 포함) → 건강 감소 → 다음 날로 */
export function applyResult(p: Progress, correct: boolean, rand = Math.random): VerdictOutcome {
  if (isOver(p)) return { next: p, change: null, notes: [] };

  let { rankIndex, levelCorrect, levelWrong } = p;
  const notes: string[] = [];
  let change: RankChange | null = null;
  let effect: 'double' | 'early' | 'shield' | null = null;

  if (correct) {
    levelCorrect++;
    if (levelCorrect >= PROMOTE_REQUIRED[rankIndex]) {
      const double = rankIndex + 2 <= MAX_RANK && rollEffect(p.stats, 'reputation', MAX_CHANCE.doublePromotion, rand);
      if (double) {
        notes.push('평소 좋은 평판을 쌓아 2계급 특진을 했습니다.');
        effect = 'double';
      }
      change = { type: 'promote', from: rankIndex, to: rankIndex + (double ? 2 : 1), years: 0, post: '' };
    } else if (rollEffect(p.stats, 'reputation', MAX_CHANCE.earlyPromotion, rand)) {
      notes.push('평소 쌓아 온 좋은 평판 덕분에 예정보다 일찍 진급했습니다.');
      effect = 'early';
      change = { type: 'promote', from: rankIndex, to: rankIndex + 1, years: 0, post: '' };
    }
  } else {
    levelWrong++;
    if (canDemote(rankIndex) && levelWrong >= DEMOTE_WRONG) {
      if (rollEffect(p.stats, 'network', MAX_CHANCE.demotionShield, rand)) {
        notes.push('두터운 인맥 덕분에 강등을 면했습니다.');
        effect = 'shield';
        levelWrong = DEMOTE_WRONG - 1; // 이번만 면함: 다음 오판에서 다시 판정
      } else {
        change = { type: 'demote', from: rankIndex, to: rankIndex - 1, years: 0, post: '' };
      }
    }
  }
  let post = p.post;
  let promotionYears = p.promotionYears;
  // 값이 없거나 깨진 상태(예전 저장본, 페이지를 연 채 코드가 바뀐 경우)여도 지금 직급 기준으로
  let highestRank = Math.max(Number.isFinite(p.highestRank) ? p.highestRank : 0, p.rankIndex);
  if (change) {
    // 처음 오르는 직급일 때만 1년 (강등됐다가 원래 직급을 되찾는 진급은 시간 없음)
    const years = change.type === 'promote' && change.to > highestRank ? PROMOTION_YEARS : 0;
    promotionYears += years;
    highestRank = Math.max(highestRank, change.to);
    rankIndex = change.to;
    post = pickPost(change.to, rand, p.post);
    change = { ...change, years, post };
    levelCorrect = 0;
    levelWrong = 0;
  }
  // 판결 4건마다 1년 + 처음 오르는 직급 진급 때 1년 (p.total은 이번 판결까지 센 수: store.recordAnswer가 먼저 더해서 넘김)
  let yearsServed = yearsForVerdicts(p.total) + promotionYears;
  // 정년: 60세가 되었는데 대법원장이 아니면 퇴임 (이번 판결의 진급·강등은 없던 일로, 나이는 60세에서 멈춤)
  let retired = false;
  if (START_AGE + yearsServed >= RETIRE_AGE && !isFinished(rankIndex)) {
    retired = true;
    yearsServed = RETIRE_AGE - START_AGE;
    rankIndex = p.rankIndex;
    post = p.post;
    promotionYears = p.promotionYears;
    highestRank = Math.max(Number.isFinite(p.highestRank) ? p.highestRank : 0, p.rankIndex);
    change = null;
    notes.push(RETIRE_NOTE);
  }

  // 판결 1건마다 건강 −1, 적중하면 통찰력 +1 (틀려도 통찰력은 그대로)
  const stats = applyEffects(p.stats, { health: -VERDICT_HEALTH_COST, ...(correct ? { insight: CORRECT_INSIGHT_GAIN } : {}) });
  // 업적 판정용 카운터
  let counters = p.counters ?? {};
  counters = correct
    ? { ...bump(counters, 'streakCorrect'), streakWrong: 0 }
    : { ...bump(counters, 'streakWrong'), streakCorrect: 0 };
  counters = bump(counters, `verdictsAtRank${p.rankIndex}`);
  if (p.stats.health < 40) counters = bump(counters, 'lowHealthVerdicts');
  if (effect === 'shield') counters = bump(counters, 'networkShield');
  if (change && effect === 'double') counters = bump(counters, 'doublePromotion');
  if (change && effect === 'early') counters = bump(counters, 'earlyPromotion');
  if (change?.type === 'demote') counters = bump(bump(counters, 'demotions'), `demoteFrom${change.from}`);

  let next: Progress = { ...p, rankIndex, post, yearsServed, promotionYears, highestRank, retired, levelCorrect, levelWrong, stats, counters, day: p.day + 1 };
  if (isActivityTime(next.day)) next = startActivityTime(next, rand);
  else next = arriveWeekday(next, rand);
  return { next, change, notes };
}

/** 활동 차례 시작: 선택지 4개 (직전 차례에 나온 활동은 되도록 빼고) */
export function startActivityTime(p: Progress, rand: () => number = Math.random): Progress {
  const offer = pickWeekendChoices(p.stats, p.rankIndex, p.weekendDone, rand).map((a) => a.id);
  return { ...p, weekendOffer: offer };
}

export const offeredActivities = (p: Progress): WeekendActivity[] =>
  p.weekendOffer.map((id) => WEEKEND_ACTIVITIES.find((a) => a.id === id)).filter((a): a is WeekendActivity => !!a);

/** 활동 선택: 능력치 반영 → 다음 바퀴 (기습 이벤트 차례를 정하고 첫 사건 차례로) */
export function applyActivity(p: Progress, activityId: string, rand = Math.random): Progress {
  const a = WEEKEND_ACTIVITIES.find((x) => x.id === activityId);
  if (!a || !isActivityTime(p.day)) return p;
  return arriveWeekday(
    {
      ...p,
      stats: applyEffects(p.stats, activityEffects(a)),
      counters: bump(p.counters ?? {}, `activity_${a.main}`),
      lastActivity: { id: a.id, day: p.day },
      day: 0,
      week: p.week + 1,
      // 이번에 보인 선택지는 다음 차례에 되도록 다시 안 나오게
      weekendDone: p.weekendOffer,
      weekendOffer: [],
      surpriseDays: scheduleCycle(rand),
    },
    rand,
  );
}

/** 사건 차례 시작: 이번이 기습 이벤트 차례면 이벤트 하나를 띄운다 */
export function arriveWeekday(p: Progress, rand: () => number = Math.random): Progress {
  if (p.retired || isActivityTime(p.day) || p.surprise || !p.surpriseDays.includes(p.day)) return p;
  const surpriseDays = p.surpriseDays.filter((d) => d !== p.day);
  const e = pickSurprise(p, rand);
  if (!e) return { ...p, surpriseDays };
  return {
    ...p,
    surpriseDays,
    surprise: { id: e.id, week: p.week, day: p.day },
    surpriseSeen: { ...p.surpriseSeen, [e.id]: p.week },
  };
}

export const currentSurprise = (p: Progress): SurpriseEvent | undefined =>
  p.surprise && SURPRISE_EVENTS.find((e) => e.id === p.surprise!.id);

export interface SurpriseOutcome {
  next: Progress;
  event: SurpriseEvent;
  accepted: boolean;
  /** 유혹 이벤트가 바로 알려졌는지 */
  exposed: boolean;
  effects: Partial<Stats>;
}

/** 기습 이벤트 답하기: 참여/거절 효과 반영 (유혹 이벤트 참여는 들통 판정) */
export function applySurprise(p: Progress, accepted: boolean, rand: () => number = Math.random): SurpriseOutcome | undefined {
  const event = currentSurprise(p);
  if (!event) return undefined;
  const exposed = accepted && event.kind === 'temptation' && rand() < TEMPT_EXPOSE_CHANCE;
  const effects = surpriseEffects(event, accepted, exposed);
  let counters = p.counters ?? {};
  if (event.kind === 'temptation') {
    counters = bump(counters, accepted ? 'temptAccepted' : 'temptDeclined');
    if (exposed) counters = bump(counters, 'exposed');
    if (POLITICAL_EVENTS.has(event.id) && !accepted) counters = bump(counters, `politicalDeclined:${event.id}`);
  } else {
    counters = accepted
      ? bump(counters, 'normalAcceptStreak')
      : { ...bump(counters, 'normalDeclined'), normalAcceptStreak: 0 };
  }
  return { next: { ...p, stats: applyEffects(p.stats, effects), surprise: undefined, counters }, event, accepted, exposed, effects };
}
