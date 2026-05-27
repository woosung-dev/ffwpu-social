// 사용자 사이트 헤더 — Figma node 98:7101 정합 (bg-brand-bright #B769FF + 알약 active + SUIT Bold 흰 메뉴 + 검색 SVG). 4 메뉴 스크롤스파이 (랜딩) / "활동 스토리" 고정 (그 외 페이지), 1024↓ 햄버거. ADR-009·ADR-011 검색 미구현
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { useScrollSpy } from "@/client/hooks/useScrollSpy";
import { cn } from "@/lib/utils";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  /** 랜딩 페이지 섹션 앵커인가 (true) — 별도 라우트인가 (false) */
  isAnchor: boolean;
};

const MENU: readonly MenuItem[] = [
  { id: "kpi", label: "임팩트 데이터", href: "/#kpi", isAnchor: true },
  { id: "stories", label: "활동 스토리", href: "/#stories", isAnchor: true },
  { id: "news", label: "쌀 나눔 소식", href: "/news", isAnchor: false },
  { id: "story", label: "쌀나눔 프로젝트", href: "/#story", isAnchor: true },
] as const;

const SCROLL_SECTIONS = MENU.filter((m) => m.isAnchor).map((m) => m.id);

export function PublicHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const scrollActive = useScrollSpy(SCROLL_SECTIONS);
  const [open, setOpen] = useState(false);

  // 랜딩: 스크롤스파이 결과 / 비랜딩: "활동 스토리" 고정 (ADR-009)
  const activeId = isLanding ? scrollActive : "stories";

  return (
    <header className="sticky top-0 z-40 bg-brand-bright">
      {/* Figma: h-88 px-120 (lg) — 단일 레이어 padding clamp 적용 */}
      <div
        className="mx-auto flex h-16 items-center justify-between lg:h-[88px]"
        style={{
          paddingLeft: "clamp(1rem, 8.34vw, 120px)",
          paddingRight: "clamp(1rem, 8.34vw, 120px)",
        }}
      >
          <Link href="/" aria-label="Sow Good 홈으로" className="block shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset, next/image SVG dangerouslyAllowSVG 회피 */}
            <img
              src="/icons/sow-good-header-logo.svg"
              alt="Sow Good"
              width={80}
              height={53}
              className="h-10 w-auto lg:h-[53.333px]"
            />
          </Link>

          {/* Figma: gap-24, justify-end (메뉴 영역) */}
          <nav className="hidden flex-1 items-center justify-end gap-6 lg:flex">
            {MENU.map((m) => {
              const isActive = activeId === m.id;
              return (
                <Link
                  key={m.id}
                  href={m.href}
                  className={cn(
                    "rounded-full px-5 py-2.5 text-base transition-colors",
                    isActive
                      ? "border-[1.6px] border-brand-primary bg-white font-extrabold text-brand-primary"
                      : "font-bold text-white hover:bg-white/10",
                  )}
                >
                  {m.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:ml-6">
            {/* Figma: 42×42 hit area + 28 IconSet + 18.667 Icon */}
            <button
              type="button"
              disabled
              aria-label="검색"
              className="flex size-[42px] cursor-not-allowed items-center justify-center rounded-full text-white/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
              <img
                src="/icons/search-icon.svg"
                alt=""
                width={19}
                height={19}
                aria-hidden
                className="size-[19px]"
              />
            </button>
            <button
              type="button"
              aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={open}
              className="flex size-[42px] items-center justify-center text-white hover:text-brand-lavender lg:hidden"
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? (
                <X className="size-6" aria-hidden />
              ) : (
                <Menu className="size-6" aria-hidden />
              )}
            </button>
          </div>
      </div>

      {open && (
        <nav className="border-t border-white/20 bg-brand-bright lg:hidden">
          <ul className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {MENU.map((m) => {
              const isActive = activeId === m.id;
              return (
                <li key={m.id}>
                  <Link
                    href={m.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2.5 text-base transition-colors",
                      isActive
                        ? "bg-white font-extrabold text-brand-primary"
                        : "font-bold text-white/70 hover:bg-white/10",
                    )}
                  >
                    {m.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
