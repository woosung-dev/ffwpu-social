// 소식(news) 비즈니스 로직 — db import 금지. db 레이어 함수만 호출 (fullstack.md §3)
import * as newsDb from "./db";
import type { ListNewsQuery } from "./schemas";

export async function listNews(query: ListNewsQuery) {
  const [items, total] = await Promise.all([
    newsDb.findAllNews(query),
    newsDb.countAllNews({ categorySlug: query.categorySlug }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  return { items, total, totalPages, page: query.page, limit: query.limit };
}

export async function getNewsDetail(id: string) {
  const item = await newsDb.findNewsById(id);
  if (!item) return null;
  const heartCount = await newsDb.countActiveHearts(id);
  return { ...item, heartCount };
}

// 활성 카테고리 목록 — CategoryTabs·어드민 폼 데이터 소스
export async function listCategories() {
  return newsDb.findActiveCategories();
}

// createNews / updateNews / toggleHeart — D-2 스프린트에서 채움
