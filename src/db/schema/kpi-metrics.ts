// KPI 지표 — 'impact' = 랜딩 KpiSection "한 해동안 만들어낸 변화" (4행) / 'story' = StorySection 통계 (후원기관·지원가정·지역시설, 3행) / 'story_text' = StorySection 카피(태그·제목·부제, displayValue 에 줄바꿈 \n 포함).
// 누적·삭제 금지 (ADR-003) — isActive 토글. slug immutable. shape 동일하여 section 판별 컬럼으로 한 테이블 재사용 (anti-slop 중복 회피)
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  doublePrecision,
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
  // 노출 섹션 판별 — 'impact' (KpiSection) / 'story' (StorySection 통계) / 'story_text' (StorySection 카피). 기존 행은 마이그레이션 기본값 'impact'
  section: text("section", { enum: ["impact", "story", "story_text"] })
    .notNull()
    .default("impact"),
  // "누적 봉사자 수" — 디스플레이용 라벨
  label: text("label").notNull(),
  // 라벨 아래 작은 보조 라벨 "지원가정" 등 — 운영자 편집, 없으면 null (가정수 카드 등에서 사용)
  sublabel: text("sublabel"),
  // 표시 주도 수치 — 숫자 있으면 화면은 '숫자+단위'로 자동 생성(천단위 콤마). 소수(529.4) 허용. 비숫자(38년 5개월)는 null + displayValue 사용.
  value: doublePrecision("value"),
  // 표시 override — 비우면 value+unit 자동. 숫자로 표현 못하는 특수 표기("38년 5개월")만 직접 입력. notNull 유지(빈 문자열 허용).
  displayValue: text("display_value").notNull(),
  // 보조 단위 "명"·"회"·"개" — displayValue 안에 포함되면 null
  unit: text("unit"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  // 값 출처 — null/'google_sheets' = 시트 동기화 대상 / 'manual' = 운영자가 직접 수정 → 동기화에서 제외(override 우선)
  syncSource: text("sync_source", { enum: ["manual", "google_sheets"] }),
  // 마지막 시트 동기화 성공 시각 — 어드민 표시용, 미동기화는 null
  lastSyncedAt: timestamp("last_synced_at"),
  // 시트 원본 라벨 — 추적·디버깅용 (어느 시트 항목에서 왔는지)
  externalId: text("external_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  // TS enum 은 DB 에서 강제되지 않으므로 CHECK 제약으로 임의 문자열 차단 (codex C-MIG-1)
  (table) => [
    check(
      "kpi_metrics_section_check",
      sql`${table.section} in ('impact', 'story', 'story_text')`,
    ),
    // TS enum 비강제 → null 허용하되 임의 문자열 차단 (section_check 와 동일 패턴)
    check(
      "kpi_metrics_sync_source_check",
      sql`${table.syncSource} in ('manual', 'google_sheets')`,
    ),
  ],
);

export type KpiMetric = typeof kpiMetrics.$inferSelect;
export type NewKpiMetric = typeof kpiMetrics.$inferInsert;
