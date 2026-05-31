// Drizzle Kit 설정 — 스키마 SSOT 및 마이그레이션 출력 경로 정의 (strict 모드로 데이터 손실 방지)
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "[@myorg/db] DATABASE_URL 환경변수가 없습니다. .env.local 또는 Vercel 대시보드에서 설정하세요.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./schema/index.ts",
  out: "./migrations",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
  casing: "snake_case",
});
