// 소식(news) Zod 스키마 + drizzle-zod 브릿지. 폼 입력 검증과 타입 단일 출처
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { news } from "@/db/schema";

// drizzle 스키마에서 base insert 스키마 추출
const newsInsertSchema = createInsertSchema(news);

export const newsCategorySchema = z.enum([
  "all",
  "family_healing",
  "local_volunteer",
  "environment",
  "rice_sharing",
]);

export type NewsCategoryValue = z.infer<typeof newsCategorySchema>;

// 어드민 글 생성/수정 입력 — title, body, category, optional fields + tags
export const newsInputSchema = newsInsertSchema
  .pick({
    title: true,
    body: true,
    category: true,
    coverImageUrl: true,
    publishedAt: true,
  })
  .extend({
    title: z.string().min(1).max(200),
    tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  });

export type NewsInput = z.infer<typeof newsInputSchema>;

// 목록 조회 쿼리 — searchParams 매핑
export const listNewsQuerySchema = z.object({
  category: newsCategorySchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
});

export type ListNewsQuery = z.infer<typeof listNewsQuerySchema>;
