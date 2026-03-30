// [Cell 2]: src/lib/schema.ts
// 에이전트로부터 올 JSON 데이터의 구조를 정의하고 검증합니다.

import { z } from 'zod';

export const A2UIMessageSchema = z.object({
  version: z.string().default('1.0'),
  type: z.string(), 
  props: z.record(z.string(), z.any()),
  metadata: z.object({
    agentId: z.string(),
    timestamp: z.number(),
  }).optional(),
});

export type A2UIMessage = z.infer<typeof A2UIMessageSchema>;