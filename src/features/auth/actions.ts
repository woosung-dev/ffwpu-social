// 어드민 인증 Server Actions — 로그아웃은 NextAuth signOut + /admin/login 리다이렉트
"use server";

import { signOut } from "@/auth";

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
