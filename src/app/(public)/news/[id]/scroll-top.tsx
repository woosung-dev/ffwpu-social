// 소식 상세 — 맨 위로 스크롤 버튼 (Figma 우하단 플로팅 ScrollButton).
// 일정 스크롤 이후 노출하되, 푸터가 보이면 숨김 — 저작권 카피 위 겹침 방지
"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollTopButton() {
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const footer = document.querySelector("footer");
    const io = footer
      ? new IntersectionObserver(([entry]) =>
          setFooterVisible(entry.isIntersecting),
        )
      : undefined;
    io?.observe(footer!);

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  if (!scrolled || footerVisible) return null;

  return (
    <button
      type="button"
      aria-label="맨 위로"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-5 bottom-6 z-30 flex size-12 items-center justify-center rounded-full border border-brand-pale bg-white text-brand-primary shadow-md transition-opacity hover:opacity-90 lg:right-8 lg:bottom-8 lg:size-14"
    >
      <ArrowUp className="size-6" aria-hidden />
    </button>
  );
}
