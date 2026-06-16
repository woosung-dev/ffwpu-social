// 스크롤 진입 시 1회 "아래→위 페이드업" 래퍼 — 무의존 IntersectionObserver + CSS([data-reveal], globals.css).
// reduced-motion·노스크립트는 CSS @media 가 즉시 표시. delayMs 로 그룹 stagger(예: 카드 i*60ms). 랜딩 전용.
"use client";

import type { CSSProperties, ReactNode } from "react";

import { useInViewReveal } from "@/client/hooks/useInViewReveal";

type Props = {
  /** 그룹 stagger 지연(ms) — 같은 묶음 카드에 i*60 식으로 부여 */
  delayMs?: number;
  className?: string;
  children: ReactNode;
};

export function Reveal({ delayMs = 0, className, children }: Props) {
  const ref = useInViewReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-reveal=""
      style={
        delayMs
          ? ({ "--reveal-delay": `${delayMs}ms` } as CSSProperties)
          : undefined
      }
      className={className}
    >
      {children}
    </div>
  );
}
