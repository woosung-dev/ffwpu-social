// 동적 카테고리 입력 스키마 — slug immutable, hard delete 금지(is_active 토글)
import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(60),
  slug: z.string().min(1).max(60).regex(slugRegex),
  description: z.string().max(200).default(""),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;

// slug 는 immutable — 업데이트 불가
export const categoryUpdateSchema = categoryCreateSchema
  .omit({ slug: true })
  .partial()
  .extend({ id: z.string().uuid() });
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

export const categoryRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CategoryRow = z.infer<typeof categoryRowSchema>;
