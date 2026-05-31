// 공개 사이트 Next.js 16 설정 — cacheComponents + transpilePackages 로 @repo/db source export 허용
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 stable: PPR + Cache Components 통합 키
  cacheComponents: true,
  // packages/db 가 source 직접 export 이므로 양 앱이 transpile 해야 함
  transpilePackages: ["@repo/db"],
  experimental: {
    // Server Actions 본문 제한 (이미지 업로드는 Route Handler 로 분리)
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
