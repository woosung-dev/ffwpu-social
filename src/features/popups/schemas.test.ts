// 홈 팝업 입력 스키마의 링크·기간·제목 검증을 보장하는 단위 테스트다.
import { describe, expect, it } from "vitest";

import { popupFormSchema, popupInputSchema } from "./schemas";

const startsAt = new Date("2026-07-18T09:00:00.000Z");

function input(overrides: Record<string, unknown> = {}) {
  return {
    title: "여름 캠페인 안내",
    imageUrl: "https://cdn.example.org/popups/summer.webp",
    startsAt,
    ...overrides,
  };
}

describe("popupInputSchema", () => {
  it("내부 경로와 HTTPS 링크를 허용한다", () => {
    expect(popupInputSchema.safeParse(input({ linkUrl: "/news" })).success).toBe(true);
    expect(popupInputSchema.safeParse(input({ linkUrl: "https://example.org" })).success).toBe(true);
  });

  it("HTTP와 javascript 링크를 거부한다", () => {
    expect(popupInputSchema.safeParse(input({ linkUrl: "http://example.org" })).success).toBe(false);
    expect(popupInputSchema.safeParse(input({ linkUrl: "javascript:alert(1)" })).success).toBe(false);
  });

  it("빈 링크는 null로 변환한다", () => {
    const result = popupInputSchema.parse(input({ linkUrl: "   " }));
    expect(result.linkUrl).toBeNull();
  });

  it("링크 열기 방식은 작은 새 창이 기본값이고 임의 문자열은 거부한다", () => {
    expect(popupInputSchema.parse(input()).linkTarget).toBe("small_window");
    expect(popupInputSchema.safeParse(input({ linkTarget: "iframe" })).success).toBe(false);
  });

  it("다시 보지 않기 기간은 일주일이 기본값이고 임의 문자열은 거부한다", () => {
    expect(popupInputSchema.parse(input()).dismissDuration).toBe("week");
    expect(popupInputSchema.parse(input({ dismissDuration: "day" })).dismissDuration).toBe("day");
    expect(popupInputSchema.safeParse(input({ dismissDuration: "month" })).success).toBe(false);
  });

  it("종료일이 시작일보다 이르면 거부하고 null은 허용한다", () => {
    expect(
      popupInputSchema.safeParse(input({ endsAt: new Date("2026-07-18T08:59:59.000Z") })).success,
    ).toBe(false);
    expect(popupInputSchema.safeParse(input({ endsAt: null })).success).toBe(true);
  });

  it("공백 제목과 101자 제목을 거부한다", () => {
    expect(popupInputSchema.safeParse(input({ title: "   " })).success).toBe(false);
    expect(popupInputSchema.safeParse(input({ title: "가".repeat(101) })).success).toBe(false);
  });
});

describe("popupFormSchema", () => {
  // Zod v4 는 refine 붙은 객체에 pick/omit 시 런타임 throw — 폼 파생 스키마가 파스 가능한지 회귀 보장
  it("제목·링크만으로 파스되고 빈 링크는 null이 된다", () => {
    const result = popupFormSchema.parse({ title: "여름 캠페인", linkUrl: "" });
    expect(result).toEqual({ title: "여름 캠페인", linkUrl: null });
  });
});
