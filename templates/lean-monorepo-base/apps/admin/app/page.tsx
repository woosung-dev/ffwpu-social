// 어드민 루트 진입 - 인증 상태에 따라 대시보드 또는 로그인으로 분기
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminRootPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect("/dashboard");
}
