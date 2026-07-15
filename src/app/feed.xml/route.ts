// 발행 소식 RSS 2.0 피드 (/feed.xml) — 네이버 서치어드바이저 등 피드 제출·구독용. 최신 20건.
// runtime/revalidate 지시어 금지 — cacheComponents 비호환(500). 라우트 핸들러 기본 Node 런타임에서 pg 동작 (api/og·cron route 동일).
import { listPublishedNewsForFeed } from "@/features/news";
import { bodyToExcerpt } from "@/features/news/excerpt";
import { buildNewsRssFeed } from "@/features/news/rss";

const FEED_ITEM_LIMIT = 20;
const FEED_EXCERPT_LEN = 200;

export async function GET(): Promise<Response> {
  const rows = await listPublishedNewsForFeed(FEED_ITEM_LIMIT);
  const xml = buildNewsRssFeed(
    rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: bodyToExcerpt(row.body, FEED_EXCERPT_LEN),
      publishedAt: row.publishedAt,
    })),
  );
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
