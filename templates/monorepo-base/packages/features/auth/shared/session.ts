// admin/public 공통 세션 타입 — NextAuth v5 JWT/Session 콜백에서 동기화
import { z } from "zod";

export const userRoleSchema = z.enum(["super", "user", "guest"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export interface AppSessionUser {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
}

export interface AppSession {
  user: AppSessionUser;
  expires: string; // ISO date string
}

// next-auth/jwt 모듈 확장 — admin/public 동일 시그니처 사용
declare module "next-auth" {
  interface Session {
    user: AppSessionUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
