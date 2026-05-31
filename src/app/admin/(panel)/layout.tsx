// 어드민 인증 후 패널 Route Group 레이아웃 — AdminSidebar 좌측 + main, noindex.
// Cache Components 환경: usePathname() 사용하는 AdminSidebar 를 Suspense 로 격리해야 prerender 통과
import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminSidebar } from "@/admin/layouts";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface-soft">
      <Suspense fallback={<SidebarSkeleton />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 px-4 py-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside
      aria-hidden
      className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-white lg:sticky lg:top-0 lg:h-screen lg:block"
    >
      <div className="h-16 animate-pulse border-b border-border bg-muted/40" />
      <div className="space-y-2 p-3">
        <div className="h-10 animate-pulse rounded-md bg-muted/40" />
        <div className="h-10 animate-pulse rounded-md bg-muted/40" />
      </div>
    </aside>
  );
}
