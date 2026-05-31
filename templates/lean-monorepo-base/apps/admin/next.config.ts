// 어드민 앱의 Next.js 16 런타임 설정 - workspace db 패키지 transpile + cacheComponents
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/db"],
  experimental: {
    cacheComponents: true,
  },
  // 어드민은 검색엔진 노출 차단
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default config;
