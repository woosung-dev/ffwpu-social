// 사용자 사이트 헤더 — 클릭 가능 내비(ADR-038). 랜딩 3섹션 스무스 스크롤 + "활동 스토리"는 /news 이동.
// md↑(768~): 4항목 알약 인라인(클릭) / <768: 현재 위치 알약(▾) → 드롭다운으로 선택. /news 등 비랜딩: 활동 스토리 고정.
// 앵커 스크롤 오프셋 = globals.css scroll-padding-top(헤더 높이 베이스) + 각 섹션 SectionContainer 의 scroll-mt(섹션별 호흡 간격·Story 스티커 클리어런스, ADR-038). 콘텐츠 기준 착지.
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
  section?: string;
  /** 직접 이동 링크(예: /news) — 클릭 시 이동. section 과 병용 가능(스크롤 강조 + 클릭 이동) */
  href?: string;
  /** 비랜딩(/news 등) 페이지에서 active 고정 */
  activeOnSubpage?: boolean;
};

// 매핑(ADR-038 개정): 숫자로 보는 우리의 변화→#kpi / 밥이 사랑이다→#story / 활동 스토리→/news(클릭) + #stories(카드 그리드) 스크롤 시 강조 / 공지사항→/notices.
// "메인 스토리" 메뉴 제거 — 카드 그리드(#stories) 스크롤 강조를 "활동 스토리"로 흡수(section+href 병용). 공지사항 = Figma 공지 목록(1103:7882) 헤더 항목, ADR-042 케이스 A.
const MENU: readonly MenuItem[] = [
  { id: "kpi", label: "숫자로 보는 우리의 변화", section: "kpi" },
  { id: "story", label: "밥이 사랑이다", section: "story" },
  { id: "news", label: "활동 스토리", href: "/news", section: "stories", activeOnSubpage: true },
  { id: "notices", label: "공지사항", href: "/notices" },
] as const;

// DOM 순서(위→아래)로 전달 — 바닥 감지 시 마지막 섹션 정확도용 (useScrollSpy 참조). href 항목 제외
const SCROLL_SECTIONS = MENU.map((m) => m.section).filter(
  (s): s is string => Boolean(s),
);
const FIRST_LANDING_SECTION = SCROLL_SECTIONS[0]; // Hero 영역(스파이 null) 폴백

export function PublicHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const scrollActive = useScrollSpy(SCROLL_SECTIONS);

  // 랜딩: 스크롤 구간 → 해당 메뉴 / 비랜딩: 현재 경로와 일치하는 href 메뉴 (서브페이지 2개+ 구분 — /news·/notices).
  // 매칭 없는 비랜딩 경로는 activeOnSubpage 항목(활동 스토리) 폴백 — 기존 동작 보존
  const activeMenuId = isLanding
    ? MENU.find((m) => m.section === (scrollActive ?? FIRST_LANDING_SECTION))?.id
    : (MENU.find(
        (m) => m.href && (pathname === m.href || pathname.startsWith(`${m.href}/`)),
      )?.id ?? MENU.find((m) => m.activeOnSubpage)?.id);
  // 모바일 트리거 라벨 — 현재 active 항목 (없으면 첫 항목 폴백)
  const activeItem = MENU.find((m) => m.id === activeMenuId) ?? MENU[0];

  // section 항목: 랜딩=해시(CSS 스무스), 비랜딩=홈 이동 후 앵커. href 항목: 그대로 이동(/news)
  const hrefFor = (m: MenuItem) =>
    m.href ?? (isLanding ? `#${m.section}` : `/#${m.section}`);

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

        {/* 데스크탑(md↑, 768~): 4항목 클릭 가능 알약 — active 자동 강조(스크롤스파이).
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
                href={hrefFor(m)}
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

        {/* 모바일(<768): 현재 위치 알약(▾) → 드롭다운 항목 선택. Radix 가 Esc/바깥탭/포커스/aria-expanded 처리 */}
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
                    href={hrefFor(m)}
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
