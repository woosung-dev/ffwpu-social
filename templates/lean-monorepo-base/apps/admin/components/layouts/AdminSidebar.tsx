// 어드민 패널 공통 사이드바 - 네비게이션 + 사용자 정보 + 로그아웃
import Link from "next/link";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/news", label: "소식 관리" },
];

export function AdminSidebar({
  userEmail,
  onLogout,
}: {
  userEmail: string;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-6 border-r bg-[var(--color-bg)] p-6">
      <header className="space-y-1">
        <Link href="/dashboard" className="block text-base font-semibold">
          Sow Good
        </Link>
        <p className="text-xs text-[var(--color-text-muted)]">사회공헌국 어드민</p>
      </header>

      <nav className="flex-1">
        <ul className="space-y-1">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded px-3 py-2 text-sm hover:bg-[var(--color-surface)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="space-y-2 border-t pt-4">
        <p className="truncate text-xs text-[var(--color-text-muted)]" title={userEmail}>
          {userEmail}
        </p>
        <form action={onLogout}>
          <Button type="submit" variant="ghost" className="w-full">
            로그아웃
          </Button>
        </form>
      </footer>
    </aside>
  );
}
