// 소식 도메인 React Query key factory + 목록 queryFn — 캐시 키·정규화 SSoT (typescript.md §4: 도메인별 api.ts)
// 서버(prefetch)와 클라(useSuspenseQuery)가 동일 키·동일 fetch 를 import — drift 방지 (nextjs-shared §5)
import { listNewsAction } from "./actions";
import { ALL_CATEGORY_SLUG } from "./constants";

export const NEWS_PAGE_SIZE = 9; // 3x3 그리드

// URL searchParams → 목록 필터 정규화 — float/NaN/0/음수 page 차단, 빈 category 는 전체
export function normalizeNewsListFilters(params: {
  category?: string | null;
  page?: string | null;
}): NewsListFilters {
  const categorySlug =
    params.category && params.category.length > 0
      ? params.category
      : ALL_CATEGORY_SLUG;
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  return { categorySlug, page };
}

export type NewsListFilters = {
  categorySlug: string; // 정규화 값 (전체 = ALL_CATEGORY_SLUG)
  page: number;
};

export const newsKeys = {
  all: ["news"] as const,
  list: (f: NewsListFilters) =>
    [...newsKeys.all, "list", f.categorySlug, f.page] as const,
};

// 목록 fetch — 서버에선 직접 실행, 클라에선 Server Action RPC. 실패 시 throw (RQ 컨벤션)
export async function fetchNewsList(f: NewsListFilters) {
  const res = await listNewsAction({
    categorySlug:
      f.categorySlug === ALL_CATEGORY_SLUG ? undefined : f.categorySlug,
    page: f.page,
    limit: NEWS_PAGE_SIZE,
  });
  if (!res.success) {
    throw new Error("소식 목록을 불러오지 못했습니다.");
  }
  return res.data;
}
