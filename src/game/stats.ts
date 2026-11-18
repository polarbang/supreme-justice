/**
 * 능력치: 통찰력·인맥·평판·건강 (0~100, 시작 60).
 * 능력치가 높을수록 특수 효과가 "발동할 확률"이 오른다. 60 이하는 0%, 100에서 최대.
 */
export type StatId = 'insight' | 'network' | 'reputation' | 'health';
export type Stats = Record<StatId, number>;

export const STAT_NAMES: Record<StatId, string> = {
  insight: '통찰력',
  network: '인맥',
  reputation: '평판',
  health: '건강',
};

export const STAT_MIN = 0;
export const STAT_MAX = 100;
export const STAT_START = 60;
/** 건강만 70에서 시작 (판결마다 줄어드니 여유를 둠). 효과 확률의 기준점(60)은 그대로 */
export const HEALTH_START = 70;
export const INITIAL_STATS: Stats = { insight: STAT_START, network: STAT_START, reputation: STAT_START, health: HEALTH_START };

/** 능력치 100일 때의 발동 확률 */
export const MAX_CHANCE = {
  /** 통찰력: 오답을 골라 선고하면 넘어가지 않고 다시 고를 기회 */
  retry: 0.5,
  /** 인맥: 강등될 상황에서 강등 면제 */
  demotionShield: 0.3,
  /** 평판: 적중 수를 다 못 채웠어도 진급 */
  earlyPromotion: 0.15,
  /** 평판: 적중 수를 채워 진급할 때 두 단계 진급 */
  doublePromotion: 0.05,
} as const;

/** 판결 1건마다 깎이는 건강 (사건 3건 → −3, 활동으로 회복 가능) */
export const VERDICT_HEALTH_COST = 1;
/** 판결을 적중하면 오르는 통찰력 (틀려도 내려가지 않음) */
export const CORRECT_INSIGHT_GAIN = 1;

/** 건강이 이 값 미만이면 모든 특수 효과 발동 확률이 절반 */
export const HEALTH_HALF_CHANCE_BELOW = 50;
/** 건강이 이 값 미만이면 활동 선택에서 건강 활동만 고를 수 있음 */
export const HEALTH_REST_ONLY_BELOW = 40;

/** 60 → 0%, 100 → max, 그 사이는 직선. 건강이 낮으면 절반 */
export function chance(stat: number, max: number, health: number) {
  const t = (stat - STAT_START) / (STAT_MAX - STAT_START);
  const base = Math.max(0, Math.min(1, t)) * max;
  return health < HEALTH_HALF_CHANCE_BELOW ? base / 2 : base;
}

/** 특수 효과 발동 판정 */
export const rollEffect = (stats: Stats, stat: StatId, max: number, rand = Math.random) =>
  rand() < chance(stats[stat], max, stats.health);

export const clampStat = (v: number) => Math.max(STAT_MIN, Math.min(STAT_MAX, v));

export function applyEffects(s: Stats, effects: Partial<Stats>): Stats {
  const next = { ...s };
  for (const [k, v] of Object.entries(effects) as [StatId, number][]) next[k] = clampStat(next[k] + v);
  return next;
}
