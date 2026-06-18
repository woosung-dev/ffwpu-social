// 메인 랜딩 DB 쿼리 — KPI 지표 + StorySection 상단 슬롯 (news.story_slot) + ArticleGrid 하단 슬롯 (news.featured_rank) 큐레이션 + 자동 fallback
import "server-only";

import { and, asc, desc, eq, isNotNull, isNull, lte, notInArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { categories, kpiMetrics, news } from "@/db/schema";

const RICE_SHARING_SLUG = "rice_sharing";

function publicPublishedWhere() {
  return and(isNotNull(news.publishedAt), lte(news.publishedAt, sql`now()`));
}

// 활성 impact KPI — KpiSection "한 해동안 만들어낸 변화" (4행). section='impact' 필수 — 없으면 story 3행이 섞여 7개로 깨짐
export async function listActiveKpiMetrics() {
  return db
    .select({
      id: kpiMetrics.id,
      slug: kpiMetrics.slug,
      label: kpiMetrics.label,
      sublabel: kpiMetrics.sublabel,
      value: kpiMetrics.value,
      displayValue: kpiMetrics.displayValue,
      unit: kpiMetrics.unit,
      sortOrder: kpiMetrics.sortOrder,
    })
    .from(kpiMetrics)
    .where(and(eq(kpiMetrics.isActive, true), eq(kpiMetrics.section, "impact")))
    .orderBy(asc(kpiMetrics.sortOrder));
}

// 활성 story 통계 — StorySection (후원기관·지원가정·지역시설). hide-when-empty 는 렌더 시 value>0 필터
export async function listStoryStats() {
  return db
    .select({
      slug: kpiMetrics.slug,
      label: kpiMetrics.label,
      value: kpiMetrics.value,
      displayValue: kpiMetrics.displayValue,
      unit: kpiMetrics.unit,
      sortOrder: kpiMetrics.sortOrder,
    })
    .from(kpiMetrics)
    .where(and(eq(kpiMetrics.isActive, true), eq(kpiMetrics.section, "story")))
    .orderBy(asc(kpiMetrics.sortOrder));
}

// StorySection 카피 — 태그·제목·부제 (displayValue, 제목·부제는 \n 줄바꿈). 공개 렌더용. 빈값이면 StorySection 이 코드 상수 fallback
export async function listStorySectionText() {
  const rows = await db
    .select({ slug: kpiMetrics.slug, displayValue: kpiMetrics.displayValue })
    .from(kpiMetrics)
    .where(eq(kpiMetrics.section, "story_text"));
  const bySlug = (slug: string) =>
    rows.find((r) => r.slug === slug)?.displayValue ?? "";
  return {
    tag: bySlug("story_tag"),
    title: bySlug("story_title"),
    subtitle: bySlug("story_subtitle"),
  };
}

// StorySection 상단 슬롯 — 운영자 직접 지정 (1~2). 자동 fallback 없음 (사용자 결정 2026-06-01)
// 쌀 나눔 카테고리 + 발행된 글 + story_slot NOT NULL
export async function listStorySlots() {
  return db
    .select({
      id: news.id,
      title: news.title,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverImageUrl: news.coverImageUrl,
      publishedAt: news.publishedAt,
      storySlot: news.storySlot,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(
      and(
        publicPublishedWhere(),
        isNotNull(news.storySlot),
        eq(categories.slug, RICE_SHARING_SLUG),
      ),
    )
    .orderBy(asc(news.storySlot));
}

// ArticleGrid 하단 슬롯 — 운영자 pin (featured_rank) + 자동 fallback (전 카테고리 최신순, ADR-038)
// 결과: 1~7 자리 채워진 배열 (null 가능)
export async function listFeaturedGrid(slotCount = 7) {
  // 1. 운영자 pin
  const pinned = await db
    .select({
      id: news.id,
      title: news.title,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverImageUrl: news.coverImageUrl,
      coverImageWidth: news.coverImageWidth,
      coverImageHeight: news.coverImageHeight,
      publishedAt: news.publishedAt,
      storySlot: news.storySlot,
      featuredRank: news.featuredRank,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(and(publicPublishedWhere(), isNotNull(news.featuredRank)))
    .orderBy(asc(news.featuredRank));

  const pinnedIds = new Set(pinned.map((p) => p.id));
  const filledSlots = new Map<number, (typeof pinned)[number]>();
  for (const p of pinned) {
    if (p.featuredRank != null && p.featuredRank >= 1 && p.featuredRank <= slotCount) {
      filledSlots.set(p.featuredRank, p);
    }
  }
  const emptySlots = slotCount - filledSlots.size;

  // 2. 자동 fallback — 전 카테고리 최신순, pin 된 글 제외 (ADR-038)
  const autoCandidates = emptySlots > 0
    ? await db
        .select({
          id: news.id,
          title: news.title,
          categoryName: categories.name,
          categorySlug: categories.slug,
          coverImageUrl: news.coverImageUrl,
          coverImageWidth: news.coverImageWidth,
          coverImageHeight: news.coverImageHeight,
          publishedAt: news.publishedAt,
          storySlot: news.storySlot,
          featuredRank: news.featuredRank,
        })
        .from(news)
        .innerJoin(categories, eq(news.categoryId, categories.id))
        .where(
          and(
            publicPublishedWhere(),
            isNull(news.featuredRank),
            // notInArray(col, []) === TRUE 라 pin 없을 때도 안전 (codex: raw NOT IN 은 tuple 생성 실패 위험)
            notInArray(news.id, Array.from(pinnedIds)),
          ),
        )
        .orderBy(desc(news.publishedAt))
        .limit(emptySlots)
    : [];

  // 3. 슬롯 결합 — pin 자리 우선, 빈 자리 fallback
  const result: Array<(typeof pinned)[number] | null> = [];
  let autoIdx = 0;
  for (let pos = 1; pos <= slotCount; pos++) {
    const pinnedAt = filledSlots.get(pos);
    if (pinnedAt) {
      result.push(pinnedAt);
    } else {
      result.push(autoCandidates[autoIdx++] ?? null);
    }
  }
  return result;
}

// 어드민 story 슬롯 후보 — 발행된 쌀 나눔 글 전체(최신순). 상단 StorySection 은 쌀 나눔 유지(ADR-038).
// 슬롯 점유 현황(storySlot·featuredRank) 포함. page 에서 슬롯 배열로 매핑(점유 글만 — fallback 은 공개 listFeaturedGrid 전용: codex D2)
export async function listRiceSharingCandidates() {
  return db
    .select({
      id: news.id,
      title: news.title,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverImageUrl: news.coverImageUrl, // 슬롯 썸네일 — 운영자가 노출될 이미지 확인용
      publishedAt: news.publishedAt,
      storySlot: news.storySlot,
      featuredRank: news.featuredRank,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(
      and(publicPublishedWhere(), eq(categories.slug, RICE_SHARING_SLUG)),
    )
    .orderBy(desc(news.publishedAt));
}

// 어드민 featured 슬롯 후보 — 발행된 글 전체(전 카테고리, 최신순). 하단 ArticleGrid 는 카테고리 무관(ADR-038).
// 카테고리명도 함께 — 운영자가 선택지에서 어느 카테고리 글인지 식별 (LandingSlotManager)
export async function listAllPublishedCandidates() {
  return db
    .select({
      id: news.id,
      title: news.title,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverImageUrl: news.coverImageUrl,
      publishedAt: news.publishedAt,
      storySlot: news.storySlot,
      featuredRank: news.featuredRank,
    })
    .from(news)
    .innerJoin(categories, eq(news.categoryId, categories.id))
    .where(publicPublishedWhere())
    .orderBy(desc(news.publishedAt));
}
