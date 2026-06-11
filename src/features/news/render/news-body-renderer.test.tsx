// 본문 렌더러 회귀 테스트 — 빈 단락(여러 줄바꿈)이 공개 렌더에서 한 줄 높이를 유지하는지 검증
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NewsBodyRenderer } from "./news-body-renderer";

describe("NewsBodyRenderer 빈 단락", () => {
  it("빈 단락은 <br/> 로 렌더되어 줄 높이가 유지된다", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "첫 줄" }] },
        { type: "paragraph" }, // 빈 줄 (Enter 한 번)
        { type: "paragraph", content: [{ type: "text", text: "둘째 줄" }] },
      ],
    };
    const html = renderToStaticMarkup(<NewsBodyRenderer body={doc} />);
    // 빈 단락 = <p><br/></p> (0px 뭉개짐 방지), 내용 단락은 텍스트 포함
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
