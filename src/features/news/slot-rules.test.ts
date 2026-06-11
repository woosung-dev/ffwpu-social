// 슬롯 eligibility 순수 규칙 단위 테스트 — A1b 상태 전이 시 고아 슬롯 정리 판정 검증.
// story=발행+쌀나눔 / featured·hero=발행만 (ADR-038)
import { describe, expect, it } from "vitest";

import {
  featuredSlotEligible,
  heroEligible,
  slotsToClearOnTransition,
  storySlotEligible,
} from "./slot-rules";

describe("storySlotEligible", () => {
  it("발행 + 쌀 나눔이면 노출 가능", () => {
    expect(storySlotEligible({ isPublished: true, isRiceSharing: true })).toBe(true);
  });
  it("미발행이면 불가", () => {
    expect(storySlotEligible({ isPublished: false, isRiceSharing: true })).toBe(false);
  });
  it("쌀 나눔 외 카테고리면 불가", () => {
    expect(storySlotEligible({ isPublished: true, isRiceSharing: false })).toBe(false);
  });
});

describe("featuredSlotEligible", () => {
  it("발행이면 카테고리 무관하게 가능", () => {
    expect(featuredSlotEligible({ isPublished: true })).toBe(true);
  });
  it("미발행이면 불가", () => {
    expect(featuredSlotEligible({ isPublished: false })).toBe(false);
  });
});

describe("heroEligible", () => {
  it("발행이면 카테고리 무관하게 가능", () => {
    expect(heroEligible({ isPublished: true })).toBe(true);
  });
  it("미발행이면 불가", () => {
    expect(heroEligible({ isPublished: false })).toBe(false);
  });
});

describe("slotsToClearOnTransition", () => {
  it("발행 + 쌀 나눔 — 정리 없음", () => {
    expect(slotsToClearOnTransition({ isPublished: true, isRiceSharing: true })).toEqual({
      hero: false,
      story: false,
      featured: false,
    });
  });
  it("발행 + 쌀 나눔 외 — story 만 정리(featured·hero 유지)", () => {
    expect(slotsToClearOnTransition({ isPublished: true, isRiceSharing: false })).toEqual({
      hero: false,
      story: true,
      featured: false,
    });
  });
  it("미발행 + 쌀 나눔 — 전부 정리", () => {
    expect(slotsToClearOnTransition({ isPublished: false, isRiceSharing: true })).toEqual({
      hero: true,
      story: true,
      featured: true,
    });
  });
  it("미발행 + 쌀 나눔 외 — 전부 정리", () => {
    expect(slotsToClearOnTransition({ isPublished: false, isRiceSharing: false })).toEqual({
      hero: true,
      story: true,
      featured: true,
    });
  });
});
