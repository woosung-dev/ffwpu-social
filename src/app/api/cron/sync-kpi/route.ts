// KPI 시트 동기화 엔드포인트 — GitHub Actions 주간 워크플로(또는 수동)가 호출. CRON_SECRET Bearer 검증 후 시트→DB 동기화 + 메인 revalidate.
// 호출 주체가 GitHub 이라 배포 플랫폼(Vercel/AWS)과 무관 — 이전 시 GHA secret URL 만 교체.
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { syncKpiFromSheet } from "@/features/kpi/sync/service";

// 런타임 지시어 없음 — cacheComponents 와 비호환. 라우트 핸들러는 기본 Node 런타임이라 pg 동작(다른 /api 라우트와 동일).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // GHA 워크플로가 Authorization: Bearer <CRON_SECRET> 첨부
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const result = await syncKpiFromSheet();
    revalidatePath("/");
    revalidatePath("/admin/kpi");
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "sync failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
