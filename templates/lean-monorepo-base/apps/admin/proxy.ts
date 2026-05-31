// 어드민 앱의 Next.js 16 proxy (middleware 대체) - host 분기 + 인증 보호
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "./auth";

export const config = {
  // 정적 파일·이미지·favicon 은 우회
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
  runtime: "nodejs",
};

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";

  // host 분기: 어드민 서브도메인 외 요청은 거부 (운영). dev 는 localhost 허용
  const isDev = process.env.NODE_ENV !== "production";
  const isAdminHost = isDev || host.startsWith("admin.");
  if (!isAdminHost) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 로그인 페이지·API 콜백은 통과
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 인증 가드 - (panel) 그룹 전부 보호
  const session = await auth();
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
