// NewsBodyRenderer 안전 정화 단위 테스트 — codex P1#3. 5 시나리오 (결정 로그 [T12])
import { describe, expect, it } from "vitest";
import { sanitizeTiptapJson } from "./sanitize";

const PREFIX = "http://localhost:9000/ffwpu-social";
const allowImage = (url: string) => url.startsWith(`${PREFIX}/`);

describe("sanitizeTiptapJson", () => {
  it("(1) javascript: link 마크 제거 (text 는 유지)", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "click me",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
      ],
    };
    const result = sanitizeTiptapJson(input, { isAllowedImageSrc: allowImage });
    expect(result).not.toBeNull();
    const text = result!.content![0].content![0];
    expect(text.type).toBe("text");
    expect(text.text).toBe("click me");
    expect(text.marks).toBeUndefined();
  });

  it("(2) data: image src 노드 차단", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "image",
          attrs: { src: "data:image/png;base64,iVBORw0KGgoAAAANSU=" },
        },
      ],
    };
    const result = sanitizeTiptapJson(input, { isAllowedImageSrc: allowImage });
    expect(result!.content).toEqual([]);
  });

  it("(3) 외부 도메인 이미지 차단 (S3 prefix 미매칭)", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "image",
          attrs: { src: "https://evil.example.com/foo.png" },
        },
      ],
    };
    const result = sanitizeTiptapJson(input, { isAllowedImageSrc: allowImage });
    expect(result!.content).toEqual([]);
  });

  it("(4) 정상 paragraph + bold + italic 마크 유지", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "hello world",
              marks: [{ type: "bold" }, { type: "italic" }],
            },
          ],
        },
      ],
    };
    const result = sanitizeTiptapJson(input, { isAllowedImageSrc: allowImage });
    const text = result!.content![0].content![0];
    expect(text.text).toBe("hello world");
    const markTypes = (text.marks ?? []).map((m) => m.type).sort();
    expect(markTypes).toEqual(["bold", "italic"]);
  });

  it("(5) 허용 이미지(S3) + https 링크 유지 + 알 수 없는 노드 drop", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "image",
          attrs: { src: `${PREFIX}/news/abc/img.jpg`, alt: "ok" },
        },
        {
          type: "evilNode", // 알 수 없는 노드 — drop
          content: [{ type: "text", text: "should be gone" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "link",
              marks: [{ type: "link", attrs: { href: "https://example.com" } }],
            },
          ],
        },
      ],
    };
    const result = sanitizeTiptapJson(input, { isAllowedImageSrc: allowImage });
    expect(result!.content).toHaveLength(2);
    expect(result!.content![0]).toEqual({
      type: "image",
      attrs: { src: `${PREFIX}/news/abc/img.jpg`, alt: "ok" },
    });
    const text = result!.content![1].content![0];
    expect(text.marks).toEqual([
      { type: "link", attrs: { href: "https://example.com" } },
    ]);
  });
});
