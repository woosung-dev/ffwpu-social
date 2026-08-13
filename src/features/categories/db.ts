// 카테고리 Drizzle 쿼리 전담 — DAL (fullstack.md §3). slug immutable: update 시 set 객체에 slug 제외 강제 (codex P2#1 + ADR-025)
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, news } from "@/db/schema";
import type { NewsBoard } from "@/features/news/board";

// 트랜잭션 핸들 타입 — reorder 등 다중 update 를 단일 트랜잭션으로 묶을 때 사용 (news/db.ts 동일 패턴)
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// 게시판 스코프 (ADR-056) — 아래 조회·생성 함수는 board 를 첫 인자로 강제 받는다.
// 기본값을 주지 않아 넘기지 않으면 컴파일 에러 → 언론 카테고리가 활동 스토리 화면에 새지 않는다
export async function listAllCategoriesForAdmin(board: NewsBoard) {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      sortOrder: categories.sortOrder,
      isActive: categories.isActive,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
    })
    .from(categories)
    .where(eq(categories.board, board))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

// 카테고리별 글 수 (운영 통계 — Dashboard·CategoryManager row 보조)
export async function countNewsPerCategory(board: NewsBoard) {
  return db
    .select({
      categoryId: news.categoryId,
      count: sql<number>`count(*)::int`,
    })
    .from(news)
    .where(eq(news.board, board))
    .groupBy(news.categoryId);
}

// slug 중복 체크 (create 시 사전 검증) — unique 가 (board, slug) 복합이라 board 조건 필수
export async function getCategoryBySlug(board: NewsBoard, slug: string) {
  const [row] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.board, board), eq(categories.slug, slug)))
    .limit(1);
  return row ?? null;
}

// 현재 최대 sortOrder — 신규 카테고리를 맨 끝에 배치하기 위한 기준값 (없으면 0)
export async function getMaxSortOrder(board: NewsBoard) {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${categories.sortOrder}), 0)::int` })
    .from(categories)
    .where(eq(categories.board, board));
  return row?.max ?? 0;
}

export async function insertCategory(data: {
  board: NewsBoard;
  name: string;
  slug: string;
  sortOrder: number;
}) {
  const [row] = await db
    .insert(categories)
    .values({ ...data, isActive: true })
    .returning();
  return row;
}

// updateData 타입은 slug·sortOrder 제외 — slug 변경 차단(ADR-025) + 정렬은 reorderCategories 전용 경로로 일원화
export type UpdateCategoryData = {
  name?: string;
  isActive?: boolean;
};

export async function updateCategoryById(id: string, data: UpdateCategoryData) {
  const set = { ...data, updatedAt: new Date() };
  const [row] = await db
    .update(categories)
    .set(set)
    .where(eq(categories.id, id))
    .returning();
  return row ?? null;
}

// 특정 카테고리에 속한 글 수 — 삭제 가능 여부 판정용. board 무관(category_id 가 이미 게시판을 함의).
// tx 필수: 확인과 삭제가 같은 트랜잭션이어야 그 사이에 글이 끼어드는 것을 막는다
export async function countNewsInCategory(categoryId: string, tx: Tx) {
  const [row] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(news)
    .where(eq(news.categoryId, categoryId));
  return row?.count ?? 0;
}

// 카테고리 hard delete — service 가 글 0건을 확인한 뒤에만 호출한다.
// news.category_id 는 onDelete restrict 라 글이 남아 있으면 DB 가 한 번 더 거부한다(이중 안전장치)
export async function deleteCategoryById(id: string, tx: Tx) {
  const [row] = await tx
    .delete(categories)
    .where(eq(categories.id, id))
    .returning({ id: categories.id });
  return row ?? null;
}

// 일괄 정렬 — 드래그 순서대로 1..N sortOrder 재부여. 단일 트랜잭션(전부 성공/전부 롤백).
// 히어로와 달리 advisory lock 불필요: sortOrder 에 unique 제약이 없어 동시 저장도 last-write-wins 로 안전(데이터 손상 없음) + 단일 super 계정
export async function reorderCategories(tx: Tx, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await tx
      .update(categories)
      .set({ sortOrder: i + 1, updatedAt: new Date() })
      .where(eq(categories.id, orderedIds[i]));
  }
}
