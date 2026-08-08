// 어드민 글 수정 — Server Component + Suspense. params 는 Suspense 자식에서 await (Cache Components 호환)
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
  title: "글 수정 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminNewsEditPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-6">
      <BackLink />
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong">글 수정</h1>
      </header>
      <Suspense fallback={<EditorLoading />}>
        <EditNewsData paramsPromise={props.params} />
      </Suspense>
    </div>
  );
}

async function EditNewsData({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const [news, allCategories] = await Promise.all([
    getAdminNewsDetail(id),
    listAllCategoriesForAdmin(),
  ]);
  if (!news) notFound();

  // 활성 카테고리 + (수정 모드에서 현재 categoryId 가 비활성이면 유지)
  const categories: NewsCategoryOption[] = allCategories
    .filter((c) => c.isActive || c.id === news.categoryId)
    .map((c) => ({
      id: c.id,
      name: c.isActive ? c.name : `${c.name} (비활성)`,
    }));

  // cacheComponents 가 네비게이션 간 NewsEditor 클라 상태를 보존(React Activity)하므로, 새 push 진입마다
  // 새 key 로 리마운트해 DB 현재값(initial)으로 재초기화한다(미저장 편집 잔존 차단). back/forward 는 보존.
  // key 는 React 재조정용일 뿐 — 업로드 scope·news.id 는 아래 initial.id 가 그대로 담당.
  const draftKey = crypto.randomUUID();

  return (
    <NewsEditor
      key={draftKey}
      mode="edit"
      categories={categories}
      initial={{
        id: news.id,
        title: news.title,
        body: news.body as JSONContent,
        categoryId: news.categoryId,
        coverImageUrl: news.coverImageUrl,
        coverImageWidth: news.coverImageWidth,
        coverImageHeight: news.coverImageHeight,
        publishedAt: news.publishedAt,
        isHidden: news.isHidden,
        tags: news.tags,
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
      href="/admin/news"
      className="inline-flex items-center gap-1 text-xs text-ink-subtle hover:text-ink-strong"
    >
      <ChevronLeft className="h-3 w-3" />
      목록으로
    </Link>
  );
}
