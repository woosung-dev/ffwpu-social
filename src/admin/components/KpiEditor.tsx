// KPI 입력 폼 — 4 row 카드 그리드 (label·displayValue·value·unit). RHF + Zod + transition. 발행 직후 사용자 사이트 메인 / 자동 반영
"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  fetchSheetKpiValuesAction,
  updateKpisAction,
} from "@/features/kpi/actions";
import { kpiFriendlyLabel } from "@/features/kpi/constants";
import { formatKpiDisplay } from "@/features/kpi/format";
import {
  kpiUpdateInputSchema,
  type KpiUpdateInput,
} from "@/features/kpi/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpTip } from "@/admin/components/HelpTip";
import { ADMIN_COPY } from "@/admin/copy";

const KPI = ADMIN_COPY.kpi;

export type KpiInitialRow = {
  slug: string;
  label: string;
  sublabel: string | null;
  value: number | null;
  displayValue: string;
  unit: string | null;
  sortOrder: number;
  // 값 출처 — 'google_sheets' 면 시트 자동 반영 대상. 운영자가 여기서 저장하면 'manual' 로 전환돼 동기화 제외.
  syncSource: "manual" | "google_sheets" | null;
};

type Props = {
  initialRows: KpiInitialRow[];
  // 마지막 자동 동기화 시각(ISO) — 없으면 미동기화
  lastSyncedAt: string | null;
};

function formatSynced(iso: string | null): string {
  if (!iso) return "아직 자동 동기화된 적 없음";
  return `마지막 자동 동기화 ${new Date(iso).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  })}`;
}

