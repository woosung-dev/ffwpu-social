// 사용자 랜딩 Partners 섹션 — Figma 96:7897(wide)/97:8762(lg)/97:9203(md)/99:7139(base). 4-BP 사이즈 정합: 헤딩 블록은 md+ 동일·base만 축소, 파트너 로고는 wide만 크고 base~lg 동일. 레이아웃: 로고 가운데 정렬 (base 세로 / md+ 가로 wrap — 파트너 추가 시 그대로 확장)
import { SectionContainer } from "@/client/components/layout";

import type { CSSProperties } from "react";
// 실제 협력 기관 — w/h=트림 원본 비율(CLS용), hBase=375~1439 표시높이 / hWide=1440+ 표시높이. 투명 여백 트림, 스크린리더용 alt.
// 기존 5곳(Figma 임시 자료)은 사회공헌국 요청으로 제거 — 실제 파트너는 일화 1곳
const PARTNERS = [
  { src: "/images/s5-partner-ilhwa.png", name: "일화", w: 669, h: 180, hBase: 40, hWide: 50 },
] as const;

export function PartnersSection() {
  return (
    <section
      id="partners"
      // 세로 패딩 — Figma 높이 역산 75/44/76/49 의 4px 스냅(76/44/76/48). wide<lg 역전은 Figma 원본 수치 — 재확인 docs/TODO.md
      className="w-full bg-gradient-to-b from-white to-surface-tint-soft py-19 md:py-11 lg:py-19 wide:py-12"
    >
      <SectionContainer>
        {/* 상단 — 보라 아이콘 + Sow Good 로고 + 카피 */}
        <div className="flex flex-col items-center gap-[30px] text-surface-dark">
          {/* 아이콘 박스 radius — Figma 375 r8 / 768+ r20 (이전 비례 축소값 13 정정) */}
          <div className="flex size-[58px] items-center justify-center rounded-lg border-2 border-surface-dark bg-brand-pale md:size-[92px] md:rounded-[20px]">
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

        {/* 하단 파트너 로고 줄 — 단색 통일 + 판독 가능한 진하기(벤치마킹: 기아대책·charity: water 로고 띠). Figma 원본 opacity 0.23 은 판독 불가 → 85% (일화 단색 사용 승인, 전문가 5인 검토) */}
        <div className="mt-[70px] flex w-full flex-col items-center justify-center opacity-85 grayscale md:flex-row md:flex-wrap md:gap-6">
          {PARTNERS.map((partner) => (
            <div
              key={partner.src}
              className="flex h-[70px] w-[200px] shrink-0 flex-col items-center justify-center md:h-[100px] lg:w-auto"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 로고 */}
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
