// 어드민 카테고리 관리 페이지 — Server Component. Cache Components 환경: data fetch 는 Suspense 안 분리.
import type { Metadata } from "next";
import { Suspense } from "react";
import { listAllForAdmin } from "@/features/categories/service";
import { CategoryManager } from "@/admin/components/CategoryManager";

export const metadata: Metadata = {
  title: "카테고리 관리 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-ink-strong">카테고리 관리</h1>
        <p className="text-sm text-ink-subtle">
          소식 분류를 추가하거나 노출 순서·활성 여부를 조정합니다. slug 는 변경할 수 없습니다.
        </p>
      </header>
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
