// 소식(news) 비즈니스 로직 — db import 금지. db 레이어 함수만 호출 (fullstack.md §3). Next.js 16 cacheComponents — "use cache" + cacheTag로 ISR. D-2 mutation에서 revalidateTag("news:list") 호출로 무효화
import { cacheLife, cacheTag } from "next/cache";

import * as newsDb from "./db";
import type { ListNewsQuery } from "./schemas";

export async function listNews(query: ListNewsQuery) {
  "use cache";
  cacheTag("news:list");
  cacheLife("minutes");
  const [items, total] = await Promise.all([
    newsDb.findAllNews(query),
    newsDb.countAllNews({ categorySlug: query.categorySlug }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  return { items, total, totalPages, page: query.page, limit: query.limit };
}

export async function getNewsDetail(id: string) {
  "use cache";
  cacheTag(`news:${id}`);
  cacheLife("minutes");
  const item = await newsDb.findNewsById(id);
  if (!item) return null;
  const heartCount = await newsDb.countActiveHearts(id);
  return { ...item, heartCount };
}

// 활성 카테고리 목록 — CategoryTabs·어드민 폼 데이터 소스. D-2에서 카테고리 추가/비활성 시 revalidateTag("categories")
export async function listCategories() {
  "use cache";
  cacheTag("categories");
  cacheLife("hours");
  return newsDb.findActiveCategories();
}

// createNews / updateNews / toggleHeart — D-2 스프린트에서 채움
