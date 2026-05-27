// 사용자 랜딩 Hero 섹션 — Figma 96:7690 (1440×740 중 Header 88 제외한 612px Container). Header는 PublicLayout 외부 처리. 4 BP: lg(1024+) 가로 2단·1024↓ 세로 스택. Gmarket Sans Medium 미로드 시 SUIT Heavy fallback (TODO: woff2 자산 수령 시 layout.tsx 추가)
import Link from "next/link";

export function HeroBanner() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#F8F1FF] to-white"
    >
      {/* Banner background — Figma `imgBannerBackground` 1441×2875, lg 이상에서만 노출 (모바일은 그라디언트로 대체) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 hidden -translate-x-1/2 lg:block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset, PublicHeader 패턴 */}
        <img
          src="/icons/hero-banner-background.svg"
          alt=""
          width={2875}
          height={1441}
          className="block max-w-none"
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center gap-8 px-4 pt-10 pb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-0 lg:px-0 lg:pt-[100px] lg:pb-[100px]">
        {/* Title 블록 — 좌측 (lg) / 중앙 (md↓) */}
        <div className="flex flex-col items-center gap-5 lg:items-start">
          <h1
            className="whitespace-pre-line text-center text-[40px] leading-[1.25] text-brand-deep md:text-[48px] lg:text-left lg:text-[60px]"
            style={{
              fontFamily:
                "'Gmarket Sans Medium', var(--font-suit), system-ui, sans-serif",
              fontWeight: 500,
            }}
          >
            {"가치를 삶으로,\n변화를 꽃피우는 동행"}
          </h1>

          {/* CTA — bg #3C1264, text #E9D1FF, SUIT Bold 20px, 알약 + 화살표 20 */}
          <Link
            href="/news"
            className="inline-flex items-center gap-2.5 rounded-full bg-brand-darkest px-[26px] py-3 transition-opacity hover:opacity-90"
          >
            <span className="text-[18px] font-bold lg:text-[20px]" style={{ color: "#E9D1FF" }}>
              지난 활동 살펴보기
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
            <img
              src="/icons/hero-cta-arrow.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden
              className="size-5"
            />
          </Link>
        </div>

        {/* Flower 일러스트 — Figma 559.999×511.483, 모바일 240·태블릿 360·데스크탑 560 */}
        <div className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
          <img
            src="/icons/hero-flower.svg"
            alt="Sow Good 해바라기"
            width={560}
            height={511}
            className="h-auto w-[240px] md:w-[360px] lg:w-[560px]"
          />
        </div>
      </div>
    </section>
  );
}
