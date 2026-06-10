// 공개 분석 이벤트 기록과 어드민 집계를 조율하는 서비스
import * as analyticsDb from "./db";
import type { ParsedAnalyticsEventInput } from "./schemas";

export async function recordAnalyticsEvent(input: ParsedAnalyticsEventInput) {
  if (input.newsId && !(await analyticsDb.isPublicNews(input.newsId))) {
    return { recorded: false };
  }

  await analyticsDb.insertAnalyticsEvent({
    newsId: input.newsId ?? null,
    sessionId: input.sessionId,
    eventType: input.eventType,
    path: input.path,
    referrer: input.referrer,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
    userAgentFamily: input.userAgentFamily,
  });
  return { recorded: true };
}

export async function getAdminAnalyticsDashboard() {
  const summary = await analyticsDb.getNewsAnalyticsSummary(5);
  return { ...summary };
}
