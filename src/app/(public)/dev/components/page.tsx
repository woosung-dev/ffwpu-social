// D-4 공통 컴포넌트 검증 페이지 — D-3 디자인 시안 진입 직전 삭제. 모든 variants 시각 확인 + 반응형 5 BP 검증
"use client";

import { useState } from "react";

import {
  ArticleCard,
  type ArticleLite,
  CategoryTabs,
  type FeaturedStory,
  FeaturedStoryCard,
  Heart,
  KpiCard,
  Pagination,
  StoryCard,
} from "@/features/news/components";

const SAMPLE: ArticleLite = {
  id: "demo-1",
  title: "가정연합, 유엔 경제사회이사회(ECOSOC) 특별협의지위 재획득",
  categoryName: "쌀 나눔",
  coverImageUrl: null,
  publishedAt: new Date("2026-03-11"),
  heartCount: 42,
};

const DEMO_CATEGORIES = [
  { slug: "family_healing", name: "가족 치유" },
  { slug: "local_volunteer", name: "지역 봉사" },
  { slug: "environment", name: "환경 캠페인" },
  { slug: "rice_sharing", name: "쌀 나눔" },
] as const;

const FEATURED: readonly FeaturedStory[] = [
  {
    id: "f1",
    title: "쌀 나눔으로 이웃을 잇는 사회공헌국",
    description:
      "2025년 한 해 동안 전국 32개 지역에서 진행된 쌀 나눔 활동을 통해 12,000여 가정과 만났습니다.",
    href: "/news/f1",
    imageUrl: null,
    badge: "쌀 나눔",
  },
  {
    id: "f2",
    title: "가족 치유 캠프, 700가구가 함께한 회복의 여정",
    description: "1박 2일 프로그램으로 가족 간 대화·치유의 시간을 제공했습니다.",
    href: "/news/f2",
    imageUrl: null,
    badge: "가족 치유",
  },
  {
    id: "f3",
    title: "환경 캠페인 — 지역 산림 정화 9차 활동",
    description:
      "자원봉사자 280명이 4시간 동안 약 1.2톤의 폐기물을 수거했습니다.",
    href: "/news/f3",
    imageUrl: null,
    badge: "환경 캠페인",
  },
  {
    id: "f4",
    title: "지역 봉사 — 독거 어르신 도시락 배달",
    description:
      "매주 화·금요일, 220가정에 따뜻한 식사를 전달하고 있습니다.",
    href: "/news/f4",
    imageUrl: null,
    badge: "지역 봉사",
  },
];

const SWATCHES = [
  { label: "brand-lavender", value: "#F1E3FF", className: "bg-brand-lavender" },
  { label: "brand-pale", value: "#DBB4FF", className: "bg-brand-pale" },
  { label: "brand-bright", value: "#B769FF", className: "bg-brand-bright" },
  { label: "brand-vivid", value: "#B35FEB", className: "bg-brand-vivid" },
  { label: "brand-mid", value: "#9257CA", className: "bg-brand-mid" },
  { label: "brand-soft", value: "#9B7DB6", className: "bg-brand-soft" },
  { label: "brand-primary", value: "#501F7E", className: "bg-brand-primary" },
  { label: "brand-deep", value: "#3A0F62", className: "bg-brand-deep" },
  { label: "brand-darkest", value: "#3C1264", className: "bg-brand-darkest" },
  { label: "warm", value: "#F4B600", className: "bg-warm" },
  { label: "kpi-yellow", value: "#FFCF41", className: "bg-kpi-yellow" },
  { label: "kpi-lime", value: "#DCEF7D", className: "bg-kpi-lime" },
] as const;

export default function ComponentsCheckPage() {
  const [categorySlug, setCategorySlug] = useState("all");
  const [page, setPage] = useState(3);

  return (
    <div className="container mx-auto space-y-12 px-4 py-10 lg:px-8 lg:py-16">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-vivid">
          D-4 검증 — components inventory
        </p>
        <h1 className="text-3xl font-extrabold text-ink-strong lg:text-4xl">
          공통 컴포넌트 ·디자인 토큰 검증 페이지
        </h1>
        <p className="text-sm text-ink-subtle lg:text-base">
          이 페이지는 D-3 디자인 시안 적용 직전 삭제됩니다. 5 BP (1920·1440·1024·768·375) 가로 스크롤 0 확인용.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-ink-strong">디자인 토큰 · 보라 9단계 + KPI</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SWATCHES.map((s) => (
            <div key={s.label} className="rounded-lg border border-border">
              <div className={`h-16 w-full rounded-t-lg ${s.className}`} />
              <div className="space-y-0.5 p-3 text-xs">
                <p className="font-semibold text-foreground">{s.label}</p>
                <p className="text-ink-date">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-ink-strong">KpiCard · 4 variants</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard variant="gray" label="누적 봉사자" value="12,480" unit="명" />
          <KpiCard variant="green" label="활동 기간" value="36" unit="개월" />
          <KpiCard variant="purple" label="활동 횟수" value="284" unit="회" />
          <KpiCard variant="yellow" label="도움 받은 가정" value="9,612" unit="가구" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-ink-strong">CategoryTabs · 동적 카테고리 + 전체</h2>
        <CategoryTabs
          categories={DEMO_CATEGORIES}
          selected={categorySlug}
          onChangeAction={setCategorySlug}
        />
        <p className="text-sm text-ink-subtle">현재 선택 — <strong>{categorySlug}</strong></p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-ink-strong">Heart · interactive + display</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-subtle">interactive</span>
            <Heart count={123} initialActive={false} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-subtle">active</span>
            <Heart count={42} initialActive />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-subtle">compact display</span>
            <Heart count={7} interactive={false} compact />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-ink-strong">Pagination · 10 pages</h2>
        <Pagination
          page={page}
          totalPages={10}
          onPageChangeAction={setPage}
        />
        <p className="text-sm text-ink-subtle">현재 페이지 — <strong>{page}</strong></p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-ink-strong">ArticleCard · 12 variants (size 1~4 × default/hover/none)</h2>
        {([1, 2, 3, 4] as const).map((size) => (
          <div key={size} className="space-y-2">
            <p className="text-sm font-semibold text-ink-subtle">size {size}</p>
            <div className="flex flex-wrap gap-4">
              <ArticleCard size={size} state="default" article={SAMPLE} />
              <ArticleCard size={size} state="hover" article={SAMPLE} />
              <ArticleCard size={size} state="none" />
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-ink-strong">StoryCard · 단일</h2>
        <div className="flex flex-wrap gap-4">
          <StoryCard
            href="/news/demo"
            imageUrl={null}
            title="밥이 사랑입니다"
            subtitle="2026 쌀나눔 프로젝트"
          />
          <StoryCard
            href="/news/demo-2"
            imageUrl={null}
            title="가족이 회복되는 순간"
            subtitle="가족 치유 캠프"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-ink-strong">FeaturedStoryCard · 캐러셀 4 슬라이드</h2>
        <FeaturedStoryCard stories={FEATURED} />
      </section>
    </div>
  );
}
