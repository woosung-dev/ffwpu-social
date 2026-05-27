// 소식(news) 메인 테이블 — 카테고리는 categories FK 참조 (어드민 관리, ADR-007 v1.1). onDelete restrict (카테고리에 글 있으면 삭제 불가, isActive 비활성화)
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { users } from "./users";

export const news = pgTable("news", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: jsonb("body").notNull(), // Tiptap JSON document
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "restrict" })
    .notNull(),
  coverImageUrl: text("cover_image_url"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
});

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;
