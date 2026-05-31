// heart_events DAL — soft delete 기반 익명 좋아요 토글
import { db, schema } from "@myorg/db";
import { and, eq, isNull, sql } from "drizzle-orm";

const { heartEvents } = schema;

export async function findActive(
  newsId: string,
  sessionId: string,
): Promise<{ id: string } | null> {
  const [row] = await db
    .select({ id: heartEvents.id })
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

export async function insert(newsId: string, sessionId: string): Promise<void> {
  await db.insert(heartEvents).values({ newsId, sessionId });
}

export async function softDelete(id: string): Promise<void> {
  await db
    .update(heartEvents)
    .set({ deletedAt: new Date() })
    .where(eq(heartEvents.id, id));
}

export async function countActive(newsId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(heartEvents)
    .where(and(eq(heartEvents.newsId, newsId), isNull(heartEvents.deletedAt)));
  return row?.count ?? 0;
}
