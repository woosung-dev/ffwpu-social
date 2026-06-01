// DB 초기 시드 — super 어드민 계정 + Figma 샘플 콘텐츠 9건 news. tsx로 실행
// dotenv를 다른 모듈보다 먼저 실행해야 하므로 db/schema는 dynamic import
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@ffwpu-social.local";
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword) {
  console.error("[seed] ADMIN_PASSWORD 환경변수가 필요합니다.");
  console.error("       예: ADMIN_PASSWORD='your-password' pnpm db:seed");
  process.exit(1);
}

const { db } = await import("./index");
const { users, categories, news, newsTags, kpiMetrics } = await import("./schema");

async function seed() {
  console.log("[seed] truncating existing rows...");
  await db.execute(
    sql`TRUNCATE TABLE news_tags, heart_events, audit_logs, news, categories, users, kpi_metrics RESTART IDENTITY CASCADE`,
  );

  console.log("[seed] inserting KPI metrics (디자이너 더미 — 사회공헌국 정확값 수령 후 어드민에서 교체)...");
  await db.insert(kpiMetrics).values([
    {
      slug: "volunteer_count",
      label: "누적 봉사자 수",
      value: 45217,
      displayValue: "45,217명+",
      unit: "명",
      sortOrder: 1,
    },
    {
      slug: "volunteer_period",
      label: "누적 봉사 기간",
      value: null, // 기간 비숫자 (38년 5개월)
      displayValue: "38년 5개월",
      unit: null,
      sortOrder: 2,
    },
    {
      slug: "helped_household_count",
      label: "도움을 주게 된 가정 수",
      value: 80257,
      displayValue: "80,257개+",
      unit: "개",
      sortOrder: 3,
    },
    {
      slug: "event_count",
      label: "봉사활동 횟수",
      value: 3614,
      displayValue: "3,614회+",
      unit: "회",
      sortOrder: 4,
    },
  ]);

  console.log("[seed] inserting categories...");
  const categoryRows = await db
    .insert(categories)
    .values([
      { name: "가족 치유", slug: "family_healing", sortOrder: 1 },
      { name: "지역 봉사", slug: "local_volunteer", sortOrder: 2 },
      { name: "환경 캠페인", slug: "environment", sortOrder: 3 },
      { name: "쌀 나눔", slug: "rice_sharing", sortOrder: 4 },
    ])
    .returning();
  const categoryIdBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

  console.log("[seed] inserting super admin...");
  const passwordHash = await bcrypt.hash(adminPassword!, 10);
  const [admin] = await db
    .insert(users)
    .values({
      email: adminEmail,
      name: "사회공헌국 운영자",
      role: "super",
      passwordHash,
    })
    .returning();

  const samples: Array<{
    title: string;
    category: "family_healing" | "local_volunteer" | "environment" | "rice_sharing";
    tags: string[];
    publishedAt: Date;
  }> = [
    {
      title: "한식 행사 쌀 화환 320kg으로 이웃과 함께 나누는 식구 공동체",
      category: "rice_sharing",
      tags: ["이웃관심", "쌀나눔", "자원봉사"],
      publishedAt: new Date("2026-03-11"),
    },
    {
      title: "지역 어르신 가정에 쌀 50포대 전달, 따뜻한 봄 인사",
      category: "rice_sharing",
      tags: ["쌀나눔", "어르신", "지역사회"],
      publishedAt: new Date("2026-03-05"),
    },
    {
      title: "환경의 날 맞이, 마을 하천 정화 봉사 동참",
      category: "environment",
      tags: ["환경", "하천정화", "지속가능"],
      publishedAt: new Date("2026-02-28"),
    },
    {
      title: "가족 치유 캠프 30회차 — 회복된 부모와 자녀의 이야기",
      category: "family_healing",
      tags: ["가족치유", "캠프", "회복"],
      publishedAt: new Date("2026-02-20"),
    },
    {
      title: "지역 아동센터 학습 멘토링 — 100시간 누적",
      category: "local_volunteer",
      tags: ["멘토링", "지역봉사", "교육"],
      publishedAt: new Date("2026-02-14"),
    },
    {
      title: "재활용 분리수거 캠페인, 학생들과 손잡고",
      category: "environment",
      tags: ["환경", "재활용", "학생"],
      publishedAt: new Date("2026-02-08"),
    },
    {
      title: "쌀 나눔 누적 80,000가정 돌파 — 38년의 발걸음",
      category: "rice_sharing",
      tags: ["쌀나눔", "누적", "이정표"],
      publishedAt: new Date("2026-01-30"),
    },
    {
      title: "지역 독거 어르신 가정 환경 개선 봉사",
      category: "local_volunteer",
      tags: ["어르신", "지역봉사", "환경개선"],
      publishedAt: new Date("2026-01-22"),
    },
    {
      title: "갈등 회복 상담 프로그램, 가족 7쌍 회복기",
      category: "family_healing",
      tags: ["가족치유", "상담", "회복"],
      publishedAt: new Date("2026-01-10"),
    },
  ];

  console.log("[seed] inserting 9 news samples...");
  for (const sample of samples) {
    const [inserted] = await db
      .insert(news)
      .values({
        title: sample.title,
        body: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: `${sample.title} 본문 — 추후 어드민에서 편집됩니다.` }],
            },
          ],
        },
        categoryId: categoryIdBySlug.get(sample.category)!,
        publishedAt: sample.publishedAt,
        createdBy: admin.id,
      })
      .returning();

    if (sample.tags.length > 0) {
      await db.insert(newsTags).values(
        sample.tags.map((tag) => ({ newsId: inserted.id, tag })),
      );
    }
  }

  const tagCount = samples.reduce((sum, s) => sum + s.tags.length, 0);
  console.log(`[seed] done. admin email: ${adminEmail} / news 9건 + 태그 ${tagCount}건`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
