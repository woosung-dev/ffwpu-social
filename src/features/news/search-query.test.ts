// likePattern — LIKE 메타문자 이스케이프·한글 통과 검증 (순수 함수)
import { describe, expect, it } from "vitest";

import { likePattern } from "./search-query";

describe("likePattern", () => {
  it("양끝을 % 로 감싼 부분일치 패턴을 만든다", () => {
    expect(likePattern("쌀")).toBe("%쌀%");
  });

  it("LIKE 와일드카드 % 와 _ 를 이스케이프한다", () => {
    expect(likePattern("100%")).toBe("%100\\%%");
    expect(likePattern("a_b")).toBe("%a\\_b%");
  });

  it("백슬래시를 이스케이프한다", () => {
    expect(likePattern("a\\b")).toBe("%a\\\\b%");
  });

  it("한글·공백은 그대로 통과한다", () => {
    expect(likePattern("가족 치유")).toBe("%가족 치유%");
  });
});
