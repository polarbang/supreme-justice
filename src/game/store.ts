import { useCallback, useEffect, useRef, useState } from 'react';
import type { Case } from '../types/case';
import rawCases from '../data/cases.json';
import { RANKS, type Gender } from './ranks';
import {
  applyActivity,
  applyResult,
  applySurprise,
  type SurpriseOutcome,
  INITIAL_PROGRESS,
  LOG_LIMIT,
  type LogEntry,
  type Progress,
  type VerdictOutcome,
  RETIRE_AGE,
  RETIRE_NOTE,
  yearsForVerdicts,
  bump,
  PROMOTION_YEARS,
} from './progression';
import { MAX_CHANCE, rollEffect } from './stats';
import { WEEKEND_ACTIVITIES } from './weekendActivities';
import { euro } from './korean';
import { pickPost } from './posts';
import { newlyUnlocked, type Achievement } from './achievements';
import { scheduleCycle } from './surpriseEvents';
import { CASES_PER_CYCLE, isActivityTime, startActivityTime } from './progression';
import { RANK_NAMES } from './rankNames';

/** 인생 기록 첫 줄: 첫 근무처 배정 */
const startEntry = (post: string): LogEntry => ({
  week: 1,
  day: 0,
  year: 1,
  kind: 'start',
  text: `사법연수원을 수료한 후 ${post} ${RANK_NAMES[0]}${euro(RANK_NAMES[0])} 배정받았습니다.`,
});

/** 새 게임: 첫 근무처를 무작위로, 첫 바퀴 기습 이벤트 차례 (시작하자마자 뜨지 않게 두 번째 사건부터) */
const freshProgress = (): Progress => {
  const post = pickPost(0);
  return { ...INITIAL_PROGRESS, post, surpriseDays: scheduleCycle(Math.random, 1), log: [startEntry(post)] };
};

/** 예전(월~일 주 단위) 저장본을 "사건 3건 → 활동 1번" 바퀴로 맞춤 */
function toCycle(p: Progress): Progress {
  let q = p;
  if (q.day > CASES_PER_CYCLE) q = { ...q, day: CASES_PER_CYCLE };
  q = { ...q, surpriseDays: q.surpriseDays.filter((d) => d < CASES_PER_CYCLE).slice(0, 1) };
  if (isActivityTime(q.day) && !q.weekendOffer.length) q = startActivityTime(q);
  return q;
}

export const CASES = rawCases as Case[];
const CASE_MAP = new Map(CASES.map((c) => [c.id, c]));

const KEY = 'supreme-justice:v1';
/** 판사 이름 최대 글자 수 (신분증 한 줄에 들어가게) */
export const NAME_MAX = 8;
/**
 * 업적은 게임 기록과 따로 이 브라우저에 보관: 기록 초기화·처음부터 다시 해도 남고, 한 번 해금한 업적은 다시 해금되지 않음
 */
const ACHV_KEY = 'supreme-justice:achievements';
type Unlocked = Progress['achievements'];
function loadAchievements(): Unlocked {
  try {
    return JSON.parse(localStorage.getItem(ACHV_KEY) ?? '{}') ?? {};
  } catch {
    return {};
  }
}
function saveAchievements(a: Unlocked) {
  try {
    localStorage.setItem(ACHV_KEY, JSON.stringify(a));
  } catch {
    /* 저장 불가 환경은 무시 */
  }
}

/**
 * 진급으로 흐른 햇수 복구: 기록이 없거나, 가장 높은 직급 값이 깨져(NaN → 저장 시 null) 진급 2년이 빠졌을 수 있는 저장본은
 * 지금까지 오른 직급 수 × 1년으로 맞춘다 (처음 오른 직급마다 1년이므로)
 */
function promotionYearsOf(saved: Partial<Progress>): number {
  const reached = Math.max(Number.isFinite(saved.highestRank) ? saved.highestRank! : 0, saved.rankIndex ?? 0);
  const recorded = typeof saved.promotionYears === 'number' ? saved.promotionYears : 0;
  const max = reached * PROMOTION_YEARS;
  // 값이 깨졌으면 올라 본 직급 수만큼, 예전 규칙(진급마다 2년)으로 쌓인 값이면 지금 규칙의 최대치로 줄임
  if (!Number.isFinite(saved.highestRank) || typeof saved.promotionYears !== 'number') return Math.max(recorded, max);
  return Math.min(recorded, max);
}

