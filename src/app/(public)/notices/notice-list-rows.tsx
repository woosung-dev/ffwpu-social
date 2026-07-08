// 공지 목록 행 — Figma 1104:10001 정합. 헤더 #242424 h53 · 일반 행 h62(지브라 #f9f9fc) · 읽음 행 h70(#fcfaff/#f9f4ff + 핀·보라 텍스트)
// 호버 = 읽음 행 hover 상태(#f9f4ff + 보라)와 동일 색 처리 (Figma interaction annotation "중복 사용"). 색만 전환 — 레이아웃 시프트 방지 [정책]
// 읽음 상태는 localStorage(visited-notices) — mount 후 적용해 SSR 마크업과 첫 클라 렌더 일치 (hydration-safe)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Pagination } from "@/client/components/Pagination";
import { getVisitedNotices } from "@/client/lib/visited-notices";
import { NoticeClipIcon, NoticePinIcon } from "@/features/notices/components/notice-icons";
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

// 3열 공통 그리드·패딩 — 헤더/행 동일 정렬 (Figma: No 100 / Title flex / Date 100, px 20, gap 36. 하위 BP는 비례 축소 [추론])
const ROW_GRID_CLASS =
  "grid grid-cols-[36px_minmax(0,1fr)_78px] items-center gap-3 px-3 md:grid-cols-[56px_minmax(0,1fr)_96px] md:gap-6 md:px-4 wide:grid-cols-[100px_minmax(0,1fr)_100px] wide:gap-9 wide:px-5";

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
    // 테이블 폭 — Figma 1440: 콘텐츠 밴드 1200 안에서 900 중앙 (좌우 인셋 150). 하위 BP 는 밴드 전체폭 [추론]
    <div className="mt-10 wide:mx-auto wide:mt-[82px] wide:max-w-[900px]">
      {/* 헤더 행 — Figma TopBlock: #242424 · SUIT SemiBold 18 · h53 · rounded 4 */}
      <div
        aria-hidden
        className={cn(
          ROW_GRID_CLASS,
          "h-11 rounded-[4px] bg-[#242424] text-[13px] font-semibold text-[#f2f2f2] md:h-12 md:text-[15px] wide:h-[53px] wide:text-[18px]",
        )}
      >
        <span className="text-center">No.</span>
        <span>Title</span>
        <span className="text-center">Date</span>
      </div>

      {rows.length === 0 ? (
        <p className="py-16 text-center text-base text-ink-subtle">
          등록된 공지사항이 없습니다.
        </p>
      ) : (
        <ul>
          {rows.map((row, idx) => {
            const isVisited = visited.has(row.id);
            const isEven = idx % 2 === 1;
            return (
              <li key={row.id}>
                <Link
                  href={`/notices/${row.id}`}
                  className={cn(
                    ROW_GRID_CLASS,
                    "group border-b transition-colors",
                    // 높이 — 일반 62 / 읽음 70 (Figma). 하위 BP 비례 [추론]
                    isVisited
                      ? "min-h-[54px] border-[#ece1f3] md:min-h-[60px] wide:min-h-[70px]"
                      : "min-h-12 border-[#cbcbcb] md:min-h-[54px] wide:min-h-[62px]",
                    // 지브라 — 일반: white/#f9f9fc · 읽음: #fcfaff/#f9f4ff. 호버는 항상 #f9f4ff
                    isVisited
                      ? isEven
                        ? "bg-[#f9f4ff]"
                        : "bg-[#fcfaff]"
                      : isEven
                        ? "bg-[#f9f9fc]"
                        : "bg-white",
                    "hover:bg-[#f9f4ff]",
                  )}
                >
                  <span
                    className={cn(
                      "text-center text-[13px] font-medium tabular-nums transition-colors md:text-[15px] wide:text-[18px]",
                      isVisited ? "text-[#c8a3e6]" : "text-[#959ba9]",
                      "group-hover:text-[#c8a3e6]",
                    )}
                  >
                    {row.no}
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5 wide:gap-2.5">
                    {/* 읽음 마커 핀 — Figma No/PinIcon (읽은 행에만, fill #E1C8F9) */}
                    {isVisited && (
                      <NoticePinIcon className="size-4 text-[#e1c8f9] md:size-5 wide:size-6" />
                    )}
                    <span
                      className={cn(
                        "truncate text-[13px] font-medium transition-colors md:text-[15px] wide:text-[18px]",
                        isVisited ? "text-[#a34df3]" : "text-[#2d2d2d]",
                        "group-hover:text-[#a34df3]",
                      )}
                    >
                      {row.title}
                    </span>
                    {row.hasAttachment && (
                      <NoticeClipIcon
                        aria-label="첨부파일 있음"
                        className={cn(
                          "size-4 transition-colors wide:size-5",
                          isVisited ? "text-[#c8a3e6]" : "text-[#d6d0d8]",
                          "group-hover:text-[#c8a3e6]",
                        )}
                      />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-center text-[13px] font-medium tabular-nums transition-colors md:text-[15px] wide:text-[18px]",
                      isVisited ? "text-[#c8a3e6]" : "text-[#959ba9]",
                      "group-hover:text-[#c8a3e6]",
                    )}
                  >
                    {row.dateText}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        // Figma: 목록 하단 →80→ 페이지네이션 (1440). 하위 BP 40 [추론]
        <div className="mt-10 flex justify-center wide:mt-20">
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
