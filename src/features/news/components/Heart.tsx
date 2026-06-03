// 익명 좋아요 토글 — IP+세션 1회 토글 (ADR-010). 실 toggleHeart action 연결은 D-2, 본 컴포넌트는 optimistic UI 와 시각 표시만 담당
"use client";

import { Heart as HeartIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

type Props = {
  /** 서버에서 내려온 초기 좋아요 수 */
  count: number;
  /** 현재 세션이 좋아요를 누른 상태인지 */
  initialActive?: boolean;
  /** Server Action 연결 — 부모가 주입. 없으면 시각 표시만.
   *  서버 권위 상태 `{ liked, count }` 를 반환하면 optimistic 값을 그 값으로 보정 (다른 탭/경합 후 정합). */
  onToggleAction?: (
    next: boolean,
  ) => Promise<{ liked: boolean; count: number } | void> | void;
  /** 작은 사이즈 (카드 내 호버 뱃지 등) */
  compact?: boolean;
  /** false 면 클릭 불가, 단순 표시 (카드 호버 표시·관련 글 카드 등) */
  interactive?: boolean;
};

export function Heart({
  count,
  initialActive = false,
  onToggleAction,
  compact = false,
  interactive = true,
}: Props) {
  const [active, setActive] = useState(initialActive);
  const [optimisticDelta, setOptimisticDelta] = useState(0);
  const [pending, startTransition] = useTransition();

  const displayCount = count + optimisticDelta;

  const handleClick = () => {
    if (!interactive || pending) return;
    const next = !active;
    setActive(next);
    setOptimisticDelta((d) => d + (next ? 1 : -1));
    if (onToggleAction) {
      startTransition(async () => {
        try {
          const result = await onToggleAction(next);
          if (result) {
            // 서버 권위 상태로 보정 — count 는 prop(SSR 시점) 대비 delta 로 환산
            setActive(result.liked);
            setOptimisticDelta(result.count - count);
          }
        } catch {
          // 실패 시 롤백
          setActive(!next);
          setOptimisticDelta((d) => d - (next ? 1 : -1));
        }
      });
    }
  };

  const Wrapper = interactive ? "button" : "span";

  return (
    <Wrapper
      type={interactive ? "button" : undefined}
      onClick={interactive ? handleClick : undefined}
      aria-pressed={interactive ? active : undefined}
      aria-label={
        interactive
          ? active
            ? "좋아요 취소"
            : "좋아요"
          : `좋아요 ${displayCount}개`
      }
      disabled={interactive ? pending : undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-full text-brand-vivid transition-opacity",
        interactive
          ? "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          : "cursor-default",
        compact ? "text-xs" : "text-base",
      )}
    >
      <HeartIcon
        className={cn(compact ? "size-3.5" : "size-4")}
        fill={active ? "currentColor" : "none"}
        aria-hidden
      />
      <span className="font-bold tabular-nums">{displayCount}</span>
    </Wrapper>
  );
}
