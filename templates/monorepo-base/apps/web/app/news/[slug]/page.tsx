// news 공개 상세 - slug 로 단일 게시물 조회, 없으면 404
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBySlug as getPublishedNewsBySlug } from "@myorg/features/news/service";

interface PageProps {
  // Next.js 16: params 는 Promise
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const news = await getPublishedNewsBySlug(slug);
  if (!news) {
    return { title: "찾을 수 없는 소식" };
  }
  return {
    title: news.title,
    description: news.summary ?? undefined,
  };
}

export default async function NewsDetailPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const news = await getPublishedNewsBySlug(slug);
  if (!news) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-screen-md flex-col gap-8 px-6 py-12">
      <nav className="text-sm">
        <Link
          href="/news"
          className="text-muted-foreground hover:text-foreground"
        >
          ← 소식 목록
        </Link>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {news.title}
        </h1>
        {news.publishedAt ? (
          <time
            dateTime={news.publishedAt.toISOString()}
            className="text-sm text-muted-foreground"
          >
            {news.publishedAt.toLocaleDateString("ko-KR")}
          </time>
        ) : null}
      </header>

      <article
        className="prose prose-neutral max-w-none dark:prose-invert"
        // 다운스트림에서 sanitize 처리 - 현재는 placeholder
        dangerouslySetInnerHTML={{ __html: news.body ?? "" }}
      />
    </main>
  );
}
