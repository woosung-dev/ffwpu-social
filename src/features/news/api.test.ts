// normalizeNewsListFilters / newsKeys — 검색어 q 정규화·캐시 키 포함 검증 (순수)
import { describe, expect, it } from "vitest";

import { ALL_CATEGORY_SLUG } from "./constants";
import { newsKeys, normalizeNewsListFilters } from "./api";

describe("normalizeNewsListFilters", () => {
  it("q 를 trim 하고 빈 입력은 빈 문자열로 정규화한다", () => {
    expect(normalizeNewsListFilters("story", { q: "  쌀 나눔  " }).q).toBe("쌀 나눔");
    expect(normalizeNewsListFilters("story", { q: "   " }).q).toBe("");
    expect(normalizeNewsListFilters("story", { q: null }).q).toBe("");
    expect(normalizeNewsListFilters("story", {}).q).toBe("");
  });

  it("반복 키(string[])는 첫 값을 채택하고 throw 하지 않는다 (App Router 서버 ?q=a&q=b)", () => {
    // 배열에 .trim() 호출로 서버 500 나던 회귀 (codex C1)
    expect(normalizeNewsListFilters("story", { q: ["쌀", "씨앗"] }).q).toBe("쌀");
    expect(normalizeNewsListFilters("story", { category: ["rice_sharing", "x"] }).categorySlug).toBe(
      "rice_sharing",
    );
    expect(normalizeNewsListFilters("story", { page: ["2", "9"] }).page).toBe(2);
  });

  it("category·page 정규화는 유지된다", () => {
    expect(normalizeNewsListFilters("story", { category: null }).categorySlug).toBe(
      ALL_CATEGORY_SLUG,
    );
    expect(normalizeNewsListFilters("story", { page: "0" }).page).toBe(1);
    expect(normalizeNewsListFilters("story", { page: "3" }).page).toBe(3);
  });

  it("sort 는 화이트리스트만 허용하고 미지·오입력은 latest 로 정규화한다", () => {
    expect(normalizeNewsListFilters("story", { sort: "title" }).sort).toBe("title");
    expect(normalizeNewsListFilters("story", { sort: "latest" }).sort).toBe("latest");
    expect(normalizeNewsListFilters("story", { sort: "bogus" }).sort).toBe("latest");
    expect(normalizeNewsListFilters("story", {}).sort).toBe("latest");
    expect(normalizeNewsListFilters("story", { sort: ["title", "x"] }).sort).toBe("title");
  });
});

describe("newsKeys.list", () => {
  const base = {
    board: "story" as const,
    categorySlug: ALL_CATEGORY_SLUG,
    sort: "latest" as const,
    page: 1,
  };

  it("캐시 키에 q·sort 가 포함돼 조합별로 키가 분리된다", () => {
    expect(newsKeys.list({ ...base, q: "쌀" })).not.toEqual(
      newsKeys.list({ ...base, q: "" }),
    );
    expect(newsKeys.list({ ...base, q: "", sort: "title" })).not.toEqual(
      newsKeys.list({ ...base, q: "" }),
    );
    expect(newsKeys.list({ ...base, q: "쌀" })).toEqual([
      "news",
      "story",
      "list",
      ALL_CATEGORY_SLUG,
      "쌀",
      "latest",
      1,
    ]);
  });

  // board 가 키에서 빠지면 /news 와 /press 가 서로의 목록을 캐시로 보여준다 (ADR-056)
  it("게시판이 다르면 같은 필터라도 캐시 키가 분리된다", () => {
    expect(newsKeys.list({ ...base, q: "" })).not.toEqual(
      newsKeys.list({ ...base, board: "press", q: "" }),
    );
  });
});
