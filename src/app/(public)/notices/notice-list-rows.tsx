// 공지 목록 행 — Figma 4-BP 정합(1149-9301/8742/7972·1103-7882, 측정 docs/design/notices-fidelity-2026-07-08.md).
// 헤더/일반/읽음 행 높이 40·48·48(375) → 44·56·62(768) → 53·62·70(1025·1440). 모바일(375)은 No·Date 열 제거, Title 단일 열.
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
  /** 상위 고정 여부 — 고정 행은 번호 대신 '고정' 칩 (ADR-043) */
  pinned: boolean;
  /** 서버 포맷 완료 텍스트 (YYYY.MM.DD) — TZ 차이로 인한 hydration mismatch 방지 */
  dateText: string;
};

const EMPTY_SET: ReadonlySet<string> = new Set();

// 공통 그리드·패딩 — 헤더/행 동일 정렬. Figma 4-BP 실측: 모바일 Title 단일 열(px12) → md↑ No100/Title/Date100·gap36(px 12→20 at lg).
const ROW_GRID_CLASS =
  "grid grid-cols-[minmax(0,1fr)] items-center px-3 md:grid-cols-[100px_minmax(0,1fr)_100px] md:gap-9 lg:px-5";

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
    // 테이블 폭 — Figma: md/lg/모바일은 SectionContainer 밴드 전체(648/905/유동), wide 만 1200 밴드 안 900 중앙. 타이틀→표 gap 41(375)/82(md↑).
    <div className="mt-10 md:mt-[82px] wide:mx-auto wide:max-w-[900px]">
      {/* 헤더 행 — Figma TopBlock #242424 rounded4. h40/44/53, 텍스트 16/16/18. 모바일은 Title 단일 열 */}
      <div
        aria-hidden
        className={cn(
          ROW_GRID_CLASS,
          "h-10 rounded-[4px] bg-[#242424] text-base font-semibold text-[#f2f2f2] md:h-11 lg:h-[53px] lg:text-lg",
        )}
      >
        <span className="hidden text-center md:block">No.</span>
        <span>Title</span>
        <span className="hidden text-center md:block">Date</span>
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
            // 고정 그룹의 마지막 행 — 고정/일반 경계에 구분선 (시안 B). 고정은 항상 상단 정렬이라 연속 블록
            const isLastPinned =
              row.pinned && (idx === rows.length - 1 || !rows[idx + 1].pinned);
            return (
              <li key={row.id}>
                <Link
                  href={`/notices/${row.id}`}
                  className={cn(
                    ROW_GRID_CLASS,
                    "group border-b transition-colors",
                    // 행 높이 (Figma 4-BP) — 일반 48/56/62/62 · 읽음 48/62/70/70
                    isVisited
                      ? "min-h-12 border-[#ece1f3] md:min-h-[62px] lg:min-h-[70px]"
                      : "min-h-12 border-[#cbcbcb] md:min-h-14 lg:min-h-[62px]",
                    // 상위 고정 행 (시안 B) — 읽음 하이라이트(#f9f4ff)보다 진한 보라 워시로 그룹핑. 지브라 override
                    row.pinned
                      ? "bg-[#efe4ff] hover:bg-[#e6d4ff]"
                      : cn(
                          // 지브라 — 일반: white/#f9f9fc · 읽음: #fcfaff/#f9f4ff. 호버는 항상 #f9f4ff
                          isVisited
                            ? isEven
                              ? "bg-[#f9f4ff]"
                              : "bg-[#fcfaff]"
                            : isEven
                              ? "bg-[#f9f9fc]"
                              : "bg-white",
                          "hover:bg-[#f9f4ff]",
                        ),
                    // 고정 그룹 하단 경계선 (마지막 고정 행) — 고정↔일반 시각 분리
                    isLastPinned && "border-b-2 border-[#d9c2f5]",
                  )}
                >
                  {/* No·Date 는 모바일(375)에서 숨김 — Figma 는 Title 단일 열. 고정 행은 번호 대신 비움('고정' 칩은 제목 셀에) */}
                  <span
                    className={cn(
                      "hidden text-center text-base font-medium tabular-nums transition-colors md:block lg:text-lg",
                      isVisited ? "text-[#c8a3e6]" : "text-[#959ba9]",
                      "group-hover:text-[#c8a3e6]",
                    )}
                  >
                    {row.pinned ? "" : row.no}
                  </span>
                  <span className="flex min-w-0 items-center gap-2.5">
                    {/* 상위 고정 칩 — 전 BP 노출(모바일은 No 열 숨김). 읽음 마커 핀과 시각 구분 위해 라벨형 */}
                    {row.pinned && (
                      <span className="shrink-0 rounded-[4px] bg-[#f3e8ff] px-1.5 py-0.5 text-xs font-semibold text-[#a34df3]">
                        고정
                      </span>
                    )}
                    {/* 읽음 마커 핀 — Figma No/PinIcon (읽은 행에만, fill #E1C8F9). 20/20/24/24 */}
                    {isVisited && (
                      <NoticePinIcon className="size-5 text-[#e1c8f9] lg:size-6" />
                    )}
                    <span
                      className={cn(
                        "truncate text-base font-medium transition-colors lg:text-lg",
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
                          "size-5 transition-colors",
                          isVisited ? "text-[#c8a3e6]" : "text-[#d6d0d8]",
                          "group-hover:text-[#c8a3e6]",
                        )}
                      />
                    )}
                  </span>
                  <span
                    className={cn(
                      "hidden text-center text-base font-medium tabular-nums transition-colors md:block lg:text-lg",
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
        // Figma 전 BP: 목록 하단 →80→ 페이지네이션
        <div className="mt-20 flex justify-center">
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
