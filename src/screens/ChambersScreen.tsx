import { useEffect, useRef, useState } from 'react';
import type { Case } from '../types/case';
import { RANKS, type Gender } from '../game/ranks';
import { CASES, pickNextCase } from '../game/store';
import {
  isFinished,
  isOver,
  isActivityTime,
  PROMOTE_REQUIRED,
  type Progress,
  currentSurprise,
  currentAge,
  currentYear,
  careerYear,
  type RankChange,
  type SurpriseOutcome,
  type VerdictOutcome,
} from '../game/progression';
import StatBars from '../components/StatBars';
import StatGuide from '../components/StatGuide';
import WeekendPanel from '../components/WeekendPanel';
import CasePanel from '../components/CasePanel';
import VerdictPanel from '../components/VerdictPanel';
import RankChangeModal from '../components/RankChangeModal';
import GameGuide from '../components/GameGuide';
import MuteButton from '../components/MuteButton';
import ThemeButton from '../components/ThemeButton';
import CourtBanner from '../components/CourtBanner';
import JudgeCard from '../components/JudgeCard';
import CareerMap from '../components/CareerMap';
import CaseLog from '../components/CaseLog';
import { playGavel } from '../game/sound';
import type { SurpriseEvent } from '../game/surpriseEvents';
import SurpriseModal from '../components/SurpriseModal';
import AchievementsPanel from '../components/AchievementsPanel';
import AchievementPopup from '../components/AchievementPopup';
import type { Achievement } from '../game/achievements';

interface Props {
  progress: Progress;
  recordAnswer: (c: Case, choiceId: string) => Omit<VerdictOutcome, 'next'>;
  rollInsight: () => boolean;
  chooseActivity: (activityId: string) => void;
  answerSurprise: (accepted: boolean) => SurpriseOutcome | undefined;
  setGender: (g: Gender) => void;
  setName: (name: string) => void;
  /** 팝업으로 보여 줄 해금 업적 (대기열 맨 앞) */
  unlocked?: Achievement;
  onUnlockSeen: () => void;
  onReset: () => void;
}

/** 선고 애니메이션(의사봉)이 끝난 뒤 직급 변동 모달을 띄우는 지연 */
const MODAL_DELAY_MS = 900;

/** 배당받고 아직 선고하지 않은 사건: 집무실로 돌아갔다가 다시 배당받으면 이 사건이 그대로 나온다 */
const PENDING_KEY = 'supreme-justice:pending';
function loadPending(): Case | null {
  try {
    const id = localStorage.getItem(PENDING_KEY);
    return CASES.find((c) => c.id === id) ?? null;
  } catch {
    return null;
  }
}
function savePending(c: Case | null) {
  try {
    if (c) localStorage.setItem(PENDING_KEY, c.id);
    else localStorage.removeItem(PENDING_KEY);
  } catch {
    /* 저장 불가(사생활 보호 모드 등)면 이번 세션 동안만 유지 */
  }
}

