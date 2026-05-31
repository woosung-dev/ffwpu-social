// news 테이블 DAL — Drizzle 쿼리 SSOT, 비즈니스 규칙은 service 레이어로
import { db, schema } from "@myorg/db";
import { and, desc, eq, sql } from "drizzle-orm";
import type { NewsCreateInput, NewsRow, NewsStatus, NewsUpdateInput } from "../schemas";

const { news } = schema;

export async function findById(id: string): Promise<NewsRow | null> {
  const [row] = await db.select().from(news).where(eq(news.id, id)).limit(1);
  return (row as NewsRow | undefined) ?? null;
}

export async function findBySlug(slug: string): Promise<NewsRow | null> {
  const [row] = await db.select().from(news).where(eq(news.slug, slug)).limit(1);
  return (row as NewsRow | undefined) ?? null;
}

export interface ListParams {
  categoryId: string | null; // null = 전체
  status: NewsStatus;
  offset: number;
  limit: number;
}

export async function list({ categoryId, status, offset, limit }: ListParams): Promise<{
  rows: NewsRow[];
  total: number;
}> {
  const conditions = categoryId
    ? and(eq(news.status, status), eq(news.categoryId, categoryId))
    : eq(news.status, status);

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(news)
      .where(conditions)
      .orderBy(desc(news.publishedAt), desc(news.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(news)
      .where(conditions),
  ]);

  return { rows: rows as NewsRow[], total: count };
}

export async function create(input: NewsCreateInput): Promise<NewsRow> {
  const [row] = await db
    .insert(news)
    .values({
      ...input,
      publishedAt: input.status === "published" ? new Date() : null,
    })
    .returning();
  return row as NewsRow;
}

export async function update(input: NewsUpdateInput): Promise<NewsRow | null> {
  const { id, ...patch } = input;
  const [row] = await db
    .update(news)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(news.id, id))
    .returning();
  return (row as NewsRow | undefined) ?? null;
}

export async function remove(id: string): Promise<void> {
  await db.delete(news).where(eq(news.id, id));
}

export async function bumpHeartCount(id: string, delta: 1 | -1): Promise<number> {
  const [row] = await db
    .update(news)
    .set({ heartCount: sql`GREATEST(0, ${news.heartCount} + ${delta})` })
    .where(eq(news.id, id))
    .returning({ heartCount: news.heartCount });
  return row?.heartCount ?? 0;
}
