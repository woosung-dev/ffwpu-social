// normalizeNewsListFilters / newsKeys — 검색어 q 정규화·캐시 키 포함 검증 (순수)
import { describe, expect, it } from "vitest";

import { ALL_CATEGORY_SLUG } from "./constants";
import { newsKeys, normalizeNewsListFilters } from "./api";

describe("normalizeNewsListFilters", () => {
  it("q 를 trim 하고 빈 입력은 빈 문자열로 정규화한다", () => {
    expect(normalizeNewsListFilters({ q: "  쌀 나눔  " }).q).toBe("쌀 나눔");
    expect(normalizeNewsListFilters({ q: "   " }).q).toBe("");
    expect(normalizeNewsListFilters({ q: null }).q).toBe("");
    expect(normalizeNewsListFilters({}).q).toBe("");
  });

  it("반복 키(string[])는 첫 값을 채택하고 throw 하지 않는다 (App Router 서버 ?q=a&q=b)", () => {
    // 배열에 .trim() 호출로 서버 500 나던 회귀 (codex C1)
    expect(normalizeNewsListFilters({ q: ["쌀", "씨앗"] }).q).toBe("쌀");
    expect(normalizeNewsListFilters({ category: ["rice_sharing", "x"] }).categorySlug).toBe(
      "rice_sharing",
    );
    expect(normalizeNewsListFilters({ page: ["2", "9"] }).page).toBe(2);
  });

  it("category·page 정규화는 유지된다", () => {
    expect(normalizeNewsListFilters({ category: null }).categorySlug).toBe(
      ALL_CATEGORY_SLUG,
    );
    expect(normalizeNewsListFilters({ page: "0" }).page).toBe(1);
    expect(normalizeNewsListFilters({ page: "3" }).page).toBe(3);
  });
});

describe("newsKeys.list", () => {
  it("캐시 키에 q 가 포함돼 검색어별로 키가 분리된다", () => {
    const base = { categorySlug: ALL_CATEGORY_SLUG, page: 1 };
    expect(newsKeys.list({ ...base, q: "쌀" })).not.toEqual(
      newsKeys.list({ ...base, q: "" }),
    );
    expect(newsKeys.list({ ...base, q: "쌀" })).toEqual([
      "news",
      "list",
      ALL_CATEGORY_SLUG,
      "쌀",
      1,
    ]);
  });
});
