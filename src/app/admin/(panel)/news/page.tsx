// 어드민 활동 스토리 관리 — 탭[스토리 대표글(소식 상단 슬라이드) / 스토리 관리(글 목록·CRUD)]. Server Component + Suspense (Cache Components). searchParams 는 Suspense 자식에서 await
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  listNewsForAdmin,
  getHeroNews,
  getHeroCandidates,
} from "@/features/news";
import { getNewsStatsForAdmin } from "@/features/analytics";
import {
  NewsTable,
  type NewsRow,
  type NewsStatus,
  type NewsStatsMap,
} from "@/admin/components/NewsTable";
import { HeroOrderManager } from "@/admin/components/HeroOrderManager";
import { StoryTabs } from "@/admin/components/StoryTabs";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { ADMIN_COPY } from "@/admin/copy";
import {
  normalizeNewsSort,
  normalizeNewsPageSize,
  normalizeNewsSearch,
} from "@/features/news/admin-sort";

export const metadata: Metadata = {
  title: "활동 스토리 관리 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

function pickTab(raw: string | string[] | undefined): "manage" | "featured" {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "featured" ? "featured" : "manage";
}

function pickStatus(raw: string | string[] | undefined): NewsStatus {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "draft" || value === "scheduled" || value === "published") {
    return value;
  }
  return "all";
}

function pickPage(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function pickCategorySlug(
  raw: string | string[] | undefined,
): string | undefined {
  if (typeof raw === "string" && raw.length > 0) return raw;
  return undefined;
}

export default function AdminStoryPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ADMIN_COPY.news.title}
        description={ADMIN_COPY.news.description}
      />
      <Suspense fallback={<div className="h-11 border-b border-border" />}>
        <StoryTabs />
      </Suspense>
      <Suspense fallback={<ListLoading />}>
        <StoryTabContent searchParamsPromise={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function StoryTabContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<SearchParams>;
}) {
  const searchParams = await searchParamsPromise;
  if (pickTab(searchParams.tab) === "featured") {
    return <FeaturedTab />;
  }
  return <ManageTab searchParams={searchParams} />;
}

// 스토리 대표글 탭 — /news 상단 우선 노출 글 최대 4개 드래그 정렬
async function FeaturedTab() {
  const [current, candidates] = await Promise.all([
    getHeroNews(),
    getHeroCandidates(),
  ]);
  return <HeroOrderManager initialItems={current} candidates={candidates} />;
}

// 스토리 관리 탭 — 글 목록·작성·수정·발행
async function ManageTab({ searchParams }: { searchParams: SearchParams }) {
  const page = pickPage(searchParams.page);
  const status = pickStatus(searchParams.status);
  const categorySlug = pickCategorySlug(searchParams.categorySlug);
  const sort = normalizeNewsSort(searchParams.sort);
  const pageSize = normalizeNewsPageSize(searchParams.pageSize);
  const q = normalizeNewsSearch(searchParams.q);
  const tag = normalizeNewsSearch(searchParams.tag);

  const result = await listNewsForAdmin({
    page,
    limit: pageSize,
    status,
    categorySlug,
    sort,
    q,
    tag,
  });
  const rows: NewsRow[] = result.items.map((i) => ({
    id: i.id,
    title: i.title,
    categoryName: i.categoryName,
    categorySlug: i.categorySlug,
    publishedAt: i.publishedAt,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  }));

  // 글별 누적 통계 — analytics 미가용(예: analytics_events 미마이그레이션)이어도 목록은 정상 렌더되도록 degrade
  let stats: NewsStatsMap = {};
  try {
    stats = await getNewsStatsForAdmin(rows.map((r) => r.id));
  } catch {
    stats = {};
  }

  return (
    <NewsTable
      rows={rows}
      page={result.page}
      totalPages={result.totalPages}
      total={result.total}
      status={status}
      sort={sort}
      pageSize={pageSize}
      q={q ?? ""}
      tag={tag ?? ""}
      stats={stats}
    />
  );
}

function ListLoading() {
  return (
    <div className="space-y-4" aria-busy>
      <div className="h-10 w-64 animate-pulse rounded-md bg-muted/60" />
      <div className="h-96 animate-pulse rounded-md bg-muted/60" />
    </div>
  );
}
