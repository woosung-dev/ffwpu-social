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
  const all = await listAllCategoriesForAdmin("story");
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
  // cacheComponents 가 네비게이션 간 NewsEditor 클라 상태를 보존(React Activity)하므로, 새 push 진입마다
  // 새 key 를 주어 깨끗한 폼으로 리마운트한다(미제출 이탈 후 재진입 시 이전 입력 잔존 차단). back/forward 는
  // 세그먼트 복원이라 서버 재렌더가 없어 같은 key → 입력 보존(정상 UX). key 는 await 이후 동적 스코프에서 생성.
  const draftKey = crypto.randomUUID();
  return <NewsEditor key={draftKey} board="story" mode="new" categories={categories} />;
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
