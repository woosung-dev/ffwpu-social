// 어드민 언론 카테고리 관리 — 활동 스토리 카테고리와 완전히 분리된 목록 (ADR-056).
// slug unique 가 (board, slug) 복합이라 두 게시판이 같은 slug 를 각자 쓸 수 있다.
import type { Metadata } from "next";
import { Suspense } from "react";

import { listAllForAdmin } from "@/features/categories/service";
import { CategoryManager } from "@/admin/components/CategoryManager";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { HelpTip } from "@/admin/components/HelpTip";
import { ADMIN_COPY } from "@/admin/copy";

export const metadata: Metadata = {
  title: "언론 카테고리 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminPressCategoriesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ADMIN_COPY.pressCategories.title}
        description={ADMIN_COPY.pressCategories.description}
        helpTip={<HelpTip>{ADMIN_COPY.pressCategories.titleHelp}</HelpTip>}
      />
      <Suspense fallback={<CategoriesLoading />}>
        <PressCategoriesData />
      </Suspense>
    </div>
  );
}

async function PressCategoriesData() {
  const rows = await listAllForAdmin("press");
  return <CategoryManager board="press" rows={rows} />;
}

function CategoriesLoading() {
  return (
    <div className="space-y-4" aria-busy>
      <div className="h-40 animate-pulse rounded-md bg-muted/60" />
      <div className="h-72 animate-pulse rounded-md bg-muted/60" />
    </div>
  );
}
