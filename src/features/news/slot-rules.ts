// 메인 노출 슬롯 eligibility 순수 규칙 — DB 무관, 단위 테스트 대상.
// story(랜딩 상단 쌀 나눔 활동 사진)는 발행 + 쌀 나눔 카테고리 필요.
// featured(랜딩 하단 ArticleGrid) · hero(/news 상단)는 발행만 필요(카테고리 무관, ADR-038).
// 상태 전이(발행 해제·카테고리 변경) 시 ineligible 해진 슬롯을 정리해 "보이지 않는 슬롯 점유"를 방지한다.

export const RICE_SHARING_SLUG = "rice_sharing";

export type SlotEligibilityState = {
  isPublished: boolean;
  isRiceSharing: boolean;
};

// 랜딩 상단 story 슬롯 노출 자격 — 발행 + 쌀 나눔 ("쌀 나눔 활동" 섹션 의미 보존)
export function storySlotEligible(state: SlotEligibilityState): boolean {
  return state.isPublished && state.isRiceSharing;
}

// 랜딩 하단 featured(ArticleGrid) 슬롯 노출 자격 — 발행만 (전 카테고리, ADR-038)
export function featuredSlotEligible(
  state: Pick<SlotEligibilityState, "isPublished">,
): boolean {
  return state.isPublished;
}

// /news 히어로 노출 자격 — 발행만 (쌀 나눔 외 카테고리도 가능)
export function heroEligible(state: Pick<SlotEligibilityState, "isPublished">): boolean {
  return state.isPublished;
}

// 글 상태 변경 후 정리해야 할 슬롯 — true = 해제 필요.
// story 만 카테고리 이탈에 반응(쌀 나눔 외로 바뀌면 해제). featured·hero 는 미발행일 때만 해제.
export function slotsToClearOnTransition(state: SlotEligibilityState): {
  hero: boolean;
  story: boolean;
  featured: boolean;
} {
  return {
    hero: !heroEligible(state),
    story: !storySlotEligible(state),
    featured: !featuredSlotEligible(state),
  };
}
