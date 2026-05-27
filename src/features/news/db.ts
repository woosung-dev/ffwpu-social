// 소식(news) Drizzle 쿼리 전담 — DAL. db import는 여기서만 (fullstack.md §3). 카테고리는 categories join, heart는 sessionId 기반
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, heartEvents, news, newsTags } from "@/db/schema";
import { ALL_CATEGORY_SLUG } from "./constants";

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

export async function findAllNews(opts: ListOpts) {
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
    .where(categoryWhere(opts.categorySlug))
    .orderBy(desc(news.publishedAt))
    .limit(opts.limit)
    .offset(offset);
}

export async function countAllNews(opts: Pick<ListOpts, "categorySlug">) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(categoryWhere(opts.categorySlug));
  return row?.count ?? 0;
}

export async function findNewsById(id: string) {
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

// 활성 카테고리 목록 (정렬) — CategoryTabs 데이터 소스
export async function findActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.sortOrder);
}

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

// createNews / updateNews / toggleHeart — D-2 스프린트에서 채움 (admin/상세 페이지 구현 시)
