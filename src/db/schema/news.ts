// 소식(news) 메인 테이블 + 카테고리 enum 5개 — Figma SSOT (ADR-022, ADR-007)
import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const newsCategory = pgEnum("news_category", [
  "all",
  "family_healing",
  "local_volunteer",
  "environment",
  "rice_sharing",
]);

export const news = pgTable("news", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: jsonb("body").notNull(), // Tiptap JSON document
  category: newsCategory("category").notNull(),
  coverImageUrl: text("cover_image_url"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
});

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;
export type NewsCategory = (typeof newsCategory.enumValues)[number];
