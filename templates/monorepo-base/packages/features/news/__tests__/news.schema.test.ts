// news schema 검증 단위 테스트 — Zod 경계 동작 확인 (vitest 추가 후 동작)
import { describe, expect, it } from "vitest";
import {
  ALL_CATEGORY_SLUG,
  newsCreateSchema,
  newsListQuerySchema,
  newsSlugSchema,
} from "../schemas";

describe("newsSlugSchema", () => {
  it("소문자/숫자/하이픈 허용", () => {
    expect(newsSlugSchema.safeParse("hello-world-2026").success).toBe(true);
  });
  it("대문자/공백 거부", () => {
    expect(newsSlugSchema.safeParse("Hello World").success).toBe(false);
  });
});

describe("newsListQuerySchema", () => {
  it("기본값 = ALL + page 1 + size 12 + published", () => {
    const out = newsListQuerySchema.parse({});
    expect(out.categorySlug).toBe(ALL_CATEGORY_SLUG);
    expect(out.page).toBe(1);
    expect(out.pageSize).toBe(12);
    expect(out.status).toBe("published");
  });
});

describe("newsCreateSchema", () => {
  it("status 기본값 = draft", () => {
    const out = newsCreateSchema.parse({
      title: "테스트",
      slug: "test-post",
      body: "본문",
      categoryId: "00000000-0000-0000-0000-000000000001",
    });
    expect(out.status).toBe("draft");
    expect(out.tagSlugs).toEqual([]);
  });
});
