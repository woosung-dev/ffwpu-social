// 어드민 홈 팝업 관리 목록 — Server Component + Suspense (Cache Components). DB 조회는 Suspense 자식에서 수행
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { listPopupsForAdmin } from "@/features/popups";
import { PopupTable, type PopupRow } from "@/admin/components/PopupTable";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { ADMIN_COPY } from "@/admin/copy";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "팝업 관리 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminPopupsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ADMIN_COPY.popups.title}
        description={ADMIN_COPY.popups.description}
        action={
          <Button asChild>
            <Link href="/admin/popups/new">새 팝업</Link>
          </Button>
        }
      />
      <p className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-ink-subtle">
        {ADMIN_COPY.popups.displayHelp}
      </p>
      <Suspense fallback={<ListLoading />}>
        <PopupsData />
      </Suspense>
    </div>
  );
}

async function PopupsData() {
  const popups = await listPopupsForAdmin();
  const rows: PopupRow[] = popups.map((popup) => ({
    id: popup.id,
    title: popup.title,
    imageUrl: popup.imageUrl,
    startsAt: popup.startsAt,
    endsAt: popup.endsAt,
    isActive: popup.isActive,
  }));
  return <PopupTable rows={rows} />;
}

function ListLoading() {
  return <div className="h-64 animate-pulse rounded-md bg-muted/60" aria-busy />;
}
