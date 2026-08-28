// 시트 동기화 엔드포인트 — GitHub Actions 주간 워크플로(또는 수동)가 호출. CRON_SECRET Bearer 검증 후 시트→DB 동기화 + 재검증.
// 시트 2개(협회 누적 지표 → KpiSection / 쌀 나눔 대장 → StorySection)를 각각 동기화하며, 한쪽 실패가 다른 쪽을 막지 않는다.
// 호출 주체가 GitHub 이라 배포 플랫폼(Vercel/AWS)과 무관 — 이전 시 GHA secret URL 만 교체.
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { syncAllSheets } from "@/features/kpi/sync/service";

// 런타임 지시어 없음 — cacheComponents 와 비호환. 라우트 핸들러는 기본 Node 런타임이라 pg 동작(다른 /api 라우트와 동일).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // GHA 워크플로가 Authorization: Bearer <CRON_SECRET> 첨부
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const reports = await syncAllSheets();
  const anySynced = reports.some((r) => r.synced.length > 0);
  if (anySynced) {
    revalidatePath("/");
    revalidatePath("/admin/kpi");
    revalidatePath("/admin/landing");
  }
  // 전부 실패해야 500 — 한 시트만 실패하면 나머지 결과를 살려 200 으로 보고한다(GHA 가 붉게 뜨지 않도록).
  const allFailed = reports.every((r) => !r.ok);
  return NextResponse.json({ ok: !allFailed, reports }, {
    status: allFailed ? 500 : 200,
  });
}
