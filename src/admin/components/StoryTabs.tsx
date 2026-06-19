// 활동 스토리 관리 페이지 내부 탭 — 스토리 대표글(소식 상단 슬라이드) / 스토리 관리(글 목록·CRUD). ?tab 쿼리로 전환, 라우팅 탭(서버 분기와 단일 출처)
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { ADMIN_COPY } from "@/admin/copy";

const TABS = [
  {
    key: "featured" as const,
    href: "/admin/news?tab=featured",
    label: ADMIN_COPY.nav.storyTabFeatured,
  },
  {
    key: "manage" as const,
    href: "/admin/news",
    label: ADMIN_COPY.nav.storyTabManage,
  },
];

export function StoryTabs() {
  const searchParams = useSearchParams();
  const active = searchParams.get("tab") === "featured" ? "featured" : "manage";

  return (
    <nav
      className="flex gap-1 border-b border-border"
      aria-label="활동 스토리 관리 탭"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2",
              isActive
                ? "text-brand-primary after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand-primary"
                : "text-ink-subtle hover:text-ink-strong",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
