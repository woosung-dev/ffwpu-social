// 소식 목록 페이지 — Server Component, features/news/service 직접 호출 (3-layer 진입)
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { listPublishedNews } from "@/features/news/service";

export const metadata = {
  title: "소식",
  description: "공개된 소식 게시판",
};

export default async function NewsListPage() {
  const items = await listPublishedNews({ limit: 20 });

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">소식</h1>
        <p className="mt-2 text-muted-foreground">
          최근에 공개된 소식 {items.length}건
        </p>
      </header>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          아직 공개된 소식이 없습니다.
        </p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/news/${item.slug}`} className="block h-full">
                <Card className="h-full p-6 transition-colors hover:bg-accent">
                  <h2 className="line-clamp-2 text-lg font-semibold">
                    {item.title}
                  </h2>
                  {item.summary && (
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                      {item.summary}
                    </p>
                  )}
                  <p className="mt-4 text-xs text-muted-foreground">
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString("ko-KR")
                      : ""}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
