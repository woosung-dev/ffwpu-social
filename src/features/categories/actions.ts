// 카테고리 Server Actions — 얇은 진입점. requireSuperAdmin + Zod 검증 + service 위임
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth-guards";
import * as service from "./service";
import {
  type CreateCategoryInput,
  type UpdateCategoryInput,
  createCategorySchema,
  updateCategorySchema,
} from "./schemas";

export type ActionResult<T, Input = unknown> =
  | { success: true; data: T }
  | { success: false; error: string | z.ZodError<Input> };

function authError(e: unknown): { success: false; error: string } {
  if (e instanceof Error) return { success: false, error: e.message };
  return { success: false, error: "Unauthorized" };
}

// 카테고리 변경은 사용자 사이트 탭/필터·어드민 폼 선택지에 즉시 반영 필요
function revalidateAffected() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");
}

export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<ActionResult<{ id: string }, CreateCategoryInput>> {
  try {
    await requireSuperAdmin();
  } catch (e) {
    return authError(e);
  }
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error };
  try {
    const row = await service.createCategory(parsed.data);
    revalidateAffected();
    return { success: true, data: { id: row.id } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "카테고리 생성 실패",
    };
  }
}

export async function updateCategoryAction(
  id: string,
  input: UpdateCategoryInput,
): Promise<ActionResult<{ id: string }, UpdateCategoryInput>> {
  try {
    await requireSuperAdmin();
  } catch (e) {
    return authError(e);
  }
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error };
  try {
    const row = await service.updateCategory(id, parsed.data);
    if (!row) return { success: false, error: "Not Found" };
    revalidateAffected();
    return { success: true, data: { id: row.id } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "카테고리 수정 실패",
    };
  }
}
