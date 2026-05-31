// 어드민 패널 공통 레이아웃 - 인증 가드 + 사이드바 + 콘텐츠 영역
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AdminSidebar } from "@/components/layouts/AdminSidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <AdminSidebar userEmail={session.user.email ?? ""} onLogout={logout} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
