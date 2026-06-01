// KPI service — 비즈니스 로직 (db import 금지, db 레이어 함수만 호출). 갱신 transaction 안에서 audit_logs 기록 — v1.1
import "server-only";

import { db } from "@/db";
import * as kpiDb from "./db";
import type { KpiUpdateInput } from "./schemas";

export async function listKpisForAdmin() {
  return kpiDb.listForAdmin("impact");
}

// StorySection 통계 (후원기관·지원가정·지역시설) — 어드민 입력 폼. updateKpis 와 동일 액션 재사용 (slug 키)
export async function listStoryStatsForAdmin() {
  return kpiDb.listForAdmin("story");
}

// 4 row 일괄 갱신 — transaction 안에서 한 row 라도 실패 시 전체 롤백
export async function updateKpis(input: KpiUpdateInput) {
  return db.transaction(async (tx) => {
    const updated = [];
    for (const row of input.rows) {
      const result = await kpiDb.updateBySlug(tx, row.slug, {
        label: row.label,
        value: row.value,
        displayValue: row.displayValue,
        unit: row.unit,
      });
      if (!result) {
        throw new Error(`KPI slug not found: ${row.slug}`);
      }
      updated.push(result);
    }
    return updated;
  });
}
