// 인증된 패널 레이아웃 — 세션 검증 + 사이드바·헤더 골격
import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '../../auth';
import { Button } from '@myorg/ui-base/components/button';

async function signOutAction(): Promise<void> {
  'use server';
  await signOut({ redirectTo: '/login' });
}

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-border bg-card p-4">
        <nav className="space-y-1 text-sm">
          <h2 className="mb-3 px-2 text-xs font-semibold uppercase text-muted-foreground">
            Admin
          </h2>
          <Link
            href="/dashboard"
            className="block rounded px-2 py-1.5 hover:bg-muted"
          >
            대시보드
          </Link>
          <Link href="/news" className="block rounded px-2 py-1.5 hover:bg-muted">
            소식 관리
          </Link>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <span className="text-sm text-muted-foreground">{session.user.email}</span>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              로그아웃
            </Button>
          </form>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
