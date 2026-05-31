// 환경변수 Zod 검증 — 부팅 시 1회 parse, process.env 직접 참조는 본 파일에서만
import { z } from "zod";

const envSchema = z.object({
  // DB — packages/db 와 동일 URL 공유
  DATABASE_URL: z.url(),

  // NextAuth v5 — OAuth 자리 (1차 비활성, 키는 존재해야 빌드 통과)
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.url().optional(),

  // 환경
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // v1.1 OAuth (선택)
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
});

// 빌드/부팅 시 검증 — 실패 시 즉시 종료가 12-Factor Fail Fast
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // 서버 측에서만 실행됨 (lib/env.ts 는 클라이언트 import 금지)
  console.error("❌ Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
