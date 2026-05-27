// 익명 좋아요 이벤트 — IP + 세션 조합으로 1회 토글. soft delete로 취소 추적 (ADR-010)
import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { news } from "./news";

export const heartEvents = pgTable(
  "heart_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsId: uuid("news_id")
      .references(() => news.id, { onDelete: "cascade" })
      .notNull(),
    ipHash: text("ip_hash").notNull(),
    sessionId: text("session_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [uniqueIndex("uniq_heart").on(t.newsId, t.ipHash, t.sessionId)],
);

export type HeartEvent = typeof heartEvents.$inferSelect;
export type NewHeartEvent = typeof heartEvents.$inferInsert;
