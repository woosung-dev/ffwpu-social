// 카테고리 탭 — Figma 125:9134 + familyfed 463-2827 hover. SUIT 17px, 높이 46(mobile)/56(md+) 균일.
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
      <ul className="flex min-w-max items-end border-b border-border">
        {tabs.map((tab) => {
          const isActive = tab.slug === selected;
          return (
            <li key={tab.slug}>
              <button
                type="button"
                onClick={() => onChangeAction?.(tab.slug)}
                aria-pressed={isActive}
                className={cn(
                  "relative flex h-[46px] items-center justify-center whitespace-nowrap px-[10px] text-[17px] transition-colors md:h-14",
                  // 하단 라인 — origin-center scale-x 로 양쪽 확장(center-out). active 항상 노출 / inactive 는 hover 시 노출 = active 와 동일 모습
                  "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-center after:bg-brand-vivid after:transition-transform after:duration-300 after:content-[''] motion-reduce:after:transition-none",
                  isActive
                    ? "font-medium text-ink-strong after:scale-x-100"
                    : "font-normal text-ink-date after:scale-x-0 hover:font-medium hover:text-ink-strong hover:after:scale-x-100",
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
