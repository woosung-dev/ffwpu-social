// 어드민 뉴스 작성·수정 — RHF + Controller. body 는 useState 별도 (codex P1#6). 좌 본문 + 우 sticky sidebar (발행 CTA·카테고리 chip·커버·태그)
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import type { JSONContent } from "@tiptap/react";
import {
  createNewsAction,
  updateNewsAction,
} from "@/features/news/actions";
import { newsInputSchema, type NewsInput } from "@/features/news/schemas";
import { CoverImageUploader } from "./CoverImageUploader";
import { DateTimePicker } from "./DateTimePicker";
import { TagsInput } from "./TagsInput";
import { TiptapEditor } from "./TiptapEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  coverImageWidth: number | null;
  coverImageHeight: number | null;
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
// @hookform/resolvers v5 는 input(기본값 적용 전)·output(검증 후) 타입을 구분 — tags 등 .default() 필드 정합용
type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

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
  // 발행 일시 — 수정 가능(미래 불가). 발행 시 적용. 기존 발행글은 그 일시, 신규·임시는 현재 기본
  const [publishAt, setPublishAt] = useState<Date>(
    initial?.publishedAt ?? new Date(),
  );

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initial?.title ?? "",
      categoryId: initial?.categoryId ?? "",
      tags: initial?.tags ?? [],
      coverImageUrl: initial?.coverImageUrl ?? null,
      coverImageWidth: initial?.coverImageWidth ?? null,
      coverImageHeight: initial?.coverImageHeight ?? null,
    },
  });

  // submit handler — publish=true → publishedAt = (기존 발행 timestamp || now), false → null
  const submit = (publish: boolean) =>
    form.handleSubmit((values) => {
      setError(null);
      // 미래 방어 클램프(피커가 막지만 직접 조작 대비) — 발행=선택 일시, 임시저장=null
      const publishedAt = publish
        ? publishAt.getTime() > Date.now()
          ? new Date()
          : publishAt
        : null;
      const payload: NewsInput = {
        ...values,
        // 문자열로 전송 — 객체로 보내면 Server Action 직렬화에서 중첩 attrs 가 소실됨($T). 서버에서 parse
        body: JSON.stringify(body),
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
        // 성공 피드백 명시 — 발행/저장 후 조용히 넘어가 첫 사용자가 불안하던 문제 보완(3-에이전트 검증 #4)
        toast.success(publish ? "발행되었습니다." : "임시 저장되었습니다.");
        if (!isEdit) {
          router.push(`/admin/news/${result.data.id}/edit`);
        } else {
          router.refresh();
        }
      });
    })();

  const isPublished = Boolean(isEdit && initial?.publishedAt);

  return (
    <form className="space-y-6 pb-24 lg:pb-0" noValidate>
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 focus-visible:ring-offset-2 rounded"
            aria-label="닫기"
          >
            닫기
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* 좌 — 본문 (lg 8/12) */}
        <Card className="lg:col-span-8">
          <CardContent className="space-y-8 pt-6">
            {/* 제목 */}
            <div className="space-y-2">
              <Label
                htmlFor="news-title"
                className="text-sm font-semibold text-ink-strong"
              >
                제목 <span className="text-destructive" aria-hidden>*</span>
              </Label>
              <Input
                id="news-title"
                placeholder="제목을 입력하세요"
                required
                aria-required
                aria-invalid={!!form.formState.errors.title}
                aria-describedby={
                  form.formState.errors.title ? "news-title-error" : undefined
                }
                disabled={isPending}
                className="h-11 text-base"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p id="news-title-error" className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* 본문 — useState 별도 (codex P1#6) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-ink-strong">
                본문
              </Label>
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

        {/* 우 — 메타 sidebar (lg 4/12) */}
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-6">
            {/* 발행 CTA — desktop sidebar 안 (모바일은 하단 fixed bar 별도) */}
            <Card className="hidden lg:block">
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-date">
                    상태
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      isPublished
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "bg-warm/15 text-amber-700",
                    )}
                  >
                    {isPublished ? "발행" : "임시 저장"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => submit(false)}
                    disabled={isPending}
                    className="flex-1 active:scale-[0.98]"
                  >
                    {isPending ? "저장 중..." : "임시 저장"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => submit(true)}
                    disabled={isPending}
                    className="flex-1 active:scale-[0.98]"
                  >
                    {isPending ? "처리 중..." : "발행"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 발행 일시 — 수정 가능(미래 불가, 예약 발행 없음). 발행 시 이 일시로 기록. 모바일·데스크탑 공통 노출 */}
            <Card>
              <CardContent className="space-y-2 pt-6">
                <h3 className="text-sm font-semibold text-ink-strong">
                  발행 일시
                </h3>
                <DateTimePicker
                  value={publishAt}
                  onChange={setPublishAt}
                  disabled={isPending}
                />
                <p className="text-xs text-ink-subtle">
                  발행하면 이 일시로 기록됩니다. 미래는 지정할 수 없어요(예약 발행 없음).
                </p>
              </CardContent>
            </Card>

            {/* 카테고리 — chip group (ceo P0: 선택값 항상 보임) */}
            <Card>
              <CardContent className="space-y-3 pt-6">
                <h3 className="text-sm font-semibold text-ink-strong">
                  카테고리 <span className="text-destructive" aria-hidden>*</span>
                </h3>
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <div
                      role="group"
                      aria-label="카테고리 선택"
                      aria-invalid={!!form.formState.errors.categoryId}
                      aria-describedby={
                        form.formState.errors.categoryId
                          ? "news-category-error"
                          : undefined
                      }
                      className="flex flex-wrap gap-1.5"
                    >
                      {categories.map((c) => {
                        const active = field.value === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => field.onChange(c.id)}
                            disabled={isPending}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 focus-visible:ring-offset-2",
                              "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                              active
                                ? "border-brand-primary/60 bg-brand-primary/10 text-brand-primary"
                                : "border-border bg-white text-ink-subtle hover:border-brand-primary/30 hover:bg-surface-soft hover:text-ink-strong",
                            )}
                          >
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {form.formState.errors.categoryId && (
                  <p id="news-category-error" className="text-xs text-destructive">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 커버 이미지 */}
            <Card>
              <CardContent className="space-y-3 pt-6">
                <h3 className="text-sm font-semibold text-ink-strong">
                  커버 이미지
                </h3>
                <Controller
                  control={form.control}
                  name="coverImageUrl"
                  render={({ field }) => (
                    <CoverImageUploader
                      value={field.value ?? null}
                      onChange={(url, dims) => {
                        field.onChange(url);
                        form.setValue("coverImageWidth", dims?.width ?? null);
                        form.setValue("coverImageHeight", dims?.height ?? null);
                      }}
                      scope={scope}
                      onError={setError}
                      disabled={isPending}
                    />
                  )}
                />
              </CardContent>
            </Card>

            {/* 태그 */}
            <Card>
              <CardContent className="space-y-3 pt-6">
                <h3 className="text-sm font-semibold text-ink-strong">
                  태그
                </h3>
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
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      {/* 모바일 fixed bottom bar — 발행 가시성 1탭 확보 (lg 이상은 sidebar 발행 카드 사용) */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              isPublished
                ? "bg-brand-primary/10 text-brand-primary"
                : "bg-warm/15 text-amber-700",
            )}
          >
            {isPublished ? "발행" : "임시 저장"}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => submit(false)}
            disabled={isPending}
            className="ml-auto active:scale-[0.98]"
          >
            {isPending ? "저장 중..." : "임시 저장"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => submit(true)}
            disabled={isPending}
            className="active:scale-[0.98]"
          >
            {isPending ? "처리 중..." : "발행"}
          </Button>
        </div>
      </div>
    </form>
  );
}
