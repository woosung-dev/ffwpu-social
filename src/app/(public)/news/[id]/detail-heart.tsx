// 소식 상세 익명 좋아요 — 서버 count 표시 + 마운트 시 현재 세션 좋아요 상태 조회, 클릭 시 토글 (ADR-026)
"use client";

import { useEffect, useState } from "react";

import { getAnonSessionId } from "@/client/lib/anon-session";
import { Heart } from "@/features/news/components";
import { heartStateAction, toggleHeartAction } from "@/features/news/actions";

export function DetailHeart({
  newsId,
  count,
}: {
  newsId: string;
  count: number;
}) {
  // null = 세션 상태 미로딩 (표시 전용) / boolean = 로딩 완료(인터랙티브)
  const [initialLiked, setInitialLiked] = useState<boolean | null>(null);

  useEffect(() => {
    const sid = getAnonSessionId();
    if (!sid) return;
    void heartStateAction(newsId, sid).then((r) => {
      if (r.success) setInitialLiked(r.data.liked);
    });
  }, [newsId]);

  const handleToggle = async () => {
    const sid = getAnonSessionId();
    const r = await toggleHeartAction(newsId, sid);
    if (!r.success) throw new Error(r.error);
    return r.data; // { liked, count } — Heart 가 서버 권위 상태로 보정
  };

  // 세션 상태 로딩 전엔 표시 전용(카운트), 로딩 후 인터랙티브로 전환.
  // key 를 달리해 로딩→완료 시 Heart 를 remount — useState(initialActive) 가 갱신된 좋아요 상태를 반영하도록
  if (initialLiked === null) {
    return <Heart key="loading" count={count} interactive={false} />;
  }
  return (
    <Heart
      key="ready"
      count={count}
      initialActive={initialLiked}
      onToggleAction={handleToggle}
    />
  );
}
