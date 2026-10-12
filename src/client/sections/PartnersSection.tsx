// 사용자 랜딩 Partners 섹션 — 현재: 사회공헌국 제공 "SOW GOOD PARTNER" 락업(꽃 로고 | 타이틀·슬로건 + 파트너 로고, ADR-070).
// 레이아웃: base 세로 스택(가로 구분선) / md+ 가로 1줄(세로 구분선). 타이틀은 wide 28px 상한 — 다른 섹션 제목(28~36px)보다 크지 않게(ADR-070 개정).
// 파트너가 늘면 아래 주석 처리한 기존 레이아웃(Figma 96:7897 — 헤딩 + 로고 줄)으로 복귀 예정.
import { SectionContainer } from "@/client/components/layout";

// 기존 레이아웃 복구 시 함께 해제
// import type { CSSProperties } from "react";

// 실제 협력 기관 — w/h=트림 원본 비율(CLS용), hBase=375~1439 표시높이 / hWide=1440+ 표시높이(기존 레이아웃 전용). 투명 여백 트림, 스크린리더용 alt.
// 기존 5곳(Figma 임시 자료)은 사회공헌국 요청으로 제거 — 실제 파트너는 일화 1곳
const PARTNERS = [
  { src: "/images/s5-partner-ilhwa.png", name: "일화", w: 669, h: 180, hBase: 40, hWide: 50 },
] as const;

export function PartnersSection() {
  return (
    <section
      id="partners"
      aria-labelledby="partners-heading"
      // 세로 패딩 — Figma 높이 역산 75/44/76/49 의 4px 스냅(76/44/76/48). wide<lg 역전은 Figma 원본 수치 — 재확인 docs/TODO.md
      className="w-full bg-gradient-to-b from-white to-surface-tint-soft py-19 md:py-11 lg:py-19 wide:py-12"
    >
      <SectionContainer>
        {/* SOW GOOD PARTNER 락업 — 사회공헌국 제공 시안(2026-10-12). 일화 로고는 시안대로 원색 */}
        <div className="flex flex-col items-center gap-5 md:flex-row md:justify-center md:gap-6 lg:gap-7 wide:gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 로고 */}
          <img
            src="/images/s5-partner-sow-good-flower.png"
            alt="사회공헌단 Sow Good"
            width={304}
            height={508}
            loading="lazy"
            className="h-24 w-auto md:h-20 lg:h-[88px] wide:h-24"
          />
          {/* 구분선 — base 가로 / md+ 세로 */}
          <span
            aria-hidden
            className="h-0.5 w-10 bg-tag-default md:h-14 md:w-0.5 lg:h-16 wide:h-18"
          />
          <div className="flex flex-col items-center gap-5 md:flex-row md:gap-6 lg:gap-8 wide:gap-10">
            <div className="text-center md:text-left">
              <h2
                id="partners-heading"
                className="text-2xl font-medium leading-none text-surface-dark lg:text-[26px] wide:text-[28px]"
              >
                SOW GOOD <span className="font-extrabold">PARTNER</span>
              </h2>
              {/* 시안 라벤더(#a98ed6, 대비 2.8:1)는 AA 미달 → brand-mid(4.7:1) */}
              <p className="mt-2 text-sm font-bold leading-none tracking-wide text-brand-mid lg:text-[15px] wide:mt-2.5 wide:text-base">
                TOGETHER FOR GOOD
              </p>
            </div>
            {PARTNERS.map((partner) => (
              // eslint-disable-next-line @next/next/no-img-element -- 정적 로고
              <img
                key={partner.src}
                src={partner.src}
                alt={partner.name}
                width={partner.w}
                height={partner.h}
                loading="lazy"
                className="h-9 w-auto max-w-full md:h-[30px] lg:h-[34px] wide:h-[38px]"
              />
            ))}
          </div>
        </div>

        {/* 기존 레이아웃 — 파트너가 늘면 복귀(사회공헌국 의향, 2026-10-12). 복구 시 위 락업 블록을 주석 처리하고 CSSProperties import 와 아래 두 블록을 해제.

        // 상단 — 보라 아이콘 + Sow Good 로고 + 카피
        <div className="flex flex-col items-center gap-[30px] text-surface-dark">
          // 아이콘 박스 radius — Figma 375 r8 / 768+ r20 (이전 비례 축소값 13 정정)
          <div className="flex size-[58px] items-center justify-center rounded-lg border-2 border-surface-dark bg-brand-pale md:size-[92px] md:rounded-[20px]">
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

        // 하단 파트너 로고 줄 — 단색 통일 + 판독 가능한 진하기(벤치마킹: 기아대책·charity: water 로고 띠). Figma 원본 opacity 0.23 은 판독 불가 → 85% (일화 단색 사용 승인, 전문가 5인 검토)
        <div className="mt-[70px] flex w-full flex-col items-center justify-center opacity-85 grayscale md:flex-row md:flex-wrap md:gap-6">
          {PARTNERS.map((partner) => (
            <div
              key={partner.src}
              className="flex h-[70px] w-[200px] shrink-0 flex-col items-center justify-center md:h-[100px] lg:w-auto"
            >
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
        */}
      </SectionContainer>
    </section>
  );
}
