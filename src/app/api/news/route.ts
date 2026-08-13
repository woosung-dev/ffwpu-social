// 공개 글 목록 GET — 클라 useSuspenseQuery 의 read 전송 채널. 활동 스토리(/news)와 언론(/press) 공용.
// Server Action 을 queryFn 으로 호출하면 렌더 중 Router action 디스패치가 일어나 "setState during render" 경고 발생 → GET route handler 로 분리.
import { NextResponse } from "next/server";
import { z } from "zod";

import { listNews, listNewsQuerySchema, NEWS_BOARDS } from "@/features/news";

// board 는 명시 화이트리스트 — 임의 문자열이 DAL 까지 흘러가지 않게 진입점에서 차단
const boardSchema = z.enum(NEWS_BOARDS).default("story");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const board = boardSchema.safeParse(searchParams.get("board") ?? undefined);
  const parsed = listNewsQuerySchema.safeParse({
    categorySlug: searchParams.get("category") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
  if (!board.success || !parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const data = await listNews(board.data, parsed.data);
  return NextResponse.json(data);
}
