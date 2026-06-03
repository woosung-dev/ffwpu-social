import type { NextConfig } from "next";

const config: NextConfig = {
  // ADR-001a — Docker 이미지 ~150MB. AWS 이전 친화.
  output: "standalone",
  images: {
    remotePatterns: [
      // 로컬 MinIO (ADR-020)
      { protocol: "http", hostname: "localhost", port: "9000" },
      { protocol: "http", hostname: "127.0.0.1", port: "9000" },
      // 추후 R2/S3 도메인 추가 (ADR-001a)
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
    ],
    // Next.js 16 SSRF 가드 — 이미지 옵티마이저가 localhost 원격 URL 을 기본 400 차단 (v16 breaking change).
    // 로컬 MinIO(:9000) 커버 렌더용으로 dev 한정 허용. 프로덕션(R2/S3 https)은 가드 유지.
    ...(process.env.NODE_ENV === "development"
      ? { dangerouslyAllowLocalIP: true }
      : {}),
  },
  // Next.js 16 stable cache components — "use cache" + cacheLife/cacheTag 사용 가능
  cacheComponents: true,
};

export default config;
