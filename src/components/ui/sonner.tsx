"use client";
// shadcn sonner 래퍼 — 어드민 라이트 테마 고정 (next-themes 미사용). 성공/정보 토스트 전용
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return <Sonner theme="light" className="toaster group" {...props} />;
}
