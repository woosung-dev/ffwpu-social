// 소식 정렬 드롭다운 URL 드라이버 — 최신순(기본)/제목순. shadcn Select(디자인 입힌 커스텀 드롭다운).
// 변경 시 ?sort= 반영(latest 면 제거) + page 리셋, category·q 보존
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const onValueChange = (next: string) => {
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
    <Select value={value} onValueChange={onValueChange} disabled={isPending}>
      {/* 닫힘 박스 — rounded-lg 테두리 #D1D5DB, hover #BAC2D0, 우측 chevron(Trigger 내장). 검색바 h-11 과 정렬 */}
      <SelectTrigger
        aria-label="정렬 순서"
        className="h-11 shrink-0 gap-2 rounded-lg border-[#D1D5DB] bg-white px-4 text-[15px] font-medium text-ink-strong shadow-none transition-colors hover:border-[#BAC2D0] focus-visible:border-[#BAC2D0] focus-visible:ring-brand-vivid/30 [&>svg]:text-ink-subtle [&>svg]:opacity-100"
      >
        <SelectValue />
      </SelectTrigger>
      {/* 열림 리스트 — 디자인 팝오버(라운드·그림자·애니메이션), 선택 항목 체크 표시 */}
      <SelectContent position="popper" align="end" className="min-w-[7rem]">
        {NEWS_SORT_VALUES.map((s) => (
          <SelectItem key={s} value={s} className="text-[15px]">
            {LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
