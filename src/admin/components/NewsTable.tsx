// 어드민 뉴스 목록 — 페이지네이션·상태 탭·발행 토글·공개 노출 토글·수정·삭제. 페이지네이션은 queryString (결정 로그 [T10 URL])
"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Heart, Search, Share2, Tag, X } from "lucide-react";
import {
  deleteNewsAction,
  publishNewsAction,
  setNewsHiddenAction,
} from "@/features/news/actions";
import { BOARD_PATHS, type NewsBoard } from "@/features/news/board";
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
  NEWS_SEARCH_MAX_LENGTH,
  DEFAULT_NEWS_PAGE_SIZE,
  type NewsSort,
  type NewsPageSize,
} from "@/features/news/admin-sort";
import {
  canToggleVisibility,
  getPublishState,
  type NewsPublishState,
  type NewsStatus,
} from "@/features/news/publish-state";

export type NewsRow = {
  id: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  publishedAt: Date | null;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type { NewsStatus } from "@/features/news/publish-state";

export type NewsStats = {
  views: number;
  heartClicks: number;
  shareClicks: number;
};
export type NewsStatsMap = Record<string, NewsStats>;

type Props = {
  /** 어느 게시판 목록인가 (ADR-056) — 링크 경로·액션 대상·통계 노출 여부를 결정 */
  board: NewsBoard;
  rows: NewsRow[];
  page: number;
  totalPages: number;
  total: number;
  status: NewsStatus;
  sort: NewsSort;
  pageSize: NewsPageSize;
  q: string;
  tag: string;
  stats: NewsStatsMap;
};

// 어드민 목록 검색 필드 — 300ms 디바운스 + ✕ 클리어. committed(URL 반영값) 변경 시 로컬 동기화.
// 한글 입력은 300ms 디바운스가 IME 조합을 자연 코얼레스(조합 종료 후 발화) — 중간 음절 검색돼도 무해, 입력 지속 시 정제됨
function AdminSearchField({
  committed,
  onCommit,
  placeholder,
  ariaLabel,
  icon,
}: {
  committed: string;
  onCommit: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  icon: React.ReactNode;
}) {
  const [value, setValue] = useState(committed);
  // 최신 입력값 ref — sync effect 가 value 를 dep 로 갖지 않도록(타이핑마다 재동기화 방지). eslint-disable 없이 exhaustive-deps 충족
  const valueRef = useRef(value);
  valueRef.current = value;

  // 외부 committed 변경(네비게이션·다른 필드 클리어) → 로컬 입력 동기화. 입력 중 동일 값(trim)은 보존
  useEffect(() => {
    if (committed !== valueRef.current.trim()) setValue(committed);
  }, [committed]);

  // 디바운스 → URL 반영. committed 와 같아지면 멈춤(네비게이션 완료 후 루프 없음)
  useEffect(() => {
    if (value.trim() === committed) return;
    const timer = setTimeout(() => onCommit(value.trim()), 300);
    return () => clearTimeout(timer);
  }, [value, committed, onCommit]);

  return (
    <div className="relative flex h-11 w-full items-center md:flex-1">
      <span className="pointer-events-none absolute left-3 text-ink-subtle" aria-hidden>
        {icon}
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        maxLength={NEWS_SEARCH_MAX_LENGTH}
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
  published: "공개",
  hidden: "비공개",
};

const STATUS_BADGE_CLASS: Record<NewsPublishState, string> = {
  draft: "rounded-full bg-warm/15 px-2 py-1 text-xs font-medium text-amber-700",
  scheduled:
    "rounded-full bg-kpi-lime/30 px-2 py-1 text-xs font-medium text-ink-strong",
  published:
    "rounded-full bg-brand-primary/10 px-2 py-1 text-xs font-medium text-brand-primary",
  // 비공개는 회색 — 색만으로 구분하지 않도록 행 흐림 + 눈 아이콘이 함께 신호를 준다 (색 단독 의존 금지)
  hidden:
    "rounded-full bg-ink-subtle/15 px-2 py-1 text-xs font-medium text-ink-subtle",
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
  board,
  rows,
  page,
  totalPages,
  total,
  status,
  sort,
  pageSize,
  q,
  tag,
  stats,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = BOARD_PATHS[board].admin;
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 검색어 반영 — ?q=(제목)·?tag=(태그). 빈 값이면 파라미터 제거, page 리셋. AdminSearchField onCommit dep 라 useCallback 으로 안정화
  const setSearchParam = useCallback(
    (key: "q" | "tag", value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      startTransition(() => router.push(`${basePath}?${params}`));
    },
    [router, searchParams],
  );
  const setQ = useCallback(
    (value: string) => setSearchParam("q", value),
    [setSearchParam],
  );
  const setTag = useCallback(
    (value: string) => setSearchParam("tag", value),
    [setSearchParam],
  );
  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("tag");
    params.delete("page");
    startTransition(() => router.push(`${basePath}?${params}`));
  };

  const setStatus = (newStatus: NewsStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === "all") params.delete("status");
    else params.set("status", newStatus);
    params.delete("page");
    router.push(`${basePath}?${params}`);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${basePath}?${params}`);
  };

  // 정렬 변경 — 기본값(발행일 최신순)이면 쿼리 비움, 페이지는 1로 리셋. tab=manage 등 다른 파라미터는 보존
  const setSort = (newSort: NewsSort) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "published_desc") params.delete("sort");
    else params.set("sort", newSort);
    params.delete("page");
    router.push(`${basePath}?${params}`);
  };

  // 페이지당 개수 변경 — 기본값(10)이면 쿼리 비움, 페이지는 1로 리셋(개수 변경 시 현재 page 가 범위 밖일 수 있음)
  const setPageSize = (newSize: NewsPageSize) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSize === DEFAULT_NEWS_PAGE_SIZE) params.delete("pageSize");
    else params.set("pageSize", String(newSize));
    params.delete("page");
    router.push(`${basePath}?${params}`);
  };

  const togglePublish = (id: string, currentlyPublished: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await publishNewsAction(board, id, !currentlyPublished);
      if (!result.success) {
        const msg =
          typeof result.error === "string" ? result.error : "변경 실패";
        setError(msg);
        return;
      }
      router.refresh();
    });
  };

  // 공개 노출 토글 — 서버 액션 완료 후 router.refresh() 로 목록 재조회.
  // 액션의 revalidatePath 가 서버 캐시를 비우고, refresh 가 현재 화면의 RSC 페이로드를 다시 받아온다.
  // 둘 중 하나만 하면 상태 배지·행 흐림이 이전 값으로 남는다
  const toggleHidden = (id: string, currentlyHidden: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await setNewsHiddenAction(board, id, !currentlyHidden);
      if (!result.success) {
        const msg =
          typeof result.error === "string" ? result.error : "노출 변경 실패";
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
      const result = await deleteNewsAction(board, targetId);
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

  // 공개 노출 토글 버튼 — 데스크탑 테이블/모바일 카드 공용.
  // 이미 공개된 글(published·hidden)에만 노출. 예약·임시저장은 아직 공개 전이라 '발행 대기' 텍스트로 대체
  const renderVisibilityToggle = (row: NewsRow, state: NewsPublishState) => {
    if (!canToggleVisibility(state)) {
      return (
        <span className="text-xs text-ink-date">
          {state === "scheduled" ? "발행 대기" : "—"}
        </span>
      );
    }
    const hidden = state === "hidden";
    const label = hidden ? "공개로 전환" : "비공개로 전환";
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => toggleHidden(row.id, hidden)}
        disabled={isPending}
        aria-label={`${row.title} ${label}`}
        title={label}
        // 모바일 44px 터치타겟(접근성 절대제약), 데스크탑은 테이블 행 높이 유지를 위해 36px
        className={`size-11 md:size-9 ${hidden ? "bg-surface-soft text-ink-subtle" : ""}`}
      >
        {hidden ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </Button>
    );
  };

  // 행 액션 — 데스크탑 테이블/모바일 카드 공용.
  // 공개된 글의 '해제'(= publishedAt null 화)는 제거 — 발행일과 랜딩 슬롯이 날아가던 파괴적 조작이라
  // 노출 토글로 대체했다 (ADR-053). 임시저장으로 되돌리려면 에디터의 '임시 저장' 버튼을 쓴다
  const renderRowActions = (row: NewsRow, state: NewsPublishState) => (
    <div className="flex justify-end gap-1">
      {state === "draft" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePublish(row.id, false)}
          disabled={isPending}
        >
          발행
        </Button>
      )}
      {state === "scheduled" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePublish(row.id, true)}
          disabled={isPending}
        >
          예약 취소
        </Button>
      )}
      <Button asChild variant="ghost" size="sm">
        <Link href={`${basePath}/${row.id}/edit`}>수정</Link>
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
      {/* 검색 — 제목·태그 분리. 필터 툴바와 분리된 전용 블록(모바일 세로/PC 가로)이라 툴바 줄바꿈에 간섭 없음 */}
      <div className="flex flex-col gap-2 md:flex-row">
        <AdminSearchField
          committed={q}
          onCommit={setQ}
          placeholder="제목 검색"
          ariaLabel="제목으로 검색"
          icon={<Search className="size-4" aria-hidden />}
        />
        <AdminSearchField
          committed={tag}
          onCommit={setTag}
          placeholder="태그 검색"
          ariaLabel="태그로 검색"
          icon={<Tag className="size-4" aria-hidden />}
        />
      </div>

      {/* 상태 탭 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(["all", "draft", "scheduled", "published", "hidden"] as const).map((s) => (
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
            <Link href={`${basePath}/new`}>+ 새 글</Link>
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

      {/* 결과 건수 — 검색·필터 적용 결과 총합 */}
      <p className="text-xs text-ink-subtle" aria-live="polite">
        총 {total}건
      </p>

      {/* 테이블 */}
      <Card>
        <CardContent className="pt-6">
          {rows.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-ink-subtle">
                {q || tag
                  ? "검색 조건에 맞는 글이 없어요."
                  : status === "all"
                    ? "등록된 글이 없습니다."
                    : `${STATUS_LABEL[status]} 상태의 글이 없습니다.`}
              </p>
              {(q || tag) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={clearSearch}
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
                <table className="w-full min-w-[920px] text-sm">
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
                      <th className="py-3 pr-4 font-medium">
                        <span className="inline-flex items-center gap-1">
                          노출
                          <HelpTip>{ADMIN_COPY.news.visibilityHelp}</HelpTip>
                        </span>
                      </th>
                      <th className="py-3 font-medium text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const state = getPublishState(row.publishedAt, row.isHidden);
                      return (
                        <tr
                          key={row.id}
                          className={`border-b last:border-b-0 transition-colors hover:bg-surface-soft/60 ${
                            state === "hidden" ? "opacity-55" : ""
                          }`}
                        >
                          <td className="py-3 pr-4 font-medium text-ink-strong">
                            <Link
                              href={`${basePath}/${row.id}/edit`}
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
                          <td className="py-3 pr-4">
                            {renderVisibilityToggle(row, state)}
                          </td>
                          <td className="py-3 text-right">
                            {renderRowActions(row, state)}
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
                  const state = getPublishState(row.publishedAt, row.isHidden);
                  return (
                    <li
                      key={row.id}
                      className={`space-y-2 rounded-lg border border-border p-4 ${
                        state === "hidden" ? "opacity-55" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`${basePath}/${row.id}/edit`}
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
                      {/* 모바일은 노출 토글을 관리 버튼과 한 줄에 — 세로 공간 절약, 44px 터치타겟 유지 */}
                      <div className="flex items-center justify-between gap-2">
                        {renderVisibilityToggle(row, state)}
                        {renderRowActions(row, state)}
                      </div>
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
