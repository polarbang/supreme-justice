import { HEALTH_REST_ONLY_BELOW, type StatId, type Stats } from './stats';

/**
 * 활동: 사건 3건을 마칠 때마다 한 번 고른다 (예전 "주말 활동", 코드 이름은 그대로).
 * 효과는 활동 종류와 상관없이 일정: 주 능력치 +GAIN, 대가로 다른 능력치 하나 −COST.
 * (어떤 능력치가 깎이는지만 활동마다 다르고, 설명에 그 이유가 드러나게 쓴다)
 * minRank: 이 직급(RANKS 인덱스) 이상에서만 등장. 0 배석판사 … 6 대법관
 */
export const ACTIVITY_GAIN = 8;
export const ACTIVITY_COST = 4;

export interface WeekendActivity {
  id: string;
  /** 올라가는 능력치 (+ACTIVITY_GAIN) */
  main: StatId;
  /** 깎이는 능력치 (−ACTIVITY_COST) */
  cost: StatId;
  name: string;
  description: string;
  minRank?: number;
  /** 인생 기록에 남길 문장 (무엇을 했는지, 능력치 숫자 없이) */
  logText: string;
}

export const WEEKEND_ACTIVITIES: WeekendActivity[] = [
  // ───────── 통찰력 ─────────
  { id: 'study-group', main: 'insight', cost: 'health', name: '판례 스터디 모임', description: '동료 판사들과 최신 판례를 놓고 새벽까지 토론하느라 잠이 모자랐다.', logText: '판례 스터디 모임에서 최신 판례를 놓고 토론하며 판단력을 길렀습니다.' },
  { id: 'all-nighter', main: 'insight', cost: 'health', name: '밤샘 기록 검토', description: '다음 사건 기록을 미리 펼쳐 놓고 꼬박 밤을 새웠다.', logText: '밤을 새워 다음 사건 기록을 미리 검토했습니다.' },
  { id: 'conference', main: 'insight', cost: 'health', name: '법학 학술대회 참석', description: '하루 종일 발표를 받아 적느라 녹초가 됐다.', logText: '법학 학술대회에 참석해 새로운 학설을 공부했습니다.' },
  { id: 'forensic', main: 'insight', cost: 'health', name: '법의학 세미나', description: '부검 사례를 들여다보다 속이 울렁거려 밥을 걸렀다.', logText: '법의학 세미나에서 부검 사례를 배우며 사건을 보는 눈을 넓혔습니다.' },
  { id: 'prison-visit', main: 'insight', cost: 'health', name: '교정시설 참관', description: '선고 이후 수형자들의 생활을 둘러보느라 하루 종일 걸었다.', logText: '교정시설을 참관하며 선고 이후의 삶을 직접 보았습니다.' },
  { id: 'library', main: 'insight', cost: 'network', name: '법원도서관에서 독서', description: '모임 약속을 모두 미루고 열람실에 틀어박혔다.', logText: '법원도서관에 틀어박혀 책을 읽으며 생각을 정리했습니다.' },
  { id: 'psychology', main: 'insight', cost: 'network', name: '범죄심리학 강좌 수강', description: '사람이 왜 거짓말을 하는지 배웠다. 대신 동기 모임은 빠졌다.', logText: '범죄심리학 강좌를 들으며 사람이 거짓말하는 이유를 배웠습니다.' },
  { id: 'self-review', main: 'insight', cost: 'network', name: '지난 판결문 다시 읽기', description: '혼자 지난 판결을 곱씹느라 걸려 온 전화를 다 놓쳤다.', logText: '지난 판결문을 다시 읽으며 스스로의 판단을 되짚었습니다.' },
  { id: 'court-drama', main: 'insight', cost: 'reputation', name: '법정 드라마 정주행', description: '"판사가 주말 내내 드라마만 본다"는 소문이 돌았다.', logText: '법정 드라마를 정주행하며 재판을 다른 눈으로 보았습니다.' },
  { id: 'elder-judge', main: 'insight', cost: 'health', name: '원로 법관 찾아뵙기', description: '지방까지 먼 길을 오가며 대선배의 이야기를 들었다.', minRank: 1, logText: '원로 법관을 찾아뵙고 오래된 재판 이야기를 들었습니다.' },
  { id: 'redpen', main: 'insight', cost: 'network', name: '배석판사 판결문 첨삭', description: '후배들 판결문에 빨간 펜을 들었다. 지적이 많아 원성을 샀다.', minRank: 2, logText: '배석판사의 판결문을 첨삭하며 다시 한번 법리를 다졌습니다.' },
  { id: 'overseas', main: 'insight', cost: 'network', name: '해외 법원 연수', description: '외국 재판 제도를 배우는 사이, 국내 모임에서는 잊힌 사람이 됐다.', minRank: 3, logText: '해외 법원 연수를 다녀오며 다른 나라의 재판을 배웠습니다.' },
  { id: 'policy-paper', main: 'insight', cost: 'health', name: '사법정책 세미나 발제', description: '발제문을 다듬느라 주말 내내 책상 앞을 떠나지 못했다.', minRank: 4, logText: '사법정책 세미나에서 발제를 맡아 제도를 깊이 들여다보았습니다.' },
  { id: 'en-banc-prep', main: 'insight', cost: 'health', name: '전원합의체 판례 예습', description: '대법원 전원합의체 판결을 처음부터 끝까지 읽느라 눈이 충혈됐다.', minRank: 5, logText: '전원합의체에 오를 판례를 미리 공부했습니다.' },

  // ───────── 인맥 ─────────
  { id: 'classmates', main: 'network', cost: 'health', name: '연수원 동기 모임', description: '오랜만에 동기들과 새벽까지 술잔을 기울였다.', logText: '연수원 동기 모임에 나가 오랜만에 근황을 나눴습니다.' },
  { id: 'condolence', main: 'network', cost: 'health', name: '선배 판사 댁 경조사 참석', description: '왕복 다섯 시간 운전해 얼굴을 비췄다.', logText: '선배 판사 댁 경조사에 찾아가 마음을 전했습니다.' },
  { id: 'hiking-club', main: 'network', cost: 'health', name: '법조인 등산회', description: '선후배들과 정상까지 올랐다. 다리가 후들거린다.', logText: '법조인 등산회를 따라 산에 오르며 선후배와 가까워졌습니다.' },
  { id: 'sports-day', main: 'network', cost: 'health', name: '법원 체육대회', description: '족구 결승에서 몸을 날리다 허리를 삐끗했다.', logText: '법원 체육대회에 나가 동료들과 땀을 흘렸습니다.' },
  { id: 'moving-help', main: 'network', cost: 'health', name: '선배 이삿짐 돕기', description: '책 상자만 수십 개를 날랐다. 온몸이 쑤신다.', logText: '선배의 이삿짐을 날라 주며 정을 쌓았습니다.' },
  { id: 'lawyer-dinner', main: 'network', cost: 'reputation', name: '변호사 동창과 저녁 식사', description: '즐거운 자리였지만 "재판 중인 변호사와 어울린다"는 뒷말이 나왔다.', logText: '변호사가 된 동창과 저녁을 먹으며 옛이야기를 나눴습니다.' },
  { id: 'hometown', main: 'network', cost: 'reputation', name: '고향 향우회', description: '지역 유지들과 어깨동무한 사진이 돌았다.', logText: '고향 향우회에 나가 지역 인사들과 인사를 나눴습니다.' },
  { id: 'year-end-show', main: 'network', cost: 'reputation', name: '법원 송년회 장기자랑', description: '분위기는 살렸지만 춤추는 영상이 퍼져 체면을 구겼다.', logText: '법원 송년회 장기자랑에 나가 동료들을 웃겼습니다.' },
  { id: 'weddings', main: 'network', cost: 'insight', name: '법조계 결혼식 순회', description: '하루에 결혼식 세 곳을 도느라 펼쳐 둔 판례집은 그대로였다.', logText: '법조계 결혼식을 돌며 하객으로 얼굴을 비쳤습니다.' },
  { id: 'baduk', main: 'network', cost: 'insight', name: '법원 바둑 동호회', description: '수읽기에 몰두하느라 다음 주 사건 기록은 한 장도 못 봤다.', logText: '법원 바둑 동호회에서 동료들과 수담을 나눴습니다.' },
  { id: 'mentoring', main: 'network', cost: 'insight', name: '후배 판사 멘토링', description: '후배들 고민을 들어 주느라 정작 내 공부는 못 했다.', minRank: 1, logText: '후배 판사들을 멘토링하며 고민을 들어 주었습니다.' },
  { id: 'golf', main: 'network', cost: 'reputation', name: '법원장 주재 골프 모임', description: '윗분들과 18홀을 돌았다. "접대 골프"라는 말이 새어 나갔다.', minRank: 2, logText: '법원장이 주재한 골프 모임에 함께했습니다.' },
  { id: 'personnel-lunch', main: 'network', cost: 'reputation', name: '인사위원 오찬', description: '인사철에 얼굴을 비춘 탓에 "줄 대기"라는 뒷말이 나왔다.', minRank: 3, logText: '인사위원들과 오찬을 하며 눈도장을 찍었습니다.' },
  { id: 'presidents-meeting', main: 'network', cost: 'health', name: '전국 법원장 간담회', description: '낮에는 회의, 밤에는 만찬이 이어져 몸이 천근만근이다.', minRank: 4, logText: '전국 법원장 간담회에서 다른 법원장들과 머리를 맞댔습니다.' },
  { id: 'assembly-dinner', main: 'network', cost: 'reputation', name: '국회의원 초청 만찬', description: '"사법부 고위직이 정치권과 가깝다"는 기사가 났다.', minRank: 5, logText: '국회의원 초청 만찬에 참석해 정계 인사들과 인사를 나눴습니다.' },
  { id: 'chief-residence', main: 'network', cost: 'insight', name: '대법원장 공관 만찬', description: '만찬 준비와 뒤풀이로 사건 검토 시간을 통째로 뺏겼다.', minRank: 6, logText: '대법원장 공관 만찬에 초대받아 자리를 함께했습니다.' },

  // ───────── 평판 ─────────
  { id: 'public-lecture', main: 'reputation', cost: 'health', name: '시민 법률 강연', description: '구민회관 세 곳을 돌며 강연하느라 목이 다 쉬었다.', logText: '시민들 앞에서 법률 강연을 했습니다.' },
  { id: 'free-counsel', main: 'reputation', cost: 'health', name: '무료 법률 상담 봉사', description: '막막한 사람들의 이야기를 하루 종일 듣고 나니 기진맥진했다.', logText: '무료 법률 상담 봉사로 시민들의 고민을 들었습니다.' },
  { id: 'column', main: 'reputation', cost: 'health', name: '신문 칼럼 기고', description: '마감에 쫓겨 밤을 새워 원고를 썼다.', logText: '신문에 칼럼을 기고해 법원의 생각을 알렸습니다.' },
  { id: 'briquette', main: 'reputation', cost: 'health', name: '연탄 배달 봉사', description: '언덕길로 연탄을 나른 사진이 지역 신문에 실렸다. 어깨가 결린다.', logText: '연탄 배달 봉사로 이웃에게 온기를 전했습니다.' },
  { id: 'blood-drive', main: 'reputation', cost: 'health', name: '헌혈 캠페인 참여', description: '홍보 사진을 찍고 헌혈까지 했더니 어질어질하다.', logText: '헌혈 캠페인에 참여해 팔을 걷었습니다.' },
  { id: 'alma-mater', main: 'reputation', cost: 'insight', name: '모교 특강', description: '강의 준비에 매달리느라 판례 공부는 손을 놓았다.', logText: '모교에서 후배들에게 특강을 했습니다.' },
  { id: 'court-tour', main: 'reputation', cost: 'insight', name: '법원 견학 학생 안내', description: '아이들 질문 공세에 하루가 다 가서 기록 검토를 못 했다.', logText: '법원 견학 온 학생들에게 법정을 안내했습니다.' },
  { id: 'mock-trial', main: 'reputation', cost: 'insight', name: '청소년 모의재판 심사', description: '학생들 공연에 박수를 보내느라 정작 내 사건은 못 들여다봤다.', logText: '청소년 모의재판의 심사를 맡았습니다.' },
  { id: 'youtube', main: 'reputation', cost: 'network', name: '법률 상식 유튜브 출연', description: '조회수는 잘 나왔지만 보수적인 선배들은 혀를 찼다.', logText: '법률 상식 유튜브 방송에 출연해 시민들과 만났습니다.' },
  { id: 'interview', main: 'reputation', cost: 'network', name: '언론 인터뷰', description: '사법 신뢰에 대해 소신을 밝혔다. 윗선은 달가워하지 않는 눈치다.', minRank: 1, logText: '언론 인터뷰에 응해 재판에 대한 생각을 밝혔습니다.' },
  { id: 'open-court', main: 'reputation', cost: 'health', name: '법원 개방 행사 진행', description: '시민 수백 명을 안내하느라 하루 종일 서 있었다.', minRank: 3, logText: '법원 개방 행사를 열어 시민들을 맞이했습니다.' },
  { id: 'audit', main: 'reputation', cost: 'health', name: '국정감사 출석', description: '의원들 질문에 차분히 답해 호평을 받았지만 자정까지 이어져 녹초가 됐다.', minRank: 4, logText: '국정감사에 출석해 법원의 입장을 설명했습니다.' },
  { id: 'press-conference', main: 'reputation', cost: 'network', name: '신년 기자회견', description: '소신 발언에 박수가 쏟아졌지만 대법원 수뇌부의 표정은 굳었다.', minRank: 5, logText: '신년 기자회견을 열어 사법부의 계획을 밝혔습니다.' },
  { id: 'national-address', main: 'reputation', cost: 'insight', name: '대국민 사법 신뢰 담화', description: '담화문을 고치고 또 고치느라 사건 검토가 밀렸다.', minRank: 6, logText: '대국민 담화로 사법 신뢰 회복을 약속했습니다.' },

  // ───────── 건강 ─────────
  { id: 'rest', main: 'health', cost: 'network', name: '집에서 푹 쉬기', description: '휴대전화를 꺼 두고 하루 종일 잤다. 모임 연락은 다 놓쳤다.', logText: '휴대전화를 꺼 두고 집에서 푹 쉬었습니다.' },
  { id: 'family-outing', main: 'health', cost: 'network', name: '가족과 나들이', description: '동기 모임 대신 가족과 교외로 나가 바람을 쐤다.', logText: '가족과 나들이를 다녀오며 쉬었습니다.' },
  { id: 'temple-stay', main: 'health', cost: 'network', name: '템플스테이', description: '휴대전화를 맡기고 산사에서 이틀을 보냈다. 그사이 단체 대화방에서 잊혔다.', logText: '템플스테이로 마음을 비우고 왔습니다.' },
  { id: 'gym', main: 'health', cost: 'insight', name: '운동과 사우나', description: '땀을 쭉 빼고 나니 머릿속 사건 기록까지 다 빠져나갔다.', logText: '운동과 사우나로 몸을 풀었습니다.' },
  { id: 'checkup', main: 'health', cost: 'insight', name: '종합 건강검진', description: '검사에 하루를 다 쓰는 바람에 읽으려던 판례집은 덮어 두었다.', logText: '종합 건강검진을 받으며 몸을 돌봤습니다.' },
  { id: 'clinic', main: 'health', cost: 'reputation', name: '한의원 진료와 휴식', description: '봉사 활동 약속을 취소하고 몸부터 챙겼다.', logText: '한의원 진료를 받고 쉬며 몸을 추슬렀습니다.' },
  { id: 'nap', main: 'health', cost: 'reputation', name: '늘어지게 낮잠', description: '강연 약속을 깜빡하고 잠들어 버렸다. 주최 측은 화가 났다.', logText: '아무것도 하지 않고 늘어지게 낮잠을 잤습니다.' },
  { id: 'garden', main: 'health', cost: 'reputation', name: '관사 정원 가꾸기', description: '흙을 만지니 마음이 편하다. 다만 "관사가 호화롭다"는 말이 돌았다.', minRank: 4, logText: '관사 정원을 가꾸며 하루를 보냈습니다.' },
];

