// 어드민 인증 후 패널 Route Group 레이아웃 — AdminSidebar 좌측 + main, noindex
import type { Metadata } from "next";

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
      <AdminSidebar />
      <main className="flex-1 px-4 py-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
