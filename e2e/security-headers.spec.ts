// 보안 헤더 (ADR-067) — 공개·어드민 대표 경로에 6종 헤더가 실제로 붙는지
import { expect, test } from "./fixtures";

const PATHS = ["/", "/news", "/notices", "/admin/login"];

for (const path of PATHS) {
  test(`보안 헤더 6종 — ${path}`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status()).toBeLessThan(400);
    const h = res.headers();

    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toContain("camera=()");
    expect(h["strict-transport-security"]).toContain("max-age=");

    const csp = h["content-security-policy"] ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    // prod 빌드 검증 — dev 분기(eval 허용)가 새어 나오면 안 된다
    expect(csp).not.toContain("'unsafe-eval'");
  });
}
