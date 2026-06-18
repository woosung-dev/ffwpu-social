// StorySection 카피 편집 — 태그(1줄)·제목·부제(엔터=줄바꿈). placeholder 로 설명. updateStorySectionTextAction
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateStorySectionTextAction } from "@/features/kpi/actions";
import {
  storyTextUpdateSchema,
  type StoryTextUpdateInput,
} from "@/features/kpi/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpTip } from "@/admin/components/HelpTip";
import { ADMIN_COPY } from "@/admin/copy";

const C = ADMIN_COPY.landing;

// Input(shadcn) 과 동일 결의 textarea — 여러 줄 입력(엔터 줄바꿈)
const TEXTAREA_CLASS =
  "w-full min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-base leading-relaxed shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

type Props = { initial: StoryTextUpdateInput };

export function StoryTextEditor({ initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<StoryTextUpdateInput>({
    resolver: zodResolver(storyTextUpdateSchema),
    defaultValues: initial,
  });

  const onSubmit = (values: StoryTextUpdateInput) => {
    setError(null);
    startTransition(async () => {
      const result = await updateStorySectionTextAction(values);
      if (!result.success) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "입력값을 확인해주세요.",
        );
        return;
      }
      toast.success("메인 카피가 저장되었습니다. 메인 페이지에 즉시 반영됩니다.");
      router.refresh();
    });
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-xl">
          {C.storyTextTitle}
          <HelpTip>{C.storyTextHelp}</HelpTip>
        </CardTitle>
        <p className="text-sm text-ink-subtle">{C.storyTextDesc}</p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="story-tag">{C.storyTextTagLabel}</Label>
            <Input
              id="story-tag"
              placeholder={C.storyTextTagPlaceholder}
              disabled={isPending}
              {...form.register("tag")}
            />
            {form.formState.errors.tag && (
              <p className="text-xs text-destructive">
                {form.formState.errors.tag.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="story-title">{C.storyTextTitleLabel}</Label>
            <textarea
              id="story-title"
              rows={2}
              className={TEXTAREA_CLASS}
              placeholder={C.storyTextTitlePlaceholder}
              disabled={isPending}
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="story-subtitle">{C.storyTextSubtitleLabel}</Label>
            <textarea
              id="story-subtitle"
              rows={2}
              className={TEXTAREA_CLASS}
              placeholder={C.storyTextSubtitlePlaceholder}
              disabled={isPending}
              {...form.register("subtitle")}
            />
            {form.formState.errors.subtitle && (
              <p className="text-xs text-destructive">
                {form.formState.errors.subtitle.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <p className="mr-auto text-xs text-ink-date">
              저장 시 메인 페이지에 즉시 반영됩니다.
            </p>
            <Button type="submit" disabled={isPending}>
              {isPending ? "저장 중..." : "카피 저장"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
