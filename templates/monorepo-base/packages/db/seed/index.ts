// seed 진입점 — 카테고리 4종 + 데모 super 어드민 1명 + 샘플 소식 (멱등성 보장: onConflictDoNothing)
import type { Database } from "../client";
import { categories } from "../schema/categories";
import { news } from "../schema/news";
import { users } from "../schema/users";

// 도메인 규칙 ADR-025 — 초기 카테고리 4종 (slug immutable)
// drizzle insert 가 mutable 배열을 요구해 `as const` 는 사용하지 않는다.
export const INITIAL_CATEGORIES: Array<{
  slug: string;
  name: string;
  sortOrder: number;
}> = [
  { slug: "family_healing", name: "가족 치유", sortOrder: 10 },
  { slug: "local_volunteer", name: "지역 봉사", sortOrder: 20 },
  { slug: "environment", name: "환경 캠페인", sortOrder: 30 },
  { slug: "rice_sharing", name: "쌀 나눔", sortOrder: 40 },
];

export interface SeedOptions {
  adminEmail: string;
  // bcryptjs 해시(평문 금지) — 호출자가 사전에 hash 후 전달
  adminPasswordHash: string;
  adminName?: string;
}

export async function seed(db: Database, opts: SeedOptions): Promise<void> {
  // 1) 카테고리 — slug unique 충돌 시 skip (멱등)
  await db.insert(categories).values(INITIAL_CATEGORIES).onConflictDoNothing({
    target: categories.slug,
  });

  // 2) 어드민 super 1명 — email unique 충돌 시 skip
  const insertedAdmins = await db
    .insert(users)
    .values({
      email: opts.adminEmail,
      passwordHash: opts.adminPasswordHash,
      name: opts.adminName ?? "Super Admin",
      role: "super",
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  // 3) 신규 어드민이 생성된 경우에만 샘플 소식 1건 (재실행 시 중복 생성 방지)
  if (insertedAdmins.length === 0) return;

  const adminId = insertedAdmins[0]!.id;
  const riceCategory = await db.query.categories.findFirst({
    where: (c, { eq }) => eq(c.slug, "rice_sharing"),
  });
  if (!riceCategory) return;

  await db.insert(news).values({
    slug: "welcome-rice-sharing",
    title: "쌀 나눔 캠페인을 시작합니다",
    summary: "가치를 삶으로 증명하는 첫 발걸음.",
    body: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "첫 쌀 나눔 캠페인 소식입니다." }],
        },
      ],
    },
    categoryId: riceCategory.id,
    authorId: adminId,
    status: "published",
    publishedAt: new Date(),
  });
}
