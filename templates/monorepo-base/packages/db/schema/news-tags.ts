// 소식 태그 다중 자유 입력 — 카테고리와 역할 분리 (검색 보조 키워드, ADR-025)
import { pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { news } from "./news";

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  // 같은 문자열 중복 생성 방지 — 어드민 UI에서 normalize 후 upsert
  name: varchar("name", { length: 64 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsTags = pgTable(
  "news_tags",
  {
    newsId: uuid("news_id")
      .notNull()
      .references(() => news.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.newsId, table.tagId] })],
);

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type NewsTag = typeof newsTags.$inferSelect;
export type NewNewsTag = typeof newsTags.$inferInsert;
