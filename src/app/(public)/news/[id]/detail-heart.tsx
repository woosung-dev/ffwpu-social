// 소식 상세 익명 좋아요 — 서버 count 표시 + 마운트 시 현재 세션 좋아요 상태 조회, 클릭 시 토글 (ADR-026)
// 상단(날짜 옆) badge 와 하단 "공감해요" pill 둘 다 누를 수 있고, 같은 상태를 보도록 Provider 로 공유
"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";

import { getAnonSessionId } from "@/client/lib/anon-session";
import { recordAnalyticsEventAction } from "@/features/analytics/actions";
import { buildAnalyticsPayload } from "@/features/analytics/client";
import { Heart } from "@/features/news/components";
import { heartStateAction, toggleHeartAction } from "@/features/news/actions";

type HeartResult = { liked: boolean; count: number };

// 하트가 놓이는 자리 — 상단(날짜 옆 badge) / 하단("공감해요" pill)
type HeartSlot = "top" | "bottom";

// 슬롯별 remount 키 + 그 시점 count. Heart 는 count prop 대비 optimistic delta 를 내부에 들고 있어서
// count 를 mount 이후 바꾸면 이중 가산된다 → count 는 remount 때만 갱신(base 고정)
type SlotSync = { key: number; base: number };

type DetailHeartState = {
  /** null = 세션 상태 미로딩 */
  liked: boolean | null;
  slots: Record<HeartSlot, SlotSync>;
  toggle: (from: HeartSlot) => Promise<HeartResult>;
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
  const [slots, setSlots] = useState<Record<HeartSlot, SlotSync>>({
    top: { key: 0, base: count },
    bottom: { key: 0, base: count },
  });

  useEffect(() => {
    const sid = getAnonSessionId();
    if (!sid) return;
    void heartStateAction(newsId, sid).then((r) => {
      if (r.success) setLiked(r.data.liked);
    });
  }, [newsId]);

  const toggle = async (from: HeartSlot) => {
    const sid = getAnonSessionId();
    const r = await toggleHeartAction(newsId, sid);
    if (!r.success) throw new Error(r.error);
    setLiked(r.data.liked);
    // 누른 쪽은 그대로 두고(포커스·optimistic 유지) 반대쪽만 서버 권위 값으로 remount
    const other: HeartSlot = from === "top" ? "bottom" : "top";
    setSlots((prev) => ({
      ...prev,
      [other]: { key: prev[other].key + 1, base: r.data.count },
    }));
    void recordAnalyticsEventAction(
      buildAnalyticsPayload({
        eventType: r.data.liked ? "heart_on" : "heart_off",
        newsId,
      }),
    );
    return r.data; // { liked, count } — Heart 가 서버 권위 상태로 보정
  };

  return (
    <DetailHeartContext value={{ liked, slots, toggle }}>
      {children}
    </DetailHeartContext>
  );
}

// 세션 상태 로딩 전엔 표시 전용(카운트), 로딩 후 인터랙티브로 전환.
// key 에 로딩 여부를 넣어 로딩→완료 시 remount — useState(initialActive) 가 세션 좋아요 상태를 반영하도록
function SlotHeart({ slot, pill }: { slot: HeartSlot; pill?: boolean }) {
  const { liked, slots, toggle } = useDetailHeart();
  const { key, base } = slots[slot];
  if (liked === null) {
    return <Heart key="loading" count={base} interactive={false} pill={pill} />;
  }
  return (
    <Heart
      key={`ready-${key}`}
      count={base}
      initialActive={liked}
      onToggleAction={() => toggle(slot)}
      pill={pill}
    />
  );
}

// 하단 "공감해요" pill (Figma 749:8220)
export function DetailHeart() {
  return <SlotHeart slot="bottom" pill />;
}

// 상단 날짜 옆 badge — 사회공헌국 요청으로 하단 pill 과 같은 토글을 상단에서도 누를 수 있게 함
export function DetailHeartBadge() {
  return <SlotHeart slot="top" />;
}
