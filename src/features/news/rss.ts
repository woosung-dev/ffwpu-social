// 발행 소식 RSS 2.0 피드 문자열 빌더 — 순수(DB·파일 I/O 없음). XML 이스케이프·CDATA·RFC-822 pubDate. route(feed.xml) 에서 소비
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export type FeedItem = {
  id: string;
  title: string;
  description: string;
  publishedAt: Date | null;
};

// XML 특수문자 이스케이프 — 텍스트 노드(제목)용. 미이스케이프 & · < 하나가 피드 전체를 무효 XML 로 만듦
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// 본문 발췌는 CDATA 로 감싸 원문 그대로 전달. 발췌에 종료 시퀀스 ]]> 가 섞여도 CDATA 를 깨지 않도록 분할
function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export function buildNewsRssFeed(items: FeedItem[]): string {
  const itemsXml = items
    .map((item) => {
      const link = `${SITE_URL}/news/${item.id}`;
      const parts = [
        `<title>${escapeXml(item.title)}</title>`,
        `<link>${link}</link>`,
        `<guid isPermaLink="true">${link}</guid>`,
        item.publishedAt ? `<pubDate>${item.publishedAt.toUTCString()}</pubDate>` : "",
        `<description>${cdata(item.description)}</description>`,
      ].filter(Boolean);
      return `    <item>\n      ${parts.join("\n      ")}\n    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko</language>
${itemsXml}
  </channel>
</rss>`;
}
