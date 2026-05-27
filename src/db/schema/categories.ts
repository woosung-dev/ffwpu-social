// 소식 카테고리 — 어드민이 추가·수정·비활성화 가능 (운영 자율성 ADR-002). slug는 URL용 immutable, hard delete 금지(isActive 토글)
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // 표시 이름 — 예: "쌀 나눔"
  slug: text("slug").notNull().unique(), // URL·필터용 immutable — 예: "rice_sharing"
  sortOrder: integer("sort_order").notNull().default(0), // 탭 노출 순서
  isActive: boolean("is_active").notNull().default(true), // 삭제 대신 비활성화
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
