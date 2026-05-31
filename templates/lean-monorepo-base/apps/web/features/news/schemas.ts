// news 도메인 Zod v4 스키마 — actions 경계 검증, z.infer 단일 출처
import { z } from "zod";

// slug 정규화/regex 한 출처 (nextjs-shared.md §5 일치 원칙)
export const SLUG_REGEX = /^[a-z0-9-]+$/;

export const newsStatusSchema = z.enum(["draft", "published"]);
export type NewsStatus = z.infer<typeof newsStatusSchema>;

// 공개 사이트 목록 조회 파라미터
export const listNewsQuerySchema = z.object({
  limit: z.number().int().positive().max(50).default(20),
  offset: z.number().int().min(0).default(0),
});
export type ListNewsQuery = z.infer<typeof listNewsQuerySchema>;

// 상세 조회 — slug 검증
export const newsSlugSchema = z.object({
  slug: z.string().min(1).max(160).regex(SLUG_REGEX),
});
export type NewsSlugParam = z.infer<typeof newsSlugSchema>;

// 공개 사이트가 사용하는 직렬화 형태 (DB row 가 아닌 plain object)
export const publicNewsSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  body: z.string(),
  publishedAt: z.date().nullable(),
});
export type PublicNews = z.infer<typeof publicNewsSchema>;
