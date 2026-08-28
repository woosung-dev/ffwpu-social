// KPI 시트 동기화 service — reader→parse(→DB). fetchSheetMetrics: 폼 불러오기용(DB 미기록). syncFromSheet: 주간 자동 갱신용(DB 기록).
// db import 금지 원칙: DB 접근은 kpiDb 함수만 호출.
import "server-only";

import { db } from "@/db";

import * as kpiDb from "../db";
import { SHEET_CONFIG, syncTargetSlugs, type SheetKind } from "./mapping";
import { extractCumulativeMetrics, parseCsv, type ParsedMetric } from "./parse";
import { getSheetReader, type SheetReader } from "./sheet-reader";

export type SyncResult = {
  synced: string[]; // 갱신된 slug
  missing: string[]; // 매핑됐으나 시트/DB 에서 못 찾은 slug
};

// 시트 fetch + parse 만 — DB 미기록. 어드민 "시트에서 불러오기"(폼 채우기)·동기화 양쪽의 공통 단계.
// 라벨을 0개 찾으면 구조 파손으로 보고 throw — 호출측이 기존 값 보존.
export async function fetchSheetMetrics(
  kind: SheetKind = "impact",
  reader: SheetReader = getSheetReader(kind),
): Promise<ParsedMetric[]> {
  const csv = await reader.fetchCsv();
  const metrics = extractCumulativeMetrics(parseCsv(csv), kind);
  if (metrics.length === 0) {
    throw new Error(
      `${SHEET_CONFIG[kind].displayName} 시트에서 지표 라벨을 찾지 못했습니다 — 시트 구조/공유 설정 확인 필요`,
    );
  }
  return metrics;
}

// 시트 → kpi_metrics 직접 갱신 (주간 자동 cron). 매핑된 slug 만 value 갱신.
export async function syncFromSheet(
  kind: SheetKind = "impact",
  reader: SheetReader = getSheetReader(kind),
): Promise<SyncResult> {
  const metrics = await fetchSheetMetrics(kind, reader);
  const bySlug = new Map(metrics.map((m) => [m.slug, m]));

  const synced: string[] = [];
  const missing: string[] = [];

  await db.transaction(async (tx) => {
    for (const slug of syncTargetSlugs(kind)) {
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

export type SheetSyncReport = {
  kind: SheetKind;
  ok: boolean;
  synced: string[];
  missing: string[];
  error?: string;
};

// 두 시트를 각각 동기화. 한 시트의 실패(URL 미설정·시트 구조 변경·401)가 다른 시트를 막지 않도록 격리한다 —
// 쌀나눔 시트 공유 설정이 바뀌어도 협회 지표는 계속 갱신돼야 한다.
export async function syncAllSheets(): Promise<SheetSyncReport[]> {
  const kinds = Object.keys(SHEET_CONFIG) as SheetKind[];
  const reports: SheetSyncReport[] = [];
  for (const kind of kinds) {
    try {
      const { synced, missing } = await syncFromSheet(kind);
      reports.push({ kind, ok: true, synced, missing });
    } catch (e) {
      reports.push({
        kind,
        ok: false,
        synced: [],
        missing: syncTargetSlugs(kind),
        error: e instanceof Error ? e.message : "sync failed",
      });
    }
  }
  return reports;
}
