// 소식 목록 페이지 — Figma node 125:8904 정합. SubBanner + (FeaturedStoryHero PR B) + CategoryTabs + 3x3 카드 그리드 + 페이지네이션
// 목록 영역은 RQ Streaming SSR: 서버 prefetch(no await) → HydrationBoundary → 클라 useSuspenseQuery (탭·페이지 왕복 캐시)
import type { Metadata } from "next";
import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { listCategories } from "@/features/news";
import {
  fetchNewsList,
  newsKeys,
  normalizeNewsListFilters,
} from "@/features/news/api";
import { getQueryClient } from "@/lib/query/get-query-client";

import { SubBanner } from "./sub-banner";
import { NewsHero } from "./news-hero";
import { NewsListClient } from "./news-list-client";

export const metadata: Metadata = {
  title: "쌀 나눔 소식 | 사회공헌단 Sow Good",
  description:
    "사회공헌단 Sow Good 의 쌀 나눔·가족 치유·지역 봉사·환경 캠페인 활동 소식.",
};

type SearchParams = {
  category?: string;
  page?: string;
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

      <section className="container mx-auto px-4 py-10 lg:px-20 lg:py-16">
        <h2 className="text-2xl font-bold tracking-tight text-ink-strong lg:text-[32px]">
          더 많은 소식
        </h2>

        <Suspense fallback={<NewsListLoading />}>
          <NewsListPrefetch searchParams={searchParams} />
        </Suspense>
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
  const { category, page } = await searchParams;
  const filters = normalizeNewsListFilters({ category, page });

  const categoriesAll = await listCategories();
  const categoriesForTabs = categoriesAll
    .filter((c) => c.isActive)
    .map((c) => ({ slug: c.slug, name: c.name }));

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({
    queryKey: newsKeys.list(filters),
    queryFn: () => fetchNewsList(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NewsListClient categories={categoriesForTabs} />
    </HydrationBoundary>
  );
}

function NewsListLoading() {
  return (
    <div className="mt-6 lg:mt-8" aria-busy>
      <div className="h-10 animate-pulse rounded-md bg-muted/60" />
      <ul className="mt-8 grid grid-cols-1 gap-6 min-[448px]:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
        {Array.from({ length: 9 }).map((_, i) => (
          <li key={i} className="flex justify-center">
            <div className="h-[348px] w-full max-w-[382px] animate-pulse rounded-[14px] bg-muted/60" />
          </li>
        ))}
      </ul>
    </div>
  );
}
