// 카테고리 Server Actions — 얇은 진입점. requireSuperAdmin + Zod 검증 + service 위임
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { type ActionResult, toActionError } from "@/lib/action-result";
import * as service from "./service";
import {
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type ReorderCategoriesInput,
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
} from "./schemas";

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
    const parsed = createCategorySchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error };
    const row = await service.createCategory(parsed.data);
    revalidateAffected();
    return { success: true, data: { id: row.id } };
  } catch (e) {
    // slug 중복 등 DomainError 는 사용자 메시지 보존, DB 오류는 generic 은닉
    return toActionError(e, "categoryAction");
  }
}

export async function updateCategoryAction(
  id: string,
  input: UpdateCategoryInput,
): Promise<ActionResult<{ id: string }, UpdateCategoryInput>> {
  try {
    await requireSuperAdmin();
    if (!z.uuid().safeParse(id).success) {
      return { success: false, error: "잘못된 카테고리 ID 형식입니다." };
    }
    const parsed = updateCategorySchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error };
    const row = await service.updateCategory(id, parsed.data);
    if (!row) return { success: false, error: "Not Found" };
    revalidateAffected();
    return { success: true, data: { id: row.id } };
  } catch (e) {
    return toActionError(e, "categoryAction");
  }
}

// 드래그 정렬 일괄 저장 — 명시 Save. 노출 순서가 사용자 사이트 탭·필터에 즉시 반영
export async function reorderCategoriesAction(
  input: ReorderCategoriesInput,
): Promise<ActionResult<{ count: number }, ReorderCategoriesInput>> {
  try {
    await requireSuperAdmin();
    const parsed = reorderCategoriesSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error };
    await service.reorderCategories(parsed.data.orderedIds);
    revalidateAffected();
    return { success: true, data: { count: parsed.data.orderedIds.length } };
  } catch (e) {
    return toActionError(e, "categoryAction");
  }
}
