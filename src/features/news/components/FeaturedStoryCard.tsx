// 피처드 스토리 — Figma node 125:8985 명세 정합: 인디케이터 탭으로 콘텐츠 전환 (캐러셀 스와이프 아님). 4 막대 인디케이터 클릭 시 좌-우 2단 콘텐츠만 교체
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type FeaturedStory = {
  id: string;
  title: string;
  description: string;
  href: string;
  /** null 이면 보라 그라디언트 fallback */
  imageUrl: string | null;
};

type Props = {
  stories: readonly FeaturedStory[];
};

export function FeaturedStoryCard({ stories }: Props) {
  const [selected, setSelected] = useState(0);

  if (stories.length === 0) return null;
  const story = stories[selected] ?? stories[0]!;

  return (
    // 배경·세로 패딩은 풀폭 래퍼(news-hero)가 담당 — 여기선 밴드 폭 콘텐츠 그리드만
    <section className="w-full">
      {/* items-stretch + BP별 min-h(Figma featured content 423/556) → 텍스트 컬럼이 이미지보다 길고 버튼 하단 앵커(125:9042). 이미지↔텍스트 gap: 375·767=30 / 768·1025=36 / 1440=40.
          sm(640~767) 반전 구간은 Figma 767 비대칭 칼럼(이미지 343 고정/텍스트 가변) — 50/50 분할이면 이미지가 6px 과대 */}
      <div className="grid items-stretch gap-[30px] sm:grid-cols-[343px_minmax(0,1fr)] md:min-h-[423px] md:grid-cols-2 md:gap-9 wide:min-h-[556px] wide:gap-10">
        {/* 텍스트 칼럼 수직 패딩 — Figma 768·1025 py60, 1440 pt70/pb30 (airy min-h+mt-auto 골격 위 정밀화) */}
        <div className="order-2 flex flex-col md:order-1 md:py-[60px] wide:pt-[70px] wide:pb-[30px]">
          {/* 상단 블록: 미니 로고 + 제목 + 설명 — 내부 gap Figma 375=10 / 768·1025=14 / 1440=18 */}
          <div className="flex flex-col gap-2.5 md:gap-3.5 wide:gap-[18px]">
            {/* 꽃 미니 로고(Figma 125:8989, 1440=98×65·그 외 75×50) — 기존 카테고리 칩은 Figma 미존재 요소라 제거 ("Figma 없으면 코드 없음") */}
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG icon */}
            <img
              src="/icons/featured-mini-logo.svg"
              alt=""
              width={75}
              height={50}
              aria-hidden
              className="h-[50px] w-[75px] self-start wide:h-[65px] wide:w-[98px]"
            />
            <h3 className="text-xl font-bold leading-[1.35] text-ink-strong lg:text-[25px] wide:text-[34px]">
              {story.title}
            </h3>
            {/* Figma 375/768 본문 14px 이나 본문 16px 접근성 제약 우선 — 16px 유지 (도메인 절대 제약) */}
            {/* 본문 색 Figma #374151 = Tailwind gray-700 정확 일치 */}
            <p className="text-base leading-relaxed text-gray-700 wide:text-xl">
              {story.description}
            </p>
          </div>
          {/* 하단: 버튼(좌) + 인디케이터(우) — md↑ mt-auto 로 컬럼 바닥 앵커(Figma 125:9042 BottomBlock). 375 텍스트↔버튼 gap 40 */}
          <div className="mt-10 flex items-end justify-between md:mt-auto md:pt-6">
            {/* 버튼 높이 Figma 40(lg 이하)/50(wide) — line-height 로 맞춤 (기본 lh28 이 h56 원인) */}
            <Link
              href={story.href}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-vivid px-5 py-[10px] text-[14px] leading-5 font-semibold text-white transition-colors hover:bg-brand-mid wide:py-3.5 wide:text-lg wide:leading-[22px]"
            >
              자세히 보기
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG icon */}
              <img
                src="/icons/article-cta-arrow.svg"
                alt=""
                width={20}
                height={20}
                aria-hidden
                className="size-5"
              />
            </Link>
            <div
              role="tablist"
              aria-label="피처드 스토리 선택"
              className="flex items-center gap-0.5"
            >
              {stories.map((s, i) => {
                const isActive = i === selected;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`${i + 1}번째 스토리: ${s.title}`}
                    onClick={() => setSelected(i)}
                    // 가로 패딩 제거 — 바 간 시각 간격 2px(Figma). 세로 py 는 터치 히트영역으로 유지
                    className="py-2"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "block h-[3px] rounded-full transition-[width,background-color] duration-200",
                        isActive
                          ? "w-[22px] bg-brand-vivid"
                          : // 비활성 바 Figma rgba(75,85,99,.15) = gray-600/15 정확 일치
                            "w-[17px] bg-gray-600/15",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 이미지 — md↑ 컬럼이 텍스트 높이로 stretch 되므로 세로 가운데 정렬(Figma 이미지 센터) */}
        <div className="order-1 flex items-center md:order-2">
          {/* 컨테이너 비율 Figma 375·767=325/230, 768+=580/395 (기존 612/411 은 내부 img 크롭 비율 오적용) */}
          <div className="relative aspect-[325/230] w-full overflow-hidden rounded-2xl bg-white md:aspect-[580/395]">
            {story.imageUrl ? (
              <Image
                src={story.imageUrl}
                alt=""
                fill
                sizes="(max-width: 639px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-gradient-from), var(--color-gradient-to))",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
