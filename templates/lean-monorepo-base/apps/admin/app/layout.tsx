// 어드민 루트 레이아웃 - 모든 라우트의 최상위 HTML 셸
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sow Good 어드민",
  description: "FFWPU 사회공헌단 어드민 콘솔",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
