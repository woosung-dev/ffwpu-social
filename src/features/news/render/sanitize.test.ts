// NewsBodyRenderer 안전 정화 단위 테스트 — codex P1#3 + 에디터 업그레이드(값 화이트리스트/XSS).
import { describe, expect, it } from "vitest";
import { sanitizeTiptapJson } from "./sanitize";

const PREFIX = "http://localhost:9000/ffwpu-social";
const allowImage = (url: string) => url.startsWith(`${PREFIX}/`);
const run = (input: unknown) =>
  sanitizeTiptapJson(input, { isAllowedImageSrc: allowImage });

describe("sanitizeTiptapJson — 기본 안전성", () => {
  it("(1) javascript: link 마크 제거 (text 는 유지)", () => {
    const result = run({
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
    });
    const text = result!.content![0].content![0];
    expect(text.text).toBe("click me");
    expect(text.marks).toBeUndefined();
  });

  it("(2) data: image src 노드 차단", () => {
    const result = run({
      type: "doc",
      content: [{ type: "image", attrs: { src: "data:image/png;base64,iVBOR=" } }],
    });
    expect(result!.content).toEqual([]);
  });

  it("(3) 외부 도메인 이미지 차단 (S3 prefix 미매칭)", () => {
    const result = run({
      type: "doc",
      content: [{ type: "image", attrs: { src: "https://evil.example.com/foo.png" } }],
    });
    expect(result!.content).toEqual([]);
  });

  it("(4) 정상 paragraph + bold + italic 마크 유지", () => {
    const result = run({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "hello", marks: [{ type: "bold" }, { type: "italic" }] },
          ],
        },
      ],
    });
    const text = result!.content![0].content![0];
    expect((text.marks ?? []).map((m) => m.type).sort()).toEqual(["bold", "italic"]);
  });

  it("(5) 허용 이미지(S3, 기본 align/width 부여) + https 링크 + 알 수 없는 노드 drop", () => {
    const result = run({
      type: "doc",
      content: [
        { type: "image", attrs: { src: `${PREFIX}/news/abc/img.jpg`, alt: "ok" } },
        { type: "evilNode", content: [{ type: "text", text: "gone" }] },
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
    });
    expect(result!.content).toHaveLength(2);
    expect(result!.content![0]).toEqual({
      type: "image",
      attrs: { src: `${PREFIX}/news/abc/img.jpg`, alt: "ok", align: "center", width: 100 },
    });
  });
});

describe("sanitizeTiptapJson — 서식 마크 화이트리스트", () => {
  it("(6) underline·highlight(팔레트)·textStyle(허용 색/크기) 유지", () => {
    const result = run({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "x",
              marks: [
                { type: "underline" },
                { type: "highlight", attrs: { color: "#fff3a3" } },
                { type: "textStyle", attrs: { color: "#7b2ac7", fontSize: "22px" } },
              ],
            },
          ],
        },
      ],
    });
    const marks = result!.content![0].content![0].marks!;
    expect(marks).toContainEqual({ type: "underline" });
    expect(marks).toContainEqual({ type: "highlight", attrs: { color: "#fff3a3" } });
    expect(marks).toContainEqual({
      type: "textStyle",
      attrs: { color: "#7b2ac7", fontSize: "22px" },
    });
  });

  it("(7) textStyle 임의 color/fontSize 는 drop (style 인젝션 차단)", () => {
    const result = run({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "x",
              marks: [
                {
                  type: "textStyle",
                  attrs: { color: "red;background:url(javascript:alert(1))", fontSize: "999px" },
                },
              ],
            },
          ],
        },
      ],
    });
    // 허용값 없음 → textStyle 마크 전체 제거
    expect(result!.content![0].content![0].marks).toBeUndefined();
  });

  it("(8) highlight 임의 색은 기본 형광으로 강등(색 attr 제거)", () => {
    const result = run({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "x", marks: [{ type: "highlight", attrs: { color: "#000000" } }] },
          ],
        },
      ],
    });
    expect(result!.content![0].content![0].marks).toEqual([{ type: "highlight" }]);
  });
});

describe("sanitizeTiptapJson — 신규 노드", () => {
  it("(9) youtube — 유효 URL은 id-only 저장, 임의 src는 drop", () => {
    const result = run({
      type: "doc",
      content: [
        { type: "youtube", attrs: { src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" } },
        { type: "youtube", attrs: { src: "https://evil.com/x" } },
      ],
    });
    expect(result!.content).toHaveLength(1);
    expect(result!.content![0]).toEqual({
      type: "youtube",
      attrs: { videoId: "dQw4w9WgXcQ" },
    });
  });

  it("(10) image align/width clamp + caption 300자 + 실제치수", () => {
    const result = run({
      type: "doc",
      content: [
        {
          type: "image",
          attrs: {
            src: `${PREFIX}/news/a/i.jpg`,
            alt: "a",
            align: "evil",
            width: 9999,
            caption: "x".repeat(400),
            naturalWidth: 556,
            naturalHeight: 830,
          },
        },
      ],
    });
    const img = result!.content![0];
    expect(img.attrs!.align).toBe("center"); // 임의값 → center
    expect(img.attrs!.width).toBe(100); // 9999 → 최근접 100
    expect((img.attrs!.caption as string).length).toBe(300);
    expect(img.attrs!.naturalWidth).toBe(556);
    expect(img.attrs!.naturalHeight).toBe(830);
  });

  it("(11) blockquote·hr·table(colspan clamp) + 정렬 enum", () => {
    const result = run({
      type: "doc",
      content: [
        { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "q" }] }] },
        { type: "horizontalRule" },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                { type: "tableHeader", attrs: { colspan: 99, rowspan: 1 }, content: [] },
              ],
            },
          ],
        },
        { type: "paragraph", attrs: { textAlign: "center" }, content: [{ type: "text", text: "c" }] },
        { type: "paragraph", attrs: { textAlign: "justify" }, content: [{ type: "text", text: "j" }] },
      ],
    });
    expect(result!.content![0].type).toBe("blockquote");
    expect(result!.content![1]).toEqual({ type: "horizontalRule" });
    const th = result!.content![2].content![0].content![0];
    expect(th.attrs!.colspan).toBe(10); // 99 → max 10
    expect(result!.content![3].attrs).toEqual({ textAlign: "center" });
    expect(result!.content![4].attrs).toBeUndefined(); // justify 미허용 → attrs 없음
  });
});
