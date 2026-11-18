import { z } from 'zod';

export const ChoiceSchema = z.object({
  id: z.enum(['a', 'b', 'c', 'd']),
  text: z.string().min(1),
});

/** 판결 결과 연출(gif)에 등장하는 인물: 실제 당사자와 비슷한 나이대·성별 */
export const PersonaSchema = z.object({
  name: z.string(),
  age: z.union([z.literal(20), z.literal(40), z.literal(60), z.literal(80)]),
  gender: z.enum(['남', '여']),
  basis: z.string().optional(),
});

export const CaseSchema = z
  .object({
    id: z.string().min(1),
    caseNumber: z.string().min(1),
    court: z.string().min(1),
    decisionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    category: z.enum(['형사', '민사']),
    topic: z.string().min(1),
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    title: z.string().min(1),
    background: z.array(z.string().min(1)).min(2).max(8),
    /** "자세한 개요 보기": 판결문에서 더 길고 자세하게 정리한 사실관계 (결론 누설 없음). scripts/add-details.ts */
    backgroundDetail: z.array(z.string().min(1)).min(3).max(14).optional(),
    parties: z
      .array(
        z.object({
          role: z.string(),
          name: z.string(),
          description: z.string(),
          /** 당사자 목록 인물 아이콘 (src/assets/people/<age><m|f>.webp). 한 사건 안에서 중복 없음 */
          age: PersonaSchema.shape.age.optional(),
          gender: PersonaSchema.shape.gender.optional(),
        }),
      )
      .min(1),
    evidence: z.array(z.object({ name: z.string(), description: z.string(), icon: z.string().optional() })).min(1),
    keyIssue: z.string().min(1),
    question: z.string().min(1),
    choices: z.array(ChoiceSchema).min(3).max(4),
    answerId: z.enum(['a', 'b', 'c', 'd']),
    explanation: z.string().min(1),
    /** 판결문 주문 원문 */
    orderText: z.string().min(1),
    /** 판결 이유(또는 판결요지) 중 핵심 문장 원문 인용 */
    ruling: z.string().min(1),
    lawRefs: z.array(z.string()),
    sourceUrl: z.string().url(),
    reviewed: z.boolean(),
    persona: PersonaSchema.optional(),
  })
  .refine((c) => new Set(c.choices.map((x) => x.id)).size === c.choices.length, { message: '선택지 id 중복' })
  .refine((c) => c.choices.length === (c.category === '민사' ? 3 : 4), { message: '선택지 개수: 형사 4개, 민사 3개' })
  .refine((c) => c.choices.some((x) => x.id === c.answerId), { message: 'answerId가 선택지에 없음' });

export type Case = z.infer<typeof CaseSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type Persona = z.infer<typeof PersonaSchema>;
