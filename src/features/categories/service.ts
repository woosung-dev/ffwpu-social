// 카테고리 비즈니스 로직 — 쿼리는 DAL 함수만 호출 (fullstack.md §3). db 는 트랜잭션 오케스트레이션 한정(news/service 동일)
import { db } from "@/db";
import { DomainError } from "@/lib/errors";
import type { NewsBoard } from "@/features/news/board";
import * as categoriesDb from "./db";
import type { CreateCategoryInput, UpdateCategoryInput } from "./schemas";

export async function listAllForAdmin(board: NewsBoard) {
  const [items, perCategory] = await Promise.all([
    categoriesDb.listAllCategoriesForAdmin(board),
    categoriesDb.countNewsPerCategory(board),
  ]);
  const counts = new Map(perCategory.map((r) => [r.categoryId, r.count]));
  return items.map((c) => ({ ...c, newsCount: counts.get(c.id) ?? 0 }));
}

export async function createCategory(board: NewsBoard, input: CreateCategoryInput) {
  // 중복은 같은 게시판 안에서만 — 다른 게시판이 같은 slug 를 쓰는 건 정상 (ADR-056)
  const existing = await categoriesDb.getCategoryBySlug(board, input.slug);
  if (existing) {
    throw new DomainError(`slug '${input.slug}' 가 이미 사용 중입니다.`);
  }
  // 새 카테고리는 목록 맨 끝에 배치 — 이후 드래그로 위치 조정
  const sortOrder = (await categoriesDb.getMaxSortOrder(board)) + 1;
  return categoriesDb.insertCategory({ ...input, board, sortOrder });
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
