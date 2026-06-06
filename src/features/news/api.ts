// 소식 도메인 React Query key factory + 목록 queryFn — 캐시 키·정규화 SSoT (typescript.md §4: 도메인별 api.ts)
// 클라(useSuspenseQuery): fetchNewsList → GET /api/news. 서버(prefetch): page.tsx 가 service.listNews 직접 호출 — 키·정규화는 여기서 공유 (drift 방지, nextjs-shared §5)
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

// 목록 응답 타입 — GET /api/news 의 클라 계약. db.listPublicNews select 와 동기화.
// publishedAt/createdAt 은 서버 prefetch(flight)=Date, 클라 fetch(JSON)=ISO string 양쪽 가능 — ArticleCard 가 둘 다 처리
export type NewsListItem = {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  coverImageUrl: string | null;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  heartCount: number;
};

export type NewsListResult = {
  items: NewsListItem[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

// 목록 fetch (클라 전용) — GET /api/news. Server Action 을 queryFn 으로 쓰면 렌더 중 Router setState 경고 → route handler 로 분리.
// 서버 prefetch 는 page.tsx 가 service.listNews 를 직접 호출 (이 함수는 브라우저에서만 실행). 실패 시 throw (RQ 컨벤션)
export async function fetchNewsList(f: NewsListFilters): Promise<NewsListResult> {
  const params = new URLSearchParams({
    page: String(f.page),
    limit: String(NEWS_PAGE_SIZE),
  });
  if (f.categorySlug !== ALL_CATEGORY_SLUG) {
    params.set("category", f.categorySlug);
  }
  const res = await fetch(`/api/news?${params.toString()}`);
  if (!res.ok) {
    throw new Error("소식 목록을 불러오지 못했습니다.");
  }
  return res.json() as Promise<NewsListResult>;
}
