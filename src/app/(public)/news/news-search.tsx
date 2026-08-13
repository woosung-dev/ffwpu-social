// 소식 검색 URL 드라이버 — 제출 시 ?q= 반영(빈 값이면 제거) + page 리셋 + category 보존. news-filters.tsx 와 동일 패턴
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { SearchInput } from "@/features/news/components";

type Props = {
  defaultValue: string;
  className?: string;
  /** 목록 경로 — /news 또는 /press (ADR-056) */
  basePath: string;
};

export function NewsSearch({ defaultValue, className, basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const onSubmitAction = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    params.delete("page"); // 검색 변경 시 1페이지로 리셋
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${basePath}?${query}` : basePath, { scroll: false });
    });
  };

  return (
    <SearchInput
      defaultValue={defaultValue}
      onSubmitAction={onSubmitAction}
      busy={isPending}
      className={className}
    />
  );
}
