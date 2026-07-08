// 공지사항(notices) 메인 테이블 — news에서 카테고리·태그·커버·랜딩 슬롯을 제거한 최소형 (ADR-042)
// 발행 상태 = publishedAt nullable (null=임시저장, 미래=예약발행) — news와 동일 시맨틱
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const notices = pgTable(
  "notices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    body: jsonb("body").notNull(), // Tiptap JSON document
    publishedAt: timestamp("published_at"),
    // 상위 고정 순서 (1..N). NULL = 미고정. 발행 공지만 대상 — news heroRank 패턴 (ADR-043)
    pinnedRank: integer("pinned_rank"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    // 공개 목록: WHERE published_at <= now() ORDER BY pinned_rank ASC NULLS LAST, published_at DESC
    index("notices_published_at_idx").on(table.publishedAt),
    // 같은 고정 자리 중복 불가 — NULL(미고정)은 여럿 허용 (news_hero_rank_uniq 패턴)
    uniqueIndex("notices_pinned_rank_uniq")
      .on(table.pinnedRank)
      .where(sql`${table.pinnedRank} IS NOT NULL`),
  ],
);

export type Notice = typeof notices.$inferSelect;
export type NewNotice = typeof notices.$inferInsert;
