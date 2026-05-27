// 소식(news) Drizzle 쿼리 전담 — DAL. db import는 여기서만 (fullstack.md §3)
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { heartEvents, news, newsTags } from "@/db/schema";
import type { NewsCategoryValue } from "./schemas";

type ListOpts = {
  category?: NewsCategoryValue;
  page: number;
  limit: number;
};

export async function findAllNews(opts: ListOpts) {
  const offset = (opts.page - 1) * opts.limit;
  const where =
    opts.category && opts.category !== "all"
      ? eq(news.category, opts.category)
      : undefined;
  return db
    .select()
    .from(news)
    .where(where)
    .orderBy(desc(news.publishedAt))
    .limit(opts.limit)
    .offset(offset);
}

export async function countAllNews(opts: Pick<ListOpts, "category">) {
  const where =
    opts.category && opts.category !== "all"
      ? eq(news.category, opts.category)
      : undefined;
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(news)
    .where(where);
  return row?.count ?? 0;
}

export async function findNewsById(id: string) {
  const [row] = await db.select().from(news).where(eq(news.id, id)).limit(1);
  if (!row) return null;
  const tags = await db
    .select({ tag: newsTags.tag })
    .from(newsTags)
    .where(eq(newsTags.newsId, id));
  return { ...row, tags: tags.map((t) => t.tag) };
}

export async function countActiveHearts(newsId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(heartEvents)
    .where(and(eq(heartEvents.newsId, newsId), isNull(heartEvents.deletedAt)));
  return row?.count ?? 0;
}

export async function findActiveHeartEvent(
  newsId: string,
  ipHash: string,
  sessionId: string,
) {
  const [row] = await db
    .select()
    .from(heartEvents)
    .where(
      and(
        eq(heartEvents.newsId, newsId),
        eq(heartEvents.ipHash, ipHash),
        eq(heartEvents.sessionId, sessionId),
        isNull(heartEvents.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

// createNews / updateNews / toggleHeart — D-2 스프린트에서 채움 (admin/상세 페이지 구현 시)
