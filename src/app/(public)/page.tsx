// 사용자 랜딩 페이지 — Figma 96:7689 (1440) / 331:7984 (1920). 5섹션 (Hero / KPI / Story / ArticleGrid / Partners) + Footer는 PublicLayout 처리.
// DB 연결 (PR B): kpi_metrics + news.story_slot/featured_rank. 섹션별 *WithData 래퍼가 자기 데이터만 단독 쿼리 — Suspense 격리 (Next.js 16 Cache Components)
import type { Metadata } from "next";
import { Suspense } from "react";

import {
  ArticleGridSection,
  HeroBanner,
  KpiSection,
  KPI_SECTION_SHELL,
  PartnersSection,
  StorySection,
  STORY_SECTION_SHELL,
  type StorySlotItem,
} from "@/client/sections";
import { SectionContainer } from "@/client/components/layout";
import { Reveal, RevealGroup } from "@/client/components/motion";
import { landingDb } from "@/features/landing";

export const metadata: Metadata = {
  title: "Sow Good — 가치를 삶으로, 변화를 꽃피우는 동행",
  description:
    "세계평화통일가정연합 신한국협회 사회공헌국 Sow Good. 쌀 나눔으로 따뜻한 변화를 이어갑니다.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Sow Good — 가치를 삶으로, 변화를 꽃피우는 동행",
    description:
      "세계평화통일가정연합 신한국협회 사회공헌국. 쌀 나눔으로 따뜻한 변화를.",
    type: "website",
    locale: "ko_KR",
    url: "/",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};

export default function Home() {
  return (
    <>
      {/* Hero 는 어보브폴드 — 리빌 제외. 이하 "요소 단위" 페이드업(섹션 통째 X, 사용자 선택 "핵심만 포인트").
          KPI: 헤딩 즉시(스티키) + 벤토 6카드 stagger / Story: 사진2·헤딩만 + 나머지·스티커 즉시
          → 각 섹션을 RevealGroup 으로 감싸 내부 data-reveal 요소만 발동(벤토 정밀 레이아웃 보존, Suspense 내부 배치로 콘텐츠 도착 후 관찰).
          ArticleGrid: 마조네리 카드 단위 stagger(좌 스티키 블록은 리빌 미적용). Partners: 섹션 단위(소형 밴드, 미플래그). */}
      <HeroBanner />
      <Suspense fallback={<KpiLoading />}>
        <RevealGroup>
          <KpiSectionWithData />
        </RevealGroup>
      </Suspense>
      <Suspense fallback={<StoryLoading />}>
        <RevealGroup>
          <StorySectionWithData />
        </RevealGroup>
      </Suspense>
      <Suspense fallback={<ArticleGridLoading />}>
        <ArticleGridSectionWithData />
      </Suspense>
      <Reveal>
        <PartnersSection />
      </Reveal>
    </>
  );
}

async function KpiSectionWithData() {
  const kpiMetrics = await landingDb.listActiveKpiMetrics();
  const metricsBySlug = new Map(
    kpiMetrics.map((m) => [
      m.slug,
      {
        label: m.label,
        sublabel: m.sublabel,
        displayValue: m.displayValue,
        unit: m.unit,
      },
    ]),
  );
  return <KpiSection metricsBySlug={metricsBySlug} />;
}

async function ArticleGridSectionWithData() {
  // featured_rank 운영자 pin + 전 카테고리 최신순 자동 fallback (ADR-038). 7 슬롯 중 시안 6 슬롯만 마조네리 노출 (1~6번)
  const slots = await landingDb.listFeaturedGrid(7);
  const items = slots
    .slice(0, 6)
    .filter((s): s is NonNullable<typeof s> => s != null);
  return <ArticleGridSection items={items} />;
}

async function StorySectionWithData() {
  const [stats, slotRows] = await Promise.all([
    landingDb.listStoryStats(),
    landingDb.listStorySlots(),
  ]);
  // 상단 슬롯 2자리 매핑 — 운영자가 /admin/landing 에서 지정한 글 (story_slot 1~2)
  const slots: Array<StorySlotItem | null> = [null, null];
  for (const r of slotRows) {
    if (r.storySlot != null && r.storySlot >= 1 && r.storySlot <= 2) {
      slots[r.storySlot - 1] = {
        id: r.id,
        title: r.title,
        coverImageUrl: r.coverImageUrl,
      };
    }
  }
  return <StorySection stats={stats} slots={slots} />;
}

function KpiLoading() {
  // 셸 클래스 = 실섹션과 공유 — 패딩 불일치 시 스트리밍 도착 때 레이아웃 점프
  return (
    <section className={KPI_SECTION_SHELL} aria-busy>
      <SectionContainer>
        <div className="h-[400px] w-full animate-pulse rounded-2xl bg-surface-soft" />
      </SectionContainer>
    </section>
  );
}

function StoryLoading() {
  return (
    <section className={STORY_SECTION_SHELL} aria-busy>
      <SectionContainer>
        <div className="h-[420px] w-full animate-pulse rounded-2xl bg-white/60" />
      </SectionContainer>
    </section>
  );
}

function ArticleGridLoading() {
  return (
    <section className="w-full bg-white py-16 lg:py-24" aria-busy>
      <SectionContainer>
        <div className="h-[500px] w-full animate-pulse rounded-2xl bg-surface-soft" />
      </SectionContainer>
    </section>
  );
}
