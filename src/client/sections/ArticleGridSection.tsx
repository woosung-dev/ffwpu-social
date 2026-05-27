// ArticleGridSection — 좌측 다크 헤딩 블록 + 우측 3열 aspect-ratio 그리드 (Figma 96:7877)
import Image from "next/image";
import Link from "next/link";

import { ArticleGridCard } from "@/features/news/components";

const ARTICLE_DATE = "2026-02-13";

type ArticleCard = {
  imageUrl: string;
  title: string;
  date: string;
  aspect: `${number}/${number}`;
};

// Figma 컬럼 너비 ≈ 278px 기준 카드별 aspect ratio (lg에서 3열로 적용)
const ARTICLE_COLUMNS: ReadonlyArray<ReadonlyArray<ArticleCard>> = [
  [
    { imageUrl: "/images/articlegrid-card1.png", title: "고소한 사랑의 향기가 퍼져나가고 있어요", date: ARTICLE_DATE, aspect: "278/256" },
    { imageUrl: "/images/articlegrid-card2.png", title: "고소한 사랑의 향기가 퍼져나가고 있어요", date: ARTICLE_DATE, aspect: "278/425" },
  ],
  [
    { imageUrl: "/images/articlegrid-card3.png", title: "동작구립 흑석종합사회복지관 쌀 60Kg 기부", date: ARTICLE_DATE, aspect: "278/425" },
    { imageUrl: "/images/articlegrid-card4.png", title: "고소한 사랑의 향기가 퍼져나가고 있어요", date: ARTICLE_DATE, aspect: "278/337" },
  ],
  [
    { imageUrl: "/images/articlegrid-card5.png", title: "삼태기마을에도 고소한 사랑이 도착했어요", date: ARTICLE_DATE, aspect: "278/278" },
    { imageUrl: "/images/articlegrid-card6.png", title: "고소한 사랑의 향기가 퍼져나가고 있어요", date: ARTICLE_DATE, aspect: "278/381" },
  ],
];

const ARTICLE_FLAT = ARTICLE_COLUMNS.flat();

export function ArticleGridSection() {
  return (
    <section
      id="stories"
      className="scroll-mt-[88px] bg-white px-5 py-16 lg:px-20"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 lg:flex-row lg:items-start lg:gap-4">
        {/* 좌측 다크블록 — 27% (Figma 319/1200) */}
        <div className="flex flex-col gap-[clamp(2rem,4vw,3.75rem)] rounded-[12px] bg-[#242424] px-[10px] py-[40px] lg:basis-[27%] lg:shrink-0">
          <div className="flex flex-col gap-3 px-[16px] text-[#e9cfff]">
            <h2 className="text-[clamp(1.5rem,2.2vw,1.9375rem)] font-extrabold leading-tight">
              고소한 사랑의 향기가 퍼져나가고 있어요
            </h2>
            <p className="text-[clamp(1rem,1.3vw,1.125rem)] font-semibold">
              사랑을 주고 받는 우리들의 이야기
            </p>
          </div>
          <Link
            href="/news"
            className="flex items-center justify-center gap-2.5 px-[16px] py-2.5 text-[16px] font-bold text-[#e9cfff] transition-opacity hover:opacity-80 lg:self-start"
          >
            아티클 더 보러가기
            <Image
              src="/icons/article-cta-arrow.svg"
              alt=""
              width={20}
              height={20}
            />
          </Link>
        </div>

        {/* sm/md: 카드 단위 1·2열 flat 그리드 (좌블록 다음 줄) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
          {ARTICLE_FLAT.map((card) => (
            <ArticleGridCard
              key={card.imageUrl}
              imageUrl={card.imageUrl}
              title={card.title}
              date={card.date}
              aspect={card.aspect}
            />
          ))}
        </div>

        {/* lg: 3열 컬럼 그리드 (Figma 1:1 마조네리 구조) */}
        <div className="hidden flex-1 gap-4 lg:grid lg:grid-cols-3">
          {ARTICLE_COLUMNS.map((column, columnIdx) => (
            <div key={columnIdx} className="flex flex-col gap-5">
              {column.map((card) => (
                <ArticleGridCard
                  key={card.imageUrl}
                  imageUrl={card.imageUrl}
                  title={card.title}
                  date={card.date}
                  aspect={card.aspect}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
