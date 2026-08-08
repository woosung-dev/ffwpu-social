import type { NextConfig } from "next";

const config: NextConfig = {
  // ADR-001a — Docker 이미지 ~150MB. AWS 이전 친화.
  output: "standalone",
  images: {
    // 런타임 변환 이탈 — 커버는 업로드 시점에 1200px JPEG 로 정규화하고(image-policy.ts COVER_MAX_EDGE_PX)
    // 여기서는 그 정규화본을 그대로 서빙한다. `<Image>` 는 계속 쓴다 — fill·CLS 방지·lazy 는 그대로 필요하다.
    //
    // 왜 버렸나 (2026-08-08 실측): 변환은 캐시 MISS/STALE 마다 과금되는데, 기본 TTL 4h 라 고유 키 약 290개가
    // 월 17~25회 재변환되어 Hobby 한도 5,000 을 소진했다 → 커버 36장 중 15장이 402(alt 텍스트만 노출).
    // 이 사이트는 어드민 단독 업로드(36장·연 100장 미만)에 Fast Data 도 6/100GB 라
    // 런타임 변환이 값어치를 하는 조건이 하나도 없다. 정규화본 단일 서빙으로 모바일 전송량만 66KB→138KB 늘고
    // 변환·캐시 과금은 0 이 된다.
    //
    // 부수 효과: ADR-004 긴급 내리기(동의 철회)가 R2 객체 삭제만으로 완결된다 — 옛 구조는 Vercel purge 병행 필요였다.
    // 되돌리려면 이 줄만 지우면 된다. 정규화본은 옵티마이저 입력으로도 더 낫다(입력 1.16MB → 138KB).
    unoptimized: true,
    // 아래 minimumCacheTTL·remotePatterns 는 unoptimized 에서 동작하지 않지만 롤백 대비로 존치한다.
    //
    // ADR-049 — Vercel 은 이미지 캐시 MISS/STALE 마다 변환을 청구. Next 16 기본 TTL 4h 로는 같은 커버가 하루 6번 재변환됨.
    // 31일(Vercel 권장 상한) 대신 7일인 이유: seed.ts 커버 키가 `news/seed/<파일명>` 고정이라 실사진 재시드 시 URL 은 그대로 내용만 바뀜 → stale 노출 상한을 1주로 제한.
    minimumCacheTTL: 604800,
    // ADR-050 — 실제 쓰는 호스트만 나열한다. ⚠️ 와일드카드 금지.
    // `*.r2.dev` 는 Cloudflare 전역 네임스페이스라 누구나 무료 버킷을 만들면 자기 pub-<hash>.r2.dev 를 갖는다.
    // /_next/image 는 인증 없는 공개 엔드포인트이므로, 와일드카드면 제3자가 자기 이미지를 우리 변환 쿼터로 태울 수 있다.
    // ⚠️ unoptimized 전환으로 이 화이트리스트는 현재 비활성이다. 임의 호스트 커버 URL 을 막는 것은
    //    news/actions.ts 의 서버측 S3 public prefix 검증뿐이므로 그쪽을 약화시키지 말 것.
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
