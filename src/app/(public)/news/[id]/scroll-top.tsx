// 소식 상세 — 맨 위로 스크롤 버튼 (Figma 우하단 플로팅 ScrollButton)
"use client";

import { ArrowUp } from "lucide-react";

export function ScrollTopButton() {
  return (
    <button
      type="button"
      aria-label="맨 위로"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-6 bottom-28 z-30 flex size-12 items-center justify-center rounded-full border border-brand-pale bg-white text-brand-primary shadow-md transition-opacity hover:opacity-90 lg:size-14"
    >
      <ArrowUp className="size-6" aria-hidden />
    </button>
  );
}
