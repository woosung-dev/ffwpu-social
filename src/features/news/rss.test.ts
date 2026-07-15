// buildNewsRssFeed 단위 테스트 — XML 이스케이프·CDATA 방어·pubDate(RFC-822)·item 링크. 순수 문자열 빌더
import { describe, expect, it } from "vitest";

import { SITE_NAME, SITE_URL } from "@/lib/site";
import { buildNewsRssFeed, type FeedItem } from "./rss";

const baseItem: FeedItem = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "쌀 나눔 소식",
  description: "따뜻한 변화 이야기",
  publishedAt: new Date("2026-07-06T03:00:00.000Z"),
};

describe("buildNewsRssFeed", () => {
  it("채널 title·link·description 을 포함한다", () => {
    const xml = buildNewsRssFeed([]);
    expect(xml).toContain(`<title>${SITE_NAME}</title>`);
    expect(xml).toContain(`<link>${SITE_URL}</link>`);
    expect(xml).toContain("<description>");
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });

  it("item link 는 SITE_URL/news/{id} 형식이고 개수만큼 렌더된다", () => {
    const xml = buildNewsRssFeed([baseItem, { ...baseItem, id: "22222222-2222-2222-2222-222222222222" }]);
    expect(xml).toContain(`<link>${SITE_URL}/news/${baseItem.id}</link>`);
    expect(xml).toContain(`<guid isPermaLink="true">${SITE_URL}/news/${baseItem.id}</guid>`);
    expect(xml.match(/<item>/g)).toHaveLength(2);
  });

  it("제목의 XML 특수문자를 이스케이프한다 (미이스케이프 시 무효 XML)", () => {
    const xml = buildNewsRssFeed([{ ...baseItem, title: 'A & B <c> "d"' }]);
    expect(xml).toContain("A &amp; B &lt;c&gt; &quot;d&quot;");
    expect(xml).not.toContain("<c>");
  });

  it("본문 발췌를 CDATA 로 감싸고 종료 시퀀스 ]]> 를 방어한다", () => {
    const xml = buildNewsRssFeed([{ ...baseItem, description: "a]]>b" }]);
    expect(xml).toContain("<description><![CDATA[");
    // 원문의 ]]> 가 분할되어 CDATA 를 조기 종료하지 않음
    expect(xml).toContain("a]]]]><![CDATA[>b");
  });

  it("publishedAt 이 있으면 pubDate(RFC-822 UTC), 없으면 pubDate 미출력", () => {
    const withDate = buildNewsRssFeed([baseItem]);
    expect(withDate).toContain(`<pubDate>${baseItem.publishedAt!.toUTCString()}</pubDate>`);
    expect(withDate).toContain("06 Jul 2026");

    const withoutDate = buildNewsRssFeed([{ ...baseItem, publishedAt: null }]);
    expect(withoutDate).not.toContain("<pubDate>");
  });
});
