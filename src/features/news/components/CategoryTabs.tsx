// 카테고리 탭 — categories 테이블(동적) 기반. "전체"는 가상 UI 필터 (ALL_CATEGORY_SLUG). Figma node 125:9134: SUIT Medium 17px, active brand-vivid 하단 라인
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
      <ul className="flex min-w-max items-center gap-1 border-b border-border">
        {tabs.map((tab) => {
          const isActive = tab.slug === selected;
          return (
            <li key={tab.slug}>
              <button
                type="button"
                onClick={() => onChangeAction?.(tab.slug)}
                aria-pressed={isActive}
                className={cn(
                  "relative whitespace-nowrap px-4 py-3 text-[17px] font-medium transition-colors",
                  isActive
                    ? "text-ink-strong"
                    : "text-ink-subtle hover:text-foreground",
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
