// 소식 상세 익명 좋아요 — 서버 count 표시 + 마운트 시 현재 세션 좋아요 상태 조회, 클릭 시 토글 (ADR-026)
// 상단(날짜 옆) 카운트 표시와 하단 "공감해요" pill 이 같은 상태를 보도록 Provider 로 공유
"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";

import { getAnonSessionId } from "@/client/lib/anon-session";
import { recordAnalyticsEventAction } from "@/features/analytics/actions";
import { buildAnalyticsPayload } from "@/features/analytics/client";
import { Heart } from "@/features/news/components";
import { heartStateAction, toggleHeartAction } from "@/features/news/actions";

type HeartResult = { liked: boolean; count: number };

type DetailHeartState = {
  /** SSR 시점 count — 하단 pill 의 optimistic delta 기준값(변경 금지) */
  initialCount: number;
  /** 토글 결과(서버 권위)로 갱신되는 count — 상단 표시용 */
  liveCount: number;
  /** null = 세션 상태 미로딩 */
  liked: boolean | null;
  toggle: () => Promise<HeartResult>;
};

const DetailHeartContext = createContext<DetailHeartState | null>(null);

function useDetailHeart(): DetailHeartState {
  const ctx = use(DetailHeartContext);
  if (!ctx) throw new Error("DetailHeartProvider 안에서만 사용");
  return ctx;
}

export function DetailHeartProvider({
  newsId,
  count,
  children,
}: {
  newsId: string;
  count: number;
  children: ReactNode;
}) {
  const [liked, setLiked] = useState<boolean | null>(null);
  const [liveCount, setLiveCount] = useState(count);

  useEffect(() => {
    const sid = getAnonSessionId();
    if (!sid) return;
    void heartStateAction(newsId, sid).then((r) => {
      if (r.success) setLiked(r.data.liked);
    });
  }, [newsId]);

  const toggle = async () => {
    const sid = getAnonSessionId();
    const r = await toggleHeartAction(newsId, sid);
    if (!r.success) throw new Error(r.error);
    setLiked(r.data.liked);
    setLiveCount(r.data.count);
    void recordAnalyticsEventAction(
      buildAnalyticsPayload({
        eventType: r.data.liked ? "heart_on" : "heart_off",
        newsId,
      }),
    );
    return r.data; // { liked, count } — Heart 가 서버 권위 상태로 보정
  };

  return (
    <DetailHeartContext
      value={{ initialCount: count, liveCount, liked, toggle }}
    >
      {children}
    </DetailHeartContext>
  );
}

// 하단 "공감해요" pill — 세션 상태 로딩 전엔 표시 전용(카운트), 로딩 후 인터랙티브로 전환 (Figma 749:8220).
// key 를 달리해 로딩→완료 시 Heart 를 remount — useState(initialActive) 가 갱신된 좋아요 상태를 반영하도록
export function DetailHeart() {
  const { initialCount, liked, toggle } = useDetailHeart();
  if (liked === null) {
    return <Heart key="loading" count={initialCount} interactive={false} pill />;
  }
  return (
    <Heart
      key="ready"
      count={initialCount}
      initialActive={liked}
      onToggleAction={toggle}
      pill
    />
  );
}

// 상단 날짜 옆 공감 수 — 표시 전용 badge(카드 배지와 동일 형태). 하단 토글 결과를 즉시 반영.
// 표시 전용이라 포커스가 없으므로 liked 변경 시 remount 로 채움 상태 갱신
export function DetailHeartCount() {
  const { liveCount, liked } = useDetailHeart();
  return (
    <Heart
      key={String(liked)}
      count={liveCount}
      initialActive={liked ?? false}
      interactive={false}
    />
  );
}
