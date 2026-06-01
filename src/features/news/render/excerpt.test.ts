// extractExcerpt 단위 테스트 — 히어로 발췌. null/빈 본문, 길이 제한, 멀티바이트 경계 (Slice3 C-1)
import { describe, expect, it } from "vitest";

import { extractExcerpt } from "./excerpt";

describe("extractExcerpt", () => {
  it("null body → 빈 문자열", () => {
    expect(extractExcerpt(null)).toBe("");
  });

  it("빈 doc → 빈 문자열", () => {
    expect(extractExcerpt({ type: "doc", content: [] })).toBe("");
  });

  it("text 노드 수집 + 공백 정규화", () => {
    const body = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "밥이" },
            { type: "text", text: " 사랑입니다" },
          ],
        },
      ],
    };
    expect(extractExcerpt(body)).toBe("밥이 사랑입니다");
  });

  it("100자 이하 → 그대로 (말줄임표 없음)", () => {
    const text = "가".repeat(50);
    const body = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    };
    const result = extractExcerpt(body);
    expect(result).toBe(text);
    expect(result.endsWith("…")).toBe(false);
  });

  it("100자 초과(한국어 멀티바이트) → 100자 slice + 말줄임표", () => {
    const text = "가".repeat(150);
    const body = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    };
    const result = extractExcerpt(body);
    expect(result.endsWith("…")).toBe(true);
    // 100 코드유닛 + '…' = 101
    expect(result.length).toBe(101);
  });

  it("중첩 content 재귀 수집", () => {
    const body = {
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "첫째" }] },
              ],
            },
          ],
        },
      ],
    };
    expect(extractExcerpt(body)).toBe("첫째");
  });
});
