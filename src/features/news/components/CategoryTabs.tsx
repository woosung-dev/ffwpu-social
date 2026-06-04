// 카테고리 탭 — Figma 125:9134 정합: SUIT Medium 17px, active h-56px + brand-vivid 하단 2px 라인, inactive h-46px
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
            <li key={tab.slug} className={cn(isActive ? "h-14" : "h-[46px]")}>
              <button
                type="button"
                onClick={() => onChangeAction?.(tab.slug)}
                aria-pressed={isActive}
                className={cn(
                  "relative flex h-full items-center justify-center whitespace-nowrap px-[10px] text-[17px] transition-colors",
                  isActive
                    ? "font-medium text-ink-strong"
                    : "font-normal text-ink-date hover:text-foreground",
                )}
              >
                {tab.name}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-vivid"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
