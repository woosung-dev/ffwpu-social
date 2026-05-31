// news 공개 목록 - 카테고리 필터·페이지네이션 placeholder + features/news 서비스 호출
import Link from "next/link";
import { listPublic } from "@myorg/features/news/service";
import { ALL_CATEGORY_SLUG } from "@myorg/db";
import { NewsCard } from "@myorg/features/news/components/NewsCard";

export const metadata = {
  title: "소식",
  description: "공개 소식 목록",
};

interface NewsListSearchParams {
  page?: string;
  category?: string;
}

export default async function NewsListPage({
  searchParams,
}: {
  // Next.js 16: searchParams 는 Promise
  searchParams: Promise<NewsListSearchParams>;
}): Promise<React.ReactElement> {
  const { page, category } = await searchParams;
  const pageNum = Number.parseInt(page ?? "1", 10) || 1;

  const { rows: items, total, pageSize } = await listPublic({
    page: pageNum,
    pageSize: 12,
    categorySlug: category ?? ALL_CATEGORY_SLUG,
    status: "published",
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="mx-auto flex min-h-screen max-w-screen-xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">News</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">소식</h1>
        <p className="text-muted-foreground">
          최신 공개 소식을 확인해보세요.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-muted-foreground">아직 등록된 소식이 없습니다.</p>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </section>
      )}

      {totalPages > 1 ? (
        <nav
          aria-label="페이지네이션"
          className="flex items-center justify-center gap-2"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (p !== 1) params.set("page", String(p));
            if (category) params.set("category", category);
            const qs = params.toString();
            const href = qs ? `/news?${qs}` : "/news";
            const active = p === pageNum;
            return (
              <Link
                key={p}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  "rounded-md border px-3 py-1.5 text-sm " +
                  (active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent")
                }
              >
                {p}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </main>
  );
}
