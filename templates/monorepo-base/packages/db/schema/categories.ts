// 카테고리 동적 관리 테이블 — 어드민이 추가·정렬·비활성화 (ADR-025, slug immutable, hard delete 금지)
import { boolean, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// UI 필터 전용 "전체" slug — DB 카테고리 아님 (categories 테이블 저장 금지)
export const ALL_CATEGORY_SLUG = "all" as const;

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  // slug immutable — URL 안정성, 기존 글 참조 보존
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  // 표시 이름 — features 어휘 SSoT (예: "쌀 나눔")
  name: varchar("name", { length: 100 }).notNull(),
  // 어드민에서 비활성화 가능 (hard delete 대신 토글)
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
