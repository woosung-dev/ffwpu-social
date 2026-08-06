import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

// 이미지 옵티마이저 허용 원격 패턴 — NEXT_PUBLIC_S3_PUBLIC_URL 단일 출처에서 파생.
// src/lib/s3.ts getPublicUrl() 이 만드는 URL 과 같은 값이라 드리프트 불가.
// 프로토콜·포트까지 파생하므로 로컬 MinIO(http://localhost:9000)와 prod R2(https://pub-*.r2.dev)를
// 분기 없이 같은 코드로 덮는다.
function publicImagePattern(): RemotePattern | null {
  const raw = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const protocol = url.protocol.replace(/:$/, "");
    if (protocol !== "http" && protocol !== "https") return null;
    return {
      protocol,
      hostname: url.hostname,
      // 미지정은 "모든 포트 허용" — r2.dev(443 암묵)는 port 가 빈 문자열이라 생략한다.
      ...(url.port ? { port: url.port } : {}),
    };
  } catch {
    return null;
  }
}

const isDev = process.env.NODE_ENV === "development";
const remotePattern = publicImagePattern();

// fail-loud — 프로덕션 빌드에서 패턴을 못 만들면 remotePatterns 가 비어 전 커버가 400 이 된다.
// 조용한 이미지 전멸보다 빌드 실패가 낫다.
if (!isDev && !remotePattern) {
  throw new Error(
    "NEXT_PUBLIC_S3_PUBLIC_URL 미설정/파싱 실패 — images.remotePatterns 를 만들 수 없습니다. (docs/deploy-env-checklist.md)",
  );
}

const config: NextConfig = {
  // ADR-001a — Docker 이미지 ~150MB. AWS 이전 친화.
  output: "standalone",
  images: {
    // ── 원격 허용 호스트 (ADR-050) ──
    // ⚠️ 와일드카드 금지. `*.r2.dev` 는 Cloudflare 전역 네임스페이스라 누구나 무료 R2 버킷을 만들면
    //    자기 pub-<hash>.r2.dev 를 갖는다. /_next/image 는 인증 없는 공개 엔드포인트이므로
    //    제3자가 자기 이미지를 우리 변환 쿼터로 태울 수 있다.
    //    실측(2026-07-27): 제3자 r2.dev → 502, 제3자 s3 → 404 (둘 다 화이트리스트 통과 후 업스트림 fetch 시도).
    //                      화이트리스트 밖 호스트 → 400 (fetch 전 차단, 과금 0).
    remotePatterns: remotePattern ? [remotePattern] : [],

    // ADR-049 — Vercel 은 이미지 캐시 MISS/STALE 마다 변환을 청구. Next 16 기본 TTL 4h 로는 같은 커버가 하루 6번 재변환됨.
    // 31일(Vercel 권장 상한) 대신 7일인 이유: seed.ts 커버 키가 `news/seed/<파일명>` 고정이라 실사진 재시드 시 URL 은 그대로 내용만 바뀜 → stale 노출 상한을 1주로 제한.
    // ⚠️ 긴급 내리기(동의 철회 등, ADR-004)는 R2 객체 삭제만으로 부족하다 — Vercel 대시보드 purge 병행 (docs/TODO.md 운영 절차).
    minimumCacheTTL: 604800,

    // srcset 후보 폭 (ADR-050). 원본은 클라 리사이즈로 긴 변 2560px 상한(storage/image-resize.ts)이고,
    // 실제 렌더 슬롯의 최대 필요 물리폭은 ~1470px.
    //   3840 → 업스케일 금지(withoutEnlargement)라 2560 을 돌려준다. 화질 이득 0, 변환만 소비.
    //   2048 → 어떤 실제 슬롯도 요구하지 않음 (최대 소비처 ArticleCard 1024@2 의 실슬롯은 290 CSS).
    //   256  → DPR1 태블릿 전용 구간이라 실사용 없음.
    //   750·1080 은 유지 — 국내 주력 폰(375@2=750, 360@3=1080)이 정확히 착지하는 폭이라
    //   지우면 한 칸 위로 점프해 첫 방문 바이트가 늘어난다.
    // deviceSizes[0]=640 고정 — Next getWidths() 가 임계값을 deviceSizes[0]×min(vw%) 로 계산한다.
    //   이 값을 바꾸면 MediaCard/FeaturedStoryCard/ArticleCard 의 후보 집합이 통째로 흔들린다.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [384],

    // 아래 둘은 Next 16.2.6 기본값과 동일 = 절감 0. 회귀 펜스로만 명시한다 (ADR-050).
    // ⚠️ formats 에 'image/avif' 를 추가하지 말 것 — Accept 캐시 버킷이 2→3 이 되어 변환이 +50%.
    formats: ["image/webp"],
    // ⚠️ quality 값을 바꾸지 말 것 — q 는 캐시 키의 일부라 전 이미지가 1회성 전량 재변환된다.
    qualities: [75],

    // Next.js 16 SSRF 가드 — 이미지 옵티마이저가 localhost 원격 URL 을 기본 400 차단 (v16 breaking change).
    // 로컬 MinIO(:9000) 커버 렌더용으로 dev 한정 허용. 프로덕션(R2 https)은 가드 유지.
    ...(isDev ? { dangerouslyAllowLocalIP: true } : {}),
  },
  // Next.js 16 stable cache components — "use cache" + cacheLife/cacheTag 사용 가능
  cacheComponents: true,
};

export default config;
