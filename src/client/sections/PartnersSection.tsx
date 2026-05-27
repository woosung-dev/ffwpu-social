// PartnersSection — 아이콘 박스 + Sow Good 로고 + 파트너 로고 5개 (Figma 96:7897)
import Image from "next/image";

// Figma 명세: 각 로고 원본 비율 유지, max-width로 반응형 제약
const PARTNER_LOGOS = [
  { src: "/images/s5-partner1.png", width: 218, height: 31 },
  { src: "/images/s5-partner2.png", width: 183, height: 53 },
  { src: "/images/s5-partner3.png", width: 164, height: 38 },
  { src: "/images/s5-partner4.png", width: 86, height: 33 },
  { src: "/images/s5-partner5.png", width: 173, height: 52 },
] as const;

export function PartnersSection() {
  return (
    <section className="bg-gradient-to-t from-[#f8f1ff] to-white px-5 py-16 lg:px-20">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-[clamp(2.5rem,5vw,4.375rem)]">
        {/* 상단 헤더 */}
        <div className="flex flex-col items-center gap-[clamp(1.25rem,2vw,1.875rem)]">
          {/* 92×92 아이콘 박스 */}
          <div className="flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-[20px] border-2 border-[#242424] bg-[#dbb4ff]">
            <Image
              src="/icons/s5-icon-group.svg"
              alt=""
              width={60}
              height={60}
            />
          </div>

          {/* 로고 + 텍스트 */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Image
              src="/icons/s5-sow-good-logo.svg"
              alt="가정연합 사회공헌단"
              width={100}
              height={66}
              className="h-[clamp(48px,5vw,66px)] w-auto"
            />
            <span className="text-[clamp(1.25rem,2vw,1.75rem)] font-semibold leading-[1.5] text-[#242424]">
              과 함께하고 있는 파트너
            </span>
          </div>
        </div>

        {/* 파트너 로고 5개 — Figma 명세 23% opacity, hover 시 가독성 회복 */}
        <ul className="flex w-full flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-12 lg:justify-between">
          {PARTNER_LOGOS.map((logo) => (
            <li
              key={logo.src}
              className="relative h-[60px] shrink-0 sm:h-[80px] lg:h-[100px]"
              style={{
                width: `clamp(${Math.round(logo.width * 0.5)}px, ${(logo.width / 1200) * 100}vw, ${logo.width}px)`,
              }}
            >
              <Image
                src={logo.src}
                alt=""
                fill
                sizes="(max-width: 768px) 30vw, 220px"
                className="object-contain opacity-30 transition-opacity duration-300 hover:opacity-70"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
