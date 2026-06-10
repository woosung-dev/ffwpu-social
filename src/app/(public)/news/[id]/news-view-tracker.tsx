// 소식 상세 조회 이벤트를 익명 세션 기준으로 기록하는 클라이언트 컴포넌트
"use client";

import { useEffect, useRef } from "react";

import { recordAnalyticsEventAction } from "@/features/analytics/actions";
import { buildAnalyticsPayload } from "@/features/analytics/client";

export function NewsViewTracker({ newsId }: { newsId: string }) {
  const recordedRef = useRef(false);

  useEffect(() => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    void recordAnalyticsEventAction(
      buildAnalyticsPayload({ eventType: "news_view", newsId }),
    );
  }, [newsId]);

  return null;
}
