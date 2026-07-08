// 공지(notices) Drizzle 쿼리 전담 — DAL. 공개(published_at <= now) / 어드민(모두) 분리, mutation 은 tx 인자 강제 (news db.ts 컨벤션)
import { and, asc, desc, eq, gt, ilike, inArray, isNotNull, isNull, lte, sql } from "drizzle-orm";
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
      pinnedRank: notices.pinnedRank,
      // 게시글 고유 번호 — 발행 오름차순 순위(1=최초 발행). 고정으로 상단 이동해도 값 불변 (Figma 1103:7882: 고정 행이 비순차 번호 유지).
      // 윈도우 함수는 WHERE 통과 전체 집합 기준(LIMIT 이전 논리 단계) → 페이지·고정정렬과 무관하게 각 행이 전역 번호 보존
      seqNo: sql<number>`(ROW_NUMBER() OVER (ORDER BY ${notices.publishedAt} ASC, ${notices.id} ASC))::int`,
      // 상관 서브쿼리는 raw 정규화 이름 필수 — 조인 없는 select 에서 drizzle 이 보간 컬럼을 비정규화("id")해
      // 내부 테이블로 오결합(notice_id = notice_attachments.id → 항상 false)되는 버그 (E2E 검증에서 발견)
      hasAttachment: sql<boolean>`EXISTS (SELECT 1 FROM notice_attachments WHERE notice_attachments.notice_id = notices.id)`,
    })
    .from(notices)
    .where(publicPublishedWhere())
    // 고정 우선 — pinned_rank ASC(1..N) NULLS LAST, 그다음 발행 최신순 (ADR-043)
    .orderBy(sql`${notices.pinnedRank} asc nulls last`, desc(notices.publishedAt))
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
      pinnedRank: notices.pinnedRank,
      createdAt: notices.createdAt,
      updatedAt: notices.updatedAt,
      // raw 정규화 이름 — hasAttachment(listPublicNotices)와 동일 사유
      attachmentCount: sql<number>`(SELECT count(*)::int FROM notice_attachments WHERE notice_attachments.notice_id = notices.id)`,
    })
    .from(notices)
    .where(and(adminStatusWhere(opts.status), titleWhere(opts.q)))
    // 어드민 목록 정렬은 유지(발행 최신순) — 고정 순서 관리는 상단 전용 카드가 담당
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

// ─── 상위 고정 (pinned_rank) — news heroRank 패턴 이식 (ADR-043) ──────────────

// 고정 정렬 전용 advisory lock — 동시 setNoticePinOrder 직렬화 (2-step unique 충돌·인터리빙 race 차단).
// news hero(740031)·landing(740032)과 다른 키 (불필요한 상호 직렬화 방지). raw SQL 은 pg_advisory_xact_lock 헬퍼 부재
const NOTICE_PIN_LOCK_KEY = 740033;
export async function acquireNoticePinLock(tx: Tx) {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(${NOTICE_PIN_LOCK_KEY})`);
}

// 주어진 id 중 현재 공개(발행) 공지 수 — 예약·임시 pin 차단 검증용 (news countPublishedIn 동일)
export async function countPublishedIn(tx: Tx, ids: string[]) {
  if (ids.length === 0) return 0;
  const [row] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(notices)
    .where(and(inArray(notices.id, ids), publicPublishedWhere()));
  return row?.count ?? 0;
}

// 상위 고정 일괄 정렬 — 2-phase: (1) 기존 pinned_rank 전부 해제 → partial unique index 비움(충돌 원천 제거),
// (2) 새 순서대로 1..N 부여. 단일 tx, 실패 시 롤백. 호출 전 acquireNoticePinLock 직렬화 필수.
// Phase2 는 publicPublishedWhere 가드 — 검증 후 미발행·예약 전환된 공지가 pin 되는 TOCTOU 차단 (news setHeroOrder 동일)
export async function setNoticePinOrder(tx: Tx, orderedNoticeIds: string[]) {
  await tx
    .update(notices)
    .set({ pinnedRank: null, updatedAt: new Date() })
    .where(isNotNull(notices.pinnedRank));
  for (let i = 0; i < orderedNoticeIds.length; i++) {
    await tx
      .update(notices)
      .set({ pinnedRank: i + 1, updatedAt: new Date() })
      .where(and(eq(notices.id, orderedNoticeIds[i]), publicPublishedWhere()));
  }
}

// 단일 공지 고정 해제 — 발행 해제(임시/예약 전환) 시 고아 pinned_rank 방지 (news clearHeroRank 동일)
export async function clearPinnedRank(tx: Tx, id: string) {
  await tx
    .update(notices)
    .set({ pinnedRank: null, updatedAt: new Date() })
    .where(eq(notices.id, id));
}

// 고정 관리 카드 — 현재 고정 공지(발행 + pinned_rank NOT NULL), rank 순
export async function listPinnedNotices() {
  return db
    .select({
      id: notices.id,
      title: notices.title,
      publishedAt: notices.publishedAt,
      pinnedRank: notices.pinnedRank,
    })
    .from(notices)
    .where(and(publicPublishedWhere(), isNotNull(notices.pinnedRank)))
    .orderBy(asc(notices.pinnedRank));
}

// 고정 관리 카드 picker 후보 — 발행 + 미고정, 최신순
export async function listPinCandidates(limit = 50) {
  return db
    .select({
      id: notices.id,
      title: notices.title,
      publishedAt: notices.publishedAt,
      pinnedRank: notices.pinnedRank,
    })
    .from(notices)
    .where(and(publicPublishedWhere(), isNull(notices.pinnedRank)))
    .orderBy(desc(notices.publishedAt))
    .limit(limit);
}
