// 어드민 언론 보도 관리 — 글 목록·CRUD (ADR-056). 활동 스토리와 달리 대표글(hero) 탭이 없어 탭 UI 자체를 두지 않는다.
// Server Component + Suspense (Cache Components). searchParams 는 Suspense 자식에서 await
import type { Metadata } from "next";
import { Suspense } from "react";

import { listNewsForAdmin } from "@/features/news";
import { getNewsStatsForAdmin } from "@/features/analytics";
import {
  NewsTable,
  type NewsRow,
  type NewsStatus,
  type NewsStatsMap,
} from "@/admin/components/NewsTable";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { ADMIN_COPY } from "@/admin/copy";
import {
  normalizeNewsSort,
  normalizeNewsPageSize,
  normalizeNewsSearch,
} from "@/features/news/admin-sort";

export const metadata: Metadata = {
  title: "언론 보도 관리 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

function pickStatus(raw: string | string[] | undefined): NewsStatus {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (
    value === "draft" ||
    value === "scheduled" ||
    value === "published" ||
    value === "hidden"
  ) {
    return value;
  }
  return "all";
}

function pickPage(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function pickCategorySlug(raw: string | string[] | undefined): string | undefined {
  if (typeof raw === "string" && raw.length > 0) return raw;
  return undefined;
}

export default function AdminPressPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ADMIN_COPY.press.title}
        description={ADMIN_COPY.press.description}
      />
      <Suspense fallback={<ListLoading />}>
        <PressList searchParamsPromise={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function PressList({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<SearchParams>;
}) {
  const searchParams = await searchParamsPromise;
  const page = pickPage(searchParams.page);
  const status = pickStatus(searchParams.status);
  const categorySlug = pickCategorySlug(searchParams.categorySlug);
  const sort = normalizeNewsSort(searchParams.sort);
  const pageSize = normalizeNewsPageSize(searchParams.pageSize);
  const q = normalizeNewsSearch(searchParams.q);
  const tag = normalizeNewsSearch(searchParams.tag);

  const result = await listNewsForAdmin("press", {
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
    isHidden: i.isHidden,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  }));

  // 글별 누적 통계 — analytics 미가용이어도 목록은 정상 렌더되도록 degrade (활동 스토리와 동일)
  let stats: NewsStatsMap = {};
  try {
    stats = await getNewsStatsForAdmin(rows.map((r) => r.id));
  } catch {
    stats = {};
  }

  return (
    <NewsTable
      board="press"
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
      <div className="h-11 animate-pulse rounded-md bg-muted/60" />
      <div className="h-96 animate-pulse rounded-md bg-muted/60" />
    </div>
  );
}
