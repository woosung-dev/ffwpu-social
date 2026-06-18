// 운영자용 도움말 팝오버 — 물음표 아이콘을 클릭·탭·키보드로 열어 짧은 설명 표시 (hover 전용 아님 → 모바일·스크린리더 대응)
"use client";

import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function HelpTip({
  children,
  label = "도움말",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-full align-middle text-ink-date transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-1"
        >
          <HelpCircle className="size-4" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 text-sm leading-relaxed font-normal text-ink-strong-mid"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
