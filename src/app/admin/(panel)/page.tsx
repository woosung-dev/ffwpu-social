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
          <h1 className="text-2xl font-bold text-ink-strong">대시보드</h1>
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

async function DashboardData() {
  const data = await getAdminDashboard(5);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">최근 글 5건</CardTitle>
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
                    className="flex items-center justify-between gap-4 hover:text-brand-primary"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className={
                          item.publishedAt
                            ? "shrink-0 rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary"
                            : "shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-ink-subtle"
                        }
                      >
                        {item.publishedAt ? "발행" : "임시"}
                      </span>
                      <span className="truncate font-medium text-ink-strong">
                        {item.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-ink-subtle">
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
          <CardTitle className="text-lg">카테고리별 글 수</CardTitle>
        </CardHeader>
        <CardContent>
          {data.perCategory.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-subtle">
              활성 카테고리가 없습니다.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.perCategory.map((c) => (
                <span
                  key={c.categoryId}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-soft px-3 py-1 text-xs"
                >
                  <span className="font-medium text-ink-strong">
                    {c.categoryName}
                  </span>
                  <span className="text-ink-subtle">{c.count}</span>
                </span>
              ))}
            </div>
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
