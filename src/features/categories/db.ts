// 카테고리 Drizzle 쿼리 전담 — DAL (fullstack.md §3). slug immutable: update 시 set 객체에 slug 제외 강제 (codex P2#1 + ADR-025)
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, news } from "@/db/schema";

// 어드민 — 모든 카테고리 (비활성 포함, sortOrder 우선·이름 보조)
export async function listAllCategoriesForAdmin() {
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
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

// 카테고리별 글 수 (운영 통계 — Dashboard·CategoryManager row 보조)
export async function countNewsPerCategory() {
  return db
    .select({
      categoryId: news.categoryId,
      count: sql<number>`count(*)::int`,
    })
    .from(news)
    .groupBy(news.categoryId);
}

// slug 중복 체크 (create 시 사전 검증)
export async function getCategoryBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function insertCategory(data: {
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

// updateData 타입은 slug 제외 — 컴파일 단계에서 slug 변경 차단 (ADR-025 immutable)
export type UpdateCategoryData = {
  name?: string;
  sortOrder?: number;
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
