import type { NextConfig } from "next";

const config: NextConfig = {
  // ADR-001a — Docker 이미지 ~150MB. AWS 이전 친화.
  output: "standalone",
  images: {
    // ADR-049 — Vercel 은 이미지 캐시 MISS/STALE 마다 변환을 청구. Next 16 기본 TTL 4h 로는 같은 커버가 하루 6번 재변환됨.
    // 31일(Vercel 권장 상한) 대신 7일인 이유: seed.ts 커버 키가 `news/seed/<파일명>` 고정이라 실사진 재시드 시 URL 은 그대로 내용만 바뀜 → stale 노출 상한을 1주로 제한.
    // ⚠️ 긴급 내리기(동의 철회 등, ADR-004)는 R2 객체 삭제만으로 부족하다 — Vercel 대시보드 purge 병행 (docs/TODO.md 운영 절차).
    minimumCacheTTL: 604800,
    // ADR-050 — 실제 쓰는 호스트만 나열한다. ⚠️ 와일드카드 금지.
    // `*.r2.dev` 는 Cloudflare 전역 네임스페이스라 누구나 무료 버킷을 만들면 자기 pub-<hash>.r2.dev 를 갖는다.
    // /_next/image 는 인증 없는 공개 엔드포인트이므로, 와일드카드면 제3자가 자기 이미지를 우리 변환 쿼터로 태울 수 있다.
    // R2 공개 도메인을 바꿀 때는 이 목록에 **추가**할 것 — 기존 줄을 지우면 DB 에 절대 URL 로 저장된 옛 커버가 400 이 된다.
    remotePatterns: [
      // prod R2 공개 버킷 (= NEXT_PUBLIC_S3_PUBLIC_URL 호스트)
      {
        protocol: "https",
        hostname: "pub-61bc436ad01840e8b530b0e897ced05b.r2.dev",
      },
      // 로컬 MinIO (ADR-020). dev 전용 — 프로덕션은 아래 SSRF 가드가 localhost 를 차단한다.
      { protocol: "http", hostname: "localhost", port: "9000" },
      { protocol: "http", hostname: "127.0.0.1", port: "9000" },
    ],
    // Next.js 16 SSRF 가드 — 이미지 옵티마이저가 localhost 원격 URL 을 기본 400 차단 (v16 breaking change).
    // 로컬 MinIO(:9000) 커버 렌더용으로 dev 한정 허용. 프로덕션(R2 https)은 가드 유지.
    ...(process.env.NODE_ENV === "development"
      ? { dangerouslyAllowLocalIP: true }
      : {}),
  },
  // Next.js 16 stable cache components — "use cache" + cacheLife/cacheTag 사용 가능
  cacheComponents: true,
};

export default config;
