// 공지 읽음 마킹 — mount 시 localStorage 에 1회 기록 (news-view-tracker 패턴). 목록 복귀 시 행 하이라이트 근거
"use client";

import { useEffect, useRef } from "react";

import { markNoticeVisited } from "@/client/lib/visited-notices";

export function NoticeVisitTracker({ noticeId }: { noticeId: string }) {
  // StrictMode 이중 실행·리렌더 가드 — 같은 마운트에서 1회만
  const marked = useRef(false);
  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    markNoticeVisited(noticeId);
  }, [noticeId]);
  return null;
}
