// 카테고리 Zod 스키마. slug 는 immutable (ADR-025) — update 스키마에서 제외
import { z } from "zod";

// slug — 영문 소문자 + 숫자 + 하이픈 (연속 하이픈 금지, 양끝 하이픈 금지)
export const CATEGORY_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해주세요").max(40),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(
      CATEGORY_SLUG_REGEX,
      "영문 소문자·숫자·하이픈만 가능합니다 (예: rice-sharing)",
    ),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

// 수정 — slug 제외 (ADR-025 + codex P2#1). 부분 업데이트 허용
export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(40).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
