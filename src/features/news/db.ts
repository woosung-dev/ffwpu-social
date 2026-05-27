// 소식(news) Drizzle 쿼리 전담 — DAL. db import는 여기서만 (fullstack.md §3). 공개(published_at IS NOT NULL) / 어드민(모두) 분리 (codex P1#7). mutation 은 tx 인자 강제 (codex P1#5)
import { and, desc, eq, isNotNull, isNull, like, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, heartEvents, news, newsTags } from "@/db/schema";
import { ALL_CATEGORY_SLUG } from "./constants";

// service.ts 가 db.transaction 콜백에서 받는 tx 와 동일 — mutation 함수 시그니처로 그대로 노출 (T6 결정 로그 [tx alias])
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type ListOpts = {
  categorySlug?: string;
  page: number;
  limit: number;
};

function categoryWhere(categorySlug?: string) {
  return categorySlug && categorySlug !== ALL_CATEGORY_SLUG
    ? eq(categories.slug, categorySlug)
    : undefined;
}

// ─── 사용자 사이트 — published 만 (codex P1#7) ──────────────────────────────

// 공개 목록 — published_at IS NOT NULL 강제 (draft 노출 차단)
export async function listPublicNews(opts: ListOpts) {
  const offset = (opts.page - 1) * opts.limit;
  return db
    .select({
      id: news.id,
      title: news.title,
      categoryId: news.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverImageUrl: news.coverImageUrl,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(and(isNotNull(news.publishedAt), categoryWhere(opts.categorySlug)))
    .orderBy(desc(news.publishedAt))
    .limit(opts.limit)
    .offset(offset);
}

// 공개 카운트 — listPublicNews 페이지네이션 용. 동일 조건
export async function countPublicNews(opts: Pick<ListOpts, "categorySlug">) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(and(isNotNull(news.publishedAt), categoryWhere(opts.categorySlug)));
  return row?.count ?? 0;
}

// 공개 상세 — draft 접근 시 null. 본문(body) + 태그 join
export async function getPublicNewsById(id: string) {
  const [row] = await db
    .select({
      id: news.id,
      title: news.title,
      body: news.body,
      categoryId: news.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverImageUrl: news.coverImageUrl,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(and(eq(news.id, id), isNotNull(news.publishedAt)))
    .limit(1);
  if (!row) return null;
  const tags = await db
    .select({ tag: newsTags.tag })
    .from(newsTags)
    .where(eq(newsTags.newsId, id));
  return { ...row, tags: tags.map((t) => t.tag) };
}

// ─── 어드민 — 모든 글 (draft + published, codex P1#7 분리) ───────────────

type AdminListOpts = {
  page: number;
  limit: number;
  status?: "all" | "draft" | "published";
  categorySlug?: string;
};

function adminStatusWhere(status?: AdminListOpts["status"]) {
  if (status === "draft") return isNull(news.publishedAt);
  if (status === "published") return isNotNull(news.publishedAt);
  return undefined;
}

// 어드민 목록 — 모든 글 + 상태/카테고리 필터, createdAt DESC (결정 로그 [T6 정렬키])
export async function listForAdmin(opts: AdminListOpts) {
  const offset = (opts.page - 1) * opts.limit;
  return db
    .select({
      id: news.id,
      title: news.title,
      categoryId: news.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(and(adminStatusWhere(opts.status), categoryWhere(opts.categorySlug)))
    .orderBy(desc(news.createdAt))
    .limit(opts.limit)
    .offset(offset);
}

// 어드민 카운트 — listForAdmin 페이지네이션용. 동일 필터
export async function countForAdmin(
  opts: Pick<AdminListOpts, "status" | "categorySlug">,
) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(and(adminStatusWhere(opts.status), categoryWhere(opts.categorySlug)));
  return row?.count ?? 0;
}

// 어드민 상세 — draft 포함. 수정 페이지 진입점 (T10)
export async function getAdminNewsById(id: string) {
  const [row] = await db
    .select({
      id: news.id,
      title: news.title,
      body: news.body,
      categoryId: news.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverImageUrl: news.coverImageUrl,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(eq(news.id, id))
    .limit(1);
  if (!row) return null;
  const tags = await db
    .select({ tag: newsTags.tag })
    .from(newsTags)
    .where(eq(newsTags.newsId, id));
  return { ...row, tags: tags.map((t) => t.tag) };
}

// 대시보드 최근 N건 — 모든 글 (어드민 컨텍스트, draft 도 노출)
export async function listLatest(limit: number) {
  return db
    .select({
      id: news.id,
      title: news.title,
      categoryName: categories.name,
      categorySlug: categories.slug,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .orderBy(desc(news.createdAt))
    .limit(limit);
}

// 대시보드 카테고리별 글 수 — 활성 카테고리만 (결정 로그 [T11 활성만])
export async function countNewsByCategory() {
  return db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      count: sql<number>`count(${news.id})::int`,
    })
    .from(categories)
    .leftJoin(news, eq(news.categoryId, categories.id))
    .where(eq(categories.isActive, true))
    .groupBy(
      categories.id,
      categories.name,
      categories.slug,
      categories.sortOrder,
    )
    .orderBy(categories.sortOrder);
}

// 태그 자동완성 — prefix 매칭 + 빈도순 (결정 로그 [T6 빈도순])
export async function searchTags(prefix: string, limit = 10) {
  const trimmed = prefix.trim().toLowerCase();
  if (!trimmed) return [];
  return db
    .select({
      tag: newsTags.tag,
      count: sql<number>`count(*)::int`,
    })
    .from(newsTags)
    .where(like(newsTags.tag, `${trimmed}%`))
    .groupBy(newsTags.tag)
    .orderBy(desc(sql`count(*)`), newsTags.tag)
    .limit(limit);
}

// ─── 활성 카테고리 (사용자 사이트 CategoryTabs, 변경 X) ────────────────────

export async function findActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.sortOrder);
}

// ─── Heart (변경 X) ─────────────────────────────────────────────────────

export async function countActiveHearts(newsId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(heartEvents)
    .where(and(eq(heartEvents.newsId, newsId), isNull(heartEvents.deletedAt)));
  return row?.count ?? 0;
}

export async function findActiveHeartEvent(newsId: string, sessionId: string) {
  const [row] = await db
    .select()
    .from(heartEvents)
    .where(
      and(
        eq(heartEvents.newsId, newsId),
        eq(heartEvents.sessionId, sessionId),
        isNull(heartEvents.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

// ─── Mutation — transaction 안에서만 호출 (codex P1#5, tx 인자 강제) ────────

type NewsInsertData = Omit<
  typeof news.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;
type NewsUpdateData = Partial<NewsInsertData>;

// 글 신규 — service 가 tx 안에서 호출. 태그는 replaceNewsTags 별도
export async function insertNews(tx: Tx, data: NewsInsertData) {
  const [row] = await tx
    .insert(news)
    .values(data)
    .returning({ id: news.id });
  return row;
}

// 글 수정 — updatedAt 자동 갱신, 없으면 null
export async function updateNews(tx: Tx, id: string, data: NewsUpdateData) {
  const [row] = await tx
    .update(news)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(news.id, id))
    .returning({ id: news.id });
  return row ?? null;
}

// 글 삭제 — news_tags / heart_events 는 FK cascade. S3 객체 청소는 service best-effort
export async function deleteNews(tx: Tx, id: string) {
  const [row] = await tx
    .delete(news)
    .where(eq(news.id, id))
    .returning({ id: news.id });
  return row ?? null;
}

// 태그 일괄 교체 — 전체 삭제 후 dedupe 재삽입. 태그 20개 한계, diff 계산 X (codex P1#5)
export async function replaceNewsTags(
  tx: Tx,
  newsId: string,
  tags: string[],
) {
  await tx.delete(newsTags).where(eq(newsTags.newsId, newsId));
  if (tags.length === 0) return;
  const deduped = Array.from(new Set(tags));
  await tx.insert(newsTags).values(deduped.map((tag) => ({ newsId, tag })));
}
