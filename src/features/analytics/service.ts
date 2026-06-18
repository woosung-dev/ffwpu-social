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

export async function getAdminAnalyticsDashboard(days: number) {
  const summary = await analyticsDb.getNewsAnalyticsSummary(days, 5);
  return { ...summary };
}

// 어드민 글 목록 — 글별 누적 통계를 newsId 키 맵으로. 목록 행과 즉시 매칭
export async function getNewsStatsForAdmin(newsIds: string[]) {
  const rows = await analyticsDb.getNewsStatsForAdmin(newsIds);
  const map: Record<
    string,
    { views: number; heartClicks: number; shareClicks: number }
  > = {};
  for (const r of rows) {
    if (r.newsId) {
      map[r.newsId] = {
        views: r.views,
        heartClicks: r.heartClicks,
        shareClicks: r.shareClicks,
      };
    }
  }
  return map;
}
