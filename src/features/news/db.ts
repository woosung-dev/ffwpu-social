// 소식(news) Drizzle 쿼리 전담 — DAL. db import는 여기서만 (fullstack.md §3). 공개(published_at IS NOT NULL) / 어드민(모두) 분리 (codex P1#7). mutation 은 tx 인자 강제 (codex P1#5)
import { and, asc, desc, eq, ilike, inArray, isNotNull, isNull, like, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, heartEvents, news, newsTags } from "@/db/schema";
import { ALL_CATEGORY_SLUG } from "./constants";
import { likePattern } from "./search-query";
import { RICE_SHARING_SLUG } from "./slot-rules";

// service.ts 가 db.transaction 콜백에서 받는 tx 와 동일 — mutation 함수 시그니처로 그대로 노출 (T6 결정 로그 [tx alias])
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type ListOpts = {
  categorySlug?: string;
  q?: string;
  page: number;
  limit: number;
};

function categoryWhere(categorySlug?: string) {
  return categorySlug && categorySlug !== ALL_CATEGORY_SLUG
    ? eq(categories.slug, categorySlug)
    : undefined;
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

// ─── 사용자 사이트 — published 만 (codex P1#7) ──────────────────────────────

// 공개 목록 — published_at IS NOT NULL 강제 (draft 노출 차단)
export async function listPublicNews(opts: ListOpts) {
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
        isNotNull(news.publishedAt),
        categoryWhere(opts.categorySlug),
        searchWhere(opts.q),
      ),
    )
    .orderBy(desc(news.publishedAt))
    .limit(opts.limit)
    .offset(offset);
}

// 공개 카운트 — listPublicNews 페이지네이션 용. 동일 조건(카테고리 + 검색)
export async function countPublicNews(opts: Pick<ListOpts, "categorySlug" | "q">) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(
      and(
        isNotNull(news.publishedAt),
        categoryWhere(opts.categorySlug),
        searchWhere(opts.q),
      ),
    );
  return row?.count ?? 0;
}

// 공개 상세 — draft 접근 시 null. 본문(body) + 태그 join
export async function getPublicNewsById(id: string) {
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
    .where(and(eq(news.id, id), isNotNull(news.publishedAt)))
    .limit(1);
  if (!row) return null;
  const tags = await db
    .select({ tag: newsTags.tag })
    .from(newsTags)
    .where(eq(newsTags.newsId, id));
  return { ...row, tags: tags.map((t) => t.tag) };
}

// ─── 어드민 — 모든 글 (draft + published, codex P1#7 분리) ───────────────

type AdminListOpts = {
  page: number;
  limit: number;
  status?: "all" | "draft" | "published";
  categorySlug?: string;
};

function adminStatusWhere(status?: AdminListOpts["status"]) {
  if (status === "draft") return isNull(news.publishedAt);
  if (status === "published") return isNotNull(news.publishedAt);
  return undefined;
}

// 어드민 목록 — 모든 글 + 상태/카테고리 필터, createdAt DESC (결정 로그 [T6 정렬키])
export async function listForAdmin(opts: AdminListOpts) {
  const offset = (opts.page - 1) * opts.limit;
  return db
    .select({
      id: news.id,
      title: news.title,
      categoryId: news.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(and(adminStatusWhere(opts.status), categoryWhere(opts.categorySlug)))
    .orderBy(desc(news.createdAt))
    .limit(opts.limit)
    .offset(offset);
}

// 어드민 카운트 — listForAdmin 페이지네이션용. 동일 필터
export async function countForAdmin(
  opts: Pick<AdminListOpts, "status" | "categorySlug">,
) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(and(adminStatusWhere(opts.status), categoryWhere(opts.categorySlug)));
  return row?.count ?? 0;
}

// 어드민 상세 — draft 포함. 수정 페이지 진입점 (T10)
export async function getAdminNewsById(id: string) {
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
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(eq(news.id, id))
    .limit(1);
  if (!row) return null;
  const tags = await db
    .select({ tag: newsTags.tag })
    .from(newsTags)
    .where(eq(newsTags.newsId, id));
  return { ...row, tags: tags.map((t) => t.tag) };
}

// 대시보드 최근 N건 — 모든 글 (어드민 컨텍스트, draft 도 노출)
export async function listLatest(limit: number) {
  return db
    .select({
      id: news.id,
      title: news.title,
      categoryName: categories.name,
      categorySlug: categories.slug,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .orderBy(desc(news.createdAt))
    .limit(limit);
}

// 대시보드 카테고리별 글 수 — 활성 카테고리만 (결정 로그 [T11 활성만])
export async function countNewsByCategory() {
  return db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      count: sql<number>`count(${news.id})::int`,
    })
    .from(categories)
    .leftJoin(news, eq(news.categoryId, categories.id))
    .where(eq(categories.isActive, true))
    .groupBy(
      categories.id,
      categories.name,
      categories.slug,
      categories.sortOrder,
    )
    .orderBy(categories.sortOrder);
}

// 태그 자동완성 — prefix 매칭 + 빈도순 (결정 로그 [T6 빈도순])
export async function searchTags(prefix: string, limit = 10) {
  const trimmed = prefix.trim().toLowerCase();
  if (!trimmed) return [];
  return db
    .select({
      tag: newsTags.tag,
      count: sql<number>`count(*)::int`,
    })
    .from(newsTags)
    .where(like(newsTags.tag, `${trimmed}%`))
    .groupBy(newsTags.tag)
    .orderBy(desc(sql`count(*)`), newsTags.tag)
    .limit(limit);
}

// ─── 활성 카테고리 (사용자 사이트 CategoryTabs, 변경 X) ────────────────────

export async function findActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
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

// 발행 여부 — 익명 하트가 draft/비공개 글에 row 생성하는 것 차단용 (codex MED)
export async function isNewsPublished(newsId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: news.id })
    .from(news)
    .where(and(eq(news.id, newsId), isNotNull(news.publishedAt)))
    .limit(1);
  return row != null;
}

