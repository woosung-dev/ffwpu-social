// 소식 카테고리 — 어드민이 추가·수정·비활성화 가능 (운영 자율성). slug는 URL용 immutable, hard delete 금지(isActive 토글)
import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  // 표시 이름 — 예: "쌀 나눔" (varchar — features 어휘 통일, 짧은 라벨)
  name: varchar("name", { length: 50 }).notNull(),
  // URL·필터용 immutable — 예: "rice_sharing"
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  // 탭 노출 순서
  sortOrder: integer("sort_order").notNull().default(0),
  // 삭제 대신 비활성화 (운영 자율성)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
