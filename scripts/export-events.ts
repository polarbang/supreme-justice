/**
 * 이벤트 표 문서 만들기: 기습 이벤트 + 활동을 코드에서 읽어 docs/EVENTS.md 로 쓴다.
 * 이벤트·수치를 바꾼 뒤 다시 실행하면 문서가 코드와 같아진다.
 *   npm run docs:events
 */
import { writeFileSync } from 'node:fs';
import { RANK_NAMES } from '../src/game/rankNames';
import { STAT_NAMES, type StatId } from '../src/game/stats';
import {
  EXITS,
  POLITICAL_EVENTS,
  SURPRISE_COOLDOWN_CYCLES,
  SURPRISE_COST,
  SURPRISE_EVENTS,
  SURPRISE_GAIN,
  SURPRISE_CHANCE_PER_CYCLE,
  TEMPT_COST,
  TEMPT_EXPOSE_CHANCE,
  TEMPT_GAIN,
  TEMPT_SHARE,
  type SurpriseEvent,
} from '../src/game/surpriseEvents';
import { ACTIVITY_COST, ACTIVITY_GAIN, WEEKEND_ACTIVITIES } from '../src/game/weekendActivities';

const OUT = 'docs/EVENTS.md';
const MAX = RANK_NAMES.length - 1;
const s = (id: StatId) => STAT_NAMES[id];
const pct = (v: number) => `${Math.round(v * 100)}%`;

function rankRange(min = 0, max = MAX) {
  if (min === 0 && max === MAX) return '모든 직급';
  if (min === max) return `Lv.${min + 1} ${RANK_NAMES[min]}`;
  return `Lv.${min + 1}~${max + 1} (${RANK_NAMES[min]}~${RANK_NAMES[max]})`;
}

const STAT_ORDER: StatId[] = ['insight', 'network', 'reputation', 'health'];
const cell = (t: string) => t.replace(/\|/g, '\\|');

function eventRow(e: SurpriseEvent) {
  const accept =
    e.kind === 'temptation'
      ? `${s(e.main)} +${TEMPT_GAIN}, 평판 −${TEMPT_COST} (알려지면 평판 −${TEMPT_COST} 추가)`
      : `${s(e.main)} +${SURPRISE_GAIN}, ${s(e.cost)} −${SURPRISE_COST}`;
  const decline = e.declineCost ? `${s(e.declineCost)} −${SURPRISE_COST}` : '변화 없음';
  const exit = EXITS[e.id];
  const exitNote = exit ? `<br>**${exit.chance >= 1 ? '' : `${pct(exit.chance)} 확률로 `}법복을 벗고 떠남: ${exit.endings.map((x) => x.title).join(' / ')}${exit.endings.length > 1 ? ' 각 ' + pct(1 / exit.endings.length) : ''}**` : '';
  const req = e.requires ? `<br>(${SURPRISE_EVENTS.find((x) => x.id === e.requires)!.name}을 수락한 판에서만)` : '';
  return `| ${rankRange(e.minRank, e.maxRank)} | **${cell(e.name)}**${req} | ${cell(e.description)} | ${accept}${exitNote} | ${decline} |`;
}

// 모든 직급 이벤트를 먼저, 나머지는 낮은 직급부터
const groupOrder = (e: SurpriseEvent) =>
  e.minRank === undefined && e.maxRank === undefined ? [-1, -1] : [e.minRank ?? 0, e.maxRank ?? MAX];
const sorted = (list: SurpriseEvent[]) =>
  [...list].sort((a, b) => {
    const [a1, a2] = groupOrder(a);
    const [b1, b2] = groupOrder(b);
    return a1 - b1 || a2 - b2;
  });

const normal = sorted(SURPRISE_EVENTS.filter((e) => e.kind === 'normal'));
const tempt = sorted(SURPRISE_EVENTS.filter((e) => e.kind === 'temptation'));
const head = '| 직급 | 이벤트 | 상황 | 참여하면 | 거절하면 |\n|---|---|---|---|---|';

