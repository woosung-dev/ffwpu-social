// 공지 읽음 마킹 — mount 시 localStorage 에 1회 기록 (news-view-tracker 패턴). 목록 복귀 시 행 하이라이트 근거
"use client";

import { useEffect, useRef } from "react";

import { markNoticeVisited } from "@/client/lib/visited-notices";

export function NoticeVisitTracker({ noticeId }: { noticeId: string }) {
  // StrictMode 이중 실행·리렌더 가드 — 같은 마운트에서 1회만
  const marked = useRef(false);
  useEffect(() => {
    if (marked.current) return;
    // 현재 URL 이 이 공지의 상세일 때만 마킹 — 라우터 프리페치/세그먼트 프리렌더가 상세 컴포넌트를
    // 백그라운드 마운트해도 "안 읽은 글" 이 읽음 처리되지 않도록 (dev E2E 에서 팬텀 기록 관측)
    if (window.location.pathname !== `/notices/${noticeId}`) return;
    marked.current = true;
    markNoticeVisited(noticeId);
  }, [noticeId]);
  return null;
}
