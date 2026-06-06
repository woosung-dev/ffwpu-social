// 카테고리 Zod 스키마. slug 는 immutable (ADR-025) — update 스키마에서 제외
import { z } from "zod";

// slug — 영문 소문자 + 숫자 + 하이픈 (연속 하이픈 금지, 양끝 하이픈 금지)
export const CATEGORY_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// 추가 — sortOrder 입력받지 않음. 새 카테고리는 service 에서 맨 끝(max+1)에 자동 배치 후 드래그로 정렬
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
});

// 수정 — slug 제외 (ADR-025 + codex P2#1) · sortOrder 제외(드래그 정렬 전용). 부분 업데이트 허용
export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(40).optional(),
  isActive: z.boolean().optional(),
});

// 정렬 일괄 저장 — 드래그 결과(전체 카테고리 순서)를 받아 1..N sortOrder 재부여 (히어로 setHeroOrder 미러)
export const reorderCategoriesSchema = z
  .object({
    orderedIds: z
      .array(z.uuid())
      .min(1, "정렬할 카테고리가 없습니다."),
  })
  .refine((v) => new Set(v.orderedIds).size === v.orderedIds.length, {
    message: "중복된 카테고리가 포함되어 있습니다.",
  });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
