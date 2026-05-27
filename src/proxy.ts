// Next.js 16 proxy.ts (구 middleware.ts) — /admin 경로 인증 게이트. Node Runtime 전용
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";

  if (isAdmin && !isLogin && !req.auth) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 이미 로그인된 사용자는 로그인 페이지 접근 시 대시보드로
  if (isLogin && req.auth) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
});

// Next 16: proxy는 항상 Node.js Runtime — runtime 키 명시 금지
export const config = {
  matcher: ["/admin/:path*"],
};
