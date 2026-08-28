// 쌀나눔 통계 입력 — StorySection 3 통계. 숫자 우선 모델(impact KPI 와 동일): 숫자+단위로 자동 표시하고,
// 특수 표기가 필요할 때만 '화면에 보이는 값' 을 직접 쓴다. 숫자는 쌀나눔 시트에서 불러올 수 있다. updateStoryStatsAction (slug 키)
"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  fetchSheetKpiValuesAction,
  updateStoryStatsAction,
} from "@/features/kpi/actions";
import { formatKpiDisplay } from "@/features/kpi/format";
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

// 라벨 필수(빈 행 방지). 숫자는 빈칸 허용 — 비우면 '화면에 보이는 값' 이 쓰인다.
const storyStatsFormSchema = z.object({
  rows: z.array(
    z.object({
      label: z.string().min(1, "제목을 입력해주세요").max(50),
      value: z.number().min(0).max(99_999_999).nullable(),
      unit: z.string().max(10),
      displayValue: z.string().max(60),
    }),
  ),
});

type FormValues = z.infer<typeof storyStatsFormSchema>;

export function StoryStatsEditor({ initialStats }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isFetching, startFetch] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(storyStatsFormSchema),
    defaultValues: {
      rows: initialStats.map((s) => ({
        label: s.label,
        value: s.value,
        unit: s.unit ?? "",
        displayValue: s.displayValue,
      })),
    },
  });

  // slug → 폼 row 인덱스 (시트 불러오기 시 해당 칸에 채우기)
  const slugToIndex = new Map(initialStats.map((r, i) => [r.slug, i]));

  const onLoadFromSheet = () => {
    startFetch(async () => {
      const result = await fetchSheetKpiValuesAction("story");
      if (!result.success) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "시트를 불러오지 못했습니다.",
        );
        return;
      }
      let filled = 0;
      for (const m of result.data.metrics) {
        const idx = slugToIndex.get(m.slug);
        if (idx === undefined) continue;
        // 숫자만 채움 — 단위·화면 표기는 운영자 설정 유지
        form.setValue(`rows.${idx}.value`, m.value, { shouldDirty: true });
        filled++;
      }
      toast.success(
        `시트에서 ${filled}개 숫자를 불러왔습니다. 확인 후 '통계 저장'을 눌러주세요.`,
      );
    });
  };

  const onSubmit = (values: FormValues) => {
    setError(null);
    startTransition(async () => {
      const rows = initialStats.map((stat, idx) => {
        const row = values.rows[idx];
        return {
          slug: stat.slug,
          label: row?.label ?? stat.label,
          value: row?.value ?? null,
          unit: row?.unit?.trim() ? row.unit.trim() : null,
          displayValue: row?.displayValue ?? "",
        };
      });
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

  const watched = form.watch("rows");

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-xl">
          {LAND.statsTitle}
          <HelpTip>{LAND.statsHelp}</HelpTip>
        </CardTitle>
        <p className="text-sm text-ink-subtle">
          메인 페이지 &ldquo;밥이 사랑이다&rdquo; 영역의 통계입니다. 숫자와 단위를 넣으면
          <strong className="font-semibold"> 3,210kg</strong> 처럼 자동으로 표시됩니다.
          숫자를 비우면 아래 &lsquo;직접 쓰는 표기&rsquo; 가 쓰이고, 둘 다 비우면 메인에
          노출되지 않습니다.
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

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-strong">
                쌀 나눔 시트에서 숫자 불러오기
              </p>
              <p className="text-xs text-ink-date">
                매주 월요일 자동 갱신 · 단위와 제목은 그대로 둡니다
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLoadFromSheet}
              disabled={isFetching || isPending}
            >
              {isFetching ? "불러오는 중..." : "시트에서 불러오기"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {initialStats.map((stat, idx) => {
              const w = watched?.[idx];
              const preview = formatKpiDisplay(
                w?.value ?? null,
                w?.unit ?? null,
                w?.displayValue ?? "",
                "",
              );
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
                  <div className="flex gap-2">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Label htmlFor={`story-value-${idx}`}>숫자</Label>
                      <Controller
                        control={form.control}
                        name={`rows.${idx}.value` as const}
                        render={({ field }) => (
                          <Input
                            id={`story-value-${idx}`}
                            inputMode="decimal"
                            placeholder="예: 3210"
                            disabled={isPending}
                            className="font-semibold"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/,/g, "").trim();
                              field.onChange(raw === "" ? null : Number(raw));
                            }}
                          />
                        )}
                      />
                    </div>
                    <div className="w-24 shrink-0 space-y-1.5">
                      <Label htmlFor={`story-unit-${idx}`}>단위</Label>
                      <Input
                        id={`story-unit-${idx}`}
                        placeholder="kg"
                        disabled={isPending}
                        {...form.register(`rows.${idx}.unit` as const)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`story-display-${idx}`}>
                      직접 쓰는 표기 (선택)
                    </Label>
                    <Controller
                      control={form.control}
                      name={`rows.${idx}.displayValue` as const}
                      render={({ field }) => (
                        <Input
                          id={`story-display-${idx}`}
                          placeholder="숫자를 비웠을 때만 사용"
                          disabled={isPending}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </div>
                  <p className="text-xs text-ink-subtle">
                    {preview === ""
                      ? "메인에서 숨김 (숫자·표기 모두 없음)"
                      : `메인 노출: ${preview}`}
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
