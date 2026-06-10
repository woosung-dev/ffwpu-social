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
      {/* 탭은 전체 폭 단독 행 — 카테고리 多 정합 (familyfed 1272-7363). 헤딩→탭 간격 Figma 30(375/768/1025)·40(1440) */}
      <div className="mt-[30px] wide:mt-10">
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

      {/* 그리드 colGap — Figma 18(767/768/1025)·24(1440). minmax 의 calc(50%-9px) 는 gap 18 의 절반과 동기 (2열 유지) */}
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
        <ul className="mt-8 grid [grid-template-columns:repeat(auto-fill,minmax(max(200px,calc(50%-9px)),1fr))] gap-x-4.5 gap-y-12 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 wide:gap-x-6">
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

      {/* 그리드→페이지네이션 80 (mt40+pt40, 전 BP) · 하단 40 은 section pb(60/70) 와 합산해 Footer 간격 100/110 — Figma audit 2026-06-10 */}
      {list.totalPages > 1 && (
        <div className="mt-10 flex justify-center pb-10 pt-10">
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
