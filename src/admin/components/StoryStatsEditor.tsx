// 쌀나눔 통계 입력 — StorySection 3 통계(후원기관·지원가정·지역시설) 개수 편집. value 0/빈값 → 메인 비노출. updateKpisAction 재사용 (slug 키)
"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateKpisAction } from "@/features/kpi/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

// 개수 검증 — 정수·0 이상. 소수/음수/비숫자는 필드별 에러로 표시 (kpi value 제약과 동일)
const storyStatsFormSchema = z.object({
  rows: z.array(
    z.object({
      value: z
        .number({ message: "숫자를 입력해주세요" })
        .int("정수만 입력할 수 있습니다")
        .min(0, "0 이상이어야 합니다")
        .max(99_999_999)
        .nullable(),
    }),
  ),
});

type FormValues = z.infer<typeof storyStatsFormSchema>;

// 표시 값 파생 — 운영자는 개수만 입력, 단위는 행 고정. value 0/null 이면 "0개" 저장(메인에선 hide-when-empty 로 숨김)
function deriveDisplayValue(value: number | null, unit: string | null): string {
  return `${value ?? 0}${unit ?? ""}`;
}

export function StoryStatsEditor({ initialStats }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(storyStatsFormSchema),
    defaultValues: {
      rows: initialStats.map((s) => ({ value: s.value })),
    },
  });

  const onSubmit = (values: FormValues) => {
    setError(null);
    startTransition(async () => {
      const rows = initialStats.map((stat, idx) => {
        const value = values.rows[idx]?.value ?? null;
        return {
          slug: stat.slug,
          label: stat.label,
          value,
          displayValue: deriveDisplayValue(value, stat.unit),
          unit: stat.unit,
        };
      });
      const result = await updateKpisAction({ rows });
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

  // 입력 중 hide 여부 미리보기 — 0/빈값이면 메인에서 숨김
  const watched = form.watch("rows");

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-xl">
          쌀 나눔 통계 (StorySection)
        </CardTitle>
        <p className="text-sm text-ink-subtle">
          메인 &ldquo;쌀 나눔 활동&rdquo; 영역의 개수입니다. 0 이거나 비우면 해당
          항목은 메인에 노출되지 않습니다.
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
              const current = watched?.[idx]?.value ?? null;
              const hidden = current == null || current <= 0;
              return (
                <div key={stat.slug} className="space-y-2">
                  <Label htmlFor={`story-stat-${idx}`}>{stat.label}</Label>
                  <div className="flex items-center gap-2">
                    <Controller
                      control={form.control}
                      name={`rows.${idx}.value` as const}
                      render={({ field }) => (
                        <Input
                          id={`story-stat-${idx}`}
                          type="number"
                          min={0}
                          max={99_999_999}
                          inputMode="numeric"
                          disabled={isPending}
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? null : Number(v));
                          }}
                        />
                      )}
                    />
                    {stat.unit && (
                      <span className="shrink-0 text-sm text-ink-subtle">
                        {stat.unit}
                      </span>
                    )}
                  </div>
                  {form.formState.errors.rows?.[idx]?.value ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.rows[idx]?.value?.message}
                    </p>
                  ) : (
                    <p className="text-xs text-ink-subtle">
                      {hidden
                        ? "메인에서 숨김 (값 없음)"
                        : `메인 노출: ${current}${stat.unit ?? ""}`}
                    </p>
                  )}
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
