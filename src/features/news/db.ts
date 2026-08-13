// 소식(news) Drizzle 쿼리 전담 — DAL. db import는 여기서만 (fullstack.md §3). 공개(published_at <= now) / 어드민(모두) 분리 (codex P1#7). mutation 은 tx 인자 강제 (codex P1#5)
import { and, asc, desc, eq, gt, ilike, inArray, isNotNull, isNull, like, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { analyticsEvents, categories, heartEvents, news, newsTags } from "@/db/schema";
import { ALL_CATEGORY_SLUG } from "./constants";
import type { NewsBoard } from "./board";
import type { NewsSort } from "./admin-sort";
import type { NewsStatus } from "./publish-state";
import { likePattern } from "./search-query";
import { RICE_SHARING_SLUG } from "./slot-rules";

// service.ts 가 db.transaction 콜백에서 받는 tx 와 동일 — mutation 함수 시그니처로 그대로 노출 (T6 결정 로그 [tx alias])
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type ListOpts = {
  categorySlug?: string;
  q?: string;
  sort?: "latest" | "title";
  page: number;
  limit: number;
};

// 정렬 — title(제목 가나다순, Hangul 음절은 codepoint=가나다 순) / 그 외 latest(발행 최신순)
function newsOrderBy(sort?: ListOpts["sort"]) {
  return sort === "title" ? asc(news.title) : desc(news.publishedAt);
}

function categoryWhere(categorySlug?: string) {
  return categorySlug && categorySlug !== ALL_CATEGORY_SLUG
    ? eq(categories.slug, categorySlug)
    : undefined;
}

// 공개 사이트 노출 조건 — 발행됨(published_at <= now) + 숨김 아님(is_hidden = false, ADR-053).
// landing/db.ts · analytics/db.ts 의 동명 헬퍼와 동일 기준 — 한쪽만 고치면 숨긴 글이 새어나간다
function publicPublishedWhere() {
  return and(
    isNotNull(news.publishedAt),
    lte(news.publishedAt, sql`now()`),
    eq(news.isHidden, false),
  );
}

// 게시판 스코프 (ADR-056) — 아래 조회 함수는 전부 board 를 첫 인자로 강제 받는다.
// 기본값을 주지 않는 게 핵심: 넘기지 않으면 컴파일 에러라 "필터 깜빡함"이 배포까지 못 간다
function boardWhere(board: NewsBoard) {
  return eq(news.board, board);
}

// 검색 필터 — 제목 OR 태그 부분일치(ILIKE, 대소문자 무관). q 없으면 undefined(필터 미적용).
// 태그는 normalizeTags 로 lowercase 저장되나 ILIKE 라 입력 케이스 무관. 본문(jsonb)은 v1.1
function searchWhere(q?: string) {
  const trimmed = q?.trim();
  if (!trimmed) return undefined;
  const pattern = likePattern(trimmed);
  return or(
    ilike(news.title, pattern),
    sql`EXISTS (SELECT 1 FROM ${newsTags} WHERE ${newsTags.newsId} = ${news.id} AND ${newsTags.tag} ILIKE ${pattern})`,
  );
}

// 어드민 제목 검색 — 제목만 부분일치(ILIKE). 공개 searchWhere(제목 OR 태그)와 달리 제목·태그를 분리(AND 결합)
function titleWhere(q?: string) {
  const trimmed = q?.trim();
  return trimmed ? ilike(news.title, likePattern(trimmed)) : undefined;
}

// 어드민 태그 검색 — 태그만 부분일치(ILIKE EXISTS). titleWhere 와 AND 결합되어 "제목 AND 태그" 좁히기
function tagWhere(tag?: string) {
  const trimmed = tag?.trim();
  if (!trimmed) return undefined;
  const pattern = likePattern(trimmed);
  return sql`EXISTS (SELECT 1 FROM ${newsTags} WHERE ${newsTags.newsId} = ${news.id} AND ${newsTags.tag} ILIKE ${pattern})`;
}

// ─── 사용자 사이트 — 현재 공개 글만 (codex P1#7 + 예약 발행) ─────────────────

// 공개 목록 — published_at <= now 강제 (draft·예약글 노출 차단)
export async function listPublicNews(board: NewsBoard, opts: ListOpts) {
  const offset = (opts.page - 1) * opts.limit;
  return db
    .select({
      id: news.id,
      title: news.title,
      categoryId: news.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverImageUrl: news.coverImageUrl,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
      heartCount: sql<number>`(SELECT count(*)::int FROM heart_events WHERE news_id = ${news.id} AND deleted_at IS NULL)`,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(
      and(
        boardWhere(board),
        publicPublishedWhere(),
        categoryWhere(opts.categorySlug),
        searchWhere(opts.q),
      ),
    )
    .orderBy(newsOrderBy(opts.sort))
    .limit(opts.limit)
    .offset(offset);
}

// 공개 카운트 — listPublicNews 페이지네이션 용. 동일 조건(카테고리 + 검색)
export async function countPublicNews(
  board: NewsBoard,
  opts: Pick<ListOpts, "categorySlug" | "q">,
) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(
      and(
        boardWhere(board),
        publicPublishedWhere(),
        categoryWhere(opts.categorySlug),
        searchWhere(opts.q),
      ),
    );
  return row?.count ?? 0;
}

// 공개 상세 — draft·예약글 접근 시 null. 본문(body) + 태그 join
export async function getPublicNewsById(board: NewsBoard, id: string) {
  const [row] = await db
    .select({
      id: news.id,
      title: news.title,
      body: news.body,
      categoryId: news.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverImageUrl: news.coverImageUrl,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(and(boardWhere(board), eq(news.id, id), publicPublishedWhere()))
    .limit(1);
  if (!row) return null;
  const tags = await db
    .select({ tag: newsTags.tag })
    .from(newsTags)
    .where(eq(newsTags.newsId, id));
  return { ...row, tags: tags.map((t) => t.tag) };
}

// sitemap 용 — 발행글 전체 id + 최종수정일. 경량 select(본문·태그 제외)
export async function listPublishedForSitemap(board: NewsBoard) {
  return db
    .select({ id: news.id, updatedAt: news.updatedAt })
    .from(news)
    .where(and(boardWhere(board), publicPublishedWhere()))
    .orderBy(desc(news.publishedAt));
}

// ─── 어드민 — 모든 글 (draft + published, codex P1#7 분리) ───────────────

type AdminListOpts = {
  page: number;
  limit: number;
  status?: NewsStatus;
  categorySlug?: string;
  sort?: NewsSort;
  q?: string;
  tag?: string;
};

// 글별 analytics 이벤트 카운트 상관 서브쿼리 — listPublicNews 의 heartCount 서브쿼리 패턴과 동일.
// '반응' 컬럼(getNewsStatsForAdmin)과 같은 기준으로 정렬(news_view·heart_on)
function analyticsCount(eventType: "news_view" | "heart_on") {
  return sql`(select count(*) from ${analyticsEvents} where ${analyticsEvents.newsId} = ${news.id} and ${analyticsEvents.eventType} = ${eventType})`;
}

// 어드민 정렬 — 발행일(nulls last, draft 는 끝으로) / 제목 가나다 / 작성일 / 조회·공감 많은순. 동순위는 createdAt DESC 로 안정화
function adminOrderBy(sort: NewsSort = "published_desc") {
  switch (sort) {
    case "published_asc":
      return [sql`${news.publishedAt} asc nulls last`, desc(news.createdAt)];
    case "title_asc":
      return [asc(news.title), desc(news.createdAt)];
    case "created_desc":
      return [desc(news.createdAt)];
    case "views_desc":
      return [desc(analyticsCount("news_view")), desc(news.createdAt)];
    case "hearts_desc":
      return [desc(analyticsCount("heart_on")), desc(news.createdAt)];
    case "published_desc":
    default:
      return [sql`${news.publishedAt} desc nulls last`, desc(news.createdAt)];
  }
}

// 어드민 상태 탭 — '발행'은 실제 공개중(숨김 제외), '비공개'는 발행됐지만 숨긴 글 (ADR-053).
// 예약(미래 발행)은 is_hidden 과 무관 — 아직 공개된 적 없어 숨김 개념이 성립 안 함
function adminStatusWhere(status?: AdminListOpts["status"]) {
  if (status === "draft") return isNull(news.publishedAt);
  if (status === "scheduled") {
    return and(isNotNull(news.publishedAt), gt(news.publishedAt, sql`now()`));
  }
  if (status === "published") return publicPublishedWhere();
  if (status === "hidden") {
    return and(
      isNotNull(news.publishedAt),
      lte(news.publishedAt, sql`now()`),
      eq(news.isHidden, true),
    );
  }
  return undefined;
}

// 어드민 목록 — 모든 글 + 상태/카테고리 필터 + 정렬(기본 발행일 최신순, 운영자 요청)
export async function listForAdmin(board: NewsBoard, opts: AdminListOpts) {
  const offset = (opts.page - 1) * opts.limit;
  return db
    .select({
      id: news.id,
      title: news.title,
      categoryId: news.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      publishedAt: news.publishedAt,
      isHidden: news.isHidden,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(
      and(
        boardWhere(board),
        adminStatusWhere(opts.status),
        categoryWhere(opts.categorySlug),
        titleWhere(opts.q),
        tagWhere(opts.tag),
      ),
    )
    .orderBy(...adminOrderBy(opts.sort))
    .limit(opts.limit)
    .offset(offset);
}

// 어드민 카운트 — listForAdmin 페이지네이션용. 동일 필터(제목·태그 검색 포함)
export async function countForAdmin(
  board: NewsBoard,
  opts: Pick<AdminListOpts, "status" | "categorySlug" | "q" | "tag">,
) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(
      and(
        boardWhere(board),
        adminStatusWhere(opts.status),
        categoryWhere(opts.categorySlug),
        titleWhere(opts.q),
        tagWhere(opts.tag),
      ),
    );
  return row?.count ?? 0;
}

// 어드민 상세 — draft 포함. 수정 페이지 진입점 (T10)
export async function getAdminNewsById(board: NewsBoard, id: string) {
  const [row] = await db
    .select({
      id: news.id,
      title: news.title,
      body: news.body,
      categoryId: news.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverImageUrl: news.coverImageUrl,
      coverImageWidth: news.coverImageWidth,
      coverImageHeight: news.coverImageHeight,
      publishedAt: news.publishedAt,
      isHidden: news.isHidden,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(and(boardWhere(board), eq(news.id, id)))
    .limit(1);
  if (!row) return null;
  const tags = await db
    .select({ tag: newsTags.tag })
    .from(newsTags)
    .where(eq(newsTags.newsId, id));
  return { ...row, tags: tags.map((t) => t.tag) };
}

// 대시보드 글 현황 — 발행·예약·임시저장 건수 (한 쿼리). adminStatusWhere 와 동일 기준
export async function countNewsByStatus(board: NewsBoard) {
  const [row] = await db
    .select({
      published: sql<number>`count(*) filter (where ${news.publishedAt} is not null and ${news.publishedAt} <= now() and ${news.isHidden} = false)::int`,
      scheduled: sql<number>`count(*) filter (where ${news.publishedAt} is not null and ${news.publishedAt} > now())::int`,
      draft: sql<number>`count(*) filter (where ${news.publishedAt} is null)::int`,
      hidden: sql<number>`count(*) filter (where ${news.publishedAt} is not null and ${news.publishedAt} <= now() and ${news.isHidden} = true)::int`,
    })
    .from(news)
    .where(boardWhere(board));
  return {
    published: row?.published ?? 0,
    scheduled: row?.scheduled ?? 0,
    draft: row?.draft ?? 0,
    hidden: row?.hidden ?? 0,
  };
}

// 태그 자동완성 — prefix 매칭 + 빈도순 (결정 로그 [T6 빈도순])
// 게시판별 태그 풀만 제안 — news 조인 필수. 안 하면 언론 글 작성 중에 활동 스토리 태그가 뜬다
export async function searchTags(board: NewsBoard, prefix: string, limit = 10) {
  const trimmed = prefix.trim().toLowerCase();
  if (!trimmed) return [];
  return db
    .select({
      tag: newsTags.tag,
      count: sql<number>`count(*)::int`,
    })
    .from(newsTags)
    .innerJoin(news, eq(news.id, newsTags.newsId))
    .where(and(boardWhere(board), like(newsTags.tag, `${trimmed}%`)))
    .groupBy(newsTags.tag)
    .orderBy(desc(sql`count(*)`), newsTags.tag)
    .limit(limit);
}

// ─── 활성 카테고리 (사용자 사이트 CategoryTabs) ────────────────────────────

export async function findActiveCategories(board: NewsBoard) {
  return db
    .select()
    .from(categories)
    .where(and(eq(categories.board, board), eq(categories.isActive, true)))
    .orderBy(categories.sortOrder);
}

// ─── Heart (변경 X) ─────────────────────────────────────────────────────

export async function countActiveHearts(newsId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(heartEvents)
    .where(and(eq(heartEvents.newsId, newsId), isNull(heartEvents.deletedAt)));
  return row?.count ?? 0;
}

export async function findActiveHeartEvent(newsId: string, sessionId: string) {
  const [row] = await db
    .select()
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

// 세션 하트 행 (삭제 포함) — 토글 재활성용. unique(newsId, sessionId) 라 0~1행
export async function findHeartEventAny(newsId: string, sessionId: string) {
  const [row] = await db
    .select()
    .from(heartEvents)
    .where(
      and(eq(heartEvents.newsId, newsId), eq(heartEvents.sessionId, sessionId)),
    )
    .limit(1);
  return row ?? null;
}

// 익명 하트 — 공개 토글(트랜잭션 외 단건). insert / deletedAt 갱신.
// onConflictDoUpdate: 동시 "첫 좋아요" 경합(같은 newsId+sessionId 동시 insert)을 23505 throw 대신
// deletedAt=null 로 멱등 흡수 — 두 요청 모두 liked 로 수렴 (codex MED: tx/upsert 부재 race)
export async function insertHeart(newsId: string, sessionId: string) {
  await db
    .insert(heartEvents)
    .values({ newsId, sessionId })
    .onConflictDoUpdate({
      target: [heartEvents.newsId, heartEvents.sessionId],
      set: { deletedAt: null },
    });
}

// 현재 공개 여부 — 익명 하트가 draft/예약/비공개 글에 row 생성하는 것 차단용 (codex MED)
export async function isNewsPublished(newsId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: news.id })
    .from(news)
    .where(and(eq(news.id, newsId), publicPublishedWhere()))
    .limit(1);
  return row != null;
}

// 인접 글 — 현재 공개 글만, publishedAt 기준. **prev(이전글)=더 과거 / next(다음글)=더 최신** — 시간 순서를 따르는 게시판 관례
// (2026-07-25 사회공헌국 제보로 방향 교정: 이전에는 목록 newest-first 순서를 따라 prev=더 최신이었고, "이전글인데 새 글이 뜬다"는 혼란을 낳았음).
// 동일 publishedAt tie 는 v1 스킵 허용(초 단위 정밀도). 자기 자신 제외
export async function findAdjacentNews(
  board: NewsBoard,
  newsId: string,
  publishedAt: Date,
) {
  const [prev] = await db
    .select({ id: news.id, title: news.title })
    .from(news)
    .where(
      and(
        boardWhere(board),
        publicPublishedWhere(),
        sql`${news.publishedAt} < ${publishedAt}`,
        sql`${news.id} <> ${newsId}`,
      ),
    )
    .orderBy(desc(news.publishedAt))
    .limit(1);
  const [next] = await db
    .select({ id: news.id, title: news.title })
    .from(news)
    .where(
      and(
        boardWhere(board),
        publicPublishedWhere(),
        sql`${news.publishedAt} > ${publishedAt}`,
        sql`${news.id} <> ${newsId}`,
      ),
    )
    .orderBy(asc(news.publishedAt))
    .limit(1);
  return { prev: prev ?? null, next: next ?? null };
}

export async function setHeartDeleted(id: string, deleted: boolean) {
  await db
    .update(heartEvents)
    .set({ deletedAt: deleted ? new Date() : null })
    .where(eq(heartEvents.id, id));
}

// 관련 글 — 같은 카테고리 최신순(self 제외, 현재 공개). ADR-013 가중치 스코어는 v1.1
export async function listRelatedNews(
  board: NewsBoard,
  newsId: string,
  categoryId: string,
  limit: number,
) {
  return db
    .select({
      id: news.id,
      title: news.title,
      categoryName: categories.name,
      coverImageUrl: news.coverImageUrl,
      publishedAt: news.publishedAt,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(
      and(
        boardWhere(board),
        publicPublishedWhere(),
        eq(news.categoryId, categoryId),
        sql`${news.id} <> ${newsId}`,
      ),
    )
    .orderBy(desc(news.publishedAt))
    .limit(limit);
}

// ─── Mutation — transaction 안에서만 호출 (codex P1#5, tx 인자 강제) ────────

// id 포함 가능 — 새 글은 client 생성 UUID 를 명시 전달 (업로드 prefix 정합, codex v2 P2#2)
type NewsInsertData = Omit<typeof news.$inferInsert, "createdAt" | "updatedAt">;
type NewsUpdateData = Partial<Omit<NewsInsertData, "id">>;

// 글 신규 — service 가 tx 안에서 호출. 태그는 replaceNewsTags 별도
export async function insertNews(tx: Tx, data: NewsInsertData) {
  const [row] = await tx
    .insert(news)
    .values(data)
    .returning({ id: news.id });
  return row;
}

// 글 수정 — updatedAt 자동 갱신, 없으면 null
export async function updateNews(tx: Tx, id: string, data: NewsUpdateData) {
  const [row] = await tx
    .update(news)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(news.id, id))
    .returning({ id: news.id });
  return row ?? null;
}

// 글 삭제 — news_tags / heart_events 는 FK cascade. S3 객체 청소는 service best-effort
export async function deleteNews(tx: Tx, id: string) {
  const [row] = await tx
    .delete(news)
    .where(eq(news.id, id))
    .returning({ id: news.id });
  return row ?? null;
}

// 태그 일괄 교체 — 전체 삭제 후 dedupe 재삽입. 태그 20개 한계, diff 계산 X (codex P1#5)
export async function replaceNewsTags(
  tx: Tx,
  newsId: string,
  tags: string[],
) {
  await tx.delete(newsTags).where(eq(newsTags.newsId, newsId));
  if (tags.length === 0) return;
  const deduped = Array.from(new Set(tags));
  await tx.insert(newsTags).values(deduped.map((tag) => ({ newsId, tag })));
}

// 쌀 나눔 카테고리 id — 슬롯 eligibility 검증용. slug 는 immutable(ADR-025)이라 캐시 불필요.
// board='story' 고정 — 랜딩 슬롯은 활동 스토리 전용이고, slug unique 가 (board, slug) 복합이라
// 이 조건이 없으면 언론 게시판의 동명 카테고리를 집어올 수 있다 (ADR-056)
export async function getRiceSharingCategoryId(tx: Tx) {
  const [row] = await tx
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.board, "story"), eq(categories.slug, RICE_SHARING_SLUG)))
    .limit(1);
  return row?.id ?? null;
}

// 단일 글의 랜딩 슬롯(story·featured) 동반 해제 — 발행 해제 시 고아 슬롯 정리 (A1b)
export async function clearLandingSlots(tx: Tx, id: string) {
  await tx
    .update(news)
    .set({ storySlot: null, featuredRank: null, updatedAt: new Date() })
    .where(eq(news.id, id));
}

// story 슬롯만 해제 — 쌀 나눔 외 카테고리로 변경 시(featured 는 전 카테고리라 유지, ADR-038)
export async function clearStorySlot(tx: Tx, id: string) {
  await tx
    .update(news)
    .set({ storySlot: null, updatedAt: new Date() })
    .where(eq(news.id, id));
}

// featured 슬롯만 해제 — 발행 해제 시(카테고리 변경엔 반응 안 함, ADR-038)
export async function clearFeaturedRank(tx: Tx, id: string) {
  await tx
    .update(news)
    .set({ featuredRank: null, updatedAt: new Date() })
    .where(eq(news.id, id));
}

export type SetLandingSlotResult =
  | { kind: "ok"; id: string }
  | { kind: "ineligible" }
  | { kind: "not_found" };

// 메인 랜딩 슬롯 설정 — StorySection (story_slot 1~2) / ArticleGrid (featured_rank 1~7).
// slot != null 점유 eligibility: story=발행+쌀 나눔 / featured=발행만(전 카테고리, ADR-038).
// (TOCTOU 차단: 대상 row FOR UPDATE 잠금 후 검증, 호출 전 acquireLandingSlotLock 직렬화 필수).
// slot == null 해제는 ineligible 글도 허용 — 고아 슬롯 정리 경로. UNIQUE WHERE NOT NULL 충돌은 점유자 선해제로 회피.
export async function setLandingSlot(
  tx: Tx,
  newsId: string,
  kind: "story" | "featured",
  slot: number | null,
): Promise<SetLandingSlotResult> {
  const column = kind === "story" ? news.storySlot : news.featuredRank;
  const fieldName = kind === "story" ? "storySlot" : "featuredRank";

  // 대상 글 row 잠금 — 동시 updateNews 의 미발행/카테고리 변경을 우리 tx 커밋까지 차단
  const [target] = await tx
    .select({
      id: news.id,
      publishedAt: news.publishedAt,
      categoryId: news.categoryId,
    })
    .from(news)
    .where(eq(news.id, newsId))
    .for("update")
    .limit(1);
  if (!target) return { kind: "not_found" };

  if (slot != null) {
    // 점유 — eligibility 확인 후에만 기존 점유자 해제(검증 실패 시 기존 슬롯 보존).
    // story=발행+쌀 나눔 / featured=발행만(전 카테고리, ADR-038)
    const isPublic =
      target.publishedAt != null && target.publishedAt.getTime() <= Date.now();
    let eligible = isPublic;
    if (kind === "story") {
      const riceId = await getRiceSharingCategoryId(tx);
      eligible = isPublic && target.categoryId === riceId;
    }
    if (!eligible) return { kind: "ineligible" };
    await tx
      .update(news)
      .set({ [fieldName]: null, updatedAt: new Date() })
      .where(eq(column, slot));
    await tx
      .update(news)
      .set({ [fieldName]: slot, updatedAt: new Date() })
      .where(eq(news.id, newsId));
    return { kind: "ok", id: target.id };
  }

  // 해제 — ineligible 글도 허용
  await tx
    .update(news)
    .set({ [fieldName]: null, updatedAt: new Date() })
    .where(eq(news.id, newsId));
  return { kind: "ok", id: target.id };
}

// hero 정렬 전용 트랜잭션 advisory lock — 동시 setHeroOrder 직렬화 (READ COMMITTED 인터리빙 race 차단, codex Slice3 C3.6).
// raw SQL 정당화: pg_advisory_xact_lock 은 Drizzle 헬퍼 부재 + 동시성 제어 목적. 커밋/롤백 시 자동 해제
const HERO_ORDER_LOCK_KEY = 740031;
export async function acquireHeroOrderLock(tx: Tx) {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(${HERO_ORDER_LOCK_KEY})`);
}

// 랜딩 슬롯 전용 advisory lock — 동시 setLandingSlot 직렬화 (점유자 선해제→대상 set 2-step 의 23505 unique violation 차단).
// 히어로와 다른 키 — 랜딩/히어로 저장이 서로 불필요하게 직렬화되지 않도록 (codex)
const LANDING_SLOT_LOCK_KEY = 740032;
export async function acquireLandingSlotLock(tx: Tx) {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(${LANDING_SLOT_LOCK_KEY})`);
}

// /news Hero 일괄 정렬 — 2-phase: (1) 기존 hero_rank 전부 해제 → partial unique index 비움 (충돌 원천 제거),
// (2) 새 순서대로 1..N 부여 (N ≤ 4). 단일 트랜잭션, 실패 시 롤백. 호출 전 acquireHeroOrderLock 으로 직렬화 필수.
// Phase2 는 publishedAt <= now 가드 — 검증 후 미발행·예약 전환된 글이 pin 되는 TOCTOU 차단 (Slice3 W-1)
export async function setHeroOrder(tx: Tx, orderedNewsIds: string[]) {
  await tx
    .update(news)
    .set({ heroRank: null, updatedAt: new Date() })
    .where(isNotNull(news.heroRank));
  for (let i = 0; i < orderedNewsIds.length; i++) {
    await tx
      .update(news)
      .set({ heroRank: i + 1, updatedAt: new Date() })
      .where(and(eq(news.id, orderedNewsIds[i]), publicPublishedWhere()));
  }
}

// 단일 글 hero 슬롯 해제 — 발행 해제 시 고아 heroRank 방지 (Slice3 C-2)
export async function clearHeroRank(tx: Tx, id: string) {
  await tx
    .update(news)
    .set({ heroRank: null, updatedAt: new Date() })
    .where(eq(news.id, id));
}

// 주어진 id 중 발행된 글 수 — hero 에 draft pin 차단 검증용 (C3.5)
export async function countPublishedIn(tx: Tx, ids: string[]) {
  if (ids.length === 0) return 0;
  const [row] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(news)
    .where(and(inArray(news.id, ids), publicPublishedWhere()));
  return row?.count ?? 0;
}

// /news Hero 노출 — 현재 공개 + hero_rank NOT NULL, rank 순. 전 카테고리 (랜딩 featured 의 rice_sharing 제한 없음). body 포함 (공개 히어로 발췌용, ≤4행)
export async function listHeroNews() {
  return db
    .select({
      id: news.id,
      title: news.title,
      body: news.body,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverImageUrl: news.coverImageUrl,
      publishedAt: news.publishedAt,
      heroRank: news.heroRank,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    // hero 는 활동 스토리 전용 (ADR-056) — news_press_no_slots CHECK 가 DB 에서도 막지만 쿼리에도 명시
    .where(and(boardWhere("story"), publicPublishedWhere(), isNotNull(news.heroRank)))
    .orderBy(asc(news.heroRank));
}

// 어드민 Hero picker 후보 — 현재 공개 + hero_rank NULL (아직 미지정), 최신순
export async function listHeroCandidates(limit = 50) {
  return db
    .select({
      id: news.id,
      title: news.title,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverImageUrl: news.coverImageUrl,
      publishedAt: news.publishedAt,
      heroRank: news.heroRank,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    // 활동 스토리만 후보 — hero_rank IS NULL 조건만으로는 언론 글이 전부 후보로 뜬다
    .where(and(boardWhere("story"), publicPublishedWhere(), isNull(news.heroRank)))
    .orderBy(desc(news.publishedAt))
    .limit(limit);
}
