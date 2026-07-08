// 공지(notices) 비즈니스 로직 — db import 는 transaction 조율에 한정, 쿼리는 db 레이어 함수만 호출 (fullstack.md §3)
import { cache } from "react";

import { db } from "@/db";
import { deleteByKeys, deleteByPrefix } from "@/features/storage";
import {
  MAX_ATTACHMENTS_PER_NOTICE,
  noticeAttachmentKeyPrefix,
} from "@/features/storage/attachment-policy";
import { DomainError } from "@/lib/errors";
import * as noticeDb from "./db";
import type { ListNoticesQuery, NoticeInput } from "./schemas";

export async function listNotices(query: ListNoticesQuery) {
  const [items, total] = await Promise.all([
    noticeDb.listPublicNotices(query),
    noticeDb.countPublicNotices(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  // page 범위 초과(공유·북마크된 ?page=N)면 마지막 페이지로 재조회 — 막다른 빈 화면 방지 (news listNews 동일)
  if (items.length === 0 && query.page > totalPages) {
    const clamped = await noticeDb.listPublicNotices({ ...query, page: totalPages });
    return { items: clamped, total, totalPages, page: totalPages, limit: query.limit };
  }
  return { items, total, totalPages, page: query.page, limit: query.limit };
}

// cache() — 같은 요청 내 generateMetadata + 페이지 렌더가 각각 호출해도 DB 1회 (요청 단위 dedupe)
export const getNoticeDetail = cache(async (id: string) => {
  return noticeDb.getPublicNoticeById(id);
});

// 상세 페이지 이전/다음 공지 — publishedAt 인접
export async function getAdjacentNotices(noticeId: string, publishedAt: Date) {
  return noticeDb.findAdjacentNotices(noticeId, publishedAt);
}

// 다운로드 route 진입점 — 부모 공지가 현재 공개일 때만
export async function getPublishedAttachment(attachmentId: string) {
  return noticeDb.getPublishedAttachmentById(attachmentId);
}

// ─── 어드민 ─────────────────────────────────────────────────────────────

export async function listNoticesForAdmin(opts: {
  page: number;
  limit: number;
  status?: "all" | "draft" | "scheduled" | "published";
  q?: string;
}) {
  const [items, total] = await Promise.all([
    noticeDb.listForAdmin(opts),
    noticeDb.countForAdmin({ status: opts.status, q: opts.q }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / opts.limit));
  return { items, total, totalPages, page: opts.page, limit: opts.limit };
}

export async function getAdminNoticeDetail(id: string) {
  return noticeDb.getAdminNoticeById(id);
}

// 첨부 key 소유 검증 — 다른 공지 prefix 의 key 를 payload 로 위조해 끼워넣는 것 차단 (ADR-041)
function assertAttachmentKeysOwned(
  noticeId: string,
  attachments: NoticeInput["attachments"],
) {
  if (attachments.length > MAX_ATTACHMENTS_PER_NOTICE) {
    throw new DomainError(
      `첨부파일은 최대 ${MAX_ATTACHMENTS_PER_NOTICE}개까지 가능합니다.`,
    );
  }
  const prefix = noticeAttachmentKeyPrefix(noticeId);
  for (const a of attachments) {
    if (!a.key.startsWith(prefix)) {
      throw new DomainError("첨부파일 경로가 올바르지 않습니다.");
    }
  }
}

// 공지 신규 — notices + notice_attachments 트랜잭션. id 는 client 생성 UUID (업로드 prefix 정합)
export async function createNotice(
  id: string,
  input: NoticeInput,
  actorUserId: string | null,
) {
  assertAttachmentKeysOwned(id, input.attachments);
  return db.transaction(async (tx) => {
    const created = await noticeDb.insertNotice(tx, {
      id,
      title: input.title,
      body: input.body,
      publishedAt: input.publishedAt ?? null,
      createdBy: actorUserId,
    });
    await noticeDb.replaceAttachments(tx, created.id, input.attachments);
    return created;
  });
}

// 공지 수정 — 첨부는 전체 교체. 제거된 key 만 S3 best-effort 삭제 (기존 − 신규 차집합)
export async function updateNotice(id: string, input: NoticeInput) {
  assertAttachmentKeysOwned(id, input.attachments);
  const result = await db.transaction(async (tx) => {
    const updated = await noticeDb.updateNotice(tx, id, {
      title: input.title,
      body: input.body,
      publishedAt: input.publishedAt ?? null,
    });
    if (!updated) return null;
    const oldKeys = await noticeDb.listAttachmentKeys(tx, id);
    await noticeDb.replaceAttachments(tx, id, input.attachments);
    const kept = new Set(input.attachments.map((a) => a.key));
    return { id: updated.id, removedKeys: oldKeys.filter((k) => !kept.has(k)) };
  });
  if (!result) return null;
  if (result.removedKeys.length > 0) {
    deleteByKeys(result.removedKeys).catch((err) => {
      // best-effort — orphan 은 v1.1 cleanup job 백업 (news deleteNews 동일)
      // eslint-disable-next-line no-console
      console.error("[notices.updateNotice] S3 첨부 정리 실패 (best-effort)", err);
    });
  }
  return { id: result.id };
}

// 공지 삭제 — notice_attachments 는 FK cascade. 본문 이미지 + 첨부를 prefix 한 번에 청소
export async function deleteNotice(id: string) {
  const deleted = await db.transaction(async (tx) => noticeDb.deleteNotice(tx, id));
  if (deleted) {
    deleteByPrefix(`notices/${id}/`).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[notices.deleteNotice] S3 cleanup 실패 (best-effort)", err);
    });
  }
  return deleted;
}

// 발행 상태 토글 — 어드민 목록 row 버튼용. true → now, false → null (공지는 해제 시 정리할 슬롯 없음)
export async function setPublishedAt(id: string, publish: boolean) {
  return db.transaction(async (tx) =>
    noticeDb.updateNotice(tx, id, { publishedAt: publish ? new Date() : null }),
  );
}
