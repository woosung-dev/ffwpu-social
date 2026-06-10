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
import { NewsSearch } from "./news-search";
import { NewsSort } from "./news-sort";

type Props = {
  categories: readonly CategoryTabItem[];
};

export function NewsListClient({ categories }: Props) {
  const searchParams = useSearchParams();
  // 서버 prefetch 와 동일 정규화 — 키 drift 방지 (api.ts SSoT)
  const filters = normalizeNewsListFilters({
    category: searchParams.get("category"),
    q: searchParams.get("q"),
    sort: searchParams.get("sort"),
    page: searchParams.get("page"),
  });

  const { data: list } = useSuspenseQuery({
    queryKey: newsKeys.list(filters),
    queryFn: () => fetchNewsList(filters),
  });

  // 페이지 변경 href — 카테고리·검색어·정렬 유지, 1페이지는 쿼리 생략
  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (filters.categorySlug !== ALL_CATEGORY_SLUG) {
      params.set("category", filters.categorySlug);
    }
    if (filters.q) params.set("q", filters.q);
    if (filters.sort !== "latest") params.set("sort", filters.sort);
    if (nextPage !== 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `/news?${query}` : "/news";
  };

  return (
    <>
      {/* 탭은 전체 폭 단독 행 — 카테고리 多 정합 (familyfed 1272-7363) */}
      <div className="mt-6 lg:mt-8">
        <NewsCategoryTabs
          categories={categories}
          selected={filters.categorySlug}
        />
      </div>

      {/* 탭 아래 행 — 검색(좌) + 정렬(우). items-end 로 두 하단선 정렬 */}
      <div className="mt-4 flex items-end justify-between gap-3 md:mt-5">
        {/* key={filters.q} — URL 의 q 가 외부에서 바뀌면(로고·/news 클릭) input 값을 리셋 (anti-slop: prop→state 는 key reset) */}
        <NewsSearch
          key={filters.q}
          defaultValue={filters.q}
          className="min-w-0 flex-1 max-w-[440px]"
        />
        <NewsSort value={filters.sort} />
      </div>

      {list.items.length === 0 ? (
        <p
          role="status"
          className="py-20 text-center text-sm text-ink-subtle"
        >
          {filters.q
            ? `'${filters.q}' 에 대한 검색 결과가 없습니다.`
            : "아직 등록된 소식이 없습니다."}
        </p>
      ) : (
        <ul className="mt-8 grid [grid-template-columns:repeat(auto-fill,minmax(max(200px,calc(50%-12px)),1fr))] gap-x-6 gap-y-12 md:grid-cols-2 md:gap-x-4.5 lg:mt-10 lg:grid-cols-3 wide:gap-x-6">
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
            page={list.page}
            totalPages={list.totalPages}
            hrefForAction={buildPageHref}
          />
        </div>
      )}
    </>
  );
}
