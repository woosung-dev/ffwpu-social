// 공지사항 첨부파일 테이블 — 원본 파일명 보존(다운로드 Content-Disposition용), key는 uuid 기반 (ADR-041)
import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { notices } from "./notices";

export const noticeAttachments = pgTable(
  "notice_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    noticeId: uuid("notice_id")
      .references(() => notices.id, { onDelete: "cascade" })
      .notNull(),
    fileName: text("file_name").notNull(), // 사용자가 올린 원본 파일명 (한글 포함)
    key: text("key").notNull(), // S3 object key: notices/{noticeId}/attachments/{uuid}.{ext}
    mime: text("mime").notNull(), // presign 서명에 쓴 canonical MIME
    size: integer("size").notNull(), // bytes — 상한 20MB(ADR-041) < 2^31 이라 integer 충분
    // 표시 순서 — service가 배열 index(0..4)로 재부여. 재정렬 UPDATE 시 일시 충돌 문제로 unique 제약 없음
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notice_attachments_notice_id_idx").on(table.noticeId),
    uniqueIndex("notice_attachments_key_uniq").on(table.key),
  ],
);

export type NoticeAttachment = typeof noticeAttachments.$inferSelect;
export type NewNoticeAttachment = typeof noticeAttachments.$inferInsert;
