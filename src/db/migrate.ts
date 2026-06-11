// 프로덕션 마이그레이션 러너 — advisory lock으로 동시 실행 1개만 보장(다중 인스턴스·동시 배포 경합 방지).
// drizzle/ SQL을 __drizzle_migrations(schema "drizzle")로 추적 — drizzle-kit migrate와 동일 호환.
// DATABASE_URL은 호출 측에서 주입(배포는 Neon direct 엔드포인트 권장). dotenv 미사용 → 최소 prod 이미지에서도 동작.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set — 배포는 Neon direct 엔드포인트를 주입하세요.");
}

// 마이그레이션 전용 전역 advisory lock 키(임의 상수). 같은 키를 잡은 다른 러너는 대기 → 직렬화.
const LOCK_KEY = 727274;

async function main() {
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    await pool.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);
    await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
    console.log("✅ migrations applied");
  } finally {
    // unlock 실패는 세션 종료로 자동 해제되므로 무시
    await pool.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]).catch(() => {});
    await pool.end();
  }
}

main().catch((e) => {
  console.error("❌ migration failed:", e);
  process.exit(1);
});
