// 어드민 랜딩 큐레이션 — StorySection 2 슬롯(쌀 나눔만, 직접 지정) + ArticleGrid 7 슬롯(전 카테고리, 수동 pin + 자동 fallback, ADR-038)
import type { Metadata } from "next";
import { Suspense } from "react";

import { landingDb } from "@/features/landing";
import { listStoryStatsForAdmin, listStorySectionText } from "@/features/kpi";
import {
  LandingSlotManager,
  type CurationNews,
} from "@/admin/components/LandingSlotManager";
import { StoryStatsEditor } from "@/admin/components/StoryStatsEditor";
import { StoryTextEditor } from "@/admin/components/StoryTextEditor";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { ADMIN_COPY } from "@/admin/copy";

export const metadata: Metadata = {
  title: "메인 페이지 노출 글·통계 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminLandingPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ADMIN_COPY.landing.title}
        description={ADMIN_COPY.landing.description}
      />
      <Suspense fallback={<LandingLoading />}>
        <LandingCurationData />
      </Suspense>
    </div>
  );
}

async function LandingCurationData() {
  const [
    storyCandidates,
    featuredCandidates,
    storyStats,
    featuredGrid,
    storyText,
  ] = await Promise.all([
    // 상단 슬롯 후보 — 발행된 쌀 나눔 글(최신순). 3계층 경계 정합으로 db 레이어 위임 (D2)
    landingDb.listRiceSharingCandidates(),
    // 하단 슬롯 후보 — 발행된 전 카테고리 글(최신순, ADR-038)
    landingDb.listAllPublishedCandidates(),
    // StorySection 통계 (후원기관·지원가정·지역시설) — section='story'
    listStoryStatsForAdmin(),
    // 메인 스토리 미리보기 — 공개 페이지와 동일 해석(pin + 자동 fallback, ADR-038)
    landingDb.listFeaturedGrid(7),
    // StorySection 카피 (태그·제목·부제) — section='story_text'
    listStorySectionText(),
  ]);

  // 슬롯 배열 매핑 — 점유 글만(pinned-only). 상단=쌀 나눔 후보 / 하단=전 카테고리 후보. 자동 fallback 은 공개 페이지 전용 (codex D2)
  const storySlots: Array<CurationNews | null> = [null, null];
  for (const c of storyCandidates) {
    if (c.storySlot != null && c.storySlot >= 1 && c.storySlot <= 2) {
      storySlots[c.storySlot - 1] = c;
    }
  }
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
  const featuredPreview = featuredGrid.map((a) =>
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
    <div className="space-y-6">
      <StoryTextEditor initial={storyText} />
      <StoryStatsEditor initialStats={storyStats} />
      <LandingSlotManager
        storyCandidates={storyCandidates}
        featuredCandidates={featuredCandidates}
        storySlots={storySlots}
        featuredSlots={featuredSlots}
        featuredPreview={featuredPreview}
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
