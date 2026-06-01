// 어드민 랜딩 큐레이션 — StorySection 2 슬롯 (직접 지정 only) + ArticleGrid 7 슬롯 (수동 pin + 자동 fallback). 쌀 나눔 카테고리 필터
import type { Metadata } from "next";
import { Suspense } from "react";

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
  const [candidates, storyStats] = await Promise.all([
    // 발행된 쌀 나눔 글 전체(최신순) — 슬롯 점유 현황 포함. 3계층 경계 정합으로 db 레이어 위임 (D2)
    landingDb.listRiceSharingCandidates(),
    // StorySection 통계 (후원기관·지원가정·지역시설) — section='story'
    listStoryStatsForAdmin(),
  ]);

  // 슬롯 배열 매핑 — 점유 글만(pinned-only). 어드민은 자기 pin 만 표시, 자동 fallback 은 공개 페이지 전용 (codex D2)
  const storySlots: Array<CurationNews | null> = [null, null];
  const featuredSlots: Array<CurationNews | null> = Array.from(
    { length: 7 },
    () => null,
  );
  for (const c of candidates) {
    if (c.storySlot != null && c.storySlot >= 1 && c.storySlot <= 2) {
      storySlots[c.storySlot - 1] = c;
    }
    if (c.featuredRank != null && c.featuredRank >= 1 && c.featuredRank <= 7) {
      featuredSlots[c.featuredRank - 1] = c;
    }
  }

  return (
    <div className="space-y-6">
      <StoryStatsEditor initialStats={storyStats} />
      <LandingSlotManager
        riceSharingPublished={candidates}
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
