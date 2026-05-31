// 공개 사이트 푸터 — 저작권·법인 정보 자리
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} 공개 사이트. All rights reserved.
      </div>
    </footer>
  );
}
