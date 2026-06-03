// /news 목록 (탭 + 그리드 + 페이지네이션) — useSuspenseQuery 클라 캐시. 탭·페이지 왕복 시 방문 조합 즉시 복원, URL 이 driver
"use client";

import { useSearchParams } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  fetchNewsList,
  newsKeys,
  normalizeNewsListFilters,
} from "@/features/news/api";
import { ALL_CATEGORY_SLUG } from "@/features/news/constants";
import {
  ArticleCard,
  Pagination,
  type CategoryTabItem,
} from "@/features/news/components";

import { NewsCategoryTabs } from "./news-filters";

type Props = {
  categories: readonly CategoryTabItem[];
};

export function NewsListClient({ categories }: Props) {
  const searchParams = useSearchParams();
  // 서버 prefetch 와 동일 정규화 — 키 drift 방지 (api.ts SSoT)
  const filters = normalizeNewsListFilters({
    category: searchParams.get("category"),
    page: searchParams.get("page"),
  });

  const { data: list } = useSuspenseQuery({
    queryKey: newsKeys.list(filters),
    queryFn: () => fetchNewsList(filters),
  });

  // 페이지 변경 href — 카테고리 유지, 1페이지는 쿼리 생략
  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (filters.categorySlug !== ALL_CATEGORY_SLUG) {
      params.set("category", filters.categorySlug);
    }
    if (nextPage !== 1) params.set("page", String(nextPage));
    const q = params.toString();
    return q ? `/news?${q}` : "/news";
  };

  return (
    <>
      <div className="mt-6 lg:mt-8">
        <NewsCategoryTabs
          categories={categories}
          selected={filters.categorySlug}
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
                  heartCount: item.heartCount,
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {list.totalPages > 1 && (
        <div className="mt-10 flex justify-center pb-4 pt-10 lg:mt-16 lg:pb-10 lg:pt-16">
          <Pagination
            page={filters.page}
            totalPages={list.totalPages}
            hrefForAction={buildPageHref}
          />
        </div>
      )}
    </>
  );
}
