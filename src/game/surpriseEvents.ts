/**
 * 기습 이벤트: 사건 3건(한 바퀴) 동안 최대 1번, 사건 배당 전 집무실에서 하나가 뜨고 참여할지 거절할지만 고른다.
 *
 * - 일반 이벤트: 참여 = 주 능력치 +6, 다른 능력치 −3 / 거절 = 변화 없음 또는 능력치 하나 −3
 * - 유혹 이벤트(청탁·영입 제안 등 대중이 곱게 보지 않는 일): 참여 = 주 능력치 +8, 평판 −6,
 *   그리고 일정 확률로 바로 알려져 평판 추가 −6 / 거절 = 변화 없음 또는 인맥 −3
 * - minRank·maxRank: 이 직급(RANKS 인덱스, 0 배석판사 … 7 대법원장) 범위에서만 등장
 * 표 정리: docs/EVENTS.md
 */
import { HEALTH_REST_ONLY_BELOW, type StatId, type Stats } from './stats';

export const SURPRISE_GAIN = 6;
export const SURPRISE_COST = 3;
export const TEMPT_GAIN = 8;
export const TEMPT_COST = 6;
/** 유혹 이벤트 참여 시 바로 알려질 확률 */
export const TEMPT_EXPOSE_CHANCE = 0.25;
/** 그날 뽑는 이벤트가 유혹 이벤트일 확률 */
export const TEMPT_SHARE = 0.25;
/** 같은 이벤트가 다시 나오기까지 최소 바퀴 수 (한 바퀴 = 사건 3건, 4바퀴 = 사건 12건) */
export const SURPRISE_COOLDOWN_CYCLES = 4;
/** 한 바퀴(사건 3건)에 기습 이벤트가 뜰 확률 (뜨면 1번) */
export const SURPRISE_CHANCE_PER_CYCLE = 0.6;
/** 한 바퀴의 사건 수 (progression.ts CASES_PER_CYCLE과 같게) */
const CYCLE_CASES = 3;
/** 정치권 제안 (한 판에 한 번씩만 등장, 셋 다 거절하면 업적 "여의도 안가요") */
export const POLITICAL_EVENTS = new Set(['party-recruit', 'power-meeting', 'cabinet']);

export interface SurpriseEvent {
  id: string;
  kind: 'normal' | 'temptation';
  name: string;
  /** 상황 설명 (무엇이 깎이는지 드러나게) */
  description: string;
  /** 참여 시 오르는 능력치 */
  main: StatId;
  /** 참여 시 깎이는 능력치 (유혹 이벤트는 항상 평판) */
  cost: StatId;
  /** 거절 시 깎이는 능력치 (없으면 변화 없음) */
  declineCost?: StatId;
  acceptText: string;
  declineText: string;
  /** 유혹 이벤트가 알려졌을 때 */
  exposedText?: string;
  minRank?: number;
  maxRank?: number;
}

type Normal = Omit<SurpriseEvent, 'kind'>;
type Temptation = Omit<SurpriseEvent, 'kind' | 'cost'>;
const normal = (e: Normal): SurpriseEvent => ({ kind: 'normal', ...e });
const temptation = (e: Temptation): SurpriseEvent => ({ kind: 'temptation', cost: 'reputation', ...e });

