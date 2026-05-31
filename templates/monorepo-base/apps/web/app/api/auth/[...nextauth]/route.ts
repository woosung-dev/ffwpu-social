// web NextAuth v5 라우트 - providers 비활성 시 404, 활성 시 handlers 위임
import { NextResponse } from "next/server";
import { handlers, hasActiveProviders } from "@/auth";

// Edge 차단 - postgres / drizzle adapter 호환
export const runtime = "nodejs";

export const GET = async (req: Request): Promise<Response> => {
  if (!hasActiveProviders) {
    return NextResponse.json(
      { error: "OAuth providers not configured" },
      { status: 404 },
    );
  }
  return handlers.GET(req);
};

export const POST = async (req: Request): Promise<Response> => {
  if (!hasActiveProviders) {
    return NextResponse.json(
      { error: "OAuth providers not configured" },
      { status: 404 },
    );
  }
  return handlers.POST(req);
};
