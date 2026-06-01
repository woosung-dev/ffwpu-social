// 소식 히어로 정렬 페이지 — /news 상단 우선 노출 글 최대 4개 드래그 정렬. 동적 데이터 Suspense 격리
import type { Metadata } from "next";
import { Suspense } from "react";

import { getHeroNews, getHeroCandidates } from "@/features/news";
import { HeroOrderManager } from "@/admin/components/HeroOrderManager";

export const metadata: Metadata = {
  title: "소식 히어로 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminNewsHeroPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong">
          소식 히어로
        </h1>
        <p className="text-sm text-ink-subtle">
          소식 페이지(/news) 상단에 우선 보여줄 글을 지정·정렬합니다.
        </p>
      </header>
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
