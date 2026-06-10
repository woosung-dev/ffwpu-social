// 공개 사이트 익명 분석 이벤트를 저장하는 테이블
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { news } from "./news";

export const ANALYTICS_EVENT_TYPES = [
  "news_view",
  "heart_on",
  "heart_off",
  "share_click",
] as const;

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsId: uuid("news_id").references(() => news.id, { onDelete: "cascade" }),
    sessionId: text("session_id").notNull(),
    eventType: text("event_type", { enum: ANALYTICS_EVENT_TYPES }).notNull(),
    path: text("path"),
    referrer: text("referrer"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    userAgentFamily: text("user_agent_family"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("analytics_events_news_created_idx").on(t.newsId, t.createdAt),
    index("analytics_events_type_created_idx").on(t.eventType, t.createdAt),
    index("analytics_events_session_created_idx").on(t.sessionId, t.createdAt),
  ],
);

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
