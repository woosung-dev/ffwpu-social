// 어드민 소식 목록 정렬 키 — ?sort= 쿼리 검증 단일 출처(서버 page + 클라 NewsTable 공용)
// 조회·공감 정렬은 목록의 '반응' 컬럼과 동일하게 analytics_events(news_view·heart_on) 집계 기준.
// analytics 미마이그레이션 시 service 레이어에서 기본 정렬로 graceful fallback.

export const NEWS_SORT_KEYS = [
  "published_desc", // 발행일 최신순 (기본)
  "published_asc", // 발행일 오래된순
  "title_asc", // 제목 가나다순
  "created_desc", // 작성일 최신순
  "views_desc", // 조회 많은순 (analytics news_view)
  "hearts_desc", // 공감 많은순 (analytics heart_on)
] as const;

export type NewsSort = (typeof NEWS_SORT_KEYS)[number];

export const DEFAULT_NEWS_SORT: NewsSort = "published_desc";

// analytics_events 집계가 필요한 정렬 — 미마이그레이션 시 기본 정렬로 폴백 대상
export const ANALYTICS_SORTS: ReadonlySet<NewsSort> = new Set([
  "views_desc",
  "hearts_desc",
]);

// ?sort= 쿼리값을 허용 키로 정규화 (벗어나면 기본 발행일 최신순)
export function normalizeNewsSort(raw: string | string[] | undefined): NewsSort {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return NEWS_SORT_KEYS.includes(value as NewsSort)
    ? (value as NewsSort)
    : DEFAULT_NEWS_SORT;
}

// 어드민 목록 페이지당 개수 — ?pageSize= 쿼리 검증 단일 출처(서버 page + 클라 NewsTable 공용)
export const NEWS_PAGE_SIZES = [10, 20, 50] as const;

export type NewsPageSize = (typeof NEWS_PAGE_SIZES)[number];

export const DEFAULT_NEWS_PAGE_SIZE: NewsPageSize = 10;

// ?pageSize= 쿼리값을 허용 개수로 정규화 (벗어나면 기본 10)
export function normalizeNewsPageSize(
  raw: string | string[] | undefined,
): NewsPageSize {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return NEWS_PAGE_SIZES.includes(n as NewsPageSize)
    ? (n as NewsPageSize)
    : DEFAULT_NEWS_PAGE_SIZE;
}
