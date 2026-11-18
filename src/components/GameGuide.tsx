import { RANKS, MAX_RANK, rankImage, type Gender } from '../game/ranks';
import { PROMOTE_REQUIRED } from '../game/progression';

export default function GameGuide({ currentRank, gender }: { currentRank: number; gender: Gender }) {
  return (
    <section className="guide">
      <h2 className="guide-title">게임 안내</h2>
      <div className="guide-body">
        <p>
          실제 판결문으로 만든 사건이 배당됩니다. 사건 기록(개요·증거·쟁점)을 읽고{' '}
          <strong>법원이 실제로 내린 판결</strong>을 맞혀 보세요.
        </p>
      </div>

      <h3 className="guide-subtitle">직급</h3>
      <ol className="ladder">
        {RANKS.map((r, i) => {
          const reached = i <= currentRank;
          return (
            <li key={r.id} className={`ladder-row${i === currentRank ? ' current' : ''}${reached ? '' : ' locked'}`}>
              <span className="ladder-lv">Lv.{i + 1}</span>
              <img className="character ladder-img" src={rankImage(r, gender)} alt="" />
              <span className="ladder-name">{r.name}</span>
              <span className="ladder-rule">
                {i === MAX_RANK
                  ? '최종 목표'
                  : `${PROMOTE_REQUIRED[i]}건 적중 시 진급`}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
