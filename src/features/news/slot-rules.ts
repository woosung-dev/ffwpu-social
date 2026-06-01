// 메인 노출 슬롯 eligibility 순수 규칙 — DB 무관, 단위 테스트 대상.
// 랜딩 슬롯(story/featured)은 발행 + 쌀 나눔 카테고리 필요, 히어로(/news 상단)는 발행만 필요(카테고리 무관).
// 상태 전이(발행 해제·카테고리 변경) 시 ineligible 해진 슬롯을 정리해 "보이지 않는 슬롯 점유"를 방지한다.

export const RICE_SHARING_SLUG = "rice_sharing";

export type SlotEligibilityState = {
  isPublished: boolean;
  isRiceSharing: boolean;
};

// 랜딩 story/featured 슬롯 노출 자격
export function landingSlotEligible(state: SlotEligibilityState): boolean {
  return state.isPublished && state.isRiceSharing;
}

// /news 히어로 노출 자격 — 발행만 (쌀 나눔 외 카테고리도 가능)
export function heroEligible(state: Pick<SlotEligibilityState, "isPublished">): boolean {
  return state.isPublished;
}

// 글 상태 변경 후 정리해야 할 슬롯 — true = 해제 필요
export function slotsToClearOnTransition(state: SlotEligibilityState): {
  hero: boolean;
  landing: boolean;
} {
  return {
    hero: !heroEligible(state),
    landing: !landingSlotEligible(state),
  };
}
