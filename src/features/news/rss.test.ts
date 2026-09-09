import { describe, expect, it } from "vitest";
import { buildNewsRssFeed } from "./rss";

const AT = new Date("2026-09-01T03:00:00Z");

describe("buildNewsRssFeed", () => {
  it("채널 헤더 + item 링크·guid 를 /news/{id} 로 만든다", () => {
    const xml = buildNewsRssFeed([{ id: "abc", title: "쌀 나눔", description: "요약", publishedAt: AT }]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain("<rss version=\"2.0\">");
    expect(xml).toContain("<link>http://localhost:3100/news/abc</link>");
    expect(xml).toContain('<guid isPermaLink="true">http://localhost:3100/news/abc</guid>');
  });

  it("제목의 & < > 는 이스케이프한다", () => {
    const xml = buildNewsRssFeed([{ id: "1", title: "A & B <C>", description: "", publishedAt: AT }]);
    expect(xml).toContain("<title>A &amp; B &lt;C&gt;</title>");
  });

  it("발췌는 CDATA 로 감싸고 ]]> 는 분할한다", () => {
    const xml = buildNewsRssFeed([{ id: "1", title: "t", description: "x ]]> y", publishedAt: AT }]);
    expect(xml).toContain("<description><![CDATA[x ]]]]><![CDATA[> y]]></description>");
  });

  it("pubDate 는 RFC-822 (toUTCString) 형식", () => {
    const xml = buildNewsRssFeed([{ id: "1", title: "t", description: "", publishedAt: AT }]);
    expect(xml).toContain("<pubDate>Tue, 01 Sep 2026 03:00:00 GMT</pubDate>");
  });

  it("publishedAt 이 없으면 pubDate 를 생략한다", () => {
    const xml = buildNewsRssFeed([{ id: "1", title: "t", description: "", publishedAt: null }]);
    expect(xml).not.toContain("<pubDate>");
  });
});
