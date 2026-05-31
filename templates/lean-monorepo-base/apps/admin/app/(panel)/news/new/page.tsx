// 새 소식 작성 - features/news/ui 의 NewsForm 재사용 + createNews action
import { NewsForm } from "@/features/news/ui";
import { createNews } from "@/features/news/actions";

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">새 소식 작성</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          제목·요약·본문·상태를 입력하세요.
        </p>
      </header>
      <NewsForm action={createNews} mode="create" />
    </div>
  );
}
