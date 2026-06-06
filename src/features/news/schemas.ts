// 소식(news) Zod 스키마 — 순수 Zod (drizzle-zod 미사용). Client Component 도 import 안전. 결정 로그 [T10 drizzle-zod 제거]
import { z } from "zod";

// "전체" 탭 slug — client-safe constants 에서 re-export
export { ALL_CATEGORY_SLUG } from "./constants";

// 어드민 글 생성/수정 입력 — body 는 jsonb (Tiptap JSON, 구조 검증은 NewsBodyRenderer T12 가 담당), tags 는 다중 입력
export const newsInputSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.unknown(),
  categoryId: z.uuid(),
  coverImageUrl: z.string().min(1).nullable().optional(),
  // 커버 이미지 픽셀 치수 — 클라 캡처, 마조네리 카드 비율. coverImageUrl 과 한 쌍
  coverImageWidth: z.number().int().positive().nullable().optional(),
  coverImageHeight: z.number().int().positive().nullable().optional(),
  publishedAt: z.date().nullable().optional(),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
});

export type NewsInput = z.infer<typeof newsInputSchema>;

// 사용자 사이트 목록 조회 — categorySlug 필터 ("all" 또는 카테고리 slug)
export const listNewsQuerySchema = z.object({
  categorySlug: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
});

export type ListNewsQuery = z.infer<typeof listNewsQuerySchema>;
