// 본문 렌더러 회귀 테스트 — 빈 단락(붙여넣기 빈 줄)이 블록 마진 누적 없이 가벼운 spacer 로 렌더되는지 검증
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NewsBodyRenderer } from "./news-body-renderer";

describe("NewsBodyRenderer 빈 단락", () => {
  it("빈 단락은 <br/> 로 렌더 — 문단 마진 0 이므로 빈 줄이 곧 한 줄 간격", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "첫 줄" }] },
        { type: "paragraph" }, // 빈 줄 (Enter 한 번)
        { type: "paragraph", content: [{ type: "text", text: "둘째 줄" }] },
      ],
    };
    const html = renderToStaticMarkup(<NewsBodyRenderer body={doc} />);
    expect(html).toContain("<br");
    expect(html).toContain("첫 줄");
    expect(html).toContain("둘째 줄");
  });

  it("내용 있는 단락에는 불필요한 <br/> 를 넣지 않는다", () => {
    const doc = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "본문" }] }],
    };
    const html = renderToStaticMarkup(<NewsBodyRenderer body={doc} />);
    expect(html).not.toContain("<br");
    expect(html).toContain("본문");
  });
});
