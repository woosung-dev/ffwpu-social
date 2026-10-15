// React Query Provider — 공개 목록 클라이언트 캐시 (/news·/press 페이지에서만 감쌈). 서버 데이터 기본은 RSC, RQ 는 클라 캐시가 필요한 곳만
"use client";

import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/query/get-query-client";

export function QueryProvider({ children }: { children: ReactNode }) {
  // useState 초기화 금지 — Suspense 경계 위에서 suspend 시 React 가 클라이언트를 버림 (공식 가이드)
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
