// 부팅 시 환경변수 검증 - 누락 시 즉시 throw 로 사일런트 실패 방지
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET 은 최소 32 byte (openssl rand -base64 32)"),
  AUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("[admin/env] 환경변수 검증 실패:", parsed.error.flatten().fieldErrors);
  throw new Error("환경변수 부팅 검증 실패 - .env.local 확인");
}

export const env = parsed.data;
