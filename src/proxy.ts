// Next.js 16 proxy.ts (구 middleware.ts) — /admin 경로 인증 게이트. Node Runtime 전용
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";
  // super 역할만 어드민 접근 허용 — read 경로(page Server Component)도 게이트 (codex consult v2 P1)
  const isSuper = req.auth?.user?.role === "super";

  if (isAdmin && !isLogin) {
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
});

// Next 16: proxy는 항상 Node.js Runtime — runtime 키 명시 금지
export const config = {
  matcher: ["/admin/:path*"],
};
