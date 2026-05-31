// news 비즈니스 로직 — slug 중복/카테고리 존재/상태 전이 규칙 enforce
import * as categoryRepo from "../db/category.repo";
import * as newsRepo from "../db/news.repo";
import {
  ALL_CATEGORY_SLUG,
  type NewsCreateInput,
  type NewsListQuery,
  type NewsRow,
  type NewsUpdateInput,
} from "../schemas";

export class NewsServiceError extends Error {
  constructor(
    public code:
      | "SLUG_TAKEN"
      | "CATEGORY_NOT_FOUND"
      | "NEWS_NOT_FOUND"
      | "CATEGORY_INACTIVE",
    message: string,
  ) {
    super(message);
    this.name = "NewsServiceError";
  }
}

export async function getBySlug(slug: string): Promise<NewsRow | null> {
  return newsRepo.findBySlug(slug);
}

export async function getById(id: string): Promise<NewsRow | null> {
  return newsRepo.findById(id);
}

export async function listPublic(query: NewsListQuery): Promise<{
  rows: NewsRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  // ALL_CATEGORY_SLUG 은 "전체" 필터. DB 조회 시 categoryId=null 로 변환.
  let categoryId: string | null = null;
  if (query.categorySlug !== ALL_CATEGORY_SLUG) {
    const category = await categoryRepo.findBySlug(query.categorySlug);
    if (!category) {
      throw new NewsServiceError(
        "CATEGORY_NOT_FOUND",
        `카테고리를 찾을 수 없다: ${query.categorySlug}`,
      );
    }
    categoryId = category.id;
  }

  const offset = (query.page - 1) * query.pageSize;
  const { rows, total } = await newsRepo.list({
    categoryId,
    status: query.status,
    offset,
    limit: query.pageSize,
  });
  return { rows, total, page: query.page, pageSize: query.pageSize };
}

export async function createNews(input: NewsCreateInput): Promise<NewsRow> {
  // 카테고리 활성 여부 검증
  const category = await categoryRepo.findById(input.categoryId);
  if (!category) {
    throw new NewsServiceError("CATEGORY_NOT_FOUND", "카테고리 없음");
  }
  if (!category.isActive) {
    throw new NewsServiceError("CATEGORY_INACTIVE", "비활성 카테고리에 글 생성 불가");
  }

  // slug 중복 검증
  const existing = await newsRepo.findBySlug(input.slug);
  if (existing) {
    throw new NewsServiceError("SLUG_TAKEN", `slug 중복: ${input.slug}`);
  }

  return newsRepo.create(input);
}

export async function updateNews(input: NewsUpdateInput): Promise<NewsRow> {
  const existing = await newsRepo.findById(input.id);
  if (!existing) {
    throw new NewsServiceError("NEWS_NOT_FOUND", "게시글 없음");
  }
  if (input.slug && input.slug !== existing.slug) {
    const conflict = await newsRepo.findBySlug(input.slug);
    if (conflict) {
      throw new NewsServiceError("SLUG_TAKEN", `slug 중복: ${input.slug}`);
    }
  }
  const updated = await newsRepo.update(input);
  if (!updated) {
    throw new NewsServiceError("NEWS_NOT_FOUND", "업데이트 후 게시글 없음");
  }
  return updated;
}

export async function deleteNews(id: string): Promise<void> {
  await newsRepo.remove(id);
}
