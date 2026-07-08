// 공지사항 목록 페이지 — Figma 1103-7882. SubBanner + 헤딩 + 테이블형 목록(No./Title/Date) + 페이지네이션
// 검색·정렬·탭이 없어 순수 Server Component (?page= 만) — RQ Streaming SSR 불필요, 무효화는 revalidatePath("/notices")
import type { Metadata } from "next";
import { Suspense } from "react";

import { listNotices, listNoticesQuerySchema } from "@/features/notices";
import { SectionContainer } from "@/client/components/layout";

import { SubBanner } from "../news/sub-banner";
import { NoticeListRows, type NoticeListRow } from "./notice-list-rows";

export const metadata: Metadata = {
  title: "공지사항 | 사회공헌단 Sow Good",
  description: "사회공헌단 Sow Good 의 공지사항.",
  alternates: { canonical: "/notices" },
  openGraph: {
    title: "공지사항 | 사회공헌단 Sow Good",
    description: "사회공헌단 Sow Good 의 공지사항.",
    type: "website",
    locale: "ko_KR",
    url: "/notices",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};

type SearchParams = { page?: string | string[] };

function fmtDate(d: Date | null): string {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

export default function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <>
      <SubBanner />

      {/* 수직 리듬 — /news 목록과 동일 밴드 고정폭(SectionContainer) + pt/pb 정합 */}
      <section className="w-full pt-[30px] pb-[60px] wide:pt-[60px] wide:pb-[70px]">
        <SectionContainer>
          {/* 헤딩 크기 — /news 목록 헤딩과 동일 스케일 (24/24/28/32) */}
          <h2 className="text-2xl font-bold tracking-tight text-ink-strong lg:text-[28px] wide:text-[32px]">
            공지사항
          </h2>

          <Suspense fallback={<NoticeListLoading />}>
            <NoticesData searchParams={searchParams} />
          </Suspense>
        </SectionContainer>
      </section>
    </>
  );
}

async function NoticesData({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;
  const pageRaw = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const parsed = listNoticesQuerySchema.safeParse({ page: pageRaw });
  // 비정수·범위 밖 page 는 1페이지로 폴백 (범위 초과 정수는 service 가 마지막 페이지로 clamp)
  const query = parsed.success ? parsed.data : listNoticesQuerySchema.parse({});

  const result = await listNotices(query);
  const rows: NoticeListRow[] = result.items.map((item, idx) => ({
    id: item.id,
    // 발행 기준 역순 전체 번호 — 최신 글이 가장 큰 번호
    no: result.total - (result.page - 1) * result.limit - idx,
    title: item.title,
    hasAttachment: item.hasAttachment,
    dateText: fmtDate(item.publishedAt),
  }));

  return (
    <NoticeListRows rows={rows} page={result.page} totalPages={result.totalPages} />
  );
}

function NoticeListLoading() {
  return (
    <div className="mt-[30px] wide:mt-10" aria-busy>
      <div className="h-12 animate-pulse rounded-md bg-muted/60" />
      <ul className="mt-2 space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <li key={i} className="h-12 animate-pulse rounded-md bg-muted/40" />
        ))}
      </ul>
    </div>
  );
}
