// 어드민 새 글 작성 — Server Component + Suspense (활성 카테고리 목록 fetch 분리)
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
  title: "새 글 작성 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminNewsNewPage() {
  return (
    <div className="space-y-6">
      <BackLink />
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong">새 글 작성</h1>
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
  const all = await listAllCategoriesForAdmin();
  const categories: NewsCategoryOption[] = all
    .filter((c) => c.isActive)
    .map((c) => ({ id: c.id, name: c.name }));
  if (categories.length === 0) {
    return (
      <div className="rounded-md border bg-muted/30 px-4 py-8 text-center text-sm text-ink-subtle">
        활성 카테고리가 없습니다. 먼저 카테고리를 등록해주세요.
      </div>
    );
  }
  return <NewsEditor mode="new" categories={categories} />;
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
      href="/admin/news"
      className="inline-flex items-center gap-1 text-xs text-ink-subtle hover:text-ink-strong"
    >
      <ChevronLeft className="h-3 w-3" />
      목록으로
    </Link>
  );
}
