// 시트 '총 누적 지표' 라벨 → 랜딩 KPI slug 매핑 (사용자 확정 2026-06-18). 라벨/카드 제목은 운영자 소유 → 동기화는 값(value·displayValue·unit)만 갱신.
// 시트의 '연인원봉사시간 누계'·'지원가정 수(helped_household_count)'는 매핑 제외 — 후자는 시트에 없어 수동 유지.

export const SHEET_LABEL_TO_SLUG = {
  "총 누적 봉사참여자수": "volunteer_count",
  "총 누적 봉사시간": "volunteer_period",
  "총 누적 활동건수": "event_count",
} as const;

export type SyncTargetSlug =
  (typeof SHEET_LABEL_TO_SLUG)[keyof typeof SHEET_LABEL_TO_SLUG];

// 동기화 대상 slug 목록 — service 가 이 순서로 순회
export const SYNC_TARGET_SLUGS = Object.values(
  SHEET_LABEL_TO_SLUG,
) as SyncTargetSlug[];
