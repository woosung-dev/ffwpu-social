// 섹션 콘텐츠 공통 래퍼 — Figma 4-BP max-width 컨테이너 (Contents x좌표 역산, SSoT docs/design.md).
// 콘텐츠 폭: base 343 / md 648 / lg 905~1319 / wide 1200~1680 (>1920 1680 고정).
// 좌우 패딩: base 16 / md·lg 60 / wide 120. max-w-1920 로 wide 콘텐츠 상한 1680.
// 섹션별 flex/gap 은 className 으로 주입. (ADR-024 client 영역 공통 컴포넌트)
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children: ReactNode;
};

export function SectionContainer({ className, children }: Props) {
  return (
    <div className={cn("mx-auto w-full max-w-[1920px] px-4 md:px-[60px] wide:px-[120px]", className)}>
      {children}
    </div>
  );
}
