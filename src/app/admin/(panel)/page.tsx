// 어드민 대시보드 — 최근 콘텐츠 분석(기간 선택 7/30/90) + 글 현황 + 빠른 작업(운영자 요청 순서). 글 목록 관리는 /admin/news 로 분리 (운영자 피드백 [대시보드/글 분리]).
// 분석 본문은 독립 ErrorBoundary+Suspense 로 격리 — 조회 실패(예: analytics_events 미마이그레이션)가 대시보드 전체를 죽이지 않게 부분 degrade. 헤더·기간 선택은 항상 렌더.
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ExternalLink, Newspaper, Plus, Sparkles } from "lucide-react";
import { getAdminAnalyticsDashboard } from "@/features/analytics";
import { getAdminDashboard } from "@/features/news";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { HelpTip } from "@/admin/components/HelpTip";
import {
  ADMIN_COPY,
  ANALYTICS_PERIODS,
  normalizeAnalyticsDays,
} from "@/admin/copy";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const C = ADMIN_COPY.dashboard;

export const metadata: Metadata = {
  title: "대시보드 | 사회공헌단 어드민",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title={C.title} description={C.description} />

      {/* 운영자 요청 순서: 최근 콘텐츠 분석 → 글 현황 → 빠른 작업 */}
      <Suspense fallback={<AnalyticsCardLoading />}>
        <AnalyticsCard searchParamsPromise={searchParams} />
      </Suspense>

      <Suspense fallback={<StatusLoading />}>
        <StatusSection />
      </Suspense>

      <QuickActions />
    </div>
  );
}

// 분석 카드 — searchParams(동적)는 Suspense 경계 안에서 await (Cache Components: 동적 접근은 Suspense 안에서만, 아니면 라우트 전체 블로킹)
async function AnalyticsCard({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ days?: string }>;
}) {
  const { days: rawDays } = await searchParamsPromise;
  const days = normalizeAnalyticsDays(rawDays);
  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-1.5 text-xl">
            {C.analyticsTitle}
            <HelpTip>{C.analyticsDescription}</HelpTip>
          </CardTitle>
          <PeriodSelector current={days} />
        </div>
      </CardHeader>
      <CardContent>
        <ErrorBoundary fallback={<AnalyticsBodyUnavailable />}>
          <Suspense key={days} fallback={<AnalyticsBodyLoading />}>
            <AnalyticsBody days={days} />
          </Suspense>
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
}

// ─── 글 현황 (발행·임시저장·예약) — 관리형 목록 대신 한눈 요약 ───
async function StatusSection() {
  const { statusCounts } = await getAdminDashboard();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatusCard
        label={C.statusPublished}
        value={statusCounts.published}
        tone="text-brand-primary"
      />
      <StatusCard
        label={C.statusDraft}
        value={statusCounts.draft}
        tone="text-amber-700"
      />
      <StatusCard
        label={C.statusScheduled}
        value={statusCounts.scheduled}
        tone="text-brand-mid"
      />
    </div>
  );
}

function StatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-white px-5 py-4">
      <p className={cn("text-3xl font-extrabold tabular-nums", tone)}>
        {value.toLocaleString("ko-KR")}
      </p>
      <p className="mt-1 text-sm text-ink-subtle">{label}</p>
    </div>
  );
}

