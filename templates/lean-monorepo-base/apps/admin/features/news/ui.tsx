// 어드민 소식 도메인의 UI 컴포넌트 - 폼·행 등 어드민 전용 (web 과 분리)
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form";
import { formatDate } from "@/lib/utils";
import { deleteNews } from "./actions";
import type { NewsRow as NewsItem } from "./db";

type FormAction = (formData: FormData) => void | Promise<void>;

export function NewsForm({
  action,
  mode,
  initial,
}: {
  action: FormAction;
  mode: "create" | "edit";
  initial?: NewsItem;
}) {
  return (
    <form action={action} className="space-y-5 rounded-lg border bg-[var(--color-bg)] p-6">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

      <FormField label="제목" name="title" required>
        <Input name="title" required defaultValue={initial?.title ?? ""} maxLength={200} />
      </FormField>

      <FormField label="슬러그 (URL)" name="slug" hint="소문자·숫자·하이픈" required>
        <Input
          name="slug"
          required
          defaultValue={initial?.slug ?? ""}
          pattern="[a-z0-9-]+"
          maxLength={120}
        />
      </FormField>

      <FormField label="요약" name="summary" hint="목록·SNS 공유에 노출">
        <Input name="summary" defaultValue={initial?.summary ?? ""} maxLength={500} />
      </FormField>

      <FormField label="본문" name="body" required>
        <textarea
          name="body"
          required
          defaultValue={initial?.body ?? ""}
          rows={14}
          className="w-full rounded border bg-white p-3 font-mono text-sm"
        />
      </FormField>

      <FormField label="상태" name="status">
        <select
          name="status"
          defaultValue={initial?.status ?? "draft"}
          className="rounded border bg-white px-3 py-2 text-sm"
        >
          <option value="draft">초안</option>
          <option value="published">발행</option>
          <option value="archived">보관</option>
        </select>
      </FormField>

      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="submit">{mode === "create" ? "작성" : "저장"}</Button>
        {mode === "edit" && initial ? <DeleteButton id={initial.id} /> : null}
      </div>
    </form>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteNews}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger">
        삭제
      </Button>
    </form>
  );
}

export function NewsRow({ item }: { item: NewsItem }) {
  return (
    <li className="flex items-center justify-between gap-4 p-4">
      <div className="min-w-0 flex-1">
        <Link
          href={`/news/${item.id}/edit`}
          className="block truncate font-medium hover:underline"
        >
          {item.title}
        </Link>
        <p className="truncate text-xs text-[var(--color-text-muted)]">
          {item.summary || "(요약 없음)"} · {formatDate(item.createdAt)}
        </p>
      </div>
      <span
        className={`shrink-0 rounded px-2 py-0.5 text-xs ${
          item.status === "published"
            ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
            : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
        }`}
      >
        {item.status}
      </span>
    </li>
  );
}
