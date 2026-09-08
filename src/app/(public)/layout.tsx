// 사용자 사이트 Route Group 레이아웃 — PublicHeader + main + PublicFooter wrap (Figma SSoT 정합)
// PublicHeader 는 usePathname 사용 → 동적 라우트(/news/[id])에선 경로가 prerender 시 미확정(dynamic).
// cacheComponents 가 "uncached outside Suspense" 로 막으므로 헤더를 Suspense 로 감싸 격리 (정적 라우트는 즉시 resolve)
import { Suspense } from "react";
import Script from "next/script";

import { PublicFooter, PublicHeader } from "@/client/layouts";
import { HEADER_BAR_HEIGHT_CLASS } from "@/client/layouts/header-height";
import { QueryProvider } from "@/client/providers/QueryProvider";

// Microsoft Clarity 세션 리코딩·히트맵 — 공개 사이트에만 주입한다(어드민은 root layout 의 GA 와 달리 제외).
// NEXT_PUBLIC_CLARITY_PROJECT_ID 미설정이면 아무것도 내보내지 않는다. 프로젝트 ID 는 영숫자 10자 안팎이라
// 인라인 스크립트에 넣기 전에 형식을 검사한다(환경변수 오입력이 JS 로 실행되는 것을 차단). ADR-063.
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const CLARITY_ID_PATTERN = /^[a-z0-9]{6,20}$/;
const clarityProjectId =
  CLARITY_PROJECT_ID && CLARITY_ID_PATTERN.test(CLARITY_PROJECT_ID) ? CLARITY_PROJECT_ID : null;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col">
        <Suspense
          // fallback 높이 = 실제 헤더 바 높이(header-height.ts SSoT) — 불일치 시 스트리밍 도착 때 콘텐츠 점프
          fallback={
            <div
              className={`sticky top-0 z-40 bg-brand-bright ${HEADER_BAR_HEIGHT_CLASS}`}
            />
          }
        >
          <PublicHeader />
        </Suspense>
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
      {clarityProjectId ? (
        // Clarity 공식 스니펫 그대로. afterInteractive — 하이드레이션 후 로드라 LCP 에 영향 없음
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarityProjectId)});`}
        </Script>
      ) : null}
    </QueryProvider>
  );
}
