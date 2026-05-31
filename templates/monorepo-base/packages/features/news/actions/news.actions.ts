// news 서버 액션 — admin CRUD + 공개 목록/상세 조회 (Next.js 16 server action)
"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "../../auth/admin";
import * as newsService from "../service/news.service";
import {
  newsCreateSchema,
  newsListQuerySchema,
  newsUpdateSchema,
  type NewsListQuery,
} from "../schemas";
import { fail, ok, type ActionResult } from "./result";

// 공개 조회 — 인증 불필요
export async function listNewsAction(rawQuery: Partial<NewsListQuery>) {
  const parsed = newsListQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return fail("INVALID_QUERY", parsed.error.message);
  }
  try {
    const result = await newsService.listPublic(parsed.data);
    return ok(result);
  } catch (err) {
    return fail("LIST_FAILED", (err as Error).message);
  }
}

export async function getNewsBySlugAction(slug: string) {
  if (!slug) return fail("INVALID_SLUG", "slug 필수");
  const row = await newsService.getBySlug(slug);
  if (!row) return fail("NOT_FOUND", "게시글 없음");
  return ok(row);
}

// 관리자 액션 — requireAdminSession 으로 인증 가드
export async function createNewsAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdminSession();
  const parsed = newsCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION", parsed.error.message);
  }
  try {
    const row = await newsService.createNews(parsed.data);
    revalidatePath("/news");
    return ok({ id: row.id });
  } catch (err) {
    const code =
      (err as { code?: string }).code ??
      ("UNKNOWN" satisfies string);
    return fail(code, (err as Error).message);
  }
}

export async function updateNewsAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdminSession();
  const parsed = newsUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION", parsed.error.message);
  }
  try {
    const row = await newsService.updateNews(parsed.data);
    revalidatePath("/news");
    revalidatePath(`/news/${row.slug}`);
    return ok({ id: row.id });
  } catch (err) {
    return fail(
      (err as { code?: string }).code ?? "UNKNOWN",
      (err as Error).message,
    );
  }
}

export async function deleteNewsAction(id: string): Promise<ActionResult<null>> {
  await requireAdminSession();
  if (!id) return fail("INVALID_ID", "id 필수");
  await newsService.deleteNews(id);
  revalidatePath("/news");
  return ok(null);
}
