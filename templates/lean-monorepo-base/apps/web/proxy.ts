// 공개 사이트 proxy — 어드민 호스트 요청은 차단·리다이렉트 (Node Runtime 전용, Edge 금지)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

export function proxy(request: NextRequest): NextResponse {
  const host = request.headers.get("host") ?? "";

  // 어드민 호스트는 별도 앱(apps/admin :3100) 으로 라우팅 — host 분기 SSoT
  // 운영: admin.<domain> / 로컬: localhost:3100 은 admin 앱이 직접 처리
  if (host.startsWith("admin.")) {
    // 안전망: web 앱이 어드민 host 요청을 받으면 404 처리 (인프라 라우팅 오설정 방어)
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.next();
}
