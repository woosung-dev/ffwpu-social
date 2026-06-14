// 카테고리 탭 — Figma 125:9134 + 협회홈 463-2827. SUIT 17px, 높이 46(mobile)/56(md+) 균일.
// 탭 최소폭 140(mobile)/160(md+) — 사용자 요청 2026-06-14 (border-box, px-6 와 함께 적용·content 는 justify-center).
// active/hover 동일 모습: brand-vivid 하단 2px 라인이 origin-center scale-x 로 양쪽 확장(center-out) + Medium·ink-strong
"use client";

import { cn } from "@/lib/utils";
import { ALL_CATEGORY_SLUG } from "../constants";

export type CategoryTabItem = {
  slug: string;
  name: string;
};

type Props = {
  /** categories 테이블에서 내려온 활성 카테고리 (정렬됨) */
  categories: readonly CategoryTabItem[];
  /** 현재 선택된 slug ("all" 또는 카테고리 slug) */
  selected: string;
  onChangeAction?: (slug: string) => void;
};

export function CategoryTabs({ categories, selected, onChangeAction }: Props) {
  const tabs: CategoryTabItem[] = [
    { slug: ALL_CATEGORY_SLUG, name: "전체" },
    ...categories,
  ];

  return (
    <nav aria-label="카테고리" className="w-full overflow-x-auto">
      {/* 베이스라인 #D1D5DB — underline 기준선 가독성 (familyfed PageTabs) */}
      <ul className="flex min-w-max items-end border-b border-[#D1D5DB]">
        {tabs.map((tab) => {
          const isActive = tab.slug === selected;
          return (
            <li key={tab.slug}>
              <button
                type="button"
                onClick={() => onChangeAction?.(tab.slug)}
                aria-pressed={isActive}
                className={cn(
                  "relative flex h-[46px] min-w-[140px] items-center justify-center whitespace-nowrap px-6 text-[17px] transition-[color,font-weight] duration-500 md:h-14 md:min-w-[160px]",
                  // 하단 라인 — origin-center scale-x + opacity 로 양쪽 확장(center-out). active 항상 노출 / inactive 는 hover 시 노출 = active 와 동일 모습
                  "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-center after:bg-brand-vivid after:transition-all after:duration-300 after:content-[''] motion-reduce:after:transition-none",
                  isActive
                    ? "font-medium text-ink-strong after:scale-x-100 after:opacity-100"
                    : "font-normal text-ink-date after:scale-x-0 after:opacity-0 hover:font-medium hover:text-ink-strong hover:after:scale-x-100 hover:after:opacity-100",
                )}
              >
                {tab.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
