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
  // 섹션 상하 패딩 — Figma: 375 24.5 / 768 62.5 / 1025 96.5 / 1440 100
  return (
    <section className="w-full bg-white py-6 md:py-16 lg:py-24 wide:py-[100px]">
      {/* 다크블록↔그리드 간격 — Figma: 375 6 / 768 10 / 1025+ 16 (wide 는 수평 16) */}
      {/* 헤더 클릭 착지(ADR-038): 다크 블록 기준. 솔리드 블록이라 살짝 더 여유(24/28/32) */}
      <SectionContainer
        id="stories"
        className="flex scroll-mt-6 flex-col gap-1.5 md:scroll-mt-7 md:gap-2.5 lg:scroll-mt-8 lg:gap-4 wide:flex-row wide:items-start"
      >
        {/* 좌측 다크 블록 — 라운드 12px. Figma 2중 패딩(블록+내부 Text)을 유효 인셋으로 평탄화:
            375 상20/좌16 → px-4 py-5, 768~1025 좌우26/상하30 → h172, wide 좌우26/상하40.
            md~1439 가로 배너(헤딩↔CTA 양끝, 풀폭 top), wide(1440)+ 만 319px 사이드 헤더, 모바일 세로 스택 */}
        <div className="rounded-xl bg-surface-dark px-4 py-5 md:flex md:items-center md:justify-between md:gap-6 md:px-[26px] md:py-[30px] wide:block wide:w-[319px] wide:shrink-0 wide:self-start wide:py-10">
          <div>
            {/* 타이틀 — Figma: 375 20 / 768+ 31. md 가로 배너에서 1줄 렌더 방지용 max-w (Figma 헤딩 2줄, 블록 h172) */}
            <h2 className="text-xl font-extrabold leading-tight break-keep text-ink-on-purple md:max-w-[360px] md:text-[31px]">
              고소한 사랑의 향기가 퍼져나가고 있어요
            </h2>
            {/* 서브 — Figma: 375 16 / 768+ 18, 행간 normal(≈22) → leading-tight 로 블록 h172 정합 */}
            <p className="mt-3 text-base font-semibold leading-tight text-ink-on-purple md:text-lg">
              사랑을 주고 받는 우리들의 이야기
            </p>
          </div>
          {/* CTA — Figma: 라벨 #E9CFFF(토큰 없음 → arbitrary)·Bold 700, 텍스트↔버튼 gap 375 40 / wide 60. py-2 로 버튼 박스 h40(Figma py10) — 블록 총높이 202/292 산식 충족 */}
          <Link
            href="/news"
            className="mt-10 inline-flex shrink-0 items-center gap-2 py-2 text-base font-bold text-[#E9CFFF] hover:opacity-90 md:mt-0 wide:mt-[60px]"
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

        {/* 우측 마조네리 — 이미지 실제 비율로 가변 높이. 모바일 1열 / md+ 3열 (round-robin, 읽기 순서 보존)
            gap — Figma: 375 6/6 · 768 10/10 · 1025+ 열16/행20 (기본 gap-4 는 유지, 여기서만 주입) */}
        <div className="flex-1">
          <MasonryGrid
            items={items.slice(0, 6)}
            getKey={(item) => item.id}
            tiers={GRID_TIERS}
            columnGapClassName="gap-1.5 md:gap-2.5 lg:gap-4"
            rowGapClassName="gap-1.5 md:gap-2.5 lg:gap-5"
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
