// 어드민 소식 도메인의 Drizzle 쿼리 모음 - service 가 호출
import { desc, eq } from "drizzle-orm";
import { db, news } from "@repo/db";
import type { NewsCreateInput, NewsUpdateInput } from "./schemas";

export type NewsRow = typeof news.$inferSelect;

export async function selectRecent(limit: number) {
  return db.select().from(news).orderBy(desc(news.createdAt)).limit(limit);
}

export async function selectById(id: string): Promise<NewsRow | null> {
  const [row] = await db.select().from(news).where(eq(news.id, id)).limit(1);
  return row ?? null;
}

export async function insertNews(input: NewsCreateInput): Promise<NewsRow> {
  const [row] = await db
    .insert(news)
    .values({
      title: input.title,
      slug: input.slug,
      summary: input.summary ?? "",
      body: input.body,
      categoryId: input.categoryId,
      status: input.status,
    })
    .returning();
  if (!row) throw new Error("insertNews: Postgres 가 row 를 반환하지 않음 (예기치 못한 상태)");
  return row;
}

export async function updateNewsRow(input: NewsUpdateInput): Promise<NewsRow | null> {
  const [row] = await db
    .update(news)
    .set({
      title: input.title,
      slug: input.slug,
      summary: input.summary ?? "",
      body: input.body,
      categoryId: input.categoryId,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(news.id, input.id))
    .returning();
  return row ?? null;
}

export async function deleteNewsRow(id: string): Promise<void> {
  await db.delete(news).where(eq(news.id, id));
}
