// 어드민 NextAuth v5 — packages/features/auth/admin SSoT 위임 (인라인 구현 금지, 엔지니어 리뷰 P0)
import NextAuth from "next-auth";
import { adminAuthConfig } from "@myorg/features/auth/admin";

export const { handlers, auth, signIn, signOut } = NextAuth(adminAuthConfig);
