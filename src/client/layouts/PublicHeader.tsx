// 사용자 사이트 헤더 — 클릭 가능 내비(ADR-038). 랜딩 3섹션(임팩트 데이터/쌀 나눔 소식/활동 스토리) 스무스 스크롤.
// md↑(768~): 3항목 알약 인라인(클릭) / <768: 현재 위치 알약(▾) → 드롭다운으로 3항목 선택. /news 등 비랜딩: 활동 스토리 고정.
// 앵커 스크롤 오프셋(스티키 헤더 높이)은 globals.css scroll-padding-top 단일 출처.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { SectionContainer } from "@/client/components/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScrollSpy } from "@/client/hooks/useScrollSpy";
import { cn } from "@/lib/utils";

import { HEADER_BAR_HEIGHT_CLASS } from "./header-height";

// "현재 위치" pill 공통 디자인 — 데스크탑 active 항목과 모바일 드롭다운 트리거 동일
const ACTIVE_PILL_CLASS =
  "border-[1.6px] border-brand-primary bg-white font-extrabold text-brand-primary";

type MenuItem = {
  id: string;
  label: string;
  /** 랜딩에서 스크롤·강조할 섹션 id (DOM 순서: kpi→story→stories) */
  section: string;
  /** 비랜딩(/news 등) 페이지에서 active 고정 */
  activeOnSubpage?: boolean;
};

// 순서·매핑(ADR-038): 임팩트 데이터→#kpi / 쌀 나눔 소식→#story / 활동 스토리→#stories.
// "활동 스토리"는 비랜딩(/news)에서도 active 고정 — 소식 피드 = 활동 스토리 영역.
const MENU: readonly MenuItem[] = [
  { id: "kpi", label: "임팩트 데이터", section: "kpi" },
  { id: "story", label: "쌀 나눔 소식", section: "story" },
  { id: "stories", label: "활동 스토리", section: "stories", activeOnSubpage: true },
] as const;

// DOM 순서(위→아래)로 전달 — 바닥 감지 시 마지막 섹션 정확도용 (useScrollSpy 참조)
const SCROLL_SECTIONS = MENU.map((m) => m.section);
const FIRST_LANDING_SECTION = SCROLL_SECTIONS[0]; // Hero 영역(스파이 null) 폴백

export function PublicHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const scrollActive = useScrollSpy(SCROLL_SECTIONS);

  // 랜딩: 스크롤 구간 → 해당 메뉴 / 비랜딩: 서브페이지 active 메뉴(활동 스토리)
  const activeMenuId = isLanding
    ? MENU.find((m) => m.section === (scrollActive ?? FIRST_LANDING_SECTION))?.id
    : MENU.find((m) => m.activeOnSubpage)?.id;
  // 모바일 트리거 라벨 — 현재 active 항목 (없으면 첫 항목 폴백)
  const activeItem = MENU.find((m) => m.id === activeMenuId) ?? MENU[0];

  // 랜딩=동일 페이지 해시(CSS scroll-behavior 스무스) / 비랜딩=홈 이동 후 앵커
  const hrefFor = (section: string) => (isLanding ? `#${section}` : `/#${section}`);

  return (
    <header className="sticky top-0 z-40 bg-brand-bright">
      {/* 바 — 높이는 header-height.ts SSoT, 밴드 폭(343/648/905/1200)은 SectionContainer 재사용 */}
      <SectionContainer
        className={cn("flex items-center justify-between", HEADER_BAR_HEIGHT_CLASS)}
      >
        <Link href="/" aria-label="Sow Good 홈으로" className="block shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset, next/image SVG dangerouslyAllowSVG 회피 */}
          <img
            src="/icons/sow-good-header-logo.svg"
            alt="Sow Good"
            width={80}
            height={53}
            // Figma 로고 높이 42(base·md)/53.3(lg·wide) 의 4px 스냅. w-auto 로 비율 유지
            className="h-10 w-auto lg:h-13"
          />
        </Link>

        {/* 데스크탑(md↑, 768~): 3항목 클릭 가능 알약 — active 자동 강조(스크롤스파이).
            item 박스고정 h33/40 — Figma Menu M/L, Tailwind 기본 lh 의 +4~7px 방지. 모바일 트리거와 BP 상호배타 */}
        <nav
          aria-label="주요 섹션 바로가기"
          className="hidden items-center gap-1 md:flex lg:gap-6"
        >
          {MENU.map((m) => {
            const isActive = m.id === activeMenuId;
            return (
              <Link
                key={m.id}
                href={hrefFor(m.section)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "inline-flex h-[33px] items-center rounded-full px-4 text-sm transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-white/80 lg:h-10 lg:px-5 lg:text-base",
                  isActive
                    ? ACTIVE_PILL_CLASS
                    : "font-bold text-white hover:bg-white/10",
                )}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        {/* 모바일(<768): 현재 위치 알약(▾) → 드롭다운 3항목 선택. Radix 가 Esc/바깥탭/포커스/aria-expanded 처리 */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`섹션 메뉴 열기 — 현재 위치 ${activeItem.label}`}
            className={cn(
              "flex h-[33px] items-center gap-1 rounded-full pr-3 pl-4 text-sm outline-none select-none focus-visible:ring-2 focus-visible:ring-white/80 md:hidden",
              ACTIVE_PILL_CLASS,
            )}
          >
            {activeItem.label}
            <ChevronDownIcon className="size-4" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[10rem]">
            {MENU.map((m) => {
              const isActive = m.id === activeMenuId;
              return (
                <DropdownMenuItem key={m.id} asChild className="cursor-pointer py-3">
                  <Link
                    href={hrefFor(m.section)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex items-center gap-2",
                      isActive && "font-semibold text-brand-primary",
                    )}
                  >
                    {/* 현재 위치 체크 — 비active 는 자리 유지(invisible)로 라벨 정렬 고정 */}
                    <CheckIcon
                      className={cn("size-4 text-brand-primary", !isActive && "invisible")}
                      aria-hidden
                    />
                    {m.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SectionContainer>
    </header>
  );
}
