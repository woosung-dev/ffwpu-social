// 소식 페이지 카테고리 탭 + 페이지네이션 Client wrapper — Server Component (page.tsx) 의 데이터·그리드는 그대로, URL 동기화만 client 처리
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  CategoryTabs,
  type CategoryTabItem,
} from "@/features/news/components";
import { ALL_CATEGORY_SLUG } from "@/features/news/constants";

type Props = {
  categories: readonly CategoryTabItem[];
  selected: string;
};

export function NewsCategoryTabs({ categories, selected }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const onChangeAction = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === ALL_CATEGORY_SLUG) params.delete("category");
    else params.set("category", slug);
    params.delete("page"); // 카테고리 변경 시 1페이지로 리셋
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/news?${query}` : "/news", { scroll: false });
    });
  };

  return (
    <div className={isPending ? "pointer-events-none opacity-70" : undefined}>
      <CategoryTabs
        categories={categories}
        selected={selected}
        onChangeAction={onChangeAction}
      />
    </div>
  );
}
