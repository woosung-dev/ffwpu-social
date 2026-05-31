// 기존 소식 수정 - id 로 조회 후 폼에 초깃값 주입
import { notFound } from "next/navigation";
import { getNews } from "@/features/news/service";
import { updateNews } from "@/features/news/actions";
import { NewsForm } from "@/features/news/ui";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getNews(id);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">소식 수정</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{item.title}</p>
      </header>
      <NewsForm action={updateNews} mode="edit" initial={item} />
    </div>
  );
}
