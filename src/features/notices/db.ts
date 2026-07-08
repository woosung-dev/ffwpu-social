// 공지(notices) Drizzle 쿼리 전담 — DAL. 공개(published_at <= now) / 어드민(모두) 분리, mutation 은 tx 인자 강제 (news db.ts 컨벤션)
import { and, asc, desc, eq, gt, ilike, isNotNull, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { noticeAttachments, notices } from "@/db/schema";
import { likePattern } from "@/features/news/search-query";
import type { NoticeAttachmentInput } from "./schemas";

// service.ts 가 db.transaction 콜백에서 받는 tx 와 동일 (news 동일 alias)
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// 공개 노출 단일 기준 — 목록·상세·다운로드·카운트 전부 이 조건 하나로 통일 (draft·예약 노출 차단)
function publicPublishedWhere() {
  return and(isNotNull(notices.publishedAt), lte(notices.publishedAt, sql`now()`));
}

// ─── 사용자 사이트 — 현재 공개 공지만 ────────────────────────────────────

// 공개 목록 — 첨부 존재 여부(클립 표시)만 EXISTS 로. 본문 제외 경량 select
export async function listPublicNotices(opts: { page: number; limit: number }) {
  const offset = (opts.page - 1) * opts.limit;
  return db
    .select({
      id: notices.id,
      title: notices.title,
      publishedAt: notices.publishedAt,
      hasAttachment: sql<boolean>`EXISTS (SELECT 1 FROM ${noticeAttachments} WHERE ${noticeAttachments.noticeId} = ${notices.id})`,
    })
    .from(notices)
    .where(publicPublishedWhere())
    .orderBy(desc(notices.publishedAt))
    .limit(opts.limit)
    .offset(offset);
}

export async function countPublicNotices() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notices)
    .where(publicPublishedWhere());
  return row?.count ?? 0;
}

// 공개 상세 — draft·예약 접근 시 null. 첨부는 sortOrder 순
export async function getPublicNoticeById(id: string) {
  const [row] = await db
    .select({
      id: notices.id,
      title: notices.title,
      body: notices.body,
      publishedAt: notices.publishedAt,
      createdAt: notices.createdAt,
      updatedAt: notices.updatedAt,
    })
    .from(notices)
    .where(and(eq(notices.id, id), publicPublishedWhere()))
    .limit(1);
  if (!row) return null;
  const attachments = await listAttachments(id);
  return { ...row, attachments };
}

export async function listAttachments(noticeId: string) {
  return db
    .select({
      id: noticeAttachments.id,
      fileName: noticeAttachments.fileName,
      size: noticeAttachments.size,
      sortOrder: noticeAttachments.sortOrder,
    })
    .from(noticeAttachments)
    .where(eq(noticeAttachments.noticeId, noticeId))
    .orderBy(asc(noticeAttachments.sortOrder), asc(noticeAttachments.createdAt));
}

// 다운로드 route 전용 — 부모 공지가 현재 공개일 때만 반환 (미발행 첨부 URL 추측 차단, ADR-041)
export async function getPublishedAttachmentById(attachmentId: string) {
  const [row] = await db
    .select({
      id: noticeAttachments.id,
      key: noticeAttachments.key,
      fileName: noticeAttachments.fileName,
      mime: noticeAttachments.mime,
    })
    .from(noticeAttachments)
    .innerJoin(notices, eq(noticeAttachments.noticeId, notices.id))
    .where(and(eq(noticeAttachments.id, attachmentId), publicPublishedWhere()))
    .limit(1);
  return row ?? null;
}

// 인접 공지 — 현재 공개만, publishedAt 기준. prev=더 최신 / next=더 과거 (news findAdjacentNews 동일)
export async function findAdjacentNotices(noticeId: string, publishedAt: Date) {
  const [prev] = await db
    .select({ id: notices.id, title: notices.title })
    .from(notices)
    .where(
      and(
        publicPublishedWhere(),
        sql`${notices.publishedAt} > ${publishedAt}`,
        sql`${notices.id} <> ${noticeId}`,
      ),
    )
    .orderBy(asc(notices.publishedAt))
    .limit(1);
  const [next] = await db
    .select({ id: notices.id, title: notices.title })
    .from(notices)
    .where(
      and(
        publicPublishedWhere(),
        sql`${notices.publishedAt} < ${publishedAt}`,
        sql`${notices.id} <> ${noticeId}`,
      ),
    )
    .orderBy(desc(notices.publishedAt))
    .limit(1);
  return { prev: prev ?? null, next: next ?? null };
}

// ─── 어드민 — 모든 공지 (draft + scheduled + published) ─────────────────

