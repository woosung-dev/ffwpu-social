// 소식(news) 비즈니스 로직 — db import 금지. db 레이어 함수만 호출 (fullstack.md §3). public/admin 분리 (codex P1#7). mutation 은 db.transaction 안에서 (codex P1#5)
import { db } from "@/db";
import { deleteByPrefix } from "@/features/storage";
import * as newsDb from "./db";
import { slotsToClearOnTransition } from "./slot-rules";
import type { ListNewsQuery, NewsInput } from "./schemas";

export async function listNews(query: ListNewsQuery) {
  const [items, total] = await Promise.all([
    newsDb.listPublicNews(query),
    newsDb.countPublicNews({ categorySlug: query.categorySlug, q: query.q }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  // page 가 범위 초과(공유·북마크된 ?page=N, 검색으로 결과가 줄어든 경우)면 마지막 페이지로 재조회 —
  // 막다른 빈 화면(결과 없음 + 페이지네이션 미렌더로 탈출 불가) 방지. 결과 0건(genuine empty)은 page=1 이라 재조회 안 함
  if (items.length === 0 && query.page > totalPages) {
    const clamped = await newsDb.listPublicNews({ ...query, page: totalPages });
    return { items: clamped, total, totalPages, page: totalPages, limit: query.limit };
  }
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

// 어드민 목록 (T10) — 페이지네이션 + status·categorySlug 필터
export async function listNewsForAdmin(opts: {
  page: number;
  limit: number;
  status?: "all" | "draft" | "published";
  categorySlug?: string;
}) {
  const [items, total] = await Promise.all([
    newsDb.listForAdmin(opts),
    newsDb.countForAdmin({
      status: opts.status,
      categorySlug: opts.categorySlug,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / opts.limit));
  return { items, total, totalPages, page: opts.page, limit: opts.limit };
}

// 대시보드 (T11) — 최근 N건 + 카테고리별 글 수
export async function getAdminDashboard(latestLimit = 5) {
  const [latest, perCategory] = await Promise.all([
    newsDb.listLatest(latestLimit),
    newsDb.countNewsByCategory(),
  ]);
  return { latest, perCategory };
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

// 글 신규 — news + news_tags 트랜잭션. id 는 client 생성 UUID (업로드 prefix 정합). actorUserId null 이면 createdBy null
export async function createNews(
  id: string,
  input: NewsInput,
  actorUserId: string | null,
) {
  const normalized = normalizeTags(input.tags);
  return db.transaction(async (tx) => {
    const created = await newsDb.insertNews(tx, {
      id,
      title: input.title,
      body: input.body,
      categoryId: input.categoryId,
      coverImageUrl: input.coverImageUrl ?? null,
      coverImageWidth: input.coverImageWidth ?? null,
      coverImageHeight: input.coverImageHeight ?? null,
      publishedAt: input.publishedAt ?? null,
      createdBy: actorUserId,
    });
    await newsDb.replaceNewsTags(tx, created.id, normalized);
    return created;
  });
}

// 글 수정 — news + news_tags 트랜잭션. tags 는 전체 교체 (diff 계산 X).
// 상태 전이(발행 해제·쌀 나눔 외 카테고리 변경) 시 ineligible 해진 hero·landing 슬롯 동반 해제 — 고아 슬롯(보이지 않는 점유) 방지 (A1b)
export async function updateNews(id: string, input: NewsInput) {
  const normalized = normalizeTags(input.tags);
  return db.transaction(async (tx) => {
    const updated = await newsDb.updateNews(tx, id, {
      title: input.title,
      body: input.body,
      categoryId: input.categoryId,
      coverImageUrl: input.coverImageUrl ?? null,
      coverImageWidth: input.coverImageWidth ?? null,
      coverImageHeight: input.coverImageHeight ?? null,
      publishedAt: input.publishedAt ?? null,
    });
    if (!updated) return null;

    const riceId = await newsDb.getRiceSharingCategoryId(tx);
    const clear = slotsToClearOnTransition({
      isPublished: input.publishedAt != null,
      isRiceSharing: input.categoryId === riceId,
    });
    if (clear.hero) await newsDb.clearHeroRank(tx, id);
    if (clear.landing) await newsDb.clearLandingSlots(tx, id);

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

// 발행 상태 변경 — publishNewsAction 전용. true → now, false → null.
// 미발행 전환 시 heroRank + landing 슬롯 동반 해제 — 고아 슬롯(보이지 않는 점유) 방지 (Slice3 C-2 + A1b)
export async function setPublishedAt(id: string, publish: boolean) {
  return db.transaction(async (tx) => {
    const updated = await newsDb.updateNews(tx, id, {
      publishedAt: publish ? new Date() : null,
    });
    if (updated && !publish) {
      await newsDb.clearHeroRank(tx, id);
      await newsDb.clearLandingSlots(tx, id);
    }
    return updated;
  });
}

// 메인 랜딩 슬롯 설정 — /admin/landing 큐레이션. story (1~2) / featured (1~7). null = 해제.
// advisory lock 으로 동시 저장 직렬화(23505 차단), 점유는 발행 + 쌀 나눔만 허용 (db.setLandingSlot eligibility)
export async function setLandingSlot(
  newsId: string,
  kind: "story" | "featured",
  slot: number | null,
) {
  return db.transaction(async (tx) => {
    await newsDb.acquireLandingSlotLock(tx);
    return newsDb.setLandingSlot(tx, newsId, kind, slot);
  });
}

// /news Hero 정렬 저장 — 발행 글만 허용(draft pin 차단, C3.5). 2-phase setHeroOrder.
// advisory lock 으로 동시 저장 직렬화 (READ COMMITTED 인터리빙 race 차단, C3.6)
export async function setHeroOrder(orderedNewsIds: string[]) {
  return db.transaction(async (tx) => {
    await newsDb.acquireHeroOrderLock(tx);
    if (orderedNewsIds.length > 0) {
      const publishedCount = await newsDb.countPublishedIn(tx, orderedNewsIds);
      if (publishedCount !== orderedNewsIds.length) {
        return { kind: "has_unpublished" as const };
      }
    }
    await newsDb.setHeroOrder(tx, orderedNewsIds);
    return { kind: "ok" as const };
  });
}

// /news Hero 현재 노출 글 (rank 순) — 공개 /news + 어드민 미리보기
export async function getHeroNews() {
  return newsDb.listHeroNews();
}

// 어드민 Hero picker 후보 (발행·미지정 글)
export async function getHeroCandidates() {
  return newsDb.listHeroCandidates();
}

// ─── 익명 좋아요 (ADR-026 — sessionId 토글, IP 미수집) ───────────────────
export async function toggleHeart(newsId: string, sessionId: string) {
  // 발행 글만 하트 허용 — UUID 추측으로 draft/비공개 글에 익명 row 생성하는 것 차단 (codex MED). 미발행은 no-op
  if (!(await newsDb.isNewsPublished(newsId))) {
    return { liked: false, count: 0 };
  }
  const existing = await newsDb.findHeartEventAny(newsId, sessionId);
  let liked: boolean;
  if (!existing) {
    await newsDb.insertHeart(newsId, sessionId);
    liked = true;
  } else {
    const currentlyActive = existing.deletedAt == null;
    await newsDb.setHeartDeleted(existing.id, currentlyActive);
    liked = !currentlyActive;
  }
  const count = await newsDb.countActiveHearts(newsId);
  return { liked, count };
}

export async function getHeartState(newsId: string, sessionId: string) {
  const active = await newsDb.findActiveHeartEvent(newsId, sessionId);
  const count = await newsDb.countActiveHearts(newsId);
  return { liked: active != null, count };
}

// 관련 글 — 같은 카테고리 우선, 부족하면 최신 글로 보충 (self 제외)
export async function getRelatedNews(
  newsId: string,
  categoryId: string,
  limit = 3,
) {
  const sameCat = await newsDb.listRelatedNews(newsId, categoryId, limit);
  if (sameCat.length >= limit) return sameCat;
  const recent = await newsDb.listPublicNews({
    page: 1,
    limit: limit + sameCat.length + 3,
  });
  const seen = new Set([newsId, ...sameCat.map((s) => s.id)]);
  const fill = recent
    .filter((r) => !seen.has(r.id))
    .slice(0, limit - sameCat.length)
    .map((r) => ({
      id: r.id,
      title: r.title,
      categoryName: r.categoryName,
      coverImageUrl: r.coverImageUrl,
      publishedAt: r.publishedAt,
    }));
  return [...sameCat, ...fill];
}

// 상세 페이지 이전/다음 글 — publishedAt 인접 (prev=더 최신 / next=더 과거)
export async function getAdjacentNews(newsId: string, publishedAt: Date) {
  return newsDb.findAdjacentNews(newsId, publishedAt);
}
