// 어드민 대시보드 — 최근 5건 + 카테고리별 글 수 (활성만, 결정 로그 [T11 활성만]). Suspense 패턴 (결정 #17)
// 분석 카드는 독립 ErrorBoundary+Suspense 로 격리 — 분석 조회 실패(예: analytics_events 미마이그레이션)가 대시보드 전체를 죽이지 않게 부분 degrade.
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { getAdminAnalyticsDashboard } from "@/features/analytics";
import { getAdminDashboard } from "@/features/news";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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

function getStatusLabel(publishedAt: Date | null): string {
  if (!publishedAt) return "임시";
  return new Date(publishedAt).getTime() > Date.now() ? "예약" : "발행";
}

function getStatusClass(publishedAt: Date | null): string {
  if (!publishedAt) return "bg-warm/15 text-amber-700";
  return new Date(publishedAt).getTime() > Date.now()
    ? "bg-kpi-lime/30 text-ink-strong"
    : "bg-brand-primary/10 text-brand-primary";
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 분석 카드는 독립 경계 — 조회 실패해도 아래 핵심 데이터(최근 글·카테고리)는 그대로 렌더 */}
        <ErrorBoundary fallback={<AnalyticsUnavailable />}>
          <Suspense fallback={<AnalyticsLoading />}>
            <AnalyticsSection />
          </Suspense>
        </ErrorBoundary>
        <Suspense fallback={<CoreLoading />}>
          <CoreSection />
        </Suspense>
      </div>
    </div>
  );
}

// 카테고리 칩 색 4분배 — admin-system §2 보라 ≤ 50% 한도. index 기반 회전.
const CATEGORY_CHIP_PALETTE = [
  "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  "bg-warm/15 text-amber-700 border-warm/30",
  "bg-kpi-lime/30 text-ink-strong border-kpi-lime/60",
  "bg-brand-mid/15 text-brand-primary border-brand-mid/30", // text-brand-mid(3.91:1)→brand-primary(9.56:1) WCAG AA
] as const;

// 최근 30일 콘텐츠 분석 — analytics_events 집계. 실패 시 상위 ErrorBoundary 가 AnalyticsUnavailable 로 격리.
async function AnalyticsSection() {
  const analytics = await getAdminAnalyticsDashboard();
  return (
    <Card className="min-w-0 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-xl">최근 30일 콘텐츠 분석</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="조회" value={analytics.totals.views} />
          <Metric label="순 방문 브라우저" value={analytics.totals.uniqueViewers} />
          <Metric label="공감 클릭" value={analytics.totals.heartClicks} />
          <Metric label="공유 클릭" value={analytics.totals.shareClicks} />
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <h3 className="text-sm font-semibold text-ink-strong">인기 글</h3>
            {analytics.topNews.length === 0 ? (
              <p className="mt-3 text-sm text-ink-subtle">
                아직 분석 이벤트가 없습니다.
              </p>
            ) : (
              <ul className="mt-3 divide-y">
                {analytics.topNews.map((item) => (
                  <li key={item.newsId} className="flex items-center justify-between gap-4 py-2">
                    <Link
                      href={`/admin/news/${item.newsId}/edit`}
                      className="min-w-0 truncate text-sm font-medium text-ink-strong hover:text-brand-primary"
                    >
                      {item.title}
                    </Link>
                    <span className="shrink-0 text-xs tabular-nums text-ink-subtle">
                      조회 {item.views} · 공감 {item.heartClicks} · 공유 {item.shareClicks}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-strong">유입 경로</h3>
            {analytics.referrers.length === 0 ? (
              <p className="mt-3 text-sm text-ink-subtle">기록된 외부 유입이 없습니다.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {analytics.referrers.map((r) => (
                  <li
                    key={r.referrer ?? "unknown"}
                    className="flex items-center justify-between gap-3 rounded-md bg-surface-soft px-3 py-2"
                  >
                    <span className="min-w-0 truncate text-xs text-ink-subtle">
                      {r.referrer}
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums">
                      {r.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 최근 글 5건 + 카테고리별 글 수 — 분석과 분리된 핵심 데이터(항상 렌더 목표).
async function CoreSection() {
  const data = await getAdminDashboard(5);
  return (
    <>
      <Card className="min-w-0 lg:col-span-2">
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
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusClass(item.publishedAt)}`}
                      >
                        {getStatusLabel(item.publishedAt)}
                      </span>
                      <span className="truncate font-medium text-ink-strong">
                        {item.title}
                      </span>
                    </div>
                    <span className="hidden shrink-0 text-xs text-ink-date sm:inline">
                      {item.categoryName} · {formatDate(item.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card className="min-w-0">
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
                    className={`flex min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-2 ${palette}`}
                  >
                    <span className="min-w-0 truncate text-sm font-medium">
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
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-white px-4 py-3">
      <p className="text-xs font-medium text-ink-subtle">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-ink-strong">
        {value.toLocaleString("ko-KR")}
      </p>
    </div>
  );
}

function AnalyticsLoading() {
  return (
    <div
      className="h-48 animate-pulse rounded-md bg-muted/60 lg:col-span-3"
      aria-busy
    />
  );
}

// 분석 조회 실패 시 폴백 — 대시보드 나머지는 유지. (대표 원인: 프로덕션 DB 에 0007 미적용 → analytics_events 없음)
function AnalyticsUnavailable() {
  return (
    <Card className="min-w-0 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-xl">최근 30일 콘텐츠 분석</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="py-6 text-center text-sm text-ink-subtle">
          분석 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      </CardContent>
    </Card>
  );
}

function CoreLoading() {
  return (
    <>
      <div className="h-64 animate-pulse rounded-md bg-muted/60 lg:col-span-2" />
      <div className="h-64 animate-pulse rounded-md bg-muted/60" />
    </>
  );
}