function load(): Progress {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return { ...freshProgress(), achievements: loadAchievements() };
    const saved = JSON.parse(s);
    // 능력치·요일이 없던 예전 저장본은 기본값으로 채움
    const log: LogEntry[] = Array.isArray(saved.log) ? saved.log : [];
    const post: string = typeof saved.post === 'string' && saved.post ? saved.post : pickPost(saved.rankIndex ?? 0);
    return toCycle({
      ...INITIAL_PROGRESS,
      ...saved,
      stats: { ...INITIAL_PROGRESS.stats, ...saved.stats },
      gender: saved.gender === 'male' ? 'male' : 'female',
      name: typeof saved.name === 'string' ? saved.name : '',
      // 첫 배정 기록이 없던 예전 저장본: 맨 앞에 넣음 (첫 근무처는 알 수 없어 새로 뽑음)
      log: log.some((e) => e.kind === 'start') ? log : [startEntry(pickPost(0)), ...log],
      // 근무처가 없던 예전 저장본은 현재 직급에 맞게 새로 배정
      post,
      // 기습 이벤트가 없던 예전 저장본: 이번 바퀴 남은 사건 차례에서 정함
      surpriseDays: Array.isArray(saved.surpriseDays) ? saved.surpriseDays : scheduleCycle(Math.random, (saved.day ?? 0) + 1),
      surpriseSeen: saved.surpriseSeen ?? {},
      counters: saved.counters ?? {},
      // 게임 기록 쪽과 브라우저 보관 쪽을 합침 (먼저 얻은 기록 우선)
      achievements: { ...(saved.achievements ?? {}), ...loadAchievements() },
      // 경력 연수: 판결 4건마다 1년 + 처음 오르는 직급 진급 때 1년 (예전 저장본은 지금 직급까지 진급 횟수로 추정)
      startYear: saved.startYear ?? new Date().getFullYear(),
      promotionYears: promotionYearsOf(saved),
      highestRank: Math.max(Number.isFinite(saved.highestRank) ? saved.highestRank : 0, saved.rankIndex ?? 0),
      yearsServed: yearsForVerdicts(saved.total ?? 0) + promotionYearsOf(saved),
    });
  } catch {
    return { ...freshProgress(), achievements: loadAchievements() };
  }
}

