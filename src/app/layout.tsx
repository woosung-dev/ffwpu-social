// 루트 레이아웃 — 한국어 lang, SUIT 폰트(next/font/local), 메타데이터. Banner/Header/Footer는 Route Group에서 wrap
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const suit = localFont({
  src: [
    { path: "../../public/fonts/SUIT-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/SUIT-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/SUIT-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/SUIT-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/SUIT-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../../public/fonts/SUIT-Heavy.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-suit",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Apple SD Gothic Neo", "sans-serif"],
});

export const metadata: Metadata = {
  title: "사회공헌단 Sow Good — 가치를 삶으로 증명",
  description:
    "세계평화통일가정연합 신한국협회 사회공헌국의 공식 사회공헌 활동 기록 사이트",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={suit.variable}>
      <body>{children}</body>
    </html>
  );
}
