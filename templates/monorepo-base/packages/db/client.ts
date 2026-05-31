// Drizzle PG 클라이언트 싱글톤 — server-only 경계, RSC/Server Action/Route Handler 에서만 사용
import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "[@myorg/db] DATABASE_URL 환경변수가 없습니다. .env.local 또는 Vercel 대시보드에서 설정하세요.",
  );
}

// HMR 중복 연결 방지용 globalThis 캐싱 (dev 전용 — production 은 매번 새 인스턴스)
const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>;
};

const queryClient =
  globalForDb.__pgClient ??
  postgres(databaseUrl, {
    max: process.env.NODE_ENV === "production" ? 10 : 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__pgClient = queryClient;
}

export const db = drizzle(queryClient, { schema, casing: "snake_case" });

export type Database = typeof db;
