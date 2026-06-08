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
  badge?: string;
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
      <div className="grid items-center gap-6 sm:grid-cols-2 lg:gap-10">
        <div className="order-2 flex flex-col gap-4 md:order-1">
          {story.badge && (
            <span className="self-start rounded-full bg-brand-vivid px-3 py-1 text-xs font-semibold text-white">
              {story.badge}
            </span>
          )}
          <h3 className="text-2xl font-bold leading-snug text-ink-strong lg:text-[34px]">
            {story.title}
          </h3>
          <p className="text-base leading-relaxed text-foreground lg:text-xl">
            {story.description}
          </p>
          {/* 하단: 버튼(좌) + 인디케이터(우) — Figma 125:9042 BottomBlock justify-between 정합 */}
          <div className="mt-4 flex items-end justify-between">
            <Link
              href={story.href}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-vivid px-5 py-[10px] text-[14px] font-semibold text-white transition-colors hover:bg-brand-mid lg:text-lg lg:py-3.5"
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
                    className="px-1 py-2"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "block h-[3px] rounded-full transition-[width,background-color] duration-200",
                        isActive
                          ? "w-[22px] bg-brand-vivid"
                          : "w-[17px] bg-foreground/15",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative aspect-[612/411] overflow-hidden rounded-2xl bg-white">
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
