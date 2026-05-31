// drizzle-kit 설정 — schema SSoT 위치 + 마이그레이션 출력 + strict 모드(컬럼 rename DROP+ADD 자동 인식, ADR-001b)
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Export it before running drizzle-kit (e.g. `export $(grep -v '^#' .env.local | xargs)`)",
  );
}

export default defineConfig({
  schema: "./src/schema",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
