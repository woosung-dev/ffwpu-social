// NextAuth.js v5 — Credentials Provider 단일, super 단일 계정 (ADR-020)
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { normalizeEmail } from "@/features/accounts/schemas";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" }, // Credentials는 jwt 필수
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const rawEmail = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!rawEmail || !password) return null;
        // 생성 시와 동일 정규화 — 대소문자·공백 차이로 로그인 실패 방지 (단일 출처 normalizeEmail)
        const email = normalizeEmail(rawEmail);

        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            passwordHash: users.passwordHash,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // 최초 로그인 — authorize 가 넘긴 user 로 토큰 구성
      if (user) {
        const u = user as { id?: string; role?: string };
        if (u.id) token.id = u.id;
        token.role = u.role;
        return token;
      }
      // 이후 모든 세션 접근 — DB 계정 상태 재확인. 삭제/역할 변경 시 토큰 무효화(null → Auth.js 가 쿠키 정리).
      // proxy auth() 가 /admin 요청마다 태우므로 "계정 삭제·강등 즉시 접근 차단"이 목적. 단일 super·저빈도라 요청당 재조회 허용 (codex A3)
      const tokenId = token.id as string | undefined;
      if (!tokenId) return null;
      const [current] = await db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.id, tokenId))
        .limit(1);
      if (!current) return null; // 계정 삭제됨 → 세션 무효화
      token.role = current.role; // 역할 변경 즉시 반영
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
