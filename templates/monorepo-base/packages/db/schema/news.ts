// 쌀 나눔 소식 게시글 테이블 — 카테고리 FK 1개 + 본문(Tiptap JSON) + draft/published/archived 상태
import { index, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { categories } from "./categories";
import { users } from "./users";

// 발행 상태 enum — features SSoT 어휘 (draft | published | archived)
export const NEWS_STATUS = ["draft", "published", "archived"] as const;
export type NewsStatus = (typeof NEWS_STATUS)[number];

export const news = pgTable(
  "news",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // URL slug — 어드민에서 수정 가능하나 발행 후엔 안정 유지 권장
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    title: varchar("title", { length: 200 }).notNull(),
    summary: text("summary"),
    // Tiptap JSON 본문 (HTML 직저장 대신 구조화) — Zod로 검증 후 저장
    body: jsonb("body").notNull().default({}),
    coverImageUrl: text("cover_image_url"),
    // 카테고리는 categories 테이블 FK 1개만 (1글 1카테고리 — ADR-025)
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    // draft | published | archived — Drizzle pg varchar + Zod enum 검증
    status: varchar("status", { length: 16 }).notNull().default("draft").$type<NewsStatus>(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    heartCount: integer("heart_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("news_category_published_idx").on(table.categoryId, table.publishedAt),
    index("news_status_published_at_idx").on(table.status, table.publishedAt),
  ],
);

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;
