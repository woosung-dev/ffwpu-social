// 어드민 뉴스 작성·수정 — RHF + Controller. body 는 useState 별도 (codex P1#6). 발행/임시 저장 2 버튼 (plan v2 결정 #6)
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { JSONContent } from "@tiptap/react";
import {
  createNewsAction,
  updateNewsAction,
} from "@/features/news/actions";
import { newsInputSchema, type NewsInput } from "@/features/news/schemas";
import { CoverImageUploader } from "./CoverImageUploader";
import { TagsInput } from "./TagsInput";
import { TiptapEditor } from "./TiptapEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type NewsCategoryOption = {
  id: string;
  name: string;
};

export type NewsEditorInitial = {
  id: string;
  title: string;
  body: JSONContent;
  categoryId: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  tags: string[];
};

type Props = {
  mode: "new" | "edit";
  categories: NewsCategoryOption[];
  initial?: NewsEditorInitial;
};

// 폼 schema — body·publishedAt 은 form 외부 관리 (P1#6 + 발행 버튼)
const formSchema = newsInputSchema.omit({ body: true, publishedAt: true });
type FormValues = z.infer<typeof formSchema>;

export function NewsEditor({ mode, categories, initial }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // 새 글도 client 에서 UUID 생성 → 업로드 prefix(news/{id}/) 와 news.id 를 동일하게 (codex v2 P2#2, temp prefix 제거)
  const generatedId = useMemo(() => crypto.randomUUID(), []);
  const newsId = isEdit ? initial!.id : generatedId;
  const scope = { newsId };

  // body 는 RHF 외부 useState — Tiptap 무한 루프 방지 (codex P1#6)
  const [body, setBody] = useState<JSONContent>(
    initial?.body ?? { type: "doc", content: [] },
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initial?.title ?? "",
      categoryId: initial?.categoryId ?? "",
      tags: initial?.tags ?? [],
      coverImageUrl: initial?.coverImageUrl ?? null,
    },
  });

  // submit handler — publish=true → publishedAt = (기존 발행 timestamp || now), false → null
  const submit = (publish: boolean) =>
    form.handleSubmit((values) => {
      setError(null);
      const publishedAt = publish
        ? isEdit && initial?.publishedAt
          ? initial.publishedAt
          : new Date()
        : null;
      const payload: NewsInput = {
        ...values,
        body,
        publishedAt,
      };
      startTransition(async () => {
        const result = isEdit
          ? await updateNewsAction(initial!.id, payload)
          : await createNewsAction(newsId, payload);
        if (!result.success) {
          const msg =
            typeof result.error === "string"
              ? result.error
              : "입력값을 확인해주세요.";
          setError(msg);
          return;
        }
        if (!isEdit) {
          router.push(`/admin/news/${result.data.id}/edit`);
        } else {
          router.refresh();
        }
      });
    })();

  return (
    <form className="space-y-6" noValidate>
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs underline"
            aria-label="닫기"
          >
            닫기
          </button>
        </div>
      )}

      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="news-title">제목</Label>
            <Input
              id="news-title"
              placeholder="제목을 입력하세요"
              disabled={isPending}
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <Label htmlFor="news-category">카테고리</Label>
            <Controller
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger id="news-category" className="w-full">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.categoryId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>

          {/* 커버 이미지 */}
          <div className="space-y-2">
            <Label>커버 이미지</Label>
            <Controller
              control={form.control}
              name="coverImageUrl"
              render={({ field }) => (
                <CoverImageUploader
                  value={field.value ?? null}
                  onChange={field.onChange}
                  scope={scope}
                  onError={setError}
                  disabled={isPending}
                />
              )}
            />
          </div>

          {/* 태그 */}
          <div className="space-y-2">
            <Label>태그</Label>
            <Controller
              control={form.control}
              name="tags"
              render={({ field }) => (
                <TagsInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  disabled={isPending}
                />
              )}
            />
          </div>

          {/* 본문 — useState 별도 (codex P1#6) */}
          <div className="space-y-2">
            <Label>본문</Label>
            <TiptapEditor
              defaultValue={initial?.body}
              onChange={setBody}
              scope={scope}
              onError={setError}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-ink-subtle">
          {isEdit && initial?.publishedAt && (
            <span>
              현재 상태: <span className="font-medium text-brand-primary">발행</span>{" "}
              ({initial.publishedAt.toLocaleDateString("ko-KR")})
            </span>
          )}
          {isEdit && !initial?.publishedAt && (
            <span>현재 상태: 임시 저장 (draft)</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => submit(false)}
            disabled={isPending}
          >
            {isPending ? "저장 중..." : "임시 저장"}
          </Button>
          <Button
            type="button"
            onClick={() => submit(true)}
            disabled={isPending}
          >
            {isPending ? "처리 중..." : "발행"}
          </Button>
        </div>
      </div>
    </form>
  );
}
