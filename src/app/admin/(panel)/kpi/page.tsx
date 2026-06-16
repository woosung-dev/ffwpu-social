// 어드민 KPI 관리 — kpi_metrics 4 row 입력 폼. Suspense 격리 (Cache Components 정합)
import type { Metadata } from "next";
import { Suspense } from "react";

import { listKpisForAdmin } from "@/features/kpi";
import { KpiEditor, type KpiInitialRow } from "@/admin/components/KpiEditor";

export const metadata: Metadata = {
  title: "KPI 관리 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminKpiPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong">
          KPI 관리
        </h1>
        <p className="text-sm text-ink-subtle">
          메인 페이지 &ldquo;한 해동안 만들어낸 변화&rdquo; 영역의 KPI 수치를
          갱신합니다. 저장 시 사용자 사이트에 즉시 반영됩니다.
        </p>
      </header>
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
  }));
  return <KpiEditor initialRows={initialRows} />;
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
