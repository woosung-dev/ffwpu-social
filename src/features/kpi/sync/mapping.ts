// 시트 라벨 → KPI slug 매핑. 시트는 2개(협회 누적 지표 / 쌀나눔 대장)이고 각각 다른 랜딩 섹션을 채운다.
// 라벨·단위·카드 제목은 운영자 소유 → 동기화는 값(value)만 갱신한다.

// ① 협회 '총 누적 지표' 시트 → 랜딩 KpiSection (section='impact')
// 봉사시간 카드(volunteer_period)는 '연인원봉사시간 누계'(연인원×시간 누적)에 매핑 — 사용자 확정 2026-06-19.
//   ('총 누적 봉사시간'(실시간 합)이 아니라 연인원 누계가 랜딩에 표시될 값). 'helped_household_count'는 시트에 없어 수동 유지.
export const IMPACT_SHEET_LABELS = {
  "총 누적 봉사참여자수": "volunteer_count",
  "연인원봉사시간 누계": "volunteer_period",
  "총 누적 활동건수": "event_count",
} as const;

// ② 쌀나눔 대장 시트 → 랜딩 StorySection (section='story'). 행 0 라벨 / 행 1 총계.
// '쌀화환 참여기관 수'(기부처)·'쌀 나눔 포대 수'는 미사용 — 사용자 결정 2026-08-28 (Figma 3열 유지).
// slug story_supported_orgs 는 '나눈 사랑(쌀)의 무게' 로 전용된 상태 (0009 마이그레이션).
export const STORY_SHEET_LABELS = {
  "쌀 나눔 포대 무게(kg)": "story_supported_orgs",
  "나눔가정 수": "story_supported_households",
  "나눔 단체 수": "story_local_facilities",
} as const;

export type SheetKind = "impact" | "story";

export type SyncTargetSlug =
  | (typeof IMPACT_SHEET_LABELS)[keyof typeof IMPACT_SHEET_LABELS]
  | (typeof STORY_SHEET_LABELS)[keyof typeof STORY_SHEET_LABELS];

// 시트 종류별 설정 단일 출처 — 라벨 맵 · 대상 slug · env 키 · 사람이 읽는 이름.
// 새 시트를 붙일 때 여기 한 곳만 늘리면 parse/service/actions 가 따라온다.
export const SHEET_CONFIG = {
  impact: {
    labels: IMPACT_SHEET_LABELS as Record<string, SyncTargetSlug>,
    envKey: "KPI_SHEET_CSV_URL",
    displayName: "협회 누적 지표",
  },
  story: {
    labels: STORY_SHEET_LABELS as Record<string, SyncTargetSlug>,
    envKey: "RICE_SHEET_CSV_URL",
    displayName: "쌀 나눔 대장",
  },
} as const satisfies Record<
  SheetKind,
  { labels: Record<string, SyncTargetSlug>; envKey: string; displayName: string }
>;

// 시트 종류별 동기화 대상 slug — service 가 이 순서로 순회
export function syncTargetSlugs(kind: SheetKind): SyncTargetSlug[] {
  return Object.values(SHEET_CONFIG[kind].labels);
}
