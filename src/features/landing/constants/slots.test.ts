// 노출 개수 clamp — DB 값이 손상되거나 범위를 벗어나도 랜딩 렌더가 깨지지 않아야 한다 (ADR-054)
import { describe, expect, it } from "vitest";

import {
  clampFeaturedVisibleCount,
  FEATURED_SLOT_MAX,
  FEATURED_VISIBLE_DEFAULT,
} from "./slots";

describe("clampFeaturedVisibleCount", () => {
  it("범위 안의 값은 그대로 둔다", () => {
    expect(clampFeaturedVisibleCount(1)).toBe(1);
    expect(clampFeaturedVisibleCount(6)).toBe(6);
    expect(clampFeaturedVisibleCount(FEATURED_SLOT_MAX)).toBe(FEATURED_SLOT_MAX);
  });

  it("범위를 벗어나면 양끝으로 가둔다", () => {
    expect(clampFeaturedVisibleCount(0)).toBe(1);
    expect(clampFeaturedVisibleCount(-5)).toBe(1);
    expect(clampFeaturedVisibleCount(FEATURED_SLOT_MAX + 1)).toBe(FEATURED_SLOT_MAX);
  });

  it("소수는 버리고 숫자가 아니면 기본값을 쓴다", () => {
    expect(clampFeaturedVisibleCount(3.7)).toBe(3);
    expect(clampFeaturedVisibleCount(Number.NaN)).toBe(FEATURED_VISIBLE_DEFAULT);
    expect(clampFeaturedVisibleCount(Number.POSITIVE_INFINITY)).toBe(FEATURED_VISIBLE_DEFAULT);
  });
});
