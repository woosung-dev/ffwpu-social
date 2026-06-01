// 어드민 랜딩 큐레이션 — StorySection 2 슬롯 (직접 지정 only) + ArticleGrid 7 슬롯 (수동 pin + 자동 fallback). 쌀 나눔 카테고리 필터
import type { Metadata } from "next";
import { Suspense } from "react";
import { and, asc, desc, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import { categories, news } from "@/db/schema";
import { landingDb } from "@/features/landing";
import { listStoryStatsForAdmin } from "@/features/kpi";
import {
  LandingSlotManager,
  type CurationNews,
} from "@/admin/components/LandingSlotManager";
import { StoryStatsEditor } from "@/admin/components/StoryStatsEditor";

export const metadata: Metadata = {
  title: "메인 랜딩 큐레이션 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminLandingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong">
          메인 랜딩 큐레이션
        </h1>
        <p className="text-sm text-ink-subtle">
          메인 페이지 상단 &ldquo;쌀 나눔 활동&rdquo; (사진 2장) + 하단
          &ldquo;활동 스토리&rdquo; (7장 그리드) 에 노출할 쌀 나눔 카테고리 글을
          지정합니다.
        </p>
      </header>
      <Suspense fallback={<LandingLoading />}>
        <LandingCurationData />
      </Suspense>
    </div>
  );
}

async function LandingCurationData() {
  const [riceSharing, storyRows, featuredSlots, storyStats] = await Promise.all([
    // 발행된 쌀 나눔 카테고리 글 — 큐레이션 후보. 최신순
    db
      .select({
        id: news.id,
        title: news.title,
        categoryName: categories.name,
        categorySlug: categories.slug,
        publishedAt: news.publishedAt,
        storySlot: news.storySlot,
        featuredRank: news.featuredRank,
      })
      .from(news)
      .innerJoin(categories, eq(news.categoryId, categories.id))
      .where(
        and(isNotNull(news.publishedAt), eq(categories.slug, "rice_sharing")),
      )
      .orderBy(desc(news.publishedAt)),
    // StorySection 슬롯 (1~2) 현 점유 — 자동 fallback 없음
    db
      .select({
        id: news.id,
        title: news.title,
        categoryName: categories.name,
        categorySlug: categories.slug,
        publishedAt: news.publishedAt,
        storySlot: news.storySlot,
        featuredRank: news.featuredRank,
      })
      .from(news)
      .innerJoin(categories, eq(news.categoryId, categories.id))
      .where(
        and(
          isNotNull(news.publishedAt),
          isNotNull(news.storySlot),
          eq(categories.slug, "rice_sharing"),
        ),
      )
      .orderBy(asc(news.storySlot)),
    // ArticleGrid 슬롯 (1~7) 자동 fallback 포함 — landing service 재사용
    landingDb.listFeaturedGrid(7),
    // StorySection 통계 (후원기관·지원가정·지역시설) — section='story'
    listStoryStatsForAdmin(),
  ]);

  // 상단 슬롯 배열 (2 자리) — storySlot 1~2 매핑
  const storySlots: Array<CurationNews | null> = [null, null];
  for (const r of storyRows) {
    if (r.storySlot != null && r.storySlot >= 1 && r.storySlot <= 2) {
      storySlots[r.storySlot - 1] = r;
    }
  }

  return (
    <div className="space-y-6">
      <StoryStatsEditor initialStats={storyStats} />
      <LandingSlotManager
        riceSharingPublished={riceSharing}
        storySlots={storySlots}
        featuredSlots={featuredSlots}
      />
    </div>
  );
}

function LandingLoading() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="h-48 animate-pulse rounded-xl bg-muted/60" />
      <div className="h-96 animate-pulse rounded-xl bg-muted/60" />
    </div>
  );
}