// 인접 글 — 발행 글만, publishedAt 기준. prev(이전글)=더 최신 / next(다음글)=더 과거 (목록 newest-first 정합).
// 동일 publishedAt tie 는 v1 스킵 허용(초 단위 정밀도). 자기 자신 제외
export async function findAdjacentNews(newsId: string, publishedAt: Date) {
  const [prev] = await db
    .select({ id: news.id, title: news.title })
    .from(news)
    .where(
      and(
        isNotNull(news.publishedAt),
        sql`${news.publishedAt} > ${publishedAt}`,
        sql`${news.id} <> ${newsId}`,
      ),
    )
    .orderBy(asc(news.publishedAt))
    .limit(1);
  const [next] = await db
    .select({ id: news.id, title: news.title })
    .from(news)
    .where(
      and(
        isNotNull(news.publishedAt),
        sql`${news.publishedAt} < ${publishedAt}`,
        sql`${news.id} <> ${newsId}`,
      ),
    )
    .orderBy(desc(news.publishedAt))
    .limit(1);
  return { prev: prev ?? null, next: next ?? null };
}

export async function setHeartDeleted(id: string, deleted: boolean) {
  await db
    .update(heartEvents)
    .set({ deletedAt: deleted ? new Date() : null })
    .where(eq(heartEvents.id, id));
}

// 관련 글 — 같은 카테고리 최신순(self 제외, published). ADR-013 가중치 스코어는 v1.1
export async function listRelatedNews(
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
        isNotNull(news.publishedAt),
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

// 쌀 나눔 카테고리 id — 슬롯 eligibility 검증용. slug 는 immutable(ADR-025)이라 캐시 불필요
export async function getRiceSharingCategoryId(tx: Tx) {
  const [row] = await tx
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, RICE_SHARING_SLUG))
    .limit(1);
  return row?.id ?? null;
}

// 단일 글의 랜딩 슬롯(story·featured) 동반 해제 — 발행 해제·카테고리 이탈 시 고아 슬롯 정리 (A1b)
export async function clearLandingSlots(tx: Tx, id: string) {
  await tx
    .update(news)
    .set({ storySlot: null, featuredRank: null, updatedAt: new Date() })
    .where(eq(news.id, id));
}

export type SetLandingSlotResult =
  | { kind: "ok"; id: string }
  | { kind: "ineligible" }
  | { kind: "not_found" };

// 메인 랜딩 슬롯 설정 — StorySection (story_slot 1~2) / ArticleGrid (featured_rank 1~7).
// slot != null 점유는 발행 + 쌀 나눔 카테고리만 허용(TOCTOU 차단: 대상 row FOR UPDATE 잠금 후 검증, 호출 전 acquireLandingSlotLock 직렬화 필수).
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
    // 점유 — eligibility(발행 + 쌀 나눔) 확인 후에만 기존 점유자 해제(검증 실패 시 기존 슬롯 보존)
    const riceId = await getRiceSharingCategoryId(tx);
    const eligible = target.publishedAt != null && target.categoryId === riceId;
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
// Phase2 는 publishedAt IS NOT NULL 가드 — 검증 후 미발행 전환된 글이 pin 되는 TOCTOU 차단 (Slice3 W-1)
export async function setHeroOrder(tx: Tx, orderedNewsIds: string[]) {
  await tx
    .update(news)
    .set({ heroRank: null, updatedAt: new Date() })
    .where(isNotNull(news.heroRank));
  for (let i = 0; i < orderedNewsIds.length; i++) {
    await tx
      .update(news)
      .set({ heroRank: i + 1, updatedAt: new Date() })
      .where(and(eq(news.id, orderedNewsIds[i]), isNotNull(news.publishedAt)));
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
    .where(and(inArray(news.id, ids), isNotNull(news.publishedAt)));
  return row?.count ?? 0;
}

// /news Hero 노출 — 발행 + hero_rank NOT NULL, rank 순. 전 카테고리 (랜딩 featured 의 rice_sharing 제한 없음). body 포함 (공개 히어로 발췌용, ≤4행)
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
    .where(and(isNotNull(news.publishedAt), isNotNull(news.heroRank)))
    .orderBy(asc(news.heroRank));
}

// 어드민 Hero picker 후보 — 발행 + hero_rank NULL (아직 미지정), 최신순
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
    .where(and(isNotNull(news.publishedAt), isNull(news.heroRank)))
    .orderBy(desc(news.publishedAt))
    .limit(limit);
}
