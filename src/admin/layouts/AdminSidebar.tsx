// 어드민 좌측 네비게이션 — 대시보드 / 소식 / 로그아웃. 1024↓ 토글, 활성 메뉴 표시. ADR-024 F3 src/admin/ 전용
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, Newspaper, X } from "lucide-react";

import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const NAV: readonly NavItem[] = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/news", label: "소식 관리", icon: Newspaper },
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
        className="fixed left-4 top-4 z-50 rounded-md border border-border bg-white p-2 text-foreground shadow-sm lg:hidden"
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
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="border-b border-border px-5 py-5">
          <p className="text-base font-extrabold tracking-tight text-brand-primary">
            Sow Good 어드민
          </p>
          <p className="mt-0.5 text-xs text-ink-subtle">사회공헌국 전용</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-brand-primary text-white font-semibold"
                        : "font-medium text-foreground hover:bg-surface-soft",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-3 py-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-ink-subtle transition-colors hover:bg-surface-soft hover:text-foreground"
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
