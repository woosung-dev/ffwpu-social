// "사용자 소식 페이지에서 이렇게 보여요" — 공개 /news 카테고리 탭의 정적 미리보기 (읽기 전용, 데이터 fetch 없음)
import { Eye } from "lucide-react";

import { cn } from "@/lib/utils";

export function CategoryTabsPreview({ names }: { names: string[] }) {
  // 공개 탭은 '전체' + 표시 중인 카테고리(정렬 순). 첫 탭(전체)을 active 로 표시.
  const tabs = ["전체", ...names];
  return (
    <div className="rounded-lg border border-dashed border-brand-pale bg-surface-tint-faint px-4 py-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-brand-mid">
        <Eye className="size-3.5" aria-hidden />
        사용자 소식 페이지에서 이렇게 보여요
      </p>
      {names.length === 0 ? (
        <p className="text-sm text-ink-subtle">
          표시 중인 카테고리가 없어 '전체' 탭만 보입니다.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {tabs.map((t, i) => (
            <span
              key={t}
              className={cn(
                "relative px-4 py-2 text-sm",
                i === 0
                  ? "font-semibold text-ink-strong after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-vivid after:content-['']"
                  : "font-medium text-ink-subtle",
              )}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
