// 홈 팝업 Drizzle 쿼리 전담 — 공개 활성 조회와 어드민 전체 조회·변경을 분리한다.
import "server-only";

import { and, desc, eq, gt, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { popups } from "@/db/schema";

// 공개 노출 단일 기준 — 활성 + 시작 시각 도래 + 종료 시각 미도래(또는 무기한).
export function activePopupWhere() {
  return and(
    eq(popups.isActive, true),
    lte(popups.startsAt, sql`now()`),
    or(isNull(popups.endsAt), gt(popups.endsAt, sql`now()`)),
  );
}

// 공개 다이얼로그용 경량 목록 — 작성자·감사 메타는 제외한다.
export async function listActivePopups() {
  return db
    .select({
      id: popups.id,
      title: popups.title,
      imageUrl: popups.imageUrl,
      imageWidth: popups.imageWidth,
      imageHeight: popups.imageHeight,
      linkUrl: popups.linkUrl,
      linkTarget: popups.linkTarget,
      dismissDuration: popups.dismissDuration,
      startsAt: popups.startsAt,
      endsAt: popups.endsAt,
    })
    .from(popups)
    .where(activePopupWhere())
    .orderBy(desc(popups.startsAt));
}

export async function listPopupsForAdmin() {
  return db.select().from(popups).orderBy(desc(popups.createdAt));
}

export async function getPopupById(id: string) {
  const [row] = await db.select().from(popups).where(eq(popups.id, id)).limit(1);
  return row ?? null;
}

type PopupInsertData = Omit<typeof popups.$inferInsert, "createdAt" | "updatedAt">;
type PopupUpdateData = Partial<Omit<PopupInsertData, "id" | "createdBy">>;

export async function insertPopup(
  data: PopupInsertData,
  txOrDb: typeof db = db,
) {
  const [row] = await txOrDb.insert(popups).values(data).returning({ id: popups.id });
  return row;
}

export async function updatePopup(
  id: string,
  data: PopupUpdateData,
  txOrDb: typeof db = db,
) {
  const [row] = await txOrDb
    .update(popups)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(popups.id, id))
    .returning({ id: popups.id });
  return row ?? null;
}

export async function deletePopup(id: string, txOrDb: typeof db = db) {
  const [row] = await txOrDb
    .delete(popups)
    .where(eq(popups.id, id))
    .returning({ id: popups.id });
  return row ?? null;
}
