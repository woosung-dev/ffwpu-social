// KPI DB 레이어 — kpi_metrics 테이블 직접 접근. service 만 호출 (3-Layer 원칙)
import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { kpiMetrics } from "@/db/schema";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// 어드민 — 활성·비활성 모두 (단 비활성도 운영자가 다시 활성 가능)
export async function listAllForAdmin() {
  return db
    .select({
      id: kpiMetrics.id,
      slug: kpiMetrics.slug,
      label: kpiMetrics.label,
      value: kpiMetrics.value,
      displayValue: kpiMetrics.displayValue,
      unit: kpiMetrics.unit,
      sortOrder: kpiMetrics.sortOrder,
      isActive: kpiMetrics.isActive,
      updatedAt: kpiMetrics.updatedAt,
    })
    .from(kpiMetrics)
    .orderBy(asc(kpiMetrics.sortOrder));
}

// 단건 갱신 — service 의 transaction 안에서 호출
export async function updateBySlug(
  tx: Tx,
  slug: string,
  data: {
    label: string;
    value: number | null;
    displayValue: string;
    unit: string | null;
  },
) {
  const [updated] = await tx
    .update(kpiMetrics)
    .set({
      label: data.label,
      value: data.value,
      displayValue: data.displayValue,
      unit: data.unit,
      updatedAt: new Date(),
    })
    .where(eq(kpiMetrics.slug, slug))
    .returning();
  return updated ?? null;
}
