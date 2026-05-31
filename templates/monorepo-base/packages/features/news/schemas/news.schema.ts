// news 게시글 입력/출력 Zod 스키마 — actions/service 경계에서 검증 SSOT
import { z } from "zod";

// "all" 은 DB 카테고리가 아니라 UI 필터 전용 slug 다.
export const ALL_CATEGORY_SLUG = "all" as const;

export const newsStatusSchema = z.enum(["draft", "published", "archived"]);
export type NewsStatus = z.infer<typeof newsStatusSchema>;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const newsSlugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(slugRegex, "slug 은 소문자/숫자/하이픈만 허용한다");

export const newsCreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: newsSlugSchema,
  summary: z.string().max(500).default(""),
  body: z.string().min(1),
  categoryId: z.string().uuid(),
  tagSlugs: z.array(z.string().min(1).max(60)).max(20).default([]),
  coverImageUrl: z.url().nullable().default(null),
  status: newsStatusSchema.default("draft"),
});
export type NewsCreateInput = z.infer<typeof newsCreateSchema>;

export const newsUpdateSchema = newsCreateSchema.partial().extend({
  id: z.string().uuid(),
});
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;

export const newsListQuerySchema = z.object({
  // ALL_CATEGORY_SLUG 는 UI 전용. service 레이어에서 "전체" 로 해석.
  categorySlug: z.string().min(1).default(ALL_CATEGORY_SLUG),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  status: newsStatusSchema.default("published"),
});
export type NewsListQuery = z.infer<typeof newsListQuerySchema>;

export const newsRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  body: z.string(),
  categoryId: z.string().uuid(),
  coverImageUrl: z.url().nullable(),
  status: newsStatusSchema,
  heartCount: z.number().int().min(0),
  publishedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type NewsRow = z.infer<typeof newsRowSchema>;
