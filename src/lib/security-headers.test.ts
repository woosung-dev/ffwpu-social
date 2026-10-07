// 보안 헤더·CSP 빌더 — dev/prod 분기와 env origin 파생 검증 (ADR-067)
import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, buildSecurityHeaders } from "./security-headers";

function directive(csp: string, name: string): string | undefined {
  return csp.split("; ").find((d) => d.startsWith(`${name} `));
}

describe("buildContentSecurityPolicy", () => {
  const prodEnv = {
    isDev: false,
    s3PublicUrl: "https://pub-abc.r2.dev/ffwpu-social",
    s3Endpoint: "https://acc.r2.cloudflarestorage.com",
  };

  it("S3 URL 에서 경로를 뺀 origin 만 허용한다", () => {
    const csp = buildContentSecurityPolicy(prodEnv);
    expect(directive(csp, "img-src")).toContain("https://pub-abc.r2.dev");
    expect(directive(csp, "img-src")).not.toContain("/ffwpu-social");
    expect(directive(csp, "connect-src")).toContain("https://acc.r2.cloudflarestorage.com");
  });

  it("prod 는 eval·HMR 웹소켓을 허용하지 않는다", () => {
    const csp = buildContentSecurityPolicy(prodEnv);
    expect(csp).not.toContain("'unsafe-eval'");
    expect(directive(csp, "connect-src")).not.toContain("ws:");
  });

  it("dev 는 eval·HMR 웹소켓을 허용한다", () => {
    const csp = buildContentSecurityPolicy({ ...prodEnv, isDev: true });
    expect(directive(csp, "script-src")).toContain("'unsafe-eval'");
    expect(directive(csp, "connect-src")).toContain("ws:");
  });

  it("S3 env 가 없거나 잘못돼도 빈 토큰 없이 생성된다", () => {
    const csp = buildContentSecurityPolicy({ isDev: false, s3PublicUrl: "not a url" });
    expect(csp).not.toContain("  ");
    expect(csp).not.toContain("null");
    expect(directive(csp, "img-src")).toBe(
      "img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
    );
  });

  it("프레임 삽입·플러그인·base 변조를 막는다", () => {
    const csp = buildContentSecurityPolicy(prodEnv);
    expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(csp, "object-src")).toBe("object-src 'none'");
    expect(directive(csp, "base-uri")).toBe("base-uri 'self'");
  });
});

describe("buildSecurityHeaders", () => {
  it("기본 보안 헤더 6종을 모두 반환한다", () => {
    const keys = buildSecurityHeaders({ isDev: false }).map((h) => h.key);
    expect(keys).toEqual([
      "Content-Security-Policy",
      "X-Frame-Options",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Strict-Transport-Security",
    ]);
  });
});
