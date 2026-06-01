// 사용자 사이트 푸터 — Figma 126:10897 (1440×99). 다크 배경 + BI 로고 39 + 세로 라인 + 카피라이트 SUIT SemiBold 16px #F0E1FF. 1200px 가운데 정렬. H-2(법인명) 미회신 = 미표시 유지 (docs/TODO.md)
import { SowGoodFooterLogo } from "@/client/components/icons/SowGoodFooterLogo";

export function PublicFooter() {
  return (
    <footer className="w-full bg-surface-dark">
      <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-4 px-4 py-7 lg:px-0">
        <SowGoodFooterLogo className="h-[39px] w-auto shrink-0" />
        <div aria-hidden className="h-6 w-px bg-ink-on-purple/40" />
        <p className="text-base font-semibold text-ink-on-purple">
          COPYRIGHT 2026 © Sow Good All rights reserved.
        </p>
      </div>
    </footer>
  );
}
