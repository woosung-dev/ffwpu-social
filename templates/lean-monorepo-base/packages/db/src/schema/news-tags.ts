// 소식 태그 (자유 입력, 다대다) — news 삭제 시 cascade. 같은 태그끼리 검색·필터 가능
import { pgTable, primaryKey, uuid, varchar } from "drizzle-orm/pg-core";
import { news } from "./news";

export const newsTags = pgTable(
  "news_tags",
  {
    newsId: uuid("news_id")
      .references(() => news.id, { onDelete: "cascade" })
      .notNull(),
    // 태그 라벨 (varchar — features 어휘 통일)
    tag: varchar("tag", { length: 50 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.newsId, t.tag] })],
);

export type NewsTag = typeof newsTags.$inferSelect;
export type NewNewsTag = typeof newsTags.$inferInsert;
