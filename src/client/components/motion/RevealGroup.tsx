// 그룹 진입 시 내부 [data-reveal] 요소들을 일괄 페이드업(표시중인 것만 DOM 순서 stagger).
// Reveal(요소 래핑)과 달리 자식 구조를 안 바꾸고 기존 요소에 data-reveal "속성"만 부여한 카드들을 한 옵저버로 발동 —
// KPI 벤토처럼 정밀 flex/grid 레이아웃을 보존해야 할 때 사용. Suspense 내부에 두어 콘텐츠 도착 후 관찰.
"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type Props = {
  /** 표시중 자식 간 stagger 간격(ms). 0 이면 동시 */
  staggerMs?: number;
  /** stagger 최대 인덱스 캡 — 너무 길어지지 않게 */
  maxSteps?: number;
  className?: string;
  children: ReactNode;
};

export function RevealGroup({
  staggerMs = 60,
  maxSteps = 5,
  className,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const targets = el.querySelectorAll<HTMLElement>(
            "[data-reveal]:not([data-revealed])",
          );
          // 표시중(display:none 변형 제외)인 것만 순서대로 stagger. 숨김 변형도 revealed 부여(리사이즈 후 가림 방지)하되 delay 0.
          let visibleIdx = 0;
          targets.forEach((c) => {
            const visible = c.getClientRects().length > 0;
            const step = visible ? Math.min(visibleIdx, maxSteps) : 0;
            if (staggerMs) c.style.setProperty("--reveal-delay", `${step * staggerMs}ms`);
            if (visible) visibleIdx++;
            c.dataset.revealed = "";
          });
          observer.disconnect(); // 1회성
        }
      },
      { threshold: 0, rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [staggerMs, maxSteps]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
