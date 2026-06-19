// 시트 '총 누적 지표' 라벨 → 랜딩 KPI slug 매핑. 라벨/카드 제목은 운영자 소유 → 동기화는 값(value·displayValue·unit)만 갱신.
// 봉사시간 카드(volunteer_period)는 '연인원봉사시간 누계'(연인원×시간 누적)에 매핑 — 사용자 확정 2026-06-19.
//   ('총 누적 봉사시간'(실시간 합)이 아니라 연인원 누계가 랜딩에 표시될 값). 'helped_household_count'는 시트에 없어 수동 유지.
export const SHEET_LABEL_TO_SLUG = {
  "총 누적 봉사참여자수": "volunteer_count",
  "연인원봉사시간 누계": "volunteer_period",
  "총 누적 활동건수": "event_count",
} as const;

export type SyncTargetSlug =
  (typeof SHEET_LABEL_TO_SLUG)[keyof typeof SHEET_LABEL_TO_SLUG];

// 동기화 대상 slug 목록 — service 가 이 순서로 순회
export const SYNC_TARGET_SLUGS = Object.values(
  SHEET_LABEL_TO_SLUG,
) as SyncTargetSlug[];
