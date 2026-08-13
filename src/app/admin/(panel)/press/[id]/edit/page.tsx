// 어드민 언론 보도 수정 — Server Component + Suspense. params 는 Suspense 자식에서 await (Cache Components 호환)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import type { JSONContent } from "@tiptap/react";

import { getAdminNewsDetail } from "@/features/news";
import { listAllForAdmin as listAllCategoriesForAdmin } from "@/features/categories/service";
import {
  NewsEditor,
  type NewsCategoryOption,
} from "@/admin/components/NewsEditor";

export const metadata: Metadata = {
  title: "언론 보도 수정 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminPressEditPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-6">
      <BackLink />
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong">
          언론 보도 수정
        </h1>
      </header>
      <Suspense fallback={<EditorLoading />}>
        <EditPressData paramsPromise={props.params} />
      </Suspense>
    </div>
  );
}

async function EditPressData({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  // board="press" 스코프라 활동 스토리 글 id 로 접근하면 notFound — 게시판 간 교차 편집 차단 (ADR-056)
  const [article, allCategories] = await Promise.all([
    getAdminNewsDetail("press", id),
    listAllCategoriesForAdmin("press"),
  ]);
  if (!article) notFound();

  // 활성 카테고리 + (수정 모드에서 현재 categoryId 가 비활성이면 유지)
  const categories: NewsCategoryOption[] = allCategories
    .filter((c) => c.isActive || c.id === article.categoryId)
    .map((c) => ({
      id: c.id,
      name: c.isActive ? c.name : `${c.name} (비활성)`,
    }));

  // cacheComponents 가 클라 상태를 보존하므로 새 push 진입마다 새 key 로 DB 현재값 재초기화
  const draftKey = crypto.randomUUID();

  return (
    <NewsEditor
      key={draftKey}
      board="press"
      mode="edit"
      categories={categories}
      initial={{
        id: article.id,
        title: article.title,
        body: article.body as JSONContent,
        categoryId: article.categoryId,
        coverImageUrl: article.coverImageUrl,
        coverImageWidth: article.coverImageWidth,
        coverImageHeight: article.coverImageHeight,
        publishedAt: article.publishedAt,
        isHidden: article.isHidden,
        tags: article.tags,
      }}
    />
  );
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
