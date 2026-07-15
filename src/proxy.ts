// Next.js 16 proxy.ts (구 middleware.ts) — host 분기(ADR-023 옵션2 서브도메인) + /admin 인증 게이트. Node Runtime 전용
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// 어드민 호스트: 프로덕션은 admin.<도메인> 서브도메인.
function isAdminHost(host: string): boolean {
  return host.startsWith("admin.");
}
// 분기 우회: 로컬(localhost) + Vercel 기본 배포 도메인(*.vercel.app).
// 커스텀 도메인 연결 전까지는 한 호스트에서 양쪽 접근 — vercel.app 엔 admin. 서브도메인을 만들 수 없어 락아웃 방지.
function isBranchBypassHost(host: string): boolean {
  return (
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.endsWith(".vercel.app")
  );
}

export default auth((req) => {
  const host = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");

  // 1) 호스트 ↔ 경로 분리 (로컬·vercel.app 은 우회). ADR-023: 사용자 도메인 /admin = 404, 어드민 도메인 비-admin = /admin
  if (!isBranchBypassHost(host)) {
    if (!isAdminHost(host) && isAdminPath) {
      // 사용자 도메인에서 어드민 접근 차단 — 어드민은 admin 서브도메인 전용
      return new NextResponse(null, { status: 404 });
    }
    if (isAdminHost(host) && !isAdminPath) {
      // 어드민 도메인 루트·기타 경로 → 어드민으로
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // 2) 어드민 인증 게이트 — super 역할만 허용. read 경로(page Server Component)도 게이트 (codex consult v2 P1)
  const isLogin = pathname === "/admin/login";
  const isSuper = req.auth?.user?.role === "super";

  if (isAdminPath && !isLogin) {
    if (!req.auth) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isSuper) {
      // 로그인했으나 super 아님 — 어드민 접근(읽기 포함) 차단
      const forbiddenUrl = new URL("/admin/login", req.url);
      forbiddenUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  // super 만 로그인 페이지 → 대시보드 자동 이동 (비-super 무한 리다이렉트 루프 방지)
  if (isLogin && isSuper) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 어드민 호스트 통과 응답은 색인 차단 — 페이지 메타 noindex 보강 (HTML 아닌 응답·크롤러 방어). 사용자 도메인·우회 호스트는 미적용
  if (isAdminHost(host) && !isBranchBypassHost(host)) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
});

// Next 16: proxy는 항상 Node.js Runtime — runtime 키 명시 금지.
// host 분기를 위해 전 페이지 경로 매칭 (api·정적·파일 확장자 제외).
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
