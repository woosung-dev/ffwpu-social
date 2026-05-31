// 카테고리 관리 서버 액션 — 어드민 전용 (조회는 공개)
"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "../../auth/admin";
import * as categoryService from "../service/category.service";
import { categoryCreateSchema, categoryUpdateSchema } from "../schemas";
import { fail, ok } from "./result";

export async function listActiveCategoriesAction() {
  const rows = await categoryService.listActive();
  return ok(rows);
}

export async function listAllCategoriesAction() {
  await requireAdminSession();
  const rows = await categoryService.listAll();
  return ok(rows);
}

export async function createCategoryAction(input: unknown) {
  await requireAdminSession();
  const parsed = categoryCreateSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.message);
  try {
    const row = await categoryService.createCategory(parsed.data);
    revalidatePath("/news");
    return ok(row);
  } catch (err) {
    return fail(
      (err as { code?: string }).code ?? "UNKNOWN",
      (err as Error).message,
    );
  }
}

export async function updateCategoryAction(input: unknown) {
  await requireAdminSession();
  const parsed = categoryUpdateSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.message);
  try {
    const row = await categoryService.updateCategory(parsed.data);
    revalidatePath("/news");
    return ok(row);
  } catch (err) {
    return fail(
      (err as { code?: string }).code ?? "UNKNOWN",
      (err as Error).message,
    );
  }
}

export async function deactivateCategoryAction(id: string) {
  await requireAdminSession();
  if (!id) return fail("INVALID_ID", "id 필수");
  await categoryService.deactivateCategory(id);
  revalidatePath("/news");
  return ok(null);
}
