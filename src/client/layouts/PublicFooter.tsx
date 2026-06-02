// 사용자 사이트 푸터 — Figma 126:10783(모바일 70px)·126:10897(데스크탑 99px). 다크 배경 + BI 로고(26→39) + 세로 17px 라인 + 카피라이트 SUIT SemiBold(모바일 10px·데스크탑 16px) #F0E1FF. 1200px 가운데 정렬. H-2(법인명) 미회신 = 미표시 유지 (docs/TODO.md)
import { SowGoodFooterLogo } from "@/client/components/icons/SowGoodFooterLogo";

export function PublicFooter() {
  return (
    <footer className="w-full bg-surface-dark text-ink-on-purple">
      <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-2.5 px-4 py-[22px] lg:gap-5 lg:px-0 lg:py-[30px]">
        <SowGoodFooterLogo className="h-[26px] w-auto shrink-0 lg:h-[39px]" />
        <div aria-hidden className="h-[17px] w-px bg-ink-on-purple/40" />
        {/* 법인명(H-2 미회신) 회신 시 카피라이트 앞 또는 뒤에 추가 */}
        <p className="text-[10px] font-semibold whitespace-nowrap lg:text-base">
          COPYRIGHT 2026 © Sow Good All rights reserved
        </p>
      </div>
    </footer>
  );
}
