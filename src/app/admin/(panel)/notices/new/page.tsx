// 어드민 새 공지 작성 — Server Component. connection() 으로 동적 스코프 확보 후 draftKey 생성 (PPR 정적 셸 고정 방지)
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { NoticeEditor } from "@/admin/components/NoticeEditor";

export const metadata: Metadata = {
  title: "새 공지 작성 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminNoticeNewPage() {
  return (
    <div className="space-y-6">
      <BackLink />
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong">
          새 공지 작성
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
  // cacheComponents 가 네비게이션 간 NoticeEditor 클라 상태를 보존(React Activity)하므로, 새 push 진입마다
  // 새 key 로 깨끗한 폼 리마운트 (news/new 동일). 공지는 fetch 가 없어 connection() 으로 동적 스코프를 만든다 —
  // 정적 셸에 draftKey 가 구워지면 모든 진입이 같은 key 를 받아 리마운트가 무력화됨.
  await connection();
  const draftKey = crypto.randomUUID();
  return <NoticeEditor key={draftKey} mode="new" />;
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
