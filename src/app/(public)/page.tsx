// 사용자 랜딩 페이지 — Figma 96:7689 (1440) / 126:11815 (1920). 5섹션 (Hero / KPI / Story / ArticleGrid / Partners) + Footer는 PublicLayout 처리.
// DB 연결 (PR B): kpi_metrics + news.story_slot/featured_rank → getLandingData. Suspense 격리 (Next.js 16 Cache Components)
import type { Metadata } from "next";
import { Suspense } from "react";

import {
  ArticleGridSection,
  HeroBanner,
  KpiSection,
  PartnersSection,
  StorySection,
} from "@/client/sections";
import { getLandingData } from "@/features/landing";

export const metadata: Metadata = {
  title: "Sow Good — 가치를 삶으로, 변화를 꽃피우는 동행",
  description:
    "세계평화통일가정연합 신한국협회 사회공헌국 Sow Good. 쌀 나눔으로 따뜻한 변화를 이어갑니다.",
  openGraph: {
    title: "Sow Good — 가치를 삶으로, 변화를 꽃피우는 동행",
    description:
      "세계평화통일가정연합 신한국협회 사회공헌국. 쌀 나눔으로 따뜻한 변화를.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function Home() {
  return (
    <>
      <HeroBanner />
      <Suspense fallback={<KpiLoading />}>
        <KpiSectionWithData />
      </Suspense>
      <StorySection />
      <Suspense fallback={<ArticleGridLoading />}>
        <ArticleGridSection />
      </Suspense>
      <PartnersSection />
    </>
  );
}

async function KpiSectionWithData() {
  const { kpiMetrics } = await getLandingData();
  const metricsBySlug = new Map(
    kpiMetrics.map((m) => [
      m.slug,
      { label: m.label, displayValue: m.displayValue, unit: m.unit },
    ]),
  );
  return <KpiSection metricsBySlug={metricsBySlug} />;
}

function KpiLoading() {
  return (
    <section className="w-full bg-white py-16 lg:py-24" aria-busy>
      <div className="mx-auto h-[400px] w-full max-w-[1200px] animate-pulse rounded-2xl bg-surface-soft px-4 lg:px-0" />
    </section>
  );
}

function ArticleGridLoading() {
  return (
    <section className="w-full bg-white py-16 lg:py-24" aria-busy>
      <div className="mx-auto h-[500px] w-full max-w-[1200px] animate-pulse rounded-2xl bg-surface-soft px-4 lg:px-0" />
    </section>
  );
}
