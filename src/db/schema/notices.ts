// 공지사항(notices) 메인 테이블 — news에서 카테고리·태그·커버·랜딩 슬롯을 제거한 최소형 (ADR-042)
// 발행 상태 = publishedAt nullable (null=임시저장, 미래=예약발행) — news와 동일 시맨틱
import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const notices = pgTable(
  "notices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    body: jsonb("body").notNull(), // Tiptap JSON document
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    // 공개 목록: WHERE published_at <= now() ORDER BY published_at DESC
    index("notices_published_at_idx").on(table.publishedAt),
  ],
);

export type Notice = typeof notices.$inferSelect;
export type NewNotice = typeof notices.$inferInsert;