/** 기록 추가: 연차를 따로 정하지 않은 기록은 p(기록 시점)의 연차로. 첫 배정 기록은 항상 남긴다 */
const appendLog = (p: Progress, entries: LogEntry[], year = p.yearsServed + 1): Progress => {
  const all = [...p.log, ...entries.map((e) => ({ year, ...e }))];
  const start = all.find((e) => e.kind === 'start');
  const rest = all.filter((e) => e.kind !== 'start').slice(-(LOG_LIMIT - 1));
  return { ...p, log: start ? [start, ...rest] : rest };
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/**
 * 출제 우선순위: 안 푼 사건 중 현재 직급 난이도 → 안 푼 사건 전체 → 틀렸던 사건 → 아무거나 (직전 사건 제외)
 */
export function pickNextCase(progress: Progress, excludeId?: string): Case | undefined {
  const pool = CASES.filter((c) => c.id !== excludeId);
  const unsolved = pool.filter((c) => !progress.solved[c.id]);
  const wrong = pool.filter((c) => progress.solved[c.id] && !progress.solved[c.id].correct);
  const prefs = RANKS[progress.rankIndex]?.difficulties ?? [];
  const tiers = [...prefs.map((d) => unsolved.filter((c) => c.difficulty === d)), unsolved, wrong, pool, CASES];
  const tier = tiers.find((t) => t.length > 0);
  return tier && pick(tier);
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load);
  const ref = useRef(progress);
  ref.current = progress;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
      // 업적은 따로도 보관 (예전 저장본에만 있던 업적도 이때 옮겨짐)
      saveAchievements({ ...progress.achievements, ...loadAchievements() });
    } catch {
      /* 저장 불가 환경은 무시 */
    }
  }, [progress]);

  /** 해금되어 팝업으로 보여 줄 업적 (차례대로) */
  const [unlockQueue, setUnlockQueue] = useState<Achievement[]>([]);

  /** 상태 반영 + 새로 해금된 업적 처리 (해금 기록·팝업 대기열) */
  const commit = (next: Progress) => {
    const unlocked = newlyUnlocked(next, CASE_MAP);
    if (unlocked.length) {
      const year = next.yearsServed + 1;
      const achievements = { ...next.achievements };
      for (const a of unlocked) achievements[a.id] = { year };
      saveAchievements({ ...loadAchievements(), ...achievements });
      // 인생 기록에는 남기지 않음 (팝업과 업적판으로만)
      next = { ...next, achievements };
      setUnlockQueue((q) => [...q, ...unlocked]);
    }
    ref.current = next;
    setProgress(next);
  };
  const shiftUnlock = useCallback(() => setUnlockQueue((q) => q.slice(1)), []);

  /** 답안 기록 + 진급/강등 판정(능력치 효과 포함) */
  const recordAnswer = useCallback((c: Case, choiceId: string): Omit<VerdictOutcome, 'next'> => {
    const correct = choiceId === c.answerId;
    const p = ref.current;
    const { next, change, notes } = applyResult(
      {
        ...p,
        solved: { ...p.solved, [c.id]: { choiceId, correct } },
        correct: p.correct + (correct ? 1 : 0),
        total: p.total + 1,
      },
      correct,
    );
    // 판결은 판결한 해의 연차, 진급·강등 기록은 세월이 흐른 뒤의 연차
    const at = { week: p.week, day: p.day, year: p.yearsServed + 1 };
    const entries: LogEntry[] = [
      {
        ...at,
        kind: 'verdict',
        ok: correct,
        caseId: c.id,
        // 사건명만 (내 판결·정답은 남기지 않음, 적중/미적중은 꼬리표로)
        text: c.title,
      },
      ...notes.filter((t) => t !== RETIRE_NOTE).map((text): LogEntry => ({ ...at, kind: 'effect', text })),
    ];
    if (next.retired && !p.retired) {
      entries.push({
        ...at,
        year: next.yearsServed + 1,
        kind: 'retire',
        text: `만 ${RETIRE_AGE}세 정년으로 ${RANKS[next.rankIndex].name} 자리에서 퇴임했습니다.`,
      });
    }
    if (change) {
      const to = RANKS[change.to].name;
      entries.push({
        ...at,
        year: next.yearsServed + 1,
        kind: change.type,
        text:
          change.type === 'promote'
            ? // 처음 오르는 직급이면 진급 후 연차를 앞에 (예: 법관 4년차에 단독판사로 진급해 …)
              `${change.years ? `법관 ${next.yearsServed + 1}년차에 ` : ''}${to}${euro(to)} 진급해 ${change.post}${euro(change.post)} 발령받았습니다.`
            : `${to}${euro(to)} 좌천되어 ${change.post}${euro(change.post)} 발령받았습니다.`,
      });
    }
    commit(appendLog(next, entries));
    return { change, notes };
  }, []);

  /** 통찰력: 오답을 골랐을 때 다시 고를 기회가 생기는지 (사건당 한 번만 호출) */
  const rollInsight = useCallback(() => {
    const ok = rollEffect(ref.current.stats, 'insight', MAX_CHANCE.retry);
    if (ok) commit({ ...ref.current, counters: bump(ref.current.counters ?? {}, 'insightRetry') });
    return ok;
  }, []);

  const chooseActivity = useCallback((activityId: string) => {
    const p = ref.current;
    const a = WEEKEND_ACTIVITIES.find((x) => x.id === activityId);
    const next = applyActivity(p, activityId);
    if (!a || next === p) return;
    // 인생 기록에는 무엇을 했는지만 (능력치 변화는 남기지 않음)
    commit(appendLog(next, [{ week: p.week, day: p.day, kind: 'activity', tag: '활동', ok: true, text: a.logText }]));
  }, []);

  /** 기습 이벤트 참여(true)/거절(false) */
  const answerSurprise = useCallback((accepted: boolean): SurpriseOutcome | undefined => {
    const p = ref.current;
    const out = applySurprise(p, accepted);
    if (!out) return undefined;
    const at = { week: p.week, day: p.day };
    const entries: LogEntry[] = [
      {
        ...at,
        kind: 'event',
        // 꼬리표: 일반 이벤트는 "일정"(참여·거절은 문장으로), 유혹 이벤트는 수락 빨강·거절 초록
        ok: out.event.kind === 'temptation' ? !accepted : true,
        tag: out.event.kind === 'temptation' ? (accepted ? '제안 수락' : '제안 거절') : '일정',
        // 무슨 일이었고 어떻게 했는지 문장만 봐도 알도록 (예: "독감 걸린 동료 대신 당직을 섰습니다."). 능력치 변화는 남기지 않음
        text: accepted ? out.event.acceptText : out.event.declineText,
      },
    ];
    if (out.exposed && out.event.exposedText) entries.push({ ...at, kind: 'scandal', text: out.event.exposedText });
    commit(appendLog(out.next, entries));
    return out;
  }, []);

  /** 성별(직급 캐릭터 그림) 바꾸기. 처음부터 다시 해도 고른 성별은 유지 */
  const setGender = useCallback((gender: Gender) => commit({ ...ref.current, gender }), []);
  /** 판사 이름 정하기 (앞뒤 공백 제거, 최대 NAME_MAX자) */
  const setName = useCallback((name: string) => commit({ ...ref.current, name: name.trim().slice(0, NAME_MAX) }), []);

  // 처음부터 다시: 고른 성별과 모은 업적은 유지 (업적은 판을 넘어 모으는 수집품)
  const reset = useCallback(
    () => commit({ ...freshProgress(), gender: ref.current.gender, name: ref.current.name, achievements: { ...ref.current.achievements, ...loadAchievements() } }),
    [],
  );

  return { progress, recordAnswer, rollInsight, chooseActivity, answerSurprise, setGender, setName, reset, unlockQueue, shiftUnlock };
}
