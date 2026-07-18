// 홈 팝업 메인 테이블 — 기간·활성 상태 기반 공개 노출과 관리용 이미지 메타를 저장한다.
import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const popups = pgTable(
  "popups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    imageUrl: text("image_url").notNull(),
    imageWidth: integer("image_width"),
    imageHeight: integer("image_height"),
    linkUrl: text("link_url"),
    linkTarget: text("link_target", { enum: ["self", "new_tab", "small_window"] })
      .notNull()
      .default("small_window"),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    // TS enum 은 DB 에서 강제되지 않으므로 CHECK 제약으로 임의 문자열 차단.
    check(
      "popups_link_target_check",
      sql`${table.linkTarget} in ('self', 'new_tab', 'small_window')`,
    ),
    // 공개 조회: is_active = true AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now()).
    index("popups_window_idx").on(table.isActive, table.startsAt, table.endsAt),
  ],
);

export type Popup = typeof popups.$inferSelect;
export type NewPopup = typeof popups.$inferInsert;
