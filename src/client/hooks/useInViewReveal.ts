// 스크롤 진입 시 1회 data-revealed 부여 후 관찰 해제 — 페이드업 리빌(globals.css [data-reveal]) 트리거.
// reduced-motion·노스크립트는 CSS(@media)가 즉시 표시 처리 — 훅은 "표시 트리거"만 담당(스타일/타이밍은 CSS SSoT).
"use client";

import { useEffect, useRef } from "react";

export function useInViewReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    // 이미 표시됐으면(BP 토글로 인한 리마운트 등) 재관찰 불필요
    if (!el || el.dataset.revealed != null) return;

    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "";
          observer.unobserve(entry.target); // 1회성 — 재진입 시 반복 애니메이션 방지
        }
      },
      // 살짝 들어왔을 때(15%) + 하단 10% 여백 안에 들어와야 트리거 → 화면 가장자리 깜빡임 방지
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
