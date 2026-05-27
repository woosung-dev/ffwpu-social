// 사용자 사이트 헤더 — 4 메뉴 스크롤스파이 (랜딩) / "활동 스토리" 고정 (그 외 페이지), 1024↓ 햄버거. ADR-009·ADR-011 검색 미구현 (아이콘만)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";

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
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:h-20 lg:px-8">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight text-brand-primary lg:text-xl"
        >
          Sow Good
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {MENU.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className={cn(
                "text-sm transition-colors",
                activeId === m.id
                  ? "font-extrabold text-brand-primary"
                  : "font-bold text-foreground hover:text-brand-primary",
              )}
            >
              {m.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled
            aria-label="검색 (준비 중)"
            className="cursor-not-allowed text-foreground/40"
          >
            <Search className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            className="text-foreground hover:text-brand-primary lg:hidden"
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
        <nav className="border-t border-border bg-white lg:hidden">
          <ul className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {MENU.map((m) => (
              <li key={m.id}>
                <Link
                  href={m.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block py-2 text-base",
                    activeId === m.id
                      ? "font-extrabold text-brand-primary"
                      : "font-bold text-foreground",
                  )}
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
