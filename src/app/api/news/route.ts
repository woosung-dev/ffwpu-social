// 공개 소식 목록 GET — 클라 useSuspenseQuery 의 read 전송 채널.
// Server Action 을 queryFn 으로 호출하면 렌더 중 Router action 디스패치가 일어나 "setState during render" 경고 발생 → GET route handler 로 분리.
import { NextResponse } from "next/server";

import { listNews, listNewsQuerySchema } from "@/features/news";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listNewsQuerySchema.safeParse({
    categorySlug: searchParams.get("category") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const data = await listNews(parsed.data);
  return NextResponse.json(data);
}
