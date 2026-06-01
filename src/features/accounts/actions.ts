// 관리자 계정 Server Actions — 얇은 진입점. requireSuperAdmin 가드 + Zod 검증 + service 위임. actor 는 세션에서만 추출
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  requireSuperAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/lib/auth-guards";
import * as accountService from "./service";
import {
  createAccountSchema,
  resetPasswordSchema,
  deleteAccountSchema,
  type CreateAccountInput,
  type ResetPasswordInput,
} from "./schemas";

export type ActionResult<T, Input = unknown> =
  | { success: true; data: T }
  | { success: false; error: string | z.ZodError<Input> };

// 가드 예외만 메시지 노출, 그 외(DB 등)는 내부 로그 + generic — 내부 정보 누출 방지 (anti-slop §1)
function toActionError(e: unknown): { success: false; error: string } {
  if (e instanceof UnauthorizedError) return { success: false, error: "Unauthorized" };
  if (e instanceof ForbiddenError) return { success: false, error: "Forbidden" };
  console.error("[accountAction]", e);
  return {
    success: false,
    error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  };
}

export async function createAccountAction(
  input: CreateAccountInput,
): Promise<ActionResult<{ id: string }, CreateAccountInput>> {
  try {
    await requireSuperAdmin();
    const parsed = createAccountSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error };

    const result = await accountService.createAccount(parsed.data);
    if (result.kind === "email_taken") {
      return { success: false, error: "이미 사용 중인 이메일입니다." };
    }
    revalidatePath("/admin/accounts");
    return { success: true, data: { id: result.account.id } };
  } catch (e) {
    return toActionError(e);
  }
}

export async function resetPasswordAction(
  input: ResetPasswordInput,
): Promise<ActionResult<{ id: string }, ResetPasswordInput>> {
  try {
    await requireSuperAdmin();
    const parsed = resetPasswordSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error };

    const updated = await accountService.resetPassword(parsed.data);
    if (!updated) return { success: false, error: "계정을 찾을 수 없습니다." };
    revalidatePath("/admin/accounts");
    return { success: true, data: { id: updated.id } };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteAccountAction(
  input: { userId: string },
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSuperAdmin();
    const parsed = deleteAccountSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "잘못된 요청입니다." };

    // actor 는 세션에서만 — 클라이언트가 보낸 값 신뢰 금지
    const result = await accountService.deleteAccount(
      parsed.data.userId,
      session.user.id,
    );
    switch (result.kind) {
      case "self_delete":
        return { success: false, error: "본인 계정은 삭제할 수 없습니다." };
      case "last_super":
        return {
          success: false,
          error: "마지막 관리자 계정은 삭제할 수 없습니다.",
        };
      case "not_found":
        return { success: false, error: "계정을 찾을 수 없습니다." };
      case "ok":
        revalidatePath("/admin/accounts");
        return { success: true, data: { id: parsed.data.userId } };
      default:
        // exhaustive — service 가 새 kind 추가 시 컴파일 에러로 침묵 누락 방지 (typescript.md §3)
        result satisfies never;
        return { success: false, error: "알 수 없는 오류가 발생했습니다." };
    }
  } catch (e) {
    return toActionError(e);
  }
}
