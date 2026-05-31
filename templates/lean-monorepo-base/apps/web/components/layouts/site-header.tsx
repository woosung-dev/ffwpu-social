// 공개 사이트 헤더 — Route Group (public) 공통 상단 내비
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-bold tracking-tight">
          공개 사이트
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/news"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            소식
          </Link>
        </nav>
      </div>
    </header>
  );
}
