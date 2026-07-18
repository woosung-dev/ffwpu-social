// 어드민 홈 팝업 수정 — Server Component + Suspense. params 는 Suspense 자식에서 await (Cache Components 호환)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";
import { getPopupById } from "@/features/popups";
import { PopupEditor } from "@/admin/components/PopupEditor";

export const metadata: Metadata = {
  title: "팝업 수정 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminPopupEditPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-6">
      <BackLink />
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong">팝업 수정</h1>
      </header>
      <Suspense fallback={<EditorLoading />}>
        <EditPopupData paramsPromise={props.params} />
      </Suspense>
    </div>
  );
}

async function EditPopupData({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  if (!z.uuid().safeParse(id).success) notFound();
  const popup = await getPopupById(id);
  if (!popup) notFound();

  // cacheComponents 가 네비게이션 간 클라 상태를 보존하므로 새 진입마다 새 key 로 DB 현재값 재초기화 (notices edit 동일)
  const draftKey = crypto.randomUUID();

  return (
    <PopupEditor
      key={draftKey}
      mode="edit"
      initial={{
        id: popup.id,
        title: popup.title,
        imageUrl: popup.imageUrl,
        imageWidth: popup.imageWidth,
        imageHeight: popup.imageHeight,
        linkUrl: popup.linkUrl,
        linkTarget: popup.linkTarget,
        startsAt: popup.startsAt,
        endsAt: popup.endsAt,
        isActive: popup.isActive,
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
    <Link href="/admin/popups" className="inline-flex items-center gap-1 text-xs text-ink-subtle hover:text-ink-strong">
      <ChevronLeft className="h-3 w-3" />
      목록으로
    </Link>
  );
}
