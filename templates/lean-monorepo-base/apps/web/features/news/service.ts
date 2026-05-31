// news 도메인 서비스 — 비즈니스 로직 (db import 금지, db.ts 의 함수만 호출)
import * as newsDb from "./db";
import { listNewsQuerySchema, type PublicNews } from "./schemas";

// 공개 사이트가 호출하는 listing — 페이지 컴포넌트 진입점
export async function listPublishedNews(
  query: Partial<{ limit: number; offset: number }> = {},
): Promise<Omit<PublicNews, "body">[]> {
  // 기본값 채우기는 Zod 가 담당 (parse 시 default 적용)
  const parsed = listNewsQuerySchema.parse({
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
  });
  return newsDb.listPublished(parsed);
}

// 상세 — slug → PublicNews 또는 null
export async function getPublishedNewsBySlug(
  slug: string,
): Promise<PublicNews | null> {
  const row = await newsDb.findPublishedBySlug(slug);
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    publishedAt: row.publishedAt,
  };
}
