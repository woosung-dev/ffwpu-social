// KPI 지표 — 'impact' = 랜딩 KpiSection "한 해동안 만들어낸 변화" (Image #2, 4행) / 'story' = StorySection 통계 (후원기관·지원가정·지역시설, 3행).
// 누적·삭제 금지 (ADR-003) — isActive 토글. slug immutable. shape 동일하여 section 판별 컬럼으로 한 테이블 재사용 (anti-slop 중복 회피)
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const kpiMetrics = pgTable(
  "kpi_metrics",
  {
  id: uuid("id").primaryKey().defaultRandom(),
  // 식별자 — Figma 디자인 매핑. slug 변경 금지
  slug: text("slug").notNull().unique(),
  // 노출 섹션 판별 — 'impact' (KpiSection) / 'story' (StorySection). 기존 행은 마이그레이션 기본값 'impact'
  section: text("section", { enum: ["impact", "story"] })
    .notNull()
    .default("impact"),
  // "누적 봉사자 수" — 디스플레이용 라벨
  label: text("label").notNull(),
  // 라벨 아래 작은 보조 라벨 "지원가정" 등 — 운영자 편집, 없으면 null (가정수 카드 등에서 사용)
  sublabel: text("sublabel"),
  // 정렬·차트·계산용 수치. 기간 같은 비숫자 (38년 5개월) 는 null 허용. story 섹션은 hide-when-empty 판정 기준 (null/0 → 숨김)
  value: integer("value"),
  // 자유 카피 "45,217명+" — 디스플레이 그대로 노출. 운영자 직접 갱신 단위
  displayValue: text("display_value").notNull(),
  // 보조 단위 "명"·"회"·"개" — displayValue 안에 포함되면 null
  unit: text("unit"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  // TS enum 은 DB 에서 강제되지 않으므로 CHECK 제약으로 임의 문자열 차단 (codex C-MIG-1)
  (table) => [
    check(
      "kpi_metrics_section_check",
      sql`${table.section} in ('impact', 'story')`,
    ),
  ],
);

export type KpiMetric = typeof kpiMetrics.$inferSelect;
export type NewKpiMetric = typeof kpiMetrics.$inferInsert;
