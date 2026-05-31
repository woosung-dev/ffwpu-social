// 어드민 소식 도메인의 순수 비즈 로직 - db 호출 + 도메인 규칙 적용
import {
  selectRecent,
  selectById,
  insertNews,
  updateNewsRow,
  deleteNewsRow,
  type NewsRow,
} from "./db";
import {
  newsCreateSchema,
  newsUpdateSchema,
  type NewsCreateInput,
  type NewsUpdateInput,
} from "./schemas";

export async function listNews(opts: { limit?: number } = {}): Promise<NewsRow[]> {
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100);
  return selectRecent(limit);
}

export async function getNews(id: string): Promise<NewsRow | null> {
  return selectById(id);
}

export async function createNewsItem(raw: unknown): Promise<NewsRow> {
  const input: NewsCreateInput = newsCreateSchema.parse(raw);
  return insertNews(input);
}

export async function updateNewsItem(raw: unknown): Promise<NewsRow> {
  const input: NewsUpdateInput = newsUpdateSchema.parse(raw);
  const row = await updateNewsRow(input);
  if (!row) throw new Error(`소식을 찾을 수 없습니다: ${input.id}`);
  return row;
}

export async function deleteNewsItem(id: string): Promise<void> {
  await deleteNewsRow(id);
}
