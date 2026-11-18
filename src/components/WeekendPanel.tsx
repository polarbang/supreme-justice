import { offeredActivities, type Progress } from '../game/progression';
import { HEALTH_REST_ONLY_BELOW, STAT_NAMES } from '../game/stats';
import { ACTIVITY_COST, ACTIVITY_GAIN } from '../game/weekendActivities';

interface Props {
  progress: Progress;
  onChoose: (activityId: string) => void;
}

/** 사건 3건을 마칠 때마다: 활동 하나 고르기 */
export default function WeekendPanel({ progress, onChoose }: Props) {
  const choices = offeredActivities(progress);
  const restOnly = progress.stats.health < HEALTH_REST_ONLY_BELOW;

  return (
    <section className="weekend" key={progress.week}>
      <div className="weekend-head">
        <span className="case-label">활동 선택</span>
        <h2 className="weekend-title">재판 없는 하루, 무엇을 할까요?</h2>
        {restOnly && <p className="weekend-warn">건강이 {HEALTH_REST_ONLY_BELOW} 아래라 몸을 돌보는 일만 할 수 있습니다.</p>}
      </div>

      <div className="activity-list">
        {choices.map((a) => (
          <button key={a.id} className={`activity activity-${a.main}`} onClick={() => onChoose(a.id)}>
            <span className="activity-name">{a.name}</span>
            <span className="activity-desc">{a.description}</span>
            <span className="activity-effects">
              {/* 오르는 능력치: 그 능력치 색 / 내리는 능력치: 빨강 */}
              <span className="effect up stat-pill">
                {STAT_NAMES[a.main]} +{ACTIVITY_GAIN}
              </span>
              <span className="effect down">
                {STAT_NAMES[a.cost]} −{ACTIVITY_COST}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
