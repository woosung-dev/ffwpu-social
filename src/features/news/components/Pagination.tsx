// 페이지네이션 — Prev / 번호 / Next. 9개/페이지 기본 (listNewsQuerySchema limit 기본값). URL 연동은 D-3
"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  /** 페이지 번호 → href 변환. 라우팅 Link 모드 */
  hrefForAction?: (page: number) => string;
  /** 핸들러 모드 (라우팅 없이 자체 처리). hrefForAction 없을 때 button 으로 전환 */
  onPageChangeAction?: (page: number) => void;
};

function pageNumbers(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, -1, total];
  if (current >= total - 3)
    return [1, -1, total - 4, total - 3, total - 2, total - 1, total];
  return [1, -1, current - 1, current, current + 1, -1, total];
}

export function Pagination({
  page,
  totalPages,
  hrefForAction,
  onPageChangeAction,
}: Props) {
  if (totalPages <= 1) return null;
  const pages = pageNumbers(page, totalPages);

  const renderItem = (p: number, label: string, disabled: boolean) => {
    const isActive = p === page && !disabled;
    const base = cn(
      "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm transition-colors",
      isActive
        ? "font-bold text-brand-primary"
        : disabled
          ? "cursor-not-allowed text-ink-subtle opacity-50"
          : "font-medium text-ink-subtle hover:bg-surface-soft hover:text-foreground",
    );
    if (disabled) {
      return (
        <span aria-disabled className={base}>
          {label}
        </span>
      );
    }
    if (hrefForAction) {
      return (
        <Link
          href={hrefForAction(p)}
          aria-current={isActive ? "page" : undefined}
          className={base}
        >
          {label}
        </Link>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onPageChangeAction?.(p)}
        aria-current={isActive ? "page" : undefined}
        className={base}
      >
        {label}
      </button>
    );
  };

  return (
    <nav aria-label="페이지" className="flex items-center justify-center gap-1">
      {renderItem(Math.max(1, page - 1), "이전", page <= 1)}
      <ul className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === -1 ? (
            <li
              key={`gap-${i}`}
              aria-hidden
              className="px-1 text-sm text-ink-subtle"
            >
              …
            </li>
          ) : (
            <li key={p}>{renderItem(p, String(p), false)}</li>
          ),
        )}
      </ul>
      {renderItem(Math.min(totalPages, page + 1), "다음", page >= totalPages)}
    </nav>
  );
}
