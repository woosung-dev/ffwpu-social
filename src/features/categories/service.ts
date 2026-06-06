// 카테고리 비즈니스 로직 — 쿼리는 DAL 함수만 호출 (fullstack.md §3). db 는 트랜잭션 오케스트레이션 한정(news/service 동일)
import { db } from "@/db";
import { DomainError } from "@/lib/errors";
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
    throw new DomainError(`slug '${input.slug}' 가 이미 사용 중입니다.`);
  }
  // 새 카테고리는 목록 맨 끝에 배치 — 이후 드래그로 위치 조정
  const sortOrder = (await categoriesDb.getMaxSortOrder()) + 1;
  return categoriesDb.insertCategory({ ...input, sortOrder });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  if (input.name === undefined && input.isActive === undefined) {
    throw new DomainError("수정할 필드가 없습니다.");
  }
  return categoriesDb.updateCategoryById(id, input);
}

// 드래그 정렬 결과 저장 — 전체 카테고리 순서대로 1..N 재부여 (단일 트랜잭션)
export async function reorderCategories(orderedIds: string[]) {
  return db.transaction(async (tx) => {
    await categoriesDb.reorderCategories(tx, orderedIds);
  });
}
