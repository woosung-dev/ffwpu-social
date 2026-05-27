// 사용자 사이트 Route Group 레이아웃 — PublicHeader + main + PublicFooter wrap (Figma SSoT 정합)
import { PublicFooter, PublicHeader } from "@/client/layouts";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
