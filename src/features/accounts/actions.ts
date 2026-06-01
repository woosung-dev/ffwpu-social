// 관리자 계정 Server Actions — 얇은 진입점. requireSuperAdmin 가드 + Zod 검증 + service 위임. actor 는 세션에서만 추출
"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdmin } from "@/lib/auth-guards";
import { type ActionResult, toActionError } from "@/lib/action-result";
import * as accountService from "./service";
import {
  createAccountSchema,
  resetPasswordSchema,
  deleteAccountSchema,
  type CreateAccountInput,
  type ResetPasswordInput,
} from "./schemas";

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
    return toActionError(e, "accountAction");
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
    return toActionError(e, "accountAction");
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
    return toActionError(e, "accountAction");
  }
}
