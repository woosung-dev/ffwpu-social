// 어드민 좌측 네비게이션 — 대시보드 단독 + 콘텐츠/메인 페이지/시스템 그룹. 1024↓ 토글, 인덱스(/admin)는 정확 일치로 활성 판정. ADR-024 F3 src/admin/ 전용
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, FolderTree, LayoutDashboard, LogOut, Menu, Newspaper, Sparkles, Star, Users, X } from "lucide-react";

import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  // 인덱스 라우트(/admin)는 정확 일치로만 활성 — prefix 매칭 시 모든 하위 페이지에서 켜짐
  exact?: boolean;
};

type NavGroup = {
  label: string | null; // null = 라벨 없는 최상단(대시보드)
  items: readonly NavItem[];
};

const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: null,
    items: [
      { href: "/admin", label: "대시보드", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "콘텐츠",
    items: [
      { href: "/admin/news", label: "소식 관리", icon: Newspaper },
      { href: "/admin/news-hero", label: "소식 히어로", icon: Star },
      { href: "/admin/categories", label: "카테고리 관리", icon: FolderTree },
    ],
  },
  {
    label: "메인 페이지",
    items: [
      { href: "/admin/kpi", label: "KPI 관리", icon: BarChart3 },
      { href: "/admin/landing", label: "메인 큐레이션", icon: Sparkles },
    ],
  },
  {
    label: "시스템",
    items: [{ href: "/admin/accounts", label: "계정 관리", icon: Users }],
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "사이드바 닫기" : "사이드바 열기"}
        aria-expanded={open}
        className="fixed left-3 top-3 z-50 inline-flex size-11 items-center justify-center rounded-md border border-border bg-white text-foreground shadow-sm transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 lg:hidden"
        style={{
          marginTop: "env(safe-area-inset-top)",
          marginLeft: "env(safe-area-inset-left)",
        }}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? (
          <X className="size-5" aria-hidden />
        ) : (
          <Menu className="size-5" aria-hidden />
        )}
      </button>

      {open && (
        <button
          type="button"
          aria-label="사이드바 닫기"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-surface-cool transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="border-b border-border px-5 py-5">
          <p className="text-base font-extrabold tracking-tight text-brand-primary">
            Sow Good 어드민
          </p>
          <p className="mt-0.5 text-xs text-ink-date">사회공헌국 전용</p>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label ?? "root"}>
              {group.label && (
                <p className="px-3 pb-1 text-[11px] font-semibold tracking-wide text-ink-date">
                  {group.label}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-cool",
                          isActive
                            ? "bg-brand-primary/10 text-brand-primary font-semibold before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-brand-primary"
                            : "font-medium text-ink-subtle hover:bg-white hover:text-ink-strong",
                        )}
                      >
                        <Icon className="size-4" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border px-3 py-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-ink-subtle transition-colors hover:bg-white hover:text-ink-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-cool"
            >
              <LogOut className="size-4" aria-hidden />
              로그아웃
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
