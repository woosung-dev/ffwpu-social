// KPI 지표 — 메인 랜딩 KpiSection "한 해동안 만들어낸 변화" (Image #2). 5 row 고정 (ADR-003 누적, 삭제 금지 — isActive 토글). slug immutable
import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const kpiMetrics = pgTable("kpi_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  // 식별자 — Figma 디자인 4 KPI 매핑 (volunteer_count·volunteer_period·event_count·helped_household_count). slug 변경 금지
  slug: text("slug").notNull().unique(),
  // "누적 봉사자 수" — 디스플레이용 라벨
  label: text("label").notNull(),
  // 정렬·차트·계산용 수치. 기간 같은 비숫자 (38년 5개월) 는 null 허용
  value: integer("value"),
  // 자유 카피 "45,217명+" — 디스플레이 그대로 노출. 운영자 직접 갱신 단위
  displayValue: text("display_value").notNull(),
  // 보조 단위 "명"·"회"·"개" — displayValue 안에 포함되면 null
  unit: text("unit"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type KpiMetric = typeof kpiMetrics.$inferSelect;
export type NewKpiMetric = typeof kpiMetrics.$inferInsert;
