// 익명 좋아요 이벤트 — sessionId(localStorage UUID) 토글, soft delete (ADR-026, ip_hash 미수집)
import { sql } from "drizzle-orm";
import { index, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { news } from "./news";

export const heartEvents = pgTable(
  "heart_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsId: uuid("news_id")
      .notNull()
      .references(() => news.id, { onDelete: "cascade" }),
    // 클라이언트 localStorage UUID — IP/User-Agent 미수집 (개인정보 보호)
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // soft delete — 같은 sessionId 재토글 시 deletedAt 갱신 (히스토리 보존)
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    // 활성 좋아요만 유니크 (deletedAt null 일 때) — Postgres partial unique
    uniqueIndex("heart_events_active_uniq")
      .on(table.newsId, table.sessionId)
      .where(sql`deleted_at IS NULL`),
    index("heart_events_news_id_idx").on(table.newsId),
  ],
);

export type HeartEvent = typeof heartEvents.$inferSelect;
export type NewHeartEvent = typeof heartEvents.$inferInsert;
