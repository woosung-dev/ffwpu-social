// 어드민 뉴스 목록 — 페이지네이션·상태 탭·발행 토글·수정·삭제. 페이지네이션은 queryString (결정 로그 [T10 URL])
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Heart, Share2 } from "lucide-react";
import {
  deleteNewsAction,
  publishNewsAction,
} from "@/features/news/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpTip } from "@/admin/components/HelpTip";
import { ADMIN_COPY } from "@/admin/copy";
import {
  NEWS_SORT_KEYS,
  NEWS_PAGE_SIZES,
  DEFAULT_NEWS_PAGE_SIZE,
  type NewsSort,
  type NewsPageSize,
} from "@/features/news/admin-sort";

export type NewsRow = {
  id: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewsStatus = "all" | "draft" | "scheduled" | "published";
type NewsPublishState = Exclude<NewsStatus, "all">;

export type NewsStats = {
  views: number;
  heartClicks: number;
  shareClicks: number;
};
export type NewsStatsMap = Record<string, NewsStats>;

type Props = {
  rows: NewsRow[];
  page: number;
  totalPages: number;
  status: NewsStatus;
  sort: NewsSort;
  pageSize: NewsPageSize;
  stats: NewsStatsMap;
};

// 정렬 라벨 — 키는 admin-sort.ts SSoT, 운영자 대면 문구는 이 렌더러에 (STATUS_LABEL 패턴 동일)
const SORT_LABEL: Record<NewsSort, string> = {
  published_desc: "발행일 최신순",
  published_asc: "발행일 오래된순",
  title_asc: "제목 가나다순",
  created_desc: "작성일 최신순",
  views_desc: "조회 많은순",
  hearts_desc: "공감 많은순",
};

const STATUS_LABEL: Record<NewsStatus, string> = {
  all: "전체",
  draft: "임시 저장",
  scheduled: "예약",
  published: "발행",
};

const STATUS_BADGE_CLASS: Record<NewsPublishState, string> = {
  draft: "rounded-full bg-warm/15 px-2 py-1 text-xs font-medium text-amber-700",
  scheduled:
    "rounded-full bg-kpi-lime/30 px-2 py-1 text-xs font-medium text-ink-strong",
  published:
    "rounded-full bg-brand-primary/10 px-2 py-1 text-xs font-medium text-brand-primary",
};

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// 발행일 표시 — 기본 정렬(발행일 최신순) 검증용. 임시저장은 발행일 없음 → '미발행'
function formatPublishDate(publishedAt: Date | null): string {
  return publishedAt ? formatDate(publishedAt) : "미발행";
}

function getPublishState(publishedAt: Date | null): NewsPublishState {
  if (!publishedAt) return "draft";
  return new Date(publishedAt).getTime() > Date.now() ? "scheduled" : "published";
}

// 글별 누적 반응 — 아이콘 + 숫자. 지표명은 hover(title)·스크린리더(aria-label)로 표시(영역 절약, 운영자 요청)
function StatCell({ s }: { s: NewsStats | undefined }) {
  const v = s?.views ?? 0;
  const h = s?.heartClicks ?? 0;
  const sh = s?.shareClicks ?? 0;
  return (
    <span className="inline-flex items-center gap-3 text-xs tabular-nums text-ink-subtle">
      <span className="inline-flex items-center gap-1" title="조회" aria-label={`조회 ${v}`}>
        <Eye className="size-3.5" aria-hidden />
        {v}
      </span>
      <span
        className="inline-flex items-center gap-1"
        title="공감 클릭"
        aria-label={`공감 클릭 ${h}`}
      >
        <Heart className="size-3.5" aria-hidden />
        {h}
      </span>
      <span
        className="inline-flex items-center gap-1"
        title="공유 클릭"
        aria-label={`공유 클릭 ${sh}`}
      >
        <Share2 className="size-3.5" aria-hidden />
        {sh}
      </span>
    </span>
  );
}

export function NewsTable({
  rows,
  page,
  totalPages,
  status,
  sort,
  pageSize,
  stats,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const setStatus = (newStatus: NewsStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === "all") params.delete("status");
    else params.set("status", newStatus);
    params.delete("page");
    router.push(`/admin/news?${params}`);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/admin/news?${params}`);
  };

  // 정렬 변경 — 기본값(발행일 최신순)이면 쿼리 비움, 페이지는 1로 리셋. tab=manage 등 다른 파라미터는 보존
  const setSort = (newSort: NewsSort) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "published_desc") params.delete("sort");
    else params.set("sort", newSort);
    params.delete("page");
    router.push(`/admin/news?${params}`);
  };

  // 페이지당 개수 변경 — 기본값(10)이면 쿼리 비움, 페이지는 1로 리셋(개수 변경 시 현재 page 가 범위 밖일 수 있음)
  const setPageSize = (newSize: NewsPageSize) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSize === DEFAULT_NEWS_PAGE_SIZE) params.delete("pageSize");
    else params.set("pageSize", String(newSize));
    params.delete("page");
    router.push(`/admin/news?${params}`);
  };

  const togglePublish = (id: string, currentlyPublished: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await publishNewsAction(id, !currentlyPublished);
      if (!result.success) {
        const msg =
          typeof result.error === "string" ? result.error : "변경 실패";
        setError(msg);
        return;
      }
      router.refresh();
    });
  };

  const onConfirmDelete = () => {
    if (!confirmId) return;
    const targetId = confirmId;
    setError(null);
    startTransition(async () => {
      const result = await deleteNewsAction(targetId);
      if (!result.success) {
        const msg =
          typeof result.error === "string" ? result.error : "삭제 실패";
        setError(msg);
        return;
      }
      setConfirmId(null);
      router.refresh();
    });
  };

  // 행 액션 — 데스크탑 테이블/모바일 카드 공용
  const renderRowActions = (row: NewsRow, hasPublishAt: boolean) => (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => togglePublish(row.id, hasPublishAt)}
        disabled={isPending}
      >
        {hasPublishAt ? "해제" : "발행"}
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/news/${row.id}/edit`}>수정</Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirmId(row.id)}
        disabled={isPending}
        className="text-destructive hover:text-destructive"
      >
        삭제
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 상태 탭 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(["all", "draft", "scheduled", "published"] as const).map((s) => (
            <Button
              key={s}
              variant={status === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatus(s)}
              disabled={isPending}
            >
              {STATUS_LABEL[s]}
            </Button>
          ))}
          <HelpTip>{ADMIN_COPY.news.statusHelp}</HelpTip>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* 정렬 — 기본 발행일 최신순. URL ?sort= 구동(뒤로가기 시 정렬 보존) */}
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as NewsSort)}
            disabled={isPending}
          >
            <SelectTrigger className="h-9 w-[148px]" aria-label="정렬 기준">
              <span className="text-ink-subtle">정렬</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NEWS_SORT_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {SORT_LABEL[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* 페이지당 개수 — URL ?pageSize= 구동(기본 10). 정렬 Select 와 동일 패턴 */}
          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v) as NewsPageSize)}
            disabled={isPending}
          >
            <SelectTrigger className="h-9 w-[124px]" aria-label="페이지당 개수">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NEWS_PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}개씩 보기
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/admin/news/new">+ 새 글</Link>
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="rounded text-xs underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 focus-visible:ring-offset-2"
            aria-label="닫기"
          >
            닫기
          </button>
        </div>
      )}

      {/* 테이블 */}
      <Card>
        <CardContent className="pt-6">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-subtle">
              {status === "all"
                ? "등록된 글이 없습니다."
                : `${STATUS_LABEL[status]} 상태의 글이 없습니다.`}
            </p>
          ) : (
            <>
              {/* 데스크탑 — 테이블 (md 이상) */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="border-b text-ink-subtle">
                    <tr className="text-left">
                      <th className="py-3 pr-4 font-medium">제목</th>
                      <th className="py-3 pr-4 font-medium">카테고리</th>
                      <th className="py-3 pr-4 font-medium">상태</th>
                      <th className="py-3 pr-4 font-medium">발행일</th>
                      <th className="py-3 pr-4 font-medium">
                        <span className="inline-flex items-center gap-1">
                          반응
                          <HelpTip>{ADMIN_COPY.news.statsHelp}</HelpTip>
                        </span>
                      </th>
                      <th className="py-3 font-medium text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const state = getPublishState(row.publishedAt);
                      const hasPublishAt = row.publishedAt !== null;
                      return (
                        <tr
                          key={row.id}
                          className="border-b last:border-b-0 transition-colors hover:bg-surface-soft/60"
                        >
                          <td className="py-3 pr-4 font-medium text-ink-strong">
                            <Link
                              href={`/admin/news/${row.id}/edit`}
                              className="rounded transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2"
                            >
                              {row.title}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 text-ink-subtle">
                            {row.categoryName}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={STATUS_BADGE_CLASS[state]}>
                              {STATUS_LABEL[state]}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-ink-subtle">
                            {formatPublishDate(row.publishedAt)}
                          </td>
                          <td className="py-3 pr-4">
                            <StatCell s={stats[row.id]} />
                          </td>
                          <td className="py-3 text-right">
                            {renderRowActions(row, hasPublishAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 모바일 — 카드 (md 미만, 가로 스크롤 없이 관리 버튼 도달) */}
              <ul className="space-y-3 md:hidden">
                {rows.map((row) => {
                  const state = getPublishState(row.publishedAt);
                  const hasPublishAt = row.publishedAt !== null;
                  return (
                    <li
                      key={row.id}
                      className="space-y-2 rounded-lg border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/admin/news/${row.id}/edit`}
                          className="rounded font-medium text-ink-strong transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2"
                        >
                          {row.title}
                        </Link>
                        <span
                          className={`shrink-0 ${STATUS_BADGE_CLASS[state]}`}
                        >
                          {STATUS_LABEL[state]}
                        </span>
                      </div>
                      <p className="text-xs text-ink-subtle">
                        {row.categoryName} · {formatPublishDate(row.publishedAt)}
                      </p>
                      <StatCell s={stats[row.id]} />
                      {renderRowActions(row, hasPublishAt)}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(p)}
              disabled={isPending}
            >
              {p}
            </Button>
          ))}
        </div>
      )}

      {/* 삭제 확인 Dialog */}
      <Dialog
        open={confirmId !== null}
        onOpenChange={(open) => !open && setConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>글 삭제</DialogTitle>
            <DialogDescription className="text-sm text-ink-subtle">
              정말로 이 글을 삭제하시겠습니까? 본문 이미지·태그도 함께 삭제되며 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmId(null)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={isPending}
            >
              {isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
