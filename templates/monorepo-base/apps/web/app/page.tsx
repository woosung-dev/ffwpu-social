// web 앱 홈 - 공개 콘텐츠 진입점 (다운스트림에서 섹션 컴포넌트 채움)
import Link from "next/link";
import { Button } from "@myorg/ui-base/components/button";

export default function HomePage(): React.ReactElement {
  return (
    <main className="mx-auto flex min-h-screen max-w-screen-xl flex-col gap-12 px-6 py-16">
      <section className="flex flex-col gap-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          MyOrg
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          이 자리는 다운스트림 프로젝트에서 Hero / KPI / Story 섹션으로 교체합니다.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/news">소식 보기</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">공개 콘텐츠</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            app router (public) layout · news 목록/상세 라우트가 기본 포함되어 있습니다.
          </p>
        </article>
        <article className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">디자인 토큰</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            globals.css @theme inline + tailwind preset 으로 브랜드 토큰 주입.
          </p>
        </article>
        <article className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">OAuth slot</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            auth.ts · /api/auth/[...nextauth] 가 placeholder 로 준비되어 있습니다.
          </p>
        </article>
      </section>
    </main>
  );
}
