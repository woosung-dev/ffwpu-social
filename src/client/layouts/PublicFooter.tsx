// 사용자 사이트 푸터 — 다크 배경(#242424), 카피라이트 + 내부 링크. Server Component
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-surface-dark text-white">
      <div className="container mx-auto px-4 py-10 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-base font-extrabold tracking-tight">Sow Good</p>
            <p className="text-sm text-white/60">
              세계평화통일가정연합 신한국협회 사회공헌국
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
            <li>
              <Link href="/" className="transition-colors hover:text-white">
                소개
              </Link>
            </li>
            <li>
              <Link href="/news" className="transition-colors hover:text-white">
                쌀 나눔 소식
              </Link>
            </li>
          </ul>
        </div>
        <p className="mt-8 text-xs text-white/40">
          © 2026 FFWPU Korea — Sow Good. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
