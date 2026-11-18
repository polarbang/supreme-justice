import { CORRECT_INSIGHT_GAIN, HEALTH_HALF_CHANCE_BELOW, HEALTH_REST_ONLY_BELOW, VERDICT_HEALTH_COST } from '../game/stats';

/** 상태 카드 아래 여닫이 설명: 능력치가 무엇을 뜻하는지 (건강 수치는 game/stats.ts 상수에서) */
export default function StatGuide() {
  return (
    <details className="stat-guide">
      <summary>상태는 무엇을 뜻하나요?</summary>
      <dl className="stat-guide-list">
        <dt className="stat-insight">통찰력</dt>
        <dd>
          판결을 적중할 때마다 {CORRECT_INSIGHT_GAIN}씩 오릅니다. 오답을 골라 선고하면, 넘어가지 않고 다시 고를 기회를 얻을 수
          있습니다. (사건당 1번)
        </dd>
        <dt className="stat-network">인맥</dt>
        <dd>강등될 상황에서 강등을 면할 수 있습니다.</dd>
        <dt className="stat-reputation">평판</dt>
        <dd>적중 수를 다 채우지 않아도 진급하거나, 진급할 때 두 단계 오를 수 있습니다.</dd>
        <dt className="stat-health">건강</dt>
        <dd>
          판결 1건마다 {VERDICT_HEALTH_COST}씩 줄어듭니다. {HEALTH_HALF_CHANCE_BELOW} 미만이면 다른 능력치의 효과가 잘 나타나지
          않고, {HEALTH_REST_ONLY_BELOW} 미만이면 활동을 고를 때 몸을 돌보는 활동만 할 수 있습니다.
        </dd>
      </dl>
    </details>
  );
}
