// 사용자 페이지 스크롤 위치 → active section id 추적 (헤더 active 인디케이터·클릭 내비용, ADR-037→038)
// 방식: 화면 상단 기준선(헤더 아래 LINE_RATIO 지점)을 "통과한 마지막 섹션"이 active
//       = Bootstrap Scrollspy 패턴. scroll + getBoundingClientRect + rAF — 항상 하나 active, 양방향 무진동.
"use client";

import { useEffect, useState } from "react";

import { HEADER_BAR_HEIGHT_PX } from "@/client/layouts/header-height";

// 기준선 = 헤더 하단에서 (가용 높이 × LINE_RATIO) 만큼 더 내려간 지점.
// 헤더 높이는 header-height.ts SSoT. md(72) 구간은 기준선 휴리스틱 특성상 base 값으로 근사.
const HEADER_H_MOBILE = HEADER_BAR_HEIGHT_PX.base;
const HEADER_H_DESKTOP = HEADER_BAR_HEIGHT_PX.lg;
const DESKTOP_MQ = "(min-width: 1024px)"; // lg — 헤더가 88px 로 커지는 분기
const LINE_RATIO = 0.28; // 헤더 아래 가용 높이의 28% 지점에 기준선 (docs 사이트 체감값)
const HYSTERESIS = 8; // 경계 1~2px 진동 흡수용 데드밴드(px)

/**
 * sectionIds 는 DOM 순서(위→아래)로 전달 — 마지막 원소가 페이지 최하단 스파이 섹션이어야
 * 바닥 도달 강제 active 가 정확하다. 각 섹션 컴포넌트에 해당 id 명시 필요.
 * 반환 null = 첫 섹션 진입 전(Hero 구간) — 호출 측이 폴백 처리.
 */
export function useScrollSpy(sectionIds: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const idsKey = sectionIds.join(",");

  useEffect(() => {
    const ids = idsKey.split(",").filter(Boolean);
    if (ids.length === 0) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const mql = window.matchMedia(DESKTOP_MQ);
    let rafId = 0;
    let lastId: string | null = null;

    const computeActive = (): string | null => {
      const headerH = mql.matches ? HEADER_H_DESKTOP : HEADER_H_MOBILE;
      const lineY = headerH + (window.innerHeight - headerH) * LINE_RATIO;

      // 페이지 최하단: 마지막 섹션이 짧아 기준선까지 못 올라와도 강제 active.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) return elements[elements.length - 1].id;

      // "top 이 기준선을 통과(위로 올라간) 마지막 섹션". DOM 순서 순회라 마지막 충족이 정답.
      let current: string | null = null;
      for (const el of elements) {
        // hysteresis: 이미 active 인 섹션은 기준선보다 살짝 아래까지 active 유지.
        const bias = el.id === lastId ? HYSTERESIS : 0;
        if (el.getBoundingClientRect().top <= lineY + bias) current = el.id;
        else break; // top 은 DOM 순서로 증가 — 한 번 실패하면 이후도 실패
      }
      return current; // null = Hero 구간 (호출 측 폴백)
    };

    const update = () => {
      const next = computeActive();
      if (next !== lastId) {
        lastId = next;
        setActiveId(next);
      }
    };

    // scroll 마다 setState 금지 — rAF 로 프레임당 1회 coalesce.
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    mql.addEventListener("change", onScroll);
    // Suspense 스트리밍·이미지/폰트 로드로 섹션 위치가 mount 후 바뀌면 scroll 이벤트 없이 active 가 stale.
    // 문서 크기 변화를 관찰해 재계산 — 초기 최상단 인디케이터가 잘못 잡히는 문제 방지.
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.documentElement);
    update(); // 마운트 시점 스크롤 위치 반영

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mql.removeEventListener("change", onScroll);
      ro.disconnect();
    };
  }, [idsKey]);

  return activeId;
}
