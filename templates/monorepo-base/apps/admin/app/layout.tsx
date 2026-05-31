// 어드민 루트 레이아웃 — 한국어 lang · 운영 톤 토큰 주입
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin',
  description: '운영자 어드민',
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
