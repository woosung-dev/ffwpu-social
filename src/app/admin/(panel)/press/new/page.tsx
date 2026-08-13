// 어드민 언론 보도 새 글 작성 — Server Component + Suspense (활성 카테고리 목록 fetch 분리, ADR-056)
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";

import { listAllForAdmin as listAllCategoriesForAdmin } from "@/features/categories/service";
import {
  NewsEditor,
  type NewsCategoryOption,
} from "@/admin/components/NewsEditor";

export const metadata: Metadata = {
  title: "언론 보도 작성 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminPressNewPage() {
  return (
    <div className="space-y-6">
      <BackLink />
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong">
          언론 보도 작성
        </h1>
        <p className="text-sm text-ink-subtle">
          임시 저장하거나 즉시 발행할 수 있습니다.
        </p>
      </header>
      <Suspense fallback={<EditorLoading />}>
        <NewEditorData />
      </Suspense>
    </div>
  );
}

async function NewEditorData() {
  const all = await listAllCategoriesForAdmin("press");
  const categories: NewsCategoryOption[] = all
    .filter((c) => c.isActive)
    .map((c) => ({ id: c.id, name: c.name }));
  if (categories.length === 0) {
    return (
      <div className="rounded-md border bg-muted/30 px-4 py-8 text-center text-sm text-ink-subtle">
        활성 카테고리가 없습니다. 먼저 ‘언론 카테고리’에서 카테고리를 등록해주세요.
      </div>
    );
  }
  // cacheComponents 가 네비게이션 간 NewsEditor 클라 상태를 보존하므로 새 push 진입마다 새 key 로 리마운트
  const draftKey = crypto.randomUUID();
  return <NewsEditor key={draftKey} board="press" mode="new" categories={categories} />;
}

function EditorLoading() {
  return (
    <div className="space-y-4" aria-busy>
      <div className="h-12 animate-pulse rounded-md bg-muted/60" />
      <div className="h-96 animate-pulse rounded-md bg-muted/60" />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/press"
      className="inline-flex items-center gap-1 text-xs text-ink-subtle hover:text-ink-strong"
    >
      <ChevronLeft className="h-3 w-3" />
      목록으로
    </Link>
  );
}