type AdminListOpts = {
  page: number;
  limit: number;
  status?: "all" | "draft" | "scheduled" | "published";
  q?: string;
};

function adminStatusWhere(status?: AdminListOpts["status"]) {
  if (status === "draft") return isNull(notices.publishedAt);
  if (status === "scheduled") {
    return and(isNotNull(notices.publishedAt), gt(notices.publishedAt, sql`now()`));
  }
  if (status === "published") return publicPublishedWhere();
  return undefined;
}

function titleWhere(q?: string) {
  const trimmed = q?.trim();
  return trimmed ? ilike(notices.title, likePattern(trimmed)) : undefined;
}

export async function listForAdmin(opts: AdminListOpts) {
  const offset = (opts.page - 1) * opts.limit;
  return db
    .select({
      id: notices.id,
      title: notices.title,
      publishedAt: notices.publishedAt,
      createdAt: notices.createdAt,
      updatedAt: notices.updatedAt,
      attachmentCount: sql<number>`(SELECT count(*)::int FROM ${noticeAttachments} WHERE ${noticeAttachments.noticeId} = ${notices.id})`,
    })
    .from(notices)
    .where(and(adminStatusWhere(opts.status), titleWhere(opts.q)))
    .orderBy(sql`${notices.publishedAt} desc nulls last`, desc(notices.createdAt))
    .limit(opts.limit)
    .offset(offset);
}

export async function countForAdmin(opts: Pick<AdminListOpts, "status" | "q">) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notices)
    .where(and(adminStatusWhere(opts.status), titleWhere(opts.q)));
  return row?.count ?? 0;
}

// 어드민 상세 — draft 포함. 수정 페이지 진입점
export async function getAdminNoticeById(id: string) {
  const [row] = await db
    .select({
      id: notices.id,
      title: notices.title,
      body: notices.body,
      publishedAt: notices.publishedAt,
      createdAt: notices.createdAt,
      updatedAt: notices.updatedAt,
    })
    .from(notices)
    .where(eq(notices.id, id))
    .limit(1);
  if (!row) return null;
  const attachments = await db
    .select({
      id: noticeAttachments.id,
      fileName: noticeAttachments.fileName,
      key: noticeAttachments.key,
      mime: noticeAttachments.mime,
      size: noticeAttachments.size,
      sortOrder: noticeAttachments.sortOrder,
    })
    .from(noticeAttachments)
    .where(eq(noticeAttachments.noticeId, id))
    .orderBy(asc(noticeAttachments.sortOrder), asc(noticeAttachments.createdAt));
  return { ...row, attachments };
}

// ─── Mutation — transaction 안에서만 호출 (tx 인자 강제) ──────────────────

type NoticeInsertData = Omit<typeof notices.$inferInsert, "createdAt" | "updatedAt">;
type NoticeUpdateData = Partial<Omit<NoticeInsertData, "id">>;

// 공지 신규 — id 는 client 생성 UUID (업로드 prefix notices/{id}/ 정합)
export async function insertNotice(tx: Tx, data: NoticeInsertData) {
  const [row] = await tx.insert(notices).values(data).returning({ id: notices.id });
  return row;
}

export async function updateNotice(tx: Tx, id: string, data: NoticeUpdateData) {
  const [row] = await tx
    .update(notices)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(notices.id, id))
    .returning({ id: notices.id });
  return row ?? null;
}

// 공지 삭제 — notice_attachments 는 FK cascade. S3 객체 청소는 service best-effort
export async function deleteNotice(tx: Tx, id: string) {
  const [row] = await tx
    .delete(notices)
    .where(eq(notices.id, id))
    .returning({ id: notices.id });
  return row ?? null;
}

// 기존 첨부 key 목록 — update 시 제거분 S3 청소용 diff 계산 (replace 전에 호출)
export async function listAttachmentKeys(tx: Tx, noticeId: string) {
  const rows = await tx
    .select({ key: noticeAttachments.key })
    .from(noticeAttachments)
    .where(eq(noticeAttachments.noticeId, noticeId));
  return rows.map((r) => r.key);
}

// 첨부 일괄 교체 — 전체 삭제 후 재삽입 (공지당 ≤5행이라 diff 보다 단순). sortOrder = 배열 index
export async function replaceAttachments(
  tx: Tx,
  noticeId: string,
  attachments: NoticeAttachmentInput[],
) {
  await tx.delete(noticeAttachments).where(eq(noticeAttachments.noticeId, noticeId));
  if (attachments.length === 0) return;
  await tx.insert(noticeAttachments).values(
    attachments.map((a, i) => ({
      noticeId,
      fileName: a.fileName,
      key: a.key,
      mime: a.mime,
      size: a.size,
      sortOrder: i,
    })),
  );
}
