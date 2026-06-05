// 사용자 랜딩 Partners 섹션 — Figma 96:7897(wide)/97:8762(lg)/97:9203(md)/99:7139(base). 4-BP 사이즈 정합: 헤딩 블록은 md+ 동일·base만 축소, 파트너 로고는 wide만 크고 base~lg 동일. 레이아웃: base 1열 / md 3+2 / lg+ 가로 1줄
import type { CSSProperties } from "react";

import { SectionContainer } from "@/client/components/layout";

// 실제 협력 기관 5곳 — w/h=트림 원본 비율(CLS용), hBase=375~1439 표시높이 / hWide=1440+ 표시높이 (Figma image rect). 투명 여백 트림, opacity-23, 스크린리더용 alt
const PARTNERS = [
  {
    src: "/images/s5-partner1.png",
    name: "선학UP대학원대학교",
    w: 352,
    h: 52,
    hBase: 25,
    hWide: 31,
  },
  {
    src: "/images/s5-partner2.png",
    name: "천주평화연합",
    w: 267,
    h: 67,
    hBase: 43,
    hWide: 53,
  },
  {
    src: "/images/s5-partner3.png",
    name: "선학역사편찬원",
    w: 266,
    h: 62,
    hBase: 31,
    hWide: 38,
  },
  {
    src: "/images/s5-partner4.png",
    name: "PeaceTV",
    w: 138,
    h: 52,
    hBase: 26,
    hWide: 33,
  },
  {
    src: "/images/s5-partner5.png",
    name: "천원궁",
    w: 272,
    h: 78,
    hBase: 42,
    hWide: 52,
  },
] as const;

export function PartnersSection() {
  return (
    <section
      id="partners"
      className="w-full bg-gradient-to-b from-surface-tint-soft to-white py-16 lg:py-24"
    >
      <SectionContainer>
        {/* 상단 — 보라 아이콘 + Sow Good 로고 + 카피 */}
        <div className="flex flex-col items-center gap-[30px] text-surface-dark">
          <div className="flex size-[58px] items-center justify-center rounded-[13px] border-2 border-surface-dark bg-brand-pale md:size-[92px] md:rounded-[20px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
            <img
              src="/icons/s5-icon-group.svg"
              alt=""
              width={56}
              height={56}
              aria-hidden
              className="size-[35px] md:size-14"
            />
          </div>
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
            <img
              src="/icons/s5-sow-good-logo.svg"
              alt="가정연합 사회공헌단"
              width={100}
              height={67}
              className="h-[40px] w-auto md:h-[66px]"
            />
            <span className="text-xl font-semibold md:text-[28px]">
              과 함께하고 있는 파트너
            </span>
          </div>
        </div>

        {/* 하단 — 파트너 로고. Figma List 332:9087 — flex justify-between(lg+) / flex-wrap(md) / flex-col(base) · opacity-23(컨테이너). Logo 프레임: w-200(base·md)→auto(lg+), h-70(base)→100(md+) */}
        <div className="mt-[70px] flex w-full flex-col items-center justify-center opacity-[0.23] md:flex-row md:flex-wrap md:content-center md:justify-around lg:flex-nowrap lg:justify-between">
          {PARTNERS.map((partner) => (
            <div
              key={partner.src}
              className="flex h-[70px] w-[200px] shrink-0 flex-col items-center justify-center md:h-[100px] lg:w-auto"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- public asset */}
              <img
                src={partner.src}
                alt={partner.name}
                width={partner.w}
                height={partner.h}
                style={
                  {
                    "--h": `${partner.hBase}px`,
                    "--hw": `${partner.hWide}px`,
                  } as CSSProperties
                }
                className="h-[var(--h)] w-auto max-w-full wide:h-[var(--hw)]"
              />
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
