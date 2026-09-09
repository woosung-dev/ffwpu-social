// 검색엔진 크롤링 규칙 — 공개 인덱싱 허용, 어드민 차단 + sitemap 위치 안내.
// AI 크롤러(학습·AI검색 색인·실시간 fetch)는 전부 명시 허용(ADR-065) — 비영리 홍보 사이트라 인용·노출이 목적.
import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// 용도별 대표 UA. 명단은 각사 크롤러 문서 기준으로 분기마다 재확인
const AI_CRAWLERS = [
  // 학습
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "CCBot",
  "Applebot-Extended",
  // AI 검색 색인
  "OAI-SearchBot",
  "Claude-SearchBot",
  "PerplexityBot",
  // 실시간 fetch
  "ChatGPT-User",
  "Claude-User",
  "Perplexity-User",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin" },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: "/admin" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
