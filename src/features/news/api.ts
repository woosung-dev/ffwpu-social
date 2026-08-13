// 소식 도메인 React Query key factory + 목록 queryFn — 캐시 키·정규화 SSoT (typescript.md §4: 도메인별 api.ts)
// 클라(useSuspenseQuery): fetchNewsList → GET /api/news. 서버(prefetch): page.tsx 가 service.listNews 직접 호출 — 키·정규화는 여기서 공유 (drift 방지, nextjs-shared §5)
import { ALL_CATEGORY_SLUG } from "./constants";
import type { NewsBoard } from "./board";

export const NEWS_PAGE_SIZE = 9; // 3x3 그리드

// searchParams 단일 값 추출 — App Router 서버에서 반복 키(?q=a&q=b)는 string[] 로 들어옴(첫 값 채택).
// 클라 useSearchParams().get() 은 이미 string|null 이라 무영향. 배열에 .trim() 호출 시 서버 500 방지 (codex C1)
function firstParam(v: string | string[] | null | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : (v ?? undefined);
}

// 정렬 옵션 — latest(발행 최신순, 기본) | title(제목 가나다순)
export const NEWS_SORT_VALUES = ["latest", "title"] as const;
export type NewsSort = (typeof NEWS_SORT_VALUES)[number];

// URL searchParams → 목록 필터 정규화 — float/NaN/0/음수 page 차단, 빈 category 는 전체, q 는 trim(빈 값 = 검색 미적용), sort 미지/오입력은 latest
export function normalizeNewsListFilters(
  board: NewsBoard,
  params: {
    category?: string | string[] | null;
    q?: string | string[] | null;
    sort?: string | string[] | null;
    page?: string | string[] | null;
  },
): NewsListFilters {
  const category = firstParam(params.category);
  const categorySlug =
    category && category.length > 0 ? category : ALL_CATEGORY_SLUG;
  const q = firstParam(params.q)?.trim() ?? "";
  const sortRaw = firstParam(params.sort);
  const sort: NewsSort = NEWS_SORT_VALUES.includes(sortRaw as NewsSort)
    ? (sortRaw as NewsSort)
    : "latest";
  const page = Math.max(1, Math.floor(Number(firstParam(params.page)) || 1));
  return { board, categorySlug, q, sort, page };
}

export type NewsListFilters = {
  board: NewsBoard; // 게시판 — /news(story) 와 /press(press) 캐시 분리 (ADR-056)
  categorySlug: string; // 정규화 값 (전체 = ALL_CATEGORY_SLUG)
  q: string; // 정규화 검색어 (빈 문자열 = 검색 미적용)
  sort: NewsSort; // 정렬 (기본 latest)
  page: number;
};

export const newsKeys = {
  all: ["news"] as const,
  // board 가 키 앞자리 — 빠지면 /news 와 /press 가 같은 캐시를 공유해 서로의 목록을 보여준다
  list: (f: NewsListFilters) =>
    [...newsKeys.all, f.board, "list", f.categorySlug, f.q, f.sort, f.page] as const,
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
    board: f.board,
    page: String(f.page),
    limit: String(NEWS_PAGE_SIZE),
  });
  if (f.categorySlug !== ALL_CATEGORY_SLUG) {
    params.set("category", f.categorySlug);
  }
  if (f.q) {
    params.set("q", f.q);
  }
  if (f.sort !== "latest") {
    params.set("sort", f.sort);
  }
  const res = await fetch(`/api/news?${params.toString()}`);
  if (!res.ok) {
    throw new Error("글 목록을 불러오지 못했습니다.");
  }
  return res.json() as Promise<NewsListResult>;
}
