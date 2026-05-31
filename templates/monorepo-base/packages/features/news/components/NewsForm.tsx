// 어드민 news 작성/수정 폼 — server action 호출 (Client Component)
"use client";

import * as React from "react";
import { Button } from "@myorg/ui-base/components/button";
import { Input } from "@myorg/ui-base/components/input";
import { Label } from "@myorg/ui-base/components/label";
import { createNewsAction, updateNewsAction } from "../actions/news.actions";
import type { CategoryRow, NewsRow } from "../schemas";

export interface NewsFormProps {
  mode: "create" | "edit";
  categories: CategoryRow[];
  initial?: Partial<NewsRow>;
}

export function NewsForm({ mode, categories, initial }: NewsFormProps) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    const payload = {
      ...(mode === "edit" ? { id: initial?.id } : {}),
      title: formData.get("title")?.toString() ?? "",
      slug: formData.get("slug")?.toString() ?? "",
      summary: formData.get("summary")?.toString() ?? "",
      body: formData.get("body")?.toString() ?? "",
      categoryId: formData.get("categoryId")?.toString() ?? "",
      coverImageUrl: formData.get("coverImageUrl")?.toString() || null,
      status: (formData.get("status")?.toString() ?? "draft") as "draft" | "published" | "archived",
    };
    startTransition(async () => {
      const result =
        mode === "edit"
          ? await updateNewsAction(payload)
          : await createNewsAction(payload);
      if (!result.ok) setError(result.error.message);
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" defaultValue={initial?.title ?? ""} required />
      </div>
      <div>
        <Label htmlFor="slug">slug</Label>
        <Input id="slug" name="slug" defaultValue={initial?.slug ?? ""} required />
      </div>
      <div>
        <Label htmlFor="categoryId">카테고리</Label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={initial?.categoryId ?? ""}
          required
          className="block w-full rounded border px-3 py-2"
        >
          <option value="" disabled>
            선택
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="summary">요약</Label>
        <Input id="summary" name="summary" defaultValue={initial?.summary ?? ""} />
      </div>
      <div>
        <Label htmlFor="body">본문</Label>
        <textarea
          id="body"
          name="body"
          defaultValue={initial?.body ?? ""}
          required
          rows={12}
          className="block w-full rounded border px-3 py-2 font-mono text-sm"
        />
      </div>
      <div>
        <Label htmlFor="coverImageUrl">표지 이미지 URL</Label>
        <Input
          id="coverImageUrl"
          name="coverImageUrl"
          defaultValue={initial?.coverImageUrl ?? ""}
        />
      </div>
      <div>
        <Label htmlFor="status">상태</Label>
        <select
          id="status"
          name="status"
          defaultValue={initial?.status ?? "draft"}
          className="block w-full rounded border px-3 py-2"
        >
          <option value="draft">초안</option>
          <option value="published">공개</option>
          <option value="archived">보관</option>
        </select>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : mode === "edit" ? "수정" : "생성"}
      </Button>
    </form>
  );
}
