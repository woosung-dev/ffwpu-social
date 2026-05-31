// 카테고리 비즈니스 로직 — slug immutable, hard delete 금지
import * as categoryRepo from "../db/category.repo";
import type { CategoryCreateInput, CategoryRow, CategoryUpdateInput } from "../schemas";

export class CategoryServiceError extends Error {
  constructor(
    public code: "SLUG_TAKEN" | "CATEGORY_NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "CategoryServiceError";
  }
}

export function listActive(): Promise<CategoryRow[]> {
  return categoryRepo.listActive();
}

export function listAll(): Promise<CategoryRow[]> {
  return categoryRepo.listAll();
}

export async function createCategory(input: CategoryCreateInput): Promise<CategoryRow> {
  const existing = await categoryRepo.findBySlug(input.slug);
  if (existing) {
    throw new CategoryServiceError("SLUG_TAKEN", `slug 중복: ${input.slug}`);
  }
  return categoryRepo.create(input);
}

export async function updateCategory(input: CategoryUpdateInput): Promise<CategoryRow> {
  const updated = await categoryRepo.update(input);
  if (!updated) {
    throw new CategoryServiceError("CATEGORY_NOT_FOUND", "카테고리 없음");
  }
  return updated;
}

// hard delete 금지 — is_active 토글
export async function deactivateCategory(id: string): Promise<void> {
  await categoryRepo.deactivate(id);
}