// ─── 빠른 작업 바로가기 ───
function QuickActions() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-xl">{C.quickTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <QuickLink
            href="/admin/news/new"
            icon={<Plus className="size-5" aria-hidden />}
            title={C.quickNew}
            sub={C.quickNewSub}
          />
          <QuickLink
            href="/admin/news"
            icon={<Newspaper className="size-5" aria-hidden />}
            title={C.quickNews}
            sub={C.quickNewsSub}
          />
          <QuickLink
            href="/admin/landing"
            icon={<Sparkles className="size-5" aria-hidden />}
            title={C.quickMain}
            sub={C.quickMainSub}
          />
          <QuickLink
            href={SITE_URL}
            external
            icon={<ExternalLink className="size-5" aria-hidden />}
            title={C.quickSite}
            sub={C.quickSiteSub}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLink({
  href,
  icon,
  title,
  sub,
  external,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  sub: string;
  external?: boolean;
}) {
  const className =
    "flex flex-col gap-2 rounded-lg border border-border bg-white p-4 transition-colors hover:border-brand-bright hover:bg-brand-pale/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2";
  const inner = (
    <>
      <span className="grid size-9 place-items-center rounded-lg bg-tag-bg text-brand-primary">
        {icon}
      </span>
      <span className="text-sm font-semibold text-ink-strong">{title}</span>
      <span className="text-xs text-ink-subtle">{sub}</span>
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

// ─── 기간 선택 (서버 렌더 + Link ?days= — 클라 패칭 없음, 공유 가능 URL) ───
function PeriodSelector({ current }: { current: number }) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-surface-soft p-0.5"
      role="group"
      aria-label={C.periodLabel}
    >
      {ANALYTICS_PERIODS.map((p) => {
        const active = p.days === current;
        return (
          <Link
            key={p.days}
            href={`/admin?days=${p.days}`}
            scroll={false}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
              active
                ? "bg-white text-brand-primary shadow-sm"
                : "text-ink-subtle hover:text-ink-strong",
            )}
          >
            {p.label}
          </Link>
        );
      })}
    </div>
  );
}

// ─── 분석 본문 — 기간(days)으로 집계. 실패 시 상위 ErrorBoundary 가 격리 ───
async function AnalyticsBody({ days }: { days: number }) {
  const analytics = await getAdminAnalyticsDashboard(days);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label={C.metricViews} value={analytics.totals.views} />
        <Metric
          label={C.metricUniqueViewers}
          value={analytics.totals.uniqueViewers}
        />
        <Metric label={C.metricHeart} value={analytics.totals.heartClicks} />
        <Metric label={C.metricShare} value={analytics.totals.shareClicks} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <h3 className="text-sm font-semibold text-ink-strong">
            {C.popularTitle}
          </h3>
          {analytics.topNews.length === 0 ? (
            <p className="mt-3 text-sm text-ink-subtle">{C.popularEmpty}</p>
          ) : (
            <ul className="mt-3 divide-y">
              {analytics.topNews.map((item) => (
                <li
                  key={item.newsId}
                  className="flex items-center justify-between gap-4 py-2"
                >
                  <Link
                    href={`/admin/news/${item.newsId}/edit`}
                    className="min-w-0 truncate text-sm font-medium text-ink-strong hover:text-brand-primary"
                  >
                    {item.title}
                  </Link>
                  <span className="shrink-0 text-xs tabular-nums text-ink-subtle">
                    {C.metricViews} {item.views} · {C.metricHeart}{" "}
                    {item.heartClicks} · {C.metricShare} {item.shareClicks}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink-strong">
            {C.referrerTitle}
          </h3>
          {analytics.referrers.length === 0 ? (
            <p className="mt-3 text-sm text-ink-subtle">{C.referrerEmpty}</p>
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
    </div>
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

function StatusLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="h-24 animate-pulse rounded-lg bg-muted/60" />
      <div className="h-24 animate-pulse rounded-lg bg-muted/60" />
      <div className="h-24 animate-pulse rounded-lg bg-muted/60" />
    </div>
  );
}

function AnalyticsCardLoading() {
  return <div className="h-72 animate-pulse rounded-xl bg-muted/60" aria-busy />;
}

function AnalyticsBodyLoading() {
  return <div className="h-48 animate-pulse rounded-md bg-muted/60" aria-busy />;
}

// 분석 조회 실패 시 폴백 — 카드 헤더·기간 선택은 유지, 본문만 대체. (대표 원인: 프로덕션 DB 에 0007 미적용 → analytics_events 없음)
function AnalyticsBodyUnavailable() {
  return (
    <p className="py-6 text-center text-sm text-ink-subtle">
      {C.analyticsUnavailable}
    </p>
  );
}
