// Server Action 표준 결과 타입 + 에러 변환 — 4개 도메인 actions 의 중복 정의 통합 (아키텍처 옵션1).
// 도메인 검증 실패(사용자에게 보여줄 메시지)는 보존하고, 내부 오류(DB·스토리지 등)는 로그 후 generic 으로 은닉 — 내부 정보 누출 방지 (codex D1, anti-slop §1)
import type { z } from "zod";

import { ForbiddenError, UnauthorizedError } from "@/lib/auth-guards";
import { DomainError } from "@/lib/errors";

export { DomainError };

export type ActionResult<T, Input = unknown> =
  | { success: true; data: T }
  | { success: false; error: string | z.ZodError<Input> };

// 모든 admin action 의 catch 에서 사용. 가드/도메인 예외만 메시지 노출, 그 외는 서버 로그 후 generic.
// context — 로그 식별자 (예: "newsAction")
export function toActionError(
  e: unknown,
  context: string,
): { success: false; error: string } {
  if (e instanceof UnauthorizedError) return { success: false, error: "Unauthorized" };
  if (e instanceof ForbiddenError) return { success: false, error: "Forbidden" };
  if (e instanceof DomainError) return { success: false, error: e.message };
  console.error(`[${context}]`, e);
  return {
    success: false,
    error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  };
}
