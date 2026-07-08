// 어드민 공지사항 관리 — 목록·발행 토글·삭제. Server Component + Suspense (Cache Components). searchParams 는 Suspense 자식에서 await
import type { Metadata } from "next";
import { Suspense } from "react";
import { getNoticePinBoard, listNoticesForAdmin } from "@/features/notices";
import {
  NoticesTable,
  NOTICE_SEARCH_MAX_LENGTH,
  type NoticeRow,
  type NoticeStatus,
} from "@/admin/components/NoticesTable";
import {
  NoticePinOrderManager,
  type NoticePinItem,
} from "@/admin/components/NoticePinOrderManager";
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

// 서버 포맷(YYYY.MM.DD) — 고정 카드가 클라에서 Date 포맷 시 발생하는 TZ hydration mismatch 회피
function formatDate(d: Date | null): string {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
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
      <Suspense fallback={<PinLoading />}>
        <PinBoard />
      </Suspense>
      <Suspense fallback={<ListLoading />}>
        <NoticesData searchParamsPromise={props.searchParams} />
      </Suspense>
    </div>
  );
}

// 상위 고정 관리 카드 — searchParams 무관(페이지·검색과 독립)이라 별도 Suspense
async function PinBoard() {
  const { pinned, candidates } = await getNoticePinBoard();
  const toItem = (n: {
    id: string;
    title: string;
    publishedAt: Date | null;
  }): NoticePinItem => ({
    id: n.id,
    title: n.title,
    dateText: formatDate(n.publishedAt),
  });
  return (
    <NoticePinOrderManager
      initialItems={pinned.map(toItem)}
      candidates={candidates.map(toItem)}
    />
  );
}

function PinLoading() {
  return (
    <div className="h-64 animate-pulse rounded-md bg-muted/60" aria-busy />
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
    pinned: i.pinnedRank != null,
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
