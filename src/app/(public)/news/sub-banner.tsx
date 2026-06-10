// 소식 페이지 서브 배너 — Figma 125:8915/135:12492 정합 (bg #f2eff4)
// 데스크탑: 로고 + 세로 구분선 + 문구 가로 배치 / 모바일: 로고 → 가로 구분선 → 문구 세로 스택
import Image from "next/image";

import { SectionContainer } from "@/client/components/layout";

export function SubBanner() {
  return (
    // 풀블리드 배경 + 내부 콘텐츠는 랜딩과 동일 밴드 고정폭(SectionContainer)으로 정렬
    <section aria-label="Sow Good 소개" className="bg-surface-news-banner">
      {/* md py40: 로고 116×46 축소 후 카피 행(h52)이 높이 결정 — 52+80=132 로 Figma 배너 h132 정합. lg+ 는 로고 63.8 기준 py34 → 131.8 */}
      <SectionContainer className="py-6 md:py-10 lg:py-[34px]">
        {/* 모바일 (< md): 세로 스택 — Figma 135:12492 정합 */}
        <div className="flex flex-col gap-4 md:hidden">
          <Image
            src="/icons/sow-good-banner-logo.svg"
            alt="Sow Good"
            width={116}
            height={46}
            className="h-auto w-[116px]"
          />
          <div className="h-px w-32 bg-brand-soft/40" aria-hidden />
          <p className="text-[14px] font-medium leading-relaxed text-brand-soft">
            <span className="font-black text-brand-primary">Sow Good</span>{" "}
            가족이 아니어도, 같은 동네가 아니어도,
            <br />
            밥상을 함께하는 사람이 있다면 우리는 이미 식구입니다.
          </p>
        </div>

        {/* 태블릿 이상 (md+): 가로 배치 — Figma 125:8915 정합. 768 은 로고 116·gap 30, 1025+ 는 로고 160·gap 40 (audit 2026-06-10) */}
        <div className="hidden md:flex md:items-center md:justify-center md:gap-[30px] lg:gap-10">
          <Image
            src="/icons/sow-good-banner-logo.svg"
            alt="Sow Good"
            width={160}
            height={64}
            className="h-auto w-[116px] shrink-0 lg:w-[160px]"
          />
          <div aria-hidden className="h-9 w-px shrink-0 bg-brand-soft/40" />
          <p className="break-keep text-[16px] font-medium leading-relaxed text-brand-soft">
            <span className="font-black text-brand-primary">Sow Good</span>{" "}
            가족이 아니어도, 같은 동네가 아니어도,
            <br />
            밥상을 함께하는 사람이 있다면 우리는 이미 식구입니다.
          </p>
        </div>
      </SectionContainer>
    </section>
  );
}