export default function ChambersScreen({ progress, recordAnswer, rollInsight, chooseActivity, answerSurprise, setGender, setName, unlocked, onUnlockSeen, onReset }: Props) {
  const [active, setActive] = useState<Case | null>(null);
  const [pending, setPending] = useState<Case | null>(loadPending);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [change, setChange] = useState<RankChange | null>(null);
  /** 화면에 띄운 기습 이벤트 (답한 뒤 결과를 보여 주는 동안에도 유지) */
  const [openSurprise, setOpenSurprise] = useState<{ event: SurpriseEvent; when: string } | null>(null);
  /** 능력치 효과 발동 안내 (판결 결과에 표시) */
  const [notes, setNotes] = useState<string[]>([]);
  /** 통찰력 발동으로 다시 고르는 중: 앞서 고른 오답 */
  const [retryBlocked, setRetryBlocked] = useState<string[]>([]);
  const [retryUsed, setRetryUsed] = useState(false);
  const caseRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);

  const rank = RANKS[progress.rankIndex];
  /** 게임 끝: 대법원장 취임 또는 정년 퇴임 */
  const finished = isOver(progress);
  const weekend = isActivityTime(progress.day);
  const rate = progress.total ? Math.round((progress.correct / progress.total) * 100) : 0;

  const holdPending = (c: Case | null) => {
    setPending(c);
    savePending(c);
  };

  const assign = () => {
    // 선고하지 않고 덮어 둔 사건이 있으면 그 사건부터
    const c = (!active && pending) || pickNextCase(progress, active?.id);
    if (!c) return;
    holdPending(c);
    setActive(c);
    setSubmittedId(null);
    setNotes([]);
    setRetryBlocked([]);
    setRetryUsed(false);
  };

  const submit = (choiceId: string) => {
    if (!active) return;
    // 통찰력: 오답이면 사건당 한 번, 확률에 따라 넘어가지 않고 다시 고를 기회 (선고 전이므로 판사봉 소리 없음)
    if (choiceId !== active.answerId && !retryUsed) {
      setRetryUsed(true);
      if (rollInsight()) {
        setRetryBlocked([choiceId]);
        return;
      }
    }
    playGavel();
    holdPending(null);
    setSubmittedId(choiceId);
    const { change: ch, notes: n } = recordAnswer(active, choiceId);
    setNotes(n);
    if (ch) window.setTimeout(() => setChange(ch), MODAL_DELAY_MS);
  };

  const closeCase = () => {
    setActive(null);
    setSubmittedId(null);
    setNotes([]);
    setRetryBlocked([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 기습 이벤트: 집무실에 있을 때(사건을 열지 않았고 직급 변동 모달이 없을 때) 띄운다
  const surprise = currentSurprise(progress);
  useEffect(() => {
    if (surprise && progress.surprise && !active && !change && !openSurprise)
      setOpenSurprise({ event: surprise, when: `${currentYear(progress)}년 · 법관 ${careerYear(progress)}년차` });
  }, [surprise, progress.surprise, active, change, openSurprise]);

  // 새 사건이 배당되면 사건 기록으로, 선고하면 내가 고른 보기(적중/미적중 도장)로 스크롤
  useEffect(() => {
    if (active && !submittedId) caseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [active, submittedId]);
  useEffect(() => {
    if (!submittedId) return;
    const target = document.querySelector('.pick-result') ?? verdictRef.current;
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [submittedId]);

  // 대법원장까지 진행도: 지금까지 채운 적중 수 / 전체 필요 적중 수
  const totalNeed = PROMOTE_REQUIRED.reduce((a, b) => a + b, 0);
  const doneNeed = isFinished(progress.rankIndex)
    ? totalNeed
    : PROMOTE_REQUIRED.slice(0, progress.rankIndex).reduce((a, b) => a + b, 0) + progress.levelCorrect;

  return (
    <main className={`screen chambers dashboard${active ? ' is-trial' : ''}`}>
      <CourtBanner />
      <header className="app-header topbar">
        <h1 className="app-title">
          <span className="app-emblem" aria-hidden>
            ⚖
          </span>
          대법관 키우기
        </h1>
        <div className="topbar-progress">
          <span className="topbar-status">
            {currentYear(progress)}년 · 법관 {careerYear(progress)}년차
          </span>
          <span
            className="topbar-bar"
            role="progressbar"
            aria-label="대법원장까지"
            aria-valuemin={0}
            aria-valuemax={totalNeed}
            aria-valuenow={doneNeed}
          >
            <span style={{ width: `${(doneNeed / totalNeed) * 100}%` }} />
          </span>
          <span className="topbar-goal">대법원장까지</span>
        </div>
        <div className="header-right">
          <span key={active ? 'court' : 'office'} className="header-label">
            {active ? '재판장' : '집무실'}
          </span>
          <ThemeButton />
          <MuteButton />
        </div>
      </header>

      <div className="dash">
        <aside className="dash-left">
          <JudgeCard progress={progress} onGender={setGender} onName={setName} />
          <section className="dash-card status-card">
            <div className="dash-card-head">
              <h2 className="dash-card-title">상태</h2>
            </div>
            <StatBars stats={progress.stats} />
            <StatGuide />
            <dl className="stats">
              <Stat value={progress.total} label="판결" />
              <Stat value={progress.correct} label="적중" />
              <Stat value={`${rate}%`} label="적중률" />
            </dl>
          </section>
          <AchievementsPanel progress={progress} />
          {progress.total > 0 && !finished && (
            <button
              className="btn-link reset-link"
              onClick={() => {
                if (confirm('직급과 전적을 모두 지우고 처음부터 시작할까요?')) {
                  onReset();
                  holdPending(null);
                  closeCase();
                }
              }}
            >
              기록 초기화
            </button>
          )}
        </aside>

        <section className="dash-main">
          {active ? (
            <>
              <div ref={caseRef} className="scroll-anchor">
                <CasePanel
                  key={active.id}
                  data={active}
                  submittedId={submittedId}
                  blockedIds={retryBlocked}
                  notice={retryBlocked.length > 0 && !submittedId ? '선고 직전, 날카로운 통찰력으로 판단을 다시 돌아볼 기회를 얻었습니다.' : undefined}
                  onSubmit={submit}
                  onClose={closeCase}
                />
              </div>
              {submittedId && (
                <div ref={verdictRef} className="scroll-anchor">
                  <VerdictPanel
                    data={active}
                    choiceId={submittedId}
                    notes={notes}
                    onClose={closeCase}
                  />
                </div>
              )}
            </>
          ) : finished ? (
            <section className="ending">
              {isFinished(progress.rankIndex) ? (
                <>
                  <h2>🏛️ 대법원장 취임</h2>
                  <p>
                    {progress.name && `${progress.name} 판사는 `}법관 생활 {progress.yearsServed}년, {progress.total}건의 판결 끝에 {currentAge(progress)}세에 사법부의 수장에
                    올랐습니다. 적중률 {rate}%.
                  </p>
                </>
              ) : (
                <>
                  <h2>정년 퇴임</h2>
                  <p>
                    {progress.name && `${progress.name} 판사는 `}만 {currentAge(progress)}세, 법관 생활 {progress.yearsServed}년을 마치고 {rank.name} 자리에서 법복을
                    벗었습니다. 판결 {progress.total}건, 적중률 {rate}%.
                  </p>
                </>
              )}
              <button
                className="btn btn-primary btn-large"
                onClick={() => {
                  if (confirm('처음부터 다시 시작할까요? 직급과 전적이 초기화됩니다.')) onReset();
                }}
              >
                처음부터 다시
              </button>
            </section>
          ) : weekend ? (
            <WeekendPanel progress={progress} onChoose={chooseActivity} />
          ) : CASES.length === 0 ? (
            <p className="empty-note">배당할 사건이 없습니다. npm run data:build 로 사건을 준비하세요.</p>
          ) : (
            <section className="dash-card today-card">
              <div className="dash-card-head">
                <h2 className="dash-card-title">오늘의 재판</h2>
                <span className="dash-card-sub">
                  {currentYear(progress)}년
                </span>
              </div>
              <p className="today-text">
                {pending
                  ? `선고하지 않고 덮어 둔 사건이 있습니다: 「${pending.title}」`
                  : '오늘 배당될 사건이 기다리고 있습니다. 사건 기록을 읽고 판결을 내려 주세요.'}
              </p>
              <button className="btn btn-primary btn-large" onClick={assign} disabled={!!progress.surprise}>
                {pending ? '보류한 사건 다시 보기' : '사건 배당받기'}
              </button>
            </section>
          )}
          {/* 집무실에서만: 오늘의 재판(또는 활동 선택) 아래 인생 기록 */}
          {!active && <CaseLog log={progress.log} />}
        </section>

        <aside className="dash-right">
          <CareerMap progress={progress} />
          <GameGuide currentRank={progress.rankIndex} gender={progress.gender} />
        </aside>
      </div>

      {change && <RankChangeModal change={change} gender={progress.gender} onClose={() => setChange(null)} />}
      {/* 업적 팝업: 직급 변동·기습 일정 창이 없을 때 차례로 */}
      {unlocked && !change && !openSurprise && <AchievementPopup a={unlocked} onClose={onUnlockSeen} />}
      {openSurprise && !change && (
        <SurpriseModal
          event={openSurprise.event}
          when={openSurprise.when}
          onAnswer={answerSurprise}
          onClose={() => setOpenSurprise(null)}
        />
      )}
    </main>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="stat">
      <dt className="stat-label">{label}</dt>
      <dd className="stat-value">{value}</dd>
    </div>
  );
}

