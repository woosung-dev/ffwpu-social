// 사용자 사이트 헤더 — Figma Header 컴포넌트 4 variant 정합. bg-brand-bright #B769FF + 알약 active. 4 메뉴 스크롤스파이(랜딩) / "활동 스토리" 고정(그 외). md↑(768~) 풀 4메뉴 내비, <768 활성 섹션 pill→드롭다운. ADR-009·검색 미구현
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { useScrollSpy } from "@/client/hooks/useScrollSpy";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  // 랜딩: 스크롤스파이 결과 / 비랜딩: "활동 스토리" 고정 (ADR-009)
  const activeId = isLanding ? scrollActive : "stories";
  // 모바일 pill 라벨 — 활성 섹션, 최상단(스파이 null)에서는 첫 메뉴로 폴백 (Figma 기본 상태)
  const activeItem = MENU.find((m) => m.id === activeId) ?? MENU[0];

  return (
    <header className="sticky top-0 z-40 bg-brand-bright">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:h-20 lg:px-20">
        <Link href="/" aria-label="Sow Good 홈으로" className="block shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset, next/image SVG dangerouslyAllowSVG 회피 */}
          <img
            src="/icons/sow-good-header-logo.svg"
            alt="Sow Good"
            width={80}
            height={53}
            className="h-10 w-auto lg:h-12"
          />
        </Link>

        {/* 데스크탑(md↑, 768~): 풀 4메뉴 내비 — Figma Header 768~1024 variant 도 풀 노출(단일 pill 은 <768 only). md 는 14px/좁은 간격(M size), lg↑ 16px(L size) */}
        <nav className="hidden items-center gap-3 md:flex lg:gap-6">
          {MENU.map((m) => {
            const isActive = activeItem.id === m.id;
            return (
              <Link
                key={m.id}
                href={m.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm transition-colors lg:px-5 lg:py-2.5 lg:text-base",
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

        {/* 모바일(<768): 활성 섹션 pill → 탭 시 전체 섹션 드롭다운 (Figma 375~767 variant) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`현재 위치 ${activeItem.label} — 섹션 메뉴 열기`}
              className="flex h-11 items-center gap-1.5 rounded-full border-[1.6px] border-brand-primary bg-white pr-3 pl-4 text-base font-extrabold text-brand-primary md:hidden"
            >
              <span>{activeItem.label}</span>
              <ChevronDown className="size-4 shrink-0" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" sideOffset={8} className="min-w-[200px]">
            {MENU.map((m) => {
              const isActive = activeItem.id === m.id;
              return (
                <DropdownMenuItem
                  key={m.id}
                  asChild
                  className={cn(
                    "min-h-11 cursor-pointer px-3 text-base",
                    isActive
                      ? "font-extrabold text-brand-primary focus:text-brand-primary"
                      : "font-medium",
                  )}
                >
                  <Link
                    href={m.href}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {m.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          disabled
          aria-label="검색 (준비 중)"
          className="shrink-0 cursor-not-allowed text-white/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
          <img
            src="/icons/search-icon.svg"
            alt=""
            width={20}
            height={20}
            aria-hidden
            className="size-5"
          />
        </button>
      </div>
    </header>
  );
}
