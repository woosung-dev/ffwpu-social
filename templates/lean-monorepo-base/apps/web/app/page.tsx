// 공개 사이트 랜딩 — 최소 환영 페이지 (실 콘텐츠는 다음 sprint 에서 sections 도입)
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Lean Monorepo 베이스
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Next.js 16 + Drizzle + NextAuth v5 + Tailwind v4 의 최소 동작 골격.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/news">소식 보기</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-4xl gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h2 className="font-semibold">Vertical Slice</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            features/news 1폴더에 actions·service·db·schemas·ui 평평하게 colocation.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold">@repo/db SSoT</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            schema·client 는 packages/db 단일 출처. web/admin 동일 import.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold">CSS-first Tailwind</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            globals.css 의 @theme inline 으로 브랜드 토큰 정의.
          </p>
        </Card>
      </section>
    </main>
  );
}
