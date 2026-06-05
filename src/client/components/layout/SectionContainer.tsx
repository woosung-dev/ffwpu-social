// 섹션 콘텐츠 공통 래퍼 — Figma max-width 컨테이너. 콘텐츠 1200 고정·중앙, gutter 만 축소(겉만 줄어듦).
// max-w-[1320px](=콘텐츠1200 + md gutter120) + px-4(16)/md:px-[60px] → 콘텐츠폭 base343/md648/lg905/(≥1320)1200,
//   gutter 1440=120·1920=360 (Figma 1920 331:7984·1440 96:7689 전 섹션 Contents=1200 검증).
// 별개 주의: `wide:`(1440) 커스텀 breakpoint 가 Tailwind v4 ^4.0.0 에서 md/lg 뒤가 아닌 앞에 정렬돼 override 안 됨 →
//   본 컨테이너는 base+md 만 써서 무관하나, 향후 `lg:x wide:y` 조합은 깨짐(2026-06-05 확인, docs/design.md).
// 섹션별 flex/gap 은 className 으로 주입. (ADR-024 client 영역 공통 컴포넌트)
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children: ReactNode;
};

export function SectionContainer({ className, children }: Props) {
  return (
    <div className={cn("mx-auto w-full max-w-[1320px] px-4 md:px-[60px]", className)}>
      {children}
    </div>
  );
}