export function KpiEditor({ initialRows, lastSyncedAt }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isFetching, startFetch] = useTransition();

  // slug → 폼 row 인덱스 (시트 불러오기 시 해당 칸에 채우기)
  const slugToIndex = new Map(initialRows.map((r, i) => [r.slug, i]));

  const onLoadFromSheet = () => {
    startFetch(async () => {
      const result = await fetchSheetKpiValuesAction();
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
        // 숫자만 채움 — 단위·화면표기는 운영자 설정 유지(화면 표시는 숫자+단위로 자동)
        form.setValue(`rows.${idx}.value`, m.value, { shouldDirty: true });
        filled++;
      }
      toast.success(
        `시트에서 ${filled}개 숫자를 불러왔습니다. 확인 후 '저장 + 발행'을 눌러주세요.`,
      );
    });
  };

  const form = useForm<KpiUpdateInput>({
    resolver: zodResolver(kpiUpdateInputSchema),
    defaultValues: {
      rows: initialRows.map((r) => ({
        slug: r.slug,
        label: r.label,
        sublabel: r.sublabel,
        value: r.value,
        displayValue: r.displayValue,
        unit: r.unit,
      })),
    },
  });

  const onSubmit = (values: KpiUpdateInput) => {
    setError(null);
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
      toast.success(
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

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-strong">
            협회 시트에서 값 불러오기
          </p>
          <p className="text-xs text-ink-date">
            {formatSynced(lastSyncedAt)} · 매주 월요일 자동 갱신
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {initialRows.map((row, idx) => {
          // 화면 표시 미리보기 — 숫자 우선(숫자+단위 자동, 없으면 표시값)
          const wValue = form.watch(`rows.${idx}.value`);
          const wUnit = form.watch(`rows.${idx}.unit`);
          const wDisplay = form.watch(`rows.${idx}.displayValue`);
          const preview = formatKpiDisplay(wValue ?? null, wUnit ?? null, wDisplay ?? "");
          return (
          <Card key={row.slug} className="min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-ink-strong">
                {kpiFriendlyLabel(row.slug)}
                {row.syncSource === "google_sheets" && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    시트 자동
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor={`label-${idx}`}>
                    {KPI.labelLabel}{" "}
                    <span className="text-destructive" aria-hidden>*</span>
                  </Label>
                  <HelpTip>{KPI.labelHelp}</HelpTip>
                </div>
                <Input
                  id={`label-${idx}`}
                  required
                  aria-required
                  aria-invalid={!!form.formState.errors.rows?.[idx]?.label}
                  aria-describedby={
                    form.formState.errors.rows?.[idx]?.label
                      ? `label-${idx}-error`
                      : undefined
                  }
                  disabled={isPending}
                  {...form.register(`rows.${idx}.label` as const)}
                />
                {form.formState.errors.rows?.[idx]?.label && (
                  <p id={`label-${idx}-error`} className="text-xs text-destructive">
                    {form.formState.errors.rows[idx]?.label?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor={`sublabel-${idx}`}>{KPI.sublabelLabel}</Label>
                  <HelpTip>{KPI.sublabelHelp}</HelpTip>
                </div>
                <Controller
                  control={form.control}
                  name={`rows.${idx}.sublabel` as const}
                  render={({ field }) => (
                    <Input
                      id={`sublabel-${idx}`}
                      placeholder="예: 지원가정"
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

              {/* 숫자 + 단위 — 화면 표시를 만드는 주 입력(숫자 우선). 동기화는 숫자만 갱신. */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={`value-${idx}`}>{KPI.valueLabel}</Label>
                    <HelpTip>{KPI.valueHelp}</HelpTip>
                  </div>
                  <Controller
                    control={form.control}
                    name={`rows.${idx}.value` as const}
                    render={({ field }) => (
                      <Input
                        id={`value-${idx}`}
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min={0}
                        max={99_999_999}
                        disabled={isPending}
                        placeholder="예: 4973"
                        className="text-base font-semibold"
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
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={`unit-${idx}`}>
                      단위 <span className="text-ink-date">(선택)</span>
                    </Label>
                    <HelpTip>{KPI.unitHelp}</HelpTip>
                  </div>
                  <Controller
                    control={form.control}
                    name={`rows.${idx}.unit` as const}
                    render={({ field }) => (
                      <Input
                        id={`unit-${idx}`}
                        placeholder="예: 명+"
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

              {/* 화면 표시 미리보기 — 저장 시 방문자에게 이렇게 보임 */}
              <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span className="text-ink-date">화면 표시: </span>
                <span className="font-semibold text-ink-strong tabular-nums">
                  {preview}
                </span>
              </div>

              {/* 표시 직접 입력(선택) — 비우면 위 미리보기대로. 숫자로 표현 못하는 특수 표기만. */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor={`display-${idx}`}>
                    {KPI.displayValueLabel}
                  </Label>
                  <HelpTip>{KPI.displayValueHelp}</HelpTip>
                </div>
                <Input
                  id={`display-${idx}`}
                  placeholder="비우면 자동 (특수 표기 예: 38년 5개월)"
                  aria-invalid={!!form.formState.errors.rows?.[idx]?.displayValue}
                  aria-describedby={
                    form.formState.errors.rows?.[idx]?.displayValue
                      ? `display-${idx}-error`
                      : undefined
                  }
                  disabled={isPending}
                  {...form.register(`rows.${idx}.displayValue` as const)}
                />
                {form.formState.errors.rows?.[idx]?.displayValue && (
                  <p
                    id={`display-${idx}-error`}
                    className="text-xs text-destructive"
                  >
                    {form.formState.errors.rows[idx]?.displayValue?.message}
                  </p>
                )}
              </div>
              <input
                type="hidden"
                {...form.register(`rows.${idx}.slug` as const)}
              />
            </CardContent>
          </Card>
          );
        })}
      </div>

      <div className="relative -mx-4 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:sticky lg:bottom-0 lg:-mx-10 lg:px-10 lg:py-3">
        <p className="mr-auto text-xs text-ink-date">
          저장 시 사용자 사이트 메인에 즉시 반영됩니다.
        </p>
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : "저장 + 발행"}
        </Button>
      </div>
    </form>
  );
}
