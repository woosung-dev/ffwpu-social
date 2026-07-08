// 어드민 공지 수정 — Server Component + Suspense. params 는 Suspense 자식에서 await (Cache Components 호환)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import { getAdminNoticeDetail } from "@/features/notices";
import { NoticeEditor } from "@/admin/components/NoticeEditor";

export const metadata: Metadata = {
  title: "공지 수정 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminNoticeEditPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-6">
      <BackLink />
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong">
          공지 수정
        </h1>
      </header>
      <Suspense fallback={<EditorLoading />}>
        <EditNoticeData paramsPromise={props.params} />
      </Suspense>
    </div>
  );
}

async function EditNoticeData({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const notice = await getAdminNoticeDetail(id);
  if (!notice) notFound();

  // cacheComponents 가 네비게이션 간 클라 상태를 보존하므로 새 push 진입마다 새 key 로
  // DB 현재값(initial) 재초기화 (news edit 동일). back/forward 는 세그먼트 복원이라 입력 보존.
  const draftKey = crypto.randomUUID();

  return (
    <NoticeEditor
      key={draftKey}
      mode="edit"
      initial={{
        id: notice.id,
        title: notice.title,
        body: notice.body as JSONContent,
        publishedAt: notice.publishedAt,
        attachments: notice.attachments,
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
      href="/admin/notices"
      className="inline-flex items-center gap-1 text-xs text-ink-subtle hover:text-ink-strong"
    >
      <ChevronLeft className="h-3 w-3" />
      목록으로
    </Link>
  );
}