export const activityEffects = (a: WeekendActivity): Partial<Stats> => ({
  [a.main]: ACTIVITY_GAIN,
  [a.cost]: -ACTIVITY_COST,
});

const STAT_ORDER: StatId[] = ['insight', 'network', 'reputation', 'health'];

/**
 * 활동 차례의 선택지 4개: 능력치마다 그것을 올리는 활동 하나씩 (무작위, 직급 조건 반영).
 * 건강이 HEALTH_REST_ONLY_BELOW 미만이면 건강 활동만 4개.
 * exclude: 직전 활동 차례에 나온 활동은 되도록 다시 안 나오게.
 */
export function pickWeekendChoices(
  stats: Stats,
  rankIndex: number,
  exclude: string[] = [],
  rand = Math.random,
): WeekendActivity[] {
  const available = WEEKEND_ACTIVITIES.filter((a) => (a.minRank ?? 0) <= rankIndex);
  const pool = (stat: StatId) => {
    const all = available.filter((a) => a.main === stat);
    const fresh = all.filter((a) => !exclude.includes(a.id));
    return fresh.length ? fresh : all;
  };
  const shuffle = <T,>(xs: T[]) => xs.map((x) => [rand(), x] as const).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

  if (stats.health < HEALTH_REST_ONLY_BELOW) return shuffle(pool('health')).slice(0, 4);
  return STAT_ORDER.map((s) => {
    const p = pool(s);
    return p[Math.floor(rand() * p.length)];
  });
}
