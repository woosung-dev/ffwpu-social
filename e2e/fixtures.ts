// E2E 공통 fixture — 모든 테스트에 자동 적용되는 품질 가드
// 수집: console.error · pageerror(Uncaught·Unhandled Rejection) · 4xx/5xx 응답 · CSP 위반(securitypolicyviolation)
// 테스트 종료 시 0건이 아니면 실패. 의도된 오류는 guard.allow(/패턴/) 로 해당 테스트에서만 허용한다.
import { test as base, expect } from "@playwright/test";

type Guard = {
  /** 이 테스트에서 의도적으로 발생시키는 오류 메시지·URL 패턴 허용 */
  allow: (pattern: RegExp) => void;
};

declare global {
  interface Window {
    __cspViolations?: string[];
  }
}

export const test = base.extend<{ guard: Guard }>({
  guard: [
    async ({ page }, use) => {
      const issues: string[] = [];
      const allowed: RegExp[] = [];

      // GA 실수집 차단 — 테스트 트래픽이 운영 GA 속성에 쌓이지 않도록 빈 응답으로 대체.
      // CSP 검사는 요청이 나가기 전 브라우저가 하므로 GA origin 허용 여부는 그대로 검증된다.
      await page.route("https://www.googletagmanager.com/**", (route) =>
        route.fulfill({ status: 200, contentType: "text/javascript", body: "" }),
      );
      await page.route(/google-analytics\.com/, (route) => route.fulfill({ status: 204 }));

      await page.addInitScript(() => {
        window.__cspViolations = [];
        document.addEventListener("securitypolicyviolation", (e) => {
          window.__cspViolations?.push(`${e.violatedDirective} → ${e.blockedURI}`);
        });
      });

      page.on("console", (msg) => {
        if (msg.type() === "error") issues.push(`console.error: ${msg.text()}`);
      });
      page.on("pageerror", (err) => issues.push(`pageerror: ${err.message}`));
      page.on("response", (res) => {
        if (res.status() >= 400) issues.push(`HTTP ${res.status()}: ${res.url()}`);
      });

      await use({ allow: (pattern) => allowed.push(pattern) });

      // 페이지가 이미 닫혔으면(네비게이션 실패 등) CSP 수집은 건너뜀
      const csp = await page
        .evaluate(() => window.__cspViolations ?? [])
        .catch(() => [] as string[]);
      issues.push(...csp.map((v) => `CSP violation: ${v}`));

      const unexpected = issues.filter((i) => !allowed.some((p) => p.test(i)));
      expect(unexpected, "콘솔 에러·실패 요청·CSP 위반이 없어야 한다").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
