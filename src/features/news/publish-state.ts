// 글의 공개 상태 판정 — publishedAt(발행 시각) + isHidden(노출 토글) 합성 (ADR-053).
// 어드민 목록·에디터가 같은 판정을 쓰도록 순수 모듈로 분리 (slot-rules.ts 와 동일 패턴).
// 운영자 대면 라벨은 렌더러(NewsTable)에 둔다 — SORT_LABEL 패턴과 동일

export type NewsPublishState = "draft" | "scheduled" | "published" | "hidden";

// 어드민 상태 탭 = 전체 + 4개 판정 상태
export type NewsStatus = "all" | NewsPublishState;

// 숨김은 *이미 공개 시각이 지난 글*에만 의미가 있다.
// 임시저장(발행 안 함)·예약(미래 발행)은 아직 사용자에게 보인 적이 없어 is_hidden 을 무시 —
// 예약글에 숨김 배지를 붙이면 "예약이 취소된 건가?" 로 읽힌다
export function getPublishState(
  publishedAt: Date | null,
  isHidden: boolean,
  now: Date = new Date(),
): NewsPublishState {
  if (!publishedAt) return "draft";
  if (new Date(publishedAt).getTime() > now.getTime()) return "scheduled";
  return isHidden ? "hidden" : "published";
}

// 노출 토글을 노출할지 — 공개된 적 있는 글만 숨기고 되돌릴 수 있다
export function canToggleVisibility(state: NewsPublishState): boolean {
  return state === "published" || state === "hidden";
}
