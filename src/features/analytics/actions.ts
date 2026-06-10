// 공개 분석 이벤트 기록 Server Action
"use server";

import { type ActionResult, toActionError } from "@/lib/action-result";
import * as analyticsService from "./service";
import {
  analyticsEventInputSchema,
  type AnalyticsEventInput,
  type ParsedAnalyticsEventInput,
} from "./schemas";

export async function recordAnalyticsEventAction(
  input: AnalyticsEventInput,
): Promise<ActionResult<{ recorded: boolean }, ParsedAnalyticsEventInput>> {
  const parsed = analyticsEventInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }
  try {
    const result = await analyticsService.recordAnalyticsEvent(parsed.data);
    return { success: true, data: result };
  } catch (e) {
    return toActionError(e, "analyticsAction");
  }
}
