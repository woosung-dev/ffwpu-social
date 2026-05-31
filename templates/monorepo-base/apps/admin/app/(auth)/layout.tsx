// 비인증 영역 레이아웃 — 로그인 카드 가운데 정렬
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
