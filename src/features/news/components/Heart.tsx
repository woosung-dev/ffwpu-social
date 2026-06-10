// 익명 좋아요 토글 — sessionId(localStorage) 1회 토글 (ADR-026). badge(카드 배지)·pill(상세 하단 "공감해요") 두 형태. optimistic UI 담당, 실 토글은 부모가 주입
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
  /** 상세 하단 "공감해요" pill 형태 (Figma 749:7904) — 미지정 시 기존 badge 형태 */
  pill?: boolean;
};

export function Heart({
  count,
  initialActive = false,
  onToggleAction,
  compact = false,
  interactive = true,
  pill = false,
}: Props) {
  const [active, setActive] = useState(initialActive);
  const [optimisticDelta, setOptimisticDelta] = useState(0);
  const [pending, startTransition] = useTransition();

  // SSR count 가 낮게 stale 인 상태에서 취소 시 음수 표시 방지 (codex loop2 LOW)
  const displayCount = Math.max(0, count + optimisticDelta);

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
  // pill 의 행위 명칭은 라벨과 일관되게 "공감", badge 는 기존 "좋아요" 유지
  const verb = pill ? "공감" : "좋아요";

  return (
    <Wrapper
      type={interactive ? "button" : undefined}
      onClick={interactive ? handleClick : undefined}
      aria-pressed={interactive ? active : undefined}
      aria-label={
        interactive
          ? active
            ? `${verb} 취소`
            : pill
              ? "공감해요"
              : "좋아요"
          : `${verb} ${displayCount}개`
      }
      disabled={interactive ? pending : undefined}
      className={cn(
        "inline-flex items-center rounded-full transition-opacity",
        interactive
          ? "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          : "cursor-default",
        pill
          ? // Figma 749:7904: 흰 배경 + border 1.3 + radius full + padding 좌10/우12/상하3 + gap 6.
            // 색은 Figma #959BA9 대신 ink-date(#6F7682) — AA 4.5:1 상향 선례 (allowlist #11)
            "gap-1.5 border-[1.3px] border-ink-date bg-white py-[3px] pl-2.5 pr-3 text-lg leading-[1.6] text-ink-date"
          : // compact 카운트 14px — Figma 카드 배지 SUIT Bold 14 (audit 2026-06-10, 12→14 정정)
            cn("gap-1 text-brand-vivid", compact ? "text-sm" : "text-base"),
      )}
    >
      <HeartIcon
        className={cn(
          // pill: lucide 24-viewBox 글리프(≈20×17.5u)를 22px 렌더 → 벡터 약 18×16 (Figma 스펙)
          // badge·compact: 16px 박스 → 글리프 실측 ≈13.3 — Figma 하트 15×13.33 정합 (compact 14→16, audit 2026-06-10)
          pill ? "size-[22px]" : "size-4",
          // [추론] pill active 색 — 749:7904 의 Click 변형 미노출, 구형 세트 Click(114:8301)의 #B35FEB 채움을 따름
          pill && active && "text-brand-vivid",
        )}
        // pill: Figma stroke 1.3px 근사 (1.5u × 22/24 ≈ 1.38px)
        strokeWidth={pill ? 1.5 : undefined}
        fill={active ? "currentColor" : "none"}
        aria-hidden
      />
      {pill && <span className="font-semibold">공감해요</span>}
      <span
        className={cn(
          "tabular-nums",
          pill ? "font-extrabold" : "font-bold",
          // [추론] pill active 카운트도 구형 Click 변형 색(#B35FEB)을 따름 — 라벨·보더는 그대로
          pill && active && "text-brand-vivid",
        )}
      >
        {displayCount}
      </span>
    </Wrapper>
  );
}
