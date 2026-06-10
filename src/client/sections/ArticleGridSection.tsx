// 사용자 랜딩 ArticleGrid 섹션 — Figma 331:8155(시안4). 좌측 다크 블록 + 우측 마조네리.
// 카드 높이는 업로드 이미지 실제 비율로 결정(MasonryGrid round-robin + MediaCard aspectRatio, CLS 0).
// 데이터는 page.tsx ArticleGridSectionWithData 가 props 로 전달 (Kpi/Story 패턴 통일)
import Link from "next/link";

import { SectionContainer } from "@/client/components/layout";
import { MasonryGrid, MediaCard, type MasonryTier } from "@/client/components/media";

// 마조네리 BP 정합 — 모바일 1열 / md+(768~) 3열 (Figma). 숨김 tier 의 lazy 이미지는 미로드
const GRID_TIERS: MasonryTier[] = [
  { columns: 1, visibilityClassName: "flex md:hidden" },
  { columns: 3, visibilityClassName: "hidden md:flex" },
];

// 마조네리 카드 데이터 — listFeaturedGrid 결과에서 사용하는 필드만
export type FeaturedGridItem = {
  id: string;
  title: string;
  categoryName: string;
  coverImageUrl: string | null;
  coverImageWidth: number | null;
  coverImageHeight: number | null;
};

type Props = {
  items: FeaturedGridItem[];
};

export function ArticleGridSection({ items }: Props) {
  return (
    <section id="stories" className="w-full bg-white py-16 lg:py-24">
      <SectionContainer className="flex flex-col gap-10 wide:flex-row wide:items-start wide:gap-4">
        {/* 좌측 다크 블록 — 라운드 12px, ExtraBold 31px #E9CFFF. Figma: md~1439 가로 배너(헤딩↔CTA 양끝, 풀폭 top), wide(1440)+ 만 319px 사이드 헤더, 모바일 세로 스택 */}
        <div className="rounded-xl bg-surface-dark p-8 md:flex md:items-center md:justify-between md:gap-6 wide:block wide:w-[319px] wide:shrink-0 wide:self-start wide:p-10">
          <div>
            <h2 className="text-2xl font-extrabold leading-tight break-keep text-ink-on-purple md:text-[31px]">
              고소한 사랑의 향기가 퍼져나가고 있어요
            </h2>
            <p className="mt-3 text-base font-semibold text-ink-on-purple lg:text-lg">
              사랑을 주고 받는 우리들의 이야기
            </p>
          </div>
          <Link
            href="/news"
            className="mt-6 inline-flex shrink-0 items-center gap-2 text-base font-semibold text-white hover:opacity-90 md:mt-0 wide:mt-6"
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

        {/* 우측 마조네리 — 이미지 실제 비율로 가변 높이. 모바일 1열 / md+ 3열 (round-robin, 읽기 순서 보존) */}
        <div className="flex-1">
          <MasonryGrid
            items={items.slice(0, 6)}
            getKey={(item) => item.id}
            tiers={GRID_TIERS}
            // 상대 높이 = height/width (컬럼 너비 고정이라 렌더 높이에 비례). 치수 없으면 MediaCard 4/5 폴백과 동일한 1.25
            getWeight={(item) =>
              item.coverImageHeight && item.coverImageWidth
                ? item.coverImageHeight / item.coverImageWidth
                : 1.25
            }
            renderItem={(item) => (
              <MediaCard
                href={`/news/${item.id}`}
                imageUrl={item.coverImageUrl}
                width={item.coverImageWidth}
                height={item.coverImageHeight}
                title={item.title}
                subtitle={item.categoryName}
              />
            )}
          />
        </div>
      </SectionContainer>
    </section>
  );
}
