// 소식(news) 메인 테이블 — 카테고리는 categories FK 참조 (어드민 관리, ADR-007 v1.1). onDelete restrict (카테고리에 글 있으면 삭제 불가, isActive 비활성화)
// story_slot / featured_rank — 메인 랜딩 큐레이션 (PR B/C). NULL = 자동 fallback, 정수 = 운영자 수동 pin
import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { users } from "./users";

export const news = pgTable(
  "news",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    body: jsonb("body").notNull(), // Tiptap JSON document
    categoryId: uuid("category_id")
      .references(() => categories.id, { onDelete: "restrict" })
      .notNull(),
    coverImageUrl: text("cover_image_url"),
    // 커버 이미지 실제 픽셀 치수 — 클라(naturalWidth/Height) 캡처. 마조네리 카드 높이·CLS 0 용. NULL = 레거시(폴백 비율)
    coverImageWidth: integer("cover_image_width"),
    coverImageHeight: integer("cover_image_height"),
    publishedAt: timestamp("published_at"),
    // 공개 노출 토글 (ADR-053) — 발행일·랜딩 슬롯을 보존한 채 공개 사이트에서만 숨김.
    // publishedAt=null(미발행) 과 구분: "한 번도 안 낸 글" ≠ "냈다가 잠시 내린 글"
    isHidden: boolean("is_hidden").default(false).notNull(),
    // 메인 랜딩 StorySection 상단 슬롯 (1~2). NULL = 비노출. UNIQUE WHERE NOT NULL — 같은 자리 중복 불가
    storySlot: integer("story_slot"),
    // 메인 랜딩 ArticleGridSection 하단 슬롯 (1~7). NULL = 자동 fallback (최신순). 운영자 pin
    featuredRank: integer("featured_rank"),
    // /news 소식 페이지 상단 Hero 슬롯 (1~4). NULL = 비노출. 전 카테고리 대상, 자동 fallback 없음. 드래그 정렬
    heroRank: integer("hero_rank"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("news_story_slot_uniq")
      .on(table.storySlot)
      .where(sql`${table.storySlot} IS NOT NULL`),
    uniqueIndex("news_featured_rank_uniq")
      .on(table.featuredRank)
      .where(sql`${table.featuredRank} IS NOT NULL`),
    uniqueIndex("news_hero_rank_uniq")
      .on(table.heroRank)
      .where(sql`${table.heroRank} IS NOT NULL`),
  ],
);

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;
