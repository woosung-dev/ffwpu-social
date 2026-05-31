// 어드민 대시보드 — 최근 5건 + 카테고리별 글 수 (활성만, 결정 로그 [T11 활성만]). Suspense 패턴 (결정 #17)
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { getAdminDashboard } from "@/features/news";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "대시보드 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong">대시보드</h1>
          <p className="text-sm text-ink-subtle">
            최근 작성된 글과 카테고리별 분포를 확인합니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/news/new" className="gap-1">
            <Plus className="h-4 w-4" />새 글 작성
          </Link>
        </Button>
      </header>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardData />
      </Suspense>
    </div>
  );
}

// 카테고리 칩 색 4분배 — admin-system §2 보라 ≤ 50% 한도. index 기반 회전.
const CATEGORY_CHIP_PALETTE = [
  "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  "bg-warm/15 text-amber-700 border-warm/30",
  "bg-kpi-lime/30 text-ink-strong border-kpi-lime/60",
  "bg-brand-mid/15 text-brand-mid border-brand-mid/30",
] as const;

async function DashboardData() {
  const data = await getAdminDashboard(5);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl">최근 글 5건</CardTitle>
        </CardHeader>
        <CardContent>
          {data.latest.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-subtle">
              아직 작성된 글이 없습니다.
            </p>
          ) : (
            <ul className="divide-y">
              {data.latest.map((item) => (
                <li key={item.id} className="py-3">
                  <Link
                    href={`/admin/news/${item.id}/edit`}
                    className="-mx-2 flex items-center justify-between gap-4 rounded-md px-2 py-1 transition-colors hover:bg-surface-soft/60 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className={
                          item.publishedAt
                            ? "shrink-0 rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary"
                            : "shrink-0 rounded-full bg-warm/15 px-2 py-0.5 text-xs font-medium text-amber-700"
                        }
                      >
                        {item.publishedAt ? "발행" : "임시"}
                      </span>
                      <span className="truncate font-medium text-ink-strong">
                        {item.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-ink-date">
                      {item.categoryName} · {formatDate(item.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">카테고리별 글 수</CardTitle>
        </CardHeader>
        <CardContent>
          {data.perCategory.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-subtle">
              활성 카테고리가 없습니다.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.perCategory.map((c, i) => {
                const palette =
                  CATEGORY_CHIP_PALETTE[i % CATEGORY_CHIP_PALETTE.length];
                return (
                  <li
                    key={c.categoryId}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${palette}`}
                  >
                    <span className="truncate text-sm font-medium">
                      {c.categoryName}
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {c.count}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-busy>
      <div className="h-64 animate-pulse rounded-md bg-muted/60 lg:col-span-2" />
      <div className="h-64 animate-pulse rounded-md bg-muted/60" />
    </div>
  );
}
