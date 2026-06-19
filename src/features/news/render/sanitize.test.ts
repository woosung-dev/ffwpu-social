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

  it("(5) 허용 이미지(S3) + https 링크 + 알 수 없는 노드 drop", () => {
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
      attrs: { src: `${PREFIX}/news/abc/img.jpg`, alt: "ok" },
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

  it("(7) textStyle color 인젝션 차단 + fontSize clamp (color drop, fontSize 64로 cap)", () => {
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
    // 임의 color 는 hex 검증 실패 → drop. fontSize 999px 는 상한 64px 로 clamp(텍스트 크기 손실 방지)
    expect(result!.content![0].content![0].marks).toEqual([
      { type: "textStyle", attrs: { fontSize: "64px" } },
    ]);
  });

  it("(7-1) textStyle fontSize — 범위 내 유지, 범위 밖 clamp, 잘못된 단위 drop, pt→px 변환", () => {
    const result = run({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "ok", marks: [{ type: "textStyle", attrs: { fontSize: "19px" } }] },
            { type: "text", text: "small", marks: [{ type: "textStyle", attrs: { fontSize: "11px" } }] },
            { type: "text", text: "unit", marks: [{ type: "textStyle", attrs: { fontSize: "1.5rem" } }] },
            // docx 는 pt 로 들어옴 — 24pt=32px, 11pt≈15px (반올림)
            { type: "text", text: "pt-title", marks: [{ type: "textStyle", attrs: { fontSize: "24pt" } }] },
            { type: "text", text: "pt-body", marks: [{ type: "textStyle", attrs: { fontSize: "11pt" } }] },
          ],
        },
      ],
    });
    const nodes = result!.content![0].content!;
    expect(nodes[0].marks).toEqual([{ type: "textStyle", attrs: { fontSize: "19px" } }]);
    expect(nodes[1].marks).toEqual([{ type: "textStyle", attrs: { fontSize: "12px" } }]); // 11→min 12 clamp
    expect(nodes[2].marks).toBeUndefined(); // rem 단위 거부
    expect(nodes[3].marks).toEqual([{ type: "textStyle", attrs: { fontSize: "32px" } }]); // 24pt→32px
    expect(nodes[4].marks).toEqual([{ type: "textStyle", attrs: { fontSize: "15px" } }]); // 11pt≈14.67→15px
  });

  it("(7-2) textStyle color — 임의 hex 통과, rgb()→hex 변환, 키워드 거부", () => {
    const result = run({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "hex", marks: [{ type: "textStyle", attrs: { color: "#1A3A5C" } }] },
            { type: "text", text: "rgb", marks: [{ type: "textStyle", attrs: { color: "rgb(200, 64, 43)" } }] },
            { type: "text", text: "short", marks: [{ type: "textStyle", attrs: { color: "#abc" } }] },
            { type: "text", text: "kw", marks: [{ type: "textStyle", attrs: { color: "windowtext" } }] },
          ],
        },
      ],
    });
    const nodes = result!.content![0].content!;
    expect(nodes[0].marks).toEqual([{ type: "textStyle", attrs: { color: "#1a3a5c" } }]); // 임의 hex 통과(소문자화)
    expect(nodes[1].marks).toEqual([{ type: "textStyle", attrs: { color: "#c8402b" } }]); // rgb→hex
    expect(nodes[2].marks).toEqual([{ type: "textStyle", attrs: { color: "#aabbcc" } }]); // #rgb→#rrggbb
    expect(nodes[3].marks).toBeUndefined(); // 키워드 거부
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

  it("(10) image px width/height 보존·clamp + 인라인(문단 안 2장)", () => {
    const result = run({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "image",
              attrs: { src: `${PREFIX}/news/a/1.jpg`, alt: "1", width: 320, height: 200 },
            },
            {
              type: "image",
              attrs: { src: `${PREFIX}/news/a/2.jpg`, alt: "2", width: 99999, height: 0 },
            },
          ],
        },
      ],
    });
    const imgs = result!.content![0].content!;
    expect(imgs).toHaveLength(2); // 한 문단에 인라인 2장
    expect(imgs[0].attrs).toEqual({ src: `${PREFIX}/news/a/1.jpg`, alt: "1", width: 320, height: 200 });
    expect(imgs[1].attrs!.width).toBe(4000); // 99999 → MAX clamp
    expect(imgs[1].attrs!.height).toBeUndefined(); // 0 → 미지정
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
    expect(result!.content![4].attrs).toEqual({ textAlign: "justify" }); // 에디터 정렬 4종과 정합 — justify 보존
  });

  it("(11-1) table 셀 backgroundColor — hex 유지·rgb()→hex 변환·임의값 drop", () => {
    const result = run({
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                { type: "tableHeader", attrs: { backgroundColor: "#FFF3A3" }, content: [] },
                { type: "tableCell", attrs: { backgroundColor: "rgb(205, 236, 207)" }, content: [] },
                { type: "tableCell", attrs: { backgroundColor: "url(x)" }, content: [] },
              ],
            },
          ],
        },
      ],
    });
    const cells = result!.content![0].content![0].content!;
    expect(cells[0].attrs!.backgroundColor).toBe("#fff3a3"); // hex 소문자화
    expect(cells[1].attrs!.backgroundColor).toBe("#cdeccf"); // rgb()→hex
    expect(cells[2].attrs!.backgroundColor).toBeUndefined(); // 임의 CSS drop, colspan/rowspan 만 유지
    expect(cells[2].attrs!.colspan).toBe(1);
  });

  it("(12) 외부 도메인 이미지 drop (인라인 문단 안에서도)", () => {
    const result = run({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "image", attrs: { src: `${PREFIX}/news/a/ok.jpg` } },
            { type: "image", attrs: { src: "https://evil.com/x.jpg" } },
          ],
        },
      ],
    });
    const imgs = result!.content![0].content!;
    expect(imgs).toHaveLength(1); // 외부 이미지만 제거
    expect(imgs[0].attrs!.src).toBe(`${PREFIX}/news/a/ok.jpg`);
  });
});
