// Drizzle 클라이언트 (postgres.js 어댑터) — 양 앱이 동일 싱글톤 공유. Node Runtime 전용 (Edge 금지)
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Check apps/<app>/.env.local (see .env.example).",
  );
}

// 핫리로드 중복 커넥션 방지 — globalThis 캐시 (Next.js dev 표준 패턴)
const globalForDb = globalThis as unknown as {
  __pg?: ReturnType<typeof postgres>;
};

const queryClient =
  globalForDb.__pg ??
  postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__pg = queryClient;
}

export const db = drizzle(queryClient, { schema });
export type DB = typeof db;
export { queryClient };
