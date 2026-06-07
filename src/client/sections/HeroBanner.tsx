// 사용자 랜딩 Hero 섹션 — Figma 96:7690(데스크탑 1440)·99:6951(모바일 375). 4앵커 길이 정합(375/768/1024/1440, criteria §2).
// lg+ 가로 2단(비겹침, flower 정상흐름 400~560px, items-start 상단정렬 — Figma 에서 헤드라인 top ≈ flower top). lg↓ Method B: 좌측 텍스트(z-10) + 우측 flower 를 absolute 배경 장식으로 겹침(z 아래·컴팩트).
// 컨테이너 높이(min-h 187/340/405/612)·헤드라인 top(pt 30/60/40/100)·flower 폭(150/320/400/560)을 앵커별 고정(criteria 가 BP 단계변화 허용). 헤드라인은 clamp 24↔60 보간. Gmarket Sans Medium 미로드 시 SUIT fallback.
import Link from "next/link";

import { SectionContainer } from "@/client/components/layout";

export function HeroBanner() {
  return (
    <section
      id="hero"
      // 하단 convex 곡선 — 50% 가로반경(넓은 얕은 ellipse) + 세로반경 calc 로 깊이 보정(1024≈46·1440≈51, criteria §2.3).
      className="relative w-full overflow-x-clip bg-brand-bright [border-bottom-left-radius:50%_clamp(28px,calc(34px+1.2vw),57px)] [border-bottom-right-radius:50%_clamp(28px,calc(34px+1.2vw),57px)]"
    >
      {/* 컨테이너 높이/헤드라인 top 앵커 고정 — items-start 상단정렬, pt = Figma 헤드라인 y오프셋, min-h = Figma 컨테이너 높이 */}
      <SectionContainer className="relative flex min-h-[187px] items-start justify-between pt-[30px] pb-8 md:min-h-[340px] md:pt-[60px] lg:min-h-[405px] lg:pt-[40px] lg:pb-0 wide:min-h-[612px] wide:pt-[100px]">
        {/* Title 블록 — 항상 좌측 정렬, flower 위(z-10) */}
        <div
          data-fid="hero-title"
          className="relative z-10 flex flex-col items-start gap-4 lg:gap-5"
        >
          <h1
            data-fid="hero-headline"
            // 375→24 / 768→32 / 1024→43 / 1440→60 (clamp 4.2vw)
            className="text-[clamp(1.5rem,4.2vw,3.75rem)] leading-[1.25] whitespace-pre-line text-brand-deep"
            style={{
              fontFamily:
                "'Gmarket Sans Medium', var(--font-suit), system-ui, sans-serif",
              fontWeight: 500,
            }}
          >
            {"가치를 삶으로,\n변화를 꽃피우는 동행"}
          </h1>

          {/* CTA — bg #3C1264, text ink-on-purple, 알약 + 화살표. 375≈155×29 / 768≈190×40 / 1024·1440=232×49 */}
          <Link
            href="/news"
            data-fid="hero-cta"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-darkest px-4 py-[7px] transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bright md:gap-2 md:px-[23px] md:py-[11px] lg:gap-2.5 lg:px-[26px] lg:py-[14px]"
          >
            <span className="text-sm leading-none font-bold text-ink-on-purple md:text-base lg:text-xl">
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

        {/* Flower — lg↓: 우측 배경 장식(absolute, z-0, 텍스트 뒤로 겹침). 375 는 right-8 인셋+24px 하향(Figma y≈50), 768 은 flush(md:right-0)+24px 하향(y≈48). lg+: 정상 흐름 상단정렬(items-start) — Figma flower top ≈ 헤드라인 top. 앵커별 고정폭 150/320/400/560 (aspect 560:511) */}
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
        <img
          src="/icons/hero-flower.svg"
          alt=""
          data-fid="hero-flower"
          aria-hidden
          width={560}
          height={511}
          className="pointer-events-none absolute top-1/2 right-8 z-0 h-auto w-[150px] translate-y-[calc(-50%+24px)] md:right-0 md:w-[320px] lg:relative lg:top-auto lg:right-auto lg:z-auto lg:w-[400px] lg:translate-y-0 wide:w-[560px]"
        />
      </SectionContainer>
    </section>
  );
}
