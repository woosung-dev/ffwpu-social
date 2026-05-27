// 익명 좋아요 이벤트 — sessionId(클라 localStorage UUID) 1회 토글, soft delete로 취소 추적 (ADR-010 v1.1 단순화)
// "1인 1회 보장"이 아니라 "동일 브라우저 중복 완화" 수준 (localStorage 클리어·시크릿창으로 우회 가능). 좋아요는 KPI·랭킹·보상 대상 아님
import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { news } from "./news";

export const heartEvents = pgTable(
  "heart_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsId: uuid("news_id")
      .references(() => news.id, { onDelete: "cascade" })
      .notNull(),
    sessionId: text("session_id").notNull(), // 클라 localStorage UUID
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [uniqueIndex("uniq_heart").on(t.newsId, t.sessionId)],
);

export type HeartEvent = typeof heartEvents.$inferSelect;
export type NewHeartEvent = typeof heartEvents.$inferInsert;
