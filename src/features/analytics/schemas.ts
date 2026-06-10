// 공개 분석 이벤트 입력값을 검증하는 Zod 스키마
import { z } from "zod";
import { ANALYTICS_EVENT_TYPES } from "@/db/schema";

const optionalText = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : null));

export const analyticsEventInputSchema = z.object({
  sessionId: z.uuid(),
  eventType: z.enum(ANALYTICS_EVENT_TYPES),
  newsId: z.uuid().optional(),
  path: optionalText,
  referrer: optionalText,
  utmSource: optionalText,
  utmMedium: optionalText,
  utmCampaign: optionalText,
  userAgentFamily: z
    .enum(["Chrome", "Safari", "Firefox", "Edge", "Other"])
    .optional()
    .transform((v) => v ?? null),
});

export type AnalyticsEventInput = z.input<typeof analyticsEventInputSchema>;
export type ParsedAnalyticsEventInput = z.output<typeof analyticsEventInputSchema>;
