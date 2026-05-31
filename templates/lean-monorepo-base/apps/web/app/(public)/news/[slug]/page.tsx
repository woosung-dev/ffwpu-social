// 소식 상세 페이지 — Next.js 16 params Promise 비동기 패턴
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPublishedNewsBySlug } from "@/features/news/service";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = await getPublishedNewsBySlug(slug);
  if (!item) return { title: "소식을 찾을 수 없습니다" };
  return {
    title: item.title,
    description: item.summary ?? undefined,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublishedNewsBySlug(slug);
  if (!item) notFound();

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <Button asChild variant="ghost" className="mb-8">
        <Link href="/news">← 소식 목록</Link>
      </Button>

      <header>
        <h1 className="text-3xl font-bold md:text-4xl">{item.title}</h1>
        {item.publishedAt && (
          <p className="mt-3 text-sm text-muted-foreground">
            {new Date(item.publishedAt).toLocaleDateString("ko-KR")}
          </p>
        )}
      </header>

      {item.summary && (
        <p className="mt-8 text-lg text-muted-foreground">{item.summary}</p>
      )}

      <div className="prose prose-neutral mt-10 max-w-none whitespace-pre-wrap">
        {item.body}
      </div>
    </article>
  );
}
