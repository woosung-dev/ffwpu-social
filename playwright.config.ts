// E2E — 로컬 prod 빌드(CSP prod 분기 포함)를 띄워 공개·어드민 핵심 흐름 + 콘솔·네트워크·CSP 위반 0 을 검증
// 선행: pnpm infra:up (Postgres·MinIO) + 마이그레이션 적용된 DB + .env.local 의 ADMIN_EMAIL·ADMIN_PASSWORD
import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// 테스트 프로세스에도 .env.local 주입 — 어드민 계정(ADMIN_EMAIL·ADMIN_PASSWORD). CI 등 파일이 없으면 셸 env 사용
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // 4-BP 최소 폭(375) — 모바일 헤더·레이아웃 경로
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } } },
  ],
  webServer: {
    // 이미 떠 있는 서버(dev 포함)가 있으면 재사용 — CSP prod 분기를 보려면 prod 서버여야 한다
    command: `pnpm build && PORT=${PORT} pnpm start`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
