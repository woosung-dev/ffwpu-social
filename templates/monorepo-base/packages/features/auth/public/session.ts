// 공개 사이트 세션 헬퍼 — apps/web/auth.ts 의 auth() 를 DI 로 등록받아 사용
import type { Session } from "next-auth";
import type { AppSession } from "../shared/session";

let resolver: (() => Promise<Session | null>) | null = null;

export function registerPublicAuth(fn: () => Promise<Session | null>): void {
  resolver = fn;
}

export async function getPublicSession(): Promise<AppSession | null> {
  if (!resolver) return null;
  const session = await resolver();
  if (!session?.user) return null;
  return session as AppSession;
}
