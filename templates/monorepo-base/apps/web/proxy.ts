// Next.js 16 proxy (구 middleware) - web 도메인 요청 가드, Node Runtime 강제
import { NextResponse, type NextRequest } from "next/server";

// next-auth / postgres 가 Edge 에서 동작하지 않으므로 Node 강제
export const runtime = "nodejs";

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // admin 서브도메인용 경로가 web 으로 흘러들어왔을 때 차단 (도메인 분리 보호)
  if (pathname.startsWith("/admin") || pathname.startsWith("/(panel)")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 정적 자산·이미지·favicon 은 통과
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
