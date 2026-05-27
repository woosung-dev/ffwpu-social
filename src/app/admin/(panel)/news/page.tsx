// 어드민 뉴스 목록 — Server Component + Suspense (Cache Components, 결정 #17). searchParams 는 Suspense 자식에서 await
import type { Metadata } from "next";
import { Suspense } from "react";
import { listNewsForAdmin } from "@/features/news";
import {
  NewsTable,
  type NewsRow,
  type NewsStatus,
} from "@/admin/components/NewsTable";

export const metadata: Metadata = {
  title: "뉴스 관리 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

type SearchParams = Record<string, string | string[] | undefined>;

function pickStatus(raw: string | string[] | undefined): NewsStatus {
  if (raw === "draft" || raw === "published") return raw;
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
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-ink-strong">뉴스 관리</h1>
        <p className="text-sm text-ink-subtle">
          발행된 글과 임시 저장 글을 한 곳에서 관리합니다.
        </p>
      </header>
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
  return (
    <NewsTable
      rows={rows}
      page={result.page}
      totalPages={result.totalPages}
      status={status}
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
