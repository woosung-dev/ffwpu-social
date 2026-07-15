// 사이트맵 — 정적(랜딩·소식·공지 목록) + 발행 소식·공지 상세 동적 포함. 검색 노출·색인 유도
import type { MetadataRoute } from "next";

import { listPublishedNewsForSitemap } from "@/features/news";
import { listPublishedNoticesForSitemap } from "@/features/notices";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, notices] = await Promise.all([
    listPublishedNewsForSitemap(),
    listPublishedNoticesForSitemap(),
  ]);
  const now = new Date();

  // 목록 lastmod = 해당 목록 최신 콘텐츠 updatedAt(없으면 now). 매 요청 now() 로 흔들리지 않게 —
  // 구글은 lastmod 만 신호로 쓰고 정확성을 검증하므로, 변동 없는 목록의 lastmod 이 매번 바뀌면 신뢰를 잃음
  const latestOf = (rows: { updatedAt: Date }[]): Date =>
    rows.reduce((max, r) => (r.updatedAt > max ? r.updatedAt : max), rows[0]?.updatedAt ?? now);

  const newsRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/news/${a.id}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const noticeRoutes: MetadataRoute.Sitemap = notices.map((n) => ({
    url: `${SITE_URL}/notices/${n.id}`,
    lastModified: n.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    { url: SITE_URL, lastModified: latestOf(articles), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/news`, lastModified: latestOf(articles), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/notices`, lastModified: latestOf(notices), changeFrequency: "daily", priority: 0.6 },
    ...newsRoutes,
    ...noticeRoutes,
  ];
}
