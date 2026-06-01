// KPI 입력 폼 — 4 row 카드 그리드 (label·displayValue·value·unit). RHF + Zod + transition. 발행 직후 사용자 사이트 메인 / 자동 반영
"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { updateKpisAction } from "@/features/kpi/actions";
import {
  kpiUpdateInputSchema,
  type KpiUpdateInput,
} from "@/features/kpi/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type KpiInitialRow = {
  slug: string;
  label: string;
  value: number | null;
  displayValue: string;
  unit: string | null;
  sortOrder: number;
};

type Props = {
  initialRows: KpiInitialRow[];
};

export function KpiEditor({ initialRows }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<KpiUpdateInput>({
    resolver: zodResolver(kpiUpdateInputSchema),
    defaultValues: {
      rows: initialRows.map((r) => ({
        slug: r.slug,
        label: r.label,
        value: r.value,
        displayValue: r.displayValue,
        unit: r.unit,
      })),
    },
  });

  const onSubmit = (values: KpiUpdateInput) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateKpisAction(values);
      if (!result.success) {
        const msg =
          typeof result.error === "string"
            ? result.error
            : "입력값을 확인해주세요.";
        setError(msg);
        return;
      }
      setSuccess(
        `${result.data.updatedCount}개 KPI 가 저장되었습니다. 사용자 사이트 메인에 즉시 반영됩니다.`,
      );
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="rounded-lg border border-brand-primary/30 bg-brand-primary/5 px-4 py-3 text-sm text-brand-primary"
        >
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {initialRows.map((row, idx) => (
          <Card key={row.slug} className="min-w-0">
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-ink-date">
                {row.slug}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`label-${idx}`}>라벨</Label>
                <Input
                  id={`label-${idx}`}
                  disabled={isPending}
                  {...form.register(`rows.${idx}.label` as const)}
                />
                {form.formState.errors.rows?.[idx]?.label && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.rows[idx]?.label?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`display-${idx}`}>표시 값 (메인 노출)</Label>
                <Input
                  id={`display-${idx}`}
                  placeholder="예: 45,217명+"
                  disabled={isPending}
                  className="text-base font-semibold"
                  {...form.register(`rows.${idx}.displayValue` as const)}
                />
                {form.formState.errors.rows?.[idx]?.displayValue && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.rows[idx]?.displayValue?.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`value-${idx}`}>
                    숫자 값 <span className="text-ink-date">(차트용)</span>
                  </Label>
                  <Controller
                    control={form.control}
                    name={`rows.${idx}.value` as const}
                    render={({ field }) => (
                      <Input
                        id={`value-${idx}`}
                        type="number"
                        min={0}
                        max={99_999_999}
                        disabled={isPending}
                        placeholder="비어둘 수 있음"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v === "" ? null : Number(v));
                        }}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${idx}`}>
                    단위 <span className="text-ink-date">(선택)</span>
                  </Label>
                  <Controller
                    control={form.control}
                    name={`rows.${idx}.unit` as const}
                    render={({ field }) => (
                      <Input
                        id={`unit-${idx}`}
                        placeholder="예: 명"
                        disabled={isPending}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v === "" ? null : v);
                        }}
                      />
                    )}
                  />
                </div>
              </div>
              <input
                type="hidden"
                {...form.register(`rows.${idx}.slug` as const)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:-mx-10 lg:px-10">
        <p className="mr-auto text-xs text-ink-date">
          저장 시 사용자 사이트 메인에 즉시 반영됩니다.
        </p>
        <Button
          type="submit"
          disabled={isPending}
          className="active:scale-[0.98]"
        >
          {isPending ? "저장 중..." : "저장 + 발행"}
        </Button>
      </div>
    </form>
  );
}