export const SURPRISE_EVENTS: SurpriseEvent[] = [
  // ───────── 모든 직급 ─────────
  normal({
    id: 'wedding-mc', main: 'network', cost: 'health', declineCost: 'network',
    name: '동기 결혼식 사회 부탁',
    description: '연수원 동기가 이번 주말 결혼식 사회를 봐 달라고 한다. 퇴근 후 리허설까지 따라가야 한다.',
    acceptText: '연수원 동기의 결혼식 사회를 맡았습니다.', declineText: '연수원 동기의 결혼식 사회 부탁을 거절했습니다.',
  }),
  normal({
    id: 'cover-duty', main: 'network', cost: 'health',
    name: '독감 걸린 동료 대신 당직',
    description: '옆 방 판사가 독감으로 쓰러졌다. 오늘 밤 당직을 대신 서 줄 수 있느냐는 연락이 왔다.',
    acceptText: '독감 걸린 동료 대신 당직을 섰습니다.', declineText: '독감 걸린 동료의 당직 부탁을 거절했습니다.',
  }),
  normal({
    id: 'warrant-night', main: 'insight', cost: 'health', declineCost: 'reputation',
    name: '갑작스러운 야간 영장 당직',
    description: '자정 가까이 구속영장 청구가 몰려 들어왔다. 지금 나가면 새벽까지 기록을 봐야 한다.',
    acceptText: '밤늦게 몰려든 구속영장 기록을 새벽까지 검토했습니다.', declineText: '밤늦게 몰려든 구속영장 당직을 미뤘습니다.',
  }),
  normal({
    id: 'law-paper', main: 'reputation', cost: 'insight',
    name: '법률신문 짧은 인터뷰 요청',
    description: '법률신문 기자가 짧은 인터뷰를 청했다. 준비하느라 오늘 기록 검토 시간이 줄어든다.',
    acceptText: '법률신문의 인터뷰 요청에 응했습니다.', declineText: '법률신문의 인터뷰 요청을 사양했습니다.',
  }),
  normal({
    id: 'recheck', main: 'health', cost: 'insight', declineCost: 'health',
    name: '건강검진 재검 권고',
    description: '건강검진에서 재검 판정이 나왔다. 반차를 내고 병원에 가면 오늘 기록 검토는 미뤄야 한다.',
    acceptText: '반차를 내고 건강검진 재검을 받았습니다.', declineText: '건강검진 재검을 미루고 일했습니다.',
  }),
  normal({
    id: 'gym', main: 'health', cost: 'network',
    name: '점심시간 법원 헬스장 등록 권유',
    description: '법원 헬스장이 문을 열었다. 점심마다 운동하면 동료들과의 점심 약속은 빠지게 된다.',
    acceptText: '점심시간에 법원 헬스장에 다니기 시작했습니다.', declineText: '점심시간 법원 헬스장 등록 권유를 거절했습니다.',
  }),
  normal({
    id: 'mentor-book', main: 'network', cost: 'insight', declineCost: 'network',
    name: '대학 은사의 출판기념회 초대',
    description: '대학 시절 은사가 출판기념회에 와 달라고 직접 전화했다. 다녀오면 오늘 저녁 기록 검토는 못 한다.',
    acceptText: '대학 은사의 출판기념회에 다녀왔습니다.', declineText: '대학 은사의 출판기념회에 가지 않았습니다.',
  }),
  normal({
    id: 'school-tour', main: 'reputation', cost: 'health',
    name: '법원 견학 온 초등학생 안내',
    description: '견학 온 초등학생들이 법정을 보고 싶어 한다. 점심을 거르고 안내해야 한다.',
    acceptText: '견학 온 초등학생들에게 법정을 안내했습니다.', declineText: '견학 온 초등학생 안내를 다른 직원에게 넘겼습니다.',
  }),

  // ───────── 배석·단독판사 ─────────
  normal({
    id: 'chief-dinner', main: 'network', cost: 'health', declineCost: 'network', maxRank: 1,
    name: '부장판사의 "오늘 저녁 같이 하지"',
    description: '퇴근 무렵 부장판사가 방문을 두드렸다. 저녁 자리는 보통 2차까지 이어진다.',
    acceptText: '부장판사의 저녁 제안에 응해 늦게까지 함께했습니다.', declineText: '부장판사의 저녁 제안을 사양했습니다.',
  }),
  normal({
    id: 'draft-overnight', main: 'insight', cost: 'health', declineCost: 'network', maxRank: 1,
    name: '판결문 초안 밤샘 수정 지시',
    description: '부장판사가 판결문 초안을 내일 아침까지 다시 고쳐 오라고 했다. 밤을 새워야 한다.',
    acceptText: '부장판사의 지시대로 밤을 새워 판결문 초안을 고쳤습니다.', declineText: '판결문 초안을 밤새 고쳐 오라는 지시에 마감을 늦춰 달라고 했습니다.',
  }),
  normal({
    id: 'newsletter', main: 'reputation', cost: 'insight', maxRank: 1,
    name: '법원 소식지 신임 판사 인터뷰',
    description: '법원 소식지에서 신임 판사 인터뷰를 하자고 한다. 사진 촬영까지 반나절이 걸린다.',
    acceptText: '법원 소식지의 신임 판사 인터뷰에 응했습니다.', declineText: '법원 소식지의 신임 판사 인터뷰를 사양했습니다.',
  }),
  normal({
    id: 'classmates', main: 'network', cost: 'insight', maxRank: 1,
    name: '연수원 동기 번개 모임',
    description: '동기 단톡방에 오늘 저녁 번개 공지가 올라왔다. 가면 밀린 기록은 내일로 넘어간다.',
    acceptText: '연수원 동기 번개 모임에 나갔습니다.', declineText: '연수원 동기 번개 모임에 나가지 않았습니다.',
  }),
  normal({
    id: 'sports-day', main: 'health', cost: 'insight', declineCost: 'network', maxRank: 1,
    name: '법원 체육대회 선수 차출',
    description: '체육대회 축구 선수로 뽑혔다. 연습하느라 며칠 저녁을 기록 대신 운동장에서 보내야 한다.',
    acceptText: '법원 체육대회 선수로 나가 연습했습니다.', declineText: '법원 체육대회 선수 차출을 거절했습니다.',
  }),
  normal({
    id: 'senior-research', main: 'insight', cost: 'network', maxRank: 1,
    name: '선배 판사의 판례 연구 자료 정리',
    description: '선배 판사가 판례 연구 자료 정리를 도와 달라고 한다. 혼자 자료실에 틀어박혀야 한다.',
    acceptText: '선배 판사의 판례 연구 자료 정리를 도왔습니다.', declineText: '선배 판사의 판례 연구 자료 정리 부탁을 거절했습니다.',
  }),

  // ───────── 부장·수석부장판사 ─────────
  normal({
    id: 'associate-talk', main: 'network', cost: 'insight', declineCost: 'network', minRank: 2, maxRank: 3,
    name: '배석판사의 고민 상담 요청',
    description: '배석판사가 상의드릴 게 있다며 찾아왔다. 이야기가 길어지면 오늘 기록 검토는 못 한다.',
    acceptText: '배석판사의 고민 상담을 끝까지 들어 주었습니다.', declineText: '배석판사의 고민 상담을 다음으로 미뤘습니다.',
  }),
  normal({
    id: 'big-case', main: 'reputation', cost: 'health', minRank: 2, maxRank: 3,
    name: '주목받는 사건 재판장 제안',
    description: '언론이 주목하는 사건의 재판장을 맡아 달라는 제안이 왔다. 기록이 수만 쪽이다.',
    acceptText: '언론이 주목하는 사건의 재판장을 맡았습니다.', declineText: '언론이 주목하는 사건의 재판장 제안을 거절했습니다.',
  }),
  normal({
    id: 'research-talk', main: 'insight', cost: 'health', minRank: 2, maxRank: 3,
    name: '법원 내 연구회 발표 요청',
    description: '형사법 연구회에서 다음 주 발표를 맡아 달라고 한다. 며칠 밤을 새워 준비해야 한다.',
    acceptText: '법원 내 연구회 발표를 맡아 마쳤습니다.', declineText: '법원 내 연구회 발표 요청을 사양했습니다.',
  }),
  normal({
    id: 'bar-meeting', main: 'network', cost: 'reputation', minRank: 2, maxRank: 3,
    name: '변호사회 간담회 초청',
    description: '지역 변호사회가 간담회에 초청했다. 판사와 변호사가 너무 가까워 보인다는 말이 나올 수 있다.',
    acceptText: '지역 변호사회 간담회에 참석했습니다.', declineText: '지역 변호사회 간담회 초청을 사양했습니다.',
  }),
  normal({
    id: 'admin-tf', main: 'network', cost: 'insight', declineCost: 'network', minRank: 2, maxRank: 3,
    name: '법원 행정 개선 TF 차출',
    description: '법원장이 행정 개선 TF에 들어와 달라고 한다. 회의가 잦아 재판 준비 시간이 줄어든다.',
    acceptText: '법원 행정 개선 TF에 합류했습니다.', declineText: '법원 행정 개선 TF 합류를 거절했습니다.',
  }),
  normal({
    id: 'staff-dinner', main: 'network', cost: 'health', minRank: 2, maxRank: 3,
    name: '사무관·실무관 회식',
    description: '재판부 직원들이 오랜만에 회식을 하자고 한다. 노래방까지 갈 기세다.',
    acceptText: '재판부 사무관·실무관들과 회식을 했습니다.', declineText: '재판부 사무관·실무관 회식에 빠졌습니다.',
  }),

  // ───────── 지방법원장·고등법원장 ─────────
  normal({
    id: 'tv-talk', main: 'reputation', cost: 'insight', minRank: 4, maxRank: 5,
    name: '지역 방송 신년 대담 출연',
    description: '지역 방송국이 신년 대담에 나와 달라고 한다. 준비하느라 결재 서류가 밀린다.',
    acceptText: '지역 방송 신년 대담에 출연했습니다.', declineText: '지역 방송 신년 대담 출연을 사양했습니다.',
  }),
  normal({
    id: 'audit', main: 'reputation', cost: 'health', declineCost: 'reputation', minRank: 4, maxRank: 5,
    name: '국정감사 증인 출석 요구',
    description: '국정감사에 증인으로 나와 달라는 요구가 왔다. 며칠 밤을 새워 답변을 준비해야 한다.',
    acceptText: '국정감사에 증인으로 출석해 답변했습니다.', declineText: '국정감사 증인 출석 요구에 응하지 않았습니다.',
  }),
  normal({
    id: 'mayor-dinner', main: 'network', cost: 'reputation', minRank: 4, maxRank: 5,
    name: '지방자치단체장 만찬 초청',
    description: '시장이 지역 기관장 만찬에 초청했다. 법원장이 지자체와 가까워 보인다는 말이 나올 수 있다.',
    acceptText: '지방자치단체장의 기관장 만찬에 참석했습니다.', declineText: '지방자치단체장의 기관장 만찬 초청을 사양했습니다.',
  }),
  normal({
    id: 'union', main: 'reputation', cost: 'network', declineCost: 'reputation', minRank: 4, maxRank: 5,
    name: '법원 공무원 노조 면담 요청',
    description: '법원 공무원 노조가 근무 여건 개선 면담을 요청했다. 들어주면 간부들이 불편해한다.',
    acceptText: '법원 공무원 노조와 면담하고 요구를 들었습니다.', declineText: '법원 공무원 노조의 면담 요청을 거절했습니다.',
  }),
  normal({
    id: 'presidents-meeting', main: 'insight', cost: 'health', minRank: 4, maxRank: 5,
    name: '전국 법원장 회의 발제',
    description: '전국 법원장 회의에서 사법 정책 발제를 맡아 달라고 한다. 주말까지 자료를 만들어야 한다.',
    acceptText: '전국 법원장 회의에서 사법 정책 발제를 맡았습니다.', declineText: '전국 법원장 회의 발제를 다른 법원장에게 넘겼습니다.',
  }),
  normal({
    id: 'groundbreaking', main: 'reputation', cost: 'health', minRank: 4, maxRank: 5,
    name: '청사 신축 기공식 참석',
    description: '새 청사 기공식에 참석해 축사를 해 달라고 한다. 한겨울 야외 행사다.',
    acceptText: '청사 신축 기공식에 참석해 축사를 했습니다.', declineText: '청사 신축 기공식 축사를 수석부장판사에게 맡겼습니다.',
  }),

  // ───────── 대법관·대법원장 ─────────
  normal({
    id: 'en-banc', main: 'insight', cost: 'health', minRank: 6,
    name: '전원합의체 긴급 회부 사건 검토',
    description: '전원합의체에 긴급 회부된 사건 기록이 도착했다. 며칠 밤을 새워 읽어야 한다.',
    acceptText: '전원합의체에 긴급 회부된 사건 기록을 밤새 검토했습니다.', declineText: '전원합의체 긴급 회부 사건 검토를 연구관들에게 맡겼습니다.',
  }),
  normal({
    id: 'judiciary-committee', main: 'reputation', cost: 'health', declineCost: 'reputation', minRank: 6,
    name: '국회 법제사법위원회 출석 요청',
    description: '국회 법사위가 출석을 요청했다. 하루 종일 날 선 질의가 이어질 것이다.',
    acceptText: '국회 법제사법위원회에 출석해 답변했습니다.', declineText: '국회 법제사법위원회 출석 요청에 응하지 않았습니다.',
  }),
  normal({
    id: 'foreign-chief', main: 'network', cost: 'insight', minRank: 6,
    name: '외국 대법원장 방한 접견',
    description: '방한한 외국 대법원장을 접견해 달라고 한다. 일정 때문에 오늘 기록 검토는 미뤄야 한다.',
    acceptText: '방한한 외국 대법원장을 접견했습니다.', declineText: '방한한 외국 대법원장 접견을 다른 대법관에게 맡겼습니다.',
  }),
  normal({
    id: 'presidential-event', main: 'network', cost: 'reputation', minRank: 6,
    name: '대통령 주재 행사 초청',
    description: '대통령이 주재하는 행사에 초청받았다. 참석하면 사법 독립을 걱정하는 목소리가 나올 수 있다.',
    acceptText: '대통령 주재 행사에 참석했습니다.', declineText: '대통령 주재 행사 초청을 사양했습니다.',
  }),
  normal({
    id: 'reform-forum', main: 'reputation', cost: 'network', minRank: 6,
    name: '사법개혁 대국민 간담회',
    description: '시민들과 사법개혁 간담회를 열자는 제안이 왔다. 법원 내부에서는 탐탁지 않아 한다.',
    acceptText: '시민들과 사법개혁 대국민 간담회를 열었습니다.', declineText: '사법개혁 대국민 간담회를 열지 않기로 했습니다.',
  }),
  normal({
    id: 'memoir', main: 'network', cost: 'insight', declineCost: 'network', minRank: 6,
    name: '원로 법조인 회고록 추천사 부탁',
    description: '원로 법조인이 회고록 추천사를 부탁했다. 원고를 다 읽으려면 며칠이 걸린다.',
    acceptText: '원로 법조인의 회고록을 읽고 추천사를 썼습니다.', declineText: '원로 법조인의 회고록 추천사 부탁을 사양했습니다.',
  }),

  // ───────── 유혹 이벤트 ─────────
  temptation({
    id: 'friend-favor', main: 'network', declineCost: 'network',
    name: '고교 동창의 사건 청탁',
    description: '고교 동창이 자기 사건을 "잘 좀 봐 달라"며 연락해 왔다. 들어주면 오랜 우정은 지키겠지만 청탁이다.',
    acceptText: '고교 동창의 사건 청탁을 들어주었습니다.', declineText: '고교 동창의 사건 청탁을 거절했습니다.',
    exposedText: '동창의 청탁을 들어준 사실이 보도되었습니다.',
  }),
  temptation({
    id: 'golf-treat', main: 'network',
    name: '사건 관계 변호사의 골프 접대',
    description: '맡은 사건의 변호사가 주말 고급 골프장에 초대했다. 비용은 전부 그쪽에서 낸다고 한다.',
    acceptText: '사건 관계 변호사의 골프 접대를 받았습니다.', declineText: '사건 관계 변호사의 골프 접대를 거절했습니다.',
    exposedText: '사건 관계 변호사에게 골프 접대를 받은 사실이 보도되었습니다.',
  }),
  temptation({
    id: 'leak-direction', main: 'network', declineCost: 'network',
    name: '지인 기자의 판결 방향 문의',
    description: '친분 있는 기자가 "판결 방향만 살짝" 알려 달라고 한다. 알려 주면 앞으로 좋은 기사를 써 주겠다고 한다.',
    acceptText: '지인 기자에게 판결 방향을 귀띔했습니다.', declineText: '판결 방향을 알려 달라는 지인 기자의 부탁을 거절했습니다.',
    exposedText: '선고 전 판결 방향이 새어 나간 사실이 드러났습니다.',
  }),
  temptation({
    id: 'classmate-lawyer', main: 'network', declineCost: 'network', maxRank: 1,
    name: '동기 변호사의 "구속만은 피하게"',
    description: '변호사가 된 연수원 동기가 의뢰인 구속만은 피하게 해 달라고 부탁한다.',
    acceptText: '동기 변호사의 "구속만은 피하게" 부탁을 들어주었습니다.', declineText: '동기 변호사의 "구속만은 피하게" 부탁을 거절했습니다.',
    exposedText: '동기 변호사의 부탁을 들어준 사실이 보도되었습니다.',
  }),
  temptation({
    id: 'firm-offer', main: 'network', maxRank: 3,
    name: '대형 로펌의 퇴직 후 자리 약속',
    description: '대형 로펌이 퇴직하면 좋은 자리를 마련해 두겠다며 물밑으로 연락해 왔다. 그 로펌 사건도 맡고 있다.',
    acceptText: '대형 로펌의 퇴직 후 자리 약속에 긍정적으로 답했습니다.', declineText: '대형 로펌의 퇴직 후 자리 약속을 거절했습니다.',
    exposedText: '재판 중인 사건의 로펌과 퇴직 후 자리를 논의한 사실이 보도되었습니다.',
  }),
  temptation({
    id: 'party-dinner', main: 'network', minRank: 2, maxRank: 3,
    name: '사건 당사자 측과의 저녁 자리',
    description: '재판 중인 사건 당사자 회사의 임원이 "인사나 하자"며 저녁 자리를 마련했다.',
    acceptText: '재판 중인 사건 당사자 측과 저녁을 함께했습니다.', declineText: '재판 중인 사건 당사자 측의 저녁 자리를 거절했습니다.',
    exposedText: '재판 중인 사건 당사자 측과 식사한 사실이 보도되었습니다.',
  }),
  temptation({
    id: 'outside-director', main: 'network', minRank: 2, maxRank: 5,
    name: '기업 사외이사 자리 제안',
    description: '한 대기업이 퇴임 후 사외이사 자리를 약속하겠다고 한다. 그 기업 관련 소송이 법원에 여럿 걸려 있다.',
    acceptText: '기업의 퇴임 후 사외이사 자리 제안을 받아들였습니다.', declineText: '기업의 퇴임 후 사외이사 자리 제안을 거절했습니다.',
    exposedText: '소송이 걸린 기업과 사외이사 자리를 약속한 사실이 보도되었습니다.',
  }),
  temptation({
    id: 'sns-politics', main: 'network', minRank: 2,
    name: 'SNS 정치 성향 글 권유',
    description: '가까운 인사들이 SNS에 정치 성향이 드러나는 글을 올려 달라고 권한다. 같은 성향 인사들과는 가까워진다.',
    acceptText: '권유대로 SNS에 정치 성향이 드러나는 글을 올렸습니다.', declineText: 'SNS에 정치 성향 글을 올려 달라는 권유를 거절했습니다.',
    exposedText: '판사의 정치 편향 글이 논란이 되었습니다.',
  }),
  temptation({
    id: 'party-recruit', main: 'network', declineCost: 'network', minRank: 4, maxRank: 5,
    name: '정당의 총선 영입 제안',
    description: '한 정당이 다음 총선 영입 인재로 모시고 싶다며 비공개 면담을 청했다.',
    acceptText: '정당의 총선 영입 제안에 비공개 면담으로 응했습니다.', declineText: '정당의 총선 영입 제안을 거절했습니다.',
    exposedText: '현직 법원장이 정당과 영입을 논의한 사실이 보도되었습니다.',
  }),
  temptation({
    id: 'power-meeting', main: 'network', minRank: 4,
    name: '정치권 실세와의 비공개 회동',
    description: '정치권 실세가 조용히 식사나 하자고 연락해 왔다. 장소는 외부에 알려지지 않는 곳이라고 한다.',
    acceptText: '정치권 실세와 비공개로 만났습니다.', declineText: '정치권 실세의 비공개 회동 제안을 거절했습니다.',
    exposedText: '정치권 실세와의 비공개 회동이 보도되었습니다.',
  }),
  temptation({
    id: 'cabinet', main: 'network', minRank: 6,
    name: '정부 고위직 입각 타진',
    description: '정부 측에서 총리·장관 자리를 맡을 의향이 있는지 조심스럽게 물어 왔다.',
    acceptText: '정부의 입각 타진에 긍정적으로 답했습니다.', declineText: '정부의 입각 타진을 거절했습니다.',
    exposedText: '현직 대법관이 입각을 논의한 사실이 보도되었습니다.',
  }),
  temptation({
    id: 'outside-pressure', main: 'network', declineCost: 'network', minRank: 6,
    name: '특정 사건에 대한 정치권의 비공식 의견',
    description: '대통령실과 국회 쪽에서 계류 중인 사건 결론에 대한 "의견"을 비공식으로 전해 왔다.',
    acceptText: '계류 사건에 대한 정치권의 비공식 의견을 받아들였습니다.', declineText: '계류 사건에 대한 정치권의 비공식 의견을 돌려보냈습니다.',
    exposedText: '재판에 대한 정치권의 비공식 의견을 받아들인 사실이 드러났습니다.',
  }),
];

