// 랜딩 큐레이션 슬롯 개수 단일 출처 (ADR-054) — client-safe. 서버·어드민·공개 컴포넌트가 모두 여기서 읽는다.
// 이전에는 7 이 7곳, 6 이 3곳에 각각 하드코딩돼 있어 "지정했는데 화면에 안 나오는" 죽은 슬롯이 생겼다.

/** ArticleGridSection 하단 — 어드민이 글을 지정할 수 있는 최대 자리 수 */
export const FEATURED_SLOT_MAX = 12;

/** 노출 개수 설정이 없을 때 랜딩에 보여줄 카드 수 */
export const FEATURED_VISIBLE_DEFAULT = 6;

/** StorySection 상단 — 대표 사진 자리 수 */
export const STORY_SLOT_COUNT = 2;

/** 운영자가 고른 노출 개수를 항상 1~FEATURED_SLOT_MAX 로 가둔다 (DB 값이 손상돼도 렌더가 깨지지 않게) */
export function clampFeaturedVisibleCount(value: number): number {
  if (!Number.isFinite(value)) return FEATURED_VISIBLE_DEFAULT;
  return Math.min(FEATURED_SLOT_MAX, Math.max(1, Math.trunc(value)));
}
