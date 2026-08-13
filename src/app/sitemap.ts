// 사이트맵 — 정적(랜딩·소식·언론 목록) + 발행 글 동적 포함. 검색 노출·색인 유도
import type { MetadataRoute } from "next";

import { listPublishedNewsForSitemap } from "@/features/news";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [storyArticles, pressArticles] = await Promise.all([
    listPublishedNewsForSitemap("story"),
    listPublishedNewsForSitemap("press"),
  ]);
  const now = new Date();

  const newsRoutes: MetadataRoute.Sitemap = storyArticles.map((a) => ({
    url: `${SITE_URL}/news/${a.id}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // 언론 보도는 외부 원문이 정본이라 자기 페이지 색인 우선순위를 소식보다 낮춘다
  const pressRoutes: MetadataRoute.Sitemap = pressArticles.map((a) => ({
    url: `${SITE_URL}/press/${a.id}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/press`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...newsRoutes,
    ...pressRoutes,
  ];
}