const inRank = (e: SurpriseEvent, rankIndex: number) =>
  (e.minRank === undefined || rankIndex >= e.minRank) && (e.maxRank === undefined || rankIndex <= e.maxRank);

/** 이번 바퀴의 기습 이벤트 차례: 확률에 따라 사건 차례(0~2) 하나 또는 없음. fromDay 이전 차례는 뽑지 않음 */
export function scheduleCycle(rand: () => number = Math.random, fromDay = 0): number[] {
  const pool = Array.from({ length: CYCLE_CASES }, (_, d) => d).filter((d) => d >= fromDay);
  if (!pool.length || rand() >= SURPRISE_CHANCE_PER_CYCLE) return [];
  return [pool[Math.floor(rand() * pool.length)]];
}

/** 오늘 뜰 이벤트: 직급·건강·최근 등장 이력으로 거른 뒤 일반/유혹 중 하나 */
export function pickSurprise(
  ctx: { rankIndex: number; stats: Stats; week: number; surpriseSeen: Record<string, number> },
  rand: () => number = Math.random,
): SurpriseEvent | undefined {
  const ok = SURPRISE_EVENTS.filter(
    (e) =>
      inRank(e, ctx.rankIndex) &&
      // 건강 40 미만이면 참여 시 건강이 깎이는 이벤트는 빼기
      !(ctx.stats.health < HEALTH_REST_ONLY_BELOW && e.cost === 'health') &&
      !(ctx.surpriseSeen[e.id] !== undefined && ctx.week - ctx.surpriseSeen[e.id] < SURPRISE_COOLDOWN_CYCLES) &&
      !(POLITICAL_EVENTS.has(e.id) && ctx.surpriseSeen[e.id] !== undefined),
  );
  const tempt = ok.filter((e) => e.kind === 'temptation');
  const plain = ok.filter((e) => e.kind === 'normal');
  const pool = tempt.length && (rand() < TEMPT_SHARE || !plain.length) ? tempt : plain;
  return pool.length ? pool[Math.floor(rand() * pool.length)] : undefined;
}

/** 참여·거절에 따른 능력치 변화 (유혹 이벤트가 알려지면 평판 추가 감소) */
export function surpriseEffects(e: SurpriseEvent, accepted: boolean, exposed = false): Partial<Stats> {
  if (!accepted) return e.declineCost ? { [e.declineCost]: -SURPRISE_COST } : {};
  if (e.kind === 'temptation') return { [e.main]: TEMPT_GAIN, reputation: -TEMPT_COST * (exposed ? 2 : 1) };
  return { [e.main]: SURPRISE_GAIN, [e.cost]: -SURPRISE_COST };
}
