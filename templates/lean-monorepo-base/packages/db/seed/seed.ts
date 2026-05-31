// 데모 seed — 카테고리 4개 + super 어드민 1개 + 샘플 news 1건. 멱등 (slug/email upsert) → 반복 실행 안전
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, news, users } from "../src/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Export before `pnpm db:seed`");
}

const SEED_CATEGORIES = [
  { name: "가족 치유", slug: "family_healing", sortOrder: 1 },
  { name: "지역 봉사", slug: "local_volunteer", sortOrder: 2 },
  { name: "환경 캠페인", slug: "environment", sortOrder: 3 },
  { name: "쌀 나눔", slug: "rice_sharing", sortOrder: 4 },
] as const;

// 개발용 임시 super 계정 — 운영 배포 전 반드시 변경 (bcrypt 해시는 admin 앱에서 재발급)
const SEED_ADMIN_EMAIL = "admin@example.local";
const SEED_ADMIN_NAME = "Super Admin";
// bcrypt 해시 placeholder. 실제 해시는 `apps/admin/scripts/hash-password.ts` 등으로 재생성 후 교체.
const SEED_ADMIN_PASSWORD_HASH = "$2a$10$placeholderHashReplaceBeforeDeploy";

async function main() {
  const client = postgres(databaseUrl!, { max: 1 });
  const db = drizzle(client);
  console.log("[seed] start");

  // 1) 카테고리 upsert (slug 기준)
  for (const c of SEED_CATEGORIES) {
    await db
      .insert(categories)
      .values(c)
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name: c.name, sortOrder: c.sortOrder },
      });
  }
  console.log(`[seed] categories: ${SEED_CATEGORIES.length}`);

  // 2) super 어드민 — email 충돌 시 skip
  await db
    .insert(users)
    .values({
      email: SEED_ADMIN_EMAIL,
      name: SEED_ADMIN_NAME,
      role: "super",
      passwordHash: SEED_ADMIN_PASSWORD_HASH,
    })
    .onConflictDoNothing({ target: users.email });
  console.log(`[seed] admin upsert: ${SEED_ADMIN_EMAIL}`);

  // 3) 샘플 news 1건 — rice_sharing 카테고리 FK 참조
  const [riceCategory] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, "rice_sharing"))
    .limit(1);

  if (riceCategory) {
    await db
      .insert(news)
      .values({
        title: "쌀 나눔 데모 게시물",
        slug: "rice-sharing-demo",
        summary: "lean-monorepo-base 의 seed 데이터입니다.",
        body: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "샘플 본문입니다." }],
            },
          ],
        },
        status: "published",
        categoryId: riceCategory.id,
        publishedAt: new Date(),
      })
      .onConflictDoNothing({ target: news.slug });
    console.log("[seed] news sample: rice-sharing-demo");
  }

  console.log("[seed] done");
  await client.end();
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
