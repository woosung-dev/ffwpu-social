// NextAuth v5 Credentials 인증 - super 단일 계정 (bcrypt 비교)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, users, eq } from "@repo/db";
import { env } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  cookies: {
    sessionToken: {
      name: env.NODE_ENV === "production" ? "__Secure-admin.session-token" : "admin.session-token",
      options: {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: env.NODE_ENV === "production",
      },
    },
  },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        if (user.role !== "super") return null;

        return { id: user.id, email: user.email, name: user.name ?? user.email };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.uid = user.id;
      return token;
    },
    session: ({ session, token }) => {
      if (token.uid && session.user) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
});
