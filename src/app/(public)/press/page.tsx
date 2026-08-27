// 언론 속 사회공헌 목록 (ADR-056) — 활동 스토리(/news)와 데이터가 분리된 별도 게시판.
// 상단 강조 캐러셀은 두지 않는다(사용자 결정 2026-08-13). 목록 영역은 /news 와 동일한 RQ Streaming SSR 구조를 재사용.
import type { Metadata } from "next";
import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { ALL_CATEGORY_SLUG, listCategories, listNews } from "@/features/news";
import {
  NEWS_PAGE_SIZE,
  newsKeys,
  normalizeNewsListFilters,
} from "@/features/news/api";
import { getQueryClient } from "@/lib/query/get-query-client";
import { SectionContainer } from "@/client/components/layout";
import { SITE_NAME } from "@/lib/site";

// 게시판이 달라도 상단 배너·목록 UI 는 같은 컴포넌트를 쓴다 — board/basePath prop 으로만 분기 (복제 금지)
import { SubBanner } from "../news/sub-banner";
import { NewsListClient } from "../news/news-list-client";

export const metadata: Metadata = {
  title: "언론 속 사회공헌 | 사회공헌단 Sow Good",
  description:
    "언론에 소개된 사회공헌단 Sow Good 의 나눔·봉사 활동 보도 모음.",
  alternates: { canonical: "/press" },
  openGraph: {
    siteName: SITE_NAME,
    title: "언론 속 사회공헌 | 사회공헌단 Sow Good",
    description:
      "언론에 소개된 사회공헌단 Sow Good 의 나눔·봉사 활동 보도 모음.",
    type: "website",
    locale: "ko_KR",
    url: "/press",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};

// App Router 는 반복 키를 string[] 로 전달 — normalizeNewsListFilters(firstParam) 가 흡수
type SearchParams = {
  category?: string | string[];
  page?: string | string[];
  q?: string | string[];
  sort?: string | string[];
};

export default function PressListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <>
      <SubBanner />

      {/* 수직 리듬은 /news 와 동일 — 히어로가 없어 상단 여백만 살짝 넉넉하게 */}
      <section className="w-full pt-[30px] pb-[60px] wide:pt-[60px] wide:pb-[70px]">
        <SectionContainer>
          <h2 className="text-2xl font-bold tracking-tight text-ink-strong lg:text-[28px] wide:text-[32px]">
            언론 보도
          </h2>

          <Suspense fallback={<PressListLoading />}>
            <PressListPrefetch searchParams={searchParams} />
          </Suspense>
        </SectionContainer>
      </section>
    </>
  );
}

// 서버 prefetch — await 하지 않음: pending Promise 가 dehydrate 되어 Suspense 스트리밍 (TanStack Advanced SSR)
async function PressListPrefetch({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, page, q, sort } = await searchParams;
  const filters = normalizeNewsListFilters("press", { category, page, q, sort });

  const categoriesAll = await listCategories("press");
  const categoriesForTabs = categoriesAll
    .filter((c) => c.isActive)
    .map((c) => ({ slug: c.slug, name: c.name }));

  const queryClient = getQueryClient();
  // 서버 prefetch — service 직접 호출. 클라는 동일 키로 GET /api/news?board=press 를 fetch (api.ts)
  void queryClient.prefetchQuery({
    queryKey: newsKeys.list(filters),
    queryFn: () =>
      listNews("press", {
        categorySlug:
          filters.categorySlug === ALL_CATEGORY_SLUG
            ? undefined
            : filters.categorySlug,
        q: filters.q || undefined,
        sort: filters.sort,
        page: filters.page,
        limit: NEWS_PAGE_SIZE,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NewsListClient board="press" categories={categoriesForTabs} />
    </HydrationBoundary>
  );
}

function PressListLoading() {
  return (
    // 실제 탭 래퍼의 헤딩→탭 간격 30/40 과 동기 — 로딩→로드 레이아웃 시프트 방지
    <div className="mt-[30px] wide:mt-10" aria-busy>
      <div className="h-10 animate-pulse rounded-md bg-muted/60" />
      <ul className="mt-[30px] grid [grid-template-columns:repeat(auto-fill,minmax(max(200px,calc(50%-9px)),1fr))] gap-x-4.5 gap-y-12 md:mt-8 md:grid-cols-2 lg:grid-cols-3 wide:gap-x-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <li key={i} className="h-[348px] animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </ul>
    </div>
  );
}
