// 소식(news) Zod 스키마 + drizzle-zod 브릿지. 카테고리는 categories 테이블(동적) — slug 기반 필터. "all"은 UI 전용 필터 (DB 카테고리 아님, codex 권고)
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { news } from "@/db/schema";

// drizzle 스키마에서 base insert 스키마 추출
const newsInsertSchema = createInsertSchema(news);

// "전체" 탭 slug — client-safe constants 에서 re-export (Client Component 직접 import 는 constants 경유)
export { ALL_CATEGORY_SLUG } from "./constants";

// 어드민 글 생성/수정 입력 — categoryId(FK) + tags
export const newsInputSchema = newsInsertSchema
  .pick({
    title: true,
    body: true,
    categoryId: true,
    coverImageUrl: true,
    publishedAt: true,
  })
  .extend({
    title: z.string().min(1).max(200),
    categoryId: z.uuid(),
    tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  });

export type NewsInput = z.infer<typeof newsInputSchema>;

// 목록 조회 쿼리 — categorySlug 필터 ("all" 또는 카테고리 slug)
export const listNewsQuerySchema = z.object({
  categorySlug: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
});

export type ListNewsQuery = z.infer<typeof listNewsQuerySchema>;
