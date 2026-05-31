// 소식 목록 - 어드민 CRUD 의 진입점
import Link from "next/link";
import { listNews } from "@/features/news/service";
import { Button } from "@/components/ui/button";
import { NewsRow } from "@/features/news/ui";

export default async function NewsListPage() {
  const items = await listNews({ limit: 50 });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">소식 관리</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            쌀 나눔 소식을 작성·수정·발행합니다.
          </p>
        </div>
        <Link href="/news/new">
          <Button>새 글 작성</Button>
        </Link>
      </header>

      <section className="rounded-lg border bg-[var(--color-bg)]">
        {items.length === 0 ? (
          <p className="p-8 text-center text-sm text-[var(--color-text-muted)]">
            등록된 소식이 없습니다.
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((n) => (
              <NewsRow key={n.id} item={n} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
