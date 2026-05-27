// 루트 레이아웃 — 한국어 lang, 메타데이터. D-4에 SUIT 폰트·헤더·푸터 추가
import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
