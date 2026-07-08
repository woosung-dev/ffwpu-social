// 어드민 공지 목록 — NewsTable 축소 미러(카테고리·정렬·통계 제거, 첨부 열 추가). 페이지네이션·상태 탭·검색은 queryString
"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Paperclip, Pin, Search, X } from "lucide-react";
import {
  deleteNoticeAction,
  publishNoticeAction,
} from "@/features/notices/actions";
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
import { HelpTip } from "@/admin/components/HelpTip";
import { ADMIN_COPY } from "@/admin/copy";

export type NoticeRow = {
  id: string;
  title: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  attachmentCount: number;
  pinned: boolean;
};

// 상위 고정 표시 — 목록 상단 고정 관리 카드가 조작, 여기선 읽기 배지만
function PinnedBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary"
      title="상위 고정된 공지"
    >
      <Pin className="size-3" aria-hidden />
      고정
    </span>
  );
}

export type NoticeStatus = "all" | "draft" | "scheduled" | "published";
type NoticePublishState = Exclude<NoticeStatus, "all">;

export const NOTICE_SEARCH_MAX_LENGTH = 100;

type Props = {
  rows: NoticeRow[];
  page: number;
  totalPages: number;
  total: number;
  status: NoticeStatus;
  q: string;
};

// 제목 검색 필드 — 300ms 디바운스 + ✕ 클리어 (NewsTable AdminSearchField 동일 패턴)
function NoticeSearchField({
  committed,
  onCommit,
}: {
  committed: string;
  onCommit: (value: string) => void;
}) {
  const [value, setValue] = useState(committed);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (committed !== valueRef.current.trim()) setValue(committed);
  }, [committed]);

  useEffect(() => {
    if (value.trim() === committed) return;
    const timer = setTimeout(() => onCommit(value.trim()), 300);
    return () => clearTimeout(timer);
  }, [value, committed, onCommit]);

  return (
    <div className="relative flex h-11 w-full items-center md:max-w-sm">
      <span className="pointer-events-none absolute left-3 text-ink-subtle" aria-hidden>
        <Search className="size-4" aria-hidden />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="제목 검색"
        aria-label="제목으로 검색"
        maxLength={NOTICE_SEARCH_MAX_LENGTH}
        className="h-11 w-full min-w-0 rounded-md border border-input bg-transparent pl-9 pr-9 text-sm text-ink-strong outline-none transition-colors placeholder:text-ink-subtle focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            onCommit("");
          }}
          aria-label="검색어 지우기"
          className="absolute right-2 flex size-7 items-center justify-center rounded-full text-ink-subtle transition-colors hover:text-ink-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

const STATUS_LABEL: Record<NoticeStatus, string> = {
  all: "전체",
  draft: "임시 저장",
  scheduled: "예약",
  published: "발행",
};

const STATUS_BADGE_CLASS: Record<NoticePublishState, string> = {
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

function formatPublishDate(publishedAt: Date | null): string {
  return publishedAt ? formatDate(publishedAt) : "미발행";
}

function getPublishState(publishedAt: Date | null): NoticePublishState {
  if (!publishedAt) return "draft";
  return new Date(publishedAt).getTime() > Date.now() ? "scheduled" : "published";
}

// 첨부 개수 — 클립 아이콘 + 숫자 (0개면 미표시)
function AttachmentCell({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs tabular-nums text-ink-subtle"
      title="첨부파일"
      aria-label={`첨부파일 ${count}개`}
    >
      <Paperclip className="size-3.5" aria-hidden />
      {count}
    </span>
  );
}

export function NoticesTable({ rows, page, totalPages, total, status, q }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const setQ = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      params.delete("page");
      startTransition(() => router.push(`/admin/notices?${params}`));
    },
    [router, searchParams],
  );

  const setStatus = (newStatus: NoticeStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === "all") params.delete("status");
    else params.set("status", newStatus);
    params.delete("page");
    router.push(`/admin/notices?${params}`);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/admin/notices?${params}`);
  };

  const togglePublish = (id: string, currentlyPublished: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await publishNoticeAction(id, !currentlyPublished);
      if (!result.success) {
        const msg = typeof result.error === "string" ? result.error : "변경 실패";
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
      const result = await deleteNoticeAction(targetId);
      if (!result.success) {
        const msg = typeof result.error === "string" ? result.error : "삭제 실패";
        setError(msg);
        return;
      }
      setConfirmId(null);
      router.refresh();
    });
  };

  // 행 액션 — 데스크탑 테이블/모바일 카드 공용
  const renderRowActions = (row: NoticeRow, hasPublishAt: boolean) => (
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
        <Link href={`/admin/notices/${row.id}/edit`}>수정</Link>
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
      {/* 검색 + 새 공지 */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <NoticeSearchField committed={q} onCommit={setQ} />
        <Button asChild className="md:shrink-0">
          <Link href="/admin/notices/new">+ 새 공지</Link>
        </Button>
      </div>

      {/* 상태 탭 */}
      <div className="flex flex-wrap items-center gap-2">
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
        <HelpTip>{ADMIN_COPY.notices.statusHelp}</HelpTip>
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

      <p className="text-xs text-ink-subtle" aria-live="polite">
        총 {total}건
      </p>

      {/* 테이블 */}
      <Card>
        <CardContent className="pt-6">
          {rows.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-ink-subtle">
                {q
                  ? "검색 조건에 맞는 공지가 없어요."
                  : status === "all"
                    ? "등록된 공지가 없습니다."
                    : `${STATUS_LABEL[status]} 상태의 공지가 없습니다.`}
              </p>
              {q && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setQ("")}
                  disabled={isPending}
                >
                  검색 조건 지우기
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* 데스크탑 — 테이블 (md 이상) */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="border-b text-ink-subtle">
                    <tr className="text-left">
                      <th className="py-3 pr-4 font-medium">제목</th>
                      <th className="py-3 pr-4 font-medium">첨부</th>
                      <th className="py-3 pr-4 font-medium">상태</th>
                      <th className="py-3 pr-4 font-medium">발행일</th>
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
                            <span className="flex min-w-0 items-center gap-2">
                              {row.pinned && <PinnedBadge />}
                              <Link
                                href={`/admin/notices/${row.id}/edit`}
                                className="truncate rounded transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2"
                              >
                                {row.title}
                              </Link>
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <AttachmentCell count={row.attachmentCount} />
                          </td>
                          <td className="py-3 pr-4">
                            <span className={STATUS_BADGE_CLASS[state]}>
                              {STATUS_LABEL[state]}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-ink-subtle">
                            {formatPublishDate(row.publishedAt)}
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
                        <span className="flex min-w-0 flex-wrap items-center gap-2">
                          {row.pinned && <PinnedBadge />}
                          <Link
                            href={`/admin/notices/${row.id}/edit`}
                            className="rounded font-medium text-ink-strong transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2"
                          >
                            {row.title}
                          </Link>
                        </span>
                        <span className={`shrink-0 ${STATUS_BADGE_CLASS[state]}`}>
                          {STATUS_LABEL[state]}
                        </span>
                      </div>
                      <p className="flex items-center gap-2 text-xs text-ink-subtle">
                        {formatPublishDate(row.publishedAt)}
                        <AttachmentCell count={row.attachmentCount} />
                      </p>
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
            <DialogTitle>공지 삭제</DialogTitle>
            <DialogDescription className="text-sm text-ink-subtle">
              정말로 이 공지를 삭제하시겠습니까? 본문 이미지·첨부파일도 함께 삭제되며 되돌릴 수 없습니다.
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
