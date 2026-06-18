// 쌀나눔 통계 입력 — StorySection 3 통계 라벨·표시값 자유 편집. 표시값 비면 메인 비노출. updateStoryStatsAction (slug 키)
"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateStoryStatsAction } from "@/features/kpi/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpTip } from "@/admin/components/HelpTip";
import { ADMIN_COPY } from "@/admin/copy";

const LAND = ADMIN_COPY.landing;

export type StoryStatRow = {
  slug: string;
  label: string;
  value: number | null;
  displayValue: string;
  unit: string | null;
  sortOrder: number;
};

type Props = {
  initialStats: StoryStatRow[];
};

// 라벨·표시값 자유 텍스트. 표시값 비면 메인 숨김. 라벨은 필수(빈 행 방지)
const storyStatsFormSchema = z.object({
  rows: z.array(
    z.object({
      label: z.string().min(1, "라벨을 입력해주세요").max(50),
      displayValue: z.string().max(60),
    }),
  ),
});

type FormValues = z.infer<typeof storyStatsFormSchema>;

export function StoryStatsEditor({ initialStats }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(storyStatsFormSchema),
    defaultValues: {
      rows: initialStats.map((s) => ({
        label: s.label,
        displayValue: s.displayValue,
      })),
    },
  });

  const onSubmit = (values: FormValues) => {
    setError(null);
    startTransition(async () => {
      const rows = initialStats.map((stat, idx) => ({
        slug: stat.slug,
        label: values.rows[idx]?.label ?? stat.label,
        displayValue: values.rows[idx]?.displayValue ?? "",
        value: null,
        unit: null,
      }));
      const result = await updateStoryStatsAction({ rows });
      if (!result.success) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "입력값을 확인해주세요.",
        );
        return;
      }
      toast.success(
        "쌀 나눔 통계가 저장되었습니다. 메인 페이지에 즉시 반영됩니다.",
      );
      router.refresh();
    });
  };

  // 입력 중 hide 여부 미리보기 — 표시값 비면 메인에서 숨김
  const watched = form.watch("rows");

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-xl">
          {LAND.statsTitle}
          <HelpTip>{LAND.statsHelp}</HelpTip>
        </CardTitle>
        <p className="text-sm text-ink-subtle">
          메인 페이지 &ldquo;밥이 사랑이다&rdquo; 영역의 통계입니다. 제목·값을 자유롭게
          입력할 수 있고, 화면에 보이는 값을 비우면 해당 항목은 메인에 노출되지 않습니다.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {initialStats.map((stat, idx) => {
              const display = watched?.[idx]?.displayValue ?? "";
              const hidden = display.trim() === "";
              const labelErr = form.formState.errors.rows?.[idx]?.label;
              return (
                <div
                  key={stat.slug}
                  className="space-y-2 rounded-lg border border-border p-3"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor={`story-label-${idx}`}>
                      제목 <span className="text-destructive" aria-hidden>*</span>
                    </Label>
                    <Input
                      id={`story-label-${idx}`}
                      placeholder="예: 나눈 사랑(쌀)의 무게"
                      disabled={isPending}
                      aria-invalid={!!labelErr}
                      {...form.register(`rows.${idx}.label` as const)}
                    />
                    {labelErr && (
                      <p className="text-xs text-destructive">{labelErr.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`story-display-${idx}`}>화면에 보이는 값</Label>
                    <Controller
                      control={form.control}
                      name={`rows.${idx}.displayValue` as const}
                      render={({ field }) => (
                        <Input
                          id={`story-display-${idx}`}
                          placeholder="예: 12,345kg (비우면 숨김)"
                          disabled={isPending}
                          className="font-semibold"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </div>
                  <p className="text-xs text-ink-subtle">
                    {hidden
                      ? "메인에서 숨김 (표시값 없음)"
                      : `메인 노출: ${display}`}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <p className="mr-auto text-xs text-ink-date">
              저장 시 메인 페이지에 즉시 반영됩니다.
            </p>
            <Button type="submit" disabled={isPending}>
              {isPending ? "저장 중..." : "통계 저장"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
