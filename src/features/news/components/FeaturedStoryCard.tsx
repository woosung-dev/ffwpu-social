// 피처드 스토리 캐러셀 — Figma node 125:8985 골격(좌 텍스트·우 이미지 + 막대 인디케이터) 위에
// 카드 클릭 이동(이미지·제목·설명) + 이미지 좌우 화살표 + 자동 넘김을 얹은 버전.
// 자동 넘김은 hover/focus 중 정지(WCAG 2.2.2) + prefers-reduced-motion 이면 미작동 — 도메인 §7 "과도한 자동 재생" 완화 장치
"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

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

// 자동 넘김 간격 — 6초(설명 2~3줄을 읽을 만한 체류). 조작 시 selected 변경 → 타이머 재시작
const AUTO_ADVANCE_MS = 6000;

// 사진 위 좌우 이동 화살표 — 데스크탑은 hover 시 노출(사진 가림 최소), 터치엔 hover 가 없어 항상 노출.
// 밝은 사진 위에서 묻히지 않도록 반투명 흰 배경 + 얕은 그림자. 좌/우 위치만 호출부에서 덧붙임
const ARROW_CLASS =
  "absolute top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brand-deep shadow-sm transition-[opacity,background-color] duration-200 outline-none hover:bg-white focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-vivid md:opacity-0 md:group-hover/media:opacity-100 wide:size-11";

export function FeaturedStoryCard({ stories }: Props) {
  const [selected, setSelected] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const count = stories.length;
  const isCarousel = count > 1; // 1건이면 화살표·자동 넘김 없음 (넘길 곳이 없음)

  // 타이머(외부 시스템) 동기화 — 파생 state 아님. selected 가 dep 이라 수동 조작 시 카운트다운이 처음부터 다시
  useEffect(() => {
    if (!isCarousel || isPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(
      () => setSelected((i) => (i + 1) % count),
      AUTO_ADVANCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [count, isCarousel, isPaused, selected]);

  if (count === 0) return null;
  const story = stories[selected] ?? stories[0]!;

  const goTo = (index: number) => setSelected((index + count) % count);

  return (
    // 배경·세로 패딩은 풀폭 래퍼(news-hero)가 담당 — 여기선 밴드 폭 콘텐츠 그리드만
    <section
      className="w-full"
      // 읽는 도중 콘텐츠가 바뀌지 않도록 hover·focus 동안 자동 넘김 정지. React onFocus/onBlur 는 버블링(focusin/out)
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* items-stretch + BP별 min-h(Figma featured content 423/556) → 텍스트 컬럼이 이미지보다 길고 버튼 하단 앵커(125:9042). 이미지↔텍스트 gap: 375·767=30 / 768·1025=36 / 1440=40.
          sm(640~767) 반전 구간은 Figma 767 비대칭 칼럼(이미지 343 고정/텍스트 가변) — 50/50 분할이면 이미지가 6px 과대 */}
      <div className="grid items-stretch gap-[30px] sm:grid-cols-[343px_minmax(0,1fr)] md:min-h-[423px] md:grid-cols-2 md:gap-9 wide:min-h-[556px] wide:gap-10">
        {/* 텍스트 칼럼 수직 패딩 — Figma 768·1025 py60, 1440 pt70/pb30 (airy min-h+mt-auto 골격 위 정밀화) */}
        <div className="order-2 flex flex-col md:order-1 md:py-[60px] wide:pt-[70px] wide:pb-[30px]">
          {/* 상단 블록: 미니 로고 + 제목 + 설명 — 통째로 글 링크(이미지·CTA 와 같은 목적지). 내부 gap Figma 375=10 / 768·1025=14 / 1440=18 */}
          {/* key={story.id} — 전환 시 리마운트되어 페이드 재생 */}
          <Link
            key={story.id}
            href={story.href}
            className="group/story flex motion-safe:animate-featured-fade flex-col gap-2.5 md:gap-3.5 wide:gap-[18px]"
          >
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
            <h3 className="text-xl font-bold leading-[1.35] text-ink-strong transition-colors group-hover/story:text-brand-vivid lg:text-[25px] wide:text-[34px]">
              {story.title}
            </h3>
            {/* Figma 375/768 본문 14px 이나 본문 16px 접근성 제약 우선 — 16px 유지 (도메인 절대 제약) */}
            {/* 본문 색 Figma #374151 = Tailwind gray-700 정확 일치 */}
            <p className="text-base leading-relaxed text-gray-700 wide:text-xl">
              {story.description}
            </p>
          </Link>
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
          <div className="group/media relative aspect-[325/230] w-full overflow-hidden rounded-2xl bg-white md:aspect-[580/395]">
            {story.imageUrl ? (
              <Image
                key={story.id}
                src={story.imageUrl}
                alt=""
                fill
                sizes="(max-width: 639px) 100vw, 50vw"
                className="motion-safe:animate-featured-fade object-cover"
              />
            ) : (
              <div
                key={story.id}
                className="absolute inset-0 motion-safe:animate-featured-fade"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-gradient-from), var(--color-gradient-to))",
                }}
              />
            )}

            {/* 사진 클릭 = 글 이동. 제목·CTA 링크와 목적지가 같아 보조기술에는 중복 노출하지 않음(aria-hidden + tabIndex -1) */}
            <Link
              href={story.href}
              aria-hidden
              tabIndex={-1}
              className="absolute inset-0 z-10"
            />

            {/* 화살표는 오버레이 링크 위(z-20) — 눌러도 글로 이동하지 않고 사진만 넘어감 */}
            {isCarousel && (
              <>
                <button
                  type="button"
                  aria-label="이전 스토리"
                  onClick={() => goTo(selected - 1)}
                  className={cn(ARROW_CLASS, "left-3")}
                >
                  <ChevronLeft aria-hidden className="size-5 wide:size-6" />
                </button>
                <button
                  type="button"
                  aria-label="다음 스토리"
                  onClick={() => goTo(selected + 1)}
                  className={cn(ARROW_CLASS, "right-3")}
                >
                  <ChevronRight aria-hidden className="size-5 wide:size-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
