// 어드민 '밥이 사랑이다' 관리 — StorySection 카피·통계 + 상단 대표 사진 2 슬롯(쌀 나눔만, ADR-038). 사이드바 재구성으로 메인 스토리(featured)는 /admin/main-story 로 분리
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
  title: "밥이 사랑이다 | 사회공헌단 어드민",
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
        <StorySectionData />
      </Suspense>
    </div>
  );
}

async function StorySectionData() {
  const [storyCandidates, storyStats, storyText] = await Promise.all([
    // 상단 슬롯 후보 — 발행된 쌀 나눔 글(최신순). 3계층 경계 정합으로 db 레이어 위임 (D2)
    landingDb.listRiceSharingCandidates(),
    // StorySection 통계 (후원기관·지원가정·지역시설) — section='story'
    listStoryStatsForAdmin(),
    // StorySection 카피 (태그·제목·부제) — section='story_text'
    listStorySectionText(),
  ]);

  // 슬롯 배열 매핑 — 점유 글만(pinned-only). 상단=쌀 나눔 후보. 자동 fallback 은 공개 페이지 전용 (codex D2)
  const storySlots: Array<CurationNews | null> = [null, null];
  for (const c of storyCandidates) {
    if (c.storySlot != null && c.storySlot >= 1 && c.storySlot <= 2) {
      storySlots[c.storySlot - 1] = c;
    }
  }

  return (
    <div className="space-y-6">
      <StoryTextEditor initial={storyText} />
      <StoryStatsEditor initialStats={storyStats} />
      <LandingSlotManager
        show="story"
        storyCandidates={storyCandidates}
        storySlots={storySlots}
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
