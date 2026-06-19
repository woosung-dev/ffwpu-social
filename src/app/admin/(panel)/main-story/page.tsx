// 어드민 '메인 스토리 관리' — 랜딩 ArticleGrid 하단 7 슬롯(전 카테고리, 수동 pin + 최신순 자동 fallback, ADR-038). 사이드바 재구성으로 '밥이 사랑이다'(story)와 분리
import type { Metadata } from "next";
import { Suspense } from "react";

import { landingDb } from "@/features/landing";
import {
  LandingSlotManager,
  type CurationNews,
  type FeaturedPreviewItem,
} from "@/admin/components/LandingSlotManager";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { ADMIN_COPY } from "@/admin/copy";

export const metadata: Metadata = {
  title: "메인 스토리 관리 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminMainStoryPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ADMIN_COPY.mainStory.title}
        description={ADMIN_COPY.mainStory.description}
      />
      <Suspense fallback={<MainStoryLoading />}>
        <FeaturedData />
      </Suspense>
    </div>
  );
}

async function FeaturedData() {
  const [featuredCandidates, featuredGrid] = await Promise.all([
    // 하단 슬롯 후보 — 발행된 전 카테고리 글(최신순, ADR-038)
    landingDb.listAllPublishedCandidates(),
    // 메인 스토리 미리보기 — 공개 페이지와 동일 해석(pin + 자동 fallback, ADR-038)
    landingDb.listFeaturedGrid(7),
  ]);

  // 슬롯 배열 매핑 — 점유 글만(pinned-only). 자동 fallback 은 공개 페이지 전용 (codex D2)
  const featuredSlots: Array<CurationNews | null> = Array.from(
    { length: 7 },
    () => null,
  );
  for (const c of featuredCandidates) {
    if (c.featuredRank != null && c.featuredRank >= 1 && c.featuredRank <= 7) {
      featuredSlots[c.featuredRank - 1] = c;
    }
  }

  // 메인 스토리 미리보기 — 공개 ArticleGrid 와 동일 순서. featuredRank != null = 운영자 지정, null = 자동 채움
  const featuredPreview: Array<FeaturedPreviewItem | null> = featuredGrid.map(
    (a) =>
      a
        ? {
            id: a.id,
            title: a.title,
            categoryName: a.categoryName,
            pinned: a.featuredRank != null,
          }
        : null,
  );

  return (
    <LandingSlotManager
      show="featured"
      featuredCandidates={featuredCandidates}
      featuredSlots={featuredSlots}
      featuredPreview={featuredPreview}
    />
  );
}

function MainStoryLoading() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="h-96 animate-pulse rounded-xl bg-muted/60" />
    </div>
  );
}
