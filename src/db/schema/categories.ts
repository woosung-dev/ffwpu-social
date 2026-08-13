// 소식 카테고리 — 어드민이 추가·수정·비활성화 가능 (운영 자율성 ADR-002). slug는 URL용 immutable, hard delete 금지(isActive 토글)
// board 로 게시판 분리 (ADR-056) — 활동 스토리와 언론 속 사회공헌이 같은 이름 카테고리를 각자 가질 수 있어야 하므로 slug unique 는 (board, slug) 복합
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(), // 표시 이름 — 예: "쌀 나눔"
    slug: text("slug").notNull(), // URL·필터용 immutable — 예: "rice_sharing"
    // 소속 게시판 — 'story' = 활동 스토리 / 'press' = 언론 속 사회공헌. 기존 행은 전부 story
    board: text("board", { enum: ["story", "press"] }).notNull().default("story"),
    sortOrder: integer("sort_order").notNull().default(0), // 탭 노출 순서
    isActive: boolean("is_active").notNull().default(true), // 삭제 대신 비활성화
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // TS enum 은 DB 에서 강제되지 않으므로 CHECK 로 임의 문자열 차단 (popups.link_target 과 동일 패턴)
    check("categories_board_check", sql`${table.board} in ('story', 'press')`),
    // 게시판별 slug 유일 — 전역 unique 였으면 두 게시판이 같은 카테고리명을 못 쓴다
    uniqueIndex("categories_board_slug_uniq").on(table.board, table.slug),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
