// 어드민 서버 액션/페이지 가드 — 호출 측에서 auth() 주입을 받아 super 검증
import type { Session } from "next-auth";
import type { AppSession } from "../shared/session";

export class UnauthorizedError extends Error {
  constructor(message = "어드민 인증 필요") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

// app 의 auth.ts 에서 export 된 auth() 를 인자로 주입 (DI) — peer dep 회피
let resolver: (() => Promise<Session | null>) | null = null;

export function registerAdminAuth(fn: () => Promise<Session | null>): void {
  resolver = fn;
}

export async function requireAdminSession(): Promise<AppSession> {
  if (!resolver) {
    throw new Error(
      "registerAdminAuth() 미호출 — apps/admin/auth.ts 에서 부팅 시 등록 필요",
    );
  }
  const session = await resolver();
  if (!session?.user || session.user.role !== "super") {
    throw new UnauthorizedError();
  }
  return session as AppSession;
}

export async function getAdminSession(): Promise<AppSession | null> {
  if (!resolver) return null;
  const session = await resolver();
  if (!session?.user || session.user.role !== "super") return null;
  return session as AppSession;
}
