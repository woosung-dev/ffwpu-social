// 어드민 카테고리 관리 페이지 — Server Component. Cache Components 환경: data fetch 는 Suspense 안 분리.
import type { Metadata } from "next";
import { Suspense } from "react";
import { listAllForAdmin } from "@/features/categories/service";
import { CategoryManager } from "@/admin/components/CategoryManager";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { HelpTip } from "@/admin/components/HelpTip";
import { ADMIN_COPY } from "@/admin/copy";

export const metadata: Metadata = {
  title: "소식 카테고리 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ADMIN_COPY.categories.title}
        description={ADMIN_COPY.categories.description}
        helpTip={<HelpTip>{ADMIN_COPY.categories.titleHelp}</HelpTip>}
      />
      <Suspense fallback={<CategoriesLoading />}>
        <CategoriesData />
      </Suspense>
    </div>
  );
}

async function CategoriesData() {
  const rows = await listAllForAdmin();
  return <CategoryManager rows={rows} />;
}

function CategoriesLoading() {
  return (
    <div className="space-y-4" aria-busy>
      <div className="h-40 animate-pulse rounded-md bg-muted/60" />
      <div className="h-72 animate-pulse rounded-md bg-muted/60" />
    </div>
  );
}
