// 소식 정렬 드롭다운 URL 드라이버 — 최신순(기본)/제목순. 변경 시 ?sort= 반영(latest 면 제거) + page 리셋, category·q 보존
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";

import { NEWS_SORT_VALUES, type NewsSort } from "@/features/news/api";

const LABELS: Record<NewsSort, string> = {
  latest: "최신순",
  title: "제목순",
};

type Props = {
  value: NewsSort;
};

export function NewsSort({ value }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const onChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "latest") params.delete("sort");
    else params.set("sort", next);
    params.delete("page"); // 정렬 변경 시 1페이지로 리셋
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/news?${query}` : "/news", { scroll: false });
    });
  };

  return (
    <div className="relative shrink-0">
      {/* 테두리 라운드 박스 + 텍스트 + 우측 chevron (Figma select box) */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isPending}
        aria-label="정렬 순서"
        className="h-11 cursor-pointer appearance-none rounded-lg border border-[#D1D5DB] bg-white pr-9 pl-4 text-[15px] font-medium text-ink-strong outline-none transition-colors hover:border-[#BAC2D0] focus-visible:ring-2 focus-visible:ring-brand-vivid/30 disabled:opacity-60"
      >
        {NEWS_SORT_VALUES.map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-subtle"
      />
    </div>
  );
}
