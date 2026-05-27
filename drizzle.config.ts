import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// drizzle-kit은 .env.local 자동 로드 안 함 — 명시 로드
config({ path: ".env.local" });

// ADR-001b — strict: true 필수. 컬럼 rename DROP+ADD 자동인식 → 데이터 손실 방지.
export default defineConfig({
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
