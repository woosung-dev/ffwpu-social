// 카테고리 비즈니스 로직 — db import 금지. DAL 함수만 호출 (fullstack.md §3)
import * as categoriesDb from "./db";
import type { CreateCategoryInput, UpdateCategoryInput } from "./schemas";

export async function listAllForAdmin() {
  const [items, perCategory] = await Promise.all([
    categoriesDb.listAllCategoriesForAdmin(),
    categoriesDb.countNewsPerCategory(),
  ]);
  const counts = new Map(perCategory.map((r) => [r.categoryId, r.count]));
  return items.map((c) => ({ ...c, newsCount: counts.get(c.id) ?? 0 }));
}

export async function createCategory(input: CreateCategoryInput) {
  const existing = await categoriesDb.getCategoryBySlug(input.slug);
  if (existing) {
    throw new Error(`slug '${input.slug}' 가 이미 사용 중입니다.`);
  }
  return categoriesDb.insertCategory(input);
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  if (
    input.name === undefined &&
    input.sortOrder === undefined &&
    input.isActive === undefined
  ) {
    throw new Error("수정할 필드가 없습니다.");
  }
  return categoriesDb.updateCategoryById(id, input);
}
