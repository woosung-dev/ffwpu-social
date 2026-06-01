// KPI slug → 운영자 친화 한글 라벨 맵. 비숙련 운영자가 영문 slug(VOLUNTEER_COUNT) 보고 혼란스럽지 않도록 카드 제목에 사용
export const KPI_SLUG_LABELS: Record<string, string> = {
  volunteer_count: "누적 봉사자 수",
  volunteer_period: "누적 봉사 기간",
  helped_household_count: "도움을 주게 된 가정 수",
  event_count: "봉사활동 횟수",
};

// 알 수 없는 slug 는 slug 원문 반환 (운영자가 편집은 계속 가능, 빈칸 방지)
export function kpiFriendlyLabel(slug: string): string {
  return KPI_SLUG_LABELS[slug] ?? slug;
}
