// 소식 히어로 정렬 페이지 — /news 상단 우선 노출 글 최대 4개 드래그 정렬. 동적 데이터 Suspense 격리
import type { Metadata } from "next";
import { Suspense } from "react";

import { getHeroNews, getHeroCandidates } from "@/features/news";
import { HeroOrderManager } from "@/admin/components/HeroOrderManager";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { ADMIN_COPY } from "@/admin/copy";

export const metadata: Metadata = {
  title: "소식 대표 글 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminNewsHeroPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ADMIN_COPY.newsHero.title}
        description={ADMIN_COPY.newsHero.description}
      />
      <Suspense fallback={<HeroLoading />}>
        <HeroData />
      </Suspense>
    </div>
  );
}

async function HeroData() {
  const [current, candidates] = await Promise.all([
    getHeroNews(),
    getHeroCandidates(),
  ]);
  return <HeroOrderManager initialItems={current} candidates={candidates} />;
}

function HeroLoading() {
  return (
    <div className="space-y-4" aria-busy>
      <div className="h-64 animate-pulse rounded-xl bg-muted/60" />
    </div>
  );
}
