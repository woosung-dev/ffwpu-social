// web 앱 NextAuth v5 설정 - OAuth provider slot (활성화 전 빈 providers + 안전 가드)
import NextAuth, { type NextAuthConfig } from "next-auth";

// OAuth 활성화 시 아래에 Google/GitHub 등 provider 추가
// 예: import Google from "next-auth/providers/google";
const providers: NextAuthConfig["providers"] = [
  // 활성화 전 빈 배열 - /api/auth/[...nextauth] 가 500 응답하지 않도록
  // 라우트 핸들러에서 providers.length === 0 일 때 404 처리
];

export const authConfig: NextAuthConfig = {
  providers,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth }) {
      // web 은 공개 사이트 - 기본 허용. 보호 라우트는 page 단위로 처리
      return Boolean(auth);
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// 라우트 핸들러에서 providers 활성 여부 판단용
export const hasActiveProviders = providers.length > 0;
