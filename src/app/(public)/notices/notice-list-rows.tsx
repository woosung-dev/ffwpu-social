// 공지 목록 행 — Figma 1104-10001: No./Title(📎클립)/Date 테이블형. 호버 하이라이트 = 읽음 표시(동일 스타일 중복 사용)
// 읽음 상태는 localStorage(visited-notices) — mount 후 적용해 SSR 마크업과 첫 클라 렌더 일치 (hydration-safe)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Paperclip } from "lucide-react";

import { Pagination } from "@/client/components/Pagination";
import { getVisitedNotices } from "@/client/lib/visited-notices";
import { cn } from "@/lib/utils";

export type NoticeListRow = {
  id: string;
  /** 발행 기준 역순 전체 번호 — 서버 계산 (total − offset − index) */
  no: number;
  title: string;
  hasAttachment: boolean;
  /** 서버 포맷 완료 텍스트 (YYYY.MM.DD) — TZ 차이로 인한 hydration mismatch 방지 */
  dateText: string;
};

const EMPTY_SET: ReadonlySet<string> = new Set();

export function NoticeListRows({
  rows,
  page,
  totalPages,
}: {
  rows: NoticeListRow[];
  page: number;
  totalPages: number;
}) {
  const [visited, setVisited] = useState<ReadonlySet<string>>(EMPTY_SET);
  // localStorage 는 외부 시스템 — mount 1회 동기화 (anti-slop §2 Effect 예외 사유)
  useEffect(() => {
    setVisited(getVisitedNotices());
  }, []);

  return (
    <div className="mt-[30px] wide:mt-10">
      {/* 헤더 행 — Figma: 다크 바 No./Title/Date */}
      <div
        aria-hidden
        className="grid grid-cols-[48px_minmax(0,1fr)_88px] items-center rounded-md bg-ink-strong px-4 py-3 text-sm font-medium text-white md:grid-cols-[72px_minmax(0,1fr)_120px] md:px-6"
      >
        <span>No.</span>
        <span>Title</span>
        <span className="text-right">Date</span>
      </div>

      {rows.length === 0 ? (
        <p className="py-16 text-center text-base text-ink-subtle">
          등록된 공지사항이 없습니다.
        </p>
      ) : (
        <ul>
          {rows.map((row) => {
            const isVisited = visited.has(row.id);
            return (
              <li key={row.id} className="border-b border-border">
                <Link
                  href={`/notices/${row.id}`}
                  className={cn(
                    "group grid grid-cols-[48px_minmax(0,1fr)_88px] items-center px-4 py-4 transition-colors md:grid-cols-[72px_minmax(0,1fr)_120px] md:px-6 md:py-5",
                    // 호버 하이라이트와 읽음 표시가 같은 스타일 (Figma interaction 명세)
                    "hover:bg-[#F9F4FF]",
                    isVisited && "bg-[#F9F4FF]",
                  )}
                >
                  <span className="text-sm tabular-nums text-ink-subtle md:text-base">
                    {row.no}
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={cn(
                        "truncate text-sm font-medium text-ink-strong transition-colors group-hover:text-brand-primary md:text-base",
                        isVisited && "text-brand-primary",
                      )}
                    >
                      {row.title}
                    </span>
                    {row.hasAttachment && (
                      <Paperclip
                        aria-label="첨부파일 있음"
                        className={cn(
                          "size-3.5 shrink-0 text-ink-subtle transition-colors group-hover:text-brand-primary md:size-4",
                          isVisited && "text-brand-primary",
                        )}
                      />
                    )}
                  </span>
                  <span className="text-right text-sm tabular-nums text-ink-date md:text-base">
                    {row.dateText}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination
            page={page}
            totalPages={totalPages}
            hrefForAction={(p) => (p === 1 ? "/notices" : `/notices?page=${p}`)}
          />
        </div>
      )}
    </div>
  );
}
