// 관리자 계정 Zod 스키마 + 이메일 정규화 단일 출처. 클라이언트 폼·서버 액션·로그인(auth.ts) 공용 (server-only 금지 — 폼에서 import)
import { z } from "zod";

// 이메일 정규화 — 생성·로그인 양쪽에서 동일 적용 필수 (대문자로 만든 계정이 소문자 로그인 실패 방지)
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 비밀번호 — 최소 10자, 영문+숫자. bcrypt 72바이트 한계 고려 max 72
export const PASSWORD_MIN = 10;
const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `비밀번호는 최소 ${PASSWORD_MIN}자 이상이어야 합니다`)
  // bcrypt 는 72바이트 초과분을 조용히 잘라냄 — 문자 수가 아닌 UTF-8 바이트 길이로 검증 (한글 등 멀티바이트 안전)
  .refine(
    (v) => new TextEncoder().encode(v).length <= 72,
    "비밀번호가 너무 깁니다 (최대 72바이트)",
  )
  .refine((v) => /[a-zA-Z]/.test(v), "영문을 포함해야 합니다")
  .refine((v) => /[0-9]/.test(v), "숫자를 포함해야 합니다");

const emailSchema = z
  .string()
  .min(1, "이메일을 입력해주세요")
  .max(255)
  .transform(normalizeEmail)
  .refine((v) => EMAIL_REGEX.test(v), "올바른 이메일 형식이 아닙니다");

// 액션 입력 — role 은 서버에서 super 고정 (input 에서 받지 않음 = 권한 상승 차단)
export const createAccountSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(1, "이름을 입력해주세요").max(100),
  password: passwordSchema,
});
export type CreateAccountInput = z.infer<typeof createAccountSchema>;

// 폼 — passwordConfirm 추가 (클라이언트 일치 검증). 제출 시 email/name/password 만 액션에 전달
export const createAccountFormSchema = createAccountSchema
  .extend({ passwordConfirm: z.string() })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });
export type CreateAccountFormInput = z.infer<typeof createAccountFormSchema>;

export const resetPasswordSchema = z.object({
  userId: z.uuid(),
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const resetPasswordFormSchema = resetPasswordSchema
  .extend({ passwordConfirm: z.string() })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });
export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;

export const deleteAccountSchema = z.object({ userId: z.uuid() });
