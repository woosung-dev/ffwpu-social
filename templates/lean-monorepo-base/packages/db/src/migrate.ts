// 마이그레이션 실행기 — `pnpm db:migrate` 시 호출, migrations/ 디렉토리의 SQL 을 순차 적용 후 종료
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Export it before `pnpm db:migrate` (cwd 의 .env.local 자동 로드 안 됨)",
  );
}

async function main() {
  // 마이그레이션 전용 단발 커넥션 — 앱 풀과 분리 (권한 분리 권장: 마이그레이션 role 별도)
  const client = postgres(databaseUrl!, { max: 1 });
  const db = drizzle(client);
  console.log("[migrate] start");
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("[migrate] done");
  await client.end();
}

main().catch((err) => {
  console.error("[migrate] failed:", err);
  process.exit(1);
});
