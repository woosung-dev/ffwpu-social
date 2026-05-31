// 공개 사이트 NextAuth v5 설정 — OAuth provider slot (활성화 전 빈 배열)
import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "../shared/session";

// providers 가 비어있으면 NextAuth 가 500 을 낼 수 있으므로,
// 활성화 전에는 apps/web 의 route handler 자체를 비활성 처리해야 한다.
// (AGENTS.md security 섹션 risks 참조)
export const publicAuthConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    // TODO: 활성화 시 Google/Kakao 등 OAuth provider 추가
    // import Google from "next-auth/providers/google";
    // Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = "user" as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as UserRole) ?? "guest";
      }
      return session;
    },
  },
};
