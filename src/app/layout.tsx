// 루트 레이아웃 — 한국어 lang, SUIT 폰트(next/font/local), 메타데이터. Banner/Header/Footer는 Route Group에서 wrap
import type { Metadata } from "next";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from "@/lib/site";

// GA4 측정 ID — 환경변수 설정 시(프로덕션)에만 로드. 미설정(로컬·미발급) 시 미주입.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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

// Gmarket Sans Medium — Hero 헤드라인 전용(SIL OFL, corp.gmarket.com). Medium(500) 단일 weight.
const gmarketSans = localFont({
  src: [
    { path: "../../public/fonts/GmarketSans-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-gmarket",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Apple SD Gothic Neo", "sans-serif"],
});

// 루트 기본 메타 — metadataBase(OG 절대 URL 생성)·기본 OG·twitter. 페이지가 title/description/og 를 덮어씀.
// title 템플릿은 쓰지 않음(어드민은 자체 풀 타이틀 사용 — 이중 접미사 방지). 각 페이지가 명시 타이틀.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "사회공헌단 Sow Good — 가치를 삶으로 증명",
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
    url: SITE_URL,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${suit.variable} ${gmarketSans.variable}`}>
      <body>{children}</body>
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  );
}