const weekendRows = [...WEEKEND_ACTIVITIES]
  .sort((a, b) => STAT_ORDER.indexOf(a.main) - STAT_ORDER.indexOf(b.main) || (a.minRank ?? 0) - (b.minRank ?? 0))
  .map(
    (a) =>
      `| ${s(a.main)} | ${a.minRank ? `Lv.${a.minRank + 1} ${RANK_NAMES[a.minRank]} 이상` : '모든 직급'} | **${cell(a.name)}** | ${cell(a.description)} | ${s(a.main)} +${ACTIVITY_GAIN}, ${s(a.cost)} −${ACTIVITY_COST} |`,
  );

const md = `# 이벤트 표

> 이 문서는 \`npm run docs:events\`로 코드(\`src/game/surpriseEvents.ts\`, \`src/game/weekendActivities.ts\`)에서 자동으로 만든다. 직접 고치지 말고 코드를 고친 뒤 다시 실행할 것.

## 1. 기습 이벤트

### 규칙

| 항목 | 값 |
|---|---|
| 횟수 | 사건 3건(한 바퀴) 동안 최대 1회. 바퀴마다 ${pct(SURPRISE_CHANCE_PER_CYCLE)} 확률로, 3건 중 무작위 차례에 뜸 (첫 바퀴는 두 번째 사건부터) |
| 시점 | 그날 아침 집무실에서, 사건 배당 전에 뜬다. 답하기 전에는 사건을 배당받을 수 없다 |
| 선택 | 이벤트 하나에 **참여한다 / 거절한다** 중 하나 |
| 일반 이벤트 참여 | 주 능력치 +${SURPRISE_GAIN}, 다른 능력치 −${SURPRISE_COST} |
| 거절 | 변화 없음, 또는 능력치 하나 −${SURPRISE_COST} (윗사람 부탁·공식 요구 등) |
| 유혹 이벤트 참여 | 주 능력치 +${TEMPT_GAIN}, 평판 −${TEMPT_COST}. ${pct(TEMPT_EXPOSE_CHANCE)} 확률로 바로 알려져 평판 −${TEMPT_COST} 추가 |
| 유혹 이벤트 비중 | 그날 뽑히는 이벤트의 약 ${pct(TEMPT_SHARE)} |
| 반복 방지 | 같은 이벤트는 사건 ${SURPRISE_COOLDOWN_CYCLES * 3}건(${SURPRISE_COOLDOWN_CYCLES}바퀴) 안에 다시 나오지 않음. 정치권 제안(${[...POLITICAL_EVENTS].map((id) => SURPRISE_EVENTS.find((e) => e.id === id)!.name).join(', ')})은 한 판에 한 번씩만 |
| 건강 40 미만 | 참여 시 건강이 깎이는 이벤트는 나오지 않음 |
| 중도 퇴장 엔딩 | 일부 제안은 응하면 법복을 벗고 떠나 게임이 끝남 (정계 진출·로펌 파트너). 표의 "참여하면" 칸에 표시 |

### 일반 이벤트 (${normal.length}개)

${head}
${normal.map(eventRow).join('\n')}

### 유혹 이벤트 (${tempt.length}개)

실제로 판사에게 생길 수 있지만 대중이 곱게 보지 않는 일. 당장 이득은 크지만 평판을 잃고, 들통날 수 있다.

${head}
${tempt.map(eventRow).join('\n')}

## 2. 활동 (${WEEKEND_ACTIVITIES.length}개)

사건 3건을 마칠 때마다 1번, 능력치별 1개씩 4개 중 고른다. 직전에 나온 활동은 되도록 빼고, 건강이 40 미만이면 건강 활동만 나온다.

| 올리는 능력치 | 직급 조건 | 활동 | 설명 | 효과 |
|---|---|---|---|---|
${weekendRows.join('\n')}
`;

writeFileSync(OUT, md);
console.log(`${OUT}: 기습 이벤트 ${SURPRISE_EVENTS.length}개(일반 ${normal.length}, 유혹 ${tempt.length}), 활동 ${WEEKEND_ACTIVITIES.length}개`);
