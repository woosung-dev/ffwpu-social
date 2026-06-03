// 사용자 랜딩 ArticleGrid 섹션 — Figma 331:8155 (시안4) / 96:7877 (이전 시안). 좌측 다크 블록 + 우측 마조네리 6 슬롯. 데이터는 page.tsx ArticleGridSectionWithData 가 props 로 전달 (Kpi/Story 패턴 통일)
import Link from "next/link";

import { SectionContainer } from "@/client/components/layout";
import { StoryCard } from "@/features/news/components";
import { cn } from "@/lib/utils";

// Figma 마조네리 6 카드 높이 비율 — 기본(1440/3열 col≈272px): 256/425/425/337/278/381
// md(768/2열 col≈360px): 세로 Portrait 카드(1,2,3,5)가 550+px로 과도히 커짐 → Figma 768 대비
// md:aspect-[278/140] 로 landscape 단축 (~181px at 360px col), lg+에서 원래 비율 복원
const CARD_ASPECTS = [
  "aspect-[278/256]",
  "aspect-[278/425] md:aspect-[278/140] lg:aspect-[278/425]",
  "aspect-[278/425] md:aspect-[278/140] lg:aspect-[278/425]",
  "aspect-[278/337] md:aspect-[278/140] lg:aspect-[278/337]",
  "aspect-[278/278]",
  "aspect-[278/381] md:aspect-[278/140] lg:aspect-[278/381]",
] as const;

// 자산 fallback — DB cover_image_url 미설정 시 articlegrid 시안 자산 cycle
const FALLBACK_IMAGES = [
  "/images/articlegrid-card1.png",
  "/images/articlegrid-card2.png",
  "/images/articlegrid-card3.png",
  "/images/articlegrid-card4.png",
  "/images/articlegrid-card5.png",
  "/images/articlegrid-card6.png",
] as const;

// 마조네리 카드 데이터 — listFeaturedGrid 결과에서 사용하는 필드만
export type FeaturedGridItem = {
  id: string;
  title: string;
  categoryName: string;
  coverImageUrl: string | null;
};

type Props = {
  items: FeaturedGridItem[];
};

export function ArticleGridSection({ items }: Props) {
  return (
    <section id="stories" className="w-full bg-white py-16 lg:py-24">
      <SectionContainer className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-8">
        {/* 좌측 다크 블록 — 라운드 12px, ExtraBold 31px #E9CFFF. md(768~1023) 가로 배너(헤딩↔CTA 양끝), lg+ 319px 사이드 헤더, 모바일 세로 스택 (Figma 정합) */}
        <div className="rounded-xl bg-surface-dark p-8 md:flex md:items-center md:justify-between md:gap-6 lg:block lg:w-[319px] lg:shrink-0 lg:self-start lg:p-10">
          <div>
            <h2 className="text-2xl font-extrabold leading-tight text-ink-on-purple md:text-[31px]">
              고소한 사랑의 향기가 퍼져나가고 있어요
            </h2>
            <p className="mt-3 text-base font-semibold text-ink-on-purple lg:text-lg">
              사랑을 주고 받는 우리들의 이야기
            </p>
          </div>
          <Link
            href="/news"
            className="mt-6 inline-flex shrink-0 items-center gap-2 text-base font-semibold text-white hover:opacity-90 md:mt-0 lg:mt-6"
          >
            아티클 더 보러가기
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
            <img
              src="/icons/article-cta-arrow.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden
              className="size-5"
            />
          </Link>
        </div>

        {/* 우측 마조네리 — columns로 자연스러운 높이 분배. 모바일 1·태블릿 2·데스크탑 3 */}
        <div className="flex-1">
          <div className="columns-1 gap-4 [&>*]:mb-4 md:columns-2 lg:columns-3">
            {Array.from({ length: 6 }).map((_, idx) => {
              const item = items[idx];
              if (!item) return null;
              return (
                <div key={item.id} className="break-inside-avoid">
                  <StoryCard
                    href={`/news/${item.id}`}
                    imageUrl={item.coverImageUrl ?? FALLBACK_IMAGES[idx]}
                    title={item.title}
                    subtitle={item.categoryName}
                    className={cn("max-w-none w-full", CARD_ASPECTS[idx])}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
