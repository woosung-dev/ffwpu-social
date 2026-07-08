// 어드민 공지사항 관리 — 목록·발행 토글·삭제. Server Component + Suspense (Cache Components). searchParams 는 Suspense 자식에서 await
import type { Metadata } from "next";
import { Suspense } from "react";
import { listNoticesForAdmin } from "@/features/notices";
import {
  NoticesTable,
  NOTICE_SEARCH_MAX_LENGTH,
  type NoticeRow,
  type NoticeStatus,
} from "@/admin/components/NoticesTable";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { ADMIN_COPY } from "@/admin/copy";

export const metadata: Metadata = {
  title: "공지사항 관리 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;

type SearchParams = Record<string, string | string[] | undefined>;

function pickStatus(raw: string | string[] | undefined): NoticeStatus {
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

function pickSearch(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim().slice(0, NOTICE_SEARCH_MAX_LENGTH);
  return trimmed || undefined;
}

export default function AdminNoticesPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ADMIN_COPY.notices.title}
        description={ADMIN_COPY.notices.description}
      />
      <Suspense fallback={<ListLoading />}>
        <NoticesData searchParamsPromise={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function NoticesData({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<SearchParams>;
}) {
  const searchParams = await searchParamsPromise;
  const page = pickPage(searchParams.page);
  const status = pickStatus(searchParams.status);
  const q = pickSearch(searchParams.q);

  const result = await listNoticesForAdmin({ page, limit: PAGE_SIZE, status, q });
  const rows: NoticeRow[] = result.items.map((i) => ({
    id: i.id,
    title: i.title,
    publishedAt: i.publishedAt,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    attachmentCount: i.attachmentCount,
  }));

  return (
    <NoticesTable
      rows={rows}
      page={result.page}
      totalPages={result.totalPages}
      total={result.total}
      status={status}
      q={q ?? ""}
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
