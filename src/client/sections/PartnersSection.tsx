// 사용자 랜딩 Partners 섹션 — Figma 96:7897 / Section5 (1440×457). 그라디언트 배경 + 보라 아이콘 92×92 + Sow Good 로고 + "과 함께하고 있는 파트너" 카피 + 파트너 로고 5. ADR-009 의도서 §파트너 스토리 페이지가 본 섹션으로 통합 (별도 페이지 아님). 4 BP: lg+ 가로 / md 3+2 / sm 스택
import { SectionContainer } from "@/client/components/layout";

const PARTNERS = [1, 2, 3, 4, 5] as const;

export function PartnersSection() {
  return (
    <section
      id="partners"
      className="w-full bg-gradient-to-b from-surface-tint-soft to-white py-16 lg:py-24"
    >
      <SectionContainer>
        {/* 상단 — 보라 아이콘 + Sow Good 로고 + 카피 */}
        <div className="flex flex-col items-center gap-4 text-surface-dark lg:flex-row lg:justify-center lg:gap-6">
          <div className="flex size-[92px] items-center justify-center rounded-[20px] border-2 border-surface-dark bg-brand-pale">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
            <img
              src="/icons/s5-icon-group.svg"
              alt=""
              width={56}
              height={56}
              aria-hidden
              className="size-14"
            />
          </div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
            <img
              src="/icons/s5-sow-good-logo.svg"
              alt="Sow Good"
              width={140}
              height={40}
              className="h-auto w-[120px] lg:w-[140px]"
            />
            <span className="text-xl font-semibold md:text-2xl lg:text-[28px]">
              과 함께하고 있는 파트너
            </span>
          </div>
        </div>

        {/* 하단 — 파트너 로고 5, opacity-23% */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 lg:mt-16 lg:flex-nowrap lg:justify-between lg:gap-x-6">
          {PARTNERS.map((n) => (
            // eslint-disable-next-line @next/next/no-img-element -- public asset
            <img
              key={n}
              src={`/images/s5-partner${n}.png`}
              alt=""
              width={200}
              height={72}
              aria-hidden
              className="h-auto max-h-[72px] w-auto max-w-[200px]"
            />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
