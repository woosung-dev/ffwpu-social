// 404 페이지 — 어드민 host 차단 시에도 사용됨 (proxy.ts 와 별개의 라우트 미스 케이스)
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-muted-foreground">
        주소를 다시 확인해주세요.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">홈으로</Link>
      </Button>
    </main>
  );
}
