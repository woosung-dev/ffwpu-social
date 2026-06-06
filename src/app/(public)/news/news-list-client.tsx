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

type Props = {
  categories: readonly CategoryTabItem[];
};

export function NewsListClient({ categories }: Props) {
  const searchParams = useSearchParams();
  // 서버 prefetch 와 동일 정규화 — 키 drift 방지 (api.ts SSoT)
  const filters = normalizeNewsListFilters({
    category: searchParams.get("category"),
    q: searchParams.get("q"),
    page: searchParams.get("page"),
  });

  const { data: list } = useSuspenseQuery({
    queryKey: newsKeys.list(filters),
    queryFn: () => fetchNewsList(filters),
  });

  // 페이지 변경 href — 카테고리·검색어 유지, 1페이지는 쿼리 생략
  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (filters.categorySlug !== ALL_CATEGORY_SLUG) {
      params.set("category", filters.categorySlug);
    }
    if (filters.q) params.set("q", filters.q);
    if (nextPage !== 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `/news?${query}` : "/news";
  };

  return (
    <>
      {/* 툴바 — 모바일 세로 스택(탭 위 / 검색 아래), md↑ 한 줄(탭 좌측 flex-1 + 검색 우측, 하단선 정렬). 검색은 탭의 overflow-x-auto 영역 밖 형제 */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:gap-5 lg:mt-8 wide:gap-6">
        <div className="min-w-0 flex-1">
          <NewsCategoryTabs
            categories={categories}
            selected={filters.categorySlug}
          />
        </div>
        {/* key={filters.q} — URL 의 q 가 외부에서 바뀌면(로고·/news 클릭) input 값을 리셋 (anti-slop: prop→state 는 key reset) */}
        <NewsSearch key={filters.q} defaultValue={filters.q} />
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
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-x-[18px] md:gap-y-12 lg:mt-10 lg:grid-cols-3 wide:gap-x-6">
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
