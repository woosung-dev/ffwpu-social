// slug 규칙 — 검증식과 실제 운영 데이터가 어긋나면 "이미 쓰는 형식을 새로 만들 수 없는" 상태가 된다.
// 하이픈만 허용하던 시절 기존 카테고리(rice_sharing 등)를 전부 거부했던 회귀를 여기서 고정한다.
import { describe, expect, it } from "vitest";

import { createCategorySchema } from "./schemas";

const parseSlug = (slug: string) =>
  createCategorySchema.safeParse({ name: "테스트", slug }).success;

describe("카테고리 slug 규칙", () => {
  // seed.ts 가 실제로 넣는 값 — 이 목록이 깨지면 운영 데이터와 검증식이 어긋난 것이다
  it.each(["family_healing", "local_volunteer", "environment", "rice_sharing"])(
    "기존 운영 카테고리 slug 를 허용한다: %s",
    (slug) => {
      expect(parseSlug(slug)).toBe(true);
    },
  );

  it.each(["rice-sharing", "press2026", "a", "a-b_c"])(
    "하이픈·언더바·숫자 조합을 허용한다: %s",
    (slug) => {
      expect(parseSlug(slug)).toBe(true);
    },
  );

  it.each([
    "_leading",
    "trailing_",
    "-leading",
    "trailing-",
    "double__underscore",
    "double--hyphen",
    "UPPER",
    "with space",
    "한글",
    "",
  ])("잘못된 형식은 거부한다: %s", (slug) => {
    expect(parseSlug(slug)).toBe(false);
  });
});
