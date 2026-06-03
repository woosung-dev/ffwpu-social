// 사용자 랜딩 Hero 섹션 — Figma 96:7690(데스크탑 1440)·99:6951(모바일 375). lg+ 가로 2단(비겹침, flower 정상흐름 560). lg↓ Method B: 좌측 텍스트(z-10) + 우측 flower 를 absolute 배경 장식으로 겹침(z 아래·컴팩트). 폰트·flower 는 clamp 로 375↔1440 보간. Gmarket Sans Medium 미로드 시 SUIT fallback
import Link from "next/link";

import { SectionContainer } from "@/client/components/layout";

export function HeroBanner() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-x-clip bg-brand-bright [border-bottom-left-radius:50%_clamp(28px,6vw,90px)] [border-bottom-right-radius:50%_clamp(28px,6vw,90px)]"
    >
      <SectionContainer className="relative flex items-center justify-between py-10 lg:items-end lg:py-[100px]">
        {/* Title 블록 — 항상 좌측 정렬, flower 위(z-10) */}
        <div className="relative z-10 flex flex-col items-start gap-4 lg:gap-5">
          <h1
            className="text-[clamp(1.5rem,5vw,3.75rem)] leading-[1.25] whitespace-pre-line text-brand-deep"
            style={{
              fontFamily:
                "'Gmarket Sans Medium', var(--font-suit), system-ui, sans-serif",
              fontWeight: 500,
            }}
          >
            {"가치를 삶으로,\n변화를 꽃피우는 동행"}
          </h1>

          {/* CTA — bg #3C1264, text #E9D1FF, 알약 + 화살표 */}
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-full bg-brand-darkest px-5 py-2.5 transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bright lg:gap-2.5 lg:px-[26px] lg:py-3"
          >
            <span className="text-sm font-bold text-ink-on-purple lg:text-xl">
              지난 활동 살펴보기
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
            <img
              src="/icons/hero-cta-arrow.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden
              className="size-4 lg:size-5"
            />
          </Link>
        </div>

        {/* Flower — lg↓: 우측 배경 장식(absolute, z-0, 텍스트 뒤로 겹침). lg+: 정상 흐름 560 */}
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
        <img
          src="/icons/hero-flower.svg"
          alt=""
          aria-hidden
          width={560}
          height={511}
          className="pointer-events-none absolute top-1/2 right-0 z-0 h-auto w-[clamp(150px,40vw,340px)] -translate-y-1/2 lg:relative lg:top-auto lg:right-auto lg:z-auto lg:w-[clamp(360px,40vw,560px)] lg:translate-y-[clamp(16px,3vw,48px)]"
        />
      </SectionContainer>
    </section>
  );
}
