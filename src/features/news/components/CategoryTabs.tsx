// 카테고리 5개 탭 — ADR-007 enum 고정 (전체/가족치유/지역봉사/환경캠페인/쌀나눔). URL 파라미터 연동은 D-3 에 useSearchParams 사용
"use client";

import { cn } from "@/lib/utils";
import type { NewsCategoryValue } from "../schemas";

type Props = {
  selected: NewsCategoryValue;
  onChangeAction?: (next: NewsCategoryValue) => void;
};

const TABS: ReadonlyArray<{ value: NewsCategoryValue; label: string }> = [
  { value: "all", label: "전체" },
  { value: "family_healing", label: "가족 치유" },
  { value: "local_volunteer", label: "지역 봉사" },
  { value: "environment", label: "환경 캠페인" },
  { value: "rice_sharing", label: "쌀 나눔" },
];

export function CategoryTabs({ selected, onChangeAction }: Props) {
  return (
    <nav
      aria-label="카테고리"
      className="w-full overflow-x-auto"
    >
      <ul className="flex min-w-max items-center gap-1 border-b border-border">
        {TABS.map((tab) => {
          const isActive = tab.value === selected;
          return (
            <li key={tab.value}>
              <button
                type="button"
                onClick={() => onChangeAction?.(tab.value)}
                aria-pressed={isActive}
                className={cn(
                  "relative whitespace-nowrap px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "font-extrabold text-brand-vivid"
                    : "font-medium text-ink-subtle hover:text-foreground",
                )}
              >
                {tab.label}
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
