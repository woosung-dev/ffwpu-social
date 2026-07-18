// 어드민 새 홈 팝업 작성 — Server Component + Suspense. connection() 으로 동적 스코프 확보 후 draftKey 생성 (Cache Components 호환)
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { PopupEditor } from "@/admin/components/PopupEditor";

export const metadata: Metadata = {
  title: "새 팝업 등록 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminPopupNewPage() {
  return (
    <div className="space-y-6">
      <BackLink />
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong">새 팝업 등록</h1>
        <p className="text-sm text-ink-subtle">홈 화면에 표시할 팝업을 등록합니다.</p>
      </header>
      <Suspense fallback={<EditorLoading />}>
        <NewEditorData />
      </Suspense>
    </div>
  );
}

async function NewEditorData() {
  // cacheComponents 가 네비게이션 간 클라 상태를 보존하므로 새 진입마다 새 key 로 폼 리마운트 (notices/new 동일).
  // 정적 셸에 draftKey 가 구워지지 않도록 connection() 으로 동적 스코프를 만든다.
  await connection();
  const draftKey = crypto.randomUUID();
  return <PopupEditor key={draftKey} mode="new" />;
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
    <Link href="/admin/popups" className="inline-flex items-center gap-1 text-xs text-ink-subtle hover:text-ink-strong">
      <ChevronLeft className="h-3 w-3" />
      목록으로
    </Link>
  );
}
