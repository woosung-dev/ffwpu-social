// seed CLI 실행기 — pnpm db:seed 진입점, env 변수에서 어드민 자격 읽고 seed() 호출
import { db } from "../client";
import { seed } from "./index";

async function main(): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPasswordHash = process.env.SEED_ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    throw new Error(
      "[seed] SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD_HASH 환경변수가 필요합니다. " +
        "bcryptjs.hashSync(password, 10) 결과를 SEED_ADMIN_PASSWORD_HASH 로 전달하세요.",
    );
  }

  await seed(db, {
    adminEmail,
    adminPasswordHash,
    adminName: process.env.SEED_ADMIN_NAME,
  });

  console.log("[seed] 완료 — 카테고리 + 어드민 시드 적용");
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] 실패:", err);
  process.exit(1);
});
