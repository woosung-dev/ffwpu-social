// 소식(news) Server Actions — 얇은 진입점. Zod 검증 + auth + service 위임 (fullstack.md §3·§5)
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import * as newsService from "./service";
import { listNewsQuerySchema, newsInputSchema, type NewsInput } from "./schemas";

export type ActionResult<T, Input = unknown> =
  | { success: true; data: T }
  | { success: false; error: string | z.ZodError<Input> };

export async function listNewsAction(rawQuery: Record<string, unknown>) {
  const parsed = listNewsQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error };
  }
  const data = await newsService.listNews(parsed.data);
  return { success: true as const, data };
}

export async function getNewsDetailAction(id: string) {
  const data = await newsService.getNewsDetail(id);
  if (!data) return { success: false as const, error: "Not Found" };
  return { success: true as const, data };
}

// 어드민 전용 — D-2에서 service.createNews/updateNews 구현 후 활성화
export async function createNewsAction(
  _prevState: ActionResult<unknown, NewsInput> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }, NewsInput>> {
  const session = await auth();
  if (!session?.user || session.user.role !== "super") {
    return { success: false, error: "Unauthorized" };
  }
  const parsed = newsInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }
  // TODO(D-2): newsService.createNews(parsed.data, session.user.id)
  revalidatePath("/news");
  return { success: false, error: "Not Implemented (D-2 작업)" };
}
