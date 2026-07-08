// 페이지네이션 — Figma node 125:9154 명세 정합. 30×32 셀 연접(gap 0), SUIT Medium 14px (active brand-primary / 비활성 ink-subtle Regular),
// 화살표는 인라인 셰브론 SVG — currentColor 로 상태색 제어 (enabled #6B7280 / disabled #BAC2D0). <img> 는 currentColor 상속 불가라 인라인 필수
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

  const baseCell = "flex h-8 w-[30px] items-center justify-center rounded-lg";

  const renderArrow = (
    target: number,
    direction: "left" | "right",
    disabled: boolean,
  ) => {
    // 셰브론 5×9 (Figma viewBox 5.88×9.88, stroke 0.875) — stroke=currentColor 로 셀의 text 색 상속.
    // path d 는 public/icons/pagination-arrow-*.svg 수동 교정본과 동일 (방향 변경 금지)
    const icon = (
      <svg
        viewBox="0 0 5.875 9.87501"
        fill="none"
        aria-hidden
        className="h-[9px] w-[5px]"
      >
        <path
          d={
            direction === "left"
              ? "M5.4375 0.437504L0.437504 4.9375L5.4375 9.4375"
              : "M0.437504 0.437504L5.4375 4.9375L0.437504 9.4375"
          }
          stroke="currentColor"
          strokeWidth="0.875"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
    const label = direction === "left" ? "이전 페이지" : "다음 페이지";
    if (disabled) {
      return (
        <span
          aria-label={label}
          aria-disabled
          className={cn(baseCell, "cursor-not-allowed text-[#BAC2D0]")}
        >
          {icon}
        </span>
      );
    }
    if (hrefForAction) {
      return (
        <Link
          href={hrefForAction(target)}
          aria-label={label}
          className={cn(baseCell, "text-ink-subtle")}
        >
          {icon}
        </Link>
      );
    }
    return (
      <button
        type="button"
        aria-label={label}
        onClick={() => onPageChangeAction?.(target)}
        className={cn(baseCell, "text-ink-subtle")}
      >
        {icon}
      </button>
    );
  };

  const renderNumber = (p: number) => {
    const isActive = p === page;
    const cls = cn(
      baseCell,
      "text-sm transition-colors",
      isActive
        ? "font-medium text-brand-primary"
        : "font-normal text-ink-subtle hover:text-foreground",
    );
    if (hrefForAction) {
      return (
        <Link
          href={hrefForAction(p)}
          aria-current={isActive ? "page" : undefined}
          className={cls}
        >
          {p}
        </Link>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onPageChangeAction?.(p)}
        aria-current={isActive ? "page" : undefined}
        className={cls}
      >
        {p}
      </button>
    );
  };

  return (
    <nav aria-label="페이지" className="flex items-center">
      {renderArrow(Math.max(1, page - 1), "left", page <= 1)}
      <ul className="flex items-center">
        {pages.map((p, i) =>
          p === -1 ? (
            <li
              key={`gap-${i}`}
              aria-hidden
              className={cn(baseCell, "text-sm font-normal text-ink-subtle")}
            >
              …
            </li>
          ) : (
            <li key={p}>{renderNumber(p)}</li>
          ),
        )}
      </ul>
      {renderArrow(
        Math.min(totalPages, page + 1),
        "right",
        page >= totalPages,
      )}
    </nav>
  );
}
