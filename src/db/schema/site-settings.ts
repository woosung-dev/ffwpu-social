// 사이트 전역 운영 설정 — 단일 행(id=1) 고정. 설정이 늘면 컬럼을 추가한다 (ADR-039 Expand/Contract 가산형)
// 행이 없으면 코드가 기본값을 쓰고, 저장 시 upsert 로 생성한다 → 마이그레이션에 데이터 조작 없음
import { sql } from "drizzle-orm";
import { check, integer, pgTable, timestamp } from "drizzle-orm/pg-core";

export const siteSettings = pgTable(
  "site_settings",
  {
    id: integer("id").primaryKey().default(1),
    // 랜딩 ArticleGridSection 에 실제로 노출할 카드 수. 어드민이 지정 가능한 슬롯(12)보다 작을 수 있다
    featuredVisibleCount: integer("featured_visible_count").notNull().default(6),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [check("site_settings_singleton", sql`${table.id} = 1`)],
);

export type SiteSettings = typeof siteSettings.$inferSelect;
