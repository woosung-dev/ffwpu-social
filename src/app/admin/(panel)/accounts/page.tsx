// 관리자 계정 관리 페이지 — 목록 + 추가/재설정/삭제. super 단독 접근 (proxy 게이트). 동적 데이터는 Suspense 격리
import type { Metadata } from "next";
import { Suspense } from "react";

import { auth } from "@/auth";
import { listAccounts } from "@/features/accounts";
import { AccountManager } from "@/admin/components/AccountManager";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { ADMIN_COPY } from "@/admin/copy";

export const metadata: Metadata = {
  title: "관리자 계정 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminAccountsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ADMIN_COPY.accounts.title}
        description={ADMIN_COPY.accounts.description}
      />
      <Suspense fallback={<AccountsLoading />}>
        <AccountsData />
      </Suspense>
    </div>
  );
}

async function AccountsData() {
  const [session, accounts] = await Promise.all([auth(), listAccounts()]);
  const currentUserId = session?.user?.id ?? "";
  const superCount = accounts.filter((a) => a.role === "super").length;
  return (
    <AccountManager
      accounts={accounts}
      currentUserId={currentUserId}
      superCount={superCount}
    />
  );
}

function AccountsLoading() {
  return (
    <div className="space-y-4" aria-busy>
      <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
      <div className="h-64 animate-pulse rounded-xl bg-muted/60" />
    </div>
  );
}
