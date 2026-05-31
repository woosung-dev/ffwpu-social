// NextAuth v5 어드민 설정 — Credentials provider + bcryptjs 검증, JWT 전략
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db, schema } from "@myorg/db";
import { eq } from "drizzle-orm";
import { verifyPassword } from "./password";
import type { UserRole } from "../shared/session";

const credsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// admin 앱의 auth.ts 가 이 config 를 NextAuth() 로 감싼다.
export const adminAuthConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(raw) {
        const parsed = credsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, parsed.data.email))
          .limit(1);
        if (!user) return null;

        // super 1명만 로그인 허용 (운영 정책)
        if (user.role !== "super") return null;
        if (!user.passwordHash) return null;

        const matches = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!matches) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) ?? "guest";
      }
      return session;
    },
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      // /login 은 공개, 그 외 어드민 라우트는 super 만
      if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
        return true;
      }
      return auth?.user?.role === "super";
    },
  },
};
