// 섹션 콘텐츠 공통 래퍼 — Figma 데스크탑 콘텐츠 1200px 중앙 정렬 + 반응형 좌우 거터.
// max-w-[1264px] = 콘텐츠 1200 + lg:px-8(좌우 64) 라 1440 에서 콘텐츠 1200·거터 120px(Figma 96:7689 일치),
// 1024~1199 에서도 거터 32px 확보 → 기존 lg:px-0 가 만들던 "거터 0(화면 끝 닿음)" 버그 교정.
// 섹션별 flex/gap 은 className 으로 주입. (ADR-024 client 영역 공통 컴포넌트)
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children: ReactNode;
};

export function SectionContainer({ className, children }: Props) {
  return (
    <div className={cn("mx-auto w-full max-w-[1264px] px-4 lg:px-8", className)}>
      {children}
    </div>
  );
}
