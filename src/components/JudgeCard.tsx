import { useState } from 'react';
import { GENDER_NAMES, RANKS, rankImage, type Gender } from '../game/ranks';
import { NAME_MAX } from '../game/store';
import { canDemote, careerYear, currentAge, DEMOTE_WRONG, isOver, PROMOTE_REQUIRED, type Progress } from '../game/progression';

/** 법관 신분증: 직급 그림·직급·근무처·경력(연차·나이)·진급/오판 현황 */
interface Props {
  progress: Progress;
  onGender: (g: Gender) => void;
  onName: (name: string) => void;
}

export default function JudgeCard({ progress, onGender, onName }: Props) {
  const rank = RANKS[progress.rankIndex];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(progress.name);
  const save = () => {
    onName(draft);
    setEditing(false);
  };
  const finished = isOver(progress);
  return (
    <section className="dash-card idcard">
      <div className="idcard-strip">
        <span>법관 신분 기록</span>
        {/* 성별: 직급 캐릭터 그림 (언제든 바꿀 수 있음) */}
        <span className="gender-toggle" role="radiogroup" aria-label="캐릭터 성별">
          {(Object.keys(GENDER_NAMES) as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={progress.gender === g}
              className={progress.gender === g ? 'is-on' : ''}
              onClick={() => onGender(g)}
            >
              {GENDER_NAMES[g]}
            </button>
          ))}
        </span>
      </div>
      <div className="idcard-body">
        <div className="idcard-photo">
          <img key={`${rank.id}-${progress.gender}`} className="character profile-character" src={rankImage(rank, progress.gender)} alt={rank.name} />
        </div>
        <div className="idcard-info">
          <strong key={rank.id} className="profile-rank">
            {rank.name}
          </strong>
          {/* 근무처는 한 줄 (목록은 이 폭에 들어가는 이름만: game/posts.ts) */}
          <dl className="idcard-fields">
            <dt>이름</dt>
            <dd>
              {editing ? (
                <input
                  className="name-input"
                  autoFocus
                  value={draft}
                  maxLength={NAME_MAX}
                  placeholder="이름"
                  aria-label="판사 이름"
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={save}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') save();
                    if (e.key === 'Escape') setEditing(false);
                  }}
                />
              ) : (
                <button
                  type="button"
                  className={`name-btn${progress.name ? '' : ' is-empty'}`}
                  title="이름 바꾸기"
                  onClick={() => {
                    setDraft(progress.name);
                    setEditing(true);
                  }}
                >
                  {progress.name || '이름 정하기'} <span aria-hidden>✎</span>
                </button>
              )}
            </dd>
            <dt>근무처</dt>
            <dd>{progress.post}</dd>
            <dt>경력</dt>
            <dd>
              법관 {careerYear(progress)}년차 · {currentAge(progress)}세
            </dd>
          </dl>
        </div>
      </div>
      <div className="idcard-progress">
        {finished ? (
          <span className="profile-note">{progress.exit?.kind === 'politics'
              ? '법복을 벗고 정계로 떠났습니다'
              : progress.exit?.kind === 'lawfirm'
                ? '법복을 벗고 로펌으로 떠났습니다'
                : progress.retired
                  ? '정년 퇴임했습니다'
                  : '최고 직급에 올랐습니다'}</span>
        ) : (
          <>
            <Pips label="진급까지" filled={progress.levelCorrect} total={PROMOTE_REQUIRED[progress.rankIndex]} kind="up" />
            {canDemote(progress.rankIndex) && (
              <Pips label="오판" filled={progress.levelWrong} total={DEMOTE_WRONG} kind="down" />
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Pips({ label, filled, total, kind }: { label: string; filled: number; total: number; kind: 'up' | 'down' }) {
  return (
    <div className={`pips pips-${kind}`} aria-label={`${label} ${filled}/${total}`}>
      <span className="pips-label">{label}</span>
      <span className="pips-row">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`pip${i < filled ? ' on' : ''}`} />
        ))}
      </span>
      <span className="pips-count">
        {filled}/{total}
      </span>
    </div>
  );
}
