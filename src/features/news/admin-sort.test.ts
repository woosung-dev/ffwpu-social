// 어드민 검색어 정규화 — ?q=/?tag= 쿼리 trim·길이절단·빈값 처리 검증 (순수 함수)
import { describe, expect, it } from "vitest";

import { NEWS_SEARCH_MAX_LENGTH, normalizeNewsSearch } from "./admin-sort";

describe("normalizeNewsSearch", () => {
  it("일반 문자열은 그대로 반환한다", () => {
    expect(normalizeNewsSearch("쌀 나눔")).toBe("쌀 나눔");
  });

  it("앞뒤 공백을 trim 한다", () => {
    expect(normalizeNewsSearch("  봉사  ")).toBe("봉사");
  });

  it("빈 값·공백·undefined 는 undefined 로 정규화한다", () => {
    expect(normalizeNewsSearch("")).toBeUndefined();
    expect(normalizeNewsSearch("   ")).toBeUndefined();
    expect(normalizeNewsSearch(undefined)).toBeUndefined();
  });

  it("배열이면 첫 값을 사용한다", () => {
    expect(normalizeNewsSearch(["가족", "치유"])).toBe("가족");
  });

  it("최대 길이를 초과하면 절단한다", () => {
    const long = "가".repeat(NEWS_SEARCH_MAX_LENGTH + 50);
    expect(normalizeNewsSearch(long)).toHaveLength(NEWS_SEARCH_MAX_LENGTH);
  });
});
