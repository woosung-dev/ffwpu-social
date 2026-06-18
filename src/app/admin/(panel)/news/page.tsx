// 어드민 뉴스 목록 — Server Component + Suspense (Cache Components, 결정 #17). searchParams 는 Suspense 자식에서 await
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

export const metadata: Metadata = {
  title: "소식 글 관리 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

// 한 페이지 10건 — 어드민 목록 가독성 + 페이지네이션 활성화(20건이 한 페이지에 다 들어가 안 보이던 문제)
const PAGE_SIZE = 10;

type SearchParams = Record<string, string | string[] | undefined>;

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

export default function AdminNewsListPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ADMIN_COPY.news.title}
        description={ADMIN_COPY.news.description}
      />
      <Suspense fallback={<ListLoading />}>
        <NewsListData searchParamsPromise={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function NewsListData({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<SearchParams>;
}) {
  const searchParams = await searchParamsPromise;
  const page = pickPage(searchParams.page);
  const status = pickStatus(searchParams.status);
  const categorySlug = pickCategorySlug(searchParams.categorySlug);

  const result = await listNewsForAdmin({
    page,
    limit: PAGE_SIZE,
    status,
    categorySlug,
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
      status={status}
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
