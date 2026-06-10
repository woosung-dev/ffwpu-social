// 사용자 사이트 헤더 — 클릭 불가 "현재 위치 인디케이터" (ADR-037). 검색·드롭다운 없음.
// 랜딩: 스크롤 구간에 따라 임팩트 데이터→쌀 나눔 소식→쌀나눔 프로젝트 자동 active. /news: 활동 스토리 고정.
// md↑(768~) 풀 4항목 표시 / <768 현재 active pill 1개만. bg-brand-bright #B769FF + 알약 active.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useScrollSpy } from "@/client/hooks/useScrollSpy";
import { cn } from "@/lib/utils";

type MenuItem = {
  id: string;
  label: string;
  /** 랜딩에서 이 섹션 id 가 active 일 때 강조 (DOM 순서: kpi→story→stories) */
  landingSection?: string;
  /** 비랜딩(/news 등) 페이지에서 active 고정 */
  activeOnSubpage?: boolean;
};

// 표시 순서는 Figma 유지(임팩트/활동스토리/소식/프로젝트). landingSection 이 active 구간을 결정.
const MENU: readonly MenuItem[] = [
  { id: "kpi", label: "임팩트 데이터", landingSection: "kpi" },
  { id: "activity", label: "활동 스토리", activeOnSubpage: true },
  { id: "newsfeed", label: "쌀 나눔 소식", landingSection: "story" },
  { id: "project", label: "쌀나눔 프로젝트", landingSection: "stories" },
] as const;

// DOM 순서(위→아래)로 전달 — 바닥 감지 시 마지막 섹션 정확도용 (useScrollSpy 참조)
const SCROLL_SECTIONS = MENU.map((m) => m.landingSection).filter(
  (s): s is string => Boolean(s),
);
const FIRST_LANDING_SECTION = SCROLL_SECTIONS[0]; // Hero 영역(스파이 null) 폴백

export function PublicHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const scrollActive = useScrollSpy(SCROLL_SECTIONS);

  // 랜딩: 스크롤 구간 → 해당 메뉴 / 비랜딩: 서브페이지 active 메뉴(활동 스토리)
  const activeMenuId = isLanding
    ? MENU.find(
        (m) => m.landingSection === (scrollActive ?? FIRST_LANDING_SECTION),
      )?.id
    : MENU.find((m) => m.activeOnSubpage)?.id;
  // 모바일 pill — 현재 active 항목 (없으면 첫 항목 폴백)
  const activeItem = MENU.find((m) => m.id === activeMenuId) ?? MENU[0];

  return (
    <header className="sticky top-0 z-40 bg-brand-bright">
      {/* 바 — Figma 헤더 컴포넌트(97:9431) 4BP 정합: height 54/70/88/88, 콘텐츠 그리드=SectionContainer(343/648/905/1200) */}
      <div className="mx-auto flex h-[54px] w-full items-center justify-between px-4 md:h-[70px] md:max-w-[648px] md:px-0 lg:h-[88px] lg:max-w-[905px] wide:max-w-[1200px]">
        <Link href="/" aria-label="Sow Good 홈으로" className="block shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset, next/image SVG dangerouslyAllowSVG 회피 */}
          <img
            src="/icons/sow-good-header-logo.svg"
            alt="Sow Good"
            width={80}
            height={53}
            // Figma 로고 63×42(base·md) / 80×53.3(lg·wide). w-auto 로 비율 유지
            className="h-[42px] w-auto lg:h-[53px]"
          />
        </Link>

        {/* 우측 클러스터 — 데스크탑 4항목 인디케이터(md↑) | 모바일 active pill(<768). BP 상호배타 */}
        <div className="flex items-center">
          {/* 데스크탑(md↑, 768~): 4항목 위치 인디케이터 — 클릭 불가, active 자동 강조. gap 4(md)/24(lg), item px 16/20·py 8/10, 14/16px */}
          <nav
            aria-label="현재 보고 있는 영역"
            className="hidden items-center gap-1 md:flex lg:gap-6"
          >
            {MENU.map((m) => {
              const isActive = m.id === activeMenuId;
              return (
                <span
                  key={m.id}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors select-none lg:px-5 lg:py-2.5 lg:text-base",
                    isActive
                      ? "border-[1.6px] border-brand-primary bg-white font-extrabold text-brand-primary"
                      : "font-bold text-white",
                  )}
                >
                  {m.label}
                </span>
              );
            })}
          </nav>

          {/* 모바일(<768): 현재 active 항목 pill 1개만 — 드롭다운·클릭 없음. px16 py8 14px(Figma 375) */}
          <div
            aria-label={`현재 위치 ${activeItem.label}`}
            className="flex items-center rounded-full border-[1.6px] border-brand-primary bg-white px-4 py-2 text-sm font-extrabold text-brand-primary select-none md:hidden"
          >
            {activeItem.label}
          </div>
        </div>
      </div>
    </header>
  );
}
