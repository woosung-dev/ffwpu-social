// 익명 좋아요 이벤트 — sessionId(클라 localStorage UUID) 1회 토글, soft delete로 취소 추적. "1인 1회 보장"이 아니라 "동일 브라우저 중복 완화" 수준 (KPI 대상 아님)
import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { news } from "./news";

export const heartEvents = pgTable(
  "heart_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsId: uuid("news_id")
      .references(() => news.id, { onDelete: "cascade" })
      .notNull(),
    // 클라 localStorage UUID — IP/개인정보 미수집
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("uniq_heart").on(t.newsId, t.sessionId)],
);

export type HeartEvent = typeof heartEvents.$inferSelect;
export type NewHeartEvent = typeof heartEvents.$inferInsert;
