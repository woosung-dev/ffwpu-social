// 사이트 상단 안내 띠 — Sow Good 워드마크 + 참여 권유 카피. 정확한 카피는 D-3 시안 적용 시 확정 (의도서 §6 톤앤매너 기반 placeholder)
import Link from "next/link";

export function Banner() {
  return (
    <div className="bg-brand-primary text-white">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 text-center lg:px-8 lg:py-2.5">
        <span className="text-sm font-black tracking-wide lg:text-base">
          Sow Good
        </span>
        <span className="text-xs text-white/85 lg:text-sm">
          가족이 아니어도, 누구나 함께할 수 있습니다.
        </span>
        <Link
          href="/news"
          className="ml-2 text-xs font-semibold text-white underline decoration-white/40 underline-offset-2 transition-colors hover:decoration-white lg:text-sm"
        >
          참여하기
        </Link>
      </div>
    </div>
  );
}
