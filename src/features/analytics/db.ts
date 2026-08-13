// 분석 이벤트 Drizzle 쿼리를 전담하는 DAL
import { and, desc, eq, gte, inArray, isNotNull, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { analyticsEvents, news } from "@/db/schema";
import type { NewAnalyticsEvent } from "@/db/schema";

// news/db.ts 의 동명 헬퍼와 동일 기준 — 발행됨 + 숨김 아님 (is_hidden, ADR-053)
function publicPublishedWhere() {
  return and(
    isNotNull(news.publishedAt),
    lte(news.publishedAt, sql`now()`),
    eq(news.isHidden, false),
  );
}

export async function insertAnalyticsEvent(data: NewAnalyticsEvent) {
  await db.insert(analyticsEvents).values(data);
}

export async function isPublicNews(newsId: string) {
  const [row] = await db
    .select({ id: news.id })
    .from(news)
    .where(and(eq(news.id, newsId), publicPublishedWhere()))
    .limit(1);
  return row != null;
}

// 기간 파라미터화 — make_interval(days => N) 로 바인딩(SQL 인젝션 안전). 호출부에서 허용 프리셋(7/30/90)으로 정규화
function recentAnalyticsWhere(days: number) {
  return gte(analyticsEvents.createdAt, sql`now() - make_interval(days => ${days})`);
}

export async function getNewsAnalyticsSummary(days: number, limit = 5) {
  const [totals] = await db
    .select({
      views: sql<number>`count(*) filter (where ${analyticsEvents.eventType} = 'news_view')::int`,
      uniqueViewers: sql<number>`count(distinct ${analyticsEvents.sessionId}) filter (where ${analyticsEvents.eventType} = 'news_view')::int`,
      heartClicks: sql<number>`count(*) filter (where ${analyticsEvents.eventType} = 'heart_on')::int`,
      shareClicks: sql<number>`count(*) filter (where ${analyticsEvents.eventType} = 'share_click')::int`,
    })
    .from(analyticsEvents)
    // 공지 등 news 외 이벤트 제외 — 소식 분석 시맨틱 유지.
    .where(and(recentAnalyticsWhere(days), isNotNull(analyticsEvents.newsId)));

  const topNews = await db
    .select({
      newsId: news.id,
      title: news.title,
      // 조회·공감 집계는 게시판 공유(사용자 결정 2026-08-13)라 언론 글도 인기글에 올라온다.
      // board 를 함께 실어야 어드민 링크를 각 게시판 편집 화면으로 보낼 수 있다 — 없으면 /admin/news/{pressId} 로 가서 404 (ADR-056)
      board: news.board,
      publishedAt: news.publishedAt,
      views: sql<number>`count(${analyticsEvents.id}) filter (where ${analyticsEvents.eventType} = 'news_view')::int`,
      uniqueViewers: sql<number>`count(distinct ${analyticsEvents.sessionId}) filter (where ${analyticsEvents.eventType} = 'news_view')::int`,
      heartClicks: sql<number>`count(${analyticsEvents.id}) filter (where ${analyticsEvents.eventType} = 'heart_on')::int`,
      shareClicks: sql<number>`count(${analyticsEvents.id}) filter (where ${analyticsEvents.eventType} = 'share_click')::int`,
    })
    .from(news)
    .leftJoin(
      analyticsEvents,
      and(eq(analyticsEvents.newsId, news.id), recentAnalyticsWhere(days)),
    )
    .where(publicPublishedWhere())
    .groupBy(news.id)
    .orderBy(
      desc(sql`count(${analyticsEvents.id}) filter (where ${analyticsEvents.eventType} = 'news_view')`),
      desc(news.publishedAt),
    )
    .limit(limit);

  const referrers = await db
    .select({
      referrer: analyticsEvents.referrer,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(
      and(
        recentAnalyticsWhere(days),
        eq(analyticsEvents.eventType, "news_view"),
        isNotNull(analyticsEvents.referrer),
      ),
    )
    .groupBy(analyticsEvents.referrer)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  return {
    totals: {
      views: totals?.views ?? 0,
      uniqueViewers: totals?.uniqueViewers ?? 0,
      heartClicks: totals?.heartClicks ?? 0,
      shareClicks: totals?.shareClicks ?? 0,
    },
    topNews,
    referrers,
  };
}

// 어드민 글 목록용 — 글별 누적 조회·공감 클릭·공유 클릭 (전체 기간). 목록에 보이는 글 id 만 집계
export async function getNewsStatsForAdmin(newsIds: string[]) {
  if (newsIds.length === 0) return [];
  return db
    .select({
      newsId: analyticsEvents.newsId,
      views: sql<number>`count(*) filter (where ${analyticsEvents.eventType} = 'news_view')::int`,
      heartClicks: sql<number>`count(*) filter (where ${analyticsEvents.eventType} = 'heart_on')::int`,
      shareClicks: sql<number>`count(*) filter (where ${analyticsEvents.eventType} = 'share_click')::int`,
    })
    .from(analyticsEvents)
    .where(inArray(analyticsEvents.newsId, newsIds))
    .groupBy(analyticsEvents.newsId);
}
