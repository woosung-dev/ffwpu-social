// 어드민 KPI 관리 — kpi_metrics 4 row 입력 폼. Suspense 격리 (Cache Components 정합)
import type { Metadata } from "next";
import { Suspense } from "react";

import { listKpisForAdmin } from "@/features/kpi";
import { KpiEditor, type KpiInitialRow } from "@/admin/components/KpiEditor";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { HelpTip } from "@/admin/components/HelpTip";
import { ADMIN_COPY } from "@/admin/copy";

export const metadata: Metadata = {
  title: "임팩트 데이터 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminKpiPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ADMIN_COPY.kpi.title}
        description={ADMIN_COPY.kpi.description}
        helpTip={<HelpTip>{ADMIN_COPY.kpi.titleHelp}</HelpTip>}
      />
      <Suspense fallback={<KpiLoading />}>
        <KpiFormData />
      </Suspense>
    </div>
  );
}

async function KpiFormData() {
  const rows = await listKpisForAdmin();
  const initialRows: KpiInitialRow[] = rows.map((r) => ({
    slug: r.slug,
    label: r.label,
    sublabel: r.sublabel,
    value: r.value,
    displayValue: r.displayValue,
    unit: r.unit,
    sortOrder: r.sortOrder,
    syncSource: r.syncSource,
  }));
  // 가장 최근 자동 동기화 시각 — 폼 상단에 표시
  const lastSyncedAt = rows.reduce<Date | null>((latest, r) => {
    if (!r.lastSyncedAt) return latest;
    return !latest || r.lastSyncedAt > latest ? r.lastSyncedAt : latest;
  }, null);
  return (
    <KpiEditor
      initialRows={initialRows}
      lastSyncedAt={lastSyncedAt ? lastSyncedAt.toISOString() : null}
    />
  );
}

function KpiLoading() {
  return (
    <div
      className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      aria-busy
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-xl bg-muted/60"
        />
      ))}
    </div>
  );
}
