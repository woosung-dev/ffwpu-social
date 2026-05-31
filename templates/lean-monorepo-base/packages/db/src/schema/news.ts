// 소식(news) 메인 테이블 — features 어휘 통일: status enum / body jsonb / summary text / name varchar(category). 카테고리는 categories FK 참조 onDelete restrict
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { users } from "./users";

// 발행 상태 — features 어휘. draft = 작성 중, published = 공개, archived = 비공개 보관
export const newsStatus = pgEnum("news_status", [
  "draft",
  "published",
  "archived",
]);

export const news = pgTable("news", {
  id: uuid("id").primaryKey().defaultRandom(),
  // 제목 (varchar — features 어휘 통일, 인덱스·정렬 고려)
  title: varchar("title", { length: 200 }).notNull(),
  // URL slug — kebab-case immutable
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  // 요약 (목록 카드용 짧은 발췌) — features 어휘 통일
  summary: text("summary"),
  // 본문 Tiptap JSON document — features 어휘 통일 (jsonb)
  body: jsonb("body").notNull(),
  // 발행 상태 — features 어휘 통일 (enum)
  status: newsStatus("status").notNull().default("draft"),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "restrict" })
    .notNull(),
  coverImageUrl: text("cover_image_url"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
});

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;
