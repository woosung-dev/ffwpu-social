// 소식 목록 페이지 — Figma node 125:8904 정합. SubBanner + (FeaturedStoryHero PR B) + CategoryTabs + 3x3 카드 그리드 + 페이지네이션
// 목록 영역은 RQ Streaming SSR: 서버 prefetch(no await) → HydrationBoundary → 클라 useSuspenseQuery (탭·페이지 왕복 캐시)
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

import { SubBanner } from "./sub-banner";
import { NewsHero } from "./news-hero";
import { NewsListClient } from "./news-list-client";

export const metadata: Metadata = {
  title: "쌀 나눔 소식 | 사회공헌단 Sow Good",
  description:
    "사회공헌단 Sow Good 의 쌀 나눔·가족 치유·지역 봉사·환경 캠페인 활동 소식.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "쌀 나눔 소식 | 사회공헌단 Sow Good",
    description:
      "사회공헌단 Sow Good 의 쌀 나눔·가족 치유·지역 봉사·환경 캠페인 활동 소식.",
    type: "website",
    locale: "ko_KR",
    url: "/news",
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

export default function NewsListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <>
      <SubBanner />

      {/* 소식 히어로 — /admin/news-hero 에서 지정한 우선 글 (없으면 비노출) */}
      <Suspense fallback={null}>
        <NewsHero />
      </Suspense>

      {/* 랜딩과 동일 밴드 고정폭 정합 — SectionContainer(768→648 / 1025→905 / 1440→1200, mobile px-4) */}
      {/* 수직 리듬 (Figma audit 2026-06-10): pt = Featured→헤딩 30(375/768/1025)·60(1440), pb = 페이지네이션 하단 40 과 합산해 Footer 간격 100(375/768/1025)·110(1440) */}
      <section className="w-full pt-[30px] pb-[60px] wide:pt-[60px] wide:pb-[70px]">
        <SectionContainer>
          {/* 헤딩 크기 — Figma 24(375/768) / 28(1025) / 32(1440) */}
          <h2 className="text-2xl font-bold tracking-tight text-ink-strong lg:text-[28px] wide:text-[32px]">
            더 많은 소식
          </h2>

          <Suspense fallback={<NewsListLoading />}>
            <NewsListPrefetch searchParams={searchParams} />
          </Suspense>
        </SectionContainer>
      </section>
    </>
  );
}

// 서버 prefetch — await 하지 않음: pending Promise 가 dehydrate 되어 Suspense 스트리밍 (TanStack Advanced SSR)
async function NewsListPrefetch({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, page, q, sort } = await searchParams;
  const filters = normalizeNewsListFilters({ category, page, q, sort });

  const categoriesAll = await listCategories();
  const categoriesForTabs = categoriesAll
    .filter((c) => c.isActive)
    .map((c) => ({ slug: c.slug, name: c.name }));

  const queryClient = getQueryClient();
  // 서버 prefetch — service 직접 호출(서버 컴포넌트). 클라는 동일 키로 GET /api/news 를 fetch (api.ts)
  void queryClient.prefetchQuery({
    queryKey: newsKeys.list(filters),
    queryFn: () =>
      listNews({
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
      <NewsListClient categories={categoriesForTabs} />
    </HydrationBoundary>
  );
}

function NewsListLoading() {
  return (
    // 실제 탭 래퍼(news-list-client)의 헤딩→탭 간격 30/40 과 동기 — 로딩→로드 레이아웃 시프트 방지
    <div className="mt-[30px] wide:mt-10" aria-busy>
      <div className="h-10 animate-pulse rounded-md bg-muted/60" />
      <ul className="mt-[30px] grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-8 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
        {Array.from({ length: 9 }).map((_, i) => (
          <li key={i} className="flex justify-center">
            <div className="h-[348px] w-full max-w-[382px] animate-pulse rounded-[14px] bg-muted/60" />
          </li>
        ))}
      </ul>
    </div>
  );
}
