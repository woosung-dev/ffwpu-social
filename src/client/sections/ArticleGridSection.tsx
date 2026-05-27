// 사용자 랜딩 ArticleGrid 섹션 — Figma 96:7877 (1440×982). 좌측 다크 블록 319px + 우측 마조네리 3열 6 StoryCard. ADR-009 #stories 앵커 (활동 스토리 메뉴 매핑, PublicHeader MENU 정합). 4 BP: lg+ 좌-우 / 1024↓ 다크 헤더 위 + 1~2열 스택
import Link from "next/link";

import { StoryCard } from "@/features/news/components";
import { listNews } from "@/features/news/service";
import { cn } from "@/lib/utils";

// Figma 마조네리 6 카드 높이 비율 — 256 / 425 / 425 / 337 / 278 / 381
const CARD_ASPECTS = [
  "aspect-[278/256]",
  "aspect-[278/425]",
  "aspect-[278/425]",
  "aspect-[278/337]",
  "aspect-[278/278]",
  "aspect-[278/381]",
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

export async function ArticleGridSection() {
  const { items } = await listNews({ page: 1, limit: 6 });

  return (
    <section id="stories" className="w-full bg-white py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 lg:flex-row lg:items-start lg:gap-8 lg:px-0">
        {/* 좌측 다크 블록 — 319px 폭, 라운드 12px, ExtraBold 31px #E9CFFF */}
        <div className="rounded-xl bg-surface-dark p-8 lg:w-[319px] lg:shrink-0 lg:self-start lg:p-10">
          <h2 className="text-2xl font-extrabold leading-tight text-ink-on-purple lg:text-[31px]">
            고소한 사랑의 향기가 퍼져나가고 있어요
          </h2>
          <p className="mt-3 text-base font-semibold text-ink-on-purple lg:text-lg">
            사랑을 주고 받는 우리들의 이야기
          </p>
          <Link
            href="/news"
            className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-white hover:opacity-90"
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
      </div>
    </section>
  );
}
