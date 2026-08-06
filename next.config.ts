import type { NextConfig } from "next";

const config: NextConfig = {
  // ADR-001a — Docker 이미지 ~150MB. AWS 이전 친화.
  output: "standalone",
  images: {
    // ADR-049 — Vercel 은 이미지 캐시 MISS/STALE 마다 변환을 청구. Next 16 기본 TTL 4h 로는 같은 커버가 하루 6번 재변환됨.
    // 31일(Vercel 권장 상한) 대신 7일인 이유: seed.ts 커버 키가 `news/seed/<파일명>` 고정이라 실사진 재시드 시 URL 은 그대로 내용만 바뀜 → stale 노출 상한을 1주로 제한.
    minimumCacheTTL: 604800,
    remotePatterns: [
      // 로컬 MinIO (ADR-020)
      { protocol: "http", hostname: "localhost", port: "9000" },
      { protocol: "http", hostname: "127.0.0.1", port: "9000" },
      // R2/S3 공개 읽기 도메인 (ADR-001a). r2.cloudflarestorage.com 은 인증 API 엔드포인트라 공개 렌더용 아님.
      // *.r2.dev = R2 버킷 공개 도메인(NEXT_PUBLIC_S3_PUBLIC_URL 기본형). 커스텀 도메인 연결 시 그 호스트 추가 — 미등록은 next/image 차단.
      { protocol: "https", hostname: "*.r2.dev" },
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
