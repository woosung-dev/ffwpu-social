// 사용자 사이트 Route Group 레이아웃 — PublicHeader + main + PublicFooter wrap (Figma SSoT 정합)
// PublicHeader 는 usePathname 사용 → 동적 라우트(/news/[id])에선 경로가 prerender 시 미확정(dynamic).
// cacheComponents 가 "uncached outside Suspense" 로 막으므로 헤더를 Suspense 로 감싸 격리 (정적 라우트는 즉시 resolve)
import { Suspense } from "react";

import { PublicFooter, PublicHeader } from "@/client/layouts";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense
        fallback={<div className="sticky top-0 z-40 h-16 bg-brand-bright lg:h-20" />}
      >
        <PublicHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
