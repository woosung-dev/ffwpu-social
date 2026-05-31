// news 도메인 DB 레이어 (DAL) — Drizzle 쿼리 전담, service 만 호출
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db, schema } from "@repo/db";
import type { ListNewsQuery } from "./schemas";

const { news } = schema;

// 공개된 글 목록 — published 상태 + publishedAt 존재
export async function listPublished(query: ListNewsQuery) {
  return db
    .select({
      id: news.id,
      slug: news.slug,
      title: news.title,
      summary: news.summary,
      publishedAt: news.publishedAt,
    })
    .from(news)
    .where(and(eq(news.status, "published"), isNotNull(news.publishedAt)))
    .orderBy(desc(news.publishedAt))
    .limit(query.limit)
    .offset(query.offset);
}

// slug 로 공개 글 단건 조회
export async function findPublishedBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(news)
    .where(and(eq(news.slug, slug), eq(news.status, "published")))
    .limit(1);
  return row ?? null;
}
