// 공지사항 목록 페이지 — Figma 1103:7882 정합. SubBanner + 중앙 타이틀(News eyebrow) + 테이블형 목록(900px) + 페이지네이션 + 하단 그라데이션
// 검색·정렬·탭이 없어 순수 Server Component (?page= 만) — RQ Streaming SSR 불필요, 무효화는 revalidatePath("/notices")
import type { Metadata } from "next";
import { Suspense } from "react";

import { listNotices, listNoticesQuerySchema } from "@/features/notices";
import { SectionContainer } from "@/client/components/layout";

import { SubBanner } from "../news/sub-banner";
import { ScrollTopButton } from "../news/[id]/scroll-top";
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
    // 배경 밴드 기준 래퍼 — 하단 그라데이션(white→#F9F4FF)을 콘텐츠 뒤에 격리 (news 상세 동일 패턴, Figma Background h590)
    <div className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[360px] bg-gradient-to-b from-white to-[#F9F4FF]/80 wide:h-[590px]"
      />
      <SubBanner />

      {/* 수직 리듬 — Figma 4-BP: 배너 →타이틀 51/113/183/183 (docs/design/notices-fidelity-2026-07-08.md) */}
      <section className="w-full pt-[50px] pb-[100px] md:pt-[113px] lg:pt-[183px] wide:pb-[180px]">
        <SectionContainer>
          {/* 타이틀 — Figma 1103:8022: News eyebrow(SUIT Bold 18 #b35feb) +4+ 공지사항(SemiBold 32 #1f2937), 중앙. 전 BP 고정 크기 */}
          <div className="text-center">
            <p className="text-lg font-bold leading-[1.6] text-[#b35feb]">
              News
            </p>
            <h1 className="mt-1 text-[32px] font-semibold leading-[1.5] text-[#1f2937]">
              공지사항
            </h1>
          </div>

          <Suspense fallback={<NoticeListLoading />}>
            <NoticesData searchParams={searchParams} />
          </Suspense>
        </SectionContainer>
      </section>
      <ScrollTopButton />
    </div>
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
  const rows: NoticeListRow[] = result.items.map((item) => ({
    id: item.id,
    // 게시글 고유 번호 — 서버 ROW_NUMBER(발행순). 고정 행도 자기 번호 유지 (Figma 정합, db.ts 참조)
    no: item.seqNo,
    title: item.title,
    hasAttachment: item.hasAttachment,
    pinned: item.pinnedRank != null,
    dateText: fmtDate(item.publishedAt),
  }));

  return (
    <NoticeListRows rows={rows} page={result.page} totalPages={result.totalPages} />
  );
}

function NoticeListLoading() {
  return (
    <div className="mt-10 md:mt-[82px] wide:mx-auto wide:max-w-[900px]" aria-busy>
      <div className="h-10 animate-pulse rounded-[4px] bg-muted/60 md:h-11 lg:h-[53px]" />
      <ul className="mt-2 space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <li key={i} className="h-12 animate-pulse rounded-[4px] bg-muted/40 md:h-14 lg:h-[62px]" />
        ))}
      </ul>
    </div>
  );
}
