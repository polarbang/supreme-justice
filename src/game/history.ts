/**
 * 지난 경력: 한 판이 끝날 때(대법원장 취임·정년 퇴임·정계 진출·로펌 이직) 요약을 이 브라우저에 남긴다. 최근 HISTORY_MAX판만.
 * 게임 기록과 따로 보관해서 처음부터 다시 해도 남는다.
 */
import { count, isFinished, START_AGE, type Progress } from './progression';
import { exitEnding } from './surpriseEvents';

export interface CareerRecord {
  /** 끝난 시각 (ISO) */
  endedAt: string;
  outcome: 'chief' | 'retired' | 'politics' | 'lawfirm';
  /** 중도 퇴장 엔딩 제목 (예: 국회의원 당선, 총선 낙선, 입각) */
  exitTitle?: string;
  name: string;
  /** 마지막 직급 (RANKS 인덱스) */
  rankIndex: number;
  /** 올라 본 가장 높은 직급 */
  highestRank: number;
  total: number;
  correct: number;
  /** 법관 생활 햇수 */
  years: number;
  /** 끝났을 때 나이 */
  age: number;
  demotions: number;
}

const KEY = 'supreme-justice:history';
export const HISTORY_MAX = 3;

export function loadHistory(): CareerRecord[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(list) ? list.slice(0, HISTORY_MAX) : [];
  } catch {
    return [];
  }
}

/** 끝난 판 하나를 맨 앞에 추가하고, 저장된 목록(최신순)을 돌려준다 */
export function pushHistory(p: Progress): CareerRecord[] {
  const record: CareerRecord = {
    endedAt: new Date().toISOString(),
    outcome: p.exit?.kind ?? (isFinished(p.rankIndex) ? 'chief' : 'retired'),
    exitTitle: p.exit && exitEnding(p.exit)?.title,
    name: p.name,
    rankIndex: p.rankIndex,
    highestRank: Math.max(p.highestRank, p.rankIndex),
    total: p.total,
    correct: p.correct,
    years: p.yearsServed,
    age: START_AGE + p.yearsServed,
    demotions: count(p, 'demotions'),
  };
  const list = [record, ...loadHistory()].slice(0, HISTORY_MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 저장 불가 환경은 이번 화면에서만 보여 줌 */
  }
  return list;
}
