// 전역 보안 응답 헤더 + 정적 CSP (ADR-067). next.config.ts headers() 가 빌드 시 1회 평가한다.
// nonce 미사용 — nonce 는 요청마다 달라 모든 페이지를 동적 렌더로 강제하므로 cacheComponents/PPR 와 충돌.
// 그래서 script-src 는 'unsafe-inline' 을 허용하고, XSS 1차 방어는 본문 sanitize(news/render) 가 맡는다.
// 외부 origin 을 추가할 때는 e2e 의 CSP 위반 수집(e2e/fixtures.ts)으로 실제 차단 여부를 확인할 것.

export type SecurityHeadersEnv = {
  isDev: boolean;
  // 공개 읽기 버킷 URL (NEXT_PUBLIC_S3_PUBLIC_URL) — 커버·본문 이미지 img-src
  s3PublicUrl?: string;
  // S3 API 엔드포인트 (S3_ENDPOINT) — 어드민 presigned PUT 업로드 connect-src
  s3Endpoint?: string;
};

// GA4 (@next/third-parties/google) — gtag 로더 + 수집 엔드포인트
const GA_SCRIPT = "https://www.googletagmanager.com";
const GA_COLLECT = ["https://*.google-analytics.com", "https://*.analytics.google.com"];

// URL → origin. 미설정·형식 오류면 생략 (빌드는 계속, 해당 기능만 차단됨)
function toOrigin(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function buildContentSecurityPolicy(env: SecurityHeadersEnv): string {
  const s3Public = toOrigin(env.s3PublicUrl);
  const s3Api = toOrigin(env.s3Endpoint);

  const directives: Record<string, Array<string | null>> = {
    "default-src": ["'self'"],
    // dev: React 디버깅이 eval 사용
    "script-src": ["'self'", "'unsafe-inline'", env.isDev ? "'unsafe-eval'" : null, GA_SCRIPT],
    // 에디터 글꼴(ADR-059) — Google Fonts CSS·폰트 파일
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    // blob: = 커버 업로드 미리보기
    "img-src": ["'self'", "data:", "blob:", s3Public, GA_SCRIPT, ...GA_COLLECT],
    // dev: HMR 웹소켓
    "connect-src": ["'self'", s3Api, GA_SCRIPT, ...GA_COLLECT, env.isDev ? "ws:" : null],
    // 본문 유튜브 임베드 (news-body-renderer · 어드민 에디터 모두 nocookie)
    "frame-src": ["https://www.youtube-nocookie.com"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  // upgrade-insecure-requests 미사용 — 로컬 prod 검증(MinIO http)의 이미지를 깨고, 배포 origin 은 전부 https 다
  return Object.entries(directives)
    .map(([name, sources]) =>
      [name, ...sources.filter((s): s is string => s !== null)].join(" "),
    )
    .join("; ");
}

export function buildSecurityHeaders(
  env: SecurityHeadersEnv,
): Array<{ key: string; value: string }> {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(env) },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    // preload 미포함 — 브라우저 내장 목록 등재는 되돌리기 어렵다 (ADR-067)
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ];
}
