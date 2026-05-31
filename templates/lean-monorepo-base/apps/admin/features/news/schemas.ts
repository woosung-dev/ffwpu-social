// 어드민 소식 도메인의 Zod 스키마 SSoT - actions/ui 가 공유. packages/db 어휘와 일치 (status enum, body jsonb, categoryId notNull).
import { z } from "zod";

export const newsStatusEnum = z.enum(["draft", "published", "archived"]);
export type NewsStatus = z.infer<typeof newsStatusEnum>;

// Tiptap JSON 본문 — DB jsonb 정합. unknown 받아 actions 경계에서 검증 (다운스트림이 zJsonValue 등 강화 검토)
export const newsBodySchema = z.unknown();

export const newsCreateSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요").max(200),
  slug: z
    .string()
    .min(1, "슬러그를 입력하세요")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "소문자·숫자·하이픈만 허용"),
  summary: z.string().max(500).optional().default(""),
  body: newsBodySchema,
  // 카테고리 필수 (DB notNull, ADR-025 정합) — 다운스트림은 NewsForm 에 선택 UI 필수
  categoryId: z.string().uuid("카테고리를 선택하세요"),
  status: newsStatusEnum.default("draft"),
});

export const newsUpdateSchema = newsCreateSchema.extend({
  id: z.string().uuid(),
});

export type NewsCreateInput = z.infer<typeof newsCreateSchema>;
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;
