// 사용자 페이지 스크롤 위치 → active section id 추적 (헤더 4 메뉴 active 표시용, ADR-009)
"use client";

import { useEffect, useState } from "react";

type Options = {
  /** IntersectionObserver rootMargin — 기본은 화면 중앙 ±40% 밴드만 active */
  rootMargin?: string;
  /** IntersectionObserver threshold (기본 0 — rootMargin 으로 판정) */
  threshold?: number;
};

/**
 * sectionIds 가 DOM 에 마운트되어 있어야 한다 (Section 컴포넌트에 id 명시).
 * IDs 배열은 안정 reference 가 아니어도 안전 — 내부에서 join(",") 으로 dep 안정화.
 */
export function useScrollSpy(
  sectionIds: readonly string[],
  options?: Options,
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const idsKey = sectionIds.join(",");
  const rootMargin = options?.rootMargin ?? "-40% 0px -40% 0px";
  const threshold = options?.threshold ?? 0;

  useEffect(() => {
    const ids = idsKey.split(",").filter(Boolean);
    if (ids.length === 0) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          );
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin, threshold },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [idsKey, rootMargin, threshold]);

  return activeId;
}
