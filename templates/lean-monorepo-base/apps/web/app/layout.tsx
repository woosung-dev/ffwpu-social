// 공개 사이트 루트 레이아웃 — 폰트·메타데이터·globals.css 한 곳에서만 import
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "공개 사이트",
    template: "%s | 공개 사이트",
  },
  description: "공개 사이트 — Next.js 16 + Lean Monorepo 베이스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
