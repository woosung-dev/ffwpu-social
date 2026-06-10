// 사용자 랜딩 Hero 섹션 — Figma 정합 v2(discrete 구간별 고정 + 실제 타원 배경 + 꽃 overhang, criteria §2).
// 곡선 = 실제 타원(Ellipse 444, #B769FF, ~2:1)을 섹션 박스에 클립해 convex 하단 곡선 재현. 곡선 아래 코너는 page bg(흰색) 노출.
// 꽃은 콘텐츠(z-10)에 두어 타원 클립 밖에서 줄기가 곡선 아래 흰 영역으로 자연 overhang(클리핑 금지).
// 모든 크기/폰트/간격은 base/md(768)/lg(1024)/wide(1440) 구간별 고정 — clamp(vw) 연속 스케일 제거(v1 회귀 차단).
import localFont from "next/font/local";
import Link from "next/link";

import { SectionContainer } from "@/client/components/layout";

// Gmarket Sans Medium — Hero 헤드라인 전용(SIL OFL, corp.gmarket.com).
// 루트 레이아웃이 아닌 여기서 로드 — preload(woff2 512KB)가 랜딩 라우트에만 주입되도록 (어드민·/news 무관).
const gmarketSans = localFont({
  src: "../../../public/fonts/GmarketSans-Medium.woff2",
  weight: "500",
  variable: "--font-gmarket",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Apple SD Gothic Neo", "sans-serif"],
});

export function HeroBanner() {
  return (
    <section
      id="hero"
      // 배경 투명(타원이 보라 제공)·radius 없음. overflow-x-clip 로 타원 가로 overflow 클립(가로스크롤0).
      // 세로는 클립하지 않아 꽃 줄기가 섹션 바닥까지 내려와도 잘리지 않음.
      className="relative w-full overflow-x-clip"
    >
      {/* 타원 클립 래퍼 — 섹션 박스(상·좌·우)에 타원을 클립. 콘텐츠 아래(-z-10) */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        {/* 실제 타원 — bottom-[Npx] = 곡선 깊이(섹션 바닥에서 타원 바닥 edge 까지). W×H×bottom 구간별 고정(criteria §2.5) */}
        <div
          data-fid="hero-ellipse"
          className="absolute bottom-[11px] left-1/2 h-[389px] w-[777px] -translate-x-1/2 rounded-[50%] bg-brand-bright md:bottom-[48px] md:h-[1154px] md:w-[2301px] lg:bottom-[46px] lg:h-[1239px] lg:w-[2471px] wide:bottom-[51px] wide:h-[1441px] wide:w-[2875px]"
        />
      </div>

      {/* 콘텐츠 — 타원 위(z-10). 컨테이너 높이(min-h)·헤드라인 top(pt) 앵커별 고정, items-start 상단정렬 */}
      <SectionContainer className="relative z-10 flex min-h-[187px] items-start pt-[30px] md:min-h-[340px] md:pt-[60px] lg:min-h-[405px] lg:pt-[40px] wide:min-h-[612px] wide:pt-[100px]">
        {/* Title 블록 — 좌측 상단, 꽃 위(z-20)로 375 겹침 구간에서도 가독성 확보. 헤드라인↔CTA gap 12/20 */}
        <div
          data-fid="hero-title"
          className="relative z-20 flex flex-col items-start gap-3 md:gap-5"
        >
          <h1
            data-fid="hero-headline"
            // 24/32/42/60 구간별 고정(clamp 제거). 폰트 스택 = globals.css --font-display 토큰(Gmarket→SUIT 폴백)
            className={`${gmarketSans.variable} font-display text-2xl leading-[1.25] font-medium whitespace-pre-line text-brand-deep md:text-[32px] lg:text-[42px] wide:text-[60px]`}
          >
            {"가치를 삶으로,\n변화를 꽃피우는 동행"}
          </h1>

          {/* CTA — bg #3C1264, 알약 + 화살표. padding 14·6 / 20·10 / 26·12, font 14/16/20, gap·icon 6·16 / 10·20 */}
          <Link
            href="/news"
            data-fid="hero-cta"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-darkest px-[14px] py-[6px] transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bright md:gap-2.5 md:px-5 md:py-2.5 lg:px-[26px] lg:py-3"
          >
            {/* 텍스트 색 = Figma #e9d1ff (공유 토큰 ink-on-purple #f0e1ff 와 미세차 — CTA 한정 Figma 값 리터럴) */}
            {/* leading-[1.25]: line-box 높이 확보 → 알약 높이 lg/wide 49px(leading-none 은 44px 로 부족) */}
            <span className="text-sm leading-[1.25] font-bold text-[#e9d1ff] md:text-base lg:text-xl">
              지난 활동 살펴보기
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
            <img
              src="/icons/hero-cta-arrow.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden
              className="size-4 md:size-5"
            />
          </Link>
        </div>

        {/* Flower — 바닥 앵커·우측 정렬(absolute bottom-0). 꽃 바닥 = 섹션 바닥 → 타원 바닥보다 11~51px 아래로 줄기 overhang.
            375 는 SectionContainer px-4(16px) 만큼 right-4 인셋 → "+"·"od" 장식이 프레임 안에 들어옴(Figma 보라 거터). md+ 는 px-0 라 right-0 flush.
            폭 구간별 고정 150/320/400/560(aspect 560:511 → 높이 auto). z-10(타이틀 z-20 아래·타원 위). 장식. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
        <img
          src="/icons/hero-flower.svg"
          alt=""
          data-fid="hero-flower"
          aria-hidden
          width={560}
          height={511}
          className="pointer-events-none absolute right-4 bottom-0 z-10 h-auto w-[150px] md:right-0 md:w-[320px] lg:w-[400px] wide:w-[560px]"
        />
      </SectionContainer>
    </section>
  );
}
