// 소식(news) 비즈니스 로직 — db import 금지. db 레이어 함수만 호출 (fullstack.md §3). public/admin 분리 (codex P1#7). mutation 은 db.transaction 안에서 (codex P1#5)
import { db } from "@/db";
import { deleteByPrefix } from "@/features/storage";
import * as newsDb from "./db";
import type { ListNewsQuery, NewsInput } from "./schemas";

export async function listNews(query: ListNewsQuery) {
  const [items, total] = await Promise.all([
    newsDb.listPublicNews(query),
    newsDb.countPublicNews({ categorySlug: query.categorySlug }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  return { items, total, totalPages, page: query.page, limit: query.limit };
}

export async function getNewsDetail(id: string) {
  const item = await newsDb.getPublicNewsById(id);
  if (!item) return null;
  const heartCount = await newsDb.countActiveHearts(id);
  return { ...item, heartCount };
}

// 활성 카테고리 목록 — CategoryTabs·어드민 폼 데이터 소스
export async function listCategories() {
  return newsDb.findActiveCategories();
}

// 어드민 상세 — draft 포함, 수정 페이지(T10) 진입점
export async function getAdminNewsDetail(id: string) {
  return newsDb.getAdminNewsById(id);
}

// 태그 자동완성 — TagsInput(T8) 진입점. 빈도순
export async function searchTags(prefix: string, limit = 10) {
  return newsDb.searchTags(prefix, limit);
}

// 태그 정규화 — # 제거 + trim + lowercase + 중복 제거 + 빈 문자열 제외. service 단일 진입 (결정 로그 [T7 정규화 위치])
function normalizeTags(tags: string[]): string[] {
  const cleaned = tags
    .map((t) => t.replace(/^#/, "").trim().toLowerCase())
    .filter((t) => t.length > 0);
  return Array.from(new Set(cleaned));
}

// 글 신규 — news + news_tags 트랜잭션. actorUserId 가 null 이면 createdBy null (시스템 seed 등)
export async function createNews(
  input: NewsInput,
  actorUserId: string | null,
) {
  const normalized = normalizeTags(input.tags);
  return db.transaction(async (tx) => {
    const created = await newsDb.insertNews(tx, {
      title: input.title,
      body: input.body,
      categoryId: input.categoryId,
      coverImageUrl: input.coverImageUrl ?? null,
      publishedAt: input.publishedAt ?? null,
      createdBy: actorUserId,
    });
    await newsDb.replaceNewsTags(tx, created.id, normalized);
    return created;
  });
}

// 글 수정 — news + news_tags 트랜잭션. tags 는 전체 교체 (diff 계산 X)
export async function updateNews(id: string, input: NewsInput) {
  const normalized = normalizeTags(input.tags);
  return db.transaction(async (tx) => {
    const updated = await newsDb.updateNews(tx, id, {
      title: input.title,
      body: input.body,
      categoryId: input.categoryId,
      coverImageUrl: input.coverImageUrl ?? null,
      publishedAt: input.publishedAt ?? null,
    });
    if (!updated) return null;
    await newsDb.replaceNewsTags(tx, id, normalized);
    return updated;
  });
}

// 글 삭제 — news_tags / heart_events cascade. S3 객체 best-effort prefix 청소 (실패해도 DB 삭제 성공)
export async function deleteNews(id: string) {
  const deleted = await db.transaction(async (tx) => newsDb.deleteNews(tx, id));
  if (deleted) {
    deleteByPrefix(`news/${id}/`).catch((err) => {
      // best-effort — orphan 은 v1.1 cleanup job 백업
      // eslint-disable-next-line no-console
      console.error("[news.deleteNews] S3 cleanup 실패 (best-effort)", err);
    });
  }
  return deleted;
}

// 발행 상태 변경 — publishNewsAction 전용. true → now, false → null
export async function setPublishedAt(id: string, publish: boolean) {
  return db.transaction(async (tx) =>
    newsDb.updateNews(tx, id, {
      publishedAt: publish ? new Date() : null,
    }),
  );
}
