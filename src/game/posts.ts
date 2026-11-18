/**
 * 근무처: 직급이 바뀔 때마다 그 직급에 맞는 법원·재판부 중 하나를 무작위로 배정 (신분증 "근무처").
 * 법원 이름은 실제 법원 조직(지방법원·고등법원·대법원 소부)을 따른다.
 *
 * 신분증에서 근무처는 사진 오른쪽에 한 줄로 들어가야 한다 (PC 왼쪽 칸 300px, 글자 0.8rem 기준 약 148px).
 * 가장 긴 형태(두 자리 번호)로 재 봐서 넘치는 법원은 그 직급 목록에서 뺐다 (2026-11-16 측정).
 * - 서울 5개 지방법원(중앙·동부·남부·북부·서부)은 이름이 길어 지방법원장 근무처로만 남김
 * - 지원(성남·안산 등 17곳)은 전 직급에서 제외
 * - 의정부지방법원은 단독판사("형사 제15단독")에서 제외
 * - 부장판사는 "재판장"을 붙이면 모두 넘쳐서 "제N형사부"까지만 표시
 */

/** 지방법원 (지방법원장 근무처: 전부) */
export const DISTRICT_COURTS = [
  '서울중앙지방법원',
  '서울동부지방법원',
  '서울남부지방법원',
  '서울북부지방법원',
  '서울서부지방법원',
  '의정부지방법원',
  '인천지방법원',
  '수원지방법원',
  '춘천지방법원',
  '대전지방법원',
  '청주지방법원',
  '대구지방법원',
  '부산지방법원',
  '울산지방법원',
  '창원지방법원',
  '광주지방법원',
  '전주지방법원',
  '제주지방법원',
] as const;

const SEOUL = new Set<string>(['서울중앙지방법원', '서울동부지방법원', '서울남부지방법원', '서울북부지방법원', '서울서부지방법원']);
/** 배석·부장·수석부장판사 근무처: 서울 5개 지방법원 제외 */
const REGIONAL_COURTS = DISTRICT_COURTS.filter((c) => !SEOUL.has(c));
/** 단독판사 근무처: 서울 5개 + 의정부 제외 */
const SINGLE_COURTS = REGIONAL_COURTS.filter((c) => c !== '의정부지방법원');

/** 고등법원 */
export const HIGH_COURTS = ['서울고등법원', '대전고등법원', '대구고등법원', '부산고등법원', '광주고등법원', '수원고등법원'] as const;

type Rand = () => number;
const pick = <T,>(arr: readonly T[], rand: Rand) => arr[Math.floor(rand() * arr.length)];
const num = (max: number, rand: Rand) => 1 + Math.floor(rand() * max);
const field = (rand: Rand) => (rand() < 0.5 ? '형사' : '민사');

/** 직급(RANKS 인덱스)별 근무처 만들기 */
const MAKERS: ((rand: Rand) => string)[] = [
  // 0 배석판사: 합의부 소속
  (r) => `${pick(REGIONAL_COURTS, r)} 제${num(12, r)}${field(r)}부`,
  // 1 단독판사
  (r) => `${pick(SINGLE_COURTS, r)} ${field(r)} 제${num(15, r)}단독`,
  // 2 부장판사: 합의부 재판장 (한 줄에 들어가게 "재판장"은 생략)
  (r) => `${pick(REGIONAL_COURTS, r)} 제${num(12, r)}${field(r)}부`,
  // 3 수석부장판사
  (r) => `${pick(REGIONAL_COURTS, r)} ${field(r)}수석부`,
  // 4 지방법원장
  (r) => pick(DISTRICT_COURTS, r),
  // 5 고등법원장
  (r) => pick(HIGH_COURTS, r),
  // 6 대법관: 대법원은 한 곳이지만 대법관은 소부(제1·2·3부)에 속한다
  (r) => `대법원 제${num(3, r)}부`,
  // 7 대법원장
  () => '대법원',
];

/** 새 직급의 근무처. 같은 근무처가 이어지지 않게 직전 근무처는 피한다 (대법원장 제외) */
export function pickPost(rankIndex: number, rand: Rand = Math.random, previous?: string): string {
  const make = MAKERS[rankIndex] ?? MAKERS[0];
  let post = make(rand);
  for (let i = 0; i < 5 && post === previous; i++) post = make(rand);
  return post;
}
