// KPI 시트 동기화 service — reader→parse(→DB). fetchSheetMetrics: 폼 불러오기용(DB 미기록). syncKpiFromSheet: 주간 자동 갱신용(DB 기록). db import 금지 원칙: DB 접근은 kpiDb 함수만 호출.
import "server-only";

import { db } from "@/db";

import * as kpiDb from "../db";
import { SYNC_TARGET_SLUGS } from "./mapping";
import { extractCumulativeMetrics, parseCsv, type ParsedMetric } from "./parse";
import { getSheetReader, type SheetReader } from "./sheet-reader";

export type SyncResult = {
  synced: string[]; // 갱신된 slug
  missing: string[]; // 매핑됐으나 시트/DB 에서 못 찾은 slug
};

// 시트 fetch + parse 만 — DB 미기록. 어드민 "시트에서 불러오기"(폼 채우기)·동기화 양쪽의 공통 단계.
// 라벨을 0개 찾으면 구조 파손으로 보고 throw — 호출측이 기존 값 보존.
export async function fetchSheetMetrics(
  reader: SheetReader = getSheetReader(),
): Promise<ParsedMetric[]> {
  const csv = await reader.fetchCsv();
  const metrics = extractCumulativeMetrics(parseCsv(csv));
  if (metrics.length === 0) {
    throw new Error(
      "시트에서 '총 누적 지표' 라벨을 찾지 못했습니다 — 시트 구조/공유 설정 확인 필요",
    );
  }
  return metrics;
}

// 시트 → kpi_metrics 직접 갱신 (주간 자동 cron). 매핑된 slug 만 value·displayValue·unit 갱신.
export async function syncKpiFromSheet(
  reader: SheetReader = getSheetReader(),
): Promise<SyncResult> {
  const metrics = await fetchSheetMetrics(reader);
  const bySlug = new Map(metrics.map((m) => [m.slug, m]));

  const synced: string[] = [];
  const missing: string[] = [];

  await db.transaction(async (tx) => {
    for (const slug of SYNC_TARGET_SLUGS) {
      const metric = bySlug.get(slug);
      if (!metric) {
        missing.push(slug);
        continue;
      }
      const updated = await kpiDb.updateSyncedValue(tx, slug, {
        value: metric.value,
        externalId: metric.externalId,
      });
      if (updated) synced.push(slug);
      else missing.push(slug); // DB 에 해당 slug 행 없음
    }
  });

  return { synced, missing };
}
