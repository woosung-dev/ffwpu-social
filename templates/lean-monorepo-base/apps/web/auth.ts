// 공개 사이트 NextAuth v5 — OAuth provider 자리 (1차 비활성, v1.1 회원가입 도입 시 활성화)
import NextAuth from "next-auth";

// 1차 범위: 회원가입·로그인 없음 (도메인 규칙 ADR-011)
// provider 배열은 비워두고 auth.ts 자체는 export 만 유지 — v1.1 에서 GitHub/Google 추가 시 한 줄 변경
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    // v1.1 활성화 예시 (현재 비활성):
    // GitHub({ clientId: env.AUTH_GITHUB_ID, clientSecret: env.AUTH_GITHUB_SECRET }),
    // Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET }),
  ],
  pages: {
    // v1.1: signIn: "/login"
  },
});
