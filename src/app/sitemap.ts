// 사이트맵 — 정적(랜딩·소식 목록) + 발행 소식 동적 포함. 검색 노출·색인 유도
import type { MetadataRoute } from "next";

import { listPublishedNewsForSitemap } from "@/features/news";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listPublishedNewsForSitemap();
  const now = new Date();

  const newsRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/news/${a.id}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...newsRoutes,
  ];
}
