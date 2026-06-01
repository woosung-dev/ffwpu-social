// 소식 목록 페이지 — Figma node 125:8904 정합. SubBanner + (FeaturedStoryHero PR B) + CategoryTabs + 3x3 카드 그리드 + 페이지네이션
// Next.js 16 Cache Components 패턴: searchParams + DB 호출을 Suspense 안 NewsListContent 로 격리 (prerender shell 우선)
import type { Metadata } from "next";
import { Suspense } from "react";

import { listCategories, listNews } from "@/features/news";
import { ArticleCard, Pagination } from "@/features/news/components";
import { ALL_CATEGORY_SLUG } from "@/features/news/constants";

import { NewsCategoryTabs } from "./news-filters";
import { SubBanner } from "./sub-banner";

export const metadata: Metadata = {
  title: "쌀 나눔 소식 | 사회공헌단 Sow Good",
  description:
    "사회공헌단 Sow Good 의 쌀 나눔·가족 치유·지역 봉사·환경 캠페인 활동 소식.",
};

const PAGE_SIZE = 9; // 3x3 그리드

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

      {/* Featured Story Hero — PR B 에서 featured 글 연결. 본 PR 은 자리 비움 */}

      <section className="container mx-auto px-4 py-10 lg:px-20 lg:py-16">
        <h2 className="text-2xl font-bold tracking-tight text-ink-strong lg:text-[32px]">
          더 많은 소식
        </h2>

        <Suspense fallback={<NewsListLoading />}>
          <NewsListContent searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

async function NewsListContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, page } = await searchParams;
  const categorySlug = category && category.length > 0 ? category : ALL_CATEGORY_SLUG;
  // float / NaN / 0 / 음수 입력 차단 — DB OFFSET 에 정수 보장
  const pageNum = Math.max(1, Math.floor(Number(page) || 1));

  const [categoriesAll, list] = await Promise.all([
    listCategories(),
    listNews({
      page: pageNum,
      limit: PAGE_SIZE,
      categorySlug:
        categorySlug === ALL_CATEGORY_SLUG ? undefined : categorySlug,
    }),
  ]);

  const categoriesForTabs = categoriesAll
    .filter((c) => c.isActive)
    .map((c) => ({ slug: c.slug, name: c.name }));

  // 페이지 변경 시 query 빌더 (카테고리는 변경 시 page 리셋 — client filter 가 처리)
  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (categorySlug !== ALL_CATEGORY_SLUG) params.set("category", categorySlug);
    if (nextPage !== 1) params.set("page", String(nextPage));
    const q = params.toString();
    return q ? `/news?${q}` : "/news";
  };

  return (
    <>
      <div className="mt-6 lg:mt-8">
        <NewsCategoryTabs
          categories={categoriesForTabs}
          selected={categorySlug}
        />
      </div>

      {list.items.length === 0 ? (
        <p className="py-20 text-center text-sm text-ink-subtle">
          아직 등록된 소식이 없습니다.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
          {list.items.map((item) => (
            <li key={item.id} className="flex justify-center">
              <ArticleCard
                size={1}
                article={{
                  id: item.id,
                  title: item.title,
                  categoryName: item.categoryName,
                  coverImageUrl: item.coverImageUrl,
                  publishedAt: item.publishedAt,
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {list.totalPages > 1 && (
        <div className="mt-10 flex justify-center pb-4 pt-10 lg:mt-16 lg:pb-10 lg:pt-16">
          <Pagination
            page={pageNum}
            totalPages={list.totalPages}
            hrefForAction={buildPageHref}
          />
        </div>
      )}
    </>
  );
}

function NewsListLoading() {
  return (
    <div className="mt-6 lg:mt-8" aria-busy>
      <div className="h-10 animate-pulse rounded-md bg-muted/60" />
      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
        {Array.from({ length: 9 }).map((_, i) => (
          <li key={i} className="flex justify-center">
            <div className="h-[348px] w-full max-w-[382px] animate-pulse rounded-[14px] bg-muted/60" />
          </li>
        ))}
      </ul>
    </div>
  );
}
